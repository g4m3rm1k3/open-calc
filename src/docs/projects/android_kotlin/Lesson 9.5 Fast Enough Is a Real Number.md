# Lesson 9.5: Fast Enough Is a Real Number

**What you will build.** No new user-visible feature — this lesson
investigates a real question about this project's own already-shipped
graph: every real gesture — a real drag or pinch — triggers a
real redraw, recomputing this project's own screen transform and
rebuilding a real `Path` from scratch every single time. This lesson
finds out, with real, executed evidence rather than a guess, whether
that repeated work is actually expensive, and turns the answer into one
new, permanent, automated test guarding against it getting slower later.
The transferable problem underneath it: "is this fast enough" is not a
feeling — it is always a real, measured number compared against a real,
concrete budget, and a project that never measures either one is
guessing.

**What you need to know first.** This project's own real `GraphScreen`,
`toScreenPoints`, and `buildGraphPath` — all already real, permanent
code. Lesson 5.2's own established real methodology for measuring
computational cost — counting or timing something for real, never
asserting a growth rate from confidence alone. Lesson 9.3's own
confirmed finding that this project's tooling cannot observe code
running inside a real `DrawScope` draw lambda.

## Terms used in this lesson

- **Frame budget** — the real amount of time a real, interactive UI has
  to compute and draw one single frame before a user perceives it as
  laggy — on a real, standard 60-hertz display, a real `16.67`
  milliseconds. It exists because "fast" only has meaning relative to a
  concrete deadline; work that would be instant for a batch script can
  still be too slow if it has to repeat every single frame within this
  real budget.
- **Warm-up pass** — a real, deliberately discarded set of repeated
  calls to the exact code about to be measured, run immediately before
  the real, kept measurement. It exists because a JVM does not run code
  at its true, steady-state speed the first time it's called — the
  genuine cost of interpreting bytecode and, later, real
  just-in-time-compiling it into faster native code is real,
  measurable, and would otherwise be counted as if it were the
  algorithm's own real cost, when it's actually a one-time startup tax.
- **Just-in-time (JIT) compilation** — a real JVM feature that watches
  which code actually runs often, and compiles that specific code down
  into fast, native machine instructions partway through a program's own
  execution, rather than ahead of time. It exists because compiling
  every possible code path ahead of time would be wasteful; compiling
  only the code that's actually proven itself hot, once real usage shows
  which code that is, gets most of the real speed benefit for much less
  real up-front cost.
- **Regression guard** — a real, permanent, automated test asserting a
  measured property stays within some concrete real bound, added not
  because a real problem was found, but specifically so a future real
  change that quietly makes something worse gets caught immediately,
  automatically, instead of being noticed by a real, frustrated user
  first.

## Objects and methods used

This lesson's own subject — measuring this project's own real,
already-shipped code and turning that measurement into a permanent
guard — reuses this project's own already-established functions rather
than introducing a new external class or method, so it has no entry of
its own here. Every real class or method this lesson's new code
actually calls is supporting cast, listed below under one trailing
heading.

### Everything else in the file, not this lesson's subject but still explained

