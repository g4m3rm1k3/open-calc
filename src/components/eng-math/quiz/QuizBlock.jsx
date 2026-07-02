import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// Inline math rendering without the surrounding <p> tag
function MathText({ src }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{ p: ({ children }) => <span>{children}</span> }}
    >
      {String(src)}
    </ReactMarkdown>
  )
}

export default function QuizBlock({ quizId, q, options, correct, explanation, onResult }) {
  // Load persisted answer from localStorage on mount
  const storageKey = quizId ? `em-quiz:${quizId}` : null
  const [selected, setSelected] = useState(() => {
    if (!storageKey) return null
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey))
      return saved?.selected ?? null
    } catch { return null }
  })

  const revealed = selected !== null
  const isCorrect = selected === correct

  function pick(i) {
    if (revealed) return
    setSelected(i)
    onResult?.(i === correct)
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ selected: i, correct: i === correct }))
    }
  }

  function reset() {
    setSelected(null)
    if (storageKey) localStorage.removeItem(storageKey)
    onResult?.(null) // signal "un-answered"
  }

  return (
    <div className="my-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/20 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-2.5 bg-indigo-100/80 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex-1">
          Checkpoint
        </span>
        {revealed && (
          <span className={`text-xs font-semibold ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </span>
        )}
      </div>

      <div className="px-5 pt-4 pb-5">
        {/* Question */}
        <div className="text-slate-800 dark:text-slate-100 mb-4 text-[15px] leading-relaxed font-medium">
          <MathText src={q} />
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {options.map((opt, i) => {
            const isThis = i === selected
            const isCorrectOpt = i === correct
            let cls = 'w-full text-left px-4 py-3 rounded-xl text-sm border transition-all flex items-start gap-3 '

            if (!revealed) {
              cls += 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-200 cursor-pointer'
            } else if (isCorrectOpt) {
              cls += 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 font-medium cursor-default'
            } else if (isThis) {
              cls += 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 cursor-default'
            } else {
              cls += 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 cursor-default'
            }

            return (
              <button key={i} className={cls} onClick={() => pick(i)}>
                <span className="font-mono text-xs mt-0.5 w-5 shrink-0 text-center opacity-40">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="flex-1 text-left leading-relaxed">
                  <MathText src={opt} />
                </span>
                {revealed && isCorrectOpt && (
                  <span className="text-green-500 dark:text-green-400 shrink-0 mt-0.5">✓</span>
                )}
                {revealed && isThis && !isCorrectOpt && (
                  <span className="text-red-400 shrink-0 mt-0.5">✗</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {revealed && explanation && (
          <div className={`text-sm leading-relaxed rounded-xl px-4 py-3 mb-3 ${
            isCorrect
              ? 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
          }`}>
            <strong>{isCorrect ? 'Correct.' : 'Not quite.'}</strong>{' '}
            <MathText src={explanation} />
          </div>
        )}

        {revealed && (
          <button onClick={reset} className="text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            ↩ Try again
          </button>
        )}
      </div>
    </div>
  )
}
