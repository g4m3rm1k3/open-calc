# Lesson 12.4: The Factory the Compiler Writes

**What you will build.** A real, permanent replacement for the one real,
remaining piece of hand-written wiring this project's own architecture
still carries: `CalculatorViewModelFactory`'s own manual
`Room.databaseBuilder(...)` chain, and the fact that adding a new real
dependency to `CalculatorViewModel` still means editing two real places
by hand — its own constructor, and the factory that builds it. Hilt, a
real, official Android dependency-injection library, now builds this
project's entire real object graph automatically, generating the exact
equivalent of the hand-written `CalculatorViewModelFactory` from a single
real annotation. The real, transferable problem this lesson is actually
about: once a project's own object graph is expressed cleanly, through
real interfaces and real constructor injection — exactly what the
previous three lessons already built — a tool can take over building it,
and inspecting what that tool actually generates turns "the framework
handles it" from an unverified claim into real, readable, ordinary code.
This closes Slice 12: a properly decoupled calculator architecture.

**What you need to know first:**
- Lesson 12.1 (The Object Graph One Constructor Hides) — the real,
  three-level object graph this project's own code has depended on since
  Stage 7, now built entirely by generated code instead of by hand.
- Lesson 12.2 (A Constructor That Only Receives) — `CalculatorViewModelFactory`,
  the real, hand-written `ViewModelProvider.Factory` this lesson's own
  generated code directly mirrors.
- Lesson 12.3 (A Contract Instead of One Function) — `CalculationEngine`,
  `CalculationRepository`, and their own real implementations, the exact
  real interfaces and classes this lesson wires together automatically.