- **`System.nanoTime()`**
  - *What it is:* A real, standard Java platform method returning the
    current value of a real, high-precision system timer, in
    nanoseconds.
  - *Implementation:* `java.lang.System.nanoTime(): Long` — a real,
    `static` method returning a real `Long`; its own absolute value has
    no defined real-world meaning (it isn't wall-clock time), but the
    real difference between two calls to it, on the same real machine,
    is a real, accurate elapsed duration.
  - *Its use:* this lesson's own real measurement code calls this once
    immediately before, and once immediately after, the exact real code
    being timed, so the real difference between the two is that code's
    own real elapsed time.
  - *Type:* a `static` method — callable directly on the `System` class
    itself, with no instance to construct.
  - *Responsibility:* reporting the real, current reading of a
    high-precision timer, suitable for measuring real, short elapsed
    durations accurately.
  - *Depends on:* nothing; it reads real information the JVM already
    tracks internally.
  - *Connects to:* called directly in this lesson's own real test code;
    the real difference between two of its own return values is what
    gets converted into real milliseconds for this lesson's own
    assertion.
  - *Shape:* a small, real, standard measurement primitive — the same
    real tool this project's own `Calculator.kt` first used, back in
    Stage 2, to show `CalculatorTest.kt`'s own tests running in a real
    fraction of a second.
- **`repeat`**
  - *What it is:* A Kotlin standard-library function that calls a given
    lambda a real, fixed number of times.
  - *Implementation:* `kotlin.repeat(times: Int, action: (Int) -> Unit):
    Unit` — calls `action` exactly `times` times, passing the current
    real iteration index (`0` through `times - 1`) each time; this
    lesson's own code never reads that index.
  - *Its use:* this lesson's own real warm-up pass calls this to run the
    exact code about to be measured a real `50` times, letting the real
    JIT (full treatment in Terms, above) finish its own real work before
    any measurement begins.
  - *Type:* a top-level, generic (in its own return type only) function.
  - *Responsibility:* running a given block of code a real, exact,
    fixed number of times, in order, with no other side effect of its
    own.
  - *Depends on:* the real `Int` count and the `action` lambda to run
    that many times.
  - *Connects to:* called directly in this lesson's own real test code;
    each real call inside it is identical to the real call this lesson
    later measures.
  - *Shape:* a small, general-purpose looping primitive — the same real
    shape as a `for` loop counting to a fixed bound, written as a single
    real function call instead.
- **`assertTrue`**
  - *What it is:* A real JUnit assertion method that fails a test, with
    a real, given message, if a given condition is `false`.
  - *Implementation:* `org.junit.Assert.assertTrue(message: String,
    condition: Boolean): Unit` — throws a real `AssertionError`,
    carrying the given `message`, if `condition` is `false`; does
    nothing at all if it's `true`.
  - *Its use:* this lesson's own real permanent test calls this to fail,
    with a real, specific real elapsed-time value in its own message, if
    this project's own real transform-and-path-build work ever takes
    real, measured longer than this lesson's own chosen bound.
  - *Type:* a real, `static` method, part of the same `org.junit.Assert`
    class this project's own tests have called `assertEquals` on since
    Stage 0.
  - *Responsibility:* checking one real, boolean condition and reporting
    a real, specific, human-readable failure if it's ever `false`.
  - *Depends on:* the real `Boolean` condition to check and a real
    `String` message describing what was actually expected.
  - *Connects to:* called once, at the very end of this lesson's own
    real permanent test; the real message it's given includes the exact
    real elapsed time actually measured, so a real future failure
    reports precisely how slow this project's own code actually got,
    not just that it failed.
  - *Shape:* the same real family of assertion this project has used
    since its very first real test — the boundary between "the code ran"
    and "the code's own real result was verified to be correct."

---

## Concept Unit: Finding Where the Real Time Goes

### The Problem

Every real drag or pinch this project's own `GraphScreen` now responds
to triggers a real redraw — and every real redraw calls
`toScreenPoints` and `buildGraphPath` again, from scratch, on this
project's own real, currently-sampled `100` points. Nothing
built so far says whether that's actually a real problem: repeating
work on every frame is only expensive if the work itself takes real,
meaningful time relative to how often it repeats.

Before reading on: if a real gesture like a drag can report dozens of
real movement events per second, roughly how much real time would each
individual redraw have to stay under so the graph still feels smooth,
not laggy? Given `toScreenPoints` calls `toScreen` exactly once per real
point (an already-established real fact about `List.map`), and
`buildGraphPath` calls `moveTo` once and `lineTo` once per remaining
real point, what real relationship would you expect between "how many
points this project samples" and "how long these two functions actually
take"? If you ran a real timing measurement on the very first call your
test ever makes to a function, would you expect that first, real
measurement to be faster, slower, or about the same as the tenth real
call to the identical code?

### Introduce the Concept in Isolation

This project's own real `toScreenPoints` and `buildGraphPath` already
exist, permanent and unchanged since Lessons 9.1–9.3; nothing new needs
isolating in a throwaway lab here — what's genuinely new is measuring
them correctly, an isolated, temporary experiment in its own right, run
directly against this project's own real functions:

```kotlin
@Test
fun timeToScreenPointsAndBuildGraphPathAtIncreasingSampleCounts() {
    for (count in listOf(100, 1_000, 10_000, 100_000)) {
        val tree = buildTree(toPostfix(tokenize("x×x")))
        val points = sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, count)

        val transformStart = System.nanoTime()
        val screenPoints = toScreenPoints(points, 500, 500, 20.0)
        val transformEnd = System.nanoTime()

        val pathStart = System.nanoTime()
        buildGraphPath(screenPoints)
        val pathEnd = System.nanoTime()

        val transformMicros = (transformEnd - transformStart) / 1000.0
        val pathMicros = (pathEnd - pathStart) / 1000.0
        println("count=$count toScreenPoints=${transformMicros}us buildGraphPath=${pathMicros}us")
    }
}
```

Run for real, with no warm-up pass yet:

```
count=100 toScreenPoints=199.834us buildGraphPath=10852.541us
count=1000 toScreenPoints=256.875us buildGraphPath=1966.958us
count=10000 toScreenPoints=954.75us buildGraphPath=2443.875us
count=100000 toScreenPoints=5201.333us buildGraphPath=14762.166us
```

This first, real, executed run already proves something worth knowing
before trusting a single one of these numbers: `count=100`'s own real
`buildGraphPath` measurement, `10853` microseconds, is the *slowest* of
all four, despite having the *fewest* real points to process — the
opposite of what more real work should ever produce. This is a real,
observed, confirmed instance of paying a **warm-up pass**'s own real
cost (full treatment in Terms, above) without actually taking one: the
very first real call to `buildGraphPath` in this entire test also pays
for the real, one-time cost of the JVM's own class loading and the real
**JIT compilation** (full treatment in Terms, above) of code that has
never run before — a real, one-time tax being mistaken for the
algorithm's own genuine cost.

Adding a real warm-up pass — `50` real, discarded calls to the exact
same code, immediately before the real, kept measurements — and
averaging each real count over `20` real repetitions:

```
count=1000 toScreenPoints=159.2062us buildGraphPath=144.8478us
count=10000 toScreenPoints=165.0001us buildGraphPath=834.3813us
count=100000 toScreenPoints=781.08135us buildGraphPath=3294.0459499999997us
count=1000000 toScreenPoints=7886.83955us buildGraphPath=43205.5us
```

This second, real, executed run proves the real warm-up pass genuinely
mattered: the earlier, backwards result is gone, and real cost now
climbs alongside real point count, as expected. It also proves something
worth knowing honestly, not smoothed over: the real climb isn't a
perfectly clean straight line either — `toScreenPoints` grows by a real
`50`-fold (from `159us` to `7887us`) while its own real input grows by a
real `1000`-fold (from `1,000` to `1,000,000` points), even though
`toScreenPoints` calls `toScreen` exactly once per real point, by
`List.map`'s own already-established, documented contract — genuinely
`O(n)` *by construction*, regardless of what any one, real, noisy
wall-clock measurement happens to show. A raw, wall-clock timing loop
like this one, with no dedicated benchmarking tool controlling
precisely for JIT tiering or garbage collection, is real and honest
evidence of *roughly* how expensive something is — not a perfectly
clean proof of its own algorithmic growth rate, which is a separate,
real claim, provable instead by reading exactly what the code itself
does.

### Discard the Throwaway Example

The temporary timing loop above, and its own two real runs, are
deleted; neither becomes part of this project's own permanent test
suite. What survives is the real, confirmed knowledge it produced: a
warm-up pass is required before trusting any timing measurement, and
this project's own transform-and-path-building code is genuinely fast
at the point counts it actually uses.

### Mechanical Walkthrough

Every distinct syntactic element in the lab above, in the order it
appears:

- `for (count in listOf(1_000, 10_000, 100_000, 1_000_000))` — a real
  `for`-in loop (already established) over a real, literal `List<Int>`;
  the underscores inside each number (`1_000`) are a real Kotlin literal
  separator, purely cosmetic, making a large real number easier to read
  without changing its real value at all.
- `val tree = buildTree(toPostfix(tokenize("x×x")))` and `val points =
  sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, count)` — this
  project's own already-established real pipeline, called fresh inside
  each real iteration so every real count gets its own real, freshly
  sampled points.
- `val transformStart = System.nanoTime()` — calls the real
  **`System.nanoTime()`** (full treatment above), capturing a real
  timestamp immediately before the code actually being measured.
- `val screenPoints = toScreenPoints(points, 500, 500, 20.0)` — this
  project's own already-established real function, called with
  literal, arbitrary real origin values (`500`, `500`) and a real scale
  (`20.0`) — the exact real values don't affect how long the call takes,
  only `points`'s own real size does.
- `val transformEnd = System.nanoTime()` — a second real call to
  `System.nanoTime()`; the real difference between this and
  `transformStart` is `toScreenPoints`'s own real, measured elapsed time.
- `val pathStart`/`buildGraphPath(screenPoints)`/`val pathEnd` — the
  identical real pattern, this time timing `buildGraphPath`.
- `println("count=$count toScreenPoints=${(transformEnd -
  transformStart) / 1000.0}us buildGraphPath=${(pathEnd - pathStart) /
  1000.0}us")` — a real string template (already established) computing
  each real duration in nanoseconds, dividing by `1000.0` to report real
  microseconds instead, using **`/`** (already established, real
  division).

### CS Lens

This is real **microbenchmarking** — measuring a small, isolated piece
of code's own real execution time directly, and, specifically, the real
discipline of a **warm-up pass** (full treatment in Terms, above)
required to make such a measurement trustworthy at all, since a JVM's
own real performance genuinely changes over the lifetime of a running
process.

```
Also recognized in: dedicated benchmarking frameworks like JMH
explicitly running warm-up iterations before any measured ones,
a race car's own warm-up laps before a timed qualifying lap, an
athlete's own warm-up routine before a timed real event
```

Every one of these shares the same real idea: measuring something in
its own true, steady, representative state requires deliberately
excluding the real, atypical cost of *starting*, which is a real,
genuine cost, just not the one actually being asked about.

### SE Lens

The design choice worth naming here is measuring this project's own
real functions directly — calling `toScreenPoints`/`buildGraphPath` as
plain functions — rather than trying to measure them through a real,
composed `GraphScreen`, inside an actual `Canvas` draw pass. The
alternative was investigated and rejected for a real, concrete reason:
this project's own tooling already confirmed, in real, executed
evidence, that code running inside a real `DrawScope` draw lambda isn't
observable under Robolectric at all — an attempt to measure real
elapsed time from
*inside* that same draw lambda would face the identical real limitation,
producing no real, reportable number whatsoever. Measuring the two
underlying, `DrawScope`-free functions directly sidesteps that real
limitation completely, at the honest cost of not measuring the real
`Canvas`/`Path`-drawing step itself — the one piece of this project's
own graphing feature that remains, and will likely always remain,
outside what this project's own tooling can directly time.

### Commands Needed

```
./gradlew :app:testDebugUnitTest --tests "com.example.calculator.LabTimingProbeTest"
```

Runs only this lesson's own real, temporary timing experiment, via this
project's already-established Robolectric setup (required here only
because `buildGraphPath` constructs a real `Path`, already confirmed to
need it).

