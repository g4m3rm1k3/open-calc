import React, { useState } from 'react';
function Arrow({x1,y1,x2,y2,color,width=2.5}){const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<2)return null;const ux=dx/len,uy=dy/len,hl=9,hx=x2-ux*hl,hy=y2-uy*hl,px=-uy*5,py=ux*5;return<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round"/><polygon points={`${x2},${y2} ${hx+px},${hy+py} ${hx-px},${hy-py}`} fill={color}/></g>;}
const W=300,H=180;
export default function FrictionIntuition(){
  const[mass,setMass]=useState(5);const[mu,setMu]=useState(0.4);const[F,setF]=useState(15);
  const g=9.8,N=mass*g,fMax=mu*N,a=(F-fMax)/mass;
  const moving=F>fMax;
  const fActual=moving?fMax:F;
  const blockX=80,blockY=100,blockW=60,blockH=40;
  const Fscale=Math.min(F/50*100,90),fscale=Math.min(fActual/50*100,80),Nscale=Math.min(N/100*60,70),Wscale=Math.min(N/100*60,70);
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Friction: Static vs Kinetic</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Friction opposes motion. Static friction can be anywhere from 0 to μN. Once you exceed μN, kinetic friction kicks in and the object accelerates.</p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <line x1={20} y1={blockY+blockH} x2={W-20} y2={blockY+blockH} stroke="#94a3b8" strokeWidth="3"/>
          <rect x={blockX} y={blockY} width={blockW} height={blockH} fill={moving?'#f59e0b':'#6366f1'} rx="4"/>
          <text x={blockX+blockW/2} y={blockY+blockH/2+4} fontSize="11" fill="white" fontWeight="600" textAnchor="middle">{mass}kg</text>
          <Arrow x1={blockX} y1={blockY+blockH/2} x2={blockX-fscale} y2={blockY+blockH/2} color="#ef4444"/>
          <text x={blockX-fscale-4} y={blockY+blockH/2-6} fontSize="10" fill="#ef4444" textAnchor="end">f={fActual.toFixed(1)}N</text>
          <Arrow x1={blockX+blockW} y1={blockY+blockH/2} x2={blockX+blockW+Fscale} y2={blockY+blockH/2} color="#10b981"/>
          <text x={blockX+blockW+Fscale+4} y={blockY+blockH/2-6} fontSize="10" fill="#10b981">F={F.toFixed(0)}N</text>
          <Arrow x1={blockX+blockW/2} y1={blockY} x2={blockX+blockW/2} y2={blockY-Nscale} color="#6366f1"/>
          <text x={blockX+blockW/2+4} y={blockY-Nscale-4} fontSize="10" fill="#6366f1">N={N.toFixed(0)}N</text>
          <Arrow x1={blockX+blockW/2} y1={blockY+blockH} x2={blockX+blockW/2} y2={blockY+blockH+Wscale} color="#94a3b8"/>
          <text x={blockX+blockW/2+4} y={blockY+blockH+Wscale+14} fontSize="10" fill="#94a3b8">W={N.toFixed(0)}N</text>
          {moving&&<text x={blockX+blockW/2} y={blockY-4} fontSize="10" fill="#f59e0b" textAnchor="middle" fontWeight="700">a={a.toFixed(2)}m/s²→</text>}
        </svg>
      </div>
      <div className="space-y-2 px-1">
        {[['mass (kg)',mass,setMass,1,15,0.5,'violet'],['μ',mu,setMu,0.05,1,0.05,'amber'],['F (N)',F,setF,0,80,1,'emerald']].map(([l,v,s,mn,mx,st,c])=>(
          <div key={l} className="flex items-center gap-3"><span className={`text-sm font-mono w-16 text-${c}-600 dark:text-${c}-400`}>{l}</span><input type="range" min={mn} max={mx} step={st} value={v} onChange={e=>s(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/><span className="text-xs font-mono w-10 text-right">{typeof v==='number'&&v.toFixed(2)}</span></div>
        ))}
      </div>
      <div className={`mt-3 rounded-lg px-3 py-2 text-sm text-center font-semibold border ${moving?'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300':'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'}`}>
        {moving?`Moving! F(${F.toFixed(0)}N) > f_max(${fMax.toFixed(1)}N) → a=${a.toFixed(2)}m/s²`:`Static equilibrium. F(${F.toFixed(0)}N) ≤ f_max(${fMax.toFixed(1)}N)`}
      </div>
    </div>
  );
}
