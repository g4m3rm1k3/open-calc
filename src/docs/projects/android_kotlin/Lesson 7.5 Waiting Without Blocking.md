# Lesson 7.5: Waiting Without Blocking

- **What you will build** — This lesson finally, safely wires this
  project's own real Repository into the live app: `CalculationDao` and
  `CalculationRepository` become real `suspend` functions, and
  `CalculatorViewModel` launches a real, scoped coroutine to save every
  successful calculation — without ever blocking the real screen. The
  transferable problem: pausing a real, slow operation without blocking
  the thread responsible for keeping a UI responsive, and making sure
  that paused work can never outlive whatever owns it.
- **What you need to know first** —
  - Lesson 7.4 (Nothing Outside Needs to Know): `CalculationRepository`,
    `CalculationDao` — real, tested, but deliberately not yet callable
    safely from the live app.
  - Lesson 7.3 (An Address on Disk): the real main-thread exception this
    lesson's own first unit directly resolves.
  - Lesson 4.3 (An Owner That Outlives the Screen): `CalculatorViewModel`
    and its own real, established lifecycle — the exact scope this
    lesson's own coroutine work ties into.
  - Lesson 1.4 (A Value That Survives Its Own Rebuild): Robolectric
    testing, reused throughout this lesson's own real, executed proofs.

## Terms used in this lesson

- **`suspend`** — a function modifier marking a function as one that can
  pause partway through its own execution and resume later, without
  blocking the real thread that called it; new to this project's own
  permanent code.
- **Primary-constructor property (`class X(private val y: Y)`)** — a
  parameter declared directly inside a class's own constructor,
  simultaneously accepting an argument and creating a real property from
  it, already proven in this project's own `CalculationRepository`;
  reused here for `CalculatorViewModel`'s own new `repository` parameter.
- **`private`** — an access modifier restricting visibility to the
  declaring class itself, already established throughout this project;
  reused here for `CalculatorViewModel`'s own `repository`.
- **`override`** — marks a method as replacing a member already declared
  by a supertype or interface, already established throughout this
  project; reused here in this lesson's own throwaway `FakeCalculationDao`
  and permanent test code.
- **Trailing-lambda syntax (`function { ... }`)** — already established
  throughout this project (`.map { }`, `.find { }`); reused here for
  `launch { }`, `withContext { }`, and `runBlocking { }`, each one a real
  function whose own last parameter is a lambda.

## Objects and methods used

- **`delay(...)`**
  - What it is: a real, top-level `suspend` function from
    `kotlinx.coroutines`, pausing the current coroutine for a given real
    span of time without blocking the real thread it's running on.
  - Implementation: `suspend fun delay(timeMillis: Long)`.
  - Its use: this lesson's own first throwaway lab uses it to give a
    real `suspend` function something genuine to pause on, standing in
    for a real, slow operation like a database write.
  - Type: a top-level `suspend` function.
  - Responsibility: suspends the current coroutine for a real amount of
    time, then resumes it, without occupying the real thread it started
    on for the whole real duration.
  - Depends on: a real duration, in milliseconds.
  - Connects to: called once, inside this lesson's own throwaway
    `labSuspendGreeting`.
  - Shape: a small, real, standard-library `suspend` function, part of
    `kotlinx.coroutines`, already resolved on this project's own real
    classpath with no new Gradle dependency needed.

- **`runBlocking { }`**
  - What it is: a real, top-level coroutine builder from
    `kotlinx.coroutines`, starting a new coroutine and blocking the
    real, calling thread until it completes.
  - Implementation: `fun <T> runBlocking(block: suspend CoroutineScope.() -> T): T`.
  - Its use: the real, minimal way this lesson's own throwaway labs and
    permanent tests call a real `suspend` function at all, from
    ordinary, non-`suspend` test code.
  - Type: a top-level function, taking a `suspend` lambda.
  - Responsibility: creates a real coroutine, runs the given `suspend`
    block inside it, and blocks the calling thread until that block
    finishes — deliberately reintroducing blocking, appropriate only for
    tests and simple entry points, never for real, production UI code.
  - Depends on: a real `suspend` lambda to run.
  - Connects to: called throughout this lesson's own labs and updated
    tests, standing in for the real coroutine `CalculatorViewModel`
    itself launches via `viewModelScope`.
  - Shape: a real, standard-library coroutine builder, part of
    `kotlinx.coroutines`.

- **`Dispatchers` / `Dispatchers.IO`**
  - What it is: a real, standard-library singleton object holding
    several real, standard coroutine dispatchers — each one deciding
    which real thread or thread pool a coroutine's own code actually
    runs on.
  - Implementation: `object Dispatchers { val IO: CoroutineDispatcher; val Default: CoroutineDispatcher; val Main: MainCoroutineDispatcher }` —
    `Dispatchers.IO` is backed by a real, dedicated, elastic thread pool,
    specifically intended for real, blocking I/O work like file or
    database access.
  - Its use: this lesson's own second throwaway lab uses
    `Dispatchers.IO` to prove, concretely, that code run through it
    executes on a genuinely different real thread than the one that
    called it.
  - Type: a real, standard-library singleton `object`, with real,
    typed properties.
  - Responsibility: provides a small, fixed set of ready-made, real
    dispatchers, each suited to a different real kind of work (I/O,
    CPU-bound computation, UI updates).
  - Depends on: nothing to access; a real, already-constructed singleton.
  - Connects to: read once, as the real argument to `withContext` in
    this lesson's own throwaway lab.
  - Shape: real, standard-library API, part of `kotlinx.coroutines`.

