import { useState, useCallback } from 'react'
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

function QuizQuestion({ q, index, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [inputVal, setInputVal] = useState('')
  const [hintLevel, setHintLevel] = useState(-1)
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(null)

  const hints = q.hints ?? []
  const allHints = q.type === 'input' ? [null, ...hints] : hints

  const handleSubmit = () => {
    const userAnswer = q.type === 'choice' ? selected : inputVal
    const isCorrect = evaluateAnswer(userAnswer, String(q.answer))
    setCorrect(isCorrect)
    setSubmitted(true)
    onAnswer(index, isCorrect)
  }

  const showHint = () => setHintLevel((h) => Math.min(h + 1, allHints.length - 1))

  const borderColor = submitted
    ? correct ? 'border-emerald-400 dark:border-emerald-600' : 'border-red-400 dark:border-red-600'
    : 'border-slate-200 dark:border-slate-700'

  return (
    <div className={`rounded-xl border ${borderColor} bg-white dark:bg-slate-900 p-4 transition-colors`}>
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
                const isCorrectOpt = opt === q.answer
                let optStyle = 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer'
                if (submitted) {
                  if (isCorrectOpt) optStyle = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-600'
                  else if (isSelected && !isCorrectOpt) optStyle = 'border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-600'
                  else optStyle = 'border-slate-200 dark:border-slate-700 opacity-50'
                } else if (isSelected) {
                  optStyle = 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 dark:border-brand-500 cursor-pointer'
                }
                return (
                  <button
                    key={i}
                    disabled={submitted}
                    onClick={() => !submitted && setSelected(opt)}
                    className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-colors ${optStyle}`}
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
              onChange={(e) => !submitted && setInputVal(e.target.value)}
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
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  Check
                </button>
                {allHints.length > 0 && hintLevel < allHints.length - 1 && (
                  <button
                    onClick={showHint}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 underline underline-offset-2"
                  >
                    Hint {hintLevel + 2 <= allHints.length ? `(${hintLevel + 2}/${allHints.length})` : ''}
                  </button>
                )}
              </>
            ) : (
              <span className={`text-xs font-semibold ${correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {correct ? '+1 pt' : `Incorrect — answer: ${q.answer}`}
              </span>
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
  const { setQuizScore, getQuizScore } = useProgress()
  const saved = getQuizScore(lessonId)
  const total = questions.length

  // Local session state — fresh each page load
  const [answers, setAnswers] = useState({})  // index → true/false

  const liveCorrect = Object.values(answers).filter(Boolean).length
  const liveAttempted = Object.keys(answers).length
  const allAttempted = liveAttempted === total

  const handleAnswer = useCallback((index, isCorrect) => {
    setAnswers((prev) => {
      const next = { ...prev, [index]: isCorrect }
      const attempted = Object.keys(next).length
      const correct = Object.values(next).filter(Boolean).length
      // Update persisted score immediately after every answer
      setQuizScore(lessonId, correct, attempted, total)
      return next
    })
  }, [total, lessonId, setQuizScore])

  // What to show in the score badge:
  // - During session: live count
  // - On fresh load (no local answers yet): saved score if it exists
  const displayCorrect = liveAttempted > 0 ? liveCorrect : (saved?.correct ?? null)
  const displayAttempted = liveAttempted > 0 ? liveAttempted : (saved?.attempted ?? 0)
  const isComplete = liveAttempted > 0 ? allAttempted : (saved?.attempted === saved?.total && saved?.total === total)

  const scorePct = isComplete ? (displayCorrect / total) : null
  const masteryLabel = scorePct === null ? null :
    scorePct >= 0.8
      ? { text: 'Mastered', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' }
      : scorePct >= 0.5
        ? { text: 'Partial Credit', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' }
        : { text: 'Needs Review', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' }

  return (
    <section className="mt-16 pt-10 border-t-2 border-slate-200 dark:border-slate-700">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Lesson Quiz</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {total} questions · answer any order · skip and come back
          </p>
        </div>

        {/* Live score counter */}
        <div className="flex flex-col items-end gap-1">
          {displayCorrect !== null && (
            <div className="flex items-baseline gap-1">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {displayCorrect}
              </span>
              <span className="text-sm text-slate-400 dark:text-slate-500">/ {total} pts</span>
            </div>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {displayAttempted}/{total} answered
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuizQuestion
            key={q.id ?? i}
            q={q}
            index={i}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      {/* Mastery banner — only after all questions attempted */}
      {isComplete && masteryLabel && (
        <div className={`mt-6 p-4 rounded-xl border ${masteryLabel.bg}`}>
          <p className={`font-semibold ${masteryLabel.color}`}>
            {displayCorrect}/{total} correct — {masteryLabel.text}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {scorePct < 0.5
              ? 'Go back through the Intuition, Math, and Rigor tabs, then retry.'
              : scorePct < 0.8
                ? 'Review the sections flagged above, then work through the challenge problems.'
                : 'The sidebar star marks this lesson as mastered.'}
          </p>
        </div>
      )}

      {/* Encouragement while quiz is in progress */}
      {!isComplete && liveAttempted > 0 && liveAttempted < total && (
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
          {total - liveAttempted} question{total - liveAttempted !== 1 ? 's' : ''} remaining — answer all {total} to unlock mastery rating
        </p>
      )}
    </section>
  )
}
