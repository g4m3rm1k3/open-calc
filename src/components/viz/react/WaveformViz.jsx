import React, { useState } from 'react';

const W=320,H=180,PL=30,PB=25,PT=15,PR=15;
const PW=W-PL-PR,PH=H-PT-PB;

function toS(t,y,tMax){
  return[PL+(t/tMax)*PW, PT+PH/2-y*(PH/2-6)];
}

export default function WaveformViz(){
  const[A,setA]=useState(1);
  const[lambda,setLambda]=useState(4);
  const[T,setT]=useState(2);
  const[fixedT,setFixedT]=useState(0);
  const[fixedX,setFixedX]=useState(0);
  const[mode,setMode]=useState('snapshot');

  const k=2*Math.PI/lambda,omega=2*Math.PI/T;

  const snapPts=Array.from({length:120},(_,i)=>{
    const x=8*i/119;
    const y=A*Math.sin(k*x-omega*fixedT);
    const[sx,sy]=toS(x,y,8);
    return`${i===0?'M':'L'} ${sx} ${sy}`;
  }).join(' ');

  const histPts=Array.from({length:120},(_,i)=>{
    const t=3*T*i/119;
    const y=A*Math.sin(k*fixedX-omega*t);
    const[sx,sy]=toS(t,y,3*T);
    return`${i===0?'M':'L'} ${sx} ${sy}`;
  }).join(' ');

  const isSnap=mode==='snapshot';

  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Wave: Snapshot vs History</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        A <strong>snapshot</strong> (y vs x at fixed t) shows spatial shape — peaks λ apart. A <strong>history</strong> (y vs t at fixed x) shows oscillation — one cycle every T seconds.
      </p>
      <div className="flex gap-2 mb-3">
        {[['snapshot','Snapshot (y vs x)'],['history','History (y vs t)']].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)} className={`flex-1 py-1.5 rounded text-sm ${m===mode?'bg-violet-600 text-white':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>{l}</button>
        ))}
      </div>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <line x1={PL} y1={PT+PH/2} x2={W-PR} y2={PT+PH/2} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          <path d={isSnap?snapPts:histPts} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <text x={W-PR-4} y={PT+12} fontSize="11" fill="#6366f1" textAnchor="end">{isSnap?`t = ${fixedT.toFixed(1)}s (fixed)`:`x = ${fixedX.toFixed(1)}m (fixed)`}</text>
          <text x={PL+4} y={H-PB+16} fontSize="10" fill="#94a3b8">{isSnap?'→ x (m)':'→ t (s)'}</text>
          <text x={PL+4} y={PT+12} fontSize="10" fill="#94a3b8">A={A}</text>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono w-16 text-violet-600">A (ampl)</span>
          <input type="range" min="0.3" max="1" step="0.1" value={A} onChange={e=>setA(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/>
          <span className="text-xs font-mono w-6 text-right">{A}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono w-16 text-emerald-600">λ (m)</span>
          <input type="range" min="2" max="8" step="0.5" value={lambda} onChange={e=>setLambda(parseFloat(e.target.value))} className="flex-1 accent-emerald-500"/>
          <span className="text-xs font-mono w-6 text-right">{lambda}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono w-16 text-amber-500">T (s)</span>
          <input type="range" min="0.5" max="4" step="0.25" value={T} onChange={e=>setT(parseFloat(e.target.value))} className="flex-1 accent-amber-500"/>
          <span className="text-xs font-mono w-6 text-right">{T}</span>
        </div>
        {isSnap&&<div className="flex items-center gap-3">
          <span className="text-xs font-mono w-16 text-slate-500">t fixed</span>
          <input type="range" min="0" max={T} step="0.1" value={fixedT} onChange={e=>setFixedT(parseFloat(e.target.value))} className="flex-1 accent-slate-500"/>
          <span className="text-xs font-mono w-8 text-right">{fixedT.toFixed(1)}</span>
        </div>}
        {!isSnap&&<div className="flex items-center gap-3">
          <span className="text-xs font-mono w-16 text-slate-500">x fixed</span>
          <input type="range" min="0" max={lambda} step="0.1" value={fixedX} onChange={e=>setFixedX(parseFloat(e.target.value))} className="flex-1 accent-slate-500"/>
          <span className="text-xs font-mono w-8 text-right">{fixedX.toFixed(1)}</span>
        </div>}
      </div>
    </div>
  );
}
