# Lesson 11.4: A Tick at the Line You Just Crossed

**What you will build.** `GraphScreen` now gives a real, physical click
— an actual felt vibration — the instant panning, from either real
input source this project now has (touch or tilt), carries the graph's
own origin back across a coordinate axis. A real, permanent, from-
scratch pure function decides when that real crossing happened; a real,
lower-level Android API — distinct from this project's own existing
touch-feedback haptics — makes the phone actually click.

**What you need to know first:**
- Lesson 11.3 (The Phone Itself as Input) — `GraphTransform`,
  `applyGesture`, `LocalContext`, and this project's own real, permanent
  tilt-to-pan feature, extended here rather than replaced.
- Lesson 11.1 (The Contract Before the Code) — the real, transferable
  documentation-reading checklist (entry point, types, lifecycle,
  callbacks, required configuration, cleanup, deprecations), applied
  here to a second, genuinely different real Android API.
- Lesson 3.6 (A Response You Can Feel) — `LocalHapticFeedback`, this
  project's own existing, higher-level Compose touch-feedback API,
  distinct from the lower-level platform API this lesson introduces.

No pipeline diagram — this lesson doesn't touch this project's own
expression pipeline; it adds a real, physical response to an existing
transform update.

## Terms used in this lesson

**`@Suppress`** — a real Kotlin annotation, applied directly above a
declaration or expression, telling the compiler to withhold one named
category of warning it would otherwise report at that exact spot; this
lesson applies `@Suppress("DEPRECATION")` above one real, deliberate
call to a genuinely deprecated Android method, so that real warning
doesn't obscure the fact that this specific call is deliberate, not an
oversight.

## Objects and methods used

**`Vibrator`**
- *What it is:* the real, low-level Android platform class representing
  the device's own physical vibration hardware — distinct from
  `LocalHapticFeedback`'s own higher-level, Compose-specific, touch-
  feedback-flavored API.
- *Implementation:* real declared shape, confirmed via `javap` against
  this project's own real, installed Android platform `.jar`:
  ```
  public abstract class android.os.Vibrator {
    public abstract boolean hasVibrator();
    public void vibrate(long);
    public void vibrate(android.os.VibrationEffect);
    public abstract void cancel();
  }
  ```
  (abbreviated — the real class has several more real overloads, most of
  them confirmed genuinely deprecated below).
- *Its use:* this lesson obtains one real `Vibrator` per `GraphScreen`
  and calls its real `vibrate` method, with a different real argument
  depending on the real device's own Android version.
- *Type:* a real, public, abstract Android platform class.
- *Responsibility:* actually driving the device's own physical vibration
  hardware for a requested real effect or duration.
- *Depends on:* a real `Context`, via `getSystemService`.
- *Connects to:* this lesson's own new `triggerAxisCrossingHaptic`
  function, and, through it, `crossedAxis`'s own real, computed result.
- *Shape:* `android.os`'s own real, public platform API — a real Android
  system service, obtained the exact same real way `SensorManager`
  already was.

**`VibrationEffect`**
- *What it is:* the real, modern Android class describing a specific,
  named or custom vibration pattern, passed to `Vibrator.vibrate`.
