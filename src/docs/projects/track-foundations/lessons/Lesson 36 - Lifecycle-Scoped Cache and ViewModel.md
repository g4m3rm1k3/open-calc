# Lesson 36: Lifecycle-Scoped Cache and ViewModel

**What you will build:** The first unit is a small, fully runnable, plain
Java lab. The second reads Android's real `ViewModel` mechanism directly.

**What you need to know first:** Lesson 10's `Activity lifecycle`,
Lesson 34's `configuration change`.

**Terms introduced in this lesson:**

- **Lifecycle-scoped cache** — an object's own lifecycle deliberately
  separated from the lifecycle of whatever currently references or
  requests it — the data outlives any one particular holder.
- **`ViewModel`** — a class Jetpack manages specially, retained across
  Activity recreation via a framework-owned store tied to the logical
  screen rather than the physical Activity object.

---

## Concept Unit: Lifecycle-Scoped Cache

### The Problem

Lesson 34's configuration change destroys and rebuilds an entire Activity
object — any data that object loaded (from a database, say) would need
to be reloaded from scratch every single time, even though the
underlying data itself hasn't actually changed at all. Some way is
needed for data to outlive any *one particular* Activity object, while
still being reachable by whichever Activity currently needs it.

### Introduce the Concept in Isolation

```
mkdir lesson-36
cd lesson-36
```

Create `Main.java`:

```java
class DataCache {
    private static DataCache instance;
    private String cachedValue;

    static DataCache getInstance() {
        if (instance == null) {
            instance = new DataCache();
        }
        return instance;
    }

    String getValue() {
        if (cachedValue == null) {
            System.out.println("Loading expensive data for the first time...");
            cachedValue = "Expensive Result";
        }
        return cachedValue;
    }
}

class Screen {
    void load() {
        DataCache cache = DataCache.getInstance();
        System.out.println("Screen sees: " + cache.getValue());
    }
}

public class Main {
    public static void main(String[] args) {
        Screen firstScreen = new Screen();
        firstScreen.load();

        Screen secondScreen = new Screen();
        secondScreen.load();
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
Loading expensive data for the first time...
Screen sees: Expensive Result
Screen sees: Expensive Result
```

#### Execution Trace

Two separate `Screen` objects are built, but only one `DataCache` ever
exists:

1. `new Screen()`, assigned to `firstScreen` — builds the first,
   genuinely distinct `Screen` object. It holds no cache of its own.
2. `firstScreen.load()` calls `DataCache.getInstance()`. `instance` is
   still `null`, so a real `DataCache` is constructed here, for the
   first and only time. `getValue()` finds `cachedValue` is `null` too,
   so it prints the loading message and stores `"Expensive Result"`.
3. `new Screen()`, assigned to `secondScreen` — a second, entirely
   separate `Screen` object, sharing nothing with `firstScreen` directly.
4. `secondScreen.load()` calls `DataCache.getInstance()` again —
   `instance` is no longer `null`, so the *same* `DataCache` from step 2
   is returned, not a new one. `getValue()` finds `cachedValue` already
   set, skips the loading message entirely, and returns the already-
   cached result — proof the cache's own lifecycle outlived
   `firstScreen` and is now being reused by `secondScreen`, a completely
   different object.

`"Loading expensive data..."` prints only once, even though two separate
`Screen` objects each called `load()`. This is a `lifecycle-scoped cache`
— **first appearance**: an object's own lifecycle deliberately separated
from the lifecycle of whatever currently references or requests it — the
data outlives any one particular holder. `DataCache`'s single, shared instance outlives both `Screen` objects
individually — neither `Screen` owns it; both simply reach the one,
shared, already-loaded cache.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `static DataCache instance;` and `static DataCache getInstance() {
   ... }` — **(a) first appearance** of this exact one-instance-only
   shape here, ensuring exactly one `DataCache` exists regardless of how
   many `Screen` objects request it; a later lesson names and formally
   teaches this shape as the Singleton Pattern.
2. `if (cachedValue == null) { ... cachedValue = "Expensive Result"; }`
   — **(b) reappearing** cache-on-first-use shape from Lesson 06's own
   RecyclerView-adjacent material, loading the expensive value exactly
   once and reusing it on every subsequent request.
3. `Screen firstScreen = new Screen(); firstScreen.load();` then `Screen
   secondScreen = new Screen(); secondScreen.load();` — **(a) first
   appearance** of this exact demonstration: two entirely separate
   `Screen` objects, neither one holding the cached data itself — both
   simply reach through to the one, longer-lived `DataCache`.

### CS Lens

A lifecycle-scoped cache deliberately decouples *data lifetime* from
*holder lifetime* — the data's own lifespan is scoped to something
longer-lived (here, the whole program's run; in a real Android app, the
logical screen across Activity recreations) than whichever specific
object currently happens to be asking for it.

