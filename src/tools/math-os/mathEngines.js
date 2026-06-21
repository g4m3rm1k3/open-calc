// ─── Math engines for MathOS ─────────────────────────────────────────────────
// All algorithms inline — no imports from other tools
import { evaluate as mathEval, fraction as mathFraction, simplify as mathSimplify } from 'mathjs'

// ══════════════════════════════════════════════════════════════════════════════
// SYMBOLIC OPERATIONS (mathjs)
// ══════════════════════════════════════════════════════════════════════════════

export function simplifyExpr(expr) {
  try {
    const node = mathSimplify(expr)
    return { ok: true, result: node.toString(), latex: node.toTex({ parenthesis: 'auto' }) }
  } catch(e) { return { ok: false, error: e.message } }
}

export function expandExpr(expr) {
  try {
    // mathjs simplify with expand rules
    const expanded = mathSimplify(expr, [
      { l: 'n1*(n2+n3)', r: 'n1*n2+n1*n3' },
      { l: '(n1+n2)*n3', r: 'n1*n3+n2*n3' },
    ])
    return { ok: true, result: expanded.toString(), latex: expanded.toTex({ parenthesis: 'auto' }) }
  } catch(e) {
    // Fallback: just simplify
    try {
      const node = mathSimplify(expr)
      return { ok: true, result: node.toString(), latex: node.toTex({ parenthesis: 'auto' }) }
    } catch(e2) { return { ok: false, error: e2.message } }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ══════════════════════════════════════════════════════════════════════════════

export function fmtNum(n, prec = 10) {
  if (!isFinite(n)) return String(n)
  const s = parseFloat(n.toPrecision(prec))
  if (s !== 0 && (Math.abs(s) >= 1e10 || Math.abs(s) < 1e-6)) return n.toExponential(6)
  return String(s)
}

export function buildScope(angleMode, ans, vars) {
  const numVars = Object.fromEntries(Object.entries(vars).filter(([, v]) => typeof v === 'number'))
  const scope = { ans, Ans: ans, pi: Math.PI, e: Math.E, ...numVars }
  if (angleMode === 'DEG') {
    const d = Math.PI / 180
    scope.sin  = a => Math.sin(a * d); scope.cos = a => Math.cos(a * d)
    scope.tan  = a => Math.tan(a * d); scope.asin = a => Math.asin(a) / d
    scope.acos = a => Math.acos(a) / d; scope.atan = a => Math.atan(a) / d
  }
  return scope
}

export function calcEval(expr, scope) {
  const cleaned = expr
    .replace(/(\d)([a-zA-Z(])/g, '$1*$2').replace(/\)(\d|[a-zA-Z(])/g, ')*$1')
    .replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-')
  return mathEval(cleaned, scope)
}

export function nDeriv(expr, variable, value, scope) {
  const h = 1e-7
  const f = v => Number(calcEval(expr, { ...scope, [variable]: v }))
  return (f(value + h) - f(value - h)) / (2 * h)
}

export function fnInt(expr, variable, a, b, scope, n = 1000) {
  const f = v => Number(calcEval(expr, { ...scope, [variable]: v }))
  const h = (b - a) / n
  let sum = f(a) + f(b)
  for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  return (h / 3) * sum
}

export function solveZero(expr, variable, guess, scope, maxIter = 60) {
  let x = guess
  for (let i = 0; i < maxIter; i++) {
    const h = 1e-7
    const fx  = Number(calcEval(expr, { ...scope, [variable]: x }))
    const fpx = (Number(calcEval(expr, { ...scope, [variable]: x + h })) - Number(calcEval(expr, { ...scope, [variable]: x - h }))) / (2 * h)
    if (Math.abs(fpx) < 1e-15 || !isFinite(fpx)) break
    const xNew = x - fx / fpx
    if (!isFinite(xNew)) break
    if (Math.abs(xNew - x) < 1e-10) return xNew
    x = xNew
  }
  return x
}

// ══════════════════════════════════════════════════════════════════════════════
// LINEAR ALGEBRA
// ══════════════════════════════════════════════════════════════════════════════

function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b] } return a }

export function toFrac(x, maxD = 120) {
  if (!isFinite(x)) return x > 0 ? '\\infty' : '-\\infty'
  if (Math.abs(x) < 1e-9) return '0'
  const neg = x < 0; const ax = Math.abs(x)
  for (let d = 1; d <= maxD; d++) {
    const n = Math.round(ax * d)
    if (Math.abs(n / d - ax) < 1e-9) {
      const g = gcd(n, d); const nn = n / g; const dd = d / g
      if (dd === 1) return neg ? String(-nn) : String(nn)
      return (neg ? '-' : '') + `\\frac{${nn}}{${dd}}`
    }
  }
  return (Math.abs(x) < 1000 && Math.abs(x - Math.round(x)) < 1e-9)
    ? String(Math.round(x)) : x.toFixed(4).replace(/\.?0+$/, '')
}

export function matLatex(M, prefix = '') {
  const rows = M.map(row => row.map(v => toFrac(v)).join(' & ')).join(' \\\\ ')
  return `${prefix}\\begin{pmatrix} ${rows} \\end{pmatrix}`
}

export function vecLatex(v, name = '') {
  return `${name ? name + ' = ' : ''}\\begin{pmatrix}${v.map(toFrac).join('\\\\')}\\end{pmatrix}`
}

function augLatex(A, B) {
  const colSpec = Array(A[0].length).fill('r').join('') + '|' + Array(B[0].length).fill('r').join('')
  const rows = A.map((row, i) => [...row, ...B[i]].map(v => toFrac(v)).join(' & ')).join(' \\\\ ')
  return `\\left(\\begin{array}{${colSpec}} ${rows} \\end{array}\\right)`
}

function parseEntry(s) {
  s = s.trim(); if (s === '' || s === '-') return NaN
  if (s.includes('/')) { const [n, d] = s.split('/').map(Number); return isNaN(n) || isNaN(d) || d === 0 ? NaN : n / d }
  return parseFloat(s)
}

export function parseMatrix(grid) { return grid.map(row => row.map(v => typeof v === 'string' ? parseEntry(v) : v)) }
export function hasNaN(M) { return M.some(row => row.some(v => isNaN(v))) }
function copyM(M) { return M.map(r => [...r]) }
export function identity(n) { return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0)) }
export function transpose(M) { return M[0].map((_, j) => M.map(r => r[j])) }
export function matMul(A, B) {
  const m = A.length, k = A[0].length, n = B[0].length
  if (B.length !== k) throw new Error('Incompatible dimensions')
  return Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) =>
    Array.from({ length: k }, (_, p) => A[i][p] * B[p][j]).reduce((s, v) => s + v, 0)))
}
function dotVec(u, v) { return u.reduce((s, x, i) => s + x * v[i], 0) }
function frobeniusNorm(M) { return Math.sqrt(M.reduce((s, row) => s + row.reduce((r, x) => r + x * x, 0), 0)) }

function det2x2(M) { const [[a,b],[c,d]] = M; return a*d - b*c }
function det3x3(M) { const [[a,b,c],[d,e,f],[g,h,i]] = M; return a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g) }
function detNxN(M) {
  const n = M.length
  if (n === 1) return M[0][0]; if (n === 2) return det2x2(M)
  let r = 0
  for (let j = 0; j < n; j++) { const minor = M.slice(1).map(row => row.filter((_,c) => c !== j)); r += M[0][j] * Math.pow(-1,j) * detNxN(minor) }
  return r
}

export function solveRREF(inputM, augment = null) {
  const M = augment ? inputM.map((r, i) => [...r, ...augment[i]]) : copyM(inputM)
  const rows = M.length, cols = M[0].length, pivotCols = [], steps = []
  const nCols = augment ? inputM[0].length : cols
  const snapshot = () => augment
    ? augLatex(M.map(r => r.slice(0, inputM[0].length)), M.map(r => r.slice(inputM[0].length)))
    : matLatex(M)
  steps.push({ label: 'Start', latex: snapshot() })
  let pivotRow = 0
  for (let col = 0; col < nCols && pivotRow < rows; col++) {
    let maxRow = pivotRow
    for (let r = pivotRow + 1; r < rows; r++) { if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r }
    if (Math.abs(M[maxRow][col]) < 1e-10) continue
    if (maxRow !== pivotRow) { [M[pivotRow], M[maxRow]] = [M[maxRow], M[pivotRow]]; steps.push({ label: `Swap R_{${pivotRow+1}} \\leftrightarrow R_{${maxRow+1}}`, latex: snapshot() }) }
    const scale = M[pivotRow][col]
    if (Math.abs(scale - 1) > 1e-10) { for (let c = 0; c < cols; c++) M[pivotRow][c] /= scale; steps.push({ label: `R_{${pivotRow+1}} \\leftarrow \\frac{1}{${toFrac(scale)}} R_{${pivotRow+1}}`, latex: snapshot() }) }
    for (let r = 0; r < rows; r++) {
      if (r === pivotRow || Math.abs(M[r][col]) < 1e-10) continue
      const factor = M[r][col]
      for (let c = 0; c < cols; c++) M[r][c] -= factor * M[pivotRow][c]
      steps.push({ label: `R_{${r+1}} \\leftarrow R_{${r+1}} - (${toFrac(factor)})\\,R_{${pivotRow+1}}`, latex: snapshot() })
    }
    pivotCols.push(col); pivotRow++
  }
  return { result: M, steps, rank: pivotCols.length, pivotCols }
}

export function computeInverseMatrix(M) {
  const n = M.length
  if (n !== M[0].length) return null
  const { result: aug, rank } = solveRREF(copyM(M), identity(n))
  if (rank < n) return null
  return aug.map(r => r.slice(n))
}

