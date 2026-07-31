#!/usr/bin/env node
/**
 * Computes where every one of the 189 CONCEPT-GRAPH.md nodes should be
 * taught if prerequisite lessons are inserted directly into `track/`'s own
 * numbering (as `Lesson Na`, `Lesson Nb`, ... files sitting immediately
 * before `track/`'s real `Lesson N`), instead of living in a separate
 * `track-foundations/` course read start-to-finish beforehand.
 *
 * A node's "natural" gap is `usedByLessons[0]` — the earliest track/ lesson
 * that actually needs it. But `track/`'s own lesson order isn't guaranteed
 * to respect the concept graph's dependency edges (that's exactly what
 * CURRICULUM-VALIDATION.md's "Curriculum warning" severity already catches,
 * e.g. Lesson 13 needing `thread`/`event-loop`/`object-pool-pattern`, none
 * introduced until Lesson 14). So a node's natural gap cannot be trusted
 * blindly — it must be forward-propagated against `Required prerequisites`:
 * a node's final gap is never earlier than any of its own prerequisites'
 * final gaps. This mechanically generalizes the manual fixes already made
 * once by hand in Stage 7 (`L0-memory-dependent` pulled from Lesson 0 to
 * after Lesson 4's material; `SUPPORT-L14` pulled `thread`/`event-loop`/
 * `object-pool-pattern` forward to before Lesson 13).
 *
 * Within each gap, nodes are ordered by a topological sort tie-broken using
 * the existing 69-unit LESSON-DESIGN-SPEC.md's own "Concepts introduced"
 * order — already pedagogically shaped by Stage 5-7 (clusters, cross-
 * cluster edges, pressure ranking) — rather than by a fresh alphabetical
 * tiebreak, which is dependency-valid but pedagogically arbitrary (it would
 * teach `generics`/`lambda-expression` before `object`, for example).
 *
 * Usage:
 *   node scripts/concept-graph-interleave.mjs
 *   node scripts/concept-graph-interleave.mjs --file path/to/CONCEPT-GRAPH.md --out path/to/dir --spec path/to/LESSON-DESIGN-SPEC.md
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseNodes, buildGraph } from './lib/concept-graph-parse.mjs'
import { validate, structuralErrors } from './lib/concept-graph-validate.mjs'

// Extracts the 69-unit LESSON-DESIGN-SPEC.md's own "Concepts introduced"
// lists, in unit order, flattened into one 189-long sequence. This is
// already a pedagogically-shaped order (Stage 5-7's clusters/cross-cluster
// edges/pressure ranking, not a raw topological sort) — reused here as a
// *preference* for tie-breaking a fresh topological sort, rather than
// discarded in favor of Kahn's-algorithm-with-alphabetical-tiebreak, which
// is valid but pedagogically arbitrary (it would teach `generics` and
// `lambda-expression` before `object`, for example).
function extractPreferredOrder(specPath) {
  const text = readFileSync(specPath, 'utf8')
  const lines = text.split('\n')
  const order = []
  let mode = false
  for (const line of lines) {
    if (/^\*\*Concepts introduced:\*\*/.test(line)) {
      mode = true
      continue
    }
    if (/^\*\*Concepts exercised/.test(line)) {
      mode = false
      continue
    }
    if (mode) {
      const m = line.match(/^-\s+`([a-z0-9-]+)`/)
      if (m) order.push(m[1])
    }
  }
  return order
}

