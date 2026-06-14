const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #1a1a2e;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: 'Courier New', monospace;
  }
  canvas { display: block; background: #16213e; border: 1px solid #0f3460; border-radius: 4px; }
`;

const LESSON_CANVAS_3 = {
  title: 'Lines, Arcs, and Bézier Curves',
  subtitle: 'arc, arcTo, ellipse, and the complete Bézier curve system.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## Arcs and Angles

The \`arc\` method is one of the most frequently used Canvas commands — every circle, ring, clock hand, pie slice, and rounded element uses it.

\`\`\`js
arc(x, y, radius, startAngle, endAngle, counterclockwise?)
\`\`\`

**Critical:** angles are in **radians**, measured **clockwise** from the positive X axis (3 o'clock position). This is different from math convention where 0 is the right and angles go counterclockwise.

| Angle | Degrees | Radians |
|---|---|---|
| Right (3 o'clock) | 0° | 0 |
| Bottom (6 o'clock) | 90° | Math.PI / 2 |
| Left (9 o'clock) | 180° | Math.PI |
| Top (12 o'clock) | 270° | 3 * Math.PI / 2 |
| Full circle | 360° | 2 * Math.PI |

The optional last argument \`counterclockwise\` defaults to \`false\`. When \`true\`, the arc sweeps in the counterclockwise direction between start and end angles.

\`\`\`js
function degToRad(deg) { return deg * Math.PI / 180; }
// Full circle: startAngle=0, endAngle=Math.PI*2
// Semicircle (right half): startAngle=-Math.PI/2, endAngle=Math.PI/2
// Pie slice (top quarter): startAngle=-Math.PI/2, endAngle=0
\`\`\``,
    },

    {
      type: 'js',
      instruction: `## Arc Variations

This cell demonstrates the full range of \`arc\` usage: full circles, semicircles, pie slices, and arc-only strokes (no fill).

Notice that:
- A full circle uses \`0, Math.PI * 2\` as the angle range
- For a top-pointing pie slice (like a clock hand starting at 12), offset the start by \`-Math.PI / 2\`
- When you \`stroke()\` an arc without \`fill()\`, you get just the curved line — useful for progress bars and gauges`,
      html: `<canvas id="canvas" width="580" height="300"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const TAU = Math.PI * 2;

// Full circle
ctx.beginPath();
ctx.arc(70, 120, 55, 0, TAU);
ctx.fillStyle = '#e94560';
ctx.fill();
ctx.fillStyle = '#475569';
ctx.font = '10px Courier New';
ctx.textAlign = 'center';
ctx.fillText('Full circle', 70, 196);

// Semicircle (bottom half)
ctx.beginPath();
ctx.arc(190, 120, 55, 0, Math.PI);
ctx.fillStyle = '#00d4ff';
ctx.fill();
ctx.fillText('Semicircle', 190, 196);

// Pie slice: top quarter (12 o'clock to 3 o'clock)
ctx.beginPath();
ctx.moveTo(310, 120); // move to center first
ctx.arc(310, 120, 55, -Math.PI / 2, 0);
ctx.closePath();
ctx.fillStyle = '#ffd700';
ctx.fill();
ctx.fillText('Quarter pie', 310, 196);

// Arc stroke only — progress ring
const cx = 430, cy = 120, r = 55;
// Background track
ctx.beginPath();
ctx.arc(cx, cy, r, 0, TAU);
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 8;
ctx.stroke();
// 70% progress arc, starting at top
ctx.beginPath();
ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * 0.7);
ctx.strokeStyle = '#4ade80';
ctx.lineWidth = 8;
ctx.lineCap = 'round';
ctx.stroke();
ctx.fillStyle = '#4ade80';
ctx.font = 'bold 14px Courier New';
ctx.fillText('70%', cx, cy + 5);
ctx.fillStyle = '#475569';
ctx.font = '10px Courier New';
ctx.fillText('Progress arc', cx, 196);

// Ellipse
ctx.beginPath();
ctx.ellipse(530, 120, 45, 25, 0, 0, TAU);
ctx.strokeStyle = '#a855f7';
ctx.lineWidth = 3;
ctx.stroke();
ctx.fillText('Ellipse', 530, 196);`,
      showPreviewByDefault: true,
      outputHeight: 340,
    },

    {
      type: 'markdown',
      instruction: `## arcTo — Rounded Corners

\`arcTo(x1, y1, x2, y2, radius)\` draws an arc tangent to two lines. Think of it as: "I'm at the current point heading toward (x1,y1), then turning toward (x2,y2). Round that corner with the given radius."

This is the correct way to draw rounded rectangles without \`roundRect\`, and it's how you add chamfers and fillets in CAD-style tools:

\`\`\`js
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);                       // top edge start
  ctx.arcTo(x + w, y,     x + w, y + h, r);  // top-right corner
  ctx.arcTo(x + w, y + h, x,     y + h, r);  // bottom-right corner
  ctx.arcTo(x,     y + h, x,     y,     r);  // bottom-left corner
  ctx.arcTo(x,     y,     x + w, y,     r);  // top-left corner
  ctx.closePath();
}
\`\`\`

The geometry: \`arcTo\` imagines two rays — (current point → p1) and (p1 → p2) — and inscribes a circle of the given radius tangent to both. It then draws the arc that connects the two tangent points.

**Important:** if the radius is too large for the available space, the browser reduces it. If p1 === current point or p1 === p2, no arc is drawn.`,
    },

    {
      type: 'js',
      instruction: `## arcTo in Action — Rounded Rects and Corner Fillets

This cell shows \`arcTo\` doing the work that \`roundRect\` does internally, plus a practical CAD use case: drawing a shape with mixed sharp and rounded corners.

The \`roundedRect\` function is the classic implementation you'll use constantly — it works in all browsers including older ones that don't support \`roundRect\`.`,
      html: `<canvas id="canvas" width="560" height="300"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Classic roundedRect helper using arcTo
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r); // top-right
  ctx.arcTo(x + w, y + h, x,     y + h, r); // bottom-right
  ctx.arcTo(x,     y + h, x,     y,     r); // bottom-left
  ctx.arcTo(x,     y,     x + w, y,     r); // top-left
  ctx.closePath();
}

// Uniform radius
roundedRect(ctx, 20, 30, 200, 120, 20);
ctx.fillStyle = '#e94560';
ctx.fill();

// Large radius (pill shape)
roundedRect(ctx, 250, 30, 200, 120, 60);
ctx.fillStyle = '#00d4ff';
ctx.fill();

// Mixed: sharp corners on top, rounded on bottom (UI card style)
ctx.beginPath();
ctx.moveTo(20, 195);             // top-left sharp
ctx.lineTo(220, 195);            // top-right sharp
ctx.arcTo(220, 285, 20, 285, 20);  // bottom-right rounded
ctx.arcTo(20,  285, 20, 195, 20);  // bottom-left rounded
ctx.closePath();
ctx.fillStyle = '#ffd700';
ctx.fill();

// Show the guide lines for the first shape
ctx.setLineDash([4, 4]);
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
// Show where the corner guide lines would be
ctx.beginPath();
ctx.rect(20, 30, 200, 120); // bounding box
ctx.stroke();
ctx.setLineDash([]);

ctx.fillStyle = '#475569';
ctx.font = '10px Courier New';
ctx.textAlign = 'center';
ctx.fillText('roundedRect r=20', 120, 168);
ctx.fillText('roundedRect r=60', 350, 168);
ctx.fillText('mixed corners', 120, 295);`,
      showPreviewByDefault: true,
      outputHeight: 340,
    },

    {
      type: 'markdown',
      instruction: `## Bézier Curves

Bézier curves are the foundation of all vector graphics. Every font, every smooth shape in Illustrator, every organic curve in CAD — they're all Bézier curves or splines composed of them.

### Quadratic Bézier — one control point

\`\`\`js
quadraticCurveTo(cpX, cpY, endX, endY)
// Current point is the start
// The curve is "pulled toward" the control point without passing through it
\`\`\`

The parametric formula at position \`t\` (0 = start, 1 = end):
\`\`\`
P(t) = (1-t)² × P0  +  2t(1-t) × CP  +  t² × P2
\`\`\`

### Cubic Bézier — two control points

\`\`\`js
bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY)
\`\`\`

The parametric formula:
\`\`\`
P(t) = (1-t)³×P0  +  3t(1-t)²×CP1  +  3t²(1-t)×CP2  +  t³×P3
\`\`\`

Two control points give much more expressive power. CP1 controls the tangent at the start; CP2 controls the tangent at the end. The curve leaves the start point heading toward CP1, and arrives at the end point coming from CP2.

**For CAD work**: Bézier curves are how you'll implement smooth tool paths, spline interpolation, and organic free-form shapes.`,
    },

    {
      type: 'js',
      instruction: `## Bézier Curve Visualizer

This interactive demo shows how control points shape both quadratic and cubic Bézier curves.

**Drag the colored control points** to reshape the curves in real time. The dashed lines are the "handles" — they show the tangent direction at each endpoint.

Points along the curves are colored by their \`t\` parameter (blue=0 → green=0.5 → red=1), so you can see how the curve parameter distributes.

Key observations:
- The curve is always tangent to the handle line at each endpoint
- Pulling CP1 up makes the start of the curve "launch" upward
- The curve always passes through P0 and P3 (never through the control points)`,
      html: `<div style="background:#1a1a2e; padding:16px">
  <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap">
    <div>
      <p style="color:var(--color-text-secondary, #475569); font:11px Courier New; margin-bottom:6px; text-align:center">Quadratic (1 CP) — drag yellow point</p>
      <canvas id="quad" width="360" height="280" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; cursor:crosshair; display:block"></canvas>
    </div>
    <div>
      <p style="color:var(--color-text-secondary, #475569); font:11px Courier New; margin-bottom:6px; text-align:center">Cubic (2 CPs) — drag yellow/pink points</p>
      <canvas id="cubic" width="360" height="280" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; cursor:crosshair; display:block"></canvas>
    </div>
  </div>
  <p id="info" style="color:var(--color-text-secondary, #475569); font:10px Courier New; text-align:center; margin-top:8px">Drag control points to reshape</p>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }`,
      startCode: `// ── Quadratic Bézier ──────────────────────────────────
const qc = document.getElementById('quad');
const qCtx = qc.getContext('2d');
const qPts = {
  p0:  { x: 40,  y: 240, color: '#4ade80', fixed: true, label: 'P0' },
  cp:  { x: 180, y: 30,  color: '#ffd700', fixed: false, label: 'CP' },
  p2:  { x: 320, y: 240, color: '#4ade80', fixed: true, label: 'P2' },
};

function drawQuad() {
  qCtx.clearRect(0, 0, 360, 280);
  // Guide lines
  qCtx.setLineDash([4, 4]);
  qCtx.strokeStyle = '#1e3a5f';
  qCtx.lineWidth = 1;
  ['p0','p2'].forEach(key => {
    qCtx.beginPath();
    qCtx.moveTo(qPts[key].x, qPts[key].y);
    qCtx.lineTo(qPts.cp.x, qPts.cp.y);
    qCtx.stroke();
  });
  qCtx.setLineDash([]);
  // Curve
  qCtx.beginPath();
  qCtx.moveTo(qPts.p0.x, qPts.p0.y);
  qCtx.quadraticCurveTo(qPts.cp.x, qPts.cp.y, qPts.p2.x, qPts.p2.y);
  qCtx.strokeStyle = '#00d4ff';
  qCtx.lineWidth = 3;
  qCtx.stroke();
  // t-parameter dots
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, t1 = 1 - t;
    const x = t1*t1*qPts.p0.x + 2*t1*t*qPts.cp.x + t*t*qPts.p2.x;
    const y = t1*t1*qPts.p0.y + 2*t1*t*qPts.cp.y + t*t*qPts.p2.y;
    qCtx.beginPath();
    qCtx.arc(x, y, 3, 0, Math.PI*2);
    qCtx.fillStyle = \`hsl(\${t*240}, 80%, 60%)\`;
    qCtx.fill();
  }
  // Points
  Object.values(qPts).forEach(p => {
    qCtx.beginPath();
    qCtx.arc(p.x, p.y, 8, 0, Math.PI*2);
    qCtx.fillStyle = p.color;
    qCtx.fill();
    qCtx.fillStyle = '#e2e8f0';
    qCtx.font = '11px Courier New';
    qCtx.fillText(p.label, p.x + 12, p.y + 4);
  });
}

// ── Cubic Bézier ───────────────────────────────────────
const cc = document.getElementById('cubic');
const cCtx = cc.getContext('2d');
const cPts = {
  p0:  { x: 40,  y: 240, color: '#4ade80', fixed: true, label: 'P0' },
  cp1: { x: 120, y: 40,  color: '#ffd700', fixed: false, label: 'CP1' },
  cp2: { x: 240, y: 260, color: '#ff69b4', fixed: false, label: 'CP2' },
  p3:  { x: 320, y: 60,  color: '#4ade80', fixed: true, label: 'P3' },
};

function drawCubic() {
  cCtx.clearRect(0, 0, 360, 280);
  // Guide lines
  cCtx.setLineDash([4, 4]);
  cCtx.strokeStyle = '#1e3a5f';
  cCtx.lineWidth = 1;
  cCtx.beginPath();
  cCtx.moveTo(cPts.p0.x, cPts.p0.y);
  cCtx.lineTo(cPts.cp1.x, cPts.cp1.y);
  cCtx.stroke();
  cCtx.beginPath();
  cCtx.moveTo(cPts.p3.x, cPts.p3.y);
  cCtx.lineTo(cPts.cp2.x, cPts.cp2.y);
  cCtx.stroke();
  cCtx.setLineDash([]);
  // Curve
  cCtx.beginPath();
  cCtx.moveTo(cPts.p0.x, cPts.p0.y);
  cCtx.bezierCurveTo(cPts.cp1.x, cPts.cp1.y, cPts.cp2.x, cPts.cp2.y, cPts.p3.x, cPts.p3.y);
  cCtx.strokeStyle = '#e94560';
  cCtx.lineWidth = 3;
  cCtx.stroke();
  // t dots
  for (let i = 0; i <= 10; i++) {
    const t = i/10, t1 = 1-t;
    const x = t1**3*cPts.p0.x + 3*t1**2*t*cPts.cp1.x + 3*t1*t**2*cPts.cp2.x + t**3*cPts.p3.x;
    const y = t1**3*cPts.p0.y + 3*t1**2*t*cPts.cp1.y + 3*t1*t**2*cPts.cp2.y + t**3*cPts.p3.y;
    cCtx.beginPath();
    cCtx.arc(x, y, 3, 0, Math.PI*2);
    cCtx.fillStyle = \`hsl(\${t*240}, 80%, 60%)\`;
    cCtx.fill();
  }
  // Points
  Object.values(cPts).forEach(p => {
    cCtx.beginPath();
    cCtx.arc(p.x, p.y, 8, 0, Math.PI*2);
    cCtx.fillStyle = p.color;
    cCtx.fill();
    cCtx.fillStyle = '#e2e8f0';
    cCtx.font = '11px Courier New';
    cCtx.fillText(p.label, p.x + 12, p.y + 4);
  });
}

// ── Drag handling ──────────────────────────────────────
function makeDraggable(canvas, pts, drawFn) {
  let dragging = null;
  function nearest(ex, ey) {
    const rect = canvas.getBoundingClientRect();
    const mx = ex - rect.left, my = ey - rect.top;
    for (const [key, p] of Object.entries(pts)) {
      if (p.fixed) continue;
      if (Math.hypot(p.x - mx, p.y - my) < 14) return key;
    }
    return null;
  }
  canvas.addEventListener('mousedown', e => { dragging = nearest(e.clientX, e.clientY); });
  canvas.addEventListener('mousemove', e => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    pts[dragging].x = e.clientX - rect.left;
    pts[dragging].y = e.clientY - rect.top;
    drawFn();
  });
  canvas.addEventListener('mouseup', () => { dragging = null; });
}

makeDraggable(qc, qPts, drawQuad);
makeDraggable(cc, cPts, drawCubic);
drawQuad();
drawCubic();`,
      showPreviewByDefault: true,
      outputHeight: 400,
    },

    {
      type: 'js',
      instruction: `## Practical Béziers — S-Curves and Smooth Paths

Two utility patterns you'll use constantly in real work:

**S-curve**: connects two points with a smooth S shape. The control points extend horizontally from each endpoint so the curve arrives and departs smoothly. Useful for connector lines in diagram editors and flow charts.

**Smooth multi-segment path**: each segment uses the reflection of the previous CP2 as the new CP1. This ensures \`C1\` continuity (the tangent is the same on both sides of each join point) — a smooth, seamless curve with no kinks.`,
      html: `<canvas id="canvas" width="580" height="300"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.lineCap = 'round';

// S-curve connector
function sCurve(ctx, x0, y0, x1, y1, color) {
  const dx = (x1 - x0) * 0.4;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(
    x0 + dx, y0,  // CP1: extend right from start
    x1 - dx, y1,  // CP2: extend left into end
    x1, y1
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

// Draw several S-curves
sCurve(ctx,  20, 60,  280, 240, '#e94560');
sCurve(ctx,  20, 150, 280, 150, '#ffd700');
sCurve(ctx,  20, 240, 280, 60,  '#4ade80');

// Labels
ctx.fillStyle = '#475569';
ctx.font = '10px Courier New';
ctx.fillText('S-curves (bezierCurveTo)', 20, 280);

// Smooth multi-segment spline
// Each new CP1 = reflection of previous CP2 across the join point
const pts = [
  { x: 310, y: 220 },
  { x: 390, y: 60  },
  { x: 470, y: 240 },
  { x: 550, y: 80  },
];

ctx.beginPath();
ctx.moveTo(pts[0].x, pts[0].y);

// Draw curve segments with automatically computed smooth control points
let prevCp2 = { x: pts[0].x, y: pts[0].y };
for (let i = 1; i < pts.length; i++) {
  const prev = pts[i - 1];
  const curr = pts[i];
  // CP1 = reflection of previous CP2 across prev
  const cp1 = { x: 2 * prev.x - prevCp2.x, y: 2 * prev.y - prevCp2.y };
  // CP2 = 1/3 of the way to next point (simple heuristic)
  const cp2 = { x: curr.x - (curr.x - prev.x) * 0.35, y: curr.y - (curr.y - prev.y) * 0.35 };
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, curr.x, curr.y);
  prevCp2 = cp2;
}
ctx.strokeStyle = '#00d4ff';
ctx.lineWidth = 3;
ctx.stroke();

// Mark the data points
pts.forEach((p, i) => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#00d4ff';
  ctx.fill();
});

ctx.fillStyle = '#475569';
ctx.fillText('Smooth multi-segment spline', 310, 280);`,
      showPreviewByDefault: true,
      outputHeight: 340,
    },

    {
      type: 'js',
      instruction: `## Challenge: Analog Clock

Build a working analog clock using \`arc\` and \`lineTo\`. The clock should:
- Draw a clock face (circle)
- Draw 12 hour tick marks at the right positions
- Draw hour, minute, and second hands that update every second
- Use \`setInterval\` or \`requestAnimationFrame\` to animate

**Hint for hand angles:** 12 o'clock is at \`-Math.PI / 2\` (the top). A full rotation is \`2 * Math.PI\`. The second hand angle is:
\`\`\`js
const seconds = new Date().getSeconds();
const angle = (seconds / 60) * Math.PI * 2 - Math.PI / 2;
\`\`\``,
      html: `<canvas id="canvas" width="400" height="400"></canvas>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
canvas { display: block; background: #16213e; border-radius: 50%; border: 1px solid #0f3460; }`,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const cx = W / 2, cy = H / 2, R = 180;

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Draw clock face
  // ...

  // Draw hour tick marks (12 of them)
  // ...

  // Get current time
  const now = new Date();
  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr  = (now.getHours() % 12) + min / 60;

  // Draw second hand
  // ...

  // Draw minute hand
  // ...

  // Draw hour hand
  // ...
}