- *Implementation:* real declared shape, confirmed via `javap`
  (abbreviated — the real class also implements `android.os.Parcelable`,
  irrelevant to this lesson's own real use):
  ```
  public abstract class android.os.VibrationEffect {
    public static final int EFFECT_TICK;
    public static android.os.VibrationEffect createOneShot(long, int);
    public static android.os.VibrationEffect createPredefined(int);
  }
  ```
- *Its use:* this lesson calls `VibrationEffect.createPredefined
  (VibrationEffect.EFFECT_TICK)` — the real, semantically-correct
  predefined effect for a short, light "click," rather than
  `createOneShot`'s own raw duration-and-amplitude shape, which would
  require picking arbitrary real numbers with no principled real
  meaning.
- *Type:* a real, public, abstract Android platform class, with real,
  public static factory methods.
- *Responsibility:* describing, as data, exactly what the vibration
  hardware should do — decoupled from actually triggering it.
- *Depends on:* nothing beyond its own real static factory methods.
- *Connects to:* its own real, constructed instance is the real argument
  `Vibrator.vibrate` receives.
- *Shape:* `android.os`'s own real, public platform API, added
  alongside `Vibrator`'s own older, real, now-partially-deprecated
  surface.

## Everything else in the file, not this lesson's subject but still explained

**`Build` / `Build.VERSION` / `Build.VERSION_CODES`**
- *What it is:* the real, public Android platform class (and its two
  real nested holder objects) exposing facts about the specific real
  Android version a device is actually running.
- *Implementation:* real, confirmed via `javap` against two real,
  separately-compiled nested classes:
  ```
  public class android.os.Build$VERSION {
    public static final int SDK_INT;
  }
  public class android.os.Build$VERSION_CODES {
    public static final int O; // confirmed real, compiled value: 26
  }
  ```
- *Its use:* this lesson reads `Build.VERSION.SDK_INT` and compares it
  against the real, confirmed constant `Build.VERSION_CODES.O`, to
  decide which of two real vibration code paths a given real device can
  actually use.
- *Type:* `SDK_INT` is a real, public, static, integer field; `O` is a
  real, public, static, final, integer constant.
- *Responsibility:* letting real code branch correctly across real,
  different Android versions, at real runtime, on the real, specific
  device the app is actually running on.
- *Depends on:* nothing — populated by the real Android platform itself
  at real device boot.
- *Connects to:* gates which of `VibrationEffect`'s real, modern API or
  `Vibrator.vibrate(long)`'s real, older, deprecated overload actually
  runs.
- *Shape:* `android.os`'s own real, public platform API.

**`Context.VIBRATOR_SERVICE`**
- *What it is:* a real, public, `String`-valued constant naming the
  system service `getSystemService` returns a real `Vibrator` for.
- *Implementation:* unchanged in shape from `Context.SENSOR_SERVICE`'s
  own already-established treatment — a real, public, static, final
  `String` field. **Real, confirmed finding, worth stating plainly**:
  this exact constant is itself genuinely deprecated — confirmed by a
  real compiler warning this lesson's own real code triggers — in favor
  of a newer real constant, `Context.VIBRATOR_MANAGER_SERVICE`, paired
  with a real `VibratorManager` class (`getDefaultVibrator()`) added in
  a later real Android version than this project's own `minSdk`
  supports outright. **Investigated, not adopted**: migrating fully to
  `VibratorManager` would need its own real `Build.VERSION.SDK_INT`
  branch, on top of the one `VibrationEffect` already needs — real,
  compounding complexity for a real capability this project's existing,
  still-functional (if deprecated) path already provides correctly on
  every real device this project's own `minSdk` targets; deliberately
  left as a real, honest, documented deprecation instead, the same
  category of judgment call already made for `ShadowSensorManager
  .createSensorEvent`'s own real, tooling-only deprecation.
- *Its use:* unchanged — passed to `getSystemService`, this time asking
  for a real `Vibrator` instead of a real `SensorManager`.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* its own real result, cast to `Vibrator`, feeds directly
  into this lesson's own new haptic-triggering code.
- *Shape:* unchanged — this project's own already-established
  `getSystemService` pattern, reused a second real time.

**`LocalContext` / `DisposableEffect` / `SensorManager` / `Sensor` /
`SensorEvent` / `SensorEventListener` / `GraphTransform` /
`applyGesture` / `sensorValuesToPanDelta`**
- *What it is:* this project's own real, already fully established
  tilt-to-pan machinery, proven and shipped in the previous lesson.
- *Implementation:* unchanged from their own prior, full treatment.
- *Its use:* this lesson's own new code runs alongside all of it,
  unchanged, adding a real, physical response on top of the pan update
  they already produce.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* both of `GraphScreen`'s own real, independent pan
  sources — touch and tilt — now call through this lesson's own new
  `updateTransform`, instead of assigning `transform` directly.
- *Shape:* unchanged — this project's own real, proven foundation, now
  carrying a second real consequence beyond moving the graph.

**`ShadowVibrator` / `shadowOf` / `ApplicationProvider.getApplicationContext()`
/ `createComposeRule` / `waitForIdle` / `ShadowSensor.newInstance` /
`ShadowSensorManager`**
- *What it is:* the same real, already-established Robolectric testing
  tools this project has used ever since it first started testing
  Android-framework-dependent code, plus one real, new member of that
  same family this lesson introduces:
  `ShadowVibrator`, Robolectric's own real shadow for `Vibrator`,
  exposing real, inspectable state (`isVibrating`, `effectId`,
  `milliseconds`) a genuine test can assert against without any real
  vibration hardware.
- *Implementation:* real declared shape, confirmed via `javap` against
  the actual installed Robolectric `.jar` (abbreviated — the real class
  also exposes real pattern/repeat/primitive-effect state this lesson's
  own real use has no need for):
  ```
  public class org.robolectric.shadows.ShadowVibrator {
    public boolean isVibrating();
    public int getEffectId();
    public long getMilliseconds();
  }
  ```
- *Its use:* this lesson's own new tests call `shadowOf(vibrator)` to
  read back whether, and with what real effect, a real vibration was
  actually requested.
- *Type:* the rest, unchanged; `ShadowVibrator` itself is a real, public
  Robolectric shadow class.
- *Responsibility:* the rest, unchanged; `ShadowVibrator` simulates real
  vibration-hardware behavior faithfully enough for exactly these kinds
  of claims, with no real device required.
- *Depends on:* unchanged.
- *Connects to:* unchanged, plus `ShadowVibrator`'s own real state now
  connects to this lesson's own new production vibration calls.
- *Shape:* this project's own established testing toolkit, now one real
  member larger.

---

## Concept Unit: Reading a Second API With the Same Checklist

### The Problem

This project already has one real, working way to make the phone
vibrate — `LocalHapticFeedback.current.performHapticFeedback
(HapticFeedbackType.LongPress)`, this project's own existing, real,
permanent haptic-feedback code, still firing on every keypad press
today. That real API has exactly two real
constants available on this project's own resolved Compose UI version —
`LongPress` and `TextHandleMove` — neither one a real, semantically
correct choice for "the graph just crossed an axis": both are named for
specific touch-interaction moments, not for an arbitrary programmatic
event a composable decides on its own to signal. Making the phone click
for a real reason that has nothing to do with a touch event at all needs
a different, lower-level, more general real API — one this project has
never opened before.

Given this project's own real, transferable documentation-reading
checklist — entry point, types, interfaces, lifecycle, callbacks,
required configuration, cleanup, examples, deprecations — already
worked once, on the real Sensor API, to turn a completely unfamiliar
real Android class into a working, tested feature: what would applying
that exact same real checklist turn up for Android's own real,
lower-level vibration API? Is
there a real, semantically-named "just a click" effect, the way `Sensor
.TYPE_ACCELEROMETER` was a real, semantically-named entry point rather
than a raw, unlabeled sensor index?

### Introduce the Concept in Isolation

A real, temporary test file, `LabVibratorTest.kt`, added directly to
this project's own real Gradle module:

```kotlin
package com.example.calculator

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config

private fun labTriggerTick(vibrator: Vibrator) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK))
    } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(20)
    }
}

@RunWith(RobolectricTestRunner::class)
class LabVibratorTest {

    @Config(sdk = [30])
    @Test
    fun onARealModernDeviceTheRealPredefinedTickEffectFires() {
        // Arrange
        val context = ApplicationProvider.getApplicationContext<Context>()
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

        // Act
        labTriggerTick(vibrator)

        // Assert
        assertTrue(shadowOf(vibrator).isVibrating)
        assertEquals(VibrationEffect.EFFECT_TICK, shadowOf(vibrator).effectId)
    }

    @Config(sdk = [24])
    @Test
    fun onARealOldDeviceBelowApiTwentySixTheRealDeprecatedFallbackFires() {
        // Arrange
        val context = ApplicationProvider.getApplicationContext<Context>()
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator

        // Act
        labTriggerTick(vibrator)

        // Assert
        assertTrue(shadowOf(vibrator).isVibrating)
        assertEquals(20L, shadowOf(vibrator).milliseconds)
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabVibratorTest" --rerun-tasks`, reproduced
identically across two separate runs, saved in full in
`verification/11.4/lab1_output.txt`):

