// ─── Geometry Domain Engine ───────────────────────────────────────────────────
// Computes triangle properties. Angles always stored in degrees internally.

import type { DomainEngine } from '../core/ComputationEngine'
import type { DependencyEngine } from '../core/DependencyEngine'
import type { MathDocument, MathTriangle, ObjectId } from '../core/MathDocument'

const DEG = Math.PI / 180

function solveTriangle(t: MathTriangle): Partial<MathTriangle> {
  let { a, b, c, A, B, C } = t
  const toR = (d?: number) => d !== undefined ? d * DEG : undefined
  const toD = (r: number)  => r / DEG

  let Ar = toR(A), Br = toR(B), Cr = toR(C)

  // Resolve missing angle from angle sum
  const angCount = [A,B,C].filter(x => x !== undefined).length
  if (angCount === 2) {
    if (A === undefined && Br !== undefined && Cr !== undefined) { Ar = Math.PI - Br - Cr; A = toD(Ar) }
    if (B === undefined && Ar !== undefined && Cr !== undefined) { Br = Math.PI - Ar - Cr; B = toD(Br) }
    if (C === undefined && Ar !== undefined && Br !== undefined) { Cr = Math.PI - Ar - Br; C = toD(Cr) }
  }

  // SSS
  if (a !== undefined && b !== undefined && c !== undefined && Ar === undefined) {
    Ar = Math.acos((b**2 + c**2 - a**2) / (2*b*c)); A = toD(Ar)
    Br = Math.acos((a**2 + c**2 - b**2) / (2*a*c)); B = toD(Br)
    Cr = Math.PI - Ar - Br; C = toD(Cr)
  }
  // SAS — a,b,C known → c
  if (a !== undefined && b !== undefined && Cr !== undefined && c === undefined) {
    c = Math.sqrt(a**2 + b**2 - 2*a*b*Math.cos(Cr))
    Ar = Math.acos((b**2 + c**2 - a**2)/(2*b*c)); A = toD(Ar)
    Br = Math.PI - Ar - Cr; B = toD(Br)
  }
  // ASA / AAS — a,A,B known → b,c
  if (a !== undefined && Ar !== undefined && Br !== undefined && b === undefined) {
    b = a * Math.sin(Br) / Math.sin(Ar)
    Cr = Math.PI - Ar - Br; C = toD(Cr)
    c = a * Math.sin(Cr) / Math.sin(Ar)
  }
  // Law of Sines: a,A,b → B
  if (a !== undefined && b !== undefined && Ar !== undefined && Br === undefined) {
    Br = Math.asin(b * Math.sin(Ar) / a); B = toD(Br)
    Cr = Math.PI - Ar - Br; C = toD(Cr)
    c = a * Math.sin(Cr) / Math.sin(Ar)
  }
  // Right triangle: a,b known, C=90
  if (a !== undefined && b !== undefined && C === 90 && c === undefined) {
    c = Math.sqrt(a**2 + b**2)
    Ar = Math.atan2(a, b); A = toD(Ar)
    Br = Math.PI/2 - Ar; B = toD(Br)
  }

  return { a, b, c, A, B, C }
}

const TRIANGLE_PROP_DEPS: Record<string, string[]> = {
  area:       ['a', 'b', 'C'],
  perimeter:  ['a', 'b', 'c'],
  circumradius: ['a', 'A'],
  inradius:   ['a', 'b', 'c'],
  // solved sides/angles: depend on all known inputs
  _solved:    ['a', 'b', 'c', 'A', 'B', 'C'],
}

export const GeometryEngine: DomainEngine = {
  name: 'GeometryEngine',
  handles: ['triangle'],

  onObjectAdded(dep: DependencyEngine, objectId: ObjectId): void {
    dep.declareObjectDeps(objectId, TRIANGLE_PROP_DEPS)
  },

  onObjectRemoved(dep: DependencyEngine, objectId: ObjectId): void {
    dep.removeObject(objectId)
  },

  compute(doc: MathDocument, objectId: ObjectId, property: string): unknown {
    const t = doc.objects.get(objectId) as MathTriangle | undefined
    if (!t || t.kind !== 'triangle') return undefined

    const s = solveTriangle(t)
    const { a, b, c, A, B, C } = s
    const Cr = C !== undefined ? C * DEG : undefined

    switch (property) {
      case 'area':
        if (a !== undefined && b !== undefined && Cr !== undefined)
          return 0.5 * a * b * Math.sin(Cr)
        if (a !== undefined && b !== undefined && c !== undefined) {
          const sp = (a + b + c) / 2
          return Math.sqrt(sp * (sp - a) * (sp - b) * (sp - c))
        }
        return undefined
      case 'perimeter':
        return (a !== undefined && b !== undefined && c !== undefined) ? a + b + c : undefined
      case 'circumradius':
        if (a !== undefined && A !== undefined) return a / (2 * Math.sin(A * DEG))
        return undefined
      case 'inradius': {
        const area = doc.computed.get(`${objectId}.area`) as number | undefined
        const perim = doc.computed.get(`${objectId}.perimeter`) as number | undefined
        return (area !== undefined && perim !== undefined && perim > 0) ? area / (perim / 2) : undefined
      }
      case 'solved': return s
      case 'a': return s.a
      case 'b': return s.b
      case 'c': return s.c
      case 'A': return s.A
      case 'B': return s.B
      case 'C': return s.C
      default: return undefined
    }
  },
}
