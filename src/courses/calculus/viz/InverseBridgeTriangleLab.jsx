import React, { useMemo, useState } from 'react';

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

export default function InverseBridgeTriangleLab() {
  const [x, setX] = useState(0.5);

  const model = useMemo(() => {
    const safeX = clamp(x, -0.95, 0.95);
    const y = Math.asin(safeX);
    const adj = Math.sqrt(1 - safeX * safeX);
    const cosY = Math.cos(y);
    const dydx = 1 / adj;
    return { safeX, y, adj, cosY, dydx };
  }, [x]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Inverse Bridge: Triangle to arcsin Derivative</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Let y = arcsin(x), so sin(y) = x. Implicit differentiation gives cos(y) * y' = 1, hence y' = 1/cos(y).
        In the right triangle, cos(y) is adjacent/hypotenuse = sqrt(1-x^2), so y' = 1/sqrt(1-x^2).
      </p>

      <div className="mb-4">
        <label className="text-sm font-medium">x (opposite side): {model.safeX.toFixed(3)}</label>
        <input
          type="range"
          min="-0.95"
          max="0.95"
          step="0.01"
          value={model.safeX}
          onChange={(e) => setX(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <svg viewBox="0 0 320 220" className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          <line x1="40" y1="180" x2="250" y2="180" stroke="#334155" strokeWidth="2" />
          <line x1="250" y1="180" x2="250" y2="40" stroke="#334155" strokeWidth="2" />
          <line x1="40" y1="180" x2="250" y2="40" stroke="#2563eb" strokeWidth="3" />

          <rect x="236" y="166" width="14" height="14" fill="none" stroke="#64748b" strokeWidth="1.5" />

          <path d="M 72 180 A 32 32 0 0 1 98 161" fill="none" stroke="#10b981" strokeWidth="2" />
          <text x="88" y="168" fontSize="12" fill="#10b981">y</text>

          <text x="136" y="198" fontSize="12" fill="#f59e0b">adjacent = sqrt(1-x^2)</text>
          <text x="258" y="116" fontSize="12" fill="#ef4444">opposite = x</text>
          <text x="130" y="98" fontSize="12" fill="#2563eb">hypotenuse = 1</text>
        </svg>

        <div className="space-y-3 text-sm">
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
            <p className="font-semibold mb-1">Implicit differentiation chain</p>
            <p className="font-mono">sin(y) = x</p>
            <p className="font-mono">cos(y) * y' = 1</p>
            <p className="font-mono">y' = 1 / cos(y)</p>
          </div>
          <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
            <p className="font-semibold mb-1">Triangle substitution</p>
            <p className="font-mono">cos(y) = sqrt(1-x^2)</p>
            <p className="font-mono">d/dx[arcsin(x)] = 1/sqrt(1-x^2)</p>
          </div>
          <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
            <p>x = {model.safeX.toFixed(3)}</p>
            <p>y = arcsin(x) = {model.y.toFixed(3)} rad</p>
            <p>cos(y) = {model.cosY.toFixed(5)} ~ sqrt(1-x^2) = {model.adj.toFixed(5)}</p>
            <p>d/dx[arcsin x] = {model.dydx.toFixed(5)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
