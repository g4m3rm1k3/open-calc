import React, { useState } from 'react';

export default function SetExplorer() {
  const [operation, setOperation] = useState('UNION'); // UNION, INTERSECT, DIFF_A, DIFF_B, COMPLEMENT_A, XOR

  // Determine what shades green based on math op
  const isA_only = ['UNION', 'DIFF_A', 'XOR'].includes(operation);
  const isB_only = ['UNION', 'DIFF_B', 'XOR', 'COMPLEMENT_A'].includes(operation);
  const isBoth = ['UNION', 'INTERSECT', 'COMPLEMENT_A'].includes(operation); // Wait, Complement A = Everything outside A. So B_only and Neither.
  const isNeither = ['COMPLEMENT_A'].includes(operation);

  const getAColor = () => {
     if (operation === 'UNION') return 'fill-brand-400 opacity-60';
     if (operation === 'DIFF_A') return 'fill-brand-400 opacity-60';
     if (operation === 'XOR') return 'fill-brand-400 opacity-60';
     return 'fill-transparent opacity-0';
  };

  const getBColor = () => {
     if (operation === 'UNION') return 'fill-emerald-400 opacity-60';
     if (operation === 'DIFF_B') return 'fill-emerald-400 opacity-60';
     if (operation === 'XOR') return 'fill-emerald-400 opacity-60';
     if (operation === 'COMPLEMENT_A') return 'fill-emerald-400 opacity-60'; // Actually Complement A is entire B + outside. Let's handle B separately.
     return 'fill-transparent opacity-0';
  };

  const getIntersectionColor = () => {
     if (operation === 'UNION') return 'fill-teal-300 opacity-80';
     if (operation === 'INTERSECT') return 'fill-amber-400 opacity-90 shadow-[0_0_20px_#fbbf24]';
     if (operation === 'COMPLEMENT_A') return 'fill-transparent opacity-0'; // B without A is colored, but intersection is A, so no!
     return 'fill-transparent opacity-0';
  }

  return (
    <div className="w-full relative flex flex-col items-center bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1">Set Operations Explorer</h3>
        <p className="text-slate-400 text-sm">Visualize exactly what objects survive the mathematical filter</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-10 w-full max-w-2xl bg-slate-800 p-2 rounded-lg border border-slate-600">
        <button onClick={() => setOperation('UNION')} className={`px-3 py-1.5 rounded font-bold text-sm transition-colors ${operation === 'UNION' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>A ∪ B (Union)</button>
        <button onClick={() => setOperation('INTERSECT')} className={`px-3 py-1.5 rounded font-bold text-sm transition-colors ${operation === 'INTERSECT' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>A ∩ B (Intersect)</button>
        <button onClick={() => setOperation('DIFF_A')} className={`px-3 py-1.5 rounded font-bold text-sm transition-colors ${operation === 'DIFF_A' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>A − B (Difference)</button>
        <button onClick={() => setOperation('COMPLEMENT_A')} className={`px-3 py-1.5 rounded font-bold text-sm transition-colors ${operation === 'COMPLEMENT_A' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Aᶜ (Complement)</button>
        <button onClick={() => setOperation('XOR')} className={`px-3 py-1.5 rounded font-bold text-sm transition-colors ${operation === 'XOR' ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>A ⊕ B (Symmetric)</button>
      </div>

      {/* Venn SVG */}
      <div className={`relative w-64 h-64 sm:w-80 sm:h-80 transition-colors duration-500 rounded-lg ${operation === 'COMPLEMENT_A' ? 'bg-emerald-900/30 border-2 border-emerald-500/50' : 'bg-transparent border-2 border-dashed border-slate-600/50'}`}>
         
         {/* Set A (Left) */}
         <div className="absolute top-1/2 left-8 sm:left-10 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 border-4 border-brand-500 rounded-full flex items-center justify-start overflow-hidden z-10">
            {/* The Left Moon */}
            <div className={`absolute inset-0 transition-opacity duration-500 bg-brand-500 ${isA_only ? 'opacity-40' : 'opacity-0'}`}></div>
         </div>
         <span className="absolute top-4 left-10 text-brand-400 font-bold text-2xl z-30">A</span>
         
         {/* Set B (Right) */}
         <div className="absolute top-1/2 right-8 sm:right-10 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 border-4 border-emerald-500 rounded-full flex items-center justify-end overflow-hidden z-10">
            {/* The Right Moon */}
            <div className={`absolute inset-0 transition-opacity duration-500 bg-emerald-500 ${isB_only ? 'opacity-40' : 'opacity-0'}`}></div>
         </div>
         <span className="absolute top-4 right-10 text-emerald-400 font-bold text-2xl z-30">B</span>

         {/* The Overlap Clip path trick */}
         <div className="absolute top-1/2 left-8 sm:left-10 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden z-20 pointer-events-none" style={{ clipPath: 'circle(50% at calc(100% - 2.5rem) 50%)' }}>
            <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full absolute -right-20 sm:-right-24 top-0 transition-all duration-500 border-l-4 border-transparent ${operation === 'INTERSECT' ? 'bg-amber-400 opacity-80 scale-105' : 'bg-teal-500 opacity-0'}`} />
         </div>

         {/* Manual DOM Overlaps to fix naive CSS clipping bugs */}
         <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-28 sm:w-20 sm:h-36 rounded-[50%] transition-colors duration-500 z-20 ${operation === 'INTERSECT' || operation === 'UNION' ? 'bg-amber-400/80 shadow-[0_0_30px_#fbbf24]' : 'bg-transparent'}`}></div>

      </div>

      <div className="mt-8 text-slate-300 font-medium text-center max-w-lg h-16">
         {operation === 'UNION' && <p><strong>Union (A ∪ B):</strong> Elements in A, OR in B, OR in both. The massive inclusive wrapper.</p>}
         {operation === 'INTERSECT' && <p><strong>Intersection (A ∩ B):</strong> The strict overlap. Elements perfectly shared between BOTH A and B.</p>}
         {operation === 'DIFF_A' && <p><strong>Difference (A − B):</strong> Everything in A, heavily stripped of anything contaminated by B.</p>}
         {operation === 'COMPLEMENT_A' && <p><strong>Complement (Aᶜ):</strong> The absolute inverse. Literally EVERYTHING in the entire universe that is NOT inside A.</p>}
         {operation === 'XOR' && <p><strong>Symmetric Difference (A ⊕ B):</strong> Elements uniquely in A or uniquely in B, but rejecting the overlap. The ultimate exclusive VIP club.</p>}
      </div>

    </div>
  );
}