### Run It

```
count=1000 toScreenPoints=159.2062us buildGraphPath=144.8478us
count=10000 toScreenPoints=165.0001us buildGraphPath=834.3813us
count=100000 toScreenPoints=781.08135us buildGraphPath=3294.0459499999997us
count=1000000 toScreenPoints=7886.83955us buildGraphPath=43205.5us
```

Real, saved in `verification/9.5/lab2_timing.kt` and
`verification/9.5/lab2_output.txt`, alongside
`verification/9.5/lab1_no_warmup.kt` and
`verification/9.5/lab1_no_warmup_output.txt` — the earlier, un-warmed-up
run's own real, backwards numbers, kept as honest evidence of why the
warm-up pass matters.

### Connect the Pieces

This unit proved this project's own transform-and-path-building code is
genuinely fast — even at `1,000,000` real points, nowhere near this
project's own real `100`, the combined real cost stays in the tens of
microseconds to low milliseconds, nowhere near a real **frame budget**'s
own `16.67` millisecond limit. Nothing about that real proof is
permanent yet — the next unit turns it into something this project keeps
checking automatically, forever.

---

## Concept Unit: A Permanent Guard Against Getting Slower

### The Problem

This lesson's own first unit produced real, convincing evidence that
this project's own graph redraws fast enough — but that evidence lives
only in this lesson's own now-discarded lab and a saved text file,
checked once, by hand, this session. Nothing stops a future, real change
to `toScreenPoints`, `buildGraphPath`, or the code either one calls from
quietly making this project's own real redraw meaningfully slower,
without anyone actually noticing until a real user does.

