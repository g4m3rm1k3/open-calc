// CircularMotionIntuition.jsx — Ch3 L16-21 Pillar 1
import { useState, useEffect, useRef } from "react";

const W = 460, H = 300, CX = 200, CY = 155, R_CIRCLE = 100;

export default function CircularMotionIntuition({ params = {} }) {
  const [speed, setSpeed] = useState(1.5);   // rad/s
  const [radius, setRadius] = useState(100); // px
  const [playing, setPlaying] = useState(true);
  const [angle, setAngle] = useState(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  useEffect(() => {
    if (!playing) { cancelAnimationFrame(rafRef.current); return; }
    function tick(ts) {
      if (!lastRef.current) lastRef.current = ts;
      const elapsed = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setAngle(a => (a + speed * elapsed) % (2 * Math.PI));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speed]);

  // Position on circle
  const px = CX + radius * Math.cos(angle);
  const py = CY - radius * Math.sin(angle);

  // Velocity vector: tangent to circle (perpendicular to radius), magnitude = speed*radius (pixels)
  const vScale = 40;
  const vx = -Math.sin(angle) * vScale;
  const vy = Math.cos(angle) * vScale;

  // Centripetal acceleration: toward centre
  const aScale = 30;
  const ax = (CX - px) / radius * aScale;
  const ay = (CY - py) / radius * aScale;

  // Numeric values (scale: 1 px = 0.01 m, radius in metres = radius*0.01)
  const rMetres = (radius * 0.01).toFixed(2);
  const vMetres = (speed * radius * 0.01).toFixed(3);
  const acMetres = (speed * speed * radius * 0.01).toFixed(3);
  const T = (2 * Math.PI / speed).toFixed(3);

  function Arrow({ x1, y1, dx, dy, color, label }) {
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 3) return null;
    const ux = dx / len, uy = dy / len, hl = 10;
    const ex = x1 + dx - ux * hl, ey = y1 + dy - uy * hl;
    return (
      <g>
        <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <polygon points={`${x1 + dx},${y1 + dy} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={color} />
        {label && <text x={x1 + dx + 6} y={y1 + dy} fill={color} fontSize={11} fontWeight="700">{label}</text>}
      </g>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · CIRCULAR MOTION</span>
        <button onClick={() => setPlaying(p => !p)} style={{
          background: playing ? "#818cf8" : "#1e293b",
          color: playing ? "#0f172a" : "#64748b",
          border: `1px solid ${playing ? "#818cf8" : "#334155"}`,
          borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer"
        }}>{playing ? "⏸ Pause" : "▶ Play"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "8px 20px 0" }}>
        {[
          { label: "Angular speed ω (rad/s)", val: speed, set: setSpeed, min: 0.3, max: 4, step: 0.1, color: "#f59e0b" },
          { label: "Radius r (px→m scale)", val: radius, set: setRadius, min: 40, max: 120, step: 5, color: "#818cf8" },
        ].map(({ label, val, set, min, max, step, color }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 2 }}>
              <span>{label}</span><span style={{ color, fontWeight: 700 }}>{val.toFixed(1)}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 4 }}>
        {/* Circle path */}
        <circle cx={CX} cy={CY} r={radius} fill="none" stroke="#1e293b" strokeWidth={1.5} strokeDasharray="6 4" />

        {/* Centre */}
        <circle cx={CX} cy={CY} r={4} fill="#475569" />
        <text x={CX + 6} y={CY + 4} fill="#475569" fontSize={9}>centre</text>

        {/* Radius line */}
        <line x1={CX} y1={CY} x2={px} y2={py} stroke="#475569" strokeWidth={1} />
        <text x={(CX + px) / 2 + 6} y={(CY + py) / 2 - 4} fill="#475569" fontSize={9}>r</text>

        {/* Velocity vector (tangent, green) */}
        <Arrow x1={px} y1={py} dx={vx} dy={-vy} color="#10b981" label="v⃗" />

        {/* Centripetal acceleration (toward centre, red) */}
        <Arrow x1={px} y1={py} dx={ax} dy={ay} color="#f43f5e" label="ac⃗" />

        {/* Ball */}
        <circle cx={px} cy={py} r={9} fill="#818cf8" stroke="#e0e7ff" strokeWidth={1.5} />

        {/* Legend */}
        <circle cx={W - 100} cy={40} r={5} fill="#10b981" />
        <text x={W - 90} y={44} fill="#10b981" fontSize={10}>v⃗ (tangential)</text>
        <circle cx={W - 100} cy={58} r={5} fill="#f43f5e" />
        <text x={W - 90} y={62} fill="#f43f5e" fontSize={10}>ac⃗ (centripetal)</text>

        {/* Angle arc */}
        <path d={`M ${CX + 25} ${CY} A 25 25 0 0 0 ${CX + 25 * Math.cos(-angle)} ${CY + 25 * Math.sin(-angle)}`}
          fill="none" stroke="#f59e0b" strokeWidth={1} />
        <text x={CX + 32} y={CY - 12} fill="#f59e0b" fontSize={9}>{(angle * 180 / Math.PI % 360).toFixed(0)}°</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "0 20px 20px" }}>
        {[
          { label: "ω (rad/s)", val: speed.toFixed(2), color: "#f59e0b" },
          { label: "v = ωr (m/s)", val: vMetres, color: "#10b981" },
          { label: "ac = v²/r (m/s²)", val: acMetres, color: "#f43f5e" },
          { label: "T = 2π/ω (s)", val: T, color: "#818cf8" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
        The velocity is always tangent to the circle (green). The centripetal acceleration always points toward the centre (red). Speed is constant — only direction changes, yet there is real acceleration.
      </div>
    </div>
  );
}
