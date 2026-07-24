# Lesson 18: When "No Solution" Is Itself the Answer

*(Solving a 2×2 Linear System)*

**User Story**
> As a user, I want to enter a 2-equation, 2-unknown system and see its
> solution — or a clear message when there isn't a unique one.

**What you will build**
Six input fields (`a1 b1 c1 / a2 b2 c2`, for `a1·x + b1·y = c1` and
`a2·x + b2·y = c2`), a computed solution using Cramer's rule, and the
solution point plotted on Lesson 12's graph canvas.

**What you need to know first**
Lesson 17's `determinant()`. Lesson 7's `sealed class` result pattern —
this lesson reuses that exact shape for a new kind of failure.

---

## Concept Unit: `data object` — a Singleton With Real Equality

### The Problem

Lesson 7's `CalcResult.Error` carried a message string. This lesson's
failure case carries no data at all — "there is no unique solution" is the
entire fact, nothing more to attach. Representing that as a `data class`
with zero fields would work but is a slightly awkward fit; Kotlin has a
more direct tool.

### Introduce the concept in isolation

```kotlin
sealed class SolveResult {
    data class Unique(val x: Double, val y: Double) : SolveResult()
    object NoUniqueSolution : SolveResult()
}
```

Run a quick check:

```kotlin
println(SolveResult.NoUniqueSolution)
```

Real output — verified this session, plain `object`:

```text
Cramer$SolveResult$NoUniqueSolution@5cb4ba80
```

*What this proves:* a plain `object` — Kotlin's syntax for a class with
exactly one instance, guaranteed — does **not** get `data class`'s free
`toString()`; it falls back to the same hashcode-based default `Object`
behavior Lesson 0's Java `PointDemo` example showed. Now add `data` in
front:

```kotlin
data object NoUniqueSolution : SolveResult()
```

Real output — verified this session:

```text
NoUniqueSolution
```

*What this proves:* `data object` (available in modern Kotlin) gives a
singleton the same readable `toString()` a `data class` gives an instance
type — the fix is one keyword, and it's the direct continuation of Lesson
0's very first `data class` lesson, now applied to a type with no fields
at all.

### Discard the throwaway examples

Deleted. `SolveResult` moves into `LinearAlgebra.kt` as a real, permanent
type.

### CS Lens

`object` is Kotlin's built-in **singleton** — the language guarantees
exactly one instance exists, no separate `getInstance()` boilerplate the
way Java's classic singleton pattern requires. `data object` layers
`data class`-style `equals`/`toString` on top of that guarantee.

### Connection

`SolveResult` is used directly in the next unit's `solve2x2` function.

---

## Concept Unit: Cramer's Rule, Reusing Lesson 17's Determinant

### The Problem

A 2×2 linear system — two equations, two unknowns — has a closed-form
solution using determinants directly: **Cramer's Rule**. Lesson 17's
`determinant()` already computes exactly the value this needs.

### The New Code

```kotlin
sealed class SolveResult {
    data class Unique(val x: Double, val y: Double) : SolveResult()
    data object NoUniqueSolution : SolveResult()
}

fun solve2x2(a1: Double, b1: Double, c1: Double, a2: Double, b2: Double, c2: Double): SolveResult {
    val d = a1 * b2 - a2 * b1
    if (d == 0.0) return SolveResult.NoUniqueSolution
    val dx = c1 * b2 - c2 * b1
    val dy = a1 * c2 - a2 * c1
    return SolveResult.Unique(dx / d, dy / d)
}
```

Run it as a throwaway check first:

```kotlin
println(solve2x2(2.0, 1.0, 5.0, 1.0, -1.0, 1.0))
println(solve2x2(1.0, 2.0, 3.0, 2.0, 4.0, 6.0))
```

Real output — verified this session:

```text
Unique(x=2.0, y=1.0)
NoUniqueSolution
```

*What this proves:* `2x + y = 5, x - y = 1` correctly solves to
`(2, 1)` — check by hand: `2(2)+1=5` ✓, `2-1=1` ✓. The second system,
`x + 2y = 3, 2x + 4y = 6`, is really the *same line* scaled by 2 — every
point satisfying the first equation also satisfies the second — so there's
no single unique solution, and `d` (the determinant `a1·b2 − a2·b1`)
correctly comes out to exactly `0.0`, triggering `NoUniqueSolution` — the
exact same "linearly dependent rows → zero determinant" fact Lesson 17's
`singular` example already demonstrated.

### Discard the throwaway check

Deleted. `solve2x2` becomes the Linear Algebra screen's real solver.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `LinearAlgebra.kt`; the `"linear-algebra"` route's
  composable (Lesson 16).
- **Change type:** Add.
- **Location:** Below Lesson 16's vector UI.
- **Dependencies:** None new.