- Lesson 8.6 (The Class That Doesn't Know Its Own Numbers) — this
  project's own established discipline of reading real, generated or
  compiled code as proof, rather than trusting a framework claim
  unverified.

No pipeline diagram — this lesson doesn't touch this project's expression
or graphing pipeline.

## Terms used in this lesson

- **`@Inject`** — a real, standard `javax.inject` annotation marking a
  constructor as one Hilt is allowed to call automatically, supplying
  every one of its real parameters itself. Why it matters: without it, a
  class is invisible to Hilt entirely — annotating a constructor is the
  one, real, minimal signal that turns "a plain Kotlin class" into
  "something Hilt's own generated code knows how to build."
- **`@Module`** — a real Hilt/Dagger annotation marking a class or object
  as a real source of instructions for building types that can't simply
  have `@Inject` on their own constructor — an interface with no
  constructor of its own, or a concrete type built by calling a real,
  external library function instead of `new`.
- **`@InstallIn`** — a real annotation, required on every `@Module`,
  naming which real, generated Component its instructions belong to. Why
  it matters: Hilt organizes its real, generated code by scope — this
  project uses exactly one, `SingletonComponent`, meaning every real
  binding lives for as long as the app process does.
- **`@Provides`** — a real annotation on a method inside a `@Module`,
  telling Hilt: "call this real method's own body to build this type."
  Why it matters: this is the one real place `Room.databaseBuilder(...)`
  — a real function call, not a constructor — can still be reached from
  inside Hilt's own generated object graph.
- **`@Binds`** — a real annotation on an `abstract` method inside a
  `@Module`, telling Hilt: "whenever this interface is asked for, use
  this one real, concrete implementation." Why it matters: it doesn't
  build anything itself — it only names which of Hilt's own already-known
  real implementations should stand in for a given interface.
- **`@Singleton`** — a real Hilt/Dagger scope annotation, telling Hilt to
  build a given type exactly once and hand back the identical real
  instance every time it's asked for again, for as long as its own
  Component lives.
- **`@HiltAndroidApp`** — a real annotation on this project's own real
  `Application` subclass, the one, required, real trigger that tells
  Hilt to generate this entire app's own real object graph at all.
- **`@AndroidEntryPoint`** — a real annotation on an `Activity` (or
  `Fragment`), enabling Hilt to inject into a class Hilt itself never
  constructs — Android's own runtime creates every real `Activity`, not
  application code, so Hilt has to reach in after the fact instead.
- **`@HiltViewModel`** — a real annotation marking a `ViewModel` Hilt
  should know how to build, the one, required signal that connects a
  real `@Inject`-annotated `ViewModel` constructor to Compose's own real
  `hiltViewModel()` function.
- **Component** — Hilt's own real, generated class actually holding this
  project's entire real object graph at runtime — every real `Provider`,
  every real cached `@Singleton` instance, assembled into one real,
  compiled class.
- **`Provider<T>`** — a real, standard `javax.inject` interface wrapping
  a single real method, `get(): T`, returning one real instance of `T`
  whenever it's called. Why it matters: Hilt's own generated code passes
  every real dependency around as a `Provider`, not a bare value, so it
  can decide, per type, whether calling `get()` twice returns two new
  instances or the identical cached one.

## Objects and methods used

**`CalculatorApplication`**
- *What it is:* a new, real, permanent class — this project's first ever
  custom `Application` subclass, and the real, required root of Hilt's
  entire generated object graph.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/CalculatorApplication.kt`:
  ```kotlin
  @HiltAndroidApp
  class CalculatorApplication : Application()
  ```
- *Its use:* registered in `AndroidManifest.xml` via
  `android:name=".CalculatorApplication"`, replacing Android's own real,
  default, unnamed `Application` instance.
- *Type:* a `class`, extending Android's own real `Application`.
- *Responsibility:* exist, and carry `@HiltAndroidApp`, so Hilt's own
  annotation processor has a real, concrete root class to attach its
  entire generated Component hierarchy to. It has no other real code of
  its own.
- *Depends on:* nothing — it's the real starting point everything else in
  this project's own object graph now depends on, transitively.
- *Connects to:* every one of this project's own real `@Module`s and
  `@Inject`-annotated classes are ultimately reachable from the real,
  generated Component this class roots.
- *Shape:* this project's own real, new application entry point — a
  required, structural addition, not a behavioral one.

**`AppModule`**
- *What it is:* a new, real, permanent object — this project's own real
  source of build instructions for the two types that can't simply carry
  `@Inject`: `AppDatabase` and `CalculationDao`.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/AppModule.kt`:
  ```kotlin
  @Module
  @InstallIn(SingletonComponent::class)
  object AppModule {
      @Provides
      @Singleton
      fun provideAppDatabase(application: Application): AppDatabase {
          return Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db").build()
      }

      @Provides
      fun provideCalculationDao(database: AppDatabase): CalculationDao {
          return database.calculationDao()
      }
  }
  ```
- *Its use:* read once, by Hilt's own real annotation processor, at
  compile time — this project's own code never calls either of these
  methods directly.
- *Type:* an `object`, annotated `@Module`.
- *Responsibility:* declare exactly how to build the one, real,
  `@Singleton`-scoped `AppDatabase` this whole app shares, and how to
  retrieve a real `CalculationDao` from it.
- *Depends on:* a real `Application`, itself already known to Hilt with
  no `@Module` needed for it at all.
- *Connects to:* `provideAppDatabase`'s own real body is the identical
  real `Room.databaseBuilder(...)` chain
  `CalculatorViewModelFactory.create` already builds by hand;
  `provideCalculationDao`'s own result feeds directly into
  `RoomCalculationRepository`'s real, injected constructor.
- *Shape:* this project's own real, new composition boundary for its
  persistence layer — the one place Room is still named directly, now
  read by a tool instead of called by hand at runtime.

**`BindingsModule`**
- *What it is:* a new, real, permanent abstract class — this project's
  own real source of interface-to-implementation mappings.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/BindingsModule.kt`:
  ```kotlin
  @Module
  @InstallIn(SingletonComponent::class)
  abstract class BindingsModule {
      @Binds
      abstract fun bindCalculationRepository(impl: RoomCalculationRepository): CalculationRepository

      @Binds
      abstract fun bindCalculationEngine(impl: BasicCalculationEngine): CalculationEngine
  }
  ```
- *Its use:* read once, by Hilt's own real annotation processor — neither
  real, abstract method here is ever actually called; Hilt reads their
  own real signatures to learn which concrete type answers which
  interface.
- *Type:* an `abstract class`, annotated `@Module`, holding two real,
  `abstract` methods.
- *Responsibility:* declare, once, that `CalculationRepository` really
  means `RoomCalculationRepository`, and `CalculationEngine` really means
  `BasicCalculationEngine` — the one, real, named place this decision now
  lives.
- *Depends on:* `RoomCalculationRepository` and `BasicCalculationEngine`
  both already being real, `@Inject`-constructible classes on their own.
- *Connects to:* every real class in this project depending on
  `CalculationRepository`/`CalculationEngine` — `CalculatorViewModel`
  included — is answered, transparently, by whichever real class this
  file names.
- *Shape:* this project's own real, new composition boundary for its two
  interface seams from the previous lesson — the same real decision
  `CalculatorViewModelFactory.create` still makes by hand today, now made
  once, declaratively, and read by a tool.

**`CalculatorViewModel`**
- *What it is:* this project's own real, permanent `ViewModel`, now known
  to Hilt directly.
- *Implementation:* its real, current, complete class header and
  constructor,
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`,
  lines 19–24:
  ```kotlin
  @HiltViewModel
  class CalculatorViewModel @Inject constructor(
      application: Application,
      private val repository: CalculationRepository,
      private val engine: CalculationEngine
  ) : AndroidViewModel(application) {
  ```
- *Its use:* this lesson's own real subject — its constructor is
  unchanged in shape from the previous lesson; what's new is the two real
  annotations marking it as something Hilt now builds automatically.
- *Type:* a `class`, extending `AndroidViewModel`, annotated
  `@HiltViewModel`, with an `@Inject`-annotated constructor.
- *Responsibility:* unchanged in outward behavior from the previous
  lesson.
- *Depends on:* the identical three real dependencies as before — a real
  `Application`, `CalculationRepository`, and `CalculationEngine` — now
  all three supplied by Hilt's own generated code instead of
  `CalculatorViewModelFactory`.
- *Connects to:* built by Hilt's own real, generated
  `CalculatorViewModel_Factory`, shown below, whenever
  `hiltViewModel()` asks for one.
- *Shape:* this project's own real MVVM ownership layer, now fully
  reachable through Hilt's own generated object graph.

**`hiltViewModel()`**
- *What it is:* a real, public Compose function, Hilt's own real
  replacement for this project's former, explicit
  `viewModel(factory = CalculatorViewModelFactory(...))` call.
- *Implementation:* `@Composable inline fun <reified VM : ViewModel>
  hiltViewModel(...): VM`
  (`androidx.hilt.navigation.compose`), confirmed present and real on
  this project's own classpath by a real, successful compile against it
  this session.
- *Its use:* `CalculatorScreen`'s own real default parameter value now
  reads `calculatorViewModel: CalculatorViewModel = hiltViewModel()` —
  no factory argument, no `Application` reached through `LocalContext` by
  hand.
- *Type:* a `@Composable`, `inline` function.
- *Responsibility:* obtain a real `CalculatorViewModel`, correctly scoped
  to the current composition, by reaching into Hilt's own real, generated
  object graph instead of a manually supplied factory.
- *Depends on:* the current composition already running underneath a
  real `@AndroidEntryPoint`-annotated `Activity` — without one, there is
  no real Hilt-generated graph to reach.
- *Connects to:* internally calls into Hilt's own generated
  `CalculatorViewModel_HiltModules`/`CalculatorViewModel_Factory`, shown
  below, the exact real code this lesson's own evidence inspects
  directly.
- *Shape:* this project's own new, real Compose-Hilt integration point,
  replacing the previous lesson's own explicit factory call.

**`createAndroidComposeRule<A>()`**
- *What it is:* a real, public, `inline` Compose test function, the
  real, official sibling of this project's own already-established
  `createComposeRule()` that launches a real, specific `Activity`
  subclass instead of an anonymous, empty one.
- *Implementation:* `inline fun <reified A : ComponentActivity>
  createAndroidComposeRule(): AndroidComposeTestRule<ActivityScenarioRule<A>,
  A>` (`androidx.compose.ui.test.junit4`); its own returned real rule
  type exposes a real `getActivity(): A` property — confirmed this
  session via `javap -p` against this project's own real, installed
  `ui-test-junit4-release-api.jar`.
- *Its use:* this lesson's own real, permanent fix for
  `NavigationTest.kt`, launching the real `MainActivity` — already
  `@AndroidEntryPoint`-annotated — instead of a bare, non-Hilt-aware one.
- *Type:* a top-level, `inline`, `reified` function.
- *Responsibility:* launch a genuine, specified `Activity` for real under
  test, running its own actual `onCreate`, rather than substituting an
  empty stand-in.
- *Depends on:* the given `Activity` type already being real, launchable,
  and, for this lesson's own purpose, `@AndroidEntryPoint`-annotated.
- *Connects to:* its own returned rule's `.activity` property gives real,
  direct access to the real, running `MainActivity` instance this
  lesson's own new code calls `onBackPressedDispatcher` on.
- *Shape:* real, public Compose testing API — this project's second real
  way of hosting a composable under test, chosen specifically where a
  real, Hilt-aware Activity is required.

**`OnBackPressedDispatcher.onBackPressed()`**
- *What it is:* the real, standard AndroidX class and method that
  actually runs whenever a real device back-button press occurs.
- *Implementation:* `androidx.activity.OnBackPressedDispatcher`, a real,
  public class; `ComponentActivity` already exposes one through its own
  real `onBackPressedDispatcher` property, established as part of this
  project's own existing `ComponentActivity` superclass since Stage 1.
- *Its use:* `composeTestRule.activity.onBackPressedDispatcher.onBackPressed()`
  triggers a real, genuine back-navigation event against the real,
  running `MainActivity`, replacing this project's former
  `TestNavHostController.popBackStack()`-based simulation.
- *Type:* a real, public instance method.
- *Responsibility:* run whichever real, currently-registered back
  handler is responsible for the current screen — for this project's own
  real `NavHost`, that means popping its own real back stack, the exact
  same real mechanism a genuine physical back-button press would
  trigger.
- *Depends on:* a real, running `Activity` to call it on.
- *Connects to:* reached through `composeTestRule.activity`, above;
  internally, Jetpack Navigation Compose's own real `NavHost` registers
  itself as a real back handler on this exact dispatcher.
- *Shape:* real, public Android platform API — this lesson's own real,
  concrete proof that a previously-documented simulation gap has closed.

### Everything else in the file, not this lesson's subject but still explained

**`Preconditions.checkNotNullFromProvides()`**
- *What it is:* a real, standard Dagger internal method, wrapping the
  real return value of every `@Provides` method to guard against `null`.
- *Implementation:* `public static <T> T checkNotNullFromProvides(T)`
  (`dagger.internal.Preconditions`), confirmed this session via `javap -p`
  against this project's own real, installed `dagger-2.51.1.jar`; genuine
  `null` in, throws a real `NullPointerException` naming the offending
  `@Provides` method; genuine non-`null` in, returns it unchanged.
- *Its use:* wraps every real call this project's own generated
  `@Provides` factories make — `AppModule_ProvideAppDatabaseFactory`
  included, confirmed by reading its own real, generated source directly.
- *Type:* a real, `public static` generic method.
- *Responsibility:* enforce, at the real moment a `@Provides` method's
  result is retrieved, that it's never silently `null` — surfacing a real,
  loud failure immediately instead of a `null` quietly propagating into
  whatever real code depended on it.
- *Depends on:* the real value a `@Provides` method's own body already
  computed.
- *Connects to:* called from inside every real, generated `@Provides`
  factory this project now has, including `AppModule`'s own two.
- *Shape:* real, internal Dagger platform code — never written or called
  directly by this project's own source, only read, here, as real,
  demystifying proof of what a generated factory actually does.

**`CalculatorViewModelFactory`**
- *What it is:* this project's own real, hand-written factory from the
  second lesson of this stage, left in the codebase, unchanged, no longer
  this project's real, on-device production path.
- *Implementation:* unchanged from the previous lesson —
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`,
  lines 43–54.
- *Its use:* this lesson's own real point of comparison against Hilt's
  own generated factory, and, as this lesson's own third unit finds, a
  real, still-necessary escape hatch for tests that can't reach through
  Hilt's own real entry-point machinery at all.
- *Type:* a `class`, implementing `ViewModelProvider.Factory`, unchanged.
- *Responsibility:* unchanged — still a real, working way to build a
  `CalculatorViewModel` by hand.
- *Depends on:* unchanged.
- *Connects to:* no longer called from `CalculatorScreen`'s own real,
  shipped default; called directly, by name, from four of this project's
  own real test files, established in this lesson's own third unit.
- *Shape:* a real, honest, deliberately-kept piece of this project's own
  history — proof, left in place on purpose, of exactly what Hilt's own
  generated code now does automatically, and, as it turns out, still
  genuinely load-bearing.

---

## Concept Unit: The Factory the Compiler Writes

### The Problem

`CalculatorViewModelFactory`, built by hand in the second lesson of this
stage, has to know, and keep knowing, exactly what
`CalculatorViewModel`'s own constructor needs — today, an `Application`,
a `CalculationRepository`, and a `CalculationEngine`, built and passed in
that exact order. Nothing forces those two things to stay in sync except
a human noticing. If a fourth real dependency were ever added to
`CalculatorViewModel`'s own constructor, two real, separate places would
need to change: the constructor itself, and this factory's own `create`
method.

> Given that `CalculatorViewModelFactory.create` already does nothing
> more than call `CalculatorViewModel`'s own real constructor with values
> it already has sitting in local variables — what information does a
> tool need to write that exact same call automatically, without a human
> typing it? If a real annotation processor could see, at compile time,
> exactly which constructor a class wants used and what real types each
> of its parameters are — is there anything left in
> `CalculatorViewModelFactory.create`'s own real body that couldn't be
> generated the same way?

### Introduce the Concept in Isolation

A small, throwaway class, added temporarily as `LabGreeter.kt` directly
in this project's own real `app/src/main/java/com/example/calculator/`
source set — the same standing adaptation this project already relies on
for any construct needing the real Gradle/annotation-processing
toolchain, since Hilt's entire mechanism only exists at real compile
time, with no plain, tool-free `kotlinc` equivalent:

```kotlin
package com.example.calculator

import javax.inject.Inject

class LabGreeter @Inject constructor() {
    fun greet(): String = "Hello from a Hilt-injected class"
}
```

Compiled for real this session (`./gradlew :app:compileDebugKotlin`),
saved in full in `verification/12.4/lab1_LabGreeter.kt`. Rather than
writing a separate test to prove `@Inject` works, this unit inspects the
real, compiled evidence directly: Dagger's own real annotation
processor, running as part of this exact compile, wrote a brand-new
real Java file, `LabGreeter_Factory.java`, saved in full in
`verification/12.4/lab1_generated_LabGreeter_Factory.java`:

```java
public final class LabGreeter_Factory implements Factory<LabGreeter> {
  @Override
  public LabGreeter get() {
    return newInstance();
  }

  public static LabGreeter_Factory create() {
    return InstanceHolder.INSTANCE;
  }

  public static LabGreeter newInstance() {
    return new LabGreeter();
  }

  private static final class InstanceHolder {
    private static final LabGreeter_Factory INSTANCE = new LabGreeter_Factory();
  }
}
```

A real, ordinary, readable Java class — not a black box. `newInstance()`
calls `new LabGreeter()` directly, the exact same real call a
hand-written factory would make. This is called **compile-time code
generation** — real source code, written by a real tool, during a real
build, from nothing but the one real `@Inject` annotation on
`LabGreeter`'s own constructor.

### Discard the Throwaway Example

`LabGreeter.kt` was deleted from the project immediately after this real
run. A second real, executed proof followed: `./gradlew
:app:compileDebugKotlin` was run again, and `LabGreeter_Factory.java` was
genuinely gone from `app/build/generated/` — saved in full in
`verification/12.4/lab1_discard_confirmation.txt` — real, executed proof
that this generated file is regenerated from real source on every real
build, not a stale, leftover artifact. `LabGreeter.kt` does not exist in
this project's own real source tree.

### Project Change

- **Reference Source:** no reference counterpart — Hilt's own official
  `@Inject`/`@HiltViewModel` contract is what this lesson applies
  directly; there is no separate file to port from.
- **Files affected:**
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`
  (modified).
- **Change type:** configure (two real annotations added; the
  constructor's own real shape is otherwise unchanged from the previous
  lesson).
- **Location:** directly above `CalculatorViewModel`'s own class
  declaration, and on its own primary constructor.
- **Dependencies:** `dagger.hilt.android.lifecycle.HiltViewModel` and
  `javax.inject.Inject`, both real, now-resolved dependencies from this
  project's own newly added Hilt Gradle dependencies.

### The New Code

```kotlin
@HiltViewModel
class CalculatorViewModel @Inject constructor(
```

### The Updated Project

`CalculatorViewModel.kt`, lines 19–24 — the real, current class header
and constructor, no lines omitted:

```kotlin
19: @HiltViewModel                                                    // ← new
20: class CalculatorViewModel @Inject constructor(                    // ← changed
21:     application: Application,
22:     private val repository: CalculationRepository,
23:     private val engine: CalculationEngine
24: ) : AndroidViewModel(application) {
```

Nothing about the constructor's own three real parameters changed — the
identical real shape the previous lesson already built. What's new is
two real annotations: `@HiltViewModel` marks the class itself; `@Inject`
marks the constructor Hilt should call. Together, they're the real,
minimal signal that produces exactly the kind of generated factory the
isolated lab just showed — this time for `CalculatorViewModel` itself.

Dagger's own real, generated `CalculatorViewModel_Factory.java`, produced
by this exact real change, saved in full in
`verification/12.4/generated_CalculatorViewModel_Factory.java`:

```java
public final class CalculatorViewModel_Factory implements Factory<CalculatorViewModel> {
  private final Provider<Application> applicationProvider;
  private final Provider<CalculationRepository> repositoryProvider;
  private final Provider<CalculationEngine> engineProvider;

  public CalculatorViewModel_Factory(Provider<Application> applicationProvider,
      Provider<CalculationRepository> repositoryProvider,
      Provider<CalculationEngine> engineProvider) {
    this.applicationProvider = applicationProvider;
    this.repositoryProvider = repositoryProvider;
    this.engineProvider = engineProvider;
  }

  @Override
  public CalculatorViewModel get() {
    return newInstance(applicationProvider.get(), repositoryProvider.get(), engineProvider.get());
  }

  public static CalculatorViewModel newInstance(Application application,
      CalculationRepository repository, CalculationEngine engine) {
    return new CalculatorViewModel(application, repository, engine);
  }
}
```

### Mechanical Walkthrough

Every distinct new construct, enumerated in order:

- `@HiltViewModel` — a real, class-level annotation, telling Hilt's own
  real annotation processor that this specific class is a `ViewModel` it
  should generate integration code for, connecting it to
  `hiltViewModel()`'s own real Compose entry point.
- `@Inject constructor(` — a real, constructor-level annotation, the
  identical real mechanism the isolated lab's own `LabGreeter` already
  proved; here, marking a constructor that already existed, unchanged in
  shape, rather than a brand-new one.

And, in Dagger's own real, generated `CalculatorViewModel_Factory.java`:

- `private final Provider<Application> applicationProvider;` (and its two
  siblings) — three real fields, one per real constructor parameter, each
  holding a `Provider`, not a bare value — Hilt's own generated code
  never assumes a dependency is already built; it always asks for one
  fresh, through a real `Provider.get()` call.
- `public CalculatorViewModel_Factory(Provider<Application> ..., ...)` —
  a real, generated constructor, itself taking three `Provider`s — this
  factory's own real dependencies are three more `Provider`s, not the
  real values themselves.
- `public CalculatorViewModel get()` — the real, required method every
  `Factory<T>` must have; calls `newInstance(...)`, passing the real
  result of calling `.get()` on each of the three stored `Provider`s.
- `public static CalculatorViewModel newInstance(...)` — a real, static
  method whose own entire body is one line:
  `return new CalculatorViewModel(application, repository, engine)` —
  the exact real constructor call this project's own hand-written
  `CalculatorViewModelFactory.create` already made by hand, byte-for-byte
  the same real shape.

### CS Lens

This is a real, concrete instance of **compile-time code generation** —
a program that writes another program's own source code, based on
declarative annotations rather than an interpreter reading them at
runtime.

```
Also recognized in: a database ORM generating real query classes from
annotated model definitions; a protocol-buffer compiler generating real
serialization code from a `.proto` schema; a UI framework's own
compiler plugin generating real boilerplate from a declarative view
description
```

### SE Lens

The real alternative — writing `CalculatorViewModelFactory` by hand, as
the previous lesson did — is not wrong; it's exactly what this real,
generated code does, just typed by a person instead of a tool. The real
tradeoff: a generated factory can never drift out of sync with its own
real constructor, because it's regenerated from that exact constructor
every real build — proven directly by this unit's own discard step,
where deleting the source made the generated file disappear too. The
real cost: this project's own real build now depends on a real annotation
processor running correctly, adding real build time (`kaptDebugKotlin`)
and one more real place — Dagger's own generated code, not this
project's own source — a debugging session might eventually need to read
when something goes wrong. This project already paid that same real cost
once before, for Room's own generated `CalculationDao` implementation —
this is the identical real trade, applied a second time, to this
project's own object-construction layer instead of its persistence layer.

### Commands Needed

- `./gradlew :app:compileDebugKotlin` — this project's own already-
  established compile-only command; run here specifically to trigger
  Hilt/Dagger's own real annotation processor and inspect what it writes.

### Run It

Shown above in full — the real, generated `LabGreeter_Factory.java`, then
its real, confirmed disappearance after discard, then the real,
generated `CalculatorViewModel_Factory.java` this project's own actual
change produced. All saved in full in `verification/12.4/`.

### Connect the Pieces

The isolated lab proved, with a real, inspected, generated Java file,
that `@Inject` alone is enough for Dagger's own real annotation processor
to write a working factory automatically — and that deleting the source
makes the generated file disappear, real proof it's derived, not cached.
Applying the identical real annotations to `CalculatorViewModel` itself
produced the real, generated equivalent of this project's own
hand-written `CalculatorViewModelFactory` — the exact same real
constructor call, now written by a tool instead of a person.

---

## Concept Unit: Modules, Providers, and the One Real Component

### The Problem

`@Inject` alone cannot build everything this project's real object graph
needs. `CalculationRepository` and `CalculationEngine` are real
interfaces — neither has a constructor at all, `@Inject` or otherwise.
`AppDatabase` isn't built by calling `new` — it's built by calling
`Room.databaseBuilder(...).build()`, a real function call, not a
constructor. `@Inject constructor` has no way to express either of
those.

> Given that Hilt's entire mechanism, so far, depends on annotating a
> real constructor — what real option is left for a type that has no
> constructor to annotate, either because it's an interface, or because
> building one means calling a library function instead of `new`? And if
> two real classes, `RoomCalculationRepository` and `BasicCalculationEngine`,
> both already have their own real `@Inject constructor` — what,
> concretely, is still missing before Hilt would know that a
> `CalculationRepository` request should be answered with a
> `RoomCalculationRepository`, specifically, and not some other, not-yet-
> written implementation?

### Introduce the Concept in Isolation

A small, throwaway pair, extending the previous unit's own real,
temporary approach — added temporarily as `LabConfig.kt` and
`LabPrinterModule.kt` inside this project's own real source set:

```kotlin
package com.example.calculator

class LabConfig(val label: String)

interface LabPrinter {
    fun output(message: String): String
}

class LabConsolePrinter @javax.inject.Inject constructor() : LabPrinter {
    override fun output(message: String): String = "[console] $message"
}
```

And a second real, temporary file, naming how to build each of the two
real types above:

```kotlin
package com.example.calculator

import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
object LabConfigModule {
    @Provides
    fun provideLabConfig(): LabConfig = LabConfig(label = "lab")
}

@Module
@InstallIn(SingletonComponent::class)
abstract class LabPrinterModule {
    @Binds
    abstract fun bindLabPrinter(impl: LabConsolePrinter): LabPrinter
}
```

Compiled for real this session (`./gradlew :app:compileDebugKotlin`) —
`LabConfig` has no constructor Hilt could ever annotate, since it's built
by a plain, real, hand-written expression (`LabConfig(label = "lab")`),
not a call Hilt is allowed to intercept; `LabPrinter` has no constructor
at all, being an interface. The real, generated evidence, saved in full
in `verification/12.4/lab2_generated_LabConfigModule_ProvideLabConfigFactory.java`:

```java
public final class LabConfigModule_ProvideLabConfigFactory implements Factory<LabConfig> {
  public static LabConfig provideLabConfig() {
    return Preconditions.checkNotNullFromProvides(LabConfigModule.INSTANCE.provideLabConfig());
  }
}
```

A real, genuine `@Provides` factory, calling
`LabConfigModule.INSTANCE.provideLabConfig()` directly — a real, unplanned
finding, worth knowing: Dagger wraps every real `@Provides` method's own
result in `Preconditions.checkNotNullFromProvides(...)`, a real, generated
null-check enforcing that a `@Provides` method never silently returns
`null`. `@Binds`, by contrast, produced no separate `_BindLabPrinter`
file at all — checked directly, saved in full in
`verification/12.4/lab2_generated_LabConsolePrinter_Factory.java`: the
only real, new generated file `LabPrinterModule` caused was
`LabConsolePrinter_Factory.java`, the identical real shape the previous
unit's own `LabGreeter_Factory.java` already showed, generated from
`LabConsolePrinter`'s own `@Inject constructor` alone. `@Binds` itself
generates no factory of its own — a real, concrete difference from
`@Provides`, confirmed by its own absence, not assumed: naming an
existing implementation needs no new object-construction code, only a
real instruction for which already-generated factory answers a given
interface.

### Discard the Throwaway Example

`LabConfig.kt` and `LabPrinterModule.kt` are both deleted now — real,
saved in `verification/12.4/lab2_LabConfig.kt` and
`verification/12.4/lab2_LabPrinterModule.kt`, alongside the real,
generated evidence they produced. Neither exists in this project's own
real source tree.

### Project Change

- **Reference Source:** no reference counterpart — Hilt's own official
  `@Module`/`@Provides`/`@Binds` contract is what this lesson applies
  directly.
- **Files affected:**
  `app/src/main/java/com/example/calculator/AppModule.kt` (new);
  `app/src/main/java/com/example/calculator/BindingsModule.kt` (new);
  `app/src/main/java/com/example/calculator/CalculationRepository.kt`
  (modified);
  `app/src/main/java/com/example/calculator/Calculator.kt` (modified);
  `app/src/main/java/com/example/calculator/CalculatorApplication.kt`
  (new);
  `app/src/main/AndroidManifest.xml` (modified).
- **Change type:** add (`AppModule`, `BindingsModule`,
  `CalculatorApplication`); configure
  (`RoomCalculationRepository`/`BasicCalculationEngine` each gain an
  `@Inject constructor`; the manifest names the new `Application` class).
- **Location:** `AppModule`/`BindingsModule` are each a brand-new file;
  `@Inject` lands directly on each implementation's own existing
  constructor; `CalculatorApplication` is a brand-new file;
  `AndroidManifest.xml`'s own `<application>` tag gains `android:name`.
- **Dependencies:** `com.google.dagger:hilt-android:2.51.1` and its
  compiler, both new, real Gradle dependencies this stage adds.

### The New Code

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideAppDatabase(application: Application): AppDatabase {
        return Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db").build()
    }

    @Provides
    fun provideCalculationDao(database: AppDatabase): CalculationDao {
        return database.calculationDao()
    }
}
```

The identical real shape, applied to this project's own two interface
seams from the previous lesson:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
abstract class BindingsModule {
    @Binds
    abstract fun bindCalculationRepository(impl: RoomCalculationRepository): CalculationRepository

    @Binds
    abstract fun bindCalculationEngine(impl: BasicCalculationEngine): CalculationEngine
}
```

