import React, { useState, useRef, useEffect } from 'react';

// ─── math helpers ─────────────────────────────────────────────────────────────

function round4(x) { return Math.round(x * 1e4) / 1e4; }
function fmt(v) {
  if (v === 0) return '0';
  if (Math.abs(v) < 0.001) return v.toExponential(1);
  if (Number.isInteger(v)) return String(v);
  for (let d = 2; d <= 12; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-6) return `${n}/${d}`;
  }
  return v.toFixed(2);
}

function mul(A, B) {
  const m = A.length, n = B[0].length, k = B.length;
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      round4(A[i].reduce((s, _, p) => s + A[i][p] * B[p][j], 0))
    )
  );
}
function det2(A) { return A[0][0] * A[1][1] - A[0][1] * A[1][0]; }
function inv2(A) {
  const d = det2(A);
  if (Math.abs(d) < 1e-9) return null;
  return [[round4(A[1][1] / d), round4(-A[0][1] / d)], [round4(-A[1][0] / d), round4(A[0][0] / d)]];
}

// ─── multiplication steps ────────────────────────────────────────────────────

function mulSteps(A, B) {
  const m = A.length, n = B[0].length, k = B.length;
  const steps = [];
  const C = Array.from({ length: m }, () => Array(n).fill(null));
  steps.push({ C: C.map(r => [...r]), activeI: -1, activeJ: -1, desc: 'A is ' + m + '×' + k + ', B is ' + k + '×' + n + ' → AB will be ' + m + '×' + n, terms: '' });
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const terms = A[i].map((a, p) => `(${fmt(a)})(${fmt(B[p][j])})=${fmt(round4(a * B[p][j]))}`)
        .join(' + ');
      const val = round4(A[i].reduce((s, _, p) => s + A[i][p] * B[p][j], 0));
      C[i][j] = val;
      steps.push({
        C: C.map(r => [...r]),
        activeI: i, activeJ: j,
        desc: `C[${i + 1},${j + 1}] = row ${i + 1} of A · col ${j + 1} of B`,
        terms,
        val,
      });
    }
  }
  return steps;
}

// ─── inverse steps ────────────────────────────────────────────────────────────

function cloneM(m) { return m.map(r => [...r]); }

function invSteps(A) {
  const n = A.length;
  const steps = [];
  const aug = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => i === j ? 1 : 0)]);
  steps.push({ aug: cloneM(aug), desc: 'Set up [A | I]', pivotRow: -1, elimRow: -1, op: 'We will row-reduce until the left side becomes I. Whatever ends up on the right is A⁻¹.' });

  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(aug[r][col]) > Math.abs(aug[piv][col])) piv = r;
    if (piv !== col) {
      [aug[col], aug[piv]] = [aug[piv], aug[col]];
      steps.push({ aug: cloneM(aug), desc: `R${col + 1} ↔ R${piv + 1}`, pivotRow: col, elimRow: piv, op: 'Swap to bring the largest value to the pivot position.' });
    }
    if (Math.abs(aug[col][col]) < 1e-9) continue;
    const sc = aug[col][col];
    aug[col] = aug[col].map(v => round4(v / sc));
    steps.push({ aug: cloneM(aug), desc: `R${col + 1} → (1/${fmt(sc)}) R${col + 1}`, pivotRow: col, elimRow: -1, op: `Divide row ${col + 1} by ${fmt(sc)} to make the pivot = 1.` });
    for (let r = 0; r < n; r++) {
      if (r === col || Math.abs(aug[r][col]) < 1e-9) continue;
      const f = aug[r][col];
      aug[r] = aug[r].map((v, c) => round4(v - f * aug[col][c]));
      steps.push({ aug: cloneM(aug), desc: `R${r + 1} → R${r + 1} − (${fmt(f)}) R${col + 1}`, pivotRow: col, elimRow: r, op: `Eliminate the ${fmt(f)} above/below the pivot in column ${col + 1}.` });
    }
  }
  const Ainv = aug.map(row => row.slice(n));
  steps.push({ aug: cloneM(aug), desc: 'RREF reached — right half is A⁻¹', pivotRow: -1, elimRow: -1, op: 'Left side = I. Right side = A⁻¹. Done.', done: true, Ainv });
  return steps;
}

// ─── LU steps ────────────────────────────────────────────────────────────────

