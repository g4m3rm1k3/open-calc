import { useState, useRef, useCallback } from "react";

const W = 500, H = 360, CX = 220, CY = 190;
const SCALE = 55;

function ts(x, y) { return [CX + x * SCALE, CY - y * SCALE]; }
function fs(sx, sy) { return [(sx - CX) / SCALE, (CY - sy) / SCALE]; }

function Arrow({ from, to, color, width = 2.5 }) {
  const [fx, fy] = ts(from[0], from[1]);
  const [tx, ty] = ts(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len;
  const hl = 11;
  const hx = tx - ux * hl, hy = ty - uy * hl;
  return (
    <g>
      <line x1={fx} y1={fy} x2={hx} y2={hy} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${hx - uy * 5},${hy + ux * 5} ${hx + uy * 5},${hy - ux * 5}`} fill={color} />
    </g>
  );
}

export default function VectorComponentDecomposer({ params = {} }) {
  const svgRef = useRef(null);
  const [head, setHead] = useState(params.lockedAngle !== undefined
    ? [
      (params.lockedMagnitude || 3) * Math.cos((params.lockedAngle || 30) * Math.PI / 180),
      (params.lockedMagnitude || 3) * Math.sin((params.lockedAngle || 30) * Math.PI / 180)
    ]
    : [3, 2]);
  const [dragging, setDragging] = useState(false);
  const [showTrig, setShowTrig] = useState(params.showTrigOverlay ?? true);
  const [showUnit, setShowUnit] = useState(params.showUnitVectors ?? false);

  const locked = params.lockedMagnitude !== undefined;

  const Ax = head[0], Ay = head[1];
  const mag = Math.sqrt(Ax * Ax + Ay * Ay);
  const theta = Math.atan2(Ay, Ax) * 180 / Math.PI;

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = W / rect.width, scaleY = H / rect.height;
    return fs((cx - rect.left) * scaleX, (cy - rect.top) * scaleY);
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging || locked) return;
    const [mx, my] = getSVGPoint(e);
    const cx = Math.max(-3.5, Math.min(3.5, mx));
    const cy = Math.max(-2.8, Math.min(2.8, my));
    setHead([cx, cy]);
  }, [dragging, locked, getSVGPoint]);

  const [ox, oy] = ts(0, 0);
  const [hx, hy] = ts(Ax, Ay);
  const [px, py] = ts(Ax, 0); // foot of perpendicular on x-axis
  const [qx, qy] = ts(0, Ay); // foot of perpendicular on y-axis

  // Arc for angle
  const arcR = 32;
  const a1 = 0, a2 = -theta * Math.PI / 180;
  const arcX = ox + arcR * Math.cos(a2), arcY = oy + arcR * Math.sin(a2);
  const largeArc = Math.abs(theta) > 180 ? 1 : 0;
  const sweepArc = theta >= 0 ? 0 : 1;

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 4 · COMPONENT DECOMPOSER</span>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ label: "Trig overlay", state: showTrig, set: setShowTrig },
            { label: "Unit vectors", state: showUnit, set: setShowUnit }].map(({ label, state, set }) => (
            <button key={label} onClick={() => set(s => !s)}
              style={{
                background: state ? "#1a1a3e" : "#1e293b",
                color: state ? "#818cf8" : "#64748b",
                border: `1px solid ${state ? "#6366f1" : "#334155"}`,
                borderRadius: 6, padding: "4px 10px", fontSize: 11,
                fontWeight: 600, cursor: "pointer"
              }}>{label}</button>
          ))}
        </div>
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", cursor: dragging ? "grabbing" : (locked ? "default" : "crosshair") }}
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
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#334155" strokeWidth={1.2} />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#334155" strokeWidth={1.2} />
        {[-3, -2, -1, 1, 2, 3].map(i => {
          const [tx2] = ts(i, 0), [ty2] = ts(0, i);
          return <g key={i}>
            <line x1={tx2} y1={oy - 4} x2={tx2} y2={oy + 4} stroke="#334155" strokeWidth={1} />
            <line x1={ox - 4} y1={ty2} x2={ox + 4} y2={ty2} stroke="#334155" strokeWidth={1} />
            <text x={tx2} y={oy + 14} fill="#475569" fontSize={9} textAnchor="middle">{i}</text>
            <text x={ox - 8} y={ty2 + 3} fill="#475569" fontSize={9} textAnchor="end">{i}</text>
          </g>;
        })}
        <text x={W - 10} y={oy - 8} fill="#64748b" fontSize={11} textAnchor="end">x</text>
        <text x={ox + 8} y={14} fill="#64748b" fontSize={11}>y</text>

        {/* Component shadow lines */}
        {showTrig && (
          <g>
            {/* Horizontal component line */}
            <line x1={ox} y1={oy} x2={px} y2={oy} stroke="#f59e0b" strokeWidth={2.5}
              strokeLinecap="round" />
            {/* Vertical component line */}
            <line x1={px} y1={oy} x2={px} y2={hy} stroke="#10b981" strokeWidth={2.5}
              strokeLinecap="round" />
            {/* Dashed projection lines */}
            <line x1={px} y1={hy} x2={hx} y2={hy} stroke="#10b981" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />
            <line x1={hx} y1={hy} x2={hx} y2={oy} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />

            {/* Right angle marker at foot */}
            <path d={`M ${px + 6} ${oy} L ${px + 6} ${oy + 6} L ${px} ${oy + 6}`}
              fill="none" stroke="#64748b" strokeWidth={1} />

            {/* Component labels */}
            <text x={(ox + px) / 2} y={oy + 18}
              fill="#f59e0b" fontSize={12} fontWeight="700" textAnchor="middle">Aₓ = {Ax.toFixed(2)}</text>
            <text x={px + 10} y={(oy + hy) / 2}
              fill="#10b981" fontSize={12} fontWeight="700" textAnchor="start">Aᵧ = {Ay.toFixed(2)}</text>
          </g>
        )}

        {/* Angle arc */}
        {mag > 0.3 && (
          <>
            <path
              d={`M ${ox + arcR} ${oy} A ${arcR} ${arcR} 0 ${largeArc} ${sweepArc} ${arcX} ${arcY}`}
              fill="none" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="4 3" />
            <text
              x={ox + 52 * Math.cos(-theta * Math.PI / 360)}
              y={oy - 52 * Math.sin(-theta * Math.PI / 360)}
              fill="#818cf8" fontSize={11} textAnchor="middle">θ</text>
          </>
        )}

        {/* Unit vectors */}
        {showUnit && (
          <>
            <Arrow from={[0, 0]} to={[1, 0]} color="#f43f5e" width={2} />
            <text x={ts(1.1, 0)[0]} y={ts(1.1, 0)[1] - 6} fill="#f43f5e" fontSize={11} fontWeight="700">î</text>
            <Arrow from={[0, 0]} to={[0, 1]} color="#f43f5e" width={2} />
            <text x={ts(0.1, 1.1)[0]} y={ts(0.1, 1.1)[1]} fill="#f43f5e" fontSize={11} fontWeight="700">ĵ</text>
          </>
        )}

        {/* Main vector */}
        <Arrow from={[0, 0]} to={[Ax, Ay]} color="#6366f1" width={3} />

        {/* Glow */}
        <circle cx={hx} cy={hy} r={11} fill="none" stroke="#818cf8" strokeWidth={1.5} opacity={0.4} />

        {/* Draggable head */}
        <circle cx={hx} cy={hy} r={8} fill="#6366f1" stroke="#e0e7ff" strokeWidth={2}
          style={{ cursor: locked ? "default" : "grab" }}
          onMouseDown={() => !locked && setDragging(true)}
          onTouchStart={() => !locked && setDragging(true)} />

        {/* Vector label */}
        <text x={hx + 12} y={hy - 8} fill="#e2e8f0" fontSize={14} fontWeight="700">A⃗</text>
      </svg>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, padding: "0 20px 20px" }}>
        {[
          { label: "Aₓ", value: Ax.toFixed(3), color: "#f59e0b", note: "|A⃗| cos θ" },
          { label: "Aᵧ", value: Ay.toFixed(3), color: "#10b981", note: "|A⃗| sin θ" },
          { label: "|A⃗|", value: mag.toFixed(3), color: "#6366f1", note: "√(Aₓ²+Aᵧ²)" },
          { label: "θ", value: theta.toFixed(1) + "°", color: "#818cf8", note: "from +x axis" },
        ].map(({ label, value, color, note }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{note}</div>
            <div style={{ fontSize: 13, color, fontWeight: 700 }}>{label} =</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Formula reminder */}
      {showTrig && (
        <div style={{ padding: "0 20px 16px", fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
          <span style={{ color: "#f59e0b" }}>Aₓ = |A⃗| cosθ</span>
          {" · "}
          <span style={{ color: "#10b981" }}>Aᵧ = |A⃗| sinθ</span>
          {" · "}
          <span style={{ color: "#818cf8" }}>|A⃗| = √(Aₓ² + Aᵧ²)</span>
        </div>
      )}
    </div>
  );
}
