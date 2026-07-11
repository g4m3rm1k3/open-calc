import { useState } from 'react'
import type { ParsedLesson, Executor, UiTheme } from './types'
import type { TraceEvent, HeapSnapshot } from '../../labs/codelens/codelens/types'
import { buildHeapSnapshot } from '../../labs/codelens/codelens/renderer/heapSnapshot'
import VariableWatch from '../../labs/codelens/codelens/renderer/VariableWatch'
import ReadingStep from './ReadingStep'
import ChallengeStep from './ChallengeStep'
import DeltaTutor from './DeltaTutor'
import styles from './LessonEngine.module.css'

interface Props {
  lesson: ParsedLesson
  executor: Executor
  ui: UiTheme
  onBack: () => void
  seriesLabel?: string
}

type RightTab = 'explore' | 'debug' | 'tutor'

export default function LessonView({ lesson, executor, ui, onBack, seriesLabel }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [rightTab, setRightTab] = useState<RightTab>('explore')

  // Trace state — updated whenever any code cell runs with debug on
  const [events, setEvents] = useState<TraceEvent[]>([])
  const [traceStep, setTraceStep] = useState(0)
  const [heap, setHeap] = useState<HeapSnapshot | null>(null)
  const [traceCode, setTraceCode] = useState<string>('')

  const step = lesson.steps[stepIdx]

  function navigate(idx: number) {
    setStepIdx(idx)
    setEvents([])
    setTraceCode('')
    setTraceStep(0)
    setHeap(null)
    setRightTab('explore')
  }
  const isChallenge = !!step?.challenge
  const total = lesson.steps.length

  function handleTrace(newEvents: TraceEvent[], code: string, traceIdx: number) {
    setEvents(newEvents)
    setTraceCode(code)
    setTraceStep(traceIdx)
    setHeap(newEvents.length ? buildHeapSnapshot(newEvents, traceIdx) : null)
    setRightTab('debug')
  }

  function seekTo(idx: number) {
    setTraceStep(idx)
    setHeap(buildHeapSnapshot(events, idx))
  }

  const hasTrace = events.length > 0

  return (
    <div className={`flex flex-col h-full ${ui.bg0}`}>

      {/* Top bar — pl-20 clears macOS traffic-light buttons */}
      <div className={`flex items-center gap-2 pl-20 pr-4 py-2.5 border-b ${ui.border} ${ui.bg1} shrink-0`}>
        {seriesLabel && (
          <>
            <button
              type="button"
              onClick={onBack}
              className={`text-sm ${ui.txt2} ${ui.hoverTx} transition-colors bg-transparent border-none cursor-pointer shrink-0`}
            >
              {seriesLabel}
            </button>
            <span className={`text-sm ${ui.txt2} shrink-0`}>›</span>
          </>
        )}
        <span className={`text-sm font-semibold ${ui.txt1} truncate flex-1`}>{lesson.title}</span>

        {/* Step dots */}
        <div className="flex items-center gap-1">
          {lesson.steps.map((_, i) => (
            <div
              key={i}
              onClick={() => navigate(i)}
              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                i === stepIdx ? 'bg-brand-500' : i < stepIdx ? 'bg-brand-500 opacity-40' : ui.bg2
              }`}
            />
          ))}
        </div>
        <span className={`text-xs ${ui.txt2} shrink-0`}>{stepIdx + 1} / {total}</span>
      </div>

      {/* Split content */}
      <div className="flex flex-1 min-h-0">

        {/* Left — current step */}
        <div className={`flex flex-col flex-1 min-w-0 border-r ${ui.border}`}>
          {step?.title && (
            <div className={`px-6 pt-5 pb-2 shrink-0 border-b ${ui.border}`}>
              <h2 className={`text-xl font-bold ${ui.txt1}`}>{step.title}</h2>
              {isChallenge && (
                <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${ui.bg2} ${ui.txt2}`}>
                  Challenge
                </span>
              )}
            </div>
          )}
          <div className={`flex-1 min-h-0 overflow-y-auto px-6 py-4 ${isChallenge ? 'flex flex-col' : ''}`}>
            {step && (
              isChallenge
                ? <ChallengeStep step={step} executor={executor} ui={ui} onTrace={handleTrace} />
                : <ReadingStep step={step} executor={executor} ui={ui} onTrace={handleTrace} />
            )}
          </div>
          {/* Prev / Next */}
          <div className={`flex items-center justify-between px-6 py-3 border-t ${ui.border} ${ui.bg1} shrink-0`}>
            <button
              type="button"
              onClick={() => navigate(Math.max(0, stepIdx - 1))}
              disabled={stepIdx === 0}
              className={`text-sm ${ui.txt2} ${ui.hoverTx} disabled:opacity-30 bg-transparent border-none cursor-pointer`}
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => navigate(Math.min(total - 1, stepIdx + 1))}
              disabled={stepIdx === total - 1}
              className={`text-sm font-semibold ${ui.txt1} ${ui.hoverTx} disabled:opacity-30 bg-transparent border-none cursor-pointer`}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Right — tabbed panel */}
        <div className={`w-[42%] shrink-0 flex flex-col`}>

          {/* Tab bar */}
          <div className={`flex items-center gap-0 border-b ${ui.border} ${ui.bg1} shrink-0`}>
            {(['explore', 'debug', 'tutor'] as RightTab[]).map(tab => {
              const label = tab === 'explore' ? 'Explore' : tab === 'debug' ? 'Debug' : 'Tutor (Δ)'
              const isActive = rightTab === tab
              const hasBadge = tab === 'debug' && hasTrace
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRightTab(tab)}
                  className={`relative px-4 py-2 text-xs font-semibold border-b-2 transition-colors bg-transparent cursor-pointer ${
                    isActive
                      ? `border-brand-500 ${ui.txt1}`
                      : `border-transparent ${ui.txt2} ${ui.hoverTx}`
                  }`}
                >
                  {label}
                  {hasBadge && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Explore tab — CS + SE lenses */}
          {rightTab === 'explore' && (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {step?.lenses?.cs || step?.lenses?.se ? (
                <div className="flex flex-col gap-5">
                  {step.lenses?.cs && (
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${ui.txt2}`}>CS Concept</div>
                      <p className={`text-sm leading-relaxed ${ui.txt1}`}>{step.lenses.cs}</p>
                    </div>
                  )}
                  {step.lenses?.se && (
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${ui.txt2}`}>Software Engineering</div>
                      <p className={`text-sm leading-relaxed ${ui.txt1}`}>{step.lenses.se}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center h-full text-center px-6 ${ui.txt2}`}>
                  <div className="text-2xl mb-3">◎</div>
                  <p className="text-sm">No further exploration for this step.</p>
                </div>
              )}
            </div>
          )}

          {/* Debug tab — VariableWatch + step controls */}
          {rightTab === 'debug' && (
            hasTrace ? (
              <>
                <div className={`flex items-center gap-2 px-3 py-2 ${ui.bg1} border-b ${ui.border} shrink-0`}>
                  <button
                    type="button"
                    onClick={() => seekTo(Math.max(0, traceStep - 1))}
                    disabled={traceStep === 0}
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded border ${ui.border} ${ui.bg0} ${ui.txt1} disabled:opacity-30 cursor-pointer bg-transparent`}
                  >‹</button>
                  <span className={`text-xs tabular-nums font-semibold ${ui.txt1}`}>{traceStep + 1}</span>
                  <span className={`text-xs ${ui.txt2}`}>/ {events.length}</span>
                  <button
                    type="button"
                    onClick={() => seekTo(Math.min(events.length - 1, traceStep + 1))}
                    disabled={traceStep === events.length - 1}
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded border ${ui.border} ${ui.bg0} ${ui.txt1} disabled:opacity-30 cursor-pointer bg-transparent`}
                  >›</button>
                  {(() => {
                    const ln = events[traceStep]?.line ?? events[traceStep]?.sourceLocation?.line
                    return ln != null ? (
                      <span className={`ml-auto text-[11px] font-mono ${ui.txt2}`}>line {ln}</span>
                    ) : null
                  })()}
                </div>
                {(() => {
                  const ln = events[traceStep]?.line ?? events[traceStep]?.sourceLocation?.line
                  const srcLine = ln != null ? traceCode.split('\n')[ln - 1]?.trim() : null
                  return srcLine ? (
                    <div className={`px-3 py-1.5 border-b ${ui.border} ${ui.bg0} shrink-0`}>
                      <code className="text-[11px] font-mono text-brand-400 whitespace-pre">→ {srcLine}</code>
                    </div>
                  ) : null
                })()}
                <div className="flex-1 overflow-y-auto">
                  <VariableWatch
                    currentEvent={events[traceStep] ?? null}
                    prevEvent={events[traceStep - 1] ?? null}
                    heapSnapshot={heap ?? { objects: new Map() } as HeapSnapshot}
                    events={events}
                    step={traceStep}
                    onSeek={seekTo}
                    onShowEnvModel={() => {}}
                    heapDelta={events[traceStep]?.heapDelta}
                  />
                </div>
              </>
            ) : (
              <div className={`flex-1 flex flex-col items-center justify-center text-center px-6 ${ui.txt2}`}>
                <div className="text-2xl mb-3">⬡</div>
                <p className="text-sm">Enable Debug on a code cell and run it to step through execution here.</p>
              </div>
            )
          )}

          {/* Tutor tab — Delta */}
          {rightTab === 'tutor' && step && (
            <DeltaTutor lesson={lesson} step={step} ui={ui} />
          )}

        </div>

      </div>
    </div>
  )
}
