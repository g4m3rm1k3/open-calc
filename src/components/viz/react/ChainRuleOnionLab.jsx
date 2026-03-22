import React, { useMemo, useState } from 'react';

const PROBLEMS = {
  sin5x2: {
    label: 'sin(5x^2)',
    layers: [
      { name: 'Outer skin', shown: 'sin(...)', deriv: 'cos(5x^2)' },
      { name: 'Core', shown: '5x^2', deriv: '10x' },
    ],
    answer: '10x cos(5x^2)',
  },
  tan4x3: {
    label: 'tan(4x^3)',
    layers: [
      { name: 'Outer skin', shown: 'tan(...)', deriv: 'sec^2(4x^3)' },
      { name: 'Core', shown: '4x^3', deriv: '12x^2' },
    ],
    answer: '12x^2 sec^2(4x^3)',
  },
  cos3x2: {
    label: '(cos x)^3',
    layers: [
      { name: 'Outer skin', shown: '(...)^3', deriv: '3(cos x)^2' },
      { name: 'Core', shown: 'cos x', deriv: '-sin x' },
    ],
    answer: '-3(cos x)^2 sin x',
  },
};

export default function ChainRuleOnionLab() {
  const [problemKey, setProblemKey] = useState('sin5x2');
  const [peeled, setPeeled] = useState(0);
  const problem = PROBLEMS[problemKey];

  const factors = useMemo(() => problem.layers.slice(0, peeled).map((l) => l.deriv), [problem, peeled]);
  const done = peeled >= problem.layers.length;

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Peel the Onion: Chain Rule Scaffolding</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Peel from outside to inside. Never change the inside while peeling the outer skin.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(PROBLEMS).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => {
              setProblemKey(key);
              setPeeled(0);
            }}
            className={`px-3 py-1.5 rounded text-sm ${problemKey === key ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600'}`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 mb-3">
        <p className="font-semibold mb-2">Current function: <span className="font-mono">{problem.label}</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {problem.layers.map((layer, i) => (
            <button
              key={layer.name}
              onClick={() => {
                if (i === peeled) {
                  setPeeled((v) => v + 1);
                }
              }}
              className={`text-left p-3 rounded border ${
                i < peeled
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20'
                  : i === peeled
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60'
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{layer.name}</p>
              <p className="font-mono">{layer.shown}</p>
              <p className="text-xs mt-1">{i < peeled ? `peeled -> ${layer.deriv}` : i === peeled ? 'click to peel' : 'locked'}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 mb-3">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Derivative build</p>
        {factors.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Start by peeling the outer skin.</p>
        ) : (
          <p className="font-mono text-sm">f'(x) = {factors.join(' * ')}</p>
        )}
        {done && (
          <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Final: {problem.answer}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setPeeled((v) => Math.max(0, v - 1))}
          className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-800 text-sm"
          disabled={peeled === 0}
        >
          Undo peel
        </button>
        <button
          onClick={() => setPeeled(0)}
          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
