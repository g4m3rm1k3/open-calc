# Lesson 5: The Screen You Left Isn't Gone — Lifecycle States, the Back Stack, and Surviving Rotation

**What you will build:** Logging in both Activities that makes the
*order* of lifecycle calls visible on every navigation and rotation,
plus a small on-screen tap counter that proves state gets destroyed —
and then a fix using `onSaveInstanceState` that proves it doesn't have
to be. The transferable problem: Lesson 2 showed that `onCreate` is
called by the OS, once. This lesson shows it isn't the *only* method
the OS calls, and that the OS can destroy and recreate your entire
Activity object — losing every field in it — for reasons that have
nothing to do with the user closing your app: pressing Back, rotating
the screen, or the system reclaiming memory all trigger it.

**What you need to know first:** Lesson 2 (`onCreate`, the Template
Method pattern, `Bundle savedInstanceState` — present since Lesson 1
but unused until now) and Lesson 4 (`InventoryActivity`, `Intent`,
navigating from `MainActivity`).

---

## Concept Unit: The Back Stack — Screens Are Stacked, Not Replaced

### The Problem

Tap "Open Inventory," then press the device/emulator **Back** button.
You land back on `MainActivity` — and if you watch Logcat, its
`onCreate called` line from Lesson 2 does **not** print again. So
`MainActivity` wasn't recreated. But it also isn't the same as if
`InventoryActivity` had simply been hidden — press Back again and the
whole app closes, meaning `InventoryActivity` is well and truly gone,
not just invisible. Something is tracking *which screen comes back into
view when the current one goes away*, in a specific order. What, and in
what order?

### Introduce the Concept in Isolation

No new syntax is needed here — `Log.d` was already taught in Lesson 2,
and every method you're about to override is called the same way
`onCreate` already is (same Template Method pattern). This unit is
purely about *watching real, already-understood tools reveal an order
you haven't seen yet*, so there's no throwaway lab to isolate and
discard.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `MainActivity.java` and `InventoryActivity.java`.
- **Change type:** Add.
- **Location:** New method overrides added below the existing
  `onCreate` in each class.
- **Dependencies:** none new.

### The New Code

Add these four overrides (same shape in both files — type it into both
`MainActivity.java` and `InventoryActivity.java`, changing only the tag
string so you can tell them apart in Logcat):

```java
@Override
protected void onStart() {
    super.onStart();
    android.util.Log.d("Lifecycle", "MainActivity onStart");
}

@Override
protected void onResume() {
    super.onResume();
    android.util.Log.d("Lifecycle", "MainActivity onResume");
}

@Override
protected void onPause() {
    super.onPause();
    android.util.Log.d("Lifecycle", "MainActivity onPause");
}

@Override
protected void onStop() {
    super.onStop();
    android.util.Log.d("Lifecycle", "MainActivity onStop");
}

@Override
protected void onDestroy() {
    super.onDestroy();
    android.util.Log.d("Lifecycle", "MainActivity onDestroy");
}
```

(In `InventoryActivity.java`, replace every `"MainActivity ..."` string
with `"InventoryActivity ..."`.)

### The Updated Project

`MainActivity.java` now reads, in full:

```java
package com.yourname.pocketinventory;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.content.Intent;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        android.util.Log.d("Lifecycle", "onCreate called");

        Button openButton = findViewById(R.id.openInventoryButton);
        openButton.setOnClickListener(v -> {
            Intent intent = new Intent(this, InventoryActivity.class);
            startActivity(intent);
        });
    }

    @Override
    protected void onStart() {                                        // ← new
        super.onStart();                                               // ← new
        android.util.Log.d("Lifecycle", "MainActivity onStart");       // ← new
    }                                                                   // ← new

    @Override
    protected void onResume() {                                        // ← new
        super.onResume();                                               // ← new
        android.util.Log.d("Lifecycle", "MainActivity onResume");      // ← new
    }                                                                   // ← new

    @Override
    protected void onPause() {                                         // ← new
        super.onPause();                                                // ← new
        android.util.Log.d("Lifecycle", "MainActivity onPause");       // ← new
    }                                                                   // ← new

    @Override
    protected void onStop() {                                          // ← new
        super.onStop();                                                 // ← new
        android.util.Log.d("Lifecycle", "MainActivity onStop");        // ← new
    }                                                                   // ← new

    @Override
    protected void onDestroy() {                                       // ← new
        super.onDestroy();                                              // ← new
        android.util.Log.d("Lifecycle", "MainActivity onDestroy");     // ← new
    }                                                                   // ← new
}
```

