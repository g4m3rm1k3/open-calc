import { useState, useRef, useCallback } from 'react';

const W = 360, H = 300, CX = 180, CY = 150, SC = 52;
const toS = (x, y) => [CX + x * SC, CY - y * SC];

function Arrow({ x1,y1,x2,y2,color,w=2.5,dashed=false,opacity=1 }) {
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
  if(len<2)return null;
  const ux=dx/len,uy=dy/len,hl=9;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w}
        strokeDasharray={dashed?'6,4':undefined} strokeLinecap="round"/>
      <polygon points={`${x2},${y2} ${x2-ux*hl-uy*4},${y2-uy*hl+ux*4} ${x2-ux*hl+uy*4},${y2-uy*hl-ux*4}`} fill={color}/>
    </g>
  );
}

const STEPS = [
  {
    title:'The Parallelogram Area',
    body:'Two vectors v₁ and v₂ form a parallelogram. The determinant equals the signed area of that parallelogram. Drag the vector tips to reshape it.',
    formula:'det[v₁ v₂] = v₁ₓ·v₂ᵧ − v₁ᵧ·v₂ₓ',
  },{
    title:'Positive vs Negative Determinant',
    body:'When v₂ is to the LEFT of v₁ (counterclockwise), det > 0. When it\'s to the RIGHT (clockwise), det < 0. The sign encodes orientation — it tells you if space is "flipped".',
    formula:'det > 0 → CCW orientation   det < 0 → flipped',
  },{
    title:'Zero Determinant = Collapse',
    body:'When the two columns are parallel (one is a multiple of the other), the parallelogram collapses to a line segment. Area = 0. The matrix is singular — it squashes a whole dimension to zero. No inverse exists.',
    formula:'det = 0 ↔ columns are dependent ↔ no inverse',
  },{
    title:'Scale by a Matrix = Scale the Determinant',
    body:'If you apply matrix M to a region, the area scales by |det(M)|. A 2× scaling matrix has det = 4 (area doubles in each direction → 2×2). This is why determinants appear in change-of-variables in integration.',
    formula:'Area(M·region) = |det(M)| · Area(region)',
  },
];

const PRESETS = [
  { label:'Default', v1:[1,0.5], v2:[0.3,1.2] },
  { label:'Flipped (det<0)', v1:[1,0], v2:[0,-1] },
  { label:'Singular (det=0)', v1:[1,0.5], v2:[2,1] },
  { label:'Orthogonal', v1:[1,0], v2:[0,1] },
];

