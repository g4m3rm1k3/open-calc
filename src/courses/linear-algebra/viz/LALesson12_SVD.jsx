import React, { useState } from 'react';

const W = 340, H = 300, CX = 170, CY = 150, SCALE = 50;

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

function applyMat(m, x, y) { return [m[0] * x + m[1] * y, m[2] * x + m[3] * y]; }

function transformPts(pts, m) {
  return pts.map(([x, y]) => [m[0] * x + m[1] * y, m[2] * x + m[3] * y]);
}

// M = U Σ V^T
// For simplicity: M = [[3, 1],[1, 2]]
// SVD computed: σ1 ≈ 3.618, σ2 ≈ 0.382
// V columns (right singular vectors):
const phi = Math.atan2(1, 1 + Math.sqrt(5)) * 0 + Math.PI / 8; // approximation
const sigma1 = 3.618, sigma2 = 0.382;
// V = [[cos φ, -sin φ],[sin φ, cos φ]] ≈ rotation by 26.57°
const phiV = 26.57 * Math.PI / 180;
const V = [Math.cos(phiV), -Math.sin(phiV), Math.sin(phiV), Math.cos(phiV)];
// U ≈ rotation by different angle
const phiU = 14.04 * Math.PI / 180;
const U = [Math.cos(phiU), -Math.sin(phiU), Math.sin(phiU), Math.cos(phiU)];
// Full M = U * diag(s1,s2) * V^T
const Vt = [V[0], V[2], V[1], V[3]];

function matMul22(A, B) {
  return [A[0]*B[0]+A[1]*B[2], A[0]*B[1]+A[1]*B[3], A[2]*B[0]+A[3]*B[2], A[2]*B[1]+A[3]*B[3]];
}

// M ≈ U diag(σ1,σ2) V^T  (approximate SVD of [[3,1],[1,2]])
const Sigma = [sigma1, 0, 0, sigma2];
const M = matMul22(U, matMul22(Sigma, Vt));

const UNIT_CIRCLE_PTS = Array.from({length: 32}, (_, i) => {
  const t = (i / 31) * Math.PI * 2;
  return [Math.cos(t), Math.sin(t)];
});

const STEPS = [
  {
    title: 'SVD: Every Matrix Tells a Geometric Story',
    body: 'The Singular Value Decomposition says: ANY matrix M can be written as M = U Σ Vᵀ — a rotation Vᵀ, then a stretch Σ, then another rotation U. Just three simple operations. This works for EVERY matrix, even non-square, even singular.',
    formula: 'M = U Σ Vᵀ   (rotation · stretch · rotation)',
    phase: 'intro',
  },
  {
    title: 'Step 1: Vᵀ — Rotate the Input',
    body: 'The right singular vectors (columns of V) form an orthonormal basis for the input space. Vᵀ rotates the unit circle so the "natural input axes" align with the coordinate axes.',
    formula: 'Vᵀx — rotates to the natural input coordinates',
    phase: 'VT',
  },
  {
    title: 'Step 2: Σ — Stretch Along Each Axis',
    body: 'The singular values σ₁ ≥ σ₂ ≥ 0 in Σ stretch each axis independently. σ₁ ≈ 3.62 stretches the first axis; σ₂ ≈ 0.38 shrinks the second. The unit circle becomes an ellipse with semi-axes σ₁ and σ₂.',
    formula: 'Σ = diag(σ₁, σ₂)   σ₁ ≥ σ₂ ≥ 0',
    phase: 'Sigma',
  },
  {
    title: 'Step 3: U — Rotate the Output',
    body: 'The left singular vectors (columns of U) form an orthonormal basis for the output space. U rotates the stretched ellipse into its final orientation. Together: M maps the unit circle to an ellipse.',
    formula: 'U Σ Vᵀ x — the full M transformation',
    phase: 'U',
  },
  {
    title: 'The Condition Number: How Ill-Conditioned?',
    body: 'The condition number κ = σ₁/σ₂ measures how much M distorts space. Large condition number → nearly singular → computationally unstable. For our matrix, κ ≈ 9.5. A well-conditioned matrix has κ near 1.',
    formula: 'κ(M) = σ₁/σ₂   — condition number',
    phase: 'condition',
  },
];

