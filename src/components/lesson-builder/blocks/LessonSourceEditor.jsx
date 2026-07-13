import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Editor from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useContributorMode } from '../../../hooks/useContributorMode.js'
import Toolbar from '../../markdown-toolbar/MarkdownToolbar.jsx'

const API = '/api/dev-fs'
const MOPTS = {
  fontSize: 13,
  minimap: { enabled: false },
  wordWrap: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  lineNumbers: 'on',
  folding: true,
  renderLineHighlight: 'line',
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Full-screen raw-markdown editor for a single lesson file, opened from the
// Lesson Engine's "Edit" toggle. Mirrors SvgSourceEditor's dev-fs read/write
// contract (backend/server.mjs's /api/dev-fs, writes gated to src/ + public/)
// so a lesson fix can be saved straight back to its source file on disk.
export default function LessonSourceEditor({ filePath, onClose, onSaved }) {
  const { available: canEdit } = useContributorMode()
  const [source, setSource] = useState('')
  const [previewSrc, setPreviewSrc] = useState('')
  const [editorDark, setEditorDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [saveMsg, setSaveMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [leftPct, setLeftPct] = useState(50)
  const debounceRef = useRef(null)
  const editorRef = useRef(null)
  const containerRef = useRef(null)
  const dividerDrag = useRef(null)

  const fileName = filePath ? filePath.split('/').pop() : 'lesson.md'

  const insertBtn = useCallback((btn) => {
    const ed = editorRef.current
    if (!ed) return
    if (btn.plain != null) ed.trigger('keyboard', 'type', { text: btn.plain })
    else if (btn.snippet) ed.trigger('keyboard', 'editor.action.insertSnippet', { snippet: btn.snippet })
    ed.focus()
  }, [])

  const onDividerDown = useCallback((e) => {
    e.preventDefault()
    dividerDrag.current = { startX: e.clientX, startPct: leftPct }
    const onMove = (ev) => {
      if (!dividerDrag.current || !containerRef.current) return
      const dx = ev.clientX - dividerDrag.current.startX
      const totalW = containerRef.current.offsetWidth
      const newPct = Math.max(15, Math.min(85, dividerDrag.current.startPct + (dx / totalW) * 100))
      setLeftPct(newPct)
    }
    const onUp = () => {
      dividerDrag.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [leftPct])

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setEditorDark(document.documentElement.classList.contains('dark'))
    )
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!filePath) { setLoading(false); return }
    fetch(`${API}/read?path=${encodeURIComponent(filePath)}`)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.text() })
      .then(text => { setSource(text); setPreviewSrc(text); setLoading(false) })
      .catch(e => { setSaveMsg('Load error: ' + e.message); setLoading(false) })
  }, [filePath])

  const handleChange = useCallback((v) => {
    const next = v ?? ''
    setSource(next)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setPreviewSrc(next), 300)
  }, [])

  const handleSave = useCallback(async () => {
    setSaveMsg('Saving…')
    try {
      const r = await fetch(`${API}/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content: source }),
      })
      const data = await r.json()
      if (data.ok) {
        setSaveMsg('Saved ✓')
        onSaved?.(source)
      } else {
        setSaveMsg('Error: ' + (data.error || '?'))
      }
    } catch (e) {
      setSaveMsg('Error: ' + e.message)
    }
    setTimeout(() => setSaveMsg(''), 3000)
  }, [filePath, source, onSaved])

  const handleDownload = useCallback(() => {
    downloadText(fileName, source)
  }, [fileName, source])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); if (canEdit) handleSave() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSave, canEdit])

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', background: '#0d1117' }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b"
        style={{ background: '#161b22', borderColor: '#30363d' }}
      >
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: '#8b949e' }}
        >
          ← Close
        </button>
        <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>✎ Lesson Editor</span>
        <span className="text-xs font-mono truncate max-w-md" style={{ color: '#8b949e' }}>{filePath}</span>

        <div className="ml-auto flex items-center gap-3">
          {saveMsg && (
            <span className="text-xs" style={{ color: /error/i.test(saveMsg) ? '#f87171' : '#4ade80' }}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-sm font-bold rounded-lg"
            style={{ background: '#30363d', color: '#e6edf3' }}
          >
            ⬇ Download
          </button>
          {canEdit ? (
            <>
              <span className="text-[10px]" style={{ color: '#484f58' }}>⌘S to save</span>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-sm font-bold rounded-lg"
                style={{ background: '#238636', color: '#fff' }}
              >
                Save
              </button>
            </>
          ) : (
            <span className="text-[11px]" style={{ color: '#484f58' }} title="Start the dev backend (npm run backend) to save straight to disk">
              Save to disk unavailable — download instead
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: '#8b949e' }}>
          Loading…
        </div>
      ) : (
        <div ref={containerRef} className="flex flex-1 min-h-0">
          {/* Left: Monaco editor */}
          <div className="flex flex-col min-h-0" style={{ width: `${leftPct}%` }}>
            <div
              className="px-3 py-1 text-xs shrink-0"
              style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}
            >
              Markdown source
            </div>
            <Toolbar onInsert={insertBtn} />
            <div className="flex-1 min-h-0">
              <Editor
                value={source}
                onChange={handleChange}
                language="markdown"
                theme={editorDark ? 'vs-dark' : 'light'}
                options={MOPTS}
                onMount={ed => { editorRef.current = ed }}
              />
            </div>
          </div>

          {/* Draggable divider */}
          <div
            onMouseDown={onDividerDown}
            className="shrink-0 flex items-center justify-center cursor-col-resize group select-none"
            style={{ width: 6, background: '#21262d', borderLeft: '1px solid #30363d', borderRight: '1px solid #30363d' }}
            title="Drag to resize panels"
          >
            <div className="w-0.5 h-8 rounded-full group-hover:bg-blue-500 transition-colors" style={{ background: '#484f58' }} />
          </div>

          {/* Right: rendered preview */}
          <div className="flex flex-col min-h-0 flex-1 min-w-0">
            <div
              className="px-3 py-1 text-xs shrink-0"
              style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}
            >
              Preview (raw markdown — fences render as plain code blocks)
            </div>
            <div
              className="flex-1 min-h-0 overflow-y-auto px-6 py-4 prose prose-sm dark:prose-invert max-w-none"
              style={{ background: editorDark ? '#0d1117' : '#ffffff' }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewSrc}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
