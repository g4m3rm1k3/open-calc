// SlopeLandingIntuition.jsx — Ch3 L13-14 Pillar 1
import { useState } from "react";
const G = 9.8;
const W = 460, H = 280, PL = 48, PB = 36, PT = 16, PR = 20;
const GW = W - PL - PR, GH = H - PT - PB;

export default function SlopeLandingIntuition({ params = {} }) {
  const [v0, setV0] = useState(20);
  const [theta, setTheta] = useState(40);
  const [phi, setPhi] = useState(15);   // slope angle (positive = up, negative = down)

  const th = theta * Math.PI / 180;
  const phiRad = phi * Math.PI / 180;
  const vx = v0 * Math.cos(th), vy0 = v0 * Math.sin(th);

  // Trajectory: y_traj = x*tanθ - gx²/(2vx²)
  // Slope:      y_slope = x*tanφ
  // Set equal:  x*tanθ - gx²/(2vx²) = x*tanφ
  // x(tanθ - tanφ) = gx²/(2vx²)
  // x = 2vx²(tanθ - tanφ)/g   (non-zero solution)
  const xLand = (2 * vx * vx * (Math.tan(th) - Math.tan(phiRad))) / G;
  const yLand = xLand * Math.tan(phiRad);
  const tLand = xLand / vx;

  const hMax = vy0 * vy0 / (2 * G);
  const xRange = Math.max(xLand * 1.2, 5);
  const yMin = Math.min(0, yLand) - 2;
  const yMax = Math.max(hMax * 1.2, yLand + 2, 2);

  function toSVG(x, y) {
    return [PL + (x / xRange) * GW, PT + GH - ((y - yMin) / (yMax - yMin)) * GH];
  }

  // Trajectory
  const tFlight = 2 * vy0 / G;
  const tEnd = tLand > 0 ? tLand * 1.05 : tFlight;
  const nPts = 80;
  const traj = Array.from({ length: nPts + 1 }, (_, i) => {
    const t = (i / nPts) * tEnd;
    const x = vx * t, y = vy0 * t - 0.5 * G * t * t;
    return toSVG(x, y);
  });
  const trajD = traj.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  // Slope line from origin to beyond landing
  const slopeEndX = xRange;
  const [sx0, sy0] = toSVG(0, 0);
  const [sx1, sy1] = toSVG(slopeEndX, slopeEndX * Math.tan(phiRad));

  const [landSVGx, landSVGy] = toSVG(xLand, yLand);
  const validLanding = xLand > 0.1 && tLand > 0;

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · SLOPE LANDING</span>
        {validLanding && (
          <span style={{ background: "#1e293b", color: "#f59e0b", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
            Lands at ({xLand.toFixed(1)}, {yLand.toFixed(1)}) m
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "10px 20px 0" }}>
        {[
          { label: "v₀ (m/s)", val: v0, set: setV0, min: 5, max: 40, step: 0.5, color: "#818cf8" },
          { label: "Launch θ (°)", val: theta, set: setTheta, min: 5, max: 85, step: 1, color: "#6366f1" },
          { label: "Slope φ (° + up, − down)", val: phi, set: setPhi, min: -30, max: 40, step: 1, color: "#f59e0b" },
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

        {/* Slope */}
        <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke="#f59e0b" strokeWidth={2} />
        <text x={sx1 - 4} y={sy1 - 6} fill="#f59e0b" fontSize={10} textAnchor="end">slope φ={phi}°</text>

        {/* Flat ground reference */}
        <line x1={PL} y1={toSVG(0, 0)[1]} x2={PL + GW} y2={toSVG(0, 0)[1]} stroke="#334155" strokeWidth={0.5} strokeDasharray="3 3" />

        {/* Trajectory */}
        <path d={trajD} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Landing intersection */}
        {validLanding && (
          <>
            <circle cx={landSVGx} cy={landSVGy} r={7} fill="#10b981" stroke="#0f172a" strokeWidth={2} />
            <line x1={sx0} y1={sy0} x2={landSVGx} y2={landSVGy} stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
            <text x={landSVGx + 10} y={landSVGy - 6} fill="#10b981" fontSize={10}>({xLand.toFixed(1)}, {yLand.toFixed(1)})</text>
          </>
        )}

        <circle cx={sx0} cy={sy0} r={5} fill="#f43f5e" />
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">x (m)</text>
      </svg>

      <div style={{ padding: "6px 20px", background: "#1e293b", margin: "8px 20px", borderRadius: 8, fontFamily: "'Fira Code',monospace", fontSize: 11, color: "#94a3b8", lineHeight: 2 }}>
        <div>Trajectory: y = x·tan{theta}° − gx²/(2·{vx.toFixed(2)}²)</div>
        <div>Slope:      y = x·tan{phi}°</div>
        <div style={{ color: "#f59e0b" }}>Intersection: x = {validLanding ? xLand.toFixed(3) : "no solution"} m</div>
      </div>
      <div style={{ padding: "4px 20px 14px", fontSize: 12, color: "#475569" }}>
        Set trajectory = slope equation and factor out x. One solution is x=0 (launch), the other is the landing point.
      </div>
    </div>
  );
}