`MainActivity` as a whole now reports every stage of its life to
Logcat, not just its birth (`onCreate`) — the class is unchanged in
behavior, purely instrumented so the next step can be observed instead
of guessed at. Apply the same five overrides, same pattern, to
`InventoryActivity.java` (which already has only `onCreate` from
Lesson 4).

### Mechanical Walkthrough

- `onStart()` — **first appearance.** Called right before the Activity
  becomes visible to the user (but not necessarily interactive yet).
- `onResume()` — **first appearance.** Called right before the Activity
  starts receiving user input — this is the point it's fully "in the
  foreground."
- `onPause()` — **first appearance.** Called when another Activity is
  about to take the foreground, *while this one may still be partially
  visible* (think a translucent dialog on top). Code here must be fast
  — the incoming Activity is waiting on it.
- `onStop()` — **first appearance.** Called once this Activity is
  completely hidden — no part of it is visible anymore.
- `onDestroy()` — **first appearance.** Called when the Activity object
  is being permanently torn down — either because it finished
  (Back pressed, or code called `finish()`) or because the OS is
  reclaiming it (covered in the next Concept Unit).
- `super.onStart()` / `super.onResume()` / etc. — **reappearing
  concept**, same as `super.onCreate()` from Lesson 2: each parent
  version does real framework work you must not skip.
- `@Override`, `protected void`, `android.util.Log.d(...)` — all
  **reappearing**, already covered in Lesson 2.

### Run It — Execution Trace

Run the app with Logcat open, filtered to tag `Lifecycle`. Tap "Open
Inventory," then press system Back. You should see this exact sequence
(tags abbreviated to `Main`/`Inv` here for space):

```
Tap "Open Inventory":
  Main onPause
  Inv  onCreate called
  Inv  onStart
  Inv  onResume
  Main onStop          ← MainActivity is now fully hidden

Press Back:
  Inv  onPause
  Main onStart          ← MainActivity was stopped, not destroyed — it restarts
  Main onResume
  Inv  onStop
  Inv  onDestroy        ← InventoryActivity is gone for good
```

This is the answer to the Problem: `MainActivity` was never destroyed
by navigating away — only `onPause`'d and `onStop`'d — which is exactly
why its `onCreate` log line didn't reprint when you came back.
`InventoryActivity`, by contrast, really was destroyed, because
pressing Back removes the *top* entry and nothing else needs it kept
around.

### CS Lens

The back stack is a literal **stack data structure (LIFO — Last In,
First Out)**: `startActivity` pushes; Back pops. Also recognized in:
your program's own call stack (function returns pop in reverse call
order), undo/redo history in an editor, browser tab history, and
balanced-parenthesis matching in a parser.

### SE Lens

**Why keep `MainActivity` alive-but-stopped instead of destroying it
too and just recreating it fresh when you come back?** The alternative
— destroy everything not currently visible — would be simpler to
reason about but would mean every single Back press re-ran full
`onCreate` setup (network calls, view inflation, database reads) even
for a screen the user left seconds ago, which is wasteful and would
make navigation feel sluggish. Keeping stopped Activities resident in
memory is faster to resume, at the real cost you're about to hit in the
next Concept Unit: the OS is *not* obligated to keep them around
forever — under memory pressure, or for a configuration change, even a
"merely stopped" Activity can still be torn down and rebuilt from
scratch, and your code has to survive that without your explicit
permission being asked first.

