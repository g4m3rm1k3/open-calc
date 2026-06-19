export const meta = {
  title: 'Lesson Quiz Block',
  description: 'Renders and grades the quiz for any lesson. Stores per-question correct/incorrect state in ProgressContext so answers survive navigation and sync to Firebase.',
  concept: 'Derived State',
  conceptDetail: 'Score is always computed from question states — never stored separately. This means there is no stale counter. The single source of truth is the question state map.',
}

import { useState, useCallback, useEffect } from 'react'
import { evaluate as mathEval, simplify as mathSimplify } from 'mathjs'
import { useProgress } from '../../hooks/useProgress.js'
import { parseProse } from '../math/parseProse.jsx'

const MATH_TYPING_GUIDE = (
  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
    <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">How to type math:</p>
    <p><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">x^2</code> for x² &nbsp;·&nbsp; <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">sqrt(x)</code> for √x</p>
    <p><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">2*x</code> for 2x &nbsp;·&nbsp; <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">1/3</code> for fractions</p>
    <p><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">pi</code> for π &nbsp;·&nbsp; <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">e</code> for Euler's number</p>
  </div>
)

function evaluateAnswer(userRaw, correctRaw) {
  if (!userRaw?.trim()) return false
  const user = userRaw.trim()
  const correct = correctRaw.trim()

  if (user.toLowerCase() === correct.toLowerCase()) return true

  try {
    const scope = { x: 2.7183, t: 1.4142, n: 3 }
    const uVal = mathEval(user, { ...scope })
    const cVal = mathEval(correct, { ...scope })

    if (typeof uVal === 'number' && typeof cVal === 'number') {
      if (Math.abs(uVal - cVal) < 1e-6) return true
    }

    const diff = mathSimplify(`(${user}) - (${correct})`)
    const diffVal = mathEval(diff.toString(), { ...scope })
    if (typeof diffVal === 'number' && Math.abs(diffVal) < 1e-6) return true
  } catch (_) {
    // fall through
  }

  const norm = (s) => s.toLowerCase().replace(/\s/g, '').replace(/^\((.+)\)$/, '$1')
  return norm(user) === norm(correct)
}

function normalizeQuestion(q) {
  const type = q.type ?? 'choice'
  const text = q.text ?? q.question ?? ''
  const answerIndex = typeof q.answer === 'number' ? q.answer
    : (typeof q.correct === 'number' ? q.correct : undefined)
  const answer = typeof answerIndex === 'number' && Array.isArray(q.options)
    ? q.options[answerIndex]
    : (q.answer ?? q.correct)
  const hints = q.hints ?? (q.explanation ? [q.explanation] : [])
  return { ...q, type, text, answer, hints }
}

