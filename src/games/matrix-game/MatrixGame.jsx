import { useState, useEffect, useRef, useCallback } from "react";

// ─── Canvas constants ────────────────────────────────────────────────────
const CW = 480,
  CH = 480;
const CELL = 42;
const OX = CW / 2,
  OY = CH / 2;

function cx(mx) {
  return OX + mx * CELL;
}
function cy(my) {
  return OY - my * CELL;
}
function cpt([x, y]) {
  return [cx(x), cy(y)];
}

function applyMat([a, b, c, d], [x, y]) {
  return [a * x + b * y, c * x + d * y];
}
function det([a, b, c, d]) {
  return a * d - b * c;
}
function vmag([x, y]) {
  return Math.sqrt(x * x + y * y);
}
function vnorm(v) {
  const m = vmag(v);
  return m < 1e-9 ? [0, 0] : [v[0] / m, v[1] / m];
}
function vdot([ax, ay], [bx, by]) {
  return ax * bx + ay * by;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpV([ax, ay], [bx, by], t) {
  return [lerp(ax, bx, t), lerp(ay, by, t)];
}
function degToRad(d) {
  return (d * Math.PI) / 180;
}
function fmt(n, d = 2) {
  return Number(n).toFixed(d);
}
function fmtSigned(n) {
  return (n >= 0 ? "+" : "") + fmt(n);
}

// ─── Drawing helpers ──────────────────────────────────────────────────────
function drawGrid(ctx) {
  for (let i = -5; i <= 5; i++) {
    const bold = i === 0;
    ctx.strokeStyle = bold ? "rgba(60,110,200,0.55)" : "rgba(30,60,110,0.28)";
    ctx.lineWidth = bold ? 1.4 : 0.5;
    ctx.beginPath();
    ctx.moveTo(cx(i), cy(-5));
    ctx.lineTo(cx(i), cy(5));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx(-5), cy(i));
    ctx.lineTo(cx(5), cy(i));
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(70,120,200,0.45)";
  ctx.font = "9px monospace";
  ctx.textAlign = "center";
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue;
    ctx.fillText(i, cx(i), cy(0) + 12);
    ctx.textAlign = "right";
    ctx.fillText(i, cx(0) - 5, cy(i) + 3);
    ctx.textAlign = "center";
  }
}

