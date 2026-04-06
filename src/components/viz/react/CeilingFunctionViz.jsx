import React, { useState } from 'react';

const W=300,H=220,PL=40,PB=30,PT=20,PR=20;
const PW=W-PL-PR,PH=H-PT-PB;
const X0=-3.5,X1=3.5;

function toS(x,y){
  const px=PL+(x-X0)/(X1-X0)*PW;
  const py=PT+PH-((y+4)/(9))*PH;
  return[px,py];
}

export default function CeilingFunctionViz(){
  const[x,setX]=useState(1.7);
  const[mode,setMode]=useState('ceil');

  const ceil=Math.ceil(x);
  const floor=Math.floor(x);
  const result=mode==='ceil'?ceil:floor;

  const segments=[];
  for(let n=-4;n<=4;n++){
    const x0=n,x1=n+1;
    const y=mode==='ceil'?n+1:n;
    const[sx0]=toS(x0,y);const[sx1,sy]=toS(x1,y);
    segments.push({x0:sx0,x1:sx1,sy,openLeft:true,openRight:false,y});
  }

  const[dotX,dotY]=toS(x,result);
  const[rawX,rawY]=toS(x,x);

  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Floor &amp; Ceiling Functions</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        ⌈x⌉ = smallest integer ≥ x (ceiling). ⌊x⌋ = largest integer ≤ x (floor). Both produce staircase step functions — not continuous.
      </p>
      <div className="flex gap-2 mb-3">
        {[['ceil','⌈x⌉ Ceiling'],['floor','⌊x⌋ Floor']].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)} className={`flex-1 py-1.5 rounded text-sm font-mono ${m===mode?'bg-violet-600 text-white':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>{l}</button>
        ))}
      </div>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          {[-3,-2,-1,0,1,2,3].map(i=>{
            const[sx]=toS(i,0);const[,sy]=toS(0,i);
            return(<g key={i}><line x1={sx} y1={PT} x2={sx} y2={H-PB} stroke="#e2e8f0" strokeWidth="1"/><line x1={PL} y1={sy} x2={W-PR} y2={sy} stroke="#e2e8f0" strokeWidth="1"/><text x={sx} y={H-PB+14} fontSize="10" fill="#94a3b8" textAnchor="middle">{i}</text><text x={PL-6} y={sy+4} fontSize="10" fill="#94a3b8" textAnchor="end">{i}</text></g>);
          })}
          <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={PL} y1={H-PB-(4/(9))*PH} x2={W-PR} y2={H-PB-(4/(9))*PH} stroke="#94a3b8" strokeWidth="1.5"/>
          {/* y=x dashed reference */}
          <line x1={toS(X0,X0)[0]} y1={toS(X0,X0)[1]} x2={toS(X1,X1)[0]} y2={toS(X1,X1)[1]} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4"/>
          {/* Steps */}
          {segments.map((seg,i)=>(
            <g key={i}>
              <line x1={seg.x0} y1={seg.sy} x2={seg.x1} y2={seg.sy} stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx={mode==='ceil'?seg.x1:seg.x0} cy={seg.sy} r="4" fill="#6366f1"/>
              <circle cx={mode==='ceil'?seg.x0:seg.x1} cy={seg.sy} r="4" fill="white" stroke="#6366f1" strokeWidth="2"/>
            </g>
          ))}
          {/* Current x */}
          <line x1={rawX} y1={rawY} x2={dotX} y2={dotY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3"/>
          <circle cx={rawX} cy={rawY} r="4" fill="#94a3b8"/>
          <circle cx={dotX} cy={dotY} r="7" fill="#f59e0b" stroke="white" strokeWidth="2"/>
          <text x={dotX+10} y={dotY-6} fontSize="12" fill="#f59e0b" fontWeight="700">{result}</text>
        </svg>
      </div>
      <div className="flex items-center gap-3 mb-3 px-1">
        <span className="text-sm font-mono w-8 text-violet-600">x =</span>
        <input type="range" min="-3" max="3" step="0.05" value={x} onChange={e=>setX(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/>
        <span className="text-xs font-mono w-12 text-right">{x.toFixed(2)}</span>
      </div>
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-3 py-2 text-sm text-center font-mono text-violet-700 dark:text-violet-300">
        {mode==='ceil'?`⌈${x.toFixed(2)}⌉ = ${result}`:`⌊${x.toFixed(2)}⌋ = ${result}`}
      </div>
    </div>
  );
}
