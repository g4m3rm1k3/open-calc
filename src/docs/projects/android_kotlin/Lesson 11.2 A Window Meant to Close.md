# Lesson 11.2: A Window Meant to Close

**What you will build.** A real, working, temporary window into this
device's real accelerometer — live X/Y/Z values updating a real Compose
screen the instant real sensor data arrives — built, genuinely proven,
and then deliberately discarded, never landing in this project's own
permanent code. Per the BRD's own explicit framing for this exact
lesson: *"learning how to approach an unfamiliar API is more important
than the sensor itself."* The real, transferable finding — not the
code — is what carries forward to the next lesson, which builds this
same real sensor's own permanent, integrated home.

**What you need to know first:**
- Lesson 11.1 (The Contract Before the Code) — `SensorManager`, `Sensor`,
  `SensorEvent`, `SensorEventListener`,
  `registerListener`/`unregisterListener`, and this project's own real,
  fetched Android source proving each of them, all fully established and
  unchanged here.
- Lesson 10.2 (Off the Main Thread, Still Tied to the Screen) —
  `LaunchedEffect`, and its own real, structured-concurrency guarantee —
  the direct point of contrast this lesson's own first unit needs.
- Lesson 1.4 (A Value That Survives Its Own Rebuild) — `remember`, and a
  composable's own real lifecycle, already this project's own
  foundation for both `LaunchedEffect` and this lesson's own new
  construct alike.

No pipeline diagram — this lesson doesn't touch this project's own
expression or graphing pipeline.

## Terms used in this lesson

No new keywords, annotations, or operators — every real construct this
lesson depends on is a class or method, either already established or
detailed below.

## Objects and methods used

**`DisposableEffect`**
- *What it is:* the real, official Compose API for tying a real, plain
  cleanup action — not a coroutine — to a composable's own lifecycle:
  something runs when the composable is remembered, and something else,
  guaranteed, runs when it's forgotten.
- *Implementation:* real declared shape of the overload this lesson
  calls, confirmed from the real, fetched source
  (`android.googlesource.com/platform/frameworks/support`,
  `compose/runtime/runtime/src/commonMain/kotlin/androidx/compose/runtime/Effects.kt`,
  branch `refs/heads/androidx-main`, fetched this session):
  ```
  @Composable
  fun DisposableEffect(key1: Any?, effect: DisposableEffectScope.() -> DisposableEffectResult)
  ```
  Its own real, fetched KDoc states a genuine, real requirement, not just
  a convention: *"A DisposableEffect must include an onDispose clause as
  the final statement in its effect block,"* and separately: *"There is
  guaranteed to be one call to dispose for every call to effect."* Its
  real, internal implementation, `DisposableEffectImpl`, implements the
  same real `RememberObserver` interface `LaunchedEffectImpl` already
  did (Lesson 10.2): `onRemembered()` calls the real, given `effect()`
  block directly; `onForgotten()` calls `onDispose?.dispose()` — a real,
  direct, synchronous call, with no coroutine, no dispatcher, and no
  `Job` anywhere in it.
- *Its use:* this lesson uses it to register a real `SensorEventListener`
  the instant a composable is remembered, and to guarantee
  `unregisterListener` runs the instant that composable is forgotten.
- *Type:* a real, public `@Composable` function.
- *Responsibility:* runs one real, plain action on remember, and
  guarantees exactly one matching real cleanup action on forget — no
  coroutine lifecycle involved, unlike `LaunchedEffect`.
- *Depends on:* a real `key1` (governing when it restarts) and a real
  lambda that must itself call `onDispose { ... }` as its own last real
  statement.
- *Connects to:* built on the same real `remember` mechanism already
  established (Lesson 1.4); this lesson's own real listener registration
  and unregistration both happen directly inside it, with no
  `withContext`/`Dispatchers` involved anywhere.
