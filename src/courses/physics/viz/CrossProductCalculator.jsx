// CrossProductCalculator.jsx
import { useState } from "react";
export default function CrossProductCalculator({params={}}){
  const [Ax,setAx]=useState(1);const [Ay,setAy]=useState(2);const [Az,setAz]=useState(0);
  const [Bx,setBx]=useState(3);const [By,setBy]=useState(0);const [Bz,setBz]=useState(0);
  const Cx=Ay*Bz-Az*By,Cy=Az*Bx-Ax*Bz,Cz=Ax*By-Ay*Bx;
  const mC=Math.sqrt(Cx**2+Cy**2+Cz**2);
  // Verify: A⃗·(A⃗×B⃗) should be 0
  const dotAC=Ax*Cx+Ay*Cy+Az*Cz, dotBC=Bx*Cx+By*Cy+Bz*Cz;
  const inp=(val,set,label)=>(<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,color:"#64748b",width:22}}>{label}</span><input type="number" value={val} step="0.5" onChange={e=>set(parseFloat(e.target.value)||0)} style={{width:52,background:"#0f172a",border:"1px solid #334155",borderRadius:5,color:"#e2e8f0",padding:"4px 6px",fontSize:13,textAlign:"center"}}/></div>);
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0"}}><span style={{fontSize:13,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 4 · CROSS PRODUCT CALCULATOR</span></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,padding:"14px 20px"}}>
      <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:12,color:"#6366f1",fontWeight:700,marginBottom:8}}>A⃗</div><div style={{display:"flex",flexDirection:"column",gap:7}}>{inp(Ax,setAx,"Aₓ")}{inp(Ay,setAy,"Aᵧ")}{inp(Az,setAz,"A_z")}</div></div>
      <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:12,color:"#f59e0b",fontWeight:700,marginBottom:8}}>B⃗</div><div style={{display:"flex",flexDirection:"column",gap:7}}>{inp(Bx,setBx,"Bₓ")}{inp(By,setBy,"Bᵧ")}{inp(Bz,setBz,"B_z")}</div></div>
    </div>
    <div style={{padding:"0 20px",marginBottom:12}}>
      <div style={{background:"#1e293b",borderRadius:10,padding:"14px 16px",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:2,color:"#94a3b8"}}>
        <div>Cₓ = AᵧBz − AzBᵧ = {Ay}×{Bz} − {Az}×{By} = <span style={{color:"#fcd34d",fontWeight:700}}>{Cx.toFixed(3)}</span></div>
        <div>Cᵧ = AzBₓ − AₓBz = {Az}×{Bx} − {Ax}×{Bz} = <span style={{color:"#fcd34d",fontWeight:700}}>{Cy.toFixed(3)}</span></div>
        <div>Cz = AₓBᵧ − AᵧBₓ = {Ax}×{By} − {Ay}×{Bx} = <span style={{color:"#fcd34d",fontWeight:700}}>{Cz.toFixed(3)}</span></div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 20px 12px"}}>
      {[{label:"A⃗×B⃗",val:`(${Cx.toFixed(2)}, ${Cy.toFixed(2)}, ${Cz.toFixed(2)})`,color:"#f59e0b"},{label:"|A⃗×B⃗|",val:mC.toFixed(4),color:"#fcd34d"},{label:"A⃗·(A⃗×B⃗) — should be 0",val:dotAC.toFixed(6),color:Math.abs(dotAC)<0.001?"#10b981":"#f43f5e"}].map(({label,val,color})=>(<div key={label} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:10,color:"#64748b"}}>{label}</div><div style={{fontSize:12,fontWeight:800,color}}>{val}</div></div>))}
    </div>
    <div style={{padding:"0 20px 14px",fontSize:12,color:"#475569"}}>The perpendicularity check A⃗·(A⃗×B⃗) should always be 0 — confirms the cross product is truly orthogonal to both inputs.</div>
  </div>);
}
