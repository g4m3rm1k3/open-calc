# Lesson 12.2: A Constructor That Only Receives

**What you will build.** A real, permanent fix for the exact object graph
the previous lesson proved was hiding inside `CalculatorViewModel`'s own
constructor. `CalculatorViewModel`'s constructor no longer builds
anything — it only receives its two dependencies as plain parameters,
with no default value, no `@JvmOverloads`. A new, real, permanent class,
`CalculatorViewModelFactory`, becomes the one, single, dedicated place
that knows how to build the real object graph — real Room database, real
`CalculationRepository` — that used to be smuggled inside that default
value. This is **Constructor Injection**: a class's own constructor
should only ever *receive* its dependencies, never *construct* them. The
real, transferable problem this lesson is actually about: removing a
workaround without first building the real, structural thing it was
standing in for breaks real, existing code — proven here against this
project's own real, existing test, not assumed.

**What you need to know first:**
- Lesson 12.1 (The Object Graph One Constructor Hides) — the real,
  three-level object graph already proven to live inside
  `CalculatorViewModel`'s own former default parameter value, and
  `@JvmOverloads`'s own real purpose, both directly addressed by this
  lesson.
- Lesson 4.3 (An Owner That Outlives the Screen) — `ViewModel`,
  `viewModel()`, this project's own established, real ownership
  mechanism for `CalculatorViewModel`.
- Lesson 0.7 (One Shape, Many Behaviors) — implementing a real
  interface's method with `override`, the general mechanism
  `CalculatorViewModelFactory` uses to satisfy `ViewModelProvider.Factory`.
