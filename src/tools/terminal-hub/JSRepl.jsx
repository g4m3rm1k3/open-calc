import { useState, useEffect, useRef } from 'react'

const WELCOME = [{ type: 'info', text: 'JavaScript Console  —  type any expression and press Enter' }]

export default function JSRepl() {
  const [lines, setLines] = useState(WELCOME)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  const run = () => {
    const cmd = input.trim()
    if (!cmd) return
    setHistory(h => [cmd, ...h])
    setHistIdx(-1)
    setInput('')

    const newLines = [{ type: 'input', text: cmd }]
    const logs = []
    const origLog = console.log
    const origWarn = console.warn
    const origError = console.error
    console.log = (...a) => logs.push({ type: 'log', text: a.map(serialize).join(' ') })
    console.warn = (...a) => logs.push({ type: 'warn', text: a.map(serialize).join(' ') })
    console.error = (...a) => logs.push({ type: 'error', text: a.map(serialize).join(' ') })

    try {
      // eslint-disable-next-line no-eval
      const result = eval(cmd)
      console.log = origLog; console.warn = origWarn; console.error = origError
      newLines.push(...logs)
      if (result !== undefined) newLines.push({ type: 'output', text: serialize(result) })
    } catch (e) {
      console.log = origLog; console.warn = origWarn; console.error = origError
      newLines.push(...logs)
      newLines.push({ type: 'error', text: e.message })
    }

    setLines(prev => [...prev, ...newLines])
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
          <div key={i} style={{ color: lineColor(l.type) }}>
            {l.type === 'input'  && <span style={{ color: '#569cd6', marginRight: 6 }}>{'>'}</span>}
            {l.type === 'error'  && <span style={{ marginRight: 6 }}>✖</span>}
            {l.type === 'warn'   && <span style={{ marginRight: 6 }}>⚠</span>}
            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{l.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderTop: '1px solid #2a2a2a' }}
      >
        <span style={{ color: '#569cd6', flexShrink: 0 }}>{'>'}</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          spellCheck={false}
          className="flex-1 outline-none bg-transparent"
          style={{ color: '#ffffff', caretColor: '#fff' }}
          placeholder="Expression…"
        />
        {input && (
          <button
            onClick={run}
            className="text-[11px] px-2 py-0.5 rounded"
            style={{ background: '#2d2d2d', color: '#888' }}
          >
            ↵
          </button>
        )}
      </div>
    </div>
  )
}

function serialize(v) {
  if (v === null) return 'null'
  if (v === undefined) return 'undefined'
  if (typeof v === 'string') return v
  if (typeof v === 'function') return v.toString().slice(0, 120)
  try { return JSON.stringify(v, null, 2) } catch { return String(v) }
}

function lineColor(type) {
  switch (type) {
    case 'input':  return '#ffffff'
    case 'output': return '#4ec9b0'
    case 'error':  return '#f48771'
    case 'warn':   return '#cca700'
    case 'log':    return '#9cdcfe'
    default:       return '#6a9955'
  }
}
