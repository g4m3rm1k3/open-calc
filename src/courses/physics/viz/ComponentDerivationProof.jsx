import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "Start on the unit circle",
    algebra: "Let |A⃗| = 1 and angle = θ",
    insight: "Place a unit vector at angle θ. Its tip is somewhere on the unit circle. We want to know its x and y coordinates.",
    showCircle: true, showUnit: true, showFull: false, showComponents: false, showVerify: false,
  },
  {
    title: "Read off the coordinates",
    algebra: "Â = (cosθ, sinθ)  ← definition of sin and cos",
    insight: "This IS the definition of sine and cosine on the unit circle. cos gives the x-reach, sin gives the y-reach.",
    showCircle: true, showUnit: true, showFull: false, showComponents: true, showVerify: false,
  },
  {
    title: "Scale by the magnitude",
    algebra: "A⃗ = |A⃗| · Â = |A⃗|(cosθ, sinθ)",
    insight: "Any vector equals its magnitude times its unit vector. We just multiply the unit vector coordinates by |A⃗|.",
    showCircle: true, showUnit: true, showFull: true, showComponents: true, showVerify: false,
  },
  {
    title: "Extract the components",
    algebra: "Aₓ = |A⃗| cosθ    Aᵧ = |A⃗| sinθ",
    insight: "These are the component formulas — derived directly from the definition of sine and cosine. Not formulas to memorise, but conclusions that follow inevitably.",
    showCircle: true, showUnit: false, showFull: true, showComponents: true, showVerify: false,
  },
  {
    title: "Verify with Pythagoras",
    algebra: "Aₓ² + Aᵧ² = |A⃗|²cos²θ + |A⃗|²sin²θ = |A⃗|²(cos²θ+sin²θ) = |A⃗|²",
    insight: "The Pythagorean identity cos²θ + sin²θ = 1 closes the loop. This also proves |A⃗| = √(Aₓ²+Aᵧ²).",
    showCircle: true, showUnit: false, showFull: true, showComponents: true, showVerify: true,
  },
];

const W = 300, H = 240;
const CX = 120, CY = 130, SC = 55;
const THETA = 38; // degrees — fixed for proof display

function ts(x, y) { return [CX + x * SC, CY - y * SC]; }