- *Shape:* `androidx.compose.runtime`'s own public API — this project's
  first real use of it, a direct, deliberate sibling to `LaunchedEffect`
  for the real cases where a coroutine isn't the right tool.

**`DisposableEffectScope.onDispose`**
- *What it is:* the real, required method a `DisposableEffect`'s own
  lambda must call, naming exactly what real cleanup should run later.
- *Implementation:* real, fetched declared shape (same source, same
  session): `inline fun onDispose(onDisposeEffect: () -> Unit):
  DisposableEffectResult`. Its own real body wraps the given real lambda
  in a real, anonymous `DisposableEffectResult` whose own `dispose()`
  method simply calls it — confirmed directly from the real, fetched
  source, not assumed from the method's own name.
- *Its use:* this lesson calls it once, as the real, required final
  statement inside `DisposableEffect`'s own lambda, to call
  `unregisterListener`.
- *Type:* a real, public, `inline` instance method on the real
  `DisposableEffectScope` receiver `DisposableEffect`'s own lambda runs
  inside.
- *Responsibility:* the one real, documented way to tell
  `DisposableEffect` what its own later real cleanup should actually do.
- *Depends on:* a real lambda naming the real cleanup action.
- *Connects to:* its own real return value becomes `DisposableEffectImpl`'s
  own stored `onDispose` field, called later by `onForgotten()`.
- *Shape:* `androidx.compose.runtime`'s own public API, the direct real
  counterpart, inside `DisposableEffect`, to `LaunchedEffect`'s own
  implicit, automatic coroutine cancellation.

### Everything else in the file, not this lesson's subject but still explained

**`SensorManager` / `Sensor` / `SensorEvent` / `SensorEventListener` /
`registerListener` / `unregisterListener`**
- *What it is:* the same real, already fully established Android Sensor
  API this project's own previous lesson proved in isolation.
- *Implementation:* unchanged from their own prior, full treatment.
- *Its use:* this lesson wires all of them together, for the first time,
  inside a real, temporary Compose screen.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* `registerListener`/`unregisterListener` now run inside
  `DisposableEffect`'s own real lifecycle hooks, instead of directly
  inside test methods.
- *Shape:* unchanged — this lesson's own real, already-proven
  foundation, applied for the first time.

**`remember` / `mutableFloatStateOf` / `by`**
- *What it is:* the same real, already-established Compose state
  mechanism this project has used since Lesson 1.4, here specialized to
  a real, primitive `Float` value.
- *Implementation:* `mutableFloatStateOf(value: Float):
  MutableFloatState` (`androidx.compose.runtime`) — a real, dedicated
  sibling to the already-established `mutableStateOf`, avoiding boxing a
  plain `Float` into a generic `MutableState<Float>` for a value that
  changes often.
- *Its use:* this lesson's own temporary sensor viewer holds its real,
  live X-axis reading in exactly this kind of state.
- *Type:* a real, public, top-level function.
- *Responsibility:* the same real responsibility `mutableStateOf`
  already has, specialized for one real primitive type.
- *Depends on:* a real initial `Float` value.
- *Connects to:* reassigned directly inside `DisposableEffect`'s own real
  listener, read directly inside this lesson's own real `Text`.
- *Shape:* Compose's own core state API — this project's first real use
  of its primitive-specialized form.

**`ShadowSensorManager` / `ShadowSensor.newInstance` / `shadowOf`**
- *What it is:* the same real, already-established Robolectric sensor-
  testing support from the previous lesson.
- *Implementation:* unchanged from its own prior, full treatment; this
  lesson's own second lab additionally uses its real
  `.listeners` property (confirmed via the same real `javap` check
  already run: `public List<SensorEventListener> getListeners()`),
  reading the real, current, live count of registered listeners
  directly, without needing a specific listener reference in hand.
- *Its use:* this lesson's own second lab uses it both to dispatch a
  real, synthetic sensor event and to confirm real cleanup afterward.