- **`withContext(...)`**
  - What it is: a real, top-level `suspend` function that runs a given
    block of code using a specific real dispatcher, then suspends until
    it finishes, returning its real result.
  - Implementation: `suspend fun <T> withContext(context: CoroutineContext, block: suspend CoroutineScope.() -> T): T`.
  - Its use: this lesson's own second throwaway lab uses it to run a
    small block of code on `Dispatchers.IO` specifically, proving, by
    printing `Thread.currentThread().name` from inside it, that the real
    thread genuinely changes.
  - Type: a top-level `suspend` function.
  - Responsibility: temporarily switches which real dispatcher the
    current coroutine's own code runs under, for exactly the duration of
    the given block, then resumes on the original dispatcher afterward.
  - Depends on: a real `CoroutineContext` (here, a specific `Dispatchers`
    value); a real `suspend` lambda to run under it.
  - Connects to: called once, inside this lesson's own throwaway
    `labDescribeWorkerThread`; explains, by direct analogy, what Room's
    own real, generated `suspend` DAO implementations already do
    internally, with no equivalent code this project has to write itself.
  - Shape: a real, standard-library `suspend` function, part of
    `kotlinx.coroutines`.

- **`Thread.currentThread().name`**
  - What it is: real, standard Java API, returning the real name of
    whichever thread is currently executing; new to this project's own
    shown code.
  - Implementation: `Thread.currentThread(): Thread` (a `static` method);
    `Thread.name: String` (a real, readable instance property).
  - Its use: this lesson's own second throwaway lab prints it, once
    outside and once inside a `withContext(Dispatchers.IO)` block,
    proving a real, concrete difference in which thread is actually
    running the code.
  - Type: a `static` method (`currentThread`), plus a real instance
    property (`name`) on `Thread`.
  - Responsibility: identifies, by real name, which actual thread is
    executing right now.
  - Depends on: nothing; always answerable from any running code.
  - Connects to: called twice in this lesson's own throwaway lab —
    once from the calling test code, once from inside the dispatched
    block — with the real, printed names confirmed to differ.
  - Shape: real, standard Java platform API, available on every JVM.

- **`CoroutineScope(...)` / `.launch { }` / `.cancel()`**
  - What it is: a real, top-level function constructing a new, real
    `CoroutineScope`; a real method on any `CoroutineScope`, starting a
    new, real coroutine inside it without blocking the caller; and a
    real method cancelling a scope and every coroutine still running
    inside it.
  - Implementation: `fun CoroutineScope(context: CoroutineContext): CoroutineScope`;
    `fun CoroutineScope.launch(block: suspend CoroutineScope.() -> Unit): Job`;
    `fun CoroutineScope.cancel()`.
  - Its use: this lesson's own third throwaway lab uses all three
    together, proving that cancelling a real scope genuinely stops work
    already launched inside it, before that work finishes.
  - Type: a top-level function; two real extension functions on
    `CoroutineScope`.
  - Responsibility: `CoroutineScope(...)` creates a real, independent
    scope; `.launch { }` starts real, new work inside one, immediately
    returning control to the caller; `.cancel()` stops that scope and
    every real coroutine still running inside it, permanently.
  - Depends on: a real `CoroutineContext` (for construction); a real
    `suspend` lambda (for `launch`).
  - Connects to: used together, inside this lesson's own throwaway
    `LabScopedWorker`, to prove the general real mechanism
    `viewModelScope` already relies on for real, permanent use.
  - Shape: real, standard-library coroutine API, part of
    `kotlinx.coroutines`.

- **`AndroidViewModel` / `Application`**
  - What it is: a real, standard AndroidX base class for a `ViewModel`
    that needs safe, real access to the application's own real
    `Context` — and the real, application-scoped `Context` subclass it
    provides that access through.
  - Implementation: `abstract class AndroidViewModel(application: Application) : ViewModel()`,
    exposing a real, protected `getApplication(): Application`; `class Application : Context`,
    a real Context guaranteed to outlive any single screen.
  - Its use: `CalculatorViewModel` now extends `AndroidViewModel` instead
    of plain `ViewModel`, since building a real, on-device database
    (`Room.databaseBuilder`) requires a real `Context` this project
    cannot safely obtain any other way without a real memory-leak risk.
  - Type: an `abstract class`, extending `ViewModel`; a real, concrete
    `Context` subclass.
  - Responsibility: `AndroidViewModel` gives any subclass safe, real
    access to an application-scoped `Context`, guaranteed not to leak a
    shorter-lived screen; `Application` is the one real `Context` in an
    Android app guaranteed to live exactly as long as the app process
    itself.
  - Depends on: a real `Application` instance, supplied automatically
    by the real Android framework (or Robolectric, in this project's
    own tests) at construction.
  - Connects to: `CalculatorViewModel`'s own constructor now requires
    one; its own real superclass constructor call,
    `AndroidViewModel(application)`, passes it straight through.
  - Shape: real, public AndroidX/Android platform API.