setInterval(draw, 16);
draw();`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const cx = W / 2, cy = H / 2, R = 180;

function hand(angle, length, width, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 12);          // slight tail behind center
  ctx.lineTo(0, -length);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Face
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = '#16213e';
  ctx.fill();
  ctx.strokeStyle = '#0f3460';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Hour markers
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const inner = R - 22, outer = R - 8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  const now = new Date();
  const sec = now.getSeconds() + now.getMilliseconds() / 1000;
  const min = now.getMinutes() + sec / 60;
  const hr  = (now.getHours() % 12) + min / 60;

  hand((hr  / 12) * Math.PI * 2 - Math.PI / 2, R * 0.55, 7, '#e2e8f0');
  hand((min / 60) * Math.PI * 2 - Math.PI / 2, R * 0.80, 4, '#e2e8f0');
  hand((sec / 60) * Math.PI * 2 - Math.PI / 2, R * 0.88, 2, '#e94560');

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

setInterval(draw, 16);
draw();`,
      showPreviewByDefault: false,
      outputHeight: 440,
      type: 'challenge',
      check: (js) => {
        return js.includes('arc') &&
          js.includes('getSeconds') &&
          (js.includes('setInterval') || js.includes('requestAnimationFrame')) &&
          js.includes('clearRect');
      },
    },
  ],
};

