import React, { useState, useEffect, useRef } from 'react';
const W=280,H=260,CX=140,CY=130;
export default function CentripetalViz(){
  const[r,setR]=useState(80);const[omega,setOmega]=useState(1.5);
  const[angle,setAngle]=useState(0);const animRef=useRef(null);
  useEffect(()=>{
    let last=null;
    function frame(ts){
      if(last!==null)setAngle(a=>(a+omega*0.016)%(2*Math.PI));
      last=ts;animRef.current=requestAnimationFrame(frame);
    }
    animRef.current=requestAnimationFrame(frame);
    return()=>cancelAnimationFrame(animRef.current);
  },[omega]);
  const px=CX+r*Math.cos(angle),py=CY-r*Math.sin(angle);
  const ac=omega*omega*r;
  // centripetal direction = toward center
  const dcx=CX-px,dcy=CY-py,dl=Math.sqrt(dcx*dcx+dcy*dcy);
  const accScale=Math.min(ac/20*50,60);
  const ax=px+(dcx/dl)*accScale,ay=py+(dcy/dl)*accScale;
  // velocity = perpendicular to radius
  const vx=py-CY,vy=px-CX,vl=Math.sqrt(vx*vx+vy*vy);
  const vScale=Math.min(omega*r/30*40,55);
  const vex=px+(vx/vl)*vScale,vey=py+(vy/vl)*vScale;
  function Arrow({x1,y1,x2,y2,color,width=2}){
    const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
    if(len<2)return null;
    const ux=dx/len,uy=dy/len,hl=8,hx=x2-ux*hl,hy=y2-uy*hl,px=-uy*4,py=ux*4;
    return<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round"/><polygon points={`${x2},${y2} ${hx+px},${hy+py} ${hx-px},${hy-py}`} fill={color}/></g>;
  }
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Centripetal Acceleration</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">The acceleration always points toward the center (centripetal = "center-seeking"). Velocity is always perpendicular. ac = ω²r = v²/r.</p>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <circle cx={CX} cy={CY} r={r} fill="none" stroke="#e2e8f0" strokeWidth="2"/>
          <line x1={CX} y1={CY} x2={px} y2={py} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,3"/>
          <Arrow x1={px} y1={py} x2={vex} y2={vey} color="#10b981" width={2.5}/>
          <text x={vex+5} y={vey-4} fontSize="11" fill="#10b981" fontWeight="600">v</text>
          <Arrow x1={px} y1={py} x2={ax} y2={ay} color="#ef4444" width={2.5}/>
          <text x={ax+5} y={ay} fontSize="11" fill="#ef4444" fontWeight="600">aₓ</text>
          <circle cx={px} cy={py} r="8" fill="#6366f1"/>
          <circle cx={CX} cy={CY} r="4" fill="#475569"/>
          <text x={CX+4} y={CY+4} fontSize="11" fill="#94a3b8">O</text>
          <text x={10} y={H-10} fontSize="11" fill="#ef4444">aₓ = ω²r = {ac.toFixed(1)} m/s²</text>
        </svg>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-14 text-violet-600">r (m)</span><input type="range" min="40" max="100" step="5" value={r} onChange={e=>setR(parseInt(e.target.value))} className="flex-1 accent-violet-500"/><span className="text-xs font-mono w-8">{r}</span></div>
        <div className="flex items-center gap-3"><span className="text-sm font-mono w-14 text-emerald-600">ω (rad/s)</span><input type="range" min="0.5" max="3" step="0.1" value={omega} onChange={e=>setOmega(parseFloat(e.target.value))} className="flex-1 accent-emerald-500"/><span className="text-xs font-mono w-8">{omega.toFixed(1)}</span></div>
      </div>
    </div>
  );
}
