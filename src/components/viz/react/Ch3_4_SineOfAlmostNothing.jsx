import { useState, useEffect, useRef } from "react";
import { 
  useMath, 
  M,
  WhyPanel, 
  mkPanel as panel, 
  mkHdr as hdr, 
  mkBody as body, 
  mkInsight as insight, 
  mkBadge as badge, 
  mkHook as hook, 
  mkSeed as seed, 
  mkMbox as mbox,
  StepBlock
} from "../CalculusHelpers.jsx";

export default function Ch3_4_SineOfAlmostNothing({ params = {} }) {
  const [h, setH] = useState(0.5);
  const ready = useMath();
  const ratio = (Math.sin(h) / h).toFixed(6);
  const cosh = Math.cos(h).toFixed(4);

  const steps = [
    { label: "Area of triangle OAB (lower bound)", tex: "\\text{Area}_{\\triangle} = \\tfrac{1}{2}\\sin h", note: "The triangle with vertices at origin, (1,0), and (cos h, sin h). Base = 1, height = sin h." },
    { label: "Area of sector OAB (middle)", tex: "\\text{Area}_{\\text{sector}} = \\tfrac{1}{2}h", note: "Sector area = ½r²θ = ½(1²)(h) = ½h. This formula only works in radians — that's why radians matter." },
    { label: "Area of triangle OAT (upper bound)", tex: "\\text{Area}_{\\triangle OAT} = \\tfrac{1}{2}\\tan h", note: "The larger triangle with the tangent line. tan h = sin h / cos h." },
    { label: "Divide by ½ sin h to get the squeeze", tex: "\\cos h < \\frac{\\sin h}{h} < 1", note: "As h→0, cos h→1 and 1→1. By the Squeeze Theorem, (sin h)/h → 1." },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 4)}
      {hook("Mic needs the derivative of sin — which requires knowing what (sin h)/h approaches as h→0. It's a 0/0 form. Albert proves it equals exactly 1 using a geometric inequality on the unit circle and the Squeeze Theorem. This single limit is the foundation of all trig calculus.")}
      <div style={panel}>
        {hdr("Story", { background: "#eef2ff", color: "#3730a3" }, "The sine of almost nothing")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> had reached the wall. <em style={{ color: "var(--color-text-secondary)" }}>"To prove d/dx[sin x] = cos x from the definition, I need to evaluate lim(sin h / h) as h→0. But sin(0)/0 = 0/0."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> pulled out the unit circle diagram. <em style={{ color: "var(--color-text-secondary)" }}>"We can't compute it directly. But we can trap it between two things that both go to 1."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> looked up from the corner. <em style={{ color: "var(--color-text-secondary)" }}>"Isn't (sin h)/h just approximately 1 for small h? Why prove it?"</em> Mic looked at him steadily. <em style={{ color: "var(--color-text-secondary)" }}>"Because approximately is not a proof. And if this limit were π/180 instead of 1 — which it would be in degrees — every trig derivative would be wrong by that factor forever."</em></p>
        </div>
      </div>
      <div style={panel}>
        {hdr("Discovery", { background: "#eef2ff", color: "#3730a3" }, "The area squeeze — proving lim(sin h/h) = 1")}
        <div style={body}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>h (radians)</span>
            <input type="range" min={0.01} max={1.5} value={h} step={0.01} onChange={e => setH(parseFloat(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 50 }}>{h.toFixed(2)} rad</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["cos h (lower)", cosh, "#059669"], ["(sin h)/h", ratio, "#6366f1"], ["1 (upper)", "1.0000", "#d97706"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          {steps.map((s, i) => <StepBlock key={i} num={i + 1} label={s.label} tex={s.tex} note={s.note} ready={ready} col="#6366f1" />)}
          <div style={insight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why this is load-bearing:</strong> The proof that d/dx[sin x] = cos x requires this limit in the final step. The companion limit lim((cos h−1)/h) = 0 follows from this one algebraically. Both are needed for the derivative of sin — and neither can be assumed.</div>
          <WhyPanel tag="Why does the area proof require radians specifically?" depth={0}>
            <p style={{ marginBottom: 8 }}>The sector area formula Area = ½r²θ = ½h (for r=1) holds only when θ is in radians. In degrees: Area = ½r²·(θ°·π/180) = ½h·π/180. The squeeze would then give lim(sin h°/h°) = π/180 ≈ 0.01745. Every trig derivative would carry this factor — d/dx[sin x°] = (π/180)cos x°. Radians eliminate this permanently.</p>
          </WhyPanel>
        </div>
      </div>
      {seed(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> John tries to evaluate lim (x²−4)/(x−2) at x=2. He gets 0/0 and declares there's no answer. Mic shows him the form is indeterminate — not impossible. Chapter 5: <em>The Broken Function.</em></>)}
    </div>
  );
}