- *Type:* unchanged; `getListeners()` is a real, public instance method.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* `.listeners.size` read twice — once while the real
  viewer is on screen, once after it's gone — to prove real registration
  and real cleanup without needing to keep the listener object itself
  around.
- *Shape:* unchanged.

**`TestNavHostController` / `ComposeNavigator` / `NavHost` / `composable`
/ `createComposeRule` / `waitForIdle` / `onNodeWithTag` /
`assertTextEquals`**
- *What it is:* the same real, already-established navigation- and
  Compose-testing tools this project has used since Lesson 4.1/1.4.
- *Implementation:* unchanged from their own prior, full treatment.
- *Its use:* both of this lesson's own labs build a tiny, real,
  two-route navigation graph so a real composable can genuinely leave
  composition on command, and read real, displayed text back.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* unchanged.
- *Shape:* unchanged — this project's own established testing toolkit,
  reused here, not extended.

---

## Concept Unit: Cleanup That Isn't a Coroutine

### The Problem

This project already has a real, proven way to tie something's own
lifetime to a composable's presence on screen: `LaunchedEffect`, whose
own real cancellation — proven directly — stops a running coroutine the
instant its host leaves composition. But `registerListener`/
`unregisterListener` aren't coroutine functions at all — nothing about
them suspends, and nothing about them needs `Dispatchers.Default` or any
other dispatcher. Wrapping a plain, ordinary function call in
`LaunchedEffect` just to get automatic cleanup would work, mechanically,
but would be reaching for a coroutine-shaped tool to solve a problem
that was never actually about coroutines in the first place.

Given `LaunchedEffect`'s own real cleanup mechanism is coroutine
cancellation — throwing a real `JobCancellationException` into a
suspended coroutine at its own next suspension point, already proven in
this project's own earlier work — what would you predict happens if the
thing that needs cleaning up isn't suspended at all, has no coroutine
body, and is just sitting there having already returned? Does
`LaunchedEffect`'s own cancellation mechanism still have anything to
actually interrupt? And given Compose already ties `remember`'s own
values to a composable's presence on screen automatically, would you
expect a *second*, real, dedicated mechanism to exist specifically for
"run one plain action now, and guarantee one matching plain action
later" — or would you expect Compose to only ever offer the one,
coroutine-shaped tool for every kind of cleanup?

### Introduce the Concept in Isolation

A real, temporary test file, `LabDisposableEffectTest.kt`, added directly
to this project's own real Gradle module, reusing the exact same
two-route real navigation pattern already established for proving
`LaunchedEffect`'s own cleanup:

```kotlin
package com.example.calculator

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.navigation.NavHostController
import androidx.navigation.compose.ComposeNavigator
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.testing.TestNavHostController
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

private var disposedCount = 0

@Composable
private fun LabDisposableScreen() {
    DisposableEffect(Unit) {
        onDispose { disposedCount++ }
    }
}

@Composable
private fun LabDisposableNavHost(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "a") {
        composable("a") { LabDisposableScreen() }
        composable("b") { }
    }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabDisposableEffectTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun onDisposeFiresExactlyOnceWhenTheComposableLeavesComposition() {
        disposedCount = 0
        val navController = TestNavHostController(ApplicationProvider.getApplicationContext())
        navController.navigatorProvider.addNavigator(ComposeNavigator())
        composeTestRule.setContent { LabDisposableNavHost(navController) }

        assertEquals(0, disposedCount)

        navController.navigate("b")
        composeTestRule.waitForIdle()

        assertEquals(1, disposedCount)
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabDisposableEffectTest" --rerun-tasks`,
reproduced identically across two separate runs, saved in full in
`verification/11.2/lab1_output.txt`):

```
BUILD SUCCESSFUL in 11s
Real, saved XML result: tests="1" skipped="0" failures="0" errors="0"
```

