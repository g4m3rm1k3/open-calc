import React, { useState } from 'react';

// Least squares visualization: fitting y = mx to data points
// Shows: data, best-fit line, residuals, and the "projection onto column space" interpretation

const W = 320, H = 260;
const PAD = 40;
const PLOT_W = W - PAD * 2, PLOT_H = H - PAD * 2;

const PRESETS = [
  {
    label: 'Linear trend',
    pts: [[1, 1.8], [2, 3.2], [3, 4.1], [4, 5.8], [5, 6.5]],
  },
  {
    label: 'Noisy',
    pts: [[1, 3], [2, 1.5], [3, 4.5], [4, 2], [5, 5], [6, 4]],
  },
  {
    label: 'Almost exact',
    pts: [[1, 2.1], [2, 3.9], [3, 6.1], [4, 7.9]],
  },
];

function leastSquares(pts) {
  // Fit y = m*x + b using normal equations
  const n = pts.length;
  let sx = 0, sy = 0, sx2 = 0, sxy = 0;
  for (const [x, y] of pts) {
    sx += x; sy += y; sx2 += x * x; sxy += x * y;
  }
  const denom = n * sx2 - sx * sx;
  if (Math.abs(denom) < 1e-10) return { m: 0, b: sy / n };
  const m = (n * sxy - sx * sy) / denom;
  const b = (sy - m * sx) / n;
  return { m, b };
}

function toPlot(x, y, xMin, xMax, yMin, yMax) {
  const px = PAD + (x - xMin) / (xMax - xMin) * PLOT_W;
  const py = PAD + PLOT_H - (y - yMin) / (yMax - yMin) * PLOT_H;
  return [px, py];
}

function residualSum(pts, m, b) {
  return pts.reduce((s, [x, y]) => s + (y - (m * x + b)) ** 2, 0);
}

export default function LeastSquaresProjectionViz() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [showResiduals, setShowResiduals] = useState(true);
  const [trialM, setTrialM] = useState(null);

  const { pts } = PRESETS[presetIdx];
  const { m, b } = leastSquares(pts);

  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const xMin = Math.min(...xs) - 0.5, xMax = Math.max(...xs) + 0.5;
  const yMin = Math.min(...ys) - 1, yMax = Math.max(...ys) + 1;

  const curM = trialM !== null ? trialM : m;
  const curB = ys.reduce((s, y, i) => s + (y - curM * xs[i]), 0) / xs.length;

  const bestResidual = residualSum(pts, m, b);
  const curResidual = residualSum(pts, curM, curB);

  const [lx1, ly1] = toPlot(xMin, curM * xMin + curB, xMin, xMax, yMin, yMax);
  const [lx2, ly2] = toPlot(xMax, curM * xMax + curB, xMin, xMax, yMin, yMax);
  const [bestLx1, bestLy1] = toPlot(xMin, m * xMin + b, xMin, xMax, yMin, yMax);
  const [bestLx2, bestLy2] = toPlot(xMax, m * xMax + b, xMin, xMax, yMin, yMax);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Least Squares: Closest Point in Column Space</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        The least-squares line minimizes the total squared residual — the sum of squared vertical distances. It is the projection of <strong>b</strong> onto the column space of A.
      </p>

      <div className="flex gap-2 mb-3 flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => { setPresetIdx(i); setTrialM(null); }}
            className={`px-3 py-1 rounded text-xs ${i === presetIdx ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          {/* Axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#94a3b8" strokeWidth="1.5" />

          {/* Grid */}
          {[1, 2, 3].map(i => {
            const [px] = toPlot(xMin + (xMax - xMin) * i / 4, 0, xMin, xMax, yMin, yMax);
            const [, py] = toPlot(0, yMin + (yMax - yMin) * i / 4, xMin, xMax, yMin, yMax);
            return (
              <g key={i}>
                <line x1={px} y1={PAD} x2={px} y2={H - PAD} stroke="#e2e8f0" strokeWidth="1" />
                <line x1={PAD} y1={py} x2={W - PAD} y2={py} stroke="#e2e8f0" strokeWidth="1" />
              </g>
            );
          })}

          {/* Trial line (if different from best) */}
          {trialM !== null && Math.abs(trialM - m) > 0.05 && (
            <line x1={lx1} y1={ly1} x2={lx2} y2={ly2}
              stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6,4" />
          )}

          {/* Best fit line */}
          <line x1={bestLx1} y1={bestLy1} x2={bestLx2} y2={bestLy2}
            stroke="#6366f1" strokeWidth="2.5" />

          {/* Residuals */}
          {showResiduals && pts.map(([x, y], i) => {
            const yHat = m * x + b;
            const [px, py] = toPlot(x, y, xMin, xMax, yMin, yMax);
            const [, pyHat] = toPlot(x, yHat, xMin, xMax, yMin, yMax);
            return (
              <line key={i} x1={px} y1={py} x2={px} y2={pyHat}
                stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" />
            );
          })}

          {/* Data points */}
          {pts.map(([x, y], i) => {
            const [px, py] = toPlot(x, y, xMin, xMax, yMin, yMax);
            return <circle key={i} cx={px} cy={py} r="5" fill="#f59e0b" stroke="white" strokeWidth="1.5" />;
          })}

          {/* Labels */}
          <text x={W - PAD + 4} y={H - PAD + 4} fontSize="11" fill="#94a3b8">x</text>
          <text x={PAD + 4} y={PAD - 6} fontSize="11" fill="#94a3b8">y</text>
          <text x={bestLx2 - 40} y={bestLy2 - 8} fontSize="11" fill="#6366f1" fontWeight="600">best fit</text>
        </svg>
      </div>

      <div className="flex items-center gap-3 mb-3 px-1">
        <span className="text-sm font-mono w-8 text-violet-600">m =</span>
        <input type="range" min={(m - 1.5).toFixed(1)} max={(m + 1.5).toFixed(1)} step="0.05" value={trialM ?? m}
          onChange={e => setTrialM(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
        <span className="text-xs font-mono w-10 text-right">{(trialM ?? m).toFixed(2)}</span>
      </div>

      <label className="flex items-center gap-2 mb-3 cursor-pointer px-1">
        <input type="checkbox" checked={showResiduals} onChange={e => setShowResiduals(e.target.checked)} className="accent-red-500 w-4 h-4" />
        <span className="text-sm text-slate-700 dark:text-slate-300">Show residuals (red vertical distances)</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-3 py-2 text-center">
          <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">Best-fit m</p>
          <p className="font-mono font-bold">{m.toFixed(3)}</p>
        </div>
        <div className={`rounded-lg border px-3 py-2 text-center ${trialM !== null && Math.abs(trialM - m) > 0.05 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'}`}>
          <p className="text-xs text-slate-500 font-semibold">Σ residuals²</p>
          <p className="font-mono font-bold">{curResidual.toFixed(3)}</p>
          {trialM !== null && Math.abs(trialM - m) > 0.05 && (
            <p className="text-xs text-red-500">best: {bestResidual.toFixed(3)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
