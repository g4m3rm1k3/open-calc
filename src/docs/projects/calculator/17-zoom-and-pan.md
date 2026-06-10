# Calculator — Lesson 17 — Zoom and Pan

## What You Will Build

Scrolling the mouse wheel over the canvas zooms in or out, centred on the cursor
position. Clicking and dragging pans the coordinate plane. A "Reset View" button
returns to the default viewport. All graph elements — curves, shaded areas, grid,
labels — update immediately after every zoom or pan. No drawing code changes.

## What You Need to Know First

Lessons 01–16. Specifically the viewport transform (`mathToCanvas`, `canvasToMath`)
from lesson 11. The entire rendering system already passes the viewport to every
draw call, so changing the viewport automatically redraws everything correctly.
This lesson is the architectural payoff of that design.

---

## The Problem

The default viewport shows x from -10 to 10. To see `f(x) = sin(100x)` — which
oscillates rapidly — you need to zoom in to a narrow range. To see the full shape
of `f(x) = x^3 - 100x`, you need to zoom out. Without interactive zoom and pan,
the user is trapped at one scale.

---

## Step 1 — Maths: Zoom and Pan as Coordinate Transformations

Zoom and pan are **linear transformations** of the viewport bounds.

**Zoom centred on a point (cx, cy) by factor k:**
Every x value moves closer to `cx` by factor `k`. The new viewport bounds are:

```
xMin' = cx + (xMin - cx) / k
xMax' = cx + (xMax - cx) / k
yMin' = cy + (yMin - cy) / k
yMax' = cy + (yMax - cy) / k
```

If `k > 1`, the range shrinks — zoom in. If `k < 1`, the range expands — zoom out.

When `k = 1.1` (zoom in 10%) and `cx = 3` with current `xMin = -10, xMax = 10`:
```
xMin' = 3 + (-10 - 3) / 1.1 = 3 + (-13/1.1) = 3 - 11.82 = -8.82
xMax' = 3 + (10 - 3) / 1.1 = 3 + (7/1.1) = 3 + 6.36 = 9.36
```

The range shrinks from 20 to 18.18. The point x=3 is still at the same canvas
position because the fraction `(3 - xMin) / range` is the same before and after.
That is what "centred on the cursor" means.

**Pan by mathematical delta (dx, dy):**
```
xMin' = xMin + dx
xMax' = xMax + dx
yMin' = yMin + dy
yMax' = yMax + dy
```

The entire viewport shifts. Every point moves by (dx, dy) in mathematical units.

**CS lens — why no drawing code changes:**
Zoom and pan only change the viewport object. All drawing functions take `viewport`
as a parameter and call `mathToCanvas(viewport)` to position every element. When
the viewport changes, `mathToCanvas` automatically produces new pixel positions.
The rendering system does not know about zoom and pan — it only knows how to draw
given a viewport. This is the payoff of the viewport abstraction.

---

## Step 2 — Zoom on Scroll

### The code

Add to `src/main.ts`:

```typescript
import { canvasToMath } from './viewport.js'

const ZOOM_FACTOR = 1.1  // zoom in 10% per scroll step

graphCanvasElement.addEventListener('wheel', (wheelEvent) => {
  wheelEvent.preventDefault()

  const canvasRect   = graphCanvasElement.getBoundingClientRect()
  const cursorCanvasX = wheelEvent.clientX - canvasRect.left
  const cursorCanvasY = wheelEvent.clientY - canvasRect.top

  const { mathX: cursorMathX, mathY: cursorMathY } =
    canvasToMath(cursorCanvasX, cursorCanvasY, viewport)

  const zoomMultiplier = wheelEvent.deltaY > 0
    ? 1 / ZOOM_FACTOR  // scroll down → zoom out
    : ZOOM_FACTOR      // scroll up   → zoom in

  viewport = {
    ...viewport,
    xMin: cursorMathX + (viewport.xMin - cursorMathX) / zoomMultiplier,
    xMax: cursorMathX + (viewport.xMax - cursorMathX) / zoomMultiplier,
    yMin: cursorMathY + (viewport.yMin - cursorMathY) / zoomMultiplier,
    yMax: cursorMathY + (viewport.yMax - cursorMathY) / zoomMultiplier,
  }

  redrawGraph()
}, { passive: false })
```

