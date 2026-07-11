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
  snippets?: CodeSnippet[]
  executor: Executor
  ui: UiTheme
  onTrace?: (events: TraceEvent[], code: string, step: number) => void
  onSeek?: (step: number) => void
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

function labelFor(snippet: CodeSnippet, index: number): string {
  const n = snippet.lang.toLowerCase()
  if (n === 'js') return 'JavaScript'
  if (n === 'ts') return 'TypeScript'
  if (n === 'cpp' || n === 'c++') return 'C++'
  if (n === 'csharp' || n === 'cs') return 'C#'
  return snippet.lang.toUpperCase() || `File ${index + 1}`
}

function safeScript(code: string): string {
  return code.replace(/<\/script/gi, '<\\/script')
}

function buildWebPreview(codes: CodeSnippet[]): string {
  const html = codes.find(s => s.lang.toLowerCase() === 'html')?.code ?? '<main id="app"></main>'
  const css = codes.filter(s => s.lang.toLowerCase() === 'css').map(s => s.code).join('\n\n')
  const js = codes
    .filter(s => ['javascript', 'js'].includes(s.lang.toLowerCase()))
    .map(s => s.code)
    .join('\n\n')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; color: #0f172a; background: #f8fafc; }
    #__oc_console { margin-top: 16px; padding: 10px; border-radius: 8px; background: #0f172a; color: #e2e8f0; font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: pre-wrap; }
    #__oc_console:empty { display: none; }
    ${css}
  </style>
</head>
<body>
${html}
<pre id="__oc_console"></pre>
<script>
(() => {
  const out = document.getElementById('__oc_console');
  const write = (kind, values) => {
    out.textContent += values.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(' ') + "\\n";
  };
  ['log', 'warn', 'error'].forEach(kind => {
    const original = console[kind];
    console[kind] = (...values) => { write(kind, values); original.apply(console, values); };
  });
})();
try {
${safeScript(js)}
} catch (error) {
  console.error(error?.message || String(error));
}
</script>
</body>
</html>`
}

export default function RunExample({ snippet, snippets, executor, ui, onTrace, onSeek, onOutput }: Props) {
  const { themeStyles } = useGlobalTheme() as any
  const monacoTheme = themeStyles?.monaco ?? 'vs-dark'

  const allSnippets = snippets?.length ? snippets : [snippet]
  const [activeIdx, setActiveIdx] = useState(0)
  const [codes, setCodes] = useState(() => allSnippets.map(s => s.code))
  const [running, setRunning] = useState(false)
  const [debugOn, setDebugOn] = useState(false)
  const [traceEvents, setTraceEvents] = useState<TraceEvent[]>([])
  const [traceStep, setTraceStep] = useState(0)

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const decorationsRef = useRef<string[]>([])
  const allSnippetsRef = useRef(allSnippets)
  allSnippetsRef.current = allSnippets

  useEffect(() => {
    setCodes(allSnippets.map(s => s.code))
    setActiveIdx(0)
    setDebugOn(false)
    setTraceEvents([])
    setTraceStep(0)
  }, [snippets, snippet.code])

  // Auto-render web examples (html+css) immediately — no Run click needed
  useEffect(() => {
    const snips = allSnippetsRef.current
    if (!snips.some(s => s.lang.toLowerCase() === 'html') || !onOutput) return
    onOutput([{ kind: 'preview', text: buildWebPreview(snips.map((s, i) => ({ ...s, code: codes[i] ?? s.code }))) }])
  }, [codes])

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
    if (onSeek) onSeek(step)
  }

  async function run() {
    setRunning(true)
    setTraceEvents([])
    setTraceStep(0)
    if (onOutput) onOutput([])

    const activeSnippet = allSnippets[Math.min(activeIdx, allSnippets.length - 1)] ?? snippet
    const code = codes[Math.min(activeIdx, codes.length - 1)] ?? ''
    const currentSnippets = allSnippets.map((s, i) => ({ ...s, code: codes[i] ?? s.code }))
    const isWebExample = currentSnippets.some(s => s.lang.toLowerCase() === 'html')
    const norm = activeSnippet.lang.toLowerCase()
    const isPython = norm === 'python' || norm === 'py'
    const isJavaScript = norm === 'javascript' || norm === 'js'

    if (isWebExample) {
      if (onOutput) onOutput([{ kind: 'preview', text: buildWebPreview(currentSnippets) }])
    } else if (debugOn && isPython) {
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
    } else if (debugOn && isJavaScript) {
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
    } else if (debugOn) {
      if (onOutput) onOutput([{ text: `Step-through debug is available for Python and JavaScript in this browser engine.`, kind: 'error' }])
    } else {
      const r = await executor(code, activeSnippet.lang)
      if (onOutput) onOutput(r.lines)
    }

    setRunning(false)
  }

  const isTracing = traceEvents.length > 0
  const currentLine = traceEvents[traceStep]?.line ?? traceEvents[traceStep]?.sourceLocation?.line ?? null
  const activeSnippet = allSnippets[Math.min(activeIdx, allSnippets.length - 1)] ?? snippet
  const activeCode = codes[Math.min(activeIdx, codes.length - 1)] ?? ''
  const isWebExample = allSnippets.some(s => s.lang.toLowerCase() === 'html')
  const canDebug = !isWebExample && ['python', 'py', 'javascript', 'js'].includes(activeSnippet.lang.toLowerCase())

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-1.5 ${ui.bg1} border-b ${ui.border} shrink-0`}>
        <span className={`text-[11px] font-bold uppercase tracking-wide ${ui.txt2}`}>{activeSnippet.lang}</span>
        {isTracing && currentLine != null && (
          <span className={`text-[10px] font-mono text-brand-400`}>line {currentLine}</span>
        )}
        {allSnippets.length > 1 && (
          <div className={`flex items-center gap-1 ml-2 border-l ${ui.border} pl-2`}>
            {allSnippets.map((s, i) => (
              <button
                key={`${s.lang}-${i}`}
                type="button"
                onClick={() => !isTracing && setActiveIdx(i)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                  i === activeIdx
                    ? 'border-brand-500/40 bg-brand-500/15 text-brand-400'
                    : `${ui.btnBorder} ${ui.txt2} bg-transparent hover:text-brand-400`
                }`}
              >
                {labelFor(s, i)}
              </button>
            ))}
          </div>
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
              <input type="checkbox" checked={debugOn && canDebug} disabled={!canDebug} onChange={e => setDebugOn(e.target.checked)} className="w-3 h-3 accent-brand-500 disabled:opacity-40" />
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
          language={toMonacoLang(activeSnippet.lang)}
          value={activeCode}
          theme={monacoTheme}
          beforeMount={setupOpenCalcMonaco}
          onChange={v => {
            if (isTracing) return
            setCodes(prev => prev.map((code, i) => i === activeIdx ? (v ?? '') : code))
          }}
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
