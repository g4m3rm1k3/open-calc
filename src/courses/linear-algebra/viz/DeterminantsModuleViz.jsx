import React, { useState } from 'react';

// ─── math helpers ─────────────────────────────────────────────────────────────

function r4(x) { return Math.round(x * 1e4) / 1e4; }
function fmt(v) {
  if (v === 0) return '0';
  if (Math.abs(v) < 0.001) return v.toExponential(2);
  if (Number.isInteger(v)) return String(v);
  for (let d = 2; d <= 16; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-6) return `${n}/${d}`;
  }
  return v.toFixed(3);
}
function cloneM(m) { return m.map(r => [...r]); }

// ─── determinant by cofactor expansion ───────────────────────────────────────

function detVal(m) {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return r4(m[0][0] * m[1][1] - m[0][1] * m[1][0]);
  let d = 0;
  for (let j = 0; j < n; j++) {
    const sub = m.slice(1).map(row => row.filter((_, c) => c !== j));
    d += m[0][j] * Math.pow(-1, j) * detVal(sub);
  }
  return r4(d);
}

function cofactorSteps(m, expandRow = 0) {
  const n = m.length;
  const steps = [];
  steps.push({
    desc: `Expand along row ${expandRow + 1}`,
    detail: `Pick the row (or column) with the most zeros. Expanding along row ${expandRow + 1}: det = Σ a[${expandRow + 1},j] × C[${expandRow + 1},j]`,
    phase: 'setup',
  });

  const signs = m[expandRow].map((_, j) => Math.pow(-1, expandRow + j));
  const subDets = m[expandRow].map((_, j) => {
    const sub = m.filter((_, r) => r !== expandRow).map(row => row.filter((_, c) => c !== j));
    return { sub, val: r4(detVal(sub)) };
  });

  m[expandRow].forEach((aij, j) => {
    if (Math.abs(aij) < 1e-9) {
      steps.push({
        desc: `j=${j + 1}: a[${expandRow + 1},${j + 1}] = 0 → skip (contributes 0)`,
        detail: `No calculation needed — zero entry skips its cofactor.`,
        phase: 'minor', col: j, skip: true,
      });
      return;
    }
    const sign = signs[j];
    const { sub, val } = subDets[j];
    const cofactor = r4(sign * val);
    steps.push({
      desc: `Minor M[${expandRow + 1},${j + 1}]: delete row ${expandRow + 1}, col ${j + 1}`,
      detail: `Submatrix:\n${sub.map(row => '  [' + row.map(fmt).join('  ') + ']').join('\n')}\ndet = ${fmt(val)}`,
      phase: 'minor', col: j, sub, subDet: val, sign, aij, cofactor,
    });
    steps.push({
      desc: `Cofactor C[${expandRow + 1},${j + 1}] = (−1)^(${expandRow + 1 + j + 1}) × ${fmt(val)} = ${fmt(cofactor)}`,
      detail: `Sign pattern: (−1)^(row+col) = (−1)^${expandRow + j + 2} = ${sign > 0 ? '+' : '−'}1\nContribution: ${fmt(aij)} × ${fmt(cofactor)} = ${fmt(r4(aij * cofactor))}`,
      phase: 'cofactor', col: j, contribution: r4(aij * cofactor),
    });
  });

  const total = r4(m[expandRow].reduce((s, aij, j) => s + aij * signs[j] * subDets[j].val, 0));
  const contributions = m[expandRow].map((aij, j) => r4(aij * signs[j] * subDets[j].val));
  steps.push({
    desc: `det = ${contributions.filter(x => Math.abs(x) > 1e-9).map(fmt).join(' + ')} = ${fmt(total)}`,
    detail: `Sum all contributions. det = ${fmt(total)}`,
    phase: 'result', result: total,
  });

  return steps;
}

// ─── Cramer's Rule steps ──────────────────────────────────────────────────────

