# Lesson 16: Making `+` Mean Something New

*(Vector and Matrix Types via Operator Overloading)*

**User Story**
> As a user, I want a Linear Algebra screen where I can add two vectors or
> scale one, and see the result immediately.

**What you will build**
A new "Linear Algebra" route with a small `Vector2` input UI — two vectors,
combined with `+` or scaled, showing a real result. `Vector2` itself uses a
genuinely new Kotlin feature with no clean Java equivalent.

**What you need to know first**
Lesson 4's `NavHost` (adding a third route), Lesson 0's `data class`.
Nothing from `../track/` applies — that course never modeled mathematical
values as first-class types.

---

## Concept Unit: `operator fun` — Redefining What `+` Does

### The Problem

Java has no way to make `myVector1 + myVector2` mean anything — `+` is
hardcoded to numbers and `String` concatenation only; adding two vectors in
Java means writing (and calling) a named method like `add(other)`. Kotlin
lets a type define what `+`, `*`, and several other operators mean for its
own instances.

### Introduce the concept in isolation

```kotlin
data class Vector2(val x: Double, val y: Double) {
    operator fun plus(other: Vector2): Vector2 = Vector2(x + other.x, y + other.y)
    operator fun times(scalar: Double): Vector2 = Vector2(x * scalar, y * scalar)
}

val a = Vector2(1.0, 2.0)
val b = Vector2(3.0, 4.0)
println(a + b)
println(a * 2.0)
```

Run it:

```bash
kotlin vector.kts
```

Real output — verified this session:

```text
Vector2(x=4.0, y=6.0)
Vector2(x=2.0, y=4.0)
```

*What this proves:* `a + b` really does call `a.plus(b)` under the hood —
`operator fun plus` is what makes the `+` symbol legal between two
`Vector2` values at all; without the `operator` keyword specifically (not
just a method named `plus`), `a + b` would be a compile error, not silently
falling back to anything.

### Discard the throwaway example

Deleted. `Vector2` (and `Matrix2`, added next) become real, permanent types
in the app.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `LinearAlgebra.kt`; a new `"linear-algebra"`
  route registered in `NavHost` (Lesson 4).
- **Change type:** Add.
- **Location:** Alongside `Vector2`, a `Matrix2` type for Lesson 17.
- **Dependencies:** None new.

### The New Code

```kotlin
data class Vector2(val x: Double, val y: Double) {
    operator fun plus(other: Vector2): Vector2 = Vector2(x + other.x, y + other.y)
    operator fun minus(other: Vector2): Vector2 = Vector2(x - other.x, y - other.y)
    operator fun times(scalar: Double): Vector2 = Vector2(x * scalar, y * scalar)

    override fun toString(): String = "(%.2f, %.2f)".format(x, y)
}
```

### Mechanical walkthrough

1. `operator fun plus(other: Vector2): Vector2` — (first appearance) the
   `operator` keyword is required, not optional decoration — it's a
   checked signal to the compiler that this specific method participates
   in Kotlin's operator-overloading convention, and its parameter/return
   types must match what `+` expects (one parameter, any return type).
2. `operator fun minus(...)` / `operator fun times(...)` — (hard concept
   reappearing) each Kotlin operator symbol maps to one specific,
   fixed function name (`plus` for `+`, `minus` for `-`, `times` for `*`) —
   not arbitrary; you can't invent a new symbol, only redefine what the
   existing ones mean for your type.
3. `override fun toString(): String = "(%.2f, %.2f)".format(x, y)` — (hard
   concept reappearing) `data class` already generates a `toString()`
   (Lesson 0) — this line **overrides** that generated one with a
   friendlier format, using `String.format`-style syntax (Java's own
   `%.2f` placeholder convention, still valid inside Kotlin's `.format(...)`
   extension function) instead of the default `Vector2(x=1.0, y=2.0)` shape.

### CS Lens

This is **operator overloading** — giving existing symbols new meaning for
a user-defined type, resolved entirely at compile time (the compiler picks
`Vector2.plus` because the operands are `Vector2`, exactly the way it picks
`Int.plus` for two `Int`s). Also recognized in: C++'s `operator+`, Python's
`__add__`, and C#'s `operator +` (this curriculum's WPF course could use
this exact feature for its own geometry types) — a feature deliberately
absent from Java, where every "add" operation on a custom type needs an
explicitly named method.

