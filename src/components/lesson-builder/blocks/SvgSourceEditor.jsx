import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import Editor from '@monaco-editor/react'

const SvgVisualEditor = lazy(() => import('./SvgVisualEditor.jsx'))

const API = '/api/dev-fs'
const MOPTS = {
  fontSize: 13,
  minimap: { enabled: false },
  wordWrap: 'off',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  lineNumbers: 'on',
  folding: true,
  renderLineHighlight: 'line',
}

// Renders the SVG source as actual browser SVG — same technique as
// LiveSvgPreview, so font metrics and .dark CSS rules work identically
// to how the diagram appears in the real lesson.
function SvgPreview({ xml, dark, onElementClick }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!xml) { el.innerHTML = ''; return }

    const doc = new DOMParser().parseFromString(xml, 'image/svg+xml')
    const svgEl = doc.querySelector('svg')
    if (!svgEl || doc.querySelector('parsererror')) return

    const clone = svgEl.cloneNode(true)
    if (dark) clone.classList.add('dark')
    clone.removeAttribute('width')
    clone.removeAttribute('height')
    clone.style.cssText = 'width:100%;height:auto;display:block;cursor:crosshair'

    // Tag every child element with its index so click-to-select can
    // identify which element was clicked and find it in the source.
    Array.from(clone.querySelectorAll('*')).forEach((child, i) => {
      child.dataset.svgIdx = i
    })

    el.innerHTML = ''
    el.appendChild(clone)
  }, [xml, dark])

  const handleClick = (e) => {
    const target = e.target.closest('[data-svg-idx]') ?? e.target
    if (target.dataset.svgIdx == null) return
    // Build a search hint from the element's key attributes
    const tag = target.tagName.toLowerCase()
    const attrs = ['x', 'y', 'cx', 'cy', 'x1', 'y1', 'x2', 'y2', 'r', 'fill', 'stroke', 'class', 'points']
      .filter(a => target.hasAttribute(a))
      .map(a => `${a}="${target.getAttribute(a)}"`)
    onElementClick?.({ tag, attrs, text: target.textContent?.trim() || null })
  }

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="w-full overflow-auto p-6"
      style={{ minHeight: '100%', background: dark ? '#1e293b' : '#f1f5f9' }}
    />
  )
}

// Highlights the matching line in Monaco when user clicks an SVG element.
function findAndReveal(editorRef, hint) {
  const model = editorRef.current?.getModel()
  if (!model) return
  // Build a pattern from the first few distinct attributes
  const snippets = hint.attrs.slice(0, 2)
  for (const snippet of snippets) {
    const matches = model.findMatches(snippet, true, false, true, null, false)
    if (matches.length > 0) {
      const first = matches[0].range
      editorRef.current.revealLineInCenter(first.startLineNumber)
      editorRef.current.setPosition({ lineNumber: first.startLineNumber, column: first.startColumn })
      editorRef.current.focus()
      return
    }
  }
  // Fallback: search by tag name
  const tagMatches = model.findMatches(`<${hint.tag}`, true, false, true, null, false)
  if (tagMatches.length > 0) {
    const first = tagMatches[0].range
    editorRef.current.revealLineInCenter(first.startLineNumber)
    editorRef.current.setPosition({ lineNumber: first.startLineNumber, column: 1 })
    editorRef.current.focus()
  }
}

