import { getPyodide } from './pyodideRuntime.js'
import { executeScript } from '../engines/openmat/openmatEngine.js'

// ── Python ────────────────────────────────────────────────────────────────────
export async function runPython(code) {
  const pyodide = await getPyodide()
  const lines = []
  pyodide.setStdout({ batched: (s) => lines.push(s) })
  pyodide.setStderr({ batched: (s) => lines.push('⚠ ' + s) })
  try {
    await pyodide.runPythonAsync(code)
  } catch (err) {
    lines.push('Error: ' + err.message)
  }
  return lines.join('\n')
}

// ── JavaScript (in-browser) ───────────────────────────────────────────────────
// priorCode: accumulated earlier cells run silently in the same Function scope
// so their declarations (classes, vars, functions) are visible to `code`.
export function runJS(code, priorCode = '') {
  const lines = []
  const capture = (...args) =>
    lines.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '))
  const silent = { log: () => {}, warn: () => {}, error: () => {}, info: () => {}, dir: () => {} }
  const active = { log: capture, warn: capture, error: capture, info: capture, dir: capture }
  try {
    if (priorCode) {
      // eslint-disable-next-line no-new-func
      new Function('__silent', '__active', `let console=__silent;\n${priorCode}\nconsole=__active;\n${code}`)(silent, active)
    } else {
      // eslint-disable-next-line no-new-func
      new Function('console', code)(active)
    }
  } catch (e) {
    lines.push('Error: ' + e.message)
  }
  return lines.join('\n')
}

// ── TypeScript → strip types → run as JS ─────────────────────────────────────
export function stripTypeScript(ts) {
  return (
    ts
      // Expand constructor parameter property shorthand BEFORE access modifiers are stripped.
      // `constructor(private foo: T) {}` → `constructor(foo: T) { this.foo = foo; }`
      .replace(/\bconstructor\s*\(([^)]*)\)\s*\{/g, (match, paramStr) => {
        const assignments = []
        const cleaned = paramStr.replace(
          /\b(private|public|protected|readonly)\s+(\w+)/g,
          (_, _mod, name) => { assignments.push(`this.${name} = ${name};`); return name }
        )
        if (!assignments.length) return match
        return `constructor(${cleaned}) {\n    ${assignments.join('\n    ')}\n    `
      })
      .replace(/^\s*interface\s+\w[\w<>, ]*\s*\{[^}]*\}/gms, '')
      .replace(/^\s*type\s+\w[\w<>, ]*\s*=\s*[^;]+;/gm, '')
      .replace(/\s+implements\s+[\w,\s<>]+(?=[{\s])/g, '')
      .replace(/\b(private|public|protected|readonly)\s+/g, '')
      .replace(/:\s*[\w<>|&\[\]()., ]+(?=\s*=)/g, '')
      .replace(/\)\s*:\s*[\w<>|&\[\], ]+\s*(?=[{;,\n])/g, ') ')
      .replace(/<[A-Za-z_][^(>]*>/g, '')
      .replace(/(\w)\s*:\s*([\w<>|&\[\].,\s])+(?=[,)])/g, '$1')
      .replace(/^\s{1,8}(\w+)\s*:\s*[\w<>|&\[\], ]+\s*;/gm, '')
      .replace(/\bas\s+[\w<>|[\], ]+/g, '')
      .replace(/!/g, '')
      .replace(/\n{3,}/g, '\n\n')
  )
}

// ── MATLAB / OpenMAT (in-browser engine) ─────────────────────────────────────
export function runMatlab(code) {
  try {
    const result = executeScript(code)
    const parts = []
    if (result.output && result.output !== 'No output.') parts.push(result.output)
    if (result.figureJson) parts.push('📊 Plot generated — open in OpenMAT (/openmat) to see it rendered.')
    return parts.join('\n') || '(no output)'
  } catch (err) {
    return 'Error: ' + err.message
  }
}

// ── Language auto-wrappers ────────────────────────────────────────────────────
// Some languages (Java, C#, Kotlin, Scala) require boilerplate that blog authors
// shouldn't have to write for every snippet. If the code looks like bare
// statements, wrap it automatically.

function wrapJava(code) {
  // Wandbox compiles Java in prog.java — strip 'public' from top-level class
  // declarations so the name doesn't have to match the filename.
  const normalized = code.replace(/^public\s+(class\s)/gm, '$1')
  if (/\bclass\s+\w/.test(normalized)) return normalized
  return `class Main {\n    public static void main(String[] args) throws Exception {\n${code.replace(/^/gm, '        ')}\n    }\n}`
}

function wrapCSharp(code) {
  if (/\bclass\s+\w/.test(code) || /^using\s/m.test(code)) return code
  return `using System;\nclass Program {\n    static void Main() {\n${code.replace(/^/gm, '        ')}\n    }\n}`
}

function wrapKotlin(code) {
  if (/\bfun\s+main\b/.test(code) || /\bclass\s+\w/.test(code)) return code
  return `fun main() {\n${code.replace(/^/gm, '    ')}\n}`
}

function wrapScala(code) {
  if (/\bobject\s+\w/.test(code) || /\bclass\s+\w/.test(code)) return code
  return `object Main extends App {\n${code.replace(/^/gm, '  ')}\n}`
}

