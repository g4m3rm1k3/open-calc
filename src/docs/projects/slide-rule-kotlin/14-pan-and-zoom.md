# Lesson 14: Reading Raw Touch as Transform Values

*(Pan and Zoom on the Graph)*

**User Story**
> As a user, I want to drag and pinch the graph like a real map app —
> panning and zooming to see more or less of the curve.

**What you will build**
Lesson 13's fixed `pixelsPerUnit` and origin become adjustable state, driven
by real drag and pinch gestures on the `Canvas`.

**What you need to know first**
Lesson 13's sampling loop and `pixelsPerUnit`. Nothing from `../track/`
applies directly — that course's touch handling (clicks, `RecyclerView`
scrolling) never needed raw multi-touch gesture math.

---

## Concept Unit: `pointerInput` and `detectTransformGestures`

### The Problem

Lesson 13 hardcoded `pixelsPerUnit = 40f` and an origin fixed at the
screen's exact center. A real graphing tool needs both to change in
response to the user's fingers — dragging shifts the visible origin,
pinching changes the zoom level.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** The `"graph"` route's composable.
- **Change type:** Add gesture state + a `pointerInput` modifier on the
  `Canvas`.
- **Location:** Wrapping Lesson 13's `Canvas` and its sampling loop.
- **Dependencies:** Lesson 13's `pixelsPerUnit` and centering math.

### The New Code

```kotlin
var offsetX by remember { mutableStateOf(0f) }
var offsetY by remember { mutableStateOf(0f) }
var scale by remember { mutableStateOf(40f) }   // this is Lesson 13's pixelsPerUnit, now variable

Canvas(
    modifier = Modifier
        .weight(1f)
        .fillMaxWidth()
        .pointerInput(Unit) {
            detectTransformGestures { _, pan, zoom, _ ->
                offsetX += pan.x
                offsetY += pan.y
                scale = (scale * zoom).coerceIn(10f, 200f)
            }
        }
) {
    val centerX = size.width / 2f + offsetX
    val centerY = size.height / 2f + offsetY
    // ... rest of Lesson 13's drawing, using `scale` wherever `pixelsPerUnit` was used ...
}
```

### The Updated Project

```kotlin
composable("graph") {
    var functionText by remember { mutableStateOf("x^2") }
    var offsetX by remember { mutableStateOf(0f) }          // ← new
    var offsetY by remember { mutableStateOf(0f) }          // ← new
    var scale by remember { mutableStateOf(40f) }           // ← new (was a fixed val in Lesson 13)

    Column(modifier = Modifier.fillMaxSize()) {
        TextField(value = functionText, onValueChange = { functionText = it }, label = { Text("f(x) =") })
        Canvas(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .pointerInput(Unit) {                        // ← new
                    detectTransformGestures { _, pan, zoom, _ ->
                        offsetX += pan.x
                        offsetY += pan.y
                        scale = (scale * zoom).coerceIn(10f, 200f)
                    }
                }
        ) {
            val centerX = size.width / 2f + offsetX          // ← changed
            val centerY = size.height / 2f + offsetY         // ← changed

            drawLine(color = Color.Gray, start = Offset(0f, centerY), end = Offset(size.width, centerY), strokeWidth = 2f)
            drawLine(color = Color.Gray, start = Offset(centerX, 0f), end = Offset(centerX, size.height), strokeWidth = 2f)

            val path = Path()
            var isFirstPoint = true
            for (screenX in 0..size.width.toInt() step 2) {
                val mathX = (screenX - centerX) / scale       // ← changed: scale instead of fixed pixelsPerUnit
                val mathY = evaluateFunction(functionText, mathX.toDouble())
                val screenY = centerY - mathY.toFloat() * scale // ← changed
                if (isFirstPoint) { path.moveTo(screenX.toFloat(), screenY); isFirstPoint = false }
                else { path.lineTo(screenX.toFloat(), screenY) }
            }
            drawPath(path, color = Color.Blue, style = Stroke(width = 4f))
        }
    }
}
```

Dragging now shifts the visible axes; pinching zooms in and out, clamped
between `10f` and `200f` pixels-per-unit so the graph can't zoom to
nothing or to an unusably huge scale.

### Mechanical walkthrough

