# Lesson 3.6: A Response You Can Feel

- **What you will build** — a real, physical haptic pulse on every real
  keypad button press, felt through the device itself rather than seen
  on screen, plus a real, permanent, automated test proving the
  underlying call actually fires on a press — without needing real
  vibration hardware to prove it. The transferable problem: a touch
  interface's only real feedback channel used to be purely visual — the
  button changes color, or the display updates — but a real finger
  pressing a real piece of glass gets no physical confirmation at all
  from sight alone; a real, felt pulse closes that gap, and it does so
  for a user who might not even be looking at the screen at the exact
  moment they press.
- **What you need to know first** — Lesson 3.2's `CalculatorButton`;
  Lesson 3.1's `MaterialTheme` and `CalculatorTheme`, this project's own
  first real example of a value made ambient rather than explicitly
  passed down; Lesson 1.4's Robolectric-based Compose UI testing,
  `composeTestRule`, `onNodeWithTag`, and `performClick`; Lesson 2.2's
  `assertEquals`.

## Terms used in this lesson

- **`@Composable`** — an annotation marking a function as one the
  Compose compiler can call as part of building up the UI, tracking
  which state it reads while running so it knows exactly which
  functions to re-run when that state later changes.
- **`CompositionLocal`** — a real Compose mechanism for making one value
  implicitly available to every composable nested underneath a specific
  point in the UI tree, without that value being passed as an explicit
  parameter through every function call in between. It exists so a
  cross-cutting value — a theme, a font scale, or, this lesson's own
  subject, a way to trigger haptic feedback — doesn't have to be
  threaded through every single composable's own parameter list just to
  reach the few call sites that actually need it. This project's own
  `MaterialTheme.colorScheme`/`.typography`/`.shapes`, already real and
  already used since this project first built `Theme.kt`, are themselves
  values read this exact same way — this lesson is the first time this
  project names the underlying mechanism directly, rather than just
  using one specific instance of it.

## Objects and methods used

