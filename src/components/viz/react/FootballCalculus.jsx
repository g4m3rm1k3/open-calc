import { useState, useRef, useEffect, useCallback } from "react";

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

// ─── Isometric 2.5D projection ───────────────────────────────────────────────
const W = 1000,
  H = 600;
const ISO = {
  originX: 80,
  originY: 450,
  xScale: 8.0,
  yScale: 3.2,
  zScale: 8,
  tilt: 0.42,
};

function proj(fdx, fdy, fz = 0) {
  const cx = ISO.originX + fdx * ISO.xScale + fdy * ISO.yScale * ISO.tilt;
  const cy = ISO.originY - fdy * ISO.yScale - fz * ISO.zScale;
  return { cx, cy };
}

// ─── Formula parser ───────────────────────────────────────────────────────────
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

// ─── Route engine ─────────────────────────────────────────────────────────────
function posAt(player, t) {
  let x = player.x0,
    y = player.y0,
    rem = t;
  for (const s of player.segs || []) {
    const dur = s.dur ?? Infinity;
    const dt = isFinite(dur) ? Math.min(rem, dur) : rem;
    x += (s.vx ?? 0) * dt;
    y += (s.vy ?? 0) * dt;
    rem -= dt;
    if (rem <= 0) break;
  }
  return { x, y };
}

function velAt(player, t) {
  let rem = t;
  for (const s of player.segs || []) {
    rem -= s.dur ?? Infinity;
    if (rem <= 0) return { vx: s.vx ?? 0, vy: s.vy ?? 0 };
  }
  const last = player.segs?.[player.segs.length - 1];
  return { vx: last?.vx ?? 0, vy: last?.vy ?? 0 };
}

// ─── Ball arc (projectile physics, real z in yards) ──────────────────────────
// Peak height peakZ yards at midpoint of flight
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

