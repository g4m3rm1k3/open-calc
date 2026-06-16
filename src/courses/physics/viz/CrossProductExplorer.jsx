// CrossProductExplorer.jsx — area and torque physical meaning
import { useState } from "react";
export default function CrossProductExplorer({params={}}){
  const [phi,setPhi]=useState(60);const [magA,setMagA]=useState(3);const [magB,setMagB]=useState(2.5);
  const phiR=phi*Math.PI/180;
  const mag=magA*magB*Math.sin(phiR);
  const dotV=magA*magB*Math.cos(phiR);
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0"}}><span style={{fontSize:13,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 4 · CROSS PRODUCT EXPLORER</span></div>
    <div style={{padding:"14px 20px",display:"flex",flexDirection:"column",gap:12}}>
      {[{label:"|A⃗|",val:magA,set:setMagA,min:0.5,max:5,step:0.1},{label:"|B⃗|",val:magB,set:setMagB,min:0.5,max:5,step:0.1},{label:"φ (°)",val:phi,set:setPhi,min:0,max:180,step:1}].map(({label,val,set,min,max,step})=>(
        <div key={label}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginBottom:3}}><span>{label}</span><span style={{color:"#e2e8f0",fontWeight:700}}>{val.toFixed(1)}</span></div>
          <input type="range" min={min} max={max} step={step} value={val} onChange={e=>set(parseFloat(e.target.value))} style={{width:"100%"}}/>
        </div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px 12px"}}>
      {[
        {label:"|A⃗×B⃗| = |A⃗||B⃗|sinφ",val:mag.toFixed(4),color:"#f59e0b",note:"Magnitude"},
        {label:"Area of parallelogram",val:mag.toFixed(4),color:"#fcd34d",note:"Same as magnitude"},
        {label:"A⃗·B⃗ = |A⃗||B⃗|cosφ",val:dotV.toFixed(4),color:"#0ea5e9",note:"Dot product (compare)"},
        {label:"sin²φ + cos²φ",val:((Math.sin(phiR)**2)+(Math.cos(phiR)**2)).toFixed(6),color:"#10b981",note:"Always = 1 ✓"},
      ].map(({label,val,color,note})=>(<div key={label} style={{background:"#1e293b",borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:10,color:"#64748b"}}>{note}</div><div style={{fontSize:10,fontFamily:"'Fira Code',monospace",color:"#475569",marginBottom:2}}>{label}</div><div style={{fontSize:16,fontWeight:800,color}}>{val}</div></div>))}
    </div>
    <div style={{padding:"0 20px 14px",fontSize:12,color:"#475569",lineHeight:1.6}}>
      Maximum at φ=90° (sin=1) — perpendicular vectors enclose maximum area.<br/>
      Zero at φ=0° or 180° (sin=0) — parallel vectors enclose no area.
    </div>
  </div>);
}
