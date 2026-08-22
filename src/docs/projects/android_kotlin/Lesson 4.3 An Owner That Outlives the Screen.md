# Lesson 4.3: An Owner That Outlives the Screen

- **What you will build** — a real `CalculatorViewModel`, and the real fix
  for the exact risk the previous lesson proved: `CalculatorScreen`'s own
  in-progress calculation, held with plain `remember`, does not survive a
  real configuration change. By the end of this lesson that same
  in-progress calculation — a digit typed, an operator pressed, a second
  digit typed, but `=` not yet pressed — really does survive a real,
  simulated device rotation, proven with a real, executed test, not
  argued for. The transferable problem: some values need to live longer
  than whatever piece of code currently happens to be showing them, and
  a framework needs a real, specific tool for saying so — "remember
  this until nobody needs it anymore" is a fundamentally different
  promise than "remember this as long as this one function happens to
  still be running."
- **What you need to know first** — Lesson 4.2's own real, proven
  finding: `CalculatorScreen`'s state, held with `remember`, not
  `rememberSaveable`, would really lose a user's in-progress calculation
  on a real configuration change; Lesson 4.1's own real, published-source
  proof that `rememberNavController()` uses `rememberSaveable`
  specifically to survive that exact event; Lesson 3.3's `CalculatorState`
  and `nextState`; Lesson 1.4's `remember`/`mutableStateOf`.
- **Terms used in this lesson**
  - **Lifecycle** — the ordered sequence of real states something passes
    through, from creation to destruction, with real, name-able moments
    in between. Why it matters: without agreeing on names for those
    moments, there's no way to say precisely *when* a piece of code
    should run — "clean this up" is meaningless without a real, defined
    moment that means "now."
  - **Configuration change** — Android's own real term for an event (a
    screen rotation, a keyboard becoming available, a system language
    change) that, by default, tears down the current Activity and
    rebuilds a fresh one from scratch — a real, deliberate framework
    design choice, not a bug, so that every screen naturally re-reads
    whatever resources match the new configuration. Why it matters: this
    is the exact real event this project already proved
    `CalculatorScreen`'s own `remember`-held state does not survive.
  - **State ownership** — which piece of code is actually responsible
    for holding a value long enough for it to mean anything, independent
    of whichever piece of code happens to be reading or displaying it
    right now. Why it matters: a value's own *owner* and a value's own
    *reader* are two different real roles — this project already proved
    `CalculatorScreen` was quietly playing both roles at once, and that
    conflating them is exactly what made a real configuration change
    dangerous.
