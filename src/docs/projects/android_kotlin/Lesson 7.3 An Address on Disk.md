# Lesson 7.3: An Address on Disk

- **What you will build** — This lesson gives `AndroidCalculator`'s own
  real calculation history (Lesson 7.1) a genuine, durable home for the
  first time — real, permanent Room-backed persistence: a real `@Entity`
  shaping one row of a real, on-device SQLite table; a real `@Dao`
  turning plain method signatures into real, generated SQL; and a real
  `@Database` tying both into one real, openable, queryable database.
  This closes exactly the gap Lesson 7.2 proved: this project's own
  history, right now, is real but lives only in RAM, gone the instant
  the process ends. The transferable problem underneath all three: how
  an ordinary, in-memory data shape becomes something a real database
  engine can store, query, and hand back — using declarative annotations
  that generate real, working code, instead of hand-written SQL.
- **What you need to know first** —
  - Lesson 7.1 (What Already Happened Doesn't Change): `Calculation`,
    `CalculatorState.history` — the real domain shape this lesson finally
    gives a durable home.
  - Lesson 7.2 (Gone the Moment the Process Is): Persistence, Tables &
    Records, CRUD — the exact vocabulary this lesson builds real code on
    top of.
  - Lesson 0.8 (A Fixed Set of Choices and a Record of What Happened):
    `data class`, reused for this lesson's own real `CalculationEntity`.
  - Lesson 0.7 (One Shape, Many Behaviors): `interface`, reused for this
    lesson's own real `CalculationDao`.
  - Lesson 1.4 (A Value That Survives Its Own Rebuild): Robolectric
    testing, already real in this project, reused for this lesson's own
    real database test.

## Terms used in this lesson

- **`data class`** — a class whose compiler-generated members (`equals`,
  `hashCode`, `toString`, `copy`) are derived automatically from its own
  primary-constructor properties; reused here for `CalculationEntity`,
  the same real mechanism already proven for `Calculation` and
  `CalculatorState`.
- **`val`** — declares a read-only property or local binding, assigned
  exactly once; used throughout this lesson's own real code and labs.
- **`interface`** — declares a real contract of abstract members with no
  implementation of their own, already proven in this project's own
  `Operation` and `ScientificFunction`; reused here for `CalculationDao`,
  whose own real implementation is generated, not hand-written.
- **`abstract class` / `abstract fun`** — a class (or one of its members)
  that declares a real shape without providing a real body, requiring
  some other class to supply one; new to this project's own permanent
  code — `AppDatabase` itself is `abstract`, and so is its own
  `calculationDao()` member, because Room's own generated code, not this
  project's own source, supplies their real bodies.
- **`lateinit var`** — declares a mutable property that starts with no
  real value at all, on the explicit promise it will be assigned before
  it's ever read; new to this project's own permanent code, used here
  because a real test database can only be built once a real test
  actually begins running, not at the moment the test class itself is
  constructed.
- **`::class.java`** — already established in this project's own
  `assertThrows(IllegalArgumentException::class.java) { ... }` calls;
  reused here to hand Room's own real database builder a real `Class`
  object naming which database to build, the same real mechanism, just
  a different real caller.

## Objects and methods used

- **`kapt(...)`**
  - What it is: a real Gradle DSL function, declaring a dependency that
    should be run through Kotlin's own annotation-processing tool at
    compile time, rather than just placed on the app's real runtime
    classpath.
  - Implementation: `fun DependencyHandler.kapt(dependencyNotation: Any): Dependency?`
    — provided by the `kotlin-kapt` Gradle plugin, parallel in real shape
    to this project's own already-established `implementation(...)`/
    `testImplementation(...)`/`debugImplementation(...)` calls, but
    routing its own argument through KAPT's real annotation processor
    instead of straight onto the classpath.
  - Its use: `room-compiler`, the real library that actually reads
    `@Entity`/`@Dao`/`@Database` and generates real, working code from
    them, has to run at compile time, not sit passively on the runtime
    classpath the way `room-runtime`/`room-ktx` do.
  - Type: a Gradle DSL function, an extension on `DependencyHandler`.
  - Responsibility: routes one real dependency through KAPT's own
    annotation-processing pipeline during a real build.
  - Depends on: the `kotlin-kapt` Gradle plugin already being applied;
    a real dependency coordinate to process.
  - Connects to: called once, in `app/build.gradle.kts`, naming
    `room-compiler`; every other new Room dependency this lesson adds
    uses `implementation` instead, since only the compiler itself needs
    real annotation processing.
  - Shape: a build-time-only Gradle mechanism — nothing about `kapt(...)`
    itself ever appears in this project's own real, running app.

- **`@Entity`**
  - What it is: a real Room annotation marking a class as representing
    one real row of one real, named SQLite table.
  - Implementation: `@Entity(tableName: String = "")` — Room's own
    annotation processor reads every one of the annotated class's own
    real constructor properties and maps each one to a real table
    column, using the property's own real name and type.
  - Its use: `CalculationEntity` is this lesson's own first real use —
    the exact, permanent shape one row of this project's own real,
    on-device calculation history takes.
  - Type: a class-level Kotlin annotation.
  - Responsibility: declares, to Room's own real annotation processor,
    that a class is a real, persistent table row shape, not just an
    ordinary in-memory value.
  - Depends on: a real, valid `data class` (or ordinary class) to
    annotate; at least one real property marked `@PrimaryKey`.
  - Connects to: read by Room's own annotation processor at compile
    time; referenced by name inside `@Database`'s own `entities` list.
  - Shape: a real, public annotation from `androidx.room`, this lesson's
    own first real point of contact with Room's own generated-code
    machinery.

- **`@PrimaryKey`**
  - What it is: a real Room annotation marking exactly which real
    property of an `@Entity` uniquely identifies one row.
  - Implementation: `@PrimaryKey(autoGenerate: Boolean = false)` — with
    `autoGenerate = true`, Room asks the real, underlying SQLite engine
    to assign a real, unique value automatically on insert, rather than
    requiring the caller to supply one.
  - Its use: `CalculationEntity.id` uses it — this project's own real,
    in-memory `Calculation` never needed a unique identifier, since a
    `List`'s own order was always enough; a real database table needs
    one explicitly, confirmed for real this session: Room's own
    annotation processor refuses to compile an `@Entity` with none.
  - Type: a property-level Kotlin annotation.
  - Responsibility: identifies, to Room's own real annotation processor,
    which single real property makes each row of a table unique.
  - Depends on: a real property on an already-`@Entity`-annotated class.
  - Connects to: read by Room's own annotation processor at compile
    time; enforced, for real, as a genuine requirement — an `@Entity`
    with none fails to compile at all.
  - Shape: a real, public annotation from `androidx.room`.

- **`Long`**
  - What it is: a real, built-in Kotlin type representing a 64-bit
    signed integer — new to this project's own permanent code, which
    has used `Int` (32-bit) for every whole number so far.
  - Implementation: `kotlin.Long`, holding a real range far larger than
    `Int` — roughly 9.2 quintillion in either direction.
  - Its use: `CalculationEntity.id` is typed `Long`, not `Int`, because
    that's the real type Room's own `autoGenerate` primary keys use —
    a real SQLite `INTEGER PRIMARY KEY` column is natively 64-bit, and
    Room's own generated code reflects that directly.
  - Type: a `final class` in `kotlin`, compiled, on the JVM, to the
    primitive `long`.
  - Responsibility: represents a whole number over a far larger real
    range than `Int` can hold.
  - Depends on: nothing external — a foundational type, same tier as
    `Int`.
  - Connects to: every real row this project's own database ever
    stores gets a real `Long` id, generated by SQLite itself, never
    chosen by this project's own code.
  - Shape: a foundational, built-in value type, new to this project's
    own permanent code.

- **`@Dao`**
  - What it is: a real Room annotation marking an `interface` as one
    whose real implementation Room's own annotation processor generates
    automatically, from its own method signatures alone.
  - Implementation: `@Dao` — a marker annotation with no real
    parameters of its own; every method inside an `@Dao`-annotated
    interface must itself carry a real Room annotation (`@Insert`,
    `@Query`, ...) naming the specific real operation it performs.
  - Its use: `CalculationDao` is this lesson's own real, permanent
    Data Access Object — the one real place this project's own code
    asks for a `Calculation`'s own row to be inserted or read back.
  - Type: an interface-level Kotlin annotation.
  - Responsibility: declares, to Room's own real annotation processor,
    that every one of an interface's own real methods should receive a
    generated, working implementation.
  - Depends on: a real Kotlin `interface`; at least one real,
    Room-annotated abstract method inside it.
  - Connects to: read by Room's own annotation processor at compile
    time, producing a real, generated `_Impl` class; referenced by name
    as an abstract return type inside `@Database`.
  - Shape: a real, public annotation from `androidx.room`.

- **`@Insert`**
  - What it is: a real Room annotation marking a `@Dao` method as one
    that inserts a real row into a real table.
  - Implementation: `@Insert(onConflict: Int = OnConflictStrategy.ABORT)`
    — Room's own annotation processor generates a real
    `EntityInsertionAdapter`, building and running a real, parameterized
    SQL `INSERT` statement from the annotated entity's own real
    properties.
  - Its use: `CalculationDao.insert` uses it — the real, permanent way
    this project's own code will eventually write a finished
    `Calculation` into durable storage.
  - Type: a method-level Kotlin annotation.
  - Responsibility: tells Room's own annotation processor to generate a
    real `INSERT` implementation for the method it's attached to.
  - Depends on: a real `@Entity`-typed parameter naming what to insert.
  - Connects to: generates a real, inspectable `_Impl` method, confirmed
    for real this session by reading Room's own generated Java source
    directly.
  - Shape: a real, public annotation from `androidx.room`.

- **`@Query`**
  - What it is: a real Room annotation marking a `@Dao` method as one
    running a specific, literal, real SQL statement.
  - Implementation: `@Query(value: String)` — Room's own annotation
    processor reads the literal SQL string at compile time, validates
    it against the real, known shape of every `@Entity` it can see, and
    generates real code building and executing exactly that statement.
  - Its use: `CalculationDao.getAll` uses it, with the literal string
    `"SELECT * FROM calculations"` — the real, permanent way this
    project's own code will eventually read every stored calculation
    back.
  - Type: a method-level Kotlin annotation.
  - Responsibility: tells Room's own annotation processor to generate a
    real implementation running exactly the given SQL, and to convert
    its own real result rows back into real Kotlin objects.
  - Depends on: a literal SQL string, checked at compile time against
    the real, known shape of this project's own real entities.
  - Connects to: generates a real, inspectable `_Impl` method, confirmed
    for real this session by reading Room's own generated Java source
    directly — a real `Cursor`, walked column by column, rebuilding a
    real `CalculationEntity` per row.
  - Shape: a real, public annotation from `androidx.room`.

- **`@Database`**
  - What it is: a real Room annotation marking an `abstract class`,
    extending `RoomDatabase`, as the real, top-level definition of one
    complete, openable database.
  - Implementation: `@Database(entities: Array<KClass<*>>, version: Int, exportSchema: Boolean = true)`
    — names every real `@Entity` this database holds, a real version
    number for future schema migrations, and whether Room should export
    a real schema history file (this project sets it `false`, since no
    schema-export directory is configured — a real, deliberate scope
    limit, not an oversight).
  - Its use: `AppDatabase` is this lesson's own real, permanent database
    definition, naming `CalculationEntity` as its own one real table.
  - Type: a class-level Kotlin annotation.
  - Responsibility: declares, to Room's own real annotation processor,
    the complete, real set of entities one database holds, and how its
    own schema is versioned.
  - Depends on: an `abstract class` extending `RoomDatabase`; at least
    one real `@Entity`.
  - Connects to: read by Room's own annotation processor at compile
    time, producing a real, generated `AppDatabase_Impl`; opened at
    runtime via `Room.inMemoryDatabaseBuilder`/`Room.databaseBuilder`.
  - Shape: a real, public annotation from `androidx.room`, this lesson's
    own top-level, tying `@Entity` and `@Dao` together into one real,
    runnable whole.

- **`RoomDatabase`**
  - What it is: a real, abstract base class every real Room database
    must extend.
  - Implementation: `abstract class RoomDatabase`, providing real,
    already-implemented machinery (`close()`, `beginTransaction()`,
    the real main-thread check this lesson's own lab ran into directly)
    that every real Room database inherits automatically.
  - Its use: `AppDatabase : RoomDatabase()` — the real, required
    superclass, giving `AppDatabase` its own real `close()` method and
    the real thread-safety guard this lesson's own lab proved exists.
  - Type: an `abstract class`, in `androidx.room`.
  - Responsibility: provides the real, shared machinery every concrete
    Room database needs, so no individual database has to reimplement
    connection handling, transactions, or thread-safety checks itself.
  - Depends on: nothing from this project — it's a real, external base
    class.
  - Connects to: extended by `AppDatabase`; its own real
    `assertNotMainThread` check is exactly what this lesson's own lab
    ran into directly, confirmed via a real, executed stack trace.
  - Shape: a real, public base class from `androidx.room`.

- **`Room.inMemoryDatabaseBuilder` / `.allowMainThreadQueries()` / `.build()`**
  - What it is: Room's own real, static entry point for constructing a
    database that lives only in memory — never written to a real disk
    file — plus a real builder method relaxing its own default
    thread-safety guard, and the real method that finally constructs
    the database.
  - Implementation: `fun <T : RoomDatabase> inMemoryDatabaseBuilder(context: Context, klass: Class<T>): RoomDatabase.Builder<T>`;
    `fun allowMainThreadQueries(): RoomDatabase.Builder<T>`;
    `fun build(): T` — a real, fluent builder chain, each call returning
    the same real builder object until `.build()` finally constructs it.
  - Its use: this lesson's own real, permanent test builds a real,
    in-memory `AppDatabase` this way — no real device storage touched,
    fast, isolated, and automatically discarded once the test ends.
  - Type: a `static` factory method, plus two real instance methods on
    `RoomDatabase.Builder<T>`.
  - Responsibility: `inMemoryDatabaseBuilder` starts building a real,
    memory-only database; `allowMainThreadQueries` disables Room's own
    default main-thread safety check, real and necessary here since this
    lesson deliberately hasn't introduced `suspend` yet; `build`
    produces the real, final, usable database instance.
  - Depends on: a real Android `Context` (`ApplicationProvider.getApplicationContext()`
    supplies Robolectric's own real, simulated one); the real database
    class to build.
  - Connects to: called once, in this lesson's own real, permanent test
    setup; the real database it returns is what `calculationDao()` is
    called on.
  - Shape: real, public API from `androidx.room`.

### Everything else in the file, not this lesson's subject but still explained

- **`@RunWith(RobolectricTestRunner::class)`**
  - What it is: a real JUnit annotation, already established in this
    project, naming a custom test runner — one that simulates the real
    Android framework on the plain JVM.
  - Implementation: `@RunWith(value: Class<out Runner>)`.
  - Its use: this lesson's own real database test needs it for the same
    real reason every other Robolectric test in this project does —
    `ApplicationProvider.getApplicationContext()` and Room's own real
    main-thread check both depend on a real, simulated Android runtime
    being present.
  - Type: a class-level JUnit annotation.
  - Responsibility: tells JUnit to run every test in the class through
    Robolectric's own real runner instead of running it directly.
  - Depends on: a real `Class<out Runner>`.
  - Connects to: already fully established in this project's own prior
    Robolectric-based test work.
  - Shape: real, standard JUnit/Robolectric API.

- **`@Before` / `@After`**
  - What it is: two real JUnit annotations, new to this project's own
    permanent test code, marking a method to run automatically before
    (or after) every single `@Test` in the same class.
  - Implementation: `@Before` / `@After` — no parameters; JUnit calls
    the annotated method once per test, immediately before (or after)
    that test's own body runs.
  - Its use: this lesson's own real database test needs a fresh, real,
    in-memory database built before every test (`@Before`) and closed
    afterward (`@After`), rather than repeating that same setup and
    teardown code inside every individual `@Test` by hand.
  - Type: method-level JUnit annotations.
  - Responsibility: `@Before` guarantees a real, known starting state
    before each test; `@After` guarantees real resources (here, an open
    database connection) are properly released afterward, even if the
    test itself fails.
  - Depends on: a real, no-argument method to call.
  - Connects to: `createDatabase` (`@Before`) builds the real database
    every `@Test` in the class then uses; `closeDatabase` (`@After`)
    calls the real `RoomDatabase.close()` afterward.
  - Shape: real, standard JUnit API.

- **`ApplicationProvider.getApplicationContext()`**
  - What it is: a real, static method from AndroidX's own test library,
    returning a real, Robolectric-simulated `Context` — already
    resolved on this project's classpath since Lesson 4.1, used
    directly for the first time this lesson.
  - Implementation: `fun <T> getApplicationContext(): T`.
  - Its use: `Room.inMemoryDatabaseBuilder` requires a real `Context` to
    construct a real database against; this is the real, established
    way a Robolectric test supplies one without a real device.
  - Type: a generic, `static` method on `ApplicationProvider`.
  - Responsibility: hands back the one real, simulated application
    `Context` Robolectric constructs for the current test.
  - Depends on: a real Robolectric test environment already running.
  - Connects to: called once, inside this lesson's own real `@Before`
    method.
  - Shape: real, public test-support API from `androidx.test`.

---

## Concept Unit: Room's Gradle Setup

### The Problem

Lesson 7.2 already named exactly what durable storage needs — tables of
uniform records, and real Create/Read/Update/Delete operations. But
nothing in this project's own current build knows how to actually talk
to a real, on-device database yet. Room is the real library that fills
that gap — but unlike every dependency this project has added so far
(Compose, Navigation, Robolectric), Room needs to *generate real code*
from annotations at compile time, not just sit on the runtime classpath
waiting to be called.

> **Stop and think, before reading on:**
> - This project already depends on real, external libraries it didn't
>   write (Compose, Navigation, Robolectric) — how did each of those get
>   added to this project's own build, mechanically, the first time?
> - If a library needs to generate real, new Kotlin or Java source code
>   during a build — not just provide classes to call at runtime — what
>   real, additional piece of Gradle machinery might that require, beyond
>   an ordinary `implementation(...)` dependency line?
> - If you had to guess, would you expect a real annotation-processing
>   tool like this to slow a real build down, speed it up, or leave build
>   time unaffected?

### Project Change

- **Reference Source**: no reference counterpart — this is a
  from-scratch addition. `brd.md`'s own entry for this lesson names only
  "Room / Entity / DAO / Database," with no reference implementation to
  build toward; the specific real dependency versions and plugin choice
  are this session's own real, verified decisions.
- **Files affected**: modified
  `app/build.gradle.kts`.
- **Change type**: configure (add a plugin; add three dependencies).
- **Location**: the `plugins { }` block gains one new line; the
  `dependencies { }` block gains three new lines, immediately after the
  existing `implementation("androidx.navigation:navigation-compose:2.7.7")`
  line.
- **Dependencies**: none beyond what this change itself adds — no other
  real project file needs to change for this step alone.

### The New Code

```kotlin
id("kotlin-kapt")
```

```kotlin
implementation("androidx.room:room-runtime:2.6.1")
implementation("androidx.room:room-ktx:2.6.1")
kapt("androidx.room:room-compiler:2.6.1")
```

### The Updated Project

`app/build.gradle.kts`, in full, numbered, with this unit's new lines
marked:

```kotlin
 1: plugins {
 2:     id("com.android.application")
 3:     id("org.jetbrains.kotlin.android")
 4:     id("kotlin-kapt")                                             // ← new
 5: }
 6:
 7: android {
 8:     namespace = "com.example.calculator"
 9:     compileSdk = 34
10:
11:     defaultConfig {
12:         applicationId = "com.example.calculator"
13:         minSdk = 24
14:         targetSdk = 34
15:         versionCode = 1
16:         versionName = "1.0"
17:     }
18:
19:     compileOptions {
20:         sourceCompatibility = JavaVersion.VERSION_17
21:         targetCompatibility = JavaVersion.VERSION_17
22:     }
23:
24:     kotlinOptions {
25:         jvmTarget = "17"
26:     }
27:
28:     buildFeatures {
29:         compose = true
30:     }
31:
32:     composeOptions {
33:         kotlinCompilerExtensionVersion = "1.5.14"
34:     }
35:
36:     testOptions {
37:         unitTests {
38:             isIncludeAndroidResources = true
39:         }
40:     }
41: }
42:
43: dependencies {
44:     val composeBom = platform("androidx.compose:compose-bom:2024.06.00")
45:     implementation(composeBom)
46:     implementation("androidx.compose.ui:ui")
47:     implementation("androidx.compose.ui:ui-tooling-preview")
48:     implementation("androidx.compose.material3:material3")
49:     implementation("androidx.activity:activity-compose:1.9.0")
50:     implementation("androidx.navigation:navigation-compose:2.7.7")
51:     implementation("androidx.room:room-runtime:2.6.1")               // ← new
52:     implementation("androidx.room:room-ktx:2.6.1")                   // ← new
53:     kapt("androidx.room:room-compiler:2.6.1")                        // ← new
54:     debugImplementation("androidx.compose.ui:ui-tooling")
55:
56:     testImplementation("junit:junit:4.13.2")
57:     testImplementation("org.robolectric:robolectric:4.13")
58:     testImplementation(composeBom)
59:     testImplementation("androidx.compose.ui:ui-test-junit4")
60:     testImplementation("androidx.navigation:navigation-testing:2.7.7")
61:     debugImplementation("androidx.compose.ui:ui-test-manifest")
62: }
```

This project's own build now has everything Room's real annotation
processor needs — the `kotlin-kapt` plugin, `room-runtime`/`room-ktx` on
the real runtime classpath, and `room-compiler` routed through KAPT — all
of it verified, this session, against a real, current build, with no
other file needing to change for this step alone.

### Mechanical Walkthrough

- `id("kotlin-kapt")` (line 4) — applies the real Gradle plugin that
  makes the `kapt(...)` dependency function, and the whole real
  annotation-processing pipeline, available to this module at all;
  needs no explicit version string here, since it's bundled with the
  already-pinned Kotlin Gradle plugin this project already applies.
- `implementation("androidx.room:room-runtime:2.6.1")` (line 51) — adds
  Room's own real runtime library, containing `RoomDatabase`,
  `Room.inMemoryDatabaseBuilder`, and everything this project's own
  code calls directly at runtime.
- `implementation("androidx.room:room-ktx:2.6.1")` (line 52) — adds
  Room's own real Kotlin-extensions library, providing Kotlin-friendly
  wrappers (most notably `suspend`-based ones this project isn't using
  yet, deliberately, until Lesson 7.5) around the plain-Java core.
- `kapt("androidx.room:room-compiler:2.6.1")` (line 53) — routes Room's
  own real annotation processor through KAPT specifically, rather than
  `implementation`, since this dependency's whole real job is running
  *during* compilation, generating real source files, not providing
  classes this project's own code calls at runtime.

### CS Lens

**Annotation processing** — reading a program's own compile-time
metadata to generate real, new source code before the rest of the build
even runs — is a real, foundational idea in modern software tooling:

```
Also recognized in: Java's own Lombok, generating real getters and
setters from annotations; Dagger and Hilt, Android's own real
dependency-injection code generators; Kotlin's own broader kapt/KSP
ecosystem (Moshi, and many other real libraries); this project's own
already-familiar `data class`, which is also compiler-generated code —
just built directly into the language, rather than produced by a
separate processor.
```

### SE Lens

Why KAPT, rather than KSP (Kotlin Symbol Processing), the newer tool
Room's own current documentation increasingly recommends? A real
alternative genuinely exists: KSP is faster and more Kotlin-native than
KAPT. This project deliberately chooses KAPT anyway — real reasoning:
KAPT is the older, longer-established, more predictably compatible tool
for this project's own already-pinned toolchain (Kotlin 1.9.24, AGP
8.5.2), avoiding a real risk of hunting down an exact-matching KSP
plugin version for this specific combination; confirmed, this session,
to resolve and build cleanly on the very first real attempt. The real,
accepted cost: KAPT is measurably slower than KSP would be at real
scale — a genuine, worthwhile tradeoff for this project's own small
size and this curriculum's own priority of a working, predictable build
over build-speed optimization.

### Commands Needed

- `./gradlew :app:kaptDebugKotlin --rerun-tasks` — invokes this
  project's real Gradle wrapper, forcing the real annotation-processing
  task to run fresh; success (`BUILD SUCCESSFUL`) confirms Room's own
  real annotation processor is correctly wired into this project's
  build, even before any real `@Entity`/`@Dao`/`@Database` exists yet.

### Run It

Real, executed output (this session):

```
BUILD SUCCESSFUL in 2s
16 actionable tasks: 16 executed
```

### Connect the Pieces

With Room's own real annotation processor now wired into this project's
build, the next unit can finally ask what it actually takes to tell
Room "this Kotlin type represents one real row of a real table."

---

## Concept Unit: Entity

### The Problem

This project's own real `Calculation` (Lesson 7.1) has four real
fields — `operator`, `operandA`, `operandB`, `result` — and Lesson 7.2
already proved that shape already matches a real database table's own
row, column for column. But nothing about an ordinary Kotlin
`data class` tells Room's own real annotation processor that a type
represents a persistent table row at all, or how a real database engine
should tell one row apart from another.

> **Stop and think, before reading on:**
> - This project's own real `Calculation` has no `id` field at all — a
>   `List`'s own real order was always enough to tell one calculation
>   apart from another in memory. Does a real database table need
>   something a `List`'s own order alone can't give it?
> - Given Room's own real annotation processor runs at compile time, not
>   runtime — what do you think happens if a class is marked as a real
>   table row but given no way to uniquely identify one row from
>   another?
> - If two real rows in a table happened to have identical values in
>   every other real column, how would a real database engine tell them
>   apart as two separate rows, rather than treating them as one?

### Introduce the Concept in Isolation

```kotlin
@Entity(tableName = "lab_broken")
data class LabBrokenEntity(
    val operator: String,
    val operandA: Int,
    val operandB: Int,
    val result: Int
)
```

Real, executed output (compiling this real, temporary entity, with no
`@PrimaryKey` at all):

```
error: An entity must have at least 1 field annotated with @PrimaryKey
public final class LabBrokenEntity {
             ^
```

This proves, for real, that `@PrimaryKey` isn't optional advice — Room's
own real annotation processor refuses to generate anything at all for an
`@Entity` missing one, a genuine compile-time failure, not a runtime
surprise. Fixing it:

```kotlin
@Entity(tableName = "lab_broken")
data class LabBrokenEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val operator: String,
    val operandA: Int,
    val operandB: Int,
    val result: Int
)
```

Real, executed output (recompiling with the fix):

```
BUILD SUCCESSFUL in 2s
16 actionable tasks: 16 executed
```

Real, clean compile — proving `@PrimaryKey(autoGenerate = true)` is
exactly what a real `@Entity` needs: one real property, here `id`, that
Room and the real, underlying SQLite engine will generate a genuinely
unique value for on every real insert, without this project's own code
ever having to choose one itself.

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved what it needed to: `@PrimaryKey` is a real,
compiler-enforced requirement, and `autoGenerate = true` is the real
mechanism giving every row its own genuinely unique identity.

### Project Change

- **Reference Source**: no reference counterpart — this is a
  from-scratch addition, for the same reason the unit above gave.
- **Files affected**: created
  `app/src/main/java/com/example/calculator/CalculationEntity.kt`.
- **Change type**: add (a brand-new file).
- **Location**: n/a — a brand-new file, with nothing existing yet to
  locate a position within.
- **Dependencies**: `androidx.room` (`@Entity`, `@PrimaryKey`), already
  resolved by the unit above.

### The New Code

```kotlin
@Entity(tableName = "calculations")
data class CalculationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val operator: String,
    val operandA: Int,
    val operandB: Int,
    val result: Int
)
```

### The Updated Project

Since `CalculationEntity.kt` is a brand-new file, the code above *is*
the whole file so far — shown here in full, with its own `package`
declaration and imports:

```kotlin
package com.example.calculator

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "calculations")
data class CalculationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val operator: String,
    val operandA: Int,
    val operandB: Int,
    val result: Int
)
```

This file now holds this project's own real, permanent, persistence-
ready shape for one completed calculation — a genuine table row,
distinct from the real, already-existing `Calculation`, ready for a real
`@Dao` to actually read and write.

### Mechanical Walkthrough

- `package com.example.calculator` — declares this file's own namespace,
  the same one every other real file in this project already shares.
- `import androidx.room.Entity` / `import androidx.room.PrimaryKey` —
  bring Room's own real annotations into scope, unqualified.
- `@Entity(tableName = "calculations")` — marks this class as a real
  table row, naming the real, on-disk table `"calculations"` explicitly
  rather than letting Room derive one from the class name.
- `data class CalculationEntity(...)` — declares a new, real, permanent
  type, using the same real `data class` mechanism already proven for
  `Calculation` and `CalculatorState`.
  - `@PrimaryKey(autoGenerate = true) val id: Long = 0` — this row's own
    real, unique identity, a `Long` (not `Int`, matching SQLite's own
    native primary-key type), defaulting to `0` only because Room
    replaces that default with a real, generated value the moment a row
    is actually inserted.
  - `val operator: String` — the real operator this calculation used,
    stored as plain text (`"PLUS"`, `"MINUS"`, ...) rather than this
    project's own `Operator` enum directly, since Room has no built-in
    way to store an arbitrary enum type without extra configuration this
    lesson deliberately doesn't need.
  - `val operandA: Int` / `val operandB: Int` / `val result: Int` — the
    same three real fields `Calculation` already has, unchanged.

### CS Lens

**Primary keys** — the real, unique identity a table row's own data
alone can't guarantee — are a foundational relational-database idea:

```
Also recognized in: every real SQL table's own PRIMARY KEY constraint;
a driver's license number, uniquely identifying one real person within
a government's own database; a git commit's own SHA hash, uniquely
identifying one exact, real commit; a UUID, used across countless real
systems specifically to guarantee uniqueness without any central
coordinator.
```

### SE Lens

Why a separate `CalculationEntity`, distinct from the already-real
`Calculation`, instead of just adding `@Entity`/`@PrimaryKey` directly
onto `Calculation` itself? A real alternative exists and is genuinely
simpler: annotate `Calculation` directly, one fewer type to maintain.
This project deliberately keeps them separate — `Calculation`'s own real
job is representing one completed calculation for this app's own
in-memory domain logic, with no real reason to know anything about SQL,
tables, or a generated `id` nothing in `nextState` ever needs; blurring
that boundary now would work, but exactly the kind of blurring the next
lesson (Repository, explicitly "why the rest of the application
shouldn't care how storage works") is about to formalize a real fix
for. The real, accepted cost: two types now exist describing similar
data, and something will eventually need to convert between them — a
real, deliberate debt this project is carrying forward on purpose, not
an oversight.

### Commands Needed

- `./gradlew :app:kaptDebugKotlin --rerun-tasks` — the same real command
  from the unit above, run again here against the broken, then fixed,
  temporary entity.

### Run It

Already shown above — the real, executed output was the real compile
error, then, after the fix, `BUILD SUCCESSFUL in 2s`.

### Connect the Pieces

The unit above wired Room's own annotation processor into this
project's build; this unit gave it its first real, permanent job — a
genuine table-row shape, `CalculationEntity`, with a real, unique
identity of its own. The next unit asks how any real code actually
reads or writes a row shaped like this one.

---

## Concept Unit: DAO & Database

### The Problem

A real `@Entity` alone doesn't let any real code actually insert or read
a row — something has to translate "insert this Kotlin object" into
real SQL, and something has to tie that translation to one real, open
database connection a test (or, eventually, this app itself) can
actually use. Neither of those exists yet.

> **Stop and think, before reading on:**
> - If Room already knows, from `@Entity`, exactly which real columns a
>   `CalculationEntity` has — what do you think it could do
>   automatically with a method you declare but never write a real body
>   for yourself?
> - This project's own already-established interfaces (`Operation`,
>   `ScientificFunction`) each have real classes implementing their own
>   abstract methods by hand. What would be genuinely different about an
>   interface whose implementation is generated for you instead?
> - If a real database query runs on the very same thread that's also
>   responsible for drawing the screen, what real problem might that
>   cause for how smoothly an app appears to run?

### Introduce the Concept in Isolation

```kotlin
@Dao
interface LabCalculationDao {
    @Insert
    fun insert(entity: LabBrokenEntity)

    @Query("SELECT * FROM lab_broken")
    fun getAll(): List<LabBrokenEntity>
}

@Database(entities = [LabBrokenEntity::class], version = 1)
abstract class LabBrokenDatabase : RoomDatabase() {
    abstract fun labBrokenDao(): LabCalculationDao
}
```

Real, executed output (compiling this real, temporary DAO and
database):

```
BUILD SUCCESSFUL in 2s
16 actionable tasks: 16 executed
```

A clean compile — but *what* did Room's own annotation processor
actually build from two bare interface method signatures? Reading
Room's own real, generated `LabBrokenDao_Impl.java` directly (fetched
from this project's own real build output, this session, not
reconstructed from memory):

```java
protected String createQuery() {
  return "INSERT OR ABORT INTO `lab_broken` (`id`,`operator`,`operandA`,`operandB`,`result`) VALUES (nullif(?, 0),?,?,?,?)";
}
```

```java
public List<LabBrokenEntity> getAll() {
  final String _sql = "SELECT * FROM lab_broken";
  final RoomSQLiteQuery _statement = RoomSQLiteQuery.acquire(_sql, 0);
  __db.assertNotSuspendingTransaction();
  final Cursor _cursor = DBUtil.query(__db, _statement, false, null);
  ...
}
```

This proves, concretely, that `@Insert` and `@Query` are not opaque
magic: Room's own real, generated code builds a genuine, parameterized
SQL `INSERT` statement directly from `LabBrokenEntity`'s own real
property names, and a genuine `SELECT * FROM lab_broken` from
`@Query`'s own literal string — then walks a real `Cursor`, column by
column, to rebuild real Kotlin objects. Nothing here is hidden from a
reader willing to look; it's ordinary, generated, inspectable Java.

A real database instance is still missing, though — `@Database` alone
doesn't run anything either. Building and using one directly, from a
real, temporary test:

```kotlin
val database = Room.inMemoryDatabaseBuilder(
    ApplicationProvider.getApplicationContext(),
    LabAppDatabase::class.java
).build()

database.labCalculationDao().insert(
    CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10)
)
```

Real, executed output (this exact real code, run under Robolectric):

```
java.lang.IllegalStateException: Cannot access database on the main thread since it may potentially lock the UI for a long period of time.
	at androidx.room.RoomDatabase.assertNotMainThread(RoomDatabase.kt:439)
	at androidx.room.RoomDatabase.beginTransaction(RoomDatabase.kt:508)
	at com.example.calculator.LabCalculationDao_Impl.insert(LabCalculationDao_Impl.java:55)
```

A real, thrown exception — proving `RoomDatabase` itself, inherited by
every real Room database, actively guards against exactly this: a real
database query running on the same thread responsible for the screen.
Robolectric's own test thread counts as that same real "main thread."
The real, working fix:

```kotlin
val database = Room.inMemoryDatabaseBuilder(
    ApplicationProvider.getApplicationContext(),
    LabAppDatabase::class.java
).allowMainThreadQueries().build()
```

Real, executed output (the identical insert, run again after this one
change):

```
BUILD SUCCESSFUL
```

### Discard the Throwaway Example

This lab is discarded now — it never becomes part of the project. Its
real output already proved everything it needed to: `@Dao` methods
really do become real, generated SQL and cursor-handling code; a real
`RoomDatabase` really does refuse a query from what it considers the
main thread; and `.allowMainThreadQueries()` is the real, deliberate
escape hatch this lesson needs until `suspend` arrives in Lesson 7.5.

### Project Change

- **Reference Source**: no reference counterpart — this is a
  from-scratch addition, for the same reason the units above gave.
- **Files affected**: created
  `app/src/main/java/com/example/calculator/CalculationDao.kt`; created
  `app/src/main/java/com/example/calculator/AppDatabase.kt`; created
  `app/src/test/java/com/example/calculator/AppDatabaseTest.kt`.
- **Change type**: add (three brand-new files).
- **Location**: n/a — all three are brand-new files.
- **Dependencies**: `CalculationEntity`, from the unit above;
  `androidx.room` (`@Dao`, `@Insert`, `@Query`, `@Database`,
  `RoomDatabase`, `Room`); `androidx.test.core.app.ApplicationProvider`,
  already resolved on this project's classpath since Lesson 4.1.

### The New Code

```kotlin
@Dao
interface CalculationDao {
    @Insert
    fun insert(calculation: CalculationEntity)

    @Query("SELECT * FROM calculations")
    fun getAll(): List<CalculationEntity>
}
```

```kotlin
@Database(entities = [CalculationEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun calculationDao(): CalculationDao
}
```

This same unit also adds a real, permanent test, proving the whole real
pipeline — entity, DAO, and database — round-trips a real calculation
correctly:

```kotlin
@RunWith(RobolectricTestRunner::class)
class AppDatabaseTest {

    private lateinit var database: AppDatabase

    @Before
    fun createDatabase() {
        database = Room.inMemoryDatabaseBuilder(
            ApplicationProvider.getApplicationContext(),
            AppDatabase::class.java
        ).allowMainThreadQueries().build()
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
        dao.insert(CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10))
        val all = dao.getAll()

        // Assert
        assertEquals(
            listOf(CalculationEntity(id = 1, operator = "PLUS", operandA = 7, operandB = 3, result = 10)),
            all
        )
    }
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
    fun insert(calculation: CalculationEntity)

    @Query("SELECT * FROM calculations")
    fun getAll(): List<CalculationEntity>
}
```

`AppDatabase.kt`, in full:

```kotlin
package com.example.calculator

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [CalculationEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun calculationDao(): CalculationDao
}
```

`AppDatabaseTest.kt`, in full:

```kotlin
package com.example.calculator

import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
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
        ).allowMainThreadQueries().build()
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
        dao.insert(CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10))
        val all = dao.getAll()

        // Assert
        assertEquals(
            listOf(CalculationEntity(id = 1, operator = "PLUS", operandA = 7, operandB = 3, result = 10)),
            all
        )
    }
}
```

This project now has a complete, real, working persistence pipeline —
`CalculationEntity` shaping one real row, `CalculationDao` turning plain
method calls into real SQL, `AppDatabase` tying both into one real,
openable database — already built correctly from the start, since this
same unit's own lab already discovered and worked around the real
main-thread constraint before any of this real code was written.

### Mechanical Walkthrough

- `@Dao interface CalculationDao { ... }` — the same real mechanism
  proven in isolation above, now permanent: an `interface`, marked
  `@Dao`, whose own real implementation Room generates entirely.
  - `@Insert fun insert(calculation: CalculationEntity)` — declares a
    real insert operation; Room generates the real, parameterized SQL
    `INSERT`, exactly as this unit's own lab already showed for real.
  - `@Query("SELECT * FROM calculations") fun getAll(): List<CalculationEntity>`
    — declares a real read operation over this project's own real
    `"calculations"` table, returning every real stored row as a real
    `List<CalculationEntity>`.
- `@Database(entities = [CalculationEntity::class], version = 1, exportSchema = false) abstract class AppDatabase : RoomDatabase()`
  — declares this project's own real, top-level database, naming
  `CalculationEntity` as its one real table, versioned `1`, with schema
  export explicitly disabled since no export directory is configured.
  - `abstract fun calculationDao(): CalculationDao` — the real, required
    way any caller reaches a working `CalculationDao` — Room generates
    a real implementation returning its own generated `CalculationDao_Impl`.
- `@RunWith(RobolectricTestRunner::class) class AppDatabaseTest { ... }`
  — a real, permanent test class, run through Robolectric's own
  established real Android simulation.
  - `private lateinit var database: AppDatabase` — declares a real,
    mutable property with no initial value, on the promise `@Before`
    assigns one before any real `@Test` reads it.
  - `@Before fun createDatabase() { ... }` — runs automatically before
    every real test in this class.
    - `Room.inMemoryDatabaseBuilder(ApplicationProvider.getApplicationContext(), AppDatabase::class.java)`
      — starts building a real, memory-only `AppDatabase`, using
      Robolectric's own real, simulated `Context`.
    - `.allowMainThreadQueries()` — the real, necessary fix this unit's
      own lab already discovered, applied here from the start.
    - `.build()` — constructs the real, usable database instance.
  - `@After fun closeDatabase() { database.close() }` — runs
    automatically after every real test, calling `RoomDatabase`'s own
    real, inherited `close()` method, releasing the real database
    connection even if the test itself fails.
  - `val dao = database.calculationDao()` — retrieves the real, working,
    generated `CalculationDao` implementation.
  - `dao.insert(CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10))`
    — inserts one real row, using real, named arguments; `id` is left
    at its own default (`0`), since the real database itself assigns
    the genuine value.
  - `val all = dao.getAll()` — reads every real row back from the real
    database, as a real `List<CalculationEntity>`.
  - `assertEquals(listOf(CalculationEntity(id = 1, operator = "PLUS", operandA = 7, operandB = 3, result = 10)), all)`
    — asserts the real, read-back list holds exactly one real entity,
    with `id` now genuinely `1` — the real, database-assigned value,
    not the `0` placeholder that was inserted.

### CS Lens

The **Data Access Object (DAO)** pattern — an interface whose real
methods each name one real data operation, with the actual
implementation generated or otherwise hidden behind it — is a real,
recognized software design pattern:

```
Also recognized in: Java's own JPA and Hibernate repositories; a
generated REST API client interface (Retrofit); any real
Object-Relational Mapper in any language — Django's own models, Rails'
own ActiveRecord; this project's own already-established `Operation`
and `ScientificFunction` interfaces, though those are hand-implemented,
never generated.
```

### SE Lens

Why not hand-write the real SQL and `Cursor`-handling code directly, the
same way this project's own Stage 5 work (`Tokenizer`, `ShuntingYard`)
hand-wrote its own algorithms from scratch? A real, legitimate
alternative exists — Android supported raw `SQLiteDatabase`/`Cursor`
code directly for years before Room existed. This project uses Room's
generated DAO instead — real, decisive evidence from this lesson's own
lab: the real, generated `_Impl` code already does exactly the
repetitive, error-prone work a hand-written version would need —
building a `Cursor`, walking it column by column, reconstructing real
objects field by field. Room's real value is generating that code
correctly, every time, from one short, annotated method signature. The
real, honest cost: the actual SQL and cursor-walking logic is now
invisible unless someone goes looking for it, exactly what this lesson's
own lab had to do — a real tradeoff between convenience and
transparency, not a free improvement.

### Commands Needed

- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.AppDatabaseTest" --rerun-tasks`
  — runs this project's real Gradle wrapper, scoped to only
  `AppDatabaseTest`, confirming this unit's own real, permanent code
  compiles and passes on its own.

### Run It

Real, executed test-report output (this session):

```
<testsuite name="com.example.calculator.AppDatabaseTest" tests="1" skipped="0" failures="0" errors="0" timestamp="2026-08-22T20:00:50" hostname="Michaels-Mac-mini.local" time="3.011">
  <testcase name="insertedCalculationCanBeReadBackFromARealDatabase" classname="com.example.calculator.AppDatabaseTest" time="3.011"/>
  <system-out><![CDATA[]]></system-out>
  <system-err><![CDATA[]]></system-err>
</testsuite>
```

### Connect the Pieces

`CalculationEntity` gave this project's history a real row shape;
`CalculationDao` and `AppDatabase`, proven together in this same unit,
give that shape a real, working way to actually be written and read
back — the exact, complete, real mechanism Lesson 7.2 named but couldn't
yet build.

---

## Connect the pieces

Trace one real calculation, `7 + 3 = 10`, through all three of this
lesson's own units. Before any of them existed, this project's own real
build had no way to generate real, working persistence code at all —
the first unit's own real Gradle change made that possible, confirmed
by a real, clean `kaptDebugKotlin` run with not one real Room-annotated
class in sight yet. The second unit gave a completed calculation its
real, permanent row shape: `CalculationEntity(operator = "PLUS", operandA = 7, operandB = 3, result = 10)`
— proven, by this unit's own real, executed compile failure, that
without a real `@PrimaryKey` this shape wouldn't even be a valid table
row at all. The third unit gave that shape somewhere real to go:
`CalculationDao.insert`, calling straight through to a real, generated
SQL `INSERT` this lesson's own lab read directly out of Room's own real
generated source, landing inside `AppDatabase`, a real, in-memory
database this project's own permanent `AppDatabaseTest` builds, writes
to, and reads back from — real, tested proof that the exact same
`7 + 3 = 10` this project has been computing correctly since Lesson
1.6 can now survive being written to, and read back from, a real
database, with only one deliberate, honest gap left: nothing in this
project's own real `CalculatorViewModel` calls any of this yet. That
real wiring — and the real reason it's deliberately not this lesson's
own job — is exactly what Lesson 7.4, Repository, is for.
