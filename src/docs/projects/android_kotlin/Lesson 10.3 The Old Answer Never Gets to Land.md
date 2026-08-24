# Lesson 10.3: The Old Answer Never Gets to Land

**What you will build.** `GraphScreen` now lets the user pick between two
real, different expressions — closing the exact "live design question"
the previous lesson deliberately left open: what should govern when the
graph's own background sampling work restarts. Switching expressions
mid-calculation now genuinely cancels whatever stale sampling was still
running for the old one, so a slow, superseded answer can never arrive
late and overwrite the graph the user actually asked to see.

**What you need to know first:**
- Lesson 10.2 (Off the Main Thread, Still Tied to the Screen) —
  `LaunchedEffect`, `Dispatchers.Default`, `withContext`, and this
  project's own real, current `GraphScreen`, including the honest,
  open question its own SE Lens left about what a real key should
  eventually govern.
- Lesson 9.2 (The Same Expression, Many Answers) — `tokenize`,
  `toPostfix`, `buildTree`, `evaluateAt`, `sample` — this project's own
  real expression pipeline, called here for a second, different real
  expression for the first time.
- Lesson 3.2 (A Button Written Once) — `CalculatorButton`, reused here to
  pick an expression instead of a digit or operator.
- Lesson 1.3 (Sharing Space Instead of Fixing It) — `Row`, `Arrangement`,
  already-established layout tools this lesson reuses to place two small
  buttons above the real graph canvas.

No pipeline diagram — this lesson doesn't add a new stage to this
project's own expression pipeline, only calls its already-complete,
existing stages a second time, for a second real expression.

## Terms used in this lesson

No new keywords, annotations, or operators — every real construct this
lesson depends on is a class or method, detailed below.

## Objects and methods used

**`LaunchedEffect` (keyed relaunch)**
- *What it is:* the same real Compose API detailed in the previous
  lesson, this time relied on for a second, genuinely different real
  guarantee it makes: not just cancelling its own coroutine when its host
  leaves composition, but cancelling and restarting it the instant its
  own `key1` argument changes to a new, real value.
- *Implementation:* the same real, fetched KDoc already quoted once
  before states this second guarantee in the same breath as the first:
  *"The coroutine will be cancelled and re-launched when LaunchedEffect is
  recomposed with a different key1."* Its real, internal
  `LaunchedEffectImpl` is built on a real Kotlin `remember(key1) { ... }`
  call — since `remember` itself already re-runs its own lambda the
  instant its own key changes (an already-established real fact about
  `remember`), a new `LaunchedEffectImpl` instance is genuinely
  constructed on every real key change, and the *old* instance's own real
  `onForgotten()` hook — the exact same real hook that cancels it on
  leaving composition — fires for exactly the same real reason: from
  `remember`'s own perspective, the old instance was just forgotten,
  replaced by a new one.
- *Its use:* this lesson keys `GraphScreen`'s own `LaunchedEffect` on its
  current expression string instead of a fixed `Unit`, so picking a
  different real expression is what now triggers a real cancel-and-
  restart.
