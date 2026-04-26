import { useState, useCallback } from 'react'
import { evaluate as mathEval, simplify as mathSimplify } from 'mathjs'
import { parseProse } from '../math/parseProse.jsx'

// ─── Answer evaluator (shared logic with LessonQuizBlock) ─────────────────────

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

// ─── Single question ───────────────────────────────────────────────────────────

function AssessmentQuestion({ q, index }) {
  const [selected, setSelected] = useState(null)
  const [inputVal, setInputVal] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(null)
  const [hintShown, setHintShown] = useState(false)

  // Support both hint: 'string' (assessment schema) and hints: ['string'] (quiz schema)
  const hintText = q.hint ?? q.hints?.[0] ?? null

  const handleSubmit = () => {
    const userAnswer = q.type === 'choice' ? selected : inputVal
    const isCorrect = evaluateAnswer(userAnswer, String(q.answer))
    setCorrect(isCorrect)
    setSubmitted(true)
  }

  const handleRetry = () => {
    setSubmitted(false)
    setSelected(null)
    setInputVal('')
    setCorrect(null)
    setHintShown(false)
  }

  const borderColor = submitted
    ? correct ? 'border-teal-400 dark:border-teal-600' : 'border-red-400 dark:border-red-600'
    : 'border-slate-200 dark:border-slate-700'

  return (
    <div className={`rounded-2xl border-2 ${borderColor} bg-white/80 dark:bg-slate-900/80 shadow-xl hover:shadow-2xl transition-all duration-300 w-full`}>
      <div className="flex items-start gap-3 px-6 py-6">
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
          submitted
            ? correct
              ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
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
                let optStyle = 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 cursor-pointer'
                if (submitted) {
                  if (isSelected && correct) optStyle = 'border-teal-400 bg-teal-50 dark:bg-teal-900/30 dark:border-teal-600'
                  else if (isSelected && !correct) optStyle = 'border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-600'
                  else optStyle = 'border-slate-200 dark:border-slate-700 opacity-50'
                } else if (isSelected) {
                  optStyle = 'border-teal-400 bg-teal-50 dark:bg-teal-900/30 dark:border-teal-500 cursor-pointer'
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
                  ? correct ? 'border-teal-400 dark:border-teal-600' : 'border-red-400 dark:border-red-600'
                  : 'border-slate-300 dark:border-slate-600 focus:border-teal-400 dark:focus:border-teal-500'
              }`}
            />
          )}

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {!submitted ? (
              <>
                <button
                  onClick={handleSubmit}
                  disabled={(q.type === 'choice' && !selected) || (q.type === 'input' && !inputVal.trim())}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                >
                  Check
                </button>
                {hintText && !hintShown && (
                  <button
                    onClick={() => setHintShown(true)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 underline underline-offset-2"
                  >
                    Show hint
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold ${correct ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>
                  {correct ? 'Correct!' : 'Not quite — try again'}
                </span>
                {!correct && (
                  <button
                    onClick={handleRetry}
                    className="text-xs text-teal-600 dark:text-teal-400 underline underline-offset-2 hover:text-teal-700"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>

          {hintShown && hintText && (
            <div className="my-5 w-full px-6 py-4 rounded-2xl bg-gradient-to-br from-teal-50/80 via-white/80 to-emerald-50/80 dark:from-teal-900/40 dark:via-slate-900/60 dark:to-emerald-900/30 border-2 border-teal-300/60 dark:border-teal-900/60 shadow-2xl backdrop-blur-xl text-base text-teal-900 dark:text-teal-100 flex items-start gap-3">
              <span className="text-2xl mr-2 select-none text-emerald-500 dark:text-emerald-300">💡</span>
              <span className="font-semibold">Hint:</span>
              <span className="ml-2">{parseProse(hintText)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

/**
 * AssessmentBlock — Ungraded "Understanding Check"
 *
 * Used for lesson.assessment (mid-lesson mastery check).
 * No score tracking, no points, no markCheckpoint.
 * See LessonQuizBlock for the graded end-of-lesson quiz.
 *
 * Question schema:
 *   { id, type: 'choice'|'input', text, options?, answer, hint?: string, hints?: string[] }
 */
export default function AssessmentBlock({ assessment }) {
  const questions = assessment?.questions ?? []
  if (questions.length === 0) return null

  return (
    <section className="mt-12 pt-8">
      <div className="max-w-4xl mx-auto rounded-3xl border border-teal-200/40 dark:border-teal-900/40 bg-white/30 dark:bg-slate-900/30 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 px-8 py-6 bg-gradient-to-r from-teal-400/30 via-white/10 to-emerald-300/10 dark:from-teal-900/30 dark:via-slate-900/10 dark:to-emerald-900/10 border-b border-teal-200/20 dark:border-teal-900/20 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-2xl shadow-lg border-2 border-teal-200/40 dark:border-teal-900/40 backdrop-blur-md">
            🧪
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-teal-700 dark:text-teal-200 opacity-90">Understanding Check</div>
            <div className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
              {questions.length} question{questions.length !== 1 ? 's' : ''} · ungraded · check your understanding
            </div>
          </div>
        </div>
        {/* Questions */}
        <div className="space-y-6 px-6 pb-8 pt-8">
          {questions.map((q, i) => (
            <AssessmentQuestion key={q.id ?? i} q={q} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
