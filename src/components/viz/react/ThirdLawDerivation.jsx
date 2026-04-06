import React, { useState } from 'react';
const STEPS=[
  {title:'Statement of Newton\'s Third Law',body:'For every force that object A exerts on object B, object B exerts a force on object A that is:\n  • Equal in magnitude\n  • Opposite in direction\n  • On a different object (A, not B)\nThis is sometimes called the action-reaction pair.', formula:'F_AB = −F_BA'},
  {title:'Why the forces don\'t cancel',body:'Students often ask: if F_AB = −F_BA, don\'t they cancel?\nNo! Forces cancel only when they act on the same object.\nΣF for object A = all forces ON A.\nΣF for object B = all forces ON B.\nF_AB acts on B. F_BA acts on A. They live in different ΣF equations.', formula:'ΣF_A includes F_BA,   ΣF_B includes F_AB'},
  {title:'Consequence: momentum conservation',body:'Apply Newton\'s 2nd law to each object:\n  F_AB = m_B · a_B\n  F_BA = m_A · a_A\nSince F_AB = −F_BA:\n  m_B · a_B = −m_A · a_A\n  m_A · a_A + m_B · a_B = 0\n  d/dt (p_A + p_B) = 0 → total momentum conserved.', formula:'Δp_A + Δp_B = 0'},
  {title:'Example: gun recoil',body:'Bullet mass m = 0.01 kg, fired at v = 900 m/s.\nGun mass M = 3 kg.\nMomentum conservation:\n  0 = m·v + M·V\n  V = −m·v/M = −(0.01)(900)/3 = −3 m/s\nGun recoils at 3 m/s backward.', formula:'V = −mv/M = −3 m/s'},
];
export default function ThirdLawDerivation(){
  const[step,setStep]=useState(0);const s=STEPS[step];
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Third Law: Derivation & Consequences</h3>
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
