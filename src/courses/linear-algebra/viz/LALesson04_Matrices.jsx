import React, { useState } from 'react';

const W = 340, H = 320, CX = 170, CY = 160, SCALE = 55;

function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

function Arrow({ x1, y1, x2, y2, color, width = 2.5 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
  const ux = dx / len, uy = dy / len;
  const headLen = 9;
  const hx = x2 - ux * headLen, hy = y2 - uy * headLen;
  const perpX = -uy * 5, perpY = ux * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
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

// Transform a polygon's points
function transformPts(pts, m) {
  return pts.map(([x, y]) => [m[0] * x + m[1] * y, m[2] * x + m[3] * y]);
}

const PRESETS = [
  { label: 'Rotation 45°', m: [Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4), Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)] },
  { label: 'Stretch x2', m: [2, 0, 0, 1] },
  { label: 'Shear', m: [1, 1, 0, 1] },
  { label: 'Reflection y', m: [-1, 0, 0, 1] },
];

const UNIT_SQUARE = [[0, 0], [1, 0], [1, 1], [0, 1]];
const eBasis = [[1, 0], [0, 1]];

const STEPS = [
  {
    title: 'The Input: Basis Vectors',
    body: 'Every 2D matrix is defined by where it sends the two standard basis vectors: e₁ = [1, 0] and e₂ = [0, 1]. These are the x-axis and y-axis directions. The columns of the matrix ARE the destinations of e₁ and e₂.',
    formula: 'M = [Me₁ | Me₂]  (columns = images of basis)',
    showInput: true, showOutput: false,
  },
  {
    title: 'The Output: Transformed Vectors',
    body: 'Apply the matrix M. Each basis vector lands on the corresponding column of M. The unit square (spanned by e₁ and e₂) transforms into a parallelogram. This is what a matrix DOES — it transforms space.',
    formula: 'M·e₁ = column 1   M·e₂ = column 2',
    showInput: true, showOutput: true,
  },
  {
    title: 'The Determinant: Area Scaling',
    body: 'The determinant of M equals the area of the transformed parallelogram (signed — negative if orientation flips). det(M) = 0 means the matrix squashes space flat. det(M) = 1 means area is preserved.',
    formula: 'det(M) = ad − bc  =  area scale factor',
    showInput: true, showOutput: true, showDet: true,
  },
  {
    title: 'Try Different Matrices',
    body: 'Select a preset to see how different matrices transform space. Rotation preserves shape. Stretch scales one axis. Shear slants. Reflection flips. Each is a different geometric story told by the matrix.',
    formula: 'Linear map: T(av + bw) = aT(v) + bT(w)',
    showInput: true, showOutput: true, showPresets: true,
  },
];

export default function LALesson04_Matrices() {
  const [step, setStep] = useState(0);
  const [presetIdx, setPresetIdx] = useState(0);
  const s = STEPS[step];

  const M = PRESETS[presetIdx].m;
  const [a, b, c, d] = M;
  const det = a * d - b * c;

  const [ox, oy] = toScreen(0, 0);

  // Input basis vectors
  const [e1x, e1y] = toScreen(1, 0);
  const [e2x, e2y] = toScreen(0, 1);

  // Output (transformed) basis vectors
  const [te1x, te1y] = toScreen(a, c);
  const [te2x, te2y] = toScreen(b, d);

  // Unit square points
  const inPts = UNIT_SQUARE.map(([x, y]) => toScreen(x, y).join(',')).join(' ');
  const outRaw = transformPts(UNIT_SQUARE, M);
  const outPts = outRaw.map(([x, y]) => toScreen(x, y).join(',')).join(' ');

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Matrices as Transformations</h3>
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
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => setPresetIdx(i)}
              className={`px-3 py-1 rounded text-xs ${i === presetIdx ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* Input unit square */}
          {s.showInput && (
            <polygon points={inPts} fill="#6366f1" opacity="0.12" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3" />
          )}

          {/* Output transformed square */}
          {s.showOutput && (
            <polygon points={outPts} fill="#f59e0b" opacity="0.18" stroke="#f59e0b" strokeWidth="2" />
          )}

          {/* Input basis */}
          {s.showInput && (
            <>
              <Arrow x1={ox} y1={oy} x2={e1x} y2={e1y} color="#6366f1" width={2.5} />
              <text x={e1x + 6} y={e1y + 4} fontSize="12" fill="#6366f1" fontWeight="600">e₁</text>
              <Arrow x1={ox} y1={oy} x2={e2x} y2={e2y} color="#818cf8" width={2.5} />
              <text x={e2x - 16} y={e2y - 6} fontSize="12" fill="#818cf8" fontWeight="600">e₂</text>
            </>
          )}

          {/* Output transformed basis */}
          {s.showOutput && (
            <>
              <Arrow x1={ox} y1={oy} x2={te1x} y2={te1y} color="#f59e0b" width={2.5} />
              <text x={te1x + 6} y={te1y - 4} fontSize="12" fill="#f59e0b" fontWeight="600">Me₁</text>
              <Arrow x1={ox} y1={oy} x2={te2x} y2={te2y} color="#fb923c" width={2.5} />
              <text x={te2x + 6} y={te2y - 4} fontSize="12" fill="#fb923c" fontWeight="600">Me₂</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />

          {/* Matrix display */}
          <text x={12} y={20} fontSize="11" fill="#6366f1" fontWeight="700" fontFamily="monospace">
            M = [{a.toFixed(1)}, {b.toFixed(1)}]
          </text>
          <text x={12} y={34} fontSize="11" fill="#6366f1" fontFamily="monospace">
            {'    '}[{c.toFixed(1)}, {d.toFixed(1)}]
          </text>

          {s.showDet && (
            <text x={W - 10} y={H - 10} fontSize="11" fill="#f59e0b" textAnchor="end" fontWeight="600">
              det = {det.toFixed(2)}
            </text>
          )}
        </svg>
      </div>

      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700">
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
