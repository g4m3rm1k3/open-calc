import React, { useMemo, useState } from 'react';

function safeRatio(unit, x) {
  if (Math.abs(x) < 1e-8) return unit === 'rad' ? 1 : Math.PI / 180;
  if (unit === 'rad') return Math.sin(x) / x;
  return Math.sin((x * Math.PI) / 180) / x;
}

export default function RadianDegreeLimitLab() {
  const [unit, setUnit] = useState('rad');
  const [xValue, setXValue] = useState(0.2);

  const limitTarget = unit === 'rad' ? 1 : Math.PI / 180;
  const range = unit === 'rad' ? 0.6 : 35;

  const points = useMemo(() => {
    const out = [];
    const n = 140;
    for (let i = 0; i <= n; i += 1) {
      const x = -range + (2 * range * i) / n;
      const y = safeRatio(unit, x);
      out.push({ x, y });
    }
    return out;
  }, [unit, range]);

  const path = points
    .map((p, i) => {
      const sx = 30 + ((p.x + range) / (2 * range)) * 360;
      const sy = 150 - p.y * 90;
      return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(2)} ${sy.toFixed(2)}`;
    })
    .join(' ');

  const currentY = safeRatio(unit, xValue);

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Radians vs Degrees Limit Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Toggle units to see why calculus standardizes on radians for lim sin(x)/x at x {'->'} 0.
      </p>

      <div className="inline-flex rounded border border-slate-300 dark:border-slate-600 overflow-hidden mb-4">
        <button
          onClick={() => {
            setUnit('rad');
            setXValue(0.2);
          }}
          className={`px-3 py-1 text-sm ${unit === 'rad' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800'}`}
        >
          Radians
        </button>
        <button
          onClick={() => {
            setUnit('deg');
            setXValue(10);
          }}
          className={`px-3 py-1 text-sm ${unit === 'deg' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800'}`}
        >
          Degrees
        </button>
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium">x ({unit === 'rad' ? 'radians' : 'degrees'}): {xValue.toFixed(unit === 'rad' ? 3 : 1)}</label>
        <input
          type="range"
          min={-range}
          max={range}
          step={unit === 'rad' ? 0.001 : 0.1}
          value={xValue}
          onChange={(e) => setXValue(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      <svg viewBox="0 0 420 190" className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
        <line x1="30" y1="150" x2="390" y2="150" stroke="#64748b" strokeWidth="1" />
        <line x1="210" y1="20" x2="210" y2="170" stroke="#64748b" strokeWidth="1" />

        <line x1="30" y1={150 - limitTarget * 90} x2="390" y2={150 - limitTarget * 90} stroke="#ef4444" strokeDasharray="5 4" strokeWidth="1.5" />

        <path d={path} fill="none" stroke="#0ea5e9" strokeWidth="2.5" />

        <circle
          cx={30 + ((xValue + range) / (2 * range)) * 360}
          cy={150 - currentY * 90}
          r="4.5"
          fill="#f59e0b"
        />
      </svg>

      <div className="mt-3 text-sm space-y-1">
        <p><span className="font-semibold">Current ratio:</span> sin(x)/x = {currentY.toFixed(6)}</p>
        <p><span className="font-semibold">Limit near 0 ({unit}):</span> {limitTarget.toFixed(6)}</p>
        <p className="text-slate-600 dark:text-slate-300">
          In radians the limit is exactly 1. In degrees it drops to pi/180 (~0.017453), which complicates derivative formulas.
        </p>
      </div>
    </div>
  );
}
