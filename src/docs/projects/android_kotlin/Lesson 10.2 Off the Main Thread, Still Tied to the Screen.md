# Lesson 10.2: Off the Main Thread, Still Tied to the Screen

**What you will build.** This project's own real `GraphScreen` — until now,
the one place in this project where Lesson 10.1 proved the exact real
risk it named could actually bite: `sample`'s own real computation, run
synchronously, directly inside a `remember` block on the real main thread
— gets a real, permanent fix. `GraphScreen` now launches that same real
computation on a thread pool genuinely sized for CPU-bound work, and does
it through a real Compose mechanism that automatically cancels the work
the instant the screen itself is gone, so a slow calculation can never
outlive the screen that asked for it.

**What you need to know first:**
- Lesson 10.1 (The Queue Every Tap Waits In) — the real, proven finding
  this lesson exists to act on: Android's real main thread runs one task
  at a time, strictly serially, and any code running directly inside a
  composable's own body — `remember` blocks included — runs synchronously
  on that exact thread.
- Lesson 7.5 (Waiting Without Blocking) — `suspend`, `Dispatchers.IO`, a
  real, hand-built `CoroutineScope`'s own cancellation behavior, and
  `viewModelScope.launch { }`, this project's first real use of a
  coroutine.
- Lesson 9.2 (The Same Expression, Many Answers) — `sample`, `Point`,
  `evaluateAt`, this project's own real sampling pipeline.
- Lesson 9.3 (What the Canvas Won't Show You) and Lesson 9.4 (What the
  Fingers Can Prove) — `GraphScreen`'s own real, current body, including
  `buildGraphPath`, `toScreenPoints`, and `GraphTransform`.
- Lesson 1.4 (A Value That Survives Its Own Rebuild) — `remember`, and a
  composable's own real lifetime (composition/recomposition/leaving
  composition).

No pipeline diagram — this lesson touches this project's own expression
pipeline only through its already-established final stage (`evaluateAt`),
not by adding a new stage to it.

## Terms used in this lesson

