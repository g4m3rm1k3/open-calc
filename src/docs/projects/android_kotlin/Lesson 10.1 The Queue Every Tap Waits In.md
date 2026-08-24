# Lesson 10.1: The Queue Every Tap Waits In

**What you will build.** No new shipped feature — Stage 10 opens the same
way Stages 4, 8, and 9 each opened: a purely diagnostic lesson, no
production code left changed by the end of it, that proves a real problem
before later lessons fix it. This lesson proves, with real, executed
evidence, exactly what Android's real main thread is, why it can only
ever run one thing at a time, and — the real, motivating finding —
that this project's own real `CalculatorButton` click handling already
runs on that exact thread. That means a genuinely slow `onClick` doesn't
just slow down its own button; it measurably freezes the entire screen
for its whole duration. That's the real, proven problem Slice 10
("Smooth Graphing") exists to solve; Lessons 10.2 and 10.3 build the
actual fix.

**What you need to know first:**
- Lesson 1.4 (State) and Lesson 1.5 (Events) — `remember`, recomposition,
  and the real `onClick` callback mechanism this lesson investigates.
- Lesson 3.6 (Haptics) — `CalculatorButton`'s own real, shared `onClick`
  lambda (`haptic.performHapticFeedback(...); onClick()`), the exact real
  code this lesson temporarily patches and then reverts.
- Lesson 4.3 (An Owner That Outlives the Screen) — `CalculatorViewModel`,
  and its `onButtonClick`, what the passed-in `onClick` lambda actually
  calls.
- Lesson 7.5 (Waiting Without Blocking) — `Thread.currentThread().name`,
  the real lab proving `Dispatchers.IO` genuinely switches threads, and
  the already-established real finding that Room's own suspend queries
  run safely off the main thread with no explicit dispatcher needed.
- Lesson 9.5 (Fast Enough Is a Real Number) — `System.nanoTime()`, this
  project's own already-established real wall-clock measurement
  methodology.

No pipeline diagram — this lesson doesn't touch this project's expression
or graphing pipelines.

## Terms used in this lesson

- **`@RunWith(RobolectricTestRunner::class)`** — a JUnit class-level
  annotation handing control of a test class to `RobolectricTestRunner`
  instead of running it directly. Without it, none of Android's real
  classes — `Looper`, `Handler`, Compose's own test rule — would have a
  real, simulated Android runtime underneath them, and every one of them
  would throw the instant this lesson's code touched them.
- **`@Config(sdk = [34])`** — a Robolectric-specific annotation pinning
  which real, simulated Android SDK version a test class runs against.
  This project's own real `compileSdk`/`targetSdk` is `34` (established
  in Lesson 1.1), so this keeps the simulated environment matching what
  the project actually ships against.
- **`for (;;)`** — Java's own infinite-loop idiom, appearing only inside
  a real, quoted excerpt of Android's own `Looper.loop()` source below —
  not code this lesson's reader types. Three empty clauses (no init, no
  condition, no increment) mean the loop never exits on its own; Kotlin's
  own equivalent, already familiar from this project's code, is
  `while (true)`.

## Objects and methods used

**`Looper`**
- *What it is:* the real Android class representing one running message
  loop, bound to exactly one thread.
- *Implementation:* `public final class Looper` (`android.os.Looper`).
  Real declared shape of the three members this lesson calls, confirmed
  from the real, fetched source
  (`android.googlesource.com/platform/frameworks/base`,
  `core/java/android/os/Looper.java`, fetched this session):
  ```
  public static Looper getMainLooper();
  public static void loop();
  public @NonNull Thread getThread();
  ```
  Holds a real `MessageQueue` field internally and the real `Thread` it's
  bound to. `getMainLooper()` returns the one `Looper` Android itself
  creates for the app's main thread. `loop()`'s real, fetched body
  (branch `refs/heads/main`, lines 327–331) is literally `for (;;) { if
  (!loopOnce(...)) return; } ` — a genuine infinite loop, not a metaphor
  for one. `getThread()` (same branch, line 513) returns the real
  `Thread` this specific `Looper` is bound to.
- *Its use:* this lesson reads `Looper.getMainLooper()` to reach the
  exact real `Looper` every one of this project's real UI events already
  runs through.
- *Type:* `getMainLooper()` and `loop()` are both `public static`
  methods; `Looper` itself is a real, instantiable class — one instance
  per thread that calls the real `Looper.prepare()`.
- *Responsibility:* owns one real thread's real message queue, and runs
  the real loop that pulls the next message off it and dispatches it back
  to whichever `Handler` posted it, forever, until told to quit.
- *Depends on:* a real `MessageQueue` (created internally, one per
  `Looper`) and a real `Thread` to run on. `getMainLooper()` specifically
  depends on Android's own runtime already having called the real
  `Looper.prepareMainLooper()` during app startup, before any app code
  runs.
- *Connects to:* `Handler` posts real work onto a `Looper`'s queue;
  `loop()` calls back into whichever `Handler` originally posted each
  message. Under Robolectric, `ShadowLooper` wraps this exact real class
  to make its otherwise-endless `loop()` controllable from test code.
- *Shape:* a real Android platform class, part of `android.os`'s public
  API surface — this lesson reaches it directly, not through any of this
  project's own code.

**`Handler`**
- *What it is:* the real Android class used to post real work — a
  `Runnable` — onto a specific `Looper`'s own queue.
