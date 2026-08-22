# Lesson 4.1: Screens That Remember How You Got There

- **What you will build** — a real second screen, `HomeScreen`, that lets
  the user choose a calculator mode before ever seeing the keypad, wired
  to the existing `CalculatorScreen` through Jetpack's real Navigation
  Compose library: a named `NavHost` holding both screens, a real
  `navigate()` call that moves between them, a real back stack that
  returns to Home when the user backs out of the calculator, and a real
  navigation argument carrying which mode was tapped all the way through
  to the screen that receives it. The transferable problem: every app
  bigger than one screen needs a principled way to answer three
  questions — what screens exist, how do you ask to go from one to
  another, and how does "go back" ever undo that — without every screen
  having to hold a direct reference to every other screen it might ever
  need to show.
- **What you need to know first** — Lesson 1.2's `@Composable` functions,
  `ComponentActivity`, and `setContent`; Lesson 1.4's Robolectric-based
  Compose UI testing (`composeTestRule`, `createComposeRule`,
  `onNodeWithTag`, `onNodeWithText`, `performClick`,
  `RobolectricTestRunner`, `@Config(sdk = [34])`); Lesson 3.2's
  `CalculatorButton`; Lesson 3.3's `CalculatorState`, `Display`, and
  `nextState`, which `CalculatorScreen` still owns unchanged; Lesson 0.5's
  nullable types and the `?:`/`?.` operators, needed here because more
  than one real Navigation type is honestly nullable.
- **Terms used in this lesson**
  - **Route** — a plain `String` that names one destination inside a
    navigation graph, the key a caller uses to ask for a screen by name
    instead of holding a direct reference to that screen's own
    `@Composable` function. Why it exists: without a name, "go to the
    calculator" would require the code doing the asking to import and
    directly call the calculator screen's own function — coupling every
    caller to every callee's implementation. A route decouples the two:
    the caller only ever has to know a string.
  - **Back stack** — the ordered record of every destination visited so
    far, most recently visited on top, obeying the same discipline as a
    computer science **Stack**: the only two operations are "add one to
    the top" (push) and "remove the one on top" (pop) — never reach into
    the middle. Why it exists: this is what makes "go back" a single,
    universal operation instead of a screen-specific "undo" every screen
    would otherwise have to hand-write for itself — going back always
    means exactly one thing, pop the top and show whatever is now
    exposed underneath.
  - **Navigation argument** — a named, typed value carried from the
    screen that navigates to the screen that receives it, threaded
    through the route string itself rather than passed as a normal
    Kotlin function parameter. Why it exists: a route is just a name
    registered once, ahead of time — without a way to carry a value
    through it, one route could only ever show one fixed thing; a
    navigation argument is what lets a single registered route serve
    many different real payloads.
  - **`@RunWith(RobolectricTestRunner::class)`** — a JUnit annotation
    telling JUnit which real test runner to use for this class, instead
    of its own plain default. Why it exists: without it, JUnit would try
    to run these tests as ordinary JVM tests with no simulated Android
    framework underneath them at all, and every real Android/Compose
    call this project's tests make would fail immediately. Reappearing
    here, unchanged, on every real test class this lesson adds.
  - **`@Config(sdk = [34])`** — a Robolectric annotation naming which
    real, simulated Android SDK level a test class runs against. Why it
    exists: Robolectric can simulate multiple real Android versions;
    without stating one explicitly, behavior could vary by whatever
    Robolectric's own default happens to be. Reappearing here, unchanged,
    matching this project's own real `compileSdk`/`targetSdk`, `34`.
  - **`@Test`** — a JUnit annotation marking one method as a real,
    independently runnable test case. Why it exists: without it, JUnit
    has no way to tell an ordinary helper method apart from an actual
    test to execute. Reappearing here, unchanged, on every new test
    method this lesson adds.
  - **`@get:Rule`** — a JUnit annotation marking a property as a `Rule`,
    whose own setup/teardown logic JUnit runs automatically around every
    test in the class. Why it exists: without it, `composeTestRule`
    would be an inert object JUnit never actually wires into each test's
    own lifecycle. Reappearing here, unchanged, on every new test class
    this lesson adds.
