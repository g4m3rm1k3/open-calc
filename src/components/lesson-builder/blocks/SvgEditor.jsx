import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'

const API = '/api/dev-fs'
const MOPTS = { fontSize: 12, minimap: { enabled: false }, wordWrap: 'off', scrollBeyondLastLine: false, automaticLayout: true }
const BLANK_SVG = '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">\n  \n</svg>'

// Update/add a translate() on an element's transform attribute
function applyTranslate(el, dx, dy) {
  const existing = el.getAttribute('transform') || ''
  const m = existing.match(/translate\(\s*([^,)]+)(?:,\s*([^)]+))?\)/)
  let baseDx = 0, baseDy = 0
  if (m) { baseDx = parseFloat(m[1]) || 0; baseDy = parseFloat(m[2] ?? '0') || 0 }
  const other = existing.replace(/translate\([^)]*\)/g, '').trim()
  const newTranslate = `translate(${Math.round(baseDx + dx)},${Math.round(baseDy + dy)})`
  el.setAttribute('transform', other ? `${newTranslate} ${other}` : newTranslate)
}

// Parse viewBox string into {x,y,w,h}
function parseVB(s) {
  if (!s) return null
  const p = s.trim().split(/[\s,]+/).map(Number)
  if (p.length < 4) return null
  return { x: p[0], y: p[1], w: p[2], h: p[3] }
}

