# Lesson 11: State That Survives Rotation, Compose's Way

*(Memory Buttons — M+, M-, MR, MC)*

**User Story**
> As a user, I want M+/M-/MR/MC memory buttons, and I don't want my memory
> value wiped out just because I rotated my phone.

**What you will build**
Four memory buttons and a small memory indicator, backed by a real
`ViewModel` instead of `remember` — the first state in this app that
survives configuration changes.

**What you need to know first**
Lesson 2's `remember`/state hoisting. From `../track/`: Lesson 15,
`ViewModel` — "state that survives rotation." Same class, same purpose;
this lesson's whole point is showing how it's *consumed* differently from
Compose.

---

## Concept Unit: Why `remember` Alone Isn't Enough

### The Problem

Every piece of state built so far (`expression`, `history`, `isDegreeMode`)
lives in `remember { mutableStateOf(...) }`, scoped to one composable call.
`../track/` Lesson 15 already established exactly why that's not always
enough: an Activity is destroyed and recreated on rotation (and several
other configuration changes), and anything living only in that Activity's
current instance — a plain field in Java, or a `remember`-held value in
Compose — is lost and recreated from scratch.

`remember` alone survives *recomposition* (Lesson 2), but not
**configuration changes** — rotating the device destroys and recreates the
whole Activity hosting the Compose UI, taking ordinary `remember`ed state
with it. (Compose has a separate `rememberSaveable` that survives simple
configuration changes for small values — genuinely useful, but a
`ViewModel` is the right tool here since Epic 8 needs this same memory
value to eventually be testable and shareable across screens.)

### CS Lens

Reappearing directly: `../track/` Lesson 15 already named this the
Activity-recreation problem. Nothing new to prove here — the fix is what's
new.

---

## Concept Unit: `viewModel()` in Compose

### The Problem

`../track/` obtained a `ViewModel` inside a Fragment or Activity via
`ViewModelProvider`. Compose has its own, simpler accessor.

### Project Change

- **Reference Source:** No reference counterpart — same `ViewModel` base
  class as `../track/` Lesson 15, a different consumption API.
- **Files affected:** New file `CalculatorViewModel.kt`; the calculator
  screen's composable.
- **Change type:** Add.
- **Location:** Memory state moves out of the composable entirely.
- **Dependencies:** `androidx.lifecycle:lifecycle-viewmodel-compose`.

### The New Code

```kotlin
class CalculatorViewModel : ViewModel() {
    var memory by mutableStateOf(0.0)
        private set

    fun memoryAdd(value: Double) { memory += value }
    fun memorySubtract(value: Double) { memory -= value }
    fun memoryClear() { memory = 0.0 }
}
```

### The Updated Project

```kotlin
composable("calculator") {
    val calculatorViewModel: CalculatorViewModel = viewModel()   // ← new
    var expression by remember { mutableStateOf("") }
    // ... existing history, operations, onButtonPressed from Lessons 5–10 ...

    fun onButtonPressed(label: String) {
        expression = when (label) {
            "C" -> ""
            "M+" -> { calculatorViewModel.memoryAdd(expression.toDoubleOrNull() ?: 0.0); expression }      // ← new
            "M-" -> { calculatorViewModel.memorySubtract(expression.toDoubleOrNull() ?: 0.0); expression } // ← new
            "MR" -> calculatorViewModel.memory.toString()                                                   // ← new
            "MC" -> { calculatorViewModel.memoryClear(); expression }                                       // ← new
            in operations.keys -> { /* unchanged from Lesson 10 */ "" }
            "=" -> { /* unchanged from Lesson 7 */ "" }
            else -> expression + label
        }
    }

    Text(text = "M: ${calculatorViewModel.memory}", fontSize = 12.sp)   // ← new, memory indicator
    // ... rest of the screen unchanged ...
}
```

### Mechanical walkthrough

1. `class CalculatorViewModel : ViewModel()` — (hard concept reappearing)
   the exact same `androidx.lifecycle.ViewModel` base class from
   `../track/` Lesson 15 — no new class to learn.
2. `var memory by mutableStateOf(0.0) private set` — (first appearance)
   this `ViewModel` exposes its state as `mutableStateOf` directly (Lesson
   2's mechanism), so a Compose screen reading it recomposes automatically
   on change — `../track/`'s Java `ViewModel`s instead exposed `LiveData`,
   observed differently (Lesson 24 revisits this contrast in depth).
   `private set` restricts *writing* `memory` to inside the class — callers
   can read it but must go through `memoryAdd`/`memorySubtract`/`memoryClear`
   to change it.
3. `val calculatorViewModel: CalculatorViewModel = viewModel()` — (first
   appearance) `viewModel()` is a Compose function that either creates a
   `CalculatorViewModel` the first time this screen is shown, or returns
   the *same instance* on every subsequent call — including after a
   rotation recreates the Activity — because Android's `ViewModelStore`
   (the mechanism `../track/` Lesson 15 already covers) keeps it alive
   independent of the Activity's own lifecycle.

### CS Lens

Nothing new here computationally — this is `../track/` Lesson 15's
mechanism, reused. The interesting contrast is architectural: Compose reads
`ViewModel` state directly as `mutableStateOf` (or, Lesson 24, `StateFlow`
via `collectAsState()`), collapsing the "observe LiveData, update a View"
step that Fragment-based UIs needed into automatic recomposition.

### SE Lens

Why keep memory in a `ViewModel` at all, instead of just using `remember`
for it too, the same as `expression`? Because memory, unlike the current
in-progress expression, is exactly the kind of value a user reasonably
expects to survive a rotation (imagine mid-calculation, rotating to
landscape to see the graph screen, and having your stored memory value
silently reset) — `../track/` Lesson 15 made precisely this judgment call
about *which* state deserves `ViewModel` treatment, and the same judgment
applies here.

### Connection

Lesson 24 replaces `mutableStateOf` inside this `ViewModel` with
`StateFlow` — a deliberate upgrade, once Epic 8's persistence needs a form
of state that survives process death, not just rotation.

---

## Closing

### Connect the pieces

`remember` (Lesson 2) survives recomposition but not Activity recreation —
the exact gap `../track/` Lesson 15 already identified for `ViewModel` to
fill. `CalculatorViewModel` holds `memory` as `mutableStateOf`, obtained via
Compose's `viewModel()` function instead of `../track/`'s
`ViewModelProvider` — same underlying class and lifecycle guarantee,
different, simpler accessor.

### What breaks without this

Move `memory` back into `remember { mutableStateOf(0.0) }` inside the
composable, store a value with M+, then rotate the device. Real,
observable failure: memory resets to `0.0` — the Activity was destroyed and
recreated, and `remember`'s value went with it. Move it back into the
`ViewModel` and the value survives rotation correctly.

### Exercises

- Add an `MS` (memory store — overwrite, not add) button.
- Confirm, by adding a `println` inside `CalculatorViewModel`'s
  initializer, that it only prints once across several rotations — proof
  the same instance really is being reused, not recreated.

### Definition of done

- [ ] M+/M-/MR/MC all work correctly.
- [ ] Memory survives a device rotation.
- [ ] You can state, concretely, what's the same and what's different
      between this and `../track/` Lesson 15's `ViewModel` usage.
- [ ] Commit: `git commit -m "Move memory state into a ViewModel — survives rotation, unlike remember"`.
