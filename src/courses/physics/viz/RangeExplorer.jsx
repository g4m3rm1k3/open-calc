// RangeExplorer.jsx — Ch3 L5-6 Pillar 4
import { useState } from "react";
const G = 9.8;
export default function RangeExplorer({ params = {} }) {
  const [v0, setV0] = useState(25); const [theta, setTheta] = useState(35);
  const th = theta * Math.PI / 180;
  const vx = v0 * Math.cos(th), vy0 = v0 * Math.sin(th);
  const tFlight = 2 * vy0 / G, R = vx * tFlight, H = vy0 * vy0 / (2 * G);
  const Rformula = v0 * v0 * Math.sin(2 * th) / G;
  const steps = [
    { label: "Decompose", eq: `v₀x = ${v0}cos${theta}° = ${vx.toFixed(3)} m/s` },
    { label: "Decompose", eq: `v₀y = ${v0}sin${theta}° = ${vy0.toFixed(3)} m/s` },
    { label: "Time of flight", eq: `t = 2v₀y/g = 2(${vy0.toFixed(2)})/${G} = ${tFlight.toFixed(4)} s` },
    { label: "Range", eq: `R = v₀x·t = ${vx.toFixed(2)}×${tFlight.toFixed(3)} = ${R.toFixed(3)} m` },
    { label: "Check R formula", eq: `v₀²sin2θ/g = ${v0}²·sin${2*theta}°/${G} = ${Rformula.toFixed(3)} m ✓` },
    { label: "Max height", eq: `H = v₀y²/(2g) = ${vy0.toFixed(2)}²/${2*G} = ${H.toFixed(3)} m` },
  ];
  return (<div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
    <div style={{ padding: "14px 20px 0" }}><span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · RANGE STEP-THROUGH</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "12px 20px 0" }}>
      {[{label:"v₀ (m/s)",val:v0,set:setV0,min:5,max:50,color:"#818cf8"},{label:"θ (°)",val:theta,set:setTheta,min:1,max:89,color:"#f59e0b"}].map(({label,val,set,min,max,color})=>(
        <div key={label}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748b",marginBottom:3}}><span>{label}</span><span style={{color,fontWeight:700}}>{val}</span></div><input type="range" min={min} max={max} step={1} value={val} onChange={e=>set(parseInt(e.target.value))} style={{width:"100%"}}/></div>
      ))}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 20px 20px" }}>
      {steps.map(({ label, eq }, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1e293b", color: "#10b981", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{i+1}</div>
          <div style={{ flex: 1, background: "#1e293b", borderRadius: 6, padding: "7px 12px" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>{label}</div>
            <div style={{ fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#10b981" }}>{eq}</div>
          </div>
        </div>
      ))}
    </div>
  </div>);
}
