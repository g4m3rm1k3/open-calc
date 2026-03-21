import React, { useState } from 'react';

export default function SigmaDecoderLab() {
  const [activePart, setActivePart] = useState(null);

  const parts = {
    top: { label: 'The Ceiling', desc: 'The mathematical stopping condition. When the index hits this exact number, the loop terminates.' },
    sigma: { label: 'The Engine', desc: 'The Greek letter Sigma (Σ). It acts as a massive "for-loop" commanding you to ADD everything generated together.' },
    bottom: { label: 'The Iterator', desc: 'The starting value. This declares the looping variable (i) and sets its absolute first value.' },
    body: { label: 'The Payload', desc: 'The actual formula you are executing and adding during every single cycle of the loop.' }
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">The Sigma (Σ) Decoder Ring</h3>
        <p className="text-slate-400 text-sm">Hover over the mathematical symbols to translate the strict academic notation into programming logic.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
         
         {/* The Math Symbol */}
         <div className="relative flex items-center justify-center p-8 bg-slate-950 rounded-2xl border-2 border-slate-800 shrink-0">
            
            <div className="flex items-center text-white font-serif text-5xl cursor-pointer">
               <div className="flex flex-col items-center justify-center mr-2">
                  <div 
                    className={`text-xl mb-1 px-2 rounded transition-colors duration-300 ${activePart === 'top' ? 'bg-brand-500 text-slate-950 font-bold' : 'hover:bg-slate-800'}`}
                    onMouseEnter={() => setActivePart('top')}
                    onMouseLeave={() => setActivePart(null)}
                  >
                     $n$
                  </div>
                  
                  <div 
                    className={`text-6xl px-2 rounded transition-colors duration-300 ${activePart === 'sigma' ? 'bg-amber-500 text-amber-950 font-bold pt-1 pb-2' : 'hover:bg-slate-800'}`}
                    onMouseEnter={() => setActivePart('sigma')}
                    onMouseLeave={() => setActivePart(null)}
                  >
                     $\sum$
                  </div>
                  
                  <div 
                    className={`text-lg mt-1 px-2 rounded transition-colors duration-300 ${activePart === 'bottom' ? 'bg-emerald-500 text-slate-950 font-bold' : 'hover:bg-slate-800'}`}
                    onMouseEnter={() => setActivePart('bottom')}
                    onMouseLeave={() => setActivePart(null)}
                  >
                     $i=1$
                  </div>
               </div>
               
               <div 
                 className={`ml-2 px-3 py-4 rounded transition-colors duration-300 ${activePart === 'body' ? 'bg-purple-500 text-purple-950 font-bold' : 'hover:bg-slate-800'}`}
                 onMouseEnter={() => setActivePart('body')}
                 onMouseLeave={() => setActivePart(null)}
               >
                  $i$
               </div>
            </div>
         </div>

         {/* The Explanation Pannel */}
         <div className="w-full max-w-sm h-40 bg-slate-800 border border-slate-600 rounded-xl p-5 flex flex-col justify-center items-center text-center shadow-inner transition-all duration-300">
            {activePart ? (
               <div className="animate-fade-in">
                  <div className={`font-bold text-lg mb-2 uppercase tracking-wide
                     ${activePart === 'top' ? 'text-brand-400' : 
                       activePart === 'sigma' ? 'text-amber-400' : 
                       activePart === 'bottom' ? 'text-emerald-400' : 
                       'text-purple-400'}`}
                  >
                     {parts[activePart].label}
                  </div>
                  <div className="text-slate-300 text-sm leading-relaxed">
                     {parts[activePart].desc}
                  </div>
               </div>
            ) : (
               <div className="text-slate-500 font-bold uppercase tracking-widest text-sm animate-pulse">
                  &lt; HOVER OVER SYMBOLS &gt;
               </div>
            )}
         </div>

      </div>

    </div>
  );
}
