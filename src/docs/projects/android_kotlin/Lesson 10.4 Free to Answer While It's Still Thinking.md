# Lesson 10.4: Free to Answer While It's Still Thinking

**What you will build.** No new shipped feature — Stage 10 closes the
same way it opened: a purely diagnostic lesson, no production code left
changed by the end of it. This lesson proves, with real, measured
evidence, that the real fix the last two lessons built genuinely works:
`GraphScreen`'s own real buttons respond immediately even while a
deliberately slow background computation is still running, closing the
exact loop Lesson 10.1 opened by proving the opposite — that a slow
`onClick` genuinely freezes everything. This lesson also names, honestly
and specifically, what this project's own real graphing work actually
costs — in CPU time, in memory, and in what remains unverifiable about
its own real rendering — closing Slice 10 in full.

**What you need to know first:**
- Lesson 10.1 (The Queue Every Tap Waits In) — the real, proven finding
  this lesson closes the loop on: a slow `onClick` genuinely,
  synchronously blocks every other real task on the main thread's own
  queue.
- Lesson 10.2 (Off the Main Thread, Still Tied to the Screen) and Lesson
  10.3 (The Old Answer Never Gets to Land) — `GraphScreen`'s own real,
  current, already-shipped async sampling pipeline, unchanged by this
  lesson.
- Lesson 9.5 (Fast Enough Is a Real Number) — `System.nanoTime()`, this
  project's own established real, warmed-up wall-clock measurement
  methodology, and its own already-proven, real sub-millisecond
  `toScreenPoints`/`buildGraphPath` numbers.

No pipeline diagram — this lesson measures and names costs in this
project's own existing pipeline; it adds no new stage to it.

## Terms used in this lesson

No new keywords, annotations, or operators — every real construct this
lesson depends on is a class or method, either already established or
detailed below.

## Objects and methods used

**`Runtime.getRuntime().totalMemory()` / `.freeMemory()`**
- *What it is:* real JVM methods reporting the current real size of the
  JVM's own heap, and how much of that heap is currently unused.
- *Implementation:* `public native long totalMemory()` and `public
  native long freeMemory()` (`java.lang.Runtime`), confirmed via real
  `javap` output against the actual installed JDK this session; `native`
  means the real answer comes from the JVM's own internal memory
  manager, not from ordinary Java code.
- *Its use:* this lesson calls both, before and after allocating a real,
  known number of `Point`s, to measure a real, approximate lower bound on
  how much real heap memory this project's own sampling work actually
  uses.
- *Type:* both are real, `public native` instance methods, called on the
  same real `Runtime` singleton already established in Lesson 10.1.
- *Responsibility:* report real, live facts about the JVM's own current
  memory state — never an exact, deterministic number, since garbage
  collection can run at any real moment and change both values
  independently of this project's own code.
- *Depends on:* nothing — both are read directly from the already-
  established `Runtime.getRuntime()` singleton.
- *Connects to:* `totalMemory() - freeMemory()`, computed twice, gives
  this lesson's own real, approximate "memory in use" measurement.
- *Shape:* core JVM introspection API, this lesson's own first real use
  of it for memory specifically, extending Lesson 10.1's own first use of
  `Runtime` for CPU core count instead.

### Everything else in the file, not this lesson's subject but still explained

**`sample` / `buildGraphPath` / `toScreenPoints` / `Point`**
- *What it is:* this project's own real, already-established, unchanged
  graphing pipeline functions and data type.
- *Implementation:* all already fully established (Lesson 9.2, 9.3, 9.1)
  — no real signature or behavior changes in this lesson.
- *Its use:* this lesson measures their own real, already-shipped
  performance and memory characteristics; it does not modify any of them.
- *Type:* three real, top-level functions and one real data class.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* measured directly, in isolation, the same way Lesson
  9.5 already measured `toScreenPoints`/`buildGraphPath` together.
- *Shape:* this project's own real, permanent domain code — this
  lesson's own real subject of measurement, not of change.

**`System.nanoTime()`**
- *What it is:* the same real, already fully established static call
  (Lesson 9.5, reappearing in Lesson 10.1/10.2) returning a real,
  high-resolution timestamp.
