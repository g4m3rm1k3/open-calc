import React, { useMemo, useState } from 'react';

function approxSlope(f, x, h = 1e-4) {
  return (f(x + h) - f(x)) / h;
}

export default function BrokenChainTrapLab() {
  const [x, setX] = useState(0);

  const stats = useMemo(() => {
    const f = (t) => Math.abs(Math.sin(t));
    const left = (f(x) - f(x - 1e-4)) / 1e-4;
    const right = (f(x + 1e-4) - f(x)) / 1e-4;
    const inner = Math.cos(x);
    const naive = Math.sign(Math.sin(x)) * inner;
    return { left, right, inner, naive };
  }, [x]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Broken Chain Warning: |sin(x)| at x=0</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Inner sin(x) is differentiable at 0, but outer |u| is not differentiable at u=0. One broken link snaps the chain.
      </p>

      <div className="mb-4">
        <label className="text-sm font-medium">x: {x.toFixed(4)}</label>
        <input type="range" min="-0.2" max="0.2" step="0.001" value={x} onChange={(e) => setX(Number(e.target.value))} className="w-full mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold mb-1">One-sided slopes of y=|sin x|</p>
          <p>Left slope ~ <span className="font-mono">{stats.left.toFixed(4)}</span></p>
          <p>Right slope ~ <span className="font-mono">{stats.right.toFixed(4)}</span></p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold mb-1">What naive chain would suggest</p>
          <p>sign(sin x)*cos x ~ <span className="font-mono">{Number.isFinite(stats.naive) ? stats.naive.toFixed(4) : 'undefined'}</span></p>
          <p className="text-slate-500 dark:text-slate-400">At x=0, sign is not defined, so formula breaks.</p>
        </div>
      </div>

      <div className="rounded border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/30 p-3 text-sm">
        <p className="font-semibold">Expert takeaway</p>
        <p>Chain rule requires each link to be differentiable at the evaluation point, not just nearby.</p>
      </div>
    </div>
  );
}
