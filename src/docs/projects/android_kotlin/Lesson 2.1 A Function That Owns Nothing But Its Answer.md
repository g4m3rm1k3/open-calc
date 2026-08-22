# Lesson 2.1: A Function That Owns Nothing But Its Answer

**What you will build** — `Calculator`, the stateful class every prior
Stage 1 lesson's `=` button leaned on, is removed entirely; pressing `=`
now calls `Operation.apply` directly — a function that was pure all
along, once the unnecessary, mutating wrapper around it is gone. The
transferable problem this lesson is actually about: how to tell whether
a function can be trusted by what it *needs* and what it *touches* —
its inputs and its return value alone — rather than by reading every
line of its body to check what else it might be quietly changing.

**What you need to know first** — `Operation`/`Addition`/`Subtraction`/
`Multiplication`/`Division`/`Operator`, and `Calculator`'s own real,
mutating design, from earlier in Stage 0 and ported into this Android
project in an earlier Stage 1 lesson; the `=` button's existing
smart-cast pattern (`if (operator != null && first != null)`) and the
project's existing plain JUnit test file, both from earlier in Stage 1.

## Terms used in this lesson

- **Pure function** — a function whose entire behavior is captured by two
  things: the values it's given, and the value it returns — nothing it
  reads from outside itself changes what it returns beyond its own
  parameters, and nothing about calling it changes anything outside
  itself. It exists as a named category because a function meeting this
  definition is trustworthy in a specific, checkable way ordinary
  functions aren't guaranteed to be: calling it twice with the same
  inputs is always safe to reason about, and testing it never requires
  more than supplying inputs and checking the return value.
- **Side effect** — any change a function makes that outlives the call
  itself and is visible from outside it — mutating an object's own
  property, writing to a file, printing to the console. It exists as the
  concept naming exactly what a pure function is defined to have none of;
  a function with even one real side effect cannot be pure, regardless
  of how simple or predictable that side effect happens to be.
- **Determinism** — the property that calling a function with the same
  inputs always produces the same output, every time, with no dependency
  on anything external (the current time, random state, mutable data
  elsewhere in the program). It exists as a distinct idea from "has no
  side effects," because a function can genuinely have zero side effects
  and still be non-deterministic (reading the current time and returning
  it changes nothing external, but never returns the same thing twice) —
  purity requires both.
- **Testability** — how directly a piece of code's own correctness can
  be checked: supply real inputs, call it, compare the real output
  against an expected one, with nothing else needed. It exists as a
  practical consequence of the other three terms here, not an
  independent property to build separately — a function that's already
  pure and deterministic is automatically testable this directly,
  proven concretely in this lesson's own Concept Unit 4.

## Objects and methods used

**`System.nanoTime()`**
- What it is: a real, static method returning the current value of a
  high-resolution timer, as a `Long`.
- Implementation: `public static native long nanoTime()`, from Java's own
  `java.lang.System` class — `native` because its real implementation
  reads directly from the underlying operating system's own
  high-resolution clock, not Kotlin or JVM bytecode.
- Its use: demonstrated in this lesson's own isolated lab (Concept Unit
  3, below) as a real, concrete example of a non-deterministic function
  — called twice in immediate succession, its own real return values are
  confirmed, by a real executed test, to differ.
- Type: a `static` method — called on the `System` class itself, never on
  an instance, since `System` holds no per-object state relevant here.
- Responsibility: reports whatever the underlying system clock's own
  current high-resolution reading is, at the exact moment it's called.
- Depends on: nothing from the caller — takes no arguments.
- Connects to: called twice, back to back, in this lesson's own isolated
  lab; its two real return values are compared directly.
- Shape: a real, standard-library example of a function whose own return
  value depends on something entirely external (wall-clock time) —
  contrasted, in this lesson's own Concept Unit 3, with `Operation.apply`,
  which depends on nothing external at all.

### Everything else in the file, not this lesson's subject but still explained