**`wheelEvent.preventDefault()` and `{ passive: false }`:**
By default, modern browsers handle scroll events passively — they scroll the page
before calling any JavaScript handler. `wheelEvent.preventDefault()` stops the page
scroll so the canvas zooms instead. The `{ passive: false }` option in
`addEventListener` tells the browser that this handler may call `preventDefault()`.
Without it, some browsers ignore `preventDefault()` for wheel events on scroll-able
pages.

**`element.getBoundingClientRect()` — first appearance:**
`getBoundingClientRect()` returns a `DOMRect` object with the element's position
and size in viewport coordinates (relative to the browser window, including scroll).
`rect.left` is the x position of the left edge of the element. `wheelEvent.clientX`
is the x position of the mouse at the time of the event, also in viewport coordinates.
Subtracting gives the cursor position relative to the canvas element.

**`wheelEvent.deltaY` — first appearance:**
`wheelEvent.deltaY` is the vertical scroll amount. A positive value means the user
scrolled down (wheel rotating toward the user). A negative value means up. The sign
convention differs across operating systems and mice, but the direction is consistent:
positive = down. Here: scroll down = zoom out (the view gets wider).

### Walkthrough — zoom centred on cursor at math (3, 2)

Initial viewport: xMin=-10, xMax=10, yMin=-10, yMax=10.
User scrolls up (zoom in, `ZOOM_FACTOR = 1.1`). `cursorMathX = 3`, `cursorMathY = 2`.
`zoomMultiplier = 1.1`.

```
xMin' = 3 + (-10 - 3) / 1.1 = 3 + (-11.818) = -8.818
xMax' = 3 + (10 - 3) / 1.1  = 3 + 6.364     =  9.364
```

The range shrinks from 20 to 18.18. After `redrawGraph()`:
`mathToCanvas(3, 2, newViewport)`:
```
canvasX = ((3 - (-8.818)) / 18.182) × 500 = (11.818 / 18.182) × 500 = 325
```

Before zoom, cursor was at:
`canvasX = ((3 - (-10)) / 20) × 500 = (13/20) × 500 = 325`

Same canvas position. The cursor did not move. Everything around it zoomed. ✓

---

## Step 3 — Pan on Drag

```typescript
let isDragging          = false
let dragStartClientX    = 0
let dragStartClientY    = 0
let viewportAtDragStart: typeof viewport | null = null

graphCanvasElement.addEventListener('mousedown', (mouseEvent) => {
  isDragging          = true
  dragStartClientX    = mouseEvent.clientX
  dragStartClientY    = mouseEvent.clientY
  viewportAtDragStart = { ...viewport }
})

graphCanvasElement.addEventListener('mousemove', (mouseEvent) => {
  if (!isDragging || viewportAtDragStart === null) return

  const canvasRect  = graphCanvasElement.getBoundingClientRect()
  const pixelDeltaX = mouseEvent.clientX - dragStartClientX
  const pixelDeltaY = mouseEvent.clientY - dragStartClientY

  const xRange     = viewportAtDragStart.xMax - viewportAtDragStart.xMin
  const yRange     = viewportAtDragStart.yMax - viewportAtDragStart.yMin

  // Pixel delta → math delta (Y flip applies here too)
  const mathDeltaX = -(pixelDeltaX / canvasRect.width)  * xRange
  const mathDeltaY =  (pixelDeltaY / canvasRect.height) * yRange

  viewport = {
    ...viewportAtDragStart,
    xMin: viewportAtDragStart.xMin + mathDeltaX,
    xMax: viewportAtDragStart.xMax + mathDeltaX,
    yMin: viewportAtDragStart.yMin + mathDeltaY,
    yMax: viewportAtDragStart.yMax + mathDeltaY,
  }

  redrawGraph()
})

graphCanvasElement.addEventListener('mouseup',    () => { isDragging = false })
graphCanvasElement.addEventListener('mouseleave', () => { isDragging = false })
```

