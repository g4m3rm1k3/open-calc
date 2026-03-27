/**
 * Ch2_2_TwoStars.jsx
 * Book 2, Chapter 2 — "Two Stars, One Night"
 * Topic: Law of Cosines — proved from Pythagorean theorem
 * Characters: Albert (primary), Mic
 */

import { useState, useEffect, useRef } from "react";

function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function M({ t, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !window.katex || !t) return;
    try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }); }
    catch (_) { if (ref.current) ref.current.textContent = t; }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

function WhyPanel({ depth = 0, tag, children }) {
  const [open, setOpen] = useState(false);
  const colors = [
    { border: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" },
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
    { border: "#059669", bg: "#ecfdf5", text: "#047857" },
  ];
  const c = colors[Math.min(depth, colors.length - 1)];
  return (
    <div style={{ marginLeft: depth * 14, marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: open ? c.bg : "transparent", border: `1px solid ${c.border}`, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: c.border, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
        <span style={{ width: 15, height: 15, borderRadius: "50%", background: c.border, color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{open ? "−" : "?"}</span>
        {open ? "Close" : tag}
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: "12px 14px", background: "var(--color-background-secondary)", borderLeft: `3px solid ${c.border}`, borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function TriangleCanvas({ a, b, C }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const rad = (C * Math.PI) / 180;
    const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad));
    const scale = 120 / Math.max(a, b, c);
    const ox = 80, oy = H - 50;
    const Ax = ox, Ay = oy;
    const Bx = ox + b * scale, By = oy;
    const Cx2 = ox + a * scale * Math.cos(rad), Cy2 = oy - a * scale * Math.sin(rad);

    ctx.beginPath(); ctx.moveTo(Ax, Ay); ctx.lineTo(Bx, By); ctx.lineTo(Cx2, Cy2); ctx.closePath();
    ctx.fillStyle = isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)"; ctx.fill();
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 2; ctx.stroke();

    // angle C arc
    ctx.beginPath(); ctx.arc(Ax, Ay, 24, -rad, 0);
    ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.font = "12px var(--font-sans, sans-serif)";
    ctx.fillStyle = isDark ? "#c4b5fd" : "#5b21b6";
    ctx.textAlign = "left"; ctx.fillText("C = " + C + "°", Ax + 28, Ay - 8);
    ctx.fillStyle = isDark ? "#e2e8f0" : "#374151";
    ctx.textAlign = "center";
    ctx.fillText("b = " + b, (Ax + Bx) / 2, Ay + 18);
    ctx.fillText("a = " + a, (Ax + Cx2) / 2 - 18, (Ay + Cy2) / 2);
    ctx.fillText("c = " + c.toFixed(2), (Bx + Cx2) / 2 + 20, (By + Cy2) / 2);
  }, [a, b, C]);
  return <canvas ref={ref} width={580} height={220} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function Ch2_2_TwoStars({ params = {} }) {
  const [a, setA] = useState(7);
  const [b, setB] = useState(9);
  const [C, setC] = useState(55);
  const ready = useMath();
  const rad = (C * Math.PI) / 180;
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad));

  const panel = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 14 };
  const hdr = (tag, ts, title) => (<div style={{ padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, ...ts }}>{tag}</span><span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</span></div>);
  const body = { padding: "16px 20px" };
  const mbox = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px 16px", textAlign: "center", overflowX: "auto", margin: "10px 0" };
  const insight = { padding: "12px 14px", borderLeft: "3px solid #7c3aed", background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: "10px 0" };

  const steps = [
    { label: "Drop a perpendicular from C to side c", tex: "\\text{Height } h \\text{ splits the triangle into two right triangles}", note: "The key move: create right triangles we already know how to handle. This is the Pythagorean theorem in disguise." },
    { label: "Express h using angle C", tex: "h = a \\sin C \\qquad \\text{(from right triangle trig)}", note: "The height of the left sub-triangle. We use sin because h is opposite to angle C." },
    { label: "Express the base split", tex: "d = a \\cos C \\qquad \\text{right sub-triangle base} = b - a\\cos C", note: "The foot of the perpendicular splits the base b into two segments: d = a cos C and (b − d) = b − a cos C." },
    { label: "Apply Pythagorean theorem to the right sub-triangle", tex: "c^2 = h^2 + (b - a\\cos C)^2", note: "In the right sub-triangle: hypotenuse c, legs h and (b − a cos C). Pythagorean theorem applies directly." },
    { label: "Expand and substitute h² = a² sin²C", tex: "c^2 = a^2\\sin^2C + b^2 - 2ab\\cos C + a^2\\cos^2C", note: "Expand (b − a cos C)² = b² − 2ab cos C + a² cos²C. Then h² = a²sin²C." },
    { label: "Use sin²C + cos²C = 1", tex: "c^2 = a^2(\\sin^2C + \\cos^2C) + b^2 - 2ab\\cos C = a^2 + b^2 - 2ab\\cos C", note: "The Pythagorean identity sin²θ + cos²θ = 1 collapses a²sin²C + a²cos²C into just a². The Law of Cosines is proved." },
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Book 2 · Chapter 2</div>

      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--color-text-tertiary)", marginBottom: 5 }}>The situation</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.45 }}>Albert spots two stars very close together. He knows the distance to each one and the angle between them at his telescope. He needs the distance between the two stars — but there's no right angle in this triangle. Right-triangle trig won't work.</div>
      </div>

      <div style={panel}>
        {hdr("Story", { background: "#ede9fe", color: "#5b21b6" }, "Two stars, one night")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}>The two stars were a double system — they orbited each other. <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> had their distances from Earth: <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>a = 7</span> and <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>b = 9</span> light-years. The angle between them as seen from Earth was <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>55°</span>.</p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"How far apart are they?"</em> <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> asked.</p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"The Law of Cosines. But there's no right angle here — SOH-CAH-TOA won't work."</em></p>
          <p style={{ marginBottom: 0 }}><em style={{ color: "var(--color-text-secondary)" }}>"Then prove the Law of Cosines."</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> smiled. <em style={{ color: "var(--color-text-secondary)" }}>"I already did. I dropped a perpendicular and made two right triangles where there was one triangle with no right angle. That's the trick."</em></p>
        </div>
      </div>

      <div style={panel}>
        {hdr("Discovery", { background: "#ede9fe", color: "#5b21b6" }, "Law of Cosines — proved by dropping a perpendicular")}
        <div style={body}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 14 }}>The strategy: any triangle can be split into two right triangles by dropping a perpendicular from one vertex to the opposite side. Then we apply the Pythagorean theorem to both, combine, and use the identity sin²θ + cos²θ = 1.</p>

          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 12 }}>
            <TriangleCanvas a={a} b={b} C={C} />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            {[["Side a", a, 3, 12, setA], ["Side b", b, 3, 14, setB], ["Angle C (°)", C, 10, 170, setC]].map(([label, val, min, max, setter]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 160 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 70 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={1} onChange={e => setter(parseInt(e.target.value))} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 24 }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={mbox}>{ready && <M t={`c^2 = a^2 + b^2 - 2ab\\cos C = ${a}^2 + ${b}^2 - 2(${a})(${b})\\cos(${C}°) = ${c.toFixed(4)^0+c.toFixed(2)} \\implies c \\approx ${c.toFixed(2)}`} display ready={ready} />}</div>

          {steps.map((step, i) => (
            <div key={i} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 14px", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: "#7c3aed", color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{step.label}</span>
              </div>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 6, padding: 8, textAlign: "center", overflowX: "auto", marginBottom: 5 }}>{ready && <M t={step.tex} display ready={ready} />}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{step.note}</div>
            </div>
          ))}

          <div style={insight}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>The Law of Cosines:</strong> c² = a² + b² − 2ab cos C. When C = 90°, cos 90° = 0 and it reduces to the Pythagorean theorem: c² = a² + b². The Pythagorean theorem is just the special case of the Law of Cosines where the included angle is a right angle.</div>

          <WhyPanel tag="Why sin²C + cos²C = 1? (The Pythagorean identity)" depth={0}>
            <p style={{ marginBottom: 8 }}>From the unit circle: the point at angle C is (cos C, sin C). This point lies on the circle x² + y² = 1 by definition. Substituting: cos²C + sin²C = 1. That's it — the identity is the equation of the unit circle. Every point on a circle of radius 1 satisfies x² + y² = 1.</p>
            <WhyPanel tag="Why is the equation of a circle x² + y² = r²?" depth={1}>
              <p>By the Pythagorean theorem: any point (x, y) on a circle of radius r forms a right triangle with the center (0,0) and the horizontal axis. The hypotenuse is r, legs are x and y. Pythagoras: x² + y² = r². For r = 1: x² + y² = 1.</p>
            </WhyPanel>
          </WhyPanel>
        </div>
      </div>

      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #b45309", borderRadius: "0 0 10px 10px", padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Albert measures the shadow every hour for a week and notices something strange — the pattern repeats. Not just roughly: exactly, with a period of 24 hours. He needs functions that repeat. Chapter 3: <em>The Ripple and the Wave.</em>
      </div>
    </div>
  );
}
