import { Suspense, lazy } from 'react'
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
  if (window.innerWidth < 640) return <PhoneGuard name="Logic Gate Simulator" />

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Logic Gate Simulator</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Build and wire digital circuits. Drag gates, connect signals, and explore Boolean logic from NOT gates to half-adders.
        </p>
      </div>
      <Suspense fallback={<div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>}>
        <LogicSim params={{}} />
      </Suspense>
    </div>
  )
}
