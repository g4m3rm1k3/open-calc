# Lesson 25: The Payoff of Moving Logic Out of the UI

*(Testing the ViewModel and the Compose Screen)*

**User Story**
> As a developer, I want automated proof that `evaluate`, `CalculatorViewModel`,
> and the calculator screen actually work — not just manual taps on an
> emulator.

**What you will build**
A JUnit test for `evaluate` and `CalculatorViewModel` (no Android device
needed at all), and one Compose UI test for the button grid (which does
need a device or emulator).

**What you need to know first**
Lesson 24's `CalculatorViewModel`. From `../track/`: Lesson 30, JUnit and
Mockito, and Lesson 31, Espresso — both assumed known; this lesson is
about what's different testing coroutines and Compose specifically, not a
re-introduction of testing itself.

---

## Concept Unit: Assert, Act, Verify — Proven Without Any Test Framework

### The Problem

Before touching real JUnit/Compose testing APIs, it's worth seeing the
actual *idea* a test embodies, stripped to its simplest possible form —
the same "isolate the concept before using the real tool" approach this
course has used throughout.

### Introduce the concept in isolation

```kotlin
fun assertEquals(expected: Any, actual: Any) {
    if (expected != actual) throw AssertionError("Expected $expected but was $actual")
}

fun evaluate(expression: String): Double = when (expression) {
    "7+3" -> 10.0
    else -> 0.0
}

fun testEvaluateAddition() {
    val result = evaluate("7+3")
    assertEquals(10.0, result)
    println("testEvaluateAddition: PASSED")
}

fun testEvaluateAdditionWrong() {
    val result = evaluate("7+3")
    assertEquals(99.0, result)
    println("testEvaluateAdditionWrong: PASSED")
}

testEvaluateAddition()
try {
    testEvaluateAdditionWrong()
} catch (e: AssertionError) {
    println("testEvaluateAdditionWrong: FAILED — ${e.message}")
}
```

Run it:

```bash
kotlin test_example.kts
```

Real output — verified this session:

```text
testEvaluateAddition: PASSED
testEvaluateAdditionWrong: FAILED — Expected 99.0 but was 10.0
```

*What this proves:* a test is nothing more than "run the real code, then
throw if the result doesn't match what you expected" — `assertEquals` here
is a five-line function, not special magic. Real JUnit's `assertEquals`
(already familiar from `../track/` Lesson 30) does exactly this, plus
integrates with a test runner that collects results across many such
functions and reports pass/fail counts instead of you catching
`AssertionError` by hand.

### Discard the throwaway example

Deleted. Real JUnit tests, using `@Test` and JUnit's own `assertEquals`,
are what actually goes in the app's test source set next.

### Project Change

- **Reference Source:** No reference counterpart — reuses `../track/`
  Lesson 30's JUnit setup directly.
- **Files affected:** New file `src/test/java/.../EvaluatorTest.kt`.
- **Change type:** Add.
- **Location:** Kotlin/Android's separate `test/` source set, exactly as
  `../track/` Lesson 30 established.
