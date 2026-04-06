import React, { useState } from 'react';

const W = 300, H = 280, CX = 150, CY = 140, SC = 54;
function toS(x,y){return[CX+x*SC,CY-y*SC];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1];}
function scale(s,v){return[s*v[0],s*v[1]];}
function sub(a,b){return[a[0]-b[0],a[1]-b[1]];}
function norm(v){return Math.sqrt(dot(v,v));}
function normalize(v){const n=norm(v);return n<1e-10?v:[v[0]/n,v[1]/n];}

function Arrow({x1,y1,x2,y2,color,width=2.5,dashed=false}){
  const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  if(len<2)return null;
  const ux=dx/len,uy=dy/len,hl=9,hx=x2-ux*hl,hy=y2-uy*hl,px=-uy*5,py=ux*5;
  return(<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dashed?'6,4':undefined} strokeLinecap="round"/><polygon points={`${x2},${y2} ${hx+px},${hy+py} ${hx-px},${hy-py}`} fill={color}/></g>);
}

function Grid(){
  const lines=[];
  for(let i=-2;i<=2;i++){
    const[sx]=toS(i,0);const[,sy]=toS(0,i);
    lines.push(<line key={`v${i}`} x1={sx} y1={10} x2={sx} y2={H-10} stroke="#e2e8f0" strokeWidth="1"/>);
    lines.push(<line key={`h${i}`} x1={10} y1={sy} x2={W-10} y2={sy} stroke="#e2e8f0" strokeWidth="1"/>);
  }
  return<g>{lines}</g>;
}

