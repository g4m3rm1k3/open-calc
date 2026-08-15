# Lesson 09: Kotlin Classes and Data Classes

**What you will build:** a real Kotlin class using a primary
constructor, proven equivalent to Java's more verbose field/constructor
shape — then a `data class` version, proven to generate real,
value-based equality and a readable `toString()`, contrasted directly
against a plain `class`'s identity-based default.

**What you need to know first:** [Lesson 06](lesson-06-kotlin-val-var-and-type-inference.md).
Real OOP (classes, constructors) already known from Java/C#. `wpf-foundations`
Lesson 04 proved C#'s own `record` does something closely related — this
lesson proves Kotlin's independent, earlier version of the same idea.

**Terms introduced in this lesson:**
- **Primary constructor** — parameters listed directly in a class's own
  header (`class Item(val name: String)`), simultaneously declaring
  constructor parameters and properties in one line.
- **`data class`** — a class modifier generating real `equals()`,
  `hashCode()`, and `toString()` from its primary constructor's
  properties, with no method bodies written by hand.

**Objects and methods used:** none beyond `println`, already covered.

---

## Concept Unit: The Primary Constructor — Properties Declared in the Header

### The Problem

Java's class shape needs a private field, a constructor assigning it,
and a getter (or, in this curriculum's own C# material, an
auto-property) — three separate pieces for one simple stored value. Does
Kotlin need the same ceremony?

### Introduce the Concept in Isolation

```kotlin
class Item(val name: String, var value: Double)

fun main() {
    val item = Item("Drill", 89.99)
    println(item.name)
    item.value = 79.99
    println(item.value)
}
```

Output:
```
Drill
79.99
```

`class Item(val name: String, var value: Double)` — a single line
declares the class, its **primary constructor**, and two real
properties at once: `val name` is immutable after construction (Lesson
01's `val`, applied to a constructor parameter); `var value` is
reassignable (proven directly by `item.value = 79.99` succeeding).
`item.name` and `item.value` are read exactly like plain fields — no
separate getter/setter declared anywhere, and no `new` keyword before
`Item(...)` either, unlike Java or C#'s own construction syntax.

### Discard

This proof is disposable; the exercises revisit the same shape without
needing this exact class preserved.

### Mechanical Walkthrough

- `class Item(val name: String, var value: Double)` — **(a) first
  appearance** of primary constructor syntax, explained above; `val`/
  `var` inside the parameter list specifically — **(a) first
  appearance** of this exact placement: a constructor parameter with
  *no* `val`/`var` in front of it is a plain constructor parameter,
  usable only inside the class body, not a real property at all — the
  `val`/`var` is what promotes it to a genuine, externally readable
  (and, for `var`, writable) property.
- `Item("Drill", 89.99)` — **(a) first appearance** of Kotlin's
  construction syntax: no `new` keyword, unlike Java/C# — the class name
  called directly as if it were a function.
- `item.name` / `item.value = 79.99` — **(c) already basic** as plain
  member access; both working with zero hand-written getter/setter is
  this unit's own proof.

### SE Lens

The real alternative — Java's field/constructor/getter shape, or even
this curriculum's own C# auto-property (`public string Name { get; set;
}` plus a separate constructor assigning it) — is real, working code,
genuinely more lines for the identical outcome. The primary constructor
trades that verbosity for a real constraint: every property declared
this way is set at construction, in one place, which is exactly right
for simple, small data-carrying types and the wrong shape the moment a
property needs real validation logic inside its own `set` — Kotlin's
answer to that case (a full property body, contrasted directly against
this lesson's own primary-constructor shorthand) is real too, just not
this unit's own subject.

## Concept Unit: Default Equality — Identity, Not Contents

### The Problem

Two separately constructed `Item`s holding identical `name`/`value`
data — are they considered equal by Kotlin's default `==`, the same
question `wpf-foundations` Lesson 04 already answered for C#'s plain
`class`?

### Introduce the Concept in Isolation

```kotlin
class Item(val name: String, val value: Double)

fun main() {
    val a = Item("Drill", 89.99)
    val b = Item("Drill", 89.99)
    println(a == b)
    println(a.toString())
}
```

Output:
```
false
Item@1b6d3586
```

`a == b` evaluates to `false` — two separately constructed `Item`s with
identical field values are still considered unequal by default, the
identical **identity-based** default `wpf-foundations` Lesson 04 already
proved for C#'s plain `class`. `a.toString()` prints an unhelpful,
memory-address-flavored string (`Item@1b6d3586`, or a similarly opaque
value) — the real, default `toString()` every plain Kotlin class
inherits, with no readable field values shown at all.

### Discard

This proof is disposable; `data class` fixes both real gaps directly,
next.

### Mechanical Walkthrough

- `a == b` — **(c) already basic** as an operator; its real, identity-
  based result is this unit's entire point, proven directly, not
  asserted.
- `a.toString()` — **(c) already basic** as a method call; its real,
  unhelpful default output is the second half of this unit's proof.

## Concept Unit: `data class` — Compiler-Generated Value Equality

### The Problem

Writing real `equals()`/`hashCode()`/`toString()` overrides by hand for
every simple data-carrying class is genuine, repetitive, easy-to-get-
subtly-wrong boilerplate (forgetting `hashCode()` alongside `equals()`
breaks that type as a `Map`/`Set` key in ways that are easy to miss).
Does Kotlin generate this automatically, the way `wpf-foundations`
Lesson 04 proved C#'s `record` does?

### Introduce the Concept in Isolation

```kotlin
data class Item(val name: String, val value: Double)

