# Lesson 20: The Area Under a Curve, Approximated by Trapezoids

*(Numerical Integral and Shading)*

**User Story**
> As a user, I want to pick two x-values on the graph and see the area
> under the curve between them shaded, with the numeric value shown.

**What you will build**
Two draggable markers on the x-axis; the region between them shaded, with
the computed definite integral shown as text.

**What you need to know first**
Lesson 19's `derivative` and the "sample the function numerically" pattern
it established — this lesson applies the same idea to a different formula.

---

## Concept Unit: The Trapezoidal Rule

### The Problem

The exact area under `x²` from `0` to `3` is a real number
(calculus gives `9`, via the antiderivative `x³/3` evaluated at the
bounds) — but this app has no symbolic antiderivative engine, for the same
honest reason Lesson 19 didn't build a symbolic derivative one. A numerical
approximation is enough.

### Introduce the concept in isolation

```kotlin
fun f(x: Double) = x * x
fun integral(f: (Double) -> Double, a: Double, b: Double, steps: Int = 1000): Double {
    val h = (b - a) / steps
    var sum = (f(a) + f(b)) / 2.0
    for (i in 1 until steps) {
        sum += f(a + i * h)
    }
    return sum * h
}

println(integral(::f, 0.0, 3.0))
```

Run it:

```bash
kotlin integral.kts
```

Real output — verified this session:

```text
9.000004500000005
```

*What this proves:* the true value is exactly `9.0`; this approximation
lands at `9.000004500000005` — extremely close, with the tiny remaining
error coming from approximating the curve as 1000 straight trapezoid tops
instead of its true continuous shape. More `steps` would shrink that error
further, at the cost of more `f(...)` calls.

### Discard the throwaway example

Deleted. `integral` moves into `Calculus.kt` alongside Lesson 19's
`derivative`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Calculus.kt`; the graph screen's `Canvas`.
- **Change type:** Add.
- **Location:** Alongside `derivative` from Lesson 19.
- **Dependencies:** `evaluateFunction`.

### The New Code

```kotlin
fun integral(f: (Double) -> Double, a: Double, b: Double, steps: Int = 1000): Double {
    val h = (b - a) / steps
    var sum = (f(a) + f(b)) / 2.0
    for (i in 1 until steps) {
        sum += f(a + i * h)
    }
    return sum * h
}
```

### The Updated Project

```kotlin
var integralStart by remember { mutableStateOf<Double?>(null) }
var integralEnd by remember { mutableStateOf<Double?>(null) }