- *Type:* the same real, public `@Composable` function already detailed.
- *Responsibility:* (extending the previous lesson's own charter) also
  guarantees that at most one real instance of this coroutine is ever
  running for a given composable at a time — a new key never lets two
  overlapping real instances run concurrently.
- *Depends on:* a real `key1` whose own real equality (`==`, already
  established) genuinely changes when a restart should happen.
- *Connects to:* reads `GraphScreen`'s own new `expression` state as its
  key; its own cancellation reaches into whatever real coroutine work is
  currently running inside it, exactly as detailed in the previous lesson.
- *Shape:* the same real `androidx.compose.runtime` API, this lesson's
  own second, distinct real use of it.

**`JobCancellationException`**
- *What it is:* the real, specific exception kotlinx.coroutines throws
  into a coroutine that tries to resume after its own job was cancelled.
- *Implementation:* real declared shape, confirmed via `javap` against
  this project's own real, installed `kotlinx-coroutines-core` jar:
  ```
  public final class JobCancellationException
      extends java.util.concurrent.CancellationException
  public final transient Job job;
  ```
  `java.util.concurrent.CancellationException` (confirmed the same way)
  itself `extends IllegalStateException` — a real, three-level inheritance
  chain, not an invented or approximate one.
- *Its use:* this lesson's own isolated lab never catches it directly, but
  it's the real, concrete reason the stale coroutine's own `labResult =
  "A"` line never runs — resuming from `withContext` after cancellation
  throws this exact real exception instead of returning normally, and
  nothing in the lab's own code catches it, so that one coroutine simply
  stops, silently, right there.
- *Type:* a real, `public final` class — `final` here means nothing may
  subclass it further.
- *Responsibility:* carries, along with the real fact that cancellation
  happened, a real reference to exactly which `Job` was cancelled — its
  own `job` field.
- *Depends on:* thrown internally by kotlinx.coroutines' own machinery,
  never constructed directly by this project's own code.
- *Connects to:* thrown from inside `withContext`'s own real resumption
  logic, the instant it notices its own coroutine's job was already
  cancelled; propagates up exactly like any other real, uncaught
  exception unless something explicitly catches it.
- *Shape:* `kotlinx.coroutines`'s own internal-but-public exception type —
  this lesson's own first real look at exactly what cancellation *is*,
  mechanically, rather than treating it as an abstract guarantee.

**`tokenize` / `toPostfix` / `buildTree` / `evaluateAt` / `sample`**
- *What it is:* this project's own real, complete, already-established
  expression pipeline — turning a real `String` into real tokens, into
  real postfix order, into a real tree, into a real, callable function of
  `x`, into real, sampled `Point`s.
- *Implementation:* all five already fully established (`Tokenizer.kt`,
  `ShuntingYard.kt`, `AST.kt`, `Evaluator.kt`, `Graphing.kt`, Lessons
  5.4–5.10, 9.2) — no real signature changes here.
- *Its use:* this lesson calls all five a second time, for a second, real,
  different expression string (`"x"`, not just `"x×x"`) — this project's
  first real proof that this pipeline genuinely works for more than the
  one expression it's been hardcoded to since Lesson 9.1.
- *Type:* five real, already-established top-level functions.
- *Responsibility:* unchanged — each still does exactly the one real job
  it already had.
- *Depends on:* `tokenize` depends on a real expression `String`; each
  later stage depends on the real output of the one before it.
- *Connects to:* now called from directly inside `GraphScreen`'s own
  `LaunchedEffect` block, on `Dispatchers.Default`, once per real
  expression change, instead of once, ever, at first composition.
- *Shape:* this project's own real, permanent domain pipeline — reused
  here, not modified.

### Everything else in the file, not this lesson's subject but still explained

**`CalculatorButton`**
- *What it is:* this project's own real, permanent, reusable composable
  wrapping a single real button in this project's own established
  Material styling, haptic feedback, and test tag.
- *Implementation:* `@Composable fun CalculatorButton(label: String,
  onClick: () -> Unit, modifier: Modifier = Modifier, contentDescription:
  String? = null)` (`MainActivity.kt`, established Lesson 3.2).
- *Its use:* this lesson reuses it, unchanged, for two new real buttons —
  `"x×x"` and `"x"` — picking an expression instead of a digit or
  operator, a genuinely new real use its own general, label/click-driven
  shape already happened to support with zero changes needed.
- *Type:* a real, public `@Composable` function.
- *Responsibility:* renders one real, styled, tagged, haptic-feedback-
  giving button, calling back whatever real `onClick` it's given.
- *Depends on:* a real `label` and `onClick` lambda.
- *Connects to:* each of this lesson's two new buttons passes a different
  real lambda reassigning `expression`.
- *Shape:* this project's own real, permanent, reusable UI component,
  used here for a brand-new real purpose it was never written for
  specifically.

**`Row` / `Arrangement.spacedBy`**
- *What it is:* `Row` lays real children out left to right;
  `Arrangement.spacedBy` puts a fixed, real gap between them.
- *Implementation:* both already established (Lesson 1.3), reused here
  unchanged.
- *Its use:* holds this lesson's own two new real expression buttons,
  side by side, above the real graph canvas.
- *Type:* `Row` is a real `@Composable` function; `Arrangement.spacedBy`
  is a real function returning a real `Arrangement.Horizontal`.
- *Responsibility:* real, already-established layout behavior, unchanged.
- *Depends on:* real child composables to arrange.
- *Connects to:* wraps this lesson's own two new `CalculatorButton` calls.
- *Shape:* this project's own established layout API, reused, not
  extended.

**`mutableStateOf` / `remember` / `by`**
- *What it is:* the same real, already-established Compose state
  mechanism detailed in the previous lesson.
- *Implementation:* unchanged from its own prior, full treatment.
- *Its use:* `GraphScreen` gains one new real piece of state,
  `expression`, alongside its own already-established `points`.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* `expression`'s own real value is now what
  `LaunchedEffect`'s own key reads, and what each new button reassigns.
- *Shape:* unchanged — this project's own single most-reused mechanism.

---

## Concept Unit: A New Key Cancels the Old Coroutine

### The Problem

The previous lesson proved `LaunchedEffect` cancels its own coroutine the
instant its host composable leaves the screen entirely. But
`GraphScreen`'s own real, current `LaunchedEffect` is keyed on a fixed
`Unit` — meaning, as things stand, it can only ever run once, the first
time the screen appears; there's no real way yet to make it run *again*,
for a *different* real input, without leaving and re-entering the whole
screen. The previous lesson's own KDoc quote already named a second real
guarantee, in the same breath as the first — that changing `key1` also
cancels and restarts the coroutine — but nothing has actually put that
second guarantee to the test yet. And if it's real, a sharper, more
specific question follows: if the *old* key's own background work is
still genuinely running — not finished, not idle, mid-computation — when
the key changes, does it definitely get cut off before it can write its
own, now-stale answer somewhere a fresher one already landed?

Given `Thread.sleep`'s own real behavior, already established, cannot be
interrupted by a coroutine's own cancellation the way a suspending call
like `delay` can — if a coroutine's job is cancelled while it's still
inside a real `Thread.sleep`, does the sleep itself immediately stop, or
does it keep running its own real, physical duration regardless? And if
it does keep running to the end, does the code written *after* that
sleep — the part that would actually write a stale result — still get to
run once the sleep finally finishes, or does cancellation catch it at
that exact next real checkpoint instead?

### Introduce the Concept in Isolation

A real, temporary test file, `LabKeyedEffectTest.kt`, added directly to
this project's own real Gradle module, the same standing adaptation
already used throughout this stage:

```kotlin
package com.example.calculator

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.junit4.createComposeRule
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

private var labResult = "none"

@Composable
private fun LabKeyedScreen(key: Int) {
    LaunchedEffect(key) {
        val sleepMillis = if (key == 1) 800L else 200L
        withContext(Dispatchers.Default) { Thread.sleep(sleepMillis) }
        labResult = if (key == 1) "A" else "B"
    }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabKeyedEffectTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun changingTheKeyCancelsTheOldCoroutineBeforeItCanOverwriteTheNewResult() {
        labResult = "none"
        var currentKey by mutableStateOf(1)
        composeTestRule.setContent { LabKeyedScreen(currentKey) }

        Thread.sleep(100)
        currentKey = 2
        composeTestRule.waitForIdle()

        Thread.sleep(900)
        composeTestRule.waitForIdle()

        assertEquals("B", labResult)
    }
}
```

Deliberately asymmetric real durations: key `1` ("A") sleeps a real `800`
milliseconds; key `2` ("B") sleeps only a real `200`. If cancellation
*didn't* genuinely work, `"A"`'s own real sleep — started first, at real
time zero — would still be running when the test checks, and would
finish *after* `"B"`'s own, shorter sleep already wrote its result,
overwriting it with the stale `"A"`. This isn't a hypothetical worry —
it's exactly what this unit's own real, negative-case run proved, below.

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabKeyedEffectTest" --rerun-tasks`, reproduced
identically across two separate runs, saved in full in
`verification/10.3/lab1_output.txt`):

