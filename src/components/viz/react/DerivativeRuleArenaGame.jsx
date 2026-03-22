import React, { useState } from 'react';

const PROMPTS = [
  { expr: 'x^7', rule: 'Power Rule' },
  { expr: '(x^2+1)(x^3-2)', rule: 'Product Rule' },
  { expr: '(x^2+3)/(x-1)', rule: 'Quotient Rule' },
  { expr: '5x^4 - 3x + 1', rule: 'Sum/Constant Multiple' },
];

const RULES = ['Power Rule', 'Product Rule', 'Quotient Rule', 'Sum/Constant Multiple'];

export default function DerivativeRuleArenaGame() {
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState('');
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('Select the first rule you would apply.');

  const current = PROMPTS[index];

  function check() {
    if (!pick) return;
    if (pick === current.rule) {
      setScore((s) => s + 1);
      setMsg('Correct opening move.');
    } else {
      setMsg(`Not this one. Opening move should be: ${current.rule}.`);
    }
  }

  function next() {
    setIndex((i) => (i + 1) % PROMPTS.length);
    setPick('');
    setMsg('Select the first rule you would apply.');
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Derivative Rule Arena</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Build rule recognition speed before algebra. Pick the first legal differentiation rule for each expression.
      </p>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 mb-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Expression</p>
        <p className="font-mono text-lg">d/dx [{current.expr}]</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {RULES.map((r) => (
          <button
            key={r}
            onClick={() => setPick(r)}
            className={`px-3 py-1.5 rounded text-sm border ${pick === r ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-300 dark:border-slate-600'}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={check} className="px-3 py-1.5 rounded bg-brand-500 text-white text-sm">Check</button>
        <button onClick={next} className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm">Next</button>
        <span className="text-sm">Score: {score}</span>
        <span className="text-sm text-slate-700 dark:text-slate-300">{msg}</span>
      </div>
    </div>
  );
}
