# Lesson 07: Kotlin Null Safety

**What you will build:** a real `NullPointerException`, caused
deliberately by defeating Kotlin's null checking — then the same code
fixed four different ways (`?.`, `?:`, a real `if` smart-cast, and `!!`
proven to still crash on purpose), so each tool's real, distinct
tradeoff is observed rather than listed.

**What you need to know first:** [Lesson 06](lesson-06-kotlin-val-var-and-type-inference.md).
`wpf-foundations` Lesson 03's C# nullable reference types are useful,
closely related context — Kotlin's own mechanism, proven here, predates
and directly influenced that C# feature.

**Terms introduced in this lesson:**
- **Nullable type (`String?`)** — a trailing `?` on any type marks it as
  allowed to hold `null`; without it, the compiler statically guarantees
  a value is never `null`.
- **Safe call (`?.`)** — `expr?.member` evaluates `member` only if
  `expr` isn't `null`, producing `null` itself otherwise, rather than
  crashing.
- **Elvis operator (`?:`)** — `expr ?: fallback` evaluates to `expr` if
  it isn't `null`, or `fallback` otherwise.
- **Not-null assertion (`!!`)** — forces a nullable value to be treated
  as non-null, throwing a real `NullPointerException` immediately if it
  actually is.
- **Smart cast** — inside a proven-non-null branch (after a real `if
  (x != null)` check, or similar), Kotlin lets `x` be used as its
  non-nullable type directly, with no further `?.`/`!!` needed.

**Objects and methods used:** none beyond `println`, already covered.

---

## Concept Unit: A Nullable Type Genuinely Can Crash

### The Problem

Kotlin is famous for eliminating `NullPointerException`. Whether that's
literally true — impossible to write one at all — or true only when the
type system's own tools are actually used, needs to be proven by trying
to cause one directly.

### Introduce the Concept in Isolation

```kotlin
var name: String? = null
println(name!!.length)
```

This compiles cleanly and **crashes at runtime**:

```
Exception in thread "main" kotlin.KotlinNullPointerException
    at MainKt.main(Main.kt:2)
```

