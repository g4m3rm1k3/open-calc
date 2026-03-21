import React, { useState } from 'react';
import { parseProse } from '../../math/parseProse.jsx';

export default function StrongInductionWallLab() {
  const [trigger, setTrigger] = useState(false);
  const [stage, setStage] = useState(0); // 0=idle, 1=weak falls, 2=strong wall building, 3=strong pushes

  const playWeakInduction = () => {
    setTrigger(!trigger);
    setStage(1);
    setTimeout(() => setStage(0), 3000);
  };

  const playStrongInduction = () => {
    setTrigger(!trigger);
    setStage(2);
    // Sequence of historical dominoes flying in to form the scaffold
    setTimeout(() => setStage(3), 2000); 
    setTimeout(() => setStage(0), 5000);
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6 overflow-hidden">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">The Heavy Mass of Strong Induction</h3>
        <p className="text-slate-400 text-sm">Visually proving why a single point of failure <strong className="text-brand-400 font-serif text-lg">{parseProse("$P(k)$")}</strong> cannot push over massive algebraic structures.</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
         <button 
           onClick={playWeakInduction} 
           disabled={stage !== 0}
           className="px-6 py-2 rounded-lg font-bold uppercase transition-all duration-300 shadow-md bg-slate-700 hover:bg-slate-600 text-white text-xs disabled:opacity-50"
         >
           Test Weak P(k)
         </button>
         <button 
           onClick={playStrongInduction} 
           disabled={stage !== 0}
           className="px-6 py-2 rounded-lg font-bold uppercase transition-all duration-300 shadow-md bg-amber-600 hover:bg-amber-500 text-amber-950 text-xs disabled:opacity-50"
         >
           Test Strong Scaffold
         </button>
      </div>

      {/* The Physics Stage */}
      <div className="relative w-full h-48 bg-slate-950 border-b-8 border-slate-800 flex items-end justify-center px-4 rounded shadow-inner">
         
         {/* The Target k+1 (Massive Block) */}
         <div className={`absolute bottom-0 transition-transform duration-700 ease-in flex items-center justify-center text-4xl font-bold bg-slate-700 border-4 border-slate-500 shadow-2xl z-20 font-serif
             w-24 h-32 ml-48
             ${stage === 3 ? 'rotate-[75deg] translate-x-12 translate-y-6 bg-emerald-700 border-emerald-500 shadow-[0_0_30px_#10b981]' : ''}
         `} style={{ transformOrigin: 'bottom right' }}>
            <span className="text-slate-300 -mt-8">{parseProse("$k+1$")}</span>
         </div>

         {/* Weak Induction (Single Domino k) */}
         <div className={`absolute bottom-0 ml-12 transition-all duration-500 ease-in flex items-start pt-2 justify-center font-bold bg-brand-600 border-2 border-brand-400 z-10 
             w-6 h-16
             ${stage === 1 ? 'rotate-45 translate-x-6' : ''}
         `} style={{ transformOrigin: 'bottom right', opacity: stage === 1 || stage === 0 ? 1 : 0 }}>
            k
         </div>

         {/* The Strong Scaffold Elements flying in (P1 to Pk) */}
         <div className={`absolute bottom-0 transition-all duration-1000 z-10 flex gap-0.5
             ${stage === 2 || stage === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-32'}
             ${stage === 3 ? 'rotate-[30deg] translate-x-8 translate-y-2' : ''}
         `} style={{ transformOrigin: 'bottom right', left: 'calc(50% - 100px)' }}>
            
            <div className="w-6 h-10 bg-amber-600 border-2 border-amber-400 flex justify-center text-[10px] font-bold text-amber-950 pt-1">1</div>
            <div className="w-6 h-12 bg-amber-600 border-2 border-amber-400 flex justify-center text-[10px] font-bold text-amber-950 pt-1">2</div>
            <div className="w-6 h-14 bg-amber-600 border-2 border-amber-400 flex justify-center text-[10px] font-bold text-amber-950 pt-1">3</div>
            <div className="w-6 h-16 bg-amber-500 border-2 border-amber-300 flex justify-center text-xs font-bold text-amber-950 pt-1 shadow-[0_0_15px_#fbbf24]">k</div>
         </div>

         {/* Weak Result Banner */}
         {stage === 1 && (
            <div className="absolute top-4 bg-red-900/80 border border-red-500 text-red-300 font-bold py-1 px-4 rounded text-sm animate-fade-in shadow-lg flex items-center gap-1">
               ❌ Weak Induction Fails! Domino <span className="text-white">{parseProse("$k$")}</span> bounces off the massive block.
            </div>
         )}
         
         {/* Strong Result Banner */}
         {stage === 3 && (
            <div className="absolute top-4 bg-emerald-900/80 border border-emerald-500 text-emerald-300 font-bold py-1 px-4 rounded text-sm animate-fade-in shadow-lg">
               ✅ Scaffold Prevails! Historical truth forces the block down.
            </div>
         )}

      </div>

    </div>
  );
}
