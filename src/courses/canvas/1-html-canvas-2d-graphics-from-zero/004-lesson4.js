const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  canvas { display: block; background: #16213e; border: 1px solid #0f3460; border-radius: 4px; }
`;

const LESSON_CANVAS_4 = {
  title: 'Colors, Gradients, Patterns, and Stroke Styles',
  subtitle: 'fillStyle, strokeStyle, gradients, patterns, lineCap, lineJoin, and dashed lines.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## Color in Canvas

\`fillStyle\` and \`strokeStyle\` accept any CSS color string. The most useful formats:

\`\`\`js
ctx.fillStyle = '#e94560';              // hex
ctx.fillStyle = '#e9456080';            // hex with alpha (last 2 digits)
ctx.fillStyle = 'rgba(233, 69, 96, 0.5)'; // rgba — alpha 0.0–1.0
ctx.fillStyle = 'hsl(348, 80%, 59%)';  // hsl
ctx.fillStyle = 'transparent';         // fully transparent
\`\`\`

**HSL is the most useful for programmatic color work.** Hue (0–360) is a color wheel position, Saturation (0–100%) is intensity, Lightness (0–100%) goes from black to white. When you need N evenly-spaced distinct colors:

\`\`\`js
function nColors(n) {
  return Array.from({ length: n }, (_, i) =>
    \`hsl(\${(i / n) * 360}, 75%, 55%)\`
  );
}
\`\`\`

**globalAlpha** applies a universal opacity multiplier on top of everything:
\`\`\`js
ctx.globalAlpha = 0.5; // all drawing is 50% transparent until reset
ctx.globalAlpha = 1.0; // restore full opacity
\`\`\``,
    },

    {
      type: 'js',
      instruction: `## Color Showcase — RGB, HSL, and Alpha

This cell demonstrates the three most useful color spaces side by side: a hue strip (HSL), a lightness ramp, and an alpha ramp. These are the building blocks for every color-coded visualization, heatmap, or gradient system you'll build.`,
      html: `<canvas id="canvas" width="560" height="320"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;

// Hue strip (full rainbow)
for (let i = 0; i < 360; i++) {
  const x = 20 + i * (520 / 360);
  ctx.fillStyle = \`hsl(\${i}, 85%, 55%)\`;
  ctx.fillRect(x, 20, (520 / 360) + 1, 50);
}
ctx.fillStyle = '#475569';
ctx.font = '11px Courier New';
ctx.fillText('HSL hue (0–360°)', 20, 88);

// Lightness ramp (hue fixed at 220 = blue)
for (let i = 0; i <= 100; i++) {
  const x = 20 + i * (520 / 100);
  ctx.fillStyle = \`hsl(220, 80%, \${i}%)\`;
  ctx.fillRect(x, 100, (520 / 100) + 1, 50);
}
ctx.fillStyle = '#475569';
ctx.fillText('Lightness ramp  (0% = black → 100% = white)', 20, 168);

// Alpha ramp (red at varying opacity over dark background)
ctx.fillStyle = '#0f1e3a';
ctx.fillRect(20, 180, 520, 50);
for (let i = 0; i <= 100; i++) {
  const x = 20 + i * (520 / 100);
  ctx.fillStyle = \`rgba(233, 69, 96, \${i / 100})\`;
  ctx.fillRect(x, 180, (520 / 100) + 1, 50);
}
ctx.fillStyle = '#475569';
ctx.fillText('Alpha ramp  rgba(233,69,96, 0→1)', 20, 248);

// globalAlpha demo
ctx.fillStyle = '#e94560';
ctx.fillRect(20, 260, 80, 40);
ctx.globalAlpha = 0.5;
ctx.fillStyle = '#00d4ff';
ctx.fillRect(60, 260, 80, 40);
ctx.globalAlpha = 1.0; // always reset!
ctx.fillStyle = '#475569';
ctx.fillText('globalAlpha=0.5 overlap', 160, 286);`,
      showPreviewByDefault: true,
      outputHeight: 360,
    },

    {
      type: 'js',
      instruction: `## Linear, Radial, and Conic Gradients

Gradients are objects — you create them, add color stops, then assign them to \`fillStyle\` or \`strokeStyle\`.

**Important:** gradient coordinates are in canvas space, not relative to the shape. If you draw a gradient rectangle at (200, 200), define the gradient relative to that region or it won't look right.

\`\`\`js
// Linear: from point A to point B
const g = ctx.createLinearGradient(x0, y0, x1, y1);
g.addColorStop(0, 'red');   // t=0: start color
g.addColorStop(1, 'blue');  // t=1: end color
ctx.fillStyle = g;

// Radial: between two circles (usually concentric)
const r = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);

// Conic: sweeps around a center point (color wheel style)
const c = ctx.createConicGradient(startAngle, cx, cy);
\`\`\``,
      html: `<div style="display:flex; flex-wrap:wrap; gap:16px; padding:20px; background:#1a1a2e; min-height:100vh; justify-content:center; align-items:flex-start">
  <div>
    <canvas id="g1" width="240" height="200" style="display:block; background:#16213e; border:1px solid #1e3a5f; border-radius:4px"></canvas>
    <p style="color:var(--color-text-secondary, #475569); font:11px Courier New; margin-top:6px; text-align:center">Linear gradient</p>
  </div>
  <div>
    <canvas id="g2" width="240" height="200" style="display:block; background:#16213e; border:1px solid #1e3a5f; border-radius:4px"></canvas>
    <p style="color:var(--color-text-secondary, #475569); font:11px Courier New; margin-top:6px; text-align:center">Radial gradient</p>
  </div>
  <div>
    <canvas id="g3" width="240" height="200" style="display:block; background:#16213e; border:1px solid #1e3a5f; border-radius:4px"></canvas>
    <p style="color:var(--color-text-secondary, #475569); font:11px Courier New; margin-top:6px; text-align:center">Conic gradient + on a path</p>
  </div>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }`,
      startCode: `// Linear gradient
{
  const ctx = document.getElementById('g1').getContext('2d');
  // Gradient runs left to right across the rect region
  const g = ctx.createLinearGradient(20, 0, 220, 0);
  g.addColorStop(0,    '#e94560');
  g.addColorStop(0.33, '#9b59b6');
  g.addColorStop(0.66, '#3498db');
  g.addColorStop(1,    '#4ade80');
  ctx.fillStyle = g;
  ctx.fillRect(20, 20, 200, 80);

  // Diagonal gradient on a custom path
  const g2 = ctx.createLinearGradient(20, 120, 220, 190);
  g2.addColorStop(0, '#ffd700');
  g2.addColorStop(1, '#00d4ff');
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.moveTo(120, 120);
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? 65 : 28;
    ctx.lineTo(120 + Math.cos(a) * r, 158 + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

// Radial gradient
{
  const ctx = document.getElementById('g2').getContext('2d');
  // Glow effect: inner white → outer dark
  const g = ctx.createRadialGradient(120, 100, 5, 120, 100, 90);
  g.addColorStop(0,   '#ffffff');
  g.addColorStop(0.2, '#ffd700');
  g.addColorStop(0.7, '#e94560');
  g.addColorStop(1,   'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(120, 100, 90, 0, Math.PI * 2);
  ctx.fill();

  // Off-center radial (spotlight effect)
  const g2 = ctx.createRadialGradient(170, 40, 0, 120, 100, 100);
  g2.addColorStop(0, 'rgba(255,255,255,0.3)');
  g2.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(120, 100, 90, 0, Math.PI * 2);
  ctx.fill();
}

// Conic gradient
{
  const ctx = document.getElementById('g3').getContext('2d');
  const colors = ['#e94560','#ff9f43','#ffd700','#4ade80','#00d4ff','#9b59b6','#e94560'];
  const g = ctx.createConicGradient(-Math.PI / 2, 80, 90);
  colors.forEach((c, i) => g.addColorStop(i / (colors.length - 1), c));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(80, 90, 70, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring cutout
  ctx.fillStyle = '#16213e';
  ctx.beginPath();
  ctx.arc(80, 90, 30, 0, Math.PI * 2);
  ctx.fill();

  // Dot pattern using a procedural offscreen canvas
  const pat = document.createElement('canvas');
  pat.width = 14; pat.height = 14;
  const pc = pat.getContext('2d');
  pc.fillStyle = '#0f3460';
  pc.fillRect(0, 0, 14, 14);
  pc.fillStyle = '#e94560';
  pc.beginPath();
  pc.arc(7, 7, 3, 0, Math.PI * 2);
  pc.fill();
  ctx.fillStyle = ctx.createPattern(pat, 'repeat');
  ctx.fillRect(165, 20, 70, 160);
  ctx.fillStyle = '#475569';
  ctx.font = '10px Courier New';
  ctx.fillText('Pattern', 178, 195);
}`,
      showPreviewByDefault: true,
      outputHeight: 310,
    },

    {
      type: 'markdown',
      instruction: `## Stroke Styles — lineCap, lineJoin, Dashed Lines

Beyond \`strokeStyle\` and \`lineWidth\`, three properties control the appearance of stroked lines:

### lineCap — the ends of open strokes

| Value | Effect |
|---|---|
| \`'butt'\` (default) | Line ends exactly at the endpoint |
| \`'round'\` | Semicircular cap — extends half \`lineWidth\` beyond |
| \`'square'\` | Square cap — same extension as round, but flat |

### lineJoin — corners where two segments meet

| Value | Effect |
|---|---|
| \`'miter'\` (default) | Sharp point — can extend very far on acute angles |
| \`'round'\` | Rounded corner |
| \`'bevel'\` | Flattened corner |

\`miterLimit\` (default 10) cuts off miter joins when the spike gets too long relative to \`lineWidth\`. Set it lower for very sharp angles.

### setLineDash — dashed and dotted lines

\`\`\`js
ctx.setLineDash([10, 5]);       // 10px dash, 5px gap
ctx.setLineDash([2, 6]);        // small dots
ctx.setLineDash([20,5,5,5]);    // long dash, dot pattern
ctx.setLineDash([]);            // solid (clear pattern)
ctx.lineDashOffset = -offset;   // animating: "marching ants" effect
\`\`\`

Animating \`lineDashOffset\` over time creates the "marching ants" selection effect used in every image editor.`,
    },

    {
      type: 'js',
      instruction: `## Stroke Style Reference

All three stroke properties side by side, plus an animated marching ants demo showing why \`lineDashOffset\` matters for selection UI.`,
      html: `<canvas id="canvas" width="600" height="480"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const label = (t, x, y) => {
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Courier New';
  ctx.textAlign = 'left';
  ctx.fillText(t, x, y);
};

// lineCap comparison
label('lineCap:', 20, 22);
['butt','round','square'].forEach((cap, i) => {
  const y = 38 + i * 30;
  ctx.beginPath();
  ctx.moveTo(80, y);
  ctx.lineTo(240, y);
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 18;
  ctx.lineCap = cap;
  ctx.stroke();
  // Show exact endpoints in red
  [80, 240].forEach(x => {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#e94560';
    ctx.fill();
  });
  label(cap, 250, y + 4);
});

// lineJoin comparison
label('lineJoin:', 20, 145);
['miter','round','bevel'].forEach((join, i) => {
  const ox = 20 + i * 100, oy = 220;
  ctx.beginPath();
  ctx.moveTo(ox + 10, oy);
  ctx.lineTo(ox + 50, oy - 55);
  ctx.lineTo(ox + 90, oy);
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 14;
  ctx.lineJoin = join;
  ctx.stroke();
  label(join, ox + 8, oy + 18);
});

// Dash patterns
label('setLineDash:', 340, 22);
const patterns = [
  [[], 'solid (no dashes)'],
  [[10, 5], '[10, 5]'],
  [[5, 5], '[5, 5]'],
  [[20, 4, 4, 4], '[20,4,4,4]'],
  [[2, 8], '[2, 8]  dots'],
  [[15, 5, 5, 5, 5, 5], '[15,5,5,5,5,5]'],
];
patterns.forEach(([dash, name], i) => {
  const y = 42 + i * 38;
  ctx.beginPath();
  ctx.moveTo(340, y);
  ctx.lineTo(590, y);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2.5;
  ctx.setLineDash(dash);
  ctx.lineCap = 'butt';
  ctx.stroke();
  ctx.setLineDash([]);
  label(name, 340, y + 14);
});

// Marching ants animation
label('Marching ants selection:', 20, 265);
let offset = 0;
function animate() {
  ctx.clearRect(20, 275, 290, 80);
  ctx.setLineDash([10, 10]);
  ctx.lineDashOffset = offset;
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 280, 270, 65);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(233,69,96,0.08)';
  ctx.fillRect(30, 280, 270, 65);
  ctx.fillStyle = '#64748b';
  ctx.font = '12px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('Selected region', 165, 317);
  ctx.textAlign = 'left';
  offset = (offset - 0.5) % 20;
  requestAnimationFrame(animate);
}
animate();`,
      showPreviewByDefault: true,
      outputHeight: 520,
    },

    {
      type: 'js',
      instruction: `## Challenge: HSL Color Wheel

Draw a color wheel using the conic gradient, then draw a smaller grey circle in the center to create a ring effect. Around the outer edge, draw 12 tick marks at each hour position.

**Bonus:** Add a white dot that shows where hue=0 (red, at the right, 3 o'clock position).`,
      html: `<canvas id="canvas" width="400" height="400"></canvas>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
canvas { display: block; background: #16213e; border-radius: 50%; border: 1px solid #0f3460; }`,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cx = 200, cy = 200, R = 180;

// Draw a color wheel here
// Hint: createConicGradient(startAngle, cx, cy)
// Start at -Math.PI/2 so red (hue=0) is at the top
`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cx = 200, cy = 200, R = 180;

// Conic gradient color wheel — hue goes 0→360 around the circle
const g = ctx.createConicGradient(-Math.PI / 2, cx, cy);
for (let h = 0; h <= 360; h += 10) {
  g.addColorStop(h / 360, \`hsl(\${h}, 90%, 55%)\`);
}
ctx.fillStyle = g;
ctx.beginPath();
ctx.arc(cx, cy, R, 0, Math.PI * 2);
ctx.fill();

// Grey center ring (lighter inner circle removes the center)
ctx.fillStyle = '#1e293b';
ctx.beginPath();
ctx.arc(cx, cy, R * 0.45, 0, Math.PI * 2);
ctx.fill();

// Tick marks at each hour (12 positions)
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
  const inner = R - 18, outer = R - 4;
  ctx.beginPath();
  ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
  ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// White dot at hue=0 (red) — right side (3 o'clock)
ctx.beginPath();
ctx.arc(cx + R * 0.72, cy, 6, 0, Math.PI * 2);
ctx.fillStyle = '#fff';
ctx.fill();`,
      showPreviewByDefault: false,
      outputHeight: 440,
      type: 'challenge',
      check: (js) => {
        return (js.includes('createConicGradient') || js.includes('hsl')) &&
          js.includes('arc') &&
          js.includes('fill');
      },
    },
  ],
};

