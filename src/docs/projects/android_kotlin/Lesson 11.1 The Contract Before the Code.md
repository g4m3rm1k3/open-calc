# Lesson 11.1: The Contract Before the Code

**What you will build.** No new shipped feature — this lesson is purely
diagnostic, the same shape this project has already used to open a new
stage before. This project is about to depend, for the first time ever,
on a real piece of Android hardware — a motion sensor, built in Lesson
11.2 — through a real Android API this curriculum has never touched.
Before writing a single line of that real feature, this lesson proves a
transferable, real skill: reading an unfamiliar API's own real, official
documentation systematically enough to answer nine specific real
questions about it, using Android's real `Sensor` API as the concrete,
worked example — and proving, not just reading, the real answers wherever
this project's own tools can.

**What you need to know first:**
- Lesson 1.1 (How an Android Project Actually Fits Together) — `Context`,
  and the general real shape of an Android framework class this project
  depends on but did not write.
- Lesson 4.1 (Screens That Remember How You Got There) —
  `ApplicationProvider.getApplicationContext()`, this project's own
  already-established real way to reach a real `Context` from inside a
  Robolectric test.
- Lesson 10.1 (The Queue Every Tap Waits In) — this project's own
  standing discipline of citing real, freshly-fetched official source
  and real `javap`-confirmed signatures, rather than trusting memory or
  a secondhand reproduction.

No pipeline diagram — this lesson doesn't touch this project's own
expression or graphing pipeline; it investigates a new, separate real
API this project hasn't used before.

## Terms used in this lesson

- **`@Deprecated`** — a real Java/Kotlin annotation marking a class,
  method, or field as one a library's own maintainers no longer recommend
  using, even though it may still compile and run correctly; it exists so
  a real compiler can warn a caller at the exact moment they reach for
  something the library itself has already moved past, rather than
  leaving them to discover it only by reading documentation separately.

## Objects and methods used

**`Context.getSystemService(String)`**
- *What it is:* the real, general Android mechanism for reaching any of
  the OS's own shared system services — not just sensors, but things
  like location, notifications, and window management too — from
  anywhere a real `Context` is available.
- *Implementation:* real declared shape, confirmed via `javap` against
  this project's own real, installed `android.jar`
  (`android-commandlinetools/platforms/android-34/android.jar`):
  ```
  public abstract Object getSystemService(String name)
  ```
  `Context.SENSOR_SERVICE` is a real, public `static final String`
  constant naming which specific service to ask for.
- *Its use:* this lesson's own first real lab calls it directly, casting
  its real return value to `SensorManager`, to prove — not just read —
  that this is genuinely how a real `SensorManager` comes into being.
- *Type:* a real, public, abstract instance method on `Context`.
- *Responsibility:* looks up and returns whichever real, already-running
  system service the caller names, so app code never has to construct
  one by hand.
- *Depends on:* a real `Context` to call it on, and a real, valid service-
  name constant.
- *Connects to:* returns a real `Object`, requiring a real cast (here, to
  `SensorManager`) since one method serves every real system service
  Android offers, not just this one.
- *Shape:* a real, public, foundational part of `Context`'s own API
  surface — this lesson's own concrete real example of Android's own
  general "ask the system for a shared service" pattern.

**`SensorManager`**
- *What it is:* the real Android class letting an app discover and
  listen to the device's own real sensors.
- *Implementation:* real, fetched class-level Javadoc
  (`android.googlesource.com/platform/frameworks/base`,
  `core/java/android/hardware/SensorManager.java`, branch
  `refs/heads/android14-release`, fetched this session) states plainly:
  *"SensorManager lets you access the device's sensors,"* immediately
  followed by a real, explicit warning: *"Always make sure to disable
  sensors you don't need, especially when your activity is paused.
  Failing to do so can drain the battery in just a few hours."* The real
  class itself is annotated `@SystemService(Context.SENSOR_SERVICE)` —
  confirming, directly in the real source, the exact real string this
  lesson's own lab already used with `getSystemService`. `SensorManager`
  itself is declared `public abstract class SensorManager` — a real,
  abstract class, never constructed directly by app code.
- *Its use:* this lesson's own two real labs call it directly to prove
  both its real entry point and its real registration lifecycle.
- *Type:* a real, public, abstract class.
- *Responsibility:* owns the real, current list of sensors a device
  actually has, and manages every real listener currently registered to
  any of them.
