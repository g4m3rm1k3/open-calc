# Calculator — Lesson 11 — The Coordinate Plane

## What You Will Build

An HTML canvas appears beside the calculator with X and Y axes, a labelled grid,
and an origin. The canvas shows a coordinate plane from -10 to 10 on both axes.
Nothing is plotted yet — this lesson builds the surface that graphing will paint on.

## What You Need to Know First

Lessons 01–10. User functions exist. This lesson adds the canvas they will be drawn
on. The coordinate plane is introduced now — not before — because it is the visual
representation of functions that now exist.

---

## The Problem

Graphing a function requires three things: a drawing surface, a coordinate system
that maps mathematical points to pixel positions, and the ability to draw lines and
shapes on it. All three must exist before a single curve can be plotted.

The HTML canvas element provides the drawing surface and drawing API. The viewport
transform provides the coordinate mapping. This lesson builds both.

---

## Step 1 — Maths: The Coordinate Plane

### Cartesian coordinates

René Descartes' coordinate system assigns a unique pair of numbers (x, y) to every
point on a flat plane. The x-axis is horizontal — positive to the right, negative
to the left. The y-axis is vertical — positive upward, negative downward. The origin
(0, 0) is where the axes intersect.

Any point is described as: "x units right of the origin, y units above the origin."
The point (3, -2) is three units right and two units below the origin.

### The y-axis conflict

The canvas coordinate system has y=0 at the **top** and y increases **downward**.
Mathematical convention has y=0 at the **bottom** and y increases **upward**. These
are opposite. Every rendering system that draws mathematics on a screen must account
for this.

```
Canvas:    y=0 at top, increases down    (screen convention)
Maths:     y=0 at bottom, increases up  (mathematical convention)
```

Converting a mathematical point (mathX, mathY) to a canvas pixel requires flipping
the y axis. This is not an accident or a quirk — it is a deliberate, documented
decision that every graphics system makes. The code states the reason explicitly.

---

## Step 2 — The Viewport Transform

### The problem

"Draw the origin" means nothing to the canvas — the canvas has no concept of
coordinates. The viewport transform is the function that converts mathematical
coordinates to canvas pixel positions, and back.

### The code

Create `src/viewport.ts`:

```typescript
export interface Viewport {
  xMin:         number
  xMax:         number
  yMin:         number
  yMax:         number
  canvasWidth:  number
  canvasHeight: number
}

export interface CanvasPoint {
  canvasX: number
  canvasY: number
}

export function createDefaultViewport(
  canvasWidth:  number,
  canvasHeight: number,
): Viewport {
  return {
    xMin: -10, xMax: 10,
    yMin: -10, yMax: 10,
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

  const mathX = viewport.xMin + (canvasX  / viewport.canvasWidth)  * xRange
  const mathY = viewport.yMax - (canvasY  / viewport.canvasHeight) * yRange

  return { mathX, mathY }
}
```

**What `src/viewport.ts` is:**
`viewport.ts` owns the coordinate mapping. It has no DOM access, no canvas calls,
no side effects. It takes numbers in, returns numbers out. The rendering code calls
it; the rendering code does not compute coordinates itself.

### Walkthrough — `mathToCanvas(0, 0, viewport)` with the default viewport

Default viewport: `xMin=-10, xMax=10, yMin=-10, yMax=10`, canvas `500×500`.

`xRange = 20`. `yRange = 20`.

`canvasX = ((0 - (-10)) / 20) * 500 = (10/20) * 500 = 0.5 * 500 = 250`
`canvasY = ((10 - 0) / 20) * 500 = (10/20) * 500 = 0.5 * 500 = 250`

The origin (0, 0) maps to canvas pixel (250, 250) — the exact centre of a 500×500
canvas. ✓

`mathToCanvas(10, 10, viewport)`:
`canvasX = ((10 - (-10)) / 20) * 500 = (20/20) * 500 = 500` — right edge.
`canvasY = ((10 - 10) / 20) * 500 = 0` — top edge. ✓

`mathToCanvas(-10, -10, viewport)`:
`canvasX = ((-10 - (-10)) / 20) * 500 = 0` — left edge.
`canvasY = ((10 - (-10)) / 20) * 500 = 500` — bottom edge. ✓

