import React, { useState } from 'react';

export default function QuantifierGridLab() {
  const [quantifier, setQuantifier] = useState('ALL'); // 'ALL' or 'EXISTS'
  const [nodes, setNodes] = useState(Array(15).fill(false));

  const toggleNode = (idx) => {
    const next = [...nodes];
    next[idx] = !next[idx];
    setNodes(next);
  };

  const setAll = (val) => setNodes(Array(15).fill(val));

  // Determine statement truth
  const isTrue = quantifier === 'ALL' 
    ? nodes.every(n => n) 
    : nodes.some(n => n);

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-stretch">
      
      {/* Left Control Panel */}
      <div className="flex flex-col gap-4 w-full md:w-64 bg-slate-800 p-5 rounded-lg border border-slate-600 shrink-0">
        <div>
          <h3 className="text-white font-bold text-lg mb-2">Quantifier Rule:</h3>
          <div className="flex bg-slate-900 border border-slate-700 rounded-md overflow-hidden">
            <button 
               onClick={() => setQuantifier('ALL')} 
               className={`flex-1 py-2 text-sm font-bold transition-colors flex items-center justify-center gap-1 ${quantifier === 'ALL' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="text-lg">∀</span> FOR ALL
            </button>
            <button 
               onClick={() => setQuantifier('EXISTS')} 
               className={`flex-1 py-2 text-sm font-bold transition-colors flex items-center justify-center gap-1 ${quantifier === 'EXISTS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="text-lg">∃</span> EXISTS
            </button>
          </div>
        </div>

        <div className="text-sm text-slate-300">
           <p className="mb-2"><strong>Domain:</strong> The Grid</p>
           <p><strong>Predicate:</strong> "Node is Active"</p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
            <button onClick={() => setAll(true)} className="w-full text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white py-1.5 rounded transition-colors">Activate All</button>
            <button onClick={() => setAll(false)} className="w-full text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white py-1.5 rounded transition-colors">Reset All</button>
        </div>
      </div>

      {/* Right Canvas Playground */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 rounded-lg border border-slate-800 relative min-h-[300px]">
        
        {/* Validation Header */}
        <div className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full font-bold border-2 transition-all duration-300 ${isTrue ? 'bg-emerald-900/60 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-red-900/40 border-red-500/50 text-red-400'}`}>
          <div className={`w-3 h-3 rounded-full ${isTrue ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></div>
          {isTrue ? 'STATEMENT TRUE' : 'STATEMENT FALSE'}
        </div>

        {/* Node Grid */}
        <div className="grid grid-cols-5 gap-3 sm:gap-5 mt-10">
          {nodes.map((isActive, idx) => (
             <button 
                key={idx}
                onClick={() => toggleNode(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 transition-all duration-300 transform hover:scale-110 active:scale-95 ${isActive ? 'bg-brand-500 border-brand-300 shadow-[0_0_20px_rgba(56,189,248,0.6)]' : 'bg-slate-800 border-slate-600 shadow-inner'}`}
             >
                <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isActive ? 'opacity-100 bg-white/20' : 'opacity-0'}`}></div>
             </button>
          ))}
        </div>

        {/* Status Help Text */}
        <div className="h-10 mt-6 text-center text-slate-400 text-sm font-medium">
          {quantifier === 'ALL' && !isTrue && '∀ demands a SLEDGEHAMMER. Literally every single node must be active!'}
          {quantifier === 'ALL' && isTrue && 'Excellent! The Universal claim is completely satisfied.'}
          {quantifier === 'EXISTS' && !isTrue && '∃ demands a SNIPER. Find even one node and turn it on!'}
          {quantifier === 'EXISTS' && isTrue && 'Witness found! The Existential claim is satisfied.'}
        </div>
      </div>
    </div>
  );
}
