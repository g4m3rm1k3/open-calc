import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  WhyPanel, 
  mkPanel, 
  mkHdr, 
  mkBody, 
  mkInsight, 
  mkBadge, 
  mkHook, 
  mkSeed, 
  StepBlock 
} from "./GeometryHelpers.jsx";

function TriangleSumCanvas({ ax, ay, bx, by, cx, cy }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const col = isDark ? "#e2e8f0" : "#1e293b";
    const A = [ax, ay], B = [bx, by], C = [cx, cy];
    const ang = (p1, v, p2) => {
      const v1 = [p1[0] - v[0], p1[1] - v[1]], v2 = [p2[0] - v[0], p2[1] - v[1]];
      const dot = v1[0] * v2[0] + v1[1] * v2[1];
      const m1 = Math.hypot(...v1), m2 = Math.hypot(...v2);
      return (Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * 180 / Math.PI).toFixed(1);
    };
    const aA = parseFloat(ang(B, A, C)), aB = parseFloat(ang(A, B, C)), aC = parseFloat(ang(A, C, B));
    ctx.beginPath(); ctx.moveTo(...A); ctx.lineTo(...B); ctx.lineTo(...C); ctx.closePath();
    ctx.fillStyle = isDark ? "rgba(79,70,229,0.15)" : "rgba(79,70,229,0.1)"; ctx.fill();
    ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2; ctx.stroke();
    // parallel line through C
    const dx = B[0] - A[0], dy = B[1] - A[1];
    ctx.beginPath(); ctx.moveTo(C[0] - dx, C[1] - dy); ctx.lineTo(C[0] + dx, C[1] + dy);
    ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = col; ctx.font = "12px var(--font-sans,sans-serif)"; ctx.textAlign = "center";
    ctx.fillText(`∠A=${aA}°`, A[0] - 20, A[1] + 16);
    ctx.fillText(`∠B=${aB}°`, B[0] + 24, B[1] + 16);
    ctx.fillText(`∠C=${aC}°`, C[0], C[1] - 14);
    ctx.fillStyle = "#059669"; ctx.font = "bold 12px var(--font-sans,sans-serif)";
    ctx.fillText(`∠A + ∠B + ∠C = ${(aA + aB + aC).toFixed(1)}°`, W / 2, H - 10);
  }, [ax, ay, bx, by, cx, cy]);
  return <canvas ref={ref} width={520} height={240} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function G1_4_TriangleAngleSum({ params = {} }) {
  const [cx, setCx] = useState(260);
  const [cy, setCy] = useState(60);
  const ready = useMath();
  const ax = 80, ay = 200, bx = 440, by = 200;
  const steps = [
    { label: "Draw line l through C parallel to AB", tex: "l \\parallel AB", note: "By P5, exactly one such line exists." },
    { label: "Alternate interior angles: ∠CAl = ∠A", tex: "\\angle CAl = \\angle A \\quad (\\text{AB} \\parallel l, \\text{ alternate interior})", note: "From Chapter 3: when a transversal (AC) crosses parallel lines (AB and l), alternate interior angles are equal." },
    { label: "Alternate interior angles: ∠CBl = ∠B", tex: "\\angle CBl = \\angle B \\quad (\\text{AB} \\parallel l, \\text{ alternate interior})", note: "Same reasoning with transversal BC." },
    { label: "Angles at C on the parallel line sum to 180°", tex: "\\angle CAl + \\angle ACB + \\angle CBl = 180°", note: "These three angles together make a straight line at C." },
    { label: "Substitute: ∠A + ∠C + ∠B = 180°", tex: "\\angle A + \\angle B + \\angle C = 180° \\quad \\checkmark", note: "QED. The triangle angle sum is a theorem — proved from the parallel postulate." },
  ];
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {mkBadge(4)}
      {mkHook("No matter what triangle Mic draws — obtuse, right, acute, flat, pointy — the three angles always sum to 180°. He's measured hundreds. Albert says measuring isn't enough: a proof shows why it's always true and cannot be otherwise.")}
      <div style={mkPanel}>
        {mkHdr("Story", { background: "#ede9fe", color: "#4f46e5" }, "The triangle angle sum")}
        <div style={{ ...mkBody, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had measured 47 triangles and every one summed to 180°. <em style={{ color: "var(--color-text-secondary)" }}>"I'm confident."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> shook his head. <em style={{ color: "var(--color-text-secondary)" }}>"Measurement is evidence. Proof is certainty. Draw any triangle. I'll show you why it's 180° — using one parallel line and the result from last chapter."</em></p>
        </div>
      </div>
      <div style={mkPanel}>
        {mkHdr("Discovery", { background: "#ede9fe", color: "#4f46e5" }, "Proved from the parallel postulate — drag the apex")}
        <div style={mkBody}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 12 }}>Drag the top vertex left and right. The angles change — but their sum is always exactly 180°. The orange dashed line is the key to the proof.</p>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 12 }}><TriangleSumCanvas ax={ax} ay={ay} bx={bx} by={by} cx={cx} cy={cy} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Apex position</span>
            <input type="range" min={100} max={420} value={cx} step={1} onChange={e => setCx(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 200 }} />
          </div>
          {steps.map((s, i) => <StepBlock key={i} num={i + 1} label={s.label} tex={s.tex} note={s.note} ready={ready} />)}
          <div style={mkInsight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>The hidden assumption:</strong> This proof uses the Parallel Postulate (P5). On a sphere (non-Euclidean geometry), the angle sum of a triangle is always MORE than 180°. On a saddle surface, it's always LESS. The 180° fact is specific to flat, Euclidean space.</div>
          <WhyPanel tag="What's the angle sum of a polygon with n sides?" depth={0}>
            <p style={{ marginBottom: 8 }}>Any n-gon can be divided into (n−2) triangles. Each triangle contributes 180°. Total: (n−2) × 180°. Quadrilateral (n=4): 360°. Pentagon (n=5): 540°. Hexagon (n=6): 720°. Regular polygon interior angle: (n−2)×180°/n.</p>
          </WhyPanel>
        </div>
      </div>
      {mkSeed(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic needs to know when two triangles are exactly the same shape and size — for cutting matching boat parts. Albert explains that you don't need all six measurements. Three are enough, if you choose the right three. Chapter 5: <em>Congruence.</em></>)}
    </div>
  );
}