```
BUILD SUCCESSFUL in 12s
Real, saved XML result: tests="1" skipped="0" failures="0" errors="0"
```

**A real, deliberate negative-case check, run this session before
accepting the above as real proof of anything**: `LaunchedEffect(key)`
was temporarily changed to `LaunchedEffect(Unit)` — ignoring the key
entirely, so changing `currentKey` would never restart the effect — and
the identical test was run again for real:

```
1 test completed, 1 failed
org.junit.ComparisonFailure: expected:<[B]> but was:<[A]>
```

Exactly as predicted: without a real, key-based restart, the stale `"A"`
genuinely does land, `800` real milliseconds after it started, long after
`"B"` already (incorrectly) appeared to finish first. This confirms the
real test above isn't passing by accident or by construction — it
genuinely discriminates between cancelled and uncancelled behavior. The
real code was reverted to `LaunchedEffect(key)` and re-confirmed passing
before being saved.

### Discard the Throwaway Example

`LabKeyedEffectTest.kt` was deleted from the project immediately after
this real run — it never appears in the project again. Cancelling one
running unit of real work specifically because a *newer* one has already
made it obsolete — rather than waiting for it to finish naturally, or
letting both finish and racing to see which writes last — is this
lesson's own real point: it isn't enough for cancellation to merely be
*possible*; this project's own real correctness now specifically depends
on it happening automatically, every time.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator in
`LabKeyedScreen` and its own test:

