import React, { useState } from 'react';
import { parseProse } from '../../math/parseProse.jsx';

export default function InductionAlgebraDecoderLab() {
  const [substituted, setSubstituted] = useState(false);

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6">
      
      <div className="text-center mb-8">
        <h3 className="text-white font-bold text-xl mb-1 mt-0">The Core "Aha!" Mechanical Substitution</h3>
        <p className="text-slate-400 text-sm flex items-center justify-center gap-1">Watch the exact moment the <strong className="text-amber-400 flex items-center gap-1">Inductive Hypothesis {parseProse("$P(k)$")}</strong> is strictly injected into the algebra of {parseProse("$P(k+1)$")} to physically force the gap closed.</p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-lg border-2 border-slate-800 relative min-h-[160px]">
         
         {/* The Main Equation Line */}
         <div className="flex items-center text-xl md:text-3xl font-serif text-white whitespace-nowrap overflow-x-auto w-full justify-center">
            
            <span className="text-slate-400 mr-4">Target:</span>
            <span>$P(k+1) =$ </span>
            
            {/* The Target Substitution Block */}
            <div className={`mx-2 px-2 py-1 border-b-2 transition-all duration-700 relative w-48 text-center flex items-center justify-center cursor-pointer hover:bg-slate-800 rounded
               ${substituted ? 'border-emerald-500 scale-110' : 'border-amber-500 hover:scale-105'}`}
               onClick={() => setSubstituted(true)}
            >
               {/* Label above */}
               <span className={`absolute -top-6 text-[10px] font-sans font-bold tracking-widest transition-colors duration-500 uppercase ${substituted ? 'text-emerald-400' : 'text-amber-500 animate-pulse'}`}>
                  {substituted ? 'IH Successfully Injected' : 'Click to Inject P(k)'}
               </span>

               {/* The Math */}
               <div className="relative w-full h-8 flex items-center justify-center">
                  <span className={`absolute transition-all duration-700 transform ${substituted ? 'opacity-0 scale-50 -translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                     {parseProse("$1 + 2 + \\dots + k$")}
                  </span>
                  <span className={`absolute transition-all duration-700 transform ${substituted ? 'opacity-100 scale-100 translate-y-0 text-emerald-400 font-bold' : 'opacity-0 scale-150 translate-y-4 text-transparent'}`}>
                     {parseProse("$\\frac{k(k+1)}{2}$")}
                  </span>
               </div>
            </div>

            <span className="text-brand-400 ml-2">
               {parseProse("$+ (k+1)$")}
            </span>
            
         </div>

         {/* Explainer tooltip that appears after substitution */}
         <div className={`mt-8 text-sm font-medium transition-all duration-700 max-w-lg text-center flex flex-col items-center justify-center gap-1 ${substituted ? 'opacity-100 translate-y-0 text-emerald-300' : 'opacity-0 translate-y-4 text-transparent'}`}>
            <strong>Boom. The Gap is Closed!</strong> 
            <span>We swapped out the massive infinite sequence for the exact fraction we already assumed was true <strong className="text-white ml-1">{parseProse("$P(k)$")}</strong>. Now, the problem is incredibly basic elementary algebra!</span>
         </div>

      </div>

      <div className="flex justify-center mt-6">
         <button 
           onClick={() => setSubstituted(!substituted)}
           className={`px-8 py-2 rounded font-bold uppercase transition-all duration-300 text-xs shadow-md ${substituted ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-amber-600 hover:bg-amber-500 text-amber-950 shadow-[0_0_15px_#f59e0b]'}`}
         >
           {substituted ? 'Reset Simulation' : 'Execute Injection'}
         </button>
      </div>

    </div>
  );
}
