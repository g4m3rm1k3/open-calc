import { useState, useEffect, useRef, useMemo } from 'react';
import KatexBlock from '../math/KatexBlock.jsx';

// ─── Fraction / display helpers ──────────────────────────────────────────────
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

/** Convert a float to a LaTeX fraction string for "nice" values. */
function toFrac(x, maxD = 120) {
  if (!isFinite(x)) return x > 0 ? '\\infty' : '-\\infty';
  if (Math.abs(x) < 1e-10) return '0';
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

/** Format a matrix as a LaTeX pmatrix string. */
function matLatex(M, prefix = '') {
  const rows = M.map(row => row.map(v => toFrac(v)).join(' & ')).join(' \\\\ ');
  return `${prefix}\\begin{pmatrix} ${rows} \\end{pmatrix}`;
}

/** Format a matrix augmented with another [A|B] */
function augLatex(A, B) {
  const n = A.length;
  const cols = A[0].length + B[0].length;
  // Build array environment with vertical bar
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

function parseMatrix(grid) {
  return grid.map(row => row.map(parseEntry));
}

function hasNaN(M) { return M.some(row => row.some(v => isNaN(v))); }

// ─── Core Math ───────────────────────────────────────────────────────────────

/** Deep copy a matrix */
function copy(M) { return M.map(r => [...r]); }

function identity(n) {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

function matMul(A, B) {
  const m = A.length;
  const k = A[0].length;
  const n = B[0].length;
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

function dotVec(u, v) {
  return u.reduce((s, x, i) => s + x * v[i], 0);
}

/** Determinant — returns { value, steps[] } */
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

function solveDeterminant(M) {
  const n = M.length;
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  if (n === 2) {
    const [[a, b], [c, d]] = M;
    steps.push({
      label: 'Formula for 2×2 determinant',
      latex: `\\det(A) = ad - bc`,
    });
    steps.push({
      label: 'Substitute values',
      latex: `= (${toFrac(a)})(${toFrac(d)}) - (${toFrac(b)})(${toFrac(c)})`,
    });
    const val = a * d - b * c;
    steps.push({
      label: 'Result',
      latex: `= ${toFrac(a * d)} - (${toFrac(b * c)}) = ${toFrac(val)}`,
    });
    steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` });
    return steps;
  }

  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = M;
    steps.push({
      label: 'Cofactor expansion along row 1',
      latex: `\\det(A) = a_{11}\\,M_{11} - a_{12}\\,M_{12} + a_{13}\\,M_{13}`,
    });
    const M11 = e * i - f * h;
    const M12 = d * i - f * g;
    const M13 = d * h - e * g;
    steps.push({
      label: 'Compute 2×2 minors',
      latex: `M_{11} = \\begin{vmatrix} ${toFrac(e)} & ${toFrac(f)} \\\\ ${toFrac(h)} & ${toFrac(i)} \\end{vmatrix} = ${toFrac(M11)}, \\quad
M_{12} = \\begin{vmatrix} ${toFrac(d)} & ${toFrac(f)} \\\\ ${toFrac(g)} & ${toFrac(i)} \\end{vmatrix} = ${toFrac(M12)}, \\quad
M_{13} = \\begin{vmatrix} ${toFrac(d)} & ${toFrac(e)} \\\\ ${toFrac(g)} & ${toFrac(h)} \\end{vmatrix} = ${toFrac(M13)}`,
    });
    const val = a * M11 - b * M12 + c * M13;
    steps.push({
      label: 'Combine',
      latex: `= ${toFrac(a)} \\cdot ${toFrac(M11)} - ${toFrac(b)} \\cdot ${toFrac(M12)} + ${toFrac(c)} \\cdot ${toFrac(M13)}`,
    });
    steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` });
    return steps;
  }

  // n ≥ 4: numeric
  const val = detNxN(M);
  steps.push({
    label: `${n}×${n} — expanding ${n} cofactors recursively`,
    latex: `\\det(A) = ${toFrac(val)}`,
  });
  steps.push({ label: 'Answer', latex: `\\boxed{\\det(A) = ${toFrac(val)}}` });
  return steps;
}

/** RREF — returns { result, steps[], rank } */
function solveRREF(inputM, augment = null) {
  const M = augment ? inputM.map((r, i) => [...r, ...augment[i]]) : copy(inputM);
  const rows = M.length;
  const cols = M[0].length;
  const pivotCols = [];
  const steps = [];
  const nCols = augment ? inputM[0].length : cols; // "main" columns for rank

  const snapshot = () => augment
    ? augLatex(M.map(r => r.slice(0, inputM[0].length)), M.map(r => r.slice(inputM[0].length)))
    : matLatex(M);

  steps.push({ label: 'Start', latex: snapshot() });

  let pivotRow = 0;
  for (let col = 0; col < nCols && pivotRow < rows; col++) {
    // Find pivot
    let maxRow = pivotRow;
    for (let r = pivotRow + 1; r < rows; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r;
    }
    if (Math.abs(M[maxRow][col]) < 1e-10) continue;

    // Swap if needed
    if (maxRow !== pivotRow) {
      [M[pivotRow], M[maxRow]] = [M[maxRow], M[pivotRow]];
      steps.push({ label: `Swap R_{${pivotRow + 1}} \\leftrightarrow R_{${maxRow + 1}}`, latex: snapshot() });
    }

    // Scale pivot row to 1
    const scale = M[pivotRow][col];
    if (Math.abs(scale - 1) > 1e-10) {
      for (let c = 0; c < cols; c++) M[pivotRow][c] /= scale;
      steps.push({ label: `R_{${pivotRow + 1}} \\leftarrow \\frac{1}{${toFrac(scale)}} R_{${pivotRow + 1}}`, latex: snapshot() });
    }

    // Eliminate column
    let eliminated = false;
    for (let r = 0; r < rows; r++) {
      if (r === pivotRow || Math.abs(M[r][col]) < 1e-10) continue;
      const factor = M[r][col];
      for (let c = 0; c < cols; c++) M[r][c] -= factor * M[pivotRow][c];
      steps.push({ label: `R_{${r + 1}} \\leftarrow R_{${r + 1}} - (${toFrac(factor)})\\,R_{${pivotRow + 1}}`, latex: snapshot() });
      eliminated = true;
    }

    pivotCols.push(col);
    pivotRow++;
  }

  const rank = pivotCols.length;
  return { result: M, steps, rank, pivotCols };
}

/** Inverse — returns steps[] */
function solveInverse(M) {
  const n = M.length;
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  if (n === 2) {
    const [[a, b], [c, d]] = M;
    const det = a * d - b * c;
    steps.push({ label: 'Step 1 — Compute det(A)', latex: `\\det(A) = (${toFrac(a)})(${toFrac(d)}) - (${toFrac(b)})(${toFrac(c)}) = ${toFrac(det)}` });
    if (Math.abs(det) < 1e-10) {
      steps.push({ label: 'Result', latex: `\\det(A) = 0 \\Rightarrow A \\text{ is singular (no inverse)}` });
      return steps;
    }
    steps.push({ label: 'Step 2 — Adjugate (swap diagonal, negate off-diagonal)', latex: `\\text{adj}(A) = \\begin{pmatrix} ${toFrac(d)} & ${toFrac(-b)} \\\\ ${toFrac(-c)} & ${toFrac(a)} \\end{pmatrix}` });
    const inv = [[d / det, -b / det], [-c / det, a / det]];
    steps.push({ label: 'Step 3 — Divide by det', latex: `A^{-1} = \\frac{1}{${toFrac(det)}} \\cdot \\text{adj}(A)` });
    steps.push({ label: 'Answer', latex: `\\boxed{A^{-1} = ${matLatex(inv)}}` });
    return steps;
  }

  // n ≥ 3: via augmented RREF [A|I]
  const I = M.map((_, i) => M[0].map((_, j) => (i === j ? 1 : 0)));
  steps.push({ label: `Step 1 — Form augmented matrix [A \\mid I]`, latex: augLatex(M, I) });
  const { result: aug, steps: rrefSteps, rank } = solveRREF(copy(M), I);
  for (const s of rrefSteps.slice(1)) steps.push(s);
  if (rank < n) {
    steps.push({ label: 'Result', latex: `\\text{Rank} < n \\Rightarrow A \\text{ is singular (no inverse)}` });
    return steps;
  }
  const inv = aug.map(r => r.slice(n));
  steps.push({ label: 'Answer — right half of reduced matrix', latex: `\\boxed{A^{-1} = ${matLatex(inv)}}` });
  return steps;
}

/** Transpose — steps */
function solveTranspose(M) {
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });
  const T = M[0].map((_, j) => M.map(row => row[j]));
  steps.push({ label: 'Rule — swap rows and columns: (Aᵀ)ᵢⱼ = Aⱼᵢ', latex: matLatex(T, 'A^{\\top} = ') });
  return steps;
}