- **Objects and methods used**

  - **`rememberNavController()`**
    - *What it is:* a `@Composable` function, called once per screen
      hierarchy, that creates and remembers the one controller object
      responsible for tracking which destination is currently showing
      and the full history of how the user got there.
    - *Implementation:* `@Composable fun rememberNavController(vararg
      navigators: Navigator<out NavDestination>): NavHostController` —
      real signature confirmed against the actual installed
      `navigation-compose-2.7.7.aar`'s `NavHostControllerKt` class this
      session, via `javap`. Its real, published body (fetched from
      AndroidX's own public source this session) reads: `val context =
      LocalContext.current; return rememberSaveable(saver =
      NavControllerSaver(context)) { createNavController(context) }`.
    - *Its use:* this lesson's code calls it with zero arguments as
      `CalculatorApp`'s own default parameter value, so a real
      `NavHostController` exists the moment `CalculatorApp` is composed
      with nothing extra required from the caller.
    - *Type:* a top-level `@Composable` function.
    - *Responsibility:* build exactly one `NavHostController`, pre-register
      the two navigators every Compose navigation graph needs
      (`ComposeNavigator` for ordinary screens, `DialogNavigator` for
      dialog destinations — confirmed by this function's own real KDoc,
      fetched this session, not assumed), and keep that same controller
      alive across recomposition and configuration changes.
    - *Depends on:* `LocalContext.current` (the ambient Android
      `Context` Compose already threads through every composable), and,
      internally, `rememberSaveable`'s own saver mechanism.
    - *Connects to:* called by `CalculatorApp`; the `NavHostController`
      it returns is handed straight into `NavHost` and captured by every
      `onClick`/`onModeSelected` lambda that later calls `.navigate(...)`
      on it.
    - *Shape:* a public API entry point — the normal, recommended way
      production code obtains a `NavHostController`, as opposed to
      constructing one directly (which only test code does, in Unit 2).

  - **`NavHostController`**
    - *What it is:* the real class representing "the object that knows
      which screen is showing and how the user got there" — a concrete
      subclass of the more general `NavController`.
    - *Implementation:* `public class NavHostController extends
      NavController` (confirmed via `javap` against the real installed
      `navigation-runtime-2.7.7.aar` this session); its own constructor
      takes one `Context` and it adds a handful of host-specific setup
      methods (`setLifecycleOwner`, `setOnBackPressedDispatcher`) on top
      of everything `NavController` already provides.
    - *Its use:* this lesson's code never constructs one directly in
      production — `rememberNavController()` does that — but names it
      explicitly as `CalculatorApp`'s own parameter type, so the
      function's signature states plainly what kind of object it needs.
    - *Type:* a public class.
    - *Responsibility:* everything `NavController` is already
      responsible for (see below), plus the extra wiring a *host*
      specifically needs — attaching itself to the current Android
      lifecycle and the system back button.
    - *Depends on:* an Android `Context`, supplied by whatever creates
      it.
    - *Connects to:* created by `rememberNavController()`; passed into
      `NavHost`; read and called (`.navigate`, `.currentDestination`,
      `.popBackStack`) by this lesson's own screens and tests.
    - *Shape:* a public class inside the `androidx.navigation` package —
      the reference type this project's own code holds onto.

  - **`NavHost`**
    - *What it is:* a `@Composable` function that occupies one spot in
      the UI and shows whichever single destination is currently active,
      swapping its content whenever the controller's current destination
      changes.
    - *Implementation:* `@Composable public fun NavHost(navController:
      NavHostController, startDestination: String, modifier: Modifier =
      Modifier, route: String? = null, builder: NavGraphBuilder.() ->
      Unit)` — the real signature, fetched this session from AndroidX's
      own public source for this exact `2.7.7` release. Its own real
      body (also fetched this session) does nothing more mysterious than
      `navController.createGraph(startDestination, route, builder)` and
      hands the resulting graph to a second `NavHost` overload — the
      whole mechanism is just building a graph object and remembering
      it, not hidden framework magic.
    - *Its use:* this lesson's code calls it once, in `CalculatorApp`,
      as the single place that lists every real screen this app has and
      which one starts active.
    - *Type:* a top-level `@Composable` function.
    - *Responsibility:* own one region of the UI tree and keep it in
      sync with the controller's current destination — nothing about
      *how* a destination is reached, only *what's currently shown*.
    - *Depends on:* a `NavHostController` to watch, a `startDestination`
      route naming which registered screen shows first, and a builder
      lambda that registers the actual screens via `composable(...)`.
    - *Connects to:* reads state from the `NavHostController` it's
      given; its own `builder` lambda calls `composable(...)` once per
      registered screen; the screens it shows are ordinary
      `@Composable` functions this project already owns (`HomeScreen`,
      `CalculatorScreen`).
    - *Shape:* the single composition root for this app's entire
      multi-screen structure — everything else in this lesson exists to
      be plugged into it.

  - **`composable()`**
    - *What it is:* an extension function on `NavGraphBuilder` that
      registers one destination — a route name paired with the
      `@Composable` content to show for it — inside a `NavHost`'s own
      builder block.
    - *Implementation:* `public fun NavGraphBuilder.composable(route:
      String, arguments: List<NamedNavArgument> = emptyList(),
      deepLinks: List<NavDeepLink> = emptyList(), content: @Composable
      (NavBackStackEntry) -> Unit)` — the real signature, fetched this
      session from AndroidX's own public source for `2.7.7`, and
      independently confirmed via `javap` against the real installed
      artifact (whose erased bytecode signature shows the same four real
      parameters).
    - *Its use:* this lesson's code calls it twice inside `NavHost`'s
      builder block — once per real screen this app has.
    - *Type:* a Kotlin extension function (an ordinary function that
      reads as if it were a member of `NavGraphBuilder`, without
      `NavGraphBuilder`'s own source needing to define it).
    - *Responsibility:* add exactly one route → content mapping to the
      navigation graph under construction; nothing about navigating to
      it, only registering that it exists.
    - *Depends on:* a `NavGraphBuilder` receiver (supplied automatically
      by `NavHost`'s own builder block), a route string, and a
      `@Composable` content lambda.
    - *Connects to:* called from inside `NavHost`'s builder; the
      `content` lambda it registers is what actually runs
      `HomeScreen(...)` or `CalculatorScreen(...)`.
    - *Shape:* the registration API — the one place a route's name and
      its real screen are tied together.

  - **`NavController.navigate(route: String)`**
    - *What it is:* the real method that changes which destination is
      currently active, by route name.
    - *Implementation:* `public final fun navigate(route: String): Unit`
      — one of several real overloads confirmed via `javap` against the
      installed `navigation-runtime-2.7.7.aar`'s `NavController` class
      this session (others accept a `NavOptions` or a route-building
      lambda; this lesson's code uses only the simplest one).
    - *Its use:* `HomeScreen`'s own button calls it, through
      `CalculatorApp`'s `onModeSelected` lambda, the moment the user taps
      "Basic Calculator."
    - *Type:* a public instance method on `NavController`.
    - *Responsibility:* look up the destination matching the given route,
      push a new entry for it onto the back stack, and update
      `currentDestination` — the single real action that makes anything
      on screen change.
    - *Depends on:* an already-set graph (built by `NavHost`) containing
      a destination whose route matches the string passed in; calling it
      with an unregistered route throws a real
      `IllegalArgumentException` at runtime.
    - *Connects to:* called by `CalculatorApp`'s `onModeSelected` lambda;
      what it pushes becomes visible through `NavHost`'s own rendering
      and readable through `currentDestination`/`currentBackStackEntry`.
    - *Shape:* the one real trigger for every screen transition in this
      app — the imperative counterpart to `composable()`'s own
      declarative registration.

  - **`assertIsDisplayed()`**
    - *What it is:* a real assertion function confirming a found node is
      currently part of the visible semantics tree.
    - *Implementation:* `public fun SemanticsNodeInteraction
      .assertIsDisplayed(): SemanticsNodeInteraction` — confirmed via
      `javap` against the real installed `ui-test-android-1.6.8.aar`'s
      `AssertionsKt` class this session; this project's resolved Compose
      UI version (`1.6.8`) does not have a separate `assertExists()`
      function — a real, checked finding, not assumed from familiarity
      with a newer API surface.
    - *Its use:* this lesson's tests use it to confirm Home's own
      content is really on screen, both at the start and again after
      backing out of the calculator.
    - *Type:* an extension function on `SemanticsNodeInteraction`.
    - *Responsibility:* throw a real, descriptive `AssertionError` if the
      node it's called on isn't currently displayed; otherwise return the
      same interaction so calls can chain.
    - *Depends on:* a `SemanticsNodeInteraction` already found by a
      finder like `onNodeWithText(...)`.
    - *Connects to:* chained directly onto `onNodeWithText(...)`'s own
      return value inside this lesson's `NavigationTest.kt`.
    - *Shape:* a Compose-testing assertion — the same layer of the stack
      `assertTextEquals` already occupies, just checking presence
      instead of content.

  - **`TestNavHostController`**
    - *What it is:* a real, test-only subclass of `NavHostController`
      that adds a handful of extra accessors (`backStack`,
      `setCurrentDestination`) useful only for verifying navigation
      state directly, without needing a running Activity.
    - *Implementation:* `public final class TestNavHostController extends
      NavHostController { public TestNavHostController(Context context);
      public final List<NavBackStackEntry> getBackStack(); ... }` —
      confirmed via `javap` against the real installed
      `navigation-testing-2.7.7.aar` this session.
    - *Its use:* this lesson's own back-stack test constructs one
      directly and hands it to `CalculatorApp` in place of the default
      `rememberNavController()`, so the test can call `popBackStack()`
      itself instead of needing a real device back button.
    - *Type:* a public class, from the separate `navigation-testing`
      artifact (a new Gradle dependency this lesson adds, real-resolved
      and confirmed this session).
    - *Responsibility:* behave exactly like a real `NavHostController`
      for anything a screen does with it, while exposing enough extra
      state (the real `backStack` list) that a test can make direct
      assertions about it.
    - *Depends on:* an Android `Context`, supplied directly here via
      `ApplicationProvider.getApplicationContext()` rather than through
      Compose's ambient `LocalContext`.
    - *Connects to:* constructed by this lesson's test; passed into
      `CalculatorApp(navController = ...)`; queried afterward via
      `.currentDestination` and driven via `.popBackStack()`.
    - *Shape:* a test double for a real framework class — not a hand
      written fake, a genuine AndroidX-published subclass built for
      exactly this purpose.

  - **`ApplicationProvider.getApplicationContext()`**
    - *What it is:* the real, standard way test code (running under
      Robolectric, with no actual Activity ever started) obtains a real
      Android `Context`.
    - *Implementation:* `public static <T extends Context> T
      getApplicationContext()` — confirmed via `javap` against the real
      installed `androidx.test:core-1.5.0.aar` this session; a `static`
      method, so there is no `ApplicationProvider` object to construct —
      it produces a `Context`, it isn't one. **Real, checked finding**:
      `androidx.test:core:1.5.0` was already resolved on this project's
      test classpath before this lesson, pulled in transitively through
      Robolectric and `ui-test-junit4` — no new Gradle dependency was
      needed to call it.
    - *Its use:* this lesson's test passes its return value straight into
      `TestNavHostController`'s own constructor.
    - *Type:* a `static` method on the `ApplicationProvider` class — no
      instance, no state of its own.
    - *Responsibility:* return the single, real (Robolectric-simulated)
      `Context` for the whole test process — the same kind of object
      `ComponentActivity` would otherwise hand a screen automatically.
    - *Depends on:* a Robolectric test environment already having set
      one up, which `@RunWith(RobolectricTestRunner::class)` guarantees.
    - *Connects to:* called directly inside this lesson's test; its
      return value flows into `TestNavHostController`'s constructor and
      nowhere else.
    - *Shape:* a test-infrastructure entry point — the boundary between
      "a real Android object" and "no real device is running."

  - **`NavigatorProvider.addNavigator(Navigator<out NavDestination>)`**
    - *What it is:* the real method that tells a `NavController` which
      navigator implementation handles a given kind of destination —
      the same registration `rememberNavController()`'s own body
      performs for you automatically in production, done by hand here
      because `TestNavHostController` is constructed directly instead.
    - *Implementation:* `public final fun addNavigator(navigator:
      Navigator<out NavDestination>): Navigator<out NavDestination>?` —
      confirmed via `javap` against the real installed
      `navigation-common-2.7.7.aar`'s `NavigatorProvider` class this
      session.
    - *Its use:* this lesson's back-stack test calls it once, right
      after constructing its own `TestNavHostController`, so that
      controller knows how to actually build `composable(...)`
      destinations.
    - *Type:* a public instance method on `NavigatorProvider`.
    - *Responsibility:* store one navigator, keyed by its own declared
      name, so the controller can later look up "how do I show a
      destination registered through `composable(...)`" by name.
    - *Depends on:* a real `Navigator` instance — here, a freshly
      constructed `ComposeNavigator()`.
    - *Connects to:* called on `navController.navigatorProvider`
      (itself a property of every `NavController`); without this call,
      `navController.graph = navController.createGraph(...) {
      composable(...) }` would fail for real, since nothing would know
      how to build a Compose destination.
    - *Shape:* low-level navigation plumbing — something
      `rememberNavController()` normally hides entirely, made visible
      here only because this test builds its controller by hand.

  - **`ComposeNavigator`**
    - *What it is:* the real navigator implementation that knows how to
      build and show an ordinary `@Composable` destination registered
      through `composable(...)`.
    - *Implementation:* `public final class ComposeNavigator extends
      Navigator<ComposeNavigator.Destination>` — confirmed via `javap`
      against the real installed `navigation-compose-2.7.7.aar` this
      session; it has a real public no-argument constructor.
    - *Its use:* this lesson's test constructs one and registers it, by
      hand, on its own `TestNavHostController`.
    - *Type:* a public class, a concrete `Navigator` implementation.
    - *Responsibility:* translate "navigate to this route" into actual
      Compose content being shown — the piece of machinery
      `composable(...)`'s own destinations ultimately run through.
    - *Depends on:* nothing at construction time — its own no-arg
      constructor takes no parameters.
    - *Connects to:* registered onto a `NavigatorProvider`; looked up
      internally by `NavController` whenever a `composable(...)`-style
      destination needs to be navigated to.
    - *Shape:* an internal implementation detail of Navigation Compose,
      normally invisible — surfaced here only because test code building
      its own `TestNavHostController` has to supply it explicitly.

  - **`NavController.popBackStack()`**
    - *What it is:* the real method that removes the current destination
      from the back stack and reveals whatever is now on top — the exact
      operation a device's system back button triggers.
    - *Implementation:* `public open fun popBackStack(): Boolean` —
      confirmed via `javap` against the real installed
      `navigation-runtime-2.7.7.aar`'s `NavController` class this
      session; returns `true` if something was actually popped, `false`
      if there was nothing left to pop.
    - *Its use:* this lesson's back-stack test calls it directly, in
      place of a real device back-button press this environment can't
      simulate, to prove the same underlying state change.
    - *Type:* a public instance method on `NavController`.
    - *Responsibility:* remove exactly one entry from the top of the back
      stack and update `currentDestination` to whatever is now exposed
      underneath — the literal "pop" half of the back stack's Stack
      discipline.
    - *Depends on:* at least one entry beyond the graph's own start
      destination already on the back stack — otherwise there's nothing
      to pop.
    - *Connects to:* called directly by this lesson's test; its effect
      is read back through `currentDestination` immediately afterward.
    - *Shape:* the real mechanism the system back button calls on your
      behalf in a running app — here, called directly, since no real
      device back button exists in this test environment.

  - **`NavController.currentDestination`**
    - *What it is:* a real, nullable property exposing whichever
      destination the controller currently considers active.
    - *Implementation:* `public open val currentDestination:
      NavDestination?` — confirmed nullable via `javap -v`'s real
      `org.jetbrains.annotations.Nullable` annotation on its getter,
      inspected against the real installed `navigation-runtime-2.7.7.aar`
      this session, not assumed from the property's name alone.
    - *Its use:* this lesson's tests read it twice — right after tapping
      into the calculator, and again after popping back — to prove
      exactly which real route is showing at each point.
    - *Type:* a public read-only property (a Kotlin `val`) on
      `NavController`.
    - *Responsibility:* always reflect the true top of the back stack —
      whatever `navigate()` most recently pushed, or whatever
      `popBackStack()` most recently exposed.
    - *Depends on:* a graph already having been set; before that, it's
      genuinely `null`.
    - *Connects to:* updated internally by both `navigate()` and
      `popBackStack()`; read here via its own `.route` property.
    - *Shape:* the single source of truth this lesson's tests read from
      to confirm "which screen is actually showing right now" without
      touching the UI tree at all.

  - **`NavDestination.route`**
    - *What it is:* the real, nullable `String` property holding a
      destination's own registered route name.
    - *Implementation:* `public final val route: String?` — confirmed
      via `javap` against the real installed `navigation-common-2.7.7.aar`
      this session.
    - *Its use:* this lesson's tests compare it directly against literal
      route strings (`"home"`, `"calculator/{mode}"`) to prove which
      screen is active.
    - *Type:* a public read-only property on `NavDestination`.
    - *Responsibility:* report back the exact route pattern this
      destination was registered under — including any `{argument}`
      placeholder, unsubstituted, exactly as written in `composable(...)`.
    - *Depends on:* nothing beyond the destination already existing
      inside a built graph.
    - *Connects to:* read from `NavController.currentDestination?.route`;
      its value is whatever string was originally passed as
      `composable(...)`'s own `route` parameter.
    - *Shape:* a plain data-holding property — the last link in the
      chain from "an active destination" back down to "the name it was
      registered under."

  - **`ComposeTestRule.waitForIdle()`**
    - *What it is:* a real method that blocks the test until Compose has
      finished any pending recomposition and animation work, so
      assertions made right after it see the fully settled state.
    - *Implementation:* `public abstract fun waitForIdle(): Unit` —
      confirmed via `javap` against the real installed
      `ui-test-junit4-android-1.6.8.aar`'s `ComposeTestRule` interface
      this session, which `composeTestRule` (built by `createComposeRule()`)
      genuinely implements.
    - *Its use:* this lesson's back-stack test calls it once, right
      after `popBackStack()`, since that call happens outside any
      Compose-dispatched click — nothing would otherwise force the UI to
      re-settle before the very next assertion runs.
    - *Type:* a public method on the `ComposeTestRule` interface.
    - *Responsibility:* make the test wait for real, pending Compose work
      to finish before returning control — never proceed while a
      recomposition triggered a moment ago is still in flight.
    - *Depends on:* an active `ComposeTestRule` already hosting content
      (`composeTestRule.setContent { ... }` must already have run).
    - *Connects to:* called between `navController.popBackStack()` and
      this lesson's own following assertions, both of which read UI
      state that `popBackStack()`'s own state change needs a moment to
      propagate into.
    - *Shape:* Compose-testing infrastructure — a synchronization point,
      not a check of anything itself.

  - **`navArgument(name: String, builder: NavArgumentBuilder.() -> Unit)`**
    - *What it is:* a small DSL function that declares one named,
      typed argument a route expects to receive.
    - *Implementation:* `public fun navArgument(name: String, builder:
      NavArgumentBuilder.() -> Unit): NamedNavArgument` — confirmed via
      `javap` against the real installed `navigation-common-2.7.7.aar`'s
      `NamedNavArgumentKt` class this session.
    - *Its use:* this lesson's code calls it once, declaring the
      calculator route's own `"mode"` argument as a `String`.
    - *Type:* a top-level function.
    - *Responsibility:* produce one `NamedNavArgument` describing a
      single argument's name and type, to be listed inside
      `composable(...)`'s own `arguments` parameter.
    - *Depends on:* a name string and a builder lambda that sets, at
      minimum, the argument's real `type`.
    - *Connects to:* the `NamedNavArgument` it returns is placed inside
      the `listOf(...)` passed to `composable(...)`'s `arguments`
      parameter; its declared name (`"mode"`) must match the `{mode}`
      placeholder written into the route string itself.
    - *Shape:* a declaration — it describes an argument's shape, it
      doesn't carry any real value itself.

  - **`NavArgumentBuilder.type`**
    - *What it is:* the real, mutable property inside `navArgument`'s
      own builder lambda that states what kind of value this argument
      holds.
    - *Implementation:* `public final class NavArgumentBuilder { public
      final var type: NavType<?> ... }` — confirmed via `javap` against
      the real installed `navigation-common-2.7.7.aar` this session.
    - *Its use:* this lesson's code sets it to `NavType.StringType`
      inside `navArgument("mode") { type = NavType.StringType }`.
    - *Type:* a public mutable property (a `var`) on `NavArgumentBuilder`.
    - *Responsibility:* record which real `NavType` this one argument
      uses, so the library knows how to parse and later retrieve the raw
      route-string text as a real typed value.
    - *Depends on:* a real `NavType` constant assigned to it.
    - *Connects to:* read internally when building the final
      `NamedNavArgument` `navArgument(...)` returns; ultimately
      determines which `Bundle` accessor (`getString`, `getInt`, ...) the
      library uses when extracting the value later.
    - *Shape:* one field of a small builder object — the whole reason
      `navArgument(...)` takes a lambda instead of a flat argument list.

  - **`NavType` / `NavType.StringType`**
    - *What it is:* `NavType` is the real, abstract class describing how
      to convert a value to and from the raw text a route string
      actually carries; `StringType` is one of its real, pre-built
      constant instances, for plain `String` arguments.
    - *Implementation:* `public abstract class NavType<T> { public
      static final NavType<String> StringType; ... public abstract T
      get(Bundle bundle, String key); public abstract void put(Bundle
      bundle, String key, T value); }` — confirmed via `javap` against
      the real installed `navigation-common-2.7.7.aar` this session,
      which also lists real sibling constants (`IntType`, `BoolType`,
      `FloatType`, and array variants) this lesson's code doesn't use.
    - *Its use:* this lesson's code assigns `NavType.StringType` to
      `NavArgumentBuilder.type`, since the calculator mode ("Basic") is
      a plain string.
    - *Type:* `NavType` is a public abstract class; `StringType` is one
      of its `public static final` constant instances.
    - *Responsibility:* own the real conversion logic between a route's
      raw string text and a real typed value stored in a `Bundle` —
      every `NavType` constant knows how to `get`/`put` its own kind of
      value.
    - *Depends on:* nothing to reference the constant; internally, its
      own `get`/`put` methods depend on a real `Bundle` and a key.
    - *Connects to:* assigned to `NavArgumentBuilder.type`; used
      internally whenever the library reads `"mode"` back out of a
      `NavBackStackEntry`'s own `Bundle`.
    - *Shape:* a small, closed set of real conversion strategies — the
      mechanism that keeps a navigation argument honestly typed instead
      of being just a raw, unchecked string everywhere.

  - **`NavBackStackEntry`**
    - *What it is:* the real class representing one single entry on the
      back stack — one specific visit to one specific destination, along
      with whatever real arguments were passed to reach it.
    - *Implementation:* `public final class NavBackStackEntry { public
      final NavDestination getDestination(); public final Bundle
      getArguments(); ... }` — confirmed via `javap` against the real
      installed `navigation-common-2.7.7.aar` this session.
    - *Its use:* `composable(...)`'s own content lambda receives one as
      its single parameter; this lesson's code names it
      `backStackEntry` and reads its `.arguments` off it.
    - *Type:* a public class.
    - *Responsibility:* hold everything specific to one visit to one
      destination — which `NavDestination` it is, and the real `Bundle`
      of arguments that visit carried — distinct from `NavDestination`
      itself, which only describes the destination in general.
    - *Depends on:* created internally by the library every time
      `navigate()` pushes a new entry; never constructed directly by
      this project's own code.
    - *Connects to:* handed to `composable(...)`'s content lambda by
      `NavHost`; its `.arguments` property is where this lesson's code
      reads the real `"mode"` value back out.
    - *Shape:* a per-visit data object — the real, concrete thing sitting
      inside the back stack, one instance per push.

  - **`NavBackStackEntry.arguments`**
    - *What it is:* the real, nullable `Bundle` holding every navigation
      argument this specific back-stack entry was actually created with.
    - *Implementation:* `public final Bundle getArguments()` —
      confirmed via `javap` against the real installed
      `navigation-common-2.7.7.aar` this session.
    - *Its use:* this lesson's code calls `.getString("mode")` on it to
      retrieve the real value `navigate("calculator/$mode")` carried.
    - *Type:* a public read-only property, of type `Bundle?`.
    - *Responsibility:* store the real, already-parsed argument values
      for exactly this one visit — nothing shared across other entries
      for the same route.
    - *Depends on:* the library having successfully matched a real route
      string against the `{mode}` placeholder when `navigate(...)` was
      called.
    - *Connects to:* populated internally when `navigate()` pushes this
      entry; read by this lesson's own `composable(...)` content lambda.
    - *Shape:* the actual real payload a navigation argument declaration
      (`navArgument`/`NavType`) exists to describe the shape of.

  - **`Bundle.getString(key: String)`**
    - *What it is:* the real, standard Android method for reading a
      `String` value back out of a `Bundle` by key.
    - *Implementation:* `public String getString(String key)` — a real
      method declared on `android.os.BaseBundle` (`Bundle`'s own real
      superclass), confirmed via `javap` against the actual installed
      `android.jar` (`platforms;android-34`) this session; returns
      `null`, not an exception, if no value is stored under that key.
    - *Its use:* this lesson's code calls
      `backStackEntry.arguments?.getString("mode")`, immediately followed
      by `?: "Basic"` to supply a real fallback for the nullable result.
    - *Type:* a public instance method, inherited by every `Bundle` from
      `BaseBundle`.
    - *Responsibility:* look up one key and return its value as a
      `String`, or `null` if that key was never stored — the same
      `Bundle` class this project's own `onCreate(savedInstanceState:
      Bundle?)` signature has carried since this app's very first
      Activity, its own `.getString(...)` method called here for the
      first time.
    - *Depends on:* a non-null `Bundle` to call it on, and a key string
      matching whatever `NavType.StringType` stored under that name.
    - *Connects to:* called on `NavBackStackEntry.arguments`; its
      nullable result flows straight into the `?:` fallback that
      produces `CalculatorScreen`'s own real `mode` parameter.
    - *Shape:* a standard Android SDK method — not part of Navigation
      Compose at all, the ordinary boundary every navigation argument
      ultimately has to cross to become a plain Kotlin value.

  - **Everything else in the file, not this lesson's subject but still
    explained:**

    - **`Column`**
      - *What it is:* Compose's own real layout composable, stacking its
        children vertically.
      - *Implementation:* `@Composable fun Column(modifier: Modifier =
        Modifier, verticalArrangement: Arrangement.Vertical = ...,
        horizontalAlignment: Alignment.Horizontal = ..., content:
        @Composable ColumnScope.() -> Unit)`, unchanged by this lesson.
      - *Its use:* wraps `HomeScreen`'s own title and button, and
        `CalculatorScreen`'s own title, display, and keypad — the same
        real composable, called identically in both.
      - *Type:* a top-level `@Composable` function.
      - *Responsibility:* arrange its own children vertically — nothing
        about what those children's own values are.
      - *Depends on:* a `content` lambda building the children to
        arrange.
      - *Connects to:* holds `Text`/`CalculatorButton` calls in both
        `HomeScreen` and `CalculatorScreen`.
      - *Shape:* this project's own established layout vocabulary,
        unchanged.

    - **`Modifier` chain (`.fillMaxWidth()`, `.padding(Dp)`,
      `.testTag(String)`)**
      - *What it is:* Compose's own real, chainable configuration
        object, and three of its own real extension functions.
      - *Implementation:* `Modifier.fillMaxWidth(): Modifier`,
        `Modifier.padding(all: Dp): Modifier`,
        `Modifier.testTag(tag: String): Modifier`, all unchanged from
        their own first appearances in this project.
      - *Its use:* sizes `HomeScreen`'s own `Column` identically to
        `CalculatorScreen`'s; identifies `CalculatorScreen`'s own new
        `mode` title `Text`, tagged `"modeTitle"`.
      - *Type:* an interface (`Modifier`) plus its own real extension
        functions.
      - *Responsibility:* describe, declaratively, how one composable
        should be measured, laid out, or identified.
      - *Depends on:* whatever composable it's ultimately attached to.
      - *Connects to:* built up and passed into `Column`,
        `CalculatorButton`, and the display/title `Text` calls.
      - *Shape:* this project's own established configuration
        vocabulary, unchanged.

    - **`Arrangement.spacedBy(Dp)`**
      - *What it is:* Compose's own real layout function, spacing a
        `Column`'s or `Row`'s children apart by a fixed gap.
      - *Implementation:* `fun Arrangement.spacedBy(space: Dp):
        Arrangement.HorizontalOrVertical`, unchanged by this lesson.
      - *Its use:* spaces `HomeScreen`'s own title and button by the
        same real `8.dp` gap `CalculatorScreen`'s own `Column` already
        uses.
      - *Type:* a function returning an `Arrangement` value.
      - *Responsibility:* insert a fixed gap between a layout's own
        adjacent children.
      - *Depends on:* a `space: Dp` value.
      - *Connects to:* passed as `Column`'s own
        `verticalArrangement` parameter.
      - *Shape:* this project's own established layout vocabulary,
        unchanged.

    - **`Alignment.CenterHorizontally`**
      - *What it is:* Compose's own real, constant `Alignment` value,
        centering a `Column`'s children along its horizontal axis.
      - *Implementation:* `val Alignment.Companion.CenterHorizontally:
        Alignment.Horizontal`, unchanged by this lesson.
      - *Its use:* centers `HomeScreen`'s own title and button, the same
        real value `CalculatorScreen`'s own `Column` already uses.
      - *Type:* a `val` constant.
      - *Responsibility:* state one fixed horizontal alignment rule for
        a `Column`'s own children.
      - *Depends on:* nothing; a plain constant reference.
      - *Connects to:* passed as `Column`'s own
        `horizontalAlignment` parameter.
      - *Shape:* this project's own established layout vocabulary,
        unchanged.

    - **`Text(text: String, ...)`**
      - *What it is:* Compose's own real composable rendering a string
        as visible text.
      - *Implementation:* `@Composable fun Text(text: String, modifier:
        Modifier = Modifier, style: TextStyle = LocalTextStyle.current,
        ...)`, unchanged by this lesson.
      - *Its use:* renders `HomeScreen`'s own title, `CalculatorScreen`'s
        new `mode` title, and both throwaway labs' own
        `"First screen"`/`"Second screen"` text.
      - *Type:* a top-level `@Composable` function.
      - *Responsibility:* lay out and draw exactly one real string.
      - *Depends on:* a `text: String`.
      - *Connects to:* called inside every `Column` this lesson shows.
      - *Shape:* this project's own established rendering vocabulary,
        unchanged.

    - **`MaterialTheme`**
      - *What it is:* the real, ambient object this project's own
        `CalculatorTheme` populates, exposing this app's own typography.
      - *Implementation:* a real singleton object with a `typography`
        property, already confirmed via `javap` against the real
        installed Material3 library.
      - *Its use:* `HomeScreen`'s own title reads
        `MaterialTheme.typography.displayLarge`, the identical real
        style `CalculatorScreen`'s own display text already reads.
      - *Type:* a singleton object.
      - *Responsibility:* expose this app's own, centrally defined
        design values to any composable that reads it.
      - *Depends on:* being composed underneath a real `MaterialTheme`
        call, which `CalculatorTheme` already provides.
      - *Connects to:* read by both `HomeScreen`'s and
        `CalculatorScreen`'s own title/display `Text` calls.
      - *Shape:* this project's own established theming vocabulary,
        unchanged.

    - **`CalculatorButton(label, onClick, ...)`**
      - *What it is:* this project's own real, reusable, haptic-enabled
        button composable.
      - *Implementation:* `@Composable fun CalculatorButton(label:
        String, onClick: () -> Unit, modifier: Modifier = Modifier,
        contentDescription: String? = null)`, unchanged by this lesson.
      - *Its use:* `HomeScreen` calls it with just `label` and
        `onClick`, leaving `modifier`/`contentDescription` at their
        defaults — the exact future use its own original design already
        anticipated: a labeled button usable outside the numeric keypad.
      - *Type:* a `@Composable` function.
      - *Responsibility:* render one real, styled, accessible, haptic
        button and run whatever `onClick` it's handed.
      - *Depends on:* a `label`, an `onClick` callback.
      - *Connects to:* called by `HomeScreen`; its own `onClick` now
        calls `onModeSelected`/`onNavigateToBasic` instead of `nextState`.
      - *Shape:* this project's own established, reusable UI vocabulary,
        unchanged.

    - **`Int.dp`**
      - *What it is:* Compose UI's own real extension property,
        converting a plain integer into a real `Dp`
        (density-independent pixel) value.
      - *Implementation:* `val Int.dp: Dp`, unchanged from its own first
        appearance in this project.
      - *Its use:* builds every real `Dp` value inside `HomeScreen`'s
        own padding and spacing calls.
      - *Type:* an extension property on `Int`.
      - *Responsibility:* produce one real, density-independent size
        value from a plain integer literal.
      - *Depends on:* the `Int` it's called on.
      - *Connects to:* used inside `Modifier.padding(16.dp)` and
        `Arrangement.spacedBy(8.dp)`.
      - *Shape:* this project's own established sizing vocabulary,
        unchanged.

    - **`Button(onClick, ...) { }`**
      - *What it is:* the real, plain Material3 button composable.
      - *Implementation:* `@Composable fun Button(onClick: () -> Unit,
        modifier: Modifier = Modifier, ..., content: @Composable
        RowScope.() -> Unit)`.
      - *Its use:* used, not `CalculatorButton`, only inside this
        lesson's own throwaway lab, since the lab isolates Navigation
        concepts specifically and reaching for the project's own
        haptic-enabled button would add an unrelated concept to an
        isolated example.
      - *Type:* a top-level `@Composable` function.
      - *Responsibility:* render a real, styled, clickable surface and
        run a caller-supplied `onClick` the moment it's tapped.
      - *Depends on:* an `onClick` callback; its `content` lambda.
      - *Connects to:* called directly inside `LabNavHost`'s own
        `"first"` route content.
      - *Shape:* a public Material3 API, unchanged from where it was
        first introduced.

    - **`createComposeRule()`**
      - *What it is:* the real function building the JUnit `@Rule`
        object that lets a Robolectric test render and interact with
        real Compose content.
      - *Implementation:* `fun createComposeRule(): ComposeContentTestRule`,
        unchanged from its own first appearance in this project.
      - *Its use:* every one of this lesson's new test classes declares
        its own `composeTestRule` field with it.
      - *Type:* a top-level function.
      - *Responsibility:* build one real test rule wiring Compose's own
        rendering and idling machinery into a JUnit test.
      - *Depends on:* nothing at the call site; a no-argument function.
      - *Connects to:* its return value is stored in every `@get:Rule
        val composeTestRule` field this lesson adds.
      - *Shape:* this project's own established test-infrastructure
        vocabulary, unchanged.

    - **`onNodeWithTag(String)`**
      - *What it is:* the real finder function locating one node in the
        rendered semantics tree by its `testTag`.
      - *Implementation:* `fun SemanticsNodeInteractionsProvider
        .onNodeWithTag(testTag: String, useUnmergedTree: Boolean =
        false): SemanticsNodeInteraction`, unchanged from its own first
        appearance in this project.
      - *Its use:* finds `CalculatorScreen`'s own `"display"` and new
        `"modeTitle"` nodes throughout this lesson's tests.
      - *Type:* an extension function.
      - *Responsibility:* locate exactly one node bearing a given real
        test tag, or fail the test if none or more than one match.
      - *Depends on:* a `testTag: String` matching a real
        `Modifier.testTag(...)` call somewhere in the composed tree.
      - *Connects to:* called on `composeTestRule`; its return value is
        chained into `.performClick()`/`.assertTextEquals(...)` calls.
      - *Shape:* this project's own established test-finder vocabulary,
        unchanged.

    - **`onNodeWithText(String)`**
      - *What it is:* the real finder function locating one node in the
        rendered semantics tree by its own visible text.
      - *Implementation:* `fun SemanticsNodeInteractionsProvider
        .onNodeWithText(text: String, ...): SemanticsNodeInteraction`,
        unchanged from its own first appearance in this project.
      - *Its use:* finds `HomeScreen`'s own `"Basic Calculator"` button
        and `"Choose a Calculator"` title throughout this lesson's tests.
      - *Type:* an extension function.
      - *Responsibility:* locate exactly one node whose own visible text
        matches the given string, or fail the test if none or more than
        one match.
      - *Depends on:* a `text: String` matching a real `Text` call's own
        rendered content somewhere in the composed tree.
      - *Connects to:* called on `composeTestRule`; its return value is
        chained into `.performClick()`/`.assertIsDisplayed()` calls.
      - *Shape:* this project's own established test-finder vocabulary,
        unchanged.

    - **`performClick()`**
      - *What it is:* the real function simulating a click on a found
        node.
      - *Implementation:* `fun SemanticsNodeInteraction.performClick():
        SemanticsNodeInteraction`, unchanged from its own first
        appearance in this project.
      - *Its use:* clicks `HomeScreen`'s own real "Basic Calculator"
        button throughout this lesson's tests.
      - *Type:* an extension function.
      - *Responsibility:* dispatch one real, simulated click action to
        whichever node it's called on.
      - *Depends on:* a `SemanticsNodeInteraction` already found by a
        finder like `onNodeWithText(...)`.
      - *Connects to:* chained directly onto `onNodeWithTag`/
        `onNodeWithText`'s own return value throughout this lesson's
        tests.
      - *Shape:* this project's own established test-action vocabulary,
        unchanged.

    - **`assertTextEquals(String)`**
      - *What it is:* the real assertion function confirming a found
        node's own visible text exactly matches a given string.
      - *Implementation:* `fun SemanticsNodeInteraction
        .assertTextEquals(vararg value: String, includeEditableText:
        Boolean = true): SemanticsNodeInteraction`, unchanged from its
        own first appearance in this project.
      - *Its use:* confirms `CalculatorScreen`'s own real `"display"`
        and `"modeTitle"` nodes show the expected real text throughout
        this lesson's tests.
      - *Type:* an extension function.
      - *Responsibility:* throw a real, descriptive `AssertionError` if
        the node's own text doesn't match; otherwise return the same
        interaction so calls can chain.
      - *Depends on:* a `SemanticsNodeInteraction` already found by a
        finder like `onNodeWithTag(...)`.
      - *Connects to:* chained directly onto `onNodeWithTag`'s own
        return value throughout this lesson's tests.
      - *Shape:* this project's own established test-assertion
        vocabulary, unchanged.

    - **`assertEquals(expected, actual)`**
      - *What it is:* JUnit's own real, general-purpose equality
        assertion.
      - *Implementation:* `org.junit.Assert.assertEquals(expected: Any?,
        actual: Any?): Unit`, one of twelve real overloads confirmed via
        `javap` in this project's own earlier work, unchanged here.
      - *Its use:* compares plain route strings and real back-stack
        sizes throughout this lesson's `LabNavigationTest.kt` and
        `NavigationTest.kt`.
      - *Type:* a `static` method on `org.junit.Assert`.
      - *Responsibility:* fail the test with a real, descriptive message
        if two given values aren't equal; otherwise do nothing.
      - *Depends on:* two values to compare, `expected` and `actual`.
      - *Connects to:* called directly inside every new test method this
        lesson adds that isn't a UI-finder-based assertion.
      - *Shape:* this project's own established assertion vocabulary,
        unchanged.

    - **`composeTestRule.setContent { }`**
      - *What it is:* the real method handing a block of real
        `@Composable` content to the test rule so it can be rendered and
        interacted with.
      - *Implementation:* `fun ComposeContentTestRule.setContent(composable:
        @Composable () -> Unit): Unit`, unchanged from its own first
        appearance in this project.
      - *Its use:* every test in this lesson's new files calls it first,
        rendering `LabNavHost`, `CalculatorApp()`, or
        `CalculatorApp(navController = ...)`.
      - *Type:* a method on `ComposeContentTestRule`.
      - *Responsibility:* compose the given real content into the test's
        own root, so finders and assertions can act on it afterward.
      - *Depends on:* a `composable` lambda to render.
      - *Connects to:* called first inside every `@Test` method in this
        lesson's new test files; everything else in each test acts on
        whatever it renders.
      - *Shape:* this project's own established test-setup vocabulary,
        unchanged.

---

## Concept Unit: Routes — naming screens and moving between them

### The Problem

`CalculatorScreen` is, right now, the only thing `MainActivity` ever
shows — `setContent { CalculatorTheme { CalculatorScreen() } }` calls it
directly, with nothing standing between the app starting and the keypad
appearing. That's fine for an app with exactly one screen. But this
project is about to genuinely need a second one: a place for the user to
choose which calculator mode they want, before any keypad shows up at
all. Simply writing a second `@Composable` function and calling it
instead doesn't answer the real question — how does the app show *either*
screen, on demand, based on something the user actually does, and switch
back and forth between them without losing track of which one is
"current"?

> **Stop and think:** `HomeScreen` and `CalculatorScreen` are both just
> ordinary `@Composable` functions — nothing new about that. Given that a
> composable function can call another composable function directly (the
> way `CalculatorScreen` already calls `CalculatorButton` sixteen times),
> what's stopping `MainActivity` from just calling `HomeScreen()` and
> having `HomeScreen` itself call `CalculatorScreen()` when a button is
> tapped? What would `HomeScreen` need to hold onto, in its own state, to
> remember "should I be showing myself, or the calculator, right now"? If
> a third screen showed up next year, what would have to change about
> that hand-written approach?

### Introduce the Concept in Isolation

The real question step 1 raises — "which screen is currently showing,
and how do I switch it" — is exactly what a `NavHost` answers. Before
touching this project's own files, here is the smallest real version of
one, added temporarily to the real project's own source tree as
`LabNavigation.kt`:

```kotlin
package com.example.calculator

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

@Composable
fun LabNavHost() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "first") {
        composable("first") {
            Column {
                Text(text = "First screen", modifier = Modifier.testTag("labScreen"))
                Button(
                    onClick = { navController.navigate("second") },
                    modifier = Modifier.testTag("labNavigateButton")
                ) {
                    Text(text = "Go")
                }
            }
        }
        composable("second") {
            Text(text = "Second screen", modifier = Modifier.testTag("labScreen"))
        }
    }
}
```

And a real, temporary test, added to `app/src/test/java/com/example/
calculator/LabNavigationTest.kt`:

```kotlin
@Test
fun navigatingSwapsWhichRoutesContentIsShown() {
    composeTestRule.setContent {
        LabNavHost()
    }

    composeTestRule.onNodeWithTag("labScreen").assertTextEquals("First screen")

    composeTestRule.onNodeWithTag("labNavigateButton").performClick()

    composeTestRule.onNodeWithTag("labScreen").assertTextEquals("Second screen")
}
```

Run for real, this session, via `./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabNavigationTest"`:

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 3 executed, 24 up-to-date
```

The real, saved JUnit report confirms the test passed:

```xml
<testcase name="navigatingSwapsWhichRoutesContentIsShown"
  classname="com.example.calculator.LabNavigationTest" time="0.416"/>
