#!/usr/bin/env node
/**
 * Stage 6 — Lesson Audit for src/docs/projects/track-foundations/CONCEPT-GRAPH.md.
 *
 * track/'s lesson files are immutable capstones (never rewritten, reordered,
 * or edited — see the approved plan, .claude/plans/gleaming-giggling-noodle.md,
 * and track-beginner/CHANGELOG.md's cautionary tale about exactly that).
 * This script never touches them. It reads the concept graph and Stage 5's
 * dependency-resolution artifacts and asks, for every original track/
 * lesson: is it internally coherent, does it depend on concepts introduced
 * later, and is it too concept-dense for one sitting? The output is a
 * diagnosis, not a rewrite — Stage 7 uses this audit to design *new*,
 * separate track-foundations/ lessons, each explicitly citing which track/
 * lesson's gap or density motivated it.
 *
 * Reuses Stage 5's own computations (computeClusters, computeCurriculumValidation,
 * classifySeverity) from concept-graph-resolve.mjs rather than duplicating
 * them — one parser, one set of derivations, multiple analyses.
 *
 * Status per lesson (most severe wins if more than one applies):
 *   Needs prerequisite move - lesson has >=1 curriculum-warning violation
 *                              (relies on a concept not introduced until later)
 *   Split recommended       - lesson's cluster exceeds OVERSIZED_CLUSTER_THRESHOLD
 *   Concept-dense           - lesson introduces an unusually high node count
 *                              (worth reviewing pacing, not necessarily splitting)
 *   Good                    - none of the above
 *
 * Usage:
 *   node scripts/concept-graph-audit.mjs
 *   node scripts/concept-graph-audit.mjs --file path/to/CONCEPT-GRAPH.md --out path/to/dir
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseNodes, buildGraph } from './lib/concept-graph-parse.mjs'
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

// A lesson introducing at least this many nodes, where at least this many of
// them fall *outside* its single largest cluster, is flagged "Concept-dense."
// Raw new-node count alone isn't the right signal: Lesson 6 introduces 11
// nodes but 9 of them are one cohesive RecyclerView cluster — many new ideas
// forming one coherent subsystem reads very differently from many new,
// unrelated ideas landing in the same lesson. Only the latter is flagged.
const DENSE_LESSON_THRESHOLD = 8
const SCATTERED_THRESHOLD = 5

function computeIntroducedCounts(byId) {
  const counts = new Map()
  for (const node of byId.values()) {
    if (node.usedByLessons.length === 0) continue
    const introducedAt = node.usedByLessons[0]
    counts.set(introducedAt, (counts.get(introducedAt) || 0) + 1)
  }
  return counts
}

function computeAudit(byId) {
  const clusters = computeClusters(byId)
  const { perLesson, violations } = computeCurriculumValidation(byId)
  const introducedCounts = computeIntroducedCounts(byId)

  const oversizedClusterByLesson = new Map()
  const largestClusterSizeByLesson = new Map()
  for (const c of clusters) {
    largestClusterSizeByLesson.set(c.lesson, Math.max(largestClusterSizeByLesson.get(c.lesson) || 0, c.members.length))
    if (c.members.length > OVERSIZED_CLUSTER_THRESHOLD) {
      if (!oversizedClusterByLesson.has(c.lesson)) oversizedClusterByLesson.set(c.lesson, [])
      oversizedClusterByLesson.get(c.lesson).push(c)
    }
  }

  const warningsByLesson = new Map()
  const informationalByLesson = new Map()
  for (const v of violations) {
    const bucket = v.severity === 'curriculum-warning' ? warningsByLesson : informationalByLesson
    if (!bucket.has(v.lesson)) bucket.set(v.lesson, [])
    bucket.get(v.lesson).push(v)
  }

  const lessons = [...new Set(perLesson.map((l) => l.lesson))].sort((a, b) => a - b)
  const audit = []
  for (const lesson of lessons) {
    const warnings = warningsByLesson.get(lesson) || []
    const informational = informationalByLesson.get(lesson) || []
    const oversized = oversizedClusterByLesson.get(lesson) || []
    const introducedCount = introducedCounts.get(lesson) || 0
    const largestCluster = largestClusterSizeByLesson.get(lesson) || 0
    const scattered = introducedCount - largestCluster

    let status
    const notes = []

    if (warnings.length > 0) {
      status = 'Needs prerequisite move'
      for (const w of warnings) {
        notes.push(`requires \`${w.prereq}\` (not introduced until Lesson ${w.prereqIntroducedAt}) for \`${w.node}\``)
      }
    } else if (oversized.length > 0) {
      status = 'Split recommended'
      for (const c of oversized) {
        notes.push(`cluster \`${c.clusterId}\` has ${c.members.length} nodes — likely several teaching strata colliding, see CONCEPT-CLUSTERS.md`)
      }
    } else if (introducedCount >= DENSE_LESSON_THRESHOLD && scattered >= SCATTERED_THRESHOLD) {
      status = 'Concept-dense'
      notes.push(
        `introduces ${introducedCount} new nodes, ${scattered} of them outside its largest cluster (${largestCluster}) — fragmented, not one cohesive subsystem; worth reviewing pacing`
      )
    } else if (introducedCount >= DENSE_LESSON_THRESHOLD) {
      status = 'Good'
      notes.push(
        `introduces ${introducedCount} new nodes, but ${largestCluster} of them form one cohesive cluster — many new ideas, one coherent subsystem`
      )
    } else {
      status = 'Good'
    }

    if (informational.length > 0) {
      notes.push(
        `(informational: ${informational.length} historical-quirk reference${informational.length === 1 ? '' : 's'} — see CURRICULUM-VALIDATION.md, no action implied)`
      )
    }
    if (notes.length === 0) {
      notes.push('no dependency or density issues found')
    }

    audit.push({ lesson, status, notes, introducedCount })
  }
  return audit
}

function mdLessonAudit(audit) {
  const lines = [
    '# Lesson Audit (Stage 6)',
    '',
    '> Generated by `scripts/concept-graph-audit.mjs` from `CONCEPT-GRAPH.md` and',
    '> Stage 5\'s `dependency-resolution/` artifacts. Do not hand-edit — re-run',
    '> after any change to the graph.',
    '',
    '**`track/`\'s lesson files are never edited by this process.** This audits',
    'them read-only — diagnosis, not rewriting. Stage 7 uses these findings to',
    'design new, separate `track-foundations/` lessons, each citing which',
    '`track/` lesson\'s gap or density motivated it; `track/` itself is',
    'unchanged either way.',
    '',
    '| Original Lesson | Status | Notes |',
    '| ---: | --- | --- |',
  ]
  for (const a of audit) {
    lines.push(`| ${a.lesson} | ${a.status} | ${a.notes.join('; ')} |`)
  }

  const byStatus = new Map()
  for (const a of audit) {
    byStatus.set(a.status, (byStatus.get(a.status) || 0) + 1)
  }
  lines.push('', '## Summary', '')
  for (const [status, count] of [...byStatus.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`- ${status}: ${count} lesson(s)`)
  }
  return lines.join('\n') + '\n'
}

function main() {
  const text = readFileSync(filePath, 'utf8')
  const nodes = parseNodes(text)
  const byId = buildGraph(nodes)

  console.log(`Parsed ${nodes.length} node headings from ${filePath}`)

  const audit = computeAudit(byId)

  mkdirSync(outDir, { recursive: true })
  const outPath = resolve(outDir, 'LESSON-AUDIT.md')
  writeFileSync(outPath, mdLessonAudit(audit), 'utf8')

  console.log(`\nWrote LESSON-AUDIT.md to ${outDir}`)
  const byStatus = new Map()
  for (const a of audit) byStatus.set(a.status, (byStatus.get(a.status) || 0) + 1)
  for (const [status, count] of [...byStatus.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${status}: ${count}`)
  }
}

main()