function arrow(
  ctx,
  from,
  to,
  color,
  lw = 2.5,
  hs = 11,
  alpha = 1,
  dashed = false,
) {
  const [fx, fy] = cpt(from),
    [tx, ty] = cpt(to);
  const dx = tx - fx,
    dy = ty - fy,
    d = Math.sqrt(dx * dx + dy * dy);
  if (d < 2) return;
  const ux = dx / d,
    uy = dy / d;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  if (dashed) ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.lineTo(tx - ux * hs * 0.7, ty - uy * hs * 0.7);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - ux * hs - uy * hs * 0.45, ty - uy * hs + ux * hs * 0.45);
  ctx.lineTo(tx - ux * hs + uy * hs * 0.45, ty - uy * hs - ux * hs * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function dot(ctx, pt, color, r = 7, glow = true) {
  const [px, py] = cpt(pt);
  ctx.save();
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function canvasLabel(ctx, text, pt, color, ox = 10, oy = 0, size = 11) {
  const [px, py] = cpt(pt);
  ctx.save();
  ctx.font = `${size}px monospace`;
  const w = ctx.measureText(text).width;
  ctx.fillStyle = "rgba(2,6,16,0.88)";
  ctx.beginPath();
  ctx.roundRect(px + ox - 3, py + oy - size + 1, w + 7, size + 6, 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.fillText(text, px + ox, py + oy);
  ctx.restore();
}

function poly(ctx, pts, fill, stroke, lw = 2) {
  if (pts.length < 2) return;
  const cp = pts.map((p) => cpt(p));
  ctx.beginPath();
  ctx.moveTo(cp[0][0], cp[0][1]);
  for (let i = 1; i < cp.length; i++) ctx.lineTo(cp[i][0], cp[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function drawTransformedGrid(
  ctx,
  M,
  color = "rgba(120,80,220,0.22)",
  lw = 0.7,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  for (let i = -5; i <= 5; i++) {
    const [fx, fy] = cpt(applyMat(M, [i, -5]));
    const [tx, ty] = cpt(applyMat(M, [i, 5]));
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    const [fx2, fy2] = cpt(applyMat(M, [-5, i]));
    const [tx2, ty2] = cpt(applyMat(M, [5, i]));
    ctx.beginPath();
    ctx.moveTo(fx2, fy2);
    ctx.lineTo(tx2, ty2);
    ctx.stroke();
  }
}

// ─── Equation box renderer ────────────────────────────────────────────────
// Renders a live equation like M × v = result with colored parts
function EqBox({ parts }) {
  // parts: array of { text, color, size, mono }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "2px",
        padding: "10px 14px",
        background: "rgba(2,8,22,0.9)",
        border: "1px solid rgba(40,80,160,0.4)",
        borderRadius: "6px",
        lineHeight: 1,
      }}
    >
      {parts.map((p, i) => (
        <span
          key={i}
          style={{
            color: p.color || "#c8daf0",
            fontSize: p.size || 14,
            fontFamily: "Courier New, monospace",
            fontWeight: p.bold ? "bold" : "normal",
            letterSpacing: p.loose ? "1px" : "normal",
          }}
        >
          {p.text}
        </span>
      ))}
    </div>
  );
}

function MatrixDisplay({
  m,
  color = "#b06aff",
  label = "M",
  highlight = null,
}) {
  const [a, b, c, d] = m;
  // highlight: 0=a,1=b,2=c,3=d
  const cell = (val, idx) => (
    <span
      style={{
        color: highlight === idx ? "#fff" : color,
        background: highlight === idx ? color + "33" : "transparent",
        padding: "0 2px",
        borderRadius: 2,
        fontFamily: "Courier New, monospace",
        fontSize: 14,
      }}
    >
      {fmt(val)}
    </span>
  );
  return (
    <span style={{ fontFamily: "Courier New, monospace", fontSize: 14 }}>
      <span style={{ color: "#3a6a9a" }}>{label} = </span>
      <span style={{ color: "#3a6a9a" }}>⎡</span>
      {cell(a, 0)}
      <span style={{ color: "#3a6a9a" }}> </span>
      {cell(b, 1)}
      <span style={{ color: "#3a6a9a" }}>⎤</span>
      <span style={{ color: "#3a6a9a" }}> ⎣</span>
      {cell(c, 2)}
      <span style={{ color: "#3a6a9a" }}> </span>
      {cell(d, 3)}
      <span style={{ color: "#3a6a9a" }}>⎦</span>
    </span>
  );
}

// ─── Lesson data ───────────────────────────────────────────────────────────
// Each lesson: concept, watch animation, explore, prove (never hides canvas)

const LESSONS = [
  // ══ WORLD 1: VECTORS ══════════════════════════════════════════════════
  {
    id: 0,
    world: "VECTORS",
    worldColor: "#4ac8ff",
    title: "What is a Vector?",
    concept:
      "A vector is just two numbers — [x, y] — that describe a position or direction in space. That's all.",

    watchCaption:
      "Watch [3, 2] being drawn. x moves right, y moves up. The arrow from the origin IS the vector.",
    watchDuration: 4000,
    watch(ctx, t) {
      drawGrid(ctx);
      const target = [3, 2];
      const p = lerpV([0, 0], target, Math.min(t * 1.6, 1));
      // x leg
      if (t > 0.1) {
        const xa = Math.min((t - 0.1) * 4, 1);
        arrow(ctx, [0, 0], [p[0], 0], "#f0b43c", 2, 7, xa, true);
        if (xa > 0.8)
          canvasLabel(
            ctx,
            `x = ${fmt(p[0], 1)}`,
            [p[0] / 2, 0],
            "#f0b43c",
            -14,
            16,
          );
      }
      // y leg
      if (t > 0.45) {
        const ya = Math.min((t - 0.45) * 4, 1);
        arrow(ctx, [p[0], 0], [p[0], p[1]], "#4aff9a", 2, 7, ya, true);
        if (ya > 0.8)
          canvasLabel(
            ctx,
            `y = ${fmt(p[1], 1)}`,
            [p[0], p[1] / 2],
            "#4aff9a",
            8,
            0,
          );
      }
      // main arrow
      arrow(ctx, [0, 0], p, "#fff", 2.8, 11, Math.min(t * 2, 1));
      dot(ctx, p, "#4ac8ff", 7);
      if (t > 0.85) canvasLabel(ctx, `[3, 2]`, target, "#4ac8ff", 10, -13, 13);
    },

    exploreCaption:
      "Drag x and y. The arrow updates instantly. Notice: negative x goes LEFT, negative y goes DOWN.",
    exploreControls: [
      {
        key: "x",
        label: "x",
        min: -4,
        max: 4,
        step: 0.5,
        init: 2,
        color: "#f0b43c",
      },
      {
        key: "y",
        label: "y",
        min: -4,
        max: 4,
        step: 0.5,
        init: 1.5,
        color: "#4aff9a",
      },
    ],
    explore(ctx, { x = 2, y = 1.5 }) {
      drawGrid(ctx);
      arrow(ctx, [0, 0], [x, 0], "#f0b43c", 1.8, 7, 0.7, true);
      arrow(ctx, [x, 0], [x, y], "#4aff9a", 1.8, 7, 0.7, true);
      arrow(ctx, [0, 0], [x, y], "#fff", 3, 12);
      dot(ctx, [x, y], "#4ac8ff", 8);
      canvasLabel(ctx, `x = ${fmt(x, 1)}`, [x / 2, 0], "#f0b43c", -14, 16);
      canvasLabel(ctx, `y = ${fmt(y, 1)}`, [x, y / 2], "#4aff9a", 8, 0);
      canvasLabel(
        ctx,
        `[${fmt(x, 1)}, ${fmt(y, 1)}]`,
        [x, y],
        "#4ac8ff",
        10,
        -13,
        13,
      );
      canvasLabel(
        ctx,
        `length = ${fmt(vmag([x, y]), 2)}`,
        [0, -4.2],
        "#666",
        5,
        0,
        10,
      );
    },
    exploreEquation({ x = 2, y = 1.5 }) {
      return [
        { text: "v = [" },
        { text: fmt(x, 1), color: "#f0b43c", bold: true },
        { text: ", " },
        { text: fmt(y, 1), color: "#4aff9a", bold: true },
        { text: "]" },
        { text: "   length = √(" },
        { text: fmt(x, 1), color: "#f0b43c" },
        { text: "² + " },
        { text: fmt(y, 1), color: "#4aff9a" },
        { text: "²) = " },
        { text: fmt(vmag([x, y]), 2), color: "#fff", bold: true },
      ];
    },

    proveCaption:
      "Set x = 3 and y = −2. The target ✦ shows you exactly where to aim.",
    proveTarget: [3, -2],
    proveControls: [
      {
        key: "x",
        label: "x",
        min: -4,
        max: 4,
        step: 0.5,
        init: 0,
        color: "#f0b43c",
      },
      {
        key: "y",
        label: "y",
        min: -4,
        max: 4,
        step: 0.5,
        init: 0,
        color: "#4aff9a",
      },
    ],
    prove(ctx, { x = 0, y = 0 }, solved) {
      drawGrid(ctx);
      // Target
      const [tx, ty] = cpt([3, -2]);
      ctx.save();
      ctx.shadowColor = "#4aff9a";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#4aff9a";
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✦", tx, ty);
      ctx.restore();
      canvasLabel(ctx, "target [3, −2]", [3, -2], "#4aff9a", 10, -14);
      // x/y components always visible
      if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
        arrow(ctx, [0, 0], [x, 0], "#f0b43c", 1.8, 7, 0.7, true);
        canvasLabel(ctx, `x=${fmt(x, 1)}`, [x / 2, 0], "#f0b43c", -8, 16);
        arrow(ctx, [x, 0], [x, y], "#4aff9a", 1.8, 7, 0.7, true);
        canvasLabel(ctx, `y=${fmt(y, 1)}`, [x, y / 2], "#4aff9a", 8, 0);
      }
      arrow(ctx, [0, 0], [x, y], "#fff", 3, 12);
      dot(ctx, [x, y], solved ? "#4aff9a" : "#4ac8ff", 8);
      canvasLabel(
        ctx,
        `[${fmt(x, 1)}, ${fmt(y, 1)}]`,
        [x, y],
        solved ? "#4aff9a" : "#4ac8ff",
        10,
        14,
        12,
      );
      if (solved) {
        canvasLabel(ctx, "✓ correct!", [x, y], "#4aff9a", 10, -16, 12);
      }
    },
    proveEquation({ x = 0, y = 0 }, solved) {
      const dx = Math.abs(x - 3),
        dy = Math.abs(y - -2);
      return [
        { text: "your vector: [" },
        { text: fmt(x, 1), color: "#f0b43c", bold: true },
        { text: ", " },
        { text: fmt(y, 1), color: "#4aff9a", bold: true },
        { text: "]" },
        { text: "   target: [3, −2]" },
        {
          text: solved
            ? "  ✓ match!"
            : `  off by [${fmt(dx, 1)}, ${fmt(dy, 1)}]`,
          color: solved ? "#4aff9a" : "#ff7a4a",
        },
      ];
    },
    proveCheck({ x = 0, y = 0 }) {
      return Math.abs(x - 3) < 0.3 && Math.abs(y + 2) < 0.3;
    },
    solvedExplanation:
      "You set x=3, y=−2. The x number moves the point right/left, y moves it up/down. That's what a vector IS — two numbers describing a location in 2D space.",
  },

  // ══ WORLD 1: VECTOR ADDITION ══════════════════════════════════════════
  {
    id: 1,
    world: "VECTORS",
    worldColor: "#4ac8ff",
    title: "Adding Vectors",
    concept:
      "Adding two vectors [a,b]+[c,d] = [a+c, b+d]. Visually: place them tip-to-tail and the result is where you end up.",

    watchCaption: "A + B tip-to-tail. The dashed arrow is the sum.",
    watchDuration: 4500,
    watch(ctx, t) {
      drawGrid(ctx);
      const A = [3, 1],
        B = [-1, 2],
        S = [2, 3];
      const ta = Math.min(t * 2.2, 1);
      const tb = Math.max(Math.min((t - 0.45) * 2.5, 1), 0);
      const ts = Math.max(Math.min((t - 0.75) * 4, 1), 0);
      arrow(ctx, [0, 0], lerpV([0, 0], A, ta), "#f0b43c", 3, 11, ta);
      if (ta > 0.9) canvasLabel(ctx, "A=[3,1]", A, "#f0b43c", 8, -13);
      if (t > 0.45) {
        arrow(ctx, A, lerpV(A, S, tb), "#4aff9a", 3, 11, tb);
        if (tb > 0.9) canvasLabel(ctx, "B=[−1,2]", S, "#4aff9a", 8, 12);
      }
      if (t > 0.75) {
        arrow(
          ctx,
          [0, 0],
          lerpV([0, 0], S, ts),
          "#fff",
          1.8,
          9,
          ts * 0.7,
          true,
        );
        if (ts > 0.9) {
          dot(ctx, S, "#4ac8ff", 7);
          canvasLabel(ctx, "A+B=[2,3]", S, "#4ac8ff", 10, -14, 12);
        }
      }
    },

    exploreCaption:
      "Change A and B. Watch tip-to-tail addition live. The white dashed arrow is always A+B.",
    exploreControls: [
      {
        key: "ax",
        label: "A.x",
        min: -3,
        max: 3,
        step: 0.5,
        init: 3,
        color: "#f0b43c",
      },
      {
        key: "ay",
        label: "A.y",
        min: -3,
        max: 3,
        step: 0.5,
        init: 1,
        color: "#f0b43c",
      },
      {
        key: "bx",
        label: "B.x",
        min: -3,
        max: 3,
        step: 0.5,
        init: -1,
        color: "#4aff9a",
      },
      {
        key: "by",
        label: "B.y",
        min: -3,
        max: 3,
        step: 0.5,
        init: 2,
        color: "#4aff9a",
      },
    ],
    explore(ctx, { ax = 3, ay = 1, bx = -1, by = 2 }) {
      const S = [ax + bx, ay + by];
      drawGrid(ctx);
      arrow(ctx, [0, 0], [ax, ay], "#f0b43c", 3, 11);
      canvasLabel(
        ctx,
        `A=[${fmt(ax, 1)},${fmt(ay, 1)}]`,
        [ax, ay],
        "#f0b43c",
        8,
        -13,
      );
      arrow(ctx, [ax, ay], S, "#4aff9a", 3, 11);
      canvasLabel(
        ctx,
        `B=[${fmt(bx, 1)},${fmt(by, 1)}]`,
        lerpV([ax, ay], S, 0.5),
        "#4aff9a",
        8,
        12,
      );
      arrow(ctx, [0, 0], S, "#fff", 1.8, 9, 0.7, true);
      dot(ctx, S, "#4ac8ff", 7);
      canvasLabel(
        ctx,
        `A+B=[${fmt(S[0], 1)},${fmt(S[1], 1)}]`,
        S,
        "#4ac8ff",
        10,
        -14,
        12,
      );
    },
    exploreEquation({ ax = 3, ay = 1, bx = -1, by = 2 }) {
      return [
        { text: "[" },
        { text: fmt(ax, 1), color: "#f0b43c" },
        { text: ", " },
        { text: fmt(ay, 1), color: "#f0b43c" },
        { text: "]" },
        { text: "  +  " },
        { text: "[" },
        { text: fmt(bx, 1), color: "#4aff9a" },
        { text: ", " },
        { text: fmt(by, 1), color: "#4aff9a" },
        { text: "]" },
        { text: "  =  " },
        { text: "[" },
        { text: fmt(ax + bx, 1), color: "#4ac8ff", bold: true },
        { text: ", " },
        { text: fmt(ay + by, 1), color: "#4ac8ff", bold: true },
        { text: "]" },
      ];
    },

    proveCaption:
      "A is fixed at [2, 1]. Set B so that A + B = [1, 4]. You can see both vectors and the sum on the canvas.",
    proveTarget: [1, 4],
    proveControls: [
      {
        key: "bx",
        label: "B.x",
        min: -4,
        max: 4,
        step: 0.5,
        init: 0,
        color: "#4aff9a",
      },
      {
        key: "by",
        label: "B.y",
        min: -4,
        max: 4,
        step: 0.5,
        init: 0,
        color: "#4aff9a",
      },
    ],
    prove(ctx, { bx = 0, by = 0 }, solved) {
      const A = [2, 1],
        S = [2 + bx, 1 + by],
        T = [1, 4];
      drawGrid(ctx);
      const [tx, ty] = cpt(T);
      ctx.save();
      ctx.shadowColor = "#4aff9a";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#4aff9a";
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✦", tx, ty);
      ctx.restore();
      canvasLabel(ctx, "target A+B = [1,4]", T, "#4aff9a", 10, -14);
      arrow(ctx, [0, 0], A, "#f0b43c", 3, 11);
      canvasLabel(ctx, "A=[2,1] (fixed)", A, "#f0b43c", 8, -13);
      arrow(ctx, A, S, "#4aff9a", 3, 11);
      canvasLabel(
        ctx,
        `B=[${fmt(bx, 1)},${fmt(by, 1)}]`,
        lerpV(A, S, 0.5),
        "#4aff9a",
        8,
        12,
      );
      arrow(ctx, [0, 0], S, "#fff", 1.8, 9, 0.7, true);
      dot(ctx, S, solved ? "#4aff9a" : "#4ac8ff", 8);
      canvasLabel(
        ctx,
        `sum=[${fmt(S[0], 1)},${fmt(S[1], 1)}]`,
        S,
        solved ? "#4aff9a" : "#fff",
        10,
        14,
        12,
      );
      if (solved) canvasLabel(ctx, "✓", S, "#4aff9a", -16, -13, 14);
    },
    proveEquation({ bx = 0, by = 0 }, solved) {
      const sx = 2 + bx,
        sy = 1 + by;
      return [
        { text: "[2,1] + [" },
        { text: fmt(bx, 1), color: "#4aff9a", bold: true },
        { text: ", " },
        { text: fmt(by, 1), color: "#4aff9a", bold: true },
        { text: "] = [" },
        { text: fmt(sx, 1), color: solved ? "#4aff9a" : "#ff7a4a", bold: true },
        { text: ", " },
        { text: fmt(sy, 1), color: solved ? "#4aff9a" : "#ff7a4a", bold: true },
        { text: "]" },
        {
          text: solved ? "  ✓" : "  need [1, 4]",
          color: solved ? "#4aff9a" : "#888",
        },
      ];
    },
    proveCheck({ bx = 0, by = 0 }) {
      return Math.abs(2 + bx - 1) < 0.3 && Math.abs(1 + by - 4) < 0.3;
    },
    solvedExplanation:
      "B = [−1, 3]. You subtracted: [1,4]−[2,1]=[−1,3]. Addition is just adding each coordinate. Nothing more.",
  },

  // ══ WORLD 2: SCALING ══════════════════════════════════════════════════
  {
    id: 2,
    world: "SCALING",
    worldColor: "#f0b43c",
    title: "Scaling a Vector",
    concept:
      "Multiplying a vector by a number s scales it: s×[x,y]=[s·x, s·y]. This IS a matrix — the simplest one: [[s,0],[0,s]].",

    watchCaption:
      "Watch [1,1] scaled by different values of s. Direction stays the same, length changes. s<0 flips it.",
    watchDuration: 5000,
    watch(ctx, t) {
      drawGrid(ctx);
      const scalars = [1, 2, 0.5, -1, 3];
      const idx = Math.min(Math.floor(t * scalars.length), scalars.length - 1);
      const s = scalars[idx];
      const sv = [s, s];
      arrow(ctx, [0, 0], [1, 1], "rgba(255,255,255,0.2)", 1.5, 7, 1, true);
      canvasLabel(
        ctx,
        "original [1,1]",
        [1, 1],
        "rgba(255,255,255,0.3)",
        8,
        -10,
        10,
      );
      arrow(ctx, [0, 0], sv, "#f0b43c", 3, 12);
      dot(ctx, sv, "#f0b43c", 7);
      canvasLabel(
        ctx,
        `s=${fmt(s, 1)}  →  [${fmt(sv[0], 1)}, ${fmt(sv[1], 1)}]`,
        sv,
        "#f0b43c",
        10,
        s < 0 ? 14 : -14,
        13,
      );
    },

    exploreCaption:
      "Drag s. See the matrix ⎡s 0⎤ ⎣0 s⎦ update live. This diagonal matrix IS scaling.",
    exploreControls: [
      {
        key: "s",
        label: "scale  s",
        min: -3,
        max: 4,
        step: 0.25,
        init: 2,
        color: "#f0b43c",
      },
    ],
    explore(ctx, { s = 2 }) {
      drawGrid(ctx);
      arrow(ctx, [0, 0], [1, 1], "rgba(255,255,255,0.2)", 1.5, 7, 1, true);
      canvasLabel(ctx, "[1,1]", [1, 1], "rgba(255,255,255,0.3)", 8, -10, 10);
      arrow(ctx, [0, 0], [s, s], "#f0b43c", 3, 12);
      dot(ctx, [s, s], "#f0b43c", 8);
      canvasLabel(
        ctx,
        `s×[1,1] = [${fmt(s, 2)}, ${fmt(s, 2)}]`,
        [s, s],
        "#f0b43c",
        10,
        s < 0 ? 14 : -14,
        12,
      );
    },
    exploreEquation({ s = 2 }) {
      return [
        { text: "M = " },
        { text: `⎡${fmt(s, 2)}  0 ⎤`, color: "#f0b43c" },
        { text: "   M × [1,1] = [" },
        { text: fmt(s, 2), color: "#f0b43c", bold: true },
        { text: ", " },
        { text: fmt(s, 2), color: "#f0b43c", bold: true },
        { text: "]" },
        { text: `⎣0   ${fmt(s, 2)}⎦`, color: "#f0b43c" },
      ];
    },

    proveCaption:
      "Scale the vector [1, 0.5] until its total length equals exactly 3.",
    proveControls: [
      {
        key: "s",
        label: "scale  s",
        min: 0,
        max: 6,
        step: 0.1,
        init: 1,
        color: "#f0b43c",
      },
    ],
    prove(ctx, { s = 1 }, solved) {
      drawGrid(ctx);
      const sv = [s * 1, s * 0.5];
      const len = vmag(sv);
      ctx.save();
      ctx.strokeStyle = "rgba(74,255,154,0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.arc(cx(0), cy(0), 3 * CELL, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      canvasLabel(ctx, "target length = 3", [0, 3], "#4aff9a", -48, -10, 10);
      arrow(ctx, [0, 0], [1, 0.5], "rgba(255,255,255,0.2)", 1.5, 7, 1, true);
      canvasLabel(
        ctx,
        "original [1, 0.5]",
        [1, 0.5],
        "rgba(255,255,255,0.3)",
        8,
        -10,
        9,
      );
      arrow(ctx, [0, 0], sv, "#f0b43c", 3, 12);
      dot(ctx, sv, solved ? "#4aff9a" : "#f0b43c", 8);
      canvasLabel(
        ctx,
        `length = ${fmt(len, 3)}`,
        sv,
        solved ? "#4aff9a" : "#f0b43c",
        10,
        14,
        12,
      );
      if (solved) canvasLabel(ctx, "✓ length = 3", sv, "#4aff9a", 10, -15, 12);
    },
    proveEquation({ s = 1 }, solved) {
      const len = vmag([s, s * 0.5]);
      return [
        { text: `s = ${fmt(s, 2)}` },
        { text: "   " },
        {
          text: `s×[1, 0.5] = [${fmt(s, 2)}, ${fmt(s * 0.5, 2)}]`,
          color: "#f0b43c",
        },
        { text: "   " },
        {
          text: `length = √(${fmt(s, 2)}²+${fmt(s * 0.5, 2)}²) = ${fmt(len, 3)}`,
          color: solved ? "#4aff9a" : "#ff7a4a",
          bold: solved,
        },
        {
          text: solved ? "  ✓" : "  (need 3.000)",
          color: solved ? "#4aff9a" : "#888",
        },
      ];
    },
    proveCheck({ s = 1 }) {
      return Math.abs(vmag([s, s * 0.5]) - 3) < 0.08;
    },
    solvedExplanation:
      "s ≈ 2.683 (= 3/√1.25). You scaled both coordinates equally. That's a matrix [[s,0],[0,s]] — the simplest transform.",
  },

  // ══ WORLD 3: ROTATION ═════════════════════════════════════════════════
  {
    id: 3,
    world: "ROTATION",
    worldColor: "#4aff9a",
    title: "The Rotation Matrix",
    concept:
      "Rotating θ degrees uses the matrix R = [[cos θ, −sin θ],[sin θ, cos θ]]. Those cos/sin values come directly from the angle.",

    watchCaption:
      "The arrow rotates. Watch the matrix entries — they ARE cos and sin of the angle.",
    watchDuration: 5000,
    watch(ctx, t) {
      drawGrid(ctx);
      const ang = t * Math.PI * 1.5;
      const c = Math.cos(ang),
        s = Math.sin(ang);
      const rv = [c * 2, s * 2];
      ctx.save();
      ctx.strokeStyle = "rgba(74,255,154,0.15)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx(0), cy(0), 2 * CELL, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      arrow(ctx, [0, 0], [2, 0], "rgba(255,255,255,0.15)", 1.5, 7, 1, true);
      // Angle arc
      ctx.save();
      ctx.strokeStyle = "#f0b43c99";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx(0), cy(0), 34, 0, -ang, ang < 0);
      ctx.stroke();
      ctx.restore();
      arrow(ctx, [0, 0], rv, "#4aff9a", 3, 11);
      dot(ctx, rv, "#4aff9a", 7);
      canvasLabel(
        ctx,
        `θ=${fmt((ang * 180) / Math.PI, 0)}°`,
        [0.8, 0.5],
        "#f0b43c",
        0,
        0,
        10,
      );
      canvasLabel(
        ctx,
        `cos(θ)=${fmt(c, 2)}`,
        [-4.5, -3.4],
        "#4ac8ff",
        0,
        0,
        10,
      );
      canvasLabel(
        ctx,
        `sin(θ)=${fmt(s, 2)}`,
        [-4.5, -4.2],
        "#b06aff",
        0,
        0,
        10,
      );
    },

    exploreCaption:
      "Drag θ. Watch how cos and sin fill the rotation matrix. Try 90°, 180°, 270° — the numbers are clean.",
    exploreControls: [
      {
        key: "deg",
        label: "angle θ°",
        min: 0,
        max: 360,
        step: 1,
        init: 45,
        color: "#4aff9a",
      },
    ],
    explore(ctx, { deg = 45 }) {
      const r = degToRad(deg);
      const c = Math.cos(r),
        s = Math.sin(r);
      const rv = [c * 2, s * 2];
      drawGrid(ctx);
      ctx.save();
      ctx.strokeStyle = "rgba(74,255,154,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx(0), cy(0), 2 * CELL, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "#f0b43c88";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(cx(0), cy(0), 40, 0, -r, r < 0);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      arrow(ctx, [0, 0], [2, 0], "rgba(255,255,255,0.2)", 1.5, 7, 1, true);
      canvasLabel(ctx, "original", [2, 0], "rgba(255,255,255,0.4)", 6, -12, 9);
      arrow(ctx, [0, 0], rv, "#4aff9a", 3, 11);
      dot(ctx, rv, "#4aff9a", 8);
      canvasLabel(ctx, `θ = ${deg}°`, [0.8, 0.5], "#f0b43c", 0, 0, 11);
      canvasLabel(
        ctx,
        `[${fmt(rv[0], 2)}, ${fmt(rv[1], 2)}]`,
        rv,
        "#4aff9a",
        10,
        -13,
        11,
      );
    },
    exploreEquation({ deg = 45 }) {
      const r = degToRad(deg);
      const c = Math.cos(r),
        s = Math.sin(r);
      return [
        { text: "R(" },
        { text: `${deg}°`, color: "#f0b43c" },
        { text: ") = " },
        { text: "⎡", color: "#3a6a9a" },
        { text: fmt(c, 2), color: "#4ac8ff" },
        { text: "  " },
        { text: fmt(-s, 2), color: "#b06aff" },
        { text: "⎤  ", color: "#3a6a9a" },
        { text: "⎣", color: "#3a6a9a" },
        { text: fmt(s, 2), color: "#b06aff" },
        { text: "  " },
        { text: fmt(c, 2), color: "#4ac8ff" },
        { text: "⎦", color: "#3a6a9a" },
        { text: "    cos=" },
        { text: fmt(c, 2), color: "#4ac8ff" },
        { text: "  sin=" },
        { text: fmt(s, 2), color: "#b06aff" },
      ];
    },

    proveCaption:
      "Rotate the arrow to point at [0, 2] — straight up. What angle does that require?",
    proveControls: [
      {
        key: "deg",
        label: "angle θ°",
        min: 0,
        max: 360,
        step: 1,
        init: 0,
        color: "#4aff9a",
      },
    ],
    prove(ctx, { deg = 0 }, solved) {
      const r = degToRad(deg);
      const c = Math.cos(r),
        s = Math.sin(r);
      const rv = [c * 2, s * 2];
      drawGrid(ctx);
      const [tx, ty] = cpt([0, 2]);
      ctx.save();
      ctx.shadowColor = "#4aff9a";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#4aff9a";
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✦", tx, ty);
      ctx.restore();
      canvasLabel(ctx, "target [0, 2]", [0, 2], "#4aff9a", 10, -13);
      ctx.save();
      ctx.strokeStyle = "rgba(74,255,154,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx(0), cy(0), 2 * CELL, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      arrow(ctx, [0, 0], [2, 0], "rgba(255,255,255,0.18)", 1.5, 7, 1, true);
      arrow(ctx, [0, 0], rv, "#4aff9a", 3, 11);
      dot(ctx, rv, solved ? "#4aff9a" : "#4ac8ff", 8);
      canvasLabel(
        ctx,
        `θ=${deg}°  →  [${fmt(rv[0], 2)},${fmt(rv[1], 2)}]`,
        rv,
        solved ? "#4aff9a" : "#4ac8ff",
        10,
        14,
        11,
      );
      if (solved)
        canvasLabel(
          ctx,
          "✓ cos(90°)=0, sin(90°)=1",
          [0, 2],
          "#4aff9a",
          10,
          16,
          10,
        );
    },
    proveEquation({ deg = 0 }, solved) {
      const r = degToRad(deg);
      const c = Math.cos(r),
        s = Math.sin(r);
      return [
        { text: `θ = ${deg}°   ` },
        { text: "cos=" },
        { text: fmt(c, 2), color: "#4ac8ff" },
        { text: "  sin=" },
        { text: fmt(s, 2), color: "#b06aff" },
        { text: "  →  [" },
        {
          text: fmt(c * 2, 2),
          color: solved ? "#4aff9a" : "#ff7a4a",
          bold: solved,
        },
        { text: ", " },
        {
          text: fmt(s * 2, 2),
          color: solved ? "#4aff9a" : "#ff7a4a",
          bold: solved,
        },
        { text: "]" },
        {
          text: solved ? "  ✓ 90°!" : "  (need [0, 2])",
          color: solved ? "#4aff9a" : "#888",
        },
      ];
    },
    proveCheck({ deg = 0 }) {
      const r = degToRad(deg);
      return (
        Math.abs(Math.cos(r) * 2) < 0.1 && Math.abs(Math.sin(r) * 2 - 2) < 0.1
      );
    },
    solvedExplanation:
      "90° works. cos(90°)=0, sin(90°)=1. The matrix becomes [[0,−1],[1,0]]. Every 90° rotation uses these exact numbers — it's not magic, it's just what cos and sin do.",
  },

  // ══ WORLD 4: MATRIX × VECTOR ══════════════════════════════════════════
  {
    id: 4,
    world: "MATRIX × VECTOR",
    worldColor: "#b06aff",
    title: "How a Matrix Transforms Space",
    concept:
      "A matrix M transforms EVERY point in space. The two columns tell you where [1,0] and [0,1] land — everything else follows from that.",

    watchCaption:
      "Watch the grid itself bend as the matrix is applied. The red/green arrows are the two columns.",
    watchDuration: 5000,
    watch(ctx, t) {
      const M = [2, 0.8, 0.3, 1.6];
      const tm = Math.min(t * 1.4, 1);
      ctx.strokeStyle = `rgba(120,80,220,${0.22 * tm})`;
      ctx.lineWidth = 0.7;
      for (let i = -5; i <= 5; i++) {
        const [fx, fy] = cpt(lerpV([i, -5], applyMat(M, [i, -5]), tm));
        const [tx, ty] = cpt(lerpV([i, 5], applyMat(M, [i, 5]), tm));
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        const [fx2, fy2] = cpt(lerpV([-5, i], applyMat(M, [-5, i]), tm));
        const [tx2, ty2] = cpt(lerpV([5, i], applyMat(M, [5, i]), tm));
        ctx.beginPath();
        ctx.moveTo(fx2, fy2);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
      }
      drawGrid(ctx);
      const e1 = lerpV([1, 0], [M[0], M[2]], tm);
      const e2 = lerpV([0, 1], [M[1], M[3]], tm);
      arrow(ctx, [0, 0], e1, "#ff7a7a", 2.5, 10);
      arrow(ctx, [0, 0], e2, "#7aff7a", 2.5, 10);
      if (t > 0.5) {
        canvasLabel(
          ctx,
          `col1=[${fmt(M[0], 1)},${fmt(M[2], 1)}]`,
          e1,
          "#ff7a7a",
          8,
          -12,
        );
        canvasLabel(
          ctx,
          `col2=[${fmt(M[1], 1)},${fmt(M[3], 1)}]`,
          e2,
          "#7aff7a",
          8,
          12,
        );
      }
    },

    exploreCaption:
      "Change the matrix. The grid bends in real time. Col1 = where [1,0] lands. Col2 = where [0,1] lands.",
    exploreControls: [
      {
        key: "a",
        label: "M[0,0]  (col1 x)",
        min: -3,
        max: 3,
        step: 0.25,
        init: 2,
        color: "#ff7a7a",
      },
      {
        key: "c",
        label: "M[1,0]  (col1 y)",
        min: -3,
        max: 3,
        step: 0.25,
        init: 0.5,
        color: "#ff7a7a",
      },
      {
        key: "b",
        label: "M[0,1]  (col2 x)",
        min: -3,
        max: 3,
        step: 0.25,
        init: 0.5,
        color: "#7aff7a",
      },
      {
        key: "d",
        label: "M[1,1]  (col2 y)",
        min: -3,
        max: 3,
        step: 0.25,
        init: 1.5,
        color: "#7aff7a",
      },
    ],
    explore(ctx, { a = 2, b = 0.5, c = 0.5, d = 1.5 }) {
      const M = [a, b, c, d];
      drawTransformedGrid(ctx, M);
      drawGrid(ctx);
      arrow(ctx, [0, 0], [a, c], "#ff7a7a", 3, 11);
      arrow(ctx, [0, 0], [b, d], "#7aff7a", 3, 11);
      canvasLabel(
        ctx,
        `col1=[${fmt(a, 2)},${fmt(c, 2)}]`,
        [a, c],
        "#ff7a7a",
        8,
        -12,
      );
      canvasLabel(
        ctx,
        `col2=[${fmt(b, 2)},${fmt(d, 2)}]`,
        [b, d],
        "#7aff7a",
        8,
        12,
      );
    },
    exploreEquation({ a = 2, b = 0.5, c = 0.5, d = 1.5 }) {
      const M = [a, b, c, d];
      return [
        { text: "M = " },
        { text: "⎡", color: "#3a6a9a" },
        { text: fmt(a, 2), color: "#ff7a7a" },
        { text: "  " },
        { text: fmt(b, 2), color: "#7aff7a" },
        { text: "⎤  ", color: "#3a6a9a" },
        { text: "⎣", color: "#3a6a9a" },
        { text: fmt(c, 2), color: "#ff7a7a" },
        { text: "  " },
        { text: fmt(d, 2), color: "#7aff7a" },
        { text: "⎦  ", color: "#3a6a9a" },
        { text: "det = " },
        {
          text: fmt(det(M), 2),
          color: Math.abs(det(M)) < 0.1 ? "#ff4444" : "#f0b43c",
        },
      ];
    },

    proveCaption:
      "Set the matrix so it sends [1,0] → [2,1] (red target) and [0,1] → [−1,2] (green target).",
    proveControls: [
      {
        key: "a",
        label: "M[0,0]  col1.x",
        min: -3,
        max: 3,
        step: 0.25,
        init: 1,
        color: "#ff7a7a",
      },
      {
        key: "c",
        label: "M[1,0]  col1.y",
        min: -3,
        max: 3,
        step: 0.25,
        init: 0,
        color: "#ff7a7a",
      },
      {
        key: "b",
        label: "M[0,1]  col2.x",
        min: -3,
        max: 3,
        step: 0.25,
        init: 0,
        color: "#7aff7a",
      },
      {
        key: "d",
        label: "M[1,1]  col2.y",
        min: -3,
        max: 3,
        step: 0.25,
        init: 1,
        color: "#7aff7a",
      },
    ],
    prove(ctx, { a = 1, b = 0, c = 0, d = 1 }, solved) {
      const M = [a, b, c, d];
      drawGrid(ctx);
      // Targets
      dot(ctx, [2, 1], "#ff7a7a99", 10, false);
      canvasLabel(ctx, "target col1=[2,1]", [2, 1], "#ff7a7a", 10, -14, 10);
      dot(ctx, [-1, 2], "#7aff7a99", 10, false);
      canvasLabel(ctx, "target col2=[−1,2]", [-1, 2], "#7aff7a", 10, 12, 10);
      // User columns
      arrow(ctx, [0, 0], [a, c], "#ff7a7a", 3, 11);
      dot(ctx, [a, c], "#ff7a7a", 6, false);
      canvasLabel(
        ctx,
        `col1=[${fmt(a, 1)},${fmt(c, 1)}]`,
        [a, c],
        "#ff7a7a",
        8,
        -13,
        10,
      );
      arrow(ctx, [0, 0], [b, d], "#7aff7a", 3, 11);
      dot(ctx, [b, d], "#7aff7a", 6, false);
      canvasLabel(
        ctx,
        `col2=[${fmt(b, 1)},${fmt(d, 1)}]`,
        [b, d],
        "#7aff7a",
        8,
        13,
        10,
      );
      if (solved) {
        drawTransformedGrid(ctx, M, "rgba(74,255,154,0.15)");
        canvasLabel(
          ctx,
          "✓ grid shows the transformation",
          [0, -4.3],
          "#4aff9a",
          -64,
          0,
          10,
        );
      }
    },
    proveEquation({ a = 1, b = 0, c = 0, d = 1 }, solved) {
      const ok1 = Math.abs(a - 2) < 0.3 && Math.abs(c - 1) < 0.3;
      const ok2 = Math.abs(b + 1) < 0.3 && Math.abs(d - 2) < 0.3;
      return [
        { text: "M = " },
        { text: "⎡", color: "#3a6a9a" },
        { text: fmt(a, 2), color: ok1 ? "#4aff9a" : "#ff7a7a" },
        { text: "  " },
        { text: fmt(b, 2), color: ok2 ? "#4aff9a" : "#7aff7a" },
        { text: "⎤  ", color: "#3a6a9a" },
        { text: "⎣", color: "#3a6a9a" },
        { text: fmt(c, 2), color: ok1 ? "#4aff9a" : "#ff7a7a" },
        { text: "  " },
        { text: fmt(d, 2), color: ok2 ? "#4aff9a" : "#7aff7a" },
        { text: "⎦  ", color: "#3a6a9a" },
        {
          text: ok1 ? "col1✓" : "col1 needs [2,1]",
          color: ok1 ? "#4aff9a" : "#888",
        },
        { text: "  " },
        {
          text: ok2 ? "col2✓" : "col2 needs [−1,2]",
          color: ok2 ? "#4aff9a" : "#888",
        },
      ];
    },
    proveCheck({ a = 1, b = 0, c = 0, d = 1 }) {
      return (
        Math.abs(a - 2) < 0.3 &&
        Math.abs(c - 1) < 0.3 &&
        Math.abs(b + 1) < 0.3 &&
        Math.abs(d - 2) < 0.3
      );
    },
    solvedExplanation:
      "M = [[2,−1],[1,2]]. The columns are exactly where the basis vectors land. That's what a matrix IS — a table of 'where do things go'.",
  },

  // ══ WORLD 5: DETERMINANT ══════════════════════════════════════════════
  {
    id: 5,
    world: "DETERMINANT",
    worldColor: "#ff7a4a",
    title: "Area & the Determinant",
    concept:
      "det(M) = ad − bc = how much a matrix scales area. det=2 → area doubles. det=0 → shape collapses to a line (irreversible!).",

    watchCaption:
      "The unit square transforms. Its area changes by exactly det(M).",
    watchDuration: 5000,
    watch(ctx, t) {
      const M = [2, 1, 0.5, 1.5];
      const tm = Math.min(t * 1.4, 1);
      const sq = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ];
      const tsq = sq.map((p) => lerpV(p, applyMat(M, p), tm));
      drawGrid(ctx);
      poly(ctx, sq, "rgba(255,255,255,0.05)", "rgba(255,255,255,0.25)", 1);
      poly(ctx, tsq, "rgba(255,122,74,0.2)", "#ff7a4a", 2.5);
      const d = det(M);
      const cur = lerp(1, d, tm);
      canvasLabel(
        ctx,
        `area = ${fmt(cur, 2)}  (det = ${fmt(d, 2)})`,
        [0, -4.3],
        "#ff7a4a",
        0,
        0,
        11,
      );
    },

    exploreCaption:
      "Change the matrix. Try making det=0 — watch the square collapse to a line!",
    exploreControls: [
      {
        key: "a",
        label: "M[0,0]  a",
        min: -3,
        max: 3,
        step: 0.25,
        init: 2,
        color: "#ff7a7a",
      },
      {
        key: "b",
        label: "M[0,1]  b",
        min: -3,
        max: 3,
        step: 0.25,
        init: 1,
        color: "#7aff7a",
      },
      {
        key: "c",
        label: "M[1,0]  c",
        min: -3,
        max: 3,
        step: 0.25,
        init: 0,
        color: "#ff7a7a",
      },
      {
        key: "d",
        label: "M[1,1]  d",
        min: -3,
        max: 3,
        step: 0.25,
        init: 2,
        color: "#7aff7a",
      },
    ],
    explore(ctx, { a = 2, b = 1, c = 0, d = 2 }) {
      const M = [a, b, c, d];
      const sq = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ];
      const tsq = sq.map((p) => applyMat(M, p));
      const dt = det(M);
      drawGrid(ctx);
      poly(ctx, sq, "rgba(255,255,255,0.04)", "rgba(255,255,255,0.2)", 1);
      const col =
        dt < -0.1 ? "#4ac8ff" : Math.abs(dt) < 0.15 ? "#ff4444" : "#ff7a4a";
      poly(ctx, tsq, col + "33", col, 2.5);
      canvasLabel(
        ctx,
        `det = ${fmt(a, 1)}×${fmt(d, 1)} − ${fmt(b, 1)}×${fmt(c, 1)} = ${fmt(dt, 2)}`,
        [0, -4.2],
        col,
        -60,
        0,
        10,
      );
      if (Math.abs(dt) < 0.15)
        canvasLabel(
          ctx,
          "⚠ SINGULAR — collapsed to line!",
          [0, -3.4],
          "#ff4444",
          -68,
          0,
          11,
        );
      if (dt < -0.1)
        canvasLabel(
          ctx,
          "neg det = orientation flipped",
          [0, -3.4],
          "#4ac8ff",
          -72,
          0,
          10,
        );
    },
    exploreEquation({ a = 2, b = 1, c = 0, d = 2 }) {
      const dt = det([a, b, c, d]);
      return [
        { text: "det = a·d − b·c = " },
        { text: fmt(a, 2), color: "#ff7a7a" },
        { text: "·" },
        { text: fmt(d, 2), color: "#7aff7a" },
        { text: " − " },
        { text: fmt(b, 2), color: "#7aff7a" },
        { text: "·" },
        { text: fmt(c, 2), color: "#ff7a7a" },
        { text: " = " },
        {
          text: fmt(dt, 2),
          color:
            Math.abs(dt) < 0.15 ? "#ff4444" : dt < 0 ? "#4ac8ff" : "#f0b43c",
          bold: true,
        },
      ];
    },

    proveCaption:
      "Build a matrix with determinant = 4. Use the formula: det = a·d − b·c = 4.",
    proveControls: [
      {
        key: "a",
        label: "a",
        min: -4,
        max: 4,
        step: 0.5,
        init: 1,
        color: "#ff7a7a",
      },
      {
        key: "b",
        label: "b",
        min: -4,
        max: 4,
        step: 0.5,
        init: 0,
        color: "#7aff7a",
      },
      {
        key: "c",
        label: "c",
        min: -4,
        max: 4,
        step: 0.5,
        init: 0,
        color: "#ff7a7a",
      },
      {
        key: "d",
        label: "d",
        min: -4,
        max: 4,
        step: 0.5,
        init: 1,
        color: "#7aff7a",
      },
    ],
    prove(ctx, { a = 1, b = 0, c = 0, d = 1 }, solved) {
      const M = [a, b, c, d];
      const dt = det(M);
      const sq = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ];
      const tsq = sq.map((p) => applyMat(M, p));
      drawGrid(ctx);
      // Target area
      ctx.save();
      ctx.strokeStyle = "rgba(74,255,154,0.4)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 5]);
      poly(
        ctx,
        [
          [0, 0],
          [2, 0],
          [2, 2],
          [0, 2],
        ],
        "rgba(74,255,154,0.06)",
        "rgba(74,255,154,0.4)",
        1,
      );
      ctx.setLineDash([]);
      ctx.restore();
      canvasLabel(ctx, "target area = 4", [1, 2], "#4aff9a", 10, -12, 10);
      poly(ctx, sq, "rgba(255,255,255,0.04)", "rgba(255,255,255,0.2)", 1);
      const col = solved
        ? "#4aff9a"
        : Math.abs(dt - 4) < 0.5
          ? "#f0b43c"
          : "#ff7a4a";
      poly(ctx, tsq, col + "33", col, 2.5);
      canvasLabel(ctx, `area=${fmt(dt, 2)}`, tsq[2] || [1, 1], col, 8, -12, 11);
    },
    proveEquation({ a = 1, b = 0, c = 0, d = 1 }, solved) {
      const dt = det([a, b, c, d]);
      return [
        { text: `${fmt(a, 1)}·${fmt(d, 1)} − ${fmt(b, 1)}·${fmt(c, 1)} = ` },
        {
          text: fmt(dt, 2),
          color: solved
            ? "#4aff9a"
            : Math.abs(dt - 4) < 0.5
              ? "#f0b43c"
              : "#ff7a4a",
          bold: true,
        },
        {
          text: solved ? "  = 4 ✓" : "  (need 4)",
          color: solved ? "#4aff9a" : "#888",
        },
      ];
    },
    proveCheck({ a = 1, b = 0, c = 0, d = 1 }) {
      return Math.abs(det([a, b, c, d]) - 4) < 0.3;
    },
    solvedExplanation:
      "Many solutions work — [[2,0],[0,2]] gives det=4, [[4,0],[0,1]] too, even [[1,1],[−1,3]]. The determinant is a single number that captures how much area is scaled. Forever.",
  },

  // ══ WORLD 6: EIGENVECTORS ═════════════════════════════════════════════
  {
    id: 6,
    world: "EIGENVECTORS",
    worldColor: "#ff6aaa",
    title: "Directions That Don't Rotate",
    concept:
      "An eigenvector is a direction a matrix only STRETCHES — never rotates. M×v = λ×v where λ is the eigenvalue (stretch amount).",

    watchCaption:
      "Most arrows rotate AND change length. One special direction only stretches. That's the eigenvector.",
    watchDuration: 6000,
    watch(ctx, t) {
      const M = [3, 1, 0, 2];
      drawGrid(ctx);
      // Show several vectors being transformed
      const testVecs = [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
      ];
      const cols = ["#4ac8ff", "#b06aff", "#f0b43c", "#ff7a7a"];
      testVecs.forEach((v, i) => {
        const phase = Math.max(0, Math.min(t * 1.3 - i * 0.2, 1));
        const tv = applyMat(M, v);
        const cur = lerpV(v, tv, phase);
        arrow(ctx, [0, 0], v, cols[i] + "44", 1.5, 7, 0.5);
        arrow(ctx, [0, 0], cur, cols[i], 2, 8, phase);
        const isEigen = Math.abs(vdot(vnorm(tv), vnorm(v))) > 0.99;
        if (phase > 0.85 && isEigen) {
          canvasLabel(
            ctx,
            "← only stretches! eigenvector",
            cur,
            "#ff6aaa",
            8,
            -12,
            10,
          );
          ctx.save();
          ctx.strokeStyle = "#ff6aaa55";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 5]);
          ctx.beginPath();
          ctx.moveTo(
            cpt([-vnorm(v)[0] * 5, -vnorm(v)[1] * 5])[0],
            cpt([-vnorm(v)[0] * 5, -vnorm(v)[1] * 5])[1],
          );
          ctx.lineTo(
            cpt([vnorm(v)[0] * 5, vnorm(v)[1] * 5])[0],
            cpt([vnorm(v)[0] * 5, vnorm(v)[1] * 5])[1],
          );
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        } else if (phase > 0.85) {
          canvasLabel(ctx, "rotated", cur, cols[i] + "99", 8, -10, 9);
        }
      });
      if (t > 0.7)
        canvasLabel(
          ctx,
          "M = [[3,1],[0,2]]",
          [-4.5, -4.3],
          "#b06aff",
          0,
          0,
          10,
        );
    },

    exploreCaption:
      "Gold = your vector v. Orange = M×v (after transform). When both arrows point the SAME direction, that's an eigenvector. Slide until they align.",
    exploreControls: [
      {
        key: "vx",
        label: "v.x",
        min: -3,
        max: 3,
        step: 0.1,
        init: 1,
        color: "#f0b43c",
      },
      {
        key: "vy",
        label: "v.y",
        min: -3,
        max: 3,
        step: 0.1,
        init: 0.5,
        color: "#f0b43c",
      },
    ],
    explore(ctx, { vx = 1, vy = 0.5 }) {
      const M = [3, 1, 0, 2];
      const v = [vx, vy];
      const tv = applyMat(M, v);
      drawGrid(ctx);
      canvasLabel(ctx, "M=[[3,1],[0,2]]", [-4.5, -4.3], "#b06aff", 0, 0, 10);
      const vm = vmag(v);
      if (vm > 0.1) {
        // Angle between v and Mv
        const aligned = Math.abs(vdot(vnorm(tv), vnorm(v))) > 0.97;
        arrow(ctx, [0, 0], v, "#f0b43c", 3, 11);
        canvasLabel(
          ctx,
          `v=[${fmt(vx, 1)},${fmt(vy, 1)}]`,
          v,
          "#f0b43c",
          8,
          -13,
        );
        arrow(ctx, [0, 0], tv, "#ff7a4a", 2.5, 10);
        canvasLabel(
          ctx,
          `Mv=[${fmt(tv[0], 2)},${fmt(tv[1], 2)}]`,
          tv,
          "#ff7a4a",
          8,
          13,
        );
        if (aligned) {
          const lam = vmag(tv) / vm;
          ctx.save();
          ctx.strokeStyle = "#ff6aaa66";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 5]);
          const nv = vnorm(v);
          const [lx1, ly1] = cpt([-nv[0] * 4.5, -nv[1] * 4.5]),
            [lx2, ly2] = cpt([nv[0] * 4.5, nv[1] * 4.5]);
          ctx.beginPath();
          ctx.moveTo(lx1, ly1);
          ctx.lineTo(lx2, ly2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
          canvasLabel(
            ctx,
            `✓ EIGENVECTOR — Mv = ${fmt(lam, 2)}×v`,
            [0, -3.5],
            "#ff6aaa",
            -60,
            0,
            11,
          );
        }
      }
    },
    exploreEquation({ vx = 1, vy = 0.5 }) {
      const M = [3, 1, 0, 2];
      const v = [vx, vy];
      const tv = applyMat(M, v);
      const vm = vmag(v);
      const aligned = vm > 0.1 && Math.abs(vdot(vnorm(tv), vnorm(v))) > 0.97;
      if (!aligned) {
        const angle =
          vm < 0.1
            ? 0
            : Math.acos(Math.min(1, Math.abs(vdot(vnorm(tv), vnorm(v)))));
        return [
          { text: "Mv = [" },
          { text: fmt(tv[0], 2), color: "#ff7a4a" },
          { text: ", " },
          { text: fmt(tv[1], 2), color: "#ff7a4a" },
          { text: "]" },
          {
            text: `   angle between v and Mv: ${fmt((angle * 180) / Math.PI, 1)}°`,
          },
          { text: "   (need 0° for eigenvector)", color: "#888" },
        ];
      }
      const lam = vmag(tv) / vm;
      return [
        { text: "M × v = " },
        { text: fmt(lam, 2), color: "#ff6aaa", bold: true },
        { text: " × v" },
        { text: "   ← eigenvalue λ = " },
        { text: fmt(lam, 2), color: "#ff6aaa", bold: true },
        { text: "  ✓ EIGENVECTOR FOUND", color: "#ff6aaa" },
      ];
    },

    proveCaption:
      "For M=[[2,0],[0,3]], find the eigenvector along the Y-axis (where M only stretches vertically). Set v.x close to 0.",
    proveControls: [
      {
        key: "vx",
        label: "v.x",
        min: -0.5,
        max: 0.5,
        step: 0.05,
        init: 0.4,
        color: "#f0b43c",
      },
      {
        key: "vy",
        label: "v.y",
        min: -3,
        max: 3,
        step: 0.1,
        init: 1,
        color: "#f0b43c",
      },
    ],
    prove(ctx, { vx = 0.4, vy = 1 }, solved) {
      const M = [2, 0, 0, 3];
      const v = [vx, vy];
      const tv = applyMat(M, v);
      const vm = vmag(v);
      drawGrid(ctx);
      canvasLabel(ctx, "M=[[2,0],[0,3]]", [-4.5, -4.3], "#b06aff", 0, 0, 10);
      // Y axis hint
      ctx.save();
      ctx.strokeStyle = "rgba(255,106,170,0.2)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx(0), cy(-4));
      ctx.lineTo(cx(0), cy(4));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      canvasLabel(
        ctx,
        "eigenvector direction →",
        [0.1, 3],
        "#ff6aaa44",
        0,
        0,
        9,
      );
      if (vm > 0.1) {
        arrow(ctx, [0, 0], v, "#f0b43c", 3, 11);
        canvasLabel(
          ctx,
          `v=[${fmt(vx, 2)},${fmt(vy, 1)}]`,
          v,
          "#f0b43c",
          8,
          -13,
        );
        arrow(ctx, [0, 0], tv, "#ff7a4a", 2.5, 10);
        canvasLabel(
          ctx,
          `Mv=[${fmt(tv[0], 2)},${fmt(tv[1], 2)}]`,
          tv,
          "#ff7a4a",
          8,
          13,
        );
        const aligned = Math.abs(vdot(vnorm(tv), vnorm(v))) > 0.97;
        if (aligned) {
          const lam = vmag(tv) / vm;
          ctx.save();
          ctx.strokeStyle = "#ff6aaa99";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx(0), cy(-4));
          ctx.lineTo(cx(0), cy(4));
          ctx.stroke();
          ctx.restore();
          canvasLabel(
            ctx,
            `✓ λ = ${fmt(lam, 2)} — Y axis stretches by 3`,
            [0, -3.5],
            "#ff6aaa",
            -80,
            0,
            11,
          );
        }
      }
    },
    proveEquation({ vx = 0.4, vy = 1 }, solved) {
      const M = [2, 0, 0, 3];
      const v = [vx, vy];
      const tv = applyMat(M, v);
      const vm = vmag(v);
      const aligned = vm > 0.1 && Math.abs(vdot(vnorm(tv), vnorm(v))) > 0.97;
      const lam = aligned && vm > 0.1 ? vmag(tv) / vm : null;
      return aligned
        ? [
            { text: `M×[0,${fmt(vy, 1)}] = [0,${fmt(tv[1], 2)}] = ` },
            { text: fmt(lam, 2), color: "#ff6aaa", bold: true },
            { text: `×[0,${fmt(vy, 1)}]` },
            { text: "  ✓ eigenvalue=3", color: "#ff6aaa" },
          ]
        : [
            {
              text: `Mv = [${fmt(tv[0], 2)}, ${fmt(tv[1], 2)}]   v = [${fmt(vx, 2)}, ${fmt(vy, 1)}]`,
            },
            { text: "   v.x must be ~0 for this eigenvector", color: "#888" },
          ];
    },
    proveCheck({ vx = 0.4, vy = 1 }) {
      const M = [2, 0, 0, 3];
      const v = [vx, vy];
      const tv = applyMat(M, v);
      const vm = vmag(v);
      return (
        vm > 0.2 &&
        Math.abs(vdot(vnorm(tv), vnorm(v))) > 0.97 &&
        Math.abs(vx) < 0.08
      );
    },
    solvedExplanation:
      "v=[0,1] is an eigenvector of [[2,0],[0,3]]. M×[0,1]=[0,3]=3×[0,1]. The Y-axis only stretches (by 3), never rotates. Eigenvalue=3. This is the core idea: eigenvectors are the 'unchanged directions' of a transformation.",
  },
];

