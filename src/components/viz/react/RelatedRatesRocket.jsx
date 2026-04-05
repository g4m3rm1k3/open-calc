/**
 * RelatedRatesRocket.jsx
 *
 * The premier related rates visualization — two classic problems, fully animated:
 *
 *   🚀 Rocket Launch  — Camera d ft away tracks a rising rocket.
 *                        tan(θ) = h/d  →  dθ/dt = (dh/dt · d) / (h² + d²)
 *
 *   ✈️  Plane & Observer — Observer on ground tracks direct distance to flying plane.
 *                        x² + H² = s²  →  ds/dt = (x · dx/dt) / s
 *
 * Five tabs:
 *   1. 🚀 Rocket  — animated rocket launch, pivoting camera, angle triangle
 *   2. ✈️ Plane   — animated plane, observer, direct-distance triangle
 *   3. ∫ Math     — live step-by-step derivation with slider values
 *   4. 📈 Graphs  — rate curves for both problems, side by side
 *   5. 💡 Insight — why they're the same structure, common mistakes
 *
 * Register: RelatedRatesRocket: lazy(() => import('./react/RelatedRatesRocket.jsx'))
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// KaTeX
// ─────────────────────────────────────────────────────────────────────────────
function useMath() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.katex);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(l);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s.onload = () => setReady(true); document.head.appendChild(s);
  }, []);
  return ready;
}
function M({ t, display = false, ready }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ready || !ref.current || !t) return;
    try { window.katex.render(t, ref.current, { throwOnError: false, displayMode: display }); }
    catch (_) { if (ref.current) ref.current.textContent = t; }
  }, [t, display, ready]);
  if (!t) return null;
  return <span ref={ref} style={{ display: display ? "block" : "inline" }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────────────────────────
function useIsDark() {
  const isDark = () => document.documentElement.classList.contains("dark");
  const [dark, setDark] = useState(isDark);
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────
const Ccard = {
  background: "var(--color-background-secondary)",
  borderRadius: "var(--border-radius-md,8px)",
  padding: "12px 14px",
  border: "0.5px solid var(--color-border-tertiary)",
  marginBottom: 8,
};
function makeC(dark) {
  return {
    card: Ccard,
    ok:     { borderLeft: "3px solid #059669", borderRadius: 0, background: dark ? "#052e16" : "#ecfdf5" },
    warn:   { borderLeft: "3px solid #d97706", borderRadius: 0, background: dark ? "#1c0a00" : "#fffbeb" },
    info:   { borderLeft: "3px solid #0891b2", borderRadius: 0, background: dark ? "#083344" : "#ecfeff" },
    purple: { borderLeft: "3px solid #7c3aed", borderRadius: 0, background: dark ? "#1a1547" : "#eef2ff" },
    red:    { borderLeft: "3px solid #dc2626", borderRadius: 0, background: dark ? "#3b1111" : "#fef2f2" },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas drawing primitives
// ─────────────────────────────────────────────────────────────────────────────
function drawSky(ctx, W, H, groundY, dark) {
  const g = ctx.createLinearGradient(0, 0, 0, groundY);
  if (dark) {
    g.addColorStop(0, "#020617"); g.addColorStop(0.6, "#0c1a3a"); g.addColorStop(1, "#1a2e54");
  } else {
    g.addColorStop(0, "#0369a1"); g.addColorStop(0.4, "#0ea5e9"); g.addColorStop(1, "#bae6fd");
  }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, groundY);
}

function drawStars(ctx, W, groundY, animT, dark) {
  if (!dark) return;
  const pts = [
    [0.07,0.06,1.1],[0.22,0.10,0.9],[0.37,0.04,1.2],[0.51,0.13,0.8],[0.66,0.07,1.0],
    [0.81,0.10,1.3],[0.13,0.21,0.7],[0.32,0.18,1.0],[0.57,0.23,0.8],[0.76,0.16,1.1],
    [0.04,0.38,0.9],[0.43,0.32,0.7],[0.72,0.27,1.2],[0.88,0.34,0.8],[0.18,0.44,1.0],
    [0.61,0.40,0.9],[0.09,0.54,0.7],[0.47,0.49,1.1],[0.84,0.47,0.8],[0.28,0.60,0.6],
  ];
  pts.forEach(([sx, sy, r]) => {
    const px = sx * W, py = sy * groundY;
    const tw = 0.5 + 0.4 * Math.sin(animT * 2.5 + px * 0.013 + py * 0.017);
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * tw})`; ctx.fill();
  });
}

function drawGround(ctx, W, H, groundY, dark) {
  const g = ctx.createLinearGradient(0, groundY, 0, H);
  if (dark) { g.addColorStop(0, "#1c1917"); g.addColorStop(1, "#0c0a09"); }
  else       { g.addColorStop(0, "#4ade80"); g.addColorStop(1, "#16a34a"); }
  ctx.fillStyle = g; ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = dark ? "#292524" : "#15803d"; ctx.fillRect(0, groundY, W, 3);
}

function drawRocket(ctx, cx, cy, size, animT, lit) {
  const bw = size * 0.55, bh = size * 1.6;
  // Flame
  if (lit) {
    const fh = size * (0.8 + 0.25 * Math.sin(animT * 9));
    const fw = bw * (0.55 + 0.2 * Math.sin(animT * 13));
    const fg = ctx.createRadialGradient(cx, cy + bh * 0.25 + fh * 0.2, 0, cx, cy + bh * 0.25 + fh * 0.5, fh);
    fg.addColorStop(0, "rgba(255,255,255,0.95)");
    fg.addColorStop(0.15, "rgba(147,197,253,0.9)");
    fg.addColorStop(0.4, "rgba(129,140,248,0.7)");
    fg.addColorStop(0.75, "rgba(239,68,68,0.45)");
    fg.addColorStop(1, "rgba(239,68,68,0)");
    ctx.beginPath(); ctx.ellipse(cx, cy + bh * 0.25 + fh * 0.55, fw / 2, fh * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = fg; ctx.fill();
  }
  // Body
  const bodyG = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
  bodyG.addColorStop(0, "#94a3b8"); bodyG.addColorStop(0.4, "#e2e8f0");
  bodyG.addColorStop(0.7, "#cbd5e1"); bodyG.addColorStop(1, "#94a3b8");
  ctx.beginPath();
  ctx.roundRect(cx - bw / 2, cy - bh * 0.65, bw, bh * 0.9, [bw / 3, bw / 3, 0, 0]);
  ctx.fillStyle = bodyG; ctx.fill(); ctx.strokeStyle = "#64748b"; ctx.lineWidth = 0.8; ctx.stroke();
  // Nose
  const ng = ctx.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
  ng.addColorStop(0, "#ef4444"); ng.addColorStop(0.5, "#fca5a5"); ng.addColorStop(1, "#ef4444");
  ctx.beginPath();
  ctx.moveTo(cx, cy - bh * 0.65 - size * 0.7);
  ctx.lineTo(cx - bw / 2, cy - bh * 0.65); ctx.lineTo(cx + bw / 2, cy - bh * 0.65); ctx.closePath();
  ctx.fillStyle = ng; ctx.fill(); ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 0.8; ctx.stroke();
  // Fins
  [-1, 1].forEach(s => {
    ctx.beginPath();
    ctx.moveTo(cx + s * bw / 2, cy + bh * 0.02);
    ctx.lineTo(cx + s * bw * 1.1, cy + bh * 0.28);
    ctx.lineTo(cx + s * bw / 2, cy + bh * 0.28); ctx.closePath();
    ctx.fillStyle = "#94a3b8"; ctx.fill(); ctx.strokeStyle = "#64748b"; ctx.lineWidth = 0.8; ctx.stroke();
  });
  // Window
  const wg = ctx.createRadialGradient(cx - bw * 0.08, cy - bh * 0.15, 0, cx, cy - bh * 0.12, bw * 0.22);
  wg.addColorStop(0, "#e0f2fe"); wg.addColorStop(0.5, "#7dd3fc"); wg.addColorStop(1, "#0284c7");
  ctx.beginPath(); ctx.arc(cx, cy - bh * 0.12, bw * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = wg; ctx.fill(); ctx.strokeStyle = "#0369a1"; ctx.lineWidth = 0.8; ctx.stroke();
}

function drawCamera(ctx, cx, cy, theta, dark) {
  const tripH = 32, spread = 16;
  ctx.strokeStyle = dark ? "#64748b" : "#94a3b8"; ctx.lineWidth = 2;
  [-spread, 0, spread].forEach(o => {
    ctx.beginPath(); ctx.moveTo(cx + o * 0.7, cy); ctx.lineTo(cx, cy - tripH); ctx.stroke();
  });
  ctx.save(); ctx.translate(cx, cy - tripH); ctx.rotate(-theta);
  const bw = 30, bh = 18;
  ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 4);
  ctx.fillStyle = dark ? "#1e293b" : "#334155"; ctx.fill();
  ctx.strokeStyle = dark ? "#475569" : "#64748b"; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.roundRect(-4, -bh / 2 - 6, 8, 6, 2);
  ctx.fillStyle = dark ? "#0f172a" : "#1e293b"; ctx.fill();
  ctx.beginPath(); ctx.arc(bw / 2 + 2, 0, 9, 0, Math.PI * 2);
  ctx.fillStyle = dark ? "#020617" : "#0f172a"; ctx.fill();
  ctx.strokeStyle = dark ? "#38bdf8" : "#0284c7"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(bw / 2 + 2, 0, 5.5, 0, Math.PI * 2);
  const lg = ctx.createRadialGradient(bw / 2, -2, 0, bw / 2 + 2, 0, 5.5);
  lg.addColorStop(0, dark ? "rgba(148,163,184,0.6)" : "rgba(125,211,252,0.8)");
  lg.addColorStop(1, dark ? "rgba(30,41,59,0.9)" : "rgba(3,105,161,0.9)");
  ctx.fillStyle = lg; ctx.fill();
  ctx.beginPath(); ctx.moveTo(bw / 2 + 11, 0); ctx.lineTo(bw / 2 + 28, 0);
  ctx.strokeStyle = dark ? "rgba(96,165,250,0.4)" : "rgba(59,130,246,0.3)";
  ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}

function drawPlane(ctx, cx, cy, dark, animT) {
  ctx.save(); ctx.translate(cx, cy);
  // Fuselage
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = dark ? "#e2e8f0" : "#f1f5f9"; ctx.fill();
  ctx.strokeStyle = dark ? "#94a3b8" : "#64748b"; ctx.lineWidth = 0.8; ctx.stroke();
  // Left wing
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8, -18); ctx.lineTo(-20, -2); ctx.closePath();
  ctx.fillStyle = dark ? "#cbd5e1" : "#e2e8f0"; ctx.fill(); ctx.strokeStyle = dark ? "#94a3b8" : "#64748b"; ctx.stroke();
  // Right wing
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8, 18); ctx.lineTo(-20, 2); ctx.closePath();
  ctx.fillStyle = dark ? "#cbd5e1" : "#e2e8f0"; ctx.fill(); ctx.stroke();
  // Tail
  ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(16, -10); ctx.lineTo(12, 0); ctx.closePath();
  ctx.fillStyle = dark ? "#94a3b8" : "#cbd5e1"; ctx.fill(); ctx.stroke();
  // Windows
  [-8, 0, 8].forEach(ox => {
    ctx.beginPath(); ctx.ellipse(ox, -3, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = dark ? "#bae6fd" : "#0ea5e9"; ctx.fill();
  });
  // Engine glow
  const glowA = 0.3 + 0.15 * Math.sin(animT * 8);
  ctx.beginPath(); ctx.ellipse(-22, 0, 4, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(251,191,36,${glowA})`; ctx.fill();
  ctx.restore();
}

function drawObserver(ctx, cx, cy, dark) {
  // Person silhouette
  ctx.fillStyle = dark ? "#94a3b8" : "#475569";
  ctx.beginPath(); ctx.arc(cx, cy - 22, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 8, cy - 10); ctx.lineTo(cx + 8, cy - 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 6, cy + 12);
  ctx.moveTo(cx, cy); ctx.lineTo(cx + 6, cy + 12); ctx.stroke();
  // Hand pointing up
  ctx.beginPath(); ctx.moveTo(cx + 8, cy - 10); ctx.lineTo(cx + 14, cy - 20); ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
// Info box helper
// ─────────────────────────────────────────────────────────────────────────────
function drawInfoBox(ctx, x, y, w, h, rows, dark) {
  ctx.fillStyle = dark ? "rgba(2,6,23,0.90)" : "rgba(255,255,255,0.93)";
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill();
  ctx.strokeStyle = dark ? "#1e3a5f" : "#bfdbfe"; ctx.lineWidth = 1; ctx.stroke();
  ctx.font = "11px system-ui";
  rows.forEach(([label, val, color], i) => {
    ctx.fillStyle = dark ? "#475569" : "#94a3b8";
    ctx.textAlign = "left"; ctx.fillText(label, x + 10, y + 18 + i * 18);
    ctx.fillStyle = color; ctx.textAlign = "right"; ctx.fillText(val, x + w - 8, y + 18 + i * 18);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Rocket Scene Canvas
// ─────────────────────────────────────────────────────────────────────────────
function RocketCanvas({ d, h, dhdt, dark, lit }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const animFrameRef = useRef(null);
  const animTRef = useRef(0);
  const lastTRef = useRef(null);

  const dRef = useRef(d); useEffect(() => { dRef.current = d; }, [d]);
  const hRef = useRef(h); useEffect(() => { hRef.current = h; }, [h]);
  const dhdtRef = useRef(dhdt); useEffect(() => { dhdtRef.current = dhdt; }, [dhdt]);
  const darkRef = useRef(dark); useEffect(() => { darkRef.current = dark; }, [dark]);
  const litRef = useRef(lit); useEffect(() => { litRef.current = lit; }, [lit]);

  const draw = useCallback((animT) => {
    const c = canvasRef.current; const wrap = wrapRef.current;
    if (!c || !wrap) return;
    c.width = wrap.clientWidth; c.height = 420;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const groundY = H - 80;
    const dk = darkRef.current;
    const curD = dRef.current, curH = hRef.current, curDhdt = dhdtRef.current;
    const isLit = litRef.current;

    drawSky(ctx, W, H, groundY, dk);
    drawStars(ctx, W, groundY, animT, dk);
    drawGround(ctx, W, H, groundY, dk);

    // Compute layout
    const mL = 100, availW = W - mL - 60, availH = groundY - 60;
    const maxDisplayH = Math.max(curD * 2.5, curH * 1.1);
    const scale = Math.min(availW / curD, availH / maxDisplayH);
    const camX = mL, camY = groundY;
    const padX = camX + curD * scale, padY = groundY;
    const rkX = padX, rkY = groundY - curH * scale;
    const cHeadY = camY - 32;
    const theta = Math.atan2(curH, curD);
    const hyp = Math.sqrt(curH * curH + curD * curD);
    const sec2 = (curH * curH + curD * curD) / (curD * curD);
    const dthdt_val = (curDhdt * curD) / (curH * curH + curD * curD);

    // Rocket trail
    if (isLit && curH > 20) {
      for (let i = 0; i < 16; i++) {
        const frac = (i + 1) / 16;
        const ty = rkY + (groundY - rkY) * frac * 0.45;
        const wob = Math.sin(animT * 4 + i * 1.4) * 3;
        ctx.beginPath(); ctx.arc(rkX + wob, ty, 3 + frac * 8, 0, Math.PI * 2);
        ctx.fillStyle = dk ? `rgba(100,116,139,${(1 - frac) * 0.13})` : `rgba(203,213,225,${(1 - frac) * 0.22})`;
        ctx.fill();
      }
    }

    // Hypotenuse line (dashed gray)
    ctx.save(); ctx.setLineDash([6, 4]);
    ctx.strokeStyle = dk ? "#475569" : "#94a3b8"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(camX, cHeadY); ctx.lineTo(rkX, rkY); ctx.stroke();

    // Height line h (amber)
    ctx.strokeStyle = dk ? "#fbbf24" : "#d97706"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(padX, groundY); ctx.lineTo(rkX, rkY); ctx.stroke();
    ctx.restore();

    // Right angle box at pad
    const bs = 10;
    ctx.strokeStyle = dk ? "#fbbf24" : "#d97706"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX - bs, groundY); ctx.lineTo(padX - bs, groundY - bs); ctx.lineTo(padX, groundY - bs);
    ctx.stroke();

    // Horizontal reference at camera
    ctx.strokeStyle = dk ? "#334155" : "#e2e8f0"; ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(camX, cHeadY); ctx.lineTo(camX + 55, cHeadY); ctx.stroke();
    ctx.setLineDash([]);

    // Angle arc
    const arcR = 44;
    ctx.strokeStyle = dk ? "#a78bfa" : "#7c3aed"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(camX, cHeadY, arcR, -theta, 0); ctx.stroke();
    const midA = -theta / 2;
    ctx.fillStyle = dk ? "#a78bfa" : "#7c3aed"; ctx.font = "bold 14px system-ui"; ctx.textAlign = "center";
    ctx.fillText("θ", camX + (arcR + 14) * Math.cos(midA), cHeadY + (arcR + 14) * Math.sin(midA) + 4);

    // Labels
    ctx.fillStyle = dk ? "#fbbf24" : "#d97706"; ctx.font = "bold 11px system-ui"; ctx.textAlign = "left";
    if (curH > 80) ctx.fillText(`h = ${curH.toFixed(0)} ft`, rkX + 14, (groundY + rkY) / 2 + 4);
    ctx.fillStyle = dk ? "#64748b" : "#475569"; ctx.textAlign = "center"; ctx.font = "11px system-ui";
    ctx.fillText(`d = ${curD.toFixed(0)} ft`, (camX + padX) / 2, groundY + 24);
    if (curH > 300) {
      const mx = (camX + rkX) / 2, my = (cHeadY + rkY) / 2;
      ctx.fillStyle = dk ? "#64748b" : "#94a3b8"; ctx.font = "10px system-ui";
      ctx.fillText(`${hyp.toFixed(0)} ft`, mx - 12, my - 10);
    }

    // Launch pad
    ctx.fillStyle = dk ? "#374151" : "#9ca3af"; ctx.fillRect(padX - 22, groundY - 8, 44, 8);
    ctx.fillStyle = dk ? "#1f2937" : "#6b7280"; ctx.fillRect(padX - 14, groundY - 12, 28, 4);

    // Camera
    drawCamera(ctx, camX, camY, theta, dk);
    ctx.fillStyle = dk ? "#64748b" : "#6b7280"; ctx.font = "10px system-ui"; ctx.textAlign = "center";
    ctx.fillText("CAMERA", camX, groundY + 24);

    // Rocket (positioned so base at rkY)
    const rSize = Math.max(12, Math.min(22, scale * 70));
    drawRocket(ctx, rkX, rkY - rSize * 0.55, rSize, animT, isLit);

    // Info box
    drawInfoBox(ctx, W - 178, 12, 166, 106, [
      ["θ", `${(theta * 180 / Math.PI).toFixed(2)}°`, dk ? "#a78bfa" : "#7c3aed"],
      ["sec²θ", sec2.toFixed(4), dk ? "#94a3b8" : "#475569"],
      ["dθ/dt", `${dthdt_val.toFixed(5)} rad/s`, dk ? "#34d399" : "#059669"],
      ["      ", `${(dthdt_val * 180 / Math.PI).toFixed(4)} °/s`, dk ? "#34d399" : "#059669"],
      ["h", `${curH.toFixed(0)} ft`, dk ? "#fbbf24" : "#d97706"],
    ], dk);
  }, []);

  useEffect(() => {
    function frame(t) {
      if (lastTRef.current === null) lastTRef.current = t;
      animTRef.current += Math.min((t - lastTRef.current) / 1000, 0.05);
      lastTRef.current = t;
      draw(animTRef.current);
      animFrameRef.current = requestAnimationFrame(frame);
    }
    lastTRef.current = null;
    animFrameRef.current = requestAnimationFrame(frame);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [draw]);

  return (
    <div ref={wrapRef}>
      <canvas ref={canvasRef} style={{ width: "100%", display: "block", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Plane Scene Canvas
// ─────────────────────────────────────────────────────────────────────────────
function PlaneCanvas({ alt, x, speed, dark }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const animFrameRef = useRef(null);
  const animTRef = useRef(0);
  const lastTRef = useRef(null);

  const altRef = useRef(alt); useEffect(() => { altRef.current = alt; }, [alt]);
  const xRef = useRef(x); useEffect(() => { xRef.current = x; }, [x]);
  const speedRef = useRef(speed); useEffect(() => { speedRef.current = speed; }, [speed]);
  const darkRef = useRef(dark); useEffect(() => { darkRef.current = dark; }, [dark]);

  const draw = useCallback((animT) => {
    const c = canvasRef.current; const wrap = wrapRef.current;
    if (!c || !wrap) return;
    c.width = wrap.clientWidth; c.height = 380;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;
    const groundY = H - 70;
    const dk = darkRef.current;
    const curAlt = altRef.current, curX = xRef.current, curSpd = speedRef.current;

    drawSky(ctx, W, H, groundY, dk);
    drawStars(ctx, W, groundY, animT, dk);
    drawGround(ctx, W, H, groundY, dk);

    // Geometry
    const maxX = Math.max(curAlt * 2.5, curX * 1.2, 1);
    const maxH = curAlt * 1.25;
    const mL = 110, mR = 50;
    const scaleX = (W - mL - mR) / (maxX * 2);   // observer is center
    const scaleY = (groundY - 50) / maxH;
    const scale = Math.min(scaleX, scaleY);

    // Observer in center-ish
    const obsX = mL + (maxX * scale) * 0.05;
    const obsY = groundY;
    // Plane position
    const planeX = obsX + curX * scale;
    const planeY = groundY - curAlt * scale;

    const s = Math.sqrt(curX * curX + curAlt * curAlt);
    const dsdt = (curX * curSpd) / s;

    // Ground direct-pos line (x)
    ctx.save(); ctx.setLineDash([6, 4]);
    ctx.strokeStyle = dk ? "#38bdf8" : "#0284c7"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(obsX, groundY); ctx.lineTo(planeX, groundY); ctx.stroke();

    // Altitude line H (constant, green dashed)
    ctx.strokeStyle = dk ? "#34d399" : "#059669"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(planeX, groundY); ctx.lineTo(planeX, planeY); ctx.stroke();

    // Direct distance s (hypotenuse, highlighted)
    ctx.strokeStyle = dk ? "#fbbf24" : "#d97706"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(obsX, obsY - 22); ctx.lineTo(planeX, planeY); ctx.stroke();
    ctx.restore();

    // Right angle at plane-ground intersection
    const bs = 10;
    ctx.strokeStyle = dk ? "#34d399" : "#059669"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(planeX - bs, groundY); ctx.lineTo(planeX - bs, groundY - bs); ctx.lineTo(planeX, groundY - bs);
    ctx.stroke();

    // Labels
    ctx.fillStyle = dk ? "#38bdf8" : "#0284c7"; ctx.font = "bold 11px system-ui"; ctx.textAlign = "center";
    ctx.fillText(`x = ${curX.toFixed(0)} ft`, (obsX + planeX) / 2, groundY + 24);

    ctx.fillStyle = dk ? "#34d399" : "#059669"; ctx.textAlign = "left";
    if (curAlt > 100) ctx.fillText(`H = ${curAlt} ft (const)`, planeX + 10, (groundY + planeY) / 2);

    // s label (along hypotenuse)
    const smx = (obsX + planeX) / 2, smy = (obsY - 22 + planeY) / 2;
    const dx = planeX - obsX, dy = planeY - (obsY - 22);
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len * 18, ny = dx / len * 18;
    ctx.fillStyle = dk ? "#fbbf24" : "#d97706"; ctx.font = "bold 11px system-ui"; ctx.textAlign = "center";
    ctx.fillText(`s = ${s.toFixed(0)} ft`, smx + nx, smy + ny);

    // Overhead marker (when x=0, ds/dt=0)
    if (curX < curAlt * 0.15) {
      ctx.fillStyle = dk ? "#a78bfa" : "#7c3aed"; ctx.font = "bold 11px system-ui"; ctx.textAlign = "center";
      ctx.fillText("⬆ directly overhead!", planeX, planeY - 30);
      ctx.font = "10px system-ui";
      ctx.fillText("ds/dt ≈ 0 here!", planeX, planeY - 16);
    }

    // Observer
    drawObserver(ctx, obsX, obsY, dk);
    ctx.fillStyle = dk ? "#64748b" : "#6b7280"; ctx.font = "10px system-ui"; ctx.textAlign = "center";
    ctx.fillText("OBSERVER", obsX, groundY + 24);

    // Plane (flying left → right, rotated to face direction of travel)
    drawPlane(ctx, planeX, planeY, dk, animT);
    ctx.fillStyle = dk ? "#64748b" : "#475569"; ctx.font = "10px system-ui"; ctx.textAlign = "center";
    ctx.fillText(`${curSpd} ft/s →`, planeX + 30, planeY - 30);

    // Info box
    const dsdtSign = dsdt >= 0 ? "" : "−";
    drawInfoBox(ctx, W - 184, 12, 172, 106, [
      ["x", `${curX.toFixed(0)} ft`, dk ? "#38bdf8" : "#0284c7"],
      ["s = √(x²+H²)", `${s.toFixed(1)} ft`, dk ? "#fbbf24" : "#d97706"],
      ["x/s ratio", (curX / s).toFixed(4), dk ? "#94a3b8" : "#475569"],
      ["ds/dt", `${dsdtSign}${Math.abs(dsdt).toFixed(2)} ft/s`, dk ? "#34d399" : "#059669"],
      ["vs dx/dt", `${((dsdt / curSpd) * 100).toFixed(1)}% of plane speed`, dk ? "#94a3b8" : "#475569"],
    ], dk);
  }, []);

  useEffect(() => {
    function frame(t) {
      if (lastTRef.current === null) lastTRef.current = t;
      animTRef.current += Math.min((t - lastTRef.current) / 1000, 0.05);
      lastTRef.current = t;
      draw(animTRef.current);
      animFrameRef.current = requestAnimationFrame(frame);
    }
    lastTRef.current = null;
    animFrameRef.current = requestAnimationFrame(frame);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [draw]);

  return (
    <div ref={wrapRef}>
      <canvas ref={canvasRef} style={{ width: "100%", display: "block", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Graph (dual curves)
// ─────────────────────────────────────────────────────────────────────────────
function DualRateGraph({ rocketD, rocketDhdt, rocketH, planeAlt, planeDxdt, planeX, dark }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const draw = useCallback(() => {
    const c = canvasRef.current; const wrap = wrapRef.current;
    if (!c || !wrap) return;
    c.width = wrap.clientWidth; c.height = 560;
    const ctx = c.getContext("2d");
    const W = c.width, H = c.height;

    ctx.fillStyle = dark ? "#0f172a" : "#f8fafc"; ctx.fillRect(0, 0, W, H);

    // Two graphs stacked
    function drawPanel(panelY, panelH, title, color, xMax, yMax, curX, curY, curveFn, xLabel, yLabel, annotation) {
      const pad = { l: 60, r: 16, t: 28, b: 40 };
      const iW = W - pad.l - pad.r, iH = panelH - pad.t - pad.b;
      const ox = pad.l, oy = panelY + pad.t;

      // Title
      ctx.fillStyle = color; ctx.font = "bold 12px system-ui"; ctx.textAlign = "left";
      ctx.fillText(title, ox, panelY + 16);

      // Grid
      ctx.strokeStyle = dark ? "#1e293b" : "#f1f5f9"; ctx.lineWidth = 0.8;
      for (let i = 0; i <= 5; i++) {
        const y = oy + (i / 5) * iH;
        ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + iW, y); ctx.stroke();
      }
      for (let i = 0; i <= 6; i++) {
        const x = ox + (i / 6) * iW;
        ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + iH); ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = dark ? "#334155" : "#94a3b8"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy + iH); ctx.lineTo(ox + iW, oy + iH); ctx.stroke();

      // Axis labels
      ctx.fillStyle = dark ? "#475569" : "#94a3b8"; ctx.font = "10px system-ui";
      for (let i = 0; i <= 6; i++) {
        const val = (i / 6) * xMax;
        ctx.textAlign = "center";
        ctx.fillText(`${(val / 1000).toFixed(1)}k`, ox + (i / 6) * iW, oy + iH + 14);
      }
      for (let i = 0; i <= 5; i++) {
        const val = yMax * (1 - i / 5);
        ctx.textAlign = "right";
        ctx.fillText(val.toFixed(4), ox - 4, oy + (i / 5) * iH + 4);
      }
      ctx.textAlign = "center";
      ctx.fillText(xLabel, ox + iW / 2, oy + iH + 28);
      ctx.save(); ctx.translate(14, oy + iH / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0); ctx.restore();

      // Curve
      ctx.beginPath();
      for (let i = 0; i <= 400; i++) {
        const xv = (i / 400) * xMax;
        const yv = curveFn(xv);
        const px = ox + (xv / xMax) * iW;
        const py = oy + iH - Math.min(yv / yMax, 1.0) * iH;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      const cg = ctx.createLinearGradient(ox, 0, ox + iW, 0);
      cg.addColorStop(0, color); cg.addColorStop(1, color + "88");
      ctx.strokeStyle = cg; ctx.lineWidth = 2.5; ctx.stroke();

      // Fill
      ctx.beginPath();
      for (let i = 0; i <= 400; i++) {
        const xv = (i / 400) * xMax;
        const yv = curveFn(xv);
        const px = ox + (xv / xMax) * iW;
        const py = oy + iH - Math.min(yv / yMax, 1) * iH;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.lineTo(ox + iW, oy + iH); ctx.lineTo(ox, oy + iH); ctx.closePath();
      ctx.fillStyle = color.replace(/[^,]+(?=\))/, "0.07"); // hacky but works for hex
      ctx.fillStyle = color + "11"; ctx.fill();

      // Current value
      if (curX <= xMax) {
        const cx2 = ox + (curX / xMax) * iW;
        ctx.strokeStyle = dark ? "#fbbf24" : "#d97706"; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(cx2, oy); ctx.lineTo(cx2, oy + iH); ctx.stroke();
        ctx.setLineDash([]);
        const cy2 = oy + iH - Math.min(curY / yMax, 1) * iH;
        ctx.beginPath(); ctx.arc(cx2, cy2, 6, 0, Math.PI * 2);
        ctx.fillStyle = dark ? "#fbbf24" : "#d97706"; ctx.fill();
        ctx.strokeStyle = dark ? "#1e293b" : "#fff"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = dark ? "#fbbf24" : "#d97706"; ctx.font = "bold 9px system-ui";
        ctx.textAlign = cx2 > W / 2 ? "right" : "left";
        ctx.fillText(`${curY.toFixed(5)}`, cx2 > W / 2 ? cx2 - 10 : cx2 + 10, cy2 - 10);
      }

      // Annotation
      ctx.fillStyle = dark ? "#64748b" : "#94a3b8"; ctx.font = "10px system-ui"; ctx.textAlign = "right";
      ctx.fillText(annotation, ox + iW - 4, oy + 14);
    }

    const halfH = H / 2 - 8;

    // Rocket panel
    const rXmax = rocketD * 3;
    const rYmax = rocketDhdt / rocketD;
    const rocketCurve = (hv) => (rocketDhdt * rocketD) / (hv * hv + rocketD * rocketD);
    drawPanel(0, halfH, "🚀 Rocket: dθ/dt vs height h", dark ? "#a78bfa" : "#7c3aed",
      rXmax, rYmax, rocketH, rocketCurve(rocketH), rocketCurve,
      "Height h (ft)", "dθ/dt (rad/s)", `dθ/dt = (dh/dt·d)/(h²+d²)   d=${rocketD}ft, dh/dt=${rocketDhdt}ft/s`);

    // Plane panel
    const pXmax = planeAlt * 4;
    const pYmax = planeDxdt;
    const planeCurve = (xv) => (xv * planeDxdt) / Math.sqrt(xv * xv + planeAlt * planeAlt);
    const planeS = Math.sqrt(planeX * planeX + planeAlt * planeAlt);
    const planeCur = (planeX * planeDxdt) / planeS;
    drawPanel(halfH + 16, halfH, "✈️  Plane: ds/dt vs horizontal distance x", dark ? "#38bdf8" : "#0284c7",
      pXmax, pYmax, planeX, planeCur, planeCurve,
      "Horizontal distance x (ft)", "ds/dt (ft/s)", `ds/dt = (x·dx/dt)/s   H=${planeAlt}ft, dx/dt=${planeDxdt}ft/s`);

    // Divider
    ctx.strokeStyle = dark ? "#1e293b" : "#e2e8f0"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, halfH + 8); ctx.lineTo(W, halfH + 8); ctx.stroke();
  }, [rocketD, rocketDhdt, rocketH, planeAlt, planeDxdt, planeX, dark]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => {
    const ro = new ResizeObserver(() => draw());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div ref={wrapRef}>
      <canvas ref={canvasRef} style={{ width: "100%", display: "block", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Math Panel — step-by-step for selected scenario
// ─────────────────────────────────────────────────────────────────────────────
function MathPanel({ scenario, rocketD, rocketH, rocketDhdt, planeAlt, planeX, planeDxdt, ready, dark }) {
  const C = makeC(dark);

  const Step = ({ n, color, title, children }) => (
    <div style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: color + "22", border: `1.5px solid ${color}`, fontSize: 13, fontWeight: 600, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 8 }}>{title}</div>
        {children}
      </div>
    </div>
  );

  if (scenario === "rocket") {
    const theta = Math.atan2(rocketH, rocketD);
    const hyp = Math.sqrt(rocketH * rocketH + rocketD * rocketD);
    const sec2 = (rocketH * rocketH + rocketD * rocketD) / (rocketD * rocketD);
    const dthdt = (rocketDhdt * rocketD) / (rocketH * rocketH + rocketD * rocketD);

    return (
      <div>
        <div style={{ ...C.card, ...C.purple, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#c4b5fd" : "#6d28d9", marginBottom: 4 }}>🚀 Rocket Problem Setup</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
            Camera is <strong>{rocketD.toLocaleString()} ft</strong> from the pad. Rocket rises at <strong>{rocketDhdt} ft/sec</strong>.
            Currently at <strong>h = {rocketH.toFixed(0)} ft</strong>. Find dθ/dt.
          </div>
        </div>

        <Step n={1} color="#0891b2" title="Geometric Relationship (no calculus yet)">
          <div style={{ ...C.card, ...C.info, marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>Opposite = h, Adjacent = d → use tangent:</p>
            <div style={{ textAlign: "center" }}>
              <M t={`\\tan(\\theta) = \\frac{h}{d} = \\frac{${rocketH.toFixed(0)}}{${rocketD}} = ${(rocketH / rocketD).toFixed(4)}`} display ready={ready} />
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6 }}>
              So θ = arctan({rocketH.toFixed(0)}/{rocketD}) = <strong>{(theta * 180 / Math.PI).toFixed(3)}°</strong>
            </p>
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>This is pure geometry — no derivatives yet.</div>
        </Step>

        <Step n={2} color="#7c3aed" title="Differentiate Both Sides with Respect to t">
          <div style={{ ...C.card, background: "var(--color-background-primary)", textAlign: "center", marginBottom: 8 }}>
            <M t={`\\frac{d}{dt}[\\tan\\theta] = \\frac{d}{dt}\\!\\left[\\frac{h}{d}\\right]`} display ready={ready} />
            <M t={`\\sec^2(\\theta)\\cdot\\frac{d\\theta}{dt} = \\frac{1}{d}\\cdot\\frac{dh}{dt}`} display ready={ready} />
          </div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Chain rule on left: d/dt[tan θ] = sec²θ · dθ/dt. Right side: d is constant, so only dh/dt survives.</div>
        </Step>

        <Step n={3} color="#d97706" title={`Find sec²θ at h = ${rocketH.toFixed(0)} ft`}>
          <div style={{ ...C.card, ...C.warn, marginBottom: 8 }}>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>By Pythagorean theorem:</p>
            <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
              <M t={`\\text{hyp} = \\sqrt{${rocketH.toFixed(0)}^2 + ${rocketD}^2} = ${hyp.toFixed(2)}\\text{ ft}`} display ready={ready} />
            </div>
            <div style={{ textAlign: "center" }}>
              <M t={`\\sec^2\\theta = \\frac{\\text{hyp}^2}{d^2} = \\frac{h^2+d^2}{d^2} = \\frac{${(rocketH * rocketH + rocketD * rocketD).toFixed(0)}}{${(rocketD * rocketD).toFixed(0)}} = ${sec2.toFixed(5)}`} display ready={ready} />
            </div>
          </div>
        </Step>

        <Step n={4} color="#059669" title="Substitute and Solve">
          <div style={{ ...C.card, ...C.ok, marginBottom: 8 }}>
            <div style={{ textAlign: "center", padding: "4px 0" }}>
              <M t={`${sec2.toFixed(4)}\\cdot\\frac{d\\theta}{dt} = \\frac{${rocketDhdt}}{${rocketD}}`} display ready={ready} />
              <M t={`\\boxed{\\frac{d\\theta}{dt} = \\frac{${rocketDhdt}\\cdot ${rocketD}}{${rocketH.toFixed(0)}^2+${rocketD}^2} = ${dthdt.toFixed(6)}\\text{ rad/s} = ${(dthdt * 180 / Math.PI).toFixed(4)}^\\circ/\\text{s}}`} display ready={ready} />
            </div>
          </div>
        </Step>

        <div style={{ ...C.card, marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Clean Formula (algebraically simplified)</div>
          <div style={{ textAlign: "center", marginBottom: 6 }}>
            <M t={`\\frac{d\\theta}{dt} = \\frac{(dh/dt)\\cdot d}{h^2+d^2} = \\frac{${rocketDhdt}\\times ${rocketD}}{${(rocketH * rocketH + rocketD * rocketD).toFixed(0)}} = ${dthdt.toFixed(6)}\\text{ rad/s}`} display ready={ready} />
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
            Substituting sec²θ = (h²+d²)/d² eliminates trig — pure algebra remains.
            The rate is a Lorentzian in h: peaks at {(rocketDhdt / rocketD).toFixed(5)} rad/s when h=0, falls toward 0 as h→∞.
          </p>
        </div>
      </div>
    );
  }

  // Plane math
  const planeS = Math.sqrt(planeX * planeX + planeAlt * planeAlt);
  const dsdt = (planeX * planeDxdt) / planeS;
  const xOverS = planeX / planeS;

  return (
    <div>
      <div style={{ ...C.card, ...C.info, marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: dark ? "#67e8f9" : "#0e7490", marginBottom: 4 }}>✈️ Plane Problem Setup</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Plane flies at altitude <strong>H = {planeAlt.toLocaleString()} ft</strong> (constant) at speed <strong>{planeDxdt} ft/s</strong>.
          Currently <strong>x = {planeX.toFixed(0)} ft</strong> from directly overhead. Find ds/dt.
        </div>
      </div>

      <Step n={1} color="#0891b2" title="Geometric Relationship — Pythagorean Theorem">
        <div style={{ ...C.card, ...C.info, marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>x = horizontal distance, H = altitude (constant), s = direct distance:</p>
          <div style={{ textAlign: "center" }}>
            <M t={`[x(t)]^2 + H^2 = [s(t)]^2`} display ready={ready} />
            <M t={`${planeX.toFixed(0)}^2 + ${planeAlt}^2 = s^2 \\quad \\Rightarrow \\quad s = ${planeS.toFixed(2)}\\text{ ft}`} display ready={ready} />
          </div>
        </div>
      </Step>

      <Step n={2} color="#7c3aed" title="Differentiate Both Sides with Respect to t">
        <div style={{ ...C.card, background: "var(--color-background-primary)", textAlign: "center", marginBottom: 8 }}>
          <M t={`2x\\cdot\\frac{dx}{dt} + 0 = 2s\\cdot\\frac{ds}{dt}`} display ready={ready} />
          <M t={`x\\cdot\\frac{dx}{dt} = s\\cdot\\frac{ds}{dt}`} display ready={ready} />
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>H² becomes 0 (constant). x and s each get a "rate tag". Divide both sides by 2.</div>
      </Step>

      <Step n={3} color="#d97706" title={`Substitute at x = ${planeX.toFixed(0)} ft`}>
        <div style={{ ...C.card, ...C.warn, marginBottom: 8 }}>
          <div style={{ textAlign: "center" }}>
            <M t={`${planeX.toFixed(0)}\\cdot ${planeDxdt} = ${planeS.toFixed(2)}\\cdot\\frac{ds}{dt}`} display ready={ready} />
          </div>
        </div>
      </Step>

      <Step n={4} color="#059669" title="Solve for ds/dt">
        <div style={{ ...C.card, ...C.ok, marginBottom: 8 }}>
          <div style={{ textAlign: "center" }}>
            <M t={`\\boxed{\\frac{ds}{dt} = \\frac{x\\cdot dx/dt}{s} = \\frac{${planeX.toFixed(0)}\\times ${planeDxdt}}{${planeS.toFixed(2)}} = ${dsdt.toFixed(4)}\\text{ ft/s}}`} display ready={ready} />
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4 }}>
          = {(xOverS * 100).toFixed(1)}% of the plane's speed. When directly overhead (x=0), ds/dt = 0 — the distance momentarily doesn't change.
        </div>
      </Step>

      <div style={{ ...C.card, marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Clean Formula</div>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <M t={`\\frac{ds}{dt} = \\frac{x}{\\sqrt{x^2+H^2}}\\cdot\\frac{dx}{dt} = \\frac{x}{s}\\cdot\\frac{dx}{dt}`} display ready={ready} />
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
          The factor x/s is the cosine of the elevation angle. When x=0 (overhead): cos=0, ds/dt=0.
          When x→∞: cos→1, ds/dt→dx/dt. The direct distance approaches the horizontal speed as the plane recedes.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Insight Panel
// ─────────────────────────────────────────────────────────────────────────────
function InsightPanel({ rocketD, rocketH, rocketDhdt, planeAlt, planeX, planeDxdt, ready, dark }) {
  const C = makeC(dark);
  const [open, setOpen] = useState({});
  const tog = (k) => setOpen(o => ({ ...o, [k]: !o[k] }));

  const Sec = ({ id, title, color, children }) => (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => tog(id)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, border: `0.5px solid ${open[id] ? color : "var(--color-border-tertiary)"}`, background: open[id] ? color + "18" : "var(--color-background-secondary)", color: open[id] ? color : "var(--color-text-primary)", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {title}<span style={{ fontSize: 12 }}>{open[id] ? "▲" : "▼"}</span>
      </button>
      {open[id] && <div style={{ padding: "10px 14px", border: `0.5px solid ${color}33`, borderTop: "none", borderRadius: "0 0 8px 8px", background: "var(--color-background-secondary)" }}>{children}</div>}
    </div>
  );

  return (
    <div>
      <div style={{ ...C.card, ...C.purple, marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#c4b5fd" : "#6d28d9", marginBottom: 6 }}>Same structure. Different geometry.</div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
          Both problems have a right triangle with one fixed side. You differentiate the constraint equation.
          The chain rule produces "rate tags" automatically. The only skill is picking the right geometry for step 1.
        </p>
      </div>

      <Sec id="compare" title="Side-by-side comparison" color="#7c3aed">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          {[
            { label: "🚀 Rocket", items: ["Fixed side: d (camera to pad)", "Changing: h (height)", "Track: θ (angle)", "Trig: tan(θ) = h/d", "Result: dθ/dt = dhdt·d/(h²+d²)"] },
            { label: "✈️ Plane", items: ["Fixed side: H (altitude)", "Changing: x (horizontal)", "Track: s (direct distance)", "Trig: x²+H²=s²", "Result: ds/dt = x·dxdt/s"] },
          ].map(({ label, items }) => (
            <div key={label} style={{ ...C.card, background: "var(--color-background-primary)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6 }}>{label}</div>
              {items.map((it, i) => <div key={i} style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{it}</div>)}
            </div>
          ))}
        </div>
        <div style={{ ...C.card, ...C.ok }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
            <strong style={{ color: "#059669" }}>The key difference:</strong> rocket uses a trig relationship (tan), plane uses Pythagorean.
            Both produce a rate by differentiating — the chain rule does the heavy lifting in both cases.
          </p>
        </div>
      </Sec>

      <Sec id="rocket_intuition" title="🚀 Why does the camera slow down as the rocket rises?" color="#a78bfa">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: 8 }}>
          At launch (h=0), 1 foot of rise creates a noticeable angle change — the rocket is right on the horizon line.
          At high altitude (h >> d), 1 foot of rise barely changes the angle — the rocket is nearly overhead.
          <br /><br />
          The formula dθ/dt = dhdt·d/(h²+d²) = (dhdt/d)·1/(1+(h/d)²) is a <strong>Lorentzian</strong>.
          It peaks at h=0 and decays smoothly to 0. Same shape appears in quantum mechanics and signal processing.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "h = 0 (launch)", rate: rocketDhdt / rocketD, note: "max rate" },
            { label: `h = d = ${rocketD}ft`, rate: rocketDhdt / (2 * rocketD), note: "half max" },
            { label: `h = 2d = ${2 * rocketD}ft`, rate: rocketDhdt / (5 * rocketD), note: "20% max" },
          ].map(({ label, rate, note }) => (
            <div key={label} style={{ ...C.card, background: "var(--color-background-primary)", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: dark ? "#a78bfa" : "#7c3aed", fontFamily: "monospace" }}>{rate.toFixed(5)}</div>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 2 }}>{note} rad/s</div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec id="plane_intuition" title="✈️ Why does ds/dt equal zero directly overhead?" color="#38bdf8">
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: 8 }}>
          When the plane is directly overhead (x=0), the direct distance s equals the altitude H.
          As the plane moves, it's moving <em>perpendicular</em> to the line connecting observer to plane.
          A perpendicular motion doesn't change the <em>length</em> of that line — only its direction.
          So at that exact instant, ds/dt = 0 even though the plane is flying at full speed.
          <br /><br />
          As x grows, the plane's horizontal motion has more and more component <em>along</em> the line s — so ds/dt grows toward dx/dt.
        </p>
        <div style={{ ...C.card, ...C.info }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
            The ratio x/s is the cosine of the elevation angle. ds/dt = (x/s)·dx/dt = cos(elevation)·dx/dt.
            This is a projection: how much of the horizontal speed "projects onto" the line s.
          </p>
        </div>
      </Sec>

      <Sec id="mistake" title="The #1 mistake: substituting before differentiating" color="#dc2626">
        <div style={{ ...C.card, ...C.red }}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
            <strong style={{ color: dark ? "#fca5a5" : "#dc2626" }}>Wrong (rocket):</strong> Plug h=2000 into tan(θ)=h/d first → get a constant angle → differentiate → 0 = (1/d)·600. Nonsense.
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.75, marginTop: 6 }}>
            <strong style={{ color: dark ? "#fca5a5" : "#dc2626" }}>Wrong (plane):</strong> Plug x=3000 into x²+H²=s² → get s=5000 (a constant) → differentiate → 0 = 2s·ds/dt. Nonsense.
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.75, marginTop: 6 }}>
            <strong style={{ color: dark ? "#6ee7b7" : "#059669" }}>Rule:</strong> Always differentiate first, substitute second.
            Substituting turns a variable into a constant — its derivative is 0. The unknown rate disappears before you can find it.
          </p>
        </div>
      </Sec>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function RelatedRatesRocket({ params = {} }) {
  const ready = useMath();
  const dark = useIsDark();
  const C = makeC(dark);

  // Rocket state
  const [rocketD, setRocketD] = useState(4000);
  const [rocketDhdt, setRocketDhdt] = useState(600);
  const [rocketH, setRocketH] = useState(2000);
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const [rocketAnimating, setRocketAnimating] = useState(false);

  // Plane state
  const [planeAlt, setPlaneAlt] = useState(4000);
  const [planeDxdt, setPlaneDxdt] = useState(600);
  const [planeX, setPlaneX] = useState(3000);
  const [planeAnimating, setPlaneAnimating] = useState(false);

  // UI
  const [tab, setTab] = useState("rocket");
  const [mathScenario, setMathScenario] = useState("rocket");

  // Animation loops
  const animRef = useRef(null);
  const lastTRef = useRef(null);
  const rocketDRef = useRef(rocketD); useEffect(() => { rocketDRef.current = rocketD; }, [rocketD]);
  const rocketDhdtRef = useRef(rocketDhdt); useEffect(() => { rocketDhdtRef.current = rocketDhdt; }, [rocketDhdt]);
  const planeDxdtRef = useRef(planeDxdt); useEffect(() => { planeDxdtRef.current = planeDxdt; }, [planeDxdt]);
  const planeAltRef = useRef(planeAlt); useEffect(() => { planeAltRef.current = planeAlt; }, [planeAlt]);

  // Rocket animation
  const rAnimRef = useRef(null);
  const rLastTRef = useRef(null);
  useEffect(() => {
    if (!rocketAnimating) { if (rAnimRef.current) cancelAnimationFrame(rAnimRef.current); rLastTRef.current = null; return; }
    function frame(t) {
      if (rLastTRef.current === null) rLastTRef.current = t;
      const dt = Math.min((t - rLastTRef.current) / 1000, 0.05); rLastTRef.current = t;
      setRocketH(prev => {
        const next = prev + rocketDhdtRef.current * dt * 4;
        const max = rocketDRef.current * 2.7;
        if (next >= max) { setRocketAnimating(false); return max; }
        return next;
      });
      rAnimRef.current = requestAnimationFrame(frame);
    }
    rAnimRef.current = requestAnimationFrame(frame);
    return () => { if (rAnimRef.current) cancelAnimationFrame(rAnimRef.current); };
  }, [rocketAnimating]);

  // Plane animation
  const pAnimRef = useRef(null);
  const pLastTRef = useRef(null);
  useEffect(() => {
    if (!planeAnimating) { if (pAnimRef.current) cancelAnimationFrame(pAnimRef.current); pLastTRef.current = null; return; }
    function frame(t) {
      if (pLastTRef.current === null) pLastTRef.current = t;
      const dt = Math.min((t - pLastTRef.current) / 1000, 0.05); pLastTRef.current = t;
      setPlaneX(prev => {
        const next = prev + planeDxdtRef.current * dt * 3;
        const max = planeAltRef.current * 3.5;
        if (next >= max) { setPlaneAnimating(false); return max; }
        return next;
      });
      pAnimRef.current = requestAnimationFrame(frame);
    }
    pAnimRef.current = requestAnimationFrame(frame);
    return () => { if (pAnimRef.current) cancelAnimationFrame(pAnimRef.current); };
  }, [planeAnimating]);

  // Computed values (live)
  const rocketTheta = Math.atan2(rocketH, rocketD);
  const rocketDthdt = (rocketDhdt * rocketD) / (rocketH * rocketH + rocketD * rocketD);
  const planeS = Math.sqrt(planeX * planeX + planeAlt * planeAlt);
  const planeDsdt = (planeX * planeDxdt) / planeS;

  const tabBtn = (k, l, c) => ({
    padding: "5px 11px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: tab === k ? 500 : 400,
    border: `0.5px solid ${tab === k ? c : "var(--color-border-secondary)"}`,
    background: tab === k ? c + "22" : "transparent", color: tab === k ? c : "var(--color-text-secondary)",
  });

  return (
    <div style={{ fontFamily: "var(--font-sans,system-ui)", padding: "4px 0" }}>
      <style>{`@keyframes sd{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ ...C.card, borderLeft: "3px solid #0891b2", borderRadius: 0, background: dark ? "#083344" : "#ecfeff", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#0891b2", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3 }}>Related Rates — Two Classic Problems</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: dark ? "#67e8f9" : "#0e7490", marginBottom: 4 }}>The Rocket & The Plane</div>
        <div style={{ fontSize: 13, color: dark ? "#67e8f9" : "#0e7490", lineHeight: 1.7 }}>
          Two right triangles. One side fixed. One side moving. One thing to find. Same method — different geometry.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {[["rocket", "🚀 Rocket", "#7c3aed"], ["plane", "✈️ Plane", "#0891b2"], ["math", "∫ Math", "#d97706"], ["graph", "📈 Graphs", "#059669"], ["insight", "💡 Insight", "#dc2626"]].map(([k, l, c]) => (
          <button key={k} onClick={() => setTab(k)} style={tabBtn(k, l, c)}>{l}</button>
        ))}
      </div>

      {/* ─── ROCKET TAB ─── */}
      {tab === "rocket" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...C.card, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Rocket Controls</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Camera distance (d)", v: rocketD, min: 500, max: 8000, step: 500, set: (n) => { setRocketD(n); setRocketH(h => Math.min(h, n * 2.7)); }, unit: "ft", color: "#7c3aed" },
                { label: "Rocket speed (dh/dt)", v: rocketDhdt, min: 100, max: 1500, step: 50, set: setRocketDhdt, unit: "ft/s", color: "#059669" },
              ].map(({ label, v, min, max, step, set, unit, color }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color }}>{v.toLocaleString()} {unit}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={v} onChange={e => set(Number(e.target.value))} style={{ width: "100%", accentColor: color }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Height h</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}>{rocketH.toFixed(0)} ft</span>
              </div>
              <input type="range" min={0} max={rocketD * 2.7} step={10} value={rocketH}
                onChange={e => { if (!rocketAnimating) { setRocketH(Number(e.target.value)); setRocketLaunched(Number(e.target.value) > 0); } }}
                style={{ width: "100%", accentColor: "#d97706" }} disabled={rocketAnimating} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => { setRocketH(0); setRocketLaunched(true); setRocketAnimating(true); }}
                disabled={rocketAnimating}
                style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: rocketAnimating ? (dark ? "#1e293b" : "#e2e8f0") : "#7c3aed", color: rocketAnimating ? (dark ? "#475569" : "#94a3b8") : "#fff", fontSize: 13, fontWeight: 600, cursor: rocketAnimating ? "not-allowed" : "pointer" }}>
                🚀 Launch
              </button>
              <button onClick={() => { setRocketAnimating(false); setRocketH(2000); setRocketLaunched(false); }}
                style={{ padding: "7px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer" }}>
                ↺ Reset
              </button>
              <div style={{ flex: 1, display: "flex", gap: 14, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: dark ? "#a78bfa" : "#7c3aed" }}>θ = {(rocketTheta * 180 / Math.PI).toFixed(2)}°</span>
                <span style={{ fontSize: 12, color: dark ? "#34d399" : "#059669", fontFamily: "monospace" }}>dθ/dt = {rocketDthdt.toFixed(5)} rad/s</span>
              </div>
            </div>
          </div>
          <RocketCanvas d={rocketD} h={rocketH} dhdt={rocketDhdt} dark={dark} lit={rocketLaunched} />
          <div style={{ ...C.card, ...C.ok, marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", marginBottom: 4 }}>Live Result</div>
            <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
              At h = <strong>{rocketH.toFixed(0)} ft</strong>: camera rotates at <strong style={{ color: dark ? "#34d399" : "#059669" }}>{rocketDthdt.toFixed(6)} rad/s</strong> ({(rocketDthdt * 180 / Math.PI).toFixed(4)}°/s).
              {rocketH < 100 ? " ← Fastest rotation right at launch!" : rocketH > rocketD * 1.5 ? " ← Camera barely moves — rocket is nearly overhead." : " Camera slows as rocket rises."}
            </div>
          </div>
        </div>
      )}

      {/* ─── PLANE TAB ─── */}
      {tab === "plane" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...C.card, marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>Plane Controls</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Altitude H (constant)", v: planeAlt, min: 1000, max: 8000, step: 500, set: setPlaneAlt, unit: "ft", color: "#0891b2" },
                { label: "Plane speed (dx/dt)", v: planeDxdt, min: 100, max: 1000, step: 50, set: setPlaneDxdt, unit: "ft/s", color: "#059669" },
              ].map(({ label, v, min, max, step, set, unit, color }) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color }}>{v.toLocaleString()} {unit}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={v} onChange={e => set(Number(e.target.value))} style={{ width: "100%", accentColor: color }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Horizontal distance x (from overhead)</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}>{planeX.toFixed(0)} ft</span>
              </div>
              <input type="range" min={0} max={planeAlt * 3.5} step={50} value={planeX}
                onChange={e => { if (!planeAnimating) setPlaneX(Number(e.target.value)); }}
                style={{ width: "100%", accentColor: "#d97706" }} disabled={planeAnimating} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => { setPlaneX(0); setPlaneAnimating(true); }}
                disabled={planeAnimating}
                style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: planeAnimating ? (dark ? "#1e293b" : "#e2e8f0") : "#0891b2", color: planeAnimating ? (dark ? "#475569" : "#94a3b8") : "#fff", fontSize: 13, fontWeight: 600, cursor: planeAnimating ? "not-allowed" : "pointer" }}>
                ✈️ Fly Over
              </button>
              <button onClick={() => { setPlaneAnimating(false); setPlaneX(3000); }}
                style={{ padding: "7px 14px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer" }}>
                ↺ Reset
              </button>
              <div style={{ flex: 1, display: "flex", gap: 14, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: dark ? "#fbbf24" : "#d97706" }}>s = {planeS.toFixed(0)} ft</span>
                <span style={{ fontSize: 12, color: dark ? "#34d399" : "#059669", fontFamily: "monospace" }}>ds/dt = {planeDsdt.toFixed(2)} ft/s</span>
              </div>
            </div>
          </div>
          <PlaneCanvas alt={planeAlt} x={planeX} speed={planeDxdt} dark={dark} />
          <div style={{ ...C.card, ...C.ok, marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#059669", marginBottom: 4 }}>Live Result</div>
            <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}>
              At x = <strong>{planeX.toFixed(0)} ft</strong>: direct distance grows at <strong style={{ color: dark ? "#34d399" : "#059669" }}>{planeDsdt.toFixed(2)} ft/s</strong> — {((planeDsdt / planeDxdt) * 100).toFixed(1)}% of the plane's speed.
              {planeX < planeAlt * 0.1 ? " ← At x=0, ds/dt=0! The distance isn't changing (momentarily)." : planeX > planeAlt * 2.5 ? " ← Far away: ds/dt approaches the plane's own speed." : ""}
            </div>
          </div>
        </div>
      )}

      {/* ─── MATH TAB ─── */}
      {tab === "math" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[["rocket", "🚀 Rocket derivation", "#7c3aed"], ["plane", "✈️ Plane derivation", "#0891b2"]].map(([k, l, c]) => (
              <button key={k} onClick={() => setMathScenario(k)} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `0.5px solid ${mathScenario === k ? c : "var(--color-border-secondary)"}`, background: mathScenario === k ? c + "22" : "transparent", color: mathScenario === k ? c : "var(--color-text-secondary)", fontSize: 13, fontWeight: mathScenario === k ? 600 : 400, cursor: "pointer" }}>
                {l}
              </button>
            ))}
          </div>
          <MathPanel scenario={mathScenario} rocketD={rocketD} rocketH={rocketH} rocketDhdt={rocketDhdt} planeAlt={planeAlt} planeX={planeX} planeDxdt={planeDxdt} ready={ready} dark={dark} />
        </div>
      )}

      {/* ─── GRAPH TAB ─── */}
      {tab === "graph" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <div style={{ ...C.card, marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
              Both rate curves shown together. The <span style={{ color: dark ? "#fbbf24" : "#d97706", fontWeight: 500 }}>yellow dot</span> marks your current position.
              Notice: rocket rate <em>decreases</em> monotonically. Plane rate <em>increases</em> monotonically. Completely opposite behaviors — same chain rule technique.
            </p>
          </div>
          <DualRateGraph rocketD={rocketD} rocketDhdt={rocketDhdt} rocketH={rocketH} planeAlt={planeAlt} planeDxdt={planeDxdt} planeX={planeX} dark={dark} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <div style={{ ...C.card, ...C.purple }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#c4b5fd" : "#7c3aed", marginBottom: 4 }}>🚀 Lorentzian (1/(1+x²))</div>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                Peaks at h=0, decays to 0. Same shape as quantum spectral lines, signal resonance curves.
              </p>
            </div>
            <div style={{ ...C.card, ...C.info }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: dark ? "#67e8f9" : "#0891b2", marginBottom: 4 }}>✈️ Sigmoidal approach</div>
              <p style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                Starts at 0 (directly overhead), rises toward dx/dt. ds/dt = (x/s)·dx/dt is the projection cosine times speed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSIGHT TAB ─── */}
      {tab === "insight" && (
        <div style={{ animation: "sd .2s ease-out" }}>
          <InsightPanel rocketD={rocketD} rocketH={rocketH} rocketDhdt={rocketDhdt} planeAlt={planeAlt} planeX={planeX} planeDxdt={planeDxdt} ready={ready} dark={dark} />
        </div>
      )}
    </div>
  );
}
