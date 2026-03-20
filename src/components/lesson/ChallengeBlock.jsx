import KatexBlock from '../math/KatexBlock.jsx'
import MathStep from '../math/MathStep.jsx'
import Spoiler from '../ui/Spoiler.jsx'

const DIFFICULTY_COLORS = {
  easy: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

export default function ChallengeBlock({ challenge, number }) {
  return (
    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-5 mb-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 dark:bg-slate-500 text-white text-xs font-bold flex-shrink-0">
          {number ?? '?'}
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">Challenge Problem</span>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${DIFFICULTY_COLORS[challenge.difficulty] ?? DIFFICULTY_COLORS.medium}`}>
          {challenge.difficulty}
        </span>
      </div>

      {/* Problem */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mb-4">
        <KatexBlock expr={challenge.problem} />
      </div>

      {/* Hint */}
      {challenge.hint && (
        <Spoiler label="Show hint">
          <p className="text-sm text-slate-600 dark:text-slate-400 italic">{challenge.hint}</p>
        </Spoiler>
      )}

      {/* Full walkthrough */}
      <Spoiler label="Show full walkthrough">
        <div className="divide-y divide-slate-100 dark:divide-slate-800 mb-3">
          {challenge.walkthrough.map((step, i) => (
            <MathStep key={i} step={step} stepNumber={step.expression ? i + 1 : undefined} />
          ))}
        </div>
        <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-lg p-3">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            Answer: {challenge.answer}
          </p>
        </div>
      </Spoiler>
    </div>
  )
}