```

This proves the whole mechanism concretely: `rememberNavController()`
built one real controller object; `NavHost` showed exactly the
`"first"` route's content and nothing else, on its own, with no click
required; and calling `navController.navigate("second")` from inside a
real button's `onClick` swapped the *entire visible content* to the
`"second"` route — proving `NavHost` isn't re-running both routes and
hiding one, it's genuinely showing one destination at a time and
replacing it. This whole mechanism — a controller, a host, and named
routes registered inside it — is called **Navigation Compose**.

### Discard the Throwaway Example

`LabNavHost` and its test are deleted now — real, saved in this lesson's
own verification folder (`verification/4.1/lab_navigation.kt`,
`lab_navigation_test.kt`, and the real passing JUnit report,
`step1_lab_navigation_passes.xml`), but never appearing in
`AndroidCalculator`'s own source tree again. Everything below builds the
same mechanism directly into the real project instead.

### Project Change

- **Reference Source** — no reference counterpart; this is a from-scratch
  addition. `CalculatorScreen` has had no second screen to navigate to
  until now.
- **Files affected** — `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified); `app/build.gradle.kts` (modified, new
  dependency).
- **Change type** — add.
- **Location** — two new `@Composable` functions, `HomeScreen` and
  `CalculatorApp`, inserted between the existing `CalculatorButton`
  function and the existing `CalculatorScreen` function; one line changed
  inside `MainActivity`'s own `onCreate`.
