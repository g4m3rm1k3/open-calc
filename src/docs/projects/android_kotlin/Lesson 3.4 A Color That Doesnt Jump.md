# Lesson 3.4: A Color That Doesn't Jump

- **What you will build** — a real, animated color on `CalculatorScreen`'s
  own display: an ordinary calculation stays one color, and the moment
  the display shows an error, it smoothly shifts to a distinct one,
  instead of the two cases looking identical except for the word
  `"Error"` itself. The transferable problem: a value that changes
  instantly, in a single frame, is easy for a user's eye to miss
  entirely; a value that visibly *moves* from its old state to its new
  one, over a short span of real time, is not — and a UI framework can
  make that difference cost almost nothing to add, once a state value is
  already driving what's on screen.
- **What you need to know first** — Lesson 3.3's `CalculatorState`,
  `Display` sealed class, and its exhaustive `when` over
  `Display.Value`/`Display.Error`; Lesson 3.1's `Theme.kt`,
  `CalculatorColorScheme`, `lightColorScheme`, and `MaterialTheme
  .colorScheme`; Lesson 1.4's `remember`, `mutableStateOf`, and `by`
  property delegation; Lesson 1.2's `@Composable` functions and `Text`.

## Terms used in this lesson

- **`@Composable`** — an annotation marking a function as one the
  Compose compiler can call as part of building up the UI, and inside
  which other `@Composable` functions can themselves be called. It
  exists because Compose needs to track, for every such function, which
  state it read while running, so it knows exactly which functions to
  re-run when that state later changes — an ordinary Kotlin function
  gives the compiler no way to track that relationship at all.
- **`by`** — Kotlin's property delegation keyword, handing a property's
  actual `get`/`set` behavior off to a separate delegate object instead
  of the property storing its own value directly. It exists so a
  property can look and read exactly like a plain `var`/`val` at every
  call site, while its real storage and change-notification logic lives
  somewhere else, written once and reused anywhere a matching delegate
  type is available.
- **`sealed class`** — a class that declares, in one place, the complete
  and final set of types allowed to extend it — no other file, now or
  ever, can add another subtype. It exists so a value's real shape can
  be restricted to a known, closed set the compiler can reason about
  completely, and, specifically, so a `when` expression branching over
  every one of those subtypes can be checked for **exhaustiveness** at
  compile time: leaving out a real case is a compile error, not a
  silent runtime gap.

## Objects and methods used

