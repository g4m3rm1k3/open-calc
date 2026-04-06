import React, { useState } from 'react';
const W=280,H=260,CX=140,CY=130;
function Arrow({x1,y1,x2,y2,color,label,width=2.5}){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  if(len<4)return null;
  const ux=dx/len,uy=dy/len,hl=9,hx=x2-ux*hl,hy=y2-uy*hl,px=-uy*5,py=ux*5;
  const lx=x2+ux*12,ly=y2+uy*12;
  return(<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round"/><polygon points={`${x2},${y2} ${hx+px},${hy+py} ${hx-px},${hy-py}`} fill={color}/>{label&&<text x={lx} y={ly} fontSize="11" fill={color} fontWeight="600" textAnchor="middle">{label}</text>}</g>);
}
export default function FBDIntuition(){
  const[mass,setMass]=useState(5);const[angle,setAngle]=useState(40);
  const g=9.8,W2=mass*g;
  const rad=angle*Math.PI/180;
  // Two rope tensions: T1 at angle1=40°, T2 horizontal
  // ΣFx=0: T1cos(angle)-T2=0; ΣFy=0: T1sin(angle)-W=0
  const T1=W2/Math.sin(rad),T2=T1*Math.cos(rad);
  const scale=0.7;
  const Wscale=Math.min(W2*scale,70),T1scale=Math.min(T1*scale,80),T2scale=Math.min(T2*scale,70);
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Free Body Diagram: Hanging Mass</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">A mass hangs from two ropes. Three forces act on it. ΣF=0 gives two equations for the two unknown tensions.</p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          {/* ceiling */}
          <line x1={40} y1={30} x2={W-40} y2={30} stroke="#94a3b8" strokeWidth="3"/>
          {/* rope 1 (diagonal) */}
          <line x1={CX} y1={CY} x2={CX-T2scale} y2={30} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,3"/>
          {/* rope 2 (horizontal to wall) */}
          <line x1={CX} y1={CY} x2={W-40} y2={CY} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,3"/>
          {/* mass */}
          <rect x={CX-15} y={CY-15} width={30} height={30} fill="#6366f1" rx="4"/>
          <text x={CX} y={CY+5} fontSize="12" fill="white" fontWeight="700" textAnchor="middle">{mass}kg</text>
          {/* forces */}
          <Arrow x1={CX} y1={CY} x2={CX} y2={CY+Wscale} color="#ef4444" label={`W=${W2.toFixed(0)}N`}/>
          <Arrow x1={CX} y1={CY} x2={CX-T2scale} y2={CY-Math.sin(rad)*T1scale} color="#10b981" label={`T₁=${T1.toFixed(0)}N`}/>
          <Arrow x1={CX} y1={CY} x2={CX+T2scale} y2={CY} color="#f59e0b" label={`T₂=${T2.toFixed(0)}N`}/>
          {/* angle */}
          <path d={`M ${CX-30} ${CY} A 30 30 0 0 0 ${CX-30*Math.cos(rad)} ${CY-30*Math.sin(rad)}`} fill="none" stroke="#a78bfa" strokeWidth="1.5"/>
          <text x={CX-42} y={CY-14} fontSize="10" fill="#a78bfa">{angle}°</text>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-16 text-violet-600">mass (kg)</span><input type="range" min="1" max="15" step="0.5" value={mass} onChange={e=>setMass(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/><span className="text-xs font-mono w-8 text-right">{mass}</span></div>
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-16 text-purple-500">angle θ</span><input type="range" min="15" max="75" step="1" value={angle} onChange={e=>setAngle(parseInt(e.target.value))} className="flex-1 accent-purple-500"/><span className="text-xs font-mono w-8 text-right">{angle}°</span></div>
      </div>
      <div className="mt-3 font-mono text-xs text-center text-slate-500">ΣFy=0: T₁sin{angle}°−W=0 → T₁={T1.toFixed(1)}N &nbsp;&nbsp; ΣFx=0: T₁cos{angle}°−T₂=0</div>
    </div>
  );
}
