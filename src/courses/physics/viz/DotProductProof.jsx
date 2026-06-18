// DotProductProof.jsx — Pillar 2 for dot product lessons
import { useState } from "react";
const STEPS=[
  {title:"Define dot product (geometric)",eq:"A⃗·B⃗ = |A⃗||B⃗|cosφ",insight:"The geometric definition: project one vector onto the other, multiply by the other's magnitude. φ is the angle between them."},
  {title:"Expand with unit vectors",eq:"A⃗·B⃗ = (Aₓî+Aᵧĵ)·(Bₓî+Bᵧĵ)",insight:"Expand both vectors into unit-vector form so we can apply the definition term by term."},
  {title:"Distribute",eq:"= AₓBₓ(î·î) + AₓBᵧ(î·ĵ) + AᵧBₓ(ĵ·î) + AᵧBᵧ(ĵ·ĵ)",insight:"Dot product distributes over addition. Four cross-terms appear."},
  {title:"Apply orthonormality",eq:"î·î = ĵ·ĵ = 1,  î·ĵ = ĵ·î = 0",insight:"Basis vectors are orthonormal: parallel ones give 1, perpendicular ones give 0. The cross-terms vanish."},
  {title:"Result",eq:"∴  A⃗·B⃗ = AₓBₓ + AᵧBᵧ",insight:"The component formula follows directly. Both formulas — geometric and algebraic — are equal and interchangeable."},
];
export default function DotProductProof({params={}}){
  const si=Math.min(params.currentStep??0,STEPS.length-1);
  const step=STEPS[si];
  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:"0 0 20px"}}>
      <div style={{padding:"14px 20px 0",display:"flex",alignItems:"center",gap:10}}>
        <span style={{background:"#1e293b",color:"#0ea5e9",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>STEP {si+1}/{STEPS.length}</span>
        <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{step.title}</span>
      </div>
      <div style={{margin:"10px 20px",padding:"11px 16px",background:"#1e293b",borderRadius:10,fontFamily:"'Fira Code',monospace",fontSize:13,color:"#7dd3fc",borderLeft:"3px solid #0ea5e9"}}>{step.eq}</div>
      <div style={{margin:"0 20px",padding:"11px 15px",background:"#0c1a2e",borderRadius:10,borderLeft:"3px solid #0ea5e9",fontSize:13,color:"#94a3b8",lineHeight:1.6}}>
        <span style={{color:"#38bdf8",fontWeight:600}}>Insight: </span>{step.insight}
      </div>
    </div>
  );
}
