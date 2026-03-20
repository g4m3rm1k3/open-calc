import KatexBlock from './KatexBlock.jsx'

export default function MathStep({ step, stepNumber }) {
  if (!step.expression) {
    // Divider row
    return (
      <div className="py-2 px-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
        {step.annotation}
      </div>
    )
  }

  return (
    <div className="step-row">
      {stepNumber !== undefined && (
        <div className="step-number flex-shrink-0">{stepNumber}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="overflow-x-auto">
          <KatexBlock expr={step.expression} className="!py-1" />
        </div>
        {step.annotation && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 italic leading-snug">
            {step.annotation}
          </p>
        )}
      </div>
    </div>
  )
}
