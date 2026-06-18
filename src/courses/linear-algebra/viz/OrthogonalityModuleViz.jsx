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
function dot(a, b) { return r4(a.reduce((s, x, i) => s + x * b[i], 0)); }
function norm(v) { return Math.sqrt(v.reduce((s, x) => s + x * x, 0)); }
function scale(v, k) { return v.map(x => r4(x * k)); }
function sub(a, b) { return a.map((x, i) => r4(x - b[i])); }
function add(a, b) { return a.map((x, i) => r4(x + b[i])); }

// Gram-Schmidt steps
function gramSchmidtSteps(vecs) {
  const steps = [];
  steps.push({ desc: 'Gram-Schmidt: convert independent vectors to orthonormal basis', detail: 'For each vector: subtract its projections onto all previous basis vectors, then normalize.', qs: [], us: [] });
  const us = []; // orthogonal (not yet normalized)
  const qs = []; // orthonormal

  vecs.forEach((v, i) => {
    steps.push({
      desc: `Step ${i+1}: process v${i+1} = [${v.map(fmt).join(', ')}]ᵀ`,
      detail: i === 0 ? 'First vector: no projections to subtract.' : `Subtract projections onto q₁ through q${i}.`,
      qs: qs.map(q => [...q]), us: us.map(u => [...u]), vi: v,
    });

    let u = [...v];
    const projTerms = [];
    qs.forEach((q, j) => {
      const proj = dot(v, q);
      projTerms.push({ q: [...q], proj, term: scale(q, proj) });
      u = sub(u, scale(q, proj));
      steps.push({
        desc: `  Remove component along q${j+1}: proj = (v${i+1}·q${j+1}) = ${fmt(dot(v,q))}`,
        detail: `proj_q${j+1}(v${i+1}) = ${fmt(dot(v,q))} × [${q.map(fmt).join(',')}]\nu${i+1} ← u${i+1} − ${fmt(dot(v,q))}×q${j+1} = [${u.map(fmt).join(', ')}]`,
        qs: qs.map(q => [...q]), us: [...us, u], proj: dot(v, q), qj: [...q], vi: v,
      });
    });

    us.push([...u]);
    const n = r4(norm(u));
    const q = n > 1e-9 ? u.map(x => r4(x / n)) : u;
    qs.push(q);

    steps.push({
      desc: `  Normalize: ‖u${i+1}‖ = ${fmt(n)}  →  q${i+1} = u${i+1} / ${fmt(n)}`,
      detail: `q${i+1} = [${q.map(fmt).join(', ')}]ᵀ\n‖q${i+1}‖ = ${fmt(r4(norm(q)))} (should be 1)`,
      qs: qs.map(q => [...q]), us: us.map(u => [...u]), qi: q, n,
    });
  });

  steps.push({
    desc: 'Orthonormal basis complete',
    detail: `Q = [${qs.map((q,i) => `q${i+1}`).join(' | ')}]\n\nQ columns are orthonormal: qᵢ·qⱼ=0 for i≠j, ‖qᵢ‖=1\nQᵀQ = I`,
    qs: qs.map(q => [...q]), us: us.map(u => [...u]), done: true,
  });

  return { steps, qs };
}

// Projection steps
function projectionSteps(v, basis) {
  const steps = [];
  steps.push({ desc: 'Project v onto a subspace W = span of given basis', detail: 'First check/make the basis orthogonal. Then: proj_W(v) = Σ (v·qᵢ/qᵢ·qᵢ) qᵢ', phase: 'setup' });
  let proj = new Array(v.length).fill(0);
  basis.forEach((b, i) => {
    const num = dot(v, b);
    const den = dot(b, b);
    const coeff = r4(num / den);
    const term = scale(b, coeff);
    proj = add(proj, term);
    steps.push({
      desc: `Component along b${i+1}: (v·b${i+1})/(b${i+1}·b${i+1}) = ${fmt(num)}/${fmt(den)} = ${fmt(coeff)}`,
      detail: `${fmt(coeff)} × [${b.map(fmt).join(', ')}] = [${term.map(fmt).join(', ')}]`,
      phase: 'component', coeff, term, projSoFar: [...proj],
    });
  });
  const err = sub(v, proj);
  steps.push({
    desc: `proj_W(v) = [${proj.map(fmt).join(', ')}]ᵀ`,
    detail: `Error vector e = v − proj = [${err.map(fmt).join(', ')}]ᵀ\nVerify e ⊥ proj: e·proj = ${fmt(dot(err, proj))} (should be ≈ 0)`,
    phase: 'result', proj, err,
  });
  return steps;
}