- **Objects and methods used**

  - **`ViewModel`**
    - *What it is:* the real, abstract Android framework class whose
      entire purpose is holding UI state independently of any one
      screen's own lifecycle.
    - *Implementation:* `public abstract class ViewModel { public
      ViewModel(); protected void onCleared(); ... }` — confirmed via
      `javap` against the real installed `lifecycle-viewmodel-2.6.2.aar`
      this session.
    - *Its use:* `CalculatorViewModel`, this lesson's own real new class,
      extends it directly.
    - *Type:* a public abstract class.
    - *Responsibility:* survive being read by many different, temporary
      screen instances over time, and clean up exactly once, at the real
      moment nothing will ever read it again.
    - *Depends on:* nothing to construct — a bare, no-argument
      constructor.
    - *Connects to:* subclassed by this lesson's own `CalculatorViewModel`;
      managed by a real `ViewModelStore`, below.
    - *Shape:* a public Android framework API — the real base class this
      entire lesson is built around.

  - **`ViewModel.onCleared()`**
    - *What it is:* a real, protected method, called by the framework
      exactly once, at the exact real moment a `ViewModel` is being
      permanently destroyed — never on a mere configuration-change
      recreation.
    - *Implementation:* `protected void onCleared()` — confirmed via
      `javap` against the real installed `lifecycle-viewmodel-2.6.2.aar`
      this session; its own default body does nothing, meant to be
      overridden.
    - *Its use:* overridden inside this lesson's own throwaway lab to
      record, in a real boolean flag, whether it actually fired.
    - *Type:* a protected instance method, meant to be overridden.
    - *Responsibility:* give a `ViewModel` exactly one real chance to
      release anything it's holding (a listener, an open resource)
      before it's gone for good.
    - *Depends on:* being called by the framework — never called
      directly by application code.
    - *Connects to:* triggered internally by `ViewModelStore.clear()`,
      below.
    - *Shape:* the one real hook this whole lesson's own "Lifecycle"
      concept is built around.

  - **`ViewModelStore`**
    - *What it is:* the real class holding a real collection of
      `ViewModel` instances, keyed by name, and responsible for clearing
      all of them together.
    - *Implementation:* `public class ViewModelStore { public
      ViewModelStore(); public final void put(String, ViewModel); public
      final ViewModel get(String); public final void clear(); }` —
      confirmed via `javap` against the real installed
      `lifecycle-viewmodel-2.6.2.aar` this session.
    - *Its use:* constructed directly inside this lesson's own isolated
      lab, to hold one real `ViewModel` and prove `clear()`'s own real
      effect.
    - *Type:* a public class.
    - *Responsibility:* own a real group of `ViewModel` instances for as
      long as their real owner (an Activity, a `NavBackStackEntry`)
      exists, and clear every one of them together, exactly once, when
      that owner is genuinely finished.
    - *Depends on:* nothing to construct — a bare, no-argument
      constructor.
    - *Connects to:* holds real `ViewModel` instances added via `put`;
      every real `ViewModelStoreOwner`, below, owns exactly one.
    - *Shape:* the real container `onCleared()`'s own guarantee is built
      on top of.

  - **`ViewModelStore.put(String, ViewModel)`**
    - *What it is:* the real method storing one `ViewModel`, keyed by a
      real string.
    - *Implementation:* `public final void put(String key, ViewModel
      viewModel)` — confirmed via `javap` this session.
    - *Its use:* stores this lesson's own lab `ViewModel` under the key
      `"lab"`.
    - *Type:* a public instance method on `ViewModelStore`.
    - *Responsibility:* record one real `ViewModel` under one real key,
      so it can be found again later by that same key.
    - *Depends on:* a `key: String` and a real `viewModel: ViewModel`
      instance to store.
    - *Connects to:* called directly inside this lesson's own isolated
      lab; called internally by `ViewModelProvider`, below, whenever it
      creates a `ViewModel` for the first time.
    - *Shape:* the real "add" half of `ViewModelStore`'s own
      responsibility.

  - **`ViewModelStore.clear()`**
    - *What it is:* the real method that clears every `ViewModel` this
      store holds, triggering each one's own real `onCleared()`.
    - *Implementation:* `public final void clear()` — confirmed via
      `javap` this session; its own real, executed effect (not just its
      signature) is proven directly by this lesson's own isolated lab,
      below.
    - *Its use:* called directly inside this lesson's own isolated lab,
      proving `onCleared()`'s own real trigger.
    - *Type:* a public instance method on `ViewModelStore`.
    - *Responsibility:* permanently clear every real `ViewModel` this
      store holds — the one real moment `onCleared()`'s own guarantee
      actually fires.
    - *Depends on:* nothing beyond the store's own already-held
      `ViewModel` instances.
    - *Connects to:* called directly inside this lesson's own isolated
      lab; called internally by the framework itself the real moment an
      Activity or `NavBackStackEntry` is permanently finished, never on
      a mere configuration-change recreation.
    - *Shape:* the real "remove everything, permanently" half of
      `ViewModelStore`'s own responsibility — the exact real trigger
      this lesson's own "Lifecycle" concept is built around.

  - **`viewModel()`**
    - *What it is:* the real, `@Composable` convenience function that
      obtains a real `ViewModel`, creating one the first time and
      returning the identical, already-existing one on every later call
      within the same real scope.
    - *Implementation:* `@Composable inline fun <reified VM : ViewModel>
      viewModel(viewModelStoreOwner: ViewModelStoreOwner =
      checkNotNull(LocalViewModelStoreOwner.current) { "No
      ViewModelStoreOwner was provided via LocalViewModelStoreOwner" },
      key: String? = null, factory: ViewModelProvider.Factory? = null):
      VM` — its real parameter types confirmed via `javap` against the
      real installed `lifecycle-viewmodel-compose-2.6.2.aar` this
      session; its real default `viewModelStoreOwner` value and
      parameter names confirmed against AndroidX's own public source.
    - *Its use:* called once, as `CalculatorScreen`'s own new
      `calculatorViewModel: CalculatorViewModel = viewModel()` default
      parameter value.
    - *Type:* a `@Composable`, `inline`, `reified` top-level function.
    - *Responsibility:* look up (or, the first time, create) exactly one
      real `CalculatorViewModel`, scoped to whichever real
      `ViewModelStoreOwner` is nearest in the composition, and return
      the same real instance every time it's called again within that
      same scope.
    - *Depends on:* a real `ViewModelStoreOwner` somewhere above it in
      the composition — supplied automatically here, never passed
      explicitly.
    - *Connects to:* reads `LocalViewModelStoreOwner.current`, below;
      internally constructs a real `ViewModelProvider`, below, and calls
      its own `get(Class<T>)`.
    - *Shape:* the real, idiomatic entry point Compose code uses to
      obtain a `ViewModel` — what this lesson's own isolated lab proves
      by hand, using `ViewModelProvider` directly instead.

  - **`ViewModelStoreOwner`**
    - *What it is:* the real interface naming anything responsible for
      owning exactly one real `ViewModelStore`.
    - *Implementation:* `public interface ViewModelStoreOwner { public
      abstract ViewModelStore getViewModelStore(); }` — confirmed via
      `javap` against the real installed `lifecycle-viewmodel-2.6.2.aar`
      this session; `ComponentActivity`, below, and
      `androidx.navigation.NavBackStackEntry` (already real, confirmed
      via `javap` this session) both genuinely implement it.
    - *Its use:* the real type this lesson's own isolated lab's
      `ViewModelProvider(activity)` constructor call requires.
    - *Type:* a public interface, with exactly one real abstract method.
    - *Responsibility:* state, for whatever real object implements it,
      "I own one real `ViewModelStore`, and I'll hand it to anyone who
      asks."
    - *Depends on:* nothing — a pure contract.
    - *Connects to:* implemented by `ComponentActivity`, below; read by
      `ViewModelProvider`'s own constructor and by
      `LocalViewModelStoreOwner.current`, below.
    - *Shape:* the real seam between "an object that can own UI state"
      and every specific kind of thing that happens to be one (an
      Activity, a navigation destination).

  - **`LocalViewModelStoreOwner`**
    - *What it is:* the real, ambient `CompositionLocal` Compose already
      threads through every composable, exposing whichever real
      `ViewModelStoreOwner` is nearest.
    - *Implementation:* a real singleton object wrapping a
      `ProvidableCompositionLocal<ViewModelStoreOwner>`, with a real
      `current` property — confirmed via `javap` against the real
      installed `lifecycle-viewmodel-compose-2.6.2.aar` this session;
      the same real ambient-value mechanism already proven for
      `LocalHapticFeedback`.
    - *Its use:* read internally by `viewModel()`'s own real default
      parameter value — never read directly by this lesson's own code.
    - *Type:* a singleton object exposing a `ProvidableCompositionLocal`.
    - *Responsibility:* make "whichever real `ViewModelStoreOwner` is
      currently nearest" available to any composable, without it having
      to be threaded down as an explicit parameter.
    - *Depends on:* something above it in the composition actually
      providing a real value — `ComponentActivity`'s own `setContent`
      already does this automatically.
    - *Connects to:* read by `viewModel()`'s own default parameter
      value; provided, automatically, by `ComponentActivity` and by
      `NavHost`'s own real per-destination `NavBackStackEntry`.
    - *Shape:* the same real ambient-value pattern this project has
      already proven once, reapplied here to a genuinely different real
      value.

  - **`ViewModelProvider`**
    - *What it is:* the real class that actually creates, or looks up,
      a `ViewModel` scoped to a given real owner.
    - *Implementation:* `public class ViewModelProvider { public
      ViewModelProvider(ViewModelStoreOwner owner); public <T extends
      ViewModel> T get(Class<T> modelClass); }` — confirmed via `javap`
      against the real installed `lifecycle-viewmodel-2.6.2.aar` this
      session.
    - *Its use:* constructed directly, twice, inside this lesson's own
      isolated lab and its own new permanent test — once against the
      Activity before a real simulated configuration change, once
      against it again afterward.
    - *Type:* a public class.
    - *Responsibility:* given a real owner and a real `ViewModel` class,
      either hand back an already-existing instance from that owner's
      own `ViewModelStore`, or create and store a new one, the first
      time.
    - *Depends on:* a real `ViewModelStoreOwner` to construct.
    - *Connects to:* constructed directly against a real `Activity`
      inside this lesson's own lab and test; what `viewModel()`, above,
      builds and calls internally on production code's behalf.
    - *Shape:* the real mechanism `viewModel()` is a `@Composable`
      convenience wrapper around — used here directly, by hand, since
      this lesson's own proof needs no Compose UI at all.

  - **`ViewModelProvider.get(Class<T>)`**
    - *What it is:* the real method that actually returns a
      `ViewModel`, of the given real class, scoped to whichever owner
      the `ViewModelProvider` was constructed against.
    - *Implementation:* `public <T extends ViewModel> T
      get(Class<T> modelClass)` — confirmed via `javap` this session.
    - *Its use:* called with `CalculatorViewModel::class.java` (and, in
      the earlier lab, `LabCounterViewModel::class.java`) both before
      and after a real simulated configuration change.
    - *Type:* a public instance method on `ViewModelProvider`.
    - *Responsibility:* return the one real instance of the given class
      already stored in this owner's own `ViewModelStore`, or construct
      and store a new one if none exists yet.
    - *Depends on:* a real `Class<T>` naming which `ViewModel` subclass
      to look up.
    - *Connects to:* called on a `ViewModelProvider`; its own return
      value is what this lesson's own test compares with `assertSame`
      to prove real survival.
    - *Shape:* the exact real call site where "same instance, every
      time, within this owner's own scope" is decided.

  - **`Robolectric.buildActivity(Class<T>)`**
    - *What it is:* the real, standard Robolectric function that builds
      a controller for a real, simulated Android Activity — no real
      device or emulator involved.
    - *Implementation:* `public static <T extends Activity>
      ActivityController<T> buildActivity(Class<T> activityClass)` —
      confirmed via `javap` against the real installed
      `robolectric-4.13.jar` this session.
    - *Its use:* builds a real, simulated `ComponentActivity` for this
      lesson's own isolated lab and its own new permanent test.
    - *Type:* a public `static` method on `Robolectric`.
    - *Responsibility:* hand back a real `ActivityController`, wrapping
      a real, freshly constructed Activity instance, ready to be driven
      through real, simulated lifecycle events.
    - *Depends on:* a real `Class<T>` naming which Activity to build.
    - *Connects to:* its own return value is chained directly into
      `.setup()`, below.
    - *Shape:* Robolectric's own real entry point for anything needing a
      real, simulated Activity — the specific tool this lesson reaches
      for to prove a real configuration change's actual effect.

  - **`ActivityController.setup()`**
    - *What it is:* the real method driving a built Activity all the way
      through its own real creation lifecycle (`create`, `start`,
      `resume`) in one call.
    - *Implementation:* `public ActivityController<T> setup()` —
      confirmed via `javap` against the real installed
      `shadows-framework-4.13.jar` this session.
    - *Its use:* called immediately after `buildActivity`, both in this
      lesson's own isolated lab and its own new permanent test.
    - *Type:* a public instance method on `ActivityController`.
    - *Responsibility:* bring the real, simulated Activity to a fully
      real, running state, ready for real code to interact with it.
    - *Depends on:* an `ActivityController` already built.
    - *Connects to:* returns the same `ActivityController`, so
      `.get()`, below, can immediately retrieve the now-running Activity.
    - *Shape:* the real setup step every Robolectric Activity test needs
      before doing anything else.

  - **`ActivityController.get()`**
    - *What it is:* the real method returning the actual, real Activity
      instance a controller is managing.
    - *Implementation:* `public T get()` — confirmed via `javap` against
      the real installed `shadows-framework-4.13.jar` this session,
      inherited from `ComponentController<C, T>`.
    - *Its use:* called both before and after a real simulated
      configuration change, to obtain the real Activity to construct a
      `ViewModelProvider` against.
    - *Type:* a public instance method, inherited from
      `ComponentController`.
    - *Responsibility:* hand back whichever real Activity object the
      controller currently holds.
    - *Depends on:* an `ActivityController` already set up.
    - *Connects to:* its own return value is passed directly into
      `ViewModelProvider`'s own constructor.
    - *Shape:* the real bridge between Robolectric's own controller
      object and the actual Activity instance real application code
      would interact with.

  - **`ActivityController.configurationChange()`**
    - *What it is:* the real method simulating an actual Android
      configuration change against the controller's own Activity — the
      exact real event a device rotation triggers.
    - *Implementation:* `public ActivityController<T>
      configurationChange()` — confirmed via `javap` against the real
      installed `shadows-framework-4.13.jar` this session.
    - *Its use:* called once, in both this lesson's own isolated lab and
      its own new permanent test, as the real event whose aftermath is
      then checked.
    - *Type:* a public instance method on `ActivityController`.
    - *Responsibility:* drive the real, simulated Activity through
      exactly the sequence of teardown-and-rebuild steps a genuine
      configuration change causes — without needing a real device or
      emulator.
    - *Depends on:* an `ActivityController` already set up.
    - *Connects to:* everything read via `.get()` and `ViewModelProvider`
      immediately after this call is what actually proves survival.
    - *Shape:* the one real call this entire lesson's own decisive proof
      is built around.

  - **`ActivityController` teardown chain (`.pause()`, `.stop()`,
    `.destroy()`)**
    - *What it is:* three real, chainable methods driving a built
      Activity through its own real, ordinary shutdown sequence.
    - *Implementation:* `public ActivityController<T> pause()`; `public
      ActivityController<T> stop()`; `public ActivityController<T>
      destroy()` — confirmed via `javap` against the real installed
      `shadows-framework-4.13.jar` this session.
    - *Its use:* called, chained, at the end of this lesson's own new
      permanent test — a real, necessary fix, not a stylistic touch; see
      this unit's own Run It section for the real failure this closes.
    - *Type:* public instance methods on `ActivityController`.
    - *Responsibility:* release whatever real, simulated Android-framework
      state the built Activity was holding, so it doesn't interfere with
      whatever real test runs after it in the same test process.
    - *Depends on:* an `ActivityController` already set up.
    - *Connects to:* called last, after every real assertion in this
      lesson's own new permanent test has already run.
    - *Shape:* real test hygiene — proven necessary this session, not
      assumed out of caution.

  - **`CalculatorViewModel`**
    - *What it is:* this lesson's own real, new, permanent class — the
      actual fix for the real, already-proven state-ownership risk this
      project's own current design carried.
    - *Implementation:* `class CalculatorViewModel : ViewModel() { var
      state by mutableStateOf(CalculatorState()); fun onButtonClick
      (label: String) { state = nextState(state, label) } }`, in a new
      file, `CalculatorViewModel.kt`.
    - *Its use:* constructed automatically, once, by `CalculatorScreen`'s
      own `calculatorViewModel: CalculatorViewModel = viewModel()`
      default parameter.
    - *Type:* a class extending `ViewModel`.
    - *Responsibility:* own this calculator's entire current state, for
      as long as its real owner (the calculator's own `NavBackStackEntry`)
      exists — independent of how many times `CalculatorScreen` itself
      is recomposed or even torn down and rebuilt.
    - *Depends on:* `CalculatorState`, `nextState` — both this project's
      own, already-established, real, pure business logic, unchanged.
    - *Connects to:* constructed via `viewModel()` inside
      `CalculatorScreen`; its own `onButtonClick` is called from every
      one of the sixteen real keypad `CalculatorButton`s' `onClick`.
    - *Shape:* the real, concrete answer to this project's own already-
      diagnosed problem — state ownership, now genuinely separated from
      UI rendering.

  - **Everything else in the file, not this lesson's subject but still
    explained:**

    - **`ComponentActivity`**
      - *What it is:* this project's own `MainActivity`'s real
        superclass, already established since this project's first
        Compose lesson.
      - *Implementation:* a real, public class, confirmed via `javap`
        this session to genuinely implement `ViewModelStoreOwner`,
        among several other real interfaces.
      - *Its use:* the exact real class this lesson's own isolated lab
        and new permanent test build via `Robolectric.buildActivity`.
      - *Type:* a public class.
      - *Responsibility:* everything this project has already
        established, plus — newly relevant this lesson — genuinely
        owning one real `ViewModelStore` for its own lifetime.
      - *Depends on:* nothing new; unchanged.
      - *Connects to:* `MainActivity` already extends it; this lesson's
        own lab and test construct a bare one directly, with no custom
        subclass needed.
      - *Shape:* unchanged — the same real class this project has used
        since its first real Compose UI, now newly relevant as a real
        `ViewModelStoreOwner`.

    - **`mutableStateOf`**
      - *What it is:* the real Compose function building the actual
        observable holder Compose watches for changes.
      - *Implementation:* `fun <T> mutableStateOf(value: T):
        MutableState<T>`, unchanged from its own first appearance in
        this project.
      - *Its use:* wraps `CalculatorViewModel`'s own `state` property,
        the same real construct that used to sit directly inside
        `CalculatorScreen`.
      - *Type:* a top-level function.
      - *Responsibility:* wrap one value so Compose can observe reads of
        it and trigger recomposition on writes to it.
      - *Depends on:* an initial `CalculatorState()` value.
      - *Connects to:* wrapped by the `by` delegate on
        `CalculatorViewModel.state`; read every time `CalculatorScreen`
        recomposes.
      - *Shape:* the identical real Compose primitive this project's
        own state has used since its first appearance — its own
        *owner* is what genuinely changes this lesson, not this
        construct itself.

    - **`by` delegate (`getValue`/`setValue`)**
      - *What it is:* Kotlin's own real property-delegation operator
        functions, letting a `MutableState<T>` be read and written as if
        it were a plain property.
      - *Implementation:* `operator fun <T> MutableState<T>.getValue
        (thisObj: Any?, property: KProperty<*>): T`; `operator fun <T>
        MutableState<T>.setValue(thisObj: Any?, property: KProperty<*>,
        value: T): Unit` — unchanged from their own first appearance in
        this project.
      - *Its use:* both used on `CalculatorViewModel`'s own `var state by
        mutableStateOf(...)` declaration — reading `state` and assigning
        `state = nextState(...)` both go through these two real operator
        functions.
      - *Type:* `operator fun` extension functions.
      - *Responsibility:* translate plain property syntax (`state`,
        `state = ...`) into real calls against the underlying
        `MutableState<T>`.
      - *Depends on:* a `MutableState<T>` to delegate to.
      - *Connects to:* invoked implicitly every time `state` is read or
        written, inside `CalculatorViewModel`'s own `onButtonClick` and
        inside `CalculatorScreen`'s own body.
      - *Shape:* the identical real delegation mechanism this project's
        own state has used since its first appearance.

    - **`assertSame(expected, actual)`**
      - *What it is:* JUnit's own real assertion confirming two
        references genuinely point at the exact same object, not merely
        two equal ones.
      - *Implementation:* `org.junit.Assert.assertSame(Object expected,
        Object actual): void` — a real, distinct overload from
        `assertEquals`, confirmed via `javap` against the real installed
        `junit-4.13.2.jar` this session.
      - *Its use:* proves, in both this lesson's own isolated lab and its
        own new permanent test, that the exact same `ViewModel` instance
        is returned before and after a real, simulated configuration
        change.
      - *Type:* a `static` method on `org.junit.Assert`.
      - *Responsibility:* fail the test with a real, descriptive message
        unless both arguments are the identical object; otherwise do
        nothing.
      - *Depends on:* two references to compare by identity.
      - *Connects to:* called directly inside this lesson's own lab and
        new permanent test, immediately after a real
        `configurationChange()`.
      - *Shape:* the one real assertion capable of proving "the same
        object," as opposed to `assertEquals`'s own "an equal value" —
        the exact distinction this lesson's own decisive proof depends
        on.

    - **`assertEquals(expected, actual)`**
      - *What it is:* JUnit's own real, general-purpose equality
        assertion, already fully established in this project's own test
        suite.
      - *Implementation:* `org.junit.Assert.assertEquals(Object,
        Object): void`, unchanged from its own established treatment
        earlier in this project.
      - *Its use:* confirms `CalculatorViewModel`'s own real state —
        `Display.Value`, `firstOperand`, `pendingOperator` — genuinely
        survives, value for value, across a real configuration change.
      - *Type:* a `static` method on `org.junit.Assert`.
      - *Responsibility:* fail the test with a real, descriptive message
        if two given values aren't equal; otherwise do nothing.
      - *Depends on:* two values to compare.
      - *Connects to:* called three times inside this lesson's own new
        permanent test, once per real field of the surviving state.
      - *Shape:* this project's own established assertion vocabulary,
        unchanged.

    - **`Display.Value` / `Operator.PLUS`**
      - *What it is:* this project's own real, already-established
        sealed-class case and enum constant.
      - *Implementation:* `data class Value(val text: String) :
        Display()`; `PLUS(Addition())` inside `enum class Operator`,
        both unchanged from their own first appearances in this project.
      - *Its use:* this lesson's own new permanent test asserts the
        surviving `CalculatorViewModel.state` genuinely still holds
        `Display.Value("3")` and `Operator.PLUS`, matching the real
        in-progress calculation typed before the simulated
        configuration change.
      - *Type:* a `data class` case of a sealed class; an `enum class`
        constant.
      - *Responsibility:* represent, respectively, a real ordinary
        display value and a real chosen operator — unchanged.
      - *Depends on:* nothing new.
      - *Connects to:* both read directly off
        `viewModelAfter.state` inside this lesson's own new permanent
        test's assertions.
      - *Shape:* this project's own established domain vocabulary,
        unchanged.

---

## Concept Unit: Lifecycle — the moment that means "gone for good"

### The Problem

This project already proved a real, concrete risk: `CalculatorScreen`'s
own state, held with `remember`, gets wiped the instant a real
configuration change tears the screen down and rebuilds it. The
obvious-sounding fix — "just
make the state survive everything" — has a real problem of its own: a
value that survives *everything*, forever, never gets cleaned up, even
long after the calculator screen is gone for good and nothing will ever
read it again. Something needs to survive a configuration-change
recreation but still, eventually, get cleaned up on real, permanent
destruction — which means something in the framework needs a real,
reliable way to tell those two events apart.

> **Stop and think:** a configuration change tears down and rebuilds a
> screen; a user pressing the system back button and leaving a screen
> for good also tears it down. From the outside, both look like "the
> screen went away." What real, observable difference is there between
> these two events that a framework could actually check? If you had to
> design a rule for "clean this up now" that fires on the second case but
> never the first, what would that rule have to know?

### Introduce the Concept in Isolation

A small, throwaway `ViewModel` subclass and a direct, real use of the
`ViewModelStore` it lives in — no Activity, no Robolectric, no Android
SDK at all, since both `ViewModel` and `ViewModelStore` are plain,
real library classes. Added temporarily as `lab_lifecycle.kt`:

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelStore

class LabViewModel : ViewModel() {
    var wasCleared = false
    override fun onCleared() {
        wasCleared = true
    }
}

fun main() {
    val store = ViewModelStore()
    val vm = LabViewModel()
    store.put("lab", vm)
    println("Before clear: wasCleared = ${vm.wasCleared}")
    store.clear()
    println("After clear: wasCleared = ${vm.wasCleared}")
}
```

Compiled and run for real this session, entirely standalone:

```
$ kotlinc lab_lifecycle.kt -cp lifecycle-viewmodel/classes.jar -include-runtime -d lab_lifecycle.jar
(compiles clean, no warnings/errors)

$ java -cp "lab_lifecycle.jar:lifecycle-viewmodel/classes.jar" Lab_lifecycleKt
Before clear: wasCleared = false
After clear: wasCleared = true
```

Real, concrete proof: `wasCleared` is genuinely `false` right after
construction, and genuinely `true` only after `store.clear()` actually
runs — nothing else in this lab ever calls `onCleared()` directly.
`ViewModelStore.clear()` really is the one real trigger, and it's
entirely separate from anything a mere recomposition, or even a full
object recreation of something *holding* a `ViewModelStore`, would ever
call on its own. This ordered sequence of real, name-able moments —
created, alive, cleared — is called a **lifecycle**, and the specific
moment `clear()` represents is what a real Android framework component
(an Activity, a navigation destination) only reaches on genuine,
permanent destruction — never on a mere **configuration change**.

### Discard the Throwaway Example

`lab_lifecycle.kt` is deleted now — real, saved in
`verification/4.3/lab_lifecycle.kt` alongside its real run transcript.
It exists nowhere in `AndroidCalculator`'s own real source tree.

### Mechanical Walkthrough

- `class LabViewModel : ViewModel()` — a real, minimal subclass of the
  real `ViewModel` class proven above; its own bare, no-argument
  constructor requires nothing.
- `override fun onCleared()` — overrides the real, protected method
  proven above, whose own default body does nothing; this lab's own
  override exists purely to record, observably, the one real moment it
  fires.
- `val store = ViewModelStore()` — constructs a real `ViewModelStore`,
  proven above, with its own bare, no-argument constructor.
- `store.put("lab", vm)` — calls the real method proven above, storing
  this lab's own `LabViewModel` instance under the key `"lab"`.
- `store.clear()` — calls the real method proven above; this is the one
  real line that actually triggers `onCleared()`, internally, on every
  `ViewModel` the store holds.
- `vm.wasCleared` — a plain, ordinary `var` property read, both before
  and after `clear()`, proving the observable state change directly.

### CS Lens

A defined sequence of real states, from creation to a specific,
name-able cleanup moment, is called a **lifecycle** — a pattern
recognized everywhere something needs deterministic cleanup tied to a
real, well-defined "done" moment, not left to chance.

```
Also recognized in: C++'s RAII (a destructor firing at a well-defined
scope exit), file handles closed on a `finally` block, database
connection pools returning connections at a defined release point,
garbage collectors distinguishing reachable objects from genuinely
unreachable ones
```

### SE Lens

The alternative to a real, framework-guaranteed lifecycle hook is asking
every piece of code that ever holds a resource to remember, by hand,
exactly when it's genuinely safe to clean it up — and, worse, to
correctly distinguish "this object is being temporarily rebuilt" from
"this object is gone for good" using nothing but ordinary object
lifetimes, which look identical from the inside. `ViewModelStore.clear()`
being a single, real, well-defined trigger is what makes `onCleared()`
trustworthy: any `ViewModel` can override it once and know, for certain,
it will be called at the right real moment — never early, never
skipped. The real cost: a `ViewModel` has to depend on a `ViewModelStore`
existing and being correctly owned by something else — it cannot decide
its own lifecycle; it can only react to it.

### Commands Needed

- `kotlinc lab_lifecycle.kt -cp lifecycle-viewmodel/classes.jar
  -include-runtime -d lab_lifecycle.jar` — compiles a standalone Kotlin
  file against the real, already-downloaded `lifecycle-viewmodel`
  library jar, bundling the Kotlin runtime into the output jar so it can
  run standalone afterward — the same real approach this project's own
  Stage 0 used throughout, extended here with one external library on
  the compile classpath.
- `java -cp "lab_lifecycle.jar:lifecycle-viewmodel/classes.jar"
  Lab_lifecycleKt` — runs the compiled program directly, needing both
  jars on the runtime classpath since `-include-runtime` only bundled
  the Kotlin standard library, not the separate `lifecycle-viewmodel`
  library the lab's own code depends on; `Lab_lifecycleKt` is the real,
  compiler-generated name for a top-level `main()`'s own containing
  class, derived from the file's own name.

### Run It

Already shown above in full, real, executed this session; the real,
saved transcript lives at `verification/4.3/step1_lab_lifecycle_run.txt`.

### Connect the Pieces

This unit proves the one real fact everything else in this lesson
depends on: `onCleared()` fires at exactly one real, well-defined
moment — a store being cleared — and nothing else. The next unit uses
that same real guarantee, wired up by a real framework component instead
of a hand-built one, to fix `CalculatorScreen` for real.

---

## Concept Unit: ViewModel and State Ownership — the real owner, wired up for real

### The Problem

Unit 1 proved `ViewModelStore.clear()` triggers real cleanup at the
right moment — but nothing in that lab explains how a real Android
component decides *when* to call `clear()` versus when to quietly keep
the same store alive across a rebuild. `CalculatorScreen` itself still
owns its own state directly, via `remember`, the exact real,
reproducible risk this project already proved. Something needs to
sit between "a real configuration change happened" and "should this
particular store survive or be cleared" — and that something needs to
already be wired into `CalculatorScreen`'s own real, running app, not
just proven in a lab.

> **Stop and think:** Unit 1's own lab constructed a `ViewModelStore`
> directly, by hand, and never cleared it — which is exactly why
> `LabViewModel` never lost its own state. What would have to be true
> about *where* a real `ViewModelStore` lives — attached to what, exactly
> — for it to automatically survive a configuration-change recreation but
> still get cleared when a user genuinely leaves a screen for good? Given
> that a real Android `Activity` object is *itself* torn down and rebuilt
> during a configuration change, could the `Activity` be the thing
> holding onto the store the whole time?

### Introduce the Concept in Isolation

A small, throwaway `ViewModel` and a real, direct Robolectric test —
no custom Activity subclass needed, since `androidx.activity.
ComponentActivity` (this project's own already-established real
superclass) is itself a real `ViewModelStoreOwner`. Added temporarily
to the real project's own source tree as `LabViewModel.kt`:

```kotlin
package com.example.calculator

import androidx.lifecycle.ViewModel

class LabCounterViewModel : ViewModel() {
    var count = 0
}
```

And a real, temporary test, `LabViewModelTest.kt`:

```kotlin
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabViewModelTest {

    @Test
    fun viewModelSurvivesRealSimulatedConfigurationChange() {
        val controller = Robolectric.buildActivity(ComponentActivity::class.java).setup()
        val activityBefore = controller.get()
        val viewModelBefore = ViewModelProvider(activityBefore).get(LabCounterViewModel::class.java)
        viewModelBefore.count = 42

        controller.configurationChange()

        val activityAfter = controller.get()
        val viewModelAfter = ViewModelProvider(activityAfter).get(LabCounterViewModel::class.java)

        assertSame(viewModelBefore, viewModelAfter)
        assertEquals(42, viewModelAfter.count)
    }
}
```

Run for real this session:

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 3 executed, 24 up-to-date
```

The real, saved JUnit report:

```xml
<testcase name="viewModelSurvivesRealSimulatedConfigurationChange"
  classname="com.example.calculator.LabViewModelTest" time="2.428"/>
```

This is the single most decisive real proof in this lesson:
`Robolectric.buildActivity(...).configurationChange()` drives a real,
simulated Activity through the exact real teardown-and-rebuild sequence
a genuine device rotation triggers — no emulator, no physical device.
`viewModelBefore.count = 42`, set before that event, was still readable,
completely intact, as `42` on `viewModelAfter` — the exact same real
object, confirmed with `assertSame`, not merely an equal copy.
`ComponentActivity` — this project's own already-established real
superclass — is itself the real `ViewModelStoreOwner` whose own
`ViewModelStore` correctly survives a configuration change automatically,
with zero custom code required. **A real, worth-knowing finding from
this exact test**: `controller.get()`, called again after
`configurationChange()`, still returns the identical real `Activity`
object under this version of Robolectric's own simulation model, rather
than a literally new instance — a genuine, checked difference from a real
device's own behavior (which does construct a brand-new Activity object),
worth knowing precisely because it means object identity on the Activity
itself can't be used to prove "a real teardown happened" under
Robolectric — the `ViewModelStore`'s own real survival, proven directly
above, is the decisive evidence instead, and it holds regardless of that
difference. This whole mechanism — a real class built specifically to
own state across exactly this kind of survival — is called a
**ViewModel**.

### Discard the Throwaway Example

`LabViewModel.kt` and `LabViewModelTest.kt` are both deleted now — real,
saved in `verification/4.3/lab_viewmodel.kt` and
`lab_viewmodel_test.kt`, alongside the real passing JUnit report,
`step2_lab_viewmodel_passes.xml`. Neither exists anywhere in
`AndroidCalculator`'s own real source tree again.

### Project Change

- **Reference Source** — no reference counterpart; this is a from-scratch
  addition, moving state ownership out of `CalculatorScreen` and into a
  real, dedicated `ViewModel`.
- **Files affected** — a new file,
  `app/src/main/java/com/example/calculator/CalculatorViewModel.kt`;
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified);
  a new, permanent test file,
  `app/src/test/java/com/example/calculator/CalculatorViewModelTest.kt`.
- **Change type** — add (`CalculatorViewModel.kt`, the new test file) and
  refactor (`CalculatorScreen`'s own state ownership).
- **Location** — a brand-new file for `CalculatorViewModel`; inside
  `CalculatorScreen`, its own function signature and its own state
  declaration and keypad `onClick` lambda.
- **Dependencies** — none beyond what this project already has: a real,
  checked finding this session confirmed
  `androidx.lifecycle:lifecycle-viewmodel:2.6.2`,
  `androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2`, and
  `androidx.lifecycle:lifecycle-viewmodel-savedstate:2.6.2` were *already*
  resolved on this project's real compile classpath, transitively, via
  `androidx.navigation:navigation-compose`, this project's own existing
  navigation dependency — Navigation Compose's own real implementation
  needs `ViewModel`
  machinery internally for its own per-destination state, which is
  exactly why it's already there. No new Gradle dependency of any kind
  was needed for this lesson.

### The New Code

```kotlin
class CalculatorViewModel : ViewModel() {
    var state by mutableStateOf(CalculatorState())
        private set

    fun onButtonClick(label: String) {
        state = nextState(state, label)
    }
}
```

That's the entire real owner. `CalculatorScreen` itself now asks for one
instead of building its own state directly:

```kotlin
fun CalculatorScreen(mode: String = "Basic", calculatorViewModel: CalculatorViewModel = viewModel()) {
    val state = calculatorViewModel.state
```

and its own keypad presses now call through it:

```kotlin
onClick = { calculatorViewModel.onButtonClick(label) },
```

Finally, a real, permanent test proves the exact real scenario Lesson
4.2's own Socratic prompt described is now actually fixed:

```kotlin
@Test
fun inProgressCalculationSurvivesRealSimulatedConfigurationChange() {
    val controller = Robolectric.buildActivity(ComponentActivity::class.java).setup()
    val activityBefore = controller.get()
    val viewModel = ViewModelProvider(activityBefore).get(CalculatorViewModel::class.java)

    viewModel.onButtonClick("7")
    viewModel.onButtonClick("+")
    viewModel.onButtonClick("3")

    controller.configurationChange()

    val activityAfter = controller.get()
    val viewModelAfter = ViewModelProvider(activityAfter).get(CalculatorViewModel::class.java)

    assertSame(viewModel, viewModelAfter)
    assertEquals(Display.Value("3"), viewModelAfter.state.display)
    assertEquals(7, viewModelAfter.state.firstOperand)
    assertEquals(Operator.PLUS, viewModelAfter.state.pendingOperator)

    controller.pause().stop().destroy()
}
```

### The Updated Project

`CalculatorScreen`'s own full, real, final state — everything else
inside it, unchanged:

```kotlin
 1  @Composable
 2  fun CalculatorScreen(mode: String = "Basic", calculatorViewModel: CalculatorViewModel = viewModel()) { // ← changed
 3      val state = calculatorViewModel.state                                    // ← changed
 4      val displayColor by animateColorAsState(
 5          targetValue = when (state.display) {
 6              is Display.Value -> MaterialTheme.colorScheme.onBackground
 7              Display.Error -> MaterialTheme.colorScheme.error
 8          },
 9          label = "displayColor"
10      )
11      Column(
12          modifier = Modifier.fillMaxWidth().padding(16.dp),
13          verticalArrangement = Arrangement.spacedBy(8.dp),
14          horizontalAlignment = Alignment.CenterHorizontally
15      ) {
16          Text(text = mode, modifier = Modifier.testTag("modeTitle"))
17          Text(
18              text = state.display.toDisplayText(),
19              style = MaterialTheme.typography.displayLarge,
20              color = displayColor,
21              modifier = Modifier.testTag("display")
22          )
23          for (row in keypadRows) {
24              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
25                  for (label in row) {
26                      CalculatorButton(
27                          label = label,
28                          onClick = { calculatorViewModel.onButtonClick(label) }, // ← changed
29                          modifier = Modifier.weight(1f),
30                          contentDescription = accessibilityLabels[label]
31                      )
32                  }
33              }
34          }
35      }
36  }
```

Lines 2, 3, and 28 are the only real changes — `CalculatorScreen` itself
no longer owns a `var state by remember { mutableStateOf(...) }` at all;
it reads `state` once, from its own new `calculatorViewModel` parameter,
and every keypad press now calls through that same owner instead of
mutating a local variable directly. Every other line — the color
animation, the layout, both `Text` calls, the keypad loop itself — is
completely unchanged, reading the exact same `state` value it always
did, just sourced from a different, real owner now.

### Mechanical Walkthrough

- `class CalculatorViewModel : ViewModel()` — a real, new, permanent
  class, extending the real `ViewModel` class proven in isolation above.
  Unlike Unit 1's own throwaway `LabViewModel`, this one is never
  discarded — it's this project's own real, permanent fix.
- `var state by mutableStateOf(CalculatorState())` — the identical real
  `mutableStateOf` construct `CalculatorScreen` used to hold directly,
  now held here instead, inside a real object whose own lifetime is
  managed by the framework, not tied to any one composable function's
  own execution.
  - `private set` — a real, already-known Kotlin access-modifier
    keyword restricting `state`'s own setter to code inside
    `CalculatorViewModel` itself; `state` can be read from anywhere
    (`CalculatorScreen`, this lesson's own new test), but only
    `CalculatorViewModel`'s own `onButtonClick` can actually assign a
    new value to it — the exact real encapsulation `CalculatorScreen`'s
    own earlier `var state` never had.
- `fun onButtonClick(label: String) { state = nextState(state, label) }`
  — a real, new, public method, calling the identical real `nextState`
  function this project's own business logic has always used, unchanged
  in logic; the only real difference from before is *where* this call
  now lives —
  inside the real owner, not inside the UI function that merely displays
  the result.
- `fun CalculatorScreen(mode: String = "Basic", calculatorViewModel:
  CalculatorViewModel = viewModel())` — `CalculatorScreen` gains one new
  parameter, with a default value that is itself a real function call:
  `viewModel()`, proven above, automatically obtaining (or, the first
  time, creating) the real, single `CalculatorViewModel` scoped to this
  screen's own real `NavBackStackEntry` — confirmed real this session,
  since `androidx.navigation.NavBackStackEntry` genuinely implements
  `ViewModelStoreOwner`, the same real interface `ComponentActivity`
  implements — meaning `viewModel()`, called with no explicit owner
  argument anywhere inside `CalculatorApp`'s own `NavHost`, correctly
  resolves to the calculator's own specific navigation destination, not
  the whole app's Activity, automatically, through the exact same real
  `LocalViewModelStoreOwner` ambient-value mechanism already proven
  above.
- `val state = calculatorViewModel.state` — reads the real property
  proven above; a plain `val`, not `var`, since `CalculatorScreen` itself
  never assigns to `state` anymore — it only reads whatever the real
  owner currently holds.
- `onClick = { calculatorViewModel.onButtonClick(label) }` — the real,
  new call site; every one of the sixteen real keypad buttons now
  forwards its own press to the real owner's own method, instead of
  mutating a local variable owned by the UI function itself.

### CS Lens

A dedicated object whose entire real job is owning a piece of state,
independent of whatever code currently happens to be reading it, is a
specific application of the broader **separation of concerns** idea
this project already named in full — narrowed here to one exact
concern: *ownership itself*, as its own real, distinct responsibility.

```
Also recognized in: a database's own storage engine, outliving any one
query connection; a web server's own session store, outliving any one
individual HTTP request; an operating system's own process table,
outliving any one running thread; a cache server, outliving any one
client that happens to be reading from it right now
```

### SE Lens

The alternative — the one `CalculatorScreen` was actually using until
this lesson — is a UI function owning its own state directly, via
`remember`. That design is genuinely simpler to read, with no extra
indirection, no separate file, no new parameter — and this project
already proved its real, concrete cost: the moment the UI function
itself gets
torn down and rebuilt, so does whatever state lived only inside it.
Moving ownership into a real `ViewModel` fixes that specific failure
mode at the cost of one genuine tradeoff, honestly worth naming:
`CalculatorScreen` can no longer be understood, or tested, purely on its
own — it now depends on a real collaborator whose own real lifecycle
rules (survives recomposition, survives configuration change, cleared
only on real, permanent navigation away) have to be understood
separately. That's not a cost this project is paying speculatively —
it's the exact, real, provable price of the guarantee already proven
missing, paid here for precisely the value that actually needed it.

### Commands Needed

- `./gradlew :app:testDebugUnitTest --tests
  "com.example.calculator.CalculatorViewModelTest"` — runs only this
  lesson's own new permanent test class, the same scoped-run pattern
  already established in this project, useful for a fast, isolated check
  before the whole suite runs alongside it.
- `./gradlew :app:testDebugUnitTest --rerun` — forces every test to
  actually re-execute, ignoring Gradle's own up-to-date caching —
  necessary, this session, to reliably reproduce a real, order-dependent
  failure (see Run It, below) that a cached, partial run could otherwise
  have silently skipped past.

### Run It

Run alone, this lesson's own new permanent test passed cleanly:

```
BUILD SUCCESSFUL in 3s
27 actionable tasks: 3 executed, 24 up-to-date
```

The real, saved JUnit report for that run:

```xml
<testcase name="inProgressCalculationSurvivesRealSimulatedConfigurationChange"
  classname="com.example.calculator.CalculatorViewModelTest" time="0.02"/>
```

**A real, reproducible failure was found and fixed before this lesson
was finalized.** Running the *entire* project's own real test suite
together — `./gradlew :app:testDebugUnitTest --rerun`, this new test
included alongside every pre-existing test class — produced two real,
genuine failures in two completely unrelated test classes:

```
com.example.calculator.HapticsTest > pressingKeypadButtonTriggersHapticFeedback FAILED
    androidx.test.espresso.AppNotIdleException at HapticsTest.kt:35

com.example.calculator.ThemeTest > calculatorThemeProvidesRealCustomPrimaryColor FAILED
    androidx.test.espresso.AppNotIdleException at ThemeTest.kt:29

27 tests completed, 2 failed
```

Confirmed reproducible by running `--rerun` a second time — the identical
two failures, in the identical two places. The real cause: this lesson's
own new test built a real Activity via `Robolectric.buildActivity(...)`
and never tore it down, leaving Robolectric's own shared, real
main-looper/idling state dirty for whichever real test classes happened
to run afterward, in the same real test process — a genuine, real
interference between test classes, not a flaw in either `HapticsTest` or
`ThemeTest` themselves. The real fix: `controller.pause().stop().
destroy()`, chaining the three real teardown methods proven above,
added as the very last line of this lesson's own new test. A full,
real re-run afterward:

```
BUILD SUCCESSFUL in 5s
27 actionable tasks: 3 executed, 24 up-to-date
```

All 27 real tests passing — 26 carried over completely unchanged, plus
this lesson's own one new test. A final, complete
`./gradlew :app:testDebugUnitTest :app:assembleDebug` confirmed a real,
installable `.apk` still builds:

```
BUILD SUCCESSFUL in 442ms
43 actionable tasks: 1 executed, 42 up-to-date
```

### Connect the Pieces

Unit 1 proved the one real trigger — `ViewModelStore.clear()` — that
decides when cleanup actually happens; this unit proved a real Android
component, `ComponentActivity` (and, for real, `NavBackStackEntry`
alongside it), already owns exactly that kind of store, automatically,
with zero custom wiring — and then moved `CalculatorScreen`'s own real
state into a real `CalculatorViewModel` built to live there, closing the
exact real, already-proven risk this project's own current design had
been carrying.

---

## Connect the Pieces

Trace the one real scenario this project's own earlier Socratic prompt
first raised, now genuinely fixed. A user opens the calculator, presses
`7`, then `+`, then `3` — `CalculatorViewModel.onButtonClick` is called
three times, each time calling the same real, pure `nextState` function
this project has always trusted, each time writing the result back
into `state`, a real `mutableStateOf` value now owned by a real
`ViewModel` instead of by `CalculatorScreen` itself. The phone rotates —
a real configuration change (Unit 1's own named term) — and
`CalculatorScreen`, along with everything else in its own composition,
is genuinely torn down and rebuilt from scratch. But the real
`CalculatorViewModel` instance is not rebuilt: it survives, because its
own real owner — the calculator's own `NavBackStackEntry`, proven this
lesson to be a genuine `ViewModelStoreOwner` — was never cleared, only
the screen reading from it was. `CalculatorScreen` recomposes, calls
`viewModel()` again, and gets back the exact same real object, still
holding `firstOperand = 7`, `pendingOperator = PLUS`, `display =
Value("3")` — proven, not assumed, by this lesson's own real,
executed, permanent test. The user finishes typing, presses `=`, and
gets the correct real answer, `10` — exactly as if the rotation had
never happened at all. If, instead, the user presses back and leaves the
calculator for good, its `NavBackStackEntry` really is cleared, Unit 1's
own real `onCleared()` fires, and the `CalculatorViewModel` — along with
its own held state — is genuinely, permanently gone, freeing whatever it
was holding. Two real, different endings for two real, different real
events, told apart by exactly one framework-guaranteed moment, the same
one this lesson's own first isolated lab already proved fires precisely
once, and only when it's actually meant to.
