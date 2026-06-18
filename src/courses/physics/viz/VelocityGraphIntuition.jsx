// VelocityGraphIntuition.jsx — Ch2 L4 Pillar 1
import { useState } from "react";

const W=460,H=240,PL=50,PB=36,PT=16,PR=16;
const GW=W-PL-PR,GH=H-PT-PB,T_MAX=8;

const PRESETS=[
  {name:"Const velocity",vFn:()=>8,aFn:()=>0,color:"#6366f1"},
  {name:"Uniform accel",vFn:t=>3*t-12,aFn:()=>3,color:"#10b981"},
  {name:"Decelerate",vFn:t=>20-4*t,aFn:()=>-4,color:"#f59e0b"},
  {name:"Reverse",vFn:t=>12-3*t,aFn:()=>-3,color:"#f43f5e"},
];

export default function VelocityGraphIntuition({params={}}){
  const [preset,setPreset]=useState(1);
  const P=PRESETS[preset];
  const vVals=Array.from({length:81},(_,i)=>P.vFn(i/10));
  const vMin=Math.min(...vVals),vMax=Math.max(...vVals);
  const vRange=Math.max(vMax-vMin,4),vPad=vRange*0.15;

  function toSVG(t,v2){
    return[PL+(t/T_MAX)*GW, PT+GH-((v2-vMin+vPad)/(vRange+2*vPad))*GH];
  }
  const curvePts=Array.from({length:81},(_,i)=>{const t=i/10;return toSVG(t,P.vFn(t));});
  const curveD=curvePts.map(([x,y],i)=>`${i===0?"M":"L"} ${x} ${y}`).join(" ");
  const [zx]=toSVG(0,0),[,zy]=toSVG(0,0);

  // Area under curve from 0 to T_MAX (displacement)
  const area=Array.from({length:800},(_,i)=>P.vFn(i/100)*0.01).reduce((s,v2)=>s+v2,0);
  const zeroX=vMin<=0&&vMax>=0;

  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:13,color:"#f59e0b",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 1 · v–t GRAPH</span>
      <div style={{display:"flex",gap:6}}>{PRESETS.map((p,i)=><button key={i} onClick={()=>setPreset(i)} style={{background:preset===i?p.color:"#1e293b",color:preset===i?"#0f172a":"#64748b",border:`1px solid ${preset===i?p.color:"#334155"}`,borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{p.name}</button>)}</div>
    </div>
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
      {[0,2,4,6,8].map(t=>{const[tx]=toSVG(t,0);return<line key={t} x1={tx} y1={PT} x2={tx} y2={PT+GH} stroke="#1a2540" strokeWidth={0.5}/>;} )}
      <line x1={PL} y1={PT} x2={PL} y2={PT+GH} stroke="#334155" strokeWidth={1}/>
      <line x1={PL} y1={PT+GH} x2={PL+GW} y2={PT+GH} stroke="#334155" strokeWidth={1}/>
      {zeroX&&<line x1={PL} y1={zy} x2={PL+GW} y2={zy} stroke="#334155" strokeWidth={0.5} strokeDasharray="4 3"/>}
      {[0,2,4,6,8].map(t=>{const[tx]=toSVG(t,0);return<text key={t} x={tx} y={PT+GH+14} fill="#475569" fontSize={9} textAnchor="middle">{t}s</text>;})}
      <text x={PL+GW/2} y={H-4} fill="#475569" fontSize={9} textAnchor="middle">time (s)</text>
      <text x={12} y={PT+GH/2} fill="#475569" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT+GH/2})`}>v (m/s)</text>

      {/* Area fill */}
      <path d={`${curveD} L ${toSVG(T_MAX,0)[0]} ${toSVG(T_MAX,0)[1]} L ${toSVG(0,0)[0]} ${toSVG(0,0)[1]} Z`}
        fill={P.color} opacity={0.12}/>
      <path d={curveD} fill="none" stroke={P.color} strokeWidth={2.5}/>

      {/* Slope annotation */}
      <text x={PL+GW-10} y={PT+20} fill="#818cf8" fontSize={10} textAnchor="end">slope = a = {P.aFn(0).toFixed(1)} m/s²</text>
      <text x={PL+GW-10} y={PT+34} fill={P.color} fontSize={10} textAnchor="end">area = Δx ≈ {area.toFixed(1)} m</text>
    </svg>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px 20px"}}>
      {[
        {label:"slope of v–t = acceleration",val:P.aFn(0).toFixed(2)+" m/s²",color:"#818cf8"},
        {label:"area under v–t = displacement",val:area.toFixed(2)+" m",color:P.color},
      ].map(({label,val,color})=>(<div key={label} style={{background:"#1e293b",borderRadius:8,padding:"9px 12px"}}><div style={{fontSize:10,color:"#64748b"}}>{label}</div><div style={{fontSize:16,fontWeight:800,color}}>{val}</div></div>))}
    </div>
  </div>);
}
