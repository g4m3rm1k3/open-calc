import React, { useState } from 'react';
function Arrow({x1,y1,x2,y2,color,label,width=2.5}){const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<2)return null;const ux=dx/len,uy=dy/len,hl=9,hx=x2-ux*hl,hy=y2-uy*hl,px=-uy*5,py=ux*5;return<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round"/><polygon points={`${x2},${y2} ${hx+px},${hy+py} ${hx-px},${hy-py}`} fill={color}/>{label&&<text x={x2+ux*12} y={y2+uy*12} fontSize="11" fill={color} fontWeight="600" textAnchor="middle">{label}</text>}</g>;}
export default function StaticsIntuition(){
  const[mass,setMass]=useState(10);const[d,setD]=useState(1.5);const W=300,H=220;
  const g=9.8,Wt=mass*g,Lbeam=4;
  const R2=Wt*d/Lbeam,R1=Wt-R2;
  const sc=50;const ox=50,oy=150;
  const beamEnd=ox+Lbeam*sc;const loadX=ox+d*sc;
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Statics: Beam with Load</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">A beam supported at both ends with a load. Equilibrium: ΣF=0 and Στ=0. The support closer to the load carries more force.</p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          {/* beam */}
          <line x1={ox} y1={oy} x2={beamEnd} y2={oy} stroke="#475569" strokeWidth="8" strokeLinecap="round"/>
          {/* load */}
          <Arrow x1={loadX} y1={oy} x2={loadX} y2={oy+Math.min(Wt*0.5,70)} color="#ef4444" label={`W=${Wt.toFixed(0)}N`}/>
          {/* reactions */}
          <Arrow x1={ox} y1={oy} x2={ox} y2={oy-Math.min(R1*0.5,70)} color="#10b981" label={`R₁=${R1.toFixed(0)}N`}/>
          <Arrow x1={beamEnd} y1={oy} x2={beamEnd} y2={oy-Math.min(R2*0.5,70)} color="#6366f1" label={`R₂=${R2.toFixed(0)}N`}/>
          {/* supports */}
          <polygon points={`${ox},${oy+2} ${ox-12},${oy+22} ${ox+12},${oy+22}`} fill="#94a3b8"/>
          <polygon points={`${beamEnd},${oy+2} ${beamEnd-12},${oy+22} ${beamEnd+12},${oy+22}`} fill="#94a3b8"/>
          {/* distance labels */}
          <line x1={ox} y1={oy+35} x2={loadX} y2={oy+35} stroke="#f59e0b" strokeWidth="1.5"/>
          <text x={(ox+loadX)/2} y={oy+30} fontSize="10" fill="#f59e0b" textAnchor="middle">d={d.toFixed(1)}m</text>
          <text x={(loadX+beamEnd)/2} y={oy+30} fontSize="10" fill="#94a3b8" textAnchor="middle">{(Lbeam-d).toFixed(1)}m</text>
          <line x1={loadX} y1={oy+35} x2={beamEnd} y2={oy+35} stroke="#94a3b8" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-16 text-violet-600">mass (kg)</span><input type="range" min="1" max="20" step="0.5" value={mass} onChange={e=>setMass(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/><span className="text-xs font-mono w-8 text-right">{mass}</span></div>
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-16 text-amber-500">d (m)</span><input type="range" min="0.2" max={Lbeam-0.2} step="0.1" value={d} onChange={e=>setD(parseFloat(e.target.value))} className="flex-1 accent-amber-500"/><span className="text-xs font-mono w-8 text-right">{d.toFixed(1)}</span></div>
      </div>
      <div className="mt-3 font-mono text-xs text-center text-slate-500">Στ about left: R₂·L = W·d → R₂={R2.toFixed(1)}N, R₁={R1.toFixed(1)}N</div>
    </div>
  );
}