### The Updated Project

```kotlin
var a1 by remember { mutableStateOf("2") }
var b1 by remember { mutableStateOf("1") }
var c1 by remember { mutableStateOf("5") }
var a2 by remember { mutableStateOf("1") }
var b2 by remember { mutableStateOf("-1") }
var c2 by remember { mutableStateOf("1") }

val result = solve2x2(
    a1.toDoubleOrNull() ?: 0.0, b1.toDoubleOrNull() ?: 0.0, c1.toDoubleOrNull() ?: 0.0,
    a2.toDoubleOrNull() ?: 0.0, b2.toDoubleOrNull() ?: 0.0, c2.toDoubleOrNull() ?: 0.0
)

Text(
    text = when (result) {
        is SolveResult.Unique -> "x = ${"%.2f".format(result.x)}, y = ${"%.2f".format(result.y)}"
        SolveResult.NoUniqueSolution -> "No unique solution — the two equations describe the same line, or parallel lines"
    }
)
```

### Mechanical walkthrough

1. `SolveResult.NoUniqueSolution` used directly as a `when` branch with no
   `is` prefix — (first appearance in this file) matching a `data object`
   in a `when` compares by identity/equality directly, since there's only
   ever one instance — no type-check syntax (`is ...`) needed, unlike
   matching `is SolveResult.Unique` on the line above it, which does need
   `is` because it's checking a type with actual fields to smart-cast.
2. `"%.2f".format(result.x)` — (hard concept reappearing) Lesson 16's
   number-formatting pattern, reused for readable output instead of a raw
   `Double`'s full precision.

### CS Lens

Cramer's Rule is a direct, closed-form application of determinants to
solving a linear system — no iteration, no approximation, exact for any
2×2 (or, generalized, any *n*×*n*) system with a non-zero determinant. This
is the "solve it exactly" counterpart to Lesson 15's approximate,
sampling-based intersection detection — worth naming the contrast: two
different tools for two related but distinct questions ("where do these
two lines cross" vs. "solve this system exactly").

### SE Lens

Why check `d == 0.0` with exact equality, when Lesson 9 already
demonstrated real floating-point imprecision (`sin(30°) ≠ 0.5` exactly)?
This is a genuine, honest simplification: a production-grade solver would
check `abs(d) < someSmallTolerance` instead, to catch "numerically
singular" systems where rounding error alone might produce a tiny non-zero
value for a mathematically-exact zero. This lesson's exact check is
simpler and correct for the common case (integer or clean-decimal
coefficients), with the tolerance-based version left as a natural
extension once you've felt where it matters.

### Connection

The `SolveResult.Unique` point plots directly onto Lesson 12's graph
canvas as an exercise — the same `mathX`/`mathY`-to-`Offset` conversion
Lesson 13 already established, applied to one point instead of a sampled
curve.

---

## Closing

### Connect the pieces

`data object` (unit 1) gives `NoUniqueSolution` clean equality and
printing, the same payoff Lesson 0's `data class` gave `Point`, now for a
singleton. `solve2x2` (unit 2) applies Cramer's Rule, using exactly the
determinant formula Lesson 17 already built and verified, to either
produce a `Unique` solution or correctly detect the zero-determinant case
as `NoUniqueSolution`.

### What breaks without this

Change `if (d == 0.0)` to `if (d < 0.0)` (a plausible typo — checking sign
instead of zero). Real, observable failure: `solve2x2(1.0, 2.0, 3.0, 2.0,
4.0, 6.0)` (the dependent system, `d = 0.0`) no longer triggers
`NoUniqueSolution` — `0.0 < 0.0` is `false` — and the function proceeds to
divide `dx`/`dy` by `d = 0.0`, silently producing `Infinity` or `NaN`
instead of the honest "no solution" answer. Restore `== 0.0` and the
dependent system is caught correctly again.

### Exercises

- Plot the `Unique` solution point on the graph canvas from Epic 4,
  reusing Lesson 13's coordinate-mapping math for a single point instead
  of a sampled curve.
- Extend `solve2x2` conceptually to 3×3 (three equations, three unknowns) —
  research Cramer's Rule for a 3×3 system and decide what new type(s) you'd
  need (a `Matrix3`? A generalized `Matrix` sized at runtime?).

### Definition of done

- [ ] A 2×2 system solves correctly for a real, checkable example.
- [ ] A dependent (or parallel/inconsistent) system correctly reports
      `NoUniqueSolution` instead of `Infinity`/`NaN`.
- [ ] You can explain, concretely, why a zero determinant means "no unique
      solution," connecting it back to Lesson 17's `singular` matrix
      example.
- [ ] Commit: `git commit -m "Solve 2x2 linear systems with Cramer's Rule, reusing the determinant from Lesson 17"`.
