import { useCallback, useMemo, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Columns2, FileCode2, Maximize2, Minimize2, Play, RotateCcw } from 'lucide-react'
import { setupOpenCalcMonaco } from '../../utils/monacoThemes.js'
import { executeScript } from '../../utils/openmatEngine.js'

let pyodidePromise = null

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (!window.loadPyodide) {
        await withTimeout(new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load Pyodide. Check network access or try again.'))
          document.head.appendChild(script)
        }), 30000, 'Timed out loading Pyodide. The first Python run downloads the runtime; check network access and try again.')
      }
      return withTimeout(window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
        fullStdLib: false,
      }), 45000, 'Timed out initializing Pyodide.')
    })().catch((error) => {
      pyodidePromise = null
      throw error
      })
  }
  return pyodidePromise
}

function withTimeout(promise, ms, message) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId))
}

const STARTERS = {
  javascript: {
    label: 'JavaScript',
    monaco: 'javascript',
    output: 'console',
    code: `const values = [2, 4, 6, 8]
const total = values.reduce((sum, value) => sum + value, 0)
console.log('total =', total)
console.log('average =', total / values.length)`,
  },
  html: {
    label: 'HTML',
    monaco: 'html',
    output: 'preview',
    code: `<main>
  <h1>Code along</h1>
  <p>Edit this document and run it.</p>
</main>

<style>
  body { font-family: system-ui; padding: 2rem; }
  h1 { color: #2563eb; }
</style>

<script>
  console.log('HTML preview loaded')
</script>`,
  },
  react: {
    label: 'React',
    monaco: 'javascript',
    output: 'preview',
    code: `function App() {
  const [count, setCount] = React.useState(0)
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>React code-along</h1>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </main>
  )
}`,
  },
  python: {
    label: 'Python',
    monaco: 'python',
    output: 'console',
    code: `values = [2, 4, 6, 8]
total = sum(values)
print("total =", total)
print("average =", total / len(values))`,
  },
  cpp: {
    label: 'C++',
    monaco: 'cpp',
    output: 'console',
    code: `#include <iostream>
using namespace std;

// Browser C++ mode is a lightweight docs runner.
// Add an __OUTPUT__ line to declare expected console output.
// __OUTPUT__: total = 20
int main() {
    cout << "total = " << 20 << endl;
    return 0;
}`,
  },
  matlab: {
    label: 'OpenMAT',
    monaco: 'openmat',
    output: 'console',
    code: `% OpenMAT uses MATLAB-style syntax and runs through the in-app engine.
t = linspace(0, 2*pi, 12);
y = sin(t);

disp("sampled sine values")
y

A = [1 2; 3 4]
det(A)`,
  },
}

function buildHtmlDoc(code) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
${code}
</body>
</html>`
}

function buildReactDoc(code) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="react">
${code}
try {
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))
} catch (error) {
  document.body.innerHTML = '<pre style="color:#dc2626;white-space:pre-wrap">' + error.message + '</pre>'
}
  <\/script>
</body>
</html>`
}

function runJavaScript(code) {
  const logs = []
  const api = {
    log: (...args) => logs.push(args.map(formatConsoleValue).join(' ')),
    warn: (...args) => logs.push(`Warning: ${args.map(formatConsoleValue).join(' ')}`),
    error: (...args) => logs.push(`Error: ${args.map(formatConsoleValue).join(' ')}`),
  }
  const result = Function('console', `"use strict";\n${code}`)(api)
  if (result !== undefined) logs.push(formatConsoleValue(result))
  return logs.join('\n') || 'No output.'
}