### The Updated Project

`AppModule.kt`, lines 1–24 — the entire real, new file:

```kotlin
1:  package com.example.calculator
2:
3:  import android.app.Application
4:  import androidx.room.Room
5:  import dagger.Module
6:  import dagger.Provides
7:  import dagger.hilt.InstallIn
8:  import dagger.hilt.components.SingletonComponent
9:  import javax.inject.Singleton
10:
11: @Module
12: @InstallIn(SingletonComponent::class)
13: object AppModule {
14:     @Provides
15:     @Singleton
16:     fun provideAppDatabase(application: Application): AppDatabase {
17:         return Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db").build()
18:     }
19:
20:     @Provides
21:     fun provideCalculationDao(database: AppDatabase): CalculationDao {
22:         return database.calculationDao()
23:     }
24: }
```

`BindingsModule.kt`, lines 1–16 — the entire real, new file:

```kotlin
1:  package com.example.calculator
2:
3:  import dagger.Binds
4:  import dagger.Module
5:  import dagger.hilt.InstallIn
6:  import dagger.hilt.components.SingletonComponent
7:
8:  @Module
9:  @InstallIn(SingletonComponent::class)
10: abstract class BindingsModule {
11:     @Binds
12:     abstract fun bindCalculationRepository(impl: RoomCalculationRepository): CalculationRepository
13:
14:     @Binds
15:     abstract fun bindCalculationEngine(impl: BasicCalculationEngine): CalculationEngine
16: }
```

