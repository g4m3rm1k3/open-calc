# Lesson 2.2: Checking a Claim Instead of Reading the Code

**What you will build** — this project's own test file grows from one
addition-only test into a real, complete suite: one test per operator,
each following the same explicit three-part structure, checking the
exact four claims this Slice's own name promises — `2 + 2 = 4`,
`10 − 3 = 7`, `5 × 6 = 30`, `20 ÷ 4 = 5`. The transferable problem this
lesson is actually about: how to state a claim about code precisely
enough that a machine, not a reader, can decide whether it's true — and
how to structure that claim so a reader can still tell, at a glance,
what's being set up, what's being done, and what's actually being
checked.

**What you need to know first** — `Operation`/`Addition`/`Subtraction`/
`Multiplication`/`Division`/`Operator`, all proven pure and deterministic
in an earlier Stage 2 lesson; the project's existing `CalculatorTest.kt`
and its one existing test, `@Test`-annotated, calling `Operation.apply`
directly with no object construction.

## Terms used in this lesson

- **Test** — a piece of code whose entire job is exercising some other
  piece of code with real inputs and checking whether the real result
  matches an expected one — automatically, repeatably, without a human
  reading output and judging it by eye. It exists because "I read the
  function and it looks right" is not the same claim as "I ran the
  function and confirmed it," and only the second one survives the
  function being changed later by someone who never reads the original
  reasoning.
- **`@Test`** (reappearing) — a JUnit annotation marking a function as a
  test case JUnit's own runner should actually execute and report a
  pass/fail result for, rather than an ordinary helper method that
  happens to sit inside a test class. It exists so a test runner can
  find, by inspection, exactly which functions in a file are real tests
  without a human maintaining a separate list.
- **Arrange/Act/Assert** — a structural convention for organizing one
  test's own body into three distinct parts, in this order: set up
  whatever the test needs (Arrange), perform the one real action being
  tested (Act), and check the result (Assert). It exists so a reader can
  scan any test and immediately locate the one line that actually matters
  — the assertion — without first having to mentally separate setup code
  from the real action being verified.
- **Test case** — one specific, concrete scenario a test checks — not
  the general mechanism of testing itself, but the particular combination
  of inputs and expected output a single test exercises. It exists as a
  distinct idea from "test" because a single piece of behavior
  (`Operation.apply`) can have several real test cases (one per operator,
  in this lesson), each a separate, independent claim about a specific
  input/output pair, even though all four share the identical test
  *shape*.

## Objects and methods used

**`assertEquals(...)`**
- What it is: the function that fails a test, with a real, descriptive
  error, unless two given values are equal.
- Implementation: a real, heavily overloaded static function — `javap`
  against the real, installed JUnit jar this project depends on shows
  twelve real overloads, including `assertEquals(long, long): void`,
  `assertEquals(Object, Object): void`, and several `double`/`float`/
  array-typed variants, all from `org.junit.Assert`. **Confirmed for real
  this session, by inspecting this project's own compiled test bytecode**:
  this lesson's own calls — `assertEquals(4, result)`, with both
  arguments real Kotlin `Int` values — resolve to the `assertEquals
  (Object, Object)` overload, not `assertEquals(long, long)`, even though
  a Java caller passing two `int` values would resolve to the `long`
  overload instead, via Java's own implicit primitive widening. Kotlin's
  own overload resolution does not perform that widening when calling a
  Java static method; with no exact `Int, Int`-shaped overload available,
  it boxes both arguments to `Object` instead.
- Its use: every real test in this lesson's own updated `CalculatorTest.kt`
  ends with a call to this function, checking a real computed result
  against BRD's own stated expected value.
- Type: a `static` function on `org.junit.Assert`, a real Java class —
  Kotlin code calls it the same way it calls any Java static method, with
  no receiver.
- Responsibility: compares two given values for equality and, if they
  differ, immediately fails the current test with a real, descriptive
  message stating both the expected and actual values — proven directly,
  this session, by an actual failing test: `java.lang.AssertionError:
  expected:<5> but was:<4>`.