- `LaunchedEffect(key)` — the same real call detailed in the Header,
  reading the real `key: Int` parameter as its own `key1` argument —
  every time this composable recomposes with a genuinely different real
  `key` value, this exact call is what triggers a real cancel-and-
  restart.
- `if (key == 1) 800L else 200L` — an ordinary, already-established
  Kotlin `if` expression, choosing this lab's own deliberately
  asymmetric real sleep duration.
- `withContext(Dispatchers.Default) { Thread.sleep(sleepMillis) }` — the
  same two real, already-established calls from the previous lesson,
  genuinely pausing whichever real thread `Dispatchers.Default` assigned
  for exactly `sleepMillis` real milliseconds.
- `labResult = if (key == 1) "A" else "B"` — real assignment to this
  lab's own shared, observable flag; per this unit's own real, negative-
  case proof, this exact line is the one cancellation prevents from ever
  running for a stale key — resuming past the `withContext` call above
  throws a real `JobCancellationException` instead of reaching this line
  at all.
- `var currentKey by mutableStateOf(1)` — the same real, already-
  established state mechanism, this time declared directly inside the
  test function itself, not inside a composable — legal, since `by`/
  `mutableStateOf` are ordinary real Kotlin/Compose calls, usable
  anywhere a real `MutableState` is needed.
- `composeTestRule.setContent { LabKeyedScreen(currentKey) }` — the same
  real, already-established call, reading `currentKey`'s own current real
  value at the moment of composition.
- `currentKey = 2` — real reassignment, from directly inside the test's
  own code, not from inside any composable — Compose's own real state-
  observation mechanism (already established) is what notices this
  change and schedules `LabKeyedScreen`'s own real recomposition.
- `composeTestRule.waitForIdle()` — the same real, already-established
  call, ensuring the real recomposition triggered by the line above has
  actually happened, `LaunchedEffect`'s own real cancel-and-restart
  included, before the test moves on.
- `assertEquals("B", labResult)` — the same real, already-established
  JUnit call, checking the one real value this entire unit exists to
  determine.

### CS Lens

This is **preemption** — stopping a unit of already-running real work
specifically because something more current has made it obsolete, rather
than letting it run to completion first.

