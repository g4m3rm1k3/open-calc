import { useState, useRef, useEffect, useCallback } from "react";
import footballBackground from "../../../assets/football-background.jpg";

// NFL-style fonts
const FONT_HEADER = "'Bebas Neue', 'Oswald', 'Arial Narrow', 'Segoe UI', sans-serif";
const FONT_BODY   = "'Inter', 'Segoe UI', 'Trebuchet MS', Arial, sans-serif";
const FONT_MONO   = "'JetBrains Mono', 'Consolas', 'Courier New', monospace";

function useIsDark() {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return dark;
}

// --- Canvas & Camera ----------------------------------------------------------
// Field coords: x in [0..100] yd (playing field), y in [-26.5..26.5] yd wide.
// Camera is mutable and updated by the on-screen 2.5D controls.
// proj() reads from camera each call so all drawing auto-updates on zoom/tilt.

const W = 1280, H = 720;

// BACKGROUND IMAGE — set BG_IMAGE to a URL string to enable a stadium background.
// Example:  const BG_IMAGE = "https://example.com/stadium.jpg";
// Leave as null to use the default dark sky gradient (safe, no network request).
// The image loads lazily — a bad URL silently falls back to the sky gradient.
const BG_IMAGE = footballBackground;

// Default camera — centered field, moderate zoom, classic iso angle
// -- Camera defaults --------------------------------------------------------
// oy = canvas Y where y=0 (near sideline) maps to — lower = field lower on screen.
// With H=500, oy=300 centers field vertically. oy=420 pushed it to bottom.
// Default: oy=290 gives field in upper-center with room for ball arc above.
const CAM_DEFAULT = {
  ox: 88,    // canvas x origin — shifts field left/right
  oy: 410,   // canvas y baseline — balanced for taller canvas
  xs: 10.2,  // px per yard downfield
  ys: 4.15,  // px per yard lateral
  tilt: 0.38,// isometric tilt angle
  zs: 15,    // px per yard of height (ball arc headroom)
};

// Mutable camera — modified by the 2.5D controls, reset to CAM_DEFAULT
let CAM = { ...CAM_DEFAULT };

// Optional background image — fully safe, never crashes.
// _bgImg stays null until the image actually loads successfully.
let _bgImg = null;
if (BG_IMAGE) {
  try {
    const img = new Image();
    img.onload  = () => { _bgImg = img; };   // only set after confirmed load
    img.onerror = () => { _bgImg = null; };  // bad URL ? silently use sky gradient
    img.src = BG_IMAGE;
  } catch (_) {
    // Image API unavailable (e.g. SSR) — ignore, sky gradient used instead
  }
}

function proj(fdx, fdy, fz = 0) {
  return {
    cx: CAM.ox + fdx * CAM.xs + fdy * CAM.ys * CAM.tilt,
    cy: CAM.oy - fdy * CAM.ys - fz * CAM.zs,
  };
}

// --- Formula parser -----------------------------------------------------------
function parseExpr(expr, varNames = ["t"]) {
  if (!expr || !expr.trim()) return null;
  try {
    const js = expr
      .trim()
      .replace(/\^/g, "**")
      .replace(/\bsqrt\b/g, "Math.sqrt")
      .replace(/\bsin\b/g, "Math.sin")
      .replace(/\bcos\b/g, "Math.cos")
      .replace(/\btan\b/g, "Math.tan")
      .replace(/\babs\b/g, "Math.abs")
      .replace(/\bpi\b/g, "Math.PI")
      .replace(/\be\b/g, "Math.E")
      .replace(/\bln\b/g, "Math.log")
      .replace(/\bexp\b/g, "Math.exp")
      .replace(/\batan\b/g, "Math.atan");
    const fn = new Function(...varNames, `"use strict"; return (${js});`);
    return (...vals) => {
      try {
        const r = fn(...vals);
        return typeof r === "number" && isFinite(r) ? r : null;
      } catch {
        return null;
      }
    };
  } catch {
    return null;
  }
}

// --- Route engine -------------------------------------------------------------
// FIX: when dur is missing/undefined treat it as "rest of time" (last segment),
// but we must avoid the Infinity * 0 = NaN trap. Use a finite large sentinel.
function posAt(player, t) {
  let x = player.x0, y = player.y0, rem = t;
  const segs = player.segs || [];
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const isLast = i === segs.length - 1;
    // dur undefined on last segment means "forever" — use rem directly
    const dur = (s.dur !== undefined) ? s.dur : (isLast ? rem : 0);
    const dt = Math.min(rem, dur);
    x += (s.vx ?? 0) * dt;
    y += (s.vy ?? 0) * dt;
    rem -= dt;
    if (rem <= 0) break;
  }
  return { x, y };
}

function velAt(player, t) {
  let rem = t;
  const segs = player.segs || [];
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const isLast = i === segs.length - 1;
    const dur = (s.dur !== undefined) ? s.dur : (isLast ? Infinity : 0);
    rem -= dur;
    if (rem <= 0 || isLast) return { vx: s.vx ?? 0, vy: s.vy ?? 0 };
  }
  const last = segs[segs.length - 1];
  return { vx: last?.vx ?? 0, vy: last?.vy ?? 0 };
}

// --- Ball arc ----------------------------------------------------------------
// peakZ in yards. Returns height above field at time t.
function ballArc(t, tThrow, tLand, peakZ = 3.5) {
  if (t < tThrow || t > tLand) return 0;
  const tf = tLand - tThrow;
  if (tf <= 0) return 0;
  const tp = tf / 2;
  const g = (2 * peakZ) / (tp * tp);
  const v0z = g * tp;
  const dt = t - tThrow;
  return Math.max(0, v0z * dt - 0.5 * g * dt * dt);
}

// --- Canvas drawing -----------------------------------------------------------
function drawIsoField(ctx) {
  ctx.clearRect(0, 0, W, H);

  // -- Background (sky or custom stadium image) ------------------------------
  // To use a custom image: set BG_IMAGE near the top of this file.
  if (_bgImg && _bgImg.complete && _bgImg.naturalWidth > 0) {
    try {
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.drawImage(_bgImg, 0, 0, W, H);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,5,15,0.52)";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } catch (_) {
      _bgImg = null; // drawing failed — fall through to sky gradient next frame
      ctx.restore();
    }
  }
  if (!_bgImg || !_bgImg.complete || !_bgImg.naturalWidth) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#060e18");
    sky.addColorStop(0.55, "#0a1a2e");
    sky.addColorStop(1, "#112840");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  }

  // Alternating grass stripes (10 yd bands)
  for (let i = 0; i < 10; i++) {
    const x0 = i * 10, x1 = x0 + 10;
    const a = proj(x0, -26.5), b = proj(x1, -26.5);
    const c = proj(x1, 26.5), d = proj(x0, 26.5);
    ctx.beginPath();
    ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy);
    ctx.lineTo(c.cx, c.cy); ctx.lineTo(d.cx, d.cy);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? "#15803d" : "#166534";
    ctx.fill();
  }

  // Endzones
  [
    [0, 10, "#7c1d1d", "HOME"],
    [90, 100, "#1a3a6e", "AWAY"],
  ].forEach(([x0, x1, col, label]) => {
    const a = proj(x0, -26.5), b = proj(x1, -26.5);
    const c = proj(x1, 26.5), d = proj(x0, 26.5);
    ctx.beginPath();
    ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy);
    ctx.lineTo(c.cx, c.cy); ctx.lineTo(d.cx, d.cy);
    ctx.closePath();
    ctx.fillStyle = col; ctx.globalAlpha = 0.88; ctx.fill(); ctx.globalAlpha = 1;
    const mid = proj((x0 + x1) / 2, 0);
    ctx.save();
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, mid.cx, mid.cy);
    ctx.restore();
  });

  // Yard lines
  for (let yd = 10; yd <= 90; yd += 10) {
    const a = proj(yd, -26.5), b = proj(yd, 26.5);
    ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy);
    ctx.strokeStyle = yd === 50 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)";
    ctx.lineWidth = yd === 50 ? 1.5 : 0.8;
    ctx.stroke();
    const lbl = proj(yd, -23);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(yd, lbl.cx, lbl.cy);
  }

  // 5-yd hash marks
  for (let yd = 10; yd <= 90; yd += 5) {
    [-3.5, 3.5].forEach((hy) => {
      const a = proj(yd, hy - 1), b = proj(yd, hy + 1);
      ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy);
      ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 0.8; ctx.stroke();
    });
  }

  // Sidelines
  [-26.5, 26.5].forEach((fy) => {
    const a = proj(10, fy), b = proj(90, fy);
    ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy);
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1; ctx.stroke();
  });
}

function drawLOS(ctx, losX, label = "LOS") {
  const los1 = proj(losX, -26.5), los2 = proj(losX, 26.5);
  ctx.beginPath(); ctx.moveTo(los1.cx, los1.cy); ctx.lineTo(los2.cx, los2.cy);
  ctx.strokeStyle = "rgba(251,191,36,0.35)"; ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
  const losLbl = proj(losX, -24);
  ctx.fillStyle = "rgba(251,191,36,0.6)";
  ctx.font = "7px sans-serif"; ctx.textAlign = "left";
  ctx.fillText(label, losLbl.cx + 2, losLbl.cy);
}

