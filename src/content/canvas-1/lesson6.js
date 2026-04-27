const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #020617; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  canvas { display: block; background: #020617; border: 1px solid #0f3460; border-radius: 4px; }
`;

const LESSON_CANVAS_6 = {
  title: 'Transformations, Matrices, and save/restore',
  subtitle: 'translate, rotate, scale, DOMMatrix, and the save/restore state stack.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## Transformations Change the Coordinate System

Transformations don't move shapes — they move the **coordinate system**. After \`ctx.translate(200, 100)\`, when you draw at \`(0, 0)\`, the pixel appears at screen position \`(200, 100)\`.

### translate(x, y)

Shifts the origin. All subsequent drawing is offset by \`(x, y)\`:

\`\`\`js
ctx.translate(200, 150);   // new origin is at screen (200, 150)
ctx.fillRect(0, 0, 100, 50); // actually drawn at screen (200, 150)
\`\`\`

### rotate(angle)

Rotates around the **current origin** — not the canvas center:

\`\`\`js
// Rotate a rectangle around its own center:
ctx.translate(cx, cy);       // 1. move origin to center
ctx.rotate(Math.PI / 4);     // 2. rotate 45° around that center
ctx.fillRect(-w/2, -h/2, w, h); // 3. draw centered at origin
\`\`\`

**Critical:** always \`translate\` to the pivot point before \`rotate\`. Rotating without translating first rotates around (0,0) — the top-left corner — which is almost never what you want.

### scale(sx, sy)

\`\`\`js
ctx.scale(2, 2);    // everything 2× bigger
ctx.scale(1, -1);   // flip Y axis (now Y goes UP — math convention)
ctx.scale(-1, 1);   // mirror horizontally
\`\`\`

**Order matters:** \`translate → rotate\` gives different results than \`rotate → translate\`. The rule: transformations apply in the order you call them, but the last one called affects coordinate space first.`,
    },

    {
      type: 'js',
      instruction: `## translate, rotate, scale in Action

This cell draws the same shape (a small arrow/flag) using different transformation combinations. Notice how:
- Row 1: plain translate — just repositions
- Row 2: translate + rotate — rotates around the shape's own center
- Row 3: translate + scale — stretches in one or both axes

The key insight: once you understand the transformation pattern \`translate → rotate → draw centered at origin\`, you can place and orient any shape at any position and angle with one clean operation.`,
      html: `<canvas id="canvas" width="580" height="340"></canvas>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
canvas { display: block; background: #16213e; border: 1px solid #0f3460; border-radius: 4px; }`,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Draw an arrow shape centered at (0,0) — our "stamp"
function arrow(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -25);   // tip
  ctx.lineTo(12, 8);
  ctx.lineTo(5, 8);
  ctx.lineTo(5, 25);
  ctx.lineTo(-5, 25);
  ctx.lineTo(-5, 8);
  ctx.lineTo(-12, 8);
  ctx.closePath();
  ctx.fill();
}

ctx.fillStyle = '#64748b';
ctx.font = '11px Courier New';