```
Also recognized in: an operating system's own scheduler preempting a
running process for a higher-priority one; a web browser cancelling an
in-flight network request the instant the user navigates to a different
page before it finishes; a search box's own "as you type" suggestions,
where each new keystroke should cancel the previous request rather than
racing it to the screen
```

### SE Lens

Why rely on `LaunchedEffect`'s own automatic key-based cancellation,
instead of, say, manually checking "is this still the current key?"
right before writing the real result — `if (key == expression) points =
result`? The real alternative is a genuine, working option: it would
correctly reject a stale write. The real cost: it only guards the *one*
specific write it's placed in front of, by hand, every single time — miss
one real write site in a more complex screen, and a stale result slips
through silently, with no error, since nothing about that manual check
is enforced by the compiler or the framework. `LaunchedEffect`'s own
real, automatic cancellation instead stops the entire stale coroutine at
its own next real suspension point, wherever that happens to be — not
just at one hand-checked write — at the honest cost that the coroutine
being cancelled has no say in the matter and cannot clean up gracefully
mid-`Thread.sleep`, only at its own next real suspension boundary, an
already-proven, real, structural limit named directly by this unit's own
lab (the sleep itself keeps running its own physical duration regardless;
only the *resumption after it* is what actually gets cut off).

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest`, run above.

### Run It

Shown above — real, executed output for both the passing and the
deliberately-broken negative case, saved in full in
`verification/10.3/lab1_output.txt`.

### Connect the Pieces

This unit proved, with a real, deliberately asymmetric timing setup and a
real, confirmed negative case, that changing `LaunchedEffect`'s own key
genuinely cancels whatever real work the old key started, before it can
write a stale answer — not just in theory, but specifically even when
the stale work's own real duration would otherwise have let it finish
*after* the fresh one. The next unit gives `GraphScreen` itself a real
reason for its own key to ever change at all.

---

## Concept Unit: Two Real Expressions, One Real Screen

### The Problem

`GraphScreen`'s own real, current body computes its expression tree once,
outside its own `LaunchedEffect`, from a real, permanently hardcoded
string:

```kotlin
val tree = remember { buildTree(toPostfix(tokenize("x×x"))) }
```

Nothing in this project has ever asked `GraphScreen` to graph anything
*else* — the previous unit proved `LaunchedEffect`'s own real key-based
cancellation genuinely works, but `GraphScreen` itself still has no real
way to give it a key that ever actually changes. What's the smallest,
most honest real change that gives `GraphScreen` a genuine, user-driven
reason for its own expression to change, using nothing this project
hasn't already built?

Given this project's own real expression pipeline (`tokenize` →
`toPostfix` → `buildTree` → `evaluateAt` → `sample`) has never, in this
entire project's life, been asked to parse anything other than the one
literal string `"x×x"` — what would you predict happens if it's handed a
different, but still genuinely valid, real expression, like the single
token `"x"`? And given `CalculatorButton` already exists, real, reusable,
and asks for nothing more specific than a label and an `onClick`, what's
stopping it from being the real, concrete mechanism a user actually picks
a different expression with?

### Introduce the Concept in Isolation

This unit's own new construct — reading a *variable* expression string
instead of a fixed one — has no unfamiliar Compose or coroutine mechanism
to isolate; every real piece (`mutableStateOf`, `LaunchedEffect`,
`CalculatorButton`, the expression pipeline itself) is already fully
established, individually, either in this lesson's own first unit or in
earlier lessons. What's new here is only the *combination* — wiring
already-proven pieces directly into `GraphScreen`'s own real, permanent
code — so this unit moves straight to that real change instead of
building a separate, redundant lab around already-proven parts.

### Discard the Throwaway Example

Not applicable — no new throwaway construct was introduced in this unit.

### Project Change

- **Reference Source:** `GraphScreen`'s own real, current body
  (`MainActivity.kt`, lines 116–141, read this session) — this unit
  changes an already-existing real function, not a from-scratch addition.
- **Files affected:** `app/src/main/java/com/example/calculator/MainActivity.kt`
  (modified); no new files.
- **Change type:** refactor and add — `tree`'s own computation moves
  inside the async block and now depends on a real, variable
  `expression`; two new real buttons are added above the canvas.
- **Location:** inside `GraphScreen`: the old, fixed `val tree = remember
  { ... }` line is removed; `LaunchedEffect(Unit)` becomes
  `LaunchedEffect(expression)`, with `tree`'s own computation moved
  inside it; the real `Canvas` is now wrapped in a `Column`, with a new
  `Row` of two buttons placed above it.
- **Dependencies:** none new — `CalculatorButton`, `Row`,
  `Arrangement.spacedBy`, and the full expression pipeline are all
  already this project's own real, established code.

### The New Code

```kotlin
var expression by remember { mutableStateOf("x×x") }
// ...
LaunchedEffect(expression) {
    points = withContext(Dispatchers.Default) {
        val tree = buildTree(toPostfix(tokenize(expression)))
        sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100)
    }
}
// ...
Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
    CalculatorButton(label = "x×x", onClick = { expression = "x×x" })
    CalculatorButton(label = "x", onClick = { expression = "x" })
}
```

### The Updated Project

`GraphScreen`'s own real, complete, updated body
(`MainActivity.kt`, lines 116–148):

```kotlin
 116  @Composable
 117  fun GraphScreen() {
 118      var expression by remember { mutableStateOf("x×x") }         // ← new
 119      var points by remember { mutableStateOf<List<Point>>(emptyList()) }
 120      LaunchedEffect(expression) {                                  // ← new
 121          points = withContext(Dispatchers.Default) {
 122              val tree = buildTree(toPostfix(tokenize(expression))) // ← new
 123              sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100)
 124          }
 125      }
 126      var transform by remember { mutableStateOf(GraphTransform(Offset.Zero, 20.0)) }
 127      Column(modifier = Modifier.fillMaxSize()) {                   // ← new
 128          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { // ← new
 129              CalculatorButton(label = "x×x", onClick = { expression = "x×x" })  // ← new
 130              CalculatorButton(label = "x", onClick = { expression = "x" })      // ← new
 131          }                                                          // ← new
 132          Canvas(
 133              modifier = Modifier
 134                  .fillMaxSize()
 135                  .testTag("graphCanvas")
 136                  .pointerInput(Unit) {
 137                      detectTransformGestures { _, pan, zoom, _ ->
 138                          transform = applyGesture(transform, pan, zoom)
 139                      }
 140                  }
 141          ) {
 142              val originX = (size.width / 2 + transform.panOffset.x).toInt()
 143              val originY = (size.height / 2 + transform.panOffset.y).toInt()
 144              val screenPoints = toScreenPoints(points, originX, originY, transform.scale)
 145              drawPath(buildGraphPath(screenPoints), color = Color.Blue, style = Stroke(width = 4f))
 146          }
 147      }                                                              // ← new
 148  }
