import { useState } from 'react'
import KatexBlock from '../math/KatexBlock.jsx'
import KatexInline from '../math/KatexInline.jsx'
import MathStep from '../math/MathStep.jsx'
import MarkdownProse from '../math/MarkdownProse.jsx'
import Spoiler from '../ui/Spoiler.jsx'
import { parseProse } from '../math/parseProse.jsx'

function PrereqBox({ prereq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2 rounded-lg border border-violet-200 dark:border-violet-800/60 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors text-left"
      >
        <span className="text-violet-500 text-xs">📖</span>
        <span className="flex-1 text-[10px] font-black uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
          Don&apos;t know how to do this step? Open prereq
        </span>
        <span className="text-[10px] font-semibold text-violet-500 dark:text-violet-400">
          {open ? 'Close ▲' : 'Open ▼'}
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-violet-100 dark:border-violet-900/40">
          <MarkdownProse text={prereq} />
        </div>
      )}
    </div>
  )
}

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

  // Icon based on difficulty
  const DIFFICULTY_ICONS = {
    easy: '🌱',
    medium: '🚀',
    hard: '🔥',
  }
  const difficulty = challenge.difficulty || 'medium'
  const icon = DIFFICULTY_ICONS[difficulty] || '⭐'

  return (
    <div className="relative mx-4 lg:mx-0 mb-6 rounded-3xl shadow-2xl border border-slate-200/40 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-3xl overflow-hidden transition-all">
      {/* Softer glassy header with subtle gradient */}
      <div className="px-4 py-4 sm:px-8 sm:py-6 flex items-center justify-between gap-2 bg-gradient-to-r from-brand-400/20 via-white/10 to-emerald-300/10 dark:from-brand-900/20 dark:via-slate-900/10 dark:to-emerald-900/10 border-b border-brand-200/20 dark:border-brand-800/20 shadow-md backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-2xl shadow-lg border-2 border-brand-200/40 dark:border-brand-800/40 backdrop-blur-md">
            {icon}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-700 dark:text-brand-200 opacity-90">Challenge Milestone</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">#{number ?? '?'}</div>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-md border-2 ${DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.medium}`}
          style={{ letterSpacing: '0.18em', background: 'rgba(255,255,255,0.30)', backdropFilter: 'blur(8px)' }}>
          {difficulty}
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
        {/* Problem */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-5 mb-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm backdrop-blur-md">
          <MarkdownProse text={challenge.problem} className="text-base leading-relaxed text-slate-700 dark:text-slate-300" />
        </div>

        {/* Hint */}
        {challenge.hint && (
          <Spoiler label="💡 Show hint">
            <MarkdownProse text={challenge.hint} className="text-base text-slate-600 dark:text-slate-300 italic leading-relaxed" />
          </Spoiler>
        )}

        {/* Full walkthrough (unstyled, no extra backgrounds) */}
        <Spoiler label="🧩 Show full walkthrough">
          <div className="mb-4 flex flex-col gap-2">
            {normalizedWalkthrough.map((step, i) => (
              <MathStep key={i} step={step} stepNumber={step.expression ? i + 1 : undefined} />
            ))}
          </div>
          <div className="bg-white/80 dark:bg-slate-900/80 border border-brand-200/40 dark:border-brand-800/40 rounded-xl p-4 mt-2 shadow backdrop-blur-md">
            <span className="mr-2">✅</span>
            <span className="text-base font-bold text-brand-700 dark:text-brand-200 leading-relaxed">
              Answer:
            </span>
            <MarkdownProse text={String(challenge.answer ?? '')} className="inline ml-2" />
          </div>
        </Spoiler>
      </div>
    </div>
  )
}
