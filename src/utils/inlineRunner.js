import { getPyodide } from './pyodideRuntime.js'
import { executeScript } from '../engines/openmat/openmatEngine.js'

function fmtVal(v) {
  if (typeof v === 'string') return v
  try { return JSON.stringify(v, null, 2) } catch { return String(v) }
}

function transformESM(src) {
  src = src.replace(
    /^import\s+(\w[\w$]*)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?$/gm,
    (_, def, names, mod) => {
      const tmp = `_esm_${mod.replace(/\W+/g, '_')}`
      return `const ${tmp} = require('${mod}'); const ${def} = ${tmp}.default ?? ${tmp}; const {${names}} = ${tmp}`
    }
  )
  src = src.replace(/^import\s+\*\s+as\s+(\w[\w$]*)\s+from\s+['"]([^'"]+)['"]\s*;?$/gm,
    (_, name, mod) => `const ${name} = require('${mod}')`)
  src = src.replace(/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?$/gm,
    (_, names, mod) => `const {${names}} = require('${mod}')`)
  src = src.replace(/^import\s+(\w[\w$]*)\s+from\s+['"]([^'"]+)['"]\s*;?$/gm,
    (_, name, mod) => `const ${name} = require('${mod}')`)
  src = src.replace(/^import\s+['"]([^'"]+)['"]\s*;?$/gm, (_, mod) => `require('${mod}')`)
  src = src.replace(/^export\s+default\s+/gm, 'module.exports = ')
  src = src.replace(/^export\s+(const|let|var|async\s+function|function\s*\*?|class)\s+/gm, '$1 ')
  src = src.replace(/^export\s+\{[^}]*\}\s*;?$/gm, '')
  return src
}

function makeInlineRequire() {
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

  const MODS = {
    express, path: pathShim,
    'body-parser': { json: noop, urlencoded: noop, text: noop, raw: noop },
    cors: noop, morgan: noop, helmet: noop, compression: noop,
    dotenv: { config: () => ({}) },
  }

  function requireFn(mod) {
    if (mod in MODS) return MODS[mod]
    throw new Error(`Module '${mod}' is not available in the browser sandbox.`)
  }
  requireFn._apps = expressApps
  return requireFn
}

function runExpressOutput(apps) {
  const lines = []
  for (const { port, routes } of apps) {
    lines.push(`── Server :${port} ${'─'.repeat(34)}`)
    for (const { method, path, handlers } of routes) {
      if (method !== 'GET') { lines.push(`${method.padEnd(7)} ${path}  [registered]`); continue }
      const resp = []
      const res = {
        json: d => resp.push(JSON.stringify(d)),
        send: d => resp.push(String(d)),
        status() { return this },
      }
      try { handlers[handlers.length - 1]({}, res) } catch (e) { resp.push(`Error: ${e.message}`) }
      lines.push(`GET     ${path.padEnd(28)} → ${resp.join(' ')}`)
    }
    lines.push(`${'─'.repeat(46)}`)
  }
  return lines
}

const BABEL_URL = 'https://unpkg.com/@babel/standalone@7/babel.min.js'
let _babelPromise = null
function loadBabel() {
  if (window.Babel) return Promise.resolve(window.Babel)
  if (_babelPromise) return _babelPromise
  _babelPromise = new Promise((resolve, reject) => {
    // If WorkspaceTerminal already added the script tag, just wait for window.Babel
    // rather than adding a duplicate. Poll for up to 15 s.
    if (document.querySelector(`script[src="${BABEL_URL}"]`)) {
      let n = 0
      const t = setInterval(() => {
        if (window.Babel) { clearInterval(t); resolve(window.Babel) }
        else if (++n > 150) { clearInterval(t); reject(new Error('Babel load timed out')) }
      }, 100)
      return
    }
    const s = document.createElement('script')
    s.src = BABEL_URL
    s.onload = () => {
      if (window.Babel) { resolve(window.Babel); return }
      let n = 0
      const t = setInterval(() => {
        if (window.Babel) { clearInterval(t); resolve(window.Babel) }
        else if (++n > 50) { clearInterval(t); reject(new Error('Babel did not initialize after load')) }
      }, 100)
    }
    s.onerror = () => reject(new Error('Babel CDN unreachable'))
    document.head.appendChild(s)
  })
  _babelPromise.catch(() => { _babelPromise = null })
  return _babelPromise
}

// ── Public API ────────────────────────────────────────────────────────────────

export const RUNNABLE_LANGS = new Set([
  'python', 'py',
  'javascript', 'js',
  'typescript', 'ts',
  'matlab', 'openmat',
  'shell', 'bash', 'sh', 'zsh',
  'sql', 'sqlite',
  'json',
  'lua',
  'ruby', 'rb',
  'c', 'cpp', 'c++',
  'brainfuck', 'bf',
])

