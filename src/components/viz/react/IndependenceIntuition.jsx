import React, { useState } from 'react';
const W=320,H=200,G=9.8;
export default function IndependenceIntuition(){
  const[v0x,setV0x]=useState(10);
  const[v0y,setV0y]=useState(15);
  const[t,setT]=useState(0);
  const tFlight=2*v0y/G;
  const tCur=Math.min(t,tFlight);
  const xP=v0x*tCur,yP=v0y*tCur-0.5*G*tCur*tCur;
  const xDrop=0,yDrop=v0y*tCur-0.5*G*tCur*tCur; // same vertical
  const xHoriz=v0x*tCur,yHoriz=0; // same horizontal
  const xMax=v0x*tFlight*1.1||10,yMax=v0y*v0y/(2*G)*1.3||5;
  function toS(x,y){return[30+(x/xMax)*260,H-30-(y/yMax)*(H-50)];}
  const[px,py]=toS(xP,Math.max(0,yP));
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">x and y Motion Are Independent</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Horizontal motion (constant velocity) and vertical motion (free fall) happen simultaneously but independently. The projectile's x and y positions are governed by separate equations.</p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <line x1={30} y1={H-30} x2={W-10} y2={H-30} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={30} y1={20} x2={30} y2={H-30} stroke="#94a3b8" strokeWidth="1.5"/>
          {/* vertical drop marker */}
          <line x1={toS(0,0)[0]} y1={toS(0,Math.max(0,yP))[1]} x2={toS(0,0)[0]} y2={H-30} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3"/>
          <circle cx={toS(0,Math.max(0,yP))[0]} cy={toS(0,Math.max(0,yP))[1]} r="6" fill="#ef4444" opacity="0.5"/>
          <text x={35} y={toS(0,Math.max(0,yP))[1]} fontSize="10" fill="#ef4444">y={Math.max(0,yP).toFixed(1)}m</text>
          {/* horizontal marker */}
          <line x1={30} y1={H-30} x2={px} y2={H-30} stroke="#10b981" strokeWidth="2"/>
          <text x={(30+px)/2} y={H-14} fontSize="10" fill="#10b981" textAnchor="middle">x={xP.toFixed(1)}m</text>
          {/* projectile */}
          {yP>=0&&<circle cx={px} cy={py} r="8" fill="#6366f1"/>}
        </svg>
      </div>
      <div className="flex items-center gap-3 mb-2 px-1">
        <span className="text-sm font-mono w-8 text-violet-600">t=</span>
        <input type="range" min="0" max={tFlight.toFixed(2)} step="0.05" value={t} onChange={e=>setT(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/>
        <span className="text-xs font-mono w-12 text-right">{tCur.toFixed(2)}s</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2"><span className="text-xs font-mono w-14 text-emerald-600">v₀ₓ (m/s)</span><input type="range" min="5" max="25" step="1" value={v0x} onChange={e=>{setV0x(parseInt(e.target.value));setT(0);}} className="flex-1 accent-emerald-500"/><span className="text-xs font-mono w-6 text-right">{v0x}</span></div>
        <div className="flex items-center gap-2"><span className="text-xs font-mono w-14 text-red-500">v₀ᵧ (m/s)</span><input type="range" min="5" max="25" step="1" value={v0y} onChange={e=>{setV0y(parseInt(e.target.value));setT(0);}} className="flex-1 accent-red-500"/><span className="text-xs font-mono w-6 text-right">{v0y}</span></div>
      </div>
    </div>
  );
}
