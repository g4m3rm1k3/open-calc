import { useState, useEffect, useRef, useMemo } from 'react';
import KatexBlock from '../../components/math/KatexBlock.jsx';

export const meta = {
  label: 'Linear Algebra Calculator',
  group: 'math',
  order: 40,
  glyph: '[A]',
  colorClass: 'text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-black text-[10px]',
  eventTool: 'linear-algebra',
}

// ─── Fraction / display helpers ──────────────────────────────────────────────
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

function toFrac(x, maxD = 120) {
  if (!isFinite(x)) return x > 0 ? '\\infty' : '-\\infty';
  if (Math.abs(x) < 1e-9) return '0';
  const neg = x < 0;
  const ax = Math.abs(x);
  for (let d = 1; d <= maxD; d++) {
    const n = Math.round(ax * d);
    if (Math.abs(n / d - ax) < 1e-9) {
      const g = gcd(n, d);
      const nn = n / g; const dd = d / g;
      if (dd === 1) return neg ? String(-nn) : String(nn);
      return (neg ? '-' : '') + `\\frac{${nn}}{${dd}}`;
    }
  }
  return (Math.abs(x) < 1000 && Math.abs(x - Math.round(x)) < 1e-9)
    ? String(Math.round(x))
    : x.toFixed(4).replace(/\.?0+$/, '');
}

function matLatex(M, prefix = '') {
  const rows = M.map(row => row.map(v => toFrac(v)).join(' & ')).join(' \\\\ ');
  return `${prefix}\\begin{pmatrix} ${rows} \\end{pmatrix}`;
}

function vecLatex(v, name = '') {
  return `${name ? name + ' = ' : ''}\\begin{pmatrix}${v.map(toFrac).join('\\\\')}\\end{pmatrix}`;
}

function augLatex(A, B) {
  const colSpec = Array(A[0].length).fill('r').join('') + '|' + Array(B[0].length).fill('r').join('');
  const rows = A.map((row, i) =>
    [...row, ...B[i]].map(v => toFrac(v)).join(' & ')
  ).join(' \\\\ ');
  return `\\left(\\begin{array}{${colSpec}} ${rows} \\end{array}\\right)`;
}

// ─── Parsing ─────────────────────────────────────────────────────────────────
function parseEntry(s) {
  s = s.trim();
  if (s === '' || s === '-') return NaN;
  if (s.includes('/')) {
    const [n, d] = s.split('/').map(Number);
    return isNaN(n) || isNaN(d) || d === 0 ? NaN : n / d;
  }
  return parseFloat(s);
}

function parseMatrix(grid) { return grid.map(row => row.map(parseEntry)); }
function hasNaN(M) { return M.some(row => row.some(v => isNaN(v))); }

// ─── Core Math ───────────────────────────────────────────────────────────────
function copy(M) { return M.map(r => [...r]); }

function identity(n) {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

function transpose(M) { return M[0].map((_, j) => M.map(r => r[j])); }

function matMul(A, B) {
  const m = A.length, k = A[0].length, n = B[0].length;
  if (B.length !== k) throw new Error('Incompatible dimensions for multiplication');
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      Array.from({ length: k }, (_, p) => A[i][p] * B[p][j]).reduce((s, v) => s + v, 0)
    )
  );
}

function frobeniusNorm(M) {
  return Math.sqrt(M.reduce((s, row) => s + row.reduce((r, x) => r + x * x, 0), 0));
}

function dotVec(u, v) { return u.reduce((s, x, i) => s + x * v[i], 0); }

function det2x2(M) {
  const [[a, b], [c, d]] = M;
  return a * d - b * c;
}