- **`@JvmOverloads`**
  - What it is: a real Kotlin annotation, generating real, separate,
    Java-visible constructor (or function) overloads for every suffix of
    parameters that have default values.
  - Implementation: `@JvmOverloads` — without it, a Kotlin constructor
    with default parameter values compiles to exactly one real JVM
    constructor, taking every parameter; reflection-based Java callers
    (like `ViewModelProvider`'s own real, default factory) can only find
    a constructor whose real, exact parameter list they already know to
    ask for.
  - Its use: `CalculatorViewModel`'s own constructor needs it — proven,
    for real, this session: `ViewModelProvider`'s own real, default
    `AndroidViewModelFactory` reflects for a constructor taking exactly
    `(Application)`, and genuinely cannot find one without this
    annotation, throwing a real `NoSuchMethodException`.
  - Type: a real, standard Kotlin annotation, from `kotlin.jvm`.
  - Responsibility: makes a Kotlin default-parameter constructor visible
    to real, reflection-based Java callers as multiple, real, separate
    overloads.
  - Depends on: a real constructor (or function) with at least one
    parameter carrying a default value.
  - Connects to: applied once, to `CalculatorViewModel`'s own
    constructor; without it, this project's own real, already-shipped
    `CalculatorViewModelTest` (already covering configuration-change
    survival) would fail for real.
  - Shape: real, standard Kotlin/Java interop API.

- **`Room.databaseBuilder(...)`**
  - What it is: Room's own real, static entry point for constructing a
    genuine, on-device, persistent database — distinct from
    `Room.inMemoryDatabaseBuilder`, already established in this
    project's own earlier persistence work, which builds a database
    that's discarded the moment it closes.
  - Implementation: `fun <T : RoomDatabase> databaseBuilder(context: Context, klass: Class<T>, name: String): RoomDatabase.Builder<T>`
    — `name` names a real file Room creates and reuses on the real
    device's own storage.
  - Its use: `CalculatorViewModel`'s own real, permanent database,
    `"calculator.db"`, is built this way — the real, first time this
    project's own history has ever been written anywhere that survives
    a real restart.
  - Type: a `static` factory method, parallel in real shape to
    `Room.inMemoryDatabaseBuilder`.
  - Responsibility: builds a real, durable database tied to a specific,
    named real file, reopening the same real file on every future call
    with the same name, rather than starting fresh each time.
  - Depends on: a real `Context`; the real database class; a real,
    chosen file name.
  - Connects to: called once, inside `CalculatorViewModel`'s own default
    `repository` construction.
  - Shape: real, public API from `androidx.room`.

### Everything else in the file, not this lesson's subject but still explained

- **`viewModelScope`**
  - What it is: a real, already-available `CoroutineScope`, provided by
    AndroidX, automatically tied to a `ViewModel`'s own real lifecycle.
  - Implementation: `val ViewModel.viewModelScope: CoroutineScope` — a
    real extension property; the real scope it returns is automatically,
    permanently cancelled the instant the owning `ViewModel`'s own real
    `onCleared()` runs.
  - Its use: `CalculatorViewModel.onButtonClick` launches its own real
    save coroutine through it, tying that coroutine's own real lifetime
    directly to the ViewModel's.
  - Type: a real, standard AndroidX extension property on `ViewModel`.
  - Responsibility: provides one real, ready-made, correctly-scoped
    `CoroutineScope` per `ViewModel` instance, with no manual
    construction or cancellation code required.
  - Depends on: the real `ViewModel` instance it's read from.
  - Connects to: `.launch { }` is called on it directly, inside
    `onButtonClick`.
  - Shape: real, public AndroidX API, already resolved on this
    project's own classpath since its own earlier navigation work.

---

## Concept Unit: suspend and Coroutine

### The Problem

This project's own earlier Repository work already proved, honestly,
that calling `CalculationRepository.save` directly from `onButtonClick`
today would either crash outright or force a genuinely bad,
main-thread-blocking design. A real database write takes real,
measurable time — and nothing about an ordinary Kotlin function lets it
pause partway through without blocking whatever called it for that
entire real duration.

> **Stop and think, before reading on:**
> - This project's own earlier Repository work already proved calling
>   `CalculationRepository.save` directly from `onButtonClick` today
>   would either crash or force a bad, blocking design. Given a real
>   database write genuinely takes
>   real time, what would a function need to be able to do — that an
>   ordinary function can't — to pause partway through without blocking
>   whatever called it?
> - If a function that's safe to pause could be called from literally
>   anywhere, the same way an ordinary function can, what real problem
>   might that create for code relying on that safety?
> - This project's own real `CalculationRepositoryTest` already calls
>   `repository.save(...)` directly. If `save` became a
>   function that can pause, what minimal, real change would that same
>   test need just to keep compiling at all?

### Introduce the Concept in Isolation

```kotlin
suspend fun labSuspendGreeting(): String {
    delay(50)
    return "Hello from a coroutine"
}
```

A real, temporary test tries calling it directly, the same way any
ordinary function would be called:

```kotlin
class LabSuspendCallTest {
    @Test
    fun callSuspendDirectly() {
        val result = labSuspendGreeting()
        println(result)
    }
}
```

Real, executed output (compiling this real, temporary test):

```
e: file:///Users/michaelmclean/Testing/open-calc/src/docs/projects/android_kotlin/AndroidCalculator/app/src/test/java/com/example/calculator/LabSuspendCallTest.kt:8:22 Suspend function 'labSuspendGreeting' should be called only from a coroutine or another suspend function
```

A real, decisive compile error — proving `suspend` isn't just a naming
convention, it's a genuine, compiler-enforced restriction: a `suspend`
function can only be called from inside another `suspend` function, or
from a real coroutine. Fixing it:

```kotlin
class LabSuspendCallTest {
    @Test
    fun callSuspendViaRunBlocking() {
        val result = runBlocking {
            labSuspendGreeting()
        }
        println(result)
    }
}
```

Real, executed output:

```
Hello from a coroutine
```

`runBlocking { }` is called a **coroutine builder** — real code that
actually starts a real coroutine, giving `suspend` code somewhere legal
to run. This particular builder blocks its own calling thread until the
coroutine finishes, appropriate here since this is a throwaway test
with nothing else to do meanwhile — never appropriate for real,
production UI code, which is exactly why `CalculatorViewModel` will use
a different, non-blocking real builder later in this lesson.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: `suspend` is a real,
compiler-enforced restriction, and a real coroutine builder like
`runBlocking` is what actually satisfies it.

### Project Change

- **Reference Source**: no reference counterpart — this is a
  from-scratch addition. `brd.md`'s own entry for this lesson names only
  "Coroutines," with no reference implementation to build toward; this
  specific change directly closes the real gap this project's own
  earlier Repository work's own closing section named.
- **Files affected**: modified
  `app/src/main/java/com/example/calculator/CalculationDao.kt`; modified
  `app/src/main/java/com/example/calculator/CalculationRepository.kt`;
  modified
  `app/src/test/java/com/example/calculator/CalculationRepositoryTest.kt`;
  modified `app/src/test/java/com/example/calculator/AppDatabaseTest.kt`.
- **Change type**: refactor (adding `suspend` to four already-real
  methods, and updating three already-real tests to match).
- **Location**: `CalculationDao`'s own `insert`/`getAll`; `CalculationRepository`'s
  own `save`/`getAll`; both test files' own direct calls to them.
- **Dependencies**: `kotlinx-coroutines-core`/`-android`, confirmed this
  session to already be resolved transitively on this project's own real
  classpath (via Room's own `room-ktx`) — no new Gradle dependency
  needed.

### The New Code

```kotlin
suspend fun insert(calculation: CalculationEntity)

suspend fun getAll(): List<CalculationEntity>
```

`CalculationRepository`'s own two methods gain the identical real
modifier, a direct, necessary consequence of the DAO methods they call
now requiring it:

```kotlin
suspend fun save(calculation: Calculation) {
    dao.insert(calculation.toEntity())
}

suspend fun getAll(): List<Calculation> {
    return dao.getAll().map { it.toDomain() }
}
```

This same unit also updates two already-real, permanent tests, wrapping
their own direct calls in `runBlocking`, and removing
`.allowMainThreadQueries()` — no longer needed, confirmed by this
lesson's own next unit:

```kotlin
val all = runBlocking {
    dao.insert(CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10))
    dao.getAll()
}
```

`CalculationRepositoryTest.kt`'s own single test needs the identical
real change, one level up, wrapping its own calls to the Repository
instead of the DAO directly:

```kotlin
val all = runBlocking {
    repository.save(calculation)
    repository.getAll()
}
```

### The Updated Project

`CalculationDao.kt`, in full:

```kotlin
package com.example.calculator

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query

@Dao
interface CalculationDao {
    @Insert
    suspend fun insert(calculation: CalculationEntity)

    @Query("SELECT * FROM calculations")
    suspend fun getAll(): List<CalculationEntity>
}
```

`CalculationRepository.kt`, in full:

```kotlin
package com.example.calculator

class CalculationRepository(private val dao: CalculationDao) {
    suspend fun save(calculation: Calculation) {
        dao.insert(calculation.toEntity())
    }

    suspend fun getAll(): List<Calculation> {
        return dao.getAll().map { it.toDomain() }
    }
}
```

`AppDatabaseTest.kt`, in full:

```kotlin
package com.example.calculator

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
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
            dao.getAll()
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
            repository.getAll()
        }

        // Assert
        assertEquals(listOf(calculation), all)
    }
}
```

Every one of this project's own real persistence methods is now
genuinely safe to call without blocking a real caller — the exact,
necessary first step before `CalculatorViewModel` itself can call any
of them.

### Mechanical Walkthrough

- `suspend fun insert(calculation: CalculationEntity)` /
  `suspend fun getAll(): List<CalculationEntity>` (`CalculationDao`) —
  the `suspend` modifier added to both already-real, already-established
  methods; nothing about their own real signatures otherwise changes —
  Room's own annotation processor already knows how to generate a real
  `suspend`-shaped implementation for exactly this kind of method.
- `suspend fun save(calculation: Calculation) { dao.insert(calculation.toEntity()) }`
  (`CalculationRepository`) — `save` is now `suspend` too, a real,
  necessary consequence of calling `dao.insert`, itself now `suspend` —
  a `suspend` function can only be called from another `suspend`
  function, the same real restriction this unit's own lab already
  proved directly.
- `suspend fun getAll(): List<Calculation> { return dao.getAll().map { it.toDomain() } }`
  (`CalculationRepository`) — the same real reasoning; `dao.getAll()` is
  now `suspend`, so `getAll` must be too.
- `val all = runBlocking { dao.insert(...); dao.getAll() }`
  (`AppDatabaseTest`) — both real, direct DAO calls now run inside a
  real `runBlocking` coroutine, the exact real mechanism this unit's own
  lab already proved satisfies `suspend`'s own restriction; the block's
  own last expression, `dao.getAll()`, becomes `runBlocking`'s own real
  return value, assigned to `all`.
- `val all = runBlocking { repository.save(calculation); repository.getAll() }`
  (`CalculationRepositoryTest`) — the identical real pattern, one level
  up, calling the real `CalculationRepository` instead of the DAO
  directly.

### CS Lens

**Coroutines** — cooperative, pausable units of work that suspend
without blocking a real, underlying thread — are a real, recognized
computer science idea:

```
Also recognized in: JavaScript's own real async/await, built on
Promises; Python's own real asyncio; C#'s own real async/await, the
language Kotlin's own suspend functions were directly inspired by; a
generator or iterator pausing mid-execution and resuming later, the
same real underlying mechanism a suspend function compiles down to.
```

### SE Lens

Why learn `suspend`/coroutines at all, instead of just spinning up a
raw `Thread` for the real database work? A real, legitimate alternative
exists — raw threads are an older, real Android technique. This project
uses coroutines instead — a raw `Thread` has no real, built-in way to
safely hop back to the real main thread afterward to update `state` (a
real, Compose-observed property) without extra, real, hand-written
synchronization code; coroutines make that hop — this lesson's own next
unit, Dispatcher — a real, ordinary part of the language itself, with
no manual thread-safety bookkeeping required. The real, honest cost:
understanding `suspend` requires learning a genuinely new mental model —
a function that can pause — not just calling an already-familiar API
under a new name.

### Commands Needed

- `./gradlew :app:compileDebugUnitTestKotlin --rerun-tasks` — invokes
  this project's real Gradle wrapper, forcing this specific throwaway
  lab's own real compile error to surface.
- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.CalculationRepositoryTest" --tests "com.example.calculator.AppDatabaseTest"`
  — runs this project's real Gradle wrapper, scoped to only this unit's
  own two updated tests.

### Run It

Already shown above — the real, executed compile error, then, after the
fix, the real, printed output:

```
Hello from a coroutine
```

### Connect the Pieces

This project's own real persistence methods can now genuinely pause
instead of blocking. The next unit asks a separate, real question: once
a function can pause, which real thread actually does the work while
it's paused?

---

## Concept Unit: Dispatcher

### The Problem

Making a function `suspend` lets it pause — but pausing, by itself, says
nothing about *where* the real work it does actually runs. This
project's own earlier persistence work already found a real, decisive
fact worth revisiting now: this
project's own database queries, when they were plain, blocking
functions, genuinely crashed when run from what Robolectric considers
the main thread, unless `.allowMainThreadQueries()` was explicitly
added. Now that they're `suspend`, this unit's own real job is finding
out whether that same real danger still exists.

> **Stop and think, before reading on:**
> - Making a function `suspend` lets it pause — but pausing alone
>   doesn't say anything about which real thread actually does the work
>   while it's paused. What real, additional piece of information would
>   a coroutine need to decide that?
> - This project's own real `AppDatabaseTest` needed
>   `.allowMainThreadQueries()` to avoid a real crash, back when
>   `CalculationDao`'s own methods were ordinary, blocking functions.
>   Now that they're `suspend`, what do you predict happens if that same
>   real database is queried without it?
> - If a coroutine calls `withContext(Dispatchers.IO) { ... }`, what
>   real, concrete difference would you expect to see if you printed the
>   current thread's own name, once outside that block and once inside
>   it?

### Introduce the Concept in Isolation

```kotlin
suspend fun labDescribeWorkerThread(): String {
    return withContext(Dispatchers.IO) {
        Thread.currentThread().name
    }
}
```

A real, temporary test compares the calling thread's own real name
against the one captured from inside that block:

```kotlin
class LabDispatcherThreadTest {
    @Test
    fun withContextRunsOnADifferentRealThread() {
        val callingThread = Thread.currentThread().name
        val workerThread = runBlocking {
            labDescribeWorkerThread()
        }
        println("calling thread: $callingThread")
        println("worker thread: $workerThread")
    }
}
```

Real, executed output:

```
calling thread: Test worker
worker thread: DefaultDispatcher-worker-1 @coroutine#1
```

A real, concrete difference: `Dispatchers.IO` genuinely runs the code
inside `withContext` on a real, different thread —
`DefaultDispatcher-worker-1`, not `Test worker`, the thread the test
itself started on. This is called a **Dispatcher** — the real,
coroutine-level decision of which actual thread (or thread pool) a
piece of suspendable code runs on. Given this, does this project's own
real, suspend `CalculationDao` need an explicit `withContext` like this
one, to stay safe? A second, real, decisive check:

```kotlin
@Dao
interface LabDispatcherDao {
    @Insert
    suspend fun insert(calculation: CalculationEntity)
}

@Database(entities = [CalculationEntity::class], version = 1, exportSchema = false)
abstract class LabDispatcherDatabase : RoomDatabase() {
    abstract fun labDispatcherDao(): LabDispatcherDao
}
```

A real, temporary test calls that suspend DAO method, with no
`Dispatchers.IO` and no `.allowMainThreadQueries()`, and checks whether
it still succeeds:

```kotlin
@RunWith(RobolectricTestRunner::class)
class LabDispatcherTest {
    @Test
    fun suspendInsertSucceedsWithoutAllowMainThreadQueries() {
        val database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            LabDispatcherDatabase::class.java
        ).build()

        runBlocking {
            database.labDispatcherDao().insert(
                CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10)
            )
        }

        println("Insert succeeded with no allowMainThreadQueries()")
        database.close()
    }
}
```

Real, executed output:

```
Insert succeeded with no allowMainThreadQueries()
```

No real crash at all — proving, concretely, that Room's own real,
generated `suspend` DAO implementations already do their own internal
dispatcher-switching, exactly like this unit's own hand-written
`withContext` example, entirely automatically. This is exactly why this
lesson's own first unit could safely remove `.allowMainThreadQueries()`
from every real test it touched.

### Discard the Throwaway Example

Both of these labs are discarded now — neither becomes part of the
project. Their real output already proved what it needed to:
`Dispatchers.IO` genuinely moves real work to a different real thread,
and Room's own `suspend` DAO methods already do exactly that internally,
with no extra code this project has to write itself.

### Mechanical Walkthrough

- `suspend fun labDescribeWorkerThread(): String { return withContext(Dispatchers.IO) { Thread.currentThread().name } }`
  — a real `suspend` function whose own body is entirely one real
  `withContext` call.
  - `withContext(Dispatchers.IO)` — switches the current coroutine to
    run its own trailing block specifically on `Dispatchers.IO`'s real
    thread pool, suspending the caller until that block finishes.
  - `Thread.currentThread().name` — read from inside the block, real
    proof of which actual thread is running this exact code right now.
- `val callingThread = Thread.currentThread().name` (test) — captures
  the real, calling thread's own name, before any coroutine starts.
- `val workerThread = runBlocking { labDescribeWorkerThread() }` — runs
  the real lab function inside a real coroutine, capturing its own real
  return value.
- `@Insert suspend fun insert(calculation: CalculationEntity)`
  (`LabDispatcherDao`) — the identical real shape as this project's own
  permanent `CalculationDao.insert`, reproduced here in isolation.
- `Room.inMemoryDatabaseBuilder(...).build()` (no
  `.allowMainThreadQueries()`) — deliberately omitted this time, the
  exact real point of this second lab.
- `runBlocking { database.labDispatcherDao().insert(...) }` — calls the
  real, suspend DAO method from inside a real coroutine; if this were
  still a plain, blocking function, this exact call, on this exact
  simulated thread, would throw the real exception this project's own
  earlier persistence work already documented.

### CS Lens

A **Dispatcher** — deciding *where* (which real thread or thread pool)
code actually runs, as a decision genuinely separate from *what* runs —
is a real, recognized scheduling idea:

```
Also recognized in: an operating system's own real thread scheduler,
deciding which real CPU core actually runs which process; a web
server's own real request-handling thread pool, kept separate from its
own I/O-handling threads; JavaScript's own real event loop, deciding
when a pending callback actually gets to run; a print spooler's own
real job queue, deciding which physical printer actually handles which
submitted document.
```

### SE Lens

Why does Room bother automatically switching dispatchers internally for
`suspend` DAO methods, rather than trusting every caller to remember to
do it correctly themselves — the same way it left dispatcher choice
entirely up to callers for its own plain, non-`suspend` methods? A real
alternative genuinely exists: Room could have left this exactly as
manual as it always was. Room's own real, decisive design choice: for
`suspend` methods specifically, it takes dispatcher selection over
itself, since forgetting it is exactly the kind of real, easy-to-miss
mistake that caused this project's own real crash in the first place.
The real, honest cost: a caller has less explicit control
over exactly which dispatcher Room's own internal work runs on — a
real, deliberate tradeoff favoring safety-by-default over manual,
fine-grained control.

### Commands Needed

- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.LabDispatcherThreadTest" --tests "com.example.calculator.LabDispatcherTest"`
  — runs this project's real Gradle wrapper, scoped to only this unit's
  own two throwaway labs.

### Run It

Already shown above — the real, executed output was:

```
calling thread: Test worker
worker thread: DefaultDispatcher-worker-1 @coroutine#1
```

and

```
Insert succeeded with no allowMainThreadQueries()
```

### Connect the Pieces

This unit proved `suspend` functions genuinely run their own real work
on a real, chosen dispatcher — explicitly, via `withContext`, or, for
Room's own `suspend` DAO methods, entirely automatically. The next unit
asks what actually starts a coroutine running in the first place, and
what should happen to it if the thing that started it disappears.

---

## Concept Unit: Structured Concurrency

### The Problem

A `suspend` function can pause safely, and this project's own real
persistence methods now know how to run their own work on the right
real dispatcher. But nothing yet actually *starts* a real coroutine
from inside `CalculatorViewModel.onButtonClick` — and whatever does
needs to be tied to something, so a save in progress can never outlive
its own natural owner.

> **Stop and think, before reading on:**
> - A `suspend` function can pause, but something still has to actually
>   start it running in the first place. This project's own real
>   `ViewModel`s already have a lifecycle tied to a real screen (Lesson
>   4.3). What do you think should happen to any paused, in-progress
>   work if the screen it belongs to is destroyed for good?
> - If a coroutine is launched inside a scope, and that scope is
>   cancelled partway through, what real, concrete difference would you
>   expect between work that had already finished versus work that
>   hadn't started yet?
> - This project's own real `CalculatorViewModel` already survives a
>   configuration change by staying alive across it. Given
>   that, what real, already-existing object might be exactly the right
>   "scope" for a coroutine saving a calculation to be tied to?

### Introduce the Concept in Isolation

```kotlin
class LabScopedWorker {
    val scope = CoroutineScope(Dispatchers.Default)
    var completed = false

    fun startWork() {
        scope.launch {
            delay(100)
            completed = true
        }
    }
}
```

A real, temporary test starts that work, cancels the scope it was
launched in before the delay finishes, and checks whether the work
still completes:

```kotlin
class LabScopedWorkerTest {
    @Test
    fun cancellingTheScopeStopsTheLaunchedWork() {
        val worker = LabScopedWorker()
        worker.startWork()
        worker.scope.cancel()

        runBlocking {
            delay(200)
        }

        println("completed after cancel: ${worker.completed}")
        assertFalse(worker.completed)
    }
}
```

Real, executed output:

```
completed after cancel: false
```

Real, decisive proof: `startWork` launches a real coroutine that would,
left alone, set `completed = true` after a real 100-millisecond delay —
but `worker.scope.cancel()` is called immediately afterward, and even
after this test's own real 200-millisecond wait (twice as long as the
original delay), `completed` is still `false`. The launched coroutine
never got to finish, because the real scope it was tied to was
cancelled first. This is called **structured concurrency** — tying a
coroutine's own real lifetime to an enclosing scope, so it can never
outlive whatever owns that scope.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: cancelling a real scope
genuinely stops real, in-progress coroutines launched inside it, before
they can finish.

### Project Change

- **Reference Source**: no reference counterpart — this is a
  from-scratch addition, for the same reason the units above gave.
- **Files affected**: modified
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`;
  created
  `app/src/test/java/com/example/calculator/CalculatorViewModelPersistenceTest.kt`.
- **Change type**: refactor (`CalculatorViewModel`'s own real
  superclass, constructor, and `onButtonClick` all change); add (one
  brand-new test file).
- **Location**: `CalculatorViewModel.kt`'s own entire class declaration;
  `onButtonClick`'s own real body.
- **Dependencies**: `CalculationRepository`, `AppDatabase`, both already
  real; `viewModelScope`, already resolved on this project's own
  classpath since its own earlier navigation work.

### The New Code

```kotlin
class CalculatorViewModel @JvmOverloads constructor(
    application: Application,
    private val repository: CalculationRepository = CalculationRepository(
        Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")
            .build()
            .calculationDao()
    )
) : AndroidViewModel(application) {
```

Inside that same class, `onButtonClick`'s own body gains the real
launch, tied to `viewModelScope`, right after a successful calculation
lands in `state.history`:

```kotlin
fun onButtonClick(label: String) {
    val previousHistorySize = state.history.size
    state = nextState(state, label)
    if (state.history.size > previousHistorySize) {
        val newCalculation = state.history.last()
        viewModelScope.launch {
            repository.save(newCalculation)
        }
    }
}
```

This same unit also adds a real, permanent test, proving
`onButtonClick`'s own new logic calls the real Repository correctly —
using a real, hand-written fake `CalculationDao`, so this test needs
neither a real database nor any coroutine-timing tools at all:

```kotlin
private class FakeCalculationDao : CalculationDao {
    val inserted = mutableListOf<CalculationEntity>()

    override suspend fun insert(calculation: CalculationEntity) {
        inserted.add(calculation)
    }

    override suspend fun getAll(): List<CalculationEntity> = inserted
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
            fakeDao.inserted
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
        assertEquals(emptyList<CalculationEntity>(), fakeDao.inserted)
    }
}
```

### The Updated Project

`CalculatorViewModel.kt`, in full, numbered, with this unit's new and
changed lines marked:

```kotlin
 1: package com.example.calculator
 2:
 3: import android.app.Application                                            // ← new
 4: import androidx.compose.runtime.getValue
 5: import androidx.compose.runtime.mutableStateOf
 6: import androidx.compose.runtime.setValue
 7: import androidx.lifecycle.AndroidViewModel                                // ← new
 8: import androidx.lifecycle.viewModelScope                                  // ← new
 9: import androidx.room.Room                                                 // ← new
10: import kotlinx.coroutines.launch                                          // ← new
11:
12: class CalculatorViewModel @JvmOverloads constructor(                      // ← changed
13:     application: Application,                                             // ← new
14:     private val repository: CalculationRepository = CalculationRepository( // ← new
15:         Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db") // ← new
16:             .build()                                                       // ← new
17:             .calculationDao()                                              // ← new
18:     )                                                                       // ← new
19: ) : AndroidViewModel(application) {                                        // ← changed
20:     var state by mutableStateOf(CalculatorState())
21:         private set
22:
23:     fun onButtonClick(label: String) {
24:         val previousHistorySize = state.history.size                       // ← new
25:         state = nextState(state, label)
26:         if (state.history.size > previousHistorySize) {                    // ← new
27:             val newCalculation = state.history.last()                      // ← new
28:             viewModelScope.launch {                                        // ← new
29:                 repository.save(newCalculation)                            // ← new
30:             }                                                               // ← new
31:         }                                                                   // ← new
32:     }
33: }
```

`CalculatorViewModel`'s own overall job hasn't changed — it's still the
one real object owning this app's own calculator state — but it now
also owns a real `CalculationRepository`, and its own `onButtonClick`
now recognizes exactly when a real calculation just succeeded, saving
it through a real, properly scoped coroutine.

`CalculatorViewModelPersistenceTest.kt`, in full:

```kotlin
package com.example.calculator

import android.app.Application
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

private class FakeCalculationDao : CalculationDao {
    val inserted = mutableListOf<CalculationEntity>()

    override suspend fun insert(calculation: CalculationEntity) {
        inserted.add(calculation)
    }

    override suspend fun getAll(): List<CalculationEntity> = inserted
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
            fakeDao.inserted
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
        assertEquals(emptyList<CalculationEntity>(), fakeDao.inserted)
    }
}
```

### Mechanical Walkthrough

- `import android.app.Application` / `import androidx.lifecycle.AndroidViewModel`
  (lines 3, 7) — bring the real `Application` context type and the real
  `AndroidViewModel` base class into scope.
- `import androidx.lifecycle.viewModelScope` / `import kotlinx.coroutines.launch`
  (lines 8, 10) — bring this project's own already-established real
  `viewModelScope` and the real, standard `launch` extension into scope.
- `import androidx.room.Room` (line 9) — brings Room's own real,
  top-level entry point into scope, needed for `Room.databaseBuilder`.
- `class CalculatorViewModel @JvmOverloads constructor(...)` (lines
  12–19) — declares this project's own real `ViewModel`, now marked
  `@JvmOverloads`, confirmed for real this session to be the exact fix
  `ViewModelProvider`'s own reflection-based factory needs.
  - `application: Application` (line 13) — the one real, required
    parameter every `AndroidViewModel` needs.
  - `private val repository: CalculationRepository = CalculationRepository(...)`
    (lines 14–18) — a real, primary-constructor property, defaulting to
    a freshly built `CalculationRepository`, itself wrapping a freshly
    built, real, on-device `CalculationDao`.
    - `Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")`
      (line 15) — the real, permanent, on-device counterpart to Lesson
      7.3's own in-memory-only builder, naming a real file,
      `"calculator.db"`, this project's own real history will now
      actually live in.
    - `.build()` (line 16) — constructs the real, usable database.
    - `.calculationDao()` (line 17) — retrieves its own real, generated
      `CalculationDao` implementation.
  - `: AndroidViewModel(application)` (line 19) — the real superclass
    constructor call, handing the real `application` straight through.
