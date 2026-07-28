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
 *   7. An execution trace (either shape) with no heading marking where it
 *      starts — checked independently of #5's loop/constructor trigger,
 *      since a trace can be required for reasons that trigger can't
 *      detect (e.g. a hidden-reference/control-flow trace with no loop).
 *   8. An "Iteration N:" trace line that only reports a before/after value
 *      with no cause/effect wording — describes the run instead of
 *      explaining it, per LESSON SCHEMA.md's execution-trace requirement.
 *   9. (Soft note, like #CS-lens) A sentence using hidden-behavior language
 *      ("automatically", "under the hood", "the compiler generates") —
 *      flagged for a human glance to confirm real proof backs it up
 *      somewhere in the unit, per LESSON SCHEMA.md's hidden-behavior rule.
 *      Can't verify the proof itself exists automatically; only narrows
 *      "read every lesson" down to "read N flagged lines."
 *  10. A term marked **first appearance** with no matching entry in a
 *      "Terms introduced in this lesson" glossary (or no glossary section
 *      at all), per LESSON_CONTRACT.md's Glossary Rule — added after
 *      "ordinary `new`" was used as an implicit, unnamed contrast for an
 *      entire Concept Unit.
 *  11. A single fenced line mixing a code-like fragment with several
 *      prose connective words ("which", "because", "before"...) and no
 *      backticks separating them — code and its own explanation crammed
 *      onto one unwrapped line inside a fence, distinct from #3's
 *      multi-line wrapped-paragraph shape of the same underlying bug.
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

const NON_LESSON_FILENAMES = new Set([
  'CHANGELOG.MD',
  'README.MD',
  'CURRICULUM_NOTES.MD',
  'HOW-TO-RUN-EXAMPLES.MD',
])

function isMarkdownFile(name) {
  return name.toLowerCase().endsWith('.md') && !NON_LESSON_FILENAMES.has(name.toUpperCase())
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

// A second, per-LINE prose-in-fence signature, distinct from the wrapped-
// paragraph one above: a single unwrapped line that mixes real code-like
// tokens (a call, a dotted access, an assignment) with a dense run of
// grammatical English connective words — "runs the constructor, which
// increments the one shared totalCreated ... because id is a plain,
// non-static field, this copy belongs to a alone." Real code (or real
// terminal output) doesn't contain words like "which"/"because"/"before"/
// "respectively" in any quantity; a line that has both a code-shaped
// fragment AND several of these in a row is prose-about-code that never
// got backticks, crammed onto one line inside a fence instead of becoming
// an inline-code span inside an unfenced numbered-list item. This is
// exactly what "explain why" (LESSON SCHEMA.md's execution-trace rule)
// produces when the fence isn't dropped afterward — caught once already
// in Lesson 6b's Counter trace and seven siblings, all fixed by hand; nothing
// currently catches this mechanically, which is why it's being added now.
const PROSE_CONNECTIVE_RE =
  /\b(which|because|before|since|into|after|than|itself|belongs|respectively|afterward|instead|though|therefore|however|meanwhile|specifically|eventually|genuinely|whichever)\b/gi
const CODE_SHAPED_RE = /\w+\([^)]*\)|\w+\.\w+\(|\w+\.\w+\b|[A-Za-z_]\w*\s*=\s*[^=]/

function checkCodeProseInterleaving(fileLabel, text, issues) {
  const lines = text.split('\n')
  let inBlock = false
  lines.forEach((line, i) => {
    if (line.trim().startsWith('```')) {
      inBlock = !inBlock
      return
    }
    if (!inBlock) return
    const connectives = line.match(PROSE_CONNECTIVE_RE) || []
    if (connectives.length >= 2 && CODE_SHAPED_RE.test(line)) {
      issues.push({
        file: fileLabel,
        line: i + 1,
        kind: 'code-prose-interleaved-in-fence',
        message: `Line ${i + 1} inside a code fence mixes a code-like fragment with ${connectives.length} prose connective words (${[...new Set(connectives.map((w) => w.toLowerCase()))].join(', ')}) and no backticks separating them — likely code-and-its-explanation crammed onto one line inside a fence; convert to an unfenced numbered-list item with the code as an inline span, per LESSON SCHEMA.md's execution-trace shape rules`,
      })
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

// Canonical execution-trace heading. Required regardless of whether
// checkMissingTraces' own loop/constructor trigger heuristic fires below —
// that heuristic can legitimately miss a trace this schema still requires
// (e.g. a hidden-reference/control-flow trace with no loop and no repeated
// same-class constructor, like Lesson 6b's Outer/Inner trace, which only
// escaped checkMissingTraces by coincidence: no trigger, so it was never
// looked at). Checked at heading levels 2-4 on purpose: '####' nested
// inside the '###' "Introduce the Concept in Isolation" step is the
// canonical placement — a level 4 heading doesn't break that step into a
// separate chunk when this script splits at level 3, so the trace stays
// correctly scoped as part of the isolation step. A bare '###' sibling
// heading is also recognized here (so it's flagged as a style question,
// not silently miscounted as headerless) but should be moved to '####'.
const TRACE_HEADING_RE = /^#{2,4}\s+.*Execution Trace/im

// Words signaling a trace line is explaining a causal mechanism — why this
// value, on this iteration, came out this way — rather than just reporting
// a before/after value. Deliberately permissive: this can't verify an
// explanation is *correct*, only that some reasoning vocabulary is present
// at all. A line with none of these is almost certainly a bare value
// report, the exact failure LESSON SCHEMA.md's trace requirement now calls
// out by name: "describes the run, doesn't explain it."
const EXPLANATION_WORD_RE =
  /\b(because|since|which means|so that|causes?|caused|throws?|thrown|catch(?:es)?|caught|matches?|matched|succeeds?|succeeded|fails?|failed|returns?|returned|calls?|called|runs?|ran|triggers?|triggered|invokes?|invoked|rejects?|rejected|shifts?|shifted)\b/i

// Runs independently of checkMissingTraces' trigger heuristic: any
// Iteration-N or numbered-walkthrough trace found inside "Introduce the
// Concept in Isolation" gets checked for a real header and, for the
// Iteration-N shape, for per-line explanation — whether or not a loop or
// repeated constructor was what caused the trace to exist in the first
// place.
function checkTraceQuality(fileLabel, text, issues) {
  const units = splitByHeading(text, 2).filter((u) => /^Concept Unit:/i.test(u.heading))
  for (const unit of units) {
    const subs = splitByHeading(unit.text, 3)
    const isolation = subs.find((s) => /^Introduce the Concept in Isolation$/i.test(s.heading))
    if (!isolation) continue

    const hasIterationTrace = /Iteration \d+:/.test(isolation.text)
    const hasNumberedWalkthrough = /^\d+\.\s+`/m.test(isolation.text)
    if (!hasIterationTrace && !hasNumberedWalkthrough) continue

    const globalLine = unit.startLine + isolation.startLine

    if (!TRACE_HEADING_RE.test(isolation.text)) {
      issues.push({
        file: fileLabel,
        line: globalLine,
        kind: 'trace-missing-header',
        message: `Concept Unit "${unit.heading}" has trace content in its isolated lab with no heading marking where it starts (e.g. "#### Execution Trace") — nest it one level deeper than the surrounding step headings so a reader can see at a glance where the trace begins`,
      })
    }

    if (hasIterationTrace) {
      const iterationLines = isolation.text.split('\n').filter((l) => /^\s*Iteration \d+:/.test(l))
      for (const line of iterationLines) {
        if (!EXPLANATION_WORD_RE.test(line)) {
          issues.push({
            file: fileLabel,
            line: globalLine,
            kind: 'trace-line-bare',
            message: `Concept Unit "${unit.heading}": trace line "${line.trim()}" reports a value change but has no cause/effect wording explaining why it happened — describes the run, doesn't explain it`,
          })
        }
      }
    }
  }
}

// Signal phrases for the specific failure LESSON SCHEMA.md's hidden-behavior
// rule targets: a claim that the compiler/runtime *generated or inserted
// code or a field* that doesn't appear in source — not just any word like
// "automatically" or "hidden" used in its ordinary sense (an ArrayList
// growing "automatically," or a bug "silently" corrupting data, are
// perfectly fine, already-demonstrated claims that don't need bytecode-level
// proof). The Lesson 6b bug was specifically "the compiler generated it, not
// you" / "nothing in Inner's own field list shows this reference exists" —
// code-generation and hidden-structure claims, a much narrower category
// than "any sentence using one of these common English words." Keeping the
// regex this narrow is deliberate, after an earlier, broader version of
// this check flagged 158 hits across both courses, almost all of them
// ordinary, already-fine usage — noise defeats the entire point of
// narrowing "read every lesson" down to "read N flagged lines."
//
// Deliberately still a SOFT check, reported unconditionally like
// note-no-cs-lens: whether a given hit is actually backed by real proof
// elsewhere in the same Concept Unit is a judgment call this script can't
// safely make.
const HIDDEN_BEHAVIOR_PHRASE_RE =
  /\b(the compiler (?:generat|add|creat|insert|synthesi[sz])[a-z]*|compiler[- ]generated|synthetic (?:field|method|constructor|class)|hidden (?:field|reference|constructor|parameter)|invisible (?:field|reference|constructor|parameter)|the (?:jvm|runtime) (?:generat|add|creat|insert|synthesi[sz])[a-z]*)\b/i

function checkHiddenBehaviorClaims(fileLabel, text, issues) {
  const units = splitByHeading(text, 2).filter((u) => /^Concept Unit:/i.test(u.heading))
  for (const unit of units) {
    const lines = unit.text.split('\n')
    let inFence = false
    lines.forEach((line, i) => {
      if (line.trim().startsWith('```')) {
        inFence = !inFence
        return
      }
      if (inFence) return
      if (HIDDEN_BEHAVIOR_PHRASE_RE.test(line)) {
        issues.push({
          file: fileLabel,
          line: unit.startLine + i,
          kind: 'note-unverified-hidden-behavior',
          message: `Concept Unit "${unit.heading}": "${line.trim()}" — describes behavior invisible in the reader's own source; confirm real proof (disassembly, generated artifact, actual runtime output) backs this up somewhere in the unit, not just this sentence`,
        })
      }
    })
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

// The Glossary Rule (LESSON_CONTRACT.md, added after "ordinary `new`" was
// used as an implicit contrast for an entire Concept Unit without either
// side of the contrast — `expr.new ClassName()` or plain `new ClassName()`
// — ever being given its real, look-up-able name): every term marked
// **first appearance** needs a matching entry in a "Terms introduced in
// this lesson" glossary, keyed by the term's real name, not a restatement
// of whatever informal phrase the prose used.
//
// The glossary sits in the lesson header (after "What you need to know
// first," before the first Concept Unit) as a bold run-in label — same
// convention as "What you will build" / "What you need to know first"
// themselves, which are bold text, not markdown headings, in every lesson
// in both series. splitByHeading can't find it, so this parses that region
// directly instead.
//
// Reuses checkDuplicateFirstAppearance's own term-extraction regex, so it
// shares that check's known scope: only catches the "`term` — **first
// appearance**" bolded shape, not every "(first appearance...)"
// parenthetical-unbolded variant already in the corpus. Under-counting is
// the safe direction for a heuristic like this — it won't false-flag a
// term that was never claimed in the checked shape to begin with.
const FIRST_APPEARANCE_RE = /`([^`\n]{1,60})`\s*—\s*\*\*first appearance/gi
// Also catches a term named in **bold** rather than backticks, immediately
// followed by its own first-appearance marker — e.g. "is a **self-closing
// tag** — **(a) first appearance**". Found missing entirely: two terms in
// wpf-lessons Lesson 1 used exactly this shape and were invisible to the
// backtick-only regex above, so both silently shipped with no glossary
// entry until caught by hand.
const BOLD_FIRST_APPEARANCE_RE = /\*\*([A-Za-z][A-Za-z0-9 /()'-]{1,50}?)\*\*\s*—\s*\*\*\(?a?\)?\s*first appearance/gi
// Two valid label conventions coexist in this corpus: track-beginner /
// pocket-inventory-wpf use a bold run-in phrase; wpf-lessons uses a real
// `##` heading with blockquote (`>`) entries — the exact shape
// LESSON_CONTRACT.md's own worked example shows. Neither is "the" correct
// one; match both rather than false-flagging whichever wasn't the original
// template.
const GLOSSARY_LABEL_RE = /^(?:\*\*Terms introduced in this lesson[:.]?\*\*|#{1,3}\s+Terms introduced in this lesson\b)/im

function extractGlossarySection(text) {
  const labelMatch = GLOSSARY_LABEL_RE.exec(text)
  if (!labelMatch) return null
  const startLine = text.slice(0, labelMatch.index).split('\n').length
  const rest = text.slice(labelMatch.index + labelMatch[0].length)
  const end = rest.search(/\n(---|##\s)/)
  return { startLine, text: end === -1 ? rest : rest.slice(0, end) }
}

// Each bullet's WHOLE text (bolded name + its one-line definition), not just
// the bolded name — definitions routinely mention the actual code identifier
// a first-appearance term needs to match against (e.g. "**Type parameter**
// — the placeholder name, e.g. `T` in `class Box<T>`" contains "Box<T>",
// but the bolded name "Type parameter" alone does not). Matching only
// against bolded names would miss most real coverage that already exists.
// Entries are either `- **Term** — def` (list bullet) or `> **Term** — def`
// (blockquote) — same "match both conventions" reasoning as the label regex
// above.
function extractGlossaryEntryBlobs(glossaryText) {
  const items = glossaryText.split(/\n(?=\s*[-*>]\s)/).filter((s) => /^\s*[-*>]\s/.test(s))
  return items.map((item) => normalizeTerm(item))
}

function normalizeTerm(term) {
  return term
    .replace(/`/g, '')
    // camelCase/PascalCase → space-separated words first (StaticNested →
    // Static Nested; totalCreated → total Created) — otherwise an
    // identifier that's one un-spaced token never lines up against prose
    // that naturally writes its words apart ("static nested class").
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// A raw "first appearance" term is a call site or a declaration
// ("prefs.getInt(\"low_stock_threshold\", 5)", "private int quantity;"),
// not the clean, generic name a glossary entry uses ("SharedPreferences.
// getInt(key, default)"). Comparing the two full strings almost never
// substring-matches, because the receiver variable name and literal
// arguments are noise the glossary entry was never going to repeat.
// Produces several candidate "core" strings — stripped of args, receiver
// variable prefixes, and declaration furniture — and a match against ANY
// of them counts, rather than requiring the raw term to line up whole.
const DECLARATION_STOPWORDS = new Set([
  'private', 'public', 'protected', 'static', 'final', 'void', 'new',
  'class', 'int', 'string', 'boolean', 'double', 'long', 'char', 'float',
])

function wordCandidates(normalized) {
  return normalized
    .split(' ')
    .filter((w) => w.length >= 3 && !DECLARATION_STOPWORDS.has(w))
}

function coreTermCandidates(term) {
  const candidates = new Set([normalizeTerm(term)])

  // Word candidates from the ORIGINAL term (before args-stripping) too —
  // args-stripping is right for call sites ("prefs.getInt(...)" → the args
  // are noise) but wrong for expressions where the parenthesized content
  // IS the meaningful part ("!(other instanceof Item)" → stripping loses
  // "instanceof" entirely). Keeping both means neither shape loses signal.
  for (const w of wordCandidates(normalizeTerm(term))) candidates.add(w)

  const noArgs = term.replace(/\([^)]*\)/g, '()')
  candidates.add(normalizeTerm(noArgs))

  const dotSplit = noArgs.split('.')
  if (dotSplit.length > 1) {
    candidates.add(normalizeTerm(dotSplit[dotSplit.length - 1]))
  }

  for (const w of wordCandidates(normalizeTerm(noArgs))) candidates.add(w)

  return [...candidates].filter(Boolean)
}

// Some lessons (all of pocket-inventory-wpf's early ones, 00-05) mark first
// appearances as "(first appearance)" — unbolded, parenthetical — instead
// of "— **first appearance**". The strict, bolded regex above is the only
// thing that drives per-term glossary-missing-term checking, but relying
// on it ALONE to decide whether a file needs a glossary at all is exactly
// what let three real, densely-populated files (Lesson 6c, WPF Lesson 02,
// WPF Lesson 05) go completely unflagged and unnoticed all night — each
// had real "(first appearance)" content and zero glossary, but zero
// matches for the strict pattern, so checkGlossary returned before ever
// looking. This lighter, presence-only trigger closes that: it can't
// pinpoint individual missing terms the way the strict regex can, but it
// guarantees a file using either style at least gets flagged for a human
// to look at, rather than silently passing.
const UNBOLDED_FIRST_APPEARANCE_RE = /\(first appearance/gi

function checkGlossary(fileLabel, text, issues) {
  const firstAppearanceTerms = new Set()
  let m
  const re = new RegExp(FIRST_APPEARANCE_RE.source, FIRST_APPEARANCE_RE.flags)
  while ((m = re.exec(text))) {
    firstAppearanceTerms.add(m[1].trim())
  }
  const boldRe = new RegExp(BOLD_FIRST_APPEARANCE_RE.source, BOLD_FIRST_APPEARANCE_RE.flags)
  while ((m = boldRe.exec(text))) {
    firstAppearanceTerms.add(m[1].trim())
  }
  const unbolded = text.match(UNBOLDED_FIRST_APPEARANCE_RE) || []
  if (firstAppearanceTerms.size === 0 && unbolded.length === 0) return

  const glossary = extractGlossarySection(text)
  if (!glossary) {
    const total = firstAppearanceTerms.size || unbolded.length
    issues.push({
      file: fileLabel,
      line: null,
      kind: 'missing-glossary-section',
      message: `No "Terms introduced in this lesson" glossary, but ${total} term(s) marked (or "**") first appearance in this file (per the Glossary Rule) — expected for lessons written before this rule existed; a genuine gap for anything written after it`,
    })
    return
  }

  const entryBlobs = extractGlossaryEntryBlobs(glossary.text)

  for (const term of firstAppearanceTerms) {
    const candidates = coreTermCandidates(term)
    const covered = candidates.some((c) => entryBlobs.some((blob) => blob.includes(c)))
    if (!covered) {
      issues.push({
        file: fileLabel,
        line: glossary.startLine,
        kind: 'glossary-missing-term',
        message: `"${term}" is marked **first appearance** but has no matching entry in "Terms introduced in this lesson"`,
      })
    }
  }
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
      checkCodeProseInterleaving(fileLabel, text, allIssues)
      checkMissingTraces(fileLabel, text, allIssues)
      checkTraceQuality(fileLabel, text, allIssues)
      checkHiddenBehaviorClaims(fileLabel, text, allIssues)
      checkGlossary(fileLabel, text, allIssues)
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
