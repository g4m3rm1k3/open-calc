# Lesson 11 — The Coordinate Plane

## What You Will Build

An HTML canvas with X and Y axes, a labelled grid, and an origin. The canvas
sits beside the calculator. Nothing is plotted yet — this lesson builds the
surface that graphing will paint on.

## What You Need to Know First

Lessons 01–10. Functions exist. This lesson builds the canvas they will be drawn on.
The coordinate plane is introduced now because functions exist — not before.

---

## The Lesson

### The problem

Graphing a function requires a surface, a coordinate system, and a mapping from
mathematical coordinates (x, y) to canvas pixels. All three need to exist before
a single curve is drawn.

---

### Step 1 — Maths — the coordinate plane

**Maths — Cartesian coordinates:**
René Descartes' coordinate system assigns a unique pair of numbers (x, y) to
every point on a plane. The x-axis is horizontal — positive right, negative left.
The y-axis is vertical — positive up, negative down.

The origin (0, 0) is where the axes cross. Any point in the plane is described as
a distance right/left from the origin (x) and a distance up/down (y).

The key tension with a computer screen: the canvas coordinate system has y=0 at the
top and y increases downward. Mathematical convention has y=0 at the bottom and y
increases upward. When we draw maths coordinates on a canvas, we must convert.

A point at maths coordinate (2, 3) — 2 right, 3 up from the origin — maps to canvas
coordinates where y is flipped. This transformation is one of the first things the
rendering code handles.

---

### Step 2 — The viewport

Create `src/viewport.ts`:

```typescript
export interface Viewport {
  xMin:          number
  xMax:          number
  yMin:          number
  yMax:          number
  canvasWidth:   number
  canvasHeight:  number
}

export interface CanvasPoint {
  canvasX: number
  canvasY: number
}

export function createDefaultViewport(canvasWidth: number, canvasHeight: number): Viewport {
  return {
    xMin: -10,
    xMax:  10,
    yMin: -10,
    yMax:  10,
    canvasWidth,
    canvasHeight,
  }
}

export function mathToCanvas(
  mathX:    number,
  mathY:    number,
  viewport: Viewport,
): CanvasPoint {
  const xRange = viewport.xMax - viewport.xMin
  const yRange = viewport.yMax - viewport.yMin

  const canvasX = ((mathX - viewport.xMin) / xRange) * viewport.canvasWidth
  // Y is flipped: maths y increases upward, canvas y increases downward
  const canvasY = ((viewport.yMax - mathY) / yRange) * viewport.canvasHeight

  return { canvasX, canvasY }
}

export function canvasToMath(
  canvasX:  number,
  canvasY:  number,
  viewport: Viewport,
): { mathX: number; mathY: number } {
  const xRange = viewport.xMax - viewport.xMin
  const yRange = viewport.yMax - viewport.yMin

  const mathX = viewport.xMin + (canvasX / viewport.canvasWidth)  * xRange
  const mathY = viewport.yMax - (canvasY / viewport.canvasHeight) * yRange

  return { mathX, mathY }
}
```

**CS lens — coordinate space mapping:**
`mathToCanvas` and `canvasToMath` are inverse transformations. Every rendering
system has this concept: world space (mathematical coordinates) and screen space
(pixel coordinates). The mapping is a linear interpolation between the min/max
of each range. This same pattern appears in every game engine, every CAD system,
and every charting library.

The Y-flip is not an accident or a quirk — it is a deliberate, documented decision.
Maths convention and screen convention disagree on the direction of Y. The code
states the reason explicitly: "Y is flipped: maths y increases upward, canvas y
increases downward." This is the kind of comment the Lesson Contract requires —
not what the code does, but why the decision was made.

**SE lens — the viewport transform is a pure module:**
`mathToCanvas` takes a point and a viewport, returns a canvas point. It has no
state, no side effects. It is testable: call it with known inputs, verify the
outputs. When zoom and pan are added in lesson 17, the viewport object changes —
but this function does not. The function is correct for any viewport.