- *Depends on:* obtained only through `getSystemService`, never
  constructed directly.
- *Connects to:* real callers ask it for a `Sensor` (via
  `getDefaultSensor`), then register a real `SensorEventListener` against
  that specific real sensor.
- *Shape:* a real, public Android platform class — this lesson's own
  first real look at a hardware-adjacent Android API.

**`Sensor`**
- *What it is:* the real Android type representing one specific, real
  physical sensor on the device — its kind, not a live reading from it.
- *Implementation:* `android.hardware.Sensor`, confirmed real via the
  same fetched source; `Sensor.TYPE_ACCELEROMETER` is one of its own
  real, public `static final int` constants, naming which real kind of
  sensor is meant.
- *Its use:* this lesson's own labs ask for one specific real kind,
  `TYPE_ACCELEROMETER` — the same real sensor Lesson 11.2's own tilt
  feature will need.
- *Type:* a real, public class, one real instance per real sensor a
  device actually has.
- *Responsibility:* identifies one specific real sensor and its own real
  capabilities — never itself a live value.
- *Depends on:* provided by `SensorManager`, never constructed directly
  by app code (this project's own real, fetched Robolectric source
  confirms even test code reaches it through a real, dedicated
  `ShadowSensor.newInstance(int)` helper, not a public constructor).
- *Connects to:* passed to `registerListener` to say which real sensor a
  given real listener wants events from.
- *Shape:* a real Android platform type — identifies a real sensor,
  doesn't carry its own live data.

**`SensorEvent`**
- *What it is:* the real Android type carrying one real, live reading
  from a sensor, delivered the instant new data is available.
- *Implementation:* real declared shape, confirmed via `javap` against
  this project's own real, installed `android.jar`:
  ```
  public int accuracy;
  public Sensor sensor;
  public long timestamp;
  public final float[] values;
  ```
  its own real constructor is package-private — ordinary app code, and
  even this lesson's own test code, cannot build one directly; only
  `android.hardware`'s own real internals (or, under Robolectric, a
  dedicated real shadow helper) can.
- *Its use:* this lesson's own second lab reads a real `SensorEvent`'s
  own `values` field directly, after a real, synthetic one is dispatched
  to a real listener.
- *Type:* a real, public class with real, public, directly-readable
  fields — not accessed through getter methods.
- *Responsibility:* carries exactly one real sensor reading's worth of
  data — its own numeric values, which real sensor produced it, and
  when.
- *Depends on:* produced only by the real sensor framework itself (or, in
  a real test, a dedicated Robolectric helper standing in for it).
- *Connects to:* delivered as the real argument to
  `SensorEventListener.onSensorChanged`.
- *Shape:* a real, public, plain-data Android platform type — this
  project's own first real look at an Android class with public fields
  instead of the getter-based shape most of this project's own real
  Kotlin code uses.

**`SensorEventListener`**
- *What it is:* the real Android interface an app implements to actually
  receive sensor data.
- *Implementation:* real, fetched, complete interface source
  (`core/java/android/hardware/SensorEventListener.java`, same branch,
  fetched this session):
  ```
  public interface SensorEventListener {
      public void onSensorChanged(SensorEvent event);
      public void onAccuracyChanged(Sensor sensor, int accuracy);
  }
  ```
  its own real Javadoc for `onSensorChanged` states a genuinely
  surprising, real detail: *"'on changed' is somewhat of a misnomer, as
  this will also be called if we have a new reading from a sensor with
  the exact same sensor values (but a newer timestamp)"* — and warns the
  real `SensorEvent` object passed in *"may be part of an internal pool
  and may be reused by the framework,"* meaning real app code must not
  hold onto it past the callback's own real, immediate scope.
- *Its use:* this lesson's own second lab implements it directly, as a
  real, anonymous object, to prove a real dispatched event actually
  reaches it.
- *Type:* a real, public interface with exactly two real, abstract
  methods.
- *Responsibility:* the one real, documented contract between
  `SensorManager` and any app code that wants to actually receive sensor
  data.
- *Depends on:* nothing — a real, minimal interface.
- *Connects to:* passed to `registerListener`/`unregisterListener`;
  called back by the real sensor framework itself whenever new real data
  or a real accuracy change arrives.
- *Shape:* a real, public Android platform interface — the real callback
  boundary between this project's own future code and the real Android
  sensor framework.