- *Implementation:* `public class Handler` (`android.os.Handler`). Real
  declared shape of the two members this lesson calls, confirmed from the
  real, fetched source
  (`android.googlesource.com/platform/frameworks/base`,
  `core/java/android/os/Handler.java`, branch `refs/heads/android14-release`,
  fetched this session):
  ```
  public Handler(@NonNull Looper looper);
  public final boolean post(@NonNull Runnable r);
  ```
  `post`'s own real, fetched body (lines 423–436) is one line — `return
  sendMessageDelayed(getPostMessage(r), 0)` — meaning `post` only
  enqueues; it never runs `r` itself. The real, fetched class Javadoc
  states plainly: *"When a process is created for your application, its
  main thread is dedicated to running a message queue that takes care of
  managing the top-level application objects (activities, broadcast
  receivers, etc) and any windows they create."*
- *Its use:* this lesson builds `Handler(Looper.getMainLooper())` to post
  three ordinary Kotlin lambdas onto the real main `Looper`'s own queue,
  from ordinary test code.
- *Type:* the constructor is a real, public constructor; `post` is a
  `public final` instance method — `final` here means no subclass can
  override it.
- *Responsibility:* the one real, documented way ordinary code hands work
  to a specific `Looper`'s thread without ever touching that thread
  directly.
- *Depends on:* a real `Looper` to bind to, supplied to its constructor.
- *Connects to:* `post` calls `sendMessageDelayed` → `getPostMessage`,
  wrapping the given `Runnable` in a real `Message` and pushing it onto
  that `Looper`'s own `MessageQueue`; the `Looper`'s own `loop()` is what
  actually calls back into it later.
- *Shape:* a real Android platform class, the documented public entry
  point for reaching a `Looper`'s queue from outside it.

**`MessageQueue`**
- *What it is:* the real, ordered holding area a `Looper` owns — every
  posted `Runnable` sits here until the loop reaches it.
- *Implementation:* `android.os.MessageQueue`. Confirmed, from the real,
  fetched `Looper.java` source (line 88), as the exact declared type of
  `Looper`'s own private field: `final MessageQueue mQueue;` — one real
  queue instance per `Looper`, never shared between them.
- *Its use:* this lesson's own code never calls a `MessageQueue` method
  directly — it's named here because it's the literal "queue" this
  lesson's own title refers to, and because `Handler.post`'s real body,
  above, pushes directly into one.
- *Type:* a real, instantiable class; each `Looper` owns exactly one,
  created internally.
- *Responsibility:* holds every pending unit of work for one real thread,
  in the exact real order it arrived, and hands the next one to the loop
  when asked.
- *Depends on:* nothing from outside — it's created and owned entirely by
  its own `Looper`.
- *Connects to:* `Handler.post` writes into it; `Looper.loop()` reads the
  next item out of it, one at a time.
- *Shape:* an internal collaborator sitting behind `Looper`'s own public
  API — this lesson's code never touches it directly, only through
  `Handler`/`Looper`.

**`org.robolectric.Shadows.shadowOf(Looper)`**
- *What it is:* Robolectric's own real, static entry point for reaching
  the fake, controllable internals sitting behind a real Android class
  under test.
- *Implementation:* `public static ShadowLooper shadowOf(Looper actual)`,
  imported here as `org.robolectric.Shadows.shadowOf` — generated by
  Robolectric's own annotation processor at build time, part of this
  project's own real, already-resolved `robolectric:4.13` dependency
  (established in Lesson 1.4).
- *Its use:* this lesson calls it to reach the real, controllable
  "shadow" standing behind the real `Looper.getMainLooper()` this project
  already gets under Robolectric.
- *Type:* a `public static` method, one of many overloads Robolectric
  generates, one per shadowed Android class.
- *Responsibility:* given a real Android object under test, return the
  specific fake implementation Robolectric substituted in behind it, so
  test code can inspect or control state a real device would normally
  hide.
- *Depends on:* a real Robolectric test environment already being active
  (via `@RunWith(RobolectricTestRunner::class)`) and the real object
  passed in already having a matching shadow class generated for it.
- *Connects to:* called here on `Looper.getMainLooper()`; returns the
  real `ShadowLooper` this lesson then calls `.isPaused`/`.idle()` on.
- *Shape:* Robolectric's own public API surface, the standard way any of
  this project's tests reach past a real Android class's normal,
  otherwise-opaque behavior.

**`ShadowLooper`**
- *What it is:* Robolectric's own real class standing behind every
  `Looper` under test, controlling exactly when its queue actually runs.
- *Implementation:* its real declared shape, both members this lesson
  calls, confirmed via `javap -p` against this project's own real,
  installed `shadows-framework-4.13.jar`:
  ```
  public abstract boolean isPaused();
  public abstract void idle();
  ```
- *Its use:* `isPaused` proves the real main `Looper` starts paused under
  test — nothing runs automatically; `idle()` is the real, explicit
  command telling it to run everything currently queued.
- *Type:* both are real, `public abstract` instance methods on an
  abstract class Robolectric provides a concrete implementation of
  internally.
- *Responsibility:* stand in for a real device's own main thread, which
  never stops — but pause it by default, so a test can inspect state
  *between* posting work and that work actually running, something
  impossible to observe on a real device where the loop is always moving.
- *Depends on:* the real `Looper` it was built from, via `shadowOf`.
- *Connects to:* `.idle()` reaches into that `Looper`'s own real
  `MessageQueue` and runs everything sitting there, in order, calling
  back through each item's original `Handler` exactly as `Looper.loop()`
  itself would on a real device.
- *Shape:* Robolectric's own internal-but-public testing API — a
  controllable stand-in for behavior a real device performs automatically
  and continuously.

**`check`**
- *What it is:* a real Kotlin standard-library function that throws when
  a given condition is false.
- *Implementation:* `public inline fun check(value: Boolean, lazyMessage:
  () -> Any): Unit` (`kotlin.PreconditionsKt`, part of the Kotlin
  standard library already on this project's classpath since Lesson
  0.1). When `value` is `false`, throws a real `IllegalStateException`
  built from calling `lazyMessage()`; does nothing at all when `value` is
  `true`.
- *Its use:* this lesson uses it to write a real, falsifiable claim
  directly into running code — not a comment, not prose, an actual
  runtime check that throws the instant it's ever wrong.
- *Type:* a top-level, `inline` Kotlin function — `inline` means the
  compiler substitutes its real body at every call site rather than
  generating an actual function call, so `lazyMessage` only ever really
  runs on the failing path.
- *Responsibility:* enforce that a specific condition genuinely holds at
  this exact point in a real running program, failing loudly and
  immediately if it doesn't.
- *Depends on:* a real `Boolean` condition, and a trailing lambda
  computing the failure message — genuinely lazy, per `check`'s own
  design, so it never runs and never allocates its string on the passing
  path.
- *Connects to:* called directly in this lesson's own isolated lab;
  throws a real `IllegalStateException`, an ordinary JVM exception any
  surrounding `try`/`catch` can observe.
- *Shape:* Kotlin standard-library API — the language's own built-in
  mechanism for a runtime precondition, the direct sibling of `require`
  (already established in Lesson 8.6's `Matrix.inverse`), differing only
  in which real exception type it throws.

**`Thread`**
- *What it is:* the real JVM class representing one independent, real
  thread of execution.
- *Implementation:* `java.lang.Thread`. Real declared shape of the two
  members this lesson calls directly:
  ```
  public static native Thread currentThread();
  public static native void sleep(long millis) throws InterruptedException;
  ```
  `currentThread()` returns the real `Thread` object executing the
  calling code right now; `sleep(millis)` genuinely pauses the calling
  thread for at least the given number of real milliseconds. (`Looper`'s
  own `getThread()`, returning the real `Thread` a given `Looper` is
  bound to, is already shown under `Looper`'s own entry above.) Kotlin's
  own interop rules automatically expose any no-argument Java getter like
  `getThread()` as a real property, so `someLooper.thread` and
  `someLooper.getThread()` compile to the identical real call.
- *Its use:* this lesson compares `Thread.currentThread()` against
  `Looper.getMainLooper().thread` to prove, directly, which real thread a
  click handler actually executes on, and separately uses
  `Thread.sleep(500)` to simulate a genuinely slow `onClick`.
- *Type:* `currentThread`/`sleep` are both `public static native` methods
  — `native` means their real implementation is written in the JVM's own
  underlying platform code, not Java or Kotlin, because "which thread is
  running right now" and "genuinely pause a thread" both require reaching
  below the language runtime into the operating system itself.
- *Responsibility:* represents and controls one real, independent unit of
  concurrent execution. This project has depended on `Thread` before
  (Lesson 7.5), but this is the first lesson to compare thread identity
  as the real point of its own investigation.
- *Depends on:* nothing external — both `currentThread()` and `sleep()`
  are static, callable from anywhere.
- *Connects to:* `Thread.currentThread()` is compared against
  `Looper.getMainLooper().thread`, tying this unit's real finding
  directly to Concept Unit 1's own `Looper`; `Thread.sleep` runs inside
  the same real, temporarily-patched `onClick` this unit measures.
- *Shape:* `java.lang.Thread` is core JVM API, sitting underneath both
  Kotlin's coroutine machinery (Lesson 7.5) and Android's own
  `Looper`/`Handler` alike — this lesson is the first to use it to
  directly answer "which thread."

### Everything else in the file, not this lesson's subject but still explained

**`assertTrue`**
- *What it is:* a real JUnit static method asserting a boolean condition
  is true, failing the test immediately if not.
- *Implementation:* `org.junit.Assert`; real declared shape of the two
  overloads this lesson calls:
  ```
  public static void assertTrue(boolean condition);
  public static void assertTrue(String message, boolean condition);
  ```
  the second showing a custom message on failure.
- *Its use:* proves, in Concept Unit 1's own lab, that the real main
  `Looper` starts paused, and, in Concept Unit 2's own investigation,
  that the real measured elapsed time meets the expected minimum.
- *Type:* both are `public static` methods on the real `org.junit.Assert`
  class.
- *Responsibility:* halts a test immediately, with a clear real failure,
  the instant a stated condition is false.
- *Depends on:* a real `Boolean` expression; the message overload also
  depends on a `String` to show on failure.
- *Connects to:* called directly inside this lesson's own test methods; a
  false condition throws a real `AssertionError`, which JUnit's own test
  runner catches and reports as a failed test.
- *Shape:* JUnit's own public assertion API, this project's standard way
  of stating a checked expectation since Lesson 2.2.

**`assertEquals`**
- *What it is:* a real JUnit static method asserting two values are
  equal, failing the test immediately if not.
- *Implementation:* `org.junit.Assert.assertEquals(Object expected,
  Object actual)` — this project already confirmed, via real `javap`
  output in Lesson 2.2, that Kotlin resolves calls like this one to the
  `Object, Object` overload rather than a primitive-specific one, boxing
  both sides rather than implicitly widening them.
- *Its use:* confirms, in Concept Unit 1's own lab, both that nothing has
  run yet (against an empty list) and that all three posted items ran in
  the exact real order posted, and separately confirms `check`'s own real
  thrown message.
- *Type:* a `public static` method, one of the twelve real overloads this
  project already inventoried in Lesson 2.2.
- *Responsibility:* halts a test immediately, showing both the expected
  and actual real values, the instant they're not equal.
- *Depends on:* two real values of matching or comparable type.
- *Connects to:* called directly inside this lesson's own test methods; a
  mismatch throws a real `AssertionError`.
- *Shape:* JUnit's own public assertion API, this project's other
  standard assertion since Lesson 2.2.

**`mutableListOf` / `MutableList.add`**
- *What it is:* `mutableListOf` is a real Kotlin standard-library
  function building an empty, real, growable list; `add` is that list's
  own real method appending one element.
- *Implementation:* real declared shape of both, `kotlin.collections`:
  ```
  public fun <T> mutableListOf(): MutableList<T>
  fun <E> MutableList<E>.add(element: E): Boolean
  ```
  `add` appends to the real end of the list and returns whether the list
  changed.
- *Its use:* this lesson's own lab uses a real `MutableList<String>` as
  the one shared, observable record of which of the three posted lambdas
  actually ran, and in what real order.
- *Type:* `mutableListOf` is a top-level generic function; `add` is a
  real instance method on the `MutableList` interface.
- *Responsibility:* `mutableListOf` builds a real, empty, mutable
  collection; `add` grows it by exactly one real element, in place.
- *Depends on:* `add` depends on a real, already-constructed
  `MutableList` to call it on.
- *Connects to:* three real lambdas, each posted via `Handler.post`, each
  call `order.add(...)` when the `Looper` actually runs them;
  `assertEquals` later reads that same real list back.
- *Shape:* Kotlin standard-library collections API, established since
  Lesson 0.4, reused here as this lab's own simple, observable proof
  mechanism.

**`System.nanoTime()`**
- *What it is:* a real static method returning the current value of a
  high-resolution system timer, in nanoseconds.
- *Implementation:* `public static native long nanoTime()`
  (`java.lang.System`) — already established, in Lesson 9.5, as this
  project's own standard tool for measuring genuinely short, real elapsed
  durations, since it's a dedicated monotonic clock, unaffected by
  wall-clock adjustments.
- *Its use:* this lesson calls it once immediately before and once
  immediately after a real, temporarily-slow `performClick()` call,
  subtracting the two to get a real, measured elapsed duration.
- *Type:* a `public static native` method.
- *Responsibility:* report a real, monotonically increasing timestamp
  precise enough to measure short, real durations.
- *Depends on:* nothing — callable from anywhere, with no setup.
- *Connects to:* the difference between two real calls becomes
  `elapsedMs`, which this lesson's own `assertTrue` then checks against a
  real, expected minimum.
- *Shape:* core JVM API, already this project's own established
  measurement tool since Lesson 9.5.

**`createComposeRule`**
- *What it is:* a real JUnit `TestRule` factory function, setting up a
  real, controllable Compose UI environment for a test to render into.
- *Implementation:* `fun createComposeRule(): ComposeContentTestRule`
  (`androidx.compose.ui.test.junit4`), established since Lesson 1.4.
- *Its use:* Concept Unit 2 uses it, exactly as every prior Compose-UI
  test in this project has, to get a real `composeTestRule` capable of
  hosting and clicking this project's own real `CalculatorScreen`.
- *Type:* a top-level function returning a real, interface-typed
  `ComposeContentTestRule`.
- *Responsibility:* builds and manages the real, simulated Compose
  environment — composition, layout, the real semantics tree — a test
  runs its assertions against.
- *Depends on:* being called from inside a class already running under
  `@RunWith(RobolectricTestRunner::class)`.
- *Connects to:* the returned rule's own `setContent { }` is what
  actually renders `CalculatorScreen` for this unit's real investigation.
- *Shape:* `androidx.compose.ui.test`'s own public testing API, this
  project's standard Compose-testing entry point since Lesson 1.4.

**`onNodeWithTag` / `performClick`**
- *What it is:* `onNodeWithTag` finds a real, rendered UI element by its
  `Modifier.testTag`; `performClick` simulates a real tap on whatever
  element was found.
- *Implementation:* real declared shape of both, `androidx.compose.ui.test`:
  ```
  fun onNodeWithTag(testTag: String): SemanticsNodeInteraction
  fun SemanticsNodeInteraction.performClick(): SemanticsNodeInteraction
  ```
  both established since this project's own real `Modifier.testTag(label)`
  addition to every keypad button.
- *Its use:* this lesson uses `onNodeWithTag("7")` to find the real "7"
  button and `performClick()` to actually trigger its real `onClick`, the
  exact call this unit measures the real duration of.
- *Type:* `onNodeWithTag` is a top-level test function; `performClick` is
  a real extension function on `SemanticsNodeInteraction`.
- *Responsibility:* `onNodeWithTag` locates exactly one real, matching
  node in the current real semantics tree; `performClick` dispatches a
  real, simulated click event to it, synchronously, on the calling
  thread.
- *Depends on:* `onNodeWithTag` depends on a real tag already set (via
  `Modifier.testTag`, Lesson 2.5); `performClick` depends on the node
  `onNodeWithTag` already found.
- *Connects to:* `performClick` is what this unit brackets with two real
  `System.nanoTime()` calls, since it's the exact real call that runs the
  button's real `onClick` lambda synchronously before returning.
- *Shape:* Compose's own public UI-testing API, this project's standard
  way of simulating a real tap since Lesson 1.4.

**`CalculatorTheme` / `CalculatorScreen`**
- *What it is:* `CalculatorTheme` is this project's own real, permanent
  composable wrapping its screens in this project's real Material3 color,
  typography, and shape choices; `CalculatorScreen` is this project's own
  real, permanent composable rendering the full calculator UI, including
  every real keypad button.
- *Implementation:* `@Composable fun CalculatorTheme(content: @Composable
  () -> Unit)` (`Theme.kt`, Lesson 3.1); `@Composable fun
  CalculatorScreen(mode: String = "Basic", calculatorViewModel:
  CalculatorViewModel = viewModel())` (`MainActivity.kt`, established
  since Lesson 1.2, most recently changed in Lesson 7.6).
- *Its use:* Concept Unit 2 renders both, exactly as written, with no
  changes of its own — the whole point is measuring this project's own
  real, already-shipped click handling, not a stand-in for it.
- *Type:* both are real, public `@Composable` functions.
- *Responsibility:* `CalculatorTheme` supplies this project's own real
  design tokens to everything inside it; `CalculatorScreen` owns and
  renders this project's entire real calculator UI, keypad included.
- *Depends on:* `CalculatorTheme` depends on a `content` lambda to wrap;
  `CalculatorScreen` depends on a real or default `CalculatorViewModel`.
- *Connects to:* `composeTestRule.setContent { CalculatorTheme {
  CalculatorScreen() } }` renders the real screen this unit's own
  `onNodeWithTag("7").performClick()` then clicks.
- *Shape:* this project's own real, permanent UI surface — not part of
  any external library, the actual subject this lesson's own
  investigation is run against.

---

## Concept Unit: Nothing Runs Until the Loop Says So

### The Problem

This project's own real `CalculatorButton` wraps every keypad press in
one shared lambda — `haptic.performHapticFeedback(...); onClick()` — and
that `onClick()` ultimately calls
`calculatorViewModel.onButtonClick(label)`, an ordinary Kotlin function
call. Nothing about that call site names a thread, spawns one, or hands
work off anywhere else — it's just a function, called directly, the same
as any ordinary function call in this project. And yet this project's own
persistence layer already proved, for real, that a completely different
piece of this same app — Room's own suspend database queries — genuinely
runs on a separate, named background thread, entirely on its own, with
zero explicit code asking for that. So something real is deciding which
code runs on which thread, and when. What is it, concretely, and what
does it actually control?

Given this project's own already-proven finding — that
`Thread.currentThread().name` inside a `withContext(Dispatchers.IO) { }`
block genuinely differs from the name of the thread that called it — what
would you predict `Thread.currentThread()` returns if read from inside a
button's own `onClick`, the exact place a real tap lands: the same
background thread Room used, a fresh thread made just for this one click,
or the app's own original thread, still around since launch? And if a
real device can only usefully run one thing on one thread at a time, what
happens to a second, unrelated real event — another tap, a screen redraw
— that shows up while the first one is still being handled: does it run
alongside the first, get picked ahead of it as more urgent, or simply not
happen yet?

### Introduce the Concept in Isolation

A real, temporary JUnit test file, `LabLooperTest.kt`, added directly to
this project's own real Gradle module — the only way to reach real,
working `android.os.Looper`/`Handler` classes running under a real,
simulated Android runtime, the same standing adaptation this project
already relies on for any Android-framework-specific construct with no
plain, Android-free `kotlinc` equivalent (already used for Compose
constructs and for coroutine/dispatcher constructs alike): a real,
temporary lab lives directly inside the project's own source tree,
compiled and run for real through the full Gradle/Robolectric toolchain,
then discarded, rather than a standalone file outside the project:

```kotlin
package com.example.calculator

