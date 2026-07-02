import { create, all } from "mathjs"
import type { SymbolicValue } from './types.js'

// ── mathjs singleton ──────────────────────────────────────────────────────────
// One shared instance across the entire engine.  Configuration: plain Array
// matrices (not mathjs Matrix objects) and native JS numbers (not BigNumber).

export const math = create(all)
math.config({ matrix: "Array", number: "number" })

// ── Scalar divide override ────────────────────────────────────────────────────
// A / B where B is a 1×1 matrix (e.g. inner-product result a'*a) must be
// treated as scalar division, not matrix right-division A*inv(B), which would
// try multiply(m×n, 1×1) and throw a dimension mismatch.
{
  const _div = (math.divide as (...args: unknown[]) => unknown).bind(math)
  math.import({
    divide(a: unknown, b: unknown) {
      const pb = (b && typeof (b as Record<string, unknown>).valueOf === "function")
        ? (b as { valueOf(): unknown }).valueOf()
        : b
      if (Array.isArray(pb)) {
        if (pb.length === 1 && Array.isArray(pb[0]) && (pb[0] as unknown[]).length === 1)
          return math.multiply(a as number, 1 / (pb[0] as number[])[0])
        if (pb.length === 1 && typeof pb[0] === "number")
          return math.multiply(a as number, 1 / pb[0])
      }
      return _div(a, b)
    },
  }, { override: true, wrap: false })
}

// ── Symbolic value predicates ─────────────────────────────────────────────────

export function isSymObj(v: unknown): v is SymbolicValue {
  return v != null && typeof v === 'object' && !Array.isArray(v) && '__sym' in v
}
export function isSymArr(v: unknown): v is SymbolicValue[] {
  return Array.isArray(v) && v.length > 0 && isSymObj(v[0])
}
export function isSym2DArr(v: unknown): v is SymbolicValue[][] {
  return Array.isArray(v) && v.length > 0 && Array.isArray(v[0]) && isSymObj((v[0] as unknown[])[0])
}
export function symShape(v: SymbolicValue | SymbolicValue[] | SymbolicValue[][]): [number, number] {
  if (isSym2DArr(v)) return [(v as SymbolicValue[][]).length, (v as SymbolicValue[][])[0].length]
  if (isSymArr(v)) return [1, (v as SymbolicValue[]).length]
  return (v as SymbolicValue).__shape ?? [1, 1]
}

// ── Math override: size / length / numel / isempty ───────────────────────────
// Symbolic objects/arrays must not crash the engine when passed to size() etc.
{
  const _size = (math.size as (...args: unknown[]) => unknown).bind(math)
  math.import({
    size(x: unknown, dim?: unknown) {
      if (isSymObj(x) || isSymArr(x) || isSym2DArr(x)) {
        const s = symShape(x as SymbolicValue)
        return dim !== undefined ? (s[Number(dim) - 1] ?? 1) : s
      }
      return dim !== undefined ? _size(x, dim) : _size(x)
    },
    length(x: unknown) {
      if (isSymObj(x) || isSymArr(x) || isSym2DArr(x)) return Math.max(...symShape(x as SymbolicValue))
      const p = (x && typeof (x as Record<string, unknown>).valueOf === 'function') ? (x as { valueOf(): unknown }).valueOf() : x
      if (Array.isArray(p)) return Math.max(p.length, Array.isArray(p[0]) ? (p[0] as unknown[]).length : 0)
      return 1
    },
    numel(x: unknown) {
      if (isSymObj(x) || isSymArr(x) || isSym2DArr(x)) { const s = symShape(x as SymbolicValue); return s[0] * s[1] }
      const p = (x && typeof (x as Record<string, unknown>).valueOf === 'function') ? (x as { valueOf(): unknown }).valueOf() : x
      if (!Array.isArray(p)) return 1
      return (p as unknown[]).flat(Infinity).length
    },
    isempty(x: unknown) {
      if (isSymObj(x)) return 0
      if (isSymArr(x)) return (x as unknown[]).length === 0 ? 1 : 0
      const p = (x && typeof (x as Record<string, unknown>).valueOf === 'function') ? (x as { valueOf(): unknown }).valueOf() : x
      return (!p || (Array.isArray(p) && (p as unknown[]).flat(Infinity).length === 0)) ? 1 : 0
    },
  }, { override: true, wrap: false })
}
