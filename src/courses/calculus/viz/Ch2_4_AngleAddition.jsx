/**
 * Ch2_4_AngleAddition.jsx
 * Book 2, Chapter 4 — "The Angle Addition"
 * Topic: sin(u+v) = sin u cos v + cos u sin v — proved from unit circle geometry
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
  const colors = [{ border: "#059669", bg: "#ecfdf5", text: "#047857" }, { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" }, { border: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" }];
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

export default function Ch2_4_AngleAddition({ params = {} }) {
  const [u, setU] = useState(30);
  const [v, setV] = useState(25);
  const ready = useMath();
  const ur = (u * Math.PI) / 180, vr = (v * Math.PI) / 180;
  const sinSum = Math.sin(ur + vr).toFixed(4);
  const formula = (Math.sin(ur) * Math.cos(vr) + Math.cos(ur) * Math.sin(vr)).toFixed(4);

  const panel = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 14 };
  const hdr = (tag, ts, title) => (<div style={{ padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, ...ts }}>{tag}</span><span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</span></div>);
  const body = { padding: "16px 20px" };
  const mbox = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px 16px", textAlign: "center", overflowX: "auto", margin: "10px 0" };
  const insight = { padding: "12px 14px", borderLeft: "3px solid #059669", background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: "10px 0" };

  const steps = [
    { label: "Place two unit vectors at angles u and u+v", tex: "P_1 = (\\cos u, \\sin u), \\quad P_2 = (\\cos(u+v), \\sin(u+v))", note: "Any angle on the unit circle corresponds to a point. The two vectors are the sides of our triangle." },
    { label: "Compute chord length by Pythagorean distance formula", tex: "|P_1P_2|^2 = (\\cos(u+v)-\\cos u)^2 + (\\sin(u+v)-\\sin u)^2", note: "Distance between two points in the plane: √((x₂−x₁)²+(y₂−y₁)²). We square to avoid the root." },
    { label: "Use rotational symmetry: chord depends only on v", tex: "|P_1P_2|^2 = |(\\cos v, \\sin v) - (1,0)|^2 = 2 - 2\\cos v", note: "By rotation invariance of the circle, the chord length between any two points depends only on the arc v between them — not the starting angle u." },
    { label: "Expand the first form and equate to 2 − 2cos v", tex: "2 - 2(\\cos u\\cos(u+v) + \\sin u\\sin(u+v)) = 2 - 2\\cos v", note: "Expand, collect, and match. This gives: cos u cos(u+v) + sin u sin(u+v) = cos v. From this, both cos and sin addition formulas follow." },
    { label: "Result: the angle addition formula for sin", tex: "\\sin(u+v) = \\sin u\\cos v + \\cos u\\sin v", note: "The full derivation uses a π/2 shift from the cosine formula. This identity is a pure geometric fact — not an algebraic coincidence." },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Book 2 · Chapter 4</div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--color-text-tertiary)", marginBottom: 5 }}>The situation</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.45 }}>Albert needs to combine two telescope angles — the telescope rotates u degrees, then v more. What is sin(u+v)? His first guess (sin u + sin v) is wrong. The correct formula is not obvious — and it requires geometry to prove, not algebra.</div>
      </div>
      <div style={panel}>
        {hdr("Story", { background: "#ecfdf5", color: "#065f46" }, "The angle addition")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> rotated the telescope mount by <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>u = 30°</span>, then <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>v = 25°</span> more. Total rotation: 55°. He needed sin(55°).</p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span>, helpfully: <em style={{ color: "var(--color-text-secondary)" }}>"Just add them. sin(30°) + sin(25°) = 0.5 + 0.423 = 0.923."</em></p>
          <p style={{ marginBottom: 12 }}>Albert checked. sin(55°) ≈ 0.819. <em style={{ color: "var(--color-text-secondary)" }}>"You're off by ten percent."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> stared. <em style={{ color: "var(--color-text-secondary)" }}>"Sin doesn't distribute over addition?"</em> <em style={{ color: "var(--color-text-secondary)" }}>"Almost nothing does except multiplication. Prove it doesn't and then find the right formula."</em></p>
        </div>
      </div>
      <div style={panel}>
        {hdr("Discovery", { background: "#ecfdf5", color: "#065f46" }, "sin(u+v) ≠ sin u + sin v — and the correct formula")}
        <div style={body}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[["Angle u (°)", u, 5, 80, setU], ["Angle v (°)", v, 5, 80, setV]].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 180 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 80 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 28 }}>{val}°</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["sin u + sin v (wrong)", (Math.sin(ur) + Math.sin(vr)).toFixed(4), "#dc2626"], ["sin(u+v) (correct)", sinSum, "#059669"], ["Formula result", formula, "#059669"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={mbox}>{ready && <M t={`\\sin(${u}°+${v}°) = \\sin ${u}°\\cos ${v}° + \\cos ${u}°\\sin ${v}° = ${Math.sin(ur).toFixed(3)} \\times ${Math.cos(vr).toFixed(3)} + ${Math.cos(ur).toFixed(3)} \\times ${Math.sin(vr).toFixed(3)} = ${formula}`} display ready={ready} />}</div>
          {steps.map((step, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#059669", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span><span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{step.label}</span></div>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: 8, textAlign: "center", overflowX: "auto", marginBottom: 5 }}>{ready && <M t={step.tex} display ready={ready} />}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{step.note}</div>
            </div>
          ))}
          <div style={insight}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why this matters:</strong> The angle addition formula is a load-bearing dependency under the derivative of sine. In Book 3 Chapter 3.4 and Book 4 Chapter 4.1, the proof that d/dx[sin x] = cos x requires expanding sin(x+h) using exactly this formula. Without it, the derivative cannot be found.</div>
          <WhyPanel tag="Why doesn't sin distribute? What's the general rule?" depth={0}>
            <p style={{ marginBottom: 8 }}>Functions almost never distribute over addition. f(a+b) = f(a) + f(b) is called linearity, and only linear functions have it. Linear functions are exactly the ones of the form f(x) = cx — multiplying by a constant. Sin, cos, log, sqrt, x² — none of these are linear, so none of them distribute.</p>
            <p>Number check: √(4+9) = √13 ≈ 3.61. But √4 + √9 = 2 + 3 = 5. Very different. Same principle: the operation is inside the function, not outside it.</p>
          </WhyPanel>
        </div>
      </div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #b45309", borderRadius: "0 0 10px 10px", padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> John asks why Albert always says "radians" and refuses to use degrees. Albert explains that degrees are arbitrary — a human invention — but radians are a geometric necessity. And without them, all of calculus would have a correction factor in it. Chapter 5: <em>The Spinning Wheel.</em>
      </div>
    </div>
  );
}