fun main() {
    val a = Item("Drill", 89.99)
    val b = Item("Drill", 89.99)
    println(a == b)
    println(a.toString())
}
```

Output:
```
true
Item(name=Drill, value=89.99)
```

One keyword added — `data`, right before `class` — and the identical
construction/comparison code now produces genuinely different, real
results: `a == b` is `true` (value-based equality, comparing `name` and
`value` directly, not identity), and `a.toString()` prints real,
readable field values with **zero** method body written by hand for
either.

### Discard

Nothing here is disposable — `data class` is the real, standard shape
any Kotlin-based Android project uses for a simple data-holding type
(the direct counterpart to `wpf-foundations`' own `Item` class, built
the C# way, or this series' own Java `Item` class, built with the
equals/hashCode contract covered in Java Lesson 04).

### Mechanical Walkthrough

- `data class Item(val name: String, val value: Double)` — **(a) first
  appearance** of the `data` modifier itself, explained above; the
  primary constructor syntax underneath it — **(b) hard concept
  reappearing** from this lesson's first unit.
- `a == b` — **(c) already basic** syntactically; its real, changed
  result — proven by direct contrast against the previous unit's
  identical code with `data` removed — is this unit's own proof.
- `a.toString()` — **(c) already basic** syntactically; its real,
  changed output is the second half of this proof.

### CS Lens

**(b) hard concept, real restatement.** This is the identical
compiler-generated **value-based equality** idea `wpf-foundations`
Lesson 04 already proved for C#'s `record` — two independent languages
converging on the same real fix for the same real, repetitive
boilerplate problem. Kotlin's `data class` additionally generates a real
`copy()` method (not exercised in this lesson) letting an immutable
`val`-based instance be duplicated with one or more fields changed,
without mutating the original — the direct counterpart to `record`'s own
`with`-expression from that same C# lesson.

## Connect the pieces

One trace: a primary constructor declares a class, its constructor, and
its properties in one line — proven equivalent to Java's separate
field/constructor/getter shape by direct, working use. A plain `class`'s
default `==` and `toString()` are both identity-based and unhelpful,
proven by real, observed output. Adding `data` before `class` generates
real, value-based `equals()`/`hashCode()`/`toString()` automatically —
proven by identical code producing genuinely different, correct results
once that one keyword is added.

## What breaks without this

Add a **third**, non-constructor property to a `data class` — declared
inside the class body rather than in the primary constructor's own
parameter list — and confirm whether it participates in the generated
equality:

```kotlin
data class Item(val name: String, val value: Double) {
    var notes: String = ""
}

fun main() {
    val a = Item("Drill", 89.99)
    val b = Item("Drill", 89.99)
    a.notes = "Needs new bit"
    println(a == b)
}
```

Real, observed result: `a == b` still prints `true`, even though
`a.notes` and `b.notes` genuinely differ. Direct, provable proof
`data class`'s generated equality only ever considers properties
declared in the **primary constructor** — a property added inside the
class body, however real and however different its value, is silently
excluded from `equals()`/`hashCode()`/`toString()` entirely.

## Exercises

1. Reproduce the What Breaks section's real result yourself, then move
   `notes` into the primary constructor instead (`data class
   Item(val name: String, val value: Double, var notes: String = "")`)
   — note the default value `= ""`, letting existing two-argument calls
   like `Item("Drill", 89.99)` keep compiling. Confirm `a == b` now
   correctly evaluates to `false` once `notes` differs.
2. Call `.copy(value = 99.99)` on a real `data class` instance, and
   confirm, via `==` against the original, that a genuinely new,
   independent object was produced — one with the original's `name`
   unchanged and only `value` different.

## Definition of Done

- [ ] You confirmed a primary constructor produces real, working
      properties with zero hand-written getter/setter.
- [ ] You confirmed a plain `class`'s default `==`/`toString()` are
      identity-based and unhelpful, and confirmed `data class` fixes
      both.
- [ ] You reproduced the real "body property excluded from generated
      equality" gap and understood why it happens.
- [ ] You completed both exercises.

## Next

Kotlin Essentials pauses here (Lessons 06–09) — extension functions,
collections/stdlib, and coroutines are real, planned continuations of
this arc, written whenever Kotlin becomes the active priority again. For
now, this series' Java arc (starting at
[Lesson 01](lesson-01-java-syntax-at-a-glance.md)) is next — see this
series' [README](README.md) for the current, real order.
