import React, { useState } from 'react';

// Blind chain rule: given only a table of values for f and g,
// compute (f∘g)'(x) = f'(g(x)) · g'(x)
const TABLE = {
  // x → [g(x), g'(x), f(g(x)) approx from f table, f'(g(x))]
  1: { gx: 2, gpx: 3, fgx: 5, fpgx: -1 },
  2: { gx: 4, gpx: 1, fgx: 3, fpgx:  2 },
  3: { gx: 1, gpx: -2, fgx: 7, fpgx: 4 },
  4: { gx: 3, gpx: 2, fgx: 6, fpgx: -3 },
};

const PROBLEMS = [
  { x: 2, question: '(f∘g)\'(2)', answer: TABLE[2].fpgx * TABLE[2].gpx },
  { x: 3, question: '(f∘g)\'(3)', answer: TABLE[3].fpgx * TABLE[3].gpx },
  { x: 1, question: '(f∘g)\'(1)', answer: TABLE[1].fpgx * TABLE[1].gpx },
];

export default function BlindChainRuleLab() {
  const [pi, setPi] = useState(0);
  const [step, setStep] = useState(0);
  const [userAns, setUserAns] = useState('');
  const [checked, setChecked] = useState(false);

  const prob = PROBLEMS[pi];
  const t = TABLE[prob.x];

  function nextProblem() {
    setPi((pi+1)%PROBLEMS.length);
    setStep(0); setUserAns(''); setChecked(false);
  }

  const correct = parseFloat(userAns) === prob.answer;

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Blind Chain Rule Lab</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        No formulas — only a table of values. Use the chain rule: (f∘g)'(x) = f'(g(x)) · g'(x).
      </p>

      {/* Table */}
      <div className="overflow-x-auto mb-4">
        <table className="mx-auto text-sm border-collapse font-mono">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="px-3 py-1.5 border border-slate-200 dark:border-slate-700">x</th>
              <th className="px-3 py-1.5 border border-slate-200 dark:border-slate-700">g(x)</th>
              <th className="px-3 py-1.5 border border-slate-200 dark:border-slate-700">g'(x)</th>
              <th className="px-3 py-1.5 border border-slate-200 dark:border-slate-700">f(g(x))</th>
              <th className="px-3 py-1.5 border border-slate-200 dark:border-slate-700">f'(g(x))</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(TABLE).map(([x, row]) => (
              <tr key={x} className={parseInt(x)===prob.x?'bg-amber-50 dark:bg-amber-950/30':''}>
                <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 text-center font-bold">{x}</td>
                <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 text-center">{row.gx}</td>
                <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 text-center">{row.gpx}</td>
                <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 text-center">{row.fgx}</td>
                <td className="px-3 py-1 border border-slate-200 dark:border-slate-700 text-center">{row.fpgx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
        <p className="font-semibold text-violet-600 dark:text-violet-400 mb-2">Find: {prob.question}</p>

        {step === 0 && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Step 1: Find g({prob.x}) from the table.</p>
            <p className="font-mono text-sm bg-slate-100 dark:bg-slate-800 rounded px-2 py-1">g({prob.x}) = {t.gx}</p>
            <button onClick={()=>setStep(1)} className="mt-2 px-3 py-1.5 rounded text-sm bg-violet-600 text-white">Continue →</button>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Step 2: Find f'(g({prob.x})) = f'({t.gx}) from the table.</p>
            <p className="font-mono text-sm bg-slate-100 dark:bg-slate-800 rounded px-2 py-1">f'({t.gx}) = {t.fpgx}</p>
            <button onClick={()=>setStep(2)} className="mt-2 px-3 py-1.5 rounded text-sm bg-violet-600 text-white">Continue →</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Step 3: Find g'({prob.x}) from the table.</p>
            <p className="font-mono text-sm bg-slate-100 dark:bg-slate-800 rounded px-2 py-1">g'({prob.x}) = {t.gpx}</p>
            <button onClick={()=>setStep(3)} className="mt-2 px-3 py-1.5 rounded text-sm bg-violet-600 text-white">Continue →</button>
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Step 4: Multiply — f'(g(x)) · g'(x) = {t.fpgx} × {t.gpx} = ?</p>
            <div className="flex gap-2 items-center">
              <input type="number" value={userAns} onChange={e=>{setUserAns(e.target.value);setChecked(false);}}
                className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 w-20 font-mono text-sm bg-white dark:bg-slate-900"
                placeholder="?" />
              <button onClick={()=>setChecked(true)} className="px-3 py-1 rounded text-sm bg-violet-600 text-white">Check</button>
            </div>
            {checked && (
              <div className={`mt-2 text-sm font-semibold ${correct?'text-emerald-600':'text-red-600'}`}>
                {correct ? `✓ Correct! (f∘g)'(${prob.x}) = ${prob.answer}` : `✗ Try again. Hint: ${t.fpgx} × ${t.gpx}`}
              </div>
            )}
            {checked && correct && (
              <button onClick={nextProblem} className="mt-2 px-3 py-1.5 rounded text-sm bg-emerald-600 text-white">Next problem →</button>
            )}
          </div>
        )}
      </div>

      <div className="font-mono text-xs text-center text-slate-400">
        (f∘g)'(x) = f'(g(x)) · g'(x)
      </div>
    </div>
  );
}
