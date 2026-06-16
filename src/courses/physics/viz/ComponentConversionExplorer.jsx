import { useState, useCallback, useRef } from "react";

const W = 260, H = 200, SC = 40;
function ts(x, y, cx, cy) { return [cx + x * SC, cy - y * SC]; }

function MiniArrow({ Ax, Ay, cx, cy, color }) {
  const [ox, oy] = ts(0, 0, cx, cy);
  const [hx, hy] = ts(Ax, Ay, cx, cy);
  const dx = hx - ox, dy = hy - oy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len;
  const hl = 9;
  const ex = hx - ux * hl, ey = hy - uy * hl;
  return (
    <g>
      <line x1={ox} y1={oy} x2={ex} y2={ey} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <polygon points={`${hx},${hy} ${ex - uy * 4.5},${ey + ux * 4.5} ${ex + uy * 4.5},${ey - ux * 4.5}`} fill={color} />
    </g>
  );
}

function MiniCanvas({ Ax, Ay, cx = W / 2, cy = H / 2, showComponents = true }) {
  const [ox, oy] = ts(0, 0, cx, cy);
  const [px, py] = ts(Ax, 0, cx, cy);
  const [hx, hy] = ts(Ax, Ay, cx, cy);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {[-3, -2, -1, 0, 1, 2, 3].map(i => {
        const [x1, y1] = ts(i, -3, cx, cy), [x2, y2] = ts(i, 3, cx, cy);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#151f33" strokeWidth={0.5} />;
      })}
      {[-2, -1, 0, 1, 2].map(i => {
        const [x3, y3] = ts(-3, i, cx, cy), [x4, y4] = ts(3, i, cx, cy);
        return <line key={i} x1={x3} y1={y3} x2={x4} y2={y4} stroke="#151f33" strokeWidth={0.5} />;
      })}
      <line x1={0} y1={oy} x2={W} y2={oy} stroke="#334155" strokeWidth={1} />
      <line x1={cx} y1={0} x2={cx} y2={H} stroke="#334155" strokeWidth={1} />

      {showComponents && (
        <>
          <line x1={ox} y1={oy} x2={px} y2={oy} stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={px} y1={oy} x2={px} y2={hy} stroke="#10b981" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={hx} y1={hy} x2={px} y2={hy} stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" opacity={0.4} />
          <line x1={hx} y1={hy} x2={hx} y2={oy} stroke="#10b981" strokeWidth={1} strokeDasharray="3 2" opacity={0.4} />
        </>
      )}

      <MiniArrow Ax={Ax} Ay={Ay} cx={cx} cy={cy} color="#6366f1" />
    </svg>
  );
}

// Quadrant helper
function getQuadrant(Ax, Ay) {
  if (Ax > 0 && Ay > 0) return { label: "I", correction: "No correction needed. atan2 returns correct angle.", color: "#10b981" };
  if (Ax < 0 && Ay > 0) return { label: "II", correction: "Aₓ < 0, Aᵧ > 0 → add 180° to reference angle.", color: "#f59e0b" };
  if (Ax < 0 && Ay < 0) return { label: "III", correction: "Both negative → add 180° to reference angle.", color: "#f43f5e" };
  return { label: "IV", correction: "Aₓ > 0, Aᵧ < 0 → subtract from 360° (or use atan2).", color: "#0ea5e9" };
}

export default function ComponentConversionExplorer({ params = {} }) {
  // Panel A: mag + angle → components
  const [mag, setMag] = useState(3.0);
  const [angleDeg, setAngleDeg] = useState(35);

  // Panel B: components → mag + angle
  const [Ax, setAx] = useState(3);
  const [Ay, setAy] = useState(4);

  // Panel A outputs
  const aRad = angleDeg * Math.PI / 180;
  const aAx = mag * Math.cos(aRad);
  const aAy = mag * Math.sin(aRad);

  // Panel B outputs
  const bMag = Math.sqrt(Ax * Ax + Ay * Ay);
  const bAngle = Math.atan2(Ay, Ax) * 180 / Math.PI;
  const quad = getQuadrant(Ax, Ay);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>
          PILLAR 4 · FORWARD & INVERSE CONVERSION
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

        {/* ── Panel A: mag + angle → components ── */}
        <div style={{ padding: "16px 12px 16px 20px", borderRight: "1px solid #1e293b" }}>
          <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, marginBottom: 12 }}>
            FORWARD: magnitude + angle → components
          </div>

          <MiniCanvas Ax={aAx} Ay={aAy} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                <span>|A⃗|</span><span style={{ color: "#e2e8f0", fontWeight: 700 }}>{mag.toFixed(1)}</span>
              </div>
              <input type="range" min="0.5" max="4" step="0.1" value={mag}
                onChange={e => setMag(parseFloat(e.target.value))}
                style={{ width: "100%" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                <span>θ</span><span style={{ color: "#e2e8f0", fontWeight: 700 }}>{angleDeg}°</span>
              </div>
              <input type="range" min="-180" max="180" step="1" value={angleDeg}
                onChange={e => setAngleDeg(parseInt(e.target.value))}
                style={{ width: "100%" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {[
              { label: "Aₓ = |A⃗| cosθ", val: aAx.toFixed(3), color: "#f59e0b" },
              { label: "Aᵧ = |A⃗| sinθ", val: aAy.toFixed(3), color: "#10b981" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Panel B: components → mag + angle ── */}
        <div style={{ padding: "16px 20px 16px 12px" }}>
          <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>
            INVERSE: components → magnitude + angle
          </div>

          <MiniCanvas Ax={Ax} Ay={Ay} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                <span>Aₓ</span><span style={{ color: "#f59e0b", fontWeight: 700 }}>{Ax.toFixed(1)}</span>
              </div>
              <input type="range" min="-3.5" max="3.5" step="0.1" value={Ax}
                onChange={e => setAx(parseFloat(e.target.value))}
                style={{ width: "100%" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                <span>Aᵧ</span><span style={{ color: "#10b981", fontWeight: 700 }}>{Ay.toFixed(1)}</span>
              </div>
              <input type="range" min="-3.5" max="3.5" step="0.1" value={Ay}
                onChange={e => setAy(parseFloat(e.target.value))}
                style={{ width: "100%" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {[
              { label: "|A⃗| = √(Aₓ²+Aᵧ²)", val: bMag.toFixed(3), color: "#6366f1" },
              { label: "θ = atan2(Aᵧ,Aₓ)", val: bAngle.toFixed(1) + "°", color: "#818cf8" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Quadrant badge */}
          <div style={{
            marginTop: 8, padding: "8px 10px",
            background: "#0c1122", borderRadius: 8,
            borderLeft: `3px solid ${quad.color}`
          }}>
            <div style={{ fontSize: 11, color: quad.color, fontWeight: 700, marginBottom: 2 }}>
              Quadrant {quad.label}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{quad.correction}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