**`Operation`** (reappearing)
- What it is: an interface describing one thing — combining a running
  value with a new amount to produce a new value.
- Implementation: `fun interface Operation { fun apply(current: Int,
  amount: Int): Int }` — unchanged.
- Its use: `Addition`/`Subtraction`/`Multiplication`/`Division`'s own
  shared shape; this lesson's own real subject, once `Calculator`'s
  mutating wrapper around it is removed.
- Type: a functional interface with one abstract method.
- Responsibility: unchanged — describes the one operation any arithmetic
  strategy this project supports must be able to perform.
- Depends on: nothing — a pure contract, unchanged.
- Connects to: implemented by `Addition`/`Subtraction`/`Multiplication`/
  `Division`; called directly by `CalculatorScreen`'s own `=` branch, as
  of this lesson.
- Shape: unchanged — the polymorphic seam this project's arithmetic is
  built on.

**`Addition`** (reappearing)
- What it is: the real implementation of `Operation` for `+`.
- Implementation: `class Addition : Operation { override fun
  apply(current: Int, amount: Int): Int { return current + amount } }` —
  unchanged.
- Its use: this lesson's own primary example — every isolated lab in
  Concept Units 1–3 calls it directly.
- Type: a class implementing `Operation`.
- Responsibility: unchanged — computes `current + amount`, nothing else.
- Depends on: two real `Int` values, supplied by its caller — unchanged.
- Connects to: instantiated directly in this lesson's own isolated labs;
  held, unchanged, by `Operator.PLUS`.
- Shape: unchanged — one of four interchangeable strategies behind
  `Operation`'s own shared shape.

**`Operator`** (reappearing)
- What it is: an enum naming this project's four real arithmetic
  operations, each carrying its own real `Operation` implementation.
- Implementation: `enum class Operator(val operation: Operation) {
  PLUS(Addition()), MINUS(Subtraction()), TIMES(Multiplication()),
  DIVIDE(Division()) }` — unchanged.
- Its use: `CalculatorScreen`'s own `=` branch reads
  `operator.operation.apply(...)` directly, chaining through `Operator`'s
  own `operation` property straight to `Operation.apply` — no
  `Calculator` in between, as of this lesson.
- Type: an enum class, each constant carrying a real, distinct
  `Operation` value.
- Responsibility: unchanged — gives each of the four real operations a
  fixed, named identity.
- Depends on: unchanged — nothing new.
- Connects to: read by `CalculatorScreen`'s own `=` branch and by this
  lesson's own test file, both now calling straight through to
  `Operation.apply` with no intermediate object.
- Shape: unchanged — the real, closed set of arithmetic choices this
  project supports.

---

## Concept Unit 1: Input/Output — A Function Defined by What Goes In and Out

### The Problem

This project's own real code has several functions whose behavior is
easy to describe with a single sentence — `Addition.apply(7, 3)` returns
`10` — and others (`Calculator.perform`) whose behavior needs a longer
description, involving an object's own state before and after the call.
Nothing in this project has yet named the real, meaningful difference
between those two shapes.

> **Try it yourself first:** `Addition.apply` was already fully
> established — a real method, taking two `Int` parameters, returning an
> `Int`. Given only its own real signature — `fun apply(current: Int,
> amount: Int): Int` — and nothing else about how it's implemented, what
> could you predict about calling it twice with the exact same two
> arguments? And: is there anything in that signature that would let you
> predict the *opposite* — that two identical calls might return
> different things?

### Introduce the concept in isolation

```kotlin
@Test
fun applyIsCharacterizedEntirelyByInputAndOutput() {
    val result = Addition().apply(7, 3)
    assertEquals(10, result)
}
```

Run for real, batched together with this lesson's other isolated labs
(Concept Units 2 and 3 reuse this same real execution):

```
com.example.calculator.LabsCU21Test > applyIsCharacterizedEntirelyByInputAndOutput PASSED

BUILD SUCCESSFUL in 1s
```

