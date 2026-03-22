import KatexBlock from './KatexBlock.jsx'
import { parseProse } from './parseProse.jsx'

export default function MathStep({ step, stepNumber }) {
  if (!step.expression) {
    // Divider row — annotation may contain inline math
    return (
      <div className="py-2 px-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
        {step.annotation ? parseProse(step.annotation) : null}
      </div>
    )
  }

  return (
    <div className="step-row">
      {stepNumber !== undefined && (
        <div className="step-number flex-shrink-0">{stepNumber}</div>
      )}
      <div className="flex-1 min-w-0 overflow-x-auto">
        <KatexBlock expr={step.expression} className="!py-1" />
        {step.annotation && (
          <div className="mt-1 rounded-md bg-slate-100 dark:bg-slate-800/70 px-2 py-1.5">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Why this move?</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-snug">
              {parseProse(step.annotation)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
