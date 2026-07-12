#!/usr/bin/env node
// Automated test runner for lesson markdown challenge + test blocks.
//
// Reads every content/*/level-*.md file, extracts the `challenge` block
// (starter code) and `test` block (assertions), then runs them together in a
// sandbox that provides a real assert() function so equality failures are
// caught — not just runtime errors.
//
// Only JS/TS lessons are executed (Python/SQL require separate runtimes).
// DOM lessons (referencing document/window) are flagged but skipped in Node.
//
// Usage:
//   node scripts/test-lesson-challenges.mjs                   # all JS lessons
//   node scripts/test-lesson-challenges.mjs clean-code        # one series
//   node scripts/test-lesson-challenges.mjs clean-code/level-2.md  # one file
//   node scripts/test-lesson-challenges.mjs --all             # show stub failures too

import { readdirSync, readFileSync, statSync } from 'fs'
import { resolve, relative, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const CONTENT   = resolve(ROOT, 'src/labs/lesson-engine/content')

// Prevent unhandled Promise rejections from lesson code crashing the runner.
// Lessons sometimes call async functions without await in their challenge stubs.
process.on('unhandledRejection', () => {})

// ── Markdown parsing ──────────────────────────────────────────────────────────

function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {}, body: md }
  const meta = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return { meta, body: m[2] }
}

// Extract one challenge block and one test block per ## section.
// Returns array of { stepTitle, challenge, tests } for steps that have both.
function extractChallenges(markdown) {
  const { meta, body } = parseFrontmatter(markdown)
  const lang = meta.lang ?? 'python'

  if (!['javascript', 'js', 'typescript', 'ts'].includes(lang.toLowerCase())) {
    return { lang, challenges: [] }
  }

  const challenges = []
  const sections = body.split(/(?=^## )/m).filter(s => s.trim())

  for (const section of sections) {
    const fenceRe = /```([^\n`]*)\n([\s\S]*?)```/g
    let m
    let challenge = null
    let tests     = null

    while ((m = fenceRe.exec(section)) !== null) {
      const fenceLang = m[1].trim().split(/\s+/)[0].toLowerCase()
      const code      = m[2].replace(/\n$/, '')
      if (fenceLang === 'challenge') challenge = code
      else if (fenceLang === 'test') tests = code
    }

    if (challenge !== null && tests !== null) {
      const titleLine = section.split('\n')[0]
      const title = titleLine.replace(/^##\s*/, '').trim()
      challenges.push({ stepTitle: title, challenge, tests })
    }
  }

  return { lang, challenges }
}

// ── Harness builder ───────────────────────────────────────────────────────────

// Strip a JS end-of-line comment from an expression without cutting into strings.
// Handles single-quoted, double-quoted strings (not template literals — they're
// rare in assert lines and this is good enough for the test harness use case).
function stripTrailingComment(expr) {
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < expr.length - 1; i++) {
    const c    = expr[i]
    const prev = i > 0 ? expr[i - 1] : ''
    if (c === "'" && !inDouble && prev !== '\\') { inSingle = !inSingle; continue }
    if (c === '"' && !inSingle && prev !== '\\') { inDouble = !inDouble; continue }
    if (c === '/' && expr[i + 1] === '/' && !inSingle && !inDouble) {
      return expr.slice(0, i).trimEnd()
    }
  }
  return expr
}

function buildHarness(challengeCode, testCode) {
  const testLines = testCode
    .split('\n')
    .map(l => l.trimEnd())
    .filter(l => l.trim() !== '' && !l.trim().startsWith('//'))

  const preamble = [
    `function assert(cond, msg) {`,
    `  if (!cond) {`,
    `    const err = new Error(msg || 'Assertion failed');`,
    `    err.__assertFail = true;`,
    `    throw err;`,
    `  }`,
    `}`,
    '',
    '// --- challenge stub ---',
    challengeCode,
    '',
    '// --- tests ---',
    `const __results = [];`,
  ]

  const body = []
  for (const line of testLines) {
    if (line.trimStart().startsWith('assert ')) {
      const raw   = line.trim()
      const expr  = stripTrailingComment(raw.slice(7))  // remove 'assert ' then strip comment
      const label = raw.replace(/\\/g, '\\\\').replace(/`/g, '\\`')
      body.push(`try {`)
      body.push(`  if (!(${expr})) { const e = new Error('Assertion failed'); e.__assertFail = true; throw e; }`)
      body.push(`  __results.push({ passed: true, label: \`${label}\` });`)
      body.push(`} catch (__e) {`)
      body.push(`  __results.push({ passed: false, label: \`${label}\`, detail: __e.message });`)
      body.push(`}`)
    } else {
      body.push(line)
    }
  }

  body.push('return __results;')

  return [...preamble, ...body].join('\n')
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function runHarness(harness) {
  // Guard against test code that patches console.log/error then crashes before
  // restoring — which would corrupt our script's own console.
  const savedLog   = console.log
  const savedError = console.error
  const savedWarn  = console.warn
  try {
    // Wrap in async IIFE so `await` in test setup code is valid
    const fn = new Function(`return (async function() {\n${harness}\n})()`)
    const results = await fn()
    return { results: Array.isArray(results) ? results : [], error: null }
  } catch (e) {
    // Include error name so SyntaxError / ReferenceError are identifiable in classifyDetail
    const label = e.name && e.name !== 'Error' ? `${e.name}: ${e.message}` : e.message
    return { results: [], error: label }
  } finally {
    console.log   = savedLog
    console.error = savedError
    console.warn  = savedWarn
  }
}