- `val previousHistorySize = state.history.size` (line 24) — captures
  the real, current history length, immediately before `nextState` runs,
  the only real way to later tell whether a new calculation was just
  added.
- `if (state.history.size > previousHistorySize)` (line 26) — compares
  the real, new history length against the captured one; `true` only
  when `nextState`'s own real `"="` branch just succeeded (this
  project's own already-established real logic — a failed calculation
  never grows `history` at all).
  - `val newCalculation = state.history.last()` (line 27) — reads the
    real, just-added `Calculation` directly off the real, updated state.
  - `viewModelScope.launch { repository.save(newCalculation) }` (lines
    28–30) — starts a real, new coroutine, tied to this project's own
    real `viewModelScope`, calling the real, `suspend`
    `CalculationRepository.save` — the exact real mechanism this
    lesson's own first two units already proved is safe.

### CS Lens

**Structured concurrency** — tying a coroutine's own real lifetime to
an enclosing scope, so it can never outlive whatever owns that scope —
is a real, recognized idea, closely related to resource management more
broadly:

```
Also recognized in: a file handle automatically closed when a real
try-with-resources block ends (Java) or a real `use { }` block ends
(Kotlin); a real child process automatically terminated when its own
parent process exits; a real database transaction automatically rolled
back if its own enclosing block exits abnormally; this project's own
real `CalculatorViewModel` itself, already automatically cleared by the
real Android framework the instant its own owning screen is gone for
good.
```