// state shape per question: { selected, inputVal, hintLevel, submitted, correct }
function QuizQuestion({ q: rawQ, index, state, onChange }) {
  const q = normalizeQuestion(rawQ)
  const { selected = null, inputVal = '', hintLevel = -1, submitted = false, correct = null } = state ?? {}

  const hints = q.hints ?? []
  const allHints = q.type === 'input' ? [null, ...hints] : hints

  const handleSubmit = () => {
    const userAnswer = q.type === 'choice' ? selected : inputVal
    const isCorrect = evaluateAnswer(userAnswer, String(q.answer))
    onChange(index, { selected, inputVal, hintLevel, submitted: true, correct: isCorrect })
  }

  const borderColor = submitted
    ? correct ? 'border-emerald-400 dark:border-emerald-600' : 'border-red-400 dark:border-red-600'
    : 'border-slate-200 dark:border-slate-700'

  return (
    <div className={`rounded-3xl border-2 ${borderColor} bg-white dark:bg-slate-900 p-6 transition-all duration-300 shadow-sm hover:shadow-premium`}>
      <div className="flex items-start gap-3">
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
          submitted
            ? correct
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
        }`}>
          {submitted ? (correct ? '✓' : '✗') : index + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3 leading-relaxed">
            {parseProse(q.text)}
          </p>

          {q.type === 'choice' ? (
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i)
                const isSelected = selected === opt
                let optStyle = 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer'
                if (submitted) {
                  if (isSelected && correct) optStyle = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-600'
                  else if (isSelected && !correct) optStyle = 'border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-600'
                  else optStyle = 'border-slate-200 dark:border-slate-700 opacity-50'
                } else if (isSelected) {
                  optStyle = 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 dark:border-brand-500 cursor-pointer'
                }
                return (
                  <button
                    key={i}
                    disabled={submitted}
                    onClick={() => !submitted && onChange(index, { selected: opt, inputVal, hintLevel, submitted: false, correct: null })}
                    className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-400 ${optStyle}`}
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold mt-0.5">
                      {letter}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{parseProse(opt)}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <input
              type="text"
              value={inputVal}
              onChange={(e) => !submitted && onChange(index, { selected, inputVal: e.target.value, hintLevel, submitted: false, correct: null })}
              onKeyDown={(e) => { if (e.key === 'Enter' && !submitted) handleSubmit() }}
              disabled={submitted}
              placeholder="Type your answer…"
              className={`w-full px-3 py-2 rounded-lg border text-sm font-mono bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none transition-colors ${
                submitted
                  ? correct ? 'border-emerald-400 dark:border-emerald-600' : 'border-red-400 dark:border-red-600'
                  : 'border-slate-300 dark:border-slate-600 focus:border-brand-400 dark:focus:border-brand-500'
              }`}
            />
          )}

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {!submitted ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={(q.type === 'choice' && !selected) || (q.type === 'input' && !inputVal.trim())}
                  className="oc-btn-premium px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white text-xs font-black uppercase tracking-widest shadow-md disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
                {allHints.length > 0 && hintLevel < allHints.length - 1 && (
                  <button
                    onClick={() => onChange(index, { selected, inputVal, hintLevel: Math.min(hintLevel + 1, allHints.length - 1), submitted, correct })}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    💡 Hint {hintLevel + 2 <= allHints.length ? `(${hintLevel + 2}/${allHints.length})` : ''}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold ${correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {correct ? 'Correct' : 'Incorrect — try again'}
                </span>
                {!correct && (
                  <button
                    onClick={() => onChange(index, { selected: null, inputVal: '', hintLevel: -1, submitted: false, correct: null })}
                    className="text-xs text-brand-600 dark:text-brand-400 underline underline-offset-2 hover:text-brand-700"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}

            {submitted && !correct && q.reviewSection && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Review: <span className="font-medium text-brand-600 dark:text-brand-400">{q.reviewSection}</span>
              </span>
            )}
          </div>

          {hintLevel >= 0 && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              {allHints[hintLevel] === null ? MATH_TYPING_GUIDE : parseProse(allHints[hintLevel])}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LessonQuizBlock({ lessonId, questions }) {
  const { setQuizScore, markCheckpoint, setQuizStates, getQuizStates } = useProgress()
  const total = questions.length

  // Question states live inside oc-progress so they sync to Firebase automatically.
  const [questionStates, setQuestionStates] = useState(() => getQuizStates(lessonId))

  useEffect(() => {
    setQuestionStates(getQuizStates(lessonId))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  // Derive score directly from question state — never from a separate counter.
  const submitted = Object.entries(questionStates).filter(([, s]) => s.submitted)
  const correct = submitted.filter(([, s]) => s.correct).length
  const attempted = submitted.length
  const allAttempted = attempted === total

  // Keep ProgressContext score in sync whenever the derived score changes.
  useEffect(() => {
    if (attempted > 0) {
      setQuizScore(lessonId, correct, attempted, total)
    }
    if (allAttempted && correct === total) {
      markCheckpoint(lessonId, 'quiz-passed')
    }
  }, [lessonId, correct, attempted, allAttempted, total, setQuizScore, markCheckpoint])

  const handleQuestionChange = useCallback((index, newState) => {
    setQuestionStates(prev => {
      const next = { ...prev, [index]: newState }
      setQuizStates(lessonId, next)
      return next
    })
  }, [lessonId, setQuizStates])

  const scorePct = allAttempted ? correct / total : null
  const masteryLabel = scorePct === null ? null :
    scorePct >= 1
      ? { text: 'Complete', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' }
      : scorePct >= 0.6
        ? { text: 'Partial Credit', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' }
        : { text: 'Needs Review', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' }

  return (
    <section className="mt-20 mx-4 lg:mx-0 oc-shell-card overflow-hidden">
      {/* Header row */}
      <div className="oc-header-gradient px-4 py-5 sm:px-8 sm:py-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 shadow-sm flex items-center justify-center text-xl">
              🎯
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Lesson Quiz</h2>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {total} questions · All correct to complete
          </p>
        </div>

        {/* Score display — always derives from persistent question state */}
        <div className="flex flex-col items-end gap-1.5">
          {attempted > 0 && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-slate-100">
                {correct}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pt-1">
                / {total} Correct
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 pr-2">
            <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${(attempted / total) * 100}%` }} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {attempted}/{total} Answered
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6 bg-slate-50/30 dark:bg-slate-950/20">
        {questions.map((q, i) => (
          <QuizQuestion
            key={`${lessonId}-${q.id ?? i}`}
            q={q}
            index={i}
            state={questionStates[i]}
            onChange={handleQuestionChange}
          />
        ))}
      </div>

      {/* Result banner — only after all questions answered */}
      {allAttempted && masteryLabel && (
        <div className={`mt-6 p-4 rounded-xl border ${masteryLabel.bg}`}>
          <p className={`font-semibold ${masteryLabel.color}`}>
            {correct}/{total} correct — {masteryLabel.text}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {scorePct < 0.6
              ? 'Go back through the lesson tabs, then retry the questions you missed.'
              : scorePct < 1
                ? 'Review the sections flagged above, then retry the incorrect questions.'
                : 'This lesson is marked complete in your progress.'}
          </p>
        </div>
      )}

      {/* Encouragement while quiz is in progress */}
      {!allAttempted && attempted > 0 && attempted < total && (
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
          {total - attempted} question{total - attempted !== 1 ? 's' : ''} remaining — answer all {total} to see your result
        </p>
      )}
    </section>
  )
}
