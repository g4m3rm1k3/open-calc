import React, { useState } from 'react';

// ─── math helpers ────────────────────────────────────────────────────────────

function cloneM(m) { return m.map(r => [...r]); }
function round6(x) { return Math.round(x * 1e6) / 1e6; }
function fmt(v) {
  if (v === 0) return '0';
  if (Math.abs(v) < 0.001) return v.toExponential(1);
  if (Number.isInteger(v)) return String(v);
  // show as fraction if denominator ≤ 12 for readability
  for (let d = 2; d <= 12; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-6) return d === 1 ? String(n) : `${n}/${d}`;
  }
  return v.toFixed(2);
}

function gaussianSteps(initial) {
  const steps = [
    { matrix: cloneM(initial), desc: 'Starting augmented matrix [A | b]', pivotRow: -1, elimRow: -1, op: '' },
  ];
  const m = cloneM(initial);
  const n = m.length;

  for (let col = 0; col < n; col++) {
    let pivotRow = -1;
    for (let r = col; r < n; r++) {
      if (Math.abs(m[r][col]) > 1e-9) { pivotRow = r; break; }
    }
    if (pivotRow === -1) continue;

    if (pivotRow !== col) {
      [m[col], m[pivotRow]] = [m[pivotRow], m[col]];
      steps.push({
        matrix: cloneM(m),
        desc: `Swap R${col + 1} ↔ R${pivotRow + 1}`,
        op: `Bring the largest pivot to row ${col + 1} — makes the numbers cleaner.`,
        pivotRow: col, elimRow: -1,
      });
    }

    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r][col]) < 1e-9) continue;
      const factor = round6(m[r][col] / m[col][col]);
      for (let c = col; c <= n; c++) m[r][c] = round6(m[r][c] - factor * m[col][c]);
      steps.push({
        matrix: cloneM(m),
        desc: `R${r + 1} ← R${r + 1} − (${fmt(factor)}) × R${col + 1}`,
        op: `Multiplier = ${fmt(factor)}. Subtract ${fmt(factor)} × pivot row from R${r + 1} to zero out column ${col + 1}.`,
        pivotRow: col, elimRow: r,
      });
    }
  }

  steps.push({
    matrix: cloneM(m), desc: 'Row echelon form (REF) reached',
    op: 'Staircase of pivots, zeros below each. Now back-substitute from the bottom up.',
    pivotRow: -1, elimRow: -1,
  });

  // back substitution
  for (let r = n - 1; r >= 0; r--) {
    if (Math.abs(m[r][r]) < 1e-9) continue;
    const val = round6(m[r][n] / m[r][r]);
    m[r][n] = val; m[r][r] = 1;
    for (let above = r - 1; above >= 0; above--) {
      m[above][n] = round6(m[above][n] - m[above][r] * val);
      m[above][r] = 0;
    }
    steps.push({
      matrix: cloneM(m),
      desc: `Back-sub: x${r + 1} = ${fmt(val)}`,
      op: `Divide row ${r + 1} by its pivot, then eliminate upward to get x${r + 1} = ${fmt(val)}.`,
      pivotRow: r, elimRow: -1,
    });
  }

  return steps;
}

// ─── presets ──────────────────────────────────────────────────────────────────

const PRESETS = [
  {
    label: 'Unique solution',
    matrix: [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]],
    context: 'Classic 3×3 — one unique solution. Watch pivots form a staircase.',
  },
  {
    label: 'CNC positioning',
    matrix: [[1, 1, 1, 6], [2, 1, -3, -5], [3, -2, 1, 2]],
    context: 'Three encoder readings constrain x, y, z tool position. Solve for the origin.',
  },
  {
    label: '∞ solutions',
    matrix: [[1, 2, -1, 3], [2, 4, -2, 6], [1, -1, 1, 2]],
    context: 'Row 2 is exactly 2 × row 1 → becomes all zeros → free variable → infinitely many solutions.',
  },
  {
    label: 'No solution',
    matrix: [[1, 1, 1, 5], [2, 2, 2, 9], [1, -1, 1, 1]],
    context: 'Row 2 is 2× row 1 but 9 ≠ 2×5 → contradiction row [0 0 0 | −1] → inconsistent.',
  },
];

// ─── practice problems ───────────────────────────────────────────────────────