export function solveDeterminant(M) {
  const n = M.length
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{Determinant requires a square matrix.}' }]
  const steps = [{ label: 'Matrix', latex: matLatex(M, 'A = ') }]
  if (n === 2) {
    const [[a,b],[c,d]] = M; const val = a*d - b*c
    steps.push({ label: 'Formula for 2×2 determinant', latex: '\\det(A) = ad - bc' })
    steps.push({ label: 'Substitute values', latex: `= (${toFrac(a)})(${toFrac(d)}) - (${toFrac(b)})(${toFrac(c)})` })
    steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` })
    return steps
  }
  if (n === 3) {
    const [[a,b,c],[d,e,f],[g,h,i]] = M
    steps.push({ label: 'Cofactor expansion along row 1', latex: '\\det(A) = a_{11}\\,M_{11} - a_{12}\\,M_{12} + a_{13}\\,M_{13}' })
    const M11=e*i-f*h, M12=d*i-f*g, M13=d*h-e*g; const val = a*M11-b*M12+c*M13
    steps.push({ label: 'Compute 2×2 minors', latex: `M_{11}=${toFrac(M11)},\\;M_{12}=${toFrac(M12)},\\;M_{13}=${toFrac(M13)}` })
    steps.push({ label: 'Combine', latex: `= ${toFrac(a)}\\cdot${toFrac(M11)} - ${toFrac(b)}\\cdot${toFrac(M12)} + ${toFrac(c)}\\cdot${toFrac(M13)}` })
    steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` })
    return steps
  }
  const val = detNxN(M)
  steps.push({ label: `${n}×${n} — recursive cofactor expansion`, latex: `\\det(A) = ${toFrac(val)}` })
  steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` })
  return steps
}

export function solveInverse(M) {
  const n = M.length
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{Inverse requires a square matrix.}' }]
  const steps = [{ label: 'Matrix', latex: matLatex(M, 'A = ') }]
  if (n === 2) {
    const [[a,b],[c,d]] = M; const det = a*d - b*c
    steps.push({ label: 'Step 1 — det(A)', latex: `\\det(A) = (${toFrac(a)})(${toFrac(d)}) - (${toFrac(b)})(${toFrac(c)}) = ${toFrac(det)}` })
    if (Math.abs(det) < 1e-10) { steps.push({ label: 'Result', latex: '\\det(A)=0 \\Rightarrow A \\text{ is singular (no inverse)}' }); return steps }
    const inv = [[d/det,-b/det],[-c/det,a/det]]
    steps.push({ label: 'Step 2 — Adjugate', latex: `\\text{adj}(A) = \\begin{pmatrix}${toFrac(d)}&${toFrac(-b)}\\\\${toFrac(-c)}&${toFrac(a)}\\end{pmatrix}` })
    steps.push({ label: 'Answer', latex: `\\boxed{A^{-1} = ${matLatex(inv)}}` }); return steps
  }
  const I = identity(n)
  steps.push({ label: 'Form [A \\mid I]', latex: augLatex(M, I) })
  const { result: aug, steps: rrefSteps, rank } = solveRREF(copyM(M), I)
  for (const s of rrefSteps.slice(1)) steps.push(s)
  if (rank < n) { steps.push({ label: 'Result', latex: '\\text{Singular — no inverse}' }); return steps }
  steps.push({ label: 'Answer', latex: `\\boxed{A^{-1} = ${matLatex(aug.map(r => r.slice(n)))}}` }); return steps
}

export function solveTranspose(M) {
  const T = transpose(M)
  return [{ label: 'Matrix', latex: matLatex(M, 'A = ') }, { label: 'Rule: (Aᵀ)ᵢⱼ = Aⱼᵢ', latex: matLatex(T, 'A^{\\top} = ') }]
}

export function solveTrace(M) {
  if (M.length !== M[0].length) return [{ label: 'Error', latex: '\\text{Trace requires a square matrix.}' }]
  const diag = M.map((r,i) => r[i]); const tr = diag.reduce((s,v) => s+v, 0)
  return [{ label: 'Matrix', latex: matLatex(M, 'A = ') }, { label: 'Trace = sum of diagonal', latex: `\\text{tr}(A) = ${diag.map(toFrac).join(' + ')} = ${toFrac(tr)}` }]
}

export function solveRank(M) {
  const { steps, rank } = solveRREF(M)
  steps.push({ label: 'Rank = number of pivots', latex: `\\boxed{\\text{rank}(A) = ${rank}}` }); return steps
}

export function solveNullSpace(M) {
  const n = M[0].length
  const { result, steps, rank, pivotCols } = solveRREF(copyM(M))
  const freeCols = Array.from({ length: n }, (_, i) => i).filter(i => !pivotCols.includes(i))
  if (freeCols.length === 0) { steps.push({ label: 'Null Space', latex: `\\text{rank}(A) = ${rank} = n \\Rightarrow \\text{Null}(A) = \\{\\mathbf{0}\\}` }); return steps }
  const nullVectors = freeCols.map(fc => { const v = Array(n).fill(0); v[fc] = 1; for (let r = 0; r < result.length; r++) { const pc = pivotCols[r]; if (pc !== undefined) v[pc] = -(result[r][fc]) } return v })
  steps.push({ label: `Null space basis (${freeCols.length} free variable${freeCols.length > 1 ? 's' : ''})`, latex: nullVectors.map((v, i) => vecLatex(v, `\\mathbf{n}_${i+1}`)).join(',\\;') }); return steps
}

export function solveColumnSpace(M) {
  const { pivotCols, steps } = solveRREF(copyM(M))
  const basis = pivotCols.map(c => M.map(r => r[c]))
  if (basis.length === 0) { steps.push({ label: 'Column space', latex: '\\text{Only the zero vector.}' }); return steps }
  steps.push({ label: 'Pivot columns of original A form a basis', latex: basis.map((v,i) => vecLatex(v, `\\mathbf{c}_${i+1}`)).join(',\\;') }); return steps
}

export function solveLU(M) {
  const n = M.length
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{LU requires a square matrix.}' }]
  const U = copyM(M); const L = identity(n); const steps = [{ label: 'Matrix', latex: matLatex(M, 'A = ') }]
  for (let col = 0; col < n; col++) {
    const pivot = U[col][col]
    if (Math.abs(pivot) < 1e-10) { steps.push({ label: 'Note', latex: `\\text{Zero pivot at row }${col+1}\\text{. LUP pivoting needed.}` }); return steps }
    for (let row = col+1; row < n; row++) {
      const factor = U[row][col] / pivot; L[row][col] = factor
      for (let c = col; c < n; c++) U[row][c] -= factor * U[col][c]
      steps.push({ label: `L_{${row+1}${col+1}} = ${toFrac(factor)}`, latex: `U = ${matLatex(U)}` })
    }
  }
  steps.push({ label: 'L matrix', latex: matLatex(L, 'L = ') })
  steps.push({ label: 'U matrix', latex: matLatex(U, 'U = ') })
  steps.push({ label: 'Verify', latex: `LU = ${matLatex(matMul(L, U))}` }); return steps
}

function qrDecomposeGS(M) {
  const n = M.length; const cols = M[0].map((_,j) => M.map(r => r[j])); const Q_cols = []
  const R = Array.from({ length: n }, () => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    let v = [...cols[j]]
    for (let i = 0; i < j; i++) { const r = dotVec(Q_cols[i], cols[j]); R[i][j] = r; v = v.map((x,k) => x - r * Q_cols[i][k]) }
    const norm = Math.sqrt(dotVec(v, v)); R[j][j] = norm
    Q_cols.push(norm < 1e-10 ? v : v.map(x => x / norm))
  }
  return { Q: Q_cols[0].map((_,i) => Q_cols.map(col => col[i])), R }
}

function qrIterate(M, maxIter = 200) {
  let A = copyM(M); const n = A.length; let Q_acc = identity(n)
  for (let iter = 0; iter < maxIter; iter++) {
    const { Q, R } = qrDecomposeGS(A); A = matMul(R, Q); Q_acc = matMul(Q_acc, Q)
    let offDiag = 0; for (let i = 1; i < n; i++) offDiag += Math.abs(A[i][i-1])
    if (offDiag < 1e-10) break
  }
  return { eigenvalues: A.map((r,i) => r[i]), eigenvectorMatrix: Q_acc }
}

export function solveEigenvalues(M) {
  const n = M.length
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{Eigenvalues require a square matrix.}' }]
  const steps = [{ label: 'Matrix', latex: matLatex(M, 'A = ') }]
  if (n === 2) {
    const [[a,b],[c,d]] = M; const tr = a+d, det = a*d-b*c
    steps.push({ label: 'Characteristic equation: det(A − λI) = 0', latex: `\\lambda^2 - (${toFrac(tr)})\\lambda + (${toFrac(det)}) = 0` })
    const disc = tr*tr - 4*det
    steps.push({ label: 'Discriminant', latex: `\\Delta = ${toFrac(disc)}` })
    if (disc < 0) { const re=tr/2, im=Math.sqrt(-disc)/2; steps.push({ label: 'Answer', latex: `\\boxed{\\lambda_{1,2} = ${toFrac(re)} \\pm ${toFrac(im)}\\,i}` }); return steps }
    const sq = Math.sqrt(disc); const l1=(tr+sq)/2, l2=(tr-sq)/2
    steps.push({ label: 'Eigenvalues', latex: `\\lambda_1=${toFrac(l1)},\\;\\lambda_2=${toFrac(l2)}` })
    for (const [idx,lam] of [[1,l1],[2,l2]]) {
      if (Math.abs(b) > 1e-10) steps.push({ label: `Eigenvector λ${idx}=${toFrac(lam)}`, latex: `\\mathbf{v}_${idx} = \\begin{pmatrix}${toFrac(-b)}\\\\${toFrac(a-lam)}\\end{pmatrix}` })
      else if (Math.abs(c) > 1e-10) steps.push({ label: `Eigenvector λ${idx}=${toFrac(lam)}`, latex: `\\mathbf{v}_${idx} = \\begin{pmatrix}${toFrac(d-lam)}\\\\${toFrac(-c)}\\end{pmatrix}` })
    }
    steps.push({ label: 'Answer', latex: `\\boxed{\\lambda_1=${toFrac(l1)},\\;\\lambda_2=${toFrac(l2)}}` }); return steps
  }
  if (n === 3) {
    const [[a,,c],[,e,],[g,,i]] = M; const tr = a+e+i; const det = det3x3(M)
    const [[a1,b1,c1],[d1,e1,f1],[g1,h1,i1]] = M
    const I2 = (a1*e1+a1*i1+e1*i1)-(b1*d1+c1*g1+f1*h1)
    steps.push({ label: 'Characteristic polynomial', latex: `p(\\lambda) = -\\lambda^3 + ${toFrac(tr)}\\lambda^2 - ${toFrac(I2)}\\lambda + ${toFrac(det)}` })
  }
  steps.push({ label: `Using QR iteration (${n}×${n})`, latex: `A_k = Q_k^\\top A_{k-1} Q_k \\to \\text{Schur form}` })
  const { eigenvalues, eigenvectorMatrix } = qrIterate(M)
  steps.push({ label: 'Eigenvalues', latex: eigenvalues.map((v,i) => `\\lambda_${i+1} = ${toFrac(v)}`).join(', \\quad ') })
  for (let i = 0; i < n; i++) { const col = eigenvectorMatrix.map(r => r[i]); steps.push({ label: `Eigenvector for λ${i+1} = ${toFrac(eigenvalues[i])}`, latex: vecLatex(col, `\\mathbf{v}_${i+1}`) }) }
  steps.push({ label: 'Answer', latex: `\\boxed{${eigenvalues.map((v,i) => `\\lambda_${i+1}=${toFrac(v)}`).join(',\\;')}}` }); return steps
}

export function solveQR(M) {
  const m = M.length, n = M[0].length; const steps = [{ label: 'Matrix', latex: matLatex(M, 'A = ') }]
  steps.push({ label: 'Goal: A = QR', latex: 'A = QR' })
  const cols = Array.from({ length: n }, (_, j) => M.map(r => r[j])); const Q_cols = []
  const R = Array.from({ length: n }, () => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    let v = [...cols[j]]
    for (let i = 0; i < j; i++) {
      const r = dotVec(Q_cols[i], cols[j]); R[i][j] = r; v = v.map((x,k) => x - r * Q_cols[i][k])
      steps.push({ label: `Col ${j+1}: subtract projection on q${i+1}`, latex: `r_{${i+1}${j+1}} = ${toFrac(r)}` })
    }
    const norm = Math.sqrt(dotVec(v, v)); R[j][j] = norm
    if (norm < 1e-10) { steps.push({ label: `Column ${j+1} is linearly dependent`, latex: `\\mathbf{v}_{${j+1}} \\approx \\mathbf{0}` }); Q_cols.push(Array(m).fill(0)) }
    else { const q = v.map(x => x / norm); Q_cols.push(q); steps.push({ label: `Normalize: q${j+1}`, latex: `r_{${j+1}${j+1}} = ${toFrac(norm)},\\quad \\mathbf{q}_{${j+1}} = ${vecLatex(q)}` }) }
  }
  const Q = Q_cols[0].map((_,i) => Q_cols.map(col => col[i]))
  steps.push({ label: 'Q (orthonormal columns)', latex: matLatex(Q, 'Q = ') })
  steps.push({ label: 'R (upper triangular)', latex: matLatex(R, 'R = ') })
  steps.push({ label: 'Verify: QR = A', latex: `QR = ${matLatex(matMul(Q, R))}` }); return steps
}

export function solveSVD(M) {
  const m = M.length, n = M[0].length; const steps = [{ label: 'Matrix', latex: matLatex(M, 'A = ') }]
  steps.push({ label: 'Goal: A = UΣVᵀ', latex: 'A = U\\Sigma V^\\top' })
  const Mt = transpose(M); const MtM = matMul(Mt, M)
  steps.push({ label: 'Step 1: Compute AᵀA', latex: matLatex(MtM, 'A^\\top A = ') })
  if (n > 5 || m > 5) { steps.push({ label: 'Note', latex: '\\text{SVD shown for up to 5×5 matrices.}' }); return steps }
  const { eigenvalues: evals, eigenvectorMatrix: V } = qrIterate(MtM, 400)
  const order = evals.map((v,i) => ({ v: Math.max(0,v), i })).sort((a,b) => b.v - a.v)
  const sigmaVals = order.map(o => Math.sqrt(Math.max(0,o.v)))
  const V_sorted = order.map(o => V.map(r => r[o.i]))
  steps.push({ label: 'Singular values (√eigenvalues of AᵀA)', latex: sigmaVals.map((s,i) => `\\sigma_${i+1} = ${s < 1e-10 ? '0' : toFrac(s)}`).join(', \\quad ') })
  const V_mat = V_sorted[0].map((_,i) => V_sorted.map(col => col[i]))
  steps.push({ label: 'V (right singular vectors)', latex: matLatex(V_mat, 'V = ') })
  const r = sigmaVals.filter(s => s > 1e-10).length; const U_cols = []
  for (let i = 0; i < r; i++) { const vi = V_sorted.map(col => col[i]); const Avi = M.map(row => dotVec(row, vi)); U_cols.push(Avi.map(x => x / sigmaVals[i])) }
  const U_part = U_cols[0]?.map((_,i) => U_cols.map(col => col[i])) ?? [[0]]
  steps.push({ label: `U (first ${r} left singular vectors)`, latex: matLatex(U_part, 'U = ') })
  const Sigma = Array.from({ length: m }, (_,i) => Array.from({ length: n }, (_,j) => i === j && i < sigmaVals.length ? sigmaVals[i] : 0))
  steps.push({ label: 'Σ', latex: matLatex(Sigma, '\\Sigma = ') })
  steps.push({ label: 'Answer', latex: `\\boxed{A = U\\Sigma V^\\top,\\quad \\sigma = [${sigmaVals.map(s => s < 1e-10 ? '0' : toFrac(s)).join(', ')}]}` }); return steps
}

export function solveGramSchmidt(M) {
  const rows = M.length, cols = M[0].length; const steps = []
  const vectors = Array.from({ length: cols }, (_,c) => Array.from({ length: rows }, (_,r) => M[r][c])); const orth = []
  for (let k = 0; k < vectors.length; k++) {
    let w = [...vectors[k]]
    for (let j = 0; j < orth.length; j++) {
      const num = dotVec(vectors[k], orth[j]); const den = dotVec(orth[j], orth[j])
      if (Math.abs(den) < 1e-10) continue
      const coeff = num/den; w = w.map((x,i) => x - coeff * orth[j][i])
      steps.push({ label: `Col ${k+1}: subtract proj on u${j+1}`, latex: `\\mathbf{w}_${k+1} \\leftarrow \\mathbf{w}_${k+1} - ${toFrac(coeff)}\\,\\mathbf{u}_${j+1}` })
    }
    const norm = Math.sqrt(dotVec(w, w)); if (norm < 1e-10) continue
    const u = w.map(x => x / norm); orth.push(u)
    steps.push({ label: `Normalize: u${orth.length}`, latex: vecLatex(u, `\\mathbf{u}_${orth.length}`) })
  }
  if (orth.length === 0) { steps.push({ label: 'Result', latex: '\\text{No independent vectors.}' }); return steps }
  steps.push({ label: 'Orthonormal basis', latex: orth.map((u,i) => vecLatex(u, `\\mathbf{u}_${i+1}`)).join('\\;') }); return steps
}

export function solveConditionNumber(M) {
  if (M.length !== M[0].length) return [{ label: 'Error', latex: '\\text{Condition number requires square matrix.}' }]
  const inv = computeInverseMatrix(M)
  if (!inv) return [{ label: 'Condition number', latex: '\\kappa(A)=\\infty\\;\\text{(singular)}' }]
  const nA = frobeniusNorm(M), nInv = frobeniusNorm(inv)
  return [{ label: 'Definition', latex: '\\kappa_F(A)=\\|A\\|_F\\cdot\\|A^{-1}\\|_F' }, { label: 'Answer', latex: `\\boxed{\\kappa_F(A)=${toFrac(nA * nInv)}}` }]
}

export function solveMatrixPower(M, n) {
  if (M.length !== M[0].length) return [{ label: 'Error', latex: '\\text{Matrix power requires square matrix.}' }]
  const steps = []
  if (!Number.isInteger(n)) { steps.push({ label: 'Error', latex: '\\text{n must be an integer.}' }); return steps }
  let base = M
  if (n < 0) { const inv = computeInverseMatrix(M); if (!inv) { steps.push({ label: 'Error', latex: '\\text{A is singular — negative powers undefined.}' }); return steps }; base = inv; n = Math.abs(n); steps.push({ label: 'Negative power', latex: `A^{-n} = (A^{-1})^{${n}}` }) }
  const size = M.length; let result = identity(size)
  if (n === 0) { steps.push({ label: 'Answer', latex: `A^0 = I = ${matLatex(result)}` }); return steps }
  steps.push({ label: 'Base', latex: matLatex(base, 'A = ') })
  for (let i = 1; i <= n; i++) { result = matMul(result, base); if (n <= 5 || i === n) steps.push({ label: `Power ${i}`, latex: `A^{${i}} = ${matLatex(result)}` }) }
  steps.push({ label: 'Answer', latex: `\\boxed{A^{${n}} = ${matLatex(result)}}` }); return steps
}

export function solveCharPoly(M) {
  const n = M.length
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{Char poly requires a square matrix.}' }]
  const steps = [{ label: 'Matrix', latex: matLatex(M, 'A = ') }]
  if (n === 2) { const tr = M[0][0]+M[1][1], det = det2x2(M); steps.push({ label: 'p(λ) = det(A − λI)', latex: `p(\\lambda)=\\lambda^2-${toFrac(tr)}\\lambda+${toFrac(det)}` }); return steps }
  if (n === 3) {
    const [[a,b,c],[d,e,f],[g,h,i]] = M; const tr = a+e+i; const det = det3x3(M)
    const I2 = (a*e+a*i+e*i)-(b*d+c*g+f*h)
    steps.push({ label: 'p(λ) = det(A − λI)', latex: `p(\\lambda)=-\\lambda^3+${toFrac(tr)}\\lambda^2-${toFrac(I2)}\\lambda+${toFrac(det)}` }); return steps
  }
  const tr = M.reduce((s,r,i) => s+r[i], 0); const det = detNxN(M)
  steps.push({ label: 'Key coefficients', latex: `\\text{tr}(A)=${toFrac(tr)},\\;\\det(A)=${toFrac(det)}` }); return steps
}

export function solveMultiply(A, B) {
  const steps = [{ label: 'Matrices', latex: `A=${matLatex(A)},\\;B=${matLatex(B)}` }]
  const m = A.length, n = B[0].length, k = B.length
  if (A[0].length !== k) { steps.push({ label: 'Error', latex: `\\text{A is }${m}\\times${A[0].length}\\text{ but B is }${k}\\times${n}` }); return steps }
  steps.push({ label: 'Rule: (AB)ᵢⱼ = row i · col j', latex: '(AB)_{ij}=\\sum_{p}A_{ip}B_{pj}' })
  const C = Array.from({ length: m }, (_,i) => Array.from({ length: n }, (_,j) => A[i].reduce((s,v,p) => s+v*B[p][j], 0)))
  if (m <= 3 && n <= 3 && k <= 3) { for (let i=0;i<m;i++) for (let j=0;j<n;j++) { const terms = A[i].map((v,p) => `(${toFrac(v)})(${toFrac(B[p][j])})`).join('+'); steps.push({ label: `Entry (${i+1},${j+1})`, latex: `c_{${i+1}${j+1}}=${terms}=${toFrac(C[i][j])}` }) } }
  steps.push({ label: 'Answer', latex: `\\boxed{AB=${matLatex(C)}}` }); return steps
}

export function solveAdd(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) return [{ label: 'Error', latex: '\\text{Matrices must have identical dimensions.}' }]
  const C = A.map((row,r) => row.map((v,c) => v+B[r][c]))
  return [{ label: 'Matrices', latex: `A=${matLatex(A)},\\;B=${matLatex(B)}` }, { label: 'Answer', latex: `\\boxed{A+B=${matLatex(C)}}` }]
}

export function solveSubtract(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) return [{ label: 'Error', latex: '\\text{Matrices must have identical dimensions.}' }]
  const C = A.map((row,r) => row.map((v,c) => v-B[r][c]))
  return [{ label: 'Matrices', latex: `A=${matLatex(A)},\\;B=${matLatex(B)}` }, { label: 'Answer', latex: `\\boxed{A-B=${matLatex(C)}}` }]
}

export function solveScalarMul(A, scalar) {
  const C = A.map(row => row.map(v => v * scalar))
  return [{ label: 'Matrix', latex: matLatex(A, 'A = ') }, { label: 'Answer', latex: `\\boxed{${toFrac(scalar)}A=${matLatex(C)}}` }]
}

export function solveDot(A, B) {
  const u = A.flat(), v = B.flat()
  if (u.length !== v.length) return [{ label: 'Error', latex: '\\text{Vectors must have equal length.}' }]
  const result = u.reduce((s,ui,i) => s+ui*v[i], 0)
  return [
    { label: 'Vectors', latex: `${vecLatex(u, '\\mathbf{u}')},\\;${vecLatex(v, '\\mathbf{v}')}` },
    { label: 'Compute', latex: `\\mathbf{u}\\cdot\\mathbf{v} = ${u.map((ui,i) => `(${toFrac(ui)})(${toFrac(v[i])})`).join('+')} = ${toFrac(result)}` },
    { label: 'Answer', latex: `\\boxed{\\mathbf{u}\\cdot\\mathbf{v}=${toFrac(result)}}` },
  ]
}

export function solveCross(A, B) {
  const u = A.flat(), v = B.flat(); const steps = []
  steps.push({ label: 'Vectors', latex: `${vecLatex(u, '\\mathbf{u}')},\\;${vecLatex(v, '\\mathbf{v}')}` })
  if (u.length === 3) {
    const [a1,a2,a3] = u, [b1,b2,b3] = v
    const cx = a2*b3-a3*b2, cy = a3*b1-a1*b3, cz = a1*b2-a2*b1
    steps.push({ label: 'Determinant formula', latex: `\\mathbf{u}\\times\\mathbf{v} = \\begin{vmatrix}\\mathbf{i}&\\mathbf{j}&\\mathbf{k}\\\\${toFrac(a1)}&${toFrac(a2)}&${toFrac(a3)}\\\\${toFrac(b1)}&${toFrac(b2)}&${toFrac(b3)}\\end{vmatrix}` })
    const mag = Math.sqrt(cx*cx+cy*cy+cz*cz)
    steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{u}\\times\\mathbf{v} = ${vecLatex([cx,cy,cz])}}` })
    steps.push({ label: '‖u × v‖ = area of parallelogram', latex: `\\|\\mathbf{u}\\times\\mathbf{v}\\| = ${toFrac(mag)}` })
  } else if (u.length === 2) {
    const scalar = u[0]*v[1]-u[1]*v[0]
    steps.push({ label: '2D cross product (scalar)', latex: `\\mathbf{u}\\times\\mathbf{v} = u_1 v_2 - u_2 v_1 = ${toFrac(scalar)}` })
  }
  return steps
}