function cramerSteps(A, b) {
  const n = A.length;
  const dA = detVal(A);
  const steps = [];

  steps.push({
    desc: 'Compute det(A)',
    detail: `det(A) = ${fmt(dA)}${Math.abs(dA) < 1e-9 ? '\n⚠ det = 0 → A is singular → Cramer\'s Rule does not apply' : '\ndet ≠ 0 → A is invertible → unique solution exists'}`,
    dA, phase: 'detA',
  });

  if (Math.abs(dA) < 1e-9) return steps;

  const solutions = [];
  for (let i = 0; i < n; i++) {
    const Ai = cloneM(A);
    Ai.forEach((row, r) => { row[i] = b[r]; });
    const dAi = detVal(Ai);
    const xi = r4(dAi / dA);
    solutions.push(xi);
    steps.push({
      desc: `Form A${i + 1}: replace column ${i + 1} with b`,
      detail: `A${i + 1} has column ${i + 1} replaced by b = [${b.map(fmt).join(', ')}]\ndet(A${i + 1}) = ${fmt(dAi)}\nx${i + 1} = det(A${i + 1}) / det(A) = ${fmt(dAi)} / ${fmt(dA)} = ${fmt(xi)}`,
      phase: 'column', colIdx: i, Ai, dAi, xi,
    });
  }

  steps.push({
    desc: `Solution: [${solutions.map((x, i) => `x${i + 1}=${fmt(x)}`).join(', ')}]`,
    detail: `Verify: substitute back into original equations.`,
    phase: 'solution', solutions,
  });

  return steps;
}

// ─── presets ──────────────────────────────────────────────────────────────────

const DET_PRESETS = [
  { label: '2×2', m: [[3, 2], [1, 4]], context: 'det = ad − bc. Direct formula for 2×2.' },
  { label: '3×3 (zeros)', m: [[2, 1, 3], [0, 4, 1], [0, 2, 3]], context: 'Expand along column 1 — two zeros skip their minors, saving work.' },
  { label: '3×3 general', m: [[1, 2, 3], [2, 5, 4], [3, 5, 6]], context: 'Full 3×3 cofactor expansion. No shortcuts.' },
  { label: 'Singular', m: [[1, 2, 3], [2, 4, 6], [1, 1, 1]], context: 'Row 2 = 2×row 1 → det = 0. Singular matrix — not invertible.' },
];

const CRAMER_PRESETS = [
  {
    label: '2×2 system', A: [[2, 1], [5, 3]], b: [5, 13],
    context: 'Two equations, two unknowns. Cramer\'s Rule is efficient at this size.',
  },
  {
    label: 'CNC 2-axis', A: [[4, 3], [2, -1]], b: [18, 4],
    context: 'Two encoder readings. Find (x, y) tool position using Cramer\'s Rule.',
  },
  {
    label: '3×3 system', A: [[1, 1, 1], [2, -1, 3], [-1, 2, -1]], b: [6, 11, -1],
    context: '3×3 system. Each variable requires one det(Aᵢ).',
  },
];

// ─── practice ─────────────────────────────────────────────────────────────────

const PRACTICE = [
  {
    context: 'Determinant — 2×2',
    q: 'Compute det(A) using the formula. Is A invertible?',
    data: 'A = [ 4  7 ]\n    [ 2  6 ]',
    hint: 'det = ad − bc. If det ≠ 0, invertible.',
    answer: `det(A) = (4)(6) − (7)(2) = 24 − 14 = 10

det ≠ 0 → A IS invertible.

Bonus: A⁻¹ = (1/10)[ 6  −7 ] = [ 0.6  −0.7 ]
                    [−2   4 ]   [−0.2   0.4 ]`,
  },
  {
    context: 'Cofactor expansion — 3×3',
    q: 'Compute det(B) by expanding along row 1. Show all three minors.',
    data: 'B = [ 2   0   1 ]\n    [ 3   1  −2 ]\n    [−1   2   4 ]',
    hint: 'C[1,j] = (−1)^(1+j) × M[1,j]. The zero in position [1,2] means its minor contributes nothing.',
    answer: `Expand along row 1: a₁₁=2, a₁₂=0, a₁₃=1

M[1,1]: delete row1, col1 → [ 1  −2 ]
                              [ 2   4 ]
det = (1)(4)−(−2)(2) = 4+4 = 8
C[1,1] = (+1)(8) = 8

M[1,2]: a₁₂ = 0 → contribution = 0 × anything = 0  (skip)

M[1,3]: delete row1, col3 → [ 3   1 ]
                              [−1   2 ]
det = (3)(2)−(1)(−1) = 6+1 = 7
C[1,3] = (+1)(7) = 7

det(B) = 2(8) + 0 + 1(7) = 16 + 0 + 7 = 23`,
  },
  {
    context: 'Invertibility',
    q: 'Without computing the full determinant, explain why this matrix is singular.',
    data: 'C = [ 1   3   5 ]\n    [ 2   6  10 ]\n    [−1  −3  −5 ]',
    hint: 'Look at the rows relative to each other.',
    answer: `Row 2 = 2 × Row 1.
Row 3 = −1 × Row 1.

When one row is a scalar multiple of another, the determinant
is zero (swapping identical rows should change the sign, but
identical rows mean the determinant equals its own negative
→ must be zero).

det(C) = 0 → C is SINGULAR → not invertible.

The rows are linearly dependent — they all lie in the same
1D subspace. The matrix maps all of ℝ³ onto a line.`,
  },
  {
    context: "Cramer's Rule — 2×2",
    q: 'Solve using Cramer\'s Rule. Show det(A), det(A₁), det(A₂), and the solution.',
    data: '3x −  y = 7\n x + 2y = 4',
    hint: 'A₁ = replace col 1 with b. A₂ = replace col 2 with b. xᵢ = det(Aᵢ)/det(A).',
    answer: `A = [ 3  −1 ]    b = [ 7 ]
    [ 1   2 ]        [ 4 ]

det(A) = (3)(2)−(−1)(1) = 6+1 = 7

A₁ = [ 7  −1 ]  (col 1 replaced by b)
     [ 4   2 ]
det(A₁) = (7)(2)−(−1)(4) = 14+4 = 18

A₂ = [ 3   7 ]  (col 2 replaced by b)
     [ 1   4 ]
det(A₂) = (3)(4)−(7)(1) = 12−7 = 5

x = det(A₁)/det(A) = 18/7
y = det(A₂)/det(A) = 5/7

Solution: x = 18/7 ≈ 2.571,  y = 5/7 ≈ 0.714

Check: 3(18/7)−5/7 = 54/7−5/7 = 49/7 = 7 ✓
       18/7+2(5/7) = 18/7+10/7 = 28/7 = 4 ✓`,
  },
  {
    context: "Cramer's Rule — area application",
    q: 'A parallelogram sheet metal blank is defined by vectors u = [5, 2]ᵀ and v = [1, 4]ᵀ cm. Find the area. If material costs $3.50/cm², what is the blank cost?',
    hint: 'Form the 2×2 matrix with u and v as columns. det = area of parallelogram.',
    answer: `Matrix A = [u | v] = [ 5   1 ]
                     [ 2   4 ]

det(A) = (5)(4) − (1)(2) = 20 − 2 = 18

Area = |det(A)| = 18 cm²

Cost = 18 cm² × $3.50/cm² = $63.00

Note: the absolute value is needed because det can be
negative (if the vectors are arranged clockwise). Area is
always positive.`,
  },
];