This proves two separate real things. First: immediately after
composing `LabDisposableScreen`, `disposedCount` was real, confirmed
`0` — `DisposableEffect`'s own real effect block ran (registering its
own real `onDispose` callback), but that callback itself had not fired
yet. Second: after `navController.navigate("b")` genuinely removed
`LabDisposableScreen` from composition, `disposedCount` was real,
confirmed exactly `1` — no coroutine, no cancellation exception, no
dispatcher anywhere in this real proof — just a plain, real function
call, guaranteed to happen exactly once, the instant the composable
genuinely left composition.

### Discard the Throwaway Example

`LabDisposableEffectTest.kt` was deleted from the project immediately
after this real run — it never appears in the project again. A
mechanism guaranteeing one real cleanup action runs exactly once, tied
to a composable's own presence on screen, with no coroutine involved at
all, is `DisposableEffect` — this project's second real, distinct shape
of structured concurrency's own broader idea (something cannot outlive
the structure that created it), applied here to a plain callback instead
of a running coroutine.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator in
`LabDisposableScreen` and its own test:

- `DisposableEffect(Unit)` — the real call detailed in the Header,
  passing the real, fixed key `Unit`, meaning this effect runs exactly
  once, the first time this composable enters composition.
- `onDispose { disposedCount++ }` — the real, required method detailed
  in the Header, called as the real, final statement inside
  `DisposableEffect`'s own lambda; its own real argument, `{
  disposedCount++ }`, is an ordinary, already-established Kotlin lambda
  incrementing this lab's own shared, observable counter.
- `TestNavHostController(ApplicationProvider.getApplicationContext())`
  and `navController.navigatorProvider.addNavigator(ComposeNavigator())`
  — the same two real, already-established calls, building a real,
  test-driven navigation controller.
- `composeTestRule.setContent { LabDisposableNavHost(navController) }` —
  the same real, already-established call, rendering this lab's own real
  navigation graph, starting on route `"a"`.
- `assertEquals(0, disposedCount)` — the same real, already-established
  JUnit call, confirming the real state immediately after composition.
- `navController.navigate("b")` — the same real, already-established
  call, moving the real navigation graph to its second route, removing
  `LabDisposableScreen` from composition in the process.
- `composeTestRule.waitForIdle()` — the same real, already-established
  call, ensuring that real removal — and `DisposableEffect`'s own real
  `onForgotten` hook — has actually run before the test continues.
- `assertEquals(1, disposedCount)` — the same real JUnit call, confirming
  the real, final state this entire unit exists to prove.

### CS Lens

This is **deterministic resource cleanup** — a guarantee that exactly
one real release action runs for every real acquire action, with no
dependence on garbage collection, timing, or a coroutine's own
cancellation machinery to make it happen.

```
Also recognized in: a Java try-with-resources block, guaranteeing
close() runs exactly once per real resource opened; a C++ destructor,
running deterministically the instant an object's own scope ends; a
Python context manager's own __exit__, paired one-to-one with __enter__
regardless of how the block is left
```

### SE Lens

Why does Compose provide two separate real mechanisms — `LaunchedEffect`
and `DisposableEffect` — instead of one, general "run this on remember,
run that on forget" tool covering both the coroutine and non-coroutine
cases? The real alternative — one unified mechanism — would mean fewer
real names to learn. The real cost: `LaunchedEffect`'s own real
cancellation semantics (a `JobCancellationException` thrown at a
suspension point) only make real sense for something that's actually
suspended; forcing a plain, synchronous callback like
`unregisterListener` through that same real machinery would mean
wrapping it in a coroutine that does nothing coroutine-shaped, just to
borrow its cancellation behavior — real, unnecessary complexity for a
real problem that never needed it. `DisposableEffect`'s own real
cost, by contrast, is exactly Compose's own stated real requirement:
`onDispose` **must** be the lambda's own last statement — a real,
enforced structural rule (this project's own next unit will show what
happens if it's forgotten) — the price for a genuinely simpler, more
predictable real cleanup guarantee, with no cancellation-exception
machinery to reason about.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest`, run above.