- **Dependencies** — a new Gradle dependency, `androidx.navigation
  :navigation-compose:2.7.7`, added to `app/build.gradle.kts`'s
  `dependencies { }` block as `implementation(...)`. Real-resolved this
  session via `./gradlew :app:dependencies --configuration
  debugCompileClasspath`, with no version conflicts against this
  project's existing Compose BOM `2024.06.00` or Kotlin Gradle plugin
  `1.9.24`.

### The New Code

```kotlin
@Composable
fun HomeScreen(onNavigateToBasic: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Choose a Calculator", style = MaterialTheme.typography.displayLarge)
        CalculatorButton(label = "Basic Calculator", onClick = onNavigateToBasic)
    }
}

@Composable
fun CalculatorApp(navController: NavHostController = rememberNavController()) {
    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(onNavigateToBasic = { navController.navigate("calculator") })
        }
        composable("calculator") {
            CalculatorScreen()
        }
    }
}
```

### The Updated Project

`MainActivity.kt`'s own `onCreate` now reads:

```kotlin
 1  class MainActivity : ComponentActivity() {
 2      override fun onCreate(savedInstanceState: Bundle?) {
 3          super.onCreate(savedInstanceState)
 4          setContent {
 5              CalculatorTheme {
 6                  CalculatorApp()               // ← new
 7              }
 8          }
 9      }
10  }
```

