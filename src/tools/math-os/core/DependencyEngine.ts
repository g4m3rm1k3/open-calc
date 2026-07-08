// ─── Layer 2: Dependency Engine ───────────────────────────────────────────────
// Tracks relationships between mathematical PROPERTIES, not objects.
// A node is a PropertyKey: "{objectId}.{property}" — e.g., "tri_1.area"
// When a source property changes, the engine propagates to all dependents
// in topological order and returns the ordered update list.

import type { PropertyKey } from './MathDocument'

interface PropNode {
  key:        PropertyKey
  deps:       Set<PropertyKey>   // what this property reads from
  dependents: Set<PropertyKey>   // what reads from this property
}

export class DependencyEngine {
  private nodes: Map<PropertyKey, PropNode> = new Map()

  // ─── Registration ───────────────────────────────────────────────────────────

  private ensure(key: PropertyKey): PropNode {
    if (!this.nodes.has(key)) {
      this.nodes.set(key, { key, deps: new Set(), dependents: new Set() })
    }
    return this.nodes.get(key)!
  }

  // Declare that `dependent` reads from each of `sources`.
  // Call this when a domain engine registers a property computer.
  declareDeps(dependent: PropertyKey, sources: PropertyKey[]): void {
    const node = this.ensure(dependent)
    // Remove stale reverse edges
    for (const old of node.deps) {
      this.nodes.get(old)?.dependents.delete(dependent)
    }
    node.deps = new Set(sources)
    for (const src of sources) {
      this.ensure(src).dependents.add(dependent)
    }
  }

  // Declare all derived properties for an object at once.
  // propertyDeps: { "area": ["a","b","C"], "perimeter": ["a","b","c"] }
  // objectId prefixes are added automatically.
  declareObjectDeps(
    objectId: string,
    propertyDeps: Record<string, string[]>,
    externalDeps?: PropertyKey[], // cross-object deps, already fully qualified
  ): void {
    for (const [prop, localDeps] of Object.entries(propertyDeps)) {
      const dependent = `${objectId}.${prop}`
      const sources: PropertyKey[] = [
        ...localDeps.map(d => `${objectId}.${d}`),
        ...(externalDeps ?? []),
      ]
      this.declareDeps(dependent, sources)
    }
  }

  // Remove all property nodes for a given object (called when object is deleted).
  removeObject(objectId: string): void {
    for (const [key, node] of this.nodes) {
      if (key.startsWith(`${objectId}.`)) {
        for (const src of node.deps) this.nodes.get(src)?.dependents.delete(key)
        for (const dep of node.dependents) this.nodes.get(dep)?.deps.delete(key)
        this.nodes.delete(key)
      }
    }
  }

  // ─── Propagation ────────────────────────────────────────────────────────────

  // Given a set of changed source properties, return the complete ordered list
  // of properties that need recomputation (topological order, sources excluded).
  // Throws if a dependency cycle is detected.
  propagate(changed: PropertyKey[]): PropertyKey[] {
    const inDegree = new Map<PropertyKey, number>()
    const visited = new Set<PropertyKey>()
    const queue: PropertyKey[] = []
    const result: PropertyKey[] = []

    // BFS to collect all reachable dependents
    const toVisit = [...changed]
    while (toVisit.length) {
      const key = toVisit.pop()!
      for (const dep of this.nodes.get(key)?.dependents ?? []) {
        if (!visited.has(dep)) { visited.add(dep); toVisit.push(dep) }
      }
    }

    // Kahn's algorithm over visited set
    for (const key of visited) {
      let cnt = 0
      for (const src of this.nodes.get(key)?.deps ?? []) {
        if (visited.has(src) || changed.includes(src)) cnt++
      }
      inDegree.set(key, cnt)
      if (cnt === 0) queue.push(key)
    }

    while (queue.length) {
      const key = queue.shift()!
      result.push(key)
      for (const dep of this.nodes.get(key)?.dependents ?? []) {
        if (!visited.has(dep)) continue
        const cnt = (inDegree.get(dep) ?? 1) - 1
        inDegree.set(dep, cnt)
        if (cnt === 0) queue.push(dep)
      }
    }

    if (result.length !== visited.size) {
      throw new Error('Dependency cycle detected: ' + [...visited].filter(k => !result.includes(k)).join(', '))
    }

    return result
  }

  // ─── Inspection ─────────────────────────────────────────────────────────────

  getDeps(key: PropertyKey): PropertyKey[] {
    return [...(this.nodes.get(key)?.deps ?? [])]
  }

  getDependents(key: PropertyKey): PropertyKey[] {
    return [...(this.nodes.get(key)?.dependents ?? [])]
  }

  // All registered property keys — useful for debugging / inspector
  allKeys(): PropertyKey[] {
    return [...this.nodes.keys()]
  }

  hasKey(key: PropertyKey): boolean {
    return this.nodes.has(key)
  }
}
