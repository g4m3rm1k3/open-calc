/**
 * NarrativeStory — theatrical story-driven explainer that sits before challenges.
 *
 * Each act reveals sequentially. Completed acts collapse to a labelled bar.
 * Clicking a completed act re-expands it. Current act is fully lit.
 */
import { useState } from 'react'
import MarkdownProse from '../math/MarkdownProse.jsx'

export default function NarrativeStory({ story }) {
  const [revealed, setRevealed] = useState(1)
  const [expandedCompleted, setExpandedCompleted] = useState(new Set())

  if (!story?.acts?.length) return null

  const acts = story.acts
  const currentIdx = revealed - 1
  const isDone = revealed > acts.length

  const toggleCompleted = (idx) => {
    setExpandedCompleted(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  return (
    <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">

      {/* Cinematic header */}
      <div className="bg-slate-900 dark:bg-slate-950 px-6 py-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400 mb-1.5">
            The Story Behind the Problem
          </p>
          <h3 className="text-xl font-bold text-white leading-snug">{story.title}</h3>
          {story.subtitle && (
            <p className="text-sm text-slate-400 mt-1 italic">{story.subtitle}</p>
          )}
        </div>
        <span className="flex-shrink-0 text-xs text-slate-500 font-semibold tabular-nums mt-1">
          {Math.min(revealed, acts.length)} / {acts.length}
        </span>
      </div>

      {/* Acts */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {acts.map((act, idx) => {
          if (idx >= revealed && !isDone) return null

          const isCompleted = isDone ? true : idx < currentIdx
          const isCurrent = !isDone && idx === currentIdx
          const isExpandedCompleted = expandedCompleted.has(idx)

          return (
            <div key={idx}>
              {/* Act label bar */}
              <button
                type="button"
                onClick={isCompleted ? () => toggleCompleted(idx) : undefined}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors
                  ${isCurrent
                    ? 'bg-amber-50 dark:bg-amber-950/20 cursor-default'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer'
                    : 'bg-white dark:bg-slate-900 cursor-default'
                  }`}
              >
                <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-widest
                  ${isCurrent ? 'text-amber-600 dark:text-amber-400'
                    : isCompleted ? 'text-slate-400 dark:text-slate-500'
                    : 'text-slate-300 dark:text-slate-600'}`}
                >
                  {act.label ?? `Act ${idx + 1}`}
                </span>
                {act.title && (
                  <span className={`text-sm font-semibold flex-1
                    ${isCurrent ? 'text-slate-800 dark:text-slate-100'
                      : isCompleted ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    {act.title}
                  </span>
                )}
                {isCompleted && (
                  <span className="ml-auto flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 text-xs font-semibold flex-shrink-0">
                    <span>✓</span>
                    <span className="text-slate-400 dark:text-slate-600 font-normal">
                      {isExpandedCompleted ? '▲' : '▼'}
                    </span>
                  </span>
                )}
                {isCurrent && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
                )}
              </button>

              {/* Act content */}
              {(isCurrent || (isCompleted && isExpandedCompleted)) && (
                <div className={`px-6 pb-6 pt-4
                  ${isCurrent
                    ? 'bg-white dark:bg-slate-900 border-l-4 border-amber-400 dark:border-amber-500'
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-l-4 border-emerald-300 dark:border-emerald-700'
                  }`}
                >
                  <MarkdownProse text={act.content} />

                  {isCurrent && (
                    <div className="mt-8 flex items-center justify-between">
                      {idx > 0 && (
                        <button
                          onClick={() => {
                            setExpandedCompleted(prev => {
                              const next = new Set(prev)
                              next.add(idx - 1)
                              return next
                            })
                          }}
                          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition-colors"
                        >
                          ← Review {acts[idx - 1]?.label ?? `Act ${idx}`}
                        </button>
                      )}
                      <button
                        onClick={() => setRevealed(r => r + 1)}
                        className="ml-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-900 font-bold text-sm transition-colors shadow-md shadow-amber-500/25"
                      >
                        {idx === acts.length - 1
                          ? 'See the Full Picture →'
                          : `${acts[idx + 1]?.label ?? `Act ${idx + 2}`}: ${acts[idx + 1]?.title ?? ''} →`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Done — big picture summary */}
        {isDone && story.resolution && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 px-6 py-5 border-l-4 border-emerald-500 dark:border-emerald-400">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
              The Big Picture
            </p>
            <MarkdownProse text={story.resolution} />
          </div>
        )}
      </div>
    </div>
  )
}