```
BUILD SUCCESSFUL in 9s
Real, saved XML result: tests="2" skipped="0" failures="0" errors="0"
```

**A real, honest investigation trail, worth showing in full**: the first
version of `onARealModernDeviceTheRealPredefinedTickEffectFires` used
`@Config(sdk = [34])` — this project's own real, current
`compileSdk`/`targetSdk` — and genuinely failed
(`expected:<2> but was:<0>`). Fetching Robolectric's own real,
published `ShadowSystemVibrator.java` source showed why: the real shadow
method that records which predefined effect was requested is annotated
`@Implementation(minSdk = Q, maxSdk = R)` — Android 10 and 11 only. On
Android 12 (`S`) and above, a different real shadow method takes over,
storing the requested effect as a list of internal segment objects with
no real, public getter exposing which named effect it represents — a
genuine Robolectric simulation gap on newer configured API levels, not a
mistake in the real production code. The real, honest fix: this one,
specific claim — "the real `EFFECT_TICK` constant was actually
requested" — is tested at `@Config(sdk = [30])` instead, a real,
specific Android version where Robolectric's own shadow genuinely
exposes the answer; this project's own real, permanent production code
still targets real, current Android versions unchanged.

### Discard the Throwaway Example

`LabVibratorTest.kt` was deleted from the project immediately after this
real run — it never appears in the project again. Applying this
project's own documentation-reading checklist here turned up a real,
working answer: `Vibrator`
is the real entry point (obtained the same real way `SensorManager`
was); `VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)` is
the real, semantically-named effect this feature actually needs; the
real, required configuration is a version check, because
`VibrationEffect` itself is not available on every real device this
project's own `minSdk` supports, and the real, older `vibrate(long)`
overload — genuinely confirmed deprecated, via a real compiled
`Deprecated` bytecode attribute, not assumed — is the correct, real
fallback below it.

### Mechanical Walkthrough

Enumerated in order, every new method call, property access, operator,
and literal in `labTriggerTick` and its own two tests:

- `Build.VERSION.SDK_INT` — a real, static field access, reading the
  real, running device's own actual Android API level as a plain `Int`.
