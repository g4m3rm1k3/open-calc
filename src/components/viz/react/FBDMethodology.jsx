import React, { useState } from 'react';
const STEPS=[
  {title:'Step 1: Isolate the object',body:'Draw the object alone — a dot, box, or simple shape. Remove everything it is connected to. You are about to account for those connections as forces.', formula:'Pick the object → draw it alone'},
  {title:'Step 2: Identify all forces',body:'Every force on the object is either:\n• Gravitational: W = mg downward\n• Normal force: ⊥ to surface, pushes away\n• Tension: along rope, toward anchor\n• Friction: along surface, opposing motion\n• Applied: given in the problem', formula:'W, N, T, f, F_applied'},
  {title:'Step 3: Draw force arrows',body:'Draw each force as an arrow FROM the center of the object:\n• Length ∝ magnitude\n• Direction = actual direction\nLabel each with its symbol and value if known.', formula:'Arrow from center, labeled, to scale if possible'},
  {title:'Step 4: Set up equations',body:'Newton\'s 2nd Law: ΣF = ma in each direction.\nIf equilibrium (a = 0): ΣFx = 0, ΣFy = 0.\nIf accelerating: ΣFx = max, ΣFy = may.\nSolve for unknowns.', formula:'ΣFx = max     ΣFy = may'},
];
export default function FBDMethodology(){
  const[step,setStep]=useState(0);const s=STEPS[step];
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">FBD Methodology</h3>
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
