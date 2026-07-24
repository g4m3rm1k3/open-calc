# Lesson 13: From Math Coordinates to Pixels

*(Plotting a Function)*

**User Story**
> As a user, I want to type a function like `x^2` and see it graphed live
> on the Graph screen.

**What you will build**
A text field on the Graph screen where typing a function of `x` draws its
curve across Lesson 12's axes, sampled across the visible domain.

**What you need to know first**
Lesson 12's `Canvas`, `size`, and coordinate flip. Lesson 6's evaluator
shape (this lesson writes a small, separate single-variable version, not a
reuse of the exact same function — reasons explained below).

---

## Concept Unit: A Function of `x`, Not an Expression Evaluator

### The Problem

Lesson 6's `evaluate` computes one fixed number from a complete expression
like `"7+3"` — it has no concept of a variable. Graphing needs the opposite
shape: a function that takes **one input, `x`**, and returns `f(x)`,
evaluated many times across a range.

### The New Code

```kotlin
fun evaluateFunction(functionText: String, x: Double): Double {
    return when (functionText) {
        "x^2" -> x * x
        "sin(x)" -> sin(x)
        "x" -> x
        else -> 0.0
    }
}
```

### Mechanical walkthrough

1. `evaluateFunction(functionText: String, x: Double): Double` — a
   deliberately small, honest placeholder: real support for arbitrary
   typed expressions (`"2x+1"`, `"x^3-x"`) would mean extending Lesson 6's
   recursive-descent parser to recognize the variable `x` as a special
   token — a real, bounded piece of work, left as this lesson's main
   exercise rather than built out here, in keeping with this course's
   "touch on things, extend yourself" scope. `when` over a small fixed set
   of supported function strings is enough to prove the graphing mechanism
   itself works correctly.

### SE Lens

