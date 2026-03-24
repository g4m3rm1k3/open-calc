// HorizontalLaunchIntuition.jsx — Ch3 L2 Pillar 1
import { useState } from "react";

const G = 9.8;
const W = 460, H = 300, PL = 50, PB = 40, PT = 20, PR = 20;
const GW = W - PL - PR, GH = H - PT - PB;

export default function HorizontalLaunchIntuition({ params = {} }) {
  const [vx, setVx] = useState(15);
  const [h0, setH0] = useState(45);

  const tFall = Math.sqrt(2 * h0 / G);
  const range = vx * tFall;
  const vfx = vx;
  const vfy = G * tFall;
  const vf = Math.sqrt(vfx * vfx + vfy * vfy);
  const theta_f = Math.atan2(vfy, vfx) * 180 / Math.PI;

  // Trajectory points (in metres)
  const nPts = 60;
  const trajPts = Array.from({ length: nPts + 1 }, (_, i) => {
    const t = (i / nPts) * tFall;
    return { x: vx * t, y: h0 - 0.5 * G * t * t };
  });

  // Scale to SVG
  const xMax = range * 1.1 || 1, yMax = h0 * 1.1 || 1;
  function toSVG(x, y) {
    return [PL + (x / xMax) * GW, PT + GH - (y / yMax) * GH];
  }
  const svgPts = trajPts.map(p => toSVG(p.x, p.y));
  const d = svgPts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const [lx, ly] = toSVG(range, 0);
  const [sx, sy] = toSVG(0, h0);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · HORIZONTAL LAUNCH</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "10px 20px 0" }}>
        {[
          { label: "Horizontal speed vx (m/s)", val: vx, set: setVx, min: 2, max: 40, step: 1, color: "#f59e0b" },
          { label: "Height h₀ (m)", val: h0, set: setH0, min: 5, max: 100, step: 1, color: "#6366f1" },
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
        {/* Ground */}
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1.5} />
        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        {/* Height annotation */}
        <line x1={sx} y1={sy} x2={sx} y2={PT + GH} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={sx - 6} y={(sy + PT + GH) / 2} fill="#6366f1" fontSize={10} textAnchor="end">h₀={h0}m</text>
        {/* Trajectory */}
        <path d={d} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
        {/* Range annotation */}
        <line x1={sx} y1={PT + GH + 12} x2={lx} y2={PT + GH + 12} stroke="#10b981" strokeWidth={1.5} />
        <text x={(sx + lx) / 2} y={PT + GH + 26} fill="#10b981" fontSize={10} textAnchor="middle">R = {range.toFixed(1)} m</text>
        {/* Launch point */}
        <circle cx={sx} cy={sy} r={6} fill="#f43f5e" />
        <text x={sx + 8} y={sy - 6} fill="#f43f5e" fontSize={10}>v₀ = {vx} m/s →</text>
        {/* Landing point */}
        <circle cx={lx} cy={PT + GH} r={6} fill="#10b981" />
        {/* vx label at mid-trajectory */}
        <text x={W - PR - 4} y={PT + 16} fill="#f59e0b" fontSize={10} textAnchor="end">vx = {vfx.toFixed(1)} m/s (const)</text>
        <text x={W - PR - 4} y={PT + 30} fill="#6366f1" fontSize={10} textAnchor="end">vy at landing = {vfy.toFixed(1)} m/s</text>
        <text x={W - PR - 4} y={PT + 44} fill="#818cf8" fontSize={10} textAnchor="end">|v_f| = {vf.toFixed(1)} m/s @ {theta_f.toFixed(1)}°</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "t (fall time)", val: tFall.toFixed(3) + " s", color: "#818cf8" },
          { label: "Range R", val: range.toFixed(2) + " m", color: "#10b981" },
          { label: "|v_final|", val: vf.toFixed(2) + " m/s", color: "#f43f5e" },
          { label: "angle below horiz", val: theta_f.toFixed(1) + "°", color: "#64748b" },
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