`String?` — a trailing `?` marks this specific variable as **nullable**:
allowed to hold `null`, unlike a plain `String`, which the compiler
statically guarantees can never be `null` (proven directly in this
lesson's next unit). `name!!.length` — explained in this lesson's later
unit on `!!` — forces the compiler to treat `name` as non-null, and it
genuinely crashes the instant that's false. This proves Kotlin's real
claim precisely: null safety is a real, provable *default* the type
system enforces — not an absolute guarantee against ever writing a
crash, which remains possible via `!!`, used deliberately here to prove
exactly that.

### Discard

This crashing proof is disposable; each fix, below, replaces it
directly.

### Mechanical Walkthrough

- `var name: String? = null` — **(a) first appearance** of the `?`
  nullable-type marker itself, and of an explicit type annotation
  (`: String?`) on a `var` declaration — needed here since `null` alone
  gives the compiler no real type to infer.
- `name!!.length` — flagged, not yet fully explained; full treatment in
  this lesson's later `!!` unit, used here only to cause the real crash
  this unit exists to prove.

## Concept Unit: Non-Nullable by Default — the Compiler Won't Compile the Crash

### The Problem

Does a **plain** `String` (no `?`) genuinely prevent the identical crash
from ever being written, or does it just make it less likely?

### Introduce the Concept in Isolation

```kotlin
fun greet(name: String) {
    println("Hello, ${name.length}")
}

fun main() {
    val maybeNull: String? = null
    greet(maybeNull)
}
```

This does **not** compile:

```
error: type mismatch: inferred type is String? but String was expected
```

`fun greet(name: String)` — **no** `?` on `name`'s declared type — is a
real, compiler-enforced guarantee: nothing can ever call `greet` with a
value that might be `null`, proven directly by this exact rejection.
Contrast this against Lesson 06's own type-mismatch proof: the compiler
is performing the identical kind of static check, now specifically
about nullability rather than about `String` vs. `Int`.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `fun greet(name: String)` — **(a) first appearance** of function
  declaration syntax generally (`fun`, parameter list, no return type
  written since this function returns nothing); `name: String`, with no
  `?` — the real, checked guarantee this unit proves.
- `val maybeNull: String? = null` — **(b) hard concept reappearing**,
  the nullable-type syntax from the previous unit.
- `greet(maybeNull)` — **(c) already basic** as a function call; its
  real rejection, proven above, is this unit's entire point.

## Concept Unit: `?.` — Safe Call

### The Problem

A genuinely nullable value sometimes needs a member accessed *only if*
it isn't `null`, skipping cleanly otherwise rather than crashing. Does
Kotlin provide a real, single-operator way to express that, rather than
requiring a full `if` check every time?

### Introduce the Concept in Isolation

```kotlin
var name: String? = null
println(name?.length)

name = "Drill"
println(name?.length)
```

Output:
```
null
5
```

`name?.length` — the **safe call operator**: evaluates `.length` only if
`name` isn't `null` at that moment, producing the real `null` value
itself (not a crash) when it is, and the real, correct length once
`name` genuinely holds a value. Both lines use identical syntax; the
real, different output is driven entirely by `name`'s actual runtime
value at each point.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `name?.length` — **(a) first appearance** of `?.`, explained above;
  `.length` — **(c) already basic**, a real `String` property (Kotlin's
  own name for what Java calls `.length()` as a method — Kotlin exposes
  it as a property instead, no parentheses).
- `println(name?.length)` — **(c) already basic** as a function call;
  `println` accepting `null` itself and printing the literal text
  `null` — **(a) first appearance** of this specific real behavior,
  proven directly by the first line's output.

## Concept Unit: `?:` — the Elvis Operator, a Real Fallback

### The Problem

`name?.length` correctly avoids crashing, but produces `null` itself
when `name` is `null` — sometimes a genuine fallback value, not `null`,
is what's actually needed.

### Introduce the Concept in Isolation

```kotlin
var name: String? = null
val length = name?.length ?: 0
println(length)

name = "Drill"
val length2 = name?.length ?: 0
println(length2)
```

Output:
```
0
5
```

`name?.length ?: 0` — the **Elvis operator**, `?:`: evaluates to the
left side if it isn't `null`, or the right side otherwise. With `name`
null, `name?.length` itself evaluates to `null` (previous unit), and
`?: 0` supplies `0` as the real fallback — `length`'s own type is a
genuine, non-nullable `Int`, not `Int?`, confirmed by the fact that no
further `?.`/`!!` is ever needed to use `length` afterward.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `name?.length ?: 0` — **(b) hard concept reappearing** for `?.`; **(a)
  first appearance** of `?:` itself, explained above.
- `val length = ...` — **(b) hard concept reappearing**, `val` from
  Lesson 06; its real, non-nullable inferred type (`Int`, not `Int?`) is
  this unit's own proof, confirmed by direct, unguarded later use.

## Concept Unit: Smart Casts — a Real `if` Check Changes the Type

### The Problem

An explicit `if (name != null)` check, read by a human, obviously proves
`name` is safe to use directly inside that block. Does the *compiler*
recognize that same proof, or does `name` still require `?.`/`!!` even
inside a branch that's already checked it?

### Introduce the Concept in Isolation

```kotlin
var name: String? = "Drill"

if (name != null) {
    println(name.length)
}
```

`println(name.length)` — **no** `?.`, **no** `!!` — compiles and runs
correctly, printing `5`. Outside the `if` block, the identical
`name.length` (no guard) still fails to compile, exactly as this
lesson's own earlier units proved for an unguarded nullable value. This proves
Kotlin's compiler genuinely tracks the real proof `if (name != null)`
provides, and lets `name` be used as its non-nullable type *directly*,
with zero further operator needed, only inside the branch where that
proof actually holds.

### Discard

This proof is disposable.

### Mechanical Walkthrough

- `if (name != null) { println(name.length) }` — **(a) first appearance**
  of the **smart cast** itself: inside this exact branch, `name`'s
  *effective* type narrows from `String?` to `String`, proven directly
  by the plain, unguarded `.length` access compiling here and nowhere
  else.

### CS Lens

**(b) hard concept, real restatement.** This is the identical **static
analysis** idea `wpf-foundations` Lesson 03 named for C#'s own nullable
reference types — a compiler proving, from the real, visible control
flow of the code itself, that a value can't be `null` at a specific
point, and relaxing its own requirements exactly there. Kotlin's version
predates C#'s by several years and is, if anything, the more direct,
load-bearing version of the same idea — C#'s own designers have
acknowledged Kotlin's null safety as direct influence.

## Concept Unit: `!!` — a Deliberate Escape Hatch, Proven to Still Crash

### The Problem

This lesson opened with `!!` causing a real crash, unexplained. Now
that `?.`, `?:`, and smart casts are all proven as real, safe
alternatives, does `!!` serve any real purpose, or is it a mistake to
ever reach for?

### Introduce the Concept in Isolation

```kotlin
val name: String? = "Drill"
println(name!!.length)
```

Output:
```
5
```

With `name` genuinely non-null, `name!!.length` works correctly — `!!`
is the **not-null assertion**: "I am certain this isn't null; if I'm
wrong, crash immediately, right here." This lesson's own opening proof
already showed the other real half of this contract: with `name` truly
`null`, `!!` throws a real `NullPointerException` at that exact line —
proven, not asserted, at the very start of this lesson.

### Discard

Nothing here is disposable — `!!`'s real, narrow, legitimate use is
covered directly in this unit's SE Lens.

### SE Lens

The real, honest tradeoff: `!!` is the one tool in this lesson that can
still produce the exact bug class — an unhandled `NullPointerException`
— null safety otherwise prevents at compile time. Its real, legitimate
use is narrow: a case where the programmer has genuine, external
knowledge the compiler can't see (a value guaranteed non-null by logic
outside the compiler's own reach — a framework contract, a value just
checked one function call away where the smart cast doesn't carry
across) and *wants* an immediate, loud crash rather than a silently
wrong fallback if that knowledge turns out to be mistaken. Reaching for
`!!` as a routine way to silence a compiler warning, rather than as a
deliberate, narrow exception, reintroduces the exact risk null safety
exists to remove — this lesson's own opening crash is the honest,
concrete cost of using it carelessly.