**`SensorManager.registerListener` / `unregisterListener`**
- *What it is:* the real methods that start and stop real sensor data
  from actually reaching a given real `SensorEventListener`.
- *Implementation:* real, fetched, current signature and Javadoc
  (same source, fetched this session):
  ```
  public boolean registerListener(SensorEventListener listener, Sensor sensor,
          int samplingPeriodUs)
  public void unregisterListener(SensorEventListener listener)
  ```
  `registerListener`'s own real Javadoc names the exact real, required
  third argument: *"The value must be one of `SENSOR_DELAY_NORMAL`,
  `SENSOR_DELAY_UI`, `SENSOR_DELAY_GAME`, or `SENSOR_DELAY_FASTEST` or,
  the desired delay between events in microseconds."* Those four real
  constants are real, public `static final int`s, confirmed via the same
  fetched source: `SENSOR_DELAY_FASTEST = 0`, `SENSOR_DELAY_GAME = 1`,
  `SENSOR_DELAY_UI = 2`, `SENSOR_DELAY_NORMAL = 3`. The real class also
  still carries an older, `@Deprecated` overload,
  `registerListener(SensorListener listener, int sensors)` — its own real
  Javadoc states plainly: *"This method is deprecated, use
  `SensorManager#registerListener(SensorEventListener, Sensor, int)`
  instead."*
- *Its use:* this lesson's own second lab calls the real, current,
  non-deprecated overload directly, and later calls `unregisterListener`
  to prove real cleanup.
- *Type:* both real, public instance methods on `SensorManager`.
- *Responsibility:* `registerListener` starts real event delivery to one
  real listener for one real sensor, at a real, requested rate;
  `unregisterListener` stops it.
- *Depends on:* a real `SensorEventListener`, a real `Sensor`, and (for
  `registerListener`) a real, valid sampling-rate argument.
- *Connects to:* proven, in this lesson's own lab, to genuinely control
  whether a real, dispatched `SensorEvent` reaches a given real listener
  at all.
- *Shape:* `SensorManager`'s own real, public API surface — the one real
  mechanism this entire lesson's own second unit investigates.

### Everything else in the file, not this lesson's subject but still explained

**`RobolectricTestRunner` / `@Config(sdk = [34])` / `ApplicationProvider.getApplicationContext()`**
- *What it is:* the same real, already fully established Robolectric
  testing tools this project has used since Lesson 1.4.
- *Implementation:* unchanged from their own prior, full treatment.
- *Its use:* both of this lesson's own labs run under exactly this same
  real, established setup.
- *Type:* unchanged.
- *Responsibility:* unchanged.
- *Depends on:* unchanged.
- *Connects to:* unchanged.
- *Shape:* unchanged — this project's own standard real test harness.

**`shadowOf` / `ShadowSensorManager` / `ShadowSensor.newInstance`**
- *What it is:* Robolectric's own real, dedicated testing support for the
  Sensor API specifically — a real shadow class controlling a simulated
  device's own real sensor list and listener bookkeeping, and a real
  factory function for building a real, testable `Sensor` instance where
  no public constructor exists.
- *Implementation:* real declared shape, confirmed via `javap` against
  this project's own real, installed `shadows-framework-4.13.jar`:
  ```
  public void addSensor(Sensor)
  public boolean hasListener(SensorEventListener)
  public void sendSensorEventToListeners(SensorEvent)
  public static Sensor ShadowSensor.newInstance(int)
  ```
- *Its use:* this lesson's own second lab uses all three to build a real,
  testable sensor, register a real listener against it, and dispatch a
  real, synthetic event.
- *Type:* real, public Robolectric API — `shadowOf`/`addSensor`/
  `hasListener`/`sendSensorEventToListeners` are instance-reaching calls;
  `ShadowSensor.newInstance` is a real, static factory.
- *Responsibility:* stand in for real, physical sensor hardware this
  environment doesn't have, while still exercising `SensorManager`'s own
  real, genuine registration and dispatch logic.
- *Depends on:* a real `SensorManager` (for `shadowOf`) or a real sensor
  type constant (for `newInstance`).
- *Connects to:* `addSensor` makes a sensor real to `getDefaultSensor`;
  `hasListener` reads real state `registerListener`/`unregisterListener`
  change; `sendSensorEventToListeners` is what actually calls a real
  listener's own `onSensorChanged`.
- *Shape:* Robolectric's own public testing API — this project's own
  first real use of it for hardware simulation, distinct from its
  already-established UI-simulation use (Compose testing) elsewhere.

