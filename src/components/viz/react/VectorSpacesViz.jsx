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

// Row reduce to RREF, tracking pivot columns
function rrefWithPivots(matrix) {
  const m = cloneM(matrix);
  const rows = m.length, cols = m[0].length;
  const steps = [];
  const pivotCols = [];
  let pr = 0;
  steps.push({ m: cloneM(m), desc: 'Starting matrix', pivotCols: [] });
  for (let c = 0; c < cols && pr < rows; c++) {
    let pivRow = -1;
    for (let r = pr; r < rows; r++) { if (Math.abs(m[r][c]) > 1e-9) { pivRow = r; break; } }
    if (pivRow < 0) continue;
    if (pivRow !== pr) {
      [m[pr], m[pivRow]] = [m[pivRow], m[pr]];
      steps.push({ m: cloneM(m), desc: `Swap R${pr+1} ↔ R${pivRow+1}`, pivRow: pr, elimRow: pivRow, pivotCols: [...pivotCols] });
    }
    const sc = m[pr][c];
    m[pr] = m[pr].map(v => r4(v / sc));
    steps.push({ m: cloneM(m), desc: `R${pr+1} → (1/${fmt(sc)}) R${pr+1}  [make pivot = 1]`, pivRow: pr, elimRow: -1, pivotCols: [...pivotCols] });
    for (let r = 0; r < rows; r++) {
      if (r === pr || Math.abs(m[r][c]) < 1e-9) continue;
      const f = m[r][c];
      m[r] = m[r].map((v, j) => r4(v - f * m[pr][j]));
      steps.push({ m: cloneM(m), desc: `R${r+1} → R${r+1} − (${fmt(f)}) R${pr+1}  [zero out column ${c+1}]`, pivRow: pr, elimRow: r, pivotCols: [...pivotCols] });
    }
    pivotCols.push(c);
    pr++;
  }
  steps.push({ m: cloneM(m), desc: 'RREF complete', pivRow: -1, elimRow: -1, pivotCols: [...pivotCols], done: true });
  return { steps, pivotCols, rref: m };
}

// ─── presets ──────────────────────────────────────────────────────────────────
const LI_PRESETS = [
  {
    label: 'Linearly independent',
    vecs: [[1,0,0],[0,1,0],[0,0,1]],
    context: 'Standard basis vectors e₁, e₂, e₃ in ℝ³. Three pivots → linearly independent. They span all of ℝ³.',
  },
  {
    label: 'Linearly dependent',
    vecs: [[1,2,3],[2,4,6],[1,1,2]],
    context: 'v₂ = 2v₁ — a scalar multiple. Matrix has a zero row in RREF → dependent. One free variable.',
  },
  {
    label: 'Spanning set',
    vecs: [[1,0,2],[0,1,3],[2,1,7],[1,1,5]],
    context: '4 vectors in ℝ³. More vectors than dimension → must be dependent. Find which are redundant.',
  },
  {
    label: 'Basis check',
    vecs: [[1,1,0],[1,0,1],[0,1,1]],
    context: 'Are these 3 vectors a basis for ℝ³? Check: n vectors in ℝⁿ with n pivots = yes.',
  },
];

