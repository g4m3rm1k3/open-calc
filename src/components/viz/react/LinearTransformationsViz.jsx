import React, { useState } from 'react';

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

function matVec(A, x) {
  return A.map(row => r4(row.reduce((s, a, j) => s + a * x[j], 0)));
}
function matMul(A, B) {
  return A.map((row, i) => B[0].map((_, j) => r4(row.reduce((s, _, k) => s + A[i][k] * B[k][j], 0))));
}

// Steps for showing T(x) = Ax
function transformSteps(A, x, label = 'x') {
  const n = A.length, m = A[0].length;
  const steps = [];
  steps.push({ desc: `Apply T: compute T(${label}) = A${label}`, detail: `A is ${n}×${m}, ${label} is ${m}×1 → result is ${n}×1 vector`, phase: 'setup' });
  const partials = A.map(() => null);
  A.forEach((row, i) => {
    const terms = row.map((a, j) => `(${fmt(a)})(${fmt(x[j])})`).join(' + ');
    const val = r4(row.reduce((s, a, j) => s + a * x[j], 0));
    partials[i] = val;
    steps.push({ desc: `Row ${i+1}: ${terms} = ${fmt(val)}`, detail: `Output component ${i+1}`, phase: 'row', rowIdx: i, val, partials: [...partials] });
  });
  const result = matVec(A, x);
  steps.push({ desc: `T(${label}) = [${result.map(fmt).join(', ')}]ᵀ`, detail: 'Transformation complete.', phase: 'result', result });
  return steps;
}

const TRANSFORM_PRESETS = [
  {
    label: 'Rotation 90°',
    A: [[0,-1],[1,0]], x: [3, 1],
    context: 'T rotates every vector 90° counterclockwise. Standard matrix for 90° rotation.',
    meaning: 'Kernel = {0} (only zero vector maps to 0 — rotation is injective). Range = ℝ² (surjective). Bijective — invertible.',
  },
  {
    label: 'Projection onto x-axis',
    A: [[1,0],[0,0]], x: [3, 2],
    context: 'T projects onto the x-axis. The y-component is zeroed out.',
    meaning: 'Kernel = {[0,y]ᵀ : y∈ℝ} (all vectors on y-axis map to 0). Range = {[x,0]ᵀ} (x-axis only). Neither injective nor surjective onto ℝ².',
  },
  {
    label: 'Shear',
    A: [[1,2],[0,1]], x: [1, 1],
    context: 'Shear transformation. Slides horizontal layers. Common in CAD/animation.',
    meaning: 'Kernel = {0} only (det=1≠0 → injective). Range = ℝ² (surjective). Bijective — invertible.',
  },
  {
    label: '3D → 2D (projection)',
    A: [[1,0,0],[0,1,0]], x: [2, 3, 5],
    context: 'Projects 3D onto the xy-plane by dropping the z-component. Used in orthographic projection in CAD.',
    meaning: 'Kernel = {[0,0,z]ᵀ} = z-axis. Range = ℝ². Not injective (z-axis info lost). Not surjective onto ℝ³.',
  },
];

