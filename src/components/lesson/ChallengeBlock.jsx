import KatexBlock from '../math/KatexBlock.jsx'
import KatexInline from '../math/KatexInline.jsx'
import MathStep from '../math/MathStep.jsx'
import Spoiler from '../ui/Spoiler.jsx'

function isLikelyInlineMath(expr) {
  const t = expr.trim()
  if (!t) return false
  if (/^\d+(?:[.,]\d+)?$/.test(t)) return false
  if (/^[\d,]+(?:\.\d+)?$/.test(t)) return false
  return /[\\^_{}=<>+\-*/()|]|\b(?:lim|sin|cos|tan|log|ln|sqrt|frac|Delta|varepsilon|theta|pi|int|sum|prod)\b/i.test(t)
}

// Render text that might be mixed prose + $inline LaTeX$ + \\display LaTeX
function ProblemText({ text }) {
  if (!text) return null
  // Pure display LaTeX: starts with \ or contains no spaces and has LaTeX commands
  const isPureLatex = text.trim().startsWith('\\') || (!/\s/.test(text.trim()) && /[\\^_{}]/.test(text))
  if (isPureLatex) return <KatexBlock expr={text} />

  // Mixed prose: parse $...$ inline LaTeX and **bold**
  const parts = []
  let i = 0
  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) {
        parts.push(<strong key={`b${i}`}>{text.slice(i + 2, end)}</strong>)
        i = end + 2
        continue
      }
    }

    if (text[i] === '$') {
      const end = text.indexOf('$', i + 1)
      if (end !== -1) {
        const candidate = text.slice(i + 1, end)
        if (isLikelyInlineMath(candidate)) {
          parts.push(<KatexInline key={`k${i}`} expr={candidate} />)
          i = end + 1
          continue
        }
      }
      parts.push('$')
      i += 1
      continue
    }

    const nextBold = text.indexOf('**', i)
    const nextDollar = text.indexOf('$', i)
    const next = [nextBold, nextDollar].filter((v) => v !== -1)
    const stop = next.length ? Math.min(...next) : text.length
    if (stop > i) parts.push(text.slice(i, stop))
    i = stop
  }
  return <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{parts}</p>
}

const DIFFICULTY_COLORS = {
  easy: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  hard: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
}

export default function ChallengeBlock({ challenge, number }) {
  const normalizedWalkthrough = (challenge.walkthrough ?? []).map((step) => {
    if (typeof step === 'string') return { annotation: step }
    return step
  })

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
        <ProblemText text={challenge.problem} />
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
          {normalizedWalkthrough.map((step, i) => (
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
