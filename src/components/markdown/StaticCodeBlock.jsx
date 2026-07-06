import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { LANG_LABEL, THEME_BG, CopyButton, HighlightedCode } from './codeDisplay.jsx'

// A read-only sibling of the blog's interactive CodeBlock — same syntax
// highlighting and Copy button, but no Edit/Run at all. Project-curriculum
// lessons show snippets meant to be typed into a separate project the
// student is building on their own machine (a real API call, a DOM the
// sandbox doesn't have, a whole Vite/React setup) — "Run" would either do
// nothing meaningful or silently fail, which is worse than not offering it.
export default function StaticCodeBlock({ language = '', code }) {
  const { isDarkGlobal, themeStyles } = useGlobalTheme()
  const trimmedCode = code.trimEnd()
  const lang = language.toLowerCase()
  const label = LANG_LABEL[lang] || language || 'text'
  const monacoTheme = themeStyles?.monaco ?? (isDarkGlobal ? 'vs-dark' : 'vs')
  const codeBgColor = THEME_BG[monacoTheme] ?? (isDarkGlobal ? '#1e1e2e' : '#f6f8fa')

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className={`flex items-center justify-between px-4 py-2 ${isDarkGlobal ? 'bg-slate-900' : 'bg-slate-100 border-b border-slate-200'}`}>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkGlobal ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
        <CopyButton getText={() => trimmedCode} />
      </div>
      <div style={{ backgroundColor: codeBgColor, color: isDarkGlobal ? '#ccc' : '#24292e' }}>
        <HighlightedCode code={trimmedCode} language={lang} />
      </div>
    </div>
  )
}
