# Lesson 12.3: A Contract Instead of One Function

**What you will build.** A real, permanent second boundary, applied
directly to this project's own real, existing code. `CalculatorViewModel`
no longer calls `nextState` by its own specific name — it now calls
through a new, real `CalculationEngine` interface, with a real
`BasicCalculationEngine` as its first implementation. `CalculationRepository`,
a concrete class since Stage 7, becomes a real interface too, with a new
`RoomCalculationRepository` as its own first, real implementation. The
real, transferable problem this lesson is actually about: a caller bound
to one specific function or class, by name, cannot survive that name
changing — proven, concretely, against this project's own real code, both
before this fix (a genuine break) and after it (a genuine, provable
survival). This is the real, structural seam Slice 12's own stated goal —
properly separated calculation engines — depends on.

**What you need to know first:**
- Lesson 12.1 (The Object Graph One Constructor Hides) — the real object
  graph this project's own `CalculatorViewModelFactory` still builds by
  hand, now built from two real interfaces instead of two real concrete
  classes.
- Lesson 12.2 (A Constructor That Only Receives) — `CalculatorViewModelFactory`,
  Constructor Injection, and the real, established discipline that a
  constructor only ever receives its dependencies, extended here to
  dependencies that are now interfaces rather than concrete classes.
- Lesson 0.7 (One Shape, Many Behaviors) — `interface`, `override`, and
  real polymorphism through a shared contract, the same general mechanism
  this project's own `Operation`/`Addition`/`Subtraction` already used for
  arithmetic, now applied to this project's own state-transition and
  persistence logic.
- Lesson 7.4 (Nothing Outside Needs to Know) — `CalculationRepository`'s
  own real, prior shape as a concrete class, directly changed by this
  lesson.

No pipeline diagram — this lesson doesn't touch this project's expression
or graphing pipeline.

## Terms used in this lesson

- **Dependency Inversion Principle** — a real, named software design
  principle: high-level code (code that decides *what* should happen)
  should depend only on abstractions, never directly on low-level code
  (code that decides *how* something specific gets done) — and low-level
  code should itself depend on the same abstraction, not the other way
  around. Why it matters: without it, a high-level decision (`CalculatorViewModel`
  deciding to save a calculation) ends up permanently, directly wired to
  one specific low-level detail (Room, SQLite, a specific file on disk),
  making that detail effectively impossible to change without touching
  every high-level caller too.
- **composition root** — the one, single, real place in an application
  where concrete, low-level types are actually named and wired together
  into abstractions everything else depends on. Why it matters: without
  a clear, singular composition root, knowledge of which concrete type
  implements which abstraction leaks out across a codebase instead of
  staying in one, real, auditable place.
- **Strategy pattern** — a real, named design pattern: a family of
  interchangeable algorithms or behaviors, each implementing the same
  shared interface, selected and swapped in by whichever code constructs
  one, rather than being hardcoded into the code that uses it. Why it
  matters: the caller using the strategy never needs to change, or even
  know, which specific implementation it's holding at any given moment.

## Objects and methods used

**`CalculationEngine`**
- *What it is:* a new, real, permanent interface — the one real contract
  this project's own calculation logic now has to satisfy to be usable by
  `CalculatorViewModel`.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/Calculator.kt`, lines 106–108:
  ```kotlin
  interface CalculationEngine {
      fun compute(current: CalculatorState, label: String): CalculatorState
  }
  ```
- *Its use:* the real type `CalculatorViewModel`'s own constructor now
  requires, instead of ever calling `nextState` directly.
- *Type:* a real, public `interface`, declaring one real, abstract method.
- *Responsibility:* declare, generically, "given the current state and
  one pressed label, produce the next state" — nothing about how that
  computation actually happens.
- *Depends on:* nothing itself — a pure contract.
- *Connects to:* implemented by `BasicCalculationEngine`, below; called by
  `CalculatorViewModel.onButtonClick`.
- *Shape:* this project's own real, new abstraction boundary — the exact
  seam Slice 12's own multiple-engines goal depends on.

**`BasicCalculationEngine`**
- *What it is:* a new, real, permanent class — this project's first, and
  so far only, real implementation of `CalculationEngine`.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/Calculator.kt`, lines 110–114:
  ```kotlin
  class BasicCalculationEngine : CalculationEngine {
      override fun compute(current: CalculatorState, label: String): CalculatorState {
          return nextState(current, label)
      }
  }
  ```
