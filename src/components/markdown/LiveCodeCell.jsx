import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'

const MonacoEditor = lazy(() => import('@monaco-editor/react').then((m) => ({ default: m.default })))

const PANES = [
  { key: 'html', label: 'HTML', lang: 'html' },
  { key: 'css',  label: 'CSS',  lang: 'css' },
  { key: 'js',   label: 'JS',   lang: 'javascript' },
]

// A closing </script> inside learner-typed JS would prematurely end the
// <script> tag when embedded in the iframe's srcDoc HTML — split it so the
// HTML parser doesn't recognize it as the end tag.
function escapeScriptClose(js) {
  return js.replace(/<\/script/gi, '<\\/script')
}

function buildSrcDoc({ html, css, js }) {
  return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${escapeScriptClose(js)}</script></body></html>`
}

// Renders an editable HTML/CSS/JS trio (or a lone piece of one) with a live
// iframe preview — the "run" a lesson's markup/style/script needs is to be
// rendered, not executed like a real language, so this is deliberately
// separate from the blog's language-runner CodeBlock.
export default function LiveCodeCell({ html = '', css = '', js = '' }) {
  const { isDarkGlobal, themeStyles } = useGlobalTheme()
  const initial = useMemo(() => ({ html, css, js }), [html, css, js])
  const [code, setCode] = useState(initial)
  const [activePane, setActivePane] = useState(
    initial.html ? 'html' : initial.css ? 'css' : 'js'
  )
  const [srcDoc, setSrcDoc] = useState(() => buildSrcDoc(initial))

  const debounceRef = useRef(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSrcDoc(buildSrcDoc(code)), 400)
    return () => clearTimeout(debounceRef.current)
  }, [code])

  const monacoTheme = themeStyles?.monaco ?? (isDarkGlobal ? 'vs-dark' : 'vs')
  const isDirty = code.html !== initial.html || code.css !== initial.css || code.js !== initial.js
  const activeDef = PANES.find((p) => p.key === activePane)

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className={`flex items-center justify-between px-2 py-1.5 ${isDarkGlobal ? 'bg-slate-900' : 'bg-slate-100 border-b border-slate-200'}`}>
        <div className="flex items-center gap-1">
          {PANES.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePane(p.key)}
              className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded transition-colors ${
                activePane === p.key
                  ? 'bg-indigo-600 text-white'
                  : isDarkGlobal ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {isDirty && (
          <button
            onClick={() => setCode(initial)}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-0.5 rounded"
          >
            Reset
          </button>
        )}
      </div>

      <Suspense fallback={<div className="px-4 py-3 text-slate-400 text-sm font-mono">Loading editor…</div>}>
        <MonacoEditor
          height="180px"
          language={activeDef.lang}
          value={code[activePane]}
          onChange={(v) => setCode((c) => ({ ...c, [activePane]: v ?? '' }))}
          theme={monacoTheme}
          beforeMount={setupOpenCalcMonaco}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineHeight: 20,
            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            padding: { top: 12, bottom: 12 },
            wordWrap: 'off',
            folding: false,
            renderLineHighlight: 'gutter',
          }}
        />
      </Suspense>

      <div className="border-t border-slate-200 dark:border-slate-700">
        <div className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${isDarkGlobal ? 'bg-zinc-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
          Preview
        </div>
        <iframe
          title="Live preview"
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="w-full bg-white"
          style={{ height: 220, border: 'none' }}
        />
      </div>
    </div>
  )
}
