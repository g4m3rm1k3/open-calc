# Lesson 15b: `ViewModel`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 15a's lifecycle-scoped cache,
Lesson 5d's configuration change, Lesson 2f's Activity lifecycle.

**Terms introduced in this lesson:**

- **`ViewModel`** — a class Jetpack manages specially, retained across
  Activity recreation via a framework-owned store tied to the logical
  screen rather than the physical Activity object. Retrieved (never
  constructed directly with `new`) through `ViewModelProvider`, a
  framework-managed lookup returning the existing instance for that
  screen if one already exists, constructing a new one only the first
  time.

---

## Concept Unit: `ViewModel`

### The Problem

Lesson 5d's configuration change destroys and rebuilds an entire
Activity object on every rotation — re-querying the database every
single time, even though the underlying data hasn't changed. Building a
hand-written singleton cache, Lesson 15a's own solution, is possible but
not the tool Android itself provides for exactly this problem.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
public class InventoryViewModel extends ViewModel {
    private List<Item> items;

    List<Item> getItems() {
        if (items == null) {
            items = loadItemsFromDatabase();
        }
        return items;
    }
}
```

```java
InventoryViewModel viewModel =
    new ViewModelProvider(this).get(InventoryViewModel.class);
```

This is `ViewModel` — **first appearance**: a class Jetpack manages
specially, retained across Activity recreation via a framework-owned
store tied to the logical screen rather than the physical Activity
object. Retrieved (never constructed directly with `new`) through
`ViewModelProvider`, a framework-managed lookup returning the existing
instance for that screen if one already exists, constructing a new one
only the first time. `new ViewModelProvider(this).get(...)` looks exactly
like construction, but is not: the first call, from the very first
Activity instance, actually builds a real `InventoryViewModel`; every
subsequent call, from every recreated Activity instance after a
rotation, receives that exact same object back — `items` was never
reloaded, because the `ViewModel` itself was never destroyed at all.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `public class InventoryViewModel extends ViewModel { ... }` — **(b)
   reappearing** inheritance shape from Lesson 0l, this time extending a
   real framework base class specifically designed for retained,
   screen-scoped state.
2. `List<Item> getItems() { if (items == null) { items =
   loadItemsFromDatabase(); } return items; }` — **(b) reappearing**
   cache-on-first-use shape from Lesson 15a, now protecting a real,
   expensive database query.
3. `new ViewModelProvider(this).get(InventoryViewModel.class)` — **(a)
   first appearance** of this exact retrieval shape: despite the visible
   `new`, this constructs a `ViewModelProvider` (a lookup helper), not an
   `InventoryViewModel` directly. `.get(InventoryViewModel.class)` is
   what actually returns the retained `InventoryViewModel` — a new one
   only the very first time, the same existing one on every later call
   from a recreated Activity.

### CS Lens

`ViewModel` is Lesson 15a's own lifecycle-scoped cache, real and
load-bearing: its lifecycle is deliberately tied to the *logical screen*
— surviving Activity recreation across a configuration change — rather
than to any one physical Activity *object*, which Lesson 5d already
established gets fully destroyed and rebuilt on every rotation.
Conceptually, this is adjacent to Lesson 15a's own single-shared-instance
`DataCache` shape, but scoped to one logical screen rather than the
entire application.

Also recognized in: any framework's own screen-scoped or
request-scoped object store (a web framework's per-request cache,
scoped to one request's lifetime rather than the whole application's),
dependency-injection containers offering multiple explicit lifetime
scopes (singleton, per-request, per-screen) rather than one single,
undifferentiated lifetime.

### SE Lens

The alternative — Lesson 15a's own hand-written `DataCache` singleton,
applied directly to Android — was not chosen for real Android
development because a true, application-wide singleton would outlive
even the specific screen it's meant for, potentially leaking data
between genuinely different screens or user sessions. `ViewModel`'s own
framework-managed store is scoped precisely to the logical screen — not
too short-lived (surviving configuration changes) and not too long-lived
(cleared once the screen is genuinely, permanently gone, not merely
rotated).

---

## Connect the Pieces

`DataCache.getInstance()` (Lesson 15a) demonstrated a lifecycle-scoped
cache in miniature. `ViewModelProvider(this).get(InventoryViewModel
.class)` is that exact idea, real and load-bearing in Android: the
retained `InventoryViewModel` survives every Activity recreation a
configuration change triggers, because its own lifecycle is tied to the
logical screen, not to any one physical Activity instance.

## What Breaks Without This

Constructing `InventoryViewModel` directly with `new
InventoryViewModel()` instead of through `ViewModelProvider` produces a
brand-new object on every single `onCreate` — exactly the problem
`ViewModel` exists to fix. Rotating the device would then reload
`items` from the database every single time, the identical wasteful
behavior a hand-written cache with no lifecycle scoping at all would
also produce.

## Exercises

1. Add a second cached field to `InventoryViewModel`, `int
   totalItemCount`, following the same cache-on-first-use shape as
   `items`.
2. Explain, in your own words, why `new
   ViewModelProvider(this).get(InventoryViewModel.class)` is not
   considered "constructing a new `InventoryViewModel`" in the usual
   sense, even though the word `new` appears on that line.
3. Explain, in your own words, why an application-wide singleton
   (Lesson 15a's own `DataCache`) would be the wrong tool for per-screen
   data specifically, connecting your answer to what happens when a user
   navigates to a genuinely different screen.

## Definition of Done

- [ ] You read the real `ViewModel`/`ViewModelProvider` example and can
      explain what happens on the first call versus every later call.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a
      `ViewModel`'s lifecycle is described as tied to the "logical
      screen" rather than the Activity object.