- **`animateColorAsState`** *(this lesson's own new, permanent Compose
  function)*
  - *What it is:* the real Compose function that turns a plain target
    `Color` into a `Color` that arrives at that target gradually, over
    real elapsed time, instead of switching to it the instant the target
    changes.
  - *Implementation:* `@Composable fun animateColorAsState(targetValue:
    Color, label: String = "ColorAnimation"): State<Color>` — this
    lesson calls it with exactly those two real, verified parameters
    (confirmed by a real, successful compile this session, both against
    an isolated lab and against this project's own real code); its real,
    documented signature also accepts two further parameters this lesson
    does not use — an `animationSpec` for customizing the exact curve
    and duration, defaulted here to Compose's own built-in spring-based
    motion instead of a hand-tuned one, and a `finishedListener` callback
    for reacting to the animation's completion. Its return type,
    `State<Color>`, is the same real interface `remember`/`mutableStateOf`
    already return a `MutableState<T>` (a subtype) for: a holder with one
    real property, `val value: T`, that Compose watches for reads inside
    a `@Composable` function.
  - *Its use:* replaces an instant, single-frame color switch with one
    the user's eye can actually watch happen, the moment
    `CalculatorScreen`'s own display state crosses from an ordinary value
    into `Display.Error` or back.
  - *Type:* a top-level `@Composable` function.
  - *Responsibility:* to own one animated value's entire lifecycle —
    remembering its current, real, in-progress `Color`; starting a new
    animation toward a new target whenever that target changes; and
    exposing the value in progress, every recomposition, as a real
    `State<Color>`.
  - *Depends on:* a `targetValue: Color` to animate toward, supplied
    fresh on every call (here, computed by a `when` over the current
    `Display`).
  - *Connects to:* called once, inside `CalculatorScreen`, reading
    `MaterialTheme.colorScheme.onBackground`/`.error` to decide its
    target; its returned `State<Color>` is read, via `by`, into
    `displayColor`, which the display `Text`'s own `color` parameter
    reads in turn.
  - *Shape:* a public Compose animation API, `androidx.compose.animation
    .animateColorAsState` — already present on this project's real
    compile classpath before this lesson touched anything, confirmed by
    running `./gradlew :app:dependencies --configuration
    debugCompileClasspath` for real this session and finding
    `androidx.compose.animation:animation:1.6.8` already resolved,
    pulled in transitively through `androidx.compose.material3:material3
    :1.2.1` — no new Gradle dependency was required to use it.

### Everything else in the file, not this lesson's subject but still explained

- **`MaterialTheme.colorScheme`**
  - *What it is:* the real, live `ColorScheme` instance this project's
    own `CalculatorTheme` builds and makes available to every
    `@Composable` function nested inside it, with no value threaded down
    as an explicit parameter.
  - *Implementation:* a real class exposing, among other real properties,
    the six this project's own `CalculatorColorScheme` sets explicitly:
    `val primary: Color`, `val onPrimary: Color`, `val secondary: Color`,
    `val background: Color`, `val onBackground: Color`, `val error:
    Color` — this lesson reads the last two, `onBackground` and `error`,
    for the first time; every real property name here was confirmed this
    session by a real, successful compile that passed all six as named
    arguments to `lightColorScheme(...)`, below.
  - *Its use:* supplies both real target colors `animateColorAsState`
    animates between — `onBackground` for an ordinary value, `error` for
    `Display.Error`.
  - *Type:* an instance property access, `MaterialTheme.colorScheme`,
    returning a real `ColorScheme` object, followed by a further
    property read on that object.
  - *Responsibility:* to hold this project's own complete, named color
    palette as one object, so every composable reads the same real
    values from one real source instead of each hard-coding its own
    `Color(0x...)` literal.
  - *Depends on:* `CalculatorTheme` having already wrapped the current
    composition with a real `MaterialTheme(colorScheme =
    CalculatorColorScheme, ...)` call, supplying the actual instance this
    property reads.
  - *Connects to:* built by `CalculatorTheme`, in `Theme.kt`; read here,
    by `CalculatorScreen`, to compute `animateColorAsState`'s own real
    `targetValue`.
  - *Shape:* a public Compose/Material3 API, read through, never
    extended — this project's own real colors live in
    `CalculatorColorScheme`, not in a subclass of `ColorScheme` itself.

- **`lightColorScheme`**
  - *What it is:* the real Material3 factory function building a
    complete, light-mode `ColorScheme` from whichever named colors are
    explicitly passed to it, filling in real, sensible defaults for
    every one left unset.
  - *Implementation:* `fun lightColorScheme(primary: Color = ..., ...,
    onBackground: Color = ..., error: Color = ..., ...): ColorScheme` —
    a function accepting many real named `Color` parameters, each with
    its own real default; this project's own call now passes six of them
    explicitly, `onBackground` and `error` newly added by this lesson,
    real names confirmed the same way as `MaterialTheme.colorScheme`'s
    own entry, above — by a real, successful compile.
  - *Its use:* builds `CalculatorColorScheme`, this project's own single,
    named source of truth for every color it uses, now including the two
    this lesson's animation reads.
  - *Type:* a top-level factory function, returning a real `ColorScheme`
    instance.
  - *Responsibility:* to produce one complete, valid `ColorScheme` from
    whatever subset of its real color properties the caller actually
    cares to name.
  - *Depends on:* whichever named `Color` arguments the caller supplies;
    none are required, since every parameter carries a real default.
  - *Connects to:* called once, building `CalculatorColorScheme`, which
    `CalculatorTheme` passes into `MaterialTheme(colorScheme = ...)`.
  - *Shape:* a public Material3 factory function — this project's own
    one real call site for it lives entirely inside `Theme.kt`.

- **`Text`**
  - *What it is:* the real Material3 composable rendering a string as
    visible text on screen.
  - *Implementation:* `@Composable fun Text(text: String, modifier:
    Modifier = Modifier, color: Color = Color.Unspecified, style:
    TextStyle = LocalTextStyle.current, ...)` — this lesson passes a real
    `color` argument to this project's own display `Text` for the first
    time; every earlier lesson's call left it at its own real default,
    `Color.Unspecified`, which defers to Compose's own ambient content
    color instead of naming one explicitly.
  - *Its use:* now reads `displayColor` — the real, in-progress animated
    value — instead of leaving color unset.
  - *Type:* a top-level `@Composable` function.
  - *Responsibility:* to lay out and draw one real string, applying
    whichever of its own real styling parameters — `style`, now `color`
    too — the caller supplies.
  - *Depends on:* a `text: String`; every other parameter, including the
    new `color`, is optional with its own real default.
  - *Connects to:* called by `CalculatorScreen`, reading `state.display
    .toDisplayText()` for its text and, new this lesson, `displayColor`
    for its color.
  - *Shape:* a public Material3 API, unchanged in kind from where it was
    first introduced — only a previously-unused parameter is exercised
    for the first time.

- **`Color`**
  - *What it is:* the real Compose type representing one RGBA color
    value.
  - *Implementation:* a real class with a constructor accepting a packed
    32-bit hex `Long` — `Color(0xFF212121)`, this project's own already-
    established pattern since Lesson 3.1 — and, separately, a set of
    real, premade constant values on its own companion object, including
    `Color.Red` and `Color.Blue`, used only inside this lesson's own
    throwaway lab, never in the real project.
  - *Its use:* `Theme.kt` now constructs two more real `Color` values
    this way, `onBackground`'s and `error`'s; the throwaway lab reads two
    of the premade companion constants directly, needing no hex literal
    at all for a quick, disposable demonstration.
  - *Type:* a value class, immutable once constructed.
  - *Responsibility:* to represent exactly one real color value,
    comparable and usable anywhere a `Color` is expected — a theme
    property, a `Text`'s `color` parameter, an `animateColorAsState`
    target.
  - *Depends on:* either a packed hex `Long` (the constructor) or nothing
    at all (a companion constant, already fully built).
  - *Connects to:* constructed in `Theme.kt`; read by `MaterialTheme
    .colorScheme`; animated by `animateColorAsState`; drawn by `Text`.
  - *Shape:* a public Compose UI graphics type, unchanged from where it
    was first introduced.

- **`remember`**
  - *What it is:* the real Compose function that preserves a value
    across recomposition, tying its lifetime to the composable that
    called it.
  - *Implementation:* `@Composable fun <T> remember(calculation: () ->
    T): T`.
  - *Its use:* this lesson's own throwaway lab uses it to hold a
    `Boolean` toggle across button presses; `CalculatorScreen`'s own,
    already-established use — holding its one `CalculatorState` — is
    unchanged by this lesson.
  - *Type:* a `@Composable` function.
  - *Responsibility:* to hold on to whatever `calculation` first
    produces, across every future recomposition, until the composable
    that called it leaves the composition entirely.
  - *Depends on:* a `calculation` lambda producing the initial value.
  - *Connects to:* wraps `mutableStateOf(...)` at every real call site in
    this project, including the lab's own.
  - *Shape:* a public Compose runtime API, unchanged from where it was
    first introduced.

- **`mutableStateOf`**
  - *What it is:* the real function producing an observable container
    Compose can watch for changes, triggering recomposition when its
    value changes.
  - *Implementation:* `fun <T> mutableStateOf(value: T): MutableState<T>`.
  - *Its use:* this lesson's own throwaway lab wraps a `Boolean` with it,
    to drive the lab's own animated color's real target.
  - *Type:* a top-level function, returning a real `MutableState<T>`
    object — a subtype of `animateColorAsState`'s own return type,
    `State<T>`, above, adding a real, settable `var value: T` on top of
    `State<T>`'s plain, read-only one.
  - *Responsibility:* to notify Compose's own recomposition machinery
    whenever the value it holds is reassigned.
  - *Depends on:* an initial value.
  - *Connects to:* wrapped by `remember`; reassigned by a real button's
    `onClick`, in both the lab and this project's own real
    `CalculatorScreen`.
  - *Shape:* a public Compose runtime API, unchanged from where it was
    first introduced.

- **`Button`**
  - *What it is:* the real Material3 composable rendering a clickable
    button.
  - *Implementation:* `@Composable fun Button(onClick: () -> Unit,
    modifier: Modifier = Modifier, ..., content: @Composable RowScope
    .() -> Unit)`.
  - *Its use:* this lesson's own throwaway lab uses one real, plain
    `Button` directly, to toggle the lab's own target color — this
    project's own real, permanent keypad already wraps every real button
    press through `CalculatorButton` instead, unchanged by this lesson.
  - *Type:* a top-level `@Composable` function.
  - *Responsibility:* to render a real, styled, clickable surface and run
    a caller-supplied `onClick` the moment it's tapped.
  - *Depends on:* an `onClick` callback; its `content` lambda, describing
    what's drawn inside it.
  - *Connects to:* called directly by this lesson's own throwaway lab;
    wrapped, in this project's own real code, by `CalculatorButton`
    instead.
  - *Shape:* a public Material3 API, unchanged from where it was first
    introduced.

## Concept Unit: Animated State

### The Problem

`CalculatorScreen`'s display `Text` has never passed a `color` argument
of its own — every earlier lesson's call left it out entirely. Right
now, the moment a real division produces `Display.Error`, the display's
color does not change at all; the only real signal anything went wrong
is the text itself switching to the word `"Error"`. A user who glances
at the screen without actually reading every character has nothing else
to notice.

> `Text`'s own real signature, above, shows `color: Color =
> Color.Unspecified` sitting right next to `style`, a parameter this
> project already passes on every real call. Given that, what's the
> simplest possible way you already know to make the display turn a
> different color the instant `Display.Error` appears — using nothing
> new at all, just `Display`'s own exhaustive `when` and a parameter
> that's already sitting right there in `Text`'s own signature? Now
> imagine that same color change happening two different ways: switching
> in a single frame, instantly, versus visibly moving from the old color
> to the new one over a short span of real time. Which one do you think
> a user's eye is more likely to actually catch, glancing at the phone
> for half a second — and why would smoothness, specifically, make a
> difference to that?

### Introduce the Concept in Isolation

```kotlin
@Composable
fun LabColorBox() {
    var isRed by remember { mutableStateOf(false) }
    val boxColor by animateColorAsState(
        targetValue = if (isRed) Color.Red else Color.Blue,
        label = "labColor"
    )
    Column {
        Text(text = boxColor.toString(), modifier = Modifier.testTag("labColorText"))
        Button(onClick = { isRed = true }, modifier = Modifier.testTag("labToggle")) {
            Text("Toggle")
        }
    }
}
```

This lab renders `boxColor`'s own real `toString()` output as literal,
readable text — not a colored box — specifically so a real Robolectric
test can read the value out of the semantics tree the same way every
earlier test in this project already reads display text; Robolectric,
per this curriculum's own already-established, standing limitation,
performs no genuine GPU rendering, so an actual colored pixel is not
something a test here could inspect directly.

A real, executed test, with the test clock deliberately paused first so
recomposition doesn't run ahead on its own:

```kotlin
composeTestRule.mainClock.autoAdvance = false
composeTestRule.setContent { LabColorBox() }

composeTestRule.onNodeWithTag("labColorText").assertTextEquals(Color.Blue.toString())

composeTestRule.onNodeWithTag("labToggle").performClick()

composeTestRule.onNodeWithTag("labColorText").assertTextEquals(Color.Blue.toString())

composeTestRule.mainClock.advanceTimeBy(1000)
composeTestRule.waitForIdle()

composeTestRule.onNodeWithTag("labColorText").assertTextEquals(Color.Red.toString())
```

Real output, from this session — the full test passed, real exit code
`0`, real JUnit XML report showing zero failures:

```
BUILD SUCCESSFUL in 7s
27 actionable tasks: 7 executed, 20 up-to-date
```

Two real, specific facts prove this is genuinely **animated state**, not
an instant switch: right after `performClick()` sets `isRed = true` —
with the real animation clock still paused, not one frame advanced —
`boxColor` still reads `Blue`, proving the value did not jump the moment
its target changed. Only after the clock is real, explicitly advanced by
a real `1000` milliseconds does `boxColor` finally read `Red`. If this
were an ordinary, un-animated `if (isRed) Color.Red else Color.Blue`
assigned directly, `boxColor` would already read `Red` immediately after
the click, with no clock advancement needed at all — the pause-then-
advance sequence is what makes the difference between "switches
instantly" and "arrives over time" observable at all in a real,
automated test.

### Discard the Throwaway Example

`LabColorBox` and its own test were written only to prove
`animateColorAsState` produces a value that arrives over real elapsed
time rather than switching instantly; neither is part of the project.

### Project Change

- **Reference Source** — No reference counterpart: a from-scratch polish
  feature, motivated by this project's own real, currently-shipped gap
  (no visual distinction between an ordinary display value and an
  error), not ported from anywhere else.
- **Files affected** —
  `app/src/main/java/com/example/calculator/Theme.kt` (modified:
  `CalculatorColorScheme` gains two new named colors);
  `app/src/main/java/com/example/calculator/MainActivity.kt` (modified:
  a new import, a new animated color value inside `CalculatorScreen`,
  and the display `Text`'s new `color` argument).
- **Change type** — add (two new `lightColorScheme` arguments; one new
  `animateColorAsState` call); configure (`Text`'s previously-unset
  `color` parameter, now given a real value).
- **Location** — `Theme.kt`, inside the existing `lightColorScheme(...)`
  call that builds `CalculatorColorScheme`; `MainActivity.kt`, at the top
  of `CalculatorScreen`'s own body, right after its existing `remember`
  line, and inside the display `Text`'s own argument list.
- **Dependencies** — `Display`/`CalculatorState`, this project's own
  existing sealed-class-and-data-class state model, and
  `MaterialTheme.colorScheme`, this project's own existing live color
  source — both already real; no new Gradle dependency, per the real,
  checked classpath finding in this lesson's own Header entry for
  `animateColorAsState`, above.

### The New Code

```kotlin
val displayColor by animateColorAsState(
    targetValue = when (state.display) {
        is Display.Value -> MaterialTheme.colorScheme.onBackground
        Display.Error -> MaterialTheme.colorScheme.error
    },
    label = "displayColor"
)
```

### The Updated Project

`Theme.kt`'s own `CalculatorColorScheme`, in full, with this lesson's own
additions marked:

```kotlin
 1  private val CalculatorColorScheme = lightColorScheme(
 2      primary = Color(0xFF1565C0),
 3      onPrimary = Color(0xFFFFFFFF),
 4      secondary = Color(0xFFFF6F00),
 5      background = Color(0xFFF5F5F5),
 6      onBackground = Color(0xFF212121),   // ← new
 7      error = Color(0xFFB00020)           // ← new
 8  )
```

`MainActivity.kt`'s own `CalculatorScreen`, in full, with this lesson's
own additions marked:

```kotlin
 1  @Composable
 2  fun CalculatorScreen() {
 3      var state by remember { mutableStateOf(CalculatorState()) }
 4      val displayColor by animateColorAsState(                          // ← new
 5          targetValue = when (state.display) {                          // ← new
 6              is Display.Value -> MaterialTheme.colorScheme.onBackground // ← new
 7              Display.Error -> MaterialTheme.colorScheme.error          // ← new
 8          },                                                             // ← new
 9          label = "displayColor"                                        // ← new
10      )                                                                  // ← new
11      Column(
12          modifier = Modifier.fillMaxWidth().padding(16.dp),
13          verticalArrangement = Arrangement.spacedBy(8.dp),
14          horizontalAlignment = Alignment.CenterHorizontally
15      ) {
16          Text(
17              text = state.display.toDisplayText(),
18              style = MaterialTheme.typography.displayLarge,
19              color = displayColor,                                     // ← new
20              modifier = Modifier.testTag("display")
21          )
22          for (row in keypadRows) {
23              Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
24                  for (label in row) {
25                      CalculatorButton(
26                          label = label,
27                          onClick = { state = nextState(state, label) },
28                          modifier = Modifier.weight(1f)
29                      )
30                  }
31              }
32          }
33      }
34  }
```

`CalculatorScreen` now computes one real, animated `displayColor` before
building any UI at all, and hands it straight to the one `Text` that
needs it — everything else in the function, the `Column`, the keypad's
own nested loops, `CalculatorButton`'s own calls, is exactly what Lesson
3.3 already left it as.

### Mechanical Walkthrough

- `val displayColor` — declares a new, real, local, read-only property
  inside `CalculatorScreen`'s own body, computed fresh on every real
  recomposition.
- `by` — Kotlin's property delegation keyword, explained in full in this
  lesson's own Terms, above: instead of `displayColor` holding a `Color`
  value directly, it hands off to `animateColorAsState`'s own returned
  `State<Color>`, reading that delegate's real `value` property every
  time `displayColor` itself is read.
- `animateColorAsState(...)` — this lesson's own new subject, called
  once per recomposition; its real job, per its own Header entry above,
  is to own one animated `Color`'s entire lifecycle, starting a fresh
  animation toward whatever `targetValue` it's handed whenever that
  target genuinely changes.
- `targetValue = when (state.display) { ... }` — a named argument whose
  real value is computed by a `when` expression, evaluated fresh on
  every call.
- `when (state.display)` — an exhaustive `when` over `Display`, the same
  real, compiler-enforced guarantee this project's own `sealed class
  Display` already proved: because `Display`'s complete, closed set of
  real subtypes is exactly `Value` and `Error`, nothing else, ever, the
  compiler refuses to compile this `when` if either real branch below is
  missing.
- `state.display` — a property read on `CalculatorState`, returning the
  real `Display` value this exact `when` branches over.
- `is Display.Value -> MaterialTheme.colorScheme.onBackground` — matches
  the "ordinary value" case; `is` is required here because `Display
  .Value` is a real `data class`, not a singleton — checking `is Display
  .Value` is what actually narrows `state.display`'s own static type
  from `Display` down to `Display.Value` for this branch. The branch's
  own real result, `MaterialTheme.colorScheme.onBackground`, reads this
  project's own real, newly-set `onBackground` color straight off the
  live `ColorScheme` `CalculatorTheme` built.
- `Display.Error -> MaterialTheme.colorScheme.error` — matches the
  "failed calculation" case directly, by real equality, with no `is`
  needed: `Display.Error` is a real `object`, a single, real instance
  that only ever equals itself, so naming it directly is already a
  complete, valid match. Reads this project's own real, newly-set
  `error` color.
- `label = "displayColor"` — a second named argument, a plain `String`
  literal; per this lesson's own Header entry for `animateColorAsState`,
  this real parameter exists for Android Studio's own animation-
  inspection tooling to label this specific animated value by name, and
  has no effect on the animation's own real behavior.
- `color = displayColor`, inside the display `Text`'s own argument list —
  the one real place this lesson's new value actually reaches the
  screen: `Text`'s own real `color: Color` parameter, left at its own
  default, `Color.Unspecified`, on every earlier call in this project,
  now reads the real, in-progress animated value instead.
- `onBackground = Color(0xFF212121)` and `error = Color(0xFFB00020)`, in
  `Theme.kt`'s own `lightColorScheme(...)` call — two new real named
  arguments, each built the same way this project's own four existing
  colors already are, via `Color`'s own real hex constructor; these two
  specific hex values are this lesson's own deliberate design choice for
  this project, not a claim about any framework's own built-in default.

### CS Lens

Representing a value as something that moves from an old state to a new
one over real elapsed time, rather than switching between them in a
single instant, is a foundational idea in interactive and visual
systems: **animated state** (sometimes called *tweening*, short for
"in-betweening"). Also recognized in: a game engine interpolating a
character's position between two keyframes rather than teleporting it; a
CSS `transition` smoothing a hovered button's color or size change in a
web browser; a physical spring-mass-damper system in classical
mechanics — the same real kind of simulation
`animateColorAsState`'s own default, un-customized animation spec
actually runs, converging toward its target the way a real spring
settles toward rest rather than snapping there.

### SE Lens

The alternative this unit's own Socratic prompt already led toward: an
instant, un-animated `when` expression, assigned directly to `Text`'s
`color` parameter, with no `animateColorAsState` call at all — genuinely
simpler, zero new imports, and it would have fully solved the literal
problem of "the display doesn't currently change color." The real
tradeoff, made concrete by this exact lesson: an instant switch costs
nothing extra to write, but happens in a single frame — easy for a
user's eye to miss entirely if it isn't looking at the exact right
instant. `animateColorAsState` costs one extra function call and,
per this lesson's own Header entry, a real, already-available dependency
this project didn't have to add — in exchange for the color change
itself becoming something the eye can actually catch mid-motion, not
just before-and-after. This project's own real, executed proof stops at
the mechanism: the isolated lab proved, for real, that the value arrives
over time rather than snapping. Whether the resulting on-screen motion
actually looks smooth and well-timed is a claim about real, rendered
pixels and real frame timing — the same category of claim this
curriculum has already, honestly, left unverified once before, for
`weight`'s own keypad sizing — trusted to produce a usable keypad across
real screen widths, on the strength of its own documented behavior, with
nothing in this environment able to check that beyond the compiler
accepting the code — and it
stays unverified here for the identical reason: no working emulator or
device, and Robolectric's own real, standing limitation is exactly *not*
performing genuine GPU rendering. The mechanism is proven; the felt
result is trusted from Compose's own well-documented, stable default
behavior, not asserted as independently checked.

### Commands Needed

For the isolated lab: no new command — the lab lived inside this
project's own real, already-Gradle-wired source tree, per this
curriculum's own standing Concept Isolation Rule adaptation for Compose,
compiled and run the same way as every real project test, `./gradlew
:app:testDebugUnitTest --tests
"com.example.calculator.LabAnimatedColorTest"`. For checking whether a
new Gradle dependency was needed at all: `./gradlew :app:dependencies
--configuration debugCompileClasspath`, filtered for `animation`, real
output already quoted in this lesson's own Header entry for
`animateColorAsState`. For the real project: `./gradlew testDebugUnitTest
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

