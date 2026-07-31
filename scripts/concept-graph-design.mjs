#!/usr/bin/env node
/**
 * Stage 7 — Lesson Design Specification for
 * src/docs/projects/track-foundations/CONCEPT-GRAPH.md.
 *
 * track/'s lesson files are never edited (immutable capstones — see the
 * approved plan and track-beginner/CHANGELOG.md's cautionary tale). This
 * script designs *new*, separate track-foundations/ lessons and proves,
 * mechanically, that they satisfy a contract before a single sentence of
 * prose gets written:
 *
 *   1. Traceability   - every generated lesson cites which track/ lesson(s)
 *                        it's "Derived from" (where its concepts natively
 *                        come from) and, if applicable, which track/
 *                        lesson(s) it "Supports" (an earlier lesson it was
 *                        pulled forward to unblock).
 *   2. Dependency closure - every prerequisite a lesson needs must already
 *                        be taught by an earlier generated lesson. Verified
 *                        by topologically sorting a lesson-level dependency
 *                        graph and then re-walking that order checking every
 *                        cross-lesson prerequisite is already satisfied — no
 *                        exceptions, reported explicitly either way.
 *   3. Single primary mental model - a lesson unit is either one of Stage
 *                        5/6's already-validated same-lesson clusters (each
 *                        IS a connected component — structurally one idea),
 *                        a prerequisite-support lesson assembled from a
 *                        specific curriculum warning's forward-referenced
 *                        concepts, or (honestly, not invented) a
 *                        lower-cohesion "supplementary" bucket for singleton
 *                        concepts sharing only an original lesson, clearly
 *                        labeled as such rather than claimed to be unified.
 *   4. Subsystem integrity - clusters are never split by this script. The
 *                        one oversized cluster (see CONCEPT-CLUSTERS.md) is
 *                        carried through as a single PENDING-SPLIT unit
 *                        instead of being auto-divided by node count.
 *
 * The prerequisite-support rule, generalized (not special-cased to Room):
 * for every curriculum-warning violation (a lesson's node requires a
 * concept not introduced until later), the forward-referenced concept(s)
 * are pulled into a new support lesson — either promoting their existing
 * cluster (if they already belong to one) or forming a new lesson from the
 * warned-about singleton concepts grouped by their own native lesson — and
 * that support lesson is ordered before the lesson it supports.
 *
 * Usage:
 *   node scripts/concept-graph-design.mjs
 *   node scripts/concept-graph-design.mjs --file path/to/CONCEPT-GRAPH.md --out path/to/dir
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { parseNodes, buildGraph, parseIntroductionAnnotation } from './lib/concept-graph-parse.mjs'
import {
  computeClusters,
  computeCurriculumValidation,
  OVERSIZED_CLUSTER_THRESHOLD,
} from './concept-graph-resolve.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const args = process.argv.slice(2)
function flagValue(flag, fallback) {
  const i = args.indexOf(flag)
  return i >= 0 && args[i + 1] ? resolve(root, args[i + 1]) : fallback
}
const filePath = flagValue('--file', resolve(root, 'src/docs/projects/track-foundations/CONCEPT-GRAPH.md'))
const outDir = flagValue('--out', resolve(root, 'src/docs/projects/track-foundations/dependency-resolution'))

// ---------------------------------------------------------------------------
// Step 1: assign every node to exactly one lesson unit
// ---------------------------------------------------------------------------

export function assignUnits(byId) {
  const clusters = computeClusters(byId)
  const { violations } = computeCurriculumValidation(byId)
  const warnings = violations.filter((v) => v.severity === 'curriculum-warning')

  const units = new Map() // unitId -> { id, kind, lesson, members: Set, supports: Set }
  const unitOf = new Map() // nodeId -> unitId

  function ensureUnit(id, kind, lesson) {
    if (!units.has(id)) units.set(id, { id, kind, lesson, members: new Set(), supports: new Set() })
    return units.get(id)
  }

  // Approved fix (Stage 7 dependency-closure run, see project history): a
  // *specific*, human-approved extraction, not a general auto-cycle-breaker
  // (cluster splitting stays reserved for human review). L0a bundled
  // `identity-vs-equality` and `primitive-vs-reference-types` (native Lesson
  // 0) with `class`/`object`/etc., but both require `reference`/`aliasing`
  // (native Lesson 4) — and `reference` itself requires `object` (in L0a),
  // so leaving them in L0a produces a real 2-unit cycle (L0a <-> L4a), not a
  // false positive. Pulled into their own satellite unit here so the
  // dependency graph places it correctly (right after L4a). If a future
  // graph edit introduces a *different* cycle, this script must fail loudly
  // again rather than silently attempting to resolve it — do not generalize
  // this into an automatic cycle-breaker.
  const CYCLE_BREAK_EXTRACTIONS = {
    'L0-memory-dependent': ['identity-vs-equality', 'primitive-vs-reference-types'],
  }
  const extractedNodeIds = new Set(Object.values(CYCLE_BREAK_EXTRACTIONS).flat())

  // Human weak-cut split of L0a (Stage 6/7 flagged it oversized at 25 nodes;
  // 2 were pulled out above, leaving 24). Not a node-count split — each
  // group below is checked against its actual internal Required-prerequisite
  // edges (every internal prereq resolves within the same group or an
  // earlier group in this list) and against "does removing this node blur
  // another one" per the Stage 4 audit's own litmus test. Reviewed and
  // approved before any lesson prose was written; see project history.
  const L0A_WEAK_CUT_SPLIT = {
    'L0a-1-classes-and-objects': ['class', 'object', 'object-creation', 'nested-class'],
    'L0a-2-members': ['method', 'constructor', 'current-object-reference', 'method-overloading'],
    'L0a-3-class-level-state': ['class-level-state'],
    'L0a-4-access-and-encapsulation': ['access-level-enforcement', 'encapsulation'],
    'L0a-5-inheritance-and-polymorphism': [
      'inheritance',
      'method-overriding',
      'dynamic-dispatch',
      'runtime-type-narrowing',
      'sealing-a-type-or-method',
    ],
    'L0a-6-interfaces-and-contracts': [
      'interface-contract',
      'program-to-an-interface',
      'functional-interface',
      'lambda-expression',
    ],
    'L0a-7-generics-and-collections': ['generics', 'list-collection'],
    'L0a-8-annotations-and-override-checking': ['annotations', 'override-checking'],
  }
  for (const [splitId, memberIds] of Object.entries(L0A_WEAK_CUT_SPLIT)) {
    for (const m of memberIds) extractedNodeIds.add(m)
  }

  // Clusters first: one unit per cluster. L0a is expanded into its
  // weak-cut split above instead of being carried through as one
  // pending-split unit; every other oversized cluster (there are none
  // currently) would still be flagged, never auto-split.
  for (const c of clusters) {
    if (c.clusterId === 'L0a') continue
    const kind = c.members.length > OVERSIZED_CLUSTER_THRESHOLD ? 'pending-split' : 'cluster'
    const unit = ensureUnit(c.clusterId, kind, c.lesson)
    for (const m of c.members) {
      if (extractedNodeIds.has(m)) continue
      unit.members.add(m)
      unitOf.set(m, c.clusterId)
    }
  }
  for (const [splitId, memberIds] of Object.entries(L0A_WEAK_CUT_SPLIT)) {
    const lesson = byId.get(memberIds[0]).usedByLessons[0]
    const unit = ensureUnit(splitId, 'cluster', lesson)
    for (const m of memberIds) {
      unit.members.add(m)
      unitOf.set(m, splitId)
    }
  }
  for (const [extractedId, memberIds] of Object.entries(CYCLE_BREAK_EXTRACTIONS)) {
    const lesson = byId.get(memberIds[0]).usedByLessons[0]
    const unit = ensureUnit(extractedId, 'cycle-break-extraction', lesson)
    for (const m of memberIds) {
      unit.members.add(m)
      unitOf.set(m, extractedId)
    }
  }

  // Prerequisite-support lessons: group forward-referenced concepts by their
  // own native lesson. If a forward-referenced concept already belongs to a
  // cluster, promote that whole cluster (never split it) by adding a
  // "supports" annotation instead of pulling the concept out alone.
  const bySupportNative = new Map() // nativeLesson -> { concepts: Set, supports: Set<lesson> }
  for (const w of warnings) {
    if (!bySupportNative.has(w.prereqIntroducedAt)) {
      bySupportNative.set(w.prereqIntroducedAt, { concepts: new Set(), supports: new Set() })
    }
    const group = bySupportNative.get(w.prereqIntroducedAt)
    group.concepts.add(w.prereq)
    group.supports.add(w.lesson)
  }
  for (const [nativeLesson, group] of bySupportNative.entries()) {
    for (const concept of group.concepts) {
      const existingUnitId = unitOf.get(concept)
      if (existingUnitId) {
        // Already in a cluster - promote the whole cluster, don't split it.
        const unit = units.get(existingUnitId)
        for (const l of group.supports) unit.supports.add(l)
      } else {
        const supportId = `SUPPORT-L${nativeLesson}`
        const unit = ensureUnit(supportId, 'support', nativeLesson)
        unit.members.add(concept)
        unitOf.set(concept, supportId)
        for (const l of group.supports) unit.supports.add(l)
      }
    }
  }

  // Re-anchor "sighted only"/"assumed" nodes to their real teaching lesson
  // before falling back to supplementary bucketing. A node whose first
  // Used-by entry is annotated this way (the graph's own informational-quirk
  // marker, already used for Stage 5/6 severity classification) isn't
  // genuinely taught at that first lesson — bucketing it there by raw first-
  // appearance produces the same kind of false cross-unit edge as the L0a
  // case above, just via a different mechanism (an annotated early mention
  // instead of a Lesson-0-is-not-sequential-teaching quirk). Re-anchor to
  // the cluster at its next Used-by lesson only when it has a real graph
  // edge (required-prereq or builds-toward) into exactly one cluster there —
  // ambiguous or edge-less cases are left alone rather than guessed at.
  for (const node of byId.values()) {
    if (unitOf.has(node.id)) continue
    if (node.usedByLessons.length < 2) continue
    const annotation = parseIntroductionAnnotation(node.usedByRaw, node.usedByLessons[0])
    if (!annotation || !/sighted only|assumed/i.test(annotation)) continue
    const nextLesson = node.usedByLessons[1]
    const candidateClusterIds = new Set(
      [...node.requiredPrereqs, ...node.buildsToward]
        .map((relatedId) => unitOf.get(relatedId))
        .filter((unitId) => unitId && units.get(unitId).lesson === nextLesson)
    )
    if (candidateClusterIds.size === 1) {
      const [clusterId] = candidateClusterIds
      units.get(clusterId).members.add(node.id)
      unitOf.set(node.id, clusterId)
    }
  }

  // Everything else: singleton nodes not in any cluster or support group,
  // bucketed by native (introducing) lesson. Explicitly lower-cohesion —
  // never claimed to be one mental model, just grouped by shared origin so
  // nothing is invented and nothing is lost.
  for (const node of byId.values()) {
    if (unitOf.has(node.id)) continue
    const nativeLesson = node.usedByLessons[0]
    if (nativeLesson === undefined) continue // no Used-by at all shouldn't happen (validator checks this)
    const supplId = `SUPPL-L${nativeLesson}`
    const unit = ensureUnit(supplId, 'supplementary', nativeLesson)
    unit.members.add(node.id)
    unitOf.set(node.id, supplId)
  }

  return { units, unitOf }
}

// ---------------------------------------------------------------------------
// Step 2: order units and verify dependency closure
// ---------------------------------------------------------------------------

export function orderUnitsAndVerify(byId, units, unitOf) {
  // Build the lesson-level dependency graph: unit A -> unit B if some node
  // in B requires some node in A.
  const dependsOn = new Map([...units.keys()].map((id) => [id, new Set()])) // unitId -> Set of unitIds it requires
  for (const node of byId.values()) {
    const thisUnit = unitOf.get(node.id)
    for (const prereq of node.requiredPrereqs) {
      const prereqUnit = unitOf.get(prereq)
      if (prereqUnit && prereqUnit !== thisUnit) {
        dependsOn.get(thisUnit).add(prereqUnit)
      }
    }
  }

  // Kahn's algorithm over units, alphabetical tie-break for determinism.
  const remaining = new Map([...dependsOn.entries()].map(([id, deps]) => [id, deps.size]))
  const readySet = new Set([...remaining.entries()].filter(([, deg]) => deg === 0).map(([id]) => id))
  // reverse adjacency: unitId -> units that depend on it
  const dependents = new Map([...units.keys()].map((id) => [id, []]))
  for (const [id, deps] of dependsOn.entries()) {
    for (const dep of deps) dependents.get(dep).push(id)
  }

  const order = []
  while (readySet.size > 0) {
    const next = [...readySet].sort()[0]
    readySet.delete(next)
    order.push(next)
    for (const dependent of dependents.get(next)) {
      const deg = remaining.get(dependent) - 1
      remaining.set(dependent, deg)
      if (deg === 0) readySet.add(dependent)
    }
  }

  const cyclic = order.length !== units.size

  // Verify closure by re-walking the order explicitly (never assumed from
  // the topo sort alone) - for every unit, every cross-unit prerequisite of
  // every member must already be taught by a strictly earlier unit.
  const taught = new Set()
  const closureViolations = []
  for (const unitId of order) {
    const unit = units.get(unitId)
    for (const memberId of unit.members) {
      const node = byId.get(memberId)
      for (const prereq of node.requiredPrereqs) {
        const prereqUnit = unitOf.get(prereq)
        if (prereqUnit === unitId) continue // internal to this lesson, fine
        if (!taught.has(prereq)) {
          closureViolations.push({ unit: unitId, node: memberId, prereq, prereqUnit })
        }
      }
    }
    for (const memberId of unit.members) taught.add(memberId)
  }

  return { order, cyclic, closureViolations }
}

// ---------------------------------------------------------------------------
// Step 3: build the spec content per unit
// ---------------------------------------------------------------------------

function computeExercised(byId, unit) {
  if (!['cluster', 'pending-split', 'support', 'cycle-break-extraction'].includes(unit.kind)) return []
  const memberSet = unit.members
  const exercised = new Set()
  for (const node of byId.values()) {
    if (memberSet.has(node.id)) continue
    if (node.usedByLessons.length < 2) continue
    if (node.usedByLessons[0] === unit.lesson) continue // would be "introduces," not "exercises"
    if (node.usedByLessons.includes(unit.lesson)) exercised.add(node.id)
  }
  return [...exercised].sort()
}

function pickAnchor(byId, unit) {
  let best = null
  let bestScore = -1
  for (const memberId of unit.members) {
    const node = byId.get(memberId)
    const score = node.buildsToward.length + node.requiredPrereqs.length
    if (score > bestScore) {
      bestScore = score
      best = node
    }
  }
  return best
}

function buildSpec(byId, unit, order, unitOf) {
  const members = [...unit.members].sort()
  const prereqIds = new Set()
  for (const memberId of members) {
    for (const p of byId.get(memberId).requiredPrereqs) {
      const pUnit = unitOf.get(p)
      if (pUnit && pUnit !== unit.id) prereqIds.add(p)
    }
  }
  const prerequisites = [...prereqIds]
    .sort()
    .map((id) => ({ id, unit: unitOf.get(id), position: order.indexOf(unitOf.get(id)) }))

  const exercised = computeExercised(byId, unit)
  const whyList = members.map((id) => byId.get(id).firstNeededBecause).filter(Boolean)

  let primaryMentalModel
  if (unit.kind === 'pending-split') {
    primaryMentalModel = `PENDING — this cluster mixes multiple mental models and must be split along weak dependency cuts by a human before Stage 8 (see CONCEPT-CLUSTERS.md's Stage 6 partitioning rule). Not final.`
  } else if (unit.kind === 'supplementary') {
    primaryMentalModel = 'N/A — supplementary singleton concepts grouped only by shared origin lesson, not a unified idea. Each concept\'s own definition is listed below; candidates for a human-judgment merge into an adjacent lesson at Stage 7 review, not claimed here.'
  } else {
    const anchor = pickAnchor(byId, unit)
    primaryMentalModel = anchor ? `${anchor.definition} (anchor concept: \`${anchor.id}\`)` : '(single-concept lesson — see concept below)'
  }

  return {
    id: unit.id,
    kind: unit.kind,
    derivedFrom: unit.lesson,
    supports: [...unit.supports].sort((a, b) => a - b),
    conceptsIntroduced: members,
    conceptsExercised: exercised,
    prerequisites,
    primaryMentalModel,
    whyThisLessonExists: whyList,
    movedBecause:
      unit.kind === 'support'
        ? `\`track/\` Lesson ${[...unit.supports].sort((a, b) => a - b).join(', ')} relies on ${members.map((m) => `\`${m}\``).join(', ')} before \`track/\` Lesson ${unit.lesson} formally introduces them — see CURRICULUM-VALIDATION.md's curriculum warnings.`
        : null,
  }
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

function mdSpec(specsInOrder, closure, byId) {
  const lines = [
    '# Lesson Design Specification (Stage 7)',
    '',
    '> Generated by `scripts/concept-graph-design.mjs` from `CONCEPT-GRAPH.md` and',
    '> Stage 5/6\'s `dependency-resolution/` artifacts. Do not hand-edit — re-run',
    '> after any change to the graph.',
    '',
    '**`track/`\'s lesson files are never edited by this process.** Every unit',
    'below is a *new*, separate `track-foundations/` lesson, traceable back to',
    'the `track/` lesson(s) that motivated it. No prose, examples, or code yet —',
    'this is architecture: concept lists, prerequisites, and the single mental',
    'model each lesson should teach. Stage 8\'s prose generator consumes this',
    'file, not the raw graph.',
    '',
    '## Dependency closure verification',
    '',
  ]
  if (closure.cyclic) {
    lines.push('**FAILED — a cycle exists among the generated lesson units. Cannot proceed to Stage 8.**', '')
  } else if (closure.closureViolations.length > 0) {
    lines.push(`**FAILED — ${closure.closureViolations.length} closure violation(s):**`, '')
    for (const v of closure.closureViolations) {
      lines.push(`- Lesson \`${v.unit}\` uses \`${v.prereq}\` (from lesson \`${v.prereqUnit}\`) before it's taught.`)
    }
    lines.push('')
  } else {
    lines.push(
      `**PASSED.** All ${specsInOrder.length} generated lessons ordered; every cross-lesson prerequisite is satisfied by a strictly earlier lesson. 0 violations.`,
      ''
    )
  }

  lines.push('## Lesson order', '', '(Derived-from lesson and Supports shown for quick scanning; full spec follows.)', '')
  lines.push('| # | Lesson ID | Kind | Derived from | Supports |', '| ---: | --- | --- | --- | --- |')
  specsInOrder.forEach((s, i) => {
    lines.push(`| ${i + 1} | \`${s.id}\` | ${s.kind} | Lesson ${s.derivedFrom} | ${s.supports.length ? s.supports.map((n) => `Lesson ${n}`).join(', ') : '—'} |`)
  })
  lines.push('', '---', '')

  specsInOrder.forEach((s, i) => {
    lines.push(`## ${i + 1}. \`${s.id}\``, '')
    lines.push(`**Derived from:** \`track/\` Lesson ${s.derivedFrom}`, '')
    if (s.supports.length) {
      lines.push(`**Supports:** \`track/\` Lesson ${s.supports.join(', ')}`, '')
    }
    if (s.movedBecause) {
      lines.push(`**Moved because:** ${s.movedBecause}`, '')
    }
    lines.push('**Primary mental model:**', '', s.primaryMentalModel, '')
    lines.push('**Concepts introduced:**', '')
    for (const id of s.conceptsIntroduced) {
      lines.push(`- \`${id}\` — ${byId.get(id).preferredName}${s.kind === 'supplementary' || s.kind === 'pending-split' ? `: ${byId.get(id).definition}` : ''}`)
    }
    lines.push('', '**Concepts exercised (reused from earlier lessons):**', '')
    if (s.conceptsExercised.length === 0) {
      lines.push('- (none)')
    } else {
      for (const id of s.conceptsExercised) lines.push(`- \`${id}\` — ${byId.get(id).preferredName}`)
    }
    lines.push('', '**Prerequisites (must be taught by an earlier lesson):**', '')
    if (s.prerequisites.length === 0) {
      lines.push('- (none — resolves directly to the Learner Baseline)')
    } else {
      for (const p of s.prerequisites) {
        lines.push(`- \`${p.id}\` — satisfied by \`${p.unit}\` (lesson #${p.position + 1} in this order)`)
      }
    }
    if (s.whyThisLessonExists.length > 0) {
      lines.push('', '**Why this lesson exists:**', '')
      for (const w of s.whyThisLessonExists) lines.push(`- ${w}`)
    }
    lines.push('')
  })

  return lines.join('\n')
}

// ---------------------------------------------------------------------------

function main() {
  const text = readFileSync(filePath, 'utf8')
  const nodes = parseNodes(text)
  const byId = buildGraph(nodes)

  console.log(`Parsed ${nodes.length} node headings from ${filePath}`)

  const { units, unitOf } = assignUnits(byId)
  const { order, cyclic, closureViolations } = orderUnitsAndVerify(byId, units, unitOf)
  const specsInOrder = order.map((id) => buildSpec(byId, units.get(id), order, unitOf))

  mkdirSync(outDir, { recursive: true })
  const outPath = resolve(outDir, 'LESSON-DESIGN-SPEC.md')
  writeFileSync(outPath, mdSpec(specsInOrder, { cyclic, closureViolations }, byId), 'utf8')

  const byKind = new Map()
  for (const u of units.values()) byKind.set(u.kind, (byKind.get(u.kind) || 0) + 1)

  console.log(`\nWrote LESSON-DESIGN-SPEC.md to ${outDir}`)
  console.log(`  ${units.size} generated lesson units (${order.length} ordered${cyclic ? ', CYCLE PRESENT' : ''})`)
  for (const [kind, count] of byKind.entries()) console.log(`    ${kind}: ${count}`)
  console.log(`  Dependency closure: ${closureViolations.length === 0 && !cyclic ? 'PASSED' : 'FAILED'}`)

  process.exitCode = cyclic || closureViolations.length > 0 ? 1 : 0
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