function det3x3(M) {
  const [[a, b, c], [d, e, f], [g, h, i]] = M;
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

function detNxN(M) {
  const n = M.length;
  if (n === 1) return M[0][0];
  if (n === 2) return det2x2(M);
  let result = 0;
  for (let j = 0; j < n; j++) {
    const minor = M.slice(1).map(row => row.filter((_, c) => c !== j));
    result += M[0][j] * Math.pow(-1, j) * detNxN(minor);
  }
  return result;
}

// ─── RREF ────────────────────────────────────────────────────────────────────
function solveRREF(inputM, augment = null) {
  const M = augment ? inputM.map((r, i) => [...r, ...augment[i]]) : copy(inputM);
  const rows = M.length;
  const cols = M[0].length;
  const pivotCols = [];
  const steps = [];
  const nCols = augment ? inputM[0].length : cols;

  const snapshot = () => augment
    ? augLatex(M.map(r => r.slice(0, inputM[0].length)), M.map(r => r.slice(inputM[0].length)))
    : matLatex(M);

  steps.push({ label: 'Start', latex: snapshot() });

  let pivotRow = 0;
  for (let col = 0; col < nCols && pivotRow < rows; col++) {
    let maxRow = pivotRow;
    for (let r = pivotRow + 1; r < rows; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r;
    }
    if (Math.abs(M[maxRow][col]) < 1e-10) continue;

    if (maxRow !== pivotRow) {
      [M[pivotRow], M[maxRow]] = [M[maxRow], M[pivotRow]];
      steps.push({ label: `Swap R_{${pivotRow + 1}} \\leftrightarrow R_{${maxRow + 1}}`, latex: snapshot() });
    }

    const scale = M[pivotRow][col];
    if (Math.abs(scale - 1) > 1e-10) {
      for (let c = 0; c < cols; c++) M[pivotRow][c] /= scale;
      steps.push({ label: `R_{${pivotRow + 1}} \\leftarrow \\frac{1}{${toFrac(scale)}} R_{${pivotRow + 1}}`, latex: snapshot() });
    }

    for (let r = 0; r < rows; r++) {
      if (r === pivotRow || Math.abs(M[r][col]) < 1e-10) continue;
      const factor = M[r][col];
      for (let c = 0; c < cols; c++) M[r][c] -= factor * M[pivotRow][c];
      steps.push({ label: `R_{${r + 1}} \\leftarrow R_{${r + 1}} - (${toFrac(factor)})\\,R_{${pivotRow + 1}}`, latex: snapshot() });
    }

    pivotCols.push(col);
    pivotRow++;
  }

  const rank = pivotCols.length;
  return { result: M, steps, rank, pivotCols };
}

// ─── Determinant ─────────────────────────────────────────────────────────────
function solveDeterminant(M) {
  const n = M.length;
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{Determinant requires a square matrix.}' }];
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  if (n === 2) {
    const [[a, b], [c, d]] = M;
    steps.push({ label: 'Formula for 2×2 determinant', latex: `\\det(A) = ad - bc` });
    steps.push({ label: 'Substitute values', latex: `= (${toFrac(a)})(${toFrac(d)}) - (${toFrac(b)})(${toFrac(c)})` });
    const val = a * d - b * c;
    steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` });
    return steps;
  }

  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = M;
    steps.push({ label: 'Cofactor expansion along row 1', latex: `\\det(A) = a_{11}\\,M_{11} - a_{12}\\,M_{12} + a_{13}\\,M_{13}` });
    const M11 = e * i - f * h, M12 = d * i - f * g, M13 = d * h - e * g;
    steps.push({
      label: 'Compute 2×2 minors',
      latex: `M_{11}=${toFrac(M11)},\\;M_{12}=${toFrac(M12)},\\;M_{13}=${toFrac(M13)}`
    });
    const val = a * M11 - b * M12 + c * M13;
    steps.push({ label: 'Combine', latex: `= ${toFrac(a)}\\cdot${toFrac(M11)} - ${toFrac(b)}\\cdot${toFrac(M12)} + ${toFrac(c)}\\cdot${toFrac(M13)}` });
    steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` });
    return steps;
  }

  const val = detNxN(M);
  steps.push({ label: `${n}×${n} — recursive cofactor expansion`, latex: `\\det(A) = ${toFrac(val)}` });
  steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` });
  return steps;
}

// ─── Inverse ─────────────────────────────────────────────────────────────────
function computeInverseMatrix(M) {
  const n = M.length;
  if (n !== M[0].length) return null;
  const I = identity(n);
  const { result: aug, rank } = solveRREF(copy(M), I);
  if (rank < n) return null;
  return aug.map(r => r.slice(n));
}

function solveInverse(M) {
  const n = M.length;
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{Inverse requires a square matrix.}' }];
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  if (n === 2) {
    const [[a, b], [c, d]] = M;
    const det = a * d - b * c;
    steps.push({ label: 'Step 1 — det(A)', latex: `\\det(A) = (${toFrac(a)})(${toFrac(d)}) - (${toFrac(b)})(${toFrac(c)}) = ${toFrac(det)}` });
    if (Math.abs(det) < 1e-10) {
      steps.push({ label: 'Result', latex: `\\det(A)=0 \\Rightarrow A \\text{ is singular (no inverse)}` });
      return steps;
    }
    const inv = [[d / det, -b / det], [-c / det, a / det]];
    steps.push({ label: 'Step 2 — Adjugate', latex: `\\text{adj}(A) = \\begin{pmatrix}${toFrac(d)}&${toFrac(-b)}\\\\${toFrac(-c)}&${toFrac(a)}\\end{pmatrix}` });
    steps.push({ label: 'Answer', latex: `\\boxed{A^{-1} = ${matLatex(inv)}}` });
    return steps;
  }

  const I = identity(n);
  steps.push({ label: `Form [A \\mid I]`, latex: augLatex(M, I) });
  const { result: aug, steps: rrefSteps, rank } = solveRREF(copy(M), I);
  for (const s of rrefSteps.slice(1)) steps.push(s);
  if (rank < n) {
    steps.push({ label: 'Result', latex: `\\text{Singular (rank < n) — no inverse}` });
    return steps;
  }
  const inv = aug.map(r => r.slice(n));
  steps.push({ label: 'Answer', latex: `\\boxed{A^{-1} = ${matLatex(inv)}}` });
  return steps;
}

// ─── Transpose ───────────────────────────────────────────────────────────────
function solveTranspose(M) {
  const T = transpose(M);
  return [
    { label: 'Matrix', latex: matLatex(M, 'A = ') },
    { label: 'Rule: (Aᵀ)ᵢⱼ = Aⱼᵢ', latex: matLatex(T, 'A^{\\top} = ') },
  ];
}

// ─── Trace ───────────────────────────────────────────────────────────────────
function solveTrace(M) {
  if (M.length !== M[0].length) return [{ label: 'Error', latex: '\\text{Trace requires a square matrix.}' }];
  const diag = M.map((r, i) => r[i]);
  const tr = diag.reduce((s, v) => s + v, 0);
  return [
    { label: 'Matrix', latex: matLatex(M, 'A = ') },
    { label: 'Trace = sum of diagonal entries', latex: `\\text{tr}(A) = ${diag.map(toFrac).join(' + ')} = ${toFrac(tr)}` },
  ];
}

// ─── Eigenvalues NxN — QR iteration ──────────────────────────────────────────
function qrDecomposeGS(M) {
  // Modified Gram-Schmidt QR
  const n = M.length;
  const cols = M[0].map((_, j) => M.map(r => r[j]));
  const Q_cols = [];
  const R = Array.from({ length: n }, () => Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    let v = [...cols[j]];
    for (let i = 0; i < j; i++) {
      const r = dotVec(Q_cols[i], cols[j]);
      R[i][j] = r;
      v = v.map((x, k) => x - r * Q_cols[i][k]);
    }
    const norm = Math.sqrt(dotVec(v, v));
    R[j][j] = norm;
    Q_cols.push(norm < 1e-10 ? v : v.map(x => x / norm));
  }

  const Q = Q_cols[0].map((_, i) => Q_cols.map(col => col[i]));
  return { Q, R };
}

function qrIterate(M, maxIter = 200) {
  let A = copy(M);
  const n = A.length;
  let Q_acc = identity(n);

  for (let iter = 0; iter < maxIter; iter++) {
    const { Q, R } = qrDecomposeGS(A);
    A = matMul(R, Q);
    Q_acc = matMul(Q_acc, Q);

    // Check convergence — sub-diagonal small?
    let offDiag = 0;
    for (let i = 1; i < n; i++) offDiag += Math.abs(A[i][i - 1]);
    if (offDiag < 1e-10) break;
  }

  return { eigenvalues: A.map((r, i) => r[i]), eigenvectorMatrix: Q_acc };
}

function solveEigenvalues(M) {
  const n = M.length;
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{Eigenvalues require a square matrix.}' }];
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  if (n === 2) {
    const [[a, b], [c, d]] = M;
    const tr = a + d, det = a * d - b * c;
    steps.push({ label: 'Characteristic equation: det(A − λI) = 0', latex: `\\lambda^2 - (${toFrac(tr)})\\lambda + (${toFrac(det)}) = 0` });
    const disc = tr * tr - 4 * det;
    steps.push({ label: 'Discriminant', latex: `\\Delta = ${toFrac(disc)}` });

    if (disc < 0) {
      const re = tr / 2, im = Math.sqrt(-disc) / 2;
      steps.push({ label: 'Answer', latex: `\\boxed{\\lambda_{1,2} = ${toFrac(re)} \\pm ${toFrac(im)}\\,i}` });
      return steps;
    }
    const sq = Math.sqrt(disc);
    const l1 = (tr + sq) / 2, l2 = (tr - sq) / 2;
    steps.push({ label: 'Eigenvalues', latex: `\\lambda_1=${toFrac(l1)},\\;\\lambda_2=${toFrac(l2)}` });

    for (const [idx, lam] of [[1, l1], [2, l2]]) {
      if (Math.abs(b) > 1e-10) {
        steps.push({ label: `Eigenvector λ${idx}=${toFrac(lam)}`, latex: `\\mathbf{v}_${idx} = \\begin{pmatrix}${toFrac(-b)}\\\\${toFrac(a - lam)}\\end{pmatrix}` });
      } else if (Math.abs(c) > 1e-10) {
        steps.push({ label: `Eigenvector λ${idx}=${toFrac(lam)}`, latex: `\\mathbf{v}_${idx} = \\begin{pmatrix}${toFrac(d - lam)}\\\\${toFrac(-c)}\\end{pmatrix}` });
      }
    }
    steps.push({ label: 'Answer', latex: `\\boxed{\\lambda_1=${toFrac(l1)},\\;\\lambda_2=${toFrac(l2)}}` });
    return steps;
  }

  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = M;
    const tr = a + e + i;
    const I2 = (a * e + a * i + e * i) - (b * d + c * g + f * h);
    const det = det3x3(M);
    steps.push({ label: 'Characteristic polynomial', latex: `p(\\lambda) = -\\lambda^3 + ${toFrac(tr)}\\lambda^2 - ${toFrac(I2)}\\lambda + ${toFrac(det)}` });
  }

  // QR iteration for eigenvalues and eigenvectors
  steps.push({ label: `Using QR iteration (${n}×${n})`, latex: `A_k = Q_k^\\top A_{k-1} Q_k \\to \\text{Schur form}` });
  const { eigenvalues, eigenvectorMatrix } = qrIterate(M);
  const evStr = eigenvalues.map((v, i) => `\\lambda_${i + 1} = ${toFrac(v)}`).join(', \\quad ');
  steps.push({ label: 'Eigenvalues', latex: evStr });

  // Show approximate eigenvectors from QR
  for (let i = 0; i < n; i++) {
    const col = eigenvectorMatrix.map(r => r[i]);
    steps.push({ label: `Eigenvector for λ${i + 1} = ${toFrac(eigenvalues[i])}`, latex: vecLatex(col, `\\mathbf{v}_${i + 1}`) });
  }

  steps.push({ label: 'Answer', latex: `\\boxed{${eigenvalues.map((v, i) => `\\lambda_${i + 1}=${toFrac(v)}`).join(',\\;')}}` });
  return steps;
}

// ─── Characteristic Polynomial ───────────────────────────────────────────────
function solveCharPoly(M) {
  const n = M.length;
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{Char poly requires a square matrix.}' }];
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  if (n === 2) {
    const tr = M[0][0] + M[1][1], det = det2x2(M);
    steps.push({ label: 'p(λ) = det(A − λI)', latex: `p(\\lambda)=\\lambda^2-${toFrac(tr)}\\lambda+${toFrac(det)}` });
    return steps;
  }
  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = M;
    const tr = a + e + i;
    const I2 = (a * e + a * i + e * i) - (b * d + c * g + f * h);
    const det = det3x3(M);
    steps.push({ label: 'p(λ) = det(A − λI)', latex: `p(\\lambda)=-\\lambda^3+${toFrac(tr)}\\lambda^2-${toFrac(I2)}\\lambda+${toFrac(det)}` });
    steps.push({ label: 'Coefficients', latex: `\\text{tr}(A)=${toFrac(tr)},\\;I_2=${toFrac(I2)},\\;\\det(A)=${toFrac(det)}` });
    return steps;
  }

  // n ≥ 4: show trace and det
  const tr = M.reduce((s, r, i) => s + r[i], 0);
  const det = detNxN(M);
  steps.push({ label: 'Key coefficients', latex: `\\text{tr}(A)=${toFrac(tr)},\\;\\det(A)=${toFrac(det)}` });
  steps.push({ label: 'Note', latex: `\\text{Full characteristic polynomial for ${n}×${n} requires all ${n} invariants.}` });
  return steps;
}

// ─── QR Decomposition ────────────────────────────────────────────────────────
function solveQR(M) {
  const m = M.length, n = M[0].length;
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });
  steps.push({ label: 'Goal: A = QR, Q orthonormal columns, R upper-triangular', latex: 'A = QR' });

  // Modified Gram-Schmidt on columns
  const cols = Array.from({ length: n }, (_, j) => M.map(r => r[j]));
  const Q_cols = [];
  const R = Array.from({ length: n }, () => Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    let v = [...cols[j]];
    for (let i = 0; i < j; i++) {
      const r = dotVec(Q_cols[i], cols[j]);
      R[i][j] = r;
      v = v.map((x, k) => x - r * Q_cols[i][k]);
      steps.push({
        label: `Col ${j + 1}: subtract projection on q${i + 1}`,
        latex: `r_{${i + 1}${j + 1}} = ${toFrac(r)},\\quad \\mathbf{v}_{${j + 1}} \\leftarrow \\mathbf{v}_{${j + 1}} - ${toFrac(r)}\\,\\mathbf{q}_{${i + 1}}`
      });
    }
    const norm = Math.sqrt(dotVec(v, v));
    R[j][j] = norm;
    if (norm < 1e-10) {
      steps.push({ label: `Column ${j + 1} is linearly dependent`, latex: `\\mathbf{v}_{${j + 1}} \\approx \\mathbf{0}` });
      Q_cols.push(Array(m).fill(0));
    } else {
      const q = v.map(x => x / norm);
      Q_cols.push(q);
      steps.push({ label: `Normalize: q${j + 1}`, latex: `r_{${j + 1}${j + 1}} = ${toFrac(norm)},\\quad \\mathbf{q}_{${j + 1}} = ${vecLatex(q)}` });
    }
  }

  const Q = Q_cols[0].map((_, i) => Q_cols.map(col => col[i]));
  steps.push({ label: 'Q matrix (orthonormal columns)', latex: matLatex(Q, 'Q = ') });
  steps.push({ label: 'R matrix (upper triangular)', latex: matLatex(R, 'R = ') });

  // Verify
  const check = matMul(Q, R);
  steps.push({ label: 'Verify: QR = A', latex: `QR = ${matLatex(check)}` });
  return steps;
}

// ─── SVD ─────────────────────────────────────────────────────────────────────
function solveSVD(M) {
  const m = M.length, n = M[0].length;
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });
  steps.push({ label: 'Goal: A = UΣVᵀ', latex: 'A = U\\Sigma V^\\top' });

  // AᵀA gives right singular vectors, eigenvalues = σ²
  const Mt = transpose(M);
  const MtM = matMul(Mt, M);
  steps.push({ label: 'Step 1: Compute AᵀA', latex: matLatex(MtM, 'A^\\top A = ') });

  if (n > 5 || m > 5) {
    steps.push({ label: 'Note', latex: '\\text{SVD shown for up to 5×5 matrices.}' });
    return steps;
  }

  // Eigendecompose AᵀA (symmetric, so eigenvalues real and non-negative)
  const { eigenvalues: evals, eigenvectorMatrix: V } = qrIterate(MtM, 400);

  // Sort descending
  const order = evals.map((v, i) => ({ v: Math.max(0, v), i })).sort((a, b) => b.v - a.v);
  const sigmaVals = order.map(o => Math.sqrt(Math.max(0, o.v)));
  const V_sorted = order.map(o => V.map(r => r[o.i]));

  const sigmaStr = sigmaVals.map((s, i) => `\\sigma_${i + 1} = ${s < 1e-10 ? '0' : toFrac(s)}`).join(', \\quad ');
  steps.push({ label: 'Singular values (√eigenvalues of AᵀA)', latex: sigmaStr });

  // V: right singular vectors (columns of V_sorted transposed)
  const V_mat = V_sorted[0].map((_, i) => V_sorted.map(col => col[i]));
  steps.push({ label: 'V (right singular vectors, columns)', latex: matLatex(V_mat, 'V = ') });

  // U: left singular vectors via U_i = (1/σ_i) A v_i
  const r = sigmaVals.filter(s => s > 1e-10).length;
  const U_cols = [];
  for (let i = 0; i < r; i++) {
    const vi = V_sorted.map(col => col[i]);
    const Avi = M.map(row => dotVec(row, vi));
    const ui = Avi.map(x => x / sigmaVals[i]);
    U_cols.push(ui);
  }
  // Pad U with orthogonal complement if m > r
  // (show what we have)
  const U_part = U_cols[0]?.map((_, i) => U_cols.map(col => col[i])) ?? [[0]];
  steps.push({ label: `U (first ${r} left singular vectors, columns)`, latex: matLatex(U_part, 'U = ') });

  // Σ
  const Sigma = Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j && i < sigmaVals.length) ? sigmaVals[i] : 0)
  );
  steps.push({ label: 'Σ (singular values on diagonal)', latex: matLatex(Sigma, '\\Sigma = ') });
  steps.push({ label: 'Answer', latex: `\\boxed{A = U\\Sigma V^\\top,\\quad \\sigma = [${sigmaVals.map(s => s < 1e-10 ? '0' : toFrac(s)).join(', ')}]}` });
  return steps;
}

// ─── Projection ──────────────────────────────────────────────────────────────
function solveProjection(A, b) {
  const m = A.length, n = A[0].length;
  const bVec = b.map(r => r[0]);
  const steps = [];
  steps.push({ label: 'Project b onto col(A)', latex: `A=${matLatex(A)},\\;\\mathbf{b}=${vecLatex(bVec)}` });
  steps.push({ label: 'Projection formula', latex: `\\mathbf{p} = A(A^\\top A)^{-1}A^\\top \\mathbf{b}` });

  const At = transpose(A);
  const AtA = matMul(At, A);
  steps.push({ label: 'AᵀA', latex: matLatex(AtA, 'A^\\top A = ') });

  const AtA_inv = computeInverseMatrix(AtA);
  if (!AtA_inv) {
    steps.push({ label: 'Error', latex: '\\text{A^\\top A is singular — columns of A are linearly dependent.}' });
    return steps;
  }
  steps.push({ label: '(AᵀA)⁻¹', latex: matLatex(AtA_inv, '(A^\\top A)^{-1} = ') });

  const Atb = matMul(At, b).map(r => r[0]);
  steps.push({ label: 'Aᵀb', latex: vecLatex(Atb, 'A^\\top \\mathbf{b} = ') });

  const coeff = matMul(AtA_inv, Atb.map(x => [x])).map(r => r[0]);
  const p = matMul(A, coeff.map(x => [x])).map(r => r[0]);
  steps.push({ label: 'Projection', latex: vecLatex(p, '\\mathbf{p} = ') });

  // Projection matrix P = A(AtA)⁻¹Aᵀ
  const P = matMul(matMul(A, AtA_inv), At);
  steps.push({ label: 'Projection matrix P = A(AᵀA)⁻¹Aᵀ', latex: matLatex(P, 'P = ') });

  const e = bVec.map((v, i) => v - p[i]);
  const residual = Math.sqrt(e.reduce((s, x) => s + x * x, 0));
  steps.push({ label: 'Error vector b − p', latex: vecLatex(e, '\\mathbf{e} = ') });
  steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{p} = ${vecLatex(p)},\\;\\|\\mathbf{e}\\|=${toFrac(residual)}}` });
  return steps;
}

