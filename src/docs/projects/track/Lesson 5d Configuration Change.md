# Lesson 5d: Configuration Change

**What you will build:** No new code to compile — this traces a real
Android mechanism directly.

**What you need to know first:** Lesson 2f's Activity lifecycle,
Lesson 5c's checkpointing.

**Terms introduced in this lesson:**

- **Configuration change** — an event (screen rotation, system language
  change, dark-mode toggle) that Android treats as invalidating the
  resources an Activity was built with, triggering a full
  destroy-and-recreate rather than an in-place patch.

---

## Concept Unit: Configuration Change

### The Problem

Some real events — rotating a device, changing system language,
toggling dark mode — change resources (Lesson 2j) an Activity was
originally built against. Patching an already-running Activity's UI in
place, to reflect a change of this scale, would be complex and
error-prone; Android takes a different, simpler approach entirely.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real Android mechanism, verified
against the actual framework behavior, not runnable via plain `javac`:

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
(screen rotation, system language change, dark-mode toggle) that
Android treats as invalidating the resources an Activity was built
with, triggering a full destroy-and-recreate rather than an in-place
patch. Every plain field on the original `InventoryActivity` object —
everything not deliberately checkpointed — is gone; a genuinely new
object runs through the entire lifecycle (Lesson 2f) from `onCreate`
again, as if the app had just launched fresh.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this traces a real,
verified Android mechanism.

### Mechanical Walkthrough

1. `onPause()` → `onStop()` → `onDestroy()` — **(b) reappearing**
   Activity lifecycle sequence from Lesson 2f, run through completely,
   in order, exactly as it would be for an Activity closing
   permanently.
2. A brand-new object is constructed — **(a) first appearance** of
   this specific fact: this is not the same object continuing — it's
   a genuinely new `InventoryActivity`, with none of the original
   object's plain field values carried over automatically.
3. `onCreate(Bundle savedInstanceState)` → `onStart()` → `onResume()`
   — the new object runs the same startup sequence any fresh launch
   would, with `savedInstanceState` as the one channel through which
   anything from before the destruction can be recovered — the next
   lesson's own subject.

### CS Lens

A configuration change is a deliberate, full destroy-and-recreate
rather than an in-place patch — a real, consequential design choice:
rebuilding from scratch guarantees the new Activity is fully, correctly
built against the new configuration (new resource values, a later
lesson's own resource-qualifier mechanism selecting different resources
for a rotated or dark-mode configuration), rather than trying to
reconcile a partially-updated Activity against resources it was never
actually built with.

Also recognized in: any system that responds to an environment change
by fully rebuilding rather than incrementally patching (a build tool
invalidating its entire cache on a configuration file change, rather
than attempting a partial, error-prone incremental update).

### SE Lens

The alternative — patching the existing Activity's views in place to
reflect the new configuration — was not chosen because reliably
updating every view, string, and layout value to match a new
configuration, in-place, without error, is a genuinely harder problem
than simply building a correct new Activity from scratch against the
new configuration.

---

## Connect the Pieces

Lesson 5c's checkpointing example saved one small value before a
simulated teardown. A configuration change is that destructive event,
at Android's own scale — a full destroy-and-recreate, discarding every
plain field. The next lesson (`onSaveInstanceState`) shows the real,
load-bearing checkpointing mechanism Android provides specifically to
bridge that gap.

## What Breaks Without This

Assuming a rotated Activity is "the same object, just resized" rather
than a genuinely new one leads to a real, wrong prediction. Verified against
the actual framework behavior: any plain field's value from before the
rotation is simply gone, reset to its default, with no error or crash
at all — a real, silent bug the next lesson's own mechanism exists to
prevent.

## Exercises

1. Trace, on paper, the complete sequence of lifecycle methods called,
   in order, for a rotation: from the moment the device is rotated to
   the moment the recreated Activity is fully visible again.
2. Explain, in your own words, why Android rebuilds from scratch
   rather than patching the existing Activity in place.
3. Explain, in your own words, why a configuration change runs the
   *entire* lifecycle sequence, not just `onCreate` alone.

## Definition of Done

- [ ] You read the configuration-change lifecycle trace and can name
      which lifecycle methods run, in order, during a rotation.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a plain
      field's value is lost during a configuration change.
