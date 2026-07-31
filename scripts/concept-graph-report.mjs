#!/usr/bin/env node
/**
 * Mechanical reporting + validation for
 * src/docs/projects/track-foundations/CONCEPT-GRAPH.md — the canonical
 * concept graph driving that project (see its own governing-rules section
 * and the approved plan at the time of writing,
 * .claude/plans/gleaming-giggling-noodle.md).
 *
 * The graph is hand-authored; this script never edits it. It exists so
 * growth/reuse metrics (New per lesson, Active Vocabulary, first-reuse
 * distance, reuse counts) and structural validation (cycles, duplicate
 * slugs/aliases, dangling references, orphans, Builds-toward accuracy) are
 * always *derived* from the node definitions themselves, never maintained
 * by hand in a second, driftable table.
 *
 * Once the graph is complete (all capstone lessons extracted), this also
 * prints a Graph Health Report: average/median required-prerequisite count,
 * maximum prerequisite depth and the longest dependency chain, reuse
 * averages plus a top-20 most-reused ranking, largest single-lesson
 * subsystem introductions, and high fan-in concepts.
 *
 * Node format this parses (one block per concept, see CONCEPT-GRAPH.md's
 * own header for the authoritative spec):
 *
 *   ### concept-id
 *
 *   Preferred Name: ...
 *   Aliases: ...
 *   Definition: ...
 *   First needed because: ...
 *   Category: NN Category Name
 *   Depth required: Recognition | Working | Mastery
 *   Required prerequisites: [a, b, c]
 *   Builds toward: [x, y]
 *   Related concepts: [...]
 *   Syntax by language: ...            (optional)
 *   Used by (track/): Lesson N, Lesson M (note), ...
 *   Recognition taught in (track-foundations): ...
 *   Fully taught in (track-foundations): ...
 *
 * Usage:
 *   node scripts/concept-graph-report.mjs
 *   node scripts/concept-graph-report.mjs --file path/to/CONCEPT-GRAPH.md
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseNodes, buildGraph } from './lib/concept-graph-parse.mjs'
import { validate } from './lib/concept-graph-validate.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const args = process.argv.slice(2)
const fileFlagIndex = args.indexOf('--file')
const filePath = fileFlagIndex >= 0 && args[fileFlagIndex + 1]
  ? resolve(root, args[fileFlagIndex + 1])
  : resolve(root, 'src/docs/projects/track-foundations/CONCEPT-GRAPH.md')

function report(byId) {
  const byLesson = new Map() // lesson -> { introduced: [id], reused: [id] }
  for (const node of byId.values()) {
    if (node.usedByLessons.length === 0) continue
    const [introducedAt, ...rest] = node.usedByLessons
    if (!byLesson.has(introducedAt)) byLesson.set(introducedAt, { introduced: [], reused: [] })
    byLesson.get(introducedAt).introduced.push(node.id)
    for (const lesson of new Set(rest)) {
      if (!byLesson.has(lesson)) byLesson.set(lesson, { introduced: [], reused: [] })
      byLesson.get(lesson).reused.push(node.id)
    }
  }

  const lessons = [...byLesson.keys()].sort((a, b) => a - b)
  let cumulative = 0
  console.log('\n=== Per-lesson growth (derived from Used by (track/)) ===')
  console.log('Lesson | New | Reused | Active Vocabulary (cumulative)')
  for (const lesson of lessons) {
    const { introduced, reused } = byLesson.get(lesson)
    cumulative += introduced.length
    console.log(`${String(lesson).padStart(6)} | ${String(introduced.length).padStart(3)} | ${String(reused.length).padStart(6)} | ${cumulative}`)
  }

  console.log(`\nTotal nodes: ${byId.size}`)

  console.log('\n=== Reuse distance / never-reused nodes ===')
  const neverReused = []
  const distances = []
  for (const node of byId.values()) {
    if (node.usedByLessons.length === 0) continue
    if (node.usedByLessons.length === 1) {
      neverReused.push(node)
    } else {
      distances.push({
        id: node.id,
        introducedAt: node.usedByLessons[0],
        firstReuseAt: node.usedByLessons[1],
        distance: node.usedByLessons[1] - node.usedByLessons[0],
        reuseCount: node.usedByLessons.length - 1,
      })
    }
  }
  distances.sort((a, b) => b.distance - a.distance)
  console.log(`${neverReused.length} nodes not yet reused beyond their introducing lesson:`)
  for (const n of neverReused) console.log(`  - ${n.id} (introduced Lesson ${n.usedByLessons[0]})`)
  console.log(`\nLargest first-reuse gaps:`)
  for (const d of distances.slice(0, 10)) {
    console.log(`  - ${d.id}: introduced L${d.introducedAt}, first reused L${d.firstReuseAt} (distance ${d.distance}, reused ${d.reuseCount}x total)`)
  }

  console.log('\n=== Dead-concept watch list (reuse count 0 — not an error) ===')
  for (const node of byId.values()) {
    if (node.usedByLessons.length === 1) {
      console.log(`  - ${node.id}: introduced Lesson ${node.usedByLessons[0]}, last used Lesson ${node.usedByLessons[0]}, reuse count 0`)
    }
  }

  console.log('\n=== High fan-out concepts (load-bearing — handle with care) ===')
  const transitiveFanout = new Map()
  for (const id of byId.keys()) {
    const seen = new Set()
    const queue = [...(byId.get(id)?.buildsToward || [])]
    while (queue.length) {
      const next = queue.shift()
      if (seen.has(next) || !byId.has(next)) continue
      seen.add(next)
      queue.push(...byId.get(next).buildsToward)
    }
    transitiveFanout.set(id, seen.size)
  }
  const fanoutRanked = [...byId.values()]
    .map((n) => ({ id: n.id, direct: n.buildsToward.length, transitive: transitiveFanout.get(n.id) || 0 }))
    .filter((n) => n.direct > 0)
    .sort((a, b) => b.transitive - a.transitive)
  for (const n of fanoutRanked.slice(0, 12)) {
    console.log(`  - ${n.id}: ${n.direct} direct dependents, ${n.transitive} total (transitive)`)
  }

  console.log('\n=== Single-parent chains (candidates for over-fragmentation review) ===')
  const reverseDegree = new Map([...byId.keys()].map((id) => [id, 0]))
  for (const node of byId.values()) {
    for (const dep of node.requiredPrereqs) {
      if (reverseDegree.has(dep)) reverseDegree.set(dep, reverseDegree.get(dep) + 1)
    }
  }
  const visited = new Set()
  for (const node of byId.values()) {
    if (visited.has(node.id)) continue
    if (node.buildsToward.length !== 1) continue
    // Only start a chain report at a node whose own "parent count" (how many
    // things require IT) isn't itself part of a longer chain already being
    // walked from earlier - avoid duplicate/overlapping reports by only
    // starting where the node is not the sole Builds-toward target of some
    // other single-fanout node.
    const isChainInterior = [...byId.values()].some(
      (other) => other.buildsToward.length === 1 && other.buildsToward[0] === node.id
    )
    if (isChainInterior) continue
    const chain = [node.id]
    let cursor = node
    while (cursor.buildsToward.length === 1 && byId.has(cursor.buildsToward[0])) {
      const next = byId.get(cursor.buildsToward[0])
      chain.push(next.id)
      visited.add(next.id)
      cursor = next
    }
    if (chain.length >= 3) {
      console.log(`  - ${chain.join(' -> ')}`)
    }
  }

  console.log('\n=== Category totals ===')
  const byCategory = new Map()
  for (const node of byId.values()) {
    byCategory.set(node.category, (byCategory.get(node.category) || 0) + 1)
  }
  for (const [category, count] of [...byCategory.entries()].sort()) {
    console.log(`  ${category}: ${count}`)
  }
}

function healthReport(byId) {
  console.log('\n=== Graph Health Report ===')

  // Structure: prerequisite count stats.
  const prereqCounts = [...byId.values()].map((n) => n.requiredPrereqs.length)
  const totalPrereqs = prereqCounts.reduce((a, b) => a + b, 0)
  const avgPrereqs = totalPrereqs / prereqCounts.length
  const sortedCounts = [...prereqCounts].sort((a, b) => a - b)
  const mid = Math.floor(sortedCounts.length / 2)
  const medianPrereqs = sortedCounts.length % 2 === 0
    ? (sortedCounts[mid - 1] + sortedCounts[mid]) / 2
    : sortedCounts[mid]

  // Longest dependency chain through Required prerequisites (memoized longest
  // path to a leaf, i.e. a node with no required prerequisites).
  const depthMemo = new Map()
  function depthOf(id, seen) {
    if (depthMemo.has(id)) return depthMemo.get(id)
    const node = byId.get(id)
    if (!node || node.requiredPrereqs.length === 0) {
      depthMemo.set(id, 0)
      return 0
    }
    if (seen.has(id)) return 0 // cycle guard; validate() already reports real cycles
    seen.add(id)
    let max = 0
    for (const dep of node.requiredPrereqs) {
      max = Math.max(max, 1 + depthOf(dep, seen))
    }
    seen.delete(id)
    depthMemo.set(id, max)
    return max
  }
  let maxDepth = 0
  let maxDepthId = null
  for (const id of byId.keys()) {
    const d = depthOf(id, new Set())
    if (d > maxDepth) {
      maxDepth = d
      maxDepthId = id
    }
  }
  // Reconstruct the actual longest chain for display.
  const longestChain = [maxDepthId]
  {
    let cursor = maxDepthId
    while (cursor) {
      const node = byId.get(cursor)
      if (!node || node.requiredPrereqs.length === 0) break
      let next = null
      let best = -1
      for (const dep of node.requiredPrereqs) {
        const d = depthMemo.get(dep) ?? 0
        if (d > best) {
          best = d
          next = dep
        }
      }
      if (next === null) break
      longestChain.push(next)
      cursor = next
    }
  }

  console.log('\n-- Structure --')
  console.log(`Total nodes: ${byId.size}`)
  console.log(`Average required-prerequisite count: ${avgPrereqs.toFixed(2)}`)
  console.log(`Median required-prerequisite count: ${medianPrereqs}`)
  console.log(`Maximum prerequisite depth: ${maxDepth} (deepest node: ${maxDepthId})`)
  console.log(`Longest dependency chain: ${longestChain.join(' -> ')}`)

  // Reuse: avg/median reuse count, top 20 most-reused, never-reused count.
  const reuseCounts = [...byId.values()].map((n) => Math.max(0, n.usedByLessons.length - 1))
  const totalReuse = reuseCounts.reduce((a, b) => a + b, 0)
  const avgReuse = totalReuse / reuseCounts.length
  const sortedReuse = [...reuseCounts].sort((a, b) => a - b)
  const rMid = Math.floor(sortedReuse.length / 2)
  const medianReuse = sortedReuse.length % 2 === 0
    ? (sortedReuse[rMid - 1] + sortedReuse[rMid]) / 2
    : sortedReuse[rMid]
  const neverReusedCount = [...byId.values()].filter((n) => n.usedByLessons.length === 1).length
  const noUsedByCount = [...byId.values()].filter((n) => n.usedByLessons.length === 0).length

  console.log('\n-- Reuse --')
  console.log(`Average reuse count: ${avgReuse.toFixed(2)}`)
  console.log(`Median reuse count: ${medianReuse}`)
  console.log(`Nodes never reused beyond introduction: ${neverReusedCount}`)
  console.log(`Nodes with no Used-by lesson at all: ${noUsedByCount}`)

  const top20 = [...byId.values()]
    .map((n) => ({ id: n.id, usedByCount: n.usedByLessons.length, lessons: n.usedByLessons }))
    .filter((n) => n.usedByCount > 0)
    .sort((a, b) => b.usedByCount - a.usedByCount)
    .slice(0, 20)
  console.log('\nTop 20 most-reused concepts (by Used by (track/) count):')
  top20.forEach((n, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${n.id}: used by ${n.usedByCount} lesson(s) [${n.lessons.join(', ')}]`)
  })

  // Curriculum: largest subsystem introductions (biggest single-lesson New spike).
  const byLesson = new Map()
  for (const node of byId.values()) {
    if (node.usedByLessons.length === 0) continue
    const introducedAt = node.usedByLessons[0]
    if (!byLesson.has(introducedAt)) byLesson.set(introducedAt, [])
    byLesson.get(introducedAt).push(node.id)
  }
  const biggestIntroductions = [...byLesson.entries()]
    .map(([lesson, ids]) => ({ lesson, count: ids.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  console.log('\n-- Curriculum --')
  console.log('Largest subsystem introductions (most new nodes in one lesson):')
  for (const b of biggestIntroductions) {
    console.log(`  - Lesson ${b.lesson}: ${b.count} new nodes`)
  }

  // Quality: orphans (validate() already reports these), single-use nodes,
  // high fan-in (reverse-degree) concepts, high fan-out already reported above.
  const reverseDegree = new Map([...byId.keys()].map((id) => [id, 0]))
  for (const node of byId.values()) {
    for (const dep of node.requiredPrereqs) {
      if (reverseDegree.has(dep)) reverseDegree.set(dep, reverseDegree.get(dep) + 1)
    }
  }
  const highFanIn = [...reverseDegree.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  console.log('\n-- Quality --')
  console.log(`Single-use nodes (no Used-by reuse): ${neverReusedCount}`)
  console.log('High fan-in concepts (most direct required-prerequisite dependents):')
  for (const [id, count] of highFanIn) {
    console.log(`  - ${id}: ${count} direct dependents`)
  }

  console.log('\n-- Category totals --')
  const byCategory = new Map()
  for (const node of byId.values()) {
    byCategory.set(node.category, (byCategory.get(node.category) || 0) + 1)
  }
  for (const [category, count] of [...byCategory.entries()].sort()) {
    console.log(`  ${category}: ${count}`)
  }
}

function main() {
  const text = readFileSync(filePath, 'utf8')
  const nodes = parseNodes(text)
  const byId = buildGraph(nodes)

  console.log(`Parsed ${nodes.length} node headings from ${filePath}`)
  if (nodes.length !== byId.size) {
    console.log(`WARNING: ${nodes.length - byId.size} duplicate node id(s) detected - later definition silently won.`)
  }

  const problems = validate(byId)
  console.log(`\n=== Validation (${problems.length} issue(s)) ===`)
  if (problems.length === 0) {
    console.log('  none')
  } else {
    for (const p of problems) console.log(`  - ${p}`)
  }

  report(byId)
  healthReport(byId)

  process.exitCode = problems.length > 0 ? 1 : 0
}

main()