function runCppLite(code) {
  const declared = [...code.matchAll(/__OUTPUT__:\s*(.*)/g)].map((match) => match[1].trim())
  if (declared.length) return declared.join('\n')

  const literalCouts = [...code.matchAll(/cout\s*<<\s*["'`](.*?)["'`]/g)].map((match) => match[1])
  if (literalCouts.length) return literalCouts.join('\n')

  return [
    'C++ docs runner ready.',
    'For deterministic browser output, add comments like:',
    '// __OUTPUT__: Hello from C++',
    '',
    'For full compile-and-run workflows, open the C++ lab or terminal tool.',
  ].join('\n')
}

function formatConsoleValue(value) {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export default function DocsCodeWorkspace({ activeTitle = 'Docs' }) {
  const [language, setLanguage] = useState('javascript')
  const [codeByLanguage, setCodeByLanguage] = useState(() =>
    Object.fromEntries(Object.entries(STARTERS).map(([key, value]) => [key, value.code])),
  )
  const [output, setOutput] = useState('Choose a language and press Run.')
  const [previewDoc, setPreviewDoc] = useState('')
  const [running, setRunning] = useState(false)
  const [outputMode, setOutputMode] = useState('split')
  const editorRef = useRef(null)

  const current = STARTERS[language]
  const code = codeByLanguage[language] ?? current.code

  const languageOptions = useMemo(() => Object.entries(STARTERS), [])

  const run = useCallback(async () => {
    setRunning(true)
    setOutput('Running...')
    try {
      if (language === 'javascript') {
        setPreviewDoc('')
        setOutput(runJavaScript(code))
      } else if (language === 'html') {
        setPreviewDoc(buildHtmlDoc(code))
        setOutput('Preview refreshed.')
      } else if (language === 'react') {
        setPreviewDoc(buildReactDoc(code))
        setOutput('React preview refreshed.')
      } else if (language === 'python') {
        setOutput('Loading Python runtime...')
        const pyodide = await getPyodide()
        const logs = []
        pyodide.setStdout({ batched: (text) => logs.push(text) })
        pyodide.setStderr({ batched: (text) => logs.push(text) })
        setOutput('Executing Python...')
        const result = await withTimeout(
          pyodide.runPythonAsync(code),
          20000,
          'Python execution timed out.',
        )
        if (result !== undefined) logs.push(String(result))
        setPreviewDoc('')
        setOutput(logs.join('\n') || 'No output.')
      } else if (language === 'cpp') {
        setPreviewDoc('')
        setOutput(runCppLite(code))
      } else if (language === 'matlab') {
        const result = executeScript(code)
        setPreviewDoc('')
        setOutput([
          ...(result.compatibilityWarnings?.length ? [`Warnings:\n${result.compatibilityWarnings.join('\n')}`, ''] : []),
          result.output || 'No output.',
          result.workspace?.length
            ? `\nWorkspace:\n${result.workspace.map((item) => `${item.name}: ${item.summary || item.className || item.size}`).join('\n')}`
            : '',
        ].filter(Boolean).join('\n'))
      }
    } catch (error) {
      setPreviewDoc('')
      setOutput(error?.message || String(error))
    } finally {
      setRunning(false)
    }
  }, [code, language])

  const reset = useCallback(() => {
    setCodeByLanguage((previous) => ({ ...previous, [language]: STARTERS[language].code }))
    setOutput('Starter restored.')
    setPreviewDoc('')
  }, [language])

  const outputIsFull = outputMode === 'full'

  return (
    <section className="h-full min-h-0 flex flex-col bg-slate-950 text-slate-100 border-l border-slate-800">
      <header className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-slate-800 bg-slate-900">
        <FileCode2 className="w-4 h-4 text-cyan-300" />
        <div className="min-w-0 mr-auto">
          <div className="text-xs font-bold truncate">Code Along</div>
          <div className="text-[10px] text-slate-400 truncate">{activeTitle}</div>
        </div>
        <select
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value)
            setPreviewDoc('')
            setOutput('Language changed. Press Run when ready.')
          }}
          className="h-8 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-100 px-2 outline-none"
          title="Language"
        >
          {languageOptions.map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </select>
        <button
          onClick={run}
          disabled={running}
          className="h-8 inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 px-3 text-xs font-bold text-white transition-colors"
          title="Run code"
        >
          <Play className="w-3.5 h-3.5" /> {running ? 'Running' : 'Run'}
        </button>
        <button
          onClick={reset}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          title="Reset starter"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setOutputMode((mode) => (mode === 'split' ? 'full' : 'split'))}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          title={outputIsFull ? 'Restore editor and output split' : 'Pop output out'}
        >
          {outputIsFull ? <Columns2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </header>

      <div className={`flex-1 min-h-0 grid ${outputIsFull ? 'grid-rows-[0_minmax(0,1fr)]' : 'grid-rows-[minmax(0,1fr)_minmax(150px,34%)]'}`}>
        <div className={outputIsFull ? 'hidden' : 'min-h-0'}>
          <Editor
            value={code}
            language={current.monaco}
            theme="vs-dark"
            beforeMount={setupOpenCalcMonaco}
            onMount={(editor) => {
              editorRef.current = editor
            }}
            onChange={(value) => setCodeByLanguage((previous) => ({ ...previous, [language]: value ?? '' }))}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
            }}
          />
        </div>

        <div className="min-h-0 border-t border-slate-800 bg-slate-950 flex flex-col">
          <div className="h-8 shrink-0 flex items-center gap-2 px-3 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span>{current.output === 'preview' ? 'Preview' : 'Console Output'}</span>
            <button
              onClick={() => setOutputMode((mode) => (mode === 'split' ? 'full' : 'split'))}
              className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              title={outputIsFull ? 'Restore split view' : 'Expand output'}
            >
              {outputIsFull ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
          {previewDoc ? (
            <iframe
              title="Docs code preview"
              srcDoc={previewDoc}
              sandbox="allow-scripts"
              className="flex-1 w-full bg-white"
            />
          ) : (
            <pre className="flex-1 overflow-auto whitespace-pre-wrap p-3 text-xs leading-relaxed text-slate-200 font-mono">
              {output}
            </pre>
          )}
        </div>
      </div>
    </section>
  )
}