// DOM/browser tests can't run in Node; detect before running.
// Also skip challenges that use ES module import syntax (not supported in new Function).
function needsBrowser(challenge, tests) {
  const combined = challenge + '\n' + tests
  if (/^import\s+/m.test(combined)) return true   // ES module imports
  return /\b(document|window\.(?!performance)|navigator|localStorage|sessionStorage|HTMLElement)\b/.test(combined)
}

// ── Classify failures ─────────────────────────────────────────────────────────

function classifyDetail(detail) {
  if (!detail || detail === 'Assertion failed') return 'expected'
  if (/SyntaxError/.test(detail))    return 'structural'
  if (/ReferenceError/.test(detail)) return 'structural'
  if (/Cannot (use import|find module)/.test(detail)) return 'structural'
  // These all mean the stub returned undefined/null — expected for incomplete implementations
  if (/Cannot read properties of (undefined|null)/.test(detail)) return 'expected'
  if (/Cannot destructure property .+ as it is (undefined|null)/.test(detail)) return 'expected'
  if (/Cannot convert undefined or null to object/.test(detail)) return 'expected'
  if (/Cannot use 'in' operator to search for .+ in (undefined|null)/.test(detail)) return 'expected'
  if (/is not a function/.test(detail))  return 'expected'
  if (/is not iterable/.test(detail))    return 'expected'
  // Custom errors thrown from challenge stub logic (e.g. "Unknown rule: X") — expected
  if (/^(Unknown|Invalid|Unsupported|Not implemented|Missing)\b/.test(detail)) return 'expected'
  // Anything else from a runtime-error that looks domain-specific is structural
  return 'structural'
}

// ── File discovery ────────────────────────────────────────────────────────────

function isDir(p) {
  try { return statSync(p).isDirectory() } catch { return false }
}

function findMarkdownFiles(filter) {
  const files = []

  if (filter && filter.includes('/') && filter.endsWith('.md')) {
    files.push(resolve(CONTENT, filter))
    return files
  }

  for (const series of readdirSync(CONTENT).sort()) {
    if (filter && series !== filter) continue
    const seriesDir = resolve(CONTENT, series)
    if (!isDir(seriesDir)) continue
    for (const file of readdirSync(seriesDir).sort()) {
      if (!file.endsWith('.md')) continue
      files.push(resolve(seriesDir, file))
    }
  }
  return files
}

