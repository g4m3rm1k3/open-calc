# Lesson 1: The Application Shell — an Entry Point, Composable Screens, and Moving Between Them

**What you will build:** An Android project that runs and shows a real screen —
a "STEM Lab" home screen listing four placeholder application areas
(Instruments, Experiments, Data, Analysis), each of which navigates to its own
empty placeholder screen and back. Nothing scientific happens yet. The
transferable problem this lesson is actually about: how does an operating
system know what code to run the instant a user taps an app icon, how does a
screen get represented as *code* instead of a drawn picture, and how does an
app move between screens without the whole running process being thrown away
and restarted?

**What you need to know first:** Nothing — this is Lesson 1 of this
curriculum.

**Terms used in this lesson:**
- **Gradle build script** — a file (`build.gradle.kts`) that describes *how*
  to compile, package, and assemble a project; it's read and executed by the
  separate Gradle build tool, not by the Kotlin compiler. Without one, nothing
  in a multi-file Kotlin/Android project knows how the files relate to each
  other, what libraries to download, or what to produce.
- **Module** — an independently buildable unit inside a Gradle project. This
  project has exactly one so far, named `app`, declared in
  `settings.gradle.kts`. A module exists so a large project can eventually be
  split into independently-buildable pieces without becoming one unmanageable
  pile of files.
- **Android Manifest** — an XML file (`AndroidManifest.xml`) every Android
  app must ship. It is the one place the operating system looks, before
  running a single line of the app's own code, to find out what the app
  contains and which piece of it is allowed to be the starting point.
- **Intent filter (`<intent-filter>`)** — a block inside a manifest
  `<activity>` declaration stating what kinds of system requests that
  activity is willing to handle. This lesson uses exactly one purpose for it:
  declaring "I am the entry point."
- **`@Composable`** — an annotation marking a function as *describing a
  piece of UI* rather than performing an action and returning a value. A
  special compiler plugin (the Compose compiler, part of the Kotlin
  toolchain) reads this annotation and transforms the function so the
  Compose runtime can call it repeatedly and track what it produces —
  ordinary Kotlin function syntax with no annotation cannot do this; the
  annotation is what makes a function eligible to be treated as UI at all.
- **Composition** — the tree of UI elements produced by actually running a
  composable function. Distinct from the function itself: the function is
  code that exists once; the composition is data, rebuilt from that code,
  that can change every time something the UI depends on changes.
- **`sealed class`** — a class whose complete set of direct subclasses is
  known and fixed at compile time, inside the same file (or, since Kotlin
  1.5, the same package). It exists to let the compiler prove a piece of code
  has handled *every* possible case, something an open class or interface
  can never guarantee, because anyone, anywhere, could add another subclass
  of those.
- **Route** — a unique string key identifying one destination in a
  navigation graph. It exists because a navigation system needs some way to
  say "go to *that* screen" without holding a direct reference to a
  `Composable` function value.
- **Back stack** — the ordered history of destinations a navigation
  controller keeps, most-recent on top, so that "navigate back" has
  something concrete to pop and return to instead of just guessing which
  screen to show.

**Objects and methods used:**

- **`ComponentActivity`**
  - *What it is:* The modern Android base class an app's single entry-point
    class extends, when that app uses Jetpack Compose (as opposed to the
    older, XML-layout-oriented `AppCompatActivity`).
  - *Implementation:* `androidx.activity.ComponentActivity`, declared as
    `open class ComponentActivity : androidx.core.app.ComponentActivity(), ...`
    — it implements several owner interfaces (`LifecycleOwner`,
    `ViewModelStoreOwner`, `SavedStateRegistryOwner`) that later lessons in
    this curriculum depend on directly.
  - *Its use:* `MainActivity` in this lesson extends it to become a real,
    OS-launchable component.
  - *Type:* An open (extendable) class.
  - *Responsibility:* Owns exactly one Android app screen's lifecycle from
    the operating system's point of view — created, started, resumed,
    paused, stopped, destroyed — and gives Compose (and other modern Jetpack
    libraries) a real object to hook into for each of those states.
  - *Depends on:* Nothing the app has to supply directly; the Android OS
    itself constructs it, using the zero-argument constructor every Activity
    subclass must have.
  - *Connects to:* The OS calls its lifecycle methods (`onCreate`, and
    others this lesson doesn't touch yet); this lesson's own `onCreate`
    override calls `setContent` on it, handing control to Compose.
  - *Shape:* The outermost boundary between the Android OS and this
    application's own code — everything this app does starts by the OS
    calling into a subclass of this.

- **`setContent`**
  - *What it is:* The function that connects an Android `Activity` to
    Jetpack Compose — the bridge between the OS's older View-based world and
    Compose's newer declarative one.
  - *Implementation:* `fun ComponentActivity.setContent(parent: CompositionContext? = null, content: @Composable () -> Unit)`,
    declared in `androidx.activity.compose` (package `androidx.activity:activity-compose`).
    It is an **extension function** — a function that adds a new method to a
    class (`ComponentActivity`) without modifying that class's own source
    file, which is how Compose is able to add Compose-specific capability to
    a class it doesn't own.
  - *Its use:* `MainActivity.onCreate` calls it, passing a composable lambda
    that becomes the entire visible screen.
  - *Type:* A `static`-like top-level extension function (compiled as a
    static method taking `ComponentActivity` as its first, hidden parameter).
    It is not an object; it has no state of its own.
  - *Responsibility:* Creates a Compose `ComposeView`, attaches it as this
    Activity's one and only root Android `View`, and starts Compose's own
    composition process running the `content` lambda inside it.
  - *Depends on:* The `ComponentActivity` it's called on (the receiver), and
    a `content` lambda — the actual UI to run.
  - *Connects to:* Called once, from `onCreate`; internally hands `content`
    to the Compose runtime, which calls it again on its own, every time
    something that lambda reads changes.
  - *Shape:* The single seam in this entire project where the older,
    Activity-based Android framework hands off to the newer Compose UI
    system — everything on the Compose side of this call never has to know
    an `Activity` exists at all.

- **`Scaffold`**
  - *What it is:* A pre-built composable that lays out the standard
    "frame" pieces of a typical app screen — a top bar, an optional bottom
    bar, and a main content area — in the correct positions, accounting for
    system bars (status bar, navigation bar) automatically.
  - *Implementation:*
    ```kotlin
    @Composable
    fun Scaffold(
        modifier: Modifier = Modifier,
        topBar: @Composable () -> Unit = {},
        bottomBar: @Composable () -> Unit = {},
        floatingActionButton: @Composable () -> Unit = {},
        content: @Composable (PaddingValues) -> Unit
    )
    ```
    (`androidx.compose.material3.Scaffold`; several other real parameters —
    `snackbarHost`, `containerColor`, `contentWindowInsets` — exist but this
    lesson calls none of them, so they're omitted here.)
  - *Its use:* `HomeScreen` and `AreaScreen` both use it to get a top bar
    with no extra layout math.
  - *Type:* A `@Composable` function — not a class instantiated with `new`
    or `Scaffold()`-as-constructor; calling it *runs* layout code that emits
    other composables, every recomposition.
  - *Responsibility:* Reserve the correct screen regions for a top bar,
    optional bottom bar, and floating action button, and hand the *content*
    slot a `PaddingValues` describing exactly how much space is already
    consumed — so nothing this app places inside `content` draws underneath
    the top bar by accident.
  - *Depends on:* Composable lambdas for each slot it's given (`topBar`,
    `content`); slots not passed use their empty-lambda defaults and
    contribute no space.
  - *Connects to:* Called by `HomeScreen`/`AreaScreen`; in turn calls
    whatever composable lambda was passed for `topBar` and `content`,
    passing `content` the `PaddingValues` it computed.
  - *Shape:* A reusable structural layout, sitting at the top of every
    individual screen composable in this app — an internal building block,
    not something outside code calls directly.

- **`NavHost`**
  - *What it is:* The composable that owns and displays "whichever
    destination is currently active," swapping its displayed content when
    navigation happens.
  - *Implementation:*
    ```kotlin
    @Composable
    fun NavHost(
        navController: NavHostController,
        startDestination: String,
        modifier: Modifier = Modifier,
        builder: NavGraphBuilder.() -> Unit
    )
    ```
    (`androidx.navigation.compose.NavHost`, package
    `androidx.navigation:navigation-compose`.)
  - *Its use:* `StemLabApp` calls it once, and it's the only place in this
    app's code where "which screen is currently showing" gets decided.
  - *Type:* A `@Composable` function.
  - *Responsibility:* Own the navigation graph built by `builder`, track
    which destination is current, and recompose to show that destination's
    content whenever the current destination changes.
  - *Depends on:* A `NavHostController` to observe for navigation events,
    a `startDestination` route string naming which destination shows first,
    and a `builder` lambda that registers every possible destination.
  - *Connects to:* Reads state from the `navController` passed to it;
    calls whichever destination's own composable lambda (registered via
    `composable(...)` inside `builder`) matches the current route.
  - *Shape:* The single routing seam of the app — every screen this app
    will ever have gets registered here, in one place, rather than each
    screen deciding on its own how to reach any other screen.

