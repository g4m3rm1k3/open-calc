import { useState, useRef, useCallback, useEffect } from "react";

// Generate 20 correlated data points: elongated ellipse
function generateData(seed = 42) {
  // Simple seeded-ish pseudorandom
  let s = seed;
  function rand() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }
  const pts = [];
  for (let i = 0; i < 20; i++) {
    const t = (i / 20) * 2 * Math.PI;
    const noise = () => (rand() - 0.5) * 14;
    const x = 50 + 20 * Math.cos(t) + noise();
    const y = 300 + 100 * Math.sin(t) + 60 * Math.cos(t) + noise() * 2;
    pts.push([x, y]);
  }
  return pts;
}

// 2×2 covariance matrix
function covariance2D(pts) {
  const n = pts.length;
  const mx = pts.reduce((s, [x]) => s + x, 0) / n;
  const my = pts.reduce((s, [, y]) => s + y, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  pts.forEach(([x, y]) => {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
    syy += (y - my) ** 2;
  });
  return { cov: [[sxx / n, sxy / n], [sxy / n, syy / n]], mx, my };
}

// Eigendecomposition of 2×2 symmetric matrix
function eigen2x2(a, b, d) {
  // [[a,b],[b,d]]
  const tr = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, (tr / 2) ** 2 - det));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  // Eigenvectors
  function evec(lambda) {
    if (Math.abs(b) > 1e-10) {
      const vx = b, vy = lambda - a;
      const len = Math.sqrt(vx * vx + vy * vy);
      return [vx / len, vy / len];
    }
    return lambda > a ? [0, 1] : [1, 0];
  }
  return { l1, l2, v1: evec(l1), v2: evec(l2) };
}

const STEPS = [
  {
    title: "The data cloud",
    subtitle: "Variation has direction",
    narration:
      "These 20 sensor readings (spindle load vs. feed rate) form an elongated ellipse. There's clearly more variation along one diagonal than the other. PCA finds the exact directions of maximum and minimum variance — the principal components. They're the eigenvectors of the covariance matrix.",
  },
  {
    title: "The covariance matrix",
    subtitle: "σ²ₓ, σ²ᵧ, σₓᵧ — correlation encoded",
    narration:
      "The 2×2 covariance matrix captures everything about the data's spread. Diagonal entries are the individual variances. The off-diagonal (covariance) captures how x and y move together. When it's large and nonzero, the data is correlated — and the axes of maximum variance are rotated relative to x and y.",
  },
  {
    title: "Principal components",
    subtitle: "Eigenvectors of the covariance matrix",
    narration:
      "PC1 (gold arrow) is the direction of maximum variance — the eigenvector with the larger eigenvalue λ₁. PC2 (silver arrow) is perpendicular to PC1 — the direction of minimum remaining variance. The eigenvalues tell you exactly how much variance each direction explains.",
  },
  {
    title: "Dimensionality reduction",
    subtitle: "Project to 1D — keep the important variance",
    narration:
      "Projecting all 20 points onto PC1 compresses the 2D data to 1D. You retain λ₁/(λ₁+λ₂) × 100% of the total variance while cutting the data size in half. In real CNC condition monitoring, you might compress 50 sensor signals to just 2–3 principal components, keeping 95%+ of the information.",
  },
];

const PRESETS = [
  { label: "Default", seed: 42 },
  { label: "Less correlated", seed: 77 },
  { label: "High noise", seed: 123 },
  { label: "Tight cluster", seed: 9 },
];