export function solveNorm(A) {
  const v = A.flat(); const sumSq = v.reduce((s,x) => s+x*x, 0); const norm = Math.sqrt(sumSq)
  return [
    { label: 'Vector', latex: vecLatex(v, '\\mathbf{v}') },
    { label: 'L2 Norm', latex: `\\|\\mathbf{v}\\|_2=\\sqrt{${v.map(x => `(${toFrac(x)})^2`).join('+')}} = ${toFrac(norm)}` },
    { label: 'L1 Norm', latex: `\\|\\mathbf{v}\\|_1 = ${toFrac(v.reduce((s,x) => s+Math.abs(x), 0))}` },
    { label: 'L∞ Norm', latex: `\\|\\mathbf{v}\\|_\\infty = ${toFrac(Math.max(...v.map(Math.abs)))}` },
    { label: 'Answer', latex: `\\boxed{\\|\\mathbf{v}\\|_2=${toFrac(norm)}}` },
  ]
}

export function solveLinearSystem(A, b) {
  const n = A[0].length; const bCol = b.map(r => Array.isArray(r) ? r : [r])
  const steps = [{ label: 'System', latex: `A=${matLatex(A)},\\;\\mathbf{b}=${matLatex(bCol)}` }]
  steps.push({ label: 'Form augmented matrix [A|b]', latex: augLatex(A, bCol) })
  const { result, steps: rrefSteps, rank, pivotCols } = solveRREF(copyM(A), bCol)
  for (const s of rrefSteps.slice(1)) steps.push(s)
  const inconsistent = result.some(row => { const leftZero = row.slice(0,n).every(v => Math.abs(v) < 1e-10); return leftZero && Math.abs(row[n]) > 1e-10 })
  if (inconsistent) { steps.push({ label: 'Conclusion', latex: '\\text{Inconsistent — no solution.}' }); return steps }
  if (rank < n) { const free = Array.from({length:n},(_,i)=>i).filter(i => !pivotCols.includes(i)); steps.push({ label: 'Infinitely many solutions', latex: `\\text{Free variables: }${free.map(i=>`x_{${i+1}}`).join(', ')}` }); return steps }
  const x = Array(n).fill(0); for (let r=0;r<result.length;r++) { const pc = pivotCols[r]; if (pc !== undefined) x[pc] = result[r][n] }
  steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{x}=${vecLatex(x)}}` }); return steps
}

export function solveProjection(A, b) {
  const bVec = Array.isArray(b[0]) ? b.map(r=>r[0]) : b; const bCol = bVec.map(x=>[x])
  const steps = [{ label: 'Project b onto col(A)', latex: `A=${matLatex(A)},\\;\\mathbf{b}=${vecLatex(bVec)}` }]
  steps.push({ label: 'Projection formula', latex: '\\mathbf{p} = A(A^\\top A)^{-1}A^\\top \\mathbf{b}' })
  const At = transpose(A); const AtA = matMul(At, A)
  steps.push({ label: 'AᵀA', latex: matLatex(AtA, 'A^\\top A = ') })
  const AtA_inv = computeInverseMatrix(AtA); if (!AtA_inv) { steps.push({ label: 'Error', latex: '\\text{A^\\top A is singular}' }); return steps }
  const Atb = matMul(At, bCol).map(r=>r[0]); const coeff = matMul(AtA_inv, Atb.map(x=>[x])).map(r=>r[0])
  const p = matMul(A, coeff.map(x=>[x])).map(r=>r[0])
  steps.push({ label: 'Projection', latex: vecLatex(p, '\\mathbf{p} = ') })
  const e = bVec.map((v,i)=>v-p[i]); const residual = Math.sqrt(e.reduce((s,x)=>s+x*x,0))
  steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{p} = ${vecLatex(p)},\\;\\|\\mathbf{e}\\|=${toFrac(residual)}}` }); return steps
}

