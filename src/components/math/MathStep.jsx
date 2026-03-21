import KatexBlock from './KatexBlock.jsx'
import { parseProse } from '../lesson/IntegratedLesson.jsx'

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
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 italic leading-snug">
            {parseProse(step.annotation)}
          </p>
        )}
      </div>
    </div>
  )
}