All 18 of this project's existing tests still pass, unchanged — this
lesson adds no new permanent test of its own, since the real mechanism
`animateColorAsState` relies on was already proven, for real, by the
isolated lab above, and the real, on-screen integration is exercised
already by this project's own existing crash-sequence tests (still
passing, proving nothing broke), with the actual rendered color left
honestly unverified per this unit's own SE Lens, above. This project
still has 18 real, passing tests total.

### Connect the Pieces

The isolated lab proved, with a real, paused-and-then-advanced test
clock, that `animateColorAsState` genuinely produces a value that
arrives over real elapsed time rather than switching in a single frame;
this unit applied that exact mechanism to `CalculatorScreen`'s own real
display, reading two newly-named colors off this project's own real
`ColorScheme` and handing the result straight to `Text`'s own,
previously-unused `color` parameter — turning `Display`'s own
compiler-enforced exhaustiveness, the same real, closed-set guarantee proven earlier in this project, into something a
user can now actually watch happen on screen.

## Connect the Pieces

One real value, traced through this lesson's own single unit: pressing
`5`, `÷`, `0`, `=`. Before this lesson, that sequence already produced
`CalculatorState(display = Display.Error, ...)` — real, correct, and
completely silent about anything having gone wrong, color-wise; the
display simply showed the word `"Error"` in whatever color it always
showed a number in. Now, the same keypresses drive `CalculatorScreen`'s
own `displayColor` — computed fresh, every recomposition, by a real
`when` over `state.display` that reads `MaterialTheme.colorScheme.error`
the instant `Display.Error` appears — through `animateColorAsState`,
proven, by a real, paused-clock test, to move toward that new color over
real time rather than snap to it. The display `Text` itself, unchanged
in every other respect since this project's own theme first named it a
style, now reads that real, in-motion
value through a parameter it had always accepted but never used. Nothing
about `Display`, `CalculatorState`, or `nextState` changed at all — this
lesson added exactly one new animated value and one newly-used
parameter, and this project's own eighteen tests, unchanged, prove
nothing else did.
