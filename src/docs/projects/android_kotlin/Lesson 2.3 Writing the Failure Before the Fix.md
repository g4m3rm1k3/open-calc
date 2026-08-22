# Lesson 2.3: Writing the Failure Before the Fix

**What you will build** — a fifth real arithmetic operation,
`Modulo` (`%`), added to this project's own domain logic through a real,
executed Red→Green→Refactor cycle: a test written *before* `Modulo`
exists, watched fail for two genuinely different real reasons, then made
to pass with the minimum real code, then checked for a real refactor
opportunity. The transferable problem this lesson is actually about: how
writing the test first changes what "done" means — a specific, already
-defined target a real command either hits or doesn't, not a vague
intention a person judges afterward by reading the code and feeling
satisfied.

**What you need to know first** — `Operation`/`Operator`'s existing
architecture (a real class implementing `Operation`, held by a new
`Operator` enum constant); Arrange/Act/Assert-structured tests and
`assertEquals`, both from an earlier Stage 2 lesson; `fun interface`/SAM
conversion, from earlier in Stage 0.

## Terms used in this lesson

- **Test-Driven Development (TDD)** — a real, disciplined workflow where
  a test for a piece of behavior is written *before* the code that
  provides that behavior exists, in a repeating three-phase cycle: Red,
  Green, Refactor. It exists because writing the test first forces a
  concrete, checkable definition of "correct" to exist before any
  implementation choice is made — the alternative, writing code first and
  a test afterward, risks a test quietly shaped to match whatever the
  code already happens to do, rather than what it's actually supposed to
  do.
- **Red** — the phase where a real test exists and genuinely fails,
  because the code it exercises either doesn't exist yet or doesn't yet
  behave correctly. It exists as the deliberate starting point of the
  cycle — proof the test is actually capable of failing, and therefore
  capable of meaning something when it later passes.
- **Green** — the phase where the minimum real code needed to make a
  failing test pass has been written, and the test now genuinely
  succeeds. It exists as the cycle's own definition of "done, for now" —
  not "the implementation feels complete," but "the one specific,
  already-written claim is now true."
- **Refactor** — the phase where real code — test or production, either
  or both — is examined for real, worthwhile structural improvement,
  with the already-passing test (or tests) run again afterward to prove
  nothing broke. It exists as a deliberately separate, later step,
  precisely so "make it correct" and "make it well-structured" are never
  attempted as one single, harder-to-verify change.
- **The `%` (modulo/remainder) operator** — a Kotlin operator computing
  the real, integer remainder left over after dividing one `Int` by
  another. It exists as a distinct arithmetic operation from `/`
  (integer division, already established) — `17 / 5` and `17 % 5` are two
  different real questions about the same two numbers: "how many whole
  times does 5 go into 17" versus "what's left over after it does."

## Objects and methods used

**`Modulo`**
- What it is: the real implementation of `Operation` for `%`, this
  lesson's own real subject.
- Implementation: `class Modulo : Operation { override fun
  apply(current: Int, amount: Int): Int { return current % amount } }` —
  written across this lesson's own real Red→Green cycle, below.
- Its use: the real behavior behind a new `Operator.MODULO` constant,
  proven correct by this lesson's own real, executed test
  (`17 % 5` equals `2`).
- Type: a class implementing `Operation`.
- Responsibility: computes `current % amount` — the real integer
  remainder — nothing else.
- Depends on: two real `Int` values, supplied by its caller — the
  identical shape every other `Operation` implementation already has.
- Connects to: instantiated once, held by the new `Operator.MODULO`
  constant; called directly by this lesson's own updated
  `CalculatorTest.kt`, the same way every other operator's own test
  already calls its own operation.
- Shape: a fifth interchangeable strategy behind `Operation`'s own
  shared shape — structurally identical to `Addition`/`Subtraction`/
  `Multiplication`/`Division`, differing only in which real operator its
  own `apply` body uses.

### Everything else in the file, not this lesson's subject but still explained

**`Operation`** (reappearing)
- What it is: an interface describing one thing — combining a running
  value with a new amount to produce a new value.
- Implementation: `fun interface Operation { fun apply(current: Int,
  amount: Int): Int }` — unchanged.
