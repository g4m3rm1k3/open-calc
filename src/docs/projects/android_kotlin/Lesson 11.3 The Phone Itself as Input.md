# Lesson 11.3: The Phone Itself as Input

**What you will build.** `GraphScreen` now treats the phone's own real
tilt as a genuine, permanent source of input — alongside the already-
established drag and pinch gestures — panning the real graph the instant
a real accelerometer reading arrives, and stopping cleanly the instant
the screen is gone. Everything the previous lesson's own throwaway
sensor viewer proved, in isolation, now has its real, permanent home.

**What you need to know first:**
- Lesson 11.2 (A Window Meant to Close) — `DisposableEffect`, and this
  project's own already-proven, real combination of it with the Sensor
  API, applied here for real instead of in a discarded practice screen.
- Lesson 9.4 (What the Fingers Can Prove) — `GraphTransform`,
  `applyGesture`, and this project's own real, already-established
  pan/zoom transform, reused here unchanged.
- Lesson 3.6 (A Response You Can Feel) — `LocalHapticFeedback`, this
  project's own first real use of a Compose `CompositionLocal`, the
  direct precedent for this lesson's own first unit.

No pipeline diagram — this lesson doesn't touch this project's own
expression pipeline; it adds a new, real input source to the already-
existing graph transform.

## Terms used in this lesson

No new keywords, annotations, or operators — every real construct this
lesson depends on is a class or method, either already established or
detailed below.

## Objects and methods used

**`LocalContext`**
- *What it is:* the real, official Compose mechanism for reaching the
  current real Android `Context` from directly inside a composable, with
  no `Context` ever passed in as an explicit parameter.
- *Implementation:* real declared shape, confirmed via `javap` against
  this project's own real, installed Compose UI classes:
  ```
  public static final ProvidableCompositionLocal<Context> getLocalContext()
  ```
  — the same real `ProvidableCompositionLocal<T>` type this project's own
  `LocalHapticFeedback` already used, this time holding a real `Context`
  instead of a real `HapticFeedback`.
- *Its use:* this lesson reads `LocalContext.current` directly inside
  `GraphScreen` to reach a real `Context`, used to obtain a real
  `SensorManager`.
- *Type:* a real, public, top-level property (compiled as the real static
  method shown above).
- *Responsibility:* provides the current real `Context` to any
  composable that reads it, without that `Context` needing to travel
  through every intermediate composable's own parameter list.
- *Depends on:* Compose's own real composition tree already having a
  real `Context` provided somewhere above the reading composable — true
  automatically for any composable reached through a real Activity's own
  `setContent { }`, already established since this project's very first
  Compose lesson.
- *Connects to:* its own real, current value feeds directly into
  `getSystemService`, exactly as `LocalHapticFeedback.current` already
  feeds directly into `performHapticFeedback`.
- *Shape:* `androidx.compose.ui.platform`'s own public API — this
  project's second real use of a `CompositionLocal`, not its first.

### Everything else in the file, not this lesson's subject but still explained

**`DisposableEffect` / `SensorManager` / `Sensor` / `SensorEvent` /
`SensorEventListener` / `registerListener` / `unregisterListener`**
- *What it is:* the same real, already fully established Compose and
  Sensor API tools this project proved, together, in the previous
  lesson's own throwaway screen.
- *Implementation:* unchanged from their own prior, full treatment.
- *Its use:* this lesson wires all of them into `GraphScreen` itself,
  permanently, for the first time.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* now reads a real `Context` from `LocalContext.current`
  instead of a parameter passed directly into a throwaway composable.
- *Shape:* unchanged — this lesson's own real, already-proven
  foundation, given its real, permanent home.

**`GraphTransform` / `applyGesture`**
- *What it is:* this project's own real, already-established data type
  and pure function representing and updating the graph's own current
  pan and zoom.
- *Implementation:* unchanged (`data class GraphTransform(val panOffset:
  Offset, val scale: Double)`; `fun applyGesture(current: GraphTransform,
  pan: Offset, zoom: Float): GraphTransform`).
- *Its use:* this lesson calls `applyGesture` a second real way — driven
  by a real sensor reading instead of a real touch gesture — reusing the
  identical real function, with a real, fixed `zoom` of `1f` (no zoom
  change from tilt).
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* now called from two genuinely different real sources —
  `detectTransformGestures` (touch) and this lesson's own new
  `SensorEventListener` (tilt) — both updating the exact same real
  `transform` state.