const PRACTICE = [
  {
    context: 'Matrix of T',
    q: 'T: ℝ² → ℝ² reflects across the y-axis (flips x-component). Write the standard matrix of T.',
    hint: 'Find T(e₁) and T(e₂). The standard matrix is [T(e₁) | T(e₂)].',
    answer: `T(e₁) = T([1,0]ᵀ) = [−1, 0]ᵀ  (x flips)
T(e₂) = T([0,1]ᵀ) = [ 0, 1]ᵀ  (y unchanged)

Standard matrix A = [T(e₁) | T(e₂)] = [−1  0]
                                        [ 0  1]

Verify: A[3,2]ᵀ = [−3, 2]ᵀ ✓ (x flipped, y same)`,
  },
  {
    context: 'Kernel and range',
    q: 'Find the kernel and range of T with matrix A. State whether T is injective, surjective, or bijective.',
    data: 'A = [ 1  2  3 ]\n    [ 4  5  6 ]\n    [ 7  8  9 ]',
    hint: 'Kernel: solve Ax=0 (null space). Range: column space. Injective ↔ ker={0} ↔ rank=n. Surjective ↔ rank=m.',
    answer: `Row reduce A:
R₂ → R₂−4R₁: [0,−3,−6]
R₃ → R₃−7R₁: [0,−6,−12]
R₃ → R₃−2R₂: [0, 0,  0]

RREF:
[ 1  0  −1 ]
[ 0  1   2 ]
[ 0  0   0 ]

rank = 2  (2 pivot cols: 1, 2)
nullity = 1  (1 free variable: x₃=t)

Kernel (null space):
x₁ = t,  x₂ = −2t,  x₃ = t
ker(T) = span{[1, −2, 1]ᵀ}  (1-dimensional)

Range (column space):
Basis = {col1 of A, col2 of A} = {[1,4,7]ᵀ, [2,5,8]ᵀ}
dim(range) = 2  (a 2D plane in ℝ³)

Injective? NO — ker ≠ {0}
Surjective onto ℝ³? NO — range is 2D, not all of ℝ³
Bijective? NO`,
  },
  {
    context: 'Composition',
    q: 'T₁ rotates 45° and T₂ scales by 3. Compute the matrix of T₂∘T₁ (apply T₁ first, then T₂). Apply it to v = [1, 0]ᵀ.',
    hint: 'T₂∘T₁ corresponds to A₂A₁. cos45°=sin45°=1/√2≈0.707.',
    answer: `A₁ (rotation 45°):
[ cos45°  −sin45° ] = [ 0.707  −0.707 ]
[ sin45°   cos45° ]   [ 0.707   0.707 ]

A₂ (scale by 3):
[ 3  0 ]
[ 0  3 ]

T₂∘T₁ matrix = A₂·A₁:
[ 3  0 ][ 0.707  −0.707 ] = [ 2.121  −2.121 ]
[ 0  3 ][ 0.707   0.707 ]   [ 2.121   2.121 ]

Apply to v = [1, 0]ᵀ:
[2.121(1)+(−2.121)(0), 2.121(1)+2.121(0)] = [2.121, 2.121]ᵀ

= [3/√2, 3/√2]ᵀ — vector scaled to length 3 and rotated 45°.`,
  },
  {
    context: 'One-to-one / onto',
    q: 'T: ℝ³ → ℝ² has matrix A = [[1,2,0],[3,4,1]]. Is T one-to-one? Onto?',
    hint: 'One-to-one (injective) ↔ ker={0} ↔ rank=n (cols). Onto (surjective) ↔ rank=m (rows).',
    answer: `A is 2×3. n=3 columns, m=2 rows.

Row reduce A:
[ 1  2  0 ]
[ 3  4  1 ]
R₂ → R₂−3R₁: [0, −2, 1]

RREF:
[ 1  0  1 ]
[ 0  1 −1/2 ]

rank = 2 = m  (2 pivots)
nullity = n − rank = 3 − 2 = 1

One-to-one? rank = 2 ≠ n = 3 → NO (nullity = 1 means
a non-trivial kernel exists)

Onto? rank = 2 = m = 2 → YES (range = all of ℝ²)

Conclusion: T is surjective but not injective.
(More inputs than outputs → many x map to same T(x))`,
  },
];