The y-flip is visible: maths point (-10, -10) — bottom-left — maps to canvas pixel
(0, 500) — also bottom-left. The x axis is consistent; the y axis is inverted.

**CS lens — linear interpolation:**
`mathToCanvas` is a **linear interpolation** — mapping a value from one range to
another. The formula `((value - min) / range) * outputRange` rescales a value from
`[min, max]` to `[0, outputRange]`. This pattern appears in every rendering system,
every charting library, and every game engine. In games, it maps "world coordinates"
to "screen coordinates." In charts, it maps "data values" to "pixel positions." The
name changes; the formula is universal.

**SE lens — pure coordinate transform:**
`mathToCanvas` takes a point and a viewport, returns a canvas point. No state, no
side effects, no DOM access. When lesson 17 (zoom and pan) changes the viewport,
this function is not modified — only the viewport object changes, and `mathToCanvas`
automatically maps correctly. The function is correct for any viewport.

`mathToCanvas` and `canvasToMath` are inverse functions: applying one then the other
returns the original point. This invertibility is tested directly.

---

## Step 3 — Tests

Create `src/viewport.test.ts`:

```typescript
import { describe, test, expect }  from 'vitest'
import { createDefaultViewport,
         mathToCanvas,
         canvasToMath }            from './viewport.js'

describe('viewport', () => {
  const viewport = createDefaultViewport(500, 500)

  test('origin maps to canvas centre', () => {
    const { canvasX, canvasY } = mathToCanvas(0, 0, viewport)
    expect(canvasX).toBe(250)
    expect(canvasY).toBe(250)
  })

  test('xMax maps to right edge', () => {
    const { canvasX } = mathToCanvas(10, 0, viewport)
    expect(canvasX).toBe(500)
  })

  test('yMax maps to top edge (canvas y=0)', () => {
    const { canvasY } = mathToCanvas(0, 10, viewport)
    expect(canvasY).toBe(0)
  })

  test('yMin maps to bottom edge (canvas y=height)', () => {
    const { canvasY } = mathToCanvas(0, -10, viewport)
    expect(canvasY).toBe(500)
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

Run `npm test`. The inverse test verifies that round-tripping a point through both
transforms returns the original. This is the mathematical property of inverse
functions: `canvasToMath(mathToCanvas(p)) = p`.

---

## Step 4 — Add the Canvas to the Layout

Update `index.html` to wrap the calculator in a flex container and add the canvas:

```html
<div class="calculator-layout">
  <div class="calculator">
    <!-- existing calculator content unchanged -->
  </div>
  <canvas
    class="graph-canvas"
    id="graph-canvas"
    width="500"
    height="500">
  </canvas>
</div>
```

**`<canvas>` element — first appearance:**
The HTML `<canvas>` element is a bitmap drawing surface. Unlike other HTML elements,
it has no built-in content — it is blank until JavaScript draws on it. The `width`
and `height` attributes set the **internal resolution** in pixels (how many pixels
the canvas has). CSS can scale the canvas element differently from its internal
resolution, but doing so causes blurry output — use the same size for both.

The canvas element itself is passive — it provides the surface. JavaScript draws on
it by obtaining a **2D rendering context** via `canvas.getContext('2d')`. The context
provides all drawing methods: lines, rectangles, text, paths.

Add to `style.css`:

```css
:root {
  /* Add to existing root tokens */
  --colour-axis:       #475569;
  --colour-grid:       #1e293b;
  --colour-grid-label: #64748b;
  --width-graph:       500px;
}

.calculator-layout {
  display:     flex;
  gap:         var(--space-lg);
  align-items: flex-start;
}

.graph-canvas {
  width:            var(--width-graph);
  height:           var(--width-graph);
  background-color: var(--colour-display-background);
  border:           1px solid var(--colour-border);
  border-radius:    var(--radius-calculator);
}
```

---

## Step 5 — Draw the Coordinate Plane

### The problem

With the canvas in the DOM, it needs an axes-and-grid renderer. This renderer will
run first on every redraw — it is the background layer everything else paints on.

### The code

Create `src/graph-renderer.ts`:

```typescript
import { Viewport, mathToCanvas } from './viewport.js'