- *Implementation:* unchanged from its own prior, full treatment.
- *Its use:* brackets a real `performClick()` call in this lesson's own
  first unit, exactly as it already bracketed one in Lesson 10.1's own
  Concept Unit 2 — this time to prove the opposite real result.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* unchanged.
- *Shape:* unchanged — this project's own established measurement tool.

**`LaunchedEffect` / `Dispatchers.Default` / `withContext`**
- *What it is:* the same real, already fully established Compose and
  coroutine mechanism from the previous two lessons.
- *Implementation:* unchanged from its own prior, full treatment.
- *Its use:* this lesson's own first unit builds one real, temporary,
  deliberately slow composable using exactly this same real combination,
  to prove — for the first time from the *outside*, by measuring a
  button's own real response time — that it genuinely keeps the main
  thread free.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* unchanged.
- *Shape:* unchanged.

**`createComposeRule` / `onNodeWithTag` / `performClick` / `waitForIdle`**
- *What it is:* the same real, already fully established Compose-testing
  API used throughout this project since Lesson 1.4.
- *Implementation:* unchanged from its own prior, full treatment.
- *Its use:* this lesson's own first unit uses all four, exactly as
  established, to render a real, temporary composable and measure a real
  click's own response time.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* unchanged.
- *Shape:* unchanged.

---

## Concept Unit: Free to Answer While It's Still Thinking

### The Problem

This project's own prior, real, measured evidence already proved, with
an exact number, that a real `Thread.sleep(500)` placed directly inside
a button's own `onClick` makes a slow click handler genuinely,
synchronously block the entire main thread — including every other real
button. This project's own real, current `GraphScreen` then moved its
own potentially-slow sampling work off that same main thread, onto
`Dispatchers.Default`, specifically to avoid that exact fate. But
nothing has actually measured the *result* of that fix yet, from the
outside, the same way that original problem was once measured. If a
slow `onClick` genuinely blocks a real button press, does a slow
*background* computation — the kind `GraphScreen` now deliberately runs
on a separate real thread — leave a real button free to respond
immediately, or does it too, somehow, still get in the way?

Given `Dispatchers.Default`'s own real, bounded thread pool is a
genuinely separate real resource from the main thread's own single,
dedicated thread — if a real coroutine on
`Dispatchers.Default` is deep inside a deliberately slow, multi-second
real computation, what would you predict a real `performClick()` call on
an ordinary button, on the real main thread, actually measures for its
own elapsed time: something close to that multi-second duration, since
*some* real work is happening somewhere in the app? Or something close
to instant, since the main thread's own real queue was never asked to
wait for that other thread at all?

### Introduce the Concept in Isolation

A real, temporary test file, `LabResponsivenessTest.kt`, added directly
to this project's own real Gradle module, reusing the exact same real
combination of tools — `LaunchedEffect`, `Dispatchers.Default`,
`withContext` — this project's own real `GraphScreen` already ships with:

```kotlin
package com.example.calculator

import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@Composable
private fun LabSlowBackgroundScreen(onRealClick: () -> Unit) {
    LaunchedEffect(Unit) {
        withContext(Dispatchers.Default) { Thread.sleep(2000) }
    }
    Button(onClick = onRealClick, modifier = androidx.compose.ui.Modifier.testTag("labButton")) {
        Text(text = "tap")
    }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabResponsivenessTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun aRealButtonStaysResponsiveWhileABackgroundCoroutineIsStillRunning() {
        var clicked = false
        composeTestRule.setContent {
            LabSlowBackgroundScreen(onRealClick = { clicked = true })
        }

        val start = System.nanoTime()
        composeTestRule.onNodeWithTag("labButton").performClick()
        val elapsedMs = (System.nanoTime() - start) / 1_000_000

        assertTrue(clicked)
        assertTrue("elapsedMs=$elapsedMs, expected < 200", elapsedMs < 200)
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabResponsivenessTest" --rerun-tasks`, saved in
full in `verification/10.4/lab1_output.txt`):

```
BUILD SUCCESSFUL in 6s
Real, saved XML result: tests="1" skipped="0" failures="0" errors="0"
```

