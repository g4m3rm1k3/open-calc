// NumericalSubtractionWalkthrough.jsx — L8 Pillar 1
import { useState, useRef, useCallback } from "react";

const W = 460, H = 300, SC = 44, CX = 170, CY = 180;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }
function fs(sx, sy) { return [(sx - CX) / SC, (CY - sy) / SC]; }

function Arrow({ from, to, color, w = 2.8, dashed = false, label, opacity = 1 }) {
  const [fx, fy] = ts(from[0], from[1]), [tx, ty] = ts(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy);
  if (len < 3) return null;
  const ux = dx / len, uy = dy / len, hl = 11;
  const ex = tx - ux * hl, ey = ty - uy * hl;
  return (
    <g opacity={opacity} style={{ transition: "opacity 0.3s" }}>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeDasharray={dashed ? "5 3" : "none"} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={color} />
      {label && <text x={tx + 9} y={ty - 8} fill={color} fontSize={13} fontWeight="800">{label}</text>}
    </g>
  );
}

const STEPS_LABELS = ["0. Negate B⃗", "1. Decompose", "2. Sum", "3. Magnitude", "4. Direction"];
const STEP_COLORS = ["#f43f5e", "#6366f1", "#f59e0b", "#10b981", "#818cf8"];

export default function NumericalSubtractionWalkthrough({ params = {} }) {
  const svgRef = useRef(null);
  const [vA, setVA] = useState([2.4, 1.1]);
  const [vB, setVB] = useState([0.9, 2.1]);
  const [drag, setDrag] = useState(null);
  const [step, setStep] = useState(0);

  const getSVG = useCallback((e) => {
    const r = svgRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return fs((cx - r.left) * (W / r.width), (cy - r.top) * (H / r.height));
  }, []);

  const onMove = useCallback((e) => {
    if (!drag) return;
    const [mx, my] = getSVG(e);
    const c = [Math.max(-3, Math.min(3, mx)), Math.max(-2.5, Math.min(2.5, my))];
    if (drag === "A") setVA(c); else setVB(c);
  }, [drag, getSVG]);

  const negB = [-vB[0], -vB[1]];
  const Rx = vA[0] - vB[0], Ry = vA[1] - vB[1];
  const magR = Math.sqrt(Rx ** 2 + Ry ** 2);
  const thetaR = Math.atan2(Ry, Rx) * 180 / Math.PI;
  const [ox, oy] = ts(0, 0);

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {STEPS_LABELS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} style={{
            background: step === i ? STEP_COLORS[i] : "#1e293b",
            color: step === i ? "#0f172a" : step > i ? STEP_COLORS[i] : "#64748b",
            border: `1.5px solid ${step >= i ? STEP_COLORS[i] : "#334155"}`,
            borderRadius: 8, padding: "4px 11px", fontSize: 11, fontWeight: 700, cursor: "pointer"
          }}>{s}</button>
        ))}
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", cursor: drag ? "grabbing" : "crosshair" }}
        onMouseMove={onMove} onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}
        onTouchMove={onMove} onTouchEnd={() => setDrag(null)}>
        {[-3, -2, -1, 0, 1, 2, 3].map(i => {
          const [x1, y1] = ts(i, -3), [x2, y2] = ts(i, 3);
          const [x3, y3] = ts(-3, i), [x4, y4] = ts(3, i);
          return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5} /><line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5} /></g>;
        })}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1} />
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1} />

        {/* A⃗ always shown */}
        <Arrow from={[0, 0]} to={vA} color="#6366f1" label="A⃗" />
        {/* B⃗ shown fading after step 0 */}
        <Arrow from={[0, 0]} to={vB} color="#f59e0b" label="B⃗" opacity={step === 0 ? 1 : 0.25} />
        {/* −B⃗ appears at step 0 */}
        {step >= 0 && <Arrow from={[0, 0]} to={negB} color="#f43f5e" dashed label="−B⃗" opacity={step === 0 ? 1 : 0.5} />}
        {/* Decomp lines step 1 */}
        {step >= 1 && <>
          <line x1={ts(0, 0)[0]} y1={ts(0, 0)[1]} x2={ts(Rx, 0)[0]} y2={ts(Rx, 0)[1]} stroke="#f59e0b" strokeWidth={2} />
          <line x1={ts(Rx, 0)[0]} y1={ts(Rx, 0)[1]} x2={ts(Rx, Ry)[0]} y2={ts(Rx, Ry)[1]} stroke="#10b981" strokeWidth={2} />
        </>}
        {/* Result step 2+ */}
        {step >= 2 && <Arrow from={[0, 0]} to={[Rx, Ry]} color="#10b981" w={3.5} label="R⃗" />}

        {[["A", vA, "#6366f1"], ["B", vB, "#f59e0b"]].map(([id, v, c]) => {
          const [hx, hy] = ts(v[0], v[1]);
          return <circle key={id} cx={hx} cy={hy} r={7} fill={c} stroke="#0f172a" strokeWidth={2}
            style={{ cursor: "grab" }} onMouseDown={() => setDrag(id)} onTouchStart={() => setDrag(id)} />;
        })}
        <circle cx={CX} cy={CY} r={3} fill="#475569" />
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, padding: "0 16px 16px" }}>
        {[
          { label: "−B⃗", val: `(${negB[0].toFixed(1)},${negB[1].toFixed(1)})`, color: "#f43f5e", active: step >= 0 },
          { label: "Aₓ,Aᵧ", val: `${vA[0].toFixed(2)},${vA[1].toFixed(2)}`, color: "#6366f1", active: step >= 1 },
          { label: "Rₓ,Rᵧ", val: `${Rx.toFixed(2)},${Ry.toFixed(2)}`, color: "#f59e0b", active: step >= 2 },
          { label: "|R⃗|", val: magR.toFixed(3), color: "#10b981", active: step >= 3 },
          { label: "θ", val: thetaR.toFixed(1) + "°", color: "#818cf8", active: step >= 4 },
        ].map(({ label, val, color, active }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 7, padding: "8px 8px", opacity: active ? 1 : 0.25, transition: "opacity 0.4s", borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 9, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 11, fontFamily: "'Fira Code',monospace", color, fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
