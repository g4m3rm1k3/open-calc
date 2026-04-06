import React, { useState } from 'react';
const G=9.8;
export default function MaxHeightViz(){
  const[v0,setV0]=useState(20);
  const[theta,setTheta]=useState(60);
  const rad=theta*Math.PI/180;
  const v0y=v0*Math.sin(rad),v0x=v0*Math.cos(rad);
  const H=v0y*v0y/(2*G),tPeak=v0y/G,R=2*v0x*tPeak;
  const W=300,H2=220,PL=30,PB=25,PT=15,PR=15;
  const xMax=Math.max(R*1.2,5),yMax=Math.max(H*1.3,5);
  function toS(x,y){return[PL+(x/xMax)*(W-PL-PR),PT+(H2-PT-PB)-(y/yMax)*(H2-PT-PB)];}
  const tFlight=2*tPeak;
  const pts=Array.from({length:80},(_,i)=>{const t=tFlight*i/79;return toS(v0x*t,Math.max(0,v0y*t-0.5*G*t*t));});
  const path=pts.map((p,i)=>`${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ');
  const[pkx,pky]=toS(R/2,H);
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Maximum Height</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Maximum height occurs when vertical velocity = 0. Using v²=v₀²−2gh: H = v₀ᵧ²/(2g) = (v₀sinθ)²/(2g).</p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H2} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <line x1={PL} y1={H2-PB} x2={W-PR} y2={H2-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={PL} y1={PT} x2={PL} y2={H2-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          <path d={path} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* height indicator */}
          <line x1={pkx} y1={pky} x2={pkx} y2={H2-PB} stroke="#10b981" strokeWidth="2" strokeDasharray="5,3"/>
          <line x1={PL} y1={pky} x2={pkx} y2={pky} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3"/>
          <circle cx={pkx} cy={pky} r="6" fill="#10b981"/>
          <text x={pkx+8} y={pky-4} fontSize="11" fill="#10b981" fontWeight="700">H={H.toFixed(1)}m</text>
          <text x={pkx+8} y={pky+12} fontSize="10" fill="#10b981">at t={tPeak.toFixed(2)}s</text>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-14 text-violet-600">v₀ (m/s)</span><input type="range" min="5" max="40" step="1" value={v0} onChange={e=>setV0(parseInt(e.target.value))} className="flex-1 accent-violet-500"/><span className="text-xs font-mono w-8 text-right">{v0}</span></div>
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-14 text-amber-500">θ (deg)</span><input type="range" min="10" max="80" step="1" value={theta} onChange={e=>setTheta(parseInt(e.target.value))} className="flex-1 accent-amber-500"/><span className="text-xs font-mono w-8 text-right">{theta}°</span></div>
      </div>
      <div className="mt-3 font-mono text-xs text-center text-slate-500">H = (v₀sinθ)²/(2g) = ({v0}·sin{theta}°)²/({2*G}) = {H.toFixed(2)} m</div>
    </div>
  );
}
