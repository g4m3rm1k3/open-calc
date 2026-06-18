import React, { useMemo, useState } from 'react';

function machineBox(title, value, color) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
      <p className={`text-xs font-bold mb-1 ${color}`}>{title}</p>
      <p className="font-mono text-sm">{value}</p>
    </div>
  );
}

export default function NestedTrigMachine() {
  const [mode, setMode] = useState('sin_x2');
  const [x, setX] = useState(1.2);

  const result = useMemo(() => {
    if (mode === 'sin_x2') {
      const inner = x * x;
      const y = Math.sin(inner);
      const dy = 2 * x * Math.cos(inner);
      return {
        title: 'sin(x^2)',
        machineFlow: ['x', 'square', 'sine'],
        inner,
        y,
        dy,
        formula: "d/dx[sin(x^2)] = cos(x^2) * 2x",
      };
    }

    const inner = Math.sin(x);
    const y = inner * inner;
    const dy = 2 * Math.sin(x) * Math.cos(x);
    return {
      title: 'sin^2(x)',
      machineFlow: ['x', 'sine', 'square'],
      inner,
      y,
      dy,
      formula: "d/dx[(sin x)^2] = 2 sin(x) cos(x)",
    };
  }, [mode, x]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Nested Machine: Chain Rule Trap Fix</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Same symbols, different order of machines. Swap the order and the derivative changes completely.
      </p>

      <div className="inline-flex rounded border border-slate-300 dark:border-slate-600 overflow-hidden mb-4">
        <button
          onClick={() => setMode('sin_x2')}
          className={`px-3 py-1 text-sm ${mode === 'sin_x2' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800'}`}
        >
          sin(x^2)
        </button>
        <button
          onClick={() => setMode('sin2_x')}
          className={`px-3 py-1 text-sm ${mode === 'sin2_x' ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800'}`}
        >
          sin^2(x)
        </button>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">x: {x.toFixed(3)}</label>
        <input
          type="range"
          min="-2.5"
          max="2.5"
          step="0.01"
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          className="w-full mt-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        {machineBox('Input', `x = ${x.toFixed(3)}`, 'text-sky-600 dark:text-sky-400')}
        {machineBox('Machine 1', result.machineFlow[1], 'text-violet-600 dark:text-violet-400')}
        {machineBox('Machine 2', result.machineFlow[2], 'text-emerald-600 dark:text-emerald-400')}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold mb-1">Current function</p>
          <p className="font-mono mb-1">{result.title}</p>
          <p>Output value: <span className="font-mono">{result.y.toFixed(6)}</span></p>
          <p>Intermediate value: <span className="font-mono">{result.inner.toFixed(6)}</span></p>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold mb-1">Derivative rule</p>
          <p className="font-mono mb-1">{result.formula}</p>
          <p>Numeric derivative at x: <span className="font-mono">{result.dy.toFixed(6)}</span></p>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
        Memory anchor: the outside machine differentiates first, then multiply by derivative of whatever fed into it.
      </p>
    </div>
  );
}