The real, exact measured value, captured by temporarily forcing the
assertion to fail (`elapsedMs < 0` instead of `< 200`) so the real number
would print rather than be guessed at in advance:

```
java.lang.AssertionError: elapsedMs=62, expected < 200
```

A real button click, issued while a real, separate coroutine was mid-way
through its own deliberate, `2000`-millisecond `Thread.sleep`, returned
in a real, measured `62` milliseconds — nowhere close to the `2000`
millisecond background duration, confirming the main thread was never
made to wait for it. The assertion was then restored to its real,
correct `< 200` form and re-confirmed passing before being saved.

### Discard the Throwaway Example

`LabResponsivenessTest.kt` was deleted from the project immediately after
this real run — it never appears in the project again. A real thread
that stays free to handle new work, unaffected by how long some *other*
real thread takes to finish its own task, is what this whole stage has
actually been building toward, ever since this project's own real, first
measurement proved the opposite was true when everything ran on one
thread.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator in
`LabSlowBackgroundScreen` and its own test:

- `LaunchedEffect(Unit)` and `withContext(Dispatchers.Default) {
  Thread.sleep(2000) }` — the same real, already fully established calls,
  starting a real, deliberately slow, `2`-second background computation
  the instant this composable enters composition.
- `Button(onClick = onRealClick, modifier = ... .testTag("labButton"))` —
  a real, already-established Compose Material call, wrapping the real,
  passed-in `onRealClick` lambda; nothing about this button's own real
  click handling touches `Dispatchers.Default` or the
  coroutine above it in any way.
- `composeTestRule.setContent { LabSlowBackgroundScreen(...) }` — the
  same real, already-established call, rendering this lab's own real,
  temporary composable, which immediately starts its own real,
  2-second background sleep.
- `System.nanoTime()` — the same real, already-established call,
  bracketing the real click below it.
- `composeTestRule.onNodeWithTag("labButton").performClick()` — the same
  two real, already-established calls, dispatching a real, synchronous
  click to the lab's own button, on the real main thread — the exact
  same real thread `LaunchedEffect`'s own background coroutine was
  dispatched *away* from, onto `Dispatchers.Default`, the instant this
  composable was remembered.
- `assertTrue(clicked)` — the same real, already-established JUnit call,
  confirming the real click genuinely reached `onRealClick`.
- `assertTrue("elapsedMs=$elapsedMs, expected < 200", elapsedMs < 200)`
  — the same real, already-established call, checking the real measured
  duration against a real, generous upper bound — `200` real
  milliseconds, chosen deliberately small relative to the real `2000`
  millisecond background sleep, so a pass genuinely rules out the main
  thread having waited for any real, meaningful fraction of it.

### CS Lens

This is **concurrency** — two real, independent units of work
(`LaunchedEffect`'s own background coroutine and the button's own real
click) making real, simultaneous progress on two genuinely separate real
threads, neither one waiting on the other.

```
Also recognized in: a web browser downloading an image in the background
while its own UI stays scrollable; a word processor's own real,
background spell-check running while the user keeps typing, uninterrupted;
a real database performing a background index rebuild while still
answering ordinary queries
```

### SE Lens

