import { useState } from "react";

const W = 420, H = 300, SC = 42, CX = 160, CY = 180;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }

function Arrow({ from, to, color, w = 2.8, dashed = false, label, lox = 10, loy = -10, opacity = 1 }) {
  const [fx, fy] = ts(from[0], from[1]), [tx, ty] = ts(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy);
  if (len < 3) return null;
  const ux = dx / len, uy = dy / len, hl = 11;
  const ex = tx - ux * hl, ey = ty - uy * hl;
  return (
    <g opacity={opacity} style={{ transition: "opacity 0.4s" }}>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeDasharray={dashed ? "5 3" : "none"} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={color} />
      {label && <text x={tx + lox} y={ty + loy} fill={color} fontSize={12} fontWeight="800">{label}</text>}
    </g>
  );
}

export default function SubtractionDeltaV({ params = {} }) {
  const [magI, setMagI] = useState(3.0);
  const [angI, setAngI] = useState(0);
  const [magF, setMagF] = useState(3.0);
  const [angF, setAngF] = useState(90);

  const toRad = d => d * Math.PI / 180;
  const vi = [magI * Math.cos(toRad(angI)), magI * Math.sin(toRad(angI))];
  const vf = [magF * Math.cos(toRad(angF)), magF * Math.sin(toRad(angF))];
  const dv = [vf[0] - vi[0], vf[1] - vi[1]];
  const magDV = Math.sqrt(dv[0] ** 2 + dv[1] ** 2);
  const thetaDV = Math.atan2(dv[1], dv[0]) * 180 / Math.PI;

  // Speed change (scalar) vs velocity change (vector magnitude)
  const speedChange = Math.abs(magF - magI);

  const [ox, oy] = ts(0, 0);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · Δv⃗ = v⃗_f − v⃗_i</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {[-3, -2, -1, 0, 1, 2, 3].map(i => {
            const [x1, y1] = ts(i, -3), [x2, y2] = ts(i, 3);
            const [x3, y3] = ts(-3, i), [x4, y4] = ts(3, i);
            return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5} /><line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5} /></g>;
          })}
          <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1} />
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1} />

          {/* v_i and v_f from origin (tail-to-tail) */}
          <Arrow from={[0, 0]} to={vi} color="#6366f1" label="v⃗ᵢ" lox={8} loy={-10} />
          <Arrow from={[0, 0]} to={vf} color="#f59e0b" label="v⃗_f" lox={8} loy={-10} />

          {/* Δv⃗ from tip of v_i to tip of v_f */}
          <Arrow from={vi} to={vf} color="#f43f5e" w={3} label="Δv⃗" lox={10} loy={-8} />

          {/* Dashed Δv⃗ from origin too */}
          <Arrow from={[0, 0]} to={dv} color="#f43f5e" dashed opacity={0.4} />

          <circle cx={CX} cy={CY} r={3} fill="#475569" />
          <text x={CX + 4} y={CY - 6} fill="#475569" fontSize={9}>origin</text>
        </svg>

        <div style={{ padding: "14px 14px 14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "|v⃗ᵢ|", val: magI, set: setMagI, min: 0.5, max: 4, step: 0.1, color: "#6366f1" },
            { label: "θᵢ (°)", val: angI, set: setAngI, min: -180, max: 180, step: 5, color: "#6366f1" },
            { label: "|v⃗_f|", val: magF, set: setMagF, min: 0.5, max: 4, step: 0.1, color: "#f59e0b" },
            { label: "θ_f (°)", val: angF, set: setAngF, min: -180, max: 180, step: 5, color: "#f59e0b" },
          ].map(({ label, val, set, min, max, step, color }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
                <span>{label}</span><span style={{ color, fontWeight: 700 }}>{val.toFixed(1)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} style={{ width: "100%" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Key comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
        <div style={{ background: "#2a0d0d", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #f43f5e" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>|Δv⃗| — velocity change</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f87171" }}>{magDV.toFixed(3)} m/s</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>at {thetaDV.toFixed(1)}°</div>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #475569" }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>||v_f|−|v_i|| — speed change</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#64748b" }}>{speedChange.toFixed(3)} m/s</div>
          <div style={{ fontSize: 11, color: "#475569" }}>scalar — usually ≠ |Δv⃗|</div>
        </div>
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569" }}>
        Δv⃗ goes from the tip of v⃗ᵢ to the tip of v⃗_f (tail-to-tail shortcut). These numbers are almost always different.
      </div>
    </div>
  );
}
