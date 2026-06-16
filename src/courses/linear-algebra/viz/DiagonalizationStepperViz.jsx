import React, { useState } from 'react';

function round3(x) { return Math.round(x * 1000) / 1000; }

function computeDiagonalization(a, b, c, d) {
  const trace = a + d, det = a * d - b * c;
  const disc = trace * trace - 4 * det;

  if (disc < -1e-9) {
    return { steps: [{ title: 'Complex Eigenvalues', body: 'Discriminant < 0 — eigenvalues are complex. This matrix cannot be diagonalized over the reals.', highlight: null }], solvable: false };
  }

  const sq = Math.sqrt(Math.max(0, disc));
  const l1 = (trace + sq) / 2, l2 = (trace - sq) / 2;
  const steps = [];

  steps.push({
    title: 'Step 1: Find Eigenvalues',
    body: `Characteristic equation: λ² − ${trace}λ + ${round3(det)} = 0\nDiscriminant: ${round3(trace)}² − 4·${round3(det)} = ${round3(disc)}\n→  λ₁ = ${round3(l1)},  λ₂ = ${round3(l2)}`,
    highlight: 'eigenvalues',
    l1, l2,
  });

  // Eigenvector for l1: (A - l1 I)v = 0
  // [[a-l1, b],[c, d-l1]] v = 0
  // If b≠0: v1 = [b, l1-a] (from row 1)
  // If b=0 and c≠0: v1 = [l1-d, c] (from row 2)
  function eigvec(lam) {
    const aa = a - lam, bb = b, cc = c, dd = d - lam;
    if (Math.abs(bb) > 1e-9) return [bb, lam - a];
    if (Math.abs(cc) > 1e-9) return [lam - d, cc];
    if (Math.abs(aa) < 1e-9) return [1, 0];
    return [0, 1];
  }

  const v1 = eigvec(l1);
  const v2 = eigvec(l2);
  const v1n = Math.sqrt(v1[0] ** 2 + v1[1] ** 2);
  const v2n = Math.sqrt(v2[0] ** 2 + v2[1] ** 2);

  steps.push({
    title: 'Step 2: Find Eigenvectors',
    body: `For λ₁ = ${round3(l1)}: solve (A − λ₁I)v = 0\n→  v₁ = [${round3(v1[0])}, ${round3(v1[1])}]\n\nFor λ₂ = ${round3(l2)}: solve (A − λ₂I)v = 0\n→  v₂ = [${round3(v2[0])}, ${round3(v2[1])}]`,
    highlight: 'eigenvectors', l1, l2, v1, v2,
  });

  steps.push({
    title: 'Step 3: Assemble P and D',
    body: `P = columns are eigenvectors:\nP = [[${round3(v1[0])}, ${round3(v2[0])}],\n     [${round3(v1[1])}, ${round3(v2[1])}]]\n\nD = diagonal with eigenvalues:\nD = [[${round3(l1)}, 0],\n     [0, ${round3(l2)}]]`,
    highlight: 'PD', l1, l2, v1, v2,
  });

  // Verify AP = PD
  const P = [v1[0], v2[0], v1[1], v2[1]];
  const AP = [
    a * P[0] + b * P[2], a * P[1] + b * P[3],
    c * P[0] + d * P[2], c * P[1] + d * P[3],
  ];
  const PD = [P[0] * l1, P[1] * l2, P[2] * l1, P[3] * l2];
  const matches = AP.every((v, i) => Math.abs(v - PD[i]) < 0.01);

  steps.push({
    title: 'Step 4: Verify AP = PD',
    body: `AP = [[${round3(AP[0])}, ${round3(AP[1])}], [${round3(AP[2])}, ${round3(AP[3])}]]\nPD = [[${round3(PD[0])}, ${round3(PD[1])}], [${round3(PD[2])}, ${round3(PD[3])}]]\n\n${matches ? '✓ AP = PD  →  A = PDP⁻¹' : '⚠ Rounding — verify manually'}`,
    highlight: 'verify', l1, l2, v1, v2,
  });

  return { steps, solvable: true };
}

const PRESETS = [
  { label: '[[2,1],[1,2]]', a: 2, b: 1, c: 1, d: 2 },
  { label: '[[3,1],[0,2]]', a: 3, b: 1, c: 0, d: 2 },
  { label: '[[1,2],[0,1]]', a: 1, b: 2, c: 0, d: 1 },
];

function MatrixDisplay({ entries, highlight }) {
  const [a, b, c, d] = entries;
  return (
    <span className="font-mono text-sm">
      [[{round3(a)}, {round3(b)}], [{round3(c)}, {round3(d)}]]
    </span>
  );
}

export default function DiagonalizationStepperViz() {
  const [preset, setPreset] = useState(0);
  const [a, setA] = useState(PRESETS[0].a);
  const [b, setB] = useState(PRESETS[0].b);
  const [c, setC] = useState(PRESETS[0].c);
  const [d, setD] = useState(PRESETS[0].d);
  const [stepIdx, setStepIdx] = useState(0);

  const { steps, solvable } = computeDiagonalization(a, b, c, d);
  const cur = steps[Math.min(stepIdx, steps.length - 1)];

  function loadPreset(i) {
    setPreset(i);
    setA(PRESETS[i].a); setB(PRESETS[i].b);
    setC(PRESETS[i].c); setD(PRESETS[i].d);
    setStepIdx(0);
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Diagonalization — Step by Step</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Walk through building P and D from a 2×2 matrix: find eigenvalues, eigenvectors, assemble, verify.
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => loadPreset(i)}
            className={`px-3 py-1 rounded text-xs font-mono ${i === preset ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {[['a', a, setA], ['b', b, setB], ['c', c, setC], ['d', d, setD]].map(([lbl, val, set]) => (
          <div key={lbl} className="flex items-center gap-2">
            <span className="text-sm font-mono w-6 text-violet-600">{lbl}=</span>
            <input type="range" min="-4" max="5" step="0.5" value={val}
              onChange={e => { set(parseFloat(e.target.value)); setStepIdx(0); }} className="flex-1 accent-violet-500" />
            <span className="text-xs font-mono w-6 text-right">{val}</span>
          </div>
        ))}
      </div>

      {!solvable ? (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-3 text-sm text-red-700 dark:text-red-300">
          {steps[0].body}
        </div>
      ) : (
        <>
          <div className="flex gap-1 mb-3">
            {steps.map((_, i) => (
              <button key={i} onClick={() => setStepIdx(i)}
                className={`h-1.5 flex-1 rounded-full ${i === stepIdx ? 'bg-violet-500' : i < stepIdx ? 'bg-violet-300 dark:bg-violet-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3 min-h-[120px]">
            <p className="font-semibold text-violet-600 dark:text-violet-400 mb-2">{cur.title}</p>
            <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{cur.body}</pre>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}
              className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30">
              ← Back
            </button>
            <button onClick={() => setStepIdx(Math.min(steps.length - 1, stepIdx + 1))} disabled={stepIdx === steps.length - 1}
              className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