Why does this real result — a responsive button next to a genuinely slow
background computation — actually hold, mechanically, rather than just
being hoped for? Because this project's own real architecture, built up
across the last three lessons, keeps these two real units of work on
two, real, structurally separate threads with no real dependency between
them: the button's own real `onClick` never touches
`Dispatchers.Default`, and the background coroutine never touches the
real main thread except to write its own final result back, briefly,
once. The real alternative this project deliberately moved away from —
running everything, including slow computation, directly on the main
thread — is exactly the real cost this stage's own opening measurement
already put an exact number on. The honest cost this project now carries
instead: two genuinely concurrent real units of work can still, in
principle, race for shared, mutable real state (`GraphScreen`'s own
`points`), which is precisely why this project's own real cancellation
guarantee — not just concurrency alone — is what keeps that shared state
correct, not merely fast.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest`, run above.

### Run It

Shown above — real, executed output, saved in full in
`verification/10.4/lab1_output.txt`.

### Connect the Pieces

This unit measured, for real, the exact positive result this entire
stage has been building toward: a genuinely slow background computation
— on `Dispatchers.Default`, launched via `LaunchedEffect` — leaves a real
button on the main thread free to respond almost immediately, closing
the loop this stage opened by measuring the exact opposite. The next unit
names, specifically, what this project's own real graphing work actually
costs, now that *where* it runs is no longer in question.

---

## Concept Unit: Naming the Real, Bounded Costs

### The Problem

The previous unit proved *where* `GraphScreen`'s own real work runs no
longer matters to the main thread's own responsiveness. But "doesn't
block the main thread" isn't the same claim as "costs nothing" — real
CPU time and real memory are still genuinely spent somewhere, on
whichever real thread `Dispatchers.Default` assigns. This project has
already, honestly, measured one of those three real costs — this
project's own real, warmed-up numbers already showed `toScreenPoints`/
`buildGraphPath` completing in well under a millisecond at this
project's own real, current sample count. What about the other two —
real memory, and real, on-screen rendering — has this project ever
actually measured either one, or only assumed they're fine?

Given each real, sampled `Point` is only two plain `Double`s — no
strings, no nested objects, no collections of its own — what would you
predict the real, total memory cost of this project's own real,
current `100`-point sample actually is: small enough to be genuinely
unmeasurable against normal JVM noise, or large enough to show up as a
real, distinct number? And given this project has already, three
separate times, found that code inside a real `DrawScope` draw lambda
doesn't observably execute under this project's own Robolectric setup —
is there anything left to newly investigate
about real rendering cost here, or is that already this project's own
settled, honest, standing limit?

### Introduce the Concept in Isolation

A real, temporary, plain `fun main()` — no Android needed, since
`Runtime.getRuntime()` and `Point` (a plain Kotlin data class) are both
already usable outside any Android/Robolectric context:

```kotlin
data class LabPoint(val x: Double, val y: Double)