// ─── Least Squares ───────────────────────────────────────────────────────────
function solveLeastSquares(A, b) {
  const steps = [];
  const bVec = b.map(r => r[0]);
  steps.push({ label: 'Least squares: minimize ‖Ax − b‖', latex: `A=${matLatex(A)},\\;\\mathbf{b}=${vecLatex(bVec)}` });
  steps.push({ label: 'Normal equations: AᵀAx = Aᵀb', latex: `A^\\top A\\,\\hat{x} = A^\\top \\mathbf{b}` });

  const At = transpose(A);
  const AtA = matMul(At, A);
  const Atb = matMul(At, b);
  steps.push({ label: 'AᵀA', latex: matLatex(AtA, 'A^\\top A = ') });
  steps.push({ label: 'Aᵀb', latex: matLatex(Atb, 'A^\\top \\mathbf{b} = ') });

  const { result, rank, pivotCols } = solveRREF(copy(AtA), copy(Atb));
  const xhat = Array(AtA.length).fill(0);
  for (let r = 0; r < result.length; r++) {
    const pc = pivotCols[r];
    if (pc !== undefined) xhat[pc] = result[r][AtA[0].length];
  }
  steps.push({ label: 'Solve normal equations via RREF', latex: vecLatex(xhat, '\\hat{x} = ') });

  const Axhat = matMul(A, xhat.map(x => [x])).map(r => r[0]);
  const e = bVec.map((v, i) => v - Axhat[i]);
  const residual = Math.sqrt(e.reduce((s, x) => s + x * x, 0));
  steps.push({ label: 'Residual b − Ax̂', latex: vecLatex(e, '\\mathbf{e} = ') });
  steps.push({ label: 'Answer', latex: `\\boxed{\\hat{x}=${vecLatex(xhat)},\\;\\|\\mathbf{e}\\|=${toFrac(residual)}}` });
  return steps;
}

