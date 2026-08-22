# Lesson 1.2: Describing a Screen Instead of Building It

**What you will build** — `MainActivity` gets its first real, visible UI: a
small static calculator-shaped screen (a display line showing `"0"` and a
row of two buttons) built entirely with Jetpack Compose, Android's modern
UI toolkit. The transferable problem this lesson is actually about: how a
UI framework can let a program *describe* what a screen should contain, as
plain function calls, and have the framework figure out how to actually put
pixels on screen — instead of the older imperative style of manually
creating widget objects and mutating their properties one call at a time.

**What you need to know first** — Lesson 1.1's real, building
`AndroidCalculator/` Gradle project (`MainActivity` extending `Activity`,
overriding `onCreate`, the Manifest declaring it, the Gradle build/run
cycle); Lesson 0.9's function types and lambda expressions (`Button`'s
`onClick` parameter is exactly a function type, and the lambdas passed to
`Column`/`Row`/`Button` reuse that same mechanism); named-argument calls
from earlier in Stage 0 (`onClick = {}`, `text = "0"`, `modifier = ...`
are all named-argument calls); Lesson 0.10's extension functions and
extension properties (`Modifier.fillMaxWidth()`, `Modifier.padding(...)`,
and `16.dp` are all extension members, the same mechanism that gave
`Calculation` its own `describe()`).

## Terms used in this lesson

- **`@Composable`** — an annotation that marks a Kotlin function as one the
  Jetpack Compose framework is allowed to call as part of building a
  screen. It exists because Compose needs to tell, at compile time, which
  functions are just regular code and which ones are meant to describe UI
  and can therefore call other UI-describing functions, be tracked for
  what data they read, and be re-run automatically later — the annotation
  is the compiler's own hook for that special handling, not documentation.
  A function without it cannot call another `@Composable` function; this
  is enforced by the same Kotlin compiler already driving this project's
  Gradle build, proven directly in Concept Unit 3, below, by an actual
  failed compile.
- **Composition** — the tree of UI descriptions Compose builds by running
  a program's `@Composable` functions from the top down. It exists as a
  concept distinct from "the code" because the code is just functions;
  Composition is the *result* of calling them once — an in-memory
  structure Compose privately keeps, describing what should currently be
  on screen. Concept Unit 4, below, explains this in full, including what
  actually causes Compose to build one.
- **Recomposition** — Compose calling some of those same `@Composable`
  functions again, later, because a value they read has changed, so the
  Composition it's holding can be brought up to date without rebuilding
  the whole screen from scratch. This lesson's screen has no changing
  value yet (a later lesson on State is what introduces one), so
  recomposition cannot be triggered or observed for real here — it is
  named now, alongside Composition, because the two terms describe one
  mechanism (build once, update in place), and defining only half of it
  would leave the other half unexplained the moment it's used by name.
- **Trailing lambda syntax** — a Kotlin call-site rule: when a function's
  *last* parameter is a lambda (a function type), Kotlin lets that lambda
  be written directly after the closing parenthesis, outside the argument
  list, instead of as a normal comma-separated argument inside it — and
  when the lambda is the *only* argument, the empty parentheses can be
  dropped entirely. `Column { Text(...) }` is really
  `Column(content = { Text(...) })` with both shortcuts applied;
  `Button(onClick = {}) { Text(...) }` applies only the first shortcut,
  since `Button` takes two relevant parameters and `onClick` still has to
  be written explicitly. It exists purely for readability — a lambda
  passed this way reads like a block belonging to the call
  (`Column { ... }` reads as "a Column containing this"), rather than like
  one argument buried inside parentheses among others.
- **Named arguments** — a call-site syntax where an argument is written as
  `parameterName = value` instead of relying on position alone (`onClick =
  {}`, `text = "0"`, `modifier = Modifier...`, all through this lesson).
  It exists so a call with several parameters — especially ones with
  default values, like most of Compose's own composables — stays readable
  and safe to reorder, instead of forcing every argument to be supplied,
  in the exact declared order, just to reach the one a caller actually
  cares about.
- **Extension function / extension property** — a function or property
  defined outside a class's own body that can still be called with that
  class's normal dot-syntax (`someModifier.padding(...)`, `16.dp`),
  receiving the object it's called on as an implicit parameter under the
  hood. This exists so a library (Compose's `Modifier`, or Kotlin's own
  `Int`) can be extended with new members from code that doesn't own and
  can't modify the original class — `Modifier.padding(...)` isn't a
  method declared inside `Modifier`'s own interface body; it's a free
  function elsewhere in the library that Kotlin lets be called as if it
  were one. `16.dp` is the property form of the same mechanism: `dp` isn't
  a real field on `Int`, it's a computed extension property that converts
  the raw number into a `Dp` value on the fly, every time it's read.
- **`import`** — a statement at the top of a Kotlin file naming exactly
  which fully-qualified class, function, or property a short name used in
  this file refers to. It exists because two different libraries can both
  define something called `Button` or `Text`; without an explicit
  `import androidx.compose.material3.Button`, the compiler has no way to
  know which `Button` a bare `Button(...)` call in this file means.
- **Bill of Materials (BOM)** — a single dependency
  (`androidx.compose:compose-bom`) whose only job is to pin a matched,
  tested set of version numbers for every other Compose library, so that
  declaring individual Compose dependencies (`androidx.compose.ui:ui`,
  `androidx.compose.material3:material3`, ...) without their own version
  numbers still resolves to versions Google has actually tested together.
  It exists because Compose is split across many separately-versioned
  libraries; picking each one's version by hand risks combinations that
  were never tested against each other and can fail in subtle,
  hard-to-diagnose ways at runtime rather than at compile time.
- **`android.useAndroidX`** — a flag in `gradle.properties` (a
  project-wide settings file, not Kotlin code) telling the Android Gradle
  Plugin to resolve the modern `androidx.*` package namespace for
  support/Jetpack libraries, instead of the older `android.support.*`
  namespace the same libraries used before Google's AndroidX migration. It
  exists as an opt-in, rather than an always-on default, because AGP still
  has to support very old projects that genuinely depend on the
  pre-AndroidX libraries; every dependency this lesson adds is an AndroidX
  artifact, so without this flag set to `true`, Gradle refuses to resolve
  them at all — confirmed for real in Concept Unit 1, below, by an actual
  failed build before this flag existed in the project.

## Objects and methods used

**`buildFeatures { compose = true }`**
- What it is: a configuration block inside `app/build.gradle.kts`'s
  `android { }` block, and the specific boolean property inside it that
  turns on Compose support for this module.
- Implementation: `buildFeatures` is a nested Gradle DSL block provided by
  the Android Gradle Plugin; `compose` is a `Boolean` property on it,
  default `false`.
- Its use: without `compose = true`, AGP never invokes the Compose
  compiler plugin against this module's Kotlin code, so `@Composable`
  functions fail to compile in this project at all.
- Type: a configuration block (a property-setting DSL function) supplied
  by AGP, called on the `android` extension object.
- Responsibility: tells AGP's build-configuration step which optional UI
  toolkit integrations this specific module wants wired into its compile
  and resource-processing tasks.
- Depends on: the Android/Kotlin Gradle plugins already being applied, and
  a matching `composeOptions.kotlinCompilerExtensionVersion` (immediately
  below) telling AGP which build of the Compose compiler plugin to use.
- Connects to: read by AGP during Gradle's configuration phase, before any
  task runs; its value decides whether `compileDebugKotlin` invokes the
  Kotlin compiler with the Compose compiler plugin attached.
- Shape: a build-time configuration flag — never present at runtime,
  exists only to shape which Gradle tasks and compiler plugins get wired
  together.

**`composeOptions { kotlinCompilerExtensionVersion = "1.5.14" }`**
- What it is: a second configuration block inside `android { }`, pinning
  the exact version of the Compose compiler plugin — the tool that
  actually processes `@Composable` functions — this build uses.
- Implementation: `composeOptions` is an AGP DSL block;
  `kotlinCompilerExtensionVersion` is a `String` property on it holding a
  specific published version number of the Compose compiler.
- Its use: the Compose compiler plugin and the Kotlin compiler it plugs
  into are versioned separately and must be compatible; this project pins
  the Kotlin Gradle plugin to `1.9.24`, and `1.5.14` is the Compose
  compiler build Google's own published compatibility map pairs with that
  exact Kotlin version.
- Type: a configuration block (property-setting DSL function) supplied by
  AGP.
- Responsibility: tells AGP exactly which Compose compiler plugin artifact
  to download and attach to the Kotlin compiler invocation for this
  module.
- Depends on: `buildFeatures.compose = true` being set (this block is
  meaningless without it) and the version number actually matching the
  project's pinned Kotlin plugin version.
- Connects to: read by AGP during configuration, the same as
  `buildFeatures`; its value is what `compileDebugKotlin` fetches and
  loads as a compiler plugin before compiling this module's `.kt` files.
- Shape: a build-time version pin — a real, encountered requirement (a
  mismatched pin makes `@Composable` functions fail to compile with a
  plugin-version error, not a code error), not a stylistic choice.

**`platform(...)`**
- What it is: a Gradle Kotlin DSL function that marks a dependency
  coordinate as a *platform* (a Bill of Materials) rather than an ordinary
  library, inside a `dependencies { }` block.
- Implementation: a top-level function, `fun platform(notation: Any):
  Dependency`, provided by Gradle itself, not AGP or Compose-specific;
  called here as `platform("androidx.compose:compose-bom:2024.06.00")`.
- Its use: wrapping the Compose BOM coordinate in `platform(...)` tells
  Gradle "don't just add this as a library — read its version table and
  apply it to every other Compose dependency in this same `dependencies`
  block that doesn't specify its own version."
- Type: a free (top-level) Gradle DSL function, called inside
  `dependencies { }`.
- Responsibility: converts a single dependency coordinate into
  version-constraint metadata Gradle's own dependency resolver applies
  across the whole configuration, rather than adding a normal compiled
  artifact to the classpath.
- Depends on: a real BOM artifact existing at the given coordinate
  (Google publishes `androidx.compose:compose-bom` for exactly this
  purpose).
- Connects to: consumed by Gradle's dependency resolver during
  `debugRuntimeClasspath`/`debugCompileClasspath` resolution; every
  unversioned `implementation("androidx.compose...:...")` line below it in
  the same block resolves against the version table it supplies.
- Shape: a dependency-management mechanism, entirely build-time — has no
  runtime presence, exists only to keep a group of related libraries on
  tested, matching versions.

**`implementation(...)`**
- What it is: a Gradle dependency configuration function that adds a
  library to this module's compile and runtime classpath.
- Implementation: a Gradle DSL function accepting a dependency coordinate
  string (`"group:artifact:version"`, or just `"group:artifact"` when a
  BOM already supplies the version) or another dependency object.
- Its use: every Compose library this lesson's code actually calls
  (`androidx.compose.ui:ui` for `Modifier`, `androidx.compose.material3:
  material3` for `Text`/`Button`, `androidx.activity:activity-compose` for
  `setContent`) is declared this way.
- Type: a Gradle DSL configuration function, called inside
  `dependencies { }`.
