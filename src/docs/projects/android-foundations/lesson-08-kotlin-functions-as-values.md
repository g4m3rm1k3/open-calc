# Lesson 08: Kotlin Functions as Values

**What you will build:** a small function-typed parameter, proving a
lambda satisfies it directly — then the same call rewritten using
Kotlin's trailing-lambda convention, proven to be pure syntax sugar by
comparing both forms' identical real output.

**What you need to know first:** [Lesson 06](lesson-06-kotlin-val-var-and-type-inference.md).
`wpf-foundations` Lesson 05/06 (C# lambdas, `Func<>`/`Action<>`) proved
the same underlying idea in a different language — useful, not required.

**Terms introduced in this lesson:**
- **Function type** — `(Int) -> Boolean` is a real Kotlin type
  describing "a function taking an `Int`, returning a `Boolean`" —
  Kotlin's own syntax for the same concept C#'s `Func<>`/`delegate`
  express differently.
- **Lambda expression** — `{ x -> x > 0 }`, an inline, unnamed function
  literal satisfying a function type.
- **Trailing lambda syntax** — when a function's *last* parameter is a
  function type, the lambda argument can be written outside the
  parentheses, or the parentheses omitted entirely if it's the only
  parameter.

**Objects and methods used:** none beyond `println`, already covered.

---

## Concept Unit: A Function Type — Describing a Callable Shape

### The Problem

Passing behavior itself — not just data — into another function needs
some way to describe what shape that behavior has to have, the same
real problem `wpf-foundations` Lesson 05 proved `delegate` solves for
C#. Does Kotlin have an equivalent concept, and how is it spelled?

### Introduce the Concept in Isolation

```kotlin
fun isPositive(x: Int): Boolean = x > 0

fun describe(x: Int, check: (Int) -> Boolean): String {
    return if (check(x)) "positive-ish" else "not positive-ish"
}

fun main() {
    println(describe(5, ::isPositive))
    println(describe(-3, ::isPositive))
}
```

Output:
```
positive-ish
not positive-ish
```

`check: (Int) -> Boolean` — a real **function type**: `(Int)` is the
required parameter list, `-> Boolean` the required return type — any
function matching this exact shape can be passed as `check`.
`::isPositive` — a **function reference**: `::` before a function's name
produces a real, callable reference to it, the direct Kotlin
counterpart to `wpf-foundations` Lesson 05's `Calculator.Add` stored in
an `Operation` variable. `check(x)` inside `describe` calls whichever
function was actually passed, without `describe` needing to know or
care which one.

### Discard

This proof is disposable; the next unit's lambda replaces
`::isPositive` with an inline definition instead.

### Mechanical Walkthrough

- `fun isPositive(x: Int): Boolean = x > 0` — **(a) first appearance**
  of the expression-body function form: `= expr` instead of a `{ }`
  block with a `return`, Kotlin's own version of the same shorthand
  `wpf-foundations` Lesson 01 proved for C#'s `=>`.
- `fun describe(x: Int, check: (Int) -> Boolean): String` — **(a) first
  appearance** of a function-typed parameter, explained above.
- `if (check(x)) "positive-ish" else "not positive-ish"` — **(a) first
  appearance** of `if` as a real **expression**, not just a statement:
  the whole `if`/`else` evaluates to one of the two string values
  directly, which `return` then hands back — distinct from Java's/C#'s
  `if`, which is only ever a statement; producing a value from an `if`
  in either of those languages requires the separate ternary `? :`
  operator instead.
- `::isPositive` — **(a) first appearance**, explained above.

## Concept Unit: Lambda Expressions — Defining the Function Inline

### The Problem

Declaring `isPositive` as a separate, named, top-level function just to
pass it once is real, avoidable ceremony for logic used in exactly one
place — the identical problem `wpf-foundations` Lesson 05 named for
C#'s own lambdas.

### Introduce the Concept in Isolation

```kotlin
fun describe(x: Int, check: (Int) -> Boolean): String {
    return if (check(x)) "positive-ish" else "not positive-ish"
}

fun main() {
    val isPositive = { x: Int -> x > 0 }
    println(describe(5, isPositive))
    println(describe(5, { x: Int -> x > 0 }))
}
```

Output:
```
positive-ish
positive-ish
```

`{ x: Int -> x > 0 }` — a **lambda expression**: curly braces enclose
the whole thing (not parentheses, unlike C#'s lambda syntax); `x: Int`
is the parameter, `->` separates it from the body, `x > 0` is the body,
its result implicitly returned — no `return` keyword needed, the same
"last expression is the value" rule `describe`'s own expression-body
form already used. Both calls to `describe` above produce identical
output — proof a lambda, stored in a `val` or written directly inline as
an argument, satisfies the `(Int) -> Boolean` function type exactly the
way `::isPositive` did in the previous unit.

### Discard

This proof is disposable; the next unit's trailing-lambda form rewrites
the same call once more.

### Mechanical Walkthrough

- `{ x: Int -> x > 0 }` — **(a) first appearance**, explained above.
- `val isPositive = { x: Int -> x > 0 }` — **(b) hard concept
  reappearing**, `val` from Lesson 06, here holding a real function
  value instead of a plain data value.
- `describe(5, isPositive)` / `describe(5, { x: Int -> x > 0 })` — **(c)
  already basic** as function-call syntax; both producing identical,
  correct output is this unit's entire proof.

## Concept Unit: Trailing Lambda Syntax

### The Problem

`describe(5, { x: Int -> x > 0 })` places the lambda inside the
parentheses, alongside `5` — real, working Kotlin, and visually busy
once the lambda body grows past one short expression. Does Kotlin offer
a cleaner convention specifically for a function's *last* parameter being
a lambda?

### Introduce the Concept in Isolation

```kotlin
fun describe(x: Int, check: (Int) -> Boolean): String {
    return if (check(x)) "positive-ish" else "not positive-ish"
}

fun main() {
    val a = describe(5) { x -> x > 0 }
    val b = describe(5, { x: Int -> x > 0 })
    println(a == b)
}
```

Output:
```
true
```

`describe(5) { x -> x > 0 }` — **trailing lambda syntax**: when a
function's *last* parameter is a function type, the lambda argument can
be moved *outside* the parentheses entirely, written as if it were a
trailing block rather than a normal argument. `a == b` evaluating to
`true` is real, direct proof this is pure syntax — both calls invoke
`describe` identically, with the identical lambda logic, producing the
identical string result. Note also `x` (no `: Int`) inside the trailing
form — its type is inferred from `describe`'s own declared parameter
type, the same inference already proven for `val`/`var` in Lesson 06,
now applied to a lambda's own parameter.

### Discard

This proof is disposable; trailing lambda syntax itself is the real,
standard convention any Kotlin-based Android code (`setOnClickListener {
... }` and its own kin) leans on constantly — this series' own Android
framework arc is Java-based, whose closest equivalent (a lambda
satisfying a functional interface) is covered in this series' own Java
Lesson 03.

### Mechanical Walkthrough

- `describe(5) { x -> x > 0 }` — **(a) first appearance** of trailing
  lambda syntax itself, explained above.
- `x` with no explicit type — **(b) hard concept reappearing**, type
  inference (Lesson 06), reapplied to a lambda parameter.
- `a == b` — **(c) already basic**, ordinary equality comparison;
  its real result — `true` — is this unit's entire proof.

### SE Lens

The real payoff of trailing lambda syntax, honestly stated as a
readability convention rather than a functional change (proven directly
by `a == b` above): `describe(5) { x -> x > 0 }` visually separates "the
real arguments" (`5`) from "the block of logic" (`{ x -> x > 0 }`),
reading closer to a language built-in control structure (an `if`, a
`for`) than an ordinary function call with an oddly-placed lambda
argument buried inside its parentheses. This is exactly the convention
that makes `setOnClickListener { ... }` in real, Kotlin-based Android
code read as "a block of code that runs on click" rather than "a
function call passed a weird nested argument" — this series' own
framework arc is Java-based (this series' actual course language), where
the identical click-handling job is done with a lambda satisfying a
functional interface instead, covered in Java Lesson 03.

## Connect the pieces

One trace: a function type, `(Int) -> Boolean`, describes a callable
shape — the same real concept `wpf-foundations` proved as `delegate` for
C#, spelled with Kotlin's own arrow syntax. A named function
(`::isPositive`) satisfies it via a function reference. A lambda
expression, `{ x -> x > 0 }`, satisfies it inline, with no named function
declared at all — proven identical in effect by matching output. Trailing
lambda syntax moves that lambda outside the parentheses when it's a
function's last parameter, proven to be pure syntax by a real equality
check against the parenthesized form.

## What breaks without this

Attempt trailing lambda syntax against a function whose *last*
parameter is **not** a function type, moving a plain `Int` argument
outside the parentheses:

```kotlin
fun add(a: Int, b: Int): Int = a + b

fun main() {
    val result = add(3) { 4 }
}
```

This does **not** compile with the intended meaning — `{ 4 }` is itself
a valid lambda (of type `() -> Int`), but `add`'s second parameter is
declared as a plain `Int`, not a function type, and the real error names
exactly this mismatch:

```
error: type mismatch: inferred type is () -> Int but Int was expected
```

Direct, provable proof trailing lambda syntax is a real, checked
convention tied to a function type specifically occupying the *last*
parameter position — not a general "move the last argument outside
parentheses" shortcut usable for any type.

## Exercises

1. Write a function `repeat(times: Int, action: () -> Unit)` (`Unit` is
   Kotlin's real "returns nothing" type, the direct counterpart to
   C#'s `void`) that calls `action` the given number of times. Call it
   using trailing lambda syntax, printing a message inside the lambda,
   and confirm the real repeated output.
2. Reproduce the What Breaks section's real failure yourself, then fix
   `add`'s signature so its last parameter genuinely is a function type
   (e.g., `fun add(a: Int, combine: (Int, Int) -> Int): Int`), and call
   it correctly with trailing lambda syntax.

## Definition of Done

- [ ] You confirmed a function reference (`::name`) and a lambda both
      satisfy an identical function-typed parameter, with matching
      output.
- [ ] You confirmed trailing lambda syntax and parenthesized lambda
      syntax produce identical results via a real equality check.
- [ ] You caused the real trailing-lambda type-mismatch failure and
      understood why it's tied to the last parameter's real declared
      type.
- [ ] You completed both exercises.

## Next

[Lesson 09 — Kotlin Classes and Data Classes](lesson-09-kotlin-classes-and-data-classes.md)
covers Kotlin's own class declaration syntax — primary constructors, and
`data class`'s compiler-generated equality, proven directly against
Java's own hand-written equivalent (Lesson 04 of this series).
