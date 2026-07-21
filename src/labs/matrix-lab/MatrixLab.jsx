import { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { getPyodide } from "../../utils/pyodideRuntime.js";
import { executeScript } from "../../engines/openmat/openmatEngine.js";
import { setupOpenCalcMonaco } from "../../utils/monacoThemes.js";
import { MatrixInput } from "./MatrixInputFix";
import { MatrixVisualizer, EigenExplorer } from "./MatrixVisualizer";

// ─────────────────────────────────────────────────────────────────────────────
//  REFERENCE MATH ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const cloneM = (M) => M.map((r) => [...r]);
const fmtN = (v) => {
  if (Math.abs(v) < 1e-10) return "0";
  const r = Math.round(v * 10000) / 10000;
  return r % 1 === 0 ? String(r) : r.toFixed(4).replace(/\.?0+$/, "");
};

const ref_rowSwap = (M, a, b) => { const N = cloneM(M); [N[a], N[b]] = [N[b], N[a]]; return N; };
const ref_rowScale = (M, r, k) => { const N = cloneM(M); N[r] = N[r].map((v) => v * k); return N; };
const ref_rowAdd = (M, t, s, k) => { const N = cloneM(M); N[t] = N[t].map((v, c) => v + k * M[s][c]); return N; };

const ref_fwdElim = (M, capture = false) => {
  let A = cloneM(M);
  const rows = A.length, cols = A[0].length, steps = [];
  let pr = 0, swaps = 0;
  for (let col = 0; col < cols && pr < rows; col++) {
    let mx = pr;
    for (let r = pr + 1; r < rows; r++) if (Math.abs(A[r][col]) > Math.abs(A[mx][col])) mx = r;
    if (Math.abs(A[mx][col]) < 1e-10) continue;
    if (mx !== pr) {
      A = ref_rowSwap(A, pr, mx); swaps++;
      if (capture) steps.push({ type:"swap", r1:pr, r2:mx, matrix:cloneM(A), note:`Partial pivot: swap R${pr+1} ↔ R${mx+1}  (largest |value| to top)`, code:`A = rowSwap(A, ${pr}, ${mx})` });
    }
    for (let r = pr + 1; r < rows; r++) {
      if (Math.abs(A[r][col]) < 1e-10) continue;
      const f = -A[r][col] / A[pr][col];
      A = ref_rowAdd(A, r, pr, f);
      if (capture) steps.push({ type:"add", target:r, source:pr, factor:f, matrix:cloneM(A), note:`Eliminate: R${r+1} ← R${r+1} + (${fmtN(f)}) × R${pr+1}`, code:`A = rowAdd(A, ${r}, ${pr}, ${fmtN(f)})` });
    }
    pr++;
  }
  return { result: A, steps, swapCount: swaps };
};

const ref_backSub = (M, capture = false) => {
  let A = cloneM(M);
  const rows = A.length, steps = [];
  for (let r = rows - 1; r >= 0; r--) {
    const pc = A[r].findIndex((v) => Math.abs(v) > 1e-10);
    if (pc < 0) continue;
    if (Math.abs(A[r][pc] - 1) > 1e-10) {
      const k = 1 / A[r][pc];
      A = ref_rowScale(A, r, k);
      if (capture) steps.push({ type:"scale", row:r, k, matrix:cloneM(A), note:`Scale pivot to 1: R${r+1} × (${fmtN(k)})`, code:`A = rowScale(A, ${r}, ${fmtN(k)})` });
    }
    for (let ab = 0; ab < r; ab++) {
      if (Math.abs(A[ab][pc]) < 1e-10) continue;
      const f = -A[ab][pc];
      A = ref_rowAdd(A, ab, r, f);
      if (capture) steps.push({ type:"add", target:ab, source:r, factor:f, matrix:cloneM(A), note:`Clear above: R${ab+1} ← R${ab+1} + (${fmtN(f)}) × R${r+1}`, code:`A = rowAdd(A, ${ab}, ${r}, ${fmtN(f)})` });
    }
  }
  return { result: A, steps };
};

const ref_det = (M) => {
  const { result, swapCount } = ref_fwdElim(M, false);
  let d = Math.pow(-1, swapCount);
  for (let i = 0; i < result.length; i++) d *= result[i][i];
  return Math.abs(d) < 1e-10 ? 0 : d;
};

const ref_inverse = (M) => {
  const n = M.length;
  const aug = M.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  const { result: up } = ref_fwdElim(aug, false);
  const { result: rref } = ref_backSub(up, false);
  if (!rref.every((row, i) => Math.abs(row[i] - 1) < 1e-8)) return null;
  return rref.map((row) => row.slice(n));
};

const ref_norm = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
const ref_gramSchmidt = (M) => {
  const cols = Array.from({ length: M[0].length }, (_, j) => M.map((r) => r[j]));
  const Q = [];
  for (let j = 0; j < cols.length; j++) {
    let u = [...cols[j]];
    for (let i = 0; i < j; i++) { const dot = u.reduce((s, v, k) => s + v * Q[i][k], 0); u = u.map((v, k) => v - dot * Q[i][k]); }
    const n = ref_norm(u);
    if (n < 1e-10) continue;
    Q.push(u.map((x) => x / n));
  }
  return M.map((_, r) => Q.map((q) => q[r]));
};

const generateTrace = (lessonId, M) => {
  if (lessonId === 3) return ref_fwdElim(M, true).steps;
  if (lessonId === 4) {
    const { steps: s1, result: up } = ref_fwdElim(M, true);
    const { steps: s2 } = ref_backSub(up, true);
    return [...s1, ...s2];
  }
  if (lessonId === 5) {
    const { steps, result, swapCount } = ref_fwdElim(M, true);
    let d = Math.pow(-1, swapCount);
    for (let i = 0; i < result.length; i++) d *= result[i][i];
    const diagStr = result.map((_, i) => fmtN(result[i][i])).join(" × ");
    const finalDet = Math.abs(d) < 1e-10 ? 0 : d;
    return [...steps, { type:"det", matrix:result, note:`det = (−1)^${swapCount} × ${diagStr} = ${fmtN(finalDet)}`, code:`det = ${fmtN(finalDet)}` }];
  }
  if (lessonId === 6) {
    const n = M.length;
    const aug = M.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
    const { steps: s1, result: up } = ref_fwdElim(aug, true);
    const { steps: s2 } = ref_backSub(up, true);
    return [...s1, ...s2];
  }
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
//  LESSONS
// ─────────────────────────────────────────────────────────────────────────────
const LESSONS = [
  {
    id: 0, title: "Row Swap", shortTitle: "Swap", tag: "Elementary Op I", color: "#4A90D9",
    concept: [
      { head:"What it is", body:`The first of three elementary row operations.\nExchanges two entire rows. Simple in effect,\npowerful in purpose — it is the only tool\nwe use for partial pivoting during elimination.` },
      { head:"Effect on det(A)", body:`Every row swap multiplies the determinant\nby −1. If you swap k times:\n   det(result) = (−1)^k × det(original)\n\nThis is why we count swaps when computing\nthe determinant — we need to undo that sign.` },
      { head:"When we use it", body:`Before eliminating a column, we swap the row\nwith the largest absolute value in that column\nto the pivot position. This is called partial\npivoting, and it keeps numbers from blowing up\nduring division (numerical stability).` },
      { head:"MATLAB", body:`A([i j], :) = A([j i], :)\n% or just:\ntmp = A(i,:); A(i,:) = A(j,:); A(j,:) = tmp;` },
    ],
    pseudo:`FUNCTION rowSwap(M, r1, r2):\n  N ← deep copy of M\n  temp ← N[r1]\n  N[r1] ← N[r2]\n  N[r2] ← temp\n  RETURN N`,
    starterCode:`function rowSwap(M, r1, r2) {
  const N = M.map(row => [...row]);

  // YOUR CODE ↓
  // Swap N[r1] and N[r2]
  // Tip: [N[r1], N[r2]] = [N[r2], N[r1]]
  ___

  return N;
}`,
    blanks: ["___"], solutions: ["[N[r1], N[r2]] = [N[r2], N[r1]];"],
    testMatrix: [[1,2,3],[4,5,6],[7,8,9]],
    testFn: (fn) => {
      const M = [[1,2,3],[4,5,6],[7,8,9]];
      const R = fn(M, 0, 2);
      return { ok: R[0][0]===7 && R[2][0]===1 && M[0][0]===1, result:R,
        expected:[[7,8,9],[4,5,6],[1,2,3]],
        checks:[
          { label:"R1 is now [7, 8, 9]", pass:R[0][0]===7 && R[0][1]===8 && R[0][2]===9 },
          { label:"R3 is now [1, 2, 3]", pass:R[2][0]===1 && R[2][1]===2 && R[2][2]===3 },
          { label:"R2 unchanged [4, 5, 6]", pass:R[1][0]===4 && R[1][1]===5 },
          { label:"Original matrix not mutated", pass:M[0][0]===1 },
        ] };
    },
  },
  {
    id: 1, title: "Row Scale", shortTitle: "Scale", tag: "Elementary Op II", color: "#5BB974",
    concept: [
      { head:"What it is", body:`Multiply every element of one row by a\nnonzero scalar k. This scales the row\nwithout changing its direction in row space.` },
      { head:"Effect on det(A)", body:`Scaling row i by k multiplies det by k:\n   det(scaled) = k × det(original)\n\nThis is why we do NOT scale during forward\nelimination — we would corrupt the determinant.\nScaling only happens in back-substitution\nwhere we divide each pivot row by its pivot\nvalue to make the pivot exactly 1.` },
      { head:"The key factor", body:`To make pivot A[r][pivotCol] equal 1:\n   k = 1 / A[r][pivotCol]\n   new row = k × old row\n   A[r][pivotCol] becomes 1  ✓` },
      { head:"MATLAB", body:`A(r,:) = k * A(r,:)\n% To normalize a pivot:\nA(r,:) = A(r,:) / A(r, pivotCol)` },
    ],
    pseudo:`FUNCTION rowScale(M, r, k):\n  N ← deep copy of M\n  FOR each column c in N[r]:\n    N[r][c] ← N[r][c] × k\n  RETURN N`,
    starterCode:`function rowScale(M, r, k) {
  const N = M.map(row => [...row]);

  // YOUR CODE ↓
  // Replace every element in N[r] with element × k
  // Tip: N[r] = N[r].map(v => ...)
  ___

  return N;
}`,
    blanks: ["___"], solutions: ["N[r] = N[r].map(v => v * k);"],
    testMatrix: [[2,4,6],[1,3,5],[0,1,2]],
    testFn: (fn) => {
      const M = [[2,4,6],[1,3,5],[0,1,2]];
      const R = fn(M, 0, 0.5);
      return { ok:R[0][0]===1 && R[0][1]===2 && M[0][0]===2, result:R,
        expected:[[1,2,3],[1,3,5],[0,1,2]],
        checks:[
          { label:"R1 scaled to [1, 2, 3]", pass:R[0][0]===1 && R[0][1]===2 && R[0][2]===3 },
          { label:"R2 unchanged", pass:R[1][0]===1 && R[1][1]===3 },
          { label:"Original not mutated", pass:M[0][0]===2 },
        ] };
    },
  },
  {
    id: 2, title: "Row Add", shortTitle: "Add", tag: "Elementary Op III", color: "#E8A838",
    concept: [
      { head:"What it is", body:`Add a scalar multiple of one row to another.\nThis is the core operation of Gaussian\nelimination — used in every single\nelimination step.` },
      { head:"Effect on det(A)", body:`None. Row addition does NOT change the\ndeterminant. This is the critical property:\n\n  det(after rowAdd) = det(before rowAdd)\n\nProof: det is multilinear and alternating.\nAdding a multiple of row j to row i is\nequivalent to expanding along a determinant\nwith two equal rows — which is always 0.` },
      { head:"The elimination factor", body:`To zero out entry A[target][col]:\n   factor = −A[target][col] / A[source][col]\n\nThen:  A[target][col] + factor × A[source][col]\n     = A[target][col] − A[target][col] = 0  ✓` },
      { head:"MATLAB", body:`A(target,:) = A(target,:) + k * A(source,:)` },
    ],
    pseudo:`FUNCTION rowAdd(M, target, source, k):\n  N ← deep copy of M\n  FOR each column c:\n    N[target][c] ← M[target][c] + k × M[source][c]\n  RETURN N`,
    starterCode:`function rowAdd(M, target, source, k) {
  const N = M.map(row => [...row]);

  // YOUR CODE ↓
  // Each element: N[target][c] = M[target][c] + k * M[source][c]
  // Use M[source][c] (original), not N[source][c]
  // Tip: N[target] = N[target].map((v, c) => ...)
  ___

  return N;
}`,
    blanks: ["___"], solutions: ["N[target] = N[target].map((v, c) => v + k * M[source][c]);"],
    testMatrix: [[1,2,3],[4,5,6],[7,8,9]],
    testFn: (fn) => {
      const M = [[1,2,3],[4,5,6],[7,8,9]];
      const R = fn(M, 1, 0, -4);
      return { ok:Math.abs(R[1][0])<1e-10 && Math.abs(R[1][1]+3)<1e-10, result:R,
        expected:[[1,2,3],[0,-3,-6],[7,8,9]],
        checks:[
          { label:"R2 = R2 + (−4)×R1 = [0, −3, −6]", pass:Math.abs(R[1][0])<1e-10 && Math.abs(R[1][1]+3)<1e-10 },
          { label:"R1 unchanged", pass:R[0][0]===1 && R[0][1]===2 },
          { label:"R3 unchanged", pass:R[2][0]===7 && R[2][1]===8 },
          { label:"M[source] not mutated", pass:M[0][0]===1 },
        ] };
    },
  },
  {
    id: 3, title: "Forward Elimination", shortTitle: "Fwd Elim", tag: "Gaussian Elimination", color: "#B57BEB",
    concept: [
      { head:"Goal", body:`Transform A into an upper triangular matrix U\n— zeros below every pivot. This is the first\nhalf of RREF, identical to what MATLAB's\nrref() does internally.` },
      { head:"The algorithm", body:`Walk left to right across columns.\nFor each column, find the pivot row (partial\npivoting), swap it to the top, then use\nrowAdd to zero out every row below it.\n\nThe factor that zeros row r in column col:\n   factor = −A[r][col] / A[pivotRow][col]` },
      { head:"Partial pivoting — why", body:`Before eliminating column col, swap the row\nwith the largest |value| in that column to\nthe pivot position.\n\nIf we do not do this and the pivot is very\nsmall, dividing by it amplifies floating-point\nerror enormously. Partial pivoting is not\njust a convenience — it is numerically\nessential. MATLAB always uses it.` },
      { head:"After this step", body:`All entries below the diagonal are zero.\nThe diagonal entries are the pivots.\nNumber of nonzero pivots = rank(A).` },
    ],
    pseudo:`FUNCTION forwardElim(M):\n  A ← deep copy of M\n  pivotRow ← 0\n\n  FOR col FROM 0 TO cols−1:\n    maxRow ← row with largest |A[row][col]|\n    IF |A[maxRow][col]| < epsilon: CONTINUE\n\n    IF maxRow ≠ pivotRow:\n      A ← rowSwap(A, pivotRow, maxRow)\n\n    FOR r FROM pivotRow+1 TO rows−1:\n      factor ← −A[r][col] / A[pivotRow][col]\n      A ← rowAdd(A, r, pivotRow, factor)\n\n    pivotRow ← pivotRow + 1\n\n  RETURN A`,
    starterCode:`function forwardElim(M) {
  let A = M.map(row => [...row]);
  const rows = A.length, cols = A[0].length;
  let pivotRow = 0;

  for (let col = 0; col < cols && pivotRow < rows; col++) {
    let maxRow = pivotRow;
    for (let r = pivotRow + 1; r < rows; r++)
      if (Math.abs(A[r][col]) > Math.abs(A[maxRow][col])) maxRow = r;

    if (Math.abs(A[maxRow][col]) < 1e-10) continue;

    if (maxRow !== pivotRow) {
      // YOUR CODE A ↓  swap maxRow to pivotRow
      ___A___
    }

    for (let r = pivotRow + 1; r < rows; r++) {
      if (Math.abs(A[r][col]) < 1e-10) continue;
      // YOUR CODE B ↓  factor that makes A[r][col] → 0
      const factor = ___B___;
      A = rowAdd(A, r, pivotRow, factor);
    }
    pivotRow++;
  }
  return A;
}`,
    blanks: ["___A___", "___B___"],
    solutions: ["[A[pivotRow], A[maxRow]] = [A[maxRow], A[pivotRow]];", "-A[r][col] / A[pivotRow][col]"],
    testMatrix: [[2,1,-1],[4,3,1],[-2,1,5]],
    testFn: (fn) => {
      const helpers = `function rowSwap(M,a,b){const N=M.map(r=>[...r]);[N[a],N[b]]=[N[b],N[a]];return N;};function rowAdd=(M,t,s,k){const N=M.map(r=>[...r]);N[t]=N[t].map((v,c)=>v+k*M[s][c]);return N;};`;
      const M = [[2,1,-1],[4,3,1],[-2,1,5]];
      const ref = ref_fwdElim(M, false).result;
      try {
        // eslint-disable-next-line no-new-func
        const wrapped = new Function(helpers + "\n" + fn.toString() + "\nreturn forwardElim;");
        const result = wrapped()(M);
        const allZero = result.slice(1).every((row,ri) => row.slice(0,ri+1).every((v)=>Math.abs(v)<1e-8));
        return { ok:allZero, result, expected:ref, checks:[
          { label:"Below-diagonal entries all zero", pass:allZero },
          { label:"A[1][0] = 0", pass:Math.abs(result[1][0])<1e-8 },
          { label:"A[2][0] = 0", pass:Math.abs(result[2][0])<1e-8 },
          { label:"A[2][1] = 0", pass:Math.abs(result[2][1])<1e-8 },
          { label:"Diagonal (pivots) nonzero", pass:Math.abs(result[0][0])>1e-10 },
        ] };
      } catch(e) { return { ok:false, result:null, expected:ref, checks:[{ label:String(e), pass:false }] }; }
    },
    multi: true,
  },
  {
    id: 4, title: "Back Substitution", shortTitle: "Back Sub", tag: "RREF Completion", color: "#E8625A",
    concept: [
      { head:"Goal", body:`Take the upper triangular matrix from forward\nelimination and complete it to RREF:\n — scale each pivot row so pivot = 1\n — zero out everything above each pivot\n\nResult: Reduced Row Echelon Form (RREF).` },
      { head:"Reading the solution", body:`After RREF on augmented matrix [A | b]:\n — pivot columns → basic variables\n — non-pivot columns → free variables\n — solution reads directly from last column\n\n[1 0 0 | 3]    x₁ = 3\n[0 1 0 | −1] → x₂ = −1\n[0 0 1 | 2]    x₃ = 2` },
      { head:"Why bottom-up", body:`Working from the last pivot row upward ensures\nthat when we zero out above row r, the pivot\nin row r is already scaled to 1. This keeps\nthe arithmetic clean and the logic simple.` },
      { head:"MATLAB", body:`% MATLAB's rref() does both halves together.\nrref([A, b])` },
    ],
    pseudo:`FUNCTION backSub(M):\n  A ← deep copy of M\n\n  FOR r FROM rows−1 DOWN TO 0:\n    pivotCol ← first nonzero entry in A[r]\n    IF none: CONTINUE\n\n    k ← 1 / A[r][pivotCol]\n    A ← rowScale(A, r, k)\n\n    FOR above FROM 0 TO r−1:\n      IF A[above][pivotCol] ≠ 0:\n        factor ← −A[above][pivotCol]\n        A ← rowAdd(A, above, r, factor)\n\n  RETURN A`,
    starterCode:`function backSub(M) {
  let A = M.map(row => [...row]);
  const rows = A.length;

  for (let r = rows - 1; r >= 0; r--) {
    const pivotCol = A[r].findIndex(v => Math.abs(v) > 1e-10);
    if (pivotCol < 0) continue;

    // YOUR CODE A ↓  compute k to scale pivot to 1
    const k = ___A___;
    A = rowScale(A, r, k);

    for (let above = 0; above < r; above++) {
      if (Math.abs(A[above][pivotCol]) < 1e-10) continue;
      // YOUR CODE B ↓  factor to zero out A[above][pivotCol]
      const factor = ___B___;
      A = rowAdd(A, above, r, factor);
    }
  }
  return A;
}`,
    blanks: ["___A___", "___B___"],
    solutions: ["1 / A[r][pivotCol]", "-A[above][pivotCol]"],
    testMatrix: [[2,1,-1],[4,3,1],[-2,1,5]],
    testFn: (fn) => {
      const helpers = `function rowScale(M,r,k){const N=M.map(r=>[...r]);N[r]=N[r].map(v=>v*k);return N;};function rowAdd(M,t,s,k){const N=M.map(r=>[...r]);N[t]=N[t].map((v,c)=>v+k*M[s][c]);return N;};`;
      const M = [[2,1,-1],[4,3,1],[-2,1,5]];
      const upper = ref_fwdElim(M, false).result;
      const ref = ref_backSub(upper, false).result;
      try {
        // eslint-disable-next-line no-new-func
        const wrapped = new Function(helpers + "\n" + fn.toString() + "\nreturn backSub;");
        const result = wrapped()(upper);
        const close = result.every((row,r) => row.every((v,c) => Math.abs(v-ref[r][c])<1e-6));
        const pivOk = result.some((row) => { const pc=row.findIndex((v)=>Math.abs(v)>1e-10); return pc>=0 && Math.abs(row[pc]-1)<1e-8; });
        return { ok:close, result, expected:ref, checks:[
          { label:"All pivots scaled to 1", pass:pivOk },
          { label:"Matches reference RREF", pass:close },
          { label:"Above-pivot entries cleared", pass:Math.abs(result[0][1])<1e-8 && Math.abs(result[0][2])<1e-8 },
        ] };
      } catch(e) { return { ok:false, result:null, expected:ref, checks:[{ label:String(e), pass:false }] }; }
    },
    multi: true,
  },
  {
    id: 5, title: "Determinant", shortTitle: "det(A)", tag: "Scalar from Matrix", color: "#4A90D9",
    concept: [
      { head:"The key insight", body:`You have almost already computed it.\nAfter forward elimination to upper triangular U:\n\n  det(A) = (−1)^swaps × U[0][0] × U[1][1] × … × U[n−1][n−1]\n\nProduct of the diagonal entries, adjusted for\nhow many row swaps we made.` },
      { head:"Why the diagonal product", body:`Upper triangular → det = product of diagonal.\nProof by induction on cofactor expansion along\nthe first column: each cofactor is itself upper\ntriangular, so the result follows recursively.` },
      { head:"Why track swaps", body:`rowAdd: no change to det.\nrowSwap: multiplies det by −1.\nrowScale by k: multiplies det by k.\n\nWe never scale during forward elimination, so\nthe only correction needed is (−1)^swapCount.` },
      { head:"MATLAB", body:`det(A)  % uses LU decomposition internally` },
    ],
    pseudo:`FUNCTION determinant(M):\n  swapCount ← 0\n  Run forward elim, counting swaps\n\n  det ← (−1)^swapCount\n  FOR i FROM 0 TO n−1:\n    det ← det × A[i][i]\n\n  RETURN det`,
    starterCode:`function determinant(M) {
  let A = M.map(row => [...row]);
  const n = A.length;
  let swapCount = 0;

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(A[r][col]) > Math.abs(A[maxRow][col])) maxRow = r;

    if (Math.abs(A[maxRow][col]) < 1e-10) return 0;

    if (maxRow !== col) {
      [A[col], A[maxRow]] = [A[maxRow], A[col]];
      swapCount++;
    }
    for (let r = col + 1; r < n; r++) {
      const f = -A[r][col] / A[col][col];
      A[r] = A[r].map((v, c) => v + f * A[col][c]);
    }
  }

  // YOUR CODE A ↓  start det as the sign from swaps
  let det = ___A___;

  // YOUR CODE B ↓  multiply det by each diagonal entry
  for (let i = 0; i < n; i++) {
    ___B___
  }
  return Math.abs(det) < 1e-10 ? 0 : det;
}`,
    blanks: ["___A___", "___B___"],
    solutions: ["Math.pow(-1, swapCount)", "det *= A[i][i];"],
    testMatrix: [[2,1,-1],[4,3,1],[-2,1,5]],
    testFn: (fn) => {
      const M = [[2,1,-1],[4,3,1],[-2,1,5]];
      const expected = ref_det(M);
      let result, ok;
      try {
        result = fn(M);
        ok = Math.abs(result - expected) < 1e-5;
      } catch(e) { return { ok:false, result:null, expected, checks:[{ label:String(e), pass:false }] }; }
      const r2 = fn([[3,8],[4,6]]);
      const r3 = fn([[1,2],[2,4]]);
      return { ok, result, expected, checks:[
        { label:`det([[2,1,−1],[4,3,1],[−2,1,5]]) = ${fmtN(expected)}`, pass:ok },
        { label:"det([[3,8],[4,6]]) = −14", pass:Math.abs(r2+14)<1e-5 },
        { label:"Singular matrix → 0", pass:Math.abs(r3)<1e-8 },
      ] };
    },
    multi: true,
  },
  {
    id: 6, title: "Matrix Inverse", shortTitle: "inv(A)", tag: "Gauss-Jordan", color: "#5BB974",
    concept: [
      { head:"The method", body:`Augment A with the identity: [A | I]\nRun full RREF on the combined matrix.\nIf A is invertible, the result is [I | A⁻¹].\n\nThe inverse appears on the right side.` },
      { head:"Why it works", body:`Each row operation is multiplication by an\nelementary matrix E on the left. After all ops:\n\n  E_k ··· E_1 × [A | I] = [I | E_k ··· E_1]\n\nSince E_k ··· E_1 × A = I, we have:\n  E_k ··· E_1 = A⁻¹` },
      { head:"Singularity check", body:`If after RREF the left side is NOT the identity,\nthe matrix is singular — no inverse exists.\n   det(A) = 0 → A is not invertible\n\nReturn null.` },
      { head:"MATLAB", body:`inv(A)\nA \\ b   % solve Ax=b (preferred)` },
    ],
    pseudo:`FUNCTION matInverse(M):\n  aug[i] ← [ M[i][0..n−1]  |  identity row i ]\n  RUN forwardElim on aug\n  RUN backSub on aug\n  IF left half ≠ I: RETURN null\n  RETURN right half of aug`,
    starterCode:`function matInverse(M) {
  const n = M.length;

  // YOUR CODE A ↓
  // Build augmented [A | I]
  // aug[i] = [...M[i],  0…1(at i)…0]
  const aug = M.map((row, i) => {
    ___A___
  });

  let pivotRow = 0;
  for (let col = 0; col < n; col++) {
    let maxRow = pivotRow;
    for (let r = pivotRow + 1; r < n; r++)
      if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) maxRow = r;
    if (Math.abs(aug[maxRow][col]) < 1e-10) return null;
    if (maxRow !== pivotRow)
      [aug[pivotRow], aug[maxRow]] = [aug[maxRow], aug[pivotRow]];
    for (let r = pivotRow + 1; r < n; r++) {
      const f = -aug[r][col] / aug[pivotRow][col];
      aug[r] = aug[r].map((v, c) => v + f * aug[pivotRow][c]);
    }
    pivotRow++;
  }

  for (let r = n - 1; r >= 0; r--) {
    const pivot = aug[r][r];
    if (Math.abs(pivot) < 1e-10) return null;
    aug[r] = aug[r].map(v => v / pivot);
    for (let above = 0; above < r; above++) {
      const f = -aug[above][r];
      aug[above] = aug[above].map((v, c) => v + f * aug[r][c]);
    }
  }

  // YOUR CODE B ↓  extract A⁻¹ — the right n columns
  return aug.map(row => {
    ___B___
  });
}`,
    blanks: ["___A___", "___B___"],
    solutions: ["return [...row, ...Array.from({length:n}, (_, j) => i === j ? 1 : 0)];", "return row.slice(n);"],
    testMatrix: [[2,1,-1],[4,3,1],[-2,1,5]],
    testFn: (fn) => {
      const M = [[2,1,-1],[4,3,1],[-2,1,5]];
      const expected = ref_inverse(M);
      let inv, ok = false;
      try {
        inv = fn(M);
        if (!inv) return { ok:false, result:null, expected, checks:[{ label:"returned null — check singularity logic", pass:false }] };
        const n = M.length;
        const prod = M.map((row,i) => Array.from({length:n}, (_,j) => row.reduce((s,v,k) => s+v*inv[k][j], 0)));
        ok = prod.every((row,i) => row.every((v,j) => Math.abs(v-(i===j?1:0))<1e-6));
        const sing = fn([[1,2],[2,4]]);
        return { ok, result:inv, expected, checks:[
          { label:"A × A⁻¹ = I", pass:ok },
          { label:"Returns 3×3 matrix", pass:inv.length===3 && inv[0].length===3 },
          { label:"Singular matrix returns null", pass:sing===null },
        ] };
      } catch(e) { return { ok:false, result:null, expected, checks:[{ label:String(e), pass:false }] }; }
    },
    multi: true,
  },
  {
    id: 7, title: "Normalize", shortTitle: "Normalize", tag: "Unit Vectors", color: "#E8A838",
    concept: [
      { head:"What it is", body:`Scale a vector so its length (norm) is exactly 1.\nThe result points in the same direction\nbut has magnitude = 1. Called a unit vector.` },
      { head:"Euclidean norm", body:`||v|| = sqrt( v[0]² + v[1]² + ··· + v[n−1]² )\n\nThis is the straight-line distance from the\norigin to the point v. Also written as:\n||v|| = sqrt(v · v)` },
      { head:"The formula", body:`v̂ = v / ||v||\n\nEach component is divided by the norm.\nResult: ||v̂|| = 1 always.` },
      { head:"Where it appears", body:`— Rotation matrix columns must be unit vectors\n— Gram-Schmidt normalizes at every step\n— Robot joint axes are unit vectors\n— ML: cosine similarity\n— Graphics: surface normals for lighting` },
      { head:"MATLAB", body:`norm(v)       % computes Euclidean norm\nv / norm(v)   % normalize` },
    ],
    pseudo:`FUNCTION normalize(v):\n  norm ← sqrt(sum of v[i]²)\n  IF norm < epsilon: RETURN null\n  RETURN v / norm   (divide each element)`,
    starterCode:`function normalize(v) {
  // YOUR CODE A ↓
  // Compute the Euclidean norm: sqrt of sum of squares
  const norm = ___A___;

  if (norm < 1e-10) return null;

  // YOUR CODE B ↓
  // Divide each element by norm and return
  return ___B___;
}`,
    blanks: ["___A___", "___B___"],
    solutions: ["Math.sqrt(v.reduce((s, x) => s + x*x, 0))", "v.map(x => x / norm)"],
    isVector: true,
    testFn: (fn) => {
      let r1, r2, r3;
      try {
        r1 = fn([3,4]); r2 = fn([1,2,2]); r3 = fn([0,0]);
        const l1 = r1 ? Math.sqrt(r1.reduce((s,x)=>s+x*x,0)) : 999;
        const l2 = r2 ? Math.sqrt(r2.reduce((s,x)=>s+x*x,0)) : 999;
        return { ok:Math.abs(l1-1)<1e-8, result:r1, expected:[0.6,0.8], checks:[
          { label:"normalize([3,4]) = [0.6, 0.8]", pass:r1 && Math.abs(r1[0]-0.6)<1e-8 && Math.abs(r1[1]-0.8)<1e-8 },
          { label:"normalize([3,4]) has length 1", pass:Math.abs(l1-1)<1e-8 },
          { label:"normalize([1,2,2]) has length 1", pass:Math.abs(l2-1)<1e-8 },
          { label:"normalize([0,0]) returns null", pass:r3===null },
        ] };
      } catch(e) { return { ok:false, result:null, expected:[0.6,0.8], checks:[{ label:String(e), pass:false }] }; }
    },
    multi: true,
  },
  {
    id: 8, title: "Gram-Schmidt", shortTitle: "QR", tag: "Orthogonalization", color: "#B57BEB",
    concept: [
      { head:"Goal", body:`Given a set of linearly independent vectors,\nproduce an orthonormal set that spans the\nsame space. This is QR decomposition.\n\nOrthogonal: every pair has dot product = 0\nOrthonormal: orthogonal AND each has length 1` },
      { head:"The projection", body:`The projection of vector v onto unit vector e:\n   proj = (v · e) × e\n\nThis is the component of v in the direction of e.\nSubtracting it removes that direction from v.` },
      { head:"The algorithm", body:`u₁ = v₁,   e₁ = u₁/||u₁||\n\nu₂ = v₂ − (v₂·e₁)e₁\ne₂ = u₂/||u₂||\n\nEach step: remove all previously-covered\ndirections, then normalize the remainder.` },
      { head:"MATLAB", body:`[Q, R] = qr(A)\n% Q has orthonormal columns\n% A = Q * R  always` },
    ],
    pseudo:`FUNCTION gramSchmidt(M):\n  vecs ← columns of M\n  Q ← empty list\n\n  FOR j FROM 0 TO numCols−1:\n    u ← vecs[j]\n    FOR i FROM 0 TO j−1:\n      dot ← u · Q[i]\n      u ← u − dot × Q[i]\n    norm ← ||u||\n    IF norm < eps: CONTINUE\n    PUSH u/norm onto Q\n\n  RETURN Q as matrix`,
    starterCode:`function gramSchmidt(M) {
  const cols = M[0].length;
  const vecs = Array.from({length: cols}, (_, j) => M.map(r => r[j]));
  const Q = [];

  for (let j = 0; j < cols; j++) {
    let u = [...vecs[j]];

    for (let i = 0; i < j; i++) {
      // YOUR CODE A ↓  dot product: u · Q[i]
      const dot = ___A___;
      u = u.map((val, k) => val - dot * Q[i][k]);
    }

    const norm = Math.sqrt(u.reduce((s, x) => s + x*x, 0));
    if (norm < 1e-10) continue;

    // YOUR CODE B ↓  normalize u and push onto Q
    ___B___
  }

  return M.map((_, r) => Q.map(q => q[r]));
}`,
    blanks: ["___A___", "___B___"],
    solutions: ["u.reduce((s, val, k) => s + val * Q[i][k], 0)", "Q.push(u.map(x => x / norm));"],
    testMatrix: [[1,1,0],[1,0,1],[0,1,1]],
    testFn: (fn) => {
      const M = [[1,1,0],[1,0,1],[0,1,1]];
      let result;
      try {
        result = fn(M);
        const qCols = Array.from({length:result[0].length}, (_,j) => result.map((r)=>r[j]));
        const unitLens = qCols.map((v) => Math.sqrt(v.reduce((s,x)=>s+x*x,0)));
        const allUnit = unitLens.every((l) => Math.abs(l-1)<1e-6);
        const dot01 = qCols[0].reduce((s,v,k)=>s+v*qCols[1][k],0);
        const orth = Math.abs(dot01)<1e-6;
        return { ok:allUnit && orth, result, expected:ref_gramSchmidt(M), checks:[
          { label:"All columns have length 1", pass:allUnit },
          { label:"Column 0 · Column 1 = 0 (orthogonal)", pass:orth },
          { label:"Returns 3 columns", pass:result[0].length===3 },
        ] };
      } catch(e) { return { ok:false, result:null, expected:ref_gramSchmidt(M), checks:[{ label:String(e), pass:false }] }; }
    },
    multi: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  JS RUNNER
// ─────────────────────────────────────────────────────────────────────────────
const HELPERS = `
function rowSwap(M,a,b){const N=M.map(r=>[...r]);[N[a],N[b]]=[N[b],N[a]];return N;};
function rowScale(M,r,k){const N=M.map(r=>[...r]);N[r]=N[r].map(v=>v*k);return N;};
function rowAdd(M,t,s,k){const N=M.map(r=>[...r]);N[t]=N[t].map((v,c)=>v+k*M[s][c]);return N;};
`;

const runCode = (lesson, code) => {
  try {
    const fnMatch = code.match(/function\s+(\w+)/);
    if (!fnMatch) return { error: "No function definition found." };
    const fnName = fnMatch[1];
    // eslint-disable-next-line no-new-func
    const fn = new Function(HELPERS + code + `; return ${fnName};`)();
    const testResult = lesson.testFn(fn);
    return { fn, testResult, error: null };
  } catch(e) {
    return { error: e.message || String(e), fn: null, testResult: null };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PYTHON STARTERS
// ─────────────────────────────────────────────────────────────────────────────
const PYTHON_STARTERS = [
// L0
`def row_swap(M, r1, r2):
    N = [row[:] for row in M]
    # YOUR CODE ↓  swap N[r1] and N[r2]
    # Tip: N[r1], N[r2] = N[r2], N[r1]
    ___
    return N`,

// L1
`def row_scale(M, r, k):
    N = [row[:] for row in M]
    # YOUR CODE ↓  multiply every element in N[r] by k
    # Tip: N[r] = [v * k for v in N[r]]
    ___
    return N`,

// L2
`def row_add(M, target, source, k):
    N = [row[:] for row in M]
    # YOUR CODE ↓  N[target][c] = M[target][c] + k * M[source][c]
    # Use M[source] (original), not N[source]
    ___
    return N`,

// L3
`def forward_elim(M):
    A = [row[:] for row in M]
    rows, cols = len(A), len(A[0])
    pivot_row = 0
    for col in range(cols):
        if pivot_row >= rows: break
        max_row = pivot_row
        for r in range(pivot_row + 1, rows):
            if abs(A[r][col]) > abs(A[max_row][col]): max_row = r
        if abs(A[max_row][col]) < 1e-10: continue
        if max_row != pivot_row:
            # YOUR CODE A ↓  swap rows
            ___A___
        for r in range(pivot_row + 1, rows):
            if abs(A[r][col]) < 1e-10: continue
            # YOUR CODE B ↓  elimination factor
            factor = ___B___
            A[r] = [A[r][c] + factor * A[pivot_row][c] for c in range(cols)]
        pivot_row += 1
    return A`,

// L4
`def back_sub(M):
    A = [row[:] for row in M]
    rows = len(A)
    for r in range(rows - 1, -1, -1):
        pivot_col = next((c for c, v in enumerate(A[r]) if abs(v) > 1e-10), -1)
        if pivot_col < 0: continue
        # YOUR CODE A ↓  scale factor to make pivot = 1
        k = ___A___
        A[r] = [v * k for v in A[r]]
        for above in range(r):
            if abs(A[above][pivot_col]) < 1e-10: continue
            # YOUR CODE B ↓  factor to zero out A[above][pivot_col]
            factor = ___B___
            A[above] = [A[above][c] + factor * A[r][c] for c in range(len(A[0]))]
    return A`,

// L5
`def determinant(M):
    A = [row[:] for row in M]
    n = len(A)
    swap_count = 0
    for col in range(n):
        max_row = col
        for r in range(col + 1, n):
            if abs(A[r][col]) > abs(A[max_row][col]): max_row = r
        if abs(A[max_row][col]) < 1e-10: return 0
        if max_row != col:
            A[col], A[max_row] = A[max_row], A[col]
            swap_count += 1
        for r in range(col + 1, n):
            f = -A[r][col] / A[col][col]
            A[r] = [A[r][c] + f * A[col][c] for c in range(n)]
    # YOUR CODE A ↓  sign from swap count
    det = ___A___
    # YOUR CODE B ↓  multiply by each diagonal
    for i in range(n):
        ___B___
    return 0 if abs(det) < 1e-10 else det`,

// L6
`def mat_inverse(M):
    n = len(M)
    # YOUR CODE A ↓  augmented [M | I]:  identity row i = [1 if j==i else 0 for j in range(n)]
    aug = [M[i][:] + ___A___ for i in range(n)]
    pivot_row = 0
    for col in range(n):
        max_row = pivot_row
        for r in range(pivot_row + 1, n):
            if abs(aug[r][col]) > abs(aug[max_row][col]): max_row = r
        if abs(aug[max_row][col]) < 1e-10: return None
        if max_row != pivot_row: aug[pivot_row], aug[max_row] = aug[max_row], aug[pivot_row]
        for r in range(pivot_row + 1, n):
            f = -aug[r][col] / aug[pivot_row][col]
            aug[r] = [aug[r][c] + f * aug[pivot_row][c] for c in range(2*n)]
        pivot_row += 1
    for r in range(n - 1, -1, -1):
        pivot = aug[r][r]
        if abs(pivot) < 1e-10: return None
        aug[r] = [v / pivot for v in aug[r]]
        for above in range(r):
            f = -aug[above][r]
            aug[above] = [aug[above][c] + f * aug[r][c] for c in range(2*n)]
    # YOUR CODE B ↓  extract right half: row[n:]
    return [___B___ for row in aug]`,

// L7
`from math import sqrt

def normalize(v):
    # YOUR CODE A ↓  Euclidean norm: sqrt of sum of squares
    norm = ___A___
    if norm < 1e-10: return None
    # YOUR CODE B ↓  divide each element by norm
    return ___B___`,

// L8
`from math import sqrt

def gram_schmidt(M):
    rows, cols = len(M), len(M[0])
    vecs = [[M[r][j] for r in range(rows)] for j in range(cols)]
    Q = []
    for j in range(cols):
        u = vecs[j][:]
        for i in range(j):
            # YOUR CODE A ↓  dot product u · Q[i]
            dot = ___A___
            u = [u[k] - dot * Q[i][k] for k in range(rows)]
        norm = sqrt(sum(x*x for x in u))
        if norm < 1e-10: continue
        # YOUR CODE B ↓  normalize and append to Q
        ___B___
    return [[Q[j][r] for j in range(len(Q))] for r in range(rows)]`,
];

const PYTHON_BLANKS = [
  ["___"], ["___"], ["___"],
  ["___A___", "___B___"], ["___A___", "___B___"],
  ["___A___", "___B___"], ["___A___", "___B___"],
  ["___A___", "___B___"], ["___A___", "___B___"],
];

const PYTHON_SOLUTIONS = [
  ["N[r1], N[r2] = N[r2], N[r1]"],
  ["N[r] = [v * k for v in N[r]]"],
  ["N[target] = [M[target][c] + k * M[source][c] for c in range(len(M[0]))]"],
  ["A[pivot_row], A[max_row] = A[max_row], A[pivot_row]", "-A[r][col] / A[pivot_row][col]"],
  ["1.0 / A[r][pivot_col]", "-A[above][pivot_col]"],
  ["(-1) ** swap_count", "det *= A[i][i]"],
  ["[1 if j == i else 0 for j in range(n)]", "row[n:]"],
  ["sqrt(sum(x*x for x in v))", "[x / norm for x in v]"],
  ["sum(u[k] * Q[i][k] for k in range(rows))", "Q.append([x / norm for x in u])"],
];

// Python test harnesses — appended after user code; store result in _matrix_result
const PY_HARNESSES = [
// L0
`import json as _json
_M = [[1,2,3],[4,5,6],[7,8,9]]
_R = row_swap(_M, 0, 2)
_checks = [
  {'label':'R1 is now [7,8,9]','pass':_R[0]==[7,8,9]},
  {'label':'R3 is now [1,2,3]','pass':_R[2]==[1,2,3]},
  {'label':'R2 unchanged','pass':_R[1]==[4,5,6]},
  {'label':'Original not mutated','pass':_M[0][0]==1},
]
_ok = all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_R})`,

// L1
`import json as _json
_M = [[2,4,6],[1,3,5],[0,1,2]]
_R = row_scale(_M, 0, 0.5)
_c = lambda a,b: abs(a-b)<1e-8
_checks = [
  {'label':'R1 scaled to [1,2,3]','pass':_c(_R[0][0],1) and _c(_R[0][1],2) and _c(_R[0][2],3)},
  {'label':'R2 unchanged','pass':_R[1][0]==1 and _R[1][1]==3},
  {'label':'Original not mutated','pass':_M[0][0]==2},
]
_ok = all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_R})`,

// L2
`import json as _json
_M = [[1,2,3],[4,5,6],[7,8,9]]
_R = row_add(_M, 1, 0, -4)
_c = lambda a,b: abs(a-b)<1e-8
_checks = [
  {'label':'R2=[0,-3,-6]','pass':_c(_R[1][0],0) and _c(_R[1][1],-3) and _c(_R[1][2],-6)},
  {'label':'R1 unchanged','pass':_R[0][0]==1 and _R[0][1]==2},
  {'label':'R3 unchanged','pass':_R[2][0]==7 and _R[2][1]==8},
  {'label':'Original not mutated','pass':_M[0][0]==1},
]
_ok = all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_R})`,

// L3
`import json as _json
_M = [[2,1,-1],[4,3,1],[-2,1,5]]
_R = forward_elim(_M)
_c = lambda a,b: abs(a-b)<1e-8
_checks = [
  {'label':'A[1][0]=0','pass':_c(_R[1][0],0)},
  {'label':'A[2][0]=0','pass':_c(_R[2][0],0)},
  {'label':'A[2][1]=0','pass':_c(_R[2][1],0)},
  {'label':'Diagonal nonzero','pass':abs(_R[0][0])>1e-10},
]
_ok = all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_R})`,

// L4
`import json as _json
def _fwd(M):
    A=[row[:] for row in M]; rows,cols=len(A),len(A[0]); pr=0
    for col in range(cols):
        if pr>=rows: break
        mx=pr
        for r in range(pr+1,rows):
            if abs(A[r][col])>abs(A[mx][col]): mx=r
        if abs(A[mx][col])<1e-10: continue
        if mx!=pr: A[pr],A[mx]=A[mx],A[pr]
        for r in range(pr+1,rows):
            f=-A[r][col]/A[pr][col]; A[r]=[A[r][c]+f*A[pr][c] for c in range(cols)]
        pr+=1
    return A
_upper = _fwd([[2,1,-1],[4,3,1],[-2,1,5]])
_R = back_sub(_upper)
_c = lambda a,b: abs(a-b)<1e-8
_piv_ok = all(_c(_R[i][i],1) for i in range(3))
_above_ok = _c(_R[0][1],0) and _c(_R[0][2],0) and _c(_R[1][2],0)
_checks = [
  {'label':'All pivots scaled to 1','pass':_piv_ok},
  {'label':'Above-pivot entries cleared','pass':_above_ok},
]
_ok = all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_R})`,

// L5
`import json as _json
_c = lambda a,b: abs(a-b)<1e-6
_d1 = determinant([[2,1,-1],[4,3,1],[-2,1,5]])
_d2 = determinant([[3,8],[4,6]])
_d3 = determinant([[1,2],[2,4]])
_checks = [
  {'label':'det([[2,1,-1],[4,3,1],[-2,1,5]])=-4','pass':_c(_d1,-4)},
  {'label':'det([[3,8],[4,6]])=-14','pass':_c(_d2,-14)},
  {'label':'Singular matrix=0','pass':_c(_d3,0)},
]
_ok = all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_d1})`,

// L6
`import json as _json
_M = [[2,1,-1],[4,3,1],[-2,1,5]]
_inv = mat_inverse(_M)
_sing = mat_inverse([[1,2],[2,4]])
_c = lambda a,b: abs(a-b)<1e-6
if _inv is None:
    _checks=[{'label':'returned None - check logic','pass':False}]; _ok=False
else:
    n=len(_M)
    _prod=[[sum(_M[r][k]*_inv[k][col] for k in range(n)) for col in range(n)] for r in range(n)]
    _id_ok=all(_c(_prod[r][c],1 if r==c else 0) for r in range(n) for c in range(n))
    _checks=[
        {'label':'A x A_inv = I','pass':_id_ok},
        {'label':'Returns 3x3 matrix','pass':len(_inv)==3 and len(_inv[0])==3},
        {'label':'Singular returns None','pass':_sing is None},
    ]; _ok=all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_inv})`,

// L7
`import json as _json
from math import sqrt as _sqrt
_c = lambda a,b: abs(a-b)<1e-8
_r1 = normalize([3,4])
_r2 = normalize([1,2,2])
_r3 = normalize([0,0])
_l1 = _sqrt(sum(x*x for x in _r1)) if _r1 else 999
_l2 = _sqrt(sum(x*x for x in _r2)) if _r2 else 999
_checks = [
  {'label':'normalize([3,4])=[0.6,0.8]','pass':_r1 and _c(_r1[0],0.6) and _c(_r1[1],0.8)},
  {'label':'normalize([3,4]) has length 1','pass':_c(_l1,1)},
  {'label':'normalize([1,2,2]) has length 1','pass':_c(_l2,1)},
  {'label':'normalize([0,0]) returns None','pass':_r3 is None},
]
_ok = all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_r1})`,

// L8
`import json as _json
from math import sqrt as _sqrt
_M = [[1,1,0],[1,0,1],[0,1,1]]
_Q = gram_schmidt(_M)
_cols = [[_Q[r][j] for r in range(3)] for j in range(len(_Q[0]))]
_lens = [_sqrt(sum(x*x for x in col)) for col in _cols]
_dot01 = sum(_cols[0][k]*_cols[1][k] for k in range(3)) if len(_cols)>1 else 0
_c = lambda a,b: abs(a-b)<1e-6
_checks = [
  {'label':'All columns have length 1','pass':all(_c(l,1) for l in _lens)},
  {'label':'Col0 · Col1 = 0 (orthogonal)','pass':_c(_dot01,0)},
  {'label':'Returns 3 columns','pass':len(_Q[0])==3},
]
_ok = all(c['pass'] for c in _checks)
_matrix_result = _json.dumps({'ok':_ok,'checks':_checks,'result':_Q})`,
];

async function runPythonMatrix(lesson, code) {
  const output = [];
  try {
    const pyodide = await getPyodide();
    pyodide.setStdout({ batched: (msg) => output.push(msg) });
    pyodide.setStderr({ batched: (msg) => output.push("⚠ " + msg) });
    const fullCode = `from math import *\n${code}\n${PY_HARNESSES[lesson.id]}`;
    await pyodide.runPythonAsync(fullCode);
    const proxy = pyodide.globals.get("_matrix_result");
    if (!proxy) return { error: "No test result — check your function name." };
    const jsonStr = typeof proxy === "string" ? proxy : proxy.toString();
    if (typeof proxy?.destroy === "function") proxy.destroy();
    const parsed = JSON.parse(jsonStr);
    return { testResult: { ok: parsed.ok, checks: parsed.checks, result: parsed.result }, output };
  } catch(e) {
    return { error: e.message || String(e), output };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MATLAB STARTERS
// ─────────────────────────────────────────────────────────────────────────────
const MATLAB_STARTERS = [
// L0
`function N = rowSwap(M, r1, r2)
  N = M;
  % YOUR CODE ↓  swap rows r1 and r2 (1-indexed)
  % Tip: N([r1 r2], :) = N([r2 r1], :);
  ___
end`,

// L1
`function N = rowScale(M, r, k)
  N = M;
  % YOUR CODE ↓  scale row r by k
  % Tip: N(r, :) = N(r, :) * k;
  ___
end`,

// L2
`function N = rowAdd(M, target, source, k)
  N = M;
  % YOUR CODE ↓  N(target,:) = N(target,:) + k * M(source,:)
  ___
end`,

// L3
`function A = forwardElim(M)
  A = M;
  [rows, cols] = size(A);
  pivot_row = 1;
  for col = 1:cols
    if pivot_row > rows, break; end
    max_row = pivot_row;
    for r = pivot_row+1:rows
      if abs(A(r,col)) > abs(A(max_row,col)), max_row = r; end
    end
    if abs(A(max_row,col)) < 1e-10, continue; end
    if max_row ~= pivot_row
      % YOUR CODE A ↓  swap rows
      ___A___
    end
    for r = pivot_row+1:rows
      if abs(A(r,col)) < 1e-10, continue; end
      % YOUR CODE B ↓  elimination factor
      factor = ___B___;
      A(r,:) = A(r,:) + factor * A(pivot_row,:);
    end
    pivot_row = pivot_row + 1;
  end
end`,

// L4
`function A = backSub(M)
  A = M;
  rows = size(A, 1);
  for r = rows:-1:1
    pivot_col = 0;
    for c = 1:size(A,2)
      if abs(A(r,c)) > 1e-10, pivot_col = c; break; end
    end
    if pivot_col == 0, continue; end
    % YOUR CODE A ↓  scale factor: 1 / A(r, pivot_col)
    k = ___A___;
    A(r,:) = A(r,:) * k;
    for above = 1:r-1
      if abs(A(above,pivot_col)) < 1e-10, continue; end
      % YOUR CODE B ↓  factor to zero A(above,pivot_col)
      factor = ___B___;
      A(above,:) = A(above,:) + factor * A(r,:);
    end
  end
end`,

// L5
`function d = determinant(M)
  A = M;
  n = size(A,1);
  swap_count = 0;
  for col = 1:n
    max_row = col;
    for r = col+1:n
      if abs(A(r,col)) > abs(A(max_row,col)), max_row = r; end
    end
    if abs(A(max_row,col)) < 1e-10, d = 0; return; end
    if max_row ~= col
      A([col max_row],:) = A([max_row col],:);
      swap_count = swap_count + 1;
    end
    for r = col+1:n
      f = -A(r,col) / A(col,col);
      A(r,:) = A(r,:) + f * A(col,:);
    end
  end
  % YOUR CODE A ↓  sign from swaps: (-1)^swap_count
  d = ___A___;
  % YOUR CODE B ↓  multiply by each diagonal entry
  for i = 1:n
    ___B___
  end
  if abs(d) < 1e-10, d = 0; end
end`,

// L6
`function inv_M = matInverse(M)
  n = size(M,1);
  % YOUR CODE A ↓  augmented [M | I]:  [M, eye(n)]
  aug = [M, ___A___];
  pr = 1;
  for col = 1:n
    mx = pr;
    for r = pr+1:n
      if abs(aug(r,col)) > abs(aug(mx,col)), mx = r; end
    end
    if abs(aug(mx,col)) < 1e-10, inv_M = []; return; end
    if mx ~= pr, aug([pr mx],:) = aug([mx pr],:); end
    for r = pr+1:n
      f = -aug(r,col) / aug(pr,col);
      aug(r,:) = aug(r,:) + f * aug(pr,:);
    end
    pr = pr + 1;
  end
  for r = n:-1:1
    pivot = aug(r,r);
    if abs(pivot) < 1e-10, inv_M = []; return; end
    aug(r,:) = aug(r,:) / pivot;
    for above = 1:r-1
      f = -aug(above,r);
      aug(above,:) = aug(above,:) + f * aug(r,:);
    end
  end
  % YOUR CODE B ↓  extract right half: aug(:, n+1:end)
  inv_M = ___B___;
end`,

// L7
`function v_hat = normalize(v)
  % YOUR CODE A ↓  Euclidean norm: norm(v)
  n = ___A___;
  if n < 1e-10
    v_hat = [];
    return;
  end
  % YOUR CODE B ↓  divide by norm: v / n
  v_hat = ___B___;
end`,

// L8
`function Q = gramSchmidt(M)
  [rows, cols] = size(M);
  Q_mat = zeros(rows, cols);
  q_count = 0;
  for j = 1:cols
    u = M(:,j);
    for i = 1:q_count
      dt = dot(u, Q_mat(:,i));
      u = u - dt * Q_mat(:,i);
    end
    n = norm(u);
    if n < 1e-10, continue; end
    q_count = q_count + 1;
    % YOUR CODE ↓  store normalized u in Q_mat(:, q_count)
    ___
  end
  Q = Q_mat(:, 1:q_count);
end`,
];

const MATLAB_BLANKS = [
  ["___"], ["___"], ["___"],
  ["___A___", "___B___"], ["___A___", "___B___"],
  ["___A___", "___B___"], ["___A___", "___B___"],
  ["___A___", "___B___"], ["___"],
];

const MATLAB_SOLUTIONS = [
  ["N([r1 r2], :) = N([r2 r1], :);"],
  ["N(r, :) = N(r, :) * k;"],
  ["N(target, :) = N(target, :) + k * M(source, :);"],
  ["A([pivot_row max_row],:) = A([max_row pivot_row],:);", "-A(r,col) / A(pivot_row,col)"],
  ["1 / A(r, pivot_col)", "-A(above, pivot_col)"],
  ["(-1)^swap_count", "d = d * A(i,i);"],
  ["eye(n)", "aug(:, n+1:end)"],
  ["norm(v)", "v / n"],
  ["Q_mat(:, q_count) = u / n;"],
];

// MATLAB test blocks — each is a function that wraps user code + injects test call
const ML_TEST_BLOCKS = [
  // L0: rowSwap
  (code) => `${code}\nM_t = [1 2 3; 4 5 6; 7 8 9];\nresult = rowSwap(M_t, 1, 3);`,
  // L1: rowScale
  (code) => `${code}\nM_t = [2 4 6; 1 3 5; 0 1 2];\nresult = rowScale(M_t, 1, 0.5);`,
  // L2: rowAdd
  (code) => `${code}\nM_t = [1 2 3; 4 5 6; 7 8 9];\nresult = rowAdd(M_t, 2, 1, -4);`,
  // L3: forwardElim
  (code) => `${code}\nresult = forwardElim([2 1 -1; 4 3 1; -2 1 5]);`,
  // L4: backSub — inject reference fwd elim helper first
  (code) => `function A = _refFwdElim(M)
  A = M; [rows, cols] = size(A); pr = 1;
  for col = 1:cols
    if pr > rows, break; end
    mx = pr;
    for r = pr+1:rows
      if abs(A(r,col)) > abs(A(mx,col)), mx = r; end
    end
    if abs(A(mx,col)) < 1e-10, continue; end
    if mx ~= pr, A([pr mx],:) = A([mx pr],:); end
    for r = pr+1:rows
      f = -A(r,col)/A(pr,col); A(r,:) = A(r,:) + f * A(pr,:);
    end
    pr = pr + 1;
  end
end
${code}
upper = _refFwdElim([2 1 -1; 4 3 1; -2 1 5]);
result = backSub(upper);`,
  // L5: determinant
  (code) => `${code}\nresult = determinant([2 1 -1; 4 3 1; -2 1 5]);`,
  // L6: matInverse
  (code) => `${code}\nresult = matInverse([2 1 -1; 4 3 1; -2 1 5]);`,
  // L7: normalize
  (code) => `${code}\nresult = normalize([3 4]);`,
  // L8: gramSchmidt
  (code) => `${code}\nresult = gramSchmidt([1 1 0; 1 0 1; 0 1 1]);`,
];

const normalizeMatlabArray = (v) => {
  if (!Array.isArray(v)) return v;
  if (v.every(r => Array.isArray(r) && r.length === 1)) return v.map(r => r[0]);
  if (v.every(r => Array.isArray(r))) return v;
  return v;
};

function validateMatlabResult(lessonId, rawResult) {
  const result = normalizeMatlabArray(rawResult);
  const cl = (a, b) => Math.abs(a - b) < 1e-5;
  const clV = (u, v) => Array.isArray(u) && u.length === v.length && u.every((x, i) => cl(x, v[i]));
  // flatten column vector [[a],[b]] → [a,b]
  const flat = (v) => (Array.isArray(v) && Array.isArray(v[0])) ? v.map(r => (Array.isArray(r) ? r[0] : r)) : v;

  if (lessonId === 0) {
    const r = result || [];
    return [
      { label:"R1 is now [7,8,9]", pass: clV(r[0],[7,8,9]) },
      { label:"R3 is now [1,2,3]", pass: clV(r[2],[1,2,3]) },
      { label:"R2 unchanged [4,5,6]", pass: clV(r[1],[4,5,6]) },
    ];
  }
  if (lessonId === 1) {
    const r = result || [];
    return [
      { label:"R1 scaled to [1,2,3]", pass: clV(r[0],[1,2,3]) },
      { label:"R2 unchanged [1,3,5]", pass: clV(r[1],[1,3,5]) },
    ];
  }
  if (lessonId === 2) {
    const r = result || [];
    return [
      { label:"R2=[0,-3,-6]", pass: clV(r[1],[0,-3,-6]) },
      { label:"R1 unchanged", pass: clV(r[0],[1,2,3]) },
    ];
  }
  if (lessonId === 3) {
    const r = result || [];
    return [
      { label:"A[1][0]=0", pass: r[1] && cl(r[1][0],0) },
      { label:"A[2][0]=0", pass: r[2] && cl(r[2][0],0) },
      { label:"A[2][1]=0", pass: r[2] && cl(r[2][1],0) },
      { label:"Diagonal nonzero", pass: r[0] && Math.abs(r[0][0])>1e-8 },
    ];
  }
  if (lessonId === 4) {
    const r = result || [];
    const pivOk = r.every && r.every((row,i) => row && cl(row[i],1));
    const aboveOk = r[0] && cl(r[0][1],0) && cl(r[0][2],0);
    return [
      { label:"All pivots scaled to 1", pass: !!pivOk },
      { label:"Above-pivot entries cleared", pass: !!aboveOk },
    ];
  }
  if (lessonId === 5) {
    const d = typeof result === "number" ? result : (Array.isArray(result) ? flat(result)[0] : null);
    return [
      { label:"det = −4", pass: d !== null && cl(d, -4) },
    ];
  }
  if (lessonId === 6) {
    const inv = result;
    if (!inv || !Array.isArray(inv) || inv.length !== 3) return [{ label:"Returns 3×3 matrix", pass:false }];
    const M = [[2,1,-1],[4,3,1],[-2,1,5]];
    const prod = M.map((row,i) => Array.from({length:3}, (_,j) => row.reduce((s,v,k) => s+v*inv[k][j], 0)));
    const idOk = prod.every((row,i) => row.every((v,j) => cl(v, i===j?1:0)));
    return [
      { label:"A × A⁻¹ = I", pass: idOk },
      { label:"Returns 3×3 matrix", pass: inv.length===3 },
    ];
  }
  if (lessonId === 7) {
    const v = flat(result);
    const len = v ? Math.sqrt(v.reduce((s,x)=>s+x*x,0)) : 999;
    return [
      { label:"normalize([3,4])=[0.6,0.8]", pass: v && cl(v[0],0.6) && cl(v[1],0.8) },
      { label:"Length = 1", pass: cl(len,1) },
    ];
  }
  if (lessonId === 8) {
    const r = result || [];
    const qCols = Array.isArray(r[0]) ? Array.from({length:r[0].length}, (_,j) => r.map(row=>row[j])) : [];
    const allUnit = qCols.every(col => { const l = Math.sqrt(col.reduce((s,x)=>s+x*x,0)); return cl(l,1); });
    const dot01 = qCols.length>1 ? qCols[0].reduce((s,v,k)=>s+v*qCols[1][k],0) : 1;
    return [
      { label:"All columns have length 1", pass: allUnit },
      { label:"Col0 · Col1 = 0", pass: cl(dot01,0) },
    ];
  }
  return [{ label:"Unknown lesson", pass:false }];
}

function runMatlabMatrix(lesson, code) {
  try {
    const fullCode = ML_TEST_BLOCKS[lesson.id](code);
    const res = executeScript(fullCode);
    const resultVar = (res.workspace || []).find(v => v.name === "result");
    if (!resultVar) {
      const errMsg = res.output && res.output !== "No output." ? res.output : "No 'result' variable — check function name and output variable.";
      return { error: errMsg };
    }
    const rawResult = resultVar.value;
    const checks = validateMatlabResult(lesson.id, rawResult);
    const ok = checks.every(c => c.pass);
    return { testResult: { ok, checks, result: rawResult } };
  } catch(e) {
    return { error: e.message || String(e) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MATRIX DISPLAY
// ─────────────────────────────────────────────────────────────────────────────
const MatDisplay = ({ M, small, augAt }) => {
  if (!M || !M[0]) return <span style={{ color:"#666", fontSize:11, fontFamily:"monospace" }}>—</span>;
  const fs = small ? 11 : 13;
  const px = small ? "3px 8px" : "5px 12px";
  return (
    <table style={{ borderCollapse:"collapse", fontFamily:"'SF Mono',Menlo,monospace", display:"inline-table", verticalAlign:"middle" }}>
      <tbody>
        {M.map((row, r) => (
          <tr key={r}>
            <td style={{ fontSize:fs+5, color:"#555", padding:"0 3px", lineHeight:1, fontWeight:200 }}>
              {r===0 ? "⎡" : r===M.length-1 ? "⎣" : "⎢"}
            </td>
            {row.map((v, c) => (
              <td key={c} style={{ padding:px, fontSize:fs, textAlign:"right", fontFamily:"'SF Mono',Menlo,monospace", minWidth:small?30:42, color:Math.abs(v)<1e-10?"#444":"#e8e8e8", borderLeft:augAt&&c===augAt?"1px solid #444":undefined }}>
                {fmtN(v)}
              </td>
            ))}
            <td style={{ fontSize:fs+5, color:"#555", padding:"0 3px", lineHeight:1, fontWeight:200 }}>
              {r===0 ? "⎤" : r===M.length-1 ? "⎦" : "⎥"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// MatrixInput is imported from ./MatrixInputFix

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MatrixLab({ onBack }) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [tab, setTab] = useState("concept");
  const [lang, setLang] = useState("js");
  const [jsCode, setJsCode] = useState(LESSONS[0].starterCode);
  const [pyCode, setPyCode] = useState(PYTHON_STARTERS[0]);
  const [mlCode, setMlCode] = useState(MATLAB_STARTERS[0]);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [traceSteps, setTraceSteps] = useState([]);
  const [traceIdx, setTraceIdx] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [customMatrix, setCustomMatrix] = useState(() => (LESSONS[0].testMatrix || [[2,1,-1],[4,3,1],[-2,1,5]]).map(r=>[...r]));
  const [matrixInputKey, setMatrixInputKey] = useState(0);
  const [showViz, setShowViz] = useState(false);
  const editorRef = useRef(null);

  const lesson = LESSONS[lessonIdx];
  const isComplete = completed.has(lessonIdx);
  const lc = lesson.color;

  const currentCode = lang === "js" ? jsCode : lang === "python" ? pyCode : mlCode;
  const setCurrentCode = lang === "js" ? setJsCode : lang === "python" ? setPyCode : setMlCode;

  const currentBlanks = lang === "js" ? (lesson.blanks || []) : lang === "python" ? (PYTHON_BLANKS[lessonIdx] || []) : (MATLAB_BLANKS[lessonIdx] || []);
  const currentSolutions = lang === "js" ? (lesson.solutions || []) : lang === "python" ? (PYTHON_SOLUTIONS[lessonIdx] || []) : (MATLAB_SOLUTIONS[lessonIdx] || []);
  const currentStarter = lang === "js" ? lesson.starterCode : lang === "python" ? PYTHON_STARTERS[lessonIdx] : MATLAB_STARTERS[lessonIdx];

  const switchLesson = useCallback((idx) => {
    setLessonIdx(idx);
    setJsCode(LESSONS[idx].starterCode);
    setPyCode(PYTHON_STARTERS[idx]);
    setMlCode(MATLAB_STARTERS[idx]);
    setRunResult(null);
    setShowHint(false);
    setTraceSteps([]);
    setTraceIdx(0);
    setTab("concept");
    const defaultM = LESSONS[idx].testMatrix || [[2,1,-1],[4,3,1],[-2,1,5]];
    setCustomMatrix(defaultM.map(r=>[...r]));
    setMatrixInputKey(k => k + 1);
  }, []);

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    let res;
    if (lang === "js") {
      res = runCode(lesson, jsCode);
    } else if (lang === "python") {
      res = await runPythonMatrix(lesson, pyCode);
    } else {
      res = runMatlabMatrix(lesson, mlCode);
    }
    setRunning(false);
    setRunResult(res);
    if (res.testResult?.ok) {
      setCompleted((c) => new Set([...c, lessonIdx]));
      const trace = generateTrace(lessonIdx, customMatrix);
      setTraceSteps(trace);
      setTraceIdx(0);
    }
  };

  const handleTrace = () => {
    const trace = generateTrace(lessonIdx, customMatrix);
    if (trace.length > 0) {
      setTraceSteps(trace);
      setTraceIdx(0);
    }
  };

  const handleReveal = () => {
    let code = currentStarter;
    currentBlanks.forEach((blank, i) => { code = code.replace(blank, currentSolutions[i] || ""); });
    setCurrentCode(code);
  };

  const cur = traceSteps[traceIdx];

  const LANG_COLORS = { js: "#f7df1e", python: "#7dd3fc", matlab: "#818cf8" };
  const langColor = LANG_COLORS[lang] || lc;

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#1a1a1a", fontFamily:"-apple-system,'SF Pro Text','Helvetica Neue',sans-serif", color:"#e8e8e8", overflow:"hidden" }}>

      {/* ═══ HEADER ═══ */}
      <div style={{ height:44, background:"#252525", borderBottom:"1px solid #333", display:"flex", alignItems:"center", padding:"0 16px", flexShrink:0, gap:12 }}>
        {onBack && (
          <button onClick={onBack} style={{ height:26, padding:"0 12px", borderRadius:5, background:"transparent", border:"1px solid #333", color:"#888", fontSize:11, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
            ← Labs
          </button>
        )}
        <div style={{ fontSize:13, fontWeight:600, color:"#b0b0b0", letterSpacing:0.2 }}>
          Matrix Lab — Linear Algebra
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
          {LESSONS.map((_, i) => (
            <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:completed.has(i)?LESSONS[i].color:"#3a3a3a", border:`1px solid ${completed.has(i)?LESSONS[i].color:"#555"}`, transition:"background .3s" }} />
          ))}
          <span style={{ fontSize:11, color:"#666", marginLeft:6 }}>{completed.size}/{LESSONS.length}</span>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* ═══ SIDEBAR ═══ */}
        <div style={{ width:192, background:"#1e1e1e", borderRight:"1px solid #2d2d2d", display:"flex", flexDirection:"column", flexShrink:0, overflow:"hidden" }}>
          <div style={{ padding:"12px 14px 8px", fontSize:10, fontWeight:600, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase" }}>Lessons</div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {LESSONS.map((l, i) => {
              const active = i === lessonIdx;
              const done = completed.has(i);
              return (
                <div key={i} onClick={() => switchLesson(i)} style={{ padding:"9px 14px", cursor:"pointer", background:active?"#2a2a2a":"transparent", borderLeft:`2px solid ${active?l.color:"transparent"}`, display:"flex", alignItems:"center", gap:10, transition:"background .12s" }}>
                  <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, background:done?l.color:"#2d2d2d", border:`1px solid ${done?l.color:active?l.color+"66":"#3a3a3a"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:done?"#000":active?l.color:"#555", transition:"all .2s" }}>
                    {done ? "✓" : i+1}
                  </div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:active?600:400, color:active?"#f0f0f0":"#888", lineHeight:1.2 }}>{l.shortTitle}</div>
                    <div style={{ fontSize:10, color:"#555", marginTop:1 }}>{l.tag}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* ── LEFT: Lesson panel ── */}
          <div style={{ width:340, background:"#1e1e1e", borderRight:"1px solid #2d2d2d", display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"16px 18px 14px", borderBottom:"1px solid #2d2d2d", flexShrink:0 }}>
              <div style={{ display:"inline-block", fontSize:10, fontWeight:600, letterSpacing:"0.08em", color:lc, background:lc+"18", border:`1px solid ${lc}30`, borderRadius:4, padding:"2px 8px", marginBottom:8 }}>
                {lesson.tag.toUpperCase()}
              </div>
              <div style={{ fontSize:18, fontWeight:700, color:"#f0f0f0", letterSpacing:-0.3, lineHeight:1.2 }}>{lesson.title}</div>
            </div>

            <div style={{ display:"flex", borderBottom:"1px solid #2d2d2d", flexShrink:0, background:"#1a1a1a" }}>
              {[["concept","Concept"],["pseudo","Pseudocode"],["code","Your Code"]].map(([id,label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ flex:1, padding:"9px 0", fontSize:11, fontWeight:tab===id?600:400, color:tab===id?lc:"#555", background:"transparent", border:"none", borderBottom:`2px solid ${tab===id?lc:"transparent"}`, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.2, transition:"color .12s" }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"16px 18px" }}>
              {tab === "concept" && lesson.concept.map((block, i) => (
                <div key={i} style={{ marginBottom:22 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:lc, letterSpacing:"0.06em", marginBottom:6, textTransform:"uppercase" }}>{block.head}</div>
                  <pre style={{ fontSize:12, color:"#b0b0b0", lineHeight:1.8, whiteSpace:"pre-wrap", margin:0, fontFamily:"-apple-system,'SF Pro Text',sans-serif" }}>{block.body}</pre>
                </div>
              ))}

              {tab === "pseudo" && (
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#555", letterSpacing:"0.08em", marginBottom:12, textTransform:"uppercase" }}>Algorithm — read this, then write the code</div>
                  <pre style={{ fontSize:12, color:"#c8c8c8", lineHeight:2, whiteSpace:"pre-wrap", margin:0, fontFamily:"'SF Mono',Menlo,monospace", background:"#161616", border:"1px solid #2d2d2d", borderRadius:8, padding:"16px" }}>{lesson.pseudo}</pre>
                  <div style={{ marginTop:14, padding:"10px 14px", background:lc+"0d", border:`1px solid ${lc}25`, borderRadius:6, fontSize:11, color:"#888", lineHeight:1.6 }}>
                    Each <span style={{ color:lc, fontFamily:"monospace" }}>___</span> in the code tab corresponds to a line or expression in this pseudocode. Match them up.
                  </div>
                </div>
              )}

              {tab === "code" && (
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#555", letterSpacing:"0.08em", marginBottom:12, textTransform:"uppercase" }}>
                    {lesson.isVector ? "Test vectors" : "Input matrix"}
                  </div>
                  {lesson.isVector ? (
                    <div style={{ fontSize:12, color:"#b0b0b0", fontFamily:"'SF Mono',Menlo,monospace", lineHeight:2 }}>
                      <div>v = [3, 4]</div>
                      <div>v = [1, 2, 2]</div>
                      <div>v = [0, 0] ← should return null</div>
                    </div>
                  ) : (
                    <MatrixInput
                      key={matrixInputKey}
                      matrix={customMatrix}
                      onChange={setCustomMatrix}
                      onReset={() => {
                        const d = (lesson.testMatrix || [[2,1,-1],[4,3,1],[-2,1,5]]).map(r=>[...r]);
                        setCustomMatrix(d);
                        setMatrixInputKey(k => k + 1);
                      }}
                    />
                  )}
                  <div style={{ marginTop:14, fontSize:11, color:"#555", lineHeight:1.6 }}>
                    {lesson.isVector
                      ? "Your function is tested against all three vectors above."
                      : [3,4,5,6].includes(lessonIdx)
                        ? <>Edit the matrix, then <span style={{ color:"#818cf8" }}>Step Through</span> to see the algorithm or <span style={{ color:"#4dcd6e" }}>Run</span> to check your code.</>
                        : "Your function will be tested with this matrix when you click Run."
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── CENTER: Editor ── */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#1a1a1a", overflow:"hidden" }}>
            {/* Toolbar */}
            <div style={{ height:42, background:"#252525", borderBottom:"1px solid #333", display:"flex", alignItems:"center", padding:"0 14px", gap:8, flexShrink:0 }}>
              <button onClick={handleRun} disabled={running} style={{ height:26, padding:"0 16px", borderRadius:5, background:isComplete?"#1f4a2a":"#1a3a5c", border:`1px solid ${isComplete?"#2d7a3e":"#2356a0"}`, color:isComplete?"#4dcd6e":langColor, fontSize:11, fontWeight:600, cursor:running?"default":"pointer", fontFamily:"inherit", letterSpacing:0.3, display:"flex", alignItems:"center", gap:6, opacity:running?0.6:1 }}>
                {running ? <span style={{ fontSize:10 }}>⟳</span> : <span style={{ fontSize:9 }}>▶</span>}
                {running ? "Running…" : "Run"}
              </button>

              <button onClick={() => setShowHint(h => !h)} style={{ height:26, padding:"0 12px", borderRadius:5, background:"transparent", border:"1px solid #333", color:showHint?lc:"#666", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                {showHint ? "Hide Hint" : "Hint"}
              </button>

              <button onClick={handleReveal} style={{ height:26, padding:"0 12px", borderRadius:5, background:"transparent", border:"1px solid #333", color:"#666", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
                Reveal
              </button>

              <button onClick={handleTrace} disabled={lessonIdx < 3} title={lessonIdx < 3 ? "Available from Lesson 4 onwards" : ""} style={{ height:26, padding:"0 12px", borderRadius:5, background:"transparent", border:"1px solid #3a3270", color:"#818cf8", fontSize:11, cursor:lessonIdx < 3 ? "default" : "pointer", fontFamily:"inherit", letterSpacing:0.2, opacity:lessonIdx < 3 ? 0.3 : 1 }}>
                Step Through
              </button>

              {isComplete && lang === "js" && (
                <span style={{ marginLeft:4, fontSize:11, color:"#4dcd6e", background:"#1f4a2a", border:"1px solid #2d7a3e", borderRadius:4, padding:"3px 10px" }}>All tests pass</span>
              )}

              {/* Language selector */}
              <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
                {[["js","JS"],["python","Python"],["matlab","MATLAB"]].map(([id,label]) => (
                  <button key={id} onClick={() => { setLang(id); setRunResult(null); }} style={{ height:22, padding:"0 8px", borderRadius:4, background:lang===id?"#2a2a2a":"transparent", border:`1px solid ${lang===id?LANG_COLORS[id]:"#333"}`, color:lang===id?LANG_COLORS[id]:"#555", fontSize:10, fontWeight:lang===id?700:400, cursor:"pointer", fontFamily:"inherit", letterSpacing:0.3 }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {showHint && (
              <div style={{ padding:"10px 16px", background:"#1f1a0a", borderBottom:"1px solid #3a2f00", fontSize:11, color:"#b8921a", lineHeight:1.6, flexShrink:0 }}>
                <span style={{ color:"#7a5c00", marginRight:6, fontWeight:600 }}>Hint</span>
                {currentBlanks.map((b, i) => (
                  <div key={i} style={{ fontFamily:"'SF Mono',Menlo,monospace", marginTop:3, color:"#c8a840" }}>
                    {b}: {currentSolutions[i]}
                  </div>
                ))}
              </div>
            )}

            <div style={{ flex:1, minHeight:0 }}>
              <Editor
                height="100%"
                language={lang === "js" ? "javascript" : lang === "python" ? "python" : "openmat"}
                value={currentCode}
                onChange={(v) => setCurrentCode(v ?? "")}
                theme="open-calc-dark"
                beforeMount={setupOpenCalcMonaco}
                onMount={(editor) => { editorRef.current = editor }}
                options={{
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", monospace',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  tabSize: 2,
                  wordWrap: "on",
                  renderWhitespace: "none",
                  overviewRulerLanes: 0,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* ── RIGHT: Results + Trace ── */}
          <div style={{ width:300, background:"#1e1e1e", borderLeft:"1px solid #2d2d2d", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 }}>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid #2d2d2d", flexShrink:0 }}>
              <div style={{ fontSize:10, fontWeight:600, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Test Results</div>

              {!runResult && !running && (
                <div style={{ fontSize:11, color:"#444", lineHeight:1.7 }}>
                  Fill in the <code style={{ color:lc, background:lc+"15", padding:"1px 5px", borderRadius:3 }}>___</code> blanks,
                  <br />then click Run.
                </div>
              )}

              {running && (
                <div style={{ fontSize:11, color:"#888", lineHeight:1.7 }}>
                  {lang === "python" ? "Loading Python runtime…" : "Running…"}
                </div>
              )}

              {runResult?.error && (
                <div style={{ background:"#2a1010", border:"1px solid #5a2020", borderRadius:6, padding:"10px 12px" }}>
                  <div style={{ color:"#e05050", fontSize:11, fontWeight:600, marginBottom:4 }}>Error</div>
                  <div style={{ color:"#c06060", fontSize:10, fontFamily:"'SF Mono',Menlo,monospace", lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>{runResult.error}</div>
                </div>
              )}

              {runResult?.testResult && (
                <div>
                  {runResult.testResult.checks.map((c, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8, fontSize:11 }}>
                      <div style={{ width:16, height:16, borderRadius:"50%", flexShrink:0, background:c.pass?"#1f4a2a":"#2a1010", border:`1px solid ${c.pass?"#2d7a3e":"#5a2020"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:c.pass?"#4dcd6e":"#e05050", marginTop:1 }}>
                        {c.pass ? "✓" : "✗"}
                      </div>
                      <span style={{ color:c.pass?"#b0b0b0":"#666", lineHeight:1.5 }}>{c.label}</span>
                    </div>
                  ))}

                  <div style={{ marginTop:10, padding:"10px 12px", borderRadius:6, background:runResult.testResult.ok?"#1a3a28":"#2a1010", border:`1px solid ${runResult.testResult.ok?"#2d5a3e":"#5a2020"}` }}>
                    <div style={{ fontSize:12, fontWeight:600, marginBottom:6, color:runResult.testResult.ok?"#4dcd6e":"#e05050" }}>
                      {runResult.testResult.ok ? "✓ All tests pass" : "✗ Tests failing"}
                    </div>
                    {runResult.testResult.result && !lesson.isVector && Array.isArray(runResult.testResult.result) && Array.isArray(runResult.testResult.result[0]) && (
                      <MatDisplay M={runResult.testResult.result} small />
                    )}
                    {runResult.testResult.result && lesson.isVector && Array.isArray(runResult.testResult.result) && (
                      <div style={{ fontSize:11, fontFamily:"'SF Mono',Menlo,monospace", color:"#a0a0a0" }}>
                        [{(runResult.testResult.result || []).map(v => typeof v === "number" ? fmtN(v) : v).join(", ")}]
                      </div>
                    )}
                    {typeof runResult.testResult.result === "number" && (
                      <div style={{ fontSize:16, fontWeight:700, color:lc, fontFamily:"'SF Mono',Menlo,monospace" }}>
                        {fmtN(runResult.testResult.result)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Execution trace */}
            {traceSteps.length > 0 ? (
              <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"10px 16px", borderBottom:"1px solid #2d2d2d", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
                  <div style={{ fontSize:10, fontWeight:600, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase" }}>Execution Trace</div>
                  <span style={{ fontSize:11, color:"#555" }}>{traceIdx+1} / {traceSteps.length}</span>
                </div>

                <div style={{ padding:"10px 16px", borderBottom:"1px solid #2d2d2d", display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                  {[["«",()=>setTraceIdx(0)],["‹",()=>setTraceIdx(i=>Math.max(0,i-1))],["›",()=>setTraceIdx(i=>Math.min(traceSteps.length-1,i+1))],["»",()=>setTraceIdx(traceSteps.length-1)]].map(([label,action],i) => (
                    <button key={i} onClick={action} style={{ width:28, height:26, borderRadius:5, background:"#252525", border:"1px solid #333", color:"#888", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>{label}</button>
                  ))}
                  <input type="range" min={0} max={traceSteps.length-1} value={traceIdx} onChange={(e)=>setTraceIdx(+e.target.value)} style={{ flex:1, accentColor:lc }} />
                </div>

                {cur && (
                  <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
                    <div style={{ background:"#161616", border:`1px solid ${lc}22`, borderLeft:`3px solid ${lc}`, borderRadius:"0 6px 6px 0", padding:"10px 12px", marginBottom:12 }}>
                      <div style={{ fontSize:11, color:"#888", lineHeight:1.6, marginBottom:6 }}>{cur.note}</div>
                      {cur.code && <div style={{ fontFamily:"'SF Mono',Menlo,monospace", fontSize:11, color:lc }}>{cur.code}</div>}
                    </div>
                    <div style={{ fontSize:10, color:"#555", marginBottom:8, letterSpacing:"0.06em", textTransform:"uppercase" }}>Matrix after this step</div>
                    <MatDisplay M={cur.matrix} small augAt={lessonIdx === 6 ? customMatrix.length : cur.augAt} />
                  </div>
                )}
              </div>
            ) : isComplete ? (
              <div style={{ padding:"16px", flex:1, overflowY:"auto" }}>
                <div style={{ fontSize:10, fontWeight:600, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Reference Answer</div>
                {runResult?.testResult?.expected && (
                  Array.isArray(runResult.testResult.expected) && Array.isArray(runResult.testResult.expected[0]) ? (
                    <MatDisplay M={runResult.testResult.expected} small />
                  ) : Array.isArray(runResult.testResult.expected) ? (
                    <div style={{ fontSize:11, fontFamily:"'SF Mono',Menlo,monospace", color:"#a0a0a0" }}>
                      [{runResult.testResult.expected.map(v => fmtN(v)).join(", ")}]
                    </div>
                  ) : typeof runResult.testResult.expected === "number" ? (
                    <div style={{ fontSize:18, fontWeight:700, color:lc, fontFamily:"'SF Mono',Menlo,monospace" }}>
                      {fmtN(runResult.testResult.expected)}
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:28, marginBottom:10, opacity:0.2 }}>⌥</div>
                  <div style={{ fontSize:11, color:"#444", lineHeight:1.7 }}>Complete the exercise<br />to see the execution trace</div>
                </div>
              </div>
            )}

            {/* ── Visualizer ── */}
            <div style={{ borderTop:"1px solid #2d2d2d", flexShrink:0 }}>
              <button onClick={() => setShowViz(v => !v)} style={{ width:"100%", padding:"9px 16px", background:"transparent", border:"none", borderBottom:showViz?"1px solid #2d2d2d":"none", color:"#555", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.08em", textTransform:"uppercase", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                Visualize Matrix
                <span style={{ fontSize:12, color:"#444" }}>{showViz ? "▲" : "▼"}</span>
              </button>
              {showViz && !lesson.isVector && (
                <div style={{ padding:"12px", overflowY:"auto", maxHeight:420 }}>
                  <MatrixVisualizer matrix={customMatrix} color={lc} lessonId={lessonIdx} />
                  {customMatrix.length === 2 && (
                    <div style={{ marginTop:12 }}>
                      <EigenExplorer matrix={customMatrix} color={lc} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
