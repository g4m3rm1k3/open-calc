// WallClearanceIntuition.jsx — Ch3 L7-9,15 Pillar 1
import { useState } from "react";
const G = 9.8;
const W = 460, H = 280, PL = 48, PB = 36, PT = 16, PR = 20;
const GW = W - PL - PR, GH = H - PT - PB;

export default function WallClearanceIntuition({ params = {} }) {
  const [v0, setV0] = useState(18);
  const [theta, setTheta] = useState(53);
  const [wallX, setWallX] = useState(12);
  const [wallH, setWallH] = useState(3);

  const th = theta * Math.PI / 180;
  const vx = v0 * Math.cos(th), vy0 = v0 * Math.sin(th);
  const tFlight = 2 * vy0 / G;
  const R = vx * tFlight;
  const hMax = vy0 * vy0 / (2 * G);

  // Height of trajectory at wall x position
  const tWall = wallX / vx;
  const yAtWall = vy0 * tWall - 0.5 * G * tWall * tWall;
  const clears = yAtWall >= wallH && wallX <= R;
  const margin = (yAtWall - wallH).toFixed(2);

  const xMax = Math.max(R * 1.1, wallX * 1.4, 5);
  const yMaxV = Math.max(hMax * 1.2, wallH * 1.4, 2);

  function toSVG(x, y) {
    return [PL + (x / xMax) * GW, PT + GH - (y / yMaxV) * GH];
  }

  const nPts = 80;
  const traj = Array.from({ length: nPts + 1 }, (_, i) => {
    const t = (i / nPts) * tFlight;
    return toSVG(vx * t, vy0 * t - 0.5 * G * t * t);
  });
  const trajD = traj.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  const [wx, ] = toSVG(wallX, 0);
  const [, wy0SVG] = toSVG(0, 0);
  const [, wyTop] = toSVG(0, wallH);
  const [dotX, dotY] = toSVG(wallX, Math.max(0, yAtWall));

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · WALL CLEARANCE</span>
        <span style={{
          background: clears ? "#0d2a1e" : "#2a0d0d",
          color: clears ? "#34d399" : "#f87171",
          borderRadius: 6, padding: "3px 12px", fontSize: 12, fontWeight: 700,
          transition: "all 0.2s"
        }}>
          {clears ? `✓ Clears by ${margin} m` : wallX > R ? "Wall beyond landing" : `✗ Falls short by ${Math.abs(parseFloat(margin)).toFixed(2)} m`}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "10px 20px 0" }}>
        {[
          { label: "v₀ (m/s)", val: v0, set: setV0, min: 5, max: 35, step: 0.5, color: "#818cf8" },
          { label: "θ (°)", val: theta, set: setTheta, min: 1, max: 89, step: 1, color: "#f59e0b" },
          { label: "Wall distance x (m)", val: wallX, set: setWallX, min: 1, max: 30, step: 0.5, color: "#64748b" },
          { label: "Wall height h (m)", val: wallH, set: setWallH, min: 0.5, max: 15, step: 0.5, color: "#f43f5e" },
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
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1.5} />

        {/* Wall */}
        <rect x={wx - 3} y={wyTop} width={6} height={wy0SVG - wyTop} fill={clears ? "#f59e0b" : "#f43f5e"} opacity={0.8} />
        <text x={wx} y={wyTop - 6} fill={clears ? "#f59e0b" : "#f43f5e"} fontSize={10} textAnchor="middle">{wallH}m</text>

        {/* Ground clearance guide at wall */}
        {wallX <= R && (
          <line x1={wx} y1={Math.min(wyTop, dotY)} x2={wx + 18} y2={Math.min(wyTop, dotY)} stroke="#475569" strokeWidth={0.8} strokeDasharray="2 2" />
        )}

        <path d={trajD} fill="none" stroke={clears ? "#6366f1" : "#f43f5e"} strokeWidth={2.5} />

        {/* Intercept dot at wall */}
        {wallX <= R && tWall <= tFlight && (
          <circle cx={dotX} cy={dotY} r={6} fill={clears ? "#34d399" : "#f87171"} stroke="#0f172a" strokeWidth={1.5} />
        )}

        {/* Landing mark */}
        {(() => { const [rx] = toSVG(R, 0); return <circle cx={rx} cy={PT + GH} r={5} fill="#818cf8" />; })()}

        {/* Annotation */}
        <text x={W - PR - 4} y={PT + 16} fill="#94a3b8" fontSize={9} textAnchor="end">R = {R.toFixed(1)} m</text>
        <text x={W - PR - 4} y={PT + 28} fill="#94a3b8" fontSize={9} textAnchor="end">y(wall) = {yAtWall.toFixed(2)} m</text>
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">x (m)</text>
      </svg>

      <div style={{ padding: "6px 20px 14px", fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
        t at wall = x/vx = {wallX}/{vx.toFixed(2)} = {tWall.toFixed(3)} s.
        y(t) = {vy0.toFixed(2)}({tWall.toFixed(3)}) − ½(9.8)({tWall.toFixed(3)})² = {yAtWall.toFixed(3)} m
      </div>
    </div>
  );
}
