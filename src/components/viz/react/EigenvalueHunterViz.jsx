import { useState, useRef, useEffect, useCallback } from 'react';

const W = 360, H = 320, CX = 180, CY = 160, SC = 52;
const toS = (x, y) => [CX + x * SC, CY - y * SC];
const fromS = (sx, sy) => [(sx - CX) / SC, -(sy - CY) / SC];

const PRESETS = [
  { label: 'Symmetric',  a:2, b:1, c:1, d:2  },
  { label: 'Rotation',   a:0, b:-1, c:1, d:0  },
  { label: 'Shear',      a:1, b:1, c:0, d:1  },
  { label: 'Scale',      a:3, b:0, c:0, d:1  },
];

const STEPS = [
  {
    title: 'What does this matrix do?',
    body: 'Every matrix transforms vectors — rotating them, stretching them, or both. The colored arrows show 12 sample vectors (blue) and where the matrix sends them (orange). Notice that most vectors change direction.',
  },
  {
    title: 'Hunt for eigenvectors',
    body: 'Drag the blue probe vector. When v and A·v point in the same direction (angle < 5°), you\'ve found an eigenvector — a special direction the matrix only stretches, never rotates. Watch the readout!',
  },
  {
    title: 'The eigenvalue is the stretch factor',
    body: 'You found an eigenvector! The eigenvalue λ = |Av|/|v| tells you exactly how much the matrix stretches in this direction. The equation Av = λv holds with real numbers.',
  },
  {
    title: 'Why eigenvalues matter',
    body: 'Eigenvectors reveal the stable axes of a transformation. They power PageRank (web graph dominant eigenvector), vibration modes in engineering, PCA in data science, and quantum states in physics.',
  },
];

