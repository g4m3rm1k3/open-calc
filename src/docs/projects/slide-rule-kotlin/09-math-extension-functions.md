# Lesson 9: Adding a Method to a Type You Don't Own

*(Scientific Functions via Extension Functions)*

**User Story**
> As a user, I want `sin`, `cos`, and `√` buttons that actually compute
> correct trigonometric and root results.

**What you will build**
Four new buttons — `sin`, `cos`, `√`, and `x²` — added to the grid, each
calling a real math function against the number currently on the display.

**What you need to know first**
Lesson 6's `evaluate`, Lesson 0's extension-function mechanism (briefly
introduced with a throwaway `String.shout()` example there; this lesson is
where it does real work for the first time).

---

## Concept Unit: `kotlin.math` and a Real Extension Function

### The Problem

`kotlin.math` provides `sin`, `cos`, `sqrt`, and friends — but they expect
**radians**, and a calculator's trig buttons are more natural in degrees.
Converting requires multiplying by `π/180` every time it's needed — exactly
the kind of small, repeated operation an extension function is for.

### Introduce the concept in isolation

```kotlin
import kotlin.math.PI
import kotlin.math.sin

fun Double.toRadians(): Double = this * PI / 180.0

println(sin(90.0.toRadians()))
println(sin(30.0.toRadians()))
```

Run it:

```bash
kotlin mathext.kts
```

Real output — verified this session:

```text
1.0
0.49999999999999994
```

*What this proves:* `90.0.toRadians()` reads exactly like a built-in method
on `Double`, even though `toRadians()` is defined in this file, not by
Kotlin's own `Double` class. The second line is worth stopping on: `sin(30°)`
mathematically equals exactly `0.5`, but the real output is
`0.49999999999999994` — a genuine, visible instance of **floating-point
representation error** (this curriculum's WPF course names this same idea
directly): `Double` cannot represent every real number exactly, and
`π/180` multiplied through introduces a tiny, real rounding error. This
matters concretely for Lesson 15 — comparing two computed `Double`s with
`==` to check "do these functions cross here?" needs a tolerance, not exact
equality, for exactly this reason.

### Discard the throwaway example

Deleted. `toRadians()` (Kotlin's standard library actually already ships an
equivalent, `Double.toRadians` via `kotlin.math`— worth knowing, though
writing your own here is the point of the lesson) moves into the real app.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `MathExtensions.kt`; `buttons` list and
  `onButtonPressed` in the calculator screen.
- **Change type:** Add.
- **Location:** `buttons` list from Lesson 5; a new branch in
  `onButtonPressed`'s `when`.
- **Dependencies:** None new.

### The New Code

```kotlin
import kotlin.math.PI
import kotlin.math.sin
import kotlin.math.cos
import kotlin.math.sqrt

fun Double.toRadians(): Double = this * PI / 180.0
```

### The Updated Project

```kotlin
val buttons = listOf(
    "sin", "cos", "√", "x²",       // ← new row
    "7", "8", "9", "÷",
    "4", "5", "6", "×",
    "1", "2", "3", "−",
    "C", "0", "=", "+"
)

fun onButtonPressed(label: String) {
    expression = when (label) {
        "C" -> ""
        "sin" -> sin(expression.toDoubleOrNull()?.toRadians() ?: 0.0).toString()   // ← new
        "cos" -> cos(expression.toDoubleOrNull()?.toRadians() ?: 0.0).toString()   // ← new
        "√"   -> sqrt(expression.toDoubleOrNull() ?: 0.0).toString()               // ← new
        "x²"  -> ((expression.toDoubleOrNull() ?: 0.0).let { it * it }).toString() // ← new
        "=" -> when (val result = safeEvaluate(expression)) {
            is CalcResult.Ok -> { history.add(CalculationEntry(expression, result.value.toString())); result.value.toString() }
            is CalcResult.Error -> result.message
        }
        else -> expression + label
    }
}
```

### Mechanical walkthrough

1. `expression.toDoubleOrNull()` — (first appearance) a standard-library
   extension function on `String` — the same mechanism this lesson's own
   `toRadians()` uses, provided by Kotlin itself this time. Returns the
   parsed `Double`, or `null` if `expression` isn't a valid number (an
   in-progress expression like `"7+"`) — a safe alternative to `toDouble()`,
   which would throw.
2. `?: 0.0` — (hard concept reappearing) Lesson 0's Elvis operator, supplying
   a fallback when `toDoubleOrNull()` returns `null`. This is a deliberately
   simple, honest scope cut: pressing `sin` mid-expression (`"7+"`) silently
   treats it as `0`, rather than composing with the pending operator — a
   real limitation worth naming, not hiding, and a natural thing to improve
   yourself later.
3. `.toRadians()` — this lesson's own extension function, called directly
   on the result of the Elvis expression.
4. `(expression.toDoubleOrNull() ?: 0.0).let { it * it }` — (first
   appearance) `.let { ... }` is a **scope function** — it calls the lambda
   with the receiver as `it` and returns the lambda's result; used here
   purely to avoid naming an intermediate variable just to square it once.

### CS Lens

Reappearing directly from Lesson 0: extension functions add behavior to a
type from outside it, resolved entirely at compile time — `toRadians()`
compiles to an ordinary static call, never modifying `Double` itself.

### SE Lens

Why write `toRadians()` here at all when Kotlin's standard library already
has one? Partly pedagogical — but also a real, general principle: a tiny,
well-named extension function documents intent at the call site
(`90.0.toRadians()` reads as a sentence) far better than an inline
`* PI / 180.0` repeated at every trig button, which a reader has to
recognize as "oh, that's a radian conversion" each time instead of being
told directly by a name.

### Connection

Lesson 10 replaces this lesson's four separate `when` branches
(`"sin"`, `"cos"`, `"√"`, `"x²"`) with one dispatch table — the repetition
here is deliberate, so the pain of four near-identical branches is felt
before the fix arrives.

---

## Closing

### Connect the pieces

`toRadians()` (a real extension function) converts degrees to radians;
`kotlin.math`'s `sin`/`cos`/`sqrt` compute the actual trig/root values;
`toDoubleOrNull()` (the same mechanism, from Kotlin's own standard library)
safely reads the current display as a number before any of that math runs.

### What breaks without this

Remove the `?: 0.0` from the `"sin"` branch, leaving
`sin(expression.toDoubleOrNull()!!.toRadians())`. Press `sin` while the
display shows an in-progress expression like `"7+"` (which
`toDoubleOrNull()` can't parse). Real, observable failure: a
`NullPointerException` crash — exactly Lesson 0's `!!` warning, now causing
a real app crash instead of a scratch-script demo. Restore `?: 0.0` and the
app degrades gracefully instead of crashing.

### Exercises

- Add a `tan` button, reusing `toRadians()`.
- Confirm `sin(30.0.toRadians())` really does print
  `0.49999999999999994` on your device, not a clean `0.5` — this is real
  IEEE 754 behavior, not a bug in this lesson's code.

### Definition of done

- [ ] `sin`, `cos`, `√`, and `x²` buttons compute correct results.
- [ ] Pressing a trig button on an incomplete expression doesn't crash.
- [ ] You can explain, concretely, why `sin(30°)` didn't print exactly
      `0.5`.
- [ ] Commit: `git commit -m "Add scientific functions via a real toRadians extension function"`.
