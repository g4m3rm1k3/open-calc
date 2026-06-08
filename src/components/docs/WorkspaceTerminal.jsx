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

// ── Express / require shim ────────────────────────────────────────────────────
function makeRequire(files) {
  const expressApps = []

  function createApp() {
    const routes = []
    const app = { _routes: routes, set() {}, engine() {}, use() { return app } }
    ;['get', 'post', 'put', 'patch', 'delete', 'all'].forEach(m => {
      app[m] = (path, ...handlers) => {
        if (typeof path === 'function') return app
        routes.push({ method: m.toUpperCase(), path, handlers })
        return app
      }
    })
    app.route = (path) => {
      const r = {}
      ;['get', 'post', 'put', 'patch', 'delete'].forEach(m => {
        r[m] = (...handlers) => { routes.push({ method: m.toUpperCase(), path, handlers }); return r }
      })
      return r
    }
    app.listen = (port, cb) => {
      expressApps.push({ port, routes })
      if (typeof cb === 'function') cb()
      return { close() {}, address() { return { port } } }
    }
    return app
  }

  const express = () => createApp()
  express.Router = createApp
  express.json = () => (req, res, next) => next?.()
  express.urlencoded = () => (req, res, next) => next?.()
  express.static = () => (req, res, next) => next?.()

  const noop = () => () => {}
  const pathShim = {
    join: (...p) => p.join('/').replace(/\/+/g, '/'),
    resolve: (...p) => ('/' + p.join('/')).replace(/\/+/g, '/'),
    dirname: p => p.split('/').slice(0, -1).join('/') || '.',
    basename: (p, ext) => { const b = p.split('/').pop(); return ext ? b.replace(ext, '') : b },
    extname: p => (p.match(/\.[^.]+$/) || [''])[0],
    sep: '/',
  }
  const fsShim = {
    readFileSync(name) {
      const f = files.find(f => f.name === name || f.name.endsWith('/' + name))
      if (!f) throw new Error(`ENOENT: no such file or directory, open '${name}'`)
      return f.content
    },
    existsSync: name => files.some(f => f.name === name || f.name.endsWith('/' + name)),
    writeFileSync: () => {},
    readFile: (name, cb) => { try { cb(null, fsShim.readFileSync(name)) } catch (e) { cb(e) } },
  }

  const MODS = {
    express, path: pathShim, fs: fsShim,
    'body-parser': { json: noop, urlencoded: noop, text: noop, raw: noop },
    cors: noop, morgan: noop, helmet: noop, compression: noop,
    dotenv: { config: () => ({}) },
    'method-override': noop, 'express-async-errors': {},
    os: { platform: () => 'browser', hostname: () => 'localhost', cpus: () => [] },
  }

  function requireFn(mod) {
    if (mod in MODS) return MODS[mod]
    throw new Error(`'${mod}' is not available in the browser sandbox.\nSupported: express, path, fs, body-parser, cors, morgan, dotenv`)
  }
  requireFn._apps = expressApps
  return requireFn
}

function runExpressRoutes(apps, logs) {
  for (const { port, routes } of apps) {
    logs.push(`──────────────────────────────────────────────`)
    if (!routes.length) { logs.push('(no routes registered)'); continue }
    for (const { method, path, handlers } of routes) {
      if (method !== 'GET') { logs.push(`${method.padEnd(7)} ${path}  [registered]`); continue }
      const resp = []
      const res = {
        _s: 200,
        status(c) { this._s = c; return this },
        send(b) { resp.push(typeof b === 'string' ? b : JSON.stringify(b, null, 2)) },
        json(b) { resp.push(JSON.stringify(b, null, 2)) },
        sendStatus(c) { resp.push(String(c)) },
        redirect(u) { resp.push(`→ redirect ${u}`) },
        render(v) { resp.push(`→ render '${v}'`) },
        set() { return this }, type() { return this }, end(b) { if (b) resp.push(String(b)) },
      }
      const req = { method, path, url: path, params: {}, query: {}, body: {}, headers: {} }
      try {
        let i = 0
        const next = (err) => { if (err) throw err; const h = handlers[i++]; if (h) h(req, res, next) }
        next()
        logs.push(`GET     ${path.padEnd(22)} → ${resp.join(' | ') || '(empty response)'}`)
      } catch (e) {
        logs.push(`GET     ${path.padEnd(22)} → Error: ${e.message}`)
      }
    }
    logs.push(`──────────────────────────────────────────────`)
  }
}