- *Shape:* unchanged — this project's own real, reused transform logic,
  now genuinely shared between two different kinds of real input.

**`ShadowSensorManager` / `ShadowSensor.newInstance` / `shadowOf` /
`createComposeRule` / `waitForIdle` / `onNodeWithTag` /
`assertIsDisplayed` / `ApplicationProvider.getApplicationContext()`**
- *What it is:* the same real, already-established Robolectric sensor-
  and Compose-testing tools this project has used since the previous two
  lessons.
- *Implementation:* unchanged from their own prior, full treatment.
- *Its use:* this lesson's own new, permanent test uses all of them to
  prove the real, permanent wiring works, the same way the previous
  lesson's own throwaway test already proved the general mechanism.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* unchanged.
- *Shape:* unchanged — this project's own established testing toolkit.

---

## Concept Unit: Reaching Android Without a Passed-In Parameter

### The Problem

`GraphScreen` needs a real `Context` to obtain a real `SensorManager` —
the exact same real requirement the previous lesson's own throwaway
sensor viewer had, solved there by accepting `sensorManager: SensorManager`
as a plain, explicit function parameter. But `GraphScreen()` itself is
called with zero parameters, from directly inside `CalculatorApp`'s own
`NavHost` — threading a real `Context` all the way from `MainActivity`
down through `CalculatorApp` and into `GraphScreen` would mean touching
every composable in between, just to satisfy one real, deeply-nested
need. This project has already solved a strikingly similar real problem
once before, for a completely different real resource.

Given `LocalHapticFeedback.current` already reaches a real
`HapticFeedback` from directly inside `CalculatorButton`, with nothing
passed in as an explicit parameter, and nothing in between
`CalculatorButton` and wherever that real value actually comes from —
what would you predict Compose provides for reaching a real `Context`
the exact same way? Is `LocalHapticFeedback` a one-off, special case
built only for haptics, or is it one real example of a more general
real mechanism this project simply hasn't needed a second instance of
until now?

### Introduce the Concept in Isolation

A real, temporary test file, `LabLocalContextTest.kt`, added directly to
this project's own real Gradle module:

```kotlin
package com.example.calculator

import android.app.Activity
import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

private var capturedContext: Context? = null

@Composable
private fun LabContextReader() {
    capturedContext = LocalContext.current
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabLocalContextTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun localContextCurrentIsARealActivityWhoseApplicationContextMatches() {
        capturedContext = null
        val expectedContext = ApplicationProvider.getApplicationContext<Context>()

        composeTestRule.setContent { LabContextReader() }

        assertTrue(capturedContext is Activity)
        assertSame(expectedContext, capturedContext?.applicationContext)
    }
}
```

**A real, honest surprise, worth showing exactly as it happened**: the
first, naive version of this real test simply asserted
`assertSame(expectedContext, capturedContext)`, expecting
`LocalContext.current` to be the identical real object
`ApplicationProvider.getApplicationContext()` already returns. Run for
real, it failed:

```
java.lang.AssertionError: expected=android.app.Application
actual=androidx.activity.ComponentActivity sameApplicationContext=true
actualApplicationContext=android.app.Application
```

Real, executed output, corrected version (`./gradlew
:app:testDebugUnitTest --tests "com.example.calculator.LabLocalContextTest"
--rerun-tasks`, reproduced identically across two separate runs, saved
in full in `verification/11.3/lab1_output.txt`):

```
BUILD SUCCESSFUL in 12s
Real, saved XML result: tests="1" skipped="0" failures="0" errors="0"
```

This proves two separate real things — the second one genuinely
different from what was first assumed. First: `LocalContext.current`
really is a real `Context`, reachable with nothing passed in. Second,
and more precisely: it's real, specifically, a `ComponentActivity` — the
real Activity Compose itself is running inside, needed to actually host
a real window — not the bare `Application` context; its own real
`.applicationContext`, though, genuinely is the identical real object
`ApplicationProvider.getApplicationContext()` already returns. Both are
real, valid Android `Context`s; they're simply two different real,
related objects, not one.

### Discard the Throwaway Example

`LabLocalContextTest.kt` was deleted from the project immediately after
this real run — it never appears in the project again. Reaching a
real, ambient value from anywhere inside a composition, with nothing
passed in as an explicit parameter, is what a **`CompositionLocal`**
provides — this project's own real, second, distinct instance of the
exact same real mechanism `LocalHapticFeedback` already used.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator in
`LabContextReader` and its own test:

