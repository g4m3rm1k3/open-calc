import React, { useState } from 'react';
const STEPS=[
  {title:'Normal force and weight',body:'On a flat surface, the normal force N balances the weight W = mg:\n  ΣFy = 0: N − mg = 0 → N = mg\nOn an incline at angle θ:\n  N = mg·cosθ', formula:'N = mg (flat)     N = mg·cosθ (incline)'},
  {title:'Static friction model',body:'Static friction fs can take any value from 0 to μs·N.\nIt only applies the force needed to prevent motion.\nOnce applied force F exceeds μs·N, the object starts to slide.', formula:'fs ≤ μs·N     (fs = F as long as F ≤ μs·N)'},
  {title:'Kinetic friction model',body:'Once sliding, kinetic friction applies:\n  fk = μk·N\nThis is constant regardless of speed (simplified model).\nTypically μk < μs — harder to start than to keep moving.', formula:'fk = μk·N     (μk < μs in general)'},
  {title:'Inclined plane',body:'On incline at angle θ:\n  Along slope: F_applied − mg·sinθ − μk·mg·cosθ = ma\n  Normal: N = mg·cosθ\nCritical angle: object slides when tanθ > μs', formula:'a = F/m − g·sinθ − μk·g·cosθ'},
];
export default function FrictionDerivation(){
  const[step,setStep]=useState(0);const s=STEPS[step];
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Friction: The Model</h3>
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
