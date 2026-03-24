// KinematicsDerivativeProof.jsx — Ch2 L1 & L7 Pillar 2
import { useState } from "react";

const STEPS = [
  { title: "Average velocity over Δt", eq: "v̄ = Δx/Δt = [x(t+Δt) − x(t)] / Δt", dt: 2.5, insight: "The average velocity is the slope of the secant line connecting two points on the x–t graph." },
  { title: "Shrink the interval", eq: "Δt → smaller…  secant → tangent", dt: 1.2, insight: "As Δt shrinks, the second point slides toward the first. The secant rotates toward the tangent." },
  { title: "Even smaller", eq: "Δt → even smaller", dt: 0.4, insight: "The secant is nearly indistinguishable from the tangent. The slope is converging to a fixed value." },
  { title: "The limit", eq: "v(t) = lim(Δt→0) Δx/Δt = dx/dt", dt: 0.05, insight: "In the limit, the secant becomes the tangent. The slope of the tangent at time t is the instantaneous velocity." },
  { title: "Apply again for acceleration", eq: "a(t) = dv/dt = d²x/dt²", dt: 0.05, insight: "Apply the same limit to velocity. Acceleration is the derivative of velocity — the second derivative of position." },
];

const W = 340, H = 220, PL = 40, PB = 30, PT = 16, PR = 16;
const GW = W - PL - PR, GH = H - PT - PB;
const T_RANGE = 6, X_RANGE = 15;
// x(t) = t² − 2t + 3
function xFn(t) { return t * t - 2 * t + 3; }
function vFn(t) { return 2 * t - 2; }
function toSVG(t, x) {
  return [PL + (t / T_RANGE) * GW, PT + GH - ((x / X_RANGE)) * GH];
}

export default function KinematicsDerivativeProof({ params = {} }) {
  const si = Math.min(params.currentStep ?? 0, STEPS.length - 1);
  const step = STEPS[si];
  const T0 = 2.5;
  const dt = step.dt;
  const T1 = T0 + dt;
  const x0 = xFn(T0), x1 = xFn(T1);
  const secantSlope = (x1 - x0) / dt;
  const tangentSlope = vFn(T0);

  // Build curve path
  const curvePts = Array.from({ length: 61 }, (_, i) => {
    const t = (i / 60) * T_RANGE;
    return toSVG(t, xFn(t));
  });
  const curveD = curvePts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  // Secant line extended slightly
  const [sx0, sy0] = toSVG(T0 - 0.3, x0 - 0.3 * secantSlope);
  const [sx1, sy1] = toSVG(T1 + 0.3, x1 + 0.3 * secantSlope);

  // Tangent at T0
  const tangentSpan = 1.2;
  const [tx0, ty0] = toSVG(T0 - tangentSpan, x0 - tangentSpan * tangentSlope);
  const [tx1, ty1] = toSVG(T0 + tangentSpan, x0 + tangentSpan * tangentSlope);

  // Points
  const [p0x, p0y] = toSVG(T0, x0);
  const [p1x, p1y] = toSVG(T1, x1);
  const [, oy] = toSVG(0, 0);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#6366f1", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>STEP {si + 1}/{STEPS.length}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{step.title}</span>
      </div>
      <div style={{ margin: "10px 20px", padding: "10px 14px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code',monospace", fontSize: 12, color: "#a5b4fc", borderLeft: "3px solid #6366f1" }}>
        {step.eq}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        <line x1={PL} y1={PT + GH} x2={PL + GW} y2={PT + GH} stroke="#334155" strokeWidth={1} />
        {[1, 2, 3, 4, 5].map(t => { const [tx] = toSVG(t, 0); return <text key={t} x={tx} y={PT + GH + 14} fill="#475569" fontSize={9} textAnchor="middle">{t}s</text>; })}
        <text x={PL + GW / 2} y={H - 4} fill="#475569" fontSize={9} textAnchor="middle">t</text>
        <text x={PL - 6} y={PT} fill="#475569" fontSize={9} textAnchor="end">x</text>

        {/* Curve */}
        <path d={curveD} fill="none" stroke="#334155" strokeWidth={1.5} />

        {/* Tangent (full opacity at final steps) */}
        <line x1={tx0} y1={ty0} x2={tx1} y2={ty1} stroke="#10b981" strokeWidth={2}
          opacity={si >= 3 ? 1 : 0.3} style={{ transition: "opacity 0.4s" }} />

        {/* Secant */}
        {si < 4 && <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke="#f59e0b" strokeWidth={2} />}

        {/* Points */}
        <circle cx={p0x} cy={p0y} r={5} fill="#6366f1" />
        {si < 4 && <circle cx={p1x} cy={p1y} r={4} fill="#f59e0b" style={{ transition: "all 0.5s" }} />}

        {/* Slope labels */}
        <text x={W - PR - 4} y={PT + 20} fill="#f59e0b" fontSize={10} textAnchor="end">secant slope ≈ {secantSlope.toFixed(2)}</text>
        <text x={W - PR - 4} y={PT + 34} fill="#10b981" fontSize={10} textAnchor="end">tangent slope = {tangentSlope.toFixed(2)}</text>

        {/* Δt bracket */}
        {si < 4 && (
          <>
            <text x={(p0x + p1x) / 2} y={PT + GH + 26} fill="#f59e0b" fontSize={9} textAnchor="middle">Δt={dt.toFixed(2)}s</text>
          </>
        )}
      </svg>

      <div style={{ margin: "0 20px 20px", padding: "10px 14px", background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>{step.insight}
      </div>
    </div>
  );
}
