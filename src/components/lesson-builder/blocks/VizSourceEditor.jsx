import { useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import VizFrame from '../../viz/VizFrame.jsx'

const API = '/api/dev-fs'
const MOPTS = { fontSize: 13, minimap: { enabled: false }, wordWrap: 'on', scrollBeyondLastLine: false, automaticLayout: true }

function toPascalCase(vizId) {
  const words = String(vizId || '').replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
  const name = words.map(w => w[0].toUpperCase() + w.slice(1)).join('') || 'Viz'
  return /^[A-Za-z_$]/.test(name) ? name : `Viz${name}`
}

function starterTemplate(vizId) {
  const name = toPascalCase(vizId)
  return `// ${name} — a visualization component, rendered via VizFrame with
// { params, onParamChange } props (the same convention every viz in this
// codebase uses). Edit freely — saving here writes directly to this file,
// and the live preview below updates once Vite's dev server hot-reloads it.
export default function ${name}({ params, onParamChange }) {
  return (
    <svg viewBox="0 0 400 240" className="w-full h-auto" style={{ background: '#fafaf8' }}>
      <text x="200" y="120" textAnchor="middle" fontSize="16" fill="#1e3a5f">
        ${name} — start building here
      </text>
    </svg>
  )
}
`
}

// Edits a real viz component file (src/courses/<course>/viz/<vizId>.jsx) —
// these are full React components imported via VizFrame.jsx's
// import.meta.glob, not runtime-eval'd snippets, so the live preview below
// updates on Save (Vite HMR reloads the already-mounted component) rather
// than instantly per keystroke like VizCellEditor's sandboxed-iframe
// approach. That's an honest trade-off for editing the REAL source file
// instead of a parallel eval system, not a missing feature.
export default function VizSourceEditor({ vizId, courseId = 'geometry', onClose }) {
  const [loading, setLoading] = useState(true)
  const [filePath, setFilePath] = useState(null)
  const [exists, setExists] = useState(false)
  const [source, setSource] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const dir = `src/courses/${courseId}/viz`

  useEffect(() => {
    if (!vizId) { setLoading(false); return }
    setLoading(true)
    fetch(`${API}/list?dir=${encodeURIComponent(dir)}&ext=jsx,js`)
      .then(r => r.json())
      .then(async files => {
        const match = (Array.isArray(files) ? files : []).find(f => f.name === `${vizId}.jsx` || f.name === `${vizId}.js`)
        if (!match) { setExists(false); setFilePath(null); setSource(''); setLoading(false); return }
        const text = await fetch(`${API}/read?path=${encodeURIComponent(match.path)}`).then(r => r.text())
        setExists(true)
        setFilePath(match.path)
        setSource(text)
        setLoading(false)
      })
      .catch(e => { setSaveMsg('Load error: ' + e.message); setLoading(false) })
  }, [vizId, dir])

  const createNew = useCallback(() => {
    setSource(starterTemplate(vizId))
    setFilePath(`${dir}/${vizId}.jsx`)
    setExists(true)
  }, [vizId, dir])

  const handleSave = async () => {
    if (!filePath) return
    setSaveMsg('Saving…')
    try {
      const r = await fetch(`${API}/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content: source }),
      })
      const data = await r.json()
      setSaveMsg(data.ok ? 'Saved — preview reloading…' : 'Error: ' + (data.error || '?'))
    } catch (e) {
      setSaveMsg('Error: ' + e.message)
    }
    setTimeout(() => setSaveMsg(''), 4000)
  }

  return (
    <div className="fixed inset-0 z-[600] flex flex-col" style={{ background: '#0d1117' }}>
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b" style={{ background: '#161b22', borderColor: '#30363d' }}>
        <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors" style={{ color: '#8b949e' }}>← Close</button>
        <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>✎ Viz source — {vizId || '(no vizId set)'}</span>
        {filePath && <span className="text-xs font-mono" style={{ color: '#8b949e' }}>{filePath}</span>}
        <div className="ml-auto flex items-center gap-2">
          {saveMsg && <span className="text-xs" style={{ color: /error/i.test(saveMsg) ? '#f87171' : '#4ade80' }}>{saveMsg}</span>}
          {exists && (
            <button onClick={handleSave} className="px-4 py-1.5 text-sm font-bold rounded-lg" style={{ background: '#238636', color: '#fff' }}>
              Save
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: '#8b949e' }}>Loading…</div>
      ) : !vizId ? (
        <div className="flex-1 flex items-center justify-center text-sm text-center px-6" style={{ color: '#8b949e' }}>
          Set a Viz ID first, then come back here to edit or create its source.
        </div>
      ) : !exists ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <p className="text-sm" style={{ color: '#8b949e' }}>
            No visualization file found for <span className="font-mono text-amber-400">{vizId}</span> in <span className="font-mono">{dir}/</span>
          </p>
          <button onClick={createNew} className="px-4 py-2 text-sm font-bold rounded-lg" style={{ background: '#238636', color: '#fff' }}>
            + Create new visualization
          </button>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-col min-h-0" style={{ width: '55%', borderRight: '1px solid #30363d' }}>
            <div className="px-3 py-1 text-xs shrink-0" style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}>
              Component source — Save to update the live preview (Vite hot-reloads it)
            </div>
            <div className="flex-1 min-h-0">
              <Editor value={source} onChange={v => setSource(v ?? '')} language="javascript" theme="vs-dark" options={MOPTS} />
            </div>
          </div>
          <div className="flex flex-col min-h-0" style={{ width: '45%', background: '#f8fafc' }}>
            <div className="px-3 py-1 text-xs shrink-0" style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}>
              Live preview
            </div>
            <div className="flex-1 overflow-auto p-4">
              <VizFrame id={vizId} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
