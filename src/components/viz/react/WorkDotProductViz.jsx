import React, { useState } from 'react';
const W=300,H=200;
function Arrow({x1,y1,x2,y2,color,label,width=2.5}){const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<2)return null;const ux=dx/len,uy=dy/len,hl=9,hx=x2-ux*hl,hy=y2-uy*hl,px=-uy*5,py=ux*5;return<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round"/><polygon points={`${x2},${y2} ${hx+px},${hy+py} ${hx-px},${hy-py}`} fill={color}/>{label&&<text x={x2+ux*16} y={y2+uy*16} fontSize="11" fill={color} fontWeight="600" textAnchor="middle">{label}</text>}</g>;}
export default function WorkDotProductViz(){
  const[F,setF]=useState(50);const[theta,setTheta]=useState(30);const[d,setD]=useState(4);
  const rad=theta*Math.PI/180;
  const W_work=F*d*Math.cos(rad);
  const Fx=F*Math.cos(rad);
  // SVG geometry
  const ox=40,oy=140;const dscale=d*18;
  const Fscale=Math.min(F*0.7,90);
  const Fxscale=Math.min(Fx*0.7,80);
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Work as a Dot Product</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Work = F·d·cosθ. Only the component of force along the displacement does work. Perpendicular force contributes nothing.</p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          {/* ground */}
          <line x1={ox} y1={oy} x2={ox+dscale+20} y2={oy} stroke="#94a3b8" strokeWidth="2"/>
          {/* displacement */}
          <Arrow x1={ox} y1={oy} x2={ox+dscale} y2={oy} color="#94a3b8" label={`d=${d}m`} width={2}/>
          {/* Force at angle */}
          <Arrow x1={ox} y1={oy} x2={ox+Fscale*Math.cos(rad)} y2={oy-Fscale*Math.sin(rad)} color="#ef4444" label={`F=${F}N`}/>
          {/* Fx component (dashed) */}
          <line x1={ox+Fscale*Math.cos(rad)} y1={oy-Fscale*Math.sin(rad)} x2={ox+Fxscale} y2={oy} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3"/>
          <Arrow x1={ox} y1={oy} x2={ox+Fxscale} y2={oy} color="#f59e0b" label={`F·cosθ`} width={2}/>
          {/* angle arc */}
          <path d={`M ${ox+28} ${oy} A 28 28 0 0 0 ${ox+28*Math.cos(rad)} ${oy-28*Math.sin(rad)}`} fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
          <text x={ox+36} y={oy-10} fontSize="10" fill="#a78bfa">{theta}°</text>
          {/* work label */}
          <text x={W/2} y={30} fontSize="12" fill={W_work>=0?'#10b981':'#ef4444'} textAnchor="middle" fontWeight="700">W = {W_work.toFixed(1)} J</text>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        {[['F (N)',F,setF,0,150,5,'red'],['θ (°)',theta,setTheta,0,90,1,'violet'],['d (m)',d,setD,0.5,8,0.5,'amber']].map(([l,v,s,mn,mx,st,c])=>(
          <div key={l} className="flex items-center gap-3"><span className={`text-sm font-mono w-16 text-${c}-600`}>{l}</span><input type="range" min={mn} max={mx} step={st} value={v} onChange={e=>s(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/><span className="text-xs font-mono w-12 text-right">{typeof v==='number'?v.toFixed(1):v}</span></div>
        ))}
      </div>
      <div className="mt-3 font-mono text-xs text-center text-slate-500">W = F·d·cosθ = {F}·{d}·cos{theta}° = {W_work.toFixed(1)} J</div>
    </div>
  );
}