- **`suspend`** — a real Kotlin modifier marking a function that can pause
  its own execution and resume later, without blocking the real thread it
  started on. This project's own real, compiled proof (Lesson 7.5) showed
  calling a `suspend` function outside a coroutine is a genuine compile
  error, not a convention — the compiler transforms every `suspend`
  function into an ordinary JVM method taking one extra, real, hidden
  parameter (confirmed again this session via `javap` against this
  project's own real `kotlinx-coroutines-core` jar): a `Continuation`,
  the real, compiled mechanism that lets execution actually pause and
  later resume.
- **`@RunWith(RobolectricTestRunner::class)`** and **`@Config(sdk =
  [34])`** — the same real, established annotations from every prior
  Robolectric-based lesson in this project: the first hands a test class
  to Robolectric's own real test runner instead of running it directly;
  the second pins the simulated Android SDK version to this project's own
  real `compileSdk`/`targetSdk`, `34`.

## Objects and methods used

**`Dispatchers.Default`**
- *What it is:* the real, default `CoroutineDispatcher` Kotlin's coroutine
  library provides specifically for CPU-bound work — computation that
  keeps a thread genuinely busy the whole time, never just waiting.
- *Implementation:* `public static final CoroutineDispatcher getDefault()`
  (`kotlinx.coroutines.Dispatchers`, compiled from the real Kotlin
  property `val Default: CoroutineDispatcher`). Its own real, official
  documentation (`kotlinlang.org/api/kotlinx.coroutines`, fetched this
  session) states: *"the maximum number of threads used by this
  dispatcher is equal to the number of CPU cores, but is at least two."*
  This machine's own real core count, confirmed via
  `Runtime.getRuntime().availableProcessors()`: `10`.
- *Its use:* this lesson uses it as the real dispatcher for `GraphScreen`'s
  own real, CPU-bound sampling work, and as one of two real dispatchers
  this lesson's own isolated lab directly compares.
- *Type:* a `public static final` (Kotlin: `val`) property, returning a
  real, shared, singleton `CoroutineDispatcher` instance.
- *Responsibility:* runs real, submitted coroutine work on a thread pool
  deliberately capped near this machine's own real CPU core count, so CPU-
  bound work never oversubscribes the real cores actually available to
  compute it.
- *Depends on:* nothing from calling code — it's a fixed, shared,
  already-configured singleton.
- *Connects to:* passed as the real dispatcher argument to `launch`/
  `withContext`; real, submitted work runs on one of its own real,
  bounded pool of threads.
- *Shape:* a real, public part of `kotlinx.coroutines`'s own dispatcher
  API surface — this project's second real dispatcher choice, after
  `Dispatchers.IO`.

**`Dispatchers.IO`**
- *What it is:* the real `CoroutineDispatcher` Kotlin's coroutine library
  provides for blocking I/O work — work that spends most of its real time
  waiting on something outside the CPU (a disk, a database, a network
  call), not computing.
- *Implementation:* `public static final CoroutineDispatcher getIO()`
  (`kotlinx.coroutines.Dispatchers`). Its own real, official documentation
  (fetched this session) states: *"The number of threads doing IO work in
  parallel is limited by the value of `kotlinx.coroutines.io.parallelism`
  ... It defaults to the limit of 64 threads or the number of cores
  (whichever is larger)."*
- *Its use:* this project's own first real dispatcher choice (Lesson
  7.5, for Room's own suspend database queries); this lesson's own
  isolated lab uses it as the real point of contrast against
  `Dispatchers.Default`.
- *Type:* a `public static final` (Kotlin: `val`) property, returning a
  real, shared, singleton `CoroutineDispatcher` instance — a genuinely
  different real instance from `Dispatchers.Default`.
- *Responsibility:* runs real, submitted coroutine work on a thread pool
  that grows elastically, well past the real CPU core count, since
  blocking-and-waiting threads don't compete for real CPU time the way
  actively-computing ones do.
- *Depends on:* nothing from calling code — also a fixed, shared,
  already-configured singleton.
- *Connects to:* already this project's own real dispatcher for
  `CalculationDao`'s suspend queries (Lesson 7.5); this lesson adds no
  new real use of it, only contrasts it against `Dispatchers.Default`.
- *Shape:* a real, public part of `kotlinx.coroutines`'s own dispatcher
  API surface, already load-bearing in this project before this lesson.

**`CoroutineDispatcher`**
- *What it is:* the real, abstract Kotlin type both `Dispatchers.Default`
  and `Dispatchers.IO` are instances of — a real, pluggable strategy for
  which thread (or pool of threads) a coroutine's own code actually runs
  on.
- *Implementation:* `kotlinx.coroutines.CoroutineDispatcher`, an abstract
  class implementing `kotlin.coroutines.ContinuationInterceptor`; this
  lesson's own isolated lab declares a function parameter of exactly this
  type (`dispatcher: CoroutineDispatcher`) so one real function can be
  called with either real dispatcher interchangeably.
- *Its use:* names the real, common supertype that makes "pass in
  whichever dispatcher you want to compare" possible in this lesson's own
  lab function.
- *Type:* a real, public abstract class.
- *Responsibility:* decides, for every coroutine submitted to it, which
  real thread actually executes the next piece of that coroutine's code.
- *Depends on:* nothing on its own — concrete real dispatchers like
  `Dispatchers.Default`/`Dispatchers.IO` supply the actual thread-pool
  behavior.
- *Connects to:* accepted by `launch`/`withContext` as the real, explicit
  choice of where submitted code should run.
- *Shape:* `kotlinx.coroutines`'s own public supertype, unifying every
  concrete dispatcher this project uses or could use under one real type.

**`runBlocking`**
- *What it is:* a real coroutine builder that runs a real suspending block
  to completion, blocking the real calling thread until it finishes.
- *Implementation:* `public static final <T> T runBlocking(CoroutineContext
  context, Function2<CoroutineScope, Continuation<T>, Object> block)`
  (`kotlinx.coroutines.BuildersKt`, compiled from the real Kotlin
  signature `fun <T> runBlocking(context: CoroutineContext =
  EmptyCoroutineContext, block: suspend CoroutineScope.() -> T): T`).
- *Its use:* this lesson's own isolated lab is a plain `fun main()`, not
  itself a coroutine — `runBlocking` is the real, deliberate bridge from
  ordinary, non-suspending code into a real coroutine scope, so `launch`
  can be called at all.
- *Type:* a real, public top-level function, generic over its own real
  return type `T`.
- *Responsibility:* creates a real coroutine, runs it to completion, and
  genuinely blocks the calling thread the entire time — the one real
  coroutine builder deliberately meant to be blocking, unlike every other
  builder this project uses.
- *Depends on:* a real suspending lambda to run as its own body.
- *Connects to:* this lesson's lab calls `launch` from directly inside
  its own block, using the real `CoroutineScope` it's handed.
- *Shape:* `kotlinx.coroutines`'s own public entry point for bridging
  ordinary blocking code into coroutines — used here only because this
  lab's own `fun main()` has no coroutine scope of its own to start from.

**`launch`**
- *What it is:* a real coroutine builder that starts a new, real coroutine
  without waiting for it to finish, returning a real handle to it.
- *Implementation:* `CoroutineScope.launch(context: CoroutineContext =
  EmptyCoroutineContext, block: suspend CoroutineScope.() -> Unit): Job`
  — a real extension function on `CoroutineScope`, reappearing here with
  a real, explicit `dispatcher` argument passed as its `context`
  parameter, unlike this project's own prior use
  (`viewModelScope.launch { }`, Lesson 7.5, which never passed one).
- *Its use:* this lesson's own lab calls `launch(dispatcher)` fifty real
  times per dispatcher under test, each one a genuinely separate,
  concurrently-running real coroutine.
- *Type:* a real, public extension function on `CoroutineScope`.
- *Responsibility:* starts real, independent work without making the
  caller wait for it, and hands back a real `Job` the caller can use to
  wait for it later if it chooses to.
- *Depends on:* a real `CoroutineScope` to be called on (here,
  `runBlocking`'s own implicit scope) and, per this lesson's own real
  usage, an explicit `CoroutineDispatcher` naming which real thread pool
  to run on.
- *Connects to:* returns a real `Job`; this lesson's lab collects fifty of
  them into a real list and calls `.join()` on each.
- *Shape:* `kotlinx.coroutines`'s own public coroutine-builder API,
  already load-bearing in this project (Lesson 7.5) before this lesson.

**`Job.join()`**
- *What it is:* a real, suspending method that waits for one specific
  coroutine to finish, without blocking the real thread it's called from.
- *Implementation:* `public abstract Object join(Continuation<? super
  Unit>)` (`kotlinx.coroutines.Job`), compiled from the real Kotlin
  signature `suspend fun join()` — the same real, compiler-added
  `Continuation` parameter `suspend` itself already introduced above,
  confirmed again here via `javap` against this project's own real,
  installed `kotlinx-coroutines-core` jar.
- *Its use:* this lesson's lab calls `.join()` on every one of the fifty
  real `Job`s `launch` returned, ensuring every real coroutine has
  genuinely finished — including having recorded its own real thread's
  name — before the lab checks how many distinct real threads were used.
- *Type:* a real, `suspend` instance method on the `Job` interface.
- *Responsibility:* suspends the calling coroutine until this specific
  other real coroutine reaches real completion, one at a time.
- *Depends on:* the real `Job` instance it's called on.
- *Connects to:* called once per real `Job` `launch` returned, inside a
  real `forEach` loop; being a `suspend` function, it can only be called
  from inside `runBlocking`'s own real coroutine body.
- *Shape:* `kotlinx.coroutines`'s own public `Job` API — this project's
  first real use of `.join()` specifically, though `Job`-cancellation
  itself already appeared once before (Lesson 7.5's own structured-
  concurrency lab).

**`LaunchedEffect`**
- *What it is:* the real, official Compose API for launching a coroutine
  whose entire lifetime is automatically tied to one specific
  composable's own presence in composition.
- *Implementation:* real declared shape of the overload this lesson
  calls, confirmed from the real, fetched source
  (`android.googlesource.com/platform/frameworks/support`,
  `compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/Effects.kt`, branch
  `refs/heads/androidx-main`, fetched this session):
  ```
  @Composable
  fun LaunchedEffect(key1: Any?, block: suspend CoroutineScope.() -> Unit)
  ```
  Its own real, fetched KDoc states plainly: *"When LaunchedEffect enters
  the composition it will launch \[block\] into the composition's
  CoroutineContext. The coroutine will be cancelled and re-launched when
  LaunchedEffect is recomposed with a different \[key1\]. The coroutine
  will be cancelled when the LaunchedEffect leaves the composition."* Its
  real, internal implementation (`LaunchedEffectImpl`, same file) confirms
  this isn't just documentation: `onRemembered()` calls the real,
  already-established `scope.launch(block = task)`; `onForgotten()` calls
  `job?.cancel(ExitedCompositionCancellationException())` — a real,
  specifically-named exception type, not a generic one.
- *Its use:* this lesson uses it to launch `GraphScreen`'s own real
  sampling work exactly once, tied to `GraphScreen`'s own presence on
  screen, in place of the old synchronous call inside `remember`.
- *Type:* a real, public `@Composable` function.
- *Responsibility:* owns the full real lifecycle of one coroutine — start
  it when its host composable is first remembered, cancel and restart it
  if its own key changes, cancel it for good the instant its host
  composable leaves composition — so nothing else has to.
- *Depends on:* a real `key1` (governing when it restarts) and a real
  `suspend` lambda to run.
- *Connects to:* internally built on the same real `remember` mechanism
  already established (Lesson 1.4) and the same real `launch`/`Job`
  machinery detailed above; its own cancellation reaches into whatever
  real coroutine work is running inside it, including a nested
  `withContext` call.
- *Shape:* `androidx.compose.runtime`'s own public API — this project's
  first real use of it, replacing what a hand-built `CoroutineScope`
  would otherwise have needed to manage by hand.

**`withContext`**
- *What it is:* a real, suspending function that runs a block of code
  using a different real coroutine context — most commonly, a different
  real dispatcher — then returns to the original context automatically
  once that block finishes.
- *Implementation:* real Kotlin signature `suspend fun <T>
  withContext(context: CoroutineContext, block: suspend
  CoroutineScope.() -> T): T` (`kotlinx.coroutines`), reappearing from
  Lesson 7.5's own lab, which proved its real thread-switching mechanism
  by comparing `Thread.currentThread().name` inside and outside a
  `withContext(Dispatchers.IO) { }` block.
- *Its use:* this lesson wraps `sample`'s own real call in
  `withContext(Dispatchers.Default) { }`, moving that one real,
  CPU-bound computation onto `Dispatchers.Default`'s own real thread
  pool, then returns its real result back to `LaunchedEffect`'s own
  calling context automatically.
- *Type:* a real, public, top-level `suspend` function, generic over its
  own real return type `T`.
- *Responsibility:* temporarily switches which real thread runs the given
  block, and switches back automatically the instant that block returns
  — the caller never has to manage that switch-back by hand.
- *Depends on:* a real `CoroutineDispatcher` (or other `CoroutineContext`)
  naming where the block should run, and a real block to run there.
- *Connects to:* called here from inside `LaunchedEffect`'s own real
  coroutine body; its own real return value (`sample`'s own real
  `List<Point>`) is assigned directly to `GraphScreen`'s own real
  `points` state the instant it resumes.
- *Shape:* `kotlinx.coroutines`'s own public API, already load-bearing in
  this project (Lesson 7.5) before this lesson.

**`Point`**
- *What it is:* this project's own real, permanent data class representing
  one real Cartesian coordinate — an `(x, y)` pair, both real `Double`s.
- *Implementation:* `data class Point(val x: Double, val y: Double)`
  (`Graphing.kt`, established in Lesson 9.2).
- *Its use:* this lesson's own real change makes `GraphScreen`'s own
  `points` a real, mutable Compose state holding a `List<Point>`, instead
  of a fixed value computed once and never reassigned.
- *Type:* a real, permanent, immutable data class.
- *Responsibility:* holds exactly one real sampled coordinate — nothing
  about threading, drawing, or screen coordinates.
- *Depends on:* nothing — two plain `Double` values.
- *Connects to:* produced, many at a time, by `sample`; consumed by
  `toScreenPoints`/`buildGraphPath`, both already established (Lesson
  9.1/9.3) and unchanged by this lesson.
- *Shape:* this project's own real, permanent domain type, reappearing
  here only because it's the real element type of the state this lesson's
  own change makes asynchronous.

### Everything else in the file, not this lesson's subject but still explained

**`ConcurrentHashMap.newKeySet()`**
- *What it is:* a real, static JDK method building an empty, thread-safe
  set — safe to have many real threads add to at once, with no explicit
  locking required from calling code.
- *Implementation:* `public static <K> KeySetView<K, Boolean>
  newKeySet()` (`java.util.concurrent.ConcurrentHashMap`), confirmed via
  real `javap` output against the actual installed JDK this session.
- *Its use:* this lesson's own lab uses one to safely collect every real
  thread name fifty concurrently-running real coroutines each report,
  with no real risk of a lost update from two threads writing at once.
- *Type:* a real, `public static` generic method.
- *Responsibility:* provide a real `Set` that many real threads can
  safely mutate concurrently, backed internally by the same real,
  already-thread-safe `ConcurrentHashMap`.
- *Depends on:* nothing — called with no arguments here.
- *Connects to:* each of this lab's fifty real coroutines calls
  `.add(...)` on the same real, shared set; the lab reads its final real
  `.size` once every coroutine has finished.
- *Shape:* core JVM concurrency API — a real, well-known way to make
  "many threads write, nothing reads until they're done" safe without
  hand-written synchronization.

**`Runtime.getRuntime().availableProcessors()`**
- *What it is:* `getRuntime()` returns the real JVM's own singleton
  `Runtime` object; `availableProcessors()` reports the real number of
  CPU cores that JVM currently has available.
- *Implementation:* `public static Runtime getRuntime()` and `public
  native int availableProcessors()` (`java.lang.Runtime`), both confirmed
  via real `javap` output this session; `native` means its real answer
  comes from the underlying operating system, not from Java code.
- *Its use:* this lesson's lab prints this real value directly, so
  `Dispatchers.Default`'s own measured thread count can be checked
  against this exact machine's own real core count, not an assumed one.
- *Type:* `getRuntime()` is `public static`; `availableProcessors()` is a
  real, `native` instance method called on the object it returns.
- *Responsibility:* reports a real, current fact about the actual machine
  the JVM is running on.
- *Depends on:* nothing — reads real, live information from the
  underlying OS.
- *Connects to:* its own real, printed value (`10`, on this machine) is
  compared directly, by eye, against `Dispatchers.Default`'s own real
  measured thread count in this lesson's own Run It output.
- *Shape:* core JVM platform-introspection API, used here once, as a
  real, independent check on this lesson's own central claim.

**`remember` / `mutableStateOf` / `by`**
- *What it is:* `remember` preserves a real value across a composable's
  own recompositions; `mutableStateOf` builds a real, observable
  container Compose watches for changes; `by` is Kotlin's real property-
  delegate syntax, already established, letting code read and write that
  container's own `.value` as if it were a plain variable.
- *Implementation:* `@Composable fun <T> remember(calculation: () -> T):
  T` and `fun <T> mutableStateOf(value: T): MutableState<T>`
  (`androidx.compose.runtime`), both established since Lesson 1.4/1.6;
  `by` resolves to `MutableState<T>`'s own real `getValue`/`setValue`
  operator functions, also already established.
- *Its use:* `GraphScreen`'s own real `points` is now `var points by
  remember { mutableStateOf<List<Point>>(emptyList()) }` — a real,
  observable, reassignable piece of state, replacing the old, fixed `val
  points = remember { sample(...) }`.
- *Type:* `remember` is a real `@Composable` function; `mutableStateOf` is
  a real top-level function; `by` is Kotlin language syntax, not a
  function call itself.
- *Responsibility:* together, they give `GraphScreen` one real, named
  piece of mutable state that survives recomposition and triggers a real
  redraw the instant it's reassigned.
- *Depends on:* `remember` depends on a lambda producing the initial real
  value; `mutableStateOf` depends on that initial value itself.
- *Connects to:* reassigned once, inside this lesson's own `LaunchedEffect`
  block, the instant `withContext`'s own real result comes back; read
  directly inside `GraphScreen`'s own `Canvas` block, unchanged.
- *Shape:* Compose's own core state API, already this project's single
  most-reused mechanism since Lesson 1.4.

**`TestNavHostController` / `ComposeNavigator` / `NavHost` / `composable`**
- *What it is:* a real, test-only `NavHostController` implementation;
  `ComposeNavigator` is the real navigator it needs registered by hand to
  work outside a live app; `NavHost`/`composable` build a real navigation
  graph mapping route names to composables.
- *Implementation:* `TestNavHostController(context: Context)`
  (`androidx.navigation.testing`); `ComposeNavigator()`
  (`androidx.navigation.compose`); `@Composable fun NavHost(...)` and
  `fun NavGraphBuilder.composable(route: String, ...)`
  (`androidx.navigation.compose`) — all four already established in
  Lesson 4.1.
- *Its use:* this lesson's own isolated `LaunchedEffect` lab builds a
  tiny, two-route real navigation graph so it can prove a coroutine really
  does get cancelled when its own route is navigated away from.
- *Type:* `TestNavHostController`/`ComposeNavigator` are real classes;
  `NavHost` is a real `@Composable` function; `composable` is a real
  extension function on `NavGraphBuilder`.
- *Responsibility:* together, let test code build and drive a real,
  working navigation graph without a live Android app around it.
- *Depends on:* `TestNavHostController` depends on a real `Context`
  (`ApplicationProvider.getApplicationContext()`, already established);
  it depends on having a real `ComposeNavigator` registered before use.
- *Connects to:* this lab's own `navController.navigate("b")`/
  `.popBackStack()` calls drive this exact real graph, moving a
  `LaunchedEffect`-holding composable in and out of composition on
  command.
- *Shape:* Jetpack Navigation's own real, public testing API, already
  established in this project (Lesson 4.1) — reused here as this lesson's
  own tool, not its subject.

**`createComposeRule` / `waitForIdle`**
- *What it is:* `createComposeRule` builds a real, controllable Compose
  test environment; `waitForIdle` blocks until every real pending
  composition, recomposition, and animation-clock task has finished.
- *Implementation:* `fun createComposeRule(): ComposeContentTestRule` and
  `ComposeTestRule.waitForIdle(): Unit` (`androidx.compose.ui.test`),
  both already established (Lesson 1.4; `waitForIdle` specifically
  already used in Lesson 4.1's own navigation tests).
- *Its use:* this lesson's own lab calls `waitForIdle()` after every real
  navigation step, ensuring `LaunchedEffect`'s own real
  `onRemembered`/`onForgotten` hooks have actually run before checking
  the lab's own real flags.
- *Type:* `createComposeRule` is a top-level function; `waitForIdle` is a
  real instance method on the rule it returns.
- *Responsibility:* `createComposeRule` sets up the real environment;
  `waitForIdle` guarantees real, pending Compose work has actually
  finished before the next line of test code runs.
- *Depends on:* `waitForIdle` depends on a real, already-built
  `composeTestRule`.
- *Connects to:* every real assertion in this lesson's own lab happens
  only after a `waitForIdle()` call, never before one.
- *Shape:* Compose's own public UI-testing API, already this project's
  standard tool since Lesson 1.4.

**`assertTrue` / `assertFalse`**
- *What it is:* real JUnit static methods asserting a boolean condition
  is true or false, respectively, failing the test immediately otherwise.
- *Implementation:* `org.junit.Assert.assertTrue(boolean)` and
  `org.junit.Assert.assertFalse(boolean)` — `assertTrue` already fully
  detailed in Lesson 10.1; `assertFalse` is its exact real mirror,
  passing when its own condition is `false` instead.
- *Its use:* this lesson's lab uses `assertTrue` to confirm a
  `LaunchedEffect` that stayed on screen really did complete, and
  `assertFalse` to confirm one whose screen left really never did.
- *Type:* both are `public static` methods on `org.junit.Assert`.
- *Responsibility:* halt a test immediately, with a clear real failure,
  the instant the stated condition doesn't hold.
- *Depends on:* a real `Boolean` expression each.
- *Connects to:* called directly inside this lesson's own two lab tests,
  on the two real, package-level flags those tests each set.
- *Shape:* JUnit's own public assertion API, already this project's
  standard tool since Lesson 2.2.

**`GraphScreen`**
- *What it is:* this project's own real, permanent composable rendering
  the interactive graph — this lesson's own real subject, not supporting
  cast, but placed here since its own full body is quoted and walked
  through in Concept Unit 2 below, not introduced fresh here.
- *Implementation:* `@Composable fun GraphScreen()` (`MainActivity.kt`,
  established Lesson 9.3, extended Lesson 9.4).
- *Its use:* the one real composable this lesson's own production change
  modifies.
- *Type:* a real, public `@Composable` function, taking no parameters.
- *Responsibility:* owns this project's entire real graphing screen — the
  expression tree, the sampled points, the pan/zoom transform, and the
  real `Canvas` drawing all of it.
- *Depends on:* (as of this lesson) `Dispatchers.Default`, `LaunchedEffect`,
  and `withContext`, in addition to everything it already depended on.
- *Connects to:* reached via `CalculatorApp`'s own real `"graph"` route
  (Lesson 4.1); calls `sample`/`evaluateAt` (Lesson 9.2),
  `toScreenPoints`/`buildGraphPath` (Lesson 9.3), `applyGesture` (Lesson
  9.4).
- *Shape:* this project's own real, permanent UI surface — the actual
  subject of this lesson's own real change, detailed in full below.

---

## Concept Unit: Not Every Slow Task Wants the Same Pool

### The Problem

The previous lesson proved blocking the real main thread freezes the
whole screen, and named the real fix this project has already used once:
run slow work on a different real thread instead, through a coroutine.
This project's own one real precedent for that, Room's own suspend
database queries, always used exactly one dispatcher —
`Dispatchers.IO`. But `GraphScreen`'s own real, current bottleneck is a
completely different kind of slow: `sample`'s own real work is pure
computation — evaluating a real expression tree, over and over, a fixed
number of times — never waiting on a disk, a network call, or a database
at all. Is a thread pool built for "wait on something outside the CPU"
work actually the right real choice for work that's the opposite of
that — work that keeps a real CPU core genuinely busy the whole time?

Given a real machine only has a fixed, real number of CPU cores able to
actually compute anything at once, would handing genuinely CPU-bound work
to a pool sized for dozens of mostly-waiting I/O threads help it finish
any faster, or would every one of those threads just be competing for
the same small number of real cores regardless of how many exist? And if
Kotlin's own coroutine library is aware of this real distinction, what
would you expect its own second, real dispatcher — one built specifically
for CPU-bound work — to actually be sized to, if not the number of
threads at all?

### Introduce the Concept in Isolation

A real, temporary, plain `fun main()` — no Android, no Gradle project,
the same standalone `kotlinc` verification this project has used since
Stage 0 for any concept that doesn't actually need Android to prove,
since `Dispatchers`/`launch`/`runBlocking` are all plain
`kotlinx-coroutines-core` — already this project's own real,
already-resolved dependency:

```kotlin
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.util.concurrent.ConcurrentHashMap

fun distinctRealThreadsUsedBy(dispatcher: CoroutineDispatcher, taskCount: Int): Int {
    val threadNames = ConcurrentHashMap.newKeySet<String>()
    runBlocking {
        val jobs = (1..taskCount).map {
            launch(dispatcher) {
                Thread.sleep(200)
                threadNames.add(Thread.currentThread().name)
            }
        }
        jobs.forEach { it.join() }
    }
    return threadNames.size
}

fun main() {
    println("availableProcessors=" + Runtime.getRuntime().availableProcessors())
    val defaultThreads = distinctRealThreadsUsedBy(Dispatchers.Default, 50)
    val ioThreads = distinctRealThreadsUsedBy(Dispatchers.IO, 50)
    println("Dispatchers.Default distinct real threads for 50 concurrent blocking tasks: $defaultThreads")
    println("Dispatchers.IO distinct real threads for 50 concurrent blocking tasks: $ioThreads")
}
```

Real, executed output (`kotlinc lab1_dispatchers.kt -cp
kotlinx-coroutines-core-jvm-1.7.1.jar -include-runtime -d lab1.jar`, then
run with `java -cp lab1.jar:kotlinx-coroutines-core-jvm-1.7.1.jar
Lab1_dispatchersKt`; reproduced identically across three separate runs;
saved in full in `verification/10.2/lab1_output.txt`):

```
availableProcessors=10
Dispatchers.Default distinct real threads for 50 concurrent blocking tasks: 10
Dispatchers.IO distinct real threads for 50 concurrent blocking tasks: 50
```

This machine's own real CPU core count, confirmed independently via
`Runtime.getRuntime().availableProcessors()`, is `10`. Fifty real,
concurrently-launched, genuinely blocking (`Thread.sleep`, not `delay`)
coroutines forced `Dispatchers.Default` to use exactly `10` distinct real
threads — capped precisely at this machine's own real core count, never
more, no matter how many more concurrent tasks were waiting — while the
identical fifty real tasks, launched on `Dispatchers.IO` instead, used
`50` distinct real threads, one genuinely separate real thread per real
task. This real, measured difference is called **dispatcher-level thread
pool sizing** — two real dispatchers, same coroutine library,
deliberately different real pool shapes for deliberately different real
kinds of work.

### Discard the Throwaway Example

`lab1_dispatchers.kt` was compiled and run standalone, outside the real
Gradle project, and never added to it — it never appears in the project
again.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and literal in
`distinctRealThreadsUsedBy` and `main`:

- `ConcurrentHashMap.newKeySet<String>()` — a real, static JDK call,
  building an empty, thread-safe set of `String`s; `threadNames` is this
  lab's own shared, observable record of every distinct real thread name
  reported.
- `runBlocking { ... }` — a real coroutine builder; since `fun main()`
  itself is not a coroutine and has no coroutine scope of its own, this
  is the real, necessary bridge that creates one, genuinely blocking the
  real thread `main()` itself runs on until everything inside finishes.
- `(1..taskCount).map { ... }` — an ordinary, already-established real
  range-and-`map` call, building a real list of fifty `Job`s, one per
  iteration.
- `launch(dispatcher) { ... }` — a real coroutine-builder call on the
  real `CoroutineScope` `runBlocking` provides, with an explicit real
  `CoroutineDispatcher` argument — the same real builder this project's
  own persistence work already used for saving a calculation, this time
  told exactly which real thread pool to use rather than accepting a
  default.
- `Thread.sleep(200)` — a real, static call, already fully established,
  genuinely pausing whatever real thread executes this exact coroutine
  for `200` real milliseconds — a real, deliberate stand-in for
  genuinely blocking work, chosen specifically because it occupies a
  real thread the whole time, unlike a suspending `delay` call, which
  would let the underlying thread go do other work instead.
- `threadNames.add(Thread.currentThread().name)` — `Thread.currentThread()`
  is the same real, static call already established, returning whichever
  real thread is actually running this exact coroutine right now; `.name`
  reads its real, given name; `.add(...)` is `ConcurrentHashMap`'s own
  real, thread-safe insertion, called here from potentially many real
  threads at once with no risk of a lost update.
- `jobs.forEach { it.join() }` — a real, already-established `forEach`
  call running `Job.join()`, detailed above, on each of the fifty real
  `Job`s in turn — since `join()` is itself `suspend`, this only compiles
  because it's called from directly inside `runBlocking`'s own real
  coroutine body.
- `threadNames.size` — a real property read on the real set, returning
  the count of genuinely distinct thread names collected — the one real
  number this whole function exists to compute.
- `Runtime.getRuntime().availableProcessors()` — both real, static/native
  calls already detailed above, reporting this exact machine's own real,
  current CPU core count.
- `distinctRealThreadsUsedBy(Dispatchers.Default, 50)` and
  `distinctRealThreadsUsedBy(Dispatchers.IO, 50)` — two real calls to the
  function just walked through, differing only in which real
  `CoroutineDispatcher` is passed — the entire real experiment's only
  variable.

### CS Lens

This is **resource-pool sizing matched to the real nature of the work** —
a pool meant for work that mostly waits can afford far more real workers
than a pool meant for work that's always actively computing, because
waiting workers aren't competing for the same limited real resource
(here, CPU cores) the way computing ones are.

```
Also recognized in: a restaurant's own kitchen staffing (bounded by real
stove and oven capacity) versus its waitstaff (who can serve many more
tables than there are cooks, since most of a server's own time is spent
walking and waiting, not actively cooking); a database connection pool
sized well below a web server's own request-handling thread count; the
classic thread-pool-vs-event-loop staffing debate behind every real
production web server's own configuration
```

### SE Lens

Why does Kotlin's coroutine library provide two separate real
dispatchers at all, instead of one shared pool sized generously enough
for everything? The real alternative — one big, elastic pool for all
work, IO and CPU-bound alike — is genuinely simpler: one real decision
instead of two. The real cost: a burst of CPU-bound work landing on a
pool sized for I/O (dozens or hundreds of real threads) would badly
oversubscribe this machine's own real `10` cores, with real threads
fighting the OS scheduler for time instead of actually computing —
proven directly by this unit's own real numbers, since nothing stopped
`Dispatchers.IO` from growing to `50` real threads for work that never
needed more than `10`. Separate, correctly-sized pools cost one real,
extra decision — which dispatcher? — every time new coroutine work is
written, honestly a decision this project has only had to make once
before now, when Room's own suspend queries settled on `Dispatchers.IO`
as the singular real choice available. Getting it wrong doesn't crash
anything — both real dispatchers
happily run either kind of work — it just means paying a real,
avoidable cost in oversubscribed threads and OS-level context-switching
overhead, exactly the honest cost this unit's own real measurement makes
visible instead of theoretical.

### Commands Needed

`kotlinc lab1_dispatchers.kt -cp <kotlinx-coroutines-core-jvm-1.7.1.jar>
-include-runtime -d lab1.jar` compiles this lab against this project's
own real, already-resolved coroutines dependency, bundling the Kotlin
runtime into a single real, executable jar (`-include-runtime`, already
established as this curriculum's own standalone-lab compilation pattern);
`java -cp lab1.jar:<same jar> Lab1_dispatchersKt` runs it — `kotlinc`
compiles a top-level `fun main()` in a file named `lab1_dispatchers.kt`
into a real class named `Lab1_dispatchersKt`, capitalizing the file's own
name and appending `Kt`, a real, mechanical Kotlin-to-JVM naming
convention already familiar from this project's own earlier standalone
labs.

### Run It

Shown above — real, executed output, reproduced identically across three
separate runs, saved in full in `verification/10.2/lab1_output.txt`.

### Connect the Pieces

This unit proved, with a real, measured number, that `Dispatchers.Default`
and `Dispatchers.IO` are genuinely different real thread pools, sized for
genuinely different real kinds of work — and that `GraphScreen`'s own
real sampling work, being pure computation, belongs on `Dispatchers.Default`
specifically, not the `Dispatchers.IO` this project has used until now.
The next unit puts that real choice to work, inside `GraphScreen` itself.

---

## Concept Unit: A Coroutine That Can't Outlive Its Own Screen

### The Problem

`GraphScreen`'s own real, current body computes its points like this,
unchanged since it was first written:

```kotlin
val points = remember { sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100) }
```

The previous lesson already proved, in general, that any code running
directly inside a composable's own body — a `remember` block included —
runs synchronously on the real main thread. The previous unit in this
lesson just proved `Dispatchers.Default` is the real, correctly-sized
pool for exactly this kind of CPU-bound work. Simply wrapping this one
line in `CoroutineScope(Dispatchers.Default).launch { }` would genuinely
move the work off the main thread — but raises a new, real problem this
project hasn't had to solve before: who cancels that coroutine, and when?
This project's own real `viewModelScope` is tied to a `ViewModel`'s own
lifecycle, but `GraphScreen` is a composable, not a `ViewModel`, and has
no `viewModelScope` of its own to reach into.

Given a real, hand-built `CoroutineScope` never automatically knows when
its own screen is dismissed — a real, ownerless coroutine left running
for a screen the user already navigated away from — what real, existing
mechanism does this project already depend on that ties
something's own lifetime directly to a composable's own presence on
screen, automatically, with nothing manually cancelled by hand? Could
there be a real, coroutine-shaped version of that same idea, not just a
value-shaped one?

### Introduce the Concept in Isolation

A real, temporary test file, `LabLaunchedEffectTest.kt`, added directly
to this project's own real Gradle module — the same standing adaptation
already used for every other Android-framework-specific construct this
curriculum has introduced, since `LaunchedEffect`'s own real cancellation
behavior can only be observed through a real, simulated Android/Compose
runtime:

```kotlin
package com.example.calculator

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.navigation.NavHostController
import androidx.navigation.compose.ComposeNavigator
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.testing.TestNavHostController
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