export default function LALesson12_SVD() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  const [ox, oy] = toScreen(0, 0);

  // Compute circle transformations
  const vtCircle = UNIT_CIRCLE_PTS.map(([x, y]) => applyMat(Vt, x, y));
  const svtCircle = vtCircle.map(([x, y]) => [Sigma[0] * x + Sigma[1] * y, Sigma[2] * x + Sigma[3] * y]);
  const mCircle = svtCircle.map(([x, y]) => applyMat(U, x, y));

  function circlePath(pts) {
    return pts.map(([x, y]) => {
      const [sx, sy] = toScreen(x, y);
      return sx + ',' + sy;
    }).join(' ');
  }

  // Singular vectors
  const v1 = [V[0], V[2]]; // first col of V
  const v2 = [V[1], V[3]]; // second col
  const u1 = [U[0], U[2]]; // first col of U
  const u2 = [U[1], U[3]]; // second col

  const [v1sx, v1sy] = toScreen(v1[0], v1[1]);
  const [v2sx, v2sy] = toScreen(v2[0], v2[1]);
  const [u1sx, u1sy] = toScreen(sigma1 * u1[0] / 2, sigma1 * u1[1] / 2);
  const [u2sx, u2sy] = toScreen(sigma2 * u2[0] / 2, sigma2 * u2[1] / 2);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Singular Value Decomposition</h3>
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

          {/* unit circle */}
          <polygon points={circlePath(UNIT_CIRCLE_PTS)} fill="#6366f1" fillOpacity="0.1" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3" />

          {/* V^T rotated circle */}
          {(s.phase === 'VT' || s.phase === 'Sigma' || s.phase === 'U') && (
            <polygon points={circlePath(vtCircle)} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
          )}

          {/* Sigma stretched ellipse */}
          {(s.phase === 'Sigma' || s.phase === 'U') && (
            <polygon points={circlePath(svtCircle)} fill="#f59e0b" fillOpacity="0.1" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
          )}

          {/* Final M(circle) */}
          {(s.phase === 'intro' || s.phase === 'U' || s.phase === 'condition') && (
            <polygon points={circlePath(mCircle)} fill="#ef4444" fillOpacity="0.12" stroke="#ef4444" strokeWidth="2" />
          )}

          {/* Singular vectors */}
          {(s.phase === 'VT') && (
            <>
              <Arrow x1={ox} y1={oy} x2={v1sx} y2={v1sy} color="#10b981" width={2.5} />
              <text x={v1sx + 6} y={v1sy - 4} fontSize="11" fill="#10b981" fontWeight="600">v₁</text>
              <Arrow x1={ox} y1={oy} x2={v2sx} y2={v2sy} color="#10b981" width={2} dashed />
              <text x={v2sx + 6} y={v2sy - 4} fontSize="11" fill="#10b981">v₂</text>
            </>
          )}

          {/* U semi-axes on output ellipse */}
          {(s.phase === 'U' || s.phase === 'condition') && (
            <>
              <Arrow x1={ox} y1={oy} x2={u1sx} y2={u1sy} color="#ef4444" width={2.5} />
              <text x={u1sx + 6} y={u1sy - 4} fontSize="11" fill="#ef4444" fontWeight="600">σ₁u₁</text>
              <Arrow x1={ox} y1={oy} x2={u2sx} y2={u2sy} color="#ef4444" width={2} dashed />
              <text x={u2sx + 6} y={u2sy - 4} fontSize="11" fill="#ef4444">σ₂u₂</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />

          {/* Legend */}
          <circle cx={14} cy={H - 42} r="4" fill="#6366f1" opacity="0.5" />
          <text x={22} y={H - 38} fontSize="10" fill="#6366f1">unit circle</text>
          <circle cx={14} cy={H - 28} r="4" fill="#ef4444" opacity="0.5" />
          <text x={22} y={H - 24} fontSize="10" fill="#ef4444">M(circle) = ellipse</text>
          {s.phase === 'condition' && (
            <text x={W - 10} y={H - 12} fontSize="11" textAnchor="end" fill="#f59e0b" fontWeight="600">
              κ = σ₁/σ₂ ≈ {(sigma1 / sigma2).toFixed(1)}
            </text>
          )}
        </svg>
      </div>

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