import android.os.Handler
import android.os.Looper
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabLooperTest {

    @Test
    fun postedRunnablesWaitUntilTheLooperIsToldToRunThem() {
        val order = mutableListOf<String>()
        val mainHandler = Handler(Looper.getMainLooper())

        mainHandler.post { order.add("A") }
        mainHandler.post { order.add("B") }
        mainHandler.post { order.add("C") }

        assertTrue(shadowOf(Looper.getMainLooper()).isPaused)
        assertEquals(emptyList<String>(), order)

        shadowOf(Looper.getMainLooper()).idle()

        assertEquals(listOf("A", "B", "C"), order)
    }

    @Test
    fun checkThrowsIllegalStateExceptionWhenItsConditionIsFalse() {
        val thrown = try {
            check(1 > 2) { "one is not greater than two" }
            null
        } catch (e: IllegalStateException) {
            e
        }
        assertEquals("one is not greater than two", thrown?.message)
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabLooperTest"`, saved in full in
`verification/10.1/lab1_output.txt`):

```
BUILD SUCCESSFUL in 4s
Real, saved XML result: tests="2" skipped="0" failures="0" errors="0"
```

This proves two separate real things. First: three real `Runnable`
lambdas were posted, in order, to the real main `Looper`'s own queue —
and `assertTrue(shadowOf(Looper.getMainLooper()).isPaused)` held
immediately afterward, meaning none of them had run yet, even though all
three were already sitting in the real queue; only after the single, real
`shadowOf(Looper.getMainLooper()).idle()` call does
`assertEquals(listOf("A", "B", "C"), order)` hold — all three ran, in the
exact order they were posted, only once the loop was explicitly told to
advance. Second: `check(1 > 2) { "one is not greater than two" }` threw a
real, caught `IllegalStateException` whose real message exactly matches
the trailing lambda's own computed string, proving that lambda is
genuinely lazy — evaluated only on the failing path, not on every call.

### Discard the Throwaway Example

`LabLooperTest.kt` was deleted from the project immediately after this
real run — it never appears in the project again. This real,
single-worker, strictly-serial queue is called a **message loop**, and
Android's own real `Looper` class is a direct, literal implementation of
one, not a metaphor for one.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and literal in
`postedRunnablesWaitUntilTheLooperIsToldToRunThem`:

- `mutableListOf<String>()` — builds a real, empty, growable list;
  `order` is this lab's own shared, observable record of what actually
  ran.
- `Handler(Looper.getMainLooper())` — two real calls in one expression.
  `Looper.getMainLooper()` is a `public static` method call, returning
  the one real `Looper` Android's own runtime already created for this
  simulated app's main thread. `Handler(...)` is a real constructor call,
  binding a brand-new `Handler` instance to that exact `Looper`.
- `mainHandler.post { order.add("A") }` — an instance call on `Handler`,
  passing a real Kotlin lambda as the `Runnable` argument (trailing-lambda
  syntax, already established). This does not run the lambda; per
  `post`'s own real, fetched body, it wraps the lambda in a `Message` and
  pushes it onto `Looper.getMainLooper()`'s own real `MessageQueue`.
  `order.add("A")` inside the lambda is not evaluated yet — it's still
  just a value sitting inside an unrun function.
- `mainHandler.post { order.add("B") }` and `mainHandler.post { order.add
  ("C") }` — the identical real call, twice more, each pushing one more
  real, still-unrun lambda onto the same real queue, immediately after
  the first, preserving real arrival order.
- `shadowOf(Looper.getMainLooper()).isPaused` — `shadowOf` is a real,
  static Robolectric call, returning the real `ShadowLooper` standing
  behind this exact `Looper`; `.isPaused` reads a real, `abstract`
  boolean property on it — Robolectric's own real, controllable stand-in
  for "does this loop run automatically right now."
- `assertTrue(...)` — a real JUnit static call; the real condition it
  checks is `true`, confirmed by the real, executed run above, meaning
  the simulated main `Looper` genuinely starts paused under Robolectric.
- `assertEquals(emptyList<String>(), order)` — `emptyList<String>()` is a
  real Kotlin stdlib call building a genuinely empty, immutable list;
  `assertEquals` is the same real, already-established JUnit static call
  detailed above. This held true — meaning none of the three real, already-posted
  lambdas had run, confirming `isPaused` wasn't just a label with no real
  effect.
- `shadowOf(Looper.getMainLooper()).idle()` — the same real `shadowOf`
  call as above, this time calling `.idle()`, a real, `abstract` `void`
  method — the one real, explicit command that tells this exact `Looper`
  to actually run everything currently sitting in its own queue, in
  order, right now, on the calling thread.
- `assertEquals(listOf("A", "B", "C"), order)` — `listOf(...)` builds a
  real, three-element, immutable list; the real, executed run above
  confirmed this holds — all three real lambdas ran, and in exactly the
  order they were originally posted, only once `.idle()` was called.

And, for `checkThrowsIllegalStateExceptionWhenItsConditionIsFalse`:

- `check(1 > 2) { "one is not greater than two" }` — `1 > 2` is an
  ordinary, already-established Kotlin comparison, evaluating to the real
  Boolean `false`; `check` is the real Kotlin stdlib call detailed above,
  and since its condition is `false`, it throws a real, genuine
  `IllegalStateException`, built by actually calling the trailing lambda.
- `catch (e: IllegalStateException) { e }` — an ordinary, already-
  established Kotlin `try`/`catch`, here catching that exact real
  exception and capturing it as `thrown`.
- `assertEquals("one is not greater than two", thrown?.message)` —
  `thrown?.message` is a real, safe-call property read (`?.`, already
  established as Kotlin's own null-safe alternative to a bare `.` when
  the value on the left might genuinely be `null`) on `Throwable`'s own
  real `message` property; the real, executed run above
  confirmed it exactly equals the lambda's own literal string, proving
  `check`'s message really is computed from that lambda, not some fixed,
  generic text.

### CS Lens

This is the real, general **Producer/Consumer** pattern, narrowed to
exactly one consumer: any number of producers (here, three real `post`
calls) can add work to a shared queue at any time, but the one, single
consumer thread only ever takes and processes one item at a time, in the
order it arrived, never two at once.

```
Also recognized in: a single bank teller serving one waiting customer at
a time regardless of how many are in line; a print spooler running one
job at a time even though several were submitted together; a restaurant
kitchen's one grill station, however many orders are called in; the
browser's own JavaScript event loop, single-threaded for this exact
structural reason
```

### SE Lens

Why does Android hand every app one single-threaded main `Looper` at all,
instead of, say, letting every UI event run concurrently on its own
thread the instant it arrives? The real alternative — a thread per event
— was a genuine, historically-tried design in other UI toolkits, and it
solves this lesson's own "second event has to wait" problem directly,
since nothing would ever have to wait. The real cost it introduces
instead: two threads touching the same mutable UI state at once is a real
data race — one thread mid-way through updating what's on screen while
another reads or changes the same state produces genuinely undefined,
inconsistent results, not just a slow app. A single-threaded `Looper`
makes that entire class of bug structurally impossible for ordinary UI
code, at the real, honest cost this lesson exists to name: exactly one
slow task, anywhere in that one queue, genuinely delays every other task
behind it, with no exception. This project is not yet paying that cost
anywhere real — this project's own real graphing functions,
`sample`/`buildGraphPath`, were already directly, individually measured
completing in well under a millisecond
— but the risk is now real and named, which is the entire point of a
purely diagnostic lesson.

### Commands Needed

None beyond this project's own already-established `./gradlew
:app:testDebugUnitTest`, run above.

### Run It

Shown above — `BUILD SUCCESSFUL`, both real tests passing, full output
saved in `verification/10.1/lab1_output.txt`.

### Connect the Pieces

This unit proved the general mechanism — one real queue, one real worker,
strictly serial — using a hand-posted `Handler`/`Looper` pair with no
connection yet to this project's own real UI. The next unit checks
whether that's actually the same real mechanism this project's own
buttons already depend on, or a separate, unrelated one.

---

## Concept Unit: This Project's Own Tap Already Lives There

### The Problem

The previous unit proved the general mechanism using a hand-built,
throwaway `Handler`/`Looper` pair — nothing from this project's own real
code. Does `CalculatorButton`'s own real, already-shipped `onClick` — the
exact lambda every one of this project's real keypad buttons has called,
unchanged, since it was first extracted into its own shared composable —
actually run through that same real main `Looper`? Nothing so far has
checked; it's been assumed, not proven.

If `Thread.currentThread()`, read from directly inside that real
`onClick`, turns out to equal `Looper.getMainLooper().thread` — the exact
real thread the previous unit's own queue runs on — what would that
prove about every one of this project's sixteen real keypad buttons? And
separately: `Thread.sleep(500)` genuinely, physically pauses whatever
real thread calls it, for at least 500 real milliseconds. If that call
sat inside a button's own `onClick`, and `onClick` really does run
synchronously — on the calling thread, not handed off somewhere else to
run concurrently — what would a real stopwatch, started right before a
real tap and stopped the instant the call that triggered it returns,
actually read?

### Introduce the Concept in Isolation

A real, temporary, two-line patch to `CalculatorButton`'s own real
`onClick`, in `app/src/main/java/com/example/calculator/MainActivity.kt`
— the same kind of real, temporary, reverted probe against already-
shipped project code this curriculum has already relied on before, to
prove a real, structural claim about existing code by directly, briefly
modifying it and observing the real, falsifiable consequence, applied
here to prove thread identity instead:

```kotlin
onClick = {
    check(Thread.currentThread() == Looper.getMainLooper().thread) {
        "onClick ran on ${Thread.currentThread().name}, not the main looper's thread"
    }
    Thread.sleep(500)
    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
    onClick()
},
```

Alongside it, a second real, temporary test file,
`LabBlockingClickTest.kt`, added to this project's own real test source
set:

```kotlin
package com.example.calculator

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performClick
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabBlockingClickTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun performClickDoesNotReturnUntilTheSlowOnClickFinishes() {
        composeTestRule.setContent {
            CalculatorTheme {
                CalculatorScreen()
            }
        }

        val start = System.nanoTime()
        composeTestRule.onNodeWithTag("7").performClick()
        val elapsedMs = (System.nanoTime() - start) / 1_000_000

        assertTrue("elapsedMs=$elapsedMs, expected >= 500", elapsedMs >= 500)
    }
}
```

Real, executed, in two stages, both saved in full in
`verification/10.1/lab2_output.txt`. First, with the assertion
deliberately written as `fail("elapsedMs=$elapsedMs")` to force the real
measured value into the failure output rather than guess it in advance:

```
com.example.calculator.LabBlockingClickTest > performClickDoesNotReturnUntilTheSlowOnClickFinishes FAILED
    java.lang.AssertionError: elapsedMs=584
