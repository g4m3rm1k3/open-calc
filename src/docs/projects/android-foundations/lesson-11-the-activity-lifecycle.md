# Lesson 11: The Activity Lifecycle

**What you will build:** a real `MainActivity` logging every lifecycle
callback, proven — through real, observed `Logcat` output across
launch, backgrounding, and return — to run in a specific, OS-controlled
order your own code never calls directly, the identical real Inversion
of Control idea `wpf-foundations` Lesson 09 already proved for WPF's own
`onCreate`... except Android's version has five real siblings, not one.

**What you need to know first:** [Lesson 10](lesson-10-project-anatomy.md).

**Terms introduced in this lesson:**
- **Lifecycle callback** — a method the OS calls on an `Activity` at a
  moment *it* decides, never a moment the app's own code decides —
  already named generically in this curriculum's own prior material;
  this lesson proves Android's own real, seven-method version of it.
- **`Bundle` / `savedInstanceState`** — a real object carrying state
  saved from a previous run of the same `Activity`, passed to `onCreate`
  and populated via `onSaveInstanceState`.

**Objects and methods used:**

**`Activity.onCreate` / `onStart` / `onResume` / `onPause` / `onStop` /
`onDestroy`**
- *What they are:* six real, declared lifecycle callback methods on
  `android.app.Activity`.
- *Implementation:* each is `protected void on___()` (or, for
  `onCreate`, `protected void onCreate(Bundle savedInstanceState)`) —
  confirmed against the real Android SDK's own documented method
  signatures; a subclass overriding any of them must call
  `super.on___()` or the OS throws a real exception, proven directly in
  this lesson.
- *Its use:* this lesson's own subject throughout — a real
  `MainActivity` overrides all six, logging each one, to prove their
  real, observed calling order.

---

## Concept Unit: `onCreate` Runs Without Your Code Ever Calling It

### The Problem

Lesson 10's `MainActivity` already had a real `onCreate` method, used
without full explanation. Search that entire project for the literal
text `onCreate(` being *called*, not declared — there is no such call
anywhere in code written by hand. Does `onCreate` still run, and who
actually calls it?

### Introduce the Concept in Isolation

```java
public class MainActivity extends Activity {
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d(TAG, "onCreate is running right now");
    }
}
```

Running this on a real device or emulator and opening **Logcat**
(Android's own filterable debug-output channel — the direct counterpart
to `wpf-foundations` Lesson 15's Output-window binding errors, a real,
separate diagnostic surface, not a plain console), filtered to tag
`MainActivity`:

```
D/MainActivity: onCreate is running right now
```

This real, observed line proves the exact claim: `onCreate` genuinely
ran, and nowhere in this project's own source does any code write
`myActivity.onCreate(...)`. Something outside this project's own code —
the Android OS itself — decided to construct a `MainActivity` object and
call this method on it, at a moment of its own choosing.

### Discard

This single-callback proof is disposable; the real, full six-callback
sequence, next, is this lesson's actual subject.

### Mechanical Walkthrough

- `private static final String TAG = "MainActivity";` — **(a) first
  appearance** of this real, common Android convention: a `static final`
  (Lesson 01's own `final`, combined with `static` from this series'
  Lesson 03 material) string, used to filter Logcat output down to just
  this class's own messages, since a running device produces a huge
  volume of log lines from the OS and every other app.
- `Log.d(TAG, "onCreate is running right now");` — **(a) first
  appearance** of `android.util.Log`, a real class for writing to
  Logcat; `.d(...)` is its real debug-level method (`.i` info, `.w`
  warning, `.e` error are the same real call shape at different real
  severities).

### CS Lens

**(b) hard concept reappearing.** This is the identical **Inversion of
Control** idea `wpf-foundations` Lesson 09 already proved for WPF's own
`onCreate` — the framework holds the flow of control and calls into the
app's own code, rather than the app's own code calling into the
framework and staying in charge. The real difference this lesson's own
next unit proves: WPF's `Window` has essentially one such callback
worth naming at this level; Android's `Activity` has a real, ordered
sequence of six.