**Mouse events — first appearance:**
`mousedown` fires when a mouse button is pressed. `mousemove` fires as the mouse
moves. `mouseup` fires when the button is released. `mouseleave` fires when the
cursor exits the element — included here to cancel the drag if the mouse leaves
the canvas while held.

**`mouseEvent.clientX` / `clientY`:**
The cursor's position in browser viewport coordinates. Not relative to the canvas
element — that requires subtracting `canvasRect.left` and `canvasRect.top`.

**SE lens — snapshot at drag start:**
`viewportAtDragStart = { ...viewport }` captures the viewport at the moment of
mouse-down. All pan calculations use this snapshot, not the current (mid-drag)
viewport. Without the snapshot, each `mousemove` event would add its delta to the
already-panned viewport, compounding small floating point errors on every frame.
The view would drift over a long drag.

The pattern is general: when an interaction starts, snapshot the state. While the
interaction continues, compute new state from the snapshot plus the total delta.
This eliminates accumulation errors.

**Y flip in pan delta:**
`mathDeltaY = +(pixelDeltaY / canvasRect.height) * yRange` — note the sign.
When the user drags down (positive `pixelDeltaY`), the canvas content should
appear to move down, which means the mathematical viewport shifts upward (negative
mathY direction). The sign is positive because canvas-Y going down means maths-Y
going down as well (since we are shifting what we see, not where the viewport is).
Verify this by testing: drag down, the content moves down.

---

## Step 4 — Reset View

Add to `index.html` near the canvas:

```html
<button class="reset-view-btn" id="reset-view">Reset View</button>
```

Wire in `src/main.ts`:

```typescript
document.querySelector<HTMLButtonElement>('#reset-view')
  ?.addEventListener('click', () => {
    viewport = createDefaultViewport(
      graphCanvasElement.width,
      graphCanvasElement.height,
    )
    redrawGraph()
  })
```

One click → restore the default viewport → `redrawGraph()` → everything at the
original scale. The user can always return to a known good state.

---

## Step 5 — Test the Zoom Invariant

The zoom logic has a testable invariant: after zooming centred on a cursor position,
that cursor position should map to the same canvas coordinates.

Add to `src/viewport.test.ts`:

```typescript
test('zoom keeps cursor at same canvas position', () => {
  const initialViewport = createDefaultViewport(500, 500)
  const cursorCanvas    = { canvasX: 200, canvasY: 150 }

  const { mathX: cursorMathX, mathY: cursorMathY } =
    canvasToMath(cursorCanvas.canvasX, cursorCanvas.canvasY, initialViewport)

  const zoomFactor = 1.1
  const zoomedViewport = {
    ...initialViewport,
    xMin: cursorMathX + (initialViewport.xMin - cursorMathX) / zoomFactor,
    xMax: cursorMathX + (initialViewport.xMax - cursorMathX) / zoomFactor,
    yMin: cursorMathY + (initialViewport.yMin - cursorMathY) / zoomFactor,
    yMax: cursorMathY + (initialViewport.yMax - cursorMathY) / zoomFactor,
  }

  const cursorAfterZoom =
    mathToCanvas(cursorMathX, cursorMathY, zoomedViewport)

  expect(Math.abs(cursorAfterZoom.canvasX - cursorCanvas.canvasX)).toBeLessThan(0.001)
  expect(Math.abs(cursorAfterZoom.canvasY - cursorCanvas.canvasY)).toBeLessThan(0.001)
})
```

Run `npm test`. The invariant test passes.

This test verifies the mathematical property of the zoom formula by checking that
the cursor point is stable. It is a property test, not just a value test — it checks
a rule that must hold for all valid zoom operations.

---

## Debugging: When Zoom and Pan Behave Wrongly

