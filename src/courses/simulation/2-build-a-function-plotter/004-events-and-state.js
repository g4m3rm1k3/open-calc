const sim2_004 = {
  id: 'sim2-004',
  slug: 'events-and-state',
  chapter: 'sim2',
  order: 4,
  title: 'Events and State',
  description: 'Learn how to track what the user has selected, generate buttons from data, and connect a live slider so the graph updates on every pixel of movement.',

  hook: {
    question: 'How does a UI know which button is "selected" — and how do you wire a slider so the graph updates on every pixel of movement?',
    realWorldContext: 'State — the memory of what the user has chosen — is the invisible layer underneath every interactive UI. When you click a tab, a variable somewhere changes from `0` to `1`, and the UI repaints to reflect it. When you drag a slider, an `input` event fires on every frame of movement, each one updating a value and re-rendering the output. These two patterns — discrete state (buttons, presets) and continuous state (sliders) — are the foundation of every interactive app you\'ll build. This lesson wires them to the function plotter.',
  },

  intuition: {
    prose: [
      'Before any state exists, the app is stateless — each interaction is isolated and the UI resets on every run. The moment you write `let activePreset = 0`, you have memory: a persistent fact the app can act on across multiple interactions. State is just a variable whose current value drives the appearance of the UI.',
      'Events are what change state. A `click` event on a button runs a handler function. That handler does two things: updates the state variable, then updates the DOM to reflect the new state. The cycle is always the same — **event → state change → UI update** — regardless of whether you\'re toggling a checkbox, selecting a tab, or changing a graph preset.',
      'Active button styling is how you signal selection visually. The cleanest way is a CSS `.active` class. Add it to the selected button, remove it from all others. `btn.classList.toggle(\'active\', i === activeIndex)` does this in one call per button. Never set `btn.style.background` directly — that hardcodes colors and breaks dark mode. Always let CSS classes carry the visual meaning.',
      'Presets are just data. Instead of hardcoding `<button>sin(x)</button><button>cos(x)</button>` in HTML, you declare an array of objects — `{ label: \'sin(x)\', expr: \'sin(x)\' }` — and generate the buttons with a loop. Adding a new preset is a one-line data change. Removing one is a splice. The HTML follows from the data automatically, so the data and the UI are always in sync.',
      'The `input` event on `<input type="range">` fires on every frame while the thumb is dragging — potentially 60 times per second. The `change` event fires only when the user releases. For live, smooth graph updates you always use `input`. Displaying the current value next to the slider (e.g. `a = 2.50`) is essential: without it, users have no idea what number they\'re selecting.',
      'Slider values are always strings. `slider.value` returns `"2.5"`, not `2.5`. Always wrap it in `parseFloat()` before doing any arithmetic. Passing a string to a formula function causes silent `NaN` — no error thrown, just a blank graph. This is one of the most common silent bugs in beginner interactive apps.',
      'The render function pattern ties everything together. Rather than each event handler directly manipulating different parts of the DOM, every handler updates state and calls a single `render()` function. `render()` reads all current state and redraws from scratch. Two events touching the same output? Put the output logic in `render()` once. This keeps your visual output a pure reflection of state, and debugging becomes looking at one function instead of several.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 4 of 10 — Events and State',
        body: 'This lesson adds interactivity to the plotter from Lesson 3. The preset picker and slider patterns introduced here reappear in every subsequent lesson — panning, zooming, multiple curves, and the final calculator all build on the same event → state → render cycle.',
      },
      {
        type: 'definition',
        title: 'State',
        body: 'A variable (or set of variables) that describes the current condition of the app. The UI should always be a visual reflection of state — not the other way around. When state changes, re-render. Never update the UI first and try to infer state from the DOM.',
      },
      {
        type: 'procedure',
        title: 'The Event → State → UI Cycle',
        body: '(1) User interacts (click, drag, type). (2) Event handler updates the state variable. (3) Handler calls `render()`. (4) `render()` reads all state and rebuilds the affected DOM. Keeping these four steps in order makes every bug traceable to a single point of failure.',
      },
      {
        type: 'procedure',
        title: 'Active Button Pattern',
        body: 'Store the active index in `let active = 0`. In the click handler: `active = i; render()`. In `render()`: `btns.forEach((b, i) => b.classList.toggle(\'active\', i === active))`. Never set `btn.style.background` directly — use a CSS class so the colors stay in CSS where they belong.',
      },
      {
        type: 'insight',
        title: 'Presets Are Just Data',
        body: 'Generate buttons from an array of objects rather than hardcoding HTML. `const presets = [{ label: \'sin(x)\', expr: \'sin(x)\' }, ...]`. Iterating with `forEach` to create buttons means adding a new preset is one array entry, not an HTML edit. The data and the UI are always structurally identical.',
      },
      {
        type: 'definition',
        title: '`input` Event vs `change`',
        body: '`input` fires on every change while the user is interacting — every keystroke, every pixel of slider drag. `change` fires only when the user commits (releases mouse, leaves field). For live graph updates, always listen to `input`. For form submission or saving, `change` is sufficient.',
      },
      {
        type: 'warning',
        title: 'Slider Values Are Strings',
        body: '`slider.value` returns a string (`"2.5"`), never a number. Always `parseFloat(slider.value)` before arithmetic. Passing a raw string to a formula produces silent `NaN` — the graph goes blank with no error. This is the most common slider bug.',
      },
      {
        type: 'insight',
        title: 'Render From State, Not From Events',
        body: 'If a preset button click and an Enter keypress both need to update the graph, put the graphing logic in `render()` — not duplicated in both handlers. Handlers only update state variables. `render()` does the drawing. This means any bug in the visual output has exactly one place to look.',
      },
      {
        type: 'strategy',
        title: 'Always Show the Slider Value',
        body: 'Display the current numeric value next to the slider thumb and update it inside the `input` handler: `label.textContent = \`a = \${a.toFixed(2)}\``. Without this, the user has no idea what value they\'ve selected, and changing the slider feels arbitrary.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'Events and State',
        mathBridge: 'The four cells below build up interactivity in layers: first the button state pattern in isolation, then presets wired to a plotter, then a live slider, then everything assembled. Run each cell, interact with it, then read the comments before moving on.',
        initialProps: {
          initialCells: [
            // ── Cell 1: Button Events and Active State ───────────────────────────
            {
              id: 1,
              mode: 'html',
              cellTitle: 'Button Events and Active State',
              prose: [
                'The fundamental pattern: a `let` variable holds which button is selected, each click updates that variable, and a `render` function reads the variable to update all button styles. Separating "update state" from "update DOM" means you can always trust that the visual matches the data.',
                'Notice that the button styles come from CSS classes, not from JavaScript `.style` assignments. This is intentional — it lets CSS variables (`var(--accent)`) do the color work automatically in both light and dark mode.',
              ],
              code: `// ── The core pattern: state variable → event → render ──────────────────────
//
// Rule: handlers update state. render() updates the DOM.
// Never mix them — it makes bugs hard to find.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 14px }
    h3   { font-size: 14px; font-weight: 700; color: var(--text) }
    .lbl { font-size: 11px; font-weight: 700; text-transform: uppercase;
           letter-spacing: 0.06em; color: var(--muted); margin-bottom: 4px }
    .btn-row { display: flex; gap: 8px; flex-wrap: wrap }

    /* Default button style */
    .preset-btn {
      padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
      border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--surface); color: var(--muted);
      transition: background 0.12s, border-color 0.12s, color 0.12s
    }
    /* Active button — just add the class, CSS handles the rest */
    .preset-btn.active {
      background: var(--accent-bg);
      border-color: var(--accent);
      color: var(--accent)
    }

    .display {
      padding: 14px 16px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--surface2);
      font-size: 14px; font-family: monospace; color: var(--text)
    }
  </style>
  <div class="wrap">
    <h3>Function Preset Picker</h3>
    <div class="lbl">Choose a function</div>
    <div class="btn-row" id="btnRow"></div>
    <div class="display" id="display"></div>
  </div>
\`

// ── Presets are data, not hardcoded HTML ─────────────────────────────────────
const presets = [
  { label: 'sin(x)',  expr: 'sin(x)' },
  { label: 'cos(x)',  expr: 'cos(x)' },
  { label: 'x²',     expr: 'x*x'    },
  { label: '|x|',    expr: 'abs(x)' },
  { label: 'tan(x)', expr: 'tan(x)' },
]

// ── State: one variable, one source of truth ─────────────────────────────────
let active = 0

const btnRow  = app.querySelector('#btnRow')
const display = app.querySelector('#display')

// ── Build buttons from data ───────────────────────────────────────────────────
presets.forEach((p, i) => {
  const btn = document.createElement('button')
  btn.className = 'preset-btn'
  btn.textContent = p.label
  btn.addEventListener('click', () => {
    active = i   // update state
    render()     // then update DOM — always in this order
  })
  btnRow.appendChild(btn)
})

// ── render(): reads state, updates everything ────────────────────────────────
function render() {
  // toggle the .active class on each button based on current state
  btnRow.querySelectorAll('.preset-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === active)
  })
  display.textContent = \`Selected: f(x) = \${presets[active].expr}\`
}

render() // draw the initial state`,
            },
            // ── Cell 2: Presets Wired to a Plotter ──────────────────────────────
            {
              id: 2,
              mode: 'html',
              cellTitle: 'Presets Wired to a Plotter',
              prose: [
                'The preset picker from cell 1 now drives a canvas plotter. The render function calls `plotCurve(presets[active].expr)` after updating the button styles — the plotter is just another output that reads from state. The coordinate transform and curve-drawing code come directly from Lesson 3.',
                'Study the structure: the data (presets array) sits at the top, the state (active index) below it, then the rendering functions (`renderButtons`, `plotCurve`), then the event handlers. Reading in this order — data → state → render → events — follows the flow of a well-organized interactive app.',
              ],
              code: `// Preset buttons wired to a real plotter.
// Adding a new function means one line in the presets array — nothing else changes.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap    { padding: 12px; display: flex; flex-direction: column; gap: 10px }
    .btn-row { display: flex; gap: 6px; flex-wrap: wrap }
    .preset-btn {
      padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer;
      border: 1.5px solid var(--border); border-radius: 6px;
      background: var(--surface); color: var(--muted)
    }
    .preset-btn.active {
      background: var(--accent-bg); border-color: var(--accent); color: var(--accent)
    }
    canvas { width: 100%; border-radius: 8px; border: 1px solid var(--border);
             display: block; background: var(--surface) }
  </style>
  <div class="wrap">
    <div class="btn-row" id="btnRow"></div>
    <canvas id="cv" height="230"></canvas>
  </div>
\`

// ── Data ──────────────────────────────────────────────────────────────────────
const presets = [
  { label: 'sin(x)',    expr: 'sin(x)'       },
  { label: 'cos(x)',    expr: 'cos(x)'       },
  { label: 'sin(2x)',   expr: 'sin(2*x)'     },
  { label: 'x²',       expr: 'x*x'          },
  { label: 'x³',       expr: 'x*x*x'        },
  { label: '|sin(x)|', expr: 'abs(sin(x))'  },
]

// ── State ─────────────────────────────────────────────────────────────────────
let active = 0

// ── Canvas setup ──────────────────────────────────────────────────────────────
const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height
const xMin = -6, xMax = 6, yMin = -3, yMax = 3

function getC() {
  const s = getComputedStyle(document.documentElement)
  return {
    surface: s.getPropertyValue('--surface').trim(),
    border:  s.getPropertyValue('--border').trim(),
    muted:   s.getPropertyValue('--muted').trim(),
    accent:  s.getPropertyValue('--accent').trim(),
  }
}

function toScreen(wx, wy) {
  return {
    sx: (wx - xMin) / (xMax - xMin) * W,
    sy: (1 - (wy - yMin) / (yMax - yMin)) * H,
  }
}

function plotCurve(expr) {
  const C = getC()
  // clear and draw grid
  ctx.fillStyle = C.surface; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = C.border; ctx.lineWidth = 1
  for (let x = Math.ceil(xMin); x <= xMax; x++) { const {sx}=toScreen(x,0); ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke() }
  for (let y = Math.ceil(yMin); y <= yMax; y++) { const {sy}=toScreen(0,y); ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke() }
  const {sx:ox,sy:oy} = toScreen(0,0)
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()
  // draw the curve
  try {
    const fn = new Function('x', \`with(Math){ return \${expr} }\`)
    ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5
    let penDown = false
    for (let i = 0; i <= W * 2; i++) {
      const wx = xMin + (i / (W * 2)) * (xMax - xMin)
      const wy = fn(wx)
      if (!isFinite(wy) || Math.abs(wy) > yMax * 3) { penDown = false; continue }
      const {sx, sy} = toScreen(wx, wy)
      if (!penDown) { ctx.moveTo(sx, sy); penDown = true } else { ctx.lineTo(sx, sy) }
    }
    ctx.stroke()
  } catch (e) { /* invalid expression — leave grid visible */ }
}

// ── Render ─────────────────────────────────────────────────────────────────────
const btnRow = app.querySelector('#btnRow')

presets.forEach((p, i) => {
  const btn = document.createElement('button')
  btn.className = 'preset-btn'
  btn.textContent = p.label
  btn.addEventListener('click', () => { active = i; render() })
  btnRow.appendChild(btn)
})

function render() {
  // 1. update button styles
  btnRow.querySelectorAll('.preset-btn').forEach((b, i) => {
    b.classList.toggle('active', i === active)
  })
  // 2. redraw the canvas
  plotCurve(presets[active].expr)
}

render()`,
            },
            // ── Cell 3: Live Range Slider ────────────────────────────────────────
            {
              id: 3,
              mode: 'html',
              cellTitle: 'Live Range Slider',
              prose: [
                'A `<input type="range">` slider produces an `input` event on every frame while it\'s being dragged — not just on release. Listening to `input` (not `change`) is what makes the graph update smoothly as you drag. The value is always a string, so `parseFloat` is required before using it in arithmetic.',
                'The live label (`a = 2.00`) is not optional — it\'s the only feedback the user has about the exact numeric value they\'ve selected. Update it inside the same handler that re-plots. The pattern: read value → update label → update state → render.',
              ],
              code: `// A range slider controls parameter 'a' in the expression a * sin(x).
// The 'input' event fires on every pixel of drag — use it, not 'change'.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { padding: 14px; display: flex; flex-direction: column; gap: 10px }

    .slider-row {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 14px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--surface)
    }
    .slider-label { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap }
    input[type=range] {
      flex: 1;
      accent-color: var(--accent)  /* colors the thumb and track */
    }
    /* Live readout of the current value */
    .slider-val {
      font-size: 13px; font-family: monospace;
      color: var(--accent); font-weight: 700; min-width: 52px; text-align: right
    }

    canvas { width: 100%; border-radius: 8px; border: 1px solid var(--border);
             display: block; background: var(--surface) }
  </style>
  <div class="wrap">
    <div class="slider-row">
      <span class="slider-label">a =</span>
      <input id="slider" type="range" min="-3" max="3" step="0.05" value="1">
      <span class="slider-val" id="sliderVal">1.00</span>
    </div>
    <canvas id="cv" height="230"></canvas>
  </div>
\`

// ── State ─────────────────────────────────────────────────────────────────────
let a = 1   // controlled by the slider

// ── Canvas setup ──────────────────────────────────────────────────────────────
const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height
const xMin = -6, xMax = 6, yMin = -4, yMax = 4

function getC() {
  const s = getComputedStyle(document.documentElement)
  return {
    surface: s.getPropertyValue('--surface').trim(),
    border:  s.getPropertyValue('--border').trim(),
    muted:   s.getPropertyValue('--muted').trim(),
    accent:  s.getPropertyValue('--accent').trim(),
  }
}

function toScreen(wx, wy) {
  return {
    sx: (wx - xMin) / (xMax - xMin) * W,
    sy: (1 - (wy - yMin) / (yMax - yMin)) * H,
  }
}

function render() {
  const C = getC()
  ctx.fillStyle = C.surface; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = C.border; ctx.lineWidth = 1
  for (let x = Math.ceil(xMin); x <= xMax; x++) { const {sx}=toScreen(x,0); ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke() }
  for (let y = Math.ceil(yMin); y <= yMax; y++) { const {sy}=toScreen(0,y); ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke() }
  const {sx:ox,sy:oy} = toScreen(0,0)
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()

  // use the current value of 'a' to scale the sine wave
  const fn = new Function('x', 'a', 'with(Math){ return a * sin(x) }')
  ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5
  let penDown = false
  for (let i = 0; i <= W * 2; i++) {
    const wx = xMin + (i / (W * 2)) * (xMax - xMin)
    const wy = fn(wx, a)   // pass 'a' as a second argument
    if (!isFinite(wy)) { penDown = false; continue }
    const {sx, sy} = toScreen(wx, wy)
    if (!penDown) { ctx.moveTo(sx, sy); penDown = true } else { ctx.lineTo(sx, sy) }
  }
  ctx.stroke()

  // label showing current expression with live value substituted
  ctx.fillStyle = C.accent; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'left'
  ctx.fillText(\`f(x) = \${a.toFixed(2)} · sin(x)\`, 10, 16)
}

// ── Slider event ──────────────────────────────────────────────────────────────
const slider    = app.querySelector('#slider')
const sliderVal = app.querySelector('#sliderVal')

slider.addEventListener('input', () => {
  a = parseFloat(slider.value)          // string → number (always parseFloat!)
  sliderVal.textContent = a.toFixed(2)  // live value label
  render()
})

render()`,
            },
            // ── Cell 4: The Preset Plotter ───────────────────────────────────────
            {
              id: 4,
              mode: 'html',
              cellTitle: 'The Preset Plotter',
              prose: [
                'Presets and sliders together: clicking a preset sets the expression, moving the slider sets the amplitude `a`, and both call the same `render()` function. The single render function reads two state variables (`active` and `a`) and produces the output. This is the render-from-state pattern applied across multiple controls.',
                'The expression uses `new Function(\'x\', \'a\', body)` so `a` is a real function parameter rather than a string substitution. This is robust — string substitution breaks if `a` appears inside a word (e.g., in the expression `abs`), while a named parameter is always unambiguous.',
              ],
              code: `// Preset picker + amplitude slider + live plotter.
// Both controls update state and call render() — the plotter reacts to either.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { display: flex; flex-direction: column; height: 100vh; padding: 12px; gap: 8px }
    .btn-row { display: flex; gap: 6px; flex-wrap: wrap }
    .preset-btn {
      padding: 6px 13px; font-size: 12px; font-weight: 600; cursor: pointer;
      border: 1.5px solid var(--border); border-radius: 6px;
      background: var(--surface); color: var(--muted)
    }
    .preset-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent) }
    .slider-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--surface)
    }
    .slider-row label { font-size: 12px; font-weight: 600; color: var(--muted); white-space: nowrap }
    input[type=range] { flex: 1; accent-color: var(--accent) }
    .slider-val { font-size: 12px; font-family: monospace; color: var(--accent);
                  font-weight: 700; min-width: 46px; text-align: right }
    canvas { flex: 1; border-radius: 8px; border: 1px solid var(--border);
             display: block; background: var(--surface); min-height: 0 }
  </style>
  <div class="wrap">
    <div class="btn-row"   id="btnRow"></div>
    <div class="slider-row">
      <label>amplitude a =</label>
      <input id="slider" type="range" min="-3" max="3" step="0.05" value="1">
      <span class="slider-val" id="sliderVal">1.00</span>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`

// ── Data ──────────────────────────────────────────────────────────────────────
// Each preset carries a label and a body string for new Function('x','a', body)
const presets = [
  { label: 'sin(x)',   body: 'a * sin(x)'   },
  { label: 'cos(x)',   body: 'a * cos(x)'   },
  { label: 'sin(2x)',  body: 'a * sin(2*x)' },
  { label: 'x²',      body: 'a * x*x'      },
  { label: '|sin|',   body: 'a * abs(sin(x))' },
]

// ── State ─────────────────────────────────────────────────────────────────────
let active = 0
let a = 1

// ── Canvas setup ──────────────────────────────────────────────────────────────
const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
const ctx = canvas.getContext('2d')
const xMin = -6, xMax = 6, yMin = -4, yMax = 4

function getC() {
  const s = getComputedStyle(document.documentElement)
  return {
    surface: s.getPropertyValue('--surface').trim(),
    border:  s.getPropertyValue('--border').trim(),
    muted:   s.getPropertyValue('--muted').trim(),
    accent:  s.getPropertyValue('--accent').trim(),
  }
}

function toScreen(wx, wy) {
  const W = canvas.width, H = canvas.height
  return {
    sx: (wx - xMin) / (xMax - xMin) * W,
    sy: (1 - (wy - yMin) / (yMax - yMin)) * H,
  }
}

// ── Render: reads active + a, updates everything ──────────────────────────────
function render() {
  const W = canvas.width, H = canvas.height
  const C = getC()

  // 1. Update button active styles
  app.querySelectorAll('.preset-btn').forEach((b, i) => {
    b.classList.toggle('active', i === active)
  })

  // 2. Redraw canvas
  ctx.fillStyle = C.surface; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = C.border; ctx.lineWidth = 1
  for (let x = Math.ceil(xMin); x <= xMax; x++) { const {sx}=toScreen(x,0); ctx.beginPath(); ctx.moveTo(sx,0); ctx.lineTo(sx,H); ctx.stroke() }
  for (let y = Math.ceil(yMin); y <= yMax; y++) { const {sy}=toScreen(0,y); ctx.beginPath(); ctx.moveTo(0,sy); ctx.lineTo(W,sy); ctx.stroke() }
  const {sx:ox,sy:oy} = toScreen(0,0)
  ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(ox,0); ctx.lineTo(ox,H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0,oy); ctx.lineTo(W,oy); ctx.stroke()

  // 3. Plot the selected preset with current 'a'
  try {
    const fn = new Function('x', 'a', \`with(Math){ return \${presets[active].body} }\`)
    ctx.beginPath(); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5
    let penDown = false
    for (let i = 0; i <= W * 2; i++) {
      const wx = xMin + (i / (W*2)) * (xMax - xMin)
      const wy = fn(wx, a)
      if (!isFinite(wy) || Math.abs(wy) > yMax * 3) { penDown = false; continue }
      const {sx, sy} = toScreen(wx, wy)
      if (!penDown) { ctx.moveTo(sx,sy); penDown = true } else { ctx.lineTo(sx,sy) }
    }
    ctx.stroke()
    ctx.fillStyle = C.accent; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'
    ctx.fillText(\`f(x) = \${presets[active].body.replace('a', a.toFixed(2))}\`, 8, 16)
  } catch (e) { /* silent on bad expression */ }
}

// ── Build buttons ─────────────────────────────────────────────────────────────
const btnRow = app.querySelector('#btnRow')
presets.forEach((p, i) => {
  const btn = document.createElement('button')
  btn.className = 'preset-btn'
  btn.textContent = p.label
  btn.addEventListener('click', () => { active = i; render() })
  btnRow.appendChild(btn)
})

// ── Slider ────────────────────────────────────────────────────────────────────
const slider    = app.querySelector('#slider')
const sliderVal = app.querySelector('#sliderVal')
slider.addEventListener('input', () => {
  a = parseFloat(slider.value)
  sliderVal.textContent = a.toFixed(2)
  render()
})

render()`,
            },
            // ── Challenge 1: Add More Presets ────────────────────────────────────
            {
              id: 5,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Add More Presets',
              difficulty: 'easy',
              prose: [
                'Adding a preset is a one-line change to the data array — nothing else in the code needs to change. This is the payoff of "presets are data": the UI regenerates automatically. Add your three presets, run the cell, and verify the new buttons appear and plot correctly.',
              ],
              prompt: 'Add three more presets to the array: `a * tan(x)`, `a * sin(x) * cos(x)`, and `a * sqrt(abs(x))`. Each needs a `label` and a `body` string. Run the cell and verify all three buttons appear and plot correctly.',
              hint: 'Each object in the presets array follows the same shape: `{ label: \'name\', body: \'a * expr\' }`. The body uses `a` as the amplitude parameter and can use any Math function (sin, cos, tan, sqrt, abs) without the `Math.` prefix.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { display: flex; flex-direction: column; height: 100vh; padding: 12px; gap: 8px }
    .btn-row { display: flex; gap: 6px; flex-wrap: wrap }
    .preset-btn {
      padding: 6px 13px; font-size: 12px; font-weight: 600; cursor: pointer;
      border: 1.5px solid var(--border); border-radius: 6px;
      background: var(--surface); color: var(--muted)
    }
    .preset-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent) }
    canvas { flex: 1; border-radius: 8px; border: 1px solid var(--border);
             display: block; background: var(--surface); min-height: 0 }
  </style>
  <div class="wrap">
    <div class="btn-row" id="btnRow"></div>
    <canvas id="cv"></canvas>
  </div>
\`

// TODO: add three more presets below
const presets = [
  { label: 'sin(x)',  body: 'a * sin(x)'  },
  { label: 'cos(x)',  body: 'a * cos(x)'  },
  { label: 'x²',     body: 'a * x*x'     },
  // add { label: ..., body: ... } here
]

let active = 0

const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
const ctx = canvas.getContext('2d')
const xMin = -6, xMax = 6, yMin = -4, yMax = 4

function getC() {
  const s = getComputedStyle(document.documentElement)
  return { surface: s.getPropertyValue('--surface').trim(), border: s.getPropertyValue('--border').trim(),
           muted: s.getPropertyValue('--muted').trim(), accent: s.getPropertyValue('--accent').trim() }
}

function toScreen(wx,wy){const W=canvas.width,H=canvas.height;return{sx:(wx-xMin)/(xMax-xMin)*W,sy:(1-(wy-yMin)/(yMax-yMin))*H}}

function render() {
  const W=canvas.width,H=canvas.height,C=getC()
  app.querySelectorAll('.preset-btn').forEach((b,i)=>b.classList.toggle('active',i===active))
  ctx.fillStyle=C.surface;ctx.fillRect(0,0,W,H)
  ctx.strokeStyle=C.border;ctx.lineWidth=1
  for(let x=Math.ceil(xMin);x<=xMax;x++){const{sx}=toScreen(x,0);ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke()}
  for(let y=Math.ceil(yMin);y<=yMax;y++){const{sy}=toScreen(0,y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke()}
  const{sx:ox,sy:oy}=toScreen(0,0)
  ctx.strokeStyle=C.muted;ctx.lineWidth=1.5
  ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke()
  ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke()
  try {
    const fn = new Function('x','a',\`with(Math){ return \${presets[active].body} }\`)
    ctx.beginPath();ctx.strokeStyle=C.accent;ctx.lineWidth=2.5
    let penDown=false
    for(let i=0;i<=W*2;i++){
      const wx=xMin+(i/(W*2))*(xMax-xMin),wy=fn(wx,1)
      if(!isFinite(wy)||Math.abs(wy)>yMax*3){penDown=false;continue}
      const{sx,sy}=toScreen(wx,wy)
      if(!penDown){ctx.moveTo(sx,sy);penDown=true}else{ctx.lineTo(sx,sy)}
    }
    ctx.stroke()
  } catch(e){}
}

const btnRow = app.querySelector('#btnRow')
presets.forEach((p,i)=>{
  const btn=document.createElement('button')
  btn.className='preset-btn'
  btn.textContent=p.label
  btn.addEventListener('click',()=>{active=i;render()})
  btnRow.appendChild(btn)
})
render()`,
            },
            // ── Challenge 2: Save a Custom Preset ───────────────────────────────
            {
              id: 6,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Save a Custom Preset',
              difficulty: 'medium',
              prose: [
                'Since presets are just an array of objects, adding one at runtime is a `push` — then rebuild the buttons and re-render. The key insight: the UI is generated from data, so making the data dynamic (user can add entries) automatically makes the UI dynamic. You\'re not "adding a button" — you\'re adding a data entry that produces a button.',
              ],
              prompt: 'Add a text input and a "Save Preset" button below the preset bar. When the user types an expression like `sin(x)*cos(2*x)` and clicks Save, add `{ label: the expression, body: \'a * \' + expr }` to the presets array, rebuild the buttons, and set the new preset as active.',
              hint: 'After pushing to presets, clear and rebuild `btnRow` by setting `btnRow.innerHTML = \'\'`, then run the `presets.forEach(...)` loop again to regenerate all buttons including the new one. Then set `active = presets.length - 1` and call `render()`.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { display: flex; flex-direction: column; height: 100vh; padding: 12px; gap: 8px }
    .btn-row { display: flex; gap: 6px; flex-wrap: wrap }
    .preset-btn {
      padding: 6px 13px; font-size: 12px; font-weight: 600; cursor: pointer;
      border: 1.5px solid var(--border); border-radius: 6px;
      background: var(--surface); color: var(--muted)
    }
    .preset-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent) }
    .save-row { display: flex; gap: 8px }
    input {
      flex: 1; padding: 7px 12px; font-size: 13px; font-family: monospace;
      border: 1.5px solid var(--border); border-radius: 6px;
      background: var(--surface); color: var(--text)
    }
    input:focus { outline: none; border-color: var(--accent) }
    button.save {
      padding: 7px 14px; font-size: 13px; font-weight: 600;
      border: none; border-radius: 6px; cursor: pointer;
      background: var(--accent); color: var(--surface)
    }
    canvas { flex: 1; border-radius: 8px; border: 1px solid var(--border);
             display: block; background: var(--surface); min-height: 0 }
  </style>
  <div class="wrap">
    <div class="btn-row" id="btnRow"></div>
    <div class="save-row">
      <input id="customExpr" type="text" placeholder="e.g. sin(x)*cos(2*x)">
      <button class="save" id="saveBtn">Save Preset</button>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`

const presets = [
  { label: 'sin(x)', body: 'a * sin(x)' },
  { label: 'cos(x)', body: 'a * cos(x)' },
  { label: 'x²',     body: 'a * x*x'    },
]

let active = 0

const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
const ctx = canvas.getContext('2d')
const xMin = -6, xMax = 6, yMin = -4, yMax = 4

function getC() {
  const s = getComputedStyle(document.documentElement)
  return { surface: s.getPropertyValue('--surface').trim(), border: s.getPropertyValue('--border').trim(),
           muted: s.getPropertyValue('--muted').trim(), accent: s.getPropertyValue('--accent').trim() }
}
function toScreen(wx,wy){const W=canvas.width,H=canvas.height;return{sx:(wx-xMin)/(xMax-xMin)*W,sy:(1-(wy-yMin)/(yMax-yMin))*H}}

function render() {
  const W=canvas.width,H=canvas.height,C=getC()
  app.querySelectorAll('.preset-btn').forEach((b,i)=>b.classList.toggle('active',i===active))
  ctx.fillStyle=C.surface;ctx.fillRect(0,0,W,H)
  ctx.strokeStyle=C.border;ctx.lineWidth=1
  for(let x=Math.ceil(xMin);x<=xMax;x++){const{sx}=toScreen(x,0);ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke()}
  for(let y=Math.ceil(yMin);y<=yMax;y++){const{sy}=toScreen(0,y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke()}
  const{sx:ox,sy:oy}=toScreen(0,0)
  ctx.strokeStyle=C.muted;ctx.lineWidth=1.5
  ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke()
  ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke()
  try {
    const fn=new Function('x','a',\`with(Math){ return \${presets[active].body} }\`)
    ctx.beginPath();ctx.strokeStyle=C.accent;ctx.lineWidth=2.5
    let penDown=false
    for(let i=0;i<=W*2;i++){
      const wx=xMin+(i/(W*2))*(xMax-xMin),wy=fn(wx,1)
      if(!isFinite(wy)||Math.abs(wy)>yMax*3){penDown=false;continue}
      const{sx,sy}=toScreen(wx,wy)
      if(!penDown){ctx.moveTo(sx,sy);penDown=true}else{ctx.lineTo(sx,sy)}
    }
    ctx.stroke()
  } catch(e){}
}

const btnRow = app.querySelector('#btnRow')

function buildButtons() {
  btnRow.innerHTML = ''  // clear existing buttons before rebuilding
  presets.forEach((p, i) => {
    const btn = document.createElement('button')
    btn.className = 'preset-btn'
    btn.textContent = p.label
    btn.addEventListener('click', () => { active = i; render() })
    btnRow.appendChild(btn)
  })
}

// TODO: wire the Save button
// 1. Read the expression from #customExpr
// 2. Push { label: expr, body: 'a * ' + expr } to presets
// 3. Call buildButtons() to regenerate the button list
// 4. Set active to the last index, call render()

buildButtons()
render()`,
            },
            // ── Challenge 3: Dual Sliders ────────────────────────────────────────
            {
              id: 7,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Dual Parameters',
              difficulty: 'hard',
              prose: [
                'Extending from one slider to two is a direct application of the pattern: add a second state variable (`b`), a second `<input type="range">`, a second `input` listener that updates `b` and calls `render()`, and change the Function constructor to `new Function(\'x\', \'a\', \'b\', body)`. The expression `a * sin(b * x)` then uses both — `a` for amplitude, `b` for frequency.',
              ],
              prompt: 'Add a second slider for parameter `b` (frequency). The preset expression should be `a * sin(b * x)`. Both sliders should update the graph live. Show both current values (`a = X.XX`, `b = X.XX`) as labels.',
              hint: 'Add `let b = 1` as a second state variable. Copy the slider-row HTML and give the second slider id `slider2`. In its `input` handler: `b = parseFloat(slider2.value); b2Val.textContent = b.toFixed(2); render()`. Change the Function to `new Function(\'x\', \'a\', \'b\', body)` and call `fn(wx, a, b)`.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--bg) }
    .wrap { display: flex; flex-direction: column; height: 100vh; padding: 12px; gap: 8px }
    .slider-row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--surface)
    }
    .slider-row label { font-size: 12px; font-weight: 600; color: var(--muted); white-space: nowrap; width: 60px }
    input[type=range]  { flex: 1; accent-color: var(--accent) }
    .slider-val { font-size: 12px; font-family: monospace; color: var(--accent);
                  font-weight: 700; min-width: 40px; text-align: right }
    canvas { flex: 1; border-radius: 8px; border: 1px solid var(--border);
             display: block; background: var(--surface); min-height: 0 }
  </style>
  <div class="wrap">
    <div class="slider-row">
      <label>amplitude a</label>
      <input id="sliderA" type="range" min="-3" max="3" step="0.05" value="1">
      <span class="slider-val" id="aVal">1.00</span>
    </div>
    <!-- TODO: add a second slider-row for frequency b here -->
    <canvas id="cv"></canvas>
  </div>
\`

// State
let a = 1
// TODO: add let b = 1

const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
const ctx = canvas.getContext('2d')
const xMin = -6, xMax = 6, yMin = -4, yMax = 4

function getC() {
  const s = getComputedStyle(document.documentElement)
  return { surface: s.getPropertyValue('--surface').trim(), border: s.getPropertyValue('--border').trim(),
           muted: s.getPropertyValue('--muted').trim(), accent: s.getPropertyValue('--accent').trim() }
}
function toScreen(wx,wy){const W=canvas.width,H=canvas.height;return{sx:(wx-xMin)/(xMax-xMin)*W,sy:(1-(wy-yMin)/(yMax-yMin))*H}}

function render() {
  const W=canvas.width,H=canvas.height,C=getC()
  ctx.fillStyle=C.surface;ctx.fillRect(0,0,W,H)
  ctx.strokeStyle=C.border;ctx.lineWidth=1
  for(let x=Math.ceil(xMin);x<=xMax;x++){const{sx}=toScreen(x,0);ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,H);ctx.stroke()}
  for(let y=Math.ceil(yMin);y<=yMax;y++){const{sy}=toScreen(0,y);ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(W,sy);ctx.stroke()}
  const{sx:ox,sy:oy}=toScreen(0,0)
  ctx.strokeStyle=C.muted;ctx.lineWidth=1.5
  ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,H);ctx.stroke()
  ctx.beginPath();ctx.moveTo(0,oy);ctx.lineTo(W,oy);ctx.stroke()

  // TODO: change to new Function('x','a','b',...) and pass b to fn()
  const fn = new Function('x', 'a', 'with(Math){ return a * sin(x) }')
  ctx.beginPath();ctx.strokeStyle=C.accent;ctx.lineWidth=2.5
  let penDown=false
  for(let i=0;i<=W*2;i++){
    const wx=xMin+(i/(W*2))*(xMax-xMin), wy=fn(wx,a)  // TODO: also pass b
    if(!isFinite(wy)||Math.abs(wy)>yMax*3){penDown=false;continue}
    const{sx,sy}=toScreen(wx,wy)
    if(!penDown){ctx.moveTo(sx,sy);penDown=true}else{ctx.lineTo(sx,sy)}
  }
  ctx.stroke()
  ctx.fillStyle=C.accent;ctx.font='bold 11px system-ui';ctx.textAlign='left'
  ctx.fillText(\`f(x) = \${a.toFixed(2)} · sin(x)\`, 8, 16)  // TODO: show b too
}

const sliderA = app.querySelector('#sliderA')
const aVal    = app.querySelector('#aVal')
sliderA.addEventListener('input', () => {
  a = parseFloat(sliderA.value)
  aVal.textContent = a.toFixed(2)
  render()
})

// TODO: add sliderB event listener

render()`,
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
      text: '"Render from state, not from events" — what does this mean for your app\'s architecture?',
      options: [
        'Events should modify CSS directly; state is only for JavaScript logic',
        'When a user interaction occurs (slider moved, button clicked), update the state variables first, then call a single render() that reads those variables and redraws everything. The event handler should not contain any drawing code — it only updates state. This makes the visual output a pure function of state, trivially reproducible',
        'State variables should be stored in DOM attributes so events can read them',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'A slider fires the `input` event while dragging and `change` only when released. For a live-updating plotter, which should you listen to?',
      options: [
        '`change` — updating on every pixel of drag is too expensive',
        '`input` — it fires continuously while the user drags, giving live feedback. `change` would only update when the user releases, making the interaction feel unresponsive. Modern hardware handles continuous canvas redraws at 60fps with no perceptible cost for simple plots',
        '`mousemove` — it gives the most precise position information',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Slider values come through as strings: `event.target.value === "0.5"` not `0.5`. What happens if you use `speed + 1` without conversion?',
      options: [
        'JavaScript throws a TypeError because + cannot mix strings and numbers',
        'JavaScript converts 1 to a string and concatenates: "0.5" + 1 = "0.51". You get string concatenation instead of arithmetic. Using `parseFloat(event.target.value) + 1` gives the intended numeric result 1.5',
        'The + operator ignores the string and treats the value as 0',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A preset button sets multiple state variables at once and then calls render(). Why is one render() call at the end sufficient rather than rendering after each variable change?',
      options: [
        'JavaScript batches DOM changes automatically',
        'Rendering is a complete canvas redraw that reads all state at once. Calling render() mid-update would draw an inconsistent intermediate state (e.g., new amplitude with old frequency). Updating all state variables first, then rendering once, guarantees the display always reflects a consistent configuration',
        'Calling render() multiple times in a row causes a canvas memory leak',
      ],
      correct: 1,
    },
  ],
}

export default sim2_004