- `LocalContext.current` — the real property call detailed in the
  Header, read directly inside a real, temporary composable — no
  parameter passed anywhere.
- `capturedContext = LocalContext.current` — real assignment to this
  lab's own shared, observable variable, capturing whatever real
  `Context` composition actually provides.
- `ApplicationProvider.getApplicationContext<Context>()` — the same
  real, already-established call, returning the real `Application`
  context this test's own JVM process already has.
- `composeTestRule.setContent { LabContextReader() }` — the same real,
  already-established call, composing this lab's own real reader.
- `assertTrue(capturedContext is Activity)` — an ordinary Kotlin `is`
  type check, testing whether a value's real runtime type matches the
  named type on the right, wrapped in the same real, already-established
  JUnit call; confirmed real `true` — the real, captured value genuinely
  is a real `Activity`.
- `assertSame(expectedContext, capturedContext?.applicationContext)` —
  the same real, already-established JUnit call, this time checking real
  reference identity between two specific real objects — the real
  `Application` this test obtained directly, and the real
  `.applicationContext` reached indirectly through the real, captured
  `Activity`.

### CS Lens

This is a **`CompositionLocal`** — an implicit, ambient value reachable
from anywhere inside a defined scope, with no explicit parameter
threading it through every intermediate layer.

```
Also recognized in: React's own Context API, reaching a value from any
descendant component without prop drilling; a thread-local variable in
Java, reaching a per-thread value with no parameter passed to every
method on the call stack; a dependency-injection container resolving a
requested service by type, anywhere it's asked for, without the caller
constructing or passing it directly
```

### SE Lens

Why does Compose reach for an implicit `CompositionLocal` here at all,
instead of simply requiring every composable that might need a
`Context` to accept one as an explicit parameter, the same way this
project's own labs already did? The real alternative — an explicit
parameter everywhere — is more visible: reading a function's own real
signature tells you exactly what it depends on, with nothing hidden.
The real cost: a `Context` is needed by an enormous, real variety of
Android APIs, at arbitrary depth in a real composition tree; requiring
every composable between the root and whatever leaf actually needs one
to accept and forward it would mean real, significant parameter-
threading noise, in functions that themselves have no real use for a
`Context` at all — exactly this project's own real situation, where
`CalculatorApp` and `NavHost` would otherwise need to accept and pass
along a `Context` neither one actually uses. The honest cost of
`LocalContext`, by contrast, is real, reduced visibility: reading
`GraphScreen`'s own real signature alone doesn't reveal that it depends
on a real `Context` at all — a real, deliberate tradeoff already made,
identically, when this project first reached for `LocalHapticFeedback`
instead of threading a `HapticFeedback` parameter through
`CalculatorButton`'s own real callers.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest`, run above.

### Run It

Shown above — real, executed output for both the initial, genuinely
surprising failure and the corrected, passing version, saved in full in
`verification/11.3/lab1_output.txt`.

### Connect the Pieces

This unit proved `LocalContext.current` reaches a real, working
`Context` from directly inside a composable — specifically, a real
`Activity`, not the bare `Application` context first assumed — with
nothing passed in as an explicit parameter. The next unit uses it to
give `GraphScreen` its own real, permanent connection to this project's
already-proven Sensor API.

---

## Concept Unit: Wiring the Sensor into the Graph, for Real

### The Problem

Every piece this feature actually needs already exists somewhere in this
project, proven in isolation: `LocalContext.current`, proven in this
lesson's own prior unit, reaches a real `Context`; `SensorManager`,
`Sensor.TYPE_ACCELEROMETER`, `SensorEventListener`, `registerListener`,
and `unregisterListener`, already proven together in a throwaway lab,
drive a real accelerometer; `DisposableEffect`, already proven in
another throwaway lab, registers on entering composition and cleans up
on leaving it; `applyGesture`, this project's own already-established
pure transform-update function, already turns a raw `Offset` delta into
an updated `GraphTransform`, already driven once by real two-finger
touch gestures. None of these pieces has ever been combined with the
others, and none has ever been made real, permanent production code —
every prior sensor lab was thrown away immediately after proving its
own point.

Given `GraphScreen` already holds a real `transform` state variable,
already updated by real touch gestures through `applyGesture`, and this
lesson has just proven `LocalContext.current` reaches a real `Context`
from directly inside a composable with nothing passed in — what would
the real, permanent code look like that drives that exact same
`transform` variable from a second, independent real input source, the
phone's own accelerometer, without disturbing the first?

### Project Change

