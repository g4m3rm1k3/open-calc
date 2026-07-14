import { useState } from 'react'
import ConceptBlock from '../concepts/ConceptBlock.tsx'
import { Code2, Terminal, Search, LayoutTemplate } from 'lucide-react'

export default function ConceptPreviewPage() {
  const [lang, setLang] = useState('python')
  const [topicInput, setTopicInput] = useState('string-slicing')
  const [activeTopic, setActiveTopic] = useState('string-slicing')

  const handleSearch = (e) => {
    e.preventDefault()
    if (topicInput.trim()) {
      setActiveTopic(topicInput.trim())
    }
  }

  return (
    <div className="h-screen w-full flex flex-col bg-white dark:bg-slate-950 font-sans overflow-hidden">
      {/* Compact Header Bar */}
      <header className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-2 w-1/4">
          <LayoutTemplate className="w-5 h-5 text-brand-500" />
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 hidden sm:block">Concept Explorer</h1>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="Search topic ID (e.g. string-slicing)"
            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all shadow-sm"
          />
        </form>

        {/* Right: Language Selector */}
        <div className="flex items-center justify-end w-1/4">
          <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setLang('python')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                lang === 'python'
                  ? 'bg-white dark:bg-slate-950 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Python</span>
            </button>
            <button
              onClick={() => setLang('javascript')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                lang === 'javascript'
                  ? 'bg-white dark:bg-slate-950 text-amber-500 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JavaScript</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Concept Block directly taking full space */}
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
          <ConceptBlock key={`${activeTopic}-${lang}`} id={activeTopic} lang={lang} />
        </div>
      </main>
    </div>
  )
}