function drawPlayer(ctx, fdx, fdy, color, label, fz = 0, r = 8) {
  const { cx, cy } = proj(fdx, fdy, fz);
  const sh = proj(fdx, fdy, 0);
  ctx.beginPath();
  ctx.ellipse(sh.cx, sh.cy, r * 1.4, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = `bold ${label.length > 2 ? 6 : 7}px sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy);
  ctx.textBaseline = "alphabetic";
}

function drawBallFull(ctx, fdx, fdy, fz) {
  const { cx, cy } = proj(fdx, fdy, fz);
  const sh = proj(fdx, fdy, 0);
  const r = 4 + fz * 1.2;
  ctx.beginPath();
  ctx.ellipse(sh.cx, sh.cy, Math.max(3, r * 0.9), Math.max(1.5, r * 0.4), 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(0,0,0,${Math.max(0.1, 0.4 - fz * 0.06)})`; ctx.fill();
  if (fz > 0.3) {
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(sh.cx, sh.cy); ctx.lineTo(cx, cy);
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.8;
    ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fz > 0.2 ? "#f59e0b" : "#b45309"; ctx.fill();
  ctx.strokeStyle = "#78350f"; ctx.lineWidth = 1.2; ctx.stroke();
}

function drawVelArrow(ctx, fdx, fdy, vx, vy, color, scale = 1.0) {
  if (!vx && !vy) return;
  const from = proj(fdx, fdy, 0);
  const to = proj(fdx + vx * scale, fdy + vy * scale, 0);
  const dx = to.cx - from.cx, dy = to.cy - from.cy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 3) return;
  ctx.strokeStyle = color; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(from.cx, from.cy); ctx.lineTo(to.cx, to.cy); ctx.stroke();
  const angle = Math.atan2(dy, dx);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(to.cx, to.cy);
  ctx.lineTo(to.cx - 8 * Math.cos(angle - 0.4), to.cy - 8 * Math.sin(angle - 0.4));
  ctx.lineTo(to.cx - 8 * Math.cos(angle + 0.4), to.cy - 8 * Math.sin(angle + 0.4));
  ctx.closePath(); ctx.fill();
}

function drawRoute(ctx, player, color) {
  if (!player.segs?.length) return;
  ctx.setLineDash([3, 3]); ctx.strokeStyle = color + "55"; ctx.lineWidth = 1;
  ctx.beginPath();
  let x = player.x0, y = player.y0;
  const p0 = proj(x, y);
  ctx.moveTo(p0.cx, p0.cy);
  for (const s of player.segs) {
    const dur = s.dur ?? 3;
    x += (s.vx ?? 0) * Math.min(dur, 5);
    y += (s.vy ?? 0) * Math.min(dur, 5);
    const p = proj(x, y);
    ctx.lineTo(p.cx, p.cy);
  }
  ctx.stroke(); ctx.setLineDash([]);
}

function drawImpulseBar(ctx, impulse, needed) {
  const bx = 10, by = H - 28, bw = 160, bh = 14;
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(bx, by, bw, bh);
  const pct = Math.min(impulse / needed, 1);
  ctx.fillStyle = pct >= 1 ? "#4ade80" : pct > 0.6 ? "#fbbf24" : "#f87171";
  ctx.fillRect(bx, by, bw * pct, bh);
  ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 0.8;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = "white"; ctx.font = "8px sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(`J = ${impulse.toFixed(0)} / ${needed} lb·yd/s`, bx + bw / 2, by + bh / 2);
  ctx.textBaseline = "alphabetic";
}

function drawLeadPoint(ctx, fdx, fdy, color) {
  const { cx, cy } = proj(fdx, fdy, 0);
  const s = 6;
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke();
}

// --- Jitter -------------------------------------------------------------------
function makeJitter(play) {
  const offsets = {};
  play.players.forEach((p) => {
    if (!p.offense && !p.controlled && !p.dynamic) {
      offsets[p.id] = {
        dx: (Math.random() - 0.5) * 5,
        dy: (Math.random() - 0.5) * 5,
      };
    }
  });
  return offsets;
}

function applyJitter(play, offsets) {
  if (!offsets || Object.keys(offsets).length === 0) return play;
  return {
    ...play,
    players: play.players.map((p) => {
      const o = offsets[p.id];
      if (!o) return p;
      return { ...p, x0: p.x0 + o.dx, y0: p.y0 + o.dy };
    }),
  };
}

// --- Global timestep ---------------------------------------------------------
const DT = 1 / 60;

// --- PLAYS --------------------------------------------------------------------
// All plays use realistic NFL values:
//   - Ball speed 22 yd/s (~45 mph) for passes, 28 yd/s for Hail Mary
//   - WR speed ~9-10 yd/s, CB ~8-9 yd/s
//   - Field x: 10 (home endzone line) to 90 (away endzone line), LOS around 30
//   - peakZ in yards (typical NFL pass peaks 5-8 yards high)

const PLAYS = [
  // --------------------------------------------------------------------
  // P1 — Slant Route: Integration
  // Lead-pass problem: x(t) = x0 + ?v dt
  // --------------------------------------------------------------------
  {
    id: "P1",
    name: "Slant Route",
    down: "2nd & 8",
    concept: "Integration · x(t) = x0 + ?v dt",
    color: "#22c55e",
    description:
      "WR1 runs a slant at 9 yd/s downfield and 6 yd/s inside. Write x_r(t) and y_r(t) by integrating velocity, then pick throw time T so the ball arrives WHERE THE RECEIVER WILL BE. Ball speed = 22 yd/s.",
    theory: [
      "CONCEPT: Integration gives position from velocity.",
      "WHY: ?v dt adds up tiny displacements over time.",
      "WR1: vx = 9 yd/s, vy = -6 yd/s (constant).",
      "x_r(t) = x0 + ?0? 9 dt = 30 + 9t",
      "y_r(t) = y0 + ?0? -6 dt = 10 - 6t",
      "KEY: Don't throw to where WR is now —",
      "throw to where he'll BE when ball arrives.",
      "STEP 1: Write x_r(t) and y_r(t).",
      "STEP 2: Pick T. Ball flight ˜ dist/22 s.",
      "STEP 3: Target = WR1(T + t_flight).",
      "STEP 4: Adjust T until ball meets WR.",
      "CHECK: At T=0.8s WR1 ˜ (37.2, 5.2).",
      "Dist QB?WR ˜ 9 yd, t_f ˜ 0.4s.",
      "? True target = WR1(1.2s) ˜ (40.8, 2.8).",
    ],
    inputs: [
      {
        id: "rx",
        label: "x_r(t) — WR1 downfield position (yd):",
        placeholder: "30 + 9*t",
        hint: "WR1 starts near x=30 (check field), runs at vx=9 yd/s. Formula: x0 + 9*t",
      },
      {
        id: "ry",
        label: "y_r(t) — WR1 lateral position (yd):",
        placeholder: "10 - 6*t",
        hint: "WR1 starts near y=10 (check field), cuts inside at vy=-6 yd/s. Formula: y0 - 6*t",
      },
      {
        id: "T",
        label: "Throw at time T (seconds after snap):",
        placeholder: "0.8",
        hint: "Ball speed = 22 yd/s. Lead the receiver. Try T = 0.5 to 1.2",
      },
    ],
    players: [
      { id: "QB",  x0: 28, y0: 0,  color: "#38bdf8", label: "QB",  segs: [{ vx: 0,  vy: 0  }], offense: true  },
      { id: "WR1", x0: 30, y0: 10, color: "#f97316", label: "WR1", segs: [{ vx: 9,  vy: -6 }], offense: true  },
      { id: "WR2", x0: 30, y0: 22, color: "#fb923c", label: "WR2", segs: [{ vx: 9,  vy: 0  }], offense: true  },
      { id: "CB1", x0: 33, y0: 11, color: "#f87171", label: "CB",  segs: [{ vx: 8,  vy: -5 }], offense: false },
      { id: "CB2", x0: 33, y0: 23, color: "#fca5a5", label: "CB2", segs: [{ vx: 9,  vy: 0  }], offense: false },
      { id: "LB",  x0: 38, y0: 2,  color: "#c084fc", label: "LB",  segs: [{ dur: 0.8, vx: -2, vy: 6 }, { vx: -1, vy: 0 }], offense: false },
      { id: "S",   x0: 48, y0: 8,  color: "#a855f7", label: "S",   segs: [{ vx: -4, vy: -5 }], offense: false },
    ],
    los: 30,
    qbId: "QB",
    targetId: "WR1",
    coverId: "CB1",
    vBall: 22,
    catchR: 1.8,
    peakZ: 4,
    run(inputs) {
      const rx_fn = parseExpr(inputs.rx, ["t"]);
      const ry_fn = parseExpr(inputs.ry, ["t"]);
      const T = parseFloat(inputs.T);
      if (!rx_fn) return { error: "rx", msg: "Invalid — try: 30 + 9*t" };
      if (!ry_fn) return { error: "ry", msg: "Invalid — try: 10 - 6*t" };
      if (isNaN(T) || T < 0 || T > 6) return { error: "T", msg: "T must be 0–6 s" };

      // No pre-simulation validation — sim always runs.
      // We check equations after and mention in result message.
      const wr1Act = this.players.find((p) => p.id === "WR1");
      const userVx1 = (rx_fn(1.0) ?? 0) - (rx_fn(0) ?? 0);
      const userVy1 = (ry_fn(1.0) ?? 0) - (ry_fn(0) ?? 0);
      const equationOk = Math.abs(userVx1 - 9) < 1.5 && Math.abs(userVy1 - (-6)) < 1.5;

      const qb  = this.players.find((p) => p.id === this.qbId);
      const tgt = this.players.find((p) => p.id === this.targetId);
      const cb  = this.players.find((p) => p.id === this.coverId);

      // Lead pass: aim at WR1's position when the ball actually arrives
      const qbPos    = posAt(qb, T);
      const wrAtT    = posAt(tgt, T);
      const estDist  = Math.sqrt((wrAtT.x - qbPos.x) ** 2 + (wrAtT.y - qbPos.y) ** 2);
      const estFlight = estDist / this.vBall;
      const wrLead   = posAt(tgt, T + estFlight);
      const leadDist = Math.sqrt((wrLead.x - qbPos.x) ** 2 + (wrLead.y - qbPos.y) ** 2);
      const tFlight  = leadDist / this.vBall;
      const wrFinal  = posAt(tgt, T + tFlight);
      const tLand    = T + leadDist / this.vBall;

      const dx = wrFinal.x - qbPos.x, dy = wrFinal.y - qbPos.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      const bvx = (dx / d) * this.vBall, bvy = (dy / d) * this.vBall;

      let thrown = false, bx = qbPos.x, by = qbPos.y;
      const trail = [], frames = [];

      for (let i = 0; i < 720; i++) {
        const t = i * DT;
        const players = this.players.map((p) => ({ ...p, ...posAt(p, t), ...velAt(p, t) }));
        if (!thrown && t >= T) { thrown = true; }
        if (thrown) { bx += bvx * DT; by += bvy * DT; trail.push({ x: bx, y: by }); }
        const fz = ballArc(t, T, tLand, this.peakZ);
        const tgtNow = posAt(tgt, t), cbNow = posAt(cb, t);
        const catchDist  = Math.sqrt((bx - tgtNow.x) ** 2 + (by - tgtNow.y) ** 2);
        const cbBallDist = Math.sqrt((bx - cbNow.x)  ** 2 + (by - cbNow.y)  ** 2);
        frames.push({
          t, players, bx, by, fz, thrown, trail: [...trail],
          catchDist, cbBallDist, leadX: wrFinal.x, leadY: wrFinal.y,
          tLand, T, flightTime: tFlight,
        });
        if (thrown && catchDist < this.catchR && fz < 1.5) {
          const eqNote = !equationOk ? ` (Tip: equations off — WR1 vx=9, vy=-6. Fix: x_r(t) = ${wr1Act.x0.toFixed(1)} + 9*t)` : "";
          return { frames, result: "win", msg: `CAUGHT! t=${t.toFixed(2)}s. Lead pass of ${leadDist.toFixed(1)} yd.${eqNote}` };
        }
        if (thrown && cbBallDist < 1.8 && fz < 1.2 && t > T + 0.2)
          return { frames, result: "loss", msg: `Tipped by CB at t=${t.toFixed(2)}s! Try T ˜ ${(T - 0.2).toFixed(2)}s.` };
        if (t > 7 || bx > 85) break;
      }
      const last = frames[frames.length - 1];
      const tgtLast = last?.players?.find((p) => p.id === this.targetId);
      const over = tgtLast && last.bx > tgtLast.x;
      const eqHint = !equationOk ? ` Also: WR1 starts at x=${wr1Act.x0.toFixed(1)}, vx=9, vy=-6. Try x_r(t) = ${wr1Act.x0.toFixed(1)} + 9*t` : ".";
      return { frames, result: "loss", msg: `INCOMPLETE — ${(last?.catchDist || 99).toFixed(1)} yd off. ${over ? "Overthrown: decrease T" : "Underthrown: increase T"}${eqHint}` };
    },
  },

  // --------------------------------------------------------------------
  // P2 — Seam Route: Related Rates
  // --------------------------------------------------------------------
  {
    id: "P2",
    name: "Seam Route",
    down: "3rd & 5",
    concept: "Related Rates · dD/dt",
    color: "#f59e0b",
    description:
      "Two receivers, two defenders closing at different rates. Calculate dD/dt (closure rate) for each. The window that stays open longer is your safe throw.",
    theory: [
      "CONCEPT: Related rates link changing quantities.",
      "D(t) = distance from defender to catch point.",
      "D(t) = v[(x_d-x_c)² + (y_d-y_c)²]",
      "dD/dt = [(x_d-x_c)vdx + (y_d-y_c)vdy] / D",
      "Negative dD/dt = window closing.",
      "t_close = D0 / |dD/dt|  (time until covered)",
      "Ball flight: t_f = dist(QB?catch) / 22",
      "Throw when: T + t_f < t_close",
      "WR1 seam at (50, 12). CB1 closing fast.",
      "WR2 cross at (46, -10). Safety slow.",
      "Compare t_close for each. Pick open window.",
    ],
    inputs: [
      {
        id: "dD1",
        label: "Closure rate on WR1 catch pt — dD1/dt (yd/s):",
        placeholder: "-5",
        hint: "CB1 approaches WR1 catch point. Must be negative.",
      },
      {
        id: "dD2",
        label: "Closure rate on WR2 catch pt — dD2/dt (yd/s):",
        placeholder: "-3",
        hint: "Safety approaches WR2 catch point. Less negative = open longer.",
      },
      {
        id: "choice",
        label: "Throw to WR1 or WR2? (enter 1 or 2):",
        placeholder: "2",
        hint: "t_close = D0/|dD/dt|. Larger t_close = safer window.",
      },
      {
        id: "T",
        label: "Throw at time T (seconds after snap):",
        placeholder: "1.5",
        hint: "Ball must arrive before t_close. t_f = dist/22 ˜ 1.0s.",
      },
    ],
    players: [
      { id: "QB",  x0: 28, y0: 0,   color: "#38bdf8", label: "QB",  segs: [{ vx: 0,  vy: 0  }], offense: true  },
      { id: "WR1", x0: 30, y0: 12,  color: "#f97316", label: "WR1", segs: [{ vx: 9,  vy: 0  }], offense: true  },
      { id: "WR2", x0: 30, y0: -10, color: "#fb923c", label: "WR2", segs: [{ vx: 8,  vy: -2 }], offense: true  },
      { id: "CB1", x0: 38, y0: 17,  color: "#f87171", label: "CB1", segs: [{ vx: 8,  vy: -5 }], offense: false },
      { id: "S",   x0: 44, y0: 3,   color: "#a855f7", label: "S",   segs: [{ vx: 4,  vy: -2 }], offense: false },
      { id: "LB",  x0: 36, y0: -3,  color: "#c084fc", label: "LB",  segs: [{ vx: 3,  vy: -3 }], offense: false },
    ],
    catchPts: { WR1: { x: 50, y: 12 }, WR2: { x: 46, y: -10 } },
    coverIds: { WR1: "CB1", WR2: "S" },
    qbId: "QB",
    vBall: 22,
    catchR: 2,
    peakZ: 4,
    run(inputs) {
      const dD1Raw = parseFloat(inputs.dD1), dD2Raw = parseFloat(inputs.dD2);
      const choice = parseInt(inputs.choice), T = parseFloat(inputs.T);
      // Don't block on dD1/dD2 sign — let sim run regardless.
      // We compute true rates internally and report in result message.
      if (choice !== 1 && choice !== 2) return { error: "choice", msg: "Enter 1 or 2" };
      if (isNaN(T) || T < 0 || T > 6) return { error: "T", msg: "T must be 0–6 s" };

      const cb1 = this.players.find((p) => p.id === "CB1");
      const s   = this.players.find((p) => p.id === "S");
      const cp1 = this.catchPts.WR1, cp2 = this.catchPts.WR2;
      const qb  = this.players.find((p) => p.id === this.qbId);

      const computeRate = (defPlayer, catchPt, t0) => {
        const d0 = posAt(defPlayer, t0), d1 = posAt(defPlayer, t0 + 0.5);
        const D0 = Math.sqrt((d0.x - catchPt.x) ** 2 + (d0.y - catchPt.y) ** 2);
        const D1 = Math.sqrt((d1.x - catchPt.x) ** 2 + (d1.y - catchPt.y) ** 2);
        return (D1 - D0) / 0.5;
      };

      const trueRate1 = computeRate(cb1, cp1, 0);
      const trueRate2 = computeRate(s,   cp2, 0);
      const trueD1_0  = Math.sqrt((posAt(cb1, 0).x - cp1.x) ** 2 + (posAt(cb1, 0).y - cp1.y) ** 2);
      const trueD2_0  = Math.sqrt((posAt(s,   0).x - cp2.x) ** 2 + (posAt(s,   0).y - cp2.y) ** 2);

      // Check user rates (informational only — sim always runs)
      const rate1Ok = !isNaN(dD1Raw) && Math.abs(dD1Raw - trueRate1) < 3.0;
      const rate2Ok = !isNaN(dD2Raw) && Math.abs(dD2Raw - trueRate2) < 3.0;

      const tClose1 = (trueD1_0 - this.catchR) / Math.abs(trueRate1);
      const tClose2 = (trueD2_0 - this.catchR) / Math.abs(trueRate2);

      const cp        = choice === 1 ? cp1 : cp2;
      const defId     = this.coverIds[choice === 1 ? "WR1" : "WR2"];
      const defPlayer = this.players.find((p) => p.id === defId);
      const dx        = cp.x - qb.x0, dy = cp.y - qb.y0;
      const throwDist = Math.sqrt(dx * dx + dy * dy);
      const bvx = (dx / throwDist) * this.vBall, bvy = (dy / throwDist) * this.vBall;
      const tLand = T + throwDist / this.vBall;

      let thrown = false, bx = qb.x0, by = qb.y0;
      const trail = [], frames = [];

      for (let i = 0; i < 720; i++) {
        const t = i * DT;
        const players = this.players.map((p) => ({ ...p, ...posAt(p, t), ...velAt(p, t) }));
        if (!thrown && t >= T) { thrown = true; }
        if (thrown) { bx += bvx * DT; by += bvy * DT; trail.push({ x: bx, y: by }); }
        const fz = ballArc(t, T, tLand, this.peakZ);
        const defNow  = posAt(defPlayer, t);
        const defDist = Math.sqrt((defNow.x - cp.x) ** 2 + (defNow.y - cp.y) ** 2);
        const ballNear = Math.sqrt((bx - cp.x) ** 2 + (by - cp.y) ** 2);
        const cb1Now = posAt(cb1, t), sNow = posAt(s, t);
        const D1live = Math.sqrt((cb1Now.x - cp1.x) ** 2 + (cb1Now.y - cp1.y) ** 2);
        const D2live = Math.sqrt((sNow.x   - cp2.x) ** 2 + (sNow.y   - cp2.y) ** 2);
        frames.push({
          t, players, bx, by, fz, thrown, trail: [...trail],
          defDist, ballNear, catchPts: this.catchPts, tClose1, tClose2,
          D1live, D2live, choice,
        });
        if (thrown && ballNear < this.catchR && fz < 1.5) {
          if (defDist > this.catchR) {
            const rHint = (!rate1Ok||!rate2Ok) ? ` (True rates: dD1/dt=${trueRate1.toFixed(1)}, dD2/dt=${trueRate2.toFixed(1)} yd/s)` : ` Rates confirmed: ${trueRate1.toFixed(1)}, ${trueRate2.toFixed(1)} yd/s.`;
            return { frames, result: "win", msg: `COMPLETE to WR${choice}! ${defDist.toFixed(1)} yd clearance. t_close1=${tClose1.toFixed(1)}s, t_close2=${tClose2.toFixed(1)}s.${rHint}` };
          }
          return { frames, result: "loss", msg: `Defended! Window closed (D=${defDist.toFixed(1)} yd). Throw before t=${(choice === 1 ? tClose1 : tClose2).toFixed(1)}s.` };
        }
        if (t > 7 || bx > 85) break;
      }
      return { frames, result: "loss", msg: "Ball out of range. Adjust T." };
    },
  },

  // --------------------------------------------------------------------
  // P3 — Pick Six: Parametric Intersection
  // --------------------------------------------------------------------
  {
    id: "P3",
    name: "Pick Six",
    down: "Defense — YOU are CB",
    concept: "Parametric Paths · find t* where paths cross",
    color: "#a78bfa",
    description:
      "The offense threw a pass. YOU control CB? with velocity equations vx(t) and vy(t). Reach the ball's position before the WR does. Speed cap: 12 yd/s.",
    theory: [
      "CONCEPT: Parametric paths — two curves in time.",
      "WHY: Both CB and ball trace paths parameterized",
      "by t. Find t* where your path meets the ball's.",
      "Ball thrown at t=1.2s toward WR catch ˜ (42,16).",
      "x_b(t) = 28 + vbx·(t-1.2)",
      "y_b(t) = 0  + vby·(t-1.2)",
      "Your CB at (55, -14):",
      "x_cb(t) = 55 + ?0? vx(t) dt",
      "y_cb(t) = -14 + ?0? vy(t) dt",
      "INTERCEPT: |CB(t*) - ball(t*)| < 2.5 yd",
      "AND arrive BEFORE WR (at t ˜ 2.5s).",
      "STEP 1: You need ~30 yd lateral in ~1.5s.",
      "? vy ˜ 20 yd/s capped at 12. Plan route.",
      "STEP 2: Adjust vx/vy until paths cross first.",
    ],
    inputs: [
      {
        id: "vx",
        label: "CB? vx(t) — downfield velocity (yd/s):",
        placeholder: "-5",
        hint: "CB at x=55, ball near x=42. Need negative (moving left). Try: -5",
      },
      {
        id: "vy",
        label: "CB? vy(t) — lateral velocity (yd/s):",
        placeholder: "11",
        hint: "CB at y=-14, ball near y=16. Need ~30 yd laterally. At 12 yd/s ˜ 2.5s.",
      },
    ],
    players: [
      { id: "QB",  x0: 28, y0: 0,   color: "#38bdf8", label: "QB",  segs: [{ vx: 0,  vy: 0 }], offense: true  },
      { id: "WR",  x0: 30, y0: 12,  color: "#f97316", label: "WR",  segs: [{ vx: 9,  vy: 2 }], offense: true  },
      { id: "CB",  x0: 55, y0: -14, color: "#818cf8", label: "CB?", segs: [], offense: false, controlled: true },
      { id: "S",   x0: 48, y0: 5,   color: "#a855f7", label: "S",   segs: [{ vx: -4, vy: 4 }], offense: false  },
    ],
    throwT: 1.2,
    throwFrom: { x: 28, y: 0 },
    vBall: 22,
    catchR: 2.5,
    peakZ: 4,
    run(inputs) {
      const vx_fn = parseExpr(inputs.vx, ["t"]);
      const vy_fn = parseExpr(inputs.vy, ["t"]);
      if (!vx_fn) return { error: "vx", msg: "Invalid — try: -5" };
      if (!vy_fn) return { error: "vy", msg: "Invalid — try: 11" };

      const { throwT, throwFrom, vBall } = this;
      const wr = this.players.find((p) => p.id === "WR");

      // Lead pass toward WR's future position
      const wrAtThrow = posAt(wr, throwT);
      const estDist   = Math.sqrt((wrAtThrow.x - throwFrom.x) ** 2 + (wrAtThrow.y - throwFrom.y) ** 2);
      const estFlight = estDist / vBall;
      const wrLead    = posAt(wr, throwT + estFlight);
      const leadDist  = Math.sqrt((wrLead.x - throwFrom.x) ** 2 + (wrLead.y - throwFrom.y) ** 2);
      const tFlight   = leadDist / vBall;
      const wrFinal   = posAt(wr, throwT + tFlight);
      const throwTo   = wrFinal;
      const finalDist = Math.sqrt((throwTo.x - throwFrom.x) ** 2 + (throwTo.y - throwFrom.y) ** 2);
      const bvx = ((throwTo.x - throwFrom.x) / finalDist) * vBall;
      const bvy = ((throwTo.y - throwFrom.y) / finalDist) * vBall;
      const tLand = throwT + finalDist / vBall;

      let cbX = 55, cbY = -14;
      const trail_cb = [], trail_ball = [], frames = [];
      const s = this.players.find((p) => p.id === "S");

      for (let i = 0; i < 600; i++) {
        const t = i * DT;
        const thrown = t >= throwT;
        const bx = thrown ? throwFrom.x + bvx * (t - throwT) : throwFrom.x;
        const by = thrown ? throwFrom.y + bvy * (t - throwT) : throwFrom.y;
        const fz = ballArc(t, throwT, tLand, this.peakZ);
        const rawVx = vx_fn(t) ?? 0, rawVy = vy_fn(t) ?? 0;
        const spd = Math.sqrt(rawVx * rawVx + rawVy * rawVy);
        const sc = spd > 12 ? 12 / spd : 1;
        cbX += rawVx * sc * DT; cbY += rawVy * sc * DT;
        cbX = Math.max(10, Math.min(90, cbX)); cbY = Math.max(-26, Math.min(26, cbY));
        if (thrown) { trail_ball.push({ x: bx, y: by }); trail_cb.push({ x: cbX, y: cbY }); }
        const wrNow = posAt(wr, t), sNow = posAt(s, t);
        const qbNow = posAt(this.players.find((p) => p.id === "QB"), t);
        const players = [
          { ...this.players.find((p) => p.id === "QB"), ...qbNow },
          { ...wr, ...wrNow },
          { id: "CB", x: cbX, y: cbY, vx: rawVx * sc, vy: rawVy * sc, color: "#818cf8", label: "CB?", offense: false, controlled: true },
          { ...s, ...sNow },
        ];
        const cbBall = Math.sqrt((cbX - bx) ** 2 + (cbY - by) ** 2);
        const wrBall = Math.sqrt((wrNow.x - bx) ** 2 + (wrNow.y - by) ** 2);
        frames.push({
          t, players, bx, by, fz, thrown, trail_cb: [...trail_cb], trail_ball: [...trail_ball],
          cbBall, wrBall, cbSpd: spd * sc, leadX: throwTo.x, leadY: throwTo.y,
        });
        if (thrown && cbBall < this.catchR && cbBall <= wrBall && fz < 2)
          return { frames, result: "win", msg: `INTERCEPTION at t=${t.toFixed(2)}s! CB beat WR by ${(wrBall - cbBall).toFixed(1)} yd at (${bx.toFixed(1)}, ${by.toFixed(1)}).` };
        if (thrown && wrBall < this.catchR && fz < 2)
          return { frames, result: "loss", msg: `WR caught it — CB was ${cbBall.toFixed(1)} yd away. Adjust direction.` };
        if (bx > 92 || t > 9) break;
      }
      return { frames, result: "loss", msg: "Ball incomplete — check direction." };
    },
  },

  // --------------------------------------------------------------------
  // P4 — Power Run: Impulse-Momentum
  // --------------------------------------------------------------------
  {
    id: "P4",
    name: "Power Run",
    down: "4th & 1",
    concept: "Impulse · J = ?F(t) dt = ?p",
    color: "#ef4444",
    description:
      "RB charges at 6 yd/s. Your blocker applies force F(t) to the LB. Compute impulse J = ?F dt and neutralize the LB's momentum before he reaches the RB.",
    theory: [
      "CONCEPT: Impulse = integral of force over time.",
      "WHY: Force applied over time changes momentum.",
      "p = m·v   (lb·yd/s)",
      "J(t) = ?0? F(t) dt",
      "Newton 2nd: J = ?p = p_final - p_initial",
      "LB: mass = 230 lb, initial speed = 5 yd/s.",
      "p_LB = 230 × 5 = 1150 lb·yd/s  (must be 0)",
      "v_LB(t) = (1150 - J(t)) / 230",
      "LB stops when J(t) = 1150 lb·yd/s.",
      "STEP 1: Constant F: J = F·t. Need J = 1150 in ~0.9s.",
      "? F = 1150/0.9 ˜ 1278 lb. Try F = 1300.",
      "STEP 2: F(t) = 900 + 400*t ramps up over time.",
      "STEP 3: Watch impulse bar — fill before contact!",
    ],
    inputs: [
      {
        id: "F",
        label: "Blocker force F(t) in lb (can be function of t):",
        placeholder: "1300",
        hint: "J = ?0? F dt must reach 1150 lb·yd/s in ~0.9s. Try: 1300 or 900+400*t",
      },
    ],
    players: [
      { id: "RB",  x0: 24, y0: 2,  color: "#f97316", label: "RB",  segs: [{ vx: 9,  vy: 0 }], offense: true, hasBall: true },
      { id: "OL",  x0: 26, y0: -2, color: "#38bdf8", label: "OL",  segs: [{ vx: 6,  vy: 2 }], offense: true  },
      { id: "WR1", x0: 24, y0: 18, color: "#fb923c", label: "WR1", segs: [{ vx: 9,  vy: 0 }], offense: true  },
      { id: "LB",  x0: 32, y0: 0,  color: "#f87171", label: "LB",  segs: [], offense: false, dynamic: true },
      { id: "DE",  x0: 33, y0: -8, color: "#fca5a5", label: "DE",  segs: [{ vx: -5, vy: 5 }], offense: false },
      { id: "S",   x0: 44, y0: -5, color: "#a855f7", label: "S",   segs: [{ vx: -5, vy: 3 }], offense: false },
    ],
    los: 30,
    LB_MASS: 230,
    LB_P: 1150,
    peakZ: 0,
    run(inputs) {
      const F_fn = parseExpr(inputs.F, ["t"]);
      if (!F_fn) return { error: "F", msg: "Invalid — try: 900 or 600+300*t" };
      let lbX = 32, lbY = 0, impulse = 0;
      const frames = [];
      const rb = this.players.find((p) => p.id === "RB");
      const lb = this.players.find((p) => p.id === "LB");
      for (let i = 0; i < 540; i++) {
        const t = i * DT;
        const F = Math.max(0, F_fn(t) ?? 0);
        impulse += F * DT;
        const lbMom   = Math.max(0, this.LB_P - impulse);
        const lbSpeed = lbMom / this.LB_MASS;
        lbX -= lbSpeed * DT;
        const rbNow = posAt(rb, t);
        const staticPlayers = this.players
          .filter((p) => !p.dynamic)
          .map((p) => ({ ...p, ...posAt(p, t), ...velAt(p, t) }));
        staticPlayers.push({ ...lb, x: lbX, y: lbY, vx: -lbSpeed, vy: 0 });
        frames.push({
          t, players: staticPlayers, bx: null, by: null, fz: 0,
          thrown: false, trail: [], impulse, lbSpeed, lbX, rbX: rbNow.x, F,
        });
        if (rbNow.x >= lbX - 0.3) {
          if (lbSpeed < 1.5)
            return { frames, result: "win", msg: `TD! LB neutralized at t=${t.toFixed(2)}s. J=${impulse.toFixed(0)} lb·yd/s (needed ${this.LB_P}). LB speed: ${lbSpeed.toFixed(1)} yd/s.` };
          return { frames, result: "loss", msg: `Stuffed! LB had ${lbSpeed.toFixed(1)} yd/s at contact. J=${impulse.toFixed(0)} — need ${this.LB_P}. Increase F.` };
        }
        if (t > 9) break;
      }
      return { frames, result: "loss", msg: `Time ran out. J=${impulse.toFixed(0)} — need ${this.LB_P}.` };
    },
  },

  // --------------------------------------------------------------------
  // P5 — Hail Mary: Optimization
  // --------------------------------------------------------------------
  {
    id: "P5",
    name: "Hail Mary",
    down: "4th & Long — 0:00",
    concept: "Optimization · maximize R(?)",
    color: "#06b6d4",
    description:
      "Last play. Find angle ? that maximizes range AND clears two safeties. R(?) = v0²sin(2?)/g. Set dR/d? = 0 to find optimal ?.",
    theory: [
      "CONCEPT: Optimization — derivative = 0 at maximum.",
      "Projectile range: R(?) = v0²·sin(2?) / g",
      "DERIVE maximum: dR/d? = 0",
      "dR/d? = 2v0²·cos(2?) / g = 0",
      "? cos(2?) = 0  ?  2? = 90°  ?  ? = 45°",
      "Verify MAX: d²R/d?² = -4v0²·sin(2?)/g < 0 ?",
      "v0 = 28 yd/s, g = 10.72 yd/s².",
      "R_max = v0²/g = 784/10.72 ˜ 73 yd.",
      "STEP 1: Plug ?=45°, verify R_max ˜ 73 yd.",
      "STEP 2: Check ball clears the safety gap.",
      "STEP 3: If safeties block, adjust T (let them spread).",
      "STEP 4: sin(2?)=1 at ?=45° ? unique maximum.",
      "INSIGHT: Any other angle gives less range.",
    ],
    inputs: [
      {
        id: "theta",
        label: "Launch angle ? (degrees, 0–90):",
        placeholder: "45",
        hint: "?=45° maximizes range. R(?) = 28²·sin(2?)/10.72",
      },
      {
        id: "T",
        label: "Throw at time T (seconds after snap):",
        placeholder: "0.5",
        hint: "Safeties spread over time. Earlier = smaller gap. Try 0.3–1.5.",
      },
    ],
    players: [
      { id: "QB",  x0: 28, y0: 0,   color: "#38bdf8", label: "QB",  segs: [{ vx: 0, vy: 0   }], offense: true  },
      { id: "WR1", x0: 30, y0: 8,   color: "#f97316", label: "WR1", segs: [{ vx: 10, vy: 0   }], offense: true  },
      { id: "WR2", x0: 30, y0: -8,  color: "#fb923c", label: "WR2", segs: [{ vx: 10, vy: 0   }], offense: true  },
      { id: "S1",  x0: 65, y0: 5,   color: "#f87171", label: "S1",  segs: [{ vx: 3, vy: 3.5  }], offense: false },
      { id: "S2",  x0: 65, y0: -5,  color: "#fca5a5", label: "S2",  segs: [{ vx: 3, vy: -3.5 }], offense: false },
      { id: "CB",  x0: 55, y0: 0,   color: "#c084fc", label: "CB",  segs: [{ vx: 5, vy: 0    }], offense: false },
    ],
    vBall: 28,
    g: 10.72,
    catchR: 3,
    peakZ: 0,
    run(inputs) {
      const theta = parseFloat(inputs.theta), T = parseFloat(inputs.T);
      if (isNaN(theta) || theta < 0 || theta > 90) return { error: "theta", msg: "? must be 0–90 degrees" };
      if (isNaN(T) || T < 0 || T > 4) return { error: "T", msg: "T must be 0–4 s" };
      const th   = (theta * Math.PI) / 180;
      const v0   = this.vBall, g = this.g;
      // Vertical component for arc
      const vVert  = v0 * Math.sin(th);
      // Horizontal ground speed (covers range R on the ground plane)
      const vHoriz = v0 * Math.cos(th);
      const tFlight = (2 * vVert) / g;
      const range   = (v0 * v0 * Math.sin(2 * th)) / g;
      const maxRange = (v0 * v0) / g;
      const qb = this.players.find((p) => p.id === "QB");

      // Aim ball at WR1's position when it lands.
      // WR1 runs at vx=10, so by time T+tFlight, WR1 is at x = 30 + 10*(T+tFlight), y=10.
      // We aim the horizontal component of the throw directly at that point.
      const wr1 = this.players.find((p) => p.id === "WR1");
      const landT = T + tFlight;
      const wr1AtLand = posAt(wr1, landT);
      // Direction from QB to WR1's landing position (ground plane)
      const aimDx = wr1AtLand.x - qb.x0;
      const aimDy = wr1AtLand.y - qb.y0;
      const aimGroundDist = Math.sqrt(aimDx * aimDx + aimDy * aimDy);
      // The horizontal speed vHoriz is the ground-plane speed.
      // But the range formula R = v0²sin2?/g assumes the throw is aimed directly downfield.
      // We need to scale: the actual ground coverage is aimGroundDist, driven by vHoriz.
      // So bvx and bvy are the ground-plane velocity components.
      const bvx = (aimDx / aimGroundDist) * vHoriz;
      const bvy = (aimDy / aimGroundDist) * vHoriz;
      // targetX for the range indicator is still straight downfield
      const targetX = qb.x0 + range;

      const frames = [], trail = [];
      let thrown = false, bx = qb.x0, by = qb.y0;

      for (let i = 0; i < 720; i++) {
        const t = i * DT;
        const players = this.players.map((p) => ({ ...p, ...posAt(p, t), ...velAt(p, t) }));
        if (!thrown && t >= T) { thrown = true; }
        let fz = 0;
        if (thrown) {
          const dt = t - T;
          bx = qb.x0 + bvx * dt;
          by = qb.y0 + bvy * dt;
          fz = Math.max(0, vVert * dt - 0.5 * g * dt * dt);
          trail.push({ x: bx, y: by, z: fz });
        }
        const s1 = posAt(this.players.find((p) => p.id === "S1"), t);
        const s2 = posAt(this.players.find((p) => p.id === "S2"), t);
        const ballToS1 = Math.sqrt((bx - s1.x) ** 2 + (by - s1.y) ** 2);
        const ballToS2 = Math.sqrt((bx - s2.x) ** 2 + (by - s2.y) ** 2);
        const dRdTheta = (2 * v0 * v0 * Math.cos(2 * th)) / g;
        frames.push({
          t, players, bx, by, fz, thrown, trail: [...trail],
          range, maxRange, theta, ballToS1, ballToS2, dRdTheta, targetX,
        });
        if (thrown && fz <= 0 && t > T + 0.1) {
          const wr1Now = posAt(this.players.find((p) => p.id === "WR1"), t);
          const wr2Now = posAt(this.players.find((p) => p.id === "WR2"), t);
          const distWR1 = Math.sqrt((bx - wr1Now.x) ** 2 + (by - wr1Now.y) ** 2);
          const distWR2 = Math.sqrt((bx - wr2Now.x) ** 2 + (by - wr2Now.y) ** 2);
          const distWR  = Math.min(distWR1, distWR2);
          const nearest = Math.min(ballToS1, ballToS2);
          if (distWR < this.catchR && nearest > 3.5)
            return { frames, result: "win", msg: `TOUCHDOWN! ?=${theta}°, R=${range.toFixed(1)} yd (max=${maxRange.toFixed(1)} at 45°). sin(2×${theta}°)=${Math.sin(2 * th).toFixed(3)}.` };
          if (nearest <= 3.5)
            return { frames, result: "loss", msg: `Knocked down! Defender ${nearest.toFixed(1)} yd from ball. Adjust T to let safeties spread further apart.` };
          return { frames, result: "loss", msg: `Incomplete — ball landed ${distWR.toFixed(1)} yd from nearest WR. R=${range.toFixed(1)} yd. ${theta < 45 ? "Increase ? for more range." : theta > 45 ? "? > 45° reduces range — try closer to 45°." : "Check T — WRs may not have reached the end zone yet."}` };
        }
        if (bx > 100 || t > 12) break;
      }
      return { frames, result: "loss", msg: "Ball still airborne at time limit." };
    },
  },
  // ----------------------------------------------------------------------------
  // P6 — Zone Read: Derivatives (rate of change / instantaneous velocity)
  // ----------------------------------------------------------------------------
  {
    id: "P6", name: "Zone Read", down: "1st & 10",
    concept: "Derivatives · v(t) = dx/dt",
    color: "#ec4899",
    description: "The DE's position follows x_DE(t) = 35 - 4t + t². Compute the DE's velocity v(t) = dx/dt. When is he moving toward or away from the RB? Give the exact moment he reverses and the QB's best handoff window.",
    theory: [
      "CONCEPT: The derivative gives instantaneous rate of change.",
      "WHY: Position x(t) tells WHERE something is. Velocity v(t) = dx/dt tells HOW FAST and in which direction.",
      "DE position: x_DE(t) = 35 - 4t + t²",
      "STEP 1: Differentiate term by term.",
      "v_DE(t) = dx/dt = -4 + 2t",
      "STEP 2: Find the reversal moment (v = 0).",
      "-4 + 2t = 0  ?  t = 2 seconds",
      "STEP 3: Sign analysis:",
      "? t < 2: v_DE < 0 (DE moving toward LOS)",
      "? t > 2: v_DE > 0 (DE moving away from LOS!)",
      "STEP 4: Handoff window is AFTER t=2 when DE retreats.",
      "INSIGHT: Rate of change = 0 means reversal point.",
      "CHECK: x_DE(2) = 35 - 8 + 4 = 31 yd",
    ],
    inputs: [
      { id: "vDE",    label: "v_DE(t) = dx_DE/dt:",   placeholder: "-4 + 2*t", hint: "Differentiate 35 - 4t + t² term by term" },
      { id: "tReverse", label: "Reversal time t* (s) where v_DE = 0:", placeholder: "2", hint: "Set your v_DE(t) = 0 and solve for t" },
      { id: "T",      label: "Handoff at time T (s):", placeholder: "2.2",     hint: "Handoff AFTER reversal so DE moves away. Try T = 1.8 to 2.5" },
    ],
    players: [
      { id:"QB",  x0:28, y0:0,   color:"#38bdf8", label:"QB",  segs:[{vx:0,vy:0}],           offense:true  },
      { id:"RB",  x0:26, y0:-3,  color:"#f97316", label:"RB",  segs:[{vx:6,vy:0}],           offense:true  },
      { id:"WR1", x0:30, y0:18,  color:"#fb923c", label:"WR1", segs:[{vx:9,vy:0}],           offense:true  },
      { id:"WR2", x0:30, y0:-18, color:"#fbbf24", label:"WR2", segs:[{vx:9,vy:2}],           offense:true  },
      { id:"OL1", x0:29, y0:2,   color:"#38bdf8", label:"OL",  segs:[{vx:2,vy:0}],           offense:true  },
      { id:"OL2", x0:29, y0:-2,  color:"#38bdf8", label:"OL",  segs:[{vx:2,vy:0}],           offense:true  },
      { id:"DE",  x0:35, y0:-2,  color:"#f87171", label:"DE",  segs:[],                       offense:false, dynamic:true },
      { id:"LB1", x0:40, y0:5,   color:"#c084fc", label:"LB1", segs:[{vx:-2,vy:2}],          offense:false },
      { id:"LB2", x0:40, y0:-5,  color:"#a855f7", label:"LB2", segs:[{dur:1.5,vx:-3,vy:-2},{vx:2,vy:0}], offense:false },
      { id:"CB1", x0:42, y0:20,  color:"#fca5a5", label:"CB1", segs:[{vx:8,vy:-2}],          offense:false },
      { id:"CB2", x0:42, y0:-20, color:"#f87171", label:"CB2", segs:[{vx:7,vy:2}],           offense:false },
      { id:"S",   x0:55, y0:0,   color:"#e879f9", label:"S",   segs:[{vx:-3,vy:0}],          offense:false },
    ],
    los: 30,
    run(inputs) {
      const vDE_fn     = parseExpr(inputs.vDE,    ["t"]);
      const tReverse   = parseFloat(inputs.tReverse);
      const T          = parseFloat(inputs.T);
      if (!vDE_fn)                         return { error:"vDE",    msg:"Try: -4 + 2*t" };
      if (isNaN(tReverse)||tReverse<0||tReverse>5) return { error:"tReverse", msg:"Set v_DE(t)=0 and solve. Answer is between 0 and 5." };
      if (isNaN(T)||T<0||T>5)             return { error:"T",      msg:"T must be 0–5 s" };

      // True reversal is t=2; check student answer
      const TRUE_REVERSE = 2.0;
      const reverseOk = Math.abs(tReverse - TRUE_REVERSE) < 0.15;

      // DE true position: x_DE(t) = 35 - 4t + t^2
      // DE true velocity: v_DE(t) = -4 + 2t
      const deX = (t) => 35 - 4*t + t*t;
      const deV = (t) => -4 + 2*t;

      // Check derivative is correct
      const userV0 = vDE_fn(0) ?? 0, userV2 = vDE_fn(2) ?? 0;
      const derivOk = Math.abs(userV0 - (-4)) < 0.5 && Math.abs(userV2 - 0) < 0.5;

      const rb = this.players.find(p => p.id === "RB");
      const de = this.players.find(p => p.id === "DE");
      const frames = [];

      let rbX = rb.x0, rbY = rb.y0;

      for (let i = 0; i < 360; i++) {
        const t = i * DT;
        const deNowX = deX(t);
        const deNowV = deV(t);
        const rbNow  = posAt(rb, t);
        const staticPlayers = this.players.filter(p => !p.dynamic).map(p => ({...p,...posAt(p,t),...velAt(p,t)}));
        staticPlayers.push({ ...de, x: deNowX, y: de.y0, vx: deNowV, vy: 0 });

        const handoffDist = Math.sqrt((rbNow.x - deNowX)**2 + (rbNow.y - de.y0)**2);
        frames.push({ t, players: staticPlayers, bx: null, by: null, fz: 0, thrown: false, trail: [],
          deV: deNowV, deX: deNowX, rbX: rbNow.x, handoffDist, tReverse,
          reverseOk, derivOk, T });

        if (t >= T) {
          // Handoff! Check if DE is moving away (positive velocity = moving right = away from LOS)
          if (deNowV > 0.5) {
            return { frames, result:"win",  msg:`GREAT READ! Handoff at t=${t.toFixed(2)}s. DE velocity = +${deNowV.toFixed(1)} yd/s (moving AWAY from RB). Reversal at t=${TRUE_REVERSE}s confirmed. ${!derivOk?"(Check your derivative — should be -4 + 2t)":"Derivative correct!"}` };
          } else if (deNowV < -0.5) {
            return { frames, result:"loss", msg:`QB SACKED! DE still charging toward LOS at v=${deNowV.toFixed(1)} yd/s. Handoff AFTER t=${TRUE_REVERSE}s when v_DE > 0. Try T ˜ 2.3.` };
          } else {
            return { frames, result:"loss", msg:`TOO CLOSE TO REVERSAL. DE barely moving. Wait until t ˜ 2.3s for clear separation.` };
          }
        }
        if (t > 6) break;
      }
      return { frames, result:"loss", msg:"No handoff triggered." };
    },
  },

  // ----------------------------------------------------------------------------
  // P7 — Fly Route: Chain Rule / Composite Functions
  // ----------------------------------------------------------------------------
  {
    id: "P7", name: "Fly Route", down: "3rd & Long",
    concept: "Chain Rule · d/dt[f(g(t))]",
    color: "#f97316",
    description: "WR's speed is s(t) = sin(t) + 1 yd/s (fatigue oscillation). His x-position is x(t) = ?s dt. Find dx/dt (his instantaneous velocity) and the time window when he's moving fastest. Then throw at the peak speed moment.",
    theory: [
      "CONCEPT: Chain rule for composite functions.",
      "WHY: When one quantity depends on another which depends on t, derivatives chain together.",
      "WR speed: s(t) = sin(t) + 1  yd/s",
      "Position: x(t) = ?0? s(t) dt = -cos(t) + t + 1",
      "STEP 1: Differentiate x(t) using chain rule.",
      "dx/dt = sin(t) + 1  = s(t) ? (consistent)",
      "STEP 2: Maximize s(t) = sin(t) + 1.",
      "ds/dt = cos(t) = 0  ?  t = p/2 ˜ 1.57s",
      "STEP 3: At t=p/2: s = sin(p/2)+1 = 2 yd/s (max!)",
      "STEP 4: Throw during peak speed window.",
      "? WR is fastest at t ˜ 1.57s",
      "? Ball flight ˜ dist/22s ˜ 0.8s",
      "? Throw at T ˜ 0.8 so ball arrives at peak",
      "CHECK: x(p/2) = -cos(p/2) + p/2 + 1 ˜ 2.57 yd",
    ],
    inputs: [
      { id: "dxdt",   label: "dx/dt (WR instantaneous velocity):", placeholder: "sin(t) + 1", hint: "Differentiate x(t) = -cos(t) + t + 1. What's the chain rule result?" },
      { id: "tPeak",  label: "t* when WR is fastest (s):",         placeholder: "1.57",        hint: "Set d/dt[sin(t)+1] = 0 and solve. Answer ˜ p/2" },
      { id: "T",      label: "Throw at T seconds:",                 placeholder: "0.8",         hint: "Ball arrives ~0.8s after throw. Aim for WR to catch near t*." },
    ],
    players: [
      { id:"QB",  x0:28, y0:0,   color:"#38bdf8", label:"QB",  segs:[{vx:0,vy:0}],   offense:true  },
      { id:"WR1", x0:30, y0:14,  color:"#f97316", label:"WR?", segs:[],              offense:true, dynamic:true },
      { id:"WR2", x0:30, y0:-14, color:"#fb923c", label:"WR2", segs:[{vx:8,vy:0}],  offense:true  },
      { id:"TE",  x0:30, y0:6,   color:"#fbbf24", label:"TE",  segs:[{vx:6,vy:2}],  offense:true  },
      { id:"OL1", x0:29, y0:2,   color:"#38bdf8", label:"OL",  segs:[{vx:1,vy:0}],  offense:true  },
      { id:"OL2", x0:29, y0:-2,  color:"#38bdf8", label:"OL",  segs:[{vx:1,vy:0}],  offense:true  },
      { id:"CB1", x0:33, y0:15,  color:"#f87171", label:"CB1", segs:[{vx:7,vy:0}],  offense:false },
      { id:"CB2", x0:33, y0:-15, color:"#fca5a5", label:"CB2", segs:[{vx:7,vy:0}],  offense:false },
      { id:"LB",  x0:40, y0:2,   color:"#c084fc", label:"LB",  segs:[{vx:-2,vy:3}], offense:false },
      { id:"S1",  x0:55, y0:10,  color:"#a855f7", label:"S1",  segs:[{vx:-4,vy:-3}],offense:false },
      { id:"S2",  x0:55, y0:-10, color:"#e879f9", label:"S2",  segs:[{vx:-4,vy:3}], offense:false },
    ],
    los: 30, vBall: 22, catchR: 2.5, peakZ: 6,
    run(inputs) {
      const dxdt_fn  = parseExpr(inputs.dxdt,  ["t"]);
      const tPeak    = parseFloat(inputs.tPeak);
      const T        = parseFloat(inputs.T);
      if (!dxdt_fn)                    return { error:"dxdt",  msg:"Try: sin(t) + 1" };
      if (isNaN(tPeak)||tPeak<0||tPeak>4) return { error:"tPeak", msg:"t* between 0–4 s" };
      if (isNaN(T)||T<0||T>4)          return { error:"T",     msg:"T must be 0–4 s" };

      const TRUE_PEAK = Math.PI / 2; // ~1.5708s
      const peakOk = Math.abs(tPeak - TRUE_PEAK) < 0.2;
      const derivOk = Math.abs((dxdt_fn(0)??0) - 1) < 0.3 && Math.abs((dxdt_fn(TRUE_PEAK)??0) - 2) < 0.3;

      // WR position: x(t) = -cos(t) + t + 1, y = constant 14
      const wrX = (t) => -Math.cos(t) + t + 1 + 30; // starts near x=30
      const wrY = 14;
      const wrSpeed = (t) => Math.sin(t) + 1;

      const qb  = this.players.find(p => p.id === "QB");
      const wr1 = this.players.find(p => p.id === "WR1"); // dynamic
      const cb1 = this.players.find(p => p.id === "CB1");

      // Compute throw target: where WR will be when ball arrives
      const qbPos  = { x: qb.x0, y: qb.y0 };
      const wrAtT  = { x: wrX(T), y: wrY };
      const eDist  = Math.sqrt((wrAtT.x-qbPos.x)**2 + (wrAtT.y-qbPos.y)**2);
      const eFlight= eDist / this.vBall;
      const wrFinal= { x: wrX(T + eFlight), y: wrY };
      const fDist  = Math.sqrt((wrFinal.x-qbPos.x)**2+(wrFinal.y-qbPos.y)**2);
      const tFlight= fDist / this.vBall;
      const tLand  = T + tFlight;
      const bvx = ((wrFinal.x-qbPos.x)/fDist)*this.vBall;
      const bvy = ((wrFinal.y-qbPos.y)/fDist)*this.vBall;

      let thrown=false, bx=qbPos.x, by=qbPos.y;
      const trail=[], frames=[];

      for (let i=0; i<480; i++) {
        const t = i * DT;
        const wrNow = { x: wrX(t), y: wrY };
        const cb1Now = posAt(cb1, t);
        const staticPlayers = this.players.filter(p => !p.dynamic && p.id !== "CB1")
          .map(p => ({...p,...posAt(p,t),...velAt(p,t)}));
        staticPlayers.push({ ...wr1, x: wrNow.x, y: wrY, vx: wrSpeed(t), vy: 0 });
        staticPlayers.push({ ...cb1, x: cb1Now.x, y: cb1Now.y, ...velAt(cb1, t) });

        if (!thrown && t >= T) thrown = true;
        if (thrown) { bx += bvx*DT; by += bvy*DT; trail.push({x:bx,y:by}); }
        const fz = ballArc(t, T, tLand, this.peakZ);
        const catchDist = Math.sqrt((bx-wrNow.x)**2 + (by-wrY)**2);
        const cbDist    = Math.sqrt((bx-cb1Now.x)**2 + (by-cb1Now.y)**2);
        const wrSpeedNow = wrSpeed(t);
        frames.push({ t, players: staticPlayers, bx, by, fz, thrown, trail:[...trail],
          catchDist, cbDist, wrSpeedNow, tPeak, peakOk, leadX: wrFinal.x, leadY: wrFinal.y, T, flightTime: tFlight });

        if (thrown && catchDist < this.catchR && fz < 2) {
          const atPeak = Math.abs(t - TRUE_PEAK) < 0.4;
          const spd = wrSpeed(t).toFixed(2);
          const msg = atPeak
            ? `CAUGHT at peak speed! WR moving at ${spd} yd/s near t=p/2. Chain rule: dx/dt = sin(t)+1. ${!derivOk?"(Derivative needed fixing)":"Derivative correct ?"}`
            : `Caught but not at peak speed (${spd} yd/s). Try T=${(TRUE_PEAK - tFlight).toFixed(2)}s so ball arrives at t*=p/2.`;
          return { frames, result: atPeak?"win":"loss", msg };
        }
        if (thrown && cbDist < 1.5 && fz < 1.2 && t > T+0.2)
          return { frames, result:"loss", msg:`TIPPED by CB! WR needs to be at peak speed (t˜1.57s) to beat coverage. Try T˜0.8.` };
        if (t > 6 || bx > 90) break;
      }
      const last = frames[frames.length-1];
      return { frames, result:"loss", msg:`Incomplete — ${(last?.catchDist||99).toFixed(1)} yd off. Peak speed at t*=p/2˜1.57s. Throw at T˜0.8 so ball arrives at that moment.` };
    },
  },

  // ----------------------------------------------------------------------------
  // P8 — Blitz Package: Separating Variables / Differential Equations
  // ----------------------------------------------------------------------------
  {
    id: "P8", name: "Blitz Package", down: "4th & Goal",
    concept: "Diff. Equations · dp/dt = F(t)",
    color: "#06b6d4",
    description: "The blitzing LB decelerates due to a blocker: dp/dt = -k·p where k=2. Solve this ODE to find p(t), then v(t). Determine when the LB is slow enough for the QB to escape and score.",
    theory: [
      "CONCEPT: Solving a separable differential equation.",
      "WHY: dp/dt = F(t) means momentum changes at a rate given by F. Integrate both sides to find p(t).",
      "ODE: dp/dt = -k·p  (exponential decay)",
      "Separate variables: dp/p = -k dt",
      "Integrate both sides:",
      "?dp/p = ?-k dt",
      "ln|p| = -kt + C",
      "p(t) = p0 · e^(-kt)",
      "STEP 1: Initial momentum p0 = 220 lb × 6 yd/s = 1320",
      "STEP 2: k = 2. So p(t) = 1320·e^(-2t)",
      "STEP 3: v(t) = p(t)/m = 1320·e^(-2t)/220 = 6e^(-2t)",
      "STEP 4: QB escapes when v_LB < 2 yd/s.",
      "6e^(-2t) < 2  ?  e^(-2t) < 1/3",
      "? t > ln(3)/2 ˜ 0.55s",
      "? Scramble window opens at t ˜ 0.55s",
    ],
    inputs: [
      { id: "pt",     label: "p(t) — LB momentum solution:",      placeholder: "1320*exp(-2*t)", hint: "Solve dp/dt = -2p. Answer: p(t) = p0·e^(-2t), p0=1320" },
      { id: "vt",     label: "v(t) — LB velocity from p(t)/m:",   placeholder: "6*exp(-2*t)",    hint: "v = p/m. m=220 lb. Should match p(t)/220" },
      { id: "tEsc",   label: "Escape time t* when v_LB < 2 yd/s:", placeholder: "0.55",          hint: "Solve 6e^(-2t) = 2 for t. t = ln(3)/2" },
      { id: "T",      label: "QB scrambles at T seconds:",         placeholder: "0.6",            hint: "Scramble AFTER t* when LB is slow. Try T = 0.5 to 1.0" },
    ],
    players: [
      { id:"QB",  x0:28, y0:0,   color:"#38bdf8", label:"QB",  segs:[],                        offense:true,  dynamic:true },
      { id:"RB",  x0:26, y0:-3,  color:"#f97316", label:"RB",  segs:[{vx:0,vy:0}],             offense:true  },
      { id:"WR1", x0:30, y0:20,  color:"#fb923c", label:"WR1", segs:[{vx:10,vy:0}],            offense:true  },
      { id:"WR2", x0:30, y0:-20, color:"#fbbf24", label:"WR2", segs:[{vx:10,vy:0}],            offense:true  },
      { id:"OL1", x0:29, y0:3,   color:"#38bdf8", label:"OL",  segs:[{vx:0,vy:0}],             offense:true  },
      { id:"OL2", x0:29, y0:-3,  color:"#22d3ee", label:"OL",  segs:[{vx:0,vy:0}],             offense:true  },
      { id:"LB",  x0:36, y0:0,   color:"#f87171", label:"LB",  segs:[],                        offense:false, dynamic:true },
      { id:"LB2", x0:38, y0:6,   color:"#fca5a5", label:"LB2", segs:[{vx:-4,vy:-3}],           offense:false },
      { id:"DL1", x0:32, y0:4,   color:"#c084fc", label:"DL1", segs:[{vx:-3,vy:2}],            offense:false },
      { id:"DL2", x0:32, y0:-4,  color:"#a855f7", label:"DL2", segs:[{vx:-3,vy:-2}],           offense:false },
      { id:"S",   x0:50, y0:0,   color:"#e879f9", label:"S",   segs:[{vx:-5,vy:0}],            offense:false },
      { id:"CB1", x0:44, y0:22,  color:"#f87171", label:"CB1", segs:[{vx:8,vy:-2}],            offense:false },
    ],
    los: 30, LB_MASS: 220, peakZ: 0,
    run(inputs) {
      const pt_fn   = parseExpr(inputs.pt,   ["t"]);
      const vt_fn   = parseExpr(inputs.vt,   ["t"]);
      const tEsc    = parseFloat(inputs.tEsc);
      const T       = parseFloat(inputs.T);
      if (!pt_fn)                     return { error:"pt",   msg:"Try: 1320*exp(-2*t)" };
      if (!vt_fn)                     return { error:"vt",   msg:"Try: 6*exp(-2*t)" };
      if (isNaN(tEsc)||tEsc<0||tEsc>3) return { error:"tEsc", msg:"t* must be 0–3 s" };
      if (isNaN(T)||T<0||T>3)         return { error:"T",    msg:"T must be 0–3 s" };

      // True: p(t) = 1320e^(-2t), v(t) = 6e^(-2t)
      const trueP = (t) => 1320 * Math.exp(-2*t);
      const trueV = (t) => 6 * Math.exp(-2*t);
      const TRUE_ESC = Math.log(3)/2; // ˜ 0.549

      const ptOk  = Math.abs((pt_fn(0)??0) - 1320) < 100 && Math.abs((pt_fn(1)??0) - trueP(1)) < 50;
      const vtOk  = Math.abs((vt_fn(0)??0) - 6) < 0.5 && Math.abs((vt_fn(1)??0) - trueV(1)) < 0.3;
      const escOk = Math.abs(tEsc - TRUE_ESC) < 0.1;

      const qb  = this.players.find(p => p.id === "QB");
      const lb  = this.players.find(p => p.id === "LB");
      const frames = [];

      let qbX = qb.x0, qbY = qb.y0;

      for (let i=0; i<360; i++) {
        const t = i * DT;
        const lbV = trueV(t);
        const lbX_start = 36;
        const lbX = lbX_start - (trueP(0) - trueP(t)) / this.LB_MASS; // integral of v

        // QB stays put until T, then scrambles right (positive x)
        if (t >= T) { qbX += 5 * DT; qbY += 2 * DT; }

        const staticPlayers = this.players.filter(p => !p.dynamic).map(p => ({...p,...posAt(p,t),...velAt(p,t)}));
        staticPlayers.push({ ...lb, x: lbX, y: lb.y0, vx: -lbV, vy: 0 });
        staticPlayers.push({ ...qb, x: qbX, y: qbY, vx: t >= T ? 5 : 0, vy: t >= T ? 2 : 0 });

        const qbLBdist = Math.sqrt((qbX-lbX)**2 + (qbY-lb.y0)**2);
        frames.push({ t, players: staticPlayers, bx:null, by:null, fz:0, thrown:false, trail:[],
          lbV, lbX, qbX, qbLBdist, escapeTime: TRUE_ESC, tEsc, T, ptOk, vtOk, escOk });

        if (t >= T && qbX >= 35) {
          if (lbV < 2.0) {
            return { frames, result:"win", msg:`QB SCRAMBLES for TD! LB velocity = ${lbV.toFixed(2)} yd/s at scramble time. ODE solution: v(t) = 6e^(-2t). Escape window opened at t=${TRUE_ESC.toFixed(3)}s. ${!ptOk||!vtOk?"(Check your p(t) and v(t) expressions)":"p(t) and v(t) correct ?"}` };
          } else {
            return { frames, result:"loss", msg:`TACKLED! LB still had ${lbV.toFixed(2)} yd/s. Scramble after t=${TRUE_ESC.toFixed(2)}s. Try T ˜ 0.65. ODE: v(t) = 6e^(-2t).` };
          }
        }
        if (qbLBdist < 1.5 && t > 0.1)
          return { frames, result:"loss", msg:`SACKED! LB closed the gap. Wait until v_LB < 2 (t > ${TRUE_ESC.toFixed(2)}s) then scramble.` };
        if (t > 4) break;
      }
      return { frames, result:"loss", msg:`QB never scrambled in time. T must be < 2s.` };
    },
  },

];

// --- Draw full frame ----------------------------------------------------------
function drawFrame(ctx, frame, play, showVecs) {
  drawIsoField(ctx);
  if (play.los) drawLOS(ctx, play.los);
  if (!frame) return;
  const { players, bx, by, fz, thrown, trail, trail_cb, trail_ball, impulse } = frame;

  const ballTrail = trail || trail_ball || [];
  ballTrail.forEach((pt, i) => {
    ctx.globalAlpha = 0.05 + (i / ballTrail.length) * 0.35;
    const p = proj(pt.x, pt.y, pt.z || 0);
    ctx.beginPath(); ctx.arc(p.cx, p.cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24"; ctx.fill();
  });
  if (trail_cb) {
    trail_cb.forEach((pt, i) => {
      ctx.globalAlpha = 0.04 + (i / trail_cb.length) * 0.25;
      const p = proj(pt.x, pt.y, 0);
      ctx.beginPath(); ctx.arc(p.cx, p.cy, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#818cf8"; ctx.fill();
    });
  }
  ctx.globalAlpha = 1;

  // Catch-point rings (P2)
  if (frame.catchPts) {
    Object.values(frame.catchPts).forEach((cp) => {
      const p = proj(cp.x, cp.y, 0);
      ctx.beginPath(); ctx.arc(p.cx, p.cy, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(251,191,36,0.5)"; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([]);
    });
    if (frame.D1live !== undefined) {
      const cp1 = frame.catchPts.WR1, cp2 = frame.catchPts.WR2;
      const p1 = proj(cp1.x, cp1.y, 0), p2 = proj(cp2.x, cp2.y, 0);
      const open1 = frame.D1live > 2, open2 = frame.D2live > 2;
      ctx.font = "8px sans-serif"; ctx.textAlign = "center";
      ctx.fillStyle = open1 ? "#4ade80" : "#f87171";
      ctx.fillText(open1 ? `W1 OPEN ${frame.D1live.toFixed(1)}yd` : `W1 CLOSED`, p1.cx, p1.cy - 14);
      ctx.fillStyle = open2 ? "#4ade80" : "#f87171";
      ctx.fillText(open2 ? `W2 OPEN ${frame.D2live.toFixed(1)}yd` : `W2 CLOSED`, p2.cx, p2.cy - 14);
    }
  }

  if (frame.leadX !== undefined) {
    drawLeadPoint(ctx, frame.leadX, frame.leadY, "#fbbf2488");
    const lp = proj(frame.leadX, frame.leadY, 0);
    ctx.fillStyle = "rgba(251,191,36,0.6)"; ctx.font = "8px sans-serif";
    ctx.textAlign = "center"; ctx.fillText("lead", lp.cx, lp.cy - 10);
  }

  if (frame.targetX !== undefined && !frame.thrown) {
    const tgt = proj(frame.targetX, 0, 0);
    ctx.beginPath(); ctx.arc(tgt.cx, tgt.cy, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#06b6d4"; ctx.font = "8px sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`land ${frame.range?.toFixed(0)} yd`, tgt.cx, tgt.cy - 12);
  }

  const sorted = [...players].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
  sorted.forEach((p) => {
    drawPlayer(ctx, p.x, p.y, p.color, p.label, 0);
    if (showVecs && (p.vx || p.vy)) {
      drawVelArrow(ctx, p.x, p.y, p.vx ?? 0, p.vy ?? 0,
        p.offense ? "#86efac" : "#fca5a5", 1.0);
    }
  });

  if (thrown && bx !== null) { drawBallFull(ctx, bx, by, fz || 0); }

  if (impulse !== undefined) { drawImpulseBar(ctx, impulse, play.LB_P || 1150); }

  // P6 Zone Read: show DE velocity annotation
  if (frame.deV !== undefined && frame.deX !== undefined) {
    const deP = proj(frame.deX, -4, 0);
    const vColor = frame.deV > 0 ? "#4ade80" : "#f87171";
    ctx.fillStyle = vColor;
    ctx.font = `bold 9px ${FONT_MONO || "'Courier New',monospace"}`;
    ctx.textAlign = "center";
    ctx.fillText(`v_DE=${frame.deV.toFixed(2)} yd/s ${frame.deV>0?"? RETREATING":"? CHARGING"}`, deP.cx, deP.cy - 12);
  }

  // P7 Chain Rule: show WR speed annotation
  if (frame.wrSpeedNow !== undefined) {
    const wr = frame.players?.find(p => p.label === "WR?");
    if (wr) {
      const wp = proj(wr.x, wr.y + 3, 0);
      ctx.fillStyle = frame.wrSpeedNow > 1.8 ? "#4ade80" : "#94a3b8";
      ctx.font = `bold 8px 'Courier New',monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`s(t)=${frame.wrSpeedNow.toFixed(2)}`, wp.cx, wp.cy - 10);
    }
  }

  // P8 Blitz: show LB velocity
  if (frame.lbV !== undefined) {
    const lbPlayer = frame.players?.find(p => p.label === "LB");
    if (lbPlayer) {
      const lp = proj(lbPlayer.x, lbPlayer.y - 4, 0);
      ctx.fillStyle = frame.lbV < 2 ? "#4ade80" : "#f87171";
      ctx.font = `bold 8px 'Courier New',monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`v_LB=${frame.lbV.toFixed(2)}`, lp.cx, lp.cy - 10);
    }
  }

  if (frame.dRdTheta !== undefined) {
    const lbl = proj(28, 26);
    ctx.fillStyle = "rgba(6,182,212,0.85)"; ctx.font = "9px monospace"; ctx.textAlign = "left";
    ctx.fillText(
      `?=${frame.theta}° | R=${frame.range?.toFixed(1)} yd | dR/d?=${frame.dRdTheta?.toFixed(2)} ${frame.dRdTheta > 0 ? "?" : frame.dRdTheta < -0.1 ? "?" : "=0?"}`,
      lbl.cx, lbl.cy - 6,
    );
  }
}

function drawSetup(ctx, play) {
  drawIsoField(ctx);
  if (play.los) drawLOS(ctx, play.los);
  play.players.forEach((p) => {
    if (!p.controlled && !p.dynamic && p.segs?.length) drawRoute(ctx, p, p.color);
  });
  const sorted = [...play.players].sort((a, b) => a.y0 - b.y0);
  sorted.forEach((p) => {
    drawPlayer(ctx, p.x0, p.y0, p.color, p.label, 0);
    if (!p.dynamic) {
      const v = velAt(p, 0);
      if (v.vx || v.vy)
        drawVelArrow(ctx, p.x0, p.y0, v.vx, v.vy, p.offense ? "#86efac" : "#fca5a5", 1.0);
    }
  });
  if (play.catchPts) {
    Object.values(play.catchPts).forEach((cp) => {
      const p = proj(cp.x, cp.y, 0);
      ctx.beginPath(); ctx.arc(p.cx, p.cy, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(251,191,36,0.5)"; ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([]);
    });
  }
}

// --- LiveStats ----------------------------------------------------------------
function LiveStats({ frame, playIdx }) {
  const dark = useIsDark();
  if (!frame) return null;
  const rows = [{ label: "t", val: `${frame.t.toFixed(2)} s`, col: "#e2e8f0" }];
  if (playIdx === 0) {
    if (frame.leadX !== undefined) {
      rows.push({ label: "lead target x", val: `${frame.leadX.toFixed(1)} yd`, col: "#fbbf24" });
      rows.push({ label: "lead target y", val: `${frame.leadY.toFixed(1)} yd`, col: "#fbbf24" });
    }
    if (frame.T !== undefined) rows.push({ label: "throw time T", val: `${frame.T.toFixed(2)} s`, col: "#94a3b8" });
    if (frame.flightTime !== undefined) rows.push({ label: "flight time t_f", val: `${frame.flightTime.toFixed(2)} s`, col: "#94a3b8" });
    if (frame.catchDist != null) rows.push({ label: "|ball - WR1|", val: `${frame.catchDist.toFixed(2)} yd`, col: frame.catchDist < 2 ? "#4ade80" : "#f87171" });
    if (frame.cbBallDist != null) rows.push({ label: "CB distance", val: `${frame.cbBallDist.toFixed(1)} yd`, col: "#e2e8f0" });
    if (frame.fz != null) rows.push({ label: "ball height z", val: `${frame.fz.toFixed(1)} yd`, col: "#fbbf24" });
  } else if (playIdx === 1) {
    if (frame.tClose1 != null) rows.push({ label: "t_close WR1", val: `${frame.tClose1.toFixed(2)} s`, col: "#f87171" });
    if (frame.tClose2 != null) rows.push({ label: "t_close WR2", val: `${frame.tClose2.toFixed(2)} s`, col: "#4ade80" });
    if (frame.D1live != null) rows.push({ label: "D1(t) WR1 window", val: `${frame.D1live.toFixed(1)} yd`, col: frame.D1live > 2 ? "#4ade80" : "#f87171" });
    if (frame.D2live != null) rows.push({ label: "D2(t) WR2 window", val: `${frame.D2live.toFixed(1)} yd`, col: frame.D2live > 2 ? "#4ade80" : "#f87171" });
    if (frame.defDist != null) rows.push({ label: "chosen window", val: `${frame.defDist.toFixed(1)} yd`, col: frame.defDist > 2 ? "#4ade80" : "#f87171" });
    if (frame.fz != null) rows.push({ label: "ball height z", val: `${frame.fz.toFixed(1)} yd`, col: "#fbbf24" });
  } else if (playIdx === 2) {
    if (frame.cbBall != null) rows.push({ label: "|CB - ball|", val: `${frame.cbBall.toFixed(2)} yd`, col: frame.cbBall < 4 ? "#4ade80" : "#f87171" });
    if (frame.wrBall != null) rows.push({ label: "|WR - ball|", val: `${frame.wrBall.toFixed(2)} yd`, col: "#e2e8f0" });
    if (frame.cbSpd != null) rows.push({ label: "CB speed", val: `${frame.cbSpd.toFixed(1)} yd/s`, col: "#a78bfa" });
    if (frame.fz != null) rows.push({ label: "ball height z", val: `${frame.fz.toFixed(1)} yd`, col: "#fbbf24" });
  } else if (playIdx === 3) {
    if (frame.impulse != null) rows.push({ label: "J(t) = ?F dt", val: `${frame.impulse.toFixed(0)} lb·yd/s`, col: frame.impulse > 1150 ? "#4ade80" : "#f87171" });
    if (frame.lbSpeed != null) rows.push({ label: "v_LB(t)", val: `${frame.lbSpeed.toFixed(2)} yd/s`, col: frame.lbSpeed < 1.5 ? "#4ade80" : "#f87171" });
    if (frame.F != null) rows.push({ label: "F(t)", val: `${frame.F.toFixed(0)} lb`, col: "#fbbf24" });
    if (frame.rbX != null && frame.lbX != null) rows.push({ label: "gap RB?LB", val: `${(frame.lbX - frame.rbX).toFixed(1)} yd`, col: "#e2e8f0" });
  } else if (playIdx === 4) {
    if (frame.range != null) rows.push({ label: "R(?)", val: `${frame.range.toFixed(1)} yd`, col: "#06b6d4" });
    if (frame.maxRange != null) rows.push({ label: "R_max (?=45°)", val: `${frame.maxRange.toFixed(1)} yd`, col: "#94a3b8" });
    if (frame.dRdTheta != null) rows.push({ label: "dR/d?", val: `${frame.dRdTheta.toFixed(3)}`, col: Math.abs(frame.dRdTheta) < 0.1 ? "#4ade80" : "#94a3b8" });
    if (frame.theta != null) rows.push({ label: "sin(2?)", val: `${Math.sin((2 * frame.theta * Math.PI) / 180).toFixed(4)}`, col: "#e2e8f0" });
    if (frame.fz != null) rows.push({ label: "height z(t)", val: `${frame.fz.toFixed(1)} yd`, col: "#fbbf24" });
    if (frame.ballToS1 != null) rows.push({ label: "dist to S1", val: `${frame.ballToS1.toFixed(1)} yd`, col: frame.ballToS1 > 4 ? "#4ade80" : "#f87171" });
  } else if (playIdx === 5) {
    if (frame.deV  != null) rows.push({ label: "v_DE(t) dx/dt", val: `${frame.deV.toFixed(2)} yd/s`, col: frame.deV > 0 ? "#4ade80" : "#f87171" });
    if (frame.deX  != null) rows.push({ label: "x_DE(t)", val: `${frame.deX.toFixed(1)} yd`, col: "#e2e8f0" });
    if (frame.rbX  != null) rows.push({ label: "x_RB(t)", val: `${frame.rbX.toFixed(1)} yd`, col: "#f97316" });
    if (frame.handoffDist != null) rows.push({ label: "gap DE?RB", val: `${frame.handoffDist.toFixed(1)} yd`, col: "#e2e8f0" });
    rows.push({ label: "reversal t* = 2.0s", val: frame.t >= 2 ? "WINDOW OPEN" : "not yet", col: frame.t >= 2 ? "#4ade80" : "#f87171" });
  } else if (playIdx === 6) {
    if (frame.wrSpeedNow != null) rows.push({ label: "s(t) = sin(t)+1", val: `${frame.wrSpeedNow.toFixed(3)} yd/s`, col: frame.wrSpeedNow > 1.8 ? "#4ade80" : "#94a3b8" });
    if (frame.catchDist  != null) rows.push({ label: "|ball - WR?|", val: `${frame.catchDist.toFixed(2)} yd`, col: frame.catchDist < 2.5 ? "#4ade80" : "#f87171" });
    if (frame.flightTime != null) rows.push({ label: "flight time t_f", val: `${frame.flightTime.toFixed(2)} s`, col: "#94a3b8" });
    if (frame.fz         != null) rows.push({ label: "ball height z", val: `${frame.fz.toFixed(1)} yd`, col: "#fbbf24" });
    rows.push({ label: "peak at t*=p/2˜1.57s", val: Math.abs(frame.t - Math.PI/2) < 0.3 ? "NOW ?" : "not yet", col: Math.abs(frame.t - Math.PI/2) < 0.3 ? "#4ade80" : "#94a3b8" });
  } else if (playIdx === 7) {
    if (frame.lbV       != null) rows.push({ label: "v_LB = 6e^(-2t)", val: `${frame.lbV.toFixed(3)} yd/s`, col: frame.lbV < 2 ? "#4ade80" : "#f87171" });
    if (frame.lbX       != null) rows.push({ label: "x_LB(t)", val: `${frame.lbX.toFixed(1)} yd`, col: "#e2e8f0" });
    if (frame.qbLBdist  != null) rows.push({ label: "QB?LB gap", val: `${frame.qbLBdist.toFixed(1)} yd`, col: frame.qbLBdist > 3 ? "#4ade80" : "#f87171" });
    rows.push({ label: "escape t*˜0.55s", val: frame.lbV < 2 ? "WINDOW OPEN" : `v_LB=${frame.lbV?.toFixed(2)}`, col: frame.lbV < 2 ? "#4ade80" : "#f87171" });
  }

  return (
    <div style={{ background: dark ? "#0f172a" : "#eaf4ea", borderRadius: 8, padding: "10px 12px", border: `1px solid ${dark ? "#334155" : "#c8dcc8"}`, marginTop: 8 }}>
      <div style={{ fontSize: 11, color: dark ? "#64748b" : "#5a7a5a", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Values</div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: dark ? "#7dd3fc" : "#1e40af" }}>{r.label}</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: r.col }}>{r.val}</span>
        </div>
      ))}
    </div>
  );
}

