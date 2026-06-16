// FreeFallSymmetryIntuition.jsx — Ch2 L13 Pillar 1
import { useState } from "react";

const G = 9.8;

export default function FreeFallSymmetryIntuition({ params = {} }) {
  const [v0, setV0] = useState(20);
  const tPeak = v0 / G;
  const hMax = v0 * v0 / (2 * G);

  // Key symmetry facts
  const facts = [
    { label: "Speed at launch", val: v0.toFixed(2) + " m/s", color: "#10b981" },
    { label: "Speed at same height on way down", val: v0.toFixed(2) + " m/s", color: "#f43f5e", note: "same!" },
    { label: "Time up", val: tPeak.toFixed(3) + " s", color: "#6366f1" },
    { label: "Time down", val: tPeak.toFixed(3) + " s", color: "#818cf8", note: "equal" },
    { label: "Max height", val: hMax.toFixed(2) + " m", color: "#f59e0b" },
  ];

  const W = 300, H = 220;
  const cx = 80, scale = H / (hMax * 1.2 || 1);
  const groundY = H - 20;

  // Path of ball as vertical line with velocity arrows
  const nPts = 12;
  const upPts = Array.from({ length: nPts }, (_, i) => {
    const t = (i / (nPts - 1)) * tPeak;
    const h = v0 * t - 0.5 * G * t * t;
    const v = v0 - G * t;
    return { t, h, v, y: groundY - h * scale, side: "up" };
  });
  const downPts = Array.from({ length: nPts }, (_, i) => {
    const t = tPeak + (i / (nPts - 1)) * tPeak;
    const h = v0 * t - 0.5 * G * t * t;
    const v = v0 - G * t;
    return { t, h, v, y: groundY - h * scale, side: "down" };
  });

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · FREE FALL SYMMETRY</span>
      </div>

      <div style={{ padding: "10px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          <span>Initial velocity v₀</span><span style={{ color: "#818cf8", fontWeight: 700 }}>{v0} m/s</span>
        </div>
        <input type="range" min={5} max={35} step={1} value={v0} onChange={e => setV0(parseInt(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 0 }}>
        <svg width={W} height={H} style={{ display: "block" }}>
          {/* Ground */}
          <line x1={0} y1={groundY} x2={W} y2={groundY} stroke="#334155" strokeWidth={1.5} />

          {/* Up path */}
          <line x1={cx - 10} y1={groundY} x2={cx - 10} y2={groundY - hMax * scale} stroke="#10b981" strokeWidth={2} />
          {upPts.filter((_, i) => i % 3 === 0).map(({ y, v }, i) => {
            const arrowLen = Math.abs(v) / v0 * 20;
            return <g key={i}>
              <circle cx={cx - 10} cy={y} r={3} fill="#10b981" />
              <line x1={cx - 10} y1={y} x2={cx - 10} y2={y - arrowLen} stroke="#10b981" strokeWidth={1.5} />
              {arrowLen > 3 && <polygon points={`${cx - 10},${y - arrowLen} ${cx - 14},${y - arrowLen + 5} ${cx - 6},${y - arrowLen + 5}`} fill="#10b981" />}
            </g>;
          })}

          {/* Down path */}
          <line x1={cx + 10} y1={groundY - hMax * scale} x2={cx + 10} y2={groundY} stroke="#f43f5e" strokeWidth={2} />
          {downPts.filter((_, i) => i % 3 === 0).map(({ y, v }, i) => {
            const arrowLen = Math.abs(v) / v0 * 20;
            return <g key={i}>
              <circle cx={cx + 10} cy={y} r={3} fill="#f43f5e" />
              <line x1={cx + 10} y1={y} x2={cx + 10} y2={y + arrowLen} stroke="#f43f5e" strokeWidth={1.5} />
              {arrowLen > 3 && <polygon points={`${cx + 10},${y + arrowLen} ${cx + 6},${y + arrowLen - 5} ${cx + 14},${y + arrowLen - 5}`} fill="#f43f5e" />}
            </g>;
          })}

          {/* Max height line */}
          <line x1={20} y1={groundY - hMax * scale} x2={W - 20} y2={groundY - hMax * scale} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
          <text x={W - 15} y={groundY - hMax * scale - 4} fill="#f59e0b" fontSize={9} textAnchor="end">v=0</text>

          {/* Labels */}
          <text x={cx - 10} y={groundY + 16} fill="#10b981" fontSize={10} textAnchor="middle">↑ up</text>
          <text x={cx + 10} y={groundY + 16} fill="#f43f5e" fontSize={10} textAnchor="middle">↓ down</text>
          <text x={cx} y={groundY - hMax * scale - 10} fill="#f59e0b" fontSize={9} textAnchor="middle">h={hMax.toFixed(1)}m</text>

          {/* Symmetry brace */}
          <text x={cx - 30} y={groundY / 2 + 10} fill="#6366f1" fontSize={9} textAnchor="middle">t↑={tPeak.toFixed(2)}s</text>
          <text x={cx + 34} y={groundY / 2 + 10} fill="#818cf8" fontSize={9} textAnchor="middle">t↓={tPeak.toFixed(2)}s</text>
        </svg>

        <div style={{ padding: "10px 20px 10px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {facts.map(({ label, val, color, note }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 12px", borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color }}>{val}</span>
                {note && <span style={{ fontSize: 11, color: "#34d399", fontWeight: 700 }}>← {note}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "8px 20px 16px", fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
        At any height h below the maximum, the speed going up equals the speed coming down. Time up = time down. Acceleration is always −g — the same on the way up, at the peak, and on the way down.
      </div>
    </div>
  );
}
