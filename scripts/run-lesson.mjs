/**
 * run-lesson.mjs — run every step of a lesson through the interpreter and print console.log output.
 *
 * Usage:
 *   node scripts/run-lesson.mjs src/labs/abstraction-viz/lessons/callback.js
 *   node scripts/run-lesson.mjs src/labs/abstraction-viz/lessons/hof.js 3
 *        (optional step number — 1-indexed; omit to run all steps)
 */

import { createRequire } from 'module'
import { pathToFileURL, fileURLToPath } from 'url'
import path from 'path'
import { readFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ── Load the interpreter ──────────────────────────────────────────────────────
const { run } = await import(pathToFileURL(path.join(ROOT, 'src/engines/js/interpreter/interpreter.js')).href)

// ── Load the lesson ───────────────────────────────────────────────────────────
const lessonArg = process.argv[2]
const stepArg   = process.argv[3] ? parseInt(process.argv[3], 10) : null

if (!lessonArg) {
  console.error('Usage: node scripts/run-lesson.mjs <lesson-file> [step-number]')
  process.exit(1)
}

const lessonPath = path.resolve(ROOT, lessonArg)
const { default: lesson } = await import(pathToFileURL(lessonPath).href)

const steps = lesson.steps
const range = stepArg ? [steps[stepArg - 1]].filter(Boolean) : steps
const offset = stepArg ? stepArg - 1 : 0

// ── Run each step ─────────────────────────────────────────────────────────────
let anyFail = false

for (let i = 0; i < range.length; i++) {
  const step = range[i]
  const stepNum = offset + i + 1
  const src = step.runCode ?? step.code

  const result = run(src)

  // console.log output is collected in result.output (array of strings)
  const lines = result.output ?? []

  const status = result.error ? '✗ ERROR' : '✓'
  const title  = step.title ?? `Step ${stepNum}`

  console.log(`\n[Step ${stepNum}] ${title}`)
  if (result.error) {
    console.log(`  ERROR: ${result.error.message} (line ${result.error.line})`)
    anyFail = true
  } else if (lines.length === 0) {
    console.log('  (no console.log output)')
  } else {
    lines.forEach(l => console.log(`  ${l}`))
  }
}

console.log('')
process.exit(anyFail ? 1 : 0)