const GS_PRESETS = [
  {
    label: '2D example',
    vecs: [[3, 1], [2, 2]],
    context: 'Two independent vectors in ℝ². Result: orthonormal basis for ℝ².',
  },
  {
    label: '3D example',
    vecs: [[1, 1, 0], [1, 0, 1], [0, 1, 1]],
    context: 'Three independent vectors in ℝ³. Watch each successive projection.',
  },
  {
    label: 'Already orthogonal',
    vecs: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    context: 'Standard basis. Already orthonormal — G-S makes no changes (projections are all zero).',
  },
];

const PROJ_PRESETS = [
  {
    label: 'Onto a line',
    v: [3, 4, 0],
    basis: [[1, 0, 0]],
    context: 'Project [3,4,0] onto the x-axis. Result should be [3,0,0].',
  },
  {
    label: 'Onto a plane',
    v: [1, 1, 3],
    basis: [[1, 0, 0], [0, 1, 0]],
    context: 'Project onto the xy-plane. Result drops the z-component.',
  },
  {
    label: 'Non-axis subspace',
    v: [3, 2, 1],
    basis: [[1, 1, 0], [0, 0, 1]],
    context: 'Basis vectors are orthogonal but not standard — projection still works.',
  },
];

const PRACTICE = [
  {
    context: 'Projection',
    q: 'Find the projection of v onto u. Then find the error vector and verify it is perpendicular to u.',
    data: 'v = [3, 4]ᵀ    u = [1, 0]ᵀ',
    hint: 'proj_u(v) = (v·u / u·u) × u',
    answer: `v·u = (3)(1)+(4)(0) = 3
u·u = (1)(1)+(0)(0) = 1

proj_u(v) = (3/1) × [1,0]ᵀ = [3, 0]ᵀ

Error e = v − proj = [3,4]−[3,0] = [0, 4]ᵀ

Verify: e·u = (0)(1)+(4)(0) = 0 ✓  perpendicular`,
  },
  {
    context: 'Gram-Schmidt',
    q: 'Apply Gram-Schmidt to find an orthonormal basis for the column space.',
    data: 'v₁ = [1, 1, 1]ᵀ    v₂ = [1, 1, 0]ᵀ    v₃ = [1, 0, 0]ᵀ',
    hint: 'u₁=v₁, normalize → q₁. u₂=v₂−(v₂·q₁)q₁, normalize → q₂. u₃=v₃−(v₃·q₁)q₁−(v₃·q₂)q₂, normalize → q₃.',
    answer: `Step 1: u₁ = v₁ = [1,1,1]ᵀ
‖u₁‖ = √3
q₁ = [1/√3, 1/√3, 1/√3]ᵀ

Step 2: v₂·q₁ = (1+1+0)/√3 = 2/√3
u₂ = v₂ − (2/√3)q₁ = [1,1,0]−(2/3)[1,1,1]
   = [1−2/3, 1−2/3, 0−2/3] = [1/3, 1/3, −2/3]ᵀ
‖u₂‖ = √(1/9+1/9+4/9) = √(6/9) = √6/3
q₂ = [1/√6, 1/√6, −2/√6]ᵀ

Step 3: v₃·q₁ = 1/√3,  v₃·q₂ = 1/√6
u₃ = v₃ − (1/√3)q₁ − (1/√6)q₂
   = [1,0,0]−(1/3)[1,1,1]−(1/6)[1,1,−2]
   = [1−1/3−1/6, −1/3−1/6, −1/3+2/6]
   = [1/2, −1/2, 0]ᵀ
‖u₃‖ = √(1/4+1/4) = 1/√2
q₃ = [1/√2, −1/√2, 0]ᵀ`,
  },
  {
    context: 'QR decomposition',
    q: 'From the Gram-Schmidt result in problem 2, write A = QR. What are Q and R?',
    hint: 'Q = [q₁|q₂|q₃]. R is upper triangular: R[i,j] = qᵢ·vⱼ for j≥i, 0 for j<i.',
    answer: `Q = [q₁ | q₂ | q₃]

Q = [ 1/√3   1/√6   1/√2 ]
    [ 1/√3   1/√6  −1/√2 ]
    [ 1/√3  −2/√6    0   ]

R[i,j] = qᵢ · vⱼ  (upper triangular):

R[1,1] = q₁·v₁ = √3
R[1,2] = q₁·v₂ = 2/√3
R[1,3] = q₁·v₃ = 1/√3
R[2,2] = q₂·v₂ = √6/3 × ... = √(6)/3
R[2,3] = q₂·v₃ = 1/√6
R[3,3] = q₃·v₃ = 1/√2

     [ √3    2/√3   1/√3 ]
R =  [  0    √6/3   1/√6 ]
     [  0      0    1/√2 ]

A = QR  (verify: Q is orthogonal (QᵀQ=I), R is upper triangular)`,
  },
  {
    context: 'Orthogonal matrix',
    q: 'Show that Q = [[cos θ, −sin θ],[sin θ, cos θ]] is an orthogonal matrix. What does QᵀQ = I mean geometrically?',
    hint: 'An orthogonal matrix satisfies QᵀQ = I, equivalently Qᵀ = Q⁻¹. Columns must be orthonormal.',
    answer: `Qᵀ = [ cos θ   sin θ ]
     [−sin θ  cos θ ]

QᵀQ = [ cos θ   sin θ ][cos θ  −sin θ]
      [−sin θ  cos θ ][sin θ   cos θ]

[1,1]: cos²θ + sin²θ = 1 ✓
[1,2]: −cosθsinθ + sinθcosθ = 0 ✓
[2,1]: −sinθcosθ + cosθsinθ = 0 ✓
[2,2]: sin²θ + cos²θ = 1 ✓

QᵀQ = I ✓  →  Q is orthogonal

Geometrically: QᵀQ = I means Q⁻¹ = Qᵀ.
Rotation is its own inverse (rotate by −θ = rotate by θᵀ).
‖Qx‖ = ‖x‖ for all x — rotations preserve length.
det(Q) = cos²θ + sin²θ = 1 — preserves orientation.`,
  },
];

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

