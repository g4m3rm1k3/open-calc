import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel as GP, 
  mkHdr as GH, 
  mkBody as GB, 
  mkInsight as GI, 
  mkBadge as GBG, 
  mkHook as GHK, 
  mkSeed as GSD, 
  mkMbox as GMB
} from "./GeometryHelpers.jsx";

function CoordCanvas({ x1, y1, x2, y2 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const col = isDark ? "#e2e8f0" : "#1e293b";
    const muted = isDark ? "#374151" : "#e5e7eb";
    const sc = 35, ox = W / 2, oy = H / 2;
    for (let i = -6; i <= 6; i++) {
      ctx.strokeStyle = muted; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(ox + i * sc, 10); ctx.lineTo(ox + i * sc, H - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, oy + i * sc); ctx.lineTo(W - 10, oy + i * sc); ctx.stroke();
    }
    ctx.strokeStyle = isDark ? "#6b7280" : "#94a3b8"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, oy); ctx.lineTo(W - 10, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, 10); ctx.lineTo(ox, H - 10); ctx.stroke();
    const px1 = ox + x1 * sc, py1 = oy - y1 * sc, px2 = ox + x2 * sc, py2 = oy - y2 * sc;
    ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py1); ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px2, py1); ctx.lineTo(px2, py2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 2; ctx.stroke();
    [[px1, py1, `(${x1},${y1})`], [px2, py2, `(${x2},${y2})`]].forEach(([px, py, label]) => {
      ctx.beginPath(); ctx.arc(px, py, 5, 0, 2 * Math.PI); ctx.fillStyle = "#0891b2"; ctx.fill();
      ctx.fillStyle = col; ctx.font = "12px var(--font-sans,sans-serif)"; ctx.textAlign = "left";
      ctx.fillText(label, px + 8, py - 6);
    });
    const mx = (px1 + px2) / 2, my = (py1 + py2) / 2;
    ctx.beginPath(); ctx.arc(mx, my, 4, 0, 2 * Math.PI); ctx.fillStyle = "#059669"; ctx.fill();
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.hypot(dx, dy).toFixed(3);
    ctx.fillStyle = "#0891b2"; ctx.font = "11px var(--font-sans,sans-serif)"; ctx.textAlign = "center";
    ctx.fillText(`d = √(${dx}²+${dy}²) = ${dist}`, W / 2, H - 12);
    ctx.fillStyle = "#d97706"; ctx.textAlign = "left";
    ctx.fillText(`Δx=${dx}`, (px1 + px2) / 2, py1 + 16);
    ctx.fillText(`Δy=${dy}`, px2 + 6, (py1 + py2) / 2);
  }, [x1, y1, x2, y2]);
  return <canvas ref={ref} width={500} height={280} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function G3_1_CoordinatePlane({ params = {} }) {
  const [x1, setX1] = useState(1); const [y1, setY1] = useState(2);
  const [x2, setX2] = useState(5); const [y2, setY2] = useState(5);
  const ready = useMath();
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {GBG(1)}
      {GHK("Mic is designing the harbor extension on a coordinate grid. He needs to find exact distances between dock posts and the midpoint of each beam. Albert shows him that the distance formula is just the Pythagorean theorem in disguise — and placing geometry on a grid connects every shape to an algebraic equation.")}
      <div style={GP}>
        {GH("Story", { background: "#ecfeff", color: "#155e75" }, "The coordinate plane")}
        <div style={{ ...GB, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had the dock plan on graph paper. <em style={{ color: "var(--color-text-secondary)" }}>"How far is post A from post B?"</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> pointed to the grid. <em style={{ color: "var(--color-text-secondary)" }}>"Draw the horizontal and vertical distances between them. You've made a right triangle. The distance is the hypotenuse — Pythagoras."</em> Mic stared. <em style={{ color: "var(--color-text-secondary)" }}>"That's the distance formula?"</em> <em style={{ color: "var(--color-text-secondary)" }}>"That IS the distance formula."</em></p>
        </div>
      </div>
      <div style={GP}>
        {GH("Discovery", { background: "#ecfeff", color: "#155e75" }, "Distance = Pythagoras on a grid")}
        <div style={GB}>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 12 }}><CoordCanvas x1={x1} y1={y1} x2={x2} y2={y2} /></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {[["x₁", x1, -5, 5, setX1], ["y₁", y1, -5, 5, setY1], ["x₂", x2, -5, 5, setX2], ["y₂", y2, -5, 5, setY2]].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 110 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 20 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 16 }}>{val}</span>
              </div>
            ))}
          </div>
          {ready && <div style={GMB}><M t={`d = \\sqrt{(x_2-x_1)^2+(y_2-y_1)^2} = \\sqrt{${x2-x1}^2+${y2-y1}^2} = ${dist.toFixed(3)}`} display ready={ready} /></div>}
          {ready && <div style={GMB}><M t={`\\text{Midpoint} = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right) = \\left(${mx},\\, ${my}\\right)`} display ready={ready} /></div>}
          <div style={GI()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Descartes' insight (1637):</strong> Every point in the plane has coordinates (x,y). Every geometric object is a set of points satisfying an equation. Every equation defines a geometric object. This bridge — analytic geometry — made calculus possible by turning curves into equations that could be differentiated.</div>
          <WhyPanel tag="Why does the midpoint formula work?" depth={0}>
            <p>The midpoint is equidistant from both endpoints along each axis. For x: midpoint x-coordinate = x₁ + ½(x₂−x₁) = (x₁+x₂)/2. Same for y. Number check: midpoint of (2,3) and (8,7) = (5,5). Distance from (2,3) to (5,5) = √(9+4) = √13. Distance from (5,5) to (8,7) = √(9+4) = √13. Equal ✓.</p>
          </WhyPanel>
        </div>
      </div>
      {GSD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic needs to lay dock beams that are parallel to each other and perpendicular to the shore. Albert shows that parallelism and perpendicularity have exact algebraic conditions in slope — conditions that come from the geometry of similar triangles. Chapter 2: <em>Lines in the Plane.</em></>)}
    </div>
  );
}
