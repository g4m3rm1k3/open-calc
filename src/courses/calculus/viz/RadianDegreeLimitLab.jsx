import React, { useMemo, useState } from 'react';

const PI180 = Math.PI / 180;

function safeRatio(unit, x) {
  if (Math.abs(x) < 1e-8) return unit === 'rad' ? 1 : PI180;
  return unit === 'rad'
    ? Math.sin(x) / x
    : Math.sin(x * PI180) / x;
}

// Map a value to SVG coordinates given plot bounds
function toSVG(x, y, xMin, xMax, yMin, yMax, left, right, top, bottom) {
  const sx = left + ((x - xMin) / (xMax - xMin)) * (right - left);
  const sy = bottom - ((y - yMin) / (yMax - yMin)) * (bottom - top);
  return [sx, sy];
}

export default function RadianDegreeLimitLab() {
  const [unit, setUnit] = useState('rad');
  const [xValue, setXValue] = useState(0.5);

  const isRad = unit === 'rad';
  const limitVal = isRad ? 1 : PI180;
  const xRange = isRad ? 1.2 : 60;   // ±xRange
  const xMin = -xRange, xMax = xRange;

  // SVG layout constants
  const W = 420, H = 220;
  const L = 52, R = W - 16, T = 14, B = H - 36;

  // Build curve points
  const points = useMemo(() => {
    const n = 200;
    return Array.from({ length: n + 1 }, (_, i) => {
      const x = xMin + ((xMax - xMin) * i) / n;
      return { x, y: safeRatio(unit, x) };
    });
  }, [unit, xMin, xMax]);

  // Y bounds — pad above/below the limit value
  const yMin = isRad ? -0.35 : -0.005;
  const yMax = isRad ? 1.15 : limitVal * 1.3;

  function sx(x) { return L + ((x - xMin) / (xMax - xMin)) * (R - L); }
  function sy(y) { return B - ((y - yMin) / (yMax - yMin)) * (B - T); }

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`)
    .join(' ');

  const currentY = safeRatio(unit, xValue);
  const dotX = sx(xValue), dotY = sy(currentY);
  const holeX = sx(0), holeY = sy(limitVal);

  // Axis tick helpers
  const xTicks = isRad
    ? [-1, -0.5, 0.5, 1]
    : [-60, -30, 30, 60];
  const yTicks = isRad
    ? [-0.2, 0.2, 0.4, 0.6, 0.8, 1.0]
    : [0, 0.005, 0.010, 0.015];

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-1">Radians vs Degrees — lim sin(x)/x</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        In <strong>radians</strong> the limit as x→0 is exactly <strong>1</strong>, so d/dx[sin x] = cos x cleanly.
        In <strong>degrees</strong> it is π/180 ≈ 0.01745, which would clutter every derivative formula with that constant.
      </p>

      {/* Unit toggle */}
      <div className="inline-flex rounded border border-slate-300 dark:border-slate-600 overflow-hidden mb-4">
        <button
          onClick={() => { setUnit('rad'); setXValue(0.5); }}
          className={`px-3 py-1 text-sm ${isRad ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800'}`}
        >
          Radians
        </button>
        <button
          onClick={() => { setUnit('deg'); setXValue(20); }}
          className={`px-3 py-1 text-sm ${!isRad ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800'}`}
        >
          Degrees
        </button>
      </div>

      {/* Slider */}
      <div className="mb-3">
        <label className="text-sm font-medium">
          x = {isRad ? xValue.toFixed(3) : xValue.toFixed(1)} {isRad ? 'rad' : '°'}
          &nbsp;→&nbsp; sin(x)/x = <span className="text-amber-500 font-bold">{currentY.toFixed(6)}</span>
        </label>
        <input
          type="range"
          min={xMin} max={xMax}
          step={isRad ? 0.001 : 0.1}
          value={xValue}
          onChange={e => setXValue(Number(e.target.value))}
          className="w-full mt-1"
        />
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">

        {/* Grid lines */}
        {yTicks.map(y => (
          <line key={y} x1={L} y1={sy(y)} x2={R} y2={sy(y)}
            stroke="#e2e8f0" strokeWidth="0.8" />
        ))}

        {/* Axes */}
        <line x1={L} y1={sy(0)} x2={R} y2={sy(0)} stroke="#64748b" strokeWidth="1.2" />
        <line x1={sx(0)} y1={T} x2={sx(0)} y2={B} stroke="#64748b" strokeWidth="1.2" />

        {/* X-axis ticks and labels */}
        {xTicks.map(x => (
          <g key={x}>
            <line x1={sx(x)} y1={sy(0) - 3} x2={sx(x)} y2={sy(0) + 3} stroke="#64748b" strokeWidth="1" />
            <text x={sx(x)} y={sy(0) + 14} textAnchor="middle" fontSize="9" fill="#94a3b8">{x}</text>
          </g>
        ))}
        {/* Axis labels */}
        <text x={(L + R) / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#64748b">
          x ({isRad ? 'radians' : 'degrees'})
        </text>
        <text x={10} y={(T + B) / 2} textAnchor="middle" fontSize="10" fill="#64748b"
          transform={`rotate(-90, 10, ${(T + B) / 2})`}>
          sin(x)/x
        </text>

        {/* Y-axis ticks and labels */}
        {yTicks.filter(y => y !== 0).map(y => (
          <g key={y}>
            <line x1={sx(0) - 3} y1={sy(y)} x2={sx(0) + 3} y2={sy(y)} stroke="#64748b" strokeWidth="1" />
            <text x={sx(0) - 6} y={sy(y) + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">
              {isRad ? y.toFixed(1) : y.toFixed(3)}
            </text>
          </g>
        ))}

        {/* Limit dashed line */}
        <line x1={L} y1={sy(limitVal)} x2={R} y2={sy(limitVal)}
          stroke="#ef4444" strokeDasharray="6 4" strokeWidth="1.5" />
        <text x={R - 2} y={sy(limitVal) - 5} textAnchor="end" fontSize="9" fill="#ef4444" fontWeight="600">
          limit = {isRad ? '1' : 'π/180 ≈ 0.01745'}
        </text>

        {/* Curve */}
        <path d={path} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Curve label */}
        <text x={R - 4} y={sy(safeRatio(unit, xMax * 0.85)) - 8} textAnchor="end"
          fontSize="10" fill="#0ea5e9" fontStyle="italic">
          y = sin(x)/x
        </text>

        {/* Open circle at x=0 (removable discontinuity) */}
        <circle cx={holeX} cy={holeY} r="5" fill="white" stroke="#0ea5e9" strokeWidth="2" />

        {/* Current x dot */}
        {Math.abs(xValue) > 0.01 && (
          <g>
            {/* Dashed drop lines */}
            <line x1={dotX} y1={sy(0)} x2={dotX} y2={dotY}
              stroke="#f59e0b" strokeDasharray="3 2" strokeWidth="1" />
            <line x1={sx(0)} y1={dotY} x2={dotX} y2={dotY}
              stroke="#f59e0b" strokeDasharray="3 2" strokeWidth="1" />
            <circle cx={dotX} cy={dotY} r="5" fill="#f59e0b" />
          </g>
        )}
      </svg>

      {/* Insight callout */}
      <div className={`mt-4 p-3 rounded-lg text-sm border ${isRad
        ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200'
        : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200'}`}>
        {isRad
          ? <><strong>Radians:</strong> As x→0, sin(x)/x → <strong>1</strong> exactly. This is why d/dx[sin x] = cos x with no extra constants.</>
          : <><strong>Degrees:</strong> As x→0°, sin(x°)/x → <strong>π/180 ≈ 0.01745</strong>. Every trig derivative would carry this constant — calculus avoids that by using radians.</>
        }
      </div>
    </div>
  );
}
