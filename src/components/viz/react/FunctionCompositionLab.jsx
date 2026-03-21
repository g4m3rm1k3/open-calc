import React, { useState } from 'react';

export default function FunctionCompositionLab() {
  const [inputX, setInputX] = useState(5);
  const [order, setOrder] = useState('g_o_f'); // 'g_o_f' = g(f(x)) or 'f_o_g' = f(g(x))

  // f(x) = Assemble (Machine 1): mathematically say x^2
  // g(x) = Paint (Machine 2): mathematically say x + 10

  const runF = (val) => val * val;
  const runG = (val) => val + 10;

  // Assembly line logic
  const step1 = order === 'g_o_f' ? runF(inputX) : runG(inputX);
  const step2 = order === 'g_o_f' ? runG(step1) : runF(step1);

  const fLabel = "Machine f(x): Square It";
  const gLabel = "Machine g(x): Add 10";

  const firstMachine = order === 'g_o_f' ? { name: 'f', color: 'brand', label: fLabel } : { name: 'g', color: 'emerald', label: gLabel };
  const secondMachine = order === 'g_o_f' ? { name: 'g', color: 'emerald', label: gLabel } : { name: 'f', color: 'brand', label: fLabel };

  return (
    <div className="w-full bg-slate-900 rounded-xl border border-slate-700 shadow-md p-6 flex flex-col items-center">
      
      <div className="text-center mb-6">
        <h3 className="text-white font-bold text-xl mb-1">The Assembly Line (Composition)</h3>
        <p className="text-slate-400 text-sm">Strictly order matters: Assembling a toy then painting it is perfectly fine. Painting raw plastic then assembling it creates a mess!</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-800 rounded-md border border-slate-600 overflow-hidden mb-12 w-full max-w-sm">
        <button 
           onClick={() => setOrder('g_o_f')}
           className={`flex-1 py-3 text-sm font-bold font-mono transition-colors ${order === 'g_o_f' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          g ∘ f (Evaluate f first)
        </button>
        <button 
           onClick={() => setOrder('f_o_g')}
           className={`flex-1 py-3 text-sm font-bold font-mono transition-colors ${order === 'f_o_g' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          f ∘ g (Evaluate g first)
        </button>
      </div>

      {/* Conveyor Belt Framework */}
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl relative">
         
         {/* Input Box */}
         <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-1">RAW INPUT (x)</span>
            <input 
              type="number" 
              value={inputX}
              onChange={(e) => setInputX(Number(e.target.value))}
              className="w-20 text-center bg-slate-800 text-white font-mono font-bold text-2xl py-2 rounded-lg border-2 border-slate-600 focus:border-amber-400 outline-none"
            />
         </div>

         <div className="h-6 border-l-4 border-dashed border-slate-600 animate-pulse"></div>

         {/* Machine 1 */}
         <div className={`w-64 py-4 px-6 rounded-xl flex flex-col items-center border-[3px] shadow-[0_0_20px_inset] transition-all duration-500 ${firstMachine.color === 'brand' ? 'bg-sky-900/40 border-sky-400 shadow-sky-500/20' : 'bg-emerald-900/40 border-emerald-400 shadow-emerald-500/20'}`}>
             <span className={`text-xl font-bold ${firstMachine.color === 'brand' ? 'text-sky-300' : 'text-emerald-300'} font-mono`}>{firstMachine.label}</span>
         </div>

         <div className="flex items-center gap-4">
             <span className="text-sm font-bold text-slate-500">INTERMEDIATE STATE:</span>
             <div className="bg-slate-800 px-4 py-1 rounded font-mono font-bold text-white border border-slate-600 shadow-inner">
                {step1}
             </div>
         </div>

         <div className="h-6 border-l-4 border-dashed border-slate-600 animate-pulse"></div>

         {/* Machine 2 */}
         <div className={`w-64 py-4 px-6 rounded-xl flex flex-col items-center border-[3px] shadow-[0_0_20px_inset] transition-all duration-500 ${secondMachine.color === 'brand' ? 'bg-sky-900/40 border-sky-400 shadow-sky-500/20' : 'bg-emerald-900/40 border-emerald-400 shadow-emerald-500/20'}`}>
             <span className={`text-xl font-bold ${secondMachine.color === 'brand' ? 'text-sky-300' : 'text-emerald-300'} font-mono`}>{secondMachine.label}</span>
         </div>

         <div className="h-6 border-l-4 border-dashed border-slate-600 animate-pulse"></div>

         {/* Output Box */}
         <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-500 mb-1">FINAL OUTPUT {order === 'g_o_f' ? 'g(f(x))' : 'f(g(x))'}</span>
            <div className="w-32 text-center bg-slate-950 text-white font-mono font-bold text-3xl py-3 rounded-xl border-4 border-amber-500 shadow-[0_0_20px_#fbbf24]">
               {isNaN(step2) ? 'Err' : step2}
            </div>
         </div>

      </div>

      <div className="mt-10 max-w-lg text-center text-sm font-medium text-slate-400">
         Notice that <strong className="text-white">g(f(x))</strong> produced a completely different answer than <strong className="text-white">f(g(x))</strong>. Function composition is strictly <strong>Not Commutative</strong>! The order of operations perfectly dictates the reality of the machine.
      </div>
      
    </div>
  );
}
