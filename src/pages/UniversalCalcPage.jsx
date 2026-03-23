import { useState } from 'react'
import UniversalCalcExplainer from '../components/tools/UniversalCalcExplainer.jsx'
import VizFrame from '../components/viz/VizFrame.jsx'

export default function UniversalCalcPage() {
  const [activeTab, setActiveTab] = useState('explainer')

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
      </div>

      {activeTab === 'explainer' ? (
        <UniversalCalcExplainer />
      ) : (
        <div className="space-y-8">
          <VizFrame 
            id="CombinedDerivativeSolver" 
            title="The PEMDAS of Differentiation"
          />
        </div>
      )}
    </div>
  )
}
