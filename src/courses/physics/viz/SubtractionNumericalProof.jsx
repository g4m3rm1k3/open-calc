// SubtractionNumericalProof.jsx — L8 Pillar 2
import { useState } from "react";

const STEPS = [
  { title: "Component subtraction", eq: "A⃗ − B⃗ = (Aₓ−Bₓ, Aᵧ−Bᵧ)", insight: "This is the starting definition. We'll derive the law of cosines from it." },
  { title: "Square the magnitude", eq: "|A⃗−B⃗|² = (Aₓ−Bₓ)² + (Aᵧ−Bᵧ)²", insight: "Squaring the magnitude is always the Pythagorean theorem applied to the components." },
  { title: "Expand", eq: "= Aₓ²−2AₓBₓ+Bₓ² + Aᵧ²−2AᵧBᵧ+Bᵧ²", insight: "Expand each square. The cross terms −2AₓBₓ and −2AᵧBᵧ will become the dot product." },
  { title: "Regroup", eq: "= (Aₓ²+Aᵧ²) + (Bₓ²+Bᵧ²) − 2(AₓBₓ+AᵧBᵧ)", insight: "Recognise |A⃗|² = Aₓ²+Aᵧ² and |B⃗|² = Bₓ²+Bᵧ². The last term is the dot product." },
  { title: "Law of cosines", eq: "= |A⃗|² + |B⃗|² − 2|A⃗||B⃗|cosφ", insight: "The dot product A⃗·B⃗ = |A⃗||B⃗|cosφ. This is the law of cosines for the difference — a minus sign instead of the plus sign in the addition formula." },
];

const W = 260, H = 190, SC = 40, CX = 100, CY = 140;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }
const VA = [2.2, 1.0], VB = [0.7, 1.9], DIFF = [VA[0] - VB[0], VA[1] - VB[1]];

export default function SubtractionNumericalProof({ params = {} }) {
  const si = Math.min(params.currentStep ?? 0, STEPS.length - 1);
  const step = STEPS[si];
  const [ox, oy] = ts(0, 0);

  function Arr({ from, to, color, w = 2.5, dashed = false, label }) {
    const [fx, fy] = ts(from[0], from[1]), [tx, ty] = ts(to[0], to[1]);
    const dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy);
    if (len < 3) return null;
    const ux = dx / len, uy = dy / len, hl = 9;
    const ex = tx - ux * hl, ey = ty - uy * hl;
    return (
      <g>
        <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeDasharray={dashed ? "4 3" : "none"} strokeLinecap="round" />
        <polygon points={`${tx},${ty} ${ex - uy * 4.5},${ey + ux * 4.5} ${ex + uy * 4.5},${ey - ux * 4.5}`} fill={color} />
        {label && <text x={tx + 7} y={ty - 7} fill={color} fontSize={11} fontWeight="700">{label}</text>}
      </g>
    );
  }

  // Angle arc
  const dot = VA[0] * VB[0] + VA[1] * VB[1];
  const mA = Math.sqrt(VA[0] ** 2 + VA[1] ** 2), mB = Math.sqrt(VB[0] ** 2 + VB[1] ** 2);
  const phi = Math.acos(dot / (mA * mB));
  const arcR = 24;
  const arcEnd = [CX + arcR * Math.cos(-phi), CY + arcR * Math.sin(-phi)];

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#f43f5e", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>STEP {si + 1}/{STEPS.length}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{step.title}</span>
      </div>
      <div style={{ margin: "10px 20px", padding: "10px 14px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#fda4af", borderLeft: "3px solid #f43f5e" }}>{step.eq}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {[-2, -1, 0, 1, 2].map(i => {
            const [x1, y1] = ts(i, -2.5), [x2, y2] = ts(i, 2.5), [x3, y3] = ts(-2, i), [x4, y4] = ts(2.5, i);
            return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5} /><line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5} /></g>;
          })}
          <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1} />
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1} />
          <Arr from={[0, 0]} to={VA} color="#6366f1" label="A⃗" />
          <Arr from={[0, 0]} to={VB} color="#f59e0b" label="B⃗" />
          <Arr from={[0, 0]} to={DIFF} color="#f43f5e" w={3} label="A⃗−B⃗" />
          {si >= 4 && <path d={`M ${CX + arcR} ${CY} A ${arcR} ${arcR} 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`} fill="none" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="3 2" />}
          {si >= 4 && <text x={CX + 36} y={CY - 20} fill="#818cf8" fontSize={10}>φ</text>}
          <circle cx={CX} cy={CY} r={3} fill="#475569" />
        </svg>

        <div style={{ padding: "14px 14px 14px 0", display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            { show: true, label: "|A⃗|²", val: (mA ** 2).toFixed(2), color: "#6366f1" },
            { show: true, label: "|B⃗|²", val: (mB ** 2).toFixed(2), color: "#f59e0b" },
            { show: si >= 3, label: "A⃗·B⃗", val: dot.toFixed(2), color: "#818cf8" },
            { show: si >= 4, label: "|A⃗−B⃗|²", val: (DIFF[0] ** 2 + DIFF[1] ** 2).toFixed(3), color: "#f43f5e" },
          ].map(({ show, label, val, color }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: 7, padding: "8px 10px", opacity: show ? 1 : 0.2, transition: "opacity 0.4s", borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
              <div style={{ fontSize: 14, fontFamily: "'Fira Code',monospace", fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: "0 20px 20px", padding: "11px 15px", background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>{step.insight}
      </div>
    </div>
  );
}
