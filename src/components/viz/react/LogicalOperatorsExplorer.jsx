import React, { useMemo, useState } from 'react';

export default function LogicalOperatorsExplorer({ params = {} }) {
  const { guided = true } = params;

  const [p, setP] = useState(true);
  const [q, setQ] = useState(true);
  const [expression, setExpression] = useState('p -> q');

  const operators = [
    { symbol: '¬', label: 'NOT', action: () => setExpression((prev) => `¬(${prev})`) },
    { symbol: '∧', label: 'AND', action: () => setExpression((prev) => `(${prev}) ∧ q`) },
    { symbol: '∨', label: 'OR', action: () => setExpression((prev) => `(${prev}) ∨ q`) },
    { symbol: '→', label: 'IF...THEN', action: () => setExpression((prev) => `(${prev}) → q`) },
    { symbol: '↔', label: 'IFF', action: () => setExpression((prev) => `(${prev}) ↔ q`) },
  ];

  const result = useMemo(() => {
    const pVal = p;
    const qVal = q;

    if (expression.includes('→')) return !pVal || qVal;
    if (expression.includes('∧')) return pVal && qVal;
    if (expression.includes('∨')) return pVal || qVal;
    if (expression.includes('¬')) return !pVal;
    if (expression.includes('↔')) return pVal === qVal;
    return true;
  }, [p, q, expression]);

  const insight = useMemo(() => {
    if (expression.includes('→')) {
      if (!p && result) return 'This is vacuous truth: when the "if" part is false, the whole implication is automatically true - the promise was never tested.';
      if (p && !q) return 'Implication is FALSE only in this single case: premise true but conclusion false.';
    }
    if (expression.includes('¬(') && expression.includes('∧')) {
      return '¬(p ∧ q) is always the same as ¬p ∨ ¬q (De Morgan\'s Law). Try building both to compare.';
    }
    return null;
  }, [expression, p, q, result]);

  const reset = () => {
    setExpression('p -> q');
    setP(true);
    setQ(true);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6">
      {guided && (
        <div className="mb-6 p-5 bg-blue-50 dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-slate-600">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3">Step-by-Step Instructions</h4>
          <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-200 list-decimal pl-5">
            <li>Click operator buttons to build your expression.</li>
            <li>Toggle truth values of p and q below.</li>
            <li>Watch the result update instantly.</li>
            <li>Read the tutor insight when key patterns appear.</li>
          </ol>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        {operators.map((op) => (
          <button
            key={op.symbol}
            onClick={op.action}
            className="flex-1 min-w-[110px] py-4 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:border-orange-500 rounded-2xl font-mono text-xl font-semibold transition-colors"
          >
            {op.symbol}
            <br />
            <span className="text-xs font-normal text-slate-500">{op.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-mono text-2xl text-center border border-slate-300 dark:border-slate-600">
        {expression}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm mb-2 text-slate-500">p (premise)</label>
          <button
            onClick={() => setP(!p)}
            className={`w-full py-6 text-3xl font-bold rounded-2xl transition-all ${
              p ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}
          >
            {p ? 'TRUE' : 'FALSE'}
          </button>
        </div>
        <div>
          <label className="block text-sm mb-2 text-slate-500">q (conclusion)</label>
          <button
            onClick={() => setQ(!q)}
            className={`w-full py-6 text-3xl font-bold rounded-2xl transition-all ${
              q ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
            }`}
          >
            {q ? 'TRUE' : 'FALSE'}
          </button>
        </div>
      </div>

      <div
        className={`p-8 rounded-3xl text-center text-4xl font-bold mb-8 ${
          result ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700' : 'bg-red-100 dark:bg-red-900 text-red-700'
        }`}
      >
        RESULT: {result ? 'TRUE' : 'FALSE'}
      </div>

      {insight && (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-3xl">
          <div className="flex items-start gap-4">
            <span className="text-2xl">Insight</span>
            <div className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">{insight}</div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={reset}
          className="px-8 py-3 border border-slate-300 dark:border-slate-600 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Reset to p -&gt; q
        </button>
      </div>

      <div className="mt-10 text-xs text-center text-slate-400">
        Build more complex expressions by clicking operators repeatedly.
      </div>
    </div>
  );
}