function luSteps(A) {
  const n = A.length;
  const U = cloneM(A);
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
  const steps = [{ U: cloneM(U), L: cloneM(L), desc: 'Start: U = A, L = I', op: 'We eliminate below each pivot in U. Each multiplier goes into L.' }];

  for (let col = 0; col < n - 1; col++) {
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(U[r][col]) < 1e-9) continue;
      const m = round4(U[r][col] / U[col][col]);
      L[r][col] = m;
      for (let c = col; c < n; c++) U[r][c] = round4(U[r][c] - m * U[col][c]);
      steps.push({
        U: cloneM(U), L: cloneM(L),
        desc: `m${r + 1}${col + 1} = ${fmt(m)};  R${r + 1} → R${r + 1} − ${fmt(m)}·R${col + 1}`,
        op: `Multiplier ${fmt(m)} goes into L[${r + 1},${col + 1}]. This zeroes out U[${r + 1},${col + 1}].`,
        pivotCol: col, elimRow: r,
      });
    }
  }
  steps.push({ U: cloneM(U), L: cloneM(L), desc: 'LU decomposition complete', op: 'Verify: multiply L × U — you should get the original A.', done: true });
  return steps;
}

// ─── PRESETS ──────────────────────────────────────────────────────────────────

const MUL_PRESETS = [
  {
    label: '2×3 × 3×2',
    A: [[1, 2, 3], [4, 5, 6]],
    B: [[7, 8], [9, 10], [11, 12]],
    context: 'Different-shaped matrices. Result is 2×2. Note: BA would be 3×3, completely different.',
  },
  {
    label: 'Square 2×2',
    A: [[1, 2], [3, 4]],
    B: [[5, 6], [7, 8]],
    context: 'Square matrices. Check that AB ≠ BA after stepping through both.',
  },
  {
    label: 'Graphics transform',
    A: [[2, 0], [0, 2]],
    B: [[0, -1], [1, 0]],
    context: 'S × R: scale-by-2 matrix times 90° rotation. The combined matrix transforms vertices in one pass.',
  },
];

const INV_PRESETS = [
  { label: '2×2 example', A: [[3, 1], [5, 2]], context: 'det = 3×2−1×5 = 1. Integer inverse.' },
  { label: '3×3 example', A: [[1, 2, 1], [2, 5, 3], [-1, -1, 2]], context: 'Full 3×3 inverse via row reduction.' },
  { label: 'Singular', A: [[2, 4], [1, 2]], context: 'det = 2×2−4×1 = 0. No inverse — watch what happens.' },
];

const LU_PRESETS = [
  { label: 'Example 1', A: [[2, 4, -2], [4, 9, -3], [-2, -3, 7]], context: 'Multipliers stay nice. Verify L×U = A.' },
  { label: 'Example 2', A: [[1, 2, 1], [2, 5, 3], [-1, -1, 2]], context: 'Same matrix as the 3×3 inverse example — compare methods.' },
];

// ─── sub-components ──────────────────────────────────────────────────────────

