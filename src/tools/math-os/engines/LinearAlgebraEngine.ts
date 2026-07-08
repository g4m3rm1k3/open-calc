// ─── Linear Algebra Domain Engine ────────────────────────────────────────────
// Handles Matrix and Vector objects.
// Delegates heavy computation to the shared mathEngines.js CAS.

import type { DomainEngine } from '../core/ComputationEngine'
import type { DependencyEngine } from '../core/DependencyEngine'
import type { MathDocument, MathMatrix, MathVector, ObjectId } from '../core/MathDocument'

import {
  parseMatrix, solveDeterminant, solveInverse, solveTranspose,
  solveTrace, solveRank, solveEigenvalues, solveRREF,
  solveNullSpace, solveColumnSpace, solveLU, solveQR, solveSVD,
  solveConditionNumber, solveCharPoly,
  solveDot, solveCross, solveNorm,
} from '../mathEngines.js'

// Properties computable from a matrix's own values
const MATRIX_PROP_DEPS: Record<string, string[]> = {
  determinant:    ['values'],
  trace:          ['values'],
  rank:           ['values'],
  transpose:      ['values'],
  inverse:        ['values'],
  rref:           ['values'],
  eigenvalues:    ['values'],
  nullSpace:      ['values'],
  columnSpace:    ['values'],
  lu:             ['values'],
  qr:             ['values'],
  svd:            ['values'],
  conditionNumber:['values'],
  charPoly:       ['values'],
  rows:           ['values'],
  cols:           ['values'],
  isSquare:       ['values'],
  isSingular:     ['determinant'],
}

const VECTOR_PROP_DEPS: Record<string, string[]> = {
  norm:      ['values'],
  magnitude: ['values'],
  dimension: ['values'],
  unit:      ['norm', 'values'],
}

function matrixFromObj(m: MathMatrix): number[][] {
  return m.values
}

export const LinearAlgebraEngine: DomainEngine = {
  name: 'LinearAlgebraEngine',
  handles: ['matrix', 'vector'],

  onObjectAdded(dep: DependencyEngine, objectId: ObjectId, doc: MathDocument): void {
    const obj = doc.objects.get(objectId)
    if (!obj) return
    if (obj.kind === 'matrix') dep.declareObjectDeps(objectId, MATRIX_PROP_DEPS)
    if (obj.kind === 'vector') dep.declareObjectDeps(objectId, VECTOR_PROP_DEPS)
  },

  onObjectRemoved(dep: DependencyEngine, objectId: ObjectId): void {
    dep.removeObject(objectId)
  },

  compute(doc: MathDocument, objectId: ObjectId, property: string): unknown {
    const obj = doc.objects.get(objectId)
    if (!obj) return undefined

    // ─── Matrix ────────────────────────────────────────────────────────────
    if (obj.kind === 'matrix') {
      const m = obj as MathMatrix
      const A = matrixFromObj(m)
      const rows = A.length, cols = A[0]?.length ?? 0

      // Safe wrapper: returns undefined on engine errors
      const safe = <T>(fn: () => T): T | undefined => {
        try { return fn() } catch { return undefined }
      }

      switch (property) {
        case 'rows':    return rows
        case 'cols':    return cols
        case 'isSquare': return rows === cols
        case 'trace':   return rows === cols ? safe(() => solveTrace(A)) : undefined
        case 'rank':    return safe(() => solveRank(A))
        case 'determinant': return rows === cols ? safe(() => solveDeterminant(A)) : undefined
        case 'isSingular': {
          const det = doc.computed.get(`${objectId}.determinant`) as number | undefined
          return det !== undefined ? Math.abs(det) < 1e-10 : undefined
        }
        case 'transpose':   return safe(() => solveTranspose(A))
        case 'inverse':     return rows === cols ? safe(() => solveInverse(A)) : undefined
        case 'rref':        return safe(() => solveRREF(A))
        case 'eigenvalues': return rows === cols ? safe(() => solveEigenvalues(A)) : undefined
        case 'nullSpace':   return safe(() => solveNullSpace(A))
        case 'columnSpace': return safe(() => solveColumnSpace(A))
        case 'lu':          return rows === cols ? safe(() => solveLU(A)) : undefined
        case 'qr':          return safe(() => solveQR(A))
        case 'svd':         return safe(() => solveSVD(A))
        case 'conditionNumber': return safe(() => solveConditionNumber(A))
        case 'charPoly':    return rows === cols ? safe(() => solveCharPoly(A)) : undefined
        default:            return undefined
      }
    }

    // ─── Vector ────────────────────────────────────────────────────────────
    if (obj.kind === 'vector') {
      const v = obj as MathVector
      const vals = v.values
      switch (property) {
        case 'dimension': return vals.length
        case 'norm':
        case 'magnitude': return Math.sqrt(vals.reduce((s, x) => s + x * x, 0))
        case 'unit': {
          const n = Math.sqrt(vals.reduce((s, x) => s + x * x, 0))
          return n > 0 ? vals.map(x => x / n) : vals
        }
        default: return undefined
      }
    }

    return undefined
  },
}

// ─── Cross-object operations ──────────────────────────────────────────────────
// These are not properties of individual objects — they live on the platform API.
// e.g., platform.computePairwise(doc, 'dot', vecIdA, vecIdB)

export function computePairwise(
  doc: MathDocument,
  op: 'dot' | 'cross' | 'matmul',
  idA: ObjectId,
  idB: ObjectId,
): unknown {
  const a = doc.objects.get(idA)
  const b = doc.objects.get(idB)
  if (!a || !b) return undefined

  try {
    if (op === 'dot' && a.kind === 'vector' && b.kind === 'vector')
      return solveDot([(a as MathVector).values], [(b as MathVector).values])
    if (op === 'cross' && a.kind === 'vector' && b.kind === 'vector')
      return solveCross([(a as MathVector).values], [(b as MathVector).values])
    if (op === 'matmul' && a.kind === 'matrix' && b.kind === 'matrix')
      return (a as MathMatrix).values.map((row, r) =>
        (b as MathMatrix).values[0].map((_, c) =>
          row.reduce((sum, _, k) => sum + (a as MathMatrix).values[r][k] * (b as MathMatrix).values[k][c], 0)
        )
      )
  } catch { return undefined }

  return undefined
}