- Depends on: two values to compare — here, always a literal expected
  `Int` and a real computed `Int` result.
- Connects to: called once per test, as that test's own final statement;
  its own real failure output is what a test runner (and, ultimately, a
  developer reading its report) actually sees when a claim turns out to
  be false.
- Shape: the one real point of contact between "code that computes
  something" and "a machine's own judgment of whether that something is
  correct" — everything else in a test exists to set up and perform the
  action this one call actually checks.

### Everything else in the file, not this lesson's subject but still explained

**`Operator`** (reappearing)
- What it is: an enum naming this project's four real arithmetic
  operations, each carrying its own real `Operation` implementation.
- Implementation: `enum class Operator(val operation: Operation) {
  PLUS(Addition()), MINUS(Subtraction()), TIMES(Multiplication()),
  DIVIDE(Division()) }` — unchanged.
- Its use: every one of this lesson's four real tests reads a different
  one of its four constants — `PLUS`, `MINUS`, `TIMES`, `DIVIDE` — each
  exactly once.
- Type: an enum class, each constant carrying a real, distinct
  `Operation` value.
- Responsibility: unchanged — gives each of the four real operations a
  fixed, named identity.
- Depends on: unchanged — nothing new.
- Connects to: read once per test, by name, in this lesson's own
  `CalculatorTest.kt`; each constant's own `.operation` property is what
  gets called.
- Shape: unchanged — the real, closed set of arithmetic choices this
  project supports.

**`Operation`** (reappearing)
- What it is: an interface describing one thing — combining a running
  value with a new amount to produce a new value.
- Implementation: `fun interface Operation { fun apply(current: Int,
  amount: Int): Int }` — unchanged.
- Its use: `.apply(...)`, called once per test, on whichever `Operator`
  constant that test is checking.
- Type: a functional interface with one abstract method.
- Responsibility: unchanged — describes the one operation any arithmetic
  strategy this project supports must be able to perform.
- Depends on: unchanged — nothing.
- Connects to: called directly by each of this lesson's own four tests,
  each supplying its own real pair of `Int` arguments.
- Shape: unchanged — the polymorphic seam this project's arithmetic is
  built on, and, per an earlier Stage 2 lesson's own real, verified
  proof, a genuinely pure, deterministic one.

---

## Concept Unit 1: A Test — Code That Checks Other Code

### The Problem

`Operation.apply` was already proven, in an earlier lesson, to be pure
and deterministic — real, repeated calls with the same inputs always
returned the same output. But "proven," so far, has meant one specific
real test run, captured in a saved transcript. Nothing yet automatically
re-checks that claim every time this project's own code changes.

> **Try it yourself first:** `@Test` and `assertEquals` have both already
> appeared, in earlier lessons, inside real, working test functions —
> reused here without either being formally named as its own concept yet.
> Given a function like `additionAppliesRealArithmetic`, already fully
> compiling and passing, what real, structural difference — if any —
> separates it from an ordinary function like `CalculatorScreen` itself?
> And: if this project's own `Addition.apply` were changed tomorrow to
> return the wrong result, what, specifically, would have to happen for
> anyone to actually notice, without a human manually re-running and
> reading the output by eye?

### Introduce the concept in isolation

This project's own existing `CalculatorTest.kt` — already real, already
compiling, already passing — is itself the concrete example: a real
class holding one `@Test`-annotated function, calling real project code
and checking its result. Running it again, unchanged, for real:

```
com.example.calculator.CalculatorTest > additionAppliesRealArithmetic PASSED

BUILD SUCCESSFUL in 1s
```

This is what makes it a **test**, concretely: it runs automatically
(triggered by `./gradlew testDebugUnitTest`, not by a person manually
calling it), it exercises real project code (`Operator.PLUS.operation.
apply(...)`) with real inputs, and it reports a real, checkable
pass/fail outcome — not a value a human has to separately judge.

No throwaway example to discard here — this Concept Unit names a
property this project's own existing, permanent code already has, rather
than introducing new code of its own; Concept Units 3–4 are where this
lesson's own real project change happens.