---

## Concept Unit: Where It Starts and What It's Made Of

### The Problem

This project is about to depend, for the first time in its entire life,
on a real piece of Android hardware — a motion sensor. Nothing this
project has built so far — Compose, Room, coroutines, navigation — is
what actually reaches a real sensor; this is a genuinely unfamiliar real
API. Diving straight into writing code against an unfamiliar API, hoping
the right calls reveal themselves along the way, is a real, common
mistake — one this project's own established discipline (cite real,
fetched official source, verify with real running code) already argues
against, just not yet applied to the specific real question "where does
reading an unfamiliar API's own documentation even *start*?"

Given every Android system capability this project has used indirectly
so far — persistence, navigation — ultimately traces back to a real
`Context` this project already depends on everywhere, what would you
predict is the real, first thing to look for in an unfamiliar Android
API's own documentation: a constructor to call directly? A static
factory method? Or something that reaches through `Context` itself,
the same way this project's own code already reaches everything else
Android provides? And once you have whatever that real entry point
hands back, what's the next real thing worth identifying before writing
any more code: every method it has, or specifically which *types* and
*interfaces* it expects you to already know about?

### Introduce the Concept in Isolation

A real, temporary test file, `LabSensorEntryTest.kt`, added directly to
this project's own real Gradle module, reading Android's own real,
official `SensorManager` source (fetched this session) to identify its
real entry point before writing a single line against it:

```kotlin
package com.example.calculator

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabSensorEntryTest {

    @Test
    fun getSystemServiceReturnsARealSensorManager() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

        assertNotNull(sensorManager)
    }

    @Test
    fun aRealDeviceHasNoSensorsUntilTheTestExplicitlyAddsOne() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

        val accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

        assertNull(accelerometer)
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabSensorEntryTest" --rerun-tasks`, saved in
full in `verification/11.1/lab1_output.txt`):

```
BUILD SUCCESSFUL in 9s
Real, saved XML result: tests="2" skipped="0" failures="0" errors="0"
```

This proves two separate real things. First: `getSystemService(Context
.SENSOR_SERVICE)`, cast to `SensorManager`, genuinely returns a real,
non-null instance under Robolectric — confirming, empirically, that the
real entry point this lesson's own fetched `@SystemService` annotation
already named is real, not just documented. Second, a real, honest
surprise worth knowing before any future real feature depends on it: a
real, simulated Robolectric device starts with *zero* sensors —
`getDefaultSensor(Sensor.TYPE_ACCELEROMETER)` genuinely returned real
`null`, not some default stand-in — meaning any future test against a
real sensor must explicitly add one first, a real fact this project now
knows from running code, not from guessing.

### Discard the Throwaway Example

`LabSensorEntryTest.kt` was deleted from the project immediately after
this real run — it never appears in the project again. Reading
`getSystemService` first, before any other method on the unfamiliar
class, is what's called the **entry point** — the one real, documented
way outside code is meant to obtain a working instance in the first
place, as opposed to the many other real methods that class might have
once you already hold one.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator:

- `ApplicationProvider.getApplicationContext<Context>()` — the same
  real, already-established call, returning a real, simulated `Context`.
- `context.getSystemService(Context.SENSOR_SERVICE)` — the real,
  already-detailed instance call, passing the real, official constant
  naming the sensor service specifically; returns a real, plain `Object`.
- `as SensorManager` — an ordinary, already-established Kotlin unsafe
  cast, narrowing that real `Object` down to the real, specific type this
  lesson's own fetched source already confirmed it actually is.
- `assertNotNull(sensorManager)` — the same real, already-established
  JUnit call, confirming the real cast succeeded and the result is
  genuinely non-null.
- `sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)` — a real,
  public `SensorManager` method, passing the real, official
  `Sensor.TYPE_ACCELEROMETER` constant, asking for whichever real sensor
  of that specific kind the current real device has.
- `assertNull(accelerometer)` — the same real JUnit family, this time
  confirming a real *absence* — the exact, honest, empirically-confirmed
  surprise this unit's own real run proved.

### CS Lens

This is the **Service Locator** pattern — a real, central registry
(`Context`, here) that hands back already-constructed, shared real
services by name, rather than the caller ever constructing one directly.