// ─── Null Space ───────────────────────────────────────────────────────────────
function solveNullSpace(M) {
  const n = M[0].length;
  const { result, steps, rank, pivotCols } = solveRREF(copy(M));
  const freeCols = Array.from({ length: n }, (_, i) => i).filter(i => !pivotCols.includes(i));
  if (freeCols.length === 0) {
    steps.push({ label: 'Null Space', latex: `\\text{rank}(A) = ${rank} = n \\Rightarrow \\text{Null}(A) = \\{\\mathbf{0}\\}` });
    return steps;
  }
  const nullVectors = freeCols.map(fc => {
    const v = Array(n).fill(0);
    v[fc] = 1;
    for (let r = 0; r < result.length; r++) {
      const pc = pivotCols[r];
      if (pc !== undefined) v[pc] = -(result[r][fc]);
    }
    return v;
  });
  const vStr = nullVectors.map((v, i) => vecLatex(v, `\\mathbf{n}_${i + 1}`)).join(',\\;');
  steps.push({ label: `Null space basis (${freeCols.length} free variable${freeCols.length > 1 ? 's' : ''})`, latex: vStr });
  return steps;
}

// ─── Rank ────────────────────────────────────────────────────────────────────
function solveRank(M) {
  const { steps, rank } = solveRREF(M);
  steps.push({ label: 'Rank = number of pivots', latex: `\\boxed{\\text{rank}(A) = ${rank}}` });
  return steps;
}

// ─── Column Space ─────────────────────────────────────────────────────────────
function solveColumnSpace(M) {
  const { pivotCols, steps } = solveRREF(copy(M));
  const basis = pivotCols.map(c => M.map(r => r[c]));
  if (basis.length === 0) {
    steps.push({ label: 'Column space', latex: '\\text{Only the zero vector.}' });
    return steps;
  }
  steps.push({ label: 'Pivot columns of original A form a basis', latex: basis.map((v, i) => vecLatex(v, `\\mathbf{c}_${i + 1}`)).join(',\\;') });
  return steps;
}

// ─── LU Decomposition ────────────────────────────────────────────────────────
function solveLU(M) {
  const n = M.length;
  if (n !== M[0].length) return [{ label: 'Error', latex: '\\text{LU requires a square matrix.}' }];
  const U = copy(M);
  const L = identity(n);
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  for (let col = 0; col < n; col++) {
    const pivot = U[col][col];
    if (Math.abs(pivot) < 1e-10) {
      steps.push({ label: 'Note', latex: `\\text{Zero pivot at row }${col + 1}\\text{. Row pivoting (LUP) needed.}` });
      return steps;
    }
    for (let row = col + 1; row < n; row++) {
      const factor = U[row][col] / pivot;
      L[row][col] = factor;
      for (let c = col; c < n; c++) U[row][c] -= factor * U[col][c];
      steps.push({ label: `L_{${row + 1}${col + 1}} = ${toFrac(factor)}`, latex: `U = ${matLatex(U)}` });
    }
  }
  steps.push({ label: 'L matrix', latex: matLatex(L, 'L = ') });
  steps.push({ label: 'U matrix', latex: matLatex(U, 'U = ') });
  steps.push({ label: 'Verify', latex: `LU = ${matLatex(matMul(L, U))}` });
  return steps;
}

// ─── Gram-Schmidt ─────────────────────────────────────────────────────────────
function solveGramSchmidt(M) {
  const rows = M.length, cols = M[0].length;
  const steps = [];
  const vectors = Array.from({ length: cols }, (_, c) => Array.from({ length: rows }, (_, r) => M[r][c]));
  const orth = [];

  for (let k = 0; k < vectors.length; k++) {
    let w = [...vectors[k]];
    for (let j = 0; j < orth.length; j++) {
      const num = dotVec(vectors[k], orth[j]);
      const den = dotVec(orth[j], orth[j]);
      if (Math.abs(den) < 1e-10) continue;
      const coeff = num / den;
      w = w.map((x, i) => x - coeff * orth[j][i]);
      steps.push({ label: `Col ${k + 1}: subtract proj on u${j + 1}`, latex: `\\mathbf{w}_${k + 1} \\leftarrow \\mathbf{w}_${k + 1} - ${toFrac(coeff)}\\,\\mathbf{u}_${j + 1}` });
    }
    const norm = Math.sqrt(dotVec(w, w));
    if (norm < 1e-10) continue;
    const u = w.map(x => x / norm);
    orth.push(u);
    steps.push({ label: `Normalize: u${orth.length}`, latex: vecLatex(u, `\\mathbf{u}_${orth.length}`) });
  }

  if (orth.length === 0) { steps.push({ label: 'Result', latex: '\\text{No independent vectors.}' }); return steps; }
  steps.push({ label: 'Orthonormal basis', latex: orth.map((u, i) => vecLatex(u, `\\mathbf{u}_${i + 1}`)).join('\\;') });
  return steps;
}

// ─── Condition Number ────────────────────────────────────────────────────────
function solveConditionNumber(M) {
  if (M.length !== M[0].length) return [{ label: 'Error', latex: '\\text{Condition number requires square matrix.}' }];
  const steps = [];
  const inv = computeInverseMatrix(M);
  if (!inv) { steps.push({ label: 'Condition number', latex: '\\kappa(A)=\\infty\\;\\text{(singular)}' }); return steps; }
  const nA = frobeniusNorm(M), nInv = frobeniusNorm(inv);
  steps.push({ label: 'Definition', latex: '\\kappa_F(A)=\\|A\\|_F\\cdot\\|A^{-1}\\|_F' });
  steps.push({ label: 'Answer', latex: `\\boxed{\\kappa_F(A)=${toFrac(nA * nInv)}}` });
  return steps;
}

// ─── Matrix Power ─────────────────────────────────────────────────────────────
function solveMatrixPower(M, n) {
  if (M.length !== M[0].length) return [{ label: 'Error', latex: '\\text{Matrix power requires square matrix.}' }];
  const steps = [];
  if (!Number.isInteger(n)) { steps.push({ label: 'Error', latex: '\\text{n must be an integer.}' }); return steps; }
  if (n < 0) {
    const inv = computeInverseMatrix(M);
    if (!inv) { steps.push({ label: 'Error', latex: '\\text{A is singular — negative powers undefined.}' }); return steps; }
    M = inv; n = Math.abs(n);
    steps.push({ label: 'Negative power', latex: `A^{-n} = (A^{-1})^{${n}}` });
  }
  const size = M.length;
  let result = identity(size);
  if (n === 0) { steps.push({ label: 'Answer', latex: `A^0 = I = ${matLatex(result)}` }); return steps; }
  steps.push({ label: 'Base', latex: matLatex(M, 'A = ') });
  for (let i = 1; i <= n; i++) {
    result = matMul(result, M);
    if (n <= 5 || i === n) steps.push({ label: `Power ${i}`, latex: `A^{${i}} = ${matLatex(result)}` });
  }
  steps.push({ label: 'Answer', latex: `\\boxed{A^{${n}} = ${matLatex(result)}}` });
  return steps;
}

