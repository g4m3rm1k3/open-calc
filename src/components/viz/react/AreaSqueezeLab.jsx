import React, { useMemo, useState } from 'react';

export default function AreaSqueezeLab() {
  const [theta, setTheta] = useState(0.6);

  const values = useMemo(() => {
    const inner = 0.5 * Math.sin(theta) * Math.cos(theta);
    const sector = 0.5 * theta;
    const outer = 0.5 * Math.tan(theta);
    return { inner, sector, outer };
  }, [theta]);

  const cx = 120;
  const cy = 140;
  const r = 90;

  const px = cx + r * Math.cos(theta);
  const py = cy - r * Math.sin(theta);
  const ty = cy - r * Math.tan(theta);

  const arcPath = `M ${cx + r} ${cy} A ${r} ${r} 0 0 0 ${px} ${py}`;

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-2">Area Squeeze Proof Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Drag theta toward 0 and watch the sector get trapped between the inner and outer triangles.
      </p>

      <label className="text-sm font-medium">theta (radians): {theta.toFixed(3)}</label>
      <input
        type="range"
        min="0.05"
        max="1.2"
        step="0.005"
        value={theta}
        onChange={(e) => setTheta(Number(e.target.value))}
        className="w-full mt-2 mb-4"
      />

      <svg viewBox="0 0 420 250" className="w-full rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
        <line x1={cx - 110} y1={cy} x2={cx + 220} y2={cy} stroke="#334155" strokeWidth="1.2" />
        <line x1={cx + r} y1={cy - 130} x2={cx + r} y2={cy + 35} stroke="#334155" strokeDasharray="4 4" />

        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#64748b" strokeWidth="1.5" />

        <polygon points={`${cx},${cy} ${cx + r},${cy} ${px},${py}`} fill="#38bdf833" stroke="#0891b2" strokeWidth="1.3" />
        <path d={`${arcPath} L ${cx} ${cy} Z`} fill="#22c55e33" stroke="#16a34a" strokeWidth="1.2" />
        <polygon points={`${cx},${cy} ${cx + r},${cy} ${cx + r},${ty}`} fill="#f59e0b33" stroke="#d97706" strokeWidth="1.3" />

        <line x1={cx} y1={cy} x2={px} y2={py} stroke="#0f172a" strokeWidth="2" />
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#0f172a" strokeWidth="2" />
        <line x1={cx + r} y1={cy} x2={cx + r} y2={ty} stroke="#0f172a" strokeWidth="2" />

        <text x="245" y="40" className="fill-sky-600 text-xs font-semibold">Inner triangle</text>
        <text x="245" y="60" className="fill-green-600 text-xs font-semibold">Sector (pizza slice)</text>
        <text x="245" y="80" className="fill-amber-600 text-xs font-semibold">Outer triangle</text>
      </svg>

      <div className="mt-4 text-sm space-y-1">
        <p className="font-semibold">Inequality:</p>
        <p>1/2 sin(theta)cos(theta) {'<='} 1/2 theta {'<='} 1/2 tan(theta)</p>
        <p className="text-slate-700 dark:text-slate-200">{values.inner.toFixed(6)} {'<='} {values.sector.toFixed(6)} {'<='} {values.outer.toFixed(6)}</p>
      </div>
    </div>
  );
}
