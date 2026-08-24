# Lesson 12.1: The Object Graph One Constructor Hides

**What you will build.** No new shipped feature — Stage 12 opens the same
way Stages 4, 8, 9, 10, and 11 each did: a purely diagnostic lesson, no
production code left changed by the end of it. This lesson proves, with
real, already-existing evidence sitting in this project's own code today —
not an invented scenario — exactly what an **object graph** is, why
building one inline forces whoever writes the constructor to also know
how to build every one of its dependencies' own dependencies, and why
that cost multiplies the moment more than one real caller needs to build
a similar graph. `CalculatorViewModel`'s own real constructor already
does this: it builds a working `CalculationRepository`, backed by a real,
on-device Room database, entirely inside one default parameter value —
and this project's own real `CalculatorViewModelPersistenceTest.kt`
already had to retype that exact chain, by hand, in three separate real
test methods, just to substitute one fake dependency. That's the real,
honest problem Slice 12 ("Multiple Calculation Engines") exists to solve.
Lessons 12.2–12.4 build the actual fix.

**What you need to know first:**
- Lesson 0.6 (A Blueprint and Its Real Things) — constructors, and the
  general real mechanism by which a class's own constructor parameters
  get supplied when an instance is built.
- Lesson 3.2 (A Button Written Once) — a default parameter value, this
  project's own already-established way to give a constructor or function
  parameter a value used automatically when a caller doesn't supply one.
- Lesson 7.3 (An Address on Disk) — `Room`, `AppDatabase`, `CalculationDao`,
  the real, on-device persistence chain this lesson's own evidence is
  built from.
- Lesson 7.4 (Nothing Outside Needs to Know) — `CalculationRepository`,
  the real class standing between `CalculatorViewModel` and Room.
- Lesson 7.5 (Waiting Without Blocking) — `AndroidViewModel`, `Application`,
  and `@JvmOverloads`, all three already real, permanent parts of
  `CalculatorViewModel`'s own current constructor.

No pipeline diagram — this lesson doesn't touch this project's expression
or graphing pipeline.

## Terms used in this lesson

- **object graph** — the complete, transitive set of real objects that
  must exist, built in dependency order, before some one specific object
  can be constructed. Why it matters: the moment any single one of those
  objects is built *inside* another one's own constructor, the two facts
  "what this object needs" and "how to actually build what it needs" stop
  being separate — anyone who wants the outer object now also has to
  either accept the inner one exactly as built, or know how to rebuild
  the entire chain themselves.
- **default parameter value** — a value a constructor or function
  parameter uses automatically when a caller doesn't supply one of its
  own, written directly after the parameter's type
  (`param: Type = someExpression`). Reappearing here — this project has
  already used one for `CalculatorButton`'s own `modifier: Modifier =
  Modifier` parameter; what's new is *what* the default expression is
  allowed to be — not just a simple, already-built value like
  `Modifier`, but an entire, freshly-constructed multi-step object
  graph, evaluated fresh every time the default is actually used.
- **`@JvmOverloads`** — a real Kotlin annotation that generates real,
  separate, Java-visible constructor (or function) overloads, one for
  every suffix of parameters that have default values. Without it, a
  Kotlin constructor with default parameter values compiles to exactly
  one real JVM constructor, taking every parameter — a reflection-based
  Java caller that only knows to ask for a shorter parameter list, like
  Android's own `ViewModelProvider`, genuinely cannot find a matching
  constructor at all. This is why `CalculatorViewModel`'s own real
  constructor already carries it: `ViewModelProvider`'s own default
  factory reflects for a constructor taking exactly `(Application)`, and
  without `@JvmOverloads` generating that shorter overload, that lookup
  fails at runtime with a genuine `NoSuchMethodException`.
- **shotgun surgery** — a real, named code-smell describing a single
  change that forces edits across many, separate, otherwise-unrelated
  places in a codebase, all at once, just to keep it compiling or
  correct. Why it matters: it's a direct, measurable symptom that some
  piece of knowledge — here, "how to build a working `Service`-shaped
  object" — is duplicated instead of stated once.

## Objects and methods used

**`CalculatorViewModel`**
- *What it is:* this project's own real, permanent `ViewModel` owning
  this calculator's entire live state, unchanged by this lesson.
- *Implementation:* its real, current, complete primary constructor,
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`,
  lines 15–22:
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
- *Its use:* this lesson's own entire subject — not modified, only read
  and analyzed, exactly as it already, really exists in this project
  today.
