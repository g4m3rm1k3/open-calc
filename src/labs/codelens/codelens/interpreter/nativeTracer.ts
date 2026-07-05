/**
 * nativeTracer.ts
 * Connects to the CodeLens WebSocket bridge on the existing backend
 * (http://127.0.0.1:4318) and streams execution events for native languages.
 *
 * Returns { events, output, error } in the same shape as runPython / runInterpreter.
 */
import type { ExecutionResult, TraceEvent, RuntimeError } from '../types'

const BACKEND_WS = (() => {
  // In dev, Vite runs on :5173 and the backend on :4318.
  // In production (backend serves the built app), both share :4318.
  const backendPort = import.meta.env?.VITE_BACKEND_PORT ?? '4318'
  return `ws://127.0.0.1:${backendPort}/api/codelens`
})()

/** Run code via the native debug bridge. `onEvent` is called for each CodeLens event as it arrives. */
export function runNative(
  source: string,
  lang: 'go' | 'cpp' | 'rust',
  onEvent?: (event: TraceEvent) => void,
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let ws: WebSocket
    const events: TraceEvent[] = []
    const output: string[] = []
    let settled = false

    function finish(error: RuntimeError | null = null) {
      if (settled) return
      settled = true
      try { ws?.close() } catch {}
      resolve({ events, output, error })
    }

    try {
      ws = new WebSocket(BACKEND_WS)
    } catch (e) {
      resolve({
        events: [],
        output: [],
        error: { type: 'ConnectionError', message: `Cannot create WebSocket: ${(e as Error).message}` },
      })
      return
    }

    const openTimeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close()
        resolve({
          events: [],
          output: [],
          error: {
            type: 'BackendUnavailable',
            message: 'Could not connect to the CodeLens backend. Run: npm run backend',
          },
        })
        settled = true
      }
    }, 3000)

    ws.addEventListener('open', () => {
      clearTimeout(openTimeout)
      ws.send(JSON.stringify({ lang, code: source }))
    })

    ws.addEventListener('message', (evt) => {
      let msg: any
      try { msg = JSON.parse(evt.data) } catch { return }

      switch (msg.type) {
        case 'event': {
          events.push(msg.payload)
          onEvent?.(msg.payload)
          break
        }
        case 'output_line': {
          output.push(msg.text)
          break
        }
        case 'done': {
          // Server sends a final 'done' with the full event/output arrays
          // (in case some were missed). Merge any that weren't streamed live.
          finish(null)
          break
        }
        case 'error': {
          finish({ type: 'RuntimeError', message: msg.message })
          break
        }
        case 'log':
          // debug/verbose messages from the backend — ignore in prod
          break
        default:
          break
      }
    })

    ws.addEventListener('error', () => {
      clearTimeout(openTimeout)
      if (!settled) {
        resolve({
          events: [],
          output: [],
          error: {
            type: 'BackendUnavailable',
            message: 'CodeLens backend is not running. Start it with: npm run backend',
          },
        })
        settled = true
      }
    })

    ws.addEventListener('close', () => {
      clearTimeout(openTimeout)
      finish(null)
    })
  })
}

/**
 * Check if the backend is reachable and which tools are installed.
 * Returns null if the backend is down.
 */
export async function checkBackendTools(): Promise<unknown | null> {
  try {
    const res = await fetch('http://127.0.0.1:4318/api/codelens/tools', { signal: AbortSignal.timeout(2000) })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
