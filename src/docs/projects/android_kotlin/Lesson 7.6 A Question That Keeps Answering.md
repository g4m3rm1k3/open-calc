# Lesson 7.6: A Question That Keeps Answering

- **What you will build**: this project's own real, on-screen calculation
  history — a real, live list, visible on the calculator screen itself,
  that updates itself automatically the moment a new calculation is
  saved, with nothing in the UI ever explicitly asking the database
  "has anything changed yet?" The transferable problem underneath it:
  a `suspend` function returns exactly one answer and is finished: it
  can describe the database at the instant it was called, but it has no
  way to notice a change that happens a moment later. Something that
  needs to keep noticing ongoing change — not just answer once — needs a
  fundamentally different shape of function: one that can hand back more
  than one answer, over time, from a single call.
- **What you need to know first**: Lesson 7.5 (`suspend`, `CoroutineScope`,
  `viewModelScope`, `CalculatorViewModel`'s real, current
  `@JvmOverloads` constructor and its `AndroidViewModel` superclass, and
  the real, checked fact that Room's own suspend DAO methods already run
  off the main thread automatically); Lesson 7.4 (`CalculationRepository`,
  `CalculationMapper`'s `toEntity()`/`toDomain()`); Lesson 7.3
  (`CalculationDao`, `AppDatabase`, `@Dao`, `@Query`,
  `Room.inMemoryDatabaseBuilder`); Lesson 3.3 (`CalculatorState`,
  Compose's own `state by mutableStateOf(...)` causing automatic
  recomposition on reassignment, with no polling loop anywhere).

## Terms used in this lesson

- **`suspend`** — a function modifier marking a function as pausable
  without blocking the real, underlying thread it started on, and
  restricting it to being called only from another `suspend` function or
  from inside a real coroutine — a genuine, compiler-enforced rule, not a
  naming convention, confirmed for real in Lesson 7.5 by a captured
  compile error. This lesson's own new code calls several already-real
  `suspend` functions (`CalculationDao.insert`, `CalculatorViewModel`'s
  own constructor path) and, in its throwaway labs, defines a couple of
  its own.
- **`runBlocking { }`** — a real coroutine builder that starts a new
  coroutine and blocks the calling thread until that coroutine finishes,
  used specifically to bridge an ordinary, non-suspend function (a JUnit
  `@Test` method, which cannot itself be `suspend`) into `suspend`-only
  territory. It exists because a test function has no coroutine of its
  own to run inside — `runBlocking` manufactures one, on the spot, for
  exactly the duration of the block.
- **`delay(...)`** — a real, `suspend` function that pauses the current
  coroutine for a given number of milliseconds without blocking the
  underlying thread it's running on — the coroutine equivalent of
  `Thread.sleep`, except the thread itself stays free to do other work
  while a `delay`-ed coroutine waits.
- **`launch { }` / `.cancel()`** — `launch` is a real coroutine builder
  that starts a new coroutine and immediately returns a `Job` handle to
  it, without waiting for it to finish — used, in this lesson's own labs,
  to start a Flow-collecting coroutine that has to keep running
  *alongside* the rest of a test, not block it. `.cancel()`, called on
  that `Job` (or on a `CoroutineScope` that owns one), stops the
  coroutine permanently — used here to shut a collector down cleanly
  once a lab's own assertions are done reading from it, rather than
  leaving it running forever.
- **`CoroutineScope(...)`** — a real, standalone coroutine scope,
  constructed directly (outside any framework-provided one like
  `viewModelScope`) and tied to whatever `CoroutineContext` — here,
  `Dispatchers.Default` — is passed to it. Used, in this lesson's own
  `StateFlow` lab, to prove `.stateIn`'s two real sharing strategies
  apart from any Android or ViewModel machinery, on a plain, isolated
  scope this lab both creates and cancels itself.
- **`List` `+` (`plus`)** — a real operator function on `List` that
  returns a brand-new list containing every element of the original plus
  the new one, leaving the original list completely untouched — the
  same real, immutable-growth pattern this project's own `CalculatorState.history`
  already used, confirmed back in Lesson 7.1, specifically *because* a
  `MutableList`'s own in-place `.add()` was proven there to alias
  dangerously across a `data class`'s `.copy()`. This lesson's own
  `FakeCalculationDao` reaches for it again, for the identical reason.

## Objects and methods used

- **`Flow<T>`**
  - What it is: a real, generic Kotlin type representing a
    **cold, asynchronous stream** of values — something capable of
    emitting zero, one, or many values of type `T`, spread out over
    time, to whoever collects it.
  - Implementation: `interface Flow<out T>` (`kotlinx.coroutines.flow`),
    declaring one core member, a `suspend fun collect(collector:
    FlowCollector<T>)`. "Cold" means a `Flow` does no work at all until
    something actually collects it — declaring one, on its own, runs
    nothing.
  - Its use: this lesson's entire point rests on `Flow` being able to
    hand back more than one value from a single call, unlike the
    `suspend fun getAll(): List<Calculation>` Lesson 7.5 left behind —
    `CalculationDao`/`CalculationRepository`'s own `getAll()` both
    become `Flow`-returning this lesson.
  - Type: a public interface, generic over its emitted element type `T`.
  - Responsibility: representing an ongoing, potentially never-ending
    sequence of future values, and defining the one real contract
    (`collect`) every consumer uses to receive them, in order, as they
    arrive.
  - Depends on: nothing to declare one; a real `FlowCollector` (usually
    supplied invisibly by whichever terminal operator — `.collect`,
    `.first()`, `.toList()` — is used to consume it) to actually receive
    values.
  - Connects to: produced by the `flow { }` builder or by a real,
    framework-generated implementation (Room's own Flow-returning
    `@Query` methods); consumed by `.collect { }`, `.first()`,
    `.toList()`, `.map { }`, or `.stateIn(...)`, each of which is a real,
    separate function this lesson defines or uses.
  - Shape: a public API surface — the core abstraction this entire
    lesson's own persistence and UI layers are rebuilt around.

- **`flow { }`**
  - What it is: a real, top-level builder function that constructs a new
    `Flow` from an ordinary suspend lambda, inside which values are
    produced one at a time using `emit(...)`.
  - Implementation: `fun <T> flow(block: suspend FlowCollector<T>.() ->
    Unit): Flow<T>` (`kotlinx.coroutines.flow`) — a function, not a
    class or object; calling it returns a real `Flow` instance wrapping
    the given block.
  - Its use: this lesson's very first throwaway lab uses it to build the
    simplest possible multi-value stream — proof, before touching Room
    at all, that a single call to a `Flow`-returning function really can
    hand back more than one value.
  - Type: a top-level generic function.
  - Responsibility: turning an ordinary block of sequential code — one
    that calls `emit` more than once — into a real, lazy `Flow` that
    only actually runs that block once collection begins.
  - Depends on: a lambda with `FlowCollector<T>` as its receiver, so
    `emit(...)` is callable directly inside it with no explicit receiver
    named.
  - Connects to: called once, to build a `Flow`; the `Flow` it returns
    is later handed to `.collect { }`/`.toList()`, which actually run
    the block and receive its emitted values.
  - Shape: a public, standard-library-level builder — the most
    fundamental way to construct a `Flow` by hand, underneath the
    higher-level, Room-generated `Flow`s this lesson also uses.

- **`emit(...)`**
  - What it is: a real, `suspend` member function of `FlowCollector<T>`,
    called from inside a `flow { }` block to produce exactly one value
    to whoever is currently collecting.
  - Implementation: `abstract suspend fun emit(value: T)`
    (`kotlinx.coroutines.flow.FlowCollector`) — an interface method;
    `flow { }`'s own block runs with `FlowCollector<T>` as its implicit
    receiver, which is exactly why `emit` can be called with no object
    in front of it.
  - Its use: this lesson's first lab calls it three separate times,
    proving a single `flow { }` block can hand back three distinct
    values across one collection, not just one.
  - Type: an abstract instance method on an interface.
  - Responsibility: delivering exactly one value downstream to the
    current collector, and suspending until that collector has finished
    processing it before the `flow { }` block is allowed to continue to
    its next line.
  - Depends on: a real `FlowCollector` receiver — supplied automatically
    inside a `flow { }` block, never constructed by hand.
  - Connects to: called by code inside `flow { }`; received, on the
    other end, by whatever `.collect { }` block (or terminal operator)
    is actively consuming that `Flow`.
  - Shape: the one real producer-side primitive every `Flow` value
    ultimately flows through.

- **`.collect { }`**
  - What it is: a real, `suspend` terminal operator on `Flow` — the most
    basic way to actually consume every value a `Flow` emits, running a
    given lambda once per value, for as long as the `Flow` keeps
    emitting.
  - Implementation: `suspend inline fun <T> Flow<T>.collect(crossinline
    action: suspend (value: T) -> Unit)` (`kotlinx.coroutines.flow`) —
    an extension function on `Flow<T>`.
  - Its use: this lesson's second lab calls it inside a `launch { }`
    block specifically because collection never finishes on its own
    (Room's real Flow keeps the connection open indefinitely, waiting
    for the next table change) — something has to run it concurrently,
    not as the one and only thing the test does.
  - Type: a `suspend inline` extension function.
  - Responsibility: repeatedly awaiting the `Flow`'s next emitted value
    and running the given action on it, for the entire lifetime of the
    collection — which, for a genuinely ongoing `Flow`, may never
    return.
  - Depends on: a `Flow<T>` receiver to collect from; a lambda
    describing what to do with each value.
  - Connects to: called on a `Flow` produced by `flow { }` or by Room's
    own generated implementation; internally calls that `Flow`'s own
    `collect(FlowCollector)` member, wrapping the given lambda into a
    real `FlowCollector` automatically.
  - Shape: the fundamental terminal operator every other terminal
    operator (`.first()`, `.toList()`, `.stateIn(...)`) is ultimately
    built on top of.

- **`.toList()`**
  - What it is: a real, `suspend` terminal operator on `Flow` that
    collects every value a `Flow` emits into a single, ordinary `List`,
    suspending until the `Flow` itself actually completes.
  - Implementation: `suspend fun <T> Flow<T>.toList(): List<T>`
    (`kotlinx.coroutines.flow`) — an extension function; it only ever
    returns once the underlying `Flow` reaches its own natural end.
  - Its use: this lesson's first lab collects `labCountingFlow()`'s
    three emitted values with it — a genuinely finite `Flow` (it
    completes after its third `emit`), so `.toList()` can wait for the
    whole thing and hand back all three values at once, unlike Room's
    own `getAll()` `Flow`, which never completes on its own and needs
    `.collect { }` instead.
  - Type: a `suspend` extension function.
  - Responsibility: waiting for a `Flow` to run to completion while
    accumulating every value it emits along the way, in order, into one
    `List`.
  - Depends on: a `Flow<T>` that actually completes — calling it on a
    `Flow` that never finishes (like Room's own `getAll()`) would
    suspend forever, waiting for an ending that never comes.
  - Connects to: called on the `Flow` returned by `flow { }`; internally
    built on the same `.collect { }` mechanism, appending each collected
    value to a growing list.
  - Shape: a convenience terminal operator, correct only for genuinely
    finite `Flow`s.

- **`kotlinx.coroutines.flow.map`**
  - What it is: a real, intermediate operator on `Flow` — transforms
    each value a `Flow` emits into a new value, lazily, producing a new
    `Flow` of the transformed type, without collecting anything itself.
  - Implementation: `fun <T, R> Flow<T>.map(transform: suspend (value:
    T) -> R): Flow<R>` (`kotlinx.coroutines.flow`) — a real, distinct
    function from the already-known `List<T>.map`, sharing only its
    name; this one operates on a `Flow` receiver and returns a `Flow`,
    never actually calling `transform` until something downstream
    collects the result.
  - Its use: `CalculationRepository.getAll()` uses it to convert each
    `List<CalculationEntity>` Room's own `Flow` emits into a
    `List<Calculation>` — the exact same domain-conversion job
    `CalculationRepository` already did with a plain `List.map` back in
    Lesson 7.4, now performed once per emission instead of once per
    call.
  - Type: an extension function on `Flow<T>`.
  - Responsibility: producing a new `Flow` that emits a transformed
    version of every value the original `Flow` emits, applying
    `transform` freshly to each one, in order, only once collection
    actually begins.
  - Depends on: a `Flow<T>` receiver and a transform function from `T`
    to `R`.
  - Connects to: called directly on `dao.getAll()`'s returned `Flow`;
    the `Flow<List<Calculation>>` it returns is what
    `CalculationRepository.getAll()` itself returns to its own callers.
  - Shape: a public, standard-library intermediate operator — the same
    general "transform each element" idea `List.map` already taught,
    ported onto a stream that isn't fully available all at once.

- **`.first()`**
  - What it is: a real, `suspend` terminal operator on `Flow` that
    collects only the *first* value a `Flow` emits, then immediately
    stops collecting and returns that one value.
  - Implementation: `suspend fun <T> Flow<T>.first(): T`
    (`kotlinx.coroutines.flow`) — an extension function; internally, it
    collects until exactly one value has arrived, then cancels its own
    collection.
  - Its use: `AppDatabaseTest`/`CalculationRepositoryTest`'s own
    existing tests both call it, once, right after inserting a row —
    the simplest, correct way to read "whatever the table currently
    contains" from a `Flow` that, left uncollected further, would keep
    the connection open indefinitely; a plain, one-shot read, the
    `Flow`-based equivalent of what the old `suspend fun getAll():
    List<...>` used to do directly.
  - Type: a `suspend` extension function.
  - Responsibility: waiting for exactly one emission, returning it, and
    releasing the underlying collection immediately afterward — never
    leaving a lingering, uncollected subscription open.
  - Depends on: a `Flow<T>` that emits at least one value; calling it on
    a `Flow` that never emits at all would suspend forever.
  - Connects to: called directly on `dao.getAll()`/`repository.getAll()`'s
    returned `Flow`, from inside `runBlocking { }`, in both of this
    lesson's updated test files.
  - Shape: a public, standard-library terminal operator — the
    lightest-weight way to treat an ongoing `Flow` as a plain, one-shot
    snapshot read.

- **`MutableStateFlow<T>`**
  - What it is: a real, mutable, always-has-a-current-value
    specialization of `Flow` — unlike a plain `flow { }`-built `Flow`,
    which does nothing until collected, a `MutableStateFlow` holds one
    real value at all times, readable synchronously, and re-emits to
    every active collector the instant that value is reassigned.
  - Implementation: `interface MutableStateFlow<T> : StateFlow<T>,
    MutableSharedFlow<T> { override var value: T }`
    (`kotlinx.coroutines.flow`); constructed with
    `MutableStateFlow(initialValue)`.
  - Its use: this lesson's own `CalculatorViewModelPersistenceTest.kt`
    rebuilds `FakeCalculationDao` around one, so a test can both feed it
    new "database rows" directly (by reassigning `.value`) and hand its
    `getAll()` override a real, live `Flow` to return — without
    depending on Room or a real database at all.
  - Type: a public interface extending both `StateFlow<T>` and
    `MutableSharedFlow<T>`.
  - Responsibility: holding exactly one current value, exposing it
    synchronously via `.value`, and notifying every active collector
    whenever that value is reassigned to something new.
  - Depends on: an initial value, supplied at construction
    (`MutableStateFlow(emptyList())`, here).
  - Connects to: written to directly (`insertedFlow.value = ...`) by
    `FakeCalculationDao.insert`; read as a plain `Flow<List<CalculationEntity>>`
    by `FakeCalculationDao.getAll()`'s own override, satisfying
    `CalculationDao`'s real interface.
  - Shape: a test-double implementation detail — this project's own real
    `AppDatabase` never uses it; only this lesson's own hand-written
    fake does, standing in for what Room's real, generated
    implementation does automatically.

- **`StateFlow<T>`**
  - What it is: the real, read-only supertype of `MutableStateFlow<T>` —
    a `Flow` that always has a current value, exposed through a
    synchronous, non-suspend `.value` property, in addition to being
    collectable like any other `Flow`.
  - Implementation: `interface StateFlow<out T> : SharedFlow<T> { val
    value: T }` (`kotlinx.coroutines.flow`).
  - Its use: `CalculatorViewModel`'s own new `persistedHistory` property
    is declared as one — the exact shape Compose's own `collectAsState()`
    needs: something that's always got a real, current value ready to
    render, not just a promise of eventual values.
  - Type: a public interface extending `SharedFlow<T>`.
  - Responsibility: guaranteeing, at the type level, that `.value` always
    holds a real, current, synchronously-readable snapshot — the one
    property a plain `Flow<T>` alone never promises.
  - Depends on: nothing to read from as a caller; whatever produced it
    (here, `.stateIn(...)`) is responsible for keeping `.value` current.
  - Connects to: exposed by `CalculatorViewModel`; read, in real project
    code, by `CalculatorScreen`'s own `collectAsState()` call, and, in
    this lesson's new permanent test, directly via `.value`.
  - Shape: a public API surface — the ViewModel's own outward-facing
    contract for "the persisted history, always current."

- **`.stateIn(...)`**
  - What it is: a real, intermediate operator that converts an ordinary
    `Flow<T>` into a `StateFlow<T>`, sharing one single, ongoing
    collection of the original `Flow` across every observer, rather than
    each observer starting its own separate collection from scratch.
  - Implementation: `fun <T> Flow<T>.stateIn(scope: CoroutineScope,
    started: SharingStarted, initialValue: T): StateFlow<T>`
    (`kotlinx.coroutines.flow`) — an extension function on `Flow<T>`.
  - Its use: `CalculatorViewModel.persistedHistory` is built by calling
    it directly on `repository.getAll()`'s own `Flow<List<Calculation>>`,
    tying its lifetime to `viewModelScope` (Lesson 7.5's own Structured
    Concurrency) and giving it `emptyList()` to show before the very
    first real value ever arrives.
  - Type: an extension function on `Flow<T>`.
  - Responsibility: starting (or reusing) exactly one collection of the
    original `Flow`, tied to the given `scope`'s own lifetime, and
    exposing its most recently collected value through the returned
    `StateFlow`'s `.value` — governed by exactly when that collection
    starts, per the `started` strategy.
  - Depends on: a `CoroutineScope` to run the underlying collection in;
    a `SharingStarted` strategy deciding when that collection actually
    begins; an `initialValue` to show before the first real emission.
  - Connects to: called on `repository.getAll()`; its returned
    `StateFlow` becomes `persistedHistory`, later read by
    `CalculatorScreen`'s own `collectAsState()` call.
  - Shape: the real, load-bearing bridge between this project's
    Repository layer (plain `Flow`s) and its UI layer (which needs an
    always-current value to render).

- **`SharingStarted`**
  - What it is: a real, sealed interface naming *when* a shared `Flow`
    (one built with `.stateIn(...)` or `.shareIn(...)`) actually starts
    collecting its upstream source — not a boolean flag, but a strategy
    object.
  - Implementation: `interface SharingStarted` (`kotlinx.coroutines.flow`),
    with two real, named companion-object constants this lesson uses:
    `SharingStarted.Eagerly` (start collecting immediately, the moment
    `.stateIn(...)` is called, and never stop for the scope's whole
    lifetime) and `SharingStarted.WhileSubscribed(stopTimeoutMillis)`
    (start only once at least one real collector subscribes; stop
    `stopTimeoutMillis` after the last one leaves).
  - Its use: this lesson's own `StateFlow` lab proves, for real, that
    these two strategies genuinely differ — `WhileSubscribed`'s
    `.value` stayed at its untouched initial value with no active
    collector, while `Eagerly`'s reflected a real update with no
    collector at all — the exact, decisive finding behind choosing
    `Eagerly` for `persistedHistory`.
  - Type: a sealed interface with named object/function constants.
  - Responsibility: deciding exactly when a shared `Flow`'s upstream
    collection starts and stops, independent of when any particular
    caller happens to read `.value`.
  - Depends on: nothing to reference `Eagerly`; `WhileSubscribed` takes
    a `stopTimeoutMillis: Long` argument.
  - Connects to: passed as `.stateIn(...)`'s second argument; governs
    exactly when that call's own underlying `Flow` collection begins.
  - Shape: a small, public configuration surface controlling a real
    resource-vs-correctness tradeoff at the exact seam between
    Repository and ViewModel.

- **`collectAsState()`**
  - What it is: a real, Compose-specific extension function that
    subscribes to a `Flow` (or `StateFlow`) from inside a `@Composable`
    function and exposes its latest value as Compose `State<T>` —
    automatically triggering recomposition every time a new value
    arrives, the same way `mutableStateOf`'s own `by` delegate already
    does for plain local state.
  - Implementation: `@Composable fun <T> StateFlow<T>.collectAsState():
    State<T>` (`androidx.compose.runtime`, for the `StateFlow` overload
    used here) — starts collecting when the composable enters
    composition and stops automatically when it leaves, tied to
    Compose's own lifecycle.
  - Its use: `CalculatorScreen` calls it directly on
    `calculatorViewModel.persistedHistory`, the exact mechanism that
    turns "the ViewModel's `StateFlow` changed" into "the screen
    redraws" with zero explicit refresh code anywhere.
  - Type: a `@Composable` extension function.
  - Responsibility: bridging a coroutines-based `StateFlow` into
    Compose's own recomposition system, so reading its result inside a
    composable behaves exactly like reading any other Compose `State`.
  - Depends on: being called from inside a `@Composable` function,
    directly or via `by`; a `StateFlow<T>` (or `Flow<T>` with an
    explicit initial value) receiver.
  - Connects to: called on `CalculatorViewModel.persistedHistory`; the
    `State<List<Calculation>>` it returns is read, via `by`, as
    `persistedHistory` inside `CalculatorScreen`'s own body.
  - Shape: a public Compose API surface — the one real seam where this
    lesson's coroutines work becomes visible pixels.

- **`LazyColumn`**
  - What it is: a real, scrollable, vertically-stacking Compose
    composable that only actually composes and lays out the items
    currently visible on screen, rather than every item in its list at
    once.
  - Implementation: `@Composable fun LazyColumn(modifier: Modifier =
    Modifier, ..., content: LazyListScope.() -> Unit)`
    (`androidx.compose.foundation.lazy`) — takes a builder lambda with
    `LazyListScope` as its receiver, inside which `items(...)` (below)
    is called.
  - Its use: `CalculatorScreen` uses it to display `persistedHistory` —
    a list whose real length is genuinely unbounded (every calculation
    this project's user ever computes gets saved), making "lay out
    everything at once," which an ordinary `Column` would do, a real,
    eventual performance problem `LazyColumn` avoids from the start.
  - Type: a `@Composable` function.
  - Responsibility: rendering only the currently visible portion of a
    potentially large list, composing and discarding rows as the user
    scrolls, instead of building every row up front.
  - Depends on: a `LazyListScope` builder lambda describing what to lay
    out, typically via `items(...)`.
  - Connects to: contains this unit's own `items(persistedHistory) {
    ... }` call; sits inside `CalculatorScreen`'s own `Column`, as a
    new, final child alongside the existing display and keypad.
  - Shape: a public Compose API surface — this project's first use of
    Compose's *lazy* layout family, distinct from the plain, eager
    `Column`/`Row` already used everywhere else in this file.

- **`items(...)`**
  - What it is: a real extension function on `LazyListScope`, called
    inside a `LazyColumn`'s own builder lambda, that describes "for each
    element in this list, lay out one row using this content."
  - Implementation: `fun <T> LazyListScope.items(items: List<T>,
    itemContent: @Composable (item: T) -> Unit): Unit`
    (`androidx.compose.foundation.lazy`) — an extension function on
    `LazyListScope`, not a free function, even though it's called with
    no explicit receiver inside a `LazyColumn { }` block.
  - Its use: `CalculatorScreen` calls it with `persistedHistory` and a
    lambda rendering each real `Calculation` as one line of text —
    the real, concrete mechanism by which a change in `persistedHistory`
    (a whole new `List<Calculation>`, arriving via `collectAsState()`)
    becomes a whole new set of rows on screen.
  - Type: an extension function on `LazyListScope`.
  - Responsibility: registering, with the enclosing `LazyColumn`, exactly
    one row-describing entry per element of the given list, so
    `LazyColumn` knows how to lay out (and lazily recompose) each one
    individually.
  - Depends on: a `List<T>` to iterate; a composable lambda describing
    one row's content, given that row's own `T`.
  - Connects to: called inside `LazyColumn`'s own trailing lambda;
    receives `persistedHistory`, this unit's own new `by
    collectAsState()`-backed value.
  - Shape: a public Compose API surface, the `LazyColumn`-specific
    counterpart to an ordinary `for` loop over a plain `Column`.

- **`withTimeout(...)`**
  - What it is: a real coroutine function that runs a given suspend
    block and forcibly cancels it — throwing a real
    `TimeoutCancellationException` — if it hasn't finished within the
    given number of milliseconds.
  - Implementation: `suspend fun <T> withTimeout(timeMillis: Long,
    block: suspend CoroutineScope.() -> T): T`
    (`kotlinx.coroutines`).
  - Its use: this lesson's second lab collects a `Flow` inside a
    polling loop that waits for real, asynchronous emissions to arrive —
    genuinely indeterminate timing, not a fixed, known duration.
    Wrapping it in `withTimeout(5000) { }` turns "something is
    genuinely wrong and this test would otherwise hang forever" into a
    real, fast, informative test failure instead of a silent, indefinite
    stall — ordinary defensive practice around any test whose
    completion isn't guaranteed by a fixed number of steps.
  - Type: a top-level suspend function.
  - Responsibility: racing the given block against a deadline, and
    guaranteeing the caller gets control back — either the block's real
    result, or a real, thrown exception — no later than the given
    timeout.
  - Depends on: a `timeMillis` deadline; a suspend block to run inside
    it.
  - Connects to: wraps this lab's own `runBlocking { }` body, inside
    which the Flow-collecting `launch { }` and the two polling loops
    both run.
  - Shape: test-only infrastructure — never shipped in this project's
    real, permanent source, only in its throwaway verification code.

### Everything else in the file, not this lesson's subject but still explained

- **`CalculationDao`**
  - What it is: this project's own real Room Data Access Object
    interface — the real, declared contract for every SQL operation
    this project performs against its `calculations` table.
  - Implementation: `@Dao interface CalculationDao { ... }`
    (`CalculationDao.kt`), declaring `insert`/`getAll`; this lesson
    changes `getAll`'s own real return type, but the interface itself,
    and `insert`, are unchanged from Lesson 7.3/7.5.
  - Its use: this lesson's whole first Concept Unit is about changing
    exactly one of its two methods.
  - Type: a Room-annotated interface.
  - Responsibility: declaring every real database operation this
    project performs, letting Room generate a real, concrete
    implementation from these declarations alone.
  - Depends on: `CalculationEntity`, the real row type every one of its
    methods reads or writes.
  - Connects to: implemented, automatically, by Room's own generated
    code; called by `CalculationRepository`; faked, in tests, by
    `FakeCalculationDao`.
  - Shape: the real boundary between this project's SQL and everything
    above it.

- **`CalculationRepository`**
  - What it is: this project's own real Repository — the one object
    standing between raw persistence (`CalculationDao`) and the rest of
    the app, translating between `CalculationEntity` (persistence-
    shaped) and `Calculation` (domain-shaped), per Lesson 7.4's own SE
    Lens.
  - Implementation: `class CalculationRepository(private val dao:
    CalculationDao) { suspend fun save(...); fun getAll(): Flow<List<Calculation>> }`
    (`CalculationRepository.kt`) — `save` is unchanged from Lesson 7.5;
    `getAll` is this lesson's own first-unit change.
  - Its use: `CalculatorViewModel` depends on it for both saving
    (already real, since Lesson 7.5) and, new this lesson, observing.
  - Type: an ordinary class, constructor-injected with a
    `CalculationDao`.
  - Responsibility: exposing this project's persistence in
    domain-shaped terms only, never leaking `CalculationEntity` to any
    caller outside itself.
  - Depends on: a real `CalculationDao`.
  - Connects to: calls `CalculationDao`'s own two methods; called by
    `CalculatorViewModel`.
  - Shape: a public API surface, one layer up from raw persistence.

- **`CalculationEntity`**
  - What it is: this project's own real, Room-mapped row type —
    the persistence-shaped counterpart to the domain `Calculation`.
  - Implementation: `@Entity(tableName = "calculations") data class
    CalculationEntity(@PrimaryKey(autoGenerate = true) val id: Long = 0,
    val operator: String, val operandA: Int, val operandB: Int, val
    result: Int)` (`CalculationEntity.kt`) — unchanged this lesson.
  - Its use: the real element type flowing through every `Flow` this
    lesson's first unit introduces at the DAO layer.
  - Type: a Room-annotated data class.
  - Responsibility: representing exactly one real row of the
    `calculations` table, in a shape Room itself can read and write.
  - Depends on: nothing beyond its own constructor arguments.
  - Connects to: read and written by `CalculationDao`; converted to and
    from `Calculation` by `CalculationMapper`.
  - Shape: an internal, persistence-only data-transfer type.

- **`Calculation`**
  - What it is: this project's own real domain type — one completed
    calculation, independent of how (or whether) it's stored.
  - Implementation: `data class Calculation(val operator: Operator, val
    operandA: Int, val operandB: Int, val result: Int)`
    (`Calculation.kt`) — unchanged this lesson.
  - Its use: the real element type `CalculatorViewModel.persistedHistory`
    exposes, and the type `CalculatorScreen`'s new `LazyColumn` actually
    renders.
  - Type: a plain data class.
  - Responsibility: representing one calculation in domain terms, with a
    real `Operator`, not Room's own plain `String`.
  - Depends on: `Operator`.
  - Connects to: produced by `CalculationMapper.toDomain()`; read
    directly by this lesson's new UI code and new permanent test.
  - Shape: a public, persistence-independent domain type.

- **`Operator`**
  - What it is: this project's own real, from-scratch enum naming every
    arithmetic operation the calculator supports.
  - Implementation: `enum class Operator { PLUS, MINUS, TIMES, DIVIDE,
    MODULO; val operation: Operation get() = ... }` (`Calculator.kt`) —
    unchanged this lesson.
  - Its use: `CalculatorScreen`'s new history row reads
    `calculation.operator.name` — the compiler-generated `String`
    matching each constant's own declared name (`"PLUS"`, and so on) —
    to render a plain-text symbol for each saved calculation.
  - Type: an enum class.
  - Responsibility: naming, exhaustively, every operator this project
    supports, each carrying its own real `Operation`.
  - Depends on: nothing external.
  - Connects to: read by `CalculatorScreen`'s new code; already used
    throughout this project since Lesson 1.6.
  - Shape: a public, foundational domain type.

- **`AppDatabase`**
  - What it is: this project's own real Room database class — the
    single, real, generated entry point into its actual SQLite storage.
  - Implementation: `@Database(entities = [CalculationEntity::class],
    version = 1, exportSchema = false) abstract class AppDatabase :
    RoomDatabase() { abstract fun calculationDao(): CalculationDao }`
    (`AppDatabase.kt`) — unchanged this lesson.
  - Its use: `AppDatabaseTest`'s own `@Before` builds a real, in-memory
    instance of it for every test.
  - Type: an abstract, Room-annotated class.
  - Responsibility: declaring, exhaustively, every entity this
    project's real database contains, and exposing a real DAO instance
    for each one.
  - Depends on: `CalculationEntity`.
  - Connects to: built by `Room.inMemoryDatabaseBuilder`/`Room.databaseBuilder`;
    exposes `CalculationDao`.
  - Shape: a public, generated persistence root.

- **`@Dao` / `@Insert` / `@Query`**
  - What it is: three real Room annotations — `@Dao` marks an interface
    as one Room should generate a real implementation for; `@Insert`
    marks a method as a real row-insertion operation; `@Query` supplies
    the literal, real SQL a method should run.
  - Implementation: all three live in `androidx.room`; `@Query`'s own
    value, `"SELECT * FROM calculations"`, is unchanged this lesson —
    only the method it annotates changed its own return type.
  - Its use: unchanged in meaning from Lesson 7.3; still exactly what
    makes `CalculationDao.getAll()` a real, working query, regardless of
    whether that method returns a `List` or, now, a `Flow`.
  - Type: three annotation classes.
  - Responsibility: telling Room's own annotation processor,
    respectively, which interfaces to implement, which methods insert
    rows, and which methods run a specific literal query.
  - Depends on: attaching to an interface (`@Dao`) or method (`@Insert`,
    `@Query`) inside one.
  - Connects to: read by Room's own KAPT-driven code generator at
    compile time; the actual, generated implementation is what runs at
    runtime.
  - Shape: compile-time metadata, invisible at runtime.

- **`RoomDatabase`**
  - What it is: the real, abstract framework base class every Room
    database — including this project's own `AppDatabase` — extends.
  - Implementation: `abstract class RoomDatabase`
    (`androidx.room`) — unchanged this lesson.
  - Its use: named here only because it appears in `LabFlowDatabase`'s
    own declaration, this lesson's second lab.
  - Type: an abstract framework class.
  - Responsibility: providing the real, shared machinery every generated
    Room database subclass relies on (connection management, query
    dispatch, the invalidation tracking this lesson's own `Flow` support
    depends on).
  - Depends on: a concrete subclass declaring its own entities and DAOs.
  - Connects to: extended by `AppDatabase` and, in this lesson's own
    second lab, `LabFlowDatabase`.
  - Shape: framework-internal base class.

- **`Room.inMemoryDatabaseBuilder(...)`**
  - What it is: a real, static-style factory function building a
    genuine Room database that lives entirely in memory — no real file
    on disk, gone the instant it's closed or the process ends.
  - Implementation: `fun <T : RoomDatabase> Room.inMemoryDatabaseBuilder(
    context: Context, klass: Class<T>): RoomDatabase.Builder<T>`
    (`androidx.room.Room`) — unchanged this lesson.
  - Its use: builds a fresh, isolated real database for
    `AppDatabaseTest` and this lesson's own second lab — exactly why
    these tests can run repeatedly with no leftover state between runs.
  - Type: a top-level factory function.
  - Responsibility: constructing a real, working `RoomDatabase.Builder`
    backed by memory instead of a real file.
  - Depends on: a real `Context` and the target database class.
  - Connects to: called by `AppDatabaseTest`/`LabFlowDaoTest`; its
    `.build()` result exposes the real DAO these tests exercise.
  - Shape: test-only infrastructure — this project's real, shipped
    `AppDatabase` is always built with `Room.databaseBuilder`, below,
    never this.

- **`ApplicationProvider.getApplicationContext()`**
  - What it is: a real, Robolectric-provided function returning a real,
    simulated Android `Application` context, usable anywhere a real
    Android `Context` is required, with no emulator or device involved.
  - Implementation: `fun <T> ApplicationProvider.getApplicationContext():
    T` (`androidx.test.core.app`) — unchanged since Lesson 1.4.
  - Its use: supplies the real `Context` argument every Room-building
    test in this lesson needs.
  - Type: a top-level generic function.
  - Responsibility: handing back a real, working, simulated Android
    context inside a JVM-only Robolectric test.
  - Depends on: running under `@RunWith(RobolectricTestRunner::class)`.
  - Connects to: its result is passed directly into
    `Room.inMemoryDatabaseBuilder(...)`.
  - Shape: test-only infrastructure.

- **`CalculatorViewModel`**
  - What it is: this project's own real `AndroidViewModel` — the single,
    configuration-change-surviving owner of both this app's live
    calculator state and, since Lesson 7.5, its saving behavior.
  - Implementation: `class CalculatorViewModel @JvmOverloads
    constructor(application: Application, private val repository:
    CalculationRepository = ...) : AndroidViewModel(application) { var
    state by mutableStateOf(...); fun onButtonClick(...) }`
    (`CalculatorViewModel.kt`) — this lesson adds one new property,
    `persistedHistory`, alongside the unchanged `state` and
    `onButtonClick`.
  - Its use: the real object this lesson's second unit adds
    `persistedHistory` to.
  - Type: a class extending `AndroidViewModel`.
  - Responsibility: owning this app's real, live calculator state, and,
    now, exposing this project's persisted history in a form the UI can
    directly render.
  - Depends on: a real `Application`; a real `CalculationRepository`.
  - Connects to: constructed by Compose's own `viewModel()` helper
    inside `CalculatorScreen`; calls `CalculationRepository`'s own two
    methods.
  - Shape: the real seam between this project's UI and its persistence.

- **`@JvmOverloads`**
  - What it is: a real Kotlin annotation forcing the compiler to also
    generate the extra, reflection-visible JVM constructor overloads a
    default-parameter constructor wouldn't otherwise produce.
  - Implementation: `annotation class JvmOverloads` (`kotlin.jvm`) —
    unchanged since Lesson 7.5, where it was the real, confirmed fix for
    a genuine `NoSuchMethodException` `ViewModelProvider`'s own
    reflection-based construction hit without it.
  - Its use: still attached to `CalculatorViewModel`'s own constructor;
    without it, this lesson's own unchanged `viewModel()` call inside
    `CalculatorScreen` would break the exact same way it did before
    Lesson 7.5's fix.
  - Type: an annotation class.
  - Responsibility: telling the Kotlin compiler to emit one real JVM
    constructor per prefix of default-valued parameters, not just the
    one with every parameter present.
  - Depends on: attaching to a constructor with at least one
    default-valued parameter.
  - Connects to: read by the Kotlin compiler at compile time; makes
    `ViewModelProvider`'s own reflection-based lookup succeed at
    runtime.
  - Shape: compile-time metadata.

- **`AndroidViewModel`**
  - What it is: the real, framework `ViewModel` subclass that also holds
    a real `Application` reference — Lesson 7.5's own real, chosen
    superclass, over plain `ViewModel`, specifically because building a
    real `Room.databaseBuilder` needs a real `Context`.
  - Implementation: `abstract class AndroidViewModel(application:
    Application) : ViewModel()` (`androidx.lifecycle`) — unchanged.
  - Its use: `CalculatorViewModel`'s own unchanged superclass.
  - Type: an abstract framework class.
  - Responsibility: surviving configuration changes exactly like plain
    `ViewModel`, while additionally holding a real `Application`
    reference safely (never an `Activity`, which configuration changes
    actually destroy).
  - Depends on: a real `Application`, supplied at construction.
  - Connects to: extended by `CalculatorViewModel`.
  - Shape: framework base class.

- **`viewModelScope`**
  - What it is: the real, framework-provided `CoroutineScope` every
    `ViewModel` automatically owns, tied to that ViewModel's own real
    lifetime — cancelled automatically the instant the ViewModel is
    cleared.
  - Implementation: `val ViewModel.viewModelScope: CoroutineScope`
    (`androidx.lifecycle.viewmodel`) — unchanged since Lesson 7.5.
  - Its use: `persistedHistory`'s own `.stateIn(...)` call is tied to it
    directly — the real reason an `Eagerly`-collecting `Flow` here is
    safe rather than a leak: it can never outlive the ViewModel itself.
  - Type: an extension property on `ViewModel`.
  - Responsibility: providing one real, automatically-cancelled
    `CoroutineScope` per `ViewModel` instance.
  - Depends on: being read from inside a real `ViewModel` subclass.
  - Connects to: passed directly as `.stateIn(...)`'s own `scope`
    argument.
  - Shape: framework-provided infrastructure.

- **`Room.databaseBuilder(...)`**
  - What it is: the real, static-style factory function this project's
    own actual, shipped app uses to build its real, persistent,
    on-device database — as opposed to `Room.inMemoryDatabaseBuilder`,
    used only in tests.
  - Implementation: `fun <T : RoomDatabase> Room.databaseBuilder(context:
    Context, klass: Class<T>, name: String): RoomDatabase.Builder<T>`
    (`androidx.room.Room`) — unchanged since Lesson 7.5.
  - Its use: still exactly how `CalculatorViewModel`'s own default
    `CalculationRepository` argument builds its real `AppDatabase`.
  - Type: a top-level factory function.
  - Responsibility: constructing a real `RoomDatabase.Builder` backed by
    a real, named file on the device's own disk.
  - Depends on: a real `Context`, the target database class, and a
    real file name (`"calculator.db"`).
  - Connects to: called inside `CalculatorViewModel`'s own default
    parameter; its `.build().calculationDao()` becomes the real
    `CalculationDao` this app actually uses outside of tests.
  - Shape: real, shipped production infrastructure.

- **`assertEquals`**
  - What it is: JUnit's own real static assertion method, comparing an
    expected and an actual value and failing the test, with a real,
    readable message, when they aren't equal.
  - Implementation: `org.junit.Assert.assertEquals(Object expected,
    Object actual)`, among its twelve real overloads (confirmed by real
    `javap` output against the installed `junit-4.13.2.jar`, back in
    Lesson 2.2) — unchanged.
  - Its use: every test this lesson touches or adds still ends with it.
  - Type: a `static` Java method.
  - Responsibility: comparing two values for equality and reporting a
    real, specific failure when they differ.
  - Depends on: two values to compare.
  - Connects to: called at the end of every `@Test` method in this
    lesson's own changed and new tests.
  - Shape: test-only infrastructure.

## Concept Unit: Flow

### The Problem

Right now, `CalculationRepository.getAll()` — real and already working
— is a `suspend fun getAll(): List<Calculation>`. Call it once, and it
hands back exactly one answer: whatever the database held at that exact
instant, and then it's finished, the same way `save` returns exactly
one `Unit` and stops. Nothing in this project actually calls it yet —
`CalculatorViewModel` only ever calls `save` — but the moment this
project wants a real, on-screen history list that genuinely reflects
what's in the database, calling `getAll()` once, at some arbitrary
moment, and trusting that snapshot to stay accurate isn't good enough.
A calculation saved a second later would be invisible to whoever's
still holding that earlier list, with nothing telling them to go check
again.

> - This project's own `suspend fun getAll(): List<Calculation>`
>   returns exactly one value and finishes. If `CalculatorViewModel`
>   called it once, the moment the screen first appeared, and a new
>   calculation got saved five seconds later, what would that earlier
>   returned list actually contain — the five-second-old snapshot, or
>   the new one? What would have to happen, concretely, for it to ever
>   see the new one?
> - Compose's own `state by mutableStateOf(...)` already causes
>   `CalculatorScreen` to redraw itself automatically the instant
>   `state` is reassigned — nothing polls it in a loop, checking whether
>   it changed. Given that, what would a database-observing equivalent
>   of `mutableStateOf` need to be capable of, that a plain `suspend fun`
>   returning a single `List<...>` fundamentally isn't?
> - A `suspend` function, once it returns, is finished — its one real
>   job is done. What would a function need to look like, at the type
>   level, to be able to hand back more than one answer, spread out over
>   time, from a single call?

### Introduce the Concept in Isolation

A real, minimal, standalone function proves the core idea first, with
no database anywhere near it yet:

```kotlin
private fun labCountingFlow(): Flow<Int> = flow {
    emit(1)
    delay(10)
    emit(2)
    delay(10)
    emit(3)
}
```

A real, temporary test collects everything a single call to it
produces:

```kotlin
class LabCountingFlowTest {
    @Test
    fun oneCallToACountingFlowYieldsThreeSeparateValues() {
        val received = runBlocking {
            labCountingFlow().toList()
        }
        println("received: $received")
    }
}
```

Real, executed output:

```
received: [1, 2, 3]
```

This is called a **`Flow`** — one single call to `labCountingFlow()`
genuinely produced three separate values, spread across two real
`delay`s, not one. A `suspend fun` returning `Int` could only ever have
handed back one of these three numbers, once, and been done. This real,
minimal proof is exactly what makes a `Flow` the right shape for
"database contents that can keep changing" — the concept this project
actually needs is a stream of successive database snapshots, not a
single frozen one, and this is the real, general-purpose Kotlin type
built for exactly that.

A second real lab proves the concrete case that actually matters here —
not a hand-written `flow { }`, but Room's own real, generated Flow
support, reacting to a genuine database change with no explicit refresh
call anywhere:

```kotlin
@Dao
interface LabFlowDao {
    @Insert
    suspend fun insert(calculation: CalculationEntity)

    @Query("SELECT * FROM calculations")
    fun getAll(): Flow<List<CalculationEntity>>
}

@Database(entities = [CalculationEntity::class], version = 1, exportSchema = false)
abstract class LabFlowDatabase : RoomDatabase() {
    abstract fun labFlowDao(): LabFlowDao
}
```

A real, temporary, Robolectric-run test starts collecting from that
`Flow`, waits for its first real emission, inserts a row, then waits
for a second real emission — with nothing anywhere telling Room to
"check again":

```kotlin
@RunWith(RobolectricTestRunner::class)
class LabFlowDaoTest {

    @Test
    fun aFlowReturningQueryReEmitsAfterARealInsertWithNoExplicitRefresh() {
        val database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            LabFlowDatabase::class.java
        ).build()
        val dao = database.labFlowDao()

        runBlocking {
            withTimeout(5000) {
                val emissions = mutableListOf<List<CalculationEntity>>()
                val collector = launch {
                    dao.getAll().collect { emissions.add(it) }
                }

                while (emissions.isEmpty()) delay(5)
                println("first emission (before insert): ${emissions[0]}")

                dao.insert(CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10))
                while (emissions.size < 2) delay(5)
                println("second emission (after insert): ${emissions[1]}")

                collector.cancel()
            }
        }
        database.close()
    }
}
```

An earlier version of this same lab used a fixed `delay(50)` before
inserting, guessing that would be enough time for the first emission to
land first — real, executed output proved that guess wrong: both
emissions came back identical, because the insert sometimes landed
*before* Room's own first query had actually run. The fix, shown above,
is real and deterministic: poll `emissions` itself, waiting for genuine
proof each stage actually happened, rather than guessing a duration.
`withTimeout(5000)` guards the whole thing — if that polling logic were
ever wrong, this test would fail fast with a real, informative timeout
instead of hanging forever.

Real, executed output:

```
first emission (before insert): []
second emission (after insert): [CalculationEntity(id=1, operator=PLUS, operandA=7, operandB=3, result=10)]
```

Two real, separate emissions, from one single `dao.getAll()` call, with
the second one arriving *only* because a real row was inserted in
between — proof, against this project's own real `CalculationEntity`
and real Room stack, that a `Flow`-returning query genuinely notices a
database change on its own, with nothing in this test ever calling
`getAll()` a second time.

### Discard the Throwaway Example

Both `labCountingFlow`/`LabCountingFlowTest` and
`LabFlowDao`/`LabFlowDatabase`/`LabFlowDaoTest` are deleted now — none
of the four ever appears in this project again.

### Project Change

- **Reference Source**: no reference counterpart — this is a
  from-scratch adaptation of this project's own existing
  `CalculationDao`/`CalculationRepository`, converting each `getAll()`
  from the one-shot `suspend` read this project's own `getAll()`
  already used into a live `Flow`, following exactly the pattern the
  second lab above just proved against this project's own real
  `CalculationEntity`.
- **Files affected**: modified
  `app/src/main/java/com/example/calculator/CalculationDao.kt`;
  modified
  `app/src/main/java/com/example/calculator/CalculationRepository.kt`;
  modified
  `app/src/test/java/com/example/calculator/AppDatabaseTest.kt`;
  modified
  `app/src/test/java/com/example/calculator/CalculationRepositoryTest.kt`.
- **Change type**: refactor (converting two already-real methods'
  return types, and updating two already-real tests to match).
- **Location**: `CalculationDao`'s own `getAll`; `CalculationRepository`'s
  own `getAll`; both test files' own `Act` blocks.
- **Dependencies**: `kotlinx.coroutines.flow.Flow`, confirmed this
  session to already be resolved transitively on this project's own
  real classpath (via Room's own `room-ktx`, already a real dependency
  of this project's own Room setup) — no new Gradle dependency needed,
  confirmed by this unit's own labs
  already compiling and running against the real project's own real
  Gradle setup. One further real, necessary consequence, deferred to
  this lesson's next Concept Unit rather than shown here: this project's
  own `CalculatorViewModelPersistenceTest.kt` declares a
  `FakeCalculationDao` that directly implements `CalculationDao` — the
  moment `getAll`'s own signature changes, that fake must change to
  match, or the whole project stops compiling. That real, forced update
  — and the new capability it unlocks — is exactly what the next
  Concept Unit is about, so it's shown there, in full, rather than here.

### The New Code

```kotlin
fun getAll(): Flow<List<CalculationEntity>>
```

`CalculationRepository`'s own `getAll` gains the matching real change,
one layer up, converting each emitted `List<CalculationEntity>` into a
`List<Calculation>` using this project's own already-existing
domain-conversion mapper:

```kotlin
fun getAll(): Flow<List<Calculation>> {
    return dao.getAll().map { entities -> entities.map { it.toDomain() } }
}
```

### The Updated Project

`CalculationDao.kt`, in full:

```kotlin
package com.example.calculator

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface CalculationDao {
    @Insert
    suspend fun insert(calculation: CalculationEntity)

    @Query("SELECT * FROM calculations")
    fun getAll(): Flow<List<CalculationEntity>>
}
```

`CalculationRepository.kt`, in full:

```kotlin
package com.example.calculator

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class CalculationRepository(private val dao: CalculationDao) {
    suspend fun save(calculation: Calculation) {
        dao.insert(calculation.toEntity())
    }

    fun getAll(): Flow<List<Calculation>> {
        return dao.getAll().map { entities -> entities.map { it.toDomain() } }
    }
}
```

Both existing tests need the same real, small change — reading a
`Flow`'s current contents through `.first()` instead of directly
awaiting what used to be a plain `suspend` return:

`AppDatabaseTest.kt`, in full:

```kotlin
package com.example.calculator

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class AppDatabaseTest {

    private lateinit var database: AppDatabase

    @Before
    fun createDatabase() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            AppDatabase::class.java
        ).build()
    }

    @After
    fun closeDatabase() {
        database.close()
    }

    @Test
    fun insertedCalculationCanBeReadBackFromARealDatabase() {
        // Arrange
        val dao = database.calculationDao()

        // Act
        val all = runBlocking {
            dao.insert(CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10))
            dao.getAll().first()
        }

        // Assert
        assertEquals(
            listOf(CalculationEntity(id = 1, operator = "PLUS", operandA = 7, operandB = 3, result = 10)),
            all
        )
    }
}
```

`CalculationRepositoryTest.kt`, in full:

```kotlin
package com.example.calculator

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class CalculationRepositoryTest {

    private lateinit var database: AppDatabase
    private lateinit var repository: CalculationRepository

    @Before
    fun createRepository() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            AppDatabase::class.java
        ).build()
        repository = CalculationRepository(database.calculationDao())
    }

    @After
    fun closeDatabase() {
        database.close()
    }

    @Test
    fun savedCalculationCanBeReadBackAsARealDomainCalculation() {
        // Arrange
        val calculation = Calculation(operator = Operator.PLUS, operandA = 7, operandB = 3, result = 10)

        // Act
        val all = runBlocking {
            repository.save(calculation)
            repository.getAll().first()
        }

        // Assert
        assertEquals(listOf(calculation), all)
    }
}
```

Every real read this project's persistence layer performs now comes
back through a `Flow` — the necessary foundation this lesson's second
unit builds this project's actual, live, on-screen history on top of.

### Mechanical Walkthrough

- `fun getAll(): Flow<List<CalculationEntity>>` — `CalculationDao`'s own
  method declaration drops `suspend` entirely and changes its return
  type. This isn't an oversight: a `Flow`-returning Room query method is
  never itself `suspend` — the asynchrony lives inside the `Flow` it
  returns, not in the act of calling the method, which now returns
  instantly, handing back a cold `Flow` that hasn't started doing
  anything yet.
- `@Query("SELECT * FROM calculations")` — unchanged, real SQL, still
  read by Room's own annotation processor exactly as it was in Lesson
  7.3; the only thing that changed is what shape of value Room's own
  generated implementation now hands back for this exact query.
- `dao.getAll()` — `CalculationRepository`'s own call to it now returns
  a real `Flow<List<CalculationEntity>>` instead of a value already
  waited for.
- `.map { entities -> entities.map { it.toDomain() } }` — the outer
  `.map` is `kotlinx.coroutines.flow.map`, transforming each
  `List<CalculationEntity>` the `Flow` ever emits; the inner
  `entities.map { it.toDomain() }` is the already-known `List.map`,
  converting each individual `CalculationEntity` inside that list into
  a `Calculation`, exactly as this project's own `CalculationRepository`
  already did once per call — now done once per emission instead.
- `it.toDomain()` — `CalculationMapper`'s own real, already-existing
  conversion function, unchanged, still reading
  `Operator.valueOf(operator)` against the stored `String` to rebuild a
  real, type-safe `Operator`.
- `dao.getAll().first()` — both updated tests now call the real `Flow`
  terminal operator `.first()`, waiting for exactly one emission (the
  table's own current contents, right after the test's own real insert)
  and returning it directly, inside the same `runBlocking { }` these
  tests already used.

### CS Lens

**Reactive streams** — data that pushes updates to whoever's listening,
the instant something changes, instead of making them ask again and
again — is a real, recognized computer science idea, and `Flow` is this
project's own first real example of it:

```
Also recognized in: RxJava/Reactive Streams (the pattern Kotlin's own
Flow was directly designed to bring into coroutines); a spreadsheet
cell that recomputes the instant a cell it depends on changes; a DOM
event listener firing the instant a user clicks, never polled; a stock
ticker pushing a new price the instant a trade happens
```

At its core, this is the **Observer pattern** — a subject (here, Room's
own invalidation tracker, watching the `calculations` table) keeping a
list of interested parties and notifying each one, in order, whenever
its own state changes — generalized into a first-class, composable
Kotlin type instead of a hand-rolled listener interface.

### SE Lens

Why build a real `Flow`-based observer at all, instead of just having
`CalculatorViewModel` call `getAll()` again on a fixed timer — say,
once a second? A real, legitimate alternative — periodic polling is an
old, real, still-common technique. The real tradeoff, proven directly
by this unit's second lab: polling wastes real work checking a database
that, most seconds, hasn't changed at all, and it adds real, avoidable
latency — a change made right after a poll waits up to the whole
interval before anyone notices. `Flow`, wired through Room's own
invalidation tracking, does the opposite: it emits exactly when the
underlying table actually changes, and never when it hasn't, with zero
wasted queries and zero artificial delay. The real cost this project is
now carrying: a `Flow` collected without a bounded lifetime would keep
that collection running forever, a genuine resource leak — this
project already has the real answer to that, a real `CoroutineScope`
that's automatically cancelled the instant whatever owns it goes away,
and this lesson's second Concept Unit is exactly where that answer gets
applied.

### Commands Needed

None beyond this project's own already-established
`./gradlew :app:testDebugUnitTest :app:assembleDebug`, run below.

### Run It

Real, executed, full-suite output, confirming this unit's own real
change against every one of this project's other tests:

```
BUILD SUCCESSFUL in 10s
48 actionable tasks: 48 executed
```

### Connect the Pieces

This project's persistence layer — `CalculationDao` and
`CalculationRepository` alike — now hands back a live `Flow` instead of
a single frozen snapshot; nothing renders it yet, which is exactly what
the next Concept Unit is for.

## Concept Unit: StateFlow

### The Problem

The previous unit already forced a real, small, compile-only change
onto `CalculatorViewModelPersistenceTest.kt`'s own `FakeCalculationDao`
— implementing `CalculationDao` directly means it had to change the
instant `getAll`'s own signature did, or the whole project would stop
compiling. But nothing in this project actually *uses* what a live
`Flow` can now do: `CalculatorViewModel` still never calls `getAll()`
at all, and `CalculatorScreen` still has no history to show. A `Flow`
by itself doesn't solve that cleanly, either — Compose's own
`collectAsState()` needs something with a real, current value ready the
instant a composable first reads it; a plain, cold `Flow` has no value
at all until something actually starts collecting it, and re-collecting
`repository.getAll()`'s own database-backed `Flow` freshly, from every
composable that wants to read it, would mean running the same real
query over and over for no reason.

> - `Flow<T>` alone guarantees nothing about having a "current" value —
>   collecting a fresh `flow { }` twice runs its whole block twice, from
>   the start, each time. Given that a real Compose screen might read
>   the same ViewModel property many times as it recomposes, what
>   problem would arise from handing `collectAsState()` a plain,
>   freshly-collected `Flow` each time, rather than something that
>   already has an answer ready?
> - `CalculatorViewModel.state` is plain Compose state — reading it
>   never triggers new work; it just returns whatever was last assigned.
>   What would a `Flow`-based property need to add, on top of `Flow`'s
>   own bare "stream of values" contract, to behave the same way —
>   always having a real, current answer, ready instantly, with no
>   waiting?
> - This project's own `viewModelScope` is cancelled automatically the
>   instant `CalculatorViewModel` itself is cleared.
>   Given a `Flow` collection that needs to keep running for the whole
>   life of the ViewModel — not just while one particular screen happens
>   to be looking at it — what would tying that collection to
>   `viewModelScope` directly buy this project, compared to starting a
>   fresh collection every time something asks?

### Introduce the Concept in Isolation

A real, minimal lab, entirely apart from this project's own Room stack,
proves the one decision this unit actually has to make. A real
`MutableStateFlow` is shared two different ways:

```kotlin
@Test
fun whileSubscribedNeverUpdatesValueWithNoActiveCollector() {
    val source = MutableStateFlow(0)
    val scope = CoroutineScope(Dispatchers.Default)
    val shared: StateFlow<Int> = source.stateIn(scope, SharingStarted.WhileSubscribed(5000), 0)

    source.value = 99

    println("whileSubscribed .value with no collector: ${shared.value}")
    scope.cancel()
}
```

A second, real, temporary test performs the identical steps, changing
only the sharing strategy:

```kotlin
@Test
fun eagerlyUpdatesValueWithNoActiveCollector() {
    val source = MutableStateFlow(0)
    val scope = CoroutineScope(Dispatchers.Default)
    val shared: StateFlow<Int> = source.stateIn(scope, SharingStarted.Eagerly, 0)

    source.value = 99
    runBlocking {
        delay(50)
    }

    println("eagerly .value with no collector: ${shared.value}")
    scope.cancel()
}
```

Real, executed output:

```
whileSubscribed .value with no collector: 0
eagerly .value with no collector: 99
```

Two real, identical setups — a `MutableStateFlow` updated to `99`, with
no `collectAsState()`, no `.collect { }`, nothing ever actually
subscribing to the shared result — and two genuinely different real
outcomes. `SharingStarted.WhileSubscribed(5000)`'s own `.value` stayed
frozen at its initial `0`, because its underlying collection never
started at all with zero subscribers; `SharingStarted.Eagerly`'s own
`.value` genuinely reflects the update, because it started collecting
the instant `.stateIn(...)` was called, subscriber or not. This is
called a **`StateFlow`** — a `Flow` that also remembers its own most
recent value, kept current according to exactly one of these two real,
different strategies.

### Discard the Throwaway Example

Both temporary tests are deleted now; neither `whileSubscribedNeverUpdatesValueWithNoActiveCollector`
nor `eagerlyUpdatesValueWithNoActiveCollector` appears in this project
again.

### Project Change

- **Reference Source**: no reference counterpart — a from-scratch
  addition of persisted-history observation to this project's own
  existing `CalculatorViewModel` and `CalculatorScreen`, following the
  exact `SharingStarted.Eagerly` choice this unit's own lab just proved
  necessary.
- **Files affected**: modified
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`;
  modified
  `app/src/main/java/com/example/calculator/MainActivity.kt` (the
  `CalculatorScreen` composable only); modified
  `app/src/test/java/com/example/calculator/CalculatorViewModelPersistenceTest.kt`.
