import React, { useState } from 'react';

export default function CartesianGridLab() {
  const [sizeA, setSizeA] = useState(3);
  const [sizeB, setSizeB] = useState(3);

  const setA = Array.from({length: sizeA}, (_, i) => i + 1);
  const setB = Array.from({length: sizeB}, (_, i) => String.fromCharCode(65 + i)); // A, B, C...

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1">The Cartesian Grid (A × B)</h3>
        <p className="text-slate-400 text-sm">Every possible coordinate combination generated exactly systematically.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Controls */}
        <div className="w-full md:w-64 bg-slate-800 p-4 rounded-lg border border-slate-600 shrink-0">
          <h4 className="text-white font-bold text-sm mb-4 border-b border-slate-700 pb-2">Set Axis Settings</h4>
          
          <div className="mb-4">
            <div className="flex justify-between">
               <span className="text-brand-400 font-bold text-sm">Set A (X-Axis): {sizeA}</span>
            </div>
            <input type="range" min="1" max="5" value={sizeA} onChange={e => setSizeA(Number(e.target.value))} className="w-full accent-brand-500 mt-2" />
            <div className="flex gap-1 mt-1 flex-wrap">
               {setA.map(a => <span key={a} className="w-6 h-6 flex items-center justify-center bg-brand-900/50 text-brand-300 rounded text-xs">{a}</span>)}
            </div>
          </div>

          <div>
            <div className="flex justify-between">
               <span className="text-emerald-400 font-bold text-sm">Set B (Y-Axis): {sizeB}</span>
            </div>
            <input type="range" min="1" max="5" value={sizeB} onChange={e => setSizeB(Number(e.target.value))} className="w-full accent-emerald-500 mt-2" />
            <div className="flex gap-1 mt-1 flex-wrap">
               {setB.map(b => <span key={b} className="w-6 h-6 flex items-center justify-center bg-emerald-900/50 text-emerald-300 rounded text-xs">{b}</span>)}
            </div>
          </div>

          <div className="mt-8 p-3 bg-slate-900 rounded border border-slate-700">
             <span className="text-xs text-slate-400 font-medium">Total Product |A × B|:</span>
             <div className="text-2xl font-mono text-white font-bold mt-1">
                {sizeA} × {sizeB} = <span className="text-amber-400">{sizeA * sizeB} pairs</span>
             </div>
          </div>
        </div>

        {/* Right Grid Map */}
        <div className="flex-1 min-h-[300px] flex items-end">
           
           <div className="relative w-full aspect-square max-w-[400px] border-b-2 border-l-2 border-slate-500 flex flex-col justify-end">
              
              {/* Grid Content */}
              <div 
                 className="grid w-full h-full" 
                 style={{ 
                   gridTemplateColumns: `repeat(${sizeA}, minmax(0, 1fr))`,
                   gridTemplateRows: `repeat(${sizeB}, minmax(0, 1fr))` 
                 }}
              >
                  {/* We iterate backwards to render Y bottom-up */}
                  {[...setB].reverse().map((b, rowIdx) => (
                     setA.map((a, colIdx) => (
                        <div key={`${a}-${b}`} className="border-t border-r border-slate-700/50 flex flex-col items-center justify-center group hover:bg-slate-800 transition-colors relative cursor-crosshair">
                           
                           {/* Coordinate Marker */}
                           <div className="w-3 h-3 bg-amber-500 rounded-full group-hover:scale-150 group-hover:shadow-[0_0_15px_#fbbf24] transition-all absolute"></div>

                           {/* Active Tooltip */}
                           <div className="absolute -top-8 bg-slate-800 text-white text-xs font-mono font-bold px-2 py-1 rounded border border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              ({a}, {b})
                           </div>
                        </div>
                     ))
                  ))}
              </div>

              {/* Axis Labels */}
              <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-around py-4">
                 {[...setB].reverse().map(b => (
                   <span key={`y-${b}`} className="text-emerald-400 font-bold text-sm h-full flex items-center">{b}</span>
                 ))}
              </div>

              <div className="absolute left-0 right-0 -bottom-8 flex justify-around px-4">
                 {setA.map(a => (
                   <span key={`x-${a}`} className="text-brand-400 font-bold text-sm w-full flex justify-center">{a}</span>
                 ))}
              </div>

           </div>
        </div>
      </div>
    </div>
  );
}
