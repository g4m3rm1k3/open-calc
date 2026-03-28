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
  mkMbox as mbox
} from "../CalculusHelpers.jsx";

export default function Ch3_5_BrokenFunction({ params = {} }) {
  const [xval, setXval] = useState(2.5);
  const ready = useMath();
  const frac = xval === 2 ? "0/0" : ((xval * xval - 4) / (xval - 2)).toFixed(4);
  const simplified = xval === 2 ? "4" : (xval + 2).toFixed(4);

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {badge(3, 5)}
      {hook("John tries to evaluate (x²−4)/(x−2) at x=2. He gets 0/0 and declares it impossible. Mic factors the numerator and shows the function is perfectly well-behaved near x=2 — the 0/0 is a removable discontinuity, not a dead end. 0/0 is indeterminate, not undefined.")}
      <div style={panel}>
        {hdr("Story", { background: "#eef2ff", color: "#3730a3" }, "The broken function")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> had written <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>lim_{"{"}x→2{"}"} (x²−4)/(x−2)</span> on the board and crossed it out. <em style={{ color: "var(--color-text-secondary)" }}>"It's 0/0 at x=2. No answer."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> looked at it. <em style={{ color: "var(--color-text-secondary)" }}>"Factor the top."</em></p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"x²−4 = (x−2)(x+2). So the fraction is (x−2)(x+2)/(x−2) = x+2."</em></p>
          <p style={{ marginBottom: 0 }}><em style={{ color: "var(--color-text-secondary)" }}>"But at x=2 you divided by zero."</em> Mic shook his head. <em style={{ color: "var(--color-text-secondary)" }}>"In the limit, we never reach x=2. We only approach it. So (x−2)/(x−2) = 1 for every x near 2 — just not at 2. The limit is 4."</em></p>
        </div>
      </div>
      <div style={panel}>
        {hdr("Discovery", { background: "#eef2ff", color: "#3730a3" }, "Indeterminate ≠ impossible — factoring reveals the limit")}
        <div style={body}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>x</span>
            <input type="range" min={0.1} max={4} value={xval} step={0.01} onChange={e => setXval(parseFloat(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>{xval.toFixed(2)}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["(x²−4)/(x−2)", frac, xval === 2 ? "#dc2626" : "var(--color-text-primary)"], ["x+2 (simplified)", simplified, "#059669"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          {ready && <div style={mbox}><M t={`\\lim_{x\\to 2}\\frac{x^2-4}{x-2} = \\lim_{x\\to 2}\\frac{(x-2)(x+2)}{x-2} = \\lim_{x\\to 2}(x+2) = 4`} display ready={ready} /></div>}
          <div style={insight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>0/0 is indeterminate, not impossible.</strong> It means "we need more information." Depending on how fast the top and bottom approach 0, the limit could be any number, infinite, or nonexistent. Factoring, multiplying by conjugates, and L'Hôpital's Rule (Book 4, Ch 4.5) are the tools for resolving 0/0.</div>
          <WhyPanel tag="What's the difference between undefined and indeterminate?" depth={0}>
            <p style={{ marginBottom: 8 }}>Undefined: no value is possible. 1/0 is undefined — no number multiplied by 0 gives 1. The expression has no meaning.</p>
            <p>Indeterminate: the value exists but can't be determined from the form alone. 0/0 could be 1 (lim x/x), 0 (lim x²/x = lim x), ∞ (lim 1/x²·x = lim 1/x), or anything else. The form doesn't tell you the limit — you need more work.</p>
          </WhyPanel>
        </div>
      </div>
      {seed(<><strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Mic connects everything: average speed, shrinking intervals, limits, and the slope of a curve. He writes the definition of the derivative — and recognizes it as the same limit idea they've been using all along. Chapter 6: <em>The Bridge to Calculus.</em></>)}
    </div>
  );
}
