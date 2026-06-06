import { useState, useRef, useCallback, useEffect } from "react";

const DEFAULT_POINTS = [
  [0.5, 30], [0.8, 45], [1.1, 52], [1.4, 68],
  [1.7, 79], [2.0, 93], [2.4, 108], [2.9, 128],
];

const STEPS = [
  {
    title: "The over-determined problem",
    subtitle: "More equations than unknowns",
    narration:
      "We measured tool wear at 8 different cutting depths. Each measurement gives one equation. But a line has only 2 parameters (slope and intercept) — so the 8 equations are over-determined: there's no exact solution. Least squares finds the BEST approximate solution by minimizing the total squared error.",
  },
  {
    title: "Build the design matrix",
    subtitle: "Ax = b — can't solve exactly",
    narration:
      "Stack the measurements into a matrix equation. Matrix A has one row per data point: [1, xᵢ]. Column 1 handles the intercept β₀, column 2 handles the slope β₁. Vector b holds the y values. With 8 rows and 2 unknowns, the system is over-determined — no exact inverse exists.",
  },
  {
    title: "The normal equations",
    subtitle: "AᵀAβ = Aᵀb — the key insight",
    narration:
      "Multiply both sides by Aᵀ to get the Normal Equations: AᵀAβ = Aᵀb. Now AᵀA is 2×2 and invertible. Solving gives β = (AᵀA)⁻¹Aᵀb. The regression line minimizes the sum of squared residuals. Watch the orange dashes — those are the residuals, e = b - Aβ.",
  },
  {
    title: "Projection interpretation",
    subtitle: "b projected onto col(A)",
    narration:
      "Geometrically, the least-squares solution projects the measurement vector b onto the column space of A. The fitted values ŷ = Aβ live in col(A). The residual e = b - ŷ is perpendicular to col(A) — this perpendicularity is what makes the solution optimal. Drag the points to see the projection update live!",
  },
];

const PRESETS = [
  { label: "Reset default", pts: DEFAULT_POINTS },
  { label: "High noise", pts: DEFAULT_POINTS.map(([x, y], i) => [x, y + (i % 3 === 0 ? 30 : -15)]) },
  { label: "Linear", pts: DEFAULT_POINTS.map(([x]) => [x, 45 * x + 5]) },
  { label: "Add outlier", pts: [...DEFAULT_POINTS.slice(0, 7), [2.9, 180]] },
];

function computeLS(pts) {
  const n = pts.length;
  const sumX = pts.reduce((s, [x]) => s + x, 0);
  const sumY = pts.reduce((s, [, y]) => s + y, 0);
  const sumXX = pts.reduce((s, [x]) => s + x * x, 0);
  const sumXY = pts.reduce((s, [x, y]) => s + x * y, 0);
  const xbar = sumX / n, ybar = sumY / n;
  const denom = sumXX - n * xbar * xbar;
  const b1 = (sumXY - n * xbar * ybar) / denom;
  const b0 = ybar - b1 * xbar;
  // ATA = [[n, sumX],[sumX, sumXX]], ATb = [sumY, sumXY]
  const ATA = [[n, sumX], [sumX, sumXX]];
  const ATb = [sumY, sumXY];
  const residuals = pts.map(([x, y]) => y - (b0 + b1 * x));
  const ssRes = residuals.reduce((s, r) => s + r * r, 0);
  return { b0, b1, xbar, ybar, sumX, sumY, sumXX, sumXY, ATA, ATb, residuals, ssRes, n };
}