function GSPane() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = GS_PRESETS[pi];
  const { steps } = gramSchmidtSteps(preset.vecs);
  const cur = steps[si];
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {GS_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>{p.label}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>
      <div className="flex gap-2 flex-wrap text-xs font-mono">
        {preset.vecs.map((v, i) => <span key={i} className="bg-slate-50 dark:bg-slate-900 rounded px-2 py-1 text-slate-700 dark:text-slate-300">v{i+1}=[{v.map(fmt).join(',')}]</span>)}
      </div>
      {cur.qs && cur.qs.length > 0 && (
        <div className="flex gap-2 flex-wrap text-xs font-mono">
          {cur.qs.map((q, i) => <span key={i} className="bg-green-50 dark:bg-green-950/30 rounded px-2 py-1 text-green-700 dark:text-green-400">q{i+1}=[{q.map(fmt).join(',')}]</span>)}
        </div>
      )}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[100px]">
        <p className="text-xs text-center text-slate-400 mb-1">Step {si+1} of {steps.length}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{cur.desc}</p>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{cur.detail}</p>
        {cur.qi && <div className="mt-2 font-mono text-sm text-green-700 dark:text-green-400 font-semibold">q = [{cur.qi.map(fmt).join(', ')}]ᵀ  (‖q‖ = {fmt(r4(norm(cur.qi)))})</div>}
        {cur.done && <p className="mt-2 text-xs font-semibold text-green-700 dark:text-green-400">✓ QᵀQ = I  (verify: dot any two qs → 0, dot each q with itself → 1)</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setSi(i => Math.max(0, i-1))} disabled={si===0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300">← Prev</button>
        <button onClick={() => setSi(i => Math.min(steps.length-1, i+1))} disabled={si===steps.length-1} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
      <ProgressDots total={steps.length} current={si} onJump={setSi} />
    </div>
  );
}

