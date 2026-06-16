import { useState, useRef, useCallback } from 'react';

const W = 370, H = 300, CX = 185, CY = 150, SC = 52;
const toS = (x,y) => [CX+x*SC, CY-y*SC];

function Arrow({x1,y1,x2,y2,color,w=2.5,dashed=false,opacity=1}) {
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
  if(len<2)return null;
  const ux=dx/len,uy=dy/len,hl=8;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w}
        strokeDasharray={dashed?'6,4':undefined} strokeLinecap="round"/>
      <polygon points={`${x2},${y2} ${x2-ux*hl-uy*4},${y2-uy*hl+ux*4} ${x2-ux*hl+uy*4},${y2-uy*hl-ux*4}`} fill={color}/>
    </g>
  );
}

// SVD of 2x2: M = U Σ Vᵀ
function svd2x2(a,b,c,d) {
  // Using Jacobi/closed-form for 2×2
  const E = (a+d)/2, F = (a-d)/2, G = (c+b)/2, H2 = (c-b)/2;
  const Q = Math.sqrt(E*E+H2*H2), R = Math.sqrt(F*F+G*G);
  const s1 = Q+R, s2 = Math.abs(Q-R);
  const a1 = Math.atan2(G,F), a2 = Math.atan2(H2,E);
  const theta = (a2-a1)/2, phi = (a2+a1)/2;
  const U = [[Math.cos(phi),-Math.sin(phi)],[Math.sin(phi),Math.cos(phi)]];
  const V = [[Math.cos(theta),-Math.sin(theta)],[Math.sin(theta),Math.cos(theta)]];
  return { U, sigma:[s1,s2], V };
}

const PRESETS = [
  { label:'Shear', a:1,b:1,c:0,d:1 },
  { label:'Rotate 30°', a:0.866,b:-0.5,c:0.5,d:0.866 },
  { label:'Scale', a:2,b:0,c:0,d:0.5 },
  { label:'Skew+Scale', a:2,b:0.8,c:0.3,d:1.5 },
];

const STEPS=[
  {
    title:'SVD: Three Simple Operations',
    body:'Any matrix M can be factored as M = U Σ Vᵀ — three matrices that together are a pure rotation Vᵀ, then an axis-aligned scaling Σ, then another pure rotation U. This is the "anatomy" of any linear map.',
    phase:'full',
    formula:'M = U Σ Vᵀ   (rotation → scale → rotation)',
  },{
    title:'Step 1 — Rotate by Vᵀ (align to singular axes)',
    body:'The first rotation Vᵀ aligns the input circle to the "right singular vectors" — the natural input axes of M. Think of it as finding the best orientation to view the input space.',
    phase:'Vt',
    formula:'x → Vᵀx   (rotate to right singular vectors)',
  },{
    title:'Step 2 — Scale by Σ (stretch to ellipse)',
    body:'Σ is diagonal — it just scales the aligned axes by σ₁ and σ₂ (the singular values). The circle becomes an ellipse. The singular values tell you exactly how much M stretches each direction.',
    phase:'S',
    formula:'Vᵀx → Σ Vᵀx   (σ₁ and σ₂ are the stretch factors)',
  },{
    title:'Step 3 — Rotate by U (final orientation)',
    body:'The last rotation U puts the ellipse into its final orientation. Together, these three steps equal the full matrix M. SVD reveals that EVERY matrix is just "rotate, stretch, rotate".',
    phase:'full',
    formula:'M = U·Σ·Vᵀ   σ₁ ≥ σ₂ ≥ 0 always',
  },
];

