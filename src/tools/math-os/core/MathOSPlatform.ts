// ─── MathOS Platform ──────────────────────────────────────────────────────────
// Orchestrates all four layers.
// This is the only file that knows about all layers simultaneously.
// Everything else knows only about its own layer.
//
// Mutation contract:
//   1. Caller mutates a raw property (variable value, matrix cell, etc.)
//   2. Platform marks those PropertyKeys as changed
//   3. DependencyEngine returns update order (topological)
//   4. ComputationEngine recomputes each in order, updating doc.computed
//   5. EventBus emits property:changed for each step, then compute:done
//   6. Views react to events — platform never touches views directly

import {
  type MathDocument, type MathObject, type ObjectId, type PropertyKey,
  type DocumentMode, type Variable, type MathTriangle, type MathMatrix,
  type MathVector, type MathDataset, type MathExpression, type MathPolynomial,
  type MathFunction,
  createDocument, addObject, updateObject, getObject, objectsByKind, propKey,
} from './MathDocument'
import { DependencyEngine } from './DependencyEngine'
import { ComputationEngine } from './ComputationEngine'
import { bus, type EventBus } from './EventBus'
import type { DomainEngine } from './ComputationEngine'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlatformOptions {
  bus?: EventBus
}

export interface SetVariableOptions {
  animate?: boolean
  steps?: boolean
}

// ─── Platform ─────────────────────────────────────────────────────────────────

export class MathOSPlatform {
  readonly dep  = new DependencyEngine()
  readonly comp = new ComputationEngine()
  readonly bus: EventBus

  constructor(options?: PlatformOptions) {
    this.bus = options?.bus ?? bus
  }

  // ─── Engine Registration ─────────────────────────────────────────────────

  registerEngine(engine: DomainEngine): this {
    this.comp.register(engine, this.dep)
    return this
  }

  // ─── Document Lifecycle ──────────────────────────────────────────────────

  createDocument(mode?: DocumentMode, title?: string): MathDocument {
    return createDocument(mode, title)
  }

  // ─── Object Mutations ────────────────────────────────────────────────────

  addObject<T extends MathObject>(doc: MathDocument, obj: Omit<T, 'id'>): ObjectId {
    const full = addObject<T>(doc, obj)
    this.comp.notifyAdded(this.dep, full.id, doc)
    this.bus.emit('object:added', { docId: doc.meta.id, objectId: full.id, kind: full.kind })
    this._recompute(doc, [`${full.id}.value`, `${full.id}.values`])
    return full.id
  }

  removeObject(doc: MathDocument, id: ObjectId): void {
    const obj = doc.objects.get(id)
    if (!obj) return
    this.comp.notifyRemoved(this.dep, id, doc)
    doc.objects.delete(id)
    // Clean up computed cache for this object
    for (const key of [...doc.computed.keys()]) {
      if (key.startsWith(`${id}.`)) doc.computed.delete(key)
    }
    this.bus.emit('object:removed', { docId: doc.meta.id, objectId: id })
  }

  // ─── Variable API ────────────────────────────────────────────────────────

  setVariable(
    doc: MathDocument,
    idOrName: ObjectId | string,
    value: number,
    opts?: SetVariableOptions,
  ): void {
    // Resolve by name if not a direct id
    let id = idOrName
    if (!doc.objects.has(idOrName)) {
      const found = objectsByKind<Variable>(doc, 'variable').find(v => v.name === idOrName)
      if (!found) throw new Error(`Variable '${idOrName}' not found in document`)
      id = found.id
    }

    const prev = (getObject<Variable>(doc, id)).value
    updateObject<Variable>(doc, id, { value })
    doc.computed.set(propKey(id, 'value'), value)

    this.bus.emit('object:updated', { docId: doc.meta.id, objectId: id, kind: 'variable' })
    this._propagate(doc, [propKey(id, 'value')], prev)
  }

  addVariable(doc: MathDocument, name: string, value: number, unit?: string): ObjectId {
    return this.addObject<Variable>(doc, { kind: 'variable', name, value, unit })
  }

  // ─── Convenience Adders ──────────────────────────────────────────────────

  addExpression(doc: MathDocument, body: string, scopeVarIds: ObjectId[] = []): ObjectId {
    return this.addObject<MathExpression>(doc, { kind: 'expression', body, scope: scopeVarIds })
  }

  addFunction(doc: MathDocument, name: string, param: string, body: string): ObjectId {
    return this.addObject<MathFunction>(doc, { kind: 'function', name, param, body })
  }

  addMatrix(doc: MathDocument, values: number[][], label?: string): ObjectId {
    return this.addObject<MathMatrix>(doc, { kind: 'matrix', values, label })
  }

  addVector(doc: MathDocument, values: number[], label?: string): ObjectId {
    return this.addObject<MathVector>(doc, { kind: 'vector', values, label })
  }

  addTriangle(doc: MathDocument, known: Partial<Omit<MathTriangle, 'id' | 'kind'>>, label?: string): ObjectId {
    return this.addObject<MathTriangle>(doc, { kind: 'triangle', label, ...known })
  }

  addDataset(doc: MathDocument, values: number[], label?: string): ObjectId {
    return this.addObject<MathDataset>(doc, { kind: 'dataset', values, label })
  }

  addPolynomial(doc: MathDocument, expression: string): ObjectId {
    return this.addObject<MathPolynomial>(doc, { kind: 'polynomial', expression })
  }

  // ─── Matrix Mutation ─────────────────────────────────────────────────────

  setMatrixCell(doc: MathDocument, id: ObjectId, row: number, col: number, value: number): void {
    const m = getObject<MathMatrix>(doc, id)
    const next = m.values.map((r, ri) => r.map((c, ci) => ri === row && ci === col ? value : c))
    updateObject<MathMatrix>(doc, id, { values: next })
    this._propagate(doc, [propKey(id, 'values')])
  }