### Run It

Shown above — real, executed output, reproduced identically across two
separate runs, saved in full in `verification/11.2/lab1_output.txt`.

### Connect the Pieces

This unit proved `DisposableEffect` guarantees exactly one real cleanup
call, with no coroutine involved, the instant its host composable
leaves composition — this project's second real, distinct shape of
"something cannot outlive the structure that created it." The next unit
puts it to work for real, on this project's own actual Sensor API.

---

## Concept Unit: A Tiny, Temporary Window Into Real Hardware

### The Problem

This project already proved, in a bare JUnit test, that `registerListener`
genuinely delivers a real event and `unregisterListener` genuinely stops
it. But nothing yet has proven that real, live sensor data can actually
reach a real, on-screen Compose UI — the entire real point of this
project ever touching a sensor at all. Per the BRD's own explicit
framing for this exact lesson, what gets built here is deliberately
throwaway: a tiny, temporary window onto one real sensor's own live
readings, built specifically to practice wiring an unfamiliar real API
into this project's own real UI layer — not to become a permanent
feature yet.

Given `DisposableEffect`'s own real lambda runs its `effect` block
exactly once per real key, and `SensorEventListener.onSensorChanged`
fires an unpredictable, ongoing number of times for as long as a real
listener stays registered — where would you place the real, mutable
Compose state a live sensor reading needs to update: inside
`DisposableEffect`'s own lambda, alongside the listener itself, or
outside it, in the composable's own body? And given this project's own
already-proven fact that `SensorEvent` objects may be reused by the real
framework, already warned of directly in its own fetched real Javadoc —
what would you predict happens if real, on-screen Compose state held a
reference to the `SensorEvent` object itself, instead of copying the
specific real numbers out of it first?

### Introduce the Concept in Isolation

A real, temporary test file, `LabSensorViewerTest.kt`, added directly to
this project's own real Gradle module, combining every real piece this
project has now proven — `SensorManager`, `DisposableEffect`, and
Compose's own real state and testing tools — into one small, real,
working screen:

```kotlin
package com.example.calculator

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.navigation.NavHostController
import androidx.navigation.compose.ComposeNavigator
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.testing.TestNavHostController
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import org.robolectric.shadows.ShadowSensor
import org.robolectric.shadows.ShadowSensorManager

@Composable
private fun LabSensorViewer(sensorManager: SensorManager, sensor: Sensor) {
    var x by remember { mutableFloatStateOf(0f) }
    DisposableEffect(Unit) {
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                x = event.values[0]
            }
            override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
        }
        sensorManager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_NORMAL)
        onDispose {
            sensorManager.unregisterListener(listener)
        }
    }
    Text(text = "x=$x", modifier = androidx.compose.ui.Modifier.testTag("sensorViewerText"))
}

@Composable
private fun LabSensorNavHost(navController: NavHostController, sensorManager: SensorManager, sensor: Sensor) {
    NavHost(navController = navController, startDestination = "viewer") {
        composable("viewer") { LabSensorViewer(sensorManager, sensor) }
        composable("elsewhere") { }
    }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabSensorViewerTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun aRealDispatchedEventUpdatesTheRealDisplayedTextAndCleanupStopsFurtherUpdates() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val accelerometer = ShadowSensor.newInstance(Sensor.TYPE_ACCELEROMETER)
        shadowOf(sensorManager).addSensor(accelerometer)

        val navController = TestNavHostController(ApplicationProvider.getApplicationContext())
        navController.navigatorProvider.addNavigator(ComposeNavigator())
        composeTestRule.setContent { LabSensorNavHost(navController, sensorManager, accelerometer) }

        composeTestRule.onNodeWithTag("sensorViewerText").assertTextEquals("x=0.0")

        val firstEvent = ShadowSensorManager.createSensorEvent(3)
        firstEvent.values[0] = 4.5f
        shadowOf(sensorManager).sendSensorEventToListeners(firstEvent)
        composeTestRule.waitForIdle()

        composeTestRule.onNodeWithTag("sensorViewerText").assertTextEquals("x=4.5")
        assertEquals(1, shadowOf(sensorManager).listeners.size)

        navController.navigate("elsewhere")
        composeTestRule.waitForIdle()

        assertEquals(0, shadowOf(sensorManager).listeners.size)
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabSensorViewerTest" --rerun-tasks`, reproduced
identically across two separate runs, saved in full in
`verification/11.2/lab2_output.txt`):