export default function ComponentDerivationProof({ params = {} }) {
  const currentStep = params.currentStep ?? 0;
  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];

  const theta = THETA * Math.PI / 180;
  const mag = 2.1;
  const cosT = Math.cos(theta), sinT = Math.sin(theta);
  const unitX = cosT, unitY = sinT;
  const fullX = mag * cosT, fullY = mag * sinT;

  const [ox, oy] = ts(0, 0);
  const [ux, uy] = ts(unitX, unitY);
  const [fx, fy] = ts(fullX, fullY);
  const [px, py] = ts(fullX, 0);

  // Unit circle radius in screen units
  const circleR = SC;

  // Arc for theta
  const arcR = 26;
  const arcX = CX + arcR * Math.cos(-theta), arcY = CY + arcR * Math.sin(-theta);

  function Arrow({ x1, y1, x2, y2, color, w = 2.5, dashed = false, opacity = 1 }) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return null;
    const ux2 = dx / len, uy2 = dy / len;
    const hl = 10;
    const ex = x2 - ux2 * hl, ey = y2 - uy2 * hl;
    return (
      <g opacity={opacity} style={{ transition: "opacity 0.5s" }}>
        <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={w}
          strokeDasharray={dashed ? "4 3" : "none"} strokeLinecap="round" />
        <polygon points={`${x2},${y2} ${ex - uy2 * 5},${ey + ux2 * 5} ${ex + uy2 * 5},${ey - ux2 * 5}`} fill={color} />
      </g>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      {/* Step header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#10b981", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
          STEP {Math.min(currentStep, STEPS.length - 1) + 1} / {STEPS.length}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{step.title}</span>
      </div>

      {/* Algebra */}
      <div style={{
        margin: "10px 20px", padding: "11px 16px",
        background: "#1e293b", borderRadius: 10,
        fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#6ee7b7",
        borderLeft: "3px solid #10b981"
      }}>{step.algebra}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {/* Diagram */}
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {/* Axes */}
          <line x1={0} y1={CY} x2={W} y2={CY} stroke="#334155" strokeWidth={1} />
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#334155" strokeWidth={1} />

          {/* Unit circle */}
          {step.showCircle && (
            <circle cx={CX} cy={CY} r={circleR}
              fill="none" stroke="#1e3a5f" strokeWidth={1.5} strokeDasharray="5 3" />
          )}

          {/* Full vector (ghost when unit also shown) */}
          {step.showFull && (
            <Arrow x1={CX} y1={CY} x2={fx} y2={fy}
              color="#6366f1" w={3}
              dashed={step.showUnit} opacity={step.showUnit ? 0.5 : 1} />
          )}

          {/* Unit vector */}
          {step.showUnit && (
            <Arrow x1={CX} y1={CY} x2={ux} y2={uy} color="#f59e0b" w={2.5} />
          )}

          {/* Component lines */}
          {step.showComponents && (
            <g>
              <line x1={CX} y1={CY} x2={px} y2={CY} stroke="#f43f5e" strokeWidth={2.5} strokeLinecap="round" />
              <line x1={px} y1={CY} x2={px} y2={fy} stroke="#0ea5e9" strokeWidth={2.5} strokeLinecap="round" />
              <path d={`M ${px - 6} ${CY} L ${px - 6} ${CY + 6} L ${px} ${CY + 6}`}
                fill="none" stroke="#475569" strokeWidth={1} />
            </g>
          )}

          {/* Theta arc */}
          <path d={`M ${CX + arcR} ${CY} A ${arcR} ${arcR} 0 0 0 ${arcX} ${arcY}`}
            fill="none" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={CX + 36} y={CY - 18} fill="#818cf8" fontSize={10}>θ</text>

          {/* Labels */}
          {step.showComponents && (
            <>
              <text x={(CX + px) / 2} y={CY + 16} fill="#f43f5e" fontSize={10} textAnchor="middle">cosθ</text>
              <text x={px + 8} y={(CY + fy) / 2 + 4} fill="#0ea5e9" fontSize={10}>sinθ</text>
            </>
          )}

          {/* Verify checkmark */}
          {step.showVerify && (
            <text x={CX + 60} y={30} fill="#10b981" fontSize={13} fontWeight="700">
              ✓ cos²θ+sin²θ=1
            </text>
          )}

          {step.showUnit && (
            <text x={ux + 8} y={uy - 6} fill="#f59e0b" fontSize={11} fontWeight="700">Â</text>
          )}
          {step.showFull && (
            <text x={fx + 8} y={fy - 6} fill="#6366f1" fontSize={11} fontWeight="700">A⃗</text>
          )}
        </svg>

        {/* Key formula panel */}
        <div style={{ padding: "16px 16px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { show: step.showUnit, label: "Unit vector", formula: "Â = (cosθ, sinθ)", color: "#f59e0b" },
            { show: step.showFull, label: "x-component", formula: `Aₓ = |A⃗| cosθ`, color: "#f43f5e" },
            { show: step.showFull, label: "y-component", formula: `Aᵧ = |A⃗| sinθ`, color: "#0ea5e9" },
            { show: step.showVerify, label: "Inverse formula", formula: "|A⃗| = √(Aₓ²+Aᵧ²)", color: "#10b981" },
          ].map(({ show, label, formula, color }) => (
            <div key={label} style={{
              background: "#1e293b", borderRadius: 8, padding: "10px 12px",
              opacity: show ? 1 : 0.2,
              transition: "opacity 0.5s",
              borderLeft: `3px solid ${color}`
            }}>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color }}>{formula}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight */}
      <div style={{
        margin: "0 20px 20px", padding: "11px 15px",
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
