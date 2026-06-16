import { useState } from 'react';

const W = 370, H = 300, CX = 185, CY = 150, SC = 48;
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

// Matrices with known subspace structure
const EXAMPLES = [
  {
    label:'Rank 2 (full)',
    a:2,b:1,c:0,d:1,
    desc:'Full rank 2×2: column space is all of ℝ², null space is just {0}.',
  },{
    label:'Rank 1 (line out)',
    a:1,b:2,c:0.5,d:1,
    desc:'Rank 1: both columns are multiples of each other. Column space is a LINE. Null space is a LINE (all vectors that map to zero).',
  },{
    label:'Zero map',
    a:0,b:0,c:0,d:0,
    desc:'Zero matrix: everything maps to zero. Column space = {0}. Null space = all of ℝ².',
  },{
    label:'Projection',
    a:1,b:0,c:0,d:0,
    desc:'Projects onto x-axis. Column space = x-axis. Null space = y-axis. Rank + Nullity = 1 + 1 = 2.',
  },
];

const STEPS = [
  {
    title:'Column Space: Where Does M Send Things?',
    body:'The column space (range) of M is the set of all possible outputs M·x as x ranges over all inputs. It\'s spanned by the columns of M. Geometrically, it\'s the "landing zone" — the image.',
    phase:'col',
    formula:'Col(M) = span{col₁, col₂}   dim = rank(M)',
  },{
    title:'Null Space: What Maps to Zero?',
    body:'The null space (kernel) of M is all vectors x such that Mx = 0. They are the directions that get "crushed" to zero. If M is invertible, null space is only the zero vector.',
    phase:'null',
    formula:'Null(M) = {x : Mx = 0}   dim = nullity(M)',
  },{
    title:'Rank-Nullity Theorem',
    body:'rank + nullity = n (number of columns). Every dimension you "lose" in the null space is a dimension you also "lose" in the output (column space). They perfectly balance.',
    phase:'both',
    formula:'rank(M) + nullity(M) = n   (always!)',
  },{
    title:'The Four Fundamental Subspaces',
    body:'Every matrix has four: Column space, Null space, Row space, and Left null space. The column space and left null space are orthogonal complements — they together span the full output space. Same for row space and null space in input.',
    phase:'four',
    formula:'Col(M) ⊥ Null(Mᵀ)   Row(M) ⊥ Null(M)',
  },
];

function InputSamples({a,b,c,d}) {
  // Draw a fan of input vectors and their images
  const N=12;
  const arrows=[];
  const [ox,oy]=toS(0,0);
  for(let i=0;i<N;i++){
    const θ=(i/N)*2*Math.PI;
    const ix=Math.cos(θ)*0.9, iy=Math.sin(θ)*0.9;
    const mx=a*ix+b*iy, my=c*ix+d*iy;
    const [isx,isy]=toS(ix,iy);
    const [msx,msy]=toS(mx,my);
    arrows.push(<line key={`i${i}`} x1={ox} y1={oy} x2={isx} y2={isy} stroke="#94a3b8" strokeWidth="1" opacity="0.3"/>);
    arrows.push(<line key={`m${i}`} x1={ox} y1={oy} x2={msx} y2={msy} stroke="#22d3ee" strokeWidth="1.5" opacity="0.5"/>);
  }
  return <g>{arrows}</g>;
}

