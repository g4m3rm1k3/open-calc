import React, { useMemo, useState } from 'react';

const STEPS = [
  {
    action: 'Start from geometry',
    equation: 'sin(theta) <= theta <= tan(theta)',
    note: 'This comes from unit-circle area geometry for 0 < theta < pi/2.',
  },
  {
    action: 'Divide by sin(theta)',
    equation: '1 <= theta/sin(theta) <= 1/cos(theta)',
    note: 'Safe because sin(theta) > 0 in this interval.',
  },
  {
    action: 'Invert inequality',
    equation: 'cos(theta) <= sin(theta)/theta <= 1',
    note: 'All terms are positive, so inversion flips order correctly.',
  },
  {
    action: 'Take theta -> 0',
    equation: '1 <= L <= 1  where L = lim sin(theta)/theta',
    note: 'Since cos(theta) -> 1, squeeze forces L = 1.',
  },
];

export default function AlgebraicSqueezeWalkthrough() {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];

  const progress = useMemo(() => ((idx + 1) / STEPS.length) * 100, [idx]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Guided Algebraic Squeeze</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Click through each algebra move from geometry inequality to lim sin(theta)/theta = 1.
      </p>

      <div className="mb-4">
        <div className="h-2 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${progress}%`, transition: 'width 250ms ease' }} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 mb-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Action</p>
        <p className="font-semibold mb-3">{step.action}</p>

        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Inequality</p>
        <p className="font-mono text-sm sm:text-base text-slate-800 dark:text-slate-100 mb-3">{step.equation}</p>

        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Why this move?</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{step.note}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setIdx((v) => Math.max(0, v - 1))}
          className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-800 text-sm"
          disabled={idx === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setIdx((v) => Math.min(STEPS.length - 1, v + 1))}
          className="px-3 py-1.5 rounded bg-brand-500 text-white text-sm"
          disabled={idx === STEPS.length - 1}
        >
          Next algebra move
        </button>
      </div>
    </div>
  );
}