// ─── sub-components ──────────────────────────────────────────────────────────

function MatrixGrid({ data, highlightCol = -1, highlightRow = -1, replacedCol = -1, bVals = null }) {
  return (
    <table className="font-mono text-sm border-collapse mx-auto">
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td className="pr-1 text-slate-400 text-xs select-none">[</td>
            {row.map((v, j) => {
              const isReplaced = j === replacedCol;
              const isHl = j === highlightCol || i === highlightRow;
              return (
                <td key={j} className={`px-2 py-1 text-center min-w-[36px]
                  ${isReplaced ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold' :
                    isHl ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' :
                    v === 0 ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {isReplaced && bVals ? fmt(bVals[i]) : fmt(v)}
                </td>
              );
            })}
            <td className="pl-1 text-slate-400 text-xs select-none">]</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProgressDots({ total, current, onJump }) {
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => onJump(i)}
          className={`h-1.5 flex-1 rounded-full transition-colors ${i === current ? 'bg-violet-500' : i < current ? 'bg-violet-300 dark:bg-violet-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
      ))}
    </div>
  );
}

function PracticeCard({ item, index }) {
  const [shown, setShown] = useState(false);
  const [hint, setHint] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">{item.context}</span>
        <span className="text-xs text-slate-400">Problem {index + 1}</span>
      </div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">{item.q}</p>
      {item.data && <pre className="text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded p-2 mb-3 text-slate-700 dark:text-slate-300">{item.data}</pre>}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setHint(h => !h)} className="text-xs px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">{hint ? 'Hide hint' : 'Hint'}</button>
        <button onClick={() => setShown(s => !s)} className="text-xs px-3 py-1.5 rounded border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40">{shown ? 'Hide answer' : 'Show answer'}</button>
      </div>
      {hint && <p className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded p-2">💡 {item.hint}</p>}
      {shown && <pre className="mt-3 text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">{item.answer}</pre>}
    </div>
  );
}

// ─── panes ────────────────────────────────────────────────────────────────────

function ConceptPane() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Why this exists</p>
        <p>The determinant is a single number that encodes whether a matrix is invertible and how much it scales volumes. It's used to check solvability, compute areas and volumes directly, and derive explicit solution formulas (Cramer's Rule). In graphics, det tells you how much a transform scales areas — and whether it flips orientation.</p>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">2×2 determinant</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 mt-1">
          <div>det([a b; c d]) = ad − bc</div>
          <div className="text-slate-400 mt-1">Main diagonal product minus off-diagonal product</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">3×3 cofactor expansion</p>
        <p className="mb-2 text-xs">Pick any row or column. Expand: det = Σ aᵢⱼ × Cᵢⱼ where Cᵢⱼ = (−1)^(i+j) × Mᵢⱼ.</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
          <div className="text-slate-400">Sign pattern (checkerboard):</div>
          <div className="text-green-600 dark:text-green-400">+ − +</div>
          <div className="text-green-600 dark:text-green-400">− + −</div>
          <div className="text-green-600 dark:text-green-400">+ − +</div>
          <div className="text-slate-400 mt-1">Minor Mᵢⱼ = det of matrix with row i, col j deleted</div>
          <div>Pick the row/col with most zeros to minimize work</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Key determinant properties</p>
        <div className="space-y-1 text-xs">
          {[
            { rule: 'Row swap', effect: 'det → −det (sign flips)' },
            { rule: 'Scale row by k', effect: 'det → k × det' },
            { rule: 'Row replacement', effect: 'det unchanged (this is why elimination works)' },
            { rule: 'Triangular matrix', effect: 'det = product of diagonal entries' },
            { rule: 'Repeated/proportional rows', effect: 'det = 0 → singular' },
            { rule: 'det(AB)', effect: '= det(A) × det(B)' },
            { rule: 'det(Aᵀ)', effect: '= det(A)' },
          ].map(r => (
            <div key={r.rule} className="flex gap-2 bg-slate-50 dark:bg-slate-900 rounded p-2">
              <span className="font-mono text-violet-600 dark:text-violet-400 w-40 shrink-0">{r.rule}</span>
              <span>{r.effect}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">The invertibility theorem</p>
        <p className="text-xs">All of these are equivalent — if one is true, all are true:</p>
        <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
          {[
            'A is invertible', 'det(A) ≠ 0', 'Ax=b has unique solution ∀b', 'Ax=0 has only x=0',
            'RREF of A = I', 'A has n pivot positions', 'Columns are linearly independent', 'Rows are linearly independent',
          ].map(s => (
            <div key={s} className="bg-green-50 dark:bg-green-950/30 rounded px-2 py-1 text-green-700 dark:text-green-400">{s}</div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Cramer's Rule</p>
        <p className="mb-2 text-xs">For invertible A (n×n), the solution to Ax = b is: xᵢ = det(Aᵢ) / det(A), where Aᵢ = A with column i replaced by b.</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3">
          <div>x₁ = det(A₁)/det(A),  x₂ = det(A₂)/det(A),  ...</div>
          <div className="text-slate-400 mt-1">Best for 2×2 and 3×3. For large systems, row reduction is faster.</div>
        </div>
      </div>
    </div>
  );
}

function DeterminantPane() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const [expandRow, setExpandRow] = useState(0);
  const preset = DET_PRESETS[pi];
  const steps = cofactorSteps(preset.m, expandRow % preset.m.length);
  const cur = steps[si];
  const n = preset.m.length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {DET_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); setExpandRow(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>{p.label}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>
      {n === 3 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Expand along row:</span>
          {[0, 1, 2].map(r => (
            <button key={r} onClick={() => { setExpandRow(r); setSi(0); }}
              className={`px-2 py-0.5 rounded ${expandRow % n === r ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300' : 'bg-slate-100 dark:bg-slate-800'}`}>
              R{r + 1}
            </button>
          ))}
          <span className="text-slate-400">(pick the row with most zeros)</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <p className="text-xs text-center text-slate-400 mb-2">Matrix A</p>
        <MatrixGrid data={preset.m} highlightRow={cur.phase === 'minor' || cur.phase === 'cofactor' ? expandRow % n : -1} highlightCol={cur.col !== undefined ? cur.col : -1} />
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[100px]">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{cur.desc}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap">{cur.detail}</p>
        {cur.sub && (
          <div className="mt-2">
            <p className="text-xs text-slate-400 mb-1">Submatrix (minor):</p>
            <MatrixGrid data={cur.sub} />
          </div>
        )}
        {'result' in cur && (
          <div className={`mt-2 font-semibold font-mono ${Math.abs(cur.result) < 1e-6 ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
            det(A) = {fmt(cur.result)} {Math.abs(cur.result) < 1e-6 ? '→ SINGULAR' : '→ invertible'}
          </div>
        )}
        {'contribution' in cur && (
          <div className="mt-1 text-xs text-teal-600 dark:text-teal-400 font-mono">Running contribution: {fmt(cur.contribution)}</div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

function CramerPane() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = CRAMER_PRESETS[pi];
  const steps = cramerSteps(preset.A, preset.b);
  const cur = steps[si];
  const n = preset.A.length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {CRAMER_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>{p.label}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <p className="text-xs font-semibold text-center text-slate-500 mb-2">Matrix A</p>
          <MatrixGrid data={preset.A} highlightCol={cur.colIdx !== undefined ? cur.colIdx : -1} />
        </div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <p className="text-xs font-semibold text-center text-slate-500 mb-2">b vector</p>
          <MatrixGrid data={preset.b.map(x => [x])} />
        </div>
      </div>

      {cur.Ai && (
        <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-3">
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2">A{cur.colIdx + 1} — column {cur.colIdx + 1} replaced by b</p>
          <MatrixGrid data={cur.Ai} replacedCol={cur.colIdx} bVals={preset.b} />
          <p className="text-xs text-center text-teal-600 dark:text-teal-400 mt-2 font-mono">det(A{cur.colIdx + 1}) = {fmt(cur.dAi)}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[80px]">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{cur.desc}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap">{cur.detail}</p>
        {cur.solutions && (
          <div className="mt-2 flex gap-3 flex-wrap">
            {cur.solutions.map((x, i) => (
              <span key={i} className="font-mono text-sm font-semibold text-green-700 dark:text-green-400">x{i + 1} = {fmt(x)}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

function RealWorldPane() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Determinant = area or volume scaling</p>
        <p>When a linear transformation T is applied to a shape, |det(T)| tells you exactly how much the area (2D) or volume (3D) scales. A det = 0 means the transformation collapses the space to a lower dimension — a 3D shape becomes flat, a 2D shape becomes a line.</p>
      </div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Sheet metal blanking — area from det</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
          <div className="text-slate-400">Parallelogram blank defined by edge vectors:</div>
          <div>u = [5, 2]ᵀ cm,  v = [1, 4]ᵀ cm</div>
          <div>A = [u | v] = [5 1; 2 4]</div>
          <div className="text-blue-600 dark:text-blue-400">area = |det(A)| = |5×4 − 1×2| = |18| = 18 cm²</div>
          <div className="text-slate-400">3D: volume of parallelepiped = |det([u v w])|</div>
        </div>
      </div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Graphics — orientation and area</p>
        <p className="mb-2">In 3D rendering, det of the rotation/scale matrix tells you the area scaling factor AND the orientation. If det is negative, the transform flipped the coordinate handedness — normals point inward instead of outward, which breaks backface culling.</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'det > 0', color: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400', desc: 'Preserves orientation. Normal vectors correct.' },
            { label: 'det < 0', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400', desc: 'Flipped orientation. Normals inverted — need to flip.' },
            { label: 'det = 0', color: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400', desc: 'Collapsed to lower dimension. Degenerate shape.' },
          ].map(c => <div key={c.label} className={`rounded p-2 ${c.color}`}><p className="font-semibold mb-0.5">{c.label}</p><p>{c.desc}</p></div>)}
        </div>
      </div>
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">MATLAB reference</p>
        <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded p-3 overflow-x-auto">{`A = [2 1 3; 0 4 1; 0 2 3];
b = [5; 13; 4];

d = det(A)              % determinant

% Cramer's Rule manually:
A1 = A; A1(:,1) = b;    % replace column 1
A2 = A; A2(:,2) = b;    % replace column 2
A3 = A; A3(:,3) = b;    % replace column 3

x1 = det(A1) / det(A)
x2 = det(A2) / det(A)
x3 = det(A3) / det(A)

% Or just:
x = A \\ b

% Area of parallelogram spanned by two 2D vectors:
u = [5; 2]; v = [1; 4];
area = abs(det([u v]))`}</pre>
      </div>
    </div>
  );
}

const TABS = ['Concept', 'Determinants', "Cramer's Rule", 'Real world', 'Practice'];

export default function DeterminantsModule() {
  const [tab, setTab] = useState(0);
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Module 4 — Determinants &amp; Cramer's Rule</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Concept · Cofactor stepper · Cramer's stepper · Real world · Practice</p>
      </div>
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors min-w-[70px]
              ${tab === i ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <ConceptPane />}
      {tab === 1 && <DeterminantPane />}
      {tab === 2 && <CramerPane />}
      {tab === 3 && <RealWorldPane />}
      {tab === 4 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">Work each problem by hand before revealing.</p>
          {PRACTICE.map((item, i) => <PracticeCard key={i} item={item} index={i} />)}
        </div>
      )}
    </div>
  );
}
