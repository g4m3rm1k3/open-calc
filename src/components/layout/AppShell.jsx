import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import SearchModal from '../search/SearchModal.jsx'
import { useSearchContext } from '../../context/SearchContext.jsx'

function TopBar({ onMenuToggle }) {
  const { openSearch } = useSearchContext()
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('oc-theme', isDark ? 'dark' : 'light')
    setDark(isDark)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3">
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Brand (mobile) */}
      <span className="lg:hidden font-bold text-brand-600 dark:text-brand-400 text-lg">∂ OpenMath</span>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-1 items-center gap-6 ml-6 h-full">
        <a href="#/" className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-brand-600 transition-colors">Calculus</a>
        <a href="#/chapter/discrete-1" className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-brand-600 transition-colors">Discrete Math</a>
        
        <div className="flex items-center gap-1.5 opacity-50 cursor-not-allowed select-none">
           <span className="text-sm font-bold text-slate-500">DSA</span>
           <span className="text-[9px] uppercase tracking-widest font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 px-1 py-0.5 rounded">Soon</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-50 cursor-not-allowed select-none">
           <span className="text-sm font-bold text-slate-500">Linear Algebra</span>
           <span className="text-[9px] uppercase tracking-widest font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 px-1 py-0.5 rounded">Soon</span>
        </div>
      </nav>

      <div className="flex-1 lg:hidden" />

      {/* Search button */}
      <button
        onClick={openSearch}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline font-mono text-xs bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">⌘K</kbd>
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle dark mode"
      >
        {dark ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </header>
  )
}

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { openSearch } = useSearchContext()

  // Global keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openSearch])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopBar onMenuToggle={() => setSidebarOpen((o) => !o)} />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-[60px] left-0 bottom-0 z-50 w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="lg:pl-[280px] pt-[60px] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children ?? <Outlet />}
        </div>
      </main>

      <SearchModal />
    </div>
  )
}
