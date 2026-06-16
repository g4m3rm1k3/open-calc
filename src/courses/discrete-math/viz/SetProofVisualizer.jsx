import React, { useState } from 'react';

export default function SetProofVisualizer() {
  const [activeLaw, setActiveLaw] = useState('LEFT'); // LEFT side or RIGHT side of equation

  // We are visually proving: A ∩ (B ∪ C) === (A ∩ B) ∪ (A ∩ C)
  // Which actually lights up the exact same geometric intersections!

  return (
    <div className="w-full flex justify-center bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="flex flex-col items-center w-full max-w-2xl">
         <div className="text-center mb-6">
           <h3 className="text-white font-bold text-xl mb-1">Double Inclusion Proof Visualizer</h3>
           <p className="text-slate-400 text-sm">Proving that Algebraic Distribution rigidly equates to Geometric Overlaps.</p>
         </div>

         {/* Equation Toggles */}
         <div className="flex w-full bg-slate-800 rounded-md border border-slate-600 overflow-hidden mb-12 relative items-center justify-between">
            <button 
               onClick={() => setActiveLaw('LEFT')}
               className={`flex-1 py-3 text-sm font-bold font-mono transition-colors ${activeLaw === 'LEFT' ? 'bg-brand-600 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
            >
              A ∩ (B ∪ C)
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center absolute left-1/2 -translate-x-1/2 border-2 border-slate-700 z-10">
               ≡
            </div>
            <button 
               onClick={() => setActiveLaw('RIGHT')}
               className={`flex-1 py-3 text-sm font-bold font-mono transition-colors ${activeLaw === 'RIGHT' ? 'bg-emerald-600 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
            >
              (A ∩ B) ∪ (A ∩ C)
            </button>
         </div>

         {/* 3-Set SVG Venn Rendering */}
         <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
               <defs>
                  
                  {/* Master Masks for precision overlaps */}
                  <clipPath id="circleA"><circle cx="100" cy="70" r="50" /></clipPath>
                  <clipPath id="circleB"><circle cx="65" cy="130" r="50" /></clipPath>
                  <clipPath id="circleC"><circle cx="135" cy="130" r="50" /></clipPath>

                  {/* Mask for B Union C */}
                  <clipPath id="unionBC">
                     <circle cx="65" cy="130" r="50" />
                     <circle cx="135" cy="130" r="50" />
                  </clipPath>

               </defs>

               {/* Base Ghost Circles */}
               <circle cx="100" cy="70" r="50" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4,4" />
               <circle cx="65" cy="130" r="50" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4,4" />
               <circle cx="135" cy="130" r="50" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4,4" />

               {/* Exact Colored Region Logic (which is magically identical for both buttons) */}
               {/* Yes, the trick is that functionally both algorithms illuminate the exact same pixels! */}
               
               <g className="transition-all duration-700" opacity={activeLaw === 'LEFT' ? 1 : 0}>
                   {/* Left side: Filter A through (B ∪ C) */}
                   {/* Draw A, but clip it perfectly against Union(B, C) */}
                   <circle cx="100" cy="70" r="50" fill="#38bdf8" opacity="0.8" clipPath="url(#unionBC)" />
               </g>

               <g className="transition-all duration-700" opacity={activeLaw === 'RIGHT' ? 1 : 0}>
                   {/* Right side: Draw A intersect B, THEN draw A intersect C */}
                   <circle cx="100" cy="70" r="50" fill="#10b981" opacity="0.8" clipPath="url(#circleB)" />
                   <circle cx="100" cy="70" r="50" fill="#10b981" opacity="0.8" clipPath="url(#circleC)" />
               </g>

               {/* Labels */}
               <text x="100" y="10" fill="#cbd5e1" fontSize="14" fontWeight="bold" textAnchor="middle">Set A</text>
               <text x="20" y="180" fill="#cbd5e1" fontSize="14" fontWeight="bold" textAnchor="middle">Set B</text>
               <text x="180" y="180" fill="#cbd5e1" fontSize="14" fontWeight="bold" textAnchor="middle">Set C</text>
            </svg>
         </div>
         
         <div className="mt-8 text-center text-slate-300 max-w-md italic">
            "Notice how the geometric overlap is strictly identical regardless of which mathematical formula you type. This physically proves the Distributive Law operates perfectly across Set Sets!"
         </div>
      </div>

    </div>
  );
}