```

`GraphScreen` now shows two real buttons above its own graph; tapping
either reassigns `expression`, which is what `LaunchedEffect` now
actually keys on — the real trigger the previous unit's own lab proved
works, now wired to a genuine, user-driven source instead of a synthetic
test value.

### Mechanical Walkthrough

Enumerated in order, every new method call, property access, and operator:

- `var expression by remember { mutableStateOf("x×x") }` — the same real,
  established mechanism detailed in the Header, giving `GraphScreen` one
  new, real, reassignable piece of state, starting at this project's own
  original hardcoded expression.
- `LaunchedEffect(expression)` — the real call detailed in this lesson's
  own first unit, now reading a genuinely variable real value as its key
  instead of a fixed `Unit`.
- `buildTree(toPostfix(tokenize(expression)))` — three real, already-
  established calls, now reading `expression`'s own current real value
  instead of the literal string `"x×x"` — this project's first real
  proof this exact pipeline works unchanged for a second, different
  real input.
- `Column(modifier = Modifier.fillMaxSize())` — an already-established
  real call, now the real, top-level container for both the new button
  row and the existing canvas.
- `Row(horizontalArrangement = Arrangement.spacedBy(8.dp))` — the same
  real, already-established call already detailed in the Header.
- `CalculatorButton(label = "x×x", onClick = { expression = "x×x" })` and
  `CalculatorButton(label = "x", onClick = { expression = "x" })` — the
  same real, already-established call, each passed a real lambda that
  does exactly one thing: reassign `expression` to a different real,
  literal string.

### CS Lens

This is the same real **preemption** already named in this lesson's own
first unit — `GraphScreen` is now the first real, permanent, non-lab
place in this project where it actually matters: two rapid real taps on
different expression buttons now genuinely race their own background
sampling work, and this project's own real correctness depends on the
older one losing.

### SE Lens

Why two real, fixed buttons, rather than a real, free-text field letting
the user type any expression at all? A free-text field is a genuine,
real possibility — this project's own expression pipeline would handle
most syntactically valid input already, with no real parsing changes
needed. The real cost: free text also lets a user type something
genuinely invalid — an unmatched parenthesis, an unknown token — and this
project's own real pipeline has never had to define what "graph an
invalid expression" should even mean to a user, since it's never faced
that question at all. Two fixed, known-good real buttons sidestep that
entire real, currently-undecided question, deliberately, so this lesson
can focus specifically on cancellation — its own real, named subject —
without also having to invent real input-validation UX at the same time.
This is a real, honest scope limit, not a permanent one: a free-text
expression field remains a real, legitimate future feature, now with a
real, working cancellation mechanism already in place underneath it, the
moment invalid-input handling is worth its own real lesson.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest assembleDebug`, run below.

