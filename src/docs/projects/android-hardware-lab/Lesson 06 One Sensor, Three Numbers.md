# Lesson 06: One Sensor, Three Numbers

**What you will build:** the accelerometer added to the same
`MainActivity`, registered with the *exact* `onResume`/`onPause`
pattern Lesson 05 built for the light sensor — reused, not
re-explained. The transferable problem: Lesson 05's light sensor put
exactly one meaningful number in `event.values[0]`. Not every sensor
does that. The accelerometer hands back three numbers in one event,
and nothing about the array itself says what each position means —
you have to already know the contract. This lesson also asks a second
question Lesson 05 never needed to: once you have three separate
numbers, how do you get *one* number back out of them — "how hard was
this phone just shaken," not "what were x, y, and z, separately"?

**What you need to know first:** Lesson 05 in full — `SensorManager`,
`getDefaultSensor`, `registerListener`/`unregisterListener` paired
with `onResume`/`onPause`, `SensorEventListener`'s two methods, object
pooling. Ordinary Java arrays and `Math.sqrt`.

**Terms introduced in this lesson:**
- **Axis** — one of the three independent directions (x, y, z) a
  motion sensor reports separately. Android fixes what "positive"
  means for each axis relative to the device's own screen, the same
  way a graph fixes which way is up — without that fixed convention,
  a positive number would be meaningless on its own.
- **Vector magnitude (Euclidean norm)** — a single number describing
  the overall size of a multi-part quantity, computed as the square
  root of the sum of each part squared. For three numbers x, y, z,
  that's `sqrt(x² + y² + z²)` — the 3D version of the same Pythagorean
  theorem used for 2D distance.
- **Raw vs. derived sensor reading** — a raw reading is exactly what
  the hardware measured, with nothing subtracted or combined. A
  derived reading is computed from one or more raw readings after the
  fact. The accelerometer's `values[]` are raw; magnitude, below, is
  derived from them.

**Objects and methods this lesson uses:**
- **`Math.sqrt(double)`**
  - *What it is:* the standard-library square root function.
  - *Implementation:* a `static` method on `java.lang.Math`, taking
    and returning `double`. Not Android-specific — ordinary Java, part
    of the platform since its first release.
  - *Its use:* the last step of computing vector magnitude, below.

---

## Concept Unit: A Sensor That Reports More Than One Number, Reduced to One

### The Problem

Lesson 05 read `event.values[0]` and that was the whole story — light
level, one number, done. The accelerometer's `onSensorChanged` hands
you the *same shape* of event, a `SensorEvent` with a `values` array —
but this time `values[0]`, `values[1]`, and `values[2]` are all
meaningful, and each means something different. Nothing in the array
itself — no labels, no names — tells you which is which; only Android's
own documented contract for `TYPE_ACCELEROMETER` does. And once you
have those three separate numbers, a second, genuinely different
problem shows up: three numbers are hard to reason about *together*.
If the real question is "did something just shake this phone hard,"
you don't want to compare three numbers against three thresholds — you
want one number that captures "how hard, overall."

### Introduce the Concept in Isolation — Step 1: Position Has Meaning Only Because Something Says So

Open a Kotlin/Java scratch file (same tool Lesson 01's Step 1 and 2
used — no Android project, no emulator). Type this exactly:

```java
float[] fakeReading = {2.0f, -1.0f, 9.5f};

// Nothing about this array says what index 0 means. This comment does:
// index 0 = "how hard was it pushed sideways"
// index 1 = "how hard was it pushed forward/back"
// index 2 = "how hard was it pushed up/down"

System.out.println("Sideways: " + fakeReading[0]);
System.out.println("Forward/back: " + fakeReading[1]);
System.out.println("Up/down: " + fakeReading[2]);
```

Run it. Expected output — plain array indexing, nothing Android about
it yet:

```
Sideways: 2.0
Forward/back: -1.0
Up/down: 9.5
```

This proves the actual point by *removing* everything that would let
you cheat: there's no `Sensor` object here, no Android import, nothing
callable that could tell you what `fakeReading[0]` means. The meaning
comes entirely from the comment — i.e., from documentation, sitting
outside the code, that you have to already know. That's exactly the
situation the real `Sensor.TYPE_ACCELEROMETER` puts you in: the array
has three floats; knowing they're x, y, z, in that order, in m/s²,
comes only from Android's own published contract for that sensor
type, not from anything the compiler or the array itself enforces.