const PRACTICE = [
  {
    q: 'Solve by row reduction. Show the augmented matrix and every ERO.',
    system: '3x + 2y = 12\n x  −  y  = 1',
    hint: 'Swap rows so the simpler equation is on top. Then eliminate.',
    answer: `Augmented:  [ 3   2 | 12 ]
            [ 1  −1 |  1 ]

R₁ ↔ R₂:   [ 1  −1 |  1 ]
            [ 3   2 | 12 ]

R₂ → R₂ − 3R₁:
  [3−3, 2+3, 12−3] = [0, 5, 9]
            [ 1  −1 |  1 ]
            [ 0   5 |  9 ]

R₂ → (1/5)R₂:   [0, 1, 9/5]

R₁ → R₁ + R₂:   [1, 0, 1+9/5] = [1, 0, 14/5]

Solution: x = 14/5 = 2.8,  y = 9/5 = 1.8
Check: 3(2.8)+2(1.8)=12 ✓   2.8−1.8=1 ✓`,
    context: 'Canonical',
  },
  {
    q: 'Without solving fully — is this consistent? Unique or infinite solutions?',
    system: ' x + 2y − z = 3\n2x + 4y − 2z = 6\n x −  y +  z = 2',
    hint: 'Look at rows 1 and 2 before you do anything.',
    answer: `R₂ → R₂ − 2R₁:  [0, 0, 0 | 0]  ← entire row zeros out
R₃ → R₃ − R₁:   [0, −3, 2 | −1]

Result:
[ 1   2  −1 | 3 ]
[ 0   0   0 | 0 ]   ← zero row, no contradiction
[ 0  −3   2 |−1 ]

Only 2 pivot columns for 3 variables → one FREE variable
→ INFINITELY MANY solutions. System IS consistent.`,
    context: 'Identify solution type',
  },
  {
    q: 'A robot arm has two encoder readings:\n  Encoder 1: 4x + 3y = 18\n  Encoder 2: 2x −  y = 4\nFind (x, y). What does an inconsistent system mean here?',
    hint: 'Swap so the simpler row is on top first.',
    answer: `Augmented:  [ 4   3 | 18 ]
            [ 2  −1 |  4 ]

R₁ ↔ R₂:   [ 2  −1 |  4 ]
            [ 4   3 | 18 ]

R₂ → R₂ − 2R₁:  [0, 5, 10]

R₂ → (1/5)R₂:   [0, 1, 2]
R₁ → R₁ + R₂:   [2, 0, 6]  → R₁ → (1/2)R₁ → [1, 0, 3]

Position: x = 3 mm,  y = 2 mm

Inconsistent would mean the two encoders give physically
impossible readings — one sensor has failed. The controller
should halt and throw a fault rather than machine in the
wrong position.`,
    context: 'Real world — CNC',
  },
  {
    q: 'Write the parametric solution:\nx₁ + 2x₂ − x₃ = 4\n2x₁ + 4x₂ + x₃ = 7',
    hint: 'Eliminate below. Identify pivot vs free columns.',
    answer: `Augmented:  [ 1   2  −1 | 4 ]
            [ 2   4   1 | 7 ]

R₂ → R₂ − 2R₁:  [0, 0, 3, −1]

R₂ → (1/3)R₂:   [0, 0, 1, −1/3]
R₁ → R₁ + R₂:   [1, 2, 0, 11/3]

Pivot cols: 1 & 3  →  x₁, x₃ basic
Non-pivot col: 2   →  x₂ = t  (free parameter)

From row 2: x₃ = −1/3
From row 1: x₁ = 11/3 − 2t

Parametric solution (t ∈ ℝ):
  x₁ = 11/3 − 2t
  x₂ = t
  x₃ = −1/3`,
    context: 'Free variables',
  },
];

// ─── sub-components ──────────────────────────────────────────────────────────

function MatrixDisplay({ matrix, pivotRow, elimRow }) {
  const cols = matrix[0].length;
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto font-mono text-sm border-collapse">
        <tbody>
          {matrix.map((row, i) => {
            const bg = i === pivotRow
              ? 'bg-blue-50 dark:bg-blue-950/40'
              : i === elimRow
                ? 'bg-red-50 dark:bg-red-950/40'
                : '';
            return (
              <tr key={i} className={bg}>
                <td className="pr-2 text-slate-400 text-xs select-none">[</td>
                {row.map((val, j) => (
                  <td
                    key={j}
                    className={`px-2 py-1 text-center min-w-[40px]
                      ${j === cols - 2 ? 'border-r-2 border-slate-300 dark:border-slate-600' : ''}
                      ${i === pivotRow ? 'text-blue-700 dark:text-blue-300 font-semibold' :
                        i === elimRow ? 'text-red-600 dark:text-red-400' :
                        val === 0 ? 'text-slate-400 dark:text-slate-500' :
                        'text-slate-800 dark:text-slate-200'}`}
                  >
                    {fmt(val)}
                  </td>
                ))}
                <td className="pl-2 text-slate-400 text-xs select-none">]</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ProgressDots({ total, current, onJump }) {
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onJump(i)}
          className={`h-1.5 flex-1 rounded-full transition-colors
            ${i === current ? 'bg-violet-500' :
              i < current ? 'bg-violet-300 dark:bg-violet-700' :
              'bg-slate-200 dark:bg-slate-700'}`}
        />
      ))}
    </div>
  );
}

