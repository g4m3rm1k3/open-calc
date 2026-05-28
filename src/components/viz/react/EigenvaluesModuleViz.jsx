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
function det2(A) { return r4(A[0][0]*A[1][1] - A[0][1]*A[1][0]); }
function det3(A) {
  return r4(
    A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])
    - A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])
    + A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0])
  );
}

// Eigenvalue steps for 2×2
function eigenSteps2(A) {
  const steps = [];
  const [[a,b],[c,d]] = A;
  steps.push({ desc: 'Form the characteristic equation: det(A − λI) = 0', detail: `For a 2×2 matrix, expand det(A−λI) as a polynomial in λ. Roots = eigenvalues.`, phase: 'setup' });

  steps.push({
    desc: 'Write A − λI',
    detail: `A − λI = [ ${fmt(a)}−λ  ${fmt(b)} ]\n         [ ${fmt(c)}   ${fmt(d)}−λ ]`,
    phase: 'matrix',
  });

  const tr = r4(a + d), dt = det2(A);
  const charPoly = `λ² − (${fmt(tr)})λ + (${fmt(dt)}) = 0`;
  steps.push({
    desc: `det(A−λI) = (${fmt(a)}−λ)(${fmt(d)}−λ) − (${fmt(b)})(${fmt(c)})`,
    detail: `= λ² − ${fmt(tr)}λ + ${fmt(dt)}\n\nCharacteristic polynomial: ${charPoly}`,
    phase: 'poly', tr, dt,
  });

  const disc = r4(tr*tr - 4*dt);
  steps.push({
    desc: `Solve using quadratic formula`,
    detail: `λ = (${fmt(tr)} ± √(${fmt(tr)}² − 4×${fmt(dt)})) / 2\n  = (${fmt(tr)} ± √${fmt(disc)}) / 2`,
    phase: 'solve', disc,
  });

  if (disc < 0) {
    steps.push({ desc: 'Discriminant < 0 → complex eigenvalues', detail: 'No real eigenvalues. Matrix has a rotational component.', phase: 'complex' });
    return steps;
  }

  const sqrtD = Math.sqrt(disc);
  const λ1 = r4((tr + sqrtD) / 2), λ2 = r4((tr - sqrtD) / 2);
  steps.push({
    desc: `Eigenvalues: λ₁ = ${fmt(λ1)},  λ₂ = ${fmt(λ2)}`,
    detail: `λ₁ = (${fmt(tr)} + ${fmt(sqrtD)}) / 2 = ${fmt(λ1)}\nλ₂ = (${fmt(tr)} − ${fmt(sqrtD)}) / 2 = ${fmt(λ2)}`,
    phase: 'eigenvalues', λ1, λ2,
  });

  // Eigenvectors
  [λ1, λ2].forEach((λ, idx) => {
    const M = [[r4(a-λ), b],[c, r4(d-λ)]];
    steps.push({
      desc: `Eigenvector for λ${idx+1} = ${fmt(λ)}: solve (A − ${fmt(λ)}I)x = 0`,
      detail: `A − ${fmt(λ)}I = [ ${fmt(M[0][0])}  ${fmt(M[0][1])} ]\n              [ ${fmt(M[1][0])}  ${fmt(M[1][1])} ]`,
      phase: 'eigvec_setup', lambda: λ, idx,
    });
    // Free variable solution
    let evec;
    if (Math.abs(M[0][0]) > 1e-9 || Math.abs(M[0][1]) > 1e-9) {
      if (Math.abs(M[0][0]) > 1e-9) {
        evec = [r4(-M[0][1]/M[0][0]), 1];
      } else {
        evec = [1, 0];
      }
    } else {
      evec = [1, 0];
    }
    steps.push({
      desc: `Eigenvector v${idx+1} = [${evec.map(fmt).join(', ')}]ᵀ  (spans eigenspace for λ = ${fmt(λ)})`,
      detail: `Row reduce (A−λI) → one free variable. Eigenvector is the direction that A stretches by factor ${fmt(λ)}.`,
      phase: 'eigvec', lambda: λ, evec, idx,
    });
  });

  const diagonalizable = Math.abs(λ1 - λ2) > 1e-9;
  steps.push({
    desc: diagonalizable ? 'A is diagonalizable: A = PDP⁻¹' : 'Repeated eigenvalue — check geometric multiplicity',
    detail: diagonalizable
      ? `P = [v₁ | v₂] (eigenvectors as columns)\nD = diag(${fmt(λ1)}, ${fmt(λ2)}) (eigenvalues on diagonal)\nA = PDP⁻¹  →  Aᵏ = PDᵏP⁻¹`
      : `Repeated eigenvalue. Diagonalizable only if eigenspace is 2-dimensional.`,
    phase: 'diag', λ1, λ2, diagonalizable,
  });

  return steps;
}

