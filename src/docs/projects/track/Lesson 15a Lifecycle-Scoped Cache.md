# Lesson 15a: Lifecycle-Scoped Cache

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 2f's Activity lifecycle, Lesson
5d's configuration change.

**Terms introduced in this lesson:**

- **Lifecycle-scoped cache** — an object's own lifecycle deliberately
  separated from the lifecycle of whatever currently references or
  requests it — the data outlives any one particular holder.

---

## Concept Unit: Lifecycle-Scoped Cache

### The Problem

Lesson 5d's configuration change destroys and rebuilds an entire Activity
object — any data that object loaded (from a database, say) would need
to be reloaded from scratch every single time, even though the
underlying data itself hasn't actually changed at all. Some way is
needed for data to outlive any *one particular* Activity object, while
still being reachable by whichever Activity currently needs it.

### Introduce the Concept in Isolation

```
mkdir lesson-15a
cd lesson-15a
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
data outlives any one particular holder. `DataCache`'s single, shared
instance outlives both `Screen` objects individually — neither `Screen`
owns it; both simply reach the one, shared, already-loaded cache.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `static DataCache instance;` and `static DataCache getInstance() {
   ... }` — **(b) reappearing** the Singleton Pattern shape from Lesson
   13h, ensuring exactly one `DataCache` exists regardless of how many
   `Screen` objects request it.
2. `if (cachedValue == null) { ... cachedValue = "Expensive Result"; }`
   — **(b) reappearing** cache-on-first-use shape from Lesson 6b, loading
   the expensive value exactly once and reusing it on every subsequent
   request.
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

## Connect the Pieces

`DataCache.getInstance()` demonstrated a lifecycle-scoped cache in
miniature: data that outlives any one specific `Screen` object requesting
it. The next lesson shows Android's own real version of this idea.

## What Breaks Without This

Each `Screen` object loading and holding its own copy of the expensive
data would mean redoing the expensive load every single time a new
`Screen` object is created, even when the underlying data hasn't changed
at all.

## Exercises

1. Add a second cached field to `DataCache`, `int loadCount`, tracking
   how many times the expensive load has actually run, and confirm it
   stays `1` regardless of how many `Screen` objects call `load()`.
2. Explain, in your own words, why `DataCache`'s own lifecycle is
   described as "longer-lived" than either `Screen` object's lifecycle.
3. Explain, in your own words, why an application-wide singleton is the
   right scope for `DataCache` specifically, connecting your answer to
   what would happen if each `Screen` held its own separate cache
   instead.

## Definition of Done

- [ ] You ran the `DataCache` example and saw the real, single-load
      output across two separate `Screen` objects.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why the cache's
      lifecycle is deliberately separated from either `Screen` object's
      own lifecycle.
