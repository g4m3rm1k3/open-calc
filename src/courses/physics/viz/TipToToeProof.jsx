import { useState } from "react";

const STEPS=[
  {title:"Define A⃗ + B⃗ by components",eq:"A⃗ + B⃗ = (Aₓ+Bₓ, Aᵧ+Bᵧ)",insight:"Component addition is the definition. We'll show swapping gives the same result."},
  {title:"Swap: B⃗ + A⃗",eq:"B⃗ + A⃗ = (Bₓ+Aₓ, Bᵧ+Aᵧ)",insight:"Apply the same definition with A and B exchanged."},
  {title:"Real-number commutativity",eq:"Aₓ+Bₓ = Bₓ+Aₓ  and  Aᵧ+Bᵧ = Bᵧ+Aᵧ",insight:"Ordinary real-number addition is commutative. Each component obeys this independently."},
  {title:"Conclusion",eq:"∴  A⃗ + B⃗ = B⃗ + A⃗  ✓",insight:"Vector addition is commutative because it reduces to adding real numbers component-by-component, and real addition is commutative."},
];

const W=280,H=200,SC=44,CX=100,CY=150;
function ts(x,y){return[CX+x*SC,CY-y*SC];}
const VA=[2.0,0.8],VB=[0.8,1.8];
const VR=[VA[0]+VB[0],VA[1]+VB[1]];

function Arrow({from,to,color,w=2.5,dashed=false,label,lo=[8,-8]}){
  const [fx,fy]=ts(from[0],from[1]),[tx,ty]=ts(to[0],to[1]);
  const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);
  if(len<3)return null;
  const ux=dx/len,uy=dy/len,hl=10;
  const ex=tx-ux*hl,ey=ty-uy*hl;
  return(
    <g>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w}
        strokeDasharray={dashed?"5 3":"none"} strokeLinecap="round"/>
      <polygon points={`${tx},${ty} ${ex-uy*4.5},${ey+ux*4.5} ${ex+uy*4.5},${ey-ux*4.5}`} fill={color}/>
      {label&&<text x={tx+lo[0]} y={ty+lo[1]} fill={color} fontSize={12} fontWeight="700">{label}</text>}
    </g>
  );
}

export default function TipToToeProof({params={}}){
  const step=STEPS[Math.min(params.currentStep??0,STEPS.length-1)];
  const si=Math.min(params.currentStep??0,STEPS.length-1);
  const [ox,oy]=ts(0,0);

  // Left chain: A then B
  // Right chain: B then A — offset to the right
  const showBoth=si>=1;
  const showConclusion=si>=3;
  const OX2=CX+W+20; // second diagram origin

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px 0",display:"flex",alignItems:"center",gap:10}}>
        <span style={{background:"#1e293b",color:"#f59e0b",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>
          STEP {si+1}/{STEPS.length}
        </span>
        <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{step.title}</span>
      </div>
      <div style={{margin:"10px 20px",padding:"11px 16px",background:"#1e293b",borderRadius:10,
        fontFamily:"'Fira Code',monospace",fontSize:14,color:"#fcd34d",borderLeft:"3px solid #f59e0b"}}>
        {step.eq}
      </div>

      {/* Two diagrams side by side */}
      <svg width="100%" viewBox={`0 0 ${W*2+20} ${H}`} style={{display:"block"}}>
        {/* Axes left */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>

        {/* Left: A then B */}
        <Arrow from={[0,0]} to={VA} color="#6366f1" label="A⃗" lo={[8,-10]}/>
        <Arrow from={VA} to={VR} color="#f59e0b" label="B⃗" lo={[8,-8]}/>
        <Arrow from={[0,0]} to={VR} color="#10b981" w={3} dashed label="R⃗" lo={[8,-10]}/>
        <circle cx={CX} cy={CY} r={3} fill="#475569"/>
        {!showBoth&&<text x={CX+4} y={CY-60} fill="#64748b" fontSize={10}>A⃗ then B⃗</text>}

        {/* Right: B then A */}
        {showBoth&&(()=>{
          const ox2=OX2,oy2=CY;
          function ts2(x,y){return[ox2+x*SC,oy2-y*SC];}
          const [f1x,f1y]=ts2(0,0);
          const [b1x,b1y]=ts2(VB[0],VB[1]);
          const [r2x,r2y]=ts2(VR[0],VR[1]);
          const [a2x,a2y]=ts2(VA[0],VA[1]);
          const [ex,ey]=ts2(VB[0]-VA[0]+(VA[0]+VB[0]),VB[1]-VA[1]+(VA[1]+VB[1]));

          function Arr2({from,to,color,w=2.5,label,dashed=false}){
            const [fx,fy]=ts2(from[0],from[1]),[tx,ty]=ts2(to[0],to[1]);
            const dx=tx-fx,dy=ty-fy,len=Math.sqrt(dx*dx+dy*dy);
            if(len<3)return null;
            const ux=dx/len,uy=dy/len,hl=10;
            const ex2=tx-ux*hl,ey2=ty-uy*hl;
            return(
              <g>
                <line x1={fx} y1={fy} x2={ex2} y2={ey2} stroke={color} strokeWidth={w}
                  strokeDasharray={dashed?"5 3":"none"} strokeLinecap="round"/>
                <polygon points={`${tx},${ty} ${ex2-uy*4.5},${ey2+ux*4.5} ${ex2+uy*4.5},${ey2-ux*4.5}`} fill={color}/>
                {label&&<text x={tx+8} y={ty-8} fill={color} fontSize={12} fontWeight="700">{label}</text>}
              </g>
            );
          }
          return(
            <>
              <line x1={ox2-CX} y1={oy2} x2={ox2+W-CX} y2={oy2} stroke="#1e293b" strokeWidth={1}/>
              <line x1={ox2} y1={0} x2={ox2} y2={H} stroke="#1e293b" strokeWidth={1}/>
              <Arr2 from={[0,0]} to={VB} color="#f59e0b" label="B⃗"/>
              <Arr2 from={VB} to={VR} color="#6366f1" label="A⃗"/>
              <Arr2 from={[0,0]} to={VR} color="#10b981" w={3} dashed label="R⃗"/>
              <circle cx={ox2} cy={oy2} r={3} fill="#475569"/>
              <text x={ox2+4} y={oy2-60} fill="#64748b" fontSize={10}>B⃗ then A⃗</text>
              {showConclusion&&(
                <text x={ox2-CX+W/2} y={H-8} fill="#10b981" fontSize={11} textAnchor="middle">same endpoint ✓</text>
              )}
            </>
          );
        })()}
        {!showBoth&&<text x={CX+4} y={CY-60} fill="#64748b" fontSize={10}>A⃗ then B⃗</text>}
      </svg>

      <div style={{margin:"0 20px 20px",padding:"11px 15px",background:"#0c1a2e",
        borderRadius:10,borderLeft:"3px solid #0ea5e9",fontSize:13,color:"#94a3b8",lineHeight:1.6}}>
        <span style={{color:"#38bdf8",fontWeight:600}}>Insight: </span>{step.insight}
      </div>
    </div>
  );
}