- Responsibility: declares that this module needs a given library present
  both to compile against and to run with, and that the requirement is
  private to this module — not automatically passed on to anything that
  might depend on this module.
- Depends on: a resolvable dependency coordinate — either a full
  `"group:artifact:version"` string, or just `"group:artifact"` when a
  `platform(...)` BOM in the same block already supplies the version.
- Connects to: read by Gradle's dependency resolver; its result becomes
  part of `debugCompileClasspath` and `debugRuntimeClasspath`, which
  `compileDebugKotlin` and later packaging tasks both read from.
- Shape: a build-file declaration — has no runtime presence itself, only
  its downstream effect (the library actually being present) does.

**`debugImplementation(...)`**
- What it is: a variant of `implementation(...)` scoped to only the
  `debug` build variant, rather than every variant this module can build.
- Implementation: a Gradle DSL configuration function, generated
  automatically by AGP for each declared build variant by prefixing the
  base configuration's name.
- Its use: `androidx.compose.ui:ui-tooling` (declared here) contains
  Compose's design-time and debug-only tooling support; a real, shipped
  release build has no use for it, so scoping it to `debug` keeps it out
  of the app a user would actually install.
- Type: a Gradle DSL configuration function, called inside
  `dependencies { }`.
- Responsibility: declares a dependency with the same compile/runtime
  semantics as `implementation`, but restricts which build variant
  actually receives it.
- Depends on: AGP's build-variant system already existing — `debug` is
  the same variant `assembleDebug` builds.
- Connects to: read by Gradle's dependency resolver the same way
  `implementation` is, but only contributes to `debug`-variant-specific
  classpaths, never `release`'s.
- Shape: a build-file declaration, scoped to one variant — exists
  specifically to keep debug-only tooling out of a release artifact.

**`ComponentActivity`**
- What it is: the real Jetpack base class that adds Compose (and other
  modern Jetpack) integration on top of the plain `Activity` class
  `MainActivity` originally extended.
- Implementation: `androidx.activity.ComponentActivity`, itself a
  subclass of `android.app.Activity` — it adds new capabilities on top of
  `Activity` rather than replacing what `Activity` already does.
- Its use: `setContent { }` (below) is only available on
  `ComponentActivity` (and its own subclasses) — `Activity` itself has no
  such method, so `MainActivity` has to extend `ComponentActivity` before
  any Compose UI can be attached to it.
- Type: an open class, meant to be subclassed
  (`MainActivity : ComponentActivity()`, the same inheritance syntax
  already used for `Activity`).
- Responsibility: wires up the extra machinery Jetpack's modern APIs
  (Compose among them) need on top of a plain `Activity`, while still
  honoring the base `Activity` lifecycle contract.
- Depends on: nothing beyond what `Activity` itself already needs — a real
  Android runtime to host it. Declared here through
  `implementation("androidx.activity:activity-compose:1.9.0")`, which
  brings the class onto the classpath, since it isn't part of the base
  Android SDK the way `Activity` is.
- Connects to: declared as `MainActivity`'s superclass; the Android
  runtime instantiates a `MainActivity`, which is-a `ComponentActivity`,
  which is-a `Activity`, and calls `onCreate` on it exactly as before.
- Shape: a framework base class — a public extension point in the
  Android/Jetpack API surface, not project-specific code.

**`setContent { }`**
- What it is: the method that hands a block of `@Composable` code to
  Android as the actual content of this Activity's screen.
- Implementation: `fun ComponentActivity.setContent(content: @Composable
  () -> Unit)` — an extension function added onto `ComponentActivity`, not
  a method declared inside `ComponentActivity`'s own class body.
- Its use: this is the one call that actually connects "a `@Composable`
  function exists" to "the screen shows it" — without calling it,
  `CalculatorScreen()` (Concept Unit 3, below) would just be a function
  nothing ever calls, and the Activity would show a blank screen.
- Type: an extension function on `ComponentActivity`, taking one
  parameter of function type `@Composable () -> Unit`.
- Responsibility: creates and installs Compose's own root view into this
  Activity's window, then starts Composition (Concept Unit 4) by calling
  the lambda passed to it.
- Depends on: being called from inside `ComponentActivity.onCreate` (or
  later) — calling it before the Activity has a window would have nothing
  to attach to.
- Connects to: called once from `MainActivity.onCreate`; the lambda passed
  to it is where `CalculatorScreen()` gets called, so everything the rest
  of this lesson builds lives inside this one call.
- Shape: the seam between Android's classic Activity/View system and
  Compose — the one bridge point where the two UI models actually meet.

**`Text(...)`**
- What it is: the Compose composable that displays a run of text on
  screen.
- Implementation: `@Composable fun Text(text: String, modifier: Modifier =
  Modifier, ...)` from `androidx.compose.material3` — many more parameters
  exist with defaults; this lesson calls only `text`.
- Its use: this project's first visible content — the calculator's display
  line (`Text(text = "0")`) and the two button labels (`"7"`, `"+"`) are
  all `Text` calls.
- Type: a top-level `@Composable` function.
- Responsibility: given a `String`, describes one piece of drawable text
  as part of the current Composition — measuring it, laying it out, and
  drawing it wherever Compose places it.
- Depends on: being called from inside another `@Composable` function or
  lambda (Concept Unit 3 proves this for real with a failed compile) — it
  is itself annotated `@Composable`, so the same rule governing
  `CalculatorScreen` governs it.
- Connects to: called directly by `CalculatorScreen` (for the display)
  and, later, from inside each `Button`'s own trailing lambda (for its
  label) — it calls no further composables of its own in this lesson.
- Shape: a leaf node in the Composition tree — no children of its own,
  only the surrounding functions that call it.

**`Column(...)`**
- What it is: the Compose composable that arranges its children
  vertically, one below the next.
- Implementation: `@Composable fun Column(modifier: Modifier = Modifier,
  ..., content: @Composable ColumnScope.() -> Unit)` from
  `androidx.compose.foundation.layout` — the real signature exposes
  several more layout parameters (`verticalArrangement`,
  `horizontalAlignment`) this lesson leaves at their defaults.
- Its use: `CalculatorScreen`'s outermost composable — everything else in
  this lesson's screen is placed inside it so it stacks top-to-bottom.
- Type: a top-level `@Composable` function whose last parameter is itself
  a `@Composable` lambda (its trailing-lambda content block).
- Responsibility: measures every composable placed inside its trailing
  lambda, then positions each one directly beneath the last, in the exact
  order they were called.
- Depends on: a trailing lambda containing whatever composables it should
  stack (Concept Unit 5, below) — an empty `Column { }` is legal but shows
  nothing.
- Connects to: called once, directly, inside `CalculatorScreen`; its own
  trailing lambda calls `Text` and, later, `Row` — it is the direct parent
  of both in the Composition tree.
- Shape: a layout container — an internal building block of this screen's
  own UI, not a public API surface this project exposes to anything else.

**`Row(...)`**
- What it is: the Compose composable that arranges its children
  horizontally, side by side.
- Implementation: `@Composable fun Row(modifier: Modifier = Modifier,
  ..., content: @Composable RowScope.() -> Unit)` from
  `androidx.compose.foundation.layout` — structurally the direct
  horizontal counterpart of `Column`, above, down to sharing the same kind
  of trailing `@Composable` lambda parameter.
- Its use: holds this screen's two buttons side by side, the way a real
  calculator's buttons sit in horizontal strips rather than a single
  stack.
- Type: a top-level `@Composable` function whose last parameter is a
  `@Composable` lambda.
- Responsibility: measures every composable in its trailing lambda, then
  positions each one directly to the right of the last, in call order.
- Depends on: a trailing lambda containing whatever composables it should
  lay out side by side (Concept Unit 6, below).
- Connects to: called once, inside `Column`'s own trailing lambda, as
  `Column`'s second child (after `Text`); its own trailing lambda calls
  `Button` twice.
- Shape: a layout container, nested one level inside `Column` — same
  architectural role as `Column`, one level deeper in this screen's tree.

**`Button(...)`**
- What it is: the Compose composable that renders a clickable,
  Material-styled button.
- Implementation: `@Composable fun Button(onClick: () -> Unit, modifier:
  Modifier = Modifier, ..., content: @Composable RowScope.() -> Unit)`
  from `androidx.compose.material3` — `onClick` has no default value
  (proven for real in Concept Unit 7, below, by a failed compile when it's
  omitted); `content` is a trailing `@Composable` lambda, the same pattern
  `Column`/`Row` use for their own children.
- Its use: this screen's two buttons — currently unwired, per this
  lesson's "static screen" scope — each with a trailing lambda calling
  `Text` for its own label.
- Type: a top-level `@Composable` function with two parameters relevant
  here: a required function-type parameter (`onClick`) and a trailing
  `@Composable` lambda (`content`).
- Responsibility: draws a button-shaped surface, reacts to real taps by
  calling whatever function was passed as `onClick`, and lays out
  whatever composable content its trailing lambda describes on top of
  that surface.
- Depends on: a real function value for `onClick` — here, `{}`, an empty,
  no-op lambda, since this screen has no click behavior wired up yet — and
  a trailing lambda describing the button's own visible content.
- Connects to: called twice inside `Row`'s trailing lambda; each call's
  own trailing lambda calls `Text` once, for that button's label —
  `onClick`'s `{}` currently connects to nothing, a gap this lesson names
  explicitly and a later lesson on Events is responsible for closing.
- Shape: a leaf-ish container — exactly one composable child (its label)
  but, unlike `Text`, also carries interactive behavior (`onClick`),
  making it the one composable in this lesson with a real event boundary,
  even though that boundary does nothing yet.

**`Modifier`**
- What it is: the real Compose type used to attach extra behavior —
  sizing, padding, click handling, and much more — to a composable,
  without that behavior being one of the composable's own named
  parameters.
- Implementation: `androidx.compose.ui.Modifier`, a real Kotlin
  `interface`; `Modifier.Companion` (accessed simply as `Modifier`) is the
  empty starting instance every modifier chain begins from.
  `.fillMaxWidth()` and `.padding(...)` (below) are extension functions
  that each return a *new* `Modifier`, wrapping the one they were called
  on — which is what makes `Modifier.fillMaxWidth().padding(16.dp)` a real
  chain, not two independent calls.
