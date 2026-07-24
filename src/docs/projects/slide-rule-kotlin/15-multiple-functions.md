# Lesson 15: Two Curves, One Canvas

*(Multiple Functions and Visual Intersections)*

**User Story**
> As a user, I want to graph two functions at once and see roughly where
> they cross.

**What you will build**
A second function input, its own curve drawn in a different color on the
same axes, and small markers at the points where the two curves visibly
cross.

**What you need to know first**
Lesson 13's sampling and `Path` drawing, Lesson 14's pan/zoom state.

---

## Concept Unit: A Second Curve Is the Same Loop, Called Again

### The Problem

Drawing a second function correctly should not mean duplicating Lesson
13's entire sampling loop with different variable names — that's exactly
the kind of repetition Lesson 10 already pushed back against once.

### The New Code

```kotlin
fun buildPath(functionText: String, size: Size, centerX: Float, centerY: Float, scale: Float): Path {
    val path = Path()
    var isFirstPoint = true
    for (screenX in 0..size.width.toInt() step 2) {
        val mathX = (screenX - centerX) / scale
        val mathY = evaluateFunction(functionText, mathX.toDouble())
        val screenY = centerY - mathY.toFloat() * scale
        if (isFirstPoint) { path.moveTo(screenX.toFloat(), screenY); isFirstPoint = false }
        else { path.lineTo(screenX.toFloat(), screenY) }
    }
    return path
}
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** The `"graph"` route's composable.
- **Change type:** Extract Lesson 13's inline loop into `buildPath`; add a
  second function input and a second `drawPath` call.
- **Location:** Replacing the inline sampling code inside `Canvas` from
  Lessons 13–14.
- **Dependencies:** `evaluateFunction`.

### The Updated Project

```kotlin
var functionText by remember { mutableStateOf("x^2") }
var secondFunctionText by remember { mutableStateOf("x+2") }   // ← new

// inside Canvas:
val path1 = buildPath(functionText, size, centerX, centerY, scale)
val path2 = buildPath(secondFunctionText, size, centerX, centerY, scale) // ← new
drawPath(path1, color = Color.Blue, style = Stroke(width = 4f))
drawPath(path2, color = Color.Red, style = Stroke(width = 4f))           // ← new
```

Both curves now render on the same axes, in different colors, each fully
respecting Lesson 14's pan and zoom via the shared `centerX`/`centerY`/
`scale` values passed into both calls.

### Mechanical walkthrough

1. `fun buildPath(functionText: String, size: Size, centerX: Float, centerY: Float, scale: Float): Path`
   — a plain, extracted function — nothing new syntactically, but a real
   design decision: everything the loop needs is passed in explicitly as a
   parameter, rather than reading `centerX`/`centerY`/`scale` from
   surrounding closure state, which is what let Lesson 13's original inline
   version get away with fewer parameters — extracting a function forces
   naming exactly what it depends on.
2. `buildPath(functionText, ...)` / `buildPath(secondFunctionText, ...)` —
   the same function, called twice with different arguments — this is the
   entire fix: one loop, reused, instead of two copies.

### CS Lens

This is ordinary **function reuse** — worth naming plainly rather than
inflating into a bigger concept than it is. The real lesson is the
*judgment call* of when duplication (Lesson 13's original inline loop, fine
for one curve) becomes worth extracting (the moment a second curve needs
the identical logic) — extracting too early, before a second real use
case exists, is its own kind of premature complexity.

---

## Concept Unit: Detecting a Visual Crossing

### The Problem

"Where do these two curves cross" is a real numerical question — the exact
`x` where `f1(x) = f2(x)`. This app doesn't have a proper root-finder yet
(Newton's method or bisection, the kind this repo's Calculator project
uses); a much simpler, purely visual approach is enough to "touch on" the
idea without building a real solver.

### Introduce the concept in isolation

```kotlin
fun f1(x: Double) = x * x
fun f2(x: Double) = x + 2

var previousDiff = f1(-5.0) - f2(-5.0)
val crossings = mutableListOf<Double>()
var x = -5.0
while (x <= 5.0) {
    val diff = f1(x) - f2(x)
    if (previousDiff * diff < 0.0) {
        crossings.add(x)
    }
    previousDiff = diff
    x += 0.01
}
println(crossings.map { "%.2f".format(it) })
```

Run it:

```bash
kotlin intersect.kts
```

Real output — verified this session:

```text
[-0.99, 2.01]
```

*What this proves:* `x² = x + 2` has exact algebraic solutions at `x = -1`
and `x = 2` — this sampling-based approach finds them approximately
(`-0.99`, `2.01`), close but not exact, because it's detecting where
`f1(x) - f2(x)` changes sign between two sampled points `0.01` apart,
rather than solving the equation directly. `previousDiff * diff < 0.0` is
true exactly when one of the two values is positive and the other
negative — the sign flipped, meaning the true crossing point lies
somewhere between this sample and the previous one.

### Discard the throwaway example

Deleted. The real version reuses `evaluateFunction` for both curves and
draws a small circle at each detected crossing, using screen coordinates
already established by Lesson 13's mapping.

### CS Lens

This is the same **sign-change / bisection family** of idea this repo's
Calculator project uses for its own root-finder, simplified to "detect and
report" instead of "detect and narrow down precisely" — a real, honest
approximation, not a full numerical method.

### SE Lens

Why not build a real root-finder here? Because this course's scope is
explicitly to touch on ideas you can extend later — a proper bisection or
Newton's-method solver (which Lesson 19's derivative work puts you one
step closer to, since Newton's method needs a derivative) is a genuinely
good next feature for you to add on your own, using exactly the numerical
derivative Lesson 19 builds.

### Connection

Lesson 19's derivative and Lesson 20's integral both reuse this same
sample-across-a-range shape — a recurring pattern in this app, not a
one-off for intersections alone.

---

## Closing

### Connect the pieces

`buildPath` (unit 1) turns one function into a drawable curve; called
twice, it draws two curves on the same axes with no duplicated loop code.
The sign-change scan (unit 2) reuses the same idea — evaluate both
functions across a range — to approximate where they cross, without a full
numerical solver.

### What breaks without this

Change the sign-change scan's step size from `0.01` to `1.0` and re-run
`intersect.kts`. Real, observable failure: the reported crossings become
noticeably less accurate, or one of the two real crossings may be missed
entirely if the sign genuinely flips and flips back within one oversized
step. Restore a small step size and both crossings are found accurately
again — direct, hands-on proof that this method's accuracy is tied
directly to sample density, unlike a true analytic solution.

### Exercises

- Add a third function input and a third `drawPath` call, confirming
  `buildPath`'s extraction makes this a small addition, not a rewrite.
- Try the sign-change scan on two functions that never cross (e.g., `x^2`
  and `x^2 + 5`) and confirm `crossings` comes back empty.

### Definition of done

- [ ] Two functions plot simultaneously in different colors.
- [ ] Approximate intersection points are marked on screen.
- [ ] You can explain, concretely, why this approach can miss a crossing
      that a true numerical solver wouldn't.
- [ ] Commit: `git commit -m "Support two simultaneous functions and mark their approximate intersections"`.