Two small, real, one-word additions complete the seam:
`RoomCalculationRepository`'s own real constructor is now
`@Inject constructor(private val dao: CalculationDao)`, and
`BasicCalculationEngine`'s own real constructor is now
`@Inject constructor()` — both changed to satisfy `@Binds`'s own real
requirement, confirmed this session: an abstract `@Binds` method names
which real implementation to use, but that implementation must still be
real, `@Inject`-constructible on its own, or Hilt has no way to build it
in the first place. Finally, `CalculatorApplication.kt`, a brand-new
file:

```kotlin
@HiltAndroidApp
class CalculatorApplication : Application()
```

registered in `AndroidManifest.xml` via
`android:name=".CalculatorApplication"` — the one, real, required root
every one of this project's own new `@Module`s and `@Inject`-annotated
classes is ultimately reachable from.

Dagger's own real, generated `SingletonCImpl`, produced by this exact
real set of changes, saved in full in
`verification/12.4/generated_SingletonC_excerpt.java`:

```java
private static final class SingletonCImpl extends CalculatorApplication_HiltComponents.SingletonC {
    private Provider<AppDatabase> provideAppDatabaseProvider;

    private CalculationDao calculationDao() {
      return AppModule_ProvideCalculationDaoFactory.provideCalculationDao(provideAppDatabaseProvider.get());
    }

    private RoomCalculationRepository roomCalculationRepository() {
      return new RoomCalculationRepository(calculationDao());
    }
}
```