function ProjPane() {
  const [pi, setPi] = useState(0);
  const [si, setSi] = useState(0);
  const preset = PROJ_PRESETS[pi];
  const steps = projectionSteps(preset.v, preset.basis);
  const cur = steps[si];
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {PROJ_PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>{p.label}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>
      <div className="flex gap-3 flex-wrap text-xs font-mono">
        <span className="bg-blue-50 dark:bg-blue-950/30 rounded px-2 py-1 text-blue-700 dark:text-blue-400">v=[{preset.v.map(fmt).join(',')}]</span>
        {preset.basis.map((b, i) => <span key={i} className="bg-slate-50 dark:bg-slate-900 rounded px-2 py-1 text-slate-700 dark:text-slate-300">b{i+1}=[{b.map(fmt).join(',')}]</span>)}
      </div>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[100px]">
        <p className="text-xs text-center text-slate-400 mb-1">Step {si+1} of {steps.length}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{cur.desc}</p>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{cur.detail}</p>
        {cur.projSoFar && <div className="mt-1 font-mono text-xs text-violet-600 dark:text-violet-400">running proj = [{cur.projSoFar.map(fmt).join(', ')}]</div>}
        {cur.phase === 'result' && (
          <div className="mt-2 space-y-1">
            <div className="font-mono text-sm font-semibold text-green-700 dark:text-green-400">proj = [{cur.proj.map(fmt).join(', ')}]ᵀ</div>
            <div className="font-mono text-sm text-slate-500 dark:text-slate-400">error e = [{cur.err.map(fmt).join(', ')}]ᵀ</div>
          </div>
        )}
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
        <p>Orthogonality makes computation stable and efficient. Orthogonal bases make projections trivial (just dot products). The QR decomposition underlies numerical linear algebra (least squares solvers, eigenvalue algorithms). Orthonormal coordinate systems are how sensors, cameras, and robots describe the world.</p>
      </div>
      {[
        { term: 'Orthogonal vectors', def: 'u ⊥ v ↔ u·v = 0. Orthogonal basis: all pairs orthogonal. Orthonormal: additionally ‖qᵢ‖=1 for all i.' },
        { term: 'Projection of v onto u', def: 'proj_u(v) = (v·u / u·u) × u. This is the component of v in the direction of u. The error v − proj_u(v) is perpendicular to u.' },
        { term: 'Projection onto subspace W', def: 'proj_W(v) = Σ (v·qᵢ) qᵢ  if {q₁,...,qₖ} is an orthonormal basis for W. If basis is not orthonormal: use projection matrix P = A(AᵀA)⁻¹Aᵀ.' },
        { term: 'Gram-Schmidt process', def: 'Converts any independent set {v₁,...,vₖ} into an orthonormal set {q₁,...,qₖ} spanning the same space. Each new vector has previous directions subtracted off, then normalized.' },
        { term: 'QR decomposition', def: 'A = QR where Q has orthonormal columns (from Gram-Schmidt) and R is upper triangular. R[i,j] = qᵢ·vⱼ (the projection coefficients). Fundamental to solving least squares numerically.' },
        { term: 'Orthogonal matrix Q', def: 'Square matrix with orthonormal columns: QᵀQ = I, so Q⁻¹ = Qᵀ. det(Q) = ±1. Preserves lengths: ‖Qx‖ = ‖x‖. Examples: rotation matrices, reflection matrices.' },
        { term: 'Orthogonal complement W⊥', def: 'W⊥ = all vectors perpendicular to every vector in W. ℝⁿ = W ⊕ W⊥ (every vector splits uniquely into W-component + W⊥-component). dim(W) + dim(W⊥) = n.' },
      ].map(({ term, def }) => (
        <div key={term} className="flex gap-3 bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
          <span className="font-semibold text-violet-700 dark:text-violet-400 min-w-[150px] shrink-0 text-xs leading-relaxed pt-0.5">{term}</span>
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
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Orthogonal = numerically stable = used everywhere in practice</p>
        <p>Orthogonal matrices are the gold standard for numerical computation because they don't amplify errors. QR decomposition is preferred over Gaussian elimination for least squares because Q preserves norms. Gram-Schmidt is how sensor fusion algorithms build coordinate frames.</p>
      </div>
      {[
        {
          title: 'IMU sensor fusion — building an orthonormal frame',
          body: 'An inertial measurement unit (IMU) measures accelerations and rotations. To align sensor data with world coordinates, a orthonormal frame must be built from noisy sensor vectors. Gram-Schmidt (or a numerically stable variant) converts the raw measurements into a proper rotation matrix.',
          code: `% Raw sensor vectors (may not be exactly orthogonal due to noise)
g = normalize(accelerometer);    % gravity direction
m = magnetometer;                 % north direction

% Build orthonormal frame via Gram-Schmidt
e3 = g;                          % z-axis = gravity
e2 = cross(g, m); e2 = e2/norm(e2);   % east
e1 = cross(e2, e3);              % north

R = [e1, e2, e3];  % rotation matrix to world frame`,
        },
        {
          title: 'QR decomposition — numerical least squares',
          body: 'MATLAB\'s backslash operator uses QR decomposition internally when solving overdetermined systems (least squares). QR is preferred over the normal equations (AᵀAx=Aᵀb) because it is numerically stable even when AᵀA is nearly singular.',
          code: `A = feature_matrix;    % m×n, m > n (overdetermined)
b = measurements;

% Direct solve (uses QR internally)
x = A \\ b;

% Explicit QR approach:
[Q, R] = qr(A, 0);   % economy QR
x = R \\ (Q' * b);    % numerically stable`,
        },
        {
          title: 'CAD — projecting a point onto a plane',
          body: 'Given a plane defined by a normal vector n and a point p₀ on the plane, the projection of any point p onto that plane is computed exactly as the vector projection formula.',
          code: `n = plane_normal / norm(plane_normal);  % unit normal
p0 = point_on_plane;
p = query_point;

% Project onto plane
d = dot(p - p0, n);     % signed distance to plane
proj = p - d * n;       % closest point on plane

% Error = component perpendicular to plane
error = d * n;          % = d along normal`,
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
        <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded p-3 overflow-x-auto">{`% Projection
v = [3;4;0]; u = [1;0;0];
proj = (dot(v,u)/dot(u,u)) * u

% Gram-Schmidt (manual)
[Q, R] = qr(A)         % QR decomposition
% Q has orthonormal columns, R is upper triangular

% Orthogonal matrix check
Q = [cos(t) -sin(t); sin(t) cos(t)];
Q' * Q                  % should be identity
det(Q)                  % should be ±1
norm(Q*v) - norm(v)     % should be ~0 (length preserved)

% Project onto column space of A
P = A * inv(A'*A) * A'; % projection matrix
proj = P * b;           % project b onto Col(A)`}</pre>
      </div>
    </div>
  );
}

const TABS = ['Concept', 'Gram-Schmidt', 'Projection', 'Real world', 'Practice'];

export default function OrthogonalityModule() {
  const [tab, setTab] = useState(0);
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Module 8 — Orthogonality &amp; Gram-Schmidt</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Projections · Gram-Schmidt · QR decomposition · Orthogonal matrices</p>
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
      {tab === 1 && <GSPane />}
      {tab === 2 && <ProjPane />}
      {tab === 3 && <RealWorldPane />}
      {tab === 4 && <div className="space-y-3"><p className="text-sm text-slate-500 dark:text-slate-400">Work each problem by hand before revealing.</p>{PRACTICE.map((item, i) => <PracticeCard key={i} item={item} index={i} />)}</div>}
    </div>
  );
}