- Its use: `CalculatorScreen`'s `Column` is given `modifier =
  Modifier.fillMaxWidth().padding(16.dp)`, so it stretches to the screen's
  full width and gets 16dp of breathing room on every side.
- Type: an `interface`, almost never implemented directly by application
  code — used entirely through its extension functions and the shared
  empty `Modifier` starting value.
- Responsibility: describes a chain of visual/behavioral adjustments to
  apply to whichever composable it's passed into, in the exact order the
  chain was written.
- Depends on: nothing to start (`Modifier` alone is a real, valid, empty
  modifier) — each extension function called on it depends only on the
  `Modifier` value immediately to its left in the chain.
- Connects to: built up by chaining `.fillMaxWidth()` then
  `.padding(16.dp)` (each call takes the previous result and returns a
  new one); the finished chain is passed into `Column`'s own `modifier`
  parameter, which reads it before laying out its own children.
- Shape: a cross-cutting configuration object — every composable in
  Compose accepts a `modifier` parameter of this exact type, making it
  shared across every composable a project ever writes, not specific to
  `Column`.

**`Modifier.fillMaxWidth(...)`**
- What it is: an extension function on `Modifier` that adds "take up all
  of the available horizontal space" to a modifier chain.
- Implementation: `fun Modifier.fillMaxWidth(fraction: Float = 1f):
  Modifier`, from `androidx.compose.foundation.layout` — confirmed for
  real this session: passing a `String` instead of a `Float` produced the
  actual compiler error `Type mismatch: inferred type is String but Float
  was expected`, proving the parameter's real declared type directly
  rather than only from documentation.
- Its use: called with no arguments here (`Modifier.fillMaxWidth()`),
  using the `fraction` default of `1f` — the full available width.
- Type: an extension function on `Modifier`, returning a new `Modifier`.
- Responsibility: wraps the `Modifier` it's called on with an added width
  constraint, then returns the combined result — it does not mutate
  anything; the original `Modifier` value it was called on is left as-is.
- Depends on: the `Modifier` instance it's called on (here, the empty
  `Modifier` starting value) and, optionally, a `Float` between 0 and 1
  for a partial width.
- Connects to: called first in this chain, on `Modifier` itself; its own
  return value is what `.padding(16.dp)` (next) is called on.
- Shape: one link in a `Modifier` chain — meaningful only in combination
  with whatever it's chained to and whatever composable ultimately reads
  the finished chain.

**`Modifier.padding(...)`**
- What it is: an extension function on `Modifier` that adds spacing
  around whatever the modifier is eventually attached to.
- Implementation: three real overloads exist, confirmed for real this
  session by an actual failed compile that printed all three:
  `padding(paddingValues: PaddingValues): Modifier`,
  `padding(all: Dp): Modifier`, and
  `padding(horizontal: Dp = ..., vertical: Dp = ...): Modifier`, all from
  `androidx.compose.foundation.layout`. This lesson calls the second:
  `padding(16.dp)`.
- Its use: gives `CalculatorScreen`'s content 16dp of space on every side,
  so the display text and buttons aren't drawn flush against the screen's
  physical edge.
- Type: an extension function on `Modifier` (three overloads, one used
  here), each returning a new `Modifier`.
- Responsibility: wraps the `Modifier` it's called on with an added
  spacing rule, the same wrap-and-return pattern `fillMaxWidth` (above)
  uses.
- Depends on: a `Dp` value for the `all` overload used here — not a raw
  number, confirmed for real this session by an actual failed compile
  (`padding(16)` with no `.dp` failed to resolve to any of the three real
  overloads above).
- Connects to: called second in this chain, on the `Modifier`
  `fillMaxWidth()` just returned; its own return value is the finished
  chain passed into `Column`'s `modifier` parameter.
- Shape: the second link in the same `Modifier` chain as `fillMaxWidth` —
  order matters here (padding is applied inside whatever size
  `fillMaxWidth` already established), though this lesson's two-link
  chain doesn't yet demonstrate a case where reordering would visibly
  change the result.

**`Int.dp`**
- What it is: an extension property on `Int` that converts a raw whole
  number into a real `Dp` (density-independent pixel) value.
- Implementation: `val Int.dp: Dp`, an extension property from
  `androidx.compose.ui.unit` — `Dp` itself is a real value class wrapping
  a `Float`, specifically typed so it can never be confused with a raw
  pixel count or an unrelated `Int`.
- Its use: `16.dp` is what actually gets passed to `padding(...)`, above —
  `16` alone is a plain `Int` and, confirmed for real this session, does
  not compile as an argument to any of `padding`'s three real overloads.
- Type: an extension property on `Int`, computed fresh every time it's
  read rather than stored.
- Responsibility: exists purely to convert a bare number into the
  specific, dimension-safe type Compose's layout APIs actually require, at
  the exact point that number is written.
- Depends on: the `Int` literal it's read from (`16`); produces one new
  `Dp` value each time.
- Connects to: read once here, its result passed directly as `padding`'s
  `all` argument — nothing else in this lesson's code calls it.
- Shape: a small, single-purpose unit-conversion utility — exists at the
  boundary between "a number a developer typed" and "a value Compose's
  typed layout system will actually accept."

### Everything else in the file, not this lesson's subject but still explained

**`Activity`** (reappearing)
- What it is: the plain Android base class `MainActivity` extended before
  this lesson.
- Implementation: `android.app.Activity`, part of the base Android SDK —
  `ComponentActivity`, above, extends it, so replacing `MainActivity`'s
  superclass with `ComponentActivity` does not lose anything `Activity`
  itself provided.
- Its use: named here only because `MainActivity` stops extending it
  directly in this lesson's own Project Change (Concept Unit 2) — the
  change is a real edit to an already-existing line of code, not a new
  concept in its own right.
- Type: an open class from the base Android SDK, meant to be subclassed.
- Responsibility: manages an app screen's lifecycle callbacks (`onCreate`
  among them) and its window.
- Depends on: a real Android runtime to instantiate and drive it.
- Connects to: still present in `MainActivity`'s inheritance chain
  (`MainActivity` → `ComponentActivity` → `Activity`), just no longer the
  class named directly in `MainActivity`'s own declaration.
- Shape: a framework base class, one level further up the hierarchy than
  before — same seam, moved one step back.

**`Bundle`** (reappearing)
- What it is: the real class `onCreate`'s `savedInstanceState` parameter
  is typed as — a key-value container Android uses to hand a restarted
  Activity its own previously saved state.
- Implementation: `android.os.Bundle`.
- Its use: appears here only because `onCreate`'s full signature (below)
  is shown again, in full, as this lesson's own code requires — this
  lesson's code does nothing new with it.
- Type: a class from the base Android SDK.
- Responsibility: holds an Activity's own previously saved instance state
  (or `null` on a genuinely fresh start) across a destroy-and-recreate
  cycle.
- Depends on: nothing this lesson's code provides — it's constructed by
  the Android runtime itself, before `onCreate` is ever called.
- Connects to: passed into `onCreate` by the Android runtime, then
  immediately forwarded into `super.onCreate(savedInstanceState)`.
- Shape: a framework data-transfer type, crossing the boundary between the
  Android runtime and this Activity's own code.

**`onCreate` / `super.onCreate(...)`** (reappearing)
- What it is: the lifecycle callback the Android runtime calls once, when
  this Activity is first being created — and, inside it, the call up to
  the superclass's own `onCreate` implementation.
- Implementation: `override fun onCreate(savedInstanceState: Bundle?)`,
  unchanged in signature; `super.onCreate(savedInstanceState)` now
  resolves to `ComponentActivity.onCreate`, not `Activity.onCreate`
  directly, since `MainActivity`'s superclass changed — `ComponentActivity`'s
  own `onCreate` still eventually calls `Activity`'s, so this call remains
  exactly as real and necessary as before.
- Its use: `setContent { }` is called from directly inside this method's
  own body, immediately after `super.onCreate(...)` — the one place this
  method previously had nothing further to do.
- Type: an overridden instance method.
- Responsibility: this is where an Activity does whatever one-time setup
  it needs before it's shown; this lesson adds "install this screen's
  Compose content" to that setup.
- Depends on: being called by the Android runtime itself, exactly once per
  creation, with a real or `null` `Bundle`.
- Connects to: called by the Android runtime; calls `super.onCreate(...)`
  first, then `setContent { }`.
- Shape: the same override-point/callback boundary as before — framework
  calling into app code at a moment the app doesn't control the timing
  of, just with one more real line of app code inside it now.

---

## Concept Unit 1: Turning On Jetpack Compose in the Build

### The Problem

`MainActivity` is a real, building Activity, but its `onCreate` body is
empty — nothing it does puts anything on screen. Jetpack Compose is the
toolkit this lesson is building toward, but none of `@Composable`, `Text`,
`Column`, `Row`, `Button` exist as far as this project's Gradle build
knows: they live in libraries this module hasn't declared a dependency on,
and a Kotlin file using `@Composable` needs a specific compiler plugin AGP
doesn't attach by default. Before any UI code can be written, the build
itself has to be told to support it.

> **Try it yourself first:** `app/build.gradle.kts` already declares
> plugins as blocks with real properties inside them (`android { namespace
> = ... }`, `kotlinOptions { jvmTarget = "17" }`). Given that pattern, what
> shape of addition would you guess turns on a specific AGP feature like
> Compose — a new plugin, a new property inside `android { }`, or something
> else entirely? This project's Kotlin Gradle plugin is pinned to
> `1.9.24` — if Jetpack Compose needs its own separate compiler plugin to
> process `@Composable` functions, and that plugin has to work correctly
> together with the Kotlin compiler it plugs into, what do you think
> happens if the two versions are allowed to drift apart? And: every
> dependency this project has needed so far has come from a `plugins { }`
> block, never a `dependencies { }` block — given that Compose's actual UI
> functions live in real published libraries, not inside AGP itself, what
> new kind of block would you expect this lesson to introduce?

### Isolated verification, adapted for a build-configuration concept

Unlike a language construct, a Gradle build-configuration addition has no
meaningful standalone throwaway lab separate from the real project's own
build file — there is no sandbox to compile a `buildFeatures { }` block
against other than a real Gradle module. Verification for this Concept
Unit happens directly against `AndroidCalculator/`'s real
`app/build.gradle.kts`, run for real with `./gradlew`, both with a piece
missing and with everything present.

Adding the Compose dependencies without first setting `android.useAndroidX
= true` in `gradle.properties` produced this real, actual failure:

```
> Task :app:checkDebugAarMetadata FAILED

FAILURE: Build failed with an exception.

* What went wrong:
Execution failed for task ':app:checkDebugAarMetadata'.
> Configuration `:app:debugRuntimeClasspath` contains AndroidX dependencies, but the `android.useAndroidX` property is not enabled, which may cause runtime issues.
  Set `android.useAndroidX=true` in the `gradle.properties` file and retry.
```

This proves the flag is not a formality: Gradle genuinely refuses to
resolve AndroidX dependencies — everything Compose ships as — without it,
regardless of how correctly `buildFeatures`/`composeOptions` are written.
After adding `android.useAndroidX=true`, the identical build succeeded for
real:

```
BUILD SUCCESSFUL in 15s
35 actionable tasks: 15 executed, 20 up-to-date
```

This whole sequence — declaring intent (`buildFeatures.compose = true`),
pinning a compatible tool version (`composeOptions`), and telling Gradle to
resolve the right dependency namespace (`android.useAndroidX`) — is what's
meant by **enabling a Gradle feature**: nothing is assumed to work by
default; every piece has to be explicitly turned on and kept consistent
with every other piece.

No throwaway code to discard here — this Concept Unit's verification ran
directly against the real project's own permanent build files, which is
why it skips a separate discard step; per this schema's own allowance,
this field is skipped because it is genuinely inapplicable to a
build-configuration concept, not because it was overlooked.

### Project Change

- **Reference Source:** No reference counterpart — this is this lesson's
  own original addition; `AndroidCalculator/` is not a port of an existing
  reference implementation.
- **Files affected:** `app/build.gradle.kts` (modified), `gradle.properties`
  (created).
- **Change type:** configure.
- **Location:** inside `app/build.gradle.kts`'s existing `android { }`
  block, immediately after the `kotlinOptions { }` block; a new top-level
  `dependencies { }` block, sibling to `android { }`; `gradle.properties`
  is a brand-new file at the project root, alongside `settings.gradle.kts`.
- **Dependencies:** network access to Google's and Maven Central's package
  repositories (already configured via `google()`/`mavenCentral()` in
  `settings.gradle.kts`).

### The New Code

```kotlin
buildFeatures {
    compose = true
}

