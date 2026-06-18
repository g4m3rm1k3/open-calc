import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'

const STARTER = (vizId, title, props) => JSON.stringify({ vizId, title, caption: '', props }, null, 2)

export default function CodeMode({ vizConfig, onChange }) {
  const [code, setCode] = useState(() => STARTER(vizConfig.vizId ?? 'PythonNotebook', vizConfig.title ?? '', vizConfig.props ?? {}))
  const [error, setError] = useState(null)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  // Sync dark mode
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // Sync code when vizConfig changes from outside (e.g. Gallery fork)
  useEffect(() => {
    setCode(STARTER(vizConfig.vizId ?? '', vizConfig.title ?? '', vizConfig.props ?? {}))
  }, [vizConfig.vizId, vizConfig.title])

  const handleChange = (value) => {
    setCode(value ?? '')
    try {
      const parsed = JSON.parse(value ?? '{}')
      setError(null)
      onChange({
        vizId: parsed.vizId ?? '',
        title: parsed.title ?? '',
        caption: parsed.caption ?? '',
        props: parsed.props ?? {},
      })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">JSON Config</p>
        <p className="text-xs text-slate-400">
          Edit the viz config directly. The preview updates live as you type valid JSON.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/40 shrink-0">
          <p className="text-xs text-red-600 dark:text-red-400 font-mono">{error}</p>
        </div>
      )}

      {/* Monaco editor */}
      <div className="flex-1 min-h-0">
        <Editor
          value={code}
          onChange={handleChange}
          language="json"
          theme={dark ? 'vs-dark' : 'light'}
          options={{
            fontSize: 12,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            formatOnPaste: true,
          }}
        />
      </div>

      {/* Schema hint */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50 dark:bg-slate-900/50">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Schema</p>
        <pre className="text-[10px] font-mono text-slate-400 leading-relaxed">{`{
  "vizId": "PythonNotebook",   // registered viz ID
  "title": "Lab Tour",         // shown above viz
  "caption": "...",            // shown below
  "props": { ... }             // passed to the component
}`}</pre>
      </div>
    </div>
  )
}