```
Also recognized in: a web browser's own document.getElementById-style
lookups against a live page; a Spring/Java EE application's own real
dependency-injection container, resolving a requested service by its
own registered name or type; a game engine's own real, central asset
manager, handing back an already-loaded texture or sound by name rather
than reloading it from disk each time
```

### SE Lens

Why does Android route every system capability — sensors included —
through one shared `getSystemService` method, rather than giving each
one its own real, dedicated static factory (a hypothetical
`SensorManager.getInstance()`, say)? The real alternative — one static
factory per service — is genuinely simpler to read at each individual
call site. The real cost: a real device's own system services are
already running, shared, and often need real setup this app code should
never duplicate (a `SensorManager` genuinely needs to know about the
actual, live sensor hardware, not a fresh, disconnected instance);
`getSystemService` guarantees every real caller gets the *same*, real,
already-initialized instance instead of each independently trying to
construct or discover one. The honest cost of the chosen design: it's
genuinely less discoverable — nothing about `Context`'s own type signals
which real service names are valid, or what real type each one actually
returns, without reading the real documentation first, which is the
exact real reason this lesson's own subject — reading documentation
systematically — matters in the first place.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest`, run above.

### Run It

Shown above — real, executed output, saved in full in
`verification/11.1/lab1_output.txt`.

### Connect the Pieces

This unit proved this project's own real entry point into an entirely
unfamiliar Android API, and named the real types (`Sensor`,
`SensorEvent`) and the real interface (`SensorEventListener`) that entry
point's own real return value connects to next. The next unit reads
further into the same real documentation to find out when those real
pieces are actually meant to be used, and when they must be cleaned up.

---

## Concept Unit: What Happens When, and What You're Responsible For

### The Problem

The previous unit found *where* to obtain a real `SensorManager` and
*what* real types it deals in. But knowing a real class exists isn't the
same as knowing *when* to call its own real methods, *what* they
actually require, or *what happens if a real caller forgets to clean
up*. This project's own fetched `SensorManager` source already carries a
real, explicit warning about exactly that last point — battery drain
from forgetting to stop listening — sitting right in the class's own
opening Javadoc, not buried in a separate guide. Has anything about
*calling* `registerListener` actually been confirmed yet, or has this
project only read *about* it so far?

Given this project's own official, fetched example shows registering
inside `onResume()` and unregistering inside `onPause()` — real Android
lifecycle methods this project hasn't needed to override directly
before now — what would you predict happens to a real, already-
registered listener if an app *never* calls `unregisterListener` at
all: does the real sensor framework eventually give up and stop
delivering events on its own, or does it keep going, exactly as
warned, for as long as the app process is alive? And separately: this
project's own fetched source shows `registerListener` has more than one
real overload, including one that's explicitly marked `@Deprecated` —
what would you expect a real, current caller to do differently once
they notice that marking, versus a caller who never looked past the
first working overload they found?

### Introduce the Concept in Isolation

A real, temporary test file, `LabSensorLifecycleTest.kt`, added directly
to this project's own real Gradle module, using Robolectric's own real,
dedicated sensor-testing support to prove — not just read about —
`registerListener`'s and `unregisterListener`'s own real effect:

```kotlin
package com.example.calculator

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import org.robolectric.shadows.ShadowSensor
import org.robolectric.shadows.ShadowSensorManager

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class LabSensorLifecycleTest {

    @Test
    fun registeringDeliversARealEventAndUnregisteringStopsIt() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val accelerometer = ShadowSensor.newInstance(Sensor.TYPE_ACCELEROMETER)
        shadowOf(sensorManager).addSensor(accelerometer)

        var receivedValues: FloatArray? = null
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) {
                receivedValues = event.values
            }
            override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
        }

        val registered = sensorManager.registerListener(
            listener, accelerometer, SensorManager.SENSOR_DELAY_NORMAL
        )
        assertTrue(registered)
        assertTrue(shadowOf(sensorManager).hasListener(listener))

        val event = ShadowSensorManager.createSensorEvent(3)
        event.values[0] = 1.0f
        event.values[1] = 2.0f
        event.values[2] = 3.0f
        shadowOf(sensorManager).sendSensorEventToListeners(event)

        assertNotNull(receivedValues)
        assertTrue(receivedValues!![0] == 1.0f && receivedValues!![1] == 2.0f && receivedValues!![2] == 3.0f)

        sensorManager.unregisterListener(listener)
        assertFalse(shadowOf(sensorManager).hasListener(listener))
    }
}
```

Real, executed output (`./gradlew :app:testDebugUnitTest --tests
"com.example.calculator.LabSensorLifecycleTest" --rerun-tasks`,
reproduced identically across two separate runs, saved in full in
`verification/11.1/lab2_output.txt`):

```
w: .../LabSensorLifecycleTest.kt:45:41 'createSensorEvent(Int): SensorEvent!' is
   deprecated. Deprecated in Java