- *Type:* a `class`, extending `AndroidViewModel`, with an explicit
  `constructor` keyword (required here because the constructor itself
  carries an annotation, `@JvmOverloads` — Kotlin's own implicit
  primary-constructor shorthand, `class Foo(x: Int)`, this project has
  used everywhere else, has no place to attach one).
- *Responsibility:* own this calculator's live `CalculatorState`, expose
  its persisted history as a `StateFlow`, and forward every button press
  into `nextState`, saving through `repository` whenever a calculation
  actually completes.
- *Depends on:* a real `Application`, and a real, working
  `CalculationRepository` — supplied by a caller, or, if none is
  supplied, built automatically by the default value shown above.
- *Connects to:* constructed by `viewModel()` inside `CalculatorScreen`
  (ordinarily, with no arguments) or directly, by name, from a test; its
  own default value constructs a `CalculationRepository`, which in turn
  constructs a real, on-device `AppDatabase`.
- *Shape:* this project's own real MVVM ownership layer — the exact
  seam this lesson's own evidence is drawn from.

**`CalculationRepository`**
- *What it is:* this project's own real, permanent class standing
  between `CalculatorViewModel` and Room, hiding persistence details
  behind domain-shaped methods.
- *Implementation:* its real, current, complete constructor,
  `app/src/main/java/com/example/calculator/CalculationRepository.kt`,
  line 6: `class CalculationRepository(private val dao: CalculationDao)`.
- *Its use:* the one real object `CalculatorViewModel`'s own default
  value builds, and the one real object this lesson's own second unit
  shows this project's tests substituting a fake `dao` into.
- *Type:* a `class`, holding one real, constructor-injected dependency.
- *Responsibility:* translate between this project's own domain-shaped
  `Calculation` and Room's own `CalculationEntity`, so nothing outside
  this one file ever needs to import a Room type directly.
- *Depends on:* a real `CalculationDao`, supplied at construction — never
  built by `CalculationRepository` itself.
- *Connects to:* built by `CalculatorViewModel`'s own default value, in
  the real project; built directly, by name, at three separate real call
  sites inside `CalculatorViewModelPersistenceTest.kt`.
- *Shape:* this project's own real persistence boundary — the middle
  link in the exact three-level chain this lesson names.

**`Room.databaseBuilder`**
- *What it is:* the real, static entry point AndroidX's Room library
  provides for constructing a working, on-device database.
- *Implementation:* real declared shape, confirmed this session via
  `javap -p` against this project's own real, installed
  `room-runtime-2.6.1-api.jar`:
  ```
  public static final <T extends RoomDatabase> RoomDatabase.Builder<T>
      databaseBuilder(Context, Class<T>, String)
  ```
  Three real, required arguments: a `Context`, the `RoomDatabase`
  subclass's own `Class` literal, and a file name Room uses for the real
  on-device database file.
- *Its use:* called with `application`, `AppDatabase::class.java`, and
  `"calculator.db"` — the first, leaf-level real call inside
  `CalculatorViewModel`'s own default value.
- *Type:* a `public static` method on the real `androidx.room.Room`
  object.
- *Responsibility:* return a real, configurable `RoomDatabase.Builder`,
  not yet a usable database — building the actual database is a separate,
  later step.
- *Depends on:* a real `Context` (here, the `application` parameter
  passed all the way down), a `Class` literal naming which real
  `RoomDatabase` subclass to build, and a `String` file name.
- *Connects to:* its own returned builder is immediately called with
  `.build()`, right where it's constructed.
- *Shape:* real, public AndroidX/Room platform API — the deepest, most
  leaf-level real call in this entire chain.

**`AppDatabase::class.java`**
- *What it is:* a real Kotlin class-literal expression, naming
  `AppDatabase` itself as a runtime `java.lang.Class` value.
- *Implementation:* `AppDatabase::class` is Kotlin's own real reflection
  syntax for a class reference (`kotlin.reflect.KClass<AppDatabase>`);
  `.java` is a real, standard conversion property on `KClass`, giving
  back the plain `java.lang.Class<AppDatabase>` that Java-originated APIs
  like Room's own `databaseBuilder` actually require as a parameter type.