### SE Lens

The real tradeoff: operator overloading reads beautifully when the
operator's meaning is genuinely unambiguous (vector addition really is
"add the components," matching everyone's mathematical intuition) — but
it's a real anti-pattern the moment the meaning is a stretch (overloading
`+` on a `ShoppingCart` to mean "merge carts" is *technically* legal and
often confusing). This app uses it only for `Vector2`/`Matrix2` (Lesson
17), exactly the domain where the mathematical meaning of `+` and `*` is
unambiguous to any reader.

### Connection

Lesson 17 adds `Matrix2` with its own `operator fun times` — both a
matrix-times-matrix and a matrix-times-vector version, a real case where
the *same* operator symbol needs more than one signature.

---

## Concept Unit: A Small UI for Vector Input

### The Problem

`Vector2` needs a real screen: two number inputs per vector, an operation
picker, and a result display.

### The New Code

```kotlin
composable("linear-algebra") {
    var ax by remember { mutableStateOf("1") }
    var ay by remember { mutableStateOf("2") }
    var bx by remember { mutableStateOf("3") }
    var by_ by remember { mutableStateOf("4") }

    val vectorA = Vector2(ax.toDoubleOrNull() ?: 0.0, ay.toDoubleOrNull() ?: 0.0)
    val vectorB = Vector2(bx.toDoubleOrNull() ?: 0.0, by_.toDoubleOrNull() ?: 0.0)

    Column(modifier = Modifier.padding(16.dp)) {
        Row { TextField(value = ax, onValueChange = { ax = it }, label = { Text("Ax") })
              TextField(value = ay, onValueChange = { ay = it }, label = { Text("Ay") }) }
        Row { TextField(value = bx, onValueChange = { bx = it }, label = { Text("Bx") })
              TextField(value = by_, onValueChange = { by_ = it }, label = { Text("By") }) }
        Text(text = "A + B = ${vectorA + vectorB}")
        Text(text = "A - B = ${vectorA - vectorB}")
        Text(text = "A × 2 = ${vectorA * 2.0}")
    }
}
```

### Mechanical walkthrough

Nothing here is a new construct — four `TextField`s hoisted exactly like
Lesson 13's function input, two computed `Vector2` values re-derived every
recomposition from the current text, and three `Text` lines using this
lesson's new operators directly inside string templates
(`"${vectorA + vectorB}"`) — a direct, satisfying payoff: the operator
overload from Concept Unit 1 makes this line read as actual vector
arithmetic, not a method call.

### Connection

Register `"linear-algebra"` in Lesson 4's `NavHost` and add a third
`NavigationBarItem` for it — the exact same pattern used for
`"calculator"`/`"graph"`, no new navigation concept needed.

---

## Closing

### Connect the pieces

`operator fun plus`/`minus`/`times` (unit 1) give `Vector2` real
mathematical syntax, verified with real addition and scaling output. The
input screen (unit 2) reads two vectors from text fields and displays
their sum, difference, and a scaled version — directly through those
operators, not named method calls.

### What breaks without this

Remove the `operator` keyword from `plus`, leaving `fun plus(other:
Vector2): Vector2 = ...`. Try to compile `vectorA + vectorB`. Real,
observable failure: a compile error stating `+` is unresolved for these
operand types — Kotlin does not treat a plainly-named `plus` function as
automatically usable via `+`; the keyword itself is what opts the function
into operator syntax. Restore `operator` and it compiles again.

### Exercises

- Add `operator fun unaryMinus(): Vector2 = Vector2(-x, -y)` and confirm
  `-vectorA` works correctly — a single-operand ("unary") operator, a new
  shape from the two-operand ones built here.
- Add a `magnitude()` function (using `kotlin.math.sqrt`) computing a
  vector's length — not an operator, since there's no operator symbol for
  "length," a good example of when a named function is still the right
  tool.

### Definition of done

- [ ] A Linear Algebra screen exists, reachable from the nav bar.
- [ ] Vector addition, subtraction, and scaling all compute and display
      correctly.
- [ ] You can explain, concretely, why `operator` is required and not just
      a naming convention.
- [ ] Commit: `git commit -m "Add Vector2 with operator overloading and a Linear Algebra screen"`.
