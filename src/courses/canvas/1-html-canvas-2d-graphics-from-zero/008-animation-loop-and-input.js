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

const LESSON_CANVAS_8 = {
  title: 'The Animation Loop & Input',
  subtitle: 'requestAnimationFrame, delta time, mouse/pointer events, and keyboard input.',
  sequential: true,

  cells: [
    {
      type: 'markdown',
      instruction: `## The Animation Loop: requestAnimationFrame

All canvas animation follows the same three-step loop: **clear → update → draw → repeat**. The browser provides \`requestAnimationFrame\` (rAF) to run this loop at the display's refresh rate.

\`\`\`javascript
function animate(timestamp) {
  // timestamp: milliseconds since page load, sub-millisecond precision

  ctx.clearRect(0, 0, canvas.width, canvas.height); // 1. clear

  // 2. update state (move things, apply physics)
  ball.x += ball.vx;

  // 3. draw current state
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(animate); // 4. schedule next frame
}

requestAnimationFrame(animate); // start
\`\`\`

### Why rAF beats setInterval

| | requestAnimationFrame | setInterval |
|---|---|---|
| Sync to display | Yes — 60fps, 120fps, etc. | No — always fires at set ms |
| Tab hidden | Pauses automatically | Keeps firing (wastes CPU) |
| Timestamp | High-precision, provided | You must measure yourself |
| GPU scheduling | Browser optimizes | Manual |

### Delta time: frame-rate independence

Your logic must not assume 60fps. A player moving 3px per frame goes twice as fast on a 120hz monitor. Use **delta time** to move at a fixed real-world speed instead:

\`\`\`javascript
let lastTime = 0;

function animate(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // seconds, capped at 50ms
  lastTime = timestamp;

  // "200 pixels per second" regardless of frame rate
  ball.x += ball.vx * dt * 200;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall(ball);
  requestAnimationFrame(animate);
}
\`\`\`

The cap (\`Math.min(..., 0.05)\`) prevents a huge jump when the tab comes back into focus after being hidden.

### Stopping and restarting

\`\`\`javascript
let animationId = null;

function start() {
  if (animationId) return; // already running
  animationId = requestAnimationFrame(loop);
}

function stop() {
  cancelAnimationFrame(animationId);
  animationId = null;
}

function loop(ts) {
  // ... update, draw ...
  animationId = requestAnimationFrame(loop); // save the ID each frame
}
\`\`\``,
    },

    {
      type: 'js',
      instruction: `## Bouncing Balls with Trails

A classic rAF demo: 8 balls bounce around the canvas. Instead of \`clearRect\`, we paint a semi-transparent dark overlay each frame — this leaves a fading trail. Each ball has velocity in pixels-per-second; delta time makes them speed-consistent across displays.

Notice the **glow effect** on each ball (shadow with zero offset) and the trail that fades naturally as the overlay accumulates over time.`,
      html: `<canvas id="canvas" width="700" height="440"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const balls = Array.from({ length: 8 }, (_, i) => ({
  x: 80 + Math.random() * (W - 160),
  y: 80 + Math.random() * (H - 160),
  vx: (Math.random() - 0.5) * 350,
  vy: (Math.random() - 0.5) * 350,
  r: 8 + Math.random() * 14,
  hue: (i / 8) * 360,
}));

let lastTime = 0;

function animate(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  // Fade effect instead of clearRect
  ctx.fillStyle = 'rgba(22, 33, 62, 0.18)';
  ctx.fillRect(0, 0, W, H);

  balls.forEach(b => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    if (b.x - b.r < 0)   { b.x = b.r;   b.vx =  Math.abs(b.vx); }
    if (b.x + b.r > W)   { b.x = W-b.r; b.vx = -Math.abs(b.vx); }
    if (b.y - b.r < 0)   { b.y = b.r;   b.vy =  Math.abs(b.vy); }
    if (b.y + b.r > H)   { b.y = H-b.r; b.vy = -Math.abs(b.vy); }

    const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    grd.addColorStop(0, \`hsl(\${b.hue}, 100%, 90%)\`);
    grd.addColorStop(1, \`hsl(\${b.hue}, 90%, 50%)\`);

    ctx.save();
    ctx.shadowColor = \`hsl(\${b.hue}, 90%, 60%)\`;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.restore();
  });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);`,
      showPreviewByDefault: true,
      outputHeight: 480,
    },

    {
      type: 'markdown',
      instruction: `## Mouse and Pointer Input

Canvas receives mouse and pointer events like any DOM element, but with a catch: \`e.clientX\` and \`e.clientY\` are relative to the browser viewport, not the canvas. You must convert them.

### getCanvasPos: the essential helper

\`\`\`javascript
function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;   // handles CSS scaling
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY
  };
}
\`\`\`

If your canvas has \`width="700"\` but CSS makes it 350px wide, \`scaleX\` will be 2 and coordinates will still be correct in canvas-space.

### Mouse events

\`\`\`javascript
canvas.addEventListener('mousedown',    e => { ... });
canvas.addEventListener('mousemove',    e => { ... });
canvas.addEventListener('mouseup',      e => { ... });
canvas.addEventListener('dblclick',     e => { ... });
canvas.addEventListener('contextmenu',  e => { e.preventDefault(); }); // right click

// Modifier keys on any mouse event:
if (e.shiftKey) { /* shift held */ }
if (e.ctrlKey)  { /* ctrl held  */ }
if (e.altKey)   { /* alt held   */ }

// Wheel (zoom):
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const delta = e.deltaY; // negative = zoom in, positive = zoom out
}, { passive: false });
\`\`\`

### Pointer events (recommended for CAD and drawing apps)

Pointer events handle mouse, touch, and stylus with one API:

\`\`\`javascript
canvas.addEventListener('pointerdown', e => {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId); // keep capturing even if pointer leaves

  if (e.pointerType === 'pen') {
    const pressure = e.pressure; // 0.0 – 1.0
    const tiltX    = e.tiltX;   // stylus tilt angle
  }
});

canvas.addEventListener('pointermove', e => {
  // High-frequency input: use coalesced events to get all intermediate positions
  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  events.forEach(ev => {
    const pos = getCanvasPos(ev);
    // each pos is a point the pointer actually passed through
  });
});

canvas.addEventListener('pointerup',     e => { ... });
canvas.addEventListener('pointercancel', e => { ... }); // touch interrupted
\`\`\`

### Keyboard events

Canvas doesn't receive keyboard events unless it has \`tabindex\`. Alternatively, listen on \`window\`:

\`\`\`javascript
// Game-style: track which keys are held
const keysDown = new Set();
window.addEventListener('keydown', e => keysDown.add(e.key));
window.addEventListener('keyup',   e => keysDown.delete(e.key));

// In your update loop:
if (keysDown.has('ArrowLeft'))  player.x -= speed * dt;
if (keysDown.has('ArrowRight')) player.x += speed * dt;

// Or single-press actions:
canvas.setAttribute('tabindex', '0');
canvas.addEventListener('keydown', e => {
  if (e.key === 'Escape')   cancelTool();
  if (e.key === 'Delete')   deleteSelected();
  if (e.key === 'z' && (e.ctrlKey || e.metaKey)) undo();
});
\`\`\``,
    },

    {
      type: 'js',
      instruction: `## Interactive Drawing Pad

A full drawing application combining pointer events, color selection, brush size, opacity, an eraser, and PNG export. Notice the use of \`getCoalescedEvents()\` for smooth lines at high speed, and \`setPointerCapture\` to keep drawing even if the pointer briefly leaves the canvas.`,
      html: `<div class="toolbar">
  <label>Size: <input type="range" id="size" min="1" max="40" value="5"></label>
  <label>Opacity: <input type="range" id="opacity" min="1" max="100" value="100"></label>
  <div id="colors"></div>
  <button id="eraser">Eraser</button>
  <button id="clear">Clear</button>
  <button id="download">Save PNG</button>
</div>
<canvas id="canvas" width="700" height="420"></canvas>`,
      css: `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #1a1a2e; display: flex; flex-direction: column;
       align-items: center; padding: 16px; gap: 10px; font-family: 'Courier New', monospace; }
.toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
button { background: #0f3460; color: #fff; border: 1px solid #e94560;
         padding: 6px 14px; border-radius: 4px; cursor: pointer; font-family: monospace; }
button:hover { background: #e94560; }
label { color: #aaa; font-size: 13px; }
input[type=range] { width: 90px; }
.color-btn { width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
             border: 3px solid transparent; display: inline-block; }
.color-btn.active { border-color: #fff; }
canvas { background: var(--color-background-primary, #ffffff); border: 2px solid #333; cursor: crosshair; touch-action: none; }`,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let isDrawing = false, lastX = 0, lastY = 0;
let currentColor = '#1a1a2e', isEraser = false;

const palette = ['#1a1a2e','#e94560','#e67e22','#f1c40f',
                 '#2ecc71','#00d4ff','#9b59b6','#fff','#888','#000'];
const colDiv = document.getElementById('colors');

palette.forEach((color, i) => {
  const btn = document.createElement('div');
  btn.className = 'color-btn' + (i === 0 ? ' active' : '');
  btn.style.background = color;
  if (color === '#fff') btn.style.outline = '1px solid #888';
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentColor = color;
    isEraser = false;
    document.getElementById('eraser').style.background = '#0f3460';
  });
  colDiv.appendChild(btn);
});

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

canvas.addEventListener('pointerdown', e => {
  isDrawing = true;
  canvas.setPointerCapture(e.pointerId);
  const pos = getPos(e);
  [lastX, lastY] = [pos.x, pos.y];
  ctx.beginPath();
  ctx.arc(lastX, lastY, parseFloat(document.getElementById('size').value) / 2, 0, Math.PI * 2);
  ctx.fillStyle = isEraser ? '#fff' : currentColor;
  ctx.globalAlpha = parseFloat(document.getElementById('opacity').value) / 100;
  ctx.fill();
  ctx.globalAlpha = 1;
});

canvas.addEventListener('pointermove', e => {
  if (!isDrawing) return;
  e.preventDefault();
  const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
  events.forEach(ev => {
    const pos = getPos(ev);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isEraser ? '#fff' : currentColor;
    ctx.lineWidth = parseFloat(document.getElementById('size').value);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = parseFloat(document.getElementById('opacity').value) / 100;
    ctx.stroke();
    ctx.globalAlpha = 1;
    [lastX, lastY] = [pos.x, pos.y];
  });
});

canvas.addEventListener('pointerup', () => { isDrawing = false; });
canvas.addEventListener('pointerleave', () => { isDrawing = false; });

document.getElementById('eraser').addEventListener('click', () => {
  isEraser = !isEraser;
  document.getElementById('eraser').style.background = isEraser ? '#e94560' : '#0f3460';
});
document.getElementById('clear').addEventListener('click', () => {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});
document.getElementById('download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.download = 'drawing.png';
  a.href = canvas.toDataURL();
  a.click();
});

ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);`,
      showPreviewByDefault: true,
      outputHeight: 560,
    },

    {
      type: 'challenge',
      instruction: `## Challenge: Particle Emitter

