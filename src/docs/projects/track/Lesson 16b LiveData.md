# Lesson 16b: `LiveData`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 4k's Observer Pattern, Lesson
14e's main thread UI constraint.

**Terms introduced in this lesson:**

- **`LiveData`** — an observable, lifecycle-aware container holding one
  current value, automatically notifying registered observers on change
  and safely handling the cross-thread handoff back to the main thread.

---

## Concept Unit: `LiveData`

### The Problem

A plain Observer Pattern registration (Lesson 4k) has no idea whether the
screen that registered it is still on screen at all — Lesson 5d's own
configuration change destroys and rebuilds an entire Activity, and a
plain observer, registered by the destroyed instance, would keep firing
callbacks into an object that no longer exists, unless a developer
remembers to manually unregister it at exactly the right lifecycle
moment, every single time.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
public class InventoryViewModel extends ViewModel {
    private final LiveData<List<Item>> items = database.itemDao().getAllLive();

    LiveData<List<Item>> getItems() {
        return items;
    }
}
```

```java
viewModel.getItems().observe(this, updatedItems -> {
    adapter.updateItems(updatedItems);
    adapter.notifyDataSetChanged();
});
```

This is `LiveData` — **first appearance**: an observable, lifecycle-aware
container holding one current value, automatically notifying registered
observers on change and safely handling the cross-thread handoff back to
the main thread. `.observe(this, ...)` passes the Activity itself as the
first argument — `LiveData` uses it to automatically stop delivering
updates once that specific Activity is destroyed, with no manual
`removeObserver` call required anywhere, and guarantees the callback
itself runs on the main thread (Lesson 14e), regardless of which thread
the underlying value actually changed on.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `LiveData<List<Item>> items = database.itemDao().getAllLive();` —
   **(a) first appearance**: Room itself (Lesson 13g) can return a
   `LiveData`-wrapped result directly, updating automatically whenever
   the underlying table changes.
2. `viewModel.getItems()` — **(b) reappearing** `ViewModel` from Lesson
   15b, now exposing a `LiveData` instead of a plain `List<Item>`.
3. `.observe(this, updatedItems -> { ... });` — **(a) first appearance**:
   registers the callback, tied specifically to `this` (the Activity) —
   delivered only while that Activity is active, and automatically
   stopped once it's destroyed.
4. `adapter.notifyDataSetChanged();` — **(b) reappearing**
   `RecyclerView.Adapter` call from Lesson 6h, safely invoked here
   because `LiveData` itself guarantees delivery on the main thread,
   regardless of which thread the underlying database update happened
   on.

### CS Lens

`LiveData` solves two real problems at once: it removes the entire
category of "callback fired after my screen was already gone" bug a
plain observer registration is exposed to, and it solves Lesson 14e's own
main thread constraint at the same time, by guaranteeing delivery
happens on the main thread no matter which thread produced the update.

Also recognized in: lifecycle-aware reactive streams across virtually
every modern mobile framework (`StateFlow`/`Flow` with
`lifecycleScope` in Kotlin, `@Published`/`Combine` with SwiftUI's own
view lifecycle) — the same underlying need, solved differently by each
platform.

### SE Lens

The alternative — a plain Observer Pattern, manually unregistered by
hand at the right moment in every single Activity that observes it — was
not chosen because it doesn't scale: every single observer registration
site becomes a place a developer could forget the matching unregister
call, with each miss producing a real, hard-to-reproduce bug that only
manifests after a screen rotation or back-navigation.

---

## Connect the Pieces

`LiveData` ties a value's own observers directly to the observing
Activity, automatically silencing them once that screen is destroyed,
while guaranteeing every delivery happens safely on the main thread. The
next lesson names and generalizes the pattern `LiveData` itself embodies.

## What Breaks Without This

A plain observer with no lifecycle awareness, left registered past its
own screen's destruction, keeps firing into a destroyed Activity — a
real, hard-to-reproduce bug that only manifests after a screen rotation
or back-navigation. Relying on developers to manually unregister every
single observer at exactly the right moment doesn't scale across a real
app with many screens.

## Exercises

1. Explain, in your own words, what would go wrong if a plain observer
   were used directly in a real Activity in place of `LiveData`, without
   any manual unregistration.
2. Explain, in your own words, why `.observe(this, ...)` requires passing
   `this` (the Activity itself) as its first argument, rather than only
   the callback.
3. Explain, in your own words, why `LiveData` guaranteeing main-thread
   delivery matters specifically for `adapter.notifyDataSetChanged()`,
   connecting your answer to Lesson 14e's own main thread constraint.

## Definition of Done

- [ ] You read the real `LiveData`/`.observe(this, ...)` example and can
      explain what `this` is used for.
- [ ] You completed Exercise 1.
- [ ] You can explain why `LiveData` never requires a manual
      `removeObserver` call the way a plain observer would.
