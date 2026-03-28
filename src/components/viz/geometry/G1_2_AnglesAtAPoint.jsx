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

function AngleCanvas({ angleDeg }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const cx = W / 2, cy = H / 2;
    const r = 140;
    const a1 = (angleDeg * Math.PI) / 180;
    const dirs = [0, a1, Math.PI, Math.PI + a1];
    const colors = ["#4f46e5", "#0891b2", "#4f46e5", "#0891b2"];
    const labels = ["α", "β", "α", "β"];
    const col = isDark ? "#e2e8f0" : "#1e293b";
    dirs.forEach((d, i) => {
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r * Math.cos(d), cy + r * Math.sin(d));
      ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    });
    [[0, a1], [a1, Math.PI], [Math.PI, Math.PI + a1], [Math.PI + a1, 2 * Math.PI]].forEach(([start, end], i) => {
      const mid = (start + end) / 2;
      const ra = 40;
      ctx.beginPath(); ctx.arc(cx, cy, ra, start, end);
      ctx.strokeStyle = colors[i]; ctx.lineWidth = 1.5; ctx.stroke();
      const lx = cx + (ra + 18) * Math.cos(mid), ly = cy + (ra + 18) * Math.sin(mid);
      ctx.fillStyle = colors[i]; ctx.font = "bold 13px var(--font-sans,sans-serif)"; ctx.textAlign = "center";
      ctx.fillText(labels[i], lx, ly + 4);
    });
    const alpha = angleDeg.toFixed(0), beta = (180 - angleDeg).toFixed(0);
    ctx.fillStyle = col; ctx.font = "12px var(--font-sans,sans-serif)"; ctx.textAlign = "center";
    ctx.fillText(`α = ${alpha}°   β = ${beta}°   vertical angles equal   α + β = 180°`, cx, H - 12);
  }, [angleDeg]);
  return <canvas ref={ref} width={500} height={240} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function G1_2_AnglesAtAPoint({ params = {} }) {
  const [angle, setAngle] = useState(55);
  const ready = useMath();
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {mkBadge(2)}
      {mkHook("John looks at two crossing lines and says vertical angles are obviously equal. Albert says 'obviously' is not a proof. Mic agrees with Albert. They have to derive the equality from the postulates — and find it takes only two steps.")}
      <div style={mkPanel}>
        {mkHdr("Story", { background: "#ede9fe", color: "#4f46e5" }, "The angles at a point")}
        <div style={{ ...mkBody, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> drew two intersecting lines. <em style={{ color: "var(--color-text-secondary)" }}>"Obviously the opposite angles are the same. Look at them."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> didn't look. <em style={{ color: "var(--color-text-secondary)" }}>"Obviously is not a proof. Prove it from the postulates."</em> John picked up a pen. Two steps later, he had proved it — and found himself slightly surprised that two steps was all it took.</p>
        </div>
      </div>
      <div style={mkPanel}>
        {mkHdr("Discovery", { background: "#ede9fe", color: "#4f46e5" }, "Vertical angles are equal — proved in two steps")}
        <div style={mkBody}>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 14 }}><AngleCanvas angleDeg={angle} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Angle α</span>
            <input type="range" min={10} max={170} value={angle} step={1} onChange={e => setAngle(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 30 }}>{angle}°</span>
          </div>
          <StepBlock num={1} label="α + β = 180° (angles on a straight line)" tex="\\alpha + \\beta = 180° \\quad \\text{(linear pair — one side of a line)}" note="A straight line is 180°. When two rays meet at a point, they split one side into α and β. Their sum must be 180°." ready={ready} />
          <StepBlock num={2} label="α + β = 180° again (the other side)" tex="\\beta + \\alpha = 180° \\quad \\text{(same reasoning, other side)}" note="The same line gives the same constraint on the other side. Both pairs sum to 180°." ready={ready} />
          <StepBlock num={3} label="Subtract β from both equations" tex="\\alpha = 180° - \\beta = \\alpha \\quad \\therefore \\text{ vertical angles equal} \\checkmark" note="Both α values equal 180° − β. So they equal each other. QED — a two-line proof from one fact about straight lines." ready={ready} />
          <div style={mkInsight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>The proof structure:</strong> We didn't measure anything. We applied one fact (angles on a line = 180°) twice to the same intersection and used algebra. That's all Euclidean proof is — applying known facts to new situations via logic.</div>
          <WhyPanel tag="Why do angles on a straight line sum to 180°?" depth={0}>
            <p style={{ marginBottom: 8 }}>A straight line defines a half-plane on each side. By P4 (all right angles are equal) and the definition of a right angle as 90°, a straight angle (one half-turn) is exactly 2 × 90° = 180°. This is a consequence of the postulates, not an independent assumption.</p>
            <WhyPanel tag="And why are right angles exactly 90°?" depth={1}>
              <p>A right angle is defined as the angle formed when a line meets itself perpendicularly — i.e. when the two angles on each side of the perpendicular are equal. If both equal angles sum to 180°, each must be 90°. The number 90 comes from the Babylonian convention of dividing a circle into 360 parts. In radians, a right angle is π/2.</p>
            </WhyPanel>
          </WhyPanel>
        </div>
      </div>
      {mkSeed(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> A builder needs to know if two walls are truly parallel. Albert shows that cutting across both walls with a single line — a transversal — reveals the answer through angle relationships. Chapter 3: <em>Parallel Lines and Transversals.</em></>)}
    </div>
  );
}
