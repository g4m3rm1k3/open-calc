import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  WhyPanel, 
  mkPanel as P, 
  mkHdr as H, 
  mkBody as B, 
  mkInsight as INS, 
  mkBadge as BDG, 
  mkHook as HK, 
  mkSeed as SD, 
} from "./GeometryHelpers.jsx";

function InscribedAngleCanvas({ pointAngle }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const col = isDark ? "#e2e8f0" : "#1e293b";
    const cx = W / 2, cy = H / 2, r = 110;
    const arcStart = 0.3, arcEnd = 2.4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark ? "#6b7280" : "#9ca3af"; ctx.lineWidth = 1; ctx.stroke();
    const pRad = (pointAngle * Math.PI) / 180;
    const A = [cx + r * Math.cos(arcStart), cy + r * Math.sin(arcStart)];
    const B2 = [cx + r * Math.cos(arcEnd), cy + r * Math.sin(arcEnd)];
    const P2 = [cx + r * Math.cos(pRad), cy + r * Math.sin(pRad)];
    const dot = ([x, y], col2 = col, rr = 4) => { ctx.beginPath(); ctx.arc(x, y, rr, 0, 2 * Math.PI); ctx.fillStyle = col2; ctx.fill(); };
    const ln = ([x1, y1], [x2, y2], color = col, w = 1.5) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke(); };
    ln(A, B2, "#059669", 2); ln([cx, cy], A, "#4f46e5", 1.5); ln([cx, cy], B2, "#4f46e5", 1.5);
    ln(P2, A, "#d97706", 1.5); ln(P2, B2, "#d97706", 1.5);
    dot(A, "#059669"); dot(B2, "#059669"); dot([cx, cy], "#4f46e5"); dot(P2, "#d97706");
    const centralAngle = ((arcEnd - arcStart) * 180 / Math.PI).toFixed(1);
    const inscribed = (centralAngle / 2).toFixed(1);
    ctx.fillStyle = "#4f46e5"; ctx.font = "12px var(--font-sans,sans-serif)"; ctx.textAlign = "center";
    ctx.fillText(`Central ∠AOB = ${centralAngle}°`, cx, cy + r + 22);
    ctx.fillStyle = "#d97706";
    ctx.fillText(`Inscribed ∠APB = ${inscribed}° = ½ × ${centralAngle}°`, cx, cy + r + 40);
  }, [pointAngle]);
  return <canvas ref={ref} width={500} height={280} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function G2_1_CircleTheorems1({ params = {} }) {
  const [ptAngle, setPtAngle] = useState(210);
  const ready = useMath();
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      {BDG(1)}
      {HK("Albert is building a sundial. He needs to divide a circle into equal arcs for the hour markers. While measuring, he notices something strange: whenever he stands at the edge of the circle and looks at any two points on the opposite arc, the angle at his eye is always the same — no matter where he stands on the arc.")}
      <div style={P}>
        {H("Story", { background: "#ecfdf5", color: "#065f46" }, "Circle theorems I")}
        <div style={{ ...B, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> moved the sundial gnomon to three different positions on the circle's edge and measured the angle to the same two arc endpoints. <em style={{ color: "var(--color-text-secondary)" }}>"26.5 degrees. 26.5 degrees. 26.5 degrees. Every time."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> looked at the measurements. <em style={{ color: "var(--color-text-secondary)" }}>"That can't be a coincidence."</em> <em style={{ color: "var(--color-text-secondary)" }}>"It isn't,"</em> Albert said. <em style={{ color: "var(--color-text-secondary)" }}>"It's a theorem. The inscribed angle is always exactly half the central angle. And I can prove it."</em></p>
        </div>
      </div>
      <div style={P}>
        {H("Discovery", { background: "#ecfdf5", color: "#065f46" }, "Inscribed angle = ½ central angle — drag the point")}
        <div style={B}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 12 }}>Move the point P around the circle. The inscribed angle (orange) stays exactly half the central angle (blue), no matter where P is on the major arc.</p>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 12 }}><InscribedAngleCanvas pointAngle={ptAngle} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Point P position</span>
            <input type="range" min={150} max={340} value={ptAngle} step={1} onChange={e => setPtAngle(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
          </div>
          {[{ num: 1, label: "Draw radius OP", note: "O is the centre. Draw radius OP. Label the two sub-angles at P: α and β." }, { num: 2, label: "Triangle OPA is isoceles (OP = OA = radius)", note: "Base angles of an isoceles triangle are equal. So ∠OAP = ∠OPA = α." }, { num: 3, label: "Exterior angle of triangle OPA at O", note: "The exterior angle ∠AOP = 2α (exterior angle = sum of non-adjacent interior angles)." }, { num: 4, label: "Same argument for triangle OPB gives ∠BOP = 2β", note: "By the same isoceles triangle reasoning on the other side." }, { num: 5, label: "Total central angle = 2α + 2β = 2(α+β) = 2 × inscribed angle", note: "QED. The central angle is exactly twice the inscribed angle." }].map((s, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#059669", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{s.num}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.label}</span></div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{s.note}</div>
            </div>
          ))}
          <div style={INS()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Corollary — angles in the same segment are equal:</strong> Since every inscribed angle subtending the same arc equals half the same central angle, all inscribed angles subtending the same arc are equal to each other. Albert's three measurements are always the same — this is the theorem, not coincidence.</div>
          <WhyPanel tag="What's the angle in a semicircle?" depth={0}>
            <p>If the chord AB is a diameter, the central angle = 180° (a straight line through the centre). The inscribed angle = ½ × 180° = 90°. So any angle inscribed in a semicircle is always a right angle. This is Thales' theorem — proved around 600 BC.</p>
          </WhyPanel>
        </div>
      </div>
      {SD(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Albert needs to draw a tangent to the sundial circle at a specific point — a line that touches without crossing. He proves the tangent is always perpendicular to the radius, and discovers the "power of a point." Chapter 2: <em>Tangents and Secants.</em></>)}
    </div>
  );
}