This proves `Addition().apply(7, 3)` really does return exactly `10` —
unsurprising, given the method's own already-known real implementation,
but the point of this Concept Unit isn't the arithmetic itself: it's that
checking this required nothing beyond calling the function and reading
its return value. No setup beyond constructing `Addition()`, no state to
inspect afterward. A function whose entire observable behavior is
captured by its inputs and its return value is called a **pure
function**.

Discarded: this exact test does not remain in the real project under
this name; Concept Unit 4's own real project change keeps a version of
it, permanently, as this project's own updated `CalculatorTest.kt`.

### No project change for this unit

This Concept Unit names a property the real project's own `Operation`/
`Addition` classes already have, unchanged, rather than introducing new
project code — per this schema's own allowance, Project Change, New
Code, and Updated Project are skipped here because they are genuinely
inapplicable; Concept Unit 4 is where this lesson's own real project
change happens.

### CS lens

Describing a function entirely by the relationship between its inputs
and its output, with nothing else relevant, is the real, mathematical
idea of a function that Kotlin's own `fun` keyword borrows its name
from. Also recognized in: a spreadsheet formula (`=A1+B1` is fully
described by its inputs and result, nothing else), a hash function
(same input, same digest, always), a vending machine's own idealized
model (insert a specific amount, get a specific item — no memory of
earlier purchases affecting this one), and mathematics' own literal
definition of a function as a mapping from inputs to outputs.

### SE lens

The alternative not chosen — and the one this project's own `Calculator`
class, still present at the start of this lesson, actually embodies — is
a function whose real behavior also depends on, and changes, some
object's own stored state. That's not automatically wrong; `Calculator`
compiled, worked, and passed every real test written against it. The
real tradeoff purity offers is what Concept Unit 4 makes concrete: a
function fully described by input and output can be checked, reused, and
reasoned about with nothing beyond itself in view — a real property
`Calculator.perform` never had, since understanding it also meant
understanding whatever `Calculator` instance it was being called on.

### Run it

Shown above, in full: the real, executed, passing test
(`verification/2.1/lab1_input_output_side_effects_determinism.txt`).

### Connecting the pieces

`Addition.apply` is now understood as a function whose entire behavior a
reader can predict from its signature and inputs alone. Concept Unit 2
names exactly what `Calculator.perform` has that `Addition.apply`
doesn't.

---

## Concept Unit 2: Side Effects — What `Calculator.perform` Has That `apply` Doesn't

### The Problem

`Calculator.perform` and `Addition.apply` both "do arithmetic," but only
one of them changes anything beyond its own return value — and
`perform`, as this project's own real code stands at the start of this
lesson, doesn't even have a return value at all.

> **Try it yourself first:** `Calculator.perform`'s own real signature —
> `fun perform(operation: Operation, amount: Int)` — was already
> established, with no return type written, meaning it implicitly
> returns `Unit` (already-established Kotlin syntax). Given that a
> function returning nothing observable still has to do *something* for
> calling it to be worthwhile, what does that suggest about where its
> real effect actually shows up? And: if `calculator.perform(...)` is
> called twice in a row, with the exact same arguments both times, would
> you predict the second call's own real effect is identical to the
> first's, or different — and why?

### Introduce the concept in isolation

```kotlin
@Test
fun calculatorPerformMutatesExternalState() {
    val calculator = Calculator(7)
    calculator.perform(Operator.PLUS.operation, 3)
    assertEquals(10, calculator.displayValue)
    calculator.perform(Operator.PLUS.operation, 3)
    assertEquals(13, calculator.displayValue)
}

@Test
fun applyHasNoExternalStateToMutate() {
    val addition = Addition()
    val firstResult = addition.apply(7, 3)
    val secondResult = addition.apply(7, 3)
    assertEquals(10, firstResult)
    assertEquals(10, secondResult)
}
```

