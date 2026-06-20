const sim2_005 = {
  id: 'sim2-005',
  slug: 'animation-loop',
  chapter: 'sim2',
  order: 5,
  title: 'Animation Loop',
  description: 'Use requestAnimationFrame to drive a canvas that updates 60 times a second, and add a time parameter so formulas can produce motion.',

  hook: {
    question: 'How do you make a graph move? How does any animation — a bouncing dot, a spinning wheel, a wave rolling across the screen — actually work in a browser?',
    realWorldContext: 'Every animation you\'ve ever seen in a browser — a loading spinner, a physics simulation, a video game, a Desmos graph animating a slider — runs on the same primitive: `requestAnimationFrame`. The browser calls your function once per screen refresh (roughly 60 times per second), you redraw the canvas, and persistence of vision does the rest. The twist for a function plotter is that "motion" just means passing a changing value of `t` into the formula: `sin(x + t)` looks like a wave traveling to the left. This lesson wires that loop to the plotter.',
  },

  intuition: {
    prose: [
      '`requestAnimationFrame` is the browser\'s invitation to draw one frame of animation. You call it with a callback; the browser calls that callback before the next screen repaint, passes it a timestamp in milliseconds, then waits for you to call `requestAnimationFrame` again to schedule the next frame. The loop is recursive — each frame schedules the next — and the browser throttles it to the display\'s refresh rate so you never burn more frames than the screen can show.',
      'The timestamp passed to your callback is a `DOMHighResTimeStamp` — milliseconds since the page loaded, measured to microsecond precision. It grows continuously: `16.7`, `33.4`, `50.1`, ... You normally want a smaller, slower-moving number for formulas, so divide by 1000 to get seconds: `const t = timestamp / 1000`. A formula like `sin(x + t)` now scrolls one full period per second.',
      'Every frame starts by clearing the previous one. `ctx.clearRect(0, 0, canvas.width, canvas.height)` erases the entire canvas bitmap. If you skip this step, every frame is drawn on top of all previous frames — you get a smear, not an animation. After clearing, read your current state (what expression is active, what `a` value is set) and redraw from scratch. The canvas is always rebuilt from state, never incrementally modified.',
      'Start and stop control matters. A "Play / Pause" button flips a boolean `running` flag and either calls `requestAnimationFrame` to start the loop or stores an animation frame ID so it can be cancelled. `cancelAnimationFrame(id)` tells the browser to skip the next scheduled callback. Without a stop mechanism, multiple presses of Play launch multiple parallel loops — each one redrawing independently, causing flicker and wasted CPU.',
      'The animation frame ID is the handle for cancellation. `const id = requestAnimationFrame(loop)` returns a small integer — the frame ticket. Pass it to `cancelAnimationFrame(id)` to cancel exactly that pending frame. Since each frame re-schedules the next, cancelling one stops the whole chain. It\'s clean and immediate — no timeouts to clear, no flags to poll.',
      'Speed is just a multiplier on `t`. `const t = (elapsed / 1000) * speed` where `speed` is a slider value. At `speed = 1`, the formula evolves at 1 radian per second. At `speed = 3` it runs three times faster. At `speed = 0` it freezes. This is preferable to changing `requestAnimationFrame` — the frame rate stays constant and the apparent speed comes from the formula\'s input changing faster.',
      'Parametric animation extends naturally from scrolling graphs. Instead of `f(x, t)` on a Cartesian axis, parametric motion uses `t` to drive both `x` and `y` of a point: `x(t) = cos(t)`, `y(t) = sin(t)` traces a circle. This is the foundation of Lesson 6 (the unit circle) — the animation loop built here will power it directly.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 10 — Animation Loop',
        body: 'This lesson adds a time dimension to everything built so far. The `requestAnimationFrame` loop introduced here is the engine for Lesson 6 (unit circle), Lesson 9 (function analysis with moving tangent line), and the final capstone. Every animated feature in the remaining lessons is built on this pattern.',
      },
      {
        type: 'definition',
        title: '`requestAnimationFrame`',
        body: 'A browser API that schedules a callback to run before the next screen repaint — typically 60 times per second. Unlike `setInterval`, it automatically pauses when the tab is hidden, syncs to the monitor\'s refresh rate, and passes a high-precision timestamp. Always prefer it over `setInterval` for canvas animation.',
      },
      {
        type: 'procedure',
        title: 'The Animation Loop Pattern',
        body: '(1) Define `function loop(ts)` that clears the canvas, reads current state, draws the frame, then calls `requestAnimationFrame(loop)`. (2) Store the returned ID in `let animId`. (3) To stop: `cancelAnimationFrame(animId)`. (4) To start: `animId = requestAnimationFrame(loop)`. Never call `loop()` directly — always schedule through `rAF` so timing stays in sync with the display.',
      },
      {
        type: 'warning',
        title: 'Always Cancel Before Restarting',
        body: 'Clicking "Play" twice without cancelling the first loop spawns two parallel loops. Both call `requestAnimationFrame` every frame, doubling the draw calls and causing visible flicker. Guard with `cancelAnimationFrame(animId)` at the start of every Play press, even if you think the loop isn\'t running.',
      },
      {
        type: 'insight',
        title: 'Time in Seconds, Not Milliseconds',
        body: '`requestAnimationFrame` gives milliseconds — values like `16700`. Formulas expect small numbers around `0–6`. Always divide: `const t = timestamp / 1000`. A sine wave with `t` in seconds scrolls one full period in ~6.28 seconds, which looks natural. In milliseconds the same wave would flicker invisibly fast.',
      },
      {
        type: 'insight',
        title: 'Clear First, Draw Second — Every Frame',
        body: '`ctx.clearRect(0, 0, canvas.width, canvas.height)` must be the first drawing call of every frame. Canvas drawing is additive: every new stroke is painted on top of all previous strokes. If you don\'t clear, you\'ll see every historical position of the curve simultaneously — a smear, not a moving graph.',
      },
      {
        type: 'definition',
        title: 'Speed Multiplier',
        body: 'Control animation speed by scaling `t`: `const t = (elapsed / 1000) * speed`. Keep the frame rate fixed at 60fps and vary only how fast `t` advances. A `speed` slider from 0 to 3 gives a natural range from frozen to visibly fast. Speed = 0 pauses; speed = 1 is real-time; speed = 3 is 3× faster.',
      },
      {
        type: 'procedure',
        title: 'CSS Variable Reading Inside the Loop',
        body: 'Call `getColors()` inside `loop()`, not outside it. The user might switch themes while the animation is running. If you cache colors once at startup, they go stale on theme switch. Reading `getComputedStyle` each frame costs almost nothing compared to canvas drawing operations.',
      },
      {
        type: 'strategy',
        title: 'Build the Loop in Stages',
        body: 'Cell 1 draws a static frame via a single `rAF` call — proves the draw pipeline works. Cell 2 adds time: `t = timestamp / 1000` passed into the formula. Cell 3 wires Play/Pause to `running` state. Cell 4 adds a speed slider and preset picker. Each cell adds exactly one concept and is independently runnable.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Animation Loop',
        mathBridge: 'The four cells below build the animation loop in stages: first a single `requestAnimationFrame` call to prove the draw pipeline, then a time parameter `t` added to the formula, then Play/Pause control, and finally a speed slider with presets. Each cell is independent and runnable on its own.',
        initialProps: {
          initialCells: [
            // ── Cell 1: requestAnimationFrame Basics ─────────────────────────────
            {
              id: 1,
              mode: 'html',
              cellTitle: 'requestAnimationFrame Basics',
              prose: [
                'Before adding time, let\'s make sure the draw pipeline works with `requestAnimationFrame`. The loop calls itself once per frame, but `t` is fixed at 0 — the graph doesn\'t move yet.',
                'Key structure: define `function loop(timestamp)`, clear the canvas, draw, then call `requestAnimationFrame(loop)` at the end. The browser handles the 60fps timing automatically. Watch the frame counter in the info bar to confirm the loop is running.',
              ],
              code: `// ── requestAnimationFrame basics — static frame ─────────────────────────────
// Goal: prove the draw pipeline works before adding motion.
// t is fixed at 0, but rAF is running — the frame counter will increase.

app.innerHTML = \`
  <style>
    html, body { height: 100%; margin: 0 }
    * { box-sizing: border-box; font-family: system-ui, sans-serif }
    body, #app { background: var(--bg) }
    .wrap  { height: 100%; padding: 12px; display: flex; flex-direction: column; gap: 8px; overflow: hidden }
    h3     { font-size: 14px; font-weight: 600; color: var(--text); flex-shrink: 0 }
    canvas { flex: 1; min-height: 0; display: block; width: 100%;
             border: 1px solid var(--border); background: var(--surface) }
    #info  { font-size: 12px; color: var(--muted); flex-shrink: 0 }
  </style>
  <div class="wrap">
    <h3>rAF — Static Frame</h3>
    <canvas id="c"></canvas>
    <div id="info">frame: 0 | t: 0.000 s</div>
  </div>
\`

const canvas = document.getElementById('c')
const ctx    = canvas.getContext('2d')
const info   = document.getElementById('info')

// Read CSS variables — called each frame so theme changes update live
function getColors() {
  const cs = getComputedStyle(document.documentElement)
  return {
    surface: cs.getPropertyValue('--surface').trim(),
    border:  cs.getPropertyValue('--border').trim(),
    muted:   cs.getPropertyValue('--muted').trim(),
    accent:  cs.getPropertyValue('--accent').trim(),
  }
}

function drawAxes(W, H, clr) {
  ctx.strokeStyle = clr; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2)   // x-axis
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H)   // y-axis
  ctx.stroke()
}

function plotCurve(fn, W, H, clr) {
  const xMin = -Math.PI * 2, xMax = Math.PI * 2, yMin = -2, yMax = 2
  ctx.beginPath(); ctx.strokeStyle = clr; ctx.lineWidth = 2
  let penDown = false
  for (let px = 0; px < W; px++) {
    const x = xMin + (px / W) * (xMax - xMin)
    let y; try { y = fn(x) } catch { penDown = false; continue }
    if (!isFinite(y)) { penDown = false; continue }
    const py = H - ((y - yMin) / (yMax - yMin)) * H
    if (!penDown) { ctx.moveTo(px, py); penDown = true } else ctx.lineTo(px, py)
  }
  ctx.stroke()
}

let frame = 0

function loop(timestamp) {
  // Sync canvas pixel buffer to its CSS display size each frame
  canvas.width  = canvas.clientWidth  || 440
  canvas.height = canvas.clientHeight || 280

  const W = canvas.width, H = canvas.height
  const c = getColors()

  // 1. Clear — always the first step, every frame
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = c.surface; ctx.fillRect(0, 0, W, H)

  // 2. Axes and curve at fixed t = 0
  drawAxes(W, H, c.border)
  plotCurve((x) => Math.sin(x), W, H, c.accent)

  // 3. Update info bar
  frame++
  info.textContent = \`frame: \${frame} | t: 0.000 s (fixed)\`

  // 4. Schedule next frame — this is what makes it a loop
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)`,
            },

            // ── Cell 2: Adding Time ───────────────────────────────────────────────
            {
              id: 2,
              mode: 'html',
              cellTitle: 'Adding Time',
              prose: [
                'Now we use the `timestamp` that `requestAnimationFrame` passes in. Divide by 1000 to get seconds, then pass `t` into the formula as a second argument.',
                '`sin(x + t)` looks like a wave rolling left. Try swapping the formula to `sin(x * 2 + t)` or `sin(x + t) * cos(t * 0.5)` to see different motions. Change `EXPR` at the top — nothing else needs to change.',
              ],
              code: `// ── Adding time — the wave moves ────────────────────────────────────────────
// t = timestamp / 1000  → grows from 0 at page load, measured in seconds.
// Passing t into sin(x + t) scrolls the wave left as t increases.

// ↓ Change this to try different animated formulas
const EXPR = 'sin(x + t)'

app.innerHTML = \`
  <style>
    html, body { height: 100%; margin: 0 }
    * { box-sizing: border-box; font-family: system-ui, sans-serif }
    body, #app { background: var(--bg) }
    .wrap  { height: 100%; padding: 12px; display: flex; flex-direction: column; gap: 8px; overflow: hidden }
    h3     { font-size: 14px; font-weight: 600; color: var(--text); flex-shrink: 0 }
    canvas { flex: 1; min-height: 0; display: block; width: 100%;
             border: 1px solid var(--border); background: var(--surface) }
    #info  { font-size: 12px; color: var(--muted); flex-shrink: 0 }
  </style>
  <div class="wrap">
    <h3>rAF — Animated Wave</h3>
    <canvas id="c"></canvas>
    <div id="info">t: 0.000 s</div>
  </div>
\`

const canvas = document.getElementById('c')
const ctx    = canvas.getContext('2d')
const info   = document.getElementById('info')

function getColors() {
  const cs = getComputedStyle(document.documentElement)
  return {
    surface: cs.getPropertyValue('--surface').trim(),
    border:  cs.getPropertyValue('--border').trim(),
    accent:  cs.getPropertyValue('--accent').trim(),
  }
}

function makeFormula(expr) {
  const body = expr
    .replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan').replace(/sqrt/g, 'Math.sqrt')
    .replace(/abs/g, 'Math.abs').replace(/PI/g, 'Math.PI')
    .replace(/\\^/g, '**')
  // Two parameters: x (position) and t (time)
  return new Function('x', 't', \`return \${body}\`)
}

const fn = makeFormula(EXPR)

function loop(timestamp) {
  canvas.width  = canvas.clientWidth  || 440
  canvas.height = canvas.clientHeight || 280
  const W = canvas.width, H = canvas.height
  const c = getColors()

  // Convert milliseconds → seconds
  const t = timestamp / 1000

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = c.surface; ctx.fillRect(0, 0, W, H)

  // Axes
  ctx.strokeStyle = c.border; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2)
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H)
  ctx.stroke()

  // Curve — passes t into the formula each frame
  const xMin = -Math.PI * 2, xMax = Math.PI * 2, yMin = -2, yMax = 2
  ctx.beginPath(); ctx.strokeStyle = c.accent; ctx.lineWidth = 2
  let penDown = false
  for (let px = 0; px < W; px++) {
    const x = xMin + (px / W) * (xMax - xMin)
    let y; try { y = fn(x, t) } catch { penDown = false; continue }
    if (!isFinite(y)) { penDown = false; continue }
    const py = H - ((y - yMin) / (yMax - yMin)) * H
    if (!penDown) { ctx.moveTo(px, py); penDown = true } else ctx.lineTo(px, py)
  }
  ctx.stroke()

  info.textContent = \`t: \${t.toFixed(3)} s | f(x,t) = \${EXPR}\`
  requestAnimationFrame(loop)
}

requestAnimationFrame(loop)`,
            },

            // ── Cell 3: Play / Pause ──────────────────────────────────────────────
            {
              id: 3,
              mode: 'html',
              cellTitle: 'Play / Pause Control',
              prose: [
                'Without a stop mechanism, the loop runs forever — clicking Play twice spawns two parallel loops causing flicker.',
                'The fix: store the frame ID from `requestAnimationFrame` and cancel it with `cancelAnimationFrame(animId)`. Resuming from where the animation paused (not from t=0) requires saving `tOffset` when the user pauses.',
              ],
              code: `// ── Play / Pause with time accumulation ─────────────────────────────────────
// tOffset: seconds elapsed before the last pause
// startTs:  browser timestamp when Play was pressed
// t = tOffset + (now - startTs) / 1000  → continuous across pause/resume

app.innerHTML = \`
  <style>
    html, body { height: 100%; margin: 0 }
    * { box-sizing: border-box; font-family: system-ui, sans-serif }
    body, #app { background: var(--bg) }
    .wrap  { height: 100%; padding: 12px; display: flex; flex-direction: column; gap: 8px; overflow: hidden }
    h3     { font-size: 14px; font-weight: 600; color: var(--text); flex-shrink: 0 }
    canvas { flex: 1; min-height: 0; display: block; width: 100%;
             border: 1px solid var(--border); background: var(--surface) }
    .ctrls { display: flex; gap: 8px; align-items: center; flex-shrink: 0 }
    button { padding: 5px 16px; border: none; border-radius: 8px; cursor: pointer;
             background: var(--accent); color: var(--surface); font-weight: 600; font-size: 12px }
    button:disabled { opacity: 0.4; cursor: default }
    #info  { font-size: 12px; color: var(--muted); flex-shrink: 0 }
  </style>
  <div class="wrap">
    <h3>rAF — Play / Pause</h3>
    <canvas id="c"></canvas>
    <div class="ctrls">
      <button id="playBtn">Play</button>
      <button id="pauseBtn" disabled>Pause</button>
      <span id="info">paused at t = 0.000 s</span>
    </div>
  </div>
\`

const canvas   = document.getElementById('c')
const ctx      = canvas.getContext('2d')
const playBtn  = document.getElementById('playBtn')
const pauseBtn = document.getElementById('pauseBtn')
const info     = document.getElementById('info')

function getColors() {
  const cs = getComputedStyle(document.documentElement)
  return {
    surface: cs.getPropertyValue('--surface').trim(),
    border:  cs.getPropertyValue('--border').trim(),
    accent:  cs.getPropertyValue('--accent').trim(),
  }
}

function drawFrame(t) {
  canvas.width  = canvas.clientWidth  || 440
  canvas.height = canvas.clientHeight || 280
  const W = canvas.width, H = canvas.height
  const c = getColors()

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = c.surface; ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = c.border; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2)
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H)
  ctx.stroke()

  const xMin = -Math.PI * 2, xMax = Math.PI * 2, yMin = -2, yMax = 2
  ctx.beginPath(); ctx.strokeStyle = c.accent; ctx.lineWidth = 2
  let penDown = false
  for (let px = 0; px < W; px++) {
    const x = xMin + (px / W) * (xMax - xMin)
    const y = Math.sin(x + t)
    const py = H - ((y - yMin) / (yMax - yMin)) * H
    if (!penDown) { ctx.moveTo(px, py); penDown = true } else ctx.lineTo(px, py)
  }
  ctx.stroke()
  info.textContent = \`t = \${t.toFixed(3)} s\`
}

// ── State ─────────────────────────────────────────────────────────────────────
let running = false
let animId  = null
let tOffset = 0       // accumulated time before last pause
let startTs = null    // browser timestamp when Play was pressed

function loop(timestamp) {
  if (!running) return
  const t = tOffset + (timestamp - startTs) / 1000
  drawFrame(t)
  animId = requestAnimationFrame(loop)
}

playBtn.addEventListener('click', () => {
  if (running) return
  running = true
  startTs = performance.now()
  playBtn.disabled = true; pauseBtn.disabled = false
  cancelAnimationFrame(animId)   // cancel any stale pending frame
  animId = requestAnimationFrame(loop)
})

pauseBtn.addEventListener('click', () => {
  if (!running) return
  running = false
  tOffset += (performance.now() - startTs) / 1000   // bank elapsed time
  cancelAnimationFrame(animId)
  playBtn.disabled = false; pauseBtn.disabled = true
})

// Draw the initial static frame at t = 0
requestAnimationFrame(() => drawFrame(0))`,
            },

            // ── Cell 4: Speed Slider + Preset Picker ─────────────────────────────
            {
              id: 4,
              mode: 'html',
              cellTitle: 'Speed Slider + Preset Picker',
              prose: [
                'The final cell combines everything from Lessons 4 and 5: preset picker, speed slider, and the animation loop. State has three variables: `active` (which formula), `speed` (how fast time advances), `running`.',
                'Speed works as a multiplier on elapsed time: `t = tOffset + elapsed * speed`. Frame rate stays constant — only how fast `t` grows changes. This is the fully interactive animated plotter.',
              ],
              code: `// ── Animated plotter: presets + speed slider + Play/Pause ───────────────────
// State: active (preset index), speed (time multiplier), running (bool)
// Three controls, one render function, one canvas.

app.innerHTML = \`
  <style>
    html, body { height: 100%; margin: 0 }
    * { box-sizing: border-box; font-family: system-ui, sans-serif }
    body, #app { background: var(--bg) }
    .wrap     { height: 100%; padding: 12px; display: flex; flex-direction: column; gap: 7px; overflow: hidden }
    h3        { font-size: 13px; font-weight: 600; color: var(--text); flex-shrink: 0 }
    #presets  { display: flex; gap: 5px; flex-wrap: wrap; flex-shrink: 0 }
    canvas    { flex: 1; min-height: 0; display: block; width: 100%;
                border: 1px solid var(--border); background: var(--surface) }
    .pbtn {
      padding: 3px 10px; border-radius: 7px; cursor: pointer; font-size: 12px;
      border: 1.5px solid var(--border); background: var(--surface); color: var(--muted)
    }
    .pbtn.active {
      background: var(--accent-bg); border-color: var(--accent); color: var(--accent); font-weight: 700
    }
    .ctrls    { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; flex-shrink: 0 }
    .cbtn     { padding: 4px 14px; border: none; border-radius: 7px; cursor: pointer;
                background: var(--accent); color: var(--surface); font-weight: 600; font-size: 12px }
    .cbtn:disabled { opacity: 0.4; cursor: default }
    .srow     { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text) }
    input[type=range] { width: 80px; accent-color: var(--accent) }
    .sv       { color: var(--accent); font-weight: 700; min-width: 28px }
    #info     { font-size: 11px; color: var(--muted); flex-shrink: 0 }
  </style>
  <div class="wrap">
    <h3>Animated Function Plotter</h3>
    <div id="presets"></div>
    <canvas id="c"></canvas>
    <div class="ctrls">
      <button class="cbtn" id="playBtn">Play</button>
      <button class="cbtn" id="pauseBtn" disabled>Pause</button>
      <div class="srow">
        Speed: <input type="range" id="speedSlider" min="0" max="3" step="0.1" value="1">
        <span class="sv" id="speedVal">1.0×</span>
      </div>
    </div>
    <div id="info">paused — press Play</div>
  </div>
\`

const canvas      = document.getElementById('c')
const ctx         = canvas.getContext('2d')
const presetsDiv  = document.getElementById('presets')
const playBtn     = document.getElementById('playBtn')
const pauseBtn    = document.getElementById('pauseBtn')
const speedSlider = document.getElementById('speedSlider')
const speedVal    = document.getElementById('speedVal')
const info        = document.getElementById('info')

// ── Preset data ───────────────────────────────────────────────────────────────
const presets = [
  { label: 'sin(x+t)',      expr: 'sin(x + t)' },
  { label: 'sin(2x+t)',     expr: 'sin(2*x + t)' },
  { label: 'cos(x)·sin(t)', expr: 'cos(x) * sin(t)' },
  { label: 'sin(x+t)/x',   expr: 'sin(x + t) / x' },
  { label: 'sin(x²+t)',    expr: 'sin(x*x + t)' },
]

// ── State ─────────────────────────────────────────────────────────────────────
let active  = 0
let speed   = 1
let running = false
let animId  = null
let tOffset = 0
let startTs = null

function makeFormula(expr) {
  const body = expr
    .replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan').replace(/sqrt/g, 'Math.sqrt')
    .replace(/abs/g, 'Math.abs').replace(/PI/g, 'Math.PI')
    .replace(/\\^/g, '**')
  try { return new Function('x', 't', \`return \${body}\`) } catch { return () => NaN }
}

function getColors() {
  const cs = getComputedStyle(document.documentElement)
  return {
    surface: cs.getPropertyValue('--surface').trim(),
    border:  cs.getPropertyValue('--border').trim(),
    muted:   cs.getPropertyValue('--muted').trim(),
    accent:  cs.getPropertyValue('--accent').trim(),
  }
}

function drawFrame(t) {
  canvas.width  = canvas.clientWidth  || 440
  canvas.height = canvas.clientHeight || 220
  const W = canvas.width, H = canvas.height
  const c  = getColors()
  const fn = makeFormula(presets[active].expr)

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = c.surface; ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = c.border; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2)
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H)
  ctx.stroke()

  const xMin = -Math.PI * 2, xMax = Math.PI * 2, yMin = -2, yMax = 2
  ctx.beginPath(); ctx.strokeStyle = c.accent; ctx.lineWidth = 2
  let penDown = false
  for (let px = 0; px < W; px++) {
    const x = xMin + (px / W) * (xMax - xMin)
    let y; try { y = fn(x, t) } catch { penDown = false; continue }
    if (!isFinite(y)) { penDown = false; continue }
    const py = H - ((y - yMin) / (yMax - yMin)) * H
    if (!penDown) { ctx.moveTo(px, py); penDown = true } else ctx.lineTo(px, py)
  }
  ctx.stroke()

  info.textContent = running
    ? \`t = \${t.toFixed(3)} s | \${presets[active].expr}\`
    : \`paused at t = \${t.toFixed(3)} s\`
}

function loop(timestamp) {
  if (!running) return
  const t = tOffset + ((timestamp - startTs) / 1000) * speed
  drawFrame(t)
  animId = requestAnimationFrame(loop)
}

playBtn.addEventListener('click', () => {
  if (running) return
  running = true; startTs = performance.now()
  playBtn.disabled = true; pauseBtn.disabled = false
  cancelAnimationFrame(animId)
  animId = requestAnimationFrame(loop)
})

pauseBtn.addEventListener('click', () => {
  if (!running) return
  running = false
  tOffset += ((performance.now() - startTs) / 1000) * speed
  cancelAnimationFrame(animId)
  playBtn.disabled = false; pauseBtn.disabled = true
  drawFrame(tOffset)
})

speedSlider.addEventListener('input', () => {
  if (running) {
    // Bank time at old speed before switching so t stays continuous
    tOffset += ((performance.now() - startTs) / 1000) * speed
    startTs = performance.now()
  }
  speed = parseFloat(speedSlider.value)
  speedVal.textContent = speed.toFixed(1) + '×'
})

function buildButtons() {
  presetsDiv.innerHTML = ''
  presets.forEach((p, i) => {
    const btn = document.createElement('button')
    btn.className = 'pbtn'
    btn.textContent = p.label
    btn.classList.toggle('active', i === active)
    btn.addEventListener('click', () => {
      active = i; buildButtons()
      tOffset = 0
      if (running) startTs = performance.now()
      drawFrame(0)
    })
    presetsDiv.appendChild(btn)
  })
}

buildButtons()
requestAnimationFrame(() => drawFrame(0))`,
            },

            // ── Challenge 1 ───────────────────────────────────────────────────────
            {
              id: 'c1',
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Add Animated Presets',
              difficulty: 'easy',
              prose: [
                'Two new entries have been added to the `presets` array with placeholder expressions. Replace each `\'???\'` with a real animated formula.',
                'Try `\'tan(x + t)\'` for one — you\'ll see discontinuities handled by the `penDown` logic. Try `\'sin(x + t) + sin(2*x + t*0.5)\'` for the other — two waves at different speeds produce interference patterns.',
                'Run it and use the preset buttons to switch between all five formulas.',
              ],
              hint: 'Replace the `\'???\'` expressions. Any formula using `x` and `t` works. `tan(x+t)` shows vertical asymptotes. `sin(x+t)+sin(2*x+t*0.5)` layers two waves at different speeds.',
              code: `app.innerHTML = \`
  <style>
    html, body { height: 100%; margin: 0 }
    * { box-sizing: border-box; font-family: system-ui, sans-serif }
    body, #app { background: var(--bg) }
    .wrap    { height: 100%; padding: 12px; display: flex; flex-direction: column; gap: 7px; overflow: hidden }
    h3       { font-size: 13px; font-weight: 600; color: var(--text); flex-shrink: 0 }
    #presets { display: flex; gap: 5px; flex-wrap: wrap; flex-shrink: 0 }
    canvas   { flex: 1; min-height: 0; display: block; width: 100%;
               border: 1px solid var(--border); background: var(--surface) }
    .pbtn { padding: 3px 10px; border-radius: 7px; cursor: pointer; font-size: 12px;
            border: 1.5px solid var(--border); background: var(--surface); color: var(--muted) }
    .pbtn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); font-weight: 700 }
    .ctrls { display: flex; gap: 7px; align-items: center; flex-shrink: 0 }
    .cbtn  { padding: 4px 14px; border: none; border-radius: 7px; cursor: pointer;
             background: var(--accent); color: var(--surface); font-weight: 600; font-size: 12px }
    .cbtn:disabled { opacity: 0.4; cursor: default }
    .srow  { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text) }
    input[type=range] { width: 80px; accent-color: var(--accent) }
    .sv    { color: var(--accent); font-weight: 700; min-width: 28px }
    #info  { font-size: 11px; color: var(--muted); flex-shrink: 0 }
  </style>
  <div class="wrap">
    <h3>Animated Function Plotter</h3>
    <div id="presets"></div>
    <canvas id="c"></canvas>
    <div class="ctrls">
      <button class="cbtn" id="playBtn">Play</button>
      <button class="cbtn" id="pauseBtn" disabled>Pause</button>
      <div class="srow">
        Speed: <input type="range" id="speedSlider" min="0" max="3" step="0.1" value="1">
        <span class="sv" id="speedVal">1.0×</span>
      </div>
    </div>
    <div id="info">paused — press Play</div>
  </div>
\`

const canvas      = document.getElementById('c')
const ctx         = canvas.getContext('2d')
const presetsDiv  = document.getElementById('presets')
const playBtn     = document.getElementById('playBtn')
const pauseBtn    = document.getElementById('pauseBtn')
const speedSlider = document.getElementById('speedSlider')
const speedVal    = document.getElementById('speedVal')
const info        = document.getElementById('info')

// ── TODO: replace the two '???' expressions with real animated formulas ───────
const presets = [
  { label: 'sin(x+t)',      expr: 'sin(x + t)' },
  { label: 'sin(2x+t)',     expr: 'sin(2*x + t)' },
  { label: 'cos(x)·sin(t)', expr: 'cos(x) * sin(t)' },
  { label: 'preset 4',      expr: '???' },   // ← replace '???' with a formula
  { label: 'preset 5',      expr: '???' },   // ← replace '???' with a formula
]

let active = 0, speed = 1, running = false, animId = null, tOffset = 0, startTs = null

function makeFormula(expr) {
  const body = expr.replace(/sin/g,'Math.sin').replace(/cos/g,'Math.cos')
    .replace(/tan/g,'Math.tan').replace(/sqrt/g,'Math.sqrt')
    .replace(/abs/g,'Math.abs').replace(/PI/g,'Math.PI').replace(/\\^/g,'**')
  try { return new Function('x','t',\`return \${body}\`) } catch { return ()=>NaN }
}

function getColors() {
  const cs = getComputedStyle(document.documentElement)
  return { surface:cs.getPropertyValue('--surface').trim(), border:cs.getPropertyValue('--border').trim(),
           accent:cs.getPropertyValue('--accent').trim() }
}

function drawFrame(t) {
  canvas.width = canvas.clientWidth || 440; canvas.height = canvas.clientHeight || 220
  const W = canvas.width, H = canvas.height, c = getColors(), fn = makeFormula(presets[active].expr)
  ctx.clearRect(0,0,W,H); ctx.fillStyle=c.surface; ctx.fillRect(0,0,W,H)
  ctx.strokeStyle=c.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke()
  const xMin=-Math.PI*2, xMax=Math.PI*2, yMin=-2, yMax=2
  ctx.beginPath(); ctx.strokeStyle=c.accent; ctx.lineWidth=2
  let pen=false
  for(let px=0;px<W;px++){
    const x=xMin+(px/W)*(xMax-xMin); let y; try{y=fn(x,t)}catch{pen=false;continue}
    if(!isFinite(y)){pen=false;continue}
    const py=H-((y-yMin)/(yMax-yMin))*H
    if(!pen){ctx.moveTo(px,py);pen=true}else ctx.lineTo(px,py)
  }
  ctx.stroke()
  info.textContent = running ? \`t=\${t.toFixed(2)}s | \${presets[active].expr}\` : \`paused t=\${t.toFixed(2)}s\`
}

function loop(ts) {
  if(!running) return
  const t = tOffset+((ts-startTs)/1000)*speed
  drawFrame(t); animId=requestAnimationFrame(loop)
}

playBtn.addEventListener('click',()=>{
  if(running) return; running=true; startTs=performance.now()
  playBtn.disabled=true; pauseBtn.disabled=false
  cancelAnimationFrame(animId); animId=requestAnimationFrame(loop)
})
pauseBtn.addEventListener('click',()=>{
  if(!running) return; running=false
  tOffset+=((performance.now()-startTs)/1000)*speed
  cancelAnimationFrame(animId); playBtn.disabled=false; pauseBtn.disabled=true; drawFrame(tOffset)
})
speedSlider.addEventListener('input',()=>{
  if(running){tOffset+=((performance.now()-startTs)/1000)*speed;startTs=performance.now()}
  speed=parseFloat(speedSlider.value); speedVal.textContent=speed.toFixed(1)+'×'
})

function buildButtons() {
  presetsDiv.innerHTML=''
  presets.forEach((p,i)=>{
    const btn=document.createElement('button'); btn.className='pbtn'; btn.textContent=p.label
    btn.classList.toggle('active',i===active)
    btn.addEventListener('click',()=>{ active=i; buildButtons(); tOffset=0; if(running)startTs=performance.now(); drawFrame(0) })
    presetsDiv.appendChild(btn)
  })
}

buildButtons(); requestAnimationFrame(()=>drawFrame(0))`,
            },

            // ── Challenge 2 ───────────────────────────────────────────────────────
            {
              id: 'c2',
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Snap to Nearest Second',
              difficulty: 'medium',
              prose: [
                'A "Snap" button has been added to the controls row and its click handler is wired up — but the body of the handler is not written yet.',
                'When clicked, it should: (1) pause the animation, (2) round `t` to the nearest integer second using `Math.round`, (3) store the result in `tOffset`, (4) redraw the canvas at that snapped time.',
                'After snapping, pressing Play should resume from the snapped position — check that `startTs` is reset correctly.',
              ],
              hint: 'Inside the snap handler: compute current `t` as `tOffset + ((performance.now() - startTs) / 1000) * speed` if running. Then: `running = false; cancelAnimationFrame(animId); tOffset = Math.round(t); playBtn.disabled = false; pauseBtn.disabled = true; drawFrame(tOffset)`.',
              code: `app.innerHTML = \`
  <style>
    html, body { height: 100%; margin: 0 }
    * { box-sizing: border-box; font-family: system-ui, sans-serif }
    body, #app { background: var(--bg) }
    .wrap    { height: 100%; padding: 12px; display: flex; flex-direction: column; gap: 7px; overflow: hidden }
    h3       { font-size: 13px; font-weight: 600; color: var(--text); flex-shrink: 0 }
    #presets { display: flex; gap: 5px; flex-wrap: wrap; flex-shrink: 0 }
    canvas   { flex: 1; min-height: 0; display: block; width: 100%;
               border: 1px solid var(--border); background: var(--surface) }
    .pbtn { padding: 3px 10px; border-radius: 7px; cursor: pointer; font-size: 12px;
            border: 1.5px solid var(--border); background: var(--surface); color: var(--muted) }
    .pbtn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); font-weight: 700 }
    .ctrls { display: flex; gap: 7px; align-items: center; flex-shrink: 0 }
    .cbtn  { padding: 4px 14px; border: none; border-radius: 7px; cursor: pointer;
             background: var(--accent); color: var(--surface); font-weight: 600; font-size: 12px }
    .cbtn:disabled { opacity: 0.4; cursor: default }
    .snap  { background: var(--surface); color: var(--text); border: 1.5px solid var(--border) }
    .srow  { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text) }
    input[type=range] { width: 80px; accent-color: var(--accent) }
    .sv    { color: var(--accent); font-weight: 700; min-width: 28px }
    #info  { font-size: 11px; color: var(--muted); flex-shrink: 0 }
  </style>
  <div class="wrap">
    <h3>Animated Plotter — Snap</h3>
    <div id="presets"></div>
    <canvas id="c"></canvas>
    <div class="ctrls">
      <button class="cbtn" id="playBtn">Play</button>
      <button class="cbtn" id="pauseBtn" disabled>Pause</button>
      <button class="cbtn snap" id="snapBtn">Snap ⌖</button>
      <div class="srow">
        Speed: <input type="range" id="speedSlider" min="0" max="3" step="0.1" value="1">
        <span class="sv" id="speedVal">1.0×</span>
      </div>
    </div>
    <div id="info">paused — press Play</div>
  </div>
\`

const canvas      = document.getElementById('c')
const ctx         = canvas.getContext('2d')
const presetsDiv  = document.getElementById('presets')
const playBtn     = document.getElementById('playBtn')
const pauseBtn    = document.getElementById('pauseBtn')
const snapBtn     = document.getElementById('snapBtn')
const speedSlider = document.getElementById('speedSlider')
const speedVal    = document.getElementById('speedVal')
const info        = document.getElementById('info')

const presets = [
  { label: 'sin(x+t)',      expr: 'sin(x + t)' },
  { label: 'sin(2x+t)',     expr: 'sin(2*x + t)' },
  { label: 'cos(x)·sin(t)', expr: 'cos(x) * sin(t)' },
  { label: 'sin(x+t)/x',   expr: 'sin(x + t) / x' },
  { label: 'sin(x²+t)',    expr: 'sin(x*x + t)' },
]

let active = 0, speed = 1, running = false, animId = null, tOffset = 0, startTs = null

function makeFormula(expr) {
  const body = expr.replace(/sin/g,'Math.sin').replace(/cos/g,'Math.cos')
    .replace(/tan/g,'Math.tan').replace(/sqrt/g,'Math.sqrt')
    .replace(/abs/g,'Math.abs').replace(/PI/g,'Math.PI').replace(/\\^/g,'**')
  try { return new Function('x','t',\`return \${body}\`) } catch { return ()=>NaN }
}

function getColors() {
  const cs = getComputedStyle(document.documentElement)
  return { surface:cs.getPropertyValue('--surface').trim(), border:cs.getPropertyValue('--border').trim(),
           accent:cs.getPropertyValue('--accent').trim() }
}

function drawFrame(t) {
  canvas.width = canvas.clientWidth || 440; canvas.height = canvas.clientHeight || 220
  const W = canvas.width, H = canvas.height, c = getColors(), fn = makeFormula(presets[active].expr)
  ctx.clearRect(0,0,W,H); ctx.fillStyle=c.surface; ctx.fillRect(0,0,W,H)
  ctx.strokeStyle=c.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke()
  const xMin=-Math.PI*2, xMax=Math.PI*2, yMin=-2, yMax=2
  ctx.beginPath(); ctx.strokeStyle=c.accent; ctx.lineWidth=2; let pen=false
  for(let px=0;px<W;px++){
    const x=xMin+(px/W)*(xMax-xMin); let y; try{y=fn(x,t)}catch{pen=false;continue}
    if(!isFinite(y)){pen=false;continue}
    const py=H-((y-yMin)/(yMax-yMin))*H
    if(!pen){ctx.moveTo(px,py);pen=true}else ctx.lineTo(px,py)
  }
  ctx.stroke()
  info.textContent = running ? \`t=\${t.toFixed(3)}s | \${presets[active].expr}\` : \`paused t=\${t.toFixed(3)}s\`
}

function loop(ts) {
  if(!running) return
  drawFrame(tOffset+((ts-startTs)/1000)*speed); animId=requestAnimationFrame(loop)
}

playBtn.addEventListener('click',()=>{
  if(running) return; running=true; startTs=performance.now()
  playBtn.disabled=true; pauseBtn.disabled=false
  cancelAnimationFrame(animId); animId=requestAnimationFrame(loop)
})
pauseBtn.addEventListener('click',()=>{
  if(!running) return; running=false
  tOffset+=((performance.now()-startTs)/1000)*speed
  cancelAnimationFrame(animId); playBtn.disabled=false; pauseBtn.disabled=true; drawFrame(tOffset)
})
speedSlider.addEventListener('input',()=>{
  if(running){tOffset+=((performance.now()-startTs)/1000)*speed;startTs=performance.now()}
  speed=parseFloat(speedSlider.value); speedVal.textContent=speed.toFixed(1)+'×'
})

snapBtn.addEventListener('click', () => {
  // TODO: implement snap to nearest second
  // 1. Compute the current t value (use running state, tOffset, startTs, speed)
  // 2. Round to nearest integer with Math.round
  // 3. Stop the loop, update tOffset, reset button states
  // 4. Redraw at the snapped time
  console.log('snap not implemented yet')
})

function buildButtons() {
  presetsDiv.innerHTML=''
  presets.forEach((p,i)=>{
    const btn=document.createElement('button'); btn.className='pbtn'; btn.textContent=p.label
    btn.classList.toggle('active',i===active)
    btn.addEventListener('click',()=>{ active=i; buildButtons(); tOffset=0; if(running)startTs=performance.now(); drawFrame(0) })
    presetsDiv.appendChild(btn)
  })
}

buildButtons(); requestAnimationFrame(()=>drawFrame(0))`,
            },

            // ── Challenge 3 ───────────────────────────────────────────────────────
            {
              id: 'c3',
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Dual-Wave Superposition',
              difficulty: 'hard',
              prose: [
                'A second speed slider has been added (`speedB`). The state now has `speedA`, `speedB`, `tOffsetA`, `tOffsetB` — two independent time variables.',
                'Inside `drawFrame(tA, tB)`, the first curve is already drawn. Add a second `plotCurve` call that uses `tB` and draws in `c.muted` color.',
                'Inside `loop(ts)`, compute both `tA` and `tB` using their respective speeds, then call `drawFrame(tA, tB)`.',
              ],
              hint: 'In `loop`: `const tA = tOffsetA + elapsed * speedA; const tB = tOffsetB + elapsed * speedB`. In `drawFrame`: call the curve-drawing code twice — once with `tA` and `c.accent`, once with `tB` and `c.muted`. On pause, bank both: `tOffsetA += elapsed * speedA; tOffsetB += elapsed * speedB`.',
              code: `app.innerHTML = \`
  <style>
    html, body { height: 100%; margin: 0 }
    * { box-sizing: border-box; font-family: system-ui, sans-serif }
    body, #app { background: var(--bg) }
    .wrap    { height: 100%; padding: 12px; display: flex; flex-direction: column; gap: 6px; overflow: hidden }
    h3       { font-size: 13px; font-weight: 600; color: var(--text); flex-shrink: 0 }
    canvas   { flex: 1; min-height: 0; display: block; width: 100%;
               border: 1px solid var(--border); background: var(--surface) }
    .ctrls   { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; flex-shrink: 0 }
    .cbtn    { padding: 4px 14px; border: none; border-radius: 7px; cursor: pointer;
               background: var(--accent); color: var(--surface); font-weight: 600; font-size: 12px }
    .cbtn:disabled { opacity: 0.4; cursor: default }
    .srow    { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text) }
    .dot-a   { width:10px; height:10px; border-radius:50%; background:var(--accent); flex-shrink:0 }
    .dot-b   { width:10px; height:10px; border-radius:50%; background:var(--muted);  flex-shrink:0 }
    input[type=range] { width: 70px; accent-color: var(--accent) }
    .sv      { font-weight: 700; min-width: 28px; font-size:12px }
    .sv-a    { color: var(--accent) }
    .sv-b    { color: var(--muted) }
    #info    { font-size: 11px; color: var(--muted); flex-shrink: 0 }
  </style>
  <div class="wrap">
    <h3>Dual-Wave Superposition</h3>
    <canvas id="c"></canvas>
    <div class="ctrls">
      <button class="cbtn" id="playBtn">Play</button>
      <button class="cbtn" id="pauseBtn" disabled>Pause</button>
      <div class="srow"><div class="dot-a"></div>
        Speed A: <input type="range" id="sliderA" min="0" max="3" step="0.1" value="1">
        <span class="sv sv-a" id="valA">1.0×</span>
      </div>
      <div class="srow"><div class="dot-b"></div>
        Speed B: <input type="range" id="sliderB" min="0" max="3" step="0.1" value="0.4">
        <span class="sv sv-b" id="valB">0.4×</span>
      </div>
    </div>
    <div id="info">paused — press Play</div>
  </div>
\`

const canvas  = document.getElementById('c')
const ctx     = canvas.getContext('2d')
const playBtn = document.getElementById('playBtn')
const pauseBtn= document.getElementById('pauseBtn')
const sliderA = document.getElementById('sliderA')
const sliderB = document.getElementById('sliderB')
const valA    = document.getElementById('valA')
const valB    = document.getElementById('valB')
const info    = document.getElementById('info')

// ── State — two independent time variables ────────────────────────────────────
let running = false, animId = null, startTs = null
let speedA   = 1,    tOffsetA = 0   // blue wave (accent)
let speedB   = 0.4,  tOffsetB = 0   // grey wave (muted)

function getColors() {
  const cs = getComputedStyle(document.documentElement)
  return { surface:cs.getPropertyValue('--surface').trim(), border:cs.getPropertyValue('--border').trim(),
           accent:cs.getPropertyValue('--accent').trim(), muted:cs.getPropertyValue('--muted').trim() }
}

// ── Draw one curve for a given t value and color ──────────────────────────────
function plotCurve(t, clr, W, H) {
  const xMin=-Math.PI*2, xMax=Math.PI*2, yMin=-2, yMax=2
  ctx.beginPath(); ctx.strokeStyle=clr; ctx.lineWidth=2; let pen=false
  for(let px=0;px<W;px++){
    const x=xMin+(px/W)*(xMax-xMin)
    const y=Math.sin(x+t)
    const py=H-((y-yMin)/(yMax-yMin))*H
    if(!pen){ctx.moveTo(px,py);pen=true}else ctx.lineTo(px,py)
  }
  ctx.stroke()
}

function drawFrame(tA, tB) {
  canvas.width = canvas.clientWidth || 440; canvas.height = canvas.clientHeight || 220
  const W = canvas.width, H = canvas.height, c = getColors()
  ctx.clearRect(0,0,W,H); ctx.fillStyle=c.surface; ctx.fillRect(0,0,W,H)
  ctx.strokeStyle=c.border; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke()

  // Wave A — accent color
  plotCurve(tA, c.accent, W, H)

  // TODO: draw Wave B using tB and c.muted
  // plotCurve(tB, c.muted, W, H)

  info.textContent = running
    ? \`tA=\${tA.toFixed(2)}s  tB=\${tB.toFixed(2)}s\`
    : \`paused — tA=\${tA.toFixed(2)}s  tB=\${tB.toFixed(2)}s\`
}

function loop(ts) {
  if(!running) return
  const elapsed = (ts - startTs) / 1000
  const tA = tOffsetA + elapsed * speedA

  // TODO: compute tB using tOffsetB and speedB
  const tB = tOffsetB  // ← replace this line

  drawFrame(tA, tB)
  animId = requestAnimationFrame(loop)
}

playBtn.addEventListener('click',()=>{
  if(running) return; running=true; startTs=performance.now()
  playBtn.disabled=true; pauseBtn.disabled=false
  cancelAnimationFrame(animId); animId=requestAnimationFrame(loop)
})

pauseBtn.addEventListener('click',()=>{
  if(!running) return
  const elapsed = (performance.now() - startTs) / 1000
  tOffsetA += elapsed * speedA
  // TODO: bank tOffsetB here too
  running=false; cancelAnimationFrame(animId)
  playBtn.disabled=false; pauseBtn.disabled=true
  drawFrame(tOffsetA, tOffsetB)
})

sliderA.addEventListener('input',()=>{
  if(running){const e=(performance.now()-startTs)/1000; tOffsetA+=e*speedA; startTs=performance.now()}
  speedA=parseFloat(sliderA.value); valA.textContent=speedA.toFixed(1)+'×'
})
sliderB.addEventListener('input',()=>{
  if(running){const e=(performance.now()-startTs)/1000; tOffsetB+=e*speedB; startTs=performance.now()}
  speedB=parseFloat(sliderB.value); valB.textContent=speedB.toFixed(1)+'×'
})

requestAnimationFrame(()=>drawFrame(0, 0))`,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'Why use `requestAnimationFrame` for animation instead of `setInterval(draw, 16)`?',
      options: [
        'setInterval cannot call canvas drawing functions',
        'rAF fires in sync with the display\'s actual refresh rate (60Hz, 120Hz, etc.), producing smooth animation without tearing. It pauses when the tab is hidden, saving battery and CPU. setInterval fires at fixed wall-clock intervals regardless of the display cycle, causing jank and wasted work when the tab is invisible',
        'setInterval is limited to 60fps maximum; rAF has no such cap',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The rAF callback receives a timestamp in milliseconds. The code divides by 1000 to get seconds before using it. What goes wrong if you forget the conversion?',
      options: [
        'Math.sin(t) only works for values under 1000',
        'With t in milliseconds, all frequency calculations are off by 1000×. A wave with `frequency * t` would complete 1000 cycles per second instead of per millisecond, making animations appear frozen (they cycle too fast to see) or phase through states in a single frame',
        'The timestamp is already in seconds in newer browsers',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'The animation uses a time offset: `tOffset += elapsed * speed` rather than `t += dt * speed`. When the user changes the speed slider, what does the offset approach preserve?',
      options: [
        'It preserves the current phase — the animation continues smoothly from its current position rather than jumping to a position computed with the new speed from t=0. Without the offset, changing speed mid-animation would snap the wave to an unexpected phase',
        'It preserves the frame rate so speed changes do not cause dropped frames',
        'It prevents t from overflowing beyond Number.MAX_SAFE_INTEGER',
      ],
      correct: 0,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The code cancels an existing rAF with `cancelAnimationFrame(animId)` before starting a new one. What happens if you start a second loop without cancelling the first?',
      options: [
        'The browser automatically cancels the older loop',
        'Two loops run simultaneously: both call drawFrame every render cycle, doubling the work. Worse, they can interfere — one clears the canvas while the other has just drawn to it, causing flickering or race conditions. Always cancel before restarting',
        'The second requestAnimationFrame call overwrites the first automatically',
      ],
      correct: 1,
    },
  ],
}

export default sim2_005