---

## Concept Unit: Rotation Destroys and Recreates Your Activity

### The Problem

The lifecycle order you just observed makes it sound like `onDestroy`
only happens when a screen is genuinely finished with. It doesn't.
Rotate the emulator (Ctrl+F11, or the rotate button on the emulator
toolbar) while sitting on `MainActivity`, and watch Logcat: you'll see
`onPause`, `onStop`, `onDestroy` — then immediately `onCreate` again,
with a **brand-new object**, from scratch. Any plain Java field on that
object is gone. Prove it with something visible, not just a log line.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `activity_main.xml` (add a `TextView`),
  `MainActivity.java` (add a field, wire a new click listener, override
  `onSaveInstanceState`).
- **Change type:** Add.
- **Dependencies:** none new.

### The New Code — Part 1: A Visible Counter to Lose

Add one more `TextView` to `activity_main.xml`, below `titleText`:

```xml
<TextView
    android:id="@+id/tapCountText"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Taps: 0"
    app:layout_constraintTop_toBottomOf="@id/titleText"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toEndOf="parent"
    android:layout_marginTop="16dp" />
```

### The Updated Project

`activity_main.xml` now contains three children instead of two — the
title, this new tap counter directly beneath it (`toBottomOf="@id/titleText"`,
the same relative-constraint idea from Lesson 3, just referencing a
sibling view's ID instead of `"parent"`), and the button, unchanged, at
the bottom:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:id="@+id/titleText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="64dp"
        android:text="Pocket Inventory"
        android:textSize="28sp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <TextView
        android:id="@+id/tapCountText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Taps: 0"
        app:layout_constraintTop_toBottomOf="@id/titleText"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="16dp" />

    <Button
        android:id="@+id/openInventoryButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Open Inventory"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginBottom="64dp" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### Mechanical Walkthrough

- `app:layout_constraintTop_toBottomOf="@id/titleText"` — **reappearing
  concept** (constraints, from Lesson 3), worth one clause for the new
  shape: previous constraints all anchored to `"parent"`; this one
  anchors to a *sibling view's ID* instead — the same relationship
  idea, just between two children rather than child-to-parent.
- Everything else in this block — `TextView`, `android:id="@+id/..."`,
  `wrap_content`, `android:text`, margins — **reappearing**, all from
  Lesson 3.

### The New Code — Part 2: A Field That Gets Lost

In `MainActivity.java`, add a field and update the click behavior:

```java
private int tapCount = 0;
```

```java
android.widget.TextView tapCountText = findViewById(R.id.tapCountText);
titleText.setOnClickListener(v -> {
    tapCount++;
    tapCountText.setText("Taps: " + tapCount);
});
```

(You'll also need `android.widget.TextView titleText = findViewById(R.id.titleText);`
above it, since `titleText` wasn't previously stored in a variable.)

### The Updated Project

```java
public class MainActivity extends AppCompatActivity {
    private int tapCount = 0;                                          // ← new

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        android.util.Log.d("Lifecycle", "onCreate called");

        Button openButton = findViewById(R.id.openInventoryButton);
        openButton.setOnClickListener(v -> {
            Intent intent = new Intent(this, InventoryActivity.class);
            startActivity(intent);
        });

        android.widget.TextView titleText = findViewById(R.id.titleText);      // ← new
        android.widget.TextView tapCountText = findViewById(R.id.tapCountText); // ← new
        titleText.setOnClickListener(v -> {                                     // ← new
            tapCount++;                                                        // ← new
            tapCountText.setText("Taps: " + tapCount);                         // ← new
        });                                                                     // ← new
    }

    @Override
    protected void onStart() {
        super.onStart();
        android.util.Log.d("Lifecycle", "MainActivity onStart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        android.util.Log.d("Lifecycle", "MainActivity onResume");
    }

    @Override
    protected void onPause() {
        super.onPause();
        android.util.Log.d("Lifecycle", "MainActivity onPause");
    }

    @Override
    protected void onStop() {
        super.onStop();
        android.util.Log.d("Lifecycle", "MainActivity onStop");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        android.util.Log.d("Lifecycle", "MainActivity onDestroy");
    }
}
```

`onCreate` now does everything from before, plus wires a second
listener that mutates `tapCount` and reflects it on screen — a plain
instance field, initialized once per object, exactly the kind of state
that only survives as long as the object holding it does.

### Mechanical Walkthrough

- `private int tapCount = 0;` — **first appearance as an instance
  field** on this class (you've declared local variables before, e.g.
  `openButton`, but never a field that lives at the class level,
  outside any single method, keeping its value between method calls on
  the same object).
- `findViewById(R.id.titleText)` / `findViewById(R.id.tapCountText)` —
  **reappearing**, same mechanism as `openInventoryButton` in Lesson 4.
- `titleText.setOnClickListener(v -> {...})` — **reappearing**, same
  Observer-pattern registration and lambda syntax from Lesson 4, new
  target view.
- `tapCount++` — **first appearance.** The increment operator — basic
  syntax, but worth naming once since it's genuinely new in this
  curriculum: equivalent to `tapCount = tapCount + 1`.
- `tapCountText.setText("Taps: " + tapCount)` — **first appearance** of
  `setText` taking a runtime-built string (string concatenation with
  `+`, already-basic syntax) rather than the XML-hardcoded literal
  `android:text` used so far — this is how a view's displayed content
  changes *after* the layout is already on screen.

### Run It

Run the app. Tap the title several times — "Taps: 0" becomes "Taps: 1,"
"Taps: 2," and so on. Now rotate the emulator. Watch two things happen
at once: Logcat prints `onPause`, `onStop`, `onDestroy`, then
`onCreate` again — and the on-screen counter resets to "Taps: 0," even
though `tapCount` was, say, 4 a second ago. The object holding that `4`
was destroyed; a brand-new `MainActivity` with a brand-new `tapCount =
0` replaced it.

### CS Lens

This is the same **Stack + Template Method** machinery from the first
Concept Unit, just triggered by a different event: a **configuration
change** (rotation is the most common one; others include the device's
language or dark-mode setting changing) is treated by Android as "the
resources this Activity was built with may no longer be correct" —
so its answer is not "patch it in place" but "tear it down and rebuild
it from the Manifest and layout, exactly as if it were starting fresh."

### SE Lens

**Why does Android choose full destroy-and-recreate for a config
change instead of just re-measuring the existing views in place** (which
is roughly what a browser does on window resize)? The alternative —
patch layouts in place — sounds gentler, but different configurations
can legitimately need entirely different resources (a different layout
file per screen size or orientation, different string translations,
different drawable images) that were never loaded into the running
Activity at all. Recreating from scratch guarantees the *correct*
resources for the *new* configuration get loaded, at the real cost you
just watched happen: every plain field's value is gone unless you
explicitly rescue it — which is exactly the next Concept Unit.

---

## Concept Unit: `onSaveInstanceState` — Rescuing State Before Destruction

### The Problem

You now know `tapCount` disappears on rotation. `onCreate`'s
`Bundle savedInstanceState` parameter has been sitting there,
unexplained, since Lesson 1 — this is finally the lesson where it does
something.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `MainActivity.java`.
- **Change type:** Add.
- **Location:** A new override, plus one small addition inside
  `onCreate`.

### The New Code

```java
@Override
protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putInt("tapCount", tapCount);
}
```

And, inside `onCreate`, right after `tapCount++`'s listener is wired:

```java
if (savedInstanceState != null) {
    tapCount = savedInstanceState.getInt("tapCount", 0);
    tapCountText.setText("Taps: " + tapCount);
}
```

### The Updated Project

```java
public class MainActivity extends AppCompatActivity {
    private int tapCount = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        android.util.Log.d("Lifecycle", "onCreate called");

        Button openButton = findViewById(R.id.openInventoryButton);
        openButton.setOnClickListener(v -> {
            Intent intent = new Intent(this, InventoryActivity.class);
            startActivity(intent);
        });

        android.widget.TextView titleText = findViewById(R.id.titleText);
        android.widget.TextView tapCountText = findViewById(R.id.tapCountText);
        titleText.setOnClickListener(v -> {
            tapCount++;
            tapCountText.setText("Taps: " + tapCount);
        });

        if (savedInstanceState != null) {                                          // ← new
            tapCount = savedInstanceState.getInt("tapCount", 0);                    // ← new
            tapCountText.setText("Taps: " + tapCount);                              // ← new
        }                                                                            // ← new
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {                           // ← new
        super.onSaveInstanceState(outState);                                        // ← new
        outState.putInt("tapCount", tapCount);                                      // ← new
    }                                                                                // ← new

    @Override
    protected void onStart() {
        super.onStart();
        android.util.Log.d("Lifecycle", "MainActivity onStart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        android.util.Log.d("Lifecycle", "MainActivity onResume");
    }

    @Override
    protected void onPause() {
        super.onPause();
        android.util.Log.d("Lifecycle", "MainActivity onPause");
    }

    @Override
    protected void onStop() {
        super.onStop();
        android.util.Log.d("Lifecycle", "MainActivity onStop");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        android.util.Log.d("Lifecycle", "MainActivity onDestroy");
    }
}
```

`MainActivity` now closes the loop: right before destruction it writes
`tapCount` into a `Bundle`, and the very next `onCreate` — the one
building the replacement object — reads it back out and restores both
the field and the label, so the counter survives rotation even though
the object holding it does not.

### Mechanical Walkthrough

- `onSaveInstanceState(Bundle outState)` — **first appearance.** Called
  by the OS *before* `onDestroy`, specifically when the Activity is
  being destroyed for a reason it expects to recreate from (rotation,
  or the OS reclaiming memory while the Activity is stopped) — **not**
  called when the user presses Back or otherwise finishes the Activity
  on purpose, since there's nothing to restore *to* in that case.
- `super.onSaveInstanceState(outState)` — **reappearing concept**
  (parent call pattern), new detail: here the framework's own version
  saves view state (like scroll position) into the same `Bundle` you're
  adding to, which is why you call it rather than skip it.
- `outState.putInt("tapCount", tapCount)` — **first appearance.**
  `Bundle` is a String-keyed container (conceptually close to the
  `Map<String, String>` from Lesson 4's `RequestDemo` lab, but
  type-specific methods per value type — `putInt`, and later you'll see
  `putString`, `putBoolean`, etc. — rather than one generic `put`).
  `"tapCount"` is just a string key you chose; it must match on the
  read side.
- `savedInstanceState != null` — **first appearance of this specific
  check**, though `!=` and `null` themselves are already-basic syntax.
  Worth a clause: `onCreate` is called on *every* launch, including the
  very first one, where there's nothing saved yet — this check is what
  distinguishes "fresh start" from "recreated after saving state."
- `savedInstanceState.getInt("tapCount", 0)` — **first appearance.**
  The counterpart read to `putInt`, with a required second argument: a
  default value (`0`) used if that key isn't present — defensive
  against the key being missing for any reason.

### Run It

Tap the title 3 times ("Taps: 3"), rotate. Logcat still shows the full
destroy/recreate sequence — that part hasn't changed — but this time
the on-screen counter reads "Taps: 3" immediately after recreation,
not "Taps: 0." The object was still replaced; only the *value* was
carried across, deliberately, through the `Bundle`.

### CS Lens

This is a small, real instance of **checkpointing** — save just enough
state before a destructive event to reconstruct correctness afterward,
without persisting everything. Also recognized in: a web server saving
session state to a cookie before a stateless request cycle ends,
video game save files, and long-running compute jobs periodically
checkpointing progress so a crash doesn't lose everything back to zero.

### SE Lens

**Why not just tell Android to skip destroying the Activity on rotation
at all** (there is a real Manifest flag, `android:configChanges`, that
does something close to this)? That flag was the historical
alternative, and it's now discouraged specifically because opting out
means *you* become responsible for manually re-reading every
orientation-specific resource yourself in code — the exact problem
full recreation was designed to solve automatically. `onSaveInstanceState`
is deliberately limited instead: it's meant for small, transient UI
state (a scroll position, a counter, a bit of unsaved text in a form),
**not** a whole data set — cramming a large object into it can throw
`TransactionTooLargeException`, because the `Bundle` is transported
through the OS's process-communication layer, not just held in memory.
That size ceiling is the real reason a later lesson introduces
`ViewModel`: this is the honest, working, but limited tool for right
now, not the final answer for state that matters.

---

## Connect the Pieces

One trace through the whole lesson: tap "Open Inventory" → `MainActivity`
is pushed down the back stack (`onPause`, `onStop` — not destroyed) →
`InventoryActivity` is pushed on top and becomes visible → press Back →
`InventoryActivity` is popped and destroyed for good → `MainActivity`
resumes from where it was, `onCreate` never rerunning, because it was
never destroyed. Separately: rotate while on `MainActivity` → the OS
decides the configuration changed and destroys the object anyway,
despite it just being "stopped" a moment before → `onSaveInstanceState`
gets one last chance to write `tapCount` into a `Bundle` before the
object is gone → the brand-new `MainActivity` built immediately after
reads that same `Bundle` back in `onCreate` and restores the number —
two different destruction paths (Back vs. rotation), one of them
recoverable because you explicitly wired the rescue.

## What Breaks Without This

Comment out the entire `onSaveInstanceState` override (leave the
`if (savedInstanceState != null)` block in `onCreate` as-is). Tap the
title a few times, rotate, and confirm the counter silently resets to 0
again — no crash, no error, just quietly wrong behavior, which is
arguably worse than a crash because nothing tells you it happened.
Restore the override afterward.

## Exercises

1. Add a `Log.d` call as the very first line inside
   `onSaveInstanceState`, printing the `tapCount` value being saved.
   Rotate twice in a row and read Logcat to confirm it's called every
   single time, not just once.
2. Predict, then verify: does pressing the device **Home** button (not
   Back) call `onDestroy` on `MainActivity`? Add a log line if you're
   unsure, press Home, check Logcat, then reopen the app from the app
   switcher and confirm which lifecycle methods fire on the way back.

## Definition of Done

- [ ] You watched the real Logcat lifecycle order for both navigating
      forward and pressing Back, and can explain why `MainActivity`'s
      `onCreate` doesn't rerun on Back.
- [ ] You watched rotation destroy and recreate `MainActivity` and saw
      `tapCount` reset to 0 before adding the fix.
- [ ] `onSaveInstanceState` now preserves `tapCount` across rotation —
      you verified this by rotating after tapping, not just by reading
      the code.
- [ ] You can state, in your own words, why `onSaveInstanceState` isn't
      a substitute for real persistence (this sets up the motivation for
      Lessons 12–13).
- [ ] Commit: message explaining why (e.g. "Log full Activity lifecycle
      order and rescue tapCount across configuration changes via
      onSaveInstanceState, since Lesson 5 proved fields don't survive
      rotation on their own").

Lesson 6 is next: the inventory list itself — `RecyclerView`, the
Adapter pattern, and why Android refuses to let you just loop over a
`List` and add a `TextView` per item by hand.
