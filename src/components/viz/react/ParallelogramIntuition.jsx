import { useState, useRef, useCallback } from "react";

const W = 520, H = 360, CX = 200, CY = 220, SC = 52;
function ts(x, y) { return [CX + x * SC, CY - y * SC]; }
function fs(sx, sy) { return [(sx - CX) / SC, (CY - sy) / SC]; }

function Arrow({ from, to, color, width = 2.8, label, labelOffset = [10, -10], dashed = false, opacity = 1 }) {
  const [fx, fy] = ts(from[0], from[1]);
  const [tx, ty] = ts(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 3) return null;
  const ux = dx / len, uy = dy / len;
  const hl = 12, hw = 5.5;
  const ex = tx - ux * hl, ey = ty - uy * hl;
  return (
    <g opacity={opacity} style={{ transition: "opacity 0.3s" }}>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={width}
        strokeDasharray={dashed ? "6 4" : "none"} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${ex - uy * hw},${ey + ux * hw} ${ex + uy * hw},${ey - ux * hw}`} fill={color} />
      {label && <text x={tx + labelOffset[0]} y={ty + labelOffset[1]} fill={color} fontSize={14} fontWeight="800">{label}</text>}
    </g>
  );
}

export default function ParallelogramIntuition({ params = {} }) {
  const svgRef = useRef(null);
  const [vecA, setVecA] = useState([2.5, 1.0]);
  const [vecB, setVecB] = useState([1.0, 2.2]);
  const [dragging, setDragging] = useState(null);
  const [showLabels, setShowLabels] = useState(true);

  const getSVG = useCallback((e) => {
    const r = svgRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return fs((cx - r.left) * (W / r.width), (cy - r.top) * (H / r.height));
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const [mx, my] = getSVG(e);
    const clamped = [Math.max(-3.5, Math.min(3.5, mx)), Math.max(-3.0, Math.min(3.0, my))];
    if (dragging === "A") setVecA(clamped);
    if (dragging === "B") setVecB(clamped);
  }, [dragging, getSVG]);

  const R = [vecA[0] + vecB[0], vecA[1] + vecB[1]];
  const magA = Math.sqrt(vecA[0] ** 2 + vecA[1] ** 2).toFixed(2);
  const magB = Math.sqrt(vecB[0] ** 2 + vecB[1] ** 2).toFixed(2);
  const magR = Math.sqrt(R[0] ** 2 + R[1] ** 2).toFixed(2);
  const thetaR = (Math.atan2(R[1], R[0]) * 180 / Math.PI).toFixed(1);

  const [ox, oy] = ts(0, 0);
  const [ahx, ahy] = ts(vecA[0], vecA[1]);
  const [bhx, bhy] = ts(vecB[0], vecB[1]);
  const [rhx, rhy] = ts(R[0], R[1]);

  // Parallelogram fill polygon
  const paraPoints = [
    ts(0, 0), ts(vecA[0], vecA[1]),
    ts(R[0], R[1]), ts(vecB[0], vecB[1])
  ].map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · PARALLELOGRAM BUILDER</span>
        <button onClick={() => setShowLabels(l => !l)} style={{
          background: showLabels ? "#1a1a3e" : "#1e293b", color: showLabels ? "#818cf8" : "#64748b",
          border: `1px solid ${showLabels ? "#6366f1" : "#334155"}`, borderRadius: 6,
          padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer"
        }}>Labels</button>
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", cursor: dragging ? "grabbing" : "crosshair" }}
        onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}
        onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>

        {[-4,-3,-2,-1,0,1,2,3,4].map(i => {
          const [x1,y1]=ts(i,-4),[x2,y2]=ts(i,4);
          const [x3,y3]=ts(-4,i),[x4,y4]=ts(4,i);
          return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5}/>
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5}/></g>;
        })}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#1e293b" strokeWidth={1}/>
        <line x1={CX} y1={0} x2={CX} y2={H} stroke="#1e293b" strokeWidth={1}/>

        {/* Parallelogram fill */}
        <polygon points={paraPoints} fill="#6366f1" opacity={0.06}/>

        {/* Ghost sides (dashed) */}
        <Arrow from={vecB} to={R} color="#6366f1" width={1.5} dashed opacity={0.4}/>
        <Arrow from={vecA} to={R} color="#f59e0b" width={1.5} dashed opacity={0.4}/>

        {/* Vectors A and B */}
        <Arrow from={[0,0]} to={vecA} color="#6366f1" label={showLabels ? "A⃗" : null} labelOffset={[10,-10]}/>
        <Arrow from={[0,0]} to={vecB} color="#f59e0b" label={showLabels ? "B⃗" : null} labelOffset={[10,-8]}/>

        {/* Resultant */}
        <Arrow from={[0,0]} to={R} color="#10b981" width={3.5} label={showLabels ? "R⃗=A⃗+B⃗" : null} labelOffset={[10,-10]}/>

        {/* Drag handles */}
        {[["A", vecA, "#6366f1"], ["B", vecB, "#f59e0b"]].map(([id, v, c]) => {
          const [hx, hy] = ts(v[0], v[1]);
          return (
            <g key={id}>
              <circle cx={hx} cy={hy} r={11} fill="none" stroke={c} strokeWidth={1.5} opacity={0.35}/>
              <circle cx={hx} cy={hy} r={8} fill={c} stroke="#0f172a" strokeWidth={2}
                style={{ cursor: "grab" }}
                onMouseDown={() => setDragging(id)} onTouchStart={() => setDragging(id)}/>
            </g>
          );
        })}

        {/* Origin dot */}
        <circle cx={CX} cy={CY} r={4} fill="#475569"/>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
        {[
          { label: "|A⃗|", val: magA, color: "#6366f1", sub: `(${vecA[0].toFixed(1)}, ${vecA[1].toFixed(1)})` },
          { label: "|B⃗|", val: magB, color: "#f59e0b", sub: `(${vecB[0].toFixed(1)}, ${vecB[1].toFixed(1)})` },
          { label: "|R⃗|", val: magR, color: "#10b981", sub: `θ = ${thetaR}°` },
        ].map(({ label, val, color, sub }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569" }}>
        Drag the arrowheads. The diagonal (green) is always the resultant, regardless of how you reshape the parallelogram.
      </div>
    </div>
  );
}