BUILD FAILED in 8s
```

Second, with the assertion corrected to the real, passing form shown
above (`elapsedMs >= 500`), then the entire project's full real suite run
once more to confirm nothing else regressed with both real, temporary
changes in place — every one of this project's other real, click-driven
tests (`CalculatorScreenTest`, `AccessibilityTest`, `NavigationTest`,
`HapticsTest`, `GraphScreenTest`, and the rest) also passed with the real
`check(...)` active inside every real button's `onClick`, meaning it
never once threw across every real click this project's entire suite
performs.

This proves two separate, real things. First: `performClick()` measured a
real elapsed time of `584` milliseconds around an `onClick` containing a
real `Thread.sleep(500)` — genuinely, measurably at least the full real
sleep duration, not some smaller number a fire-and-forget dispatch would
have produced. Second: the real `check(...)` guarding
`Thread.currentThread() == Looper.getMainLooper().thread` never threw,
across this project's entire real, existing test suite — meaning every
real click this project's tests perform, on every real button, genuinely
does run on the exact same real thread Concept Unit 1's own `Looper`
belongs to.

### Discard the Throwaway Example

Both real changes were reverted immediately after this real run:
`LabBlockingClickTest.kt` was deleted, and `CalculatorButton`'s own real
`onClick` was restored to its exact prior state — no `check`, no
`Thread.sleep`, no new import — confirmed by a full, clean, real
`./gradlew testDebugUnitTest assembleDebug` run afterward, `95` tests
passing, `0` failures, matching this project's own already-established
count exactly. Neither change appears in the project again. This is
called **synchronous execution** — running a block of code directly, on
the calling thread, not returning control to the caller until that block
finishes — as opposed to handing it off to run concurrently somewhere
else.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator in
the real, temporary `onClick` patch:

- `Thread.currentThread()` — a `public static native` call, returning the
  real `Thread` object executing this exact line right now.
- `Looper.getMainLooper()` — the same real, static call from Concept Unit
  1, returning the one real `Looper` bound to this app's main thread.
- `.thread` — a real property read on that `Looper`, compiling to a call
  to its real `getThread()` getter (Kotlin's automatic Java-getter
  interop), returning the real `Thread` that specific `Looper` runs on.
- `==` — Kotlin's structural equality operator, already established;
  here comparing two real `Thread` object references for equality.
- `check(...) { ... }` — the real Kotlin stdlib call from Concept Unit 1,
  guarding the comparison above; the real, executed run confirmed it
  never threw, meaning the comparison was true on every real click this
  patch was active for.
- `Thread.sleep(500)` — a real, static call, genuinely pausing whatever
  real thread reaches this line for at least 500 real milliseconds before
  the next line runs.
- `haptic.performHapticFeedback(HapticFeedbackType.LongPress)` and
  `onClick()` — this project's own already-established real haptic call,
  dispatching a real vibration effect through Compose's own
  `LocalHapticFeedback`, and the passed-in click lambda that ultimately
  reaches `CalculatorViewModel.onButtonClick`, both unchanged, both now
  running only after the real sleep above completes.

And, in `LabBlockingClickTest.kt`'s own single test:

- `createComposeRule()` — the same real, established call already
  detailed above, returning a real `ComposeContentTestRule`.
- `composeTestRule.setContent { CalculatorTheme { CalculatorScreen() } }`
  — the same real, established call, this time rendering this project's
  own real, unmodified screen composables (aside from the one temporary
  `onClick` patch above), not a substitute.
- `System.nanoTime()` — the same real, static call already detailed
  above, capturing a real, high-resolution timestamp into `start`.
- `composeTestRule.onNodeWithTag("7").performClick()` — the same two
  real, established calls; `onNodeWithTag("7")` finds this project's own
  real "7" button, and `performClick()` dispatches a real, synchronous
  click to it — this is the exact real call that runs the patched
  `onClick` above, sleep included, before returning control here.
- `System.nanoTime() - start` — real subtraction between two real
  timestamps, giving the real elapsed nanoseconds `performClick()` itself
  took to return.
- `/ 1_000_000` — real integer division converting real nanoseconds into
  real, whole milliseconds, stored in `elapsedMs`.
- `assertTrue("elapsedMs=$elapsedMs, expected >= 500", elapsedMs >= 500)`
  — the same real, established JUnit call, checking the real measured
  value against the real, expected minimum; the real, executed run
  confirmed this held, at a real measured `584` milliseconds.

### CS Lens

This is **synchronous execution**, named above: `performClick()` does not
return until the entire real `onClick` block it triggers — sleep
included — has finished running, on the same real thread, in the same
real call stack.

```
Also recognized in: a regular function call in any language, which
always waits for the callee to return before the next line runs; a
database library's own blocking `query()` call, which doesn't return
until the real query finishes; a synchronous HTTP client call, which
holds the calling thread until a real response arrives — as opposed to
this project's own real, coroutine-based persistence save, launched
inside `viewModelScope`, which deliberately does not wait
```

### SE Lens

Given Concept Unit 1 already proved the general mechanism — nothing on a
`Looper`'s queue runs until the current task finishes and the loop
advances — and this unit just proved `onClick` genuinely runs
synchronously on that exact real thread, the two real, separately-proven
facts combine into the real, whole finding this lesson exists to
establish: a slow `onClick`, anywhere in this project, doesn't just delay
its own button — it blocks literally every other task waiting on that
same real queue, for its entire real duration, including the next
button's own click, the next screen redraw, and any in-flight animation
frame, none of which are special-cased or prioritized ahead of it. The
real, honest limit on this lesson's own evidence: Robolectric can prove
`onClick` blocks the calling thread for a real, measured duration, and
this project's existing tests already proved that same thread is the
real main `Looper`'s thread — but it cannot simulate a real device
actually freezing on screen, the same already-established limitation this
project has documented before: Robolectric can prove a `Canvas` composes,
lays out, and receives real gesture input correctly, but code inside a
real `DrawScope` draw lambda has already been shown, directly, not to
observably execute under this project's own Robolectric setup — real
drawn pixels and real animation timing stay unverifiable here the same
way. For that, Android's own real, official documentation
(`developer.android.com/topic/performance/vitals/anr`, fetched this
session) names the real, concrete consequence directly: *"When the UI
thread of an Android app is blocked for too long, an 'Application Not
Responding' (ANR) error is triggered,"* specifically when *"your app has
not responded to an input event (such as a key press or screen touch)
within 5 seconds"* — a real, official, fixed threshold, not a
hypothetical one. This project's own real `sample`/`buildGraphPath`
functions are nowhere near that threshold today — already, directly
measured at comfortably sub-millisecond, warmed-up and averaged over many
real repetitions — which is exactly why this lesson is purely
diagnostic — the real risk is proven and named, not yet triggered by any
of this project's own real, current code.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest assembleDebug`, run above.

