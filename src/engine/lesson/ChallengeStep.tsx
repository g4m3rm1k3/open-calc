import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { useGlobalTheme } from '../../context/ThemeContext.jsx'
import type { LessonStep, Executor, UiTheme, TestResult } from './types'
import type { TraceEvent } from '../../labs/codelens/codelens/types'
import { runTests, runCSSTests, runJSXTests, buildTestHarness } from './testRunner'
import { runPython } from '../../labs/codelens/codelens/interpreter/pythonTracer'
import { run as runJS } from '../../engines/js/interpreter/interpreter.js'

interface Props {
  step: LessonStep
  executor: Executor
  ui: UiTheme
  onTrace: (events: TraceEvent[], code: string, step: number) => void
  onSeek?: (step: number) => void
  onResults?: (results: TestResult[]) => void
  onOutput?: (lines: { text: string; kind: string }[]) => void
}

function toMonacoLang(lang: string): string {
  const n = lang.toLowerCase()
  if (n === 'py') return 'python'
  if (n === 'js') return 'javascript'
  if (n === 'ts') return 'typescript'
  if (n === 'cpp' || n === 'c++') return 'cpp'
  if (n === 'csharp' || n === 'cs') return 'csharp'
  if (n === 'sqlite') return 'sql'
  if (n === 'sh' || n === 'shell') return 'shell'
  return n
}

