import { useState, useRef, useCallback } from "react";

const W = 500, H = 320, SC = 48;
const CL = 130, CR = 370, CY = 190; // left and right diagram centres

function ts(x, y, cx) { return [cx + x * SC, CY - y * SC]; }
function fs(sx, sy, cx) { return [(sx - cx) / SC, (CY - sy) / SC]; }

function Arrow({ from, to, color, w = 2.8, dashed = false, label, lox = 10, loy = -10, cx = CL }) {
  const [fx, fy] = ts(from[0], from[1], cx);
  const [tx, ty] = ts(to[0], to[1], cx);
  const dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy);
  if (len < 3) return null;
  const ux = dx / len, uy = dy / len, hl = 11;
  const ex = tx - ux * hl, ey = ty - uy * hl;
  return (
    <g>
      <line x1={fx} y1={fy} x2={ex} y2={ey} stroke={color} strokeWidth={w}
        strokeDasharray={dashed ? "5 3" : "none"} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${ex - uy * 5},${ey + ux * 5} ${ex + uy * 5},${ey - ux * 5}`} fill={color} />
      {label && <text x={tx + lox} y={ty + loy} fill={color} fontSize={13} fontWeight="800">{label}</text>}
    </g>
  );
}

export default function SubtractionIntuition({ params = {} }) {
  const svgRef = useRef(null);
  const [vA, setVA] = useState([2.2, 1.4]);
  const [vB, setVB] = useState([1.0, 2.0]);
  const [dragging, setDragging] = useState(null);

  const negB = [-vB[0], -vB[1]];
  const diff = [vA[0] - vB[0], vA[1] - vB[1]];
  const magDiff = Math.sqrt(diff[0] ** 2 + diff[1] ** 2).toFixed(2);
  const thetaDiff = (Math.atan2(diff[1], diff[0]) * 180 / Math.PI).toFixed(1);

  const getSVG = useCallback((e) => {
    const r = svgRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy2 = e.touches ? e.touches[0].clientY : e.clientY;
    const sx = (cx - r.left) * (W / r.width);
    const sy = (cy2 - r.top) * (H / r.height);
    // figure out which diagram is closer
    const useCx = Math.abs(sx - CL) < Math.abs(sx - CR) ? CL : CR;
    return [fs(sx, sy, useCx), useCx];
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const [[mx, my]] = getSVG(e);
    const c = [Math.max(-2.5, Math.min(2.5, mx)), Math.max(-2.5, Math.min(2.5, my))];
    if (dragging === "A") setVA(c);
    if (dragging === "B") setVB(c);
  }, [dragging, getSVG]);

  function Axes({ cx }) {
    const [ox, oy] = ts(0, 0, cx);
    return (
      <>
        {[-2, -1, 0, 1, 2].map(i => {
          const [x1, y1] = ts(i, -3, cx), [x2, y2] = ts(i, 3, cx);
          const [x3, y3] = ts(-2.5, i, cx), [x4, y4] = ts(2.5, i, cx);
          return <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#141e30" strokeWidth={0.5} />
            <line x1={x3} y1={y3} x2={x4} y2={y4} stroke="#141e30" strokeWidth={0.5} />
          </g>;
        })}
        <line x1={cx - 130} y1={oy} x2={cx + 130} y2={oy} stroke="#1e293b" strokeWidth={1} />
        <line x1={cx} y1={20} x2={cx} y2={H - 20} stroke="#1e293b" strokeWidth={1} />
      </>
    );
  }

  const [ahLx, ahLy] = ts(vA[0], vA[1], CL);
  const [bhLx, bhLy] = ts(vB[0], vB[1], CL);
  const [ahRx, ahRy] = ts(vA[0], vA[1], CR);
  const [bhRx, bhRy] = ts(vB[0], vB[1], CR);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#f43f5e", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · TWO SUBTRACTION METHODS</span>
        <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
          <span style={{ color: "#6366f1" }}>● Method 1: flip & add</span>
          <span style={{ color: "#f59e0b" }}>● Method 2: tail-to-tail</span>
        </div>
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", cursor: dragging ? "grabbing" : "crosshair" }}
        onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}
        onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>

        {/* Divider */}
        <line x1={W / 2} y1={10} x2={W / 2} y2={H - 10} stroke="#1e293b" strokeWidth={1} />

        {/* Labels */}
        <text x={CL} y={22} fill="#6366f1" fontSize={11} textAnchor="middle" fontWeight="700">A⃗ + (−B⃗)</text>
        <text x={CR} y={22} fill="#f59e0b" fontSize={11} textAnchor="middle" fontWeight="700">Tail-to-tail shortcut</text>

        <Axes cx={CL} />
        <Axes cx={CR} />

        {/* LEFT diagram — flip and add */}
        {/* A⃗ */}
        <Arrow from={[0, 0]} to={vA} color="#6366f1" label="A⃗" cx={CL} />
        {/* −B⃗ placed at tip of A⃗ */}
        <Arrow from={vA} to={[vA[0] + negB[0], vA[1] + negB[1]]} color="#f43f5e" dashed label="−B⃗" lox={8} loy={-10} cx={CL} />
        {/* Result */}
        <Arrow from={[0, 0]} to={diff} color="#10b981" w={3.2} label="A⃗−B⃗" lox={10} loy={-10} cx={CL} />

        {/* RIGHT diagram — tail-to-tail */}
        <Arrow from={[0, 0]} to={vA} color="#6366f1" label="A⃗" cx={CR} />
        <Arrow from={[0, 0]} to={vB} color="#f59e0b" label="B⃗" cx={CR} />
        {/* A⃗−B⃗ arrow FROM tip of B to tip of A */}
        <Arrow from={vB} to={vA} color="#10b981" w={3.2} label="A⃗−B⃗" lox={10} loy={-10} cx={CR} />

        {/* Drag handles */}
        {[["A", vA, "#6366f1", CL], ["A2", vA, "#6366f1", CR], ["B", vB, "#f59e0b", CL], ["B2", vB, "#f59e0b", CR]].map(([id, v, c, cx]) => {
          const [hx, hy] = ts(v[0], v[1], cx);
          const baseId = id.replace("2", "");
          return (
            <circle key={id} cx={hx} cy={hy} r={7} fill={c} stroke="#0f172a" strokeWidth={2}
              style={{ cursor: "grab" }}
              onMouseDown={() => setDragging(baseId)}
              onTouchStart={() => setDragging(baseId)} />
          );
        })}
      </svg>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
        {[
          { label: "A⃗", val: `(${vA[0].toFixed(1)}, ${vA[1].toFixed(1)})`, color: "#6366f1" },
          { label: "B⃗", val: `(${vB[0].toFixed(1)}, ${vB[1].toFixed(1)})`, color: "#f59e0b" },
          { label: "A⃗−B⃗", val: `${magDiff} @ ${thetaDiff}°`, color: "#10b981" },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "9px 12px" }}>
            <div style={{ fontSize: 11, color: "#64748b" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569" }}>
        Drag A⃗ or B⃗. Both diagrams update together — same result, different constructions.
      </div>
    </div>
  );
}
