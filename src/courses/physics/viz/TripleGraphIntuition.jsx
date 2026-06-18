// TripleGraphIntuition.jsx — Ch2 L6 Pillar 1 — all 3 graphs linked
import { useState } from "react";

const W=460,H=320,T_MAX=8;

const MOTIONS = [
  { name:"Uniform accel", x:t=>2*t*t-8*t, v:t=>4*t-8, a:()=>4, color:"#6366f1" },
  { name:"Const velocity", x:t=>3*t-12, v:()=>3, a:()=>0, color:"#10b981" },
  { name:"Decelerate+stop", x:t=>8*t-t*t, v:t=>8-2*t, a:()=>-2, color:"#f59e0b" },
];

function MiniGraph({fn,color,label,T_MAX,yLabel}){
  const vals=Array.from({length:81},(_,i)=>fn(i/10));
  const yMin=Math.min(...vals),yMax=Math.max(...vals);
  const yRange=Math.max(yMax-yMin,1);
  const PL=32,PB=20,PT=8,PR=8,GW=W/3-PL-PR,GH=80;
  function toSVG(t,y){return[PL+(t/T_MAX)*GW,PT+GH-((y-yMin)/(yRange||1))*GH];}
  const pts=Array.from({length:81},(_,i)=>{const t=i/10;return toSVG(t,fn(t));});
  const d=pts.map(([x,y],i)=>`${i===0?"M":"L"} ${x} ${y}`).join(" ");
  const W2=W/3;
  return(
    <svg viewBox={`0 0 ${W2} ${GH+PT+PB}`} style={{display:"block",width:"100%"}}>
      <line x1={PL} y1={PT} x2={PL} y2={PT+GH} stroke="#334155" strokeWidth={1}/>
      <line x1={PL} y1={PT+GH} x2={PL+GW} y2={PT+GH} stroke="#334155" strokeWidth={1}/>
      <path d={d} fill="none" stroke={color} strokeWidth={2}/>
      <text x={PL+GW/2} y={PT+GH+14} fill="#475569" fontSize={8} textAnchor="middle">t</text>
      <text x={4} y={PT+GH/2} fill={color} fontSize={8} textAnchor="middle" transform={`rotate(-90 4 ${PT+GH/2})`}>{yLabel}</text>
    </svg>
  );
}

export default function TripleGraphIntuition({params={}}){
  const [m,setM]=useState(0);
  const M=MOTIONS[m];
  return(<div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#0f172a",borderRadius:16,overflow:"hidden"}}>
    <div style={{padding:"14px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:13,color:"#818cf8",fontWeight:700,letterSpacing:"0.08em"}}>PILLAR 1 · ALL THREE GRAPHS</span>
      <div style={{display:"flex",gap:6}}>{MOTIONS.map((mo,i)=><button key={i} onClick={()=>setM(i)} style={{background:m===i?mo.color:"#1e293b",color:m===i?"#0f172a":"#64748b",border:`1px solid ${m===i?mo.color:"#334155"}`,borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{mo.name}</button>)}</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 20px 0",gap:12}}>
      <div>
        <div style={{fontSize:11,color:"#6366f1",fontWeight:700,marginBottom:4,textAlign:"center"}}>x–t (position)</div>
        <MiniGraph fn={M.x} color="#6366f1" T_MAX={T_MAX} yLabel="x"/>
        <div style={{fontSize:10,color:"#475569",textAlign:"center",marginTop:2}}>slope → v</div>
      </div>
      <div>
        <div style={{fontSize:11,color:"#f59e0b",fontWeight:700,marginBottom:4,textAlign:"center"}}>v–t (velocity)</div>
        <MiniGraph fn={M.v} color="#f59e0b" T_MAX={T_MAX} yLabel="v"/>
        <div style={{fontSize:10,color:"#475569",textAlign:"center",marginTop:2}}>slope → a  /  area → Δx</div>
      </div>
      <div>
        <div style={{fontSize:11,color:"#f43f5e",fontWeight:700,marginBottom:4,textAlign:"center"}}>a–t (acceleration)</div>
        <MiniGraph fn={M.a} color="#f43f5e" T_MAX={T_MAX} yLabel="a"/>
        <div style={{fontSize:10,color:"#475569",textAlign:"center",marginTop:2}}>area → Δv</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,padding:"12px 20px 20px"}}>
      {[
        {label:"x → v",formula:"v = dx/dt (derivative)",color:"#6366f1"},
        {label:"v → a",formula:"a = dv/dt (derivative)",color:"#f59e0b"},
        {label:"a → v → x",formula:"integrate to go up",color:"#f43f5e"},
      ].map(({label,formula,color})=>(<div key={label} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px",borderTop:`2px solid ${color}`}}><div style={{fontSize:11,fontWeight:700,color,marginBottom:2}}>{label}</div><div style={{fontSize:10,fontFamily:"'Fira Code',monospace",color:"#64748b"}}>{formula}</div></div>))}
    </div>
  </div>);
}
