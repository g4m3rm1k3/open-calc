// TwoObjectsIntuition.jsx — Ch2 L20-21 Pillar 1
import { useState } from "react";

export default function TwoObjectsIntuition({ params = {} }) {
  const [x0A, setX0A] = useState(0);
  const [v0A, setV0A] = useState(20);
  const [aA, setAA] = useState(0);
  const [x0B, setX0B] = useState(100);
  const [v0B, setV0B] = useState(15);
  const [aB, setAB] = useState(0);

  const xA = t => x0A + v0A * t + 0.5 * aA * t * t;
  const xB = t => x0B + v0B * t + 0.5 * aB * t * t;

  // Find meeting time numerically
  let tMeet = null;
  for (let i = 0; i < 2000; i++) {
    const t = i * 0.05;
    if (Math.abs(xA(t) - xB(t)) < 0.5 && (i === 0 || (xA(t - 0.05) - xB(t - 0.05)) * (xA(t) - xB(t)) < 0)) {
      tMeet = t;
      break;
    }
  }

  const T_MAX = Math.min(tMeet ? tMeet * 1.5 : 20, 30);
  const W = 460, H = 220, PL = 52, PB = 36, PT = 16, PR = 16;
  const GW = W - PL - PR, GH = H - PT - PB;

  const allX = Array.from({ length: 81 }, (_, i) => {
    const t = i / 80 * T_MAX;
    return [xA(t), xB(t)];
  }).flat();
  const xMin = Math.min(...allX), xMax = Math.max(...allX);
  const xRange = Math.max(xMax - xMin, 10);

  function toSVG(t, x) {
    return [PL + (t / T_MAX) * GW, PT + GH - ((x - xMin) / xRange) * GH];
  }

  const ptsA = Array.from({ length: 81 }, (_, i) => { const t = i / 80 * T_MAX; return toSVG(t, xA(t)); });
  const ptsB = Array.from({ length: 81 }, (_, i) => { const t = i / 80 * T_MAX; return toSVG(t, xB(t)); });
  const dA = ptsA.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const dB = ptsB.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · TWO OBJECTS</span>
        {tMeet !== null
          ? <span style={{ background: "#0d2a1e", color: "#34d399", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>Meet at t = {tMeet.toFixed(2)} s</span>
          : <span style={{ background: "#2a0d0d", color: "#f87171", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>No meeting in window</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "10px 20px 0" }}>
        {[
          [{ label: "A: x₀", val: x0A, set: setX0A, min: -20, max: 100 }, { label: "A: v₀", val: v0A, set: setV0A, min: -30, max: 40 }, { label: "A: a", val: aA, set: setAA, min: -5, max: 5, step: 0.5 }],
          [{ label: "B: x₀", val: x0B, set: setX0B, min: 0, max: 200 }, { label: "B: v₀", val: v0B, set: setV0B, min: -30, max: 40 }, { label: "B: a", val: aB, set: setAB, min: -5, max: 5, step: 0.5 }],
        ].map((group, gi) => (
          <div key={gi} style={{ background: "#1e293b", borderRadius: 10, padding: "10px 12px", borderLeft: `3px solid ${gi === 0 ? "#6366f1" : "#f59e0b"}` }}>
            <div style={{ fontSize: 11, color: gi === 0 ? "#6366f1" : "#f59e0b", fontWeight: 700, marginBottom: 8 }}>Object {gi === 0 ? "A" : "B"}</div>
            {group.map(({ label, val, set, min, max, step = 1 }) => (
              <div key={label} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 2 }}><span>{label}</span><span style={{ color: "#e2e8f0", fontWeight: 700 }}>{val.toFixed(1)}</span></div>
                <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8 }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const [tx] = toSVG(f * T_MAX, 0);
          return <line key={f} x1={tx} y1={PT} x2={tx} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />;
        })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <path d={dA} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        <path d={dB} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
        <text x={PL + 4} y={ptsA[0][1] - 6} fill="#6366f1" fontSize={10} fontWeight="700">A</text>
        <text x={PL + 4} y={ptsB[0][1] - 6} fill="#f59e0b" fontSize={10} fontWeight="700">B</text>
        {tMeet !== null && (() => {
          const [mx, my] = toSVG(tMeet, xA(tMeet));
          return <>
            <circle cx={mx} cy={my} r={7} fill="#10b981" stroke="#0f172a" strokeWidth={2} />
            <text x={mx + 10} y={my - 4} fill="#10b981" fontSize={10} fontWeight="700">MEET</text>
          </>;
        })()}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const [tx] = toSVG(f * T_MAX, 0);
          return <text key={f} x={tx} y={PT + GH + 14} fill="#475569" fontSize={8} textAnchor="middle">{(f * T_MAX).toFixed(1)}s</text>;
        })}
        <text x={12} y={PT + GH / 2} fill="#475569" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>x (m)</text>
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">time (s)</text>
      </svg>

      <div style={{ padding: "8px 20px 14px", background: "#1e293b", margin: "8px 20px", borderRadius: 8, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#94a3b8" }}>
        <div>x_A(t) = {x0A} + {v0A}t + ½({aA})t²</div>
        <div>x_B(t) = {x0B} + {v0B}t + ½({aB})t²</div>
        {tMeet && <div style={{ color: "#10b981", marginTop: 4 }}>Set equal → t ≈ {tMeet.toFixed(3)} s, x ≈ {xA(tMeet).toFixed(1)} m</div>}
      </div>
    </div>
  );
}