export default function SVDGeometricViz() {
  const [step, setStep] = useState(0);
  const [a,setA]=useState(1.5);const [b,setB]=useState(0.8);
  const [c,setC]=useState(0.2);const [d,setD]=useState(1.2);
  const [t, setT] = useState(1);
  const animRef = useRef(null);
  const s = STEPS[step];
  const { U, sigma:[s1,s2], V } = svd2x2(a,b,c,d);

  const animTo = useCallback((target) => {
    cancelAnimationFrame(animRef.current);
    const from=t, start=performance.now(), dur=700;
    const tick=(now)=>{
      const p=Math.min((now-start)/dur,1);
      const e=p<.5?2*p*p:-1+(4-2*p)*p;
      setT(from+(target-from)*e);
      if(p<1)animRef.current=requestAnimationFrame(tick);
    };
    animRef.current=requestAnimationFrame(tick);
  },[t]);

  // Build ellipse points for each phase
  const N=60;
  const ellipsePoints=(phaseT)=>{
    const pts=[];
    for(let i=0;i<=N;i++){
      const θ=(i/N)*2*Math.PI;
      let x=Math.cos(θ), y=Math.sin(θ);
      // Apply transform gradually
      let rx,ry;
      if(s.phase==='Vt'){
        // Only Vᵀ
        rx=V[0][0]*x+V[1][0]*y; ry=V[0][1]*x+V[1][1]*y;
        rx=x+(rx-x)*phaseT; ry=y+(ry-y)*phaseT;
      } else if(s.phase==='S'){
        // Vᵀ already applied, now Σ
        const vx=V[0][0]*x+V[1][0]*y, vy=V[0][1]*x+V[1][1]*y;
        rx=vx+(s1*vx-vx)*phaseT; ry=vy+(s2*vy-vy)*phaseT;
      } else {
        // Full M
        rx=a*x+b*y; ry=c*x+d*y;
        rx=x+(rx-x)*phaseT; ry=y+(ry-y)*phaseT;
      }
      const [sx,sy]=toS(rx,ry);
      pts.push(`${sx},${sy}`);
    }
    return pts.join(' ');
  };

  // Singular vector arrows
  const [ox,oy]=toS(0,0);
  const v1s=toS(V[0][0], V[0][1]); // first right singular vector
  const v2s=toS(V[1][0], V[1][1]);
  const u1s=toS(U[0][0]*s1, U[1][0]*s1); // first left singular * σ
  const u2s=toS(U[0][1]*s2, U[1][1]*s2);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">SVD: Rotate → Stretch → Rotate</h3>
          <span className="text-xs text-slate-400">{step+1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_,i)=>(
            <button key={i} onClick={()=>setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i===step?'bg-cyan-50 dark:bg-cyan-900/300':i<step?'bg-cyan-300 dark:bg-cyan-700':'bg-slate-200 dark:bg-slate-700'}`}/>
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-2">
          <p className="font-semibold text-cyan-600 dark:text-cyan-400 mb-1 text-sm">{s.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
          <p className="mt-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center text-slate-700 dark:text-slate-200">{s.formula}</p>
        </div>
      </div>

      {/* Matrix controls */}
      <div className="flex items-center gap-3 mb-3">
        <div className="grid grid-cols-2 gap-1">
          {[['a',a,setA],['b',b,setB],['c',c,setC],['d',d,setD]].map(([lbl,val,fn])=>(
            <div key={lbl} className="flex items-center gap-1">
              <span className="text-[9px] text-slate-400 font-mono w-3">{lbl}</span>
              <input type="number" value={val} step="0.1"
                onChange={e=>fn(parseFloat(e.target.value)||0)}
                className="w-14 text-center text-xs font-mono rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 py-0.5"/>
            </div>
          ))}
        </div>
        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 space-y-1">
          <div className="bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded px-2 py-0.5">σ₁ = {s1.toFixed(3)}</div>
          <div className="bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded px-2 py-0.5">σ₂ = {s2.toFixed(3)}</div>
        </div>
        <div className="flex flex-col gap-1">
          {PRESETS.map(p=>(
            <button key={p.label} onClick={()=>{setA(p.a);setB(p.b);setC(p.c);setD(p.d);}}
              className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-cyan-400 dark:border-cyan-600/50 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animate slider */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] text-slate-400 font-mono">t=</span>
        <input type="range" min="0" max="1" step="0.01" value={t}
          onChange={e=>setT(parseFloat(e.target.value))}
          className="flex-1 accent-cyan-500"/>
        <button onClick={()=>animTo(t<0.5?1:0)}
          className="text-[10px] bg-cyan-600 text-white rounded px-2 py-1 hover:bg-cyan-700">
          {t<0.5?'Apply ▶':'Reset ◀'}
        </button>
      </div>

      {/* Canvas */}
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          {/* Grid */}
          {[-3,-2,-1,0,1,2,3].map(i=>{
            const [ax,ay]=toS(i,-3),[bx,by]=toS(i,3);
            const [cx2,cy2]=toS(-3,i),[dx2,dy2]=toS(3,i);
            return <g key={i}>
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#334155" strokeWidth="0.5" opacity="0.2"/>
              <line x1={cx2} y1={cy2} x2={dx2} y2={dy2} stroke="#334155" strokeWidth="0.5" opacity="0.2"/>
            </g>;
          })}
          <line x1={10} y1={CY} x2={W-10} y2={CY} stroke="#94a3b8" strokeWidth="1"/>
          <line x1={CX} y1={10} x2={CX} y2={H-10} stroke="#94a3b8" strokeWidth="1"/>

          {/* Input circle (ghost) */}
          <circle cx={CX} cy={CY} r={SC} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" opacity="0.4"/>

          {/* Transformed ellipse */}
          <polyline points={ellipsePoints(t)} fill="#22d3ee" fillOpacity="0.12" stroke="#22d3ee" strokeWidth="2.5"/>

          {/* Singular vectors */}
          {t>0.5&&<>
            <Arrow x1={ox} y1={oy} x2={u1s[0]} y2={u1s[1]} color="#f97316" w={2.5}/>
            <Arrow x1={ox} y1={oy} x2={u2s[0]} y2={u2s[1]} color="#a855f7" w={2.5}/>
            <text x={u1s[0]+5} y={u1s[1]} fontSize="10" fill="#f97316" fontWeight="700">u₁σ₁</text>
            <text x={u2s[0]+5} y={u2s[1]} fontSize="10" fill="#a855f7" fontWeight="700">u₂σ₂</text>
          </>}
          {t<0.5&&<>
            <Arrow x1={ox} y1={oy} x2={v1s[0]} y2={v1s[1]} color="#f97316" w={2} dashed/>
            <Arrow x1={ox} y1={oy} x2={v2s[0]} y2={v2s[1]} color="#a855f7" w={2} dashed/>
          </>}

          <circle cx={ox} cy={oy} r="3" fill="#475569"/>
          <text x={10} y={H-8} fontSize="9" fontFamily="monospace" fill="#94a3b8">
            M=[[{a},{b}],[{c},{d}]]
          </text>
        </svg>
      </div>

      <div className="flex justify-between">
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))} disabled={step===STEPS.length-1}
          className="px-4 py-2 rounded-lg text-sm bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