### Mechanical Walkthrough

Every distinct new construct, enumerated in order, from `AppModule`:

- `@Module` — a real, class-level annotation, marking `AppModule` as a
  real source of build instructions for Hilt's own annotation processor
  to read.
- `@InstallIn(SingletonComponent::class)` — a real, required annotation
  on every `@Module`, naming `SingletonComponent` — the one real
  Component this entire project uses, meaning every real binding this
  module declares lives for as long as the app process does.
- `@Provides` (on `provideAppDatabase`) — a real, method-level
  annotation, telling Hilt: "when a real `AppDatabase` is needed, call
  this method's own real body." `@Singleton` (also on
  `provideAppDatabase`) is a real, separate scope annotation, telling
  Hilt to build this specific real database exactly once and reuse the
  identical instance for every future request, for as long as the app
  runs.
- `fun provideAppDatabase(application: Application): AppDatabase` — a
  real method, its own body the identical real `Room.databaseBuilder(...)
  .build()` chain this project's own `CalculatorViewModelFactory`
  already builds by hand; its real parameter, `application`, is supplied
  by Hilt automatically, with no `@Module` needed for `Application`
  itself.
- `@Provides` (on `provideCalculationDao`) — the identical real
  mechanism, this time with no `@Singleton`, so a fresh call happens
  every time — harmless here, since `database.calculationDao()` already
  returns a real, cheap accessor, not a freshly-built object.

