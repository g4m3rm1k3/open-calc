/**
 * DAPBridge.mjs
 * Manages a single CodeLens debug session over the Debug Adapter Protocol (DAP).
 * Works with any adapter (Go/dlv, C++/gdb, Rust/rust-gdb) that communicates DAP
 * over stdio. Translates DAP events into the CodeLens event-stream format and
 * sends them as JSON lines over a WebSocket.
 */
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { randomBytes } from 'node:crypto'

// ── DAP message framing ───────────────────────────────────────────────────────

/**
 * Parse one complete DAP message from a raw buffer.
 * Returns { message, remaining } or { message: null, remaining: buf } if incomplete.
 */
function parseDAPMessage(buf) {
  const headerEnd = buf.indexOf('\r\n\r\n')
  if (headerEnd === -1) return { message: null, remaining: buf }
  const header = buf.slice(0, headerEnd).toString('utf8')
  const lenMatch = /Content-Length:\s*(\d+)/i.exec(header)
  if (!lenMatch) return { message: null, remaining: buf }
  const contentLen = parseInt(lenMatch[1], 10)
  const bodyStart = headerEnd + 4
  if (buf.length < bodyStart + contentLen) return { message: null, remaining: buf }
  const body = buf.slice(bodyStart, bodyStart + contentLen).toString('utf8')
  const remaining = buf.slice(bodyStart + contentLen)
  try {
    return { message: JSON.parse(body), remaining }
  } catch {
    return { message: null, remaining }
  }
}

function encodeDAPMessage(obj) {
  const body = JSON.stringify(obj)
  return `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`
}

// ── CodeLens event builder ────────────────────────────────────────────────────

function makeStackSnapshot(frames) {
  return (frames ?? []).map(f => ({
    name: f.name || '(anonymous)',
    line: f.line ?? 0,
    locals: Object.fromEntries(
      (f.variables ?? []).map(v => [v.name, v.value])
    ),
  }))
}

function makeCLEvent(type, line, frames, extra = {}) {
  return {
    type,
    line,
    sourceLocation: line != null ? { line } : null,
    stackSnapshot: makeStackSnapshot(frames),
    ...extra,
  }
}

// ── Session ───────────────────────────────────────────────────────────────────

export class DAPSession {
  constructor({ ws, adapter, lang }) {
    this.ws = ws
    this.adapter = adapter // { command: string, args: string[], setup: fn }
    this.lang = lang
    this.seq = 1
    this.pendingRequests = new Map() // seq → { resolve, reject }
    this.child = null
    this.readBuf = Buffer.alloc(0)
    this.tmpDir = null
    this.events = []
    this.outputLines = []
    this.done = false
    this.frameVariableCache = new Map()
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async run(code) {
    // 1. Write code to temp dir
    const id = randomBytes(6).toString('hex')
    this.tmpDir = path.join(os.tmpdir(), `cl_${id}`)
    await fs.mkdir(this.tmpDir, { recursive: true })

    const { filePath, command, args } = await this.adapter.setup(this.tmpDir, code)
    this._lineCount = code.split('\n').length
    this._sourceFile = filePath

    // 2. Spawn the DAP child
    this.child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: this.tmpDir,
    })

    this.child.stdout.on('data', chunk => this._onData(chunk))
    this.child.stderr.on('data', d => {
      const text = d.toString().trim()
      if (text) this._sendWS({ type: 'log', text })
    })
    this.child.on('exit', () => this._finish())
    this.child.on('error', err => {
      this._sendWS({ type: 'error', message: `Failed to spawn ${command}: ${err.message}` })
      this._finish()
    })