**Discard this scratch file** — it never becomes part of the project.

### Introduce the Concept in Isolation — Step 2: Combining Three Numbers Into One, With No Sensor Involved

New scratch file, still no Android:

```java
double x = 3.0, y = 4.0, z = 0.0;
double magnitude = Math.sqrt(x*x + y*y + z*z);
System.out.println("Magnitude: " + magnitude);
```

Run it. Expected output:

```
Magnitude: 5.0
```

3-4-5 on purpose — the same right-triangle relationship you may
already know in 2D (`sqrt(3² + 4²) = 5`), extended to three numbers
instead of two. This is called the **vector magnitude**, per Terms
above, and it's doing real work here: three independent numbers (3,
4, 0) collapse into one (5) that answers a different question than
any of the three alone did — not "what was the sideways push,"
specifically, but "how big was the push, total, in any direction."

**Discard this scratch file too.**

### Introduce the Concept in Isolation — Step 3: The Real Thing

**Reference Source:** no reference counterpart — `TYPE_ACCELEROMETER`'s
axis meanings and the "includes gravity" behavior below are Android
platform facts (confirmed against Android's own sensor documentation
this session), not ported from any other file in this project.

**Files affected:** `MainActivity.java` only — same file every lesson
in this series has built on.

**Change type:** add, alongside Lesson 05's light-sensor code, not
replacing it.

**Location:** a new field next to `lightSensor`; new lines inside the
existing `onCreate`, `onResume`, and `onPause` — placed directly beside
Lesson 05's own light-sensor lines in each of those three methods, not
in a new method.

**Dependencies:** none beyond what Lesson 05 already added.

Add a second field next to `lightSensor`, and a second branch inside
the sensor-setup block already sitting in `onCreate`:

```java
private Sensor accelerometer;                                          // <- new
```

```java
lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT);
if (lightSensor == null) {
    Log.d("SensorSetup", "No light sensor on this device");
}
accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER); // <- new
if (accelerometer == null) {                                              // <- new
    Log.d("SensorSetup", "No accelerometer on this device");              // <- new
}                                                                          // <- new
```

`sensorListener` needs to tell the two sensors apart now — one
listener, registered for two different sensors, has to branch on
which one just fired:

```java
private final SensorEventListener sensorListener = new SensorEventListener() {
    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_LIGHT) {
            Log.d("SensorListener", "Light level: " + event.values[0]);
        } else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) { // <- new
            float x = event.values[0];                                    // <- new
            float y = event.values[1];                                    // <- new
            float z = event.values[2];                                    // <- new
            double magnitude = Math.sqrt(x*x + y*y + z*z);                 // <- new
            Log.d("SensorListener", "Accel x=" + x + " y=" + y + " z=" + z // <- new
                    + " magnitude=" + magnitude);                          // <- new
        }                                                                  // <- new
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Intentional no-op — Lesson 04's term.
    }
};
```

And register/unregister it for the second sensor too — the *exact*
same two methods Lesson 05 already called, called a second time:

```java
@Override
protected void onResume() {
    super.onResume();
    if (lightSensor != null) {
        sensorManager.registerListener(
                sensorListener, lightSensor, SensorManager.SENSOR_DELAY_NORMAL);
        Log.d("SensorSetup", "Registered light sensor listener");
    }
    if (accelerometer != null) {                                          // <- new
        sensorManager.registerListener(                                   // <- new
                sensorListener, accelerometer, SensorManager.SENSOR_DELAY_NORMAL); // <- new
        Log.d("SensorSetup", "Registered accelerometer listener");        // <- new
    }                                                                      // <- new
}

@Override
protected void onPause() {
    super.onPause();
    if (sensorManager != null) {
        sensorManager.unregisterListener(sensorListener);
    }
    Log.d("SensorSetup", "Unregistered sensor listener");
}
```

Note what `onPause` did *not* need: any change at all.
`unregisterListener(sensorListener)` with no second argument
unregisters that listener from *every* sensor it's currently
registered for, light and accelerometer both, in one call — Lesson
05's own teardown line already covers a listener registered for two
sensors, not just one, with nothing added.

### Mechanical Walkthrough

Enumerating every new element in Step 3, in order:

- `private Sensor accelerometer;` — **first appearance, same shape as
  `lightSensor` immediately above it.** A field, for the same
  field-promotion reason as `sensorManager`/`lightSensor` — needed in
  both `onResume` and `onPause`, so a local variable inside either one
  alone wouldn't reach the other.
