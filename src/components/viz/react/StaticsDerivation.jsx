import React, { useState } from 'react';
const STEPS=[
  {title:'Step 1: Two equilibrium conditions',body:'For a rigid body in static equilibrium, both Newton\'s laws must hold:\n  ΣF = 0 (no net force — object does not accelerate)\n  Στ = 0 (no net torque — object does not rotate)\nThese are independent: an object can satisfy ΣF=0 but still spin.', formula:'ΣF = 0     AND     Στ = 0'},
  {title:'Step 2: Choose a pivot point',body:'You can take torques about any point — the equations still hold.\nSmart choice: put the pivot at an unknown force.\nThat force produces zero torque and drops from the torque equation.\nThis lets you solve for the other unknowns first.', formula:'τ = r × F = r·F·sinθ'},
  {title:'Step 3: Sign convention for torques',body:'Counter-clockwise (CCW) torque → positive.\nClockwise (CW) torque → negative.\nFor a force F at distance d from pivot, perpendicular:\n  τ = +F·d  (CCW)   or   τ = −F·d  (CW)', formula:'Στ_CCW − Στ_CW = 0'},
  {title:'Step 4: Solve beam example',body:'Beam of length L, weight W at distance d from left.\nPivot at left support (R₁ drops out):\n  Στ = 0: R₂·L − W·d = 0\n  → R₂ = W·d/L\nThen ΣF = 0: R₁ + R₂ = W → R₁ = W − R₂', formula:'R₂ = Wd/L     R₁ = W(L−d)/L'},
];
export default function StaticsDerivation(){
  const[step,setStep]=useState(0);const s=STEPS[step];
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Statics: Equilibrium Derivation</h3>
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