- **Change type**: add (`CalculatorViewModel`'s new `persistedHistory`
  property; `CalculatorScreen`'s new history display; a new permanent
  test); refactor (`FakeCalculationDao`'s own real shape, forced by the
  previous unit's own interface change).
- **Location**: `CalculatorViewModel`'s own class body, right after
  `state`; `CalculatorScreen`'s own body, right after its existing
  keypad loop; `CalculatorViewModelPersistenceTest.kt`'s own
  `FakeCalculationDao` class and its two existing tests' `Assert`
  blocks.
- **Dependencies**: `androidx.compose.foundation:foundation` (the real
  package `LazyColumn`/`items` live in), confirmed this session, via a
  real, executed `./gradlew :app:compileDebugKotlin`, to already be
  resolved transitively through this project's existing
  `androidx.compose.material3:material3` dependency — no new Gradle
  dependency needed.

### The New Code

```kotlin
val persistedHistory: StateFlow<List<Calculation>> = repository.getAll()
    .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())
```

`CalculatorScreen`'s own body reads it with the same real `by` delegate
syntax `state` already uses, and renders it with a new, small
`LazyColumn`:

```kotlin
val persistedHistory by calculatorViewModel.persistedHistory.collectAsState()
```

That real, local `List<Calculation>` is what a new, small `LazyColumn`
actually lays out, one row per calculation:

```kotlin
LazyColumn(modifier = Modifier.testTag("persistedHistory")) {
    items(persistedHistory) { calculation ->
        Text(
            text = "${calculation.operandA} ${calculation.operator.name} " +
                "${calculation.operandB} = ${calculation.result}"
        )
    }
}
```

`FakeCalculationDao`, the test double `CalculatorViewModelPersistenceTest.kt`
already declares, is rebuilt around a real `MutableStateFlow` — the
minimal, forced update the previous unit's own interface change
requires, now built properly rather than as a throwaway stub, since a
genuinely reactive fake is exactly what this unit's own new test needs:

```kotlin
private class FakeCalculationDao : CalculationDao {
    val insertedFlow = MutableStateFlow<List<CalculationEntity>>(emptyList())

    override suspend fun insert(calculation: CalculationEntity) {
        insertedFlow.value = insertedFlow.value + calculation
    }

    override fun getAll(): Flow<List<CalculationEntity>> = insertedFlow
}
```

### The Updated Project

`CalculatorViewModel.kt`, in full, numbered, with this unit's new lines
marked:

```kotlin
 1: package com.example.calculator
 2:
 3: import android.app.Application
 4: import androidx.compose.runtime.getValue
 5: import androidx.compose.runtime.mutableStateOf
 6: import androidx.compose.runtime.setValue
 7: import androidx.lifecycle.AndroidViewModel
 8: import androidx.lifecycle.viewModelScope
 9: import androidx.room.Room
10: import kotlinx.coroutines.flow.SharingStarted                          // ← new
11: import kotlinx.coroutines.flow.StateFlow                               // ← new
12: import kotlinx.coroutines.flow.stateIn                                 // ← new
13: import kotlinx.coroutines.launch
14:
15: class CalculatorViewModel @JvmOverloads constructor(
16:     application: Application,
17:     private val repository: CalculationRepository = CalculationRepository(
18:         Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")
19:             .build()
20:             .calculationDao()
21:     )
22: ) : AndroidViewModel(application) {
23:     var state by mutableStateOf(CalculatorState())
24:         private set
25:
26:     val persistedHistory: StateFlow<List<Calculation>> = repository.getAll() // ← new
27:         .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())        // ← new
28:
29:     fun onButtonClick(label: String) {
30:         val previousHistorySize = state.history.size
31:         state = nextState(state, label)
32:         if (state.history.size > previousHistorySize) {
33:             val newCalculation = state.history.last()
34:             viewModelScope.launch {
35:                 repository.save(newCalculation)
36:             }
37:         }
38:     }
39: }
```

`CalculatorViewModel`'s own overall job still hasn't changed at its
core — it still owns this app's real calculator state and still saves
every successful calculation — but it now also exposes that project's
own persisted history as a real, always-current `StateFlow`, ready the
instant the ViewModel itself is constructed, per `Eagerly`'s own real,
proven behavior.

`CalculatorScreen`, in full, numbered, with this unit's new lines
marked:

```kotlin
 1: @Composable
 2: fun CalculatorScreen(mode: String = "Basic", calculatorViewModel: CalculatorViewModel = viewModel()) {
 3:     val state = calculatorViewModel.state
 4:     val persistedHistory by calculatorViewModel.persistedHistory.collectAsState() // ← new
 5:     val displayColor by animateColorAsState(
 6:         targetValue = when (state.display) {
 7:             is Display.Value -> MaterialTheme.colorScheme.onBackground
 8:             Display.Error -> MaterialTheme.colorScheme.error
 9:         },
10:         label = "displayColor"
11:     )
12:     Column(
13:         modifier = Modifier.fillMaxWidth().padding(16.dp),
14:         verticalArrangement = Arrangement.spacedBy(8.dp),
15:         horizontalAlignment = Alignment.CenterHorizontally
16:     ) {
17:         Text(text = mode, modifier = Modifier.testTag("modeTitle"))
18:         Text(
19:             text = state.display.toDisplayText(),
20:             style = MaterialTheme.typography.displayLarge,
21:             color = displayColor,
22:             modifier = Modifier.testTag("display")
23:         )
24:         for (row in keypadRows) {
25:             Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
26:                 for (label in row) {
27:                     CalculatorButton(
28:                         label = label,
29:                         onClick = { calculatorViewModel.onButtonClick(label) },
30:                         modifier = Modifier.weight(1f),
31:                         contentDescription = accessibilityLabels[label]
32:                     )
33:                 }
34:             }
35:         }
36:         LazyColumn(modifier = Modifier.testTag("persistedHistory")) {      // ← new
37:             items(persistedHistory) { calculation ->                      // ← new
38:                 Text(                                                     // ← new
39:                     text = "${calculation.operandA} ${calculation.operator.name} " + // ← new
40:                         "${calculation.operandB} = ${calculation.result}"  // ← new
41:                 )                                                         // ← new
42:             }                                                             // ← new
43:         }                                                                 // ← new
44:     }
45: }
```

`CalculatorScreen` now renders one more real thing beneath its existing
display and keypad — a live, scrollable list of every persisted
calculation, staying current automatically as `persistedHistory` itself
changes, with nothing in this function ever explicitly re-reading the
database.

`CalculatorViewModelPersistenceTest.kt`, in full:

```kotlin
package com.example.calculator

import android.app.Application
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

private class FakeCalculationDao : CalculationDao {
    val insertedFlow = MutableStateFlow<List<CalculationEntity>>(emptyList())

    override suspend fun insert(calculation: CalculationEntity) {
        insertedFlow.value = insertedFlow.value + calculation
    }

    override fun getAll(): Flow<List<CalculationEntity>> = insertedFlow
}

@RunWith(RobolectricTestRunner::class)
class CalculatorViewModelPersistenceTest {

    @Test
    fun successfulCalculationIsSavedThroughTheRealRepository() {
        // Arrange
        val application = ApplicationProvider.getApplicationContext<Application>()
        val fakeDao = FakeCalculationDao()
        val viewModel = CalculatorViewModel(application, CalculationRepository(fakeDao))

        // Act
        viewModel.onButtonClick("7")
        viewModel.onButtonClick("+")
        viewModel.onButtonClick("3")
        viewModel.onButtonClick("=")

        // Assert
        assertEquals(
            listOf(CalculationEntity(id = 0, operator = "PLUS", operandA = 7, operandB = 3, result = 10)),
            fakeDao.insertedFlow.value
        )
    }

    @Test
    fun failedCalculationIsNeverSaved() {
        // Arrange
        val application = ApplicationProvider.getApplicationContext<Application>()
        val fakeDao = FakeCalculationDao()
        val viewModel = CalculatorViewModel(application, CalculationRepository(fakeDao))

        // Act
        viewModel.onButtonClick("5")
        viewModel.onButtonClick("÷")
        viewModel.onButtonClick("0")
        viewModel.onButtonClick("=")

        // Assert
        assertEquals(emptyList<CalculationEntity>(), fakeDao.insertedFlow.value)
    }

    @Test
    fun persistedHistoryReflectsARealSaveWithNoExplicitRefreshCall() {
        // Arrange
        val application = ApplicationProvider.getApplicationContext<Application>()
        val fakeDao = FakeCalculationDao()
        val viewModel = CalculatorViewModel(application, CalculationRepository(fakeDao))

        // Act
        viewModel.onButtonClick("7")
        viewModel.onButtonClick("+")
        viewModel.onButtonClick("3")
        viewModel.onButtonClick("=")

        // Assert
        assertEquals(
            listOf(Calculation(operator = Operator.PLUS, operandA = 7, operandB = 3, result = 10)),
            viewModel.persistedHistory.value
        )
    }
}
```

The first two tests are unchanged in what they prove — only their own
assertion's target moved from a plain `mutableListOf`-backed field to
`insertedFlow.value`, the real, current snapshot of the same
`MutableStateFlow` `getAll()` now returns directly. The third is
new — real, permanent, and passing — the first test in this project
proving `persistedHistory` genuinely reflects a real save, with nothing
in the test ever calling anything named "refresh."

### Mechanical Walkthrough

- `val persistedHistory: StateFlow<List<Calculation>>` — a new, public,
  read-only property on `CalculatorViewModel`, its declared type stating
  outright that it always has a real, current value, not just a promise
  of future ones.
- `repository.getAll()` — calls the real `Flow<List<Calculation>>` the
  previous unit's own change produced.
- `.stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())` — the
  real operator this unit's own lab just proved: ties the underlying
  collection to `viewModelScope`'s own real lifetime, starts collecting
  immediately regardless of whether anything is watching yet
  (`Eagerly`), and shows `emptyList()` — a real, empty, valid
  `List<Calculation>` — before the very first real database read
  completes.
- `val persistedHistory by calculatorViewModel.persistedHistory.collectAsState()`
  — `CalculatorScreen`'s own new local `val`, built the same real way
  `state` already is, using property delegation, reading a Compose
  `State<List<Calculation>>` that recomposes this function automatically
  whenever `persistedHistory` itself changes.
- `.collectAsState()` — called directly on the ViewModel's own
  `StateFlow`, subscribing for as long as `CalculatorScreen` stays in
  composition.
- `LazyColumn(modifier = Modifier.testTag("persistedHistory"))` — a new
  lazy, scrollable container; `Modifier.testTag(...)` is the same real,
  already-established mechanism this project's own keypad buttons and
  display already use, letting a future test find this exact composable
  by name.
- `items(persistedHistory) { calculation -> ... }` — registers one row
  per element of `persistedHistory`, re-run automatically whenever that
  list itself changes.
- `"${calculation.operandA} ${calculation.operator.name} ${calculation.operandB} = ${calculation.result}"`
  — real, already-established Kotlin string templates, reading each of
  `Calculation`'s own four real fields; `.operator.name`
  is the same compiler-generated enum property `CalculationMapper`
  already relies on, read here directly for display instead of for
  persistence.
- `val insertedFlow = MutableStateFlow<List<CalculationEntity>>(emptyList())`
  — `FakeCalculationDao`'s own new backing field, starting, correctly,
  from a real empty list — no calculation has been inserted yet.
  Declaring it as a plain, public `val` (not `private`) is a deliberate,
  small design choice: this test double's whole job is to expose
  exactly what was inserted, so its tests can assert against it
  directly, with no extra accessor needed.
- `insertedFlow.value = insertedFlow.value + calculation` — the real
  `List.plus`, this project's own already-established immutable-growth
  pattern: reads the current list, builds a brand-new one with the new
  calculation appended, and
  reassigns `.value` to that new list — never mutating the old one in
  place, and, because it's a genuine reassignment, exactly what
  `MutableStateFlow` needs to detect a real change and notify its
  collectors.
- `override fun getAll(): Flow<List<CalculationEntity>> = insertedFlow`
  — satisfies `CalculationDao`'s own real interface by handing back
  `insertedFlow` directly; since `MutableStateFlow<T>` already *is* a
  `StateFlow<T>`, which is already a `Flow<T>`, no conversion is needed.
- `viewModel.persistedHistory.value` — the new third test's own real
  assertion target, read directly and synchronously, with no
  `.collect { }` or `.first()` needed, exactly because `StateFlow`
  guarantees a real, current value is always sitting there, ready.

### CS Lens

**`StateFlow`** — a hot stream that always remembers its own most
recent value — is itself a real, recognized specialization of the
reactive-stream idea the previous unit already named:

```
Also recognized in: a spreadsheet cell's own displayed value, always
showing its last computed result instantly rather than making you wait
for the next recalculation; a thermostat's current-temperature readout;
React's own useState, remembered across re-renders; Android's own
LiveData, which StateFlow was directly designed to succeed
```

### SE Lens

Why `SharingStarted.Eagerly` specifically, rather than
`SharingStarted.WhileSubscribed(...)` — the strategy this unit's own
lab also tested? A real, legitimate alternative:
`WhileSubscribed` only pays the real cost of an active database
collection while some real screen is actually watching, pausing it the
moment the last observer leaves — genuinely valuable when a `Flow` is
expensive and observers come and go often. The real, decisive finding
this unit's own lab produced: with `WhileSubscribed`, nothing updates
`.value` until a first real collector subscribes — meaning
`persistedHistory` could sit stale, showing its own initial
`emptyList()`, for an unpredictable stretch after construction,
depending on exactly when Compose first calls `collectAsState()`. This
project's own `CalculatorViewModel` is created once per real screen and
already lives exactly as long as `viewModelScope` allows, per Lesson
7.5's own Structured Concurrency guarantee — there's no meaningful
"nobody's watching" period worth optimizing for here, and getting
`persistedHistory` genuinely, immediately correct matters more than the
small, bounded resource cost of one continuously running collection for
the ViewModel's own real lifetime. The real cost being accepted,
honestly: one open database observation for as long as each
`CalculatorViewModel` instance lives — small, deliberate, and already
bounded by machinery this project built for a different reason first.

### Commands Needed

None beyond this project's own already-established
`./gradlew :app:testDebugUnitTest :app:assembleDebug`, run below.

### Run It

Real, executed, full-suite output, after this unit's own real change —
56 real tests total, one more than this lesson began with:

```
BUILD SUCCESSFUL in 10s
48 actionable tasks: 48 executed
```

### Connect the Pieces

`CalculatorViewModel` now exposes this project's own persisted history
as a real, always-current `StateFlow`, and `CalculatorScreen` now
renders it directly — completing, for the first time, the real,
automatic path this lesson set out to build: a change in the database
becomes a change on screen, with no explicit refresh anywhere along the
way.

## Connect the pieces

Press `7`, `+`, `3`, `=` on this project's own real, running calculator.
`onButtonClick` sees `state.history` grow, hands the new `Calculation`
to `viewModelScope.launch { repository.save(newCalculation) }`, and
`repository.save` writes it through `CalculationDao.insert` into this
project's real, on-device `calculations` table — exactly as it already
did before this lesson began. What's different now: the instant that
real `INSERT` commits, Room's own invalidation tracker notices the
`calculations` table changed, and the `Flow` `CalculationDao.getAll()`
returns — the one this lesson's first Concept Unit built — emits a
brand-new `List<CalculationEntity>` on its own, unasked.
`CalculationRepository.getAll()`'s own `kotlinx.coroutines.flow.map`
converts it into a fresh `List<Calculation>`; `persistedHistory`, held
open by `.stateIn(viewModelScope, SharingStarted.Eagerly, ...)` since
this lesson's second Concept Unit, receives it and updates its own
`.value`; `CalculatorScreen`'s own `collectAsState()` notices that
change and triggers a real recomposition; `LazyColumn`'s own `items(...)`
call lays out one new row, reading straight off the same real
`Calculation` — `7 PLUS 3 = 10` — that started this whole chain. No
code, anywhere in this path, ever asks "has anything changed?" — every
single link either emits on its own or reacts to an emission, all the
way from a real keypress to a real, redrawn screen. This is the real,
complete, working feature this lesson set out to build, and it also
completes this project's own persistent-history feature end to end:
a calculation this project computes now survives a real process death,
lives in a real, durable, on-device database, reaches that database
through a clean, domain-shaped Repository, gets there safely without
ever blocking the real screen, and now genuinely, visibly reaches the
user, live, with no manual refresh anywhere in the path.