**Symptom: scrolling zooms but the view drifts away from the cursor**

The zoom formula is not centering on the cursor's mathematical position. Check that
you convert the canvas cursor position to mathematical coordinates before computing
the new viewport bounds:
```typescript
const { mathX, mathY } = canvasToMath(event.offsetX, event.offsetY, viewport)
viewport = {
  ...viewport,
  xMin: mathX + (viewport.xMin - mathX) / zoomFactor,
  xMax: mathX + (viewport.xMax - mathX) / zoomFactor,
  // ...
}
```
If `mathX` and `mathY` are wrong (e.g., they always equal the canvas centre),
`canvasToMath` is not receiving the cursor position correctly. Add a log:
```typescript
console.log('cursor canvas:', event.offsetX, event.offsetY)
console.log('cursor math:', mathX, mathY)
```

**Symptom: panning moves the graph in the wrong direction**

The pan delta is applied in the wrong direction or to the wrong axis. Dragging right
should increase `xMin` and `xMax` (shift the view right). Dragging up should increase
`yMin` and `yMax`. Add a log:
```typescript
console.log('pan delta (pixels):', dx, dy)
console.log('pan delta (math units):', mathDx, mathDy)
```

**Symptom: zoom works but the graph is not redrawn after panning**

`redrawGraph()` is not called after the viewport is updated in the event handler.
Every mutation to `viewport` must be followed by `redrawGraph()`.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The viewport is now interactive. Every subsequent lesson that draws on the canvas
— lessons 18 (bisection roots), 19 (intersections), 20 (Newton convergence path),
21 (extrema), and 22 (solver panel) — automatically benefits from zoom and pan.
They all call `redrawGraph()`, which draws everything with the current viewport.
Not one of those lessons needs to know zoom and pan exist.

This is the architectural payoff of the viewport abstraction from lesson 11. The
investment was small — a single `Viewport` object passed to every draw call — and
the payoff is that every feature added afterward automatically respects the current
view.

---

## What Breaks Without This

**Without cursor-centred zoom:**
Zoom always centres on (0, 0). If the user is examining a root near x=7 and
scrolls to zoom in, the root moves toward the canvas edge. They scroll to find it,
and it moves again. The feature feels broken because the behaviour is surprising.
Centring on the cursor is what every mapping application (Google Maps, code editors,
CAD software) does because it is the only behaviour that makes sense.

**Without the drag-start snapshot:**
Each `mousemove` event computes a delta from the previous mouse position, adds it
to the current viewport, and updates the current viewport. After 100 tiny movements,
100 tiny floating point errors have accumulated. Over a long drag, the view drifts
perceptibly. The snapshot eliminates this by making every `mousemove` computation
relative to a stable starting point.

---

## Definition of Done

- [ ] Scrolling the mouse wheel over the canvas zooms in (up) and out (down)
- [ ] Zoom is centred on the cursor, not on (0, 0)
- [ ] Clicking and dragging pans the coordinate plane
- [ ] All curves, grid lines, and labels update after every zoom and pan
- [ ] Reset View restores the default viewport (x: -10 to 10, y: -10 to 10)
- [ ] `npm test` passes the zoom invariant test
- [ ] You can explain `getBoundingClientRect` and why it is needed
- [ ] You can explain `wheelEvent.deltaY` and its sign convention
- [ ] You can explain `wheelEvent.preventDefault()` and `{ passive: false }`
- [ ] You can explain the drag-start snapshot pattern and why it prevents drift
- [ ] You can explain why no drawing code changes when zoom and pan are added
- [ ] Run:
      ```
      git add src/main.ts index.html src/viewport.test.ts
      git commit -m "Add zoom and pan: wheel event zooms centred on cursor, drag pans with snapshot to prevent drift, reset view restores defaults"
      ```

---

*Next: Lesson 18 — Bisection Solver. The root of `f(x) = 0` is found by halving a
bracket until the function value is below tolerance. The intermediate value theorem
guarantees a root exists. Bisection is binary search applied to continuous functions.*
