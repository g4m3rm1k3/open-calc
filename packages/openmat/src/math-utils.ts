import { math } from './math-instance.js'
import type { ComplexLike } from './types.js'

// ── Pure value helpers ────────────────────────────────────────────────────────

/** Unwraps any mathjs wrapper (Matrix, Unit, Complex…) to a plain JS value. */
export function toPlain(value: unknown): unknown {
  // Check re/im shape BEFORE unwrapping via valueOf(): mathjs's
  // Complex.prototype.valueOf() returns a display string, not the numeric value.
  if (value && typeof value === "object" && !Array.isArray(value) &&
      "re" in value && "im" in value && Object.keys(value).length <= 3) {
    return value
  }
  if (value && typeof (value as Record<string, unknown>).valueOf === "function") {
    const p = (value as { valueOf(): unknown }).valueOf()
    if (p !== value) return toPlain(p)
  }
  if (Array.isArray(value)) {
    const mapped = value.map(toPlain)
    // Nx1 column vectors → 1D flat arrays so r(i) indexing works correctly
    if (mapped.length > 0 && mapped.every(v => Array.isArray(v) && (v as unknown[]).length === 1))
      return mapped.map(v => (v as unknown[])[0])
    return mapped
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, toPlain(v)]))
  }
  return value
}

export function isComplexLike(v: unknown): v is ComplexLike {
  return v != null && typeof v === "object" && "re" in v && "im" in v
}

export function realValue(v: unknown): number {
  if (typeof v === "number") return v
  if (typeof v === "bigint") return Number(v)
  if (isComplexLike(v)) return Number(v.re ?? 0)
  return Number(v)
}

export function isMatrix(value: unknown): value is number[][] {
  return Array.isArray(value) && Array.isArray(value[0])
}

export function isCollection(value: unknown): boolean {
  return Array.isArray(toPlain(value))
}

export function mapDeep(value: unknown, fn: (x: unknown) => unknown): unknown {
  const p = toPlain(value)
  if (Array.isArray(p)) return p.map(item => mapDeep(item, fn))
  return fn(p)
}

// ── Array / vector helpers ────────────────────────────────────────────────────

/** Converts any value to a flat array of numbers (handles matrices, column vectors, scalars). */
export function normalizeVector(value: unknown): number[] {
  const plain = toPlain(value)
  if (!Array.isArray(plain)) return [realValue(plain)]
  if (Array.isArray(plain[0]) && (plain[0] as unknown[]).length === 1)
    return plain.map(row => realValue((row as unknown[])[0]))
  return (plain as unknown[]).flat().map(realValue)
}

export function flattenNumbers(value: unknown): number[] {
  const plain = toPlain(value)
  if (!Array.isArray(plain)) return [realValue(plain)]
  return (plain as unknown[]).flat(Infinity).map(realValue)
}

export function toNumericMatrix(value: unknown): number[][] | null {
  const plain = toPlain(value)
  if (!Array.isArray(plain) || !plain.length) return null
  if (!Array.isArray(plain[0]))
    return (plain as unknown[]).map(entry => [realValue(entry)])
  return (plain as unknown[][]).map(row => (row as unknown[]).map(entry => realValue(entry)))
}

export function inferSize(value: unknown): [number, number] {
  const plain = toPlain(value)
  if (plain == null) return [0, 0]
  if (!Array.isArray(plain)) return [1, 1]
  if (!plain.length) return [0, 0]
  if (Array.isArray(plain[0]))
    return [plain.length, Math.max(...(plain as unknown[][]).map(row => (row as unknown[]).length), 0)]
  return [1, plain.length]
}

export function makeDiagonal(values: unknown): number[][] {
  const vector = normalizeVector(values)
  return vector.map((value, index) => vector.map((_, column) => (column === index ? value : 0)))
}

export function makeRandomArray(shape: number[]): unknown {
  if (shape.length === 0) return Math.random()
  const [head, ...tail] = shape
  return Array.from({ length: Number(head) }, () => makeRandomArray(tail))
}

export function toColumnSeries(value: unknown): number[][] {
  const plain = toPlain(value)
  if (!Array.isArray(plain)) return [[realValue(plain)]]
  if (!isMatrix(plain)) return [normalizeVector(plain)]
  const columnCount = Math.max(...(plain as number[][]).map(row => row.length), 0)
  return Array.from({ length: columnCount }, (_, column) =>
    (plain as number[][]).map(row => realValue(row[column] ?? 0)),
  )
}

// ── Range / grid builders ─────────────────────────────────────────────────────

export function buildLinspace(start: unknown, stop: unknown, count = 100): number[] {
  const n = Math.max(1, Math.round(Number(count)))
  const a = Number(start), b = Number(stop)
  if (n === 1) return [a]
  const step = (b - a) / (n - 1)
  return Array.from({ length: n }, (_, index) => a + step * index)
}

export function buildLogspace(a: unknown, b: unknown, count = 50): number[] {
  return buildLinspace(Number(a), Number(b), count).map(value => 10 ** value)
}

