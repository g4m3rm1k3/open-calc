import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, MapPin, Search, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * MobileBottomNav - A persistent bottom navigation bar for mobile users.
 * Provides quick access to the main sections of the app with animated indicators.
 */
export default function MobileBottomNav({ onSearchOpen }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isExploreActive = location.pathname.startsWith('/chapter') || location.pathname.startsWith('/course') || location.pathname.startsWith('/courses')
  const isReferenceActive = location.pathname.startsWith('/reference')
  const isHomeActive = location.pathname === '/'
  const isCompassActive = location.pathname.startsWith('/compass')

  const NavItem = ({ active, onClick, icon: Icon, label, activeColor, dataTour }) => (
    <motion.button
      data-tour={dataTour}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center flex-1 h-16 ${active ? activeColor : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
    >
      {active && (
        <motion.div
          layoutId="mobileNavIndicator"
          className="absolute inset-x-2 top-2 bottom-2 rounded-2xl bg-current opacity-10 dark:opacity-20"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <Icon className={`w-5 h-5 relative z-10 transition-all duration-300 ${active ? 'stroke-[2.5px] -translate-y-1' : ''}`} />
      <span className={`text-[10px] font-bold tracking-wide relative z-10 transition-all duration-300 absolute bottom-2.5 ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        {label}
      </span>
    </motion.button>
  )

  return (
    <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-[60]">
      {/* Glow effect behind the nav */}
      <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 blur-2xl rounded-full" />
      
      <div className="relative flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-1">
        <NavItem 
          active={isHomeActive} 
          onClick={() => navigate('/')} 
          icon={Home} 
          label="Home" 
          activeColor="text-brand-600 dark:text-brand-400" 
        />
        
        <NavItem
          dataTour="explore-mobile"
          active={isExploreActive}
          onClick={() => navigate('/courses')}
          icon={BookOpen}
          label="Explore"
          activeColor="text-indigo-600 dark:text-indigo-400"
        />

        {/* Compass — center prominent button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/compass')}
          className={`relative flex flex-col items-center justify-center flex-1 h-16 ${isCompassActive ? 'text-sky-500' : 'text-slate-400 dark:text-slate-500'}`}
        >
          {isCompassActive && (
            <motion.div
              layoutId="mobileNavIndicator"
              className="absolute inset-x-2 top-2 bottom-2 rounded-2xl bg-current opacity-10 dark:opacity-20"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <MapPin className={`w-5 h-5 relative z-10 transition-all duration-300 ${isCompassActive ? 'stroke-[2.5px] -translate-y-1' : ''}`} />
          <span className={`text-[10px] font-bold tracking-wide relative z-10 transition-all duration-300 absolute bottom-2.5 ${isCompassActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            Compass
          </span>
        </motion.button>
        
<NavItem 
          active={false} 
          onClick={onSearchOpen} 
          icon={Search} 
          label="Search" 
          activeColor="text-slate-900 dark:text-white" 
        />
      </div>
    </nav>
  )
}
