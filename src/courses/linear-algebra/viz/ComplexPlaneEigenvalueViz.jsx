import React, { useState, useRef, useCallback } from 'react';

const W = 320, H = 280, CX = 160, CY = 140, SCALE = 55;

function toScreen(re, im) { return [CX + re * SCALE, CY - im * SCALE]; }
function fromScreen(sx, sy) { return [(sx - CX) / SCALE, -(sy - CY) / SCALE]; }

function applyRot(r, theta, x, y) {
  return [r * (x * Math.cos(theta) - y * Math.sin(theta)),
          r * (x * Math.sin(theta) + y * Math.cos(theta))];
}

const UNIT_CIRCLE = Array.from({ length: 64 }, (_, i) => {
  const t = (i / 63) * Math.PI * 2;
  const [sx, sy] = toScreen(Math.cos(t), Math.sin(t));
  return `${sx},${sy}`;
}).join(' ');

export default function ComplexPlaneEigenvalueViz() {
  const [re, setRe] = useState(0.8);
  const [im, setIm] = useState(0.5);
  const [nSteps, setNSteps] = useState(10);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const r = Math.sqrt(re * re + im * im);
  const theta = Math.atan2(im, re);
  const thetaDeg = (theta * 180 / Math.PI).toFixed(1);

  // Trajectory: apply M^k to starting vector [1, 0]
  const traj = [[1, 0]];
  let [x, y] = [1, 0];
  for (let i = 0; i < nSteps; i++) {
    [x, y] = applyRot(r, theta, x, y);
    traj.push([x, y]);
  }

  // Clamp trajectory for display
  const scale = Math.max(1, traj.reduce((m, [x, y]) => Math.max(m, Math.sqrt(x * x + y * y)), 0));
  const dispScale = Math.min(1, 1.8 / scale);

  const handleMouseDown = useCallback(() => { dragging.current = true; }, []);
  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);
  const handleMouseMove = useCallback((e) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (W / rect.width);
    const sy = (e.clientY - rect.top) * (H / rect.height);
    const [nr, ni] = fromScreen(sx, sy);
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    setRe(clamp(Math.round(nr * 20) / 20, -1.5, 1.5));
    setIm(clamp(Math.round(ni * 20) / 20, -1.5, 1.5));
  }, []);

  const [evx, evy] = toScreen(re, im);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Eigenvalues in the Complex Plane</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Drag the eigenvalue λ = a + bi. Points <strong>inside</strong> the unit circle → spiral in. <strong>Outside</strong> → spiral out. <strong>On</strong> → circular orbit.
      </p>

      <div className="flex justify-center mb-3">
        <svg ref={svgRef} width={W} height={H}
          className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 cursor-crosshair"
          onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove}>

          {/* Grid */}
          {[-2, -1, 0, 1, 2].map(v => {
            const [sx] = toScreen(v, 0); const [, sy] = toScreen(0, v);
            return (
              <g key={v}>
                <line x1={sx} y1={10} x2={sx} y2={H - 10} stroke="#e2e8f0" strokeWidth="1" />
                <line x1={10} y1={sy} x2={W - 10} y2={sy} stroke="#e2e8f0" strokeWidth="1" />
                {v !== 0 && <text x={sx} y={CY + 14} fontSize="10" fill="#94a3b8" textAnchor="middle">{v}</text>}
              </g>
            );
          })}

          {/* Axes */}
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1.5" />
          <text x={W - 16} y={CY - 6} fontSize="10" fill="#94a3b8">Re</text>
          <text x={CX + 6} y={16} fontSize="10" fill="#94a3b8">Im</text>

          {/* Unit circle */}
          <polygon points={UNIT_CIRCLE} fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.6" />
          <text x={CX + SCALE + 4} y={CY - 4} fontSize="10" fill="#10b981" opacity="0.7">|λ|=1</text>

          {/* Trajectory */}
          {traj.slice(0, nSteps + 1).map(([tx, ty], i) => {
            const [sx, sy] = toScreen(tx * dispScale, ty * dispScale);
            return (
              <g key={i}>
                {i > 0 && (() => {
                  const [px, py] = toScreen(traj[i - 1][0] * dispScale, traj[i - 1][1] * dispScale);
                  return <line x1={px} y1={py} x2={sx} y2={sy} stroke="#6366f1" strokeWidth="1.5" opacity={0.6} />;
                })()}
                <circle cx={sx} cy={sy} r={i === 0 ? 5 : 3}
                  fill={i === 0 ? '#f59e0b' : i === nSteps ? '#ef4444' : '#6366f1'}
                  opacity={0.8} />
              </g>
            );
          })}

          {/* Eigenvalue point — draggable */}
          <circle cx={evx} cy={evy} r="14" fill="#f59e0b" opacity="0.15" className="cursor-grab" />
          <circle cx={evx} cy={evy} r="7" fill="#f59e0b" className="cursor-grab" />
          <text x={evx + 10} y={evy - 8} fontSize="11" fill="#f59e0b" fontWeight="700">λ</text>

          {/* |λ| annotation */}
          <line x1={CX} y1={CY} x2={evx} y2={evy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={(CX + evx) / 2 - 10} y={(CY + evy) / 2 - 6} fontSize="10" fill="#f59e0b">|λ|={r.toFixed(2)}</text>
        </svg>
      </div>

      <div className="flex items-center gap-3 mb-3 px-1">
        <span className="text-sm font-mono w-8 text-violet-500">n =</span>
        <input type="range" min="1" max="20" step="1" value={nSteps}
          onChange={e => setNSteps(parseInt(e.target.value))} className="flex-1 accent-violet-500" />
        <span className="text-xs font-mono w-6 text-right">{nSteps}</span>
      </div>

      <div className={`rounded-lg px-3 py-2 text-sm text-center font-semibold border ${
        r < 0.98 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' :
        r > 1.02 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' :
        'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
      }`}>
        λ = {re.toFixed(2)} + {im.toFixed(2)}i &nbsp;|&nbsp; θ = {thetaDeg}° &nbsp;|&nbsp;
        {r < 0.98 ? ' Stable — spirals in' : r > 1.02 ? ' Unstable — spirals out' : ' Neutral — circular orbit'}
      </div>
    </div>
  );
}