---

### Step 3 — Tests

```typescript
describe('viewport', () => {
  const viewport = createDefaultViewport(600, 400)

  test('origin maps to canvas centre', () => {
    const { canvasX, canvasY } = mathToCanvas(0, 0, viewport)
    expect(canvasX).toBe(300) // half of 600
    expect(canvasY).toBe(200) // half of 400
  })

  test('xMax maps to right edge', () => {
    const { canvasX } = mathToCanvas(10, 0, viewport)
    expect(canvasX).toBe(600)
  })

  test('yMax maps to top edge (canvas y=0)', () => {
    const { canvasY } = mathToCanvas(0, 10, viewport)
    expect(canvasY).toBe(0)
  })

  test('mathToCanvas and canvasToMath are inverses', () => {
    const mathPoint   = { mathX: 3.5, mathY: -2.7 }
    const canvasPoint = mathToCanvas(mathPoint.mathX, mathPoint.mathY, viewport)
    const backToMath  = canvasToMath(canvasPoint.canvasX, canvasPoint.canvasY, viewport)
    expect(Math.abs(backToMath.mathX - mathPoint.mathX)).toBeLessThan(1e-10)
    expect(Math.abs(backToMath.mathY - mathPoint.mathY)).toBeLessThan(1e-10)
  })
})
```

---

### Step 4 — Add the canvas to the layout

Add to `index.html`:

```html
<div class="calculator-layout">
  <div class="calculator">
    <!-- existing calculator content -->
  </div>
  <canvas class="graph-canvas" id="graph-canvas" width="500" height="500"></canvas>
</div>
```

Add to `style.css`:

```css
:root {
  --color-axis:       #475569;
  --color-grid:       #1e293b;
  --color-grid-label: #64748b;
  --width-graph:      500px;
}

.calculator-layout {
  display: flex;
  gap:     var(--spacing-lg);
  align-items: flex-start;
}

.graph-canvas {
  width:            var(--width-graph);
  height:           var(--width-graph);
  background-color: var(--color-display-bg);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius-calculator);
}
```

---

### Step 5 — Draw the coordinate plane

Create `src/graph-renderer.ts`:

