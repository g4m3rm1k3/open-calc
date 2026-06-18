import React, { useState, useEffect, useRef } from 'react';

const W = 340, H = 300, CX = 170, CY = 150, SCALE = 55;

function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

function Arrow({ x1, y1, x2, y2, color, width = 2.5, dashed = false, opacity = 1 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
  const ux = dx / len, uy = dy / len;
  const headLen = 9;
  const hx = x2 - ux * headLen, hy = y2 - uy * headLen;
  const perpX = -uy * 5, perpY = ux * 5;
  return (
    <g opacity={opacity}>
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

// Matrix with eigenvalues 3 and 1, eigenvectors [1,1] and [1,-1]
// M = P diag(3,1) P^{-1} where P = [[1,1],[1,-1]]
// M = [[2,1],[1,2]]
const M = [2, 1, 1, 2];
// Eigenvalue 1: λ=3, v=[1,1]
// Eigenvalue 2: λ=1, v=[1,-1]

function applyMat(m, x, y) { return [m[0] * x + m[1] * y, m[2] * x + m[3] * y]; }

const EIGENVECS = [
  { v: [1 / Math.SQRT2, 1 / Math.SQRT2], lambda: 3, color: '#10b981', label: 'v₁' },
  { v: [1 / Math.SQRT2, -1 / Math.SQRT2], lambda: 1, color: '#f59e0b', label: 'v₂' },
];

const STEPS = [
  {
    title: 'Most Vectors Rotate Under M',
    body: 'Apply matrix M = [[2,1],[1,2]] to a random vector (blue). The output (gold) points in a completely different direction. The vector is stretched AND rotated. This is typical for most directions.',
    formula: 'M·x  →  different direction (rotation + stretch)',
    phase: 'random',
  },
  {
    title: 'Eigenvectors: Special Directions',
    body: 'Some vectors are special — when M is applied, the output stays on the SAME LINE through the origin. Only the length changes. These are eigenvectors. The scaling factor is the eigenvalue λ.',
    formula: 'M·v = λ·v   (same direction, scaled by λ)',
    phase: 'eigen',
  },
  {
    title: 'This Matrix Has Two Eigenvectors',
    body: 'M = [[2,1],[1,2]] has eigenvectors v₁ = [1,1]/√2 with λ₁ = 3 (stretched 3×) and v₂ = [1,−1]/√2 with λ₂ = 1 (unchanged). Every direction that is NOT an eigenvector gets rotated.',
    formula: 'M·v₁ = 3v₁   M·v₂ = 1·v₂',
    phase: 'both',
  },
  {
    title: 'Why Eigenvectors Matter',
    body: 'Eigenvectors reveal the "natural axes" of a transformation. Any vector can be written as a combination of eigenvectors. Under repeated application of M, the largest eigenvalue dominates — the v₁ direction grows fastest. This is the basis for PCA, Google PageRank, physics, and more.',
    formula: 'Mⁿx = c₁λ₁ⁿv₁ + c₂λ₂ⁿv₂  →  largest λ wins',
    phase: 'power',
  },
];

export default function LALesson08_Eigen() {
  const [step, setStep] = useState(0);
  const [angle, setAngle] = useState(0.4);
  const [power, setPower] = useState(1);
  const s = STEPS[step];

  const [ox, oy] = toScreen(0, 0);

  // random vector at given angle
  const rx = Math.cos(angle), ry = Math.sin(angle);
  const Mrx = applyMat(M, rx, ry);
  const [rsx, rsy] = toScreen(rx, ry);
  const [mrsx, mrsy] = toScreen(Mrx[0], Mrx[1]);

  // power of matrix applied to rx,ry
  let powerVec = [rx, ry];
  for (let i = 0; i < power; i++) powerVec = applyMat(M, powerVec[0], powerVec[1]);
  const scale = 1 / Math.sqrt(powerVec[0] ** 2 + powerVec[1] ** 2 + 0.001);
  const pvNorm = [powerVec[0] * scale * 1.5, powerVec[1] * scale * 1.5];
  const [pvx, pvy] = toScreen(pvNorm[0], pvNorm[1]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Eigenvectors &amp; Eigenvalues</h3>
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

          {/* Eigen lines */}
          {(s.phase === 'eigen' || s.phase === 'both' || s.phase === 'power') &&
            EIGENVECS.map((e, i) => {
              const [lx1, ly1] = toScreen(-2.5 * e.v[0], -2.5 * e.v[1]);
              const [lx2, ly2] = toScreen(2.5 * e.v[0], 2.5 * e.v[1]);
              return <line key={i} x1={lx1} y1={ly1} x2={lx2} y2={ly2}
                stroke={e.color} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.5" />;
            })
          }

          {/* Eigenvectors and their images */}
          {(s.phase === 'eigen' || s.phase === 'both') &&
            EIGENVECS.map((e, i) => {
              const [evx, evy] = toScreen(e.v[0], e.v[1]);
              const scaled = applyMat(M, e.v[0], e.v[1]);
              // normalize scaled for display
              const sLen = Math.sqrt(scaled[0] ** 2 + scaled[1] ** 2);
              const scaledDisp = [scaled[0] / sLen * 1.5, scaled[1] / sLen * 1.5];
              const [sex, sey] = toScreen(scaledDisp[0], scaledDisp[1]);
              return (
                <g key={i}>
                  <Arrow x1={ox} y1={oy} x2={evx} y2={evy} color={e.color} width={2} dashed />
                  <Arrow x1={ox} y1={oy} x2={sex} y2={sey} color={e.color} width={3} />
                  <text x={sex + 6} y={sey} fontSize="12" fill={e.color} fontWeight="700">
                    M·{e.label} = {e.lambda}{e.label}
                  </text>
                </g>
              );
            })
          }

          {/* Random vector */}
          {(s.phase === 'random' || s.phase === 'both') && (
            <>
              <Arrow x1={ox} y1={oy} x2={rsx} y2={rsy} color="#6366f1" width={2.5} />
              <text x={rsx + 6} y={rsy - 4} fontSize="11" fill="#6366f1" fontWeight="600">x</text>
              <Arrow x1={ox} y1={oy} x2={mrsx} y2={mrsy} color="#f59e0b" width={2.5} />
              <text x={mrsx + 6} y={mrsy - 4} fontSize="11" fill="#f59e0b" fontWeight="600">Mx</text>
            </>
          )}

          {/* Power iteration */}
          {s.phase === 'power' && (
            <>
              <Arrow x1={ox} y1={oy} x2={rsx} y2={rsy} color="#6366f1" width={1.5} dashed opacity={0.5} />
              <Arrow x1={ox} y1={oy} x2={pvx} y2={pvy} color="#10b981" width={3} />
              <text x={pvx + 6} y={pvy - 4} fontSize="11" fill="#10b981" fontWeight="600">Mⁿx</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />
          <text x={10} y={H - 12} fontSize="10" fontFamily="monospace" fill="#94a3b8">M = [[2,1],[1,2]]   λ₁=3, λ₂=1</text>
        </svg>
      </div>

      {s.phase === 'random' && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-sm font-mono w-16 text-violet-600 dark:text-violet-400">angle</span>
          <input type="range" min="0" max={Math.PI * 2} step="0.05" value={angle}
            onChange={e => setAngle(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
          <span className="text-xs font-mono w-12 text-right text-slate-500">{(angle * 180 / Math.PI).toFixed(0)}°</span>
        </div>
      )}
      {s.phase === 'power' && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-sm font-mono w-8 text-emerald-600 dark:text-emerald-400">n =</span>
          <input type="range" min="0" max="8" step="1" value={power}
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
