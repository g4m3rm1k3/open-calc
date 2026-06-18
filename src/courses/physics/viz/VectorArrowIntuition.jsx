import { useState, useRef, useCallback, useEffect } from "react";

const W = 500, H = 400, CX = 250, CY = 200;

function toScreen(x, y) {
  return [CX + x * 60, CY - y * 60];
}
function fromScreen(sx, sy) {
  return [(sx - CX) / 60, (CY - sy) / 60];
}
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

const COLORS = {
  arrow: "#6366f1",
  arrowGlow: "#818cf8",
  freeArrow: "#10b981",
  axis: "#334155",
  grid: "#1e293b",
  label: "#94a3b8",
  labelBright: "#e2e8f0",
  panel: "#0f172a",
  panelBorder: "#1e293b",
  badge: "#1e293b",
  badgeText: "#6366f1",
};

function Arrow({ from, to, color, opacity = 1, dashed = false }) {
  const [fx, fy] = toScreen(from[0], from[1]);
  const [tx, ty] = toScreen(to[0], to[1]);
  const dx = tx - fx, dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;
  const ux = dx / len, uy = dy / len;
  const headLen = 12;
  const hx = tx - ux * headLen, hy = ty - uy * headLen;
  const perp = [-uy * 5, ux * 5];
  return (
    <g opacity={opacity}>
      <line
        x1={fx} y1={fy} x2={hx} y2={hy}
        stroke={color} strokeWidth={2.5}
        strokeDasharray={dashed ? "6 4" : "none"}
        strokeLinecap="round"
      />
      <polygon
        points={`${tx},${ty} ${hx + perp[0]},${hy + perp[1]} ${hx - perp[0]},${hy - perp[1]}`}
        fill={color}
      />
    </g>
  );
}

function ArcAngle({ cx, cy, r, from, to, color }) {
  const [sx, sy] = toScreen(cx, cy);
  const a1 = -from * (Math.PI / 180);
  const a2 = -to * (Math.PI / 180);
  const x1 = sx + r * Math.cos(a2), y1 = sy + r * Math.sin(a2);
  const x2 = sx + r * Math.cos(a1), y2 = sy + r * Math.sin(a1);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  return (
    <path
      d={`M ${sx + r * Math.cos(Math.min(a1, a2))},${sy + r * Math.sin(Math.min(a1, a2))} A ${r} ${r} 0 ${large} 1 ${x1},${y1}`}
      fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 3"
    />
  );
}