    // 3. DAP handshake
    try {
      await this._initialize()
      await this._launch()
      await this._setBreakpoints()
      await this._sendRequest('configurationDone', {})

      // 4. Step loop
      await this._stepLoop()
    } catch (err) {
      this._sendWS({ type: 'error', message: String(err.message ?? err) })
    } finally {
      this._finish()
    }
  }

  cancel() {
    this.done = true
    try { this.child?.kill() } catch {}
    this._cleanup()
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  _onData(chunk) {
    this.readBuf = Buffer.concat([this.readBuf, chunk])
    while (true) {
      const { message, remaining } = parseDAPMessage(this.readBuf)
      this.readBuf = remaining
      if (!message) break
      this._onMessage(message)
    }
  }

  _onMessage(msg) {
    if (msg.type === 'response') {
      const pending = this.pendingRequests.get(msg.request_seq)
      if (pending) {
        this.pendingRequests.delete(msg.request_seq)
        if (msg.success) pending.resolve(msg.body ?? {})
        else pending.reject(new Error(msg.message || JSON.stringify(msg.body)))
      }
    } else if (msg.type === 'event') {
      this._onEvent(msg)
    }
  }

  _onEvent(msg) {
    if (msg.event === 'output') {
      const text = (msg.body?.output ?? '').replace(/\n$/, '')
      if (text) {
        this.outputLines.push(text)
        this._sendWS({ type: 'output_line', text })
      }
    } else if (msg.event === 'stopped') {
      // Resolve the outstanding 'continue'/'next' promise so the step loop
      // can proceed. We signal via a special key.
      const pending = this.pendingRequests.get('__stopped__')
      if (pending) {
        this.pendingRequests.delete('__stopped__')
        pending.resolve(msg.body)
      }
    } else if (msg.event === 'terminated' || msg.event === 'exited') {
      this.done = true
      const pending = this.pendingRequests.get('__stopped__')
      if (pending) {
        this.pendingRequests.delete('__stopped__')
        pending.resolve(null) // null = terminated
      }
    }
  }

  _sendRaw(text) {
    try { this.child?.stdin?.write(text) } catch {}
  }

  _sendRequest(command, args) {
    const seq = this.seq++
    const msg = { seq, type: 'request', command, arguments: args }
    this._sendRaw(encodeDAPMessage(msg))
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(seq, { resolve, reject })
      setTimeout(() => {
        if (this.pendingRequests.has(seq)) {
          this.pendingRequests.delete(seq)
          reject(new Error(`DAP request '${command}' timed out`))
        }
      }, 15000)
    })
  }

  _waitForStop() {
    return new Promise((resolve, reject) => {
      this.pendingRequests.set('__stopped__', { resolve, reject })
      setTimeout(() => {
        if (this.pendingRequests.has('__stopped__')) {
          this.pendingRequests.delete('__stopped__')
          resolve(null) // treat as terminated
        }
      }, 30000)
    })
  }

  async _initialize() {
    await this._sendRequest('initialize', {
      adapterID: `opencalc-${this.lang}`,
      linesStartAt1: true,
      columnsStartAt1: true,
      pathFormat: 'path',
      supportsVariableType: true,
      supportsRunInTerminalRequest: false,
    })
  }

  async _launch() {
    const launchArgs = this.adapter.buildLaunchArgs(this.tmpDir, this._sourceFile)
    await this._sendRequest('launch', launchArgs)
  }

  async _setBreakpoints() {
    const breakpoints = Array.from({ length: this._lineCount }, (_, i) => ({ line: i + 1 }))
    await this._sendRequest('setBreakpoints', {
      source: { path: this._sourceFile },
      breakpoints,
    })
  }

  async _stepLoop() {
    const threadId = 1 // DAP threads — Go/dlv uses 1 for the main goroutine
    let stepCount = 0
    const MAX_STEPS = 2000

    while (!this.done && stepCount < MAX_STEPS) {
      // Wait for the program to stop (breakpoint or step)
      const stopBody = await this._waitForStop()
      if (!stopBody || this.done) break

      // Get stack trace
      let frames = []
      try {
        const stResp = await this._sendRequest('stackTrace', { threadId, startFrame: 0, levels: 20 })
        const rawFrames = stResp.stackFrames ?? []

        // For each frame, fetch variables
        for (const rf of rawFrames.slice(0, 8)) {
          const line = rf.line
          const name = rf.name || '(anon)'
          let variables = []

          try {
            const scopesResp = await this._sendRequest('scopes', { frameId: rf.id })
            const scopes = scopesResp.scopes ?? []
            for (const scope of scopes.slice(0, 2)) {
              if (scope.variablesReference > 0) {
                const varResp = await this._sendRequest('variables', {
                  variablesReference: scope.variablesReference,
                  filter: 'named',
                  count: 50,
                })
                variables.push(...(varResp.variables ?? []).slice(0, 30))
              }
            }
          } catch { /* ignore scope errors */ }

          frames.push({ name, line, variables })
        }
      } catch { /* ignore stack trace errors */ }

      // Determine event type from stop reason
      const reason = stopBody.reason ?? 'breakpoint'
      const topFrame = frames[0]
      const topLine = topFrame?.line ?? null

      let eventType = 'statement_enter'
      if (reason === 'function breakpoint' || reason === 'entry') eventType = 'function_call'
      else if (reason === 'exception' || reason === 'panic') eventType = 'error_thrown'

      const clEvent = makeCLEvent(eventType, topLine, frames, {
        functionName: topFrame?.name,
      })

      this.events.push(clEvent)
      this._sendWS({ type: 'event', payload: clEvent })
      stepCount++

      if (this.done) break

      // Step to next line
      try {
        await this._sendRequest('next', { threadId })
      } catch {
        // If 'next' fails the program may have exited
        break
      }
    }
  }

  _sendWS(obj) {
    if (!this.ws || this.ws.readyState !== 1 /* OPEN */) return
    try { this.ws.send(JSON.stringify(obj)) } catch {}
  }

  _finish() {
    if (this._finished) return
    this._finished = true
    this._sendWS({
      type: 'done',
      events: this.events,
      output: this.outputLines,
    })
    this._cleanup()
  }

  async _cleanup() {
    try { this.child?.kill() } catch {}
    if (this.tmpDir) {
      fs.rm(this.tmpDir, { recursive: true, force: true }).catch(() => {})
      this.tmpDir = null
    }
  }
}