- Its use: `Modulo`'s own real shape, this lesson's real subject, is one
  more implementation of this same, unchanged contract.
- Type: a functional interface with one abstract method.
- Responsibility: unchanged — describes the one operation any arithmetic
  strategy this project supports must be able to perform.
- Depends on: unchanged — nothing.
- Connects to: implemented, now, by five real classes instead of four;
  called by whichever test or UI code reads a given `Operator`
  constant's own `operation` property.
- Shape: unchanged — the polymorphic seam this project's arithmetic is
  built on, now one implementation wider.

**`Operator`** (reappearing)
- What it is: an enum naming this project's real arithmetic operations,
  each carrying its own real `Operation` implementation.
- Implementation: `enum class Operator(val operation: Operation) {
  PLUS(Addition()), MINUS(Subtraction()), TIMES(Multiplication()),
  DIVIDE(Division()), MODULO(Modulo()) }` — the same four already-real,
  already-tested constants (`Addition`/`Subtraction`/`Multiplication`/
  `Division`, each proven correct in an earlier Stage 2 lesson), plus one
  new one, `MODULO`, holding this lesson's own real `Modulo`.
- Its use: this lesson's own updated `CalculatorTest.kt` reads
  `Operator.MODULO.operation` directly, the identical pattern every other
  operator's own test already uses.
- Type: an enum class, each constant carrying a real, distinct
  `Operation` value.
- Responsibility: unchanged — gives each of this project's real
  operations a fixed, named identity.
- Depends on: unchanged — nothing new beyond each constant's own already
  -built `Operation` value.
- Connects to: read by this lesson's own new test; its own `MODULO`
  constant is not yet read by anything in `CalculatorScreen`'s own real
  UI code — a deliberate scope limit, named in this lesson's own SE Lens.
- Shape: unchanged in role — the real, now five-member, closed set of
  arithmetic choices this project's own domain logic supports.

**`assertEquals(...)`** (reappearing)
- What it is: the function that fails a test, with a real, descriptive
  error, unless two given values are equal.
- Implementation: a real, heavily overloaded static function on
  `org.junit.Assert` — unchanged; this lesson's own calls, like every
  other test in this project, resolve to the `Object, Object` overload,
  confirmed for real, this session, in an earlier Stage 2 lesson's own
  bytecode inspection.
- Its use: the final line of this lesson's own new test, checking
  `Modulo`'s own real computed result against the literal `2`.
- Type: a `static` function on `org.junit.Assert`.
- Responsibility: unchanged — compares two given values, failing
  immediately with a real, descriptive message if they differ.
- Depends on: unchanged — two values to compare.
- Connects to: called once, as this lesson's own new test's own final
  statement.
- Shape: unchanged — the one real point of contact between "code that
  computes something" and a machine's own judgment of whether that
  something is correct.

---

## Concept Unit 1: Red, Part One — A Test Against Code That Doesn't Exist Yet

### The Problem

Every test this project has, so far, was written *after* the code it
checks already existed and worked. TDD reverses that order — but writing
a test for something that genuinely doesn't exist yet raises an
immediate, real question: what actually happens when that test is
compiled?

> **Try it yourself first:** `Operator`'s own four existing constants —
> `PLUS`, `MINUS`, `TIMES`, `DIVIDE` — were already established as real,
> named members of a real enum; referencing a name that isn't one of
> them was already proven, in an earlier lesson, to be a real compile
> error (`Unresolved reference`). Given that, and given Kotlin checks
> types and names at compile time rather than only when code actually
> runs (already established, contrasted with a dynamically-typed
> language, in earlier lessons), what would you predict happens if a
> brand-new test is written referencing `Operator.MODULO` — a constant
> that, at the moment the test is written, doesn't exist anywhere in this
> project? And: is that outcome still meaningfully "Red," in the sense
> this lesson's own Terms just defined it, even though no test actually
> *ran*?

### Introduce the concept in isolation

```kotlin
@Test
fun moduloAppliesRealArithmetic() {
    // Arrange
    val operation = Operator.MODULO.operation

    // Act
    val result = operation.apply(17, 5)

    // Assert
    assertEquals(2, result)
}
```