export default function SvgEditor({ onClose, initialPath, onSaved, dir = 'src/courses/geometry/diagrams' }) {
  const [files, setFiles] = useState([])
  const [filesLoaded, setFilesLoaded] = useState(false)
  const [selectedPath, setSelectedPath] = useState(initialPath ?? null)
  const [xml, setXml] = useState('')
  const [viewBox, setViewBox] = useState('')
  const [vbEdit, setVbEdit] = useState('')
  const [selectedInfo, setSelectedInfo] = useState(null)
  const [saveMsg, setSaveMsg] = useState('')
  const [dark, setDark] = useState(false)
  const [browseAll, setBrowseAll] = useState(!initialPath)
  const [newFileName, setNewFileName] = useState('')
  const containerRef = useRef(null)
  const dragRef = useRef(null)
  const editorRef = useRef(null)

  // Load file list
  useEffect(() => {
    setFilesLoaded(false)
    fetch(`${API}/list?dir=${encodeURIComponent(dir)}`)
      .then(r => r.json())
      .then(data => setFiles(Array.isArray(data) ? data : []))
      .catch(() => setFiles([]))
      .finally(() => setFilesLoaded(true))
  }, [dir])

  // Load selected file — if it doesn't exist yet (new diagram), start from a blank skeleton
  // instead of surfacing the raw error as if it were file content.
  useEffect(() => {
    if (!selectedPath) return
    fetch(`${API}/read?path=${encodeURIComponent(selectedPath)}`)
      .then(async r => {
        if (!r.ok) return BLANK_SVG
        return r.text()
      })
      .then(text => {
        setXml(text)
        const vb = text.match(/viewBox="([^"]+)"/)
        const v = vb ? vb[1] : ''
        setViewBox(v); setVbEdit(v)
        setSelectedInfo(null)
      })
      .catch(e => setSaveMsg('Load error: ' + e.message))
  }, [selectedPath])

  // Render SVG when xml changes
  useEffect(() => {
    if (!containerRef.current || !xml) return
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'image/svg+xml')
    const err = doc.querySelector('parsererror')
    if (err) return // invalid XML — don't re-render

    const svgEl = doc.querySelector('svg')
    if (!svgEl) return

    // Preserve classes for dark mode
    if (dark) svgEl.classList.add('dark')

    containerRef.current.innerHTML = ''
    const clone = svgEl.cloneNode(true)
    clone.style.width = '100%'
    clone.style.height = 'auto'
    clone.style.display = 'block'
    containerRef.current.appendChild(clone)
    attachHandlers(clone)
  }, [xml, dark])

  const attachHandlers = useCallback((svgEl) => {
    const targets = svgEl.querySelectorAll('text, circle, rect, polygon, polyline, line, ellipse, image, g')
    targets.forEach(el => {
      if (el.tagName === 'g' && el.querySelectorAll('text, circle, rect').length > 0) return // skip compound groups to avoid double-handling
      el.style.cursor = 'grab'
      el.addEventListener('pointerdown', startDrag)
    })

    function startDrag(e) {
      e.stopPropagation()
      const svg = svgEl
      const pt = svg.createSVGPoint()
      pt.x = e.clientX; pt.y = e.clientY
      const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse())

      // Highlight selection
      svg.querySelectorAll('[data-sel]').forEach(s => {
        s.removeAttribute('data-sel')
        s.style.filter = ''
        s.style.outline = ''
      })
      const el = e.currentTarget
      el.setAttribute('data-sel', '1')
      el.style.filter = 'drop-shadow(0 0 6px rgba(129,140,248,0.9))'
      setSelectedInfo({ tag: el.tagName, transform: el.getAttribute('transform') || '' })

      dragRef.current = {
        el,
        svg,
        startX: svgPt.x,
        startY: svgPt.y,
        origTransform: el.getAttribute('transform') || '',
        accDx: 0,
        accDy: 0,
      }
      el.setPointerCapture(e.pointerId)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerup', onUp, { once: true })
    }

    function onMove(e) {
      const d = dragRef.current
      if (!d) return
      const pt = d.svg.createSVGPoint()
      pt.x = e.clientX; pt.y = e.clientY
      const cur = pt.matrixTransform(d.svg.getScreenCTM().inverse())
      d.accDx = Math.round(cur.x - d.startX)
      d.accDy = Math.round(cur.y - d.startY)

      // Reset transform to original before applying delta
      d.el.setAttribute('transform', d.origTransform)
      applyTranslate(d.el, d.accDx, d.accDy)
      setSelectedInfo(prev => prev ? { ...prev, transform: d.el.getAttribute('transform') } : prev)
    }

    function onUp() {
      const d = dragRef.current
      if (!d) return
      d.el.removeEventListener('pointermove', onMove)
      if (d.accDx !== 0 || d.accDy !== 0) {
        // Serialize current live SVG back to xml string
        const newXml = new XMLSerializer().serializeToString(svgEl)
        setXml(newXml)
      }
      dragRef.current = null
    }
  }, [])

  const applyViewBox = () => {
    const updated = xml.replace(/viewBox="[^"]*"/, `viewBox="${vbEdit.trim()}"`)
    setXml(updated)
    setViewBox(vbEdit.trim())
  }

  const createNewFile = () => {
    const name = newFileName.trim().replace(/\.svg$/i, '') + '.svg'
    if (!/^[\w-]+\.svg$/i.test(name)) {
      setSaveMsg('Error: use letters, numbers, - and _ only')
      return
    }
    setSelectedPath(`${dir}/${name}`)
    setNewFileName('')
  }

  const handleSave = async () => {
    if (!selectedPath) return
    setSaveMsg('Saving…')
    try {
      const r = await fetch(`${API}/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: selectedPath, content: xml }),
      })
      const data = await r.json()
      setSaveMsg(data.ok ? 'Saved!' : 'Error: ' + (data.error || '?'))
      if (data.ok) {
        onSaved?.(selectedPath)
        if (!files.some(f => f.path === selectedPath)) {
          setFiles(prev => [...prev, { name: selectedPath.split('/').pop(), path: selectedPath }])
        }
      }
    } catch (e) {
      setSaveMsg('Error: ' + e.message)
    }
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const handleDownload = () => {
    const filename = selectedPath ? selectedPath.split('/').pop() : 'diagram.svg'
    const blob = new Blob([xml], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const handleReplace = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.svg,image/svg+xml'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result
        if (typeof text === 'string') {
          setXml(text)
          setSaveMsg('Loaded — click "Save file" to write to disk')
          setTimeout(() => setSaveMsg(''), 4000)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const vb = parseVB(viewBox)

  return (
    <div className="fixed inset-0 z-[600] flex flex-col" style={{ background: '#0d1117' }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b" style={{ background: '#161b22', borderColor: '#30363d' }}>
        <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors" style={{ color: '#8b949e' }}>← Close</button>
        <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>🖼 SVG Editor</span>
        {selectedPath && (
          <span className="text-xs font-mono" style={{ color: '#8b949e' }}>{selectedPath.split('/').pop()}</span>
        )}
        {initialPath && !browseAll && (
          <button onClick={() => setBrowseAll(true)} className="text-xs px-2 py-0.5 rounded hover:bg-white/10 transition-colors" style={{ color: '#8b949e' }}>
            Browse other files…
          </button>
        )}

        {/* ViewBox editor */}
        {viewBox && (
          <div className="flex items-center gap-1.5 ml-4">
            <span className="text-xs" style={{ color: '#8b949e' }}>viewBox:</span>
            <input
              value={vbEdit}
              onChange={e => setVbEdit(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyViewBox()}
              className="text-xs font-mono rounded px-2 py-0.5 w-40"
              style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3' }}
              placeholder="0 0 720 400"
            />
            <button onClick={applyViewBox} className="text-xs px-2 py-0.5 rounded" style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>Apply</button>
            {vb && <span className="text-xs" style={{ color: '#8b949e' }}>{vb.w}×{vb.h}</span>}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none" style={{ color: '#8b949e' }}>
            <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} className="accent-indigo-500" />
            Dark preview
          </label>
          {saveMsg && <span className="text-xs" style={{ color: saveMsg.startsWith('Error') ? '#f87171' : '#4ade80' }}>{saveMsg}</span>}
          {xml && (
            <button onClick={handleDownload} title="Download current SVG to your machine" className="px-3 py-1.5 text-sm font-semibold rounded-lg" style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3' }}>
              ↓ Download SVG
            </button>
          )}
          {selectedPath && (
            <button onClick={handleReplace} title="Load any SVG file from disk — its content replaces this file (then Save to write)" className="px-3 py-1.5 text-sm font-semibold rounded-lg" style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3' }}>
              ↑ Load new SVG
            </button>
          )}
          {selectedPath && (
            <button onClick={handleSave} title={`Write current content to ${selectedPath}`} className="px-4 py-1.5 text-sm font-bold rounded-lg" style={{ background: '#238636', color: '#ffffff' }}>
              Save to project
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar: file list — hidden when bound to a single file via initialPath */}
        {browseAll && (
          <div className="flex flex-col w-52 shrink-0 border-r overflow-y-auto" style={{ background: '#161b22', borderColor: '#30363d' }}>
            <div className="px-3 pt-3 pb-2 text-xs font-bold uppercase tracking-widest" style={{ color: '#8b949e' }}>
              Diagram files
            </div>
            <div className="flex items-center gap-1 px-3 pb-2">
              <input
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createNewFile()}
                placeholder="new-diagram.svg"
                className="text-xs font-mono rounded px-2 py-1 flex-1 min-w-0"
                style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3' }}
              />
              <button
                onClick={createNewFile}
                disabled={!newFileName.trim()}
                className="text-xs px-2 py-1 rounded disabled:opacity-40"
                style={{ background: '#238636', color: '#fff' }}
              >+ New</button>
            </div>
            {!filesLoaded && files.length === 0 && (
              <div className="px-3 text-xs italic" style={{ color: '#8b949e' }}>Loading…</div>
            )}
            {filesLoaded && files.length === 0 && (
              <div className="px-3 text-xs italic" style={{ color: '#8b949e' }}>
                No diagrams yet for this course — name one above to create it.
              </div>
            )}
            {files.map(f => (
              <button
                key={f.path}
                onClick={() => setSelectedPath(f.path)}
                className="text-left px-3 py-1.5 text-xs truncate transition-colors"
                style={selectedPath === f.path
                  ? { background: '#21262d', color: '#e6edf3' }
                  : { color: '#8b949e' }}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}

        {/* Center: visual SVG preview */}
        <div className="flex flex-col flex-1 min-w-0" style={{ borderRight: '1px solid #30363d' }}>
          <div className="flex items-center gap-3 px-3 py-1.5 shrink-0 text-xs" style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}>
            <span>Visual — click & drag elements to reposition</span>
            {selectedInfo && (
              <span className="ml-2 font-mono" style={{ color: '#a78bfa' }}>
                &lt;{selectedInfo.tag}/&gt; transform: {selectedInfo.transform || 'none'}
              </span>
            )}
          </div>
          <div
            className="flex-1 overflow-auto p-4"
            style={{ background: dark ? '#1e293b' : '#f8fafc' }}
          >
            {!selectedPath ? (
              <div className="flex items-center justify-center h-full" style={{ color: '#8b949e' }}>
                <div className="text-center">
                  <div className="text-4xl mb-3">🖼</div>
                  <div className="text-sm">Select a file from the list</div>
                </div>
              </div>
            ) : (
              <div ref={containerRef} className="max-w-full" />
            )}
          </div>
        </div>

        {/* Right: XML editor */}
        <div className="flex flex-col" style={{ width: '38%', minWidth: 320 }}>
          <div className="flex items-center gap-2 px-3 py-1.5 shrink-0 text-xs" style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}>
            <span>SVG source — edit directly, visual updates on change</span>
          </div>
          <div className="flex-1 min-h-0">
            <Editor
              value={xml}
              onChange={v => setXml(v ?? '')}
              language="xml"
              theme="vs-dark"
              options={MOPTS}
              onMount={(editor) => { editorRef.current = editor }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
