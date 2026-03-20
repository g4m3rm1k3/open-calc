import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchContext } from '../../context/SearchContext.jsx'

export default function SearchModal() {
  const { isOpen, closeSearch, query, setQuery, results, isReady } = useSearchContext()
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen ? closeSearch() : useSearchContext
      }
      if (e.key === 'Escape' && isOpen) closeSearch()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, closeSearch])

  if (!isOpen) return null

  const handleSelect = (result) => {
    navigate(`/chapter/${result.item.chapterNumber}/${result.item.slug}`)
    closeSearch()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeSearch} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder={isReady ? 'Search lessons, topics, theorems…' : 'Loading search index…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none text-base"
            disabled={!isReady}
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-xs text-slate-500 font-mono">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length >= 2 && results.length === 0 && (
            <p className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
              No results for "{query}"
            </p>
          )}
          {query.length < 2 && (
            <p className="p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
              Type at least 2 characters to search…
            </p>
          )}
          {results.map((result) => (
            <button
              key={result.item.id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-4 px-5 py-3 text-left hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <div className="flex-shrink-0 mt-0.5">
                <span className="inline-block px-1.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                  Ch.{result.item.chapterNumber}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{result.item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.item.subtitle}</p>
              </div>
              <span className="text-slate-300 dark:text-slate-600 text-sm">→</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-400">
            {results.length > 0 ? `${results.length} results` : ''}
          </span>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
          </div>
        </div>
      </div>
    </div>
  )
}