function MatGrid({ data, rowIdx = -1 }) {
  return (
    <table className="font-mono text-sm border-collapse mx-auto">
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={i === rowIdx ? 'bg-blue-50 dark:bg-blue-950/40' : ''}>
            <td className="pr-1 text-slate-400 text-xs select-none">[</td>
            {row.map((v, j) => (
              <td key={j} className={`px-2 py-1 text-center min-w-[38px] ${i === rowIdx ? 'text-blue-700 dark:text-blue-300 font-semibold' : v === 0 ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{fmt(v)}</td>
            ))}
            <td className="pl-1 text-slate-400 text-xs select-none">]</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VecDisplay({ v, label, color = 'text-blue-600 dark:text-blue-400' }) {
  return <span className="font-mono text-sm"><span className={`font-semibold ${color}`}>{label}</span> = [{v.map(fmt).join(', ')}]ᵀ</span>;
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
  const preset = TRANSFORM_PRESETS[pi];
  const steps = transformSteps(preset.A, preset.x);
  const cur = steps[si];

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {TRANSFORM_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>{p.label}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <p className="text-xs font-semibold text-center text-slate-500 mb-2">Matrix A (standard matrix of T)</p>
          <MatGrid data={preset.A} rowIdx={cur.phase === 'row' ? cur.rowIdx : -1} />
        </div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <p className="text-xs font-semibold text-center text-slate-500 mb-2">Input x / Output so far</p>
          <div className="text-center space-y-2">
            <VecDisplay v={preset.x} label="x" color="text-blue-600 dark:text-blue-400" />
            {cur.partials && (
              <div className="font-mono text-xs">
                {cur.partials.map((v, i) => (
                  <div key={i} className={`${v !== null ? 'text-green-700 dark:text-green-400' : 'text-slate-400'}`}>
                    {v !== null ? `y${i+1} = ${fmt(v)}` : `y${i+1} = ?`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[80px]">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{cur.desc}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{cur.detail}</p>
        {cur.result && <div className="mt-2"><VecDisplay v={cur.result} label="T(x)" color="text-green-700 dark:text-green-400" /></div>}
      </div>
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold">Kernel / Range: </span>{preset.meaning}
      </div>
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
        <p>A linear transformation is a function between vector spaces that preserves the structure of those spaces — it respects addition and scalar multiplication. Every matrix IS a linear transformation. Understanding transformations lets you see what a matrix actually does geometrically: rotates, stretches, projects, collapses.</p>
      </div>
      {[
        { term: 'Linear transformation', def: 'T: V→W is linear if T(u+v)=T(u)+T(v) and T(cu)=cT(u) for all u,v and scalars c. Consequence: T(0)=0 always. Lines through origin map to lines through origin.' },
        { term: 'Standard matrix', def: 'Every linear T: ℝⁿ→ℝᵐ can be written T(x)=Ax for some m×n matrix A. To find A: A = [T(e₁) | T(e₂) | ... | T(eₙ)]. Apply T to each standard basis vector; the results are the columns.' },
        { term: 'Kernel (null space)', def: 'ker(T) = {x ∈ V : T(x) = 0} — all inputs that map to the zero vector. For T(x)=Ax, this is the null space of A. dim(ker T) = nullity.' },
        { term: 'Range (image)', def: 'range(T) = {T(x) : x ∈ V} — all possible outputs. For T(x)=Ax, this is the column space of A. dim(range T) = rank.' },
        { term: 'Rank-Nullity for T', def: 'dim(ker T) + dim(range T) = dim(domain). Same theorem, transformation language.' },
        { term: 'Injective (one-to-one)', def: 'T(u)=T(v) → u=v. Equivalent: ker(T)={0}. Equivalent: rank=n (columns). No two inputs produce the same output.' },
        { term: 'Surjective (onto)', def: 'range(T) = codomain. Equivalent: rank=m (rows). Every possible output is reachable.' },
        { term: 'Bijective (invertible)', def: 'Both injective and surjective. Equivalent: A is square and invertible (det≠0). T⁻¹ exists.' },
        { term: 'Composition', def: 'T₂∘T₁(x) = T₂(T₁(x)). The standard matrix is A₂A₁ (note order). Apply T₁ first → right to left multiplication.' },
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
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Every geometric operation in software is a linear transformation</p>
        <p>Rotation, scaling, reflection, shear, projection — all linear transformations. The matrix is how the computer stores and applies them. Composition of transformations = matrix multiplication. Inverting a transformation = matrix inverse.</p>
      </div>
      {[
        {
          title: '3D graphics pipeline — camera projection',
          body: 'Converting 3D world coordinates to 2D screen pixels involves a chain of linear transformations: model transform → view transform → projection → viewport. Each is a matrix multiply. The composition is computed once as a single 4×4 matrix applied to every vertex.',
          code: `% 4×4 homogeneous transformation matrices
M_model = rotate * scale * translate;
M_view  = inv(camera_transform);
M_proj  = projection_matrix;

MVP = M_proj * M_view * M_model;  % composed once
% Then for each vertex v:
screen_v = MVP * v;`,
        },
        {
          title: 'CAD — change of coordinate systems',
          body: 'When a part is defined in its local coordinate system (part space) but needs to be positioned in world space, you apply a transformation. The kernel of that transformation is always just {0} (rigid body motion is injective). The range is all of ℝ³ (surjective). The matrix is orthogonal (rotation + translation).',
          code: `% Transform point from part frame to world frame
R = rotation_matrix(roll, pitch, yaw);
t = translation_vector;
% Homogeneous: [R t; 0 1] * [x; 1] = [Rx+t; 1]
T = [R t; 0 0 0 1];
p_world = T * [p_part; 1];`,
        },
        {
          title: 'Signal processing — linear filters',
          body: 'Convolution with a filter kernel is a linear transformation on the signal vector. The kernel of a low-pass filter (all inputs that produce zero output) is the space of high-frequency signals. The range is the space of low-frequency signals. Rank = bandwidth.',
          code: `% Finite impulse response filter as matrix multiply
H = toeplitz(h, [h(1) zeros(1,N-1)]);  % filter matrix
y = H * x;  % filtered signal
% Null space of H = signals the filter blocks`,
        },
      ].map(item => (
        <div key={item.title} className="space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
          <p className="text-xs">{item.body}</p>
          <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded p-3 overflow-x-auto">{item.code}</pre>
        </div>
      ))}
    </div>
  );
}

const TABS = ['Concept', 'Transform stepper', 'Real world', 'Practice'];

export default function LinearTransformations() {
  const [tab, setTab] = useState(0);
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Module 6 — Linear Transformations</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Standard matrix · Kernel · Range · Injective / Surjective · Composition</p>
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