// 3×3 eigenvalue steps (characteristic polynomial)
function eigenSteps3(A) {
  const steps = [];
  steps.push({ desc: 'det(A − λI) = 0 gives a degree-3 polynomial', detail: 'For 3×3: expand det(A−λI). Factor or use known roots. Usually a cubic in λ.', phase: 'setup' });
  const d = det3(A);
  const tr = r4(A[0][0]+A[1][1]+A[2][2]);
  // cofactor sum (sum of 2×2 principal minors)
  const m1 = det2([[A[1][1],A[1][2]],[A[2][1],A[2][2]]]);
  const m2 = det2([[A[0][0],A[0][2]],[A[2][0],A[2][2]]]);
  const m3 = det2([[A[0][0],A[0][1]],[A[1][0],A[1][1]]]);
  const c2 = r4(m1+m2+m3);
  steps.push({
    desc: 'Characteristic polynomial: −λ³ + tr(A)λ² − (sum of 2×2 minors)λ + det(A) = 0',
    detail: `tr(A) = ${fmt(tr)}\nSum of principal 2×2 minors = ${fmt(c2)}\ndet(A) = ${fmt(d)}\n\n−λ³ + ${fmt(tr)}λ² − ${fmt(c2)}λ + ${fmt(d)} = 0`,
    phase: 'poly', tr, c2, d,
  });
  steps.push({
    desc: 'Factor the cubic to find eigenvalues',
    detail: 'Try integer roots with rational root theorem. For each root λᵢ, factor (λ−λᵢ) out and find the remaining quadratic. Or use MATLAB: eig(A).',
    phase: 'factor',
  });
  steps.push({
    desc: 'For each eigenvalue λᵢ: solve (A−λᵢI)x = 0',
    detail: 'Row reduce (A−λᵢI). Free variables give the eigenvectors. The eigenspace dim = nullity of (A−λᵢI) = geometric multiplicity.',
    phase: 'eigvec',
  });
  steps.push({
    desc: 'Diagonalizable ↔ n linearly independent eigenvectors',
    detail: 'If all eigenvalues are distinct → always diagonalizable.\nIf repeated eigenvalue → diagonalizable only if geometric multiplicity = algebraic multiplicity.\n\nA = PDP⁻¹ where P = [eigenvectors], D = diag(eigenvalues)',
    phase: 'diag',
  });
  return steps;
}

const PRESETS = [
  { label: '2×2 distinct', A: [[3,1],[2,4]], context: 'Two distinct real eigenvalues. Eigenvectors are independent → diagonalizable.' },
  { label: '2×2 rotation', A: [[0,-1],[1,0]], context: '90° rotation. Discriminant < 0 → complex eigenvalues. No real eigenspaces.' },
  { label: '2×2 repeated', A: [[2,1],[0,2]], context: 'Repeated eigenvalue λ=2. Only one independent eigenvector → NOT diagonalizable.' },
  { label: '3×3 (overview)', A: [[1,2,0],[0,3,0],[0,2,1]], context: '3×3 example. Upper triangular — eigenvalues are the diagonal entries!' },
];