- `sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)` —
  **reappearing pattern, new constant.** Identical call shape to
  Lesson 05's `getDefaultSensor(Sensor.TYPE_LIGHT)` — same null-if-
  absent rule, same immediate check.
- `event.sensor` — **first appearance.** Every `SensorEvent` carries a
  reference back to the exact `Sensor` that produced it. Needed now,
  for the first time, because one listener is registered for two
  sensors and `onSensorChanged` has no other way to know which one
  just fired.
- `event.sensor.getType()` — **first appearance.** Returns the same
  kind of `int` constant (`Sensor.TYPE_LIGHT`, `Sensor.TYPE_ACCELEROMETER`)
  used to request the sensor in the first place — comparing it with
  `==` is comparing two `int`s, ordinary Java, nothing new about the
  operator itself.
- `event.values[0]`, `[1]`, `[2]` — **first appearance of indices 1
  and 2.** Same array Lesson 05 read index 0 from; this sensor simply
  populates all three, per Step 1's isolated proof that the array
  itself carries no labels — only `TYPE_ACCELEROMETER`'s documented
  contract says index 0 is x, 1 is y, 2 is z, each in m/s².
- `float x = event.values[0];` (and `y`, `z`) — **first appearance of
  naming array reads into local variables before using them.** Not
  required by the compiler — `event.values[0]` could be used inline,
  the way Lesson 05 used `event.values[0]` directly inside its own
  `Log.d` call. Named here on purpose: three unnamed array reads
  inline in one line is exactly the kind of code the debugger's
  Variables panel shows you nothing useful about; three named locals
  show up as `x`, `y`, `z`, individually, mid-execution.
- `x*x + y*y + z*z` — **first appearance.** Ordinary Java arithmetic;
  `*` here means multiplication (squaring), not any Java-specific
  operator behavior worth a separate note.
- `Math.sqrt(...)` — **first appearance**, full treatment per Objects
  and methods above.
- `double magnitude = ...` — **first appearance of `double` in this
  series.** `Math.sqrt` returns `double`, not `float` — Java does not
  silently widen `float` arithmetic results into `double` on its own
  in a way that would make this optional; the return type is simply
  `double`, always, regardless of the input types.
- `else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER)` —
  **reappearing construct (`if`/`else if`), already established.** No
  new treatment owed to the branching itself, only to the condition's
  own contents, covered above.

### Execution Trace

**A note on the values below, honestly:** this session has no real
device or emulator to run against, so these are worked-out predicted
values, not a captured Logcat paste — everywhere else in this series,
that line was real output. Run Step 3 yourself and check these
predictions against the real numbers; if they disagree, the real
device is right and this file should be corrected to match it.

1. Phone lying flat on a table, screen up, completely still. Predict:
   `x ≈ 0.0`, `y ≈ 0.0`, `z ≈ 9.8` — per Android's own accelerometer
   contract, a stationary reading isn't zero on every axis; it reads
   Earth's gravity, about 9.8 m/s², on whichever axis currently points
   straight up. Predicted magnitude: `sqrt(0² + 0² + 9.8²) ≈ 9.8`.
2. Pick the phone up and hold it upright, screen facing you, still not
   moving. Gravity now pulls along a different axis relative to the
   device — predict `y` (or `x`, depending on the exact tilt) becomes
   the one near 9.8 instead of `z`, while the magnitude itself stays
   close to 9.8 either way — you changed *which* axis reads gravity,
   not how much gravity there is.
3. Shake the phone. Predict all three of `x`, `y`, `z` swing rapidly
   through a wide range of positive and negative values, and magnitude
   spikes well above 9.8 — the accelerometer is now reporting your own
   applied force *added to* gravity's constant contribution, not
   replacing it.
4. Log lines stop the instant the app loses focus (Home button, or a
   dialog appearing) and resume the instant it regains it — Lesson
   05's `onResume`/`onPause` pairing, unchanged, already covers both
   sensors from one registration/unregistration pair each.

### CS Lens

**Vector magnitude**, named in Terms above, is the 3D generalization
of the Pythagorean theorem — the straight-line distance formula
between two points is exactly this same `sqrt(sum of squares)` shape,
just with differences instead of raw values. Also recognized in:
GPS/mapping distance calculations, physics engines computing speed
from separate x/y/z velocity components, computer graphics normalizing
a direction vector to length 1, machine learning's L2 norm measuring
how "large" a vector of numbers is overall. The shared reasoning:
whenever a quantity is naturally described by several independent
numbers at once, and a single "how big, overall" answer is needed,
this is the standard way to get one.