### No project change for this unit

Per this schema's own allowance: this Concept Unit names and explains
already-existing project code rather than changing it, so Project
Change, New Code, and Updated Project are skipped here.

### CS lens

Code whose entire job is exercising other code and reporting a
pass/fail verdict, run automatically rather than by manual inspection,
is the real, general idea of **automated verification**. Also
recognized in: a compiler's own type checker (automatically verifying a
real property of code, with no human inspecting every expression by
hand), a CI pipeline's own build step, a linter checking a real style
rule against every file, and a spell-checker automatically flagging a
misspelling a proofreader might have missed.

### SE lens

The alternative not chosen — the only one available before this
project's own test files existed — is manually running the app (or, for
Stage 0's console version, manually reading printed output) and judging
correctness by eye, every time. That doesn't scale: a person has to
remember to check, has to correctly judge the output, and has to repeat
the entire process after every single change, forever. A real test,
once written, performs that exact same check automatically, forever,
for the cost of writing it once — the real, ongoing payoff this lesson's
own expanded suite (Concept Units 3–4) is built to capture for all four
operators, not just one.

### Run it

Shown above, in full: this project's own already-real, passing test,
confirmed again this session
(`verification/2.2/step2_full_four_operator_suite_and_assembleDebug.txt`,
which includes this exact test alongside every other real test this
lesson builds).

### Connecting the pieces

A test is now understood as automated, repeatable verification — but
*what*, exactly, does `additionAppliesRealArithmetic` actually check?
Concept Unit 2 names the one real line responsible for that.

---

## Concept Unit 2: Assertions — The One Line That Actually Checks Anything

### The Problem

`additionAppliesRealArithmetic` computes a real result
(`operation.apply(2, 2)`), but computing a value and *checking* it are
two different things — nothing about calling `apply` itself fails the
test if the result turns out to be wrong. Something else has to be the
one real point where "here's what I computed" becomes "and here's
whether that's actually correct."

> **Try it yourself first:** `assertEquals` has already appeared, several
> times, always called with exactly two arguments — an expected value,
> and a real, computed one. Given that a test is supposed to fail loudly
> when something's wrong, what would you predict `assertEquals` actually
> does, internally, when its two arguments genuinely differ — return
> `false` for the test's own code to check, or something more direct? And:
> if `assertEquals`'s own real declared parameter types (checked in this
> lesson's own Header) don't include a plain `Int, Int` overload at all,
> what does that suggest about what actually happens, at the type level,
> to two real Kotlin `Int` values passed to it?

### Introduce the concept in isolation

```kotlin
@Test
fun deliberatelyWrongExpectedValue() {
    val result = Operator.PLUS.operation.apply(2, 2)
    assertEquals(5, result)
}
```

Run for real — not to prove it passes, but to see, concretely, what a
real, genuine failure actually looks like:

```
com.example.calculator.SigCheck > deliberatelyWrongExpectedValue FAILED
    java.lang.AssertionError: expected:<5> but was:<4>
```

This is real, direct evidence of what this lesson's own Header already
described: `assertEquals` doesn't return a value for the test to
separately check — it throws a real `AssertionError`, immediately,
carrying both the expected and actual values in its own message,
whenever the two arguments aren't equal. This is what makes it an
**assertion**: a statement of a claim (`5` and `4` are equal) that either
silently succeeds or loudly, immediately fails, with no middle ground and
no need for the test's own code to check a return value by hand.

Discarded: `deliberatelyWrongExpectedValue` above does not appear in the
real project; it existed only to produce this real failure output on
purpose, then was deleted.

### No project change for this unit

Per this schema's own allowance: this Concept Unit's own real code was a
deliberately temporary, discarded failure, used to observe real behavior
rather than to become part of the project; Concept Units 3–4 are where
this lesson's own permanent project change happens.

### CS lens