export function drawCoordinatePlane(
  context:  CanvasRenderingContext2D,
  viewport: Viewport,
): void {
  context.clearRect(0, 0, viewport.canvasWidth, viewport.canvasHeight)
  drawGrid(context, viewport)
  drawAxes(context, viewport)
  drawAxisLabels(context, viewport)
}

function drawGrid(
  context:  CanvasRenderingContext2D,
  viewport: Viewport,
): void {
  context.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--colour-grid').trim()
  context.lineWidth = 0.5

  const stepSize = computeGridStep(viewport.xMax - viewport.xMin)

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
  const axisColour = getComputedStyle(document.documentElement)
    .getPropertyValue('--colour-axis').trim()
  context.strokeStyle = axisColour
  context.lineWidth   = 1.5

  const origin = mathToCanvas(0, 0, viewport)

  context.beginPath()
  context.moveTo(0, origin.canvasY)
  context.lineTo(viewport.canvasWidth, origin.canvasY)
  context.stroke()

  context.beginPath()
  context.moveTo(origin.canvasX, 0)
  context.lineTo(origin.canvasX, viewport.canvasHeight)
  context.stroke()
}

function drawAxisLabels(
  context:  CanvasRenderingContext2D,
  viewport: Viewport,
): void {
  const labelColour = getComputedStyle(document.documentElement)
    .getPropertyValue('--colour-grid-label').trim()
  context.fillStyle = labelColour
  context.font      = '11px monospace'

  const stepSize = computeGridStep(viewport.xMax - viewport.xMin)
  const origin   = mathToCanvas(0, 0, viewport)

  context.textAlign = 'center'
  for (
    let mathX = Math.ceil(viewport.xMin / stepSize) * stepSize;
    mathX <= viewport.xMax;
    mathX += stepSize
  ) {
    if (Math.abs(mathX) < stepSize * 0.01) continue  // skip label at origin
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
  const rawStep  = range / 10
  const exponent = Math.floor(Math.log10(rawStep))
  const mantissa = rawStep / Math.pow(10, exponent)

  if (mantissa < 1.5) return Math.pow(10, exponent)
  if (mantissa < 3.5) return 2 * Math.pow(10, exponent)
  if (mantissa < 7.5) return 5 * Math.pow(10, exponent)
  return 10 * Math.pow(10, exponent)
}
```

**What `src/graph-renderer.ts` is:**
`graph-renderer.ts` owns all canvas drawing operations. It knows how to draw
coordinate planes, grids, axes, and (in subsequent lessons) function curves. It
calls `mathToCanvas` from `viewport.ts` — it never computes pixel positions itself.

**Canvas API — first appearance:**
All canvas drawing goes through a `CanvasRenderingContext2D` object. The key
drawing methods used here:

`context.clearRect(x, y, width, height)` — fills a rectangle with transparent
pixels, erasing everything in that area. Called at the start of every redraw to
clear the previous frame.

`context.strokeStyle = colour` — sets the colour used by `stroke()` calls. Accepts
CSS colour strings: `'#475569'`, `'rgb(71,85,105)'`, `'hsl(215,14%,34%)'`.

`context.lineWidth = n` — sets the width of drawn lines in pixels.

`context.beginPath()` — starts a new path. All subsequent `moveTo` and `lineTo`
calls build a new path. `beginPath()` is required before each new shape — without
it, the new shape is appended to the previous path, connecting them with a line.

`context.moveTo(x, y)` — moves the pen to position (x, y) without drawing.
`context.lineTo(x, y)` — draws a line from the current pen position to (x, y).
`context.stroke()` — renders the accumulated path using the current `strokeStyle`
and `lineWidth`.

`context.fillText(text, x, y)` — draws a text string at position (x, y).
The y coordinate is the **baseline** of the text, not the top.

`context.font = '11px monospace'` — sets the font for text rendering. Same CSS
font syntax as `font-family`, `font-size` in stylesheets.

`context.textAlign = 'center' | 'right' | 'left'` — controls horizontal alignment
relative to the x coordinate passed to `fillText`.

**`getComputedStyle(document.documentElement).getPropertyValue('--colour-grid')`:**
`getComputedStyle(element)` returns the computed CSS styles for that element.
`document.documentElement` is the `<html>` root element. `.getPropertyValue('--colour-grid')`
reads the CSS custom property defined in `:root`. This is how TypeScript reads
colours from CSS rather than maintaining a separate copy. The CSS theme and the
drawn output always agree. `.trim()` removes any leading/trailing whitespace that
some browsers add.

**`Math.ceil(value)` — first appearance:**
`Math.ceil(x)` rounds `x` upward to the nearest integer. Used here in the grid
loop: `Math.ceil(viewport.xMin / stepSize) * stepSize` gives the first grid line
that is at or above `xMin`. Without this, the grid loop might start at a value
slightly outside the visible range.

**`computeGridStep`:**
`computeGridStep` picks a "round" grid line spacing based on the visible range.
`Math.log10(rawStep)` gives the order of magnitude. `Math.pow(10, exponent)` gives
the nearest power of 10. Then the mantissa (the scale factor) is adjusted to produce
clean spacings: 1, 2, 5, 10, 20, 50, ... This prevents the grid from using values
like 3.7 as a step, which would produce unlabelled grid lines.

### Walkthrough — drawing the x-axis

`drawAxes` is called. `mathToCanvas(0, 0, viewport)` returns `{ canvasX: 250, canvasY: 250 }`.

X axis: `moveTo(0, 250)` — pen at left edge, y=250 (the mathematical y=0 position).
`lineTo(500, 250)` — line to right edge, same y. `stroke()` — draw the line.

Y axis: `moveTo(250, 0)` — pen at top edge, x=250. `lineTo(250, 500)` — to bottom.
`stroke()` — draw the vertical axis.

Two lines, crossing at (250, 250). The axes are visible.

### Wire to `main.ts`

```typescript
import { createDefaultViewport } from './viewport.js'
import { drawCoordinatePlane }   from './graph-renderer.js'
```

**Import explanation:**
`import { createDefaultViewport } from './viewport.js'` — `viewport.ts` is the
module responsible for coordinate mapping (this lesson). We import
`createDefaultViewport` — the factory function that creates a viewport covering
[-10, 10] on both axes — because `main.ts` creates the initial viewport at page
load.

`import { drawCoordinatePlane } from './graph-renderer.js'` — `graph-renderer.ts`
is the module responsible for canvas rendering (this lesson). We import
`drawCoordinatePlane` — the function that draws the full coordinate plane (grid,
axes, labels) — because `redrawGraph` calls it as the first step of every canvas
refresh.

```typescript

const graphCanvasElement =
  document.querySelector<HTMLCanvasElement>('#graph-canvas')

if (graphCanvasElement === null) {
  throw new Error('Graph canvas not found')
}

const graphContext = graphCanvasElement.getContext('2d')
if (graphContext === null) {
  throw new Error('Canvas 2D context not available')
}

let viewport = createDefaultViewport(
  graphCanvasElement.width,
  graphCanvasElement.height,
)

function redrawGraph(): void {
  drawCoordinatePlane(graphContext, viewport)
}

redrawGraph()
```

**`canvas.getContext('2d')`:**
`getContext('2d')` returns the 2D rendering context for the canvas, or `null` if the
browser does not support it. No modern browser returns `null` for 2D contexts, but
TypeScript requires you to check because the return type is `CanvasRenderingContext2D | null`.
The check is a contract: you acknowledged the failure case, even if it never fires
in practice.

Open the browser. A coordinate plane appears with grid lines, axes, and numeric labels.

---

## Debugging: When the Coordinate Plane Renders Wrongly

**Symptom: canvas is blank — no axes or grid visible**

`drawCoordinatePlane` is not being called, or `graphContext` is `null`. Add a
temporary log:
```typescript
console.log('graphContext:', graphContext)
console.log('viewport:', viewport)
```
If `graphContext` is `null`, `canvas.getContext('2d')` failed or the canvas element
was not found. Check the `id="graph-canvas"` attribute in `index.html` and verify
`document.querySelector<HTMLCanvasElement>('#graph-canvas')` finds the element.

**Symptom: origin is not at the canvas centre**

`mathToCanvas(0, 0, viewport)` should return `{ canvasX: 250, canvasY: 250 }` for a
500×500 canvas with xMin=-10, xMax=10, yMin=-10, yMax=10. Open the browser console
and run:
```typescript
// In the console:
mathToCanvas(0, 0, viewport)
```
If `canvasX` or `canvasY` is not 250, the viewport was created with wrong bounds.
Check `createDefaultViewport` returns the expected `xMin`, `xMax`, `yMin`, `yMax`.

**Symptom: y-axis is in the wrong position (e.g., at left edge)**

The origin x is wrong. Check the `canvasX` formula in `mathToCanvas`:
`((mathX - viewport.xMin) / xRange) * canvasWidth`. If `xMin` and `xMax` are both
positive (e.g., 0 and 20 instead of -10 and 10), the origin will not be centred.

**Symptom: grid labels appear as `NaN` or `undefined`**

`computeGridStep` returned `NaN`. Add a log:
```typescript
console.log('range:', viewport.xMax - viewport.xMin)
console.log('stepSize:', computeGridStep(viewport.xMax - viewport.xMin))
```
If `range` is 0, the viewport has `xMin === xMax` — the canvas has no width in
mathematical space. This would only happen if `createDefaultViewport` was called
with incorrect arguments.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`drawCoordinatePlane` is called at the start of every subsequent redraw. Lesson 12
adds `drawFunction` on top of it. Lesson 16 adds `drawShadedArea`. Lesson 18 adds
`drawRootMarker`. Each addition layers on top of the coordinate plane without
modifying it. The plane is always drawn first — it is the background every other
layer paints on.

`viewport` will be modified by lesson 17 (zoom and pan). All subsequent drawing
code calls `mathToCanvas(viewport)` — when the viewport changes, every drawing
call automatically uses the new bounds. No drawing code needs to know about zoom
and pan; they only need to use `mathToCanvas`.

---

## What Breaks Without This

**Without the viewport transform:**
Every draw call would use raw pixel coordinates. Drawing at pixel (250, 200) means
nothing to someone thinking in terms of mathematical coordinates. When lesson 17
adds zoom and pan, every draw call would need to manually scale and translate its
coordinates. The viewport abstraction centralises that calculation in one pure function.

**Without reading colours from CSS:**
Colours would be hardcoded strings in `graph-renderer.ts`. If the theme changes —
from dark to light mode, or a single colour token is updated — the canvas would not
update. By reading `--colour-axis` at render time, the canvas automatically reflects
whatever the CSS says.

---

## Definition of Done

- [ ] A canvas is visible beside the calculator
- [ ] X and Y axes are drawn through the origin
- [ ] Grid lines are visible at regular intervals with numeric labels
- [ ] The origin (0, 0) is at the centre of the canvas
- [ ] `mathToCanvas` and `canvasToMath` are inverses (verified by test)
- [ ] All canvas colours come from CSS custom properties
- [ ] `npm test` passes all tests in `viewport.test.ts`
- [ ] You can explain what the HTML `<canvas>` element is and how `getContext('2d')`
      relates to it
- [ ] You can explain `beginPath()`, `moveTo()`, `lineTo()`, and `stroke()`
- [ ] You can explain why the y-axis is flipped and show the conversion formula
- [ ] You can explain `getComputedStyle` and why colours are read from CSS
- [ ] You can explain `Math.ceil` and why it is used in the grid loop
- [ ] You can explain the linear interpolation formula in `mathToCanvas`
- [ ] Run:
      ```
      git add src/viewport.ts src/viewport.test.ts src/graph-renderer.ts src/main.ts index.html src/style.css
      git commit -m "Add coordinate plane: canvas with axes, grid, and labels; viewport transform maps maths coordinates to pixels with y-axis flip"
      ```

---

*Next: Lesson 12 — Graphing. After defining `f(x) = x^2`, the parabola appears
on the canvas. One sample per pixel column, `isPenDown` tracks gaps where the
function is undefined.*