// ─── Phase manager ────────────────────────────────────────────────────────
// phases: watch → explore → prove (no overlay ever covers canvas after solve)

export default function MatrixGame({ onBack }) {
  const [screen, setScreen] = useState("map");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [phase, setPhase] = useState("watch"); // watch | explore | prove
  const [unlocked, setUnlocked] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [controls, setControls] = useState({});
  const [animT, setAnimT] = useState(0);
  const [animPlaying, setAnimPlaying] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const animStartRef = useRef(null);

  const lesson = LESSONS[lessonIdx];

  // Init controls on phase/lesson change
  useEffect(() => {
    if (!lesson) return;
    const ctrlDef =
      phase === "explore"
        ? lesson.exploreControls
        : phase === "prove"
          ? lesson.proveControls
          : [];
    const init = {};
    (ctrlDef || []).forEach((c) => {
      init[c.key] = c.init;
    });
    setControls(init);
    setSolved(false);
    setShowExplanation(false);
    if (phase === "watch") {
      setAnimT(0);
      setAnimPlaying(true);
      animStartRef.current = null;
    }
  }, [phase, lessonIdx]);

  // Animation loop
  useEffect(() => {
    if (!animPlaying) return;
    const tick = (ts) => {
      if (!animStartRef.current) animStartRef.current = ts;
      const t = Math.min(
        (ts - animStartRef.current) / (lesson.watchDuration || 4000),
        1,
      );
      setAnimT(t);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else setAnimPlaying(false);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [animPlaying]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !lesson) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = "#04080f";
    ctx.fillRect(0, 0, CW, CH);
    if (phase === "watch") lesson.watch(ctx, animT);
    else if (phase === "explore") lesson.explore(ctx, controls);
    else if (phase === "prove") {
      const isSolved = lesson.proveCheck(controls);
      lesson.prove(ctx, controls, isSolved);
    }
  }, [phase, animT, controls, lesson]);

  // Check solve
  useEffect(() => {
    if (phase !== "prove") return;
    const ok = lesson.proveCheck(controls);
    if (ok && !solved) {
      setSolved(true);
      // Don't show overlay — just show explanation panel below
      setShowExplanation(true);
    }
  }, [controls, phase, lesson, solved]);

  function goNext() {
    if (phase === "watch") {
      setPhase("explore");
      return;
    }
    if (phase === "explore") {
      setPhase("prove");
      return;
    }
    // Prove → next lesson
    setCompleted((s) => new Set([...s, lessonIdx]));
    setUnlocked((u) => Math.max(u, lessonIdx + 1));
    if (lessonIdx + 1 >= LESSONS.length) {
      setScreen("map");
      return;
    }
    setLessonIdx(lessonIdx + 1);
    setPhase("watch");
  }

  function goLesson(idx) {
    setLessonIdx(idx);
    setPhase("watch");
    setScreen("lesson");
  }

  // Equation to display
  const eqParts = (() => {
    if (!lesson) return [];
    try {
      if (phase === "explore") return lesson.exploreEquation(controls);
      if (phase === "prove") return lesson.proveEquation(controls, solved);
    } catch {}
    return [];
  })();

  const phaseNames = ["WATCH", "EXPLORE", "PROVE IT"];
  const phaseColors = ["#4ac8ff", "#f0b43c", "#4aff9a"];
  const phaseIdx2 = phase === "watch" ? 0 : phase === "explore" ? 1 : 2;

  // ── MAP ────────────────────────────────────────────────────────────────
  if (screen === "map") {
    const worlds = [];
    LESSONS.forEach((l, i) => {
      let w = worlds.find((x) => x.name === l.world);
      if (!w) {
        w = { name: l.world, color: l.worldColor, items: [] };
        worlds.push(w);
      }
      w.items.push({ l, i });
    });
    return (
      <div
        style={{
          background: "rgba(4,8,15,0.92)",
          minHeight: "100vh",
          padding: "28px 20px",
          fontFamily: "'Courier New',monospace",
          color: "#c8daf0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              alignSelf: 'flex-start',
              background: 'none',
              border: 'none',
              color: '#2a5a8a',
              cursor: 'pointer',
              fontSize: '11px',
              fontFamily: "'Courier New',monospace",
              letterSpacing: '2px',
              padding: '0 0 4px 0',
            }}
          >
            ← GAMES
          </button>
        )}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "30px",
              letterSpacing: "8px",
              color: "#4ac8ff",
              fontWeight: "bold",
              textShadow: "0 0 30px #4ac8ff33",
            }}
          >
            MATRIX
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#2a4a6a",
              letterSpacing: "4px",
              marginTop: "6px",
            }}
          >
            LINEAR ALGEBRA · ZERO TO MASTERY
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
            maxWidth: "520px",
          }}
        >
          {worlds.map((w, wi) => (
            <div
              key={wi}
              style={{
                border: `1px solid ${w.color}33`,
                borderRadius: "8px",
                background: "rgba(6,14,30,0.7)",
              }}
            >
              <div
                style={{
                  padding: "9px 15px",
                  borderBottom: `1px solid ${w.color}22`,
                  fontSize: "9px",
                  color: w.color,
                  letterSpacing: "3px",
                }}
              >
                {w.name}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  padding: "12px 15px",
                }}
              >
                {w.items.map(({ l, i }) => {
                  const isLocked = i > unlocked;
                  const isDone = completed.has(i);
                  const isCurrent = i === unlocked && !isDone;
                  return (
                    <button
                      key={i}
                      onClick={() => !isLocked && goLesson(i)}
                      disabled={isLocked}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "5px",
                        fontFamily: "'Courier New',monospace",
                        fontSize: "11px",
                        cursor: isLocked ? "default" : "pointer",
                        background: isDone
                          ? `${w.color}18`
                          : isCurrent
                            ? "rgba(14,28,60,0.9)"
                            : "rgba(6,12,28,0.6)",
                        border: `1px solid ${isDone ? w.color : isCurrent ? w.color + "77" : w.color + "22"}`,
                        color: isDone
                          ? w.color
                          : isCurrent
                            ? "#c8daf0"
                            : "#2a4a6a",
                      }}
                    >
                      {isDone ? "✓ " : isCurrent ? "▶ " : ""}
                      {l.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => goLesson(Math.min(unlocked, LESSONS.length - 1))}
          style={{
            padding: "12px 36px",
            background: "transparent",
            border: "1px solid #4ac8ff88",
            color: "#4ac8ff",
            fontSize: "12px",
            borderRadius: "6px",
            cursor: "pointer",
            letterSpacing: "3px",
            fontFamily: "'Courier New',monospace",
          }}
        >
          {unlocked === 0 && completed.size === 0 ? "BEGIN" : "CONTINUE"}
        </button>
      </div>
    );
  }

  // ── LESSON ─────────────────────────────────────────────────────────────
  const currentControls =
    phase === "explore"
      ? lesson.exploreControls
      : phase === "prove"
        ? lesson.proveControls
        : [];

  return (
    <div
      style={{
        background: "rgba(4,8,15,0.92)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Courier New',monospace",
        color: "#c8daf0",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "7px 14px",
          borderBottom: "1px solid rgba(30,70,140,0.4)",
          background: "rgba(3,7,18,0.97)",
          flexShrink: 0,
        }}
      >
        {onBack && (
          <>
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                color: "#2a5a8a",
                cursor: "pointer",
                fontSize: "11px",
                fontFamily: "'Courier New',monospace",
                letterSpacing: "2px",
              }}
            >
              ← GAMES
            </button>
            <div style={{ width: "1px", height: "14px", background: "rgba(30,70,140,0.4)" }} />
          </>
        )}
        <button
          onClick={() => setScreen("map")}
          style={{
            background: "none",
            border: "none",
            color: "#2a5a8a",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          ← MAP
        </button>
        <div
          style={{
            width: "1px",
            height: "14px",
            background: "rgba(30,70,140,0.4)",
          }}
        />
        <span
          style={{
            fontSize: "9px",
            color: lesson.worldColor,
            letterSpacing: "2px",
          }}
        >
          {lesson.world}
        </span>
        <span style={{ color: "#1a3a5a" }}>·</span>
        <span style={{ fontSize: "11px" }}>{lesson.title}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: "3px" }}>
          {["watch", "explore", "prove"].map((p, i) => (
            <div
              key={p}
              style={{
                padding: "3px 9px",
                borderRadius: "3px",
                fontSize: "9px",
                letterSpacing: "1px",
                background: p === phase ? `${phaseColors[i]}22` : "transparent",
                border: `1px solid ${p === phase ? phaseColors[i] + "77" : i < phaseIdx2 ? phaseColors[i] + "33" : "rgba(30,70,140,0.25)"}`,
                color:
                  p === phase
                    ? phaseColors[i]
                    : i < phaseIdx2
                      ? phaseColors[i] + "66"
                      : "#1a3a5a",
              }}
            >
              {phaseNames[i]}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Canvas */}
        <div style={{ flexShrink: 0, position: "relative" }}>
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            style={{ display: "block" }}
          />
          {/* Replay button for watch */}
          {phase === "watch" && !animPlaying && (
            <button
              onClick={() => {
                setAnimT(0);
                setAnimPlaying(true);
                animStartRef.current = null;
              }}
              style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                padding: "5px 12px",
                background: "rgba(3,7,18,0.9)",
                border: "1px solid #4ac8ff44",
                color: "#4ac8ff",
                fontSize: "10px",
                borderRadius: "4px",
                cursor: "pointer",
                letterSpacing: "2px",
                fontFamily: "'Courier New',monospace",
              }}
            >
              ↺ REPLAY
            </button>
          )}
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid rgba(30,70,140,0.3)",
            background: "rgba(4,10,22,0.8)",
            minWidth: 0,
          }}
        >
          {/* Phase description */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(30,70,140,0.25)",
            }}
          >
            <div
              style={{
                fontSize: "8px",
                color: phaseColors[phaseIdx2],
                letterSpacing: "3px",
                marginBottom: "6px",
              }}
            >
              {phaseNames[phaseIdx2]}
            </div>
            <div
              style={{
                fontSize: "12px",
                lineHeight: "1.75",
                whiteSpace: "pre-line",
                color: "#c8daf0",
              }}
            >
              {phase === "watch"
                ? lesson.watchCaption
                : phase === "explore"
                  ? lesson.exploreCaption
                  : lesson.proveCaption}
            </div>
          </div>

          {/* Concept box */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid rgba(30,70,140,0.2)",
              background: "rgba(2,6,18,0.5)",
            }}
          >
            <div
              style={{
                fontSize: "8px",
                color: "#2a4a6a",
                letterSpacing: "2px",
                marginBottom: "5px",
              }}
            >
              CONCEPT
            </div>
            <div
              style={{ fontSize: "11px", color: "#4a7a9a", lineHeight: "1.7" }}
            >
              {lesson.concept}
            </div>
          </div>

          {/* Live equation — always visible during explore/prove */}
          {eqParts.length > 0 && (
            <div
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid rgba(30,70,140,0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  color: "#2a4a6a",
                  letterSpacing: "2px",
                  marginBottom: "6px",
                }}
              >
                LIVE EQUATION
              </div>
              <EqBox parts={eqParts} />
            </div>
          )}

          {/* Controls */}
          {currentControls.length > 0 && (
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(30,70,140,0.2)",
              }}
            >
              {currentControls.map((ctrl) => (
                <div key={ctrl.key} style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#2a5a7a",
                        letterSpacing: "1px",
                      }}
                    >
                      {ctrl.label}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: ctrl.color,
                        fontWeight: "bold",
                        fontFamily: "Courier New, monospace",
                      }}
                    >
                      {fmt(
                        controls[ctrl.key] ?? ctrl.init,
                        Math.abs(ctrl.step) < 0.2 ? 2 : 1,
                      )}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step}
                    value={controls[ctrl.key] ?? ctrl.init}
                    style={{
                      width: "100%",
                      accentColor: ctrl.color,
                      cursor: "pointer",
                    }}
                    onChange={(e) =>
                      setControls((s) => ({
                        ...s,
                        [ctrl.key]: parseFloat(e.target.value),
                      }))
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "8px",
                      color: "#1a3050",
                    }}
                  >
                    <span>{ctrl.min}</span>
                    <span>{ctrl.max}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Solved explanation — appears IN PANEL, canvas stays visible */}
          {showExplanation && (
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(74,255,154,0.06)",
                borderBottom: "1px solid rgba(74,255,154,0.25)",
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  color: "#4aff9a",
                  letterSpacing: "2px",
                  marginBottom: "6px",
                }}
              >
                ✓ CORRECT — HERE'S WHY IT WORKS
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6aaa7a",
                  lineHeight: "1.8",
                }}
              >
                {lesson.solvedExplanation}
              </div>
            </div>
          )}

          {/* Solve status for prove */}
          {phase === "prove" && !showExplanation && (
            <div style={{ padding: "10px 16px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: solved ? "#4aff9a" : "rgba(30,70,140,0.5)",
                    boxShadow: solved ? "0 0 12px #4aff9a" : "none",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "11px", color: "#2a5a7a" }}>
                  Adjust sliders — watch the equation above update in real time.
                </span>
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Next button */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(30,70,140,0.25)",
            }}
          >
            <button
              onClick={goNext}
              disabled={phase === "prove" && !solved}
              style={{
                width: "100%",
                padding: "11px",
                background: "transparent",
                border: `1px solid ${phase === "prove" ? (solved ? "#4aff9a88" : "rgba(30,70,140,0.3)") : phaseColors[phaseIdx2] + "77"}`,
                color:
                  phase === "prove"
                    ? solved
                      ? "#4aff9a"
                      : "#2a4a6a"
                    : phaseColors[phaseIdx2],
                fontSize: "11px",
                borderRadius: "5px",
                cursor: phase === "prove" && !solved ? "default" : "pointer",
                letterSpacing: "2px",
                fontFamily: "'Courier New',monospace",
              }}
            >
              {phase === "watch"
                ? "I SEE IT — EXPLORE →"
                : phase === "explore"
                  ? "I GET IT — PROVE IT →"
                  : solved
                    ? lessonIdx < LESSONS.length - 1
                      ? "NEXT LESSON →"
                      : "MAP"
                    : "SOLVE TO CONTINUE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
