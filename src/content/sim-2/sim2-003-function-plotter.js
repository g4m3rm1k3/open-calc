const sim2_003 = {
  id: 'sim2-003',
  slug: 'function-plotter',
  chapter: 'sim2',
  order: 3,
  title: 'The Function Plotter',
  description: 'Build a complete graphing calculator by combining coordinate transforms, axis drawing, and expression evaluation.',

  hook: 'The expression evaluator is done. Now we need to turn numbers into pixels. This lesson covers the one idea that makes all graphing software possible: the coordinate transform that maps world coordinates (x = −5 to 5) to screen pixels (0 to 400).',

  intuition: {
    prose: [
      'A canvas has **screen coordinates**: pixel (0, 0) is the top-left corner, and y increases downward. Math has **world coordinates**: the origin is in the center, y increases upward. To draw a math function, you need to convert between the two.',
      'The conversion is just linear interpolation: `screenX = (worldX - xMin) / (xMax - xMin) * canvasWidth`. Think of it as rescaling a number from one range to another — the exact same idea as a lerp.',
      'Once you have the transform, drawing a curve is simply: loop x across many small steps, convert each (x, f(x)) to screen coordinates, and connect the dots with `lineTo`.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'The Coordinate Transform',
        body: 'Given domain [xMin, xMax] and canvas width W:\n`screenX = (worldX - xMin) / (xMax - xMin) * W`\n`screenY = (1 - (worldY - yMin) / (yMax - yMin)) * H`\nThe `1 - ...` flips the y-axis so positive points up.',
      },
      {
        type: 'insight',
        title: 'How Many Sample Points?',
        body: 'Use one sample per canvas pixel (or 2× for retina). For a 400px-wide canvas, sample x at 400 points between xMin and xMax. More points = smoother curve; fewer = visible zigzag.',
      },
      {
        type: 'strategy',
        title: 'Handle Discontinuities',
        body: 'Functions like `tan(x)` jump to ±Infinity. Instead of drawing the jump as a line, use `moveTo` when `!isFinite(y)` and resume with `lineTo` on the next finite value. This leaves a gap at the discontinuity instead of a vertical spike.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'The Function Plotter',
        initialProps: {
          initialCells: [
            // ── Cell 1: World to Screen ──────────────────────────────────────────
            {
              id: 1,
              mode: 'html',
              cellTitle: 'World to Screen Transform',
              prose: [
                'A `<canvas>` lives in **screen space**: pixel `(0, 0)` is the top-left corner, and y increases *downward* as you move toward the bottom of the element. Mathematics lives in **world space**: the origin is in the center, y increases *upward*. Every graphing tool ever built has to reconcile these two coordinate systems.',
                'The reconciliation is **linear interpolation**: `screenX = (worldX - xMin) / (xMax - xMin) * W`. Read it as: "what fraction of the way across the world domain is this point?" multiplied by the canvas width. The y formula adds a `1 - ...` to flip the axis direction. These two formulas are the entire foundation of 2D graphing.',
              ],
              code: `// The key idea: map world coordinates to canvas pixels.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 12px }
    h3  { font-size: 14px; font-weight: 700; color: #0f172a }
    canvas { width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;
             display: block; background: white }
    .code { background: #f1f5f9; padding: 10px 14px; border-radius: 8px;
            font-family: monospace; font-size: 12px; color: #0f172a; line-height: 1.7 }
  </style>
  <div class="wrap">
    <h3>World → Screen mapping</h3>
    <canvas id="cv" height="200"></canvas>
    <div class="code">
      screenX = (worldX - xMin) / (xMax - xMin) * W<br>
      screenY = (1 - (worldY - yMin) / (yMax - yMin)) * H
    </div>
  </div>
\`

const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height

// World domain
const xMin = -3, xMax = 3, yMin = -2, yMax = 2

function toScreen(wx, wy) {
  const sx = (wx - xMin) / (xMax - xMin) * W
  const sy = (1 - (wy - yMin) / (yMax - yMin)) * H
  return { sx, sy }
}

// ── Background ───────────────────────────────────────────────────────────────
ctx.fillStyle = '#f8fafc'
ctx.fillRect(0, 0, W, H)

// ── Draw some world-coordinate points ────────────────────────────────────────
const points = [
  { x: -2, y: 1,  label: '(-2, 1)',  color: '#0284c7' },
  { x:  0, y: 0,  label: 'origin',   color: '#475569' },
  { x:  1, y: -1, label: '(1, -1)',  color: '#dc2626' },
  { x:  2.5, y: 1.5, label:'(2.5, 1.5)', color: '#16a34a' },
]

for (const p of points) {
  const { sx, sy } = toScreen(p.x, p.y)
  ctx.beginPath()
  ctx.arc(sx, sy, 6, 0, Math.PI * 2)
  ctx.fillStyle = p.color
  ctx.fill()
  ctx.fillStyle = p.color
  ctx.font = '11px system-ui'
  ctx.fillText(p.label, sx + 8, sy + 4)
}

// ── Mark origin ───────────────────────────────────────────────────────────────
const { sx: ox, sy: oy } = toScreen(0, 0)
ctx.strokeStyle = '#cbd5e1'
ctx.lineWidth = 1
ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke()
ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke()`,
            },
            // ── Cell 2: Drawing Axes ─────────────────────────────────────────────
            {
              id: 2,
              mode: 'html',
              cellTitle: 'Drawing a Coordinate Grid',
              prose: [
                'A grid is just a set of vertical and horizontal lines at integer world coordinates. Loop `x` from `Math.ceil(xMin)` to `xMax`, convert each integer to a screen x, and draw a vertical line. Repeat for y. The `Math.ceil` ensures you start at the first whole number inside the domain — without it you might try to draw at a fractional world coordinate, which is valid but leaves partial lines at the edges.',
                'The main axes are the same lines but drawn in a more prominent color after the grid. Drawing order matters in canvas: paint background first, then grid, then axes, then curves. Each layer sits on top of the last.',
              ],
              code: `// A clean grid with axes, ticks, and labels.
// This drawGrid function will be the foundation of the full plotter.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 10px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    canvas { width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;
             display: block; background: white }
  </style>
  <div class="wrap">
    <h3>Coordinate Grid</h3>
    <canvas id="cv" height="260"></canvas>
  </div>
\`

const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height

const xMin = -5, xMax = 5, yMin = -4, yMax = 4

function toScreen(wx, wy) {
  return {
    sx: (wx - xMin) / (xMax - xMin) * W,
    sy: (1 - (wy - yMin) / (yMax - yMin)) * H,
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, W, H)

  // ── Light grid lines ──────────────────────────────────────────────────────
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    const { sx } = toScreen(x, 0)
    ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke()
  }
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    const { sy } = toScreen(0, y)
    ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke()
  }

  // ── Main axes ─────────────────────────────────────────────────────────────
  const { sx: ox, sy: oy } = toScreen(0, 0)
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke()

  // ── Tick labels ───────────────────────────────────────────────────────────
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px system-ui'
  ctx.textAlign = 'center'
  for (let x = xMin + 1; x <= xMax - 1; x++) {
    if (x === 0) continue
    const { sx } = toScreen(x, 0)
    ctx.fillText(x, sx, oy + 14)
  }
  ctx.textAlign = 'right'
  for (let y = yMin + 1; y <= yMax - 1; y++) {
    if (y === 0) continue
    const { sy } = toScreen(0, y)
    ctx.fillText(y, ox - 5, sy + 4)
  }
}

drawGrid()`,
            },
            // ── Cell 3: Plotting a Curve ─────────────────────────────────────────
            {
              id: 3,
              mode: 'html',
              cellTitle: 'Plotting a Curve',
              prose: [
                'Drawing a curve is a connect-the-dots problem: sample the function at many closely-spaced x values, convert each `(worldX, worldY)` pair to `(screenX, screenY)`, and connect them with `lineTo`. If you sample at one point per pixel, the resulting path is smooth enough that no individual segment is visible.',
                'Functions like `tan(x)` jump to `±Infinity` between every pair of asymptotes. If you let `lineTo` draw through infinity, you get a vertical line across the whole canvas — visually wrong. The fix is a `penDown` flag: when `isFinite(y)` is false, call `moveTo` on the next valid point instead of `lineTo`. This leaves a gap at the discontinuity rather than a spike.',
              ],
              code: `// Sample f(x) at canvas-pixel resolution, convert to screen coords, connect with lineTo.
// Notice how we handle discontinuities with moveTo.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 10px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    canvas { width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;
             display: block; background: white }
  </style>
  <div class="wrap">
    <h3>f(x) = sin(x) · x  and  f(x) = tan(x)</h3>
    <canvas id="cv" height="260"></canvas>
  </div>
\`

const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height

const xMin = -5, xMax = 5, yMin = -4, yMax = 4

function toScreen(wx, wy) {
  return {
    sx: (wx - xMin) / (xMax - xMin) * W,
    sy: (1 - (wy - yMin) / (yMax - yMin)) * H,
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = 'white'; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1
  for (let x = Math.ceil(xMin); x <= xMax; x++) { const {sx}=toScreen(x,0); ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke() }
  for (let y = Math.ceil(yMin); y <= yMax; y++) { const {sy}=toScreen(0,y); ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke() }
  const {sx:ox,sy:oy}=toScreen(0,0)
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
}

function plotFunction(fn, color, lineWidth = 2) {
  const STEPS = W * 2   // sample at 2× pixel density
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  let penDown = false

  for (let i = 0; i <= STEPS; i++) {
    const wx = xMin + (i / STEPS) * (xMax - xMin)
    const wy = fn(wx)

    // If the result is not finite, lift the pen to avoid drawing vertical spikes
    if (!isFinite(wy) || Math.abs(wy) > yMax * 3) {
      penDown = false
      continue
    }

    const { sx, sy } = toScreen(wx, wy)
    if (!penDown) { ctx.moveTo(sx, sy); penDown = true }
    else { ctx.lineTo(sx, sy) }
  }
  ctx.stroke()
}

drawGrid()

// Plot sin(x) * x in blue
plotFunction(x => Math.sin(x) * x, '#0284c7', 2.5)

// Plot tan(x) in red — notice the gaps at discontinuities
plotFunction(x => Math.tan(x), '#dc2626', 2)

// Legend
ctx.fillStyle = '#0284c7'; ctx.font = '12px system-ui'
ctx.fillText('sin(x)·x', 12, 18)
ctx.fillStyle = '#dc2626'
ctx.fillText('tan(x)', 12, 34)`,
            },
            // ── Cell 4: The Complete Plotter ─────────────────────────────────────
            {
              id: 4,
              mode: 'html',
              cellTitle: 'The Complete Plotter',
              prose: [
                'The three pieces — expression evaluator, coordinate transform, and curve renderer — snap together cleanly. The `plotCurve` function takes an expression string, compiles it, calls `drawGrid()` to clear the canvas, then runs the sampling loop. Pressing Enter or clicking Plot calls `plotCurve` with whatever is in the text input.',
                'Notice the `resize()` call before `drawGrid()`. Because the canvas is set to `width: 100%` in CSS, its CSS size and its pixel buffer size can diverge. Always set `canvas.width = canvas.offsetWidth` before reading `canvas.width` for calculations — otherwise you draw into a mismatched buffer and the image looks blurry or clipped.',
              ],
              code: `// Everything together: input box, Plot button, grid, and plotted curve.
// This is the function plotter — your own graphing calculator.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: #f8fafc }
    .wrap { display: flex; flex-direction: column; height: 100vh; padding: 12px; gap: 10px }
    .toolbar { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 13px; font-size: 15px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none; background: white
    }
    input:focus { border-color: #0284c7 }
    button {
      padding: 9px 18px; font-size: 14px; font-weight: 600;
      border: none; border-radius: 8px; cursor: pointer; white-space: nowrap
    }
    .plot-btn { background: #0284c7; color: white }
    .plot-btn:hover { background: #0369a1 }
    .err { display: none; padding: 8px 12px; background: #fee2e2;
           border: 1px solid #fca5a5; border-radius: 8px; color: #7f1d1d;
           font-size: 13px; font-family: monospace }
    canvas { flex: 1; border-radius: 10px; border: 1px solid #e2e8f0;
             display: block; background: white; min-height: 0 }
  </style>
  <div class="wrap">
    <div class="toolbar">
      <input id="expr" type="text" value="sin(x) * x" placeholder="f(x) = ...">
      <button class="plot-btn" id="plotBtn">Plot</button>
    </div>
    <div class="err" id="errBox"></div>
    <canvas id="cv"></canvas>
  </div>
\`

const canvas = app.querySelector('#cv')
const ctx    = canvas.getContext('2d')
const input  = app.querySelector('#expr')
const errBox = app.querySelector('#errBox')

const xMin = -6, xMax = 6, yMin = -4, yMax = 4

function resize() {
  canvas.width  = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
}
resize()

function toScreen(wx, wy) {
  const W = canvas.width, H = canvas.height
  return {
    sx: (wx - xMin) / (xMax - xMin) * W,
    sy: (1 - (wy - yMin) / (yMax - yMin)) * H,
  }
}

function drawGrid() {
  const W = canvas.width, H = canvas.height
  ctx.fillStyle = 'white'; ctx.fillRect(0, 0, W, H)

  // Grid lines
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1
  for (let x = xMin; x <= xMax; x++) { const {sx}=toScreen(x,0); ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke() }
  for (let y = yMin; y <= yMax; y++) { const {sy}=toScreen(0,y); ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke() }

  // Axes
  const {sx:ox,sy:oy} = toScreen(0,0)
  ctx.strokeStyle='#94a3b8'; ctx.lineWidth=1.5
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()

  // Tick labels
  ctx.fillStyle='#94a3b8'; ctx.font='10px system-ui'; ctx.textAlign='center'
  for (let x=xMin+1; x<=xMax-1; x++) { if(x===0)continue; const {sx}=toScreen(x,0); ctx.fillText(x,sx,oy+13) }
  ctx.textAlign='right'
  for (let y=yMin+1; y<=yMax-1; y++) { if(y===0)continue; const {sy}=toScreen(0,y); ctx.fillText(y,ox-5,sy+4) }
}

function plotCurve(exprStr) {
  errBox.style.display = 'none'
  drawGrid()
  try {
    const fn = new Function('x', \`with(Math){ return \${exprStr} }\`)
    const W  = canvas.width
    const STEPS = W * 2
    ctx.beginPath()
    ctx.strokeStyle = '#0284c7'
    ctx.lineWidth = 2.5
    let penDown = false
    for (let i = 0; i <= STEPS; i++) {
      const wx = xMin + (i / STEPS) * (xMax - xMin)
      const wy = fn(wx)
      if (!isFinite(wy) || Math.abs(wy) > Math.abs(yMax) * 3) { penDown = false; continue }
      const { sx, sy } = toScreen(wx, wy)
      if (!penDown) { ctx.moveTo(sx, sy); penDown = true } else { ctx.lineTo(sx, sy) }
    }
    ctx.stroke()

    // Label
    ctx.fillStyle = '#0284c7'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left'
    ctx.fillText('f(x) = ' + exprStr, 10, 18)
  } catch (e) {
    errBox.style.display = 'block'
    errBox.textContent = '⚠ ' + e.message
    drawGrid()
  }
}

app.querySelector('#plotBtn').addEventListener('click', () => plotCurve(input.value))
input.addEventListener('keydown', e => { if (e.key === 'Enter') plotCurve(input.value) })
plotCurve(input.value)`,
            },
            // ── Challenge 1: Zoom Controls ────────────────────────────────────────
            {
              id: 5,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Zoom Controls',
              difficulty: 'easy',
              prose: [
                'Zoom is nothing more than changing the domain and re-plotting. Zooming in halves `xMin/xMax/yMin/yMax` (everything shrinks toward zero); zooming out doubles them. The key: declare these with `let` instead of `const` so the zoom handlers can mutate them, then call `plotCurve` again after each change.',
              ],
              prompt: 'Add "Zoom In" and "Zoom Out" buttons to the plotter. Zoom in should halve the domain (e.g. xMin/xMax from ±6 to ±3), zoom out should double it. Re-plot the current expression after zooming.',
              hint: 'Store xMin, xMax, yMin, yMax as mutable variables (let, not const). Zoom in: multiply all four by 0.5. Zoom out: multiply by 2. Then call plotCurve() again with the current expression.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: #f8fafc }
    .wrap { display: flex; flex-direction: column; height: 100vh; padding: 12px; gap: 10px }
    .toolbar { display: flex; gap: 8px }
    input {
      flex: 1; padding: 9px 13px; font-size: 15px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none; background: white
    }
    input:focus { border-color: #0284c7 }
    button {
      padding: 9px 14px; font-size: 13px; font-weight: 600;
      border: none; border-radius: 8px; cursor: pointer
    }
    .plot-btn { background: #0284c7; color: white }
    .zoom-btn { background: #e2e8f0; color: #0f172a }
    .zoom-btn:hover { background: #cbd5e1 }
    canvas { flex: 1; border-radius: 10px; border: 1px solid #e2e8f0;
             display: block; background: white; min-height: 0 }
  </style>
  <div class="wrap">
    <div class="toolbar">
      <input id="expr" type="text" value="sin(x)">
      <button class="plot-btn" id="plotBtn">Plot</button>
      <button class="zoom-btn" id="inBtn">+ Zoom In</button>
      <button class="zoom-btn" id="outBtn">- Zoom Out</button>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`

const canvas = app.querySelector('#cv')
const ctx    = canvas.getContext('2d')
const input  = app.querySelector('#expr')

canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

// TODO: make these mutable so zoom can change them
let xMin = -6, xMax = 6, yMin = -4, yMax = 4

function toScreen(wx, wy) {
  const W = canvas.width, H = canvas.height
  return {
    sx: (wx - xMin) / (xMax - xMin) * W,
    sy: (1 - (wy - yMin) / (yMax - yMin)) * H,
  }
}

function drawGrid() {
  const W = canvas.width, H = canvas.height
  ctx.fillStyle='white'; ctx.fillRect(0,0,W,H)
  ctx.strokeStyle='#e2e8f0'; ctx.lineWidth=1
  for(let x=Math.ceil(xMin);x<=xMax;x++){const{sx}=toScreen(x,0);ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke()}
  for(let y=Math.ceil(yMin);y<=yMax;y++){const{sy}=toScreen(0,y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke()}
  const{sx:ox,sy:oy}=toScreen(0,0)
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5
  ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke()
  ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke()
}

function plotCurve(exprStr) {
  drawGrid()
  try {
    const fn = new Function('x', \`with(Math){ return \${exprStr} }\`)
    const STEPS = canvas.width * 2
    ctx.beginPath(); ctx.strokeStyle='#0284c7'; ctx.lineWidth=2.5
    let penDown = false
    for(let i=0;i<=STEPS;i++){
      const wx=xMin+(i/STEPS)*(xMax-xMin), wy=fn(wx)
      if(!isFinite(wy)||Math.abs(wy)>Math.abs(yMax)*3){penDown=false;continue}
      const{sx,sy}=toScreen(wx,wy)
      if(!penDown){ctx.moveTo(sx,sy);penDown=true}else{ctx.lineTo(sx,sy)}
    }
    ctx.stroke()
  } catch(e) { drawGrid() }
}

app.querySelector('#plotBtn').addEventListener('click', () => plotCurve(input.value))

// TODO: wire zoom buttons — change xMin/xMax/yMin/yMax, then re-plot
app.querySelector('#inBtn').addEventListener('click', () => { /* zoom in */ })
app.querySelector('#outBtn').addEventListener('click', () => { /* zoom out */ })

plotCurve(input.value)`,
            },
            // ── Challenge 2: Two Functions ────────────────────────────────────────
            {
              id: 6,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Plot Two Functions',
              difficulty: 'medium',
              prose: [
                'Plotting two curves on the same axes means calling `plotCurve` twice with different colors after a single `drawGrid()`. The trick is to draw the grid once and then layer both curves on top — never call `drawGrid()` between the two curve draws or the first curve disappears. For the legend, `ctx.fillRect` draws a small color swatch and `ctx.fillText` places the label beside it.',
              ],
              prompt: 'Add a second expression input to the plotter. Plot both functions on the same graph in different colors (e.g. blue and red). Add a small color-coded legend showing f(x) and g(x) expressions.',
              hint: 'Add a second `<input id="expr2">` to the toolbar. Call `plotCurve(expr1, \'#0284c7\')` and `plotCurve(expr2, \'#dc2626\')`. For the legend, draw two small colored rectangles plus text labels using `ctx.fillRect` and `ctx.fillText`.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: #f8fafc }
    .wrap { display: flex; flex-direction: column; height: 100vh; padding: 12px; gap: 8px }
    .row { display: flex; gap: 8px; align-items: center }
    .dot { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0 }
    .dot.blue { background: #0284c7 }
    .dot.red  { background: #dc2626 }
    input {
      flex: 1; padding: 8px 12px; font-size: 14px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none; background: white
    }
    input:focus { border-color: #0284c7 }
    button {
      padding: 8px 16px; font-size: 14px; font-weight: 600;
      border: none; border-radius: 8px; cursor: pointer; background: #0284c7; color: white
    }
    canvas { flex: 1; border-radius: 10px; border: 1px solid #e2e8f0;
             display: block; background: white; min-height: 0 }
  </style>
  <div class="wrap">
    <div class="row">
      <div class="dot blue"></div>
      <input id="f1" type="text" value="sin(x)">
    </div>
    <div class="row">
      <div class="dot red"></div>
      <input id="f2" type="text" value="cos(x)">
      <button id="plotBtn">Plot Both</button>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`

const canvas = app.querySelector('#cv')
const ctx    = canvas.getContext('2d')
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

const xMin = -6, xMax = 6, yMin = -4, yMax = 4

function toScreen(wx, wy) {
  const W=canvas.width,H=canvas.height
  return { sx:(wx-xMin)/(xMax-xMin)*W, sy:(1-(wy-yMin)/(yMax-yMin))*H }
}

function drawGrid() {
  const W=canvas.width,H=canvas.height
  ctx.fillStyle='white';ctx.fillRect(0,0,W,H)
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1
  for(let x=Math.ceil(xMin);x<=xMax;x++){const{sx}=toScreen(x,0);ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke()}
  for(let y=Math.ceil(yMin);y<=yMax;y++){const{sy}=toScreen(0,y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke()}
  const{sx:ox,sy:oy}=toScreen(0,0)
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5
  ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke()
  ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke()
}

// TODO: implement plotCurve(exprStr, color) that draws the function in the given color
// TODO: on Plot Both click, call drawGrid() then plotCurve for both inputs
// TODO: draw a legend showing both expressions

app.querySelector('#plotBtn').addEventListener('click', () => {
  // your code here
})

drawGrid()`,
            },
            // ── Challenge 3: Tangent Line ─────────────────────────────────────────
            {
              id: 7,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Tangent Line',
              difficulty: 'hard',
              prose: [
                '**Numerical differentiation** approximates the slope of f at a point without needing a symbolic formula. The centered-difference formula `(f(a+h) - f(a-h)) / (2h)` with `h = 0.0001` is accurate to about 8 decimal places for smooth functions. Once you have the slope, the tangent line is just `y = f(a) + slope * (x - a)` — a line through `(a, f(a))` with the computed gradient. Plot it as a second curve in amber to see calculus come alive visually.',
              ],
              prompt: 'Add a number input for a value `a`. After plotting f(x), also draw the tangent line to f at x=a using numerical differentiation: `f\'(a) ≈ (f(a+h) - f(a-h)) / (2h)` where h=0.0001. The tangent line is `y = f(a) + f\'(a) * (x - a)`. Draw a dot at (a, f(a)) too.',
              hint: 'Compute `slope = (fn(a+h) - fn(a-h)) / (2*h)`. The tangent line function is `tangent = x => fn(a) + slope * (x - a)`. Plot it with `plotCurve(tangent, \'#f59e0b\', 1.5)` (passing a function directly instead of a string — adjust your plotCurve to accept either).',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: #f8fafc }
    .wrap { display: flex; flex-direction: column; height: 100vh; padding: 12px; gap: 10px }
    .toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap }
    input[type=text] {
      flex: 1; min-width: 100px; padding: 9px 12px; font-size: 14px; font-family: monospace;
      border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none; background: white
    }
    input[type=number] {
      width: 70px; padding: 9px 10px; font-size: 14px; text-align: center;
      border: 1.5px solid #cbd5e1; border-radius: 8px; outline: none; background: white
    }
    label { font-size: 13px; color: #475569; white-space: nowrap }
    button {
      padding: 9px 16px; font-size: 14px; font-weight: 600;
      border: none; border-radius: 8px; cursor: pointer; background: #0284c7; color: white
    }
    canvas { flex: 1; border-radius: 10px; border: 1px solid #e2e8f0;
             display: block; background: white; min-height: 0 }
  </style>
  <div class="wrap">
    <div class="toolbar">
      <input id="expr" type="text" value="sin(x)">
      <label>a =</label>
      <input id="aVal" type="number" value="1" step="0.1">
      <button id="plotBtn">Plot + Tangent</button>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`

const canvas = app.querySelector('#cv')
const ctx    = canvas.getContext('2d')
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

const xMin = -6, xMax = 6, yMin = -4, yMax = 4

function toScreen(wx, wy) {
  const W=canvas.width,H=canvas.height
  return { sx:(wx-xMin)/(xMax-xMin)*W, sy:(1-(wy-yMin)/(yMax-yMin))*H }
}

function drawGrid() {
  const W=canvas.width,H=canvas.height
  ctx.fillStyle='white';ctx.fillRect(0,0,W,H)
  ctx.strokeStyle='#e2e8f0';ctx.lineWidth=1
  for(let x=Math.ceil(xMin);x<=xMax;x++){const{sx}=toScreen(x,0);ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke()}
  for(let y=Math.ceil(yMin);y<=yMax;y++){const{sy}=toScreen(0,y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke()}
  const{sx:ox,sy:oy}=toScreen(0,0)
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.5
  ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke()
  ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke()
}

function plotFn(fn, color, lineWidth=2.5) {
  const STEPS=canvas.width*2
  ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=lineWidth
  let penDown=false
  for(let i=0;i<=STEPS;i++){
    const wx=xMin+(i/STEPS)*(xMax-xMin),wy=fn(wx)
    if(!isFinite(wy)||Math.abs(wy)>Math.abs(yMax)*3){penDown=false;continue}
    const{sx,sy}=toScreen(wx,wy)
    if(!penDown){ctx.moveTo(sx,sy);penDown=true}else{ctx.lineTo(sx,sy)}
  }
  ctx.stroke()
}

app.querySelector('#plotBtn').addEventListener('click', () => {
  const exprStr = app.querySelector('#expr').value
  const a = parseFloat(app.querySelector('#aVal').value)
  drawGrid()
  try {
    const fn = new Function('x', \`with(Math){ return \${exprStr} }\`)
    plotFn(fn, '#0284c7')

    // TODO: compute the derivative at a using numerical differentiation
    // TODO: build the tangent line function and plot it in amber
    // TODO: draw a dot at (a, f(a))
  } catch (e) {}
})

drawGrid()`,
            },
          ],
        },
      },
    ],
  },
}

export default sim2_003