export default function VectorArrowIntuition({ params = {} }) {
  const svgRef = useRef(null);
  const [head, setHead] = useState([3, 2]);
  const [tail, setTail] = useState([0, 0]);
  const [dragging, setDragging] = useState(null);
  const [showFree, setShowFree] = useState(false);
  const [pulse, setPulse] = useState(false);

  const mag = Math.sqrt(head[0] ** 2 + head[1] ** 2);
  const vec = [head[0] - tail[0], head[1] - tail[1]];
  const vecMag = Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
  const angleDeg = (Math.atan2(vec[1], vec[0]) * 180 / Math.PI).toFixed(1);
  const magDisplay = vecMag.toFixed(2);

  const getSVGPoint = useCallback((e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = W / rect.width, scaleY = H / rect.height;
    return fromScreen((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  }, []);

  const onMouseDown = useCallback((target) => (e) => {
    e.preventDefault();
    setDragging(target);
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const [mx, my] = getSVGPoint(e);
    const cx = clamp(mx, -3.8, 3.8), cy = clamp(my, -2.8, 2.8);
    if (dragging === "head") setHead([cx, cy]);
    if (dragging === "tail") {
      const dx = cx - tail[0], dy = cy - tail[1];
      setTail([cx, cy]);
      setHead([h => h[0] + dx, h => h[1] + dy]);
      setHead(prev => [clamp(prev[0] + (cx - tail[0]), -3.8, 3.8), clamp(prev[1] + (cy - tail[1]), -2.8, 2.8)]);
    }
  }, [dragging, tail, getSVGPoint]);

  const onUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [head, tail]);

  // Grid lines
  const gridLines = [];
  for (let i = -4; i <= 4; i++) {
    const [x1, y1] = toScreen(i, -3.5), [x2, y2] = toScreen(i, 3.5);
    const [x3, y3] = toScreen(-4, i * (H / W)), [x4, y4] = toScreen(4, i * (H / W));
    gridLines.push(<line key={`v${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.grid} strokeWidth={0.5} />);
    gridLines.push(<line key={`h${i}`} x1={x3} y1={y3} x2={x4} y2={y4} stroke={COLORS.grid} strokeWidth={0.5} />);
  }

  const [tx, ty] = toScreen(tail[0], tail[1]);
  const [hx, hy] = toScreen(head[0], head[1]);
  const [ox, oy] = toScreen(0, 0);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0f172a", borderRadius: 16, padding: 0, overflow: "hidden", userSelect: "none" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pillar 1 · Intuition</span>
        <button
          onClick={() => setShowFree(f => !f)}
          style={{
            background: showFree ? "#6366f1" : "#1e293b",
            color: showFree ? "#fff" : "#94a3b8",
            border: "none", borderRadius: 8, padding: "5px 12px",
            fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
          }}>
          {showFree ? "Free vector ON" : "Show free vector"}
        </button>
      </div>

      {/* SVG canvas */}
      <svg
        ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", cursor: dragging ? "grabbing" : "default" }}
        onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchMove={onMove} onTouchEnd={onUp}
      >
        {/* Grid */}
        {gridLines}

        {/* Axes */}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke={COLORS.axis} strokeWidth={1} />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke={COLORS.axis} strokeWidth={1} />
        <text x={W - 8} y={oy - 8} fill={COLORS.label} fontSize={12} textAnchor="end">x</text>
        <text x={ox + 8} y={12} fill={COLORS.label} fontSize={12}>y</text>

        {/* Angle arc */}
        {vecMag > 0.3 && (
          <>
            <ArcAngle cx={tail[0]} cy={tail[1]} r={28} from={0} to={parseFloat(angleDeg)} color="#6366f1" />
            <text
              x={tx + 36 * Math.cos((parseFloat(angleDeg) / 2) * Math.PI / 180)}
              y={ty - 36 * Math.sin((parseFloat(angleDeg) / 2) * Math.PI / 180)}
              fill="#818cf8" fontSize={11} textAnchor="middle">θ</text>
          </>
        )}

        {/* Free vector copy (same direction/magnitude, different position) */}
        {showFree && (
          <Arrow
            from={[tail[0] - 1.5, tail[1] - 1.2]}
            to={[tail[0] - 1.5 + vec[0], tail[1] - 1.2 + vec[1]]}
            color={COLORS.freeArrow} opacity={0.7} dashed
          />
        )}
        {showFree && (
          <text
            x={toScreen(tail[0] - 1.5 + vec[0] / 2, tail[1] - 1.2 + vec[1] / 2)[0]}
            y={toScreen(tail[0] - 1.5 + vec[0] / 2, tail[1] - 1.2 + vec[1] / 2)[1] - 10}
            fill={COLORS.freeArrow} fontSize={11} textAnchor="middle" fontStyle="italic">same vector</text>
        )}

        {/* Main arrow */}
        <Arrow from={[tail[0], tail[1]]} to={[head[0], head[1]]} color={COLORS.arrow} />

        {/* Glow ring on head */}
        <circle cx={hx} cy={hy} r={pulse ? 14 : 10}
          fill="none" stroke={COLORS.arrowGlow}
          strokeWidth={pulse ? 2 : 1.5}
          opacity={pulse ? 0.5 : 0.3}
          style={{ transition: "all 0.3s ease" }} />

        {/* Draggable head */}
        <circle cx={hx} cy={hy} r={8} fill={COLORS.arrow} stroke="#e0e7ff" strokeWidth={2}
          style={{ cursor: "grab" }}
          onMouseDown={onMouseDown("head")}
          onTouchStart={onMouseDown("head")} />

        {/* Draggable tail */}
        <circle cx={tx} cy={ty} r={6} fill="#334155" stroke="#6366f1" strokeWidth={1.5}
          style={{ cursor: "grab" }}
          onMouseDown={onMouseDown("tail")}
          onTouchStart={onMouseDown("tail")} />

        {/* Labels */}
        <text x={hx + 10} y={hy - 10} fill={COLORS.labelBright} fontSize={13} fontWeight="600">A⃗</text>
        <text x={tx - 14} y={ty + 4} fill={COLORS.label} fontSize={11}>tail</text>
      </svg>

      {/* Stats panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "0 20px 20px" }}>
        {[
          { label: "Magnitude |A⃗|", value: magDisplay, unit: "units" },
          { label: "Angle θ", value: angleDeg + "°", unit: "from +x" },
          { label: "Components", value: `(${vec[0].toFixed(1)}, ${vec[1].toFixed(1)})`, unit: "Ax, Ay" },
        ].map(({ label, value, unit }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{value}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{unit}</div>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div style={{ padding: "0 20px 16px", fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
        {showFree
          ? "The dashed green arrow is the same vector — same length, same direction, different position. Position doesn't matter."
          : "Drag the arrowhead to change the vector. Drag the tail dot to translate it (free vector rule)."}
      </div>
    </div>
  );
}
