// TwoObjectsExplorer.jsx — Ch2 L20-21 Pillar 4
import { useState } from "react";

export default function TwoObjectsExplorer({ params = {} }) {
  const [scenario, setScenario] = useState(0);

  const SCENARIOS = [
    {
      name: "Chase problem",
      desc: "Car A at x=0, v=20 m/s. Car B at x=100 m, v=15 m/s. Both constant velocity.",
      xA: t => 20 * t, xB: t => 100 + 15 * t,
      equation: "20t = 100 + 15t  →  5t = 100  →  t = 20 s",
      tMeet: 20, xMeet: 400,
    },
    {
      name: "Ball vs dropped",
      desc: "Ball thrown up at 20 m/s from x=0. Stone dropped from x=50 m at same time.",
      xA: t => 20 * t - 4.9 * t * t, xB: t => 50 - 4.9 * t * t,
      equation: "20t − 4.9t² = 50 − 4.9t²  →  20t = 50  →  t = 2.5 s",
      tMeet: 2.5, xMeet: 50 - 4.9 * 2.5 * 2.5,
    },
    {
      name: "Head-on approach",
      desc: "Object A at x=0, v=10 m/s. Object B at x=200, v=−15 m/s (toward A).",
      xA: t => 10 * t, xB: t => 200 - 15 * t,
      equation: "10t = 200 − 15t  →  25t = 200  →  t = 8 s",
      tMeet: 8, xMeet: 80,
    },
  ];

  const S = SCENARIOS[scenario];
  const T_MAX = S.tMeet * 1.6;
  const W = 440, H = 200, PL = 52, PB = 32, PT = 14, PR = 14;
  const GW = W - PL - PR, GH = H - PT - PB;

  const allX = Array.from({ length: 81 }, (_, i) => {
    const t = i / 80 * T_MAX;
    return [S.xA(t), S.xB(t)];
  }).flat();
  const xMin = Math.min(...allX) - 5, xMax = Math.max(...allX) + 5;
  const xRange = xMax - xMin;

  function toSVG(t, x) {
    return [PL + (t / T_MAX) * GW, PT + GH - ((x - xMin) / xRange) * GH];
  }

  const ptsA = Array.from({ length: 81 }, (_, i) => { const t = i / 80 * T_MAX; return toSVG(t, S.xA(t)); });
  const ptsB = Array.from({ length: 81 }, (_, i) => { const t = i / 80 * T_MAX; return toSVG(t, S.xB(t)); });
  const dA = ptsA.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const dB = ptsB.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const [mx, my] = toSVG(S.tMeet, S.xMeet);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#0ea5e9", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · TWO-OBJECT EXPLORER</span>
        <div style={{ display: "flex", gap: 6 }}>
          {SCENARIOS.map((sc, i) => (
            <button key={i} onClick={() => setScenario(i)} style={{
              background: scenario === i ? "#0ea5e9" : "#1e293b", color: scenario === i ? "#0f172a" : "#64748b",
              border: `1px solid ${scenario === i ? "#0ea5e9" : "#334155"}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
            }}>{sc.name}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "6px 20px 4px", fontSize: 12, color: "#64748b" }}>{S.desc}</div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map(f => { const [tx] = toSVG(f * T_MAX, 0); return <line key={f} x1={tx} y1={PT} x2={tx} y2={PT + GH} stroke="#1a2540" strokeWidth={0.5} />; })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <path d={dA} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        <path d={dB} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
        <circle cx={mx} cy={my} r={7} fill="#10b981" stroke="#0f172a" strokeWidth={2} />
        <text x={mx + 10} y={my} fill="#10b981" fontSize={10} fontWeight="700">t={S.tMeet}s, x={S.xMeet.toFixed(0)}m</text>
        {[0, 0.25, 0.5, 0.75, 1].map(f => { const [tx] = toSVG(f * T_MAX, 0); return <text key={f} x={tx} y={PT + GH + 14} fill="#475569" fontSize={8} textAnchor="middle">{(f * T_MAX).toFixed(1)}s</text>; })}
        <text x={12} y={PT + GH / 2} fill="#475569" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>x (m)</text>
        <text x={PL + 4} y={ptsA[0][1] - 6} fill="#6366f1" fontSize={10} fontWeight="700">A</text>
        <text x={PL + 4} y={ptsB[0][1] - 6} fill="#f59e0b" fontSize={10} fontWeight="700">B</text>
      </svg>

      <div style={{ padding: "8px 20px 16px", background: "#1e293b", margin: "8px 20px", borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>Set x_A(t) = x_B(t) and solve:</div>
        <div style={{ fontFamily: "'Fira Code',monospace", fontSize: 13, color: "#10b981" }}>{S.equation}</div>
      </div>
    </div>
  );
}