const PRACTICE = [
  {
    context: 'Linear independence',
    q: 'Are these vectors linearly independent? If not, express one as a combination of the others.',
    data: 'v₁ = [1, 2, 3]ᵀ\nv₂ = [4, 5, 6]ᵀ\nv₃ = [7, 8, 9]ᵀ',
    hint: 'Form the matrix with these as columns. Row reduce. Count pivots. If pivots < 3, dependent.',
    answer: `Form [v₁ v₂ v₃] and row reduce:
[ 1  4  7 ]
[ 2  5  8 ]
[ 3  6  9 ]

R₂ → R₂ − 2R₁:   [0, −3, −6]
R₃ → R₃ − 3R₁:   [0, −6, −12]
R₃ → R₃ − 2R₂:   [0,  0,   0]

RREF has only 2 pivots for 3 vectors → LINEARLY DEPENDENT.

The zero row means: v₃ is a linear combination of v₁, v₂.
From the free variable in column 3:
v₃ = 2v₂ − v₁

Check: 2[4,5,6]−[1,2,3] = [8−1, 10−2, 12−3] = [7,8,9] ✓`,
  },
  {
    context: 'Span',
    q: 'Does w = [3, 5, 7]ᵀ lie in the span of v₁ = [1, 1, 1]ᵀ and v₂ = [1, 2, 3]ᵀ?',
    hint: 'Ask: does c₁v₁ + c₂v₂ = w have a solution? Set up [v₁ v₂ | w] and row reduce.',
    answer: `[v₁ v₂ | w]:
[ 1  1 | 3 ]
[ 1  2 | 5 ]
[ 1  3 | 7 ]

R₂ → R₂ − R₁: [0, 1, 2]
R₃ → R₃ − R₁: [0, 2, 4]
R₃ → R₃ − 2R₂: [0, 0, 0]   ← zero row, consistent!

From RREF: c₂ = 2,  c₁ = 3 − c₂ = 1

w = 1·v₁ + 2·v₂

Check: [1,1,1] + 2[1,2,3] = [1+2, 1+4, 1+6] = [3,5,7] ✓

YES — w is in span{v₁, v₂}.`,
  },
  {
    context: 'Basis',
    q: 'Find a basis for the column space of A, and state the rank and nullity.',
    data: 'A = [ 1   2   3   4 ]\n    [ 0   1   2   3 ]\n    [ 1   3   5   7 ]',
    hint: 'Row reduce A. Pivot columns of A (the original columns, not RREF columns) form the basis for Col(A). rank = number of pivots. nullity = n − rank.',
    answer: `Row reduce A:
[ 1  2  3  4 ]
[ 0  1  2  3 ]
[ 1  3  5  7 ]

R₃ → R₃ − R₁: [0, 1, 2, 3]
R₃ → R₃ − R₂: [0, 0, 0, 0]

RREF:
[ 1  0  -1  -2 ]
[ 0  1   2   3 ]
[ 0  0   0   0 ]

Pivot columns: 1 and 2
Free columns: 3 and 4

Basis for Col(A) = {col 1 of A, col 2 of A}
  = {[1,0,1]ᵀ, [2,1,3]ᵀ}

rank(A) = 2
nullity(A) = 4 − 2 = 2  (Rank-Nullity theorem: rank + nullity = n)`,
  },
  {
    context: 'Null space',
    q: 'Find a basis for the null space of B (all x such that Bx = 0).',
    data: 'B = [ 1  2  1 ]\n    [ 2  4  2 ]',
    hint: 'Row reduce B. Set free variables to parameters. Back-substitute for basic variables.',
    answer: `Row reduce B:
[ 1  2  1 ]
[ 2  4  2 ]

R₂ → R₂ − 2R₁: [0, 0, 0]

RREF: [ 1  2  1 ]
      [ 0  0  0 ]

Pivot column: 1 → x₁ basic
Free columns: 2, 3 → x₂ = s,  x₃ = t (free parameters)

From row 1: x₁ + 2s + t = 0 → x₁ = −2s − t

Solution:
x = s[−2, 1, 0]ᵀ + t[−1, 0, 1]ᵀ

Basis for Null(B) = {[−2, 1, 0]ᵀ, [−1, 0, 1]ᵀ}
dim(Null B) = 2  ← nullity`,
  },
];