function Arrow({ x1, y1, x2, y2, color, w = 2.5, opacity = 1 }) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len, hl = 8;
  const hx = x2 - ux * hl, hy = y2 - uy * hl;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx - uy * 4},${hy + ux * 4} ${hx + uy * 4},${hy - ux * 4}`} fill={color} />
    </g>
  );
}

export default function EigenvalueHunterViz() {
  const [step, setStep] = useState(0);
  const [mat, setMat] = useState({ a: 2, b: 1, c: 1, d: 2 });
  const { a, b, c, d } = mat;

  // Probe vector in math coords
  const [probe, setProbe] = useState({ x: 1.2, y: 0.5 });
  const [locked, setLocked] = useState(false);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef(null);

  const normalize = (x, y) => {
    const len = Math.hypot(x, y) || 1;
    return [x / len, y / len];
  };

  // Compute Av
  const av = { x: a * probe.x + b * probe.y, y: c * probe.x + d * probe.y };

  // Angle between v and Av
  const dot = probe.x * av.x + probe.y * av.y;
  const vLen = Math.hypot(probe.x, probe.y);
  const avLen = Math.hypot(av.x, av.y);
  const cosTheta = vLen > 0.01 && avLen > 0.01 ? Math.min(1, Math.max(-1, dot / (vLen * avLen))) : 1;
  const angleDeg = Math.acos(Math.abs(cosTheta)) * (180 / Math.PI);
  const lambda = vLen > 0.01 ? avLen / vLen : 0;
  const isEigen = angleDeg < 5;
  const probeAngle = Math.atan2(probe.y, probe.x) * (180 / Math.PI);

  // Fan of 12 arrows
  const fanArrows = Array.from({ length: 12 }, (_, i) => {
    const theta = (i / 12) * 2 * Math.PI;
    const vx = Math.cos(theta), vy = Math.sin(theta);
    const avx = a * vx + b * vy, avy = c * vx + d * vy;
    const [ox, oy] = toS(0, 0);
    const [ex, ey] = toS(vx, vy);
    const [ax2, ay2] = toS(avx, avy);
    return { ox, oy, ex, ey, ax2, ay2, key: i };
  });

  const getSVGPoint = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const [mx, my] = fromS(clientX - rect.left, clientY - rect.top);
    return { x: mx, y: my };
  }, []);

  const onMouseDown = (e) => {
    if (step !== 1 && step !== 2) return;
    const p = getSVGPoint(e);
    const tipS = toS(probe.x, probe.y);
    const dist = Math.hypot(p.x - probe.x, p.y - probe.y);
    if (dist < 0.4) { setDragging(true); setLocked(false); }
  };

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const p = getSVGPoint(e);
    const len = Math.hypot(p.x, p.y);
    if (len > 0.1) setProbe({ x: p.x, y: p.y });
  }, [dragging, getSVGPoint]);

  const onMouseUp = useCallback(() => {
    if (dragging) {
      setDragging(false);
      if (isEigen) setLocked(true);
    }
  }, [dragging, isEigen]);

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => { window.removeEventListener('mouseup', onMouseUp); window.removeEventListener('mousemove', onMouseMove); };
  }, [onMouseUp, onMouseMove]);

  const applyPreset = (p) => {
    setMat(p);
    setLocked(false);
    setProbe({ x: 1.2, y: 0.5 });
  };

  const [ox, oy] = toS(0, 0);
  const [px, py] = toS(probe.x, probe.y);
  const [avx, avy] = toS(av.x, av.y);

  const probeColor = isEigen ? '#22c55e' : '#3b82f6';
  const glowColor = isEigen ? 'rgba(34,197,94,0.25)' : 'none';

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 select-none">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Eigenvalue Hunter</h3>
          <span className="text-xs text-slate-400">{step + 1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? 'bg-indigo-500' : i < step ? 'bg-indigo-300 dark:bg-indigo-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1 text-sm">{STEPS[step].title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{STEPS[step].body}</p>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1 mb-3">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p)}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {p.label}
          </button>
        ))}
        <span className="ml-auto text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
          A = [{a},{b};{c},{d}]
        </span>
      </div>

      {/* Canvas */}
      <div className="flex justify-center mb-3">
        <svg ref={svgRef} width={W} height={H}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-crosshair"
          onMouseDown={onMouseDown}>

          {/* Axes */}
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
          <line x1={CX} y1={10} x2={CX} y2={H - 10} stroke="#94a3b8" strokeWidth="1" opacity="0.5" />

          {/* Grid */}
          {[-3,-2,-1,1,2,3].map(i => (
            <g key={i}>
              <line x1={CX + i * SC} y1={10} x2={CX + i * SC} y2={H - 10} stroke="#334155" strokeWidth="0.5" opacity="0.2" />
              <line x1={10} y1={CY - i * SC} x2={W - 10} y2={CY - i * SC} stroke="#334155" strokeWidth="0.5" opacity="0.2" />
            </g>
          ))}

          {/* Stage 1: Fan arrows */}
          {step === 0 && fanArrows.map(f => (
            <g key={f.key}>
              <Arrow x1={f.ox} y1={f.oy} x2={f.ex} y2={f.ey} color="#3b82f6" w={1.5} opacity={0.5} />
              <Arrow x1={f.ox} y1={f.oy} x2={f.ax2} y2={f.ay2} color="#f97316" w={1.5} opacity={0.7} />
            </g>
          ))}

          {/* Stage 2-4: Probe vector */}
          {step >= 1 && (
            <>
              {/* Glow when eigen */}
              {isEigen && (
                <circle cx={px} cy={py} r={18} fill={glowColor} />
              )}
              {/* Av vector (orange) */}
              <Arrow x1={ox} y1={oy} x2={avx} y2={avy} color="#f97316" w={2} opacity={0.85} />
              {/* Probe vector */}
              <Arrow x1={ox} y1={oy} x2={px} y2={py} color={probeColor} w={2.5} />
              {/* Draggable tip */}
              <circle cx={px} cy={py} r={7} fill={probeColor} fillOpacity="0.25" stroke={probeColor} strokeWidth="2" style={{ cursor: 'grab' }} />
              {/* Labels */}
              <text x={px + 8} y={py - 5} fontSize="11" fontWeight="700" fill={probeColor}>v</text>
              <text x={avx + 8} y={avy - 5} fontSize="11" fontWeight="700" fill="#f97316">Av</text>

              {/* Eigen found callout */}
              {isEigen && (
                <g>
                  <rect x={8} y={8} width={220} height={22} rx={6} fill="#dcfce7" stroke="#22c55e" strokeWidth="1.5" />
                  <text x={16} y={23} fontSize="10" fontWeight="600" fill="#15803d">🎯 Found one! Only stretches — no rotation.</text>
                </g>
              )}
            </>
          )}

          {/* Origin dot */}
          <circle cx={ox} cy={oy} r={3} fill="#475569" />
        </svg>
      </div>

      {/* Live formula panel */}
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3 font-mono text-[10px] text-slate-600 dark:text-slate-300 space-y-1">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>v = [{probe.x.toFixed(2)}, {probe.y.toFixed(2)}]</span>
          <span>Av = [{av.x.toFixed(2)}, {av.y.toFixed(2)}]</span>
          <span className={isEigen ? 'text-green-600 dark:text-green-400 font-bold' : ''}>
            angle(v, Av) = {angleDeg.toFixed(1)}°
          </span>
          <span>λ = |Av|/|v| = {lambda.toFixed(3)}</span>
        </div>
        {step >= 2 && isEigen && (
          <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-green-700 dark:text-green-400">
            A·v = λ·v → [{av.x.toFixed(2)}, {av.y.toFixed(2)}] = {lambda.toFixed(3)}·[{probe.x.toFixed(2)}, {probe.y.toFixed(2)}] ✓
          </div>
        )}
        {step === 1 && (
          <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-400 italic">
            Try: drag to 45° • Symmetric preset always has eigenvectors • Rotation has none
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