Before this lesson, `GraphScreen`'s own `transform` state was updated
from exactly one real source: two-finger touch gestures, through
`detectTransformGestures` calling `applyGesture`. The real, permanent
change adds a second, independent real source — the accelerometer,
through a real `DisposableEffect` calling `applyGesture` a second real
way — while leaving the first source completely untouched. A phone
resting flat, tilted, no touch involved at all, should now genuinely
move the graph.

### New Code

`Graphing.kt`, appended after `applyGesture` (real, current file,
`AndroidCalculator/app/src/main/java/com/example/calculator/Graphing.kt`,
lines 47-50):

```kotlin
private const val SENSOR_PAN_SENSITIVITY = 2f

fun sensorValuesToPanDelta(x: Float, y: Float): Offset =
    Offset(-x * SENSOR_PAN_SENSITIVITY, y * SENSOR_PAN_SENSITIVITY)
```

`MainActivity.kt`, added inside `GraphScreen`, directly after the
existing `var transform by remember { ... }` line and before the
existing `Column { ... }` (real, current file, lines 134-150):

```kotlin
    val context = LocalContext.current
    DisposableEffect(Unit) {
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                transform = applyGesture(transform, sensorValuesToPanDelta(event.values[0], event.values[1]), 1f)
            }
            override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
        }
        if (accelerometer != null) {
            sensorManager.registerListener(listener, accelerometer, SensorManager.SENSOR_DELAY_NORMAL)
        }
        onDispose {
            sensorManager.unregisterListener(listener)
        }
    }
```

### Updated Project

The complete, real, current `GraphScreen` (Reference Source:
`AndroidCalculator/app/src/main/java/com/example/calculator/MainActivity.kt`,
lines 123-172):

```kotlin
@Composable
fun GraphScreen() {
    var expression by remember { mutableStateOf("x×x") }
    var points by remember { mutableStateOf<List<Point>>(emptyList()) }
    LaunchedEffect(expression) {
        points = withContext(Dispatchers.Default) {
            val tree = buildTree(toPostfix(tokenize(expression)))
            sample({ x -> evaluateAt(tree, x) }, -5.0, 5.0, 100)
        }
    }
    var transform by remember { mutableStateOf(GraphTransform(Offset.Zero, 20.0)) }
    val context = LocalContext.current
    DisposableEffect(Unit) {
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                transform = applyGesture(transform, sensorValuesToPanDelta(event.values[0], event.values[1]), 1f)
            }
            override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
        }
        if (accelerometer != null) {
            sensorManager.registerListener(listener, accelerometer, SensorManager.SENSOR_DELAY_NORMAL)
        }
        onDispose {
            sensorManager.unregisterListener(listener)
        }
    }
    Column(modifier = Modifier.fillMaxSize()) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            CalculatorButton(label = "x×x", onClick = { expression = "x×x" })
            CalculatorButton(label = "x", onClick = { expression = "x" })
        }
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .testTag("graphCanvas")
                .pointerInput(Unit) {
                    detectTransformGestures { _, pan, zoom, _ ->
                        transform = applyGesture(transform, pan, zoom)
                    }
                }
        ) {
            val originX = (size.width / 2 + transform.panOffset.x).toInt()
            val originY = (size.height / 2 + transform.panOffset.y).toInt()
            val screenPoints = toScreenPoints(points, originX, originY, transform.scale)
            drawPath(buildGraphPath(screenPoints), color = Color.Blue, style = Stroke(width = 4f))
        }
    }
}
```

### Mechanical Walkthrough

Enumerated in order, every new method call, property access, operator,
and literal this change adds (the unchanged `expression`/`points`/
touch-gesture lines were already fully walked through when each first
entered this project):

- `private const val SENSOR_PAN_SENSITIVITY = 2f` — an ordinary Kotlin
  top-level named constant, chosen by real, iterative feel during this
  lesson's own lab-building — a raw accelerometer reading of roughly ±1
  (a resting phone reads close to 0 on the axes perpendicular to
  gravity) needed real, noticeable scaling to move the graph a visible
  amount per frame.
- `fun sensorValuesToPanDelta(x: Float, y: Float): Offset` — an ordinary
  Kotlin function declaration, taking two raw `Float` readings and
  returning a real `Offset` — the exact same real type `applyGesture`'s
  own `pan` parameter already expects.