- *Its use:* tells `Room.databaseBuilder` which real, annotated
  `RoomDatabase` subclass to generate and build an implementation of.
- *Type:* a compile-time expression evaluating to a real runtime object,
  not a method call.
- *Responsibility:* identify, unambiguously, at runtime, which exact
  class Room's own generated code should target.
- *Depends on:* `AppDatabase` already being declared, annotated, and
  compiled — Room's own annotation processor reads this exact class at
  build time to generate its real implementation.
- *Connects to:* passed directly as `databaseBuilder`'s second argument.
- *Shape:* Kotlin-to-Java interop syntax — this project's real bridge
  between Kotlin's own reflection API and a Java-originated library
  signature.

**`AppDatabase`**
- *What it is:* this project's own real, permanent, Room-annotated
  database class.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/AppDatabase.kt`:
  ```kotlin
  @Database(entities = [CalculationEntity::class], version = 1, exportSchema = false)
  abstract class AppDatabase : RoomDatabase() {
      abstract fun calculationDao(): CalculationDao
  }
  ```
- *Its use:* named, by class literal, as the exact type
  `Room.databaseBuilder` should construct a real, generated
  implementation of.
- *Type:* an `abstract class`, extending Room's own real `RoomDatabase`.
- *Responsibility:* declare which real entities this database holds and
  expose one abstract accessor per real DAO — Room's own annotation
  processor generates the real, working implementation of both at
  compile time, not this project's own code.
- *Depends on:* `CalculationEntity`, named in its own `@Database`
  annotation.
- *Connects to:* `.build()` (below) returns a real, working instance of
  Room's own generated subclass of this exact class.
- *Shape:* this project's own real persistence configuration — the
  second-deepest real link in this lesson's own chain.

**`.build()`**
- *What it is:* the real instance method that turns a configured
  `RoomDatabase.Builder` into an actual, usable database.
- *Implementation:* real declared shape, confirmed this session via the
  same `javap -p` pass against `room-runtime-2.6.1-api.jar`:
  `public T build()`, an instance method on `RoomDatabase.Builder<T>`.
- *Its use:* called directly on the real builder `Room.databaseBuilder`
  just returned, with zero further configuration in between.
- *Type:* a `public` instance method.
- *Responsibility:* construct and return a real, working instance of
  Room's own generated `AppDatabase` implementation.
- *Depends on:* a real, already-built `RoomDatabase.Builder<T>` to call
  it on.
- *Connects to:* its own returned real database is immediately called
  with `.calculationDao()`, right where it's built.
- *Shape:* real, public AndroidX/Room platform API.

**`.calculationDao()`**
- *What it is:* `AppDatabase`'s own abstract accessor method, real,
  concretely implemented only inside Room's own generated subclass.
- *Implementation:* declared as `abstract fun calculationDao():
  CalculationDao` on `AppDatabase` itself, shown in full above; Room's
  own annotation processor writes the real, concrete method body at
  compile time, backed by real, generated SQL.
- *Its use:* called on the real database `.build()` just returned,
  retrieving the one, real, working `CalculationDao` this whole chain
  exists to produce.
- *Type:* an `abstract` instance method on `AppDatabase`, concretely
  implemented only in Room's own compiler-generated subclass.
- *Responsibility:* hand back a real, working `CalculationDao` backed by
  this exact database instance.
- *Depends on:* a real, already-built `AppDatabase` instance to call it
  on.
- *Connects to:* its own return value is passed directly into
  `CalculationRepository(...)`, closing this three-level chain.
- *Shape:* this project's own real persistence entry point — the actual
  leaf value every level above it exists only to eventually produce.

**`CalculationDao`**
- *What it is:* this project's own real, Room-annotated interface
  declaring this project's actual database operations.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/CalculationDao.kt`:
  ```kotlin
  @Dao
  interface CalculationDao {
      @Insert
      suspend fun insert(calculation: CalculationEntity)

      @Query("SELECT * FROM calculations")
      fun getAll(): Flow<List<CalculationEntity>>
  }
  ```
- *Its use:* the real, final leaf value `.calculationDao()` returns, and
  the exact real seam this lesson's own second unit shows being swapped
  for a fake at three separate real call sites.
- *Type:* an `interface`, annotated `@Dao` — Room's own annotation
  processor generates its one real, concrete implementation.