Run for real (same batched pass as Concept Unit 1):

```
com.example.calculator.LabsCU21Test > calculatorPerformMutatesExternalState PASSED
com.example.calculator.LabsCU21Test > applyHasNoExternalStateToMutate PASSED

BUILD SUCCESSFUL in 1s
```

The real, measured contrast: calling `perform(PLUS, 3)` twice on the
*same* `calculator` object produces two *different* real results —
`10`, then `13` — because the second call's own effect builds on the
first's leftover, mutated state. Calling `apply(7, 3)` twice, on the
other hand, produces the identical real result both times, because
nothing about the first call changed anything the second call could
observe. This kind of change — outliving the call, visible from outside
it — is called a **side effect**; `perform` has one (mutating
`displayValue`), `apply` has none.

Discarded: neither test above remains in the real project under these
names; Concept Unit 4's own real project change removes
`Calculator.perform` from this project entirely, so the code being
tested here will not exist to test once this lesson's own real change
lands.

### No project change for this unit

This Concept Unit's own real code is entirely the contrast just shown,
run against the real project's own existing `Calculator` and `Addition`
classes, exactly as they stood before this lesson's own change; per this
schema's own allowance, this unit skips Project Change/New Code/Updated
Project, since Concept Unit 4 is where the real project itself actually
changes.

### CS lens

Distinguishing "changes something the caller can observe by inspecting
external state afterward" from "returns a value and nothing more" is a
real, general idea underlying **referential transparency** — the
property that an expression can be replaced by its own computed value
everywhere it appears, with no change in what the program does.
`addition.apply(7, 3)` can be replaced by the literal `10` anywhere it
appears; `calculator.perform(operation, 3)` cannot, because replacing
the call with "nothing" would silently drop its real effect. Also
recognized in: a spreadsheet formula versus a macro that also writes to
a different cell as a side effect, a getter method versus a setter, and
functional-programming languages that enforce this distinction at the
type-system level rather than leaving it to convention.

### SE lens

The alternative not chosen, in this lesson's own real code, was never a
deliberate one — `Calculator.perform`'s own mutating design was
inherited, unexamined, from Stage 0's console-app version, carried
forward into the real Android project without anyone asking whether it
still needed to work this way once a pure alternative (`Operation.apply`
itself) already existed underneath it the whole time. That's the honest,
real cost of side effects this Concept Unit's own contrast makes
concrete: a function with a side effect is harder to reason about not
because side effects are inherently wrong, but because a reader has to
track an object's own state across calls to know what a given call will
actually do — work `Addition.apply`'s own test, above, never required at
all.

### Run it

Shown above, in full: both real, executed, passing tests
(`verification/2.1/lab1_input_output_side_effects_determinism.txt`).

### Connecting the pieces

`Calculator.perform`'s own real side effect is now named and measured
directly. Concept Unit 3 names the second property purity requires,
alongside "no side effects": determinism.

---

## Concept Unit 3: Determinism — Same Inputs, Same Answer, Every Time

### The Problem

`Addition.apply` was just shown to have no side effects — but "no side
effects" alone doesn't guarantee a function is trustworthy in the way
this lesson has been building toward. A function could, in principle,
change nothing external and still return a different answer every time
it's called, if its own return value depends on something outside its
parameters.

> **Try it yourself first:** `Addition.apply`'s own real implementation —
> `return current + amount` — was already shown, in full, reading only
> its own two parameters and nothing else. Given that, what real,
> concrete evidence would prove it returns the same result for the same
> inputs, every time, rather than just asserting it from the
> implementation alone? And: what would a function's own real
> implementation have to reference — something *outside* its own
> parameters — for two calls with identical arguments to legitimately
> return different results?

### Introduce the concept in isolation

