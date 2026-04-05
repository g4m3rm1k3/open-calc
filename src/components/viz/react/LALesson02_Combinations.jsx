import React, { useState, useRef, useEffect, useCallback } from 'react';

const W = 340, H = 340, O = 170, SCALE = 50;

function toScreen(x, y) {
  return [O + x * SCALE, O - y * SCALE];
}

function Arrow({ x1, y1, x2, y2, color = '#6366f1', width = 2.5, dashed = false }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.5) return null;
  const ux = dx / len, uy = dy / len;
  const headLen = 10;
  const hx = x2 - ux * headLen, hy = y2 - uy * headLen;
  const perpX = -uy * 5, perpY = ux * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? '6,4' : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + perpX},${hy + perpY} ${hx - perpX},${hy - perpY}`}
        fill={color} />
    </g>
  );
}

function Grid() {
  const lines = [];
  for (let i = -3; i <= 3; i++) {
    const [sx, sy] = toScreen(i, -3.5);
    const [ex, ey] = toScreen(i, 3.5);
    lines.push(<line key={`v${i}`} x1={sx} y1={sy} x2={ex} y2={ey} stroke="#e2e8f0" strokeWidth="1" />);
    const [sx2, sy2] = toScreen(-3.5, i);
    const [ex2, ey2] = toScreen(3.5, i);
    lines.push(<line key={`h${i}`} x1={sx2} y1={sy2} x2={ex2} y2={ey2} stroke="#e2e8f0" strokeWidth="1" />);
  }
  return <g>{lines}</g>;
}

const V1 = [1, 0];
const V2 = [0, 1];

const STEPS = [
  {
    title: 'Two Vectors',
    body: 'Start with two vectors: v₁ = [1, 0] (pointing right) and v₂ = [0, 1] (pointing up). They sit in the plane, each pointing in a different direction.',
    formula: 'v₁ = [1, 0]   v₂ = [0, 1]',
    showV1: true, showV2: true, showCombo: false, showSpan: false, showSliders: false,
  },
  {
    title: 'Scale Each Vector',
    body: 'Multiply v₁ by scalar a, and v₂ by scalar b. Scalars stretch or shrink (or flip) a vector without changing its direction. Drag the sliders to see how.',
    formula: 'a · v₁   and   b · v₂',
    showV1: true, showV2: true, showCombo: false, showSpan: false, showSliders: true,
  },
  {
    title: 'A Linear Combination',
    body: 'Now add them together. The result a·v₁ + b·v₂ is called a linear combination of v₁ and v₂. Every point in the plane can be reached this way.',
    formula: 'a · v₁ + b · v₂',
    showV1: true, showV2: true, showCombo: true, showSpan: false, showSliders: true,
  },
  {
    title: 'The Span',
    body: 'The set of ALL possible linear combinations of v₁ and v₂ is their span. When v₁ and v₂ point in different directions, their span fills the entire 2D plane — every point is reachable.',
    formula: 'span{v₁, v₂} = ℝ²',
    showV1: true, showV2: true, showCombo: true, showSpan: true, showSliders: true,
  },
  {
    title: 'Linear Independence',
    body: 'v₁ and v₂ are linearly independent — neither one can be written as a scalar multiple of the other. If they were parallel, their span would collapse to a single line. Independence is what lets the span fill the whole plane.',
    formula: 'a·v₁ + b·v₂ = 0  ⟹  a = b = 0',
    showV1: true, showV2: true, showCombo: true, showSpan: false, showSliders: false,
  },
];

export default function LALesson02_Combinations() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState(1.5);
  const [b, setB] = useState(1.2);
  const s = STEPS[step];

  const aV1 = [s.showSliders ? a * V1[0] : V1[0], s.showSliders ? a * V1[1] : V1[1]];
  const bV2 = [s.showSliders ? b * V2[0] : V2[0], s.showSliders ? b * V2[1] : V2[1]];
  const combo = [aV1[0] + bV2[0], aV1[1] + bV2[1]];

  const [ox, oy] = toScreen(0, 0);
  const [v1x, v1y] = toScreen(aV1[0], aV1[1]);
  const [v2x, v2y] = toScreen(bV2[0], bV2[1]);
  const [cx, cy] = toScreen(combo[0], combo[1]);

  // span dots
  const spanDots = [];
  if (s.showSpan) {
    for (let aa = -3; aa <= 3; aa += 0.4) {
      for (let bb = -3; bb <= 3; bb += 0.4) {
        const px = aa * V1[0] + bb * V2[0];
        const py = aa * V1[1] + bb * V2[1];
        if (Math.abs(px) <= 3.2 && Math.abs(py) <= 3.2) {
          const [sx, sy] = toScreen(px, py);
          spanDots.push(<circle key={`${aa},${bb}`} cx={sx} cy={sy} r="2" fill="#a78bfa" opacity="0.4" />);
        }
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-semibold">Linear Combinations &amp; Span</h3>
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
          <p className="mt-2 font-mono text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center text-slate-800 dark:text-slate-200">{s.formula}</p>
        </div>
      </div>

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          {/* axes */}
          <line x1={O} y1={10} x2={O} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={O} x2={W - 10} y2={O} stroke="#94a3b8" strokeWidth="1" />

          {spanDots}

          {/* v1 (scaled) */}
          {s.showV1 && (
            <Arrow x1={ox} y1={oy} x2={v1x} y2={v1y} color="#6366f1" width={2.5} />
          )}
          {s.showV1 && (
            <text x={v1x + 8} y={v1y - 4} fontSize="12" fill="#6366f1" fontWeight="600">
              {s.showSliders ? `${a.toFixed(1)}v₁` : 'v₁'}
            </text>
          )}

          {/* v2 (scaled), drawn from origin */}
          {s.showV2 && (
            <Arrow x1={ox} y1={oy} x2={v2x} y2={v2y} color="#10b981" width={2.5} />
          )}
          {s.showV2 && (
            <text x={v2x + 8} y={v2y - 4} fontSize="12" fill="#10b981" fontWeight="600">
              {s.showSliders ? `${b.toFixed(1)}v₂` : 'v₂'}
            </text>
          )}

          {/* parallelogram */}
          {s.showCombo && (
            <>
              <Arrow x1={v1x} y1={v1y} x2={cx} y2={cy} color="#10b981" width={1.5} dashed />
              <Arrow x1={v2x} y1={v2y} x2={cx} y2={cy} color="#6366f1" width={1.5} dashed />
              <Arrow x1={ox} y1={oy} x2={cx} y2={cy} color="#f59e0b" width={3} />
              <text x={cx + 8} y={cy - 4} fontSize="12" fill="#f59e0b" fontWeight="700">
                {`a·v₁ + b·v₂`}
              </text>
              <circle cx={cx} cy={cy} r="4" fill="#f59e0b" />
            </>
          )}

          <circle cx={ox} cy={oy} r="4" fill="#475569" />
          <text x={ox + 5} y={oy + 15} fontSize="11" fill="#94a3b8">O</text>
        </svg>
      </div>

      {s.showSliders && (
        <div className="space-y-2 mb-3 px-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono w-10 text-violet-600 dark:text-violet-400">a =</span>
            <input type="range" min="-2.5" max="2.5" step="0.1" value={a}
              onChange={e => setA(parseFloat(e.target.value))}
              className="flex-1 accent-violet-500" />
            <span className="text-sm font-mono w-10 text-right text-slate-600 dark:text-slate-300">{a.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono w-10 text-emerald-600 dark:text-emerald-400">b =</span>
            <input type="range" min="-2.5" max="2.5" step="0.1" value={b}
              onChange={e => setB(parseFloat(e.target.value))}
              className="flex-1 accent-emerald-500" />
            <span className="text-sm font-mono w-10 text-right text-slate-600 dark:text-slate-300">{b.toFixed(1)}</span>
          </div>
        </div>
      )}

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