private var labFlagA = false
private var labFlagB = false

@Composable
private fun LabScreenA() {
    LaunchedEffect(Unit) {
        withContext(Dispatchers.Default) { Thread.sleep(500) }
        labFlagA = true
    }
}

@Composable
private fun LabScreenB() {
    LaunchedEffect(Unit) {
        withContext(Dispatchers.Default) { Thread.sleep(500) }
        labFlagB = true
    }
}

@Composable
private fun LabNavHost(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "a") {
        composable("a") { LabScreenA() }
        composable("b") { LabScreenB() }
    }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabLaunchedEffectTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun launchedEffectCompletesWhenItsScreenStays() {
        labFlagA = false
        val navController = TestNavHostController(ApplicationProvider.getApplicationContext())
        navController.navigatorProvider.addNavigator(ComposeNavigator())
        composeTestRule.setContent { LabNavHost(navController) }

        Thread.sleep(700)
        composeTestRule.waitForIdle()

        assertTrue(labFlagA)
    }

    @Test
    fun launchedEffectIsCancelledWhenItsScreenLeavesBeforeItFinishes() {
        labFlagB = false
        val navController = TestNavHostController(ApplicationProvider.getApplicationContext())
        navController.navigatorProvider.addNavigator(ComposeNavigator())
        composeTestRule.setContent { LabNavHost(navController) }

        navController.navigate("b")
        composeTestRule.waitForIdle()
        navController.popBackStack()
        composeTestRule.waitForIdle()

        Thread.sleep(700)
        composeTestRule.waitForIdle()

        assertFalse(labFlagB)
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabLaunchedEffectTest" --rerun-tasks`, reproduced
identically across two separate full runs of this test class, saved in
full in `verification/10.2/lab2_output.txt`):

