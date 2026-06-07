import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { getPyodide } from '../../utils/pyodideRuntime.js'
import { executeScript } from '../../utils/openmatEngine.js'

// ── Terminal colours ──────────────────────────────────────────────────────────
const CLR_DARK = {
  prompt:  '#73c991',
  output:  '#d4d4d4',
  error:   '#f47067',
  info:    '#4fc3f7',
  success: '#73c991',
  warn:    '#e2c08d',
  dim:     '#4a5568',
  cmd:     '#c586c0',
  bg:      '#080f1a',
  inputBg: '#0a1220',
}
const CLR_LIGHT = {
  prompt:  '#16a34a',
  output:  '#1e293b',
  error:   '#dc2626',
  info:    '#0369a1',
  success: '#16a34a',
  warn:    '#b45309',
  dim:     '#94a3b8',
  cmd:     '#7c3aed',
  bg:      '#f8fafc',
  inputBg: '#f1f5f9',
}

// ── JS sandbox runner ─────────────────────────────────────────────────────────
function runJS(code) {
  const logs = []
  const api = {
    log:   (...a) => logs.push(a.map(fmtVal).join(' ')),
    warn:  (...a) => logs.push(`Warning: ${a.map(fmtVal).join(' ')}`),
    error: (...a) => logs.push(`Error: ${a.map(fmtVal).join(' ')}`),
  }
  try {
    const r = Function('console', `"use strict";\n${code}`)(api)
    if (r !== undefined) logs.push(fmtVal(r))
  } catch (e) { logs.push(`Error: ${e.message}`) }
  return logs.join('\n') || '(no output)'
}

function fmtVal(v) {
  if (typeof v === 'string') return v
  try { return JSON.stringify(v, null, 2) } catch { return String(v) }
}

// Load Babel standalone on demand for TypeScript transpilation
async function loadBabel() {
  if (window.Babel) return window.Babel
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/@babel/standalone@7/babel.min.js'
    s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
  return window.Babel
}

function transpileTS(code, filename = 'file.ts') {
  return window.Babel.transform(code, {
    presets: [['typescript', { allExtensions: true }], ['env', { targets: { esmodules: true } }]],
    filename,
  }).code
}