- **`LocalHapticFeedback`** *(this lesson's own new Compose value)*
  - *What it is:* the real, specific `CompositionLocal` giving any
    composable underneath it access to a way of triggering real,
    physical haptic feedback.
  - *Implementation:* a real, public, top-level property, declared
    `val LocalHapticFeedback: ProvidableCompositionLocal<HapticFeedback>`
    — confirmed this session, since `LocalHapticFeedback provides
    fakeHaptic` only compiles against a real `ProvidableCompositionLocal
    <T>` receiver, not the more general, read-only `CompositionLocal<T>`.
    Reading its own current real value inside a composable, `Local
    HapticFeedback.current`, returns a real `HapticFeedback`.
  - *Its use:* the one real way this project's code reaches an actual
    haptic-triggering mechanism, without `CalculatorButton` needing a
    `HapticFeedback` parameter threaded down from `MainActivity`.
  - *Type:* a top-level, public, real `val` of type
    `ProvidableCompositionLocal<HapticFeedback>`.
  - *Responsibility:* to hold whichever real `HapticFeedback`
    implementation is currently in scope, and hand it to any composable
    that reads `.current`.
  - *Depends on:* nothing to read from — a real, working default
    implementation is always present, supplied automatically by the
    Android platform integration this project's own Compose setup
    already includes.
  - *Connects to:* read by `CalculatorButton`; overridden, in this
    lesson's own real, permanent test, by `CompositionLocalProvider`,
    below.
  - *Shape:* a public Compose UI platform API, `androidx.compose.ui
    .platform.LocalHapticFeedback` — already on this project's real
    compile classpath since Lesson 1.2 first added `androidx.compose.ui
    :ui`, no new Gradle dependency required.

- **`HapticFeedback`** and **`performHapticFeedback`** *(this lesson's
  own new Compose interface and its one real method)*
  - *What it is:* the real interface representing "a thing capable of
    triggering real, physical haptic feedback," and its own single real
    method, the one actual call that does so.
  - *Implementation:* `interface HapticFeedback { fun
    performHapticFeedback(hapticFeedbackType: HapticFeedbackType) }` —
    exactly one real, abstract method; any real class implementing this
    interface must supply it.
  - *Its use:* `CalculatorButton` calls `performHapticFeedback` once, on
    every real button press; this lesson's own new, permanent test
    supplies its own separate, real implementation of the whole
    interface, to make that call inspectable.
  - *Type:* a public interface with one real abstract method.
  - *Responsibility:* to trigger exactly one real haptic effect, of
    whichever real `HapticFeedbackType` it's given.
  - *Depends on:* a real `HapticFeedbackType` argument.
  - *Connects to:* obtained via `LocalHapticFeedback.current`; called by
    `CalculatorButton`; a second, separate, real implementation supplied
    by this lesson's own test.
  - *Shape:* a public Compose UI API, `androidx.compose.ui.hapticfeedback
    .HapticFeedback` — the real seam between this project's own code and
    the Android platform's actual vibration hardware.

- **`HapticFeedbackType`** *(this lesson's own new Compose type)*
  - *What it is:* the real, closed set of haptic effects Compose's own
    `HapticFeedback` interface can trigger.
  - *Implementation:* a real Kotlin value class; its own companion object
    exposes exactly two real constants on this project's own currently
    installed Compose UI version, confirmed this session by disassembling
    the real, installed `.jar` with `javap`: `HapticFeedbackType
    .LongPress` and `HapticFeedbackType.TextHandleMove` — no `Confirm`,
    `Reject`, or other type exists in this specific real, installed
    version, regardless of what a newer Compose release might add.
  - *Its use:* `LongPress`, despite its name, is this real API's own
    general-purpose "confirm a tap" haptic effect — used here for every
    real keypad button press, not specifically for a long press gesture.
  - *Type:* a Kotlin `value class`, confirmed this session via real
    `javap` output showing its own real `box-impl`/`unbox-impl` methods —
    a genuinely different real kind from an ordinary class or an
    `enum class`.
  - *Responsibility:* to represent exactly one real, named haptic effect,
    from a closed, real set Compose itself defines.
  - *Depends on:* nothing — its own real values are premade constants.
  - *Connects to:* passed into `performHapticFeedback`; read back out by
    this lesson's own new, permanent test.
  - *Shape:* a public Compose UI API, this project's own first real use
    of a Kotlin value class from an external library.

- **`CompositionLocalProvider`** *(this lesson's own new Compose
  function)*
  - *What it is:* the real Compose function that overrides one or more
    real `CompositionLocal` values for everything composed inside its
    own `content` lambda.
  - *Implementation:* `@Composable fun CompositionLocalProvider(vararg
    values: ProvidedValue<*>, content: @Composable () -> Unit)` — each
    real `ProvidedValue` built by a real, infix `provides` call, e.g.
    `LocalHapticFeedback provides fakeHaptic`.
  - *Its use:* lets this lesson's own new, permanent test substitute a
    real, custom `HapticFeedback` implementation in place of the real
    platform default, for exactly the one composable subtree under test.
  - *Type:* a top-level `@Composable` function, accepting a real
    `vararg`.
  - *Responsibility:* to make every composable inside its own `content`
    read the given, overridden values from `.current`, instead of
    whatever value was in scope outside it.
  - *Depends on:* one or more real `ProvidedValue` arguments and a
    `content` lambda.
  - *Connects to:* wraps `CalculatorScreen` inside this lesson's own new
    test; its own override is read by `CalculatorButton`'s existing
    `LocalHapticFeedback.current` call, completely unaware anything was
    substituted.
  - *Shape:* a public Compose runtime API, this project's own first real
    use of dependency substitution through a `CompositionLocal`.

### Everything else in the file, not this lesson's subject but still explained

- **`Button`**
  - *What it is:* the real Material3 composable rendering a clickable
    button.
  - *Implementation:* `@Composable fun Button(onClick: () -> Unit,
    modifier: Modifier = Modifier, ..., content: @Composable RowScope
    .() -> Unit)`.
  - *Its use:* this lesson's own isolated lab wraps one real, plain
    `Button` directly; this project's own real, permanent keypad already
    wraps every real button through `CalculatorButton` instead,
    unchanged by this lesson.
  - *Type:* a top-level `@Composable` function.
  - *Responsibility:* to render a real, styled, clickable surface and run
    a caller-supplied `onClick` the moment it's tapped.
  - *Depends on:* an `onClick` callback; its `content` lambda.
  - *Connects to:* called directly by this lesson's own throwaway lab;
    wrapped, in this project's own real code, by `CalculatorButton`.
  - *Shape:* a public Material3 API, unchanged from where it was first
    introduced.

- **`Text`**
  - *What it is:* the real Material3 composable rendering a string as
    visible text on screen.
  - *Implementation:* `@Composable fun Text(text: String, modifier:
    Modifier = Modifier, ...)`.
  - *Its use:* labels this lesson's own throwaway lab button.
  - *Type:* a top-level `@Composable` function.
  - *Responsibility:* to lay out and draw one real string.
  - *Depends on:* a `text: String`.
  - *Connects to:* called inside this lesson's own lab `Button`.
  - *Shape:* a public Material3 API, unchanged from where it was first
    introduced.

- **`Modifier.testTag`**
  - *What it is:* the real Compose UI `Modifier` extension attaching a
    real, stable identifier to a composable's own semantics node, for a
    test to find it by later.
  - *Implementation:* `fun Modifier.testTag(tag: String): Modifier`.
  - *Its use:* tags this lesson's own lab button, `"labHapticButton"`, so
    its own real test can find it.
  - *Type:* an extension function on `Modifier`.
  - *Responsibility:* to record one real string identifier on a
    composable's own semantics node.
  - *Depends on:* a `tag: String`.
  - *Connects to:* set inside this lesson's own lab composable's
    `Modifier` chain; read by `onNodeWithTag`, below.
  - *Shape:* a public Compose UI API, unchanged from where it was first
    introduced.

- **`onNodeWithTag`**
  - *What it is:* the real Compose UI testing finder that locates a node
    in the semantics tree by its exact `testTag`.
  - *Implementation:* `fun onNodeWithTag(testTag: String,
    useUnmergedTree: Boolean = false): SemanticsNodeInteraction`.
  - *Its use:* finds this lesson's own real lab button, and, separately,
    a real keypad button in this project's own real, permanent test.
  - *Type:* a top-level test function.
  - *Responsibility:* to search the current real semantics tree for
    exactly one node whose `testTag` matches.
  - *Depends on:* a real, already-composed UI tree.
  - *Connects to:* called by both of this lesson's own real tests; its
    own result is handed straight into `performClick`, below.
  - *Shape:* a public Compose UI testing API, unchanged from where it
    was first introduced.

- **`performClick`**
  - *What it is:* the real Compose UI testing action that simulates a
    real, physical tap on a real, found node.
  - *Implementation:* `fun SemanticsNodeInteraction.performClick():
    SemanticsNodeInteraction`.
  - *Its use:* triggers this lesson's own real button's `onClick`, the
    same real call path an actual physical tap would trigger.
  - *Type:* an extension function on `SemanticsNodeInteraction`.
  - *Responsibility:* to dispatch a real, simulated click event to the
    found node.
  - *Depends on:* a real, already-found `SemanticsNodeInteraction`.
  - *Connects to:* called right after `onNodeWithTag`, in both of this
    lesson's own real tests.
  - *Shape:* a public Compose UI testing API, unchanged from where it
    was first introduced.

- **`assertEquals`**
  - *What it is:* the real, static JUnit assertion comparing an expected
    and an actual real value for equality.
  - *Implementation:* `org.junit.Assert.assertEquals(Object expected,
    Object actual)`, among its own eleven other real overloads.
  - *Its use:* confirms this lesson's own fake `HapticFeedback` actually
    recorded the real, expected `HapticFeedbackType.LongPress`.
  - *Type:* a `static` Java method, called here as a top-level Kotlin
    function via `import`.
  - *Responsibility:* to fail the test, with a real, descriptive message,
    if the two real values it's given aren't equal.
  - *Depends on:* an expected and an actual value.
  - *Connects to:* called at the end of both of this lesson's own real
    tests.
  - *Shape:* a public JUnit API, unchanged from where it was first
    introduced.

- **`assertNull`**
  - *What it is:* the real, static JUnit assertion confirming a real
    value actually is `null`.
  - *Implementation:* `org.junit.Assert.assertNull(Object actual)`.
  - *Its use:* confirms this lesson's own fake `HapticFeedback` hasn't
    recorded anything yet, before either test's own real button press —
    proving the real call genuinely happens *because of* the click, not
    on composition alone.
  - *Type:* a `static` Java method, called here as a top-level Kotlin
    function via `import`.
  - *Responsibility:* to fail the test if the given real value isn't
    `null`.
  - *Depends on:* one real value to check.
  - *Connects to:* called before either real button press, in both of
    this lesson's own real tests.
  - *Shape:* a public JUnit API, this project's own first real use of
    it.

## Concept Unit: Haptic Feedback

### The Problem

Every real keypad button already gives a sighted user real, visible
feedback the instant it's pressed — Material3's own built-in pressed
state, plus, since the previous lesson, an explicit accessibility label.
But a real finger pressing real glass gets nothing physical back from
any of that — no click, no bump, nothing to feel — unless the app itself
asks the device to produce one. Nobody has ever wired this project's own
real keypad up to Android's own real haptic feedback system at all.

> This project's own `MaterialTheme.colorScheme`/`.typography`/`.shapes`
> are already real values every composable reads without ever receiving
> them as an explicit parameter — `CalculatorButton` never takes a
> `ColorScheme` argument, and yet it reads `MaterialTheme.shapes.small`
> directly. Given that this mechanism already exists and already works
> in this project, what real name would you give the general version of
> that idea — "available anywhere, passed explicitly nowhere"? And if
> haptic feedback needed that exact same kind of access, what would you
> expect its own real API to actually look like, by analogy to
> `MaterialTheme` itself?

### Introduce the Concept in Isolation

```kotlin
@Composable
fun LabHapticButton() {
    val haptic = LocalHapticFeedback.current
    Button(
        onClick = {
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        },
        modifier = Modifier.testTag("labHapticButton")
    ) {
        Text(text = "tap")
    }
}
```

A real, executed test, substituting a real, custom `HapticFeedback`
implementation in place of the platform default, so the real call can be
inspected instead of merely felt:

```kotlin
private class FakeHapticFeedback : HapticFeedback {
    var lastType: HapticFeedbackType? = null
    override fun performHapticFeedback(hapticFeedbackType: HapticFeedbackType) {
        lastType = hapticFeedbackType
    }
}

val fakeHaptic = FakeHapticFeedback()
composeTestRule.setContent {
    CompositionLocalProvider(LocalHapticFeedback provides fakeHaptic) {
        LabHapticButton()
    }
}

assertNull(fakeHaptic.lastType)

composeTestRule.onNodeWithTag("labHapticButton").performClick()

assertEquals(HapticFeedbackType.LongPress, fakeHaptic.lastType)
```

Real output, from this session — the full test passed, real exit code
`0`:

```
BUILD SUCCESSFUL in 4s
27 actionable tasks: 7 executed, 20 up-to-date
```

Two real, separate assertions prove this for real: `fakeHaptic.lastType`
is still `null` right after composing the button — proving nothing fires
just from being drawn — and becomes exactly `HapticFeedbackType
.LongPress` only after the real, simulated click, proving the real call
genuinely happens *because of* the press. This substitution technique —
overriding a `CompositionLocal` with a custom implementation, only for
the duration of one test — is called **dependency substitution**: a real
way to make an otherwise-unobservable side effect (an actual vibration,
which nothing in this environment can feel) inspectable, without
changing one line of the real code under test.

### Discard the Throwaway Example

`LabHapticButton`, `FakeHapticFeedback`, and their own test were written
only to prove `performHapticFeedback` fires on a real click, and that
substituting `LocalHapticFeedback` makes that call inspectable; none of
it is part of the project.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch UX
  addition, motivated by this project's own real, currently-shipped gap
  — no physical feedback at all on any of its sixteen real keypad
  buttons.
- **Files affected** —
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified:
  `CalculatorButton` reads a new local value and wraps its own real
  `onClick`); `app/src/test/java/com/example/calculator/HapticsTest.kt`
  (new file, created).
- **Change type** — add.
- **Location** — `MainActivity.kt`, inside `CalculatorButton`'s own
  body, right before its `Button` call; `CalculatorButton`'s own
  `onClick` argument, passed to the real `Button` it wraps.
- **Dependencies** — `LocalHapticFeedback`/`HapticFeedback`/
  `HapticFeedbackType`, all already real, part of `androidx.compose.ui
  :ui` — an already-real dependency of this project's own build, no new
  Gradle dependency required.

### The New Code

```kotlin
val haptic = LocalHapticFeedback.current
```

### The Updated Project

`CalculatorButton`, in full, with this lesson's own additions marked:

```kotlin
 1  @Composable
 2  fun CalculatorButton(
 3      label: String,
 4      onClick: () -> Unit,
 5      modifier: Modifier = Modifier,
 6      contentDescription: String? = null
 7  ) {
 8      val haptic = LocalHapticFeedback.current               // ← new
 9      Button(
10          onClick = {                                        // ← new
11              haptic.performHapticFeedback(HapticFeedbackType.LongPress)  // ← new
12              onClick()                                      // ← new
13          },                                                 // ← new
14          shape = MaterialTheme.shapes.small,
15          modifier = modifier
16              .testTag(label)
17              .semantics {
18                  contentDescription?.let { this.contentDescription = it }
19              }
20      ) {
21          Text(text = label)
22      }
23  }
```

`CalculatorButton`'s own `onClick` parameter — the real callback every
caller already supplies, unchanged in its own type,
`() -> Unit` — is no longer handed straight to `Button` as-is; it's now
called from *inside* a new lambda that triggers the real haptic pulse
first, then runs the exact same real callback every existing call site
already passes.

### Mechanical Walkthrough

- `val haptic = LocalHapticFeedback.current` — this lesson's own new
  line; reads the real, currently-in-scope `HapticFeedback`
  implementation, the same real mechanism `MaterialTheme.colorScheme`
  already used to make this project's own colors ambient since
  `Theme.kt` was first written.
- `onClick = { ... }` — `Button`'s own existing parameter, now assigned a
  new, real lambda instead of `CalculatorButton`'s own `onClick`
  parameter directly.
- `haptic.performHapticFeedback(HapticFeedbackType.LongPress)` — this
  lesson's own new subject, called first, inside that new lambda;
  triggers a real, physical haptic pulse through whichever real
  `HapticFeedback` implementation `haptic` currently holds.
- `HapticFeedbackType.LongPress` — a real, premade constant, read off
  the real value class's own companion object; despite its own name,
  used here as a general "confirm a tap" effect, not specifically for a
  long-press gesture, per this lesson's own Header entry above.
- `onClick()` — called last, inside the same new lambda; this is
  `CalculatorButton`'s own real, original `onClick` parameter, invoked
  with empty parentheses since it's a real, no-argument function type,
  `() -> Unit` — the exact same real call this project made before this
  lesson, now running one line after the real haptic pulse instead of
  being handed to `Button` directly.

### CS Lens

Making one value implicitly available to an entire subtree, rather than
threading it explicitly through every function call in between, is a
real, general idea: **ambient context** (also called **implicit
dependency injection** in some frameworks, and **dynamic scoping** in
some programming-language theory). Also recognized in: a web browser's
own `document` global, implicitly available to any script running on the
page without being passed as a parameter; a logging framework's own
ambient logger, configured once and used anywhere without threading a
`Logger` object through every function signature; React's own Context
API, the direct JavaScript-world equivalent of Compose's own
`CompositionLocal`, solving exactly the same real "avoid prop drilling"
problem this project's own `MaterialTheme` has already been quietly
relying on since its own colors, typography, and shapes first became
readable from anywhere, with nothing passed down explicitly.

### SE Lens

The alternative already available: pass a real `HapticFeedback` (or
similar) as an explicit parameter, all the way down from `MainActivity`
through `CalculatorScreen` into `CalculatorButton` — the same real shape
this project's own `onClick`/`contentDescription` parameters already
use. The real tradeoff: an explicit parameter is easier to trace by
reading a function's own signature alone, and is what this project has
chosen for everything else so far; a `CompositionLocal` costs that
traceability — `CalculatorButton`'s own signature gives no hint it reads
haptic feedback at all — in exchange for not forcing every composable
between `MainActivity` and `CalculatorButton` to accept and forward a
parameter it has no real use for itself. This lesson didn't choose this
tradeoff; Android's own real platform integration already exposes haptic
feedback exactly this way, through `LocalHapticFeedback` — the real
decision available here was only whether to use the real mechanism
Android provides, not to design a new one from scratch.

### Commands Needed

The isolated lab needed no new command — it lived inside this project's
own real, already-Gradle-wired source tree, compiled and run the same
way as every real project test: `./gradlew :app:testDebugUnitTest
--tests "com.example.calculator.LabHapticsTest"`. Confirming
`HapticFeedbackType`'s own real, available constants needed one further
real command, run once, directly against the actual installed library:
`javap "androidx/compose/ui/hapticfeedback/HapticFeedbackType\$Companion.class"`,
after unzipping the relevant class files out of the real, cached compose-ui
`.jar`. For the real project change: `./gradlew testDebugUnitTest
assembleDebug` — this project's own already-established combined
command.

### Run It

Real output, from this session, after the real project change landed and
the isolated lab was deleted:

```
$ ./gradlew testDebugUnitTest assembleDebug
BUILD SUCCESSFUL in 5s
43 actionable tasks: 10 executed, 33 up-to-date
```

All 21 of this project's pre-existing tests still pass, unchanged, plus
one new, permanent test, `pressingKeypadButtonTriggersHapticFeedback`,
proving the real, unmodified `CalculatorScreen` triggers a real
`HapticFeedbackType.LongPress` call the instant a real keypad button is
pressed — using the exact same dependency-substitution technique this
unit's own isolated lab already proved. This project now has 22 real,
passing tests.

### Connect the Pieces

The isolated lab proved that overriding `LocalHapticFeedback` with a
custom, real implementation makes an otherwise-unobservable physical
side effect fully inspectable in a real, automated test; this unit
applied that same real substitution technique to prove the real,
permanent change — one new line reading `LocalHapticFeedback.current`,
one new lambda calling `performHapticFeedback` before the real, original
`onClick` — actually fires on every one of this project's own sixteen
real keypad buttons, not just the throwaway one the lab used to prove
the mechanism.

## Connect the Pieces

One real value, traced from a press to a pulse: a finger touches the
real `"7"` button. `CalculatorButton`'s own new first line,
`LocalHapticFeedback.current`, reads whichever real `HapticFeedback`
this project's own Android platform integration already supplies —
exactly the same real ambient-value mechanism `MaterialTheme.colorScheme`
already relied on since this project's very first themed color. That
real value's own `performHapticFeedback(HapticFeedbackType.LongPress)`
runs first, producing a real, physical pulse a user can feel even before
looking at the screen; only then does the exact same real `onClick`
this project has called since `nextState(state, "7")` was first wired up
run, updating the display exactly as it always has. Nothing about this
project's own state, its own display, or its own math changed at all —
this lesson added exactly one new ambient read and one new call, and its
own new, permanent test, run against the real, unmodified
`CalculatorScreen`, proves that real call fires on every real press,
using a real technique that needs no actual vibration hardware to trust
it.