The only change is line 6: `CalculatorScreen()` is gone, replaced by
`CalculatorApp()`. `MainActivity` itself now knows nothing at all about
which screen shows first — that decision moved entirely into
`CalculatorApp`'s own `NavHost`. The file's full new structure, with
`HomeScreen` and `CalculatorApp` in place, reads top to bottom as: the
Activity shell, the keypad data and helpers, `CalculatorButton`,
`HomeScreen`, `CalculatorApp`, then `CalculatorScreen` — the same order
this project builds and reads its screens in.

### Mechanical Walkthrough

- `@Composable` on both `HomeScreen` and `CalculatorApp` — the same
  annotation `CalculatorScreen` and `CalculatorButton` already carry,
  marking each as a function the Compose compiler can track for
  recomposition and call from inside another composable's own body.
- `fun HomeScreen(onNavigateToBasic: () -> Unit)` — a brand-new function,
  taking one parameter whose type is itself a function, `() -> Unit`,
  the same "hand behavior to someone else to call" shape
  `CalculatorButton`'s own `onClick` parameter has used since Lesson
  3.2. `HomeScreen` never decides for itself what happens when its
  button is tapped — it only promises to call whatever function it was
  given.
- `Column(modifier = ..., verticalArrangement = ..., horizontalAlignment
  = ...) { ... }` — the same vertical-stacking layout composable
  `CalculatorScreen` already opens with, here holding a title and one
  button instead of a title and a keypad.
- `Modifier.fillMaxWidth().padding(16.dp)` — the identical chain
  `CalculatorScreen`'s own `Column` already uses: claim full width, then
  pad every edge by `16.dp`.
- `Arrangement.spacedBy(8.dp)` and `Alignment.CenterHorizontally` — the
  identical spacing and centering `CalculatorScreen`'s own `Column`
  already applies.
- `Text(text = "Choose a Calculator", style = MaterialTheme.typography.
  displayLarge)` — the same `Text` function and the same centrally
  defined text style `CalculatorScreen`'s own display already reads from
  `Theme.kt`, reused here for a title instead of a running calculation.
- `CalculatorButton(label = "Basic Calculator", onClick =
  onNavigateToBasic)` — this project's own reusable button, called with
  just its two required parameters, leaving `modifier` and
  `contentDescription` at their established defaults. This is the exact
  future use `CalculatorButton`'s own original design already
  anticipated: a labeled button usable outside the numeric keypad.
- `fun CalculatorApp(navController: NavHostController = rememberNavController())`
  — a brand-new function whose one parameter has a default value that is
  itself a real function call. `NavHostController` names the real type
  this function needs; `rememberNavController()` supplies one
  automatically whenever a caller doesn't pass their own — which is
  every real caller in this app so far, `MainActivity` included.
  `rememberNavController()` is a `@Composable` function itself (its own
  real, published implementation reads `val context = LocalContext.
  current; return rememberSaveable(saver = NavControllerSaver(context))
  { createNavController(context) }`, fetched from AndroidX's own public
  source this session): it reads the ambient `Context` Compose already
  threads through every composable, and hands back a real
  `NavHostController` wrapped in `rememberSaveable` — the same "survive
  recomposition" guarantee plain `remember` already gives (first proven
  by actually removing it and watching state reset on recomposition),
  but stronger: `rememberSaveable` also survives a
  configuration change (like a screen rotation), because it's backed by
  Android's own saved-instance-state mechanism, not just an in-memory
  slot. Its own real KDoc, fetched this session, also states it
  "handles the adding of the `ComposeNavigator` and `DialogNavigator`"
  — meaning the two navigators any Compose navigation graph needs are
  registered automatically, invisibly, the moment this function runs.
- `NavHost(navController = navController, startDestination = "home") { ... }`
  — the same real function proven in isolation above, called here with
  this app's own controller and a real starting route, `"home"`. Its own
  real, published body (fetched this session) does nothing more than
  `navController.createGraph(startDestination, route, builder)` — the
  graph it builds and remembers is an ordinary object, not hidden
  framework state.
- `composable("home") { HomeScreen(onNavigateToBasic = { navController.
  navigate("calculator") }) }` — registers the route `"home"`,
  proven in isolation above, whose content is a call to the new
  `HomeScreen`. The lambda passed as `onNavigateToBasic` is where
  `navController.navigate("calculator")` — the real method proven above,
  pushing `"calculator"` onto the back stack and updating
  `currentDestination` — actually gets called, but only once the user
  taps the real button inside `HomeScreen`, not when this composable
  block itself runs.
- `composable("calculator") { CalculatorScreen() }` — registers the
  second route, `"calculator"`, whose content is a call to the
  already-existing `CalculatorScreen`, unchanged in this unit.

### CS Lens

Registering a fixed set of named destinations ahead of time, then
dispatching to one of them by name at runtime, is the same
**routing table** idea recognized far outside Android: a web server's
own URL router maps path strings to handler functions the same way
`composable(route) { ... }` maps a route string to a screen; a `switch`
or `when` statement dispatching on a string tag follows the identical
shape at a much smaller scale; a compiler's own symbol table maps names
to the real declarations they refer to, resolved by lookup rather than
by the caller holding a direct reference.

```
Also recognized in: web application routers, operating system
system-call tables, compiler symbol tables, telephone exchange switching
```

### SE Lens

The alternative to a routing table is direct coupling: `HomeScreen`
calling `CalculatorScreen()` itself, the way step 1's Socratic prompt
raised. That's not hypothetical — it's the simplest thing that would
compile, and for exactly two screens it would even work. The real cost
shows up the moment a third screen exists: every screen that might ever
need to show another screen would need a direct import and a direct
call to it, and "which screen is currently on top" would have to be
tracked by hand, in some `mutableStateOf` var, duplicated wherever it's
needed. A `NavHost` is the alternative that scales: every screen only
ever needs to know route *names*, never the other screens' own
implementations, and exactly one object — the `NavController` — owns
the single, authoritative answer to "what's currently showing." The real
debt this project is taking on in exchange: a route is just a plain
`String`, checked by nothing at compile time — misspelling `"calculater"`
compiles cleanly and only fails at runtime, the moment `navigate(...)`
is actually called.

