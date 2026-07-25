#!/usr/bin/env node
/**
 * Structural linter for the narrative markdown lesson series governed by
 * src/docs/reference/LESSON_CONTRACT.md and LESSON SCHEMA.md — the
 * Concept-Unit-per-section format used by src/docs/projects/track-beginner/,
 * src/docs/projects/pocket-inventory-wpf/, and any future series in that
 * same shape. This is NOT the same system as validate-lesson-schema.mjs,
 * which checks the unrelated JS-object interactive lesson engine under
 * src/courses/ — a lesson here is a plain .md file, not a JS export.
 *
 * What this catches (structural / mechanical, no code understanding
 * required):
 *   1. A Concept Unit missing one of its required steps (Problem,
 *      Mechanical Walkthrough, CS Lens, SE Lens).
 *   2. A lesson file missing one of its required closing sections.
 *   3. Prose sentences trapped inside a ``` code fence instead of real
 *      code or real output — the exact bug this script exists because of.
 *   4. The same backticked term claimed "first appearance" in more than
 *      one lesson file — usually means an earlier lesson quietly grew a
 *      dependency on something a later lesson still thinks it owns.
 *   5. Inside a Concept Unit's own "Introduce the Concept in Isolation"
 *      lab specifically (not the file at large — a shape reappearing later
 *      in a full "New Code" listing doesn't need re-tracing): a
 *      `for`/`while`/`foreach` loop, or 2+ back-to-back `new ClassName(...)`
 *      constructions of the same class, with no "Iteration N:" trace or
 *      numbered walkthrough anywhere in that same subsection.
 *   6. A required heading that exists but isn't spelled in the series'
 *      canonical Title Case (e.g. "Mechanical walkthrough" instead of
 *      "Mechanical Walkthrough") — reported separately from #1/#2 above
 *      since the content isn't missing, just inconsistently spelled.
 *
 * What this CANNOT catch, on purpose — don't extend it to pretend it can:
 *   - Whether an explanation is actually *correct* (the Observer vs.
 *     Template Method conflation this script exists partly because of is
 *     a semantic error, not a structural one — no regex catches that).
 *   - Whether shown code matches what a real, current IDE/SDK actually
 *     generates — that only ever surfaces against the reader's real
 *     machine, which is exactly why the reactive fix-as-you-go loop with
 *     the user still matters even with this script running clean.
 *
 * Usage:
 *   node scripts/check-narrative-lessons.mjs                    # both known series
 *   node scripts/check-narrative-lessons.mjs <folder>            # one folder
 *   node scripts/check-narrative-lessons.mjs <folder> <folder>   # several
 */

