import React, { useState } from 'react';
const STRATEGIES=[
  {name:'Direct proof',color:'#6366f1',when:'The statement is of the form P → Q.',how:'Assume P is true. Use definitions, algebra, and known theorems to conclude Q is true.',example:'Prove: if n is even, then n² is even.\nLet n = 2k. Then n² = 4k² = 2(2k²). So n² is even. ✓'},
  {name:'Proof by contradiction',color:'#ef4444',when:'The negation is easier to work with, or you need to show something is impossible.',how:'Assume ¬Q (the conclusion is false). Derive a contradiction — something that contradicts P or a known fact.',example:'Prove: √2 is irrational.\nAssume √2 = p/q in lowest terms. Then 2q² = p², so p is even…\nEventually q is also even — contradicts "lowest terms". ✓'},
  {name:'Proof by contrapositive',color:'#f59e0b',when:'The contrapositive ¬Q → ¬P looks easier than P → Q.',how:'Prove the logically equivalent statement: if Q is false, then P is false.\nOften cleaner when Q has a concrete negation.',example:'Prove: if n² is odd, then n is odd.\nContrapositive: if n is even, then n² is even.\nLet n = 2k → n² = 4k² = 2(2k²), which is even. ✓'},
  {name:'Mathematical induction',color:'#10b981',when:'The statement involves a natural number n and holds for all n ≥ base.',how:'Base case: prove P(n₀) is true.\nInductive step: assume P(k) true (inductive hypothesis). Prove P(k+1) true.',example:'Prove: Σᵢ₌₁ⁿ i = n(n+1)/2.\nBase: n=1: 1 = 1(2)/2 = 1 ✓\nStep: assume true for k, add (k+1):\n  k(k+1)/2 + (k+1) = (k+1)(k+2)/2 ✓'},
];
export default function ProofStrategySelector(){
  const[sel,setSel]=useState(null);const s=sel!==null?STRATEGIES[sel]:null;
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Proof Strategy Selector</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Choose a proof technique to see when to use it and how it works.</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {STRATEGIES.map((st,i)=>(
          <button key={i} onClick={()=>setSel(i===sel?null:i)} style={{borderColor:st.color,background:i===sel?st.color:'transparent',color:i===sel?'white':st.color}} className="rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors">{st.name}</button>
        ))}
      </div>
      {s?(
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 space-y-2">
          <div><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">When to use</span><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{s.when}</p></div>
          <div><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">How it works</span><p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{s.how}</p></div>
          <div><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Example</span><pre className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900 rounded p-2">{s.example}</pre></div>
        </div>
      ):(
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-slate-400 text-sm">Select a strategy above to explore it</div>
      )}
    </div>
  );
}
