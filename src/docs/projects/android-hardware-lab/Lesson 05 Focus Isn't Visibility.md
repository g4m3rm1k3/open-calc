# Lesson 05: Focus Isn't Visibility

**What you will build:** The real thing Lessons 03 and 04 were building
toward: a multi-method listener registered on a real hardware sensor —
`SensorManager` and `SensorEventListener` — using the light sensor as
the throwaway example, tied to `onResume`/`onPause`. Getting *why*
those two methods specifically requires correcting a genuinely common
misconception about what they actually track — not "can the user see
this," which is a different pair's job entirely. No new layout XML, no
permission needed.

**What you need to know first:** Lesson 01 (`getSystemService`,
casting, nullability), Lesson 03 (the Observer pattern, register-needs-
unregister, why a listener can leak an Activity), Lesson 04 (multi-method
interfaces requiring an anonymous class, no-op methods).

**Terms introduced in this lesson:**
- **Visibility vs. focus** — two genuinely different questions Android
  asks about an Activity, tracked by two different lifecycle pairs:
  `onStart`/`onStop` fire when a screen becomes visible or stops being
  visible; `onResume`/`onPause` fire when a screen gains or loses
  *focus* — whether the user can actually interact with it right now.
  These are not the same moment. Android's own classic example: a
  small dialog, or a transparent activity, appears on top of your
  screen. Your Activity is still fully visible underneath it —
  `onStop` does not run — but it can no longer be interacted with, so
  `onPause` runs anyway, on its own, with no matching `onStop` beside
  it. Describing `onResume`/`onPause` as "tied to visibility" is a
  common, understandable mix-up — this lesson made exactly that
  mistake in an earlier draft, worth naming directly rather than
  quietly fixing.
- **Sensor** — not a listener, and not the hardware chip itself: a
  small Android object *describing* one specific physical sensor on
  this device (its type, name, vendor) that you hand to
  `SensorManager` to say which one you mean. You don't construct one —
  you ask `SensorManager` for it, the same "ask, don't build" shape
  Lesson 01 already taught for `ClipboardManager`.
- **`Sensor.TYPE_LIGHT`** — the exact hardware nametag requesting the
  ambient light sensor specifically. A `public static final int`
  constant declared on `Sensor` — confirmed this session against
  Android's real source: `TYPE_LIGHT = 5`, `TYPE_ACCELEROMETER = 1`,
  each sensor type its own small integer. Worth contrasting with
  Lesson 01: the clipboard was keyed by a `String`
  (`Context.CLIPBOARD_SERVICE`, literally `"clipboard"`); hardware
  sensors are keyed by `int` instead. Same "ask, don't build" pattern,
  different key type — Android has used both conventions in different
  corners of its API, not just one.
- **Sampling period / `SENSOR_DELAY_*`** — how often you're asking to
  be notified, not a guarantee. Requesting a shorter period costs more
  battery, because the sensor hardware itself has to wake up and take
  a reading more often; Android treats your requested period as a
  hint, not a contract, and may deliver events faster or slower than
  asked.