- *Responsibility:* declare, as plain method signatures, exactly which
  real database operations exist — nothing about how they're
  implemented.
- *Depends on:* Room's own generated code for its real implementation;
  nothing at the interface level itself.
- *Connects to:* implemented, in the real, shipped app, by Room's own
  generated class; implemented, in
  `CalculatorViewModelPersistenceTest.kt`, by a real, hand-written
  `FakeCalculationDao`.
- *Shape:* this project's own real persistence contract — already an
  interface, already substitutable, which is exactly why this lesson's
  own second unit is able to swap it at all.

### Everything else in the file, not this lesson's subject but still explained

**`Application`**
- *What it is:* the one real `Context` subclass in an Android app
  guaranteed to live exactly as long as the app process itself, rather
  than any one shorter-lived screen.
- *Implementation:* `open class Application : ContextWrapper`, part of
  the real Android SDK, already a required parameter of
  `AndroidViewModel`'s own real constructor.
- *Its use:* threaded through `CalculatorViewModel`'s own constructor
  into `Room.databaseBuilder`'s own first, required argument — Room
  needs a real `Context` to locate and open a real, on-device database
  file.
- *Type:* an `open class`, a real, concrete `Context` subclass.
- *Responsibility:* provide safe, real, application-scoped access to
  Android's own platform services, for exactly as long as the app
  process runs.
