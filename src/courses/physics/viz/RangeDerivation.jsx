import React, { useState } from 'react';
const STEPS=[
  {title:'Range = horizontal velocity × time of flight',body:'Horizontal motion is constant (no air resistance):\n  x(t) = v₀ₓ · t = (v₀cosθ)t\nAt landing, x = R:\n  R = (v₀cosθ) · T', formula:'R = (v₀cosθ) · T'},
  {title:'Substitute T = 2v₀sinθ/g',body:'We found T = 2v₀sinθ/g earlier.\nSubstituting:\n  R = (v₀cosθ) · (2v₀sinθ/g)\n  R = 2v₀²sinθcosθ/g', formula:'R = 2v₀²sinθcosθ / g'},
  {title:'Apply double-angle identity',body:'Using the identity: 2sinθcosθ = sin(2θ)\nWe get the compact range formula:\n  R = v₀²sin(2θ)/g\nMaximum when sin(2θ) = 1 → 2θ = 90° → θ = 45°.', formula:'R = v₀²sin(2θ) / g   → max at θ = 45°'},
  {title:'Complementary angles have equal range',body:'sin(2θ) = sin(180°−2θ) = sin(2(90°−θ))\nSo θ and 90°−θ give the same range!\nExample: 30° and 60° both give R = v₀²sin(60°)/g.', formula:'R(θ) = R(90°−θ)  — complementary angles, same range'},
];
export default function RangeDerivation(){
  const[step,setStep]=useState(0);const s=STEPS[step];
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Deriving the Range Formula</h3>
      <div className="flex gap-1 mb-3">{STEPS.map((_,i)=><button key={i} onClick={()=>setStep(i)} className={`h-1.5 flex-1 rounded-full ${i===step?'bg-violet-500':i<step?'bg-violet-300 dark:bg-violet-700':'bg-slate-200 dark:bg-slate-700'}`}/>)}</div>
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
        <p className="font-semibold text-violet-600 dark:text-violet-400 mb-2">{s.title}</p>
        <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{s.body}</pre>
        <p className="mt-2 font-mono text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center">{s.formula}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30">← Back</button>
        <button onClick={()=>setStep(Math.min(STEPS.length-1,step+1))} disabled={step===STEPS.length-1} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}