Build an interactive particle system where particles spray from wherever the mouse is held down.

**Requirements:**
1. Track mouse/pointer position on the canvas
2. While the pointer is held down, emit new particles at the cursor position each frame
3. Each particle has: position, velocity (random direction/speed), radius, hue, and a remaining lifetime
4. Each frame: update all particles (move by velocity × dt), reduce lifetime, remove dead ones
5. Draw each particle as a glowing circle — use \`globalAlpha\` based on remaining lifetime for fade-out

**Starter hints:**
\`\`\`javascript
const particles = [];

function spawnParticle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 50 + Math.random() * 150;
  particles.push({
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 100, // upward bias
    r: 3 + Math.random() * 5,
    hue: Math.random() * 360,
    life: 1.0, // 0 = dead, 1 = fresh
    decay: 0.5 + Math.random() * 1.0,
  });
}
\`\`\``,
      html: `<canvas id="canvas" width="700" height="440"></canvas>`,
      css: BASE_CSS,
      startCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const particles = [];
let mouse = { x: W/2, y: H/2, down: false };

// TODO: Add pointer event listeners to track mouse position and down state

function spawnParticle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 50 + Math.random() * 150;
  particles.push({
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 100,
    r: 3 + Math.random() * 5,
    hue: Math.random() * 360,
    life: 1.0,
    decay: 0.5 + Math.random() * 1.0,
  });
}