### Commands Needed

- `./gradlew :app:dependencies --configuration debugCompileClasspath` —
  Gradle's own dependency-resolution report for exactly the classpath
  `app`'s debug build compiles against. Run for real this session after
  adding `androidx.navigation:navigation-compose:2.7.7`, confirming it
  resolves with zero version conflicts against this project's existing
  Compose BOM and Kotlin Gradle plugin.
- `./gradlew :app:testDebugUnitTest --tests "com.example.calculator.
  LabNavigationTest"` — runs only this lesson's own lab test class,
  by its fully qualified name, rather than the whole project's suite;
  useful whenever a single new test file needs a fast, isolated check
  before the rest of the suite runs alongside it.

### Run It

Real, executed this session via `./gradlew :app:testDebugUnitTest`
(the full suite, `NavigationTest.kt`'s own Unit 1 tests included
alongside every pre-existing test):

```
BUILD SUCCESSFUL in 5s
27 actionable tasks: 3 executed, 24 up-to-date
```

The real, saved JUnit report for this unit's own two new permanent
tests:

```xml
<testcase name="homeScreenIsTheStartDestination"
  classname="com.example.calculator.NavigationTest" time="0.028"/>
<testcase name="tappingBasicCalculatorNavigatesToCalculatorScreen"
  classname="com.example.calculator.NavigationTest" time="0.129"/>
```

### Connect the Pieces

`MainActivity` no longer decides what the user sees first — it hands
that entirely to `CalculatorApp`, whose `NavHost` shows `"home"`'s
content, `HomeScreen`, the moment the app starts. Tapping its one real
button calls `navController.navigate("calculator")`, and `NavHost`
swaps its visible content to `"calculator"`'s own, `CalculatorScreen`
— the exact mechanism this unit's own isolated lab already proved, now
wired into this project's real screens for real.

---

## Concept Unit: Back Stack — the record of how you got here

### The Problem

Unit 1 made `navigate("calculator")` real — tapping the button gets a
user from Home to the calculator. But nothing yet says what happens when
they want to go back. A phone's own system back button is going to do
*something* the instant this app runs on a real device, whether this
project has thought about it or not — and right now, nothing in
`CalculatorApp` states what.

> **Stop and think:** `navController.navigate("calculator")` pushed
> something to make `"calculator"` the current destination. Given that
> "go back" has to somehow undo exactly that, what's the smallest
> possible thing `navigate(...)` could be doing internally to make "undo
> the most recent one" well-defined, no matter how many times a user has
> navigated forward? What data structure would you reach for if you had
> to build "always undo the most recent action, in order" yourself, from
> scratch?

### Introduce the Concept in Isolation

The real question step 1 raises — what exactly does `navigate(...)`
push, and how does undoing it work — is answered directly, without any
UI at all, using `TestNavHostController`: a real, test-only
`NavHostController` that exposes its own back stack directly. Added
temporarily to `LabNavigationTest.kt`, alongside Unit 1's own lab test
before both were deleted together:

```kotlin
@Test
fun navigateAndPopBackStackPushAndPopRealEntries() {
    val navController = TestNavHostController(ApplicationProvider.getApplicationContext())
    navController.navigatorProvider.addNavigator(ComposeNavigator())
    navController.graph = navController.createGraph(startDestination = "first") {
        composable("first") { }
        composable("second") { }
    }

    val sizeAtStart = navController.backStack.size
    assertEquals("first", navController.currentDestination?.route)

    navController.navigate("second")
    assertEquals("second", navController.currentDestination?.route)
    assertEquals(sizeAtStart + 1, navController.backStack.size)

    navController.popBackStack()
    assertEquals("first", navController.currentDestination?.route)
    assertEquals(sizeAtStart, navController.backStack.size)
}
```

Run for real this session (batched together with Unit 1's own lab test,
one single test run):

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 3 executed, 24 up-to-date
```

The real, saved JUnit report:

```xml
<testcase name="navigateAndPopBackStackPushAndPopRealEntries"
  classname="com.example.calculator.LabNavigationTest" time="2.452"/>
```

The real, measured starting size — deliberately not assumed, checked by
forcing a real, temporary failing assertion and reading the actual
number back from the failure message this session — was `2`: setting a
graph doesn't just push the start destination, it also gives the graph
itself its own back-stack entry, a real, concrete detail no amount of
reasoning about "one entry per screen" would have predicted correctly.
After `navigate("second")`, the real size grew by exactly one; after
`popBackStack()`, it shrank back to exactly the starting size, and
`currentDestination` was exactly `"first"` again. This proves
`navigate(...)` really does push and `popBackStack()` really does pop,
one entry at a time, exactly the LIFO discipline a **Stack** data
structure enforces — and it's called the **back stack** for exactly
this reason.

### Discard the Throwaway Example

This test, and `LabNavHost` from Unit 1, are both deleted now — real,
saved together in `verification/4.1/lab_navigation_test.kt`, alongside
the real passing JUnit report for both,
`step1_lab_navigation_passes.xml`. Neither appears in
`AndroidCalculator`'s own source tree again.

### Project Change

- **Reference Source** — no reference counterpart; this unit adds no new
  behavior to the app's own main source, only a permanent test proving
  behavior Unit 1's own `navigate()` call already produces for real.
- **Files affected** — `app/src/test/java/com/example/calculator/
  NavigationTest.kt` (modified, new test method appended); a new Gradle
  dependency, `androidx.navigation:navigation-testing:2.7.7`, added as
  `testImplementation` alongside Unit 1's own `navigation-compose`
  dependency.
- **Change type** — add (a new permanent test method; no production code
  changes).
- **Location** — a new `@Test` method,
  `pressingBackFromCalculatorReturnsToHomeScreen`, appended after
  `tappingBasicCalculatorNavigatesToCalculatorScreen` inside
  `NavigationTest.kt`.
- **Dependencies** — `androidx.navigation:navigation-testing:2.7.7`,
  real-resolved this session alongside `navigation-compose:2.7.7` with
  no version conflicts; `androidx.test:core:1.5.0`, real-confirmed
  already present transitively (via Robolectric and `ui-test-junit4`)
  before this lesson, so `ApplicationProvider` needed no new dependency
  of its own.

### The New Code

```kotlin
@Test
fun pressingBackFromCalculatorReturnsToHomeScreen() {
    val navController = TestNavHostController(ApplicationProvider.getApplicationContext())
    navController.navigatorProvider.addNavigator(ComposeNavigator())
    composeTestRule.setContent {
        CalculatorApp(navController = navController)
    }

    composeTestRule.onNodeWithText("Basic Calculator").performClick()
    assertEquals("calculator", navController.currentDestination?.route)

    navController.popBackStack()
    composeTestRule.waitForIdle()

    assertEquals("home", navController.currentDestination?.route)
    composeTestRule.onNodeWithText("Choose a Calculator").assertIsDisplayed()
}
```

### The Updated Project

`NavigationTest.kt`, with this unit's own new test appended (its earlier
two tests, from Unit 1, unchanged above it):

```kotlin
 1  package com.example.calculator
 2
 3  import androidx.compose.ui.test.assertIsDisplayed
 4  import androidx.compose.ui.test.assertTextEquals
 5  import androidx.compose.ui.test.junit4.createComposeRule
 6  import androidx.compose.ui.test.onNodeWithTag
 7  import androidx.compose.ui.test.onNodeWithText
 8  import androidx.compose.ui.test.performClick
 9  import androidx.navigation.compose.ComposeNavigator              // ← new
10  import androidx.navigation.testing.TestNavHostController         // ← new
11  import androidx.test.core.app.ApplicationProvider                // ← new
12  import org.junit.Assert.assertEquals                             // ← new
13  import org.junit.Rule
14  import org.junit.Test
15  import org.junit.runner.RunWith
16  import org.robolectric.RobolectricTestRunner
17  import org.robolectric.annotation.Config
18
19  @RunWith(RobolectricTestRunner::class)
20  @Config(sdk = [34])
21  class NavigationTest {
22
23      @get:Rule
24      val composeTestRule = createComposeRule()
25
26      @Test
27      fun homeScreenIsTheStartDestination() {
28          composeTestRule.setContent {
29              CalculatorApp()
30          }
31
32          composeTestRule.onNodeWithText("Choose a Calculator").assertIsDisplayed()
33      }
34
35      @Test
36      fun tappingBasicCalculatorNavigatesToCalculatorScreen() {
37          composeTestRule.setContent {
38              CalculatorApp()
39          }
40
41          composeTestRule.onNodeWithText("Basic Calculator").performClick()
42
43          composeTestRule.onNodeWithTag("display").assertTextEquals("0")
44      }
45
46      @Test                                                          // ← new
47      fun pressingBackFromCalculatorReturnsToHomeScreen() {           // ← new
48          val navController = TestNavHostController(ApplicationProvider.getApplicationContext()) // ← new
49          navController.navigatorProvider.addNavigator(ComposeNavigator())                        // ← new
50          composeTestRule.setContent {                                // ← new
51              CalculatorApp(navController = navController)             // ← new
52          }                                                            // ← new
53                                                                        // ← new
54          composeTestRule.onNodeWithText("Basic Calculator").performClick()                       // ← new
55          assertEquals("calculator", navController.currentDestination?.route)                      // ← new
56                                                                        // ← new
57          navController.popBackStack()                                // ← new
58          composeTestRule.waitForIdle()                               // ← new
59                                                                        // ← new
60          assertEquals("home", navController.currentDestination?.route) // ← new
61          composeTestRule.onNodeWithText("Choose a Calculator").assertIsDisplayed() // ← new
62      }                                                                // ← new
63  }
```

The class as a whole now proves three real things about this app's real
navigation: which screen starts active (Unit 1), that tapping a real
button really moves to the calculator (Unit 1), and now, that popping
the back stack really returns to Home (this unit). Line 55 still reads
the plain route `"calculator"`, matching `CalculatorApp`'s own route
string as it exists at this exact point — the next Concept Unit, below,
is what changes it, and updates this exact assertion to match.

### Mechanical Walkthrough

- `TestNavHostController(ApplicationProvider.getApplicationContext())`
  — constructs the real test-only controller proven above, passed a
  real Android `Context` obtained the standard Robolectric-test way,
  rather than through Compose's own ambient `LocalContext` (there's no
  composable scope yet at this point in the test).
- `navController.navigatorProvider.addNavigator(ComposeNavigator())` —
  registers the real navigator, proven above, that knows how to build
  `composable(...)`-style destinations. Necessary here specifically
  because `TestNavHostController` is constructed directly, bypassing the
  automatic registration `rememberNavController()`'s own real,
  published body performs on your behalf in every other call site in
  this project.
- `composeTestRule.setContent { CalculatorApp(navController =
  navController) }` — the same `setContent` pattern used throughout this
  project already, here passing this test's own
  `TestNavHostController` as `CalculatorApp`'s `navController` argument
  by name — overriding its default `rememberNavController()` value
  entirely, so the test observes and drives the exact same controller
  the real screens are using.
- `composeTestRule.onNodeWithText("Basic Calculator").performClick()` —
  the identical real click already proven in Unit 1's own permanent
  test, reused here to actually push `"calculator"` onto this specific
  controller's own back stack.
- `assertEquals("calculator", navController.currentDestination
  ?.route)` — reads `currentDestination`, proven above, and its own
  `.route` property, also proven above, through a `?.` safe call — this
  project's own established nullable-handling pattern, short-circuiting
  to `null` instead of throwing when the left side already is `null`,
  needed here since `currentDestination` is genuinely nullable before
  any navigation has occurred; confirms the push from the click above
  really landed.
- `navController.popBackStack()` — the real method proven above, called
  directly in place of a system back-button press this test environment
  has no way to simulate; proves the same underlying state change a real
  press would trigger.
- `composeTestRule.waitForIdle()` — the real method proven above, needed
  here specifically because `popBackStack()` was called directly on the
  controller, outside of any Compose-dispatched click — without it,
  the very next assertion could run before Compose has finished
  reacting to the popped state.
- `assertEquals("home", navController.currentDestination?.route)` — the
  same pattern as before, now confirming the pop really did restore
  `"home"` as the current route.
- `composeTestRule.onNodeWithText("Choose a Calculator").assertIsDisplayed()`
  — the real assertion proven above, confirming not just that the
  *route* changed back but that Home's own real visible content is
  genuinely back on screen.

### CS Lens

The back stack is a **Stack** — the same abstract data type recognized
everywhere something needs "always undo the most recent action, in
exact reverse order" without tracking anything more elaborate.

```
Also recognized in: a web browser's own back button, an undo command in
a text editor, a call stack unwinding during function returns, balanced-
parenthesis checking in a parser
```

### SE Lens

The alternative this project could have reached for is hand-rolling its
own "which screen was I on before this one" tracking — a
`previousScreen: String?` variable, updated manually every time
`navigate` is called, then read and cleared by hand whenever the system
back button fires. That's not a hypothetical shortcut; it's genuinely
what a from-scratch navigation system without a library would look like,
and it breaks the instant a user visits three or more screens in a row,
since one variable can't hold an arbitrarily long history. The real
back stack this library maintains scales to any depth for free, at the
cost of the app owning less control over exactly what "back" does in an
unusual case — the maintenance debt is on the library's side now, not
this project's, which is exactly the tradeoff worth making for a
mechanism this well-established and this easy to get subtly wrong by
hand.

### Commands Needed

`./gradlew :app:testDebugUnitTest --tests "com.example.calculator.
NavigationTest"` — the same scoped-run pattern from Unit 1's own
Commands Needed, here filtered to this unit's own growing test class
specifically, confirming its new test alongside the other two already
proven in Unit 1.