export default function NullSpaceColumnSpaceViz() {
  const [step,setStep]=useState(0);
  const [exIdx,setExIdx]=useState(0);
  const s=STEPS[step];
  const ex=EXAMPLES[exIdx];
  const {a,b,c,d}=ex;

  const [ox,oy]=toS(0,0);

  // Column vectors
  const col1=toS(a,c);
  const col2=toS(b,d);

  // Null space: solve [a b; c d][x y]^T = 0
  // If rank 2, null = {0}; if rank 1, null = direction
  const det=a*d-b*c;
  const isRank1=Math.abs(det)<0.01&&(Math.abs(a)+Math.abs(b)+Math.abs(c)+Math.abs(d))>0.01;
  const isZero=Math.abs(a)+Math.abs(b)+Math.abs(c)+Math.abs(d)<0.01;

  // Null direction (if rank 1): M·[b,-a]^T=0 (perpendicular to row [a,b] if single row)
  // More generally, null = kernel. For rank 1, use [−b,a] normalized
  const nullLen=Math.hypot(b,a)||1;
  const nv=[b/nullLen, -a/nullLen]; // Null direction for row [a,b] → [-b,a] (if c/d parallel)
  // Actually for Mx=0: ax+by=0, cx+dy=0. If rank 1 they're parallel. Null dir: [-b,a]/norm
  const nullDir=[-b/nullLen, a/nullLen];
  const [n1x,n1y]=toS(nullDir[0]*2.5,nullDir[1]*2.5);
  const [n1nx,n1ny]=toS(-nullDir[0]*2.5,-nullDir[1]*2.5);

  // Row space direction (for rank 1): [a,b]/norm
  const rowLen=Math.hypot(a,b)||1;
  const rowDir=[a/rowLen,b/rowLen];
  const [r1x,r1y]=toS(rowDir[0]*2.5,rowDir[1]*2.5);
  const [r1nx,r1ny]=toS(-rowDir[0]*2.5,-rowDir[1]*2.5);

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Column Space & Null Space</h3>
          <span className="text-xs text-slate-400">{step+1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_,i)=>(
            <button key={i} onClick={()=>setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i===step?'bg-orange-50 dark:bg-orange-900/300':i<step?'bg-orange-300 dark:bg-orange-700':'bg-slate-200 dark:bg-slate-700'}`}/>
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-2">
          <p className="font-semibold text-orange-600 dark:text-orange-400 mb-1 text-sm">{s.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
          <p className="mt-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center text-slate-700 dark:text-slate-200">{s.formula}</p>
        </div>
      </div>

      {/* Example selector */}
      <div className="flex flex-wrap gap-1 mb-3">
        {EXAMPLES.map((e,i)=>(
          <button key={e.label} onClick={()=>setExIdx(i)}
            className={`text-[9px] px-2 py-1 rounded border transition-colors ${i===exIdx?'bg-orange-50 dark:bg-orange-900/300 text-white border-orange-500':'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-orange-400 dark:border-orange-600/50'}`}>
            {e.label}
          </button>
        ))}
      </div>

      <div className="mb-3 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-3 py-1.5">
        {ex.desc}
      </div>

      {/* Stats row */}
      <div className="flex gap-2 mb-3 text-xs font-mono flex-wrap">
        <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-600 dark:text-slate-300">
          M=[[{a},{b}],[{c},{d}]]
        </span>
        <span className={`bg-white dark:bg-slate-800 border rounded px-2 py-1 ${isZero?'border-yellow-400 dark:border-yellow-600/50 text-yellow-600 dark:text-yellow-400':isRank1?'border-orange-400 dark:border-orange-600/50 text-orange-600 dark:text-orange-400':'border-green-400 dark:border-green-600/50 text-green-600 dark:text-green-400'}`}>
          rank={isZero?0:isRank1?1:2}
        </span>
        <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-500">
          nullity={isZero?2:isRank1?1:0}
        </span>
      </div>

      {/* Canvas */}
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          {/* Grid */}
          {[-3,-2,-1,0,1,2,3].map(i=>{
            const [ax,ay]=toS(i,-3),[bx,by]=toS(i,3);
            const [cx2,cy2]=toS(-3,i),[dx2,dy2]=toS(3,i);
            return <g key={i}>
              <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#334155" strokeWidth="0.5" opacity="0.18"/>
              <line x1={cx2} y1={cy2} x2={dx2} y2={dy2} stroke="#334155" strokeWidth="0.5" opacity="0.18"/>
            </g>;
          })}
          <line x1={10} y1={CY} x2={W-10} y2={CY} stroke="#94a3b8" strokeWidth="1"/>
          <line x1={CX} y1={10} x2={CX} y2={H-10} stroke="#94a3b8" strokeWidth="1"/>

          {/* Input fan */}
          <InputSamples a={a} b={b} c={c} d={d}/>

          {/* Null space line */}
          {(s.phase==='null'||s.phase==='both'||s.phase==='four')&&isRank1&&(
            <line x1={n1x} y1={n1y} x2={n1nx} y2={n1ny}
              stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8,4" opacity="0.9"/>
          )}
          {(s.phase==='null'||s.phase==='both'||s.phase==='four')&&isRank1&&(
            <text x={n1x+5} y={n1y} fontSize="10" fontWeight="700" fill="#f59e0b">Null(M)</text>
          )}
          {(s.phase==='null'||s.phase==='both'||s.phase==='four')&&!isRank1&&!isZero&&(
            <circle cx={ox} cy={oy} r="6" fill="#f59e0b" opacity="0.7"/>
          )}
          {(s.phase==='null'||s.phase==='both'||s.phase==='four')&&!isRank1&&!isZero&&(
            <text x={ox+8} y={oy-8} fontSize="10" fontWeight="700" fill="#f59e0b">Null={'{'}0{'}'}</text>
          )}

          {/* Row space (for four subspaces) */}
          {s.phase==='four'&&isRank1&&(
            <line x1={r1x} y1={r1y} x2={r1nx} y2={r1ny}
              stroke="#a855f7" strokeWidth="2" strokeDasharray="8,4" opacity="0.6"/>
          )}
          {s.phase==='four'&&isRank1&&(
            <text x={r1x-40} y={r1y-8} fontSize="10" fontWeight="700" fill="#a855f7">Row(M)</text>
          )}

          {/* Column space vectors */}
          {(s.phase==='col'||s.phase==='both'||s.phase==='four')&&!isZero&&(
            <>
              <Arrow x1={ox} y1={oy} x2={col1[0]} y2={col1[1]} color="#22c55e" w={3}/>
              <Arrow x1={ox} y1={oy} x2={col2[0]} y2={col2[1]} color="#6366f1" w={3}/>
              <text x={col1[0]+5} y={col1[1]} fontSize="10" fontWeight="700" fill="#22c55e">c₁</text>
              <text x={col2[0]+5} y={col2[1]} fontSize="10" fontWeight="700" fill="#6366f1">c₂</text>
            </>
          )}
          {/* Col space line for rank 1 */}
          {(s.phase==='col'||s.phase==='both'||s.phase==='four')&&isRank1&&(
            <line x1={toS(-a/rowLen*3,-c/rowLen*3)[0]} y1={toS(-a/rowLen*3,-c/rowLen*3)[1]}
              x2={toS(a/rowLen*3,c/rowLen*3)[0]} y2={toS(a/rowLen*3,c/rowLen*3)[1]}
              stroke="#22d3ee" strokeWidth="2" strokeDasharray="4,4" opacity="0.5"/>
          )}
          {isZero&&<text x={CX-35} y={CY-8} fontSize="11" fontWeight="700" fill="#94a3b8">Col=Null=Row={'{'}0{'}'}</text>}

          <circle cx={ox} cy={oy} r="3" fill="#475569"/>

          {/* Legend */}
          <g transform={`translate(${W-110},${H-65})`}>
            <rect x="-2" y="-2" width="108" height="60" rx="4" fill="white" fillOpacity="0.85" className="dark:fill-slate-900"/>
            <circle cx="6" cy="10" r="4" fill="#22c55e"/>
            <text x="14" y="14" fontSize="9" fill="#22c55e">col₁ (column 1)</text>
            <circle cx="6" cy="24" r="4" fill="#6366f1"/>
            <text x="14" y="28" fontSize="9" fill="#6366f1">col₂ (column 2)</text>
            <line x1="2" y1="38" x2="12" y2="38" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,2"/>
            <text x="16" y="42" fontSize="9" fill="#f59e0b">null space</text>
            <line x1="2" y1="52" x2="12" y2="52" stroke="#22d3ee" strokeWidth="1.5" opacity="0.7"/>
            <text x="16" y="56" fontSize="9" fill="#22d3ee">outputs (image)</text>
          </g>
        </svg>
      </div>

      <div className="flex justify-between">
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))} disabled={step===STEPS.length-1}
          className="px-4 py-2 rounded-lg text-sm bg-orange-50 dark:bg-orange-900/300 text-white hover:bg-orange-600 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
