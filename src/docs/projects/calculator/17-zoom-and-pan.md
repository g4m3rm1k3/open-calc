# Lesson 17 — Zoom and Pan

## What You Will Build

Scrolling over the canvas zooms in and out, centred on the cursor. Clicking and
dragging pans the coordinate plane. A "Reset View" button returns to the default
viewport. All graph elements — curves, shading, grid, labels — update immediately.

## What You Need to Know First

Lessons 01–16. The viewport transform (`mathToCanvas`, `canvasToMath`) from
lesson 11. The entire rendering system uses the viewport object, so changing
the viewport rerenders everything correctly.

---

## The Lesson

### The problem

The default viewport shows x from -10 to 10. To see `f(x) = sin(100x)`, you need
to zoom in. To see the full shape of `f(x) = x^3 - 100x`, you need to zoom out.
The viewport must be interactive.

---

### Step 1 — Maths — scale and translation as coordinate transformations

**Maths — coordinate transformation:**
Zooming is scaling the coordinate space. Panning is translating it. Both are
linear transformations — the same class of operations as matrix multiplication
from the OpenMAT project.

When you zoom in by factor `k` centred on a mathematical point `(cx, cy)`:
- Every point moves closer to `(cx, cy)` by factor `k`
- The new viewport is: `xMin' = cx + (xMin - cx)/k`, `xMax' = cx + (xMax - cx)/k`
- Similarly for y

When you pan by `(dx, dy)` in mathematical units:
- The viewport shifts: `xMin' = xMin - dx`, `xMax' = xMax - dx`

The key insight: zoom and pan change the viewport bounds. The rendering code never
changes. `mathToCanvas` always computes correctly for whatever viewport it receives.
This is why the viewport abstraction from lesson 11 pays off here.

---

### Step 2 — Zoom on scroll

Add to `src/main.ts`:

```typescript
const ZOOM_FACTOR = 0.9  // zoom in by 10% per scroll step

graphCanvas.addEventListener('wheel', (wheelEvent) => {
  wheelEvent.preventDefault()

  const canvasRect  = graphCanvas.getBoundingClientRect()
  const cursorCanvasX = wheelEvent.clientX - canvasRect.left
  const cursorCanvasY = wheelEvent.clientY - canvasRect.top

  // Convert cursor position to mathematical coordinates
  const { mathX: cursorMathX, mathY: cursorMathY } =
    canvasToMath(cursorCanvasX, cursorCanvasY, viewport)

  // Determine zoom direction
  const zoomMultiplier = wheelEvent.deltaY > 0
    ? 1 / ZOOM_FACTOR  // scroll down: zoom out
    : ZOOM_FACTOR      // scroll up:   zoom in

  viewport = {
    ...viewport,
    xMin: cursorMathX + (viewport.xMin - cursorMathX) * zoomMultiplier,
    xMax: cursorMathX + (viewport.xMax - cursorMathX) * zoomMultiplier,
    yMin: cursorMathY + (viewport.yMin - cursorMathY) * zoomMultiplier,
    yMax: cursorMathY + (viewport.yMax - cursorMathY) * zoomMultiplier,
  }

  redrawGraph()
})
```

**CS lens — zoom centred on the cursor:**
Zoom that is not centred on the cursor feels disorienting — the point you were
looking at jumps away. To zoom centred on `(cursorMathX, cursorMathY)`, we scale
the distance from the viewport bounds to the cursor point. If the cursor is at
mathematical coordinate (3, 2) and we zoom in by 0.9×, the new xMin is:
`3 + (xMin - 3) × 0.9` — the distance from 3 to xMin shrinks by 10%. The cursor
stays at the same canvas position while everything around it zooms in.

---

### Step 3 — Pan on drag