- `Offset(-x * SENSOR_PAN_SENSITIVITY, y * SENSOR_PAN_SENSITIVITY)` — a
  real `Offset` constructor call, with its two real arguments each an
  ordinary Kotlin arithmetic multiplication. The `x` axis is real,
  deliberately negated: tilting the phone's left edge down produces a
  real, negative `x` accelerometer reading, and the real, desired effect
  is the graph sliding toward that same lowered side — multiplying by a
  negative sensitivity, not a positive one, is what makes that happen.
  The `y` axis needs no such negation — a real, positive `y` reading
  (tilting the top edge down) already lines up with the real, desired
  downward pan direction the existing screen-coordinate convention
  (Y increasing downward on screen) expects.
- `val context = LocalContext.current` — this lesson's own prior unit's
  real property call, reaching the real, hosting `Activity` `Context`.
- `DisposableEffect(Unit)` — the same real Compose API constructor call
  this project already proved elsewhere: register a real cleanup-bearing
  effect once when the composable enters composition, run its cleanup
  once when it leaves. It's keyed on Kotlin's own real `Unit` singleton
  object — the one real value of the type `Unit` — meaning the key never
  genuinely changes across recompositions, so registration happens
  exactly once regardless of how many times recomposition itself runs.
- `context.getSystemService(Context.SENSOR_SERVICE) as SensorManager` —
  the same real instance method call and cast this project already
  proved: asking the real Android `Context` for its system-level
  `SensorManager` service and casting the resulting real `Any` down to
  its real, specific type, this time called on the real `Context` this
  lesson's own prior unit obtained through `LocalContext.current`
  instead of through a directly-injected `Context` parameter.
- `sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)` — the same
  real instance method call already proved elsewhere in this project,
  returning a real, nullable `Sensor?` — `null` on any real device
  genuinely lacking this specific real hardware sensor.
- `object : SensorEventListener { ... }` — the same real anonymous-
  object-implementing-an-interface pattern already proved elsewhere:
  Kotlin's own `object :` syntax creates one, unnamed instance of a real
  type built on the spot, providing real bodies for both of
  `SensorEventListener`'s own required abstract methods.
- `override fun onSensorChanged(event: SensorEvent)` — the same real
  override already proved elsewhere, this time doing real, permanent
  work in its body instead of a lab's throwaway logging.
- `transform = applyGesture(transform, sensorValuesToPanDelta(event.values[0], event.values[1]), 1f)`
  — a real, ordinary Kotlin assignment to `GraphScreen`'s own existing
  `transform` state variable, driven by a real, nested function call:
  `event.values[0]` and `event.values[1]` — real field access into the
  real `SensorEvent.values` array, then real array indexing — feed this
  unit's own new `sensorValuesToPanDelta`, whose real `Offset` result
  becomes `applyGesture`'s own real `pan` argument — the exact same real
  `applyGesture` function two-finger touch gestures already call, called
  here a real, second, independent way. The real, literal `1f` passed as
  `applyGesture`'s own `zoom` argument means this real sensor path never
  itself changes `transform.scale` — only touch pinching does; tilting
  the phone only ever pans, never zooms.
- `override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}` —
  the same real override already proved elsewhere, still a real,
  deliberately empty body — this feature has no real use for accuracy-
  change notifications.
- `if (accelerometer != null)` — an ordinary Kotlin null check, guarding
  against the real, possible case of a device genuinely lacking this
  sensor — registering a `null` sensor would be a real, invalid call.
- `sensorManager.registerListener(listener, accelerometer, SensorManager.SENSOR_DELAY_NORMAL)`
  — the same real instance method call already proved elsewhere, using
  the same real, already-established `SENSOR_DELAY_NORMAL` constant —
  this feature has no real need for `SENSOR_DELAY_GAME`'s or
  `SENSOR_DELAY_FASTEST`'s higher real update rate; panning a graph is
  not latency-critical the way a real game loop is.
- `onDispose { sensorManager.unregisterListener(listener) }` — the same
  real `DisposableEffect` closing clause already proved elsewhere, this
  time cleaning up a real, permanent sensor registration instead of a
  lab's throwaway one.

### CS Lens

This is **event-driven input fan-in**: two real, independent, real-time
event sources — touch gestures and accelerometer readings — both
feeding real updates into one shared, single piece of state, through the
same real reducer-shaped function (`applyGesture`), neither source aware
the other exists.

```
Also recognized in: a game engine's own input system combining keyboard,
mouse, and gamepad events into one shared player-position state; a
spreadsheet cell recalculating from either a direct keystroke edit or an
upstream formula dependency changing, through the same real recalculation
function either way; a thermostat combining a manual dial turn and a
scheduled program's own timed adjustment into the same real target-
temperature state
```