export default {
  id: 'canvas-4-colors-gradients-strokes',
  slug: 'canvas-colors-gradients-strokes',
  chapter: 'canvas.1',
  order: 3,
  title: 'Colors, Gradients, and Stroke Styles',
  subtitle: 'RGB, HSL, alpha, linear/radial/conic gradients, tiled patterns, lineCap, lineJoin, and dashed lines.',
  tags: ['canvas', 'fillStyle', 'strokeStyle', 'gradient', 'hsl', 'pattern', 'lineCap', 'lineJoin', 'setLineDash'],

  hook: {
    question: 'How do data visualizations map numbers to color, and how do CAD tools draw precise technical lines with dashes, caps, and joins that look like engineering drawings?',
    realWorldContext:
      'Color and stroke style are where Canvas goes from "it draws shapes" to "it draws professional graphics." ' +
      'HSL gradients are how heatmaps, spectrum analyzers, and data plots map values to visual color. ' +
      'Linear gradients on paths are how UI renderers give buttons depth. ' +
      'Animated `lineDashOffset` is the "marching ants" selection border in Photoshop. ' +
      'Technical CAD drawings require exact lineCap and lineJoin settings to match drafting standards.',
    previewVisualizationId: 'JSNotebook',
    previewVisualizationProps: { lesson: LESSON_CANVAS_4 },
  },

  intuition: {
    prose: [
      '**HSL is your friend for programmatic color.** Hue 0–360 is the color wheel. Saturation controls vividness. Lightness goes from black (0%) to white (100%). To generate N evenly-spaced colors: `hsl(${(i/n)*360}, 75%, 55%)`.',
      '**Gradients live in canvas space, not shape space.** If you create a linear gradient from (0,0) to (400,0) and draw a rect at (200, 200), only part of the gradient will fall inside the rect. Define gradient endpoints relative to the region you\'re filling.',
      '**Stroke style trivia that matters:** `lineCap` extends past endpoints (`butt`/`round`/`square`). `lineJoin` controls corners (`miter`/`round`/`bevel`). `setLineDash([])` clears dash patterns — always clear after drawing dashed shapes or subsequent solid lines will be dashed too.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Always reset globalAlpha and setLineDash after use',
        body: 'Context state is sticky. If you set `globalAlpha = 0.5` to draw a semi-transparent overlay, everything drawn afterward will also be 50% transparent until you set it back to 1.0. Same with `setLineDash([...])` — always call `setLineDash([])` when done with dashes.',
      },
      {
        type: 'insight',
        title: 'Patterns use an offscreen canvas as the tile source',
        body: 'You can draw anything on a small offscreen canvas, then use `ctx.createPattern(offscreen, "repeat")` to tile that drawing across any shape. This is how you create grid backgrounds, hatching fills, custom textures, and other procedural patterns.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Canvas Lesson 4 — Colors, Gradients, and Stroke Styles',
        props: { lesson: LESSON_CANVAS_4 },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'You want to generate 8 evenly-spaced distinct colors for a chart. Which color format makes this easiest?',
      options: [
        'Hex — you have a fixed palette of 8 hex codes',
        'HSL — you step the hue by 360/8 = 45 degrees each time',
        'RGB — you interpolate between red (255,0,0) and blue (0,0,255)',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You set `ctx.setLineDash([10, 5])` to draw a dashed border, then draw solid shapes afterward. What will happen?',
      options: [
        'The dash pattern only applies to the next stroke() call, then resets automatically',
        'All subsequent strokes will also be dashed until you call setLineDash([])',
        'The solid shapes cancel out the dash pattern for the whole canvas',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You create a linear gradient from (0, 0) to (200, 0) and use it to fill a rectangle at position (300, 100). What will the rectangle look like?',
      options: [
        'The full gradient from left to right inside the rectangle',
        'A solid color — the gradient has already ended before position 300',
        'The gradient repeats inside the rectangle',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The `lineCap = "round"` setting makes lines look:',
      options: [
        'Exactly like "butt" but with anti-aliasing applied',
        'Extended beyond the endpoint by a semicircular cap of radius = lineWidth/2',
        'Rounded only at corners where two lines meet',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'HSL for programmatic color: hue=color wheel, saturation=vividness, lightness=dark→light. Step hue by 360/n for n distinct colors.',
    'Gradients are canvas-space objects — define their endpoints relative to the region being filled.',
    'createPattern(offscreen, "repeat") tiles any canvas drawing as a fill or stroke texture.',
    'lineCap controls endpoints (butt/round/square). lineJoin controls corners (miter/round/bevel).',
    'setLineDash([]) clears dash patterns. lineDashOffset animated = marching ants selection effect.',
    'Always reset globalAlpha=1.0 and setLineDash([]) after using them — state is sticky.',
  ],

  checkpoints: ['read-intuition'],
};