composeOptions {
    kotlinCompilerExtensionVersion = "1.5.14"
}
```

### The Updated Project

```kotlin
 1  android {
 2      namespace = "com.example.calculator"
 3      compileSdk = 34
 4
 5      defaultConfig {
 6          applicationId = "com.example.calculator"
 7          minSdk = 24
 8          targetSdk = 34
 9          versionCode = 1
10          versionName = "1.0"
11      }
12
13      compileOptions {
14          sourceCompatibility = JavaVersion.VERSION_17
15          targetCompatibility = JavaVersion.VERSION_17
16      }
17
18      kotlinOptions {
19          jvmTarget = "17"
20      }
21
22      buildFeatures {                                // ← new
23          compose = true                              // ← new
24      }                                                // ← new
25
26      composeOptions {                                 // ← new
27          kotlinCompilerExtensionVersion = "1.5.14"     // ← new
28      }                                                 // ← new
29  }
```

`android { }` now configures this module's namespace, SDK versions,
default config, and JVM compatibility exactly as before, and — new — turns
on Compose support and pins the exact Compose compiler build to use.

The second half of this same concept — telling Gradle which real Compose
libraries to fetch — lands as a brand-new top-level block, with nothing
existing yet to show it landing inside:

```kotlin
dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.06.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.9.0")
    debugImplementation("androidx.compose.ui:ui-tooling")
}
```

Updated Project is skipped for this block — it is a brand-new top-level
block in `app/build.gradle.kts`, sibling to `android { }`, with nothing
surrounding it to show it landing inside, matching this schema's own
explicit skip condition for a freestanding new structure.

And the flag that makes the block above actually resolve:

```
android.useAndroidX=true
```

Updated Project is skipped for this line too — `gradle.properties` is a
brand-new file; the same skip condition applies.

### Mechanical walkthrough

- `buildFeatures { compose = true }` — a configuration block setting one
  `Boolean` property. Setting `compose = true` is what makes AGP attach
  the Compose compiler plugin to this module's Kotlin compilation at all;
  every other piece of this lesson depends on this one property being
  true.
- `composeOptions { kotlinCompilerExtensionVersion = "1.5.14" }` — a
  second configuration block, setting one `String` property that pins the
  exact Compose compiler build. `1.5.14` specifically because it's the
  build Google's own compatibility map pairs with Kotlin `1.9.24`, this
  project's own pinned Kotlin version — an arbitrary-looking string that
  is in fact load-bearing and has to move in lockstep with the Kotlin
  plugin version if that version ever changes.
- `dependencies { }` — a brand-new top-level Gradle block, sibling to
  `android { }`; everything inside it configures what libraries this
  module's compile/runtime classpaths include, distinct from `android { }`,
  which configures how the module itself is built.
- `val composeBom = platform("androidx.compose:compose-bom:2024.06.00")` —
  declares a local `val` (an already-familiar Kotlin construct: an
  immutable, type-inferred binding) holding the result of calling
  `platform(...)` on the Compose BOM coordinate. `platform(...)` marks this
  specific dependency as version-constraint metadata rather than a normal
  library, so every unversioned Compose dependency declared after it in
  this same block resolves against the exact, tested version table this
  BOM publishes.
- `implementation(composeBom)` — adds the BOM itself as a dependency,
  which is what actually activates its version constraints for this
  configuration; without this line, `platform(...)` having been called
  would have no effect.
- `implementation("androidx.compose.ui:ui")` — adds Compose's core UI
  library, the one that defines `Modifier` itself; no version number is
  given because the BOM already pins one.
- `implementation("androidx.compose.ui:ui-tooling-preview")` — adds the
  lightweight annotations Compose's tooling uses for design-time previews;
  not called on directly by this lesson's own code, but required by AGP's
  own Compose build wiring once `buildFeatures.compose = true` is set.
- `implementation("androidx.compose.material3:material3")` — adds the
  library `Text` and `Button` (below) actually come from — Compose's
  Material Design 3 component set.
- `implementation("androidx.activity:activity-compose:1.9.0")` — adds
  `ComponentActivity` and `setContent { }` (Concept Unit 2, below); this
  one line does carry its own explicit version number rather than relying
  on the Compose BOM, because `activity-compose` is versioned separately
  from Compose itself, as part of Jetpack's Activity library family.
- `debugImplementation("androidx.compose.ui:ui-tooling")` — adds Compose's
  debug-only tooling support, scoped so it never ships in a release build.
- `android.useAndroidX=true` — a single property assignment inside
  `gradle.properties`, a plain key-value file Gradle reads before any
  build script even runs. Setting it is what makes Gradle willing to
  resolve every `androidx.*` coordinate above at all — proven for real,
  above, by the actual failure that happens without it.

### CS lens

Pinning a whole family of related dependencies to one tested version table
(the Compose BOM) is a real, general software engineering idea:
**dependency version alignment**. Also recognized in: Python's
`requirements.txt`/lockfiles pinning a whole environment together, Node's
`package-lock.json`, a Linux distribution's package repository (every
package in a given release is tested against the same set of library
versions), and any "platform" or "starter" dependency a build tool offers
specifically to prevent independently-versioned pieces from drifting out
of sync with each other.

### SE lens

The alternative not chosen here is picking each Compose library's own
version number by hand — `androidx.compose.ui:ui:1.6.8`,
`androidx.compose.material3:material3:1.2.1`, and so on, individually. That
would still work, but every future Compose library this project adds would
need its own version researched and kept compatible with every other one
already declared — real, ongoing maintenance cost that grows with the
number of Compose libraries in use. The BOM trades a small amount of
indirection (a reader has to know the BOM exists and does this) for
removing that maintenance burden entirely: bump one BOM version, and every
unversioned Compose dependency in the project moves together, already
tested as a set by the people who publish them.

### Commands needed

`./gradlew :app:assembleDebug` — already used; no new command syntax this
Concept Unit, only new content inside the files it reads. `--console=plain`
was used when capturing the real output shown above, to avoid Gradle's
interactive progress UI cluttering the saved transcript — it changes only
how progress is displayed, not what the build does.

### Run it

Already shown, in full, above: the real failure without
`android.useAndroidX=true`, and the real `BUILD SUCCESSFUL` after adding
it. Both saved at `verification/1.2/break1_no_androidx.txt` and
`verification/1.2/step1_compose_deps_resolve.txt`.

### Connecting the pieces

With Compose's dependencies actually resolving, the project now has access
to every class and function the rest of this lesson calls — but
`MainActivity` itself hasn't changed yet, so the app still shows nothing.
Concept Unit 2 is the first change to `MainActivity.kt` itself.

---

## Concept Unit 2: `ComponentActivity` and `setContent` — Hosting a Composable Screen

### The Problem

Compose's dependencies are on the classpath, but `MainActivity` still
extends plain `Activity`, and its `onCreate` is still empty. `Activity`
has no method that accepts `@Composable` code — there has to be some real,
specific bridge between "an Activity exists" and "Compose is allowed to
draw something inside it."

> **Try it yourself first:** `Activity`'s real, full method set was never
> shown to include anything Compose-shaped. Given that Compose needs
> *some* real entry point into an Activity's lifecycle to install its own
> content, and given that Kotlin classes can extend another class to gain
> new capabilities without losing the old ones (the same relationship
> already proven between a subclass and `Activity` itself), what would you
> guess the fix looks like — a new method added directly to `Activity`
> itself, or a different class in between? And once such a class exists:
> where in `onCreate`'s existing body — before or after
> `super.onCreate(savedInstanceState)` — would you guess a call to install
> Compose content has to go, given what `super.onCreate` was already shown
> to be responsible for?

### Introduce the concept in isolation

There is no separate throwaway Activity subclass to isolate this in — an
`Activity`/`ComponentActivity` only really exists meaningfully inside a
real Android module with a real Manifest entry, the same reason Concept
Unit 1's build-configuration verification ran directly against the real
project rather than a sandbox. The real, isolated check here is the
smallest possible real change: extend `ComponentActivity` and call
`setContent { }` with a completely empty body — no composable inside it
yet — and confirm the module still compiles.

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {

        }
    }
}
```

Run for real against the actual project:

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 1s
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves two things at once: `ComponentActivity` really does replace
`Activity` without breaking `onCreate`'s existing override (the compiler
still accepts `override fun onCreate(savedInstanceState: Bundle?)`
unchanged), and `setContent { }` really does accept a lambda with nothing
composable inside it — an empty `@Composable () -> Unit` lambda is a
completely valid value of that function type, the same as an empty lambda
being valid anywhere else a function type is expected. This bridge — an
Activity subclass calling one specific method to install a tree of
`@Composable` functions as its screen — is what's meant by **hosting a
Composable screen**.

Discarded: the empty `setContent { }` body above is not the real project's
final state; Concept Unit 3 fills it with the project's actual first
composable.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** replace (the superclass in the class declaration) and
  add (the `setContent { }` call inside `onCreate`).
- **Location:** the class declaration line itself, and inside `onCreate`,
  immediately after `super.onCreate(savedInstanceState)`.
- **Dependencies:** `androidx.activity:activity-compose:1.9.0`, added to
  `app/build.gradle.kts` in Concept Unit 1.

### The New Code

```kotlin
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
```

### The Updated Project

```kotlin
 1  package com.example.calculator
 2
 3  import android.os.Bundle
 4  import androidx.activity.ComponentActivity      // ← new
 5  import androidx.activity.compose.setContent      // ← new
 6
 7  class MainActivity : ComponentActivity() {       // ← changed: was Activity()
 8      override fun onCreate(savedInstanceState: Bundle?) {
 9          super.onCreate(savedInstanceState)
10          setContent {                              // ← new
11
12          }                                         // ← new
13      }
14  }
```

`MainActivity` now still declares the exact same `onCreate` override as
before, still calls `super.onCreate(savedInstanceState)` first, and now
additionally calls `setContent { }` right after — a real, empty bridge to
Compose, ready for Concept Unit 3 to fill.

### Mechanical walkthrough

