// Three.js · Chapter 1 · Lesson 0
// Window & Context Setup

const LESSON_3JS_1_0 = {
  title: 'Window & Context Setup',
  subtitle: 'Creating a WebGL2 context, the render loop, and clearing the screen.',
  sequential: true,
  cells: [

    // ── Cell 1: What is the context? ─────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Bridge to Your GPU

JavaScript runs on your CPU. Your GPU renders pixels. They live in different memory spaces with different instruction sets — they cannot talk directly.

The **WebGL context** is the browser-managed bridge between them. When you call \`canvas.getContext('webgl2')\`, the browser:
1. Allocates GPU-accessible memory for your canvas
2. Creates a translation layer between JavaScript calls and GPU driver commands
3. Returns a \`gl\` object — every method on it sends a command to the GPU

**Every WebGL program starts with the same four steps:**

| Step | Code | What it does |
|---|---|---|
| 1. Get the context | \`const gl = canvas.getContext('webgl2')\` | Opens the bridge |
| 2. Set state | \`gl.clearColor(r, g, b, a)\` | Stores the colour for clearing |
| 3. Issue command | \`gl.clear(gl.COLOR_BUFFER_BIT)\` | GPU fills the colour buffer |
| 4. Display | *(browser does this automatically)* | Swaps front/back buffer |

**WebGL is a state machine.** \`gl.clearColor()\` does not draw — it sets state. \`gl.clear()\` is the command that uses that state. This separation runs through every WebGL API call.

**Three.js handles all of this:**
\`new THREE.WebGLRenderer({ canvas })\` runs step 1. \`renderer.setClearColor()\` wraps step 2. Steps 3 and 4 happen inside \`renderer.render()\`. This lesson makes you write it by hand once so you understand exactly what Three.js hides.`,
    },

    // ── Cell 2: Color sliders — first WebGL experience ────────────────────────
    {
      type: 'js',
      instruction: `### Your First WebGL Colour

Drag the sliders to mix a colour. The WebGL canvas updates in real time and the exact \`gl.clearColor()\` call updates with your values.

**Try these:** Pure red (R=1, G=0, B=0) · White (all 1.0) · Black (all 0) · Your favourite colour`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
  <div style="display:flex;flex-direction:column;gap:10px;min-width:185px">
    <div style="color:#94a3b8;font-family:monospace;font-size:11px;font-weight:700;letter-spacing:.05em">DRAG THE SLIDERS</div>
    <label style="font-family:monospace;font-size:11px;color:#f87171;display:flex;flex-direction:column;gap:3px">
      R (Red) = <span id="rv">0.08</span>
      <input id="sr" type="range" min="0" max="1" step="0.01" value="0.08" style="accent-color:#f87171;width:100%">
    </label>
    <label style="font-family:monospace;font-size:11px;color:#4ade80;display:flex;flex-direction:column;gap:3px">
      G (Green) = <span id="gv">0.05</span>
      <input id="sg" type="range" min="0" max="1" step="0.01" value="0.05" style="accent-color:#4ade80;width:100%">
    </label>
    <label style="font-family:monospace;font-size:11px;color:#38bdf8;display:flex;flex-direction:column;gap:3px">
      B (Blue) = <span id="bv">0.25</span>
      <input id="sb" type="range" min="0" max="1" step="0.01" value="0.25" style="accent-color:#38bdf8;width:100%">
    </label>
    <div style="margin-top:4px;background:#1e293b;border-radius:6px;padding:10px;font-family:monospace;font-size:10px;line-height:2;color:#64748b">
      // Live WebGL calls:<br>
      <span style="color:#94a3b8">gl.clearColor(<span id="rl" style="color:#f87171">0.08</span>, <span id="gl2" style="color:#4ade80">0.05</span>, <span id="bl" style="color:#38bdf8">0.25</span>, 1.0);</span><br>
      <span style="color:#94a3b8">gl.clear(gl.COLOR_BUFFER_BIT);</span>
    </div>
    <div style="background:#0f172a;border-radius:6px;padding:8px;font-family:monospace;font-size:10px;color:#475569;line-height:1.6">
      Values 0.0–1.0 (not 0–255).<br>1.0 = full brightness.
    </div>
  </div>
  <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:8px">
    <div style="color:#475569;font-family:monospace;font-size:10px">WebGL canvas output:</div>
    <canvas id="cv" width="300" height="200" style="border-radius:8px;border:1px solid rgba(255,255,255,0.1);width:100%;max-width:300px;display:block"></canvas>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

function update() {
  var r = +document.getElementById('sr').value;
  var g = +document.getElementById('sg').value;
  var b = +document.getElementById('sb').value;
  document.getElementById('rv').textContent = r.toFixed(2);
  document.getElementById('gv').textContent = g.toFixed(2);
  document.getElementById('bv').textContent = b.toFixed(2);
  document.getElementById('rl').textContent = r.toFixed(2);
  document.getElementById('gl2').textContent = g.toFixed(2);
  document.getElementById('bl').textContent = b.toFixed(2);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(r, g, b, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
document.getElementById('sr').oninput = update;
document.getElementById('sg').oninput = update;
document.getElementById('sb').oninput = update;
update();`,
      outputHeight: 300,
    },

    // ── Cell 3: Challenge — gl.clear() ────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You call \`gl.clearColor(0.1, 0.0, 0.5, 1.0)\` followed by \`gl.clear(gl.COLOR_BUFFER_BIT)\`. What does \`gl.clear\` actually do?`,
      options: [
        { label: 'A', text: 'It resets all shader programs back to their default state.' },
        { label: 'B', text: 'It fills every pixel in the colour buffer with the colour set by gl.clearColor() — painting the entire canvas.' },
        { label: 'C', text: 'It removes all geometry from the scene and resets vertex buffers.' },
        { label: 'D', text: 'It swaps the front and back buffers to display the finished frame.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! gl.clear(gl.COLOR_BUFFER_BIT) writes the clear colour to every pixel in the colour buffer. The COLOR_BUFFER_BIT flag targets the colour buffer specifically — you can also clear the depth buffer (DEPTH_BUFFER_BIT) and stencil buffer (STENCIL_BUFFER_BIT), or combine them: gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT). D is wrong — buffer swapping is handled automatically by the browser after each render loop cycle.',
      failMessage: 'gl.clear(gl.COLOR_BUFFER_BIT) fills every pixel of the colour buffer with the colour last set by gl.clearColor() — it paints the entire canvas. D is close but wrong: buffer swapping is done by the browser automatically, not by gl.clear(). The key pattern is: clearColor = state (stored but not yet applied), clear = the command that applies that state.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 300,
    },

    // ── Cell 3b: Walkthrough — build a resize-aware render loop ───────────────
    {
      type: 'walkthrough',
      instruction: `### Build a Production WebGL Setup — Step by Step\n\nWork through 4 steps to build a complete, resize-aware, animated WebGL canvas. Each step shows the new code added and updates the live canvas on the right.`,
      html: `<canvas id="cv" style="display:block;width:100%;height:100%"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;overflow:hidden}`,
      outputHeight: 280,
      steps: [
        {
          title: 'Step 1 — Get the context & set size',
          explanation: `Open the WebGL bridge and size the canvas to fill its container.\n\n\`canvas.getContext('webgl2')\` creates the GPU connection. We then set \`canvas.width/height\` to the window's dimensions so the drawing surface matches the CSS layout area, and issue a first clear to paint the background.`,
          code: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.08, 0.15, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);`,
        },
        {
          title: 'Step 2 — Handle resize',
          explanation: `When the window resizes, the CSS layout updates but the drawing surface (canvas.width / canvas.height) stays the same. We listen, update both, and re-call gl.viewport() to match.\n\nWithout this your scene renders into a stale rectangle and gets stretched or clipped.`,
          code: `window.addEventListener('resize', function() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
});`,
        },
        {
          title: 'Step 3 — The render loop with deltaTime',
          explanation: `\`requestAnimationFrame\` fires before each screen repaint (~60x/sec). The callback receives a high-resolution timestamp.\n\n\`dt\` = elapsed time in seconds. Multiplying movement by \`dt\` makes animations frame-rate independent — the same speed at 30 Hz or 144 Hz.`,
          code: `var prevTime = 0;
var angle = 0;
function loop(now) {
  var dt = prevTime > 0 ? Math.min((now - prevTime) / 1000, 0.05) : 0.016;
  prevTime = now;
  angle += dt * 90;
  gl.clearColor(
    0.05 + 0.04 * Math.sin(angle * 0.017),
    0.08,
    0.15 + 0.08 * Math.cos(angle * 0.013),
    1.0
  );
  gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);`,
        },
        {
          title: 'Step 4 — Add devicePixelRatio',
          explanation: `On Retina/4K screens, \`devicePixelRatio >= 2\`. Rendering at CSS pixel resolution and scaling up causes blur.\n\nMultiply canvas dimensions by DPR for the physical drawing surface; keep CSS size at 1x. Pass physical pixels to \`gl.viewport()\`.\n\nThis is exactly what \`renderer.setPixelRatio(window.devicePixelRatio)\` does in Three.js.`,
          code: `var dpr = window.devicePixelRatio || 1;
canvas.width  = window.innerWidth  * dpr;
canvas.height = window.innerHeight * dpr;
canvas.style.width  = window.innerWidth  + 'px';
canvas.style.height = window.innerHeight + 'px';
gl.viewport(0, 0, canvas.width, canvas.height);`,
        },
      ],
    },

    // ── Cell 4: The Render Loop ───────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Render Loop — Your Scene's Heartbeat

A single draw call paints one frame and stops. To animate at 60 fps you need to redraw ~60 times per second. This is the **render loop**.

\`\`\`js
function loop(timestamp) {
  // 1. Clear the previous frame
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 2. Draw your scene
  // ...

  // 3. Request the next frame before the next screen repaint
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);  // kick it off
\`\`\`

**Why \`requestAnimationFrame\` and not \`setInterval\`?**

\`setInterval\` fires on a timer — it doesn't know when the screen repaints. RAF fires *just before* each screen refresh, gives you a high-resolution timestamp, and pauses automatically when your tab is hidden (saving battery). Always use RAF for rendering.

**DeltaTime — frame-rate independent movement:**

If you move an object 3 pixels per frame: 60 fps = 180 px/sec, 144 fps = 432 px/sec. Same code, wildly different speeds.

The fix: measure elapsed time and move by *distance per second*:

\`\`\`js
let prevTime = 0;

function loop(now) {
  const dt = (now - prevTime) / 1000;  // seconds since last frame
  prevTime = now;

  x += speed * dt;  // speed in units/second — consistent on any monitor

  requestAnimationFrame(loop);
}
\`\`\`

**Double buffering:** The GPU keeps two framebuffers. You draw into the invisible back buffer. The browser swaps them each frame so you never see partial draws — only completed frames.`,
    },

    // ── Cell 5: Render Loop Inspector ────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Render Loop Inspector

The square uses \`requestAnimationFrame\`. Each frame: **clear → move → draw**.

- Press **Ghost Mode** to skip \`gl.clear()\` — watch old frames accumulate
- Press **Pause** to freeze the loop — nothing updates at all
- Drag **Speed** to see how deltaTime keeps the motion consistent`,
      html: `<div style="background:#0a0f1e;padding:12px;display:flex;flex-direction:column;align-items:center;gap:10px">
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center">
    <button id="btn-pause" style="padding:6px 16px;border-radius:7px;border:none;background:#1d4ed8;color:#fff;font-family:monospace;font-size:12px;cursor:pointer">⏸ Pause</button>
    <button id="btn-ghost" style="padding:6px 16px;border-radius:7px;border:1.5px solid #475569;background:transparent;color:#94a3b8;font-family:monospace;font-size:12px;cursor:pointer">Ghost Mode: OFF</button>
    <label style="color:#94a3b8;font-family:monospace;font-size:11px;display:flex;align-items:center;gap:6px">Speed
      <input id="sl-spd" type="range" min="1" max="6" value="3" step="1" style="width:80px;accent-color:#38bdf8">
    </label>
    <span id="fps-el" style="color:#64748b;font-family:monospace;font-size:11px">-- fps</span>
  </div>
  <canvas id="cv" width="620" height="260" style="border-radius:8px;display:block"></canvas>
  <div id="info" style="font-family:monospace;font-size:11px;color:#64748b;text-align:center;min-height:18px"></div>
</div>`,
      css: `body{margin:0;background:#0a0f1e;display:flex;justify-content:center}`,
      startCode: `var canvas = document.getElementById('cv');
var ctx = canvas.getContext('2d');
var W = canvas.width, H = canvas.height;
var x = 80, y = 130, vx = 180, vy = 120;
var SIZE = 18;
var paused = false, ghost = false;
var frame = 0, prevTime = 0;
var fpsCount = 0, fpsStart = 0, fps = 0;

function loop(now) {
  if (!paused) {
    var dt = prevTime > 0 ? Math.min((now - prevTime) / 1000, 0.05) : 0.016;
    prevTime = now;
    fpsCount++;
    if (fpsStart === 0) fpsStart = now;
    if (now - fpsStart >= 800) {
      fps = Math.round(fpsCount / ((now - fpsStart) / 1000));
      fpsCount = 0; fpsStart = now;
      document.getElementById('fps-el').textContent = fps + ' fps';
    }
    var spd = +document.getElementById('sl-spd').value;
    x += vx * spd / 3 * dt;
    y += vy * spd / 3 * dt;
    if (x - SIZE < 0)   { x = SIZE;     vx =  Math.abs(vx); }
    if (x + SIZE > W)   { x = W - SIZE; vx = -Math.abs(vx); }
    if (y - SIZE < 0)   { y = SIZE;     vy =  Math.abs(vy); }
    if (y + SIZE > H)   { y = H - SIZE; vy = -Math.abs(vy); }
    if (!ghost) { ctx.fillStyle = '#0a0f1e'; ctx.fillRect(0, 0, W, H); }
    ctx.fillStyle = ghost ? 'rgba(56,189,248,0.18)' : '#38bdf8';
    ctx.fillRect(x - SIZE, y - SIZE, SIZE * 2, SIZE * 2);
    frame++;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('frame ' + frame, 8, 16);
    document.getElementById('info').textContent = ghost
      ? 'Ghost mode ON — gl.clear() skipped — old frames accumulate (the most common WebGL beginner mistake!)'
      : 'Normal — gl.clear() called each frame — canvas wiped before every draw';
  }
  requestAnimationFrame(loop);
}

document.getElementById('btn-pause').onclick = function() {
  paused = !paused;
  this.textContent = paused ? '▶ Resume' : '⏸ Pause';
  if (!paused) prevTime = 0;
};
document.getElementById('btn-ghost').onclick = function() {
  ghost = !ghost;
  this.textContent = 'Ghost Mode: ' + (ghost ? 'ON' : 'OFF');
  this.style.background = ghost ? 'rgba(220,38,38,0.25)' : 'transparent';
  this.style.borderColor = ghost ? '#dc2626' : '#475569';
  this.style.color = ghost ? '#f87171' : '#94a3b8';
  if (!ghost) { ctx.fillStyle = '#0a0f1e'; ctx.fillRect(0, 0, W, H); }
};
requestAnimationFrame(loop);`,
      outputHeight: 370,
    },

    // ── Cell 6: Challenge — skip clear ────────────────────────────────────────
    {
      type: 'challenge',
      instruction: `You build a 3D scene with \`requestAnimationFrame\` but forget to call \`gl.clear()\` at the start of each loop. What happens?`,
      options: [
        { label: 'A', text: 'Nothing different — the GPU clears the framebuffer automatically at the start of each frame.' },
        { label: 'B', text: 'Every new frame draws on top of the last. Old geometry persists. Moving objects leave trails across the screen.' },
        { label: 'C', text: 'The scene renders correctly but GPU memory usage increases every frame until it crashes.' },
        { label: 'D', text: 'The browser throws a WebGL error: "Framebuffer not cleared before draw".' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! Without gl.clear(), each draw call paints on top of whatever pixels are already in the framebuffer. Old frames persist — moving objects leave trails of their previous positions. You can see this by pressing Ghost Mode in the demo above. The render loop pattern is always: clear → draw → (browser swaps). Skipping clear skips the "reset" step.',
      failMessage: 'The GPU does not auto-clear (A is wrong). No error is thrown — WebGL silently draws on top of old data (D is wrong). Memory does not grow (C is wrong). The answer is B: old pixels persist and new draws stack on top, creating ghost trails. This is one of the most common beginner mistakes — always call gl.clear() at the start of each loop iteration.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 300,
    },

    // ── Cell 7: The Retina Problem ────────────────────────────────────────────
    {
      type: 'markdown',
      instruction: `### The Retina Problem — Why Your Canvas Looks Blurry

CSS gives elements dimensions in **CSS pixels**. Modern HiDPI screens (Retina, 4K) pack 2 or 3 **physical pixels** into every CSS pixel. The ratio is \`window.devicePixelRatio\`.

**The problem:** If you set \`canvas.width = 800\` on a 2× Retina screen:
- Drawing surface: 800 × 800 internal pixels
- Screen area to fill: 1600 × 1600 physical pixels

The browser stretches 800 pixels across 1600 — it blurs, like scaling up a low-res image.

**The fix:**

\`\`\`js
const dpr = window.devicePixelRatio || 1;

canvas.width  = cssWidth  * dpr;   // physical pixels — WebGL drawing surface
canvas.height = cssHeight * dpr;
canvas.style.width  = cssWidth  + 'px';  // CSS pixels — visual display size
canvas.style.height = cssHeight + 'px';

gl.viewport(0, 0, canvas.width, canvas.height);  // must use physical pixels!
\`\`\`

**Why \`gl.viewport\` must use physical pixels:** The viewport tells WebGL which region of the framebuffer to render into. Passing CSS pixels leaves the outer ring of physical pixels untouched — you get a quarter-sized render stretched to fill the canvas.

**Three.js one-liner:** \`renderer.setPixelRatio(window.devicePixelRatio)\` combined with \`renderer.setSize(cssWidth, cssHeight)\` handles all of this automatically.`,
    },

    // ── Cell 8: DPR comparison ────────────────────────────────────────────────
    {
      type: 'js',
      instruction: `### Sharp vs Blurry — DPR in Practice

Both canvases display at the **same CSS size** (200 × 150 px). Left has half the internal pixels — browser stretches them (blurry). Right has double the internal pixels (sharp).

Drag **Zoom** to magnify both. At 3× or 4× the difference becomes unmistakable — especially on the text and circle edges.`,
      html: `<div style="background:#0a0f1e;padding:14px;display:flex;flex-direction:column;align-items:center;gap:12px">
  <div style="display:flex;gap:8px;align-items:center;font-family:monospace;font-size:11px;color:#94a3b8">
    Zoom: <span id="zlbl">1x</span>
    <input id="sl-zoom" type="range" min="1" max="4" step="0.5" value="1" style="width:120px;accent-color:#a78bfa">
  </div>
  <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;justify-content:center">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <div style="color:#f87171;font-family:monospace;font-size:10px;font-weight:700">NO DPR FIX — blurry</div>
      <div style="overflow:hidden;width:200px;height:150px;border-radius:6px;border:1.5px solid #f87171">
        <canvas id="c1" width="100" height="75" style="width:200px;height:150px;display:block;transform-origin:top left"></canvas>
      </div>
      <div style="background:#1e293b;border-radius:4px;padding:3px 8px;font-family:monospace;font-size:9px;color:#64748b">canvas.width=100 stretched to 200px</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <div style="color:#4ade80;font-family:monospace;font-size:10px;font-weight:700">DPR x2 APPLIED — sharp</div>
      <div style="overflow:hidden;width:200px;height:150px;border-radius:6px;border:1.5px solid #4ade80">
        <canvas id="c2" width="400" height="300" style="width:200px;height:150px;display:block;transform-origin:top left"></canvas>
      </div>
      <div style="background:#1e293b;border-radius:4px;padding:3px 8px;font-family:monospace;font-size:9px;color:#64748b">canvas.width=400 downsampled to 200px</div>
    </div>
  </div>
</div>`,
      css: `body{margin:0;background:#0a0f1e}`,
      startCode: `function drawContent(ctx, w, h, label, color) {
  var sc = w / 200;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  for (var i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(10 * sc, (14 + i * 10) * sc);
    ctx.lineTo((w - 10 * sc), (14 + i * 10) * sc);
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, 1.5 * sc);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2 + 8 * sc, 34 * sc, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#e2e8f0';
  ctx.font = Math.round(11 * sc) + 'px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(label, w / 2, h - 8 * sc);
  ctx.fillStyle = color;
  ctx.font = 'bold ' + Math.round(9 * sc) + 'px monospace';
  ctx.fillText('canvas.width = ' + w, w / 2, h / 2 + 50 * sc);
}
var c1 = document.getElementById('c1');
var c2 = document.getElementById('c2');
drawContent(c1.getContext('2d'), 100, 75,  'No fix — blurry', '#f87171');
drawContent(c2.getContext('2d'), 400, 300, 'DPR x2 — sharp',  '#4ade80');
document.getElementById('sl-zoom').oninput = function() {
  var z = +this.value;
  document.getElementById('zlbl').textContent = z + 'x';
  c1.style.transform = 'scale(' + z + ')';
  c2.style.transform = 'scale(' + z + ')';
};`,
      outputHeight: 320,
    },

    // ── Cell 9: Challenge — viewport math ────────────────────────────────────
    {
      type: 'challenge',
      instruction: `Your canvas has \`style="width:800px; height:600px"\` in CSS. \`window.devicePixelRatio\` is 2 (Retina screen). You set \`canvas.width = 1600; canvas.height = 1200\`. What should you pass to \`gl.viewport()\`?`,
      options: [
        { label: 'A', text: 'gl.viewport(0, 0, 800, 600) — always match the CSS display size.' },
        { label: 'B', text: 'gl.viewport(0, 0, 1600, 1200) — the viewport must use physical pixel dimensions (canvas.width / canvas.height), not CSS size.' },
        { label: 'C', text: 'gl.viewport(0, 0, 3200, 2400) — multiply by devicePixelRatio a second time for the GPU driver.' },
        { label: 'D', text: 'gl.viewport() is not needed — WebGL automatically uses the full canvas after a resize.' },
      ],
      check: (label) => label === 'B',
      successMessage: 'Correct! gl.viewport(x, y, width, height) maps WebGL\'s clip-space output to a region of the framebuffer. The width and height must match canvas.width and canvas.height — the physical pixel dimensions. Physical = CSS × DPR = 800×2 = 1600, 600×2 = 1200. In Three.js: renderer.setSize(800, 600) combined with renderer.setPixelRatio(2) handles this internally.',
      failMessage: 'gl.viewport must receive physical pixels (canvas.width, canvas.height) not CSS pixels. Physical pixels = CSS × DPR = 800×2=1600, 600×2=1200, so gl.viewport(0, 0, 1600, 1200). D is wrong — gl.viewport is NOT automatic after resizing canvas.width/height. If you skip it, the old viewport remains and your scene renders into a sub-rectangle of the canvas.',
      html: '',
      css: `body{margin:0;padding:0}`,
      startCode: '',
      outputHeight: 300,
    },

    // ── Cell 10: Coding Challenge — write the full animated render loop ────────
    {
      type: 'coding',
      instruction: `### 🎯 Challenge: Write the Animated Render Loop\n\nComplete the three \`// TODO\` lines to build a working animated WebGL canvas.\n\n**Requirements:**\n1. Call \`gl.clearColor()\` with values that **change over time** using \`Math.sin(t)\` or \`Math.cos(t)\`\n2. Call \`gl.clear(gl.COLOR_BUFFER_BIT)\` to wipe the frame\n3. Call \`requestAnimationFrame(loop)\` to keep the animation running\n\nThe check passes when all three are present.`,
      html: `<canvas id="cv" width="560" height="300" style="display:block;width:100%;border-radius:8px"></canvas>`,
      css: `body{margin:0;background:#0a0f1e;padding:10px}`,
      startCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);

var startTime = performance.now();

function loop(now) {
  var t = (now - startTime) / 1000;  // time in seconds

  // TODO 1: gl.clearColor() — use Math.sin(t) or Math.cos(t) so the colour animates
  //         Tip: Math.sin(t) * 0.5 + 0.5 maps the -1..1 range to 0..1

  // TODO 2: gl.clear() — clear the colour buffer each frame

  // TODO 3: requestAnimationFrame — keep the loop running
}

requestAnimationFrame(loop);`,
      solutionCode: `var canvas = document.getElementById('cv');
var gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);

var startTime = performance.now();

function loop(now) {
  var t = (now - startTime) / 1000;

  gl.clearColor(
    Math.sin(t * 0.7) * 0.5 + 0.5,
    Math.sin(t * 0.4 + 2.0) * 0.3 + 0.2,
    Math.cos(t * 0.5) * 0.5 + 0.5,
    1.0
  );

  gl.clear(gl.COLOR_BUFFER_BIT);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);`,
      check: (code) => {
        const hasRAF   = /requestAnimationFrame/.test(code)
        const hasClear = /gl\.clear\s*\(/.test(code)
        const hasAnim  = /Math\.(sin|cos)/.test(code)
        return hasRAF && hasClear && hasAnim
      },
      successMessage: '✓ Animated render loop complete! Your canvas runs at ~60fps with an animated colour driven by elapsed time. This pattern — requestAnimationFrame → clear → draw → repeat — is the heartbeat of every Three.js scene.',
      failMessage: 'Check all three TODOs: 1) gl.clearColor(...Math.sin(t)...) 2) gl.clear(gl.COLOR_BUFFER_BIT) 3) requestAnimationFrame(loop) inside the loop function.',
      outputHeight: 320,
    },

  ],
};

export default {
  id: 'three-js-1-0-window-context',
  slug: 'window-and-context',
  chapter: 'three-js.1',
  order: 0,
  title: 'Window & Context Setup',
  subtitle: 'Creating a WebGL2 context, the render loop, and clearing the screen.',
  tags: ['three-js', 'webgl', 'context', 'render-loop', 'requestanimationframe', 'viewport', 'pixel-ratio'],
  hook: {
    question: 'Three.js renders your scene with one line: renderer.render(scene, camera). But behind that line the GPU ran ~60 commands. What are they — and what happens if one is missing?',
    realWorldContext: 'Every WebGL application — from Google Maps 3D to any game engine — opens with these exact context setup steps. Understanding them once means you can debug any blank-canvas problem in any WebGL app.',
  },
  intuition: {
    prose: [
      'The WebGL context is the controlled interface between JavaScript and your GPU driver.',
      'Every WebGL program: canvas.getContext("webgl2") → gl.clearColor() → gl.clear() → draw.',
      'requestAnimationFrame fires before each screen repaint (~16.67ms at 60Hz). Your render loop lives here.',
      'DeltaTime: multiply all movement by (currentTime - prevTime) in seconds to stay frame-rate independent.',
      'devicePixelRatio: on Retina screens render at 2× resolution. Always pass physical pixels to gl.viewport().',
    ],
    callouts: [
      { type: 'note', title: 'WebGL 1 vs WebGL 2', body: 'Always request WebGL 2 first: getContext("webgl2"). It adds instanced rendering, multiple render targets, and uniform buffer objects. Three.js uses WebGL 2 by default since r125.' },
      { type: 'warning', title: 'Always clear before drawing', body: 'Skipping gl.clear() at the start of each frame causes previous frames to "bleed through" — moving objects leave trails. Always clear first.' },
    ],
    visualizations: [{ id: 'ScienceNotebook', title: 'Window & Context Setup', props: { lesson: LESSON_3JS_1_0 } }],
  },
  math: { prose: [], callouts: [], visualizations: [] },
  rigor: { prose: [], callouts: [], visualizations: [] },
  examples: [], challenges: [],
  mentalModel: [
    'Context = software bridge to GPU. One canvas, one context — cannot share across canvases.',
    'Four-step pattern: get context → set state → issue commands → browser displays.',
    'Render loop: requestAnimationFrame(loop) — fires once per screen repaint, passes high-res timestamp.',
    'DeltaTime: move × (currentTime - prevTime) / 1000. Frame-rate independent on any monitor.',
    'Physical pixels = CSS pixels × devicePixelRatio. gl.viewport() always takes physical pixels.',
  ],
  checkpoints: ['read-intuition'],
  quiz: [],
};

export { LESSON_3JS_1_0 };
