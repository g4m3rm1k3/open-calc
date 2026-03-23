// AngleBetweenExplorer.jsx — 3D dot product angle calculator
import { useState } from "react";
export default function AngleBetweenExplorer({ params = {} }) {
  const [Ax,setAx]=useState(1);const [Ay,setAy]=useState(2);const [Az,setAz]=useState(2);
  const [Bx,setBx]=useState(3);const [By,setBy]=useState(-1);const [Bz,setBz]=useState(0);
  const dot=Ax*Bx+Ay*By+Az*Bz;
  const mA=Math.sqrt(Ax**2+Ay**2+Az**2),mB=Math.sqrt(Bx**2+By**2+Bz**2);
  const cosP=mA>0&&mB>0?dot/(mA*mB):0;
  const phi=Math.acos(Math.max(-1,Math.min(1,cosP)))*180/Math.PI;
  const perp=Math.abs(dot)<0.01,para=Math.abs(Math.abs(cosP)-1)<0.01;
  const inp=(val,set,label)=>(<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,color:"#64748b",width:22}}>{label}</span><input type="number" value={val} step="0.5" onChange={e=>set(parseFloat(e.target.value)||0)} style={{width:56,background:"#0f172a",border:"1px solid #334155",borderRadius:5,color:"#e2e8f0",padding:"4px 6px",fontSize:13,textAlign:"center"}}/></div>);
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0"}}><span style={{fontSize:13,color:"#818cf8",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 4 · ANGLE BETWEEN VECTORS (3D)</span></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,padding:"14px 20px"}}>
      <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px"}}>
        <div style={{fontSize:12,color:"#6366f1",fontWeight:700,marginBottom:8}}>A⃗</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>{inp(Ax,setAx,"Aₓ")}{inp(Ay,setAy,"Aᵧ")}{inp(Az,setAz,"A_z")}</div>
        <div style={{marginTop:8,fontSize:11,color:"#64748b"}}>|A⃗| = {mA.toFixed(3)}</div>
      </div>
      <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px"}}>
        <div style={{fontSize:12,color:"#f59e0b",fontWeight:700,marginBottom:8}}>B⃗</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>{inp(Bx,setBx,"Bₓ")}{inp(By,setBy,"Bᵧ")}{inp(Bz,setBz,"B_z")}</div>
        <div style={{marginTop:8,fontSize:11,color:"#64748b"}}>|B⃗| = {mB.toFixed(3)}</div>
      </div>
    </div>
    <div style={{padding:"0 20px",marginBottom:12}}>
      <div style={{background:"#1e293b",borderRadius:10,padding:"14px 16px",fontFamily:"'Fira Code',monospace",fontSize:12,lineHeight:2,color:"#94a3b8"}}>
        <div>A⃗·B⃗ = {Ax}×{Bx} + {Ay}×{By} + {Az}×{Bz}</div>
        <div style={{color:"#e2e8f0"}}>= {Ax*Bx} + {Ay*By} + {Az*Bz} = <span style={{fontWeight:800,color:"#0ea5e9"}}>{dot.toFixed(3)}</span></div>
        <div>cosφ = {dot.toFixed(3)} / ({mA.toFixed(3)} × {mB.toFixed(3)}) = <span style={{color:"#818cf8",fontWeight:700}}>{cosP.toFixed(5)}</span></div>
        <div style={{fontSize:18,fontWeight:800,color:"#818cf8",marginTop:4}}>φ = arccos({cosP.toFixed(4)}) = {phi.toFixed(2)}°</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"0 20px 16px"}}>
      <div style={{background:perp?"#1a1030":para?"#1a2a0d":"#1e293b",borderRadius:8,padding:"10px 14px",border:`1px solid ${perp?"#818cf8":para?"#10b981":"#334155"}`}}>
        <div style={{fontSize:11,color:"#64748b"}}>Relationship</div>
        <div style={{fontSize:14,fontWeight:800,color:perp?"#818cf8":para?"#34d399":"#94a3b8"}}>{perp?"⊥ Perpendicular":para?"∥ Parallel":"Oblique"}</div>
      </div>
      <div style={{background:"#1e293b",borderRadius:8,padding:"10px 14px"}}>
        <div style={{fontSize:11,color:"#64748b"}}>Formula used</div>
        <div style={{fontSize:12,fontFamily:"'Fira Code',monospace",color:"#818cf8"}}>φ = arccos(A⃗·B⃗/|A⃗||B⃗|)</div>
      </div>
    </div>
  </div>);
}