A statement that halts execution immediately and loudly the instant a
claimed condition turns out false, rather than continuing on with
possibly-wrong data, is the real, general idea an **assertion**
literally is, in the broader sense the word has across programming
generally — not just inside test frameworks. Also recognized in: a
language's own built-in `assert` statement (checking an internal
invariant during development), a database's own constraint check
(rejecting an insert that would violate a rule, immediately, rather than
silently storing bad data), and a contract-based programming system's
own precondition/postcondition checks.

### SE lens

The alternative not chosen is a test that computes a result and simply
`println`s it, leaving a human to read the output and decide whether it
looks right. That was, in effect, Stage 0's own original console
calculator's entire verification strategy — real, printed output, judged
by eye. `assertEquals`'s real value over that approach is exactly what
this Concept Unit's own real failure output demonstrates: a wrong result
doesn't produce output a human might skim past — it stops the test
immediately, with a message stating precisely what was expected and what
was actually gotten, in a form a CI system or a test report can surface
automatically, with no human reading required to notice something's
wrong.

### Run it

Shown above, in full: the real, deliberately-failing test and its real,
captured failure output
(`verification/2.2/lab1_assertion_real_failure.txt`), plus the real
`javap`-sourced overload list and the real bytecode inspection
confirming which overload this project's own calls actually resolve to
(`verification/2.2/lab0b_assertequals_real_javap.txt`,
`verification/2.2/lab0c_which_overload_bytecode.txt`).

### Connecting the pieces

`assertEquals` is now understood as the one real line that turns a
computed value into a pass/fail verdict. Concept Unit 3 gives that one
line a consistent home inside a larger, three-part structure.

---

## Concept Unit 3: Arrange/Act/Assert — Giving Every Test the Same Shape

### The Problem

`additionAppliesRealArithmetic`'s own existing body has two real
lines — compute, then check — with nothing marking which is which beyond
their order. That's readable enough for two lines, but this lesson is
about to add three more tests, each with its own setup, action, and
check; without a consistent, named structure, a reader has to
re-figure-out which line does what, in every single test, every time.

> **Try it yourself first:** `additionAppliesRealArithmetic`'s own
> existing body already has a real, implicit structure — one line
> obtaining what's needed, one line performing the real action, one line
> checking the result — even though nothing currently labels which line
> is which. Given that this lesson's own Terms already named
> "Arrange/Act/Assert" as three distinct, ordered parts, which of this
> test's own two existing lines would you assign to "Act," and which to
> "Assert" — and what real, currently-missing piece would "Arrange" need
> to name, given the test's own current first line already reads
> `Operator.PLUS.operation` inline, with nothing set aside as its own
> named step? And: once `additionAppliesRealArithmetic` has this explicit
> three-part shape, what would you predict a second test for
> subtraction looks like — genuinely different code, or the same shape
> with different concrete values in each of the three parts?

### No new isolated lab for this unit

Arrange/Act/Assert is a structural, organizational convention applied to
already-established syntax (a `val` declaration, a function call, an
assertion) — not a new language or library construct requiring its own
throwaway example; this Concept Unit's own real verification is the
actual project change, next.

### Project Change

- **Reference Source:** No reference counterpart — this is a real
  restructuring of this project's own existing test, plus a genuinely
  new one, both original to this lesson.
- **Files affected:** `app/src/test/java/com/example/calculator/
  CalculatorTest.kt` (modified).
- **Change type:** refactor (the existing `additionAppliesRealArithmetic`
  test, restructured with explicit AAA sections and BRD's own canonical
  numbers) and add (a new `subtractionAppliesRealArithmetic` test).
- **Location:** `CalculatorTest.kt`'s own class body — the existing
  test's own body rewritten in place; the new test added directly after
  it.
- **Dependencies:** none beyond what earlier lessons already resolved.

### The New Code

```kotlin
@Test
fun additionAppliesRealArithmetic() {
    // Arrange
    val operation = Operator.PLUS.operation

    // Act
    val result = operation.apply(2, 2)

    // Assert
    assertEquals(4, result)
}
```

### The Updated Project