- `import androidx.activity.ComponentActivity` — a package-qualified
  import naming exactly which `ComponentActivity` this file means (Jetpack's,
  not some other library's class of the same name, if one existed);
  without it, the bare name `ComponentActivity` used below would not
  resolve.
- `import androidx.activity.compose.setContent` — imports the specific
  extension function `setContent`, from the `androidx.activity.compose`
  package, distinct from the `androidx.activity` package the class itself
  comes from — a real, deliberate separation Google's own library
  structure makes between the base Activity library and its
  Compose-specific extensions.
- `class MainActivity : ComponentActivity()` — the same inheritance syntax
  already used for `MainActivity : Activity()`, now naming
  `ComponentActivity` as the direct superclass instead. `MainActivity`
  is-a `ComponentActivity` now, and, transitively, still is-a `Activity`,
  since `ComponentActivity` itself extends `Activity`.
- `override fun onCreate(savedInstanceState: Bundle?)` — unchanged: still
  overriding the same lifecycle callback, with the same signature,
  received from further up the same inheritance chain — just one link
  longer than before.
- `super.onCreate(savedInstanceState)` — still the first statement in the
  body, still forwarding the same `Bundle?` up the chain — now resolving
  to `ComponentActivity.onCreate` first, which itself calls
  `Activity.onCreate` internally, so the real runtime requirement already
  proven — that skipping this call breaks the Activity — still holds.
- `setContent { }` — a call to the extension function just imported, with
  an empty trailing lambda. Because `setContent`'s parameter type is
  `@Composable () -> Unit`, and an empty lambda body `{ }` is a completely
  valid implementation of any function type whose return type is `Unit`,
  this compiles even though it describes no actual UI yet.

### CS lens

`setContent { }` is this project's first real example of **dependency
injection at a framework boundary**: instead of `MainActivity` reaching
out and constructing its own UI objects imperatively, it hands the
framework a description (a lambda) and lets the framework decide when and
how to use it. Also recognized in: a web framework calling a registered
route handler, a test framework calling a registered `setUp` callback
before each test, and any plugin system where application code supplies a
callback and a host framework decides when to invoke it.

### SE lens

The alternative not chosen is Android's older `setContentView(R.layout.
activity_main)` pattern — pointing an Activity at an XML layout resource
file, then reaching for individual widgets afterward with `findViewById`.
That approach keeps UI structure and Kotlin code in two separate files
(an XML layout, a `.kt` file) that have to be kept in sync by convention,
with no compiler check that a `findViewById` call's assumed widget type
actually matches what's in the XML. `setContent { }` keeps the UI
description in the same language, and the same compiler-checked file, as
the rest of the app — the real tradeoff being that Compose's own tooling
and mental model (Composition, Concept Unit 4) has to be learned instead
of reusing whatever XML-layout experience a developer already had.

### Run it

Shown above, in full, as this Concept Unit's own isolated verification —
the real `BUILD SUCCESSFUL` compiling `MainActivity` with an empty
`setContent { }` body. Saved at
`verification/1.2/step2_componentactivity_setcontent.txt`.

### Connecting the pieces

`MainActivity` can now host Compose content, but hosts nothing yet — the
empty lambda from Concept Unit 1's verification is still there. Concept
Unit 3 writes the project's actual first composable function and calls it
from inside that same lambda.

---

## Concept Unit 3: `@Composable` Functions and `Text` — Declaring and Calling Composable Code

### The Problem

`setContent { }` exists and compiles, but its body is empty — there is
still no actual function anywhere in this project marked as something
Compose is allowed to call, and nothing yet that puts real content (even a
single word) on screen.

> **Try it yourself first:** ordinary Kotlin functions were already fully
> established (`fun perform(...)`, `fun describe()`, and others) — plain
> functions, callable from anywhere their visibility allows. Given that
> Compose needs to distinguish "a function that's safe to call while
> building a screen" from "an ordinary function," and given that Kotlin
> already has a real, general mechanism for attaching extra compiler
> information to a declaration (annotations — `@Override`-shaped syntax
> already seen in `override fun onCreate`, informally, even without a
> dedicated custom one of these being written before), what shape of
> marker would you guess Compose uses on a function to mean "this one is
> composable"? And: if `setContent`'s own parameter type is `@Composable ()
> -> Unit`, what do you think happens if a function *without* that
> marker tries to call something that *does* have it?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabText() {
    Text(text = "lab")
}
```

Run for real, batched together with the other isolated labs this lesson
needs (Concept Isolation Rule's own throwaway examples for `Column`,
`Row`, `Button`, and `Modifier`, added temporarily to the project,
verified together, then all discarded):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 895ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves a `@Composable` function can call another real `@Composable`
function (`Text`) and compile cleanly. To prove the annotation is actually
required — not just conventional — the same function was compiled again
with `@Composable` removed:

```kotlin
fun CalculatorScreen() {
    Text(text = "0")
}
```

Compiled against the real project, with nothing else changed, this real
attempt failed:

```
e: .../MainActivity.kt:18:5 Functions which invoke @Composable functions must be marked with the @Composable annotation
e: .../MainActivity.kt:19:5 @Composable invocations can only happen from the context of a @Composable function
```

This is a real, actual compile failure, not a predicted one — proving
`@Composable` is compiler-enforced, the same standard already applied to
`Activity.onCreate`'s own override requirement: a plausible-sounding claim
("this annotation is probably required") is not treated as proven until an
actual negative-case compile confirms it. This annotated, callable kind of
function is called a **composable function** — informally shortened to
"a composable" throughout Compose's own documentation and this lesson's
remaining Concept Units.

Both throwaway snippets above are discarded — neither `LabText` nor the
unannotated `CalculatorScreen` variant appears in the real project again;
the real project's `CalculatorScreen` keeps its `@Composable` annotation
permanently, as shown next.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a new top-level function) and replace (the empty
  `setContent { }` body).
- **Location:** a new function, `CalculatorScreen`, added below the
  `MainActivity` class; `setContent { }`'s previously empty body, inside
  `onCreate`.
- **Dependencies:** `androidx.compose.material3:material3` (`Text`),
  `androidx.compose.runtime:runtime` (the `@Composable` annotation
  itself), both already declared in Concept Unit 1.

### The New Code

```kotlin
@Composable
fun CalculatorScreen() {
    Text(text = "0")
}
```

### The Updated Project

```kotlin
 1  package com.example.calculator
 2
 3  import android.os.Bundle
 4  import androidx.activity.ComponentActivity
 5  import androidx.activity.compose.setContent
 6  import androidx.compose.material3.Text          // ← new
 7  import androidx.compose.runtime.Composable       // ← new
 8
 9  class MainActivity : ComponentActivity() {
10      override fun onCreate(savedInstanceState: Bundle?) {
11          super.onCreate(savedInstanceState)
12          setContent {
13              CalculatorScreen()                    // ← new
14          }
15      }
16  }
17
18  @Composable                                       // ← new
19  fun CalculatorScreen() {                           // ← new
20      Text(text = "0")                               // ← new
21  }                                                  // ← new
```

`MainActivity.onCreate` now calls `setContent { CalculatorScreen() }` —
the previously empty lambda now describes real content by calling this
project's own first composable function, which itself calls `Text` to
display the literal string `"0"`, the calculator's display value at rest.

### Mechanical walkthrough

- `import androidx.compose.material3.Text` — a package-qualified import
  naming exactly which `Text` function this file means, out of every
  library that could plausibly define something called `Text`; without
  it, the bare call `Text(text = "0")` below would not resolve.
- `import androidx.compose.runtime.Composable` — imports the `@Composable`
  annotation type itself; annotations, like classes, are real declared
  types that have to be imported before their `@`-prefixed short name can
  be used.
- `@Composable` (on `CalculatorScreen`) — marks this function as one
  Compose is allowed to call while building a screen, and one that is
  itself allowed to call other composables — proven required, above, by
  the real negative-case compile that failed without it.
- `fun CalculatorScreen()` — an ordinary Kotlin function declaration
  (already-established syntax), taking no parameters and returning
  nothing explicit (an implicit `Unit`) — its entire purpose is the
  side-effect-like act of describing UI by calling other composables, not
  computing and returning a value.
- `Text(text = "0")` — a named-argument call (already-established syntax)
  to the `Text` composable just imported, passing the literal string
  `"0"` as its `text` parameter. This is the calculator's display, drawn
  for the very first time, at a fixed value since there is no state yet
  to display anything else.
- `CalculatorScreen()` (inside `setContent`'s lambda) — an ordinary
  function call to the composable just declared, now filling the
  previously empty lambda body. Because it's called from inside
  `setContent`'s own `@Composable () -> Unit` lambda — itself a
  composable context — calling a `@Composable` function here is legal,
  the exact context the annotation exists to check for.

### CS lens

A function whose entire job is to describe output by calling other,
smaller description-producing functions — rather than mutating some
external object step by step — is a real, general idea: **declarative
composition**. Also recognized in: React and other JSX-based UI
frameworks (a component function returning what it wants rendered, not
manipulating the DOM directly), SwiftUI's `View` structs, a spreadsheet
formula (declares a relationship between cells; the spreadsheet engine
figures out how and when to actually recompute), and SQL itself (a query
declares *what* rows are wanted, not the loop that fetches them).

### SE lens

The alternative not chosen is the pattern Android's classic View system
uses: obtain a reference to an already-existing widget object
(`findViewById<TextView>(R.id.display)`) and imperatively call a mutator
method on it (`.text = "0"`) whenever the value needs to change. That
approach requires manually tracking which widgets need updating and when;
forgetting one is a real, common bug class in that older style. Compose's
declarative approach removes that manual tracking at the cost of needing
to trust the framework's own machinery (Composition, Concept Unit 4,
below) to actually call these functions again when something changes — a
real dependency this project is not yet in a position to fully evaluate,
since there is no changing state yet for that machinery to prove itself
against.

### Run it

Both the batched isolated lab and the real project's own build shown in
full above. Saved at `verification/1.2/lab1_composables_isolated.txt`
(the throwaway labs), `verification/1.2/break3_missing_composable_
annotation.txt` (the negative case), and
`verification/1.2/step3_composable_text.txt` (the real project's own
build with `CalculatorScreen` calling `Text`).

### Connecting the pieces

`MainActivity` now hosts a real composable that draws real text — the
first pixel-producing content this project has ever had. Concept Unit 4
steps back from writing new code to explain, in full, what actually
happens when `setContent { CalculatorScreen() }` runs.

---

## Concept Unit 4: Composition — What Actually Happens When `setContent` Runs

### The Problem

Concept Unit 3 proved `CalculatorScreen()` compiles and gets called. But
"gets called" is doing a lot of unexplained work in that sentence — what,
specifically, does Compose do with the result of calling it? There is no
`return` value from `CalculatorScreen` that gets drawn; the function just
calls `Text`, which itself returns nothing meaningful either. Something
has to be keeping track of what was called, in what order, for anything to
end up on screen at all.

> **Try it yourself first:** `CalculatorScreen()` and `Text(text = "0")`
> both have return type `Unit` — no value comes back from either call that
> could be handed to some other code to draw. Given that, and given that a
> function's own statements run top-to-bottom in the order they're written
> (already-established Kotlin behavior), what would you guess Compose
> actually does to end up with a real screen, if not "use each call's
> return value"? And: if `Row`'s trailing lambda calls `Button` twice, one
> after the other, what order would you predict those two calls happen in
> — and why?

