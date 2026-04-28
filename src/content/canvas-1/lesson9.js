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

const LESSON_CANVAS_9 = {
  title: 'Hit Detection and Picking',
  subtitle: 'Click objects on canvas using math, isPointInPath, and color-buffer picking.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## What Is Hit Detection?

Canvas has no retained objects — after you draw a circle, the canvas has no idea a circle was there. It's just pixels. When the user clicks, you must figure out yourself which shape was hit.

This is called **picking** or **hit detection**, and there are three approaches, each with different tradeoffs.

---

## Method 1: Mathematical Hit Testing

For simple shapes, compute directly whether a point falls inside:

### Point in rectangle

\`\`\`javascript
function hitRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
\`\`\`

### Point in circle

The Pythagorean theorem: if the distance from point to center is less than radius, it's inside.

\`\`\`javascript
function hitCircle(px, py, cx, cy, r) {
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy <= r * r; // avoid sqrt — compare squared distances
}
\`\`\`

### Point in rotated rectangle

Transform the point into the rectangle's local coordinate space, then do a simple AABB test:

\`\`\`javascript
function hitRotatedRect(px, py, cx, cy, w, h, angle) {
  const cos = Math.cos(-angle), sin = Math.sin(-angle);
  const dx = px - cx, dy = py - cy;
  const localX = cos * dx - sin * dy; // rotate point into rect space
  const localY = sin * dx + cos * dy;
  return Math.abs(localX) <= w / 2 && Math.abs(localY) <= h / 2;
}
\`\`\`

### Point in polygon (ray casting)

For any convex or concave polygon, cast a ray from the point to infinity and count crossings. An odd number means inside.

\`\`\`javascript
function hitPolygon(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
\`\`\`

**When to use**: Simple scenes with known shape types. Fast, no extra canvas needed.

---

## Method 2: isPointInPath

Canvas's built-in path hit test. You recreate the path (without drawing it) and call \`isPointInPath\`:

\`\`\`javascript
function isPointOnShape(shape, px, py) {
  ctx.beginPath();
  ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2); // recreate the path
  return ctx.isPointInPath(px, py); // true if inside
}

// isPointInStroke checks if a point is ON the stroke of a path
function isPointNearLine(x1, y1, x2, y2, px, py, tolerance = 5) {
  ctx.lineWidth = tolerance * 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  return ctx.isPointInStroke(px, py);
}
\`\`\`

**When to use**: Complex paths (Bézier curves, arcs) where math is tedious. Automatically handles transforms — if you've applied \`ctx.translate\` / \`ctx.rotate\`, the path test uses the same transform.

---

## Method 3: Color-Buffer Picking

For complex scenes with many overlapping objects, the most reliable approach encodes each object's ID as a unique color in a hidden offscreen canvas, then reads the pixel under the cursor:

\`\`\`javascript
// Each object ID encodes into an RGB color
function idToColor(id) {
  const r = (id >> 16) & 0xFF;
  const g = (id >> 8)  & 0xFF;
  const b =  id        & 0xFF;
  return \`rgb(\${r},\${g},\${b})\`;
}

function colorToId(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

// Offscreen pick buffer
const pickCanvas = document.createElement('canvas');
pickCanvas.width = canvas.width;
pickCanvas.height = canvas.height;
const pickCtx = pickCanvas.getContext('2d');

function renderPickBuffer(objects) {
  pickCtx.clearRect(0, 0, pickCanvas.width, pickCanvas.height);
  objects.forEach((obj, i) => {
    pickCtx.fillStyle = idToColor(i + 1); // 0 = background (no hit)
    drawShape(pickCtx, obj); // draw the same shape, solid color
  });
}

function pickObject(mouseX, mouseY) {
  const pixel = pickCtx.getImageData(mouseX, mouseY, 1, 1).data;
  const id = colorToId(pixel[0], pixel[1], pixel[2]);
  return id === 0 ? null : objects[id - 1];
}
\`\`\`

This approach handles:
- Any shape complexity (Bézier, custom paths)
- Overlapping objects (topmost wins — render back-to-front like the main canvas)
- Anti-aliasing artifacts (work around by rendering without anti-aliasing on the pick buffer)

**When to use**: CAD tools and complex scene editors with many objects. The pick buffer must be re-rendered whenever the scene changes.`,
    },

    {
      type: 'js',
      instruction: `## Mathematical Hit Detection Demo

Click on any shape to select it. This demo uses purely mathematical hit tests: \`hitCircle\` for the circles, \`hitRect\` for the rectangles, and \`hitRotatedRect\` for the rotated shapes. Selected shapes highlight in yellow. Notice that rotated shapes work correctly — the hit test transforms the point into the shape's local space rather than trying to rotate the test geometry.`,
      html: `<canvas id="canvas" width="700" height="400"></canvas>
<div id="info" style="color:#aaa;font-family:monospace;margin-top:8px;text-align:center;font-size:13px;">Click a shape to select it</div>`,
      css: BASE_CSS + `
#info { color: #aaa; font-family: monospace; margin-top: 8px; text-align: center; }`,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

function hitCircle(px, py, cx, cy, r) {
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

function hitRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

function hitRotatedRect(px, py, cx, cy, w, h, angle) {
  const cos = Math.cos(-angle), sin = Math.sin(-angle);
  const dx = px - cx, dy = py - cy;
  const lx = cos * dx - sin * dy;
  const ly = sin * dx + cos * dy;
  return Math.abs(lx) <= w / 2 && Math.abs(ly) <= h / 2;
}

const shapes = [
  { type: 'circle', cx: 100, cy: 120, r: 60, color: '#e94560', label: 'Circle' },
  { type: 'circle', cx: 260, cy: 250, r: 40, color: '#9b59b6', label: 'Small Circle' },
  { type: 'rect',   rx: 340, ry: 60,  rw: 150, rh: 90, color: '#00d4ff', label: 'Rectangle' },
  { type: 'rect',   rx: 500, ry: 200, rw: 80,  rh: 120, color: '#4ade80', label: 'Tall Rect' },
  { type: 'rotated', cx: 200, cy: 330, w: 140, h: 60, angle: Math.PI / 5, color: '#ffd700', label: 'Rotated Rect' },
  { type: 'rotated', cx: 560, cy: 100, w: 100, h: 80, angle: -Math.PI / 6, color: '#e9813a', label: 'Rotated Rect 2' },
];

let selected = null;

function hitTest(px, py, shape) {
  if (shape.type === 'circle')  return hitCircle(px, py, shape.cx, shape.cy, shape.r);
  if (shape.type === 'rect')    return hitRect(px, py, shape.rx, shape.ry, shape.rw, shape.rh);
  if (shape.type === 'rotated') return hitRotatedRect(px, py, shape.cx, shape.cy, shape.w, shape.h, shape.angle);
  return false;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach(s => {
    const sel = s === selected;
    ctx.save();
    if (sel) {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 20;
    }
    ctx.fillStyle = sel ? '#ffd700' : s.color;
    ctx.strokeStyle = sel ? '#fff' : s.color;
    ctx.lineWidth = sel ? 3 : 1;

    if (s.type === 'circle') {
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, s.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.type === 'rect') {
      ctx.fillRect(s.rx, s.ry, s.rw, s.rh);
    } else if (s.type === 'rotated') {
      ctx.translate(s.cx, s.cy);
      ctx.rotate(s.angle);
      ctx.fillRect(-s.w/2, -s.h/2, s.w, s.h);
    }
    ctx.restore();

    // Label
    ctx.fillStyle = '#666';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    const lx = s.type === 'rect' ? s.rx + s.rw/2 : s.cx;
    const ly = s.type === 'rect' ? s.ry + s.rh + 14 : s.cy + s.r + 14;
    ctx.fillText(s.label, lx, ly);
  });
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top)  * (canvas.height / rect.height),
  };
}