- `Build.VERSION.SDK_INT >= Build.VERSION_CODES.O` — an ordinary Kotlin
  comparison operator, against a real, static field access reading the
  real, compiled integer constant `26` — confirmed directly via `javap`
  against this project's own installed platform `.jar`, not assumed from
  familiarity with the Android version-naming scheme.
- `VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)` — a
  real, static factory method call, its own single real argument itself
  a real, static field access reading a real, public integer constant —
  returns a real, constructed `VibrationEffect` instance describing
  exactly one named effect, nothing else.
- `vibrator.vibrate(VibrationEffect.createPredefined(...))` — a real
  instance method call, handing that real, constructed effect to the
  real `Vibrator`, requesting it actually run.
- `@Suppress("DEPRECATION")` — a real Kotlin annotation, its own single
  real argument a literal `String` naming exactly which category of
  compiler warning to withhold at the one call directly beneath it —
  scoped narrowly, not silencing deprecation warnings project-wide.
- `vibrator.vibrate(20)` — a real, genuinely deprecated instance method
  call (confirmed via real compiled bytecode, not assumed), passing a
  plain integer literal, which Kotlin silently widens to the real,
  expected `Long` parameter type with no cast needed — a real, constant
  literal can adapt to whatever numeric type the target actually
  declares — meaning a duration in milliseconds, the only real API
  available for actually vibrating a device below the real, required
  Android version `VibrationEffect` needs.
- `ApplicationProvider.getApplicationContext<Context>()` — the same
  real, already-established call proven in earlier lessons.
- `context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator` — the
  same real, already-established instance method call and cast pattern
  already proven for `SensorManager`, this time naming the real,
  genuinely-deprecated `VIBRATOR_SERVICE` constant and casting to
  `Vibrator`.
- `shadowOf(vibrator).isVibrating` — the same real, already-established
  `shadowOf` call, this time against the real, new `ShadowVibrator`,
  reading a real, boolean property confirming whether a real vibration
  is currently active.
- `shadowOf(vibrator).effectId` — a real property access reading which
  real, predefined effect constant the shadow actually recorded.
- `shadowOf(vibrator).milliseconds` — a real property access reading the
  real, raw duration the shadow actually recorded.
- `@Config(sdk = [30])` / `@Config(sdk = [24])` — the same real,
  already-established Robolectric configuration annotation, this time
  set to two specific, different real Android API levels on two
  different real test methods in the same real file — proving each real
  code branch against a real device version where that exact branch is
  the one that actually runs.

### CS Lens

This is **runtime feature detection** — checking a real capability (or,
here, a real platform version standing in for one) at the moment code
actually runs, and choosing between two real, working implementations
accordingly, rather than assuming one fixed environment everywhere.

```
Also recognized in: a web browser checking `if ('IntersectionObserver'
in window)` before using a newer API, falling back to a scroll-listener
polyfill otherwise; a CPU instruction set falling back from AVX-512 to
plain SSE when the running processor doesn't support the newer
extension; a database driver negotiating the highest protocol version
both the client library and the actual connected server support
```

### SE Lens

Why keep the real, deprecated `vibrate(long)` branch at all, instead of
simply requiring a newer real Android version and dropping it? Because
this project's own real, already-established `minSdk` is 24 — a real,
existing commitment made when this project's own Gradle module was
first configured, long before this lesson ever needed vibration — and
`VibrationEffect` genuinely isn't available on
every real device that commitment promises to support. The real
alternative, raising `minSdk`, would silently drop real support for
real, older devices this project already promised to run on, for the
sake of one small feature; the real, deprecated call, by contrast, costs
nothing but one real compiler warning, explicitly acknowledged and
narrowly suppressed at the exact real call site that needs it — the same
kind of honest, minimal-real-cost tradeoff this project already made
when it kept using `ShadowSensorManager.createSensorEvent` despite its
own real, tooling-only deprecation warning.

### Commands Needed

This project's own already-established `./gradlew testDebugUnitTest`,
run against the real lab above.

### Run It

Shown above — real, executed output for both the initial investigation
and the corrected, passing version, saved in full in
`verification/11.4/lab1_output.txt`.

### Connect the Pieces

This unit proved a real, working, version-aware way to make the device
actually click — reusing this project's own documentation-reading
checklist a second real time, on a genuinely different real Android API
than the Sensor API it was first applied to. The next unit proves one
more small, new real construct this feature needs before either one gets
wired into `GraphScreen` for real.

---

## Concept Unit: A Value That Only Rebuilds When Its Key Does

### The Problem

`GraphScreen` needs exactly one real `Vibrator` for its entire real
lifetime on screen — asking `getSystemService` again on every real
recomposition would be real, wasted work for a value that never
actually changes once the screen's own real `Context` is known. This
project already knows one real tool for computing something once and
keeping it: plain `remember { }`, proven back in Stage 1, computing its
real body exactly once, on the composable's own first real composition,
and never again for the composable's entire real lifetime — regardless
of how many times it recomposes afterward.

