import React, { useState } from 'react';

const W = 340, H = 280, O = 170, SCALE = 50;

function toScreen(x, y) { return [O + x * SCALE, H / 2 - y * SCALE]; }

function Arrow({ x1, y1, x2, y2, color = '#6366f1', width = 2.5, dashed = false }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
  const ux = dx / len, uy = dy / len;
  const headLen = 10;
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
  const oy = H / 2;
  for (let i = -3; i <= 3; i++) {
    const [sx] = toScreen(i, 0);
    lines.push(<line key={`v${i}`} x1={sx} y1={10} x2={sx} y2={H - 10} stroke="#e2e8f0" strokeWidth="1" />);
    const [, sy] = toScreen(0, i);
    lines.push(<line key={`h${i}`} x1={10} y1={sy} x2={W - 10} y2={sy} stroke="#e2e8f0" strokeWidth="1" />);
  }
  return <g>{lines}</g>;
}

const STEPS = [
  {
    tab: 'Dot Product',
    title: 'What the Dot Product Measures',
    body: 'The dot product a·b = |a||b|cos(θ) measures how much two vectors point in the same direction. It is a single number — a scalar. Think of it as: "how much does a shadow of b fall along a?"',
    formula: 'a · b = a₁b₁ + a₂b₂ = |a||b| cos θ',
    mode: 'dot',
  },
  {
    tab: 'Projection',
    title: 'Projection: The Dot Product in Action',
    body: 'The component of b along a is (b·â), where â = a/|a| is the unit vector in direction a. The dot product gives you the length of this shadow. When θ = 90°, the dot product is 0 — perfectly perpendicular.',
    formula: 'proj_a b = (b · â) â     where â = a / |a|',
    mode: 'proj',
  },
  {
    tab: 'Orthogonality',
    title: 'Orthogonality: When the Dot is Zero',
    body: 'Two vectors are orthogonal (perpendicular) when their dot product is zero. This is the mathematical definition of "right angle." Orthogonality is fundamental — it is why coordinates work: the x-axis and y-axis are orthogonal.',
    formula: 'a · b = 0  ⟺  a ⊥ b  ⟺  θ = 90°',
    mode: 'ortho',
  },
  {
    tab: 'Cross Product',
    title: 'The Cross Product: Area and Direction',
    body: 'In 3D, the cross product a × b creates a NEW vector perpendicular to both. Its magnitude equals the area of the parallelogram spanned by a and b. Direction follows the right-hand rule: curl fingers from a to b, thumb points along a × b.',
    formula: '|a × b| = |a||b| sin θ   (area of parallelogram)',
    mode: 'cross',
  },
];

