import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    title: "Define both vectors",
    algebra: "A⃗ = (Aₓ, Aᵧ),   B⃗ = (Bₓ, Bᵧ)",
    highlight: "none",
    insight: "Write each vector as an ordered pair of components. Position on the page is irrelevant.",
  },
  {
    title: "Assert equality",
    algebra: "A⃗ = B⃗",
    highlight: "both",
    insight: "We want to know what 'equal' actually means. Start by assuming it and unpacking the consequences.",
  },
  {
    title: "Expand in basis vectors",
    algebra: "Aₓ î + Aᵧ ĵ  =  Bₓ î + Bᵧ ĵ",
    highlight: "both",
    insight: "Replace each vector with its unit-vector expansion. î and ĵ are the x- and y-direction rulers.",
  },
  {
    title: "Collect to zero",
    algebra: "(Aₓ − Bₓ) î + (Aᵧ − Bᵧ) ĵ  =  0⃗",
    highlight: "diff",
    insight: "Subtract the right side. If the sum equals the zero vector, each coefficient must be zero — because î and ĵ point in independent directions.",
  },
  {
    title: "Linear independence forces zeroes",
    algebra: "Aₓ − Bₓ = 0   and   Aᵧ − Bᵧ = 0",
    highlight: "components",
    insight: "î and ĵ are linearly independent: no amount of î can look like ĵ. So both coefficients must vanish independently.",
  },
  {
    title: "Conclusion",
    algebra: "∴  Aₓ = Bₓ   and   Aᵧ = Bᵧ",
    highlight: "equal",
    insight: "Two vectors are equal if and only if every component matches — regardless of where the arrows are drawn.",
  },
];

const W = 440, H = 260, CX = 160, CY = 140;
function ts(x, y) { return [CX + x * 52, CY - y * 52]; }

function ProofArrow({ from, to, color, label, dashed = false, opacity = 1 }) {
  const [fx, fy] = ts(from[0], from[1]);
  const [tx, ty] = ts(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len;
  const hl = 11;
  const hx = tx - ux * hl, hy = ty - uy * hl;
  const px = -uy * 5, py = ux * 5;
  return (
    <g opacity={opacity} style={{ transition: "opacity 0.4s" }}>
      <line x1={fx} y1={fy} x2={hx} y2={hy}
        stroke={color} strokeWidth={2.5}
        strokeDasharray={dashed ? "5 4" : "none"} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${hx + px},${hy + py} ${hx - px},${hy - py}`} fill={color} />
      {label && (
        <text x={(fx + tx) / 2 - 12} y={(fy + ty) / 2 - 8}
          fill={color} fontSize={12} fontWeight="600" fontFamily="serif">{label}</text>
      )}
    </g>
  );
}

function ComponentLines({ from, to, color, show }) {
  const [fx, fy] = ts(from[0], from[1]);
  const [tx, ty] = ts(to[0], to[1]);
  const [cx, cy] = ts(to[0], from[1]);
  return (
    <g opacity={show ? 0.6 : 0} style={{ transition: "opacity 0.5s" }}>
      <line x1={fx} y1={fy} x2={cx} y2={cy} stroke={color} strokeWidth={1} strokeDasharray="4 3" />
      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke={color} strokeWidth={1} strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={3} fill={color} opacity={0.8} />
    </g>
  );
}

export default function VectorEqualityProof({ params = {} }) {
  const currentStep = params.currentStep ?? 0;
  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];

  const vecA = [2.5, 1.8];
  const vecB = [2.5, 1.8]; // same vector — proven equal
  const vecBOffset = [0.3, -0.4]; // slight visual separation for display

  const showBoth = ["both", "diff", "components", "equal"].includes(step.highlight);
  const showDiff = ["diff", "components", "equal"].includes(step.highlight);
  const showComponents = ["components", "equal"].includes(step.highlight);
  const showEqual = step.highlight === "equal";

  const [ox, oy] = ts(0, 0);

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: "#0f172a", borderRadius: 16, overflow: "hidden"
    }}>
      {/* Step header */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          background: "#1e293b", color: "#6366f1", borderRadius: 6,
          padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em"
        }}>STEP {Math.min(currentStep, STEPS.length - 1) + 1} / {STEPS.length}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{step.title}</span>
      </div>

      {/* Algebra display */}
      <div style={{
        margin: "12px 20px", padding: "14px 18px",
        background: "#1e293b", borderRadius: 10,
        fontFamily: "'Fira Code', monospace", fontSize: 15,
        color: "#a5b4fc", letterSpacing: "0.03em",
        borderLeft: "3px solid #6366f1"
      }}>
        {step.algebra}
      </div>

      {/* SVG */}
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* Grid */}
        {[-3, -2, -1, 0, 1, 2, 3].map(i => {
          const [x1, y1] = ts(i, -2.5), [x2, y2] = ts(i, 2.5);
          const [x3, y3] = ts(-3.5, i), [x4, y4] = ts(3.5, i);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1e293b" strokeWidth={0.5} />
              <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#1e293b" strokeWidth={0.5} />
            </g>
          );
        })}

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#334155" strokeWidth={1} />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#334155" strokeWidth={1} />

        {/* Vector A — always shown */}
        <ComponentLines from={[0, 0]} to={vecA} color="#6366f1" show={showComponents} />
        <ProofArrow from={[0, 0]} to={vecA} color="#6366f1" label="A⃗" />

        {/* Vector B — shown when step > 0, slightly offset visually */}
        <ProofArrow
          from={[0.15, -0.1]}
          to={[vecA[0] + 0.15, vecA[1] - 0.1]}
          color="#f59e0b"
          label="B⃗"
          dashed={!showEqual}
          opacity={showBoth ? 1 : 0.15}
        />

        {/* Difference vector (step 3) */}
        {showDiff && (
          <ProofArrow
            from={vecA}
            to={[vecA[0] + (vecBOffset[0]), vecA[1] + (vecBOffset[1])]}
            color="#f43f5e"
            label="A⃗−B⃗"
            opacity={showEqual ? 0 : 0.9}
          />
        )}

        {/* Component labels */}
        {showComponents && (
          <>
            <text x={ts(vecA[0] / 2, 0)[0]} y={ts(vecA[0] / 2, 0)[1] + 14}
              fill="#6366f1" fontSize={11} textAnchor="middle">Aₓ = Bₓ</text>
            <text x={ts(vecA[0] + 0.3, vecA[1] / 2)[0]} y={ts(vecA[0] + 0.3, vecA[1] / 2)[1]}
              fill="#6366f1" fontSize={11} textAnchor="start">Aᵧ = Bᵧ</text>
          </>
        )}

        {/* Equal badge */}
        {showEqual && (
          <text x={ts(vecA[0] / 2 + 0.5, vecA[1] / 2 + 0.3)[0]}
            y={ts(vecA[0] / 2 + 0.5, vecA[1] / 2 + 0.3)[1]}
            fill="#10b981" fontSize={13} fontWeight="700">✓ A⃗ = B⃗</text>
        )}
      </svg>

      {/* Insight */}
      <div style={{
        margin: "0 20px 20px", padding: "12px 16px",
        background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9",
        fontSize: 13, color: "#94a3b8", lineHeight: 1.6
      }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>
        {step.insight}
      </div>
    </div>
  );
}