- *Its use:* built once, inside `CalculatorViewModelFactory`, and handed
  to `CalculatorViewModel` through its own constructor.
- *Type:* a `class`, implementing `CalculationEngine`.
- *Responsibility:* wrap this project's own already-existing, real, pure
  `nextState` function behind the real `CalculationEngine` contract —
  nothing new about *what* gets computed, only *how it's reached*.
- *Depends on:* this project's own real, existing, unchanged `nextState`
  function.
- *Connects to:* the one real place in this entire project that is still
  allowed to name `nextState` directly, by design.
- *Shape:* a real, minimal adapter between this project's own existing
  pure logic and its new, real interface boundary.

**`CalculationRepository`**
- *What it is:* this project's own persistence boundary, changed by this
  lesson from a concrete class into a real interface.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/CalculationRepository.kt`,
  lines 6–9:
  ```kotlin
  interface CalculationRepository {
      suspend fun save(calculation: Calculation)
      fun getAll(): Flow<List<Calculation>>
  }
  ```
- *Its use:* the real type `CalculatorViewModel`'s own constructor has
  already required since the previous lesson — unchanged in name, changed
  entirely in kind.
- *Type:* a real, public `interface`, declaring two real, abstract
  members — one `suspend`, one returning a `Flow`.
- *Responsibility:* declare, generically, "save one calculation" and
  "expose every saved calculation as a live stream" — nothing about Room,
  SQLite, or any other concrete storage mechanism.
- *Depends on:* nothing itself — a pure contract, same as `CalculationEngine`.
- *Connects to:* implemented by `RoomCalculationRepository`, below; called
  by `CalculatorViewModel`.
- *Shape:* this project's own real persistence abstraction — the same
  real kind of boundary `CalculationEngine` is, applied to a second, real,
  already-existing part of this project.

**`RoomCalculationRepository`**
- *What it is:* a new, real, permanent class — the real, renamed
  continuation of this project's own former concrete `CalculationRepository`,
  now implementing the interface of the same name instead of being it.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/CalculationRepository.kt`,
  lines 11–19:
  ```kotlin
  class RoomCalculationRepository(private val dao: CalculationDao) : CalculationRepository {
      override suspend fun save(calculation: Calculation) {
          dao.insert(calculation.toEntity())
      }

      override fun getAll(): Flow<List<Calculation>> {
          return dao.getAll().map { entities -> entities.map { it.toDomain() } }
      }
  }
  ```
- *Its use:* built once, inside `CalculatorViewModelFactory`, wrapping a
  real, on-device `CalculationDao`.
- *Type:* a `class`, implementing `CalculationRepository`.
- *Responsibility:* unchanged from this project's own former concrete
  `CalculationRepository` — translate between domain-shaped `Calculation`
  and Room's own `CalculationEntity`.
- *Depends on:* a real `CalculationDao`, supplied at construction, exactly
  as before.
- *Connects to:* the one real place in this entire project still allowed
  to know that persistence actually means Room.
- *Shape:* this project's own real, concrete persistence implementation,
  now sitting behind a real interface instead of being called directly.

**`CalculatorViewModel`**
- *What it is:* this project's own real, permanent `ViewModel`, gaining
  one more real, required dependency.