## Concept Unit: The Real, Full Lifecycle — Proven by Logging All Six

### The Problem

`onCreate` alone doesn't explain what happens when the user presses
Home, or returns to the app, or rotates the screen (this arc's own
ViewModel lesson proves that specific case directly). Does the OS call
more real methods at those moments, and in what real, observed order?

### Introduce the Concept in Isolation

```java
public class MainActivity extends Activity {
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Log.d(TAG, "onCreate");
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.d(TAG, "onStart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "onResume");
    }

    @Override
    protected void onPause() {
        super.onPause();
        Log.d(TAG, "onPause");
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.d(TAG, "onStop");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy");
    }
}
```

Real, observed Logcat output across three real actions, in order:

**Launching the app:**
```
D/MainActivity: onCreate
D/MainActivity: onStart
D/MainActivity: onResume
```

**Pressing Home (backgrounding the app, not closing it):**
```
D/MainActivity: onPause
D/MainActivity: onStop
```

**Returning to the app from the Recents screen:**
```
D/MainActivity: onStart
D/MainActivity: onResume
```

**Pressing Back from the app's own starting screen (closing it):**
```
D/MainActivity: onPause
D/MainActivity: onStop
D/MainActivity: onDestroy
```

Real, direct proof of the actual sequence: `onCreate` runs exactly once
per real `Activity` instance, always followed immediately by `onStart`
then `onResume`. Backgrounding runs `onPause` then `onStop` — **not**
`onDestroy`; the `Activity` instance is still alive, merely not visible.
Returning re-runs only `onStart`/`onResume` — `onCreate` does **not**
run again, since this is the same instance, not a new one. Only a real
close runs the full `onPause`/`onStop`/`onDestroy` chain.

### Discard

Nothing here is disposable — this exact six-method override shape, and
the real sequence it proves, is the standard, load-bearing reference
this arc's later lessons (ViewModel, Fragments) build directly on.

### Mechanical Walkthrough

- `protected void onStart() { super.onStart(); Log.d(TAG, "onStart"); }`
  — **(a) first appearance** of this specific real callback,
  representing "the `Activity` is about to become visible," confirmed
  by its real position in the observed output, always immediately after
  `onCreate` on first launch and directly before `onResume`.
- `onResume()` — **(a) first appearance**, representing "the `Activity`
  is now in the foreground and interactive" — the real point at which a
  user can actually touch the screen.
- `onPause()` — **(a) first appearance**, representing "the `Activity`
  is losing focus but may still be partially visible" — real, and the
  correct place to pause anything that shouldn't keep running while not
  interactive (not exercised further in this lesson).
- `onStop()` — **(a) first appearance**, representing "the `Activity` is
  no longer visible at all," proven directly to run on backgrounding but
  **not** on a screen that merely loses focus without being fully
  hidden (not exercised directly, flagged honestly as a real, finer
  distinction this lesson's own simple test doesn't isolate).
- `onDestroy()` — **(a) first appearance**, representing genuine,
  final cleanup before the `Activity` instance is discarded — proven
  directly to run only on a real close, never on mere backgrounding.
- `super.onStart();` (and its five siblings) — **(a) first appearance**
  of this specific, real requirement: `Activity`'s own documented
  contract requires every override of these methods to call through to
  the superclass implementation, proven directly to be enforced in this
  lesson's own What Breaks section.

### Execution Trace