export function solveLeastSquares(A, b) {
  const bVec = Array.isArray(b[0]) ? b.map(r=>r[0]) : b; const bCol = bVec.map(x=>[x])
  const steps = [{ label: 'Minimize ‖Ax − b‖', latex: `A=${matLatex(A)},\\;\\mathbf{b}=${vecLatex(bVec)}` }]
  steps.push({ label: 'Normal equations: AᵀAx = Aᵀb', latex: `A^\\top A\\,\\hat{x} = A^\\top \\mathbf{b}` })
  const At = transpose(A); const AtA = matMul(At, A); const Atb = matMul(At, bCol)
  steps.push({ label: 'AᵀA', latex: matLatex(AtA, 'A^\\top A = ') })
  const { result, rank, pivotCols } = solveRREF(copyM(AtA), copyM(Atb))
  const xhat = Array(AtA.length).fill(0)
  for (let r=0;r<result.length;r++) { const pc=pivotCols[r]; if (pc!==undefined) xhat[pc]=result[r][AtA[0].length] }
  steps.push({ label: 'Answer', latex: `\\boxed{\\hat{x}=${vecLatex(xhat)}}` }); return steps
}

export function solveBasis(M) {
  const rows = M.length, cols = M[0].length
  const steps = [{ label: 'Find basis for column space (pivot columns after RREF)', latex: matLatex(M, 'A = ') }]
  const copy = M.map(r=>[...r]); const bVec = Array(rows).fill(0).map(()=>[0])
  const { pivotCols } = solveRREF(copy, bVec)
  const basis = pivotCols.map(c => M.map(r => r[c]))
  steps.push({ label: `Pivot columns: ${pivotCols.map(c=>c+1).join(', ')} (1-indexed)`, latex: `\\text{Rank} = ${pivotCols.length}, \\text{Nullity} = ${cols - pivotCols.length}` })
  if (basis.length === 0) { steps.push({ label: 'Column space', latex: '\\text{Column space} = \\{\\mathbf{0}\\}' }); return steps }
  steps.push({ label: 'Basis for Col(A)', latex: basis.map(v=>`\\begin{pmatrix}${v.map(x=>toFrac(x)).join('\\\\') }\\end{pmatrix}`).join(',\\;') })
  steps.push({ label: 'Rank–Nullity Theorem', latex: `\\text{rank}(A) + \\text{nullity}(A) = ${pivotCols.length} + ${cols-pivotCols.length} = ${cols} = n` })
  return steps
}

export function solveLinearIndependence(M) {
  const rows = M.length, cols = M[0].length
  const steps = [{ label: 'Test linear independence of column vectors', latex: matLatex(M, 'A = ') }]
  const copy = M.map(r=>[...r]); const bVec = Array(rows).fill(0).map(()=>[0])
  const { result, rank, pivotCols } = solveRREF(copy, bVec)
  steps.push({ label: 'RREF', latex: matLatex(result.map(r=>r.slice(0,cols))) })
  if (rank === cols) {
    steps.push({ label: 'Result: Linearly Independent', latex: '\\text{rank}(A) = n \\Rightarrow \\text{columns are linearly independent}' })
    steps.push({ label: 'Only trivial solution', latex: 'A\\mathbf{x}=\\mathbf{0} \\Rightarrow \\mathbf{x}=\\mathbf{0}' })
  } else {
    const freeVars = Array.from({length:cols},(_,i)=>i).filter(i=>!pivotCols.includes(i))
    steps.push({ label: `Result: Linearly DEPENDENT — ${cols-rank} free variable(s)`, latex: `\\text{rank}(A) = ${rank} < ${cols} \\Rightarrow \\text{columns are dependent}` })
    steps.push({ label: 'Free variables (zero-indexed)', latex: `x_{${freeVars.map(i=>i+1).join(', ')}} \\text{ are free}` })
  }
  return steps
}

export function solveSimilarity(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length || A.length !== A[0].length) return [{ label: 'Error', latex: '\\text{Both matrices must be square and same size}' }]
  const n = A.length
  const steps = [{ label: 'Check similarity: A ~ B iff they share eigenvalues and trace/det', latex: `A = ${matLatex(A)},\\quad B = ${matLatex(B)}` }]
  const trA = A.reduce((s,r,i)=>s+r[i],0), trB = B.reduce((s,r,i)=>s+r[i],0)
  let detA = 1, detB = 1
  if (n === 2) { detA = A[0][0]*A[1][1]-A[0][1]*A[1][0]; detB = B[0][0]*B[1][1]-B[0][1]*B[1][0] }
  const trMatch = Math.abs(trA-trB) < 1e-8, detMatch = n===2 ? Math.abs(detA-detB) < 1e-8 : true
  steps.push({ label: 'Trace comparison (tr(A) = tr(B) is necessary for similarity)', latex: `\\text{tr}(A)=${toFrac(trA)},\\quad \\text{tr}(B)=${toFrac(trB)} \\Rightarrow ${trMatch?'\\text{match ✓}':'\\text{differ ✗}'}` })
  if (n === 2) steps.push({ label: 'Determinant comparison', latex: `\\det(A)=${toFrac(detA)},\\quad \\det(B)=${toFrac(detB)} \\Rightarrow ${detMatch?'\\text{match ✓}':'\\text{differ ✗}'}` })
  if (trMatch && detMatch) {
    steps.push({ label: 'Necessary conditions satisfied — likely similar', latex: '\\text{tr and det match. If both diagonalizable with same eigenvalues, they are similar.}' })
    steps.push({ label: 'Sufficient: diagonalize A = PDP⁻¹, check if B = QDQ⁻¹ for same D', latex: 'A \\sim B \\Leftrightarrow \\exists\\,P\\text{ invertible}: B = P^{-1}AP' })
  } else {
    steps.push({ label: 'NOT similar', latex: '\\text{Traces or determinants differ} \\Rightarrow A \\not\\sim B' })
  }
  return steps
}

export function solveSpan(M) {
  const rows = M.length, cols = M[0].length
  const steps = [{ label: 'Find span of given vectors (as columns)', latex: matLatex(M, 'S = \\text{col}') }]
  const copy = M.map(r=>[...r]); const bVec = Array(rows).fill(0).map(()=>[0])
  const { result, rank, pivotCols } = solveRREF(copy, bVec)
  steps.push({ label: 'RREF', latex: matLatex(result.map(r=>r.slice(0,cols))) })
  steps.push({ label: `Span has dimension ${rank}`, latex: `\\text{dim}(\\text{span}) = \\text{rank} = ${rank}` })
  if (rank === rows) {
    steps.push({ label: 'Span fills ℝⁿ', latex: `\\text{span}(S) = \\mathbb{R}^{${rows}}\\quad \\text{(all vectors reachable)}` })
  } else {
    steps.push({ label: 'Span is a subspace', latex: `\\text{span}(S) \\subsetneq \\mathbb{R}^{${rows}}\\quad \\text{(${rows-rank} dimension(s) missing)}` })
  }
  const basis = pivotCols.map(c => M.map(r => r[c]))
  steps.push({ label: 'Basis for span', latex: basis.map(v=>`\\begin{pmatrix}${v.map(x=>toFrac(x)).join('\\\\')}\\end{pmatrix}`).join(',\\;') })
  return steps
}