// inside Canvas, after drawing the curve:
if (integralStart != null && integralEnd != null) {
    val a = minOf(integralStart!!, integralEnd!!)
    val b = maxOf(integralStart!!, integralEnd!!)

    val shadedPath = Path()
    shadedPath.moveTo(centerX + (a * scale).toFloat(), centerY)
    for (screenX in ((centerX + a * scale).toInt())..((centerX + b * scale).toInt()) step 2) {
        val mathX = (screenX - centerX) / scale
        val mathY = evaluateFunction(functionText, mathX.toDouble())
        shadedPath.lineTo(screenX.toFloat(), centerY - mathY.toFloat() * scale)
    }
    shadedPath.lineTo(centerX + (b * scale).toFloat(), centerY)
    shadedPath.close()
    drawPath(shadedPath, color = Color.Blue.copy(alpha = 0.3f))

    val area = integral({ x -> evaluateFunction(functionText, x) }, a, b)
    // shown as a Text composable outside the Canvas: "Area: ${"%.3f".format(area)}"
}
```

### Mechanical walkthrough

1. `minOf(integralStart!!, integralEnd!!)` / `maxOf(...)` — (first
   appearance) standard-library functions returning whichever argument is
   smaller/larger — used here so the shaded region works correctly
   regardless of which of the two markers the user dragged further left.
   The `!!` is safe specifically because this whole block is guarded by
   the surrounding `if (integralStart != null && integralEnd != null)`
   check — the same disciplined, narrow use of `!!` from Lesson 9.
2. `shadedPath.moveTo(...)` then a loop of `lineTo(...)` then a final
   `lineTo(...)` back down to the axis, then `.close()` — (hard concept
   reappearing) Lesson 13's `Path` mechanism, this time tracing a closed
   shape (up to the curve, across it, back down, closed) instead of just
   the curve itself, which is what makes it fillable rather than just a
   line.
3. `Color.Blue.copy(alpha = 0.3f)` — (first appearance) `.copy(...)` is
   available on `Color` (itself a `data class`-like type in Compose) the
   same way it's automatically available on any real `data class` (Lesson
   0) — producing a new color identical to `Color.Blue` except for
   `alpha`, Compose's transparency value (`0f` fully transparent, `1f`
   fully opaque) — a shaded region needs partial transparency so the axes
   and curve underneath stay visible through it.
4. `integral({ x -> evaluateFunction(functionText, x) }, a, b)` — (hard
   concept reappearing) Lesson 19's exact wrapping pattern, reused for a
   different numerical function.

### CS Lens

This is the **trapezoidal rule** — approximating the area under a curve as
a series of trapezoids (rather than the naive alternative of rectangles,
which the code's shape closely resembles but slightly improves on by
averaging each pair of adjacent sample heights) — a standard, simple
numerical integration technique, directly analogous to Lesson 19's
finite-difference derivative: both approximate a calculus concept from
sampled function values rather than a symbolic formula.

### SE Lens

Why `steps = 1000` as the default, not 10 or 100,000? More steps means
more accuracy but more `evaluateFunction` calls — for a function this
simple and a screen-sized region, `1000` is comfortably fast and accurate
to several decimal places, verified above. Lesson 22's coroutine-driven
animation is where a much larger sample count would start to visibly
affect performance, and where running this kind of work off the main
thread actually starts to matter.

### Connection

Both `derivative` (Lesson 19) and `integral` (this lesson) share the exact
same shape: wrap the app's `evaluateFunction` as a plain `(Double) ->
Double`, then apply a numerical formula that only needs that function
signature to work, regardless of what `evaluateFunction` actually computes
underneath.

---

## Closing

### Connect the pieces

`integral` (unit 1) approximates a definite integral by summing trapezoid
areas across many small steps, verified against a known-exact value.
Dragging two markers on the graph collects a start and end `x`; the region
between them is traced as a closed `Path` and filled with a
partially-transparent color, while the same `integral` function computes
the exact numeric area shown as text alongside it.

### What breaks without this

Change `steps` from `1000` to `2`, and re-run `integral(::f, 0.0, 3.0)`.
Real, observable failure: the result becomes visibly, badly wrong — with
only 2 steps, the trapezoidal approximation barely resembles `x²`'s actual
curve across `[0, 3]`, producing a number far from the true `9.0`. Restore
a larger step count and the result returns close to correct — direct,
hands-on proof that this method's accuracy genuinely depends on sample
density, the same lesson Lesson 15's intersection-detection step size
already taught once.

### Exercises

- Run `integral(::f, 0.0, 3.0, steps = 2)` yourself, note how far off it
  is, then try `steps = 10`, `100`, and `10000` and watch it converge
  toward `9.0`.
- Make the two integral-bound markers actually draggable on the canvas
  (reusing Lesson 14's `pointerInput` drag-detection idea) instead of set
  by two hardcoded values.

### Definition of done

- [ ] The shaded region and computed area both display correctly for a
      known function/bounds pair you've checked by hand or against a known
      exact answer.
- [ ] You ran `integral` with a deliberately low step count and observed
      the accuracy degrade.
- [ ] You can explain, concretely, the shared shape between this lesson's
      `integral` and Lesson 19's `derivative`.
- [ ] Commit: `git commit -m "Add numerical integration and shaded-area display using the trapezoidal rule"`.
