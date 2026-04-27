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

const LESSON_CANVAS_2 = {
  title: 'Rectangles and Paths',
  subtitle: 'The three rect methods, the path model, and building any shape.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## Rectangles — The Only Shortcut

Rectangles are the **only shape** Canvas provides as a direct, path-free operation. Every other shape requires a path. There are exactly three rect methods:

| Method | What it does |
|---|---|
| \`fillRect(x, y, w, h)\` | Fills a solid rectangle using \`fillStyle\` |
| \`strokeRect(x, y, w, h)\` | Draws only the outline using \`strokeStyle\` |
| \`clearRect(x, y, w, h)\` | Erases pixels back to transparent |

All four parameters use the same signature: \`x, y\` is the **top-left corner**, \`w\` and \`h\` are width and height.

\`clearRect\` is the most important for animation — you call \`ctx.clearRect(0, 0, W, H)\` at the start of every frame to wipe the canvas before redrawing. Without it, each frame draws on top of the last.

**Negative dimensions** work and are occasionally useful. \`fillRect(300, 250, -200, -150)\` is identical to \`fillRect(100, 100, 200, 150)\` — it just starts from the opposite corner. This matters for rubber-band selection tools where you compute a rect from two arbitrary mouse positions.`,
    },

    {
      type: 'js',
      instruction: `## fillRect, strokeRect, clearRect

Run this cell to see all three methods in action.

Notice how \`clearRect\` punches a transparent hole through the green rectangle — this is exactly how you'd erase part of a drawing, or create a window effect.

Experiment: change the \`fillStyle\` to \`'rgba(233, 69, 96, 0.4)'\` on the first rect and see how transparency stacks.`,
      html: `<canvas id="canvas" width="600" height="300"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// --- fillRect ---
ctx.fillStyle = '#e94560';
ctx.fillRect(30, 70, 150, 130);

// Semi-transparent fill overlapping the first rect
ctx.fillStyle = 'rgba(233, 69, 96, 0.4)';
ctx.fillRect(100, 40, 150, 130);

// --- strokeRect ---
ctx.strokeStyle = '#00d4ff';
ctx.lineWidth = 2;
ctx.strokeRect(290, 70, 140, 130);

ctx.strokeStyle = '#ffd700';
ctx.lineWidth = 5;
ctx.strokeRect(360, 40, 140, 130);

// --- clearRect: punch a hole ---
ctx.fillStyle = '#4ade80';
ctx.fillRect(510, 30, 70, 210);
ctx.clearRect(522, 55, 46, 160);  // erase a rectangle inside it

// Labels
ctx.fillStyle = '#64748b';
ctx.font = '11px Courier New';
ctx.fillText('fillRect', 30, 220);
ctx.fillText('(with opacity)', 30, 233);
ctx.fillText('strokeRect', 290, 220);
ctx.fillText('clearRect', 508, 258);
ctx.fillText('(hole punched)', 494, 271);`,
      showPreviewByDefault: true,
      outputHeight: 340,
    },

    {
      type: 'js',
      instruction: `## Rounded Rectangles

Modern browsers support \`roundRect\` as a path method. The radius argument can be:
- A **number** — same radius for all corners
- An **array** — \`[topLeft, topRight, bottomRight, bottomLeft]\`

\`roundRect\` doesn't draw by itself — you still call \`fill()\` or \`stroke()\` after it.

For browsers that don't support \`roundRect\`, you implement it manually using \`arcTo\` (covered in lesson 3). Run the cell and try changing the corner radii.`,
      html: `<canvas id="canvas" width="560" height="280"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Uniform radius — all corners the same
ctx.beginPath();
ctx.roundRect(30, 30, 200, 100, 20);
ctx.fillStyle = '#e94560';
ctx.fill();

// Different radius per corner: [topLeft, topRight, bottomRight, bottomLeft]
ctx.beginPath();
ctx.roundRect(260, 30, 200, 100, [0, 40, 0, 40]);
ctx.fillStyle = '#00d4ff';
ctx.fill();

// Stroke-only rounded rect
ctx.beginPath();
ctx.roundRect(30, 160, 200, 90, 12);
ctx.strokeStyle = '#ffd700';
ctx.lineWidth = 3;
ctx.stroke();

// Fill AND stroke
ctx.beginPath();
ctx.roundRect(260, 160, 200, 90, [30, 8, 30, 8]);
ctx.fillStyle = 'rgba(74, 222, 128, 0.2)';
ctx.fill();
ctx.strokeStyle = '#4ade80';
ctx.lineWidth = 2;
ctx.stroke();

ctx.fillStyle = '#475569';
ctx.font = '11px Courier New';
ctx.fillText('roundRect(x,y,w,h, 20)', 32, 148);
ctx.fillText('roundRect(x,y,w,h, [0,40,0,40])', 262, 148);`,
      showPreviewByDefault: true,
      outputHeight: 320,
    },

    {
      type: 'markdown',
      instruction: `## Paths — The Heart of Canvas

Everything interesting in Canvas beyond rectangles is built using **paths**. A path is a sequence of points and segments you describe, then either fill or stroke (or both).

Think of it like instructing someone with a pen held over paper:

\`\`\`
1. beginPath()     — start fresh, clear any previous path
2. moveTo(x, y)    — lift the pen, move to starting position
3. lineTo / arc / bezierCurveTo / ...  — draw to next points
4. closePath()     — optional: draw a straight line back to start
5. fill()          — paint the interior
   stroke()        — draw the outline
\`\`\`

**The critical rule:** always call \`beginPath()\` before starting a new shape. Without it, new segments are added to the previous path, causing hard-to-debug visual artifacts where old segments unexpectedly get filled or stroked.

### fill() vs stroke() vs both

You can call both \`fill()\` and \`stroke()\` on the same path. Fill paints the interior; stroke draws the outline. Order matters: if you fill then stroke, the stroke is drawn on top of the fill. The stroke is centered on the path edge, so half of it lands inside and half outside the fill area.`,
    },

    {
      type: 'js',
      instruction: `## Building Shapes with Paths

This cell demonstrates the four fundamental path examples: a triangle, a star, a hexagon, and an open zigzag path.

Study the **star** carefully — it builds a 5-pointed star by alternating between outer and inner radii using trigonometry. This pattern (iterate from 0 to N, compute angle, use \`moveTo\`/\`lineTo\`) works for any regular polygon or star.

The **open path** shows what happens when you call \`fill()\` without \`closePath()\` — Canvas imagines a straight line from the last point to the first and fills the implied area.`,
      html: `<div style="display:flex; flex-wrap:wrap; gap:16px; padding:16px; background:#1a1a2e; min-height:100vh; align-items:flex-start; justify-content:center">
  <div style="text-align:center">
    <canvas id="c1" width="190" height="190" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; display:block"></canvas>
    <p style="color:#64748b; font:11px Courier New; margin-top:6px">Triangle</p>
  </div>
  <div style="text-align:center">
    <canvas id="c2" width="190" height="190" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; display:block"></canvas>
    <p style="color:#64748b; font:11px Courier New; margin-top:6px">Star</p>
  </div>
  <div style="text-align:center">
    <canvas id="c3" width="190" height="190" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; display:block"></canvas>
    <p style="color:#64748b; font:11px Courier New; margin-top:6px">Hexagon (fill + stroke)</p>
  </div>
  <div style="text-align:center">
    <canvas id="c4" width="190" height="190" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; display:block"></canvas>
    <p style="color:#64748b; font:11px Courier New; margin-top:6px">Open path (no closePath)</p>
  </div>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }`,
      startCode: `// Triangle
{
  const ctx = document.getElementById('c1').getContext('2d');
  ctx.beginPath();
  ctx.moveTo(95, 18);   // top
  ctx.lineTo(175, 172); // bottom right
  ctx.lineTo(15, 172);  // bottom left
  ctx.closePath();      // line back to top

  ctx.fillStyle = '#e94560';
  ctx.fill();
  ctx.strokeStyle = '#ff8fa3';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// Star (5-pointed)
{
  const ctx = document.getElementById('c2').getContext('2d');
  const cx = 95, cy = 95, outerR = 78, innerR = 32;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    // Start at top (-Math.PI/2) and step by (2π / 10) each point
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd700';
  ctx.fill();
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Hexagon
{
  const ctx = document.getElementById('c3').getContext('2d');
  const cx = 95, cy = 95, r = 72;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6; // flat-top orientation
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
  ctx.fill();
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 3;
  ctx.stroke();
}

// Open path (no closePath)
{
  const ctx = document.getElementById('c4').getContext('2d');
  ctx.beginPath();
  ctx.moveTo(18, 95);
  ctx.lineTo(55, 35);
  ctx.lineTo(95, 145);
  ctx.lineTo(135, 35);
  ctx.lineTo(172, 95);
  // No closePath — stays open
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();
  // fill() on an open path: Canvas imagines closing the path for fill purposes
  ctx.fillStyle = 'rgba(74, 222, 128, 0.12)';
  ctx.fill();
}`,
      showPreviewByDefault: true,
      outputHeight: 280,
    },

    {
      type: 'js',
      instruction: `## Subpaths and Fill Rules

A single \`beginPath()\` call can contain **multiple subpaths** — just call \`moveTo\` again to start a new subpath without ending the path. All subpaths get filled or stroked together.

This enables the **fill rules**:

- \`fill('nonzero')\` — the default. A region is filled if, tracing a ray outward, the path crosses it more left-to-right than right-to-left.
- \`fill('evenodd')\` — a region is filled if a ray crosses the path boundary an odd number of times. This **automatically creates holes** where shapes overlap.

The donut shape below is a single \`beginPath\` with two arc subpaths. With \`nonzero\` (default), it fills completely. With \`evenodd\`, the inner circle becomes a hole.`,
      html: `<div style="display:flex; gap:32px; padding:24px; background:#1a1a2e; min-height:100vh; justify-content:center; align-items:center; flex-wrap:wrap">
  <div style="text-align:center">
    <canvas id="d1" width="200" height="200" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; display:block"></canvas>
    <p style="color:#64748b; font:11px Courier New; margin-top:6px">fill() — nonzero (default)</p>
  </div>
  <div style="text-align:center">
    <canvas id="d2" width="200" height="200" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; display:block"></canvas>
    <p style="color:#64748b; font:11px Courier New; margin-top:6px">fill('evenodd') — hole appears</p>
  </div>
  <div style="text-align:center">
    <canvas id="d3" width="200" height="200" style="background:#16213e; border:1px solid #1e3a5f; border-radius:4px; display:block"></canvas>
    <p style="color:#64748b; font:11px Courier New; margin-top:6px">evenodd with 3 rings</p>
  </div>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }`,
      startCode: `// nonzero: outer + inner circle both filled
{
  const ctx = document.getElementById('d1').getContext('2d');
  ctx.beginPath();
  ctx.arc(100, 100, 80, 0, Math.PI * 2); // outer
  ctx.arc(100, 100, 40, 0, Math.PI * 2); // inner (subpath)
  ctx.fillStyle = '#e94560';
  ctx.fill(); // default = 'nonzero'
}

// evenodd: inner circle becomes transparent hole
{
  const ctx = document.getElementById('d2').getContext('2d');
  ctx.beginPath();
  ctx.arc(100, 100, 80, 0, Math.PI * 2); // outer
  ctx.arc(100, 100, 40, 0, Math.PI * 2); // inner
  ctx.fillStyle = '#e94560';
  ctx.fill('evenodd'); // hole punched automatically
}

// evenodd with 3 concentric rings — alternating filled/empty
{
  const ctx = document.getElementById('d3').getContext('2d');
  ctx.beginPath();
  ctx.arc(100, 100, 90, 0, Math.PI * 2);
  ctx.arc(100, 100, 65, 0, Math.PI * 2);
  ctx.arc(100, 100, 40, 0, Math.PI * 2);
  ctx.arc(100, 100, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#00d4ff';
  ctx.fill('evenodd');
}`,
      showPreviewByDefault: true,
      outputHeight: 280,
    },

    {
      type: 'js',
      instruction: `## Challenge: Draw a Regular Polygon Function

Write a function \`polygon(ctx, cx, cy, radius, sides)\` that draws a regular polygon (triangle = 3 sides, square = 4, pentagon = 5, etc.) centered at \`(cx, cy)\`.

Then use it to draw at least three different polygons on the canvas.

**Hint:** For a regular N-sided polygon, each vertex is at angle \`(i / N) * 2 * Math.PI\` from the center, at the given radius. Start at the top by offsetting by \`-Math.PI / 2\`.`,
      html: `<canvas id="canvas" width="560" height="300"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function polygon(ctx, cx, cy, radius, sides) {
  // Your code here
}

// Draw at least three polygons with different sides
`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function polygon(ctx, cx, cy, radius, sides) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
}