let lastTime = 0;
function animate(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  ctx.fillStyle = 'rgba(22,33,62,0.2)';
  ctx.fillRect(0, 0, W, H);

  // TODO: if mouse is down, spawn particles at mouse position (emit several per frame)

  // TODO: update and draw each particle
  // - move by vx*dt, vy*dt
  // - reduce life by decay*dt
  // - remove if life <= 0
  // - draw a glowing circle with globalAlpha = life

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);`,
      solutionCode: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const particles = [];
let mouse = { x: W/2, y: H/2, down: false };

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top)  * (H / rect.height),
  };
}

canvas.addEventListener('pointerdown', e => {
  mouse.down = true;
  const p = getPos(e);
  mouse.x = p.x; mouse.y = p.y;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  const p = getPos(e);
  mouse.x = p.x; mouse.y = p.y;
});
canvas.addEventListener('pointerup',    () => { mouse.down = false; });
canvas.addEventListener('pointerleave', () => { mouse.down = false; });

function spawnParticle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = 50 + Math.random() * 200;
  particles.push({
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 120,
    r: 3 + Math.random() * 6,
    hue: Math.random() * 360,
    life: 1.0,
    decay: 0.4 + Math.random() * 0.8,
  });
}

let lastTime = 0;
function animate(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  ctx.fillStyle = 'rgba(22,33,62,0.18)';
  ctx.fillRect(0, 0, W, H);

  if (mouse.down) {
    for (let i = 0; i < 6; i++) spawnParticle(mouse.x, mouse.y);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 200 * dt; // gravity
    p.life -= p.decay * dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.shadowColor = \`hsl(\${p.hue}, 90%, 60%)\`;
    ctx.shadowBlur = 12;
    ctx.fillStyle = \`hsl(\${p.hue}, 90%, 65%)\`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '13px Courier New';
  ctx.textAlign = 'left';
  ctx.fillText('Click and drag to emit particles', 12, 24);
  ctx.fillText(\`particles: \${particles.length}\`, 12, 44);

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);`,
      showPreviewByDefault: true,
      outputHeight: 480,
      check: (js) => {
        return (
          (js.includes('pointerdown') || js.includes('mousedown')) &&
          (js.includes('pointermove') || js.includes('mousemove')) &&
          js.includes('requestAnimationFrame') &&
          js.includes('life') &&
          js.includes('clearRect') || js.includes('fillRect') &&
          js.includes('arc')
        );
      },
    },
  ],
};

