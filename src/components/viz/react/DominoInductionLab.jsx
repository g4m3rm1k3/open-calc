import React, { useState, useEffect } from 'react';

export default function DominoInductionLab() {
  const [baseCase, setBaseCase] = useState(false);
  const [inductiveStep, setInductiveStep] = useState(false);
  const [running, setRunning] = useState(false);
  const [fallen, setFallen] = useState(Array(10).fill(false));
  const [statusText, setStatusText] = useState("Setup your proof parameters.");

  const dominos = Array.from({length: 10}, (_, i) => i + 1);

  const runProof = () => {
    setRunning(true);
    setFallen(Array(10).fill(false));

    if (!baseCase) {
      setStatusText("CRITICAL FAILURE: No Base Case! Nobody pushed the first domino. The entire infinite line stands perfectly still. P(n) is unproven.");
      setRunning(false);
      return;
    }

    if (!inductiveStep) {
      setStatusText("CRITICAL FAILURE: Inductive Step P(k) -> P(k+1) is broken! The dominos are spaced too far apart. Domino 1 falls, but completely misses Domino 2.");
      setTimeout(() => {
        setFallen([true, ...Array(9).fill(false)]);
        setRunning(false);
      }, 500);
      return;
    }

    // Both are true! Animate the infinite fall.
    setStatusText("PERFECT PROOF! Base case initiated. Inductive step strictly guarantees every domino hits the next. Truth propagates to Infinity!");
    let currentIndex = 0;
    
    const fallInterval = setInterval(() => {
      setFallen(prev => {
        const next = [...prev];
        next[currentIndex] = true;
        return next;
      });
      
      currentIndex++;
      if (currentIndex >= 10) {
        clearInterval(fallInterval);
        setRunning(false);
      }
    }, 150);
  };

  const reset = () => {
    setRunning(false);
    setFallen(Array(10).fill(false));
    setStatusText("Proof reset. Adjust parameters.");
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">The Domino Physics of Induction</h3>
        <p className="text-slate-400 text-sm">Tune the mathematical logic engine. See if you can achieve infinite propagation.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8 justify-center items-center bg-slate-800 p-4 rounded-lg border border-slate-600 max-w-2xl mx-auto">
         
         <div className="flex flex-col gap-3 w-full max-w-xs">
            <label className="flex items-center gap-3 cursor-pointer group">
               <input 
                  type="checkbox" 
                  checked={baseCase} 
                  onChange={() => {setBaseCase(!baseCase); reset();}}
                  className="w-5 h-5 accent-emerald-500 rounded bg-slate-900 border-slate-600"
                  disabled={running}
               />
               <span className={`font-bold transition-colors ${baseCase ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  Prove P(1) [Base Case]
               </span>
            </label>
            <p className="text-[10px] text-slate-500 pl-8 leading-tight">Physically flicking the very first domino over with your finger.</p>

            <label className="flex items-center gap-3 cursor-pointer group mt-2">
               <input 
                  type="checkbox" 
                  checked={inductiveStep} 
                  onChange={() => {setInductiveStep(!inductiveStep); reset();}}
                  className="w-5 h-5 accent-emerald-500 rounded bg-slate-900 border-slate-600"
                  disabled={running}
               />
               <span className={`font-bold transition-colors ${inductiveStep ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  Prove P(k) → P(k+1) [Inductive Step]
               </span>
            </label>
            <p className="text-[10px] text-slate-500 pl-8 leading-tight">Proving the mathematical spacing between ALWAYS secures a hit.</p>
         </div>

         <div className="flex flex-col gap-2 w-full md:w-32">
            <button 
               onClick={runProof} 
               disabled={running}
               className="w-full py-3 rounded bg-brand-600 hover:bg-brand-500 font-bold text-white shadow-md disabled:opacity-50 transition"
            >
               Run Proof
            </button>
            <button 
               onClick={reset} 
               disabled={running}
               className="w-full py-2 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold text-slate-300 transition uppercase tracking-wider"
            >
               Reset Board
            </button>
         </div>

      </div>

      {/* The Domino Stage */}
      <div className="relative w-full h-40 bg-slate-950 rounded-xl border-b-8 border-slate-800 flex items-end justify-center px-4 overflow-hidden shadow-inner">
         
         {/* Invisible Finger (Base Case) */}
         <div className={`absolute left-0 bottom-10 text-4xl transform transition-transform duration-300 z-10 ${running && baseCase ? 'translate-x-12 opacity-100 rotate-45' : '-translate-x-10 opacity-0'}`}>
            👉
         </div>

         {/* The Dominos */}
         <div className="flex gap-2 relative bottom-4">
            {dominos.map((n, i) => {
               const isFallen = fallen[i];
               const hasGap = !inductiveStep && i > 0;
               return (
                 <div 
                   key={n} 
                   className={`
                      w-6 h-24 rounded-sm border-2 transition-all duration-300 ease-in flex items-start justify-center pt-2 font-bold text-[10px]
                      ${hasGap ? 'ml-8' : 'ml-0'}
                      ${isFallen ? 'rotate-[70deg] translate-x-4 translate-y-2 bg-amber-500 border-amber-400 text-amber-950 shadow-[0_0_15px_#fbbf24]' : 'bg-slate-700 border-slate-500 text-slate-300'}
                   `}
                   style={{ transformOrigin: 'bottom right', zIndex: 10 - i }}
                 >
                   {n}
                 </div>
               );
            })}
            
            {/* Infinity Fade */}
            <div className={`w-32 h-24 ml-8 bg-gradient-to-r from-transparent to-slate-950 absolute -right-20 bottom-0 z-20 flex items-center justify-end pr-4 text-slate-500 font-serif italic text-2xl ${fallen[9] ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
               ...∞
            </div>
         </div>

      </div>

      <div className={`mt-6 p-4 rounded-lg text-sm font-bold text-center border transition-colors duration-500 ${
         !running && fallen[9] ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' : 
         !running && (!baseCase || !inductiveStep) ? 'bg-red-900/30 border-red-500 text-red-400' : 
         'bg-slate-800 border-slate-700 text-slate-400'
      }`}>
         {statusText}
      </div>

    </div>
  );
}