canvas.addEventListener('click', e => {
  const { x, y } = getPos(e);
  // Reverse to get topmost first
  const hit = [...shapes].reverse().find(s => hitTest(x, y, s));
  selected = hit || null;
  info.textContent = hit ? \`Hit: \${hit.label} (\${hit.type})\` : 'Click a shape to select it';
  draw();
});

canvas.style.cursor = 'pointer';
draw();`,
      showPreviewByDefault: true,
      outputHeight: 460,
    },

    {
      type: 'js',
      instruction: `## Color-Buffer Picking Demo

This demo renders 20 randomly sized, randomly positioned colored circles. Click any circle — including tightly packed or overlapping ones — and it highlights correctly. Underneath the visible canvas an **identical layout** is drawn to an offscreen pick buffer, each circle filled with a unique RGB color encoding its array index. On click we read one pixel from the pick buffer to identify the object instantly, no math required.

Toggle the button to reveal the hidden pick buffer and see what the GPU is actually using to resolve clicks.`,
      html: `<canvas id="canvas" width="700" height="400"></canvas>
<div style="text-align:center;margin-top:8px;">
  <button id="toggle">Show Pick Buffer</button>
  <span id="info" style="margin-left:16px;color:#aaa;font-family:monospace;font-size:13px;">Click a circle</span>
</div>`,
      css: BASE_CSS + `
button { background:#0f3460;color:#fff;border:1px solid #e94560;padding:6px 14px;
         border-radius:4px;cursor:pointer;font-family:monospace; }
button:hover { background:#e94560; }
#info { color:#aaa; font-family:monospace; font-size:13px; }`,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const info = document.getElementById('info');

// Offscreen pick buffer
const pickCanvas = document.createElement('canvas');
pickCanvas.width = canvas.width;
pickCanvas.height = canvas.height;
const pickCtx = pickCanvas.getContext('2d', { willReadFrequently: true });

// Encode object ID as an RGB color (supports up to 16 million objects)
function idToColor(id) {
  return \`rgb(\${(id>>16)&255},\${(id>>8)&255},\${id&255})\`;
}
function colorToId(r, g, b) {
  return (r << 16) | (g << 8) | b;
}

// Generate random circles
const circles = Array.from({ length: 20 }, (_, i) => ({
  x: 30 + Math.random() * (canvas.width - 60),
  y: 30 + Math.random() * (canvas.height - 60),
  r: 20 + Math.random() * 40,
  hue: (i / 20) * 360,
  id: i + 1, // 0 is background
}));

let selected = null;
let showPickBuffer = false;

function drawCircle(ctx, c, color) {
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function render() {
  // Main canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showPickBuffer) {
    ctx.drawImage(pickCanvas, 0, 0);
    return;
  }

  circles.forEach(c => {
    const sel = c === selected;
    ctx.save();
    if (sel) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; }
    drawCircle(ctx, c, sel ? '#fff' : \`hsl(\${c.hue}, 80%, 55%)\`);
    if (sel) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.font = 'bold 11px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(c.id, c.x, c.y);
  });
}

function renderPickBuffer() {
  pickCtx.clearRect(0, 0, pickCanvas.width, pickCanvas.height);
  circles.forEach(c => {
    drawCircle(pickCtx, c, idToColor(c.id));
  });
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
    y: Math.round((e.clientY - rect.top)  * (canvas.height / rect.height)),
  };
}

canvas.addEventListener('click', e => {
  const { x, y } = getPos(e);
  const pixel = pickCtx.getImageData(x, y, 1, 1).data;
  const id = colorToId(pixel[0], pixel[1], pixel[2]);
  selected = circles.find(c => c.id === id) || null;
  info.textContent = selected ? \`Hit circle #\${selected.id} (id encoded as \${idToColor(selected.id)})\` : 'Missed — click a circle';
  render();
});

document.getElementById('toggle').addEventListener('click', () => {
  showPickBuffer = !showPickBuffer;
  document.getElementById('toggle').textContent = showPickBuffer ? 'Show Main View' : 'Show Pick Buffer';
  render();
});

renderPickBuffer();
render();`,
      showPreviewByDefault: true,
      outputHeight: 470,
    },

    {
      type: 'challenge',
      instruction: `## Challenge: Draggable Shape Editor

Build a small canvas app where the user can click shapes to select them and drag them around.

**Requirements:**
1. Define an array of at least 4 shapes (mix circles and rectangles) with positions and colors
2. On **mousedown / pointerdown**: find the topmost shape under the cursor using hit tests, select it, record drag offset
3. On **mousemove / pointermove**: if dragging, move the selected shape by the delta
4. On **mouseup / pointerup**: stop dragging
5. Draw all shapes each frame; the selected shape should be highlighted (different color or glow)

**You choose the hit test method** — mathematical or \`isPointInPath\`. Either is correct.

**Hint — drag offset trick** (prevents the shape from snapping to cursor center):
\`\`\`javascript
canvas.addEventListener('pointerdown', e => {
  const pos = getPos(e);
  const hit = findHit(pos.x, pos.y);
  if (hit) {
    selected = hit;
    // Store offset so the shape doesn't jump to cursor center:
    dragOffsetX = hit.x - pos.x;
    dragOffsetY = hit.y - pos.y;
  }
});

canvas.addEventListener('pointermove', e => {
  if (!selected || !isDragging) return;
  const pos = getPos(e);
  selected.x = pos.x + dragOffsetX;
  selected.y = pos.y + dragOffsetY;
  draw();
});
\`\`\``,
      html: `<canvas id="canvas" width="700" height="420"></canvas>
<div id="status" style="text-align:center;margin-top:6px;color:#666;font-family:monospace;font-size:12px;">Click and drag shapes to move them</div>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

// Define your shapes here — mix circles and rectangles
const shapes = [
  { type: 'circle', x: 150, y: 150, r: 60,  color: '#e94560' },
  { type: 'circle', x: 400, y: 200, r: 45,  color: '#9b59b6' },
  { type: 'rect',   x: 520, y: 80,  w: 120, h: 80, color: '#00d4ff' },
  { type: 'rect',   x: 200, y: 300, w: 100, h: 100, color: '#4ade80' },
];

let selected = null;
let isDragging = false;
let dragOffsetX = 0, dragOffsetY = 0;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top)  * (canvas.height / rect.height),
  };
}

// TODO: implement hitTest(pos, shape) for circles and rects

// TODO: implement findHit(x, y) — return topmost shape under point

// TODO: add pointerdown, pointermove, pointerup listeners

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach(s => {
    const sel = s === selected;
    ctx.save();
    // TODO: highlight selected shape (glow or different color)
    ctx.fillStyle = s.color;
    if (s.type === 'circle') {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(s.x, s.y, s.w, s.h);
    }
    ctx.restore();
  });
}

draw();`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

const shapes = [
  { type: 'circle', x: 150, y: 150, r: 60,  color: '#e94560', label: 'A' },
  { type: 'circle', x: 400, y: 200, r: 45,  color: '#9b59b6', label: 'B' },
  { type: 'rect',   x: 520, y: 80,  w: 120, h: 80, color: '#00d4ff', label: 'C' },
  { type: 'rect',   x: 200, y: 300, w: 100, h: 100, color: '#4ade80', label: 'D' },
];

let selected = null, isDragging = false, dragOffsetX = 0, dragOffsetY = 0;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top)  * (canvas.height / rect.height),
  };
}