/** Trace — steps */
function solveTrace(M) {
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });
  const diag = M.map((r, i) => r[i]);
  steps.push({ label: 'Trace = sum of diagonal entries', latex: `\\text{tr}(A) = ${diag.map(toFrac).join(' + ')} = ${toFrac(diag.reduce((s, v) => s + v, 0))}` });
  return steps;
}

/** Eigenvalues — 2x2 only, returns steps */
function solveEigenvalues(M) {
  const steps = [];
  if (M.length !== 2) {
    steps.push({ label: 'Note', latex: `\\text{Eigenvalue solver is shown for 2×2. Use RREF/det steps for larger matrices.}` });
    return steps;
  }
  const [[a, b], [c, d]] = M;
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });
  steps.push({ label: 'Step 1 — Characteristic equation: det(A − λI) = 0', latex: `\\det\\begin{pmatrix} ${toFrac(a)}-\\lambda & ${toFrac(b)} \\\\ ${toFrac(c)} & ${toFrac(d)}-\\lambda \\end{pmatrix} = 0` });
  steps.push({ label: 'Step 2 — Expand', latex: `(${toFrac(a)}-\\lambda)(${toFrac(d)}-\\lambda) - (${toFrac(b)})(${toFrac(c)}) = 0` });
  const tr = a + d;
  const det = a * d - b * c;
  steps.push({ label: 'Step 3 — Simplify to quadratic', latex: `\\lambda^2 - (${toFrac(tr)})\\lambda + (${toFrac(det)}) = 0` });
  const disc = tr * tr - 4 * det;
  steps.push({ label: 'Step 4 — Discriminant', latex: `\\Delta = (${toFrac(tr)})^2 - 4(${toFrac(det)}) = ${toFrac(disc)}` });
  if (disc < 0) {
    const real = tr / 2;
    const imag = Math.sqrt(-disc) / 2;
    steps.push({ label: 'Complex eigenvalues', latex: `\\lambda = ${toFrac(real)} \\pm ${toFrac(imag)}\\,i` });
    steps.push({ label: 'Answer', latex: `\\boxed{\\lambda_1 = ${toFrac(real)} + ${toFrac(imag)}i,\\quad \\lambda_2 = ${toFrac(real)} - ${toFrac(imag)}i}` });
    return steps;
  }
  const sqrtDisc = Math.sqrt(disc);
  const l1 = (tr + sqrtDisc) / 2;
  const l2 = (tr - sqrtDisc) / 2;
  steps.push({ label: 'Step 5 — Solve', latex: `\\lambda = \\frac{${toFrac(tr)} \\pm \\sqrt{${toFrac(disc)}}}{2} = \\frac{${toFrac(tr)} \\pm ${toFrac(sqrtDisc)}}{2}` });
  steps.push({ label: 'Answer', latex: `\\boxed{\\lambda_1 = ${toFrac(l1)},\\quad \\lambda_2 = ${toFrac(l2)}}` });

  // Eigenvectors
  for (const [idx, lam] of [[1, l1], [2, l2]]) {
    if (Math.abs(a - lam) > 1e-10 || Math.abs(b) > 1e-10) {
      if (Math.abs(b) > 1e-10) {
        steps.push({ label: `Eigenvector for λ${idx} = ${toFrac(lam)}`, latex: `(A - ${toFrac(lam)}I)\\mathbf{v} = 0 \\Rightarrow \\mathbf{v}_${idx} = \\begin{pmatrix} ${toFrac(-b)} \\\\ ${toFrac(a - lam)} \\end{pmatrix}` });
      } else if (Math.abs(c) > 1e-10) {
        steps.push({ label: `Eigenvector for λ${idx} = ${toFrac(lam)}`, latex: `\\mathbf{v}_${idx} = \\begin{pmatrix} ${toFrac(d - lam)} \\\\ ${toFrac(-c)} \\end{pmatrix}` });
      }
    }
  }
  return steps;
}