### SE Lens

**Why does Android hand you raw x/y/z instead of something like
`getShakeIntensity()`?** The real tradeoff: a single combined method
would be more convenient for this one use case, but would have to
guess, on Android's behalf, what "intensity" means for every possible
app — shake detection, tilt-based steering, step counting, and
screen-rotation all want *different* derived values from the same raw
three numbers, and baking one interpretation into the platform would
make every other use case work around it instead. Android's actual
choice — raw values, contract documented, math left to you — costs
exactly what Step 1 and Step 2 demonstrated: you have to already know
what each index means, and you have to compute your own derived value
if you want one. The `TYPE_LINEAR_ACCELERATION` sensor exists as a
middle ground worth knowing about, not used in this lesson: it reports
the same three-number shape but with gravity's contribution already
subtracted out, for the specific case where "acceleration from just
you moving it" is what's actually wanted instead of the raw reading.

---

## Connect the Pieces

One listener, registered for two sensors, tells them apart with
`event.sensor.getType()` — new this lesson — then, for the
accelerometer only, reads three raw numbers whose meaning comes
entirely from Android's documented contract, not from the array
itself (Step 1), and reduces them to one number describing overall
force (Step 2), using nothing beyond ordinary arithmetic and
`Math.sqrt`. Lesson 05's registration/lifecycle machinery — manager
pattern from Lesson 01, listener pattern from Lesson 03,
`onResume`/`onPause` pairing from Lesson 05 itself — needed no changes
at all to cover a second sensor.

## What Breaks Without This

The single most common wrong assumption about this sensor: that a
still, flat phone reads `(0, 0, 0)`. Prove it wrong on purpose. Change
the log line to flag "movement" using that assumption:

```java
boolean movingWrong = (x != 0f || y != 0f || z != 0f); // <- wrong assumption
Log.d("SensorListener", "Moving? " + movingWrong);
```

Run it with the phone completely still on a table. Predicted result:
`Moving? true` — constantly, even though nothing is moving — because
gravity alone already makes every stationary reading nonzero on some
axis. Nothing crashes; the bug is a wrong mental model producing
confidently wrong output, exactly the "silent, wrong data" shape
Lesson 05's object-pooling break also produced. A real "is it moving"
check has to compare against magnitude ≈ 9.8 (still) rather than
against zero. Remove `movingWrong` when done; it isn't part of the
project going forward.

## Exercises

1. Change the magnitude log line to also log `magnitude - 9.8`
   (roughly: force beyond gravity alone). Predict what this reads near
   zero while the phone sits still, and confirm it on a real device.
2. Using `event.sensor.getType()`, add a third branch for
   `Sensor.TYPE_LIGHT` explicitly instead of relying on the existing
   `if` and its `else if` — functionally identical, but confirm for
   yourself that `getType()` genuinely distinguishes the two events
   arriving through the same listener, rather than assuming it.
3. Look up `Sensor.TYPE_LINEAR_ACCELERATION` (SE Lens, above) and
   register a *third* sensor for it, alongside the other two, logging
   its own x/y/z. With the phone lying still, compare its reading to
   the raw accelerometer's — confirm for yourself that this one really
   does read close to `(0, 0, 0)` at rest, unlike `TYPE_ACCELEROMETER`.

## Definition of Done

- [ ] You ran Step 1 and Step 2's scratch files yourself and saw the
      real output, before touching the real project.
- [ ] You ran the real Step 3 code on a device or emulator, and
      recorded the *actual* x/y/z/magnitude values for a still, flat
      phone — replacing this file's predicted values with real ones.
- [ ] You can explain, without looking, why a stationary phone does
      not read `(0, 0, 0)`, and what number it reads close to instead.
- [ ] You can explain what `event.sensor.getType()` is for, and why
      this lesson needed it for the first time despite Lesson 05
      never needing it.
- [ ] You broke the "still means zero" assumption on purpose, saw the
      real (predicted, then confirmed) wrong output, and restored the
      correct check.
- [ ] You can state, in your own words, what a vector magnitude is
      and name at least one place besides this lesson where the same
      idea shows up.
- [ ] Commit: the accelerometer addition to `MainActivity.java`.
