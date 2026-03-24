// RangeIntuition.jsx — Ch3 L5-6 Pillar 1: range vs angle curve
import { useState } from "react";
const G = 9.8;

export default function RangeIntuition({ params = {} }) {
  const [v0, setV0] = useState(20);
  const [highlight, setHighlight] = useState(45);

  const W = 460, H = 240, PL = 50, PB = 40, PT = 16, PR = 20;
  const GW = W - PL - PR, GH = H - PT - PB;

  // Range for each angle
  const angles = Array.from({ length: 89 }, (_, i) => i + 1);
  const ranges = angles.map(a => (v0 * v0 * Math.sin(2 * a * Math.PI / 180)) / G);
  const maxR = Math.max(...ranges) * 1.1;

  function toSVG(a, r) {
    return [PL + ((a - 1) / 88) * GW, PT + GH - (r / maxR) * GH];
  }

  const pts = angles.map((a, i) => toSVG(a, ranges[i]));
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  const hR = (v0 * v0 * Math.sin(2 * highlight * Math.PI / 180)) / G;
  const [hx, hy] = toSVG(highlight, hR);
  const comp = 90 - highlight;
  const [cx, cy] = toSVG(comp, hR);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · RANGE vs ANGLE</span>
        <span style={{ background: "#0d2a1e", color: "#34d399", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
          R(θ) = R(90°−θ) always
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "10px 20px 0" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
            <span>v₀ (m/s)</span><span style={{ color: "#10b981", fontWeight: 700 }}>{v0}</span>
          </div>
          <input type="range" min={5} max={50} step={1} value={v0} onChange={e => setV0(parseInt(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
            <span>Angle θ</span><span style={{ color: "#818cf8", fontWeight: 700 }}>{highlight}°</span>
          </div>
          <input type="range" min={1} max={89} step={1} value={highlight} onChange={e => setHighlight(parseInt(e.target.value))} style={{ width: "100%" }} />
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8 }}>
        {[0, 15, 30, 45, 60, 75, 90].map(a => {
          if (a === 0 || a === 90) return null;
          const [tx] = toSVG(a, 0);
          return <line key={a} x1={tx} y1={PT} x2={tx} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />;
        })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1.5} />
        {[15, 30, 45, 60, 75].map(a => { const [tx] = toSVG(a, 0); return <text key={a} x={tx} y={PT + GH + 14} fill="#475569" fontSize={9} textAnchor="middle">{a}°</text>; })}
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">Launch angle (°)</text>
        <text x={12} y={PT + GH / 2} fill="#475569" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>Range (m)</text>
        <path d={d} fill="none" stroke="#10b981" strokeWidth={2.5} />
        {/* Symmetric pair */}
        <circle cx={hx} cy={hy} r={6} fill="#818cf8" stroke="#e0e7ff" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={6} fill="#f59e0b" stroke="#fef3c7" strokeWidth={1.5} />
        <line x1={hx} y1={hy} x2={cx} y2={cy} stroke="#475569" strokeWidth={1} strokeDasharray="4 3" />
        <text x={hx} y={hy - 10} fill="#818cf8" fontSize={10} textAnchor="middle">{highlight}°</text>
        <text x={cx} y={cy - 10} fill="#f59e0b" fontSize={10} textAnchor="middle">{comp}°</text>
        {/* 45° marker */}
        {(() => { const [mx, my] = toSVG(45, ranges[44]); return <text x={mx} y={my - 10} fill="#10b981" fontSize={9} textAnchor="middle">45° max</text>; })()}
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: `R at ${highlight}°`, val: hR.toFixed(2) + " m", color: "#818cf8" },
          { label: `R at ${comp}°`, val: hR.toFixed(2) + " m", color: "#f59e0b" },
          { label: "R at 45° (max)", val: ((v0 * v0) / G).toFixed(2) + " m", color: "#10b981" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
