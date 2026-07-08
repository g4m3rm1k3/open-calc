// ─── Lesson Adapter ───────────────────────────────────────────────────────────
// Bridges lesson YAML/JSON configurations to MathOS platform calls.
// Lessons never build UI. They describe a workspace state.
// This adapter translates that description into platform mutations.
//
// A lesson configuration looks like:
//
//   workspace:
//     mode: calculus
//     title: "Exploring Derivatives"
//     variables:
//       x: 2
//     functions:
//       - name: f, param: x, body: "x^2"
//     show: [graph, table, solver]
//     lock: [matrix, statistics]
//     highlight: [graph]

import { type MathDocument, type DocumentMode, type ObjectId } from './MathDocument'
import { type MathOSPlatform, type Assertion, platform as defaultPlatform } from './MathOSPlatform'

// ─── Config Types ─────────────────────────────────────────────────────────────

export interface LessonConfig {
  mode?:      DocumentMode
  title?:     string
  lessonId?:  string
  variables?: Record<string, number>
  expressions?: Array<{ body: string; scope?: string[] }>
  functions?:   Array<{ name: string; param: string; body: string }>
  matrices?:    Array<{ values: number[][]; label?: string }>
  vectors?:     Array<{ values: number[]; label?: string }>
  triangles?:   Array<{
    a?: number; b?: number; c?: number
    A?: number; B?: number; C?: number
    label?: string
  }>
  datasets?:  Array<{ values: number[]; label?: string }>
  polynomials?: Array<{ expression: string }>
  // View layer hints — interpreted by the View Manager, not the platform
  show?:      string[]
  lock?:      string[]
  highlight?: string[]
  readonly?:  boolean
}

// ─── Loaded Workspace ─────────────────────────────────────────────────────────

export interface LoadedWorkspace {
  doc:       MathDocument
  ids:       Record<string, ObjectId>   // named → objectId map
  show:      string[]
  lock:      string[]
  highlight: string[]
  readonly:  boolean
  reset():   void
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

export function loadWorkspace(
  config: LessonConfig,
  p: MathOSPlatform = defaultPlatform,
): LoadedWorkspace {
  const doc = p.createDocument(config.mode ?? 'general', config.title)
  doc.meta.lessonId = config.lessonId

  const ids: Record<string, ObjectId> = {}

  // Variables — added first so expressions can reference them by name
  for (const [name, value] of Object.entries(config.variables ?? {})) {
    ids[name] = p.addVariable(doc, name, value)
  }

  // Functions
  for (const fn of config.functions ?? []) {
    const id = p.addFunction(doc, fn.name, fn.param, fn.body)
    ids[fn.name] = id
  }

  // Expressions — resolve variable scope by name
  for (const expr of config.expressions ?? []) {
    const scopeIds = (expr.scope ?? []).map(name => {
      const id = ids[name]
      if (!id) throw new Error(`Lesson config: expression scope references unknown variable '${name}'`)
      return id
    })
    const id = p.addExpression(doc, expr.body, scopeIds)
    ids[`expr:${expr.body}`] = id
  }

  // Matrices
  for (const m of config.matrices ?? []) {
    const id = p.addMatrix(doc, m.values, m.label)
    if (m.label) ids[m.label] = id
  }

  // Vectors
  for (const v of config.vectors ?? []) {
    const id = p.addVector(doc, v.values, v.label)
    if (v.label) ids[v.label] = id
  }

  // Triangles
  for (const t of config.triangles ?? []) {
    const { label, ...known } = t
    const id = p.addTriangle(doc, known, label)
    if (label) ids[label] = id
  }

  // Datasets
  for (const d of config.datasets ?? []) {
    const id = p.addDataset(doc, d.values, d.label)
    if (d.label) ids[d.label] = id
  }

  // Polynomials
  for (const poly of config.polynomials ?? []) {
    const id = p.addPolynomial(doc, poly.expression)
    ids[`poly:${poly.expression}`] = id
  }

  // Emit loaded
  p.bus.emit('document:loaded', { docId: doc.meta.id })

  // Highlight initial targets
  if (config.highlight?.length) {
    p.highlight(doc, config.highlight)
  }

  const originalConfig = config

  return {
    doc,
    ids,
    show:      config.show      ?? [],
    lock:      config.lock      ?? [],
    highlight: config.highlight ?? [],
    readonly:  config.readonly  ?? false,
    reset() {
      // Re-apply all variable values to initial state
      for (const [name, value] of Object.entries(originalConfig.variables ?? {})) {
        const id = ids[name]
        if (id) p.setVariable(doc, id, value)
      }
      p.bus.emit('document:reset', { docId: doc.meta.id })
    },
  }
}

// ─── Assessment Helpers ───────────────────────────────────────────────────────

export function checkWorkspace(
  ws: LoadedWorkspace,
  assertion: Assertion,
  p: MathOSPlatform = defaultPlatform,
): boolean {
  return p.check(ws.doc, assertion)
}

// ─── Example Configs (typed constants) ───────────────────────────────────────
// These serve as documentation and as the workspace files referenced in lessons.

export const WORKSPACE_DERIVATIVE_INTRO: LessonConfig = {
  mode:  'calculus',
  title: 'Exploring Derivatives',
  variables:  { x: 2 },
  functions:  [{ name: 'f', param: 'x', body: 'x^2' }],
  show:       ['graph', 'table', 'solver'],
  lock:       ['matrix', 'statistics'],
  highlight:  ['graph'],
}

export const WORKSPACE_LINEAR_ALGEBRA: LessonConfig = {
  mode:  'linear-algebra',
  title: 'Matrix Transformations',
  matrices: [{ values: [[1,2],[3,4]], label: 'A' }],
  vectors:  [{ values: [1, 0], label: 'v' }],
  show:     ['matrix', 'graph', 'inspector'],
  lock:     ['statistics', 'geometry'],
}

export const WORKSPACE_TRIANGLE_LAW_OF_COSINES: LessonConfig = {
  mode:  'geometry',
  title: 'Law of Cosines',
  triangles: [{ a: 5, b: 7, C: 60, label: 'T' }],
  show:      ['geometry', 'inspector', 'solver'],
  highlight: ['geometry'],
}

export const WORKSPACE_STATISTICS_INTRO: LessonConfig = {
  mode:  'statistics',
  title: 'Descriptive Statistics',
  datasets: [{ values: [4, 7, 13, 2, 1, 9, 6], label: 'data' }],
  show:     ['table', 'histogram', 'inspector'],
}