### Run It

Shown above — the real, forced failure reporting the exact measured
`elapsedMs=584`, then the real, corrected, passing run, then a final,
real, clean `./gradlew testDebugUnitTest assembleDebug` confirming this
project's exact prior state — `95` tests, `0` failures — once both
temporary changes were reverted. Full output saved in
`verification/10.1/lab2_output.txt`.

### Connect the Pieces

Concept Unit 1 proved Android's own real main `Looper` runs one task at a
time, strictly in the order posted, and does nothing else while one is
running. This unit proved `CalculatorButton`'s own real `onClick` — the
exact lambda every real keypad button in this project already calls —
runs synchronously on that exact same real thread, and measured, for
real, that a slow one genuinely blocks for its entire duration. Together,
these are the real, proven reason Slice 10 exists: nothing about this
project's own real code currently does anything slow enough to trigger
it, but the mechanism that would freeze the whole screen if it ever did
is now real, named, and measured — not assumed.

---

## Connect the Pieces

A single, concrete real value traced through both units: the literal `"7"`
button, this project's own oldest, already-familiar proof of real,
working digit entry. Concept Unit 1 proved, with a hand-built
`Handler`/`Looper` pair having nothing to
do with any button, that three posted tasks — call them `A`, `B`, `C` —
only ever ran once, in that exact order, only after the loop was told to
advance; nothing ran early, and nothing ran out of order. Concept Unit 2
then proved the "7" button's own real `onClick` is not a separate,
special mechanism — it is itself just one more task on that identical
real queue, run synchronously, on the identical real thread, measured at
a real `584` milliseconds when deliberately slowed down by `500`. Put
together: if pressing "7" ever became this project's own slow task — the
same real role `A` played in Concept Unit 1's own lab — every other real
task already known to share that same real queue (another button's own
tap, the next screen redraw, an in-flight animation) would wait behind it
exactly as `B` and `C` did, for the identical structural reason, and, past
Android's own real, official five-second threshold, the OS itself would
show the user a real ANR dialog. This project's own real code is nowhere
near that today — proven, not assumed, by this project's own real,
already-measured, warmed-up, sub-millisecond graphing performance numbers
— which is exactly why the lessons that follow this one can now build
their real fix against a real, named, understood risk instead of a vague
one.

**Next:** Lesson 10.2 (Coroutines Deep Dive).
