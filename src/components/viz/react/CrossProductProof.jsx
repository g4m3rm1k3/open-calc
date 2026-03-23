// CrossProductProof.jsx
import { useState } from "react";
const STEPS=[
  {title:"Define via determinant",eq:"A⃗×B⃗ = det| î  ĵ  k̂ |  =  (AᵧBz−AzBᵧ)î − (AₓBz−AzBₓ)ĵ + (AₓBᵧ−AᵧBₓ)k̂",insight:"The 3×3 determinant is the systematic way to remember all six component-pair products."},
  {title:"Magnitude formula",eq:"|A⃗×B⃗| = |A⃗||B⃗|sinφ",insight:"sinφ = 0 when parallel (φ=0° or 180°). Maximum when perpendicular (φ=90°). Opposite of the dot product pattern."},
  {title:"Direction: right-hand rule",eq:"Curl fingers A⃗ → B⃗; thumb = direction of A⃗×B⃗",insight:"The cross product is always perpendicular to BOTH input vectors. It cannot have any component along A⃗ or B⃗."},
  {title:"Anti-commutativity",eq:"A⃗×B⃗ = −(B⃗×A⃗)",insight:"Swapping the order flips the sign — opposite direction. Unlike the dot product, order matters critically here."},
  {title:"Parallel vectors give zero",eq:"A⃗ ∥ B⃗  ⟹  A⃗×B⃗ = 0⃗  (sinφ = 0)",insight:"No perpendicular component exists when vectors are parallel. The cross product collapses to the zero vector."},
];
export default function CrossProductProof({params={}}){
  const si=Math.min(params.currentStep??0,STEPS.length-1);const s=STEPS[si];
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:"0 0 20px"}}>
    <div style={{padding:"14px 20px 0",display:"flex",alignItems:"center",gap:10}}>
      <span style={{background:"#1e293b",color:"#f59e0b",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700}}>STEP {si+1}/{STEPS.length}</span>
      <span style={{fontSize:14,fontWeight:600,color:"#e2e8f0"}}>{s.title}</span>
    </div>
    <div style={{margin:"10px 20px",padding:"11px 16px",background:"#1e293b",borderRadius:10,fontFamily:"'Fira Code',monospace",fontSize:12,color:"#fcd34d",borderLeft:"3px solid #f59e0b"}}>{s.eq}</div>
    <div style={{margin:"0 20px",padding:"11px 15px",background:"#0c1a2e",borderRadius:10,borderLeft:"3px solid #0ea5e9",fontSize:13,color:"#94a3b8",lineHeight:1.6}}><span style={{color:"#38bdf8",fontWeight:600}}>Insight: </span>{s.insight}</div>
  </div>);
}