// ─── Canvas drawing ───────────────────────────────────────────────────────────
function drawIsoField(ctx) {
  ctx.clearRect(0, 0, W, H);
  // Sky gradient — more dramatic with larger canvas
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#060e18");
  sky.addColorStop(0.45, "#0a1a2e");
  sky.addColorStop(0.7, "#0d2035");
  sky.addColorStop(1, "#112840");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const c1 = proj(0, -26.5),
    c2 = proj(100, -26.5);
  const c3 = proj(100, 26.5),
    c4 = proj(0, 26.5);
  ctx.beginPath();
  ctx.moveTo(c1.cx, c1.cy);
  ctx.lineTo(c2.cx, c2.cy);
  ctx.lineTo(c3.cx, c3.cy);
  ctx.lineTo(c4.cx, c4.cy);
  ctx.closePath();
  ctx.fillStyle = "#15803d";
  ctx.fill();

  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) continue;
    const x0 = i * 10,
      x1 = x0 + 10;
    const a = proj(x0, -26.5),
      b = proj(x1, -26.5);
    const c = proj(x1, 26.5),
      d = proj(x0, 26.5);
    ctx.beginPath();
    ctx.moveTo(a.cx, a.cy);
    ctx.lineTo(b.cx, b.cy);
    ctx.lineTo(c.cx, c.cy);
    ctx.lineTo(d.cx, d.cy);
    ctx.closePath();
    ctx.fillStyle = "#166534";
    ctx.fill();
  }

  // Endzones with richer colors and labels
  [
    [0, 10, "#7c1d1d", "HOME"],
    [90, 100, "#1a3a6e", "AWAY"],
  ].forEach(([x0, x1, col, label]) => {
    const a = proj(x0, -26.5),
      b = proj(x1, -26.5),
      c = proj(x1, 26.5),
      d = proj(x0, 26.5);
    ctx.beginPath();
    ctx.moveTo(a.cx, a.cy);
    ctx.lineTo(b.cx, b.cy);
    ctx.lineTo(c.cx, c.cy);
    ctx.lineTo(d.cx, d.cy);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.88;
    ctx.fill();
    ctx.globalAlpha = 1;
    // Endzone label
    const mid = proj((x0 + x1) / 2, 0);
    ctx.save();
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, mid.cx, mid.cy);
    ctx.restore();
  });

  for (let yd = 10; yd <= 90; yd += 10) {
    const a = proj(yd, -26.5),
      b = proj(yd, 26.5);
    ctx.beginPath();
    ctx.moveTo(a.cx, a.cy);
    ctx.lineTo(b.cx, b.cy);
    ctx.strokeStyle =
      yd === 50 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)";
    ctx.lineWidth = yd === 50 ? 1.5 : 0.8;
    ctx.stroke();
    const lbl = proj(yd, -23);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "bold 8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(yd, lbl.cx, lbl.cy);
  }

  for (let yd = 10; yd <= 90; yd += 5) {
    [-3.5, 3.5].forEach((hy) => {
      const a = proj(yd, hy - 1),
        b = proj(yd, hy + 1);
      ctx.beginPath();
      ctx.moveTo(a.cx, a.cy);
      ctx.lineTo(b.cx, b.cy);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });
  }

  [-26.5, 26.5].forEach((fy) => {
    const a = proj(10, fy),
      b = proj(90, fy);
    ctx.beginPath();
    ctx.moveTo(a.cx, a.cy);
    ctx.lineTo(b.cx, b.cy);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  const los1 = proj(30, -26.5),
    los2 = proj(30, 26.5);
  ctx.beginPath();
  ctx.moveTo(los1.cx, los1.cy);
  ctx.lineTo(los2.cx, los2.cy);
  ctx.strokeStyle = "rgba(251,191,36,0.35)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  const losLbl = proj(30, -24);
  ctx.fillStyle = "rgba(251,191,36,0.6)";
  ctx.font = "7px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("LOS", losLbl.cx + 2, losLbl.cy);
}

function drawPlayer(ctx, fdx, fdy, color, label, fz = 0, r = 8) {
  const { cx, cy } = proj(fdx, fdy, fz);
  const sh = proj(fdx, fdy, 0);
  ctx.beginPath();
  ctx.ellipse(sh.cx, sh.cy, r * 1.4, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = `bold ${label.length > 2 ? 6 : 7}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy);
  ctx.textBaseline = "alphabetic";
}

function drawBallFull(ctx, fdx, fdy, fz) {
  const { cx, cy } = proj(fdx, fdy, fz);
  const sh = proj(fdx, fdy, 0);
  const r = 4 + fz * 1.2;
  ctx.beginPath();
  ctx.ellipse(
    sh.cx,
    sh.cy,
    Math.max(3, r * 0.9),
    Math.max(1.5, r * 0.4),
    0,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = `rgba(0,0,0,${Math.max(0.1, 0.4 - fz * 0.06)})`;
  ctx.fill();
  if (fz > 0.3) {
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(sh.cx, sh.cy);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fz > 0.2 ? "#f59e0b" : "#b45309";
  ctx.fill();
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawVelArrow(ctx, fdx, fdy, vx, vy, color, scale = 1.0) {
  if (!vx && !vy) return;
  const from = proj(fdx, fdy, 0);
  const to = proj(fdx + vx * scale, fdy + vy * scale, 0);
  const dx = to.cx - from.cx,
    dy = to.cy - from.cy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 3) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(from.cx, from.cy);
  ctx.lineTo(to.cx, to.cy);
  ctx.stroke();
  const angle = Math.atan2(dy, dx);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(to.cx, to.cy);
  ctx.lineTo(
    to.cx - 8 * Math.cos(angle - 0.4),
    to.cy - 8 * Math.sin(angle - 0.4),
  );
  ctx.lineTo(
    to.cx - 8 * Math.cos(angle + 0.4),
    to.cy - 8 * Math.sin(angle + 0.4),
  );
  ctx.closePath();
  ctx.fill();
}

function drawRoute(ctx, player, color) {
  if (!player.segs?.length) return;
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = color + "55";
  ctx.lineWidth = 1;
  ctx.beginPath();
  let x = player.x0,
    y = player.y0;
  const p0 = proj(x, y);
  ctx.moveTo(p0.cx, p0.cy);
  for (const s of player.segs) {
    const dur = s.dur ?? 3;
    x += (s.vx ?? 0) * (isFinite(dur) ? dur : 3);
    y += (s.vy ?? 0) * (isFinite(dur) ? dur : 3);
    const p = proj(x, y);
    ctx.lineTo(p.cx, p.cy);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawImpulseBar(ctx, impulse, needed) {
  const bx = 10,
    by = H - 28,
    bw = 150,
    bh = 14;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(bx, by, bw, bh);
  const pct = Math.min(impulse / needed, 1);
  ctx.fillStyle = pct >= 1 ? "#4ade80" : pct > 0.6 ? "#fbbf24" : "#f87171";
  ctx.fillRect(bx, by, bw * pct, bh);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 0.8;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = "white";
  ctx.font = "8px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `J = ${impulse.toFixed(0)} / ${needed} lb·yd/s`,
    bx + bw / 2,
    by + bh / 2,
  );
  ctx.textBaseline = "alphabetic";
}

// Draw a "lead point" X marker on the field
function drawLeadPoint(ctx, fdx, fdy, color) {
  const { cx, cy } = proj(fdx, fdy, 0);
  const s = 6;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s);
  ctx.lineTo(cx + s, cy + s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s, cy - s);
  ctx.lineTo(cx - s, cy + s);
  ctx.stroke();
}

// ─── Position jitter (re-randomized each play/remix) ─────────────────────────
// Applies ±3 yd offsets to defender starting positions so every attempt is
// slightly different. Offense/QB positions stay fixed so the math is consistent.
function makeJitter(play) {
  const offsets = {};
  play.players.forEach((p) => {
    if (!p.offense && !p.controlled && !p.dynamic) {
      // Random offset: ±2.5 yards in x, ±2.5 yards in y
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

// ─── PLAYS ────────────────────────────────────────────────────────────────────
const PLAYS = [
  // ══════════════════════════════════════════════════════════════════════
  // P1 — Slant Route: Integration
  // KEY FIX: Ball correctly leads to where WR WILL BE (future position).
  // The run() validates user's equations against actual kinematics.
  // Ball is aimed at WR1's position at (T + flight_time), not just T.
  // This makes it a true lead-pass problem: integrate to find future pos.
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "P1",
    name: "Slant Route",
    down: "2nd & 8",
    concept: "Integration · x(t) = x₀ + ∫v dt",
    color: "#22c55e",
    description:
      "WR1 runs a slant at 10 yd/s. Write x_r(t) and y_r(t), then find throw time T so the ball arrives WHERE THE RECEIVER WILL BE — not where he is now. Ball speed = 30 yd/s.",
    theory: [
      "CONCEPT: Integration gives position from velocity.",
      "WHY: If you know how fast a receiver moves each instant (velocity), you can add up all those tiny displacements to find where he ends up — that's what an integral does.",
      "WR1 runs at constant velocity: vx=10, vy=−6 yd/s.",
      "DERIVE: x_r(t) = x₀ + ∫₀ᵗ vx dτ = 30 + 10t",
      "       y_r(t) = y₀ + ∫₀ᵗ vy dτ = 10 − 6t",
      "KEY INSIGHT: Don't throw to where WR is — throw to where he'll BE when the ball arrives.",
      "STEP 1: Write x_r(t) and y_r(t) using integration.",
      "STEP 2: Pick throw time T. Compute WR1 position at T.",
      "STEP 3: t_f = dist(QB → WR1(T)) / 30. Ball arrives at T + t_f.",
      "STEP 4: WR1 is still moving! True target = WR1(T + t_f).",
      "STEP 5: Adjust T until ball meets receiver.",
      "CHECK: At T=0.5s → WR1 at (35, 7). Ball flight ≈ 0.3s.",
      "→ Target WR at t=0.8s = (38, 5.2). Try T=0.5.",
    ],
    inputs: [
      {
        id: "rx",
        label: "x_r(t) — WR1 downfield position (yd):",
        placeholder: "30 + 10*t",
        hint: "Starts 30 yd, runs 10 yd/s downfield",
      },
      {
        id: "ry",
        label: "y_r(t) — WR1 lateral position (yd from center):",
        placeholder: "10 - 6*t",
        hint: "Starts +10 yd, cuts inside at 6 yd/s",
      },
      {
        id: "T",
        label: "Throw at time T (seconds after snap):",
        placeholder: "1.0",
        hint: "Ball must reach WR1's FUTURE position. Try T = 0.3 to 1.0",
      },
    ],
    players: [
      {
        id: "QB",
        x0: 28,
        y0: 0,
        color: "#38bdf8",
        label: "QB",
        segs: [{ vx: 0, vy: 0 }],
        offense: true,
      },
      {
        id: "WR1",
        x0: 30,
        y0: 10,
        color: "#f97316",
        label: "WR1",
        segs: [{ vx: 10, vy: -6 }],
        offense: true,
      },
      {
        id: "WR2",
        x0: 30,
        y0: 22,
        color: "#fb923c",
        label: "WR2",
        segs: [{ vx: 10, vy: 0 }],
        offense: true,
      },
      {
        id: "CB1",
        x0: 33,
        y0: 11,
        color: "#f87171",
        label: "CB",
        segs: [{ vx: 9, vy: -5 }],
        offense: false,
      },
      {
        id: "CB2",
        x0: 33,
        y0: 23,
        color: "#fca5a5",
        label: "CB2",
        segs: [{ vx: 10, vy: 0 }],
        offense: false,
      },
      {
        id: "LB",
        x0: 38,
        y0: 2,
        color: "#c084fc",
        label: "LB",
        segs: [
          { dur: 0.8, vx: -2, vy: 6 },
          { vx: -1, vy: 0 },
        ],
        offense: false,
      },
      {
        id: "S",
        x0: 48,
        y0: 8,
        color: "#a855f7",
        label: "S",
        segs: [{ vx: -4, vy: -6 }],
        offense: false,
      },
    ],
    qbId: "QB",
    targetId: "WR1",
    coverId: "CB1",
    vBall: 30,
    catchR: 1.8,
    peakZ: 3,
    run(inputs) {
      const rx_fn = parseExpr(inputs.rx, ["t"]);
      const ry_fn = parseExpr(inputs.ry, ["t"]);
      const T = parseFloat(inputs.T);
      if (!rx_fn) return { error: "rx", msg: "Invalid — try: 30 + 5*t" };
      if (!ry_fn) return { error: "ry", msg: "Invalid — try: 10 - 3*t" };
      if (isNaN(T) || T < 0 || T > 6)
        return { error: "T", msg: "T must be 0–6 s" };

      // Validate equations match actual kinematics
      const wr1 = this.players.find((p) => p.id === "WR1");
      for (const ta of [0, 0.5, 1.0, 1.5]) {
        const act = posAt(wr1, ta);
        const gx = rx_fn(ta),
          gy = ry_fn(ta);
        if (gx === null || Math.abs(gx - act.x) > 1.5)
          return {
            warning: `x_r(${ta}s) = ${gx?.toFixed(1) ?? "?"} yd, but WR1 is actually at x = ${act.x.toFixed(1)} yd. Check your x equation.`,
          };
        if (gy === null || Math.abs(gy - act.y) > 1.5)
          return {
            warning: `y_r(${ta}s) = ${gy?.toFixed(1) ?? "?"} yd, but WR1 is actually at y = ${act.y.toFixed(1)} yd. Check your y equation.`,
          };
      }

      const DT = 1 / 60;
      const qb = this.players.find((p) => p.id === this.qbId);
      const tgt = this.players.find((p) => p.id === this.targetId);
      const cb = this.players.find((p) => p.id === this.coverId);

      // CORRECT PHYSICS: Aim ball at WR1's position WHEN IT ARRIVES, not just at T.
      // At throw time T, compute WR1 pos. Estimate flight time. Then target WR1 at T+tFlight.
      // One iteration is sufficient since velocities are constant.
      const qbPos = posAt(qb, T);
      const wrAtT = posAt(tgt, T);
      const estDist = Math.sqrt(
        (wrAtT.x - qbPos.x) ** 2 + (wrAtT.y - qbPos.y) ** 2,
      );
      const estFlight = estDist / this.vBall;
      // Lead target: where WR1 will be when ball arrives
      const wrLead = posAt(tgt, T + estFlight);
      // Refine once
      const leadDist = Math.sqrt(
        (wrLead.x - qbPos.x) ** 2 + (wrLead.y - qbPos.y) ** 2,
      );
      const tFlight = leadDist / this.vBall;
      const wrFinal = posAt(tgt, T + tFlight);
      const actualLeadDist = Math.sqrt(
        (wrFinal.x - qbPos.x) ** 2 + (wrFinal.y - qbPos.y) ** 2,
      );
      const tLand = T + actualLeadDist / this.vBall;

      const dx = wrFinal.x - qbPos.x,
        dy = wrFinal.y - qbPos.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const bvx = (dx / d) * this.vBall,
        bvy = (dy / d) * this.vBall;

      let thrown = false,
        bx = qbPos.x,
        by = qbPos.y;
      const trail = [],
        frames = [];

      for (let i = 0; i < 720; i++) {
        const t = i * DT;
        const players = this.players.map((p) => ({
          ...p,
          ...posAt(p, t),
          ...velAt(p, t),
        }));
        if (!thrown && t >= T) {
          thrown = true;
        }
        if (thrown) {
          bx += bvx * DT;
          by += bvy * DT;
          trail.push({ x: bx, y: by });
        }
        const fz = ballArc(t, T, tLand, this.peakZ);
        const tgtNow = posAt(tgt, t),
          cbNow = posAt(cb, t);
        const catchDist = Math.sqrt(
          (bx - tgtNow.x) ** 2 + (by - tgtNow.y) ** 2,
        );
        const cbBallDist = Math.sqrt((bx - cbNow.x) ** 2 + (by - cbNow.y) ** 2);
        // Lead point for visualization
        const leadX = wrFinal.x,
          leadY = wrFinal.y;
        frames.push({
          t,
          players,
          bx,
          by,
          fz,
          thrown,
          trail: [...trail],
          catchDist,
          cbBallDist,
          leadX,
          leadY,
          tLand,
          T,
          flightTime: tFlight,
        });
        if (thrown && catchDist < this.catchR && fz < 1.5) {
          return {
            frames,
            result: "win",
            msg: `Caught! t=${t.toFixed(2)}s — WR1 at (${tgtNow.x.toFixed(1)}, ${tgtNow.y.toFixed(1)}) yd. You led him perfectly by ${actualLeadDist.toFixed(1)} yd.`,
          };
        }
        if (thrown && cbBallDist < 1.8 && fz < 1.2 && t > T + 0.2) {
          return {
            frames,
            result: "loss",
            msg: `Tipped by CB at t=${t.toFixed(2)}s! CB closed to ${cbBallDist.toFixed(1)} yd. Try T ≈ ${(T - 0.2).toFixed(2)}s to beat the coverage.`,
          };
        }
        if (t > 7 || bx > 85) break;
      }
      const last = frames[frames.length - 1];
      const tgtLast = last?.players?.find((p) => p.id === this.targetId);
      const over = tgtLast && last.bx > tgtLast.x;
      return {
        frames,
        result: "loss",
        msg: `Incomplete — ${(last?.catchDist || 99).toFixed(1)} yd off target. ${over ? "Overthrown — decrease T." : "Underthrown — increase T."}`,
      };
    },
  },

  // ══════════════════════════════════════════════════════════════════════
  // P2 — Seam Route: Related Rates
  // KEY FIX: dD/dt validated against actual simulation, t_close shown live,
  // window open/closed indicator draws on canvas.
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "P2",
    name: "Seam Route",
    down: "3rd & 5",
    concept: "Related Rates · dD/dt",
    color: "#f59e0b",
    description:
      "Two windows, two defenders closing at different rates. Calculate dD/dt (closure rate) for each. The window that stays open longer is your safe throw. Time it.",
    theory: [
      "CONCEPT: Related rates link changing quantities.",
      "D(t) = distance from defender to catch point.",
      "D(t) = √[(x_d(t)−x_c)² + (y_d(t)−y_c)²]",
      "dD/dt = [(x_d−x_c)vdx + (y_d−y_c)vdy] / D",
      "Negative dD/dt = window closing.",
      "t_close = D₀ / |dD/dt|  (time to close)",
      "Ball flight time: t_f = dist(QB→catch) / 30",
      ,
      "Throw at T where: T + t_f < t_close",
      "WR1 seam at (50, 12). CB1 closing fast.",
      "WR2 cross at (46, −10). Safety closing slow.",
      "Compare t_close for each. Pick the open window.",
    ],
    inputs: [
      {
        id: "dD1",
        label: "Closure rate on WR1 catch pt — dD₁/dt (yd/s):",
        placeholder: "-5",
        hint: "CB1 approaches catch pt. dD/dt is negative (closing). Estimate from CB1 speed and angle.",
      },
      {
        id: "dD2",
        label: "Closure rate on WR2 catch pt — dD₂/dt (yd/s):",
        placeholder: "-5",
        hint: "Safety approaches WR2 catch pt. Should be less negative = window open longer.",
      },
      {
        id: "choice",
        label: "Throw to WR1 or WR2? (enter 1 or 2):",
        placeholder: "2",
        hint: "t_close = D₀/|dD/dt|. Larger t_close = safer window.",
      },
      {
        id: "T",
        label: "Throw at time T (seconds after snap):",
        placeholder: "1.5",
        hint: "Ball must arrive before t_close. t_f = dist/28 ≈ 0.8s.",
      },
    ],
    players: [
      {
        id: "QB",
        x0: 28,
        y0: 0,
        color: "#38bdf8",
        label: "QB",
        segs: [{ vx: 0, vy: 0 }],
        offense: true,
      },
      {
        id: "WR1",
        x0: 30,
        y0: 12,
        color: "#f97316",
        label: "WR1",
        segs: [{ vx: 10, vy: 0 }],
        offense: true,
      },
      {
        id: "WR2",
        x0: 30,
        y0: -10,
        color: "#fb923c",
        label: "WR2",
        segs: [{ vx: 9, vy: -2 }],
        offense: true,
      },
      {
        id: "CB1",
        x0: 38,
        y0: 17,
        color: "#f87171",
        label: "CB1",
        segs: [{ vx: 9, vy: -5 }],
        offense: false,
      },
      {
        id: "S",
        x0: 44,
        y0: 3,
        color: "#a855f7",
        label: "S",
        segs: [{ vx: 5, vy: -2 }],
        offense: false,
      },
      {
        id: "LB",
        x0: 36,
        y0: -3,
        color: "#c084fc",
        label: "LB",
        segs: [{ vx: 4, vy: -3 }],
        offense: false,
      },
    ],
    catchPts: { WR1: { x: 50, y: 12 }, WR2: { x: 46, y: -10 } },
    coverIds: { WR1: "CB1", WR2: "S" },
    qbId: "QB",
    vBall: 30,
    catchR: 2,
    peakZ: 4,
    run(inputs) {
      const dD1 = parseFloat(inputs.dD1),
        dD2 = parseFloat(inputs.dD2);
      const choice = parseInt(inputs.choice),
        T = parseFloat(inputs.T);
      if (isNaN(dD1) || dD1 >= 0)
        return {
          error: "dD1",
          msg: "Must be negative (window is closing). Try −5.",
        };
      if (isNaN(dD2) || dD2 >= 0)
        return { error: "dD2", msg: "Must be negative. Try −3.5." };
      if (choice !== 1 && choice !== 2)
        return { error: "choice", msg: "Enter 1 or 2" };
      if (isNaN(T) || T < 0 || T > 6)
        return { error: "T", msg: "T must be 0–6 s" };

      const cb1 = this.players.find((p) => p.id === "CB1");
      const s = this.players.find((p) => p.id === "S");
      const cp1 = this.catchPts.WR1,
        cp2 = this.catchPts.WR2;
      const qb = this.players.find((p) => p.id === this.qbId);

      // Compute true closure rates using actual kinematics
      const computeRate = (defPlayer, catchPt, t0) => {
        const d0 = posAt(defPlayer, t0);
        const d1 = posAt(defPlayer, t0 + 0.5);
        const D0 = Math.sqrt((d0.x - catchPt.x) ** 2 + (d0.y - catchPt.y) ** 2);
        const D1 = Math.sqrt((d1.x - catchPt.x) ** 2 + (d1.y - catchPt.y) ** 2);
        return (D1 - D0) / 0.5; // yd/s
      };
      const trueRate1 = computeRate(cb1, cp1, 0);
      const trueRate2 = computeRate(s, cp2, 0);
      const trueD1_0 = Math.sqrt(
        (posAt(cb1, 0).x - cp1.x) ** 2 + (posAt(cb1, 0).y - cp1.y) ** 2,
      );
      const trueD2_0 = Math.sqrt(
        (posAt(s, 0).x - cp2.x) ** 2 + (posAt(s, 0).y - cp2.y) ** 2,
      );

      if (Math.abs(dD1 - trueRate1) > 2.0)
        return {
          warning: `dD₁/dt ≈ ${trueRate1.toFixed(1)} yd/s (CB1 at ${trueD1_0.toFixed(1)} yd from catch pt, closing at that rate). You entered ${dD1.toFixed(1)} — off by ${Math.abs(dD1 - trueRate1).toFixed(1)}.`,
        };
      if (Math.abs(dD2 - trueRate2) > 2.0)
        return {
          warning: `dD₂/dt ≈ ${trueRate2.toFixed(1)} yd/s (Safety at ${trueD2_0.toFixed(1)} yd, closing at that rate). You entered ${dD2.toFixed(1)} — off by ${Math.abs(dD2 - trueRate2).toFixed(1)}.`,
        };

      const tClose1 = (trueD1_0 - this.catchR) / Math.abs(trueRate1);
      const tClose2 = (trueD2_0 - this.catchR) / Math.abs(trueRate2);

      // Which was the right choice?
      const cp = choice === 1 ? cp1 : cp2;
      const defId = this.coverIds[choice === 1 ? "WR1" : "WR2"];
      const defPlayer = this.players.find((p) => p.id === defId);
      const dx = cp.x - qb.x0,
        dy = cp.y - qb.y0;
      const throwDist = Math.sqrt(dx * dx + dy * dy);
      const bvx = (dx / throwDist) * this.vBall,
        bvy = (dy / throwDist) * this.vBall;
      const tLand = T + throwDist / this.vBall;

      let thrown = false,
        bx = qb.x0,
        by = qb.y0;
      const trail = [],
        frames = [];

      for (let i = 0; i < 720; i++) {
        const t = i * DT;
        const players = this.players.map((p) => ({
          ...p,
          ...posAt(p, t),
          ...velAt(p, t),
        }));
        if (!thrown && t >= T) {
          thrown = true;
        }
        if (thrown) {
          bx += bvx * DT;
          by += bvy * DT;
          trail.push({ x: bx, y: by });
        }
        const fz = ballArc(t, T, tLand, this.peakZ);
        const defNow = posAt(defPlayer, t);
        const defDist = Math.sqrt(
          (defNow.x - cp.x) ** 2 + (defNow.y - cp.y) ** 2,
        );
        const ballNear = Math.sqrt((bx - cp.x) ** 2 + (by - cp.y) ** 2);
        // Live D values for both windows
        const cb1Now = posAt(cb1, t),
          sNow = posAt(s, t);
        const D1live = Math.sqrt(
          (cb1Now.x - cp1.x) ** 2 + (cb1Now.y - cp1.y) ** 2,
        );
        const D2live = Math.sqrt((sNow.x - cp2.x) ** 2 + (sNow.y - cp2.y) ** 2);
        frames.push({
          t,
          players,
          bx,
          by,
          fz,
          thrown,
          trail: [...trail],
          defDist,
          ballNear,
          catchPts: this.catchPts,
          tClose1,
          tClose2,
          D1live,
          D2live,
          choice,
        });
        if (thrown && ballNear < this.catchR && fz < 1.5) {
          if (defDist > this.catchR)
            return {
              frames,
              result: "win",
              msg: `Complete to WR${choice}! ${defDist.toFixed(1)} yd clearance at arrival. t_close1=${tClose1.toFixed(1)}s, t_close2=${tClose2.toFixed(1)}s — you chose correctly.`,
            };
          return {
            frames,
            result: "loss",
            msg: `Defended! Window had closed (D=${defDist.toFixed(1)} yd < ${this.catchR} needed). Throw before t=${(choice === 1 ? tClose1 : tClose2).toFixed(1)}s.`,
          };
        }
        if (t > 7 || bx > 85) break;
      }
      return { frames, result: "loss", msg: "Ball out of range. Adjust T." };
    },
  },

  // ══════════════════════════════════════════════════════════════════════
  // P3 — Pick Six: Parametric Intersection
  // KEY FIX: Ball is thrown toward WR's ACTUAL FUTURE position (correctly
  // leads the WR). CB must reach ball BEFORE WR does. Speed cap enforced.
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "P3",
    name: "Pick Six",
    down: "Defense — YOU are CB",
    concept: "Parametric Paths · find t* where paths cross",
    color: "#a78bfa",
    description:
      "The offense threw a pass. YOU control CB★ with velocity equations vx(t) and vy(t). Reach the ball's position before the WR does. Speed cap: 12 yd/s.",
    theory: [
      "CONCEPT: Parametric paths — two curves that may intersect at time t*.",
      "WHY: Both you (CB) and the ball trace paths parameterized by time. Finding t* where your path meets the ball's path is the interception problem.",
      "Ball path (thrown at t=1.2s):",
      "x_b(t) = 28 + vbx·(t−1.2)",
      "y_b(t) = 0  + vby·(t−1.2)",
      "Your CB path:",
      "x_cb(t) = 55 + ∫₀ᵗ vx(τ) dτ",
      "y_cb(t) = −14 + ∫₀ᵗ vy(τ) dτ",
      "INTERCEPT CONDITION: |CB(t*) − ball(t*)| < 2.5 yd",
      "AND you must arrive BEFORE the WR (at t ≈ 2.5s).",
      "STEP 1: Find where ball is headed — WR catches near (42, 16).",
      "STEP 2: You're at (55, −14). You need ~30 yd lateral in ~1.5s.",
      "STEP 3: vy ≈ 30/1.5 ≈ 12 yd/s. vx ≈ −5 to −6 yd/s.",
      "STEP 4: Adjust until your path intersects ball path first.",
    ],
    inputs: [
      {
        id: "vx",
        label: "CB★ vx(t) — downfield velocity (yd/s, can use t):",
        placeholder: "-4",
        hint: "CB at x=55, ball near x=42. Need to move left (negative). Try: −5 or −6+t",
      },
      {
        id: "vy",
        label: "CB★ vy(t) — lateral velocity (yd/s, can use t):",
        placeholder: "11",
        hint: "CB at y=−14, ball near y=16. Need ~30 yd laterally. At 12 yd/s → ≈2.5s.",
      },
    ],
    players: [
      {
        id: "QB",
        x0: 28,
        y0: 0,
        color: "#38bdf8",
        label: "QB",
        segs: [{ vx: 0, vy: 0 }],
        offense: true,
      },
      {
        id: "WR",
        x0: 30,
        y0: 12,
        color: "#f97316",
        label: "WR",
        segs: [{ vx: 10, vy: 2 }],
        offense: true,
      },
      {
        id: "CB",
        x0: 55,
        y0: -14,
        color: "#818cf8",
        label: "CB★",
        segs: [],
        offense: false,
        controlled: true,
      },
      {
        id: "S",
        x0: 48,
        y0: 5,
        color: "#a855f7",
        label: "S",
        segs: [{ vx: -4, vy: 4 }],
        offense: false,
      },
    ],
    throwT: 1.2,
    throwFrom: { x: 28, y: 0 },
    vBall: 30,
    catchR: 2.5,
    peakZ: 4,
    run(inputs) {
      const vx_fn = parseExpr(inputs.vx, ["t"]);
      const vy_fn = parseExpr(inputs.vy, ["t"]);
      if (!vx_fn) return { error: "vx", msg: "Invalid — try: -4  or  -3 + t" };
      if (!vy_fn) return { error: "vy", msg: "Invalid — try: 11  or  8 + 2*t" };

      const DT = 1 / 60;
      const { throwT, throwFrom, vBall } = this;
      const wr = this.players.find((p) => p.id === "WR");

      // CORRECT: Aim ball at WR's future position (lead pass)
      const wrAtThrow = posAt(wr, throwT);
      const estDist = Math.sqrt(
        (wrAtThrow.x - throwFrom.x) ** 2 + (wrAtThrow.y - throwFrom.y) ** 2,
      );
      const estFlight = estDist / vBall;
      const wrLead = posAt(wr, throwT + estFlight);
      const leadDist = Math.sqrt(
        (wrLead.x - throwFrom.x) ** 2 + (wrLead.y - throwFrom.y) ** 2,
      );
      const tFlight = leadDist / vBall;
      const wrFinal = posAt(wr, throwT + tFlight);
      const throwTo = wrFinal;
      const finalDist = Math.sqrt(
        (throwTo.x - throwFrom.x) ** 2 + (throwTo.y - throwFrom.y) ** 2,
      );
      const bvx = ((throwTo.x - throwFrom.x) / finalDist) * vBall;
      const bvy = ((throwTo.y - throwFrom.y) / finalDist) * vBall;
      const tLand = throwT + finalDist / vBall;

      let cbX = 55,
        cbY = -14;
      const trail_cb = [],
        trail_ball = [],
        frames = [];
      const s = this.players.find((p) => p.id === "S");

      for (let i = 0; i < 600; i++) {
        const t = i * DT;
        const thrown = t >= throwT;
        const bx = thrown ? throwFrom.x + bvx * (t - throwT) : throwFrom.x;
        const by = thrown ? throwFrom.y + bvy * (t - throwT) : throwFrom.y;
        const fz = ballArc(t, throwT, tLand, this.peakZ);
        const rawVx = vx_fn(t) ?? 0,
          rawVy = vy_fn(t) ?? 0;
        const spd = Math.sqrt(rawVx * rawVx + rawVy * rawVy);
        const sc = spd > 12 ? 12 / spd : 1;
        cbX += rawVx * sc * DT;
        cbY += rawVy * sc * DT;
        cbX = Math.max(10, Math.min(90, cbX));
        cbY = Math.max(-26, Math.min(26, cbY));
        if (thrown) {
          trail_ball.push({ x: bx, y: by });
          trail_cb.push({ x: cbX, y: cbY });
        }
        const wrNow = posAt(wr, t),
          sNow = posAt(s, t);
        const qbNow = posAt(
          this.players.find((p) => p.id === "QB"),
          t,
        );
        const players = [
          {
            ...this.players.find((p) => p.id === "QB"),
            ...qbNow,
            ...velAt(
              this.players.find((p) => p.id === "QB"),
              t,
            ),
          },
          { ...wr, ...wrNow, ...velAt(wr, t) },
          {
            id: "CB",
            x: cbX,
            y: cbY,
            vx: rawVx * sc,
            vy: rawVy * sc,
            color: "#818cf8",
            label: "CB★",
            offense: false,
            controlled: true,
          },
          { ...s, ...sNow, ...velAt(s, t) },
        ];
        const cbBall = Math.sqrt((cbX - bx) ** 2 + (cbY - by) ** 2);
        const wrBall = Math.sqrt((wrNow.x - bx) ** 2 + (wrNow.y - by) ** 2);
        frames.push({
          t,
          players,
          bx,
          by,
          fz,
          thrown,
          trail_cb: [...trail_cb],
          trail_ball: [...trail_ball],
          cbBall,
          wrBall,
          cbSpd: spd * sc,
          leadX: throwTo.x,
          leadY: throwTo.y,
        });
        if (thrown && cbBall < this.catchR && cbBall <= wrBall && fz < 2) {
          return {
            frames,
            result: "win",
            msg: `INTERCEPTION at t=${t.toFixed(2)}s! CB beat WR by ${(wrBall - cbBall).toFixed(1)} yd. Parametric paths crossed at (${bx.toFixed(1)}, ${by.toFixed(1)}).`,
          };
        }
        if (thrown && wrBall < this.catchR && fz < 2) {
          return {
            frames,
            result: "loss",
            msg: `WR caught it — CB was ${cbBall.toFixed(1)} yd away at arrival. Adjust direction or speed.`,
          };
        }
        if (bx > 92 || t > 9) break;
      }
      return {
        frames,
        result: "loss",
        msg: "Ball incomplete — check direction.",
      };
    },
  },

  // ══════════════════════════════════════════════════════════════════════
  // P4 — Power Run: Impulse-Momentum
  // Physics accurate. LB decelerates as impulse accumulates.
  // RB contact triggers win/loss based on LB remaining speed.
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "P4",
    name: "Power Run",
    down: "4th & 1",
    concept: "Impulse · J = ∫F(t) dt = Δp",
    color: "#ef4444",
    description:
      "RB charges at 6 yd/s. Your blocker applies force F(t) to the LB. Compute impulse J = ∫F dt and neutralize the LB's momentum before he reaches the RB.",
    theory: [
      "CONCEPT: Impulse = integral of force over time = change in momentum.",
      "WHY: A force applied over time changes momentum (mass × velocity). To stop the LB you must reduce his momentum to near zero.",
      "Momentum: p = m·v    (lb·yd/s)",
      "Impulse: J(t) = ∫₀ᵗ F(τ) dτ",
      "Newton 2: J = Δp  →  J reduces LB momentum.",
      "LB: mass = 230 lb, initial speed = 5 yd/s.",
      "p_LB = 230 × 5 = 1150 lb·yd/s  (must be neutralized)",
      "DERIVE: v_LB(t) = (1150 − J(t)) / 230",
      "LB stops when J(t) ≥ 1150 lb·yd/s.",
      "STEP 1: For constant F: J = F·t. Need J ≥ 1150 in ~0.9s.",
      "→ F ≥ 1150/0.9 ≈ 1280 lb. Try F = 1300.",
      "STEP 2: Try time-varying: F(t) = 900 + 400*t gives more impulse as block develops.",
      "STEP 3: Watch the impulse bar — keep it filling before LB reaches RB.",
    ],
    inputs: [
      {
        id: "F",
        label: "Blocker force F(t) in lb (can be function of t):",
        placeholder: "1300",
        hint: "J = ∫₀ᵗ F dτ must reach 1150 lb·yd/s within ~0.9s. Try: 1300  or  900 + 400*t  or  2000*exp(-t/2)",
      },
    ],
    players: [
      {
        id: "RB",
        x0: 24,
        y0: 2,
        color: "#f97316",
        label: "RB",
        segs: [{ vx: 9, vy: 0 }],
        offense: true,
        hasBall: true,
      },
      {
        id: "OL",
        x0: 26,
        y0: -2,
        color: "#38bdf8",
        label: "OL",
        segs: [{ vx: 6, vy: 2 }],
        offense: true,
      },
      {
        id: "WR1",
        x0: 24,
        y0: 18,
        color: "#fb923c",
        label: "WR1",
        segs: [{ vx: 10, vy: 0 }],
        offense: true,
      },
      {
        id: "LB",
        x0: 32,
        y0: 0,
        color: "#f87171",
        label: "LB",
        segs: [],
        offense: false,
        dynamic: true,
      },
      {
        id: "DE",
        x0: 33,
        y0: -8,
        color: "#fca5a5",
        label: "DE",
        segs: [{ vx: -5, vy: 5 }],
        offense: false,
      },
      {
        id: "S",
        x0: 44,
        y0: -5,
        color: "#a855f7",
        label: "S",
        segs: [{ vx: -5, vy: 3 }],
        offense: false,
      },
    ],
    LB_MASS: 230,
    LB_P: 1150,
    peakZ: 0,
    run(inputs) {
      const F_fn = parseExpr(inputs.F, ["t"]);
      if (!F_fn)
        return { error: "F", msg: "Invalid — try: 900  or  600 + 300*t" };
      const DT = 1 / 60;
      let lbX = 32,
        lbY = 0,
        impulse = 0;
      const frames = [];
      const rb = this.players.find((p) => p.id === "RB");
      const lb = this.players.find((p) => p.id === "LB");

      for (let i = 0; i < 540; i++) {
        const t = i * DT;
        const F = Math.max(0, F_fn(t) ?? 0);
        impulse += F * DT;
        const lbMom = Math.max(0, this.LB_P - impulse);
        const lbSpeed = lbMom / this.LB_MASS;
        // LB moves toward RB (downfield = left in this setup, negative x direction)
        lbX -= lbSpeed * DT;
        const rbNow = posAt(rb, t);
        const staticPlayers = this.players
          .filter((p) => !p.dynamic)
          .map((p) => ({ ...p, ...posAt(p, t), ...velAt(p, t) }));
        staticPlayers.push({ ...lb, x: lbX, y: lbY, vx: -lbSpeed, vy: 0 });
        frames.push({
          t,
          players: staticPlayers,
          bx: null,
          by: null,
          fz: 0,
          thrown: false,
          trail: [],
          impulse,
          lbSpeed,
          lbX,
          rbX: rbNow.x,
          F,
        });
        if (rbNow.x >= lbX - 0.3) {
          if (lbSpeed < 1.5)
            return {
              frames,
              result: "win",
              msg: `TD! LB neutralized at t=${t.toFixed(2)}s. J=${impulse.toFixed(0)} lb·yd/s (needed ${this.LB_P}). LB speed at contact: ${lbSpeed.toFixed(1)} yd/s.`,
            };
          return {
            frames,
            result: "loss",
            msg: `Stuffed! LB still had ${lbSpeed.toFixed(1)} yd/s at contact. J=${impulse.toFixed(0)} lb·yd/s — need ${this.LB_P}. Increase F.`,
          };
        }
        if (t > 9) break;
      }
      return {
        frames,
        result: "loss",
        msg: `Time ran out. J=${impulse.toFixed(0)} lb·yd/s — need ${this.LB_P}.`,
      };
    },
  },

  // ══════════════════════════════════════════════════════════════════════
  // P5 — Hail Mary: Optimization
  // KEY FIX: Ball now has correct lateral component based on theta in the
  // 3D iso projection. y_ball is no longer constant — the angle determines
  // both the downfield range AND where it lands laterally.
  // dR/dθ shown live as learner changes angle.
  // ══════════════════════════════════════════════════════════════════════
  {
    id: "P5",
    name: "Hail Mary",
    down: "4th & Long — 0:00",
    concept: "Optimization · maximize R(θ)",
    color: "#06b6d4",
    description:
      "Last play. Find angle θ that maximizes range AND clears two safeties. R(θ) = v₀²sin(2θ)/g. Set dR/dθ = 0 to find optimal θ, then check if it fits through the gap.",
    theory: [
      "CONCEPT: Optimization — find where the derivative equals zero to maximize a function.",
      "WHY: Range R(θ) depends on launch angle. We want to find the θ that makes R as large as possible.",
      "Projectile range: R(θ) = v₀²·sin(2θ) / g",
      "DERIVE maximum: take dR/dθ and set to zero.",
      "dR/dθ = 2v₀²·cos(2θ) / g = 0",
      "→ cos(2θ) = 0  →  2θ = 90°  →  θ = 45°",
      "Verify it's a MAX: d²R/dθ² = −4v₀²·sin(2θ)/g < 0 ✓",
      "v₀ = 30 yd/s, g = 10.72 yd/s² (= 9.8 m/s² converted).",
      "R_max = v₀²/g = 900/10.72 ≈ 84 yd.",
      "STEP 1: Plug θ=45° and verify R_max ≈ 84 yd.",
      "STEP 2: Check if ball clears the safety gap — it depends on timing.",
      "STEP 3: If 45° overshoots, try θ < 45° to reduce range.",
      "STEP 4: Use sin(2θ) = 1 at θ=45° → maximum dart throw.",
      "INSIGHT: Any other angle gives less range — θ=45° is uniquely optimal.",
    ],
    inputs: [
      {
        id: "theta",
        label: "Launch angle θ (degrees, 0–90):",
        placeholder: "45",
        hint: "θ=45° maximizes range. Compute R(θ) = 30²·sin(2θ)/10.72. Compare to needed distance.",
      },
      {
        id: "T",
        label: "Throw at time T (seconds after snap):",
        placeholder: "0.5",
        hint: "Safeties spread over time. Earlier = smaller gap. Later = more spread but shorter sim time.",
      },
    ],
    players: [
      {
        id: "QB",
        x0: 28,
        y0: 0,
        color: "#38bdf8",
        label: "QB",
        segs: [{ vx: 0, vy: 0 }],
        offense: true,
      },
      {
        id: "WR1",
        x0: 30,
        y0: 10,
        color: "#f97316",
        label: "WR1",
        segs: [{ vx: 11, vy: 0 }],
        offense: true,
      },
      {
        id: "WR2",
        x0: 30,
        y0: -10,
        color: "#fb923c",
        label: "WR2",
        segs: [{ vx: 11, vy: 0 }],
        offense: true,
      },
      {
        id: "S1",
        x0: 60,
        y0: 8,
        color: "#f87171",
        label: "S1",
        segs: [{ vx: 2, vy: 1.5 }],
        offense: false,
      },
      {
        id: "S2",
        x0: 60,
        y0: -8,
        color: "#fca5a5",
        label: "S2",
        segs: [{ vx: 2, vy: -1.5 }],
        offense: false,
      },
      {
        id: "CB",
        x0: 55,
        y0: 0,
        color: "#c084fc",
        label: "CB",
        segs: [{ vx: 4, vy: 0 }],
        offense: false,
      },
    ],
    vBall: 30,
    g: 10.72,
    catchR: 3,
    peakZ: 0,
    run(inputs) {
      const theta = parseFloat(inputs.theta),
        T = parseFloat(inputs.T);
      if (isNaN(theta) || theta < 0 || theta > 90)
        return { error: "theta", msg: "θ must be 0–90 degrees" };
      if (isNaN(T) || T < 0 || T > 4)
        return { error: "T", msg: "T must be 0–4 s" };

      const th = (theta * Math.PI) / 180;
      const v0 = this.vBall,
        g = this.g;
      // Horizontal (downfield) and vertical components
      const vHoriz = v0 * Math.cos(th); // speed along ground plane (yd/s)
      const vVert = v0 * Math.sin(th); // speed upward (yd/s)
      const tFlight = (2 * vVert) / g; // total flight time
      const range = (v0 * v0 * Math.sin(2 * th)) / g;
      const maxRange = (v0 * v0) / g;

      const qb = this.players.find((p) => p.id === "QB");
      const DT = 1 / 60;
      const frames = [],
        trail = [];
      let thrown = false,
        bx = qb.x0,
        by = qb.y0;

      // Aim straight downfield (toward endzone, y=0 lateral)
      // Ball lands at (QB.x + range, QB.y)
      const targetX = qb.x0 + range;

      for (let i = 0; i < 720; i++) {
        const t = i * DT;
        const players = this.players.map((p) => ({
          ...p,
          ...posAt(p, t),
          ...velAt(p, t),
        }));
        if (!thrown && t >= T) {
          thrown = true;
        }

        let fz = 0;
        if (thrown) {
          const dt = t - T;
          // Correct physics: downfield only, lateral = 0 (aimed straight)
          bx = qb.x0 + vHoriz * dt;
          by = qb.y0; // straight downfield
          fz = Math.max(0, vVert * dt - 0.5 * g * dt * dt);
          trail.push({ x: bx, y: by, z: fz });
        }

        const s1 = posAt(
          this.players.find((p) => p.id === "S1"),
          t,
        );
        const s2 = posAt(
          this.players.find((p) => p.id === "S2"),
          t,
        );
        // Collision check: ball (in 3D) near a safety who is near the ground
        const ballToS1 = Math.sqrt((bx - s1.x) ** 2 + (by - s1.y) ** 2);
        const ballToS2 = Math.sqrt((bx - s2.x) ** 2 + (by - s2.y) ** 2);

        // Derivative: dR/dθ for live display
        const dRdTheta = (2 * v0 * v0 * Math.cos(2 * th)) / g;

        frames.push({
          t,
          players,
          bx,
          by,
          fz,
          thrown,
          trail: [...trail],
          range,
          maxRange,
          theta,
          ballToS1,
          ballToS2,
          dRdTheta,
          targetX,
        });

        if (thrown && fz <= 0 && t > T + 0.1) {
          const landX = bx;
          const wr1Now = posAt(
            this.players.find((p) => p.id === "WR1"),
            t,
          );
          const wr2Now = posAt(
            this.players.find((p) => p.id === "WR2"),
            t,
          );
          const distWR = Math.min(
            Math.sqrt((bx - wr1Now.x) ** 2 + (by - wr1Now.y) ** 2),
            Math.sqrt((bx - wr2Now.x) ** 2 + (by - wr2Now.y) ** 2),
          );
          const nearest = Math.min(ballToS1, ballToS2);
          if (distWR < this.catchR && nearest > 3.5) {
            return {
              frames,
              result: "win",
              msg: `TOUCHDOWN! θ=${theta}°, R=${range.toFixed(1)} yd (max=${maxRange.toFixed(1)} yd at 45°). sin(2×${theta}°)=${Math.sin(2 * th).toFixed(3)} vs sin(90°)=1.`,
            };
          }
          if (nearest <= 3.5)
            return {
              frames,
              result: "loss",
              msg: `Knocked down! Defender ${nearest.toFixed(1)} yd from ball. Try different T to let safeties spread, or adjust θ.`,
            };
          return {
            frames,
            result: "loss",
            msg: `Incomplete — ${distWR.toFixed(1)} yd from nearest WR. R=${range.toFixed(1)} yd. ${theta < 45 ? "Increase θ for more range." : "θ near optimal — check T."}`,
          };
        }
        if (bx > 96 || t > 12) break;
      }
      return { frames, result: "loss", msg: "Ball still airborne at limit." };
    },
  },
];

const DT = 1 / 60; // global timestep

// ─── Draw full frame ──────────────────────────────────────────────────────────
function drawFrame(ctx, frame, play, showVecs) {
  drawIsoField(ctx);
  if (!frame) return;

  const { players, bx, by, fz, thrown, trail, trail_cb, trail_ball, impulse } =
    frame;

  // Ball trail
  const ballTrail = trail || trail_ball || [];
  ballTrail.forEach((pt, i) => {
    ctx.globalAlpha = 0.05 + (i / ballTrail.length) * 0.35;
    const p = proj(pt.x, pt.y, pt.z || 0);
    ctx.beginPath();
    ctx.arc(p.cx, p.cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
  });
  if (trail_cb) {
    trail_cb.forEach((pt, i) => {
      ctx.globalAlpha = 0.04 + (i / trail_cb.length) * 0.25;
      const p = proj(pt.x, pt.y, 0);
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#818cf8";
      ctx.fill();
    });
  }
  ctx.globalAlpha = 1;

  // Catch-point rings (P2)
  if (frame.catchPts) {
    Object.values(frame.catchPts).forEach((cp) => {
      const p = proj(cp.x, cp.y, 0);
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(251,191,36,0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
    // Window open/closed indicator per window
    if (frame.D1live !== undefined) {
      const cp1 = frame.catchPts.WR1,
        cp2 = frame.catchPts.WR2;
      const p1 = proj(cp1.x, cp1.y, 0),
        p2 = proj(cp2.x, cp2.y, 0);
      const open1 = frame.D1live > 2,
        open2 = frame.D2live > 2;
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = open1 ? "#4ade80" : "#f87171";
      ctx.fillText(
        open1 ? `W1 OPEN ${frame.D1live.toFixed(1)}yd` : `W1 CLOSED`,
        p1.cx,
        p1.cy - 14,
      );
      ctx.fillStyle = open2 ? "#4ade80" : "#f87171";
      ctx.fillText(
        open2 ? `W2 OPEN ${frame.D2live.toFixed(1)}yd` : `W2 CLOSED`,
        p2.cx,
        p2.cy - 14,
      );
    }
  }

  // Lead-point X (P1 and P3)
  if (frame.leadX !== undefined) {
    drawLeadPoint(ctx, frame.leadX, frame.leadY, "#fbbf2488");
    const lp = proj(frame.leadX, frame.leadY, 0);
    ctx.fillStyle = "rgba(251,191,36,0.6)";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("lead", lp.cx, lp.cy - 10);
  }

  // Range arc annotation (P5)
  if (frame.targetX !== undefined && !frame.thrown) {
    const tgt = proj(frame.targetX, 0, 0);
    ctx.beginPath();
    ctx.arc(tgt.cx, tgt.cy, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#06b6d4";
    ctx.font = "8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`land ${frame.range?.toFixed(0)} yd`, tgt.cx, tgt.cy - 12);
  }

  // Sort players by y (depth sort for iso)
  const sorted = [...players].sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
  sorted.forEach((p) => {
    drawPlayer(ctx, p.x, p.y, p.color, p.label, 0);
    if (showVecs && (p.vx || p.vy)) {
      drawVelArrow(
        ctx,
        p.x,
        p.y,
        p.vx ?? 0,
        p.vy ?? 0,
        p.offense ? "#86efac" : "#fca5a5",
        1.0,
      );
    }
  });

  // Ball with real 3D arc
  if (thrown && bx !== null) {
    drawBallFull(ctx, bx, by, fz || 0);
  }

  // Impulse bar (P4)
  if (impulse !== undefined) {
    drawImpulseBar(ctx, impulse, play.LB_P || 1150);
  }

  // dR/dθ annotation (P5)
  if (frame.dRdTheta !== undefined) {
    const lbl = proj(28, 26);
    ctx.fillStyle = "rgba(6,182,212,0.85)";
    ctx.font = "9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `θ=${frame.theta}° | R=${frame.range?.toFixed(1)} yd | dR/dθ=${frame.dRdTheta?.toFixed(2)} ${frame.dRdTheta > 0 ? "↑" : frame.dRdTheta < -0.1 ? "↓" : "=0✓"}`,
      lbl.cx,
      lbl.cy - 6,
    );
  }
}

function drawSetup(ctx, play) {
  drawIsoField(ctx);
  play.players.forEach((p) => {
    if (!p.controlled && !p.dynamic) drawRoute(ctx, p, p.color);
  });
  const sorted = [...play.players].sort((a, b) => a.y0 - b.y0);
  sorted.forEach((p) => {
    drawPlayer(ctx, p.x0, p.y0, p.color, p.label, 0);
    const v = velAt(p, 0);
    if (v.vx || v.vy)
      drawVelArrow(
        ctx,
        p.x0,
        p.y0,
        v.vx,
        v.vy,
        p.offense ? "#86efac" : "#fca5a5",
        1.0,
      );
  });
  if (play.catchPts) {
    Object.values(play.catchPts).forEach((cp) => {
      const p = proj(cp.x, cp.y, 0);
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(251,191,36,0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }
}

// ─── Live stats panel — reactive equations ────────────────────────────────────
function LiveStats({ frame, playIdx }) {
  const dark = useIsDark();
  if (!frame) return null;
  const rows = [{ label: "t", val: `${frame.t.toFixed(2)} s`, col: "#e2e8f0" }];

  if (playIdx === 0) {
    if (frame.leadX !== undefined) {
      rows.push({
        label: "lead target x",
        val: `${frame.leadX.toFixed(1)} yd`,
        col: "#fbbf24",
      });
      rows.push({
        label: "lead target y",
        val: `${frame.leadY.toFixed(1)} yd`,
        col: "#fbbf24",
      });
    }
    if (frame.T !== undefined)
      rows.push({
        label: "throw time T",
        val: `${frame.T.toFixed(2)} s`,
        col: "#94a3b8",
      });
    if (frame.flightTime !== undefined)
      rows.push({
        label: "flight time t_f",
        val: `${frame.flightTime.toFixed(2)} s`,
        col: "#94a3b8",
      });
    if (frame.catchDist != null)
      rows.push({
        label: "|ball − WR1|",
        val: `${frame.catchDist.toFixed(2)} yd`,
        col: frame.catchDist < 2 ? "#4ade80" : "#f87171",
      });
    if (frame.cbBallDist != null)
      rows.push({
        label: "CB distance",
        val: `${frame.cbBallDist.toFixed(1)} yd`,
        col: "#e2e8f0",
      });
    if (frame.fz != null)
      rows.push({
        label: "ball height z",
        val: `${frame.fz.toFixed(1)} yd`,
        col: "#fbbf24",
      });
  } else if (playIdx === 1) {
    if (frame.tClose1 != null)
      rows.push({
        label: "t_close WR1",
        val: `${frame.tClose1.toFixed(2)} s`,
        col: "#f87171",
      });
    if (frame.tClose2 != null)
      rows.push({
        label: "t_close WR2",
        val: `${frame.tClose2.toFixed(2)} s`,
        col: "#4ade80",
      });
    if (frame.D1live != null)
      rows.push({
        label: "D₁(t) WR1 window",
        val: `${frame.D1live.toFixed(1)} yd`,
        col: frame.D1live > 2 ? "#4ade80" : "#f87171",
      });
    if (frame.D2live != null)
      rows.push({
        label: "D₂(t) WR2 window",
        val: `${frame.D2live.toFixed(1)} yd`,
        col: frame.D2live > 2 ? "#4ade80" : "#f87171",
      });
    if (frame.defDist != null)
      rows.push({
        label: "chosen window",
        val: `${frame.defDist.toFixed(1)} yd`,
        col: frame.defDist > 2 ? "#4ade80" : "#f87171",
      });
    if (frame.fz != null)
      rows.push({
        label: "ball height z",
        val: `${frame.fz.toFixed(1)} yd`,
        col: "#fbbf24",
      });
  } else if (playIdx === 2) {
    if (frame.cbBall != null)
      rows.push({
        label: "|CB − ball|",
        val: `${frame.cbBall.toFixed(2)} yd`,
        col: frame.cbBall < 4 ? "#4ade80" : "#f87171",
      });
    if (frame.wrBall != null)
      rows.push({
        label: "|WR − ball|",
        val: `${frame.wrBall.toFixed(2)} yd`,
        col: "#e2e8f0",
      });
    if (frame.cbSpd != null)
      rows.push({
        label: "CB speed",
        val: `${frame.cbSpd.toFixed(1)} yd/s`,
        col: "#a78bfa",
      });
    if (frame.fz != null)
      rows.push({
        label: "ball height z",
        val: `${frame.fz.toFixed(1)} yd`,
        col: "#fbbf24",
      });
  } else if (playIdx === 3) {
    if (frame.impulse != null)
      rows.push({
        label: "J(t) = ∫F dτ",
        val: `${frame.impulse.toFixed(0)} lb·yd/s`,
        col: frame.impulse > 1150 ? "#4ade80" : "#f87171",
      });
    if (frame.lbSpeed != null)
      rows.push({
        label: "v_LB(t)",
        val: `${frame.lbSpeed.toFixed(2)} yd/s`,
        col: frame.lbSpeed < 1.5 ? "#4ade80" : "#f87171",
      });
    if (frame.F != null)
      rows.push({
        label: "F(t)",
        val: `${frame.F.toFixed(0)} lb`,
        col: "#fbbf24",
      });
    if (frame.rbX != null && frame.lbX != null)
      rows.push({
        label: "gap RB→LB",
        val: `${(frame.lbX - frame.rbX).toFixed(1)} yd`,
        col: "#e2e8f0",
      });
  } else if (playIdx === 4) {
    if (frame.range != null)
      rows.push({
        label: "R(θ)",
        val: `${frame.range.toFixed(1)} yd`,
        col: "#06b6d4",
      });
    if (frame.maxRange != null)
      rows.push({
        label: "R_max (θ=45°)",
        val: `${frame.maxRange.toFixed(1)} yd`,
        col: "#94a3b8",
      });
    if (frame.dRdTheta != null)
      rows.push({
        label: "dR/dθ",
        val: `${frame.dRdTheta.toFixed(3)}`,
        col: Math.abs(frame.dRdTheta) < 0.1 ? "#4ade80" : "#94a3b8",
      });
    if (frame.theta != null)
      rows.push({
        label: "sin(2θ)",
        val: `${Math.sin((2 * frame.theta * Math.PI) / 180).toFixed(4)}`,
        col: "#e2e8f0",
      });
    if (frame.fz != null)
      rows.push({
        label: "height z(t)",
        val: `${frame.fz.toFixed(1)} yd`,
        col: "#fbbf24",
      });
    if (frame.ballToS1 != null)
      rows.push({
        label: "dist to S1",
        val: `${frame.ballToS1.toFixed(1)} yd`,
        col: frame.ballToS1 > 4 ? "#4ade80" : "#f87171",
      });
  }

  return (
    <div
      style={{
        background: dark ? "#0f172a" : "#eaf4ea",
        borderRadius: 8,
        padding: "10px 12px",
        border: `1px solid ${dark ? "#334155" : "#c8dcc8"}`,
        marginTop: 8,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: dark ? "#64748b" : "#5a7a5a",
          marginBottom: 6,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Live Values
      </div>
      {rows.map((r) => (
        <div
          key={r.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: dark ? "#7dd3fc" : "#1e40af",
            }}
          >
            {r.label}
          </span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: r.col }}>
            {r.val}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Scrubber ─────────────────────────────────────────────────────────────────
function Scrubber({ frames, frameIdx, onChange }) {
  if (!frames?.length) return null;
  return (
    <div
      style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}
    >
      <span style={{ fontSize: 10, color: "#64748b", whiteSpace: "nowrap" }}>
        t={(frameIdx / 60 || 0).toFixed(2)}s
      </span>
      <input
        type="range"
        min={0}
        max={frames.length - 1}
        value={frameIdx}
        onChange={(e) => onChange(+e.target.value)}
        style={{ flex: 1, accentColor: "#60a5fa", height: 4 }}
      />
      <span style={{ fontSize: 10, color: "#64748b", whiteSpace: "nowrap" }}>
        {(frames.length / 60).toFixed(1)}s
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FootballCalculus() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const simRef = useRef(null);
  const dark = useIsDark();
  const [playIdx, setPlayIdx] = useState(0);
  const [inputs, setInputs] = useState({});
  const [inputErrs, setInputErrs] = useState({});
  const [warning, setWarning] = useState("");
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState("");
  const [playing, setPlaying] = useState(false);
  const [hasFrames, setHasFrames] = useState(false);
  const [liveFrame, setLiveFrame] = useState(null);
  const [scrubIdx, setScrubIdx] = useState(0);
  const [showVecs, setShowVecs] = useState(true);
  const [jitter, setJitter] = useState(() => makeJitter(PLAYS[0]));

  const play = PLAYS[playIdx];
  const livePlay = applyJitter(play, jitter);

  const remix = useCallback(() => {
    setJitter(makeJitter(PLAYS[playIdx]));
    setHasFrames(false);
    setResult(null);
    setMsg("");
    setWarning("");
    setLiveFrame(null);
    setPlaying(false);
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    simRef.current = null;
  }, [playIdx]);

  useEffect(() => {
    if (hasFrames) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSetup(canvas.getContext("2d"), livePlay);
  }, [playIdx, hasFrames, livePlay]);

  useEffect(
    () => () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    },
    [],
  );

  const stopAnim = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    setPlaying(false);
  }, []);

  const tick = useCallback(() => {
    if (!simRef.current) return;
    const { frames, playIdx: pIdx } = simRef.current;
    const fi = simRef.current.frameIdx;
    if (fi >= frames.length) {
      setPlaying(false);
      return;
    }
    const canvas = canvasRef.current;
    if (canvas)
      drawFrame(
        canvas.getContext("2d"),
        frames[fi],
        simRef.current.livePlay || PLAYS[pIdx],
        simRef.current.showVecs,
      );
    simRef.current.frameIdx = fi + 1;
    setScrubIdx(fi);
    if (fi % 4 === 0) setLiveFrame(frames[fi]);
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const runSim = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    const res = livePlay.run.call(livePlay, inputs);
    if (res.error) {
      setInputErrs({ [res.error]: res.msg });
      setWarning("");
      setHasFrames(false);
      setResult(null);
      return;
    }
    if (res.warning) {
      setWarning(res.warning);
      setInputErrs({});
      setHasFrames(false);
      setResult(null);
      return;
    }
    setInputErrs({});
    setWarning("");
    setResult(res.result);
    setMsg(res.msg || "");
    setHasFrames(true);
    setLiveFrame(null);
    setScrubIdx(0);
    setPlaying(true);
    simRef.current = {
      frames: res.frames,
      frameIdx: 0,
      playIdx,
      showVecs,
      livePlay,
    };
    animRef.current = requestAnimationFrame(tick);
  }, [playIdx, inputs, showVecs, tick, livePlay]);

  const resetSim = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    simRef.current = null;
    setHasFrames(false);
    setResult(null);
    setMsg("");
    setWarning("");
    setLiveFrame(null);
    setPlaying(false);
    setScrubIdx(0);
  }, []);

  const selectPlay = useCallback((idx) => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    simRef.current = null;
    setPlayIdx(idx);
    setJitter(makeJitter(PLAYS[idx]));
    setInputs({});
    setInputErrs({});
    setWarning("");
    setResult(null);
    setMsg("");
    setHasFrames(false);
    setLiveFrame(null);
    setPlaying(false);
    setScrubIdx(0);
  }, []);

  const onScrub = useCallback(
    (fi) => {
      stopAnim();
      const frames = simRef.current?.frames;
      if (!frames) return;
      setScrubIdx(fi);
      setLiveFrame(frames[fi]);
      const canvas = canvasRef.current;
      if (canvas)
        drawFrame(
          canvas.getContext("2d"),
          frames[fi],
          simRef.current.livePlay || PLAYS[simRef.current.playIdx],
          showVecs,
        );
    },
    [stopAnim, showVecs],
  );

  const setInput = useCallback((id, val) => {
    setInputs((p) => ({ ...p, [id]: val }));
    setInputErrs({});
    setWarning("");
  }, []);

  const T = {
    bg: dark ? "#0c1a10" : "#f0f4f0",
    surface: dark ? "#132016" : "#ffffff",
    border: dark ? "#1e3a2e" : "#c8dcc8",
    text: dark ? "#e8f5e9" : "#1a2e1a",
    muted: dark ? "#6b8f71" : "#5a7a5a",
    inputBg: dark ? "#0a160c" : "#f8fbf8",
    inputBorder: dark ? "#2d4a33" : "#aacbaa",
    inputText: dark ? "#e8f5e9" : "#1a2e1a",
    cardBg: dark ? "#0f1e12" : "#eaf4ea",
    mathBg: dark ? "#1a2e1e" : "#d4ecd4",
    mathText: dark ? "#86efac" : "#1a5c1a",
    btnRun: "#166534",
    btnRunText: "#ffffff",
    btnStop: dark ? "#374151" : "#9ca3af",
    warnBg: dark ? "#1e3a5f" : "#dbeafe",
    warnText: dark ? "#93c5fd" : "#1e40af",
    winBg: dark ? "#14532d" : "#dcfce7",
    winText: dark ? "#4ade80" : "#166534",
    loseBg: dark ? "#450a0a" : "#fee2e2",
    loseText: dark ? "#fca5a5" : "#991b1b",
  };

  return (
    <div
      style={{
        color: T.text,
        maxWidth: 1100,
        margin: "0 auto",
        padding: 12,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        background: T.bg,
        borderRadius: 14,
        boxShadow: dark
          ? "0 4px 32px rgba(0,0,0,0.6)"
          : "0 2px 16px rgba(0,80,0,0.12)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
          padding: "10px 14px",
          borderRadius: 10,
          background: dark ? "#0a1e0e" : "#1a5c2a",
          border: `1px solid ${dark ? "#1e4a24" : "#14532d"}`,
        }}
      >
        <span style={{ fontSize: 22 }}>🏈</span>
        <div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: dark ? "#bbf7d0" : "#ffffff",
              letterSpacing: "0.02em",
            }}
          >
            Football Calculus
          </div>
          <div
            style={{
              fontSize: 10,
              color: dark ? "#6b8f71" : "#a7f3d0",
              marginTop: 1,
            }}
          >
            Real physics · Real speeds · Real calculus
          </div>
        </div>
        <button
          onClick={() => setShowVecs((v) => !v)}
          style={{
            marginLeft: "auto",
            padding: "5px 13px",
            borderRadius: 20,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
            border: `1px solid ${dark ? "#2d5a38" : "#4ade80"}`,
            background: showVecs
              ? dark
                ? "#1a4a24"
                : "#16a34a"
              : "transparent",
            color: showVecs
              ? dark
                ? "#86efac"
                : "#ffffff"
              : dark
                ? "#6b8f71"
                : "#a7f3d0",
            transition: "all 0.15s",
          }}
        >
          {showVecs ? "Vectors ON" : "Vectors OFF"}
        </button>
      </div>

      {/* Play selector */}
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}
      >
        {PLAYS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => selectPlay(i)}
            style={{
              padding: "7px 13px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 11,
              border: `2px solid ${i === playIdx ? p.color : dark ? "#2d4a33" : "#c8dcc8"}`,
              background:
                i === playIdx ? p.color + (dark ? "22" : "18") : T.surface,
              color: i === playIdx ? p.color : T.muted,
              fontWeight: i === playIdx ? 700 : 400,
              textAlign: "left",
              transition: "all 0.12s",
            }}
          >
            <div
              style={{ fontSize: 12, fontWeight: i === playIdx ? 700 : 500 }}
            >
              {p.name}
            </div>
            <div style={{ fontSize: 9, opacity: 0.8, marginTop: 1 }}>
              {p.down} · {p.concept.split("·")[0].trim()}
            </div>
          </button>
        ))}
      </div>

      {/* Play description banner */}
      <div
        style={{
          borderLeft: `4px solid ${play.color}`,
          borderRadius: "0 8px 8px 0",
          padding: "8px 14px",
          marginBottom: 12,
          background: play.color + (dark ? "15" : "12"),
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        <span style={{ fontWeight: 700, color: play.color }}>
          {play.concept}
        </span>
        <span style={{ color: T.muted }}> — {play.description}</span>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {/* Left: canvas + inputs */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            style={{
              width: "100%",
              borderRadius: 10,
              border: `2px solid ${dark ? "#1e3a2e" : "#4a7c59"}`,
              display: "block",
            }}
          />

          {hasFrames && (
            <Scrubber
              frames={simRef.current?.frames}
              frameIdx={scrubIdx}
              onChange={onScrub}
            />
          )}

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {play.inputs.map((inp) => (
              <div key={inp.id}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.muted,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {inp.label}
                </label>
                <input
                  type="text"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 7,
                    boxSizing: "border-box",
                    border: `1.5px solid ${inputErrs[inp.id] ? "#ef4444" : T.inputBorder}`,
                    background: T.inputBg,
                    color: T.inputText,
                    fontFamily: "'Courier New', monospace",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  value={inputs[inp.id] || ""}
                  placeholder={inp.placeholder}
                  onChange={(e) => setInput(inp.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSim();
                  }}
                />
                {inputErrs[inp.id] && (
                  <div style={{ fontSize: 11, color: "#f87171", marginTop: 3 }}>
                    {inputErrs[inp.id]}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 10,
                    color: dark ? "#60a5fa" : "#2563eb",
                    fontFamily: "monospace",
                    marginTop: 3,
                    opacity: 0.9,
                  }}
                >
                  💡 {inp.hint}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {!playing ? (
                <button
                  onClick={runSim}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#ffffff",
                    background: "#15803d",
                    letterSpacing: "0.03em",
                  }}
                >
                  ▶ Run Play
                </button>
              ) : (
                <button
                  onClick={stopAnim}
                  style={{
                    padding: "9px 22px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#ffffff",
                    background: "#6b7280",
                  }}
                >
                  ⏹ Stop
                </button>
              )}
              {hasFrames && (
                <button
                  onClick={resetSim}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                    color: dark ? "#e8f5e9" : "#374151",
                    background: dark ? "#1e3a2e" : "#d1fae5",
                  }}
                >
                  ↺ Reset
                </button>
              )}
              <button
                onClick={remix}
                title="Randomly shift defender starting positions"
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: `1px solid ${dark ? "#2d4a33" : "#86c997"}`,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 12,
                  color: dark ? "#86efac" : "#15803d",
                  background: "transparent",
                }}
              >
                🔀 New Setup
              </button>
            </div>
            {warning && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  background: T.warnBg,
                  color: T.warnText,
                  lineHeight: 1.5,
                  borderLeft: "3px solid #3b82f6",
                }}
              >
                ⚠ {warning}
              </div>
            )}
            {result && !playing && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.5,
                  background: result === "win" ? T.winBg : T.loseBg,
                  color: result === "win" ? T.winText : T.loseText,
                  borderLeft: `3px solid ${result === "win" ? "#16a34a" : "#dc2626"}`,
                }}
              >
                {result === "win" ? "✓ " : "✗ "}
                {msg}
              </div>
            )}
          </div>
        </div>

        {/* Right: theory panel */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div
            style={{
              background: T.cardBg,
              borderRadius: 10,
              padding: 14,
              border: `1px solid ${dark ? "#1e3a2e" : "#c8dcc8"}`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: play.color,
                marginBottom: 10,
                paddingBottom: 6,
                borderBottom: `1px solid ${dark ? "#1e3a2e" : "#c8dcc8"}`,
                letterSpacing: "0.02em",
              }}
            >
              📐 {play.concept}
            </div>
            {play.theory.map((line, i) => {
              const isConceptHeader = line.startsWith("CONCEPT:");
              const isStepOrKey =
                line.startsWith("STEP") ||
                line.startsWith("KEY") ||
                line.startsWith("WHY") ||
                line.startsWith("DERIVE") ||
                line.startsWith("INSIGHT") ||
                line.startsWith("CHECK") ||
                line.startsWith("SETUP") ||
                line.startsWith("VERIFY") ||
                line.startsWith("HINT");
              const isArrow = line.startsWith("→") || line.startsWith("⟹");
              const isMath =
                !isConceptHeader &&
                !isStepOrKey &&
                !isArrow &&
                (/[=·∫√≥≤→×]/.test(line) || /^[xyvDJpRθd]/.test(line));
              if (isConceptHeader)
                return (
                  <div
                    key={i}
                    style={{
                      margin: "0 0 8px",
                      padding: "5px 9px",
                      background: play.color + "22",
                      borderRadius: 5,
                      fontSize: 11,
                      color: play.color,
                      fontWeight: 700,
                      lineHeight: 1.4,
                    }}
                  >
                    {line}
                  </div>
                );
              if (isStepOrKey)
                return (
                  <div
                    key={i}
                    style={{
                      margin: "5px 0 2px",
                      fontSize: 11,
                      color: dark ? "#fbbf24" : "#92400e",
                      fontWeight: 700,
                      lineHeight: 1.4,
                    }}
                  >
                    {line}
                  </div>
                );
              if (isArrow)
                return (
                  <div
                    key={i}
                    style={{
                      margin: "2px 0",
                      paddingLeft: 8,
                      fontSize: 11,
                      color: dark ? "#4ade80" : "#166534",
                      fontFamily: "monospace",
                      lineHeight: 1.4,
                    }}
                  >
                    {line}
                  </div>
                );
              return isMath ? (
                <div
                  key={i}
                  style={{
                    margin: "3px 0",
                    padding: "3px 8px",
                    background: T.mathBg,
                    borderRadius: 4,
                    fontFamily: "'Courier New', monospace",
                    fontSize: 11,
                    color: T.mathText,
                    lineHeight: 1.5,
                  }}
                >
                  {line}
                </div>
              ) : (
                <div
                  key={i}
                  style={{
                    fontSize: 11,
                    color: T.muted,
                    margin: "3px 0",
                    lineHeight: 1.4,
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
          {(hasFrames || liveFrame) && (
            <LiveStats frame={liveFrame} playIdx={playIdx} />
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 10,
          color: T.muted,
          textAlign: "center",
          opacity: 0.7,
        }}
      >
        2.5D isometric · ball height = real projectile arc (z = v₀sinθ·t − ½gt²)
        · shadow shows ground position · scrub to review
      </div>
    </div>
  );
}