// ─── Multiply ─────────────────────────────────────────────────────────────────
function solveMultiply(A, B) {
  const steps = [];
  steps.push({ label: 'Matrices', latex: `A=${matLatex(A)},\\;B=${matLatex(B)}` });
  const m = A.length, n = B[0].length, k = B.length;
  if (A[0].length !== k) {
    steps.push({ label: 'Error', latex: `\\text{A is }${m}\\times${A[0].length}\\text{ but B is }${k}\\times${n}\\text{ — cols(A) must equal rows(B)}` });
    return steps;
  }
  steps.push({ label: 'Rule: (AB)ᵢⱼ = row i · col j', latex: `(AB)_{ij}=\\sum_{p}A_{ip}B_{pj}` });
  const C = Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => A[i].reduce((s, v, p) => s + v * B[p][j], 0))
  );
  if (m <= 3 && n <= 3 && k <= 3) {
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const terms = A[i].map((v, p) => `(${toFrac(v)})(${toFrac(B[p][j])})`).join('+');
        steps.push({ label: `Entry (${i + 1},${j + 1})`, latex: `c_{${i + 1}${j + 1}}=${terms}=${toFrac(C[i][j])}` });
      }
    }
  }
  steps.push({ label: 'Answer', latex: `\\boxed{AB=${matLatex(C)}}` });
  return steps;
}

// ─── Add / Subtract / Scalar Multiply ────────────────────────────────────────
function solveAdd(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) return [{ label: 'Error', latex: '\\text{Matrices must have identical dimensions.}' }];
  const C = A.map((row, r) => row.map((v, c) => v + B[r][c]));
  return [
    { label: 'Matrices', latex: `A=${matLatex(A)},\\;B=${matLatex(B)}` },
    { label: 'Answer', latex: `\\boxed{A+B=${matLatex(C)}}` },
  ];
}

function solveSubtract(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) return [{ label: 'Error', latex: '\\text{Matrices must have identical dimensions.}' }];
  const C = A.map((row, r) => row.map((v, c) => v - B[r][c]));
  return [
    { label: 'Matrices', latex: `A=${matLatex(A)},\\;B=${matLatex(B)}` },
    { label: 'Answer', latex: `\\boxed{A-B=${matLatex(C)}}` },
  ];
}

function solveScalarMul(A, scalar) {
  const C = A.map(row => row.map(v => v * scalar));
  return [
    { label: 'Matrix', latex: matLatex(A, 'A = ') },
    { label: 'Answer', latex: `\\boxed{${toFrac(scalar)}A=${matLatex(C)}}` },
  ];
}

// ─── Dot product ──────────────────────────────────────────────────────────────
function solveDot(A, B) {
  const u = A.flat(), v = B.flat();
  if (u.length !== v.length) return [{ label: 'Error', latex: '\\text{Vectors must have equal length.}' }];
  const result = u.reduce((s, ui, i) => s + ui * v[i], 0);
  const terms = u.map((ui, i) => `(${toFrac(ui)})(${toFrac(v[i])})`).join('+');
  return [
    { label: 'Vectors', latex: `${vecLatex(u, '\\mathbf{u}')},\\;${vecLatex(v, '\\mathbf{v}')}` },
    { label: 'Compute', latex: `\\mathbf{u}\\cdot\\mathbf{v} = ${terms} = ${toFrac(result)}` },
    { label: 'Answer', latex: `\\boxed{\\mathbf{u}\\cdot\\mathbf{v}=${toFrac(result)}}` },
  ];
}

// ─── Cross product (2D scalar, 3D vector, generalized note) ──────────────────
function solveCross(A, B) {
  const u = A.flat(), v = B.flat();
  const steps = [];

  if (u.length !== v.length) {
    steps.push({ label: 'Error', latex: '\\text{Both vectors must have the same length.}' });
    return steps;
  }

  const n = u.length;
  steps.push({ label: 'Vectors', latex: `${vecLatex(u, '\\mathbf{u}')},\\;${vecLatex(v, '\\mathbf{v}')}` });

  if (n === 2) {
    // 2D cross product gives a scalar (the z-component of the 3D cross)
    const scalar = u[0] * v[1] - u[1] * v[0];
    steps.push({ label: '2D cross product (scalar — z-component of 3D result)', latex: `\\mathbf{u}\\times\\mathbf{v} = u_1 v_2 - u_2 v_1` });
    steps.push({ label: 'Compute', latex: `= (${toFrac(u[0])})(${toFrac(v[1])}) - (${toFrac(u[1])})(${toFrac(v[0])})` });
    steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{u}\\times\\mathbf{v} = ${toFrac(scalar)}}` });
    const angle = Math.abs(scalar) > 1e-10 ? `\\text{Sign: ${scalar > 0 ? 'v is CCW from u' : 'v is CW from u'}}` : '\\text{u and v are parallel}';
    steps.push({ label: 'Geometric meaning', latex: angle });
    return steps;
  }

  if (n === 3) {
    const [a1, a2, a3] = u, [b1, b2, b3] = v;
    steps.push({
      label: 'Determinant formula',
      latex: `\\mathbf{u}\\times\\mathbf{v} = \\begin{vmatrix}\\mathbf{i}&\\mathbf{j}&\\mathbf{k}\\\\${toFrac(a1)}&${toFrac(a2)}&${toFrac(a3)}\\\\${toFrac(b1)}&${toFrac(b2)}&${toFrac(b3)}\\end{vmatrix}`
    });
    const cx = a2 * b3 - a3 * b2, cy = a3 * b1 - a1 * b3, cz = a1 * b2 - a2 * b1;
    steps.push({
      label: 'Expand cofactors',
      latex: `= \\mathbf{i}(${toFrac(a2)}\\cdot${toFrac(b3)}-${toFrac(a3)}\\cdot${toFrac(b2)}) - \\mathbf{j}(${toFrac(a1)}\\cdot${toFrac(b3)}-${toFrac(a3)}\\cdot${toFrac(b1)}) + \\mathbf{k}(${toFrac(a1)}\\cdot${toFrac(b2)}-${toFrac(a2)}\\cdot${toFrac(b1)})`
    });
    const result = [cx, cy, cz];
    const mag = Math.sqrt(cx * cx + cy * cy + cz * cz);
    steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{u}\\times\\mathbf{v} = ${vecLatex(result)}}` });
    steps.push({ label: '‖u × v‖ = area of parallelogram', latex: `\\|\\mathbf{u}\\times\\mathbf{v}\\| = ${toFrac(mag)}` });
    const dot = dotVec(result, u);
    steps.push({ label: 'Verify orthogonality: (u×v)·u = 0', latex: `(\\mathbf{u}\\times\\mathbf{v})\\cdot\\mathbf{u} = ${toFrac(dot)} ${Math.abs(dot) < 1e-9 ? '\\checkmark' : '\\neq 0'}` });
    return steps;
  }

  if (n === 7) {
    // 7D cross product exists (octonion-based), show note and formula
    steps.push({
      label: '7D cross product exists (octonion structure)',
      latex: `\\text{The 7D cross product satisfies } \\mathbf{u}\\times\\mathbf{v}\\perp\\mathbf{u},\\mathbf{v} \\text{ and is not unique.}`
    });
    // Compute one standard 7D cross product using Cayley table
    // Standard definition from Lounesto / Massey
    const w = Array(7).fill(0);
    const cayley = [[1,2],[2,4],[3,7],[4,1],[5,6],[6,3],[7,5],
                    [1,3],[2,7],[3,2],[4,6],[5,1],[6,4],[7,0+1],
                    [1,4],[2,1],[3,5],[4,3],[5,7],[6,0+2],[7,6],
                    [1,5],[2,6],[3,0+1],[4,7],[5,0+4],[6,0+1],[7,0+2]];
    // Use the standard 7D formula (e1..e7):
    // w1 = u2v4 - u4v2 + u3v7 - u7v3 + u5v6 - u6v5
    // w2 = u3v5 - u5v3 + u4v1 - u1v4 + u6v7 - u7v6
    // w3 = u4v6 - u6v4 + u5v2 - u2v5 + u7v1 - u1v7
    // w4 = u5v7 - u7v5 + u6v3 - u3v6 + u1v2 - u2v1
    // w5 = u6v1 - u1v6 + u7v4 - u4v7 + u2v3 - u3v2
    // w6 = u7v2 - u2v7 + u1v5 - u5v1 + u3v4 - u4v3
    // w7 = u1v3 - u3v1 + u2v6 - u6v2 + u4v5 - u5v4
    const [u1,u2,u3,u4,u5,u6,u7] = u;
    const [v1,v2,v3,v4,v5,v6,v7] = v;
    const result7 = [
      u2*v4-u4*v2 + u3*v7-u7*v3 + u5*v6-u6*v5,
      u3*v5-u5*v3 + u4*v1-u1*v4 + u6*v7-u7*v6,
      u4*v6-u6*v4 + u5*v2-u2*v5 + u7*v1-u1*v7,
      u5*v7-u7*v5 + u6*v3-u3*v6 + u1*v2-u2*v1,
      u6*v1-u1*v6 + u7*v4-u4*v7 + u2*v3-u3*v2,
      u7*v2-u2*v7 + u1*v5-u5*v1 + u3*v4-u4*v3,
      u1*v3-u3*v1 + u2*v6-u6*v2 + u4*v5-u5*v4,
    ];
    steps.push({ label: 'Answer (7D)', latex: `\\boxed{\\mathbf{u}\\times\\mathbf{v} = ${vecLatex(result7)}}` });
    return steps;
  }

  // General n ≠ 2, 3, 7
  steps.push({
    label: 'Note',
    latex: `\\text{The binary cross product is only defined in }\\mathbb{R}^3\\text{ and }\\mathbb{R}^7.\\text{ For }\\mathbb{R}^2\\text{ a scalar version exists.}`
  });
  steps.push({
    label: 'Generalized exterior product (wedge product)',
    latex: `\\mathbf{u}\\wedge\\mathbf{v} = \\text{ (skew-symmetric matrix, shown for your }${n}\\text{D input)}`
  });
  // Show wedge product matrix for general n
  const wedge = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => u[i] * v[j] - u[j] * v[i])
  );
  steps.push({ label: 'Wedge product matrix (u ∧ v)ᵢⱼ = uᵢvⱼ − uⱼvᵢ', latex: matLatex(wedge) });
  return steps;
}

