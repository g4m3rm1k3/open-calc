import { useState } from 'react';

const W = 380, H = 310;
// Standard basis view: CX=120, CY=155  |  New basis view: CX=260, CY=155
const CX1 = 115, CY1 = 155, SC1 = 45;
const CX2 = 265, CY2 = 155, SC2 = 45;

const toS1 = (x,y) => [CX1+x*SC1, CY1-y*SC1];
const toS2 = (x,y) => [CX2+x*SC2, CY2-y*SC2];

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

const BASES = [
  { label:'45° rotated', b1:[0.707,0.707], b2:[-0.707,0.707] },
  { label:'Scaled', b1:[2,0], b2:[0,0.5] },
  { label:'Skewed', b1:[1,0.5], b2:[0,1] },
  { label:'Standard', b1:[1,0], b2:[0,1] },
];

const STEPS = [
  {
    title:'Same Vector, Two Languages',
    body:'The purple vector is fixed in space — it doesn\'t move. But how we describe it depends on which "ruler" we use. In the standard basis (left), we say its coordinates. In a new basis (right), the same arrow gets different numbers.',
    formula:'v = 3e₁ + 1e₂  ←→  v = αb₁ + βb₂',
  },{
    title:'Basis Vectors Define the Ruler',
    body:'A basis is just two non-parallel vectors you choose as your x-axis and y-axis. The coordinates of any other vector tell you "how many steps in the b₁ direction, how many in b₂?" This is a linear combination.',
    formula:'v = α·b₁ + β·b₂   (coordinates depend on basis!)',
  },{
    title:'Change of Basis = Multiply by a Matrix',
    body:'To convert coordinates between bases, you multiply by the change-of-basis matrix P (whose columns are the new basis vectors in standard coordinates). To go back, multiply by P⁻¹.',
    formula:'v_std = P · v_new    v_new = P⁻¹ · v_std',
  },{
    title:'Why It Matters',
    body:'Eigenvectors form the "natural basis" of a matrix — in that basis, the matrix is diagonal (just scaling). SVD finds the best orthogonal bases. PCA finds the best basis to express variance. Change of basis is how all of these work.',
    formula:'M = P D P⁻¹    (D diagonal in eigenbasis)',
  },
];

