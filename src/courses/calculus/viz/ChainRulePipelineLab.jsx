import React, { useMemo, useState } from 'react';

export default function ChainRulePipelineLab() {
  const [mInner, setMInner] = useState(2);
  const [mOuter, setMOuter] = useState(3);
  const [dx, setDx] = useState(0.5);

  const data = useMemo(() => {
    const du = mInner * dx;
    const dy = mOuter * du;
    return { du, dy, mTotal: mInner * mOuter };
  }, [mInner, mOuter, dx]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Function Pipeline: Relay of Rates</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        x goes through inner machine g, then outer machine f. Output speed is product of stage speeds.
      </p>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
          <span className="font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">x</span>
          <span>{'->'}</span>
          <span className="font-mono px-2 py-1 rounded bg-sky-100 dark:bg-sky-900/20">[ g machine ]</span>
          <span>{'->'}</span>
          <span className="font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">u</span>
          <span>{'->'}</span>
          <span className="font-mono px-2 py-1 rounded bg-violet-100 dark:bg-violet-900/20">[ f machine ]</span>
          <span>{'->'}</span>
          <span className="font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">y</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mb-4">
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold mb-1">Inner speedometer</p>
          <p className="font-mono">du/dx = {mInner.toFixed(2)}</p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold mb-1">Outer speedometer</p>
          <p className="font-mono">dy/du = {mOuter.toFixed(2)}</p>
        </div>
        <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="font-semibold mb-1">Combined output speed</p>
          <p className="font-mono">dy/dx = {data.mTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium">du/dx (inner): {mInner.toFixed(2)}</label>
          <input type="range" min="-4" max="4" step="0.1" value={mInner} onChange={(e) => setMInner(Number(e.target.value))} className="w-full mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium">dy/du (outer): {mOuter.toFixed(2)}</label>
          <input type="range" min="-4" max="4" step="0.1" value={mOuter} onChange={(e) => setMOuter(Number(e.target.value))} className="w-full mt-2" />
        </div>
        <div>
          <label className="text-sm font-medium">input nudge dx: {dx.toFixed(2)}</label>
          <input type="range" min="-2" max="2" step="0.1" value={dx} onChange={(e) => setDx(Number(e.target.value))} className="w-full mt-2" />
        </div>
      </div>

      <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-sm">
        <p className="font-mono">du = (du/dx)*dx = {mInner.toFixed(2)}*{dx.toFixed(2)} = {data.du.toFixed(3)}</p>
        <p className="font-mono">dy = (dy/du)*du = {mOuter.toFixed(2)}*{data.du.toFixed(3)} = {data.dy.toFixed(3)}</p>
        <p className="font-mono">Therefore dy/dx = (dy/du)*(du/dx) = {data.mTotal.toFixed(3)}</p>
      </div>
    </div>
  );
}
