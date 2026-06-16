import React, { useState } from 'react';

const W = 340, H = 280, CX = 170, CY = 140, SCALE = 52;

function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

function Arrow({ x1, y1, x2, y2, color, width = 2.5, dashed = false }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
  const ux = dx / len, uy = dy / len;
  const headLen = 9;
  const hx = x2 - ux * headLen, hy = y2 - uy * headLen;
  const perpX = -uy * 5, perpY = ux * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? '6,4' : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + perpX},${hy + perpY} ${hx - perpX},${hy - perpY}`} fill={color} />
    </g>
  );
}

function Grid() {
  const lines = [];
  for (let i = -2; i <= 2; i++) {
    const [sx] = toScreen(i, 0); const [, sy] = toScreen(0, i);
    lines.push(<line key={`v${i}`} x1={sx} y1={10} x2={sx} y2={H - 10} stroke="#e2e8f0" strokeWidth="1" />);
    lines.push(<line key={`h${i}`} x1={10} y1={sy} x2={W - 10} y2={sy} stroke="#e2e8f0" strokeWidth="1" />);
  }
  return <g>{lines}</g>;
}

// M = [[2,1],[1,2]] with eigenvalues 3,1, eigenvectors [1,1]/√2, [1,-1]/√2
// P = [[1,1],[1,-1]] (columns are eigenvectors, unnormalized)
// P^{-1} = 0.5 * [[1,1],[1,-1]]
const lambda1 = 3, lambda2 = 1;
const P = [1, 1, 1, -1];
const Pinv = [0.5, 0.5, 0.5, -0.5];

function matMul22(A, B) {
  return [
    A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3],
    A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3],
  ];
}

function applyMat(m, x, y) { return [m[0] * x + m[1] * y, m[2] * x + m[3] * y]; }

function makeDiag(l1, l2, k) { return [Math.pow(l1, k), 0, 0, Math.pow(l2, k)]; }

const STEPS = [
  {
    title: 'The Key Idea: Change of Basis',
    body: 'Diagonalization means expressing a matrix in a simpler coordinate system — its own eigenvector basis. In that basis, the matrix just scales each axis independently. No mixing, no rotation. Pure stretching.',
    formula: 'M = P D P⁻¹   where D is diagonal',
    phase: 'intro',
  },
  {
    title: 'Step 1: P⁻¹ — Change to Eigenvector Coordinates',
    body: 'P⁻¹ transforms x into the eigenvector coordinate system. In these new coordinates, the eigenvectors become the standard basis. This is the "change of perspective" step.',
    formula: 'c = P⁻¹x   (coordinates in eigenvector basis)',
    phase: 'Pinv',
  },
  {
    title: 'Step 2: D — Scale Along Each Axis',
    body: 'In the eigenvector coordinate system, M acts diagonally: it just multiplies the first coordinate by λ₁ = 3, and the second by λ₂ = 1. No coupling between coordinates. This is why diagonal is so powerful.',
    formula: 'D·c = [λ₁·c₁, λ₂·c₂]   (independent scaling)',
    phase: 'D',
  },
  {
    title: 'Step 3: P — Return to Standard Coordinates',
    body: 'Multiply by P to go back to the original coordinate system. The result is M·x, computed the easy way: by changing coordinates, scaling, changing back. This decomposition also makes Mⁿ trivial to compute.',
    formula: 'Mⁿ = P Dⁿ P⁻¹   where Dⁿ = diag(λ₁ⁿ, λ₂ⁿ)',
    phase: 'P',
  },
  {
    title: 'Matrix Powers via Diagonalization',
    body: 'The power of a diagonalized matrix is just the power of the diagonal entries. To compute M¹⁰, just compute diag(3¹⁰, 1¹⁰) — no matrix multiplication chains needed. Drag the slider to see Mⁿ in action.',
    formula: 'Mⁿ = P diag(3ⁿ, 1ⁿ) P⁻¹',
    phase: 'power',
  },
];

export default function LALesson09_Diagonalization() {
  const [step, setStep] = useState(0);
  const [power, setPower] = useState(1);
  const s = STEPS[step];

  const [ox, oy] = toScreen(0, 0);

  // sample vector x = [1, 0.5]
  const x = [1, 0.5];
  const [xsx, xsy] = toScreen(x[0], x[1]);

  // P^{-1}x
  const Pinvx = applyMat(Pinv, x[0], x[1]);
  const [pinvsx, pinvsy] = toScreen(Pinvx[0], Pinvx[1]);

  // D * P^{-1}x
  const DPinvx = [lambda1 * Pinvx[0], lambda2 * Pinvx[1]];
  const [dpsx, dpsy] = toScreen(DPinvx[0], DPinvx[1]);

  // P * D * P^{-1}x = Mx
  const PDPinvx = applyMat(P, DPinvx[0], DPinvx[1]);
  const [pdpsx, pdpsy] = toScreen(PDPinvx[0], PDPinvx[1]);

  // M^power * x via diagonalization
  const Dn = makeDiag(lambda1, lambda2, power);
  const M_n = matMul22(matMul22(P, Dn), Pinv);
  const Mnx = applyMat(M_n, x[0], x[1]);
  const dispScale = 1 / (Math.sqrt(Mnx[0] ** 2 + Mnx[1] ** 2) + 0.01) * 1.8;
  const [mnsx, mnsy] = toScreen(Mnx[0] * dispScale, Mnx[1] * dispScale);

  // eigenvector lines for reference
  const ev1Line = [toScreen(-2.2 / Math.SQRT2, -2.2 / Math.SQRT2), toScreen(2.2 / Math.SQRT2, 2.2 / Math.SQRT2)];
  const ev2Line = [toScreen(-2.2 / Math.SQRT2, 2.2 / Math.SQRT2), toScreen(2.2 / Math.SQRT2, -2.2 / Math.SQRT2)];

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Diagonalization</h3>
          <span className="text-xs text-slate-400">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? 'bg-violet-500' : i < step ? 'bg-violet-300 dark:bg-violet-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1">{s.title}</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{s.body}</p>
          <p className="mt-2 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center text-slate-800 dark:text-slate-200">{s.formula}</p>
        </div>
      </div>

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* eigenvector axes */}
          <line x1={ev1Line[0][0]} y1={ev1Line[0][1]} x2={ev1Line[1][0]} y2={ev1Line[1][1]}
            stroke="#10b981" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />
          <line x1={ev2Line[0][0]} y1={ev2Line[0][1]} x2={ev2Line[1][0]} y2={ev2Line[1][1]}
            stroke="#f59e0b" strokeWidth="1" strokeDasharray="6,4" opacity="0.4" />

          {/* x */}
          <Arrow x1={ox} y1={oy} x2={xsx} y2={xsy} color="#6366f1" width={2.5} />
          <text x={xsx + 6} y={xsy - 4} fontSize="11" fill="#6366f1" fontWeight="600">x</text>

          {/* P^{-1}x */}
          {(s.phase === 'Pinv' || s.phase === 'D' || s.phase === 'P') && (
            <>
              <Arrow x1={ox} y1={oy} x2={pinvsx} y2={pinvsy} color="#94a3b8" width={2} dashed />
              <text x={pinvsx + 6} y={pinvsy - 4} fontSize="10" fill="#94a3b8">P⁻¹x</text>
            </>
          )}

          {/* DP^{-1}x */}
          {(s.phase === 'D' || s.phase === 'P') && (
            <>
              <Arrow x1={ox} y1={oy} x2={dpsx} y2={dpsy} color="#f59e0b" width={2.5} dashed />
              <text x={dpsx + 6} y={dpsy - 4} fontSize="10" fill="#f59e0b">D·P⁻¹x</text>
            </>
          )}

          {/* PDP^{-1}x = Mx */}
          {s.phase === 'P' && (
            <>
              <Arrow x1={ox} y1={oy} x2={pdpsx} y2={pdpsy} color="#ef4444" width={3} />
              <text x={pdpsx + 6} y={pdpsy - 4} fontSize="11" fill="#ef4444" fontWeight="700">Mx ✓</text>
            </>
          )}

          {/* power */}
          {s.phase === 'power' && (
            <>
              <Arrow x1={ox} y1={oy} x2={mnsx} y2={mnsy} color="#10b981" width={3} />
              <text x={mnsx + 6} y={mnsy - 4} fontSize="11" fill="#10b981" fontWeight="700">M^{power}x</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />
          <text x={10} y={H - 12} fontSize="10" fontFamily="monospace" fill="#94a3b8">x = [1, 0.5]   λ₁=3 λ₂=1</text>
        </svg>
      </div>

      {s.phase === 'power' && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-sm font-mono w-8 text-emerald-600 dark:text-emerald-400">n =</span>
          <input type="range" min="0" max="10" step="1" value={power}
            onChange={e => setPower(parseInt(e.target.value))} className="flex-1 accent-emerald-500" />
          <span className="text-xs font-mono w-6 text-right text-slate-500">{power}</span>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30">
          ← Back
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
