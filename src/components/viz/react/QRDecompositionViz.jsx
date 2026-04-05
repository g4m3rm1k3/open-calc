import React, { useState } from 'react';

const W = 320, H = 280, CX = 160, CY = 140, SCALE = 52;
function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
function scale(s, v) { return [s * v[0], s * v[1]]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function norm(v) { return Math.sqrt(dot(v, v)); }
function normalize(v) { const n = norm(v); return n < 1e-10 ? v : [v[0] / n, v[1] / n]; }
function round3(x) { return Math.round(x * 1000) / 1000; }

function gramSchmidt(a1, a2) {
  const q1 = normalize(a1);
  const proj = scale(dot(a2, q1), q1);
  const e2 = sub(a2, proj);
  const q2 = normalize(e2);
  return { q1, q2, e2, proj };
}

function Arrow({ x1, y1, x2, y2, color, width = 2.5, dashed = false }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len;
  const hl = 9;
  const hx = x2 - ux * hl, hy = y2 - uy * hl;
  const px = -uy * 5, py = ux * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? '6,4' : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill={color} />
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

const PRESETS = [
  { label: '[[1,1],[0,1]]', a1: [1, 0], a2: [1, 1] },
  { label: '[[2,1],[1,2]]', a1: [2, 1], a2: [1, 2] },
  { label: '[[1,0.5],[1,1.5]]', a1: [1, 1], a2: [0.5, 1.5] },
];

const STEPS = [
  { title: 'Column Vectors a₁ and a₂', body: 'Start with the two columns of A. These are typically not orthogonal to each other. Gram-Schmidt will make them orthonormal.', phase: 'cols' },
  { title: 'q₁: Normalize a₁', body: 'q₁ = a₁ / |a₁| — just the unit vector in the direction of a₁. This is the first column of Q.', phase: 'q1' },
  { title: 'Remove q₁-component from a₂', body: 'Subtract the projection of a₂ onto q₁. The remainder e₂ = a₂ − (a₂·q₁)q₁ is perpendicular to q₁. This is the key Gram-Schmidt step.', phase: 'e2' },
  { title: 'q₂: Normalize e₂', body: 'q₂ = e₂ / |e₂|. Now Q = [q₁ q₂] is orthonormal. The upper triangular R contains the inner products and norms from each step. Together: A = QR.', phase: 'q2' },
];

export default function QRDecompositionViz() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const { a1, a2 } = PRESETS[presetIdx];
  const { q1, q2, e2, proj } = gramSchmidt(a1, a2);

  // R matrix entries
  const r11 = norm(a1);
  const r12 = dot(a2, q1);
  const r22 = norm(e2);

  const [ox, oy] = toScreen(0, 0);
  const s = STEPS[stepIdx];

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Gram-Schmidt → QR</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Gram-Schmidt orthogonalizes the columns of A one by one. The result Q is orthonormal. R records the projections as upper-triangular coefficients.
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPresetIdx(i); setStepIdx(0); }}
            className={`px-2 py-1 rounded text-xs font-mono ${i === presetIdx ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-3">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStepIdx(i)}
            className={`h-1.5 flex-1 rounded-full ${i === stepIdx ? 'bg-violet-500' : i < stepIdx ? 'bg-violet-300 dark:bg-violet-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
        ))}
      </div>

      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-2 mb-2">
        <p className="font-semibold text-violet-600 dark:text-violet-400 text-sm mb-1">{s.title}</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{s.body}</p>
      </div>

      <div className="flex justify-center mb-2">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* a1, a2 */}
          {(s.phase === 'cols' || s.phase === 'q1') && (
            <>
              <Arrow x1={ox} y1={oy} x2={toScreen(a1[0], a1[1])[0]} y2={toScreen(a1[0], a1[1])[1]} color="#6366f1" width={2.5} />
              <text x={toScreen(a1[0], a1[1])[0] + 6} y={toScreen(a1[0], a1[1])[1] - 4} fontSize="12" fill="#6366f1" fontWeight="600">a₁</text>
            </>
          )}
          {s.phase === 'cols' && (
            <>
              <Arrow x1={ox} y1={oy} x2={toScreen(a2[0], a2[1])[0]} y2={toScreen(a2[0], a2[1])[1]} color="#10b981" width={2.5} />
              <text x={toScreen(a2[0], a2[1])[0] + 6} y={toScreen(a2[0], a2[1])[1] - 4} fontSize="12" fill="#10b981" fontWeight="600">a₂</text>
            </>
          )}

          {/* q1 */}
          {(s.phase === 'q1' || s.phase === 'e2' || s.phase === 'q2') && (
            <>
              <Arrow x1={ox} y1={oy} x2={toScreen(q1[0], q1[1])[0]} y2={toScreen(q1[0], q1[1])[1]} color="#6366f1" width={3} />
              <text x={toScreen(q1[0], q1[1])[0] + 6} y={toScreen(q1[0], q1[1])[1] - 4} fontSize="12" fill="#6366f1" fontWeight="700">q₁</text>
            </>
          )}

          {/* a2 and projection */}
          {(s.phase === 'e2' || s.phase === 'q2') && (
            <>
              <Arrow x1={ox} y1={oy} x2={toScreen(a2[0], a2[1])[0]} y2={toScreen(a2[0], a2[1])[1]} color="#10b981" width={2} dashed />
              <text x={toScreen(a2[0], a2[1])[0] + 6} y={toScreen(a2[0], a2[1])[1] - 4} fontSize="11" fill="#10b981">a₂</text>
              {/* projection arrow */}
              <Arrow x1={ox} y1={oy} x2={toScreen(proj[0], proj[1])[0]} y2={toScreen(proj[0], proj[1])[1]} color="#f59e0b" width={2} />
              {/* e2 from tip of proj to tip of a2 */}
              <Arrow x1={toScreen(proj[0], proj[1])[0]} y1={toScreen(proj[0], proj[1])[1]}
                x2={toScreen(a2[0], a2[1])[0]} y2={toScreen(a2[0], a2[1])[1]}
                color="#ef4444" width={2.5} />
              <text x={toScreen(e2[0] / 2 + proj[0], e2[1] / 2 + proj[1])[0] + 6}
                y={toScreen(e2[0] / 2 + proj[0], e2[1] / 2 + proj[1])[1]}
                fontSize="11" fill="#ef4444" fontWeight="600">e₂</text>
            </>
          )}

          {/* q2 */}
          {s.phase === 'q2' && (
            <>
              <Arrow x1={ox} y1={oy} x2={toScreen(q2[0], q2[1])[0]} y2={toScreen(q2[0], q2[1])[1]} color="#ef4444" width={3} />
              <text x={toScreen(q2[0], q2[1])[0] + 6} y={toScreen(q2[0], q2[1])[1] - 4} fontSize="12" fill="#ef4444" fontWeight="700">q₂</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />
        </svg>
      </div>

      {stepIdx === STEPS.length - 1 && (
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-2 font-mono text-xs text-slate-700 dark:text-slate-300">
          <p>Q = [[{round3(q1[0])}, {round3(q2[0])}], [{round3(q1[1])}, {round3(q2[1])}]]</p>
          <p>R = [[{round3(r11)}, {round3(r12)}], [0, {round3(r22)}]]</p>
          <p className="text-emerald-600 dark:text-emerald-400 mt-1">✓ A = QR (orthonormal × upper-triangular)</p>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}
          className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30">
          ← Back
        </button>
        <button onClick={() => setStepIdx(Math.min(STEPS.length - 1, stepIdx + 1))} disabled={stepIdx === STEPS.length - 1}
          className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
