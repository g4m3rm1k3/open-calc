const sim2_001 = {
  id: 'sim2-001',
  slug: 'dom-and-canvas',
  chapter: 'sim2',
  order: 1,
  title: 'DOM and Canvas',
  description: 'Build interactive UIs inside the sandbox using HTML elements, canvas drawing, buttons, and input fields.',

  hook: 'Up until now our sims have been autonomous — they just run. But real apps need to talk to the user: buttons to click, fields to type in, and outputs that react. This lesson shows how to build that kind of UI from scratch inside a single JavaScript function.',

  intuition: {
    prose: [
      'Every page you visit in a browser is made of **DOM elements** — `<div>`, `<button>`, `<canvas>`, `<input>`. You can create any of these in code, set their styles, and make them respond to events.',
      'In our sim sandbox, your code receives a single variable called `app` — a plain `<div>` that fills the preview window. Setting `app.innerHTML` to an HTML string gives you a complete UI to work with. No framework needed.',
      'A `<canvas>` element is a drawable surface: you grab its 2D drawing context with `getContext(\'2d\')`, then call drawing commands like `fillRect`, `arc`, `moveTo`, and `lineTo`. It is the same Canvas API you\'ll use to plot functions in Chapter 3.',
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'HTML Mode Pattern',
        body: 'Set `app.innerHTML` to your full HTML template (including `<style>` tags), then use `app.querySelector()` to get references to elements and attach event listeners.',
      },
      {
        type: 'insight',
        title: 'Inline Styles vs. Class Names',
        body: 'Using a `<style>` tag inside `app.innerHTML` works great here — styles are scoped to the sandbox so they can\'t leak out, and you can write normal CSS without worrying about class collisions.',
      },
    ],
    visualizations: [
      {
        id: 'SimNotebook',
        title: 'DOM and Canvas',
        initialProps: {
          initialCells: [
            // ── Cell 1: The App Container ───────────────────────────────────────
            {
              id: 1,
              mode: 'html',
              cellTitle: 'The App Container',
              code: `// Your code receives 'app' — a div that fills the preview.
// Set app.innerHTML to any HTML you want.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif }
    .card {
      margin: 20px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      border: 1px solid var(--color-border-primary, #e2e8f0);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px }
    p  { font-size: 14px; color: var(--color-text-secondary, #475569); line-height: 1.65; margin-bottom: 8px }
    code { background: var(--color-background-tertiary, #f1f5f9); padding: 2px 6px; border-radius: 4px;
           font-size: 13px; color: #0284c7 }
  </style>
  <div class="card">
    <h2>Hello from the app div!</h2>
    <p>The <code>app</code> variable is a plain div that fills this window.</p>
    <p>We can put any HTML inside it — headings, paragraphs, buttons,
       canvases, inputs — all by setting <code>app.innerHTML</code>.</p>
    <p>Try changing the heading text and pressing <strong>Run</strong>.</p>
  </div>
\``,
            },
            // ── Cell 2: Drawing with Canvas ─────────────────────────────────────
            {
              id: 2,
              mode: 'html',
              cellTitle: 'Drawing with Canvas',
              code: `// Create a canvas in the HTML, then draw on it.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    body, #app { background: var(--color-background-secondary, #f8fafc) }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 12px }
    h3  { font-size: 14px; font-weight: 700; color: #0f172a }
    canvas { width: 100%; border-radius: 8px; border: 1px solid var(--color-border-primary, #e2e8f0);
             display: block; background: white }
  </style>
  <div class="wrap">
    <h3>Canvas Drawing API</h3>
    <canvas id="cv" height="220"></canvas>
  </div>
\`

const canvas = app.querySelector('#cv')
canvas.width = canvas.offsetWidth   // match CSS width
const ctx = canvas.getContext('2d')

// ── Background ──────────────────────────────────────────────────────────────
ctx.fillStyle = '#0f172a'
ctx.fillRect(0, 0, canvas.width, canvas.height)

// ── Colored rectangles ──────────────────────────────────────────────────────
ctx.fillStyle = '#38bdf8'   // blue
ctx.fillRect(20, 20, 80, 80)

ctx.fillStyle = '#34d399'   // green
ctx.fillRect(120, 50, 80, 80)

// ── A circle ────────────────────────────────────────────────────────────────
ctx.beginPath()
ctx.arc(280, 60, 40, 0, Math.PI * 2)   // x, y, radius, startAngle, endAngle
ctx.fillStyle = '#fbbf24'
ctx.fill()

// ── A line ──────────────────────────────────────────────────────────────────
ctx.beginPath()
ctx.moveTo(20, 160)
ctx.lineTo(canvas.width - 20, 160)
ctx.strokeStyle = '#a78bfa'
ctx.lineWidth = 3
ctx.stroke()

// ── Text ────────────────────────────────────────────────────────────────────
ctx.fillStyle = 'white'
ctx.font = '13px system-ui'
ctx.fillText('fillRect, arc, lineTo — the Canvas 2D API', 20, 200)`,
            },
            // ── Cell 3: Buttons & Event Listeners ───────────────────────────────
            {
              id: 3,
              mode: 'html',
              cellTitle: 'Buttons & Event Listeners',
              code: `// querySelector gets a reference to an element after you set innerHTML.
// addEventListener tells it what to do when clicked.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 16px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    .controls { display: flex; gap: 8px; align-items: center }
    button {
      padding: 8px 18px; font-size: 14px; font-weight: 600;
      border: none; border-radius: 6px; cursor: pointer;
      background: #0284c7; color: white; transition: background 0.15s
    }
    button:hover { background: #0369a1 }
    button.red { background: #dc2626 }
    button.red:hover { background: #b91c1c }
    .count-display {
      font-size: 40px; font-weight: 800; color: #0f172a;
      text-align: center; padding: 20px;
      background: white; border-radius: 8px; border: 1px solid var(--color-border-primary, #e2e8f0)
    }
  </style>
  <div class="wrap">
    <h3>Click Counter</h3>
    <div class="count-display" id="count">0</div>
    <div class="controls">
      <button id="incBtn">+ Add</button>
      <button id="decBtn">− Subtract</button>
      <button id="resetBtn" class="red">Reset</button>
    </div>
  </div>
\`

let count = 0
const display = app.querySelector('#count')

function update() {
  display.textContent = count
}

app.querySelector('#incBtn').addEventListener('click', () => { count++; update() })
app.querySelector('#decBtn').addEventListener('click', () => { count--; update() })
app.querySelector('#resetBtn').addEventListener('click', () => { count = 0; update() })`,
            },
            // ── Cell 4: Text Input ───────────────────────────────────────────────
            {
              id: 4,
              mode: 'html',
              cellTitle: 'Text Input',
              code: `// <input type="text"> lets the user type.
// Read its current value with input.value.
// The 'input' event fires on every keystroke.

app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 14px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    .row { display: flex; gap: 8px }
    input[type=text] {
      flex: 1; padding: 9px 13px; font-size: 15px;
      border: 1.5px solid var(--color-border-secondary, #cbd5e1); border-radius: 8px; outline: none;
      transition: border 0.15s; font-family: inherit
    }
    input[type=text]:focus { border-color: #0284c7 }
    button {
      padding: 9px 18px; font-size: 14px; font-weight: 600;
      border: none; border-radius: 8px; cursor: pointer;
      background: #0284c7; color: white
    }
    .preview {
      padding: 14px 16px; background: white;
      border-radius: 8px; border: 1px solid var(--color-border-primary, #e2e8f0);
      font-size: 22px; font-weight: 700; color: #0f172a;
      min-height: 60px; word-break: break-all
    }
    .hint { font-size: 12px; color: #94a3b8 }
  </style>
  <div class="wrap">
    <h3>Text Input</h3>
    <div class="row">
      <input id="box" type="text" placeholder="Type something..." value="Hello!">
      <button id="clearBtn">Clear</button>
    </div>
    <div class="preview" id="preview">Hello!</div>
    <p class="hint">Characters: <span id="charCount">6</span></p>
  </div>
\`

const box      = app.querySelector('#box')
const preview  = app.querySelector('#preview')
const charCount = app.querySelector('#charCount')

// 'input' event fires after every keystroke
box.addEventListener('input', () => {
  preview.textContent = box.value || '(empty)'
  charCount.textContent = box.value.length
})

app.querySelector('#clearBtn').addEventListener('click', () => {
  box.value = ''
  preview.textContent = '(empty)'
  charCount.textContent = '0'
  box.focus()
})`,
            },
            // ── Challenge 1: Click to Draw ───────────────────────────────────────
            {
              id: 5,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Click to Draw',
              difficulty: 'easy',
              prompt: 'When the user clicks anywhere on the canvas, draw a filled circle at that position. Each click adds a new dot. Add a "Clear" button that wipes the canvas.',
              hint: 'Use addEventListener(\'click\', (e) => { ... }) on the canvas. The click event gives you e.offsetX and e.offsetY for the position relative to the canvas element. To wipe, call ctx.clearRect(0, 0, canvas.width, canvas.height).',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 16px; display: flex; flex-direction: column; gap: 10px; height: 100vh }
    .toolbar { display: flex; gap: 8px; align-items: center }
    button { padding: 7px 16px; font-size: 13px; font-weight: 600; border: none;
             border-radius: 6px; cursor: pointer; background: #dc2626; color: white }
    canvas { flex: 1; border-radius: 8px; border: 1px solid var(--color-border-primary, #e2e8f0);
             display: block; cursor: crosshair; background: #0f172a }
  </style>
  <div class="wrap">
    <div class="toolbar">
      <strong style="font-size:13px;color:#0f172a">Click the canvas to draw dots</strong>
      <button id="clearBtn">Clear</button>
    </div>
    <canvas id="cv"></canvas>
  </div>
\`

const canvas = app.querySelector('#cv')
canvas.width  = canvas.offsetWidth
canvas.height = canvas.offsetHeight
const ctx = canvas.getContext('2d')

// TODO: add a click listener to canvas that draws a circle at e.offsetX, e.offsetY
// TODO: wire the Clear button to wipe the canvas
`,
            },
            // ── Challenge 2: Live Character Counter ───────────────────────────────
            {
              id: 6,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'Live Character Meter',
              difficulty: 'medium',
              prompt: 'Build a text input with a 140-character limit (like old Twitter). Show a colored progress bar below the input that fills as you type. It should be green below 100 chars, yellow from 100–130, and red from 131–140. Typing beyond 140 should be prevented.',
              hint: 'Use maxlength="140" on the input to prevent over-typing. Compute a percentage: (value.length / 140) * 100. Set the progress bar width to that percentage with style.width. Change its background color with style.background based on the count.',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 12px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    textarea {
      width: 100%; padding: 10px; font-size: 14px; border-radius: 8px;
      border: 1.5px solid var(--color-border-secondary, #cbd5e1); resize: none; font-family: inherit;
      line-height: 1.5; outline: none
    }
    textarea:focus { border-color: #0284c7 }
    .bar-track {
      height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden
    }
    .bar-fill {
      height: 100%; width: 0%; border-radius: 3px;
      background: #16a34a; transition: width 0.1s, background 0.2s
    }
    .info { display: flex; justify-content: flex-end; font-size: 12px; color: var(--color-text-secondary, #475569) }
  </style>
  <div class="wrap">
    <h3>Character Limit</h3>
    <textarea id="box" rows="4" maxlength="140" placeholder="What's happening?"></textarea>
    <div class="bar-track"><div class="bar-fill" id="bar"></div></div>
    <div class="info"><span id="remaining">140 remaining</span></div>
  </div>
\`

const box  = app.querySelector('#box')
const bar  = app.querySelector('#bar')
const rem  = app.querySelector('#remaining')

box.addEventListener('input', () => {
  const n = box.value.length
  // TODO: compute percentage and update bar width
  // TODO: change bar color based on n
  // TODO: update remaining text
})`,
            },
            // ── Challenge 3: Color Mixer ───────────────────────────────────────────
            {
              id: 7,
              mode: 'html',
              isChallenge: true,
              challengeTitle: 'RGB Color Mixer',
              difficulty: 'hard',
              prompt: 'Build an RGB color mixer with three sliders (R, G, B each 0–255). Show a large color swatch and the hex code that updates live as the sliders move. Also display the current R, G, B values next to each slider.',
              hint: 'Use <input type="range" min="0" max="255">. On the input event, read the three slider values and set the swatch background to rgb(r, g, b). Convert to hex with each value converted via toString(16).padStart(2, \'0\').',
              code: `app.innerHTML = \`
  <style>
    * { box-sizing: border-box; font-family: system-ui, sans-serif; margin: 0; padding: 0 }
    .wrap { padding: 20px; display: flex; flex-direction: column; gap: 16px }
    h3 { font-size: 14px; font-weight: 700; color: #0f172a }
    .swatch { height: 100px; border-radius: 10px; border: 1px solid var(--color-border-primary, #e2e8f0); background: rgb(128,128,128) }
    .hex { text-align: center; font-size: 20px; font-weight: 700; font-family: monospace; color: #0f172a }
    .row { display: flex; align-items: center; gap: 10px; font-size: 13px }
    .row label { width: 14px; font-weight: 700 }
    .row input  { flex: 1 }
    .row span   { width: 30px; text-align: right; color: var(--color-text-secondary, #475569) }
  </style>
  <div class="wrap">
    <h3>RGB Mixer</h3>
    <div class="swatch" id="swatch"></div>
    <p class="hex" id="hex">#808080</p>
    <div class="row"><label style="color:#ef4444">R</label><input id="r" type="range" min="0" max="255" value="128"><span id="rv">128</span></div>
    <div class="row"><label style="color:#22c55e">G</label><input id="g" type="range" min="0" max="255" value="128"><span id="gv">128</span></div>
    <div class="row"><label style="color:#3b82f6">B</label><input id="b" type="range" min="0" max="255" value="128"><span id="bv">128</span></div>
  </div>
\`

const rSlider = app.querySelector('#r')
const gSlider = app.querySelector('#g')
const bSlider = app.querySelector('#b')

function update() {
  const r = +rSlider.value, g = +gSlider.value, b = +bSlider.value
  // TODO: update swatch background color
  // TODO: compute hex string and update #hex
  // TODO: update rv, gv, bv display spans
}

rSlider.addEventListener('input', update)
gSlider.addEventListener('input', update)
bSlider.addEventListener('input', update)
update()`,
            },
          ],
        },
      },
    ],
  },
}

export default sim2_001