export default function ChallengeStep({ step, executor, ui, onTrace, onSeek, onResults, onOutput }: Props) {
  const { themeStyles } = useGlobalTheme() as any
  const monacoTheme = themeStyles?.monaco ?? 'vs-dark'

  const { challenge, tests } = step
  const lang = challenge?.lang ?? 'python'

  const [code, setCode] = useState(challenge?.code ?? '')
  const [running, setRunning] = useState(false)
  const [debugOn, setDebugOn] = useState(false)
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([])
  const [traceStep, setTraceStep] = useState(0)
  const [activeFileTab, setActiveFileTab] = useState<'html' | 'css'>('css')

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const decorationsRef = useRef<string[]>([])

  useEffect(() => {
    setCode(challenge?.code ?? '')
    setDebugOn(false)
    setTraceEvents([])
    setTraceStep(0)
    setActiveFileTab('css')
  }, [challenge?.code])

  // Highlight current line in Monaco via decorations
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

  function seek(s: number) {
    setTraceStep(s)
    if (onSeek) onSeek(s)
  }

  async function handleRun() {
    if (!tests) return
    setRunning(true)
    setTraceEvents([])
    setTraceStep(0)

    const norm = lang.toLowerCase()
    const isCSSChallenge = norm === 'css'
    const isJSXChallenge = norm === 'jsx' || norm === 'react'
    const isVueChallenge = norm === 'vue'
    const htmlStructure = isCSSChallenge
      ? (step.examples.find(e => e.lang.toLowerCase() === 'html')?.code ?? '')
      : ''

    const testResults = isCSSChallenge
      ? await runCSSTests(code, htmlStructure, tests)
      : isJSXChallenge
        ? await runJSXTests(code, tests, 'react')
        : isVueChallenge
          ? await runJSXTests(code, tests, 'vue')
          : await runTests(code, tests, lang, executor)
    if (onResults) onResults(testResults)

    // For CSS challenges: emit a live DOM preview so the DOM tab shows the result
    if ((isCSSChallenge || isJSXChallenge || isVueChallenge) && onOutput && htmlStructure) {
      const previewDoc = `<!DOCTYPE html><html><head><style>${code}</style></head><body>${htmlStructure}</body></html>`
      onOutput([{ text: previewDoc, kind: 'preview' }])
    }

    if (debugOn) {
      try {
        const norm = lang.toLowerCase()
        if (!['python', 'py', 'javascript', 'js'].includes(norm)) {
          setRunning(false)
          return
        }
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
  const canDebug = ['python', 'py', 'javascript', 'js'].includes(lang.toLowerCase())
  const isCSSChallenge = lang.toLowerCase() === 'css'
  const isJSXChallenge = lang.toLowerCase() === 'jsx' || lang.toLowerCase() === 'react'
  const isVueChallenge = lang.toLowerCase() === 'vue'
  const htmlStructure = isCSSChallenge
    ? (step.examples.find(e => e.lang.toLowerCase() === 'html')?.code ?? '')
    : ''

  // File tabs for multi-file challenges (CSS = index.html + styles.css)
  const fileTabs = isCSSChallenge && htmlStructure
    ? [
        { id: 'html' as const, label: 'index.html',  lang: 'html', value: htmlStructure, readOnly: true  },
        { id: 'css'  as const, label: 'styles.css',  lang: 'css',  value: code,          readOnly: false },
      ]
    : null

  const activeTab = fileTabs?.find(t => t.id === activeFileTab) ?? null

  // Shared controls rendered on right side of whatever header row is used
  const controls = (
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
      {!isTracing && !isCSSChallenge && (
        <label className={`flex items-center gap-1 text-[11px] cursor-pointer select-none ${debugOn ? 'text-brand-400' : ui.txt2}`}>
          <input type="checkbox" checked={debugOn && canDebug} disabled={!canDebug} onChange={e => setDebugOn(e.target.checked)} className="w-3 h-3 accent-brand-500 disabled:opacity-40" />
          Debug
        </label>
      )}
      <button type="button"
        className="bg-brand-500 hover:bg-brand-600 text-xs font-semibold px-3 py-0.5 rounded border-none cursor-pointer text-white disabled:opacity-40"
        onClick={handleRun} disabled={running || !tests}>
        {running ? '…' : isTracing ? '↺ Re-run Tests' : '▶ Run Tests'}
      </button>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {fileTabs ? (
        /* Tab bar — same style as the right panel tabs */
        <div className={`flex items-center px-2 pt-1.5 border-b ${ui.border} ${ui.bg1} shrink-0 gap-1`}>
          {fileTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFileTab(tab.id)}
              className={`relative px-3 py-1.5 text-[12px] font-mono font-medium rounded-t-md border-t border-l border-r transition-colors cursor-pointer shrink-0 ${
                activeFileTab === tab.id
                  ? `-mb-px border-brand-500/30 ${ui.bg0} text-brand-400`
                  : `mb-0 ${ui.border} bg-transparent ${ui.txt2} hover:text-brand-400`
              }`}
            >
              {tab.label}
              {tab.readOnly && <span className="ml-1.5 text-[9px] opacity-40 font-sans">read-only</span>}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto pb-1">
            {controls}
          </div>
        </div>
      ) : (
        /* Single-file toolbar */
        <div className={`flex items-center gap-2 px-3 py-1.5 ${ui.bg1} border-b ${ui.border} shrink-0`}>
          <span className={`text-[11px] font-bold uppercase tracking-wide ${ui.txt2}`}>{lang}</span>
          {isTracing && currentLine != null && (
            <span className={`text-[10px] font-mono text-brand-400`}>line {currentLine}</span>
          )}
          {controls}
        </div>
      )}

      {/* Editor area — single or tabbed */}
      <div className="flex-1 min-h-0">
        {activeTab ? (
          /* Tabbed: render whichever file tab is active */
          activeTab.readOnly ? (
            <Editor
              key={activeTab.id}
              height="100%"
              language={toMonacoLang(activeTab.lang)}
              value={activeTab.value}
              theme={monacoTheme}
              beforeMount={setupOpenCalcMonaco}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'on',
                padding: { top: 8, bottom: 8 },
                readOnly: true,
                domReadOnly: true,
                renderLineHighlight: 'none',
              }}
            />
          ) : (
            <Editor
              key={activeTab.id}
              height="100%"
              language={toMonacoLang(activeTab.lang)}
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
          )
        ) : (
          /* Single file: original behaviour */
          <Editor
            height="100%"
            language={toMonacoLang(lang)}
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
        )}
      </div>
    </div>
  )
}
