import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ConceptBlock from './ConceptBlock.tsx'
import { getAvailableConceptIds, getConceptFile, getConceptMeta, type ConceptFile } from './loader'

interface Props {
  onClose: () => void
}

const LANG_LABEL: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  cpp: 'C++',
  c: 'C',
  sql: 'SQL',
}

export default function ConceptExplorerModal({ onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const allIds = useMemo(() => getAvailableConceptIds(), [])

  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(allIds[0] ?? null)
  const [lang, setLang] = useState<string | undefined>(undefined)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allIds
    return allIds.filter(id => id.toLowerCase().includes(q) || (getConceptMeta(id)?.name.toLowerCase().includes(q)))
  }, [allIds, query])

  // Full content (needed for the header's language tabs) is lazy — fetched only
  // for the currently active concept, not for every concept in the sidebar.
  const [activeConcept, setActiveConcept] = useState<ConceptFile | null>(null)

  useEffect(() => {
    if (!activeId) { setActiveConcept(null); return }
    let cancelled = false
    getConceptFile(activeId).then(result => {
      if (cancelled) return
      setActiveConcept(result)
      const langs = Object.keys(result?.languages ?? {})
      setLang(prev => (prev && langs.includes(prev)) ? prev : langs[0])
    })
    return () => { cancelled = true }
  }, [activeId])

  const activeLangs = activeConcept ? Object.keys(activeConcept.languages) : []

  function selectConcept(id: string) {
    setActiveId(id)
  }

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9997] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 dark:bg-[#030408]/80 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        ref={ref}
        className="relative w-full max-w-6xl h-[85vh] rounded-[24px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] p-[1px] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-cyan-500/20 dark:from-indigo-500/40 dark:via-purple-500/20 dark:to-cyan-500/40"
      >
        {/* Inner container for clipping border */}
        <div className="relative w-full h-full bg-white/95 dark:bg-[#080A11]/95 backdrop-blur-2xl rounded-[23px] flex flex-col overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Header */}
          <header className="shrink-0 flex items-center justify-between gap-6 px-6 h-20 border-b border-slate-200 dark:border-white/[0.05] bg-slate-50/50 dark:bg-[#0A0D16]/50 relative z-10">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 border border-slate-200 dark:border-white/10">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 tracking-wide hidden sm:block drop-shadow-sm">Concept Explorer</h1>
            </div>

            <div className="flex-1 max-w-xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 dark:from-indigo-500/30 dark:via-purple-500/30 dark:to-cyan-500/30 rounded-full opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-500" />
              <div className="relative p-[1px] rounded-full bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 dark:from-indigo-600/80 dark:via-purple-500/80 dark:to-cyan-600/80 shadow-sm">
                <div className="relative flex items-center bg-white dark:bg-[#0D121E] rounded-full overflow-hidden">
                  <Search className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400 absolute left-4 transition-colors z-10" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search concepts..."
                    className="w-full pl-11 pr-10 py-2.5 bg-transparent text-[15px] text-slate-800 dark:text-slate-200 focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 relative z-0"
                  />
                  <AnimatePresence>
                    {query && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setQuery('')}
                        className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {activeLangs.length > 0 && (
              <div className="flex p-1 bg-slate-100 dark:bg-[#0A0D16] rounded-full items-center shadow-inner border border-slate-200/50 dark:border-white/[0.05] shrink-0">
                {activeLangs.map(l => {
                  const isActive = lang === l;
                  return (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`relative px-5 py-2 text-xs font-bold rounded-full transition-all duration-300 z-10 tracking-wide ${
                        isActive 
                          ? 'text-slate-900 dark:text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeLangTab"
                          className="absolute inset-0 bg-white dark:bg-[#161D2E] rounded-full shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] -z-10 border border-slate-200 dark:border-indigo-500/40"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <div className="absolute inset-0 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)] dark:shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[pulse_2.5s_ease-in-out_infinite] pointer-events-none" />
                        </motion.div>
                      )}
                      {LANG_LABEL[l] ?? l}
                    </button>
                  )
                })}
              </div>
            )}

            <button onClick={onClose} className="p-2.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 flex min-h-0 relative z-0">
            <div className="w-72 shrink-0 border-r border-slate-200 dark:border-white/[0.05] overflow-y-auto p-4 flex flex-col gap-2 bg-slate-50/50 dark:bg-[#0A0D16]/40 backdrop-blur-sm">
              {matches.map(id => {
                const c = getConceptMeta(id)
                const isActive = id === activeId
                return (
                  <button
                    key={id}
                    onClick={() => selectConcept(id)}
                    className={`flex items-center w-full text-left px-5 py-3.5 min-h-[44px] text-sm leading-relaxed rounded-full transition-all relative overflow-hidden group ${
                      isActive
                        ? 'bg-white dark:bg-[#121827] text-slate-900 dark:text-white font-semibold shadow-sm border border-slate-200 dark:border-indigo-500/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-[#121827]/50 font-medium border border-transparent'
                    }`}
                  >
                    {isActive && (
                      <>
                        <div className="absolute inset-0 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.3)] dark:shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[pulse_2.5s_ease-in-out_infinite] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 dark:from-indigo-500/10 to-transparent pointer-events-none" />
                      </>
                    )}
                    <span className="relative z-10">{c?.name ?? id}</span>
                  </button>
                )
              })}
              {matches.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No matches found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto relative bg-transparent dark:bg-[#080A11]">
              <div className="absolute inset-0 bg-grid-slate-900/[0.03] dark:bg-grid-slate-100/[0.01] bg-[bottom_1px_center] pointer-events-none" />
              <div className="max-w-4xl mx-auto py-10 px-10 relative">
                {activeId ? (
                  <motion.div
                    key={`${activeId}-${lang}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ConceptBlock id={activeId} lang={lang} embedded onNavigate={selectConcept} />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full pt-32">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#111622] flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5 shadow-sm">
                      <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 tracking-wide">No concept selected</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Search or choose a concept from the sidebar.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}
