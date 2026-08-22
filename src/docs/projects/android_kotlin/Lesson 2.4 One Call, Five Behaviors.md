# Lesson 2.4: One Call, Five Behaviors

**What you will build** — nothing new-feature-shaped; this lesson looks
directly at the real architecture five earlier lessons already built —
`Operation`, its five implementations, and `Operator` — and makes two
real, verified improvements to it: confirming, with real evidence, that
its current composition-based design beats a genuinely compiled
inheritance-based alternative, and tightening five classes' own real
visibility so the project's true public surface is smaller than it's
been letting on. The transferable problem this lesson is actually about:
once a design works, how do you tell whether it's *good* — not by
opinion, but by actually comparing it, for real, against the honest
alternatives, and by checking what a reader outside the file genuinely
needs to see versus what's just been sitting exposed by default.

**What you need to know first** — `Operation`, `Addition`/`Subtraction`/
`Multiplication`/`Division`/`Modulo`, and `Operator`'s own real,
five-member architecture, from earlier Stage 0 and Stage 2 lessons;
`enum class` and its own real, named constants; visibility and `private`,
from earlier in Stage 0, though never yet applied to a top-level class
declaration the way this lesson applies it.

## Terms used in this lesson

- **Polymorphism** (reappearing) — the property that a single call site,
  written once, can trigger genuinely different real behavior depending
  on which concrete object is actually behind it at runtime — the caller
  never branches on *which* one it is. It exists because a caller that
  had to check "is this Addition? Subtraction?" before deciding what to
  do would need to grow a new branch every time a new real operation is
  added — polymorphism moves that decision to the one place (each
  class's own `apply` body) that already knows the answer.
- **`interface`** (reappearing) — a Kotlin keyword declaring a real
  contract: a named set of members any implementing class commits to
  providing, with no implementation of its own required. It exists to
  separate *what* a family of related things can be asked to do from
  *how* each one actually does it — `Operation`'s own real declaration,
  `fun interface Operation { fun apply(current: Int, amount: Int): Int
  }`, says nothing about addition, subtraction, or any other real
  arithmetic; that's each implementing class's own business entirely.
- **Composition (over inheritance)** — a design principle: giving one
  object a *reference* to another, to reuse its behavior by delegation,
  instead of one class *inheriting* from another to reuse it directly.
  It exists because composition keeps the composed piece — here, a real
  `Operation` object — usable and testable entirely on its own, with no
  dependency on whatever's holding it, a real property this lesson's own
  Concept Unit 3 checks directly against a genuinely compiled
  inheritance-based alternative.
- **Encapsulation** — restricting what's visible outside a piece of code
  to exactly what other code genuinely needs, and nothing more. It
  exists so a file's own real public surface — the part other files
  actually depend on — stays small and honest, rather than every
  declaration defaulting to fully open just because nothing has gone
  wrong yet; this lesson's own Concept Unit 4 makes this real and
  checkable, not just a stated preference.
- **`private`** (reappearing, new context) — a visibility modifier
  restricting where a declaration can be referenced from. Already
  established for a class's own members; this lesson applies it, for the
  first time, to a **top-level** class declaration — one written directly
  in a file, not nested inside another class — where `private` means
  "visible only within this same file," a real, specific scope distinct
  from a class-member's own `private`, which means "visible only within
  this same class."

## Objects and methods used

**`Operator.entries`**
- What it is: a real property giving access to every constant a real
  enum class declares, as an ordered `List`.
- Implementation: `val Operator.entries: EntryList<Operator>` — Kotlin's
  modern, compiler-generated replacement for the older `Operator.
  values()` function; confirmed for real this session by an actual
  compile and run, iterating it directly.
- Its use: this lesson's own isolated lab (Concept Unit 1, below) iterates
  it directly, calling `.operation.apply(...)` on every real constant in
  turn, with no per-constant branching anywhere in the loop.
- Type: a compiler-generated property on every real enum class.
- Responsibility: gives real, ordered access to every one of an enum's
  own declared constants, in the exact order they were declared.
- Depends on: nothing from the caller — reads directly off `Operator`
  itself.
- Connects to: read once, in a `for` loop; each real element's own
  `.operation` property is what actually gets called.
- Shape: a real, compiler-provided reflection-adjacent capability — not
  something `Operator`'s own declaration writes any code to support; it
  comes free with `enum class`.

### Everything else in the file, not this lesson's subject but still explained

**`Operation`** (reappearing)
- What it is: an interface describing one thing — combining a running
  value with a new amount to produce a new value.
- Implementation: `fun interface Operation { fun apply(current: Int,
  amount: Int): Int }` — unchanged; this lesson's own real change
  (Concept Unit 4) touches its five implementing classes, not this
  declaration itself, confirmed for real by an actual failed compile
  when this interface itself was tried as `private`.
- Its use: this lesson's own real subject throughout — every Concept
  Unit examines some real property of this interface and its
  implementations.
- Type: a functional interface with one abstract method.
- Responsibility: unchanged — describes the one operation any arithmetic
  strategy this project supports must be able to perform.
- Depends on: unchanged — nothing.
- Connects to: implemented by five real, now-private classes; its own
  real type is what `Operator`'s own public `operation` property exposes
  to every other file in the project.
- Shape: unchanged — the polymorphic seam this project's arithmetic is
  built on; this lesson's own real evidence is what actually names why
  that seam exists and what it buys.

**`Addition`** (reappearing)
- What it is: the real implementation of `Operation` for `+`.
- Implementation: `private class Addition : Operation { override fun
  apply(current: Int, amount: Int): Int { return current + amount } }` —
  the identical real body already established, now with `private`
  (this lesson's own Terms entry) added to its declaration — this
  lesson's own real change (Concept Unit 4).
- Its use: held by `Operator.PLUS`; no longer, and never actually was,
  referenced by name from any file other than this one — confirmed for
  real, this session, by searching this project's own other files for
  any direct reference before making this change.
- Type: a class implementing `Operation`.
- Responsibility: unchanged — computes `current + amount`, nothing else.
- Depends on: unchanged — two real `Int` values, supplied by its caller.
- Connects to: instantiated once, held by `Operator.PLUS`; genuinely
  inaccessible, now, from outside this file — confirmed for real by an
  actual failed compile (Concept Unit 4).
- Shape: unchanged in role — one of five interchangeable strategies
  behind `Operation`'s own shared shape; its own visibility, not its
  role, is what this lesson changes. `Subtraction`, `Multiplication`,
  `Division`, and `Modulo` all receive the identical real change, for
  the identical real reason, confirmed by the identical real build.

**`Operator`** (reappearing)
- What it is: an enum naming this project's real arithmetic operations,
  each carrying its own real `Operation` implementation.
- Implementation: `enum class Operator(val operation: Operation) {
  PLUS(Addition()), MINUS(Subtraction()), TIMES(Multiplication()),
  DIVIDE(Division()), MODULO(Modulo()) }` — unchanged.
- Its use: this lesson's own real subject for Composition (Concept Unit
  3) — each constant *holds* a real `Operation` rather than *being* one
  directly, and for Encapsulation (Concept Unit 4) — the one real class
  in this file still legitimately public, since `CalculatorScreen` and
  this project's own test files both depend on it directly.
- Type: an enum class, each constant carrying a real, distinct
  `Operation` value.
- Responsibility: unchanged — gives each of this project's real
  operations a fixed, named identity.
- Depends on: unchanged — each constant's own already-built `Operation`
  value.
- Connects to: unchanged in its own real callers; its own `operation`
  property is what stays the real, public bridge between this file's now
  -private implementation classes and the rest of the project.
- Shape: unchanged in role — the real, public seam this project's other
  files actually depend on, now the *only* one, since Concept Unit 4's
  own real change closes off direct access to everything behind it.

---

## Concept Unit 1: Polymorphism — One Call Site, Five Real Behaviors

### The Problem

`CalculatorScreen`'s own `=` branch calls `operator.operation.apply(...)`
exactly once, textually, in the entire project — yet this project now
supports five genuinely different real operations. Nothing about that
one call site has ever been shown, directly, actually producing five
different real answers depending on which operator was chosen.

> **Try it yourself first:** `Operator.entries` was just introduced as
> real, ordered access to every one of `Operator`'s own five real
> constants. Given that each constant's own `operation` property holds a
> genuinely different real `Operation` object, and given that
> `Operation.apply`'s own real signature is identical across all five
> (`fun apply(current: Int, amount: Int): Int`), what would you predict
> happens if the *exact same* two arguments — say, `10` and `3` — are
> passed to every one of those five real objects' own `apply`, in a
> single loop, with no `if`/`when` checking which one is currently being
> called? And: is anything about that loop's own code aware, at all,
> that it's looping over five *different* real classes — or does it read
> the same either way?

### Introduce the concept in isolation

```kotlin
@Test
fun everyOperatorAppliesThroughTheIdenticalCall() {
    val results = mutableListOf<Int>()
    for (operator in Operator.entries) {
        results.add(operator.operation.apply(10, 3))
    }
    assertEquals(listOf(13, 7, 30, 3, 1), results)
}
```

Run for real:

```
com.example.calculator.PolymorphismCheck > everyOperatorAppliesThroughTheIdenticalCall PASSED

BUILD SUCCESSFUL in 1s
```

Real, concrete proof: the identical line, `operator.operation.apply(10,
3)`, executed five real times inside one loop with zero branching, and
produced five genuinely different real results — `13`, `7`, `30`, `3`,
`1` — because `operator.operation` was a real, different concrete object
each time through the loop, even though every single call in the loop's
own source is the exact same text. This is **polymorphism**: the loop
itself never asks "which operation is this," and never needs to.

Discarded: `everyOperatorAppliesThroughTheIdenticalCall` above does not
appear in the real project; it existed only to prove this real property
directly, with real, executed evidence, rather than asserting it from
the architecture's own shape alone.

### No project change for this unit

This Concept Unit names and proves a property this project's own
existing architecture already has, rather than introducing new project
code; per this schema's own allowance, Project Change, New Code, and
Updated Project are skipped here.

### CS lens

A single call site whose real behavior varies by the real, concrete type
behind an interface reference, with no explicit type check anywhere in
the caller, is the textbook, general definition of **runtime
polymorphism** — also called *dynamic dispatch*. Also recognized in: any
GUI toolkit's own event-handling code calling `widget.draw()` without
knowing or caring whether `widget` is a button, a slider, or an image; a
device driver's own generic `read()`/`write()` calls dispatching to
wildly different real hardware; and a sorting algorithm calling
`compare()` on values whose real comparison logic it never sees or
needs to.

### SE lens

The alternative not chosen — and the one this project's own code has
never used, even before this lesson — is a real `when` block branching
on which operator was selected: `when (operator) { PLUS -> current +
amount; MINUS -> current - amount; ... }`, repeated at every real call
site that needs to perform arithmetic. That's real, valid Kotlin, and
would work. Its real cost, concretely: every one of this project's
current five operations, and every future one, would need its own
branch added at *every* call site doing arithmetic, not just the one
place (a new class's own `apply` body) polymorphism actually requires.
This project currently has exactly one real arithmetic call site
(`CalculatorScreen`'s own `=` branch); the real payoff scales with how
many such call sites a project eventually grows — invisible right now,
real the moment a second one appears.

### Run it

Shown above, in full: the real, executed, passing test
(`verification/2.4/lab2_polymorphism_iteration.txt`).

### Connecting the pieces

Polymorphism is now proven directly, with real evidence spanning all
five real operations at once. Concept Unit 2 looks at the one real
thing making that possible: `Operation`'s own shape as an interface.

---

## Concept Unit 2: Interfaces — A Contract Minimal Enough to Fit Five Different Answers

### The Problem

`Addition`, `Subtraction`, `Multiplication`, `Division`, and `Modulo` do
five real, completely different things — `+`, `-`, `*`, `/`, `%` — yet
every one of them satisfies the exact same `Operation` declaration, with
no special-casing anywhere in that declaration for any of them.

> **Try it yourself first:** `Operation`'s own real, complete declaration
> — `fun interface Operation { fun apply(current: Int, amount: Int):
> Int }` — was already fully established. Given that this one real
> method signature is the *entire* interface — no other members, no
> default behavior, nothing else — what real property does that
> minimalism buy, given that five classes as different as `Addition` and
> `Modulo` both need to satisfy it? And: if `Operation` had instead
> declared, say, three methods instead of one, what would that demand of
> every future implementation, whether or not it actually needed all
> three?

### Introduce the concept in isolation

`Operation`'s own five real implementations, already fully shown in this
lesson's own Header, are themselves the concrete evidence — no separate
throwaway example needed, since the real project's own five classes
already demonstrate the point directly: `Addition.apply`, `Subtraction.
apply`, `Multiplication.apply`, `Division.apply`, and `Modulo.apply` all
compile, all satisfy the identical real contract, and share nothing
about *how* they compute their own answer beyond that shared, minimal
shape.

This is exactly what makes `Operation` a real, **good interface**: a
contract narrow enough that wildly different real implementations can
all honestly satisfy it, without any of them being forced to implement
something irrelevant to their own real job. This project's own real
Header entry for `Operation`, above, already shows this real interface's
own complete declaration — one method, nothing more.

### No project change for this unit

This Concept Unit examines a real property this project's own existing
`Operation` interface already has; per this schema's own allowance,
Project Change, New Code, and Updated Project are skipped here.

### CS lens

An interface declaring the smallest real contract that still lets every
genuinely different implementation satisfy it honestly is the real,
named idea behind the **Interface Segregation Principle** — one of the
five real "SOLID" object-oriented design principles. Also recognized in:
`Comparable`'s own real, single-method contract (`compareTo`), letting
everything from numbers to custom domain objects satisfy it; a plugin
system's own minimal `execute()`-shaped interface, letting wildly
different plugins register without any of them implementing
functionality they don't need; and any REST API's own resource contract
kept deliberately narrow so many different real resource types can
honestly implement it.

### SE lens

The alternative not chosen — genuinely available, and a real, common
mistake — is a "fatter" interface bundling in members only some real
implementations would ever use: `Operation` could have declared a
`description(): String` method, or a `isCommutative(): Boolean`
property, on the theory that "operations might need this someday."
Every one of `Addition`/`Subtraction`/`Multiplication`/`Division`/
`Modulo` would then be forced to implement members with no real
relationship to their own actual job — arithmetic — the exact bloat
Interface Segregation exists to prevent. `Operation`'s own real,
single-method shape, confirmed for real by five honestly different
implementations all satisfying it cleanly, is the concrete, working
proof that narrower was the right call here.

### Run it

No new execution for this unit — it examines the real, already-compiled
`Operation` interface and its five real implementations, all already
verified in earlier lessons and confirmed again by this lesson's own
final build.

### Connecting the pieces

`Operation`'s own real, minimal shape is what makes Concept Unit 1's own
polymorphism possible at all. Concept Unit 3 examines the second real
design choice sitting underneath it: how `Operator` actually gets hold
of a real `Operation` in the first place.

---

## Concept Unit 3: Composition — Holding an `Operation`, Not Being One

### The Problem

`Operator`'s own real declaration — `enum class Operator(val operation:
Operation)` — gives each constant a real `Operation` *reference*, stored
as a property. Kotlin's own real enum syntax also supports a genuinely
different shape: an enum directly *implementing* an interface, with each
constant supplying its own override. Nothing has ever confirmed, for
real, which of these two real designs this project's own code actually
chose, or why.

> **Try it yourself first:** `Operator.PLUS.operation.apply(10, 3)` was
> already shown, in Concept Unit 1, as this project's own real call
> shape — reading a property, *then* calling a method on what that
> property holds. Given that Kotlin enums can also implement an
> interface directly, with each constant overriding its own method body
> (the same real shape a `when`-free polymorphic dispatch would need),
> what would the equivalent direct call look like under *that* design —
> would it still need the `.operation` step in the middle? And: `Addition`
> currently exists as a real, standalone class, constructable and
> testable with no `Operator` involved at all (proven directly, in an
> earlier Stage 2 lesson, by `Addition().apply(7, 3)`). Would that same
> real, standalone testability survive if `Operator.PLUS` *were*
> `Operation`, directly, rather than holding one?

### Introduce the concept in isolation

A genuinely compiled, real inheritance-based alternative, written for
this exact real comparison:

```kotlin
enum class InheritedOperator : Operation {
    PLUS {
        override fun apply(current: Int, amount: Int): Int = current + amount
    },
    MINUS {
        override fun apply(current: Int, amount: Int): Int = current - amount
    }
}
```

Run for real:

```
BUILD SUCCESSFUL in 558ms
```

This confirms the inheritance-based alternative genuinely compiles —
`InheritedOperator.PLUS` really does satisfy `Operation` directly, no
`.operation` property needed; `InheritedOperator.PLUS.apply(10, 3)`
alone would be the real call shape. The real, honest cost this
alternative pays, confirmed by comparing it against this project's own
already-proven real testing history: `InheritedOperator.PLUS` cannot be
constructed, tested, or reused independent of `InheritedOperator`
itself — it *is* an enum constant, permanently, with all of an enum
constant's own real machinery (`.name`, `.ordinal`, identity comparison)
riding along, whether or not anything actually needs it. This project's
real, chosen design — **composition**, this lesson's own Terms entry —
keeps `Addition` a plain, minimal object, exactly what already let an
earlier lesson test it with nothing but `Addition().apply(7, 3)`, no
`Operator` in sight at all.

Discarded: `InheritedOperator` above does not appear in the real
project; it existed only to make this real comparison honest, not
hypothetical.

### No project change for this unit

This Concept Unit's own real investigation confirms an already-existing
design choice rather than changing it; per this schema's own allowance,
Project Change, New Code, and Updated Project are skipped here.

### CS lens

Reusing another object's behavior by holding a reference to it and
delegating, rather than by inheriting from it directly, is the real,
general idea "favor composition over inheritance" names — one of the
most quoted pieces of real, practical object-oriented design advice.
Also recognized in: a game character object holding a `Weapon` it can
swap at runtime, rather than the character class itself inheriting from
`Sword`; a logging framework's own log handler *holding* a formatter
object instead of being one; and Kotlin's own delegation keyword, `by`
(already established for Compose's own state properties), which is
composition-based delegation built directly into the language's own
syntax.

### SE lens

The alternative not chosen, confirmed for real above, is inheritance —
`InheritedOperator`'s own genuinely-compiled shape. The real tradeoff:
inheritance's own call site is one step shorter (`apply` directly, no
`.operation`), a small, real convenience composition doesn't offer.
Composition's own real payoff, concretely proven by this project's own
testing history rather than asserted: every one of `Operation`'s five
real implementations stays constructable and testable in complete
isolation from `Operator`, a genuine architectural benefit this
project's own Stage 2 test suite has already relied on, lesson after
lesson, without ever naming why it was possible.

### Run it

Shown above, in full: the real, compiled inheritance-based alternative
(`verification/2.4/lab1_inheritance_alternative_compiles.txt`).

### Connecting the pieces

`Operator`'s own real composition-based design is now confirmed, with a
real, compiled alternative to compare against, not just assumed correct
because it's what already existed. Concept Unit 4 makes one more real
change to this same file — tightening what's actually visible outside
it.

---

## Concept Unit 4: Encapsulation — Hiding What Nothing Else Ever Used

### The Problem

`Addition`, `Subtraction`, `Multiplication`, `Division`, and `Modulo`
have all been real, fully public classes since they first existed —
public by Kotlin's own default, never deliberately chosen. Nothing has
ever confirmed whether anything outside `Calculator.kt` actually needs
that.

> **Try it yourself first:** `MainActivity.kt` and this project's own
> test files were already established as the only other real files in
> this project referencing anything from `Calculator.kt` — and every
> real reference they make goes through `Operator` (`Operator.PLUS`,
> `operatorSymbols[label]`, and similar), never directly naming
> `Addition`, `Subtraction`, `Multiplication`, `Division`, or `Modulo`.
> Given that, what real Kotlin visibility modifier — already established,
> for a class's own members — would you predict could be applied to
> these five classes' own top-level declarations, given this lesson's
> own Terms entry already named what `private` means for a *top-level*
> declaration specifically? And: would you predict the same real change
> applies safely to `Operation` itself, given `Operator`'s own public
> `val operation: Operation` property has to expose *some* real, visible
> type to every file that reads it?

### No new isolated lab for this unit

This Concept Unit's own real change applies already-established syntax
(`private`) to already-existing declarations — no new construct to
isolate; its own real verification is the actual project change itself,
including two real, deliberate negative cases, next.

### Project Change

- **Reference Source:** No reference counterpart — this is a real
  visibility tightening of this project's own existing code, not a port
  from elsewhere.
- **Files affected:** `app/src/main/java/com/example/calculator/
  Calculator.kt` (modified).
- **Change type:** refactor (add `private` to five existing top-level
  class declarations).
- **Location:** `Calculator.kt`, each of `Addition`/`Subtraction`/
  `Multiplication`/`Division`/`Modulo`'s own `class` declaration line.
- **Dependencies:** none — confirmed, for real, by searching this
  project's other real files for any direct reference to these five
  classes, before making the change, and finding none.

### The New Code

```kotlin
private class Addition : Operation {
```

### The Updated Project

```kotlin
1  private class Addition : Operation {  // ← changed: was class Addition : Operation
2      override fun apply(current: Int, amount: Int): Int {
3          return current + amount
4      }
5  }
```

`Addition`'s own declaration now carries `private` — visible only within
`Calculator.kt` itself, no longer a real part of this project's own
public API. `Subtraction`, `Multiplication`, `Division`, and `Modulo`
each receive the identical one-word change, for the identical real
reason, confirmed together by the same real build.

### Mechanical walkthrough

- `private` — this lesson's own Terms entry, applied here to a top
  -level class declaration for the first time in this project: restricts
  `Addition`'s own visibility to this same file, `Calculator.kt`,
  specifically — `Operator`'s own enum body, in the same file, can still
  reference it freely; nothing outside this file can, confirmed next by
  a real, deliberate negative case.
- `class Addition : Operation` — the already-established class
  -implementing-interface syntax, entirely unchanged beyond the new
  visibility modifier in front of it.

A real, deliberate negative case confirms the change actually restricts
something:

```kotlin
val checkPrivate = Addition()
```

Compiled from a different file, this real attempt failed:

```
e: .../EncapsulationCheck.kt:3:5 'public' property exposes its 'private-in-file' type Addition
e: .../EncapsulationCheck.kt:3:20 Cannot access 'Addition': it is private in file
```

A second real negative case checks this lesson's own Socratic question
directly — whether `Operation` itself could receive the same treatment:

```kotlin
private fun interface Operation {
```

Compiled against the real project, this real attempt also failed:

```
e: .../Calculator.kt:37:25 'public' property exposes its 'private-in-file' type Operation
```

Real, exact confirmation: `Operator`'s own public `val operation:
Operation` property genuinely requires `Operation` itself to stay
public — a private type cannot be exposed through a public property, the
same real rule both negative cases hit, from two different directions.
`Operation` stays public; its five real implementations do not.

### CS lens

Restricting visibility to exactly what's needed, confirmed by checking
real, existing usage rather than guessing, is the real, concrete
mechanism behind the **information hiding** principle — the specific,
mechanical half of encapsulation this lesson's own Terms entry names
more broadly. Also recognized in: a library exposing a small, public API
while keeping its own internal helper classes package-private or
internal, a class's own private fields accessed only through public
getters, and any module system (Java's own module boundaries, for
instance) enforcing this same idea at a coarser, cross-package scale.

### SE lens

The alternative not chosen is leaving all five classes public
indefinitely, on the reasoning that "something might need them later."
That's a real, common default, and nothing about it would have broken
this project — Kotlin's own default visibility is public specifically
because it's the safe, permissive choice. The real cost of leaving it
that way: every public declaration is a real promise to the rest of the
project (and to anyone reading the code cold) that it might be used from
anywhere, a promise this lesson's own real search proved was never true
for any of these five. Tightening it now, confirmed safe by an actual
full rebuild and a full, still-passing test suite, costs nothing today
and removes five real, honestly-unnecessary entries from what a future
reader has to consider part of this file's own public contract.

### Run it

```
com.example.calculator.CalculatorTest > additionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > subtractionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > multiplicationAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > divisionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > moduloAppliesRealArithmetic PASSED
com.example.calculator.CalculatorScreenTest > pressingDigitsUpdatesDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingClearResetsDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingEqualsWithNoPendingOperatorDoesNothing PASSED
com.example.calculator.CalculatorScreenTest > pressingSevenPlusThreeEqualsShowsTen PASSED

BUILD SUCCESSFUL in 4s
```

All nine of this project's own real tests pass, unchanged, after all
five classes became private, plus a full, real `.apk`, confirmed with
`./gradlew testDebugUnitTest assembleDebug` — real proof this
visibility change altered nothing this project's own real, working
behavior depends on. Both real negative cases, and this final confirming
build, saved at `verification/2.4/step1_five_classes_made_private.txt`,
`verification/2.4/break1_addition_inaccessible_outside_file.txt`,
`verification/2.4/break2_operation_cannot_be_private.txt`, and
`verification/2.4/step2_final_confirm.txt`.

### Connecting the pieces

Every Concept Unit in this lesson comes together here: `Operation`'s own
real, minimal interface (Concept Unit 2) is what let five genuinely
different classes satisfy one shared shape, proven, concretely, to
dispatch polymorphically through a single, unchanging call site (Concept
Unit 1); `Operator`'s own real choice to compose an `Operation` rather
than become one (Concept Unit 3), confirmed against an honestly-compiled
alternative, is exactly what kept those five classes independently
testable in the first place — and independently testable is exactly why
Concept Unit 4 could tighten their own real visibility with total
confidence, backed by a full, still-passing, real test suite, not just a
hopeful guess that nothing would break.

---

## Closing

**Connect the pieces.** Follow one concrete call —
`operator.operation.apply(10, 3)`, from Concept Unit 1's own real,
executed loop — through every unit this lesson built. It works at all
because `Operation` (Concept Unit 2) declares the smallest real contract
that `Addition`/`Subtraction`/`Multiplication`/`Division`/`Modulo` can
all honestly satisfy, each in its own real, different way — proof that a
minimal interface is what actually let five different answers (`13`,
`7`, `30`, `3`, `1`) come back from one unchanging call site, real
polymorphism (Concept Unit 1) in action. That call site itself —
`operator.operation`, not `operator` directly — exists because
`Operator` was built to *hold* a real `Operation`, not *become* one
(Concept Unit 3), confirmed against a real, genuinely-compiled
inheritance-based alternative that would have removed the `.operation`
step at the real cost of coupling every operation permanently to enum
machinery it doesn't need. And the reason this lesson could confidently
make one more real change — hiding `Addition` and its four siblings
behind `private` (Concept Unit 4) — without fear of breaking anything,
is that composition already kept them independently testable, and this
lesson's own full, real, passing test suite is the concrete proof
nothing broke.

**Next: Lesson 2.5, Errors** — `Division`'s own real `current / amount`,
examined again and again across this Stage without being touched, still
throws a genuine `ArithmeticException` for a `0` amount, and `Modulo`'s
own `%`, real evidence this lesson never mentioned, shares the identical
real risk. Lesson 2.5 is where that finally gets handled — and where
Slice 2, a reliable, tested calculator engine, ships.