### Run It

A new, permanent test,
`switchingToARealDifferentExpressionKeepsTheGraphScreenWorking`
(`GraphScreenTest.kt`), taps the real `"x"` button, waits for idle, taps
the real `"x×x"` button, waits for idle, and confirms the real graph
canvas is still displayed throughout — a real, end-to-end proof that
rapid, real, user-driven expression switching doesn't crash the actual
screen, complementing (not repeating) the previous unit's own isolated,
timing-precise cancellation proof. This project's other two existing
`GraphScreenTest.kt` tests (dragging, pinching) and its own `Navigation`
suite required no changes and continued to pass unchanged, confirming the
new button row didn't disturb the real canvas's own existing behavior. A
full, clean `./gradlew testDebugUnitTest assembleDebug` run confirms this
project now has `97` real, passing tests (`96` prior + `1` new), `0`
failures, and a real, installable `.apk` — saved in full in
`verification/10.3/step1_full_suite.txt`.

### Connect the Pieces

The previous unit proved `LaunchedEffect`'s own key-based cancellation is
real. This unit gave `GraphScreen` an actual, user-driven reason for that
key to change — two real, selectable expressions — closing the exact
open design question the previous lesson's own SE Lens left honestly
unresolved, without inventing any UI or parsing feature this lesson
wasn't specifically about.

---

## Connect the Pieces

One concrete real scenario, traced through both units: a user, looking
at the real `"x×x"` graph, taps the real `"x"` button. `GraphScreen`'s
own `expression` state changes; `LaunchedEffect(expression)` — proven
real in this lesson's own first, isolated unit — cancels whatever
sampling work was still running for `"x×x"` (if any was) and starts a
genuinely new one for `"x"`, on `Dispatchers.Default`, exactly as the
previous lesson already established. If the user taps back to `"x×x"`
again before the `"x"` sampling finishes, that work is cancelled in turn
— proven, specifically, not to matter which one's own real duration would
have finished first, since this lesson's own lab deliberately made the
*older*, cancelled one the *slower* one, and it still never landed. The
real, end-to-end guarantee this closes: whichever expression the user
looks at last is always exactly what ends up computed and drawn — never
a stale answer for something they've already moved past.

**Next:** Lesson 10.4 (Profiling).
