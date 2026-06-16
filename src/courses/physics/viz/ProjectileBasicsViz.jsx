import React, { useState } from 'react';

const W=320,H=220,PL=30,PB=30,PT=15,PR=15;
const PW=W-PL-PR,PH=H-PT-PB;
const G=9.8;

function trajectory(v0,theta){
  const rad=theta*Math.PI/180;
  const vx=v0*Math.cos(rad),vy=v0*Math.sin(rad);
  const T=2*vy/G;
  const pts=[];
  for(let i=0;i<=60;i++){
    const t=T*i/60;
    pts.push([vx*t,vy*t-0.5*G*t*t]);
  }
  return pts;
}

export default function ProjectileBasicsViz(){
  const[v0,setV0]=useState(20);
  const[theta,setTheta]=useState(45);

  const pts=trajectory(v0,theta);
  const R=pts[pts.length-1][0];
  const H_max=Math.max(...pts.map(p=>p[1]));
  const xMax=Math.max(R*1.1,10);
  const yMax=Math.max(H_max*1.2,5);

  function toS(x,y){return[PL+(x/xMax)*PW, PT+PH-(y/yMax)*PH];}

  const pathStr=pts.map(([x,y],i)=>{
    const[sx,sy]=toS(x,y);
    return`${i===0?'M':'L'} ${sx} ${sy}`;
  }).join(' ');

  const[lx,ly]=toS(R,0);

  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Projectile Trajectory</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
        x = v₀cos(θ)·t, &nbsp; y = v₀sin(θ)·t − ½gt². Adjust v₀ and θ. Note: 45° maximizes range; doubling v₀ quadruples it.
      </p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <line x1={PL} y1={PT+PH} x2={W-PR} y2={PT+PH} stroke="#94a3b8" strokeWidth="2"/>
          <line x1={PL} y1={PT} x2={PL} y2={PT+PH} stroke="#94a3b8" strokeWidth="1.5"/>
          {/* trajectory */}
          <path d={pathStr} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          {/* launch angle indicator */}
          <path d={`M ${PL+30} ${PT+PH} A 30 30 0 0 1 ${PL+30*Math.cos(theta*Math.PI/180)} ${PT+PH-30*Math.sin(theta*Math.PI/180)}`} fill="none" stroke="#f59e0b" strokeWidth="1.5"/>
          <text x={PL+36} y={PT+PH-8} fontSize="11" fill="#f59e0b">{theta}°</text>
          {/* landing */}
          <circle cx={lx} cy={ly} r="5" fill="#ef4444"/>
          <text x={lx} y={ly+16} fontSize="11" fill="#ef4444" textAnchor="middle">R={R.toFixed(1)}m</text>
          {/* peak */}
          {(() => {
            const [px,py]=toS(R/2,H_max);
            return<text x={px} y={py-6} fontSize="10" fill="#10b981" textAnchor="middle">H={H_max.toFixed(1)}m</text>;
          })()}
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-14 text-violet-600">v₀ (m/s)</span>
          <input type="range" min="5" max="40" step="1" value={v0} onChange={e=>setV0(parseInt(e.target.value))} className="flex-1 accent-violet-500"/>
          <span className="text-xs font-mono w-8 text-right">{v0}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono w-14 text-amber-500">θ (deg)</span>
          <input type="range" min="10" max="80" step="1" value={theta} onChange={e=>setTheta(parseInt(e.target.value))} className="flex-1 accent-amber-500"/>
          <span className="text-xs font-mono w-8 text-right">{theta}°</span>
        </div>
      </div>
    </div>
  );
}