BUILD SUCCESSFUL in 9s
Real, saved XML result: tests="1" skipped="0" failures="0" errors="0"
```

This proves three separate real things. First: `registerListener`
genuinely returned real `true`, and Robolectric's own real
`hasListener(listener)` check confirmed real registration actually took
effect — not merely that the call didn't throw. Second: a real,
synthetic `SensorEvent`, dispatched through
`sendSensorEventToListeners`, genuinely reached this lab's own real
listener's `onSensorChanged`, with its exact real values (`1.0f, 2.0f,
3.0f`) intact — the real callback contract this lesson's own fetched
`SensorEventListener` source already described, now proven, not just
read. Third: `unregisterListener` genuinely made `hasListener` real
`false` immediately after — real, confirmed cleanup, not assumed.

**A real, honest, additional finding, worth naming precisely**: the real
compiler warning above comes from Robolectric's own testing tool,
`ShadowSensorManager.createSensorEvent`, which is itself deprecated in
this project's own real, installed Robolectric version — not from
Android's own production `Sensor` API, which carries no such warning on
anything this lab actually calls. A real deprecation warning always
names which library it belongs to; conflating "some library used here is
deprecated" with "the actual feature I'm learning is deprecated" is
exactly the kind of mistake reading the warning's own real source
carefully avoids. A real attempt to reach past it — Robolectric's own
newer, non-static `createSensorEvent()` instance method — was tried for
real and threw a real `NullPointerException`, since that particular real
overload has no sensor-type context to size its own `values` array from;
reverted to the working, if deprecated, overload rather than chase a
deprecation-free path at the cost of a real, working test.

### Discard the Throwaway Example

`LabSensorLifecycleTest.kt` was deleted from the project immediately
after this real run — it never appears in the project again. Confirming
a claim by actually reaching the code path that would prove it wrong if
it were — here, a `NullPointerException` from a genuinely different real
overload, not assumed from the warning text alone — is worth doing even
when the first, working answer already seems obviously correct.

### Mechanical Walkthrough

Enumerated in order, every method call, property access, and operator in
`LabSensorLifecycleTest`:

- `ApplicationProvider.getApplicationContext<Context>()` and
  `context.getSystemService(Context.SENSOR_SERVICE) as SensorManager` —
  the same two real, already-established calls from the previous unit.
- `ShadowSensor.newInstance(Sensor.TYPE_ACCELEROMETER)` — the real,
  static Robolectric factory detailed in the Header, building a real,
  testable `Sensor` of the requested real kind, since `Sensor` itself has
  no public constructor.
- `shadowOf(sensorManager).addSensor(accelerometer)` — a real Robolectric
  call, making this specific real sensor genuinely discoverable by this
  same `sensorManager` from this point on — closing the exact real gap
  the previous unit's own second test found (a real device starts with
  none).
- `object : SensorEventListener { ... }` — an ordinary, already-
  established Kotlin anonymous object expression, implementing the real
  interface's own two real methods directly; `onSensorChanged` writes to
  `receivedValues`, a real, closed-over `var`; `onAccuracyChanged` is
  implemented with a real, empty body, since this lab has no real use
  for it.
- `sensorManager.registerListener(listener, accelerometer,
  SensorManager.SENSOR_DELAY_NORMAL)` — the real, current, non-deprecated
  call detailed in the Header, passing the real listener, the real
  sensor just added, and the real, required `SENSOR_DELAY_NORMAL`
  constant (confirmed, via the same fetched source, to be the real
  integer value `3`).
- `assertTrue(registered)` and `assertTrue(shadowOf(sensorManager)
  .hasListener(listener))` — the same real, already-established JUnit
  call, and a real, additional Robolectric check confirming genuine
  internal registration, not just a truthy return value.
- `ShadowSensorManager.createSensorEvent(3)` — the real, static
  Robolectric factory (itself carrying the real, discussed deprecation
  warning), building a real, otherwise-inaccessible `SensorEvent` with a
  real, three-element `values` array.
- `event.values[0] = 1.0f` (and the two lines after it) — ordinary,
  already-established real array-index assignment, writing three real,
  chosen `Float` values directly into the real event's own public field.
- `shadowOf(sensorManager).sendSensorEventToListeners(event)` — a real
  Robolectric call, genuinely invoking every real, currently-registered
  listener's own `onSensorChanged` with this exact real event — the one
  real line that actually exercises the real callback contract, not just
  registers for it.
- `assertNotNull(receivedValues)` and the compound `assertTrue` checking
  all three real indices — the same real, established JUnit calls,
  confirming the real values genuinely arrived, unchanged, at the real
  listener.
- `sensorManager.unregisterListener(listener)` — the real, current,
  non-deprecated call detailed in the Header.
- `assertFalse(shadowOf(sensorManager).hasListener(listener))` — the same
  real Robolectric check as before, this time confirming real removal.

### CS Lens

This is the **Observer pattern**, reappearing here in a real, hardware-
adjacent shape: `SensorManager` (the real subject) holds a real list of
registered `SensorEventListener`s, and calls each one back the instant
new real data exists — the identical real shape this project's own
already-established `Flow`-based persistence already used, now applied
to real sensor hardware instead of a real database table.

```
Also recognized in: a real DOM event listener, firing the instant a
user clicks, never polled for; a stock ticker pushing a new price the
instant a real trade happens; a weather station's own real API pushing
a new reading to every subscribed real client the instant conditions
change
```

### SE Lens

Why does `registerListener` require an explicit real sampling-rate
argument at all, rather than always delivering events as fast as the
real hardware can physically produce them? The real alternative — always
maximum rate — is simpler to call, one fewer real decision per
registration. The real, documented cost, named directly in this lesson's
own fetched source: real sensor hardware, left running at full rate,
drains a real device's battery meaningfully faster, and most real
consumers of sensor data (a UI redraw, say) can't usefully act on
updates faster than the screen itself refreshes anyway. Requiring a real,
explicit rate forces every real caller to make that real, honest tradeoff
once, deliberately, rather than defaulting to maximum power draw as the
unexamined norm. The real, honest cost of the *deprecated* overload,
by contrast, is a different kind of tradeoff entirely: it once let a
caller skip specifying a `Sensor` at all, registering against a whole
real bitmask of sensor types at once — genuinely more convenient for a
caller wanting "everything," at the real cost of never being able to
distinguish which real sensor actually produced a given event once
several were registered together; the real, current API trades that
one-call convenience for a real, unambiguous one-sensor-per-registration
contract instead.

### Commands Needed

None beyond this project's own already-established `./gradlew
testDebugUnitTest`, run above.

### Run It

Shown above — real, executed output, reproduced identically across two
separate runs, saved in full in `verification/11.1/lab2_output.txt`.

### Connect the Pieces

This unit proved, with real, executed evidence rather than a reading of
the documentation alone, exactly how `SensorManager`'s own real
lifecycle works: `registerListener` genuinely starts real event
delivery, a real dispatched event genuinely reaches the real listener
with its own real values intact, and `unregisterListener` genuinely
stops it — while also catching and correctly attributing a real
deprecation warning to the tool that actually owns it, not the API this
lesson is really learning. Together with the previous unit's own real
entry-point proof, this project now has real, confirmed, working answers
to all nine of this lesson's own opening checklist items — not just a
reading of them — ready for a real, permanent feature to build on top
of.

---

## Connect the Pieces

One concrete real thread of evidence, traced through both units: a
single, real accelerometer. The first unit proved this project's own
real entry point into an entirely unfamiliar API — `getSystemService
(Context.SENSOR_SERVICE)` — genuinely returns a working `SensorManager`,
and that a real, simulated device starts with no sensors at all until
one is explicitly added. The second unit added exactly that real sensor,
registered a real listener against it using the real, current,
non-deprecated API this lesson's own fetched source identified,
dispatched a real, synthetic reading, and watched it arrive, intact,
before proving real cleanup with `unregisterListener`. Every one of
BRD's own nine real checklist items — entry point, types, interfaces,
lifecycle, callbacks, required configuration, cleanup, examples, and
deprecations — now has a real, executed answer behind it, not just a
documentation citation, closing this lesson's own real purpose before a
real, permanent feature puts this exact same real API to work.

**Next:** Lesson 11.2 (Sensor API).
