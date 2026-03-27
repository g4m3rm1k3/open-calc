/**
 * Ch2_1_LighthouseAngle.jsx
 * Book 2, Chapter 1 — "The Lighthouse Angle"
 * Topic: Right triangle trig — SOH-CAH-TOA derived from the unit circle
 * Characters: Albert (primary), Mic
 *
 * src/components/viz/react/Ch2_1_LighthouseAngle.jsx
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
    { border: "#0891b2", bg: "#ecfeff", text: "#0e7490" },
    { border: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" },
    { border: "#059669", bg: "#ecfdf5", text: "#047857" },
    { border: "#d97706", bg: "#fffbeb", text: "#92400e" },
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

function UnitCircleCanvas({ angleDeg }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const cx = W / 2 - 30, cy = H / 2, r = 110;
    const rad = (angleDeg * Math.PI) / 180;
    const px = cx + r * Math.cos(rad), py = cy - r * Math.sin(rad);

    // axes
    ctx.strokeStyle = isDark ? "#4b5563" : "#d1d5db";
    ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.moveTo(cx - r - 20, cy); ctx.lineTo(cx + r + 20, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - r - 20); ctx.lineTo(cx, cy + r + 20); ctx.stroke();

    // circle
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark ? "#6b7280" : "#9ca3af"; ctx.lineWidth = 1; ctx.stroke();

    // shaded triangle
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.lineTo(px, py); ctx.closePath();
    ctx.fillStyle = isDark ? "rgba(8,145,178,0.18)" : "rgba(8,145,178,0.12)"; ctx.fill();

    // hypotenuse (radius)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
    ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 2; ctx.stroke();

    // adjacent (x leg)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy);
    ctx.strokeStyle = "#d97706"; ctx.lineWidth = 2; ctx.stroke();

    // opposite (y leg)
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py);
    ctx.strokeStyle = "#059669"; ctx.lineWidth = 2; ctx.stroke();

    // angle arc
    ctx.beginPath(); ctx.arc(cx, cy, 28, -rad, 0);
    ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 1.5; ctx.stroke();

    // point on circle
    ctx.beginPath(); ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#0891b2"; ctx.fill();

    // labels
    const sinV = Math.sin(rad).toFixed(3);
    const cosV = Math.cos(rad).toFixed(3);
    ctx.font = "12px var(--font-sans, sans-serif)";
    ctx.textAlign = "left";
    ctx.fillStyle = "#0891b2";
    ctx.fillText("(cos θ, sin θ)", px + 8, py - 6);
    ctx.fillStyle = isDark ? "#fcd34d" : "#92400e";
    ctx.fillText("θ = " + angleDeg + "°", cx + 32, cy - 6);
    ctx.fillStyle = isDark ? "#fbbf24" : "#b45309";
    ctx.textAlign = "center";
    ctx.fillText("adj = cos θ = " + cosV, cx + (px - cx) / 2, cy + 18);
    ctx.fillStyle = isDark ? "#6ee7b7" : "#047857";
    ctx.textAlign = "left";
    ctx.fillText("opp = sin θ = " + sinV, px + 8, (cy + py) / 2 + 4);

    // right angle
    const s = 8;
    ctx.strokeStyle = isDark ? "#6b7280" : "#94a3b8"; ctx.lineWidth = 1;
    const sign = py < cy ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(px - s, cy);
    ctx.lineTo(px - s, cy + sign * s);
    ctx.lineTo(px, cy + sign * s);
    ctx.stroke();

    // legend
    const lx = W - 130, ly = 20;
    ctx.fillStyle = "#0891b2"; ctx.fillRect(lx, ly, 12, 3);
    ctx.fillStyle = isDark ? "#e2e8f0" : "#374151"; ctx.font = "11px var(--font-sans, sans-serif)"; ctx.textAlign = "left";
    ctx.fillText("hypotenuse = 1", lx + 16, ly + 4);
    ctx.fillStyle = "#d97706"; ctx.fillRect(lx, ly + 14, 12, 3);
    ctx.fillText("adjacent = cos θ", lx + 16, ly + 18);
    ctx.fillStyle = "#059669"; ctx.fillRect(lx, ly + 28, 12, 3);
    ctx.fillText("opposite = sin θ", lx + 16, ly + 32);
  }, [angleDeg]);

  return <canvas ref={ref} width={580} height={280} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function Ch2_1_LighthouseAngle({ params = {} }) {
  const [angle, setAngle] = useState(38);
  const ready = useMath();
  const rad = (angle * Math.PI) / 180;
  const sinV = Math.sin(rad), cosV = Math.cos(rad), tanV = Math.tan(rad);

  const S = { fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 };
  const panel = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 14 };
  const hdr = (tag, ts, title) => (<div style={{ padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, ...ts }}>{tag}</span><span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</span></div>);
  const body = { padding: "16px 20px" };
  const mbox = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px 16px", textAlign: "center", overflowX: "auto", margin: "10px 0" };
  const insight = (col = "#0891b2") => ({ padding: "12px 14px", borderLeft: `3px solid ${col}`, background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: "10px 0" });

  return (
    <div style={S}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Book 2 · Chapter 1</div>

      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--color-text-tertiary)", marginBottom: 5 }}>The situation</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.45 }}>Albert wants to aim the telescope at a specific star. The star's position is given as an angle from the horizon. But the telescope mount uses distances — not angles. Albert needs to convert. To do that, he has to understand where sin, cos, and tan actually come from.</div>
      </div>

      <div style={panel}>
        {hdr("Story", { background: "#ecfeff", color: "#155e75" }, "The lighthouse angle")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}>The telescope had been aimed at the lighthouse for calibration. <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> read the angle off the mount: <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>38°</span> above horizontal. The lighthouse was <span style={{ background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }}>400m</span> away.</p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"How high is the light above the ground?"</em> <span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> asked.</p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"I need tan 38° times 400,"</em> <span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> said. <em style={{ color: "var(--color-text-secondary)" }}>"But I refuse to just look up the number. I want to know what tan actually is."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> put down his notebook. <em style={{ color: "var(--color-text-secondary)" }}>"It's opposite over adjacent. SOH-CAH-TOA."</em></p>
          <p style={{ marginBottom: 0 }}><em style={{ color: "var(--color-text-secondary)" }}>"That's the mnemonic. I want the reason."</em> Albert drew a circle of radius 1 on the fogged-up window. <em style={{ color: "var(--color-text-secondary)" }}>"Everything comes from here."</em></p>
        </div>
      </div>

      <div style={panel}>
        {hdr("Discovery", { background: "#ecfeff", color: "#155e75" }, "The unit circle — where sin and cos are defined")}
        <div style={body}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 14 }}>Albert draws a circle of radius 1. For any angle θ, he marks the point where the radius meets the circle. The x-coordinate of that point is called cos θ. The y-coordinate is called sin θ. That's the definition — not a formula, a coordinate.</p>

          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 12 }}>
            <UnitCircleCanvas angleDeg={angle} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Angle θ</span>
            <input type="range" min={5} max={85} value={angle} step={1} onChange={e => setAngle(parseInt(e.target.value))} style={{ flex: 1, maxWidth: 220 }} />
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 30 }}>{angle}°</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginBottom: 12 }}>
            {[["sin θ", sinV.toFixed(4), "#059669"], ["cos θ", cosV.toFixed(4), "#d97706"], ["tan θ", tanV.toFixed(4), "#0891b2"]].map(([label, val, col]) => (
              <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: col }}>{val}</div>
              </div>
            ))}
          </div>

          <div style={mbox}>
            {ready && <M t={`\\text{height} = 400 \\times \\tan(${angle}°) = 400 \\times \\frac{\\sin ${angle}°}{\\cos ${angle}°} = 400 \\times ${tanV.toFixed(4)} = ${(400 * tanV).toFixed(1)} \\text{ m}`} display ready={ready} />}
          </div>

          <div style={insight()}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Why these names?</strong> For any angle θ, the unit circle point is (cos θ, sin θ). In a right triangle with hypotenuse r, the sides are r·cos θ (adjacent) and r·sin θ (opposite). Divide opposite by adjacent: r·sin θ / r·cos θ = sin θ / cos θ = tan θ. SOH-CAH-TOA is just these ratios given short names.</div>

          <WhyPanel tag="Why does the unit circle define sin and cos for any angle — even past 90°?" depth={0}>
            <p style={{ marginBottom: 8 }}>In a right triangle, angles must be between 0° and 90°. But the unit circle extends to all angles. At 120°, the x-coordinate (cos 120°) is negative — the point is in the second quadrant. At 180°, cos 180° = −1 and sin 180° = 0. The circle definition works everywhere; the triangle definition only works up to 90°.</p>
            <p>This matters for trig graphs (Book 2, Ch 2.3) and for any engineering calculation involving rotation, waves, or oscillation — all of which use angles beyond 90°.</p>
            <WhyPanel tag="Why radius 1? What if the triangle is bigger?" depth={1}>
              <p style={{ marginBottom: 8 }}>Using radius 1 means the coordinates directly equal the ratios — no division needed. For a triangle with hypotenuse r, every side is r times the unit-circle value. Opposite = r·sin θ, adjacent = r·cos θ. The ratio opposite/hypotenuse = r·sin θ / r = sin θ — the r cancels. This is why sin and cos are dimensionless: they're ratios, not lengths.</p>
            </WhyPanel>
          </WhyPanel>

          <WhyPanel tag="Why is tan = sin/cos? Where does that come from?" depth={0}>
            <p style={{ marginBottom: 8 }}>Tan θ = opposite/adjacent. In the unit circle: opposite = sin θ, adjacent = cos θ. So tan θ = sin θ / cos θ. Number check at θ = 38°: sin 38° ≈ 0.6157, cos 38° ≈ 0.7880, tan 38° = 0.6157/0.7880 ≈ 0.7813. Calculator gives tan 38° ≈ 0.7813 ✓.</p>
            <p>Tan is not an independent function — it's always the ratio of the other two. That also means tan is undefined wherever cos θ = 0 (at 90° and 270°) — because dividing by zero is undefined.</p>
          </WhyPanel>
        </div>
      </div>

      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #b45309", borderRadius: "0 0 10px 10px", padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Albert spots two stars close together in the telescope, but can't aim at both with a right triangle — there's no right angle between them. He needs a formula for triangles that don't have a right angle. Chapter 2: <em>Two Stars, One Night.</em>
      </div>
    </div>
  );
}