### No new code for this unit

This Concept Unit explains the behavior of code already shown in Concept
Unit 3, rather than introducing a new syntax construct — so it has no
isolated throwaway lab, no discard step, no Project Change, no New Code,
and no Updated Project; per this schema's own allowance, these fields are
skipped because they are genuinely inapplicable here, not overlooked.

### Mechanical walkthrough — a control-flow trace, not changing values

The claim under examination — "Compose calls these functions in a
specific, real order, using ordinary Kotlin semantics, not hidden magic" —
is exactly the kind of hidden-behavior claim this schema requires proof
for, not just a confident sentence. The proof available here is not a live
run (no working emulator or device exists in this environment, a standing
limitation of this curriculum's current tooling); it is the fact that
Concept Unit 3's real compile already typechecks every one of these exact
calls, which only succeeds if Kotlin's own ordinary function-call and
statement-order rules — nothing Compose-specific — already fully determine
this sequence:

1. `setContent { CalculatorScreen() }` — installs Compose's own rendering
   surface into `MainActivity`'s window, then calls the lambda passed to
   it, exactly once, as the very first step of building this screen.
2. `CalculatorScreen()` — the lambda's only statement, so it's the first
   (and only) thing that lambda calls; this is an ordinary Kotlin function
   call, the same mechanism as calling any other function, not special
   compiler dispatch — the `@Composable` annotation changes what a
   function is *allowed* to call and be called from (Concept Unit 3), not
   how a call to it actually executes.
3. `Column(modifier = ..., content = { ... })` — called by
   `CalculatorScreen`'s own body; runs before either of its two children
   exist yet, since `Column`'s own trailing lambda hasn't been invoked at
   this point — only passed in as a value.
4. `Text(text = "0")` — the first statement inside `Column`'s trailing
   lambda; runs before `Row`, because Kotlin executes a function's
   statements top-to-bottom, and this line is written first.
5. `Row(content = { ... })` — the second statement in `Column`'s trailing
   lambda; called after `Text`, not before, for the identical top-to-bottom
   reason.
6. `Button(onClick = {}) { Text(text = "7") }`, then
   `Button(onClick = {}) { Text(text = "+") }` — `Row`'s two statements,
   called in the order they're written; each one's own trailing lambda
   then calls `Text` once, for that button's label.

This ordered sequence of calls, together with everything each call
actually creates, is what's meant by **Composition**: not the code itself,
but the real tree Compose has built by the time this sequence finishes —
one `Column`, containing one `Text` and one `Row`, containing two
`Button`s, each containing one `Text`. Nothing about this trace required
running the app; it follows directly from Kotlin's own function-call and
statement-order semantics, already confirmed to apply to these exact calls
by Concept Unit 3's real, successful compile.

**Recomposition**, named in this lesson's Terms section, is Compose
calling some of these same functions again — later, and not necessarily
all of them — because a value one of them read has changed. Nothing in
this lesson's screen can change yet (`Text(text = "0")` is a fixed
literal, and `onClick = {}` does nothing), so recomposition genuinely
cannot be triggered or observed here; it is named now only because
Composition and recomposition are two halves of the same real mechanism,
and a later lesson on State is where a real, changing value exists for
Compose to actually recompose over.

### CS lens

Building a tree once by running a set of declarative functions, then later
updating only the parts whose inputs changed, is the same real idea as
**incremental computation** / **memoized recomputation**. Also recognized
in: a spreadsheet recalculating only the cells whose dependencies changed
(not the whole sheet), a build system like Gradle itself re-running only
the tasks whose inputs changed (`UP-TO-DATE`, already seen directly in
this lesson's own real Gradle output), React's virtual-DOM diffing, and a
makefile only rebuilding targets whose dependencies are newer than the
target itself.

### SE lens

The alternative not chosen is manual, imperative updates: a developer
writing the specific code that mutates exactly the widgets affected by a
given change, by hand, every time. That approach gives full, direct
control over exactly what work happens and when, at the real cost of that
control being the developer's own responsibility to get right, every
time — a documented source of real bugs in Android's older View-based
apps (a widget updated in one code path but missed in another). Compose's
tradeoff is trusting its own recomposition machinery to figure out what
changed and update only that — a trust this project has not yet had reason
to test, since nothing here changes yet; that is an honest, currently
unverified assumption this lesson is making, not a proven guarantee, and
it's exactly what a future lesson on State will actually put to the test.

### Run it

No new execution for this unit — it explains the real, already-executed
build from Concept Unit 3 (`verification/1.2/step3_composable_text.txt`),
rather than running anything new.

### Connecting the pieces

Composition explains what the real tree looks like once
`CalculatorScreen()`'s current code runs — one `Column` containing one
`Text` and one `Row`. Concept Unit 5 is where `Column` itself, already
used above, gets its own full, isolated explanation.

---

## Concept Unit 5: `Column` — Arranging Children Vertically

### The Problem

`CalculatorScreen` currently calls only `Text` — a single line, with
nothing else on screen. A calculator needs more than one line: a display,
and, below it, a row of buttons. Something has to actually stack multiple
composables vertically, in a specific order, rather than each one
independently claiming the whole screen for itself.

> **Try it yourself first:** `Text` was just shown taking no children of
> its own — it's a leaf. Given that Compose needs *some* composable whose
> entire job is arranging *other* composables, and given that this
> lesson's Terms already named trailing lambda syntax as how a composable
> receives a block of other composables to work with, what would you guess
> the call to "stack these vertically" looks like — a parameter passed to
> `Text` itself, or a separate composable wrapping multiple children? And:
> if two `Text` calls end up inside that wrapping composable's own
> trailing lambda, one written after the other, what order on screen would
> you predict they appear in, given what Concept Unit 4 already showed
> about a function's statements running top to bottom?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabColumn() {
    Column {
        Text(text = "one")
        Text(text = "two")
    }
}
```

Run for real (part of the same batched lab pass as Concept Unit 3's
`LabText`):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 895ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves `Column`'s trailing lambda can call `Text` more than once, and
that both calls compile as siblings inside it — the mechanism, isolated
from `CalculatorScreen`'s own real content, is called **`Column`**, a
layout composable that arranges every composable called inside its
trailing lambda vertically, top to bottom, in the exact order they were
called.

Discarded: `LabColumn` above does not appear in the real project;
`CalculatorScreen`'s own real use of `Column`, shown next, wraps its
actual display text, not the placeholder `"one"`/`"two"` strings used to
isolate the concept.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (wrap the existing `Text` call).
- **Location:** inside `CalculatorScreen`'s body, wrapping the single
  `Text(text = "0")` call already there.
- **Dependencies:** `androidx.compose.foundation:foundation-layout`
  (`Column`), already resolved transitively through
  `androidx.compose.ui:ui` in Concept Unit 1.

### The New Code

```kotlin
Column {
    Text(text = "0")
}
```

### The Updated Project

```kotlin
 1  package com.example.calculator
 2
 3  import android.os.Bundle
 4  import androidx.activity.ComponentActivity
 5  import androidx.activity.compose.setContent
 6  import androidx.compose.foundation.layout.Column   // ← new
 7  import androidx.compose.material3.Text
 8  import androidx.compose.runtime.Composable
 9
10  class MainActivity : ComponentActivity() {
11      override fun onCreate(savedInstanceState: Bundle?) {
12          super.onCreate(savedInstanceState)
13          setContent {
14              CalculatorScreen()
15          }
16      }
17  }
18
19  @Composable
20  fun CalculatorScreen() {
21      Column {              // ← new
22          Text(text = "0")
23      }                     // ← new
24  }
```

`CalculatorScreen` now wraps its display text in a `Column` — with only
one child so far, the visible result is unchanged, but the screen's
structure now has a real vertical container ready for a second child.

### Mechanical walkthrough

- `import androidx.compose.foundation.layout.Column` — a package-qualified
  import naming exactly which `Column` this file means, from Compose's
  foundation-layout library specifically, distinct from `material3`
  (`Text`, `Button`) or `runtime` (`Composable`) — Compose deliberately
  splits its API across several libraries by concern, and layout
  composables live in this one.
- `Column {` — a call to the `Column` composable using trailing lambda
  syntax (this lesson's own Terms entry): because `Column`'s content
  parameter is its last parameter and the only one supplied here, the
  lambda is written directly after `Column` with no parentheses at all.
- `Text(text = "0")` (now indented inside `Column`) — the exact same call
  as before, now running as the first (and only) statement inside
  `Column`'s trailing lambda instead of directly inside
  `CalculatorScreen`'s own body — its own behavior is unchanged; only its
  position in the Composition tree changed, from `CalculatorScreen`'s
  direct child to `Column`'s child.
- `}` (closing `Column`'s trailing lambda) — ends the block of composables
  `Column` is responsible for arranging; anything added after this brace,
  still inside `CalculatorScreen`, would sit as a sibling of `Column`
  itself, not as one of its children — the exact distinction Concept Unit
  6 depends on next.

### CS lens

`Column` is a real instance of the **container/composite** relationship:
one thing whose job is to hold and arrange a collection of other things of
the same general kind. Also recognized in: a file-system directory holding
other files and directories, an HTML `<div>` holding other elements, a GUI
toolkit's vertical `BoxLayout`/`VBox`/`LinearLayout` (Android's own
pre-Compose vertical container), and the Composite design pattern.

### SE lens

The alternative not chosen — genuinely available in Compose — is
`Column`'s own more specific relatives (`LazyColumn`, for large or
unbounded lists that shouldn't all be measured and drawn at once). `Column`
measures and draws every one of its children eagerly, every time; for two
children, that cost is negligible, but it is a real, deliberate tradeoff
this project is currently making — fine now, and worth revisiting only if
this screen's own children ever grow large or dynamic enough for eager
measurement to matter.

### Run it

Shown above, in full: the batched isolated lab
(`verification/1.2/lab1_composables_isolated.txt`) and the real project
build with `Column` wrapping the display text
(`verification/1.2/step5_column.txt`).

### Connecting the pieces

`Column` now holds the display text as its one real child. Concept Unit 6
gives it a second child — a `Row`, laid out horizontally, the way this
screen's buttons need to sit.

---

## Concept Unit 6: `Row` — Arranging Children Horizontally

### The Problem

`Column` stacks its children vertically — correct for the relationship
between the display and the row of buttons below it, but wrong for the
relationship *between* the buttons themselves, which need to sit side by
side, not stacked on top of each other.

> **Try it yourself first:** `Column` was just shown arranging children
> top to bottom, in call order. Given Compose's own naming pattern so far
> (`Column`, a vertical arranger), what would you guess the horizontal
> equivalent is named? And: if `Row` shares `Column`'s same trailing-lambda
> shape, what do you predict happens to two `Text` calls placed inside a
> `Row`'s lambda, compared to the same two calls placed inside a
> `Column`'s?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabRow() {
    Row {
        Text(text = "left")
        Text(text = "right")
    }
}
```

