import { useState, useRef, useCallback, useEffect } from "react";

const W = 520, H = 380, CX = 220, CY = 210, SC = 52;

function ts(x, y) { return [CX + x * SC, CY - y * SC]; }
function fs(sx, sy) { return [(sx - CX) / SC, (CY - sy) / SC]; }

export default function ComponentDecomposerLive({ params = {} }) {
  const svgRef = useRef(null);
  const [head, setHead] = useState(
    params.lockedAngle !== undefined
      ? [
        (params.lockedMagnitude ?? 3) * Math.cos((params.lockedAngle ?? 35) * Math.PI / 180),
        (params.lockedMagnitude ?? 3) * Math.sin((params.lockedAngle ?? 35) * Math.PI / 180)
      ]
      : [3.2, 2.1]
  );
  const [dragging, setDragging] = useState(false);
  const [showLabels, setShowLabels] = useState(params.showLabels ?? true);
  const locked = params.lockedMagnitude !== undefined;

  const [Ax, Ay] = head;
  const mag = Math.sqrt(Ax * Ax + Ay * Ay);
  const thetaRad = Math.atan2(Ay, Ax);
  const thetaDeg = thetaRad * 180 / Math.PI;

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return fs((cx - rect.left) * (W / rect.width), (cy - rect.top) * (H / rect.height));
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging || locked) return;
    const [mx, my] = getSVGPoint(e);
    setHead([Math.max(-3.8, Math.min(3.8, mx)), Math.max(-2.8, Math.min(2.8, my))]);
  }, [dragging, locked, getSVGPoint]);

  const [ox, oy] = ts(0, 0);
  const [hx, hy] = ts(Ax, Ay);
  const [px, py] = ts(Ax, 0);  // foot of altitude on x-axis

  // Arrow helper
  function makeArrow(x1, y1, x2, y2, color, w = 3) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 2) return null;
    const ux = dx / len, uy = dy / len;
    const hl = 11;
    const ex = x2 - ux * hl, ey = y2 - uy * hl;
    return (
      <g>
        <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" />
        <polygon points={`${x2},${y2} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={color} />
      </g>
    );
  }

  // Angle arc
  const arcR = 36;
  const arcAngle = thetaRad;
  const arcSweep = Ay >= 0 ? 0 : 1;
  const ax2 = CX + arcR * Math.cos(-arcAngle), ay2 = CY + arcR * Math.sin(-arcAngle);

  // Quadrant determination for color
  const quadrant = Ax >= 0 && Ay >= 0 ? "I" : Ax < 0 && Ay >= 0 ? "II" : Ax < 0 && Ay < 0 ? "III" : "IV";
  const quadrantColor = { I: "#10b981", II: "#f59e0b", III: "#f43f5e", IV: "#0ea5e9" }[quadrant];

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700, letterSpacing: "0.08em" }}>
          PILLAR 1 · LIVE DECOMPOSITION
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            background: "#1e293b", color: quadrantColor,
            borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700
          }}>Quadrant {quadrant}</span>
          <button onClick={() => setShowLabels(l => !l)} style={{
            background: "#1e293b", color: showLabels ? "#34d399" : "#64748b",
            border: `1px solid ${showLabels ? "#10b981" : "#334155"}`,
            borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer"
          }}>Labels</button>
        </div>
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", cursor: dragging ? "grabbing" : (locked ? "default" : "crosshair") }}
        onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
        onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>

        {/* Grid */}
        {[-3, -2, -1, 0, 1, 2, 3].map(i => {
          const [x1, y1] = ts(i, -3), [x2, y2] = ts(i, 3);
          const [x3, y3] = ts(-4, i), [x4, y4] = ts(4, i);
          return <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#151f33" strokeWidth={0.5} />
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#151f33" strokeWidth={0.5} />
          </g>;
        })}

        {/* Tick marks */}
        {[-3, -2, -1, 1, 2, 3].map(i => {
          const [tx2] = ts(i, 0), [ty2] = ts(0, i);
          return <g key={i}>
            <line x1={tx2} y1={oy - 4} x2={tx2} y2={oy + 4} stroke="#334155" strokeWidth={1} />
            <line x1={ox - 4} y1={ty2} x2={ox + 4} y2={ty2} stroke="#334155" strokeWidth={1} />
            <text x={tx2} y={oy + 15} fill="#374151" fontSize={9} textAnchor="middle">{i}</text>
            <text x={ox - 8} y={ty2 + 3} fill="#374151" fontSize={9} textAnchor="end">{i}</text>
          </g>;
        })}

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#334155" strokeWidth={1.2} />
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#334155" strokeWidth={1.2} />
        <text x={W - 10} y={oy - 8} fill="#4b5563" fontSize={11} textAnchor="end">x</text>
        <text x={CX + 8} y={14} fill="#4b5563" fontSize={11}>y</text>

        {/* Right triangle shading */}
        <polygon
          points={`${ox},${oy} ${px},${oy} ${px},${hy}`}
          fill={quadrantColor} opacity={0.06} />

        {/* Ax component arrow on x-axis */}
        {makeArrow(ox, oy, px, oy, "#f59e0b", 3)}
        {/* Ay component arrow from foot up */}
        {makeArrow(px, oy, px, hy, "#10b981", 3)}

        {/* Dashed projection lines */}
        <line x1={hx} y1={hy} x2={px} y2={hy} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
        <line x1={hx} y1={hy} x2={hx} y2={oy} stroke="#10b981" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />

        {/* Right-angle marker at foot */}
        {Ay !== 0 && (
          <path d={`M ${px + (Ax >= 0 ? -7 : 7)} ${oy} L ${px + (Ax >= 0 ? -7 : 7)} ${oy + (Ay >= 0 ? 7 : -7)} L ${px} ${oy + (Ay >= 0 ? 7 : -7)}`}
            fill="none" stroke="#475569" strokeWidth={1} />
        )}

        {/* Angle arc */}
        {mag > 0.3 && Math.abs(thetaDeg) > 2 && (
          <>
            <path d={`M ${CX + arcR} ${CY} A ${arcR} ${arcR} 0 0 ${arcSweep} ${ax2} ${ay2}`}
              fill="none" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="4 3" />
            <text
              x={CX + 52 * Math.cos(-thetaRad / 2)}
              y={CY - 52 * Math.sin(-thetaRad / 2)}
              fill="#818cf8" fontSize={11} textAnchor="middle">θ</text>
          </>
        )}

        {/* Component labels */}
        {showLabels && (
          <>
            <text x={(ox + px) / 2} y={oy + (Ay >= 0 ? 18 : -10)}
              fill="#f59e0b" fontSize={12} fontWeight="700" textAnchor="middle">
              Aₓ = {Ax.toFixed(2)}
            </text>
            <text
              x={px + (Ax >= 0 ? 12 : -12)} y={(oy + hy) / 2 + 4}
              fill="#10b981" fontSize={12} fontWeight="700"
              textAnchor={Ax >= 0 ? "start" : "end"}>
              Aᵧ = {Ay.toFixed(2)}
            </text>
          </>
        )}

        {/* Hypotenuse label (magnitude) */}
        {showLabels && mag > 0.5 && (
          <text
            x={(CX + hx) / 2 - 14 * Math.sin(thetaRad)}
            y={(CY + hy) / 2 - 14 * Math.cos(thetaRad)}
            fill="#e2e8f0" fontSize={12} fontWeight="700" textAnchor="middle">
            {mag.toFixed(2)}
          </text>
        )}

        {/* Main vector */}
        {makeArrow(CX, CY, hx, hy, "#6366f1", 3.5)}

        {/* Glow on head */}
        <circle cx={hx} cy={hy} r={12} fill="none" stroke="#818cf8" strokeWidth={1.5} opacity={0.3} />

        {/* Draggable handle */}
        <circle cx={hx} cy={hy} r={9} fill="#6366f1" stroke="#c7d2fe" strokeWidth={2.5}
          style={{ cursor: locked ? "default" : "grab" }}
          onMouseDown={() => !locked && setDragging(true)}
          onTouchStart={() => !locked && setDragging(true)} />

        <text x={hx + 13} y={hy - 10} fill="#e2e8f0" fontSize={14} fontWeight="800">A⃗</text>
      </svg>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "0 16px 16px" }}>
        {[
          { label: "Aₓ", value: Ax.toFixed(3), sub: "|A⃗| cosθ", color: "#f59e0b" },
          { label: "Aᵧ", value: Ay.toFixed(3), sub: "|A⃗| sinθ", color: "#10b981" },
          { label: "|A⃗|", value: mag.toFixed(3), sub: "√(Aₓ²+Aᵧ²)", color: "#6366f1" },
          { label: "θ", value: thetaDeg.toFixed(1) + "°", sub: "atan2(Aᵧ,Aₓ)", color: "#818cf8" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "9px 11px" }}>
            <div style={{ fontSize: 10, color: "#475569", marginBottom: 1 }}>{sub}</div>
            <div style={{ fontSize: 12, color, fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px 14px", fontSize: 12, color: "#475569" }}>
        {locked
          ? `Locked to magnitude ${params.lockedMagnitude}, angle ${params.lockedAngle}°.`
          : "Drag the arrowhead into any quadrant. The right triangle updates live."}
      </div>
    </div>
  );
}
