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
  canvas {
    display: block;
    background: #16213e;
    border: 1px solid #0f3460;
    border-radius: 4px;
  }
`;

const LESSON_CANVAS_1 = {
  title: 'Canvas: What It Is and How It Works',
  subtitle: 'Immediate-mode rendering, the drawing surface, and your first pixels.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## What Is the HTML Canvas?

The \`<canvas>\` element is a **bitmap drawing surface** embedded in a webpage. It is fundamentally different from the rest of HTML:

| Approach | Model | How it works |
|---|---|---|
| **DOM / HTML** | Retained | You create elements; the browser tracks and renders them |
| **SVG** | Retained | You declare shapes; the browser owns the scene graph |
| **Canvas** | **Immediate** | You issue draw commands; pixels appear and are forgotten |

**Immediate mode** means: there are no objects. There is no scene graph. You draw, the pixels appear, and that is the end of it. To move a circle, you clear the canvas and redraw everything from a new position. This sounds like more work — and it is — but it gives you **complete control** over every pixel, which is exactly what CAD and data visualization require.

### What Canvas can do

- **2D vector drawing** — lines, curves, arcs, filled shapes, any geometry you can describe mathematically
- **Image manipulation** — read and write individual pixels, apply filters, composite layers
- **Animation** — 60fps game loops, physics simulations, real-time data plots
- **Interactive tools** — drawing apps, diagram editors, CAD interfaces, level editors
- **Export** — render to PNG, generate data URLs for download

### What Canvas cannot do natively

- **3D rendering** — use WebGL or Three.js for that
- **Retained objects** you can query back — you must keep your own data structures
- **Complex text layout** — use SVG or a DOM overlay for rich text
- **Accessibility** — canvas pixels are invisible to screen readers without extra ARIA work

### Why learn Canvas before Three.js?

Three.js, WebGL, and every graphics library above them work on the same principles: immediate-mode rendering, coordinate transforms, and draw calls. Canvas teaches you these at the lowest practical level. When you move to Three.js you will understand *why* it makes the choices it does, not just how to call its API.`,
    },

    {
      type: 'js',
      instruction: `## Your First Canvas

Every Canvas project starts from the same boilerplate. This is the minimal version — understand every line before you move on.

**The HTML:** \`<canvas id="canvas" width="500" height="400">\` — this creates the drawing surface.
The \`width\` and \`height\` **attributes** set the resolution of the bitmap (more on this in a moment).

**The JavaScript:** \`canvas.getContext('2d')\` returns a \`CanvasRenderingContext2D\` object. This is your entire drawing API. Every call you make — lines, fills, transforms, text — goes through this object.

Run the cell and you should see a red rectangle on a dark background. This confirms your canvas is working.

Try changing the color, position, or size of the rectangle.`,
      html: `<canvas id="canvas" width="500" height="350"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;   // 500
const H = canvas.height;  // 350

// fillRect(x, y, width, height) — fills a rectangle
ctx.fillStyle = '#e94560';
ctx.fillRect(50, 50, 200, 100);

// You can draw multiple shapes with different styles
ctx.fillStyle = '#00d4ff';
ctx.fillRect(300, 150, 120, 120);

ctx.fillStyle = '#ffd700';
ctx.fillRect(100, 220, 80, 80);

console.log('Canvas size:', W, 'x', H);
console.log('Context type:', ctx.constructor.name);`,
      showPreviewByDefault: true,
      outputHeight: 380,
    },

    {
      type: 'markdown',
      instruction: `## \`canvas.width\` vs CSS \`width\` — The Critical Distinction

This is the single most common source of confusion for beginners. It matters even more for Retina/HiDPI displays.

**Drawing buffer resolution** is set by the HTML attributes:
\`\`\`html
<canvas width="800" height="600">
\`\`\`
This creates an 800×600 pixel bitmap in memory. This is where your draw calls land.

**Display size** is set by CSS:
\`\`\`css
canvas { width: 400px; height: 300px; }
\`\`\`
This scales the bitmap up or down on screen.

The browser default is a **300×150** drawing buffer regardless of how large you make the canvas with CSS. If you only set CSS dimensions, your canvas will be a blurry 300×150 bitmap stretched to fit — a common beginner bug.

**The rule:** Always set both. The HTML attributes define resolution; CSS defines display size. Match them unless you deliberately want scaling (e.g., for Retina screens, you'd double the attributes but keep the CSS the same size).

\`\`\`js
// Programmatic approach — useful for responsive canvases
function setCanvasSize(canvas, width, height) {
  canvas.width = width;        // drawing buffer resolution
  canvas.height = height;
  canvas.style.width = width + 'px';   // display size
  canvas.style.height = height + 'px';
}
\`\`\``,
    },

    {
      type: 'js',
      instruction: `## Demonstrating the Resolution Mismatch

The left canvas has matching attribute and CSS dimensions (crisp). The right canvas has CSS dimensions but a tiny attribute resolution (blurry and stretched).

Run the code and observe the difference. This is exactly what happens when you set CSS \`width/height\` without setting the \`width\`/\`height\` attributes.`,
      html: `<div style="display:flex; gap:20px; align-items:flex-start; padding:20px">
  <div>
    <p id="lbl1" style="color:#94a3b8; font-family:monospace; font-size:12px; margin-bottom:6px">Crisp: attributes match CSS</p>
    <canvas id="c1" width="200" height="150" style="width:200px; height:150px; border:1px solid #334155; border-radius:4px; background:#16213e; display:block"></canvas>
  </div>
  <div>
    <p id="lbl2" style="color:#f87171; font-family:monospace; font-size:12px; margin-bottom:6px">Blurry: tiny buffer, large CSS</p>
    <canvas id="c2" width="40" height="30" style="width:200px; height:150px; border:1px solid #334155; border-radius:4px; background:#16213e; display:block"></canvas>
  </div>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #1a1a2e; min-height: 100vh; display: flex; align-items: center; justify-content: center; }`,
      startCode: `// CRISP canvas: buffer = 200x150, CSS = 200x150
const c1 = document.getElementById('c1');
const ctx1 = c1.getContext('2d');
ctx1.fillStyle = '#e94560';
ctx1.fillRect(10, 10, 80, 50);
ctx1.fillStyle = '#fff';
ctx1.font = '12px Courier New';
ctx1.fillText('Crisp text', 10, 90);
ctx1.strokeStyle = '#00d4ff';
ctx1.lineWidth = 1;
ctx1.strokeRect(100, 10, 80, 50);

// BLURRY canvas: buffer = 40x30, CSS = 200x150 (5x stretch)
const c2 = document.getElementById('c2');
const ctx2 = c2.getContext('2d');
ctx2.fillStyle = '#e94560';
ctx2.fillRect(2, 2, 16, 10);  // same proportional box
ctx2.fillStyle = '#fff';
ctx2.font = '2px Courier New'; // tiny font at this resolution
ctx2.fillText('Blurry', 2, 18);
ctx2.strokeStyle = '#00d4ff';
ctx2.lineWidth = 0.2;
ctx2.strokeRect(20, 2, 16, 10);

console.log('c1 buffer:', c1.width, 'x', c1.height);
console.log('c2 buffer:', c2.width, 'x', c2.height, '(stretched 5x in CSS)');`,
      showPreviewByDefault: true,
      outputHeight: 240,
    },

    {
      type: 'js',
      instruction: `## The Coordinate System

Canvas places the **origin (0, 0) at the top-left corner**. X increases rightward. Y increases **downward**. This is the opposite of mathematical convention, where Y goes up.

This matters constantly in CAD and graphics work:
- Drawing at y=300 puts you **lower** on screen than y=100
- Rotating clockwise in Canvas math is a positive angle (because Y is flipped)
- For CAD tools you'll build a world-to-screen transform that can flip Y when needed

The code below draws an annotated grid so you can see the coordinate system directly. Notice the +Y arrow pointing down and the origin marker at (0,0).`,
      html: `<canvas id="canvas" width="500" height="380"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// Draw grid lines
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
for (let x = 0; x <= W; x += 50) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, H);
  ctx.stroke();
}
for (let y = 0; y <= H; y += 50) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.stroke();
}

// Coordinate labels
ctx.fillStyle = '#334155';
ctx.font = '10px Courier New';
for (let x = 50; x < W; x += 100) {
  ctx.fillText(x, x + 2, 11);
}
for (let y = 50; y < H; y += 50) {
  ctx.fillText(y, 2, y - 2);
}

// Origin marker
ctx.fillStyle = '#e94560';
ctx.beginPath();
ctx.arc(0, 0, 5, 0, Math.PI * 2);
ctx.fill();
ctx.font = 'bold 12px Courier New';
ctx.fillText('(0, 0)', 7, 14);

// +Y axis arrow (pointing DOWN)
ctx.strokeStyle = '#94a3b8';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(22, 22);
ctx.lineTo(22, 75);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(22, 75);
ctx.lineTo(16, 62);
ctx.moveTo(22, 75);
ctx.lineTo(28, 62);
ctx.stroke();
ctx.fillStyle = '#94a3b8';
ctx.font = '11px Courier New';
ctx.fillText('+Y', 27, 52);

// +X axis arrow (pointing RIGHT)
ctx.beginPath();
ctx.moveTo(22, 22);
ctx.lineTo(75, 22);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(75, 22);
ctx.lineTo(62, 16);
ctx.moveTo(75, 22);
ctx.lineTo(62, 28);
ctx.stroke();
ctx.fillText('+X', 52, 17);

// Plot some labeled points
const points = [
  { x: 200, y: 150, color: '#00d4ff', label: '(200, 150)' },
  { x: 400, y: 300, color: '#ffd700', label: '(400, 300)' },
  { x: 100, y: 320, color: '#10b981', label: '(100, 320)' },
];
points.forEach(({ x, y, color, label }) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '12px Courier New';
  ctx.fillText(label, x + 8, y - 4);
});`,
      showPreviewByDefault: true,
      outputHeight: 420,
    },

    {
      type: 'js',
      instruction: `## Subpixel Coordinates and the 0.5 Trick

Canvas supports fractional coordinates like \`(100.7, 200.3)\`. This enables smooth animation, but it also creates a subtle rendering issue for **crisp 1px lines**.

A 1px-wide line drawn at an integer coordinate (e.g., y=100) spans from y=99.5 to y=100.5 — bleeding into two rows of pixels. The renderer anti-aliases it, producing a blurry half-strength line across two pixels.

The fix: **offset by 0.5**. Drawing at y=100.5 centers the 1px line exactly on row 100 — one crisp, full-strength pixel.

This matters for:
- CAD grids and rulers — every line should be crisp
- Alignment guides — blurry guides look unprofessional
- Technical drawings — precision matters visually

Run this cell and compare the crisp vs blurry lines side by side.`,
      html: `<canvas id="canvas" width="500" height="280"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.font = '12px Courier New';
ctx.fillStyle = '#94a3b8';
ctx.fillText('Blurry — integer coordinates', 20, 30);
ctx.fillText('Crisp  — 0.5 offset', 20, 150);

// Draw blurry lines (integer coordinates)
ctx.strokeStyle = '#e94560';
ctx.lineWidth = 1;
for (let i = 0; i < 8; i++) {
  const y = 50 + i * 10;  // integer y
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(480, y);
  ctx.stroke();
}

// Draw crisp lines (0.5 offset)
for (let i = 0; i < 8; i++) {
  const y = 170 + i * 10 + 0.5;  // 0.5 offset
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(480, y);
  ctx.stroke();
}

// Visual divider
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(0, 130);
ctx.lineTo(500, 130);
ctx.stroke();

// Zoom inset to show individual pixels
ctx.fillStyle = '#0f3460';
ctx.fillRect(350, 40, 120, 60);
ctx.strokeStyle = '#334155';
ctx.lineWidth = 1;
ctx.strokeRect(350, 40, 120, 60);
ctx.fillStyle = '#94a3b8';
ctx.font = '10px Courier New';
ctx.fillText('Pixel grid (zoomed)', 355, 54);

// Show blurry pixel spread
for (let px = 0; px < 6; px++) {
  const alpha = px === 2 || px === 3 ? 0.6 : 0.3;
  ctx.fillStyle = \`rgba(233, 69, 96, \${alpha})\`;
  ctx.fillRect(358 + px * 12, 60, 12, 10);
}

// Show crisp pixel concentration
for (let px = 0; px < 6; px++) {
  const alpha = px === 2 ? 1.0 : 0.08;
  ctx.fillStyle = \`rgba(233, 69, 96, \${alpha})\`;
  ctx.fillRect(358 + px * 12, 80, 12, 10);
}

ctx.fillStyle = '#64748b';
ctx.fillText('blurry spread', 355, 78);
ctx.fillText('crisp single pixel', 355, 98);

console.log('Rule: use Math.floor(x) + 0.5 for crisp 1px lines');
console.log('Example: ctx.moveTo(Math.floor(x) + 0.5, Math.floor(y) + 0.5)');`,
      showPreviewByDefault: true,
      outputHeight: 320,
    },

    {
      type: 'js',
      instruction: `## Challenge: Draw a Crosshair

Using what you've learned, draw a centered crosshair on the canvas:
- The canvas is 500×350
- Draw a **horizontal line** across the full width at the vertical center
- Draw a **vertical line** down the full height at the horizontal center
- Use **crisp 1px lines** (the 0.5 offset trick)
- Draw a **circle** at the center point with radius 8
- Label the center point with its coordinates

Use \`ctx.beginPath()\`, \`ctx.moveTo()\`, \`ctx.lineTo()\`, \`ctx.stroke()\`, and \`ctx.arc()\`.

A crisp horizontal line looks like:
\`\`\`js
ctx.beginPath();
ctx.moveTo(0, Math.floor(y) + 0.5);
ctx.lineTo(W, Math.floor(y) + 0.5);
ctx.stroke();
\`\`\``,
      html: `<canvas id="canvas" width="500" height="350"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;   // 500
const H = canvas.height;  // 350

// Your crosshair code here
// Hint: the center is at (W/2, H/2)
`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const cx = W / 2;
const cy = H / 2;

// Horizontal line (crisp: 0.5 offset)
ctx.strokeStyle = '#00d4ff';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(0, Math.floor(cy) + 0.5);
ctx.lineTo(W, Math.floor(cy) + 0.5);
ctx.stroke();

// Vertical line
ctx.beginPath();
ctx.moveTo(Math.floor(cx) + 0.5, 0);
ctx.lineTo(Math.floor(cx) + 0.5, H);
ctx.stroke();

// Center circle
ctx.strokeStyle = '#e94560';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(cx, cy, 8, 0, Math.PI * 2);
ctx.stroke();

// Center dot
ctx.fillStyle = '#e94560';
ctx.beginPath();
ctx.arc(cx, cy, 3, 0, Math.PI * 2);
ctx.fill();

// Label
ctx.fillStyle = '#94a3b8';
ctx.font = '12px Courier New';
ctx.fillText('(' + cx + ', ' + cy + ')', cx + 12, cy - 8);`,
      showPreviewByDefault: false,
      outputHeight: 380,
      type: 'challenge',
      check: (js) => {
        return js.includes('arc') &&
          js.includes('moveTo') &&
          js.includes('lineTo') &&
          js.includes('stroke') &&
          (js.includes('0.5') || js.includes('+ .5'));
      },
    },
  ],
};

export default {
  id: 'canvas-1-intro',
  slug: 'canvas-what-it-is',
  chapter: 'canvas.1',
  order: 0,
  title: 'What Is Canvas and How Does It Work?',
  subtitle: 'Immediate-mode rendering, the coordinate system, and your first pixels on screen.',
  tags: ['canvas', 'html5', 'immediate-mode', 'coordinates', 'rendering', '2d graphics'],

  hook: {
    question: 'How do CAD tools, game engines, and data visualizations draw tens of thousands of shapes 60 times per second — without the browser choking?',
    realWorldContext:
      'The answer is the HTML Canvas API — a pixel-level drawing surface that bypasses the browser\'s normal DOM layout system entirely. ' +
      'Unlike HTML elements or SVG shapes, Canvas gives you direct access to a bitmap. ' +
      'You issue draw commands, pixels appear, and the engine moves on. ' +
      'No objects to track, no scene graph to update, no layout engine to run. ' +
      'This is the foundation of every 2D graphics system: game engines, CAD tools, chart libraries, and image editors all work this way. ' +
      'Mastering Canvas means you understand the primitives that every graphics framework is built on top of.',
    previewVisualizationId: 'JSNotebook',
    previewVisualizationProps: { lesson: LESSON_CANVAS_1 },
  },

  intuition: {
    prose: [
      '**Immediate vs. retained mode** is the foundational distinction. In retained mode (HTML, SVG, Three.js scene graphs), you declare objects and the system manages them. In immediate mode (Canvas, WebGL), you clear the screen and redraw everything yourself every frame. More control, more responsibility.',
      '**The rendering context** (`ctx`) is your drawing API. You get it once with `canvas.getContext(\'2d\')` and use it for every draw call. It holds state: current color, line width, transformation matrix, clipping region. Every draw call uses that state.',
      '**The coordinate system** has (0,0) at the top-left. X increases right, Y increases **down**. This is the opposite of math convention. For CAD tools you will build a world-to-screen transform that handles this, but you need to know the raw behavior first.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Always set both width/height attributes AND CSS dimensions',
        body: 'The HTML attributes set the drawing buffer resolution. CSS sets the display size. If you only set CSS, you get a blurry 300×150 bitmap stretched to fill the element. Match them unless you deliberately want a resolution mismatch.',
      },
      {
        type: 'insight',
        title: 'The 0.5 pixel offset trick',
        body: 'A 1px line drawn at an integer coordinate bleeds into two rows of pixels. Offset by 0.5 to center it on one pixel row: `ctx.moveTo(Math.floor(x) + 0.5, Math.floor(y) + 0.5)`. Every CAD grid and ruler you draw should use this.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Canvas Lesson 1 — Introduction and Coordinate System',
        props: {
          lesson: LESSON_CANVAS_1,
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Canvas is described as "immediate mode." What does that mean?',
      options: [
        'The browser immediately renders any HTML changes without waiting',
        'You draw directly to pixels with no persistent scene graph — to move something, you clear and redraw everything',
        'Canvas renders faster than the DOM in all circumstances',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'You set `<canvas style="width:400px; height:300px">` but forget to set the `width` and `height` attributes. What happens?',
      options: [
        'The canvas renders at 400×300 pixels, as specified by CSS',
        'The canvas uses a 300×150 drawing buffer scaled up to 400×300 — producing a blurry result',
        'The browser throws an error and the canvas does not render',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In Canvas coordinates, if you move from y=50 to y=200, which direction did you move?',
      options: [
        'Up — larger Y values are higher on screen',
        'Down — Y increases downward in Canvas',
        'It depends on which CSS transform is applied',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Why does drawing a 1px line at an integer y-coordinate produce a blurry result?',
      options: [
        'Canvas lines are always rendered with anti-aliasing and cannot be turned off',
        'A 1px line centered on an integer spans 0.5px into the pixels above and below, splitting across two rows',
        'Integer coordinates are not supported — only floating-point positions work',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'Canvas is immediate mode: you draw, pixels appear, the API forgets. No objects to query or move.',
    '`canvas.getContext("2d")` returns the CanvasRenderingContext2D — your entire drawing API.',
    'Always set both HTML attributes (`width`/`height`) AND CSS dimensions. Attributes = buffer resolution; CSS = display size.',
    'Origin (0,0) is top-left. X goes right. Y goes DOWN — opposite of math convention.',
    'For crisp 1px lines, offset coordinates by 0.5: `Math.floor(x) + 0.5`.',
    'Canvas is the foundation: Three.js, WebGL, and every graphics library above use the same immediate-mode principles.',
  ],

  checkpoints: ['read-intuition'],
};