/** Matrix multiply A × B — steps */
function solveMultiply(A, B) {
  const steps = [];
  steps.push({ label: 'Matrices', latex: `A = ${matLatex(A)}, \\quad B = ${matLatex(B)}` });
  const m = A.length, n = B[0].length, k = B.length;
  if (A[0].length !== k) {
    steps.push({ label: 'Error', latex: `\\text{Incompatible dimensions: A is } ${m}\\times${A[0].length},\\; B \\text{ is } ${k}\\times${n}` });
    return steps;
  }
  steps.push({ label: 'Rule — (AB)ᵢⱼ = row i of A · column j of B', latex: `(AB)_{ij} = \\sum_{p=1}^{k} A_{ip}\\,B_{pj}` });
  const C = Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      A[i].reduce((s, v, p) => s + v * B[p][j], 0)
    )
  );
  // Show detail for small matrices
  if (m <= 3 && n <= 3 && k <= 3) {
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const terms = A[i].map((v, p) => `(${toFrac(v)})(${toFrac(B[p][j])})`).join(' + ');
        steps.push({ label: `Entry (${i + 1},${j + 1})`, latex: `c_{${i + 1}${j + 1}} = ${terms} = ${toFrac(C[i][j])}` });
      }
    }
  }
  steps.push({ label: 'Answer', latex: `\\boxed{AB = ${matLatex(C)}}` });
  return steps;
}