```kotlin
@Test
fun applyIsDeterministic() {
    val addition = Addition()
    val first = addition.apply(7, 3)
    val second = addition.apply(7, 3)
    val third = addition.apply(7, 3)
    assertEquals(10, first)
    assertEquals(10, second)
    assertEquals(10, third)
}

@Test
fun nanoTimeIsNotDeterministic() {
    val first = System.nanoTime()
    val second = System.nanoTime()
    assertNotEquals(first, second)
}
```

Run for real (same batched pass as Concept Units 1–2):

```
com.example.calculator.LabsCU21Test > applyIsDeterministic PASSED
com.example.calculator.LabsCU21Test > nanoTimeIsNotDeterministic PASSED

BUILD SUCCESSFUL in 1s
```

Three real, separate calls to `addition.apply(7, 3)` all produced the
identical real result, `10` — real evidence, not just an inference from
reading the method body, that its output depends on nothing beyond its
own two arguments. The already fully-explained `System.nanoTime()`
provides the real contrast: two real calls, back to back, produced two
different real values, confirmed by a real, passing assertion that they
were *not* equal — proof that a function can have zero side effects
(calling `nanoTime()` changes nothing external) and still fail this
property, because its own return value depends on something outside its
own parameters entirely: the real system clock. This property — same
inputs always produce the same output — is called **determinism**.

Discarded: neither test above remains in the real project under these
names; Concept Unit 4's own real project change keeps a version of the
first, permanently, as this project's own updated `CalculatorTest.kt`.

### No project change for this unit

This Concept Unit's own real code is entirely the contrast just shown;
per this schema's own allowance, this unit skips Project Change/New
Code/Updated Project, since no real project file changes here.

### CS lens

A property checkable by running the same real inputs through a function
multiple times and comparing results is the real, general idea of
**idempotence and repeatability** in testing and system design. Also
recognized in: a build system that must produce byte-identical output
from the same source (a "reproducible build"), a cryptographic hash
function's own defining requirement, a database migration designed to be
safely re-run without changing its own outcome, and scientific
experiments' own requirement that a result be reproducible by anyone
re-running the same procedure.

### SE lens

The alternative not chosen — and a real, common source of bugs in actual
software — is a function that looks pure (no obvious mutation, a real
return value) but secretly isn't deterministic, because its own body
reads something external: the current time, a random number generator, a
static mutable variable elsewhere in the program. `System.nanoTime()`'s
own real, demonstrated behavior is exactly this shape. `Addition.apply`
this lesson can state, with real confidence backed by real, repeated
calls, has no such dependency — its own real implementation, already
shown in full, references only `current` and `amount`, nothing else.

### Run it

Shown above, in full: both real, executed, passing tests
(`verification/2.1/lab1_input_output_side_effects_determinism.txt`).

### Connecting the pieces

`Addition.apply` has now been shown, concretely, to have both properties
purity requires: no side effects (Concept Unit 2) and determinism
(Concept Unit 3). Concept Unit 4 is where this lesson finally acts on
that: removing the impure wrapper that's stood between this project's
UI and its own already-pure arithmetic since it was first ported in.

---

## Concept Unit 4: Testability — Removing the Wrapper, Calling the Pure Function Directly

### The Problem

`Calculator` exists, in this project's own real code, for exactly one
reason: to hold a running value and let `perform` mutate it. Every real
operation `perform` performs is itself already a call to a pure
`Operation.apply` — `Calculator`'s only real job is wrapping that
already-pure call in a stateful, mutating shell. `CalculatorScreen`'s own
`=` branch, and this project's own existing unit test, both depend on
that shell existing.

> **Try it yourself first:** `CalculatorScreen`'s own `=` branch already
> reads `operator.operation` to get a real `Operation` value, before ever
> touching `Calculator` — the exact same real `Operation.apply` this
> lesson's own isolated labs already proved is both side-effect-free and
> deterministic. Given that, what's the smallest possible change to that
> branch that would call `apply` directly, with `first` and
> `displayText.toInt()` as its two real arguments, and skip constructing
> a `Calculator` at all? And: once `Calculator` is called from nowhere
> else in the project, what should happen to the class itself?