Added to the real project's own `CalculatorTest.kt`, with no `Modulo`
class and no `MODULO` constant existing anywhere yet. Run for real:

```
e: .../CalculatorTest.kt:59:34 Unresolved reference: MODULO

FAILURE: Build failed with an exception.
```

A real, actual compile failure — this project's first Red state that
never reaches the point of actually *running* a test at all, because
Kotlin's own compiler refuses to build code referencing something that
doesn't exist. This is still genuinely **Red**: a real, concrete claim
now exists in this project's own source (`Operator.MODULO.operation.
apply(17, 5)` should equal `2`), and it is provably not yet true — a
compile error is one honest, real way for "not yet true" to manifest in
a statically-typed language, distinct from, but no less real than, a
test that compiles and fails at runtime.

Discarded: nothing to discard — this exact test, unlike this lesson's
earlier isolated labs, is not thrown away; it stays in the real project,
permanently, once it's actually made to pass.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/test/java/com/example/calculator/
  CalculatorTest.kt` (modified).
- **Change type:** add (a new test, referencing code that doesn't exist
  yet).
- **Location:** `CalculatorTest.kt`'s own class body, directly after
  `divisionAppliesRealArithmetic`.
- **Dependencies:** none beyond what earlier lessons already resolved —
  deliberately, since the whole point of this step is that `Operator.
  MODULO` does *not* exist yet.

### The New Code

```kotlin
@Test
fun moduloAppliesRealArithmetic() {
    // Arrange
    val operation = Operator.MODULO.operation

    // Act
    val result = operation.apply(17, 5)

    // Assert
    assertEquals(2, result)
}
```

### The Updated Project

```kotlin
 1  class CalculatorTest {
 2
 3      // ... additionAppliesRealArithmetic, subtractionAppliesRealArithmetic,
 4      // multiplicationAppliesRealArithmetic, divisionAppliesRealArithmetic
 5      // all unchanged, exactly as an earlier Stage 2 lesson left them
 6
 7      @Test                                                    // ← new
 8      fun moduloAppliesRealArithmetic() {                      // ← new
 9          // Arrange                                           // ← new
10          val operation = Operator.MODULO.operation             // ← new
11
12          // Act                                                // ← new
13          val result = operation.apply(17, 5)                    // ← new
14
15          // Assert                                              // ← new
16          assertEquals(2, result)                                 // ← new
17      }                                                          // ← new
18  }
```

`CalculatorTest` now has a fifth test — real, permanent, and, at this
exact moment, not yet compilable, because nothing in the real project
defines `Operator.MODULO` yet.

### Mechanical walkthrough

- `@Test`, `// Arrange`/`// Act`/`// Assert`, `assertEquals(2, result)`
  — every already-established construct from this test's own shape,
  unchanged, applied to a fifth operator, exactly as the identical shape
  was already applied to the first four in an earlier lesson.
- `val operation = Operator.MODULO.operation` — a reference to a
  constant, `MODULO`, that this exact line is the first place in the
  entire project to name — the specific reference the real compile
  failure, above, is about.
- `operation.apply(17, 5)` — the already fully-explained `Operation.
  apply` call; its own real behavior is irrelevant to this Concept
  Unit's own point, since the code never reaches this line at all while
  `operation` itself can't be resolved.

### CS lens

A specification written and checked before an implementation exists,
with the checking mechanism itself (here, the compiler) enforcing that
the specification can't silently pass by accident, is a real, general
idea recognized well beyond TDD specifically: **specification-first
design**. Also recognized in: an interface or API contract published
before any implementation is written against it, a database schema
migration written before the application code that will use the new
column, and a type signature written before a function body (a real,
everyday version of exactly this ordering, in any statically-typed
language).

### SE lens

The alternative not chosen is writing `Modulo` and `Operator.MODULO`
first, then writing a test against them afterward — this project's own
established pattern for its first four operators. That's a real,
legitimate way to write tested code, and nothing about it is wrong. The
real, different thing TDD's own reversed order buys: this exact test,
written first, is proof the test can genuinely fail — a test written
*after* working code, especially one written by copying an existing
passing test's shape and just changing numbers, always carries a small,
real risk of a mistake that makes it pass regardless of whether the code
underneath is actually correct. A test proven capable of failing, before
it ever passes, doesn't carry that particular risk.