```
BUILD SUCCESSFUL in 14s
Real, saved XML result: tests="2" skipped="0" failures="0" errors="0"
```

This proves two separate real things, deliberately contrasted against
each other. First: `LabScreenA`'s own `LaunchedEffect`, left alone on
screen the whole time, genuinely completed its real 500-millisecond
background block and set `labFlagA = true`, confirmed real, true, after
waiting. Second: `LabScreenB`'s own, identical `LaunchedEffect` started
the same real background block, but `navController.popBackStack()`
removed `LabScreenB` from composition — back to `LabScreenA` — before
that block finished; `labFlagB` stayed real, false, even after waiting
longer than the block's own real duration. The coroutine wasn't merely
delayed — it never resumed past its own `withContext` call at all, because
leaving composition genuinely cancelled it.

### Discard the Throwaway Example

`LabLaunchedEffectTest.kt` was deleted from the project immediately after
this real run — it never appears in the project again. A coroutine whose
own lifetime is bounded by, and can never outlive, the structure that
created it is called **structured concurrency** — this project's own
`viewModelScope`, already established, already showed one real shape of
it; `LaunchedEffect` is a second, genuinely different real shape, tied to a
composable's own presence on screen instead of a `ViewModel`'s own
cleared lifecycle.

### Project Change

