import { useState } from 'react'
import { parseProse } from '../math/parseProse.jsx'

// Lightweight, ungraded "test yourself before moving on" prompt — deliberately
// separate from LessonQuizBlock's progress-tracked scoring system. Local state
// only; resets on reload. Not part of lesson completion.
export default function InlineCheck({ question, options, answer, explanation }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = submitted && selected === answer

  return (
    <div className="my-6 rounded-2xl border-2 border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/40 dark:bg-brand-950/20 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🎯</span>
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-brand-700 dark:text-brand-400">
          Quick Check
        </span>
      </div>

      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">{parseProse(question)}</p>

      <div className="space-y-2 mb-3">
        {options.map((opt, i) => {
          const isSelected = selected === opt
          let style = 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 cursor-pointer'
          if (submitted) {
            if (opt === answer) style = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-600'
            else if (isSelected) style = 'border-red-400 bg-red-50 dark:bg-red-900/30 dark:border-red-600'
            else style = 'border-slate-200 dark:border-slate-700 opacity-50'
          } else if (isSelected) {
            style = 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 dark:border-brand-500 cursor-pointer'
          }
          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => !submitted && setSelected(opt)}
              className={`w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-lg border text-sm transition-colors ${style}`}
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs font-bold mt-0.5">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-slate-700 dark:text-slate-300">{parseProse(opt)}</span>
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!selected}
          className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white text-xs font-bold uppercase tracking-wide disabled:cursor-not-allowed"
        >
          Check
        </button>
      ) : (
        <div>
          <p className={`text-xs font-semibold mb-1 ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {isCorrect ? 'Correct.' : 'Not quite.'}
          </p>
          {explanation && (
            <p className="text-xs text-slate-600 dark:text-slate-400">{parseProse(explanation)}</p>
          )}
          {!isCorrect && (
            <button
              onClick={() => { setSelected(null); setSubmitted(false) }}
              className="mt-2 text-xs text-brand-600 dark:text-brand-400 underline underline-offset-2"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  )
}
