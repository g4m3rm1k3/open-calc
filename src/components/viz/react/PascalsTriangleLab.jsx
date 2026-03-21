import React, { useState } from 'react';
import { parseProse } from '../../math/parseProse.jsx';

export default function PascalsTriangleLab() {
  const [activeCell, setActiveCell] = useState(null);

  // Generate Pascal's Triangle up to 7 rows
  const numRows = 8;
  const triangle = [];
  for (let n = 0; n < numRows; n++) {
    const row = [];
    for (let k = 0; k <= n; k++) {
      if (k === 0 || k === n) {
        row.push(1);
      } else {
        row.push(triangle[n - 1][k - 1] + triangle[n - 1][k]);
      }
    }
    triangle.push(row);
  }

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">Pascal's Geometric Bridge</h3>
        <p className="text-slate-400 text-sm flex items-center justify-center gap-1">Hover over any node in the Triangle to instantly decode its raw mathematical Combination structure <strong className="text-brand-400 font-serif text-lg">{parseProse("$\\binom{n}{k}$")}</strong>.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
         
         {/* The Triangle */}
         <div className="flex flex-col items-center justify-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-inner w-full md:w-auto overflow-x-auto">
            {triangle.map((row, n) => (
               <div key={`row-${n}`} className="flex justify-center mb-2">
                  {row.map((val, k) => {
                     const isHovered = activeCell && activeCell.n === n && activeCell.k === k;
                     // Highlight parents if hovered
                     const isLeftParent = activeCell && activeCell.n === n + 1 && activeCell.k === k + 1;
                     const isRightParent = activeCell && activeCell.n === n + 1 && activeCell.k === k;

                     return (
                       <div 
                         key={`cell-${n}-${k}`}
                         onMouseEnter={() => setActiveCell({n, k, val})}
                         onMouseLeave={() => setActiveCell(null)}
                         className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center mx-1 rounded-full font-bold cursor-pointer transition-all duration-300
                            ${isHovered ? 'bg-amber-500 text-amber-950 scale-125 shadow-[0_0_15px_#fbbf24] z-10' : 
                              isLeftParent || isRightParent ? 'bg-brand-600 text-white scale-110 shadow-[0_0_10px_#2563eb]' : 
                              'bg-slate-800 text-slate-300 hover:bg-slate-700'}
                         `}
                       >
                         {val}
                       </div>
                     );
                  })}
               </div>
            ))}
         </div>

         {/* The Decoding Panel */}
         <div className="w-full max-w-sm h-48 bg-slate-800 border-2 border-slate-600 rounded-xl p-5 flex flex-col justify-center items-center text-center shadow-md">
            {activeCell ? (
               <div className="animate-fade-in flex flex-col items-center">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Row {activeCell.n}, Position {activeCell.k}</div>
                  
                  <div className="flex items-center justify-center gap-4 text-3xl font-serif text-white mb-2">
                     <span className="text-brand-300">
                        {`C(${activeCell.n}, ${activeCell.k})`}
                     </span>
                     <span>=</span>
                     <span className="flex flex-col items-center justify-center px-1">
                        <span className="text-lg leading-none border-b border-amber-500 w-8 text-center">{activeCell.n}</span>
                        <span className="text-lg leading-none w-8 text-center">{activeCell.k}</span>
                     </span>
                     <span>=</span>
                     <span className="text-amber-400 font-bold text-4xl">{activeCell.val}</span>
                  </div>

                  {activeCell.n > 0 && activeCell.k > 0 && activeCell.k < activeCell.n && (
                     <div className="text-[10px] text-slate-300 mt-2 bg-slate-900 px-3 py-1 rounded border border-slate-700">
                        Notice the exact structural addition: <strong className="text-brand-400">{triangle[activeCell.n-1][activeCell.k-1]}</strong> + <strong className="text-brand-400">{triangle[activeCell.n-1][activeCell.k]}</strong> = <strong className="text-amber-400">{activeCell.val}</strong>
                     </div>
                  )}
               </div>
            ) : (
               <div className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                  &lt; HOVER OVER A NODE &gt;
               </div>
            )}
         </div>

      </div>

      <div className="mt-6 text-center text-sm font-medium text-slate-400 max-w-2xl mx-auto">
         This triangle mathematically proves that Combinations are not just random isolated formulas! They build perfectly geometrically upon each other. <strong className="text-white">Every single node is the precise sum of the two nodes directly above it.</strong>
      </div>

    </div>
  );
}
