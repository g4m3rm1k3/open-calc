import React, { useState, useRef, useCallback } from 'react';

const W = 340, H = 320, O = 60, SCALE = 55;
const GRID_MAX = 4;

function toScreen(x, y) { return [O + x * SCALE, H - O - y * SCALE]; }
function fromScreen(sx, sy) { return [(sx - O) / SCALE, (H - O - sy) / SCALE]; }

function Arrow({ x1, y1, x2, y2, color = '#6366f1', width = 3 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 4) return null;
  const ux = dx / len, uy = dy / len;
  const hl = 11;
  const hx = x2 - ux * hl, hy = y2 - uy * hl;
  const px = -uy * 6, py = ux * 6;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill={color} />
    </g>
  );
}

export default function MagnitudeAndDirectionViz() {
  const [vx, setVx] = useState(3);
  const [vy, setVy] = useState(4);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const handleMouseDown = useCallback((e) => {
    dragging.current = true;
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (W / rect.width);
    const sy = (e.clientY - rect.top) * (H / rect.height);
    const [fx, fy] = fromScreen(sx, sy);
    setVx(clamp(Math.round(fx * 2) / 2, 0.5, GRID_MAX));
    setVy(clamp(Math.round(fy * 2) / 2, 0.5, GRID_MAX));
  }, []);

  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);

  const mag = Math.sqrt(vx * vx + vy * vy);
  const angle = (Math.atan2(vy, vx) * 180 / Math.PI).toFixed(1);

  const [ox, oy] = toScreen(0, 0);
  const [tx, ty] = toScreen(vx, vy);
  const [fx, fy_] = toScreen(vx, 0); // foot of vertical

  // Grid lines
  const gridLines = [];
  for (let i = 0; i <= GRID_MAX; i++) {
    const [sx] = toScreen(i, 0); const [, sy] = toScreen(0, i);
    gridLines.push(<line key={`v${i}`} x1={sx} y1={O} x2={sx} y2={H - O} stroke="#e2e8f0" strokeWidth="1" />);
    gridLines.push(<line key={`h${i}`} x1={O} y1={sy} x2={W - 10} y2={sy} stroke="#e2e8f0" strokeWidth="1" />);
    if (i > 0) {
      gridLines.push(<text key={`lx${i}`} x={sx} y={H - O + 14} fontSize="11" fill="#94a3b8" textAnchor="middle">{i}</text>);
      gridLines.push(<text key={`ly${i}`} x={O - 8} y={sy + 4} fontSize="11" fill="#94a3b8" textAnchor="end">{i}</text>);
    }
  }

  // Angle arc
  const arcR = 36;
  const arcEndX = ox + arcR * Math.cos(-parseFloat(angle) * Math.PI / 180);
  const arcEndY = oy + arcR * Math.sin(-parseFloat(angle) * Math.PI / 180);
  const largeArc = parseFloat(angle) > 180 ? 1 : 0;

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Magnitude &amp; Pythagoras</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Drag the arrow tip to any grid point. Watch the right triangle reveal how magnitude is computed from components.
      </p>

      <div className="flex justify-center mb-3">
        <svg ref={svgRef} width={W} height={H}
          className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 cursor-crosshair"
          onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          {gridLines}
          {/* Axes */}
          <line x1={O} y1={O} x2={O} y2={H - O} stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={O} y1={H - O} x2={W - 10} y2={H - O} stroke="#94a3b8" strokeWidth="1.5" />

          {/* Right triangle */}
          {/* Horizontal leg */}
          <line x1={ox} y1={oy} x2={fx} y2={oy} stroke="#10b981" strokeWidth="2" strokeDasharray="6,3" />
          <text x={(ox + fx) / 2} y={oy + 16} fontSize="12" fill="#10b981" fontWeight="600" textAnchor="middle">x = {vx}</text>
          {/* Vertical leg */}
          <line x1={fx} y1={oy} x2={fx} y2={ty} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6,3" />
          <text x={fx + 10} y={(oy + ty) / 2 + 4} fontSize="12" fill="#f59e0b" fontWeight="600">y = {vy}</text>
          {/* Right angle mark */}
          <rect x={fx - 8} y={oy - 8} width={8} height={8} fill="none" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Angle arc */}
          <path d={`M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${arcEndX} ${arcEndY}`}
            fill="none" stroke="#a78bfa" strokeWidth="1.5" />
          <text x={ox + 48} y={oy - 10} fontSize="11" fill="#a78bfa" fontWeight="600">{angle}°</text>

          {/* Main vector */}
          <Arrow x1={ox} y1={oy} x2={tx} y2={ty} color="#6366f1" width={3} />

          {/* Hypotenuse label */}
          <text x={(ox + tx) / 2 - 14} y={(oy + ty) / 2 - 8}
            fontSize="12" fill="#6366f1" fontWeight="700" textAnchor="middle">
            |v| = {mag.toFixed(2)}
          </text>

          {/* Draggable tip */}
          <circle cx={tx} cy={ty} r="10" fill="#6366f1" opacity="0.15" className="cursor-grab" onMouseDown={handleMouseDown} />
          <circle cx={tx} cy={ty} r="6" fill="#6366f1" className="cursor-grab" onMouseDown={handleMouseDown} />

          <circle cx={ox} cy={oy} r="4" fill="#475569" />
          <text x={ox - 12} y={oy + 12} fontSize="11" fill="#94a3b8">O</text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">x component</p>
          <p className="font-mono font-bold text-lg">{vx}</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">y component</p>
          <p className="font-mono font-bold text-lg">{vy}</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2">
          <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">|v| = √(x²+y²)</p>
          <p className="font-mono font-bold text-lg">{mag.toFixed(3)}</p>
        </div>
      </div>

      {Math.abs(mag - 5) < 0.01 && (
        <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300 text-center font-semibold">
          The 3-4-5 right triangle! √(9+16) = √25 = 5
        </div>
      )}
    </div>
  );
}
