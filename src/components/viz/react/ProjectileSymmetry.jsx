import React, { useState } from 'react';
const G=9.8;
export default function ProjectileSymmetry(){
  const[v0,setV0]=useState(20);const[theta,setTheta]=useState(40);
  const rad=theta*Math.PI/180,v0y=v0*Math.sin(rad),v0x=v0*Math.cos(rad);
  const tF=2*v0y/G,R=v0x*tF;
  const W=300,HH=200,PL=25,PB=25,PT=12,PR=12;
  const xMax=Math.max(R*1.15,5),yMax=Math.max(v0y*v0y/(2*G)*1.4,3);
  function toS(x,y){return[PL+(x/xMax)*(W-PL-PR),PT+(HH-PT-PB)-(y/yMax)*(HH-PT-PB)];}
  const pts=Array.from({length:80},(_,i)=>{const t=tF*i/79;return toS(v0x*t,Math.max(0,v0y*t-0.5*G*t*t));});
  const path=pts.map((p,i)=>`${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ');
  const[midX,midY]=toS(R/2,v0y*v0y/(2*G));
  const[endX]=toS(R,0);
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Trajectory Symmetry</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">The projectile arc is symmetric about its peak. Speed at any height h on the way up equals speed at height h on the way down. The shape is a perfect parabola.</p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={HH} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <line x1={PL} y1={HH-PB} x2={W-PR} y2={HH-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={PL} y1={PT} x2={PL} y2={HH-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          {/* symmetry axis */}
          <line x1={midX} y1={PT} x2={midX} y2={HH-PB} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.7"/>
          <text x={midX+4} y={PT+14} fontSize="10" fill="#10b981">axis of symmetry</text>
          <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* peak */}
          <circle cx={midX} cy={midY} r="5" fill="#10b981"/>
          {/* half markers */}
          <text x={(PL+midX)/2} y={HH-PB+16} fontSize="10" fill="#6366f1" textAnchor="middle">R/2</text>
          <text x={(midX+endX)/2} y={HH-PB+16} fontSize="10" fill="#6366f1" textAnchor="middle">R/2</text>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-14 text-violet-600">v₀ (m/s)</span><input type="range" min="5" max="35" step="1" value={v0} onChange={e=>setV0(parseInt(e.target.value))} className="flex-1 accent-violet-500"/><span className="text-xs font-mono w-8 text-right">{v0}</span></div>
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-14 text-amber-500">θ (deg)</span><input type="range" min="10" max="80" step="1" value={theta} onChange={e=>setTheta(parseInt(e.target.value))} className="flex-1 accent-amber-500"/><span className="text-xs font-mono w-8 text-right">{theta}°</span></div>
      </div>
    </div>
  );
}