export default function DeterminantGeometricViz() {
  const [step, setStep] = useState(0);
  const [v1, setV1] = useState([1, 0.4]);
  const [v2, setV2] = useState([0.2, 1.2]);
  const dragging = useRef(null);
  const svgRef = useRef(null);
  const s = STEPS[step];

  const det = v1[0]*v2[1] - v1[1]*v2[0];
  const absDet = Math.abs(det).toFixed(3);
  const sign = det > 0.001 ? 'positive (CCW)' : det < -0.001 ? 'negative (CW)' : 'zero (singular!)';
  const signColor = det > 0.001 ? '#22c55e' : det < -0.001 ? '#ef4444' : '#f59e0b';

  const [ox, oy] = toS(0,0);
  const [v1sx, v1sy] = toS(...v1);
  const [v2sx, v2sy] = toS(...v2);
  // Parallelogram: 0 → v1 → v1+v2 → v2
  const [sumx, sumy] = toS(v1[0]+v2[0], v1[1]+v2[1]);

  const svgPt = useCallback((clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - CX) / SC;
    const y = -(clientY - rect.top - CY) / SC;
    return [x, y];
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragging.current) return;
    const [x, y] = svgPt(e.clientX, e.clientY);
    const snapped = [Math.round(x*4)/4, Math.round(y*4)/4];
    if (dragging.current === 1) setV1(snapped);
    else setV2(snapped);
  }, [svgPt]);

  const fillColor = det > 0 ? '#6366f1' : '#ef4444';

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Determinant as Area</h3>
          <span className="text-xs text-slate-400">{step+1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {STEPS.map((_,i)=>(
            <button key={i} onClick={()=>setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i===step?'bg-emerald-50 dark:bg-emerald-900/300':i<step?'bg-emerald-300 dark:bg-emerald-700':'bg-slate-200 dark:bg-slate-700'}`}/>
          ))}
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 mb-3">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1 text-sm">{s.title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
          <p className="mt-2 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center text-slate-700 dark:text-slate-200">{s.formula}</p>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1 mb-3">
        {PRESETS.map(p => (
          <button key={p.label} onClick={()=>{setV1(p.v1);setV2(p.v2);}}
            className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-400 dark:border-emerald-600/50 transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-3 text-xs font-mono">
        <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-600 dark:text-slate-300">
          v₁=[{v1[0]},{v1[1]}]
        </span>
        <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-slate-600 dark:text-slate-300">
          v₂=[{v2[0]},{v2[1]}]
        </span>
        <span className="bg-white dark:bg-slate-800 border rounded px-2 py-1" style={{borderColor:signColor,color:signColor}}>
          det={det.toFixed(3)} ({sign})
        </span>
      </div>

      {/* Canvas */}
      <div className="flex justify-center mb-3">
        <svg ref={svgRef} width={W} height={H}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-crosshair"
          onMouseMove={onMouseMove}
          onMouseUp={()=>{dragging.current=null;}}
          onMouseLeave={()=>{dragging.current=null;}}>

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

          {/* Parallelogram */}
          <polygon
            points={`${ox},${oy} ${v1sx},${v1sy} ${sumx},${sumy} ${v2sx},${v2sy}`}
            fill={fillColor} fillOpacity="0.18" stroke={fillColor} strokeWidth="1.5"/>

          {/* Area label */}
          <text x={(ox+v1sx+sumx+v2sx)/4-10} y={(oy+v1sy+sumy+v2sy)/4+4}
            fontSize="11" fontWeight="700" fill={fillColor} fontFamily="monospace">
            |{absDet}|
          </text>

          {/* Vectors */}
          <Arrow x1={ox} y1={oy} x2={v1sx} y2={v1sy} color="#ef4444" w={3}/>
          <Arrow x1={ox} y1={oy} x2={v2sx} y2={v2sy} color="#6366f1" w={3}/>
          {/* Dashed completions */}
          <Arrow x1={v2sx} y1={v2sy} x2={sumx} y2={sumy} color="#ef4444" w={1.5} dashed opacity={0.5}/>
          <Arrow x1={v1sx} y1={v1sy} x2={sumx} y2={sumy} color="#6366f1" w={1.5} dashed opacity={0.5}/>

          {/* Labels */}
          <text x={v1sx+6} y={v1sy} fontSize="12" fontWeight="700" fill="#ef4444">v₁</text>
          <text x={v2sx+6} y={v2sy} fontSize="12" fontWeight="700" fill="#6366f1">v₂</text>

          {/* Drag handles */}
          <circle cx={v1sx} cy={v1sy} r="7" fill="#ef4444" opacity="0.85" style={{cursor:'grab'}}
            onMouseDown={()=>{dragging.current=1;}}/>
          <circle cx={v2sx} cy={v2sy} r="7" fill="#6366f1" opacity="0.85" style={{cursor:'grab'}}
            onMouseDown={()=>{dragging.current=2;}}/>
          <circle cx={ox} cy={oy} r="3" fill="#475569"/>
        </svg>
      </div>

      <div className="text-[10px] text-slate-400 text-center mb-3">Drag the vector tips to reshape the parallelogram</div>

      <div className="flex justify-between">
        <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}
          className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200">
          ← Back
        </button>
        <button onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))} disabled={step===STEPS.length-1}
          className="px-4 py-2 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-30">
          Next →
        </button>
      </div>
    </div>
  );
}
