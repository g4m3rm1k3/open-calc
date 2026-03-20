import { useState } from 'react'
import KatexBlock from '../math/KatexBlock.jsx'
import MathStep from '../math/MathStep.jsx'
import VizFrame from '../viz/VizFrame.jsx'

export default function ExampleBlock({ example, number }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex-shrink-0">
            {number ?? 'Ex'}
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{example.title}</span>
        </div>
        <span className="text-slate-400 text-lg">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="p-5">
          {/* Problem */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Problem</p>
            <div className="bg-brand-50 dark:bg-brand-950/30 rounded-lg p-3">
              <KatexBlock expr={example.problem} />
            </div>
          </div>

          {/* Solution steps */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Solution</p>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {example.steps.map((step, i) => (
                <MathStep
                  key={i}
                  step={step}
                  stepNumber={step.expression ? i + 1 : undefined}
                />
              ))}
            </div>
          </div>

          {/* Inline visualization */}
          {example.visualizationId && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Visualization</p>
              <VizFrame id={example.visualizationId} initialProps={example.visualizationProps ?? {}} />
            </div>
          )}

          {/* Conclusion */}
          {example.conclusion && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Takeaway</p>
              <p className="text-sm text-emerald-800 dark:text-emerald-200">{example.conclusion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