- **`rememberNavController`**
  - *What it is:* The function that creates (or, across recompositions,
    reuses) the one `NavHostController` this app's navigation graph needs.
  - *Implementation:* `@Composable fun rememberNavController(vararg navigators: Navigator<out NavDestination>): NavHostController`,
    in `androidx.navigation.compose`.
  - *Its use:* `StemLabApp` calls it once, at the top of the composable
    tree, and passes the result into `NavHost`.
  - *Type:* A `@Composable` function (its name-prefix `remember` is a real,
    established Compose naming convention this lesson doesn't need to define
    fully yet — it means "survive recomposition without being rebuilt from
    scratch," which later lessons in this curriculum cover in full).
  - *Responsibility:* Construct exactly one `NavHostController` the first
    time this composable runs, and hand back that *same* instance on every
    later recomposition, rather than a fresh, empty one that would have
    forgotten the current destination.
  - *Depends on:* Nothing this lesson supplies; it can optionally take
    custom `Navigator` instances, unused here.
  - *Connects to:* Its result is passed into `NavHost` (which reads
    navigation state from it) and into every screen composable that needs to
    call `navigate` on it.
  - *Shape:* A one-line factory sitting at the very root of the composable
    tree — everything downstream shares the single controller it produces.

- **`NavController.navigate`**
  - *What it is:* The method that actually changes which destination is
    current, triggering `NavHost` to recompose with new content.
  - *Implementation:* `fun NavController.navigate(route: String, ...)` (a
    convenience overload; the class itself declares
    `open fun navigate(deepLink: Uri, ...)` and related overloads) — this
    lesson uses only the simplest `navigate(route: String)` form.
  - *Its use:* Each area card on the home screen calls
    `navController.navigate("area/$id")` in its `onClick`.
  - *Type:* An instance method on `NavController` (`NavHostController`
    extends `NavController`).
  - *Responsibility:* Push the given route onto the controller's back
    stack, making it the new current destination.
  - *Depends on:* A `route` string that must match one registered inside
    `NavHost`'s `builder` — an unmatched route is a real runtime failure
    this lesson does not trigger, since every route it calls is one it also
    registers.
  - *Connects to:* Called from a card's `onClick`; its effect is observed
    by `NavHost`, which recomposes to show the new destination.
  - *Shape:* The one call in this whole app that actually *causes*
    navigation — everything else in `NavHost` only reacts to it.

---

## Concept Unit: Declaring the Project and Its Entry Point

### The Problem

A phone's operating system does not know Kotlin, does not read source files,
and has no idea this project exists until something tells it, in a format
the OS itself understands: here is an installable app, here is what it's
called, and — critically — here is the *one* piece of code allowed to run
the instant a user taps its icon. Before a single `fun main()`-style entry
point can exist, something has to answer three separate questions: what
files make up this project and how do they get compiled together, what does
the finished app call itself, and which class is the OS allowed to start.

Think about what you already know from typing a plain Kotlin `fun main()` at
a terminal: how did `kotlinc`/`kotlin` know which function to call first,
out of every function in the file? What told it *that*? Now imagine dozens of
classes across dozens of files, packaged for a phone instead of a terminal,
with no terminal to type a command into at all — what has to exist instead
of a command, and who reads it?

### Introduce the Concept in Isolation

This concept can't be meaningfully isolated in throwaway Kotlin code the way
a language feature can — a build script and a manifest are not Kotlin at
all, and their only real behavior is "the build tool that reads this
produces a working app," which requires that build tool and an Android SDK
to observe. This lesson states plainly, rather than fabricating a fake
run: **the three files below are shown as real, complete artifacts, and
their combined effect — a launchable app — is described from confident,
accurate knowledge of what each field does, not from an execution performed
this session.** Building and running this project is a step for you to do
yourself, in Android Studio, once every file below exists.

`settings.gradle.kts` — declares which modules exist:

```kotlin
rootProject.name = "StemLab"
include(":app")
```

`app/build.gradle.kts` — declares how the `app` module is built:

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.stemlab.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.stemlab.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation("androidx.compose.material3:material3:1.2.1")
    implementation("androidx.navigation:navigation-compose:2.7.7")
}
```

`app/src/main/AndroidManifest.xml` — declares the app's identity and entry
point:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="STEM Lab">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

Predicted result of running `./gradlew assembleDebug` against these three
files plus the `MainActivity` this lesson builds next: a successful build
producing an installable `.apk`, because every field above is syntactically
and semantically valid for Android Gradle Plugin 8.x — stated from
confidence in these APIs' documented contracts, not from an execution this
session actually performed; no Android SDK is available in this authoring
environment. Run this yourself once the full project exists, and confirm a
successful build with no errors.

Read the manifest closely: `android:name="android.intent.action.MAIN"` says
"I can be a program's starting point"; `android:name="android.intent.category.LAUNCHER"`
says "and specifically, put an icon for me on the home screen." Both are
required together — an activity could declare `MAIN` for some other purpose
without wanting a launcher icon at all, so Android keeps them as two
separate, independently-statable facts rather than one combined flag.

### Discard the Throwaway Examples

Nothing here is throwaway — unlike every later Concept Unit in this
curriculum, `settings.gradle.kts`, `app/build.gradle.kts`, and
`AndroidManifest.xml` are permanent project files, not disposable labs. This
unit is the one deliberate exception to the Concept Isolation Rule's
"discard it" step, because there is no meaningful "isolated version" of a
build script separate from the real one — the file *is* the concept.

### Project Change

- **Reference Source:** No reference counterpart — this is a from-scratch
  addition. This curriculum has no pre-existing app it is porting; every
  file is authored directly from `src/docs/projects/MobileStem/curriculum.md`'s
  own lesson-1 description ("Application shell, home screen, navigation,
  major application areas").
- **Files affected:** Created — `settings.gradle.kts`, `app/build.gradle.kts`,
  `app/src/main/AndroidManifest.xml`.
- **Change type:** Add (brand-new project).
- **Location:** Project root for `settings.gradle.kts`; `app/` module root
  for `build.gradle.kts`; `app/src/main/` for the manifest.
- **Dependencies:** Android Studio (or the Android SDK command-line tools)
  and a JDK, to actually run `./gradlew` yourself.

### The New Code

The three files above, in full, are the New Code for this unit — there is
no smaller fragment to isolate further; a build script and a manifest are
each already the smallest complete, meaningful thing they can be.

### The Updated Project

This is a brand-new file set with nothing surrounding it yet — Project
Change already covers this case (a brand-new file has nothing to locate a
position within), so this step is skipped per the schema's own exemption for
that situation.

### Mechanical Walkthrough

Enumerating every distinct element across all three files, in order:

- `rootProject.name = "StemLab"` — a Gradle property assignment, setting the
  human-readable name of the entire multi-module project (distinct from any
  individual module's name).
- `include(":app")` — a Gradle DSL function call registering `:app` as a
  module Gradle should actually build; without this line, the `app/` folder
  would exist on disk but Gradle would never look inside it.
- `plugins { ... }` — a Gradle DSL block; each `id(...)` call inside it
  applies one Gradle plugin, which is what teaches Gradle how to build a
  specific kind of project (an Android app, in this case) instead of Gradle's
  own generic defaults.
- `id("com.android.application")` — the Android Gradle Plugin's
  application-module plugin; it's what makes `android { ... }` a recognized
  block at all and what produces an installable `.apk` as this module's
  output (as opposed to `com.android.library`, which produces a reusable
  library instead).
- `id("org.jetbrains.kotlin.android")` — the Kotlin Android Gradle plugin;
  it teaches Gradle to compile `.kt` files for the Android runtime
  specifically, using the Kotlin compiler.
- `android { ... }` — a configuration block the Android Gradle Plugin adds;
  everything inside it configures Android-specific build behavior.
- `namespace = "com.stemlab.app"` — declares the base Kotlin/Java package
  this module's generated code lives under; it is a build-time configuration
  value, not a line of Kotlin code itself.
- `compileSdk = 34` — the version of the Android SDK's API surface this
  module is compiled against; code can reference any API added up to and
  including this API level.
- `defaultConfig { ... }` — a nested block holding per-build-variant
  defaults.
- `applicationId = "com.stemlab.app"` — the unique identifier the Play
  Store and the Android OS itself use to distinguish this app from every
  other installed app; it can differ from `namespace` (it doesn't here), but
  both exist for genuinely separate reasons — `namespace` is a compile-time
  Kotlin/Java concern, `applicationId` is a runtime/distribution identity
  concern.
- `minSdk = 26` — the oldest Android API level this app will install on;
  the OS itself refuses installation on any device below this, which is why
  it's a build declaration and not a runtime check this app's own code has
  to perform.
- `targetSdk = 34` — the API level this app was explicitly tested and
  designed against; unlike `compileSdk`, this affects real runtime behavior
  compatibility switches the OS applies.
- `versionCode = 1` / `versionName = "1.0"` — an internal, always-increasing
  integer identity for updates (`versionCode`) and a human-readable label
  (`versionName`); the OS and app stores use the integer to decide "is this
  newer," never the string.
- `buildFeatures { compose = true }` — turns on Compose support for this
  module specifically; without this flag, the `@Composable` annotation used
  everywhere in this lesson would not compile, because the Compose compiler
  plugin would never run against this module's code.
- `dependencies { ... }` — declares external libraries this module needs;
  each `implementation(...)` call adds one library, available to this
  module's own code but not automatically exposed to any module that
  depends on this one (a stricter alternative, `api(...)`, does expose it —
  unused here).
- `"androidx.activity:activity-compose:1.9.0"` — a Gradle dependency
  coordinate: group `androidx.activity`, artifact `activity-compose`,
  version `1.9.0`; this specific artifact is what supplies `setContent`.
- `"androidx.compose.material3:material3:1.2.1"` — supplies `Scaffold` and
  every other Material Design 3 composable this curriculum will use.
- `"androidx.navigation:navigation-compose:2.7.7"` — supplies `NavHost`,
  `rememberNavController`, and Compose-specific navigation support.
- `<manifest xmlns:android="...">` — the manifest's root XML element; the
  `xmlns:android` attribute declares the `android:` prefix used throughout
  the file as shorthand for Android's own XML attribute namespace.
- `<application android:label="STEM Lab">` — declares one real, installed
  application; `android:label` is the human-readable name shown under the
  home-screen icon and in the system's running-apps list.
- `<activity android:name=".MainActivity" android:exported="true">` — this
  tag is its own artifact, separate from the `MainActivity` Kotlin class it
  names (per this curriculum's own schema rule on declarations vs. the
  classes they wire to): `android:name=".MainActivity"` is a **leading-dot
  package shorthand** meaning "the class named `MainActivity`, inside the
  package this manifest's own `namespace`/package root already established"
  — writing the full `com.stemlab.app.MainActivity` would also work, but the
  shorthand exists specifically to avoid repeating the package name in every
  single component tag. `android:exported="true"` is a required, explicit
  declaration (as of Android 12) that this activity may be launched by
  components *outside* this app — the home screen launcher is exactly such
  an outside component, so without this attribute set true, tapping the icon
  would fail at the OS level with a security exception, never reaching this
  app's own code at all.
- `<intent-filter>` — declares a set of Intent capabilities this activity
  will accept; its own presence, apart from what's inside it, is what makes
  an activity launchable from outside the app at all — an `<activity>` with
  no `<intent-filter>` still exists and can be started by other code inside
  the same app, but never appears as a launchable entry point.
- `<action android:name="android.intent.action.MAIN">` — declares "I can be
  a program's starting point," independent of any launcher icon.
- `<category android:name="android.intent.category.LAUNCHER">` — declares
  "and specifically, show a home-screen icon for me," independent of being a
  valid starting point; Android keeps these as two separate, independently
  statable facts (as walked through above) rather than one combined flag,
  because other legitimate `MAIN`-only activities exist (for example, ones
  started only by other apps) that should never get their own icon.

### CS Lens

This is a real instance of **declarative configuration** — describing *what*
the finished system should contain and be capable of, rather than writing
imperative, step-by-step code that builds it up by hand
(`registerActivity(MainActivity::class)`, `setEntryPoint(...)`, and so on).
The Android OS and Gradle read these declarations and do the imperative work
themselves, entirely hidden from this app's own code.

Also recognized in: a `Dockerfile` or Kubernetes YAML declaring what a
container should contain rather than scripting its setup step by step; a
`package.json`'s `"main"` field; a `.desktop` file on Linux declaring an
application's launcher entry; a `pom.xml` or `Cargo.toml` declaring a
project's dependencies and build behavior the same way this Gradle script
does.

### SE Lens

**Why declare all of this in separate config files instead of just writing
Kotlin code that does the equivalent setup?** The real alternative — a
hypothetical imperative "bootstrap" function running before any of this
app's real logic — was not chosen, and the tradeoff is concrete: the
Android OS has to know an app's entry point and permissions *before*
running any of that app's own code at all, specifically so it can enforce
security and installation rules (like `minSdk` and `exported`) without
trusting the app to self-report them honestly at runtime. The real cost this
project pays: two entirely different syntaxes (Kotlin DSL for Gradle, XML
for the manifest) have to be kept consistent by hand — the `namespace` in
`build.gradle.kts` and the implied package root behind `.MainActivity` in
the manifest must actually agree, and nothing in either file's own syntax
catches it if they don't; that mismatch surfaces only as a build or runtime
failure.

---

## Concept Unit: The First Composable Function — UI as Code, Not a Drawn Picture

### The Problem

Older Android UI was authored as static XML layout files, describing a fixed
tree of views. Compose takes a different position: what if a screen's
structure were just an ordinary function, written in the same language as
everything else, that could use real `if` statements, real loops, and real
function calls to decide what to show — instead of a separate, static markup
language with none of that? What would a function have to promise, and what
would have to be different about it compared to an ordinary Kotlin function,
for a UI framework to trust it enough to call it *repeatedly*, on demand,
whenever something changes?

### Introduce the Concept in Isolation

This concept genuinely cannot be demonstrated in bare `kotlinc`-compiled
Kotlin, because `@Composable` only means something to the separate Compose
compiler plugin, which requires the Compose runtime library and Android
Gradle Plugin to be present — the exact setup the previous unit just
declared. The code below is shown in full, with its real, predicted
behavior stated from confident, accurate knowledge of Compose's documented
contract, explicitly **not** dressed as a real execution:

```kotlin
@Composable
fun Greeting() {
    Text("STEM Lab")
}
```

Predicted result once this runs inside a real Compose hierarchy (via
`setContent`, the next unit's subject): a single line of text reading
"STEM Lab" appears on screen, styled with Compose's default text
appearance. This is confidently predictable — `Text` is a simple, one-job
composable with no platform-dependent quirks in this basic case — but it is
still a prediction, not a screenshot from an execution this session
performed; there is no Android SDK available here to actually run it.

Notice what's absent compared to an ordinary function: no `return`
statement, and the function's declared return type is implicitly `Unit`.
`Greeting` doesn't hand back a `View` object or any other value describing
what to draw — it directly *calls* `Text(...)`, which is itself a
`@Composable` function. This is called **composition**: rather than
building and returning a UI *value*, a composable function's real effect is
each nested composable call it makes, which the Compose runtime observes and
assembles into the tree of UI actually shown. `Greeting` calling `Text(...)`
*is* how `Greeting` says "show this text" — there is no separate return
value carrying that information.

### Discard the Throwaway Example

`Greeting` is deleted; it exists only to isolate what `@Composable` and a
composable-calling-a-composable actually mean before this lesson's real
`HomeScreen` needs both at once, combined with several other new ideas.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  same as the previous unit.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/MainActivity.kt`.
- **Change type:** Add.
- **Location:** New file, in the package `com.stemlab.app` this lesson's
  manifest and `namespace` already declared.