// ── FastAPI / Pydantic / Uvicorn Python shim ──────────────────────────────────
const FASTAPI_SHIM = `
import sys, json, inspect, types, re

class BaseModel:
    def __init__(self, **data):
        for k, v in data.items(): setattr(self, k, v)
    def dict(self): return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
    def model_dump(self): return self.dict()
    def json(self): return json.dumps(self.dict())

class _P:
    def __init__(self, default=None, **kw): self.default = default
Query = Body = Path = Header = Form = Cookie = File = _P
Depends = lambda f: f

class HTTPException(Exception):
    def __init__(self, status_code=400, detail="Bad Request"):
        self.status_code = status_code; self.detail = detail
        super().__init__(detail)

class JSONResponse:
    def __init__(self, content, status_code=200, **kw): self.content = content
class HTMLResponse:
    def __init__(self, content, status_code=200, **kw): self.content = content
class PlainTextResponse(HTMLResponse): pass
class RedirectResponse:
    def __init__(self, url, **kw): self.url = url; self.content = f"redirect:{url}"

class Request:
    method = "GET"; headers = {}; query_params = {}; path_params = {}
    async def json(self): return {}
    async def body(self): return b""

class _App:
    def __init__(self, **kw):
        self._routes = []; self.title = kw.get("title", "FastAPI")
    def _dec(self, method, path, **kw):
        def d(fn): self._routes.append((method, path, fn)); return fn
        return d
    def get(self, p, **kw): return self._dec("GET", p)
    def post(self, p, **kw): return self._dec("POST", p)
    def put(self, p, **kw): return self._dec("PUT", p)
    def patch(self, p, **kw): return self._dec("PATCH", p)
    def delete(self, p, **kw): return self._dec("DELETE", p)
    def include_router(self, r, prefix="", **kw):
        for m, p, f in r._routes: self._routes.append((m, prefix+p, f))
    def on_event(self, e): return lambda f: f
    def middleware(self, t): return lambda f: f
    def add_middleware(self, *a, **kw): pass

FastAPI = _App
APIRouter = _App

def _run(app, host="127.0.0.1", port=8000, **kw):
    title = getattr(app, "title", "FastAPI")
    print(f"» FastAPI '{title}' — http://{host}:{port}")
    print(f"» Browser sandbox: no real server. Testing {len(app._routes)} route(s).")
    print("─" * 52)
    for method, path, fn in app._routes:
        if method != "GET":
            print(f"{method:<7}{path:<30} [registered]"); continue
        try:
            sig = inspect.signature(fn)
            kw2 = {}
            for name, param in sig.parameters.items():
                ann = param.annotation
                if name in re.findall(r"\\{(\\w+)\\}", path):
                    kw2[name] = 1 if ann in (int, inspect.Parameter.empty) else "example"
                elif param.default != inspect.Parameter.empty:
                    kw2[name] = param.default.default if isinstance(param.default, _P) else param.default
                elif ann == int: kw2[name] = 1
                elif ann == float: kw2[name] = 1.0
                elif ann == str: kw2[name] = "example"
                elif ann == bool: kw2[name] = True
            result = fn(**kw2)
            if inspect.iscoroutine(result):
                result.close()
                out = "(async — works in real server)"
            elif isinstance(result, (JSONResponse, HTMLResponse, PlainTextResponse, RedirectResponse)):
                out = result.content
            elif isinstance(result, BaseModel): out = result.dict()
            else: out = result
            print(f"GET    {path:<30} → {json.dumps(out, default=str)}")
        except HTTPException as e:
            print(f"GET    {path:<30} → {e.status_code} {e.detail}")
        except Exception as e:
            print(f"GET    {path:<30} → Error: {e}")
    print("─" * 52)

# Patch sys.modules so all 'from fastapi import ...' work
def _mod(name, **attrs):
    m = types.ModuleType(name)
    for k, v in attrs.items(): setattr(m, k, v)
    sys.modules[name] = m; return m

_mod("fastapi", FastAPI=FastAPI, APIRouter=APIRouter, HTTPException=HTTPException,
     Query=Query, Body=Body, Path=Path, Header=Header, Form=Form, Depends=Depends, Request=Request)
_mod("fastapi.responses", JSONResponse=JSONResponse, HTMLResponse=HTMLResponse,
     PlainTextResponse=PlainTextResponse, RedirectResponse=RedirectResponse, Response=JSONResponse)
_mod("fastapi.middleware")
_mod("fastapi.middleware.cors", CORSMiddleware=type("CORSMiddleware", (), {}))
_mod("fastapi.security", OAuth2PasswordBearer=lambda **kw: None, HTTPBearer=lambda **kw: None)
_mod("pydantic", BaseModel=BaseModel, Field=lambda default=None, **kw: default, validator=lambda *a, **kw: lambda f: f)
_mod("pydantic.v1", BaseModel=BaseModel)
_mod("uvicorn", run=_run)
`

