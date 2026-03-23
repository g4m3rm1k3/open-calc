// SubtractionProof.jsx — Pillar 2, Lesson 7
import { useState } from "react";

const STEPS = [
  { title: "Define subtraction", eq: "A⃗ − B⃗  =  A⃗ + (−B⃗)", highlight: "define", insight: "Subtraction is not a new operation. It's addition of the additive inverse. Everything we know about addition applies." },
  { title: "Negate B⃗ component-wise", eq: "−B⃗ = (−Bₓ, −Bᵧ)", highlight: "negate", insight: "Flipping all signs gives a vector of the same length pointing the opposite direction." },
  { title: "Apply component addition", eq: "A⃗ + (−B⃗) = (Aₓ+(−Bₓ), Aᵧ+(−Bᵧ))", highlight: "add", insight: "Component-wise. This is the definition of addition, applied to A⃗ and −B⃗." },
  { title: "Simplify", eq: "= (Aₓ−Bₓ,  Aᵧ−Bᵧ)", highlight: "simplify", insight: "Vector subtraction reduces to scalar subtraction on each component. Clean and exact." },
  { title: "Tail-to-tail geometric shortcut", eq: "Place tails at 0 → A⃗−B⃗ goes from tip(B⃗) to tip(A⃗)", highlight: "geometry", insight: "tip(A⃗)−tip(B⃗) = (Aₓ−Bₓ, Aᵧ−Bᵧ). The geometry matches the algebra exactly." },
];

const VA = [2.2, 1.2], VB = [0.8, 2.0];
const DIFF = [VA[0] - VB[0], VA[1] - VB[1]];
const W = 280, H = 200, SC = 44, CX = 100, CY = 145;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }

function SArrow({ from, to, color, w = 2.5, dashed = false, label, opacity = 1 }) {
  const [fx, fy] = ts(from[0], from[1]), [tx, ty] = ts(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy);
  if (len < 3) return null;
  const ux = dx / len, uy = dy / len, hl = 10;
  const ex = tx - ux * hl, ey = ty - uy * hl;
  return (
    <g opacity={opacity} style={{ transition: "opacity 0.4s" }}>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeDasharray={dashed ? "4 3" : "none"} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={color} />
      {label && <text x={tx + 9} y={ty - 8} fill={color} fontSize={12} fontWeight="700">{label}</text>}
    </g>
  );
}

export default function SubtractionProof({ params = {} }) {
  const si = Math.min(params.currentStep ?? 0, STEPS.length - 1);
  const step = STEPS[si];
  const h = step.highlight;
  const [ox, oy] = ts(0, 0);

  const showNeg = ["negate", "add", "simplify", "geometry"].includes(h);
  const showAdd = ["add", "simplify", "geometry"].includes(h);
  const showResult = ["simplify", "geometry"].includes(h);
  const showShortcut = h === "geometry";

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "#1e293b", color: "#f43f5e", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
          STEP {si + 1}/{STEPS.length}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{step.title}</span>
      </div>
      <div style={{ margin: "10px 20px", padding: "11px 16px", background: "#1e293b", borderRadius: 10, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#fda4af", borderLeft: "3px solid #f43f5e" }}>
        {step.eq}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          {[-2, -1, 0, 1, 2].map(i => {
            const [x1, y1] = ts(i, -2.5), [x2, y2] = ts(i, 2.5);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5} />;
          })}
          {[-2, -1, 0, 1, 2].map(i => {
            const [x3, y3] = ts(-2.5, i), [x4, y4] = ts(2.5, i);
            return <line key={i} x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5} />;
          })}
          <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1} />
          <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1} />

          <SArrow from={[0, 0]} to={VA} color="#6366f1" label="A⃗" />
          <SArrow from={[0, 0]} to={VB} color="#f59e0b" label="B⃗" />

          {/* −B⃗ chained after A⃗ */}
          {showNeg && <SArrow from={VA} to={[VA[0] - VB[0], VA[1] - VB[1]]} color="#f43f5e" dashed label="−B⃗" opacity={showAdd ? 1 : 0.6} />}

          {/* Resultant */}
          {showResult && <SArrow from={[0, 0]} to={DIFF} color="#10b981" w={3} label="A⃗−B⃗" />}

          {/* Tail-to-tail shortcut arrow */}
          {showShortcut && <SArrow from={VB} to={VA} color="#10b981" w={2} dashed />}

          <circle cx={CX} cy={CY} r={3} fill="#475569" />
        </svg>

        <div style={{ padding: "16px 16px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { show: true, label: "A⃗", formula: `(${VA[0]}, ${VA[1]})`, color: "#6366f1" },
            { show: true, label: "B⃗", formula: `(${VB[0]}, ${VB[1]})`, color: "#f59e0b" },
            { show: showNeg, label: "−B⃗", formula: `(${-VB[0]}, ${-VB[1]})`, color: "#f43f5e" },
            { show: showResult, label: "A⃗−B⃗", formula: `(${DIFF[0].toFixed(1)}, ${DIFF[1].toFixed(1)})`, color: "#10b981" },
          ].map(({ show, label, formula, color }) => (
            <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "9px 12px", opacity: show ? 1 : 0.2, transition: "opacity 0.4s", borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 10, color: "#64748b" }}>{label}</div>
              <div style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color }}>{formula}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ margin: "0 20px 20px", padding: "11px 15px", background: "#0c1a2e", borderRadius: 10, borderLeft: "3px solid #0ea5e9", fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
        <span style={{ color: "#38bdf8", fontWeight: 600 }}>Insight: </span>{step.insight}
      </div>
    </div>
  );
}