- **Dependencies:** The Gradle module set up in the previous unit
  (specifically, `activity-compose` and `material3`, already declared as
  dependencies there).

### The New Code

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            HomeScreen()
        }
    }
}
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet — Project Change
already covers this case, so, per the schema's own stated exemption, this
step is skipped.

### Mechanical Walkthrough

- `class MainActivity : ComponentActivity()` — an ordinary Kotlin class
  declaration; `: ComponentActivity()` means `MainActivity` **extends**
  `ComponentActivity`, inheriting everything that class provides (its
  lifecycle handling, its owner interfaces) and becoming, itself, a valid
  Activity the manifest's `.MainActivity` reference can point at.
- `override fun onCreate(savedInstanceState: Bundle?)` — overrides
  `ComponentActivity`'s own `onCreate` method, which the Android OS calls
  exactly once, the very first time this Activity is created; `Bundle?` is
  a nullable `Bundle` (an Android key-value container for saved state) —
  nullable because on a truly fresh launch, there is no previous state to
  restore, so the OS passes `null`.
- `super.onCreate(savedInstanceState)` — calls `ComponentActivity`'s own
  `onCreate` implementation before doing anything else; skipping this call
  is a real, common source of crashes, because `ComponentActivity`'s base
  implementation does real setup work (wiring up its lifecycle, its saved
  state registry) this subclass depends on existing before it does its own
  work.
