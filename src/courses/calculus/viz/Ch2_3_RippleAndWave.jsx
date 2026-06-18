/**
 * Ch2_3_RippleAndWave.jsx
 * Book 2, Chapter 3 — "The Ripple and the Wave"
 * Topic: Trig functions as periodic graphs — period, amplitude, phase shift
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
  const colors = [{ border: "#0891b2", bg: "#ecfeff", text: "#0e7490" }, { border: "#7c3aed", bg: "#ede9fe", text: "#5b21b6" }, { border: "#059669", bg: "#ecfdf5", text: "#047857" }];
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

function WaveCanvas({ A, period, phase }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const ox = 40, oy = H / 2, xscale = (W - 80) / (3 * Math.PI);
    ctx.strokeStyle = isDark ? "#374151" : "#e5e7eb"; ctx.lineWidth = 0.5;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(ox + (i * Math.PI) * xscale, 20); ctx.lineTo(ox + (i * Math.PI) * xscale, H - 20); ctx.stroke();
    }
    ctx.strokeStyle = isDark ? "#6b7280" : "#9ca3af"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(W - 40, oy); ctx.stroke();
    // reference sin (gray)
    ctx.beginPath();
    for (let px = 0; px <= W - 80; px++) {
      const x = px / xscale, y = Math.sin(x);
      px === 0 ? ctx.moveTo(ox + px, oy - y * 60) : ctx.lineTo(ox + px, oy - y * 60);
    }
    ctx.strokeStyle = isDark ? "#374151" : "#d1d5db"; ctx.lineWidth = 1; ctx.stroke();
    // main wave
    ctx.beginPath();
    const k = (2 * Math.PI) / period, phaseRad = (phase * Math.PI) / 180;
    for (let px = 0; px <= W - 80; px++) {
      const x = px / xscale, y = A * Math.sin(k * x + phaseRad);
      px === 0 ? ctx.moveTo(ox + px, oy - y * 60) : ctx.lineTo(ox + px, oy - y * 60);
    }
    ctx.strokeStyle = "#0891b2"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = isDark ? "#67e8f9" : "#0e7490"; ctx.font = "11px var(--font-sans,sans-serif)"; ctx.textAlign = "left";
    ctx.fillText(`A=${A}, period=${period.toFixed(2)}, phase=${phase}°`, ox, 16);
  }, [A, period, phase]);
  return <canvas ref={ref} width={580} height={180} style={{ width: "100%", borderRadius: 8, display: "block" }} />;
}

export default function Ch2_3_RippleAndWave({ params = {} }) {
  const [A, setA] = useState(1.5);
  const [period, setPeriod] = useState(Math.PI * 2);
  const [phase, setPhase] = useState(0);
  const ready = useMath();

  const panel = { background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden", marginBottom: 14 };
  const hdr = (tag, ts, title) => (<div style={{ padding: "10px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, ...ts }}>{tag}</span><span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{title}</span></div>);
  const body = { padding: "16px 20px" };
  const mbox = { background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "12px 16px", textAlign: "center", overflowX: "auto", margin: "10px 0" };
  const insight = { padding: "12px 14px", borderLeft: "3px solid #0891b2", background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: "10px 0" };

  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: ".5rem 0", maxWidth: 740 }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 20, background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>Book 2 · Chapter 3</div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--color-text-tertiary)", marginBottom: 5 }}>The situation</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.45 }}>Albert measures the tide height every hour for a week and plots it. The pattern repeats exactly every 12.4 hours. He needs a function that repeats — and he finds that sin does exactly this, if you know what amplitude, period, and phase shift mean and why.</div>
      </div>
      <div style={panel}>
        {hdr("Story", { background: "#ecfeff", color: "#155e75" }, "The ripple and the wave")}
        <div style={{ ...body, fontSize: 14, lineHeight: 1.8, color: "var(--color-text-primary)" }}>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#6b21a8", fontWeight: 500 }}>Albert</span> pinned his tide chart to the wall. The heights went up, came down, went up again — exactly the same shape, every 12.4 hours. <em style={{ color: "var(--color-text-secondary)" }}>"It's periodic. The function repeats."</em></p>
          <p style={{ marginBottom: 12 }}><span style={{ color: "#065f46", fontWeight: 500 }}>John</span> looked at it. <em style={{ color: "var(--color-text-secondary)" }}>"That's just the tide."</em></p>
          <p style={{ marginBottom: 12 }}><em style={{ color: "var(--color-text-secondary)" }}>"Yes. And also the motion of every planet, every sound wave, every AC circuit, every signal ever transmitted. They all use the same function."</em></p>
          <p style={{ marginBottom: 0 }}><span style={{ color: "#1e40af", fontWeight: 500 }}>Mic</span> looked at the chart. <em style={{ color: "var(--color-text-secondary)" }}>"It looks like sin."</em> Albert nodded. <em style={{ color: "var(--color-text-secondary)" }}>"It is sin. But stretched, shifted, and scaled. Let me show you each piece."</em></p>
        </div>
      </div>
      <div style={panel}>
        {hdr("Discovery", { background: "#ecfeff", color: "#155e75" }, "f(x) = A·sin(kx + φ) — three controls, three meanings")}
        <div style={body}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 14 }}>The gray curve is sin(x) — the baseline. Your curve is blue. Each slider changes one independent feature. Notice how they don't interfere with each other.</p>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, marginBottom: 12 }}><WaveCanvas A={A} period={period} phase={phase} /></div>
          {[["Amplitude A", A, 0.5, 3, 0.1, setA, "#0891b2", "Controls height — how tall the wave is. A=2 means it reaches 2 units high and −2 low. No effect on how fast it repeats."], ["Period", period, 1, 12, 0.5, setPeriod, "#7c3aed", "Controls width — how long before it repeats. Period = 2π gives one complete cycle in 2π units (≈6.28). Smaller period = faster oscillation."], ["Phase shift (°)", phase, -180, 180, 5, setPhase, "#059669", "Controls where the wave starts — slides it left or right without changing shape or height. Phase shift = 90° means the wave starts at its peak instead of at zero."]].map(([label, val, min, max, step, setter, col, note]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 110 }}>{label}</span>
                <input type="range" min={min} max={max} value={val} step={step} onChange={e => setter(parseFloat(e.target.value))} style={{ flex: 1, maxWidth: 200 }} />
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 40, color: col }}>{typeof val === "number" && step < 1 ? val.toFixed(1) : Math.round(val)}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", paddingLeft: 2 }}>{note}</div>
            </div>
          ))}
          <div style={mbox}>{ready && <M t={`f(x) = ${A.toFixed(1)}\\sin\\!\\left(\\frac{2\\pi}{${period.toFixed(2)}}x + ${phase}°\\right)`} display ready={ready} />}</div>
          <div style={insight}><strong style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>Three independent parameters:</strong> Amplitude (how tall), period (how wide), phase (where it starts). Any periodic phenomenon can be modelled by choosing these three numbers. This is why sin and cos appear in everything from sound engineering to electrical grids to orbital mechanics.</div>
          <WhyPanel tag="Why is the period 2π and not 360?" depth={0}>
            <p style={{ marginBottom: 8 }}>Because radians. One full rotation around the unit circle = 2π radians of arc length. At exactly x = 2π, the point on the circle returns to where it started — so sin(2π) = sin(0) = 0. The period of sin is 2π radians, which equals 360° only because 360° is defined to equal 2π radians.</p>
            <p>If you used degrees in sin, the period would be 360 — but calculus would require a correction factor of π/180 everywhere a derivative appears. Radians eliminate this constant permanently. Book 3 Chapter 3.4 proves this rigorously.</p>
          </WhyPanel>
          <WhyPanel tag="Why do sound waves, tides, and circuits all use the same function?" depth={0}>
            <p style={{ marginBottom: 8 }}>Any physical system that oscillates (returns to the same state repeatedly) and has a restoring force proportional to displacement (like a spring: F = −kx) produces motion described by sin and cos. The math forces it. This is Hooke's Law for springs, and the equation F = −kx has sin and cos as its solutions — we prove this in differential equations.</p>
            <p>Tides are driven by gravitational force (periodic). Sound is pressure oscillation (periodic). AC current alternates direction (periodic). They're physically different phenomena but mathematically identical: each is a solution to the same class of differential equation.</p>
          </WhyPanel>
        </div>
      </div>
      <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderTop: "2px solid #b45309", borderRadius: "0 0 10px 10px", padding: "12px 16px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
        <strong style={{ fontWeight: 500, color: "#b45309" }}>Coming next:</strong> Albert tries to combine two trig functions — he needs sin(u+v) but only knows sin u and cos u separately. He discovers the angle addition formula, which will turn out to be the key dependency underneath the derivative of sine. Chapter 4: <em>The Angle Addition.</em>
      </div>
    </div>
  );
}
