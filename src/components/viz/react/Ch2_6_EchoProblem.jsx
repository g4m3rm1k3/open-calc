/**
 * Ch2_6_EchoProblem.jsx
 * Book 2, Chapter 6 — "The Echo Problem"
 * Topic: Inverse trig functions — arcsin, arccos, arctan, domain restrictions
 */
import { useState, useEffect, useRef } from "react";
function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"; document.head.appendChild(link);
    const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"; s.onload = () => setReady(true); document.head.appendChild(s);
  }, []);
  return ready;
}
function M({ t, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !t) return;
    try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }); } catch (_) { if (ref.current) ref.current.textContent = t; }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}
function WhyPanel({ depth = 0, tag, children }) {
  const [open, setOpen] = useState(false);
  const colors = [{ border: "#dc2626", bg: "#fef2f2", text: "#991b1b" }, { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" }, { border: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" }];
  const c = colors[Math.min(depth, colors.length - 1)];
  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? c.bg : "transparent", border: `1px solid ${c.border}`, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: c.border, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        <span style={{ width: 15, height: 15, borderRadius: "50%", background: c.border, color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{open ? "−" : "?"}</span>
        {open ? "Close" : tag}
      </button>
      {open && <div style={{ marginTop: 8, padding: "12px 14px", background: "var(--color-background-secondary)", borderLeft: `3px solid ${c.border}`, borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{children}</div>}
    </div>
  );
}

export default function Ch2_6_EchoProblem({ params = {} }) {
  const [ratio, setRatio] = useState(0.65);
  const ready = useMath();
  const angleDeg = (Math.asin(ratio) * 180 / Math.PI).toFixed(2);
  const angleRad = Math.asin(ratio).toFixed(4);

  const panel = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 14 };
  const hdr = (tag, ts, title) => (<div style={{ padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, ...ts }}>{tag}</span><span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</span></div>);
  const body = { padding: "16px 20px" };
  const mbox = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px 16px", textAlign: "center", overflowX: "auto", margin: "10px 0" };
  const insight = { padding: "12px 14px", borderLeft: "3px solid #dc2626", background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: "10px 0" };

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Book 2 · Chapter 6</div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--color-text-tertiary)", marginBottom: 5 }}>The situation</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.45 }}>A distress signal arrives. From the sonar geometry, the opposite-to-hypotenuse ratio is 0.65. Mic needs the actual angle. But sin goes forward (angle → ratio). He needs to run it backwards. That's arcsin — and it comes with a restriction that must be understood, not memorised.</div>
      </div>
      <div style={panel}>
        {hdr("Story", { background: "#fef2f2", color: "#991b1b" }, "The echo problem")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}>The sonar reading showed a ratio: the signal was coming from a direction where opposite/hypotenuse = <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>0.65</span>. <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> needed the bearing angle.</p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"sin(θ) = 0.65. What's θ?"</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span>, immediately: <em style={{ color: "var(--color-text-secondary)" }}>"arcsin(0.65). Easy."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> looked up. <em style={{ color: "var(--color-text-secondary)" }}>"Which answer? sin(θ) = 0.65 has infinitely many solutions. 40.5°, 139.5°, 400.5°, −219.5° — they all satisfy it. arcsin gives you one. How do you know it's the right one?"</em></p>
          <p style={{ marginBottom: 0 }}>There was a silence. <em style={{ color: "var(--color-text-secondary)" }}>"You check the context,"</em> <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> said. Albert nodded. <em style={{ color: "var(--color-text-secondary)" }}>"Always. The math gives you a set of possibilities. Reality narrows it to one."</em></p>
        </div>
      </div>
      <div style={panel}>
        {hdr("Discovery", { background: "#fef2f2", color: "#991b1b" }, "Inverse trig — running sin backwards, with restrictions")}
        <div style={body}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 14 }}>Sin takes an angle and gives a ratio. Arcsin takes a ratio and gives an angle. But sin is many-to-one (many angles share a ratio), so arcsin must restrict its output to a single range to be a function at all.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Ratio (opp/hyp)</span>
            <input type="range" min={-1} max={1} value={ratio} step={0.01} onChange={e => setRatio(parseFloat(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40 }}>{ratio.toFixed(2)}</span>
          </div>
          <div style={mbox}>{ready && <M t={`\\arcsin(${ratio.toFixed(2)}) = ${angleRad} \\text{ rad} = ${angleDeg}°`} display ready={ready} />}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["arcsin", "−90° to 90°", "#dc2626"], ["arccos", "0° to 180°", "#0891b2"], ["arctan", "−90° to 90°", "#059669"]].map(([fn, range, col]) => (
              <div key={fn} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: col, marginBottom: 3 }}>{fn}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Output restricted to</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{range}</div>
              </div>
            ))}
          </div>
          <div style={insight}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why restrict?</strong> A function must give exactly one output per input. Sin(30°) = Sin(150°) = 0.5 — if arcsin could output both, it wouldn't be a function. We restrict arcsin to [−90°, 90°] by convention. This is the "principal value." Other solutions exist — you find them using symmetry properties of the unit circle.</div>
          <WhyPanel tag="How do I find ALL solutions to sin(θ) = 0.65, not just arcsin?" depth={0}>
            <p style={{ marginBottom: 8 }}>Let θ₀ = arcsin(0.65) ≈ 40.5°. Then: (1) θ = θ₀ + 360°k for any integer k (same position, more rotations). (2) θ = 180° − θ₀ + 360°k (the supplementary angle has the same sin value — it's in the second quadrant).</p>
            <p>So the complete solution is: θ ≈ 40.5° + 360°k or θ ≈ 139.5° + 360°k. In the distress signal problem, only one of these makes geometric sense given the ship's known location — context narrows it to one.</p>
          </WhyPanel>
        </div>
      </div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #1e40af", borderRadius: "0 0 10px 10px", padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#1e40af" }}>Book 2 complete.</strong> Mic, Albert, and John now have trigonometry — angles, sides, graphs, identities, radians, inverses. What they still can't answer: how fast was John's cart moving at the exact moment it hit the fence? Not on average. Exactly, at that instant. <em>Book 3 begins with that question.</em>
      </div>
    </div>
  );
}
