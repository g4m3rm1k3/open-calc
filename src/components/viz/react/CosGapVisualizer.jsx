import React, { useState } from 'react';

export default function CosGapVisualizer() {
  const [x, setX] = useState(0.8);

  const cx = 120;
  const cy = 130;
  const r = 90;
  const px = cx + r * Math.cos(x);
  const py = cy - r * Math.sin(x);

  const sinVal = Math.sin(x);
  const gap = 1 - Math.cos(x);
  const ratio = gap / x;

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Second Pillar Gap Visualizer</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        See why (1-cos x)/x {'->'} 0: the horizontal gap shrinks faster than x.
      </p>

      <label className="text-sm font-medium">x (radians): {x.toFixed(3)}</label>
      <input
        className="w-full mt-2 mb-4"
        type="range"
        min="0.02"
        max="1.4"
        step="0.005"
        value={x}
        onChange={(e) => setX(Number(e.target.value))}
      />

      <svg viewBox="0 0 420 240" className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#64748b" strokeWidth="1.5" />
        <line x1={cx - 115} y1={cy} x2={cx + 165} y2={cy} stroke="#334155" strokeWidth="1.2" />
        <line x1={cx} y1={cy + 20} x2={cx} y2={cy - 115} stroke="#334155" strokeWidth="1.2" />

        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#0ea5e9" strokeWidth="2" />
        <line x1={px} y1={py} x2={px} y2={cy} stroke="#22c55e" strokeDasharray="5 4" strokeWidth="2" />

        <line x1={px} y1={cy} x2={cx + r} y2={cy} stroke="#f59e0b" strokeWidth="3" />

        <circle cx={px} cy={py} r="4.5" fill="#0f172a" />

        <text x="250" y="70" className="fill-emerald-600 text-xs font-semibold">sin x (vertical)</text>
        <text x="250" y="90" className="fill-amber-600 text-xs font-semibold">1-cos x (horizontal gap)</text>
      </svg>

      <div className="mt-4 text-sm space-y-1">
        <p><span className="font-semibold">sin x:</span> {sinVal.toFixed(6)}</p>
        <p><span className="font-semibold">1-cos x:</span> {gap.toFixed(6)}</p>
        <p><span className="font-semibold">(1-cos x)/x:</span> {ratio.toFixed(6)}</p>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        As x gets tiny, sin x shrinks linearly but 1-cos x shrinks faster, so dividing by x still drives the ratio to 0.
      </p>
    </div>
  );
}
