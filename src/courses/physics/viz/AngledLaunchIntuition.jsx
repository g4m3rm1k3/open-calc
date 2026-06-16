// AngledLaunchIntuition.jsx — Ch3 L3-4 Pillar 1
import { useState } from "react";

const G = 9.8;
const W = 480, H = 300, PL = 50, PB = 40, PT = 20, PR = 20;
const GW = W - PL - PR, GH = H - PT - PB;

export default function AngledLaunchIntuition({ params = {} }) {
  const [v0, setV0] = useState(25);
  const [theta, setTheta] = useState(40);
  const [showComponents, setShowComponents] = useState(true);

  const thetaRad = theta * Math.PI / 180;
  const vx = v0 * Math.cos(thetaRad);
  const vy0 = v0 * Math.sin(thetaRad);
  const tFlight = 2 * vy0 / G;
  const range = vx * tFlight;
  const hMax = vy0 * vy0 / (2 * G);

  const nPts = 80;
  const trajPts = Array.from({ length: nPts + 1 }, (_, i) => {
    const t = (i / nPts) * tFlight;
    return { x: vx * t, y: vy0 * t - 0.5 * G * t * t };
  });

  const xMax = Math.max(range * 1.1, 1), yMax = Math.max(hMax * 1.3, 1);
  function toSVG(x, y) {
    return [PL + (x / xMax) * GW, PT + GH - (y / yMax) * GH];
  }
  const svgPts = trajPts.map(p => toSVG(p.x, p.y));
  const d = svgPts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  // Peak point
  const tPeak = vy0 / G;
  const [pkx, pky] = toSVG(vx * tPeak, hMax);
  const [ox, oy] = toSVG(0, 0);
  const [rx, ry] = toSVG(range, 0);

  // Velocity components at launch
  const arrowScale = 5;
  const vxArrX = ox + vx * arrowScale;
  const vyArrY = oy - vy0 * arrowScale;

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · ANGLED LAUNCH</span>
        <button onClick={() => setShowComponents(c => !c)} style={{
          background: showComponents ? "#1e293b" : "#0f172a", color: showComponents ? "#818cf8" : "#475569",
          border: `1px solid ${showComponents ? "#818cf8" : "#334155"}`, borderRadius: 6,
          padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
        }}>
          {showComponents ? "Components ON" : "Components OFF"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "10px 20px 0" }}>
        {[
          { label: "v₀ (m/s)", val: v0, set: setV0, min: 5, max: 50, step: 1, color: "#818cf8" },
          { label: "θ (°)", val: theta, set: setTheta, min: 1, max: 89, step: 1, color: "#f59e0b" },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
              <span>{label}</span><span style={{ color, fontWeight: 700 }}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseInt(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 8 }}>
        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1.5} />

        {/* Height dashed */}
        <line x1={pkx} y1={pky} x2={pkx} y2={PT + GH} stroke="#818cf8" strokeWidth={0.8} strokeDasharray="3 3" />
        <text x={pkx + 4} y={pky - 4} fill="#818cf8" fontSize={9}>H={hMax.toFixed(1)}m</text>

        {/* Trajectory */}
        <path d={d} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Peak marker */}
        <circle cx={pkx} cy={pky} r={4} fill="#818cf8" />

        {/* Launch components */}
        {showComponents && (
          <>
            {/* vx component */}
            <line x1={ox} y1={oy} x2={vxArrX} y2={oy} stroke="#f59e0b" strokeWidth={2} />
            <polygon points={`${vxArrX},${oy} ${vxArrX - 8},${oy - 4} ${vxArrX - 8},${oy + 4}`} fill="#f59e0b" />
            <text x={(ox + vxArrX) / 2} y={oy + 14} fill="#f59e0b" fontSize={10} textAnchor="middle">vx={vx.toFixed(1)}</text>

            {/* vy component */}
            <line x1={ox} y1={oy} x2={ox} y2={vyArrY} stroke="#10b981" strokeWidth={2} />
            <polygon points={`${ox},${vyArrY} ${ox - 4},${vyArrY + 8} ${ox + 4},${vyArrY + 8}`} fill="#10b981" />
            <text x={ox - 6} y={(oy + vyArrY) / 2} fill="#10b981" fontSize={10} textAnchor="end">vy₀={vy0.toFixed(1)}</text>

            {/* v0 resultant */}
            {(() => {
              const endX = ox + v0 * Math.cos(thetaRad) * arrowScale;
              const endY = oy - v0 * Math.sin(thetaRad) * arrowScale;
              return <>
                <line x1={ox} y1={oy} x2={endX} y2={endY} stroke="#f43f5e" strokeWidth={2.5} />
                <polygon points={`${endX},${endY} ${endX - 5},${endY + 8} ${endX + 5},${endY + 8}`}
                  fill="#f43f5e" transform={`rotate(${-theta},${endX},${endY})`} />
                <text x={endX + 6} y={endY - 4} fill="#f43f5e" fontSize={10} fontWeight="700">v₀={v0}</text>
              </>;
            })()}

            {/* Angle arc */}
            <path d={`M ${ox + 28} ${oy} A 28 28 0 0 0 ${ox + 28 * Math.cos(thetaRad)} ${oy - 28 * Math.sin(thetaRad)}`}
              fill="none" stroke="#f59e0b" strokeWidth={1} />
            <text x={ox + 36} y={oy - 14} fill="#f59e0b" fontSize={9}>{theta}°</text>
          </>
        )}

        {/* Range annotation */}
        <line x1={ox} y1={PT + GH + 10} x2={rx} y2={PT + GH + 10} stroke="#10b981" strokeWidth={1.5} />
        <text x={(ox + rx) / 2} y={PT + GH + 24} fill="#10b981" fontSize={10} textAnchor="middle">R={range.toFixed(1)}m</text>

        <circle cx={ox} cy={oy} r={5} fill="#f43f5e" />
        <circle cx={rx} cy={PT + GH} r={5} fill="#10b981" />
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, padding: "0 20px 20px" }}>
        {[
          { label: "vx", val: vx.toFixed(2) + " m/s", color: "#f59e0b" },
          { label: "vy₀", val: vy0.toFixed(2) + " m/s", color: "#10b981" },
          { label: "t_flight", val: tFlight.toFixed(3) + " s", color: "#818cf8" },
          { label: "H_max", val: hMax.toFixed(2) + " m", color: "#818cf8" },
          { label: "Range R", val: range.toFixed(2) + " m", color: "#10b981" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "7px 8px" }}>
            <div style={{ fontSize: 9, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