```typescript
let isDragging   = false
let dragStartX   = 0
let dragStartY   = 0
let viewportAtDragStart: Viewport | null = null

graphCanvas.addEventListener('mousedown', (mouseEvent) => {
  isDragging          = true
  dragStartX          = mouseEvent.clientX
  dragStartY          = mouseEvent.clientY
  viewportAtDragStart = { ...viewport }
})

graphCanvas.addEventListener('mousemove', (mouseEvent) => {
  if (!isDragging || viewportAtDragStart === null) return

  const canvasRect  = graphCanvas.getBoundingClientRect()
  const pixelDeltaX = mouseEvent.clientX - dragStartX
  const pixelDeltaY = mouseEvent.clientY - dragStartY

  // Convert pixel delta to mathematical delta
  const xRange    = viewportAtDragStart.xMax - viewportAtDragStart.xMin
  const yRange    = viewportAtDragStart.yMax - viewportAtDragStart.yMin
  const mathDeltaX = -(pixelDeltaX / canvasRect.width)  * xRange
  const mathDeltaY =  (pixelDeltaY / canvasRect.height) * yRange  // Y is flipped

  viewport = {
    ...viewportAtDragStart,
    xMin: viewportAtDragStart.xMin + mathDeltaX,
    xMax: viewportAtDragStart.xMax + mathDeltaX,
    yMin: viewportAtDragStart.yMin + mathDeltaY,
    yMax: viewportAtDragStart.yMax + mathDeltaY,
  }

  redrawGraph()
})

graphCanvas.addEventListener('mouseup', () => { isDragging = false })
graphCanvas.addEventListener('mouseleave', () => { isDragging = false })
```

**SE lens — snapshot at drag start:**
`viewportAtDragStart` captures the viewport at the moment the mouse button is
pressed. During the drag, all calculations are relative to this snapshot, not the
current viewport. Without this, each mousemove event would compound its offset on
top of the previous viewport — small floating point errors would accumulate and
the view would drift. Snapshotting the state at the start of an interaction and
calculating new state relative to that snapshot is a general pattern for drag operations.

---

### Step 4 — Reset view

Add a reset button to `index.html`:

```html
<button class="reset-view-btn" id="reset-view">Reset View</button>
```

Wire in `src/main.ts`:

```typescript
document.querySelector('#reset-view')?.addEventListener('click', () => {
  viewport = createDefaultViewport(graphCanvas.width, graphCanvas.height)
  redrawGraph()
})
```

---

### Step 5 — Tests for the viewport transform

The zoom logic has a testable invariant: the cursor position in canvas space should
remain at the same canvas position after zoom.

```typescript
describe('zoom', () => {
  test('zoom centred on cursor keeps cursor at same canvas position', () => {
    const initialViewport = createDefaultViewport(500, 500)
    const cursorCanvas    = { canvasX: 200, canvasY: 150 }
    const cursorMath      = canvasToMath(cursorCanvas.canvasX, cursorCanvas.canvasY, initialViewport)
    const zoomFactor      = 0.9

    const zoomedViewport: Viewport = {
      ...initialViewport,
      xMin: cursorMath.mathX + (initialViewport.xMin - cursorMath.mathX) * zoomFactor,
      xMax: cursorMath.mathX + (initialViewport.xMax - cursorMath.mathX) * zoomFactor,
      yMin: cursorMath.mathY + (initialViewport.yMin - cursorMath.mathY) * zoomFactor,
      yMax: cursorMath.mathY + (initialViewport.yMax - cursorMath.mathY) * zoomFactor,
    }

    const cursorAfterZoom = mathToCanvas(cursorMath.mathX, cursorMath.mathY, zoomedViewport)
    expect(Math.abs(cursorAfterZoom.canvasX - cursorCanvas.canvasX)).toBeLessThan(0.001)
    expect(Math.abs(cursorAfterZoom.canvasY - cursorCanvas.canvasY)).toBeLessThan(0.001)
  })
})
```

---

## Connect the Pieces

The viewport object is now interactive. Every lesson that draws on the canvas
(12, 13, 15, 16, 18, 19, 20, 21) automatically benefits from zoom and pan —
because they all call `redrawGraph()`, which calls `drawCoordinatePlane` and
`drawFunction` with the current viewport. Not one of those lessons needs to change.
This is the architectural payoff of the viewport abstraction.

---

## What Breaks Without This

Without the cursor-centred zoom, zooming always zooms from the centre of the canvas.
If the user is looking at a root near x=8 and zooms in, the root jumps towards the
centre. The user scrolls to find it again, and it jumps again. The experience is
disorienting and the feature feels broken.

---

## Definition of Done

- [ ] Scrolling zooms in/out centred on the cursor
- [ ] Dragging pans the coordinate plane
- [ ] Grid, axes, labels, and all curves update after every pan/zoom
- [ ] Reset View returns to the default viewport (x: -10 to 10, y: -10 to 10)
- [ ] Zoom does not distort the aspect ratio
- [ ] `npm test` passes the zoom invariant test