import { readdirSync, readFileSync, statSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const DEFAULT_FOLDERS = [
  'src/docs/projects/track-beginner',
  'src/docs/projects/pocket-inventory-wpf',
]

// CS Lens is genuinely conditional in the schema itself ("Name the
// computational concept this embodies, if any" — LESSON SCHEMA.md step 8) —
// a pure-tooling or pure-inspection unit can legitimately have none. SE Lens
// has no such qualifier ("why it's engineered this way" — step 9), so it's
// treated as required. Keep this list in sync with LESSON SCHEMA.md's own
// Concept Unit sequence if that document changes.
// Matching is case-insensitive on purpose: the early pocket-inventory-wpf
// lessons (0-8) use "### Mechanical walkthrough" / "### Introduce the
// concept in isolation" (lowercase after the first word) where every later
// lesson uses Title Case — a real, genuine drift, but a capitalization one,
// not a missing-content one. checkHeadingCaseDrift reports that separately
// so it isn't conflated with "this step doesn't exist at all."
const REQUIRED_UNIT_HEADINGS = [
  { name: 'The Problem', re: /^###\s+The Problem\b/im },
  { name: 'Mechanical Walkthrough', re: /^###\s+Mechanical Walkthrough\b/im },
  { name: 'SE Lens', re: /^###\s+SE Lens\b/im },
]
// Reported separately, softer wording — absence is allowed by the schema,
// but worth a human glance since it's also the more commonly *forgotten*
// one, not just the more commonly *inapplicable* one.
const OPTIONAL_BUT_WORTH_CHECKING = [
  { name: 'CS Lens', re: /^###\s+CS Lens\b/im },
]
// The canonical Title Case spelling of every heading this script looks for,
// used only to detect case drift, never to decide presence/absence.
const CANONICAL_HEADING_CASE = [
  'The Problem',
  'Introduce the Concept in Isolation',
  'Discard the Throwaway Example',
  'Mechanical Walkthrough',
  'CS Lens',
  'SE Lens',
  'Connect the Pieces',
  'What Breaks Without This',
  'Definition of Done',
]

const REQUIRED_CLOSING_HEADINGS = [
  'Connect the Pieces',
  'What Breaks Without This',
  'Exercises',
  'Definition of Done',
]

function isMarkdownFile(name) {
  return name.toLowerCase().endsWith('.md') && name.toUpperCase() !== 'CHANGELOG.MD' && name.toUpperCase() !== 'README.MD' && name.toUpperCase() !== 'CURRICULUM_NOTES.MD'
}

function findLessonFiles(folder) {
  const abs = resolve(root, folder)
  if (!statSync(abs, { throwIfNoEntry: false })?.isDirectory()) return []
  return readdirSync(abs)
    .filter(isMarkdownFile)
    .map((name) => join(abs, name))
    .sort()
}

// Split a file into { heading, level, startLine, body } chunks at every
// '##'/'###' heading, so unit-level checks can be scoped to one unit's own
// text instead of leaking into the next unit's.
function splitByHeading(text, level) {
  const marker = '#'.repeat(level) + ' '
  const lines = text.split('\n')
  const chunks = []
  let current = null
  lines.forEach((line, i) => {
    if (line.startsWith(marker) && !line.startsWith(marker + '#')) {
      if (current) chunks.push(current)
      current = { heading: line.slice(marker.length).trim(), startLine: i + 1, body: [] }
    } else if (current) {
      current.body.push(line)
    }
  })
  if (current) chunks.push(current)
  return chunks.map((c) => ({ ...c, text: c.body.join('\n') }))
}

function checkConceptUnits(fileLabel, text, issues) {
  const units = splitByHeading(text, 2).filter((u) => /^Concept Unit:/i.test(u.heading))
  for (const unit of units) {
    for (const req of REQUIRED_UNIT_HEADINGS) {
      if (!req.re.test(unit.text)) {
        issues.push({
          file: fileLabel,
          line: unit.startLine,
          kind: 'missing-step',
          message: `Concept Unit "${unit.heading}" has no "### ${req.name}" step`,
        })
      }
    }
    for (const opt of OPTIONAL_BUT_WORTH_CHECKING) {
      if (!opt.re.test(unit.text)) {
        issues.push({
          file: fileLabel,
          line: unit.startLine,
          kind: 'note-no-cs-lens',
          message: `Concept Unit "${unit.heading}" has no "### ${opt.name}" — allowed by the schema ("if any"), worth a glance to confirm it's a deliberate omission`,
        })
      }
    }
  }
}

// Track-beginner puts closing sections at '## ' directly; pocket-inventory-wpf
// nests them one level deeper under a literal '## Closing' wrapper, at
// '### '. Both are valid per LESSON SCHEMA.md, which only requires the
// sections exist, not a specific nesting depth — so match either level
// rather than assuming one series' convention is the only correct one.
function checkClosingSections(fileLabel, text, issues) {
  for (const name of REQUIRED_CLOSING_HEADINGS) {
    const re = new RegExp(`^#{2,3}\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'mi')
    if (!re.test(text)) {
      issues.push({
        file: fileLabel,
        line: null,
        kind: 'missing-closing-section',
        message: `Lesson is missing its "${name}" closing section (checked at both ## and ### levels)`,
      })
    }
  }
}

// Heuristic: a fenced block containing a hard-wrapped English paragraph is
// very likely prose that should never have been inside a code fence in the
// first place — the exact Doorbell/Chime bug. The real fingerprint isn't
// just "contains sentences" (real terminal output can too, e.g. a println
// of a sentence-shaped message) — it's *line wrapping mid-sentence*: a
// markdown paragraph hand-wrapped at ~70-80 columns has lines that don't end
// in sentence-ending punctuation, immediately followed by a line starting
// with a lowercase word. Real code and real terminal output are line-per-
// statement / line-per-output and essentially never wrap that way.
function checkProseInFences(fileLabel, text, issues) {
  const lines = text.split('\n')
  let inBlock = false
  let startLine = 0
  let buf = []
  lines.forEach((line, i) => {
    if (line.trim().startsWith('```')) {
      if (!inBlock) {
        inBlock = true
        startLine = i + 1
        buf = []
      } else {
        inBlock = false
        const joined = buf.join(' ')
        const sentenceBreaks = (joined.match(/[a-z]\. [A-Z]/g) || []).length
        let wrapContinuations = 0
        for (let j = 0; j < buf.length - 1; j++) {
          const cur = buf[j].trim()
          const next = buf[j + 1].trim()
          if (!cur || !next) continue
          const curEndsMidSentence = cur.length > 0 && !/[.!?:{}\[\];,)]$/.test(cur) && !cur.endsWith('```')
          const nextStartsLowercaseWord = /^[a-z]/.test(next)
          if (curEndsMidSentence && nextStartsLowercaseWord) wrapContinuations++
        }
        if (sentenceBreaks >= 2 && wrapContinuations >= 1) {
          issues.push({
            file: fileLabel,
            line: startLine,
            kind: 'prose-in-fence',
            message: `Code fence at line ${startLine} looks like a hard-wrapped prose paragraph (${sentenceBreaks} sentence breaks, ${wrapContinuations} mid-sentence line wraps) — should this be a numbered walkthrough instead? See LESSON SCHEMA.md's "second shape of execution trace."`,
          })
        }
      }
    } else if (inBlock) {
      buf.push(line)
    }
  })
}

// A fenced block is an "arrow trace" if most of its non-empty lines contain
// the Unicode arrow `→` — the shape Lesson 6b's Counter trace actually used
// (`new Counter() → a: totalCreated 0 → 1, a.id = 1`). Deliberately checks
// ONLY the Unicode arrow, not ASCII `->`: `->` shows up in legitimate code
// and output for unrelated reasons (Java lambda syntax, and — caught as a
// real false positive here — a C# lab whose own `Console.WriteLine` prints
// literal `'{input}' -> blank: {isBlank}"` as its real output), so it isn't
// a reliable signal. `→` is rare enough in real code/output that it isn't.
// This is NOT one of the two shapes LESSON SCHEMA.md documents (`Iteration
// N:` code fence, or an unfenced numbered list) — it's a third, undocumented
// shape that has crept in. Recognized here only so it isn't miscounted as
// real code, and reported separately (see checkMissingTraces) as "exists,
// wrong shape"
// rather than silently passing as compliant or wrongly counted as absent.
function isArrowTraceBlock(block) {
  const lines = block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('```'))
  if (lines.length === 0) return false
  const arrowLines = lines.filter((l) => l.includes('→')).length
  return arrowLines / lines.length >= 0.5
}

// Execution-trace requirement, scoped to the Concept Isolation Rule itself:
// LESSON SCHEMA.md's "Introduce the Concept in Isolation" step is where a
// new construct gets its throwaway lab, and per the Doorbell/Chime saga and
// the Lesson 6b `Counter` bug, if that lab's code contains a loop OR 2+
// sequential constructions of the same class WITHIN ONE RUNNING PROGRAM, the
// reader needs a real execution trace showing order/state — not prose
// asserting it works.
//
// "Within one running program" matters, and is checked per-fence rather than
// across the whole isolation subsection: Lesson 2d's `Vault` lab has 4
// separate one-shot demo files (`SamePackageAccess`, `Unrelated`,
// `PrivateTest`, `ProtectedTest`), each independently compiled and run to
// test one boundary case, each already showing its own real output or real
// compiler error immediately after it — that's the correct treatment for
// "several independent tests," and forcing a fake `Iteration N:` trace onto
// unrelated one-shot programs would misrepresent what's actually happening.
// Counter/LightSwitch are the opposite case: multiple `new` calls inside the
// SAME running `main`, genuinely accumulating/comparing state as they go —
// that's what actually needs a trace.
//
// Deliberately scoped to ONLY the isolation subsection, not the whole file:
// the same loop/constructor shape reappearing later in a "New Code" or
// "Updated Project" full-file listing is a *repeat* of an already-traced
// concept (Repetition Rule — basic syntax explained once), not a fresh
// omission every time that shape shows up again in an assembled listing.
function checkMissingTraces(fileLabel, text, issues) {
  const units = splitByHeading(text, 2).filter((u) => /^Concept Unit:/i.test(u.heading))
  for (const unit of units) {
    const subs = splitByHeading(unit.text, 3)
    const isolation = subs.find((s) => /^Introduce the Concept in Isolation$/i.test(s.heading))
    if (!isolation) continue

    const fences = (isolation.text.match(/```[\s\S]*?```/g) || []).filter(
      (block) => !/Iteration \d+:/.test(block) && !isArrowTraceBlock(block),
    )
    const triggers = []
    if (fences.some((block) => /\b(for|foreach|while)\s*\(/.test(block))) triggers.push('a for/while/foreach loop')

    const seen = new Set()
    for (const block of fences) {
      const ctorCounts = new Map()
      for (const m of block.matchAll(/\bnew\s+([A-Z][A-Za-z0-9_]*)\s*\(/g)) {
        ctorCounts.set(m[1], (ctorCounts.get(m[1]) || 0) + 1)
      }
      for (const [cls, count] of ctorCounts) {
        const key = `${cls}:${count}`
        if (count >= 2 && !seen.has(key)) {
          seen.add(key)
          triggers.push(`${count} sequential \`new ${cls}(...)\` constructions in one program`)
        }
      }
    }

    if (triggers.length === 0) continue

    const hasIterationTrace = /Iteration \d+:/.test(isolation.text)
    const hasNumberedWalkthrough = /^\d+\.\s+`/m.test(isolation.text)
    const arrowBlock = (isolation.text.match(/```[\s\S]*?```/g) || []).find(isArrowTraceBlock)
    const globalLine = unit.startLine + isolation.startLine

    if (hasIterationTrace || hasNumberedWalkthrough) continue

    if (arrowBlock) {
      issues.push({
        file: fileLabel,
        line: globalLine,
        kind: 'trace-non-canonical-shape',
        message: `Concept Unit "${unit.heading}"'s isolated lab has ${triggers.join(' and ')} and a trace-shaped block, but it uses an arrow ("→") notation that isn't either shape LESSON SCHEMA.md documents (\`Iteration N:\` or a numbered list) — reformat to \`Iteration N:\`, or decide this arrow shape should be documented as a third valid shape`,
      })
    } else {
      issues.push({
        file: fileLabel,
        line: globalLine,
        kind: 'missing-trace',
        message: `Concept Unit "${unit.heading}"'s isolated lab has ${triggers.join(' and ')} but no "Iteration N:" trace or numbered walkthrough in that section`,
      })
    }
  }
}

// A heading exists (case-insensitively) but isn't spelled in the canonical
// Title Case — e.g. "### Mechanical walkthrough" instead of "### Mechanical
// Walkthrough". Reported as its own low-severity kind, separate from
// missing-step/missing-closing-section, so it never gets conflated with
// "this content doesn't exist" — it does exist, it's just spelled
// inconsistently with the rest of the series.
function checkHeadingCaseDrift(fileLabel, text, issues) {
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!m) return
    const found = m[2].trim()
    for (const canonical of CANONICAL_HEADING_CASE) {
      if (found.toLowerCase() === canonical.toLowerCase() && found !== canonical) {
        issues.push({
          file: fileLabel,
          line: i + 1,
          kind: 'heading-case-drift',
          message: `Heading "${found}" should be spelled "${canonical}" to match the rest of the series`,
        })
      }
    }
  })
}