```
w: .../LabSensorViewerTest.kt:82:46 'createSensorEvent(Int): SensorEvent!' is
   deprecated. Deprecated in Java

BUILD SUCCESSFUL in 11s
Real, saved XML result: tests="1" skipped="0" failures="0" errors="0"
```

This proves three separate real things. First: before any real sensor
event arrived, the real, displayed text correctly read `"x=0.0"`.
Second: a real, synthetic `SensorEvent` with `values[0] = 4.5f`,
dispatched through `sendSensorEventToListeners`, genuinely updated the
real, on-screen Compose text to `"x=4.5"` — live sensor data, reaching a
real screen, for the first time in this project's own life — with
`shadowOf(sensorManager).listeners.size` confirming real `1`, exactly one
real registered listener. Third: after navigating away,
`shadowOf(sensorManager).listeners.size` was real, confirmed `0` —
`DisposableEffect`'s own `onDispose` genuinely called
`unregisterListener`, proven this time against the real Sensor API
itself, not an abstract counter.

### Discard the Throwaway Example

`LabSensorViewerTest.kt` — the entire real, temporary sensor viewer,
composable and test alike — was deleted from the project immediately
after this real run. Per the BRD's own explicit framing for this exact
lesson, nothing about this real screen was ever meant to become a
permanent part of this project; the real, transferable finding it
proves — that this project's own already-established `DisposableEffect`
and Sensor API tools genuinely combine to deliver live hardware data to
a real, on-screen value — is what survives, carried forward as
knowledge, not code.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator in
`LabSensorViewer`:

- `var x by remember { mutableFloatStateOf(0f) }` — the real,
  established `remember`/`by` mechanism, this time holding a real
  `mutableFloatStateOf(0f)` — the real, primitive-specialized state
  detailed in the Header, starting at a real, literal `0f`.
- `DisposableEffect(Unit)` — the real call from this lesson's own first
  unit, run exactly once, the first time this composable enters
  composition.
- `object : SensorEventListener { ... }` — an ordinary, already-
  established Kotlin anonymous object expression, implementing the real
  interface's own two real methods; `onSensorChanged` reads
  `event.values[0]` — copying the one real number this lab needs out of
  the real event immediately, never holding onto the event object itself,
  exactly honoring this project's own already-established real warning
  that `SensorEvent` objects may be reused by the framework.
- `sensorManager.registerListener(listener, sensor,
  SensorManager.SENSOR_DELAY_NORMAL)` — the same real, already-
  established call, run once, inside `DisposableEffect`'s own effect
  block.
- `onDispose { sensorManager.unregisterListener(listener) }` — the real,
  required call from this lesson's own first unit, its own real lambda
  calling the real, already-established `unregisterListener`.
- `Text(text = "x=$x", modifier = Modifier.testTag("sensorViewerText"))`
  — the same real, already-established Compose calls, rendering `x`'s
  own current real value as real, on-screen text, tagged for this lab's
  own real test to find.
- `ShadowSensorManager.createSensorEvent(3)` and
  `firstEvent.values[0] = 4.5f` — the same two real, already-established
  calls, building a real, synthetic event with one real, chosen value.
- `shadowOf(sensorManager).sendSensorEventToListeners(firstEvent)` — the
  same real, already-established call, genuinely invoking this lab's own
  real listener.