### Run it

Shown above, in full: the real, actual compile failure
(`verification/2.3/red1_compile_error_modulo_unresolved.txt`).

### Connecting the pieces

This project now has a real, permanent, currently-uncompilable test.
Concept Unit 2 gets it compiling — with a deliberately wrong
implementation, to observe the *other* real shape Red can take.

---

## Concept Unit 2: Red, Part Two — Compiling, and Still Wrong

### The Problem

A compile error proves a claim doesn't exist yet; it doesn't prove
anything about whether a real, existing implementation is *correct*. Most
of TDD's own real value, in a statically-typed language, lives in this
second kind of failure — not "this doesn't exist," but "this exists,
and it's wrong."

> **Try it yourself first:** `Addition`, `Subtraction`, `Multiplication`,
> and `Division` all share one real, common shape: a class implementing
> `Operation`, with one method, `apply`, doing real arithmetic. Given
> that a class implementing `Operation` just needs *some* method body
> satisfying that real, compiler-checked contract — not necessarily a
> *correct* one — what's the smallest possible real `Modulo` class that
> would make `Operator.MODULO` compile, without yet computing the right
> answer? And: once such a class exists, what would you predict this
> lesson's own already-written test — unchanged since Concept Unit 1 —
> actually reports?

### Introduce the concept in isolation

```kotlin
class Modulo : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return 0
    }
}

enum class Operator(val operation: Operation) {
    PLUS(Addition()),
    MINUS(Subtraction()),
    TIMES(Multiplication()),
    DIVIDE(Division()),
    MODULO(Modulo())
}
```

Run for real — the exact same, unchanged test from Concept Unit 1:

```
java.lang.AssertionError: expected:<2> but was:<0>
```

A real, different kind of failure: the code now compiles — `Modulo`
genuinely satisfies `Operation`'s own real contract — and the test
genuinely *runs*, reaching `assertEquals` for the first time, which
genuinely fails, because `0` really is what this deliberately-wrong
`apply` body returns, and `0` really isn't `2`. This is Red's own second
real shape: not "doesn't exist," but "exists, runs, and is provably
wrong" — the same real assertion-failure shape Concept Unit 2 of an
earlier Stage 2 lesson already demonstrated on purpose, now reached
honestly, as a real, intermediate step in building something new.