// ── JS sandbox runner ─────────────────────────────────────────────────────────
function runJS(code, files = []) {
  const src = transformESM(code)
  const logs = []
  const api = {
    log:   (...a) => logs.push(a.map(fmtVal).join(' ')),
    warn:  (...a) => logs.push(`Warning: ${a.map(fmtVal).join(' ')}`),
    error: (...a) => logs.push(`Error: ${a.map(fmtVal).join(' ')}`),
  }
  const req = makeRequire(files)
  const mod = { exports: {} }
  try {
    const r = Function('console', 'require', 'module', 'exports', `"use strict";\n${src}`)(api, req, mod, mod.exports)
    if (r !== undefined) logs.push(fmtVal(r))
  } catch (e) { logs.push(`Error: ${e.message}`) }
  if (req._apps.length) runExpressRoutes(req._apps, logs)
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
    // modules:'commonjs' forces require() output so our shim can intercept it
    presets: [['typescript', { allExtensions: true }], ['env', { targets: { esmodules: true }, modules: 'commonjs' }]],
    filename,
  }).code
}

// Convert ES module import/export to CommonJS so new Function() can run it
function transformESM(src) {
  // import def, { named } from 'mod'
  src = src.replace(
    /^import\s+(\w[\w$]*)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?$/gm,
    (_, def, names, mod) => {
      const tmp = `_esm_${mod.replace(/\W+/g, '_')}`
      return `const ${tmp} = require('${mod}'); const ${def} = ${tmp}.default ?? ${tmp}; const {${names}} = ${tmp}`
    }
  )
  // import * as ns from 'mod'
  src = src.replace(
    /^import\s+\*\s+as\s+(\w[\w$]*)\s+from\s+['"]([^'"]+)['"]\s*;?$/gm,
    (_, name, mod) => `const ${name} = require('${mod}')`
  )
  // import { named } from 'mod'
  src = src.replace(
    /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?$/gm,
    (_, names, mod) => `const {${names}} = require('${mod}')`
  )
  // import def from 'mod'
  src = src.replace(
    /^import\s+(\w[\w$]*)\s+from\s+['"]([^'"]+)['"]\s*;?$/gm,
    (_, name, mod) => `const ${name} = require('${mod}')`
  )
  // import 'mod'  (side-effects only)
  src = src.replace(/^import\s+['"]([^'"]+)['"]\s*;?$/gm, (_, mod) => `require('${mod}')`)
  // export default → module.exports =
  src = src.replace(/^export\s+default\s+/gm, 'module.exports = ')
  // export const / function / class → strip export
  src = src.replace(/^export\s+(const|let|var|async\s+function|function\s*\*?|class)\s+/gm, '$1 ')
  // export { x, y }
  src = src.replace(/^export\s+\{[^}]*\}\s*;?$/gm, '')
  return src
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
  { text: '│  node file.js        Run JavaScript (require + Express ok)  │', type: 'dim' },
  { text: '│  node file.ts        Run TypeScript (Babel transpiled)      │', type: 'dim' },
  { text: '│  node file.jsx       Run React/JSX → Preview tab            │', type: 'dim' },
  { text: '│  tsc file.ts         Compile TS → show emitted JS           │', type: 'dim' },
  { text: '│  pip install pkg     Install Python package via micropip    │', type: 'dim' },
  { text: '│  openmat file.m      Run OpenMAT / MATLAB script             │', type: 'dim' },
  { text: '│  open / preview      Bundle HTML project → Preview tab      │', type: 'dim' },
  { text: '│  ls  cat  clear  help                                       │', type: 'dim' },
  { text: '└─────────────────────────────────────────────────────────────┘', type: 'dim' },
]

// ── Shell arg parser — respects single and double quotes ─────────────────────
function parseShellArgs(cmd) {
  const args = []
  let cur = ''
  let inS = false, inD = false
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i]
    if (c === "'" && !inD)      { inS = !inS }
    else if (c === '"' && !inS) { inD = !inD }
    else if (c === ' ' && !inS && !inD) { if (cur) { args.push(cur); cur = '' } }
    else { cur += c }
  }
  if (cur) args.push(cur)
  return args
}

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
      const [prog, ...args] = parseShellArgs(trimmed)

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

        // Inject sys.argv so the script sees CLI arguments
        const argv = JSON.stringify([fname, ...args.slice(1)])
        await pyodide.runPythonAsync(`import sys; sys.argv = ${argv}`)

        // Inject FastAPI / pydantic / uvicorn shim if needed
        if (/\bfastapi\b|\buvicorn\b|\bpydantic\b/.test(file.content)) {
          await pyodide.runPythonAsync(FASTAPI_SHIM)
        }

        try {
          await pyodide.runPythonAsync(file.content)
        } catch (e) {
          // SystemExit is normal program termination — show exit code, not traceback
          const msg = String(e)
          if (msg.includes('SystemExit')) {
            const code = msg.match(/SystemExit:\s*(\d+)/)?.[1]
            if (code && code !== '0') print(`Process exited with code ${code}`, 'warn')
          } else {
            throw e
          }
        }

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
            printLines(runJS(js, allFiles))
          } catch (e) {
            print(`TypeScript error: ${e.message}`, 'error')
          }
        } else {
          printLines(runJS(file.content, allFiles))
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
    getOutput() {
      return lines.filter(l => l.type !== 'dim').slice(-40).map(l => l.text).join('\n')
    },
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