// ── Main ──────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2)
const showAll = args.includes('--all')
const filter  = args.find(a => !a.startsWith('--')) || null

const files = findMarkdownFiles(filter)
if (files.length === 0) {
  console.error(`No lesson files found${filter ? ` for "${filter}"` : ''}.`)
  process.exit(1)
}

let totalFiles   = 0
let skippedFiles = 0
let domSkipped   = 0
let passFiles    = 0
let failFiles    = 0
let totalAssert  = 0
let failAssert   = 0

const failures = []

for (const filePath of files) {
  const rel  = relative(ROOT, filePath)
  let md
  try { md = readFileSync(filePath, 'utf-8') } catch { continue }

  const { lang, challenges } = extractChallenges(md)

  if (challenges.length === 0) {
    if (!['javascript', 'js', 'typescript', 'ts'].includes(lang.toLowerCase())) {
      skippedFiles++
    } else {
      console.log(`  (no challenge) ${rel}`)
      skippedFiles++
    }
    continue
  }

  totalFiles++
  let fileFailed    = false
  let hasStructural = false
  let allDom        = true   // track if every challenge was a DOM skip

  for (const { stepTitle, challenge, tests } of challenges) {
    if (needsBrowser(challenge, tests)) {
      domSkipped++
      continue
    }
    allDom = false

    const harness = buildHarness(challenge, tests)
    const { results, error } = await runHarness(harness)

    if (error) {
      const cls = classifyDetail(error)
      if (cls === 'structural') hasStructural = true
      fileFailed = true
      failures.push({ rel, stepTitle, kind: 'runtime-error', class: cls, detail: error })
      continue
    }

    for (const r of results) {
      totalAssert++
      if (!r.passed) {
        failAssert++
        fileFailed = true
        const cls = classifyDetail(r.detail)
        if (cls === 'structural') hasStructural = true
        failures.push({ rel, stepTitle, kind: 'assertion', class: cls, label: r.label, detail: r.detail })
      }
    }
  }

  if (allDom) {
    // All challenges skipped — don't count as tested
    totalFiles--
    continue
  }

  if (fileFailed) {
    failFiles++
    if (hasStructural || showAll) {
      console.log(`✗ ${rel}${hasStructural ? '' : ' (stub failures only)'}`)
    }
  } else {
    passFiles++
    console.log(`✓ ${rel}`)
  }
}

console.log('')
console.log(`JS/TS lessons: ${totalFiles} checked, ${skippedFiles} non-JS skipped, ${domSkipped} DOM challenges skipped`)
console.log(`Assertions: ${totalAssert - failAssert} passed, ${failAssert} failed`)

const structuralFailures = failures.filter(f => f.class === 'structural')
const expectedFailures   = failures.filter(f => f.class === 'expected')

const toShow = showAll ? failures : structuralFailures

if (toShow.length > 0) {
  const header = showAll ? 'ALL FAILURES' : 'STRUCTURAL BUGS'
  console.log(`\n── ${header} ────────────────────────────────────────────`)

  let lastFile = null
  for (const f of toShow) {
    if (f.rel !== lastFile) {
      console.log(`\n  ${f.rel}`)
      lastFile = f.rel
    }
    if (f.stepTitle) console.log(`  Step: ${f.stepTitle}`)
    if (f.kind === 'runtime-error') {
      console.log(`  [runtime] ${f.detail}`)
    } else {
      console.log(`  ${f.label}`)
      if (f.detail && f.detail !== 'Assertion failed') console.log(`  → ${f.detail}`)
    }
  }
  console.log('')
}

if (!showAll && expectedFailures.length > 0) {
  console.log(`(${expectedFailures.length} expected stub failures hidden — use --all to see them)`)
}

if (structuralFailures.length > 0) {
  process.exit(1)
}