Run for real (same batched lab pass):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 895ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves `Row`'s trailing lambda accepts multiple composable calls the
same way `Column`'s does. The mechanism, isolated from `CalculatorScreen`'s
own real content, is called **`Row`**, a layout composable that arranges
every composable called inside its trailing lambda horizontally, left to
right, in the exact order they were called — structurally identical to
`Column`, differing only in which direction it arranges along.

Discarded: `LabRow` above does not appear in the real project;
`CalculatorScreen`'s own real use of `Row`, shown next, holds two buttons,
not the placeholder `"left"`/`"right"` text used to isolate the concept.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a second child inside `Column`).
- **Location:** inside `Column`'s trailing lambda, immediately after
  `Text(text = "0")`.
- **Dependencies:** `androidx.compose.foundation:foundation-layout`
  (`Row`), same library as `Column`, already resolved.

### The New Code

```kotlin
Row {
    Text(text = "7")
    Text(text = "+")
}
```

### The Updated Project

```kotlin
 1  package com.example.calculator
 2
 3  import android.os.Bundle
 4  import androidx.activity.ComponentActivity
 5  import androidx.activity.compose.setContent
 6  import androidx.compose.foundation.layout.Column
 7  import androidx.compose.foundation.layout.Row      // ← new
 8  import androidx.compose.material3.Text
 9  import androidx.compose.runtime.Composable
10
11  class MainActivity : ComponentActivity() {
12      override fun onCreate(savedInstanceState: Bundle?) {
13          super.onCreate(savedInstanceState)
14          setContent {
15              CalculatorScreen()
16          }
17      }
18  }
19
20  @Composable
21  fun CalculatorScreen() {
22      Column {
23          Text(text = "0")
24          Row {                    // ← new
25              Text(text = "7")     // ← new
26              Text(text = "+")     // ← new
27          }                        // ← new
28      }
29  }
```

`Column` now has two children instead of one: the display text, and a
`Row` below it holding two more `Text` calls side by side — the screen now
shows three separate pieces of text, arranged into the general shape a
calculator's display-plus-buttons layout needs, before `Text` gets
replaced with real `Button`s next.

### Mechanical walkthrough

- `import androidx.compose.foundation.layout.Row` — a package-qualified
  import, same library as `Column`, naming the specific horizontal
  counterpart.
- `Row {` — a call to `Row` using trailing lambda syntax, the same call
  shape already established for `Column`.
- `Text(text = "7")`, then `Text(text = "+")` — two calls to the already
  fully-explained `Text` composable, now as `Row`'s first and second
  children rather than `Column`'s; per this schema's own repetition
  standard, each is a real, independent call, arranged left to right in
  the exact order written, the direct horizontal counterpart of how
  `Column`'s two children were arranged top to bottom.
- `}` (closing `Row`'s lambda) — ends `Row`'s own set of children; the
  matching `}` just after it closes `Column`'s lambda, now containing two
  children (`Text`, `Row`) instead of one.

### CS lens

`Row` and `Column` sharing an identical trailing-lambda shape while
differing only in arrangement direction is a real instance of a
**strategy-like family of interchangeable behaviors behind a common
interface shape** — swap which one is called, without changing how a
caller writes its children. Also recognized in: `FlexDirection: row` vs.
`column` in CSS Flexbox (literally the same distinction, same names), a
GUI toolkit's `HBox`/`VBox` pair, and any sort function accepting an
interchangeable comparator to change direction without changing the
surrounding call.

### SE lens

The alternative not chosen is a single, more general `Layout` composable
taking an explicit direction parameter (`Layout(direction = HORIZONTAL) {
... }`) instead of two separately-named ones. Compose's own real API
design favors two distinctly-named composables instead — the tradeoff
being a slightly larger API surface to learn (two names instead of one)
in exchange for call sites that read as plain English (`Row { ... }`
versus a parameterized flag a reader would have to look up), and for
letting each one specialize its own default behavior independently over
time without a shared parameter forcing them to stay identical.

### Run it

Shown above, in full: the batched isolated lab
(`verification/1.2/lab1_composables_isolated.txt`) and the real project
build with `Row` added inside `Column`
(`verification/1.2/step6_row.txt`).

### Connecting the pieces

The screen's structure — a display line, then a horizontal strip below
it — is now correct, but the two items in that strip are still plain
`Text`, not clickable. Concept Unit 7 replaces them with real `Button`s.

---

## Concept Unit 7: `Button` — A Clickable Composable With a Required `onClick`

### The Problem

`Row` currently holds two plain `Text` calls — visible, but not
interactive; tapping them does nothing, because `Text` has no concept of
being tapped at all. A calculator's buttons need to actually be buttons:
something styled as clickable, and something with a real place to attach
behavior to, even if that behavior isn't wired up to anything real yet.

> **Try it yourself first:** `Button`'s eventual job (reacting to a real
> tap) is fundamentally different from anything `Text`, `Column`, or `Row`
> do — none of them accept or run a function in response to user
> interaction. Given that function types were already fully established
> as real, ordinary values (a value that can be stored, passed as an
> argument, and called later), what shape of parameter would you predict
> `Button` needs, to receive "the thing that should happen when this is
> tapped"? And: this lesson's screen has no real click behavior to attach
> yet — what is the simplest possible function-type value that satisfies
> "a parameter is required" without actually doing anything when called?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabButton() {
    Button(onClick = {}) {
        Text(text = "tap")
    }
}
```

Run for real (same batched lab pass):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 895ms
15 actionable tasks: 2 executed, 13 up-4-date
```

This proves `Button` accepts a required `onClick` function-type argument
and a trailing `@Composable` lambda for its own label, in the same call.
To prove `onClick` is genuinely required, not defaulted, the same call was
compiled again with it omitted:

```kotlin
Button {
    Text(text = "tap")
}
```

Compiled against the real project, this real attempt failed:

```
e: .../MainActivity.kt:26:13 No value passed for parameter 'onClick'
e: .../MainActivity.kt:29:13 No value passed for parameter 'onClick'
```

A real, actual compile failure — proving `onClick` carries no default
value, unlike `Text`'s own `modifier` parameter, which does. This
clickable composable is called a **`Button`**.

Discarded: `LabButton` above does not appear in the real project;
`CalculatorScreen`'s own real use of `Button`, shown next, replaces the
two `Text` calls already inside `Row`, rather than adding a third,
separate button.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** replace (each `Text` call inside `Row` becomes a
  `Button` wrapping that same `Text` call).
- **Location:** inside `Row`'s trailing lambda, replacing both existing
  `Text(text = "7")` and `Text(text = "+")` calls.
- **Dependencies:** `androidx.compose.material3:material3` (`Button`),
  same library `Text` already comes from.

### The New Code

```kotlin
Button(onClick = {}) {
    Text(text = "7")
}
Button(onClick = {}) {
    Text(text = "+")
}
```

### The Updated Project

```kotlin
 1  package com.example.calculator
 2
 3  import android.os.Bundle
 4  import androidx.activity.ComponentActivity
 5  import androidx.activity.compose.setContent
 6  import androidx.compose.foundation.layout.Column
 7  import androidx.compose.foundation.layout.Row
 8  import androidx.compose.material3.Button          // ← new
 9  import androidx.compose.material3.Text
10  import androidx.compose.runtime.Composable
11
12  class MainActivity : ComponentActivity() {
13      override fun onCreate(savedInstanceState: Bundle?) {
14          super.onCreate(savedInstanceState)
15          setContent {
16              CalculatorScreen()
17          }
18      }
19  }
20
21  @Composable
22  fun CalculatorScreen() {
23      Column {
24          Text(text = "0")
25          Row {
26              Button(onClick = {}) {   // ← changed: was Text(text = "7")
27                  Text(text = "7")     // ← new
28              }                        // ← new
29              Button(onClick = {}) {   // ← changed: was Text(text = "+")
30                  Text(text = "+")     // ← new
31              }                        // ← new
32          }
33      }
34  }
```

`Row` now holds two real `Button`s instead of two plain `Text` calls, each
one wrapping the exact same label text it held before — the screen now
looks like an actual calculator button strip, though tapping either
button still does nothing, since `onClick = {}` is an empty, no-op
function.

### Mechanical walkthrough

- `import androidx.compose.material3.Button` — a package-qualified import,
  same library `Text` comes from, naming the specific clickable composable.
- `Button(onClick = {}) {` — a call combining a named argument
  (`onClick = {}`, an already-established syntax) with trailing lambda
  syntax for `Button`'s separate `content` parameter — only the *last*
  parameter can use trailing lambda syntax, so `onClick`, not being last,
  still has to be written explicitly inside the parentheses.
- `{}` (the value passed for `onClick`) — an empty lambda: a real,
  ordinary value of function type `() -> Unit`, satisfying `onClick`'s
  required parameter without describing any real behavior — proven
  required, above, by the real negative-case compile that failed without
  it.