function hitTest(pos, s) {
  if (s.type === 'circle') {
    const dx = pos.x - s.x, dy = pos.y - s.y;
    return dx*dx + dy*dy <= s.r*s.r;
  }
  return pos.x >= s.x && pos.x <= s.x + s.w && pos.y >= s.y && pos.y <= s.y + s.h;
}

function findHit(x, y) {
  return [...shapes].reverse().find(s => hitTest({ x, y }, s)) || null;
}

canvas.addEventListener('pointerdown', e => {
  const pos = getPos(e);
  const hit = findHit(pos.x, pos.y);
  selected = hit;
  isDragging = !!hit;
  if (hit) {
    const anchor = hit.type === 'circle' ? { x: hit.x, y: hit.y } : { x: hit.x + hit.w/2, y: hit.y + hit.h/2 };
    dragOffsetX = anchor.x - pos.x;
    dragOffsetY = anchor.y - pos.y;
    canvas.setPointerCapture(e.pointerId);
    status.textContent = \`Dragging shape \${hit.label}\`;
  } else {
    status.textContent = 'Click and drag shapes to move them';
  }
  draw();
});

canvas.addEventListener('pointermove', e => {
  if (!isDragging || !selected) return;
  const pos = getPos(e);
  const nx = pos.x + dragOffsetX;
  const ny = pos.y + dragOffsetY;
  if (selected.type === 'circle') { selected.x = nx; selected.y = ny; }
  else { selected.x = nx - selected.w/2; selected.y = ny - selected.h/2; }
  draw();
});

canvas.addEventListener('pointerup', () => { isDragging = false; });

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shapes.forEach(s => {
    const sel = s === selected;
    ctx.save();
    if (sel) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 22; }
    ctx.fillStyle = sel ? '#fff' : s.color;
    if (s.type === 'circle') {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = 'bold 16px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, s.x, s.y);
    } else {
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.font = 'bold 16px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, s.x + s.w/2, s.y + s.h/2);
    }
    ctx.restore();
  });
}

draw();`,
      showPreviewByDefault: true,
      outputHeight: 480,
      check: (js) => {
        return (
          (js.includes('pointerdown') || js.includes('mousedown')) &&
          (js.includes('pointermove') || js.includes('mousemove')) &&
          (js.includes('hitCircle') || js.includes('hitTest') || js.includes('isPointInPath') || js.includes('dx * dx') || js.includes('dx*dx')) &&
          js.includes('selected')
        );
      },
    },
  ],
};