Discarded: the literal `return 0` body shown here does not remain in the
real project — Concept Unit 3 replaces it with a real, correct one,
in place.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  Calculator.kt` (modified).
- **Change type:** add (a new class, deliberately incorrect) and add (a
  new enum constant referencing it).
- **Location:** `Calculator.kt`, a new `Modulo` class added after
  `Division`; `Operator`'s own enum body, a new `MODULO` constant added
  after `DIVIDE`.
- **Dependencies:** none beyond what earlier lessons already resolved.

### The New Code

```kotlin
class Modulo : Operation {
    override fun apply(current: Int, amount: Int): Int {
        return 0
    }
}
```

### The Updated Project

```kotlin
 1  class Division : Operation {
 2      override fun apply(current: Int, amount: Int): Int {
 3          return current / amount
 4      }
 5  }
 6
 7  class Modulo : Operation {              // ← new
 8      override fun apply(current: Int, amount: Int): Int {  // ← new
 9          return 0                         // ← new
10      }                                    // ← new
11  }                                        // ← new
12
13  enum class Operator(val operation: Operation) {
14      PLUS(Addition()),
15      MINUS(Subtraction()),
16      TIMES(Multiplication()),
17      DIVIDE(Division()),
18      MODULO(Modulo())                     // ← new
19  }
```

`Calculator.kt` now has a real, compiling `Modulo` class, deliberately
returning `0` regardless of its own two arguments, and `Operator` now
has a real `MODULO` constant holding it — enough for Concept Unit 1's
own test to finally compile and run, and fail for a genuine, different
reason than before.

### Mechanical walkthrough

- `class Modulo : Operation` — the already-established class-implementing
  -interface syntax, satisfying `Operation`'s own real, compiler-checked
  contract.
- `override fun apply(current: Int, amount: Int): Int { return 0 }` — a
  real, complete, compiling method body — the already-established
  `override` syntax, with a deliberately wrong return value, `0`,
  chosen specifically because it's provably not the real answer to
  `17 % 5`.
- `MODULO(Modulo())` — a real enum constant declaration (already
  -established syntax, the same shape `PLUS(Addition())` already used),
  constructing one real `Modulo` instance and holding it as `MODULO`'s
  own `operation` property.

### CS lens

Building the smallest possible real, compiling implementation before
worrying about correctness — sometimes literally a hardcoded, wrong
constant — is a real, recognized TDD technique often called **"fake it
till you make it"** or the *obvious implementation* versus *fake*
strategy debate within TDD's own practice. Also recognized in: a stub
function returning a hardcoded value while a real API integration is
still being built, a mock object standing in for a real dependency
during early development, and scaffolding code deliberately marked
`TODO` that compiles and runs, even though it isn't finished.

### SE lens

The alternative not chosen is writing `Modulo`'s own real, correct body
directly, skipping this deliberately-wrong intermediate step. For an
operation this simple, that's a completely reasonable shortcut, and most
of this project's own earlier tests were written that way. The real
value of stopping here, deliberately, even for one line of code: it
proves the test's own assertion is actually being reached and actually
being checked — a subtle, real risk in any test is one that compiles,
runs, and passes *without ever really exercising the thing it claims to*
(a typo in the Act step calling the wrong method, for instance); seeing
it fail first, for the right reason, rules that out.

### Run it

Shown above, in full: the real, executed, genuinely-failing test
(`verification/2.3/red2_stub_compiles_but_fails.txt`).

### Connecting the pieces

`Modulo` now exists, compiles, and is provably wrong. Concept Unit 3
makes it provably right.

---

## Concept Unit 3: Green — The Minimum Real Fix

### The Problem

`Modulo.apply` compiles and runs, but returns `0` unconditionally —
nothing about its own real body computes an actual remainder yet.

> **Try it yourself first:** this lesson's own Terms already named `%` as
> Kotlin's real modulo/remainder operator, distinct from `/`. Given
> `Modulo`'s own real, already-established method signature — `fun
> apply(current: Int, amount: Int): Int` — and given every other
> `Operation` implementation's own real body is exactly one line, using
> exactly one real Kotlin arithmetic operator on its own two parameters,
> what's the smallest possible real change to `Modulo`'s own body that
> would make Concept Unit 1's own already-written test pass? And: once
> that one line changes, what would you predict happens to this
> project's other four, already-passing tests — do they need any change
> at all, given none of them touch `Modulo`?

### No new isolated lab for this unit

This Concept Unit's own real change is the smallest possible edit to
already-shown code — no new construct to isolate; its own real
verification is the actual project change itself, next.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  Calculator.kt` (modified).
- **Change type:** replace (`Modulo.apply`'s own body).
- **Location:** `Modulo`'s own `apply` method, the single line inside it.
- **Dependencies:** none.

### The New Code

```kotlin
return current % amount
```

### The Updated Project

```kotlin
1  class Modulo : Operation {
2      override fun apply(current: Int, amount: Int): Int {
3          return current % amount  // ← changed: was return 0
4      }
5  }
```

`Modulo.apply` now computes a real remainder, using this lesson's own
Terms entry, the `%` operator, in place of the deliberately-wrong
literal `0` Concept Unit 2 left behind.

### Mechanical walkthrough

- `return current % amount` — the already-established `return` statement
  (unchanged), now returning a real expression instead of a literal;
  `current % amount` applies this lesson's own `%` operator to `Modulo`'s
  own two parameters, computing the real integer remainder of dividing
  `current` by `amount` — for this lesson's own real test case,
  `17 % 5`, the real value `2` (`17` divided by `5` goes in three whole
  times, `15`, leaving a real remainder of `2`).

### CS lens

Writing the smallest real change that turns a known-failing check into a
passing one, and stopping there — not the most elegant, most general, or
most "complete" version imaginable, just the minimum real fix — is TDD's
own core discipline, often summarized as **"write the simplest thing
that could possibly work."** Also recognized in: an incremental bug fix
addressing exactly the failing case a bug report describes before
considering related edge cases, a minimum viable product built to
satisfy one real, specific requirement before generalizing, and
Occam's razor applied to implementation choices specifically.

### SE lens

The alternative not chosen is writing a more "defensive" `Modulo` up
front — handling a zero `amount`, negative operands, or other edge
cases the current test doesn't ask about. TDD's own real discipline
deliberately defers that: only the one real, currently-failing test
justifies writing code right now, and `17 % 5` says nothing about what
`Modulo`'s own behavior should be for `amount = 0` (which, worth noting
honestly, `%`'s own real Kotlin semantics would throw the identical real
`ArithmeticException` `/` already does for the same reason — still this
project's own deliberately-deferred error-handling territory, not
introduced fresh here). Writing only what's needed to pass the test that
exists keeps every real line of code traceable to a real, specific,
already-checked claim.

