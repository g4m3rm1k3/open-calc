// CliffLaunchIntuition.jsx — Ch3 L9 Pillar 1
import { useState } from "react";
const G = 9.8;
const W = 460, H = 300, PL = 48, PB = 36, PT = 16, PR = 20;
const GW = W - PL - PR, GH = H - PT - PB;

export default function CliffLaunchIntuition({ params = {} }) {
  const [v0, setV0] = useState(25);
  const [theta, setTheta] = useState(30);
  const [cliffH, setCliffH] = useState(60);

  const th = theta * Math.PI / 180;
  const vx = v0 * Math.cos(th), vy0 = v0 * Math.sin(th);

  // Solve: cliffH + vy0*t - 0.5*g*t^2 = 0
  // 0.5g*t^2 - vy0*t - cliffH = 0
  const a_q = 0.5 * G, b_q = -vy0, c_q = -cliffH;
  const disc = b_q * b_q - 4 * a_q * c_q;
  const t1 = (-b_q + Math.sqrt(disc)) / (2 * a_q);
  const t2 = (-b_q - Math.sqrt(disc)) / (2 * a_q);
  const tLand = Math.max(t1, t2);
  const R = vx * tLand;
  const yPeak = cliffH + vy0 * vy0 / (2 * G);

  const totalH = cliffH + Math.max(vy0 * vy0 / (2 * G), 0) + 5;
  const xMax = R * 1.1 || 10;

  function toSVG(x, y) {
    return [PL + (x / xMax) * GW, PT + GH - ((y + cliffH) / (totalH + cliffH)) * GH];
  }

  const nPts = 100;
  const traj = Array.from({ length: nPts + 1 }, (_, i) => {
    const t = (i / nPts) * tLand;
    return toSVG(vx * t, vy0 * t - 0.5 * G * t * t);
  });
  const trajD = traj.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  const [ox, oy] = toSVG(0, 0);
  const [gx1, gy1] = toSVG(-0.02 * xMax, -cliffH);
  const [rx, ] = toSVG(R, -cliffH);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · CLIFF LAUNCH</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "10px 20px 0" }}>
        {[
          { label: "v₀ (m/s)", val: v0, set: setV0, min: 5, max: 60, step: 1, color: "#818cf8" },
          { label: "θ (°)", val: theta, set: setTheta, min: -60, max: 75, step: 1, color: "#f59e0b" },
          { label: "Cliff height (m)", val: cliffH, set: setCliffH, min: 5, max: 150, step: 5, color: "#f43f5e" },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 2 }}>
              <span>{label}</span><span style={{ color, fontWeight: 700 }}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8 }}>
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />

        {/* Cliff body */}
        <rect x={0} y={oy} width={ox} height={gy1 - oy} fill="#334155" opacity={0.4} />
        <line x1={0} y1={gy1} x2={PL + GW} y2={gy1} stroke="#334155" strokeWidth={1.5} />
        <text x={PL - 6} y={(oy + gy1) / 2 + 4} fill="#f43f5e" fontSize={10} textAnchor="end">{cliffH}m</text>
        <line x1={PL - 4} y1={oy} x2={PL - 4} y2={gy1} stroke="#f43f5e" strokeWidth={1} />

        {/* Trajectory */}
        <path d={trajD} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Launch and landing markers */}
        <circle cx={ox} cy={oy} r={6} fill="#f43f5e" />
        <circle cx={rx} cy={gy1} r={6} fill="#10b981" />

        {/* Range arrow */}
        <line x1={ox} y1={gy1 + 12} x2={rx} y2={gy1 + 12} stroke="#10b981" strokeWidth={1.5} />
        <text x={(ox + rx) / 2} y={gy1 + 26} fill="#10b981" fontSize={10} textAnchor="middle">R = {R.toFixed(1)} m</text>

        <text x={W - PR - 4} y={PT + 16} fill="#94a3b8" fontSize={9} textAnchor="end">t_land = {tLand.toFixed(3)} s</text>
        <text x={W - PR - 4} y={PT + 29} fill="#94a3b8" fontSize={9} textAnchor="end">R = {R.toFixed(1)} m</text>
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">x (m)</text>
      </svg>

      <div style={{ padding: "6px 20px", background: "#1e293b", margin: "8px 20px", borderRadius: 8, fontFamily: "'Fira Code',monospace", fontSize: 11, color: "#94a3b8", lineHeight: 2 }}>
        <div>Set y_final = −{cliffH}: {cliffH} + {vy0.toFixed(2)}t − ½(9.8)t² = 0</div>
        <div>Quadratic → t = {tLand.toFixed(4)} s  (take positive root)</div>
        <div style={{ color: "#10b981" }}>R = {vx.toFixed(2)} × {tLand.toFixed(4)} = {R.toFixed(3)} m</div>
      </div>

      <div style={{ padding: "4px 20px 14px", fontSize: 12, color: "#475569" }}>
        Drag θ negative for a downward-angled launch. The quadratic always has one positive and one negative root — always take the positive (physical) time.
      </div>
    </div>
  );
}