But plain `remember { }`'s own real "never again" behavior is too rigid
here. `LocalContext.current` is itself a real value that, in principle,
different real screens — or the same screen recreated after a real
configuration change — could receive a genuinely different real
`Context` for. A `Vibrator` built once from whatever `Context` happened
to be present at the very first composition, then permanently kept no
matter what, would be real, silently wrong the moment that assumption
ever stopped holding, with no compiler warning to catch it. Given plain
`remember { }` recomputes never, and no `remember` at all recomputes
every single time — what real, middle option would recompute exactly
when a specific real value, and only that value, actually changes?

### Introduce the Concept in Isolation

A real, temporary composable and test file, added directly to this
project's own real Gradle module:

```kotlin
package com.example.calculator

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

private var labBuildCount = 0
private var labUnrelatedTrigger by mutableIntStateOf(0)
private var labKey by mutableStateOf("a")

@Composable
private fun LabKeyedRememberReader() {
    labUnrelatedTrigger
    remember(labKey) { labBuildCount++ }
}

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabKeyedRememberTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun rememberWithAKeyRebuildsOnlyWhenTheRealKeyChanges() {
        // Arrange
        labBuildCount = 0
        labUnrelatedTrigger = 0
        labKey = "a"
        composeTestRule.setContent { LabKeyedRememberReader() }
        assertEquals(1, labBuildCount)

        // Act: recompose with the key unchanged
        labUnrelatedTrigger = 1
        composeTestRule.waitForIdle()

        // Assert: no real rebuild happened
        assertEquals(1, labBuildCount)

        // Act: recompose with the key genuinely changed
        labKey = "b"
        composeTestRule.waitForIdle()

        // Assert: a real rebuild happened
        assertEquals(2, labBuildCount)
    }
}
```

### Mechanical Walkthrough

Enumerated in order, every new method call, property access, operator,
and literal in `LabKeyedRememberReader` and its own test:

- `private var labBuildCount = 0` — an ordinary, top-level, mutable
  Kotlin property, real, plain (not Compose state) — this lab's own
  shared counter, incremented only when the real block actually runs.
- `private var labUnrelatedTrigger by mutableIntStateOf(0)` — the same
  real, already-established `mutableIntStateOf` construction and
  property-delegate syntax already proven elsewhere in this project,
  this time deliberately holding a value the lab's own composable reads
  but never passes to `remember` — a real, controlled way to force a
  real recomposition without touching the real key under test.
- `private var labKey by mutableStateOf("a")` — the same real,
  already-established `mutableStateOf` construction and delegate
  syntax, holding this lab's own real key value.
- `labUnrelatedTrigger` — a real, ordinary Kotlin property read, as its
  own bare statement, inside the composable; reading a real Compose
  state value here is what makes this composable actually recompose
  when `labUnrelatedTrigger` changes, the same real state-observation
  mechanism already established for every other `mutableStateOf` read
  in this project — the real value itself is never actually needed, only
  the real act of reading it.
- `remember(labKey) { labBuildCount++ }` — a real, public Compose
  function, a genuinely different real overload from the plain,
  no-argument `remember { }` already proven in this project: this one
  accepts one real key argument alongside its own real calculation
  lambda. On this composable's own first real composition, the real
  block runs, incrementing `labBuildCount`, and the real result is
  cached alongside the real key it was computed from. On every
  subsequent real recomposition, Compose compares the real, current key
  against the real, previously-cached one: identical, and the real
  cached result is reused with the block never running again;
  different, and the real block runs again, its new real result cached
  against the new real key.
- `labBuildCount++` — an ordinary, already-established Kotlin
  increment operator, real, plain (not a Compose state mutation) —
  simply counting real block executions.
- `composeTestRule.setContent { LabKeyedRememberReader() }` — the same
  real, already-established call, composing this lab's own real reader
  for the first real time.
- `assertEquals(1, labBuildCount)` — the same real, already-established
  JUnit call, confirming the real block ran exactly once on first
  composition.
- `labUnrelatedTrigger = 1` — a real, ordinary Kotlin assignment to a
  real Compose state property, from outside the composable — the real
  trigger this lab uses to force a real recomposition with the real key
  left untouched.
- `composeTestRule.waitForIdle()` — the same real, already-established
  call, letting the real, pending recomposition this state change
  scheduled actually run before the next real assertion.
- `labKey = "b"` — a real, ordinary Kotlin assignment, this time to the
  real key itself — a genuinely different real `String` value than the
  one `remember` last cached.

### CS Lens

This is **memoization keyed by dependency** — caching a computed result
and reusing it unconditionally, except when a specific, named input
changes, at which point the real cache is invalidated and the real
computation runs again.