- Lesson 8.6 (The Class That Doesn't Know Its Own Numbers) — generic type
  parameters and JVM type erasure, both reused by `create`'s own real,
  necessary, unchecked cast.

No pipeline diagram — this lesson doesn't touch this project's expression
or graphing pipeline.

## Terms used in this lesson

- **Constructor Injection** — the real design discipline this lesson
  names and applies: a class's own constructor should only ever *accept*
  its dependencies as plain parameters, decided entirely by whoever
  constructs it, and never build any of them itself. Why it matters: the
  moment a constructor builds even one of its own dependencies internally
  — the exact shape `CalculatorViewModel`'s own constructor already had,
  proven concretely against this project's own real code — every caller
  either accepts that one, fixed, internally-built value, or has to
  reconstruct the entire chain by hand to get anything different.
- **bounded type parameter (`<T : ViewModel>`)** — a generic type
  parameter restricted to only ever stand for a specific type or one of
  its subtypes, written as `<T : UpperBound>`. Reappearing here — this
  project has already investigated an unconstrained generic type
  parameter and a rejected `<T : Number>` bound on its own real `Matrix`
  class; what's different here is that this bound is genuinely required,
  not optional: `ViewModelProvider.Factory`'s own real interface, shown
  below, declares `create` with exactly this bound, and implementing the
  interface at all means matching it.
- **unchecked cast (`as T`)** — casting a value to a generic type
  parameter itself, rather than to a concrete, named type. Why it
  matters: the JVM's own real type erasure — already proven, in this
  project's own real code, to make two differently-typed generic methods
  collide into one identical compiled signature — means no real,
  compiled bytecode anywhere actually knows what concrete type `T` stands
  for at runtime, so the compiler cannot verify a cast to it is actually
  safe; it can only trust the programmer's own promise that it is.
- **`@Suppress("UNCHECKED_CAST")`** — a real, standard Kotlin annotation
  silencing one specific compiler warning, named exactly by the string
  passed to it, for the exact scope it's attached to. Why it matters:
  without it, casting to a generic type parameter still compiles and
  runs correctly, but the compiler prints a real, real warning at every
  such cast — this annotation exists so a deliberate, understood
  unchecked cast doesn't get lost in a wall of unrelated, unaddressed
  warning noise.

## Objects and methods used

**`CalculatorViewModel`**
- *What it is:* this project's own real, permanent `ViewModel`, unchanged
  in behavior by this lesson — only its own constructor's shape changes.
- *Implementation:* its real, current, complete primary constructor,
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`,
  lines 17–20:
  ```kotlin
  class CalculatorViewModel(
      application: Application,
      private val repository: CalculationRepository
  ) : AndroidViewModel(application) {
  ```
- *Its use:* this lesson's own real subject — its constructor is the
  exact thing being changed.
- *Type:* a `class`, extending `AndroidViewModel`, using this project's
  own ordinary, implicit primary-constructor shorthand — no longer an
  explicit `constructor` keyword, since nothing about this constructor
  needs an annotation to attach anymore.
- *Responsibility:* unchanged from before — own this calculator's live
  state, expose persisted history, forward button presses. What's
  different: it now has zero responsibility for knowing how either of
  its own two dependencies gets built.
- *Depends on:* a real `Application` and a real `CalculationRepository`
  — both now genuinely required, with no default of any kind.
- *Connects to:* built only by `CalculatorViewModelFactory`, below, in
  the real, shipped app; built directly, by name, at three real call
  sites inside `CalculatorViewModelPersistenceTest.kt`, unaffected by
  this lesson since that file already supplied both arguments explicitly.
- *Shape:* this project's own real MVVM ownership layer — the exact
  class already proven to hide a real object graph inside its own
  constructor, now fixed.

**`CalculatorViewModelFactory`**
- *What it is:* a new, real, permanent class — the one, single, real
  place in this entire project that now knows how to build a working
  `CalculatorViewModel`.
- *Implementation:* its real, complete, current shape,
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`,
  lines 39–49:
  ```kotlin
  class CalculatorViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
      override fun <T : ViewModel> create(modelClass: Class<T>): T {
          val repository = CalculationRepository(
              Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")
                  .build()
                  .calculationDao()
          )
          @Suppress("UNCHECKED_CAST")
          return CalculatorViewModel(application, repository) as T
      }
  }
  ```
- *Its use:* constructed once, with just a real `Application`, at
  `CalculatorScreen`'s own real call site, and separately, directly, by
  this project's own real, fixed `CalculatorViewModelTest.kt`.
- *Type:* a `class`, implementing the real `ViewModelProvider.Factory`
  interface.
- *Responsibility:* build a real, fully working `CalculatorViewModel` —
  and only that; it owns none of `CalculatorViewModel`'s own real,
  ongoing state or behavior.
- *Depends on:* a real `Application`, supplied at its own construction —
  the one real piece of information it needs to build everything else
  itself.
- *Connects to:* called by `ViewModelProvider`'s own real `get` method,
  below, whenever no cached `CalculatorViewModel` already exists to
  return instead.
- *Shape:* this project's own real, dedicated object-construction
  boundary — a real, permanent home for exactly the object graph Lesson
  12.1 already proved was real, now visible and named instead of hidden
  inside a default parameter value.

**`ViewModelProvider.Factory`**
- *What it is:* a real, standard AndroidX interface — the framework's own
  real extension point for anything that knows how to build a specific
  `ViewModel`.
- *Implementation:* real declared shape, confirmed this session via
  `javap -p` against this project's own real, installed
  `lifecycle-viewmodel-2.6.2-api.jar`:
  ```
  public interface ViewModelProvider.Factory {
      <T extends ViewModel> T create(Class<T>);
  }
  ```
- *Its use:* implemented directly by `CalculatorViewModelFactory`, above
  — the real, required contract it exists to satisfy.
- *Type:* a real, public interface, with a real default method body (via
  `default`, confirmed in the same javap output) — meaning implementing
  it only strictly requires overriding `create`, the one real method this
  project's own code actually needs.
- *Responsibility:* declare, generically, "given the `Class` of a
  `ViewModel` I've been asked for, hand back a real, working instance of
  it" — nothing about caching, nothing about lifecycle; that's
  `ViewModelProvider`'s own separate job, below.
- *Depends on:* nothing itself — it's a pure contract; whatever
  implements it decides what it actually depends on.
- *Connects to:* implemented by `CalculatorViewModelFactory`; called by
  `ViewModelProvider`.
- *Shape:* real, public AndroidX platform API — the real seam this whole
  lesson's fix is built on.

**`ViewModelProvider`**
- *What it is:* the real, standard AndroidX class that actually owns and
  caches `ViewModel` instances, deciding whether to hand back an
  already-built one or ask a `Factory` for a new one.
- *Implementation:* real declared shape of the two members this lesson
  calls, confirmed this session via the same `javap -p` pass:
  ```
  public ViewModelProvider(ViewModelStoreOwner, ViewModelProvider.Factory);
  public <T extends ViewModel> T get(Class<T>);
  ```
- *Its use:* constructed with a real `ViewModelStoreOwner` (an `Activity`,
  here) and the real `CalculatorViewModelFactory` above, then asked, via
  `get`, for a real `CalculatorViewModel`.
- *Type:* a real, public class; both members shown are real, public,
  non-`static` — `get` is itself a generic method, bounded the same way
  `Factory.create` is.
- *Responsibility:* own a real `ViewModelStore` (a real, internal cache,
  keyed by class) and decide, on every `get` call, whether to return an
  already-cached real instance or call the real, supplied `Factory` to
  build a new one.
- *Depends on:* a real `ViewModelStoreOwner`, to know which real cache to
  read and write, and a real `Factory`, to know how to build a
  `ViewModel` it doesn't already have cached.
- *Connects to:* calls `CalculatorViewModelFactory.create` the first
  time; returns its own cached instance directly on every later call
  against the same real store, with no second `create` call at all.
- *Shape:* real, public AndroidX platform API — the real, general
  mechanism `viewModel()`, below, is itself built on.

**`viewModel(factory = ...)`**
- *What it is:* the real, public Compose function this project has
  always used to obtain a `ViewModel` inside a composable, now called
  with an explicit `factory` argument for the first time.
- *Implementation:* confirmed this session via `javap -p` against this
  project's own real, installed `lifecycle-viewmodel-compose-2.6.2-api.jar`
  — a real, compiled overload set genuinely includes
  `ViewModelProvider.Factory` as one of its own real parameter types,
  matching its own real, published Kotlin declaration: `@Composable fun
  <VM : ViewModel> viewModel(factory: ViewModelProvider.Factory? = null,
  ...): VM`. Internally, it builds a real `ViewModelProvider` from the
  current composition's own `ViewModelStoreOwner` and the given
  `factory`, then calls `get` on it — the same two real members already
  shown above.
- *Its use:* `CalculatorScreen`'s own real default parameter value now
  passes `factory = CalculatorViewModelFactory(...)` explicitly, instead
  of leaving `factory` at its own default `null`.
- *Type:* a `@Composable` function.
- *Responsibility:* obtain a real `ViewModel`, correctly scoped to the
  current composition's own lifecycle, building one only if none already
  exists for it to reuse.
- *Depends on:* an ambient `ViewModelStoreOwner`, reached implicitly from
  the current composition; an optional real `Factory`, defaulting to
  `null` when the caller doesn't supply one.
- *Connects to:* wraps a real `ViewModelProvider`, above; when `factory`
  is left `null`, that internal `ViewModelProvider` is built without one,
  which is exactly what forces its own default, reflection-based
  `AndroidViewModelFactory` to be used instead — the real path Lesson
  12.1's own default value, and this lesson's own real, captured break,
  both depended on.
- *Shape:* this project's own established real entry point for
  `ViewModel` ownership inside Compose, unchanged in name, now called
  with one more real, explicit argument.

### Everything else in the file, not this lesson's subject but still explained

**`Class<T>`**
- *What it is:* the real, standard Java class representing a runtime type
  token — the same real mechanism behind `AppDatabase::class.java`,
  already shown in this project's own real code.
- *Implementation:* `java.lang.Class<T>`, a real, generic class; every
  loaded class or interface has exactly one real, shared `Class` instance
  representing it at runtime.
- *Its use:* `create`'s own real parameter, `modelClass: Class<T>`, is
  what `ViewModelProvider` passes in to say, concretely, at runtime,
  which real `ViewModel` subclass it's actually asking to be built.
- *Type:* a real, generic class, part of the core Java platform.
- *Responsibility:* represent, as a real, inspectable runtime object,
  exactly one loaded class or interface.
- *Depends on:* nothing from this project's own code — supplied by the
  JVM itself, one instance per loaded class.
- *Connects to:* passed into `create` by `ViewModelProvider`'s own real,
  internal logic; this project's own real implementation never actually
  reads `modelClass`'s own value, since it only ever builds one real
  concrete type.
- *Shape:* core JVM platform API, already established in this project's
  own code, reused here in a new, generic-method context.

**`Activity` / `ComponentActivity`**
- *What it is:* `ComponentActivity` is this project's own already-
  established real `MainActivity` superclass; `Activity` is the real,
  deeper Android platform class it itself extends, and the one that
  actually declares `getApplication`.
- *Implementation:* confirmed this session via `javap -p` against this
  project's own real, installed `android.jar`: `public final Application
  getApplication()`, declared on `android.app.Activity` — `final` here
  means no subclass, `ComponentActivity` included, can override it.
- *Its use:* this lesson's own fixed `CalculatorViewModelTest.kt` reads
  `activityBefore.application` — Kotlin's own automatic property syntax
  for that exact real getter — to obtain a real `Application` without
  constructing one by hand.
- *Type:* a real, `final` instance method on `Activity`.
- *Responsibility:* hand back the one real `Application` instance for the
  entire app process — the same real object `AndroidViewModel`'s own
  constructor already requires.
- *Depends on:* a real, already-running `Activity`, whether on-device or,
  as here, under Robolectric.
- *Connects to:* its own real return value is passed straight into
  `CalculatorViewModelFactory`'s own constructor.
- *Shape:* real, public Android platform API, already an established
  part of this project's own real Activity hierarchy.

**`Context.getApplicationContext()` / `LocalContext.current.applicationContext`**
- *What it is:* the real, standard Android method returning the one,
  application-scoped `Context` for the entire app process, reached here
  through Compose's own `LocalContext`.
- *Implementation:* confirmed this session via `javap -p` against this
  project's own real, installed `android.jar`: `public abstract Context
  getApplicationContext()`, declared on `android.content.Context` —
  `abstract` here because `Context` itself is an abstract class; every
  real, concrete subclass, `Application` and `Activity` alike, provides
  its own real implementation.
- *Its use:* `CalculatorScreen`'s own real default parameter value reads
  `LocalContext.current.applicationContext as Application` to obtain the
  one real `Application` `CalculatorViewModelFactory` needs.
- *Type:* a real, `abstract` instance method on `Context`.
- *Responsibility:* hand back a real `Context` guaranteed to be
  application-scoped, regardless of which specific, shorter-lived
  `Context` it was actually called on.
- *Depends on:* being called on some real, already-existing `Context` —
  here, whatever real `Context` `LocalContext.current` itself already
  resolves to.
- *Connects to:* its own real return type is `Context`, not `Application`
  — the real reason `as Application` is still needed alongside it, a
  real, safe cast in this specific case because Android's own real,
  documented contract guarantees this exact call genuinely returns the
  one real `Application` singleton, not some other `Context` subtype.
- *Shape:* real, public Android platform API.

---

## Concept Unit: A Constructor That Only Receives

### The Problem

The previous lesson proved `CalculatorViewModel`'s own real second
constructor parameter already builds an entire object graph inline, and
that this project's own real `CalculatorViewModelPersistenceTest.kt`
already has to retype that graph by hand, three separate times, to
substitute a fake dependency. The obvious-looking fix — just delete the
default value, so `repository` becomes a real, required parameter with
no way to build itself — is one real line to write. Is it actually
enough on its own?

Given that `CalculatorScreen`'s own real call site, `viewModel()`, never
mentions `CalculationRepository` by name anywhere in its own source —
and that this project's own real `CalculatorViewModelTest.kt` builds a
`CalculatorViewModel` through `ViewModelProvider(activityBefore)
.get(CalculatorViewModel::class.java)`, also never naming
`CalculationRepository` — what do you predict happens to either of those
two real call sites the instant `repository`'s own default value is
simply deleted, with nothing put in its place? Would you expect a
compile error, since Kotlin generally requires every non-default
parameter to be supplied? Or is it possible for source code that never
mentions a parameter by name to still, somehow, depend on its default
value existing?

### Introduce the Concept in Isolation

A small, throwaway, three-class comparison, added temporarily as
`lab1_constructor_injection.kt` — one class building its own dependency
inline, one instead receiving it:

```kotlin
class Connection(private val label: String) {
    fun describe() = "Connection[$label]"
}

class StoreBuildsItsOwn {
    private val connection = Connection("default")
    fun report() = "StoreBuildsItsOwn uses ${connection.describe()}"
}

class StoreReceivesItsOwn(private val connection: Connection) {
    fun report() = "StoreReceivesItsOwn uses ${connection.describe()}"
}

fun main() {
    val builtIn = StoreBuildsItsOwn()
    println(builtIn.report())

    val injected = StoreReceivesItsOwn(Connection("real"))
    println(injected.report())

    val injectedForTest = StoreReceivesItsOwn(Connection("fake-for-test"))
    println(injectedForTest.report())
}
```

Compiled and run for real this session (`kotlinc
lab1_constructor_injection.kt -include-runtime -d lab1.jar`, then `java
-jar lab1.jar`), saved in full in
`verification/12.2/lab1_output.txt`:

```
StoreBuildsItsOwn uses Connection[default]
StoreReceivesItsOwn uses Connection[real]
StoreReceivesItsOwn uses Connection[fake-for-test]
```

`StoreBuildsItsOwn` can only ever report `Connection[default]` — there is
no argument to pass, anywhere, that changes which `Connection` it uses;
the only way to change that is to edit `StoreBuildsItsOwn`'s own source.
`StoreReceivesItsOwn`, by contrast, produced two genuinely different real
results — `Connection[real]` and `Connection[fake-for-test]` — from the
exact same, unchanged class, because the caller, not the class itself,
decides which `Connection` to hand it. This is called **Constructor
Injection**: a class's own constructor only *receives* its dependencies,
decided by whoever constructs it, and never builds any of them itself.

### Discard the Throwaway Example

`lab1_constructor_injection.kt` is deleted now — real, saved in
`verification/12.2/lab1_constructor_injection.kt` alongside its real run
transcript. It does not exist in this project's own real source tree.

### Project Change

- **Reference Source:** no reference counterpart — this project's own
  BRD names this lesson "Constructor Injection" directly, with no
  external reference implementation to port from.
- **Files affected:**
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`
  (modified).
- **Change type:** remove.
- **Location:** `CalculatorViewModel`'s own primary constructor, its own
  second parameter's default value specifically.
- **Dependencies:** none beyond what this file already imports.

### The New Code

```kotlin
class CalculatorViewModel(
    application: Application,
    private val repository: CalculationRepository
) : AndroidViewModel(application) {
```

### The Updated Project

`CalculatorViewModel.kt`, lines 17–20 — the full, real, current
constructor, no lines omitted:

```kotlin
17: class CalculatorViewModel(                                        // ← changed
18:     application: Application,
19:     private val repository: CalculationRepository                 // ← changed
20: ) : AndroidViewModel(application) {                                // ← changed
```

`@JvmOverloads` is gone from line 17, and the explicit `constructor`
keyword it required is gone with it — this project's own ordinary,
implicit primary-constructor shorthand is enough again, now that nothing
here needs to carry an annotation. Line 19's own default value —
`CalculationRepository(Room.databaseBuilder(...)...)`, the exact real
object graph the previous lesson proved exists — is gone entirely;
`repository` is now a plain, required parameter, exactly like
`application` on the line above it. `CalculatorViewModel` as a whole now
only ever *receives* both of its dependencies; it no longer contains a
single line of code that knows how to build either one.

This one, real, minimal change was made and run for real this session,
deliberately before either real call site below was fixed, to prove —
not assume — what actually breaks. `CalculatorScreen`'s own real call
site, `viewModel()`, still compiled clean; so did this project's own real
`CalculatorViewModelTest.kt`. Running the real, existing suite told a
different story: `CalculatorViewModelTest`'s own
`inProgressCalculationSurvivesRealSimulatedConfigurationChange` failed
for real, saved in full in
`verification/12.2/break1_no_factory_result.xml`:

```
java.lang.RuntimeException: Cannot create an instance of class com.example.calculator.CalculatorViewModel
	at androidx.lifecycle.ViewModelProvider$AndroidViewModelFactory.create(ViewModelProvider.kt:316)
	at androidx.lifecycle.SavedStateViewModelFactory.create(SavedStateViewModelFactory.kt:128)
	at androidx.lifecycle.ViewModelProvider.get(ViewModelProvider.kt:187)
	at com.example.calculator.CalculatorViewModelTest.inProgressCalculationSurvivesRealSimulatedConfigurationChange(CalculatorViewModelTest.kt:21)
Caused by: java.lang.NoSuchMethodException: com.example.calculator.CalculatorViewModel.<init>(android.app.Application)
```

A real, genuine failure — not a compile error, exactly as the Problem
section's own question invited predicting: `ViewModelProvider(activityBefore)
.get(CalculatorViewModel::class.java)` never names `CalculationRepository`
anywhere in its own source, so nothing about deleting a default value
could ever produce a compile error there. The real, caught exception
explains why: `SavedStateViewModelFactory`, this project's own real,
default, reflection-based factory (already active every time this
project's own code has ever called plain `viewModel()` with no factory
argument), falls back to `AndroidViewModelFactory` for any
`AndroidViewModel` subclass, and that real factory reflects for a
constructor taking exactly `(Application)` — the exact single-argument
overload `@JvmOverloads` used to generate, now gone. This confirms, with
real, caught, thrown evidence, exactly why `@JvmOverloads` existed on
this constructor in the first place, and exactly what breaks the moment
it's removed with nothing built to replace what it was standing in for.

### Mechanical Walkthrough

Every distinct construct in the real, updated constructor, enumerated in
order:

- `class CalculatorViewModel(` — this project's own ordinary, implicit
  primary-constructor shorthand, reappearing unchanged from everywhere
  else in this project that doesn't need an annotation on its own
  constructor.
- `application: Application,` — unchanged, a real, required parameter.
- `private val repository: CalculationRepository` — the one real line
  that changed: still a real, constructor-declared property, but with no
  `=` and no default expression following it at all — a plain, required
  parameter, identical in shape to `application` on the line above it.
- `) : AndroidViewModel(application) {` — unchanged, this project's own
  real superclass constructor call.

### CS Lens

This is **Constructor Injection**, named above — the specific, narrower
case of a more general idea called **Inversion of Control**: instead of
a piece of code deciding, itself, how to obtain something it needs, that
decision is handed to something outside it.

```
Also recognized in: a plugin system that receives its own host
application instead of importing and calling it directly; a web
framework injecting a request object into a handler function instead of
the handler reading a global; a game engine handing a component its own
required systems at creation instead of the component reaching for
global singletons
```

### SE Lens

The real alternative to deleting the default value outright — leaving it
in place, unfixed — was never actually available: leaving it in place is
exactly what keeps the real object graph hidden and the real duplication
cost growing, already proven concretely against this project's own real
code. The real
tradeoff this unit's own evidence makes concrete: a workaround
(`@JvmOverloads` plus a default value) can genuinely be load-bearing —
removing it isn't automatically progress unless something real replaces
whatever it was actually doing. This project's own real, caught
`NoSuchMethodException` is the honest cost of proving that the hard way,
on purpose, rather than only asserting it: the fix isn't finished yet,
and the next unit builds the real, structural thing this constructor's
own default value used to stand in for.

### Commands Needed

- `kotlinc <file>.kt -include-runtime -d <file>.jar` — this project's own
  established standalone-lab command, unchanged.
- `./gradlew :app:compileDebugKotlin` — compiles only this project's main
  source set; used here to confirm the constructor change alone doesn't
  break compilation anywhere.
- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.CalculatorViewModelTest"` —
  runs exactly one real test class, the fastest way to isolate and
  confirm a single, specific, predicted real failure.

### Run It

Shown above in full — the real, clean lab run, then the real, compiling-
but-failing project state, then the real, caught exception. Full
transcripts saved in `verification/12.2/lab1_output.txt` and
`verification/12.2/break1_no_factory_result.xml`.

### Connect the Pieces

The isolated lab proved, with two real, different results from one
unchanged class, what Constructor Injection actually means. Applying the
same real change to this project's own `CalculatorViewModel` proved it's
not free: deleting a workaround without replacing what it was doing
produced a real, caught, genuine failure — the exact, concrete problem
the next unit's own real fix exists to solve.

---

## Concept Unit: The Object Whose Only Job Is Building

### The Problem

The previous unit's own real, caught exception traced through two real,
already-existing framework classes this project has never directly used
before: `SavedStateViewModelFactory` and `AndroidViewModelFactory`, both
reflection-based, both now unable to build `CalculatorViewModel`. Neither
of those is something this project's own code can edit — they belong to
AndroidX. What real, available seam is actually left to build a fix on?

If Android's own framework already calls into a real, general-purpose
`Factory` object whenever it needs to build a `ViewModel` it doesn't
already have cached — which the previous unit's own real stack trace
already shows happening, twice, before the failure — what would you
expect happens if this project supplies its own real, working
implementation of that exact same contract, instead of relying on the
framework's own default, reflection-based one? And given that
`CalculatorViewModel`'s constructor, after the previous unit's own
change, now has zero code capable of building a `CalculationRepository`
— where does that real building logic have to move to, if it still has
to exist somewhere?

### Introduce the Concept in Isolation

A small, throwaway `ViewModel`/`Factory` pair, added temporarily as
`LabFactoryTest.kt` directly to this project's own real Gradle module —
the same standing adaptation this project already relies on for any
Android-framework-specific construct with no plain, Android-free
`kotlinc` equivalent, since a real `ViewModelProvider` needs a real,
simulated `Activity` to own it:

```kotlin
package com.example.calculator

import androidx.activity.ComponentActivity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

private class LabViewModel(val value: Int) : ViewModel()

private class LabViewModelFactory(private val value: Int) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        @Suppress("UNCHECKED_CAST")
        return LabViewModel(value) as T
    }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabFactoryTest {
    @Test
    fun factoryBuildsTheRealViewModelWithTheGivenValue() {
        val activity = Robolectric.buildActivity(ComponentActivity::class.java).setup().get()
        val viewModel = ViewModelProvider(activity, LabViewModelFactory(42)).get(LabViewModel::class.java)
        assertEquals(42, viewModel.value)
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabFactoryTest"`), saved in full in
`verification/12.2/lab2_output.txt`.

### Discard the Throwaway Example

`LabFactoryTest.kt` was deleted from the project immediately after this
real run — it never appears in the project again.

### Project Change

- **Reference Source:** no reference counterpart — this project's own
  BRD names Constructor Injection as this lesson's own subject, with no
  external file to port a factory implementation from.
- **Files affected:**
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`
  (modified, new class added);
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified);
  `app/src/test/java/com/example/calculator/CalculatorViewModelTest.kt`
  (modified).
- **Change type:** add (the new `CalculatorViewModelFactory` class),
  configure (`CalculatorScreen`'s own default parameter value,
  `CalculatorViewModelTest`'s own construction line).
- **Location:** `CalculatorViewModelFactory` is added directly below
  `CalculatorViewModel` in the same file; `CalculatorScreen`'s own
  default value is replaced inside its existing parameter list;
  `CalculatorViewModelTest`'s own construction line is replaced inside
  its existing test method.
- **Dependencies:** `androidx.lifecycle.ViewModel` and
  `androidx.lifecycle.ViewModelProvider`, both already resolved,
  transitively, on this project's existing classpath since
  `AndroidViewModel` was first added.

### The New Code

```kotlin
class CalculatorViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        val repository = CalculationRepository(
            Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")
                .build()
                .calculationDao()
        )
        @Suppress("UNCHECKED_CAST")
        return CalculatorViewModel(application, repository) as T
    }
}
```

### The Updated Project

`CalculatorViewModel.kt`, lines 39–49 — the entire real, new class, no
lines omitted:

```kotlin
39: class CalculatorViewModelFactory(private val application: Application) : ViewModelProvider.Factory { // ← new
40:     override fun <T : ViewModel> create(modelClass: Class<T>): T {                                    // ← new
41:         val repository = CalculationRepository(                                                       // ← new
42:             Room.databaseBuilder(application, AppDatabase::class.java, "calculator.db")                // ← new
43:                 .build()                                                                               // ← new
44:                 .calculationDao()                                                                      // ← new
45:         )                                                                                               // ← new
46:         @Suppress("UNCHECKED_CAST")                                                                    // ← new
47:         return CalculatorViewModel(application, repository) as T                                       // ← new
48:     }                                                                                                   // ← new
49: }                                                                                                       // ← new
```

The exact real object graph already proven to be hiding inside
`CalculatorViewModel`'s own former default parameter value now lives here
instead — unchanged in what it builds, moved entirely into a real,
separate class whose only real job is building it. Two more real, small
call-site changes complete the fix. `MainActivity.kt`, lines 216–222 —
`CalculatorScreen`'s own real, complete parameter list, no lines omitted:

```kotlin
216: @Composable
217: fun CalculatorScreen(                                                                          // ← changed
218:     mode: String = "Basic",
219:     calculatorViewModel: CalculatorViewModel = viewModel(                                       // ← changed
220:         factory = CalculatorViewModelFactory(LocalContext.current.applicationContext as Application) // ← new
221:     )                                                                                            // ← new
222: ) {
```

`calculatorViewModel`'s own default value still calls `viewModel()`,
exactly as before — what changed is that it now passes `factory`
explicitly, built from the real, current `Application` reached through
`LocalContext`, rather than leaving `factory` at its own default `null`
and depending on a reflection-based fallback this project's own code
never named anywhere. And `CalculatorViewModelTest.kt`, lines 19–22 — the
real, complete real construction sequence, no lines omitted:

```kotlin
19: val controller = Robolectric.buildActivity(ComponentActivity::class.java).setup()
20: val activityBefore = controller.get()
21: val factory = CalculatorViewModelFactory(activityBefore.application)              // ← new
22: val viewModel = ViewModelProvider(activityBefore, factory).get(CalculatorViewModel::class.java) // ← changed
```

Line 21 builds the real factory directly, using `activityBefore.application`
— the real `Activity.getApplication()` call this lesson's own Header
already confirmed via `javap`. Line 22 now passes that real factory
explicitly into `ViewModelProvider`'s own two-argument constructor,
instead of relying on its single-argument overload's own reflection-based
default.

### Mechanical Walkthrough

Every distinct construct in `CalculatorViewModelFactory`, enumerated in
order:

- `class CalculatorViewModelFactory(private val application: Application)` —
  a real, constructor-injected property, the same real mechanism already
  established throughout this project; this class receives its own one
  real dependency instead of building it, exactly the discipline the
  previous unit named.
- `: ViewModelProvider.Factory` — real interface implementation, the same
  general mechanism already established for this project's own
  `Operation`/`MatrixOperation` interfaces, this time satisfying a real
  AndroidX contract instead of one this project defined itself.
- `override fun <T : ViewModel> create(modelClass: Class<T>): T` —
  `override` marks this as a real, required implementation of the
  interface's own abstract method; `<T : ViewModel>` is a real, bounded
  generic type parameter — `T` may stand for `ViewModel` itself or any
  real subtype, matching the exact bound `ViewModelProvider.Factory`'s
  own real interface already declares; `modelClass: Class<T>` is the
  real runtime type token `ViewModelProvider` passes in, unread by this
  project's own real body; the return type `T` promises to hand back an
  instance of whatever specific type was actually asked for.
- `val repository = CalculationRepository(` ... `)` — the identical real,
  three-level object graph construction already proven, against this
  project's own real code, to exist —
  `Room.databaseBuilder(application, AppDatabase::class.java,
  "calculator.db").build().calculationDao()`, unchanged in shape, now
  living inside this dedicated class instead of a default parameter
  value.
- `@Suppress("UNCHECKED_CAST")` — a real annotation, silencing exactly
  the one real compiler warning the very next line would otherwise
  produce.
- `return CalculatorViewModel(application, repository) as T` — a real,
  direct constructor call, supplying both of `CalculatorViewModel`'s own
  now-required parameters explicitly; `as T` is a real, unchecked cast —
  this project's own code is certain, by construction, that the object
  it just built really is whatever `T` stands for at this real call site,
  but the JVM's own real type erasure means nothing in the compiled
  bytecode can verify that promise, only trust it.

### CS Lens

`CalculatorViewModelFactory` is a real, minimal instance of the
**Factory pattern** — a design pattern whose entire job is centralizing
object construction into one dedicated place, so the objects it builds
never have to know how to build themselves.

```
Also recognized in: a game engine's own entity factory building fully-
configured game objects from a template; a UI toolkit's own dialog
builder assembling a complex, multi-part window from simpler pieces; a
database connection pool handing out ready-to-use connections instead of
each caller opening its own
```

### SE Lens

The real alternative to a dedicated `Factory` class, still available in
principle, is going back to a default parameter value — the exact
design the previous unit just proved is what caused the real problem in
the first place. The real tradeoff this unit's own fix accepts: one more
real, small, permanent class now exists in this project, purely for
construction, with no behavior of its own — genuinely more code than the
one-line default value it replaces. What that extra code buys, honestly:
`CalculatorViewModel`'s own constructor is now trivially, visibly
receiving-only — anyone reading it can see, immediately, that it builds
nothing — and there is now exactly one real place, not zero and not
several scattered ones, that would need to change if this project's own
persistence chain ever changed shape. The real debt this unit does not
pay off: `CalculatorViewModelFactory` still contains the identical real
`Room.databaseBuilder(...)` chain, written out by hand — this lesson
centralizes where that manual construction lives; it does not yet remove
manual construction itself. That's a real, honest, deliberate scope
limit, not an oversight — a real dependency-injection framework, capable
of building this same graph without any class writing `Room.databaseBuilder`
by hand at all, is real, still-future work this project has not yet done.

### Commands Needed

No new commands beyond `./gradlew :app:testDebugUnitTest --tests`,
already shown in the previous unit, this time targeting
`LabFactoryTest`.

### Run It

Shown above in full — the real, passing isolated lab, then the real,
complete, permanent fix. A full, clean `./gradlew testDebugUnitTest
assembleDebug` run, confirming every one of this project's own real
tests passes and a real, installable `.apk` still builds, is saved in
full in `verification/12.2/step1_full_suite.txt`.

### Connect the Pieces

The isolated lab proved, in miniature, that a real, custom
`ViewModelProvider.Factory` genuinely works — a real `42`, round-tripped
through a real `ViewModelProvider`. Applying the identical real mechanism
to this project's own actual `CalculatorViewModel` closed the real gap
the previous unit deliberately left open: the exact real object graph
already proven to exist now lives in exactly one real, dedicated, named
place, and `CalculatorViewModel`'s own constructor, for the first time in
this project's history, only ever receives.

---

## Connect the Pieces

One real chain, traced start to finish. The first unit proved Constructor
Injection's own real benefit with an isolated lab — the same class,
unchanged, working with two genuinely different real dependencies — then
applied the real half of the fix to `CalculatorViewModel`'s own
constructor, and, rather than assuming the rest would follow safely,
actually ran this project's own real test suite and caught a real,
genuine `NoSuchMethodException`, proving exactly why `@JvmOverloads` and
the old default value had been load-bearing all along. The second unit
named the real, available seam the caught exception itself pointed
at — `ViewModelProvider.Factory`, the exact contract Android's own
framework was already calling into and failing against — proved it works
with a small, isolated lab, and then built `CalculatorViewModelFactory`
for real: the one, single, dedicated class that now knows how to build a
`CalculatorViewModel`, so nothing else in this project has to. This
project's own real object graph is no longer hidden — it has a name, a
real file, and a real, singular
responsibility. What it does not yet have is a way to be built without
handwritten `Room.databaseBuilder` code anywhere at all — a real, honest,
remaining gap the next two lessons close.

**Next:** Lesson 12.3 (Interfaces as Boundaries).