function autoWrap(lang, code) {
  if (lang === 'java') return wrapJava(code)
  if (lang === 'csharp') return wrapCSharp(code)
  if (lang === 'kotlin') return wrapKotlin(code)
  if (lang === 'scala') return wrapScala(code)
  return code
}

// ── Wandbox ───────────────────────────────────────────────────────────────────
// wandbox.org — free, no auth, CORS-open, maintained since 2013.
// Compiler names verified live from https://wandbox.org/api/list.json
export const WANDBOX_COMPILER = {
  c:          'gcc-head-c',
  cpp:        'gcc-head',
  'c++':      'gcc-head',
  java:       'openjdk-jdk-22+36',
  rust:       'rust-1.82.0',
  go:         'go-1.23.2',
  ruby:       'ruby-4.0.2',
  php:        'php-8.3.12',
  haskell:    'ghc-9.10.1',
  scala:      'scala-3.5.1',
  swift:      'swift-6.0.1',
  lua:        'lua-5.4.7',
  perl:       'perl-5.42.0',
  julia:      'julia-1.10.5',
  bash:       'bash',
  sh:         'bash',
  shell:      'bash',
  r:          'r-4.4.1',
  csharp:     'mono-6.12.0.199',
  'c#':       'mono-6.12.0.199',
}

async function runWandbox(compiler, code) {
  let res
  try {
    res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, compiler }),
    })
  } catch {
    throw new Error('Wandbox unreachable — check your connection')
  }
  if (!res.ok) throw new Error(`Wandbox returned ${res.status}`)
  const data = await res.json()
  const compileErr = (data.compiler_error || '').trimEnd()
  if (compileErr) return 'Compile error:\n' + compileErr
  const out = (data.program_output || '').trimEnd()
  const err = (data.program_error || '').trimEnd()
  if (out && err) return out + '\n⚠ stderr:\n' + err
  return out || err || '(no output)'
}

// ── Piston — fallback for all Wandbox languages + Kotlin/PowerShell ──────────
// Used when Wandbox is down or returns an error.
const PISTON_LANG = {
  c: 'c', cpp: 'cpp', 'c++': 'cpp',
  java: 'java',
  rust: 'rust',
  go: 'go',
  ruby: 'ruby',
  php: 'php',
  haskell: 'haskell',
  scala: 'scala',
  swift: 'swift',
  lua: 'lua',
  perl: 'perl',
  julia: 'julia',
  bash: 'bash', sh: 'bash', shell: 'bash',
  r: 'r',
  csharp: 'csharp', 'c#': 'csharp',
  kotlin: 'kotlin',
  powershell: 'powershell', ps1: 'powershell',
}

async function runPiston(lang, wrappedCode) {
  const pistonLang = PISTON_LANG[lang]
  if (!pistonLang) throw new Error('No Piston runner for: ' + lang)
  let res
  try {
    res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: pistonLang, version: '*', files: [{ content: wrappedCode }] }),
    })
  } catch {
    throw new Error('Piston API unreachable')
  }
  if (!res.ok) throw new Error(`Piston returned ${res.status}`)
  const data = await res.json()
  const run = data.run || {}
  const stdout = (run.stdout || '').trimEnd()
  const stderr = (run.stderr || '').trimEnd()
  if (stdout && stderr) return stdout + '\n⚠ stderr:\n' + stderr
  return stdout || stderr || '(no output)'
}

// ── Dispatch ──────────────────────────────────────────────────────────────────
export async function runCode(language, code, priorCode = '') {
  const lang = language.toLowerCase()
  if (lang === 'python' || lang === 'py') return runPython(code)
  if (lang === 'javascript' || lang === 'js') return runJS(code, priorCode)
  if (lang === 'typescript' || lang === 'ts')
    return runJS(stripTypeScript(code), priorCode ? stripTypeScript(priorCode) : '')
  if (lang === 'matlab' || lang === 'm') return runMatlab(code)

  const wrapped = autoWrap(lang, code)

  // Kotlin and PowerShell go straight to Piston (Wandbox doesn't support them)
  if (lang === 'kotlin' || lang === 'powershell' || lang === 'ps1')
    return runPiston(lang, wrapped)

  // Everything else: try Wandbox first, fall back to Piston on any failure
  const wandboxCompiler = WANDBOX_COMPILER[lang]
  if (wandboxCompiler) {
    try {
      return await runWandbox(wandboxCompiler, wrapped)
    } catch (wandboxErr) {
      if (!PISTON_LANG[lang]) throw wandboxErr
      try {
        return await runPiston(lang, wrapped)
      } catch (pistonErr) {
        throw new Error(`Wandbox: ${wandboxErr.message} · Piston: ${pistonErr.message}`)
      }
    }
  }

  return 'No runner available for: ' + language
}

// Languages that can be run (for CodeBlock to show the Run button)
export const RUNNABLE_LANGS = new Set([
  'python', 'py', 'javascript', 'js', 'typescript', 'ts', 'matlab', 'm',
  ...Object.keys(WANDBOX_COMPILER),
  ...Object.keys(PISTON_LANG),
])