### No new isolated lab for this unit

This Concept Unit's own real code directly applies Concept Units 1–3's
own already-proven fact — `Operation.apply` is pure — to the real
project; no new construct to isolate first.

### Project Change

- **Reference Source:** No reference counterpart — this is a refactor of
  this project's own existing code, not a port from elsewhere.
- **Files affected:** `app/src/main/java/com/example/calculator/
  Calculator.kt` (modified — the `Calculator` class removed),
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified —
  the `=` branch), `app/src/test/java/com/example/calculator/
  CalculatorTest.kt` (modified — the existing test updated to match).
- **Change type:** remove (the `Calculator` class), replace (the `=`
  branch's own body), replace (the existing unit test's own body).
- **Location:** `Calculator.kt`, the `class Calculator(...) { ... }`
  block, removed entirely; `MainActivity.kt`, inside the `=` branch,
  replacing its previous `Calculator`-based body; `CalculatorTest.kt`,
  its one existing `@Test` function's own body.
- **Dependencies:** none — this removes a dependency (`Calculator`),
  adding none.

### The New Code

```kotlin
val result = operator.operation.apply(first, displayText.toInt())
displayText = result.toString()
```

### The Updated Project

```kotlin
 1  onClick = {
 2      when {
 3          label[0].isDigit() -> {
 4              displayText = if (displayText == "0") label else displayText + label
 5          }
 6          label == "C" -> {
 7              displayText = "0"
 8          }
 9          label in operatorSymbols -> {
10              firstOperand = displayText.toInt()
11              pendingOperator = operatorSymbols[label]
12              displayText = "0"
13          }
14          label == "=" -> {
15              val operator = pendingOperator
16              val first = firstOperand
17              if (operator != null && first != null) {
18                  val result = operator.operation.apply(first, displayText.toInt())  // ← changed
19                  displayText = result.toString()                                    // ← changed
20              }
21              pendingOperator = null
22              firstOperand = null
23          }
24      }
25  },
```

The `=` branch's own smart-cast pattern (unchanged), and its own real
side-effect on `displayText` (unchanged — this UI code still, correctly,
has a real side effect: updating what the screen shows), now call
`operator.operation.apply(...)` directly instead of constructing a
`Calculator` and mutating it — one fewer object, one fewer real
dependency, the exact same real, already-proven-pure function call
underneath.

### Mechanical walkthrough

- `operator.operation` — the already fully-explained `Operator` enum's
  own `operation` property read, unchanged from before this lesson.
- `.apply(first, displayText.toInt())` — the already fully-explained
  `Operation.apply` call, its two arguments the already fully-explained
  smart-cast `first` and the already fully-explained `String.toInt()`
  call on `displayText` — the identical two arguments the removed
  `Calculator(first).perform(operator.operation, displayText.toInt())`
  call used to supply, now reaching `apply` with nothing in between.
- `val result = ...` — an already-established `val` declaration, holding
  `apply`'s own real return value directly — the piece of information
  `Calculator.perform`'s own `Unit` return type never gave a caller
  access to without a separate read of `calculator.displayValue`
  afterward.
- `displayText = result.toString()` — the already fully-explained
  `Int.toString()` call, writing `apply`'s own real result straight to
  the display — one assignment, reading directly from a local `val`
  instead of an object's own mutated property.

### CS lens

Removing an object whose only real job was mediating access to an
already-pure function, once that mediation is recognized as
unnecessary, is a real, general refactoring idea: **collapsing an
unneeded layer of indirection**. Also recognized in: removing a
pass-through wrapper method that only ever forwards its arguments
unchanged, inlining a single-use variable, and any code review comment
asking "why does this object exist if all it does is call this other
function?" — the exact question this lesson's own Concept Units 1–3
answered concretely enough to act on.

