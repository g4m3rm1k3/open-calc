import React, { useState } from 'react';

const W=300,H=260,CX=150,CY=130,SC=45;
function toS(x,y){return[CX+x*SC,CY-y*SC];}

const FUNCTIONS=[
  {label:'x² (even)',fn:x=>x*x,sym:'even',note:'f(-x) = f(x): y-axis symmetry'},
  {label:'x³ (odd)',fn:x=>x*x*x/4,sym:'odd',note:'f(-x) = -f(x): origin symmetry'},
  {label:'|x| (even)',fn:x=>Math.abs(x),sym:'even',note:'f(-x) = f(x): y-axis symmetry'},
  {label:'sin x (odd)',fn:x=>Math.sin(x),sym:'odd',note:'f(-x) = -f(x): origin symmetry'},
  {label:'x²+x (neither)',fn:x=>x*x*0.4+x*0.5,sym:'none',note:'No symmetry — f(-x) ≠ f(x) and ≠ -f(x)'},
];

export default function SymmetryViz(){
  const[fi,setFi]=useState(0);
  const[xTest,setXTest]=useState(1.5);
  const{fn,sym,note}=FUNCTIONS[fi];

  const pts=Array.from({length:120},(_,i)=>{
    const x=-3+6*i/119;
    const[sx,sy]=toS(x,fn(x));
    if(sy<5||sy>H-10)return null;
    return`${sx},${sy}`;
  }).filter(Boolean).join(' ');

  const[tx,ty]=toS(xTest,fn(xTest));
  const[ntx,nty]=toS(-xTest,fn(-xTest));
  const[ntox,ntoy]=toS(-xTest,-fn(-xTest));

  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Even, Odd, or Neither</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Select a function. The gold dot is (x, f(x)). See where f(-x) lands. Even functions mirror in y-axis; odd rotate 180° about origin.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {FUNCTIONS.map((f,i)=>(
          <button key={i} onClick={()=>setFi(i)}
            className={`px-2 py-1 rounded text-xs ${i===fi?'bg-violet-600 text-white':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          {[-2,-1,1,2].map(i=>{
            const[sx]=toS(i,0);const[,sy]=toS(0,i);
            return(<g key={i}><line x1={sx} y1={10} x2={sx} y2={H-10} stroke="#e2e8f0" strokeWidth="1"/><line x1={10} y1={sy} x2={W-10} y2={sy} stroke="#e2e8f0" strokeWidth="1"/></g>);
          })}
          <line x1={CX} y1={10} x2={CX} y2={H-10} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={10} y1={CY} x2={W-10} y2={CY} stroke="#94a3b8" strokeWidth="1.5"/>
          <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* x test point */}
          <circle cx={tx} cy={ty} r="6" fill="#f59e0b"/>
          <text x={tx+8} y={ty-6} fontSize="11" fill="#f59e0b" fontWeight="600">f({xTest.toFixed(1)})</text>
          {/* f(-x) */}
          <circle cx={ntx} cy={nty} r="6" fill="#10b981"/>
          <text x={ntx-8} y={nty-6} fontSize="11" fill="#10b981" fontWeight="600" textAnchor="end">f({(-xTest).toFixed(1)})</text>
          {/* -f(-x) for odd */}
          {sym==='odd'&&<circle cx={ntox} cy={ntoy} r="4" fill="#ef4444" stroke="white" strokeWidth="1.5"/>}
        </svg>
      </div>
      <div className="flex items-center gap-3 mb-3 px-1">
        <span className="text-sm font-mono w-8 text-amber-500">x =</span>
        <input type="range" min="0.2" max="2.5" step="0.1" value={xTest} onChange={e=>setXTest(parseFloat(e.target.value))} className="flex-1 accent-amber-500"/>
        <span className="text-xs font-mono w-10 text-right">{xTest.toFixed(1)}</span>
      </div>
      <div className={`rounded-lg px-3 py-2 text-sm text-center font-semibold border ${
        sym==='even'?'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300':
        sym==='odd'?'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300':
        'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
      }`}>{note}</div>
    </div>
  );
}