From `BindingsModule`:

- `abstract class BindingsModule` — an `abstract class`, required because
  `@Binds` methods are never actually called; they exist only to be read.
- `@Binds` (on `bindCalculationRepository`) — a real, method-level
  annotation, naming `RoomCalculationRepository` as the real
  implementation to use whenever a `CalculationRepository` is requested;
  its own real parameter, `impl: RoomCalculationRepository`, must itself
  already be `@Inject`-constructible.

And, in Dagger's own real, generated `SingletonCImpl`:

- `private Provider<AppDatabase> provideAppDatabaseProvider;` — a real,
  generated field, wrapping `AppModule.provideAppDatabase`'s own real
  method as a lazy `Provider`.
- `private CalculationDao calculationDao()` — a real, generated method,
  calling `AppModule_ProvideCalculationDaoFactory.provideCalculationDao(...)`
  — Dagger's own real, generated wrapper around `AppModule`'s own second
  real `@Provides` method.
- `private RoomCalculationRepository roomCalculationRepository()` — a
  real, generated method, calling `new RoomCalculationRepository(calculationDao())`
  directly — the real, concrete type `BindingsModule` named, built with
  the real dependency `calculationDao()` just produced.

### CS Lens

This is a real, generated instance of a **dependency graph resolver** —
a system that reads a declared set of "this needs that" relationships and
computes a real, correct build order automatically, the same real
category of tool a package manager or a build system uses to decide what
compiles before what.

```
Also recognized in: a package manager resolving which dependencies to
install in which order; a spreadsheet recalculating formula cells in
dependency order; a Makefile's own real target-dependency graph; a CI
pipeline's own real job-ordering, computed from declared "needs" fields
```

### SE Lens

The real design choice worth naming: two separate real modules,
`AppModule` (using `@Provides`, for types built by calling a function)
and `BindingsModule` (using `@Binds`, for types answered by naming an
existing implementation), rather than one. The real alternative — a
single module, mixing both — was available and rejected: `@Binds`
methods are `abstract`, with no real body at all, while `@Provides`
methods need a real, concrete body to run; mixing both inside one class
would force `AppModule` to be `abstract` for no real reason two of its
own three members don't need. The real, honest cost of this entire
approach, honestly named: **`SingletonComponent`** is a single, real,
generated class holding this project's entire real object graph — every
`@Singleton`-scoped object it builds lives for the app process's entire
real lifetime, with no way, from inside this project's own current
setup, to build a second, independently-scoped copy of anything. That's
a real, deliberate, appropriately-scoped choice for a project this
size — a larger real app would likely add scoped Components per screen
or per user session, machinery this project's own real, current needs do
not yet justify.

### Commands Needed

No new commands beyond `./gradlew :app:compileDebugKotlin`, already
shown in the previous unit.

### Run It

Shown above in full — the isolated lab's own real, generated evidence,
then this project's own real, generated `SingletonCImpl` excerpt. Full
transcripts saved in `verification/12.4/lab2_generated_LabConfigModule_ProvideLabConfigFactory.java`,
`verification/12.4/lab2_generated_LabConsolePrinter_Factory.java`, and
`verification/12.4/generated_SingletonC_excerpt.java`. A full, clean
`./gradlew testDebugUnitTest assembleDebug` run, confirming this
project's entire real object graph still resolves and every real test
still passes, is saved in `verification/12.4/step4_full_suite_clean.txt`.

### Connect the Pieces

The isolated lab proved, with real, inspected generated code, that
`@Module`/`@Provides` answers "how do I build this from a function call"
and `@Binds` answers "which real implementation answers this interface"
— two genuinely different real questions, two genuinely different real
annotations. Applying both, for real, to this project's own actual
persistence and engine seams produced a real, generated `SingletonCImpl`
that chains `provideAppDatabaseProvider` → `calculationDao()` →
`roomCalculationRepository()` in exactly the same real order this
project's own hand-written factory already built by hand — proof this
project's entire real object graph, first named in this stage's first
lesson, now assembles itself.