- **Reference Source:** `GraphScreen`'s own real, current body
  (`MainActivity.kt`, lines 117–124, read this session) — this unit
  changes an already-existing real function, not a from-scratch addition.
- **Files affected:** `app/src/main/java/com/example/calculator/MainActivity.kt`
  (modified); no new files.
- **Change type:** refactor — the same real, final `points` value, now
  computed asynchronously instead of synchronously.
- **Location:** inside `GraphScreen`, replacing the single line `val
  points = remember { sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0,
  100) }`.
- **Dependencies:** `LaunchedEffect` (`androidx.compose.runtime`),
  `Dispatchers`/`withContext` (`kotlinx.coroutines`) — three new real
  imports, none requiring a new Gradle dependency, since
  `kotlinx-coroutines-core`/`-android` and the Compose runtime are both
  already this project's own real, resolved dependencies.

### The New Code

```kotlin
var points by remember { mutableStateOf<List<Point>>(emptyList()) }
LaunchedEffect(Unit) {
    points = withContext(Dispatchers.Default) {
        sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100)
    }
}
```

### The Updated Project

`GraphScreen`'s own real, complete, updated body
(`MainActivity.kt`, lines 116–133):

```kotlin
 116  @Composable
 117  fun GraphScreen() {
 118      val tree = remember { buildTree(toPostfix(tokenize("x×x"))) }
 119      var points by remember { mutableStateOf<List<Point>>(emptyList()) }  // ← new
 120      LaunchedEffect(Unit) {                                               // ← new
 121          points = withContext(Dispatchers.Default) {                     // ← new
 122              sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100)        // ← new
 123          }                                                                // ← new
 124      }                                                                    // ← new
 125      var transform by remember { mutableStateOf(GraphTransform(Offset.Zero, 20.0)) }
 126      Canvas(
 127          modifier = Modifier
 128              .fillMaxSize()
 129              .testTag("graphCanvas")
 130              .pointerInput(Unit) {
 131                  detectTransformGestures { _, pan, zoom, _ ->
 132                      transform = applyGesture(transform, pan, zoom)
 133                  }
 134              }
 135      ) {
 136          val originX = (size.width / 2 + transform.panOffset.x).toInt()
 137          val originY = (size.height / 2 + transform.panOffset.y).toInt()
 138          val screenPoints = toScreenPoints(points, originX, originY, transform.scale)
 139          drawPath(buildGraphPath(screenPoints), color = Color.Blue, style = Stroke(width = 4f))
 140      }
 141  }
```