// Row 1: translate only
ctx.fillText('translate only', 20, 22);
[100, 200, 300, 420, 520].forEach((x, i) => {
  ctx.save();
  ctx.translate(x, 60);
  arrow(ctx, \`hsl(\${i * 70}, 75%, 60%)\`);
  ctx.restore();
});

// Row 2: translate + rotate
ctx.fillText('translate + rotate', 20, 128);
[100, 200, 300, 420, 520].forEach((x, i) => {
  ctx.save();
  ctx.translate(x, 165);
  ctx.rotate((i / 4) * Math.PI * 2); // 0° to 360°
  arrow(ctx, \`hsl(\${i * 70}, 75%, 60%)\`);
  ctx.restore();
});

// Row 3: translate + scale
ctx.fillText('translate + scale (non-uniform)', 20, 240);
[
  [90,  280, 0.6, 0.6],
  [185, 280, 1.0, 1.0],
  [280, 280, 1.5, 0.8],
  [390, 280, 0.8, 1.8],
  [500, 280, 1.4, 1.4],
].forEach(([x, y, sx, sy], i) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  arrow(ctx, \`hsl(\${i * 70}, 75%, 60%)\`);
  ctx.restore();
  ctx.fillStyle = '#475569';
  ctx.font = '9px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText(\`\${sx}×\${sy}\`, x, 318);
  ctx.textAlign = 'left';
});`,
      showPreviewByDefault: true,
      outputHeight: 380,
    },

    {
      type: 'js',
      instruction: `## Solar System — Composed Transformations

The canonical demonstration of why transformations are so powerful: a solar system where each planet orbits the sun, and moons orbit planets.

Without transformations, you'd compute every orbit position manually with \`sin\` and \`cos\`. With transformations, you rotate the coordinate system and translate outward — the planet is always drawn at \`(orbitRadius, 0)\`, and the coordinate system does the orbit math for you.

The nesting pattern:
\`\`\`js
ctx.save();
ctx.rotate(planetAngle);      // orbit the sun
ctx.translate(orbitRadius, 0); // move to planet position
  ctx.save();
  ctx.rotate(moonAngle);       // orbit the planet
  ctx.translate(moonOrbit, 0); // move to moon position
  drawMoon();
  ctx.restore();
drawPlanet();
ctx.restore();
\`\`\``,
      html: `<canvas id="canvas" width="580" height="580"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let t = 0;

const planets = [
  { name: 'Mercury', orbitR: 70,  r: 5,  color: '#94a3b8', speed: 4.7,  moons: [] },
  { name: 'Venus',   orbitR: 110, r: 9,  color: '#d4a44e', speed: 3.5,  moons: [] },
  { name: 'Earth',   orbitR: 155, r: 10, color: '#3b82f6', speed: 2.98, moons: [
    { orbitR: 20, r: 3, color: '#94a3b8', speed: 13 }
  ]},
  { name: 'Mars',    orbitR: 210, r: 7,  color: '#ef4444', speed: 2.4,  moons: [
    { orbitR: 14, r: 2, color: '#94a3b8', speed: 20 },
    { orbitR: 22, r: 2, color: '#64748b', speed: 9 },
  ]},
  { name: 'Jupiter', orbitR: 280, r: 20, color: '#d97706', speed: 1.3,  moons: [
    { orbitR: 28, r: 4, color: '#94a3b8', speed: 17 },
    { orbitR: 38, r: 3, color: '#78716c', speed: 13 },
  ]},
];

function circle(r, color, glow) {
  if (glow) {
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.5);
    g.addColorStop(0, color + 'cc');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, 580, 580);
  ctx.save();
  ctx.translate(290, 290); // center

  // Sun
  circle(28, '#ffdd44', true);

  planets.forEach(p => {
    // Orbit ring
    ctx.beginPath();
    ctx.arc(0, 0, p.orbitR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.rotate(t * p.speed * 0.004); // planet orbits sun
    ctx.translate(p.orbitR, 0);       // move to planet position

    // Moons
    p.moons.forEach(m => {
      ctx.beginPath();
      ctx.arc(0, 0, m.orbitR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.stroke();
      ctx.save();
      ctx.rotate(t * m.speed * 0.004);
      ctx.translate(m.orbitR, 0);
      circle(m.r, m.color, false);
      ctx.restore();
    });

    circle(p.r, p.color, false);
    ctx.restore();
  });

  ctx.restore();
  t++;
  requestAnimationFrame(draw);
}
draw();`,
      showPreviewByDefault: true,
      outputHeight: 620,
    },

    {
      type: 'markdown',
      instruction: `## save() and restore() — The State Stack

Every drawing function that applies transformations or style changes **must** use \`save()\` and \`restore()\` to avoid side effects on the caller.

\`save()\` pushes a snapshot of the entire context state onto a stack:
- All style properties (fillStyle, strokeStyle, lineWidth, font, etc.)
- The current transformation matrix
- The clipping region
- globalAlpha, globalCompositeOperation

\`restore()\` pops the last saved state off the stack.

\`\`\`js
ctx.fillStyle = 'red';
ctx.save();                    // stack: [{fillStyle:'red'}]
  ctx.fillStyle = 'blue';
  ctx.save();                  // stack: [{fillStyle:'red'}, {fillStyle:'blue'}]
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, 50, 50);  // green
  ctx.restore();               // stack: [{fillStyle:'red'}] → blue again
  ctx.fillRect(60, 0, 50, 50);   // blue
ctx.restore();                 // stack: [] → red again
ctx.fillRect(120, 0, 50, 50);  // red
\`\`\`

### The universal drawing function pattern

**Every** non-trivial drawing helper should follow this structure:

\`\`\`js
function drawWidget(ctx, x, y, options) {
  ctx.save();           // isolate all side effects
  ctx.translate(x, y);  // set up local coordinate system
  // apply styles, draw ...
  ctx.restore();        // no style or transform leaks to caller
}
\`\`\`

This is the pattern used throughout the Solar System code and every well-written Canvas library.`,
    },

    {
      type: 'markdown',
      instruction: `## The Transform Matrix — Under the Hood

Every \`translate\`, \`rotate\`, and \`scale\` call multiplies the current transformation matrix. Canvas uses a 3×3 **affine matrix**:

\`\`\`
[ a  c  e ]     a,d = scale     e,f = translation
[ b  d  f ]     b,c = rotation/skew
[ 0  0  1 ]
\`\`\`

You can read and write it directly:
\`\`\`js
ctx.setTransform(a, b, c, d, e, f); // replace matrix entirely
ctx.transform(a, b, c, d, e, f);    // multiply current matrix
ctx.setTransform(1, 0, 0, 1, 0, 0); // reset to identity
const m = ctx.getTransform();        // returns DOMMatrix
\`\`\`

### DOMMatrix — the modern approach

\`\`\`js
// Compose transforms as a chain
const m = new DOMMatrix()
  .translate(100, 200)
  .rotate(45)        // degrees, not radians!
  .scale(2);

ctx.setTransform(m);  // apply to canvas

// Convert mouse position to world coordinates (critical for CAD)
const inv = m.inverse();
const world = inv.transformPoint({ x: mouseX, y: mouseY });
\`\`\`

**Why this matters for CAD:** your application maintains a "camera matrix" that maps world coordinates to screen pixels. When the user zooms or pans, you update this matrix. To convert a mouse click back to a world coordinate, you invert the matrix. This is the foundation of every zoom/pan system.`,
    },

    {
      type: 'js',
      instruction: `## Challenge: Spinning Gear

Draw an animated gear using \`translate\`, \`rotate\`, and the path system. A gear has:
- A circular body
- N teeth evenly distributed around the perimeter
- A center hole

Use \`requestAnimationFrame\` to animate it spinning. The approach:
1. \`ctx.translate(cx, cy)\` to center
2. \`ctx.rotate(angle)\` where angle increases each frame
3. Draw the gear centered at \`(0, 0)\`

**Hint for teeth:** alternate between outer radius and inner radius as you step around the circle, similar to the star pattern from Lesson 2. Each tooth has 4 points: enter outer, exit outer, enter inner, exit inner.`,
      html: `<canvas id="canvas" width="400" height="400"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cx = 200, cy = 200;
let angle = 0;

function drawGear(ctx, outerR, innerR, holeR, teeth, color) {
  const step = (Math.PI * 2) / teeth;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    const toothW = step * 0.4; // width of each tooth
    // Outer arc start
    ctx.lineTo(outerR * Math.cos(a - toothW), outerR * Math.sin(a - toothW));
    // Outer arc end
    ctx.lineTo(outerR * Math.cos(a + toothW), outerR * Math.sin(a + toothW));
    // Inner arc
    ctx.lineTo(innerR * Math.cos(a + step * 0.5), innerR * Math.sin(a + step * 0.5));
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  // Center hole
  ctx.beginPath();
  ctx.arc(0, 0, holeR, 0, Math.PI * 2);
  ctx.fillStyle = '#020617';
  ctx.fill();
}

function frame() {
  ctx.clearRect(0, 0, 400, 400);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  drawGear(ctx, 160, 130, 25, 16, '#334155');
  ctx.restore();
  angle += 0.008;
  requestAnimationFrame(frame);
}
frame();`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cx = 200, cy = 200;
let angle = 0;

function drawGear(ctx, outerR, innerR, holeR, teeth, fill, stroke) {
  const step = (Math.PI * 2) / teeth;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    const toothW = step * 0.38;
    ctx.lineTo(outerR * Math.cos(a - toothW), outerR * Math.sin(a - toothW));
    ctx.lineTo(outerR * Math.cos(a + toothW), outerR * Math.sin(a + toothW));
    ctx.lineTo(innerR * Math.cos(a + step * 0.5), innerR * Math.sin(a + step * 0.5));
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Spokes
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * holeR * 1.8, Math.sin(a) * holeR * 1.8);
    ctx.lineTo(Math.cos(a) * innerR * 0.65, Math.sin(a) * innerR * 0.65);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  // Center hub
  ctx.beginPath();
  ctx.arc(0, 0, holeR * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center hole
  ctx.beginPath();
  ctx.arc(0, 0, holeR, 0, Math.PI * 2);
  ctx.fillStyle = '#020617';
  ctx.fill();
}

function frame() {
  ctx.clearRect(0, 0, 400, 400);

  // Large gear
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  drawGear(ctx, 155, 130, 18, 16, '#1e3a5f', '#00d4ff');
  ctx.restore();

  angle += 0.007;
  requestAnimationFrame(frame);
}
frame();`,
      showPreviewByDefault: true,
      outputHeight: 440,
      type: 'challenge',
      check: (js) => {
        return js.includes('translate') &&
          js.includes('rotate') &&
          js.includes('requestAnimationFrame') &&
          js.includes('clearRect');
      },
    },
  ],
};

export default {
  id: 'canvas-6-transforms',
  slug: 'canvas-transformations',
  chapter: 'canvas.1',
  order: 5,
  title: 'Transformations, Matrices, and State',
  subtitle: 'translate, rotate, scale, DOMMatrix, and the save/restore stack — how Canvas manages coordinate spaces.',
  tags: ['canvas', 'translate', 'rotate', 'scale', 'save', 'restore', 'DOMMatrix', 'transformation matrix'],

  hook: {
    question: 'How do game engines draw thousands of sprites — each at different positions, rotations, and scales — without computing every vertex manually?',
    realWorldContext:
      'The answer is the transformation matrix — a single mathematical object that encodes position, rotation, and scale simultaneously. ' +
      'Canvas exposes this through `translate`, `rotate`, and `scale`, which compose automatically. ' +
      'The Solar System demo in this lesson shows the core pattern: rotate the coordinate system into the orbit position, translate outward, and draw at the local origin. ' +
      'Every game engine, 3D renderer, and CAD tool uses this same pattern. ' +
      'The `save/restore` stack lets each drawing function work in its own isolated coordinate space — the foundation of modular, composable rendering.',
    previewVisualizationId: 'JSNotebook',
    previewVisualizationProps: { lesson: LESSON_CANVAS_6 },
  },

  intuition: {
    prose: [
      '**Transformations move the coordinate system, not the shapes.** After `ctx.translate(200, 100)`, drawing at `(0, 0)` places pixels at screen position `(200, 100)`. This means you can write drawing functions that always draw at the local origin, and control placement by translating before calling them.',
      '**The pivot pattern:** always `translate` to the pivot point, then `rotate`. If you rotate first, the rotation happens around (0,0) — the top-left corner of the canvas — which produces an arc, not a spin.',
      '**save/restore is the isolation mechanism.** Every drawing function should `save()` at the start and `restore()` at the end. This means transformations and style changes inside the function have zero effect on the caller. The entire Solar System works this way — each planet and moon draws in its own saved state.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Order matters: translate → rotate ≠ rotate → translate',
        body: 'The standard order for placing an object is: (1) translate to the position, (2) rotate around that position, (3) scale, (4) draw centered at origin. Reversing this order produces completely different results. Think: "move the paper, then tilt the paper, then draw."',
      },
      {
        type: 'insight',
        title: 'DOMMatrix.inverse() is how mouse coordinates become world coordinates',
        body: 'In a CAD tool, you maintain a camera transform matrix. ctx.setTransform(camera) applies it before drawing. When the user clicks, the mouse position is in screen space. To find what world object they clicked, compute camera.inverse().transformPoint({x: mouseX, y: mouseY}). This is covered in depth in the Zoom & Pan lesson.',
      },
    ],
    visualizations: [
      {
        id: 'JSNotebook',
        title: 'Canvas Lesson 6 — Transformations, Matrices, and State',
        props: { lesson: LESSON_CANVAS_6 },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'You want to rotate a rectangle around its own center at (200, 150). What is the correct order of operations?',
      options: [
        'ctx.rotate(angle) then ctx.translate(200, 150)',
        'ctx.translate(200, 150) then ctx.rotate(angle), then draw centered at origin',
        'ctx.scale then ctx.rotate then ctx.translate',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What does ctx.save() actually save?',
      options: [
        'Only the current transformation matrix',
        'The entire context state: styles, transformation, clipping region, globalAlpha, etc.',
        'A snapshot of the canvas pixel buffer',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In the Solar System demo, each planet is drawn at `ctx.translate(orbitRadius, 0)`. Why does this produce orbital motion?',
      options: [
        'The translate moves the planet along the X axis in screen space each frame',
        'Before the translate, ctx.rotate(angle) was called — so the entire coordinate system is rotated, and "right" now points along the orbit direction',
        'The planet position is computed with Math.cos/sin before translating',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'ctx.setTransform(1, 0, 0, 1, 0, 0) does what?',
      options: [
        'Saves the current transform to the stack',
        'Resets the transformation matrix to the identity — no scale, no rotation, no translation',
        'Applies a 1:1 pixel scaling factor for Retina displays',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'Transformations move the coordinate system. Drawing at (0,0) after translate(200,100) appears at screen (200,100).',
    'To rotate around a point: translate to that point, rotate, draw centered at origin.',
    'save/restore = state stack. Each save pushes; each restore pops. Always pair them.',
    'Every drawing function pattern: save() → translate → rotate → draw at origin → restore().',
    'Transformation order: translate → rotate → scale. Last operation applies to coordinate space first.',
    'DOMMatrix.inverse() converts screen coordinates to world coordinates — essential for mouse hit testing in CAD.',
  ],

  checkpoints: ['read-intuition'],
};
