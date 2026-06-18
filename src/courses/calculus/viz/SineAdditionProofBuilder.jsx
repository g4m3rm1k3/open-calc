import React, { useMemo, useState } from 'react';

const STEPS = [
  {
    tag: 'Setup',
    line: "d/dx[sin x] = lim_{h->0} (sin(x+h)-sin x)/h",
    note: 'Start from the limit definition so derivative becomes a limit problem.',
  },
  {
    tag: 'Isolation',
    line: 'sin(x+h) = sin x cos h + cos x sin h',
    note: 'Apply the sine-of-a-sum identity to break x and h apart.',
  },
  {
    tag: 'Substitute',
    line: 'lim (sin x cos h + cos x sin h - sin x)/h',
    note: 'Replace sin(x+h) and keep all terms visible before grouping.',
  },
  {
    tag: 'Hunting',
    line: 'lim [sin x(cos h-1)/h + cos x(sin h/h)]',
    note: 'Factor to expose the two fundamental limit blobs.',
  },
  {
    tag: 'Pillars',
    line: 'sin x * lim[(cos h-1)/h] + cos x * lim[sin h/h]',
    note: 'Split the limit into known building blocks from trig limits.',
  },
  {
    tag: 'Result',
    line: 'sin x * 0 + cos x * 1 = cos x',
    note: 'The first pile dies, the second survives. That is why cosine appears.',
  },
];

export default function SineAdditionProofBuilder() {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx];
  const progress = useMemo(() => ((idx + 1) / STEPS.length) * 100, [idx]);

  const renderLine = (line) => {
    const colored = line
      .replace('(sin h/h)', '__SINBLOB__')
      .replace('((cos h-1)/h)', '__COSBLOB__');

    return (
      <p className="font-mono text-sm sm:text-base leading-relaxed break-words">
        {colored.split(/(__SINBLOB__|__COSBLOB__)/g).map((chunk, i) => {
          if (chunk === '__SINBLOB__') {
            return (
              <span key={i} className="px-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                (sin h/h)
              </span>
            );
          }
          if (chunk === '__COSBLOB__') {
            return (
              <span key={i} className="px-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                ((cos h-1)/h)
              </span>
            );
          }
          return <span key={i}>{chunk}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Sine-of-a-Sum Proof Builder</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Click through the proof and watch where each piece comes from. Green and gold blobs are the two fundamental limit pillars.
      </p>

      <div className="mb-4 h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-brand-500" style={{ width: `${progress}%`, transition: 'width 220ms ease' }} />
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 mb-3">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Strategy Tag</p>
        <p className="font-semibold mb-3">{step.tag}</p>
        {renderLine(step.line)}
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{step.note}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
        <div className="rounded p-2 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
          <span className="font-semibold">Green blob:</span> lim sin h / h = 1
        </div>
        <div className="rounded p-2 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <span className="font-semibold">Gold blob:</span> lim (cos h - 1) / h = 0
        </div>
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
          Apply next proof move
        </button>
        <button
          onClick={() => setIdx(0)}
          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
