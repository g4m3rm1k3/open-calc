import { getPyodide } from './pyodideRuntime.js'
import { executeScript } from './openmatEngine.js'

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

/**
 * Run Python inline via Pyodide.
 * onLine(text, type: 'output'|'error') is called for each line of stdout/stderr.
 */
export async function runPythonInline(code, onLine) {
  const pyodide = await getPyodide()
  await pyodide.loadPackagesFromImports(code).catch(() => {})
  pyodide.setStdout({ batched: t => t.split('\n').forEach(l => { if (l) onLine(l, 'output') }) })
  pyodide.setStderr({ batched: t => t.split('\n').forEach(l => { if (l) onLine(l, 'error') }) })
  await pyodide.runPythonAsync(`import sys; sys.argv = ['cell']`).catch(() => {})
  try {
    await pyodide.runPythonAsync(code)
    return { error: null }
  } catch (e) {
    const msg = String(e)
    if (/SystemExit/.test(msg)) {
      const code = msg.match(/SystemExit: (\d+)/)?.[1] ?? '1'
      if (code !== '0') onLine(`Process exited with code ${code}`, 'error')
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
