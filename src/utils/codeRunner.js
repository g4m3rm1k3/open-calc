import { getPyodide } from './pyodideRuntime.js'
import { executeScript } from '../engines/openmat/openmatEngine.js'

// Sentinel used to embed base64 PNG images in text output so CodeBlock can
// split and render them as <img> tags without a separate channel.
export const IMG_SENTINEL = '__OC_IMG__'
export const IMG_SENTINEL_END = '__OC_IMG_END__'

// Code injected before user code to set the non-interactive 'agg' backend.
// Must run before any import of matplotlib.pyplot.
const MATPLOTLIB_PREAMBLE = `
import matplotlib as _oc_mpl_
_oc_mpl_.use('agg')
`

// Code injected after user code to capture any open figures as base64 PNGs
// and write them to stdout using the sentinel format.
const MATPLOTLIB_CAPTURE = `
try:
    import matplotlib.pyplot as _oc_plt_
    import io as _oc_io_
    import base64 as _oc_b64_
    for _oc_n_ in _oc_plt_.get_fignums():
        _oc_f_ = _oc_plt_.figure(_oc_n_)
        _oc_buf_ = _oc_io_.BytesIO()
        _oc_f_.savefig(_oc_buf_, format='png', bbox_inches='tight', dpi=130)
        _oc_buf_.seek(0)
        print('${IMG_SENTINEL}' + _oc_b64_.b64encode(_oc_buf_.read()).decode() + '${IMG_SENTINEL_END}')
    _oc_plt_.close('all')
except Exception:
    pass
`

// ── Python ────────────────────────────────────────────────────────────────────
export async function runPython(code, stdin = '') {
  const pyodide = await getPyodide()
  const usesMpl = /\bmatplotlib\b/.test(code)

  // Auto-load packages declared in import statements (numpy, pandas, etc.)
  await pyodide.loadPackagesFromImports(code).catch(() => {})
  if (usesMpl) {
    await pyodide.loadPackage('matplotlib').catch(() => {})
  }

  const lines = []
  pyodide.setStdout({ batched: (s) => lines.push(s) })
  pyodide.setStderr({ batched: (s) => lines.push('⚠ ' + s) })
  if (stdin) {
    const stdinLines = stdin.split('\n')
    let idx = 0
    pyodide.setStdin({ stdin: () => idx < stdinLines.length ? stdinLines[idx++] + '\n' : null })
  }
  try {
    const wrapped = usesMpl ? MATPLOTLIB_PREAMBLE + code + MATPLOTLIB_CAPTURE : code
    await pyodide.runPythonAsync(wrapped)
  } catch (err) {
    lines.push('Error: ' + err.message)
  }
  return lines.join('\n')
}