## Connect the pieces

One trace: a nullable type (`String?`) genuinely can crash, proven by a
real `NullPointerException` from `!!` used against an actual `null`. A
plain, non-nullable type (`String`) makes the identical crash
uncompilable, proven by a real rejected function call. `?.` safely skips
a member access on `null`, producing `null` itself instead of crashing.
`?:` supplies a real, non-nullable fallback for exactly that `null`
case. A smart cast lets a proven-non-null branch use a nullable value
directly, with the compiler itself tracking the proof. `!!` is the one
deliberate escape hatch — proven, at the very start of this lesson, to
still crash exactly when its own certainty turns out to be wrong.

## What breaks without this

Attempt a smart cast across a genuine gap in the compiler's own
tracking — a `var` (not `val`) nullable **class property**, checked in
one function and used in another:

```kotlin
class Holder {
    var name: String? = "Drill"

    fun check(): Boolean = name != null

    fun use() {
        if (check()) {
            println(name!!.length)
        }
    }
}
```

Real, observed result: `println(name.length)`, written *without* `!!`,
**fails to compile** inside `use()`, even though `check()` really does
verify `name != null` first. The compiler cannot prove a mutable class
property (`var`, and reachable from other code, including another
thread) hasn't been reassigned to `null` *between* `check()` returning
and `name` being read — real, honest proof that smart casts require the
non-null check and the actual use to be directly, provably connected in
the same scope, not merely true somewhere earlier in the program's real
execution. `!!` (or capturing `name` into a local `val` immediately
after checking it) is the real, correct fix here — direct, concrete
evidence for exactly when `!!` is legitimate, tying this lesson's own
opening crash and its final SE Lens together.

## Exercises

1. Reproduce the class-property smart-cast gap from the What Breaks
   section yourself, then fix it by capturing `name` into a local `val`
   immediately after the `check()` call, confirming the smart cast now
   succeeds against that local `val` with no `!!` needed.
2. Write a function taking a nullable `Int?` parameter, returning its
   doubled value or `0` if `null`, using `?:` in a single expression —
   no `if`/`else` block. Confirm it against both a real value and a real
   `null` argument.

## Definition of Done

- [ ] You caused the real `NullPointerException` from `!!` against an
      actual `null`, and understand it as Kotlin's own honest exception
      to null safety, not a contradiction of it.
- [ ] You caused the real compile-time rejection of a nullable value
      passed to a non-nullable parameter.
- [ ] You confirmed `?.` and `?:` both behave correctly against real
      `null` and non-`null` values.
- [ ] You confirmed a smart cast lets a checked value be used directly,
      and reproduced the real class-property gap where it doesn't apply.
- [ ] You completed both exercises.

## Next

[Lesson 08 — Kotlin Functions as Values](lesson-08-kotlin-functions-as-values.md)
covers Kotlin's own lambda syntax and trailing-lambda convention — the
mechanism behind nearly every Kotlin-based Android callback
(`setOnClickListener`, and its own kin).
