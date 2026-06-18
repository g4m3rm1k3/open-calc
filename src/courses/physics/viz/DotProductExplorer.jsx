// DotProductExplorer.jsx — projection, work, angle — all in one
import { useState } from "react";
const W = 420, H = 280, SC = 44, CX = 160, CY = 170;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }
function Arrow({ from, to, color, w = 2.8, label, dashed = false }) {
  const [fx, fy] = ts(from[0], from[1]), [tx, ty] = ts(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy);
  if (len < 3) return null;
  const ux = dx / len, uy = dy / len, hl = 10, ex = tx - ux * hl, ey = ty - uy * hl;
  return (<g><line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeDasharray={dashed ? "4 3" : "none"} strokeLinecap="round" />
    <polygon points={`${tx},${ty} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={color} />
    {label && <text x={tx + 9} y={ty - 8} fill={color} fontSize={12} fontWeight="800">{label}</text>}</g>);
}
export default function DotProductExplorer({ params = {} }) {
  const [phi, setPhi] = useState(40); // angle between vectors in degrees
  const [magA, setMagA] = useState(3.0); const [magB, setMagB] = useState(2.5);
  const phiRad = phi * Math.PI / 180;
  const VA = [magA, 0]; // A along x
  const VB = [magB * Math.cos(phiRad), magB * Math.sin(phiRad)];
  const dot = magA * magB * Math.cos(phiRad);
  const projLen = dot / magA; // proj of B onto A
  const projVec = [projLen, 0];
  const [ox, oy] = ts(0, 0);
  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}><span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · PROJECTION EXPLORER</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {[-2, -1, 0, 1, 2, 3].map(i => { const [x1, y1] = ts(i, -2.5), [x2, y2] = ts(i, 2.5), [x3, y3] = ts(-2, i), [x4, y4] = ts(3, i); return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5} /><line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5} /></g>; })}
          <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1} />
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1} />
          {/* Projection of B onto A (along x-axis here) */}
          <line x1={ox} y1={oy} x2={ts(projVec[0], 0)[0]} y2={oy} stroke="#0ea5e9" strokeWidth={4} strokeLinecap="round" />
          {/* Dashed drop line */}
          <line x1={ts(VB[0], VB[1])[0]} y1={ts(VB[0], VB[1])[1]} x2={ts(projVec[0], 0)[0]} y2={oy} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
          {/* Angle arc */}
          {(() => { const r = 30, ax = CX + r, ay = CY, bx = CX + r * Math.cos(-phiRad), by = CY + r * Math.sin(-phiRad); return <path d={`M ${ax} ${ay} A ${r} ${r} 0 0 0 ${bx} ${by}`} fill="none" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="3 2" />; })()}
          <text x={CX + 46} y={CY - 18} fill="#818cf8" fontSize={11}>φ={phi}°</text>
          <Arrow from={[0, 0]} to={VA} color="#6366f1" label="A⃗" />
          <Arrow from={[0, 0]} to={VB} color="#f59e0b" label="B⃗" />
          <circle cx={CX} cy={CY} r={3} fill="#475569" />
          <text x={ts(projVec[0] / 2, 0)[0]} y={oy + 16} fill="#0ea5e9" fontSize={10} textAnchor="middle">|B|cosφ = {projLen.toFixed(2)}</text>
        </svg>
        <div style={{ padding: "12px 16px 12px 0", display: "flex", flexDirection: "column", gap: 10, minWidth: 130 }}>
          {[{ label: "|A⃗|", val: magA, set: setMagA, min: 0.5, max: 4, step: 0.1 }, { label: "|B⃗|", val: magB, set: setMagB, min: 0.5, max: 4, step: 0.1 }, { label: "φ (°)", val: phi, set: setPhi, min: 0, max: 180, step: 1 }].map(({ label, val, set, min, max, step }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}><span>{label}</span><span style={{ color: "#e2e8f0", fontWeight: 700 }}>{val.toFixed(1)}</span></div>
              <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "A⃗·B⃗", val: dot.toFixed(3), color: dot > 0 ? "#10b981" : dot < 0 ? "#f43f5e" : "#818cf8" },
          { label: "proj B→A", val: projLen.toFixed(3), color: "#0ea5e9" },
          { label: "If W = F⃗·d⃗", val: dot.toFixed(2) + " J", color: "#f59e0b" },
        ].map(({ label, val, color }) => (<div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}><div style={{ fontSize: 10, color: "#64748b" }}>{label}</div><div style={{ fontSize: 15, fontWeight: 800, color }}>{val}</div></div>))}
      </div>
    </div>
  );
}
