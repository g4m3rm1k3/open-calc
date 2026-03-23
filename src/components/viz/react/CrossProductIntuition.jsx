// CrossProductIntuition.jsx — right-hand rule visualiser + magnitude
import { useState } from "react";
export default function CrossProductIntuition({ params = {} }) {
  const [Ax,setAx]=useState(1);const [Ay,setAy]=useState(2);const [Az,setAz]=useState(0);
  const [Bx,setBx]=useState(3);const [By,setBy]=useState(0);const [Bz,setBz]=useState(0);
  const Cx=Ay*Bz-Az*By, Cy=Az*Bx-Ax*Bz, Cz=Ax*By-Ay*Bx;
  const mA=Math.sqrt(Ax**2+Ay**2+Az**2),mB=Math.sqrt(Bx**2+By**2+Bz**2);
  const cosP=mA>0&&mB>0?(Ax*Bx+Ay*By+Az*Bz)/(mA*mB):0;
  const phi=Math.acos(Math.max(-1,Math.min(1,cosP)))*180/Math.PI;
  const magC=Math.sqrt(Cx**2+Cy**2+Cz**2);
  const magCFormula=mA*mB*Math.sin(phi*Math.PI/180);
  const inp=(val,set,label)=>(<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,color:"#64748b",width:22}}>{label}</span><input type="number" value={val} step="0.5" onChange={e=>set(parseFloat(e.target.value)||0)} style={{width:52,background:"#0f172a",border:"1px solid #334155",borderRadius:5,color:"#e2e8f0",padding:"4px 6px",fontSize:13,textAlign:"center"}}/></div>);
  const rrColors=Cz>0?"#10b981":Cz<0?"#f43f5e":"#818cf8";
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:13,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 1 · CROSS PRODUCT</span>
      <span style={{background:"#1e293b",color:rrColors,borderRadius:6,padding:"3px 12px",fontSize:12,fontWeight:700}}>{Cz>0?"↑ out of page":Cz<0?"↓ into page":"in plane"}</span>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,padding:"14px 20px"}}>
      <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:12,color:"#6366f1",fontWeight:700,marginBottom:8}}>A⃗</div><div style={{display:"flex",flexDirection:"column",gap:7}}>{inp(Ax,setAx,"Aₓ")}{inp(Ay,setAy,"Aᵧ")}{inp(Az,setAz,"A_z")}</div></div>
      <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:12,color:"#f59e0b",fontWeight:700,marginBottom:8}}>B⃗</div><div style={{display:"flex",flexDirection:"column",gap:7}}>{inp(Bx,setBx,"Bₓ")}{inp(By,setBy,"Bᵧ")}{inp(Bz,setBz,"B_z")}</div></div>
    </div>
    <div style={{padding:"0 20px",marginBottom:12}}>
      <div style={{background:"#1e293b",borderRadius:10,padding:"14px 16px",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:2,color:"#94a3b8"}}>
        <div>A⃗×B⃗ = (AᵧBz−AzBᵧ)î − (AₓBz−AzBₓ)ĵ + (AₓBᵧ−AᵧBₓ)k̂</div>
        <div style={{color:"#e2e8f0"}}>= ({Cx.toFixed(2)})î + ({Cy.toFixed(2)})ĵ + ({Cz.toFixed(2)})k̂</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 20px 20px"}}>
      {[{label:"|A⃗×B⃗|",val:magC.toFixed(3),color:"#f59e0b"},{label:"|A⃗||B⃗|sinφ",val:magCFormula.toFixed(3),color:"#f59e0b"},{label:"φ",val:phi.toFixed(1)+"°",color:"#818cf8"}].map(({label,val,color})=>(<div key={label} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:"#64748b"}}>{label}</div><div style={{fontSize:14,fontWeight:800,color}}>{val}</div></div>))}
    </div>
    <div style={{padding:"0 20px 14px",fontSize:12,color:"#475569"}}>Right-hand rule: curl fingers from A⃗ toward B⃗ — thumb points in direction of A⃗×B⃗. Edit components to explore.</div>
  </div>);
}
