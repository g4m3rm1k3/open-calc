import { Link, useLocation } from 'react-router-dom'
import { Home, Compass, Calculator, Search, BookOpen, Layers } from 'lucide-react'

/**
 * MobileBottomNav - A persistent bottom navigation bar for mobile users.
 * Provides quick access to the main sections of the app.
 */
export default function MobileBottomNav({ onMenuToggle, onSearchOpen, onToolsToggle }) {
  const location = useLocation()
  
  const isCalcActive = location.pathname.startsWith('/chapter') || location.pathname.startsWith('/course')
  const isReferenceActive = location.pathname.startsWith('/reference')
  const isHomeActive = location.pathname === '/'

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        <Link 
          to="/"
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${isHomeActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'fill-brand-600/10' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </Link>
        
        <button 
          onClick={onMenuToggle}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${isCalcActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Compass className={`w-5 h-5 ${isCalcActive ? 'fill-brand-600/10' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Explore</span>
        </button>

        <button 
          onClick={onToolsToggle}
          className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Tools</span>
        </button>

        <button 
          onClick={onSearchOpen}
          className="flex flex-col items-center gap-1 p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Search</span>
        </button>

        <Link 
          to="/reference"
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${isReferenceActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <BookOpen className={`w-5 h-5 ${isReferenceActive ? 'fill-amber-600/10' : ''}`} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ref</span>
        </Link>
      </div>
    </nav>
  )
}
