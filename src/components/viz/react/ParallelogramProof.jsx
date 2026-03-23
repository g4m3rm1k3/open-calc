import { useState } from "react";

const STEPS = [
  { title: "Define the resultant", eq: "R⃗ = A⃗ + B⃗", highlight: "define", insight: "The resultant is defined as the vector sum. We want to understand why this equals the parallelogram diagonal." },
  { title: "Expand into unit vectors", eq: "R⃗ = (Aₓî + Aᵧĵ) + (Bₓî + Bᵧĵ)", highlight: "expand", insight: "Replace each vector with its unit-vector expansion. Now the addition is fully explicit." },
  { title: "Sum components", eq: "R⃗ = (Aₓ+Bₓ)î + (Aᵧ+Bᵧ)ĵ", highlight: "sum", insight: "Collect î and ĵ terms. Addition is done axis by axis — ordinary arithmetic." },
  { title: "Read off the components", eq: "Rₓ = Aₓ+Bₓ,   Rᵧ = Aᵧ+Bᵧ", highlight: "components", insight: "Each resultant component equals the sum of the matching components. This is the computation step." },
  { title: "Geometric interpretation", eq: "Corners: 0, A⃗, B⃗, A⃗+B⃗  →  diagonal = R⃗", highlight: "geometry", insight: "The four corners of the parallelogram are exactly the four points 0, A⃗, B⃗, and A⃗+B⃗. The diagonal from 0 to A⃗+B⃗ is R⃗. Geometry and algebra say the same thing." },
];

const W = 300, H = 220, SC = 46, CX = 100, CY = 155;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }

const VA = [2.2, 0.8], VB = [0.9, 1.9];
const VR = [VA[0]+VB[0], VA[1]+VB[1]];

function SArrow({ from, to, color, w=2.5, dashed=false, opacity=1, label, lo=[8,-8] }) {
  const [fx,fy]=ts(from[0],from[1]), [tx,ty]=ts(to[0],to[1]);
  const dx=tx-fx, dy=ty-fy, len=Math.sqrt(dx*dx+dy*dy);
  if (len<3) return null;
  const ux=dx/len, uy=dy/len, hl=10;
  const ex=tx-ux*hl, ey=ty-uy*hl;
  return (
    <g opacity={opacity} style={{transition:"opacity 0.4s"}}>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeDasharray={dashed?"5 3":"none"} strokeLinecap="round"/>
      <polygon points={`${tx},${ty} ${ex-uy*5},${ey+ux*5} ${ex+uy*5},${ey-ux*5}`} fill={color}/>
      {label && <text x={tx+lo[0]} y={ty+lo[1]} fill={color} fontSize={12} fontWeight="700">{label}</text>}
    </g>
  );
}

export default function ParallelogramProof({ params={} }) {
  const step = STEPS[Math.min(params.currentStep??0, STEPS.length-1)];
  const h = step.highlight;

  const showA = true, showB = ["expand","sum","components","geometry"].includes(h);
  const showGhost = ["sum","components","geometry"].includes(h);
  const showR = ["sum","components","geometry"].includes(h);
  const showFill = h === "geometry";
  const showCLabels = ["components","geometry"].includes(h);

  const [ox,oy]=ts(0,0);
  const [ax,ay]=ts(VA[0],VA[1]), [bx,by]=ts(VB[0],VB[1]), [rx,ry]=ts(VR[0],VR[1]);
  const [px,py]=ts(VA[0],0), [qx,qy]=ts(VR[0],0);
  const para = [ts(0,0),ts(VA[0],VA[1]),ts(VR[0],VR[1]),ts(VB[0],VB[1])].map(([x,y])=>`${x},${y}`).join(" ");

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px 0",display:"flex",alignItems:"center",gap:10}}>
        <span style={{background:"#1e293b",color:"#6366f1",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>
          STEP {Math.min(params.currentStep??0,STEPS.length-1)+1}/{STEPS.length}
        </span>
        <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{step.title}</span>
      </div>
      <div style={{margin:"10px 20px",padding:"11px 16px",background:"#1e293b",borderRadius:10,
        fontFamily:"'Fira Code',monospace",fontSize:14,color:"#a5b4fc",borderLeft:"3px solid #6366f1"}}>
        {step.eq}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
          {[-2,-1,0,1,2,3].map(i=>{
            const [x1,y1]=ts(i,-3),[x2,y2]=ts(i,3);
            const [x3,y3]=ts(-2,i),[x4,y4]=ts(4,i);
            return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/>
              <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;
          })}
          <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>

          {showFill && <polygon points={para} fill="#6366f1" opacity={0.08}/>}
          {showGhost && <><SArrow from={VB} to={VR} color="#6366f1" dashed opacity={0.4}/>
            <SArrow from={VA} to={VR} color="#f59e0b" dashed opacity={0.4}/></>}

          <SArrow from={[0,0]} to={VA} color="#6366f1" label="A⃗" lo={[8,-10]}/>
          {showB && <SArrow from={[0,0]} to={VB} color="#f59e0b" label="B⃗" lo={[8,-8]}/>}
          {showR && <SArrow from={[0,0]} to={VR} color="#10b981" w={3} label="R⃗" lo={[8,-10]}/>}

          {showCLabels && (
            <>
              <line x1={ox} y1={oy} x2={qx} y2={oy} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.6}/>
              <text x={(ox+qx)/2} y={oy+16} fill="#f59e0b" fontSize={10} textAnchor="middle">Rₓ=Aₓ+Bₓ</text>
            </>
          )}
          <circle cx={CX} cy={CY} r={3.5} fill="#475569"/>
        </svg>

        <div style={{padding:"16px 16px 16px 0",display:"flex",flexDirection:"column",gap:8}}>
          {[
            {show:true, label:"A⃗ component", formula:`Aₓ=${VA[0]}, Aᵧ=${VA[1]}`, color:"#6366f1"},
            {show:showB, label:"B⃗ component", formula:`Bₓ=${VB[0]}, Bᵧ=${VB[1]}`, color:"#f59e0b"},
            {show:showR, label:"R⃗ = A⃗ + B⃗", formula:`Rₓ=${VR[0].toFixed(1)}, Rᵧ=${VR[1].toFixed(1)}`, color:"#10b981"},
          ].map(({show,label,formula,color})=>(
            <div key={label} style={{background:"#1e293b",borderRadius:8,padding:"10px 12px",
              opacity:show?1:0.2,transition:"opacity 0.4s",borderLeft:`3px solid ${color}`}}>
              <div style={{fontSize:10,color:"#64748b"}}>{label}</div>
              <div style={{fontSize:13,fontFamily:"'Fira Code',monospace",color}}>{formula}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{margin:"0 20px 20px",padding:"11px 15px",background:"#0c1a2e",
        borderRadius:10,borderLeft:"3px solid #0ea5e9",fontSize:13,color:"#94a3b8",lineHeight:1.6}}>
        <span style={{color:"#38bdf8",fontWeight:600}}>Insight: </span>{step.insight}
      </div>
    </div>
  );
}