// --- Scrubber -----------------------------------------------------------------
function Scrubber({ frames, frameIdx, onChange }) {
  if (!frames?.length) return null;
  return (
    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 10, color: "#64748b", whiteSpace: "nowrap" }}>t={(frameIdx / 60 || 0).toFixed(2)}s</span>
      <input type="range" min={0} max={frames.length - 1} value={frameIdx} onChange={(e) => onChange(+e.target.value)} style={{ flex: 1, accentColor: "#60a5fa", height: 4 }} />
      <span style={{ fontSize: 10, color: "#64748b", whiteSpace: "nowrap" }}>{(frames.length / 60).toFixed(1)}s</span>
    </div>
  );
}

const MathModal = ({ playId, color, onClose }) => {
  const dark = useIsDark();
  const play = PLAYS.find((p) => p.id === playId) || PLAYS[0];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(3, 7, 18, 0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(860px, 100%)", maxHeight: "80vh", overflow: "auto", background: dark ? "#0f1b2d" : "#ffffff", color: dark ? "#f4f7fb" : "#122033", border: `1px solid ${dark ? "#294262" : "#bfd0e3"}`, borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.35)", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: FONT_HEADER, fontSize: 28, letterSpacing: "0.06em", textTransform: "uppercase", color }}>{play.name}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 16, lineHeight: 1.65, marginTop: 8 }}>{play.description}</div>
          </div>
          <button onClick={onClose} style={{ border: `1px solid ${dark ? "#294262" : "#bfd0e3"}`, background: "transparent", color: "inherit", borderRadius: 12, padding: "10px 14px", cursor: "pointer", fontFamily: FONT_HEADER, textTransform: "uppercase", letterSpacing: "0.05em" }}>Close</button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {(play.theory || []).filter(Boolean).map((line, i) => (
            <div key={`${play.id}-${i}`} style={{ padding: "10px 12px", borderRadius: 12, background: dark ? "#162941" : "#eef4fb", fontFamily: /[=+\-*/^()]/.test(line) ? FONT_MONO : FONT_BODY, fontSize: 15, lineHeight: 1.6 }}>
              {String(line).replaceAll("→", "->").replaceAll("—", "-").replaceAll("–", "-")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// --- Main ---------------------------------------------------------------------
export default function FootballCalculus() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const simRef    = useRef(null);
  const dark = useIsDark();
  const [playIdx,    setPlayIdx]    = useState(0);
  const [inputs,     setInputs]     = useState({});
  const [inputErrs,  setInputErrs]  = useState({});
  const [warning,    setWarning]    = useState("");
  const [result,     setResult]     = useState(null);
  const [msg,        setMsg]        = useState("");
  const [playing,    setPlaying]    = useState(false);
  const [hasFrames,  setHasFrames]  = useState(false);
  const [liveFrame,  setLiveFrame]  = useState(null);
  const [scrubIdx,   setScrubIdx]   = useState(0);
  const [showVecs,   setShowVecs]   = useState(true);
  const [jitter,     setJitter]     = useState(() => makeJitter(PLAYS[0]));
  const [modalOpen,  setModalOpen]  = useState(false);

  // Derived values — must come before any callbacks that reference them
  const play     = PLAYS[playIdx];
  const livePlay = applyJitter(play, jitter);

  // -- Camera state ------------------------------------------------------------
  const [camLabel, setCamLabel] = useState(""); // brief HUD feedback

  // Reset camera to default
  const resetCam = useCallback(() => {
    CAM.ox   = CAM_DEFAULT.ox;
    CAM.oy   = CAM_DEFAULT.oy;
    CAM.xs   = CAM_DEFAULT.xs;
    CAM.ys   = CAM_DEFAULT.ys;
    CAM.tilt = CAM_DEFAULT.tilt;
    CAM.zs   = CAM_DEFAULT.zs;
    setCamLabel("Reset");
    setTimeout(() => setCamLabel(""), 800);
    // Redraw current state
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (simRef.current?.frames) {
        const fi = simRef.current.frameIdx - 1;
        if (fi >= 0) drawFrame(ctx, simRef.current.frames[fi], simRef.current.livePlay || PLAYS[simRef.current.playIdx], showVecs);
      } else {
        drawSetup(ctx, livePlay);
      }
    }
  }, [livePlay, showVecs]);

  const zoomCam = useCallback((factor) => {
    CAM.xs   = Math.max(3, Math.min(16, CAM.xs   * factor));
    CAM.ys   = Math.max(1.2, Math.min(8, CAM.ys  * factor));
    CAM.zs   = Math.max(5,   Math.min(22, CAM.zs  * factor));
    setCamLabel(factor > 1 ? "Zoom In" : "Zoom Out");
    setTimeout(() => setCamLabel(""), 600);
  }, []);

  const tiltCam = useCallback((delta) => {
    CAM.tilt = Math.max(0.1, Math.min(0.9, CAM.tilt + delta));
    setCamLabel(delta > 0 ? "Tilt Up" : "Tilt Down");
    setTimeout(() => setCamLabel(""), 600);
  }, []);


  const remix = useCallback(() => {
    setJitter(makeJitter(PLAYS[playIdx]));
    setHasFrames(false); setResult(null); setMsg(""); setWarning(""); setLiveFrame(null); setPlaying(false);
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    simRef.current = null;
  }, [playIdx]);

  useEffect(() => {
    if (hasFrames) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSetup(canvas.getContext("2d"), livePlay);
  }, [playIdx, hasFrames, livePlay]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const stopAnim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    setPlaying(false);
  }, []);

  const tick = useCallback(() => {
    if (!simRef.current) return;
    const { frames, playIdx: pIdx } = simRef.current;
    const fi = simRef.current.frameIdx;
    if (fi >= frames.length) { setPlaying(false); return; }
    const canvas = canvasRef.current;
    if (canvas) drawFrame(canvas.getContext("2d"), frames[fi], simRef.current.livePlay || PLAYS[pIdx], simRef.current.showVecs);
    simRef.current.frameIdx = fi + 1;
    setScrubIdx(fi);
    if (fi % 4 === 0) setLiveFrame(frames[fi]);
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const runSim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    const res = livePlay.run.call(livePlay, inputs);
    if (res.error) { setInputErrs({ [res.error]: res.msg }); setWarning(""); setHasFrames(false); setResult(null); return; }
    if (res.warning) { setWarning(res.warning); setInputErrs({}); setHasFrames(false); setResult(null); return; }
    setInputErrs({}); setWarning(""); setResult(res.result); setMsg(res.msg || "");
    setHasFrames(true); setLiveFrame(null); setScrubIdx(0); setPlaying(true);
    simRef.current = { frames: res.frames, frameIdx: 0, playIdx, showVecs, livePlay };
    animRef.current = requestAnimationFrame(tick);
  }, [playIdx, inputs, showVecs, tick, livePlay]);

  const resetSim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    simRef.current = null;
    setHasFrames(false); setResult(null); setMsg(""); setWarning(""); setLiveFrame(null); setPlaying(false); setScrubIdx(0);
  }, []);

  const selectPlay = useCallback((idx) => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    simRef.current = null;
    setPlayIdx(idx); setJitter(makeJitter(PLAYS[idx])); setInputs({}); setInputErrs({});
    setWarning(""); setResult(null); setMsg(""); setHasFrames(false); setLiveFrame(null); setPlaying(false); setScrubIdx(0);
  }, []);

  const onScrub = useCallback((fi) => {
    stopAnim();
    const frames = simRef.current?.frames;
    if (!frames) return;
    setScrubIdx(fi); setLiveFrame(frames[fi]);
    const canvas = canvasRef.current;
    if (canvas) drawFrame(canvas.getContext("2d"), frames[fi], simRef.current.livePlay || PLAYS[simRef.current.playIdx], showVecs);
  }, [stopAnim, showVecs]);

  const setInput = useCallback((id, val) => {
    setInputs((p) => ({ ...p, [id]: val }));
    setInputErrs({}); setWarning("");
  }, []);

  const T = {
    bg: dark ? "#08111f" : "#eef3f8",
    surface: dark ? "#0f1b2d" : "#ffffff",
    border: dark ? "#223651" : "#c8d5e6",
    text: dark ? "#f4f7fb" : "#122033",
    muted: dark ? "#9db0c7" : "#5e7089",
    inputBg: dark ? "#0a1526" : "#f8fbff",
    inputBorder: dark ? "#294262" : "#bfcfe2",
    inputText: dark ? "#f4f7fb" : "#122033",
    cardBg: dark ? "#101f33" : "#f5f8fc",
    mathBg: dark ? "#162941" : "#eaf1f8",
    mathText: dark ? "#dbeafe" : "#1d4e89",
    warnBg: dark ? "#1d2c45" : "#dbeafe",
    warnText: dark ? "#bfdbfe" : "#1d4e89",
    winBg: dark ? "#16281f" : "#e8f6ee",
    winText: dark ? "#86efac" : "#166534",
    loseBg: dark ? "#34151c" : "#fdebec",
    loseText: dark ? "#fda4af" : "#9f1239",
  };
  const pageBg = dark
    ? "radial-gradient(circle at top, rgba(28,56,96,0.45), rgba(4,8,15,0.96) 58%)"
    : "linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%)";
  const frameBorder = dark ? "#2a4365" : "#bfd0e3";
  const accentRed = "#c1121f";
  const accentBlue = "#0a2342";
  const accentSilver = dark ? "#d8e1ea" : "#4a5b73";

  return (
    <div style={{
      color: T.text,
      width: "100%",
      maxWidth: 1760,
      margin: "0 auto",
      padding: "20px clamp(16px, 2.2vw, 34px) 28px",
      fontFamily: FONT_BODY,
      background: pageBg,
      borderRadius: 24,
      boxShadow: dark ? "0 24px 80px rgba(0,0,0,0.55)" : "0 20px 60px rgba(15,23,42,0.10)",
      minHeight: 400,
      boxSizing: "border-box",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        justifyContent: "space-between",
        padding: "22px clamp(18px, 2vw, 30px)",
        borderRadius: 22,
        background: dark
          ? "linear-gradient(135deg, rgba(10,35,66,0.98), rgba(22,38,64,0.98))"
          : "linear-gradient(135deg, #0a2342, #163a63)",
        border: `1px solid ${frameBorder}`,
        boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
        flexWrap: "wrap",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flex: "1 1 560px" }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: `linear-gradient(135deg, ${accentRed}, #8d0b14)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
            color: "#fff",
            fontFamily: FONT_HEADER,
            fontSize: 28,
            letterSpacing: "0.08em",
          }}>NFL</div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: "clamp(34px, 3.4vw, 52px)",
              fontWeight: 900,
              color: "#fff",
              fontFamily: FONT_HEADER,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              lineHeight: 1,
            }}>Football Calculus</div>
            <div style={{
              fontSize: "clamp(15px, 1.15vw, 19px)",
              color: "rgba(235,241,248,0.92)",
              marginTop: 8,
              fontFamily: FONT_BODY,
              maxWidth: 900,
              lineHeight: 1.6,
            }}>
              Eight playable football scenarios, eight calculus ideas, and physics-driven timing, pursuit, impulse, and ball flight.
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => setModalOpen(true)} style={{
            padding: "12px 18px",
            borderRadius: 14,
            cursor: "pointer",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: FONT_HEADER,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>Learn the Math</button>
          <button onClick={() => setShowVecs(v => !v)} style={{
            padding: "12px 18px",
            borderRadius: 14,
            cursor: "pointer",
            background: showVecs ? "rgba(193,18,31,0.22)" : "transparent",
            border: `1px solid ${showVecs ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.18)"}`,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: FONT_HEADER,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>{showVecs ? "Vectors On" : "Vectors Off"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 18 }}>
        {PLAYS.map((p, i) => (
          <button key={p.id} onClick={() => selectPlay(i)} style={{
            padding: "16px 18px",
            borderRadius: 18,
            cursor: "pointer",
            border: `2px solid ${i === playIdx ? p.color : (dark ? "#223651" : "#cfdae8")}`,
            background: i === playIdx
              ? `linear-gradient(135deg, ${p.color}28, ${p.color}10)`
              : (dark ? "#0d1828" : "#f8fbff"),
            color: i === playIdx ? "#ffffff" : T.text,
            textAlign: "left",
            transition: "all 0.15s",
            boxShadow: i === playIdx ? `0 10px 24px ${p.color}22` : "none",
          }}>
            <div style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: FONT_HEADER,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: i === playIdx ? p.color : accentSilver,
            }}>{p.name}</div>
            <div style={{
              fontSize: 14,
              opacity: 0.92,
              marginTop: 6,
              fontFamily: FONT_BODY,
              lineHeight: 1.55,
              color: i === playIdx ? "rgba(255,255,255,0.92)" : T.muted,
            }}>
              {p.down}
            </div>
          </button>
        ))}
      </div>

      <div style={{
        borderLeft: `5px solid ${play.color}`,
        borderRadius: "0 18px 18px 0",
        padding: "16px 20px",
        marginBottom: 20,
        background: dark ? `${play.color}12` : `${play.color}0e`,
        fontSize: 17,
        lineHeight: 1.7,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <span style={{
            fontWeight: 700,
            color: play.color,
            fontFamily: FONT_HEADER,
            fontSize: 24,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>{play.concept}</span>
          <span style={{ color: T.text, fontFamily: FONT_BODY }}> - {play.description}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 980px", minWidth: 0 }}>
          <div style={{ position: "relative" }}>
            <canvas ref={canvasRef} width={W} height={H}
              style={{
                width: "100%",
                aspectRatio: `${W} / ${H}`,
                borderRadius: 22,
                border: `2px solid ${frameBorder}`,
                display: "block",
                cursor: "default",
                userSelect: "none",
                background: accentBlue,
                boxShadow: dark ? "0 18px 40px rgba(0,0,0,0.35)" : "0 14px 34px rgba(15,23,42,0.12)",
              }}
            />
            {camLabel && (
              <div style={{
                position: "absolute",
                top: 12,
                right: 14,
                background: "rgba(0,0,0,0.68)",
                color: "#fbbf24",
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: FONT_HEADER,
                letterSpacing: "0.06em",
                pointerEvents: "none",
                textTransform: "uppercase",
              }}>
                {camLabel}
              </div>
            )}
            <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, maxWidth: "70%" }}>
              <div style={{
                background: "rgba(0,0,0,0.58)",
                color: "#dbeafe",
                padding: "5px 9px",
                borderRadius: 8,
                fontSize: 11,
                fontFamily: FONT_HEADER,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                2.5D View
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {[
                  { label: "Zoom+", title: "Zoom in", onClick: () => zoomCam(1.2) },
                  { label: "Zoom-", title: "Zoom out", onClick: () => zoomCam(0.8) },
                  { label: "Tilt+", title: "Tilt up", onClick: () => tiltCam(0.06) },
                  { label: "Tilt-", title: "Tilt down", onClick: () => tiltCam(-0.06) },
                  { label: "Reset View", title: "Reset camera", onClick: resetCam },
                ].map((btn) => (
                  <button key={btn.label} title={btn.title} onClick={btn.onClick}
                          style={{ minWidth: 78, height: 34, borderRadius: 10, border: "1px solid rgba(255,255,255,0.24)",
                                   background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 12, cursor: "pointer",
                                   display: "flex", alignItems: "center", justifyContent: "center",
                                   fontFamily: FONT_HEADER, letterSpacing: "0.05em", textTransform: "uppercase", padding: "0 10px" }}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasFrames && <Scrubber frames={simRef.current?.frames} frameIdx={scrubIdx} onChange={onScrub} />}

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {play.inputs.map((inp) => (
              <div key={inp.id} style={{
                background: T.cardBg,
                borderRadius: 16,
                padding: "14px 16px",
                border: `1px solid ${inputErrs[inp.id] ? "#ef4444" : T.border}`,
                boxShadow: dark ? "0 10px 24px rgba(0,0,0,0.18)" : "0 10px 24px rgba(15,23,42,0.06)",
              }}>
                <label style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: play.color,
                  display: "block",
                  marginBottom: 8,
                  fontFamily: FONT_HEADER,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>{inp.label}</label>
                <input type="text" style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, boxSizing: "border-box",
                  border: `1.5px solid ${inputErrs[inp.id] ? "#ef4444" : T.inputBorder}`,
                  background: T.inputBg, color: T.inputText, fontFamily: FONT_MONO, fontSize: 19, outline: "none",
                }}
                  value={inputs[inp.id] || ""}
                  placeholder={inp.placeholder}
                  onChange={(e) => setInput(inp.id, e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") runSim(); }}
                />
                {inputErrs[inp.id] && (
                  <div style={{ fontSize: 13, color: "#f87171", marginTop: 8, fontFamily: FONT_BODY, lineHeight: 1.5 }}>
                    Warning: {inputErrs[inp.id]}
                  </div>
                )}
                <div style={{ fontSize: 12, color: dark ? "#93c5fd" : "#1d4e89", fontFamily: FONT_BODY, marginTop: 8, lineHeight: 1.55 }}>
                  {inp.hint}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            {!playing ? (
              <button onClick={runSim} style={{
                flex: "1 1 240px", padding: "14px 18px", borderRadius: 14, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 15, color: "#fff", background: `linear-gradient(135deg, ${accentRed}, #8d0b14)`,
                fontFamily: FONT_HEADER, letterSpacing: "0.06em", textTransform: "uppercase",
                boxShadow: "0 10px 24px rgba(193,18,31,0.35)",
              }}>Run Play</button>
            ) : (
              <button onClick={stopAnim} style={{
                flex: "1 1 240px", padding: "14px 18px", borderRadius: 14, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 15, color: "#fff", background: "#475569",
                fontFamily: FONT_HEADER, letterSpacing: "0.06em", textTransform: "uppercase",
              }}>Stop</button>
            )}
            {hasFrames && (
              <button onClick={resetSim} style={{
                padding: "14px 18px", borderRadius: 14, border: `1px solid ${T.border}`, cursor: "pointer",
                fontWeight: 700, fontSize: 14, color: T.text, background: T.surface,
                fontFamily: FONT_HEADER, letterSpacing: "0.05em", textTransform: "uppercase",
              }}>Reset</button>
            )}
            <button onClick={remix} style={{
              padding: "14px 18px", borderRadius: 14, cursor: "pointer", border: `1px solid ${frameBorder}`,
              fontWeight: 700, fontSize: 14, color: T.text, background: "transparent",
              fontFamily: FONT_HEADER, letterSpacing: "0.05em", textTransform: "uppercase",
            }} title="New defender formation">Remix Defense</button>
          </div>

          {warning && (
            <div style={{
              padding: "14px 18px", borderRadius: 16, fontSize: 15, background: T.warnBg, color: T.warnText,
              lineHeight: 1.6, borderLeft: "4px solid #3b82f6", fontFamily: FONT_BODY, marginTop: 16,
            }}>Warning: {warning}</div>
          )}
          {result && !playing && (
            <div style={{
              padding: "16px 18px", borderRadius: 16, fontSize: 16, fontWeight: 700, lineHeight: 1.6,
              background: result === "win" ? T.winBg : T.loseBg,
              color: result === "win" ? T.winText : T.loseText,
              borderLeft: `4px solid ${result === "win" ? "#16a34a" : "#dc2626"}`,
              fontFamily: FONT_BODY, marginTop: 16,
            }}>
              {result === "win" ? "Success: " : "Miss: "}{msg}
            </div>
          )}
        </div>

        <div style={{ flex: "0 1 380px", minWidth: 300, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{
            background: T.surface, borderRadius: 18, border: `1px solid ${play.color}44`, overflow: "hidden",
            boxShadow: dark ? "0 12px 28px rgba(0,0,0,0.18)" : "0 10px 24px rgba(15,23,42,0.06)",
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${play.color}33, ${play.color}11)`, borderBottom: `1px solid ${play.color}33`,
              padding: "16px 18px", display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: play.color, display: "flex",
                alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: FONT_HEADER,
                fontSize: 18, letterSpacing: "0.06em", flexShrink: 0,
              }}>f</div>
              <div style={{
                fontSize: 20, fontWeight: 700, color: play.color, fontFamily: FONT_HEADER,
                letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1.2,
              }}>{play.concept}</div>
            </div>

            <div style={{ padding: "16px 18px" }}>
              {(play.theory || []).filter(Boolean).map((line, i) => {
                const trimmed = line.trim();
                const isStep = /^(STEP|KEY|WHY|CHECK|INSIGHT|DERIVE|CONCEPT|VERIFY)/.test(trimmed);
                const isArrow = trimmed.startsWith("->") || trimmed.startsWith("=>");
                const isMath = !isStep && !isArrow && (/[=+\-*/^()]/.test(trimmed) || /^[A-Za-z]/.test(trimmed));
                if (isStep) {
                  return (
                    <div key={i} style={{
                      fontSize: 12, fontWeight: 700, color: dark ? "#fbbf24" : "#92400e",
                      fontFamily: FONT_HEADER, letterSpacing: "0.05em", margin: "8px 0 4px", textTransform: "uppercase",
                    }}>{trimmed}</div>
                  );
                }
                if (isArrow) {
                  return (
                    <div key={i} style={{
                      fontSize: 13, color: dark ? "#93c5fd" : "#1d4e89", fontFamily: FONT_MONO,
                      paddingLeft: 10, margin: "3px 0", lineHeight: 1.55,
                    }}>{trimmed}</div>
                  );
                }
                if (isMath) {
                  return (
                    <div key={i} style={{
                      fontFamily: FONT_MONO, fontSize: 13, color: dark ? "#dbeafe" : "#1d4e89", background: T.mathBg,
                      borderLeft: `3px solid ${play.color}`, padding: "8px 12px", margin: "6px 0",
                      borderRadius: "0 8px 8px 0", lineHeight: 1.6,
                    }}>{trimmed}</div>
                  );
                }
                return (
                  <div key={i} style={{ fontSize: 15, color: T.muted, margin: "5px 0", lineHeight: 1.65, fontFamily: FONT_BODY }}>
                    {trimmed.replaceAll("�", "").replaceAll("·", "-")}
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setModalOpen(true)} style={{
            width: "100%", padding: "15px 18px", borderRadius: 16, cursor: "pointer",
            background: `linear-gradient(135deg, ${play.color}, ${play.color}bb)`, border: "none", color: "#fff",
            fontSize: 16, fontWeight: 700, fontFamily: FONT_HEADER, letterSpacing: "0.06em",
            textTransform: "uppercase", boxShadow: `0 6px 18px ${play.color}44`,
          }}>
            Learn the Math
          </button>

          {(hasFrames || liveFrame) && <LiveStats frame={liveFrame} playIdx={playIdx} />}
        </div>
      </div>

      <div style={{ marginTop: 18, fontSize: 14, color: T.muted, textAlign: "center", opacity: 0.88, lineHeight: 1.7, fontFamily: FONT_BODY }}>
        2.5D isometric view. Ball height follows a real projectile arc, the shadow stays on the field, and the scrubber lets you review the full play.
      </div>

      {modalOpen && (
        <MathModal playId={play.id} color={play.color} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}








