# Lesson 21: A Sealed Class Payoff — Formulas as a Closed Set

*(A Physics Formula Screen)*

**User Story**
> As a user, I want to pick "Kinematics" or "Projectile Range," enter
> values, and get a real computed physics answer.

**What you will build**
A fourth screen: a picker for a formula type, inputs specific to whichever
one is selected, and a computed result.

**What you need to know first**
Lesson 7's `sealed class`/exhaustive `when` — this lesson is the deeper,
richer second appearance of that exact pattern, per this curriculum's own
Repetition Rule: not a repeat of the same lesson, a harder, more realistic
use of the same idea.

---

## Concept Unit: `Formula` as a Sealed Hierarchy of Different Shapes

### The Problem

Lesson 7's `CalcResult` had two subtypes shaped almost identically (a
`Double`, or a `String` message). Real physics formulas are more varied:
kinematics needs an initial velocity, an acceleration, and a time;
projectile range needs a speed and a launch angle — genuinely different
sets of inputs, not a shared shape with different labels.

### Introduce the concept in isolation

```kotlin
sealed class Formula {
    data class Kinematics(val initialVelocity: Double, val acceleration: Double, val time: Double) : Formula()
    data class ProjectileRange(val speed: Double, val angleDegrees: Double) : Formula()
}

fun solve(formula: Formula): Double = when (formula) {
    is Formula.Kinematics ->
        formula.initialVelocity * formula.time + 0.5 * formula.acceleration * formula.time * formula.time
    is Formula.ProjectileRange -> {
        val angleRadians = formula.angleDegrees * Math.PI / 180.0
        (formula.speed * formula.speed * kotlin.math.sin(2 * angleRadians)) / 9.8
    }
}

println(solve(Formula.Kinematics(initialVelocity = 0.0, acceleration = 9.8, time = 2.0)))
println(solve(Formula.ProjectileRange(speed = 20.0, angleDegrees = 45.0)))
```

Run it:

```bash
kotlin formulas.kts
```

Real output — verified this session:

```text
19.6
40.816326530612244
```

*What this proves:* an object dropped from rest, accelerating at
`9.8 m/s²` for `2` seconds, falls `19.6` meters — check by hand with
`s = v₀t + ½at²`: `0(2) + 0.5(9.8)(4) = 19.6` ✓. A projectile launched at
`20 m/s` at a `45°` angle (the angle that maximizes range for a given
speed) travels `40.82` meters — check with `R = v²sin(2θ)/g`:
`(400 × sin(90°)) / 9.8 = 400/9.8 ≈ 40.82` ✓. Two genuinely different
formulas, each with its own distinct set of fields, both handled correctly
by one exhaustive `when`.

### Discard the throwaway example

Deleted. `Formula` and `solve` move into a new file, `Physics.kt`.

### Mechanical walkthrough

1. `data class Kinematics(val initialVelocity: Double, val acceleration: Double, val time: Double) : Formula()`
   / `data class ProjectileRange(val speed: Double, val angleDegrees: Double) : Formula()`
   — (hard concept reappearing, deepened) two subtypes of the same sealed
   class with **completely different field sets** — Lesson 7's `Ok`/
   `Error` shared "one field, meaning varies"; here, the two cases don't
   share any fields at all. Exhaustive `when` still works exactly the same
   way — the compiler doesn't require sibling subtypes to look similar,
   only that every one of them gets a branch.
