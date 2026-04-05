import React, { useState, useEffect, useRef } from 'react';

const W = 340, H = 300, CX = 170, CY = 150, SCALE = 55;

function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

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

// Rotation-scaling matrix: λ = r·e^{iθ}
// M = r * [[cos θ, -sin θ],[sin θ, cos θ]]
// Complex eigenvalues: r·e^{±iθ}

const STEPS = [
  {
    title: 'When Eigenvalues Are Complex',
    body: 'Some matrices have no real eigenvectors — no real direction stays on its line under M. Instead, the eigenvalues come in complex conjugate pairs: λ = a ± bi. The imaginary part encodes ROTATION; the real part encodes SCALING.',
    formula: 'λ = a ± bi   →   rotation + scaling',
    phase: 'intro',
  },
  {
    title: 'The Rotation-Scaling Matrix',
    body: 'A matrix with complex eigenvalues rotates AND scales every vector. The angle of rotation is θ = arg(λ) = arctan(b/a). The scaling factor is r = |λ| = √(a² + b²). Adjust the controls below to see both effects.',
    formula: 'M = r·[[cos θ, −sin θ],[sin θ, cos θ]]',
    phase: 'rotate',
  },
  {
    title: 'Repeated Application: The Spiral',
    body: 'Applying M repeatedly produces a spiral. Each application rotates by θ and scales by r. If r < 1, the spiral collapses to the origin (stable). If r > 1, it expands outward. If r = 1, it circles forever.',
    formula: 'Mⁿx = rⁿ · [rotate by nθ] · x',
    phase: 'spiral',
  },
  {
    title: 'Stability and Applications',
    body: 'The magnitude |λ| = r determines long-term behavior. r < 1 → stable (spiral in). r = 1 → neutral (circle). r > 1 → unstable (spiral out). This directly models oscillating systems: springs, circuits, population cycles.',
    formula: '|λ| < 1 → stable   |λ| = 1 → oscillate   |λ| > 1 → unstable',
    phase: 'stability',
  },
];