1. `Modifier.pointerInput(Unit) { ... }` — (first appearance) attaches raw
   gesture-detection to a composable. `Unit` here is a **key** — if it ever
   changed between recompositions, Compose would restart the gesture
   detection coroutine; a fixed `Unit` means "set this up once and never
   restart it," appropriate since nothing about *how* gestures are detected
   changes here.
2. `detectTransformGestures { _, pan, zoom, _ -> ... }` — (first
   appearance) a suspending function (Epic 7 names what "suspending" means
   in depth; here it's enough to know it must run inside `pointerInput`'s
   coroutine scope) that calls its lambda repeatedly while a drag or pinch
   gesture is in progress. Its four parameters are the gesture's centroid,
   the pan `Offset` since the last call, the zoom **scale factor** since
   the last call, and rotation (unused here, hence `_`).
3. `offsetX += pan.x` / `offsetY += pan.y` — (hard concept reappearing)
   ordinary state mutation (Lesson 2), accumulating total pan distance
   across many small gesture callbacks rather than one single value.
4. `scale = (scale * zoom).coerceIn(10f, 200f)` — (first appearance)
   `zoom` is a *multiplier* (greater than 1 when pinching outward, less
   than 1 pinching inward), so `scale * zoom` compounds correctly across
   repeated calls during one continuous pinch. `.coerceIn(10f, 200f)` is a
   standard-library extension function clamping the result to a sane
   range — the same defensive-bounds idea as Lesson 9's `?: 0.0` fallback,
   applied to prevent an unusable zoom level instead of a crash.
5. `size.width / 2f + offsetX` — Lesson 13's fixed center, now shifted by
   accumulated pan — everything downstream (axis lines, the sampling loop)
   reads this adjusted center automatically, with no other code changes
   needed.

### CS Lens

This is an **affine transform** (translation plus scaling) applied to the
math-to-pixel mapping — the same underlying idea as this curriculum's
CAD/CAM project's 4×4 transform matrices, reduced here to the simplest 2D
case: a translation (`offsetX`/`offsetY`) and a uniform scale (`scale`),
composed by being applied together in the same coordinate formula, rather
than as an explicit matrix multiplication.

### SE Lens

Why clamp `scale` with `coerceIn` instead of leaving it unbounded? An
unbounded zoom-out eventually divides by a `scale` so small that
`mathX`/`mathY` calculations overflow or lose all meaningful precision;
an unbounded zoom-in eventually makes `scale` so large the sampling loop's
`step 2` pixel spacing represents a math-space step far smaller than
`Double`'s useful precision can distinguish. The clamp is a deliberate,
honest boundary matching this app's actual useful range, not an arbitrary
restriction.

### Connection

Every future graph-screen feature (Lesson 19's tangent line, Lesson 20's
shaded integral region) reads `centerX`/`centerY`/`scale` exactly as
established here — pan and zoom apply to them automatically with no
further changes needed.

---

## Closing

### Connect the pieces

`pointerInput` + `detectTransformGestures` (unit 1) turn raw touch input
into `pan` and `zoom` values every frame a gesture is active. Those values
accumulate into `offsetX`/`offsetY`/`scale` — ordinary Compose state
(Lesson 2) — which Lesson 13's centering and sampling math already reads,
requiring no changes beyond swapping a fixed value for a variable one.

### What breaks without this

Remove `.coerceIn(10f, 200f)`, leaving `scale = scale * zoom` unclamped.
Pinch-zoom out repeatedly and aggressively on a real device. Real,
observable failure: the graph eventually renders as a flat, meaningless
line or disappears entirely — `scale` has become so small that every
`mathX` calculation across the whole screen width rounds to nearly the
same tiny range, and the plotted function is effectively evaluated at one
point stretched across every pixel. Restore the clamp and zooming stays
within a genuinely useful range.

### Exercises

- Log `scale`'s value (a `Text` displaying it is fine) and pinch to find
  the practical zoom range that keeps `x^2` recognizable — compare it to
  the `10f`–`200f` clamp chosen here.
- Add a "Reset View" button setting `offsetX`, `offsetY`, and `scale` back
  to their Lesson 13 defaults.

### Definition of done

- [ ] Dragging the graph pans it smoothly.
- [ ] Pinching zooms in and out, clamped to a sane range.
- [ ] You can explain, concretely, why `zoom` is multiplied into `scale`
      rather than added.
- [ ] Commit: `git commit -m "Add pan and zoom gestures to the graph — pixelsPerUnit and origin are now live state"`.
