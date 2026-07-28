#!/usr/bin/env node
/**
 * Structural + content linter specific to the wpf-lessons track
 * (src/docs/projects/inventory/tdd/wpf-lessons/ and the C#/WPF-specific
 * files it added to src/docs/projects/inventory/tdd/concepts/). Sibling to
 * check-narrative-lessons.mjs, which already covers wpf-lessons' own
 * lesson-file structure (Concept Unit steps, glossary, execution traces) —
 * run both, not just this one. This script exists for two things that
 * script does NOT and cannot check, both real bugs found by hand, more
 * than once, before this existed:
 *
 *   1. Concept files (../concepts/*.md) follow a DIFFERENT schema than
 *      lesson files — Setup / The Problem / The Isolated Example /
 *      Mechanical Walkthrough / CS Lens (optional) / SE Lens / Connection
 *      / Try It Yourself, per concepts/README.md — and check-narrative-
 *      lessons.mjs only knows about the lesson-file shape (`## Concept
 *      Unit: X` wrappers). Nothing was checking concept files at all.
 *   2. A code fence inside "## The Isolated Example" with no stated file
 *      (which file this goes in, new vs. replace vs. fragment) — the
 *      exact "I don't know what to type where" bug a user hit directly,
 *      more than once, across different concept files.
 *   3. A closed list of "assumed you completed ../lessons/ / know Python"
 *      phrasings — wpf-lessons/README.md states a hard floor (basic
 *      functions/data types/loops, nothing else) specifically because an
 *      earlier pass silently violated it repeatedly (Python `import`
 *      comparisons, "already known from the main track", `pip install`
 *      analogies, HTML-via-`lessons/` assumptions) — found and fixed by
 *      hand three separate times this session before this check existed.
 *
 * What this CANNOT catch, on purpose — same caveat as the sibling script:
 * whether an explanation is factually correct, or whether a labeled file
 * actually matches what's shown elsewhere in the same unit. Structural
 * and lexical only.
 *
 * Usage:
 *   node scripts/check-wpf-concepts.mjs
 */

