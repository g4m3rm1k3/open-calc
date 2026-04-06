import React, { useState } from 'react';

const W=300,H=80;

export default function InequalityGeometryViz(){
  const[a,setA]=useState(-1);
  const[b,setB]=useState(2);
  const[type,setType]=useState('open');

  const lo=Math.min(a,b),hi=Math.max(a,b);
  const xMin=-5,xMax=5,scaleX=(W-40)/(xMax-xMin);
  function toX(v){return 20+(v-xMin)*scaleX;}

  const lx=toX(lo),hx=toX(hi);
  const cx=W/2,cy=H/2;
  const axisY=45;

  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Inequalities on the Number Line</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        An inequality like a &lt; x &lt; b describes a region — an interval on the number line. Open circles exclude the endpoint; filled circles include it.
      </p>
      <div className="flex gap-2 mb-3">
        {['open','closed','half'].map(t=>(
          <button key={t} onClick={()=>setType(t)}
            className={`px-3 py-1 rounded text-xs ${t===type?'bg-violet-600 text-white':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>
            {t==='open'?'Open (a < x < b)':t==='closed'?'Closed (a ≤ x ≤ b)':'Half-open (a ≤ x < b)'}
          </button>
        ))}
      </div>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          {/* axis */}
          <line x1={16} y1={axisY} x2={W-16} y2={axisY} stroke="#94a3b8" strokeWidth="2"/>
          {/* ticks */}
          {Array.from({length:11},(_,i)=>i-5).map(v=>{
            const x=toX(v);
            return(<g key={v}><line x1={x} y1={axisY-5} x2={x} y2={axisY+5} stroke="#94a3b8" strokeWidth="1.5"/><text x={x} y={axisY+16} fontSize="10" fill="#94a3b8" textAnchor="middle">{v}</text></g>);
          })}
          {/* interval fill */}
          <line x1={lx} y1={axisY} x2={hx} y2={axisY} stroke="#6366f1" strokeWidth="6" opacity="0.7"/>
          {/* left endpoint */}
          {(type==='closed'||type==='half')
            ?<circle cx={lx} cy={axisY} r="7" fill="#6366f1" stroke="white" strokeWidth="2"/>
            :<circle cx={lx} cy={axisY} r="7" fill="white" stroke="#6366f1" strokeWidth="2.5"/>
          }
          {/* right endpoint */}
          {type==='closed'
            ?<circle cx={hx} cy={axisY} r="7" fill="#6366f1" stroke="white" strokeWidth="2"/>
            :<circle cx={hx} cy={axisY} r="7" fill="white" stroke="#6366f1" strokeWidth="2.5"/>
          }
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[['a',a,setA,'#6366f1'],['b',b,setB,'#6366f1']].map(([l,v,s,c])=>(
          <div key={l} className="flex items-center gap-2">
            <span className="text-sm font-mono w-6" style={{color:c}}>{l}=</span>
            <input type="range" min="-4" max="4" step="0.5" value={v} onChange={e=>s(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/>
            <span className="text-xs font-mono w-6 text-right">{v}</span>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-3 py-2 text-sm text-center text-violet-700 dark:text-violet-300 font-mono">
        {type==='open'?`(${lo}, ${hi}) = {x : ${lo} < x < ${hi}}`:
         type==='closed'?`[${lo}, ${hi}] = {x : ${lo} ≤ x ≤ ${hi}}`:
         `[${lo}, ${hi}) = {x : ${lo} ≤ x < ${hi}}`}
      </div>
    </div>
  );
}