// ─── components ───────────────────────────────────────────────────────────────
function MatGrid({ data, pivRow = -1, elimRow = -1, pivCols = [] }) {
  return (
    <table className="font-mono text-sm border-collapse mx-auto">
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={i === pivRow ? 'bg-blue-50 dark:bg-blue-950/40' : i === elimRow ? 'bg-red-50 dark:bg-red-950/40' : ''}>
            <td className="pr-1 text-slate-400 text-xs select-none">[</td>
            {row.map((v, j) => (
              <td key={j} className={`px-2 py-1 text-center min-w-[38px]
                ${pivCols.includes(j) ? 'border-b-2 border-violet-400 dark:border-violet-500' : ''}
                ${i === pivRow ? 'text-blue-700 dark:text-blue-300 font-semibold' : i === elimRow ? 'text-red-600 dark:text-red-400' : v === 0 ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                {fmt(v)}
              </td>
            ))}
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

function StepperPane() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = LI_PRESETS[pi];
  const matrix = preset.vecs[0].map((_, r) => preset.vecs.map(v => v[r])); // columns = vectors
  const { steps } = rrefWithPivots(matrix);
  const cur = steps[si];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {LI_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>
      <div className="flex gap-2 flex-wrap text-xs font-mono">
        {preset.vecs.map((v, i) => (
          <span key={i} className="bg-slate-50 dark:bg-slate-900 rounded px-2 py-1 text-slate-700 dark:text-slate-300">
            v{i+1}=[{v.join(',')}]
          </span>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">Matrix A formed with vectors as <span className="font-semibold">columns</span>. Pivot columns = linearly independent vectors. Non-pivot = redundant.</p>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <p className="text-xs text-center text-slate-400 mb-1">Step {si+1} of {steps.length}</p>
        <p className="text-sm font-semibold text-center text-slate-800 dark:text-slate-200 mb-3">{cur.desc}</p>
        <MatGrid data={cur.m} pivRow={cur.pivRow ?? -1} elimRow={cur.elimRow ?? -1} pivCols={cur.pivotCols ?? []} />
        {cur.done && (
          <div className="mt-3 space-y-1 text-xs font-mono">
            <p className="text-center text-green-700 dark:text-green-400">
              Pivot columns: {cur.pivotCols.length > 0 ? cur.pivotCols.map(c => c+1).join(', ') : 'none'}
            </p>
            <p className="text-center text-slate-500 dark:text-slate-400">
              Rank = {cur.pivotCols.length}  |  Nullity = {preset.vecs.length - cur.pivotCols.length}
            </p>
            <p className="text-center font-semibold">
              {cur.pivotCols.length === preset.vecs.length
                ? '✓ Linearly INDEPENDENT'
                : `✗ Linearly DEPENDENT — ${preset.vecs.length - cur.pivotCols.length} redundant vector(s)`}
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        <span className="inline-block w-3 h-0.5 bg-violet-400 mr-1 align-middle" style={{borderBottom:'2px solid'}}/>pivot column (underlined)
        &nbsp;&nbsp;
        <span className="inline-block w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/60 mr-1 align-middle"/>pivot row
        &nbsp;&nbsp;
        <span className="inline-block w-3 h-3 rounded bg-red-100 dark:bg-red-950/60 mr-1 align-middle"/>elimination row
      </p>
      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i-1))} disabled={si===0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length-1, i+1))} disabled={si===steps.length-1} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

function ConceptPane() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Why this exists</p>
        <p>Vector spaces give you a precise language to describe what directions are "reachable" from a set of vectors (span), which vectors are truly independent (not redundant), and how many independent directions a matrix has (rank). In engineering: rank = how many independent constraints you have. Nullity = degrees of freedom left over.</p>
      </div>
      {[
        { term: 'Vector space', def: 'A set with addition and scalar multiplication that satisfies 8 axioms (closure, associativity, etc.). You can think of ℝⁿ as the main example. Every line, plane, or hyperplane through the origin is a subspace.' },
        { term: 'Subspace', def: 'A subset of a vector space that is itself a vector space. Must contain 0, be closed under addition and scalar multiplication. The column space and null space of any matrix are subspaces.' },
        { term: 'Span', def: 'span{v₁,...,vₖ} = all possible linear combinations c₁v₁+...+cₖvₖ. Asking if w ∈ span{v₁,...,vₖ} is the same as asking if [v₁...vₖ|w] is consistent.' },
        { term: 'Linear independence', def: 'Vectors v₁,...,vₖ are LI if c₁v₁+...+cₖvₖ = 0 implies c₁=...=cₖ=0. Equivalently: no vector in the set is a linear combination of the others. Test: form matrix, count pivots.' },
        { term: 'Basis', def: 'A linearly independent set that spans the space. Every vector in the space has a UNIQUE representation as a combination of basis vectors. A basis for ℝⁿ has exactly n vectors.' },
        { term: 'Dimension', def: 'The number of vectors in any basis for a space. dim(ℝⁿ) = n. dim(Col A) = rank(A). dim(Null A) = nullity(A).' },
        { term: 'Rank', def: 'rank(A) = number of pivot columns = dim(Col A) = dim(Row A). Tells you how many independent equations or constraints you have.' },
        { term: 'Rank-Nullity Theorem', def: 'rank(A) + nullity(A) = n  (number of columns). Always. Pivots + free variables = total variables. Used to predict degrees of freedom.' },
        { term: 'Column space Col(A)', def: 'All possible Ax — all linear combinations of columns of A. The set of b values for which Ax=b is consistent.' },
        { term: 'Null space Null(A)', def: 'All x with Ax = 0. Always a subspace. dim = nullity = number of free variables. Non-trivial null space ↔ A is singular ↔ det=0.' },
      ].map(({ term, def }) => (
        <div key={term} className="flex gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
          <span className="font-semibold text-violet-700 dark:text-violet-400 min-w-[130px] shrink-0 text-xs leading-relaxed pt-0.5">{term}</span>
          <span className="text-xs">{def}</span>
        </div>
      ))}
    </div>
  );
}

function RealWorldPane() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Rank = independent constraints. Nullity = degrees of freedom.</p>
        <p>In any engineering system, the rank of the constraint matrix tells you how many constraints actually restrict the system. The nullity tells you how many free parameters remain. This shows up in robot kinematics, structural analysis, and circuit design.</p>
      </div>
      {[
        {
          title: 'Robot kinematics — null space = self-motion',
          body: `A robot arm with 7 joints but only 6 DOF needed for end-effector control has a 1D null space. The joint velocities in the null space move the joints without moving the end-effector — useful for obstacle avoidance. The null space is computed directly from the Jacobian matrix.`,
          code: `J = jacobian(robot, q);   % Jacobian matrix
null_space = null(J);      % basis for Null(J)
% Motion in null_space moves joints but not end-effector`,
        },
        {
          title: 'Structural analysis — rank = independent equilibrium equations',
          body: `A statically indeterminate structure has more unknowns than independent equilibrium equations. rank(A) = number of independent equations. nullity = degree of static indeterminacy. If rank < n, the structure has redundant members.`,
          code: `A = equilibrium_matrix(structure);
r = rank(A);
indeterminacy = size(A,2) - r;  % nullity`,
        },
        {
          title: 'Data science — column space = reachable outputs',
          body: `In a linear regression model y = Xβ, the column space of X is the set of all possible predicted values. If one feature is a linear combination of others (multicollinearity), rank(X) < number of features — the system is underdetermined and coefficients are not unique.`,
          code: `X = feature_matrix;
if rank(X) < size(X,2)
    disp('Multicollinearity detected — rank deficient')
end`,
        },
      ].map(item => (
        <div key={item.title} className="space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
          <p className="text-xs">{item.body}</p>
          <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded p-3 overflow-x-auto">{item.code}</pre>
        </div>
      ))}
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">MATLAB reference</p>
        <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded p-3 overflow-x-auto">{`A = [1 2 3 4; 0 1 2 3; 1 3 5 7];

rank(A)                  % number of pivot columns
null(A)                  % basis for null space (orthonormal)
null(A, 'r')             % rational null space basis

% Column space basis
[~, pivCols] = rref(A);
colSpaceBasis = A(:, pivCols)

% Rank-nullity check
r = rank(A);
n = size(A, 2);
fprintf('rank=%d, nullity=%d, sum=%d\\n', r, n-r, n)`}</pre>
      </div>
    </div>
  );
}

const TABS = ['Concept', 'LI / Basis stepper', 'Real world', 'Practice'];

export default function VectorSpaces() {
  const [tab, setTab] = useState(0);
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Module 5 — Vector Spaces</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Span · Linear independence · Basis · Dimension · Rank · Null space</p>
      </div>
      <div className="flex gap-1 mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors
              ${tab === i ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <ConceptPane />}
      {tab === 1 && <StepperPane />}
      {tab === 2 && <RealWorldPane />}
      {tab === 3 && <div className="space-y-3"><p className="text-sm text-slate-500 dark:text-slate-400">Work each problem by hand before revealing.</p>{PRACTICE.map((item, i) => <PracticeCard key={i} item={item} index={i} />)}</div>}
    </div>
  );
}
