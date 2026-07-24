# Lesson 10: Functions as Values — A Dispatch Table

*(A Deg/Rad Toggle for Every Trig Button at Once)*

**User Story**
> As a user, I want a single Deg/Rad switch that changes how every trig
> button behaves, without four separate `if` checks scattered through the
> code.

**What you will build**
Lesson 9's four separate `when` branches (`"sin"`, `"cos"`, `"√"`, `"x²"`)
collapse into one dispatch table, and a Deg/Rad toggle changes `sin`/`cos`'s
behavior for all buttons at once from one place.

**What you need to know first**
Lesson 9's four trig branches — this lesson exists specifically because
they were repetitive; feel that repetition before reading the fix.

---

## Concept Unit: A Function Type as a Map's Value

### The Problem

Lesson 9 hardcoded degree-to-radian conversion into `sin` and `cos`
specifically, leaving `√` and `x²` untouched (they don't need it) — but
adding a Deg/Rad toggle means every trig function needs to consult one
shared setting, and the current four-branch `when` has no single place to
put that check.

### Introduce the concept in isolation

```kotlin
import kotlin.math.sin
import kotlin.math.cos
import kotlin.math.sqrt

val operations: Map<String, (Double) -> Double> = mapOf(
    "sin" to { x: Double -> sin(x) },
    "cos" to { x: Double -> cos(x) },
    "sqrt" to { x: Double -> sqrt(x) }
)

fun apply(name: String, value: Double): Double {
    val fn = operations[name] ?: error("Unknown operation: $name")
    return fn(value)
}

println(apply("sqrt", 16.0))
println(apply("sin", 0.0))
```

Run it:

```bash
kotlin dispatch.kts
```

Real output — verified this session:

```text
4.0
0.0
```

*What this proves:* `operations` is a `Map` whose **values are themselves
functions**, not numbers or strings. Looking up `"sqrt"` returns the
`sqrt`-wrapping lambda itself, which `apply` then calls as `fn(value)` —
adding a new operation later means adding one line to `operations`, never
touching `apply`'s logic at all.

### Discard the throwaway example

Deleted. The real dispatch table wraps degree conversion into `sin`/`cos`'s
entries specifically, driven by a toggle.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** The calculator screen's file.
- **Change type:** Replace Lesson 9's four `when` branches.
- **Location:** `onButtonPressed`'s `when` block.
- **Dependencies:** Lesson 9's `toRadians()`.

### The New Code

```kotlin
var isDegreeMode by remember { mutableStateOf(true) }

val operations: Map<String, (Double) -> Double> = mapOf(
    "sin" to { x -> sin(if (isDegreeMode) x.toRadians() else x) },
    "cos" to { x -> cos(if (isDegreeMode) x.toRadians() else x) },
    "√"   to { x -> sqrt(x) },
    "x²"  to { x -> x * x }
)
```

### The Updated Project

```kotlin
fun onButtonPressed(label: String) {
    expression = when (label) {
        "C" -> ""
        in operations.keys -> {                                          // ← changed
            val fn = operations[label] ?: return
            fn(expression.toDoubleOrNull() ?: 0.0).toString()
        }
        "=" -> when (val result = safeEvaluate(expression)) {
            is CalcResult.Ok -> { history.add(CalculationEntry(expression, result.value.toString())); result.value.toString() }
            is CalcResult.Error -> result.message
        }
        else -> expression + label
    }
}
```

Lesson 9's four separate branches (`"sin" -> ...`, `"cos" -> ...`, `"√" ->
...`, `"x²" -> ...`) are gone, replaced by one `in operations.keys` branch
that works for all of them — and, unlike Lesson 9's version, `sin`/`cos`
now correctly respect `isDegreeMode` from one shared toggle.

### Mechanical walkthrough

1. `var isDegreeMode by remember { mutableStateOf(true) }` — (hard concept
   reappearing) Lesson 2's exact state pattern, now representing a mode
   toggle instead of a display value.
2. `Map<String, (Double) -> Double>` — (first appearance as an explicit type
   annotation) `(Double) -> Double` reads as "a function taking one
   `Double`, returning a `Double`" — the type every value in this map must
   have.
3. `"sin" to { x -> sin(if (isDegreeMode) x.toRadians() else x) }` — `to`
   builds a key-value pair (Kotlin's infix syntax for constructing a
   `Pair`); the lambda captures `isDegreeMode` from its surrounding scope —
   every time this lambda runs, it reads the *current* value of
   `isDegreeMode`, not whatever it was when the map was built.
4. `label in operations.keys` — (first appearance) Kotlin's `in` operator
   checking collection membership — reads directly as "is `label` one of
   `operations`' keys."
5. `operations[label] ?: return` — (hard concept reappearing) `Map`
   indexing returns `T?` (nullable — the key might not exist), handled with
   Lesson 0's Elvis operator; `return` here exits `onButtonPressed` early,
   which is safe only because this branch is unreachable in practice (the
   `in operations.keys` check already guarantees the key exists) — a small,
   honest redundancy favoring clarity over a `!!`.

### CS Lens

This is a **dispatch table** — the exact pattern this repo's OpenMAT
project uses for its built-in functions, and the WPF course's own
`BUILT_IN_FUNCTIONS` dispatch table, arrived at for the identical reason
here: replacing a chain of `if`/`when` branches that all have the same
shape with one data structure mapping a name to the behavior it triggers.
Functions being storable as ordinary values — in a `Map`, passed as
arguments, returned from other functions — is called **first-class
functions**, and it's what makes this pattern possible at all in Kotlin.

Also recognized in: JavaScript's object-as-dispatch-table pattern, Python's
`dict` of functions, and any real compiler or interpreter's opcode-to-handler
table.

### SE Lens

This is the **open/closed principle** (reappearing — the exact principle
this curriculum's projects.md README names for the WPF/OpenMAT dispatch
tables too): adding a tenth trig-like button means adding one entry to
`operations`, never touching `onButtonPressed`'s branching logic — existing
code is closed for modification, new behavior is open for addition by
extending the map. Lesson 9's four hardcoded branches were the version this
principle explicitly argues against: adding an 11th function there would
have meant a fifth near-identical `when` branch, and the Deg/Rad toggle
would have needed editing all four separately instead of once.

### Connection

Epic 7's formula screen (Lesson 21) reaches for a `sealed class` instead of
a dispatch table for a deliberately different reason — worth contrasting
directly, once you get there, with why a `Map` was the right tool here.

---

## Closing

### Connect the pieces

`operations` (unit 1) maps each trig-like button label to a real
`(Double) -> Double` function, closing over `isDegreeMode` so the shared
toggle affects every entry that reads it. `onButtonPressed`'s `in
operations.keys` branch (previously four separate branches in Lesson 9)
looks up and calls whichever function matches the pressed button —
`sin`/`cos` now correctly honor Deg/Rad mode from one place.

### What breaks without this

Add a fifth function (e.g., `"tan"`) to `buttons` but forget to add a
corresponding entry to `operations`. Real, observable failure: pressing
"tan" falls through to the `else -> expression + label` branch instead of
computing tangent — the literal text "tan" gets appended to the display,
silently wrong rather than a crash, because `in operations.keys` correctly
evaluates to `false` and Kotlin's `when` just moves to the next branch.
Add the missing `"tan" to { x -> tan(...) }` entry and it computes
correctly.

### Exercises

- Add a real Deg/Rad `Switch` (Lesson 3's mechanism) to the UI, driving
  `isDegreeMode`, and confirm `sin(90)` gives `1.0` in degree mode and a
  very different number in radian mode.
- Add `"ln"` and `"log"` entries to `operations`, reusing `kotlin.math.ln`
  and `kotlin.math.log10`.

### Definition of done

- [ ] All four trig/root buttons work through one shared `operations` map.
- [ ] A Deg/Rad toggle correctly changes `sin`/`cos`'s results.
- [ ] You can explain, concretely, why this is the open/closed principle in
      action, using this lesson's own before/after as the example.
- [ ] Commit: `git commit -m "Replace per-button trig branches with a single dispatch table, honoring a shared Deg/Rad mode"`.