---

## Concept Unit: A Working App Is Not the Same Claim as Working Tests

### The Problem

Every real change so far in this lesson compiled clean and produced a
real, installable `.apk`. Does a clean compile prove this project's
existing, real, already-shipped tests still pass?

> This project's own real `CalculatorScreenTest.kt`, `HapticsTest.kt`,
> `AccessibilityTest.kt`, and `NavigationTest.kt` all render
> `CalculatorScreen` — directly, or through `CalculatorApp`'s own real
> navigation — inside a Compose test host that was never, itself,
> annotated `@AndroidEntryPoint`. Given that `hiltViewModel()` needs to
> reach a real, Hilt-generated object graph through the current
> `Activity` specifically — what do you predict happens the instant
> these real, already-passing tests are run again, unmodified, against
> `CalculatorScreen`'s own new default? And if the answer is "they
> break" — does every one of them break for the identical real reason?

### Introduce the Concept in Isolation

Rather than a separate throwaway file, this unit's own real evidence is
this project's own real, existing test suite, run for real, unmodified,
immediately after the previous two units' own real changes landed:
`./gradlew testDebugUnitTest` produced a real, caught failure, saved in
full in `verification/12.4/break1_hiltviewmodel_bare_activity.txt`:

```
java.lang.IllegalStateException: Given component holder class androidx.activity.ComponentActivity does not implement interface dagger.hilt.internal.GeneratedComponent or interface dagger.hilt.internal.GeneratedComponentManager
	at dagger.hilt.EntryPoints.get(EntryPoints.java:62)
	at dagger.hilt.android.internal.lifecycle.HiltViewModelFactory.createInternal(HiltViewModelFactory.java:206)
	at com.example.calculator.MainActivityKt.CalculatorScreen(MainActivity.kt:459)
	at com.example.calculator.CalculatorScreenTest.pressingDigitsUpdatesDisplay(CalculatorScreenTest.kt:24)
```

A real, genuine failure, the identical real exception across 21 of this
project's own 104 tests: `createComposeRule()`'s own internal host
Activity is a plain, un-annotated `ComponentActivity` — it can never
implement `GeneratedComponentManager`, the real interface only Hilt's
own annotation processor generates, and only for a class carrying
`@AndroidEntryPoint`. A first real attempt at a fix — switching one
affected test, `HapticsTest`, to `createAndroidComposeRule<MainActivity>()`,
while still calling `composeTestRule.setContent { ... }` explicitly, exactly
as before — produced a second, different, real failure, saved in full in
`verification/12.4/break2_double_setcontent.txt`:

```
java.lang.IllegalStateException: MainActivity has already set content. ...
```

`MainActivity`'s own real `onCreate` already calls `setContent { ... }`
once, for real, the instant `createAndroidComposeRule<MainActivity>()`
launches it — Compose does not allow a second, competing call on the
same root.

### Discard the Throwaway Example

Both real, temporary probe attempts — the unmodified failing run, and
the first, incomplete fix attempt — are not code left in the project;
both real failures are preserved only as saved evidence in
`verification/12.4/`, not as surviving source.

### Project Change

- **Reference Source:** no reference counterpart — this is a real,
  from-scratch fix for a real regression this lesson's own earlier units
  caused, discovered and closed in the same session.
- **Files affected:**
  `app/src/test/java/com/example/calculator/HapticsTest.kt`,
  `app/src/test/java/com/example/calculator/CalculatorScreenTest.kt`,
  `app/src/test/java/com/example/calculator/AccessibilityTest.kt`,
  `app/src/test/java/com/example/calculator/NavigationTest.kt` (all
  modified).
- **Change type:** configure — every change updates how each test
  obtains a real `CalculatorViewModel`; no assertion in any of these
  files changed.
- **Location:** the first three files each gain an explicit
  `calculatorViewModel` argument at their own existing `CalculatorScreen(...)`
  call sites; `NavigationTest.kt`'s own `composeTestRule` declaration and
  every one of its own real `setContent`/back-navigation calls.
- **Dependencies:** none beyond what these files already import, plus
  `androidx.test.core.app.ApplicationProvider`, already established in
  this project's own persistence tests.

### The New Code

```kotlin
val application = ApplicationProvider.getApplicationContext<Application>()
val viewModel = CalculatorViewModelFactory(application).create(CalculatorViewModel::class.java)
```

The second, genuinely different real fix, for `NavigationTest.kt` alone:

```kotlin
val composeTestRule = createAndroidComposeRule<MainActivity>()
```

### The Updated Project

`HapticsTest.kt`, lines 34–45 — the real, complete, updated test body, no
lines omitted:

```kotlin
34: @Test
35: fun pressingKeypadButtonTriggersHapticFeedback() {
36:     val fakeHaptic = FakeHapticFeedback()
37:     val application = ApplicationProvider.getApplicationContext<Application>() // ← new
38:     val viewModel = CalculatorViewModelFactory(application).create(CalculatorViewModel::class.java) // ← new
39:     composeTestRule.setContent {
40:         CompositionLocalProvider(LocalHapticFeedback provides fakeHaptic) {
41:             CalculatorTheme {
42:                 CalculatorScreen(calculatorViewModel = viewModel)              // ← changed
43:             }
44:         }
45:     }
```

`CalculatorScreenTest.kt` and `AccessibilityTest.kt` each gained the
identical real shape — a small, private `buildViewModel()` helper,
calling the same real `CalculatorViewModelFactory(application)
.create(CalculatorViewModel::class.java)`, called once per test into a
local `val viewModel` before `setContent`, then passed explicitly as
`CalculatorScreen(calculatorViewModel = viewModel)` — the real,
already-established `calculatorViewModel` parameter `CalculatorScreen`
has always exposed as an ordinary default value, now used, for the first
time in this project's history, to bypass its own real default entirely.

`NavigationTest.kt`, lines 19–43 — the real, complete, rewritten rule and
two of its own five real tests, no lines omitted:

```kotlin
19:     @get:Rule
20:     val composeTestRule = createAndroidComposeRule<MainActivity>()          // ← changed
21:
22:     @Test
23:     fun homeScreenIsTheStartDestination() {
24:         composeTestRule.onNodeWithText("Choose a Calculator").assertIsDisplayed() // ← changed
25:     }
26:
27:     @Test
28:     fun tappingBasicCalculatorNavigatesToCalculatorScreen() {
29:         composeTestRule.onNodeWithText("Basic Calculator").performClick()   // ← changed
30:
31:         composeTestRule.onNodeWithTag("display").assertTextEquals("0")
32:     }
33:
34:     @Test
35:     fun pressingBackFromCalculatorReturnsToHomeScreen() {
36:         composeTestRule.onNodeWithText("Basic Calculator").performClick()   // ← changed
37:         composeTestRule.onNodeWithTag("display").assertIsDisplayed()        // ← new
38:
39:         composeTestRule.activity.onBackPressedDispatcher.onBackPressed()    // ← changed
40:         composeTestRule.waitForIdle()
41:
42:         composeTestRule.onNodeWithText("Choose a Calculator").assertIsDisplayed() // ← changed
43:     }
```