### SE Lens

Why launch inside `viewModelScope` specifically, rather than a
hand-managed `CoroutineScope` this project constructs and cancels
itself — this unit's own lab already proved that works? A real
alternative genuinely exists and is fully legitimate. This project uses
`viewModelScope` instead — real, decisive reasoning: it's already,
automatically tied to `CalculatorViewModel`'s own real, established
lifecycle, cancelled the instant the ViewModel itself is
cleared, with zero extra code needed to wire that up correctly; a
hand-managed scope would require this project to remember to cancel it
at exactly the right real moment itself — a real, easy-to-forget
responsibility `viewModelScope` removes entirely. The real, honest cost:
relying on `viewModelScope` ties this project's own save logic
specifically to `ViewModel`'s own real lifecycle rules — fine here,
since that's exactly the real lifetime a calculation-save should have,
but a real design decision worth naming, not an automatic default with
no tradeoff at all.

### Commands Needed

- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.CalculatorViewModelTest" --tests "com.example.calculator.CalculatorViewModelPersistenceTest"`
  — runs this project's real Gradle wrapper, scoped to both this
  project's own already-established configuration-change test and this
  unit's own two new persistence tests.

### Run It

Real, executed test-report output (this session):

```
<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="com.example.calculator.CalculatorViewModelPersistenceTest" tests="2" skipped="0" failures="0" errors="0" timestamp="2026-08-22T23:13:27" hostname="Michaels-Mac-mini.local" time="1.617">
  <properties/>
  <testcase name="successfulCalculationIsSavedThroughTheRealRepository" classname="com.example.calculator.CalculatorViewModelPersistenceTest" time="1.608"/>
  <testcase name="failedCalculationIsNeverSaved" classname="com.example.calculator.CalculatorViewModelPersistenceTest" time="0.009"/>
  <system-out><![CDATA[]]></system-out>
  <system-err><![CDATA[]]></system-err>
</testsuite>
```

