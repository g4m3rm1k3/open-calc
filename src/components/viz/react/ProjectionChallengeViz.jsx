import { useState, useRef, useEffect, useCallback } from 'react';

const W = 360, H = 300, CX = 180, CY = 150, SC = 52;
const toS = (x, y) => [CX + x * SC, CY - y * SC];
const fromS = (sx, sy) => [(sx - CX) / SC, -(sy - CY) / SC];

const STEPS = [
  {
    title: 'The problem: closest point on a line',
    body: 'The orange point b is fixed in the plane. The draggable blue line passes through the origin (a 1D subspace). Which point on the line is closest to b? Drag the line to explore.',
  },
  {
    title: 'Challenge: minimize the error',
    body: 'The red dashed line shows the residual b-p. Drag the line to minimize its length. Watch the residual readout. When you find the minimum, the residual will be perpendicular to the line!',
  },
  {
    title: 'The projection formula reveals why',
    body: 'The optimal p is given by p = (aᵀb / aᵀa) · a. At this point, b-p is exactly perpendicular to the line direction a. The right-angle symbol confirms this geometric truth.',
  },
  {
    title: 'Project onto a plane (3D)',
    body: 'In 3D, we project onto a plane: p = A(AᵀA)⁻¹Aᵀb. This is the "hat matrix" H = A(AᵀA)⁻¹Aᵀ. In probe calibration, sensor readings are projected onto the best-fit surface — this formula finds it exactly.',
  },
];

function Arrow({ x1, y1, x2, y2, color, w = 2.5, dash = '' }) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len, hl = 8;
  const hx = x2 - ux * hl, hy = y2 - uy * hl;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
      {!dash && <polygon points={`${x2},${y2} ${hx - uy * 4},${hy + ux * 4} ${hx + uy * 4},${hy - ux * 4}`} fill={color} />}
    </g>
  );
}

function RightAngle({ cx, cy, ux, uy, size = 10, color = '#22c55e' }) {
  // Draw right-angle symbol at (cx,cy), line direction (ux,uy), perpendicular (-uy,ux)
  const px = -uy, py = ux;
  const x1 = cx + ux * size;
  const y1 = cy + uy * size;
  const x2 = cx + ux * size + px * size;
  const y2 = cy + uy * size + py * size;
  const x3 = cx + px * size;
  const y3 = cy + py * size;
  return <polyline points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill="none" stroke={color} strokeWidth="2" />;
}