// ══════════════════════════════════════════════════════════════════════════════
// SIGMA
// ══════════════════════════════════════════════════════════════════════════════

export function safeEval(expr, vars) {
  let s = expr.replace(/\^/g,'**').replace(/\bsqrt\b/g,'Math.sqrt').replace(/\babs\b/g,'Math.abs')
    .replace(/\bsin\b/g,'Math.sin').replace(/\bcos\b/g,'Math.cos').replace(/\btan\b/g,'Math.tan')
  for (const [k,v] of Object.entries(vars)) s = s.replace(new RegExp(`\\b${k}\\b`,'g'), String(v))
  if (!/^[\d\s+\-*/().Math,a-z_]+$/i.test(s)) return NaN
  try { const r = Function('"use strict"; return (' + s + ')')(); return typeof r === 'number' ? r : NaN } catch { return NaN }
}

export const CLOSED_FORMS = [
  { label: '\\sum_{i=1}^{n} 1 = n', test: (e,lo,hi) => lo===1&&hi==='n'&&e.trim()==='1', formula: n=>n, latexResult: n=>`n = ${n}`, explanation: 'Summing 1 exactly n times gives n.' },
  { label: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', test: (e,lo,hi) => { const t=e.trim(); return lo===1&&hi==='n'&&(t==='i'||t==='i*1'||t==='1*i') }, formula: n=>(n*(n+1))/2, latexResult: n=>`\\frac{${n}(${n}+1)}{2} = ${(n*(n+1))/2}`, explanation: "Gauss's triangular-number formula." },
  { label: '\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}', test: (e,lo,hi) => { const t=e.trim().replace(/\s/g,''); return lo===1&&hi==='n'&&(t==='i^2'||t==='i**2'||t==='i*i') }, formula: n=>(n*(n+1)*(2*n+1))/6, latexResult: n=>`\\frac{${n}(${n}+1)(${2*n+1})}{6} = ${(n*(n+1)*(2*n+1))/6}`, explanation: 'Sum-of-squares formula.' },
  { label: '\\sum_{i=1}^{n} i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2', test: (e,lo,hi) => { const t=e.trim().replace(/\s/g,''); return lo===1&&hi==='n'&&(t==='i^3'||t==='i**3'||t==='i*i*i') }, formula: n=>Math.pow((n*(n+1))/2,2), latexResult: n => { const h=(n*(n+1))/2; return `\\left[\\frac{${n}(${n}+1)}{2}\\right]^2 = ${h*h}` }, explanation: 'Cube-sum equals square of triangular number.' },
]

export function matchClosedForm(expr, loStr, hi, n) {
  const lo = loStr === '1' ? 1 : parseInt(loStr, 10)
  for (const cf of CLOSED_FORMS) { if (cf.test(expr, lo, hi)) return { ...cf, value: cf.formula(n), resultLatex: cf.latexResult(n) } }
  return null
}

// ══════════════════════════════════════════════════════════════════════════════
// POLYNOMIAL
// ══════════════════════════════════════════════════════════════════════════════

export function polyEvalAt(expr, x, vars = {}) {
  try { const r = mathEval(expr, { x, ...vars }); if (typeof r === 'number') return r; return NaN } catch { return NaN }
}

function numDerivPoly(expr, x) {
  const h = Math.max(Math.abs(x)*1e-6, 1e-8)
  return (polyEvalAt(expr, x+h) - polyEvalAt(expr, x-h)) / (2*h)
}

function newtonRootPoly(expr, x0) {
  let x = x0
  for (let k = 0; k < 80; k++) {
    const fx = polyEvalAt(expr, x); if (!isFinite(fx)) return null
    if (Math.abs(fx) < 1e-12) return x
    const fpx = numDerivPoly(expr, x); if (Math.abs(fpx) < 1e-14) break
    const xn = x - fx/fpx; if (!isFinite(xn)) return null
    if (Math.abs(xn-x) < 1e-10) return Math.abs(polyEvalAt(expr,xn)) < 1e-5 ? xn : null
    x = xn
  }
  return Math.abs(polyEvalAt(expr,x)) < 1e-5 ? x : null
}

export function findRoots(expr, lo=-15, hi=15, nScan=800) {
  const roots = []; const step = (hi-lo)/nScan
  let px = lo, pf = polyEvalAt(expr, lo)
  for (let i = 1; i <= nScan; i++) {
    const x = lo + i*step; const f = polyEvalAt(expr, x)
    if (isFinite(pf) && isFinite(f)) {
      if (pf*f < 0) { const r = newtonRootPoly(expr, (px+x)/2); if (r !== null && !roots.some(e => Math.abs(e-r) < 1e-4)) roots.push(r) }
      if (Math.abs(f) < 1e-7 && !roots.some(e => Math.abs(e-x) < 5e-4)) { const r = newtonRootPoly(expr,x); if (r !== null && Math.abs(polyEvalAt(expr,r)) < 1e-5 && !roots.some(e => Math.abs(e-r) < 1e-3)) roots.push(r) }
    }
    px = x; pf = f
  }
  return roots.sort((a,b)=>a-b)
}

export function detectDegree(expr) {
  const pts = Array.from({length:8},(_,i) => polyEvalAt(expr, i-1))
  if (pts.some(p => !isFinite(p))) return null
  let d = [...pts]
  for (let k = 0; k <= 6; k++) {
    const scale = Math.max(...d.map(v=>Math.abs(v)), 1)
    // k-th differences all zero means the (k-1)-th differences are constant → degree k-1
    if (d.every(v => Math.abs(v) < 1e-6 * scale)) return Math.max(0, k - 1)
    d = d.slice(0,-1).map((_,i) => d[i+1]-d[i])
  }
  return null
}

function fmtN(v) { if (!isFinite(v)) return '?'; if (Math.abs(v) < 1e-9) return '0'; if (Math.abs(v-Math.round(v)) < 1e-7) return String(Math.round(v)); return parseFloat(v.toPrecision(6)).toString() }
function tryFrac(v) {
  if (Math.abs(v-Math.round(v)) < 1e-7) return fmtN(v)
  for (let d=2;d<=12;d++) { const n=Math.round(v*d); if (Math.abs(v-n/d) < 1e-6 && Math.abs(n%d) !== 0) return `\\tfrac{${n}}{${d}}` }
  return fmtN(v)
}
function lp(v) { const s=fmtN(v); return v < -1e-9 ? `\\left(${s}\\right)` : s }

export function buildQuadSteps(expr) {
  const c  = polyEvalAt(expr, 0); const f1 = polyEvalAt(expr, 1); const fm = polyEvalAt(expr, -1)
  const a  = (f1+fm-2*c)/2; const b = f1-c-a
  const disc = b*b-4*a*c; const aL=fmtN(a), bL=fmtN(b), cL=fmtN(c)
  const bSqL=fmtN(b*b), facL=fmtN(4*a*c), discL=fmtN(disc)
  const steps = [
    { label: 'Identify coefficients', latex: `f(x) = ${a===1?'':`${aL}\\,`}x^2 ${b>=0?'+':'-'} ${fmtN(Math.abs(b))}\\,x ${c>=0?'+':'-'} ${fmtN(Math.abs(c))} = 0\\\\a=${aL},\\;b=${bL},\\;c=${cL}` },
    { label: 'Discriminant  Δ = b² − 4ac', latex: `\\Delta = ${lp(b)}^2 - 4\\cdot${lp(a)}\\cdot${lp(c)} = ${bSqL} - ${facL} = ${discL}` },
  ]
  const h = -b/(2*a); const k = polyEvalAt(expr, h)
  steps.push({ label: 'Axis of symmetry & vertex', latex: `x = -\\dfrac{b}{2a} = ${tryFrac(h)},\\quad \\text{Vertex: }\\left(${tryFrac(h)},\\,${tryFrac(k)}\\right)` })
  steps.push({ label: 'y-intercept', latex: `f(0) = ${tryFrac(c)}` })
  if (disc > 0) {
    const sqrtD = Math.sqrt(disc); const x1=(-b+sqrtD)/(2*a); const x2=(-b-sqrtD)/(2*a)
    const sqrtDL = Math.abs(sqrtD-Math.round(sqrtD)) < 1e-7 ? fmtN(sqrtD) : `\\sqrt{${discL}}`
    steps.push({ label: 'Δ > 0 → two real roots', latex: `x_{1,2} = \\dfrac{${fmtN(-b)} \\pm ${sqrtDL}}{${fmtN(2*a)}}` })
    steps.push({ label: 'Roots', latex: `x_1=${tryFrac(x1)},\\quad x_2=${tryFrac(x2)}` })
    const r1L = tryFrac(x1); const r2L = tryFrac(x2)
    const wrap = v => (v.startsWith('-') ? `(${v})` : v)
    const aPre = a===1?'':`${aL}\\cdot`
    steps.push({ label: 'Factored form', latex: `f(x) = ${aPre}\\left(x-${wrap(r1L)}\\right)\\left(x-${wrap(r2L)}\\right)` })
    return steps
  } else if (disc === 0) {
    const root = h
    steps.push({ label: 'Δ = 0 → one repeated root (touches x-axis)', latex: `x = ${tryFrac(root)}` })
    steps.push({ label: 'Factored form', latex: `f(x) = ${a===1?'':`${aL}\\cdot`}\\left(x-${tryFrac(root)}\\right)^2` })
  } else {
    const re = h; const im = Math.sqrt(-disc)/(2*Math.abs(a))
    steps.push({ label: 'Δ < 0 → no real roots (complex pair)', latex: `x = ${fmtN(re)} \\pm ${fmtN(im)}\\,i` })
    steps.push({ label: 'Vertex form', latex: `f(x) = ${aL}\\left(x-${tryFrac(h)}\\right)^2 + ${tryFrac(k)}` })
  }
  return steps
}

// ══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ══════════════════════════════════════════════════════════════════════════════

export function solveStats(data) {
  const n = data.length; const sorted = [...data].sort((a,b)=>a-b)
  const mean = data.reduce((s,x)=>s+x,0)/n
  const median = n%2 ? sorted[n>>1] : (sorted[n/2-1]+sorted[n/2])/2
  const variance = data.reduce((s,x)=>s+(x-mean)**2,0)/n
  const sd = Math.sqrt(variance)
  return [
    { label: 'Data', latex: `\\{${data.map(v => fmtNum(v)).join(',\\;')}\\}` },
    { label: `n = ${n}` , latex: `n = ${n}` },
    { label: 'Mean', latex: `\\bar{x} = \\dfrac{${data.map(v => fmtNum(v)).join('+')}}{${n}} = ${fmtNum(mean)}` },
    { label: 'Median', latex: `\\text{median} = ${fmtNum(median)}` },
    { label: 'Variance', latex: `\\sigma^2 = \\dfrac{\\sum(x-\\bar{x})^2}{n} = ${fmtNum(variance)}` },
    { label: 'Std Dev', latex: `\\boxed{\\sigma = ${fmtNum(sd)}}` },
    { label: 'Range', latex: `\\text{min}=${fmtNum(sorted[0])},\\;\\text{max}=${fmtNum(sorted[n-1])}` },
  ]
}

// ══════════════════════════════════════════════════════════════════════════════
// PHYSICS FORMULA LIBRARY
// ══════════════════════════════════════════════════════════════════════════════

export const PHYSICS_FORMULAS = [
  { name: 'Force', formula: 'F = m * a', vars: ['F','m','a'], latex: 'F = ma', desc: 'Newton\'s 2nd Law' },
  { name: 'Kinetic Energy', formula: 'KE = 0.5 * m * v^2', vars: ['KE','m','v'], latex: 'KE = \\frac{1}{2}mv^2', desc: 'Kinetic energy' },
  { name: 'Potential Energy', formula: 'PE = m * 9.81 * h', vars: ['PE','m','h'], latex: 'PE = mgh', desc: 'Gravitational PE' },
  { name: 'Final Velocity', formula: 'v = v0 + a * t', vars: ['v','v0','a','t'], latex: 'v = v_0 + at', desc: 'Kinematics' },
  { name: 'Displacement', formula: 's = v0 * t + 0.5 * a * t^2', vars: ['s','v0','a','t'], latex: 's = v_0 t + \\frac{1}{2}at^2', desc: 'Kinematics' },
  { name: "Ohm's Law", formula: 'V = I * R', vars: ['V','I','R'], latex: 'V = IR', desc: 'Voltage, current, resistance' },
  { name: 'Power', formula: 'P = V * I', vars: ['P','V','I'], latex: 'P = VI', desc: 'Electric power' },
  { name: 'Wave Speed', formula: 'v = freq * wavelength', vars: ['v','freq','wavelength'], latex: 'v = f\\lambda', desc: 'Wave equation' },
  { name: 'Ideal Gas', formula: 'P = (n * 8.314 * T) / V', vars: ['P','n','T','V'], latex: 'PV = nRT', desc: 'Ideal gas law' },
  { name: 'Gravity', formula: 'F = (6.674e-11 * m1 * m2) / r^2', vars: ['F','m1','m2','r'], latex: 'F = \\frac{Gm_1m_2}{r^2}', desc: 'Newton\'s gravity' },
  { name: 'Pressure', formula: 'P = F / A', vars: ['P','F','A'], latex: 'P = \\frac{F}{A}', desc: 'Pressure' },
  { name: 'v² (no time)', formula: 'v = sqrt(v0^2 + 2 * a * s)', vars: ['v','v0','a','s'], latex: 'v^2 = v_0^2 + 2as', desc: 'Kinematics' },
]

export const MACHINIST_FORMULAS = [
  {
    name: 'SFM', fullName: 'Surface Feet per Minute',
    formula: '(pi * D * RPM) / 12', vars: ['D','RPM'], solves: 'SFM',
    latex: 'SFM = \\frac{\\pi D \\cdot RPM}{12}',
    desc: 'Cutting speed — tangential velocity of the cutting edge',
    units: { D:'in (tool dia)', RPM:'rev/min', SFM:'ft/min' },
    viz: 'rotation',
    explain: {
      eli5: 'SFM is how fast the cutting edge is moving past the material — like clocking how far a spinning wheel\'s edge travels every minute.',
      student: 'Surface Feet per Minute measures tangential cutting velocity. Aluminum: 300–600 SFM. Mild steel: 60–150 SFM. Higher SFM → faster cutting but more heat.',
      college: 'v = πDN/12 converts RPM and diameter (inches) to ft/min. Derived from circumference × RPM, divided by 12 to convert inches to feet.',
      advanced: 'Tool life follows Taylor\'s equation: VT^n = C. Doubling SFM can cut tool life by 10× depending on the Taylor exponent n (typically 0.1–0.5 for HSS/carbide).',
    },
  },
  {
    name: 'RPM', fullName: 'Spindle RPM from Cutting Speed',
    formula: '(SFM * 12) / (pi * D)', vars: ['SFM','D'], solves: 'RPM',
    latex: 'RPM = \\frac{SFM \\times 12}{\\pi D}',
    desc: 'Set your spindle speed given target cutting speed and tool diameter',
    units: { SFM:'ft/min', D:'in (tool dia)', RPM:'rev/min' },
    viz: 'rotation',
    explain: {
      eli5: 'Rearranged SFM formula — you know how fast you want to cut and how big the tool is, so you solve for how many times it spins per minute.',
      student: 'Rearrangement of SFM = πDN/12. Look up recommended SFM for your material/tool combo, plug in diameter, get the RPM to set on the machine.',
      college: 'N = 12·SFM/(πD). Standard practice: use the lower end of recommended SFM range for roughing, upper end for finishing with coolant.',
      advanced: 'Optimal cutting speed balances tool wear, surface finish, and cycle time. Use Merchant\'s circle and chip formation theory for deeper analysis.',
    },
  },
  {
    name: 'Feed Rate', fullName: 'Table Feed Rate (IPM)',
    formula: 'RPM * FPT * Z', vars: ['RPM','FPT','Z'], solves: 'F',
    latex: 'F = RPM \\cdot FPT \\cdot Z',
    desc: 'Inches per minute — how fast the table moves',
    units: { RPM:'rev/min', FPT:'in/tooth (chip load)', Z:'# of flutes', F:'in/min' },
    viz: 'feed',
    explain: {
      eli5: 'Every time the cutter spins, each tooth takes a bite. More teeth, faster spin, bigger bite = faster table movement.',
      student: 'Each flute removes FPT inches of material per revolution. At RPM revolutions per minute with Z flutes, total feed = RPM × Z × FPT.',
      college: 'Chip load (FPT) is constrained by material, tool diameter, and rigidity. Too low → rubbing and work hardening. Too high → tool breakage.',
      advanced: 'Optimum chip load maximizes MRR while staying within machine power and deflection limits. FEA-based cutting force models predict deflection.',
    },
  },
  {
    name: 'Chip Load', fullName: 'Feed per Tooth (Chip Load)',
    formula: 'F / (RPM * Z)', vars: ['F','RPM','Z'], solves: 'FPT',
    latex: 'FPT = \\frac{F}{RPM \\cdot Z}',
    desc: 'Material removed per cutting edge per revolution',
    units: { F:'in/min', RPM:'rev/min', Z:'# flutes', FPT:'in/tooth' },
    viz: 'feed',
    explain: {
      eli5: 'Chip load is the thickness of each chip cut by one tooth in one revolution.',
      student: 'Verify your chip load after setting RPM and feed rate. Compare to manufacturer recommendations for your tool and material.',
      college: 'Chip load affects surface finish, tool life, and cutting forces. Typical values: 0.001–0.005" for steel, 0.005–0.020" for aluminum.',
      advanced: 'Chip thinning occurs in radial immersion < 50% — effective chip load is less than programmed. Compensate: FPT_actual = FPT × sqrt(DOC/(D - DOC)).',
    },
  },
  {
    name: 'MRR', fullName: 'Material Removal Rate',
    formula: 'DOC * WOC * FR', vars: ['DOC','WOC','FR'], solves: 'MRR',
    latex: 'MRR = DOC \\cdot WOC \\cdot FR',
    desc: 'Cubic inches of material removed per minute',
    units: { DOC:'in (axial depth)', WOC:'in (radial width)', FR:'in/min', MRR:'in³/min' },
    viz: 'milling',
    explain: {
      eli5: 'MRR tells you how fast you\'re eating through the metal — depth × width × how fast you move.',
      student: 'Used to estimate cycle time, spindle power required, and compare machining strategies. Higher MRR = faster but needs more HP.',
      college: 'Power required: HP = MRR × Kp / E, where Kp is specific power (hp·min/in³) for the material and E is machine efficiency (~0.8).',
      advanced: 'Relates to unit power (specific cutting force). For orthogonal cutting: Fc = Ks × t1 × b, where Ks is specific cutting force in N/mm².',
    },
  },
  {
    name: 'Tap Drill', fullName: 'Tap Drill Size (75% thread)',
    formula: 'D - (1 / TPI)', vars: ['D','TPI'], solves: 'TD',
    latex: 'TD = D - \\frac{1}{TPI}',
    desc: 'Drill size for 75% thread engagement (standard recommendation)',
    units: { D:'in (major thread dia)', TPI:'threads/in', TD:'in (drill diameter)' },
    viz: 'thread',
    explain: {
      eli5: 'You need a hole slightly smaller than the screw so the tap can cut threads. This tells you exactly how small to drill.',
      student: '75% thread engagement is standard — it provides nearly full strength (90%+ of 100% engagement) with less risk of tap breakage. For metric: TD = D - pitch.',
      college: 'Thread depth h = 0.6495/TPI. At 75% engagement: TD = D - 2(0.75h) = D - 1/TPI. Actual formula gives D - 0.9743/TPI for 75% UNC/UNF.',
      advanced: 'Optimal engagement depends on material — softer materials need more engagement. Helicoil inserts in aluminum allow 50-60% engagement in the insert.',
    },
  },
  {
    name: 'Bolt Circle', fullName: 'Bolt Circle Coordinates',
    formula: 'BCR', vars: ['BCR','n','start_angle'], solves: 'coords',
    latex: 'x_k = BCR\\cos\\!\\left(\\frac{2\\pi k}{n}+\\theta_0\\right),\\quad y_k = BCR\\sin\\!\\left(\\frac{2\\pi k}{n}+\\theta_0\\right)',
    desc: 'CNC coordinates for n evenly-spaced holes on a bolt circle',
    units: { BCR:'in (bolt circle radius)', n:'# holes', start_angle:'deg (start angle, usually 0)' },
    viz: 'boltcircle',
    explain: {
      eli5: 'Place n holes evenly around a circle of given radius, starting from a given angle.',
      student: 'Each hole k (0 to n-1) is at angle 2πk/n from the start. Convert BCR and angle to X,Y for each hole.',
      college: 'Parametric circle: x = r·cos(θ), y = r·sin(θ). Dividing the circle into n equal arcs gives Δθ = 2π/n.',
      advanced: 'For CNC G-code, use G81 canned drill cycle with calculated X,Y positions. Bolt circles also arise in gear geometry and flange design standards (ANSI B16.5).',
    },
  },
  {
    name: 'Taper/Ft', fullName: 'Taper per Foot',
    formula: '(D1 - D2) / L * 12', vars: ['D1','D2','L'], solves: 'TPF',
    latex: 'TPF = \\frac{D_1 - D_2}{L} \\times 12',
    desc: 'Standard taper measurement — used for Morse, Jacobs, Brown & Sharpe tapers',
    units: { D1:'in (large dia)', D2:'in (small dia)', L:'in (length)', TPF:'in/ft' },
    viz: 'taper',
    explain: {
      eli5: 'Taper per foot tells you how much the diameter changes over 12 inches of length.',
      student: 'Standard tapers: Morse #1 = 0.5986 TPF, #2 = 0.5994 TPF, #3 = 0.6024 TPF. Used for self-holding tool shanks.',
      college: 'Half-angle: α = arctan(TPF/24). The "self-holding" property occurs when α < friction angle (typically < 3°).',
      advanced: 'Locking condition: tan(α) < μ, where μ is the coefficient of friction. Morse tapers have α ≈ 1.5° — well within self-locking range for steel on steel (μ ≈ 0.15).',
    },
  },
  {
    name: 'Taper Angle', fullName: 'Half-Included Taper Angle',
    formula: 'atan((D1 - D2) / (2 * L)) * (180 / pi)', vars: ['D1','D2','L'], solves: 'angle',
    latex: '\\alpha = \\arctan\\!\\left(\\frac{D_1 - D_2}{2L}\\right)',
    desc: 'Half-angle in degrees — use for compound slide setting or programming',
    units: { D1:'in', D2:'in', L:'in', angle:'degrees (half-angle)' },
    viz: 'taper',
    explain: {
      eli5: 'The angle you\'d tilt a lathe compound slide to cut a taper.',
      student: 'Set compound slide to this angle for manual taper turning. Full included angle = 2α.',
      college: 'For CNC: program taper with start/end X,Z coordinates directly. Angle is used to verify geometry and set up sine bar inspection.',
      advanced: 'Interference fit analysis for tapered connections uses Lamé equations for thick-walled cylinders with contact pressure p = (E·δ)/(r·[..]) where δ is interference.',
    },
  },
  {
    name: 'Ramp Angle', fullName: 'Helical Entry Ramp Angle',
    formula: 'atan(pitch / (pi * D)) * (180 / pi)', vars: ['pitch','D'], solves: 'angle',
    latex: '\\alpha_{ramp} = \\arctan\\!\\left(\\frac{p}{\\pi D}\\right)',
    desc: 'Max ~3° for carbide end mills — used for helical plunge milling entry',
    units: { pitch:'in/rev (axial drop per revolution)', D:'in (tool dia)', angle:'degrees' },
    viz: 'ramp',
    explain: {
      eli5: 'Instead of plunging straight down (which end mills hate), you spiral down at a shallow angle like a screw going into wood.',
      student: 'Ramp angle for helical entry should stay under 3° for most end mills, up to 5° for tools rated for ramping. The pitch is how much Z drops per revolution of the helix.',
      college: 'Helical entry distributes cutting load across the entire flute length and avoids center-cutting issues. The helix pitch = ramp_angle × π × D / 180.',
      advanced: 'Optimum helix ramp is a trade-off between cycle time (steeper = faster Z entry) and cutting force direction (axial force increases with angle, risking deflection and chatter).',
    },
  },
  {
    name: 'Thread Pitch', fullName: 'Thread Pitch from TPI',
    formula: '1 / TPI', vars: ['TPI'], solves: 'pitch',
    latex: 'p = \\frac{1}{TPI}',
    desc: 'Distance between thread crests in inches',
    units: { TPI:'threads/in', pitch:'in' },
    viz: 'thread',
    explain: {
      eli5: 'How far apart the thread ridges are — a 20-TPI thread has ridges 1/20" = 0.050" apart.',
      student: 'Used to set lathe change gears, pick threading inserts, and calculate tap drill size. Metric equivalent: pitch is given directly in mm.',
      college: 'Thread geometry: pitch diameter = major - 0.6495/TPI. Root diameter = major - 1.2990/TPI for 60° thread form (UNC/UNF/metric).',
      advanced: 'Thread tolerance (class 2A/3A) defines pitch diameter limits. Lead error (pitch accumulation over length) affects fit and is measured with CMM or thread wires.',
    },
  },
  {
    name: 'Cut Time', fullName: 'Machining Cycle Time',
    formula: 'L / FR', vars: ['L','FR'], solves: 'T',
    latex: 'T = \\frac{L}{F}',
    desc: 'Time to machine a given length at feed rate F',
    units: { L:'in (total cut length)', FR:'in/min', T:'min' },
    viz: null,
    explain: {
      eli5: 'If you move at 10 inches per minute and need to cut 50 inches, it takes 5 minutes.',
      student: 'Basic cycle time estimate. Add setup time, tool change time, and rapid moves for total job time. Multiply by number of parts for production planning.',
      college: 'Cycle time optimization: maximize F (feed) while respecting surface finish requirements (Ra ∝ F²/8R for turning, R = nose radius).',
      advanced: 'Total machining cost = (T_cycle × C_machine + T_cycle/T_tool × C_tool) per part. Optimal cutting speed minimizes cost — Gilbert\'s equation.',
    },
  },
  {
    name: 'Sine Bar', fullName: 'Sine Bar Setup Height',
    formula: 'L * sin(angle * pi / 180)', vars: ['L','angle'], solves: 'H',
    latex: 'H = L \\sin\\alpha',
    desc: 'Gauge block stack height for sine bar setup. L = sine bar length (5" or 10")',
    units: { L:'in (sine bar length)', angle:'degrees', H:'in (gauge block height)' },
    viz: 'sinebar',
    explain: {
      eli5: 'A sine bar is a precision tool for setting exact angles. You stack gauge blocks under one end — this tells you how tall the stack needs to be.',
      student: 'Standard sine bars are 5" or 10". H = L×sin(α). Use gauge blocks (Jo blocks) to build the exact height. Accuracy: ±0.0001" achievable.',
      college: 'Sine bar uncertainty: δα = δH/(L·cos α). Accuracy degrades at large angles (>45°) because cos α decreases. Use a compound sine plate for two-axis setups.',
      advanced: 'For tight tolerances, use a CMM to measure angle directly. Sine bar setups accumulate error from: gauge block uncertainty, roller diameter variation, surface plate flatness.',
    },
  },
]

// ══════════════════════════════════════════════════════════════════════════════
// CODE GENERATORS
// ══════════════════════════════════════════════════════════════════════════════

export function generateCode(type, args) {
  const snippets = { js: '', py: '', ml: '', mpl: '', pt: '' }
  if (type === 'calc') {
    const expr = args.expr || ''
    const jsExpr = expr.replace(/\^/g,'**').replace(/π/g,'Math.PI')
    const pyExpr = expr.replace(/\^/g,'**').replace(/π/g,'math.pi')
    snippets.js = `// Evaluate expression\nconst result = ${jsExpr};\nconsole.log(result);`
    snippets.py = `import math\nresult = ${pyExpr}\nprint(result)`
    snippets.ml = `result = ${expr.replace(/\^/g,'.^').replace(/π/g,'pi')}`
    snippets.mpl = `import numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(-10, 10, 400)\ny = ${pyExpr.replace(/x/g,'x')}\nplt.plot(x, y)\nplt.axhline(0, color='k', linewidth=0.5)\nplt.title('${expr}')\nplt.grid(True)\nplt.show()`
    snippets.pt = `import torch\nimport matplotlib.pyplot as plt\n\nx = torch.linspace(-10, 10, 400)\ny = ${pyExpr.replace(/math\./g,'torch.').replace(/x/g,'x')}\nplt.plot(x.numpy(), y.numpy())\nplt.title('${expr}')\nplt.grid(True)\nplt.show()`
  } else if (type === 'det') {
    const mat = args.matrix
    const arr = JSON.stringify(mat)
    snippets.js = `// Determinant (requires math.js)\nimport { det } from 'mathjs';\nconst A = ${arr};\nconsole.log('det(A) =', det(A));`
    snippets.py = `import numpy as np\nA = np.array(${arr})\nprint('det(A) =', np.linalg.det(A))`
    snippets.ml = `A = ${arr.replace(/\[/g,'[').replace(/\],/g,';').replace(/\[\[/g,'[').replace(/\]\]/g,']')};\ndet(A)`
  } else if (type === 'eigen') {
    const mat = args.matrix
    snippets.py = `import numpy as np\nA = np.array(${JSON.stringify(mat)})\neigenvalues, eigenvectors = np.linalg.eig(A)\nprint('Eigenvalues:', eigenvalues)\nprint('Eigenvectors:', eigenvectors)`
    snippets.js = `// Eigenvalues via math.js\nimport { eigs } from 'mathjs';\nconst A = ${JSON.stringify(mat)};\nconst { values, vectors } = eigs(A);\nconsole.log(values);`
    snippets.ml = `A = ${JSON.stringify(mat).replace(/\[/g,'[').replace(/\],/g,';').replace(/\[\[/g,'[').replace(/\]\]/g,']')};\n[V, D] = eig(A)`
  } else if (type === 'rref') {
    const mat = args.matrix
    snippets.py = `import numpy as np\nfrom sympy import Matrix\nA = Matrix(${JSON.stringify(mat)})\nprint(A.rref())`
    snippets.js = `// RREF — use mathjs or manual implementation\nconst A = ${JSON.stringify(mat)};`
    snippets.ml = `A = ${JSON.stringify(mat).replace(/\[/g,'[').replace(/\],/g,';').replace(/\[\[/g,'[').replace(/\]\]/g,']')};\nrref(A)`
  } else if (type === 'integral') {
    const { expr, a, b } = args
    const pyExpr = expr.replace(/\^/g,'**')
    snippets.js = `// Numerical integration (Simpson's rule)\nfunction fnInt(f, a, b, n=1000) {\n  const h = (b-a)/n;\n  let s = f(a)+f(b);\n  for (let i=1;i<n;i++) s += (i%2===0?2:4)*f(a+i*h);\n  return h/3*s;\n}\nconst result = fnInt(x => ${expr.replace(/\^/g,'**')}, ${a}, ${b});\nconsole.log(result);`
    snippets.py = `from scipy import integrate\nimport numpy as np\nresult, err = integrate.quad(lambda x: ${pyExpr}, ${a}, ${b})\nprint(f'∫ = {result:.6f}  err={err:.2e}')`
    snippets.ml = `f = @(x) ${expr.replace(/\^/g,'.^')};\nresult = integral(f, ${a}, ${b})`
    snippets.mpl = `import numpy as np\nimport matplotlib.pyplot as plt\nfrom scipy import integrate\n\nx_full = np.linspace(${a}-1, ${b}+1, 400)\ny_full = ${pyExpr.replace(/x/g,'x_full')}\nx_fill = np.linspace(${a}, ${b}, 400)\ny_fill = ${pyExpr.replace(/x/g,'x_fill')}\n\nfig, ax = plt.subplots()\nax.plot(x_full, y_full, 'b-', linewidth=2)\nax.fill_between(x_fill, y_fill, alpha=0.3, color='blue', label=f'∫ ≈ {integrate.quad(lambda x: ${pyExpr}, ${a}, ${b})[0]:.4f}')\nax.axhline(0, color='k', linewidth=0.5)\nax.legend()\nax.set_title('Definite Integral: ${expr}')\nplt.grid(True)\nplt.show()`
    snippets.pt = `import torch\nimport matplotlib.pyplot as plt\n\nx = torch.linspace(${a}, ${b}, 1000, dtype=torch.float64)\ny = ${pyExpr.replace(/math\./g,'torch.').replace(/x/g,'x')}\n\n# Trapezoidal integration\nresult = torch.trapz(y, x).item()\nprint(f'∫ ≈ {result:.6f}')\n\nplt.plot(x.numpy(), y.numpy())\nplt.fill_between(x.numpy(), y.numpy(), alpha=0.3, label=f'∫={result:.4f}')\nplt.legend(); plt.grid(True); plt.title('Integral'); plt.show()`
  } else if (type === 'derivative') {
    const { expr, x } = args
    const pyExpr = expr.replace(/\^/g,'**')
    snippets.js = `// Numerical derivative (central difference)\nconst h = 1e-7;\nconst f = x => ${expr.replace(/\^/g,'**')};\nconst deriv = (f(${x}+h) - f(${x}-h)) / (2*h);\nconsole.log(deriv);`
    snippets.py = `import sympy as sp\nx = sp.Symbol('x')\nexpr = ${pyExpr}\nderiv = sp.diff(expr, x)\nprint(f"f'(x) = {deriv}")\nprint(f"f'({x}) = {float(deriv.subs(x, ${x})):.6f}")`
    snippets.ml = `syms x;\nexpr = ${expr.replace(/\^/g,'.^')};\nderiv = diff(expr, x)\nsubs(deriv, x, ${x})`
    snippets.mpl = `import numpy as np\nimport matplotlib.pyplot as plt\n\nx_vals = np.linspace(${Number(x)-5}, ${Number(x)+5}, 400)\ny_vals = ${pyExpr.replace(/x/g,'x_vals')}\n\n# Tangent line at x=${x}\nh = 1e-7\nslope = (${pyExpr.replace(/x/g,`(${x}+h)`)} - ${pyExpr.replace(/x/g,`(${x}-h)`)}) / (2*h)\ny0 = ${pyExpr.replace(/x/g,String(x))}\ntangent = slope * (x_vals - ${x}) + y0\n\nplt.plot(x_vals, y_vals, 'b-', label='f(x)')\nplt.plot(x_vals, tangent, 'r--', label=f"tangent: slope={slope:.4f}")\nplt.scatter([${x}], [y0], color='red', s=80, zorder=5)\nplt.legend(); plt.grid(True); plt.title("Derivative at x=${x}")\nplt.show()`
    snippets.pt = `import torch\n\nx = torch.tensor(${Number(x)}, dtype=torch.float64, requires_grad=True)\ny = ${pyExpr.replace(/math\./g,'torch.').replace(/\bx\b/g,'x')}\ny.backward()\nprint(f"f'({x.item()}) = {x.grad.item():.6f}") # autograd`
  } else if (type === 'poly') {
    const { expr } = args
    const pyExpr = expr.replace(/\^/g,'**')
    snippets.js = `// Find roots via Newton-Raphson scan\nfunction f(x) { return ${expr.replace(/\^/g,'**')} }\nfunction df(x) { const h=1e-7; return (f(x+h)-f(x-h))/(2*h) }\nconst roots = [];\nfor (let i=-15; i<=15; i+=0.1) {\n  let x=i;\n  for (let k=0;k<50;k++) { const fx=f(x); if (!isFinite(fx)) break; if (Math.abs(fx)<1e-10) break; const dfx=df(x); if (Math.abs(dfx)<1e-14) break; x-=fx/dfx; }\n  if (Math.abs(f(x))<1e-6 && !roots.some(r=>Math.abs(r-x)<0.001)) roots.push(+x.toFixed(6));\n}\nconsole.log('Roots:', roots);`
    snippets.py = `import sympy as sp\nx = sp.Symbol('x')\nexpr = ${pyExpr}\nroots = sp.solve(expr, x)\nprint('Roots:', roots)\n\n# Numerical roots\nimport numpy as np\nfrom numpy.polynomial import polynomial as P\ncoeffs = [float(c) for c in sp.Poly(expr, x).all_coeffs()]\nprint('Numerical roots:', np.roots(coeffs))`
    snippets.ml = `syms x;\npoly = ${expr.replace(/\^/g,'.^')};\nsolve(poly, x)\n% Or numerically:\np = ${expr.replace(/\^/g,'.^')};\nroots(sym2poly(p, x))`
    snippets.mpl = `import numpy as np\nimport matplotlib.pyplot as plt\nimport sympy as sp\n\nx_sym = sp.Symbol('x')\nexpr = ${pyExpr}\nroots_sym = [complex(r) for r in sp.solve(expr, x_sym)]\nreal_roots = [r.real for r in roots_sym if abs(r.imag)<1e-8]\n\nx_vals = np.linspace(-8, 8, 400)\ny_vals = ${pyExpr.replace(/x/g,'x_vals')}\n\nplt.figure(figsize=(8,5))\nplt.plot(x_vals, y_vals, 'b-', linewidth=2, label='f(x)')\nplt.axhline(0, color='k', linewidth=0.5)\nfor r in real_roots:\n    plt.scatter([r], [0], color='red', s=100, zorder=5, label=f'root={r:.4f}')\nplt.ylim(-20, 20); plt.grid(True)\nplt.legend(); plt.title('${expr}')\nplt.show()`
    snippets.pt = `import torch\nimport matplotlib.pyplot as plt\n\n# Evaluate polynomial over a grid (torch)\nx = torch.linspace(-8, 8, 400, dtype=torch.float64)\ny = ${pyExpr.replace(/\bx\b/g,'x').replace(/math\./g,'torch.')}\nplt.plot(x.numpy(), y.numpy(), label='${expr}')\nplt.axhline(0, color='k', linewidth=0.5); plt.grid(True); plt.legend(); plt.show()`
  } else if (type === 'sigma') {
    const { expr, lo, hi, n } = args
    snippets.js = `let total = 0;\nfor (let i = ${lo}; i <= ${hi === 'n' ? n : hi}; i++) {\n  total += ${expr.replace(/\^/g,'**').replace(/i/g,'i')};\n}\nconsole.log('Sum =', total);`
    snippets.py = `total = sum(${expr.replace(/\^/g,'**')} for i in range(${lo}, ${hi === 'n' ? n+1 : parseInt(hi)+1}))\nprint('Sum =', total)`
    snippets.ml = `total = sum(arrayfun(@(i) ${expr.replace(/\^/g,'.^')}, ${lo}:${hi === 'n' ? n : hi}));\ndisp(total)`
  }
  return snippets
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPLANATIONS
// ══════════════════════════════════════════════════════════════════════════════

export const EXPLANATIONS = {
  det: {
    eli5: 'The determinant tells you how much a matrix stretches or squishes space. If it\'s 2, areas double. If it\'s 0, everything collapses flat. If it\'s negative, everything flips.',
    student: 'The determinant of a square matrix is a scalar value encoding how the linear transformation scales volume and whether it reverses orientation.',
    college: 'det(A) = signed volume of the parallelepiped spanned by the column vectors. det(AB)=det(A)det(B). A is invertible iff det(A)≠0.',
    advanced: 'The determinant is the unique alternating multilinear form on the columns normalized by det(I)=1. It equals the product of eigenvalues and characterizes the top exterior power of the transformation.',
  },
  eigen: {
    eli5: 'Eigenvectors are special arrows that a matrix only stretches or flips — they don\'t rotate. The eigenvalue is how much they get stretched.',
    student: 'An eigenvector v satisfies Av = λv. λ is the eigenvalue. The matrix doesn\'t change the direction of v, only its magnitude.',
    college: 'Eigenvalues are roots of the characteristic polynomial det(A−λI)=0. Each eigenvalue has an associated eigenspace. Diagonalizable matrices have a full set of linearly independent eigenvectors.',
    advanced: 'Eigendecomposition A=PDP⁻¹ exists when A has n linearly independent eigenvectors. Spectral theorem: symmetric matrices have orthonormal eigenvectors. Eigenvalues of AᵀA are the squares of singular values of A.',
  },
  rref: {
    eli5: 'RREF is a clean form of a matrix — like tidying up a messy equation so each unknown is isolated in its own row.',
    student: 'Row Reduced Echelon Form uses elementary row operations (swap, scale, add multiples) to produce a matrix with leading 1s and zeros above and below each pivot.',
    college: 'RREF is unique for any matrix. Pivot columns correspond to basic variables; free columns correspond to free variables. The rank equals the number of pivots.',
    advanced: 'RREF is the canonical form under the action of GL_n by left multiplication. It reveals the row space, null space, rank, and solutions to linear systems simultaneously.',
  },
  integral: {
    eli5: 'Integration is like finding the area under a curve. If you drive at changing speed, the integral tells you total distance.',
    student: 'The definite integral ∫ₐᵇ f(x)dx gives the signed area between f(x) and the x-axis from a to b.',
    college: 'By the Fundamental Theorem of Calculus, ∫ₐᵇ f(x)dx = F(b)−F(a) where F\'=f. Numerically approximated by Riemann sums or Simpson\'s rule.',
    advanced: 'The Lebesgue integral generalizes Riemann integration to measure theory. Integration is the dual operation to differentiation in the distributional sense.',
  },
  derivative: {
    eli5: 'A derivative is just the slope of a curve at a single point — like asking "how steeply is this hill rising right here?"',
    student: 'The derivative f\'(x) = lim(h→0) [f(x+h)−f(x)]/h measures the instantaneous rate of change of f at x.',
    college: 'Differentiation is a linear operator on smooth functions. Chain rule: d/dx[f(g(x))] = f\'(g(x))g\'(x). Product rule: (fg)\' = f\'g + fg\'.',
    advanced: 'Derivatives generalize to Fréchet derivatives on Banach spaces, the exterior derivative on differential forms, and covariant derivatives in Riemannian geometry.',
  },
  sigma: {
    eli5: 'Sigma (∑) just means "add these up." ∑i=1 to 5 of i means 1+2+3+4+5=15.',
    student: 'Summation notation ∑ᵢ₌ₐᵇ f(i) computes the sum of f(i) for each integer i from a to b. Closed forms replace the loop with a direct formula.',
    college: 'Series convergence, partial sums, and closed-form identities like ∑i=n(n+1)/2 arise from combinatorics, telescoping, and generating functions.',
    advanced: 'Summation is a discrete analogue of integration. The Euler–Maclaurin formula connects sums to integrals. Generating functions and Z-transforms exploit summation structure algebraically.',
  },
  poly: {
    eli5: 'A polynomial is like a curved road described by powers of x. Finding roots means finding where the road crosses zero — where the curve hits the ground.',
    student: 'A polynomial f(x)=aₙxⁿ+…+a₀ has degree n and up to n real roots. Roots are found where f(x)=0.',
    college: 'By the Fundamental Theorem of Algebra, every degree-n polynomial has exactly n roots in ℂ (counting multiplicity). Rational Root Theorem and discriminant characterize real roots.',
    advanced: 'Galois theory characterizes which polynomials are solvable by radicals. Roots of unity, splitting fields, and algebraic closures arise from polynomial structure.',
  },
}

// ══════════════════════════════════════════════════════════════════════════════
// CONNECTIONS
// ══════════════════════════════════════════════════════════════════════════════

export const CONNECTIONS = {
  det: ['eigenvalues', 'inverse', 'linear systems', 'volume', 'orientation', 'graphics transforms', 'cross products'],
  eigen: ['diagonalization', 'SVD', 'PCA', 'PageRank', 'quantum mechanics', 'vibration modes', 'machine learning'],
  rref: ['rank', 'null space', 'column space', 'linear systems', 'inverse', 'least squares'],
  integral: ['area', 'volume', 'probability distributions', 'differential equations', 'Fourier series', 'physics work'],
  derivative: ['tangent lines', 'optimization', 'physics velocity', 'gradient descent', 'differential equations', 'Taylor series'],
  sigma: ['series convergence', 'Riemann sums', 'discrete math', 'probability', 'algorithm analysis Big-O', 'Fourier series'],
  poly: ['factoring', 'roots of unity', 'characteristic polynomial', 'eigenvalues', 'Fourier analysis', 'control systems'],
  inverse: ['solving Ax=b', 'determinant', 'eigenvalues', 'matrix power', 'cryptography'],
  svd: ['PCA', 'image compression', 'least squares', 'pseudoinverse', 'recommendation systems', 'eigenvalues'],
  qr: ['least squares', 'eigenvalue algorithms', 'Gram-Schmidt', 'regression'],
  lu: ['Ax=b solving', 'determinant', 'matrix factorization'],
  dot: ['projection', 'angle between vectors', 'work in physics', 'cosine similarity', 'machine learning features'],
  cross: ['normal vectors', 'area', 'torque', 'magnetic force', '3D graphics'],
}