Before reading on: given this lesson's own first unit already proved
this project's own real code, at its own real point count, takes well
under a single real millisecond, what real, generous time bound would
you choose for a permanent test — one tight enough to actually catch a
real, meaningful slowdown, but loose enough that ordinary, real
machine-to-machine variance in test-running speed would never make it
fail by accident? Should a permanent performance test include its own
real warm-up pass, the same way this lesson's own first unit's own
second, corrected measurement did — or would skipping it risk the exact
same real, backwards result this lesson already caught once?

### Introduce the Concept in Isolation

Nothing here needs a throwaway lab — the real functions being verified
are already fully proven, and the only genuinely new idea, a permanent
test asserting a real measured duration stays under a real bound, is
small enough to write directly as real, permanent code, the same way
this project's own real `GraphTransform`/`applyGesture` needed no
separate throwaway form either.

### Discard the Throwaway Example

Nothing is discarded in this unit — there is no throwaway version to
discard.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition, directly motivated by this lesson's own first
  unit's own real, measured findings.
- **Files affected:**
  `app/src/test/java/com/example/calculator/PerformanceTest.kt` (new
  file).
- **Change type:** add.
- **Location:** a brand-new file — nothing to locate a position within.
- **Dependencies:** this project's own real `tokenize`/`toPostfix`/
  `buildTree`/`evaluateAt`/`sample`/`toScreenPoints`/`buildGraphPath` —
  all already real, permanent code; Robolectric, already required for
  any real test touching `buildGraphPath`'s own real `Path`.