Every one of `NavigationTest`'s own five real tests lost its own
explicit `composeTestRule.setContent { CalculatorApp() }` call entirely
— `MainActivity`'s own real `onCreate` already renders `CalculatorApp()`
automatically the instant `createAndroidComposeRule<MainActivity>()`
launches it, so calling `setContent` again would only reproduce the
second real failure this unit already caught. The one test needing a
custom `TestNavHostController` before — `pressingBackFromCalculatorReturnsToHomeScreen`
— no longer builds one at all: `composeTestRule.activity.onBackPressedDispatcher
.onBackPressed()` triggers a real, genuine back-navigation event against
the real, running `MainActivity`, replacing what this project's own
history had documented as a deliberate stand-in for "a real device back
button this environment still can't simulate."

### Mechanical Walkthrough

Every distinct new construct, enumerated in order:

- `ApplicationProvider.getApplicationContext<Application>()` — this
  project's own already-established real call, reused here to obtain a
  real `Application` outside of any Activity at all.
- `CalculatorViewModelFactory(application).create(CalculatorViewModel::class.java)` —
  a real, direct call into this project's own retained, hand-written
  factory, deliberately bypassing `hiltViewModel()` and Hilt's entire
  real object graph — this test genuinely does not need Hilt to run;
  it needs a real, working `CalculatorViewModel`, and the hand-written
  factory already builds one correctly.
- `createAndroidComposeRule<MainActivity>()` — a real, reified generic
  call, launching the actual `MainActivity` class this project ships,
  not a stand-in.
- `composeTestRule.activity` — a real property read, reaching the exact
  real, running `MainActivity` instance the rule just launched.
- `.onBackPressedDispatcher.onBackPressed()` — two real calls: a real
  property read reaching this Activity's own real dispatcher, and a real
  instance method call, genuinely triggering whatever real back-handling
  logic is currently registered — for this project's own real `NavHost`,
  that means popping its own real back stack, precisely as a genuine
  physical back-button press would.

### CS Lens

This is a real, concrete instance of a **test seam** — a deliberate point
in a system's own design where a real collaborator can be substituted
without changing the system's own real production behavior.
`CalculatorScreen`'s own `calculatorViewModel` parameter, still a plain
default value even after switching its default to `hiltViewModel()`, is
exactly this: production code reaches through it one real way; a test
that can't reach a real Hilt entry point reaches through the identical
real parameter a different way.

```
Also recognized in: a payment system's own "test mode" API key, letting
integration tests avoid a real payment processor; a database layer
accepting an injected connection so tests can substitute an in-memory one;
a logging framework's own pluggable sink, letting tests capture output
instead of writing to a real file
```

### SE Lens

The real alternative — building full, real Hilt test infrastructure
(`HiltTestApplication`, `@HiltAndroidTest`, a custom test runner) so
every test reaches a genuine Hilt entry point the same way the real app
does — is a real, legitimate, heavier approach production Android
projects do use. The real tradeoff this project accepts instead: keeping
`CalculatorViewModelFactory` around, deliberately, as a real, permanent,
non-Hilt path costs one small, honest inconsistency — this project's own
tests build a `CalculatorViewModel` one way, and its real, shipped UI
builds one a different way — in exchange for avoiding real, additional
test-infrastructure complexity this project's own current size does not
yet justify. The real, honest limit of this choice: if this project's
own object graph grows more complex, drift between the hand-written
factory's own real behavior and Hilt's own real, generated behavior
becomes a real, growing risk with nothing structurally preventing it —
a cost worth naming, not hiding. `NavigationTest`'s own real fix, by
contrast, was a genuine improvement with no tradeoff at all: reaching a
real, running `MainActivity` didn't just fix the real regression this
lesson's own earlier units caused — it replaced an older, weaker
simulation with the real mechanism it was always standing in for.

### Commands Needed

- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.<ClassName>"` —
  this project's own already-established targeted-test command, used
  here repeatedly to isolate exactly which real test class broke, and
  confirm each real fix independently before retrying the full suite.

### Run It

Shown above in full — both real, distinct failures, then each real fix,
verified independently, then a final, full, clean `./gradlew
testDebugUnitTest assembleDebug` run: `104` tests, `0` failures, a real,
installable `.apk`. Saved in full in `verification/12.4/step4_full_suite_clean.txt`.

### Connect the Pieces

This unit's own real evidence is a direct, provable consequence of the
previous two: switching `CalculatorScreen`'s own default to Hilt's real
object graph meant every test reaching that default through a
non-Hilt-aware host would break — proven, not assumed, by a real, caught
exception naming the exact real mechanism responsible. Two genuinely
different real fixes closed it, matched to what each test could actually
control: an explicit `calculatorViewModel` argument where the test owns
the call site directly, and a real, Hilt-aware `MainActivity`, reached
through `createAndroidComposeRule`, where it doesn't — a fix that, as a
real, unplanned bonus, also closed a second, older, previously-documented
gap in this project's own back-navigation testing.

---

## Connect the Pieces

Three real findings, one closed architecture. The first unit proved, with
a real, inspected, generated Java file, that `@Inject` alone lets Dagger's
own real annotation processor write the identical real factory this
project's own second lesson built by hand — then applied it to
`CalculatorViewModel` itself, producing that exact real, generated code.
The second unit proved `@Module`/`@Provides`/`@Binds` answer two
genuinely different real questions — how to build a type from a function
call, and which implementation answers an interface — then applied both
to this project's own real persistence and engine seams, producing a
real, generated `SingletonComponent` that assembles this project's entire
object graph automatically — the identical real chain this project's own
code already proved, by hand, at the start of this stage. The third unit
proved that a real, working app and a real,
passing test suite are not the same claim: switching to Hilt's own real
object graph broke twenty-one of this project's own real, existing
tests, for a real, provable, singular reason, closed by two genuinely
different real fixes — one bypassing Hilt entirely through a still-real,
deliberately-retained hand-written factory, one reaching through a
genuinely real, Hilt-aware `MainActivity` instead, which, as a real,
honest bonus, replaced an old simulation with the real mechanism it had
always stood in for. This project now has 104 real, passing tests, a
real, installable `.apk`, and, for the first time in this project's
history, an object graph that builds itself. Slice 12 — a properly
decoupled calculator architecture — is shipped.

**Next:** Stage 13 (Settings).

