import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ParsedLesson, Executor, UiTheme, TestResult } from './types'
import type { TraceEvent, HeapSnapshot } from '../../labs/codelens/codelens/types'
import { buildHeapSnapshot } from '../../labs/codelens/codelens/renderer/heapSnapshot'
import LessonDebugPanel from './LessonDebugPanel'
import DomTreePanel from './DomTreePanel'
import CssSpecificityPanel from './CssSpecificityPanel'
import RunExample from './RunExample'
import ChallengeStep from './ChallengeStep'
import DeltaTutor from './DeltaTutor'
import { CodeBlockPre, CodeBlockCode } from '../../components/math/CodeBlock.jsx'
import styles from './LessonEngine.module.css'

interface Props {
  lesson: ParsedLesson
  executor: Executor
  ui: UiTheme
  onBack?: () => void
  onBackToSeriesList?: () => void
  onComplete?: () => void
  seriesLabel?: string
}

type RightTab = 'lesson' | 'output' | 'dom' | 'tree' | 'css' | 'debug' | 'tutor'

export default function LessonView({ lesson, executor, ui, onBack, onBackToSeriesList, onComplete, seriesLabel }: Props) {
  const [stepIdx, setStepIdx] = useState(0)
  const [rightTab, setRightTab] = useState<RightTab>('lesson')
  const [events, setEvents] = useState<TraceEvent[]>([])
  const [traceStep, setTraceStep] = useState(0)
  const [heap, setHeap] = useState<HeapSnapshot | null>(null)
  const [traceCode, setTraceCode] = useState<string>('')
  const [output, setOutput] = useState<{ text: string; kind: string }[] | null>(null)
  const [testResults, setTestResults] = useState<TestResult[] | null>(null)
  const [challengesPassed, setChallengesPassed] = useState<Set<number>>(new Set())

  // Reset all state when a new lesson is loaded
  useEffect(() => {
    setStepIdx(0)
    setEvents([])
    setTraceCode('')
    setTraceStep(0)
    setHeap(null)
    setOutput(null)
    setTestResults(null)
    setChallengesPassed(new Set())
    setRightTab('lesson')
  }, [lesson])

  // Guard: clamp stepIdx in case lesson changes before effect fires
  const safeIdx = Math.min(stepIdx, lesson.steps.length - 1)
  const step = lesson.steps[Math.max(0, safeIdx)]
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

  // Called when a fresh trace is loaded — switches to Debug tab
  function handleTrace(newEvents: TraceEvent[], code: string, traceIdx: number) {
    setEvents(newEvents)
    setTraceCode(code)
    setTraceStep(traceIdx)
    setHeap(newEvents.length ? buildHeapSnapshot(newEvents, traceIdx) : null)
    setRightTab('debug')
  }

  // Called when stepping through an existing trace — no tab switch
  function handleSeek(step: number) {
    setTraceStep(step)
    setHeap(buildHeapSnapshot(events, step))
  }

  function seekTo(idx: number) {
    setTraceStep(idx)
    setHeap(buildHeapSnapshot(events, idx))
  }

  function handleOutput(lines: { text: string; kind: string }[]) {
    setOutput(lines)
    if (lines.length > 0) {
      const hasPreview = lines.some(l => l.kind === 'preview')
      setRightTab(prev => prev === 'debug' ? prev : hasPreview ? 'dom' : 'output')
    }
  }

  // Background auto-render from RunExample — update preview content without switching tabs.
  // The user can click the DOM tab to see the preview whenever they're ready.
  function handleAutoPreview(html: string) {
    setOutput([{ kind: 'preview', text: html }])
  }

  function handleResults(results: TestResult[]) {
    setTestResults(results)
    if (results.length > 0) {
      setRightTab(prev => prev === 'debug' ? prev : 'output')
      if (results.every(r => r.passed)) {
        setChallengesPassed(prev => new Set([...prev, safeIdx]))
      }
    }
  }

  // Lesson is completable only when every challenge step has been passed
  const challengeStepIndices = lesson.steps.reduce<number[]>((acc, s, i) => s.challenge ? [...acc, i] : acc, [])
  const allChallengesDone = challengeStepIndices.length === 0 || challengeStepIndices.every(i => challengesPassed.has(i))

  const hasTrace = events.length > 0
  const hasOutput = output !== null && output.some(l => l.kind !== 'preview')
  const hasPreview = output !== null && output.some(l => l.kind === 'preview')
  const hasResults = testResults !== null && testResults.length > 0

  // Web-step detection — determines which extra tabs appear
  const htmlSnippet = step?.examples?.find(s => s.lang.toLowerCase() === 'html')
  const cssSnippet  = step?.examples?.find(s => s.lang.toLowerCase() === 'css')
  const isWebStep   = !!htmlSnippet

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
        <div className="flex items-center gap-1 shrink-0">
          {onBackToSeriesList && (
            <>
              <button
                type="button"
                onClick={onBackToSeriesList}
                className={`text-xs font-medium ${ui.txt2} hover:text-brand-500 transition-colors bg-transparent border-none cursor-pointer`}
              >All Series</button>
              <span className={`text-xs ${ui.txt2} opacity-40`}>›</span>
            </>
          )}
          {seriesLabel && onBack && (
            <>
              <button
                type="button"
                onClick={onBack}
                className={`text-xs font-medium ${ui.txt2} hover:text-brand-500 transition-colors bg-transparent border-none cursor-pointer`}
              >{seriesLabel}</button>
              <span className={`text-xs ${ui.txt2} opacity-40`}>›</span>
            </>
          )}
        </div>
        <span className={`text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-400 truncate flex-1 min-w-0`}>{lesson.title}</span>

        {/* Prev */}
        <button
          type="button"
          onClick={() => navigate(Math.max(0, stepIdx - 1))}
          disabled={stepIdx === 0}
          className={`text-xs font-medium px-3 py-1.5 rounded border ${ui.border} ${ui.bg1} ${ui.txt2} hover:text-brand-400 hover:border-brand-500/30 hover:bg-brand-500/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current disabled:hover:border-current transition-all cursor-pointer shrink-0`}
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
          allChallengesDone ? (
            <button
              type="button"
              onClick={onComplete ?? onBack}
              className={`text-xs font-medium px-3 py-1.5 rounded border border-brand-500/40 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 hover:border-brand-500/60 transition-all cursor-pointer shrink-0`}
            >Next Lesson →</button>
          ) : (
            <span
              title={`Pass ${challengeStepIndices.filter(i => !challengesPassed.has(i)).length} remaining challenge${challengeStepIndices.filter(i => !challengesPassed.has(i)).length !== 1 ? 's' : ''} to continue`}
              className={`text-xs font-medium px-3 py-1.5 rounded border ${ui.border} ${ui.bg1} ${ui.txt2} opacity-50 cursor-not-allowed shrink-0 select-none`}
            >🔒 Complete challenges</span>
          )
        ) : (
          <button
            type="button"
            onClick={() => navigate(stepIdx + 1)}
            className={`text-xs font-medium px-3 py-1.5 rounded border border-brand-500/40 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 hover:border-brand-500/60 transition-all cursor-pointer shrink-0`}
          >Next →</button>
        )}
      </div>

      {/* Split content */}
      <div className="flex flex-1 min-h-0">

        {/* Left — full-height code window */}
        <div className={`flex flex-col flex-1 min-w-0 border-r ${ui.border}`}>
          {step && (
            isChallenge
              ? <ChallengeStep step={step} executor={executor} ui={ui} onTrace={handleTrace} onSeek={handleSeek} onResults={handleResults} onOutput={handleOutput} />
              : step.examples[0]
                ? <RunExample snippet={step.examples[0]} snippets={step.examples} executor={executor} ui={ui} onTrace={handleTrace} onSeek={handleSeek} onOutput={handleOutput} onAutoPreview={handleAutoPreview} />
                : (
                  <div className={`flex-1 flex items-center justify-center ${ui.txt2} text-sm`}>
                    No code for this step — read the Lesson tab.
                  </div>
                )
          )}
        </div>

        {/* Right — tabbed panel */}
        <div className={`w-[42%] shrink-0 flex flex-col`}>

          {/* Tab bar — context-sensitive: Tree/CSS tabs only appear for web steps */}
          <div className={`flex items-center px-2 pt-2 border-b ${ui.border} ${ui.bg1} shrink-0 gap-1 overflow-x-auto`}>
            {((['lesson', 'output', 'dom', ...(isWebStep ? ['tree'] : []), ...(cssSnippet ? ['css'] : []), 'debug', 'tutor']) as RightTab[]).map(tab => {
              const label = tab === 'lesson' ? 'Lesson'
                : tab === 'output' ? (isChallenge ? 'Tests' : 'Output')
                : tab === 'dom'    ? 'DOM'
                : tab === 'tree'   ? 'Tree'
                : tab === 'css'    ? 'Specificity'
                : tab === 'debug'  ? 'Debug'
                : 'Tutor (Δ)'
              const isActive = rightTab === tab
              const hasBadge =
                (tab === 'debug' && hasTrace) ||
                (tab === 'dom' && hasPreview) ||
                (tab === 'output' && (hasOutput || hasResults))
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRightTab(tab)}
                  className={`relative px-4 py-1.5 text-[12px] font-medium rounded-t-lg border-t border-l border-r transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? `border-brand-500/30 ${ui.bg0} text-brand-500 shadow-[inset_0_1px_0_rgba(59,130,246,0.2)]`
                      : `${ui.border} bg-transparent ${ui.txt2} hover:${ui.bg0} hover:text-brand-400`
                  }`}
                  style={{ marginBottom: isActive ? '-1px' : '0' }}
                >
                  {label}
                  {hasBadge && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_4px_rgba(59,130,246,0.8)]" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Lesson tab — prose + lenses */}
          {rightTab === 'lesson' && step && (
            <div className={`flex-1 overflow-y-auto ${styles.animateFadeIn}`}>
              {/* Step header */}
              <div className={`px-5 pt-6 pb-3 shrink-0`}>
                {stepIdx === 0 && !step.title && (
                  <h1 className="text-3xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-br from-brand-400 via-sky-400 to-brand-600 mb-2">
                    {lesson.title}
                  </h1>
                )}
                {step.title && (
                  <h2 className="text-2xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-sky-500">
                    {step.title}
                  </h2>
                )}
                  {isChallenge && (
                    <span className={`inline-flex items-center mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20`}>
                      Challenge
                    </span>
                  )}
                </div>
              {/* Prose */}
              <div className={`px-5 pb-6 ${styles.prose} ${ui.txt1} text-sm`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: (({ children }: any) => <CodeBlockPre>{children}</CodeBlockPre>) as any,
                    code: ({ className, children }: any) => (
                      <CodeBlockCode
                        className={className}
                        inlineClassName={`px-1.5 py-0.5 rounded border font-mono text-[0.85em] bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]`}
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
                  <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-brand-500/10">
                    {step.lenses?.cs && (
                      <div className={`relative rounded-xl p-4 border border-brand-500/30 bg-gradient-to-br from-brand-500/5 to-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden`}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-400 to-sky-400" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-400 mb-2 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-[10px]">⚛</span>
                          CS Concept
                        </div>
                        <p className={`text-[13.5px] leading-relaxed ${ui.txt1} m-0`}>{step.lenses.cs}</p>
                      </div>
                    )}
                    {step.lenses?.se && (
                      <div className={`relative rounded-xl p-4 border border-sky-500/30 bg-gradient-to-br from-sky-500/5 to-transparent shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden`}>
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-400 to-indigo-400" />
                        <div className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 mb-2 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-[10px]">⚙</span>
                          SE Insight
                        </div>
                        <p className={`text-[13.5px] leading-relaxed ${ui.txt1} m-0`}>{step.lenses.se}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Output tab — console text only */}
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
                    {(visibleOutput ?? []).filter(l => l.kind !== 'preview').map((line, i) => (
                      <div key={i} className={`whitespace-pre-wrap break-all ${
                        line.kind === 'error' ? 'text-red-500'
                        : line.kind === 'stderr' ? 'text-orange-400'
                        : ui.txt1
                      }`}>{line.text}</div>
                    ))}
                    {hasTrace && (visibleOutput?.filter(l => l.kind !== 'preview').length ?? 0) === 0 && (
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

          {/* DOM tab — HTML/CSS/JS iframe preview */}
          {rightTab === 'dom' && (
            hasPreview ? (
              <div className="flex-1 overflow-auto">
                {output!.filter(l => l.kind === 'preview').map((line, i) => (
                  <iframe
                    key={i}
                    title="DOM preview"
                    srcDoc={line.text}
                    sandbox="allow-scripts"
                    className="w-full h-full border-0"
                  />
                ))}
              </div>
            ) : (
              <div className={`flex-1 flex flex-col items-center justify-center text-center px-6 ${ui.txt2}`}>
                <div className="text-2xl mb-3">◻</div>
                <p className="text-sm">Run an HTML example to see the rendered page here.</p>
              </div>
            )
          )}

          {/* Tree tab — DOM tree parsed from the HTML snippet */}
          {rightTab === 'tree' && htmlSnippet && (
            <DomTreePanel html={htmlSnippet.code} ui={ui} />
          )}

          {/* CSS Specificity tab */}
          {rightTab === 'css' && cssSnippet && (
            <CssSpecificityPanel css={cssSnippet.code} ui={ui} />
          )}

          {/* Debug tab */}
          {rightTab === 'debug' && (
            <LessonDebugPanel
              events={events}
              step={traceStep}
              heap={heap}
              ui={ui}
            />
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
