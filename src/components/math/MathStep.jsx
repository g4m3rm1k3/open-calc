import KatexBlock from './KatexBlock.jsx'
import { parseProse } from './parseProse.jsx'

function fallbackExplanation(expr) {
  if (!expr) return 'Name what changed and why that move is legal before continuing.'

  if (expr.includes('\\lim')) {
    return 'This step evaluates or transforms a limit by using a valid law, substitution, or an equivalent expression.'
  }
  if (expr.includes('\\frac')) {
    return 'This rewrites the relationship as a ratio so you can track how one quantity changes relative to another.'
  }
  if (expr.includes('=')) {
    return 'This line is algebraically equivalent to the previous one, so the value is preserved while the form becomes easier to use.'
  }
  if (expr.includes('\\sin') || expr.includes('\\cos') || expr.includes('\\tan')) {
    return 'This uses a trig identity or derivative pattern; identify the outer structure and any inner function before differentiating.'
  }
  if (expr.includes('\\cdot')) {
    return 'This combines factors from earlier results; check where each factor came from and why multiplication is justified here.'
  }
  if (expr.includes('\\sqrt')) {
    return 'This step rewrites a radical form to expose structure you can simplify or differentiate safely.'
  }
  return 'This is a legal transformation that preserves meaning while moving toward a form you can evaluate or prove.'
}

export default function MathStep({ step, stepNumber }) {
  if (!step.expression) {
    // Divider row — annotation may contain inline math
    return (
      <div className="py-2 px-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
        {step.annotation ? parseProse(step.annotation) : null}
      </div>
    )
  }

  const explanation = step.annotation ?? fallbackExplanation(step.expression)

  return (
    <div className="relative flex items-start gap-4 p-4 bg-white/80 dark:bg-slate-900/80 rounded-2xl border-2 border-brand-200/40 dark:border-brand-900/40 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      {stepNumber !== undefined && (
        <div className="flex flex-col items-center mr-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-500/80 text-white font-bold text-lg shadow-md border-2 border-white dark:border-slate-900 z-10">
            {stepNumber}
          </div>
          <div className="flex-1 w-1 bg-brand-200/60 dark:bg-brand-900/40 mt-1 rounded-full" style={{ minHeight: '24px' }} />
        </div>
      )}
      <div className="flex-1 min-w-0 overflow-x-auto">
        <KatexBlock expr={step.expression} className="!py-1" />
        <div className="mt-1 rounded-md bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-0.5">What and why</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-snug">
            {parseProse(explanation)}
          </p>
        </div>
      </div>
    </div>
  )
}
