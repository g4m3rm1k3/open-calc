import React, { useState } from 'react';

export default function BipartiteQuantifierViz() {
  const [mode, setMode] = useState('AE'); // 'AE' = ∀x∃y, 'EA' = ∃y∀x

  const leftNodes = [0, 1, 2, 3];
  const rightNodes = [0, 1, 2, 3];

  const getTarget = (x) => {
    if (mode === 'EA') return 2; // There is one specific Y that all X point to.
    
    // AE Mapping: Every X finds a unique Y.
    if (x === 0) return 1;
    if (x === 1) return 3;
    if (x === 2) return 0;
    return 2;
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6 flex flex-col items-center">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-lg mb-1">Nested Scope: Order of Operations</h3>
        <p className="text-slate-400 text-sm">Loves(x, y) means Person $x$ (Left) loves Person $y$ (Right)</p>
      </div>

      {/* Control Tabs */}
      <div className="flex bg-slate-800 rounded-md border border-slate-600 overflow-hidden mb-8 w-full max-w-sm">
        <button 
           onClick={() => setMode('AE')}
           className={`flex-1 py-2 px-2 text-sm font-bold transition-colors ${mode === 'AE' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          ∀x ∃y Loves(x,y)
        </button>
        <button 
           onClick={() => setMode('EA')}
           className={`flex-1 py-2 px-2 text-sm font-bold transition-colors ${mode === 'EA' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          ∃y ∀x Loves(x,y)
        </button>
      </div>

      {/* Vis Canvas */}
      <div className="relative w-full max-w-md h-64 bg-slate-950 rounded-lg border border-slate-800 p-4">
        
        {/* SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {leftNodes.map((x) => {
            const y = getTarget(x);
            // hardcode coordinates based on flexing grid geometry
            // 4 items, spaced. Height is 256px.
            // Items are roughly at 12.5%, 37.5%, 62.5%, 87.5%
            const startY = 32 + x * ((256 - 64) / 3);
            const endY = 32 + y * ((256 - 64) / 3);
            
            return (
              <line 
                key={x}
                x1="20%" y1={startY} 
                x2="80%" y2={endY} 
                stroke={mode === 'AE' ? '#38bdf8' : '#10b981'} // brand-400 : emerald-400
                strokeWidth="3"
                opacity="0.6"
                strokeLinecap="round"
                className="transition-all duration-700 ease-in-out"
              />
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div className="absolute inset-x-0 inset-y-4 flex justify-between px-8 sm:px-16" style={{ zIndex: 10 }}>
          
          {/* Left Column X */}
          <div className="flex flex-col justify-between h-full relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">SET X</div>
            {leftNodes.map((x) => (
              <div key={`L${x}`} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-500 shadow-md flex items-center justify-center text-xs font-bold text-white z-10">x{x}</div>
            ))}
          </div>

          {/* Right Column Y */}
          <div className="flex flex-col justify-between h-full relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500">SET Y</div>
            {rightNodes.map((y) => (
              <div key={`R${y}`} className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 transition-colors duration-500 ${mode === 'EA' && y === 2 ? 'bg-emerald-600 border-emerald-300 scale-110 shadow-[0_0_20px_#10b981]' : 'bg-slate-700 border-slate-500'}`}>
                y{y}
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="mt-8 text-sm text-center max-w-md h-16 text-slate-300">
         {mode === 'AE' && (
           <p className="animate-fade-in"><span className="text-brand-400 font-bold">Everyone loves somebody.</span> Every x found a target y. They don't have to be the same target, as long as nobody is left alone!</p>
         )}
         {mode === 'EA' && (
           <p className="animate-fade-in"><span className="text-emerald-400 font-bold">There is ONE person that everyone loves.</span> Because ∃y comes FIRST, we must freeze a specific "y2" target that applies universally to all sweeping x values.</p>
         )}
      </div>

    </div>
  );
}