/** Run JS inline. Returns { output: string, error: string|null } */
export function runJSInline(code) {
  const src = transformESM(code)
  const lines = []
  const api = {
    log:   (...a) => lines.push(a.map(fmtVal).join(' ')),
    warn:  (...a) => lines.push(`⚠ ${a.map(fmtVal).join(' ')}`),
    error: (...a) => lines.push(`✗ ${a.map(fmtVal).join(' ')}`),
    table: d => lines.push(fmtVal(d)),
    dir:   d => lines.push(fmtVal(d)),
    group: (...a) => lines.push(a.map(fmtVal).join(' ')),
    groupEnd: () => {},
    time: () => {}, timeEnd: () => {},
  }
  const req = makeInlineRequire()
  const mod = { exports: {} }
  try {
    const r = Function('console', 'require', 'module', 'exports',
      `"use strict";\n${src}`)(api, req, mod, mod.exports)
    if (r !== undefined) lines.push(fmtVal(r))
  } catch (e) {
    return { output: lines.join('\n'), error: e.message }
  }
  if (req._apps.length) lines.push(...runExpressOutput(req._apps))
  return { output: lines.join('\n') || '(no output)', error: null }
}

/** Run TypeScript inline (loads Babel on first call).
 *  Falls back to plain JS if Babel is unavailable — covers TS-flavoured JS with no type annotations. */
export async function runTSInline(code) {
  let Babel
  try {
    Babel = await loadBabel()
  } catch (babelErr) {
    // CDN unreachable or timed out — try running as plain JS (works for Express/Node examples)
    const result = runJSInline(code)
    const note = `⚠ TypeScript compiler unavailable (${babelErr.message}). Running as JavaScript.`
    return {
      output: result.output ? `${note}\n\n${result.output}` : note,
      error: result.error ?? null,
    }
  }
  try {
    const js = Babel.transform(code, {
      presets: [
        ['typescript', { allExtensions: true }],
        ['env', { targets: { esmodules: true }, modules: 'commonjs' }],
      ],
      filename: 'inline.ts',
    }).code
    return runJSInline(js)
  } catch (e) {
    return { output: '', error: e.message }
  }
}

// Plain-text marker — no null bytes, no encoding issues across Pyodide's stdout batching.
export const PLOT_MARKER = '###OPENCALC_PLOT###'

// Injected before any Python code that imports matplotlib — intercepts plt.show()
// and converts each figure to a base64 PNG emitted as a specially-prefixed stdout line.
export const MATPLOTLIB_SHIM = `
try:
    import matplotlib as _mpl
    _mpl.use('Agg')
    import matplotlib.pyplot as _plt
    import io as _io, base64 as _b64
    def _inline_show(*_a, **_kw):
        _nums = _plt.get_fignums()
        if not _nums:
            return
        for _n in _nums:
            _fig = _plt.figure(_n)
            if not _fig.get_axes():
                continue
            _buf = _io.BytesIO()
            _fig.savefig(_buf, format='png', bbox_inches='tight', dpi=100)
            _buf.seek(0)
            print('###OPENCALC_PLOT###' + _b64.b64encode(_buf.read()).decode('utf-8'))
        _plt.close('all')
    _plt.show = _inline_show
except ImportError:
    pass
`

/**
 * Run Python inline via Pyodide.
 * onLine({ text, type }) is called for each output line.
 * type is 'output' | 'error' | 'image' (base64 PNG for matplotlib plots).
 */
export async function runPythonInline(code, onLine) {
  const pyodide = await getPyodide()
  await pyodide.loadPackagesFromImports(code).catch(() => {})

  const hasMpl = /\bmatplotlib\b/.test(code)
  if (hasMpl) {
    // Ensure matplotlib package is loaded before injecting the shim
    await pyodide.loadPackage('matplotlib').catch(() => {})
  }

  const dispatchLine = (raw) => {
    if (!raw) return
    if (raw.startsWith(PLOT_MARKER)) {
      onLine({ type: 'image', src: raw.slice(PLOT_MARKER.length) })
    } else {
      onLine({ type: 'output', text: raw })
    }
  }

  pyodide.setStdout({ batched: t => t.split('\n').forEach(dispatchLine) })
  pyodide.setStderr({ batched: t => t.split('\n').forEach(l => { if (l) onLine({ type: 'error', text: l }) }) })
  await pyodide.runPythonAsync(`import sys; sys.argv = ['cell']`).catch(() => {})
  if (hasMpl) await pyodide.runPythonAsync(MATPLOTLIB_SHIM).catch(() => {})

  try {
    await pyodide.runPythonAsync(code)
    return { error: null }
  } catch (e) {
    const msg = String(e)
    if (/SystemExit/.test(msg)) {
      const exitCode = msg.match(/SystemExit: (\d+)/)?.[1] ?? '1'
      if (exitCode !== '0') onLine({ type: 'error', text: `Process exited with code ${exitCode}` })
      return { error: null }
    }
    return { error: msg }
  }
}

