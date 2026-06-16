import React, { useMemo, useState } from 'react';

const TARGETS = [
  { id: 'outer', label: '(... )^3', answer: 'Outer' },
  { id: 'middle', label: 'tan(...)', answer: 'Middle' },
  { id: 'inner', label: '4x', answer: 'Inner' },
];

const OPTIONS = ['Outer', 'Middle', 'Inner'];

export default function LayerScanGame() {
  const [picked, setPicked] = useState({ outer: '', middle: '', inner: '' });
  const [checked, setChecked] = useState(false);

  const score = useMemo(() => {
    let n = 0;
    for (const t of TARGETS) {
      if (picked[t.id] === t.answer) n += 1;
    }
    return n;
  }, [picked]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Layer Scan Mini-Game</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Function: y = tan^3(4x) = (tan(4x))^3. Label each layer before differentiating.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {TARGETS.map((t) => (
          <div key={t.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Piece</p>
            <p className="font-mono mb-2">{t.label}</p>
            <select
              value={picked[t.id]}
              onChange={(e) => setPicked((p) => ({ ...p, [t.id]: e.target.value }))}
              className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm"
            >
              <option value="">Choose label</option>
              {OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {checked && (
              <p className={`mt-2 text-xs ${picked[t.id] === t.answer ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {picked[t.id] === t.answer ? 'Correct' : `Expected: ${t.answer}`}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setChecked(true)}
          className="px-3 py-1.5 rounded bg-brand-500 text-white text-sm"
        >
          Check layers
        </button>
        <button
          onClick={() => {
            setPicked({ outer: '', middle: '', inner: '' });
            setChecked(false);
          }}
          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm"
        >
          Reset
        </button>
        {checked && (
          <span className="text-sm text-slate-700 dark:text-slate-300">Score: {score}/3</span>
        )}
      </div>
    </div>
  );
}
