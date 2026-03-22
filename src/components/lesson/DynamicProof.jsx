/**
 * DynamicProof — step-through proof with auto-play and synced visualization.
 *
 * Controls: ← Prev | ▶ Play (auto-advances) | Next → | slider
 * The visualization on the right receives `currentStep` and updates in sync.
 */
import { useState, useEffect, useRef } from 'react'
import KatexBlock from '../math/KatexBlock.jsx'
import { parseProse } from '../math/parseProse.jsx'
import VizFrame from '../viz/VizFrame.jsx'

const PLAY_INTERVAL_MS = 2800

export default function DynamicProof({ steps = [], visualizationId, visualizationProps = {}, title }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef(null)
  const max = steps.length - 1

  // Auto-play: advance one step at a time, stop at end
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrent(s => {
          if (s >= max) {
            setPlaying(false)
            return s
          }
          return s + 1
        })
      }, PLAY_INTERVAL_MS)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, max])

  // Stop playing when user manually changes step
  function goTo(n) {
    setPlaying(false)
    setCurrent(n)
  }

  function togglePlay() {
    if (current >= max) {
      setCurrent(0)
      setPlaying(true)
    } else {
      setPlaying(p => !p)
    }
  }

  if (!steps.length) return null

  const step = steps[current]
  const isFirst = current === 0
  const isLast  = current === max

  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden">
      {title && (
        <div className="px-5 py-3 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-100 dark:border-purple-800">
          <p className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">{title}</p>
        </div>
      )}

      <div className="flex flex-col">
        {/* Algebra / proof step */}
        <div className="w-full p-5 flex flex-col justify-center min-h-[120px] bg-white dark:bg-[#0f172a]">
          {/* Step counter badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-purple-400 dark:text-purple-500 uppercase tracking-widest">
              Step {current + 1} of {steps.length}
            </span>
            {playing && (
              <span className="inline-flex items-center gap-1 text-xs text-purple-500 dark:text-purple-400">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                playing
              </span>
            )}
          </div>

          {step.expression && (
            <div className="overflow-x-auto mb-3">
              <KatexBlock expr={step.expression} />
            </div>
          )}
          {step.annotation && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
              {parseProse(step.annotation)}
            </p>
          )}
        </div>

        {/* Synced interactive visual */}
        {visualizationId && (
          <div className="w-full border-t border-purple-100 dark:border-purple-800 overflow-hidden bg-slate-50 dark:bg-slate-900">
            <VizFrame
              id={visualizationId}
              initialProps={{ ...visualizationProps, currentStep: current }}
              title={null}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 py-4 bg-purple-50/60 dark:bg-purple-950/20 border-t border-purple-100 dark:border-purple-800 space-y-3">
        {/* Slider */}
        <input
          type="range"
          min={0} max={max} value={current}
          onChange={e => goTo(+e.target.value)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />

        {/* Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={isFirst}
            onClick={() => goTo(Math.max(0, current - 1))}
            className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 disabled:opacity-30 font-medium text-sm hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors"
          >
            ← Prev
          </button>

          <button
            onClick={togglePlay}
            className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-colors ${
              playing
                ? 'bg-purple-200 dark:bg-purple-800/60 text-purple-700 dark:text-purple-200 hover:bg-purple-300 dark:hover:bg-purple-800'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {playing ? '⏸ Pause' : isLast ? '↺ Replay' : '▶ Play'}
          </button>

          <button
            disabled={isLast}
            onClick={() => goTo(Math.min(max, current + 1))}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-30 font-medium text-sm transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current
                  ? 'bg-purple-500 scale-125'
                  : i < current
                    ? 'bg-purple-300 dark:bg-purple-700'
                    : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
