// AccelerationGraphIntuition.jsx — Ch2 L5 Pillar 1
import { useState } from "react";
export default function AccelerationGraphIntuition({params={}}){
  const [a,setA]=useState(3);
  const deltaV=a*8;
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0"}}><span style={{fontSize:13,color:"#f43f5e",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 1 · a–t GRAPH</span></div>
    <div style={{padding:"12px 20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginBottom:4}}><span>Constant acceleration a</span><span style={{color:"#f43f5e",fontWeight:700}}>{a.toFixed(1)} m/s²</span></div>
      <input type="range" min={-10} max={10} step={0.5} value={a} onChange={e=>setA(parseFloat(e.target.value))} style={{width:"100%",marginBottom:12}}/>
      <svg width="100%" viewBox="0 0 420 180" style={{display:"block"}}>
        {/* Simple a-t graph — horizontal line */}
        <line x1={40} y1={10} x2={40} y2={150} stroke="#334155" strokeWidth={1}/>
        <line x1={40} y1={90} x2={410} y2={90} stroke="#334155" strokeWidth={1}/>
        {[0,2,4,6,8].map(t=>{const x=40+t*46.25;return<text key={t} x={x} y={162} fill="#475569" fontSize={9} textAnchor="middle">{t}s</text>;})}
        <text x={12} y={90} fill="#475569" fontSize={9} textAnchor="middle" transform="rotate(-90 12 90)">a (m/s²)</text>
        {/* Constant a line */}
        {(()=>{const y=90-(a/10)*75;return<><rect x={40} y={Math.min(y,90)} width={370} height={Math.abs(y-90)} fill={a>=0?"#6366f1":"#f43f5e"} opacity={0.15}/><line x1={40} y1={y} x2={410} y2={y} stroke={a>=0?"#6366f1":"#f43f5e"} strokeWidth={2.5}/><text x={420} y={y+4} fill={a>=0?"#6366f1":"#f43f5e"} fontSize={10}>a={a}</text></>;})()}
        {/* Area label */}
        <text x={225} y={a>=0?Math.min(90-(a/10)*75+20,85):Math.max(90+20,100)} fill="#f59e0b" fontSize={11} textAnchor="middle">area = Δv = {deltaV.toFixed(1)} m/s</text>
      </svg>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px 20px"}}>
      {[{label:"Area under a–t graph",val:"Δv = "+deltaV.toFixed(2)+" m/s",color:"#f59e0b",note:"over 8s"},{label:"Shape → v–t graph",val:a!==0?"Sloped line":"Horizontal line",color:"#6366f1",note:"slope of v–t = a"}].map(({label,val,color,note})=>(<div key={label} style={{background:"#1e293b",borderRadius:8,padding:"9px 12px"}}><div style={{fontSize:10,color:"#64748b"}}>{note}</div><div style={{fontSize:10,color:"#64748b",marginBottom:2}}>{label}</div><div style={{fontSize:14,fontWeight:800,color}}>{val}</div></div>))}
    </div>
  </div>);
}