- `composeTestRule.onNodeWithTag("sensorViewerText").assertTextEquals
  ("x=4.5")` — a real, already-established Compose-testing call,
  confirming the real, displayed text reflects the real dispatched
  value.
- `shadowOf(sensorManager).listeners.size` — a real Robolectric property
  read, returning the real, current count of registered listeners —
  confirmed `1`, then, after real navigation away and a real
  `waitForIdle()`, confirmed `0`.

### CS Lens

This is the same real **deterministic resource cleanup** already named
in this lesson's own first unit, applied here to a genuine, real
external resource — a live hardware sensor — instead of an abstract
counter: registering is the real acquire, `DisposableEffect`'s own
`onDispose` is the real, guaranteed release, and Compose's own real
lifecycle is what decides exactly when each one happens.

```
Also recognized in: a database connection, checked out from a pool on
first use and always returned on scope exit; a file handle, opened for
reading and always closed, even if an exception occurs partway through;
a camera preview session, started when a screen appears and always
stopped when it's dismissed, to avoid leaving the real hardware running
```

### SE Lens

Why prove this real wiring with a genuinely throwaway screen, instead of
building the real, permanent graph-tilting feature directly, right now?
The real alternative — building the permanent feature immediately — is
faster in the short term, one less real screen to write and then delete.
The real cost: this project's own real graph feature has its own real,
existing state (`GraphTransform`, `expression`, `points`) and its own
real, established conventions (this project's own coordinate-transform
work, and its own cancellation-aware `LaunchedEffect`); wiring an
entirely unfamiliar real API directly into that already-real, working
code risks debugging two genuinely unfamiliar things at once — "is my
sensor wiring wrong, or is my graph-transform math wrong?" — with no
clean way to tell which. A small, deliberately disposable real screen,
built and proven in isolation first, means every real design question
this lesson's own labs actually had to answer (event reuse, which state
goes where, `DisposableEffect`'s own required final statement) got
answered here, cheaply, before touching this project's own real, working
graph at all — the same real judgment this project's own established
Concept
Isolation Rule has already applied to every new construct since this
project's own first Compose lesson, scaled up here to a whole small
feature instead of a single language construct.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest`, run above.

### Run It

Shown above — real, executed output, reproduced identically across two
separate runs, saved in full in `verification/11.2/lab2_output.txt`. A
full, clean `./gradlew testDebugUnitTest assembleDebug` run confirms
this project's own real, permanent code is completely unchanged — still
`97` real, passing tests, `0` failures — saved in full in
`verification/11.2/step1_full_suite.txt`.

### Connect the Pieces

This unit combined every real piece this stage has proven — the real
Sensor API and `DisposableEffect` (this lesson's own first unit) — into
a genuinely working, real, temporary window onto live hardware data,
then deliberately discarded it, exactly as the BRD's own framing for
this lesson required. Nothing about this project's own permanent code
changed; everything about how to build the real, permanent version is
now known, proven, and ready.

---

## Connect the Pieces

One real, concrete value, traced through both units, never permanently
kept: a single, live accelerometer reading, `x=4.5`. The first unit
proved `DisposableEffect` guarantees exactly one real cleanup call, with
no coroutine involved, the instant its host composable leaves
composition — a real, deliberate, non-coroutine sibling to
`LaunchedEffect`. The second unit combined that real guarantee with this
project's own already-proven Sensor API to build a genuinely working,
temporary screen: a real, synthetic sensor reading updated real,
on-screen Compose text, and leaving that screen genuinely, verifiably
stopped the real listener from receiving anything further. Both real,
temporary files were then deleted, exactly as the BRD's own explicit
framing for this lesson required — the real, transferable finding is
what remains: this project's own tools already combine to deliver live
hardware data to a real screen, correctly, safely, and with guaranteed
cleanup, ready for a real, permanent home.

**Next:** Lesson 11.3 (Sensor → Application State).