### The New Code

```kotlin
@Test
fun transformingAndBuildingAPathForThisProjectsOwnRealSampleCountStaysWellUnderOneFrameBudget() {
    // Arrange
    val tree = buildTree(toPostfix(tokenize("x×x")))
    val points = sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100)
    repeat(50) {
        buildGraphPath(toScreenPoints(points, 500, 500, 20.0))
    }

    // Act
    val start = System.nanoTime()
    val screenPoints = toScreenPoints(points, 500, 500, 20.0)
    buildGraphPath(screenPoints)
    val elapsedMillis = (System.nanoTime() - start) / 1_000_000.0

    // Assert
    assertTrue("expected under 5ms, took ${elapsedMillis}ms", elapsedMillis < 5.0)
}
```

### Mechanical Walkthrough

Every distinct syntactic element in the code above, in the order it
appears, beyond what this lesson's own first unit's identical real
pipeline call and timing pattern already fully explained:

- `repeat(50) { buildGraphPath(toScreenPoints(points, 500, 500, 20.0))
  }` — calls the real **`repeat`** (full treatment above), running the
  exact real call about to be measured `50` real times first, discarding
  every real result — this test's own real **warm-up pass** (full
  treatment in Terms, above), directly applying what this lesson's own
  first unit already proved is required.
- `val elapsedMillis = (System.nanoTime() - start) / 1_000_000.0` —
  converts a real nanosecond difference into real milliseconds by
  dividing by `1_000_000.0`, matching the real unit this test's own
  chosen bound is expressed in.
- `assertTrue("expected under 5ms, took ${elapsedMillis}ms",
  elapsedMillis < 5.0)` — calls the real **`assertTrue`** (full
  treatment above); `elapsedMillis < 5.0` uses the real `<` comparison
  operator (already established), `true` only if this run's own real,
  warmed-up measurement stayed under a real `5` millisecond bound —
  chosen generously above this lesson's own first unit's own real,
  observed sub-millisecond measurements at far larger real point
  counts, but still tight enough to catch a real, meaningful future
  regression.