### SE lens

The alternative not chosen is keeping `Calculator` around, unused by the
real UI code, "in case something needs it later." That's a real,
tempting instinct, and a real cost: a class with no real caller left in
the project is dead weight a future reader has to understand and
maintain the mental model of, for no working benefit — confirmed, this
session, by an actual negative-case compile after its removal
(`Unresolved reference: Calculator`, proving it's genuinely gone, not
just unused) and by every one of this project's own existing real tests
still passing afterward, proving nothing depended on it that this
refactor missed. Testability's own real payoff, concretely: this
lesson's updated unit test needs no object construction at all —
`Operator.PLUS.operation.apply(7, 3)`, one line, checked against `10` —
compared to the old test's own three-line
construct-mutate-then-read-a-property shape.

### Run it

```kotlin
class CalculatorTest {

    @Test
    fun additionAppliesRealArithmetic() {
        val result = Operator.PLUS.operation.apply(7, 3)
        assertEquals(10, result)
    }
}
```

Run for real, along with every other test this project has, after the
real refactor:

```
com.example.calculator.CalculatorTest > additionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorScreenTest > pressingDigitsUpdatesDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingClearResetsDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingEqualsWithNoPendingOperatorDoesNothing PASSED
com.example.calculator.CalculatorScreenTest > pressingSevenPlusThreeEqualsShowsTen PASSED

BUILD SUCCESSFUL in 5s
```

Every real test this project has — including `pressingSevenPlusThree
EqualsShowsTen`, the same real, executed UI test proving `7`, `+`, `3`,
`=` shows `"10"` — still passes, real, concrete regression evidence that
removing `Calculator` changed nothing this project actually depends on.
Saved at `verification/2.1/step1_refactor_full_regression_test.txt`,
alongside the real negative-case compile confirming `Calculator` is
genuinely gone
(`verification/2.1/break1_calculator_class_removed.txt`).

### Connecting the pieces

Every Concept Unit in this lesson comes together here: `Addition.apply`,
proven pure by Concept Units 1–3's own real, executed evidence, is now
the *only* thing standing between a real button press and a real
arithmetic result — no mutable object, no side effect beyond the one
this UI code has always legitimately needed (updating the screen), and a
unit test simple enough to write in one line.

---

## Closing

**Connect the pieces.** Follow one concrete value — the real return of
`Addition().apply(7, 3)` — through every unit this lesson built. Concept
Unit 1's own real, executed test first proved that call returns exactly
`10`, and that checking it required nothing beyond the call itself — a
**pure function**, by this lesson's own definition. Concept Unit 2 named
what `Calculator.perform` had that this call doesn't: a real **side
effect**, proven concretely by two real calls to `perform` producing two
different results on the same object, while two real calls to `apply`
produced the identical one. Concept Unit 3 named the second property
purity requires: real, repeated calls to `apply` always returning `10`,
contrasted with `System.nanoTime()`'s own real, measured **non**-determinism.
And Concept Unit 4 acted on all three: `Calculator` removed from the
real project entirely, `CalculatorScreen`'s own `=` branch now calling
`operator.operation.apply(...)` directly, and every one of this
project's own real tests — including the exact end-to-end `7 + 3 = 10`
proof — still passing afterward, real evidence the refactor changed
nothing this project's users would ever notice, while removing a real,
previously-unexamined side effect this lesson's own analysis is what
finally surfaced.

**Next: Lesson 2.2, Unit Testing** — this lesson's own tests, real as
they are, cover exactly one operator and a handful of UI flows. Lesson
2.2 builds out the fuller test suite this Slice's own name promises —
`2 + 2 = 4`, `10 − 3 = 7`, `5 × 6 = 30`, `20 ÷ 4 = 5` — with real
Arrange/Act/Assert structure, now that `Operation.apply`'s own proven
purity is exactly what makes each one of those a one-line, trustworthy
test to write.