function MatrixGrid({ data, highlight, highlightColor = 'bg-blue-50 dark:bg-blue-950/40', nullChar = '·' }) {
  if (!data) return null;
  return (
    <table className="font-mono text-sm border-collapse mx-auto">
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td className="pr-1 text-slate-400 text-xs select-none">[</td>
            {row.map((v, j) => {
              const isHl = highlight && highlight(i, j);
              return (
                <td key={j} className={`px-2 py-1 text-center min-w-[40px] ${isHl ? highlightColor : ''} ${v === null ? 'text-slate-300 dark:text-slate-600' : v === 0 ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {v === null ? nullChar : fmt(v)}
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

function AugGrid({ aug, n, pivotRow, elimRow }) {
  return (
    <table className="font-mono text-sm border-collapse mx-auto">
      <tbody>
        {aug.map((row, i) => {
          const bg = i === pivotRow ? 'bg-blue-50 dark:bg-blue-950/40' : i === elimRow ? 'bg-red-50 dark:bg-red-950/40' : '';
          return (
            <tr key={i} className={bg}>
              <td className="pr-1 text-slate-400 text-xs select-none">[</td>
              {row.map((v, j) => (
                <td key={j} className={`px-2 py-1 text-center min-w-[40px]
                  ${j === n - 1 ? 'border-r-2 border-slate-300 dark:border-slate-600' : ''}
                  ${i === pivotRow ? 'text-blue-700 dark:text-blue-300 font-semibold' : i === elimRow ? 'text-red-600 dark:text-red-400' : v === 0 ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {fmt(v)}
                </td>
              ))}
              <td className="pl-1 text-slate-400 text-xs select-none">]</td>
            </tr>
          );
        })}
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
      {item.data && <pre className="text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded p-2 mb-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{item.data}</pre>}
      <div className="flex gap-2 flex-wrap">
        {item.hint && <button onClick={() => setHint(h => !h)} className="text-xs px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">{hint ? 'Hide hint' : 'Hint'}</button>}
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
        <p>Matrix multiplication describes every transformation in 3D graphics, every state transition in a simulation, every coordinate change in robotics. The inverse is how you undo a transformation. LU decomposition is how you solve the same system efficiently for hundreds of different inputs.</p>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Matrix multiplication</p>
        <p className="mb-2">For A (m×n) × B (n×p): inner dimensions must match; result is m×p. Entry C[i,j] = dot product of row i of A with column j of B.</p>
        <div className="rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-2 text-xs text-red-700 dark:text-red-400 mb-2">
          ⚠ AB ≠ BA in general. Matrix multiplication is NOT commutative. This is one of the biggest traps.
        </div>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
          <div className="text-slate-400">C[i,j] = Σ A[i,k] × B[k,j]  (sum over k)</div>
          <div>A (2×3) × B (3×2) = C (2×2)</div>
          <div className="text-slate-400">inner dims must match ↑</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">The inverse A⁻¹</p>
        <p className="mb-2">A is <span className="font-semibold">invertible</span> if AA⁻¹ = A⁻¹A = I. Find it by row-reducing [A | I] until the left side becomes I — right side is A⁻¹.</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3">
          <div className="text-slate-400 mb-1">2×2 shortcut:</div>
          <div>A = [a b; c d]  →  A⁻¹ = (1/(ad−bc)) × [d −b; −c a]</div>
          <div className="text-slate-400 mt-1">If ad−bc = 0: singular, no inverse</div>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          {['(AB)⁻¹ = B⁻¹A⁻¹  (order reverses)', '(Aᵀ)⁻¹ = (A⁻¹)ᵀ', '(A⁻¹)⁻¹ = A'].map(p => (
            <div key={p} className="font-mono bg-slate-50 dark:bg-slate-900 rounded px-2 py-1">{p}</div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Solving Ax = b</p>
        <p className="mb-2">If A is invertible: x = A⁻¹b. Useful when solving for many different b vectors with the same A — compute A⁻¹ once, then just multiply.</p>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">LU decomposition: A = LU</p>
        <p className="mb-2">L is lower triangular (1s on diagonal), U is upper triangular. The multipliers from Gaussian elimination fill L; the result of elimination is U.</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Forward: Ly = b</p>
            <p>Substitute downward. Fast because L is triangular.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-2">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Back: Ux = y</p>
            <p>Substitute upward. Fast because U is triangular.</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Do LU once → solve for any number of b vectors cheaply. This is why FEA software can handle hundreds of load cases.</p>
      </div>
    </div>
  );
}

function MultiplicationPane() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = MUL_PRESETS[pi];
  const steps = mulSteps(preset.A, preset.B);
  const cur = steps[si];
  const AB = mul(preset.A, preset.B);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {MUL_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>

      <div className="grid grid-cols-2 gap-3">
        {[['A', preset.A, cur.activeI, -1], ['B', preset.B, -1, cur.activeJ]].map(([label, mat, hlRow, hlCol]) => (
          <div key={label} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-slate-500 text-center mb-2">Matrix {label}</p>
            <MatrixGrid data={mat} highlight={(r, c) => (label === 'A' ? r === hlRow : c === hlCol)} highlightColor="bg-blue-50 dark:bg-blue-950/40" />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <p className="text-xs text-center text-slate-400 mb-1">Step {si + 1} of {steps.length}: <span className="text-slate-700 dark:text-slate-300 font-medium">{cur.desc}</span></p>
        <MatrixGrid data={cur.C} highlight={(r, c) => r === cur.activeI && c === cur.activeJ} highlightColor="bg-green-50 dark:bg-green-950/40" />
        {cur.terms && (
          <p className="text-xs font-mono text-center text-slate-500 dark:text-slate-400 mt-2 break-all">{cur.terms} = <span className="text-green-600 dark:text-green-400 font-semibold">{fmt(cur.val)}</span></p>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0}
          className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1}
          className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

function InversePane() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = INV_PRESETS[pi];
  const steps = invSteps(preset.A);
  const cur = steps[si];
  const n = preset.A.length;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {INV_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <p className="text-xs text-center text-slate-400 mb-1">Step {si + 1} of {steps.length}: <span className="text-slate-700 dark:text-slate-300 font-medium">{cur.desc}</span></p>
        <div className="text-xs text-center text-slate-400 mb-2">[A{cur.done ? '⁻¹' : ''} side | I side] — left half shown in <span className="text-blue-600 dark:text-blue-400">blue</span> rows (pivot), <span className="text-red-500">red</span> rows (being eliminated)</div>
        <AugGrid aug={cur.aug} n={n} pivotRow={cur.pivotRow} elimRow={cur.elimRow} />
        {cur.op && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">{cur.op}</p>}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0}
          className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1}
          className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

function LUPane() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = LU_PRESETS[pi];
  const steps = luSteps(preset.A);
  const cur = steps[si];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {LU_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>

      <div className="grid grid-cols-2 gap-3">
        {[['L (lower triangular)', cur.L, '#EAF3DE', '#27500A'], ['U (upper triangular)', cur.U, '#EEEDFE', '#3C3489']].map(([label, mat, bg, fg]) => (
          <div key={label} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-center mb-2" style={{ color: fg }}>{label}</p>
            <MatrixGrid data={mat} />
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{cur.desc}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{cur.op}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i - 1))} disabled={si === 0}
          className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length - 1, i + 1))} disabled={si === steps.length - 1}
          className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

const PRACTICE = [
  {
    context: 'Multiplication', q: 'Compute AB and BA. Are they equal?',
    data: 'A = [ 1  2 ]    B = [ 0  1 ]\n    [ 3  4 ]        [ 2  3 ]',
    hint: 'C[i,j] = row i of A · col j of B. Do AB first, then swap.',
    answer: `AB:
C[1,1]=(1)(0)+(2)(2)=4   C[1,2]=(1)(1)+(2)(3)=7
C[2,1]=(3)(0)+(4)(2)=8   C[2,2]=(3)(1)+(4)(3)=15

AB = [ 4   7 ]
     [ 8  15 ]

BA:
C[1,1]=(0)(1)+(1)(3)=3   C[1,2]=(0)(2)+(1)(4)=4
C[2,1]=(2)(1)+(3)(3)=11  C[2,2]=(2)(2)+(3)(4)=16

BA = [  3   4 ]
     [ 11  16 ]

AB ≠ BA — matrix multiplication is NOT commutative.`,
  },
  {
    context: 'Inverse — row reduction', q: 'Find A⁻¹ using [A | I] row reduction.',
    data: 'A = [ 3  1 ]\n    [ 5  2 ]',
    hint: 'det = 3×2−1×5 = 1, so it is invertible. Set up [A|I] and row reduce to [I|A⁻¹].',
    answer: `[A | I]:
[ 3  1 | 1  0 ]
[ 5  2 | 0  1 ]

R₁ → (1/3)R₁:
[ 1  1/3 | 1/3  0 ]
[ 5  2   | 0    1 ]

R₂ → R₂ − 5R₁:
[ 1  1/3 |  1/3  0 ]
[ 0  1/3 | −5/3  1 ]

R₂ → 3R₂:
[ 1  1/3 |  1/3  0 ]
[ 0   1  | −5    3 ]

R₁ → R₁ − (1/3)R₂:
[ 1   0  |  2   −1 ]
[ 0   1  | −5    3 ]

A⁻¹ = [  2  −1 ]
       [ −5   3 ]

Verify: [ 3  1 ][ 2  −1 ] = [ 6−5  −3+3 ] = [ 1  0 ] ✓
        [ 5  2 ][−5   3 ]   [ 10−10 −5+6 ]   [ 0  1 ]`,
  },
  {
    context: 'Solve with inverse', q: 'Using A⁻¹ from problem 2, solve Ax = b with b = [8, 13]ᵀ. Verify.',
    hint: 'x = A⁻¹b. Multiply each row of A⁻¹ by b.',
    answer: `A⁻¹ = [  2  −1 ],  b = [ 8  ]
       [ −5   3 ]         [ 13 ]

x₁ = 2(8) + (−1)(13) = 16 − 13 = 3
x₂ = −5(8) + 3(13) = −40 + 39 = −1

Solution: x = [3, −1]ᵀ

Verify Ax = b:
3(3)+1(−1) = 8 ✓
5(3)+2(−1) = 13 ✓`,
  },
  {
    context: 'LU decomposition', q: 'Find the LU decomposition, then solve Ax = b with b = [2, 5, 3]ᵀ.',
    data: 'A = [ 1   2   1 ]\n    [ 2   5   3 ]\n    [−1  −1   2 ]',
    hint: 'Record each multiplier (m_ij = pivot row entry / pivot) into L. Zero out below using Rᵢ → Rᵢ − mRⱼ. Then Ly=b forward, Ux=y backward.',
    answer: `Elimination:
m₂₁ = 2/1 = 2: R₂ → R₂ − 2R₁ → [0, 1, 1]
m₃₁ = −1/1 = −1: R₃ → R₃ + R₁ → [0, 1, 3]
m₃₂ = 1/1 = 1: R₃ → R₃ − R₂ → [0, 0, 2]

L = [ 1   0   0 ]    U = [ 1   2   1 ]
    [ 2   1   0 ]        [ 0   1   1 ]
    [−1   1   1 ]        [ 0   0   2 ]

Forward Ly = b = [2,5,3]:
y₁ = 2
2(2) + y₂ = 5  → y₂ = 1
−1(2)+1(1)+y₃ = 3  → y₃ = 4

y = [2, 1, 4]ᵀ

Back Ux = y:
2x₃ = 4  → x₃ = 2
x₂ + 2 = 1  → x₂ = −1
x₁ + 2(−1) + 2 = 2  → x₁ = 2

x = [2, −1, 2]ᵀ

Verify: [1+−2+2, 2+−5+6, −1+1+4] = [1, 3, ... wait:
Row1: 2−2+2=2 ✓  Row2: 4−5+6=5 ✓  Row3: −2+1+4=3 ✓`,
  },
  {
    context: 'Graphics — transforms', q: 'A vertex is at p = [3, 1]ᵀ. First rotate 90°, then scale by 2. Compute T = S·R, apply to p, and find T⁻¹.',
    hint: 'R(90°) = [[0,−1],[1,0]]. S(2) = [[2,0],[0,2]]. T = S×R. Then find T⁻¹ with the 2×2 formula.',
    answer: `R = [ 0  −1 ]    S = [ 2  0 ]
    [ 1   0 ]        [ 0  2 ]

T = S·R:
T[1,1]=2(0)+0(1)=0   T[1,2]=2(−1)+0(0)=−2
T[2,1]=0(0)+2(1)=2   T[2,2]=0(−1)+2(0)=0

T = [ 0  −2 ]
    [ 2   0 ]

T·p = [ 0(3)+(−2)(1) ] = [ −2 ]
      [ 2(3)+  0(1)  ]   [  6 ]

Transformed vertex: (−2, 6)

det(T) = 0(0)−(−2)(2) = 4

T⁻¹ = (1/4)[ 0   2 ] = [  0    0.5 ]
            [−2   0 ]   [ −0.5  0   ]

Verify T⁻¹·(−2,6) = [0(−2)+0.5(6), −0.5(−2)+0(6)] = [3, 1] ✓`,
  },
];

const TABS = ['Concept', 'Multiplication', 'Inverse', 'LU decomp', 'Practice'];

export default function MatrixAlgebra() {
  const [tab, setTab] = useState(0);
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Module 2 — Matrix Algebra</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Multiplication · Inverse · LU decomposition · Practice</p>
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
      {tab === 1 && <MultiplicationPane />}
      {tab === 2 && <InversePane />}
      {tab === 3 && <LUPane />}
      {tab === 4 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">Work each problem by hand before revealing.</p>
          {PRACTICE.map((item, i) => <PracticeCard key={i} item={item} index={i} />)}
        </div>
      )}
    </div>
  );
}
