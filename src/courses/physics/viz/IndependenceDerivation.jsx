import React, { useState } from 'react';

const STEPS = [
  { title: 'Decompose velocity', body: 'A launch at angle θ with speed v₀ gives:\n• Horizontal: v₀ₓ = v₀ cos θ (constant — no horizontal force)\n• Vertical: v₀ᵧ = v₀ sin θ (changes due to gravity)', formula: 'v₀ₓ = v₀cosθ   v₀ᵧ = v₀sinθ' },
  { title: 'Write each equation separately', body: 'Because x and y are independent:\n• x(t) = v₀ₓ · t = (v₀ cos θ) t\n• y(t) = v₀ᵧ t − ½gt² = (v₀ sin θ)t − ½gt²', formula: 'x(t) = (v₀cosθ)t     y(t) = (v₀sinθ)t − ½gt²' },
  { title: 'Find time of flight', body: 'Set y(t) = 0:\n(v₀sinθ)t − ½gt² = 0\nt(v₀sinθ − ½gt) = 0\n→ t = 0 (launch) or t = 2v₀sinθ/g (landing)', formula: 'T = 2v₀sinθ / g' },
  { title: 'Find range', body: 'Substitute T into x(t):\nR = (v₀cosθ) · (2v₀sinθ/g)\n  = v₀² · 2sinθcosθ / g\n  = v₀² sin(2θ) / g', formula: 'R = v₀² sin(2θ) / g   → max at θ = 45°' },
];

export default function IndependenceDerivation() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Deriving the Projectile Equations</h3>
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
