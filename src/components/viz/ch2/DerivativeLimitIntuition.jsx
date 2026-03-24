// DerivativeLimitIntuition.jsx — Ch2 L7 Pillar 1
import { useState } from "react";

const W = 460, H = 280, PL = 48, PB = 36, PT = 16, PR = 16;
const GW = W - PL - PR, GH = H - PT - PB;
const T_MAX = 6;

// x(t) = t^2 - 2t + 4  →  v(t) = 2t - 2
function xFn(t) { return t * t - 2 * t + 4; }
function vFn(t) { return 2 * t - 2; }

function toSVG(t, x, xMin, xMax) {
  return [
    PL + (t / T_MAX) * GW,
    PT + GH - ((x - xMin) / (xMax - xMin)) * GH
  ];
}

export default function DerivativeLimitIntuition({ params = {} }) {
  const [t0, setT0] = useState(2.5);
  const [dt, setDt] = useState(1.5);

  const xMin = 2, xMax = 12;
  const t1 = t0 + dt;
  const x0 = xFn(t0), x1 = xFn(Math.min(t1, T_MAX));
  const secantSlope = dt > 0.001 ? (x1 - x0) / dt : vFn(t0);
  const tangentSlope = vFn(t0);
  const error = Math.abs(secantSlope - tangentSlope).toFixed(4);

  const [p0x, p0y] = toSVG(t0, x0, xMin, xMax);
  const [p1x, p1y] = toSVG(Math.min(t1, T_MAX), x1, xMin, xMax);

  const curvePts = Array.from({ length: 61 }, (_, i) => {
    const t = (i / 60) * T_MAX;
    return toSVG(t, xFn(t), xMin, xMax);
  });
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  // Secant line extended
  const secSpan = 1.2;
  const [sx0, sy0] = toSVG(t0 - secSpan, x0 - secSpan * secantSlope, xMin, xMax);
  const [sx1, sy1] = toSVG(t0 + secSpan + dt, x0 + (secSpan + dt) * secantSlope, xMin, xMax);

  // Tangent line
  const tanSpan = 1.0;
  const [tx0, ty0] = toSVG(t0 - tanSpan, x0 - tanSpan * tangentSlope, xMin, xMax);
  const [tx1, ty1] = toSVG(t0 + tanSpan, x0 + tanSpan * tangentSlope, xMin, xMax);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · SECANT → TANGENT</span>
        <span style={{
          background: dt < 0.3 ? "#0d2a1e" : "#1e293b",
          color: dt < 0.3 ? "#34d399" : "#64748b",
          borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700,
          transition: "all 0.3s"
        }}>
          {dt < 0.3 ? "≈ instantaneous" : `Δt = ${dt.toFixed(2)}`}
        </span>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {[0, 1, 2, 3, 4, 5, 6].map(t => {
          const [tx] = toSVG(t, 0, xMin, xMax);
          return <line key={t} x1={tx} y1={PT} x2={tx} y2={PT + GH} stroke="#141e30" strokeWidth={0.5} />;
        })}
        {[2, 4, 6, 8, 10, 12].map(x => {
          const [, ty] = toSVG(0, x, xMin, xMax);
          return <line key={x} x1={PL} y1={ty} x2={PL + GW} y2={ty} stroke="#141e30" strokeWidth={0.5} />;
        })}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        {[0, 2, 4, 6].map(t => { const [tx] = toSVG(t, 0, xMin, xMax); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={9} textAnchor="middle">{t}s</text>; })}
        <text x={12} y={PT + GH / 2} fill="#475569" fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${PT + GH / 2})`}>x (m)</text>
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">time (s)</text>

        {/* x(t) curve */}
        <path d={curveD} fill="none" stroke="#334155" strokeWidth={2} />

        {/* Secant */}
        <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke="#f59e0b" strokeWidth={2}
          opacity={dt < 0.1 ? 0.1 : 1} style={{ transition: "opacity 0.3s" }} />

        {/* Tangent */}
        <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke="#10b981" strokeWidth={2.5}
          opacity={dt < 0.3 ? 1 : 0.35} style={{ transition: "opacity 0.3s" }} />

        {/* Points */}
        <circle cx={p0x} cy={p0y} r={5} fill="#6366f1" />
        <circle cx={p1x} cy={p1y} r={4} fill="#f59e0b"
          opacity={dt < 0.05 ? 0 : 1} style={{ transition: "opacity 0.3s, cx 0.1s, cy 0.1s" }} />

        {/* Δt bracket */}
        {dt > 0.15 && (
          <>
            <line x1={p0x} y1={PT + GH + 6} x2={p1x} y2={PT + GH + 6} stroke="#f59e0b" strokeWidth={1} />
            <text x={(p0x + p1x) / 2} y={PT + GH + 22} fill="#f59e0b" fontSize={9} textAnchor="middle">Δt</text>
          </>
        )}

        {/* Labels */}
        <text x={W - PR - 4} y={PT + 16} fill="#f59e0b" fontSize={10} textAnchor="end">
          secant slope = {secantSlope.toFixed(3)} m/s
        </text>
        <text x={W - PR - 4} y={PT + 30} fill="#10b981" fontSize={10} textAnchor="end">
          tangent slope = {tangentSlope.toFixed(3)} m/s
        </text>
        <text x={W - PR - 4} y={PT + 44} fill="#64748b" fontSize={9} textAnchor="end">
          error = {error}
        </text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px" }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
            <span>Point t₀</span><span style={{ color: "#6366f1", fontWeight: 700 }}>{t0.toFixed(1)} s</span>
          </div>
          <input type="range" min={0.5} max={5} step={0.1} value={t0}
            onChange={e => setT0(parseFloat(e.target.value))} style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 3 }}>
            <span>Δt (shrink toward 0)</span><span style={{ color: "#f59e0b", fontWeight: 700 }}>{dt.toFixed(2)} s</span>
          </div>
          <input type="range" min={0.01} max={2.5} step={0.01} value={dt}
            onChange={e => setDt(parseFloat(e.target.value))} style={{ width: "100%" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 20px 20px" }}>
        {[
          { label: "Secant slope (v̄)", val: secantSlope.toFixed(4) + " m/s", color: "#f59e0b" },
          { label: "Tangent slope (v)", val: tangentSlope.toFixed(4) + " m/s", color: "#10b981" },
          { label: "Error → 0 as Δt → 0", val: error, color: parseFloat(error) < 0.01 ? "#34d399" : "#64748b" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569" }}>
        Shrink Δt toward zero — watch the secant (orange) rotate into the tangent (green). The limit of the secant slope IS the instantaneous velocity.
      </div>
    </div>
  );
}