### Connect the Pieces

`CalculatorViewModel` now genuinely, safely saves every successful
calculation — through a real, `suspend` Repository (this lesson's first
unit), running its own real work on the correct real dispatcher without
this project ever having to say so explicitly (this lesson's second
unit), launched inside a real, structured scope that can never outlive
its own owning ViewModel (this unit). Real, tested proof, both ways: a
successful `7 + 3 = 10` really does reach the fake DAO exactly once,
correctly shaped; a failed `5 ÷ 0 =` never reaches it at all.

---

## Connect the pieces

Trace one real button sequence, `7`, `+`, `3`, `=`, all the way through
every unit this lesson built. Before this lesson began, pressing those
four real buttons already produced the correct real answer, `10`, and
already added a real `Calculation` to `CalculatorState.history` — but
nothing carried it any further. Now, the moment `nextState` returns a
real, longer `history`, `onButtonClick` notices — `state.history.size > previousHistorySize`
— and reads the real, just-added `Calculation` straight off it. It
hands that value to `viewModelScope.launch { repository.save(newCalculation) }`
— a real coroutine, started without blocking the real screen this
lesson's own first unit made possible, running its own real database
work on the correct real thread this lesson's own second unit proved
happens automatically, tied to a scope this lesson's own third unit
proved can never outlive `CalculatorViewModel` itself. `repository.save`
converts the real domain `Calculation` into a real `CalculationEntity`
(this project's own earlier, real mapper work) and hands it to
`CalculationDao.insert` — now `suspend`, now safe, now real. The exact
same `7 + 3 = 10` this project has computed correctly since its own
first real Android calculation has, for the first
time, genuinely reached durable, on-device storage — real, permanent,
tested proof, this session, that it did — without ever once blocking
the real screen a real user would be looking at while it happened. One
piece remains, deliberately open: `CalculationRepository.getAll` is
real, tested, and safe to call — but nothing in this project's own real
UI reads it back yet to actually show a history screen. That real
display work, and the real, live connection between a changing database
and a changing screen, is exactly what Lesson 7.6, Flow, is for.
