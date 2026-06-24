import { useState, useEffect, useCallback, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useContributorMode } from '../../../hooks/useContributorMode.js'
import CreatePRModal from '../../contributor/CreatePRModal.jsx'

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

// Third-party packages the preview iframe loads from CDN rather than stubbing.
// Maps npm package name → { url, global } where `global` is the window property set by the UMD build.
const KNOWN_CDNS = {
  'd3':        { url: 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js',             global: 'd3' },
  'three':     { url: 'https://cdn.jsdelivr.net/npm/three@0.164/build/three.min.js',  global: 'THREE' },
  'plotly.js': { url: 'https://cdn.plot.ly/plotly-2.26.0.min.js',                     global: 'Plotly' },
  'chart.js':  { url: 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js', global: 'Chart' },
  'mathjs':    { url: 'https://cdn.jsdelivr.net/npm/mathjs@12/mathjs.min.js',          global: 'math' },
  'katex':     { url: 'https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.js',    global: 'katex' },
}
const getCdnForPkg = pkg => KNOWN_CDNS[pkg] ?? KNOWN_CDNS[pkg.split('/')[0]] ?? null

// Builds a standalone HTML document for the iframe live preview.
// React/ReactDOM are UMD globals from CDN; Babel standalone transforms JSX; Tailwind Play CDN
// provides utility classes; known third-party packages (d3, three, etc.) are loaded from CDN
// rather than stubbed as null so vizzes that use them render correctly.
function buildPreviewDoc(source, dark = isDarkNow()) {
  const reactImports = new Set()
  const localImports = new Set()
  const cdnScripts = new Set()   // CDN URLs that need <script> tags
  const cdnSetupLines = []       // JS lines to run inside the Babel block after CDN globals are set

  let processed = source
    // React named imports: `import { useState, useEffect } from 'react'`
    .replace(/import\s*\{([^}]+)\}\s*from\s*['"]react['"]/g, (_, names) => {
      names.split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean).forEach(n => reactImports.add(n))
      return ''
    })
    // Bare React default: `import React from 'react'`
    .replace(/import\s+\w+\s+from\s*['"]react['"]/g, '')
    // Namespace imports: `import * as d3 from 'd3'` — load CDN, alias if needed
    .replace(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g, (_, alias, pkg) => {
      const cdn = getCdnForPkg(pkg)
      if (cdn) {
        cdnScripts.add(cdn.url)
        // UMD global might differ from the alias used in source (e.g. THREE vs three)
        if (cdn.global !== alias) cdnSetupLines.push(`var ${alias} = ${cdn.global};`)
      } else {
        localImports.add(alias)
      }
      return ''
    })
    // Named imports: `import { select, scaleLinear as scale } from 'd3'`
    .replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g, (_, names, pkg) => {
      const cdn = getCdnForPkg(pkg)
      if (cdn) {
        cdnScripts.add(cdn.url)
        // Build JS destructure: `var { select, scaleLinear: scale } = d3;`
        const parts = names.split(',').map(n => {
          const [orig, aliasRaw] = n.trim().split(/\s+as\s+/)
          const alias = aliasRaw?.trim()
          return alias ? `${orig.trim()}: ${alias}` : orig.trim()
        }).filter(Boolean)
        cdnSetupLines.push(`var { ${parts.join(', ')} } = ${cdn.global};`)
      } else {
        names.split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean).forEach(n => localImports.add(n))
      }
      return ''
    })
    // Default imports from other paths: `import Foo from './Foo'`
    .replace(/import\s+(\w+)\s+from\s*['"][^'"]+['"]/g, (_, name) => {
      localImports.add(name)
      return ''
    })
    // Strip any remaining import lines (side-effect, re-export, etc.)
    .replace(/^import\s+.+$/gm, '')
    // `export default function Foo` → `function __VizComp`
    .replace(/export\s+default\s+function\s+(\w+)/, 'function __VizComp')
    // `export default Foo` at end of file → stash in a var
    .replace(/export\s+default\s+(\w+)\s*;?\s*$/, 'var __vizNamedDefault = $1')

  const destr = reactImports.size ? `var { ${[...reactImports].join(', ')} } = React;\n` : ''
  const stubs = [...localImports].map(name => LOCAL_STUBS[name] ?? `var ${name} = null;`).join('\n')
  const cdnTags = [...cdnScripts].map(url => `<script src="${url}"><\/script>`).join('\n')
  const cdnSetup = cdnSetupLines.join('\n')

  return `<!DOCTYPE html>
<html class="${dark ? 'dark' : ''}">
<head>
<script src="https://cdn.tailwindcss.com"><\/script>
<script>tailwind.config = { darkMode: 'class' }<\/script>
${cdnTags}
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
${cdnSetup}
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
  const { available: canEdit } = useContributorMode()
  const [showPR, setShowPR] = useState(false)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [filePath, setFilePath] = useState(null)
  const [exists, setExists] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [source, setSource] = useState('')
  const [originalSource, setOriginalSource] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [previewDoc, setPreviewDoc] = useState('')
  const [diffMode, setDiffMode] = useState(false)
  const [DiffEditorComp, setDiffEditorComp] = useState(null)
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
    setDiffMode(false)
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
        if (!match) { setExists(false); setFilePath(null); setSource(''); setOriginalSource(''); setLoading(false); return }
        return fetch(`${API}/read?path=${encodeURIComponent(match.path)}&_=${Date.now()}`)
          .then(r => r.text())
          .then(text => {
            setExists(true)
            setFilePath(match.path)
            setSource(text)
            setOriginalSource(text)
            sourceRef.current = text
            setPreviewDoc(buildPreviewDoc(text))
            setLoading(false)
          })
      })
      .catch(e => { setApiError(e.message); setLoading(false) })
  }, [vizId, dir, retryCount])

  const createNew = useCallback(() => {
    const tmpl = starterTemplate(vizId)
    const path = `${dir}/${vizId}.jsx`
    setSource(tmpl)
    setOriginalSource('')
    setFilePath(path)
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
      if (data.ok) {
        setSaveMsg('Saved ✓')
        setOriginalSource(source)
        setDiffMode(false)
      } else {
        setSaveMsg('Error: ' + (data.error || '?'))
      }
    } catch (e) {
      setSaveMsg('Error: ' + e.message)
    }
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const showDiff = async () => {
    if (!DiffEditorComp) {
      const mod = await import('@monaco-editor/react')
      setDiffEditorComp(() => mod.DiffEditor)
    }
    setDiffMode(true)
  }

  const noChanges = exists && source === originalSource

  return (
    <>
    {showPR && filePath && (
      <CreatePRModal
        files={[{ path: filePath, content: source }]}
        onClose={() => setShowPR(false)}
      />
    )}
    <div className="fixed inset-0 z-[600] flex flex-col" style={{ background: '#0d1117' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b" style={{ background: '#161b22', borderColor: '#30363d' }}>
        <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors" style={{ color: '#8b949e' }}>← Close</button>
        <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>✎ Viz source — {vizId || '(no vizId set)'}</span>
        {filePath && <span className="text-xs font-mono" style={{ color: '#8b949e' }}>{filePath}</span>}
        {noChanges && exists && (
          <span className="text-xs" style={{ color: '#4ade80' }}>✓ No changes</span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {saveMsg && <span className="text-xs" style={{ color: /error/i.test(saveMsg) ? '#f87171' : '#4ade80' }}>{saveMsg}</span>}

          {exists && canEdit && !diffMode && !noChanges && (
            <button
              onClick={showDiff}
              className="px-3 py-1.5 text-sm font-bold rounded-lg"
              style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
            >
              Preview changes
            </button>
          )}

          {diffMode && (
            <button
              onClick={() => setDiffMode(false)}
              className="px-3 py-1.5 text-sm font-bold rounded-lg"
              style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
            >
              ← Code
            </button>
          )}

          {exists && canEdit && (
            <>
              <button
                onClick={handleSave}
                disabled={noChanges}
                className="px-4 py-1.5 text-sm font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#238636', color: '#fff' }}
              >
                💾 Save
              </button>
              <button
                onClick={() => setShowPR(true)}
                className="px-3 py-1.5 text-sm font-bold rounded-lg"
                style={{ background: '#1f6feb', color: '#fff' }}
              >
                ⬆ Create PR
              </button>
            </>
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
      ) : diffMode && DiffEditorComp ? (
        /* Diff view: full-width, no preview panel */
        <div className="flex-1 min-h-0">
          <div className="px-3 py-1 text-xs shrink-0" style={{ background: '#161b22', borderBottom: '1px solid #30363d', color: '#8b949e' }}>
            Changes vs disk — left: saved file · right: current editor
          </div>
          <div style={{ height: 'calc(100% - 28px)' }}>
            <DiffEditorComp
              height="100%"
              original={originalSource}
              modified={source}
              language="javascript"
              theme="vs-dark"
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      ) : (
        /* Normal editor + preview split */
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
              Live preview — React + JSX via Babel + Tailwind · local imports stripped
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
    </>
  )
}
