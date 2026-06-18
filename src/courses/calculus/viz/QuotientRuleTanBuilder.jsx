import React, { useMemo, useState } from 'react';

const STEPS = [
  {
    title: 'Rewrite tangent as a quotient',
    expr: 'tan(x) = sin(x)/cos(x)',
    note: 'Now we can apply one universal template.',
  },
  {
    title: 'Apply quotient rule template',
    expr: '(u/v)\' = (u\'v - uv\')/v^2 with u = sin(x), v = cos(x)',
    note: 'This is low d high minus high d low over low squared.',
  },
  {
    title: 'Substitute trig derivatives',
    expr: 'd/dx[tan(x)] = (cos(x)cos(x) - sin(x)(-sin(x)))/cos^2(x)',
    note: 'Because d/dx[sin x] = cos x and d/dx[cos x] = -sin x.',
  },
  {
    title: 'Collect terms',
    expr: '(cos^2(x) + sin^2(x))/cos^2(x)',
    note: 'The minus times minus creates a plus.',
  },
  {
    title: 'Identity unlock',
    expr: '1/cos^2(x) = sec^2(x)',
    note: 'Pythagorean identity turns the numerator into exactly 1.',
  },
];

export default function QuotientRuleTanBuilder() {
  const [step, setStep] = useState(0);
  const active = STEPS[step];
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Quotient Rule Lab: Build d/dx[tan x]</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Step through the derivation and watch where the magic simplification appears.
      </p>

      <div className="mb-4 h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full bg-brand-500" style={{ width: `${progress}%`, transition: 'width 220ms ease' }} />
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 mb-3">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Step {step + 1}</p>
        <p className="font-semibold mb-3">{active.title}</p>
        <p className="font-mono text-sm sm:text-base mb-3">{active.expr}</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{active.note}</p>
      </div>

      {step >= 3 && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3 mb-3">
          <p className="text-sm font-semibold mb-1">Identity spotlight</p>
          <p className="font-mono text-base">cos^2(x) + sin^2(x) = <span className="text-amber-700 dark:text-amber-300 font-bold">1</span></p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStep((v) => Math.max(0, v - 1))}
          className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-800 text-sm"
          disabled={step === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))}
          className="px-3 py-1.5 rounded bg-brand-500 text-white text-sm"
          disabled={step === STEPS.length - 1}
        >
          Apply next move
        </button>
        <button
          onClick={() => setStep(0)}
          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
