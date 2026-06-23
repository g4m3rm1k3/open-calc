import { useState, useEffect, useCallback, useRef } from 'react'
import Editor from '@monaco-editor/react'

const API = '/api/dev-fs'
const MOPTS = { fontSize: 13, minimap: { enabled: false }, wordWrap: 'on', scrollBeyondLastLine: false, automaticLayout: true }

function toPascalCase(vizId) {
  const words = String(vizId || '').replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
  const name = words.map(w => w[0].toUpperCase() + w.slice(1)).join('') || 'Viz'
  return /^[A-Za-z_$]/.test(name) ? name : `Viz${name}`
}

function starterTemplate(vizId) {
  const name = toPascalCase(vizId)
  return `import { useState } from 'react'

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

// Stubs for hooks/utils that are commonly imported from local paths.
// Prevents ReferenceError when the import line is stripped but the call remains.
const LOCAL_STUBS = {
  useIsDark:       'function useIsDark() { return false; }',
  useAuth:         'function useAuth() { return { user: null, syncing: false }; }',
  usePins:         'function usePins() { return { isPinned: function(){ return false; }, addPin: function(){}, removePin: function(){} }; }',
  useLocalStorage: 'function useLocalStorage(_k, def) { return [def, function(){}]; }',
  useProgress:     `function useProgress() { return {
    progress: {}, getLessonProgress: function(){ return { percent: 0, status: 'not-started', correct: 0, total: 0 }; },
    markCheckpoint: function(){}, setQuizScore: function(){}, getQuizScore: function(){ return null; },
    getQuizStates: function(){ return {}; }, setQuizStates: function(){},
    getReadingProgress: function(){ return 0; }, setReadingProgress: function(){},
    getLessonStatus: function(){ return 'not-started'; },
  }; }`,
}

const isDarkNow = () => document.documentElement.classList.contains('dark')

// Builds a standalone HTML document for the iframe live preview.
// React and ReactDOM are loaded as UMD globals from CDN so we don't need
// a bundler. Babel standalone transforms JSX in the iframe. No sandbox so
// CDN <script> tags can load (this is a dev-only tool on localhost).
function buildPreviewDoc(source, dark = isDarkNow()) {
  const reactImports = new Set()
  const localImports = new Set()

  let processed = source
    // Collect named React imports, strip the import line
    .replace(/import\s*\{([^}]+)\}\s*from\s*['"]react['"]/g, (_, names) => {
      names.split(',')
        .map(n => n.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean)
        .forEach(n => reactImports.add(n))
      return ''
    })
    // Strip bare `import React from 'react'` (React is a global here)
    .replace(/import\s+\w+\s+from\s*['"]react['"]/g, '')
    // Strip named imports from all other paths — collect names so we can stub them
    .replace(/import\s*\{([^}]+)\}\s*from\s*['"][^'"]+['"]/g, (_, names) => {
      names.split(',')
        .map(n => n.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean)
        .forEach(n => localImports.add(n))
      return ''
    })
    // Strip default imports from other paths
    .replace(/import\s+(\w+)\s+from\s*['"][^'"]+['"]/g, (_, name) => {
      localImports.add(name)
      return ''
    })
    // Strip any remaining import lines (namespace imports, side-effect imports)
    .replace(/^import\s+.+$/gm, '')
    // `export default function Foo` → `function __VizComp`
    .replace(/export\s+default\s+function\s+(\w+)/, 'function __VizComp')
    // `export default Foo` at end of file → stash in a var
    .replace(/export\s+default\s+(\w+)\s*;?\s*$/, 'var __vizNamedDefault = $1')

  const destr = reactImports.size
    ? `var { ${[...reactImports].join(', ')} } = React;\n`
    : ''

  // Inject stubs for every local import so call sites don't throw ReferenceError
  const stubs = [...localImports].map(name =>
    LOCAL_STUBS[name] ?? `var ${name} = null;`
  ).join('\n')

  return `<!DOCTYPE html>
<html class="${dark ? 'dark' : ''}">
<head>
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7/babel.min.js"><\/script>
<style>
*{box-sizing:border-box}
body{margin:0;padding:10px;font-family:system-ui,sans-serif;font-size:14px;background:${dark ? '#0f172a' : '#f8fafc'};color:${dark ? '#e2e8f0' : '#1e293b'}}
pre.error{color:#ef4444;background:#1f0707;padding:10px;border-radius:6px;font-size:12px;white-space:pre-wrap;margin:0}
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel" data-presets="react">
${destr}
${stubs}
${processed}
;(function () {
  var Comp =
    typeof __VizComp !== 'undefined' ? __VizComp :
    typeof __vizNamedDefault !== 'undefined' ? __vizNamedDefault :
    null;
  if (!Comp) {
    document.getElementById('root').innerHTML = '<pre class="error">No default export found</pre>';
    return;
  }
  try {
    ReactDOM.createRoot(document.getElementById('root'))
      .render(React.createElement(Comp, { params: {}, onParamChange: function(){} }));
  } catch (e) {
    document.getElementById('root').innerHTML = '<pre class="error">' + e.message + '</pre>';
  }
})();
<\/script>
</body>
</html>`
}

export default function VizSourceEditor({ vizId, courseId = 'geometry', onClose }) {
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [filePath, setFilePath] = useState(null)
  const [exists, setExists] = useState(false)
  const [apiError, setApiError] = useState(null)  // distinct from "file not found"
  const [source, setSource] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [previewDoc, setPreviewDoc] = useState('')
  const debounceRef = useRef(null)
  const sourceRef = useRef('')
  const dir = `src/courses/${courseId}/viz`

  // Rebuild preview when app dark mode toggles
  useEffect(() => {
    const obs = new MutationObserver(() => {
      if (sourceRef.current) setPreviewDoc(buildPreviewDoc(sourceRef.current))
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!vizId) { setLoading(false); return }
    setLoading(true)
    setApiError(null)
    setExists(false)
    fetch(`${API}/list?dir=${encodeURIComponent(dir)}&ext=jsx,js&_=${Date.now()}`)
      .then(r => {
        const ct = r.headers.get('content-type') || ''
        if (!ct.includes('json')) {
          throw new Error(`Dev server API unavailable (got ${ct || 'HTML'} — make sure you're running npm run dev)`)
        }
        return r.json()
      })
      .then(files => {
        const match = (Array.isArray(files) ? files : []).find(f => f.name === `${vizId}.jsx` || f.name === `${vizId}.js`)
        if (!match) { setExists(false); setFilePath(null); setSource(''); setLoading(false); return }
        return fetch(`${API}/read?path=${encodeURIComponent(match.path)}&_=${Date.now()}`)
          .then(r => r.text())
          .then(text => {
            setExists(true)
            setFilePath(match.path)
            setSource(text)
            sourceRef.current = text
            setPreviewDoc(buildPreviewDoc(text))
            setLoading(false)
          })
      })
      .catch(e => { setApiError(e.message); setLoading(false) })
  }, [vizId, dir, retryCount])

  const createNew = useCallback(() => {
    const tmpl = starterTemplate(vizId)
    setSource(tmpl)
    setFilePath(`${dir}/${vizId}.jsx`)
    setExists(true)
    setPreviewDoc(buildPreviewDoc(tmpl))
  }, [vizId, dir])

  const handleSourceChange = useCallback((v) => {
    const next = v ?? ''
    setSource(next)
    sourceRef.current = next
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPreviewDoc(buildPreviewDoc(next))
    }, 500)
  }, [])

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
      setSaveMsg(data.ok ? 'Saved ✓' : 'Error: ' + (data.error || '?'))
    } catch (e) {
      setSaveMsg('Error: ' + e.message)
    }
    setTimeout(() => setSaveMsg(''), 3000)
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
      ) : apiError ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
          <span className="text-3xl opacity-40">⚠</span>
          <p className="text-sm font-bold" style={{ color: '#f87171' }}>API Error</p>
          <p className="text-xs max-w-md leading-relaxed" style={{ color: '#8b949e' }}>{apiError}</p>
          <button
            onClick={() => setRetryCount(c => c + 1)}
            className="mt-2 px-4 py-1.5 text-sm font-bold rounded-lg"
            style={{ background: '#238636', color: '#fff' }}
          >
            ↻ Retry
          </button>
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
              Component source — preview updates as you type · Save to persist
            </div>
            <div className="flex-1 min-h-0">
              <Editor value={source} onChange={handleSourceChange} language="javascript" theme="vs-dark" options={MOPTS} />
            </div>
          </div>
          <div className="flex flex-col min-h-0" style={{ width: '45%' }}>
            <div className="px-3 py-1 text-xs shrink-0" style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}>
              Live preview — React + JSX via Babel · local imports stripped
            </div>
            <div className="flex-1 min-h-0">
              <iframe
                srcDoc={previewDoc}
                title="viz-live-preview"
                className="border-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