const PRACTICE = [
  {
    context: 'Characteristic equation — 2×2',
    q: 'Find the eigenvalues and eigenvectors of A.',
    data: 'A = [ 4   1 ]\n    [ 2   3 ]',
    hint: 'det(A−λI) = (4−λ)(3−λ) − 2 = 0. Expand and factor.',
    answer: `det(A−λI) = (4−λ)(3−λ) − (1)(2)
= 12 − 7λ + λ² − 2
= λ² − 7λ + 10 = 0
= (λ−5)(λ−2) = 0

Eigenvalues: λ₁ = 5,  λ₂ = 2

Eigenvector for λ₁=5:
(A−5I)x=0: [−1  1][x]=0 → x₁=x₂ → v₁=[1,1]ᵀ
            [ 2 −2]

Eigenvector for λ₂=2:
(A−2I)x=0: [2  1][x]=0 → 2x₁+x₂=0 → v₂=[1,−2]ᵀ
            [2  1]

Check: A[1,1]ᵀ = [4+1, 2+3] = [5,5] = 5[1,1]ᵀ ✓
       A[1,−2]ᵀ = [4−2, 2−6] = [2,−4] = 2[1,−2]ᵀ ✓`,
  },
  {
    context: 'Diagonalization',
    q: 'Using the eigenvalues and eigenvectors from problem 1, write A = PDP⁻¹. Then compute A³ using A³ = PD³P⁻¹.',
    hint: 'P = [v₁|v₂], D = diag(λ₁,λ₂). D³ = diag(λ₁³,λ₂³). Compute P⁻¹ with the 2×2 formula.',
    answer: `P = [1   1]    D = [5  0]
    [1  −2]        [0  2]

det(P) = (1)(−2)−(1)(1) = −3

P⁻¹ = (1/−3)[−2  −1] = [2/3   1/3]
             [−1   1]   [1/3  −1/3]

A³ = PD³P⁻¹

D³ = [5³  0 ] = [125  0]
     [0   2³]   [0    8]

PD³ = [1   1][125  0] = [125   8]
      [1  −2][0    8]   [125  −16]

A³ = PD³P⁻¹ = [125   8][2/3   1/3]
               [125 −16][1/3  −1/3]

A³[row1] = [125(2/3)+8(1/3),  125(1/3)+8(−1/3)]
         = [250/3+8/3,  125/3−8/3]
         = [258/3,  117/3] = [86, 39]

A³[row2] = [125(2/3)+(−16)(1/3),  125(1/3)+(−16)(−1/3)]
         = [250/3−16/3,  125/3+16/3]
         = [234/3,  141/3] = [78, 47]

A³ = [86  39]
     [78  47]`,
  },
  {
    context: 'Upper triangular eigenvalues',
    q: 'What are the eigenvalues of this matrix? No calculation needed — state the rule and why it works.',
    data: 'B = [ 3   2   5 ]\n    [ 0  −1   4 ]\n    [ 0   0   7 ]',
    hint: 'What is det(B−λI)? Think about what the matrix looks like after you subtract λ from the diagonal.',
    answer: `For any triangular matrix, the eigenvalues ARE the diagonal entries.

Why: B−λI is also upper triangular with diagonal entries (3−λ), (−1−λ), (7−λ).
det of triangular = product of diagonal:
det(B−λI) = (3−λ)(−1−λ)(7−λ) = 0

Setting each factor to zero:
λ₁ = 3,  λ₂ = −1,  λ₃ = 7

No expansion needed — just read the diagonal!
This also applies to lower triangular and diagonal matrices.`,
  },
  {
    context: 'Markov chains / real world',
    q: 'A system has transition matrix A = [[0.9, 0.1],[0.2, 0.8]]. The dominant eigenvalue tells you the long-run behavior. Find eigenvalues, and state which eigenvector is the steady state.',
    hint: 'A stochastic matrix always has λ₁=1 as its largest eigenvalue. The corresponding eigenvector (normalized) is the steady-state distribution.',
    answer: `det(A−λI) = (0.9−λ)(0.8−λ) − (0.1)(0.2)
= 0.72 − 1.7λ + λ² − 0.02
= λ² − 1.7λ + 0.70 = 0

Quadratic formula:
λ = (1.7 ± √(2.89 − 2.80)) / 2
  = (1.7 ± √0.09) / 2
  = (1.7 ± 0.3) / 2

λ₁ = 1.0,  λ₂ = 0.7

Eigenvector for λ₁=1:
(A−I)x=0: [−0.1  0.1][x]=0 → x₁=x₂
           [0.2  −0.2]

v₁ = [1, 1]ᵀ → normalized: [0.5, 0.5]ᵀ

Steady state: 50% in state 1, 50% in state 2.
Aⁿ → P[steady state] as n→∞ (λ₂=0.7 < 1 decays away).`,
  },
];