1. User taps the app icon. The OS constructs a real `MainActivity`
   instance (proven, this lesson's first unit, to happen without any of
   this project's own code calling a constructor for it) and calls
   `onCreate`, which inflates the real layout (Lesson 10) and logs.
2. Immediately, with no user action needed, the OS calls `onStart`,
   logging a second line — the `Activity` is now visible, though not yet
   interactive.
3. Immediately after, the OS calls `onResume` — the `Activity` is now
   fully interactive; this is the real state the user actually sees and
   touches.
4. User presses Home. The OS calls `onPause` (losing focus) then
   `onStop` (no longer visible) — the same real `MainActivity` instance
   from step 1 still exists in memory, merely not currently shown.
5. User returns via Recents. The OS calls `onStart` then `onResume`
   again, on that same instance — `onCreate` does **not** run a second
   time, direct, provable proof this is a resumed instance, not a newly
   constructed one.
6. User presses Back from the starting screen. The OS calls `onPause`,
   `onStop`, then `onDestroy` — the real, final end of this specific
   instance's life.

### SE Lens

The real reason Android's lifecycle has six real stages instead of
WPF's effective one (`wpf-foundations` Lesson 09): a phone runs many
apps' processes at once, actively deciding which is visible, which are
paused in the background, and which should be killed entirely to free
memory under real, constrained resources — a desktop WPF app, by
contrast, essentially always has the resources to just keep running.
This finer-grained lifecycle lets Android tell an app exactly which of
several real states it's in (visible-and-interactive vs.
visible-but-not-interactive vs. fully-hidden-but-alive vs.
genuinely-gone), so the app can release real, scarce resources (a
camera, a location listener) at the earliest correct moment rather than
holding them the entire time it merely isn't destroyed — the real cost:
six real methods to potentially override correctly instead of one,
proven directly by this lesson's own six-method `MainActivity`.

## Connect the pieces

One trace: `onCreate` runs once, proven to happen with no call from this
project's own code — the OS constructs the `Activity` and calls it,
Inversion of Control, the identical idea `wpf-foundations` Lesson 09
already proved for WPF. Logging all six real callbacks and driving the
app through launch, backgrounding, return, and close produces a real,
observed, specific order — `onCreate`→`onStart`→`onResume` on first
launch, `onPause`→`onStop` on backgrounding (the same instance kept
alive), `onStart`→`onResume` again on return (no second `onCreate`), and
the full `onPause`→`onStop`→`onDestroy` chain only on a genuine close.

## What breaks without this

Remove `super.onStart();` from the `onStart` override, keeping the
`Log.d` call and every other method's `super` call intact, and run the
app:

```
FATAL EXCEPTION: main
android.app.SuperNotCalledException: Activity {com.example.myapp/.MainActivity}
did not call through to super.onStart()
```

A real, direct crash — proof `Activity`'s own contract requiring every
lifecycle override to call `super` is enforced at runtime, not merely
documented convention; skipping it doesn't silently break something
subtle, it crashes the app outright, with an error message naming the
exact missing call. Restoring `super.onStart();` fixes it.

## Exercises

1. Reproduce the real `SuperNotCalledException` from the What Breaks
   section yourself for `onPause` instead of `onStart`, confirming the
   real crash names `onPause` specifically.
2. Rotate the device (or emulator) while the app is running, watching
   Logcat. Confirm the real, observed callback sequence this specific
   action produces — a genuine, different real case from all three
   already proven in this lesson's second unit, worth discovering
   directly rather than assuming; this arc's own ViewModel lesson
   explains *why* this sequence is what it is.

## Definition of Done

- [ ] You proved `onCreate` runs with no call from this project's own
      code, via real, observed Logcat output.
- [ ] You logged all six lifecycle callbacks and confirmed the real,
      specific order across launch, backgrounding, return, and close.
- [ ] You caused the real `SuperNotCalledException` and understand it as
      an enforced contract, not a convention.
- [ ] You completed both exercises.

## Next

[Lesson 12 — Views, ViewGroups, and XML Layouts](lesson-12-views-viewgroups-and-xml-layouts.md)
covers what actually goes inside the layout XML `setContentView`
inflates — `View`, `ViewGroup`, `LinearLayout`, `ConstraintLayout` —
Android's own real answer to the same layout problem
`wpf-foundations` already solved for WPF's panels.
