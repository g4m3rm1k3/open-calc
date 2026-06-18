import React, { useState } from 'react';

export default function ConjugateVisualizer() {
  const [x, setX] = useState(0.6);

  const lhs = Math.abs(x) < 1e-9 ? 0 : (1 - Math.cos(x)) / x;
  const mid = Math.abs(x) < 1e-9 ? 0 : ((1 - Math.cos(x)) * (1 + Math.cos(x))) / (x * (1 + Math.cos(x)));
  const rhs1 = Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x;
  const rhs2 = Math.sin(x) / (1 + Math.cos(x));

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Conjugate Trick Visualizer</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Multiply by (1+cos x)/(1+cos x) to convert the hard gap term into sin^2 x, which matches known pillar patterns.
      </p>

      <label className="text-sm font-medium">x (radians): {x.toFixed(3)}</label>
      <input
        className="w-full mt-2 mb-4"
        type="range"
        min="0.02"
        max="1.2"
        step="0.005"
        value={x}
        onChange={(e) => setX(Number(e.target.value))}
      />

      <div className="grid grid-cols-1 gap-3 text-sm mb-4">
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          <p className="font-semibold">Original form</p>
          <p className="font-mono">(1-cos x)/x = {lhs.toFixed(6)}</p>
        </div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          <p className="font-semibold">After conjugate multiply</p>
          <p className="font-mono">((1-cos x)(1+cos x))/(x(1+cos x)) = {mid.toFixed(6)}</p>
        </div>
        <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          <p className="font-semibold">Factorized target</p>
          <p className="font-mono">(sin x / x) * (sin x / (1+cos x)) = {rhs1.toFixed(6)} * {rhs2.toFixed(6)}</p>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        As x {'->'} 0, first factor {'->'} 1 and second factor {'->'} 0/2 = 0, so the whole expression goes to 0.
      </p>
    </div>
  );
}