### Run It

Real, executed this session:

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 3 executed, 24 up-to-date
```

The real, saved JUnit report:

```xml
<testcase name="pressingBackFromCalculatorReturnsToHomeScreen"
  classname="com.example.calculator.NavigationTest" time="0.04"/>
```

### Connect the Pieces

Unit 1 proved `navigate("calculator")` moves the user forward; this unit
proves the exact reverse is just as real — `popBackStack()`, the same
operation a system back button triggers, returns to precisely the
screen the user came from, no matter how the forward trip happened,
because both operations are working the same real, single back stack.

---

## Concept Unit: Navigation Arguments — carrying a real value through a route

### The Problem

`CalculatorScreen` is still showing exactly one calculator right now —
Home's own button is labeled "Basic Calculator" and leads to a route
literally named `"calculator"`, with no way to say *which* mode was
actually chosen. That's honest for today, since Basic is the only real
mode this app has. But Home's own button-tap already knows something
concrete and real — the exact word "Basic" — and nothing about the route
it navigates to currently carries that value anywhere. `CalculatorScreen`
itself has no way to display, or ever act differently based on, which
mode sent it there.

> **Stop and think:** a route is just a `String`, and `navigate(...)`
> takes a `String`. Given that, what's the simplest way you can imagine
> to get the literal word "Basic" from `HomeScreen`'s own button all the
> way into `CalculatorScreen`, using only a string? What would the
> *receiving* side — `composable("calculator") { ... }` — need to do to
> pull that value back out again, given that all it starts with is one
> route string?

### Introduce the Concept in Isolation

The real question step 1 raises — carrying a real value through a plain
route string — is answered directly, again with `TestNavHostController`,
no UI needed. Added temporarily to `LabNavigationTest.kt`, alongside
Units 1 and 2's own lab tests, before all three were deleted together:

```kotlin
@Test
fun navigationArgumentCarriesRealStringValueThroughRoute() {
    val navController = TestNavHostController(ApplicationProvider.getApplicationContext())
    navController.navigatorProvider.addNavigator(ComposeNavigator())
    navController.graph = navController.createGraph(startDestination = "first") {
        composable("first") { }
        composable(
            route = "second/{note}",
            arguments = listOf(navArgument("note") { type = NavType.StringType })
        ) { }
    }

    navController.navigate("second/hello")

    val note = navController.currentBackStackEntry?.arguments?.getString("note")
    assertEquals("hello", note)
}
```

Run for real this session (batched together with Units 1 and 2's own lab
tests, one single test run):

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 3 executed, 24 up-to-date
```

The real, saved JUnit report:

```xml
<testcase name="navigationArgumentCarriesRealStringValueThroughRoute"
  classname="com.example.calculator.LabNavigationTest" time="0.033"/>
```

This proves the whole mechanism: declaring `"second/{note}"` as the
route, with `{note}` as a real placeholder, alongside a matching
`navArgument("note") { type = NavType.StringType }` declaration, let
`navigate("second/hello")` — an entirely ordinary string, built with
nothing more than a route pattern and a real value substituted in —
successfully land on the `"second/{note}"` destination, with the real
text `"hello"` recoverable afterward through `.arguments?.getString
("note")`. This is called a **navigation argument**.

### Discard the Throwaway Example

This test, and Units 1 and 2's own lab code, are deleted now — all real,
saved together in `verification/4.1/lab_navigation_test.kt` and its real
passing JUnit report. None of it appears in `AndroidCalculator`'s own
source tree again.

### Project Change

- **Reference Source** — no reference counterpart; this is a from-scratch
  addition, extending Unit 1's own route with a real argument.
- **Files affected** — `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified); `app/src/test/java/com/example/
  calculator/NavigationTest.kt` (modified: a new test method appended,
  *and* one existing assertion updated — see below).
- **Change type** — refactor (`HomeScreen`'s own callback parameter and
  `CalculatorApp`'s own calculator route) plus add (a new `mode`
  parameter and a new `Text` line on `CalculatorScreen`, plus a new test
  method).
- **Location** — inside `HomeScreen`, its parameter and button call;
  inside `CalculatorApp`, the second `composable(...)` registration;
  inside `CalculatorScreen`, its own function signature and the very
  top of its `Column`. A real ripple effect from that same route change:
  the previous unit's own `pressingBackFromCalculatorReturnsToHomeScreen`
  test asserted the *real, exact* route string
  `navController.currentDestination?.route` produces immediately after a
  click — that string is genuinely `"calculator/{mode}"` once this
  unit's own route pattern changes, so that one existing assertion moves
  from `"calculator"` to `"calculator/{mode}"` too, or it would start
  failing for real.
- **Dependencies** — none beyond what Units 1 and 2 already added; no
  new Gradle dependency.

### The New Code

```kotlin
@Composable
fun HomeScreen(onModeSelected: (String) -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Choose a Calculator", style = MaterialTheme.typography.displayLarge)
        CalculatorButton(label = "Basic Calculator", onClick = { onModeSelected("Basic") })
    }
}
```

`HomeScreen` now hands a real string to its caller instead of a bare
signal. The route that receives it changes to match, on the
`CalculatorApp` side:

```kotlin
composable(
    route = "calculator/{mode}",
    arguments = listOf(navArgument("mode") { type = NavType.StringType })
) { backStackEntry ->
    val mode = backStackEntry.arguments?.getString("mode") ?: "Basic"
    CalculatorScreen(mode = mode)
}
```

That real value, once extracted, needs somewhere to actually show up.
`CalculatorScreen` gains one new line for exactly that:

```kotlin
Text(text = mode, modifier = Modifier.testTag("modeTitle"))
```

Finally, a new permanent test proves the whole chain actually delivers
the real value, not just that the code compiles:

```kotlin
@Test
fun navigatingFromHomePassesBasicAsRealModeArgument() {
    composeTestRule.setContent {
        CalculatorApp()
    }

    composeTestRule.onNodeWithText("Basic Calculator").performClick()

    composeTestRule.onNodeWithTag("modeTitle").assertTextEquals("Basic")
}
```

### The Updated Project

`MainActivity.kt`'s full, real, final state — `HomeScreen`,
`CalculatorApp`, and `CalculatorScreen`, all three carrying this unit's
own changes:

```kotlin
 1  @Composable
 2  fun HomeScreen(onModeSelected: (String) -> Unit) {                       // ← changed
 3      Column(
 4          modifier = Modifier.fillMaxWidth().padding(16.dp),
 5          verticalArrangement = Arrangement.spacedBy(8.dp),
 6          horizontalAlignment = Alignment.CenterHorizontally
 7      ) {
 8          Text(text = "Choose a Calculator", style = MaterialTheme.typography.displayLarge)
 9          CalculatorButton(label = "Basic Calculator", onClick = { onModeSelected("Basic") }) // ← changed
10      }
11  }
12
13  @Composable
14  fun CalculatorApp(navController: NavHostController = rememberNavController()) {
15      NavHost(navController = navController, startDestination = "home") {
16          composable("home") {
17              HomeScreen(onModeSelected = { mode -> navController.navigate("calculator/$mode") }) // ← changed
18          }
19          composable(                                                       // ← changed
20              route = "calculator/{mode}",                                  // ← changed
21              arguments = listOf(navArgument("mode") { type = NavType.StringType }) // ← changed
22          ) { backStackEntry ->                                             // ← changed
23              val mode = backStackEntry.arguments?.getString("mode") ?: "Basic" // ← changed
24              CalculatorScreen(mode = mode)                                 // ← changed
25          }
26      }
27  }
28
29  @Composable
30  fun CalculatorScreen(mode: String = "Basic") {                           // ← changed
31      var state by remember { mutableStateOf(CalculatorState()) }
32      val displayColor by animateColorAsState(
33          targetValue = when (state.display) {
34              is Display.Value -> MaterialTheme.colorScheme.onBackground
35              Display.Error -> MaterialTheme.colorScheme.error
36          },
37          label = "displayColor"
38      )
39      Column(
40          modifier = Modifier.fillMaxWidth().padding(16.dp),
41          verticalArrangement = Arrangement.spacedBy(8.dp),
42          horizontalAlignment = Alignment.CenterHorizontally
43      ) {
44          Text(text = mode, modifier = Modifier.testTag("modeTitle"))       // ← new
45          Text(
46              text = state.display.toDisplayText(),
47              style = MaterialTheme.typography.displayLarge,
48              color = displayColor,
49              modifier = Modifier.testTag("display")
50          )
51          for (row in keypadRows) {
52              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
53                  for (label in row) {
54                      CalculatorButton(
55                          label = label,
56                          onClick = { state = nextState(state, label) },
57                          modifier = Modifier.weight(1f),
58                          contentDescription = accessibilityLabels[label]
59                      )
60                  }
61              }
62          }
63      }
64  }
```

`HomeScreen` now hands its caller a real chosen mode string instead of a
bare signal that its one button was pressed; `CalculatorApp`'s second
route now carries that string through to whichever screen it lands on;
`CalculatorScreen` now displays whichever mode it was actually given,
defaulting to `"Basic"` for every one of this project's existing tests
that still calls `CalculatorScreen()` with no arguments at all — ten
real call sites, none of which needed to change.

`NavigationTest.kt`'s own full, real, final state — the previous unit's
own test with its route assertion updated, and this unit's own new test
appended:

```kotlin
 1  package com.example.calculator
 2
 3  import androidx.compose.ui.test.assertIsDisplayed
 4  import androidx.compose.ui.test.assertTextEquals
 5  import androidx.compose.ui.test.junit4.createComposeRule
 6  import androidx.compose.ui.test.onNodeWithTag
 7  import androidx.compose.ui.test.onNodeWithText
 8  import androidx.compose.ui.test.performClick
 9  import androidx.navigation.compose.ComposeNavigator
