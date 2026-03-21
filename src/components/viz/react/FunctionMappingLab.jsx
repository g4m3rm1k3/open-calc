import React, { useState } from 'react';

export default function FunctionMappingLab() {
  const [sizeX, setSizeX] = useState(3);
  const [sizeY, setSizeY] = useState(3);
  
  // Mapping state: mapping[x_index] = y_index OR null
  // We'll init with 0->0, 1->1, 2->2
  const [mapping, setMapping] = useState([0, 1, 2, null, null, null]);

  const updateMapping = (xIdx, yIdx) => {
    const next = [...mapping];
    next[xIdx] = Number(yIdx);
    setMapping(next);
  };

  const domain = Array.from({length: sizeX}, (_, i) => i);
  const codomain = Array.from({length: sizeY}, (_, i) => i);

  // Validations
  const activeMappings = domain.map(x => mapping[x]);
  const isFunction = activeMappings.every(y => y !== null && !isNaN(y) && y < sizeY);
  
  let isInjective = false;
  let isSurjective = false;

  if (isFunction) {
    const hits = new Set(activeMappings);
    isInjective = hits.size === activeMappings.length; // No duplicates
    isSurjective = hits.size === sizeY; // Every element in codomain hit
  }
  const isBijective = isInjective && isSurjective;

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1">The Function Machine f: X → Y</h3>
        <p className="text-slate-400 text-sm">Assign each input in X to exactly one output in Y.</p>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        
        {/* Environment Settings */}
        <div className="flex-1 bg-slate-800 p-4 rounded-lg border border-slate-600">
          <h4 className="text-white font-bold text-sm mb-4 border-b border-slate-700 pb-2">Universe Size Bounds</h4>
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-300 font-mono text-sm">Domain |X| = {sizeX}</span>
            <input type="range" min="1" max="5" value={sizeX} onChange={e => setSizeX(Number(e.target.value))} className="w-32 accent-brand-500" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-mono text-sm">Codomain |Y| = {sizeY}</span>
            <input type="range" min="1" max="5" value={sizeY} onChange={e => setSizeY(Number(e.target.value))} className="w-32 accent-purple-500" />
          </div>
          <div className="mt-4 p-2 bg-slate-900 rounded text-xs text-slate-400">
             Try forcing |X| &gt; |Y|. Can it ever be Injective? (Pigeonhole Principle!)
          </div>
        </div>

        {/* Live Mapping Configuration */}
        <div className="flex-[1.5] bg-slate-800 p-4 rounded-lg border border-slate-600 overflow-y-auto max-h-48">
           <h4 className="text-white font-bold text-sm mb-4 border-b border-slate-700 pb-2">Wire The Machine</h4>
           <div className="grid grid-cols-2 gap-4">
             {domain.map(x => (
               <div key={`map-${x}`} className="flex items-center gap-2">
                 <span className="w-10 text-center font-bold text-brand-400 bg-slate-900 rounded border border-brand-900 py-1">x{x+1}</span>
                 <span className="text-slate-500">→</span>
                 <select 
                    value={mapping[x] !== null && mapping[x] < sizeY ? mapping[x] : ""}
                    onChange={(e) => updateMapping(x, e.target.value)}
                    className="flex-1 bg-slate-900 text-purple-400 font-bold px-2 py-1 rounded border border-slate-600 focus:border-purple-500 outline-none"
                 >
                    <option value="" disabled>Pick y...</option>
                    {codomain.map(y => (
                      <option key={`opt-${y}`} value={y}>y{y+1}</option>
                    ))}
                 </select>
               </div>
             ))}
           </div>
        </div>

      </div>

      {/* Validation Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${isFunction ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'bg-red-900/20 border-red-500 text-red-400'}`}>
           <span className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Valid Function?</span>
           <span className="text-xl font-bold">{isFunction ? 'YES' : 'NO'}</span>
           <span className="text-[10px] text-center mt-2 opacity-70">Every X must have exactly 1 target</span>
        </div>

        <div className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${isFunction && isInjective ? 'bg-amber-900/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
           <span className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Injective (1-to-1)</span>
           <span className="text-xl font-bold">{isFunction && isInjective ? 'YES' : 'NO'}</span>
           <span className="text-[10px] text-center mt-2 opacity-70">No two arrows hit same Y</span>
        </div>

        <div className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${isFunction && isSurjective ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
           <span className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Surjective (Onto)</span>
           <span className="text-xl font-bold">{isFunction && isSurjective ? 'YES' : 'NO'}</span>
           <span className="text-[10px] text-center mt-2 opacity-70">Every Y receives an arrow</span>
        </div>

        <div className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${isFunction && isBijective ? 'bg-pink-900/20 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-105 transform' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
           <span className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Bijective</span>
           <span className="text-xl font-bold">{isFunction && isBijective ? 'YES' : 'NO'}</span>
           <span className="text-[10px] text-center mt-2 opacity-70">Perfect 1:1 Invertible Pairing</span>
        </div>

      </div>

    </div>
  );
}