/** Dot product — steps */
function solveDot(A, B) {
  const steps = [];
  const u = A.flat(), v = B.flat();
  if (u.length !== v.length) {
    steps.push({ label: 'Error', latex: `\\text{Vectors must have equal length}` });
    return steps;
  }
  const uLat = `\\mathbf{u} = \\begin{pmatrix}${u.map(toFrac).join('\\\\')}\\end{pmatrix}`;
  const vLat = `\\mathbf{v} = \\begin{pmatrix}${v.map(toFrac).join('\\\\')}\\end{pmatrix}`;
  steps.push({ label: 'Vectors', latex: `${uLat}, \\quad ${vLat}` });
  steps.push({ label: 'Formula', latex: `\\mathbf{u} \\cdot \\mathbf{v} = \\sum_{i} u_i v_i` });
  const terms = u.map((ui, i) => `(${toFrac(ui)})(${toFrac(v[i])})`).join(' + ');
  const result = u.reduce((s, ui, i) => s + ui * v[i], 0);
  steps.push({ label: 'Compute', latex: `= ${terms} = ${toFrac(result)}` });
  steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{u} \\cdot \\mathbf{v} = ${toFrac(result)}}` });
  return steps;
}

/** Cross product — 3D only */
function solveCross(A, B) {
  const steps = [];
  const [a1, a2, a3] = A.flat();
  const [b1, b2, b3] = B.flat();
  const uLat = `\\mathbf{u} = \\begin{pmatrix}${toFrac(a1)}\\\\${toFrac(a2)}\\\\${toFrac(a3)}\\end{pmatrix}`;
  const vLat = `\\mathbf{v} = \\begin{pmatrix}${toFrac(b1)}\\\\${toFrac(b2)}\\\\${toFrac(b3)}\\end{pmatrix}`;
  steps.push({ label: 'Vectors', latex: `${uLat}, \\quad ${vLat}` });
  steps.push({
    label: 'Determinant formula',
    latex: `\\mathbf{u} \\times \\mathbf{v} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ ${toFrac(a1)} & ${toFrac(a2)} & ${toFrac(a3)} \\\\ ${toFrac(b1)} & ${toFrac(b2)} & ${toFrac(b3)} \\end{vmatrix}`,
  });
  const cx = a2 * b3 - a3 * b2;
  const cy = a3 * b1 - a1 * b3;
  const cz = a1 * b2 - a2 * b1;
  steps.push({
    label: 'Expand cofactors',
    latex: `= \\mathbf{i}(${toFrac(a2)}\\cdot${toFrac(b3)} - ${toFrac(a3)}\\cdot${toFrac(b2)}) - \\mathbf{j}(${toFrac(a1)}\\cdot${toFrac(b3)} - ${toFrac(a3)}\\cdot${toFrac(b1)}) + \\mathbf{k}(${toFrac(a1)}\\cdot${toFrac(b2)} - ${toFrac(a2)}\\cdot${toFrac(b1)})`,
  });
  steps.push({ label: 'Answer', latex: `\\boxed{\\mathbf{u} \\times \\mathbf{v} = \\begin{pmatrix}${toFrac(cx)}\\\\${toFrac(cy)}\\\\${toFrac(cz)}\\end{pmatrix}}` });
  return steps;
}

/** Vector norm — steps */
function solveNorm(M) {
  const v = M.flat();
  const steps = [];
  const vLat = `\\mathbf{v} = \\begin{pmatrix}${v.map(toFrac).join('\\\\')}\\end{pmatrix}`;
  steps.push({ label: 'Vector', latex: vLat });
  const sumSq = v.reduce((s, x) => s + x * x, 0);
  const terms = v.map(x => `(${toFrac(x)})^2`).join(' + ');
  steps.push({ label: 'L2 (Euclidean) Norm: ‖v‖ = √(Σxᵢ²)', latex: `\\|\\mathbf{v}\\|_2 = \\sqrt{${terms}}` });
  steps.push({ label: 'Sum of squares', latex: `= \\sqrt{${toFrac(sumSq)}}` });
  const norm = Math.sqrt(sumSq);
  steps.push({ label: 'Answer', latex: `\\boxed{\\|\\mathbf{v}\\|_2 = ${toFrac(norm)}}` });
  // L1 and Linf
  const l1 = v.reduce((s, x) => s + Math.abs(x), 0);
  const linf = Math.max(...v.map(Math.abs));
  steps.push({ label: 'L1 Norm (Taxicab)', latex: `\\|\\mathbf{v}\\|_1 = \\sum |x_i| = ${toFrac(l1)}` });
  steps.push({ label: 'L∞ Norm (Max)', latex: `\\|\\mathbf{v}\\|_\\infty = \\max|x_i| = ${toFrac(linf)}` });
  return steps;
}

/** Rank via RREF */
function solveRank(M) {
  const { steps, rank } = solveRREF(M);
  steps.push({ label: 'Rank = number of non-zero rows in RREF', latex: `\\boxed{\\text{rank}(A) = ${rank}}` });
  return steps;
}

/** Null space via RREF */
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
  const vStr = nullVectors.map((v, i) =>
    `\\mathbf{n}_${i + 1} = \\begin{pmatrix}${v.map(toFrac).join('\\\\')}\\end{pmatrix}`
  ).join(', \\quad ');
  steps.push({ label: `Null space basis (${freeCols.length} free variable${freeCols.length > 1 ? 's' : ''})`, latex: vStr });
  return steps;
}

function computeInverseMatrix(M) {
  const n = M.length;
  const I = identity(n);
  const { result: aug, rank } = solveRREF(copy(M), I);
  if (rank < n) return null;
  return aug.map(r => r.slice(n));
}

function solveLU(M) {
  const n = M.length;
  const U = copy(M);
  const L = identity(n);
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  for (let col = 0; col < n; col++) {
    const pivot = U[col][col];
    if (Math.abs(pivot) < 1e-10) {
      steps.push({
        label: 'Note',
        latex: `\\text{Zero pivot at row } ${col + 1}\\text{. This basic LU form needs row pivoting (LUP).}`
      });
      return steps;
    }
    for (let row = col + 1; row < n; row++) {
      const factor = U[row][col] / pivot;
      L[row][col] = factor;
      for (let c = col; c < n; c++) U[row][c] -= factor * U[col][c];
      steps.push({
        label: `Eliminate row ${row + 1}, col ${col + 1}`,
        latex: `L_{${row + 1}${col + 1}} = ${toFrac(factor)},\; U = ${matLatex(U)}`
      });
    }
  }

  steps.push({ label: 'L matrix', latex: matLatex(L, 'L = ') });
  steps.push({ label: 'U matrix', latex: matLatex(U, 'U = ') });
  steps.push({ label: 'Check', latex: `LU = ${matLatex(matMul(L, U))}` });
  return steps;
}

function solveColumnSpace(M) {
  const { pivotCols, steps } = solveRREF(copy(M));
  const basis = pivotCols.map(c => M.map(r => r[c]));
  if (basis.length === 0) {
    steps.push({ label: 'Column space', latex: '\\text{Only the zero vector (all columns dependent/zero).}' });
    return steps;
  }
  const basisLatex = basis.map((v, i) =>
    `\\mathbf{c}_{${i + 1}} = \\begin{pmatrix}${v.map(toFrac).join('\\\\')}\\end{pmatrix}`
  ).join(',\\;');
  steps.push({ label: 'Pivot columns in original A form a basis', latex: basisLatex });
  return steps;
}

function solveMatrixPower(M, n) {
  const steps = [];
  if (!Number.isInteger(n)) {
    steps.push({ label: 'Error', latex: '\\text{n must be an integer.}' });
    return steps;
  }
  if (n < 0) {
    const inv = computeInverseMatrix(M);
    if (!inv) {
      steps.push({ label: 'Error', latex: '\\text{A is singular, so negative powers are undefined.}' });
      return steps;
    }
    M = inv;
    n = Math.abs(n);
    steps.push({ label: 'Negative power', latex: `A^{-n} = (A^{-1})^{${n}}` });
  }

  const size = M.length;
  let result = identity(size);
  if (n === 0) {
    steps.push({ label: 'Result', latex: `A^0 = I = ${matLatex(result)}` });
    return steps;
  }

  steps.push({ label: 'Base matrix', latex: matLatex(M, 'A = ') });
  for (let i = 1; i <= n; i++) {
    result = matMul(result, M);
    if (n <= 5 || i === n) {
      steps.push({ label: `Power ${i}`, latex: `A^{${i}} = ${matLatex(result)}` });
    }
  }
  steps.push({ label: 'Answer', latex: `\\boxed{A^{${n}} = ${matLatex(result)}}` });
  return steps;
}

function solveCharPoly(M) {
  const n = M.length;
  const steps = [];
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });

  if (n === 2) {
    const tr = M[0][0] + M[1][1];
    const det = det2x2(M);
    steps.push({ label: 'Characteristic polynomial', latex: `p(\\lambda)=\\det(A-\\lambda I)=\\lambda^2-${toFrac(tr)}\\lambda+${toFrac(det)}` });
    return steps;
  }

  if (n === 3) {
    const [[a, b, c], [d, e, f], [g, h, i]] = M;
    const tr = a + e + i;
    const I2 = (a * e + a * i + e * i) - (b * d + c * g + f * h);
    const det = det3x3(M);
    steps.push({
      label: 'Characteristic polynomial',
      latex: `p(\\lambda)=\\det(A-\\lambda I)=-\\lambda^3+${toFrac(tr)}\\lambda^2-${toFrac(I2)}\\lambda+${toFrac(det)}`
    });
    return steps;
  }

  steps.push({ label: 'Note', latex: '\\text{Characteristic polynomial currently shown for 2x2 and 3x3 only.}' });
  return steps;
}

function solveConditionNumber(M) {
  const steps = [];
  const inv = computeInverseMatrix(M);
  if (!inv) {
    steps.push({ label: 'Condition number', latex: '\\kappa(A)=\\infty\\;\\text{(A is singular)}' });
    return steps;
  }
  const nA = frobeniusNorm(M);
  const nInv = frobeniusNorm(inv);
  const kappa = nA * nInv;
  steps.push({ label: 'Definition', latex: '\\kappa_F(A)=\\|A\\|_F\\cdot\\|A^{-1}\\|_F' });
  steps.push({ label: 'Compute norms', latex: `\\|A\\|_F=${toFrac(nA)},\\;\\|A^{-1}\\|_F=${toFrac(nInv)}` });
  steps.push({ label: 'Answer', latex: `\\boxed{\\kappa_F(A)=${toFrac(kappa)}}` });
  return steps;
}

function solveAdd(A, B) {
  const steps = [];
  if (A.length !== B.length || A[0].length !== B[0].length) {
    steps.push({ label: 'Error', latex: '\\text{A and B must have identical dimensions.}' });
    return steps;
  }
  const C = A.map((row, r) => row.map((v, c) => v + B[r][c]));
  steps.push({ label: 'Matrices', latex: `A=${matLatex(A)},\\;B=${matLatex(B)}` });
  steps.push({ label: 'Answer', latex: `\\boxed{A+B=${matLatex(C)}}` });
  return steps;
}

function solveGramSchmidt(M) {
  const rows = M.length;
  const cols = M[0].length;
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
      steps.push({
        label: `Subtract projection on u_${j + 1}`,
        latex: `\\mathbf{w}_${k + 1} \\leftarrow \\mathbf{w}_${k + 1} - ${toFrac(coeff)}\\,\\mathbf{u}_${j + 1}`
      });
    }
    const n = Math.sqrt(dotVec(w, w));
    if (n < 1e-10) continue;
    const u = w.map(x => x / n);
    orth.push(u);
    steps.push({ label: `Normalize u_${orth.length}`, latex: `\\mathbf{u}_${orth.length} = ${matLatex(u.map(v => [v]))}` });
  }

  if (orth.length === 0) {
    steps.push({ label: 'Result', latex: '\\text{No independent vectors were found.}' });
    return steps;
  }

  steps.push({
    label: 'Orthonormal basis',
    latex: orth.map((u, i) => `\\mathbf{u}_${i + 1}=${matLatex(u.map(v => [v]))}`).join('\\;')
  });
  return steps;
}

function solveTransform2D(M) {
  const steps = [];
  if (M.length !== 2 || M[0].length !== 2) {
    steps.push({ label: 'Error', latex: '\\text{2D transform requires a 2x2 matrix.}' });
    return steps;
  }
  const e1 = [M[0][0], M[1][0]];
  const e2 = [M[0][1], M[1][1]];
  const det = det2x2(M);
  steps.push({ label: 'Matrix', latex: matLatex(M, 'A = ') });
  steps.push({ label: 'Image of basis vectors', latex: `A\\mathbf{e}_1=${matLatex(e1.map(v => [v]))},\\;A\\mathbf{e}_2=${matLatex(e2.map(v => [v]))}` });
  steps.push({ label: 'Area scale + orientation', latex: `\\det(A)=${toFrac(det)}` });
  if (Math.abs(det) < 1e-10) {
    steps.push({ label: 'Conclusion', latex: '\\text{det = 0: plane collapses to a line/point (non-invertible).}' });
  } else if (det < 0) {
    steps.push({ label: 'Conclusion', latex: '\\text{det < 0: orientation flips (reflection component present).}' });
  } else {
    steps.push({ label: 'Conclusion', latex: '\\text{det > 0: orientation preserved.}' });
  }
  return steps;
}

/** Solve Ax=b with augmented matrix [A|b] via RREF */
function solveLinearSystem(A, bCol) {
  const steps = [];
  const n = A.length;

  steps.push({ label: 'System', latex: `A = ${matLatex(A)}, \quad \mathbf{b} = ${matLatex(bCol)}` });
  steps.push({ label: 'Form augmented matrix [A|b]', latex: augLatex(A, bCol) });

  const { result, steps: rrefSteps, rank, pivotCols } = solveRREF(copy(A), bCol);
  for (const s of rrefSteps.slice(1)) steps.push(s);

  const inconsistent = result.some(row => {
    const leftZero = row.slice(0, n).every(v => Math.abs(v) < 1e-10);
    return leftZero && Math.abs(row[n]) > 1e-10;
  });

  if (inconsistent) {
    steps.push({
      label: 'Conclusion',
      latex: '\\text{Inconsistent row found (0 = nonzero). No solution exists.}'
    });
    return steps;
  }

  if (rank < n) {
    const free = Array.from({ length: n }, (_, i) => i).filter(i => !pivotCols.includes(i));
    steps.push({
      label: 'Conclusion',
      latex: `\\text{rank}(A) = ${rank} < ${n} \\Rightarrow \\text{infinitely many solutions (free vars: } ${free.map(i => `x_{${i + 1}}`).join(', ')}\\text{).}`
    });
    steps.push({ label: 'Reduced augmented form', latex: augLatex(result.map(r => r.slice(0, n)), result.map(r => [r[n]])) });
    return steps;
  }

  const x = Array(n).fill(0);
  for (let r = 0; r < result.length; r++) {
    const pc = pivotCols[r];
    if (pc !== undefined) x[pc] = result[r][n];
  }

  steps.push({ label: 'Unique solution', latex: `\\boxed{\\mathbf{x} = ${matLatex(x.map(v => [v]))}}` });
  return steps;
}

function resizePreserve(grid, newRows, newCols) {
  const next = blankGrid(newRows, newCols);
  const oldRows = grid.length;
  const oldCols = oldRows ? grid[0].length : 0;
  const rows = Math.min(oldRows, newRows);
  const cols = Math.min(oldCols, newCols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      next[r][c] = grid[r][c];
    }
  }
  return next;
}

// ─── OPERATIONS CONFIG ───────────────────────────────────────────────────────
const OPERATIONS = [
  { id: 'det',       label: 'Determinant',     icon: '|A|', needsB: false, singleMatrix: true,  minSize: 2, maxSize: 5  },
  { id: 'rref',      label: 'RREF',            icon: 'RREF', needsB: false, singleMatrix: true, minSize: 2, maxSize: 5  },
  { id: 'inverse',   label: 'Inverse',         icon: 'A⁻¹', needsB: false, singleMatrix: true,  minSize: 2, maxSize: 5  },
  { id: 'lu',        label: 'LU Decomposition', icon: 'LU', needsB: false, singleMatrix: true, minSize: 2, maxSize: 5 },
  { id: 'colspace',  label: 'Column Space',    icon: 'col', needsB: false, singleMatrix: true, minSize: 2, maxSize: 5 },
  { id: 'transpose', label: 'Transpose',       icon: 'Aᵀ',  needsB: false, singleMatrix: true,  minSize: 2, maxSize: 5  },
  { id: 'trace',     label: 'Trace',           icon: 'tr',  needsB: false, singleMatrix: true,  minSize: 2, maxSize: 5  },
  { id: 'rank',      label: 'Rank',            icon: 'rk',  needsB: false, singleMatrix: true,  minSize: 2, maxSize: 5  },
  { id: 'null',      label: 'Null Space',      icon: 'ker', needsB: false, singleMatrix: true,  minSize: 2, maxSize: 5  },
  { id: 'charpoly',  label: 'Char Polynomial', icon: 'χ(λ)', needsB: false, singleMatrix: true, minSize: 2, maxSize: 3 },
  { id: 'cond',      label: 'Condition Number', icon: 'κ', needsB: false, singleMatrix: true, minSize: 2, maxSize: 4 },
  { id: 'power',     label: 'Matrix Power',    icon: 'Aⁿ', needsB: false, singleMatrix: true, minSize: 2, maxSize: 5, hasN: true },
  { id: 'eigen',     label: 'Eigenvalues',     icon: 'λ',   needsB: false, singleMatrix: true,  minSize: 2, maxSize: 2  },
  { id: 'multiply',  label: 'Multiply A×B',    icon: 'A×B', needsB: true,  singleMatrix: false, minSize: 2, maxSize: 5  },
  { id: 'add',       label: 'Add A+B',         icon: 'A+B', needsB: true,  singleMatrix: false, minSize: 2, maxSize: 5  },
  { id: 'solve',     label: 'Solve Ax=b',      icon: 'Ax=b', needsB: true, singleMatrix: false, minSize: 2, maxSize: 5, solveMode: true },
  { id: 'dot',       label: 'Dot Product',     icon: 'u·v', needsB: true,  singleMatrix: false, minSize: 2, maxSize: 5, vectorMode: true },
  { id: 'cross',     label: 'Cross Product',   icon: 'u×v', needsB: true,  singleMatrix: false, minSize: 3, maxSize: 3, vectorMode: true, fixedSize: 3 },
  { id: 'norm',      label: 'Norm',            icon: '‖v‖', needsB: false, singleMatrix: false, minSize: 2, maxSize: 5, vectorMode: true },
  { id: 'gramschmidt', label: 'Gram-Schmidt',  icon: 'GS', needsB: false, singleMatrix: true, minSize: 2, maxSize: 5 },
  { id: 'transform2d', label: '2D Transform',  icon: '⊞', needsB: false, singleMatrix: true, minSize: 2, maxSize: 2, fixedSize: 2 },
];

const OP_HELP = {
  det: {
    desc: 'Determinant measures area/volume scaling of a matrix transformation.',
    latex: '\\det(A) = ad - bc \\text{ (2x2)}'
  },
  rref: {
    desc: 'RREF row-reduces the matrix to a canonical pivot form.',
    latex: 'R_i \\leftrightarrow R_j,\\; R_i \\leftarrow cR_i,\\; R_i \\leftarrow R_i + cR_j'
  },
  inverse: {
    desc: 'Find A^{-1} when det(A) != 0 using [A|I] -> [I|A^{-1}].',
    latex: '[A \\mid I] \\xrightarrow{\\mathrm{RREF}} [I \\mid A^{-1}]'
  },
  lu: {
    desc: 'Factor A into L and U triangular matrices (basic no-pivot LU).',
    latex: 'A = LU'
  },
  power: {
    desc: 'Repeated multiplication of A, controlled by integer exponent n.',
    latex: 'A^n = A\\cdot A\\cdots A'
  },
  charpoly: {
    desc: 'Characteristic polynomial whose roots are eigenvalues.',
    latex: 'p(\\lambda)=\\det(A-\\lambda I)'
  },
  cond: {
    desc: 'Frobenius condition number estimate for sensitivity.',
    latex: '\\kappa_F(A)=\\|A\\|_F\\|A^{-1}\\|_F'
  },
  colspace: {
    desc: 'Basis from pivot columns of the original matrix.',
    latex: 'C(A)=\\mathrm{span}(\\text{pivot cols of }A)'
  },
  gramschmidt: {
    desc: 'Orthonormalize the matrix columns.',
    latex: '\\mathbf{u}_k=\\mathbf{v}_k-\\sum_{j<k}\\mathrm{proj}_{\\mathbf{u}_j}(\\mathbf{v}_k)'
  },
  add: {
    desc: 'Element-wise matrix addition with same dimensions.',
    latex: '(A+B)_{ij}=A_{ij}+B_{ij}'
  },
  transform2d: {
    desc: 'Visualize how A maps the basis vectors (1,0) and (0,1) in the plane.',
    latex: 'A\\mathbf{e}_1=\\text{col}_1(A),\\;A\\mathbf{e}_2=\\text{col}_2(A)'
  },
  solve: {
    desc: 'Solve linear systems by augmenting A with b and row reducing.',
    latex: '[A \\mid \\mathbf{b}] \\xrightarrow{\\mathrm{RREF}} \\text{classify: unique / infinite / none}'
  },
  eigen: {
    desc: 'Eigenvalues are roots of the characteristic equation.',
    latex: '\\det(A - \\lambda I)=0'
  }
};

// ─── blank grid helper ────────────────────────────────────────────────────────
function blankGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(''));
}

// ─── Input grid component ─────────────────────────────────────────────────────
function MatrixGrid({ grid, setGrid, label, dark, cols }) {
  const rows = grid.length;
  const bg = dark ? 'bg-[#0d1117] border-slate-700 text-slate-200 focus:border-violet-400' : 'bg-white border-slate-300 text-slate-800 focus:border-violet-500';
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

function Transform2DView({ M, dark }) {
  const e1 = [1, 0];
  const e2 = [0, 1];
  const t1 = [M[0][0], M[1][0]];
  const t2 = [M[0][1], M[1][1]];

  const vectors = [e1, e2, t1, t2];
  const maxAbs = Math.max(1, ...vectors.flat().map(v => Math.abs(v)));
  const pad = 16;
  const viewSize = 220;
  const half = viewSize / 2;
  const scale = (half - pad) / maxAbs;

  const toSvg = (x, y) => ({ x: half + x * scale, y: half - y * scale });

  const axisColor = dark ? '#64748b' : '#94a3b8';
  const gridColor = dark ? '#334155' : '#cbd5e1';

  const Arrow = ({ v, stroke }) => {
    const p0 = toSvg(0, 0);
    const p1 = toSvg(v[0], v[1]);
    return (
      <>
        <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={stroke} strokeWidth="2.5" />
        <circle cx={p1.x} cy={p1.y} r="3.2" fill={stroke} />
      </>
    );
  };

  return (
    <div className={`rounded-xl border ${dark ? 'border-slate-700 bg-[#0d1117]' : 'border-slate-200 bg-white'} p-2`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        2D Transform Visual
      </p>
      <svg width="100%" viewBox={`0 0 ${viewSize} ${viewSize}`}>
        {[...Array(9)].map((_, i) => {
          const t = i * (viewSize / 8);
          return (
            <g key={i}>
              <line x1={t} y1="0" x2={t} y2={viewSize} stroke={gridColor} strokeWidth="0.6" opacity="0.5" />
              <line x1="0" y1={t} x2={viewSize} y2={t} stroke={gridColor} strokeWidth="0.6" opacity="0.5" />
            </g>
          );
        })}
        <line x1={half} y1="0" x2={half} y2={viewSize} stroke={axisColor} strokeWidth="1.3" />
        <line x1="0" y1={half} x2={viewSize} y2={half} stroke={axisColor} strokeWidth="1.3" />

        <Arrow v={e1} stroke="#22c55e" />
        <Arrow v={e2} stroke="#38bdf8" />
        <Arrow v={t1} stroke="#f97316" />
        <Arrow v={t2} stroke="#e11d48" />
      </svg>
      <div className={`text-[10px] mt-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        <span className="mr-2">orig e1/e2: green/blue</span>
        <span>Ae1/Ae2: orange/red</span>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
