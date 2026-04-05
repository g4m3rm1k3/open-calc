import React, { useState, useRef, useCallback } from 'react';

const W = 320, H = 280, CX = 160, CY = 140, SCALE = 54;

function toScreen(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }
function fromScreen(sx, sy) { return [(sx - CX) / SCALE, -(sy - CY) / SCALE]; }

function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
function scale(s, v) { return [s * v[0], s * v[1]]; }
function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function norm(v) { return Math.sqrt(v[0] * v[0] + v[1] * v[1]); }

function project(b, a) {
  // Project b onto a: (b·a / a·a) * a
  const len2 = dot(a, a);
  if (len2 < 1e-10) return [0, 0];
  return scale(dot(b, a) / len2, a);
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

// Fixed subspace direction a = [1, 0.5]
const A = [1, 0.5];
const Anorm = norm(A);
const Aunit = [A[0] / Anorm, A[1] / Anorm];

export default function ProjectionMatrixViz() {
  const [bx, setBx] = useState(-0.5);
  const [by, setBy] = useState(1.8);
  const [showDouble, setShowDouble] = useState(false);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const b = [bx, by];
  const pb = project(b, A);   // Pb (first projection)
  const ppb = project(pb, A); // P(Pb) = Pb (should be same)

  const diff = Math.sqrt((pb[0] - ppb[0]) ** 2 + (pb[1] - ppb[1]) ** 2);

  const [ox, oy] = toScreen(0, 0);
  const [bsx, bsy] = toScreen(bx, by);
  const [pbx, pby] = toScreen(pb[0], pb[1]);

  const lineEnd1 = toScreen(-2.5 * Aunit[0], -2.5 * Aunit[1]);
  const lineEnd2 = toScreen(2.5 * Aunit[0], 2.5 * Aunit[1]);

  const handleMouseDown = useCallback(() => { dragging.current = true; }, []);
  const handleMouseUp = useCallback(() => { dragging.current = false; }, []);
  const handleMouseMove = useCallback((e) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (W / rect.width);
    const sy = (e.clientY - rect.top) * (H / rect.height);
    const [nx, ny] = fromScreen(sx, sy);
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    setBx(clamp(nx, -2.2, 2.2));
    setBy(clamp(ny, -2.2, 2.2));
  }, []);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Projection Matrix: P² = P</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        Drag <strong>b</strong> (gold). The blue vector is Pb — its projection onto the subspace (line). Enable "project twice" to see P(Pb) = Pb. Once projected, it stays put.
      </p>

      <div className="flex justify-center mb-3">
        <svg ref={svgRef} width={W} height={H}
          className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 cursor-crosshair"
          onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove}>
          <Grid />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" />

          {/* Subspace line */}
          <line x1={lineEnd1[0]} y1={lineEnd1[1]} x2={lineEnd2[0]} y2={lineEnd2[1]}
            stroke="#6366f1" strokeWidth="2" opacity="0.35" />
          <text x={lineEnd2[0] - 20} y={lineEnd2[1] - 8} fontSize="11" fill="#6366f1" opacity="0.7">col(A)</text>

          {/* Error vector (b - Pb) */}
          <line x1={pbx} y1={pby} x2={bsx} y2={bsy}
            stroke="#ef4444" strokeWidth="2" strokeDasharray="5,3" />
          {/* Right angle mark at projection point */}
          <rect x={pbx - 7} y={pby - 7} width={7} height={7}
            fill="none" stroke="#ef4444" strokeWidth="1.5"
            transform={`rotate(${Math.atan2(-(bsy - pby), bsx - pbx) * 180 / Math.PI - 90}, ${pbx}, ${pby})`} />
          <text x={(pbx + bsx) / 2 + 6} y={(pby + bsy) / 2} fontSize="11" fill="#ef4444">error ⊥</text>

          {/* b */}
          <Arrow x1={ox} y1={oy} x2={bsx} y2={bsy} color="#f59e0b" width={3} />
          <circle cx={bsx} cy={bsy} r="10" fill="#f59e0b" opacity="0.15" className="cursor-grab" />
          <circle cx={bsx} cy={bsy} r="6" fill="#f59e0b" className="cursor-grab" />
          <text x={bsx + 8} y={bsy - 6} fontSize="12" fill="#f59e0b" fontWeight="700">b</text>

          {/* Pb */}
          <Arrow x1={ox} y1={oy} x2={pbx} y2={pby} color="#6366f1" width={3} />
          <text x={pbx + 8} y={pby - 6} fontSize="12" fill="#6366f1" fontWeight="700">Pb</text>

          {/* P(Pb) */}
          {showDouble && (
            <>
              <circle cx={pbx} cy={pby} r="12" fill="none" stroke="#10b981" strokeWidth="2.5" />
              <text x={pbx + 16} y={pby + 16} fontSize="11" fill="#10b981" fontWeight="700">P(Pb) ≡ Pb ✓</text>
            </>
          )}

          <circle cx={ox} cy={oy} r="3" fill="#475569" />
        </svg>
      </div>

      <label className="flex items-center gap-3 mb-3 cursor-pointer px-1">
        <input type="checkbox" checked={showDouble} onChange={e => setShowDouble(e.target.checked)}
          className="accent-emerald-500 w-4 h-4" />
        <span className="text-sm text-slate-700 dark:text-slate-300">Show P(Pb) = Pb — projecting twice does nothing</span>
      </label>

      <div className={`rounded-lg px-3 py-2 text-sm text-center border ${
        diff < 0.001 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 border-red-300 text-red-700'
      }`}>
        <span className="font-mono">|P(Pb) − Pb|</span> = {diff.toFixed(6)} &nbsp;— P² = P (idempotent)
      </div>
    </div>
  );
}