2. `is Formula.Kinematics -> formula.initialVelocity * ...` — inside this
   branch, `formula` is smart-cast (Lesson 7's mechanism) specifically to
   `Formula.Kinematics`, so `.initialVelocity`, `.acceleration`, and
   `.time` are all directly accessible — none of those fields exist on
   `Formula.ProjectileRange`, and the compiler would reject accessing them
   in the *other* branch.

### CS Lens

This is the deeper appearance of the **sum type** idea from Lesson 7 —
worth naming what's new here specifically: a sealed hierarchy's subtypes
can carry entirely unrelated data, not just variations on one shared
shape. This is exactly how a real algebraic data type is normally used in
practice — a `Shape` sealed class with `Circle(radius)`, `Rectangle(width,
height)`, and `Triangle(base, height)` is the textbook example, and this
`Formula` hierarchy is that same real-world shape, applied to physics
instead of geometry.

### SE Lens

Why `sealed class` here instead of Lesson 10's dispatch-table (`Map<String,
...>`) approach used for trig functions? Because each `Formula` case needs
a genuinely different, statically-known set of typed fields — a `Map`
entry's function type would have to be something awkward like
`(Map<String, Double>) -> Double`, losing all compile-time checking of
which named values each formula actually needs. `sealed class` is the
right tool exactly when the different cases have different *shapes*, not
just different *behavior* over the same shape — the dispatch table was
right for Lesson 10 because every trig function genuinely took one
`Double` and returned one `Double`; that symmetry doesn't hold here.

### Connection

Lesson 22's animated projectile simulation reads a `Formula.ProjectileRange`
value directly, computing its trajectory over time instead of just a
final range number.

---

## Concept Unit: A Picker Screen for a Sealed Hierarchy

### The Problem

The UI needs to let the user pick *which* `Formula` subtype they're using,
then show only the input fields relevant to that specific one.

### The New Code

```kotlin
composable("physics") {
    var selectedFormula by remember { mutableStateOf("Kinematics") }
    var initialVelocity by remember { mutableStateOf("0") }
    var acceleration by remember { mutableStateOf("9.8") }
    var time by remember { mutableStateOf("2") }
    var speed by remember { mutableStateOf("20") }
    var angle by remember { mutableStateOf("45") }

    val formula: Formula = when (selectedFormula) {
        "Kinematics" -> Formula.Kinematics(
            initialVelocity.toDoubleOrNull() ?: 0.0,
            acceleration.toDoubleOrNull() ?: 0.0,
            time.toDoubleOrNull() ?: 0.0
        )
        else -> Formula.ProjectileRange(
            speed.toDoubleOrNull() ?: 0.0,
            angle.toDoubleOrNull() ?: 0.0
        )
    }

    Column(modifier = Modifier.padding(16.dp)) {
        Row {
            Button(onClick = { selectedFormula = "Kinematics" }) { Text("Kinematics") }
            Button(onClick = { selectedFormula = "ProjectileRange" }) { Text("Projectile Range") }
        }
        if (selectedFormula == "Kinematics") {
            TextField(value = initialVelocity, onValueChange = { initialVelocity = it }, label = { Text("Initial velocity") })
            TextField(value = acceleration, onValueChange = { acceleration = it }, label = { Text("Acceleration") })
            TextField(value = time, onValueChange = { time = it }, label = { Text("Time") })
        } else {
            TextField(value = speed, onValueChange = { speed = it }, label = { Text("Speed") })
            TextField(value = angle, onValueChange = { angle = it }, label = { Text("Angle (degrees)") })
        }
        Text(text = "Result: ${"%.2f".format(solve(formula))}")
    }
}
```

### Mechanical walkthrough

1. `var selectedFormula by remember { mutableStateOf("Kinematics") }` —
   picking the formula *type* by a plain `String` rather than by
   constructing a `Formula` directly, because the actual `Formula`
   instance needs to be rebuilt fresh from the current text fields on
   every recomposition — a real, honest simplification worth naming: a
   richer version might use a second small `sealed class` just to
   represent "which kind is selected," with no numeric fields yet, but a
   `String` is a reasonable, simple choice for two options.
2. `if (selectedFormula == "Kinematics") { ... } else { ... }` — (hard
   concept reappearing) an ordinary conditional controlling which
   `TextField`s are shown — Compose composes *no* UI at all for the branch
   not taken, rather than hiding it — a real, different mechanism from
   Android View's `visibility = GONE`.

### Connection

This is the fourth and final route registered in `NavHost` (alongside
`"calculator"`, `"graph"`, `"linear-algebra"`) — the same registration
pattern from Lesson 4, applied once more.

---

## Closing

### Connect the pieces

`Formula` (unit 1) models two genuinely different physics calculations as
one sealed hierarchy, each carrying its own distinct fields, solved by one
exhaustive `when` — verified against real, hand-checkable physics answers.
The picker screen (unit 2) lets the user choose which `Formula` subtype to
build from the current input fields, showing only the relevant inputs for
whichever is selected.

### What breaks without this

Add a third `Formula` subtype, `data class FreeFallHeight(val time: Double)
: Formula()`, but forget to add a corresponding branch to `solve`'s `when`.
Try to compile. Real, observable failure: the same exhaustiveness error
from Lesson 7 — `'when' expression must be exhaustive`, this time naming
the specific missing `FreeFallHeight` branch. Add the branch (using
`s = ½gt²`) and it compiles again.

### Exercises

- Add the `FreeFallHeight` subtype for real, including its `solve` branch
  and a picker option — confirm the compiler genuinely forces you to
  handle it everywhere `Formula` is matched.
- Verify `ProjectileRange`'s formula gives the theoretically maximum range
  at exactly `45°` by trying `30°` and `60°` at the same speed and
  confirming both give a smaller result than `45°` (they should be
  equal to each other, by the formula's own symmetry — a good sanity
  check worth running for real).

### Definition of done

- [ ] Both formula types compute correct, hand-verifiable results.
- [ ] The UI shows only the relevant inputs for whichever formula is
      selected.
- [ ] You can explain, concretely, why `sealed class` was the right choice
      here versus Lesson 10's dispatch table.
- [ ] Commit: `git commit -m "Add a Physics screen backed by a sealed Formula hierarchy"`.