```kotlin
 1  class CalculatorTest {
 2
 3      @Test
 4      fun additionAppliesRealArithmetic() {
 5          // Arrange                                     // ← new
 6          val operation = Operator.PLUS.operation         // ← changed: was inline in the Act line
 7
 8          // Act                                          // ← new
 9          val result = operation.apply(2, 2)               // ← changed: was apply(7, 3)
10
11          // Assert                                        // ← new
12          assertEquals(4, result)                           // ← changed: was assertEquals(10, result)
13      }
14
15      @Test                                                 // ← new
16      fun subtractionAppliesRealArithmetic() {              // ← new
17          // Arrange                                        // ← new
18          val operation = Operator.MINUS.operation          // ← new
19
20          // Act                                            // ← new
21          val result = operation.apply(10, 3)                // ← new
22
23          // Assert                                          // ← new
24          assertEquals(7, result)                            // ← new
25      }
26  }
```

The existing addition test now has its own explicit `// Arrange`, `//
Act`, `// Assert` sections, and its own numbers changed to match this
Slice's own canonical example (`2 + 2 = 4`, not the earlier `7 + 3 =
10`) — the same real check as before, restated with the exact numbers
this lesson's own BRD entry names. A second, structurally identical test
checks subtraction (`10 − 3 = 7`), the same real shape applied to a
different operator.

### Mechanical walkthrough

- `// Arrange` — a real Kotlin comment (already-established syntax),
  marking the section that follows as setup — obtaining whatever the
  test needs before the real action runs.
- `val operation = Operator.PLUS.operation` — the already fully-explained
  `Operator` enum read, now pulled out as its own named `val`
  (already-established syntax) instead of written inline — the concrete
  answer to this Concept Unit's own Socratic prompt.
- `// Act` — a comment marking the one real action this test exists to
  check.
- `val result = operation.apply(2, 2)` — the already fully-explained
  `Operation.apply` call, on the `operation` just arranged, with `2` and
  `2` — BRD's own canonical first example, replacing the earlier `7`/`3`.
- `// Assert` — a comment marking the section that checks the result.
- `assertEquals(4, result)` — the already fully-explained assertion
  call, checking `result` against the literal `4` — BRD's own stated
  expected value for this exact case.
- The second test's own five lines — a real, independent repetition of
  the identical structure, per the Repetition Rule; only the concrete
  values differ: `Operator.MINUS.operation` instead of `PLUS`, `apply(10,
  3)` instead of `apply(2, 2)`, `assertEquals(7, result)` instead of
  `assertEquals(4, result)` — BRD's own second canonical example.

### CS lens

Applying one fixed, three-part structure to every instance of a
recurring kind of code, so a reader's own mental model transfers
directly from one instance to the next, is a real, general idea:
**structural convention as documentation**. Also recognized in: a
project-wide file-header convention, a consistent function-naming
pattern (`get`/`set`/`is` prefixes signaling intent before a reader
reads the body), a REST API's own consistent resource-URL shape, and any
style guide whose real value is reducing how much a reader has to
re-learn per file, not enforcing arbitrary preference.

### SE lens

