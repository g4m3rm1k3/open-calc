/**
 * Structural validation for the parsed concept graph (see
 * concept-graph-parse.mjs), shared by scripts/concept-graph-report.mjs and
 * scripts/concept-graph-resolve.mjs so structural-error detection (cycles,
 * dangling references, orphans, Builds-toward staleness) lives in exactly
 * one place.
 */

export function validate(byId) {
  const problems = []

  // Duplicate slugs are impossible by construction of a Map, but duplicate
  // *headings* in the source file would silently overwrite - check the raw
  // node count vs map size by re-scanning isn't necessary here since
  // parseNodes already produces one entry per heading occurrence; Map
  // insertion order means a real duplicate heading silently clobbers the
  // first. Detect that upstream instead: count heading occurrences.

  // Dangling prerequisite / builds-toward references.
  for (const node of byId.values()) {
    for (const dep of node.requiredPrereqs) {
      if (!byId.has(dep)) {
        problems.push(`DANGLING PREREQ: ${node.id} requires "${dep}", which is not a node.`)
      }
    }
    for (const dep of node.buildsToward) {
      if (!byId.has(dep)) {
        problems.push(`DANGLING BUILDS-TOWARD: ${node.id} lists "${dep}", which is not a node.`)
      }
    }
  }

  // Cycle detection over Required prerequisites only.
  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = new Map([...byId.keys()].map((id) => [id, WHITE]))
  const stack = []
  function visit(id) {
    if (color.get(id) === BLACK) return
    if (color.get(id) === GRAY) {
      const cycleStart = stack.indexOf(id)
      problems.push(`CYCLE: ${stack.slice(cycleStart).concat(id).join(' -> ')}`)
      return
    }
    color.set(id, GRAY)
    stack.push(id)
    const node = byId.get(id)
    if (node) {
      for (const dep of node.requiredPrereqs) {
        if (byId.has(dep)) visit(dep)
      }
    }
    stack.pop()
    color.set(id, BLACK)
  }
  for (const id of byId.keys()) visit(id)

  // Builds-toward accuracy: recompute the reverse graph and diff.
  const trueReverse = new Map([...byId.keys()].map((id) => [id, new Set()]))
  for (const node of byId.values()) {
    for (const dep of node.requiredPrereqs) {
      if (trueReverse.has(dep)) trueReverse.get(dep).add(node.id)
    }
  }
  for (const node of byId.values()) {
    const written = new Set(node.buildsToward)
    const computed = trueReverse.get(node.id) || new Set()
    const missing = [...computed].filter((x) => !written.has(x))
    const extra = [...written].filter((x) => !computed.has(x))
    if (missing.length) {
      problems.push(`BUILDS-TOWARD STALE (missing): ${node.id} should list ${missing.join(', ')}`)
    }
    if (extra.length) {
      problems.push(`BUILDS-TOWARD STALE (extra): ${node.id} lists ${extra.join(', ')} but nothing requires it`)
    }
  }

  // Orphans: no Used-by AND not a required-prerequisite (transitively) of
  // anything that does have a Used-by. A node is "anchored" if it has
  // Used-by itself, or is a required-prerequisite (possibly transitively)
  // of an anchored node.
  const hasUsedBy = new Set([...byId.values()].filter((n) => n.usedByLessons.length > 0).map((n) => n.id))
  const anchored = new Set(hasUsedBy)
  let changed = true
  while (changed) {
    changed = false
    for (const node of byId.values()) {
      if (anchored.has(node.id)) continue
      const isDepOfAnchored = [...byId.values()].some(
        (other) => anchored.has(other.id) && other.requiredPrereqs.includes(node.id)
      )
      if (isDepOfAnchored) {
        anchored.add(node.id)
        changed = true
      }
    }
  }
  for (const node of byId.values()) {
    if (!anchored.has(node.id)) {
      problems.push(`ORPHAN: ${node.id} has no Used-by lesson and is not a prerequisite of anything that does.`)
    }
  }

  return problems
}

// Structural-error subset of validate()'s problems — the tier that should
// fail a build (cycles, dangling references). Orphans and Builds-toward
// staleness are graph-hygiene concerns surfaced by concept-graph-report.mjs;
// they don't block curriculum ordering the way a cycle or a missing node do.
export function structuralErrors(problems) {
  return problems.filter((p) => p.startsWith('CYCLE:') || p.startsWith('DANGLING '))
}
