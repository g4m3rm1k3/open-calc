import React, { useState } from 'react';
const EXAMPLES=[
  {original:'∀x P(x)',negation:'∃x ¬P(x)',rule:'Flip ∀→∃ and negate the body',english:'Not every x satisfies P → there exists some x that does not satisfy P'},
  {original:'∃x P(x)',negation:'∀x ¬P(x)',rule:'Flip ∃→∀ and negate the body',english:'Nothing satisfies P → every x fails to satisfy P'},
  {original:'∀x ∃y P(x,y)',negation:'∃x ∀y ¬P(x,y)',rule:'Push ¬ through each quantifier, flipping as you go',english:'For some x, no y satisfies P(x,y)'},
  {original:'∃x ∀y P(x,y)',negation:'∀x ∃y ¬P(x,y)',rule:'Push ¬ through: ∃→∀ first, then ∀→∃',english:'For every x, some y fails P(x,y)'},
  {original:'∀x (P(x) → Q(x))',negation:'∃x (P(x) ∧ ¬Q(x))',rule:'¬(P→Q) ≡ P∧¬Q; then flip ∀→∃',english:'Some x satisfies P but not Q'},
];
export default function QuantifierNegationPusher(){
  const[idx,setIdx]=useState(0);const[showNeg,setShowNeg]=useState(false);const e=EXAMPLES[idx];
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Quantifier Negation</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Negation pushes through quantifiers: ¬∀ becomes ∃¬, and ¬∃ becomes ∀¬. Click through examples to practice.</p>
      <div className="flex gap-1 mb-3">{EXAMPLES.map((_,i)=><button key={i} onClick={()=>{setIdx(i);setShowNeg(false);}} className={`h-1.5 flex-1 rounded-full ${i===idx?'bg-violet-500':i<idx?'bg-violet-300 dark:bg-violet-700':'bg-slate-200 dark:bg-slate-700'}`}/>)}</div>
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3 space-y-3">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Original statement</p>
          <p className="font-mono text-lg text-violet-600 dark:text-violet-400">{e.original}</p>
        </div>
        <button onClick={()=>setShowNeg(v=>!v)} className={`w-full py-2 rounded-lg text-sm font-semibold border transition-colors ${showNeg?'bg-violet-600 text-white border-violet-600':'bg-white dark:bg-slate-800 border-violet-400 text-violet-600'}`}>
          {showNeg?'Hide negation':'Reveal ¬( ) →'}
        </button>
        {showNeg&&(
          <div className="space-y-2 animate-pulse-once">
            <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Negation</p><p className="font-mono text-lg text-emerald-600 dark:text-emerald-400">{e.negation}</p></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Rule applied</p><p className="text-sm text-slate-700 dark:text-slate-300">{e.rule}</p></div>
            <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">In plain English</p><p className="text-sm text-slate-600 dark:text-slate-400 italic">{e.english}</p></div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={()=>{setIdx(Math.max(0,idx-1));setShowNeg(false);}} disabled={idx===0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30">← Prev</button>
        <button onClick={()=>{setIdx(Math.min(EXAMPLES.length-1,idx+1));setShowNeg(false);}} disabled={idx===EXAMPLES.length-1} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}
