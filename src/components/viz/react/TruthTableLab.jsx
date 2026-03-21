import React, { useState, useMemo } from 'react';

const MAX_VARS = 4;
const VAR_NAMES = ['P', 'Q', 'R', 'S', 'A', 'B', 'C']; // Fallbacks if we expand

function evaluateExpression(expr, rowObj) {
  if (!expr || !expr.trim()) return '';
  
  // Safely translate logic syntax into valid JS syntax for evaluation
  let js = expr.toUpperCase()
    .replace(/\bNOT\b/g, '!')
    .replace(/~/g, '!')
    .replace(/\bAND\b/g, '&')
    .replace(/\bOR\b/g, '|')
    .replace(/\bIFF\b/g, '=')
    .replace(/<->/g, '=')
    .replace(/\bIMPLIES\b/g, '>')
    .replace(/->/g, '>')
    // Now reliably map simplified single-characters to JS operators
    .replace(/&&?/g, ' && ')
    .replace(/\|\|?/g, ' || ')
    .replace(/===?/g, ' === ')
    .replace(/>/g, ' <= '); // Brilliant mapping: False <= True (T), True <= False (F)!

  // Inject Truth/False literals
  const keys = [...Object.keys(rowObj), 'T', 'F', 'TRUE', 'FALSE'];
  const vals = [...Object.values(rowObj), true, false, true, false];

  try {
    // Generate an isolated safe execution function
    const fn = new Function(...keys, `return !!(${js});`);
    const result = fn(...vals);
    // Explicit return casting so bugs don't return 'undefined' truthy things
    return result ? 'T' : 'F';
  } catch (e) {
    return 'Err';
  }
}

export default function TruthTableLab() {
  const [numVars, setNumVars] = useState(2);
  const [statements, setStatements] = useState([
    { id: 1, text: 'P and Q' },
    { id: 2, text: '~P' },
    { id: 3, text: '(P and Q) -> ~P' },
  ]);

  const activeVars = VAR_NAMES.slice(0, numVars);
  const numRows = Math.pow(2, numVars);

  const rows = useMemo(() => {
    const table = [];
    for (let i = 0; i < numRows; i++) {
      const row = {};
      // Standard mathematical T/F ordering (Counts downwards in binary)
      const binIndex = numRows - 1 - i; 
      for (let v = 0; v < numVars; v++) {
        row[activeVars[v]] = Boolean((binIndex >> (numVars - 1 - v)) & 1);
      }
      table.push(row);
    }
    return table;
  }, [numVars]);

  const updateStatement = (id, newText) => {
    setStatements(statements.map(s => s.id === id ? { ...s, text: newText } : s));
  };

  const addStatement = () => {
    if (statements.length >= 7) return;
    setStatements([...statements, { id: Date.now(), text: '' }]);
  };

  const removeStatement = (id) => {
    setStatements(statements.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      
      <div className="mb-6 text-center">
        <h3 className="font-bold text-xl text-brand-600 dark:text-brand-400">Dynamic Truth Table Constructor</h3>
        <p className="text-sm text-slate-500 mt-1">Build up to 7 compound statements. Parentheses are recommended to be safe!</p>
        <p className="text-xs text-slate-400 mt-1">Order of Operations: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">NOT</code> happens first, then <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">AND / OR</code>, then <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">-&gt; / &lt;-&gt;</code></p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-sm">Base Variables:</label>
          <div className="flex bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 overflow-hidden">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setNumVars(n)}
                className={`px-3 py-1 text-sm font-bold transition-colors ${numVars === n ? 'bg-brand-500 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">({numRows} rows)</span>
        </div>

        <button 
          onClick={addStatement}
          disabled={statements.length >= 7}
          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded transition-colors"
        >
          + Add Statement
        </button>
      </div>

      {/* Expressions Map */}
      <div className="grid gap-2 mb-6">
        {statements.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="w-8 text-center text-xs font-bold text-slate-400 dark:text-slate-500">S{idx + 1}</span>
            <input 
              type="text" 
              value={s.text}
              onChange={(e) => updateStatement(s.id, e.target.value)}
              placeholder="(P or Q) -> R"
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-brand-500"
            />
            <button 
              onClick={() => removeStatement(s.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      {/* The Actual Truth Table */}
      <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
        <table className="w-full text-sm font-mono border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
              {activeVars.map(v => (
                <th key={v} className="p-2 border-r border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-bold">{v}</th>
              ))}
              {statements.map((s, idx) => (
                <th key={s.id} className="p-2 border-r border-slate-300 dark:border-slate-700 text-brand-700 dark:text-brand-400 last:border-0 truncate max-w-[150px]" title={s.text}>
                  {s.text.trim() || `S${idx+1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {activeVars.map(v => (
                  <td key={v} className={`p-2 border-r border-slate-200 dark:border-slate-800 text-center font-bold ${row[v] ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
                    {row[v] ? 'T' : 'F'}
                  </td>
                ))}
                {statements.map(s => {
                  const val = evaluateExpression(s.text, row);
                  let colorClass = 'text-slate-800 dark:text-slate-200';
                  if (val === 'T') colorClass = 'text-emerald-600 dark:text-emerald-400 font-bold';
                  if (val === 'F') colorClass = 'text-slate-400 dark:text-slate-500 font-bold opacity-80';
                  if (val === 'Err') colorClass = 'text-red-500 font-bold bg-red-50 dark:bg-red-900/20';

                  return (
                    <td key={s.id} className={`p-2 border-r border-slate-200 dark:border-slate-800 text-center last:border-0 ${colorClass}`}>
                      {val}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