export default function SvgSourceEditor({ filePath, onClose }) {
  const [source, setSource] = useState('')
  const [previewXml, setPreviewXml] = useState('')
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [editorDark, setEditorDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [saveMsg, setSaveMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [clickHint, setClickHint] = useState(null)
  const [rightMode, setRightMode] = useState('visual')  // 'preview' | 'visual'
  const debounceRef = useRef(null)
  const editorRef = useRef(null)

  // Track app theme for Monaco (independently from preview dark toggle)
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
      .then(text => { setSource(text); setPreviewXml(text); setLoading(false) })
      .catch(e => { setSaveMsg('Load error: ' + e.message); setLoading(false) })
  }, [filePath])

  const handleChange = useCallback((v) => {
    const next = v ?? ''
    setSource(next)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setPreviewXml(next), 300)
  }, [])

  // Called by the visual editor when shapes are added/moved/edited
  const handleVisualChange = useCallback((newXml) => {
    setSource(newXml)
    setPreviewXml(newXml)
    // Update Monaco content directly
    editorRef.current?.getModel()?.setValue(newXml)
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
        window.dispatchEvent(new CustomEvent('oc-svg-file-saved', { detail: { path: filePath } }))
        setSaveMsg('Saved ✓')
      } else {
        setSaveMsg('Error: ' + (data.error || '?'))
      }
    } catch (e) {
      setSaveMsg('Error: ' + e.message)
    }
    setTimeout(() => setSaveMsg(''), 3000)
  }, [filePath, source])

  // Cmd/Ctrl+S to save
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSave])

  const handleElementClick = useCallback((hint) => {
    setClickHint(hint)
    findAndReveal(editorRef, hint)
  }, [])

  return (
    <div className="fixed inset-0 z-[620] flex flex-col" style={{ background: '#0d1117' }}>
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
        <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>✎ SVG Editor</span>
        <span className="text-xs font-mono truncate max-w-xs" style={{ color: '#8b949e' }}>{filePath}</span>

        <div className="ml-auto flex items-center gap-3">
          {/* Preview dark/light toggle */}
          <div className="flex items-center gap-0 rounded-lg overflow-hidden border text-xs font-bold" style={{ borderColor: '#30363d' }}>
            <button
              onClick={() => setDark(false)}
              className="px-2.5 py-1 transition-colors"
              style={{ background: !dark ? '#2d6a4f' : 'transparent', color: !dark ? '#fff' : '#8b949e' }}
            >☀ Light</button>
            <button
              onClick={() => setDark(true)}
              className="px-2.5 py-1 transition-colors"
              style={{ background: dark ? '#1e3a5f' : 'transparent', color: dark ? '#93c5fd' : '#8b949e' }}
            >🌙 Dark</button>
          </div>

          {saveMsg && (
            <span className="text-xs" style={{ color: /error/i.test(saveMsg) ? '#f87171' : '#4ade80' }}>
              {saveMsg}
            </span>
          )}
          <span className="text-[10px]" style={{ color: '#484f58' }}>⌘S to save</span>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-sm font-bold rounded-lg"
            style={{ background: '#238636', color: '#fff' }}
          >
            Save
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: '#8b949e' }}>
          Loading…
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Left: Monaco editor */}
          <div className="flex flex-col min-h-0" style={{ width: '52%', borderRight: '1px solid #30363d' }}>
            <div
              className="px-3 py-1 text-xs shrink-0 flex items-center gap-2"
              style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}
            >
              SVG source
              {clickHint && (
                <span className="ml-2 font-mono text-[10px]" style={{ color: '#58a6ff' }}>
                  ← clicked: &lt;{clickHint.tag}{clickHint.text ? ` "${clickHint.text}"` : ''}&gt;
                </span>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                value={source}
                onChange={handleChange}
                language="xml"
                theme={editorDark ? 'vs-dark' : 'light'}
                options={MOPTS}
                onMount={ed => { editorRef.current = ed }}
              />
            </div>
          </div>

          {/* Right: visual editor or static preview */}
          <div className="flex flex-col min-h-0 flex-1">
            <div
              className="px-2 py-1 shrink-0 flex items-center gap-1"
              style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}
            >
              <div className="flex rounded overflow-hidden border text-[10px] font-bold" style={{ borderColor: '#30363d' }}>
                <button
                  onClick={() => setRightMode('visual')}
                  className="px-2.5 py-0.5 transition-colors"
                  style={{ background: rightMode === 'visual' ? '#1f6feb' : 'transparent', color: rightMode === 'visual' ? '#fff' : '#8b949e' }}
                >Visual Edit</button>
                <button
                  onClick={() => setRightMode('preview')}
                  className="px-2.5 py-0.5 transition-colors"
                  style={{ background: rightMode === 'preview' ? '#1f6feb' : 'transparent', color: rightMode === 'preview' ? '#fff' : '#8b949e' }}
                >Preview</button>
              </div>
              {rightMode === 'preview' && (
                <span className="text-[10px] ml-1" style={{ color: '#484f58' }}>click element → jump in source</span>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              {rightMode === 'visual' ? (
                <Suspense fallback={<div className="flex-1 flex items-center justify-center text-xs" style={{ color: '#8b949e' }}>Loading editor…</div>}>
                  <SvgVisualEditor xml={previewXml} dark={dark} onChange={handleVisualChange} />
                </Suspense>
              ) : (
                <SvgPreview xml={previewXml} dark={dark} onElementClick={handleElementClick} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