const lesson8 = {
  id: 'canvas-1-8',
  slug: 'animation-loop-and-input',
  chapter: 'canvas.1',
  order: 8,
  title: 'The Animation Loop & Input',
  subtitle: 'requestAnimationFrame, delta time, and handling mouse/pointer/keyboard input.',
  tags: ['canvas', 'animation', 'requestAnimationFrame', 'input', 'mouse', 'pointer'],
  hook: 'Every canvas game, simulation, and interactive tool runs on the same engine: a loop that clears, updates, draws, and repeats. And that loop is useless without knowing where the user is pointing.',
  intuition: {
    text: 'requestAnimationFrame syncs your loop to the display. Delta time makes your physics frame-rate independent. Pointer events give you precise, scalable coordinates regardless of CSS sizing. Together these form the foundation of every interactive canvas application.',
    visualizations: [
      {
        id: 'JSNotebook',
        props: { lesson: LESSON_CANVAS_8 },
      },
    ],
  },
  quiz: [
    {
      question: 'Why is requestAnimationFrame preferred over setInterval for canvas animation?',
      options: [
        'It fires more frequently than setInterval',
        'It automatically pauses when the tab is hidden and syncs to the display refresh rate',
        'It provides a DOM timestamp that setInterval cannot',
        'setInterval cannot be used with canvas',
      ],
      answer: 1,
    },
    {
      question: 'What does the "dt cap" (Math.min(dt, 0.05)) prevent?',
      options: [
        'Frames from running faster than 60fps',
        'A huge position jump when the tab regains focus after being hidden',
        'The animation from exceeding 50 frames',
        'Delta time from going negative',
      ],
      answer: 1,
    },
    {
      question: 'e.clientX gives you coordinates relative to the…',
      options: [
        'Canvas element',
        'Canvas drawing buffer',
        'Browser viewport',
        'Document body',
      ],
      answer: 2,
    },
    {
      question: 'What does canvas.setPointerCapture(e.pointerId) do?',
      options: [
        'Locks the pointer to the center of the canvas',
        'Ensures pointer events keep firing on the canvas even if the pointer leaves it',
        'Prevents other elements from receiving pointer events',
        'Converts touch events to mouse events',
      ],
      answer: 1,
    },
  ],
  mentalModel: [`The animation loop is a heartbeat: every pulse it clears the slate, advances the world by one time-step, and paints the new state. Delta time is how you make that time-step reflect real elapsed time rather than frame count. Input events are asynchronous messengers that update your state between beats — the loop itself doesn't handle input, it reads the state that input has already modified.`],
};

export default lesson8;
