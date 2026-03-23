// NumericalMethodProof.jsx — Pillar 2
import { useState } from "react";
const STEPS=[
  {title:"Input: magnitude-angle form",eq:"A⃗ = (|A⃗|, θ_A),  B⃗ = (|B⃗|, θ_B)",insight:"Problems often give magnitude and angle. We need to convert to component form to add."},
  {title:"Step 1 — Decompose A⃗",eq:"Aₓ = |A⃗|cosθ_A,   Aᵧ = |A⃗|sinθ_A",insight:"Apply the component formulas to A⃗. Watch for the sign: cos145° is negative."},
  {title:"Step 1 — Decompose B⃗",eq:"Bₓ = |B⃗|cosθ_B,   Bᵧ = |B⃗|sinθ_B",insight:"Same formulas for B⃗. Each component is an independent calculation."},
  {title:"Step 2 — Sum components",eq:"Rₓ = Aₓ+Bₓ,   Rᵧ = Aᵧ+Bᵧ",insight:"This IS vector addition by definition. The two numbers combine to give two resultant components."},
  {title:"Step 3 — Magnitude",eq:"|R⃗| = √(Rₓ² + Rᵧ²)",insight:"Pythagorean theorem on the components. This always gives the magnitude, regardless of quadrant."},
  {title:"Step 4 — Direction",eq:"θ_R = atan2(Rᵧ, Rₓ)",insight:"atan2 returns the correct quadrant. With plain arctan you must add a quadrant correction manually."},
];
export default function NumericalMethodProof({params={}}){
  const si=Math.min(params.currentStep??0,STEPS.length-1);
  const step=STEPS[si];
  const magA=40,tA=30,magB=25,tB=145;
  const Ax=(magA*Math.cos(tA*Math.PI/180)).toFixed(2), Ay=(magA*Math.sin(tA*Math.PI/180)).toFixed(2);
  const Bx=(magB*Math.cos(tB*Math.PI/180)).toFixed(2), By=(magB*Math.sin(tB*Math.PI/180)).toFixed(2);
  const Rx=(parseFloat(Ax)+parseFloat(Bx)).toFixed(2), Ry=(parseFloat(Ay)+parseFloat(By)).toFixed(2);
  const magR=Math.sqrt(parseFloat(Rx)**2+parseFloat(Ry)**2).toFixed(3);
  const tR=(Math.atan2(parseFloat(Ry),parseFloat(Rx))*180/Math.PI).toFixed(1);

  const rows=[
    {label:"A⃗",vals:{decomp:`Aₓ=${Ax}, Aᵧ=${Ay}`,sum:"—",mag:"—",dir:"—"},color:"#6366f1"},
    {label:"B⃗",vals:{decomp:`Bₓ=${Bx}, Bᵧ=${By}`,sum:"—",mag:"—",dir:"—"},color:"#f59e0b"},
    {label:"R⃗",vals:{decomp:"—",sum:`Rₓ=${Rx}, Rᵧ=${Ry}`,mag:`|R⃗|=${magR}`,dir:`θ=${tR}°`},color:"#10b981"},
  ];
  const stepKeys=["decomp","sum","mag","dir"];

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 20px 0",display:"flex",alignItems:"center",gap:10}}>
        <span style={{background:"#1e293b",color:"#10b981",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>STEP {si+1}/{STEPS.length}</span>
        <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{step.title}</span>
      </div>
      <div style={{margin:"10px 20px",padding:"11px 16px",background:"#1e293b",borderRadius:10,
        fontFamily:"'Fira Code',monospace",fontSize:13,color:"#6ee7b7",borderLeft:"3px solid #10b981"}}>{step.eq}</div>

      {/* Example with concrete values */}
      <div style={{padding:"0 20px",marginBottom:12}}>
        <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>Example: A⃗=40N@30°, B⃗=25N@145°</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {rows.map(row=>(
            <div key={row.label} style={{display:"grid",gridTemplateColumns:"36px 1fr 1fr 1fr 1fr",gap:6,alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:700,color:row.color}}>{row.label}</span>
              {stepKeys.map((k,ki)=>(
                <div key={k} style={{background:"#1e293b",borderRadius:6,padding:"5px 8px",
                  opacity:si>=ki+(k==="decomp"?1:k==="sum"?3:k==="mag"?4:5)?1:0.2,
                  transition:"opacity 0.4s"}}>
                  <div style={{fontSize:10,fontFamily:"'Fira Code',monospace",color:"#94a3b8"}}>{row.vals[k]}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{margin:"0 20px 20px",padding:"11px 15px",background:"#0c1a2e",borderRadius:10,
        borderLeft:"3px solid #0ea5e9",fontSize:13,color:"#94a3b8",lineHeight:1.6}}>
        <span style={{color:"#38bdf8",fontWeight:600}}>Insight: </span>{step.insight}
      </div>
    </div>
  );
}