- `setContent { HomeScreen() }` — calls the `setContent` extension function
  (explained in full above), passing a trailing lambda as its `content`
  parameter; **trailing lambda syntax** places a function's final lambda
  parameter outside the parentheses, which is why this reads as
  `setContent { ... }` rather than `setContent({ ... })` — both compile to
  the identical call, but Kotlin's trailing-lambda convention is what makes
  `setContent { ... }` read like a built-in language block instead of an
  ordinary function call with an odd-looking argument.
- `HomeScreen()` — a call to a composable function this lesson defines
  next; calling it here, inside the `content` lambda, is what makes it the
  actual root of this app's visible UI.

### CS Lens

Composable functions are a real instance of the **declarative UI**
paradigm: describe *what* the UI should look like for the current state, and
let a runtime (here, Compose's own recomposition engine) figure out *how* to
get the actual screen from its previous state to match, rather than writing
manual, imperative "create this view, then update that property, then move
this element" instructions by hand.

Also recognized in: React and SwiftUI (both explicit, acknowledged
inspirations for Compose's own design), HTML itself (a declarative
description of a document a browser renders), and SQL (declaring *what*
rows are wanted, leaving the database to decide *how* to fetch them).

### SE Lens

**Why does Compose require a special compiler plugin instead of making
`@Composable` an ordinary annotation any code could inspect at runtime?**
The alternative — reading `@Composable` via reflection at runtime, the way
some older Java frameworks read annotations — was not chosen, because
Compose's actual performance model depends on knowing, at *compile* time,
exactly what each composable function reads, so recomposition can skip
re-running functions whose inputs haven't changed. A runtime-reflection
approach could never get that guarantee cheaply enough to run on every
frame. The real cost this project pays: a `@Composable` function can only be
called from inside another `@Composable` function (or a small set of
special Compose entry points, like the lambda passed to `setContent`) —
the compiler enforces this and will refuse to build otherwise — which
means composable and non-composable code can't be freely mixed the way two
ordinary functions could.

---

## Concept Unit: Scaffold — a Screen's Standard Frame

### The Problem

`HomeScreen` needs a title bar reading "STEM Lab" and a content area below
it that never overlaps the phone's status bar. Every screen this whole
curriculum ever builds will need broadly the same frame. Should each screen
manually calculate how much space a title bar and the system's own status
bar consume, by hand, every time — or does something already exist to
answer "where does my actual content safely start"?

### Introduce the Concept in Isolation

Same honesty note as the previous unit: this cannot run in bare `kotlinc`,
and the result below is a confident, accurate prediction of Compose
Material3's documented behavior, not a real screenshot from an execution
this session performed.

```kotlin
@Composable
fun ScaffoldDemo() {
    Scaffold(
        topBar = { TopAppBar(title = { Text("Demo") }) }
    ) { innerPadding ->
        Text("Body text", modifier = Modifier.padding(innerPadding))
    }
}
```

Predicted result: a screen with a title bar reading "Demo" pinned to the
top, and "Body text" appearing directly below it, never underneath it —
because `innerPadding`, the `PaddingValues` `Scaffold` hands its `content`
lambda, already accounts for exactly how tall the `topBar` slot turned out
to be, and `Modifier.padding(innerPadding)` applies that space to `Text`.
Remove `Modifier.padding(innerPadding)` mentally and predict what would
happen instead: "Body text" would be drawn starting from the screen's true
top edge, underneath the title bar, partially or fully hidden by it — this
is exactly the manual calculation the previous paragraph asked whether a
screen should have to do by hand, and `Scaffold` exists specifically so it
never has to.

### Discard the Throwaway Example

`ScaffoldDemo` is deleted. `Scaffold` itself is not — it becomes the root
composable of both `HomeScreen` and `AreaScreen`, below.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified —
  `app/src/main/java/com/stemlab/app/MainActivity.kt`.
- **Change type:** Add (a new top-level composable function, in the same
  file `MainActivity` already lives in).
- **Location:** Below the `MainActivity` class already written.
- **Dependencies:** None beyond what the project already declares.

### The New Code

```kotlin
@Composable
fun HomeScreen() {
    Scaffold(
        topBar = { TopAppBar(title = { Text("STEM Lab") }) }
    ) { innerPadding ->
        Text(
            text = "Choose an area",
            modifier = Modifier.padding(innerPadding)
        )
    }
}
```

### The Updated Project

`MainActivity.kt` now contains both the Activity from the previous unit and
this new top-level function, in full:

```kotlin
 1  class MainActivity : ComponentActivity() {
 2      override fun onCreate(savedInstanceState: Bundle?) {
 3          super.onCreate(savedInstanceState)
 4          setContent {
 5              HomeScreen()
 6          }
 7      }
 8  }
 9
10  @Composable
11  fun HomeScreen() {                                          // ← new
12      Scaffold(                                               // ← new
13          topBar = { TopAppBar(title = { Text("STEM Lab") }) } // ← new
14      ) { innerPadding ->                                      // ← new
15          Text(                                                // ← new
16              text = "Choose an area",                         // ← new
17              modifier = Modifier.padding(innerPadding)        // ← new
18          )                                                    // ← new
19      }                                                        // ← new
20  }                                                             // ← new
```

`MainActivity.onCreate`'s call to `HomeScreen()` on line 5 now has a real
function to call: this file went from "an Activity that calls a function
that doesn't exist yet" to "an Activity whose composed screen is a title bar
reading 'STEM Lab' over the text 'Choose an area.'"

### Mechanical Walkthrough

- `Scaffold(topBar = { ... }) { innerPadding -> ... }` — this call uses two
  separate pieces of trailing-lambda-like syntax at once: `topBar = { ... }`
  is an ordinary **named argument**, passing a lambda by name inside the
  parentheses (necessary because `topBar` isn't `Scaffold`'s *last*
  parameter, so it can't use trailing-lambda position); the
  `{ innerPadding -> ... }` block after the closing `)` is the real trailing
  lambda, filling `Scaffold`'s final `content` parameter.
- `TopAppBar(title = { Text("STEM Lab") })` — a Material3 composable this
  lesson doesn't call any other member of and that receives no compound
  value beyond a single lambda, so per this schema's own usage-shape rule
  it needs no separate declared-shape block beyond this walkthrough note:
  it renders a standard top bar; its `title` slot is itself a composable
  lambda (not a plain `String`) specifically so a title can be any
  arbitrary composable content, not only text.
- `{ innerPadding -> ... }` — a lambda with one explicitly named parameter,
  `innerPadding`, of type `PaddingValues` (inferred from `Scaffold`'s own
  `content: @Composable (PaddingValues) -> Unit` signature); naming it
  explicitly, rather than using Kotlin's implicit single-parameter `it`, is
  a deliberate readability choice here, since `it` would give no hint what
  the value actually represents.
- `Text(text = "Choose an area", modifier = Modifier.padding(innerPadding))`
  — `Text` is called with two named arguments: `text`, the literal string
  to display, and `modifier`, discussed next.
- `Modifier` — (Terms-eligible, but tightly coupled to this specific call,
  so explained here): an immutable, chainable object describing how a
  composable should be measured, laid out, drawn, or behave — `Modifier` on
  its own (as used here) is the empty starting point with no behavior added
  yet; `.padding(innerPadding)` is a real extension function on `Modifier`
  that returns a *new* `Modifier` with padding added, rather than mutating
  anything, matching Kotlin's general preference for immutable value types
  over in-place mutation.
- `.padding(innerPadding)` — an extension function on `Modifier`, overloaded
  to accept either individual `Dp` values per edge or, as used here, one
  `PaddingValues` instance covering all four edges at once — exactly the
  value `Scaffold` computed and handed this lambda.

### CS Lens

`Scaffold` is a real instance of the **template method** pattern: it
defines the fixed skeleton of an algorithm (where a top bar goes, where
content goes, how much space each consumes) while leaving specific steps
(what the top bar actually contains, what the content actually is) as
parameters supplied by the caller.

Also recognized in: `AbstractList`'s inherited `iterator()` behavior built
from a caller-supplied `get(index)`; a web framework's page layout template
with named content blocks a specific page fills in; a recipe's fixed steps
("preheat, combine, bake") with ingredients as the caller-supplied
variation.

### SE Lens

**Why does `Scaffold` take composable lambdas for each slot instead of, say,
a `title: String` parameter directly?** The simpler alternative — a plain
`String` title parameter — was not chosen, because it would only work for
plain-text titles; the real Material Design spec allows a title area to
contain other composables (an icon plus text, for instance), and a
`String`-only API could never express that without a second, incompatible
parameter added later. The cost of the lambda-slot approach actually chosen:
every call site has to write `{ Text("...") }` instead of a bare string
literal for the ordinary, common case — more ceremony for the 90% case, in
exchange for the 10% case never requiring a breaking API change.

---

## Concept Unit: Modeling a Closed Set of Areas With a Sealed Class

### The Problem

This app needs exactly four application areas right now — Instruments,
Experiments, Data, Analysis — and every one of them needs the same three
facts: a stable identity to navigate by, a human-readable label, and
(eventually) an icon. Hardcoding four separate `Text("Instruments")`,
`Text("Experiments")`, and so on directly inside `HomeScreen`, with the
navigation logic for each written out by hand right next to it, means the
UI code and the *list of what areas even exist* are the same code — nothing
else in this app, and no future lesson, could ask "what areas are there"
without re-reading `HomeScreen`'s own layout logic. Is there a way to
represent "the exhaustive list of application areas" as data, separately
from the UI that happens to display it right now?

Before reading on: given what a Kotlin `enum class` already lets you do
(fixed, named, exhaustive cases), what would you try first for "four fixed,
named things, each carrying a couple of extra fields"? What starts to go
wrong if a fifth area later needs a genuinely different *shape* of data
than the other four?

### Introduce the Concept in Isolation

```kotlin
sealed class Shape {
    data class Circle(val radius: Double) : Shape()
    data class Rectangle(val width: Double, val height: Double) : Shape()
}

fun area(shape: Shape): Double = when (shape) {
    is Shape.Circle -> Math.PI * shape.radius * shape.radius
    is Shape.Rectangle -> shape.width * shape.height
}

fun main() {
    println(area(Shape.Circle(2.0)))
    println(area(Shape.Rectangle(3.0, 4.0)))
}
```

Compile and run:

```
kotlinc Shapes.kt -include-runtime -d Shapes.jar
java -jar Shapes.jar
```

Real output, from running this just now:

```
12.566370614359172
12.0
```

This proves the actual point: comment out either `is Shape.Circle -> ...`
or `is Shape.Rectangle -> ...` and try to recompile — the Kotlin compiler
refuses, with a real, genuine compile error (`'when' expression must be
exhaustive`), because a `sealed class`'s subclasses are a **closed set**:
every one of them is declared inside the same file (or package), so the
compiler can enumerate them completely and prove a `when` with no `else`
branch has truly covered every case. An ordinary open class or interface
could never give this guarantee — any other file, anywhere, could define a
new subclass the `when` never saw. This is called a **sealed class**, and
`Circle`/`Rectangle` each carry genuinely different fields (`radius` vs.
`width`/`height`) — something a plain `enum class` cannot do at all, since
every enum constant of the same enum shares one identical set of properties.

### Discard the Throwaway Example

`Shape`, `Circle`, `Rectangle`, and `area` are all deleted. The distinction
just proven — a sealed class gives a *closed, compiler-checked* set of
cases, unlike an enum's identical-shape constants or an open class's
unlimited subclasses — is what `StemArea` reuses next.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Created —
  `app/src/main/java/com/stemlab/app/StemArea.kt`.
- **Change type:** Add.
- **Location:** New file, same package.
- **Dependencies:** None.

### The New Code

```kotlin
sealed class StemArea(val id: String, val label: String) {
    object Instruments : StemArea("instruments", "Instruments")
    object Experiments : StemArea("experiments", "Experiments")
    object Data : StemArea("data", "Data")
    object Analysis : StemArea("analysis", "Analysis")

    companion object {
        val all = listOf(Instruments, Experiments, Data, Analysis)
    }
}
```

### The Updated Project

This is a brand-new file with nothing surrounding it yet, so, per the
schema's own stated exemption for that case, this step is skipped.

### Mechanical Walkthrough

- `sealed class StemArea(val id: String, val label: String)` — declares a
  sealed class with a real **primary constructor** taking two `val`
  parameters; because they're declared `val` directly in the constructor,
  they automatically become real, readable properties of every instance —
  `StemArea.Instruments.label` works with no extra code needed.
- `object Instruments : StemArea("instruments", "Instruments")` — each area
  is declared as an **`object`**, not a `class`: `object` declares a
  singleton — exactly one instance of that type is ever created, by the
  Kotlin runtime, the first time it's referenced, and every reference to
  `Instruments` anywhere in the program refers to that same single
  instance. This is the correct choice here specifically because there is
  never a legitimate reason for two different "Instruments" areas to exist
  simultaneously — unlike `Circle` in the lab above, which needed a genuine
  `data class` because many different circles, with different radii, are
  meaningful.
  `: StemArea("instruments", "Instruments")` calls the sealed class's own
  primary constructor, supplying this object's fixed `id` and `label`.
- `companion object { val all = listOf(...) }` — a **companion object**
  attaches members directly to the `StemArea` class itself, reachable as
  `StemArea.all`, rather than requiring an instance to reach them (there
  would be no sensible single "instance" of `StemArea` to attach `all` to
  anyway, since `StemArea` itself is never directly instantiated — only its
  four `object` subclasses are). `listOf(...)` builds an ordinary, immutable
  Kotlin `List` containing all four singleton instances, in the order
  they're meant to display.

### CS Lens

This is the real **sum type** (also called a tagged union or algebraic
data type) pattern: a value that is *exactly one* of a fixed, enumerable
set of alternatives, each of which may carry different data, checked
exhaustively by the compiler.

Also recognized in: Rust's `enum`, Swift's `enum` with associated values,
Haskell's `data` declarations, TypeScript's discriminated unions, and —
inside this very curriculum's own future lessons on `sealed class` and
`sealed interface` for navigation routes and UI result states.

### SE Lens

**Why a `sealed class` of singleton `object`s, instead of a plain Kotlin
`enum class StemArea(val id: String, val label: String)`?** An `enum class`
was the real alternative, and for exactly these four areas — all sharing
one identical `(id, label)` shape — it would work today. It was not chosen
because this curriculum's own outline (Lesson 4, ahead of this one) already
commits to areas that later carry genuinely different per-area data and
behavior (a registry of dynamically-registered experiments per area, for
instance) — a `sealed class` can grow individual `object`s (or, later,
`data class`es) with different shapes, field for field, while an `enum
class` locks every constant into the exact same shape forever. The cost
paid today, for that future flexibility: more declaration ceremony right
now (`object Instruments : StemArea(...)` four times) than
`Instruments("instruments", "Instruments")` would have needed as a bare
enum constant.

---

## Concept Unit: Navigating Between Screens — NavHost, NavController, and Routes

### The Problem

`HomeScreen` needs to show all four `StemArea`s and, when one is tapped,
switch to a screen for that specific area — and switching back needs to
return to exactly where the user left off, not restart the whole app.
Nothing built so far can do this: `MainActivity.onCreate` calls
`HomeScreen()` exactly once, and Compose has no built-in idea of "screen A"
versus "screen B" without something to track which one is current.

Given that `setContent` only ever gets called once, in `onCreate`, and
recomposition already re-runs a composable function whenever something it
reads changes: what single piece of state, if it changed, could make the
*same* one root composable call produce entirely different content each
time?

### Introduce the Concept in Isolation

Same honesty note as the Compose units above — this requires the Compose
runtime and cannot run in bare `kotlinc`; the predicted result below is
stated from confident, accurate knowledge of `navigation-compose`'s
documented contract.

```kotlin
@Composable
fun NavDemo() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "first") {
        composable("first") {
            Button(onClick = { navController.navigate("second") }) {
                Text("Go to second")
            }
        }
        composable("second") {
            Text("You made it")
        }
    }
}
```

Predicted result: on first showing `NavDemo`, a single button reading "Go to
second" appears (because `startDestination = "first"` matches the first
`composable("first") { ... }` block). Tapping it calls
`navController.navigate("second")`; `NavHost` reacts to the controller's
change in current destination and recomposes, this time matching
`composable("second") { ... }`, replacing the button with the text "You made
it."

Notice precisely what changed and what didn't: `NavDemo` itself was never
called again from scratch, and neither was `MainActivity.onCreate` — the
*same* running `NavHost` call simply recomposed with different content,
because `navController`'s own internal current-destination state changed.
This is the answer to this unit's own question above: `navController`'s
current destination is exactly the "single piece of state" whose change is
enough to make one root composable produce entirely different content,
without ever tearing down and restarting the app.

### Discard the Throwaway Example

`NavDemo` is deleted. `NavHost`, `rememberNavController`, `composable`, and
`navigate` are not — they're reused directly, next, in `StemLabApp`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** Modified —
  `app/src/main/java/com/stemlab/app/MainActivity.kt` (add `StemLabApp` and
  `AreaScreen`; change `onCreate` to call `StemLabApp()` instead of
  `HomeScreen()` directly; change `HomeScreen` to accept an `onAreaClick`
  callback and actually list the four areas).
- **Change type:** Refactor (`onCreate`, `HomeScreen`) and add
  (`StemLabApp`, `AreaScreen`).
- **Location:** `onCreate`'s body; a new function below `HomeScreen`; a new
  `AreaScreen` function below that.
- **Dependencies:** `StemArea` from the previous unit.

### The New Code

```kotlin
@Composable
fun StemLabApp() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onAreaClick = { area -> navController.navigate("area/${area.id}") }
            )
        }
        composable("area/{areaId}") { backStackEntry ->
            val areaId = backStackEntry.arguments?.getString("areaId")
            val area = StemArea.all.first { it.id == areaId }
            AreaScreen(area = area)
        }
    }
}
```

### The Updated Project

`MainActivity.kt`, in full, after this unit's change:

```kotlin
 1  class MainActivity : ComponentActivity() {
 2      override fun onCreate(savedInstanceState: Bundle?) {
 3          super.onCreate(savedInstanceState)
 4          setContent {
 5              StemLabApp()                                       // ← changed: was HomeScreen()
 6          }
 7      }
 8  }
 9
10  @Composable
11  fun StemLabApp() {                                              // ← new
12      val navController = rememberNavController()                 // ← new
13      NavHost(navController = navController, startDestination = "home") { // ← new
14          composable("home") {                                     // ← new
15              HomeScreen(                                          // ← new
16                  onAreaClick = { area -> navController.navigate("area/${area.id}") } // ← new
17              )                                                     // ← new
18          }                                                        // ← new
19          composable("area/{areaId}") { backStackEntry ->           // ← new
20              val areaId = backStackEntry.arguments?.getString("areaId") // ← new
21              val area = StemArea.all.first { it.id == areaId }     // ← new
22              AreaScreen(area = area)                               // ← new
23          }                                                        // ← new
24      }                                                            // ← new
25  }
26
27  @Composable
28  fun HomeScreen(onAreaClick: (StemArea) -> Unit) {                // ← changed: added parameter
29      Scaffold(
30          topBar = { TopAppBar(title = { Text("STEM Lab") }) }
31      ) { innerPadding ->
32          Column(modifier = Modifier.padding(innerPadding)) {       // ← changed: Text → Column of areas
33              StemArea.all.forEach { area ->                        // ← new
34                  Text(                                              // ← new
35                      text = area.label,                             // ← new
36                      modifier = Modifier
37                          .fillMaxWidth()
38                          .clickable { onAreaClick(area) }
39                          .padding(16.dp)
40                  )                                                  // ← new
41              }                                                     // ← new
42          }                                                         // ← new
43      }
44  }
45
46  @Composable
47  fun AreaScreen(area: StemArea) {                                 // ← new
48      Scaffold(                                                    // ← new
49          topBar = { TopAppBar(title = { Text(area.label) }) }      // ← new
50      ) { innerPadding ->                                           // ← new
51          Text(                                                    // ← new
52              text = "${area.label} — coming soon",                 // ← new
53              modifier = Modifier.padding(innerPadding)              // ← new
54          )                                                         // ← new
55      }                                                             // ← new
56  }
```

`MainActivity` itself is now unchanged in behavior from the reader's point
of view except for what it hands to `setContent`: instead of one fixed
screen, it now roots an entire navigable graph. Tapping the app icon still
does exactly one thing — call `onCreate`, call `setContent` — but what's
inside `setContent` now owns its own internal navigation entirely, with no
further involvement from `MainActivity` at all.

### Mechanical Walkthrough

- `val navController = rememberNavController()` — as explained in full in
  the Header, above; creates (or reuses, across recomposition) the one
  controller this graph needs.
- `NavHost(navController = navController, startDestination = "home") { ... }`
  — as explained in full in the Header; `"home"` is the route shown first.
- `composable("home") { HomeScreen(...) }` — `composable` is a function
  (extension on `NavGraphBuilder`, called inside `NavHost`'s trailing
  `builder` lambda) registering one route (`"home"`) and the composable
  content to show for it.
- `onAreaClick = { area -> navController.navigate("area/${area.id}") }` —
  a lambda literal passed as `HomeScreen`'s new `onAreaClick` parameter;
  `area -> ...` names its one parameter explicitly (a `StemArea`); its body
  calls `navController.navigate(...)` (explained in full in the Header)
  with a route built from **string template** syntax.
- `"area/${area.id}"` — a Kotlin **string template**: `${area.id}` inside
  the string literal is replaced, at runtime, with the actual value of
  `area.id` — for `StemArea.Instruments`, this produces the literal string
  `"area/instruments"`.
- `composable("area/{areaId}") { backStackEntry -> ... }` — registers a
  **parameterized route**: the `{areaId}` segment (curly braces, inside the
  route *string*, unrelated to Kotlin's own lambda-brace syntax) is a
  placeholder `navigation-compose` matches against the corresponding
  segment of whatever real route was navigated to — `"area/instruments"`
  matches this pattern with `areaId` bound to the literal text
  `"instruments"`.
- `backStackEntry` — a real parameter this lambda receives, of type
  `NavBackStackEntry`, carrying the actual matched route's arguments.
- `backStackEntry.arguments?.getString("areaId")` — `arguments` is a
  nullable `Bundle?` (`?.` guards the case where no arguments exist at all);
  `getString("areaId")` reads the specific placeholder's matched text back
  out, by the same name (`"areaId"`) used inside the route pattern's curly
  braces.
- `StemArea.all.first { it.id == areaId }` — calls `first` (a real Kotlin
  stdlib extension function on `List`, `fun <T> Iterable<T>.first(predicate: (T) -> Boolean): T`)
  with a lambda predicate; it returns the first element for which the
  predicate is `true`, throwing `NoSuchElementException` if none match —
  unraised here because every route this app ever constructs comes from a
  real `area.id` in the first place.
- `AreaScreen(area = area)` — calls the new `AreaScreen` composable,
  passing the resolved `StemArea`.
- `fun HomeScreen(onAreaClick: (StemArea) -> Unit)` — `HomeScreen`'s
  signature changed: it now takes one parameter, `onAreaClick`, whose type
  `(StemArea) -> Unit` is a **function type** — a value that is itself a
  callable function accepting one `StemArea` and returning nothing
  meaningful. This is the same **higher-order function** shape this
  curriculum's outline will name explicitly and explore much further in a
  later, dedicated lesson; here, it exists specifically so `HomeScreen`
  itself never has to know *what* happens on a tap, only that something
  will.
- `Column(modifier = Modifier.padding(innerPadding))` — `Column` is a
  layout composable (supporting cast, not this lesson's own subject, so
  given only this brief note) arranging its children vertically, one below
  the next.
- `StemArea.all.forEach { area -> ... }` — `forEach` (a real Kotlin stdlib
  function, `fun <T> Iterable<T>.forEach(action: (T) -> Unit)`) calls its
  lambda once per element of `StemArea.all`, in order; because this runs
  *inside* a `@Composable` function, each call to `Text(...)` inside the
  lambda emits one more child into `Column`'s composition — this is real,
  ordinary Kotlin iteration directly producing UI, exactly the capability
  this lesson's opening Concept Unit asked whether a "just a function"
  approach to UI could offer that static XML markup couldn't.
- `.fillMaxWidth()` — a `Modifier` extension making the element expand to
  fill all available horizontal width, so the entire row (not just the
  text's own natural width) responds to a tap.
- `.clickable { onAreaClick(area) }` — a `Modifier` extension registering a
  tap handler; its lambda calls the `onAreaClick` callback `HomeScreen`
  received, passing this specific `area` — this is the one line in the
  entire app that turns a tap into an actual navigation event, by way of
  the `onAreaClick` lambda `StemLabApp` supplied above.
- `.padding(16.dp)` — adds `16.dp` of padding on every edge; `16.dp` is a
  literal `Dp` value (device-independent pixels — Android's real
  resolution-independent unit for UI dimensions), constructed via a Kotlin
  extension property (`val Int.dp: Dp`) that lets a plain numeric literal
  read as a typed dimension.
- `fun AreaScreen(area: StemArea)` — a new composable taking a `StemArea`
  parameter directly (not a callback — this screen has nothing to report
  back yet); its body reuses the identical `Scaffold` pattern the earlier
  Concept Unit already established, with `area.label` supplying both the
  title bar text and the placeholder body text.

### CS Lens

Routing by a **string key matched against a registered pattern** (the
`"area/{areaId}"` placeholder syntax) is the same idea a web server's own
URL router uses, and the same idea regular-expression capture groups use —
a general-purpose pattern-matching-with-named-extraction mechanism, applied
here to in-app navigation instead of HTTP requests.

Also recognized in: Express.js/Flask route patterns (`/users/:id`,
`/users/<id>`), React Router, iOS's own `NavigationStack` path-based
routing, and Android's older, XML-based Navigation Component (which
`navigation-compose` is a direct Compose-native successor to).

### SE Lens

**Why route by a string (`"area/{areaId}"`) instead of, say, passing the
actual `StemArea` object directly into `AreaScreen` from `HomeScreen`,
skipping the round-trip through a string and back?** The direct-reference
alternative is real and simpler for this one screen, but it was not chosen,
because a navigation graph built on object references can't survive process
death — if Android kills this app in the background and later restores it,
only the *route string* (not a live Kotlin object reference) is what the
system actually persists and restores. String-keyed routing pays that cost
up front, everywhere, even in cases (like this one) where it isn't strictly
needed yet, so that every future screen this curriculum adds gets
restoration correctness for free instead of as a special case bolted on
later. The cost paid today: an extra `StemArea.all.first { ... }` lookup
this lesson's code has to perform, converting a plain string back into a
real object, every single time this route is reached.

---

## Connect the Pieces

One trace through this entire lesson: the manifest and Gradle files told
the Android OS this app exists and named `MainActivity` as its one entry
point; `MainActivity.onCreate` called `setContent`, handing control from the
OS's Activity world into Compose's declarative one; `StemLabApp` created a
`NavController` and a `NavHost` naming `"home"` as the first destination;
`HomeScreen` iterated `StemArea.all` — the sealed class's own fixed,
compiler-checked list of four areas — rendering one clickable row per area;
tapping "Instruments" called `onAreaClick`, which called
`navController.navigate("area/instruments")`; `NavHost` reacted to that
change by recomposing to the `"area/{areaId}"` destination, extracting
`"instruments"` back out of the route string, looking the matching
`StemArea` back up, and handing it to `AreaScreen`, which showed a title bar
reading "Instruments" and placeholder text below it. Nothing about physics,
sensors, or measurement exists yet — every concept this lesson taught is the
scaffolding every later lesson in this curriculum will build directly on
top of.

Next: the instrument dashboard — turning today's placeholder `AreaScreen`
for "Instruments" into a real screen reporting which scientific instruments
this specific phone actually provides.
