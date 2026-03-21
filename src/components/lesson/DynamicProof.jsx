/**
 * DynamicProof — interactive proof step scrubber with optional synced visualization.
 * Used inside the Rigor section. Steps through algebra/proof steps one at a time,
 * with an optional visualization that receives `currentStep` to stay in sync.
 */
import { useState } from 'react'
import KatexBlock from '../math/KatexBlock.jsx'
import { parseProse } from '../math/parseProse.jsx'
import VizFrame from '../viz/VizFrame.jsx'

export default function DynamicProof({ steps = [], visualizationId, visualizationProps = {}, title }) {
  const [current, setCurrent] = useState(0)
  const max = steps.length - 1

  if (!steps.length) return null

  const step = steps[current]

  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden">
      {title && (
        <div className="px-5 py-3 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-800">
          <p className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">{title}</p>
        </div>
      )}

      <div className={`flex flex-col ${visualizationId ? 'lg:flex-row' : ''}`}>
        {/* Algebra / proof step */}
        <div className={`${visualizationId ? 'lg:w-1/2' : 'w-full'} p-5 flex flex-col justify-center min-h-[140px] bg-white dark:bg-[#0f172a]`}>
          {step.expression && (
            <div className="overflow-x-auto mb-3">
              <KatexBlock expr={step.expression} />
            </div>
          )}
          {step.annotation && (
            <p className="text-sm italic text-slate-500 dark:text-slate-400 leading-relaxed">
              {parseProse(step.annotation)}
            </p>
          )}
        </div>

        {/* Synced interactive visual */}
        {visualizationId && (
          <div className="lg:w-1/2 border-t lg:border-t-0 lg:border-l border-purple-100 dark:border-purple-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
            <VizFrame
              id={visualizationId}
              initialProps={{ ...visualizationProps, currentStep: current }}
              title={null}
            />
          </div>
        )}
      </div>

      {/* Step controls */}
      <div className="px-5 py-4 bg-purple-50/60 dark:bg-purple-950/20 border-t border-purple-100 dark:border-purple-800 flex flex-col items-center gap-3">
        <div className="flex justify-between w-full text-xs font-semibold text-purple-400 dark:text-purple-500 uppercase tracking-widest">
          <span>Step 1</span>
          <span className="text-purple-600 dark:text-purple-300 font-bold">
            {current + 1} / {steps.length}
          </span>
          <span>Step {steps.length}</span>
        </div>
        <input
          type="range"
          min={0}
          max={max}
          value={current}
          onChange={e => setCurrent(+e.target.value)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex gap-3">
          <button
            disabled={current === 0}
            onClick={() => setCurrent(s => Math.max(0, s - 1))}
            className="px-4 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 disabled:opacity-30 font-medium text-sm hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
          >
            ← Prev
          </button>
          <button
            disabled={current === max}
            onClick={() => setCurrent(s => Math.min(max, s + 1))}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-30 font-medium text-sm transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