`GraphScreen` now composes instantly, with an empty graph, then
recomposes once — automatically, the moment `points` is reassigned — the
instant its own real, background-computed points actually arrive; the
`Canvas` block below it (lines 136–139) reads whatever `points` currently
holds, unchanged, exactly as before.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator in
the new code:

- `mutableStateOf<List<Point>>(emptyList())` — the same real, established
  call detailed above in the Header, this time explicitly typed to
  `List<Point>` and given `emptyList()` (an already-established Kotlin
  stdlib call) as its real starting value — a real, deliberate, empty
  graph, rather than a placeholder value that would need explaining away.
- `var points by remember { ... }` — `var` (already established) makes
  `points` genuinely reassignable; `by` and `remember` are the same real,
  established mechanism detailed above, together giving `GraphScreen` one
  real, observable piece of state instead of the old, fixed `val`.
- `LaunchedEffect(Unit)` — the real call detailed in full above; `Unit`
  as its own real `key1` argument means it launches exactly once, the
  first time `GraphScreen` enters composition, and never restarts on its
  own, since `Unit` — a real, single-instance type, already established
  — never changes value between recompositions.
- `withContext(Dispatchers.Default) { ... }` — the real, suspending call
  detailed above, switching execution onto `Dispatchers.Default`'s own
  real, bounded thread pool for the real block inside it.
