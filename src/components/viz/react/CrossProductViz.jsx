import React, { useState } from 'react';

const W = 340, H = 300, CX = 170, CY = 150, SCALE = 50;

function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }

function Arrow({ x1, y1, x2, y2, color, width = 2.5 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return null;
  const ux = dx / len, uy = dy / len;
  const hl = 9;
  const hx = x2 - ux * hl, hy = y2 - uy * hl;
  const px = -uy * 5, py = ux * 5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
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

export default function CrossProductViz() {
  const [angleA, setAngleA] = useState(0.2);
  const [angleB, setAngleB] = useState(1.3);
  const [lenA, setLenA] = useState(2);
  const [lenB, setLenB] = useState(1.8);

  const ax = Math.cos(angleA) * lenA, ay = Math.sin(angleA) * lenA;
  const bx = Math.cos(angleB) * lenB, by = Math.sin(angleB) * lenB;

  // 2D cross product magnitude: a×b = ax*by - ay*bx
  const crossMag = ax * by - ay * bx;
  const area = Math.abs(crossMag);

  const [ox, oy] = toScreen(0, 0);
  const [asx, asy] = toScreen(ax, ay);
  const [bsx, bsy] = toScreen(bx, by);
  const [abx, aby] = toScreen(ax + bx, ay + by);

  const paraPts = [
    toScreen(0, 0), toScreen(ax, ay), toScreen(ax + bx, ay + by), toScreen(bx, by)
  ].map(([x, y]) => `${x},${y}`).join(' ');

  const theta = Math.abs(angleB - angleA);
  const thetaDeg = (Math.min(theta, Math.PI * 2 - theta) * 180 / Math.PI).toFixed(0);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">The Cross Product: Area &amp; Direction</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        The magnitude of a × b equals the area of the parallelogram they span. Direction (in 3D) is perpendicular to both — the right-hand rule.
      </p>

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* Parallelogram */}
          <polygon points={paraPts} fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5,3" />

          {/* Area label in center */}
          <text x={(ox + abx) / 2} y={(oy + aby) / 2}
            fontSize="12" fill="#f59e0b" fontWeight="700" textAnchor="middle">
            area = {area.toFixed(2)}
          </text>

          {/* Vectors */}
          <Arrow x1={ox} y1={oy} x2={asx} y2={asy} color="#6366f1" width={3} />
          <text x={asx + 6} y={asy - 4} fontSize="13" fill="#6366f1" fontWeight="700">a</text>

          <Arrow x1={ox} y1={oy} x2={bsx} y2={bsy} color="#10b981" width={3} />
          <text x={bsx + 6} y={bsy - 4} fontSize="13" fill="#10b981" fontWeight="700">b</text>

          {/* Dotted parallel sides */}
          <line x1={asx} y1={asy} x2={abx} y2={aby} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" />
          <line x1={bsx} y1={bsy} x2={abx} y2={aby} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4,3" />

          {/* Cross product indicator (perpendicular symbol) */}
          <circle cx={CX + 80} cy={30} r="14" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5" />
          <text x={CX + 80} y={30} fontSize="14" fill="#f59e0b" fontWeight="700" textAnchor="middle" dominantBaseline="central">⊗</text>
          <text x={CX + 80} y={48} fontSize="9" fill="#f59e0b" textAnchor="middle">a×b (into page)</text>

          <circle cx={ox} cy={oy} r="3" fill="#475569" />

          <text x={W - 10} y={H - 12} fontSize="11" fill="#94a3b8" textAnchor="end">θ ≈ {thetaDeg}°</text>
          <text x={10} y={H - 12} fontSize="11" fill="#f59e0b">|a×b| = |a||b|sinθ = {area.toFixed(2)}</text>
        </svg>
      </div>

      <div className="space-y-2 mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-14 text-violet-600">angle a</span>
          <input type="range" min="0" max={Math.PI * 2} step="0.05" value={angleA}
            onChange={e => setAngleA(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
          <span className="text-xs font-mono w-12 text-right text-slate-500">{(angleA * 180 / Math.PI).toFixed(0)}°</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-14 text-emerald-600">angle b</span>
          <input type="range" min="0" max={Math.PI * 2} step="0.05" value={angleB}
            onChange={e => setAngleB(parseFloat(e.target.value))} className="flex-1 accent-emerald-500" />
          <span className="text-xs font-mono w-12 text-right text-slate-500">{(angleB * 180 / Math.PI).toFixed(0)}°</span>
        </div>
      </div>

      {area < 0.1 && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300 text-center">
          Parallel vectors! sin(0°) = 0 → zero cross product → zero area
        </div>
      )}
    </div>
  );
}
