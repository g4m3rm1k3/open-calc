import { useState, useRef, useEffect, useCallback } from 'react';

const W = 360, H = 320, CX = 180, CY = 160, SC = 52;
const toS = (x, y) => [CX + x * SC, CY - y * SC];
const fromS = (sx, sy) => [(sx - CX) / SC, -(sy - CY) / SC];

const STEPS = [
  {
    title: 'One vector spans a line',
    body: 'A single nonzero vector v₁ spans a line — all scalar multiples c·v₁. The blue shading shows the entire span. Any vector on that line can be written as c·v₁ for some scalar c.',
  },
  {
    title: 'Two vectors: independent or dependent?',
    body: 'Add v₂ (blue). If it\'s not parallel to v₁, the two vectors span a plane (the entire 2D space). If v₂ is nearly parallel (< 10°), the span collapses — the vectors are linearly dependent.',
  },
  {
    title: 'Test a third vector',
    body: 'Drag v₃ (green). If it lies in the span of {v₁,v₂}, it\'s dependent — it\'s just a combination of the others. Since we\'re in R², three vectors are ALWAYS dependent. Can you write v₃ = α·v₁ + β·v₂?',
  },
  {
    title: 'Rank and dimension',
    body: 'The rank equals the number of independent vectors = the dimension of the span. In R², rank ≤ 2 always. Three vectors in R² always have rank at most 2 — the third is always redundant.',
  },
];

