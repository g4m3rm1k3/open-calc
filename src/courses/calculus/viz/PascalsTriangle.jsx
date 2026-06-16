import React, { useState, useMemo } from 'react';

export default function PascalsTriangle() {
  const [n, setN] = useState(4);
  const maxRows = 7; // Up to Power 6

  const triangle = useMemo(() => {
    const rows = [[1]];
    for (let i = 1; i < maxRows; i++) {
      const prev = rows[i - 1];
      const curr = [1];
      for (let j = 1; j < prev.length; j++) {
        curr.push(prev[j - 1] + prev[j]);
      }
      curr.push(1);
      rows.push(curr);
    }
    return rows;
  }, [maxRows]);

  const coefficients = triangle[n];

  // Generate polynomial expansion
  const generateExpansion = () => {
    if (n === 0) return "1";
    let terms = [];
    for (let k = 0; k <= n; k++) {
      let coef = coefficients[k] === 1 ? "" : coefficients[k];
      let pX = n - k;
      let pH = k;

      let termX = pX === 0 ? "" : pX === 1 ? "x" : `x^${pX}`;
      let termH = pH === 0 ? "" : pH === 1 ? "h" : `h^${pH}`;

      let term = `${coef}${termX}${termH}`;
      // Special case: if coef is 1 and both x and h are 0 power, which only happens if n=0.
      if (term === "") term = "1";
      terms.push(term);
    }
    return terms.join(" + ");
  };

  return (
    <div className="flex flex-col items-center w-full p-6 text-slate-800 dark:text-slate-200">
      
      <div className="mb-4 text-center">
        <h3 className="font-bold text-lg">Pascal's Triangle</h3>
        <p className="text-sm text-slate-500">Row index <span className="font-bold">n</span> corresponds to the power of expansion.</p>
      </div>

      <div className="w-full overflow-x-auto pb-4 flex justify-center">
        <div className="flex flex-col items-center">
          {triangle.map((row, rowIndex) => (
            <div 
               key={rowIndex} 
               className={`flex gap-2 sm:gap-4 mb-2 transition-all duration-300 ${rowIndex === n ? 'scale-110' : 'opacity-50'}`}
             >
              <div className="w-8 text-right mr-4 text-sm font-bold opacity-30 select-none hidden sm:block">n={rowIndex}</div>
              {row.map((val, cellIndex) => {
                let isCritical = false;
                if (rowIndex === n) {
                   if (cellIndex === 1) isCritical = true; // The 'n' term
                }
                return (
                  <div 
                    key={cellIndex} 
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold text-sm sm:text-base border shadow-sm transition-colors duration-500
                      ${rowIndex === n 
                         ? isCritical 
                            ? 'bg-brand-500 text-white border-brand-600 scale-110 z-10 shadow-md' 
                            : 'bg-white dark:bg-slate-800 border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300' 
                         : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                  >
                    {val}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl mt-4">
         <label className="flex items-center justify-between mb-4">
          <span className="font-bold text-slate-700 dark:text-slate-300">Set Power: n = {n}</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max={maxRows - 1} 
          step="1" 
          value={n} 
          onChange={(e) => setN(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
      </div>

      <div className="w-full max-w-2xl mt-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner">
        <div className="text-center font-serif text-lg sm:text-xl md:text-2xl overflow-x-auto whitespace-nowrap py-2">
            (x + h)<sup>{n}</sup> = {generateExpansion()}
        </div>
        <div className="mt-4 p-4 bg-brand-50 dark:bg-brand-900/20 text-sm text-brand-900 dark:text-brand-100 border-l-4 border-brand-500 rounded-r-lg">
          <p>
            Notice the second term in the expansion. The coefficient is always exactly <b>{n}</b>, 
            making the term <b>{n}x^{n === 0 ? '' : n === 1 ? '0' : n-1}h</b>. 
          </p>
          <p className="mt-2 text-xs opacity-80">
            For calculus, this is the most important term! When evaluating a derivative limit 
            where h → 0, every other term containing h² or higher will vanish to zero!
          </p>
        </div>
      </div>

    </div>
  );
}