The alternative not chosen is leaving each test's own internal structure
implicit, as `additionAppliesRealArithmetic` did before this lesson —
which works fine for a two-line test, and gets genuinely harder to scan
as tests grow more complex (more setup, a multi-step action, several
related assertions). Explicit `// Arrange`/`// Act`/`// Assert` comments
cost three lines per test and add zero new behavior — a real, small,
ongoing cost — in exchange for a reader being able to jump straight to
whichever section they actually care about (usually `// Assert`, to see
what's being claimed) without reading the whole test top to bottom.

### Run it

```
com.example.calculator.CalculatorTest > additionAppliesRealArithmetic PASSED
com.example.calculator.CalculatorTest > subtractionAppliesRealArithmetic PASSED

BUILD SUCCESSFUL in 902ms
```

Both real, executed, passing, saved at
`verification/2.2/step1_addition_subtraction_aaa.txt`.

### Connecting the pieces

Two of this project's four real arithmetic operations now have their
own AAA-structured test. Concept Unit 4 completes the set, and names
what makes each of these four tests its own distinct, real test case.

---

## Concept Unit 4: Test Cases — One Suite, Four Distinct Claims

### The Problem

`additionAppliesRealArithmetic` and `subtractionAppliesRealArithmetic`
share the exact same real shape — Arrange, Act, Assert — differing only
in which `Operator` constant and which numbers they use. `Operation.
apply`, as a piece of code, is still only partially checked: two of its
four real implementations (`Multiplication`, `Division`) have no test at
all yet.

> **Try it yourself first:** the two existing tests differ from each
> other in exactly three places — which `Operator` constant, which two
> numbers passed to `apply`, and which expected value passed to
> `assertEquals` — with the surrounding AAA structure identical in both.
> Given BRD's own remaining two canonical examples (`5 × 6 = 30`,
> `20 ÷ 4 = 5`), what would the smallest possible new test look like for
> each, reusing that exact same shape? And: even though all four tests
> share one identical structure, is `additionAppliesRealArithmetic`
> genuinely a different *claim* than
> `multiplicationAppliesRealArithmetic` — or is calling them "the same
> test, run four times" accurate?

### No new isolated lab for this unit

This Concept Unit's own real code reuses Concept Unit 3's own
already-proven AAA shape, applied to the two remaining operators — no
new construct to isolate; its real verification is the actual project
change, next.

### Project Change

- **Reference Source:** No reference counterpart — original addition,
  completing this lesson's own real test suite.
- **Files affected:** `app/src/test/java/com/example/calculator/
  CalculatorTest.kt` (modified).
- **Change type:** add (two more tests).
- **Location:** `CalculatorTest.kt`'s own class body, directly after
  `subtractionAppliesRealArithmetic`.
- **Dependencies:** none beyond what earlier lessons already resolved.

### The New Code

```kotlin
@Test
fun multiplicationAppliesRealArithmetic() {
    // Arrange
    val operation = Operator.TIMES.operation

    // Act
    val result = operation.apply(5, 6)

    // Assert
    assertEquals(30, result)
}

@Test
fun divisionAppliesRealArithmetic() {
    // Arrange
    val operation = Operator.DIVIDE.operation

    // Act
    val result = operation.apply(20, 4)

    // Assert
    assertEquals(5, result)
}
```

### The Updated Project

```kotlin
 1  class CalculatorTest {
 2
 3      @Test
 4      fun additionAppliesRealArithmetic() {
 5          // Arrange
 6          val operation = Operator.PLUS.operation
 7
 8          // Act
 9          val result = operation.apply(2, 2)
10
11          // Assert
12          assertEquals(4, result)
13      }
14
15      @Test
16      fun subtractionAppliesRealArithmetic() {
17          // Arrange
18          val operation = Operator.MINUS.operation
19
20          // Act
21          val result = operation.apply(10, 3)
22
23          // Assert
24          assertEquals(7, result)
25      }
26
27      @Test                                                  // ← new
28      fun multiplicationAppliesRealArithmetic() {             // ← new
29          // Arrange                                         // ← new
30          val operation = Operator.TIMES.operation            // ← new
31
32          // Act                                              // ← new
33          val result = operation.apply(5, 6)                   // ← new
34
35          // Assert                                            // ← new
36          assertEquals(30, result)                              // ← new
37      }                                                        // ← new
38
39      @Test                                                    // ← new
40      fun divisionAppliesRealArithmetic() {                    // ← new
41          // Arrange                                           // ← new
42          val operation = Operator.DIVIDE.operation             // ← new
43
44          // Act                                                // ← new
45          val result = operation.apply(20, 4)                    // ← new
46
47          // Assert                                              // ← new
48          assertEquals(5, result)                                 // ← new
49      }                                                          // ← new
50  }
```

`CalculatorTest` now holds four real tests, one per `Operator` constant,
each independently checking BRD's own exact canonical claim. Each one is
its own real **test case** — a distinct, concrete scenario
(`multiplicationAppliesRealArithmetic` says something true about `5 × 6`
specifically, nothing about `2 + 2`) — sharing one common test *shape*
without being interchangeable claims.