// Stable topological sort (Kahn's algorithm) that, among all currently-
// ready nodes at each step, picks whichever comes earliest in `preferred`
// rather than breaking ties alphabetically. Falls back to alphabetical for
// any node `preferred` doesn't mention (shouldn't happen if `preferred`
// covers every node, but kept defensive).
function computePreferredOrder(byId, preferred) {
  const rank = new Map(preferred.map((id, i) => [id, i]))
  const remaining = new Map([...byId.entries()].map(([id, n]) => [id, n.requiredPrereqs.length]))
  const readySet = new Set([...remaining.entries()].filter(([, deg]) => deg === 0).map(([id]) => id))
  const order = []
  while (readySet.size > 0) {
    const next = [...readySet].sort((a, b) => {
      const ra = rank.has(a) ? rank.get(a) : Infinity
      const rb = rank.has(b) ? rank.get(b) : Infinity
      if (ra !== rb) return ra - rb
      return a < b ? -1 : 1
    })[0]
    readySet.delete(next)
    order.push(next)
    for (const dep of byId.get(next).buildsToward) {
      if (!remaining.has(dep)) continue
      const deg = remaining.get(dep) - 1
      remaining.set(dep, deg)
      if (deg === 0) readySet.add(dep)
    }
  }
  return order
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const args = process.argv.slice(2)
function flagValue(flag, fallback) {
  const i = args.indexOf(flag)
  return i >= 0 && args[i + 1] ? resolve(root, args[i + 1]) : fallback
}
const filePath = flagValue('--file', resolve(root, 'src/docs/projects/track-foundations/CONCEPT-GRAPH.md'))
const outDir = flagValue(
  '--out',
  resolve(root, 'src/docs/projects/track-foundations/dependency-resolution')
)
const specPath = flagValue(
  '--spec',
  resolve(root, 'src/docs/projects/track-foundations/dependency-resolution/LESSON-DESIGN-SPEC.md')
)

// track/'s real lesson titles, for a readable report. Hand-maintained here
// deliberately (mirrors track/'s own immutable filenames) rather than
// re-parsed from disk on every run, since track/ never changes.
const TRACK_LESSON_TITLES = {
  0: 'Java Language Fundamentals',
  1: 'Where Your Code Actually Lives',
  2: "Why Android Isn't main",
  3: 'A Screen Is a Tree, Not a Canvas',
  4: 'Leaving the Screen: Intents and a Second Activity',
  5: "The Screen You Left Isn't Gone",
  6: 'One Layout, Many Rows: RecyclerView',
  7: 'Data Deserves Its Own Type',
  8: 'Passing Data Between Screens',
  9: 'Trusting What the User Typed',
  10: 'Getting an Answer Back',
  11: 'Small Facts That Persist: SharedPreferences',
  12: 'A Table Is Not a List: SQLite',
  13: 'Room: Compile-Time-Checked Persistence',
  14: 'The Main Thread Cannot Wait',
  15: 'State That Survives Rotation: ViewModel',
  16: 'Data That Announces Itself: LiveData',
  17: "Don't Let the ViewModel Talk to the Database: Repository",
  18: 'Breaking the Screen Apart: Fragments',
  19: 'One Graph Instead of Many Intents: Navigation Component',
  20: 'When the List Changes Shape: DiffUtil',
  21: 'Options Beyond the Screen: Menus, Toolbar, Search',
  22: 'Asking Before Acting: Dialogs',
  23: 'Undo Is a Feature: Swipe to Delete and Snackbar',
  24: 'Asking Permission: Runtime Permissions',
  25: "Borrowing Another App's Screen: Implicit Intents and Camera",
  26: "Working While You're Not Looking: Services and WorkManager",
  27: 'Reacting to the World: BroadcastReceivers',
  28: 'Talking to a Server: Retrofit, JSON',
  29: "Letting Other Apps See Your Data: ContentProvider",
  30: 'Proving It Without Running It: JUnit and Mockito',
  31: 'Proving the Screen Works: Espresso',
  32: 'The Same App, a Different Toolkit: Jetpack Compose',
  33: 'Looking Right on Every Device: Theming, Dark Mode, Screen Size',
  34: 'From Debug to Release: Signing, R8, Shipping',
}

function main() {
  const text = readFileSync(filePath, 'utf8')
  const nodes = parseNodes(text)
  const byId = buildGraph(nodes)

  const errors = structuralErrors(validate(byId))
  if (errors.length > 0) {
    console.error(`Structural errors found — fix these before interleaving:\n${errors.join('\n')}`)
    process.exit(1)
  }

  const preferred = extractPreferredOrder(specPath)
  const canonicalOrder = computePreferredOrder(byId, preferred)
  if (canonicalOrder.length !== byId.size) {
    console.error(
      `Order incomplete (${canonicalOrder.length}/${byId.size}) — a cycle exists. Aborting.`
    )
    process.exit(1)
  }
  const preferredSet = new Set(preferred)
  const unranked = canonicalOrder.filter((id) => !preferredSet.has(id))
  if (unranked.length > 0) {
    console.warn(
      `${unranked.length} node(s) not found in LESSON-DESIGN-SPEC.md's concept lists (alphabetical fallback used): ${unranked.join(', ')}`
    )
  }

  const naturalGap = new Map()
  for (const id of canonicalOrder) {
    const node = byId.get(id)
    naturalGap.set(id, node.usedByLessons.length > 0 ? node.usedByLessons[0] : 0)
  }

  const finalGap = new Map()
  const pushedFrom = new Map() // id -> natural gap, only set when pushed forward
  for (const id of canonicalOrder) {
    const node = byId.get(id)
    let gap = naturalGap.get(id)
    for (const prereq of node.requiredPrereqs) {
      if (finalGap.has(prereq)) {
        gap = Math.max(gap, finalGap.get(prereq))
      }
    }
    if (gap !== naturalGap.get(id)) {
      pushedFrom.set(id, naturalGap.get(id))
    }
    finalGap.set(id, gap)
  }

  // Verify: every prerequisite's final gap must be <= the dependent's final
  // gap, and if equal, must appear earlier in canonicalOrder (guaranteed by
  // construction, but checked explicitly rather than assumed).
  const violations = []
  const positionInOrder = new Map(canonicalOrder.map((id, i) => [id, i]))
  for (const id of canonicalOrder) {
    const node = byId.get(id)
    for (const prereq of node.requiredPrereqs) {
      if (!finalGap.has(prereq)) continue
      const gPrereq = finalGap.get(prereq)
      const gNode = finalGap.get(id)
      if (gPrereq > gNode) {
        violations.push(`${id} (gap ${gNode}) requires ${prereq} (gap ${gPrereq}) — prereq lands later`)
      } else if (gPrereq === gNode && positionInOrder.get(prereq) > positionInOrder.get(id)) {
        violations.push(`${id} and ${prereq} share gap ${gNode} but are ordered wrong within it`)
      }
    }
  }

  const byGap = new Map()
  for (const id of canonicalOrder) {
    const gap = finalGap.get(id)
    if (!byGap.has(gap)) byGap.set(gap, [])
    byGap.get(gap).push(id)
  }

  const lines = [
    '# Track Interleave Plan',
    '',
    '> Generated by `scripts/concept-graph-interleave.mjs` from `CONCEPT-GRAPH.md`.',
    '> Do not hand-edit — re-run after any change to the graph.',
    '',
    'Computes, for every one of the 189 concept-graph nodes, which `track/`',
    'lesson-gap it must be taught in if prerequisite lessons are inserted',
    'directly into `track/`\'s own numbering (as `Lesson Na`, `Lesson Nb`, ...',
    'files immediately before `track/`\'s real `Lesson N`), rather than living',
    'in a separate `track-foundations/` course. "Gap N" means: goes somewhere',
    'in the run of new lesson files sitting between `track/Lesson N-1` and',
    '`track/Lesson N` (Gap 0 sits before `track/Lesson 0` itself, since',
    'nothing precedes it).',
    '',
    'A node\'s gap is `usedByLessons[0]` (the earliest track/ lesson that',
    'actually needs it) forward-propagated against `Required prerequisites`',
    '— a node is never assigned an earlier gap than any of its own',
    'prerequisites. Where propagation pushed a node later than its own',
    'natural gap, that\'s flagged explicitly below (it\'s the same situation',
    '`L0-memory-dependent` and `SUPPORT-L14` were manually pulled forward for',
    'in Stage 7 — this generalizes that fix to the full 189-node graph).',
    '',
    violations.length === 0
      ? `Verified: all ${canonicalOrder.length} nodes placed with 0 ordering violations.`
      : `**${violations.length} VIOLATIONS FOUND:**\n${violations.map((v) => `- ${v}`).join('\n')}`,
    '',
    `${pushedFrom.size} of ${canonicalOrder.length} nodes were pushed forward from their natural gap.`,
    '',
  ]

  const gapKeys = [...byGap.keys()].sort((a, b) => a - b)
  for (const gap of gapKeys) {
    const title = TRACK_LESSON_TITLES[gap] ?? '(no track/ lesson at this number)'
    const ids = byGap.get(gap)
    lines.push(`## Gap ${gap} — before \`track/Lesson ${gap}\` ("${title}")`, '')
    lines.push(`${ids.length} concept(s):`, '')
    for (const id of ids) {
      const node = byId.get(id)
      const pushedNote = pushedFrom.has(id)
        ? ` — **pushed forward from natural gap ${pushedFrom.get(id)}** (a required prerequisite lands later than where this concept is first used)`
        : ''
      lines.push(`${ids.indexOf(id) + 1}. \`${id}\` — ${node.preferredName}${pushedNote}`)
      lines.push(`   - Definition: ${node.definition}`)
      lines.push(`   - Required prerequisites: [${node.requiredPrereqs.join(', ')}]`)
      lines.push(`   - Used by (track/): ${node.usedByRaw}`)
    }
    lines.push('')
  }

  mkdirSync(outDir, { recursive: true })
  const outPath = resolve(outDir, 'TRACK-INTERLEAVE-PLAN.md')
  writeFileSync(outPath, lines.join('\n') + '\n', 'utf8')
  console.log(`Wrote ${outPath}`)
  console.log(`${canonicalOrder.length} nodes placed across ${gapKeys.length} gaps.`)
  console.log(`${pushedFrom.size} nodes pushed forward from their natural gap.`)
  console.log(violations.length === 0 ? 'No ordering violations.' : `${violations.length} VIOLATIONS.`)
}

main()