- *Depends on:* supplied automatically by the real Android runtime (or
  Robolectric, in this project's own tests), never constructed directly
  by this project's own code.
- *Connects to:* passed into `AndroidViewModel`'s own superclass
  constructor, and, separately, into `Room.databaseBuilder`.
- *Shape:* real, public Android platform API.

**`AndroidViewModel`**
- *What it is:* a real, standard AndroidX base class for a `ViewModel`
  that needs safe, real access to the application's own `Context`.
- *Implementation:* real declared shape, confirmed this session via
  `javap -p` against this project's own real, installed
  `lifecycle-viewmodel-2.6.2-api.jar`:
  ```
  public class androidx.lifecycle.AndroidViewModel extends androidx.lifecycle.ViewModel
  public androidx.lifecycle.AndroidViewModel(android.app.Application)
  ```
  A real, `public`, non-`abstract`, non-`final` class — genuinely
  instantiable directly, even though this project only ever extends it.
- *Its use:* `CalculatorViewModel`'s own real superclass — its
  constructor requires a real `Application`, which is exactly why
  `CalculatorViewModel`'s own constructor has one too.
- *Type:* a real, open (non-`final`) class, extending `ViewModel`.
- *Responsibility:* give any subclass safe, real access to an
  application-scoped `Context` without risking a shorter-lived screen
  leaking into something longer-lived.
- *Depends on:* a real `Application` instance, supplied at construction.
- *Connects to:* `CalculatorViewModel`'s own `: AndroidViewModel(application)`
  passes its own `application` parameter straight through.
- *Shape:* real, public AndroidX platform API.

---

## Concept Unit: The Object Graph Behind One Constructor

### The Problem

`CalculatorViewModel` needs a `CalculationRepository` to save this
calculator's history. A `CalculationRepository` needs a `CalculationDao`
to actually read or write anything. A working `CalculationDao` only
exists once a real `AppDatabase` has actually been built, on disk,
through `Room.databaseBuilder(...).build()`. None of that is
hypothetical — it's the real, current shape of `CalculatorViewModel`'s
own constructor, shown in full above. But nothing about `CalculatorScreen`'s
own real call site, `viewModel()`, ever mentions Room, `AppDatabase`, or
even `CalculationRepository` by name. Where did all of that go?

Given that `CalculatorViewModel`'s own real second constructor parameter
already has a working default value, built from three real, nested
calls, what would you expect happens the moment something *other* than
that default needs to build a `CalculatorViewModel` — say, a test that
wants a `CalculationRepository` backed by something other than a real,
on-device SQLite file? Does the rest of this project's own code need to
know that `CalculationRepository` exists at all, or is it possible to
call `CalculatorViewModel(application)` and get a fully working object
back regardless? And if the answer is "no, whoever wants something
different has to build the whole chain themselves" — what, exactly, do
they now have to know that `CalculatorScreen`'s own call site never had
to?

### Introduce the Concept in Isolation

A small, throwaway, three-class chain, added temporarily as
`lab1_object_graph.kt`, deliberately using different names from this
project's own real classes — proving the concept is general, not just
true of this one project's own persistence layer:

```kotlin
class Connection {
    init { println("Connection opened") }
}

class Store(private val connection: Connection) {
    init { println("Store ready") }
    fun save(value: String) = println("Store saved: $value")
}

class Service(private val store: Store) {
    init { println("Service ready") }
    fun handle(value: String) = store.save(value)
}

fun main() {
    val service = Service(Store(Connection()))
    service.handle("first entry")
}
```

Compiled and run for real this session (`kotlinc lab1_object_graph.kt
-include-runtime -d lab1.jar`, then `java -jar lab1.jar`), saved in full
in `verification/12.1/lab1_output.txt`:

```
Connection opened
Store ready
Service ready
Store saved: first entry
```

The real, printed order proves something the source code's own visual
nesting only implies: `Connection` really is constructed first, then
`Store`, then `Service` — leaf to root, every time, no exceptions —
because Kotlin cannot evaluate `Service(Store(Connection()))` any other
way; each constructor call needs its own argument's real value before it
can run. `main` never had to say "first build a `Connection`, then a
`Store`" anywhere — that ordering is a forced, structural consequence of
nesting the calls this way, not a choice `main` made. This entire,
real, transitive chain of objects — everything that has to exist before
`Service` can — is called an **object graph**.

### Discard the Throwaway Example

`lab1_object_graph.kt` is deleted now — real, saved in
`verification/12.1/lab1_object_graph.kt` alongside its real run
transcript. It does not exist in this project's own real source tree.

### Mechanical Walkthrough

The exact same real shape, unchanged, already sitting inside this
project's own real code — `CalculatorViewModel.kt`, lines 15–22, quoted
in full above. Enumerated in order, every distinct construct in it:

- `class CalculatorViewModel @JvmOverloads constructor(` — an explicit
  `constructor` keyword, required here specifically because
  `@JvmOverloads` needs somewhere to attach; this project's own implicit
  primary-constructor shorthand (`class Addition : Operation`, `data
  class CalculatorState(...)`) has no such slot for an annotation.
  `@JvmOverloads` itself generates real, separate, Java-visible
  constructor overloads — one taking just `(Application)`, one taking
  both parameters — because `ViewModelProvider`'s own default,
  reflection-based factory only ever asks for the shorter one.
- `application: Application,` — a real, required parameter with no
  default; every caller, the default `viewModel()` factory included,
  must supply a real `Application`.
- `private val repository: CalculationRepository = CalculationRepository(` —
  a default parameter value, the same real mechanism already established
  for `CalculatorButton`'s own `modifier: Modifier = Modifier` parameter,
  this time building an entire object graph rather than reusing one
  already-built value like `Modifier`. `private val` makes `repository` a real,
  constructor-declared property, exactly as this project has done since
  its own primary constructors were first introduced.
- `Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")` —
  the real, leaf-level call in this chain, exactly mirroring the lab's
  own `Connection()`: it must run, and return a real, usable builder,
  before anything above it can proceed. `application` is this
  constructor's own first parameter, threaded straight down into it;
  `AppDatabase::class.java` is a real Kotlin-to-Java class-literal
  conversion, naming which exact class to build; `"calculator.db"` is a
  real, literal file name.
- `.build()` — called directly on the real builder the line above just
  returned, mirroring the lab's own `Store(...)` wrapping `Connection()`
  — this call cannot run until `databaseBuilder(...)` has already
  returned a real value to call it on.
- `.calculationDao()` — called directly on the real database `.build()`
  just returned, retrieving the one real, working `CalculationDao` this
  entire chain exists to produce.
- `CalculationRepository(` ... `)` — the real, outermost real
  constructor call in this chain, mirroring the lab's own `Service(...)`
  — it cannot run until its own single argument, the real
  `CalculationDao` two lines above, already exists.
- `) : AndroidViewModel(application) {` — `CalculatorViewModel`'s own
  real superclass constructor call, passing the same `application`
  parameter through a second time; `AndroidViewModel` is a real AndroidX
  base class requiring exactly this, guaranteeing safe, real access to
  an application-scoped `Context` for as long as this `ViewModel` lives.

Four real, nested constructions — `Room.databaseBuilder(...)`,
`.build()`, `.calculationDao()`, `CalculationRepository(...)` — sitting
inside one default parameter value, in exactly the same forced,
leaf-first order the isolated lab just proved is not optional. The only
real difference from the lab: nothing here prints anything to make that
order visible — it's exactly as real, just silent.

### CS Lens

This is a real, general **object graph** — the same structural idea
behind any dependency-construction chain, whatever names or languages
are involved.

```
Also recognized in: a build system resolving which packages must compile
before a given target can; a spreadsheet recalculating cells in the
correct order because one cell's formula reads another's; a service
mesh's own startup ordering, where a database has to be reachable before
the service that queries it can report healthy
```

### SE Lens

The alternative to building this graph inline, inside
`CalculatorViewModel`'s own default parameter value, isn't "don't build
it at all" — a working `CalculationRepository`, backed by a real
database, is genuinely required for this feature to function. The real
alternative, which this project has not yet adopted anywhere, is
handing a fully-built dependency *in*, rather than building it *inside*
the thing that needs it. The real cost of the current design, honestly:
nothing is broken today — `CalculatorScreen`'s own call site,
`viewModel()`, gets a fully working `CalculatorViewModel` with zero
extra code, precisely because the default value handles everything
silently. The real debt is hidden, not absent: anything that needs a
`CalculatorViewModel` built any differently than this one default
allows has no shorter path available than reconstructing the entire
chain by hand, one real level at a time — exactly the real cost the next
unit measures.

### Commands Needed

- `kotlinc <file>.kt -include-runtime -d <file>.jar` — compiles a
  standalone Kotlin file into a runnable `.jar`, bundling the Kotlin
  runtime, needing no Gradle project — this project's own established
  standalone-lab approach since Stage 0.
- `javap -p <jar>` — this session's own real tool for reading a compiled
  class's exact real method signatures directly out of a `.jar`,
  confirming `Room.databaseBuilder`'s and `.build()`'s own real shapes
  above rather than trusting memory.

### Run It

Shown above in full — real, clean compile, real, printed construction
order. Full transcript saved in `verification/12.1/lab1_output.txt`.

### Connect the Pieces

The isolated lab proved, with a real, printed, leaf-first construction
order, what an object graph actually is and why its order isn't
optional. This project's own real `CalculatorViewModel` was then shown
to already be exactly this — a real, three-level object graph, currently
built entirely inside one default parameter value. The next unit asks
what happens the moment more than one real place needs to build that
same graph differently.

---

## Concept Unit: One Chain, Typed Three Times

### The Problem

`CalculatorScreen`'s own real call site, `viewModel()`, never needs to
know `CalculationRepository` exists — the default value from the
previous unit handles it silently. But this project's own real,
existing test file, `CalculatorViewModelPersistenceTest.kt`, needs
something the default value cannot provide: a `CalculationRepository`
backed by a fake, in-memory `CalculationDao`, not a real, slow, stateful,
on-device SQLite file. Three separate real `@Test` methods in that exact
file — `successfulCalculationIsSavedThroughTheRealRepository`,
`failedCalculationIsNeverSaved`, and
`persistedHistoryReflectsARealSaveWithNoExplicitRefreshCall` — each need
exactly this. What does each one have to write to get it?

Given that `CalculatorViewModel`'s own default value cannot be
overridden partway — a caller either accepts the whole default or
supplies every non-default-having argument itself — what would you
expect three separate real test methods, each wanting the identical kind
of substitution, to actually contain? Would you expect one, shared place
that knows how to build a `CalculatorViewModel` with a fake dependency,
or three separate places that each know how, independently? And if
`CalculatorViewModel`'s own constructor signature ever changed — a new
required parameter, say — how many real places would have to change
along with it?

### Introduce the Concept in Isolation

The same real `Connection`/`Store`/`Service` shape from the previous
unit's lab, reused here, this time called from three separate functions
standing in for three separate test methods — added temporarily as
`lab2_duplicated_wiring.kt`:

```kotlin
class Connection(private val label: String) {
    init { println("Connection[$label] opened") }
}

class Store(private val connection: Connection) {
    fun save(value: String) = println("Store saved: $value")
}

class Service(private val store: Store) {
    fun handle(value: String) = store.save(value)
}

fun testHandlingAnEmptyValue() {
    val service = Service(Store(Connection("test-1")))
    service.handle("")
}

fun testHandlingANormalValue() {
    val service = Service(Store(Connection("test-2")))
    service.handle("normal")
}

fun testHandlingTwice() {
    val service = Service(Store(Connection("test-3")))
    service.handle("first")
    service.handle("first")
}

fun main() {
    testHandlingAnEmptyValue()
    testHandlingANormalValue()
    testHandlingTwice()
}
```

Compiled and run for real this session, saved in full in
`verification/12.1/lab2_output.txt`:

```
Connection[test-1] opened
Store saved: 
Connection[test-2] opened
Store saved: normal
Connection[test-3] opened
Store saved: first
Store saved: first
```

This runs cleanly — proving nothing is functionally *broken* about
typing the same chain three times. The real cost shows up under change,
not under normal operation. `Store`'s own real constructor was then
given a second, required parameter,
`Store(private val connection: Connection, private val retryLimit: Int)`
— a real, deliberate, minimal change, saved as
`break1_added_parameter.kt` — with all three functions left completely
untouched, then recompiled for real:

```
break1_added_parameter.kt:14:33: error: no value passed for parameter 'retryLimit'.
    val service = Service(Store(Connection("test-1")))
                                ^^^^^^^^^^^^^^^^^^^^^
break1_added_parameter.kt:19:33: error: no value passed for parameter 'retryLimit'.
    val service = Service(Store(Connection("test-2")))
                                ^^^^^^^^^^^^^^^^^^^^^
break1_added_parameter.kt:24:33: error: no value passed for parameter 'retryLimit'.
    val service = Service(Store(Connection("test-3")))
                                ^^^^^^^^^^^^^^^^^^^^^
```

Three real, separate compile errors — one per call site, all reporting
the identical missing parameter — from one single, real change. Full
transcript saved in `verification/12.1/break1_compile.txt`. This is a
real, named code smell: one real change forcing edits in many separate
places at once, just to keep the code compiling, is called **shotgun
surgery**.

### Discard the Throwaway Example

`lab2_duplicated_wiring.kt` and `break1_added_parameter.kt` are both
deleted now — real, saved in `verification/12.1/lab2_duplicated_wiring.kt`
and `verification/12.1/break1_added_parameter.kt`, alongside both real
transcripts. Neither exists in this project's own real source tree.

### Mechanical Walkthrough

The identical real shape, already sitting inside this project's own real
`CalculatorViewModelPersistenceTest.kt` today, unchanged by this lesson.
Its own real, private `FakeCalculationDao`, lines 12–20:

```kotlin
private class FakeCalculationDao : CalculationDao {
    val insertedFlow = MutableStateFlow<List<CalculationEntity>>(emptyList())

    override suspend fun insert(calculation: CalculationEntity) {
        insertedFlow.value = insertedFlow.value + calculation
    }

    override fun getAll(): Flow<List<CalculationEntity>> = insertedFlow
}
```

And the identical real construction line, appearing at line 30 inside
`successfulCalculationIsSavedThroughTheRealRepository`, at line 50
inside `failedCalculationIsNeverSaved`, and at line 67 inside
`persistedHistoryReflectsARealSaveWithNoExplicitRefreshCall`:

```kotlin
val viewModel = CalculatorViewModel(application, CalculationRepository(fakeDao))
```

- `private class FakeCalculationDao : CalculationDao` — a real, private
  class implementing the real `CalculationDao` interface directly,
  substituting for Room's own generated implementation entirely. This
  only works at all because `CalculationDao`, already shown above, is an
  interface, not a concrete class — the one real point in this whole
  chain that was already substitutable before this lesson looked at it.
- `val insertedFlow = MutableStateFlow<List<CalculationEntity>>(emptyList())` —
  a real, in-memory, observable list standing in for Room's own,
  real, on-device table.
- `override suspend fun insert(...)` / `override fun getAll(...)` — real,
  concrete implementations of `CalculationDao`'s own two abstract
  members, satisfying the interface without touching Room, SQLite, or
  disk at all.
- `CalculatorViewModel(application, CalculationRepository(fakeDao))` —
  the exact real shape the isolated lab's own
  `Service(Store(Connection("test-N")))` was built to mirror:
  `CalculationRepository(fakeDao)` is a real, direct constructor call,
  wrapping the fake `CalculationDao` instead of the real chain from the
  previous unit; `CalculatorViewModel(application, ...)` is a real,
  direct constructor call too — this is only possible because
  `@JvmOverloads`, from the previous unit, also generates the real,
  full two-argument overload alongside the shorter one
  `ViewModelProvider` reflects for.

This exact real line — not a lab standing in for it, the literal same
text — appears three separate times in this project's own real file,
independently typed, once per test method. If `CalculatorViewModel`'s
own constructor signature changes — which the next lesson does, on
purpose — all three real call sites break at once, for the identical
real reason the isolated lab's own `break1_added_parameter.kt` just
proved: three separate, real compile errors, one per site, from one
single, real change.

### CS Lens

Three independent call sites, each retyping identical construction
knowledge instead of that knowledge existing in exactly one real place,
is the same underlying idea as duplicated logic anywhere else in
software — a violation of **Don't Repeat Yourself**, here applied
specifically to *how to build an object*, not to ordinary business
logic.

```
Also recognized in: a magic number copy-pasted into a dozen call sites
instead of one named constant; a validation rule reimplemented
separately on a client and a server instead of shared; three
near-identical SQL queries that should have been one parameterized one;
copy-pasted boilerplate a linter's own "duplicate code" rule exists
specifically to flag
```

### SE Lens

The real alternative here isn't "never let a test build its own
`CalculatorViewModel`" — a test genuinely needs a way to substitute a
fake dependency, and right now, retyping the full chain by hand is the
*only* real way to do that. The real, honest cost this project is
currently carrying: three separate, real places already have to agree,
byte-for-byte, on `CalculatorViewModel`'s own exact constructor shape,
with nothing enforcing that agreement beyond each one happening to
compile today. This project's own Slice 12 already has a second, real,
concrete reason this same cost is about to get worse, not better:
`ScientificFunctions.kt`'s own dispatch table, `Matrix.kt`'s own
operations, and `Evaluator.kt`/`Graphing.kt`'s own expression pipeline
are all real, already-shipped pieces of calculation logic that don't yet
have a `ViewModel`-style owner of their own — the moment any one of them
gets one, whoever writes it, and whoever tests it, pays this exact same
manual-construction cost again, independently, with no shared answer to
reuse. Nothing about that has been built yet; naming it honestly, before
building anything, is what a purely diagnostic lesson is for.

### Commands Needed

No new commands beyond `kotlinc`, already shown in the previous unit.

### Run It

Shown above in full — the real, clean three-call run, then the real,
three-error break. Both transcripts saved in
`verification/12.1/lab2_output.txt` and
`verification/12.1/break1_compile.txt`.

### Connect the Pieces

The previous unit proved `CalculatorViewModel`'s own real constructor
already hides a three-level object graph inside one default value. This
unit proved that the moment something needs that graph built
*differently* — a fake dependency, for a test — the default value can't
help, and the full chain has to be retyped by hand, independently, at
every real place that needs it: three times already, in this project's
own real, existing test file, with a fourth and beyond a real,
near-certain cost the moment Slice 12's own other real calculation
engines need the same treatment.

---

## Connect the Pieces

One real, concrete chain, traced through both units:
`CalculationDao` → `CalculationRepository` → `CalculatorViewModel`. The
first unit proved, with a real, printed, leaf-first construction order
from an isolated lab, that this exact chain is a real **object graph** —
and that this project's own real `CalculatorViewModel` already builds
one, silently, inside a single default parameter value, confirmed
against its own real, current source, lines 15–22. The second unit
proved that the instant something other than that default needs the
same graph built differently, the silence ends: this project's own real
`CalculatorViewModelPersistenceTest.kt` already retypes the identical
construction line three separate times, and a real, deliberate,
one-parameter change to the isolated lab's own `Store` class turned into
three real, simultaneous compile errors — the same **shotgun surgery**
this project's own real `CalculatorViewModel` is one signature change
away from triggering for real. Nothing in this project's own real code
changed today — every one of its real, passing tests still passes,
unchanged. What changed is that "manual construction becomes painful" is
no longer a phrase — it's a real object graph, three real call sites
deep, already sitting in this project's own code, with a real, named
reason it's about to get worse before the next three lessons fix it.

**Next:** Lesson 12.2 (Constructor Injection).