```typescript
import { Viewport, mathToCanvas } from './viewport.js'

export function drawCoordinatePlane(
  context:  CanvasRenderingContext2D,
  viewport: Viewport,
): void {
  const { canvasWidth, canvasHeight } = viewport

  context.clearRect(0, 0, canvasWidth, canvasHeight)

  drawGrid(context, viewport)
  drawAxes(context, viewport)
  drawAxisLabels(context, viewport)
}

function drawGrid(
  context:  CanvasRenderingContext2D,
  viewport: Viewport,
): void {
  context.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-grid').trim()
  context.lineWidth = 0.5

  const stepSize = computeGridStep(viewport.xMax - viewport.xMin)

  // Vertical grid lines
  for (
    let mathX = Math.ceil(viewport.xMin / stepSize) * stepSize;
    mathX <= viewport.xMax;
    mathX += stepSize
  ) {
    const { canvasX } = mathToCanvas(mathX, 0, viewport)
    context.beginPath()
    context.moveTo(canvasX, 0)
    context.lineTo(canvasX, viewport.canvasHeight)
    context.stroke()
  }

  // Horizontal grid lines
  for (
    let mathY = Math.ceil(viewport.yMin / stepSize) * stepSize;
    mathY <= viewport.yMax;
    mathY += stepSize
  ) {
    const { canvasY } = mathToCanvas(0, mathY, viewport)
    context.beginPath()
    context.moveTo(0, canvasY)
    context.lineTo(viewport.canvasWidth, canvasY)
    context.stroke()
  }
}

function drawAxes(
  context:  CanvasRenderingContext2D,
  viewport: Viewport,
): void {
  context.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-axis').trim()
  context.lineWidth = 1.5

  const origin = mathToCanvas(0, 0, viewport)

  // X axis
  context.beginPath()
  context.moveTo(0, origin.canvasY)
  context.lineTo(viewport.canvasWidth, origin.canvasY)
  context.stroke()

  // Y axis
  context.beginPath()
  context.moveTo(origin.canvasX, 0)
  context.lineTo(origin.canvasX, viewport.canvasHeight)
  context.stroke()
}

function drawAxisLabels(
  context:  CanvasRenderingContext2D,
  viewport: Viewport,
): void {
  context.fillStyle  = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-grid-label').trim()
  context.font       = '11px monospace'
  context.textAlign  = 'center'

  const stepSize = computeGridStep(viewport.xMax - viewport.xMin)
  const origin   = mathToCanvas(0, 0, viewport)

  for (
    let mathX = Math.ceil(viewport.xMin / stepSize) * stepSize;
    mathX <= viewport.xMax;
    mathX += stepSize
  ) {
    if (Math.abs(mathX) < stepSize * 0.01) continue // skip 0, it clutters the origin
    const { canvasX } = mathToCanvas(mathX, 0, viewport)
    context.fillText(String(mathX), canvasX, origin.canvasY + 14)
  }

  context.textAlign = 'right'
  for (
    let mathY = Math.ceil(viewport.yMin / stepSize) * stepSize;
    mathY <= viewport.yMax;
    mathY += stepSize
  ) {
    if (Math.abs(mathY) < stepSize * 0.01) continue
    const { canvasY } = mathToCanvas(0, mathY, viewport)
    context.fillText(String(mathY), origin.canvasX - 6, canvasY + 4)
  }
}

function computeGridStep(range: number): number {
  // Pick a round step size based on the visible range
  const rawStep  = range / 10
  const exponent = Math.floor(Math.log10(rawStep))
  const mantissa = rawStep / Math.pow(10, exponent)

  if (mantissa < 1.5) return Math.pow(10, exponent)
  if (mantissa < 3.5) return 2 * Math.pow(10, exponent)
  if (mantissa < 7.5) return 5 * Math.pow(10, exponent)
  return 10 * Math.pow(10, exponent)
}
```

Wire in `src/main.ts`:

```typescript
import { createDefaultViewport } from './viewport.js'
import { drawCoordinatePlane }   from './graph-renderer.js'

const graphCanvas  = document.querySelector<HTMLCanvasElement>('#graph-canvas')!
const graphContext = graphCanvas.getContext('2d')!
let viewport       = createDefaultViewport(graphCanvas.width, graphCanvas.height)

function redrawGraph(): void {
  drawCoordinatePlane(graphContext, viewport)
}

redrawGraph()
```

Open the browser. A coordinate plane appears with axes, grid, and labels.

---

## Connect the Pieces

`drawCoordinatePlane` is called at the start of every redraw. Lesson 12 will
add `drawFunction` on top of it. Lesson 16 will add `drawShadedArea`. Lesson 18
will add `drawRootMarker`. Each lesson adds to the canvas without modifying what
came before. The coordinate plane is always drawn first — it is the background
every other layer paints on.

---

## What Breaks Without This

Without the viewport transform, every draw call uses raw pixel coordinates.
Drawing at pixel (250, 200) means nothing to someone who thinks in terms of
`x=2, y=3`. Lesson 17 (zoom and pan) becomes impossible — you would have to
recalculate every draw call manually. The viewport abstraction is the layer
that makes all subsequent rendering code readable.

---

## Definition of Done

- [ ] A canvas is visible beside the calculator
- [ ] X and Y axes are drawn
- [ ] Grid lines are visible at regular intervals
- [ ] Axis labels show coordinate values
- [ ] The origin (0,0) is at the centre of the canvas
- [ ] `mathToCanvas` and `canvasToMath` are inverses (verified by test)
- [ ] All canvas colours come from CSS custom properties
