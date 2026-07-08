// ─── Algebra Domain Engine ────────────────────────────────────────────────────
// Handles Variable, MathExpression, MathFunction, MathPolynomial.
// Uses the shared mathEngines.js CAS for evaluation.

import type { DomainEngine } from '../core/ComputationEngine'
import type { DependencyEngine } from '../core/DependencyEngine'
import type {
  MathDocument, MathExpression, MathFunction, MathPolynomial,
  ObjectId, Variable,
} from '../core/MathDocument'
import { propKey } from '../core/MathDocument'

import { calcEval, buildScope, findRoots, polyEvalAt } from '../mathEngines.js'

const EXPRESSION_PROP_DEPS: Record<string, string[]> = {
  value: [],  // external deps added per instance based on scope
}

const POLYNOMIAL_PROP_DEPS: Record<string, string[]> = {
  roots:  [],
  degree: [],
}

export const AlgebraEngine: DomainEngine = {
  name: 'AlgebraEngine',
  handles: ['variable', 'expression', 'function', 'polynomial'],

  onObjectAdded(dep: DependencyEngine, objectId: ObjectId, doc: MathDocument): void {
    const obj = doc.objects.get(objectId)
    if (!obj) return

    if (obj.kind === 'expression') {
      const expr = obj as MathExpression
      // Depend on each referenced variable's value
      const externalDeps = expr.scope.map(varId => propKey(varId, 'value'))
      dep.declareObjectDeps(objectId, EXPRESSION_PROP_DEPS, externalDeps)
    }

    if (obj.kind === 'function') {
      dep.declareDeps(propKey(objectId, 'body'), [])
    }

    if (obj.kind === 'polynomial') {
      dep.declareObjectDeps(objectId, POLYNOMIAL_PROP_DEPS)
    }
  },

  onObjectRemoved(dep: DependencyEngine, objectId: ObjectId): void {
    dep.removeObject(objectId)
  },

  compute(doc: MathDocument, objectId: ObjectId, property: string): unknown {
    const obj = doc.objects.get(objectId)
    if (!obj) return undefined

    // ─── Variable ──────────────────────────────────────────────────────────
    if (obj.kind === 'variable') {
      if (property === 'value') return (obj as Variable).value
      return undefined
    }

    // ─── Expression ────────────────────────────────────────────────────────
    if (obj.kind === 'expression') {
      const expr = obj as MathExpression
      if (property === 'value') {
        // Build scope from referenced variables
        const scope: Record<string, number> = {}
        for (const varId of expr.scope) {
          const varObj = doc.objects.get(varId) as Variable | undefined
          if (varObj?.kind === 'variable') scope[varObj.name] = varObj.value
        }
        try {
          const raw = calcEval(expr.body, buildScope('RAD', 0, scope))
          return typeof raw === 'number' ? raw : Number(raw)
        } catch {
          return NaN
        }
      }
      return undefined
    }

    // ─── Function ──────────────────────────────────────────────────────────
    if (obj.kind === 'function') {
      const fn = obj as MathFunction
      if (property === 'evaluator') {
        // Return a callable (x: number) => number
        return (x: number) => {
          try {
            return Number(calcEval(fn.body, buildScope('RAD', 0, { [fn.param]: x })))
          } catch { return NaN }
        }
      }
      return undefined
    }

    // ─── Polynomial ────────────────────────────────────────────────────────
    if (obj.kind === 'polynomial') {
      const poly = obj as MathPolynomial
      if (property === 'roots') {
        try { return findRoots(poly.expression) } catch { return [] }
      }
      if (property === 'evaluator') {
        return (x: number) => {
          try { return Number(polyEvalAt(poly.expression, x)) } catch { return NaN }
        }
      }
      return undefined
    }

    return undefined
  },
}

// ─── Statistics Engine (inline — small enough) ────────────────────────────────
export const StatisticsEngine: DomainEngine = {
  name: 'StatisticsEngine',
  handles: ['dataset'],

  onObjectAdded(dep: DependencyEngine, objectId: ObjectId): void {
    dep.declareObjectDeps(objectId, {
      mean:   ['values'],
      variance: ['values'],
      stddev: ['variance'],
      min:    ['values'],
      max:    ['values'],
      median: ['values'],
      sum:    ['values'],
      count:  ['values'],
    })
  },

  onObjectRemoved(dep: DependencyEngine, objectId: ObjectId): void {
    dep.removeObject(objectId)
  },

  compute(doc: MathDocument, objectId: ObjectId, property: string): unknown {
    const obj = doc.objects.get(objectId)
    if (!obj || obj.kind !== 'dataset') return undefined
    const data = (obj as import('../core/MathDocument').MathDataset).values
    if (!data.length) return undefined
    const n = data.length
    const sum = data.reduce((s, x) => s + x, 0)
    const mean = sum / n
    switch (property) {
      case 'sum':    return sum
      case 'count':  return n
      case 'mean':   return mean
      case 'min':    return Math.min(...data)
      case 'max':    return Math.max(...data)
      case 'median': {
        const sorted = [...data].sort((a, b) => a - b)
        return n % 2 === 0 ? (sorted[n/2-1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)]
      }
      case 'variance': return data.reduce((s, x) => s + (x - mean)**2, 0) / n
      case 'stddev': {
        const v = doc.computed.get(`${objectId}.variance`) as number | undefined
        return v !== undefined ? Math.sqrt(v) : Math.sqrt(data.reduce((s,x)=>s+(x-mean)**2,0)/n)
      }
      default: return undefined
    }
  },
}