const PRESETS = [
  { label: '2 Independent', v1: [1.5, 0.3], v2: [-0.3, 1.4], v3: [0.8, -0.7] },
  { label: '2 Dependent',   v1: [1.5, 0.5], v2: [1.2, 0.4], v3: [0.5, 1.0] },
  { label: '3 in R²',       v1: [1.5, 0.2], v2: [-0.5, 1.3], v3: [0.9, 0.9] },
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

function angleBetween(v1, v2) {
  const d = v1[0]*v2[0] + v1[1]*v2[1];
  const m1 = Math.hypot(v1[0], v1[1]);
  const m2 = Math.hypot(v2[0], v2[1]);
  if (m1 < 1e-9 || m2 < 1e-9) return 0;
  return Math.acos(Math.min(1, Math.max(-1, Math.abs(d) / (m1 * m2)))) * 180 / Math.PI;
}

// Solve v3 = α·v1 + β·v2 via least squares (2x2 system)
function leastSquaresCoeffs(v1, v2, v3) {
  const det = v1[0]*v2[1] - v1[1]*v2[0];
  if (Math.abs(det) < 1e-9) return null;
  const alpha = (v3[0]*v2[1] - v3[1]*v2[0]) / det;
  const beta  = (v1[0]*v3[1] - v1[1]*v3[0]) / det;
  return { alpha, beta };
}

export default function LinearIndependenceViz() {
  const [step, setStep] = useState(0);
  const [v1, setV1] = useState([1.5, 0.3]);
  const [v2, setV2] = useState([-0.4, 1.4]);
  const [v3, setV3] = useState([0.8, -0.8]);
  const [dragging, setDragging] = useState(null); // null | 'v1' | 'v2' | 'v3'
  const svgRef = useRef(null);

  const getSVGPoint = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return fromS(clientX - rect.left, clientY - rect.top);
  }, []);

  const pickDrag = (e) => {
    const [mx, my] = getSVGPoint(e);
    const vecs = step >= 2 ? ['v3', 'v2', 'v1'] : step >= 1 ? ['v2', 'v1'] : ['v1'];
    for (const lbl of vecs) {
      const v = lbl === 'v1' ? v1 : lbl === 'v2' ? v2 : v3;
      if (Math.hypot(mx - v[0], my - v[1]) < 0.35) { setDragging(lbl); return; }
    }
  };

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const [mx, my] = getSVGPoint(e);
    const len = Math.hypot(mx, my);
    if (len < 0.1) return;
    const setFn = dragging === 'v1' ? setV1 : dragging === 'v2' ? setV2 : setV3;
    setFn([mx, my]);
  }, [dragging, getSVGPoint]);

  const onUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mouseup', onUp); window.removeEventListener('mousemove', onMove); };
  }, [onUp, onMove]);

  const [ox, oy] = toS(0, 0);
  const [v1x, v1y] = toS(...v1);
  const [v2x, v2y] = toS(...v2);
  const [v3x, v3y] = toS(...v3);

  const angle12 = angleBetween(v1, v2);
  const dependent12 = angle12 < 10;

  const coeffs = step >= 2 ? leastSquaresCoeffs(v1, v2, v3) : null;
  const v3InSpan = coeffs !== null;

  // Line through origin for v1 (stage 0)
  const v1Len = Math.hypot(v1[0], v1[1]);
  const v1u = v1Len > 0 ? [v1[0] / v1Len, v1[1] / v1Len] : [1, 0];
  const lineEnd1 = toS(v1u[0] * 4, v1u[1] * 4);
  const lineEnd2 = toS(-v1u[0] * 4, -v1u[1] * 4);

  // Span parallelogram corners (stage 1+)
  const spanPts = [
    toS(0, 0), toS(v1[0], v1[1]),
    toS(v1[0] + v2[0], v1[1] + v2[1]), toS(v2[0], v2[1])
  ].map(([x, y]) => `${x},${y}`).join(' ');

  // Rank
  let rank = 1;
  if (step >= 1) rank = dependent12 ? 1 : 2;

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 select-none">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Linear Independence Explorer</h3>
          <span className="text-xs text-slate-400">{step + 1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i === step ? 'bg-rose-50 dark:bg-rose-900/300' : i < step ? 'bg-rose-300 dark:bg-rose-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-rose-600 dark:text-rose-400 mb-1 text-sm">{STEPS[step].title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{STEPS[step].body}</p>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1 mb-3">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => { setV1(p.v1); setV2(p.v2); setV3(p.v3); }}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-rose-400 dark:border-rose-600/50 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-400 transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="flex justify-center mb-3">
        <svg ref={svgRef} width={W} height={H}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-crosshair"
          onMouseDown={pickDrag}>

          {/* Grid */}
          {[-3,-2,-1,1,2,3].map(i => (
            <g key={i}>
              <line x1={CX + i*SC} y1={8} x2={CX + i*SC} y2={H-8} stroke="#334155" strokeWidth="0.5" opacity="0.18" />
              <line x1={8} y1={CY - i*SC} x2={W-8} y2={CY - i*SC} stroke="#334155" strokeWidth="0.5" opacity="0.18" />
            </g>
          ))}
          {/* Axes */}
          <line x1={10} y1={CY} x2={W-10} y2={CY} stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
          <line x1={CX} y1={10} x2={CX} y2={H-10} stroke="#94a3b8" strokeWidth="1" opacity="0.5" />

          {/* Stage 0: line span */}
          {step === 0 && (
            <line x1={lineEnd2[0]} y1={lineEnd2[1]} x2={lineEnd1[0]} y2={lineEnd1[1]}
              stroke="#3b82f6" strokeWidth="40" opacity="0.08" strokeLinecap="round" />
          )}

          {/* Stage 1+: parallelogram span */}
          {step >= 1 && (
            <polygon points={spanPts}
              fill={dependent12 ? '#f97316' : '#3b82f6'} fillOpacity="0.1"
              stroke={dependent12 ? '#f97316' : '#3b82f6'} strokeWidth="1" strokeOpacity="0.3" />
          )}

          {/* v1 */}
          <Arrow x1={ox} y1={oy} x2={v1x} y2={v1y} color="#ef4444" w={2.5} />
          <circle cx={v1x} cy={v1y} r={7} fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2" style={{ cursor: 'grab' }} />
          <text x={v1x + 8} y={v1y - 5} fontSize="11" fontWeight="700" fill="#ef4444">v₁</text>

          {/* v2 (stage 1+) */}
          {step >= 1 && (
            <>
              <Arrow x1={ox} y1={oy} x2={v2x} y2={v2y} color={dependent12 ? '#f97316' : '#3b82f6'} w={2.5} />
              <circle cx={v2x} cy={v2y} r={7} fill={dependent12 ? '#f97316' : '#3b82f6'} fillOpacity="0.2"
                stroke={dependent12 ? '#f97316' : '#3b82f6'} strokeWidth="2" style={{ cursor: 'grab' }} />
              <text x={v2x + 8} y={v2y - 5} fontSize="11" fontWeight="700" fill={dependent12 ? '#f97316' : '#3b82f6'}>v₂</text>

              {dependent12 && (
                <g>
                  <rect x={8} y={8} width={200} height={22} rx={6} fill="#fff7ed" stroke="#f97316" strokeWidth="1.5" />
                  <text x={16} y={23} fontSize="10" fontWeight="600" fill="#c2410c">⚠ Nearly dependent! Span collapses.</text>
                </g>
              )}
            </>
          )}

          {/* v3 (stage 2+) */}
          {step >= 2 && (
            <>
              <Arrow x1={ox} y1={oy} x2={v3x} y2={v3y} color="#22c55e" w={2.5} />
              <circle cx={v3x} cy={v3y} r={7} fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2" style={{ cursor: 'grab' }} />
              <text x={v3x + 8} y={v3y - 5} fontSize="11" fontWeight="700" fill="#22c55e">v₃</text>
            </>
          )}

          <circle cx={ox} cy={oy} r={3} fill="#475569" />
        </svg>
      </div>

      {/* Live formula panel */}
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3 font-mono text-[10px] text-slate-600 dark:text-slate-300 space-y-1">
        <div>span&#123;v₁&#125; dim = 1  |  angle(v₁,v₂) = {step >= 1 ? angle12.toFixed(1) : '—'}°</div>
        {step >= 1 && <div className={dependent12 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}>
          span&#123;v₁,v₂&#125; has dim = rank = {rank} {dependent12 ? '⚠ DEPENDENT' : '✓ INDEPENDENT'}
        </div>}
        {step >= 2 && coeffs && <div className="text-green-700 dark:text-green-400">
          v₃ ≈ {coeffs.alpha.toFixed(2)}·v₁ + {coeffs.beta.toFixed(2)}·v₂ (always in R²)
        </div>}
        {step === 3 && <div className="text-rose-600 dark:text-rose-400 font-bold">
          In R²: max rank = 2. 3 vectors are always linearly dependent!
        </div>}
        <div className="text-slate-400 italic">
          {step === 1 ? 'Try: make v₂ exactly parallel to v₁' : step === 2 ? 'Try: drag v₃ — it\'s always in the span of v₁,v₂ in R²' : step === 3 ? 'Try: can 3 vectors in R² ever be independent?' : 'Drag the vector tips to explore the span'}
        </div>
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="px-4 py-2 rounded-lg text-sm bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