export default function LeastSquaresDataViz() {
  const [step, setStep] = useState(0);
  const [points, setPoints] = useState(DEFAULT_POINTS.map(p => [...p]));
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  const W = 360, H = 260;
  const PAD = { l: 46, r: 16, t: 16, b: 36 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  const xMin = 0.2, xMax = 3.2, yMin = 0, yMax = 160;

  function toSvg(px, py) {
    return [
      PAD.l + ((px - xMin) / (xMax - xMin)) * plotW,
      PAD.t + plotH - ((py - yMin) / (yMax - yMin)) * plotH,
    ];
  }

  function fromSvg(sx, sy) {
    return [
      xMin + ((sx - PAD.l) / plotW) * (xMax - xMin),
      yMin + (1 - (sy - PAD.t) / plotH) * (yMax - yMin),
    ];
  }

  const ls = computeLS(points);
  const { b0, b1, residuals, ssRes } = ls;

  const lineX0 = xMin, lineX1 = xMax;
  const [lx0, ly0] = toSvg(lineX0, b0 + b1 * lineX0);
  const [lx1, ly1] = toSvg(lineX1, b0 + b1 * lineX1);

  const handleMouseDown = useCallback((i) => (e) => {
    e.preventDefault();
    setDragging(i);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (dragging === null) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const [nx, ny] = fromSvg(sx, sy);
    setPoints(prev => {
      const next = prev.map(p => [...p]);
      next[dragging] = [
        Math.max(xMin + 0.1, Math.min(xMax - 0.1, nx)),
        Math.max(yMin + 2, Math.min(yMax - 2, ny)),
      ];
      return next;
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  // x-axis ticks
  const xTicks = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
  const yTicks = [0, 40, 80, 120, 160];

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg max-w-[400px] font-sans">
      {/* Dots */}
      <div className="flex items-center gap-2 justify-center">
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === step ? "bg-violet-500 scale-125" : "bg-slate-300 dark:bg-slate-600"}`} />
        ))}
        <span className="ml-2 text-[10px] text-slate-400">{step + 1}/{STEPS.length}</span>
      </div>

      {/* Narration */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
        <div className="text-[13px] font-bold text-violet-600 dark:text-violet-400 mb-0.5">{STEPS[step].title}</div>
        <div className="text-[10px] text-violet-400 dark:text-violet-500 mb-1.5 font-medium">{STEPS[step].subtitle}</div>
        <div className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">{STEPS[step].narration}</div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => setPoints(p.pts.map(pt => [...pt]))}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width={W} height={H}
        className="rounded-xl bg-slate-950 border border-slate-800 cursor-crosshair"
        style={{ maxWidth: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern id="lsgrid" width="40" height="40" patternUnits="userSpaceOnUse" x={PAD.l} y={PAD.t}>
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x={PAD.l} y={PAD.t} width={plotW} height={plotH} fill="url(#lsgrid)" />
        <rect x={PAD.l} y={PAD.t} width={plotW} height={plotH} fill="none" stroke="#334155" strokeWidth="1" />

        {/* Axis labels */}
        <text x={PAD.l + plotW / 2} y={H - 4} fontSize="9" fill="#64748b" textAnchor="middle">Cutting Depth (mm)</text>
        <text x={10} y={PAD.t + plotH / 2} fontSize="9" fill="#64748b" textAnchor="middle" transform={`rotate(-90, 10, ${PAD.t + plotH / 2})`}>Tool Wear (μm)</text>

        {/* Ticks */}
        {xTicks.map(x => {
          const [sx] = toSvg(x, 0);
          return <g key={x}>
            <line x1={sx} y1={PAD.t + plotH} x2={sx} y2={PAD.t + plotH + 4} stroke="#475569" strokeWidth="1" />
            <text x={sx} y={PAD.t + plotH + 12} fontSize="8" fill="#64748b" textAnchor="middle">{x}</text>
          </g>;
        })}
        {yTicks.map(y => {
          const [, sy] = toSvg(0, y);
          return <g key={y}>
            <line x1={PAD.l - 4} y1={sy} x2={PAD.l} y2={sy} stroke="#475569" strokeWidth="1" />
            <text x={PAD.l - 6} y={sy + 3} fontSize="8" fill="#64748b" textAnchor="end">{y}</text>
          </g>;
        })}

        {/* Regression line */}
        {step >= 2 && (
          <line x1={lx0} y1={ly0} x2={lx1} y2={ly1}
            stroke="#a78bfa" strokeWidth="2" opacity="0.9" />
        )}

        {/* Residuals */}
        {step >= 2 && points.map(([x, y], i) => {
          const [sx, sy] = toSvg(x, y);
          const [, syr] = toSvg(x, b0 + b1 * x);
          return <line key={i} x1={sx} y1={sy} x2={sx} y2={syr}
            stroke="#fb923c" strokeWidth="1.5" strokeDasharray="2 1" />;
        })}

        {/* Data points */}
        {points.map(([x, y], i) => {
          const [sx, sy] = toSvg(x, y);
          return (
            <circle key={i} cx={sx} cy={sy} r={6}
              fill="#60a5fa" stroke="#93c5fd" strokeWidth="1.5"
              style={{ cursor: "grab" }}
              onMouseDown={handleMouseDown(i)} />
          );
        })}
      </svg>

      {/* Live formula panel */}
      <div className="bg-slate-900 rounded-lg p-2.5 flex flex-col gap-1">
        <div className="text-[9px] text-slate-400 mb-0.5">Live formula (drag points to update)</div>
        <div className="font-mono text-[10px] text-violet-300">
          β₁ = (Σxᵢyᵢ − n·x̄·ȳ) / (Σxᵢ² − n·x̄²) = <span className="text-amber-300">{b1.toFixed(3)}</span>
        </div>
        <div className="font-mono text-[10px] text-violet-300">
          β₀ = ȳ − β₁·x̄ = <span className="text-amber-300">{b0.toFixed(3)}</span>
        </div>
        <div className="font-mono text-[10px] text-orange-400">
          ‖residuals‖ = {Math.sqrt(ssRes).toFixed(2)} μm
        </div>
        {step >= 1 && (
          <div className="text-[9px] text-slate-500 mt-0.5">
            AᵀA = [[{ls.ATA[0][0]}, {ls.ATA[0][1].toFixed(2)}], [{ls.ATA[1][0].toFixed(2)}, {ls.ATA[1][1].toFixed(2)}]]
          </div>
        )}
      </div>

      {/* Design matrix (step 1) */}
      {step === 1 && (
        <div className="bg-slate-800 rounded-lg p-2 overflow-x-auto">
          <div className="text-[9px] text-slate-400 mb-1">First 4 rows of A  |  b</div>
          {points.slice(0, 4).map(([x, y], i) => (
            <div key={i} className="font-mono text-[10px] text-slate-300 flex gap-3">
              <span className="text-slate-500">[1,</span>
              <span className="text-blue-300 w-6">{x.toFixed(1)}</span>
              <span className="text-slate-500">]</span>
              <span className="text-slate-500">·[β₀,β₁]ᵀ ≈</span>
              <span className="text-amber-300">{y.toFixed(0)}</span>
            </div>
          ))}
          <div className="text-[9px] text-slate-600 mt-0.5">... ({ls.n} rows total)</div>
        </div>
      )}

      {/* Projection diagram (step 3) */}
      {step === 3 && (
        <div className="bg-slate-800 rounded-lg p-2 text-center">
          <div className="text-[9px] text-slate-400 mb-1">Projection: ŷ = Aβ ⊥ e = b − ŷ</div>
          <svg width={180} height={90} className="mx-auto">
            {/* col(A) line */}
            <line x1={20} y1={75} x2={160} y2={15} stroke="#a78bfa" strokeWidth="2" />
            <text x={155} y={12} fontSize="9" fill="#a78bfa">col(A)</text>
            {/* b vector */}
            <line x1={20} y1={75} x2={120} y2={25} stroke="#60a5fa" strokeWidth="2" markerEnd="url(#bArr)" />
            <text x={122} y={22} fontSize="9" fill="#60a5fa">b</text>
            {/* ŷ on col(A) */}
            <circle cx={108} cy={33} r={4} fill="#a78bfa" />
            <text x={112} y={48} fontSize="9" fill="#a78bfa">ŷ</text>
            {/* residual e */}
            <line x1={120} y1={25} x2={108} y2={33} stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x={118} y={22} fontSize="9" fill="#fb923c">e ⊥ col(A)</text>
            <defs>
              <marker id="bArr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#60a5fa" />
              </marker>
            </defs>
          </svg>
        </div>
      )}

      {/* Try it */}
      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-2 border border-violet-100 dark:border-violet-800">
        <div className="text-[9px] font-semibold text-violet-500 mb-1">💡 Try it</div>
        {step === 0 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Drag any point far from the pattern — the least squares line must balance all residuals simultaneously.</p>}
        {step === 1 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Observe how A has ones in column 1 (for the intercept β₀) and xᵢ in column 2 (for slope β₁).</p>}
        {step === 2 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Try making all points perfectly collinear — orange residual dashes drop to 0! Try adding an outlier with "Add outlier" preset.</p>}
        {step === 3 && <p className="text-[10px] text-slate-500 dark:text-slate-400">The key insight: the residual e is always perpendicular to every column of A. This perpendicularity is the geometric meaning of "least squares".</p>}
      </div>

      {/* Nav */}
      <div className="flex justify-between items-center pt-1">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="text-[11px] px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          ← Prev
        </button>
        <span className="text-[10px] text-slate-400">Least Squares Regression</span>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="text-[11px] px-3 py-1 rounded-lg bg-violet-500 text-white border border-violet-600 disabled:opacity-30 hover:bg-violet-600 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
