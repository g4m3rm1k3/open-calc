import { useState, useCallback, useRef } from "react";

const W = 420, H = 300, CX = 180, CY = 170, SC = 46;

function ts(x, y) { return [CX + x * SC, CY - y * SC]; }
function fs(sx, sy) { return [(sx - CX) / SC, (CY - sy) / SC]; }

function Arrow({ from, to, color, width = 2.5, dashed = false, opacity = 1 }) {
  const [fx, fy] = ts(from[0], from[1]);
  const [tx, ty] = ts(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len;
  const hl = 10;
  const ex = tx - ux * hl, ey = ty - uy * hl;
  return (
    <g opacity={opacity} style={{ transition: "opacity 0.4s" }}>
      <line x1={fx} y1={fy} x2={ex} y2={ey}
        stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? "5 3" : "none"} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={color} />
    </g>
  );
}

export default function UnitVectorBuilder({ params = {} }) {
  const svgRef = useRef(null);
  const [head, setHead] = useState([3, 2]);
  const [dragging, setDragging] = useState(false);
  const [showStep, setShowStep] = useState(false);

  const [Ax, Ay] = head;
  const mag = Math.sqrt(Ax * Ax + Ay * Ay);
  const unitX = mag > 0 ? Ax / mag : 0;
  const unitY = mag > 0 ? Ay / mag : 0;
  const unitMag = Math.sqrt(unitX * unitX + unitY * unitY);

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return fs((cx - rect.left) * (W / rect.width), (cy - rect.top) * (H / rect.height));
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const [mx, my] = getSVGPoint(e);
    setHead([Math.max(-3.5, Math.min(3.5, mx)), Math.max(-2.5, Math.min(2.5, my))]);
  }, [dragging, getSVGPoint]);

  const [ox, oy] = ts(0, 0);
  const [hx, hy] = ts(Ax, Ay);
  const [ux, uy_s] = ts(unitX, unitY);

  // Unit circle
  const circleR = SC; // radius 1 in screen units

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · UNIT VECTOR BUILDER</span>
        <button
          onClick={() => setShowStep(s => !s)}
          style={{
            background: showStep ? "#1a2a0d" : "#1e293b",
            color: showStep ? "#34d399" : "#64748b",
            border: `1px solid ${showStep ? "#10b981" : "#334155"}`,
            borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer"
          }}>
          {showStep ? "Show steps ON" : "Show division step"}
        </button>
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", cursor: dragging ? "grabbing" : "crosshair" }}
        onMouseMove={onMove} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)}
        onTouchMove={onMove} onTouchEnd={() => setDragging(false)}>

        {/* Grid */}
        {[-3, -2, -1, 0, 1, 2, 3].map(i => {
          const [x1, y1] = ts(i, -3), [x2, y2] = ts(i, 3);
          const [x3, y3] = ts(-3.5, i), [x4, y4] = ts(3.5, i);
          return <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a2540" strokeWidth={0.5} />
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#1a2540" strokeWidth={0.5} />
          </g>;
        })}

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#334155" strokeWidth={1} />
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#334155" strokeWidth={1} />
        <text x={W - 8} y={oy - 6} fill="#475569" fontSize={10} textAnchor="end">x</text>
        <text x={CX + 6} y={14} fill="#475569" fontSize={10}>y</text>

        {/* Unit circle */}
        <circle cx={CX} cy={CY} r={circleR}
          fill="none" stroke="#1e3a5f" strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={CX + circleR + 4} y={CY - 4} fill="#1e3a5f" fontSize={9}>r=1</text>

        {/* Original vector (dashed ghost when showing steps) */}
        <Arrow from={[0, 0]} to={[Ax, Ay]}
          color="#6366f1" width={3} dashed={showStep} opacity={showStep ? 0.4 : 1} />

        {/* Division step: scale down animation */}
        {showStep && (
          <>
            {/* Intermediate scale line */}
            <line x1={CX} y1={CY}
              x2={CX + (hx - CX) * (1 / Math.max(mag, 1))}
              y2={CY + (hy - CY) * (1 / Math.max(mag, 1))}
              stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 2" opacity={0.7} />
            <text
              x={(CX + CX + (hx - CX) * 0.5 / Math.max(mag, 1)) / 1 + 8}
              y={(CY + CY + (hy - CY) * 0.5 / Math.max(mag, 1)) / 1 - 8}
              fill="#f59e0b" fontSize={10}>÷ {mag.toFixed(2)}</text>
          </>
        )}

        {/* Unit vector */}
        <Arrow from={[0, 0]} to={[unitX, unitY]} color="#10b981" width={3} />

        {/* Unit dot on circle */}
        <circle cx={ux} cy={uy_s} r={5}
          fill="#10b981" stroke="#0f172a" strokeWidth={2} />

        {/* Original arrowhead handle */}
        <circle cx={hx} cy={hy} r={8} fill="#6366f1" stroke="#e0e7ff" strokeWidth={2}
          style={{ cursor: "grab" }}
          onMouseDown={() => setDragging(true)}
          onTouchStart={() => setDragging(true)} />

        {/* Labels */}
        <text x={hx + 10} y={hy - 8} fill="#818cf8" fontSize={12} fontWeight="700">A⃗</text>
        <text x={ux + 10} y={uy_s - 8} fill="#10b981" fontSize={12} fontWeight="700">Â</text>
      </svg>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
        {[
          { label: "Aₓ", val: Ax.toFixed(2), color: "#818cf8" },
          { label: "Aᵧ", val: Ay.toFixed(2), color: "#818cf8" },
          { label: "|A⃗|", val: mag.toFixed(3), color: "#6366f1" },
          { label: "|Â|", val: unitMag.toFixed(4), color: "#10b981", note: "= 1 always" },
        ].map(({ label, val, color, note }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
            {note && <div style={{ fontSize: 10, color: "#34d399" }}>{note}</div>}
          </div>
        ))}
      </div>

      {/* Formula */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ background: "#1e293b", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#94a3b8", fontFamily: "'Fira Code', monospace" }}>
          Â = A⃗ / |A⃗| = ({Ax.toFixed(2)}, {Ay.toFixed(2)}) / {mag.toFixed(3)} = ({unitX.toFixed(3)}, {unitY.toFixed(3)})
        </div>
      </div>
    </div>
  );
}