export default function ProjectionChallengeViz() {
  const [step, setStep] = useState(0);
  // Line direction angle (in radians)
  const [lineAngle, setLineAngle] = useState(Math.PI / 6); // 30°
  // b is the fixed point
  const [b] = useState([1.8, 1.5]);
  const [draggingLine, setDraggingLine] = useState(false);
  const svgRef = useRef(null);

  // Line unit vector a
  const a = [Math.cos(lineAngle), Math.sin(lineAngle)];

  // Projection p = (aᵀb / aᵀa) * a
  const aDotB = a[0] * b[0] + a[1] * b[1];
  const aDotA = a[0] * a[0] + a[1] * a[1]; // = 1 since a is unit
  const lambda = aDotB / aDotA;
  const p = [lambda * a[0], lambda * a[1]];

  // Residual b - p
  const residual = [b[0] - p[0], b[1] - p[1]];
  const residualLen = Math.hypot(residual[0], residual[1]);

  // Check if optimal (residual perp to a)
  const perpDot = Math.abs(residual[0] * a[0] + residual[1] * a[1]);
  const isOptimal = perpDot < 0.05;

  // SVG coords
  const [ox, oy] = toS(0, 0);
  const [bx, by] = toS(...b);
  const [px, py] = toS(...p);
  const lineEnd1 = toS(a[0] * 3.5, a[1] * 3.5);
  const lineEnd2 = toS(-a[0] * 3.5, -a[1] * 3.5);

  const onMouseDown = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    // Check if near line
    const [mx, my] = fromS(sx, sy);
    const dist = Math.abs(mx * a[1] - my * a[0]); // perp dist from line
    if (dist < 0.4) setDraggingLine(true);
  };

  const onMouseMove = useCallback((e) => {
    if (!draggingLine) return;
    const rect = svgRef.current.getBoundingClientRect();
    const [mx, my] = fromS(e.clientX - rect.left, e.clientY - rect.top);
    setLineAngle(Math.atan2(my, mx));
  }, [draggingLine]);

  const onMouseUp = useCallback(() => setDraggingLine(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  const optimalAngle = Math.atan2(b[1], b[0]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 select-none">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Projection Challenge</h3>
          <span className="text-xs text-slate-400">{step + 1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? 'bg-cyan-500' : i < step ? 'bg-cyan-300 dark:bg-cyan-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-cyan-600 dark:text-cyan-400 mb-1 text-sm">{STEPS[step].title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{STEPS[step].body}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button onClick={() => setLineAngle(optimalAngle)}
          className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          Snap to optimal
        </button>
        <button onClick={() => setLineAngle(Math.PI / 6)}
          className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
          Reset line
        </button>
        <span className={`ml-auto text-[9px] font-mono px-2 py-0.5 rounded border ${isOptimal ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500'}`}>
          ‖b-p‖ = {residualLen.toFixed(3)}
        </span>
      </div>

      {/* Canvas (stages 0-2) */}
      {step <= 2 && (
        <div className="flex justify-center mb-3">
          <svg ref={svgRef} width={W} height={H}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-pointer"
            onMouseDown={onMouseDown}>

            {/* Grid */}
            {[-2,-1,1,2].map(i => (
              <g key={i}>
                <line x1={CX + i*SC} y1={8} x2={CX + i*SC} y2={H-8} stroke="#334155" strokeWidth="0.5" opacity="0.18" />
                <line x1={8} y1={CY - i*SC} x2={W-8} y2={CY - i*SC} stroke="#334155" strokeWidth="0.5" opacity="0.18" />
              </g>
            ))}
            <line x1={10} y1={CY} x2={W-10} y2={CY} stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
            <line x1={CX} y1={10} x2={CX} y2={H-10} stroke="#94a3b8" strokeWidth="1" opacity="0.5" />

            {/* Line (subspace) */}
            <line x1={lineEnd2[0]} y1={lineEnd2[1]} x2={lineEnd1[0]} y2={lineEnd1[1]}
              stroke="#3b82f6" strokeWidth="2" opacity="0.7" />

            {/* Residual dashed line (stage 1+) */}
            {step >= 1 && (
              <line x1={bx} y1={by} x2={px} y2={py}
                stroke="#ef4444" strokeWidth="2" strokeDasharray="5,4" />
            )}

            {/* Projection point */}
            <circle cx={px} cy={py} r={6} fill="#3b82f6" opacity="0.9" />

            {/* Right-angle symbol at p (stage 2+, when near optimal) */}
            {step >= 1 && isOptimal && (
              <>
                <RightAngle cx={px} cy={py} ux={a[0]} uy={-a[1]} size={9} color="#22c55e" />
                <g>
                  <rect x={8} y={8} width={230} height={22} rx={6} fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" />
                  <text x={16} y={23} fontSize="10" fontWeight="600" fill="#15803d">✓ Perpendicular! b-p ⊥ line — optimal projection.</text>
                </g>
              </>
            )}

            {/* b point */}
            <circle cx={bx} cy={by} r={7} fill="#f97316" opacity="0.9" />
            <text x={bx + 9} y={by - 5} fontSize="11" fontWeight="700" fill="#f97316">b</text>

            {/* p label */}
            <text x={px + 9} y={py + 4} fontSize="11" fontWeight="700" fill="#3b82f6">p</text>

            <circle cx={ox} cy={oy} r={3} fill="#475569" />
          </svg>
        </div>
      )}

      {/* Stage 3: 3D diagram */}
      {step === 3 && (
        <div className="flex justify-center mb-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-5 w-full max-w-sm">
            <svg width={W} height={200} viewBox="0 0 360 200">
              {/* Simple 3D illustration: plane + point + projection */}
              {/* Plane parallelogram (perspective) */}
              <polygon points="60,160 200,100 300,130 160,190" fill="#3b82f6" fillOpacity="0.08" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
              <text x={170} y={155} fontSize="10" fill="#3b82f6" opacity="0.8" fontStyle="italic">plane (col A)</text>
              {/* b point above */}
              <circle cx={190} cy={50} r={7} fill="#f97316" />
              <text x={200} y={47} fontSize="11" fontWeight="700" fill="#f97316">b</text>
              {/* projection p on plane */}
              <circle cx={190} cy={140} r={6} fill="#3b82f6" />
              <text x={200} y={138} fontSize="11" fontWeight="700" fill="#3b82f6">p</text>
              {/* Dashed residual */}
              <line x1={190} y1={57} x2={190} y2={134} stroke="#ef4444" strokeWidth="2" strokeDasharray="5,4" />
              {/* Right angle */}
              <polyline points="180,134 180,124 190,124" fill="none" stroke="#22c55e" strokeWidth="2" />
              <text x={198} y={100} fontSize="9" fill="#ef4444">b-p ⊥ plane</text>
            </svg>
            <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300 mt-2 space-y-1">
              <div className="text-cyan-700 dark:text-cyan-400">p = A(AᵀA)⁻¹Aᵀ b</div>
              <div className="text-slate-400">H = A(AᵀA)⁻¹Aᵀ is the "hat matrix"</div>
              <div className="text-slate-400">b-p ⊥ col(A)  →  Aᵀ(b-p) = 0</div>
            </div>
          </div>
        </div>
      )}

      {/* Live formula panel */}
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3 font-mono text-[10px] text-slate-600 dark:text-slate-300 space-y-1">
        <div>a = [{a[0].toFixed(2)}, {a[1].toFixed(2)}]  |  b = [{b[0].toFixed(2)}, {b[1].toFixed(2)}]</div>
        <div>aᵀb = {aDotB.toFixed(3)}  |  aᵀa = {aDotA.toFixed(3)}  |  λ = {lambda.toFixed(3)}</div>
        <div className="text-cyan-700 dark:text-cyan-400">p = λ·a = [{p[0].toFixed(2)}, {p[1].toFixed(2)}]</div>
        <div className={isOptimal ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-500'}>
          ‖b-p‖ = {residualLen.toFixed(3)} {isOptimal ? '← minimum! ✓' : '← drag line to minimize'}
        </div>
        <div className="text-slate-400 italic">
          {step === 1 ? 'Try: drag the line to minimize the red residual' : step === 2 ? 'Watch the right-angle symbol appear at the optimal point' : step === 0 ? 'Try: drag the line — which position is closest to b?' : 'In probe calibration this formula finds the best-fit plane'}
        </div>
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
