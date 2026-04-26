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
    <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-[60] bg-white/70 dark:bg-slate-950/60 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 px-2">
      <div className="flex items-center justify-around h-14">
        <Link 
          to="/"
          className={`flex flex-col items-center gap-1 p-2 transition-all ${isHomeActive ? 'text-indigo-600 dark:text-white scale-110' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Home className={`w-4 h-4 ${isHomeActive ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[8px] font-black uppercase tracking-widest">Home</span>
        </Link>
        
        <button 
          onClick={onMenuToggle}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${isCalcActive ? 'text-indigo-600 dark:text-white scale-110' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Compass className={`w-4 h-4 ${isCalcActive ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[8px] font-black uppercase tracking-widest">Explore</span>
        </button>

        <button 
          onClick={onToolsToggle}
          className="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">Tools</span>
        </button>

        <button 
          onClick={onSearchOpen}
          className="flex flex-col items-center gap-1 p-2 text-slate-400 dark:text-slate-500"
        >
          <Search className="w-4 h-4" />
          <span className="text-[8px] font-black uppercase tracking-widest">Search</span>
        </button>

        <Link 
          to="/reference"
          className={`flex flex-col items-center gap-1 p-2 transition-all ${isReferenceActive ? 'text-amber-500 dark:text-amber-400 scale-110' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <BookOpen className={`w-4 h-4 ${isReferenceActive ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[8px] font-black uppercase tracking-widest">Ref</span>
        </Link>
      </div>
    </nav>
  )
}