// ─── Norm ─────────────────────────────────────────────────────────────────────
function solveNorm(M) {
  const v = M.flat();
  const sumSq = v.reduce((s, x) => s + x * x, 0);
  const norm = Math.sqrt(sumSq);
  const l1 = v.reduce((s, x) => s + Math.abs(x), 0);
  const linf = Math.max(...v.map(Math.abs));
  return [
    { label: 'Vector', latex: vecLatex(v, '\\mathbf{v}') },
    { label: 'L2 Norm', latex: `\\|\\mathbf{v}\\|_2=\\sqrt{${v.map(x => `(${toFrac(x)})^2`).join('+')}} = ${toFrac(norm)}` },
    { label: 'L1 Norm (Taxicab)', latex: `\\|\\mathbf{v}\\|_1 = ${toFrac(l1)}` },
    { label: 'L∞ Norm (Max)', latex: `\\|\\mathbf{v}\\|_\\infty = ${toFrac(linf)}` },
    { label: 'Answer', latex: `\\boxed{\\|\\mathbf{v}\\|_2=${toFrac(norm)}}` },
  ];
}

// ─── Linear System ────────────────────────────────────────────────────────────
function solveLinearSystem(A, bCol) {
  const n = A[0].length;
  const steps = [];
  steps.push({ label: 'System', latex: `A=${matLatex(A)},\\;\\mathbf{b}=${matLatex(bCol)}` });
  steps.push({ label: 'Form augmented matrix [A|b]', latex: augLatex(A, bCol) });

  const { result, steps: rrefSteps, rank, pivotCols } = solveRREF(copy(A), bCol);
  for (const s of rrefSteps.slice(1)) steps.push(s);

  const inconsistent = result.some(row => {
    const leftZero = row.slice(0, n).every(v => Math.abs(v) < 1e-10);
    return leftZero && Math.abs(row[n]) > 1e-10;
  });

  if (inconsistent) { steps.push({ label: 'Conclusion', latex: '\\text{Inconsistent — no solution.}' }); return steps; }

  if (rank < n) {
    const free = Array.from({ length: n }, (_, i) => i).filter(i => !pivotCols.includes(i));
    steps.push({ label: 'Infinitely many solutions', latex: `\\text{Free variables: }${free.map(i => `x_{${i + 1}}`).join(', ')}` });
    return steps;
  }

  const x = Array(n).fill(0);
  for (let r = 0; r < result.length; r++) {
    const pc = pivotCols[r];
    if (pc !== undefined) x[pc] = result[r][n];
  }
  steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{x}=${vecLatex(x)}}` });
  return steps;
}

// ─── 2D Transform ────────────────────────────────────────────────────────────
function solveTransform2D(M) {
  if (M.length !== 2 || M[0].length !== 2) return [{ label: 'Error', latex: '\\text{2D transform requires a 2×2 matrix.}' }];
  const det = det2x2(M);
  return [
    { label: 'Matrix', latex: matLatex(M, 'A = ') },
    { label: 'Image of basis vectors', latex: `A\\mathbf{e}_1=${vecLatex(M.map(r => r[0]))},\\;A\\mathbf{e}_2=${vecLatex(M.map(r => r[1]))}` },
    { label: 'Area scale + orientation', latex: `\\det(A)=${toFrac(det)}${det < 0 ? '\\text{ (reflection)}' : det > 0 ? '' : '\\text{ (collapse)}'}` },
  ];
}

// ─── OPERATIONS CONFIG ────────────────────────────────────────────────────────
// squareOnly: forces rows=cols
// vectorMode: A is a column vector
// needsB: shows second matrix/vector input
// solveMode: B is a b-vector
// hasN: shows scalar/exponent input
// fixedRows, fixedCols: lock grid dimensions
// allowRectA / allowRectB: show separate rows/cols controls
const OPERATIONS = [
  // ── Single matrix ──────────────────────────────────────────────────────────
  { id: 'det',        label: 'Determinant',          icon: '|A|',  needsB: false, squareOnly: true,  minRows: 2, maxRows: 6, minCols: 2, maxCols: 6 },
  { id: 'rref',       label: 'RREF',                 icon: 'RREF', needsB: false, squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'rank',       label: 'Rank',                 icon: 'rk',   needsB: false, squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'null',       label: 'Null Space',           icon: 'ker',  needsB: false, squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'colspace',   label: 'Column Space',         icon: 'col',  needsB: false, squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'inverse',    label: 'Inverse',              icon: 'A⁻¹',  needsB: false, squareOnly: true,  minRows: 2, maxRows: 5, minCols: 2, maxCols: 5 },
  { id: 'transpose',  label: 'Transpose',            icon: 'Aᵀ',   needsB: false, squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'trace',      label: 'Trace',                icon: 'tr',   needsB: false, squareOnly: true,  minRows: 2, maxRows: 6, minCols: 2, maxCols: 6 },
  { id: 'lu',         label: 'LU Decomposition',     icon: 'LU',   needsB: false, squareOnly: true,  minRows: 2, maxRows: 5, minCols: 2, maxCols: 5 },
  { id: 'charpoly',   label: 'Characteristic Poly',  icon: 'χ(λ)', needsB: false, squareOnly: true,  minRows: 2, maxRows: 5, minCols: 2, maxCols: 5 },
  { id: 'eigen',      label: 'Eigenvalues & Vectors', icon: 'λv',  needsB: false, squareOnly: true,  minRows: 2, maxRows: 5, minCols: 2, maxCols: 5 },
  { id: 'qr',         label: 'QR Decomposition',     icon: 'QR',   needsB: false, squareOnly: false, minRows: 2, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'svd',        label: 'SVD (A=UΣVᵀ)',         icon: 'SVD',  needsB: false, squareOnly: false, minRows: 1, maxRows: 5, minCols: 1, maxCols: 5 },
  { id: 'gramschmidt',label: 'Gram-Schmidt',         icon: 'GS',   needsB: false, squareOnly: false, minRows: 2, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'cond',       label: 'Condition Number',     icon: 'κ',    needsB: false, squareOnly: true,  minRows: 2, maxRows: 4, minCols: 2, maxCols: 4 },
  { id: 'power',      label: 'Matrix Power Aⁿ',      icon: 'Aⁿ',   needsB: false, squareOnly: true,  minRows: 2, maxRows: 5, minCols: 2, maxCols: 5, hasN: true },
  { id: 'transform2d',label: '2D Transform',         icon: '⊞',    needsB: false, squareOnly: true,  minRows: 2, maxRows: 2, minCols: 2, maxCols: 2, fixedSize: 2 },
  // ── Two matrices / vectors ──────────────────────────────────────────────────
  { id: 'multiply',   label: 'Multiply A×B',         icon: 'A×B',  needsB: true,  squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, rectB: true },
  { id: 'add',        label: 'Add A+B',              icon: 'A+B',  needsB: true,  squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'subtract',   label: 'Subtract A−B',         icon: 'A−B',  needsB: true,  squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6 },
  { id: 'scalarmul',  label: 'Scalar Multiply cA',   icon: 'cA',   needsB: false, squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, hasN: true },
  { id: 'solve',      label: 'Solve Ax=b',           icon: 'Ax=b', needsB: true,  squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, solveMode: true },
  { id: 'project',    label: 'Projection onto col(A)',icon: 'proj', needsB: true,  squareOnly: false, minRows: 1, maxRows: 6, minCols: 1, maxCols: 6, solveMode: true },
  { id: 'leastsq',    label: 'Least Squares',        icon: 'LS',   needsB: true,  squareOnly: false, minRows: 2, maxRows: 6, minCols: 1, maxCols: 6, solveMode: true },
  // ── Vector ops ──────────────────────────────────────────────────────────────
  { id: 'dot',        label: 'Dot Product',          icon: 'u·v',  needsB: true,  squareOnly: false, minRows: 2, maxRows: 8, minCols: 1, maxCols: 1, vectorMode: true },
  { id: 'cross',      label: 'Cross Product',        icon: 'u×v',  needsB: true,  squareOnly: false, minRows: 2, maxRows: 7, minCols: 1, maxCols: 1, vectorMode: true },
  { id: 'norm',       label: 'Vector Norm',          icon: '‖v‖',  needsB: false, squareOnly: false, minRows: 2, maxRows: 8, minCols: 1, maxCols: 1, vectorMode: true },
];

// ─── blank grid ───────────────────────────────────────────────────────────────
function blankGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(''));
}

function resizePreserve(grid, newRows, newCols) {
  const next = blankGrid(newRows, newCols);
  const r = Math.min(grid.length, newRows);
  const c = Math.min(grid[0]?.length ?? 0, newCols);
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) next[i][j] = grid[i][j];
  return next;
}

// ─── MatrixGrid component ─────────────────────────────────────────────────────
function MatrixGrid({ grid, setGrid, label, dark }) {
  const bg = dark
    ? 'bg-[#0d1117] border-slate-700 text-slate-200 focus:border-violet-400'
    : 'bg-white border-slate-300 text-slate-800 focus:border-violet-500';
  return (
    <div>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <div className="overflow-x-auto">
        <table className="border-separate" style={{ borderSpacing: '3px' }}>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>
                    <input
                      value={cell}
                      onChange={e => {
                        const next = grid.map(r => [...r]);
                        next[ri][ci] = e.target.value;
                        setGrid(next);
                      }}
                      className={`w-12 h-9 text-center text-xs font-mono rounded-lg border outline-none transition-colors ${bg}`}
                      placeholder="0"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 2D Transform visualizer ─────────────────────────────────────────────────
function Transform2DView({ M, dark }) {
  const e1 = [1, 0], e2 = [0, 1];
  const t1 = [M[0][0], M[1][0]], t2 = [M[0][1], M[1][1]];
  const vectors = [e1, e2, t1, t2];
  const maxAbs = Math.max(1, ...vectors.flat().map(v => Math.abs(v)));
  const pad = 16, viewSize = 220, half = viewSize / 2;
  const scale = (half - pad) / maxAbs;
  const toSvg = (x, y) => ({ x: half + x * scale, y: half - y * scale });
  const axisColor = dark ? '#64748b' : '#94a3b8';
  const gridColor = dark ? '#334155' : '#cbd5e1';
  const Arrow = ({ v, stroke }) => {
    const p0 = toSvg(0, 0), p1 = toSvg(v[0], v[1]);
    return <><line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={stroke} strokeWidth="2.5" /><circle cx={p1.x} cy={p1.y} r="3.2" fill={stroke} /></>;
  };
  return (
    <div className={`rounded-xl border ${dark ? 'border-slate-700 bg-[#0d1117]' : 'border-slate-200 bg-white'} p-2`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>2D Transform Visual</p>
      <svg width="100%" viewBox={`0 0 ${viewSize} ${viewSize}`}>
        {[...Array(9)].map((_, i) => {
          const t = i * (viewSize / 8);
          return <g key={i}><line x1={t} y1="0" x2={t} y2={viewSize} stroke={gridColor} strokeWidth="0.6" opacity="0.5" /><line x1="0" y1={t} x2={viewSize} y2={t} stroke={gridColor} strokeWidth="0.6" opacity="0.5" /></g>;
        })}
        <line x1={half} y1="0" x2={half} y2={viewSize} stroke={axisColor} strokeWidth="1.3" />
        <line x1="0" y1={half} x2={viewSize} y2={half} stroke={axisColor} strokeWidth="1.3" />
        <Arrow v={e1} stroke="#22c55e" />
        <Arrow v={e2} stroke="#38bdf8" />
        <Arrow v={t1} stroke="#f97316" />
        <Arrow v={t2} stroke="#e11d48" />
      </svg>
      <div className={`text-[10px] mt-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        <span className="mr-2">orig e1/e2: green/blue</span><span>Ae1/Ae2: orange/red</span>
      </div>
    </div>
  );
}