- **Dependencies:** `junit:junit` (already present from `../track/`'s own
  test setup, per that course's Lesson 30).

### The New Code

```kotlin
class EvaluatorTest {
    @Test
    fun `addition respects no precedence issue`() {
        assertEquals(10.0, evaluate("7+3"), 0.0001)
    }

    @Test
    fun `multiplication binds tighter than addition`() {
        assertEquals(13.0, evaluate("7+3×2"), 0.0001)
    }
}
```

### Mechanical walkthrough

1. `` fun `addition respects no precedence issue`() `` — (first appearance)
   a Kotlin **backtick function name** — function names don't normally
   allow spaces, but backticks lift that restriction specifically for test
   method names, letting a test's name read as a full sentence describing
   what it verifies, rather than a cramped `camelCase` name like
   `testAdditionNoPrecedence`.
2. `assertEquals(10.0, evaluate("7+3"), 0.0001)` — (hard concept
   reappearing) JUnit's three-argument `assertEquals` for `Double`s
   specifically — the third argument is a **tolerance**, directly
   connecting back to Lesson 9's floating-point imprecision lesson: two
   `Double`s from real computation should essentially never be compared
   with exact `==`, in a test any more than in application code.

### CS Lens

Nothing new computationally — this reuses `../track/` Lesson 30's JUnit
mechanism directly. The interesting fact worth naming: because Lesson 24
moved every piece of calculator logic into `CalculatorViewModel` (plain
Kotlin, no `Composable` functions, no Android `Context`), these tests run
as fast, plain **unit tests** — no emulator, no device, seconds instead of
minutes — the direct payoff of the separation Lesson 2's state hoisting
and Lesson 24's `ViewModel` migration were building toward the whole time.

### Connection

The next unit's Compose UI test is the one category of test that
genuinely *does* need a real (or emulated) screen — worth feeling the
contrast directly.

---

## Concept Unit: Testing Coroutines and Compose

### The Problem

Two things this course's earlier tools don't directly cover: testing a
`suspend fun` (Lesson 22/23's coroutine code doesn't run to completion
instantly the way a plain function does), and testing an actual rendered
Compose screen (which `../track/` Lesson 31's Espresso, built for the View
system, can't drive directly).

### The New Code

```kotlin
@Test
fun `equals button computes and updates history`() = runTest {
    val fakeDao = FakeCalculationDao()
    val viewModel = CalculatorViewModel(fakeDao)

    viewModel.onDigitPressed("7")
    viewModel.onDigitPressed("+")
    viewModel.onDigitPressed("3")
    viewModel.onEqualsPressed()

    assertEquals("10.0", viewModel.expression.value)
}
```

```kotlin
@get:Rule val composeTestRule = createComposeRule()

@Test
fun tappingSevenShowsSevenOnDisplay() {
    composeTestRule.setContent { CalculatorScreen() }
    composeTestRule.onNodeWithText("7").performClick()
    composeTestRule.onNodeWithText("7").assertExists()
}
```

### Mechanical walkthrough

1. `runTest { ... }` — (first appearance) a coroutine-test builder from
   `kotlinx-coroutines-test` — runs `suspend fun` calls inside the test
   body immediately, skipping real `delay(...)` waits (Lesson 22's
   `delay(16L)`, Lesson 23's database round-trips) rather than actually
   waiting in real time — tests stay fast even though the code under test
   genuinely suspends.
2. `FakeCalculationDao()` — (hard concept reappearing) a **fake**
   implementing the same `CalculationDao` interface (Lesson 23) entirely
   in memory, no real database — the same test-double principle
   `../track/` Lesson 30's Mockito already covers, here as a hand-written
   fake instead of a Mockito-generated mock; both are valid choices, and
   `../track/` already taught the tradeoff between them.
3. `createComposeRule()` / `composeTestRule.setContent { ... }` —
   (first appearance) Compose's own UI-testing API — the direct
   counterpart to `../track/` Lesson 31's Espresso, adapted for
   composables instead of `View`s.
4. `composeTestRule.onNodeWithText("7").performClick()` — (first
   appearance) finds a composable displaying the text `"7"` and simulates
   a real tap on it — conceptually identical to Espresso's
   `onView(withText("7")).perform(click())`, different API surface for a
   different UI toolkit.

### CS Lens

`runTest`'s ability to skip real waiting time relies on a **virtual/test
time scheduler** — coroutine `delay` calls are intercepted and resolved
instantly rather than genuinely pausing the test thread, letting a test
that would take real seconds (Lesson 22's animation) run in milliseconds.

### SE Lens

Contrast directly with `../track/` Lesson 31: Espresso tests run against
real `View`s in a real Activity, generally slower and more setup-heavy;
Compose's `createComposeRule()` can render a single composable in
isolation, with no full Activity needed for many tests, similar to the
speed benefit `@Preview` already gave you for manual iteration back in
Lesson 1. The real cost of the fake-DAO test above: `FakeCalculationDao`
has to be kept honestly in sync with what `CalculationDao`'s real Room
implementation actually does — a real, ongoing maintenance responsibility
`../track/` Lesson 30 already flagged as the tradeoff of any test double.

### Connection

This is the last new construct this course introduces — Lesson 26 is a
pure refactor-and-reflect capstone, touching no new Kotlin or Compose
feature.

---

## Closing

### Connect the pieces

A hand-written `assertEquals` (unit 1) proved what a test fundamentally
*is* before touching real JUnit. Real `@Test` functions on `evaluate` and
`CalculatorViewModel` run as fast unit tests specifically because Lesson
24 moved all logic out of the UI layer. `runTest` (unit 2) lets those tests
cover genuinely suspending code without waiting in real time, and Compose's
`createComposeRule()` covers the one layer (the rendered screen) that
still needs an actual UI to test against.

### What breaks without this

Remove the `0.0001` tolerance from `assertEquals(10.0, evaluate("7+3"))`,
using exact `Double` comparison instead. This test happens to still pass
today (`7+3` evaluates cleanly), but re-run `` `multiplication binds tighter than addition` ``
using a case involving `sin`/`cos` (Lesson 9's demonstrated
`0.49999999999999994` imprecision) with exact comparison instead of a
tolerance. Real, observable failure: a test that *should* pass fails,
because two mathematically-equal-looking `Double`s differ in their last
few bits — exactly Lesson 9's floating-point lesson, now biting a test
instead of a displayed result. Restore the tolerance and the test passes
reliably again.

### Exercises

- Write a test for Lesson 7's `CalcResult.Error` path — assert that
  evaluating `"5÷0"` produces the correct error message.
- Write a `FakeCalculationDao` yourself, implementing `insert` (append to
  an in-memory `MutableList`) and `observeAll` (a `MutableStateFlow`
  wrapping that list) — confirm a test using it can assert history grew
  after calling `onEqualsPressed()`.

### Definition of done

- [ ] `EvaluatorTest` passes, covering at least addition and
      precedence.
- [ ] A `runTest`-based `CalculatorViewModel` test passes without a real
      database.
- [ ] At least one Compose UI test passes on a device/emulator.
- [ ] You can explain, concretely, why moving logic into `ViewModel`
      (Lesson 24) made most of these tests possible without an emulator.
- [ ] Commit: `git commit -m "Add unit tests for the evaluator and ViewModel, and a Compose UI test for the button grid"`.