export default {
  id: 'canvas-3-lines-arcs-bezier',
  slug: 'canvas-lines-arcs-bezier',
  chapter: 'canvas.1',
  order: 2,
  title: 'Lines, Arcs, and Bézier Curves',
  subtitle: 'arc, arcTo, ellipse, quadratic and cubic Bézier curves — everything you need for smooth geometry.',
  tags: ['canvas', 'arc', 'arcTo', 'ellipse', 'bezier', 'quadraticCurveTo', 'bezierCurveTo', 'curves'],

  hook: {
    question: 'Every smooth curve you see in a vector editor, font renderer, or CAD tool is a Bézier curve. What is the mathematical structure that makes any smooth shape possible?',
    realWorldContext:
      'The `arc` method handles circles and circular arcs — clocks, progress rings, pie charts, rounded corners. ' +
      'But for organic curves, tool paths, and splines, you need Bézier curves: `quadraticCurveTo` (one control point) and `bezierCurveTo` (two control points). ' +
      'Every font glyph is a series of cubic Bézier segments. ' +
      'Every smooth path in Illustrator, Figma, or a CAD tool is a cubic spline. ' +
      'Mastering these methods means you can draw any smooth shape describable by mathematics.',
    previewVisualizationId: 'JSNotebook',
    previewVisualizationProps: { lesson: LESSON_CANVAS_3 },
  },

  intuition: {
    prose: [
      '**arc(x, y, r, startAngle, endAngle)** — angles are in radians, clockwise from 3 o\'clock. A full circle is `0` to `Math.PI * 2`. The top of a clock face starts at `-Math.PI / 2`. Remember: `degToRad(deg) = deg * Math.PI / 180`.',
      '**arcTo(x1, y1, x2, y2, r)** — draws an arc tangent to two imagined lines. The classic use case is rounded corners in `roundedRect`. It\'s more reliable than computing arc center/angles manually.',
      '**Bézier curves** — the control points don\'t sit on the curve; they pull it. CP1 controls the tangent direction at the start; CP2 controls it at the end. For smooth multi-segment splines, reflect each CP2 across the join point to compute the next CP1.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Canvas arc angles are clockwise, not counterclockwise',
        body: 'In standard math, angles go counterclockwise from the positive X axis. In Canvas, they go clockwise. This means 90° (Math.PI/2) points DOWN, not up. For clock-style angles, start at -Math.PI/2 (the top of the circle) and add the fraction of the full rotation.',
      },
      {
        type: 'insight',
        title: 'The Bézier constant: k = 0.5523',
        body: 'You cannot draw a perfect circle with Bézier curves, but you can approximate one extremely closely. Four cubic Bézier segments with control points at distance `r * 0.5523` from each endpoint give an approximation accurate to within 0.03%. This is how SVG paths and font outlines represent circles.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Canvas Lesson 3 — Lines, Arcs, and Bézier Curves',
        props: { lesson: LESSON_CANVAS_3 },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'In Canvas, what angle (in radians) points to the TOP of the screen?',
      options: [
        '0 — that is the starting angle',
        '-Math.PI / 2 — because Y goes down, so the top is a negative angle',
        'Math.PI / 2 — 90 degrees always points up',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What does `quadraticCurveTo(cpX, cpY, endX, endY)` do with the control point?',
      options: [
        'The curve passes through the control point at t=0.5',
        'The curve is pulled toward the control point without passing through it',
        'The control point sets the tangent angle only at the start of the curve',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: '`arcTo(x1, y1, x2, y2, r)` — what does (x1, y1) represent?',
      options: [
        'The center of the arc',
        'The corner point where two imagined tangent lines meet',
        'The endpoint of the arc',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'For a smooth spline through multiple points with no kinks at joins, what is the relationship between a segment\'s CP2 and the next segment\'s CP1?',
      options: [
        'CP1 of the next segment equals CP2 of the previous segment',
        'CP1 of the next segment is the reflection of CP2 across the join point',
        'Both control points are always placed at the midpoints between data points',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'arc angles are in radians, clockwise from 3 o\'clock. Top = -π/2. Full circle = 2π. degToRad = deg * π / 180.',
    'arcTo is for rounded corners: moveTo a point on the edge, then arcTo the corner (x1,y1) and the next point (x2,y2).',
    'Quadratic Bézier: one control point pulls the curve. Cubic: two control points — one controls departure, one controls arrival.',
    'Bézier formula at t: P(t) = weighted sum of P0, CP(s), P3 with weights (1-t)³, 3t(1-t)², 3t²(1-t), t³.',
    'Smooth spline joins: reflect each CP2 across the join point to get the next CP1 — this ensures C1 continuity.',
    'The Bézier constant k=0.5523: use it to approximate a circle with 4 cubic segments when arc() isn\'t available.',
  ],

  checkpoints: ['read-intuition'],
};