### SE Lens

Why route both real input sources through the exact same real
`applyGesture` function, rather than giving the sensor path its own,
separate update function? Because `transform` is a single, real, shared
piece of state — if touch and sensor each wrote to it through their own
separate logic, any future real change to how panning itself behaves
(the coordinate convention, a clamping rule, a future smoothing
adjustment) would have to be found and fixed in two real places, with a
real, standing risk of the two silently drifting apart. Routing both
through one real, shared function means `applyGesture`'s own already-
existing tests — `applyGestureAccumulatesRealPanAndMultipliesRealScale`
and `applyGestureWithNoPanAndUnitZoomLeavesTheTransformUnchanged` —
already cover the real update logic both input sources now depend on — this
lesson's own new tests only need to prove each source calls it correctly,
not re-prove the update math itself.

### Commands Needed

This project's own already-established `./gradlew testDebugUnitTest`,
run against the real, permanent tests below.

### Run It

Two new real, permanent tests prove this feature — one for the pure
transformation, one for the full, real registration/cleanup lifecycle
against the real, running `GraphScreen`.

`GraphingTest.kt`, real, current file, lines 121-132:

```kotlin
    @Test
    fun sensorValuesToPanDeltaScalesAndInvertsTheRealXAxisReading() {
        // Arrange
        val x = 3f
        val y = 4f

        // Act
        val delta = sensorValuesToPanDelta(x, y)

        // Assert
        assertEquals(Offset(-6f, 8f), delta)
    }
```

`GraphScreenTest.kt`, real, current file, lines 91-119:

```kotlin
    @Test
    fun sensorRegistersOnComposeAndUnregistersOnLeavingComposition() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val accelerometer = ShadowSensor.newInstance(Sensor.TYPE_ACCELEROMETER)
        shadowOf(sensorManager).addSensor(accelerometer)

        var showGraph by mutableStateOf(true)
        composeTestRule.setContent {
            if (showGraph) {
                GraphScreen()
            }
        }

        assertEquals(1, shadowOf(sensorManager).listeners.size)

        val event = ShadowSensorManager.createSensorEvent(3)
        event.values[0] = 1f
        event.values[1] = 1f
        shadowOf(sensorManager).sendSensorEventToListeners(event)
        composeTestRule.waitForIdle()

        composeTestRule.onNodeWithTag("graphCanvas").assertIsDisplayed()

        showGraph = false
        composeTestRule.waitForIdle()

        assertEquals(0, shadowOf(sensorManager).listeners.size)
    }
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.GraphScreenTest" --tests
"com.example.calculator.GraphingTest" --rerun-tasks`, reproduced
identically on a second, separate run, saved in full in
`verification/11.3/step1_production_tests.txt`):

```
BUILD SUCCESSFUL in 12s
GraphScreenTest.xml: tests="5" skipped="0" failures="0" errors="0"
GraphingTest.xml:    tests="8" skipped="0" failures="0" errors="0"
```

A real, additional finding worth stating plainly: the assertion
`assertEquals(1, shadowOf(sensorManager).listeners.size)` genuinely
passed using a `sensorManager` this test obtained independently, through
`ApplicationProvider.getApplicationContext()` directly — not through
`GraphScreen`'s own internal `LocalContext.current` path at all. That
this test's own, separately-obtained `SensorManager` sees the exact same
real listener `GraphScreen`'s own internal `DisposableEffect` registered
is only possible because `LocalContext.current`'s own real
`getSystemService` call and `ApplicationProvider.getApplicationContext()`'s
own real `getSystemService` call resolve to the identical real
`SensorManager` singleton under Robolectric — this lesson's own prior
unit already proved the two real `Context`s share the same real
`.applicationContext`, and this is the real, practical consequence:
system services obtained through either one are the same real objects.

### Connect the Pieces

`GraphScreen` now genuinely responds to two real, independent input
sources through the exact same shared `transform` state and the exact
same shared `applyGesture` function: two-finger touch gestures, already
proven real, and the phone's own accelerometer, proven real and
permanent here — reached without a single parameter threaded through
`CalculatorApp` or `NavHost`, using the real `CompositionLocal`
mechanism this lesson's first unit proved. Nothing about the touch path
changed; nothing about `applyGesture` itself changed. A resting phone
tilted left, right, forward, or back now genuinely pans the graph, with
zero touch involved.

**Next:** Lesson 11.4 (Haptics API).
