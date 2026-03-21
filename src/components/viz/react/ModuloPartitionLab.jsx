import React, { useState } from 'react';

export default function ModuloPartitionLab() {
  const [modValue, setModValue] = useState(3);
  
  // Elements 0 to 11
  const elements = Array.from({length: 12}, (_, i) => i);

  // Group elements strictly by their remainder (x % modValue)
  const partitions = [];
  for (let m = 0; m < modValue; m++) {
    partitions.push({
      mod: m,
      items: elements.filter(x => x % modValue === m)
    });
  }

  // Predefined colors for beautiful mapping
  const colors = [
    'bg-brand-500 border-brand-400',
    'bg-emerald-500 border-emerald-400',
    'bg-amber-500 border-amber-400',
    'bg-purple-500 border-purple-400',
    'bg-pink-500 border-pink-400',
    'bg-sky-500 border-sky-400',
  ]

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1">Equivalence Classes (Splitting the Universe)</h3>
        <p className="text-slate-400 text-sm">{"Relation rule: $a \\equiv b \\pmod{N}$. Notice how every number gets placed perfectly into exactly one mutually-exclusive bucket!"}</p>
      </div>

      <div className="flex flex-col items-center mb-8 bg-slate-800 p-4 rounded-lg border border-slate-600 max-w-sm mx-auto">
         <span className="text-white font-bold text-sm mb-2">Set the Modulo (N): {modValue}</span>
         <input 
            type="range" min="2" max="6" 
            value={modValue} onChange={e => setModValue(Number(e.target.value))} 
            className="w-full accent-amber-500" 
         />
      </div>

      {/* The Raw Universe Line */}
      <div className="mb-8">
         <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 text-center">The Raw Unsorted Set</h4>
         <div className="flex flex-wrap justify-center gap-2">
            {elements.map(x => (
              <div key={`raw-${x}`} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-slate-300 font-mono text-sm shadow-inner transition-all duration-300">
                 {x}
              </div>
            ))}
         </div>
      </div>

      <div className="h-4 border-l-2 border-dashed border-slate-600 mx-auto w-1 mb-4 opacity-50"></div>
      <div className="text-center text-xs text-amber-500 font-bold mb-4 uppercase tracking-widest animate-pulse">Running Equivalence Partition...</div>
      <div className="h-4 border-l-2 border-dashed border-slate-600 mx-auto w-1 mb-8 opacity-50"></div>

      {/* The Equivalence Classes / Buckets */}
      <div className="flex flex-wrap justify-center gap-6">
         {partitions.map((partition, idx) => (
            <div key={`bucket-${idx}`} className="flex flex-col items-center bg-slate-950 p-4 rounded-xl border-t-4 shadow-xl min-w-[120px]" style={{ borderTopColor: colors[idx].split('-')[1] }}>
               <h5 className="text-white font-bold text-sm mb-1 px-4 border-b border-slate-800 pb-2">Class [ {partition.mod} ]</h5>
               <span className="text-[10px] text-slate-500 mb-4 font-mono">Elements where x % {modValue} = {partition.mod}</span>
               
               <div className="flex flex-col gap-2 w-full items-center">
                  {partition.items.map(x => (
                    <div key={`sorted-${x}`} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-white font-bold font-mono text-lg shadow-[0_0_10px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform ${colors[idx]}`}>
                       {x}
                    </div>
                  ))}
               </div>
            </div>
         ))}
      </div>

      <div className="mt-10 max-w-lg mx-auto text-center text-sm font-medium text-slate-400">
         An Equivalence Relation guarantees that no number is ever left behind, and no number is ever shoved into two different buckets at the same time. The math perfectly <strong className="text-amber-400">Partitions</strong> the universe!
      </div>
    </div>
  );
}