export default function ChangeOfBasisViz() {
  const [step, setStep] = useState(0);
  const [basisIdx, setBasisIdx] = useState(0);
  const [vx, setVx] = useState(2);
  const [vy, setVy] = useState(1);
  const s = STEPS[step];
  const basis = BASES[basisIdx];

  // New basis vectors
  const [b1x, b1y] = basis.b1;
  const [b2x, b2y] = basis.b2;

  // Solve: vx = α*b1x + β*b2x, vy = α*b1y + β*b2y
  const det = b1x*b2y - b1y*b2x;
  const alpha = det!==0 ? (vx*b2y - vy*b2x)/det : 0;
  const beta  = det!==0 ? (b1x*vy - b1y*vx)/det : 0;

  const [ox1,oy1]=toS1(0,0), [ox2,oy2]=toS2(0,0);
  const [vsx1,vsy1]=toS1(vx,vy), [vsx2,vsy2]=toS2(vx,vy);
  const [b1sx,b1sy]=toS2(b1x,b1y), [b2sx,b2sy]=toS2(b2x,b2y);
  // α*b1 and β*b2 components in standard coords (for display in right panel)
  const [ab1x,ab1y]=toS2(alpha*b1x, alpha*b1y);
  const [bb2x,bb2y]=toS2(beta*b2x, beta*b2y);

  const Grid1 = () => {
    const ls=[];
    for(let i=-3;i<=3;i++){
      const [ax,ay]=toS1(i,-3),[bx,by]=toS1(i,3);
      const [cx,cy]=toS1(-3,i),[dx,dy]=toS1(3,i);
      ls.push(<line key={`v${i}`} x1={ax} y1={ay} x2={bx} y2={by} stroke="#334155" strokeWidth="0.5" opacity="0.2"/>);
      ls.push(<line key={`h${i}`} x1={cx} y1={cy} x2={dx} y2={dy} stroke="#334155" strokeWidth="0.5" opacity="0.2"/>);
    }
    return <g>{ls}</g>;
  };

  const Grid2 = () => {
    const ls=[];
    // Draw grid lines along b1 and b2 directions
    for(let i=-4;i<=4;i++){
      const [ax,ay]=toS2(i*b1x-4*b2x, i*b1y-4*b2y);
      const [bx,by]=toS2(i*b1x+4*b2x, i*b1y+4*b2y);
      const [cx,cy]=toS2(-4*b1x+i*b2x, -4*b1y+i*b2y);
      const [dx,dy]=toS2( 4*b1x+i*b2x,  4*b1y+i*b2y);
      ls.push(<line key={`b1${i}`} x1={ax} y1={ay} x2={bx} y2={by} stroke="#7c3aed" strokeWidth="0.5" opacity="0.2"/>);
      ls.push(<line key={`b2${i}`} x1={cx} y1={cy} x2={dx} y2={dy} stroke="#7c3aed" strokeWidth="0.5" opacity="0.2"/>);
    }
    return <g>{ls}</g>;
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Change of Basis</h3>
          <span className="text-xs text-slate-400">{step+1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_,i)=>(
            <button key={i} onClick={()=>setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i===step?'bg-violet-500':i<step?'bg-violet-300 dark:bg-violet-700':'bg-slate-200 dark:bg-slate-700'}`}/>
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-2">
          <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1 text-sm">{s.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
          <p className="mt-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center text-slate-700 dark:text-slate-200">{s.formula}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <div className="flex gap-1">
          {BASES.map((b,i)=>(
            <button key={b.label} onClick={()=>setBasisIdx(i)}
              className={`text-[9px] px-2 py-0.5 rounded border transition-colors ${i===basisIdx?'bg-violet-600 text-white border-violet-600':'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'}`}>
              {b.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto text-xs">
          <span className="text-slate-400 font-mono">vx</span>
          <input type="range" min="-2.5" max="2.5" step="0.25" value={vx} onChange={e=>setVx(parseFloat(e.target.value))} className="w-20 accent-violet-500"/>
          <span className="text-slate-400 font-mono">vy</span>
          <input type="range" min="-2.5" max="2.5" step="0.25" value={vy} onChange={e=>setVy(parseFloat(e.target.value))} className="w-20 accent-violet-500"/>
        </div>
      </div>

      {/* Coordinate display */}
      <div className="flex gap-2 mb-3 text-xs font-mono">
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5">
          <div className="text-slate-400 text-[9px] mb-0.5">Standard [e₁,e₂]</div>
          <div className="text-slate-800 dark:text-slate-100">v = [{vx}, {vy}]</div>
        </div>
        <div className="flex-1 bg-white dark:bg-slate-800 border border-violet-300 dark:border-violet-700 rounded px-2 py-1.5">
          <div className="text-violet-400 text-[9px] mb-0.5">New basis [b₁,b₂]</div>
          <div className="text-violet-700 dark:text-violet-300">v = [{alpha.toFixed(2)}, {beta.toFixed(2)}]</div>
        </div>
      </div>

      {/* Dual canvas */}
      <div className="flex justify-center mb-3">
        <svg width={W} height={H} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
          {/* Divider */}
          <line x1={W/2} y1={0} x2={W/2} y2={H} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4,4" className="dark:stroke-slate-700"/>
          <text x={CX1} y={14} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">STANDARD BASIS</text>
          <text x={CX2} y={14} textAnchor="middle" fontSize="9" fill="#7c3aed" fontWeight="600">NEW BASIS</text>

          {/* Left panel — standard */}
          <Grid1/>
          <line x1={20} y1={CY1} x2={W/2-5} y2={CY1} stroke="#94a3b8" strokeWidth="1"/>
          <line x1={CX1} y1={20} x2={CX1} y2={H-10} stroke="#94a3b8" strokeWidth="1"/>
          <Arrow x1={ox1} y1={oy1} x2={toS1(1,0)[0]} y2={toS1(1,0)[1]} color="#ef4444" w={2}/>
          <Arrow x1={ox1} y1={oy1} x2={toS1(0,1)[0]} y2={toS1(0,1)[1]} color="#22c55e" w={2}/>
          <Arrow x1={ox1} y1={oy1} x2={vsx1} y2={vsy1} color="#a855f7" w={3}/>
          <text x={vsx1+6} y={vsy1} fontSize="11" fontWeight="700" fill="#a855f7">v</text>
          <text x={toS1(1,0)[0]+4} y={toS1(1,0)[1]} fontSize="10" fill="#ef4444">e₁</text>
          <text x={toS1(0,1)[0]+4} y={toS1(0,1)[1]} fontSize="10" fill="#22c55e">e₂</text>
          <text x={20} y={H-8} fontSize="9" fontFamily="monospace" fill="#94a3b8">[{vx},{vy}]</text>
          <circle cx={ox1} cy={oy1} r="3" fill="#475569"/>

          {/* Right panel — new basis */}
          <Grid2/>
          <line x1={W/2+5} y1={CY2} x2={W-10} y2={CY2} stroke="#94a3b8" strokeWidth="1"/>
          <line x1={CX2} y1={20} x2={CX2} y2={H-10} stroke="#94a3b8" strokeWidth="1"/>
          <Arrow x1={ox2} y1={oy2} x2={b1sx} y2={b1sy} color="#f97316" w={2.5}/>
          <Arrow x1={ox2} y1={oy2} x2={b2sx} y2={b2sy} color="#06b6d4" w={2.5}/>
          {/* α·b1 component */}
          <Arrow x1={ox2} y1={oy2} x2={ab1x} y2={ab1y} color="#f97316" w={1.5} dashed opacity={0.7}/>
          {/* β·b2 component from tip of α·b1 */}
          <Arrow x1={ab1x} y1={ab1y} x2={vsx2} y2={vsy2} color="#06b6d4" w={1.5} dashed opacity={0.7}/>
          {/* Full vector */}
          <Arrow x1={ox2} y1={oy2} x2={vsx2} y2={vsy2} color="#a855f7" w={3}/>
          <text x={b1sx+5} y={b1sy} fontSize="10" fontWeight="700" fill="#f97316">b₁</text>
          <text x={b2sx+5} y={b2sy} fontSize="10" fontWeight="700" fill="#06b6d4">b₂</text>
          <text x={vsx2+5} y={vsy2} fontSize="11" fontWeight="700" fill="#a855f7">v</text>
          <text x={W/2+8} y={H-8} fontSize="9" fontFamily="monospace" fill="#7c3aed">[{alpha.toFixed(2)},{beta.toFixed(2)}]</text>
          <circle cx={ox2} cy={oy2} r="3" fill="#475569"/>
        </svg>
      </div>

      <div className="flex justify-between">
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))} disabled={step===STEPS.length-1}
          className="px-4 py-2 rounded-lg text-sm bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