function MatGrid({ data, rowIdx = -1 }) {
  return (
    <table className="font-mono text-sm border-collapse mx-auto">
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            <td className="pr-1 text-slate-400 text-xs select-none">[</td>
            {row.map((v, j) => (
              <td key={j} className={`px-2 py-1 text-center min-w-[38px] ${v === 0 ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{fmt(v)}</td>
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
  const preset = PRESETS[pi];
  const is3x3 = preset.A.length === 3;
  const steps = is3x3 ? eigenSteps3(preset.A) : eigenSteps2(preset.A);
  const cur = steps[si];
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPi(i); setSi(0); }}
            className={`px-3 py-1 rounded text-xs ${i === pi ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>{p.label}</button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{preset.context}</p>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
        <p className="text-xs font-semibold text-center text-slate-500 mb-2">Matrix A</p>
        <MatGrid data={preset.A} />
      </div>
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[100px]">
        <p className="text-xs text-center text-slate-400 mb-1">Step {si+1} of {steps.length}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{cur.desc}</p>
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{cur.detail}</p>
        {cur.phase === 'eigenvalues' && (
          <div className="mt-2 flex gap-4">
            <span className="font-mono text-sm font-semibold text-green-700 dark:text-green-400">λ₁ = {fmt(cur.λ1)}</span>
            <span className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-400">λ₂ = {fmt(cur.λ2)}</span>
          </div>
        )}
        {cur.evec && (
          <div className="mt-2 font-mono text-sm font-semibold text-violet-700 dark:text-violet-400">
            v{cur.idx+1} = [{cur.evec.map(fmt).join(', ')}]ᵀ
          </div>
        )}
        {cur.phase === 'diag' && cur.diagonalizable && (
          <div className="mt-2 text-xs font-mono bg-green-50 dark:bg-green-950/30 rounded p-2 text-green-700 dark:text-green-400">
            ✓ Diagonalizable  |  det=λ₁λ₂={fmt(r4(cur.λ1*cur.λ2))}  |  tr=λ₁+λ₂={fmt(r4(cur.λ1+cur.λ2))}
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
        <p>Eigenvectors are the special directions that a matrix doesn't rotate — it only stretches or shrinks them. The eigenvalue is the stretch factor. This is the key to understanding oscillation frequencies in structures, principal stress directions in materials, Google's PageRank, PCA in data science, and stability analysis in control systems.</p>
      </div>
      {[
        { term: 'Eigenvector / Eigenvalue', def: 'Av = λv — v is a nonzero vector that A maps to a scalar multiple of itself. λ is the scalar. The matrix only scales this direction, it doesn\'t rotate it.' },
        { term: 'Characteristic equation', def: 'det(A − λI) = 0. Setting the determinant of (A−λI) to zero gives a polynomial in λ. Roots are the eigenvalues. For n×n matrix: degree-n polynomial with n roots (counting complex and repeated).' },
        { term: 'Eigenspace', def: 'For eigenvalue λᵢ, the eigenspace = null space of (A−λᵢI) = all eigenvectors for λᵢ plus the zero vector. Its dimension = geometric multiplicity.' },
        { term: 'Algebraic multiplicity', def: 'How many times λᵢ appears as a root of the characteristic polynomial. Algebraic ≥ geometric always.' },
        { term: 'Geometric multiplicity', def: 'dim(null(A−λI)) = dimension of the eigenspace. How many independent eigenvectors for this eigenvalue.' },
        { term: 'Diagonalization A = PDP⁻¹', def: 'If A has n linearly independent eigenvectors, it is diagonalizable. P = matrix of eigenvectors (columns). D = diagonal matrix of eigenvalues. Then Aᵏ = PDᵏP⁻¹ — easy to compute powers.' },
        { term: 'When diagonalizable', def: 'Always if all n eigenvalues are distinct. For repeated eigenvalues: diagonalizable ↔ algebraic multiplicity = geometric multiplicity for every eigenvalue.' },
        { term: 'Trace and determinant', def: 'tr(A) = sum of eigenvalues = sum of diagonal entries. det(A) = product of eigenvalues. Useful sanity checks.' },
        { term: 'Triangular matrices', def: 'Eigenvalues of any triangular matrix are exactly the diagonal entries. No calculation needed — det(T−λI) factors immediately.' },
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
        <p className="font-semibold text-violet-800 dark:text-violet-300 mb-1">Eigenvalues are natural frequencies and principal directions</p>
        <p>Wherever a system vibrates, rotates, or reaches equilibrium, eigenvalues are there. They encode the natural frequencies of structures, the principal stress directions in materials, the rate of decay of signals, and the long-run behavior of probability systems.</p>
      </div>
      {[
        {
          title: 'Structural mechanics — natural frequencies',
          body: 'The vibration modes of a structure are its eigenvectors. Each eigenvector is a mode shape; the corresponding eigenvalue is proportional to the square of the natural frequency. A designer checks these to avoid resonance.',
          code: `% Mass and stiffness matrices from FEA
K = stiffness_matrix;   % from element assembly
M = mass_matrix;

% Generalized eigenvalue problem: Kv = λMv
[V, D] = eig(K, M);
omega = sqrt(diag(D));   % natural frequencies (rad/s)
f_hz = omega / (2*pi);   % in Hz`,
        },
        {
          title: 'Google PageRank',
          body: 'PageRank solves for the dominant eigenvector (eigenvalue = 1) of a stochastic matrix where entry [i,j] = probability of following a link from page j to page i. The eigenvector gives the relative importance of each page.',
          code: `% Transition matrix A (stochastic)
A = link_matrix / sum(link_matrix);

% Dominant eigenvector = PageRank
[V, D] = eig(A);
[~, idx] = max(diag(D));
rank_vector = abs(V(:, idx));
rank_vector = rank_vector / sum(rank_vector);`,
        },
        {
          title: 'Principal Component Analysis (PCA)',
          body: 'PCA computes the eigenvectors of the data covariance matrix. The eigenvectors are the principal components (directions of maximum variance). Eigenvalues tell you how much variance each component captures. Used for dimensionality reduction in sensor data, imaging, and manufacturing quality control.',
          code: `data = feature_matrix;           % n_samples × n_features
data = data - mean(data);        % center

C = (data' * data) / size(data,1);  % covariance matrix
[V, D] = eig(C);

% Sort by descending eigenvalue
[d, idx] = sort(diag(D), 'descend');
V = V(:, idx);

% Project onto top 2 principal components
projected = data * V(:, 1:2);`,
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
        <pre className="text-xs font-mono bg-slate-900 text-slate-300 rounded p-3 overflow-x-auto">{`A = [3 1; 2 4];

[V, D] = eig(A)       % V = eigenvectors (cols), D = eigenvalues (diagonal)
lambda = diag(D)       % extract eigenvalues

% Characteristic polynomial
p = poly(A)            % coefficients [1, -tr, ..., (-1)^n det]
roots(p)               % eigenvalues from polynomial roots

% Verify: A*v = lambda*v
v1 = V(:,1); lam1 = D(1,1);
norm(A*v1 - lam1*v1)   % should be ~0

% Diagonalization
P = V; D_mat = D;
A_reconstructed = P * D_mat * inv(P)   % should equal A

% Powers via diagonalization
A_cubed = P * D_mat^3 * inv(P)`}</pre>
      </div>
    </div>
  );
}

const TABS = ['Concept', 'Eigen stepper', 'Real world', 'Practice'];

export default function EigenvaluesModule() {
  const [tab, setTab] = useState(0);
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Module 7 — Eigenvalues &amp; Eigenvectors</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Characteristic equation · Eigenspaces · Diagonalization · Applications</p>
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
