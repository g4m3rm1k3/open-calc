import React, { useState } from 'react';
const STEPS=[
  {title:'Empirical observation → law',body:'Newton observed that for a given object:\n  • Larger net force → larger acceleration\n  • Heavier object → smaller acceleration for same force\nThis gives: a ∝ F and a ∝ 1/m\nCombining: a = F_net / m, or equivalently F_net = ma.', formula:'F_net = ma'},
  {title:'What "net force" means',body:'The net force is the vector sum of ALL forces on the object:\n  F_net = F₁ + F₂ + F₃ + …\nYou must include every force and add them as vectors.\nThe acceleration is in the direction of F_net.', formula:'F_net = ΣF (vector sum)     a = ΣF / m'},
  {title:'Component form',body:'In 2D/3D, apply Newton\'s 2nd law separately in each direction:\n  ΣFx = max\n  ΣFy = may\n  ΣFz = maz\nEach component equation is independent. Solve them separately.', formula:'ΣFx = max     ΣFy = may'},
  {title:'Units and checks',body:'Force is measured in Newtons: 1 N = 1 kg·m/s²\nThis follows from F = ma:\n  [N] = [kg]·[m/s²]\nDimension check is always a good sanity test.\nAlso check direction: a should point in the direction of ΣF.', formula:'1 N = 1 kg·m/s²'},
];
export default function SecondLawDerivation(){
  const[step,setStep]=useState(0);const s=STEPS[step];
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Newton's Second Law: F = ma</h3>
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
