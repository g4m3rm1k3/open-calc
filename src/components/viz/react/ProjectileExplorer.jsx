// ProjectileExplorer.jsx — Ch3 Pillar 4 (shared across projectile lessons)
import { useState } from "react";
const G = 9.8;

const PROBLEMS = [
  {
    label: "Horizontal launch",
    desc: "Object launched horizontally at v₀ from height h₀",
    inputs: ["v₀ (m/s)", "h₀ (m)"],
    defaults: [15, 45],
    solve: ([v0, h0]) => {
      const t = Math.sqrt(2 * h0 / G);
      const R = v0 * t;
      const vfy = G * t;
      const vf = Math.sqrt(v0 * v0 + vfy * vfy);
      return [
        { label: "Fall time t", val: t.toFixed(4) + " s", eq: "t = √(2h₀/g)" },
        { label: "Range R", val: R.toFixed(3) + " m", eq: "R = v₀·t" },
        { label: "v_y at landing", val: vfy.toFixed(3) + " m/s", eq: "vy = g·t" },
        { label: "|v_final|", val: vf.toFixed(3) + " m/s", eq: "vf = √(v₀²+vy²)" },
      ];
    }
  },
  {
    label: "Level ground launch",
    desc: "Launched at angle θ, lands at same height",
    inputs: ["v₀ (m/s)", "θ (°)"],
    defaults: [25, 40],
    solve: ([v0, theta]) => {
      const th = theta * Math.PI / 180;
      const vx = v0 * Math.cos(th), vy0 = v0 * Math.sin(th);
      const tFlight = 2 * vy0 / G;
      const R = vx * tFlight;
      const H = vy0 * vy0 / (2 * G);
      return [
        { label: "vx", val: vx.toFixed(3) + " m/s", eq: "vx = v₀cosθ" },
        { label: "vy₀", val: vy0.toFixed(3) + " m/s", eq: "vy₀ = v₀sinθ" },
        { label: "t_flight", val: tFlight.toFixed(4) + " s", eq: "t = 2vy₀/g" },
        { label: "Range R", val: R.toFixed(3) + " m", eq: "R = v₀²sin2θ/g" },
        { label: "Max height H", val: H.toFixed(3) + " m", eq: "H = vy₀²/(2g)" },
      ];
    }
  },
  {
    label: "Elevated launch",
    desc: "Launched at angle θ from height h₀ above ground",
    inputs: ["v₀ (m/s)", "θ (°)", "h₀ (m)"],
    defaults: [20, 30, 60],
    solve: ([v0, theta, h0]) => {
      const th = theta * Math.PI / 180;
      const vx = v0 * Math.cos(th), vy0 = v0 * Math.sin(th);
      // y(t) = h0 + vy0*t - 0.5*g*t^2 = 0  →  quadratic
      const a = -0.5 * G, b = vy0, c = h0;
      const disc = b * b - 4 * a * c;
      const t1 = (-b + Math.sqrt(disc)) / (2 * a);
      const t2 = (-b - Math.sqrt(disc)) / (2 * a);
      const t = Math.max(t1, t2);
      const R = vx * t;
      const H = h0 + vy0 * vy0 / (2 * G);
      return [
        { label: "vx", val: vx.toFixed(3) + " m/s", eq: "vx = v₀cosθ" },
        { label: "vy₀", val: vy0.toFixed(3) + " m/s", eq: "vy₀ = v₀sinθ" },
        { label: "Time of flight", val: t.toFixed(4) + " s", eq: "quadratic: y(t)=0" },
        { label: "Range R", val: R.toFixed(3) + " m", eq: "R = vx·t" },
        { label: "Max height", val: H.toFixed(3) + " m", eq: "H = h₀+vy₀²/(2g)" },
      ];
    }
  },
];

export default function ProjectileExplorer({ params = {} }) {
  const [pi, setPi] = useState(1);
  const P = PROBLEMS[pi];
  const [vals, setVals] = useState(P.defaults);

  function update(i, v) { setVals(prev => { const n = [...prev]; n[i] = v; return n; }); }

  let results = [];
  try { results = P.solve(vals); } catch {}

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · PROJECTILE SOLVER</span>
        <div style={{ display: "flex", gap: 6 }}>
          {PROBLEMS.map((p, i) => (
            <button key={i} onClick={() => { setPi(i); setVals(p.defaults); }} style={{
              background: pi === i ? "#6366f1" : "#1e293b", color: pi === i ? "#fff" : "#64748b",
              border: `1px solid ${pi === i ? "#6366f1" : "#334155"}`,
              borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer"
            }}>{p.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "8px 20px 4px", fontSize: 12, color: "#64748b" }}>{P.desc}</div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${P.inputs.length}, 1fr)`, gap: 12, padding: "8px 20px 14px" }}>
        {P.inputs.map((label, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
              <span>{label}</span><span style={{ color: "#818cf8", fontWeight: 700 }}>{vals[i]}</span>
            </div>
            <input type="range"
              min={label.includes("θ") ? 1 : label.includes("h") ? 0 : 2}
              max={label.includes("θ") ? 89 : label.includes("h") ? 200 : 60}
              step={1} value={vals[i]} onChange={e => update(i, parseFloat(e.target.value))} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0 20px 20px" }}>
        {results.map(({ label, val, eq }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, background: "#1e293b", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
              <div style={{ fontSize: 11, fontFamily: "'Fira Code',monospace", color: "#475569" }}>{eq}</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981", fontFamily: "'Fira Code',monospace" }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
