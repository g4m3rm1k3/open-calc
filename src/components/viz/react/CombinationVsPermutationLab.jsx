import React, { useState } from 'react';
import { parseProse } from '../../math/parseProse.jsx';

export default function CombinationVsPermutationLab() {
  const [mode, setMode] = useState('perm'); // 'perm' or 'comb'

  // We are choosing 3 elements from {A, B, C, D}
  const elements = ['A', 'B', 'C', 'D'];
  
  // Hardcoded the 24 Permutations grouped by their Combination set
  const groups = [
    { comb: 'A B C', perms: ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'] },
    { comb: 'A B D', perms: ['ABD', 'ADB', 'BAD', 'BDA', 'DAB', 'DBA'] },
    { comb: 'A C D', perms: ['ACD', 'ADC', 'CAD', 'CDA', 'DAC', 'DCA'] },
    { comb: 'B C D', perms: ['BCD', 'BDC', 'CBD', 'CDB', 'DBC', 'DCB'] }
  ];

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-8">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">The Overcount Compression Engine</h3>
        <p className="text-slate-400 text-sm">Choosing 3 items out of {"\\{A, B, C, D\\}"}. Notice how <strong className="text-white">Combinations</strong> physically crush 6 unique ordered permutations into a single consolidated group by using mathematical division!</p>
      </div>

      <div className="flex justify-center mb-8 gap-4 bg-slate-950 p-2 rounded-lg max-w-sm mx-auto border border-slate-800">
         <button 
           onClick={() => setMode('perm')}
           className={`flex-1 py-2 rounded font-bold text-xs uppercase tracking-wide transition-all ${mode === 'perm' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
         >
           {parseProse("Permutation $P(4,3)$")}<br/><span className="text-[9px] opacity-70">Order Matters!</span>
         </button>
         <button 
           onClick={() => setMode('comb')}
           className={`flex-1 py-2 rounded font-bold text-xs uppercase tracking-wide transition-all ${mode === 'comb' ? 'bg-amber-600 text-amber-950 shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
         >
           {parseProse("Combination $C(4,3)$")}<br/><span className="text-[9px] opacity-70">Order Erased</span>
         </button>
      </div>

      {/* The Math Formula */}
      <div className="text-center mb-6">
         {mode === 'perm' ? (
            <div className="text-brand-300 font-serif text-2xl animate-fade-in flex items-center justify-center gap-2">
               {parseProse("$P(4,3) = \\frac{4!}{(4-3)!} = 24$ total ordered chains")}
            </div>
         ) : (
            <div className="text-amber-300 font-serif text-2xl animate-fade-in flex items-center justify-center gap-2">
               {parseProse("$C(4,3) = \\frac{24}{3!} = 4$ unique unordered sets")}
            </div>
         )}
      </div>

      {/* The Visualizer */}
      <div className="flex flex-wrap gap-4 justify-center p-4 bg-slate-950 rounded border-2 border-slate-800 min-h-[300px]">
         {groups.map((group, gIdx) => (
            <div key={gIdx} className={`relative flex flex-col gap-2 p-3 rounded-lg border-2 transition-all duration-700 ease-in-out w-full max-w-[140px]
               ${mode === 'comb' ? 'bg-amber-900/40 border-amber-500 scale-100' : 'bg-transparent border-slate-700'}`}
            >
               {mode === 'comb' && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm bg-amber-950/50 rounded-lg animate-fade-in">
                     <span className="font-bold text-2xl tracking-widest text-amber-300 bg-amber-900 border border-amber-500 px-3 py-2 rounded shadow-2xl">
                        {"{" + group.comb.replace(/ /g, ',') + "}"}
                     </span>
                  </div>
               )}
               
               {group.perms.map((p, pIdx) => (
                  <div key={pIdx} className={`flex justify-center gap-1 font-mono font-bold transition-all duration-500
                     ${mode === 'comb' ? 'opacity-20 scale-95 blur-sm' : 'opacity-100 scale-100 hover:scale-110'}
                  `}>
                     <span className={`w-8 h-8 rounded flex items-center justify-center border-2 border-brand-500 bg-brand-900 text-brand-300`}>{p[0]}</span>
                     <span className={`w-8 h-8 rounded flex items-center justify-center border-2 border-emerald-500 bg-emerald-900 text-emerald-300`}>{p[1]}</span>
                     <span className={`w-8 h-8 rounded flex items-center justify-center border-2 border-purple-500 bg-purple-900 text-purple-300`}>{p[2]}</span>
                  </div>
               ))}
            </div>
         ))}
      </div>

      <div className="mt-6 text-center text-sm font-medium text-slate-400">
         {mode === 'perm' ? (
            <span>Notice how <strong className="text-brand-400">ABC</strong> and <strong className="text-brand-400">CBA</strong> are counted completely separately. In a password (permutation), order strictly matters.</span>
         ) : (
            <span>By dividing the total by <strong className="text-white">3! (6)</strong>, we mathematically crushed every single group of 6 identical arrangements into <strong className="text-amber-400">1 single block</strong>.</span>
         )}
      </div>

    </div>
  );
}