const lesson9 = {
  id: 'canvas-1-9',
  slug: 'hit-detection-and-picking',
  chapter: 1,
  order: 9,
  title: 'Hit Detection & Picking',
  subtitle: 'Click objects on canvas: mathematical tests, isPointInPath, and color-buffer picking.',
  tags: ['canvas', 'hit-detection', 'picking', 'interaction', 'isPointInPath'],
  hook: 'Canvas has no scene graph — after you draw a circle, the browser has forgotten it exists. Clicking an object means you must figure out the geometry yourself. There are three completely different ways to do it.',
  intuition: {
    text: 'Mathematical hit tests are fast and direct for simple shapes. isPointInPath lets the canvas engine test complex paths for you. Color-buffer picking scales to thousands of objects by encoding IDs as colors in a hidden offscreen canvas. Each approach is the right tool for a different scene complexity.',
    visualizations: [
      {
        id: 'JSNotebook',
        props: { lesson: LESSON_CANVAS_9 },
      },
    ],
  },
  quiz: [
    {
      question: 'Why does hitCircle compare squared distances (dx*dx + dy*dy <= r*r) instead of using Math.sqrt?',
      options: [
        'sqrt is not available in JavaScript',
        'Avoiding sqrt is faster — you can compare squares directly without loss of correctness',
        'It handles the case where the circle is off-screen',
        'Squared distance gives a more accurate result',
      ],
      answer: 1,
    },
    {
      question: 'To hit-test a rotated rectangle using math, you should…',
      options: [
        'Rotate the canvas, draw the rect, then check isPointInPath',
        'Rotate the test point into the rectangle\'s local coordinate space, then do an axis-aligned test',
        'Check if the point is within the bounding circle of the rectangle',
        'Use getImageData to read the pixel color',
      ],
      answer: 1,
    },
    {
      question: 'What makes color-buffer picking reliably handle overlapping objects?',
      options: [
        'Each object has a unique color ID — reading one pixel tells you exactly which object is on top',
        'It uses a separate z-buffer to track depth',
        'It renders from front-to-back so only visible objects are sampled',
        'isPointInPath handles overlapping automatically',
      ],
      answer: 0,
    },
    {
      question: 'isPointInPath(x, y) tests if the point is inside the…',
      options: [
        'Last shape drawn on the canvas',
        'Current path (the one built since the last beginPath)',
        'All paths ever drawn on the canvas',
        'The visible bounding box of the canvas',
      ],
      answer: 1,
    },
  ],
  mentalModel: [`Hit detection is the inverse of drawing. Drawing maps your data (shapes, positions, sizes) to pixels. Hit detection maps a screen position back to data. Mathematical tests are just geometry: is this point inside this region? isPointInPath delegates that geometry to the browser's path engine. Color-buffer picking is the brute-force approach — paint the scene twice (once visible, once with ID colors) and read a single pixel. The right choice depends on how many objects you have and how complex their shapes are.`],
};

export default lesson9;
