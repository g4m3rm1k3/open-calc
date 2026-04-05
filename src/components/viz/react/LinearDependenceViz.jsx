import React, { useState } from 'react';

const W = 340, H = 300, CX = 170, CY = 150, SCALE = 48;

function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

function Arrow({ x1, y1, x2, y2, color, width = 2.5, dashed = false }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
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
  for (let i = -3; i <= 3; i++) {
    const [sx] = toScreen(i, 0); const [, sy] = toScreen(0, i);
    lines.push(<line key={`v${i}`} x1={sx} y1={10} x2={sx} y2={H - 10} stroke="#e2e8f0" strokeWidth="1" />);
    lines.push(<line key={`h${i}`} x1={10} y1={sy} x2={W - 10} y2={sy} stroke="#e2e8f0" strokeWidth="1" />);
  }
  return <g>{lines}</g>;
}

// Two parallel vectors: v1 = [1, 0.5], v2 = [2, 1] — same direction
const V1 = [1, 0.5];
const V2 = [2, 1]; // = 2 * V1

// Fixed target point not on this line
const TARGET = [0.5, 2.2];

export default function LinearDependenceViz() {
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(0.5);

  const combo = [c1 * V1[0] + c2 * V2[0], c1 * V1[1] + c2 * V2[1]];
  const [ox, oy] = toScreen(0, 0);
  const [v1x, v1y] = toScreen(V1[0], V1[1]);
  const [v2x, v2y] = toScreen(V2[0], V2[1]);
  const [cx, cy] = toScreen(combo[0], combo[1]);
  const [tx, ty] = toScreen(TARGET[0], TARGET[1]);

  // Distance from combo to target
  const dist = Math.sqrt((combo[0] - TARGET[0]) ** 2 + (combo[1] - TARGET[1]) ** 2);

  // The span is the line through origin with direction [1, 0.5]
  const lineEnd1 = toScreen(-3, -1.5);
  const lineEnd2 = toScreen(3, 1.5);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Trapped on a Line</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        v₁ = [1, 0.5] and v₂ = [2, 1] are <strong>parallel</strong> — v₂ = 2v₁. Try to reach the red target using any c₁ and c₂. You cannot. Dependent vectors cannot span 2D.
      </p>

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* The span = a single line */}
          <line x1={lineEnd1[0]} y1={lineEnd1[1]} x2={lineEnd2[0]} y2={lineEnd2[1]}
            stroke="#6366f1" strokeWidth="2" opacity="0.25" />
          <text x={lineEnd2[0] - 50} y={lineEnd2[1] - 8} fontSize="11" fill="#6366f1" opacity="0.7">span (a line)</text>

          {/* v1 and v2 */}
          <Arrow x1={ox} y1={oy} x2={v1x} y2={v1y} color="#6366f1" width={2.5} />
          <text x={v1x + 6} y={v1y - 4} fontSize="12" fill="#6366f1" fontWeight="600">v₁</text>
          <Arrow x1={ox} y1={oy} x2={v2x} y2={v2y} color="#818cf8" width={2} dashed />
          <text x={v2x + 6} y={v2y - 4} fontSize="12" fill="#818cf8" fontWeight="600">v₂ = 2v₁</text>

          {/* Combination */}
          <Arrow x1={ox} y1={oy} x2={cx} y2={cy} color="#f59e0b" width={3} />
          <text x={cx + 6} y={cy + 4} fontSize="11" fill="#f59e0b" fontWeight="600">c₁v₁+c₂v₂</text>

          {/* Target */}
          <circle cx={tx} cy={ty} r="8" fill="#ef4444" opacity="0.9" />
          <text x={tx + 12} y={ty - 4} fontSize="12" fill="#ef4444" fontWeight="700">Target</text>

          {/* Distance line */}
          <line x1={cx} y1={cy} x2={tx} y2={ty} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={(cx + tx) / 2 + 6} y={(cy + ty) / 2} fontSize="11" fill="#ef4444">d = {dist.toFixed(2)}</text>

          <circle cx={ox} cy={oy} r="3" fill="#475569" />
        </svg>
      </div>

      <div className="space-y-2 mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-10 text-violet-600 dark:text-violet-400">c₁ =</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" value={c1}
            onChange={e => setC1(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
          <span className="text-sm font-mono w-10 text-right">{c1.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-10 text-indigo-500">c₂ =</span>
          <input type="range" min="-2.5" max="2.5" step="0.1" value={c2}
            onChange={e => setC2(parseFloat(e.target.value))} className="flex-1 accent-indigo-500" />
          <span className="text-sm font-mono w-10 text-right">{c2.toFixed(1)}</span>
        </div>
      </div>

      <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300 text-center">
        Distance to target: <strong>{dist.toFixed(3)}</strong> — no combination of parallel vectors can reach [0.5, 2.2]
      </div>
    </div>
  );
}
