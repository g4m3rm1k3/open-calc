// Three project-based tutorial series.
// Each series builds one complete canvas scene from scratch.
// Step N's starterCode is step N-1's completeCode + TODO comments.

export const TUTORIALS = [

  // ═══════════════════════════════════════════════════════════════
  // SERIES 1 — Logic Gate Visualizer
  // Project: the P → Q implication scene with cycling truth table
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'logic-gate',
    title: 'Logic Gate Visualizer',
    description: 'Build the P → Q implication scene step by step — responsive canvas, styled boxes, animated arrow, cycling truth table.',
    steps: [

      // ── Step 1 ──────────────────────────────────────────────────
      {
        id: 'canvas-shell',
        title: 'The canvas shell',
        content: [
          { type: 'build', text: 'A dark background that fills the panel and redraws itself every time the panel resizes. This is the foundation every scene in this app is built on.' },

          { type: 'h3', text: 'Why a useEffect with no deps?' },
          { type: 'p', text: 'Canvas drawing is a side effect — it reaches outside React\'s render cycle and writes pixels directly. `useEffect(() => { … }, [])` runs once after the component mounts, giving us access to the real DOM node via `canvasRef.current`. The empty array means "set this up once and leave it running." We manage the animation loop and cleanup ourselves.' },

          { type: 'h3', text: 'The resize pattern' },
          { type: 'code', text: `function resize() {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.parentElement.getBoundingClientRect()
  canvasWidth  = rect.width
  canvasHeight = rect.height
  canvas.width  = canvasWidth  * dpr
  canvas.height = canvasHeight * dpr
  ctx.scale(dpr, dpr)
}
const ro = new ResizeObserver(resize)
ro.observe(canvas.parentElement)
resize()` },
          { type: 'walk', text: '`window.devicePixelRatio` is 2 on Retina screens. We multiply the pixel buffer by it and then `ctx.scale(dpr, dpr)` so all coordinates stay in CSS pixels. `ResizeObserver` fires `resize()` whenever the container changes size. We call `resize()` once immediately so `canvasWidth/canvasHeight` are set before the first draw.' },

          { type: 'h3', text: 'The animation loop' },
          { type: 'code', text: `let rafId, startTime

function draw(timestamp) {
  if (!startTime) startTime = timestamp
  const elapsed = timestamp - startTime
  const dark = document.documentElement.classList.contains('dark')

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // drawing code goes here

  rafId = requestAnimationFrame(draw)
}
rafId = requestAnimationFrame(draw)
return () => { cancelAnimationFrame(rafId); ro.disconnect() }` },
          { type: 'walk', text: '`requestAnimationFrame` calls `draw` before every screen repaint — typically 60 fps. We subtract `startTime` so `elapsed` counts from zero on each mount. `clearRect` wipes the previous frame; without it, every frame paints on top of the last. The returned cleanup function is called when React unmounts the component — without it the loop runs forever and the ResizeObserver leaks.' },

          { type: 'cs', text: '**Immediate mode graphics.** Canvas is imperative — you issue commands and they execute. Nothing redraws itself; every frame is built from scratch. This is the opposite of React\'s declarative model. The trade-off: more control, but you are responsible for every pixel on every frame.' },
          { type: 'se', text: '**Separate resize from draw.** Resize fires rarely (user drags the panel). Draw fires 60× per second. Keeping them in separate named functions means each has one job and neither grows into a catch-all.' },
          { type: 'breaks', text: '**Skipping cleanup → ghost loops.** In React StrictMode, components mount, unmount, and remount. Without `cancelAnimationFrame`, two loops run simultaneously — both drawing to the same canvas — producing flicker.' },
          { type: 'note', text: 'Press ⌘S after pasting the complete code. You should see a solid dark background. Try toggling dark mode — the background colour should change on the next frame.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    // TODO: write a resize() function that sets canvasWidth, canvasHeight,
    //       canvas.width, canvas.height, and ctx.scale(dpr, dpr)
    // TODO: create a ResizeObserver on canvas.parentElement
    // TODO: write a draw(timestamp) function that clears and fills the background
    // TODO: start the animation loop and return cleanup

  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width
      canvasHeight = rect.height
      canvas.width  = canvasWidth  * dpr
      canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 2 ──────────────────────────────────────────────────
      {
        id: 'one-logic-box',
        title: 'One logic box',
        content: [
          { type: 'build', text: 'A single rounded rectangle with a letter label (P) in the top third and the word TRUE in the bottom third, separated by a divider line. This is the exact box pattern used by every logic scene in this app.' },

          { type: 'h3', text: 'Proportional sizing — never fixed pixels' },
          { type: 'code', text: `const boxWidth  = Math.min(canvasWidth  * 0.26, 110)
const boxHeight = Math.min(canvasHeight * 0.28, 100)` },
          { type: 'walk', text: '`canvasWidth * 0.26` is "26% of the canvas width." `Math.min(…, 110)` caps it at 110px so the box doesn\'t grow absurdly on large displays. This two-part pattern — proportional with a cap — appears in every scene in this codebase. Learn it once and you never have layout bugs from resizing.' },

          { type: 'h3', text: 'Centring a rectangle' },
          { type: 'code', text: `// centreX, centreY is where we want the BOX CENTRE to be
const boxLeft = centreX - boxWidth  / 2
const boxTop  = centreY - boxHeight / 2` },
          { type: 'walk', text: 'Canvas coordinates describe the top-left corner. To place the box so its centre is at (centreX, centreY), shift left by half the width and up by half the height. This formula works for any size box.' },

          { type: 'h3', text: 'Filling then stroking' },
          { type: 'code', text: `ctx.beginPath()
ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
ctx.fillStyle = dark ? '#14532d88' : '#dcfce7'
ctx.fill()
ctx.strokeStyle = dark ? '#22c55e' : '#16a34a'
ctx.lineWidth = 2.5
ctx.stroke()` },
          { type: 'walk', text: '`beginPath()` starts a fresh path. Without it, the new shape appends to whatever was drawn before and fills as a compound shape. Fill before stroke — the fill covers the inner half of the stroke width, so the visible outline ends up exactly `lineWidth / 2` thick rather than doubled.' },

          { type: 'h3', text: 'Dividing the box into thirds' },
          { type: 'code', text: `const boxCentreY = boxTop + boxHeight / 2
// Label sits in the top third
const labelY    = boxCentreY - boxHeight * 0.18
// Divider sits just below the midpoint
const dividerY  = boxCentreY + boxHeight * 0.05
// Value sits in the bottom third
const valueY    = boxCentreY + boxHeight * 0.30` },
          { type: 'walk', text: 'All three positions are fractions of `boxHeight` offset from the centre. If the box grows, they all move proportionally — no overlap, no matter the size. Fixed pixel offsets like `centreY - 8` are the #1 source of text overlap in canvas scenes.' },

          { type: 'cs', text: '**Proportional coordinate systems.** Expressing internal positions as `boxHeight * fraction` creates a local coordinate system inside the box. Change the box size and every element inside moves correctly. CSS does the same thing with `em` units.' },
          { type: 'se', text: '**One drawBox function, reused for every box.** We\'ll call this same function for both P and Q in the next step. Encapsulating the drawing logic now means "draw a box" is one line at the call site, not 20.' },
          { type: 'breaks', text: '**Skipping `beginPath()` → shapes merge.** Draw a circle, then draw a rectangle without `beginPath()`, then call `fill()` — both shapes fill as one compound region. The result is a filled area that is the union of both, with no error message.' },
          { type: 'note', text: 'Load the complete code and press ⌘S. You should see a green box at the centre of the canvas.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width
      canvasHeight = rect.height
      canvas.width  = canvasWidth  * dpr
      canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // TODO: define boxWidth and boxHeight using Math.min(proportion, cap)
      // TODO: place the box centre at (canvasWidth/2, canvasHeight*0.38)
      // TODO: draw the rounded rectangle — fill first, then stroke
      // TODO: draw 'P' label at (boxCentreY - boxHeight*0.18), font = boxHeight*0.32
      // TODO: draw divider line at (boxCentreY + boxHeight*0.05)
      // TODO: draw 'TRUE' at (boxCentreY + boxHeight*0.30), monospace font

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width
      canvasHeight = rect.height
      canvas.width  = canvasWidth  * dpr
      canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function drawBox(centreX, centreY, label, isTrue) {
      const dark = document.documentElement.classList.contains('dark')
      const colour = isTrue ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      const bgColour = isTrue ? (dark ? '#14532d88' : '#dcfce7') : (dark ? '#450a0a88' : '#fee2e2')

      const boxWidth  = Math.min(canvasWidth  * 0.26, 110)
      const boxHeight = Math.min(canvasHeight * 0.28, 100)
      const boxLeft   = centreX - boxWidth  / 2
      const boxTop    = centreY - boxHeight / 2

      ctx.beginPath()
      ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = bgColour; ctx.fill()
      ctx.strokeStyle = colour; ctx.lineWidth = 2.5; ctx.stroke()

      const boxCentreY = boxTop + boxHeight / 2
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = colour

      ctx.font = \`bold \${Math.round(boxHeight * 0.32)}px system-ui\`
      ctx.fillText(label, centreX, boxCentreY - boxHeight * 0.18)

      ctx.beginPath()
      ctx.moveTo(boxLeft + 8, boxCentreY + boxHeight * 0.05)
      ctx.lineTo(boxLeft + boxWidth - 8, boxCentreY + boxHeight * 0.05)
      ctx.strokeStyle = colour + '44'; ctx.lineWidth = 1; ctx.stroke()

      ctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`
      ctx.fillText(isTrue ? 'TRUE' : 'FALSE', centreX, boxCentreY + boxHeight * 0.30)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      drawBox(canvasWidth / 2, canvasHeight * 0.38, 'P', true)

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 3 ──────────────────────────────────────────────────
      {
        id: 'two-boxes-arrow',
        title: 'Two boxes and an arrow',
        content: [
          { type: 'build', text: 'A second box (Q) placed to the right of P, connected by a horizontal arrow. The whole layout — both boxes plus the arrow gap — is centred as one unit.' },

          { type: 'h3', text: 'Centring a multi-element layout' },
          { type: 'code', text: `const boxWidth  = Math.min(canvasWidth * 0.26, 110)
const arrowGap  = Math.min(canvasWidth * 0.08, 40)
const totalWidth = boxWidth * 2 + arrowGap

// Left edge of the layout, so the whole thing is centred
const layoutLeft = canvasWidth / 2 - totalWidth / 2

const pCentreX = layoutLeft + boxWidth / 2
const qCentreX = layoutLeft + boxWidth + arrowGap + boxWidth / 2` },
          { type: 'walk', text: '`totalWidth` is the combined width of both boxes plus the gap. `layoutLeft` is where the left box\'s left edge should be so the entire group is centred. `pCentreX` is then one half-box from the left; `qCentreX` is one full box plus a gap plus another half-box. Add more boxes by extending this arithmetic — each centre is the previous centre plus `boxWidth + arrowGap`.' },

          { type: 'h3', text: 'Drawing the arrow' },
          { type: 'code', text: `// Shaft — stops short of the tip by arrowTipLength
const shaftEndX = qBoxLeft - arrowTipLength
ctx.beginPath()
ctx.moveTo(pBoxRight + 4, arrowY)
ctx.lineTo(shaftEndX, arrowY)
ctx.strokeStyle = arrowColour; ctx.lineWidth = 3; ctx.stroke()

// Arrowhead — filled triangle
ctx.beginPath()
ctx.moveTo(qBoxLeft, arrowY)            // tip
ctx.lineTo(shaftEndX, arrowY - 7)      // upper wing
ctx.lineTo(shaftEndX, arrowY + 7)      // lower wing
ctx.closePath()
ctx.fillStyle = arrowColour; ctx.fill()` },
          { type: 'walk', text: 'The shaft ends at `shaftEndX = qBoxLeft - arrowTipLength` so it does not poke through the arrowhead triangle. The arrowhead is a separate filled path whose tip is exactly at `qBoxLeft`. Drawing them separately lets you colour them independently later. `closePath()` draws the line from the last point back to the first, closing the triangle.' },

          { type: 'cs', text: '**Composed layout.** Centring the group as a unit (`layoutLeft = canvasWidth/2 - totalWidth/2`) is the same operation used by CSS flexbox `justify-content: center`. Rather than positioning each element in isolation, compute the total span and offset once. Adding a third element means updating `totalWidth`, not rethinking every position.' },
          { type: 'se', text: '**`drawBox` reused unchanged.** The `drawBox` function from the previous step now draws both P and Q. We pass different centreX and isTrue values — the function doesn\'t know or care how many boxes exist. This is the payoff of encapsulation: new usage, zero new code in the function itself.' },
          { type: 'breaks', text: '**Shaft overlapping arrowhead → visual doubling.** If the shaft reaches `qBoxLeft` instead of `qBoxLeft - arrowTipLength`, it visually protrudes through the triangle and looks like a line with a triangle glued on rather than an arrow. Always stop the shaft short by the tip length.' },
          { type: 'note', text: 'After loading the complete code and pressing ⌘S, you should see two green boxes connected by an arrow. In the next step we animate through all four truth table rows.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function drawBox(centreX, centreY, label, isTrue) {
      const dark = document.documentElement.classList.contains('dark')
      const colour = isTrue ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      const bgColour = isTrue ? (dark ? '#14532d88' : '#dcfce7') : (dark ? '#450a0a88' : '#fee2e2')
      const boxWidth  = Math.min(canvasWidth * 0.26, 110)
      const boxHeight = Math.min(canvasHeight * 0.28, 100)
      const boxLeft = centreX - boxWidth / 2; const boxTop = centreY - boxHeight / 2
      ctx.beginPath(); ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = bgColour; ctx.fill()
      ctx.strokeStyle = colour; ctx.lineWidth = 2.5; ctx.stroke()
      const bcy = boxTop + boxHeight / 2
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = colour
      ctx.font = \`bold \${Math.round(boxHeight * 0.32)}px system-ui\`
      ctx.fillText(label, centreX, bcy - boxHeight * 0.18)
      ctx.beginPath(); ctx.moveTo(boxLeft + 8, bcy + boxHeight * 0.05)
      ctx.lineTo(boxLeft + boxWidth - 8, bcy + boxHeight * 0.05)
      ctx.strokeStyle = colour + '44'; ctx.lineWidth = 1; ctx.stroke()
      ctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`
      ctx.fillText(isTrue ? 'TRUE' : 'FALSE', centreX, bcy + boxHeight * 0.30)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // TODO: compute layoutLeft so both boxes + arrowGap are centred
      // TODO: derive pCentreX and qCentreX from layoutLeft
      // TODO: call drawBox for P and Q
      // TODO: draw arrow shaft (stop short by arrowTipLength)
      // TODO: draw filled arrowhead triangle

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function drawBox(centreX, centreY, label, isTrue) {
      const dark = document.documentElement.classList.contains('dark')
      const colour = isTrue ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      const bgColour = isTrue ? (dark ? '#14532d88' : '#dcfce7') : (dark ? '#450a0a88' : '#fee2e2')
      const boxWidth  = Math.min(canvasWidth * 0.26, 110)
      const boxHeight = Math.min(canvasHeight * 0.28, 100)
      const boxLeft   = centreX - boxWidth / 2
      const boxTop    = centreY - boxHeight / 2
      ctx.beginPath(); ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = bgColour; ctx.fill()
      ctx.strokeStyle = colour; ctx.lineWidth = 2.5; ctx.stroke()
      const bcy = boxTop + boxHeight / 2
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = colour
      ctx.font = \`bold \${Math.round(boxHeight * 0.32)}px system-ui\`
      ctx.fillText(label, centreX, bcy - boxHeight * 0.18)
      ctx.beginPath()
      ctx.moveTo(boxLeft + 8, bcy + boxHeight * 0.05)
      ctx.lineTo(boxLeft + boxWidth - 8, bcy + boxHeight * 0.05)
      ctx.strokeStyle = colour + '44'; ctx.lineWidth = 1; ctx.stroke()
      ctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`
      ctx.fillText(isTrue ? 'TRUE' : 'FALSE', centreX, bcy + boxHeight * 0.30)
      return { boxLeft, boxWidth, boxHeight }
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const boxWidth     = Math.min(canvasWidth * 0.26, 110)
      const arrowGap     = Math.min(canvasWidth * 0.08, 40)
      const totalWidth   = boxWidth * 2 + arrowGap
      const layoutLeft   = canvasWidth / 2 - totalWidth / 2
      const rowCentreY   = canvasHeight * 0.38

      const pCentreX = layoutLeft + boxWidth / 2
      const qCentreX = layoutLeft + boxWidth + arrowGap + boxWidth / 2

      const { boxLeft: pBoxLeft } = drawBox(pCentreX, rowCentreY, 'P', true)
      const { boxLeft: qBoxLeft } = drawBox(qCentreX, rowCentreY, 'Q', true)

      const arrowColour  = dark ? '#22c55e' : '#16a34a'
      const arrowY       = rowCentreY
      const arrowTipLength = 14
      const shaftStartX  = pBoxLeft + boxWidth + 4
      const shaftEndX    = qBoxLeft - arrowTipLength

      ctx.strokeStyle = arrowColour; ctx.lineWidth = 3; ctx.setLineDash([])
      ctx.beginPath(); ctx.moveTo(shaftStartX, arrowY); ctx.lineTo(shaftEndX, arrowY); ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(qBoxLeft, arrowY)
      ctx.lineTo(shaftEndX, arrowY - 7)
      ctx.lineTo(shaftEndX, arrowY + 7)
      ctx.closePath(); ctx.fillStyle = arrowColour; ctx.fill()

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 4 ──────────────────────────────────────────────────
      {
        id: 'animate-truth-table',
        title: 'Animate the truth table',
        content: [
          { type: 'build', text: 'The scene cycles through all four rows of the implication truth table every 2.2 seconds, updating both boxes, the arrow style, a note below, and a truth table grid at the bottom. This is the finished scene.' },

          { type: 'h3', text: 'Cycling through states with modulo' },
          { type: 'code', text: `const TRUTH_ROWS = [
  { p: true,  q: true,  result: true,  note: 'Promise kept'    },
  { p: true,  q: false, result: false, note: 'Promise BROKEN'  },
  { p: false, q: true,  result: true,  note: 'No promise made' },
  { p: false, q: false, result: true,  note: 'No promise made' },
]
const MS_PER_ROW = 2200

// Inside draw():
const rowIndex = Math.floor(elapsed / MS_PER_ROW) % TRUTH_ROWS.length
const { p, q, result, note } = TRUTH_ROWS[rowIndex]` },
          { type: 'walk', text: '`Math.floor(elapsed / MS_PER_ROW)` counts complete 2.2-second intervals since start — 0 in the first 2.2s, 1 in the next, and so on. `% TRUTH_ROWS.length` wraps the count back to 0 after the last row, creating an infinite cycle. Destructuring `{ p, q, result, note }` gives us four named values from the current row in one line — cleaner than `TRUTH_ROWS[rowIndex].p` everywhere.' },

          { type: 'h3', text: 'Dashed arrow for false implication' },
          { type: 'code', text: `ctx.setLineDash(result ? [] : [8, 5])
ctx.beginPath()
ctx.moveTo(shaftStartX, arrowY)
ctx.lineTo(shaftEndX, arrowY)
ctx.stroke()
ctx.setLineDash([])   // always reset after dashed drawing` },
          { type: 'walk', text: '`ctx.setLineDash([8, 5])` makes the line alternate between 8px of drawn stroke and 5px of gap. `[]` means solid. We use a dashed line when the implication is false (P=true, Q=false) because the arrow is "broken" — the promise was not kept. Always call `ctx.setLineDash([])` after drawing a dashed line; otherwise all subsequent lines in the frame are also dashed.' },

          { type: 'h3', text: 'The truth table grid' },
          { type: 'code', text: `const tableTopY  = canvasHeight * 0.65
const columnWidth = canvasWidth  / 4

// Header row
;['P', 'Q', 'P → Q'].forEach((heading, colIndex) => {
  ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
  ctx.fillText(heading, (colIndex + 1) * columnWidth, tableTopY)
})

// Data rows
TRUTH_ROWS.forEach((row, rowNum) => {
  const rowY      = tableTopY + (rowNum + 1) * Math.round(canvasHeight * 0.062)
  const isActive  = rowNum === rowIndex
  ctx.font = isActive
    ? \`bold \${Math.round(canvasHeight * 0.046)}px "JetBrains Mono", monospace\`
    : \`\${Math.round(canvasHeight * 0.038)}px "JetBrains Mono", monospace\`
  ;[row.p, row.q, row.result].forEach((cellValue, colIndex) => {
    ctx.fillStyle = isActive
      ? (cellValue ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626'))
      : (dark ? '#334155' : '#cbd5e1')
    ctx.fillText(cellValue ? 'T' : 'F', (colIndex + 1) * columnWidth, rowY)
  })
})` },
          { type: 'walk', text: 'Dividing the canvas width into 4 equal `columnWidth` slices and placing text at `colIndex * columnWidth` creates an evenly-spaced grid without any layout math. We make the active row bold and coloured; inactive rows are muted. This is the same technique CSS tables use — equal-width columns by dividing the container.' },

          { type: 'cs', text: '**Finite state machine driven by time.** The four truth table rows are four discrete states. `Math.floor(elapsed / period) % count` is a time-driven state machine: time advances the state, modulo cycles it back. Any scene that cycles through a fixed set of cases uses this pattern.' },
          { type: 'se', text: '**Data separated from rendering.** `TRUTH_ROWS` is a plain array of objects declared at module level — it never changes. The `draw` function reads from it. This separation means you can add a fifth row, change a label, or reorder rows by editing `TRUTH_ROWS` alone. The rendering code never needs to change.' },
          { type: 'breaks', text: '**Forgetting `ctx.setLineDash([])` → everything dashed.** Line dash state persists across all subsequent draw calls in the same frame. If you draw a dashed arrow and forget to reset, the truth table text strokes, box outlines, and divider lines all become dashed in the same frame. Always reset immediately after the dashed draw.' },
          { type: 'note', text: 'Load the complete code and press ⌘S. The scene should cycle through all four rows, updating both boxes, the arrow (dashed on row 2), and the note text below. This is the finished P → Q Implication Scene.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

const TRUTH_ROWS = [
  { p: true,  q: true,  result: true,  note: 'Promise kept'    },
  { p: true,  q: false, result: false, note: 'Promise BROKEN'  },
  { p: false, q: true,  result: true,  note: 'No promise made' },
  { p: false, q: false, result: true,  note: 'No promise made' },
]
const MS_PER_ROW = 2200

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function drawBox(centreX, centreY, label, isTrue) {
      const dark = document.documentElement.classList.contains('dark')
      const colour = isTrue ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      const bgColour = isTrue ? (dark ? '#14532d88' : '#dcfce7') : (dark ? '#450a0a88' : '#fee2e2')
      const boxWidth  = Math.min(canvasWidth * 0.26, 110)
      const boxHeight = Math.min(canvasHeight * 0.28, 100)
      const boxLeft = centreX - boxWidth / 2; const boxTop = centreY - boxHeight / 2
      ctx.beginPath(); ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = bgColour; ctx.fill()
      ctx.strokeStyle = colour; ctx.lineWidth = 2.5; ctx.stroke()
      const bcy = boxTop + boxHeight / 2
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = colour
      ctx.font = \`bold \${Math.round(boxHeight * 0.32)}px system-ui\`
      ctx.fillText(label, centreX, bcy - boxHeight * 0.18)
      ctx.beginPath()
      ctx.moveTo(boxLeft + 8, bcy + boxHeight * 0.05)
      ctx.lineTo(boxLeft + boxWidth - 8, bcy + boxHeight * 0.05)
      ctx.strokeStyle = colour + '44'; ctx.lineWidth = 1; ctx.stroke()
      ctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`
      ctx.fillText(isTrue ? 'TRUE' : 'FALSE', centreX, bcy + boxHeight * 0.30)
      return { boxLeft, boxWidth, boxHeight }
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // TODO: compute rowIndex using Math.floor(elapsed / MS_PER_ROW) % TRUTH_ROWS.length
      // TODO: destructure { p, q, result, note } from TRUTH_ROWS[rowIndex]
      // TODO: call drawBox for P and Q, passing p and q as isTrue
      // TODO: draw the arrow with ctx.setLineDash(result ? [] : [8, 5])
      //       reset with ctx.setLineDash([]) after
      // TODO: draw the note text below the boxes
      // TODO: draw the truth table grid at canvasHeight * 0.65

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

const TRUTH_ROWS = [
  { p: true,  q: true,  result: true,  note: 'Promise kept'    },
  { p: true,  q: false, result: false, note: 'Promise BROKEN'  },
  { p: false, q: true,  result: true,  note: 'No promise made' },
  { p: false, q: false, result: true,  note: 'No promise made' },
]
const MS_PER_ROW = 2200

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function drawBox(centreX, centreY, label, isTrue) {
      const dark = document.documentElement.classList.contains('dark')
      const colour = isTrue ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      const bgColour = isTrue ? (dark ? '#14532d88' : '#dcfce7') : (dark ? '#450a0a88' : '#fee2e2')
      const boxWidth  = Math.min(canvasWidth * 0.26, 110)
      const boxHeight = Math.min(canvasHeight * 0.28, 100)
      const boxLeft   = centreX - boxWidth / 2
      const boxTop    = centreY - boxHeight / 2
      ctx.beginPath(); ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = bgColour; ctx.fill()
      ctx.strokeStyle = colour; ctx.lineWidth = 2.5; ctx.stroke()
      const bcy = boxTop + boxHeight / 2
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = colour
      ctx.font = \`bold \${Math.round(boxHeight * 0.32)}px system-ui\`
      ctx.fillText(label, centreX, bcy - boxHeight * 0.18)
      ctx.beginPath()
      ctx.moveTo(boxLeft + 8, bcy + boxHeight * 0.05)
      ctx.lineTo(boxLeft + boxWidth - 8, bcy + boxHeight * 0.05)
      ctx.strokeStyle = colour + '44'; ctx.lineWidth = 1; ctx.stroke()
      ctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`
      ctx.fillText(isTrue ? 'TRUE' : 'FALSE', centreX, bcy + boxHeight * 0.30)
      return { boxLeft, boxWidth, boxHeight }
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const rowIndex = Math.floor(elapsed / MS_PER_ROW) % TRUTH_ROWS.length
      const { p, q, result, note } = TRUTH_ROWS[rowIndex]

      const boxWidth     = Math.min(canvasWidth * 0.26, 110)
      const arrowGap     = Math.min(canvasWidth * 0.08, 40)
      const totalWidth   = boxWidth * 2 + arrowGap
      const layoutLeft   = canvasWidth / 2 - totalWidth / 2
      const rowCentreY   = canvasHeight * 0.38

      const pCentreX = layoutLeft + boxWidth / 2
      const qCentreX = layoutLeft + boxWidth + arrowGap + boxWidth / 2

      const { boxLeft: pBoxLeft } = drawBox(pCentreX, rowCentreY, 'P', p)
      const { boxLeft: qBoxLeft, boxHeight } = drawBox(qCentreX, rowCentreY, 'Q', q)

      const arrowColour    = result ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626')
      const arrowY         = rowCentreY
      const arrowTipLength = 14
      const shaftStartX    = pBoxLeft + boxWidth + 4
      const shaftEndX      = qBoxLeft - arrowTipLength

      ctx.strokeStyle = arrowColour; ctx.lineWidth = 3
      ctx.setLineDash(result ? [] : [8, 5])
      ctx.beginPath(); ctx.moveTo(shaftStartX, arrowY); ctx.lineTo(shaftEndX, arrowY); ctx.stroke()
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(qBoxLeft, arrowY); ctx.lineTo(shaftEndX, arrowY - 7); ctx.lineTo(shaftEndX, arrowY + 7)
      ctx.closePath(); ctx.fillStyle = arrowColour; ctx.fill()

      // Note below boxes
      ctx.font = \`bold \${Math.round(canvasHeight * 0.048)}px system-ui\`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = arrowColour
      ctx.fillText(note, canvasWidth / 2, rowCentreY + boxHeight / 2 + canvasHeight * 0.07)

      // Truth table
      const tableTopY   = canvasHeight * 0.65
      const columnWidth = canvasWidth  / 4
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ;['P', 'Q', 'P → Q'].forEach((heading, colIndex) => {
        ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
        ctx.font = \`\${Math.round(canvasHeight * 0.038)}px "JetBrains Mono", monospace\`
        ctx.fillText(heading, (colIndex + 1) * columnWidth, tableTopY)
      })
      TRUTH_ROWS.forEach((row, rowNum) => {
        const rowY     = tableTopY + (rowNum + 1) * Math.round(canvasHeight * 0.062)
        const isActive = rowNum === rowIndex
        ctx.font = isActive
          ? \`bold \${Math.round(canvasHeight * 0.046)}px "JetBrains Mono", monospace\`
          : \`\${Math.round(canvasHeight * 0.038)}px "JetBrains Mono", monospace\`
        ;[row.p, row.q, row.result].forEach((cellValue, colIndex) => {
          ctx.fillStyle = isActive
            ? (cellValue ? (dark ? '#22c55e' : '#16a34a') : (dark ? '#ef4444' : '#dc2626'))
            : (dark ? '#334155' : '#cbd5e1')
          ctx.fillText(cellValue ? 'T' : 'F', (colIndex + 1) * columnWidth, rowY)
        })
      })

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SERIES 2 — Bubble Sort Visualiser
  // Project: animated bar chart showing bubble sort step by step
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'bubble-sort',
    title: 'Bubble Sort Visualiser',
    description: 'Build an animated bar chart that steps through every comparison and swap in bubble sort, showing exactly why the algorithm works.',
    steps: [

      // ── Step 1 ──────────────────────────────────────────────────
      {
        id: 'static-bars',
        title: 'Static bars',
        content: [
          { type: 'build', text: 'A row of vertical bars, each proportional in height to a value in an array. This is the starting state of the visualiser — all bars drawn, none highlighted.' },

          { type: 'h3', text: 'Mapping values to heights' },
          { type: 'code', text: `const VALUES   = [64, 34, 25, 12, 22, 11, 90]
const maxValue = Math.max(...VALUES)

// Inside draw():
const usableHeight  = canvasHeight * 0.70
const barAreaLeft   = canvasWidth  * 0.08
const barAreaWidth  = canvasWidth  * 0.84
const barWidth      = barAreaWidth / VALUES.length
const barSpacing    = barWidth * 0.15
const barNetWidth   = barWidth - barSpacing` },
          { type: 'walk', text: '`usableHeight * 0.70` reserves 70% of the canvas height for bars — leaving room above for a title and below for labels. `barWidth` divides the bar area equally among all values. `barSpacing` creates a small gap between bars (15% of the slot width). `barNetWidth` is the drawable bar width after subtracting the gap.' },

          { type: 'h3', text: 'Drawing each bar' },
          { type: 'code', text: `VALUES.forEach((value, index) => {
  const barHeight = (value / maxValue) * usableHeight
  const barLeft   = barAreaLeft + index * barWidth + barSpacing / 2
  const barTop    = canvasHeight * 0.85 - barHeight   // bars grow upward

  ctx.fillStyle = dark ? '#6366f1' : '#4f46e5'
  ctx.fillRect(barLeft, barTop, barNetWidth, barHeight)
})` },
          { type: 'walk', text: '`(value / maxValue) * usableHeight` normalises the value to a fraction of the usable height. The bar with `value === maxValue` gets the full `usableHeight`; others get proportionally less. `barTop = canvasHeight * 0.85 - barHeight` positions the bar so its bottom sits at 85% down the canvas — bars grow upward by subtracting height from the bottom anchor.' },

          { type: 'cs', text: '**Normalisation.** Dividing every value by the maximum maps the range [0, max] onto [0, 1]. Multiplying by `usableHeight` then maps [0, 1] onto [0, usableHeight]. This same operation — "what fraction of the maximum is this value?" — appears everywhere data is mapped to visual space: bar charts, progress bars, audio meters.' },
          { type: 'se', text: '**Constants at module level.** `VALUES` and `maxValue` are declared outside `useEffect`. They never change during the session. Keeping them at module level makes them immediately visible when reading the file — a reader can see the data and the maximum before reading any drawing code.' },
          { type: 'breaks', text: '**`barTop = baselineY - barHeight` vs `barTop = baselineY + barHeight`.** Adding height instead of subtracting it draws bars downward from the baseline — they grow toward the bottom. This is backwards from how a chart looks to a reader. Canvas y-axis points downward, so "growing upward" requires subtracting height.' },
          { type: 'note', text: 'Press ⌘S — you should see 7 indigo bars of varying heights. In the next step we highlight the comparison pair.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

const VALUES   = [64, 34, 25, 12, 22, 11, 90]
const maxValue = Math.max(...VALUES)

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // TODO: define usableHeight, barAreaLeft, barAreaWidth, barWidth, barSpacing, barNetWidth
      // TODO: forEach VALUE: compute barHeight, barLeft, barTop and draw a fillRect

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

const VALUES   = [64, 34, 25, 12, 22, 11, 90]
const maxValue = Math.max(...VALUES)

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const usableHeight = canvasHeight * 0.70
      const barAreaLeft  = canvasWidth  * 0.08
      const barAreaWidth = canvasWidth  * 0.84
      const barWidth     = barAreaWidth / VALUES.length
      const barSpacing   = barWidth * 0.15
      const barNetWidth  = barWidth - barSpacing
      const baselineY    = canvasHeight * 0.85

      VALUES.forEach((value, index) => {
        const barHeight = (value / maxValue) * usableHeight
        const barLeft   = barAreaLeft + index * barWidth + barSpacing / 2
        const barTop    = baselineY - barHeight
        ctx.fillStyle = dark ? '#6366f1' : '#4f46e5'
        ctx.fillRect(barLeft, barTop, barNetWidth, barHeight)
      })

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 2 ──────────────────────────────────────────────────
      {
        id: 'highlight-comparison',
        title: 'Highlight the comparison',
        content: [
          { type: 'build', text: 'Pre-compute every comparison and swap bubble sort makes, then step through them in a timed loop — highlighting the two bars being compared in amber, and swapped pairs in red.' },

          { type: 'h3', text: 'Pre-computing all steps' },
          { type: 'code', text: `function buildSortSteps(initialValues) {
  const steps = []
  const array = [...initialValues]   // never mutate the original
  const n = array.length

  for (let passIndex = 0; passIndex < n - 1; passIndex++) {
    for (let compareIndex = 0; compareIndex < n - 1 - passIndex; compareIndex++) {
      steps.push({
        array:        [...array],        // snapshot before this comparison
        compareLeft:  compareIndex,
        compareRight: compareIndex + 1,
        isSwap:       array[compareIndex] > array[compareIndex + 1],
      })
      if (array[compareIndex] > array[compareIndex + 1]) {
        ;[array[compareIndex], array[compareIndex + 1]] = [array[compareIndex + 1], array[compareIndex]]
      }
    }
  }
  steps.push({ array: [...array], compareLeft: -1, compareRight: -1, isSwap: false })
  return steps
}

const ALL_STEPS = buildSortSteps(VALUES)` },
          { type: 'walk', text: 'We run the full bubble sort algorithm before any animation starts, recording a snapshot at each comparison. `[...array]` creates a shallow copy of the current array state — without this, every step\'s `array` would point to the same object and end up showing the final sorted state. `compareLeft` and `compareRight` tell the draw function which two bars to highlight. The final step has `-1` indices (no highlight) to show the completed sorted array.' },

          { type: 'h3', text: 'Stepping through on a timer' },
          { type: 'code', text: `const MS_PER_STEP = 600

// Inside draw(timestamp):
const stepIndex   = Math.min(
  Math.floor(elapsed / MS_PER_STEP),
  ALL_STEPS.length - 1
)
const currentStep = ALL_STEPS[stepIndex]` },
          { type: 'walk', text: '`Math.floor(elapsed / MS_PER_STEP)` advances one step every 600ms. `Math.min(…, ALL_STEPS.length - 1)` clamps it at the last step so the animation freezes on the sorted result rather than going out of bounds. Using `Math.min` instead of modulo means the animation plays once and holds — use modulo if you want it to loop.' },

          { type: 'h3', text: 'Colouring bars by role' },
          { type: 'code', text: `currentStep.array.forEach((value, index) => {
  const isLeftBar   = index === currentStep.compareLeft
  const isRightBar  = index === currentStep.compareRight
  const isComparing = isLeftBar || isRightBar

  ctx.fillStyle = isComparing && currentStep.isSwap
    ? (dark ? '#ef4444' : '#dc2626')   // red  — will be swapped
    : isComparing
    ? (dark ? '#f59e0b' : '#d97706')   // amber — being compared
    : (dark ? '#6366f1' : '#4f46e5')   // indigo — idle
  ctx.fillRect(barLeft, barTop, barNetWidth, barHeight)
})` },
          { type: 'walk', text: 'Three-way colour logic: if the bar is part of the current comparison AND a swap is needed, it\'s red. If it\'s being compared but no swap needed, it\'s amber. Otherwise it\'s the default indigo. Nesting the ternaries reads left-to-right: most specific condition first, fallback last.' },

          { type: 'cs', text: '**Separating algorithm from animation.** `buildSortSteps` is a pure function — it takes an array and returns a new array of step objects. It has no knowledge of canvas, colours, or timing. The draw function has no knowledge of how sorting works. This separation means you can swap in merge sort by replacing `buildSortSteps` — the draw function never changes.' },
          { type: 'se', text: '**Snapshot, don\'t reference.** `steps.push({ array: [...array] })` stores a copy of the array at each step. If you stored `array` directly, every step would reference the same array object — and since sorting mutates it, every step would show the final sorted state. Snapshot when you need a frozen view of mutable state.' },
          { type: 'breaks', text: '**Using modulo instead of Math.min → index out of bounds.** `Math.floor(elapsed / MS_PER_STEP) % ALL_STEPS.length` loops forever but also means the final sorted state only shows for one frame before wrapping. For a "play once and hold" animation, always use `Math.min(computedIndex, maxIndex)`.' },
          { type: 'note', text: 'Press ⌘S. The bars should step through every comparison — amber while comparing, red when a swap is about to happen. The final frame should show them fully sorted.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

const VALUES   = [64, 34, 25, 12, 22, 11, 90]
const maxValue = Math.max(...VALUES)

// TODO: write buildSortSteps(initialValues) that returns an array of step objects
// Each step: { array, compareLeft, compareRight, isSwap }
// TODO: const ALL_STEPS = buildSortSteps(VALUES)

const MS_PER_STEP = 600

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // TODO: compute stepIndex = Math.min(Math.floor(elapsed / MS_PER_STEP), ALL_STEPS.length - 1)
      // TODO: get currentStep = ALL_STEPS[stepIndex]
      // TODO: draw bars from currentStep.array with three-way colour logic

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

const VALUES   = [64, 34, 25, 12, 22, 11, 90]
const maxValue = Math.max(...VALUES)
const MS_PER_STEP = 600

function buildSortSteps(initialValues) {
  const steps = []
  const array = [...initialValues]
  const n = array.length
  for (let passIndex = 0; passIndex < n - 1; passIndex++) {
    for (let compareIndex = 0; compareIndex < n - 1 - passIndex; compareIndex++) {
      const willSwap = array[compareIndex] > array[compareIndex + 1]
      steps.push({ array: [...array], compareLeft: compareIndex, compareRight: compareIndex + 1, isSwap: willSwap })
      if (willSwap) {
        ;[array[compareIndex], array[compareIndex + 1]] = [array[compareIndex + 1], array[compareIndex]]
      }
    }
  }
  steps.push({ array: [...array], compareLeft: -1, compareRight: -1, isSwap: false })
  return steps
}

const ALL_STEPS = buildSortSteps(VALUES)

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const stepIndex   = Math.min(Math.floor(elapsed / MS_PER_STEP), ALL_STEPS.length - 1)
      const currentStep = ALL_STEPS[stepIndex]

      const usableHeight = canvasHeight * 0.70
      const barAreaLeft  = canvasWidth  * 0.08
      const barAreaWidth = canvasWidth  * 0.84
      const barWidth     = barAreaWidth / VALUES.length
      const barSpacing   = barWidth * 0.15
      const barNetWidth  = barWidth - barSpacing
      const baselineY    = canvasHeight * 0.85

      currentStep.array.forEach((value, index) => {
        const isLeftBar   = index === currentStep.compareLeft
        const isRightBar  = index === currentStep.compareRight
        const isComparing = isLeftBar || isRightBar
        ctx.fillStyle = isComparing && currentStep.isSwap
          ? (dark ? '#ef4444' : '#dc2626')
          : isComparing
          ? (dark ? '#f59e0b' : '#d97706')
          : (dark ? '#6366f1' : '#4f46e5')
        const barHeight = (value / maxValue) * usableHeight
        const barLeft   = barAreaLeft + index * barWidth + barSpacing / 2
        const barTop    = baselineY - barHeight
        ctx.fillRect(barLeft, barTop, barNetWidth, barHeight)
      })

      // Step counter label
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillStyle = dark ? '#94a3b8' : '#64748b'
      ctx.font = \`\${Math.round(canvasHeight * 0.04)}px "JetBrains Mono", monospace\`
      ctx.fillText(
        stepIndex < ALL_STEPS.length - 1 ? \`Step \${stepIndex + 1} / \${ALL_STEPS.length - 1}\` : 'Sorted!',
        canvasWidth / 2, canvasHeight * 0.04
      )

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // SERIES 3 — Sine Wave Animation
  // Project: animated sine wave with particles riding it
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'sine-wave',
    title: 'Sine Wave Animation',
    description: 'Build an animated sine wave from first principles, then add glowing particles that ride it — introducing phase, amplitude, and frequency through visual feedback.',
    steps: [

      // ── Step 1 ──────────────────────────────────────────────────
      {
        id: 'draw-the-wave',
        title: 'Draw the wave',
        content: [
          { type: 'build', text: 'A smooth sine wave drawn across the full width of the canvas, centred vertically, with configurable amplitude and frequency. The wave is static this step — animation comes next.' },

          { type: 'h3', text: 'What a sine wave is' },
          { type: 'p', text: '`Math.sin(angle)` returns a value between -1 and 1 as `angle` sweeps from 0 to 2π. If we map x-position to angle and map the output to a y-offset, we get a smooth wave. Two parameters control its shape: **amplitude** (how tall) and **frequency** (how many cycles across the width).' },

          { type: 'h3', text: 'Tracing the wave with a path' },
          { type: 'code', text: `const waveAmplitude  = canvasHeight * 0.18   // max displacement from centre
const waveFrequency  = 2.5                    // cycles across the full width
const waveCentreY    = canvasHeight * 0.50

ctx.beginPath()
for (let xPixel = 0; xPixel <= canvasWidth; xPixel++) {
  const fraction   = xPixel / canvasWidth             // 0 → 1 across width
  const angle      = fraction * waveFrequency * Math.PI * 2
  const yOffset    = Math.sin(angle) * waveAmplitude
  const yPixel     = waveCentreY + yOffset

  if (xPixel === 0) ctx.moveTo(xPixel, yPixel)
  else              ctx.lineTo(xPixel, yPixel)
}
ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
ctx.lineWidth = 3
ctx.stroke()` },
          { type: 'walk', text: '`fraction = xPixel / canvasWidth` maps x from pixel-space to [0, 1]. Multiplying by `waveFrequency * Math.PI * 2` maps that to [0, frequency * 2π] — so `waveFrequency = 2.5` gives 2.5 full cycles of sin. `Math.sin` then maps to [-1, 1], and multiplying by `waveAmplitude` maps to [-amplitude, +amplitude] pixels. Adding `waveCentreY` shifts the whole wave to the vertical centre.\n\nThe loop uses `moveTo` for the first point and `lineTo` for every subsequent point, building a connected path. `stroke()` paints the line. Drawing one pixel at a time produces a smooth curve because the changes between adjacent pixels are tiny.' },

          { type: 'cs', text: '**Function composition.** The y coordinate is a chain of transformations: pixel → fraction → angle → sine value → pixel offset → canvas y. Each step maps one space to another. Understanding this chain — not just the final formula — is what lets you modify any part of it. Want a faster wave? Change only the frequency step. Want a taller wave? Change only the amplitude step.' },
          { type: 'se', text: '**Named constants for wave parameters.** `waveAmplitude` and `waveFrequency` are named at the top of the draw call. A reader immediately knows what the wave looks like from the names alone, without tracing through the math. Bare numbers like `Math.sin(x / 300 * 5) * 80` are opaque; named constants document intent.' },
          { type: 'breaks', text: '**Missing `beginPath()` → wave appended to previous frame\'s path.** Without `beginPath()`, `lineTo` extends the path from wherever the previous `stroke()` ended — usually a random position. The result is a diagonal line connecting the end of the previous wave to the start of the new one, drawn across the canvas every frame.' },
          { type: 'note', text: 'Press ⌘S. You should see a smooth purple wave with 2.5 cycles centred on the canvas. Try changing `waveFrequency` to 1 or 5 and pressing ⌘S again.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // TODO: define waveAmplitude, waveFrequency, waveCentreY
      // TODO: loop xPixel from 0 to canvasWidth
      //         fraction = xPixel / canvasWidth
      //         angle    = fraction * waveFrequency * Math.PI * 2
      //         yPixel   = waveCentreY + Math.sin(angle) * waveAmplitude
      //         moveTo on first pixel, lineTo on the rest
      // TODO: stroke the path

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const waveAmplitude = canvasHeight * 0.18
      const waveFrequency = 2.5
      const waveCentreY   = canvasHeight * 0.50

      ctx.beginPath()
      for (let xPixel = 0; xPixel <= canvasWidth; xPixel++) {
        const fraction = xPixel / canvasWidth
        const angle    = fraction * waveFrequency * Math.PI * 2
        const yPixel   = waveCentreY + Math.sin(angle) * waveAmplitude
        if (xPixel === 0) ctx.moveTo(xPixel, yPixel)
        else              ctx.lineTo(xPixel, yPixel)
      }
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.lineWidth = 3
      ctx.stroke()

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 2 ──────────────────────────────────────────────────
      {
        id: 'animate-the-wave',
        title: 'Animate the wave',
        content: [
          { type: 'build', text: 'The wave moves horizontally — as if a wave is travelling from left to right across the screen. One extra variable, a time-based phase offset, makes it happen.' },

          { type: 'h3', text: 'Phase offset — shifting the wave over time' },
          { type: 'code', text: `// elapsed is ms since start, from requestAnimationFrame timestamp
const waveSpeed        = 0.0018   // radians per millisecond
const phaseOffset      = elapsed * waveSpeed

// Inside the loop:
const angle = fraction * waveFrequency * Math.PI * 2 - phaseOffset` },
          { type: 'walk', text: '`phaseOffset = elapsed * waveSpeed` grows steadily over time. Subtracting it from the angle shifts the wave to the right — because subtracting from the input of `sin` shifts the output pattern in the positive direction. `waveSpeed = 0.0018` means the wave moves 0.0018 radians per millisecond, or about 1.8 radians per second. One full cycle is 2π ≈ 6.28 radians, so the wave takes about 3.5 seconds to travel one full wavelength.' },

          { type: 'h3', text: 'Adding glow with shadowBlur' },
          { type: 'code', text: `ctx.shadowColor = dark ? '#818cf8' : '#6366f1'
ctx.shadowBlur  = 12
ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
ctx.lineWidth   = 3
ctx.stroke()
ctx.shadowBlur  = 0   // always reset — shadowBlur affects all subsequent draws` },
          { type: 'walk', text: '`ctx.shadowBlur` draws a blurred shadow in `ctx.shadowColor` behind any stroke or fill. Setting it to 12 gives the wave a soft glow without any extra drawing calls. Like `setLineDash`, `shadowBlur` persists across all subsequent draws — reset it to 0 immediately after use or everything else in the frame will also have a glow.' },

          { type: 'cs', text: '**Phase and frequency are independent.** Frequency controls how many cycles exist in space (across the width). Phase controls where in the cycle we start at each moment in time. Changing frequency changes how many waves you see. Changing phase speed changes how fast they appear to travel. You can mix these freely: slow frequency + fast phase = wide waves moving quickly.' },
          { type: 'se', text: '**`waveSpeed` as a named constant.** If you embed `0.0018` directly in the angle formula, it looks like magic. Naming it `waveSpeed` documents what it controls. The next developer can change it in one place with confidence — no need to trace through the formula to understand what they\'re changing.' },
          { type: 'breaks', text: '**Forgetting `ctx.shadowBlur = 0` → everything glows.** Shadow state is global on the context. If you draw the wave with `shadowBlur = 12` and forget to reset, every bar, box, and text drawn after also has a blurry glow. The effect compounds quickly and produces a blurry mess by the second frame.' },
          { type: 'note', text: 'Press ⌘S. The wave should now appear to travel from left to right. Try changing `waveSpeed` — larger values scroll faster, smaller values slower. Negative values scroll in reverse.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const waveAmplitude = canvasHeight * 0.18
      const waveFrequency = 2.5
      const waveCentreY   = canvasHeight * 0.50
      // TODO: const waveSpeed   = 0.0018
      // TODO: const phaseOffset = elapsed * waveSpeed
      // TODO: subtract phaseOffset from the angle inside the loop
      // TODO: add ctx.shadowColor and ctx.shadowBlur = 12 before stroke, reset after

      ctx.beginPath()
      for (let xPixel = 0; xPixel <= canvasWidth; xPixel++) {
        const fraction = xPixel / canvasWidth
        const angle    = fraction * waveFrequency * Math.PI * 2  // add - phaseOffset here
        const yPixel   = waveCentreY + Math.sin(angle) * waveAmplitude
        if (xPixel === 0) ctx.moveTo(xPixel, yPixel)
        else              ctx.lineTo(xPixel, yPixel)
      }
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.lineWidth = 3
      ctx.stroke()

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const waveAmplitude = canvasHeight * 0.18
      const waveFrequency = 2.5
      const waveCentreY   = canvasHeight * 0.50
      const waveSpeed     = 0.0018
      const phaseOffset   = elapsed * waveSpeed

      ctx.beginPath()
      for (let xPixel = 0; xPixel <= canvasWidth; xPixel++) {
        const fraction = xPixel / canvasWidth
        const angle    = fraction * waveFrequency * Math.PI * 2 - phaseOffset
        const yPixel   = waveCentreY + Math.sin(angle) * waveAmplitude
        if (xPixel === 0) ctx.moveTo(xPixel, yPixel)
        else              ctx.lineTo(xPixel, yPixel)
      }
      ctx.shadowColor = dark ? '#818cf8' : '#6366f1'
      ctx.shadowBlur  = 12
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.lineWidth   = 3
      ctx.stroke()
      ctx.shadowBlur  = 0

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },

      // ── Step 3 ──────────────────────────────────────────────────
      {
        id: 'particles-on-the-wave',
        title: 'Particles riding the wave',
        content: [
          { type: 'build', text: 'Five glowing circles that ride the wave — each at a fixed x-position, each with its y-coordinate calculated from the same sine formula, so they always sit exactly on the wave surface.' },

          { type: 'h3', text: 'Computing the wave y at any x' },
          { type: 'code', text: `function waveYAt(xPixel) {
  const fraction    = xPixel / canvasWidth
  const angle       = fraction * waveFrequency * Math.PI * 2 - phaseOffset
  return waveCentreY + Math.sin(angle) * waveAmplitude
}` },
          { type: 'walk', text: 'We extracted the y-calculation into a named function. This is the same formula as the drawing loop — now it is also usable for placing particles. Both the wave path and the particles call `waveYAt`, so they are guaranteed to agree. If you change the formula in one place, it automatically updates in the other. This is the DRY principle: Don\'t Repeat Yourself.' },

          { type: 'h3', text: 'Placing particles along the wave' },
          { type: 'code', text: `const PARTICLE_COUNT     = 5
const particleRadius     = Math.min(canvasWidth * 0.018, 9)
const particleColour     = dark ? '#f472b6' : '#ec4899'   // pink

for (let particleIndex = 0; particleIndex < PARTICLE_COUNT; particleIndex++) {
  // Space particles evenly — index 0 is 1/(count+1) across, index 4 is count/(count+1)
  const xFraction = (particleIndex + 1) / (PARTICLE_COUNT + 1)
  const xPixel    = xFraction * canvasWidth
  const yPixel    = waveYAt(xPixel)

  ctx.shadowColor = particleColour
  ctx.shadowBlur  = 18
  ctx.beginPath()
  ctx.arc(xPixel, yPixel, particleRadius, 0, Math.PI * 2)
  ctx.fillStyle = particleColour
  ctx.fill()
  ctx.shadowBlur = 0
}` },
          { type: 'walk', text: '`(particleIndex + 1) / (PARTICLE_COUNT + 1)` distributes particles evenly without bunching at the edges. For 5 particles this gives fractions: 1/6, 2/6, 3/6, 4/6, 5/6 — evenly spaced, never touching the canvas edges. We compute `xPixel = xFraction * canvasWidth`, then `yPixel = waveYAt(xPixel)` — the particle\'s y is always exactly on the wave surface because it uses the same formula.' },

          { type: 'cs', text: '**Parametric coordinates.** A particle\'s position is not stored — it is computed from a parameter (its x-fraction) and the current state (the wave formula). There is no array of positions to update. The particles move because the wave formula changes over time (via `phaseOffset`), and the particle positions re-derive from it every frame. This is parametric rather than simulation: position = f(parameters).' },
          { type: 'se', text: '**Extract before reuse.** We extracted `waveYAt` when we needed to use the same calculation in two places. Extraction before reuse is the right time — not speculatively beforehand. Now both usages are guaranteed to stay in sync.' },
          { type: 'breaks', text: '**Particles computed with different waveSpeed → particles fall off the wave.** If you copy-paste the angle formula into the particle calculation and forget to subtract `phaseOffset`, the particles sit on where the wave was at time=0, not where it is now. They instantly appear to float above or below the surface as the wave moves. Always use the same extracted function for both.' },
          { type: 'note', text: 'Press ⌘S. Five pink circles should ride the animated wave, bobbing up and down as the wave passes under them. This is the finished Sine Wave Animation.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const waveAmplitude = canvasHeight * 0.18
      const waveFrequency = 2.5
      const waveCentreY   = canvasHeight * 0.50
      const waveSpeed     = 0.0018
      const phaseOffset   = elapsed * waveSpeed

      // TODO: extract waveYAt(xPixel) that returns waveCentreY + Math.sin(angle) * waveAmplitude

      ctx.beginPath()
      for (let xPixel = 0; xPixel <= canvasWidth; xPixel++) {
        const fraction = xPixel / canvasWidth
        const angle    = fraction * waveFrequency * Math.PI * 2 - phaseOffset
        const yPixel   = waveCentreY + Math.sin(angle) * waveAmplitude
        if (xPixel === 0) ctx.moveTo(xPixel, yPixel)
        else              ctx.lineTo(xPixel, yPixel)
      }
      ctx.shadowColor = dark ? '#818cf8' : '#6366f1'
      ctx.shadowBlur = 12
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.lineWidth = 3; ctx.stroke(); ctx.shadowBlur = 0

      // TODO: loop 5 particles using xFraction = (i + 1) / (5 + 1)
      //       xPixel = xFraction * canvasWidth
      //       yPixel = waveYAt(xPixel)
      //       draw a glowing arc at (xPixel, yPixel)

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let canvasWidth, canvasHeight, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      canvasWidth  = rect.width; canvasHeight = rect.height
      canvas.width = canvasWidth * dpr; canvas.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      const waveAmplitude = canvasHeight * 0.18
      const waveFrequency = 2.5
      const waveCentreY   = canvasHeight * 0.50
      const waveSpeed     = 0.0018
      const phaseOffset   = elapsed * waveSpeed

      function waveYAt(xPixel) {
        const fraction = xPixel / canvasWidth
        const angle    = fraction * waveFrequency * Math.PI * 2 - phaseOffset
        return waveCentreY + Math.sin(angle) * waveAmplitude
      }

      // Wave
      ctx.beginPath()
      for (let xPixel = 0; xPixel <= canvasWidth; xPixel++) {
        const yPixel = waveYAt(xPixel)
        if (xPixel === 0) ctx.moveTo(xPixel, yPixel)
        else              ctx.lineTo(xPixel, yPixel)
      }
      ctx.shadowColor = dark ? '#818cf8' : '#6366f1'
      ctx.shadowBlur  = 12
      ctx.strokeStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.lineWidth   = 3; ctx.stroke(); ctx.shadowBlur = 0

      // Particles
      const PARTICLE_COUNT = 5
      const particleRadius = Math.min(canvasWidth * 0.018, 9)
      const particleColour = dark ? '#f472b6' : '#ec4899'

      for (let particleIndex = 0; particleIndex < PARTICLE_COUNT; particleIndex++) {
        const xFraction = (particleIndex + 1) / (PARTICLE_COUNT + 1)
        const xPixel    = xFraction * canvasWidth
        const yPixel    = waveYAt(xPixel)

        ctx.shadowColor = particleColour
        ctx.shadowBlur  = 18
        ctx.beginPath()
        ctx.arc(xPixel, yPixel, particleRadius, 0, Math.PI * 2)
        ctx.fillStyle = particleColour; ctx.fill()
        ctx.shadowBlur = 0
      }

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CONCEPTS — Canvas Fundamentals (snippet-based)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'canvas-fundamentals',
    title: 'Canvas Fundamentals',
    description: 'API concepts one at a time — context, responsive sizing, dark mode, animation loop, proportional geometry. Each step is a self-contained technique.',
    steps: [
      {
        id: 'drawing-on-a-surface',
        title: 'Drawing on a surface',
        content: [
          { type: 'build', text: 'By the end of this step you will see a dark background with the words "Hello, canvas" sitting exactly in the centre of the panel.' },
          { type: 'h3', text: 'What a canvas is' },
          { type: 'p', text: 'A `<canvas>` element is a rectangular pixel grid built into every modern browser. Unlike HTML — which describes structure — or SVG — which describes shapes as geometry — canvas is a **raster surface**: you issue drawing commands in JavaScript and they paint pixels immediately. Nothing redraws itself; you are always in control.' },
          { type: 'p', text: 'The pixel grid has its origin at the **top-left corner**. The x axis increases rightward; the y axis increases downward. A point at (0, 0) is the top-left pixel. A point at (width, height) is the bottom-right.' },
          { type: 'h3', text: 'Getting the drawing context' },
          { type: 'code', text: `const ctx = canvas.getContext('2d')` },
          { type: 'walk', text: '`canvas.getContext(\'2d\')` asks the browser to attach a **Canvas 2D rendering context** to this element and return it. The returned object `ctx` is your drawing tool — every command you will ever issue in this course goes through it. Think of `ctx` as the pen; `canvas` is just the sheet of paper.' },
          { type: 'h3', text: 'Painting a background' },
          { type: 'code', text: `ctx.fillStyle = '#0f172a'\nctx.fillRect(0, 0, canvas.width, canvas.height)` },
          { type: 'walk', text: '`ctx.fillStyle` sets the active fill colour. Any CSS colour works: named colours, hex values, or rgba. `ctx.fillRect(x, y, width, height)` draws a solid rectangle. We pass (0, 0, canvas.width, canvas.height) to paint every pixel of the canvas.' },
          { type: 'h3', text: 'Drawing centred text' },
          { type: 'code', text: `ctx.fillStyle = '#e2e8f0'\nctx.font = 'bold 24px system-ui'\nctx.textAlign = 'center'\nctx.textBaseline = 'middle'\nctx.fillText('Hello, canvas', canvas.width / 2, canvas.height / 2)` },
          { type: 'walk', text: '`ctx.textAlign = \'center\'` means the x coordinate is the **horizontal centre** of the text. `ctx.textBaseline = \'middle\'` means the y coordinate is the **vertical midpoint**. With both set, passing `(canvas.width / 2, canvas.height / 2)` puts the text exactly in the centre.' },
          { type: 'cs', text: '**Imperative drawing model.** Canvas uses an imperative API: you issue commands in order and they execute immediately. This is the opposite of React\'s declarative model. The imperative model gives you pixel-level control but requires you to manually repaint whenever anything changes.' },
          { type: 'se', text: '**Context as single responsibility.** The `<canvas>` element is just the pixel surface. All drawing goes through `ctx`. React owns the element; you own the rendering. Each object has one job.' },
          { type: 'breaks', text: '**Forgotten background → transparent canvas.** If you skip `ctx.fillRect` for the background, the canvas is transparent. The moment you add animation and start clearing between frames with `ctx.clearRect`, the cleared area becomes transparent and page content bleeds through.' },
          { type: 'note', text: 'Type the code into the editor, then press **⌘S**. You should see "Hello, canvas" centred on a dark background.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // ── your drawing code goes here ──

  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Hello, canvas', canvas.width / 2, canvas.height / 2)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
      {
        id: 'responsive-sizing',
        title: 'Responsive sizing',
        content: [
          { type: 'build', text: 'Your text currently uses a hardcoded position — resize the panel and it drifts off-centre. This step fixes that with a ResizeObserver and the devicePixelRatio pattern, so the scene stays centred and sharp at any size.' },
          { type: 'h3', text: 'The problem with canvas.width' },
          { type: 'p', text: '`canvas.width` is the canvas\'s **pixel buffer size** — fixed when it loaded. If you resize the panel, CSS stretches the element but the buffer stays the same. Fix: every time the container changes size, recalculate the buffer and update local `w` and `h` variables.' },
          { type: 'h3', text: 'devicePixelRatio — why we multiply the buffer' },
          { type: 'code', text: `const dpr = window.devicePixelRatio || 1\ncanvas.width  = w * dpr\ncanvas.height = h * dpr\nctx.scale(dpr, dpr)` },
          { type: 'walk', text: '`devicePixelRatio` is 2 on Retina screens. Without accounting for it, the canvas pixel buffer is too small and text looks blurry. Multiplying the buffer by `dpr` and then calling `ctx.scale(dpr, dpr)` means you write coordinates in CSS pixels and the browser handles the rest.' },
          { type: 'h3', text: 'ResizeObserver' },
          { type: 'code', text: `function resize() {\n  const dpr = window.devicePixelRatio || 1\n  const rect = canvas.parentElement.getBoundingClientRect()\n  w = rect.width; h = rect.height\n  canvas.width = w * dpr; canvas.height = h * dpr\n  ctx.scale(dpr, dpr)\n}\nconst ro = new ResizeObserver(resize)\nro.observe(canvas.parentElement)\nresize()\nreturn () => ro.disconnect()` },
          { type: 'walk', text: '`ResizeObserver` fires `resize()` whenever the container changes size. We call `resize()` immediately so `w` and `h` are set before the first draw. The cleanup function disconnects the observer when the component unmounts.' },
          { type: 'cs', text: '**Observer pattern.** You never poll "has the size changed?" — the browser tells you when it does. More efficient and less error-prone than checking on every frame.' },
          { type: 'se', text: '**Separate resize from draw.** Resize fires rarely (user drags). Drawing fires 60× per second. Mixing them gives one function two jobs.' },
          { type: 'breaks', text: '**Skipping `ctx.scale(dpr, dpr)` → blurry text on Retina.** Everything appears at half the intended size — text lands in the top-left quarter of the canvas instead of the centre.' },
          { type: 'note', text: 'Press **⌘S**. Try resizing the preview — the text should stay centred.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h

    // TODO: add resize() function — sets w, h, canvas.width/height, ctx.scale
    // TODO: create ResizeObserver, call resize() immediately
    // TODO: return cleanup disconnecting the observer

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Hello, canvas', w / 2, h / 2)
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = \`bold \${Math.round(h * 0.06)}px system-ui\`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Hello, canvas', w / 2, h / 2)

    return () => ro.disconnect()
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
      {
        id: 'dark-mode-animation',
        title: 'Dark mode + animation loop',
        content: [
          { type: 'build', text: 'Colours that respond to the user\'s dark/light mode preference, and an animation loop that redraws 60× per second. By the end, your text will gently pulse in and out.' },
          { type: 'h3', text: 'Reading the theme' },
          { type: 'code', text: `const dark = document.documentElement.classList.contains('dark')\nctx.fillStyle = dark ? '#0f172a' : '#f8fafc'` },
          { type: 'walk', text: 'This app toggles a `\'dark\'` class on `<html>`. Check it on every draw call — not just once — so the scene updates the moment the user toggles the theme.' },
          { type: 'h3', text: 'requestAnimationFrame' },
          { type: 'code', text: `let rafId, startTime\nfunction draw(timestamp) {\n  if (!startTime) startTime = timestamp\n  const elapsed = timestamp - startTime\n  // draw here\n  rafId = requestAnimationFrame(draw)\n}\nrafId = requestAnimationFrame(draw)\nreturn () => cancelAnimationFrame(rafId)` },
          { type: 'walk', text: '`requestAnimationFrame` calls `draw` just before the next screen repaint — typically 60fps. `elapsed` counts from zero on each mount. The loop is self-scheduling. The cleanup cancels it when the component unmounts.' },
          { type: 'h3', text: 'Pulsing opacity' },
          { type: 'code', text: `const phase   = Math.sin(elapsed / 600)  // -1 to 1\nconst opacity = 0.6 + 0.4 * phase       // 0.2 to 1.0\nctx.globalAlpha = opacity\nctx.fillText(...)\nctx.globalAlpha = 1  // always reset` },
          { type: 'walk', text: '`Math.sin(elapsed / 600)` oscillates smoothly. `0.6 + 0.4 * phase` maps the [-1, 1] range to [0.2, 1.0]. Always reset `globalAlpha` to 1 after partial-opacity draws — it persists across all subsequent calls.' },
          { type: 'cs', text: '**Time-based animation.** `requestAnimationFrame` does not guarantee 60fps — it matches the display (60, 90, 120, 144Hz). Frame-count animation runs faster on higher-Hz displays. Time-based animation (using `elapsed`) runs at the same speed regardless.' },
          { type: 'se', text: '**Pure function of time.** Every `draw` call rebuilds the frame from scratch — clear, recalculate, repaint. A bug produces a wrong frame that immediately corrects on the next draw. Mutating state across frames means bugs accumulate.' },
          { type: 'breaks', text: '**Forgetting `cancelAnimationFrame` → ghost loops.** In React StrictMode, components mount/unmount/remount. Without cleanup, two loops run simultaneously — both drawing to the same canvas — producing flicker.' },
          { type: 'note', text: 'Press **⌘S**. Toggle dark mode and watch the colours change live.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()

    // TODO: add requestAnimationFrame loop
    // TODO: read dark mode each frame
    // TODO: pulse opacity with Math.sin(elapsed / 600)
    // TODO: return cleanup cancelling both loop and observer

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = \`bold \${Math.round(h * 0.06)}px system-ui\`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('Hello, canvas', w / 2, h / 2)
    return () => ro.disconnect()
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const dark = document.documentElement.classList.contains('dark')

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const phase   = Math.sin(elapsed / 600)
      const opacity = 0.6 + 0.4 * phase
      ctx.globalAlpha = opacity
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.font = \`bold \${Math.round(h * 0.06)}px system-ui\`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('Hello, canvas', w / 2, h / 2)
      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()
    rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
      {
        id: 'proportional-geometry',
        title: 'Proportional geometry',
        content: [
          { type: 'build', text: 'A coloured circle that stays correctly sized and centred at any canvas dimension. This introduces the rule that eliminates every layout bug in canvas scenes.' },
          { type: 'h3', text: 'The fixed-pixel trap' },
          { type: 'p', text: 'Writing `ctx.arc(400, 200, 60, 0, Math.PI * 2)` works exactly once — when the canvas is 800×400. At any other size, the circle is wrong. Most canvas overlap bugs come from fixed pixels chosen during development.' },
          { type: 'h3', text: 'The proportional rule' },
          { type: 'code', text: `const circleRadius = Math.min(w * 0.12, 60)  // proportional, capped\nconst circleX = w / 2\nconst circleY = h * 0.4` },
          { type: 'walk', text: '`Math.min(w * 0.12, 60)` means "12% of canvas width, but no larger than 60px." Positions use the same rule: `h * 0.4` places the circle 40% down. This pattern — proportional with a cap — appears in every scene in this codebase.' },
          { type: 'h3', text: 'Drawing a circle' },
          { type: 'code', text: `ctx.beginPath()\nctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2)\nctx.fillStyle = dark ? '#6366f1' : '#4f46e5'\nctx.fill()` },
          { type: 'walk', text: '`ctx.beginPath()` starts a fresh path. Without it, the arc appends to whatever was drawn before. `ctx.arc(x, y, radius, 0, Math.PI * 2)` traces a full circle. `ctx.fill()` paints the interior.' },
          { type: 'h3', text: 'Proportional label spacing' },
          { type: 'code', text: `const labelY = circleY + circleRadius + h * 0.06\nctx.fillText('proportional', w / 2, labelY)` },
          { type: 'walk', text: 'Start from the circle centre, add the radius to reach the bottom edge, add a proportional gap. A fixed gap like `+ 20` is too small on large canvases and too large on small ones.' },
          { type: 'cs', text: '**Coordinate space thinking.** Proportional sizing keeps elements in the same ratio relative to the container at any scale — the same principle as CSS percentages.' },
          { type: 'se', text: '**`Math.min(proportion, cap)` as a design contract.** One line encodes two decisions: the proportional intent and the upper bound. A bare `60` hides the proportionality entirely.' },
          { type: 'breaks', text: '**Fixed vertical gap → text overlap at small heights.** `labelY = circleY + circleRadius + 20` collapses to zero gap when the canvas is very small. Always use `h * fraction`.' },
          { type: 'note', text: 'Press **⌘S**. Toggle dark mode — the circle should switch colours.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // TODO: draw a circle using Math.min(w * 0.12, 60) for radius
      // TODO: place a label below using proportional gap

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, rafId, startTime

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw(timestamp) {
      if (!startTime) startTime = timestamp
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const circleRadius = Math.min(w * 0.12, 60)
      const circleX = w / 2
      const circleY = h * 0.4
      ctx.beginPath()
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2)
      ctx.fillStyle = dark ? '#6366f1' : '#4f46e5'
      ctx.fill()

      const labelY = circleY + circleRadius + h * 0.06
      ctx.fillStyle = dark ? '#e2e8f0' : '#1e293b'
      ctx.font = \`bold \${Math.round(h * 0.05)}px system-ui\`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('proportional', w / 2, labelY)

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // CONCEPTS — Boxes and Arrows (snippet-based)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'boxes-and-arrows',
    title: 'Boxes and Arrows',
    description: 'The box-label-arrow pattern used in every logic and function scene. Covers roundRect, the top-third/divider/bottom-third layout, and connecting boxes with arrows.',
    steps: [
      {
        id: 'a-single-box',
        title: 'A single rounded box',
        content: [
          { type: 'build', text: 'A single coloured rounded rectangle, centred on the canvas, with proportional size. This primitive appears in every logic, function, and set theory scene.' },
          { type: 'h3', text: 'Paths and shapes' },
          { type: 'code', text: `ctx.beginPath()\nctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)\nctx.fillStyle = dark ? '#1e1b4b' : '#ede9fe'\nctx.fill()\nctx.strokeStyle = dark ? '#818cf8' : '#4f46e5'\nctx.lineWidth = 2.5\nctx.stroke()` },
          { type: 'walk', text: '`ctx.roundRect(x, y, width, height, radii)` draws a rectangle with rounded corners. `x` and `y` are the **top-left corner**. Fill before stroke — the fill covers the inner half of the stroke width, so you see the full lineWidth as an outline.' },
          { type: 'h3', text: 'Centring a rectangle' },
          { type: 'code', text: `const boxWidth  = Math.min(w * 0.35, 160)\nconst boxHeight = Math.min(h * 0.35, 120)\nconst boxLeft   = w / 2 - boxWidth  / 2\nconst boxTop    = h / 2 - boxHeight / 2` },
          { type: 'walk', text: 'Canvas coordinates describe the top-left corner. To centre at (cx, cy), subtract half the width to get the left edge and half the height to get the top edge. This formula works at any size.' },
          { type: 'cs', text: '**Path as description, fill/stroke as execution.** `beginPath()` + shape commands build a description. `fill()` and `stroke()` execute it. You can define a complex path once and decide how to render it separately.' },
          { type: 'se', text: '**Named geometry variables.** `const boxLeft = cx - boxWidth / 2` reads as a layout decision. Inlining the arithmetic inside `roundRect` reads as magic numbers.' },
          { type: 'breaks', text: '**Not calling `beginPath()` → shapes join.** Draw a circle, then a rectangle without `beginPath()`, call `fill()` — both fill as a single compound region. No error message.' },
          { type: 'note', text: 'Press ⌘S. Watch the box in the Properties tab — try changing `boxWidth`.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, rafId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      // TODO: declare boxWidth and boxHeight using Math.min(proportion, cap)
      // TODO: compute boxLeft and boxTop to centre at (w/2, h/2)
      // TODO: draw with ctx.roundRect — fill first, then stroke

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, rafId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
      ctx.fillRect(0, 0, w, h)

      const boxWidth  = Math.min(w * 0.35, 160)
      const boxHeight = Math.min(h * 0.35, 120)
      const boxLeft   = w / 2 - boxWidth  / 2
      const boxTop    = h / 2 - boxHeight / 2

      ctx.beginPath()
      ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = dark ? '#1e1b4b' : '#ede9fe'; ctx.fill()
      ctx.strokeStyle = dark ? '#818cf8' : '#4f46e5'
      ctx.lineWidth = 2.5; ctx.stroke()

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
      {
        id: 'label-and-value',
        title: 'The label + value layout',
        content: [
          { type: 'build', text: 'A box divided into two zones: a letter label in the top third and a value (TRUE/FALSE) in the bottom third, separated by a divider. Getting this right fixes every overlapping-text bug at once.' },
          { type: 'h3', text: 'Why text overlaps in boxes' },
          { type: 'p', text: 'Positions like `y - 8` and `y + 10` were chosen when the box was one size. At another size the offsets still move by exactly 8 and 10px — but the box is different, so text collides. Fix: derive all positions from `boxHeight`, not fixed pixels.' },
          { type: 'h3', text: 'Dividing the box into thirds' },
          { type: 'code', text: `const cy       = boxTop + boxHeight / 2\nconst labelY   = cy - boxHeight * 0.18   // top third\nconst dividerY = cy + boxHeight * 0.05   // just below centre\nconst valueY   = cy + boxHeight * 0.30   // bottom third` },
          { type: 'walk', text: 'All three positions are `boxHeight`-relative. If `boxHeight` doubles, all move proportionally. Text never overlaps at any size.' },
          { type: 'h3', text: 'Font sizes from box dimensions' },
          { type: 'code', text: `ctx.font = \`bold \${Math.round(boxHeight * 0.30)}px system-ui\`\nctx.fillText('P', cx, labelY)\n\nctx.beginPath()\nctx.moveTo(boxLeft + 10, dividerY)\nctx.lineTo(boxLeft + boxWidth - 10, dividerY)\nctx.strokeStyle = accentColour + '66'   // 40% opacity\nctx.lineWidth = 1; ctx.stroke()\n\nctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`\nctx.fillText('TRUE', cx, valueY)` },
          { type: 'walk', text: '`boxHeight * 0.30` as a font size means "30% of the box height." The divider leaves a 10px margin each side and uses `\'66\'` (40% alpha) for a subtle separator. The value uses monospace — a convention in logic scenes where the value is machine-like.' },
          { type: 'cs', text: '**Local coordinate systems.** `cy - boxHeight * 0.18` creates a coordinate system inside the box. This is the same principle as CSS `em` units — relative to a local reference, not the page.' },
          { type: 'se', text: '**The pattern is the specification.** The fractions `0.18`, `0.05`, `0.30` encode the layout decision. Any developer changing the box size sees the positions track it automatically.' },
          { type: 'breaks', text: '**Fixed offsets guarantee overlap.** `labelY = cy - 8` and `valueY = cy + 10` at `boxHeight = 30` gives a 2px gap. At that size both text pieces are nearly the same font size and overlap completely.' },
          { type: 'note', text: 'Press ⌘S. Toggle the ⊞ Grid to verify the text positions relative to box dimensions.' },
        ],
        starterCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, rafId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'; ctx.fillRect(0, 0, w, h)

      const boxWidth  = Math.min(w * 0.35, 160)
      const boxHeight = Math.min(h * 0.35, 120)
      const boxLeft   = w / 2 - boxWidth  / 2
      const boxTop    = h / 2 - boxHeight / 2
      const cx        = w / 2
      const accentColour = dark ? '#818cf8' : '#4f46e5'

      ctx.beginPath(); ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = dark ? '#1e1b4b' : '#ede9fe'; ctx.fill()
      ctx.strokeStyle = accentColour; ctx.lineWidth = 2.5; ctx.stroke()

      // TODO: draw 'P' at (cy - boxHeight * 0.18), font = boxHeight * 0.30
      // TODO: draw divider at (cy + boxHeight * 0.05)
      // TODO: draw 'TRUE' at (cy + boxHeight * 0.30), font = boxHeight * 0.22

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
        completeCode: `import { useEffect, useRef } from 'react'

export default function MyScene() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h, rafId

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      const dark = document.documentElement.classList.contains('dark')
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'; ctx.fillRect(0, 0, w, h)

      const boxWidth  = Math.min(w * 0.35, 160)
      const boxHeight = Math.min(h * 0.35, 120)
      const boxLeft   = w / 2 - boxWidth  / 2
      const boxTop    = h / 2 - boxHeight / 2
      const cx        = w / 2
      const cy        = boxTop + boxHeight / 2
      const accentColour = dark ? '#818cf8' : '#4f46e5'

      ctx.beginPath(); ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, 10)
      ctx.fillStyle = dark ? '#1e1b4b' : '#ede9fe'; ctx.fill()
      ctx.strokeStyle = accentColour; ctx.lineWidth = 2.5; ctx.stroke()

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = accentColour

      ctx.font = \`bold \${Math.round(boxHeight * 0.30)}px system-ui\`
      ctx.fillText('P', cx, cy - boxHeight * 0.18)

      ctx.beginPath()
      ctx.moveTo(boxLeft + 10, cy + boxHeight * 0.05)
      ctx.lineTo(boxLeft + boxWidth - 10, cy + boxHeight * 0.05)
      ctx.strokeStyle = accentColour + '66'; ctx.lineWidth = 1; ctx.stroke()

      ctx.font = \`bold \${Math.round(boxHeight * 0.22)}px "JetBrains Mono", monospace\`
      ctx.fillText('TRUE', cx, cy + boxHeight * 0.30)

      rafId = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize(); rafId = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}
`,
      },
    ],
  },
]