function PracticeCard({ item, index }) {
  const [shown, setShown] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
          {item.context}
        </span>
        <span className="text-xs text-slate-400">Problem {index + 1}</span>
      </div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{item.q}</p>
      {item.system && (
        <pre className="text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded p-2 mb-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{item.system}</pre>
      )}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setHintShown(h => !h)}
          className="text-xs px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          {hintShown ? 'Hide hint' : 'Hint'}
        </button>
        <button
          onClick={() => setShown(s => !s)}
          className="text-xs px-3 py-1.5 rounded border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/40"
        >
          {shown ? 'Hide answer' : 'Show full answer'}
        </button>
      </div>
      {hintShown && (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded p-2">
          💡 {item.hint}
        </p>
      )}
      {shown && (
        <pre className="mt-3 text-xs font-mono bg-slate-50 dark:bg-slate-900 rounded p-3 text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
          {item.answer}
        </pre>
      )}
    </div>
  );
}

// ─── tabs ─────────────────────────────────────────────────────────────────────

const TABS = ['Concept', 'Stepper', 'Real world', 'Practice'];

function ConceptPane() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Why this exists</p>
        <p>Any time you have multiple unknowns constrained by multiple equations, you have a linear system. CNC controllers, circuit simulators, structural FEA, and graphics pipelines all reduce to this exact operation. Row reduction is how you solve them — systematically, every time.</p>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">A linear equation</p>
        <p className="mb-2">The form <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">a₁x₁ + a₂x₂ + … + aₙxₙ = b</code>. Coefficients aᵢ multiply the unknowns. "Linear" means no squaring, no products of unknowns, no trig.</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
          <div><span className="text-green-600 dark:text-green-400">2x + 3y − z = 7</span>  ✓ linear</div>
          <div><span className="text-red-500">x² + y = 5</span>  ✗ not linear (x squared)</div>
          <div><span className="text-red-500">x · y = 3</span>  ✗ not linear (product of unknowns)</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Three possible outcomes — always one of these</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: 'Unique solution', color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400', desc: 'Lines/planes intersect at exactly one point' },
            { label: 'No solution', color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400', desc: 'Parallel — never intersect. Row [0 0 | k] where k≠0.' },
            { label: '∞ solutions', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400', desc: 'Same line/plane. Free variables — pick any value.' },
          ].map(c => (
            <div key={c.label} className={`rounded-lg border p-2 ${c.color}`}>
              <p className="font-semibold mb-1">{c.label}</p>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">The augmented matrix</p>
        <p className="mb-2">Stack the coefficients into matrix A, append the constants as column b. Never skip a variable slot — missing variables get coefficient 0.</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3">
          <div className="text-slate-500 mb-1">System → Augmented [A | b]</div>
          <div><span className="text-blue-600 dark:text-blue-400">2x + 3y − z = 1</span>   <span className="text-blue-600 dark:text-blue-400">[ 2   3  −1 | 1 ]</span></div>
          <div><span className="text-violet-600 dark:text-violet-400"> x −  y + 2z = 4</span>   <span className="text-violet-600 dark:text-violet-400">[ 1  −1   2 | 4 ]</span></div>
          <div><span className="text-teal-600 dark:text-teal-400">3x + 2y +  z = 5</span>   <span className="text-teal-600 dark:text-teal-400">[ 3   2   1 | 5 ]</span></div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Three elementary row operations (EROs)</p>
        <div className="space-y-2 text-xs">
          {[
            { op: 'Rᵢ ↔ Rⱼ', name: 'Swap', why: 'Changes order only. Same as reordering equations.' },
            { op: 'Rᵢ → kRᵢ', name: 'Scale (k ≠ 0)', why: 'Same as multiplying both sides of an equation by k.' },
            { op: 'Rᵢ → Rᵢ + kRⱼ', name: 'Replace', why: 'Same as adding k× one equation to another. Most used operation.' },
          ].map(e => (
            <div key={e.name} className="flex gap-3 items-start rounded bg-slate-50 dark:bg-slate-900 p-2">
              <code className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 shrink-0">{e.op}</code>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{e.name} — </span>
                <span>{e.why}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">REF vs RREF</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-3">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Row Echelon Form</p>
            <p>Staircase of leading entries (pivots). Zeros <em>below</em> each pivot. Zero rows at bottom.</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-3">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Reduced REF</p>
            <p>REF + every pivot = 1 + zeros <em>above</em> each pivot too. Solution reads directly from last column.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepperPane() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const steps = gaussianSteps(PRESETS[presetIdx].matrix);
  const cur = steps[stepIdx];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setPresetIdx(i); setStepIdx(0); }}
            className={`px-3 py-1 rounded text-xs ${i === presetIdx
              ? 'bg-violet-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">{PRESETS[presetIdx].context}</p>

      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3">
        <p className="text-xs text-center mb-1 text-slate-400 dark:text-slate-500">
          Step {stepIdx + 1} of {steps.length}
        </p>
        <p className="text-sm font-semibold text-center mb-3 text-slate-800 dark:text-slate-200">
          {cur.desc}
        </p>
        <MatrixDisplay matrix={cur.matrix} pivotRow={cur.pivotRow} elimRow={cur.elimRow} />
        {cur.op && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center border-t border-slate-100 dark:border-slate-800 pt-2">
            {cur.op}
          </p>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-x-3">
        <span className="inline-block w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 mr-1 align-middle" />
        pivot row
        <span className="inline-block w-3 h-3 rounded bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-700 mr-1 ml-3 align-middle" />
        row being eliminated
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStepIdx(i => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300"
        >
          ← Prev
        </button>
        <button
          onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))}
          disabled={stepIdx === steps.length - 1}
          className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30"
        >
          Next →
        </button>
      </div>
      <ProgressDots total={steps.length} current={stepIdx} onJump={setStepIdx} />
    </div>
  );
}

function RealWorldPane() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">CNC machine positioning</p>
        <p>A CNC controller reads multiple encoders after a tool change to confirm the work coordinate origin. Each encoder gives one linear constraint. Solving the system gives the actual tool position — this math runs in firmware every few milliseconds.</p>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">The setup</p>
        <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
          <div className="text-slate-400 mb-1">Three encoder cross-checks on a 3-axis mill:</div>
          <div><span className="text-blue-600 dark:text-blue-400">2x + y + z = 10</span>  (combined XYZ reading)</div>
          <div><span className="text-violet-600 dark:text-violet-400"> x − y + z =  2</span>  (differential XZ vs Y)</div>
          <div><span className="text-teal-600 dark:text-teal-400"> x + y − z =  0</span>  (XY plane check)</div>
          <div className="text-slate-400 mt-2">Solve → confirmed origin (x, y, z)</div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">What inconsistency means to the machine</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="font-semibold text-green-700 dark:text-green-400 mb-1">Unique solution ✓</p>
            <p>All sensors agree. Origin confirmed. Machine proceeds.</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Inconsistent ✗</p>
            <p>RREF contains [0 0 0 | k] with k≠0. Sensor fault. Controller halts and alarms.</p>
          </div>
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Other places you'll see this</p>
        <div className="space-y-2 text-xs">
          {[
            { title: 'Circuit analysis (Kirchhoff\'s laws)', desc: 'Each node gives one KCL equation. Each loop gives one KVL equation. Stack them → solve the system for all currents and voltages.' },
            { title: 'Structural FEA', desc: 'Each joint gives 2–3 equilibrium equations. A truss with 50 joints → 100+ equation system. Solve once, get all member forces.' },
            { title: 'Computer graphics (ray intersection)', desc: 'Finding where a ray hits a polygon is a 3-variable linear system solved thousands of times per frame.' },
            { title: 'Robotics (inverse kinematics)', desc: 'Given a desired end-effector position, find joint angles. The linearized version is a system of equations solved in real time.' },
          ].map(item => (
            <div key={item.title} className="flex gap-2 bg-slate-50 dark:bg-slate-900 rounded p-2">
              <span className="text-violet-500 shrink-0 mt-0.5">▸</span>
              <div><span className="font-semibold text-slate-700 dark:text-slate-300">{item.title} — </span>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">MATLAB reference</p>
        <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded p-3 overflow-x-auto">{`A = [2 1 1; 1 -1 1; 1 1 -1];
b = [10; 2; 0];

rref([A b])         % augmented matrix → RREF

x = A \\ b           % solve Ax=b directly (preferred)

% Check consistency
if rank(A) == rank([A b])
    disp('Consistent')
    if rank(A) == 3
        disp('Unique solution')
    else
        disp('Infinite solutions — free variables exist')
    end
else
    disp('Inconsistent — no solution')
end`}</pre>
      </div>
    </div>
  );
}

// ─── main export ──────────────────────────────────────────────────────────────

export default function LinearSystemsStepper() {
  const [tab, setTab] = useState(0);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Module 1 — Linear Systems &amp; Row Reduction</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Concept · Stepper · Real world · Practice</p>
      </div>

      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors
              ${tab === i
                ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <ConceptPane />}
      {tab === 1 && <StepperPane />}
      {tab === 2 && <RealWorldPane />}
      {tab === 3 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">Work each problem by hand before revealing. Attempt it — that's the only way it sticks.</p>
          {PRACTICE.map((item, i) => <PracticeCard key={i} item={item} index={i} />)}
        </div>
      )}
    </div>
  );
}
