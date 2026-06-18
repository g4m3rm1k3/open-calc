import React, { useMemo, useState } from 'react';

export default function ExpLogBridgeLab() {
  const [mode, setMode] = useState('exp');
  const [x, setX] = useState(1);

  const state = useMemo(() => {
    if (mode === 'exp') {
      const y = Math.exp(x);
      const slope = y;
      return { y, slope, rule: 'd/dx[e^x] = e^x' };
    }

    const safeX = Math.max(0.1, x);
    const y = Math.log(safeX);
    const slope = 1 / safeX;
    return { y, slope, rule: 'd/dx[ln x] = 1/x' };
  }, [mode, x]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Exponential vs Log Bridge Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Compare growth and slope directly: exponentials copy themselves under differentiation, while logs invert input scale.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setMode('exp')} className={`px-3 py-1.5 rounded text-sm ${mode === 'exp' ? 'bg-brand-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
          e^x mode
        </button>
        <button onClick={() => setMode('log')} className={`px-3 py-1.5 rounded text-sm ${mode === 'log' ? 'bg-brand-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
          ln(x) mode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 text-sm">
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold">Intuition</p>
          <p>{mode === 'exp' ? 'Bigger value means steeper growth immediately.' : 'As x grows, ln(x) keeps rising but flattens out.'}</p>
        </div>
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold">Math</p>
          <p className="font-mono">x = {Math.max(0.1, x).toFixed(3)}</p>
          <p className="font-mono">f(x) = {state.y.toFixed(4)}</p>
          <p className="font-mono">f'(x) = {state.slope.toFixed(4)}</p>
        </div>
        <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="font-semibold">Rigor</p>
          <p className="font-mono">{state.rule}</p>
          <p>{mode === 'exp' ? 'Function value and derivative value are identical at every x.' : 'Log derivative follows reciprocal law, which explains gradual flattening.'}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">x: {Math.max(0.1, x).toFixed(3)}</label>
        <input
          type="range"
          min={mode === 'exp' ? '-2' : '0.1'}
          max="4"
          step="0.01"
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>
    </div>
  );
}