fun main() {
    val runtime = Runtime.getRuntime()
    System.gc()
    val before = runtime.totalMemory() - runtime.freeMemory()

    val points = (1..100_000).map { i -> LabPoint(i.toDouble(), i.toDouble()) }

    val after = runtime.totalMemory() - runtime.freeMemory()
    val bytesPerPoint = (after - before).toDouble() / points.size
    println("Approximate real bytes per Point-shaped object: $bytesPerPoint")
}
```

Real, executed output (`kotlinc lab2_memory.kt -include-runtime -d
lab2.jar`, then run with `java -cp lab2.jar Lab2_memoryKt`; saved in full
in `verification/10.4/lab2_output.txt`):

```
Approximate real bytes per Point-shaped object: 60.07408
```

This is a real, approximate measurement, not an exact one — `System.gc()`
only *requests* a real garbage collection, never guarantees one runs
before the next line, and JVM memory accounting includes real, per-object
overhead beyond just the two `Double` fields themselves. It's precise
enough, though, to answer this unit's own real question: at this
project's own real, current scale — `100` points, not `100,000` — that's
a real `100 × 60.07408 ≈ 6,007` bytes, under `6` real kilobytes,
genuinely inconsequential against anything a real device would ever
notice.

### Discard the Throwaway Example

`lab2_memory.kt` was compiled and run standalone, outside the real
Gradle project, and never added to it — it never appears in the project
again.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator:

- `Runtime.getRuntime()` — the same real, already-established call,
  returning the real JVM `Runtime` singleton.
- `System.gc()` — a real, static call requesting the JVM attempt a real
  garbage collection; a real *request*, not a real *command* — the JVM
  is free to ignore it, though in practice it very often runs a real
  collection close to when asked.
- `runtime.totalMemory() - runtime.freeMemory()` — two real, already-
  detailed instance calls in the Header, subtracted to give a real,
  approximate "bytes currently in use" figure, computed twice: once
  before, once after, this lab's own real allocation.
- `(1..100_000).map { i -> LabPoint(i.toDouble(), i.toDouble()) }` — an
  ordinary, already-established real range-and-`map` call, building
  `100,000` real, distinct `LabPoint` instances — deliberately many more
  than this project's own real, current `100`-point sample, so the real
  memory delta is large enough to measure clearly above ordinary JVM
  noise.
- `(after - before).toDouble() / points.size` — ordinary, already-
  established real arithmetic, dividing the real, total measured delta
  by the real count of objects that produced it.

### CS Lens

This is **empirical memory profiling** — measuring a real program's
actual memory use by observing a real, live JVM directly, rather than
computing a theoretical number from a data class's own declared fields
alone.

```
Also recognized in: a real production service's own memory dashboard,
watched directly rather than trusted from a spec; a real game engine's
own memory budget, checked against an actual running build, not just a
design document; any real "why did memory usage spike" investigation
that starts by measuring, not guessing
```

### SE Lens

Why measure this project's own real memory cost empirically at all,
rather than simply reasoning "each `Point` is two `Double`s, `16` real
bytes, times `100` points, therefore `1,600` real bytes, done"? The real
alternative — pure arithmetic reasoning from a data class's own declared
fields — is faster and needs no real code run at all. The real cost:
it's honestly incomplete — a real JVM object also carries real, per-
object overhead (an object header, real alignment padding, and, for a
`List` specifically, the real cost of the list structure itself, not
just its elements) that a naive field-counting calculation leaves out
entirely, understating the real number. This unit's own real,
empirical measurement captures the true, complete real cost, overhead
included, at the honest expense of being an approximate range rather
than an exact, theoretically clean figure. Either way, at this project's
own real, current `100`-point scale, the real answer is the same:
genuinely, measurably inconsequential.

**Rendering, named honestly rather than re-investigated**: this
project's own real, standing limit — that code inside a real `DrawScope`
draw lambda does not observably execute under this project's own
Robolectric setup — was already independently confirmed three separate
times, each by a real, executed attempt, never merely assumed from the
previous lesson's own finding. This lesson adds
no fourth attempt; the honest, standing answer is unchanged; real,
on-device pixel and frame-timing verification remains outside what this
environment can currently prove.

### Commands Needed

`kotlinc lab2_memory.kt -include-runtime -d lab2.jar` compiles this real,
standalone lab, bundling the Kotlin runtime into one real, executable
jar; `java -cp lab2.jar Lab2_memoryKt` runs it — the same real,
mechanical Kotlin-to-JVM naming convention (capitalize the file name,
append `Kt`) already established earlier in this stage.

### Run It

Shown above — real, executed output, saved in full in
`verification/10.4/lab2_output.txt`.

### Connect the Pieces

This unit named, with real, measured or already-established evidence,
all three real costs this stage's own opening lesson implicitly raised:
CPU time (already real, warmed-up-measured, sub-millisecond), memory
(real, empirically measured this session, genuinely
inconsequential at this project's own real scale), and rendering (an
honest, already three-times-confirmed standing limit, not newly
investigated). Together with the previous unit's own real proof that the
main thread stays free while all of this happens, Slice 10's own real
promise — expensive graph calculations don't freeze the UI — is now
closed, measured, and named, not merely assumed.

---

## Connect the Pieces

One concrete real thread of evidence, traced through both units: this
project's own real, `2`-second deliberately-slow background computation,
launched on `Dispatchers.Default` exactly as `GraphScreen`'s own real
sampling work already is. The first unit measured, for real, that a
button on the main thread stays responsive the entire time that
computation runs — the exact, positive mirror of this stage's own real
opening measurement, `elapsedMs=584` for a genuinely blocked thread, this
time proving nothing waits. The second unit then named what that
background computation, and this project's own real sampling work
generally, actually costs: a real, sub-millisecond CPU cost already
measured earlier in this project's own life; a real, empirically
measured memory cost, genuinely small at this project's own real scale;
and an honestly unresolved rendering question, named rather than hidden.
Four lessons after this stage's own opening real measurement first
proved a slow tap could freeze this entire project's screen, this
project's own real graphing work now runs
correctly, responsively, and with its real costs actually known — closing
Stage 10 (Concurrency & Performance), Slice 10 (Smooth Graphing), in
full.

**Next:** Lesson 11.1 (How to Read API Documentation).