  setMatrixValues(doc: MathDocument, id: ObjectId, values: number[][]): void {
    updateObject<MathMatrix>(doc, id, { values })
    this._propagate(doc, [propKey(id, 'values')])
  }

  // ─── Dataset Mutation ────────────────────────────────────────────────────

  setDatasetValues(doc: MathDocument, id: ObjectId, values: number[]): void {
    updateObject<MathDataset>(doc, id, { values })
    this._propagate(doc, [propKey(id, 'values')])
  }

  // ─── Property Access ─────────────────────────────────────────────────────

  get(doc: MathDocument, key: PropertyKey): unknown {
    // Return cached value if available, otherwise compute on demand
    if (doc.computed.has(key)) return doc.computed.get(key)
    const val = this.comp.compute(doc, key)
    doc.computed.set(key, val)
    return val
  }

  getProperty(doc: MathDocument, objectId: ObjectId, property: string): unknown {
    return this.get(doc, propKey(objectId, property))
  }

  // ─── Lesson Assessment API ────────────────────────────────────────────────

  check(doc: MathDocument, assertion: Assertion): boolean {
    let passed = false
    if ('variable' in assertion) {
      const vars = objectsByKind<Variable>(doc, 'variable')
      const v = vars.find(v => v.name === assertion.variable)
      if (v) passed = Math.abs(v.value - assertion.equals) < (assertion.tolerance ?? 1e-9)
    } else if ('property' in assertion) {
      const val = this.get(doc, propKey(assertion.objectId, assertion.property))
      passed = closeEnough(val, assertion.equals, assertion.tolerance)
    } else if ('expression' in assertion) {
      const exprs = objectsByKind<MathExpression>(doc, 'expression')
      const e = exprs.find(e => e.id === assertion.expression || e.body === assertion.expression)
      if (e) {
        const val = this.get(doc, propKey(e.id, 'value'))
        passed = closeEnough(val, assertion.equals, assertion.tolerance)
      }
    }
    this.bus.emit('lesson:check', { docId: doc.meta.id, assertion: JSON.stringify(assertion), passed })
    return passed
  }

  highlight(doc: MathDocument, targets: string[]): void {
    this.bus.emit('lesson:highlight', { docId: doc.meta.id, targets })
  }

  // ─── Serialization ───────────────────────────────────────────────────────

  serialize(doc: MathDocument): string {
    return JSON.stringify({
      meta: doc.meta,
      objects: [...doc.objects.values()],
    }, null, 2)
  }

  deserialize(json: string): MathDocument {
    const raw = JSON.parse(json)
    const doc = createDocument(raw.meta.mode, raw.meta.title)
    doc.meta.id = raw.meta.id
    doc.meta.createdAt = raw.meta.createdAt
    doc.meta.lessonId = raw.meta.lessonId
    for (const obj of (raw.objects as MathObject[])) {
      doc.objects.set(obj.id, obj)
      this.comp.notifyAdded(this.dep, obj.id, doc)
    }
    // Recompute everything from scratch
    const allKeys = [...doc.objects.keys()].flatMap(id => {
      return this.dep.allKeys().filter(k => k.startsWith(`${id}.`))
    })
    const order = this.dep.propagate(allKeys)
    this.comp.recompute(doc, order)
    this.bus.emit('document:loaded', { docId: doc.meta.id })
    return doc
  }

  // ─── Internal Propagation ─────────────────────────────────────────────────

  private _propagate(doc: MathDocument, changed: PropertyKey[], prevValue?: unknown): void {
    this.bus.emit('compute:start', { docId: doc.meta.id, trigger: changed[0] })

    let updateOrder: PropertyKey[] = []
    try {
      updateOrder = this.dep.propagate(changed)
    } catch (e) {
      console.error('[MathOS] Dependency cycle:', e)
      return
    }

    const steps = this.comp.recompute(doc, updateOrder)

    for (const step of steps) {
      const prev = prevValue
      this.bus.emit('property:changed', {
        docId: doc.meta.id, key: step.key, value: step.value, prev,
      })
      this.bus.emit('compute:step', { docId: doc.meta.id, key: step.key, value: step.value })
    }

    this.bus.emit('compute:done', { docId: doc.meta.id, steps })
  }

  private _recompute(doc: MathDocument, seedKeys: PropertyKey[]): void {
    const existing = seedKeys.filter(k => this.dep.hasKey(k))
    if (!existing.length) return
    try {
      const order = this.dep.propagate(existing)
      this.comp.recompute(doc, order)
    } catch { /* silent on initial seeding */ }
  }
}

// ─── Assertion Types ──────────────────────────────────────────────────────────

export type Assertion =
  | { variable: string; equals: number; tolerance?: number }
  | { property: string; objectId: ObjectId; equals: unknown; tolerance?: number }
  | { expression: string; equals: number; tolerance?: number }

function closeEnough(a: unknown, b: unknown, tol = 1e-9): boolean {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < tol
  return JSON.stringify(a) === JSON.stringify(b)
}

// ─── Default Platform Instance ────────────────────────────────────────────────
// Pre-wired with the built-in engines. Import this in the rest of the app.

import { GeometryEngine }      from '../engines/GeometryEngine'
import { AlgebraEngine, StatisticsEngine } from '../engines/AlgebraEngine'
import { LinearAlgebraEngine } from '../engines/LinearAlgebraEngine'

export const platform = new MathOSPlatform()
  .registerEngine(AlgebraEngine)
  .registerEngine(StatisticsEngine)
  .registerEngine(GeometryEngine)
  .registerEngine(LinearAlgebraEngine)
