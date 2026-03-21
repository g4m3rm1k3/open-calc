import React, { useState } from 'react';

export default function LogicGateSim() {
  const [switchesAnd, setSwitchesAnd] = useState([false, false]); // P, Q
  const [switchesOr, setSwitchesOr] = useState([false, false]); // P, Q

  const toggleAnd = (index) => {
    const newSwitches = [...switchesAnd];
    newSwitches[index] = !newSwitches[index];
    setSwitchesAnd(newSwitches);
  };

  const toggleOr = (index) => {
    const newSwitches = [...switchesOr];
    newSwitches[index] = !newSwitches[index];
    setSwitchesOr(newSwitches);
  };

  const andResult = switchesAnd[0] && switchesAnd[1];
  const orResult = switchesOr[0] || switchesOr[1];

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 p-6 bg-slate-900 rounded-xl border border-slate-700 shadow-md">
      
      {/* AND GATE: Series */}
      <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-5 flex flex-col items-center">
        <h3 className="font-bold text-white text-lg mb-1">AND Gate (Series)</h3>
        <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-mono">P ∧ Q</p>
        
        {/* Wire & Switches SVG */}
        <div className="relative w-full h-32 flex items-center justify-center">
          
          {/* Main wire line */}
          <div className={`absolute top-1/2 left-0 right-16 h-1 -translate-y-1/2 rounded ${andResult ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-600'}`}></div>
          
          {/* Switch 1: P */}
          <button onClick={() => toggleAnd(0)} className="absolute left-1/4 -translate-x-1/2 top-1/2 -translate-y-1/2 group z-10 flex flex-col items-center gap-2">
            <span className={`text-xs font-bold px-1.5 rounded ${switchesAnd[0] ? 'text-emerald-400 bg-emerald-900/50' : 'text-slate-400 bg-slate-700'}`}>P</span>
            <div className={`w-12 h-2 origin-left transition-transform duration-300 ${switchesAnd[0] ? 'bg-yellow-400 scale-x-100 rotate-0 shadow-[0_0_8px_#facc15]' : 'bg-slate-500 -rotate-45 -translate-y-2'}`}></div>
          </button>

          {/* Switch 2: Q */}
          <button onClick={() => toggleAnd(1)} className="absolute left-[60%] -translate-x-1/2 top-1/2 -translate-y-1/2 group z-10 flex flex-col items-center gap-2">
            <span className={`text-xs font-bold px-1.5 rounded ${switchesAnd[1] ? 'text-emerald-400 bg-emerald-900/50' : 'text-slate-400 bg-slate-700'}`}>Q</span>
            <div className={`w-12 h-2 origin-left transition-transform duration-300 ${switchesAnd[1] ? 'bg-yellow-400 scale-x-100 rotate-0 shadow-[0_0_8px_#facc15]' : 'bg-slate-500 -rotate-45 -translate-y-2'}`}></div>
          </button>

          {/* Lightbulb Output */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${andResult ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_20px_#facc15]' : 'bg-slate-700 border-slate-500'}`}></div>
             <span className="text-xs text-white font-mono mt-2 font-bold">{andResult ? 'TRUE' : 'FALSE'}</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-4 text-center max-w-[200px]">Current must travel through a single broken path. BOTH must be closed!</p>
      </div>

      {/* OR GATE: Parallel */}
      <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg p-5 flex flex-col items-center">
        <h3 className="font-bold text-white text-lg mb-1">OR Gate (Parallel)</h3>
        <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest font-mono">P ∨ Q</p>
        
        {/* Wire & Switches SVG */}
        <div className="relative w-full h-32 flex items-center justify-center">
          
          {/* Main wire bounding box */}
          <div className="absolute inset-y-8 left-8 right-16 border-2 border-r-0 border-l-0 border-transparent">
             {/* Power input split */}
             <div className={`absolute top-0 bottom-0 left-0 w-1 ${orResult ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-600'}`}></div>
             {/* Power return merge */}
             <div className={`absolute top-0 bottom-0 right-0 w-1 ${orResult ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-600'}`}></div>
             
             {/* Top Wire */}
             <div className={`absolute top-0 left-0 right-0 h-1 ${orResult ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-600'}`}></div>
             {/* Bottom Wire */}
             <div className={`absolute bottom-0 left-0 right-0 h-1 ${orResult ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-600'}`}></div>
          </div>

          <div className={`absolute left-0 right-[calc(100%-2rem)] h-1 top-1/2 -translate-y-1/2 ${orResult ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-600'}`}></div>
          <div className={`absolute left-[calc(100%-4rem)] right-16 h-1 top-1/2 -translate-y-1/2 ${orResult ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : 'bg-slate-600'}`}></div>

          
          {/* Switch 1: P (Top) */}
          <button onClick={() => toggleOr(0)} className="absolute left-1/2 -translate-x-1/2 top-4 -translate-y-1/2 group z-10 flex flex-col items-center gap-2">
            <span className={`text-xs font-bold px-1.5 rounded ${switchesOr[0] ? 'text-emerald-400 bg-emerald-900/50' : 'text-slate-400 bg-slate-700'}`}>P</span>
            <div className={`relative w-12 h-2 origin-left transition-transform duration-300 left-4 ${switchesOr[0] ? 'bg-yellow-400 scale-x-100 rotate-0 shadow-[0_0_8px_#facc15]' : 'bg-slate-500 -rotate-45 -translate-y-2'}`}></div>
          </button>

          {/* Switch 2: Q (Bottom) */}
          <button onClick={() => toggleOr(1)} className="absolute left-1/2 -translate-x-1/2 bottom-[1.4rem] group z-10 flex flex-col items-center gap-2">
            <div className={`relative w-12 h-2 origin-left transition-transform duration-300 left-4 ${switchesOr[1] ? 'bg-yellow-400 scale-x-100 rotate-0 shadow-[0_0_8px_#facc15]' : 'bg-slate-500 -rotate-45 -translate-y-2'}`}></div>
            <span className={`text-xs font-bold px-1.5 rounded mt-2 ${switchesOr[1] ? 'text-emerald-400 bg-emerald-900/50' : 'text-slate-400 bg-slate-700'}`}>Q</span>
          </button>

          {/* Lightbulb Output */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
             <div className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${orResult ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_20px_#facc15]' : 'bg-slate-700 border-slate-500'}`}></div>
             <span className="text-xs text-white font-mono mt-2 font-bold">{orResult ? 'TRUE' : 'FALSE'}</span>
          </div>
        </div>
        <p className="text-xs text-slate-300 mt-4 text-center max-w-[200px]">Current splits. It only needs ONE intact wire to complete the circuit!</p>
      </div>
    </div>
  );
}