const shapes = [
  { cx: 90,  cy: 150, r: 70, sides: 3, fill: '#e94560', stroke: '#ff8fa3' },
  { cx: 230, cy: 150, r: 70, sides: 5, fill: '#ffd700', stroke: '#b8860b' },
  { cx: 370, cy: 150, r: 70, sides: 6, fill: '#00d4ff', stroke: '#0090aa' },
  { cx: 490, cy: 150, r: 55, sides: 8, fill: '#4ade80', stroke: '#22a655' },
];

shapes.forEach(({ cx, cy, r, sides, fill, stroke }) => {
  polygon(ctx, cx, cy, r, sides);
  ctx.fillStyle = fill + '33';
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(sides + ' sides', cx, cy + r + 16);
});`,
      showPreviewByDefault: false,
      outputHeight: 340,
      type: 'challenge',
      check: (js) => {
        return js.includes('beginPath') &&
          js.includes('closePath') &&
          js.includes('Math.cos') &&
          js.includes('Math.sin') &&
          (js.includes('fill') || js.includes('stroke'));
      },
    },
  ],
};

export default {
  id: 'canvas-2-rects-paths',
  slug: 'canvas-rectangles-and-paths',
  chapter: 'canvas.1',
  order: 1,
  title: 'Rectangles and Paths',
  subtitle: 'The three rect operations, the path model, and building any polygon from scratch.',
  tags: ['canvas', 'fillRect', 'strokeRect', 'clearRect', 'beginPath', 'closePath', 'paths', 'polygon'],

  hook: {
    question: 'Every shape you see in a CAD tool — every panel, icon, and geometry outline — is either a rectangle shortcut or a path. What is the difference, and why does it matter?',
    realWorldContext:
      'Rectangles are the only shape Canvas provides without a path. Everything else — triangles, circles, custom polygons, curves — requires the path model: `beginPath`, `moveTo`, drawing commands, then `fill` or `stroke`. ' +
      'Understanding this model completely is the foundation for everything that follows: clipping regions use paths, hit detection uses paths, custom cursors use paths. ' +
      'The fill rules (nonzero vs evenodd) are also how you create holes and complex compound shapes without manual clipping.',
    previewVisualizationId: 'JSNotebook',
    previewVisualizationProps: { lesson: LESSON_CANVAS_2 },
  },

  intuition: {
    prose: [
      '**fillRect, strokeRect, clearRect** are the only path-free drawing operations. They work directly from x, y, width, height with no `beginPath` needed. `clearRect` is your animation workhorse — call it every frame to wipe the canvas.',
      '**The path workflow** is: `beginPath` → `moveTo` → drawing commands → `closePath` (optional) → `fill` and/or `stroke`. Never skip `beginPath` — leftover segments from the previous path will get unexpectedly filled or stroked.',
      '**Fill rules** determine which regions of a compound path are considered "inside." `nonzero` (default) fills everything. `evenodd` creates holes where shapes overlap — how donut shapes and complex cutouts work.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Always call beginPath() before a new shape',
        body: 'The most common Canvas bug: forgetting `beginPath()` so new segments attach to the previous path. When you later call `fill()` or `stroke()`, old segments reappear. Make `beginPath()` the first line of every shape-drawing routine.',
      },
      {
        type: 'insight',
        title: 'fill() and stroke() can both be called on the same path',
        body: 'Call `fill()` first, then `stroke()` on the same path. The stroke is centered on the path boundary, so half of it overlaps the fill. If you stroke first then fill, the fill covers the inner half of your stroke.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Canvas Lesson 2 — Rectangles and Paths',
        props: { lesson: LESSON_CANVAS_2 },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Which Canvas method erases pixels back to transparent?',
      options: ['strokeRect', 'fillRect with fillStyle = "transparent"', 'clearRect'],
      correct: 2,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You draw two shapes but the second one unexpectedly includes lines from the first. What did you forget?',
      options: ['ctx.stroke() on the first shape', 'ctx.beginPath() before the second shape', 'ctx.closePath() on the first shape'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'You want to draw a donut (ring) shape — a large circle with a circular hole. Which fill rule creates the hole automatically?',
      options: [
        'fill("nonzero") — the default fills everything including the inner circle',
        'fill("evenodd") — regions covered an odd number of times are filled, creating the hole',
        'You cannot create holes with Canvas paths — you need clipRect',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What does closePath() do?',
      options: [
        'Ends the current path so no more segments can be added',
        'Draws a straight line from the current point back to the first moveTo point',
        'Calls fill() and stroke() simultaneously',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'fillRect, strokeRect, clearRect — the only path-free operations. clearRect wipes pixels; use it every animation frame.',
    'Path workflow: beginPath → moveTo → drawing commands → closePath (optional) → fill / stroke.',
    'NEVER forget beginPath(). Leftover segments from the previous path will appear unexpectedly.',
    'Regular polygon: iterate i from 0 to N, angle = (i/N) * 2π, vertex = (cx + cos(angle)*r, cy + sin(angle)*r).',
    'evenodd fill rule: overlapping subpaths cancel each other — the inner circle becomes a hole in a donut.',
    'You can fill() and stroke() the same path. Fill first, then stroke to draw the outline on top.',
  ],

  checkpoints: ['read-intuition'],
};
