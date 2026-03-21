import React, { useState } from 'react';
import { parseProse } from '../../math/parseProse.jsx';

export default function StarsAndBarsLab() {
  const [arrangementIndex, setArrangementIndex] = useState(0);

  // Problem: Distribute 6 identical sodas (Stars) into 3 distinct types (requires 2 Bars)
  // Total slots: 8 (6 stars + 2 bars)
  const arrangements = [
    { slots: ['★', '★', '★', '|', '★', '★', '|', '★'], desc: '3 Coke, 2 Sprite, 1 Fanta' },
    { slots: ['|', '★', '★', '★', '★', '|', '★', '★'], desc: '0 Coke, 4 Sprite, 2 Fanta' },
    { slots: ['★', '|', '|', '★', '★', '★', '★', '★'], desc: '1 Coke, 0 Sprite, 5 Fanta' },
    { slots: ['★', '★', '★', '★', '★', '★', '|', '|'], desc: '6 Coke, 0 Sprite, 0 Fanta' },
    { slots: ['★', '★', '|', '★', '★', '|', '★', '★'], desc: '2 Coke, 2 Sprite, 2 Fanta' }
  ];

  const current = arrangements[arrangementIndex];

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">The Stars and Bars Exploit</h3>
        <p className="text-slate-400 text-sm">How to geometrically count "Combinations with Repetition". Distributing 6 generic Sodas into 3 distinct Brands simply maps to shuffling <strong className="text-amber-400">6 Stars</strong> and <strong className="text-brand-400">2 Bars</strong>!</p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-lg border-2 border-slate-800 shadow-inner mb-6">
         
         <div className="flex gap-2 mb-8 items-center bg-slate-900 px-4 py-3 rounded-xl border border-slate-700">
            {current.slots.map((item, idx) => (
               <div 
                 key={idx} 
                 className={`w-10 h-14 md:w-12 md:h-16 flex items-center justify-center text-3xl rounded shadow-md border-b-4 transition-all duration-300 transform animate-slide-in
                   ${item === '★' ? 'text-amber-400 bg-amber-900/40 border-amber-600' : 'text-brand-300 bg-brand-900/80 border-brand-500 font-bold scale-110 z-10'}
                 `}
               >
                 {item}
               </div>
            ))}
         </div>

         <div className="text-center text-xl font-bold tracking-wider uppercase text-emerald-400 bg-emerald-900/30 px-6 py-2 rounded border border-emerald-500 animate-fade-in shadow-[0_0_15px_#059669]">
            {current.desc}
         </div>
      </div>

      <div className="flex justify-center gap-4 mb-8">
         <button 
           onClick={() => setArrangementIndex((arrangementIndex - 1 + arrangements.length) % arrangements.length)}
           className="px-6 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-wider text-xs shadow transition-colors"
         >
           Previous Shuffle
         </button>
         <button 
           onClick={() => setArrangementIndex((arrangementIndex + 1) % arrangements.length)}
           className="px-6 py-2 rounded bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold uppercase tracking-wider text-xs shadow-[0_0_10px_#d97706] transition-colors"
         >
           Next Shuffle
         </button>
      </div>

      <div className="text-center text-sm font-medium text-slate-400 max-w-2xl mx-auto flex flex-col items-center gap-1">
         <span>Instead of mathematically looping through confusing integer distributions, we just aggressively turned the problem into a standard arrangement! We rigidly have <strong className="text-white">8 generic slots</strong>.</span>
         <span>All we explicitly have to do is choose exactly <strong className="text-brand-400">2 slots</strong> to place the divider Bars in! The mathematical structure is flawlessly just <strong className="font-serif text-brand-300 border-b border-slate-600">{parseProse("$C(8,2) = 28$")}</strong>.</span>
      </div>

    </div>
  );
}
