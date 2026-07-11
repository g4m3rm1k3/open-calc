import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import type { CodeSnippet, Executor, UiTheme } from './types'
import { runPython } from '../../labs/codelens/codelens/interpreter/pythonTracer'
import { run as runJS } from '../../engines/js/interpreter/interpreter.js'
import type { TraceEvent } from '../../labs/codelens/codelens/types'

interface Props {
  snippet: CodeSnippet
  executor: Executor
  ui: UiTheme
  onTrace?: (events: TraceEvent[], code: string, step: number) => void
  onOutput?: (lines: { text: string; kind: string }[]) => void
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

export default function RunExample({ snippet, executor, ui, onTrace, onOutput }: Props) {
  const { themeStyles } = useGlobalTheme() as any
  const monacoTheme = themeStyles?.monaco ?? 'vs-dark'

  const [code, setCode] = useState(snippet.code)
  const [running, setRunning] = useState(false)
  const [debugOn, setDebugOn] = useState(false)
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([])
  const [traceStep, setTraceStep] = useState(0)

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const decorationsRef = useRef<string[]>([])

  useEffect(() => {
    setCode(snippet.code)
    setDebugOn(false)
    setTraceEvents([])
    setTraceStep(0)
  }, [snippet.code])

  // Highlight current line in Monaco via decorations — no view swap needed
  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    if (!editor || !monaco) return

    if (traceEvents.length === 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [])
      return
    }

    const ln = traceEvents[traceStep]?.line ?? traceEvents[traceStep]?.sourceLocation?.line
    if (ln == null) return

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [{
      range: new monaco.Range(ln, 1, ln, 1),
      options: {
        isWholeLine: true,
        className: 'oc-trace-line',
        lineNumberClassName: 'oc-trace-line-number',
      }
    }])
    editor.revealLineInCenter(ln)
  }, [traceStep, traceEvents])

  function seek(step: number) {
    setTraceStep(step)
    if (onTrace) onTrace(traceEvents, code, step)
  }

  async function run() {
    setRunning(true)
    setTraceEvents([])
    setTraceStep(0)
    if (onOutput) onOutput([])

    const norm = snippet.lang.toLowerCase()
    const isPython = norm === 'python' || norm === 'py'

    if (debugOn && isPython) {
      try {
        const traced = await runPython(code)
        const lines = [
          ...traced.output.map(t => ({ text: t, kind: 'stdout' })),
          ...(traced.error ? [{ text: traced.error.message, kind: 'error' }] : []),
        ]
        if (onOutput) onOutput(lines.length ? lines : [{ text: '(no output)', kind: 'stdout' }])
        setTraceEvents(traced.events)
        setTraceStep(0)
        if (onTrace && traced.events.length > 0) onTrace(traced.events, code, 0)
      } catch (e) {
        if (onOutput) onOutput([{ text: String(e), kind: 'error' }])
      }
    } else if (debugOn && !isPython) {
      try {
        const traced = runJS(code)
        const outputLines: string[] = 'output' in traced ? (traced as any).output : []
        const lines = [
          ...outputLines.map((t: string) => ({ text: t, kind: 'stdout' })),
          ...(traced.error ? [{ text: traced.error.message, kind: 'error' }] : []),
        ]
        if (onOutput) onOutput(lines.length ? lines : [{ text: '(no output)', kind: 'stdout' }])
        setTraceEvents(traced.events)
        setTraceStep(0)
        if (onTrace && traced.events.length > 0) onTrace(traced.events, code, 0)
      } catch (e) {
        if (onOutput) onOutput([{ text: String(e), kind: 'error' }])
      }
    } else {
      const r = await executor(code, snippet.lang)
      if (onOutput) onOutput(r.lines)
    }

    setRunning(false)
  }

  const isTracing = traceEvents.length > 0
  const currentLine = traceEvents[traceStep]?.line ?? traceEvents[traceStep]?.sourceLocation?.line ?? null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-1.5 ${ui.bg1} border-b ${ui.border} shrink-0`}>
        <span className={`text-[11px] font-bold uppercase tracking-wide ${ui.txt2}`}>{snippet.lang}</span>
        {isTracing && currentLine != null && (
          <span className={`text-[10px] font-mono text-brand-400`}>line {currentLine}</span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {isTracing && (
            <>
              <button type="button" onClick={() => seek(Math.max(0, traceStep - 1))} disabled={traceStep === 0}
                className="text-sm font-bold w-6 h-6 flex items-center justify-center rounded bg-brand-500/15 border border-brand-500/40 text-brand-400 disabled:opacity-30 cursor-pointer">‹</button>
              <span className="text-[11px] tabular-nums font-semibold text-brand-400">{traceStep + 1} / {traceEvents.length}</span>
              <button type="button" onClick={() => seek(Math.min(traceEvents.length - 1, traceStep + 1))} disabled={traceStep === traceEvents.length - 1}
                className="text-sm font-bold w-6 h-6 flex items-center justify-center rounded bg-brand-500/15 border border-brand-500/40 text-brand-400 disabled:opacity-30 cursor-pointer">›</button>
              <div className={`w-px h-4 ${ui.border} border-l mx-1`} />
              <button type="button" onClick={() => { setTraceEvents([]); setTraceStep(0) }}
                className={`text-[11px] ${ui.txt2} hover:text-red-400 bg-transparent border-none cursor-pointer`}>✕ exit</button>
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

      {/* Monaco — always mounted; decorations drive the trace highlight */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={toMonacoLang(snippet.lang)}
          value={code}
          theme={monacoTheme}
          beforeMount={setupOpenCalcMonaco}
          onChange={v => { if (!isTracing) setCode(v ?? '') }}
          onMount={(editor, monaco) => {
            editorRef.current = editor
            monacoRef.current = monaco
          }}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            padding: { top: 8, bottom: 8 },
            fontLigatures: false,
            readOnly: isTracing,
            domReadOnly: isTracing,
          }}
        />
      </div>
    </div>
  )
}
