import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { LessonStep, Executor, UiTheme, TestResult } from './types'
import type { TraceEvent } from '../../labs/codelens/codelens/types'
import { runTests, buildTestHarness } from './testRunner'
import { runPython } from '../../labs/codelens/codelens/interpreter/pythonTracer'
import { run as runJS } from '../../engines/js/interpreter/interpreter.js'
import styles from './LessonEngine.module.css'
import { CodeBlockPre, CodeBlockCode } from '../../components/math/CodeBlock.jsx'

interface Props {
  step: LessonStep
  executor: Executor
  ui: UiTheme
  onTrace: (events: TraceEvent[], code: string, step: number) => void
}

function toMonacoLang(lang: string): string {
  const n = lang.toLowerCase()
  if (n === 'py') return 'python'
  if (n === 'js') return 'javascript'
  if (n === 'ts') return 'typescript'
  if (n === 'sqlite') return 'sql'
  if (n === 'sh' || n === 'shell') return 'shell'
  return n
}

export default function ChallengeStep({ step, executor, ui, onTrace }: Props) {
  const { themeStyles } = useGlobalTheme() as any
  const monacoTheme = themeStyles?.monaco ?? 'vs-dark'

  const { challenge, tests, prose } = step
  const lang = challenge?.lang ?? 'python'

  const [code, setCode] = useState(challenge?.code ?? '')
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [running, setRunning] = useState(false)
  const [debugOn, setDebugOn] = useState(false)
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([])
  const [traceStep, setTraceStep] = useState(0)

  // unused but kept for potential textarea fallback ref
  const _textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setCode(challenge?.code ?? '')
    setResults(null)
    setDebugOn(false)
    setTraceEvents([])
    setTraceStep(0)
  }, [challenge?.code])

  function seek(s: number) {
    setTraceStep(s)
    onTrace(traceEvents, code, s)
  }

  async function handleRun() {
    if (!tests) return
    setRunning(true)
    setResults(null)
    setTraceEvents([])
    setTraceStep(0)

    const testResults = await runTests(code, tests, lang, executor)
    setResults(testResults)

    if (debugOn && tests) {
      try {
        const norm = lang.toLowerCase()
        const harness = buildTestHarness(code, tests, lang)
        const traced = (norm === 'python' || norm === 'py')
          ? await runPython(harness)
          : runJS(harness)
        setTraceEvents(traced.events)
        setTraceStep(0)
        if (traced.events.length > 0) onTrace(traced.events, code, 0)
      } catch { /* trace failure doesn't break test results */ }
    }

    setRunning(false)
  }

  const isTracing = traceEvents.length > 0
  const currentLine = traceEvents[traceStep]?.line ?? traceEvents[traceStep]?.sourceLocation?.line ?? null
  const codeLines = code.split('\n')

  const passed = results?.filter(r => r.passed).length ?? 0
  const total = results?.length ?? 0
  const allPassed = results !== null && passed === total

  return (
    <div className="flex flex-col gap-3 h-full">
      {prose && (
        <div className={`${styles.prose} ${ui.txt1} text-sm`}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              pre: CodeBlockPre,
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
            {prose}
          </ReactMarkdown>
        </div>
      )}

      <div className={`rounded-xl overflow-hidden border ${ui.border} flex flex-col flex-1`}>
        {/* Header */}
        <div className={`flex items-center gap-2 px-3 py-1.5 ${ui.bg1} border-b ${ui.border} shrink-0`}>
          <span className={`text-[11px] font-bold uppercase tracking-wide ${ui.txt2}`}>{lang}</span>
          <div className="flex items-center gap-2 ml-auto">
            {isTracing && (
              <>
                <button type="button" onClick={() => seek(Math.max(0, traceStep - 1))} disabled={traceStep === 0}
                  className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded border ${ui.border} ${ui.bg0} ${ui.txt1} disabled:opacity-30 cursor-pointer bg-transparent`}>‹</button>
                <span className={`text-[11px] tabular-nums ${ui.txt2}`}>{traceStep + 1} / {traceEvents.length}</span>
                <button type="button" onClick={() => seek(Math.min(traceEvents.length - 1, traceStep + 1))} disabled={traceStep === traceEvents.length - 1}
                  className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded border ${ui.border} ${ui.bg0} ${ui.txt1} disabled:opacity-30 cursor-pointer bg-transparent`}>›</button>
                <div className={`w-px h-4 ${ui.border} border-l mx-1`} />
                <button type="button" onClick={() => { setTraceEvents([]); setTraceStep(0) }}
                  className={`text-[11px] ${ui.txt2} hover:text-red-400 bg-transparent border-none cursor-pointer`}>✕ exit debug</button>
              </>
            )}
            {!isTracing && (
              <label className={`flex items-center gap-1 text-[11px] cursor-pointer select-none ${debugOn ? 'text-brand-400' : ui.txt2}`}>
                <input type="checkbox" checked={debugOn} onChange={e => setDebugOn(e.target.checked)} className="w-3 h-3 accent-brand-500" />
                Debug
              </label>
            )}
            <button type="button"
              className="bg-brand-500 hover:bg-brand-600 text-xs font-semibold px-3 py-0.5 rounded border-none cursor-pointer text-white disabled:opacity-40"
              onClick={handleRun} disabled={running || !tests}>
              {running ? '…' : isTracing ? '↺ Re-run Tests' : '▶ Run Tests'}
            </button>
          </div>
        </div>

        {/* Code — Monaco when editing, line-highlighted when tracing */}
        {isTracing ? (
          <div className={`${styles.traceView} ${ui.bg0} overflow-x-auto flex-1`}>
            {codeLines.map((line, i) => {
              const lineNum = i + 1
              const isActive = lineNum === currentLine
              return (
                <div key={i} className={`flex items-start gap-3 px-3 py-0.5 font-mono text-[13px] leading-relaxed ${isActive ? 'bg-brand-500/20' : ''}`}>
                  <span className={`select-none w-5 text-right shrink-0 text-[11px] mt-[1px] ${isActive ? 'text-brand-400 font-bold' : ui.txt2} opacity-60`}>{lineNum}</span>
                  <span className={isActive ? 'text-brand-300' : ui.txt1}>{line || ' '}</span>
                  {isActive && <span className="ml-auto text-brand-400 text-[11px] shrink-0">←</span>}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <Editor
              key={challenge?.code}
              height="100%"
              language={toMonacoLang(lang)}
              value={code}
              theme={monacoTheme}
              beforeMount={setupOpenCalcMonaco}
              onChange={v => setCode(v ?? '')}
              options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, lineNumbers: 'on', padding: { top: 8, bottom: 8 } }}
            />
          </div>
        )}
      </div>

      {results && (
        <div className={`rounded-xl border ${allPassed ? 'border-green-500/40' : 'border-red-400/40'} overflow-hidden shrink-0`}>
          <div className={`px-3 py-2 text-xs font-semibold ${ui.bg1} border-b ${ui.border}`}>
            <span className={allPassed ? 'text-green-400' : 'text-red-400'}>
              {allPassed ? '✓ All tests passed' : `${passed} / ${total} passed`}
            </span>
          </div>
          <div className={`${ui.bg0} divide-y ${ui.border}`}>
            {results.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 px-3 py-2 text-xs ${styles.codeFont}`}>
                <span className={r.passed ? 'text-green-400' : 'text-red-400'}>{r.passed ? '✓' : '✗'}</span>
                <span className={ui.txt1}>{r.label}</span>
                {r.detail && <span className="text-red-400 ml-auto">{r.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