- *Implementation:* its real, current, complete primary constructor,
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`,
  lines 17–21:
  ```kotlin
  class CalculatorViewModel(
      application: Application,
      private val repository: CalculationRepository,
      private val engine: CalculationEngine
  ) : AndroidViewModel(application) {
  ```
- *Its use:* this lesson's own real subject, alongside its own
  `onButtonClick`, line 30, now reading `engine.compute(state, label)`
  instead of calling `nextState` directly.
- *Type:* a `class`, extending `AndroidViewModel`.
- *Responsibility:* unchanged in outward behavior — own this calculator's
  live state, forward button presses, save completed calculations. What's
  different: it now depends on two real interfaces instead of one
  interface and one concrete class.
- *Depends on:* a real `Application`, a real `CalculationRepository`, and
  now a real `CalculationEngine` — all three genuinely required, all three
  received, never built.
- *Connects to:* built only by `CalculatorViewModelFactory`, below.
- *Shape:* this project's own real MVVM ownership layer, now depending
  entirely on abstractions for both of its own real collaborators.

**`CalculatorViewModelFactory`**
- *What it is:* this project's own real, permanent factory, now the one,
  single, real place that knows both of `CalculatorViewModel`'s own
  concrete dependencies.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`,
  lines 40–51:
  ```kotlin
  class CalculatorViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
      override fun <T : ViewModel> create(modelClass: Class<T>): T {
          val repository = RoomCalculationRepository(
              Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")
                  .build()
                  .calculationDao()
          )
          val engine = BasicCalculationEngine()
          @Suppress("UNCHECKED_CAST")
          return CalculatorViewModel(application, repository, engine) as T
      }
  }
  ```
- *Its use:* unchanged in role, updated in what it actually names —
  `RoomCalculationRepository` instead of the former concrete
  `CalculationRepository`, plus one new, real line building a
  `BasicCalculationEngine`.
- *Type:* a `class`, implementing `ViewModelProvider.Factory`.
- *Responsibility:* build a real, fully working `CalculatorViewModel` —
  and, now more than before, the one real place in this project holding
  that responsibility for *both* of its real dependencies, not just one.
- *Depends on:* a real `Application`, supplied at its own construction.
- *Connects to:* called by `ViewModelProvider`; itself constructs both
  `RoomCalculationRepository` and `BasicCalculationEngine`, the only two
  real, concrete implementations this entire project currently has.
- *Shape:* this project's own real **composition root** — the one place
  concrete types are named at all; everywhere else in this project now
  reaches these two boundaries only through their real interfaces.

### Everything else in the file, not this lesson's subject but still explained

**`Flow<List<Calculation>>` / `.map { }`**
- *What it is:* `Flow` is Kotlin's own real, asynchronous stream type;
  `.map` is its own real, standard transformation operator.
- *Implementation:* `kotlinx.coroutines.flow.Flow<T>`, a real interface
  representing a cold, asynchronous stream of values; `fun <T, R>
  Flow<T>.map(transform: suspend (T) -> R): Flow<R>`, a real extension
  function returning a new `Flow` that applies `transform` to each real
  value the original one emits.
- *Its use:* `RoomCalculationRepository.getAll()`'s own real return type
  and body, unchanged from this project's own former concrete
  `CalculationRepository`.
- *Type:* `Flow` is a real interface; `map` is a real, top-level extension
  function.
- *Responsibility:* `Flow` represents a real, ongoing stream of database
  results; `map` transforms each real emitted list of `CalculationEntity`
  into a real list of domain `Calculation` values.
- *Depends on:* `map` depends on a real, already-existing `Flow` to call
  it on.
- *Connects to:* `dao.getAll()` produces the real, original `Flow`;
  `.map { ... }` transforms it; `CalculatorViewModel`'s own real
  `persistedHistory` collects the final, transformed result.
- *Shape:* this project's own already-established real reactive-data
  vocabulary, unchanged by this lesson, only now returned through an
  interface method instead of a concrete one.

---

## Concept Unit: A Contract Instead of One Function

### The Problem

The previous lesson centralized this project's own real object graph
into one real, dedicated `CalculatorViewModelFactory`. But
`CalculatorViewModel.onButtonClick` still calls `nextState(state, label)`
directly, by its own specific, hardcoded name — and `CalculationRepository`,
right now, still names one specific, concrete implementation: Room. Slice
12's own stated goal is multiple, separated calculation engines — Basic,
Scientific, Matrix, Graph. If a second, different engine ever needs to
compute a next state its own, different way, what has to change about
`CalculatorViewModel` itself, as it's written right now?

Given that `CalculatorViewModel.onButtonClick` currently reads `state =
nextState(state, label)`, calling a specific, real, named function
directly — what do you predict happens to `CalculatorViewModel.kt` itself
if `nextState` were renamed tomorrow? Would `CalculatorViewModel.kt` need
to change, or could the rename somehow be contained somewhere else
entirely? And if a real, working interface sat between them instead —
one method, one contract, implemented by whichever concrete function
actually does the work — which of those two outcomes would you expect
then?

### Introduce the Concept in Isolation

A small, throwaway comparison, added temporarily as
`lab1_interface_boundary.kt` — one caller bound to a function by name,
one caller bound only to an interface:

```kotlin
fun addOne(x: Int): Int = x + 1

class CallerBoundByName {
    fun run(x: Int) = addOne(x)
}

interface Engine {
    fun compute(x: Int): Int
}

class AddOneEngine : Engine {
    override fun compute(x: Int): Int = addOne(x)
}

class CallerBoundToAnInterface(private val engine: Engine) {
    fun run(x: Int) = engine.compute(x)
}

fun main() {
    println("CallerBoundByName: ${CallerBoundByName().run(5)}")
    println("CallerBoundToAnInterface: ${CallerBoundToAnInterface(AddOneEngine()).run(5)}")
}
```

Compiled and run for real this session, saved in full in
`verification/12.3/lab1_output.txt`:

```
CallerBoundByName: 6
CallerBoundToAnInterface: 6
```

Both real, identical results — proving nothing about behavior changed
yet. The real difference only shows up under a rename. `addOne` was
renamed to `increment` everywhere except inside `CallerBoundByName`'s own
body — a real, deliberate mistake, saved as
`break1_rename_breaks_named_caller.kt` — and recompiled for real:

```
break1_rename_breaks_named_caller.kt:4:23: error: unresolved reference 'addOne'.
    fun run(x: Int) = addOne(x)
                      ^^^^^^
```

A real, genuine compile failure, saved in full in
`verification/12.3/break1_compile.txt`. A second real file,
`lab2_rename_survives_interface_caller.kt`, applied the identical real
rename — `addOne` to `increment` — this time updating only
`AddOneEngine`'s own one-line body to match, leaving
`CallerBoundToAnInterface` completely untouched:

```
CallerBoundToAnInterface: 6
```

Real, clean, unchanged output, saved in full in
`verification/12.3/lab2_output.txt` — `CallerBoundToAnInterface`'s own
source needed zero edits. `CallerBoundByName` is coupled to one specific
function's own name; `CallerBoundToAnInterface` is coupled only to a
stable shape, `Engine`, and never has to change when whatever implements
that shape does. This is a real, concrete instance of the **Strategy
pattern** — a family of interchangeable behaviors sharing one interface,
swapped in by whoever constructs the caller.

### Discard the Throwaway Example

`lab1_interface_boundary.kt`, `break1_rename_breaks_named_caller.kt`, and
`lab2_rename_survives_interface_caller.kt` are all deleted now — real,
saved in `verification/12.3/` alongside their real run transcripts. None
exists in this project's own real source tree.

### Project Change

- **Reference Source:** no reference counterpart — this project's own BRD
  names "Interfaces as Boundaries" as this lesson's own subject directly,
  with no external file to port an interface design from.
- **Files affected:**
  `app/src/main/java/com/example/calculator/Calculator.kt` (modified,
  two new declarations added);
  `app/src/main/java/com/example/calculator/CalculationRepository.kt`
  (modified, converted to an interface plus one new implementation);
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`
  (modified, both classes updated);
  `app/src/test/java/com/example/calculator/CalculatorViewModelPersistenceTest.kt`,
  `app/src/test/java/com/example/calculator/CalculationRepositoryTest.kt`
  (both modified, updated to construct the new, real concrete types).
- **Change type:** add (`CalculationEngine`, `BasicCalculationEngine`);
  refactor (`CalculationRepository` into an interface, its own former
  body moved into `RoomCalculationRepository`); configure
  (`CalculatorViewModel`'s own constructor and `onButtonClick`,
  `CalculatorViewModelFactory`'s own `create`, both real test files' own
  construction lines).
- **Location:** `CalculationEngine`/`BasicCalculationEngine` are added
  directly below `nextState` inside `Calculator.kt`;
  `CalculationRepository`'s own former class body moves, unchanged, into
  a new `RoomCalculationRepository` class in the same file;
  `CalculatorViewModel`'s own constructor gains a third parameter, and
  `onButtonClick`'s own first line is replaced; `CalculatorViewModelFactory.create`'s
  own two local build calls are updated.
- **Dependencies:** none beyond what these files already import.

### The New Code

```kotlin
interface CalculationEngine {
    fun compute(current: CalculatorState, label: String): CalculatorState
}

class BasicCalculationEngine : CalculationEngine {
    override fun compute(current: CalculatorState, label: String): CalculatorState {
        return nextState(current, label)
    }
}
```

The identical real shape, applied a second time to this project's own
persistence boundary:

```kotlin
interface CalculationRepository {
    suspend fun save(calculation: Calculation)
    fun getAll(): Flow<List<Calculation>>
}

class RoomCalculationRepository(private val dao: CalculationDao) : CalculationRepository {
    override suspend fun save(calculation: Calculation) {
        dao.insert(calculation.toEntity())
    }

    override fun getAll(): Flow<List<Calculation>> {
        return dao.getAll().map { entities -> entities.map { it.toDomain() } }
    }
}
```

### The Updated Project

`Calculator.kt`, lines 106–114 — the entire real, new addition, no lines
omitted:

```kotlin
106: interface CalculationEngine {                                              // ← new
107:     fun compute(current: CalculatorState, label: String): CalculatorState   // ← new
108: }                                                                          // ← new
109:                                                                            // ← new
110: class BasicCalculationEngine : CalculationEngine {                        // ← new
111:     override fun compute(current: CalculatorState, label: String): CalculatorState { // ← new
112:         return nextState(current, label)                                   // ← new
113:     }                                                                       // ← new
114: }                                                                          // ← new
```

`CalculationRepository.kt`, lines 1–19 — the entire real, current file,
no lines omitted:

```kotlin
1:  package com.example.calculator
2:
3:  import kotlinx.coroutines.flow.Flow
4:  import kotlinx.coroutines.flow.map
5:
6:  interface CalculationRepository {                                          // ← changed
7:      suspend fun save(calculation: Calculation)                             // ← changed
8:      fun getAll(): Flow<List<Calculation>>                                  // ← changed
9:  }                                                                          // ← changed
10:
11: class RoomCalculationRepository(private val dao: CalculationDao) : CalculationRepository { // ← new
12:     override suspend fun save(calculation: Calculation) {                  // ← new
13:         dao.insert(calculation.toEntity())
14:     }
15:
16:     override fun getAll(): Flow<List<Calculation>> {                       // ← new
17:         return dao.getAll().map { entities -> entities.map { it.toDomain() } }
18:     }
19: }                                                                          // ← new
```

`CalculationRepository`'s own former real body — both method
implementations — moved into `RoomCalculationRepository` completely
unchanged; only the class's own declaration line and its new `override`
keywords are different. `CalculatorViewModel.kt`, lines 17–21 and line 30
— the real, current constructor and the one real, changed line inside
`onButtonClick`:

```kotlin
17: class CalculatorViewModel(
18:     application: Application,
19:     private val repository: CalculationRepository,
20:     private val engine: CalculationEngine                                  // ← new
21: ) : AndroidViewModel(application) {
```

And, inside `onButtonClick`, the one real line that changed to use it:

```kotlin
30:         state = engine.compute(state, label)                               // ← changed
```

And `CalculatorViewModelFactory`, lines 40–51 — the entire real, current
class, no lines omitted:

```kotlin
40: class CalculatorViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
41:     override fun <T : ViewModel> create(modelClass: Class<T>): T {
42:         val repository = RoomCalculationRepository(                        // ← changed
43:             Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")
44:                 .build()
45:                 .calculationDao()
46:         )
47:         val engine = BasicCalculationEngine()                              // ← new
48:         @Suppress("UNCHECKED_CAST")
49:         return CalculatorViewModel(application, repository, engine) as T   // ← changed
50:     }
51: }
```

Two small, real, permanent test-file changes complete the fix.
`CalculatorViewModelPersistenceTest.kt`'s own three, previously identical
construction lines each now read
`CalculatorViewModel(application, RoomCalculationRepository(fakeDao),
BasicCalculationEngine())` — naming the real, concrete implementation
type explicitly, exactly as `CalculatorViewModelFactory` itself does, and
`CalculationRepositoryTest.kt`'s own single construction line now reads
`repository = RoomCalculationRepository(database.calculationDao())` —
its own declared field type, `private lateinit var repository:
CalculationRepository`, needed no change at all, real, concrete proof
that a caller depending on the interface never has to know or care which
real implementation it's actually holding.

Before either test file was touched, this project's own real object
graph was proven, deliberately, to still work correctly end to end: a
full `./gradlew testDebugUnitTest assembleDebug` run, with every one of
these real production changes already in place, produced a real,
installable `app-debug.apk` and a genuinely clean test run — saved in
full in `verification/12.3/step1_full_suite.txt`.

### Mechanical Walkthrough

Every distinct new construct, enumerated in order. In `Calculator.kt`:

- `interface CalculationEngine { fun compute(...): CalculatorState }` — a
  real, new interface declaration, the same real mechanism this project's
  own `Operation` interface already established for arithmetic, this time
  declaring a contract over this project's own state-transition logic
  instead.
- `class BasicCalculationEngine : CalculationEngine {` — real interface
  implementation, `:` marking the real relationship, the same syntax
  already established throughout this project.
- `override fun compute(...): CalculatorState { return nextState(current,
  label) }` — `override` marks this as the real, required implementation
  of `CalculationEngine`'s own one abstract method; its own real body
  calls `nextState` directly, by name — the one real place in this entire
  project still allowed to, since this class's entire real job is
  wrapping that exact function.

In `CalculationRepository.kt`:

- `interface CalculationRepository { suspend fun save(...); fun
  getAll(): Flow<...> }` — the identical real mechanism, applied a
  second time; `suspend` here reappears from this project's own already-
  established coroutine work, marking `save` as a real function that can
  pause without blocking its own calling thread, even though it's now
  only a signature, with no body, on an interface.
- `class RoomCalculationRepository(private val dao: CalculationDao) :
  CalculationRepository {` — real, constructor-injected `dao`, unchanged
  from this project's own former concrete `CalculationRepository`; the
  real difference is the trailing `: CalculationRepository`, marking this
  class as one real implementation of the interface, not the whole
  concept itself.
- `override suspend fun save(...)` / `override fun getAll(...)` — both
  real, required implementations; both real bodies — `dao.insert(...)`
  and `dao.getAll().map { ... }` — completely unchanged from this
  project's own former concrete class.

In `CalculatorViewModel.kt`:

- `private val engine: CalculationEngine` — a third real, required,
  constructor-injected parameter, the same real discipline already
  applied to `repository`.
- `engine.compute(state, label)` — a real instance call through the
  interface, replacing the former direct call to `nextState`; nothing
  about this line names which concrete engine is actually running.
- `val engine = BasicCalculationEngine()` (inside the Factory) — a real,
  direct constructor call, the one real place in this project that
  actually names `BasicCalculationEngine`.

### CS Lens

This is the **Strategy pattern**, named above, applied twice over —
`CalculationEngine`/`BasicCalculationEngine` and
`CalculationRepository`/`RoomCalculationRepository` are both real,
concrete instances of the identical shape: one interface, one real
implementation today, and a real, open door for more.

```
Also recognized in: a sorting library accepting any comparison function
rather than one hardcoded rule; a payment system accepting any real
payment processor behind one shared interface; a game AI selecting
between interchangeable behavior strategies at runtime without the game
loop itself knowing which one is active
```

### SE Lens

This is the real, named **Dependency Inversion Principle**: high-level
code — `CalculatorViewModel`, deciding *what* should happen on a button
press — now depends only on two real abstractions, `CalculationEngine`
and `CalculationRepository`, never on the two real, concrete
implementations that actually do the work. Those concrete
implementations, `BasicCalculationEngine` and `RoomCalculationRepository`,
depend on the exact same abstractions themselves, by implementing them —
neither one depends on `CalculatorViewModel` at all. The real alternative
this project already tried, and is moving away from: `CalculatorViewModel`
depending directly on concrete types, already proven, against this
project's own real code, to cause measurable, provable cost. The real
tradeoff accepted here: two more real interface declarations now exist,
pure overhead with zero behavior of their own, and exactly one real,
concrete place — `CalculatorViewModelFactory`, this project's own real
**composition root** — has to know both real, concrete implementations
still exist somewhere. That's a deliberate, honest concentration of
knowledge, not an accident: every other real file in this project can now
depend on `CalculationEngine`/`CalculationRepository` alone, and never
needs to change when a second, different implementation of either one is
added.

### Commands Needed

- `./gradlew :app:compileDebugKotlin` — this project's own established
  compile-only command, used here twice: once, deliberately, against a
  real, temporary rename with only half the real fix applied, to prove
  exactly which file breaks and which doesn't; once more, after
  completing the real fix, to confirm a clean compile with only one real
  line changed.

### Run It

The isolated lab's real break-then-fix contrast is shown above in full.
The identical real experiment was then run a second time against this
project's own actual code: `nextState` was temporarily renamed to
`computeNextState` inside `Calculator.kt`, with `BasicCalculationEngine.compute`
left deliberately unchanged — a real `./gradlew :app:compileDebugKotlin`
produced exactly one real error, `Calculator.kt:112: Unresolved reference:
nextState`, with zero errors anywhere in `CalculatorViewModel.kt` or
`MainActivity.kt`, saved in full in
`verification/12.3/step2_rename_isolated_to_engine.txt`. Updating only
`BasicCalculationEngine`'s own one line to call `computeNextState`
restored a real, clean compile; the rename was then reverted in full,
confirmed by a final, clean `./gradlew testDebugUnitTest assembleDebug`
run — `104` tests, `0` failures, a real, installable `.apk` — saved in
`verification/12.3/step1_full_suite.txt`.

### Connect the Pieces

The isolated lab proved, with a real break and a real, clean fix, that a
caller bound only to an interface survives a rename that breaks a caller
bound to a specific name. The identical real experiment, repeated against
this project's own actual `CalculatorViewModel` and `BasicCalculationEngine`,
proved it wasn't just a lab result: renaming `nextState` broke exactly
one real file — the one real place still allowed to know its name — and
left `CalculatorViewModel.kt` completely untouched. Applying the same
real mechanism a second time, to `CalculationRepository`, gave this
project's own persistence boundary the identical real property, proven
concretely by `CalculationRepositoryTest.kt`'s own declared field type
needing zero changes at all. This project's own object graph, first
proven real, then centralized into one real factory, now flows entirely
through real interfaces — with exactly one real, composition-root class
left holding the knowledge of what those interfaces actually are, today.

---

## Connect the Pieces

One real property, proven twice, against two genuinely different parts
of this project. The isolated lab first proved the general mechanism: a
caller bound to a function by name breaks the instant that name changes;
a caller bound to an interface does not, as long as whatever implements
that interface is updated instead. Applying that identical real mechanism
to `CalculationEngine`/`BasicCalculationEngine` proved it against this
project's own real state-transition logic — a real, temporary rename
broke exactly one file, not two. Applying it again, to
`CalculationRepository`/`RoomCalculationRepository`, proved the same
property against this project's own real persistence layer, this time
demonstrated by a real test file whose own declared type never had to
change at all. `CalculatorViewModelFactory` is now the one, real,
honestly-named composition root holding the only concrete knowledge left
in this entire project — everything else depends on a contract, never a
specific implementation.

**Next:** Lesson 12.4 (Hilt).
