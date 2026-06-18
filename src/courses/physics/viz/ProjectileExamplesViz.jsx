import React, { useState } from 'react';
const G=9.8;
const EXAMPLES=[
  {label:'45° optimal',v0:20,theta:45,note:'Max range at 45°'},
  {label:'Low arc 20°',v0:20,theta:20,note:'Fast and flat'},
  {label:'High arc 70°',v0:20,theta:70,note:'High but short'},
  {label:'Complementary: 30°',v0:20,theta:30,note:'Same range as 60°'},
  {label:'Complementary: 60°',v0:20,theta:60,note:'Same range as 30°'},
];
export default function ProjectileExamplesViz(){
  const[ei,setEi]=useState(0);
  const{v0,theta,note}=EXAMPLES[ei];
  const rad=theta*Math.PI/180;
  const v0y=v0*Math.sin(rad),v0x=v0*Math.cos(rad);
  const tF=2*v0y/G,R=v0x*tF,H=v0y*v0y/(2*G);
  const W=300,HH=200,PL=25,PB=25,PT=12,PR=12;
  const xMax=50,yMax=25;
  function toS(x,y){return[PL+(x/xMax)*(W-PL-PR),PT+(HH-PT-PB)-(y/yMax)*(HH-PT-PB)];}
  const paths=EXAMPLES.map(({v0:v,theta:th})=>{
    const r=th*Math.PI/180,vy=v*Math.sin(r),vx=v*Math.cos(r),tf=2*vy/G;
    return Array.from({length:60},(_,i)=>{const t=tf*i/59;return toS(vx*t,Math.max(0,vy*t-0.5*G*t*t));}).map((p,i)=>`${i===0?'M':'L'} ${p[0]} ${p[1]}`).join(' ');
  });
  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Projectile Examples</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Compare trajectories. Note how 30° and 60° land at the same range — complementary angles.</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {EXAMPLES.map((e,i)=><button key={i} onClick={()=>setEi(i)} className={`px-2 py-1 rounded text-xs ${i===ei?'bg-violet-600 text-white':'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600'}`}>{e.label}</button>)}
      </div>
      <div className="flex justify-center mb-3">
        <svg width={W} height={HH} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <line x1={PL} y1={HH-PB} x2={W-PR} y2={HH-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          <line x1={PL} y1={PT} x2={PL} y2={HH-PB} stroke="#94a3b8" strokeWidth="1.5"/>
          {paths.map((p,i)=><path key={i} d={p} fill="none" stroke={i===ei?'#6366f1':'#e2e8f0'} strokeWidth={i===ei?2.5:1} strokeLinecap="round" strokeLinejoin="round"/>)}
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2"><p className="text-xs text-slate-500">Range</p><p className="font-mono font-bold">{R.toFixed(1)}m</p></div>
        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2"><p className="text-xs text-slate-500">Max Height</p><p className="font-mono font-bold">{H.toFixed(1)}m</p></div>
        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2"><p className="text-xs text-slate-500">Time</p><p className="font-mono font-bold">{tF.toFixed(2)}s</p></div>
      </div>
      <p className="text-xs text-center text-slate-400 mt-2">{note}</p>
    </div>
  );
}
