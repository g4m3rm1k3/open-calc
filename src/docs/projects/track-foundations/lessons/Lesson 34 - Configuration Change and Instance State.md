# Lesson 34: Configuration Change and Instance State

**What you will build:** The first unit is a small, fully runnable, plain
Java lab. The remaining two read real Android mechanisms directly.

**What you need to know first:** Lesson 10's `Activity lifecycle`,
Lesson 33's `Bundle`.

**Terms introduced in this lesson:**

- **Checkpointing** — saving just enough state before a destructive event
  to reconstruct correctness afterward, without persisting everything.
- **Configuration change** — an event (screen rotation, system language
  change, dark-mode toggle) that Android treats as invalidating the
  resources an Activity was built with, triggering a full
  destroy-and-recreate rather than an in-place patch.
- **`onSaveInstanceState`** — a callback letting an Activity write small
  values into a `Bundle` right before a destruction it expects to
  recreate from, read back out in the next `onCreate` to restore
  transient state.

---

## Concept Unit: Checkpointing

### The Problem

Some processes are destroyed and rebuilt entirely, rather than
incrementally modified — but a full rebuild that discards absolutely
everything loses real, small pieces of state a user would reasonably
expect to still be there afterward (which tab was selected, how far
they'd scrolled). Saving *everything* defeats the point of a lightweight
rebuild; saving *nothing* loses real, expected continuity.

### Introduce the Concept in Isolation

```
mkdir lesson-34
cd lesson-34
```

Create `Main.java`:

```java
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, Object> savedState = new HashMap<>();
        savedState.put("scrollPosition", 340);

        System.out.println("Simulating full teardown and rebuild...");

        int restoredScrollPosition = (int) savedState.get("scrollPosition");
        System.out.println("Restored scroll position: " + restoredScrollPosition);
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Simulating full teardown and rebuild...
Restored scroll position: 340
```

`savedState` holds exactly one small value, `scrollPosition`, saved
before the simulated teardown and read back afterward. This is
`checkpointing` — **first appearance**: saving just enough state before a
destructive event to reconstruct correctness afterward, without
persisting everything. Nothing about the rest of the (simulated)
program's state was saved — only the one specific value worth preserving
across the destructive event.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Map<String, Object> savedState = new HashMap<>();` — **(a) first
   appearance** of `HashMap`, a key-value standard-library type; `Object`
   as the value type here permits storing values of different types
   under different keys, at the cost of needing a cast to read them back
   as their real type.
2. `savedState.put("scrollPosition", 340);` — stores the one small value
   worth checkpointing, before the simulated destructive event.
3. `(int) savedState.get("scrollPosition")` — **(b) reappearing**
   runtime-type-narrowing cast from Lesson 05, needed here because
   `get(...)` returns the general `Object` type, not `int` directly.

### CS Lens

Checkpointing is a deliberate, minimal snapshot — the opposite extreme
from full serialization (Lesson 23), which preserves an entire object.
Recognizing which small pieces of state are actually worth
checkpointing, versus safely discardable and rebuildable from scratch, is
the real design skill this concept requires.

Also recognized in: video game "save points" (a deliberately small
snapshot, not the entire game engine's memory), database checkpointing
(periodically saving enough state to recover from a crash without
replaying an entire transaction log from the beginning), browser tab
restoration after a crash (saving scroll position and open tabs, not
every in-memory JavaScript variable).

### SE Lens

The alternative — saving the entire object graph before every
destructive event, the way full serialization does — was not chosen for
frequent, lightweight destructions (a screen rotation, expected to happen
often) because full serialization is real, comparatively expensive work;
checkpointing only the small, specific pieces worth preserving keeps the
destroy-and-rebuild cycle itself cheap and fast.

---

## Concept Unit: Configuration Change

### The Problem

Some real events — rotating a device, changing system language, toggling
dark mode — change resources (Lesson 11) an Activity was originally built
against. Patching an already-running Activity's UI in place, to reflect
a change of this scale, would be complex and error-prone; Android takes a
different, simpler approach entirely.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real Android mechanism, verified against
the actual framework behavior, not runnable via plain `javac`:

```
(user rotates the device)
  → InventoryActivity.onPause()
  → InventoryActivity.onStop()
  → InventoryActivity.onDestroy()
  → (a brand-new InventoryActivity object is constructed)
  → InventoryActivity.onCreate(Bundle savedInstanceState)
  → InventoryActivity.onStart()
  → InventoryActivity.onResume()
```

This is a `configuration change` — **first appearance**: an event
(screen rotation, system language change, dark-mode toggle) that Android
treats as invalidating the resources an Activity was built with,
triggering a full destroy-and-recreate rather than an in-place patch.
Every plain field on the original `InventoryActivity` object —
everything not deliberately checkpointed — is gone; a genuinely new
object runs through the entire lifecycle (Lesson 10) from `onCreate`
again, as if the app had just launched fresh.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this traces a real,
verified Android mechanism.

### Mechanical Walkthrough

1. `onPause()` → `onStop()` → `onDestroy()` — **(b) reappearing**
   Activity lifecycle sequence from Lesson 10, run through completely,
   in order, exactly as it would be for an Activity closing permanently.
2. A brand-new object is constructed — **(a) first appearance** of this
   specific fact: this is not the same object continuing — it's a
   genuinely new `InventoryActivity`, with none of the original object's
   plain field values carried over automatically.
3. `onCreate(Bundle savedInstanceState)` → `onStart()` → `onResume()` —
   the new object runs the same startup sequence any fresh launch would,
   with `savedInstanceState` as the one channel through which anything
   from before the destruction can be recovered — this lesson's own
   final unit.

### CS Lens

A configuration change is a deliberate, full destroy-and-recreate rather
than an in-place patch — a real, consequential design choice: rebuilding
from scratch guarantees the new Activity is fully, correctly built
against the new configuration (new resource values, Lesson 11's own
resource-qualifier mechanism selecting different resources for a rotated
or dark-mode configuration), rather than trying to reconcile a partially-
updated Activity against resources it was never actually built with.

Also recognized in: any system that responds to an environment change by
fully rebuilding rather than incrementally patching (a build tool
invalidating its entire cache on a configuration file change, rather than
attempting a partial, error-prone incremental update).

### SE Lens

The alternative — patching the existing Activity's views in place to
reflect the new configuration — was not chosen because reliably updating
every view, string, and layout value to match a new configuration,
in-place, without error, is a genuinely harder problem than simply
building a correct new Activity from scratch against the new
configuration — the same "rebuild rather than patch" tradeoff recurring
generally whenever in-place updates are error-prone enough that a full
rebuild is actually the more reliable choice.

---

## Concept Unit: `onSaveInstanceState`

### The Problem

A full destroy-and-recreate, per the previous unit, discards every plain
field on the original Activity object — including small, transient state
a user would reasonably expect to survive a rotation, like text
half-typed into a form. Some explicit hook is needed to checkpoint
exactly that kind of small state before the destruction, and restore it
afterward.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
@Override
protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putInt("scroll_position", currentScrollPosition);
}

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (savedInstanceState != null) {
        currentScrollPosition = savedInstanceState.getInt("scroll_position");
    }
}
```

This is `onSaveInstanceState` — **first appearance**: a callback letting
an Activity write small values into a `Bundle` right before a destruction
it expects to recreate from, read back out in the next `onCreate` to
restore transient state. `onSaveInstanceState` is called automatically
by the framework before a configuration-change destruction; the very next
`onCreate`'s own `savedInstanceState` parameter — unexplained since
Lesson 10 — is exactly the `Bundle` that method wrote into. This is the
concept that finally gives that long-unexplained parameter a real job.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `protected void onSaveInstanceState(Bundle outState)` — **(a) first
   appearance** of this specific lifecycle-adjacent method: called by the
   framework automatically before a configuration-change destruction,
   never called directly by application code.
2. `outState.putInt("scroll_position", currentScrollPosition);` — **(b)
   reappearing** `Bundle` key-value storage from Lesson 33, here
   specifically writing the one small value worth checkpointing.
3. `if (savedInstanceState != null) { ... }` — **(a) first appearance**
   of this specific null check: `savedInstanceState` is `null` on a
   genuinely fresh launch (nothing was ever checkpointed), but non-null
   specifically when recreated after a configuration change — this check
   distinguishes the two cases.
4. `savedInstanceState.getInt("scroll_position")` — reads the value back
   out, by the same key it was stored under, restoring the small piece
   of state the destroy-and-recreate cycle would otherwise have
   discarded.

### CS Lens

`onSaveInstanceState`/`onCreate`'s `savedInstanceState` parameter
together are checkpointing (this lesson's first unit), real and
load-bearing: the framework calls the save hook automatically before a
destruction it expects to recreate from, and hands the exact same
`Bundle` back to the very next `onCreate`, closing the loop between "an
object is about to be destroyed" and "a new one just came to life that
should restore what mattered."

Also recognized in: any framework's own "save state before disposal,
restore on recreation" hook — web browsers restoring scroll position and
form input after a page reload, IDE session restoration after a restart.

### SE Lens

The alternative — application code manually detecting a configuration
change and trying to migrate state itself — was not chosen because
Android's own `onSaveInstanceState`/`savedInstanceState` pair already
provides exactly the right hook, automatically, at exactly the right
moments; the discipline required is only in choosing what small state is
actually worth checkpointing, not in detecting when a save is needed at
all.

---

## Connect the Pieces

`savedState.put("scrollPosition", 340)` demonstrated checkpointing in
miniature: save only what's worth preserving before a destructive event.
A real configuration change is that destructive event, at Android's own
scale — a full destroy-and-recreate, discarding every plain field.
`onSaveInstanceState`/`savedInstanceState` is the real, load-bearing
checkpointing mechanism Android provides specifically to bridge that
gap, finally explaining the `Bundle savedInstanceState` parameter that
has sat, unexplained, in every `onCreate` signature since Lesson 10.

## What Breaks Without This

Relying on a plain field to survive a configuration change, with no
`onSaveInstanceState` at all, produces a real, observable bug: rotating
the device resets any such field to its default value, discarding
whatever the user had scrolled to or typed, with no error or crash at
all — simply silently lost state. This is the concrete, silent failure
mode `onSaveInstanceState` exists to prevent.

## Exercises

1. Add a second checkpointed value, `String searchQuery`, following the
   exact same `onSaveInstanceState`/`onCreate` shape as
   `scroll_position`.
2. Explain, in your own words, why `savedInstanceState` is checked for
   `null` inside `onCreate`, rather than assumed to always contain a
   value.
3. Trace, on paper, the complete sequence of lifecycle methods called,
   in order, for a rotation: from the moment the device is rotated to
   the moment the recreated Activity is fully visible again.

## Definition of Done

- [ ] You ran the checkpointing example and saw the real, restored
      value.
- [ ] You read the configuration-change lifecycle trace and can name
      which lifecycle methods run, in order, during a rotation.
- [ ] You read the real `onSaveInstanceState`/`onCreate` example and can
      explain what `savedInstanceState` being `null` signifies.
- [ ] You can state, without looking back at this lesson, why a plain
      field, with no checkpointing, is reset by a screen rotation.
