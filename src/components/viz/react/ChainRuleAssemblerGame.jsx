import React, { useMemo, useState } from 'react';

const ROUNDS = [
  {
    prompt: '(3x^2 - 1)^5',
    outer: '5(3x^2 - 1)^4',
    inner: '6x',
    answer: '30x(3x^2 - 1)^4',
  },
  {
    prompt: 'sin(4x^3)',
    outer: 'cos(4x^3)',
    inner: '12x^2',
    answer: '12x^2 cos(4x^3)',
  },
  {
    prompt: 'sqrt(x^2 + 9)',
    outer: '1/(2 sqrt(x^2 + 9))',
    inner: '2x',
    answer: 'x/sqrt(x^2 + 9)',
  },
];

export default function ChainRuleAssemblerGame() {
  const [index, setIndex] = useState(0);
  const [outerPick, setOuterPick] = useState('');
  const [innerPick, setInnerPick] = useState('');
  const [result, setResult] = useState('');
  const [score, setScore] = useState(0);

  const round = ROUNDS[index];

  const outerOptions = useMemo(() => {
    return [round.outer, '5x^4', 'cos(x)', '1/(2x)', 'x^2 + 9'];
  }, [round]);

  const innerOptions = useMemo(() => {
    return [round.inner, '1', 'x', '2x + 9', '0'];
  }, [round]);

  function checkRound() {
    if (!outerPick || !innerPick) {
      setResult('Choose both pieces first.');
      return;
    }

    if (outerPick === round.outer && innerPick === round.inner) {
      setScore((s) => s + 1);
      setResult(`Correct. Final derivative: ${round.answer}`);
    } else {
      setResult('Not quite. Re-scan: differentiate outside first, then multiply by derivative of inside.');
    }
  }

  function nextRound() {
    setIndex((i) => (i + 1) % ROUNDS.length);
    setOuterPick('');
    setInnerPick('');
    setResult('');
  }

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-2">Chain Rule Assembler Game</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        Build derivatives by assembling two gears: outside derivative and inside derivative.
      </p>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 mb-4">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Current mission</p>
        <p className="font-mono text-base">d/dx [{round.prompt}]</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 text-sm">
        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold mb-2">Intuition gear</p>
          <p>Pick the outer shell derivative while keeping the inside untouched.</p>
          <select value={outerPick} onChange={(e) => setOuterPick(e.target.value)} className="w-full mt-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1">
            <option value="">Choose outer derivative</option>
            {outerOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-3">
          <p className="font-semibold mb-2">Math gear</p>
          <p>Pick derivative of the inside function only.</p>
          <select value={innerPick} onChange={(e) => setInnerPick(e.target.value)} className="w-full mt-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1">
            <option value="">Choose inner derivative</option>
            {innerOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="rounded border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="font-semibold mb-2">Rigor check</p>
          <p className="font-mono">dy/dx = (outer) * (inner)</p>
          <p className="mt-1">Score: {score}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={checkRound} className="px-3 py-1.5 rounded bg-brand-500 text-white text-sm">Check build</button>
        <button onClick={nextRound} className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-sm">Next mission</button>
        {result && <span className="text-sm text-slate-700 dark:text-slate-300">{result}</span>}
      </div>
    </div>
  );
}