Why not just reuse Lesson 6's `evaluate` directly? Because it has no
concept of a variable at all — extending it to support one is a real
design decision (does `x` become a special token in the lexer? A lookup in
an environment map, the way this repo's OpenMAT project handles variables?)
worth making deliberately, not accidentally, by trying to force two
genuinely different jobs (evaluate a complete numeric expression; evaluate
a parameterized function across many inputs) into one function.

### Connection

Lesson 19's numerical derivative and Lesson 20's numerical integral both
call this same `evaluateFunction` repeatedly across a range — exactly the
shape it's built for.

---

## Concept Unit: Sampling and `Path`

### The Problem

A smooth-looking curve on screen is really many short straight line
segments, connecting `f(x)` sampled at closely-spaced `x` values — the
same sampling idea a graphing calculator or this repo's Calculator project
already relies on, now drawn with Compose's `Canvas`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** The `"graph"` route's composable (Lesson 12).
- **Change type:** Add a text field + a plotted `Path` inside the existing
  `Canvas`.
- **Location:** Inside `Canvas { ... }`, after the two axis `drawLine`
  calls from Lesson 12.
- **Dependencies:** `evaluateFunction` from Concept Unit 1.

### The New Code

```kotlin
val pixelsPerUnit = 40f
val path = Path()
var isFirstPoint = true

for (screenX in 0..size.width.toInt() step 2) {
    val mathX = (screenX - centerX) / pixelsPerUnit
    val mathY = evaluateFunction(functionText, mathX.toDouble())
    val screenY = centerY - mathY.toFloat() * pixelsPerUnit

    if (isFirstPoint) {
        path.moveTo(screenX.toFloat(), screenY)
        isFirstPoint = false
    } else {
        path.lineTo(screenX.toFloat(), screenY)
    }
}
drawPath(path, color = Color.Blue, style = Stroke(width = 4f))
```

### The Updated Project

```kotlin
composable("graph") {
    var functionText by remember { mutableStateOf("x^2") }   // ← new

    Column(modifier = Modifier.fillMaxSize()) {
        TextField(                                            // ← new
            value = functionText,
            onValueChange = { functionText = it },
            label = { Text("f(x) =") }
        )
        Canvas(modifier = Modifier.weight(1f).fillMaxWidth()) {
            val centerX = size.width / 2f
            val centerY = size.height / 2f

            drawLine(color = Color.Gray, start = Offset(0f, centerY), end = Offset(size.width, centerY), strokeWidth = 2f)
            drawLine(color = Color.Gray, start = Offset(centerX, 0f), end = Offset(centerX, size.height), strokeWidth = 2f)

            val pixelsPerUnit = 40f                            // ← new
            val path = Path()
            var isFirstPoint = true
            for (screenX in 0..size.width.toInt() step 2) {
                val mathX = (screenX - centerX) / pixelsPerUnit
                val mathY = evaluateFunction(functionText, mathX.toDouble())
                val screenY = centerY - mathY.toFloat() * pixelsPerUnit
                if (isFirstPoint) { path.moveTo(screenX.toFloat(), screenY); isFirstPoint = false }
                else { path.lineTo(screenX.toFloat(), screenY) }
            }
            drawPath(path, color = Color.Blue, style = Stroke(width = 4f))
        }
    }
}
```

Typing into the new `TextField` (defaulting to `"x^2"`) redraws the curve
live, above the same axes Lesson 12 already established.

### Mechanical walkthrough

1. `TextField(value = ..., onValueChange = ..., label = ...)` — (first
   appearance) Compose's text input control, state-hoisted (Lesson 2)
   exactly like every other piece of state in this app: `value` is read
   from `functionText`, `onValueChange` writes back to it.
2. `for (screenX in 0..size.width.toInt() step 2)` — (hard concept
   reappearing) a Kotlin range with `step`, iterating every 2 pixels
   instead of every 1 — a deliberate performance/smoothness tradeoff,
   named directly rather than left unexplained.
3. `(screenX - centerX) / pixelsPerUnit` — (first appearance) converts a
   screen pixel column into a math-space `x` value — `pixelsPerUnit`
   defines the zoom level (Lesson 14 makes this adjustable).
4. `centerY - mathY.toFloat() * pixelsPerUnit` — (hard concept reappearing)
   Lesson 12's y-axis flip, applied for real: subtracting (not adding)
   `mathY`'s contribution is exactly what corrects for `DrawScope`'s
   downward-increasing `y` against math's upward-increasing `y`.
5. `Path()`, `path.moveTo(...)`, `path.lineTo(...)`, `drawPath(...)` —
   (first appearance) `Path` accumulates a sequence of connected line
   segments; `moveTo` starts a new segment without drawing, `lineTo` draws
   from the current point to a new one. Building the whole curve as one
   `Path` and drawing it once is both simpler and faster than calling
   `drawLine` for each individual segment.
6. `mathY.toFloat()` — (hard concept reappearing) Lesson 12's `Double`/
   `Float` distinction, made concrete here: `evaluateFunction` returns
   `Double` (matching the calculator's own numeric type), but every
   drawing coordinate needs `Float` — this explicit conversion is the
   deliberate bridge between the two.

### Execution trace

```
screenX = 0:   mathX = (0 - 400) / 40 = -10.0 → mathY = evaluateFunction("x^2", -10.0) = 100.0 → screenY = 300 - 100×40 = way off-screen (clipped visually)
screenX = 400: mathX = (400 - 400) / 40 = 0.0  → mathY = 0.0 → screenY = 300 - 0 = 300 (center)
screenX = 440: mathX = (440 - 400) / 40 = 1.0  → mathY = 1.0 → screenY = 300 - 40 = 260
```

*Note:* the first row shows a real, honest limitation of this simple
version — a parabola's value grows fast, and this sampling approach draws
every computed point whether or not it's anywhere near the visible screen.
Clipping or scaling the visible range is a natural next step, left as an
exercise rather than solved here.

### CS Lens

This is **function sampling** — approximating a continuous curve with
finitely many discrete points, connected by straight segments — the same
core idea behind this repo's OpenMAT visualiser and the standalone
Calculator project's own graphing feature, and behind literally every
digital plot of a continuous function that has ever existed, since a
screen is fundamentally discrete pixels.

### SE Lens

The real tradeoff in `step 2`: sampling every pixel column (`step 1`) gives
a marginally smoother curve at roughly double the `evaluateFunction` calls;
sampling every 4th or 8th pixel is visibly choppier on a sharply-curving
function but cheaper. `step 2` is a reasonable default for this app's
scale, not a universally correct number — Lesson 22's coroutine-driven
animation is where sampling cost actually starts to matter for real
performance.

### Connection

Lesson 14 adds pan and zoom by making `pixelsPerUnit` and the origin offset
into state instead of the fixed values used here — everything else in this
lesson's math stays the same.

---

## Closing

### Connect the pieces

`evaluateFunction` (unit 1) computes `f(x)` for one `x` at a time.
Sampling (unit 2) calls it once per pixel column across the screen's
width, converting each math-space result back into a screen-space `Offset`
using Lesson 12's centered origin and the y-axis flip, accumulating the
whole curve into one `Path` drawn in a single `drawPath` call.

### What breaks without this

Remove the `mathY.toFloat()` conversion, leaving a raw `Double` where
`Float` is expected in the `screenY` calculation. Real, observable
failure: a compile error — Kotlin's numeric types don't implicitly widen
or narrow between `Double` and `Float` the way some languages do; the
compiler flags the mismatch directly rather than silently truncating.
Restore `.toFloat()` and it compiles again.

### Exercises

- Add support for a second hardcoded function, `"x^3"`, to
  `evaluateFunction`'s `when`, and confirm switching the text field's
  content actually changes the plotted curve.
- Extend Lesson 6's `evaluate` yourself to recognize `x` as a special
  token, replacing this lesson's hardcoded `when` with a real parsed
  function — the natural, bounded extension this lesson's SE Lens named.

### Definition of done

- [ ] Typing `"x^2"` or `"sin(x)"` plots the correct curve.
- [ ] The curve correctly passes through the origin where expected
      (`x^2` at `x=0` should sit exactly on the axis crossing).
- [ ] You can explain, concretely, why `screenY` subtracts `mathY`'s
      contribution instead of adding it.
- [ ] Commit: `git commit -m "Plot a sampled function onto the graph Canvas, converting math coordinates to screen pixels"`.