- `sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100)` — this project's
  own real, already-established sampling call, completely unchanged in
  its own arguments or behavior; the only real difference
  this lesson makes is which real thread now executes it.
- `points = withContext(...) { ... }` — real assignment; `withContext`'s
  own real return value (a real `List<Point>`) becomes `points`'s own new
  real value the instant the block finishes and execution resumes back on
  the composition's own original context — the exact real moment
  `GraphScreen` recomposes with its own real, sampled graph for the first
  time.

### CS Lens

This is **structured concurrency**, named above: `LaunchedEffect`'s own
coroutine cannot outlive `GraphScreen` itself — its real lifetime is
bounded by, and entirely owned by, the exact composable that created it,
the same real shape `viewModelScope` already gave this project's own
persistence work, applied here to a composable's own lifecycle instead
of a `ViewModel`'s.

```
Also recognized in: viewModelScope itself, already this project's own
first real example; Kotlin's own coroutineScope { } builder, which
waits for every real child coroutine before it returns; a try-with-
resources or use block, guaranteeing real cleanup on every exit path —
applied here to a running coroutine instead of a file handle
```

### SE Lens

Why let `LaunchedEffect` own this coroutine's real lifetime automatically,
instead of a manually-built, top-level `CoroutineScope(Dispatchers.Default)`
living outside any one composable? The real alternative — a static,
hand-built scope — is a genuine, working option: nothing stops it from
launching the identical real work. The real cost: nothing about a
manually-built scope knows when `GraphScreen` itself is gone, so someone
would have to remember to cancel it by hand at exactly the right real
moment — miss that, and the coroutine keeps running, computing points for
a screen the user already left, a genuine **coroutine leak**, the real
async counterpart to a memory leak. `LaunchedEffect` ties cancellation to
the exact real mechanism (`remember`'s own `onForgotten` hook) already
governing everything else in this project's own composable state, at the
honest cost that its own real re-launch behavior — a different `key1`
cancels and restarts the whole coroutine — has to be understood, not just
assumed. This lesson deliberately passes the fixed key `Unit`, since
`GraphScreen`'s own real expression is still hardcoded to `"x×x"` — there
is, honestly, nothing yet for a real key to vary with. The moment a real
input actually can change (a different expression typed in, say), that
exact same key decision — what should make this coroutine cancel and
restart — becomes a real, live design question this lesson deliberately
leaves open, owed to whichever lesson gives `GraphScreen` a real, editable
expression.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest assembleDebug`, run below.

### Run It

Shown above for the isolated lab. For the real, permanent production
change: a new, permanent test,
`samplingOnDispatchersDefaultProducesTheIdenticalRealResultToSamplingDirectly`
(`GraphingTest.kt`), confirms `sample`'s own real output, run through
`withContext(Dispatchers.Default)`, is exactly identical to calling it
directly — proving the async wrapping this unit adds changes nothing
about the real, computed graph itself. This project's existing
`GraphScreenTest.kt` suite (composing, dragging, and pinching the real
graph canvas) required no changes at all, since none of those three tests
ever asserted on `points`'s own specific values — only that the real
canvas composes and survives real gesture input, both still true with an
initially-empty, later-populated points list. A full, clean
`./gradlew testDebugUnitTest assembleDebug` run confirms this project
now has `96` real, passing tests (`95` prior + `1` new), `0` failures,
and a real, installable `.apk` — saved in full in
`verification/10.2/step1_full_suite.txt`.

### Connect the Pieces

The previous unit proved `Dispatchers.Default` is the right real pool for
`sample`'s own CPU-bound work. This unit moved that real work off the
main thread for real, using `LaunchedEffect` to guarantee it can never
outlive `GraphScreen` itself — closing the exact real risk the previous
lesson proved was possible, using the exact structured-concurrency
pattern this project's own existing coroutine work already established,
applied here to a composable instead of a `ViewModel`.

---

## Connect the Pieces

One concrete real value, traced through both units: this project's own
already-hardcoded graph expression, `"x×x"`. Before this lesson,
computing its `100` real sampled points happened synchronously, inside
`GraphScreen`'s own `remember` block, directly on the real main thread —
exactly the real risk the previous lesson proved generically. The first unit
measured, for real, that `Dispatchers.Default` — not `Dispatchers.IO`,
this project's only prior choice — is the real, correctly-sized pool for
this exact kind of work, capping at this machine's own real `10` cores
under load where `Dispatchers.IO` grew to `50`. The second unit put that
real choice to work: `GraphScreen` now launches `sample`'s own real
computation through `LaunchedEffect`, on `Dispatchers.Default`, and a
real, isolated lab proved that exact same real mechanism — a coroutine
tied to a composable's own presence on screen — genuinely cancels itself
the instant its own screen is gone, never left running for a screen the
user already navigated away from. `GraphScreen` itself is unchanged in
every other way — the same real expression, the same real `sample`, the
same real `Canvas` drawing the same real curve — only where, and on which
real thread, that one real computation now happens.

**Next:** Lesson 10.3 (Cancellation).
