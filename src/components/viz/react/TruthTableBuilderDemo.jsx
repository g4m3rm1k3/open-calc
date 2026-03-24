import React, { useState, useMemo } from 'react';

export default function TruthTableBuilder({ params = {} }) {
  const { guidedMode = true } = params;

  const [exprInput, setExprInput] = useState('p → q');
  const [variables] = useState(['p', 'q']); // easy start; can be extended later

  // Simple expression evaluator (expandable later with a real parser)
  const evaluate = (assignment, expression) => {
    const p = assignment.p;
    const q = assignment.q || false;

    if (expression.includes('→') || expression.includes('->') || expression.includes('implies')) {
      return !p || q; // implication: false only when p true and q false
    }
    if (expression.includes('∧') || expression.includes('&&') || expression.includes('and')) {
      return p && q;
    }
    if (expression.includes('∨') || expression.includes('||') || expression.includes('or')) {
      return p || q;
    }
    if (expression.includes('¬') || expression.includes('!') || expression.includes('not')) {
      return !p;
    }
    if (expression.includes('↔') || expression.includes('<->')) {
      return p === q;
    }
    return true; // fallback
  };

  const rows = useMemo(() => {
    const total = 1 << variables.length;
    return Array.from({ length: total }, (_, i) => {
      const assignment = {};
      variables.forEach((v, idx) => {
        assignment[v] = !!(i & (1 << idx));
      });
      return { assignment, result: evaluate(assignment, exprInput) };
    });
  }, [variables, exprInput]);

  const isImplication = exprInput.includes('→') || exprInput.includes('->');
  const isDeMorgan = exprInput.includes('¬(p ∧ q)') || exprInput.includes('! (p && q)');
  const hasConverse = exprInput.includes('q → p');

  // Auto insight detection
  const insight = useMemo(() => {
    if (isImplication) {
      const falseRows = rows.filter(r => !r.result);
      if (falseRows.length === 1) {
        return "Notice: The implication is false in ONLY ONE case — when the premise (p) is true but the conclusion (q) is false. In all other cases (including when p is false) the statement is considered TRUE. This is called 'vacuous truth' and it often surprises students.";
      }
    }
    if (isDeMorgan) {
      return "These two expressions always have identical truth columns — they are logically equivalent (De Morgan’s Law). This equivalence is extremely useful in proofs and in writing cleaner code.";
    }
    if (hasConverse) {
      return "p → q and q → p are NOT the same! Compare their truth columns. The converse does not logically follow from the original statement.";
    }
    return null;
  }, [rows, isImplication, isDeMorgan, hasConverse]);

  const presets = [
    { label: 'Implication: p → q', expr: 'p → q' },
    { label: 'And: p ∧ q', expr: 'p ∧ q' },
    { label: 'De Morgan: ¬(p ∧ q)', expr: '¬(p ∧ q)' },
    { label: 'Converse check: p → q vs q → p', expr: 'p → q and q → p (compare separately)' },
    { label: 'Biconditional: p ↔ q', expr: 'p ↔ q' },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
      {/* Instructions Panel */}
      <div className="mb-6 p-5 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-600 rounded-2xl">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
          👩‍🏫 How to Use This Explorer
        </h4>
        <ol className="text-sm space-y-2 list-decimal pl-5 text-slate-700 dark:text-slate-200">
          <li>Click one of the preset buttons below or type your own expression (use → or -&gt; for implication, ∧ or && for and, ¬ or ! for not).</li>
          <li>Watch the truth table update instantly for every possible combination of truth values.</li>
          <li>Green rows = the whole statement is true. Red rows = false.</li>
          <li>Pay special attention to the highlighted insight box that appears when something important happens.</li>
        </ol>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Tip: Start with the implication preset — many students are surprised by when “If… then…” is actually true.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {presets.map((preset, i) => (
          <button
            key={i}
            onClick={() => setExprInput(preset.expr)}
            className="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-orange-400 rounded-2xl transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Expression input */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Current Expression</label>
        <input
          type="text"
          value={exprInput}
          onChange={(e) => setExprInput(e.target.value)}
          className="w-full font-mono text-lg p-4 border border-slate-300 dark:border-slate-600 rounded-2xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-orange-400"
        />
      </div>

      {/* Truth Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[420px]">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              {variables.map(v => (
                <th key={v} className="border p-3 font-mono text-center">{v}</th>
              ))}
              <th className="border p-3 font-semibold text-center">{exprInput}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={row.result 
                  ? 'bg-green-50 dark:bg-emerald-950/30' 
                  : 'bg-red-50 dark:bg-red-950/30'
                }
              >
                {variables.map(v => (
                  <td key={v} className="border p-3 text-center font-mono">
                    {row.assignment[v] ? 'T' : 'F'}
                  </td>
                ))}
                <td className="border p-3 text-center font-bold text-base">
                  {row.result ? 'T' : 'F'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Professor / Insight Box */}
      {insight && (
        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-3xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl mt-1">👨‍🏫</div>
            <div>
              <div className="uppercase tracking-widest text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
                Professor’s Insight
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                {insight}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 text-xs text-center text-slate-400 dark:text-slate-500">
        Experiment freely. The more you play with different expressions, the more the logic starts to feel natural.
      </div>
    </div>
  );
}