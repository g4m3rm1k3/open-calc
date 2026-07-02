import { format as mathFormat } from "mathjs"
import { isSymObj } from './math-instance.js'
import { toPlain, isComplexLike, inferSize } from './math-utils.js'
import type { WorkspaceEntry } from './types.js'

// ── sprintf-style formatting ──────────────────────────────────────────────────

export function sprintfFormat(fmt: unknown, ...args: unknown[]): string {
  // Flatten matrix/vector args column-major like real MATLAB
  const flatArgs = args.flatMap(a => {
    const p = toPlain(a)
    if (!Array.isArray(p)) return [p]
    if (Array.isArray(p[0])) {
      const rows = p.length, cols = (p[0] as unknown[]).length
      const out: unknown[] = []
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) out.push((p[r] as unknown[])[c])
      return out
    }
    return p as unknown[]
  })
  let i = 0
  return String(fmt).replace(/%[\d.]*[diouxXeEfgGs]/g, m => {
    const val = flatArgs[i++]
    if (val == null) return m
    if (m.endsWith("d") || m.endsWith("i")) return Math.round(Number(val)).toString()
    if (m.endsWith("f") || m.endsWith("e") || m.endsWith("g")) {
      const prec = (m.match(/\.(\d+)/) ?? [, "6"])[1]
      return Number(val).toFixed(Number(prec))
    }
    return String(val)
  })
}

// ── Value display formatting ──────────────────────────────────────────────────

export function formatValue(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  // Symbolic row vector
  if (Array.isArray(value) && value.length > 0 && isSymObj(value[0]))
    return '[' + (value as Array<{ __sym: string }>).map(v => v.__sym).join(', ') + ']'
  // Symbolic matrix
  if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0]) && isSymObj((value[0] as unknown[])[0]))
    return '[' + (value as Array<Array<{ __sym: string }>>).map(row => '[' + row.map(v => v.__sym).join(', ') + ']').join(', ') + ']'
  // Symbolic scalar
  if (value && typeof value === "object" && "__sym" in value)
    return String((value as { __sym: string }).__sym)
  // Multi-value tuple
  if (value && typeof value === "object" && "__multi" in value)
    return (value as { __multi: unknown[] }).__multi.map(item => formatValue(item)).join("\n\n")
  const plain = toPlain(value)
  try { return mathFormat(plain, { precision: 6, notation: "auto" }) }
  catch { return JSON.stringify(plain, null, 2) }
}

// ── Workspace metadata helpers ────────────────────────────────────────────────

export function inferClass(value: unknown): string {
  const plain = toPlain(value)
  if (plain == null) return "null"
  if (typeof plain === "number") return "double"
  if (typeof plain === "string") return "char"
  if (typeof plain === "boolean") return "logical"
  if (isComplexLike(plain)) return "complex double"
  if (Array.isArray(plain)) return "double array"
  if (plain && typeof plain === "object" && "__multi" in plain) return "tuple"
  return typeof plain
}

export function estimateBytes(value: unknown): number {
  const plain = toPlain(value)
  try { return new Blob([JSON.stringify(plain)]).size }
  catch { return 0 }
}

export function summarizeValue(value: unknown): string {
  const text = formatValue(value).replace(/\s+/g, " ").trim()
  return text.length > 90 ? `${text.slice(0, 87)}...` : text || "(empty)"
}

// ── Workspace snapshot ────────────────────────────────────────────────────────

export function buildWorkspaceSnapshot(
  parser: { get(name: string): unknown },
  variables: Set<string>,
): WorkspaceEntry[] {
  return Array.from(variables)
    .sort((a, b) => a.localeCompare(b))
    .map(name => {
      const value = toPlain(parser.get(name))
      const size = inferSize(value)
      return {
        name,
        className: inferClass(value),
        size,
        bytes: estimateBytes(value),
        preview: summarizeValue(value),
        value,
      } as WorkspaceEntry
    })
}