export default function LALesson10_ComplexEigen() {
  const [step, setStep] = useState(0);
  const [theta, setTheta] = useState(Math.PI / 6);
  const [r, setR] = useState(0.88);
  const [nSteps, setNSteps] = useState(8);
  const s = STEPS[step];

  const [ox, oy] = toScreen(0, 0);
  const M = [
    r * Math.cos(theta), -r * Math.sin(theta),
    r * Math.sin(theta), r * Math.cos(theta),
  ];

  // Start vector
  const x0 = [1.5, 0];

  // Compute spiral trajectory
  const traj = [x0];
  let cur = [...x0];
  for (let i = 0; i < 20; i++) {
    cur = applyMat(M, cur[0], cur[1]);
    traj.push([...cur]);
  }

  // Single step
  const Mx0 = applyMat(M, x0[0], x0[1]);
  const [sx0, sy0] = toScreen(x0[0], x0[1]);
  const [smx, smy] = toScreen(Mx0[0], Mx0[1]);

  // Build spiral path
  const spiralPoints = traj.slice(0, nSteps + 1).map(([x, y]) => toScreen(x, y));
  const spiralPath = spiralPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  // Stability ring
  const ringR = 1 * SCALE;

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Complex Eigenvalues</h3>
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

          {/* unit circle (r=1 reference) */}
          {(s.phase === 'stability' || s.phase === 'spiral') && (
            <circle cx={CX} cy={CY} r={ringR} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          )}

          {/* spiral path */}
          {(s.phase === 'spiral' || s.phase === 'stability') && (
            <>
              <path d={spiralPath} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {spiralPoints.slice(0, nSteps + 1).map(([px, py], i) => (
                <circle key={i} cx={px} cy={py} r={i === 0 ? 5 : 3}
                  fill={i === 0 ? '#f59e0b' : '#6366f1'} opacity={0.7} />
              ))}
            </>
          )}

          {/* single step visualization */}
          {(s.phase === 'intro' || s.phase === 'rotate') && (
            <>
              {/* angle arc */}
              <path d={`M ${CX + 50} ${CY} A 50 50 0 0 ${theta > 0 ? 0 : 1} ${CX + 50 * Math.cos(-theta)} ${CY + 50 * Math.sin(-theta)}`}
                fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              <text x={CX + 58 * Math.cos(-theta / 2)} y={CY + 58 * Math.sin(-theta / 2)}
                fontSize="12" fill="#f59e0b" fontWeight="600">θ</text>

              {/* original */}
              <line x1={ox} y1={oy} x2={sx0} y2={sy0} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points={`${sx0},${sy0} ${sx0 - 10},${sy0 - 5} ${sx0 - 10},${sy0 + 5}`} fill="#6366f1" />
              <text x={sx0 + 6} y={sy0 - 4} fontSize="12" fill="#6366f1" fontWeight="600">x</text>

              {/* transformed */}
              <line x1={ox} y1={oy} x2={smx} y2={smy} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points={`${smx},${smy}`} fill="#ef4444" />
              {/* proper arrow */}
              {(() => {
                const dx = smx - ox, dy = smy - oy;
                const len = Math.sqrt(dx * dx + dy * dy);
                const ux = dx / len, uy = dy / len;
                const hl = 9;
                const hx = smx - ux * hl, hy = smy - uy * hl;
                const px = -uy * 5, py = ux * 5;
                return <polygon points={`${smx},${smy} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill="#ef4444" />;
              })()}
              <text x={smx + 6} y={smy - 4} fontSize="12" fill="#ef4444" fontWeight="600">Mx</text>

              <text x={W - 10} y={H - 22} fontSize="11" fill="#6366f1" textAnchor="end">θ = {(theta * 180 / Math.PI).toFixed(0)}°</text>
              <text x={W - 10} y={H - 10} fontSize="11" fill="#ef4444" textAnchor="end">r = {r.toFixed(2)}</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />

          {(s.phase === 'stability') && (
            <text x={CX} y={22} fontSize="12" textAnchor="middle" fontWeight="700"
              fill={r < 0.999 ? '#10b981' : r > 1.001 ? '#ef4444' : '#f59e0b'}>
              {r < 0.999 ? 'Stable — spirals inward' : r > 1.001 ? 'Unstable — spirals outward' : 'Neutral — circular orbit'}
            </text>
          )}
        </svg>
      </div>

      {(s.phase === 'rotate' || s.phase === 'intro') && (
        <div className="space-y-2 mb-3 px-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono w-8 text-amber-500">θ =</span>
            <input type="range" min="0.05" max={Math.PI / 1.5} step="0.05" value={theta}
              onChange={e => setTheta(parseFloat(e.target.value))} className="flex-1 accent-amber-500" />
            <span className="text-xs font-mono w-12 text-right text-slate-500">{(theta * 180 / Math.PI).toFixed(0)}°</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono w-8 text-red-500">r =</span>
            <input type="range" min="0.5" max="1.5" step="0.02" value={r}
              onChange={e => setR(parseFloat(e.target.value))} className="flex-1 accent-red-500" />
            <span className="text-xs font-mono w-12 text-right text-slate-500">{r.toFixed(2)}</span>
          </div>
        </div>
      )}

      {(s.phase === 'spiral' || s.phase === 'stability') && (
        <div className="space-y-2 mb-3 px-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono w-8 text-violet-500">n =</span>
            <input type="range" min="1" max="20" step="1" value={nSteps}
              onChange={e => setNSteps(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
            <span className="text-xs font-mono w-6 text-right text-slate-500">{nSteps}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono w-8 text-red-500">r =</span>
            <input type="range" min="0.75" max="1.25" step="0.01" value={r}
              onChange={e => setR(parseFloat(e.target.value))} className="flex-1 accent-red-500" />
            <span className="text-xs font-mono w-12 text-right text-slate-500">{r.toFixed(2)}</span>
          </div>
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
