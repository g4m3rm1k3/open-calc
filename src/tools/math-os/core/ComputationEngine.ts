// ─── Layer 3: Computation Engine ─────────────────────────────────────────────
// Delegates property computation to registered domain engines.
// A domain engine declares which object kinds it handles and which properties
// it can compute. The computation engine is a pure dispatcher — it knows
// nothing about mathematics itself.

import type { MathDocument, ObjectId, PropertyKey } from './MathDocument'
import type { DependencyEngine } from './DependencyEngine'

// ─── Domain Engine Interface ──────────────────────────────────────────────────

// A domain engine handles a set of object kinds.
// For each kind, it declares the computed properties and their local deps.
export interface DomainEngine {
  readonly name: string
  // Object kinds this engine handles: 'triangle', 'matrix', etc.
  readonly handles: string[]
  // Called once when the engine is registered with the platform.
  // Use to declare global property dependencies that are always true
  // (e.g., triangle.area always depends on triangle.a, .b, .C).
  onRegister?(dep: DependencyEngine): void
  // Called when an object of a handled kind is added to the document.
  // Use to declare per-instance property dependencies.
  onObjectAdded?(dep: DependencyEngine, objectId: ObjectId, doc: MathDocument): void
  // Called when an object is removed.
  onObjectRemoved?(dep: DependencyEngine, objectId: ObjectId): void
  // Compute one property for one object.
  // Returns undefined if this engine cannot compute the requested property.
  compute(doc: MathDocument, objectId: ObjectId, property: string): unknown | undefined
}

// ─── Computation Engine ───────────────────────────────────────────────────────

export class ComputationEngine {
  private engines: DomainEngine[] = []
  private kindMap: Map<string, DomainEngine[]> = new Map()

  register(engine: DomainEngine, dep: DependencyEngine): void {
    this.engines.push(engine)
    for (const kind of engine.handles) {
      if (!this.kindMap.has(kind)) this.kindMap.set(kind, [])
      this.kindMap.get(kind)!.push(engine)
    }
    engine.onRegister?.(dep)
  }

  notifyAdded(dep: DependencyEngine, objectId: ObjectId, doc: MathDocument): void {
    const obj = doc.objects.get(objectId)
    if (!obj) return
    const engines = this.kindMap.get(obj.kind) ?? []
    for (const engine of engines) engine.onObjectAdded?.(dep, objectId, doc)
  }

  notifyRemoved(dep: DependencyEngine, objectId: ObjectId, doc: MathDocument): void {
    const obj = doc.objects.get(objectId)
    if (!obj) return
    const engines = this.kindMap.get(obj.kind) ?? []
    for (const engine of engines) engine.onObjectRemoved?.(dep, objectId)
  }

  // Compute a single property. Tries each registered engine in order.
  // Returns the first non-undefined result, or undefined if none can compute it.
  compute(doc: MathDocument, key: PropertyKey): unknown {
    const dot = key.indexOf('.')
    const objectId = key.slice(0, dot)
    const property = key.slice(dot + 1)
    const obj = doc.objects.get(objectId)
    if (!obj) return undefined
    const engines = this.kindMap.get(obj.kind) ?? []
    for (const engine of engines) {
      const result = engine.compute(doc, objectId, property)
      if (result !== undefined) return result
    }
    return undefined
  }

  // Recompute a list of property keys in the order given (topological order
  // from DependencyEngine.propagate). Updates doc.computed in place.
  // Returns a step log for the animation timeline.
  recompute(
    doc: MathDocument,
    updateOrder: PropertyKey[],
  ): Array<{ key: PropertyKey; value: unknown }> {
    const steps: Array<{ key: PropertyKey; value: unknown }> = []
    for (const key of updateOrder) {
      const prev = doc.computed.get(key)
      const next = this.compute(doc, key)
      doc.computed.set(key, next)
      steps.push({ key, value: next })
      // Surface the computed value back onto the object for convenience
      this.applyToObject(doc, key, next)
      void prev // prev exposed in the step log for event bus callers
    }
    return steps
  }

  // Write a computed property value back onto the MathObject so callers
  // can read it directly without querying doc.computed.
  private applyToObject(doc: MathDocument, key: PropertyKey, value: unknown): void {
    const dot = key.indexOf('.')
    const objectId = key.slice(0, dot)
    const property = key.slice(dot + 1)
    const obj = doc.objects.get(objectId)
    if (obj) {
      // Spread to preserve immutability contract — doc owns the map
      doc.objects.set(objectId, { ...obj, [property]: value } as typeof obj)
    }
  }

  registeredEngines(): string[] {
    return this.engines.map(e => e.name)
  }
}

