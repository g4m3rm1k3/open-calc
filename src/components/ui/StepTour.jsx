import { useState } from 'react'

/**
 * Reusable multi-step "card with progress dots, Next/Skip" tour.
 * Used by the app-wide welcome tour, the AI tutor's first-open intro, and the
 * Lesson Builder's first-open tour — one implementation instead of three.
 *
 * @param {{title: string, body: string, action?: {label: string, onClick: () => void}}[]} steps
 * @param {() => void} onDone - called on Skip, or after the last step's button
 * @param {string} [finalLabel] - button label on the last step (default "Done")
 */
export default function StepTour({ steps, onDone, finalLabel = 'Done' }) {
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1
  const { title, body, action } = steps[step]

  return (
    <div className="flex-1 flex flex-col p-6 justify-between min-h-0">
      <div>
        <div className="flex items-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-4 px-4 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={onDone}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Skip
        </button>
        <button
          onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
        >
          {isLast ? finalLabel : 'Next'}
        </button>
      </div>
    </div>
  )
}
