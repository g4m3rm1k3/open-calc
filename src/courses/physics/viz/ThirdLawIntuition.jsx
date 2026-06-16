import React, { useState } from 'react';
const W=320,H=200;
function Arrow({x1,y1,x2,y2,color,label,width=2.5}){const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<2)return null;const ux=dx/len,uy=dy/len,hl=9,hx=x2-ux*hl,hy=y2-uy*hl,px=-uy*5,py=ux*5;return<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round"/><polygon points={`${x2},${y2} ${hx+px},${hy+py} ${hx-px},${hy-py}`} fill={color}/>{label&&<text x={x2+ux*16} y={y2+uy*16} fontSize="11" fill={color} fontWeight="600" textAnchor="middle">{label}</text>}</g>;}
const SCENARIOS=[
  {name:'Push on wall',F:120,labelA:'You push wall →',labelB:'← Wall pushes you',colorA:'#6366f1',colorB:'#ef4444'},
  {name:'Book on table',F:80,labelA:'Book pushes table ↓',labelB:'↑ Table pushes book',colorA:'#10b981',colorB:'#f59e0b'},
  {name:'Rocket thrust',F:200,labelA:'Gas pushed back →',labelB:'← Rocket pushed fwd',colorA:'#6366f1',colorB:'#ef4444'},
];
export default function ThirdLawIntuition(){
  const[si,setSi]=useState(0);const[F,setF]=useState(120);const sc=SCENARIOS[si];
  const scale=Math.min(F*0.5,120);
  const cx=W/2,cy=H/2;
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Newton's Third Law: Action-Reaction</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Every action force has an equal and opposite reaction force. The two forces act on <em>different</em> objects — they never cancel each other.</p>
      <div className="flex gap-2 mb-3 flex-wrap">{SCENARIOS.map((s,i)=><button key={i} onClick={()=>{setSi(i);setF(s.F);}} className={`px-3 py-1 rounded-lg text-xs font-semibold border ${i===si?'bg-violet-600 text-white border-violet-600':'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>{s.name}</button>)}</div>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          {/* Object A */}
          <rect x={cx-90} y={cy-22} width={44} height={44} fill={sc.colorA} rx="6" opacity="0.85"/>
          <text x={cx-68} y={cy+5} fontSize="10" fill="white" textAnchor="middle" fontWeight="700">A</text>
          {/* Object B */}
          <rect x={cx+46} y={cy-22} width={44} height={44} fill={sc.colorB} rx="6" opacity="0.85"/>
          <text x={cx+68} y={cy+5} fontSize="10" fill="white" textAnchor="middle" fontWeight="700">B</text>
          {/* Action arrow: A→B */}
          <Arrow x1={cx-46} y1={cy-8} x2={cx+40} y2={cy-8} color={sc.colorA} label={`F=${F}N`}/>
          {/* Reaction arrow: B→A */}
          <Arrow x1={cx+46} y1={cy+8} x2={cx-46} y2={cy+8} color={sc.colorB} label={`${F}N`}/>
          <text x={cx} y={H-12} fontSize="10" fill="#94a3b8" textAnchor="middle">{sc.labelA} / {sc.labelB}</text>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-20 text-violet-600">Force (N)</span><input type="range" min="20" max="250" step="5" value={F} onChange={e=>setF(parseInt(e.target.value))} className="flex-1 accent-violet-500"/><span className="text-xs font-mono w-10 text-right">{F}N</span></div>
      </div>
      <div className="mt-3 font-mono text-xs text-center text-slate-500">F_AB = −F_BA = {F}N &nbsp;|&nbsp; same magnitude, opposite direction, different objects</div>
    </div>
  );
}