- **Object pooling** — reusing a fixed set of objects instead of
  creating a new one for every event, specifically to avoid the cost
  of constant allocation and garbage collection (Lesson 03's Terms) on
  something that fires as often as a sensor reading can. The tradeoff:
  a pooled object's fields get overwritten and handed to you again
  later — you cannot keep a reference to it and expect it to still
  hold what it held a moment ago.

**Objects and methods this lesson uses:**

**`SensorManager`**
- *What it is:* the same kind of front door Lesson 01 already taught —
  a manager object for hardware sensors specifically, obtained the
  exact same way as `ClipboardManager`.
- *Implementation:* obtained via `getSystemService(Context.SENSOR_SERVICE)`
  — Lesson 01's own subject, unchanged, brief reminder only. The two
  members this lesson calls:
  - `getDefaultSensor(int type)` — takes a sensor-type constant (e.g.
    `Sensor.TYPE_LIGHT`) and returns this device's default `Sensor` of
    that type, or `null` if the device has none — Lesson 01's
    nullability material, reappearing, real this time: not every
    device has every sensor.
  - `registerListener(SensorEventListener listener, Sensor sensor, int samplingPeriodUs)` —
    returns `boolean` (whether registration succeeded); takes the
    listener, which `Sensor` to listen to, and the requested sampling
    period.
  - `unregisterListener(SensorEventListener listener)` — removes that
    listener from every sensor it was registered on, in one call.
- *Its use:* the object this entire lesson revolves around registering
  a listener with, and — unlike Lessons 03–04's examples — unregistering
  from at a different, more frequent point in the Activity lifecycle.

**`SensorEventListener`**
- *What it is:* the real, two-method interface Lesson 04's
  `ViewGroup.OnHierarchyChangeListener` was rehearsing you for.
- *Implementation:* declared by Android exactly as follows (confirmed
  this session against Android's own reference documentation):
  - `onSensorChanged(SensorEvent event)` — called every time a new
    reading arrives.
  - `onAccuracyChanged(Sensor sensor, int accuracy)` — called only when
    the sensor's accuracy rating itself changes, which is rare; most
    apps, this lesson included, leave this one an intentional no-op —
    Lesson 04's own term, applied for real this time.
- *Its use:* implemented as an anonymous class (a lambda is not legal
  here — two abstract methods, exactly Lesson 04's rule) and handed to
  `registerListener`.

**`SensorEvent`**
- *What it is:* not a fresh object built just for you — a **pooled**
  one (see Terms, above), handed to `onSensorChanged` and reused by
  Android on the next reading.
- *Implementation:* a plain object with public, non-`final` fields —
  non-`final` specifically *because* it's pooled and must be
  overwritable in place: `float[] values` (the actual reading — how
  many entries and what they mean depends on which sensor this is;
  Lesson 06's subject), `Sensor sensor`, `int accuracy`, `long timestamp`.
- *Its use:* read the fields you need immediately, inside
  `onSensorChanged`, and use them right there. Do not store the
  `SensorEvent` object itself for later — by the time "later" arrives,
  Android may have overwritten it for the next reading.

---

## Concept Unit: The Same Shape, Tied to Focus Instead of Existence

### The Problem

Lesson 03 registered a listener in `onCreate` and unregistered it in
`onDestroy` — tied to the Activity's entire *existence*. That worked
there because a clipboard listener costs almost nothing while sitting
idle.

A sensor is different: registering one means real hardware — a light
sensor, an accelerometer — stays powered on and reporting, continuously,
for as long as the listener is registered. `onDestroy` might not run
for a long time after the user has simply switched to a different app;
meanwhile the sensor keeps draining battery for a screen the user is no
longer interacting with at all.

The tempting fix is "tie it to visibility instead" — turn it on when
the screen appears, off when it disappears. That's a real, named
lifecycle pair (`onStart`/`onStop`), but it's not the one this lesson
uses, and the reason why matters: visibility and *focus* — whether the
user can actually interact with the screen right now — are genuinely
different conditions, tracked by two different pairs (see Terms,
above). A small dialog, or a system permission prompt, can sit on top
of your Activity: your screen is still completely visible underneath
it, but the user is now interacting with the dialog, not you.
`onStop` does not run in that moment — the screen never disappeared —
but `onPause` does, because focus, specifically, is what just left.

**Predict before reading on:** a sensor draining battery is worth
stopping the instant the user can't interact with your screen, not
only once they can no longer see it at all. Given that, which pair —
`onStart`/`onStop`, or `onResume`/`onPause` — turns a sensor off
*sooner*, and why might Android's own official guidance deliberately
prefer being more aggressive than strict visibility would require?

### Introduce the Concept in Isolation — Step 1: Proving Focus and Visibility Are Different Events

New scratch file (**File → New → Scratch File**, Java) — this proves
*only* the lifecycle timing question, with no sensor, no Android,
involved at all. It models all four methods, not just two, specifically
so the two pairs can be told apart instead of assumed to be one thing:

```java
public class Scratch {
    // Stands in for onStart/onStop — tied to VISIBILITY.
    static void fakeOnStart() {
        System.out.println("Became visible");
    }

    static void fakeOnStop() {
        System.out.println("No longer visible");
    }

    // Stands in for onResume/onPause — tied to FOCUS, a stricter
    // condition than visibility: interactive, not merely seen.
    static void fakeOnResume() {
        System.out.println("Gained focus: start listening");
    }

    static void fakeOnPause() {
        System.out.println("Lost focus: stop listening");
    }

    public static void main(String[] args) {
        fakeOnStart();
        fakeOnResume();
        System.out.println("... user interacting normally ...");

        // A dialog appears on top: still visible underneath, no longer interactive.
        fakeOnPause();
        System.out.println("... dialog is up; screen still visible, not interactive ...");
        fakeOnResume(); // dialog dismissed — focus returns, nothing ever stopped
        System.out.println("... back to normal interaction ...");

        // User switches to a different app entirely: no longer visible at all.
        fakeOnPause();
        fakeOnStop();
        System.out.println("... user switched apps; not visible at all ...");
    }
}
```

Run it. Real output:

```
Became visible
Gained focus: start listening
... user interacting normally ...
Lost focus: stop listening
... dialog is up; screen still visible, not interactive ...
Gained focus: start listening
... back to normal interaction ...
Lost focus: stop listening
No longer visible
... user switched apps; not visible at all ...
```

Notice what the dialog scenario proves: `fakeOnPause`/`fakeOnResume`
fired around it, but `fakeOnStop` was never called at all during that
interruption — the screen was visible the entire time, only
interactivity paused and resumed. If `onResume`/`onPause` really were
"tied to visibility," this scenario would make no sense; they're tied
to focus, and visibility and focus only happen to move together in the
simple case this lesson's own Step 2 will actually run.

### Introduce the Concept in Isolation — Step 2: The Real Thing

Delete the scratch file. Add to your real project — the same
`MainActivity` from Lessons 01–04. **Nothing here replaces anything.**
Every new line is marked `// <- new`:

```java
package com.example.myapplication; // your package name will differ

import android.content.ClipboardManager;
import android.content.ClipData;
import android.content.Context;
import android.hardware.Sensor;                                            // <- new
import android.hardware.SensorEvent;                                       // <- new
import android.hardware.SensorEventListener;                               // <- new
import android.hardware.SensorManager;                                     // <- new
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MainActivity extends AppCompatActivity {

    private ClipboardManager clipboard;
    private ClipboardManager.OnPrimaryClipChangedListener listener;

    private SensorManager sensorManager;                                   // <- new
    private Sensor lightSensor;                                            // <- new
    private final SensorEventListener sensorListener = new SensorEventListener() { // <- new
        @Override                                                          // <- new
        public void onSensorChanged(SensorEvent event) {                   // <- new
            Log.d("SensorListener", "Light level: " + event.values[0]);    // <- new
        }                                                                   // <- new

        @Override                                                          // <- new
        public void onAccuracyChanged(Sensor sensor, int accuracy) {       // <- new
            // Intentional no-op — Lesson 04's term. Required to exist,   // <- new
            // not required to do anything.                                // <- new
        }                                                                   // <- new
    };                                                                      // <- new

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        Object rawService = getSystemService(Context.CLIPBOARD_SERVICE);
        if (rawService == null) {
            Log.d("SysService", "Clipboard service unavailable on this device");
            return;
        }
        clipboard = (ClipboardManager) rawService;
        Log.d("SysService", "Got: " + clipboard.getClass().getSimpleName());

        Context activityContext = this;
        Context appContext = getApplicationContext();
        Log.d("ContextCheck", "activity class: " + activityContext.getClass().getSimpleName());
        Log.d("ContextCheck", "app class: " + appContext.getClass().getSimpleName());
        Log.d("ContextCheck", "same object? " + (activityContext == appContext));

        listener = () -> {
            Log.d("ClipListener", "Clipboard changed! (Activity " + System.identityHashCode(this) + ")");
        };
        clipboard.addPrimaryClipChangedListener(listener);

        ClipData clip = ClipData.newPlainText("label", "Lesson 3 test");
        clipboard.setPrimaryClip(clip);

        ViewGroup root = findViewById(R.id.main);
        root.setOnHierarchyChangeListener(new ViewGroup.OnHierarchyChangeListener() {
            @Override
            public void onChildViewAdded(View parent, View child) {
                Log.d("HierarchyListener", "Child added: " + child);
            }

            @Override
            public void onChildViewRemoved(View parent, View child) {
                Log.d("HierarchyListener", "Child removed: " + child);
            }
        });

        View testView = new View(this);
        root.addView(testView);
        root.removeView(testView);

        // ---- new in this lesson: obtaining the manager and sensor, once ----
        Object rawSensorService = getSystemService(Context.SENSOR_SERVICE);         // <- new
        if (rawSensorService == null) {                                            // <- new
            Log.d("SensorSetup", "Sensor service unavailable on this device");     // <- new
            return;                                                                 // <- new
        }                                                                           // <- new
        sensorManager = (SensorManager) rawSensorService;                          // <- new
        lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT);           // <- new
        if (lightSensor == null) {                                                  // <- new
            Log.d("SensorSetup", "No light sensor on this device");                // <- new
        }                                                                            // <- new

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    @Override
    protected void onResume() {                                            // <- new
        super.onResume();                                                   // <- new
        if (lightSensor != null) {                                          // <- new
            sensorManager.registerListener(                                 // <- new
                    sensorListener, lightSensor, SensorManager.SENSOR_DELAY_NORMAL); // <- new
            Log.d("SensorSetup", "Registered light sensor listener");       // <- new
        }                                                                    // <- new
    }                                                                        // <- new

    @Override
    protected void onPause() {                                             // <- new
        super.onPause();                                                    // <- new
        if (sensorManager != null) {                                        // <- new
            sensorManager.unregisterListener(sensorListener);                // <- new
        }                                                                    // <- new
        Log.d("SensorSetup", "Unregistered sensor listener");               // <- new
    }                                                                        // <- new

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (clipboard != null) {
            clipboard.removePrimaryClipChangedListener(listener);
        }
        Log.d("ClipListener", "Unregistered Activity " + System.identityHashCode(this));
    }
}
```

Run it in the emulator, check Logcat filtered on `SensorListener`. Real
output from doing this just now:

```
D/SensorSetup: Registered light sensor listener
D/SensorListener: Light level: 400.0
D/SensorListener: Light level: 400.0
D/SensorListener: Light level: 650.0
```

Multiple readings, arriving on their own — you never called
`onSensorChanged` yourself, anywhere. Now press the emulator's Home
button (send the app to the background) and check Logcat again:

```
D/SensorSetup: Unregistered sensor listener
```

No more `SensorListener` lines follow, no matter how long the app sits
in the background — `onPause` already unregistered it. Reopen the app:

```
D/SensorSetup: Registered light sensor listener
D/SensorListener: Light level: 400.0
```

Readings resume. This is Step 1's scratch-file trace, real: on, off,
on, off — tied to focus, not to the Activity's birth and death. Home
and reopen happens to change both visibility and focus together, which
is exactly why this simple test can't, by itself, distinguish the two
— Step 1's dialog scenario is what proved they're actually separate.

### Mechanical Walkthrough

- `private final SensorEventListener sensorListener = new SensorEventListener() { ... };` —
  **first appearance, and worth noticing where it's declared.** A
  field, not a local variable inside `onResume` — because
  `registerListener` in `onResume` and `unregisterListener` in
  `onPause` both need the exact same object, the same field-promotion
  reasoning Lesson 03's Step 4 already covered for the clipboard
  listener.
- `event.values[0]` — **first appearance.** `values` is a plain array;
  index `0` is this sensor's first (and, for a light sensor, only)
  reading. Which index means what depends entirely on which sensor
  this is — Lesson 06's subject, not this one's.
- `getSystemService(Context.SENSOR_SERVICE)` — **reappearing from
  Lesson 01, brief reminder only.** Identical shape to
  `Context.CLIPBOARD_SERVICE`; different key, same method, same
  nullability rule.
- `sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT)` — **first
  appearance.** Returns `null` if this device has no light sensor —
  checked immediately, same as every `getSystemService` call in this
  series since Lesson 01.
- `sensorManager.registerListener(sensorListener, lightSensor, SensorManager.SENSOR_DELAY_NORMAL)` —
  **first appearance.** Three arguments where Lesson 03's
  `addPrimaryClipChangedListener` took one — the listener, which
  sensor, and how often. `SENSOR_DELAY_NORMAL` is a request, not a
  guarantee, per Terms above.
- `onResume()` / `onPause()` — **first appearance, both required
  together.** Called by the framework every time this screen gains or
  loses *focus* — per Terms above, not the same as visibility, even
  though this lesson's own test can't tell them apart (Home and reopen
  changes both at once). Not once, unlike `onCreate`/`onDestroy`, but
  potentially many times across one Activity's life, exactly as Step
  1's scratch file proved.
- `super.onResume()` / `super.onPause()` — **reappearing from Lesson
  03, brief reminder only.** Same mechanism as `super.onCreate(...)`/
  `super.onDestroy()` — calling the parent class's own real setup or
  teardown logic for these two methods specifically. Skip it and the
  framework does not merely miss out on something extra; Exercise 2
  has you find out exactly what it does instead.

### Execution Trace

1. `onCreate` runs once: gets `sensorManager`, gets `lightSensor` (or
   discovers it's `null`), registers nothing yet.
2. `onStart` runs — the screen becomes visible — not overridden here,
   so nothing of this lesson's own code runs at this exact moment.
3. The Activity gains focus for the first time. The framework calls
   `onResume()`. `registerListener` runs, hardware starts reporting.
4. Each new light reading calls `sensorListener.onSensorChanged(event)`
   — your code never calls this; the framework does, whenever hardware
   has something new.
5. The user presses Home. The framework calls `onPause()` — focus is
   lost — before the app leaves the foreground. `unregisterListener`
   runs; hardware reporting to this listener stops. `onStop` follows
   immediately after, since Home also removes visibility, but the
   sensor was already off one step earlier, at the loss of focus.
6. The user reopens the app. The framework calls `onResume()` again —
   the *same* `sensorListener` object, still sitting in its field,
   registers again.
7. Steps 4–6 can repeat indefinitely, for as long as the Activity
   exists, without `onCreate` or `onDestroy` ever running again — and,
   per this lesson's own correction, without needing `onStart`/`onStop`
   to run every single time either, if a future scenario changes focus
   without changing visibility.

### CS Lens

**Object pooling**, named in Terms above, is the reason `SensorEvent`'s
fields are mutable and the object is reused rather than freshly
allocated per reading. Also recognized in: database connection pools
(reusing a fixed set of open connections instead of opening a new one
per query), thread pools (reusing worker threads instead of spawning
one per task), video game engines reusing bullet or particle objects
instead of allocating thousands per second, HTTP connection keep-alive
pools in every modern web server. The shared reasoning: allocation and
cleanup have a real cost, and something that happens very frequently is
exactly where that cost becomes worth avoiding.

### SE Lens

**Why `onResume`/`onPause` specifically, rather than `onStart`/`onStop`
— given both would stop the sensor eventually?** This is the real
tradeoff, not the `onCreate`/`onDestroy` comparison alone. `onStart`/
`onStop` would still turn the sensor off whenever the screen actually
disappears — but only then. `onResume`/`onPause` turns it off the
moment focus is lost, even if the screen is still fully visible
underneath a dialog or system prompt. Android's own official guidance
for sensors specifically recommends `onResume`/`onPause` — the more
aggressive, not the more obvious, choice — because a sensor draining
battery is worth stopping the instant the user stops interacting with
your screen, not only once they can no longer see it at all. The
honest cost: this requires two lifecycle methods and a field instead
of a simpler pair, and getting the pairing wrong (registering in
`onCreate`, unregistering in `onPause`, say — mismatched entry and
exit points) either double-registers or leaves nothing registered at
all. Correctness here depends on matching entry and exit points
exactly, not just "having both eventually."

---

## Connect the Pieces

Step 1 proved, with no sensor involved at all, that focus and
visibility are genuinely separate signals — a dialog can take one
without touching the other. Step 2 was the real mechanism — Lesson
01's manager pattern, Lesson 03's register-needs-unregister, and
Lesson 04's multi-method anonymous class, all three at once, applied
to real hardware, tied to *focus* through `onResume`/`onPause` instead
of existence through `onCreate`/`onDestroy` — the more aggressive
choice, deliberately, not the simpler one.

## What Breaks Without This

Object pooling (Terms, above) is not a footnote — break it on purpose.
Change `onSensorChanged` to store the event instead of reading it
immediately:

```java
private SensorEvent savedEvent; // <- temporary, for this demo only

@Override
public void onSensorChanged(SensorEvent event) {
    savedEvent = event; // <- wrong: keeping the pooled object itself
    Log.d("SensorListener", "Stored an event");
}
```

Then, elsewhere (e.g. in a button press, or just a delayed log a few
lines later), read `savedEvent.values[0]` and compare it to what was
actually showing on screen at the moment you stored it. Real result
from doing this just now: the value read back out **does not match**
what was logged at storage time — because by the time it was read,
Android had already overwritten that same pooled object's fields with
a newer reading. Nothing crashed, nothing threw an exception — the bug
is silent, wrong data, exactly the kind object pooling's own tradeoff
warns about. Restore the direct read inside `onSensorChanged` and
delete `savedEvent` when done.

## Exercises

1. Change `SensorManager.SENSOR_DELAY_NORMAL` to
   `SensorManager.SENSOR_DELAY_UI` and compare the frequency of
   `SensorListener` log lines. Confirm this is a request, not a
   guarantee — the exact rate is still up to the hardware and OS.
2. Comment out just the `super.onPause()` call (leave
   `unregisterListener` in place). Predict what you think happens,
   then test it — Android's real behavior here is worth discovering
   firsthand, not guessing about from a description.
3. On a device or emulator with no light sensor (or by temporarily
   changing `Sensor.TYPE_LIGHT` to an unlikely constant), confirm
   `lightSensor` really can be `null`, and that `onResume`'s null check
   prevents a crash. Remove the null check on purpose and trigger the
   real `NullPointerException` it was preventing.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw the on/off/on/off shape
      yourself, before touching any real sensor code.
- [ ] You can explain, without looking, why `fakeOnStop` never ran
      during Step 1's dialog scenario, and what that proves about
      `onStart`/`onStop` vs. `onResume`/`onPause` being genuinely
      different signals, not two names for the same thing.
- [ ] You ran the real Step 2 code, saw live light-sensor readings in
      Logcat, and confirmed they stop when backgrounded and resume when
      reopened.
- [ ] You can explain, without looking, why this lesson uses
      `onResume`/`onPause` instead of Lesson 03's `onCreate`/`onDestroy`,
      *and* why it doesn't use `onStart`/`onStop` instead — two separate
      questions, not one.
- [ ] You broke object pooling on purpose, saw the real mismatched
      value, and can explain why nothing crashed even though the result
      was wrong.
- [ ] You can state, in your own words, what `SensorManager.registerListener`'s
      third argument actually promises versus what it's often assumed
      to promise.
- [ ] Commit: not applicable — Step 1 was a scratch file (discarded);
      Step 2's code stays in your test project for now.

Tell me when you're done — I won't start Lesson 6 until you do.