// ─── Dimension Picker ─────────────────────────────────────────────────────────
function DimPicker({ label, value, min, max, onChange, dark }) {
  const muted = dark ? 'text-slate-400' : 'text-slate-500';
  const options = [];
  for (let i = min; i <= max; i++) options.push(i);
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] font-bold uppercase tracking-widest ${muted} w-10`}>{label}</span>
      <div className="flex gap-1">
        {options.map(v => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all ${
              value === v
                ? 'bg-sky-500 text-white border-sky-500'
                : dark
                  ? 'bg-[#21262d] border-slate-700 text-slate-300 hover:border-sky-400'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-sky-400'
            }`}
          >{v}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
function LAPanel({ dark }) {
  const [opId, setOpId] = useState('det');
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(1);
  const [gridA, setGridA] = useState(() => blankGrid(3, 3));
  const [gridB, setGridB] = useState(() => blankGrid(3, 1));
  const [scalarN, setScalarN] = useState(2);
  const [steps, setSteps] = useState(null);
  const [error, setError] = useState('');

  const op = OPERATIONS.find(o => o.id === opId) ?? OPERATIONS[0];

  // Sync grid sizes when operation or dimensions change
  useEffect(() => {
    const aR = op.fixedSize ?? Math.max(op.minRows, Math.min(op.maxRows, rowsA));
    const aC = op.vectorMode ? 1 : op.fixedSize ?? Math.max(op.minCols, Math.min(op.maxCols, colsA));
    const bR = op.fixedSize ?? Math.max(op.minRows, Math.min(op.maxRows, op.vectorMode ? aR : rowsB));
    const bC = (op.solveMode || op.vectorMode) ? 1 : op.fixedSize ?? Math.max(op.minCols, Math.min(op.maxCols, colsB));

    setGridA(prev => resizePreserve(prev, aR, aC));
    if (op.needsB) setGridB(prev => resizePreserve(prev, bR, bC));
    setSteps(null); setError('');
  }, [opId]);

  useEffect(() => {
    const aR = op.fixedSize ?? rowsA;
    const aC = op.vectorMode ? 1 : op.fixedSize ?? colsA;
    setGridA(prev => resizePreserve(prev, aR, aC));
    setSteps(null); setError('');
  }, [rowsA, colsA]);

  useEffect(() => {
    if (!op.needsB) return;
    const bR = op.vectorMode ? rowsA : rowsB;
    const bC = (op.solveMode || op.vectorMode) ? 1 : colsB;
    setGridB(prev => resizePreserve(prev, bR, bC));
    setSteps(null); setError('');
  }, [rowsB, colsB, rowsA]);

  const bg0 = dark ? 'bg-[#0d1117]' : 'bg-slate-100';
  const bg2 = dark ? 'bg-[#21262d]' : 'bg-slate-50';
  const bdr = dark ? 'border-slate-700' : 'border-slate-200';
  const txt = dark ? 'text-slate-100' : 'text-slate-800';
  const muted = dark ? 'text-slate-400' : 'text-slate-500';

  const handleSolve = () => {
    setError(''); setSteps(null);
    try {
      const A = parseMatrix(gridA);
      if (hasNaN(A)) { setError('Matrix A has empty or invalid entries.'); return; }

      if (op.id === 'det')        return setSteps(solveDeterminant(A));
      if (op.id === 'rref')       return setSteps(solveRREF(A).steps);
      if (op.id === 'inverse')    return setSteps(solveInverse(A));
      if (op.id === 'transpose')  return setSteps(solveTranspose(A));
      if (op.id === 'trace')      return setSteps(solveTrace(A));
      if (op.id === 'rank')       return setSteps(solveRank(A));
      if (op.id === 'null')       return setSteps(solveNullSpace(A));
      if (op.id === 'eigen')      return setSteps(solveEigenvalues(A));
      if (op.id === 'lu')         return setSteps(solveLU(A));
      if (op.id === 'colspace')   return setSteps(solveColumnSpace(A));
      if (op.id === 'charpoly')   return setSteps(solveCharPoly(A));
      if (op.id === 'cond')       return setSteps(solveConditionNumber(A));
      if (op.id === 'power')      return setSteps(solveMatrixPower(A, scalarN));
      if (op.id === 'scalarmul')  return setSteps(solveScalarMul(A, scalarN));
      if (op.id === 'gramschmidt') return setSteps(solveGramSchmidt(A));
      if (op.id === 'qr')         return setSteps(solveQR(A));
      if (op.id === 'svd')        return setSteps(solveSVD(A));
      if (op.id === 'transform2d') return setSteps(solveTransform2D(A));
      if (op.id === 'norm')       return setSteps(solveNorm(A));

      // Two-matrix ops
      const B = parseMatrix(gridB);
      if (hasNaN(B)) { setError('Matrix B / vector b has empty or invalid entries.'); return; }

      if (op.id === 'multiply')   return setSteps(solveMultiply(A, B));
      if (op.id === 'add')        return setSteps(solveAdd(A, B));
      if (op.id === 'subtract')   return setSteps(solveSubtract(A, B));
      if (op.id === 'solve')      return setSteps(solveLinearSystem(A, B));
      if (op.id === 'project')    return setSteps(solveProjection(A, B));
      if (op.id === 'leastsq')    return setSteps(solveLeastSquares(A, B));
      if (op.id === 'dot')        return setSteps(solveDot(A, B));
      if (op.id === 'cross')      return setSteps(solveCross(A, B));
    } catch (err) {
      setError('Unexpected error: ' + err.message);
    }
  };

  const parsedA = useMemo(() => parseMatrix(gridA), [gridA]);
  const canShowTransform = op.id === 'transform2d' && !hasNaN(parsedA);

  // Group operations for display
  const opGroups = [
    { label: 'Decompositions', ids: ['rref', 'lu', 'qr', 'svd', 'eigen', 'gramschmidt'] },
    { label: 'Properties', ids: ['det', 'rank', 'trace', 'charpoly', 'cond'] },
    { label: 'Space / Null', ids: ['null', 'colspace', 'inverse', 'transpose'] },
    { label: 'Ops', ids: ['multiply', 'add', 'subtract', 'scalarmul', 'power', 'transform2d'] },
    { label: 'Systems', ids: ['solve', 'project', 'leastsq'] },
    { label: 'Vectors', ids: ['dot', 'cross', 'norm'] },
  ];

  const effectiveRows = op.fixedSize ?? rowsA;
  const effectiveCols = op.vectorMode ? 1 : op.fixedSize ?? colsA;

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[78vh]">
      {/* Operation selector — grouped */}
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${muted}`}>Operation</p>
        <div className="space-y-2">
          {opGroups.map(group => (
            <div key={group.label}>
              <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${muted} opacity-60`}>{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.ids.map(id => {
                  const o = OPERATIONS.find(x => x.id === id);
                  if (!o) return null;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setOpId(o.id)}
                      title={o.label}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        opId === o.id
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : dark
                            ? 'bg-[#21262d] border-slate-700 text-slate-300 hover:border-violet-500 hover:text-violet-400'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600'
                      }`}
                    >{o.icon}</button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className={`text-xs ${muted} mt-1.5 font-semibold`}>{op.label}</p>
      </div>

      {/* Scalar / exponent input */}
      {op.hasN && (
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${muted}`}>
            {op.id === 'scalarmul' ? 'Scalar c' : 'Exponent n'}
          </p>
          <input
            type="number"
            step={op.id === 'scalarmul' ? '0.1' : '1'}
            value={scalarN}
            onChange={e => setScalarN(op.id === 'scalarmul' ? parseFloat(e.target.value || '1') : parseInt(e.target.value || '0', 10))}
            className={`w-28 h-9 text-center text-sm font-mono rounded-lg border outline-none transition-colors ${dark ? 'bg-[#0d1117] border-slate-700 text-slate-200 focus:border-violet-400' : 'bg-white border-slate-300 text-slate-800 focus:border-violet-500'}`}
          />
        </div>
      )}

      {/* Dimension controls — Matrix A */}
      {!op.fixedSize && (
        <div className="space-y-1.5">
          <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>
            {op.vectorMode ? 'Vector A length' : 'Matrix A size'}
          </p>
          {!op.vectorMode ? (
            <>
              <DimPicker label="Rows" value={rowsA} min={op.minRows} max={op.maxRows} onChange={setRowsA} dark={dark} />
              {!op.squareOnly && (
                <DimPicker label="Cols" value={colsA} min={op.minCols} max={op.maxCols} onChange={v => { setColsA(v); if (!op.squareOnly) setRowsA(rowsA); }} dark={dark} />
              )}
              {op.squareOnly && (
                <DimPicker label="Cols" value={rowsA} min={op.minRows} max={op.maxRows} onChange={setRowsA} dark={dark} />
              )}
            </>
          ) : (
            <DimPicker label="n" value={rowsA} min={op.minRows} max={op.maxRows} onChange={setRowsA} dark={dark} />
          )}
        </div>
      )}

      {/* Dimension controls — Matrix B (for multiply only, where B can have independent cols) */}
      {op.needsB && !op.solveMode && !op.vectorMode && op.id === 'multiply' && (
        <div className="space-y-1.5">
          <p className={`text-[10px] font-bold uppercase tracking-widest ${muted}`}>Matrix B size</p>
          <p className={`text-[9px] ${muted}`}>Rows of B must equal cols of A ({effectiveCols})</p>
          <DimPicker label="Cols" value={colsB} min={1} max={6} onChange={setColsB} dark={dark} />
        </div>
      )}

      {/* Matrix inputs */}
      <div className="flex flex-wrap gap-4">
        <MatrixGrid
          grid={gridA}
          setGrid={setGridA}
          label={op.vectorMode ? 'Vector u' : 'Matrix A'}
          dark={dark}
        />
        {op.needsB && (
          <MatrixGrid
            grid={gridB}
            setGrid={setGridB}
            label={op.solveMode ? 'Vector b' : op.vectorMode ? 'Vector v' : 'Matrix B'}
            dark={dark}
          />
        )}
      </div>

      {canShowTransform && <Transform2DView M={parsedA} dark={dark} />}

      {/* Solve */}
      <button
        onClick={handleSolve}
        className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold tracking-wide transition-all shadow-md shadow-violet-500/20"
      >
        Solve →
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>
      )}

      {/* Steps */}
      {steps && steps.length > 0 && (
        <div className={`rounded-xl border ${bdr} ${bg0} overflow-hidden`}>
          <div className={`px-3 py-2 border-b ${bdr} ${bg2} flex items-center gap-2`}>
            <span className="text-violet-400 text-base">✓</span>
            <span className={`text-xs font-bold ${txt}`}>{op.label} — Step-by-Step</span>
          </div>
          <div className="divide-y divide-slate-700/30">
            {steps.map((step, i) => (
              <div key={i} className={`px-3 py-2.5 ${i % 2 === 0 ? '' : (dark ? 'bg-white/[0.02]' : 'bg-slate-50/60')}`}>
                {step.label && (
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    step.label.includes('Answer') ? 'text-emerald-400'
                    : step.label.includes('Error') || step.label.includes('singular') ? 'text-rose-400'
                    : muted
                  }`}>
                    {step.label}
                  </p>
                )}
                {step.latex && <KatexBlock expr={step.latex} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LinearAlgebraCalculator({ dark = true }) {
  return <LAPanel dark={dark} />;
}
