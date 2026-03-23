import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "Start with vector A⃗",
    algebra: "A⃗ = Aₓ î + Aᵧ ĵ",
    scale: 1.0,
    insight: "We have a vector with magnitude |A⃗| and some direction. We want to isolate that direction as a pure unit vector.",
    showScale: false,
  },
  {
    title: "Define the unit vector",
    algebra: "Â = A⃗ / |A⃗|",
    scale: 1.0,
    insight: "Dividing a vector by its own magnitude shrinks it to length 1 without changing its direction. This is the definition.",
    showScale: false,
  },
  {
    title: "Compute the magnitude",
    algebra: "|A⃗| = √(Aₓ² + Aᵧ²)",
    scale: 1.0,
    insight: "Use the Pythagorean theorem on the components. This is the length of the hypotenuse of the right triangle hidden inside every vector.",
    showScale: false,
  },
  {
    title: "Divide — watch the arrow shrink",
    algebra: "Â = (Aₓ/|A⃗|) î + (Aᵧ/|A⃗|) ĵ",
    scale: 0.5,
    insight: "Every component is divided by the same factor. The direction is preserved — only the length changes.",
    showScale: true,
  },
  {
    title: "Verify: |Â| = 1",
    algebra: "|Â|² = (Aₓ/|A⃗|)² + (Aᵧ/|A⃗|)² = (Aₓ²+Aᵧ²)/|A⃗|² = 1",
    scale: 0.5,
    insight: "The Pythagorean identity confirms the magnitude is exactly 1. Dividing by the magnitude always works.",
    showScale: true,
    showVerify: true,
  },
];

const W = 320, H = 220, CX = 110, CY = 140, SC = 42;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }

function ScaledArrow({ vec, scale, color, label, showBoth = false }) {
  const [Ax, Ay] = vec;
  const sx = Ax * scale, sy = Ay * scale;
  const [ox, oy] = ts(0, 0);
  const [hx, hy] = ts(sx, sy);
  const [ohx, ohy] = ts(Ax, Ay);

  function makeArrow(tx, ty, col, dashed = false, label2 = null) {
    const dx = tx - CX, dy = ty - CY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return null;
    const ux = dx / len, uy = dy / len;
    const hl = 10;
    const ex = tx - ux * hl, ey = ty - uy * hl;
    return (
      <g>
        <line x1={CX} y1={CY} x2={ex} y2={ey}
          stroke={col} strokeWidth={2.5}
          strokeDasharray={dashed ? "5 3" : "none"} strokeLinecap="round" />
        <polygon points={`${tx},${ty} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={col} />
        {label2 && <text x={tx + 8} y={ty - 6} fill={col} fontSize={12} fontWeight="700">{label2}</text>}
      </g>
    );
  }

  return (
    <g style={{ transition: "all 0.6s ease" }}>
      {showBoth && makeArrow(ohx, ohy, "#475569", true)}
      {makeArrow(hx, hy, color, false, label)}
      {/* Magnitude bar on side */}
      <line x1={16} y1={CY} x2={16} y2={hy} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <line x1={10} y1={CY} x2={22} y2={CY} stroke={color} strokeWidth={1.5} />
      <line x1={10} y1={hy} x2={22} y2={hy} stroke={color} strokeWidth={1.5} />
    </g>
  );
}

export default function BasisVectorProof({ params = {} }) {
  const currentStep = params.currentStep ?? 0;
  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];

  // Animate scale smoothly
  const [displayScale, setDisplayScale] = useState(1);
  useEffect(() => {
    setDisplayScale(step.scale);
  }, [step.scale]);

  const vec = [3, 2];
  const [Ax, Ay] = vec;
  const mag = Math.sqrt(Ax * Ax + Ay * Ay);
  const [ox, oy] = ts(0, 0);

  const scaledMag = (mag * displayScale).toFixed(2);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      {/* Step badge */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#f59e0b", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
          STEP {Math.min(currentStep, STEPS.length - 1) + 1} / {STEPS.length}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{step.title}</span>
      </div>

      {/* Algebra */}
      <div style={{
        margin: "12px 20px", padding: "12px 18px",
        background: "#1e293b", borderRadius: 10,
        fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#fcd34d",
        borderLeft: "3px solid #f59e0b", letterSpacing: "0.02em"
      }}>{step.algebra}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {/* Diagram */}
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {/* Grid */}
          {[-1, 0, 1, 2, 3].map(i => {
            const [x1, y1] = ts(i, -2), [x2, y2] = ts(i, 2.5);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a2540" strokeWidth={0.5} />;
          })}
          {[-1, 0, 1, 2].map(i => {
            const [x3, y3] = ts(-1, i), [x4, y4] = ts(4, i);
            return <line key={i} x1={x3} y1={y3} x2={x4} y2={y4} stroke="#1a2540" strokeWidth={0.5} />;
          })}
          <line x1={0} y1={oy} x2={W} y2={oy} stroke="#334155" strokeWidth={1} />
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#334155" strokeWidth={1} />

          <ScaledArrow
            vec={vec}
            scale={displayScale}
            color={step.showVerify ? "#10b981" : "#f59e0b"}
            label={displayScale < 0.6 ? "Â" : "A⃗"}
            showBoth={step.showScale}
          />

          {/* Magnitude readout */}
          <text x={28} y={(CY + ts(0, vec[1] * displayScale)[1]) / 2 + 4}
            fill="#64748b" fontSize={10} textAnchor="middle">|Â|={scaledMag}</text>
        </svg>

        {/* Right panel — magnitude bar and verify */}
        <div style={{ padding: "16px 16px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Magnitude visual bar */}
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Magnitude</div>
            <div style={{ background: "#0f172a", borderRadius: 6, height: 20, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(displayScale * 100, 100)}%`,
                background: step.showVerify ? "#10b981" : "#f59e0b",
                transition: "width 0.6s ease, background 0.4s",
                borderRadius: 6
              }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: step.showVerify ? "#10b981" : "#fcd34d", marginTop: 6 }}>
              {scaledMag}
              {step.showVerify && <span style={{ fontSize: 12, color: "#10b981", marginLeft: 6 }}>= 1 ✓</span>}
            </div>
          </div>

          {step.showScale && (
            <div style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Scale factor</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8" }}>
                1 / |A⃗| = 1 / {mag.toFixed(2)} ≈ {(1 / mag).toFixed(3)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insight */}
      <div style={{
        margin: "0 20px 20px", padding: "12px 16px",
        background: "#0c1a2e", borderRadius: 10,
        borderLeft: "3px solid #0ea5e9",
        fontSize: 13, color: "#94a3b8", lineHeight: 1.6
      }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>
        {step.insight}
      </div>
    </div>
  );
}
