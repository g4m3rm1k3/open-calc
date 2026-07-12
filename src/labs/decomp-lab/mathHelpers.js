// Pure helpers with no equivalent in the @opencalc/openmat engine — actual
// decomposition/numerics (SVD, rank, condition number, polyfit) come from
// ../../engines/openmat/openmatEngine.js instead of being hand-rolled here.

export const zeros = (r, c) => Array.from({ length: r }, () => Array(c).fill(0))

export const fmt = (n, d = 3) => {
  const v = Math.abs(n) < 5e-5 ? 0 : n
  return (v >= 0 ? ' ' : '') + v.toFixed(d)
}

// Rebuilds a rank-k approximation of A from the engine's SVD result.
// svdDecomp() returns U (m×n, columns = left singular vectors) and V
// (n×n, columns = right singular vectors) — NOT Vt — so this reads column i
// from each rather than row i from a transposed V.
export function svdReconstruct(U, singularValuesFlat, V, k) {
  const m = U.length
  const n = V.length
  const R = zeros(m, n)
  for (let i = 0; i < k; i++) {
    const sigma = singularValuesFlat[i]
    if (!sigma || sigma < 1e-10) break
    const ui = U.map(row => row[i])
    const vi = V.map(row => row[i])
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) R[r][c] += sigma * ui[r] * vi[c]
    }
  }
  return R
}

// Synthetic test image so the lab has something interesting to decompose
// before a student uploads their own — gradient + two blobs + a stripe
// pattern + a diagonal band gives a handful of genuinely separable "layers"
// for the singular-value bar chart to be interesting rather than flat.
export function makeTestImage(m, n) {
  const A = zeros(m, n)
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const x = c / n, y = r / m
      const grad = 120 * x + 80 * y
      const circ1 = Math.exp(-((x - 0.3) ** 2 + (y - 0.35) ** 2) / 0.03) * 180
      const circ2 = Math.exp(-((x - 0.7) ** 2 + (y - 0.65) ** 2) / 0.025) * 150
      const stripe = 40 * Math.sin(8 * Math.PI * x) * Math.cos(4 * Math.PI * y)
      const diag = 60 * Math.max(0, 1 - Math.abs(x + y - 1) * 3)
      A[r][c] = Math.min(255, Math.max(0, grad + circ1 + circ2 + stripe + diag))
    }
  }
  return A
}

// Parses pasted/uploaded "x,y" data — one point per line, comma or
// whitespace separated. Used by the Least Squares tab's data import.
export function parseXYText(text) {
  const points = []
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const parts = line.split(/[,\s]+/).filter(Boolean)
    if (parts.length < 2) continue
    const x = Number(parts[0]), y = Number(parts[1])
    if (Number.isFinite(x) && Number.isFinite(y)) points.push({ x, y })
  }
  return points
}