function DotScene({ mode, angleA, angleB, len }) {
  const ax = Math.cos(angleA) * len, ay = Math.sin(angleA) * len;
  const bx = Math.cos(angleB) * len, by = Math.sin(angleB) * len;

  const [ox, oy] = toScreen(0, 0);
  const [ax2, ay2] = toScreen(ax, ay);
  const [bx2, by2] = toScreen(bx, by);

  const dot = ax * bx + ay * by;
  const lenA = Math.sqrt(ax * ax + ay * ay);
  const lenB = Math.sqrt(bx * bx + by * by);
  const cosTheta = dot / (lenA * lenB + 0.0001);
  const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)));

  // projection of b onto a
  const unitAx = ax / lenA, unitAy = ay / lenA;
  const projLen = (bx * unitAx + by * unitAy);
  const projX = projLen * unitAx, projY = projLen * unitAy;
  const [px, py] = toScreen(projX, projY);
  const [bfx, bfy] = toScreen(bx, by);

  // angle arc
  const arcR = 28;
  const arcX = ox + Math.cos(angleA) * arcR;
  const arcY = oy - Math.sin(angleA) * arcR;
  const arcX2 = ox + Math.cos(angleB) * arcR;
  const arcY2 = oy - Math.sin(angleB) * arcR;

  if (mode === 'cross') {
    // 2D cross product magnitude visualization (area)
    const area = Math.abs(ax * by - ay * bx);
    const areaPts = [
      toScreen(0, 0), toScreen(ax, ay), toScreen(ax + bx, ay + by), toScreen(bx, by)
    ].map(([x, y]) => `${x},${y}`).join(' ');
    return (
      <g>
        <polygon points={areaPts} fill="#f59e0b" opacity="0.2" />
        <polygon points={areaPts} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
        <Arrow x1={ox} y1={oy} x2={ax2} y2={ay2} color="#6366f1" width={2.5} />
        <text x={ax2 + 6} y={ay2 - 4} fontSize="12" fill="#6366f1" fontWeight="600">a</text>
        <Arrow x1={ox} y1={oy} x2={bx2} y2={by2} color="#10b981" width={2.5} />
        <text x={bx2 + 6} y={by2 - 4} fontSize="12" fill="#10b981" fontWeight="600">b</text>
        <text x={toScreen((ax + bx) / 2, (ay + by) / 2)[0]} y={toScreen((ax + bx) / 2, (ay + by) / 2)[1] - 8}
          fontSize="11" fill="#f59e0b" fontWeight="600" textAnchor="middle">
          area = {area.toFixed(2)}
        </text>
        <circle cx={ox} cy={oy} r="3" fill="#475569" />
      </g>
    );
  }

  return (
    <g>
      {mode === 'proj' && (
        <>
          {/* drop line from b tip to projection */}
          <line x1={bx2} y1={by2} x2={px} y2={py} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" />
          <circle cx={px} cy={py} r="5" fill="#f59e0b" />
          <Arrow x1={ox} y1={oy} x2={px} y2={py} color="#f59e0b" width={2.5} />
          <text x={(ox + px) / 2 - 12} y={(oy + py) / 2 - 8} fontSize="11" fill="#f59e0b" fontWeight="600">proj</text>
        </>
      )}

      {mode === 'ortho' && Math.abs(theta - Math.PI / 2) < 0.15 && (
        <text x={W / 2} y={30} fontSize="12" fill="#10b981" fontWeight="700" textAnchor="middle">⊥ Orthogonal!</text>
      )}

      <Arrow x1={ox} y1={oy} x2={ax2} y2={ay2} color="#6366f1" width={2.5} />
      <text x={ax2 + 6} y={ay2 - 4} fontSize="12" fill="#6366f1" fontWeight="600">a</text>
      <Arrow x1={ox} y1={oy} x2={bx2} y2={by2} color="#10b981" width={2.5} />
      <text x={bx2 + 6} y={by2 - 4} fontSize="12" fill="#10b981" fontWeight="600">b</text>

      {/* angle arc */}
      <path d={`M ${arcX} ${arcY} A ${arcR} ${arcR} 0 ${Math.abs(angleB - angleA) > Math.PI ? 1 : 0} ${angleA < angleB ? 0 : 1} ${arcX2} ${arcY2}`}
        fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <text x={ox + 42 * Math.cos((angleA + angleB) / 2)} y={oy - 42 * Math.sin((angleA + angleB) / 2)}
        fontSize="11" fill="#f59e0b" fontWeight="600">θ</text>

      <text x={W - 10} y={H - 10} fontSize="11" fill="#6366f1" textAnchor="end">
        a·b = {dot.toFixed(2)}
      </text>

      <circle cx={ox} cy={oy} r="3" fill="#475569" />
    </g>
  );
}

export default function LALesson03_DotCross() {
  const [step, setStep] = useState(0);
  const [angleA, setAngleA] = useState(0.3);
  const [angleB, setAngleB] = useState(1.1);
  const [vecLen, setVecLen] = useState(2);

  const s = STEPS[step];

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Dot Product &amp; Cross Product</h3>
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
          <line x1={O} y1={10} x2={O} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={H / 2} x2={W - 10} y2={H / 2} stroke="#94a3b8" strokeWidth="1" />
          <DotScene mode={s.mode} angleA={angleA} angleB={angleB} len={vecLen} />
        </svg>
      </div>

      <div className="space-y-2 mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-14 text-violet-600 dark:text-violet-400">angle a</span>
          <input type="range" min="0" max={Math.PI * 2} step="0.05" value={angleA}
            onChange={e => setAngleA(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
          <span className="text-xs font-mono w-12 text-right text-slate-500">{(angleA * 180 / Math.PI).toFixed(0)}°</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-14 text-emerald-600 dark:text-emerald-400">angle b</span>
          <input type="range" min="0" max={Math.PI * 2} step="0.05" value={angleB}
            onChange={e => setAngleB(parseFloat(e.target.value))} className="flex-1 accent-emerald-500" />
          <span className="text-xs font-mono w-12 text-right text-slate-500">{(angleB * 180 / Math.PI).toFixed(0)}°</span>
        </div>
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