10  import androidx.navigation.testing.TestNavHostController
11  import androidx.test.core.app.ApplicationProvider
12  import org.junit.Assert.assertEquals
13  import org.junit.Rule
14  import org.junit.Test
15  import org.junit.runner.RunWith
16  import org.robolectric.RobolectricTestRunner
17  import org.robolectric.annotation.Config
18
19  @RunWith(RobolectricTestRunner::class)
20  @Config(sdk = [34])
21  class NavigationTest {
22
23      @get:Rule
24      val composeTestRule = createComposeRule()
25
26      @Test
27      fun homeScreenIsTheStartDestination() {
28          composeTestRule.setContent {
29              CalculatorApp()
30          }
31
32          composeTestRule.onNodeWithText("Choose a Calculator").assertIsDisplayed()
33      }
34
35      @Test
36      fun tappingBasicCalculatorNavigatesToCalculatorScreen() {
37          composeTestRule.setContent {
38              CalculatorApp()
39          }
40
41          composeTestRule.onNodeWithText("Basic Calculator").performClick()
42
43          composeTestRule.onNodeWithTag("display").assertTextEquals("0")
44      }
45
46      @Test
47      fun pressingBackFromCalculatorReturnsToHomeScreen() {
48          val navController = TestNavHostController(ApplicationProvider.getApplicationContext())
49          navController.navigatorProvider.addNavigator(ComposeNavigator())
50          composeTestRule.setContent {
51              CalculatorApp(navController = navController)
52          }
53
54          composeTestRule.onNodeWithText("Basic Calculator").performClick()
55          assertEquals("calculator/{mode}", navController.currentDestination?.route) // ← changed
56
57          navController.popBackStack()
58          composeTestRule.waitForIdle()
59
60          assertEquals("home", navController.currentDestination?.route)
61          composeTestRule.onNodeWithText("Choose a Calculator").assertIsDisplayed()
62      }
63
64      @Test                                                          // ← new
65      fun navigatingFromHomePassesBasicAsRealModeArgument() {         // ← new
66          composeTestRule.setContent {                                // ← new
67              CalculatorApp()                                         // ← new
68          }                                                           // ← new
69                                                                       // ← new
70          composeTestRule.onNodeWithText("Basic Calculator").performClick() // ← new
71                                                                       // ← new
72          composeTestRule.onNodeWithTag("modeTitle").assertTextEquals("Basic") // ← new
73      }                                                                // ← new
74  }
```

Line 55 is the one existing line this unit's own route change actually
touches — the exact route string `currentDestination?.route` produces
after a real click genuinely changed the moment `composable(...)`'s own
`route` parameter did, so the assertion had to move with it, or it would
fail against the app's own real, current behavior. Lines 64–73 are this
unit's own new test, added after the other three, following the exact
same `setContent`/click/assert shape every test in this file already
uses.

### Mechanical Walkthrough

- `fun HomeScreen(onModeSelected: (String) -> Unit)` — `HomeScreen`'s own
  parameter changes shape: instead of a plain `() -> Unit` (Unit 1's
  version, "just tell me something happened"), it's now `(String) ->
  Unit` — "tell me something happened, and hand me which real value it
  concerned." The same "hand behavior to someone else to call" idea from
  Unit 1, now carrying a real payload along with the call.
- `CalculatorButton(label = "Basic Calculator", onClick = {
  onModeSelected("Basic") })` — the button's own `onClick` is now a
  lambda that calls `onModeSelected` with the literal string `"Basic"`,
  rather than calling it directly with no arguments. This is the exact
  moment the real value "Basic" first enters the navigation flow.
- `composable(route = "calculator/{mode}", arguments = listOf(navArgument
  ("mode") { type = NavType.StringType })) { backStackEntry -> ... }` —
  the same real `composable()` function proven in Unit 1, now called
  with its own `route` and `arguments` parameters named explicitly. The
  route string itself, `"calculator/{mode}"`, uses `{mode}` as a real
  placeholder the library's own route-matching parses out of whatever
  string is actually navigated to; `navArgument("mode") { type =
  NavType.StringType }`, proven above, declares that this placeholder
  holds a plain string. The lambda's own parameter, named
  `backStackEntry`, is a real `NavBackStackEntry`, proven above — the
  one specific visit this exact navigation created.
- `val mode = backStackEntry.arguments?.getString("mode") ?: "Basic"` —
  `.arguments`, proven above, is the real, nullable `Bundle` this visit
  actually carries; `.getString("mode")`, proven above, pulls the real
  string back out by the same key name used in `navArgument("mode")`;
  the `?:` — this project's own established nullable-fallback operator,
  evaluating its right side only when its left side is `null` — supplies
  `"Basic"` for the case where no value was ever stored under that key,
  keeping this function total instead of ever crashing on a missing
  argument.
- `navController.navigate("calculator/$mode")` — `CalculatorApp`'s own
  `home` route now builds the destination string using Kotlin's own
  string template syntax (already established since this project's
  earliest lessons), substituting whatever real mode string
  `onModeSelected` was called with directly into the route pattern —
  the same real `navigate(String)` method proven in Unit 1, now called
  with a genuinely dynamic string instead of a hardcoded literal.
- `fun CalculatorScreen(mode: String = "Basic")` — `CalculatorScreen`
  gains one new parameter, with a default value. The default matters for
  a real, concrete reason: ten existing call sites across this project's
  own tests already call `CalculatorScreen()` with no arguments at all,
  and every one of them keeps compiling and passing unchanged, since
  `"Basic"` is genuinely this project's only real mode today — not a
  speculative placeholder, the literal true default.
- `Text(text = mode, modifier = Modifier.testTag("modeTitle"))` — the
  same real `Text` function and `Modifier.testTag(String)` extension
  already proven throughout this project, here rendering whichever real
  `mode` string this screen was actually given, tagged so a test can
  find and assert on it directly.
- `navigatingFromHomePassesBasicAsRealModeArgument` — this unit's own new
  permanent test, built entirely from constructs already proven earlier
  in this project: `composeTestRule.setContent { CalculatorApp() }`
  (Unit 1), `onNodeWithText("Basic Calculator").performClick()` (Unit
  1), and `onNodeWithTag("modeTitle").assertTextEquals("Basic")` — the
  same finder-and-assert shape used throughout this project since Lesson
  1.4, here confirming the real argument value, not just that a click
  changed the display.

### CS Lens

Substituting a real value into a placeholder inside a larger string,
then parsing it back out on the receiving end, is the same
**parameterization** idea recognized anywhere a fixed template needs to
carry a variable payload: a URL's own path segment (`/users/{id}`)
works identically to `"calculator/{mode}"`; a SQL prepared statement's
own `?` placeholder, substituted at execution time; a format string
like `"Hello, %s"`, filled in with a real value before being shown.

```
Also recognized in: REST API path parameters, SQL prepared statements,
printf-style format strings, regular expression capture groups
```

### SE Lens

The alternative this unit could have reached for is a second, entirely
separate route — `"calculator-basic"` today, and, if a future lesson
ever adds Scientific or Matrix modes for real, `"calculator-scientific"`,
`"calculator-matrix"`, each its own hardcoded route string pointing at
its own hardcoded screen. That would technically work for exactly three
modes, known in advance. The real cost is that every new mode would mean
touching `CalculatorApp`'s own routing table again, adding a whole new
registered destination for what is, underneath, the exact same
`CalculatorScreen`. A single parameterized route — `"calculator/{mode}"`
— lets one registered destination legitimately serve as many real modes
as this app ever adds, at the cost of that one route's own type safety:
nothing at compile time stops a typo'd mode string from ever being
passed to `navigate(...)`, the same real debt Unit 1's own route strings
already carry.

### Commands Needed

No new commands beyond `./gradlew :app:testDebugUnitTest`, run once more
below alongside this project's complete suite.

### Run It

Real, executed this session — the full project suite, every test from
every lesson through this one:

```
BUILD SUCCESSFUL in 7s
43 actionable tasks: 12 executed, 31 up-to-date
```

The real, saved JUnit report for this unit's own new permanent test:

```xml
<testcase name="navigatingFromHomePassesBasicAsRealModeArgument"
  classname="com.example.calculator.NavigationTest" time="0.053"/>
```

This project now has 26 real, passing tests total — 22 carried over
unchanged from before this lesson, plus `NavigationTest.kt`'s own four
new ones. A real, complete `./gradlew :app:assembleDebug` alongside it
produced a real, installable `app-debug.apk`.

### Connect the Pieces

Unit 1 gave this app a second real screen and a real way to move to it;
Unit 2 proved moving backward is exactly as real, through the same
underlying back stack; this unit closes the last gap — the literal word
"Basic" a user actually taps now travels, as a real navigation argument,
from `HomeScreen`'s own button all the way to `CalculatorScreen`'s own
screen, displayed there for real, instead of two screens that happened
to agree on a hardcoded name with nothing actually connecting them.

---

## Connect the Pieces

Trace one real, complete run through everything this lesson built.
The app starts: `MainActivity`'s own `onCreate` calls `CalculatorApp()`,
which calls `rememberNavController()` (Unit 1) to build one real
`NavHostController`, then `NavHost` (Unit 1) shows `"home"`'s own
registered content — `HomeScreen` — since that's this graph's real
`startDestination`. The user sees "Choose a Calculator" and one real
button, "Basic Calculator." They tap it: `CalculatorButton`'s own
`onClick` calls `onModeSelected("Basic")` (Unit 3), which calls
`navController.navigate("calculator/Basic")` (Units 1 and 3 together) —
a real string, built by substituting `"Basic"` into the route template.
That call pushes a new entry onto the real back stack (Unit 2), matching
the registered pattern `"calculator/{mode}"`; `NavHost` swaps its
visible content to that destination's own registered lambda, which pulls
`"Basic"` back out of the real `NavBackStackEntry`'s own arguments (Unit
3) and calls `CalculatorScreen(mode = "Basic")`. The screen the user now
sees shows "Basic" as its own title, above the exact same real keypad
this project's own Basic calculator has always had. If they press back, `popBackStack()`
(Unit 2) removes that entry, and `NavHost` shows `"home"`'s content
again — the same `HomeScreen`, the same one real button, ready to be
tapped again. Three real, separate mechanisms — naming a screen,
remembering how you got there, and carrying a real value along the way
— working together as one real, continuous user action.