/** Run OpenMAT/MATLAB inline. Returns { output: string, error: string|null } */
export function runOpenMATInline(code) {
  try {
    const result = executeScript(code, {})
    const out = result.output ?? ''
    return { output: out && out !== 'No output.' ? out : '(no output)', error: null }
  } catch (e) {
    return { output: '', error: e.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON / Brainfuck — zero-dependency runners
// ─────────────────────────────────────────────────────────────────────────────

/** Pretty-print / validate JSON */
export function runJSONInline(code) {
  try {
    return { output: JSON.stringify(JSON.parse(code.trim()), null, 2), error: null }
  } catch (e) {
    return { output: '', error: `JSON parse error: ${e.message}` }
  }
}

/** Brainfuck interpreter (2 M step cap) */
export function runBrainfuckInline(code) {
  const prog = code.replace(/[^><+\-.,[\]]/g, '')
  const mem = new Uint8Array(30000)
  let dp = 0, ip = 0, steps = 0
  const out = []
  while (ip < prog.length) {
    if (++steps > 2_000_000) return { output: out.join(''), error: 'Step limit exceeded (2 M)' }
    const c = prog[ip]
    if (c === '>') dp = (dp + 1) % 30000
    else if (c === '<') dp = (dp + 29999) % 30000
    else if (c === '+') mem[dp] = (mem[dp] + 1) & 255
    else if (c === '-') mem[dp] = (mem[dp] + 255) & 255
    else if (c === '.') out.push(String.fromCharCode(mem[dp]))
    else if (c === '[' && !mem[dp]) {
      let d = 1; while (++ip < prog.length && d) { if (prog[ip] === '[') d++; else if (prog[ip] === ']') d-- }
    } else if (c === ']' && mem[dp]) {
      let d = 1; while (--ip >= 0 && d) { if (prog[ip] === ']') d++; else if (prog[ip] === '[') d-- }
    }
    ip++
  }
  return { output: out.join('') || '(no output)', error: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shell (bash/sh) interpreter
// ─────────────────────────────────────────────────────────────────────────────

function _shWords(src) {
  const tokens = []
  let cur = '', quote = ''
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (c === '\\' && quote !== "'") { cur += src[++i] ?? ''; continue }
    if (!quote && c === '$' && src[i+1] === '(' && src[i+2] === '(') {
      let sub = '$(('; i += 2; let d = 2; i++
      while (i < src.length) { sub += src[i]; if (src[i] === '(') d++; else if (src[i] === ')') { d--; if (d === 0) break }; i++ }
      cur += sub; continue
    }
    if (!quote && c === '$' && src[i+1] === '(') {
      let sub = '$('; i++; let d = 1; i++
      while (i < src.length) { sub += src[i]; if (src[i] === '(') d++; else if (src[i] === ')') { d--; if (d === 0) break }; i++ }
      cur += sub; continue
    }
    if (!quote && (c === '"' || c === "'")) { quote = c; continue }
    if (quote && c === quote) { quote = ''; continue }
    if (!quote && (c === ' ' || c === '\t' || c === '\n')) { if (cur) { tokens.push(cur); cur = '' }; continue }
    cur += c
  }
  if (cur) tokens.push(cur)
  return tokens
}

function _shArith(expr, env) {
  const safe = expr.replace(/\b([A-Za-z_]\w*)\b/g, m => {
    const v = Number(env[m]); return isNaN(v) ? '0' : String(v)
  })
  try { return String(Function('"use strict"; return (' + safe + ')')()) }
  catch { return '0' }
}

function _shExpand(str, env) {
  if (str == null) return ''
  // single-quoted: literal
  if (/^'[^']*'$/.test(str)) return str.slice(1, -1)
  // strip outer double quotes
  if (/^".*"$/s.test(str)) str = str.slice(1, -1)
  str = str
    .replace(/\$\(\(([^)]+)\)\)/g, (_, e) => _shArith(e, env))
    .replace(/\$\(([^)]+)\)/g, (_, cmd) => { const o = []; _shRun(cmd.trim(), env, o, {}); return o.join('\n').trim() })
    .replace(/\$\{(\w+):-([^}]*)\}/g, (_, n, d) => env[n] ?? _shExpand(d, env))
    .replace(/\$\{(\w+):\+([^}]*)\}/g, (_, n, v) => env[n] != null ? _shExpand(v, env) : '')
    .replace(/\$\{#(\w+)\}/g, (_, n) => String((env[n] ?? '').length))
    .replace(/\$\{(\w+)\}/g, (_, n) => env[n] ?? '')
    .replace(/\$([A-Za-z_]\w*|\d)/g, (_, n) => env[n] ?? '')
    .replace(/\$\?/g, '0')
    .replace(/\$\$/g, '1')
  return str
}

function _shTest(expr, env) {
  expr = _shExpand(expr.trim(), env)
  if (/^\[\[/.test(expr)) expr = expr.replace(/^\[\[|\]\]$/g, '').trim()
  else if (/^\[/.test(expr)) expr = expr.replace(/^\[|\]$/g, '').trim()
  if (!expr) return false
  const u = expr.match(/^(-[znefdr])\s+(.+)$/)
  if (u) {
    const val = u[2].replace(/^["']|["']$/g, '')
    if (u[1] === '-z') return val === ''
    if (u[1] === '-n') return val !== ''
    return false // file tests always false (no FS)
  }
  const num = expr.match(/^(.+?)\s+(-eq|-ne|-lt|-le|-gt|-ge)\s+(.+)$/)
  if (num) {
    const [a, b] = [Number(num[1].trim()), Number(num[3].trim())]
    return { '-eq': a===b, '-ne': a!==b, '-lt': a<b, '-le': a<=b, '-gt': a>b, '-ge': a>=b }[num[2]]
  }
  const str = expr.match(/^(.+?)\s+(==?|!=|<|>)\s+(.+)$/)
  if (str) {
    const [a, b] = [str[1].trim().replace(/^["']|["']$/g, ''), str[3].trim().replace(/^["']|["']$/g, '')]
    return { '=': a===b, '==': a===b, '!=': a!==b, '<': a<b, '>': a>b }[str[2]]
  }
  if (expr.includes(' && ')) return expr.split(' && ').every(e => _shTest(e.trim(), env))
  if (expr.includes(' || ')) return expr.split(' || ').some(e => _shTest(e.trim(), env))
  const val = expr.replace(/^["']|["']$/g, '').trim()
  return val !== '' && val !== '0' && val !== 'false'
}

function _shRun(line, env, out, fns) {
  line = line.trim()
  if (!line || line.startsWith('#')) return 0
  // pipe chain
  if (/ \| /.test(line)) {
    const parts = line.split(/ \| /)
    let pipe = ''
    for (const p of parts) {
      const po = []; _shRun(p.trim(), { ...env, _PIPE: pipe }, po, fns); pipe = po.join('\n')
    }
    out.push(...pipe.split('\n').filter(Boolean))
    return 0
  }
  // && / ||
  if (/ && /.test(line)) {
    for (const p of line.split(/ && /)) { if (_shRun(p.trim(), env, out, fns) !== 0) return 1 }
    return 0
  }
  if (/ \|\| /.test(line)) {
    for (const p of line.split(/ \|\| /)) { if (_shRun(p.trim(), env, out, fns) === 0) return 0 }
    return 1
  }
  // variable assignment VAR=val (no space before =, not a command)
  const asgn = line.match(/^([A-Za-z_]\w*)(\+?)=(.*)$/)
  if (asgn && !/\s/.test(asgn[1])) {
    const val = _shExpand(asgn[3], env)
    env[asgn[1]] = asgn[2] === '+' ? (env[asgn[1]] ?? '') + val : val
    return 0
  }
  // array assignment arr=(a b c)
  const arrA = line.match(/^([A-Za-z_]\w*)=\(([^)]*)\)$/)
  if (arrA) {
    const items = _shWords(arrA[2]).map(w => _shExpand(w, env))
    items.forEach((v, i) => { env[`${arrA[1]}_${i}`] = v })
    env[arrA[1]] = items.join('\n')
    env[`${arrA[1]}[@]`] = items.join('\n')
    return 0
  }
  const words = _shWords(line)
  if (!words.length) return 0
  const prog = _shExpand(words[0], env)
  const args = words.slice(1).map(w => _shExpand(w, env))
  const pipe = env._PIPE ?? ''
  if (prog in fns) {
    const loc = { ...env }
    args.forEach((a, i) => { loc[String(i+1)] = a }); loc['0'] = prog
    return _shBlock(fns[prog], loc, out, fns)
  }
  switch (prog) {
    case 'echo': {
      if (args[0] === '-n') { out.push(args.slice(1).join(' ')); break }
      const s = (args[0] === '-e' ? args.slice(1) : args).join(' ')
        .replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\')
      s.split('\n').forEach(l => out.push(l)); break
    }
    case 'printf': {
      const fmt = (args[0] ?? '').replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\')
      const fa = [...args.slice(1)]; let fi = 0
      const res = fmt.replace(/%s/g, () => fa[fi++]??'').replace(/%d|%i/g, () => Math.floor(Number(fa[fi++]??0)))
        .replace(/%f/g, () => parseFloat(fa[fi++]??0).toFixed(6)).replace(/%%/g, '%')
      res.split('\n').forEach((l, i, a) => { if (i < a.length-1 || l) out.push(l) }); break
    }
    case 'pwd': out.push('/sandbox'); break
    case 'date': out.push(new Date().toUTCString()); break
    case 'true': return 0
    case 'false': return 1
    case ':': return 0
    case 'sleep': case 'wait': case 'read': case 'touch': case 'mkdir': case 'set': break
    case 'unset': args.forEach(a => delete env[a]); break
    case 'export': { const s=args[0]??''; if(s.includes('=')){ const [n,...v]=s.split('='); env[n]=v.join('=') } break }
    case 'local': case 'declare': case 'typeset': {
      args.filter(a => a.includes('=')).forEach(d => {
        const clean = d.replace(/^-[a-zA-Z]+\s*/, ''); const eq = clean.indexOf('=')
        if (eq !== -1) env[clean.slice(0, eq)] = _shExpand(clean.slice(eq+1), env)
      }); break
    }
    case 'let': { const e=args.join(' '); const eq=e.indexOf('='); if(eq>0) env[e.slice(0,eq).trim()]=_shArith(e.slice(eq+1),env); break }
    case 'exit': case 'return': return parseInt(args[0]??'0')
    case 'shift': { const n=parseInt(args[0]??'1'); for(let i=1;i<=9;i++) env[String(i)]=env[String(i+n)]??''; break }
    case 'source': case '.': out.push(`source: no filesystem in browser`); break
    case 'cat': out.push(pipe || '(no filesystem)'); break
    case 'ls': out.push(pipe ? pipe.split('\n').join('  ') : '(empty)'); break
    case 'grep': {
      const flg = args.filter(a=>a.startsWith('-')).join('')
      const pat = args.find(a=>!a.startsWith('-'))??''
      if (!pat) break
      try {
        const re = new RegExp(pat, flg.includes('i')?'i':'')
        const ls = pipe.split('\n')
        const res = flg.includes('v') ? ls.filter(l=>!re.test(l)) : ls.filter(l=>re.test(l))
        if (flg.includes('c')) out.push(String(res.length))
        else out.push(...res)
      } catch(e) { out.push(`grep: ${e.message}`) }
      break
    }
    case 'wc': {
      if (args.includes('-l')) out.push(String(pipe.split('\n').filter(Boolean).length))
      else if (args.includes('-w')) out.push(String(pipe.trim().split(/\s+/).filter(Boolean).length))
      else if (args.includes('-c')) out.push(String(pipe.length))
      else out.push(`${pipe.split('\n').filter(Boolean).length} ${pipe.trim().split(/\s+/).filter(Boolean).length} ${pipe.length}`)
      break
    }
    case 'sort': {
      const ls = pipe.split('\n').filter(Boolean)
      out.push(...(args.includes('-r') ? ls.sort().reverse() : args.includes('-n') ? ls.sort((a,b)=>Number(a)-Number(b)) : ls.sort()))
      break
    }
    case 'uniq': { const ls=pipe.split('\n').filter(Boolean); out.push(...ls.filter((l,i)=>l!==ls[i-1])); break }
    case 'head': { const ni=args.indexOf('-n'); out.push(...pipe.split('\n').slice(0, ni!==-1?parseInt(args[ni+1]):10)); break }
    case 'tail': { const ni=args.indexOf('-n'),n=ni!==-1?parseInt(args[ni+1]):10,ls=pipe.split('\n'); out.push(...ls.slice(Math.max(0,ls.length-n))); break }
    case 'cut': {
      const di=args.indexOf('-d'),fi=args.indexOf('-f'),delim=di!==-1?args[di+1]:'\t'
      const fields=(fi!==-1?args[fi+1]:'1').split(',').map(f=>parseInt(f)-1)
      pipe.split('\n').filter(Boolean).forEach(l=>{ const p=l.split(delim); out.push(fields.map(f=>p[f]??'').join(delim)) })
      break
    }
    case 'tr': {
      if (args.includes('-d')) {
        const chars=args[args.indexOf('-d')+1]??''; const re=new RegExp('['+chars.replace(/[-[\]\\^]/g,'\\$&')+']','g')
        out.push(pipe.replace(re,''))
      } else if (args.length>=2) {
        let s=pipe; for(let i=0;i<Math.min(args[0].length,args[1].length);i++) s=s.split(args[0][i]).join(args[1][i])
        out.push(s)
      }
      break
    }
    case 'awk': {
      const progStr = args.find(a=>!a.startsWith('-'))??''
      const sep = args.includes('-F')?args[args.indexOf('-F')+1]:null
      const bodyM = progStr.match(/\{([^}]*)\}/)
      if (!bodyM) break
      pipe.split('\n').filter(Boolean).forEach((line, idx) => {
        const fields = sep ? line.split(sep) : line.split(/\s+/)
        const ex = (s) => s.replace(/NR/g,String(idx+1)).replace(/NF/g,String(fields.length))
          .replace(/\$0/g,line).replace(/\$(\d+)/g,(_,n)=>fields[parseInt(n)-1]??'')
        const body = bodyM[1].trim()
        const pm = body.match(/print\s+(.+)$/)
        if (pm) out.push(pm[1].split(',').map(s=>ex(s.trim()).replace(/^["']|["']$/g,'')).join(' '))
      }); break
    }
    case 'sed': {
      const sc=args.find(a=>!a.startsWith('-'))??''
      const m=sc.match(/^s([/|,#])(.+?)\1(.*?)\1([gi]*)$/)
      if (m) {
        const re=new RegExp(m[2],m[4].includes('g')?'g':m[4].includes('i')?'i':'')
        pipe.split('\n').forEach(l=>out.push(l.replace(re,m[3].replace(/\\n/g,'\n'))))
      } else { out.push(...pipe.split('\n')) }
      break
    }
    case 'seq': {
      const [f,s,l] = args.length===1?[1,1,+args[0]]:args.length===2?[+args[0],1,+args[1]]:[+args[0],+args[1],+args[2]]
      for(let n=f;s>0?n<=l:n>=l;n+=s) out.push(String(n))
      break
    }
    case 'rev': pipe.split('\n').filter(Boolean).forEach(l=>out.push(l.split('').reverse().join(''))); break
    case 'tee': out.push(...pipe.split('\n').filter(Boolean)); break
    case 'xargs': { _shRun(args.join(' ')+' '+pipe.trim().replace(/\n/g,' '), env, out, fns); break }
    case 'basename': out.push((args[0]??'').split('/').pop()); break
    case 'dirname': out.push((args[0]??'').split('/').slice(0,-1).join('/')||'.'); break
    case 'uname': out.push(args.includes('-m')?'x86_64':'Linux'); break
    case 'whoami': out.push('student'); break
    case 'hostname': out.push('sandbox'); break
    case 'id': out.push('uid=1000(student) gid=1000(student) groups=1000(student)'); break
    case 'which': out.push(`/usr/bin/${args[0]??''}`); break
    case 'env': Object.entries(env).filter(([k])=>!k.startsWith('_')).forEach(([k,v])=>out.push(`${k}=${v}`)); break
    case 'cp': case 'mv': case 'rm': case 'find': out.push(`${prog}: no filesystem in browser`); break
    case 'yes': out.push('(yes: infinite output suppressed)'); break
    default: { out.push(`${prog}: command not found`); return 127 }
  }
  return 0
}

const _SH_BREAK = Symbol('break'), _SH_CONT = Symbol('continue')

function _shBlock(lines, env, out, fns) {
  let i = 0
  function collectUntil(end) {
    const body = []; let d = 0
    while (i < lines.length) {
      const l = lines[i].trim(); const w = l.split(/[\s;]/)[0]
      if (['if','for','while','until','case'].includes(w)) d++
      if (end.includes(w) && d-- <= 0) { i++; break }
      body.push(lines[i]); i++
    }
    return body
  }
  while (i < lines.length) {
    const raw = lines[i], line = raw.trim()
    if (!line || line.startsWith('#')) { i++; continue }
    // function definition
    const fd = line.match(/^(?:function\s+)?(\w+)\s*\(\s*\)\s*\{?\s*$/) ?? line.match(/^function\s+(\w+)\s*\{?\s*$/)
    if (fd && !line.includes('=')) {
      const name = fd[1]; i++
      if (lines[i]?.trim() === '{') i++
      const body = []; let d = 0
      while (i < lines.length) {
        const fl = lines[i].trim()
        if (fl === '{') { i++; continue }
        if (fl.endsWith('{')) d++
        if (fl === '}') { if (d-- <= 0) { i++; break } }
        body.push(lines[i]); i++
      }
      fns[name] = body; continue
    }
    // for...in
    const forIn = line.match(/^for\s+(\w+)\s+in\s+(.*?)(?:\s*;\s*do)?\s*$/)
    if (forIn) {
      i++; if (lines[i]?.trim() === 'do') i++
      const body = collectUntil(['done'])
      const varN = forIn[1]
      let items = _shWords(_shExpand(forIn[2], env))
      items = items.flatMap(it => {
        const r = it.match(/^\{(\d+)\.\.(\d+)\}$/)
        if (r) { const [f,t]=[+r[1],+r[2]]; return Array.from({length:Math.abs(t-f)+1},(_,k)=>String(f+(t>=f?k:-k))) }
        return [it]
      })
      for (const item of items) {
        env[varN] = item
        const ret = _shBlock(body, { ...env, [varN]: item }, out, fns)
        if (ret === _SH_BREAK) break
        if (ret === _SH_CONT) continue
      }
      continue
    }
    // while / until
    const wh = line.match(/^(while|until)\s+(.*?)(?:\s*;\s*do)?\s*$/)
    if (wh) {
      i++; if (lines[i]?.trim() === 'do') i++
      const body = collectUntil(['done'])
      const isUntil = wh[1] === 'until', condE = wh[2]
      for (let iter = 0; iter < 10000; iter++) {
        const ok = condE.startsWith('[')||condE.startsWith('[[') ? _shTest(condE,env) : _shRun(condE,env,[],fns)===0
        if (isUntil ? ok : !ok) break
        const ret = _shBlock(body, env, out, fns)
        if (ret === _SH_BREAK) break
      }
      continue
    }
    // if
    if (/^if[\s(]/.test(line)) {
      const ifCond = line.replace(/^if\s+/,'').replace(/\s*;\s*then\s*$|then\s*$/,'').trim()
      i++; if (lines[i]?.trim() === 'then') i++
      const branches = [{ cond: ifCond, body: [] }]
      let elseB = null, cur = branches[0].body, d = 0
      while (i < lines.length) {
        const fl = lines[i].trim()
        if (/^if[\s(]/.test(fl)) d++
        if (fl === 'fi') { if (d-- <= 0) { i++; break }; cur.push(lines[i]); i++; continue }
        if (d === 0 && fl.startsWith('elif ')) {
          const ec = fl.replace(/^elif\s+/,'').replace(/\s*;\s*then\s*$|then\s*$/,'')
          i++; if (lines[i]?.trim() === 'then') i++
          const eb = []; branches.push({ cond: ec, body: eb }); cur = eb; continue
        }
        if (d === 0 && fl === 'else') { i++; elseB = []; cur = elseB; continue }
        cur.push(lines[i]); i++
      }
      let done = false
      for (const { cond, body } of branches) {
        const ok = !cond || (cond.startsWith('[')||cond.startsWith('[[') ? _shTest(cond,env) : _shRun(cond,env,[],fns)===0)
        if (ok) { _shBlock(body, env, out, fns); done = true; break }
      }
      if (!done && elseB) _shBlock(elseB, env, out, fns)
      continue
    }
    // case
    const caseM = line.match(/^case\s+(.+)\s+in\s*$/)
    if (caseM) {
      const val = _shExpand(caseM[1], env); i++
      while (i < lines.length && lines[i].trim() !== 'esac') {
        const patL = lines[i].trim()
        if (patL.endsWith(')')) {
          const pats = patL.slice(0,-1).split('|').map(p=>p.trim()); i++
          const cb = []
          while (i < lines.length && lines[i].trim() !== ';;' && lines[i].trim() !== 'esac') { cb.push(lines[i]); i++ }
          if (lines[i]?.trim() === ';;') i++
          if (pats.some(p => p==='*' || new RegExp('^'+p.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*').replace(/\?/g,'.')+'$').test(val))) {
            _shBlock(cb, env, out, fns); break
          }
        } else { i++ }
      }
      while (i < lines.length && lines[i].trim() !== 'esac') i++
      if (lines[i]?.trim() === 'esac') i++
      continue
    }
    if (line === 'do' || line === 'then' || line === 'done' || line === 'fi' || line === 'esac' || line === '{' || line === '}') { i++; continue }
    if (line === 'break') { i++; return _SH_BREAK }
    if (line === 'continue') { i++; return _SH_CONT }
    _shRun(line, env, out, fns); i++
  }
  return 0
}

/** Run shell/bash inline. Returns { output: string, error: string|null } */
export function runShellInline(code) {
  const output = []
  const env = { HOME: '/sandbox', USER: 'student', SHELL: '/bin/bash', PWD: '/sandbox', PATH: '/usr/bin:/bin', TERM: 'xterm-256color' }
  const fns = {}
  try {
    _shBlock(code.split('\n'), env, output, fns)
  } catch (e) {
    return { output: output.join('\n'), error: e.message }
  }
  return { output: output.join('\n') || '(no output)', error: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// SQL via sql.js (SQLite WASM)
// ─────────────────────────────────────────────────────────────────────────────

const _SQL_CDN  = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js'
const _SQL_WASM = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm'
let _sqlJsPromise = null

function _loadSqlJs() {
  if (window.initSqlJs) return Promise.resolve(window.initSqlJs)
  if (_sqlJsPromise) return _sqlJsPromise
  _sqlJsPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${_SQL_CDN}"]`)) {
      let n = 0; const t = setInterval(() => { if (window.initSqlJs) { clearInterval(t); resolve(window.initSqlJs) } else if (++n > 150) { clearInterval(t); reject(new Error('sql.js timed out')) } }, 100); return
    }
    const s = document.createElement('script')
    s.src = _SQL_CDN
    s.onload = () => window.initSqlJs ? resolve(window.initSqlJs) : reject(new Error('initSqlJs not found'))
    s.onerror = () => reject(new Error('sql.js CDN unreachable'))
    document.head.appendChild(s)
  })
  _sqlJsPromise.catch(() => { _sqlJsPromise = null })
  return _sqlJsPromise
}

/**
 * Run SQL inline via sql.js (SQLite).
 * onLine({ text, type }) called for each output row / status line.
 */
export async function runSQLInline(code, onLine) {
  onLine({ type: 'dim', text: '» Loading SQLite engine…' })
  try {
    const init = await _loadSqlJs()
    const SQL = await init({ locateFile: () => _SQL_WASM })
    const db = new SQL.Database()
    // Split into statements by ; (skipping ; inside strings)
    const stmts = []; let buf = '', inStr = false, q = ''
    for (const c of code) {
      if (!inStr && (c === "'" || c === '"')) { inStr = true; q = c; buf += c }
      else if (inStr && c === q) { inStr = false; buf += c }
      else if (!inStr && c === ';') { const s = buf.trim(); if (s) stmts.push(s); buf = '' }
      else buf += c
    }
    const tail = buf.trim(); if (tail) stmts.push(tail)
    for (const stmt of stmts) {
      try {
        const results = db.exec(stmt)
        if (results.length) {
          for (const { columns, values } of results) {
            const widths = columns.map((c, ci) => Math.max(c.length, ...values.map(r => String(r[ci] ?? 'NULL').length), 1))
            onLine({ type: 'info', text: columns.map((c, i) => c.padEnd(widths[i])).join(' │ ') })
            onLine({ type: 'dim',  text: widths.map(w => '─'.repeat(w)).join('─┼─') })
            values.forEach(row => onLine({ type: 'output', text: row.map((v, i) => String(v ?? 'NULL').padEnd(widths[i])).join(' │ ') }))
            onLine({ type: 'dim',  text: `(${values.length} row${values.length !== 1 ? 's' : ''})` })
          }
        } else {
          onLine({ type: 'success', text: 'OK' })
        }
      } catch (e) { onLine({ type: 'error', text: `ERROR: ${e.message}` }) }
    }
    db.close()
    return { error: null }
  } catch (e) {
    onLine({ type: 'error', text: `sql.js: ${e.message}` })
    return { error: e.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lua via Fengari (Lua 5.3 in WASM)
// ─────────────────────────────────────────────────────────────────────────────

const _FENGARI_CDN = 'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js'
let _fengariPromise = null

function _loadFengari() {
  if (window.fengari) return Promise.resolve(window.fengari)
  if (_fengariPromise) return _fengariPromise
  _fengariPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = _FENGARI_CDN
    s.onload = () => {
      if (window.fengari) { resolve(window.fengari); return }
      let n = 0; const t = setInterval(() => {
        if (window.fengari) { clearInterval(t); resolve(window.fengari) }
        else if (++n > 50) { clearInterval(t); reject(new Error('Fengari init timed out')) }
      }, 100)
    }
    s.onerror = () => reject(new Error('Fengari CDN unreachable'))
    document.head.appendChild(s)
  })
  _fengariPromise.catch(() => { _fengariPromise = null })
  return _fengariPromise
}

/** Run Lua inline via Fengari. onLine({ text, type }) called for each output line. */
export async function runLuaInline(code, onLine) {
  onLine({ type: 'dim', text: '» Loading Lua 5.3 runtime (Fengari)…' })
  try {
    const feng = await _loadFengari()
    const { lua, lauxlib, lualib, fengari: fengariUtil } = feng
    const L = lauxlib.luaL_newstate()
    lualib.luaL_openlibs(L)
    // Override print to capture output
    lua.lua_pushcfunction(L, (state) => {
      const n = lua.lua_gettop(state)
      const parts = []
      for (let i = 1; i <= n; i++) {
        lua.luaL_tolstring(state, i, null)
        const s = lua.lua_tostring(state, -1)
        parts.push(s ? fengariUtil.to_jsstring(s) : 'nil')
        lua.lua_pop(state, 1)
      }
      onLine({ type: 'output', text: parts.join('\t') })
      return 0
    })
    lua.lua_setglobal(L, fengariUtil.to_luastring('print'))
    const status = lauxlib.luaL_dostring(L, fengariUtil.to_luastring(code))
    if (status !== lua.LUA_OK) {
      const msg = lua.lua_tostring(L, -1)
      onLine({ type: 'error', text: msg ? fengariUtil.to_jsstring(msg) : 'Lua error' })
    }
    return { error: null }
  } catch (e) {
    onLine({ type: 'error', text: `Lua: ${e.message}` })
    return { error: e.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Ruby via Opal.js (Ruby → JavaScript transpiler)
// ─────────────────────────────────────────────────────────────────────────────

const _OPAL_BASE = 'https://cdn.opalrb.com/opal/1.7.4'
let _opalPromise = null

function _loadOpal() {
  if (window.Opal) return Promise.resolve(window.Opal)
  if (_opalPromise) return _opalPromise
  _opalPromise = new Promise((resolve, reject) => {
    const tag = (url) => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${url}"]`)) { res(); return }
      const s = document.createElement('script'); s.src = url
      s.onload = () => res(); s.onerror = () => rej(new Error(`Failed to load ${url}`))
      document.head.appendChild(s)
    })
    tag(`${_OPAL_BASE}/opal.min.js`)
      .then(() => tag(`${_OPAL_BASE}/opal-parser.min.js`))
      .then(() => {
        if (!window.Opal) { reject(new Error('Opal init failed')); return }
        try { window.Opal.load('opal-parser') } catch (_) {}
        resolve(window.Opal)
      })
      .catch(reject)
  })
  _opalPromise.catch(() => { _opalPromise = null })
  return _opalPromise
}

/** Run Ruby inline via Opal.js. onLine({ text, type }) called for each output line. */
export async function runRubyInline(code, onLine) {
  onLine({ type: 'dim', text: '» Loading Ruby runtime (Opal.js)…' })
  try {
    const Opal = await _loadOpal()
    const captured = []
    // Redirect $stdout via Kernel#puts override
    const prev = Opal.Kernel.$puts
    Opal.Kernel.$puts = function(...args) {
      args.forEach(a => captured.push(a === Opal.nil ? '' : String(a)))
      return Opal.nil
    }
    const prevP = Opal.Kernel.$print
    Opal.Kernel.$print = function(...args) {
      captured.push(args.map(a => a === Opal.nil ? '' : String(a)).join(''))
      return Opal.nil
    }
    try {
      Opal.eval(code)
      captured.forEach(l => onLine({ type: 'output', text: l }))
      if (!captured.length) onLine({ type: 'dim', text: '(no output)' })
    } catch (e) {
      const msg = (e.$$message ?? e.message ?? String(e)).replace(/\n.*$/s, '')
      onLine({ type: 'error', text: `Ruby: ${msg}` })
    } finally {
      Opal.Kernel.$puts = prev
      Opal.Kernel.$print = prevP
    }
    return { error: null }
  } catch (e) {
    onLine({ type: 'error', text: `Ruby: ${e.message}` })
    return { error: e.message }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// C / C++ via JSCPP
// ─────────────────────────────────────────────────────────────────────────────

const _JSCPP_CDN = 'https://cdn.jsdelivr.net/npm/JSCPP@2.1.2/dist/JSCPP.es5.min.js'
let _jscppPromise = null

function _loadJSCPP() {
  if (window.JSCPP) return Promise.resolve(window.JSCPP)
  if (_jscppPromise) return _jscppPromise
  _jscppPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = _JSCPP_CDN
    s.onload = () => window.JSCPP ? resolve(window.JSCPP) : reject(new Error('JSCPP init failed'))
    s.onerror = () => reject(new Error('JSCPP CDN unreachable'))
    document.head.appendChild(s)
  })
  _jscppPromise.catch(() => { _jscppPromise = null })
  return _jscppPromise
}

/** Run C/C++ inline via JSCPP. onLine({ text, type }) called for each output line. */
export async function runCInline(code, onLine) {
  onLine({ type: 'dim', text: '» Loading C/C++ interpreter (JSCPP)…' })
  try {
    const JSCPP = await _loadJSCPP()
    const output = []
    const config = { stdio: { write(s) { output.push(s) } }, maxTimeout: 8000 }
    try {
      JSCPP.run(code, '', config)
      const combined = output.join('')
      combined.split('\n').forEach(l => onLine({ type: 'output', text: l }))
      if (!combined.trim()) onLine({ type: 'dim', text: '(no output)' })
    } catch (e) {
      onLine({ type: 'error', text: `C/C++ error: ${e.message}` })
    }
    return { error: null }
  } catch (e) {
    onLine({ type: 'error', text: `JSCPP: ${e.message}` })
    return { error: e.message }
  }
}