### Run it

```
com.example.calculator.CalculatorTest > moduloAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > additionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > subtractionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > multiplicationAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > divisionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorScreenTest > pressingDigitsUpdatesDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingClearResetsDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingEqualsWithNoPendingOperatorDoesNothing PASSED
com.example.calculator.CalculatorScreenTest > pressingSevenPlusThreeEqualsShowsTen PASSED

BUILD SUCCESSFUL in 4s
```

Every real test this project now has — nine total — passes, including
the new modulo test and, unchanged, all eight that existed before this
lesson, plus a full, real `.apk`, confirmed with `./gradlew
testDebugUnitTest assembleDebug`. Saved at
`verification/2.3/green_full_suite_and_assembleDebug.txt`.

### Connecting the pieces

`Modulo` is now real, correct, and proven correct by a test that was
written before it existed. Concept Unit 4 steps back and asks whether
anything about the result is worth restructuring.

---

## Concept Unit 4: Refactor — A Real Design Question, Actually Checked

### The Problem

`Modulo` is now this project's fifth `Operation` implementation, each an
almost-identical, single-expression class. An earlier Stage 0 lesson
already flagged this exact shape as a real, open design question —
whether these should stay as named classes or become lambdas — and
deliberately kept them as classes, reasoning that "permanent names
remain valuable once more operations are added." A fifth operation just
arrived. Is that reasoning still correct, or was it only ever a guess?

> **Try it yourself first:** `Operation` was established, back in Stage
> 0, as a `fun interface` — meaning any matching lambda, not just a
> named class, can satisfy it directly, via SAM conversion. Given that,
> what would a lambda-based version of `Operator`'s own enum constants
> look like — `PLUS(Operation { current, amount -> current + amount })`,
> for instance — compared to today's real `PLUS(Addition())`? And: with
> a fifth operation now real, does the case *for* keeping named classes
> get stronger, weaker, or stay the same, compared to when that original
> decision was made with only four?

### No new isolated lab for this unit

This Concept Unit's own real work is investigation and a design
decision, not a new construct to isolate — its own real verification is
the actual comparison performed, next, plus a real, unchanged passing
test suite confirming no production code needed to change.

### Investigating the real alternative

A lambda-based version of `Operator`'s own enum was written, for real,
as a genuine comparison — not kept in the project, but actually
compiled to confirm it's a real, live option, not a hypothetical one:

```kotlin
private val lambdaModulo = Operation { current, amount -> current % amount }

enum class LambdaOperator(val operation: Operation) {
    PLUS(Operation { current, amount -> current + amount }),
    MODULO(lambdaModulo)
}
```

Run for real:

```
BUILD SUCCESSFUL in 619ms
```

This confirms the lambda-based alternative genuinely compiles — the
choice between it and today's real, named-class design is a live one,
not a strawman. Weighed against that real alternative: a lambda
satisfies `Operation`'s own contract with less code per operation, but
loses `Addition`/`Subtraction`/`Multiplication`/`Division`/`Modulo`'s own
real, individually-named identities — a stack trace or a debugger
stepping through `Modulo.apply` names the real class; stepping through
an anonymous lambda does not, the same way an earlier Stage 0 lesson's
own SE Lens already reasoned. With five real operations now, that
argument hasn't weakened — if anything, naming stays valuable exactly
because there are more of them to tell apart at a glance, in a stack
trace, or in this lesson's own test names.