export function meshgrid(xValues: unknown, yValues: unknown = xValues): { __multi: [number[][], number[][]] } {
  const x = normalizeVector(xValues)
  const y = normalizeVector(yValues)
  return {
    __multi: [
      y.map(() => [...x]),
      y.map(value => Array.from({ length: x.length }, () => value)),
    ],
  }
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// ── Vector / matrix operations ────────────────────────────────────────────────

export function diffArray(value: unknown): number[] {
  const vector = normalizeVector(value)
  return vector.slice(1).map((entry, index) => entry - vector[index])
}

export function cumulative(
  values: unknown,
  reducer: (acc: number, v: number) => number,
  initial: number | null,
): number[] {
  const vector = normalizeVector(values)
  const output: number[] = []
  let acc = initial as number
  vector.forEach((value, index) => {
    acc = index === 0 && initial == null ? value : reducer(acc, value)
    output.push(acc)
  })
  return output
}

export function dotProduct(a: unknown, b: unknown): number {
  const left = normalizeVector(a), right = normalizeVector(b)
  const length = Math.min(left.length, right.length)
  return Array.from({ length }, (_, index) => left[index] * right[index]).reduce((sum, v) => sum + v, 0)
}

export function crossProduct(a: unknown, b: unknown): [number, number, number] {
  const [ax, ay, az] = normalizeVector(a)
  const [bx, by, bz] = normalizeVector(b)
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]
}

export function dotMultiply(a: unknown, b: unknown): unknown {
  const pa = toPlain(a), pb = toPlain(b)
  if (Array.isArray(pa) && Array.isArray(pb)) return pa.map((v, i) => dotMultiply(v, (pb as unknown[])[i] ?? pb))
  if (Array.isArray(pa)) return pa.map(v => dotMultiply(v, pb))
  if (Array.isArray(pb)) return pb.map(v => dotMultiply(pa, v))
  return Number(pa) * Number(pb)
}

export function dotDivide(a: unknown, b: unknown): unknown {
  const pa = toPlain(a), pb = toPlain(b)
  if (Array.isArray(pa) && Array.isArray(pb)) return pa.map((v, i) => dotDivide(v, (pb as unknown[])[i] ?? pb))
  if (Array.isArray(pa)) return pa.map(v => dotDivide(v, pb))
  if (Array.isArray(pb)) return pb.map(v => dotDivide(pa, v))
  return Number(pa) / Number(pb)
}

export function dotPow(a: unknown, b: unknown): unknown {
  const pa = toPlain(a), pb = toPlain(b)
  if (Array.isArray(pa) && Array.isArray(pb)) return pa.map((v, i) => dotPow(v, (pb as unknown[])[i] ?? pb))
  if (Array.isArray(pa)) return pa.map(v => dotPow(v, pb))
  if (Array.isArray(pb)) return pb.map(v => dotPow(pa, v))
  return Number(pa) ** Number(pb)
}

// ── Polynomial & interpolation ────────────────────────────────────────────────

export function polyfit(xValues: unknown, yValues: unknown, degree: unknown): number[] {
  const x = normalizeVector(xValues), y = normalizeVector(yValues)
  const n = Math.max(0, Math.round(Number(degree)))
  const vandermonde = x.map(value => Array.from({ length: n + 1 }, (_, index) => value ** (n - index)))
  const coeffs = toPlain(math.multiply(math.pinv(vandermonde), y))
  return normalizeVector(coeffs)
}

export function polyval(coefficients: unknown, xValues: unknown): number[] {
  const coeffs = normalizeVector(coefficients)
  return normalizeVector(xValues).map(value => coeffs.reduce((acc, coefficient) => acc * value + coefficient, 0))
}

export function interp1Array(x: unknown, y: unknown, xi: unknown): number[] {
  const xv = normalizeVector(x), yv = normalizeVector(y), xiv = normalizeVector(xi)
  return xiv.map(xq => {
    if (xq <= xv[0]) return yv[0]
    if (xq >= xv[xv.length - 1]) return yv[yv.length - 1]
    let lo = 0
    for (let i = 0; i < xv.length - 1; i++) { if (xv[i] <= xq && xq <= xv[i + 1]) { lo = i; break } }
    const t = (xq - xv[lo]) / (xv[lo + 1] - xv[lo])
    return yv[lo] + t * (yv[lo + 1] - yv[lo])
  })
}

export function trapzArray(x: unknown, y: unknown = null): number {
  const xv = y == null ? null : normalizeVector(x)
  const yv = normalizeVector(y == null ? x : y)
  if (yv.length < 2) return 0
  let total = 0
  for (let i = 0; i < yv.length - 1; i++) {
    const dx = xv ? xv[i + 1] - xv[i] : 1
    total += dx * (yv[i] + yv[i + 1]) / 2
  }
  return total
}

export function gradientArray(value: unknown, spacing: unknown = 1): number[] {
  const v = normalizeVector(value)
  if (v.length <= 1) return v.map(() => 0)
  const h = Number(spacing) || 1
  return v.map((entry, index) => {
    if (index === 0) return (v[1] - v[0]) / h
    if (index === v.length - 1) return (v[index] - v[index - 1]) / h
    return (v[index + 1] - v[index - 1]) / (2 * h)
  })
}
