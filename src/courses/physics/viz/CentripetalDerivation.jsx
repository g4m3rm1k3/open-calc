import React, { useState } from 'react';
const STEPS=[
  {title:'Velocity changes direction',body:'Even at constant speed, circular motion has acceleration because velocity direction changes. Acceleration = rate of change of velocity vector, not just speed.', formula:'a⃗ = Δv⃗/Δt  (vector change, not scalar)'},
  {title:'Geometry of velocity change',body:'Over a small angle Δθ, the velocity vector rotates by Δθ.\nThe change in velocity |Δv| ≈ v·Δθ (arc length on velocity circle).\nDividing by Δt: |a| = v·(Δθ/Δt) = v·ω', formula:'|Δv⃗| ≈ v·Δθ  →  |a| = v·ω'},
  {title:'Using v = ωr',body:'The speed v = ωr (tangential velocity).\nSubstituting:\n  a = v·ω = (ωr)·ω = ω²r\nOr equivalently: a = v²/r', formula:'aₓ = ω²r = v²/r'},
  {title:'Direction: toward center',body:'By symmetry, as Δθ→0, the Δv vector points radially inward — toward the center. So centripetal acceleration always points toward the center of the circle.', formula:'a⃗ = (v²/r) r̂_inward = ω²r r̂_inward'},
];
export default function CentripetalDerivation(){
  const[step,setStep]=useState(0);const s=STEPS[step];
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Deriving aₓ = v²/r</h3>
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