### Mechanical walkthrough

- `Operator.TIMES.operation`, `apply(5, 6)`, `assertEquals(30, result)`
  — the identical already-explained construct sequence, applied to
  `Multiplication` and BRD's own third canonical example.
- `Operator.DIVIDE.operation`, `apply(20, 4)`, `assertEquals(5, result)`
  — the identical sequence again, applied to `Division` and BRD's own
  fourth canonical example — deliberately a case `Division` handles
  cleanly (`20 ÷ 4` divides evenly), not the still-open,
  deliberately-untouched `÷ 0` case a later Stage 2 lesson owns.

### CS lens

A shared test *shape*, instantiated once per distinct real scenario, so
that testing more cases means writing more instances of the same
pattern rather than inventing a new one each time, is a real, general
idea: **table-driven / parameterized testing** in its simplest,
unparameterized form — four separate functions here, rather than one
function driven by a literal table of inputs, a real design tradeoff
this lesson deliberately keeps simple rather than introducing a fifth
new mechanism (a parameterized-test framework) this project's own real
size doesn't yet call for.

### SE lens

The alternative not chosen — genuinely available, and arguably more
"DRY" — is a single parameterized test taking a list of (operator,
operand, operand, expected) tuples and looping over them. Four separate,
explicitly-named functions cost real, repeated boilerplate (the same
AAA shape, four times) in exchange for something a parameterized version
loses: `subtractionAppliesRealArithmetic` failing shows up, by name, in
a test report, immediately identifying *which* real claim broke, with no
extra index or tuple to decode — a real, deliberate tradeoff favoring
diagnostic clarity over the smaller amount of code a loop would save,
reasonable at this project's own current, small scale.

### Run it

```
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

All eight of this project's own real tests pass — the four new
arithmetic test cases alongside every real UI test built in earlier
lessons — plus a full, real `.apk`, confirmed once more with
`./gradlew testDebugUnitTest assembleDebug`. Saved at
`verification/2.2/step2_full_four_operator_suite_and_assembleDebug.txt`.

### Connecting the pieces

Every Concept Unit in this lesson comes together here: a **test**
(Concept Unit 1) built from one real **assertion** (Concept Unit 2),
structured with **Arrange/Act/Assert** (Concept Unit 3), now repeated as
four independent **test cases** (Concept Unit 4) — one real, checkable
claim per operator, matching this Slice's own name exactly:
`Operation.apply` is no longer just *proven* pure in one saved
transcript; it's *continuously checked*, for all four real operations,
every time `./gradlew testDebugUnitTest` runs.

---

## Closing

**Connect the pieces.** Follow one concrete claim — `5 × 6 = 30` —
through every unit this lesson built. It starts as
`multiplicationAppliesRealArithmetic`, a real function this project
didn't have before this lesson (Concept Unit 4), structurally identical
to `additionAppliesRealArithmetic`'s own restructured shape (Concept
Unit 3): `// Arrange` names `Operator.TIMES.operation`; `// Act` calls
`operation.apply(5, 6)`, the exact already-proven-pure `Operation.apply`
this project has depended on since an earlier Stage 2 lesson; `//
Assert` calls `assertEquals(30, result)` — the one real line (Concept
Unit 2) that turns "here's what got computed" into a checkable
pass/fail verdict, resolved, this session's own real bytecode inspection
confirmed, to JUnit's `Object, Object` overload rather than the `long,
long` one a Java caller would reach instead. And the reason any of this
counts as real verification rather than a comment claiming correctness
is Concept Unit 1's own defining property of a **test**: this exact
check now runs automatically, every time `./gradlew testDebugUnitTest`
does, without anyone needing to re-read `Multiplication.apply`'s own
source and judge it correct by eye.

**Next: Lesson 2.3, TDD** — every test this lesson wrote checks code
that already existed, written first, tested after. Lesson 2.3 reverses
that order: writing a real test for a new operation *before* the
operation itself exists, watching it fail for the right reason, then
making it pass.
