import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import { LANG_LABEL, THEME_BG, CopyButton, HighlightedCode } from './codeDisplay.jsx'
import CodeSettingsModal, { getCodeFontFamily, getCodeFontSize } from '../ui/CodeSettingsModal.jsx'
import { Settings } from 'lucide-react'
import { useState } from 'react'

// A read-only sibling of the blog's interactive CodeBlock — same syntax
// highlighting and Copy button, but no Edit/Run at all. Project-curriculum
// lessons show snippets meant to be typed into a separate project the
// student is building on their own machine (a real API call, a DOM the
// sandbox doesn't have, a whole Vite/React setup) — "Run" would either do
// nothing meaningful or silently fail, which is worse than not offering it.
export default function StaticCodeBlock({ language = '', code }) {
  const { isDarkGlobal, themeStyles, codeTypography } = useGlobalTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const trimmedCode = code.trimEnd()
  const lang = language.toLowerCase()
  const label = LANG_LABEL[lang] || language || 'text'
  const monacoTheme = themeStyles?.monaco ?? (isDarkGlobal ? 'vs-dark' : 'vs')
  const codeBgColor = THEME_BG[monacoTheme] ?? (isDarkGlobal ? '#1e1e2e' : '#f6f8fa')

  return (
    <div className={`my-4 rounded-xl border border-indigo-500/20 shadow-[0_4px_20px_-5px_rgba(99,102,241,0.3),inset_0_0_0_1px_rgba(99,102,241,0.15)] transition-all duration-300 hover:shadow-[0_8px_30px_-5px_rgba(99,102,241,0.4),inset_0_0_0_1px_rgba(99,102,241,0.25),0_0_15px_rgba(99,102,241,0.2)]`}>
      <div className={`rounded-t-xl flex items-center justify-between px-4 py-2.5 border-b border-indigo-500/30 border-t border-indigo-500/40 bg-gradient-to-br ${isDarkGlobal ? 'from-slate-900 via-indigo-900/15 to-sky-900/10' : 'from-slate-100 via-indigo-500/10 to-sky-500/5'}`}>
        <span className="text-[12px] font-black uppercase tracking-[0.15em] bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent font-mono drop-shadow-[0_0_10px_rgba(129,140,248,0.2)]">
          {label}
        </span>
        <div className="flex items-center gap-1.5 relative">
          <button 
            onClick={() => setSettingsOpen(!settingsOpen)} 
            className={`text-[11px] font-semibold px-3 py-1.5 rounded-md border transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm hover:-translate-y-px active:translate-y-0 ${
              isDarkGlobal 
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-400 hover:shadow-[0_2px_10px_rgba(99,102,241,0.2)]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-500/40 hover:text-indigo-600 hover:shadow-[0_2px_10px_rgba(99,102,241,0.2)]'
            }`}
            title="Code Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <CodeSettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
          <CopyButton getText={() => trimmedCode} />
        </div>
      </div>
      <div 
        className="rounded-b-xl overflow-hidden"
        style={{ 
          backgroundColor: codeBgColor, 
          color: isDarkGlobal ? '#ccc' : '#24292e',
          fontFamily: codeTypography ? getCodeFontFamily(codeTypography.font) : undefined,
          fontSize: codeTypography ? getCodeFontSize(codeTypography.fontSize) : undefined,
          fontVariantLigatures: codeTypography?.ligatures ? 'normal' : 'none'
        }}
      >
        <HighlightedCode code={trimmedCode} language={lang} />
      </div>
    </div>
  )
}
