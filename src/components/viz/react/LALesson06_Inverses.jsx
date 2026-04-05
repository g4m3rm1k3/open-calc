import React, { useState } from 'react';

const W = 340, H = 300, CX = 170, CY = 150, SCALE = 52;

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
  for (let i = -3; i <= 3; i++) {
    const [sx] = toScreen(i, 0); const [, sy] = toScreen(0, i);
    lines.push(<line key={`v${i}`} x1={sx} y1={10} x2={sx} y2={H - 10} stroke="#e2e8f0" strokeWidth="1" />);
    lines.push(<line key={`h${i}`} x1={10} y1={sy} x2={W - 10} y2={sy} stroke="#e2e8f0" strokeWidth="1" />);
  }
  return <g>{lines}</g>;
}

function transformPts(pts, m) {
  return pts.map(([x, y]) => [m[0] * x + m[1] * y, m[2] * x + m[3] * y]);
}

function invertMat(m) {
  const [a, b, c, d] = m;
  const det = a * d - b * c;
  if (Math.abs(det) < 0.0001) return null;
  return [d / det, -b / det, -c / det, a / det];
}

const PRESETS = [
  { label: 'Invertible', m: [2, 1, 0.5, 1.5], desc: 'det ≠ 0 → invertible' },
  { label: 'Rotation', m: [Math.cos(0.8), -Math.sin(0.8), Math.sin(0.8), Math.cos(0.8)], desc: 'Rotation is always invertible' },
  { label: 'Singular', m: [1, 2, 0.5, 1], desc: 'det = 0 → collapses to a line, NO inverse!' },
];

const SQUARE = [[0, 0], [1, 0], [1, 1], [0, 1]];

const STEPS = [
  {
    title: 'Forward: Apply M',
    body: 'A matrix M transforms the unit square (blue, dashed) into a parallelogram (gold). The matrix stretches, rotates, or shears space. The determinant measures how much area is scaled.',
    formula: 'M sends: unit square → parallelogram',
    phase: 'forward',
  },
  {
    title: 'Inverse: Undo M with M⁻¹',
    body: 'If det(M) ≠ 0, there exists an inverse M⁻¹ that undoes exactly what M did. Applying M⁻¹ after M returns you to the original: M⁻¹(Mx) = x. The composition M⁻¹M = I, the identity.',
    formula: 'M⁻¹ · M = I     (identity matrix)',
    phase: 'inverse',
  },
  {
    title: 'When There Is No Inverse',
    body: 'When det(M) = 0, the matrix collapses the plane onto a line (or a point). Once information is lost, it cannot be recovered — there is no way to "un-collapse." The matrix is called singular. Select "Singular" to see this.',
    formula: 'det(M) = 0  ⟹  M⁻¹ does not exist',
    phase: 'singular', showPresets: true,
  },
  {
    title: 'Solving Linear Systems',
    body: 'The inverse is the key to solving Mx = b. If M⁻¹ exists, then x = M⁻¹b — multiply both sides by the inverse. This is why invertibility matters in applications: it determines whether a system of equations has a unique solution.',
    formula: 'Mx = b  ⟹  x = M⁻¹b  (when M is invertible)',
    phase: 'solve', showPresets: true,
  },
];

export default function LALesson06_Inverses() {
  const [step, setStep] = useState(0);
  const [presetIdx, setPresetIdx] = useState(0);
  const s = STEPS[step];

  const M = PRESETS[presetIdx].m;
  const [a, b, c, d] = M;
  const det = a * d - b * c;
  const Minv = invertMat(M);

  const outRaw = transformPts(SQUARE, M);
  const invRaw = Minv ? transformPts(outRaw, Minv) : null;

  const [ox, oy] = toScreen(0, 0);
  const inPts = SQUARE.map(([x, y]) => toScreen(x, y).join(',')).join(' ');
  const outPts = outRaw.map(([x, y]) => toScreen(x, y).join(',')).join(' ');
  const invPts = invRaw ? invRaw.map(([x, y]) => toScreen(x, y).join(',')).join(' ') : '';

  // sample vector
  const vx = 0.8, vy = 0.6;
  const Mv = [M[0] * vx + M[1] * vy, M[2] * vx + M[3] * vy];
  const [sv0x, sv0y] = toScreen(vx, vy);
  const [smvx, smvy] = toScreen(Mv[0], Mv[1]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Inverse Matrices &amp; Determinants</h3>
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

      {s.showPresets && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => setPresetIdx(i)}
              className={`px-3 py-1.5 rounded text-xs ${i === presetIdx ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>
              {p.label}
            </button>
          ))}
          <span className="text-xs text-slate-400 self-center">{PRESETS[presetIdx].desc}</span>
        </div>
      )}

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* input square */}
          <polygon points={inPts} fill="#6366f1" opacity="0.12" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3" />

          {/* output transformed */}
          <polygon points={outPts} fill="#f59e0b" opacity="0.2" stroke="#f59e0b" strokeWidth="2" />

          {/* inverse brings back */}
          {s.phase === 'inverse' && Minv && (
            <polygon points={invPts} fill="#10b981" opacity="0.3" stroke="#10b981" strokeWidth="2" strokeDasharray="3,2" />
          )}

          {/* vectors */}
          <Arrow x1={ox} y1={oy} x2={sv0x} y2={sv0y} color="#6366f1" width={2.5} />
          <Arrow x1={ox} y1={oy} x2={smvx} y2={smvy} color="#f59e0b" width={2.5} />

          <text x={sv0x + 6} y={sv0y - 4} fontSize="11" fill="#6366f1" fontWeight="600">x</text>
          <text x={smvx + 6} y={smvy - 4} fontSize="11" fill="#f59e0b" fontWeight="600">Mx</text>

          <circle cx={ox} cy={oy} r="3" fill="#475569" />

          <text x={10} y={H - 12} fontSize="11" fontFamily="monospace"
            fill={Math.abs(det) < 0.01 ? '#ef4444' : '#10b981'} fontWeight="600">
            det = {det.toFixed(2)}  {Math.abs(det) < 0.01 ? '— singular!' : '— invertible'}
          </text>

          {s.phase === 'singular' && Math.abs(det) < 0.01 && (
            <text x={W / 2} y={30} fontSize="12" fill="#ef4444" textAnchor="middle" fontWeight="700">No inverse exists!</text>
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