// Cross-file check: the same backticked term marked "first appearance"
// in more than one lesson means an earlier lesson (in filename order) grew
// a dependency on something a later lesson still claims to own first.
function checkDuplicateFirstAppearance(files, issues) {
  const claims = new Map() // term -> [{file, line}]
  const re = /`([^`\n]{1,60})`\s*—\s*\*\*first appearance/gi
  for (const { fileLabel, text } of files) {
    const lines = text.split('\n')
    lines.forEach((line, i) => {
      let m
      const lineRe = new RegExp(re.source, re.flags)
      while ((m = lineRe.exec(line))) {
        const term = m[1].trim()
        if (!claims.has(term)) claims.set(term, [])
        claims.get(term).push({ file: fileLabel, line: i + 1 })
      }
    })
  }
  for (const [term, locations] of claims) {
    if (locations.length > 1) {
      issues.push({
        file: locations.map((l) => l.file).join(', '),
        line: null,
        kind: 'duplicate-first-appearance',
        message: `"${term}" is marked **first appearance** in ${locations.length} files: ${locations.map((l) => `${basename(l.file)}:${l.line}`).join(', ')}`,
      })
    }
  }
}

function main() {
  const args = process.argv.slice(2)
  const folders = args.length > 0 ? args : DEFAULT_FOLDERS

  const allIssues = []
  const allFileTexts = []

  for (const folder of folders) {
    const files = findLessonFiles(folder)
    if (files.length === 0) {
      console.log(`(no lesson files found in ${folder})`)
      continue
    }
    for (const filePath of files) {
      const fileLabel = join(basename(dirname(filePath)), basename(filePath))
      const text = readFileSync(filePath, 'utf-8')
      allFileTexts.push({ fileLabel, text })
      checkConceptUnits(fileLabel, text, allIssues)
      checkClosingSections(fileLabel, text, allIssues)
      checkProseInFences(fileLabel, text, allIssues)
      checkMissingTraces(fileLabel, text, allIssues)
      checkHeadingCaseDrift(fileLabel, text, allIssues)
    }
  }

  checkDuplicateFirstAppearance(allFileTexts, allIssues)

  if (allIssues.length === 0) {
    console.log(`✓ ${allFileTexts.length} lesson file(s) checked, no structural issues found.`)
    process.exit(0)
  }

  const byFile = new Map()
  for (const issue of allIssues) {
    if (!byFile.has(issue.file)) byFile.set(issue.file, [])
    byFile.get(issue.file).push(issue)
  }

  for (const [file, issues] of byFile) {
    console.log(`\n${file}`)
    for (const issue of issues) {
      const loc = issue.line ? `:${issue.line}` : ''
      console.log(`  [${issue.kind}]${loc} ${issue.message}`)
    }
  }

  console.log(`\n${allFileTexts.length} lesson file(s) checked, ${allIssues.length} issue(s) found.`)
  process.exit(1)
}

main()