```
Also recognized in: a build system re-running a compilation step only
when its real input files' own hashes have actually changed, reusing
the cached output otherwise; a React `useMemo(fn, [dep])` hook, running
`fn` again only when `dep` changes between renders; a spreadsheet cell
recalculating only when a cell it actually references changes, not on
every unrelated edit anywhere else in the sheet
```

### SE Lens

Why does `remember` need an explicit key parameter at all, instead of
Compose simply re-running every `remember` block whenever anything in
the composable's own scope changes? Because that would defeat
`remember`'s entire real purpose — the whole reason Stage 1 introduced
it was to survive recomposition unchanged, and a version that silently
recomputed on any nearby change would behave exactly like having no
`remember` at all, just with extra real ceremony. The real, opposite
failure — never recomputing, ever, the plain `remember { }` this
project already has — is exactly wrong for a value whose own real
correctness genuinely depends on something that really can change,
like a `Context` obtained through `LocalContext.current`. The explicit
key is Compose's own real, honest middle ground: the caller states,
by name, exactly which real value the cached result actually depends
on, and Compose enforces that contract mechanically — correct as long
as every real value the calculation actually reads is genuinely named
in the key list, the same real kind of "state the true dependency
explicitly" discipline already proven for `LaunchedEffect`'s own keys.

### Commands Needed

This project's own already-established `./gradlew testDebugUnitTest`,
run against the real lab above.

### Run It

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabKeyedRememberTest" --rerun-tasks`, reproduced
identically on a second, separate run, saved in full in
`verification/11.4/lab2_output.txt`):

```
BUILD SUCCESSFUL in 8s
Real, saved XML result: tests="1" skipped="0" failures="0" errors="0"
```

**A real, honest finding, worth showing plainly**: the first version of
`LabKeyedRememberReader` wrote `val unrelated = labUnrelatedTrigger`,
binding the real property read to a local that was never actually read
afterward — a real, genuine "Variable 'unrelated' is never used"
compiler warning. Fixed by reading `labUnrelatedTrigger` as a bare
statement instead: the real Compose state read itself, not the value it
produces, is what actually forces recomposition here.

### Connect the Pieces

This unit proved `remember(key1) { }` recomputes its own real block
exactly when its own named key genuinely changes, and reuses its cached
result otherwise — the correct real middle ground between plain
`remember { }`'s own "never again" and no `remember` at all's own
"every single time." The final unit wires this lesson's own two proven
pieces — the real vibration mechanism and this real, keyed caching — into
`GraphScreen` itself, alongside a small, new, pure function deciding
exactly when a real axis crossing has actually happened.

---

## Concept Unit: Wiring the Click into Both Real Input Sources

### The Problem

`GraphScreen` already has two real, independent input sources —
touch and tilt, from the previous lesson — each calling `applyGesture`
and assigning its real result straight to `transform`. Neither call
site currently has any way to know whether the specific update it just
made carries the graph's own real origin back across an axis; a real
answer to that question needs to compare the real transform *before*
the update against the real transform *after* it, and both real call
sites need the identical real answer, computed the identical real way,
or the two real input sources could disagree about when a real click
should happen.

Given both real input sources already funnel through the same real
`applyGesture` function, and this lesson has just proven a real,
version-aware way to make the device click plus a real, keyed way to
cache the `Vibrator` that click needs — what would the real, permanent
code look like that compares an old and a new `GraphTransform`,
decides whether an axis was actually crossed, and triggers a real click
from both real input sources without either one duplicating that logic?

### Project Change

Before this lesson, both of `GraphScreen`'s own real input sources
assigned `transform = applyGesture(...)` directly, with no check of any
kind on the real result. The real, permanent change adds a small, real,
pure function computing whether a real axis crossing occurred between
an old and new `GraphTransform`, and routes both real input sources
through one small, shared real update function that checks it and
triggers a real, physical click exactly when it's true — leaving
`applyGesture` itself, and everything about how panning actually
computes, completely untouched.

### New Code

`Graphing.kt`, appended after `sensorValuesToPanDelta` (real, current
file,
`AndroidCalculator/app/src/main/java/com/example/calculator/Graphing.kt`,
lines 52-57):

```kotlin
private fun signFlipped(previous: Float, updated: Float): Boolean =
    (previous > 0f && updated < 0f) || (previous < 0f && updated > 0f)

fun crossedAxis(previous: GraphTransform, updated: GraphTransform): Boolean =
    signFlipped(previous.panOffset.x, updated.panOffset.x) ||
        signFlipped(previous.panOffset.y, updated.panOffset.y)
```

`MainActivity.kt`, a new, top-level private function, added directly
above `GraphScreen`:

```kotlin
private fun triggerAxisCrossingHaptic(vibrator: Vibrator) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        vibrator.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK))
    } else {
        @Suppress("DEPRECATION")
        vibrator.vibrate(20)
    }
}
```

