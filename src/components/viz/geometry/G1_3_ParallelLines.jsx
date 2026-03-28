import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel, 
  mkHdr, 
  mkBody, 
  mkInsight, 
  mkBadge, 
  mkHook, 
  mkSeed, 
  mkMbox
} from "./GeometryHelpers.jsx";

function ParallelCanvas({ transAngle, highlight }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const col = isDark ? "#e2e8f0" : "#1e293b";
    const muted = isDark ? "#6b7280" : "#94a3b8";
    const rad = (transAngle * Math.PI) / 180;
    const y1 = 70, y2 = 180;
    // parallel lines
    ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(40, y1); ctx.lineTo(W - 40, y1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, y2); ctx.lineTo(W - 40, y2); ctx.stroke();
    // transversal
    const tx = W / 2;
    const dy1 = Math.tan(rad) * (tx - 40), dy2 = Math.tan(rad) * (tx - 40);
    ctx.beginPath(); ctx.moveTo(tx - 160, y1 - 160 * Math.tan(rad)); ctx.lineTo(tx + 160, y1 + 160 * Math.tan(rad));
    ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2; ctx.stroke();
    // angles at intersection 1 (top)
    const a = transAngle;
    const highlightColor = { corr: "#059669", alt: "#d97706", coint: "#dc2626" }[highlight] || "#4f46e5";
    // label the 8 angles
    const pts = [
      { cx: tx, cy: y1, angles: [a, 180 - a, 180 + a, 360 - a] },
      { cx: tx, cy: y2, angles: [a, 180 - a, 180 + a, 360 - a] },
    ];
    pts.forEach(({ cx, cy, angles }) => {
      angles.forEach((ang, i) => {
        const mid = ((ang + (angles[i + 1] || 360)) / 2) * Math.PI / 180;
        ctx.fillStyle = muted; ctx.font = "11px var(--font-sans,sans-serif)"; ctx.textAlign = "center";
        ctx.fillText(ang.toFixed(0) + "°", cx + 32 * Math.cos(mid), cy + 32 * Math.sin(mid) + 4);
      });
    });
    ctx.fillStyle = col; ctx.font = "12px var(--font-sans,sans-serif)"; ctx.textAlign = "left";
    ctx.fillText("l₁", 12, y1 + 4);
    ctx.fillText("l₂", 12, y2 + 4);
    const notes = { corr: "Corresponding angles equal (F-shape)", alt: "Alternate interior angles equal (Z-shape)", coint: "Co-interior angles sum to 180° (C-shape)" };
    if (highlight && notes[highlight]) {
      ctx.fillStyle = highlightColor; ctx.textAlign = "center";
      ctx.fillText(notes[highlight], W / 2, H - 10);
    }
  }, [transAngle, highlight]);
  return <canvas ref={ref} width={520} height={230} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function G1_3_ParallelLines({ params = {} }) {
  const [transAngle, setTransAngle] = useState(55);
  const [highlight, setHighlight] = useState("corr");
  const ready = useMath();
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {mkBadge(3)}
      {mkHook("Mic is checking whether two walls at the workshop are truly parallel. Albert draws a line crossing both — a transversal — and explains that parallel lines create three distinct angle relationships at the crossings. Recognising the pattern is faster than measuring every angle.")}
      <div style={mkPanel}>
        {mkHdr("Story", { background: "#ede9fe", color: "#4f46e5" }, "Parallel lines and transversals")}
        <div style={{ ...mkBody, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"If the walls are parallel,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said, drawing a diagonal, <em style={{ color: "var(--color-text-secondary)" }}>"then this crossing line creates the same angle at both walls. Measure one angle — you know them all."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> counted the angles. <em style={{ color: "var(--color-text-secondary)" }}>"There are eight of them."</em> <em style={{ color: "var(--color-text-secondary)" }}>"But only two distinct values. And they're related in three ways — corresponding, alternate, and co-interior. Each relationship is a theorem, not a coincidence."</em></p>
        </div>
      </div>
      <div style={mkPanel}>
        {mkHdr("Discovery", { background: "#ede9fe", color: "#4f46e5" }, "Three angle relationships from one transversal")}
        <div style={mkBody}>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 12 }}><ParallelCanvas transAngle={transAngle} highlight={highlight} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Transversal angle</span>
            <input type="range" min={15} max={165} value={transAngle} step={1} onChange={e => setTransAngle(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 180 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 30 }}>{transAngle}°</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[["corr", "Corresponding (F)", "#059669"], ["alt", "Alternate interior (Z)", "#d97706"], ["coint", "Co-interior (C)", "#dc2626"]].map(([key, label, col]) => (
              <button key={key} onClick={() => setHighlight(key)} style={{ flex: 1, padding: "6px 8px", borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", border: `1px solid ${highlight === key ? col : "var(--color-border-tertiary)"}`, background: highlight === key ? col + "22" : "transparent", color: highlight === key ? col : "var(--color-text-secondary)" }}>{label}</button>
            ))}
          </div>
          {ready && <div style={mkMbox}><M t={`\\text{Corresponding: } \\alpha = \\alpha \\quad\\text{Alternate interior: } \\alpha = \\alpha \\quad\\text{Co-interior: } \\alpha + (180°-\\alpha) = 180°`} display ready={ready} /></div>}
          <div style={mkInsight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>All three follow from the Parallel Postulate (P5).</strong> If the lines weren't parallel, these relationships would break — the corresponding angles would differ. Conversely, if you find that corresponding angles are equal, you've proved the lines are parallel. The angle test IS the parallelism test.</div>
          <WhyPanel tag="How do we prove alternate interior angles are equal — from what?" depth={0}>
            <p style={{ marginBottom: 8 }}>1. The transversal creates angle α at line l₁ and angle β at line l₂. 2. By the Parallel Postulate (P5), corresponding angles are equal: the angle above l₁ equals the angle above l₂. 3. Vertical angles are equal (Ch 1.2 proof). 4. Combining: alternate interior angles equal corresponding angles — and corresponding angles are equal — so alternate interior angles are equal. It's a chain of three previously proved results.</p>
          </WhyPanel>
        </div>
      </div>
      {mkSeed(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic bets John that no matter what triangle he draws, the three angles will always sum to exactly 180°. John draws a very flat triangle, a very pointy triangle, a right triangle. They all sum to 180°. Albert proves why using one parallel line. Chapter 4: <em>The Triangle Angle Sum.</em></>)}
    </div>
  );
}