Also recognized in: connection pools (a database connection outlives any
one request that borrows it), application-level caches generally (data
scoped to the whole running application, reused across many individual
requests or screens).

### SE Lens

The alternative — each `Screen` object loading and holding its own copy
of the expensive data — was not chosen because it would mean redoing the
expensive load every single time a new `Screen` object is created, even
when the underlying data hasn't changed at all. Scoping the cache to
something longer-lived than any one `Screen` is what avoids that
repeated, unnecessary cost.

---

## Concept Unit: `ViewModel` — Android's Real Lifecycle-Scoped Cache

### The Problem

Lesson 34's configuration change destroys and rebuilds an entire
`InventoryActivity` object on every rotation — re-querying the database
every single time, even though the underlying data hasn't changed.
Building a hand-written singleton cache, this lesson's own first unit's
solution, is possible but not the tool Android itself provides for
exactly this problem.

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
`InventoryActivity` instance, actually builds a real
`InventoryViewModel`; every subsequent call, from every recreated
Activity instance after a rotation, receives that exact same object back
— `items` was never reloaded, because the `ViewModel` itself was never
destroyed at all.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `public class InventoryViewModel extends ViewModel { ... }` — **(b)
   reappearing** inheritance shape from Lesson 05, this time extending a
   real framework base class specifically designed for retained,
   screen-scoped state.
2. `List<Item> getItems() { if (items == null) { items =
   loadItemsFromDatabase(); } return items; }` — **(b) reappearing**
   cache-on-first-use shape from this lesson's own first unit, now
   protecting a real, expensive database query.
3. `new ViewModelProvider(this).get(InventoryViewModel.class)` — **(a)
   first appearance** of this exact retrieval shape: despite the visible
   `new`, this constructs a `ViewModelProvider` (a lookup helper), not an
   `InventoryViewModel` directly. `.get(InventoryViewModel.class)` is
   what actually returns the retained `InventoryViewModel` — a new one
   only the very first time, the same existing one on every later call
   from a recreated Activity.

### CS Lens

`ViewModel` is this lesson's own lifecycle-scoped cache, real and
load-bearing: its lifecycle is deliberately tied to the *logical screen*
— surviving Activity recreation across a configuration change — rather
than to any one physical Activity *object*, which Lesson 34 already
established gets fully destroyed and rebuilt on every rotation.
Conceptually, this is adjacent to this lesson's own single-shared-instance
`DataCache` shape, but scoped to one logical screen rather than the
entire application.

Also recognized in: any framework's own screen-scoped or
request-scoped object store (a web framework's per-request cache,
scoped to one request's lifetime rather than the whole application's),
dependency-injection containers offering multiple explicit lifetime
scopes (singleton, per-request, per-screen) rather than one single,
undifferentiated lifetime.

### SE Lens

The alternative — this lesson's own hand-written `DataCache` singleton,
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

`DataCache.getInstance()` demonstrated a lifecycle-scoped cache in
miniature: data that outlives any one specific `Screen` object requesting
it. `ViewModelProvider(this).get(InventoryViewModel.class)` is that exact
idea, real and load-bearing in Android: the retained `InventoryViewModel`
survives every Activity recreation a configuration change triggers,
because its own lifecycle is tied to the logical screen, not to any one
physical `InventoryActivity` instance.

## What Breaks Without This

Constructing `InventoryViewModel` directly with `new
InventoryViewModel()` instead of through `ViewModelProvider` produces a
brand-new object on every single `onCreate` — exactly the problem
`ViewModel` exists to fix. Rotating the device would then reload
`items` from the database every single time, the identical wasteful
behavior a hand-written cache with no lifecycle scoping at all would
also produce — concrete proof that `ViewModelProvider`'s retrieval
mechanism, not just the `ViewModel` base class itself, is what actually
provides the retention.

## Exercises

1. Add a second cached field to `InventoryViewModel`, `int
   totalItemCount`, following the same cache-on-first-use shape as
   `items`.
2. Explain, in your own words, why `new
   ViewModelProvider(this).get(InventoryViewModel.class)` is not
   considered "constructing a new `InventoryViewModel`" in the usual
   sense, even though the word `new` appears on that line.
3. Explain, in your own words, why an application-wide singleton (this
   lesson's own first unit's `DataCache`) would be the wrong tool for
   per-screen data specifically, connecting your answer to what happens
   when a user navigates to a genuinely different screen.

## Definition of Done

- [ ] You ran the `DataCache` example and saw the real, single-load
      output across two separate `Screen` objects.
- [ ] You read the real `ViewModel`/`ViewModelProvider` example and can
      explain what happens on the first call versus every later call.
- [ ] You completed Exercise 2 and can explain why `new
      ViewModelProvider(...)` doesn't construct a new `ViewModel` each
      time.
- [ ] You can state, without looking back at this lesson, why a
      `ViewModel`'s lifecycle is described as tied to the "logical
      screen" rather than the Activity object.
