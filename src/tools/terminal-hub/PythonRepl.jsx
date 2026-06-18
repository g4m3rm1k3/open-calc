import { useState, useEffect, useRef } from 'react'

// Separate Pyodide instance for the terminal (isolated from lesson notebooks)
let _boot = null

const SETUP_PY = `
import sys, io, traceback
_repl_ns = {}

def _run(code):
    old_out, old_err = sys.stdout, sys.stderr
    buf = io.StringIO()
    sys.stdout = sys.stderr = buf
    result_repr = ''
    err = ''
    try:
        try:
            val = eval(compile(code, '<repl>', 'eval'), _repl_ns)
            if val is not None:
                result_repr = repr(val)
        except SyntaxError:
            exec(compile(code, '<repl>', 'exec'), _repl_ns)
    except BaseException:
        err = traceback.format_exc()
    finally:
        sys.stdout, sys.stderr = old_out, old_err
    return [buf.getvalue(), result_repr, err]
`

async function getPy() {
  if (_boot) return _boot
  _boot = (async () => {
    if (!window.loadPyodide) {
      await new Promise((res, rej) => {
        const existing = document.querySelector('script[src*="pyodide.js"]')
        if (existing) {
          const t = setInterval(() => { if (window.loadPyodide) { clearInterval(t); res() } }, 50)
          return
        }
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
        s.onload = res; s.onerror = rej
        document.head.appendChild(s)
      })
    }
    const py = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      fullStdLib: false,
    })
    await py.runPythonAsync(SETUP_PY)
    return py
  })()
  return _boot
}

const WELCOME = [
  { type: 'info', text: 'Pyodide — loading Python environment…' },
]

export default function PythonRepl() {
  const [lines, setLines] = useState(WELCOME)
  const [input, setInput] = useState('')
  const [pending, setPending] = useState([]) // multi-line buffer
  const [ready, setReady] = useState(false)
  const [running, setRunning] = useState(false)
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const pyRef = useRef(null)

  useEffect(() => {
    getPy().then(py => {
      pyRef.current = py
      setReady(true)
      setLines(prev => [
        ...prev.filter(l => l.type !== 'info'),
        { type: 'info', text: `Python (Pyodide) — ready\nType expressions or statements at the prompt.` },
      ])
    }).catch(e => {
      setLines(prev => [...prev, { type: 'error', text: `Failed to load Python: ${e.message}` }])
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const prompt = pending.length > 0 ? '... ' : '>>> '

  const run = async () => {
    if (!ready || running) return
    const cmd = input
    setInput('')

    if (cmd.trim() === '' && pending.length === 0) return

    // Track history
    if (cmd.trim()) {
      setHistory(h => [cmd, ...h])
      setHistIdx(-1)
    }

    setLines(prev => [...prev, { type: 'input', text: prompt + cmd }])

    // Multi-line: if line ends with ':' or we already have pending lines, buffer it
    const newPending = [...pending, cmd]
    const fullCode = newPending.join('\n')

    // Detect if we need more input (compound statement not closed)
    const needsMore = cmd.trimEnd().endsWith(':') || (pending.length > 0 && cmd.trim() !== '')
    if (needsMore && cmd.trim() !== '') {
      setPending(newPending)
      return
    }

    // Execute
    setPending([])
    const codeToRun = fullCode.trim()
    if (!codeToRun) return

    setRunning(true)
    try {
      const py = pyRef.current
      py.globals.set('_code', codeToRun)
      const result = await py.runPythonAsync('_run(_code)')
      const [out, repr, err] = result.toJs()
      const newLines = []
      if (out) {
        out.trimEnd().split('\n').forEach(l => newLines.push({ type: 'stdout', text: l }))
      }
      if (repr) newLines.push({ type: 'result', text: repr })
      if (err) {
        // Only show the last part of the traceback (skip pyodide internals)
        const lines = err.split('\n').filter(Boolean)
        const start = lines.findLastIndex(l => l.startsWith('  File "<repl>')) ?? 0
        lines.slice(Math.max(0, start)).forEach(l => newLines.push({ type: 'error', text: l }))
      }
      if (newLines.length) setLines(prev => [...prev, ...newLines])
    } catch (e) {
      setLines(prev => [...prev, { type: 'error', text: String(e) }])
    } finally {
      setRunning(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') { run(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const idx = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(idx)
      if (history[idx] !== undefined) setInput(history[idx])
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const idx = Math.max(histIdx - 1, -1)
      setHistIdx(idx)
      setInput(idx === -1 ? '' : (history[idx] ?? ''))
    }
  }

  return (
    <div
      className="h-full flex flex-col font-mono text-[13px] select-text"
      style={{ background: '#0c0c0c', color: '#cccccc' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex-1 overflow-auto p-3 space-y-0.5 leading-5">
        {lines.map((l, i) => (
          <div key={i} style={{ color: lineColor(l.type), whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {l.type === 'input' && <span style={{ color: '#569cd6' }}>{l.text.slice(0, 4)}</span>}
            {l.type === 'input' ? l.text.slice(4) : l.text}
          </div>
        ))}
        {running && <div style={{ color: '#555' }}>…</div>}
        <div ref={bottomRef} />
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderTop: '1px solid #1e1e1e', opacity: ready ? 1 : 0.4 }}
      >
        <span style={{ color: '#569cd6', flexShrink: 0, minWidth: 32 }}>{prompt}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={!ready || running}
          spellCheck={false}
          autoFocus
          className="flex-1 outline-none bg-transparent"
          style={{ color: '#ffffff', caretColor: '#fff' }}
          placeholder={ready ? '' : 'Loading…'}
        />
      </div>
    </div>
  )
}

function lineColor(type) {
  switch (type) {
    case 'input':  return '#cccccc'
    case 'result': return '#4ec9b0'
    case 'stdout': return '#9cdcfe'
    case 'error':  return '#f48771'
    case 'info':   return '#6a9955'
    default:       return '#cccccc'
  }
}