// ── React/JSX → srcdoc ───────────────────────────────────────────────────────
function buildReactDoc(code) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"><\/script>
<style>*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif}</style>
</head><body><div id="root"></div>
<script type="text/babel" data-presets="react,env">
${code}
try{ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App))}
catch(e){document.body.innerHTML='<pre style="color:#f47067;padding:1rem">'+e.message+'<\/pre>'}
<\/script></body></html>`
}

// ── HTML+CSS+JS bundle ────────────────────────────────────────────────────────
function buildHtmlBundle(files) {
  const html = files.find(f => /\.html?$/.test(f.name))
  const css  = files.filter(f => /\.css$/.test(f.name)).map(f => f.content).join('\n')
  const js   = files.filter(f => /\.[jt]s$/.test(f.name) && !/\.tsx?$/.test(f.name)).map(f => f.content).join('\n\n')
  const tsx  = files.filter(f => /\.[jt]sx$/.test(f.name)).map(f => f.content).join('\n\n')

  // If there's JSX, use Babel renderer
  if (tsx && !html) return buildReactDoc(tsx)

  let doc = html?.content ?? '<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>'
  if (css) doc = doc.includes('</head>') ? doc.replace('</head>', `<style>\n${css}\n</style>\n</head>`) : `<style>${css}</style>` + doc
  if (js)  doc = doc.includes('</body>') ? doc.replace('</body>', `<script>\n${js}\n</script>\n</body>`) : doc + `<script>${js}<\/script>`
  return doc
}

// ── Welcome banner ────────────────────────────────────────────────────────────
const BANNER = [
  { text: '┌─ Workspace Terminal ────────────────────────────────────────┐', type: 'dim' },
  { text: '│  python file.py      Run Python (imports auto-loaded)       │', type: 'dim' },
  { text: '│  node file.js        Run JavaScript                         │', type: 'dim' },
  { text: '│  node file.ts        Run TypeScript (Babel transpiled)      │', type: 'dim' },
  { text: '│  node file.jsx       Run React/JSX → Preview tab            │', type: 'dim' },
  { text: '│  tsc file.ts         Compile TS → show emitted JS           │', type: 'dim' },
  { text: '│  pip install pkg     Install Python package via micropip    │', type: 'dim' },
  { text: '│  openmat file.m      Run OpenMAT / MATLAB script             │', type: 'dim' },
  { text: '│  open / preview      Bundle HTML project → Preview tab      │', type: 'dim' },
  { text: '│  ls  cat  clear  help                                       │', type: 'dim' },
  { text: '└─────────────────────────────────────────────────────────────┘', type: 'dim' },
]

// ── Component ─────────────────────────────────────────────────────────────────
const WorkspaceTerminal = forwardRef(function WorkspaceTerminal({ files = [], isDark = true, onPreview }, ref) {
  const CLR = isDark ? CLR_DARK : CLR_LIGHT
  const [lines, setLines]       = useState(BANNER)
  const [input, setInput]       = useState('')
  const [cmdHist, setCmdHist]   = useState([])
  const [histIdx, setHistIdx]   = useState(-1)
  const [busy, setBusy]         = useState(false)
  const inputRef  = useRef(null)
  const outputRef = useRef(null)
  const filesRef  = useRef(files)

  useEffect(() => { filesRef.current = files }, [files])
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  // ── Print helpers ─────────────────────────────────────────────────────────
  const print = useCallback((text, type = 'output') => {
    const parts = String(text ?? '').split('\n')
    setLines(prev => [...prev, ...parts.map(t => ({ text: t, type }))])
  }, [])

  const printLines = useCallback((text, type = 'output') => {
    String(text ?? '').split('\n').forEach(l => { if (l || type !== 'dim') print(l, type) })
  }, [print])

  // ── Find file by name ─────────────────────────────────────────────────────
  const findFile = useCallback((name) => {
    const all = filesRef.current
    return all.find(f => f.name === name)
        ?? all.find(f => f.name.split('/').pop() === name)
        ?? all.find(f => f.name === name.replace(/^~\//, ''))
  }, [])

  // ── Core execute ──────────────────────────────────────────────────────────
  const execute = useCallback(async (raw, overrideFiles) => {
    const trimmed = raw.trim()
    if (!trimmed) return

    print(`$ ${trimmed}`, 'cmd')
    setCmdHist(prev => [trimmed, ...prev.filter(c => c !== trimmed)].slice(0, 500))
    setHistIdx(-1)
    setBusy(true)

    const allFiles = overrideFiles ?? filesRef.current

    try {
      const [prog, ...args] = trimmed.split(/\s+/)

      // ── python / python3 ──────────────────────────────────────────────────
      if (prog === 'python' || prog === 'python3') {
        const fname = args[0]
        if (!fname) { print('Usage: python <file.py>', 'warn'); return }
        const file = allFiles.find(f => f.name === fname) ?? findFile(fname)
        if (!file) { print(`python: can't open '${fname}': No such file`, 'error'); return }

        print('» Loading Python runtime…', 'dim')
        const pyodide = await getPyodide()

        // Auto-load all packages referenced in import statements
        print('» Resolving imports…', 'dim')
        try {
          await pyodide.loadPackagesFromImports(file.content)
        } catch (e) {
          print(`» Package warning: ${e.message}`, 'warn')
        }

        // Redirect stdout/stderr line-by-line into terminal
        pyodide.setStdout({ batched: t => t.split('\n').forEach(l => { if (l) print(l, 'output') }) })
        pyodide.setStderr({ batched: t => t.split('\n').forEach(l => { if (l) print(l, 'error') }) })

        await pyodide.runPythonAsync(file.content)

      // ── pip install ───────────────────────────────────────────────────────
      } else if (prog === 'pip' || prog === 'pip3') {
        if (args[0] !== 'install') { print(`pip: unknown sub-command '${args[0]}'`, 'error'); return }
        const pkgs = args.slice(1)
        if (!pkgs.length) { print('Usage: pip install <package> [package...]', 'warn'); return }

        print('» Loading Python runtime…', 'dim')
        const pyodide = await getPyodide()
        await pyodide.loadPackage('micropip')

        for (const pkg of pkgs) {
          print(`» Installing ${pkg}…`, 'dim')
          try {
            await pyodide.runPythonAsync(`import micropip; await micropip.install('${pkg}')`)
            print(`✓ ${pkg} installed`, 'success')
          } catch (e) {
            print(`✗ ${pkg}: ${e.message}`, 'error')
          }
        }

      // ── node ──────────────────────────────────────────────────────────────
      } else if (prog === 'node') {
        const fname = args[0]
        if (!fname) { print('Usage: node <file.js|file.ts|file.jsx>', 'warn'); return }
        const file = allFiles.find(f => f.name === fname) ?? findFile(fname)
        if (!file) { print(`node: '${fname}': No such file`, 'error'); return }

        const isJsx = /\.[jt]sx$/.test(file.name)
          || file.content.includes('React.')
          || /<[A-Z]/.test(file.content)
          || file.content.includes('ReactDOM')
        const isTS = /\.tsx?$/.test(file.name) && !isJsx

        if (isJsx) {
          const doc = buildReactDoc(file.content)
          onPreview?.(doc, 'react')
          print(`✓ React app rendered → switch to Preview tab`, 'info')
        } else if (isTS) {
          print('» Transpiling TypeScript…', 'dim')
          try {
            await loadBabel()
            const js = transpileTS(file.content, file.name)
            printLines(runJS(js))
          } catch (e) {
            print(`TypeScript error: ${e.message}`, 'error')
          }
        } else {
          printLines(runJS(file.content))
        }

      // ── tsc ───────────────────────────────────────────────────────────────
      } else if (prog === 'tsc') {
        const fname = args[0]
        if (!fname) { print('Usage: tsc <file.ts>', 'warn'); return }
        const file = allFiles.find(f => f.name === fname) ?? findFile(fname)
        if (!file) { print(`tsc: '${fname}': No such file`, 'error'); return }
        print('» Loading TypeScript compiler…', 'dim')
        try {
          await loadBabel()
          const js = transpileTS(file.content, file.name)
          const outName = fname.replace(/\.tsx?$/, '.js')
          print(`// ── ${outName} ──`, 'info')
          printLines(js, 'output')
          print(`✓ Compiled successfully`, 'success')
        } catch (e) {
          print(`tsc error: ${e.message}`, 'error')
        }

      // ── openmat ───────────────────────────────────────────────────────────────
      } else if (prog === 'openmat') {
        const fname = args[0]
        if (!fname) { print('Usage: openmat <file.m>', 'warn'); return }
        const file = allFiles.find(f => f.name === fname) ?? findFile(fname)
        if (!file) { print(`openmat: '${fname}': No such file`, 'error'); return }

        print('» Running OpenMAT script…', 'dim')
        try {
          const result = executeScript(file.content, {})
          const out = result.output ?? ''
          if (out && out !== 'No output.') printLines(out)
          else print('(no output)', 'dim')
          if (result.figureJson) print('» Plot generated — click OpenMAT to view it in the full studio.', 'info')
          if (result.compatibilityWarnings?.length) {
            result.compatibilityWarnings.forEach(w => print(`Warning: ${w}`, 'warn'))
          }
          print('✓ Done', 'success')
        } catch (e) {
          print(`OpenMAT error: ${e.message}`, 'error')
        }

      // ── open / preview ────────────────────────────────────────────────────
      } else if (prog === 'open' || prog === 'preview') {
        const fname = args[0]
        let targetFiles = allFiles

        if (fname) {
          const file = allFiles.find(f => f.name === fname) ?? findFile(fname)
          if (!file) { print(`open: '${fname}': No such file`, 'error'); return }
          // If it's a JSX file, build react doc
          if (/\.[jt]sx$/.test(file.name)) {
            onPreview?.(buildReactDoc(file.content), 'react')
            print(`✓ React app rendered → switch to Preview tab`, 'info')
            return
          }
        }

        if (!allFiles.some(f => /\.html?$/.test(f.name))) {
          print('No HTML file found. Use `node file.jsx` for React or create an index.html.', 'warn')
          return
        }
        onPreview?.(buildHtmlBundle(targetFiles), 'html')
        print('✓ HTML project rendered → switch to Preview tab', 'info')

      // ── ls ────────────────────────────────────────────────────────────────
      } else if (prog === 'ls') {
        if (!allFiles.length) { print('(no files in workspace)', 'dim'); return }
        const row = allFiles.map(f => f.name).join('   ')
        print(row, 'info')

      // ── cat ───────────────────────────────────────────────────────────────
      } else if (prog === 'cat') {
        const fname = args[0]
        if (!fname) { print('Usage: cat <file>', 'warn'); return }
        const file = allFiles.find(f => f.name === fname) ?? findFile(fname)
        if (!file) { print(`cat: ${fname}: No such file`, 'error'); return }
        printLines(file.content)

      // ── clear ─────────────────────────────────────────────────────────────
      } else if (prog === 'clear' || prog === 'cls') {
        setLines([])

      // ── help ──────────────────────────────────────────────────────────────
      } else if (prog === 'help') {
        print('Available commands:', 'info')
        ;[
          ['python <file.py>',         'Run Python — stdlib + numpy/pandas/scipy auto-loaded'],
          ['python3 <file.py>',        'Alias for python'],
          ['pip install <pkg>',        'Install Python package via micropip (PyPI)'],
          ['node <file.js>',           'Run JavaScript file'],
          ['node <file.ts>',           'Transpile TypeScript via Babel and run'],
          ['node <file.jsx>',          'Transpile + render React/JSX app in Preview'],
          ['tsc <file.ts>',            'Compile TypeScript and show emitted JS'],
          ['openmat <file.m>',          'Run OpenMAT / MATLAB script in terminal'],
          ['open [file]',              'Bundle HTML+CSS+JS project in Preview'],
          ['ls',                       'List workspace files'],
          ['cat <file>',               'Print file contents'],
          ['clear',                    'Clear terminal'],
          ['↑ / ↓',                    'Navigate command history'],
          ['Ctrl+L',                   'Clear screen'],
          ['Ctrl+C',                   'Cancel running command'],
        ].forEach(([cmd, desc]) => print(`  ${cmd.padEnd(24)} ${desc}`, 'output'))

      } else if (!prog) {
        // empty — do nothing
      } else {
        print(`${prog}: command not found — type 'help' for available commands`, 'error')
      }

    } catch (err) {
      print(err?.message || String(err), 'error')
    } finally {
      setBusy(false)
    }
  }, [print, printLines, findFile, onPreview])

  // ── Exposed run() for the Run button ─────────────────────────────────────
  useImperativeHandle(ref, () => ({
    run(activeFile, allFiles) {
      if (!activeFile) return
      const { language: lang, name } = activeFile
      const isJsx = /\.[jt]sx$/.test(name)

      let cmd
      if (lang === 'python')          cmd = `python ${name}`
      else if (lang === 'html')       cmd = `open ${name}`
      else if (isJsx)                 cmd = `node ${name}`
      else if (lang === 'typescript') cmd = `node ${name}`
      else if (lang === 'javascript') cmd = `node ${name}`
      else if (lang === 'openmat')    cmd = `openmat ${name}`
      else                            cmd = null

      if (cmd) execute(cmd, allFiles)
    },
    print,
    clear() { setLines([]) },
  }), [execute, print])

  // ── Keyboard handling ─────────────────────────────────────────────────────
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (busy) return
      const cmd = input.trim()
      setInput('')
      execute(cmd)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistIdx(prev => {
        const next = Math.min(prev + 1, cmdHist.length - 1)
        if (cmdHist[next] !== undefined) setInput(cmdHist[next])
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistIdx(prev => {
        const next = Math.max(prev - 1, -1)
        setInput(next < 0 ? '' : (cmdHist[next] ?? ''))
        return next
      })
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      setLines([])
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault()
      if (busy) { print('^C', 'dim'); setBusy(false) }
      setInput('')
    }
  }, [busy, input, cmdHist, execute, print])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col h-full cursor-text select-text"
      style={{ fontFamily: "'JetBrains Mono', Consolas, monospace", fontSize: 12, background: CLR.bg }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output area */}
      <div ref={outputRef} className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: CLR[line.type] ?? CLR.output,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              minHeight: '1.6em',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Input row */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 border-t shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
        style={{ background: CLR.inputBg }}
      >
        <span
          style={{ color: busy ? CLR.warn : CLR.prompt, userSelect: 'none', flexShrink: 0 }}
          title={busy ? 'Running…' : 'Ready'}
        >
          {busy ? '⏳' : '▶'}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
          className="flex-1 bg-transparent outline-none"
          style={{
            color: CLR.output,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            caretColor: CLR.prompt,
            background: 'transparent',
          }}
          placeholder={busy ? 'running…' : ''}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
      </div>
    </div>
  )
})

export default WorkspaceTerminal
