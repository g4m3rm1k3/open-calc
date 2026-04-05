import { useState } from 'react'
import UniversalCalcExplainer from '../components/tools/UniversalCalcExplainer.jsx'
import VizFrame from '../components/viz/VizFrame.jsx'

const PhoneGuard = () => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <span className="text-5xl mb-4">🖥️</span>
    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Desktop &amp; Tablet Only</h2>
    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
      The Calculus Explainer requires a larger screen. Open it on a tablet or desktop for the full experience.
    </p>
  </div>
)

export default function UniversalCalcPage() {
  const [activeTab, setActiveTab] = useState('explainer')

  if (window.innerWidth < 640) return <PhoneGuard />

  return (
    <div className="py-2">
      <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('explainer')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'explainer' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Dynamic Explainer
        </button>
        <button
          onClick={() => setActiveTab('solver')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'solver' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Combined Rules Solver
        </button>
        <button
          onClick={() => setActiveTab('coach')}
          className={`pb-2 px-1 text-sm font-semibold transition-colors ${activeTab === 'coach' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Derivative Coach
        </button>
      </div>

      {activeTab === 'explainer' ? (
        <UniversalCalcExplainer />
      ) : activeTab === 'solver' ? (
        <div className="space-y-8">
          <VizFrame 
            id="CombinedDerivativeSolver" 
            title="The PEMDAS of Differentiation"
          />
        </div>
      ) : (
        <div className="space-y-8">
          <VizFrame
            id="DerivativeCoach"
            title="Derivative Coach"
          />
        </div>
      )}
    </div>
  )
}