export default function PCAVarianceViz() {
  const [step, setStep] = useState(0);
  const [points, setPoints] = useState(generateData(42));
  const [projected, setProjected] = useState(false);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);

  const W = 360, H = 260;
  const PAD = { l: 52, r: 16, t: 18, b: 36 };
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;

  // Data range
  const allX = points.map(([x]) => x);
  const allY = points.map(([, y]) => y);
  const xMin = Math.min(...allX) - 10, xMax = Math.max(...allX) + 10;
  const yMin = Math.min(...allY) - 20, yMax = Math.max(...allY) + 20;

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

  const { cov, mx, my } = covariance2D(points);
  const { l1, l2, v1, v2 } = eigen2x2(cov[0][0], cov[0][1], cov[1][1]);
  const totalVar = l1 + l2;
  const pct1 = totalVar > 0 ? (l1 / totalVar * 100) : 50;
  const pct2 = totalVar > 0 ? (l2 / totalVar * 100) : 50;

  // Arrow length proportional to sqrt(eigenvalue), scaled for SVG
  const ARROW_SCALE = 1.5;
  const [smx, smy] = toSvg(mx, my);

  // PC1 and PC2 arrows in SVG space (flip y)
  const pc1len = Math.sqrt(l1) * ARROW_SCALE;
  const pc2len = Math.sqrt(l2) * ARROW_SCALE;

  // Projected points onto PC1
  function projectOntoPC1(pts, mean, v) {
    return pts.map(([x, y]) => {
      const dx = x - mean[0], dy = y - mean[1];
      const t = dx * v[0] + dy * v[1];
      return [mean[0] + t * v[0], mean[1] + t * v[1]];
    });
  }

  const projPts = projectOntoPC1(points, [mx, my], v1);

  const handleMouseDown = useCallback((i) => (e) => { e.preventDefault(); setDragging(i); }, []);
  const handleMouseMove = useCallback((e) => {
    if (dragging === null) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const [nx, ny] = fromSvg(e.clientX - rect.left, e.clientY - rect.top);
    setPoints(prev => {
      const next = prev.map(p => [...p]);
      next[dragging] = [nx, ny];
      return next;
    });
  }, [dragging, xMin, xMax, yMin, yMax]);
  const handleMouseUp = useCallback(() => setDragging(null), []);

  const xTicks = [20, 40, 60, 80];
  const yTicks = [100, 200, 300, 400, 500];

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
          <button key={p.label} onClick={() => { setPoints(generateData(p.seed)); setProjected(false); }}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      {/* SVG Canvas */}
      <svg ref={svgRef} width={W} height={H}
        className="rounded-xl bg-slate-950 border border-slate-800 cursor-crosshair"
        style={{ maxWidth: "100%" }}
        onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <defs>
          <pattern id="pcagrid" width="40" height="40" patternUnits="userSpaceOnUse" x={PAD.l} y={PAD.t}>
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
          </pattern>
          <marker id="pc1arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#fbbf24" />
          </marker>
          <marker id="pc2arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8" />
          </marker>
        </defs>
        <rect x={PAD.l} y={PAD.t} width={plotW} height={plotH} fill="url(#pcagrid)" />
        <rect x={PAD.l} y={PAD.t} width={plotW} height={plotH} fill="none" stroke="#334155" strokeWidth="1" />

        {/* Axis labels */}
        <text x={PAD.l + plotW / 2} y={H - 4} fontSize="9" fill="#64748b" textAnchor="middle">Spindle Load (%)</text>
        <text x={10} y={PAD.t + plotH / 2} fontSize="9" fill="#64748b" textAnchor="middle" transform={`rotate(-90, 10, ${PAD.t + plotH / 2})`}>Feed Rate (mm/min)</text>

        {xTicks.map(x => {
          const [sx] = toSvg(x, 0);
          if (sx < PAD.l || sx > W - PAD.r) return null;
          return <g key={x}>
            <line x1={sx} y1={PAD.t + plotH} x2={sx} y2={PAD.t + plotH + 4} stroke="#475569" strokeWidth="1" />
            <text x={sx} y={PAD.t + plotH + 13} fontSize="8" fill="#64748b" textAnchor="middle">{x}</text>
          </g>;
        })}
        {yTicks.map(y => {
          const [, sy] = toSvg(0, y);
          if (sy < PAD.t || sy > H - PAD.b) return null;
          return <g key={y}>
            <line x1={PAD.l - 4} y1={sy} x2={PAD.l} y2={sy} stroke="#475569" strokeWidth="1" />
            <text x={PAD.l - 6} y={sy + 3} fontSize="8" fill="#64748b" textAnchor="end">{y}</text>
          </g>;
        })}

        {/* Mean marker */}
        <circle cx={smx} cy={smy} r={4} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 2" />

        {/* Projection lines (step 3) */}
        {step >= 3 && projected && projPts.map(([px, py], i) => {
          const [spx, spy] = toSvg(px, py);
          const [sox, soy] = toSvg(points[i][0], points[i][1]);
          return <line key={i} x1={sox} y1={soy} x2={spx} y2={spy}
            stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="2 1" opacity="0.5" />;
        })}

        {/* Projected points on PC1 */}
        {step >= 3 && projected && projPts.map(([px, py], i) => {
          const [spx, spy] = toSvg(px, py);
          return <circle key={i} cx={spx} cy={spy} r={3}
            fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" opacity={0.9} />;
        })}

        {/* Original data points */}
        {points.map(([x, y], i) => {
          const [sx, sy] = toSvg(x, y);
          return (
            <circle key={i} cx={sx} cy={sy} r={5}
              fill={step >= 3 && projected ? "#1e40af" : "#3b82f6"}
              stroke="#60a5fa" strokeWidth="1.2"
              style={{ cursor: "grab" }}
              opacity={step >= 3 && projected ? 0.4 : 0.85}
              onMouseDown={handleMouseDown(i)} />
          );
        })}

        {/* PC arrows (step >= 2) */}
        {step >= 2 && (() => {
          // In SVG y is flipped
          const pc1ex = smx + pc1len * v1[0];
          const pc1ey = smy - pc1len * v1[1];
          const pc2ex = smx + pc2len * v2[0];
          const pc2ey = smy - pc2len * v2[1];
          return (
            <>
              {/* PC1 — gold */}
              <line x1={smx} y1={smy} x2={pc1ex} y2={pc1ey}
                stroke="#fbbf24" strokeWidth="3" markerEnd="url(#pc1arr)" />
              <line x1={smx} y1={smy} x2={2 * smx - pc1ex} y2={2 * smy - pc1ey}
                stroke="#fbbf24" strokeWidth="3" opacity="0.3" />
              <text x={pc1ex + 4} y={pc1ey} fontSize="9" fill="#fbbf24" fontWeight="bold">PC1</text>
              {/* PC2 — silver */}
              <line x1={smx} y1={smy} x2={pc2ex} y2={pc2ey}
                stroke="#94a3b8" strokeWidth="2" markerEnd="url(#pc2arr)" />
              <line x1={smx} y1={smy} x2={2 * smx - pc2ex} y2={2 * smy - pc2ey}
                stroke="#94a3b8" strokeWidth="2" opacity="0.3" />
              <text x={pc2ex + 4} y={pc2ey} fontSize="9" fill="#94a3b8" fontWeight="bold">PC2</text>
            </>
          );
        })()}
      </svg>

      {/* Live formula panel */}
      <div className="bg-slate-900 rounded-lg p-2.5 flex flex-col gap-1">
        <div className="text-[9px] text-slate-400 mb-0.5">Covariance matrix (live)</div>
        <div className="font-mono text-[10px] text-violet-300 flex gap-2 items-center">
          <span className="text-slate-400">[[</span>
          <span className="text-blue-300">{cov[0][0].toFixed(1)}</span>
          <span className="text-slate-400">,</span>
          <span className="text-amber-300">{cov[0][1].toFixed(1)}</span>
          <span className="text-slate-400">], [</span>
          <span className="text-amber-300">{cov[1][0].toFixed(1)}</span>
          <span className="text-slate-400">,</span>
          <span className="text-green-300">{cov[1][1].toFixed(1)}</span>
          <span className="text-slate-400">]]</span>
        </div>
        <div className="font-mono text-[10px] text-slate-300">
          λ₁ = <span className="text-amber-300">{l1.toFixed(1)}</span>{"  "}
          λ₂ = <span className="text-slate-400">{l2.toFixed(1)}</span>
        </div>
        <div className="font-mono text-[10px] text-violet-300">
          PC1 variance: <span className="text-amber-300">{pct1.toFixed(1)}%</span>{"  "}
          PC2: <span className="text-slate-400">{pct2.toFixed(1)}%</span>
        </div>
      </div>

      {/* Variance bar */}
      {step >= 2 && (
        <div className="flex flex-col gap-1">
          <div className="text-[9px] text-slate-400">Variance explained</div>
          <div className="flex rounded overflow-hidden h-3">
            <div className="bg-amber-400 transition-all duration-300" style={{ width: `${pct1}%` }} />
            <div className="bg-slate-600 transition-all duration-300" style={{ width: `${pct2}%` }} />
          </div>
          <div className="flex justify-between text-[8px]">
            <span className="text-amber-400">PC1: {pct1.toFixed(1)}%</span>
            <span className="text-slate-500">PC2: {pct2.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Step 3 control */}
      {step === 3 && (
        <button onClick={() => setProjected(p => !p)}
          className={`text-[10px] px-4 py-1.5 rounded-lg border transition-colors font-semibold ${projected ? "bg-amber-500 text-white border-amber-600" : "bg-slate-700 text-white border-slate-600 hover:bg-slate-600"}`}>
          {projected ? "Showing 1D projection ✓" : "Project to 1D (PC1)"}
        </button>
      )}
      {step === 3 && projected && (
        <div className="text-[10px] text-center text-slate-400">
          Variance retained: <span className="text-amber-400 font-bold">{pct1.toFixed(1)}%</span> |
          Lost: <span className="text-rose-400 font-bold">{pct2.toFixed(1)}%</span>
        </div>
      )}

      {/* Try it */}
      <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-2 border border-violet-100 dark:border-violet-800">
        <div className="text-[9px] font-semibold text-violet-500 mb-1">💡 Try it</div>
        {step === 0 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Drag points to reshape the cloud. The elongation and tilt capture how the two sensors correlate in a real machining process.</p>}
        {step === 1 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Watch σₓᵧ (off-diagonal). When it's large, the data is correlated — the ellipse is tilted. When it's 0, the ellipse is axis-aligned.</p>}
        {step === 2 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Try "Less correlated" preset — watch PC2 grow as the ellipse becomes more circular. Try dragging points to change the tilt.</p>}
        {step === 3 && <p className="text-[10px] text-slate-500 dark:text-slate-400">Click "Project to 1D" — if PC1 explains 90%+ variance, the 1D projection is almost as good as the original 2D data! In 50D sensor monitoring, this compresses to 2-3D.</p>}
      </div>

      {/* Nav */}
      <div className="flex justify-between items-center pt-1">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          className="text-[11px] px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          ← Prev
        </button>
        <span className="text-[10px] text-slate-400">PCA Variance</span>
        <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          className="text-[11px] px-3 py-1 rounded-lg bg-violet-500 text-white border border-violet-600 disabled:opacity-30 hover:bg-violet-600 transition-colors">
          Next →
        </button>
      </div>
    </div>
  );
}
