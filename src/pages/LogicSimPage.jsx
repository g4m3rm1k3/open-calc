import { Suspense, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

const LogicSim = lazy(() => import('../components/viz/react/LogicSim.jsx'))

const PhoneGuard = ({ name }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <span className="text-5xl mb-4">🖥️</span>
    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Desktop &amp; Tablet Only</h2>
    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
      {name} requires a larger screen. Open it on a tablet or desktop for the full experience.
    </p>
  </div>
)

export default function LogicSimPage() {
  const navigate = useNavigate();
  if (window.innerWidth < 640) return <PhoneGuard name="Breadboard Lab" />

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 flex-shrink-0 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🔌</span> Breadboard &amp; Component Lab
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Suspense fallback={<div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>}>
          <LogicSim params={{}} />
        </Suspense>
      </div>
    </div>
  )
}