import { readdirSync, readFileSync, statSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const CONCEPTS_DIR = 'src/docs/projects/inventory/tdd/concepts'
const WPF_LESSONS_DIR = 'src/docs/projects/inventory/tdd/wpf-lessons'
// Only the C#/WPF-specific files this track added — not the other 250+
// pre-existing Python/JS concept files, which are a different track's
// content with different, legitimate assumptions (Python IS assumed
// known there).
const WPF_CONCEPT_PREFIX_RE = /^(csharp|wpf|xaml|dotnet|csproj)-/i
const NON_LESSON_FILENAMES = new Set(['README.MD', 'HOW-TO-RUN-EXAMPLES.MD'])

function listMarkdownFiles(folder) {
  const abs = resolve(root, folder)
  if (!statSync(abs, { throwIfNoEntry: false })?.isDirectory()) return []
  return readdirSync(abs)
    .filter((n) => n.toLowerCase().endsWith('.md'))
    .map((name) => join(abs, name))
    .sort()
}

const conceptFiles = listMarkdownFiles(CONCEPTS_DIR).filter((p) =>
  WPF_CONCEPT_PREFIX_RE.test(basename(p)),
)
const lessonFiles = listMarkdownFiles(WPF_LESSONS_DIR).filter(
  (p) => !NON_LESSON_FILENAMES.has(basename(p).toUpperCase()),
)

const REQUIRED_CONCEPT_HEADINGS = [
  { name: 'Setup', re: /^##\s+Setup\b/im },
  { name: 'The Problem', re: /^##\s+The Problem\b/im },
  { name: 'The Isolated Example', re: /^##\s+The Isolated Example\b/im },
  { name: 'Mechanical Walkthrough', re: /^##\s+Mechanical Walkthrough\b/im },
  { name: 'SE Lens', re: /^##\s+SE Lens\b/im },
  { name: 'Connection', re: /^##\s+Connection\b/im },
  { name: 'Try It Yourself', re: /^##\s+Try It Yourself\b/im },
]
const PREREQ_LINE_RE = /^\*\*Prerequisites:\*\*/im
const UNDERSTAND_LINE_RE = /^\*\*What you'll understand by the end:\*\*/im

function checkConceptFileStructure(fileLabel, text, issues) {
  for (const req of REQUIRED_CONCEPT_HEADINGS) {
    if (!req.re.test(text)) {
      issues.push({
        file: fileLabel,
        line: null,
        kind: 'missing-concept-section',
        message: `Missing "## ${req.name}" — every concept file needs this per concepts/README.md's own format`,
      })
    }
  }
  if (!PREREQ_LINE_RE.test(text)) {
    issues.push({
      file: fileLabel,
      line: null,
      kind: 'missing-prerequisites-line',
      message: `No "**Prerequisites:**" line — even "none" must be stated explicitly, not omitted`,
    })
  }
  if (!UNDERSTAND_LINE_RE.test(text)) {
    issues.push({
      file: fileLabel,
      line: null,
      kind: 'missing-understand-line',
      message: `No "**What you'll understand by the end:**" line`,
    })
  }
}

// Splits at every '## ' heading so the Isolated Example section's own
// fences can be checked in isolation, not the whole file.
function extractSection(text, headingName) {
  const re = new RegExp(`^##\\s+${headingName}\\b.*$`, 'im')
  const m = re.exec(text)
  if (!m) return null
  const startLine = text.slice(0, m.index).split('\n').length
  const rest = text.slice(m.index + m[0].length)
  const end = rest.search(/^##\s+/m)
  return { startLine, text: end === -1 ? rest : rest.slice(0, end) }
}

// A code fence is "labeled" if the preceding PARAGRAPH (back to the last
// blank line, or the section start — not a fixed line count, since a real
// explanatory paragraph can legitimately run 5+ lines) contains a
// backtick-wrapped filename (ending .cs/.xaml/.csproj, optionally with a
// folder prefix like `AccessLib/Class1.cs`) or the phrase "In `" — the
// shapes every fixed instance of this bug converged on. Deliberately only
// checks ```csharp and ```xml fences — command/output fences don't need a
// target file.
const FENCE_OPEN_RE = /^```(csharp|xml)\s*$/
const FILE_LABEL_NEARBY_RE = /`[\w./-]*\.(cs|xaml|csproj)`|In `/

function checkIsolatedExampleFenceLabels(fileLabel, text, issues) {
  const section = extractSection(text, 'The Isolated Example')
  if (!section) return
  const lines = section.text.split('\n')
  lines.forEach((line, i) => {
    if (!FENCE_OPEN_RE.test(line.trim())) return
    let end = i
    while (end > 0 && lines[end - 1].trim() === '') end--
    let start = end
    while (start > 0 && lines[start - 1].trim() !== '') start--
    const precedingParagraph = lines.slice(start, end).join('\n')
    if (!FILE_LABEL_NEARBY_RE.test(precedingParagraph)) {
      issues.push({
        file: fileLabel,
        line: section.startLine + i,
        kind: 'unlabeled-code-fence',
        message: `Code fence has no filename stated in the paragraph before it — a reader can't tell which file this goes in, or whether it's new/replace/fragment (per HOW-TO-RUN-EXAMPLES.md's own rule)`,
      })
    }
  })
}

// The specific phrasings that shipped, more than once, before
// wpf-lessons/README.md's "What's assumed known" floor was written —
// each one assumes the reader completed ../lessons/ or already knows
// Python, neither of which is true. Curated from real fixes, not a
// blanket "never say Python" rule (a CS Lens "Also recognized in: Python's
// __init__..." aside is fine — that's comparison, not a claimed
// prerequisite). Kept narrow on purpose: a broad "flag every mention of
// Python" regex was tried mentally and rejected as too noisy to act on.
const BANNED_ASSUMPTION_PATTERNS = [
  { re: /already known from the main track/i, why: 'claims prior main-track completion' },
  { re: /main track'?s own `/i, why: 'cites a main-track concept file as if the reader already read it' },
  { re: /already (used|covered|named|taught) in `?\.\.\/?lessons\//i, why: 'assumes ../lessons/ was completed' },
  { re: /C#'?s equivalent of Python/i, why: 'explains a C# construct only in terms of Python' },
  { re: /Python'?s (rough )?equivalent/i, why: 'explains a C# construct only in terms of Python' },
  { re: /\bpip install\b/i, why: 'assumes Python packaging knowledge' },
  { re: /\brequirements\.txt\b/i, why: 'assumes Python packaging knowledge' },
  { re: /already familiar from Python/i, why: 'claims prior Python familiarity' },
  { re: /HTML already used in `?\.\.\/?lessons\//i, why: 'assumes ../lessons/ frontend work was seen' },
]

function checkBannedAssumptions(fileLabel, text, issues) {
  const lines = text.split('\n')
  lines.forEach((line, i) => {
    for (const { re, why } of BANNED_ASSUMPTION_PATTERNS) {
      if (re.test(line)) {
        issues.push({
          file: fileLabel,
          line: i + 1,
          kind: 'banned-assumption',
          message: `"${line.trim().slice(0, 100)}" — ${why}; wpf-lessons/README.md's floor is basic functions/data types/loops ONLY`,
        })
      }
    }
  })
}

function main() {
  const allIssues = []

  for (const filePath of conceptFiles) {
    const fileLabel = join('concepts', basename(filePath))
    const text = readFileSync(filePath, 'utf-8')
    checkConceptFileStructure(fileLabel, text, allIssues)
    checkIsolatedExampleFenceLabels(fileLabel, text, allIssues)
    checkBannedAssumptions(fileLabel, text, allIssues)
  }

  for (const filePath of lessonFiles) {
    const fileLabel = join('wpf-lessons', basename(filePath))
    const text = readFileSync(filePath, 'utf-8')
    checkBannedAssumptions(fileLabel, text, allIssues)
  }

  const totalChecked = conceptFiles.length + lessonFiles.length

  if (allIssues.length === 0) {
    console.log(`✓ ${conceptFiles.length} wpf concept file(s) + ${lessonFiles.length} lesson file(s) checked, no issues found.`)
    console.log(`  (Also run: node scripts/check-narrative-lessons.mjs ${WPF_LESSONS_DIR})`)
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

  console.log(`\n${totalChecked} file(s) checked, ${allIssues.length} issue(s) found.`)
  console.log(`(Also run: node scripts/check-narrative-lessons.mjs ${WPF_LESSONS_DIR})`)
  process.exit(1)
}

main()
