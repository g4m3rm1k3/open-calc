// KinematicsDefinitionIntuition.jsx — Ch2 L1 Pillar 1
import { useState, useRef, useCallback } from "react";

const W = 500, H = 200, Y_LINE = 130, X0 = 50, X1 = 450;
const SCALE = (X1 - X0) / 20; // pixels per metre, range −10 to +10

function posToX(pos) { return X0 + (pos + 10) * SCALE; }
function xToPos(x) { return (x - X0) / SCALE - 10; }

export default function KinematicsDefinitionIntuition({ params = {} }) {
  const svgRef = useRef(null);
  const [startPos, setStartPos] = useState(-5);
  const [history, setHistory] = useState([{ pos: -5, dir: 1 }]);
  const [dragging, setDragging] = useState(null);

  const currentPos = history[history.length - 1].pos;
  const displacement = currentPos - startPos;
  const distance = history.reduce((sum, step, i) => {
    if (i === 0) return 0;
    return sum + Math.abs(step.pos - history[i - 1].pos);
  }, 0);

  const getX = useCallback((e) => {
    const r = svgRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(-10, Math.min(10, xToPos((cx - r.left) * (W / r.width))));
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const pos = Math.round(getX(e) * 2) / 2;
    if (dragging === "start") {
      setStartPos(pos);
      setHistory([{ pos }]);
    } else if (dragging === "current") {
      setHistory(h => {
        const prev = h[h.length - 1].pos;
        if (Math.abs(pos - prev) > 0.4) return [...h, { pos }];
        return h;
      });
    }
  }, [dragging, getX]);

  const sx = posToX(startPos), cx2 = posToX(currentPos);
  const dispColor = displacement >= 0 ? "#6366f1" : "#f43f5e";

  return (
    <div style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 700, letterSpacing: "0.08em" }}>PILLAR 1 · DISPLACEMENT vs DISTANCE</span>
        <button onClick={() => { setHistory([{ pos: startPos }]); }} style={{ background: "#1e293b", color: "#64748b", border: "1px solid #334155", borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
          Reset path
        </button>
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", cursor: dragging ? "grabbing" : "default" }}
        onMouseMove={onMove} onMouseUp={() => setDragging(null)} onMouseLeave={() => setDragging(null)}
        onTouchMove={onMove} onTouchEnd={() => setDragging(null)}>

        {/* Number line */}
        <line x1={X0} y1={Y_LINE} x2={X1} y2={Y_LINE} stroke="#334155" strokeWidth={2} />
        {Array.from({ length: 21 }, (_, i) => i - 10).map(n => {
          const tx = posToX(n);
          return (
            <g key={n}>
              <line x1={tx} y1={Y_LINE - 6} x2={tx} y2={Y_LINE + 6} stroke="#334155" strokeWidth={n === 0 ? 2 : 1} />
              <text x={tx} y={Y_LINE + 18} fill="#475569" fontSize={9} textAnchor="middle">{n}</text>
            </g>
          );
        })}
        <text x={(X0 + X1) / 2} y={H - 8} fill="#475569" fontSize={10} textAnchor="middle">position (m)</text>

        {/* Path trace */}
        {history.length > 1 && history.map((step, i) => {
          if (i === 0) return null;
          const x1 = posToX(history[i - 1].pos), x2b = posToX(step.pos);
          return <line key={i} x1={x1} y1={Y_LINE - 20} x2={x2b} y2={Y_LINE - 20} stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" opacity={0.6} />;
        })}

        {/* Displacement arrow */}
        {Math.abs(displacement) > 0.3 && (() => {
          const arrowY = Y_LINE - 40;
          const dx2 = cx2 - sx, len = Math.abs(dx2);
          const ux = dx2 / Math.max(len, 1);
          const ex = cx2 - ux * 10;
          return (
            <g>
              <line x1={sx} y1={arrowY} x2={ex} y2={arrowY} stroke={dispColor} strokeWidth={2.5} />
              <polygon points={`${cx2},${arrowY} ${ex + (ux > 0 ? -1 : 1) * 5},${arrowY - 5} ${ex + (ux > 0 ? -1 : 1) * 5},${arrowY + 5}`} fill={dispColor} />
              <text x={(sx + cx2) / 2} y={arrowY - 8} fill={dispColor} fontSize={11} fontWeight="700" textAnchor="middle">Δx = {displacement.toFixed(1)} m</text>
            </g>
          );
        })()}

        {/* Start marker */}
        <circle cx={sx} cy={Y_LINE} r={8} fill="#10b981" stroke="#0f172a" strokeWidth={2}
          style={{ cursor: "grab" }}
          onMouseDown={() => setDragging("start")} onTouchStart={() => setDragging("start")} />
        <text x={sx} y={Y_LINE - 14} fill="#10b981" fontSize={10} textAnchor="middle">start</text>

        {/* Current position marker */}
        <circle cx={cx2} cy={Y_LINE} r={10} fill="#6366f1" stroke="#e0e7ff" strokeWidth={2}
          style={{ cursor: "grab" }}
          onMouseDown={() => setDragging("current")} onTouchStart={() => setDragging("current")} />
        <text x={cx2} y={Y_LINE - 14} fill="#818cf8" fontSize={10} textAnchor="middle">now</text>
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "0 20px 20px" }}>
        {[
          { label: "Displacement Δx", val: displacement.toFixed(2) + " m", color: dispColor, note: "signed — net change" },
          { label: "Distance", val: distance.toFixed(2) + " m", color: "#f59e0b", note: "always ≥ |Δx|" },
          { label: "Start → Now", val: `${startPos.toFixed(1)} → ${currentPos.toFixed(1)} m`, color: "#94a3b8", note: "positions" },
        ].map(({ label, val, color, note }) => (
          <div key={label} style={{ background: "#1e293b", borderRadius: 8, padding: "9px 12px" }}>
            <div style={{ fontSize: 10, color: "#64748b" }}>{note}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "0 20px 14px", fontSize: 12, color: "#475569" }}>
        Drag the green dot to set start. Drag the purple dot to move — the path accumulates. Reverse direction to see distance &gt; |displacement|.
      </div>
    </div>
  );
}