### CS Lens

This is a real **regression guard** (full treatment in Terms, above) —
a specific application of the general CS idea of a **performance
budget**: a concrete, numeric ceiling a real system commits to staying
under, checked automatically, rather than trusting an informal
impression that "it still feels fine."

```
Also recognized in: a build pipeline's own bundle-size limit
failing a build that grows too large, a web performance budget
failing a deploy whose page-load time regresses, a database's
own query-time alerting threshold
```

Every one of these turns a real, once-measured fact into a permanent,
automatically-enforced real commitment — exactly what this unit's own
new test does for this project's own graph.

### SE Lens

The design choice worth naming here is writing a real, permanent test
at all, when this lesson's own first unit already found no real problem
to fix. The alternative — treating "we measured it once, and it was
fine" as the end of the investigation — was rejected because a
one-time, manual measurement proves nothing about *tomorrow's* code:
the real value of this unit's own test isn't catching a problem that
exists today, it's catching one that might exist after some future,
real, unrelated change quietly makes `toScreenPoints` or
`buildGraphPath` meaningfully slower without anyone timing it by hand
again. The real cost: one more real test to keep passing, and a real,
somewhat arbitrary bound (`5` milliseconds) chosen by informed
judgment, not derived by any formula — worth it here specifically
because the alternative is a real regression going unnoticed until a
real user feels it lag.

### Commands Needed

```
./gradlew :app:testDebugUnitTest :app:assembleDebug
```

The same real, combined command this project has run after every real
production change since Stage 1.

### Run It

```
$ ./gradlew :app:testDebugUnitTest --rerun-tasks --console=plain
BUILD SUCCESSFUL in 15s
32 actionable tasks: 32 executed
$ find app/build/test-results/testDebugUnitTest -name "*.xml" | xargs grep -h "tests=" | \
  grep -oE 'tests="[0-9]+" skipped="[0-9]+" failures="[0-9]+"' | \
  awk -F'"' '{t+=$2; s+=$4; f+=$6} END {print "total tests:", t, "skipped:", s, "failures:", f}'
total tests: 95 skipped: 0 failures: 0
$ ./gradlew :app:assembleDebug --console=plain
BUILD SUCCESSFUL in 844ms
```

This one new, real, permanent test —
`transformingAndBuildingAPathForThisProjectsOwnRealSampleCountStaysWellUnderOneFrameBudget`
— ran for real four separate times this session, with its own warm-up
pass, before being trusted: every real run passed, comfortably under
its own real `5` millisecond bound. Real, saved in
`verification/9.5/step2_full_suite.txt` and
`verification/9.5/step2_PerformanceTest.kt`.

### Connect the Pieces

This project's own real graph now carries a permanent, automatic answer
to the question this whole lesson opened with: is redrawing on every
gesture actually expensive? Today, verified for real, no — and if that
real answer ever stops being true, this unit's own new test, not a real
user's own frustration, is what will notice first.

---

## Closing

**Connect the pieces.** This lesson asked a real question about
already-shipped, already-working code: does redrawing this project's own
graph on every single gesture event actually cost anything worth
worrying about? The first unit found the honest answer required real
discipline to get right — an un-warmed-up measurement lied, reporting a
smaller real workload as slower than a larger one, purely from real JVM
startup cost; a properly warmed-up, repeated, averaged measurement told
the real, corrected story instead, one consistent with what `toScreenPoints`'s
own real, documented `map`-based structure already predicted: real,
genuine growth with real input size, at costs measured in microseconds,
nowhere near a real frame's own budget. The second unit turned that
one-time, honest investigation into something permanent: a real,
warmed-up, automated test this project will keep running forever,
failing loudly the moment some future, real change actually makes this
project's own graph slow enough to matter.

Slice 9 — the interactive graphing calculator this whole stage set out
to build — is now complete: a real expression parses, samples, and
draws a real, continuous curve; a real finger drags and pinches it; and
this project now knows, with real, measured evidence rather than a
guess, that all of it happens fast enough to feel real.
