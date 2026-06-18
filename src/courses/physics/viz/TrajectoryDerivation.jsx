import React, { useState } from 'react';
const STEPS = [
  { title: 'Parametric form', body: 'The trajectory is a pair of parametric equations:\n  x(t) = (v₀cosθ)t\n  y(t) = (v₀sinθ)t − ½gt²\nBoth depend on the same parameter t (time).', formula: 'x and y are both functions of t' },
  { title: 'Eliminate t', body: 'From x = (v₀cosθ)t → t = x/(v₀cosθ)\nSubstitute into y:\n  y = (v₀sinθ)·x/(v₀cosθ) − ½g·(x/(v₀cosθ))²\n  y = x·tanθ − gx²/(2v₀²cos²θ)', formula: 'y = x·tanθ − [g/(2v₀²cos²θ)] x²' },
  { title: 'It is a parabola', body: 'The equation y = ax + bx² is a downward-opening parabola. This proves that every projectile (with no air resistance) follows a parabolic arc. The coefficient of x² is negative.', formula: 'y = tanθ·x − [g/(2v₀²cos²θ)]·x²  (parabola!)' },
  { title: 'Vertex = maximum height', body: 'The peak occurs at x = v₀²sin(2θ)/(2g) = R/2.\nMaximum height H = v₀²sin²θ/(2g).\nThis follows from setting dy/dx = 0 (or dy/dt = 0).', formula: 'H = v₀²sin²θ/(2g)   at x = R/2' },
];
export default function TrajectoryDerivation() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">The Trajectory Equation</h3>
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