`MainActivity.kt`, added inside `GraphScreen`, directly after the
existing `val context = LocalContext.current` line and before the
existing `DisposableEffect(Unit) { ... }` block:

```kotlin
    val vibrator = remember(context) { context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator }
    val updateTransform: (GraphTransform) -> Unit = { newTransform ->
        if (crossedAxis(transform, newTransform)) {
            triggerAxisCrossingHaptic(vibrator)
        }
        transform = newTransform
    }
```

And, at both of `GraphScreen`'s own two existing real transform-update
call sites, `transform = applyGesture(...)` becomes
`updateTransform(applyGesture(...))` — the sensor listener's own
`onSensorChanged`, and the touch canvas's own `detectTransformGestures`
lambda.

### Updated Project

The complete, real, current `GraphScreen` (Reference Source:
`AndroidCalculator/app/src/main/java/com/example/calculator/MainActivity.kt`,
lines 135-191):

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
    val vibrator = remember(context) { context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator }
    val updateTransform: (GraphTransform) -> Unit = { newTransform ->
        if (crossedAxis(transform, newTransform)) {
            triggerAxisCrossingHaptic(vibrator)
        }
        transform = newTransform
    }
    DisposableEffect(Unit) {
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                updateTransform(applyGesture(transform, sensorValuesToPanDelta(event.values[0], event.values[1]), 1f))
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
                        updateTransform(applyGesture(transform, pan, zoom))
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
and literal this change adds:

- `private fun signFlipped(previous: Float, updated: Float): Boolean` —
  an ordinary Kotlin function declaration, real, private — an
  implementation detail of `crossedAxis` alone, never called from
  anywhere else.
- `(previous > 0f && updated < 0f) || (previous < 0f && updated > 0f)`
  — ordinary Kotlin comparison and boolean operators, real: true exactly
  when the two real values sit on strictly opposite sides of zero — a
  real value of exactly `0f` on either side never counts as a crossing
  by itself, only a genuine flip from positive to negative or back.
- `fun crossedAxis(previous: GraphTransform, updated: GraphTransform): Boolean`
  — an ordinary Kotlin function declaration, real, public — this
  project's own new, pure entry point for the whole real question this
  unit answers.
- `signFlipped(previous.panOffset.x, updated.panOffset.x) || signFlipped(previous.panOffset.y, updated.panOffset.y)`
  — two real calls to the helper above, one per real axis, joined by an
  ordinary Kotlin boolean-or: crossing either the real vertical axis
  (an `x` sign flip) or the real horizontal axis (a `y` sign flip)
  counts as a real crossing.
- `remember(context) { context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator }`
  — this lesson's own prior unit's real, keyed `remember` call, keyed on
  `context` itself: the real `Vibrator` is looked up once for a given
  real `Context` and reused across every real recomposition that
  `Context` stays the same for, looked up again only if `LocalContext
  .current` ever actually provides a genuinely different real `Context`.
- `val updateTransform: (GraphTransform) -> Unit = { newTransform -> ... }`
  — an ordinary Kotlin function-typed value: a `val` whose own declared
  type is itself a function signature, `(GraphTransform) -> Unit`,
  assigned a real lambda, callable afterward exactly like any other
  function. Declared once per composition and closing over
  `transform`/`vibrator`, called from both of `GraphScreen`'s own real
  input sources instead of each duplicating the same real check.
- `if (crossedAxis(transform, newTransform))` — a real call to this
  unit's own new pure function, comparing `GraphScreen`'s own real,
  current `transform` (captured by the closure, read fresh every real
  call since it's backed by a real Compose `MutableState`) against the
  real, freshly-computed `newTransform` an input source just produced.
- `triggerAxisCrossingHaptic(vibrator)` — a real call to this lesson's
  own new function, run only when a real crossing was just detected.
- `transform = newTransform` — the same real, ordinary Kotlin
  assignment already established, now happening inside
  `updateTransform` instead of at each real call site directly, so the
  real crossing check always runs before the real state actually
  updates.
- `updateTransform(applyGesture(transform, sensorValuesToPanDelta(event.values[0], event.values[1]), 1f))`
  — the real, nested call already proven in the previous lesson, now
  wrapped in a call to `updateTransform` instead of a direct assignment.
- `updateTransform(applyGesture(transform, pan, zoom))` — the real,
  already-established touch-gesture call, identically wrapped.

### CS Lens

This is **edge detection** — noticing not a value's own current state,
but the specific real moment it transitions from one side of a
threshold to the other, distinct from merely being above or below it.

```
Also recognized in: a digital circuit's rising-edge trigger, firing once
exactly when a signal transitions from low to high, not for the entire
time it stays high; a game's own collision system firing an "entered
the trigger zone" event only on the frame a character's position
crosses the zone's real boundary, not on every frame spent inside it;
a stock-trading alert firing only when a price crosses a set threshold,
not continuously while the price happens to sit above or below it
```

### SE Lens

Why does `updateTransform` compare `transform` (read at call time) against
`newTransform` (the parameter), rather than `crossedAxis` taking the
raw pan delta and deciding some other way? Because `GraphTransform`
already accumulates real pan as a running total (`applyGesture`'s own
established, already-proven behavior, adding each new delta onto the
existing real offset) — the only real, correct way to know whether an
axis was crossed is comparing the real, accumulated position before and
after, not looking at one incremental delta in isolation, which could
be small enough to land entirely on one side of zero even while the
graph is genuinely near an axis, or could itself jump straight across on
a single real, larger sensor reading. Routing the comparison through
one small, shared `updateTransform`, rather than duplicating
`if (crossedAxis(...))` at both real call sites, means a future real
change to when a click should fire — a different real condition, a
cooldown between real clicks — has exactly one real place to change,
the same real motivation already proven for routing both real input
sources through `applyGesture` itself in the previous lesson.

### Commands Needed

This project's own already-established `./gradlew testDebugUnitTest`,
run against the real, permanent tests below.

### Run It

Real, permanent tests prove both the pure crossing logic and the full,
real, wired-together production behavior.

`GraphingTest.kt`, real, current file:

```kotlin
    @Test
    fun crossedAxisDetectsARealSignFlipOnTheXAxis() {
        // Arrange
        val previous = GraphTransform(Offset(5f, 0f), 20.0)
        val updated = GraphTransform(Offset(-3f, 0f), 20.0)

        // Act
        val result = crossedAxis(previous, updated)

        // Assert
        assertEquals(true, result)
    }

    @Test
    fun crossedAxisReturnsFalseWhenLeavingTheRealDeadCenterForTheFirstTime() {
        // Arrange
        val previous = GraphTransform(Offset.Zero, 20.0)
        val updated = GraphTransform(Offset(4f, 0f), 20.0)

        // Act
        val result = crossedAxis(previous, updated)

        // Assert
        assertEquals(false, result)
    }
```

`GraphScreenTest.kt`, real, current file:

```kotlin
    @Test
    fun realAxisCrossingFromSensorTiltTriggersARealVibration() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        val accelerometer = ShadowSensor.newInstance(Sensor.TYPE_ACCELEROMETER)
        shadowOf(sensorManager).addSensor(accelerometer)

        composeTestRule.setContent {
            GraphScreen()
        }
        composeTestRule.waitForIdle()

        val firstEvent = ShadowSensorManager.createSensorEvent(3)
        firstEvent.values[0] = -5f
        firstEvent.values[1] = 0f
        shadowOf(sensorManager).sendSensorEventToListeners(firstEvent)

        assertEquals(false, shadowOf(vibrator).isVibrating)

        val secondEvent = ShadowSensorManager.createSensorEvent(3)
        secondEvent.values[0] = 10f
        secondEvent.values[1] = 0f
        shadowOf(sensorManager).sendSensorEventToListeners(secondEvent)

        assertEquals(true, shadowOf(vibrator).isVibrating)
    }
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.GraphScreenTest" --tests
"com.example.calculator.GraphingTest" --rerun-tasks`, reproduced
identically on a second, separate run, saved in full in
`verification/11.4/step1_production_tests.txt`):

```
BUILD SUCCESSFUL in 9s
GraphScreenTest.xml: tests="6" skipped="0" failures="0" errors="0"
GraphingTest.xml:    tests="12" skipped="0" failures="0" errors="0"
```

**A real, honest debugging finding, worth showing plainly**: the first
version of `realAxisCrossingFromSensorTiltTriggersARealVibration` called
`composeTestRule.waitForIdle()` immediately before each `isVibrating`
assertion, and the second assertion genuinely failed
(`expected:<true> but was:<false>`). Investigated by fetching
Robolectric's own real `ShadowSystemVibrator.java` source: every real
`vibrate` call schedules a real, internal `Handler.postDelayed` runnable
that resets `isVibrating` back to `false` after the real effect's own
reported duration — near-zero for a predefined effect — so calling
`waitForIdle()`, which drains that same real main-thread queue, was
racing against that real, scheduled reset and losing. The real listener
callback, and the real vibration call inside it, already run
synchronously the moment `sendSensorEventToListeners` is called — no
`waitForIdle()` is actually needed to observe them. The real fix:
check `isVibrating` immediately after dispatching each real sensor
event, before anything drains the real main-thread queue.

### Connect the Pieces

`GraphScreen` now gives a real, physical click the instant either real
input source — touch or tilt — carries the graph's own origin back
across a coordinate axis, on every real device this project's own
`minSdk` supports, correctly falling back to an older real vibration
API where the newer one isn't available. Nothing about how panning
itself computes changed; `applyGesture` is exactly as it was.

**Next:** Lesson 12.1 (Dependency Problems).