// ── JavaScript (in-browser) ───────────────────────────────────────────────────
// priorCode: accumulated earlier cells run silently in the same Function scope
// so their declarations (classes, vars, functions) are visible to `code`.
export function runJS(code, priorCode = '', stdin = '') {
  const lines = []
  const capture = (...args) =>
    lines.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' '))
  const silent = { log: () => {}, warn: () => {}, error: () => {}, info: () => {}, dir: () => {} }
  const active = { log: capture, warn: capture, error: capture, info: capture, dir: capture }
  // Mock prompt() with pre-filled stdin lines so JS code using prompt() works
  const stdinLines = stdin ? stdin.split('\n') : []
  let stdinIdx = 0
  const mockPrompt = () => stdinLines[stdinIdx++] ?? null
  try {
    if (priorCode) {
      // eslint-disable-next-line no-new-func
      new Function('__silent', '__active', 'prompt', `let console=__silent;\n${priorCode}\nconsole=__active;\n${code}`)(silent, active, mockPrompt)
    } else {
      // eslint-disable-next-line no-new-func
      new Function('console', 'prompt', code)(active, mockPrompt)
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
      // Handles combined modifiers like `public readonly` by consuming ALL modifier
      // keywords before the actual parameter name. Without this, `public readonly`
      // would treat `readonly` as the parameter name, then a later pass would turn
      // `this.readonly = ` into `this.= ` (syntax error).
      .replace(/\bconstructor\s*\(([^)]*)\)\s*\{/g, (match, paramStr) => {
        const assignments = []
        const cleaned = paramStr.replace(
          /\b(?:(?:private|public|protected|readonly)\s+)+(\w+)/g,
          (_, name) => { assignments.push(`this.${name} = ${name};`); return name }
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

// Matches the header of a top-level type declaration (optionally annotated/
// modified) — used to walk past real class/interface/enum/record bodies
// without mistaking an array initializer's `{...}` or a control-flow block's
// `{...}` for another top-level declaration.
const JAVA_DECL_START = /^\s*(?:@\w+(?:\([^)]*\))?\s*)*(?:(?:public|private|protected|static|final|abstract|sealed|non-sealed|strictfp)\s+)*(?:class|interface|enum|record)\s+\w/
const JAVA_IMPORT_START = /^\s*(?:import|package)\s+[^;]+;/

// Consumes whole top-level class/interface/enum/record declarations (and any
// leading import/package statements) one at a time by matching a balanced
// brace pair for each. Returns the index just past the last declaration —
// everything from there on is loose code outside any type.
function findJavaDeclarationsEnd(code) {
  let i = 0
  while (i < code.length) {
    const rest = code.slice(i)
    const importMatch = rest.match(JAVA_IMPORT_START)
    if (importMatch) { i += importMatch[0].length; continue }
    if (!JAVA_DECL_START.test(rest)) break
    const braceStart = rest.indexOf('{')
    if (braceStart === -1) break
    let depth = 0, j = braceStart
    for (; j < rest.length; j++) {
      if (rest[j] === '{') depth++
      else if (rest[j] === '}') { depth--; if (depth === 0) break }
    }
    if (depth !== 0) break // unbalanced — bail and let the rest fall through as-is
    i += j + 1
  }
  return i
}

// Splits loose top-level code into member-like chunks (bare method
// definitions — become sibling methods of main()) vs everything else
// (plain statements, or statements that merely *contain* braces, like an
// array initializer or a for-loop body — stay together, verbatim, as
// main()'s body). Classifying by "has braces at all" isn't enough, since a
// method signature and a for-loop header both end up owning a `{...}` block.
//
// Finds the last `;` that actually separates two top-level statements — not
// one that's just part of a `for (init; cond; step)` header's own clauses.
// A naive `lastIndexOf(';')` mistakes a for-loop's internal semicolons for a
// prior-statement boundary, mangling headers like `for (int i = 0; i < n; i++) {`
// into a bogus split at the wrong semicolon.
function lastTopLevelSemicolon(text) {
  let depth = 0
  let last = -1
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ';' && depth <= 0) last = i
  }
  return last
}

function splitJavaTrailing(trailing) {
  const members = []
  let remainder = ''
  let i = 0
  const n = trailing.length
  while (i < n) {
    const braceStart = trailing.indexOf('{', i)
    if (braceStart === -1) { remainder += trailing.slice(i); break }
    const header = trailing.slice(i, braceStart)
    let depth = 0, k = braceStart
    for (; k < n; k++) {
      if (trailing[k] === '{') depth++
      else if (trailing[k] === '}') { depth--; if (depth === 0) break }
    }
    // Only test the part of the header after the last top-level `;` — text
    // before that is already-complete prior statements, not part of this
    // brace's own header (e.g. `int x = 1; for (...) {`).
    const lastSemi = lastTopLevelSemicolon(header)
    const pre = header.slice(0, lastSemi + 1)
    const headerTail = header.slice(lastSemi + 1).trim()
    const isMember = headerTail.length > 0
      && !/^(if|for|while|switch|try|do|synchronized|catch|finally|else)\b/.test(headerTail)
      && !headerTail.includes('=')
      && /\)\s*(throws\s+[\w.,\s<>]+)?$/.test(headerTail)
    if (isMember) {
      if (pre.trim()) remainder += pre
      members.push(headerTail + ' ' + trailing.slice(braceStart, k + 1))
    } else {
      remainder += trailing.slice(i, k + 1)
    }
    i = k + 1
  }
  return { members, remainder: remainder.trim() }
}

function wrapJava(code) {
  // Wandbox compiles Java in prog.java — strip 'public' from top-level class
  // declarations so the name doesn't have to match the filename.
  const normalized = code.replace(/^public\s+(class\s)/gm, '$1')

  // A snippet can legitimately contain a complete class (or several) *and*
  // bare code after them meant to exercise that class — e.g.
  // `class Vehicle {...} class Car extends Vehicle {...}` followed by
  // `Car car = new Car(60); System.out.println(...)`. That trailing code
  // isn't valid Java outside a method; sending it unchanged (the old
  // behavior whenever "class" appeared anywhere) sent that straight to
  // Wandbox, which reported it as a malformed attempt at Java's "implicitly
  // declared classes" preview feature.
  const declEnd = findJavaDeclarationsEnd(normalized)
  const declarations = normalized.slice(0, declEnd).trim()
  const trailing = normalized.slice(declEnd).trim()

  if (declEnd > 0 && !trailing) return normalized // already a complete, self-contained file

  if (/\bmain\s*\(/.test(trailing)) {
    // Trailing content already defines its own main() — just give it a home.
    return `${declarations ? declarations + '\n\n' : ''}class Main {\n${trailing.replace(/^/gm, '    ')}\n}`
  }

  // Also runs with no leading declarations at all (declEnd === 0) — bare code
  // can itself contain a mix of top-level helper functions and loose
  // statements (e.g. two `static` helper methods and a final call to one of
  // them), and a helper method definition can't just be dumped as text inside
  // main() the way a plain statement can — it has to become a real sibling
  // method of the synthesized Main class, same as when helpers follow a class.
  const { members, remainder } = splitJavaTrailing(trailing)
  const memberBlock = members.join('\n\n')

  return `${declarations ? declarations + '\n\n' : ''}class Main {\n${memberBlock ? memberBlock.replace(/^/gm, '    ') + '\n\n' : ''}    public static void main(String[] args) throws Exception {\n${remainder.replace(/^/gm, '        ')}\n    }\n}`
}

function wrapCSharp(code) {
  if (/\bclass\s+\w/.test(code) || /^using\s/m.test(code)) return code
  return `using System;\nclass Program {\n    static void Main(string[] args) {\n${code.replace(/^/gm, '        ')}\n    }\n}`
}

function wrapKotlin(code) {
  if (/\bfun\s+main\b/.test(code) || /\bclass\s+\w/.test(code)) return code
  return `fun main() {\n${code.replace(/^/gm, '    ')}\n}`
}

function wrapScala(code) {
  if (/\bobject\s+\w/.test(code) || /\bclass\s+\w/.test(code)) return code
  return `object Main extends App {\n${code.replace(/^/gm, '  ')}\n}`
}

// ── Rust ─────────────────────────────────────────────────────────────────────
// Unlike Java, Rust doesn't require every function to live inside a class — a
// bare `fn`/`struct`/`impl`/`enum`/`trait` is already valid at the top level, so
// there's no need to synthesize a wrapper type. The only thing that needs a
// home is truly loose statements, which get wrapped in `fn main() { ... }`.
const RUST_ITEM_START = /^\s*(?:#!?\[[^\]]*\]\s*)*(?:pub(?:\([^)]*\))?\s+)?(?:fn|struct|enum|impl|trait|mod)\b/
const RUST_USE_START = /^\s*use\s+[^;]+;/

function findRustItemsEnd(code) {
  let i = 0
  while (i < code.length) {
    const rest = code.slice(i)
    const useMatch = rest.match(RUST_USE_START)
    if (useMatch) { i += useMatch[0].length; continue }
    if (!RUST_ITEM_START.test(rest)) break
    const braceStart = rest.indexOf('{')
    if (braceStart === -1) break
    let depth = 0, j = braceStart
    for (; j < rest.length; j++) {
      if (rest[j] === '{') depth++
      else if (rest[j] === '}') { depth--; if (depth === 0) break }
    }
    if (depth !== 0) break
    i += j + 1
  }
  return i
}

function wrapRust(code) {
  if (/\bfn\s+main\s*\(/.test(code)) return code // already self-contained

  const itemsEnd = findRustItemsEnd(code)
  const items = code.slice(0, itemsEnd).trim()
  const trailing = code.slice(itemsEnd).trim()

  if (!trailing) return code // declarations only, nothing to run

  return `${items ? items + '\n\n' : ''}fn main() {\n${trailing.replace(/^/gm, '    ')}\n}`
}

// ── C++ ──────────────────────────────────────────────────────────────────────
// Same "leave declarations alone, wrap only the loose statements" shape as
// Rust, but C++ has two extra wrinkles: a class/struct/enum needs its required
// trailing `;` consumed as part of the declaration, and `std::` usage needs a
// real `#include` — there's no fully-qualified escape hatch the way Java's
// `java.util.List` avoids needing an `import`. Headers are injected by a
// deliberately simple usage heuristic, not a real dependency resolver.
const CPP_ITEM_START = /^\s*(?:template\s*<[^>]*>\s*)?(?:(?:public|private|protected|static|virtual|inline|constexpr)\s+)*(?:class|struct|enum)\s+\w/
const CPP_INCLUDE_RULES = [
  [/\bstd::(cout|cin|cerr|endl)\b/, '<iostream>'],
  [/\bstd::string\b/, '<string>'],
  [/\bstd::vector\b/, '<vector>'],
  [/\bstd::unordered_map\b/, '<unordered_map>'],
  [/\bstd::map\b/, '<map>'],
  [/\bstd::unordered_set\b/, '<unordered_set>'],
  [/\bstd::set\b/, '<set>'],
  [/\bstd::(sort|find|max|min|for_each|accumulate|count)\b/, '<algorithm>'],
  [/\bstd::(unique_ptr|shared_ptr|make_unique|make_shared)\b/, '<memory>'],
  [/\bstd::(pair|make_pair)\b/, '<utility>'],
  [/\bstd::function\b/, '<functional>'],
  [/\bstd::optional\b/, '<optional>'],
  [/\bstd::(runtime_error|logic_error|invalid_argument|out_of_range|exception)\b/, '<stdexcept>'],
  [/\bstd::(pow|sqrt|abs|floor|ceil|round|fmod)\s*\(/, '<cmath>'],
  [/\bstd::(setprecision|fixed|scientific|setw|hex|oct|showpoint)\b/, '<iomanip>'],
  [/\bstd::(istringstream|ostringstream|stringstream)\b/, '<sstream>'],
  [/\bstd::numeric_limits\b/, '<limits>'],
  [/\bstd::array\b/, '<array>'],
  [/\bstd::to_string\s*\(/, '<string>'],
]

function detectCppIncludes(code) {
  const found = []
  for (const [pattern, header] of CPP_INCLUDE_RULES) {
    if (pattern.test(code)) found.push(header)
  }
  return found
}

// Consumes a leading, contiguous run of class/struct/enum declarations only —
// mirrors findJavaDeclarationsEnd. Free functions are deliberately NOT
// consumed here even though they're valid at file scope, because a free
// function can legitimately appear *after* some loose statements too (e.g.
// two variable declarations, then a helper function, then a call to it) —
// that interleaved case is what splitCppTrailing (below) handles, the same
// two-phase split wrapJava already uses and for the same reason.
function findCppDeclarationsEnd(code) {
  let i = 0
  while (i < code.length) {
    const rest = code.slice(i)
    if (!CPP_ITEM_START.test(rest)) break
    const braceStart = rest.indexOf('{')
    if (braceStart === -1) break
    let depth = 0, j = braceStart
    for (; j < rest.length; j++) {
      if (rest[j] === '{') depth++
      else if (rest[j] === '}') { depth--; if (depth === 0) break }
    }
    if (depth !== 0) break
    let end = j + 1
    const semiMatch = rest.slice(end).match(/^\s*;/) // class/struct/enum need their trailing `;`
    if (semiMatch) end += semiMatch[0].length
    i += end
  }
  return i
}

// Splits loose top-level code into free-function definitions (hoisted out,
// since C++ allows them at file scope — no synthesized wrapper class needed
// the way Java requires) vs everything else, which stays inside main() in
// its original order. Structurally identical to splitJavaTrailing; C++ just
// never needs to nest the "members" inside anything.
function splitCppTrailing(trailing) {
  const members = []
  let remainder = ''
  let i = 0
  const n = trailing.length
  while (i < n) {
    const braceStart = trailing.indexOf('{', i)
    if (braceStart === -1) { remainder += trailing.slice(i); break }
    const header = trailing.slice(i, braceStart)
    let depth = 0, k = braceStart
    for (; k < n; k++) {
      if (trailing[k] === '{') depth++
      else if (trailing[k] === '}') { depth--; if (depth === 0) break }
    }
    const lastSemi = lastTopLevelSemicolon(header)
    const pre = header.slice(0, lastSemi + 1)
    const headerTail = header.slice(lastSemi + 1).trim()
    // A free function's header ends in `)`, optionally followed by `const`/
    // `noexcept` — not a control-flow keyword or a statement that merely
    // contains a brace, like an array initializer (`std::vector<int> v =
    // {1, 2, 3};`) or a lambda assigned to a variable (`std::function<...> f
    // = [](...) { ... };`, whose own `)` right before the lambda body's `{`
    // would otherwise pass the "ends in )" check).
    const isMember = headerTail.length > 0
      && !/^(if|for|while|switch|do|else|try|catch)\b/.test(headerTail)
      && !headerTail.includes('=')
      && /\)\s*(const)?\s*(noexcept)?\s*$/.test(headerTail)
    if (isMember) {
      if (pre.trim()) remainder += pre
      members.push(headerTail + ' ' + trailing.slice(braceStart, k + 1))
    } else {
      remainder += trailing.slice(i, k + 1)
    }
    i = k + 1
  }
  return { members, remainder: remainder.trim() }
}

function wrapCpp(code) {
  if (/\bint\s+main\s*\(/.test(code)) {
    const existing = new Set((code.match(/^#include\s*<[^>]+>/gm) || []).map(l => l.match(/<[^>]+>/)[0]))
    const missing = detectCppIncludes(code).filter(h => !existing.has(h))
    return missing.length ? missing.map(h => `#include ${h}`).join('\n') + '\n' + code : code
  }

  const declEnd = findCppDeclarationsEnd(code)
  const declarations = code.slice(0, declEnd).trim()
  const trailing = code.slice(declEnd).trim()
  const includes = detectCppIncludes(code).map(h => `#include ${h}`).join('\n')

  if (!trailing) return (includes ? includes + '\n\n' : '') + code // declarations only

  const { members, remainder } = splitCppTrailing(trailing)
  const memberBlock = members.join('\n\n')

  return `${includes ? includes + '\n\n' : ''}${declarations ? declarations + '\n\n' : ''}${memberBlock ? memberBlock + '\n\n' : ''}int main() {\n${remainder.replace(/^/gm, '    ')}\n    return 0;\n}`
}

function autoWrap(lang, code) {
  if (lang === 'java') return wrapJava(code)
  if (lang === 'csharp') return wrapCSharp(code)
  if (lang === 'kotlin') return wrapKotlin(code)
  if (lang === 'scala') return wrapScala(code)
  if (lang === 'rust') return wrapRust(code)
  if (lang === 'cpp' || lang === 'c++') return wrapCpp(code)
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

async function runWandbox(compiler, code, stdin = '') {
  let res
  const body = { code, compiler }
  if (stdin) body.stdin = stdin
  try {
    res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Wandbox unreachable — check your connection')
  }
  if (!res.ok) throw new Error(`Wandbox returned ${res.status}`)
  const data = await res.json()
  const compileErr = (data.compiler_error || '').trimEnd()
  const out = (data.program_output || '').trimEnd()
  const err = (data.program_error || '').trimEnd()
  // Wandbox puts compiler *warnings* in compiler_error too, not just hard
  // errors — a program that compiled fine (just with an unused-variable
  // warning, say) still runs and produces real output. Treating any non-empty
  // compiler_error as a failure meant a harmless warning showed as "Compile
  // error" even though the code worked. A genuine compile failure means the
  // program never ran at all — no program_output, no program_error either —
  // so that combination, plus the message actually containing "error" and
  // not just warning noise, is what actually distinguishes the two.
  if (compileErr && !out && !err && /error/i.test(compileErr)) {
    return 'Error: Compile error:\n' + compileErr
  }
  if (out && err) return out + '\n⚠ stderr:\n' + err
  return out || err || (compileErr ? compileErr : '(no output)')
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

async function runPiston(lang, wrappedCode, stdin = '') {
  const pistonLang = PISTON_LANG[lang]
  if (!pistonLang) throw new Error('No Piston runner for: ' + lang)
  let res
  const body = { language: pistonLang, version: '*', files: [{ content: wrappedCode }] }
  if (stdin) body.stdin = stdin
  try {
    res = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
export async function runCode(language, code, priorCode = '', stdin = '') {
  const lang = language.toLowerCase()
  if (lang === 'python' || lang === 'py') return runPython(code, stdin)
  if (lang === 'javascript' || lang === 'js') return runJS(code, priorCode, stdin)
  if (lang === 'typescript' || lang === 'ts')
    return runJS(stripTypeScript(code), priorCode ? stripTypeScript(priorCode) : '', stdin)
  if (lang === 'matlab' || lang === 'm') return runMatlab(code)

  const wrapped = autoWrap(lang, code)

  // Kotlin and PowerShell go straight to Piston (Wandbox doesn't support them)
  if (lang === 'kotlin' || lang === 'powershell' || lang === 'ps1')
    return runPiston(lang, wrapped, stdin)

  // Everything else: try Wandbox first, fall back to Piston on any failure
  const wandboxCompiler = WANDBOX_COMPILER[lang]
  if (wandboxCompiler) {
    try {
      return await runWandbox(wandboxCompiler, wrapped, stdin)
    } catch (wandboxErr) {
      if (!PISTON_LANG[lang]) throw wandboxErr
      try {
        return await runPiston(lang, wrapped, stdin)
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