function LAPanel({ dark }) {
  const [size, setSize] = useState(3);
  const [opId, setOpId] = useState('det');
  const [gridA, setGridA] = useState(() => blankGrid(3, 3));
  const [gridB, setGridB] = useState(() => blankGrid(3, 3));
  const [powerN, setPowerN] = useState(2);
  const [steps, setSteps] = useState(null);
  const [error, setError] = useState('');

  const op = OPERATIONS.find(o => o.id === opId) ?? OPERATIONS[0];

  // Preserve values when possible; only resize shape on op/size changes.
  useEffect(() => {
    const aRows = size;
    const aCols = op.vectorMode ? 1 : size;
    const bRows = size;
    const bCols = op.solveMode ? 1 : (op.vectorMode ? 1 : size);

    setGridA(prev => {
      const prevRows = prev.length;
      const prevCols = prevRows ? prev[0].length : 0;
      if (prevRows === aRows && prevCols === aCols) return prev;
      return resizePreserve(prev, aRows, aCols);
    });

    setGridB(prev => {
      const prevRows = prev.length;
      const prevCols = prevRows ? prev[0].length : 0;
      if (prevRows === bRows && prevCols === bCols) return prev;
      return resizePreserve(prev, bRows, bCols);
    });

    setSteps(null);
    setError('');
  }, [size, opId]);

  const bg0 = dark ? 'bg-[#0d1117]' : 'bg-slate-100';
  const bg1 = dark ? 'bg-[#161b22]' : 'bg-white';
  const bg2 = dark ? 'bg-[#21262d]' : 'bg-slate-50';
  const bdr = dark ? 'border-slate-700' : 'border-slate-200';
  const txt = dark ? 'text-slate-100' : 'text-slate-800';
  const muted = dark ? 'text-slate-400' : 'text-slate-500';

  const handleSolve = () => {
    setError('');
    setSteps(null);
    try {
      const A = parseMatrix(gridA);
      if (hasNaN(A)) { setError('Matrix A has empty or invalid entries. Use numbers or fractions like 1/3.'); return; }

      if (op.id === 'det') {
        setSteps(solveDeterminant(A));
      } else if (op.id === 'rref') {
        const { steps: s } = solveRREF(A);
        setSteps(s);
      } else if (op.id === 'inverse') {
        setSteps(solveInverse(A));
      } else if (op.id === 'transpose') {
        setSteps(solveTranspose(A));
      } else if (op.id === 'trace') {
        setSteps(solveTrace(A));
      } else if (op.id === 'rank') {
        setSteps(solveRank(A));
      } else if (op.id === 'null') {
        setSteps(solveNullSpace(A));
      } else if (op.id === 'eigen') {
        setSteps(solveEigenvalues(A));
      } else if (op.id === 'lu') {
        setSteps(solveLU(A));
      } else if (op.id === 'colspace') {
        setSteps(solveColumnSpace(A));
      } else if (op.id === 'charpoly') {
        setSteps(solveCharPoly(A));
      } else if (op.id === 'cond') {
        setSteps(solveConditionNumber(A));
      } else if (op.id === 'power') {
        setSteps(solveMatrixPower(A, powerN));
      } else if (op.id === 'gramschmidt') {
        setSteps(solveGramSchmidt(A));
      } else if (op.id === 'transform2d') {
        setSteps(solveTransform2D(A));
      } else if (op.id === 'solve') {
        const B = parseMatrix(gridB);
        if (hasNaN(B)) { setError('Vector b has empty or invalid entries.'); return; }
        setSteps(solveLinearSystem(A, B));
      } else if (op.id === 'norm') {
        setSteps(solveNorm(A));
      } else if (op.id === 'multiply') {
        const B = parseMatrix(gridB);
        if (hasNaN(B)) { setError('Matrix B has empty or invalid entries.'); return; }
        setSteps(solveMultiply(A, B));
      } else if (op.id === 'add') {
        const B = parseMatrix(gridB);
        if (hasNaN(B)) { setError('Matrix B has empty or invalid entries.'); return; }
        setSteps(solveAdd(A, B));
      } else if (op.id === 'dot') {
        const B = parseMatrix(gridB);
        if (hasNaN(B)) { setError('Vector B has empty or invalid entries.'); return; }
        setSteps(solveDot(A, B));
      } else if (op.id === 'cross') {
        const B = parseMatrix(gridB);
        if (hasNaN(B)) { setError('Vector B has empty or invalid entries.'); return; }
        setSteps(solveCross(A, B));
      }
    } catch (err) {
      setError('Unexpected error: ' + err.message);
    }
  };

  // Size options for current op
  const sizeOptions = [];
  for (let s = op.minSize; s <= op.maxSize; s++) sizeOptions.push(s);

  const PRESETS = [
    { label: '2×2 Identity', size: 2, A: [['1','0'],['0','1']] },
    { label: '3×3 Simple', size: 3, A: [['1','2','3'],['0','1','4'],['5','6','0']] },
    { label: '2×2 Singular', size: 2, A: [['2','4'],['1','2']] },
    { label: '3×3 Rotation', size: 3, A: [['0','-1','0'],['1','0','0'],['0','0','1']] },
    { label: 'Upper Triangular', size: 3, A: [['2','3','-1'],['0','4','2'],['0','0','-3']] },
  ];

  const parsedA = useMemo(() => parseMatrix(gridA), [gridA]);
  const canShowTransform = op.id === 'transform2d' && size === 2 && !hasNaN(parsedA);

  return (
    <div className={`p-4 space-y-4 overflow-y-auto max-h-[78vh]`}>
      {/* Operation selector */}
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${muted}`}>Operation</p>
        <div className="flex flex-wrap gap-1.5">
          {OPERATIONS.map(o => (
            <button
              key={o.id}
              onClick={() => setOpId(o.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                opId === o.id
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : dark
                    ? 'bg-[#21262d] border-slate-700 text-slate-300 hover:border-violet-500 hover:text-violet-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600'
              }`}
              title={o.label}
            >
              {o.icon}
            </button>
          ))}
        </div>
        <p className={`text-xs ${muted} mt-1`}>{op.label}</p>
      </div>

      {/* Inline operation help */}
      {(OP_HELP[op.id] || op.id === 'trace' || op.id === 'rank' || op.id === 'null' || op.id === 'transpose' || op.id === 'multiply' || op.id === 'dot' || op.id === 'cross' || op.id === 'norm') && (
        <details className={`rounded-lg border ${bdr} ${bg2} px-3 py-2 text-xs ${muted}`}>
          <summary className="cursor-pointer font-semibold">How this works</summary>
          <div className="mt-2 space-y-2">
            <p className={txt}>
              {(OP_HELP[op.id]?.desc) || (
                op.id === 'trace' ? 'Trace is the sum of diagonal entries.' :
                op.id === 'rank' ? 'Rank is the number of pivots in RREF.' :
                op.id === 'null' ? 'Null space contains all x such that Ax=0.' :
                op.id === 'transpose' ? 'Transpose swaps rows and columns.' :
                op.id === 'multiply' ? 'Matrix multiplication uses row-by-column dot products.' :
                op.id === 'dot' ? 'Dot product multiplies matching entries and sums them.' :
                op.id === 'cross' ? 'Cross product returns a perpendicular 3D vector.' :
                'Norm measures vector length.'
              )}
            </p>
            <KatexBlock expr={(OP_HELP[op.id]?.latex) || (
              op.id === 'trace' ? '\\mathrm{tr}(A)=\\sum_i a_{ii}' :
              op.id === 'rank' ? '\\mathrm{rank}(A)=\\#\\text{ pivots in RREF}' :
              op.id === 'null' ? 'A\\mathbf{x}=\\mathbf{0}' :
              op.id === 'transpose' ? '(A^\\top)_{ij}=A_{ji}' :
              op.id === 'multiply' ? '(AB)_{ij}=\\sum_k A_{ik}B_{kj}' :
              op.id === 'dot' ? '\\mathbf{u}\\cdot\\mathbf{v}=\\sum_i u_iv_i' :
              op.id === 'cross' ? '\\mathbf{u}\\times\\mathbf{v}' :
              '\\|\\mathbf{v}\\|_2=\\sqrt{\\sum_i v_i^2}'
            )} />
          </div>
        </details>
      )}

      {/* Matrix power exponent */}
      {op.hasN && (
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${muted}`}>Exponent n</p>
          <input
            type="number"
            step="1"
            value={powerN}
            onChange={(e) => setPowerN(parseInt(e.target.value || '0', 10))}
            className={`w-28 h-9 text-center text-sm font-mono rounded-lg border outline-none transition-colors ${dark ? 'bg-[#0d1117] border-slate-700 text-slate-200 focus:border-violet-400' : 'bg-white border-slate-300 text-slate-800 focus:border-violet-500'}`}
          />
        </div>
      )}

      {/* Size selector */}
      {!op.fixedSize && (
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${muted}`}>
            {op.vectorMode ? 'Vector Length' : 'Matrix Size'}
          </p>
          <div className="flex gap-1.5">
            {sizeOptions.map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${
                  size === s
                    ? 'bg-sky-500 text-white border-sky-500'
                    : dark
                      ? 'bg-[#21262d] border-slate-700 text-slate-300 hover:border-sky-400'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-sky-400'
                }`}
              >
                {op.vectorMode ? s : `${s}×${s}`}
              </button>
            ))}
          </div>
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
            label={op.solveMode ? 'Vector b' : (op.vectorMode ? 'Vector v' : 'Matrix B')}
            dark={dark}
          />
        )}
      </div>

      {canShowTransform && <Transform2DView M={parsedA} dark={dark} />}

      {/* Presets */}
      {!op.needsB && !op.vectorMode && (
        <details className={`text-[10px] ${muted}`}>
          <summary className="cursor-pointer hover:text-white font-semibold">Example matrices</summary>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PRESETS.filter(p => p.size === size).map((p, i) => (
              <button
                key={i}
                onClick={() => { setGridA(p.A); setSteps(null); }}
                className={`px-2 py-1 rounded-lg text-[10px] border transition-all ${
                  dark ? 'bg-[#21262d] border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400'
                       : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </details>
      )}

      {/* Solve button */}
      <button
        onClick={handleSolve}
        className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-bold tracking-wide transition-all shadow-md shadow-violet-500/20"
      >
        Solve →
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg px-3 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
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
                    step.label.includes('Answer') || step.label.includes('boxed')
                      ? 'text-emerald-400'
                      : step.label.includes('Error') || step.label.includes('singular')
                        ? 'text-rose-400'
                        : muted
                  }`}>
                    {step.label.startsWith('R_') || step.label.includes('\\') ? (
                      <span dangerouslySetInnerHTML={{ __html: step.label }} />
                    ) : step.label}
                  </p>
                )}
                <KatexBlock expr={step.latex} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Syntax guide */}
      <details className={`text-[10px] ${muted}`}>
        <summary className="cursor-pointer hover:text-white font-semibold">Input guide</summary>
        <ul className="mt-1.5 space-y-0.5 pl-3 list-disc leading-relaxed">
          <li>Enter integers: <code className={txt}>3</code>, <code className={txt}>-5</code></li>
          <li>Enter fractions: <code className={txt}>1/3</code>, <code className={txt}>-2/7</code></li>
          <li>Enter decimals: <code className={txt}>0.5</code>, <code className={txt}>-1.25</code></li>
          <li>Leave a cell blank to treat it as 0</li>
          <li>Solve Ax=b uses matrix A and a column vector b</li>
          <li>Matrix Power uses integer exponent n</li>
          <li>Most operations support up to 5x5</li>
          <li>Eigenvalues only available for 2×2 matrices</li>
          <li>Cross product requires 3D vectors</li>
          <li>2D Transform visual is available for 2x2 matrices</li>
        </ul>
      </details>
    </div>
  );
}

// ─── Floating window wrapper ──────────────────────────────────────────────────
export default function LinearAlgebraCalc({ onClose }) {
  const dark = document.documentElement.classList.contains('dark');
  const isMobile = window.innerWidth < 640;

  const [pos, setPos] = useState(() => ({
    x: Math.max(16, window.innerWidth - 480),
    y: Math.max(16, Math.round((window.innerHeight - 640) / 2)),
  }));

  const dragging   = useRef(false);
  const dragOrigin = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const startDrag = (e) => {
    e.preventDefault();
    dragging.current = true;
    dragOrigin.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 460, dragOrigin.current.px + e.clientX - dragOrigin.current.mx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, dragOrigin.current.py + e.clientY - dragOrigin.current.my)),
      });
    };
    const up = () => { dragging.current = false; };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const bg0 = dark ? 'bg-[#0d1117]' : 'bg-slate-100';
  const bg1 = dark ? 'bg-[#161b22]' : 'bg-white';
  const bdr = dark ? 'border-slate-700' : 'border-slate-300';
  const txt = dark ? 'text-slate-100' : 'text-slate-900';
  const muted = dark ? 'text-slate-400' : 'text-slate-500';

  return (
    <>
      {isMobile && <div className="fixed inset-0 z-[1999] bg-black/40 backdrop-blur-sm" onClick={onClose} />}
      <div
        className={`fixed z-[2000] rounded-2xl shadow-2xl border ${bdr} ${bg1} overflow-hidden flex flex-col`}
        style={isMobile
          ? { left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: Math.min(460, window.innerWidth - 16), maxHeight: '94dvh' }
          : { left: pos.x, top: pos.y, width: 460 }
        }
      >
        {/* Title bar */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 ${bg0} border-b ${bdr} cursor-move select-none shrink-0`}
          onMouseDown={startDrag}
        >
          <span className="text-lg">⊕</span>
          <span className={`text-xs font-bold tracking-wide ${txt} flex-1`}>Linear Algebra Calculator</span>
          <span className={`text-[10px] ${muted}`}>drag to move</span>
          <button
            onClick={onClose}
            className={`ml-1 p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 ${muted} hover:text-rose-500 transition-colors text-base leading-none`}
            title="Close (Esc)"
          >
            ×
          </button>
        </div>

        <LAPanel dark={dark} />
      </div>
    </>
  );
}
