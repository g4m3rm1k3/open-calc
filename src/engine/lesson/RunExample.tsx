import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import type { CodeSnippet, Executor, UiTheme } from './types'
import { runPython } from '../../labs/codelens/codelens/interpreter/pythonTracer'
import { run as runJS } from '../../engines/js/interpreter/interpreter.js'
import type { TraceEvent } from '../../labs/codelens/codelens/types'
import styles from './LessonEngine.module.css'

interface Props {
  snippet: CodeSnippet
  executor: Executor
  ui: UiTheme
  onTrace?: (events: TraceEvent[], code: string, step: number) => void
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

export default function RunExample({ snippet, executor, ui, onTrace }: Props) {
  const { themeStyles } = useGlobalTheme() as any
  const monacoTheme = themeStyles?.monaco ?? 'vs-dark'

  const [code, setCode] = useState(snippet.code)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<{ text: string; kind: string }[] | null>(null)
  const [debugOn, setDebugOn] = useState(false)
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([])
  const [traceStep, setTraceStep] = useState(0)

  useEffect(() => {
    setCode(snippet.code)
    setOutput(null)
    setDebugOn(false)
    setTraceEvents([])
    setTraceStep(0)
  }, [snippet.code])

  function seek(step: number) {
    setTraceStep(step)
    if (onTrace) onTrace(traceEvents, code, step)
  }

  async function run() {
    setRunning(true)
    setOutput(null)
    setTraceEvents([])
    setTraceStep(0)

    const norm = snippet.lang.toLowerCase()
    const isPython = norm === 'python' || norm === 'py'

    if (debugOn && isPython) {
      try {
        const traced = await runPython(code)
        const lines = [
          ...traced.output.map(t => ({ text: t, kind: 'stdout' })),
          ...(traced.error ? [{ text: traced.error.message, kind: 'error' }] : []),
        ]
        setOutput(lines.length ? lines : [{ text: '(no output)', kind: 'stdout' }])
        setTraceEvents(traced.events)
        setTraceStep(0)
        if (onTrace && traced.events.length > 0) onTrace(traced.events, code, 0)
      } catch (e) {
        setOutput([{ text: String(e), kind: 'error' }])
      }
    } else if (debugOn && !isPython) {
      try {
        const traced = runJS(code)
        const outputLines: string[] = 'output' in traced ? (traced as any).output : []
        const lines = [
          ...outputLines.map((t: string) => ({ text: t, kind: 'stdout' })),
          ...(traced.error ? [{ text: traced.error.message, kind: 'error' }] : []),
        ]
        setOutput(lines.length ? lines : [{ text: '(no output)', kind: 'stdout' }])
        setTraceEvents(traced.events)
        setTraceStep(0)
        if (onTrace && traced.events.length > 0) onTrace(traced.events, code, 0)
      } catch (e) {
        setOutput([{ text: String(e), kind: 'error' }])
      }
    } else {
      const r = await executor(code, snippet.lang)
      setOutput(r.lines)
    }

    setRunning(false)
  }

  const isTracing = traceEvents.length > 0
  const currentLine = traceEvents[traceStep]?.line ?? traceEvents[traceStep]?.sourceLocation?.line ?? null
  const codeLines = code.split('\n')
  const editorHeight = Math.max(100, Math.min(360, codeLines.length * 20 + 16))

  return (
    <div className={`rounded-xl overflow-hidden border ${ui.border} mb-4`}>

      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-1.5 ${ui.bg1} border-b ${ui.border}`}>
        <span className={`text-[11px] font-bold uppercase tracking-wide ${ui.txt2}`}>{snippet.lang}</span>
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
            onClick={run} disabled={running}>
            {running ? '…' : isTracing ? '↺ Re-run' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Code — Monaco when editing, line-highlighted when tracing */}
      {isTracing ? (
        <div className={`${styles.traceView} ${ui.bg0} overflow-x-auto`}>
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
        <Editor
          key={snippet.code}
          height={`${editorHeight}px`}
          language={toMonacoLang(snippet.lang)}
          value={code}
          theme={monacoTheme}
          beforeMount={setupOpenCalcMonaco}
          onChange={v => setCode(v ?? '')}
          options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, lineNumbers: 'on', padding: { top: 8, bottom: 8 } }}
        />
      )}

      {/* Output */}
      {output && (
        <div className={`${styles.outputPanel} ${ui.bg1} border-t ${ui.border}`}>
          {output.map((line, i) => (
            <div key={i} className={`${styles.codeFont} whitespace-pre-wrap break-all ${line.kind === 'error' ? 'text-red-500' : line.kind === 'stderr' ? 'text-orange-400' : ui.txt1}`}>
              {line.text}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
