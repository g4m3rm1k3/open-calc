import { useState, useRef, useEffect } from 'react'
import { executeScript } from '../../engines/openmat/openmatEngine.js'

const WELCOME = [{ type: 'info', text: 'OpenMAT  —  MATLAB-compatible terminal\nType expressions or statements at the >> prompt.' }]

export default function MatlabRepl() {
  const [lines, setLines] = useState(WELCOME)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const [workspace, setWorkspace] = useState([])
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
    setLines(prev => [...prev, { type: 'input', text: cmd }])

    try {
      const result = executeScript(cmd, {
        initialWorkspace: workspace,
      })
      const newLines = []

      if (result.output?.trim()) {
        result.output.trimEnd().split('\n').forEach(l => newLines.push({ type: 'output', text: l }))
      }
      if (result.error) {
        newLines.push({ type: 'error', text: result.error.message ?? String(result.error) })
      }
      if (result.figureJson) {
        newLines.push({ type: 'info', text: '[Figure generated — open OpenMAT Studio to view plots]' })
      }

      if (newLines.length) setLines(prev => [...prev, ...newLines])
      if (result.workspace?.length) setWorkspace(result.workspace)
    } catch (e) {
      setLines(prev => [...prev, { type: 'error', text: e.message ?? String(e) }])
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
            {l.type === 'input' && <span style={{ color: '#e8a020', marginRight: 6 }}>{'>>'}</span>}
            {l.type === 'error' && <span style={{ marginRight: 6 }}>✖</span>}
            {l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '1px solid #1e1e1e' }}>
        <span style={{ color: '#e8a020', flexShrink: 0 }}>{'>>'}</span>
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
      </div>
    </div>
  )
}

function lineColor(type) {
  switch (type) {
    case 'input':  return '#cccccc'
    case 'output': return '#4ec9b0'
    case 'error':  return '#f48771'
    case 'info':   return '#6a9955'
    default:       return '#cccccc'
  }
}
