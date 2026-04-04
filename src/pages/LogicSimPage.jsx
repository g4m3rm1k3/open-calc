import { Suspense, lazy } from 'react'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

const LogicSim = lazy(() => import('../components/viz/react/LogicSim.jsx'))

export default function LogicSimPage() {
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