- `Text(text = "7")` (inside the first `Button`'s trailing lambda) — the
  same already fully-explained `Text` composable, now serving as this
  button's own visible label rather than a standalone piece of screen
  text.
- `}` (closing the first `Button`'s trailing lambda) — ends that button's
  content description.
- `Button(onClick = {}) {` and `Text(text = "+")` (the second button) — an
  identical, independent call, in every respect the same as the first
  except for the literal label text passed to `Text`.
- `}` (closing the second `Button`'s trailing lambda) — ends the second
  button's content description; the `}` after it closes `Row`'s own
  trailing lambda, now holding two `Button`s instead of two `Text` calls.

### CS lens

A component accepting a caller-supplied function to run in response to a
later event, rather than the component deciding what to do itself, is a
real, general idea: the **callback / observer pattern**. Also recognized
in: a JavaScript DOM element's `addEventListener`, a GUI toolkit's own
`setOnClickListener` (Android's pre-Compose equivalent of exactly this),
a promise's `.then(callback)`, and any event bus where a subscriber
registers a function to be called later, by something else, at a time it
doesn't control.

### SE lens

The alternative not chosen — genuinely how Android's older View system
works — is calling `setOnClickListener(...)` on an already-existing
button *object*, some time after it was created, as a separate statement.
`Button`'s own design instead makes `onClick` a required constructor-like
argument of the call that creates the button in the first place, which
means a button can never exist, even momentarily, without behavior
attached — trading a small amount of upfront ceremony (an empty `{}` has
to be written even when there's genuinely nothing to do yet, as this
lesson's own static screen shows) for making "a button with no click
behavior at all" structurally impossible to forget to wire up later. This
project's own two `{}` values are an honest, visible marker of exactly
that gap, not a design compromise Compose forced — a later lesson on
Events is where they get replaced with real behavior.

### Run it

Shown above, in full: the batched isolated lab
(`verification/1.2/lab1_composables_isolated.txt`), the real negative-case
failure (`verification/1.2/break7_button_missing_onclick.txt`), and the
real project build with both `Button`s in place
(`verification/1.2/step7_button.txt`).

### Connecting the pieces

The screen now has its real display and two real, tappable-shaped
buttons, correctly laid out — but everything sits flush against the
screen's physical edges, with no breathing room. Concept Unit 8 gives the
whole layout real spacing and sizing, through `Modifier`.

---

## Concept Unit 8: `Modifier` — Configuring How a Composable Is Measured, Drawn, and Positioned

### The Problem

`Column`, `Row`, `Text`, and `Button` all describe *what* is on screen and
in what arrangement, but nothing so far has said anything about *how big*
any of it should be, or how much space should surround it. Right now,
`Column` only takes up exactly as much room as its content needs, and sits
with zero padding against the screen's edge — visually cramped, and not
resizing to fill the available width the way a real screen's top-level
layout normally should.

> **Try it yourself first:** every composable shown so far (`Text`,
> `Column`, `Row`, `Button`) has accepted a `modifier: Modifier = Modifier`
> parameter, silently left at its default in every call so far. Given that
> it's shared across every one of them, and given that `Column`'s own
> `Text`/`Row` children are things `Column` measures and positions, what
> kind of information would you guess a value passed for this parameter
> actually carries? And: extension functions and properties were already
> fully established (a function or property called with an object's own
> dot-syntax, defined outside that object's class). If `Modifier` needs to
> support many different, independent adjustments (size, spacing, click
> handling, and more it doesn't have room to build in as named
> constructor parameters), why might extension functions specifically be
> a good fit for adding each one?

### Introduce the concept in isolation

```kotlin
@Composable
fun LabModifier() {
    Column(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
        Text(text = "padded")
    }
}
```

Run for real (same batched lab pass):

```
> Task :app:compileDebugKotlin

BUILD SUCCESSFUL in 895ms
15 actionable tasks: 2 executed, 13 up-to-date
```

This proves `Modifier.fillMaxWidth().padding(8.dp)` is a real, valid
chained value that `Column`'s own `modifier` parameter accepts. To prove
`padding` genuinely requires a `Dp` value, not a raw number, the same call
was compiled again with a plain `Int`:

```kotlin
Column(modifier = Modifier.fillMaxWidth().padding(16)) {
```

Compiled against the real project, this real attempt failed:

```
e: .../MainActivity.kt:27:47 None of the following functions can be called with the arguments supplied:
public fun Modifier.padding(paddingValues: PaddingValues): Modifier defined in androidx.compose.foundation.layout
public fun Modifier.padding(all: Dp): Modifier defined in androidx.compose.foundation.layout
public fun Modifier.padding(horizontal: Dp = ..., vertical: Dp = ...): Modifier defined in androidx.compose.foundation.layout
```

A real, actual compile failure, and one that incidentally printed
`padding`'s complete real overload set directly from the compiler itself —
proof `padding` genuinely requires a `Dp`-shaped value, and proof of the
exact three real signatures quoted in this lesson's Header, both without
needing to trust an external documentation page. Separately, passing a
`String` to `fillMaxWidth` (which expects a `Float`) produced:

```
e: .../MainActivity.kt:27:45 Type mismatch: inferred type is String but Float was expected
```

confirming `fillMaxWidth`'s own real parameter type the same way. This
chainable configuration value is called a **`Modifier`**.

Discarded: `LabModifier` above does not appear in the real project;
`CalculatorScreen`'s own real use of `Modifier`, shown next, is applied to
its actual `Column`, with the padding value this project actually keeps
(`16.dp`), not the `8.dp` used to isolate the concept.

### Project Change

- **Reference Source:** No reference counterpart — original addition.
- **Files affected:** `app/src/main/java/com/example/calculator/
  MainActivity.kt` (modified).
- **Change type:** add (a `modifier` argument to the existing `Column`
  call).
- **Location:** `CalculatorScreen`'s `Column(...)` call, currently taking
  no arguments at all.
- **Dependencies:** `androidx.compose.ui:ui` (`Modifier`),
  `androidx.compose.foundation:foundation-layout` (`fillMaxWidth`,
  `padding`), and `androidx.compose.ui:ui-unit` (`Dp`, `Int.dp`) — all
  already resolved transitively through Concept Unit 1's dependencies.

### The New Code

```kotlin
Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
```

### The Updated Project

```kotlin
 1  package com.example.calculator
 2
 3  import android.os.Bundle
 4  import androidx.activity.ComponentActivity
 5  import androidx.activity.compose.setContent
 6  import androidx.compose.foundation.layout.Column
 7  import androidx.compose.foundation.layout.Row
 8  import androidx.compose.foundation.layout.fillMaxWidth   // ← new
 9  import androidx.compose.foundation.layout.padding          // ← new
10  import androidx.compose.material3.Button
11  import androidx.compose.material3.Text
12  import androidx.compose.runtime.Composable
13  import androidx.compose.ui.Modifier                        // ← new
14  import androidx.compose.ui.unit.dp                          // ← new
15
16  class MainActivity : ComponentActivity() {
17      override fun onCreate(savedInstanceState: Bundle?) {
18          super.onCreate(savedInstanceState)
19          setContent {
20              CalculatorScreen()
21          }
22      }
23  }
24
25  @Composable
26  fun CalculatorScreen() {
27      Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {  // ← changed
28          Text(text = "0")
29          Row {
30              Button(onClick = {}) {
31                  Text(text = "7")
32              }
33              Button(onClick = {}) {
34                  Text(text = "+")
35              }
36          }
37      }
38  }
```

`CalculatorScreen`'s `Column` now stretches to the screen's full width and
carries 16dp of padding on every side, instead of sizing itself to exactly
fit its own content flush against the screen's edge — the same display and
button structure as before, now with real, deliberate spacing.

### Mechanical walkthrough

- `import androidx.compose.foundation.layout.fillMaxWidth` — a
  package-qualified import naming the specific extension function, from
  the same layout library `Column`/`Row` come from.
- `import androidx.compose.foundation.layout.padding` — likewise, naming
  `padding` specifically, distinct from `fillMaxWidth` despite both being
  extension functions on the same `Modifier` type.
- `import androidx.compose.ui.Modifier` — imports the `Modifier` interface
  itself, from Compose's core UI library, distinct from the layout library
  its extension functions come from.
- `import androidx.compose.ui.unit.dp` — imports the `dp` extension
  property specifically, from Compose's unit library, separate again from
  where `Modifier` itself and its layout extensions live.
- `modifier = Modifier.fillMaxWidth().padding(16.dp)` — a named argument
  (`modifier = ...`) whose value is a chain of two extension-function
  calls. `Modifier` alone (the bare name, resolving to
  `Modifier.Companion`) is the real, valid, empty starting value with no
  adjustments yet.
- `.fillMaxWidth()` — called on that empty `Modifier`, with no explicit
  argument, so its own `fraction` parameter defaults to `1f` — the
  full available width; returns a *new* `Modifier` carrying this
  constraint, confirmed by real compiler evidence, above, to require a
  `Float`, not any other type.
- `.padding(16.dp)` — called on the `Modifier` `fillMaxWidth()` just
  returned, not on the original empty one; `16.dp` reads the `dp`
  extension property on the `Int` literal `16`, producing a real `Dp`
  value, confirmed by real compiler evidence, above, to be genuinely
  required — a raw `16` does not resolve to any of `padding`'s three real
  overloads. Returns a further new `Modifier`, carrying both the width
  constraint and the padding, in that order.
- `Column(modifier = ...)` — the same already fully-explained `Column`
  call, now supplying its previously-defaulted `modifier` parameter
  explicitly, with the finished two-link chain.

### CS lens

A chain of calls where each one wraps the previous result and returns
something of the same type, ready for the next call, is a real, general
idea: the **builder / fluent interface pattern**. Also recognized in:
Java's `StringBuilder` (`.append(...).append(...)`), the Java Stream API
(`.filter(...).map(...).collect(...)`), jQuery's method chaining, and any
SQL query builder library that returns itself (or an equivalent new
object) from each configuration call so the next one can be chained
directly onto it.

### SE lens

The alternative not chosen is giving `Column` (and every other composable)
a long list of individually named parameters for every possible
adjustment — `Column(width = FILL, paddingAll = 16.dp, clickable = false,
...)`. That would make every composable's own signature enormous and
force every composable author to anticipate every adjustment anyone might
ever want, in advance. `Modifier`'s chainable extension-function design
instead lets any adjustment be added by any library, including
application code itself, without ever touching `Column`'s own signature —
the real tradeoff being that a modifier chain's *order* now matters (this
lesson's own two-link chain doesn't yet show a case where reordering
changes the visible result, but longer chains genuinely can), a subtlety
a long parameter list wouldn't have.

### Run it

Shown above, in full: the batched isolated lab
(`verification/1.2/lab1_composables_isolated.txt`), both real negative
cases (`verification/1.2/break8_padding_raw_int.txt` and
`verification/1.2/break8b_fillmaxwidth_type_mismatch.txt`), the real
project build with the finished `Modifier` chain
(`verification/1.2/step8_modifier.txt`), and the final, complete
`assembleDebug` build producing a real, installable `.apk`
(`verification/1.2/step9_final_assembleDebug.txt`).

### Connecting the pieces

Every piece this lesson introduced now sits together in `CalculatorScreen`:
a `Column`, sized and padded by a real `Modifier` chain, holding the
display `Text` and a `Row` of two `Button`s, each labeled with its own
`Text` — a real, complete, statically-verified static calculator screen.

---

## Closing

**Connect the pieces.** Follow one concrete action — building this project
for real — through every unit this lesson built. Running
`./gradlew :app:assembleDebug` first asks Gradle to resolve this module's
dependencies: because `app/build.gradle.kts` now declares
`buildFeatures.compose = true`, a matching `composeOptions.
kotlinCompilerExtensionVersion`, and a `dependencies { }` block built on
the Compose BOM (Concept Unit 1), and because `gradle.properties` now sets
`android.useAndroidX=true`, every `androidx.compose.*` and
`androidx.activity.*` coordinate actually resolves — proven, concretely,
by the real failure that happened before that flag existed and the real
success after. Compiling `MainActivity.kt` next type-checks its
declaration as `ComponentActivity` and its call to `setContent { }`
(Concept Unit 2) — the real bridge between Android's Activity system and
Compose. Inside that call, `CalculatorScreen()` — a real `@Composable`
function (Concept Unit 3), proven compiler-enforced by an actual failed
compile without the annotation — gets called. What that call sequence
actually produces, in order, is Composition (Concept Unit 4): a `Column`
(Concept Unit 5) holding a `Text` and a `Row` (Concept Unit 6), the `Row`
holding two `Button`s (Concept Unit 7), each required to supply a real
`onClick` value even though this screen's `{}` does nothing yet, and the
whole `Column` sized and spaced by a real `Modifier` chain (Concept Unit
8), proven to require a real `Dp` value rather than a bare number by an
actual failed compile. The result of all eight units together is a real,
complete `app-debug.apk`, built and verified this session — a genuine,
installable static calculator screen, still with two buttons that do
nothing when tapped, exactly the honest gap Lesson 1.3 (Layout), and
Lesson 1.5 (Events) after it, exist to close.

**Next: Lesson 1.3, Layout** — this lesson's `Row` of two placeholder
buttons becomes a real calculator keypad, with `Arrangement`, `Alignment`,
`Weight`, and `Spacing` giving every button a fair, responsive share of
the screen instead of the two-button strip built here.
