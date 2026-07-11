import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ParsedLesson, Executor, UiTheme, TestResult } from './types'
import type { TraceEvent, HeapSnapshot } from '../../labs/codelens/codelens/types'
import { buildHeapSnapshot } from '../../labs/codelens/codelens/renderer/heapSnapshot'
import VariableWatch from '../../labs/codelens/codelens/renderer/VariableWatch'
import RunExample from './RunExample'
import ChallengeStep from './ChallengeStep'
import DeltaTutor from './DeltaTutor'
import { CodeBlockPre, CodeBlockCode } from '../../components/math/CodeBlock.jsx'
import styles from './LessonEngine.module.css'

interface Props {
  lesson: ParsedLesson
  executor: Executor
  ui: UiTheme
  onBack: () => void
  onComplete?: () => void
  seriesLabel?: string
}

type RightTab = 'lesson' | 'output' | 'debug' | 'tutor'

export default function LessonView({ lesson, executor, ui, onBack, onComplete, seriesLabel }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [rightTab, setRightTab] = useState<RightTab>('lesson')

  // Reset all state when a new lesson is loaded (lesson prop reference changes)
  useEffect(() => {
    setStepIdx(0)
    setEvents([])
    setTraceCode('')
    setTraceStep(0)
    setHeap(null)
    setOutput(null)
    setTestResults(null)
    setRightTab('lesson')
  }, [lesson])

  // Trace state
  const [events, setEvents] = useState<TraceEvent[]>([])
  const [traceStep, setTraceStep] = useState(0)
  const [heap, setHeap] = useState<HeapSnapshot | null>(null)
  const [traceCode, setTraceCode] = useState<string>('')

  // Output state
  const [output, setOutput] = useState<{ text: string; kind: string }[] | null>(null)
  const [testResults, setTestResults] = useState<TestResult[] | null>(null)

  const step = lesson.steps[stepIdx]
  const total = lesson.steps.length
  const isChallenge = !!step?.challenge

  function navigate(idx: number) {
    setStepIdx(idx)
    setEvents([])
    setTraceCode('')
    setTraceStep(0)
    setHeap(null)
    setOutput(null)
    setTestResults(null)
    setRightTab('lesson')
  }

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

  function handleOutput(lines: { text: string; kind: string }[]) {
    setOutput(lines)
    if (lines.length > 0) setRightTab(prev => prev === 'debug' ? prev : 'output')
  }

  function handleResults(results: TestResult[]) {
    setTestResults(results)
    if (results.length > 0) setRightTab(prev => prev === 'debug' ? prev : 'output')
  }

  const hasTrace = events.length > 0
  const hasOutput = output !== null && output.length > 0
  const hasResults = testResults !== null && testResults.length > 0

  // Progressive output: when tracing, only show print lines that have already executed
  const visibleOutput = (() => {
    if (!hasTrace || !output) return output
    if (output.some(l => l.kind === 'error')) return output
    const codeLines = traceCode.split('\n')
    let printsSeen = 0
    for (let i = 0; i <= traceStep && i < events.length; i++) {
      const ln = events[i]?.line ?? events[i]?.sourceLocation?.line
      if (ln != null && codeLines[ln - 1]?.trimStart().startsWith('print(')) printsSeen++
    }
    return output.slice(0, printsSeen)
  })()

  const passed = testResults?.filter(r => r.passed).length ?? 0
  const totalTests = testResults?.length ?? 0
  const allPassed = hasResults && passed === totalTests

  return (
    <div className={`flex flex-col h-full ${ui.bg0}`}>

      {/* Top bar — pl-20 clears macOS traffic-light buttons */}
      <div className={`flex items-center gap-2 pl-20 pr-3 py-2 border-b ${ui.border} ${ui.bg1} shrink-0`}>
        {/* Breadcrumb */}
        {seriesLabel && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onBack}
              className={`text-sm font-medium ${ui.txt2} hover:text-brand-500 transition-colors bg-transparent border-none cursor-pointer`}
            >
              {seriesLabel}
            </button>
            <span className={`text-sm ${ui.txt2} opacity-40`}>›</span>
          </div>
        )}
        <span className={`text-[13px] font-bold ${ui.txt1} truncate flex-1 min-w-0`}>{lesson.title}</span>

        {/* Prev */}
        <button
          type="button"
          onClick={() => navigate(Math.max(0, stepIdx - 1))}
          disabled={stepIdx === 0}
          className={`text-xs font-medium px-2.5 py-1 rounded border ${ui.border} ${ui.bg0} ${ui.txt2} hover:text-brand-500 disabled:opacity-30 bg-transparent cursor-pointer shrink-0`}
        >← Prev</button>

        {/* Step dots */}
        <div className="flex items-center gap-1 shrink-0">
          {lesson.steps.map((_, i) => (
            <div
              key={i}
              onClick={() => navigate(i)}
              className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                i === stepIdx
                  ? 'bg-brand-500 scale-125'
                  : i < stepIdx
                    ? 'bg-brand-500/40'
                    : ui.bg2
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-semibold ${ui.txt2} shrink-0 tabular-nums`}>{stepIdx + 1}/{total}</span>

        {/* Next / Complete */}
        {stepIdx === total - 1 ? (
          <button
            type="button"
            onClick={onComplete ?? onBack}
            className="text-xs font-bold px-2.5 py-1 rounded bg-brand-500 text-white hover:bg-brand-600 cursor-pointer border-none shrink-0"
          >Next Lesson →</button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(stepIdx + 1)}
            className="text-xs font-bold px-2.5 py-1 rounded bg-brand-500 text-white hover:bg-brand-600 cursor-pointer border-none shrink-0"
          >Next →</button>
        )}
      </div>

      {/* Split content */}
      <div className="flex flex-1 min-h-0">

        {/* Left — full-height code window */}
        <div className={`flex flex-col flex-1 min-w-0 border-r ${ui.border}`}>
          {step && (
            isChallenge
              ? <ChallengeStep step={step} executor={executor} ui={ui} onTrace={handleTrace} onResults={handleResults} />
              : step.examples[0]
                ? <RunExample snippet={step.examples[0]} executor={executor} ui={ui} onTrace={handleTrace} onOutput={handleOutput} />
                : (
                  <div className={`flex-1 flex items-center justify-center ${ui.txt2} text-sm`}>
                    No code for this step — read the Lesson tab.
                  </div>
                )
          )}
        </div>

        {/* Right — tabbed panel */}
        <div className={`w-[42%] shrink-0 flex flex-col`}>

          {/* Tab bar */}
          <div className={`flex items-center px-2 pt-1.5 border-b ${ui.border} ${ui.bg1} shrink-0 gap-0.5`}>
            {(['lesson', 'output', 'debug', 'tutor'] as RightTab[]).map(tab => {
              const label = tab === 'lesson' ? 'Lesson'
                : tab === 'output' ? (isChallenge ? 'Tests' : 'Output')
                : tab === 'debug' ? 'Debug'
                : 'Tutor (Δ)'
              const isActive = rightTab === tab
              const hasBadge =
                (tab === 'debug' && hasTrace) ||
                (tab === 'output' && (hasOutput || hasResults))
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRightTab(tab)}
                  className={`relative px-3 py-1.5 text-[12px] font-semibold border-b-2 transition-colors bg-transparent cursor-pointer shrink-0 ${
                    isActive
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : `border-transparent ${ui.txt2} hover:text-brand-500`
                  }`}
                >
                  {label}
                  {hasBadge && (
                    <span className="absolute top-1 right-0.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Lesson tab — prose + lenses */}
          {rightTab === 'lesson' && step && (
            <div className="flex-1 overflow-y-auto">
              {/* Step header */}
              {(step.title || isChallenge) && (
                <div className={`px-5 pt-5 pb-3 shrink-0`}>
                  {step.title && (
                    <h2 className={`text-lg font-black tracking-tight ${ui.txt1} leading-tight`}>{step.title}</h2>
                  )}
                  {isChallenge && (
                    <span className={`inline-flex items-center mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20`}>
                      Challenge
                    </span>
                  )}
                </div>
              )}
              {/* Prose */}
              <div className={`px-5 pb-6 ${styles.prose} ${ui.txt1} text-sm`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({ children }: any) => (
                      <pre className={`my-4 p-3 rounded-lg overflow-x-auto text-xs leading-relaxed font-mono ${ui.bg1} border ${ui.border} ${styles.noLigatures}`}>
                        {children}
                      </pre>
                    ),
                    code: ({ className, children }: any) => (
                      <CodeBlockCode
                        className={className}
                        inlineClassName={`px-1.5 py-0.5 rounded-md ${ui.bg1} font-mono text-[0.85em] text-brand-500 border ${ui.border}`}
                      >
                        {children}
                      </CodeBlockCode>
                    )
                  }}
                >
                  {step.prose}
                </ReactMarkdown>

                {/* CS / SE lenses as callout cards */}
                {(step.lenses?.cs || step.lenses?.se) && (
                  <div className="flex flex-col gap-3 mt-5 pt-5 border-t border-current/10">
                    {step.lenses?.cs && (
                      <div className={`rounded-lg p-3 border ${ui.border} ${ui.bg1}`}>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-1.5">CS Concept</div>
                        <p className={`text-sm leading-relaxed ${ui.txt1} m-0`}>{step.lenses.cs}</p>
                      </div>
                    )}
                    {step.lenses?.se && (
                      <div className={`rounded-lg p-3 border ${ui.border} ${ui.bg1}`}>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-brand-500 mb-1.5">SE Insight</div>
                        <p className={`text-sm leading-relaxed ${ui.txt1} m-0`}>{step.lenses.se}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Output tab */}
          {rightTab === 'output' && (
            isChallenge ? (
              hasResults ? (
                <div className="flex-1 overflow-y-auto">
                  <div className={`px-4 py-3 border-b ${ui.border} ${ui.bg1} shrink-0`}>
                    <span className={`text-xs font-semibold ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
                      {allPassed ? `✓ All ${totalTests} tests passed` : `${passed} / ${totalTests} passed`}
                    </span>
                  </div>
                  <div className={`divide-y ${ui.border}`}>
                    {testResults!.map((r, i) => (
                      <div key={i} className={`flex items-start gap-2 px-4 py-2.5 text-xs ${styles.codeFont}`}>
                        <span className={`shrink-0 mt-0.5 ${r.passed ? 'text-green-400' : 'text-red-400'}`}>{r.passed ? '✓' : '✗'}</span>
                        <span className={ui.txt1}>{r.label}</span>
                        {r.detail && <span className="text-red-400 ml-auto shrink-0">{r.detail}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`flex-1 flex flex-col items-center justify-center text-center px-6 ${ui.txt2}`}>
                  <div className="text-2xl mb-3">◎</div>
                  <p className="text-sm">Click Run Tests to see results here.</p>
                </div>
              )
            ) : (
              hasOutput ? (
                <div className="flex-1 overflow-y-auto">
                  <div className={`p-4 ${styles.codeFont} ${ui.bg0}`}>
                    {(visibleOutput ?? []).map((line, i) => (
                      <div key={i} className={`whitespace-pre-wrap break-all ${
                        line.kind === 'error' ? 'text-red-500'
                        : line.kind === 'stderr' ? 'text-orange-400'
                        : ui.txt1
                      }`}>{line.text}</div>
                    ))}
                    {hasTrace && (visibleOutput?.length ?? 0) === 0 && (
                      <p className={`text-xs ${ui.txt2} mt-2`}>Step through the code — output appears as print statements execute.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex-1 flex flex-col items-center justify-center text-center px-6 ${ui.txt2}`}>
                  <div className="text-2xl mb-3">◎</div>
                  <p className="text-sm">Click Run to see output here.</p>
                </div>
              )
            )
          )}

          {/* Debug tab */}
          {rightTab === 'debug' && (
            hasTrace ? (
              <>
                {(() => {
                  const ln = events[traceStep]?.line ?? events[traceStep]?.sourceLocation?.line
                  const srcLine = ln != null ? traceCode.split('\n')[ln - 1]?.trim() : null
                  return srcLine ? (
                    <div className={`px-3 py-2 border-b ${ui.border} ${ui.bg1} shrink-0 flex items-center gap-2`}>
                      <span className="text-[10px] font-mono font-bold text-brand-400">line {ln}</span>
                      <code className="text-[11px] font-mono text-brand-300 whitespace-pre truncate">→ {srcLine}</code>
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
                <p className="text-sm">Enable Debug on the code editor and run to step through execution here.</p>
              </div>
            )
          )}

          {/* Tutor tab */}
          {rightTab === 'tutor' && step && (
            <DeltaTutor lesson={lesson} step={step} ui={ui} />
          )}

        </div>
      </div>
    </div>
  )
}
