// DotProductFormRecogniser.jsx
import { useState } from "react";
const FORMS=[
  {label:"Geometric definition",formula:"A⃗·B⃗ = |A⃗||B⃗|cosφ",note:"φ = angle between vectors. This form is best when you know magnitudes and angles.",color:"#0ea5e9"},
  {label:"Component form (2D)",formula:"A⃗·B⃗ = AₓBₓ + AᵧBᵧ",note:"Best when you have components. Equivalent to the geometric form.",color:"#6366f1"},
  {label:"Component form (3D)",formula:"A⃗·B⃗ = AₓBₓ + AᵧBᵧ + A_zB_z",note:"Extends naturally to 3D — just add the z-term.",color:"#6366f1"},
  {label:"Angle from dot product",formula:"cosφ = (A⃗·B⃗)/(|A⃗||B⃗|)  →  φ = arccos(...)",note:"Rearranged to find φ. Always gives 0° ≤ φ ≤ 180°.",color:"#818cf8"},
  {label:"Perpendicularity test",formula:"A⃗ ⊥ B⃗  ⟺  A⃗·B⃗ = 0",note:"The fastest way to check orthogonality — no angles needed.",color:"#10b981"},
  {label:"Self dot product",formula:"A⃗·A⃗ = |A⃗|²",note:"A vector dotted with itself gives the square of its magnitude. φ=0°, cos0°=1.",color:"#f59e0b"},
  {label:"Work",formula:"W = F⃗·d⃗ = |F⃗||d⃗|cosφ",note:"Only the component of force along displacement does work.",color:"#f43f5e"},
];
const RECALL=[
  {q:"Two formulas for A⃗·B⃗?",a:"Geometric: |A⃗||B⃗|cosφ  ·  Component: AₓBₓ+AᵧBᵧ"},
  {q:"A⃗=(3,4), B⃗=(4,−3). A⃗·B⃗ = ?",a:"3×4 + 4×(−3) = 12−12 = 0  (perpendicular)"},
  {q:"How do you find the angle between vectors?",a:"φ = arccos( A⃗·B⃗ / (|A⃗||B⃗|) )"},
  {q:"A⃗·A⃗ = ?",a:"|A⃗|²  — self dot product gives magnitude squared"},
  {q:"When is A⃗·B⃗ negative?",a:"When φ > 90° — the vectors point more 'against' each other than 'with'."},
];
export default function DotProductFormRecogniser({params={}}){
  const [mode,setMode]=useState("table");
  const [expanded,setExpanded]=useState(null);
  const [ri,setRi]=useState(0);
  const [shown,setShown]=useState(false);
  const [rs,setRs]=useState(0);
  const [rdone,setRdone]=useState(false);
  const [rh,setRh]=useState([]);
  function nextR(knew){setRh(h=>[...h,{...RECALL[ri],knew}]);if(knew)setRs(s=>s+1);if(ri+1>=RECALL.length)setRdone(true);else{setRi(n=>n+1);setShown(false);}}
  if(mode==="recall"&&rdone)return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,padding:24}}>
    <div style={{fontSize:13,color:"#0ea5e9",fontWeight:700,marginBottom:12}}>PILLAR 5 RECALL RESULTS</div>
    <div style={{fontSize:28,fontWeight:900,color:"#e2e8f0",marginBottom:16}}>{rs}/{RECALL.length}</div>
    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>{rh.map((h,i)=><div key={i} style={{background:h.knew?"#0d2a1e":"#2a0d0d",borderRadius:8,padding:"10px 14px",borderLeft:`2px solid ${h.knew?"#10b981":"#f43f5e"}`}}><div style={{fontSize:12,color:"#64748b",marginBottom:2}}>{h.q}</div><div style={{fontSize:13,fontFamily:"'Fira Code',monospace",color:"#e2e8f0"}}>{h.a}</div></div>)}</div>
    <button onClick={()=>{setMode("table");setRi(0);setShown(false);setRs(0);setRdone(false);setRh([]);}} style={{width:"100%",background:"#0ea5e9",color:"#0f172a",border:"none",borderRadius:10,padding:12,fontSize:14,fontWeight:800,cursor:"pointer"}}>Back</button>
  </div>);
  if(mode==="recall"){const q=RECALL[ri];return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#0ea5e9",fontWeight:700}}>PILLAR 5 RECALL</span><span style={{fontSize:12,color:"#475569"}}>{ri+1}/{RECALL.length}</span></div>
    <div style={{height:3,background:"#1e293b"}}><div style={{height:"100%",width:`${(ri/RECALL.length)*100}%`,background:"#0ea5e9",transition:"width 0.3s"}}/></div>
    <div style={{padding:24}}>
      <div style={{background:"#1e293b",borderRadius:12,padding:"22px",textAlign:"center",marginBottom:20}}><div style={{fontSize:15,fontWeight:700,color:"#e2e8f0"}}>{q.q}</div></div>
      {!shown?<button onClick={()=>setShown(true)} style={{width:"100%",background:"#1e293b",color:"#94a3b8",border:"2px solid #334155",borderRadius:10,padding:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>Show Answer</button>
      :<><div style={{background:"#0c1a2e",borderLeft:"3px solid #0ea5e9",borderRadius:10,padding:"14px 18px",marginBottom:12,fontFamily:"'Fira Code',monospace",fontSize:14,color:"#7dd3fc"}}>{q.a}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button onClick={()=>nextR(false)} style={{background:"#2a0d0d",color:"#f87171",border:"2px solid #f43f5e",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>✗ Didn't know</button>
        <button onClick={()=>nextR(true)} style={{background:"#0d2a1e",color:"#34d399",border:"2px solid #10b981",borderRadius:10,padding:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>✓ Knew it</button>
      </div></>}
    </div>
  </div>);}
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px",background:"#0c1122",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:13,color:"#0ea5e9",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 5 · DOT PRODUCT FORMS</span>
      <button onClick={()=>setMode("recall")} style={{background:"#1e293b",color:"#7dd3fc",border:"1px solid #0ea5e9",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Recall →</button>
    </div>
    <div style={{padding:"16px 20px 20px",display:"flex",flexDirection:"column",gap:8}}>
      {FORMS.map((f,i)=><div key={i} onClick={()=>setExpanded(expanded===i?null:i)}
        style={{background:expanded===i?"#0c1a2e":"#1e293b",borderRadius:10,padding:"12px 16px",border:`1px solid ${expanded===i?f.color:"#334155"}`,cursor:"pointer",transition:"all 0.2s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:13,fontWeight:700,color:f.color}}>{f.label}</div><div style={{fontSize:11,fontFamily:"'Fira Code',monospace",color:"#64748b",marginTop:2}}>{f.formula}</div></div>
          <span style={{color:"#475569",fontSize:12}}>{expanded===i?"▲":"▼"}</span>
        </div>
        {expanded===i&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #334155",fontSize:13,color:"#94a3b8",lineHeight:1.6}}>{f.note}</div>}
      </div>)}
    </div>
  </div>);
}
