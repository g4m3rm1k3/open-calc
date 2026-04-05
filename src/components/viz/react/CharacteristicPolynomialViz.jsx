import React, { useState } from 'react';

// For 2x2 matrix [[a,b],[c,d]]:
// det(A - λI) = (a-λ)(d-λ) - bc = λ² - (a+d)λ + (ad-bc)
// = λ² - trace·λ + det

const PLOT_W = 320, PLOT_H = 200;
const X_MIN = -4, X_MAX = 6, Y_MIN = -8, Y_MAX = 12;

function toPlot(lambda, val) {
  const x = (lambda - X_MIN) / (X_MAX - X_MIN) * PLOT_W;
  const y = PLOT_H - (val - Y_MIN) / (Y_MAX - Y_MIN) * PLOT_H;
  return [x, y];
}

function charPoly(a, b, c, d, lambda) {
  return lambda * lambda - (a + d) * lambda + (a * d - b * c);
}

function findRoots(trace, det) {
  // λ = (trace ± sqrt(trace² - 4det)) / 2
  const disc = trace * trace - 4 * det;
  if (disc < 0) return { type: 'complex', disc };
  if (disc < 1e-9) return { type: 'repeated', r: trace / 2 };
  const sq = Math.sqrt(disc);
  return { type: 'real', r1: (trace + sq) / 2, r2: (trace - sq) / 2 };
}

export default function CharacteristicPolynomialViz() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(1);
  const [c, setC] = useState(2);
  const [d, setD] = useState(2);

  const trace = a + d;
  const detM = a * d - b * c;
  const roots = findRoots(trace, detM);

  // Build path for plot
  const N = 200;
  const points = [];
  for (let i = 0; i <= N; i++) {
    const lambda = X_MIN + (X_MAX - X_MIN) * i / N;
    const val = charPoly(a, b, c, d, lambda);
    const [px, py] = toPlot(lambda, val);
    if (py > -20 && py < PLOT_H + 20) points.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
    else points.push('M');
  }
  const pathD = points.join(' ');

  const [zeroX] = toPlot(0, 0);
  const [zeroY] = [PLOT_H - (0 - Y_MIN) / (Y_MAX - Y_MIN) * PLOT_H];
  const [xAxisY] = [zeroY];

  // Zero line points
  const [x0] = toPlot(X_MIN, 0);
  const [x1] = toPlot(X_MAX, 0);
  const [y0] = [xAxisY];

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Characteristic Polynomial</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        The eigenvalues are where <span className="font-mono">det(A − λI) = 0</span>. The curve is a parabola — its zeros are the eigenvalues. Adjust the matrix entries.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {[['a', a, setA], ['b', b, setB], ['c', c, setC], ['d', d, setD]].map(([label, val, setter]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-sm font-mono w-6 text-violet-600 dark:text-violet-400">{label} =</span>
            <input type="range" min="-3" max="5" step="0.5" value={val}
              onChange={e => setter(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
            <span className="text-xs font-mono w-6 text-right">{val}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center mb-3">
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-2 overflow-hidden">
          <p className="text-xs text-slate-400 text-center mb-1 font-mono">
            det(A − λI) = λ² − {trace}λ + {detM}
          </p>
          <svg width={PLOT_W} height={PLOT_H}>
            {/* Grid */}
            {[-2, 0, 2, 4].map(x => {
              const [px] = toPlot(x, 0);
              return <line key={x} x1={px} y1={0} x2={px} y2={PLOT_H} stroke="#e2e8f0" strokeWidth="1" />;
            })}
            {[-4, 0, 4, 8].map(y => {
              const [, py] = toPlot(0, y);
              return <line key={y} x1={0} y1={py} x2={PLOT_W} y2={py} stroke="#e2e8f0" strokeWidth="1" />;
            })}

            {/* Zero line */}
            <line x1={0} y1={xAxisY} x2={PLOT_W} y2={xAxisY} stroke="#94a3b8" strokeWidth="1.5" />
            <text x={PLOT_W - 4} y={xAxisY - 4} fontSize="10" fill="#94a3b8" textAnchor="end">λ axis</text>

            {/* λ = 0 vertical */}
            <line x1={zeroX} y1={0} x2={zeroX} y2={PLOT_H} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />

            {/* Curve */}
            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Eigenvalue marks */}
            {roots.type === 'real' && (
              <>
                {[roots.r1, roots.r2].map((r, i) => {
                  if (r < X_MIN || r > X_MAX) return null;
                  const [rx] = toPlot(r, 0);
                  return (
                    <g key={i}>
                      <circle cx={rx} cy={xAxisY} r="6" fill="#ef4444" />
                      <text x={rx} y={xAxisY + 16} fontSize="11" fill="#ef4444" textAnchor="middle" fontWeight="600">
                        λ={r.toFixed(2)}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
            {roots.type === 'repeated' && (() => {
              const [rx] = toPlot(roots.r, 0);
              return (
                <g>
                  <circle cx={rx} cy={xAxisY} r="7" fill="#f59e0b" />
                  <text x={rx} y={xAxisY + 16} fontSize="11" fill="#f59e0b" textAnchor="middle" fontWeight="600">
                    λ={roots.r.toFixed(2)} ×2
                  </text>
                </g>
              );
            })()}

            {/* Axis labels */}
            {[-2, 2, 4].map(x => {
              const [px] = toPlot(x, 0);
              return <text key={x} x={px} y={xAxisY + 12} fontSize="10" fill="#94a3b8" textAnchor="middle">{x}</text>;
            })}
          </svg>
        </div>
      </div>

      <div className={`rounded-lg px-3 py-2 text-sm text-center font-semibold border ${
        roots.type === 'real' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' :
        roots.type === 'repeated' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' :
        'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
      }`}>
        {roots.type === 'real' && `Two real eigenvalues: λ₁ ≈ ${roots.r1.toFixed(3)}, λ₂ ≈ ${roots.r2.toFixed(3)}`}
        {roots.type === 'repeated' && `Repeated eigenvalue: λ = ${roots.r.toFixed(3)} (parabola just touches zero)`}
        {roots.type === 'complex' && `Complex eigenvalues: no real zeros — discriminant = ${roots.disc.toFixed(2)} < 0`}
      </div>
    </div>
  );
}