export default function GramSchmidtProcess(){
  const[step,setStep]=useState(0);
  const[a1x,setA1x]=useState(2);const[a1y,setA1y]=useState(0.5);
  const[a2x,setA2x]=useState(0.8);const[a2y,setA2y]=useState(1.8);

  const a1=[a1x,a1y],a2=[a2x,a2y];
  const e1=normalize(a1);
  const proj=scale(dot(a2,e1),e1);
  const remainder=sub(a2,proj);
  const e2=normalize(remainder);

  const[ox,oy]=toS(0,0);

  return(
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <h3 className="text-lg font-semibold mb-1">Gram-Schmidt Process</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Step through orthogonalization. Start with any two vectors — Gram-Schmidt always produces a perpendicular pair.</p>
      <div className="flex gap-1 mb-3">
        {['Start','Step 1: normalize v₁','Step 2: remove projection','Result: e₁⊥e₂'].map((s,i)=>(
          <button key={i} onClick={()=>setStep(i)}
            className={`h-1.5 flex-1 rounded-full ${i===step?'bg-violet-500':i<step?'bg-violet-300 dark:bg-violet-700':'bg-slate-200 dark:bg-slate-700'}`}/>
        ))}
      </div>
      <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 mb-3 text-sm text-slate-700 dark:text-slate-300">
        {step===0 && 'v₁ (red) and v₂ (blue) — not perpendicular. Gram-Schmidt will fix that.'}
        {step===1 && 'e₁ = v₁/|v₁| — normalize v₁ to unit length. Direction preserved, magnitude = 1.'}
        {step===2 && 'Subtract the projection of v₂ onto e₁. The remainder (green) is perpendicular to e₁.'}
        {step===3 && 'e₂ = normalize(remainder). Now e₁ · e₂ = 0 — perfectly orthogonal, both unit vectors.'}
      </div>
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
          <Grid/>
          <line x1={CX} y1={10} x2={CX} y2={H-10} stroke="#94a3b8" strokeWidth="1"/>
          <line x1={10} y1={CY} x2={W-10} y2={CY} stroke="#94a3b8" strokeWidth="1"/>
          {/* v1 always */}
          <Arrow x1={ox} y1={oy} x2={toS(a1[0],a1[1])[0]} y2={toS(a1[0],a1[1])[1]} color="#ef4444" width={step===0?3:1.5} dashed={step>0}/>
          {step===0&&<text x={toS(a1[0],a1[1])[0]+6} y={toS(a1[0],a1[1])[1]-4} fontSize="12" fill="#ef4444" fontWeight="600">v₁</text>}
          {/* v2 always */}
          <Arrow x1={ox} y1={oy} x2={toS(a2[0],a2[1])[0]} y2={toS(a2[0],a2[1])[1]} color="#6366f1" width={step===0?3:1.5} dashed={step>0}/>
          {step===0&&<text x={toS(a2[0],a2[1])[0]+6} y={toS(a2[0],a2[1])[1]-4} fontSize="12" fill="#6366f1" fontWeight="600">v₂</text>}
          {/* e1 */}
          {step>=1&&<Arrow x1={ox} y1={oy} x2={toS(e1[0],e1[1])[0]} y2={toS(e1[0],e1[1])[1]} color="#ef4444" width={3}/>}
          {step>=1&&<text x={toS(e1[0],e1[1])[0]+6} y={toS(e1[0],e1[1])[1]-4} fontSize="12" fill="#ef4444" fontWeight="700">e₁</text>}
          {/* projection of v2 onto e1 */}
          {step>=2&&<Arrow x1={ox} y1={oy} x2={toS(proj[0],proj[1])[0]} y2={toS(proj[0],proj[1])[1]} color="#f59e0b" width={2} dashed/>}
          {step>=2&&<text x={toS(proj[0],proj[1])[0]+6} y={toS(proj[0],proj[1])[1]+12} fontSize="11" fill="#f59e0b">proj</text>}
          {/* remainder */}
          {step>=2&&<Arrow x1={toS(proj[0],proj[1])[0]} y1={toS(proj[0],proj[1])[1]} x2={toS(a2[0],a2[1])[0]} y2={toS(a2[0],a2[1])[1]} color="#10b981" width={2.5}/>}
          {step>=2&&<text x={toS(a2[0]/2+proj[0]/2,a2[1]/2+proj[1]/2)[0]+6} y={toS(a2[0]/2+proj[0]/2,a2[1]/2+proj[1]/2)[1]} fontSize="11" fill="#10b981">e₂ dir</text>}
          {/* e2 normalized */}
          {step>=3&&<Arrow x1={ox} y1={oy} x2={toS(e2[0],e2[1])[0]} y2={toS(e2[0],e2[1])[1]} color="#10b981" width={3}/>}
          {step>=3&&<text x={toS(e2[0],e2[1])[0]+6} y={toS(e2[0],e2[1])[1]-4} fontSize="12" fill="#10b981" fontWeight="700">e₂</text>}
          {step===3&&<text x={CX} y={22} fontSize="11" fill="#10b981" textAnchor="middle" fontWeight="700">e₁·e₂ = {dot(e1,e2).toFixed(4)} ≈ 0 ✓</text>}
          <circle cx={ox} cy={oy} r="3" fill="#475569"/>
        </svg>
      </div>
      {step===0&&(
        <div className="grid grid-cols-2 gap-2">
          {[['v₁x',a1x,setA1x,'#ef4444'],['v₁y',a1y,setA1y,'#ef4444'],['v₂x',a2x,setA2x,'#6366f1'],['v₂y',a2y,setA2y,'#6366f1']].map(([l,v,s,c])=>(
            <div key={l} className="flex items-center gap-2">
              <span className="text-xs font-mono w-8" style={{color:c}}>{l}=</span>
              <input type="range" min="-2" max="2.5" step="0.1" value={v} onChange={e=>s(parseFloat(e.target.value))} className="flex-1 accent-violet-500"/>
              <span className="text-xs font-mono w-8 text-right">{v.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={()=>setStep(Math.max(0,step-1))} disabled={step===0} className="flex-1 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30">← Back</button>
        <button onClick={()=>setStep(Math.min(3,step+1))} disabled={step===3} className="flex-1 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}