**The real decision, confirmed rather than assumed: no structural
change.** `Modulo` stays a named class, matching its four siblings —
Concept Unit 3's own real, minimal fix already reflects this; this
Concept Unit's own real job was checking whether that original choice
still holds, not changing it, and it does.

Discarded: `lambdaModulo`/`LambdaOperator` above do not appear in the
real project; they existed only to prove the comparison was real, not
assumed.

### Run it

```
com.example.calculator.CalculatorTest > moduloAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > additionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > subtractionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > multiplicationAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > divisionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorScreenTest > pressingDigitsUpdatesDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingClearResetsDisplay PASSED
com.example.calculator.CalculatorScreenTest > pressingEqualsWithNoPendingOperatorDoesNothing PASSED
com.example.calculator.CalculatorScreenTest > pressingSevenPlusThreeEqualsShowsTen PASSED

BUILD SUCCESSFUL in 4s
```

The identical real suite from Concept Unit 3, run again, unchanged and
still passing — real, concrete proof that this Concept Unit's own
investigation, even though it produced code, changed nothing about the
real, shipped project; both saved at
`verification/2.3/refactor_lambda_alternative_compiles.txt` (the real
lambda comparison) and `verification/2.3/green_full_suite_and_
assembleDebug.txt` (the unchanged, still-passing real suite).

### CS lens

Deliberately treating "does this still work" and "is this still the
right design" as two separate, sequential questions — never mixing a
correctness fix with a structural change in the same step — is TDD's
own real discipline around the word **Refactor** specifically: a
refactor, by definition, changes structure without changing observable
behavior, verified by the exact same tests passing before and after.
Also recognized in: a database schema migration split into "add the new
column" and "backfill and switch over," kept as two separate, separately
-verified steps; a compiler's own distinct optimization passes, each
required to preserve a program's real, observable behavior; and code
review culture that flags a pull request mixing a bug fix with an
unrelated rename as two changes that should have been two pull requests.

### SE lens

The alternative not chosen here is skipping this Concept Unit
entirely — Concept Unit 3 already left the project in a real, complete,
passing state, and nothing *forced* a design review to happen. The real
value of doing it anyway: an earlier lesson's own design decision was
made once, with four data points, and quietly trusted ever since; this
lesson's own real, executed comparison is what turns "still probably
true" into "actually re-checked, with a fifth real data point, and
confirmed" — a small, genuine example of Refactor's own real job:
revisiting a structural question on purpose, rather than only when
something breaks.

### Connecting the pieces

Every Concept Unit in this lesson comes together here: a test that
provably couldn't compile (Concept Unit 1), then provably ran and failed
(Concept Unit 2), then provably passed with the minimum real fix
(Concept Unit 3), and, finally, a real, checked confirmation that the
resulting structure — five named `Operation` classes, not five
lambdas — is still the right one, not merely the one nobody questioned
(Concept Unit 4).

---

## Closing

**Connect the pieces.** Follow one concrete claim — `17 % 5 = 2` —
through every unit this lesson built. It started as a real test
(Concept Unit 1) that couldn't even compile, a genuine `Unresolved
reference: MODULO` — Red, in its first real shape. A deliberately wrong
`Modulo` (Concept Unit 2) made it compile and run, reaching a real,
different failure — `expected:<2> but was:<0>` — Red's second real
shape, proof the test was actually being exercised. One real line,
`return current % amount` (Concept Unit 3), turned that into Green — not
just this one test, but all nine of this project's own real tests,
still passing together. And Concept Unit 4's own real investigation —
an actual, compiled lambda-based alternative, weighed honestly against
`Modulo`'s own real, named-class design — confirmed Refactor's own real
verdict: no change needed, a decision re-checked with real evidence, not
left standing only because nobody looked.

**Next: Lesson 2.4, Polymorphic Operations** — `Modulo`'s own real
`MODULO` constant, deliberately, is not yet wired into
`CalculatorScreen`'s own real keypad — Stage 2 is about testing and
better OOP, not new UI, and a real, new keypad button is honestly
Stage 3's own territory. Lesson 2.4 instead looks at this project's own
now-five-member `Operation`/`Operator` hierarchy directly, through
Polymorphism, Interfaces, Composition, and Encapsulation.
