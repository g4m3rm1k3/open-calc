// ─── Layer 1: Mathematical Document ──────────────────────────────────────────
// Pure data. No computation, no rendering, no animation.
// Every mathematical entity in MATHOS is a MathObject in the document.

export type ObjectId = string

// PropertyKey binds an object to one of its named properties.
// Format: "{objectId}.{property}" — e.g., "tri_1.area", "var_x.value"
export type PropertyKey = string

export function propKey(objectId: ObjectId, property: string): PropertyKey {
  return `${objectId}.${property}`
}

export function splitPropKey(key: PropertyKey): { objectId: ObjectId; property: string } {
  const dot = key.indexOf('.')
  return { objectId: key.slice(0, dot), property: key.slice(dot + 1) }
}

// ─── Math Object Types ────────────────────────────────────────────────────────

export interface Variable {
  id: ObjectId; kind: 'variable'
  name: string
  value: number
  unit?: string
}

export interface MathExpression {
  id: ObjectId; kind: 'expression'
  body: string            // e.g., "x^2 + 2*x + 1"
  scope: ObjectId[]       // ids of Variable objects this expression reads
}

export interface MathFunction {
  id: ObjectId; kind: 'function'
  name: string            // e.g., "f"
  param: string           // e.g., "x"
  body: string            // e.g., "x^2 - 4"
}

export interface MathMatrix {
  id: ObjectId; kind: 'matrix'
  values: number[][]
  label?: string
}

export interface MathVector {
  id: ObjectId; kind: 'vector'
  values: number[]
  label?: string
}

export interface MathTriangle {
  id: ObjectId; kind: 'triangle'
  a?: number; b?: number; c?: number   // side lengths
  A?: number; B?: number; C?: number   // angles (always stored in degrees)
  label?: string
}

export interface MathPolynomial {
  id: ObjectId; kind: 'polynomial'
  expression: string      // e.g., "x^2 - 5*x + 6"
}

export interface MathDataset {
  id: ObjectId; kind: 'dataset'
  values: number[]
  label?: string
}

export interface MathEquation {
  id: ObjectId; kind: 'equation'
  lhs: string             // left-hand side expression string
  rhs: string             // right-hand side expression string
  solveFor?: string       // variable name to isolate
}

export type MathObject =
  | Variable
  | MathExpression
  | MathFunction
  | MathMatrix
  | MathVector
  | MathTriangle
  | MathPolynomial
  | MathDataset
  | MathEquation

// ─── Document ─────────────────────────────────────────────────────────────────

export type DocumentMode =
  | 'algebra' | 'calculus' | 'geometry'
  | 'statistics' | 'linear-algebra' | 'physics' | 'general'

export interface DocumentMeta {
  id: string
  title?: string
  mode: DocumentMode
  createdAt: number
  lessonId?: string
}

export interface MathDocument {
  meta: DocumentMeta
  objects: Map<ObjectId, MathObject>
  // Computed property cache — filled and invalidated by DependencyEngine
  computed: Map<PropertyKey, unknown>
}

// ─── Factory ──────────────────────────────────────────────────────────────────

let _seq = 0
export function newId(kind: string): ObjectId {
  return `${kind}_${Date.now()}_${++_seq}`
}

export function createDocument(mode: DocumentMode = 'general', title?: string): MathDocument {
  return {
    meta: { id: newId('doc'), title, mode, createdAt: Date.now() },
    objects: new Map(),
    computed: new Map(),
  }
}

export function addObject<T extends MathObject>(doc: MathDocument, obj: Omit<T, 'id'>): T {
  const id = newId(obj.kind)
  const full = { ...obj, id } as T
  doc.objects.set(id, full)
  return full
}

export function updateObject<T extends MathObject>(
  doc: MathDocument,
  id: ObjectId,
  patch: Partial<Omit<T, 'id' | 'kind'>>,
): T {
  const obj = doc.objects.get(id)
  if (!obj) throw new Error(`Object ${id} not found`)
  const updated = { ...obj, ...patch } as T
  doc.objects.set(id, updated)
  return updated
}

export function getObject<T extends MathObject>(doc: MathDocument, id: ObjectId): T {
  const obj = doc.objects.get(id)
  if (!obj) throw new Error(`Object ${id} not found`)
  return obj as T
}

export function objectsByKind<T extends MathObject>(doc: MathDocument, kind: T['kind']): T[] {
  const result: T[] = []
  for (const obj of doc.objects.values()) {
    if (obj.kind === kind) result.push(obj as T)
  }
  return result
}
