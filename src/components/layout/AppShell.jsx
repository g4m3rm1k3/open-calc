import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import SearchModal from '../search/SearchModal.jsx'
import GlobalGrapher from '../ui/GlobalGrapher.jsx'
import GlobalGrapher3D from '../ui/GlobalGrapher3D.jsx'
import GlobalGrapherJSX from '../ui/GlobalGrapherJSX.jsx'
import { useSearchContext } from '../../context/SearchContext.jsx'
import { Activity, Box, Settings2 } from 'lucide-react'

function TopBar({ onMenuToggle, onGraphToggle, onGraph3DToggle, onGraphJSXToggle }) {
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
        <a href="#/chapter/precalc-1" className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-brand-600 transition-colors">Pre-Calc</a>
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

      {/* Graph Utility buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onGraphToggle}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800/50"
          title="Open 2D Grapher (G)"
        >
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline font-medium text-[11px] uppercase tracking-tighter">2D</span>
        </button>

        <button
          onClick={onGraph3DToggle}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors border border-amber-100 dark:border-amber-800/50"
          title="Open 3D Plotter (3)"
        >
          <Box className="w-4 h-4" />
          <span className="hidden sm:inline font-medium text-[11px] uppercase tracking-tighter">3D</span>
        </button>

        <button
          onClick={onGraphJSXToggle}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-800/50"
          title="Open JSXGraph Pro (X)"
        >
          <Settings2 className="w-4 h-4" />
          <span className="hidden sm:inline font-medium text-[11px] uppercase tracking-tighter">Pro</span>
        </button>
      </div>

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
  const [graphOpen, setGraphOpen] = useState(false)
  const [graph3DOpen, setGraph3DOpen] = useState(false)
  const [graphJSXOpen, setGraphJSXOpen] = useState(false)
  const { openSearch } = useSearchContext()

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // CMD/CTRL + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }
      // 'g' key for graph (if not in an input)
      if (e.key.toLowerCase() === 'g' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setGraphOpen(prev => !prev)
        if (!graphOpen) { setGraph3DOpen(false); setGraphJSXOpen(false); }
      }
      // '3' key for 3D plotter
      if (e.key === '3' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setGraph3DOpen(prev => !prev)
        if (!graph3DOpen) { setGraphOpen(false); setGraphJSXOpen(false); }
      }
      // 'x' key for JSXGraph Pro
      if (e.key.toLowerCase() === 'x' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setGraphJSXOpen(prev => !prev)
        if (!graphJSXOpen) { setGraphOpen(false); setGraph3DOpen(false); }
      }
      // 'Escape' to close modals
      if (e.key === 'Escape') {
        setGraphOpen(false)
        setGraph3DOpen(false)
        setGraphJSXOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [openSearch, graphOpen, graph3DOpen, graphJSXOpen])

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <TopBar 
        onMenuToggle={() => setSidebarOpen((o) => !o)} 
        onGraphToggle={() => setGraphOpen(prev => !prev)}
        onGraph3DToggle={() => setGraph3DOpen(prev => !prev)}
        onGraphJSXToggle={() => setGraphJSXOpen(prev => !prev)}
      />

      {/* Mobile sidebar backdrop */}
      {(sidebarOpen || graphOpen || graph3DOpen || graphJSXOpen) && (
        <div
          className="fixed inset-0 z-[45] bg-black/30 backdrop-blur-sm"
          onClick={() => {
            setSidebarOpen(false)
            setGraphOpen(false)
            setGraph3DOpen(false)
            setGraphJSXOpen(false)
          }}
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
      <GlobalGrapher 
        isOpen={graphOpen} 
        onClose={() => setGraphOpen(false)} 
        onSwitchTo3D={() => {
          setGraphOpen(false)
          setGraph3DOpen(true)
        }}
        onSwitchToJSX={() => {
          setGraphOpen(false)
          setGraphJSXOpen(true)
        }}
      />
      <GlobalGrapher3D 
        isOpen={graph3DOpen} 
        onClose={() => setGraph3DOpen(false)} 
        onSwitchTo2D={() => {
          setGraph3DOpen(false)
          setGraphOpen(true)
        }}
        onSwitchToJSX={() => {
          setGraph3DOpen(false)
          setGraphJSXOpen(true)
        }}
      />
      <GlobalGrapherJSX
        isOpen={graphJSXOpen}
        onClose={() => setGraphJSXOpen(false)}
        onSwitchTo2D={() => {
          setGraphJSXOpen(false)
          setGraphOpen(true)
        }}
        onSwitchTo3D={() => {
          setGraphJSXOpen(false)
          setGraph3DOpen(true)
        }}
      />
    </div>
  )
}
