# Lesson 06: `Repository` — the Real Boundary Between `ViewModel` and Room

**What you will build:** `ItemRepository` — a real, deliberate class
sitting between `ItemDao` and a new `InventoryViewModel`, plus the
`InventoryViewModel` itself: the first `ViewModel` in this project that
actually holds real, persisted data instead of a plain in-memory
counter. The transferable problem: nothing so far stops
`InventoryActivity` from calling
`AppDatabase.getInstance(this).itemDao()` directly, the same way
`android-persistence-lab`'s own `InventoryActivity` called
`ItemRepository` directly — except that series' own `ItemRepository`
was a real, if thin, abstraction; without a deliberate boundary here,
this project's own `ViewModel` would end up reaching straight into
Room itself, coupling this screen's logic directly to *how* data is
stored, not just *that* it exists.

**What you need to know first:** Lesson 03 (`ViewModel`,
`ViewModelProvider`). Lesson 04 (`ItemDao`, `AppDatabase`). Lesson 05
(`LiveData`, `getAllItems()`).

**Terms introduced in this lesson:**
- **Repository pattern** — a real, deliberate class standing between a
  `ViewModel` and wherever data actually lives, so the `ViewModel` never
  needs to know *how* data is fetched or stored — only that it can ask
  for it.
- **Single source of truth** — the real, architectural principle that
  exactly one place in a codebase should own a given piece of data,
  with every other part of the app reading through it rather than
  maintaining an independent copy.

**Objects and methods used:** none new — this lesson combines Lessons
03–05's own real objects and methods into one, deliberate architectural
shape; nothing here is a new API.

---

## Concept Unit: Why Not Just Call `AppDatabase` Directly?

### The Problem

`InventoryViewModel` could, technically, call
`AppDatabase.getInstance(context).itemDao().getAllItems()` directly —
every piece involved is already real and already works. Nothing about
that would fail to compile or run.

### Introduce the Concept in Isolation

Consider, without writing it for real, what calling Room directly from
*every* `ViewModel` this project ever adds would actually look like a
year from now: a `LoginViewModel` calling `AppDatabase.getInstance(...)
.userDao()...`, an `InventoryViewModel` calling
`AppDatabase.getInstance(...).itemDao()...`, a hypothetical future
`ReportsViewModel` calling both — every single `ViewModel`, individually,
holding its own knowledge of exactly which `Dao` to ask for what, and
exactly how to get an `AppDatabase` instance in the first place.

### The Tradeoff

Calling Room directly from every `ViewModel` costs nothing today, with
exactly one `ViewModel` and one `Dao` in this project — the real cost
only appears the moment a second real data source enters the picture
(a network API, later; a cache; a second local table two `ViewModel`s
both need). A `Repository` costs one extra, real class *now*, in
exchange for exactly one place, later, that would ever need to change
if *how* item data is fetched changes — a network call added
alongside Room, say — without touching `InventoryViewModel` at all.

**This project introduces `ItemRepository` now**, deliberately, before
it's strictly required by anything currently in this codebase — the
same reasoning `android-ui-foundations` Lesson 22 already used
choosing a mutable class over a `record` for `InventoryItem`, ahead of
the one real feature (editing a quantity) that would need it: paying a
small, real cost early, on purpose, rather than a larger, real
refactor once several `ViewModel`s already depend on Room directly.

### Mechanical Walkthrough

- `AppDatabase.getInstance(context).itemDao().getAllItems()` — the
  *without-a-repository* shape: three real, chained calls a `ViewModel`
  would need to know in full, repeated in every `ViewModel` that ever
  needs item data.
- `itemRepository.getAllItems()` — this lesson's own real shape: one
  call, naming only *what* is wanted, with every real detail of *how*
  — which `Dao`, which `AppDatabase` instance — hidden entirely inside
  `ItemRepository` itself.

### CS Lens

This is the same **separation of concerns** principle
`android-architecture-lab` Lesson 02 already applied to MVVM as a
whole, applied one layer deeper: a `ViewModel`'s own job is holding and
exposing *screen* state; a `Repository`'s job is knowing *where data
actually comes from* — two genuinely different concerns, each
deserving its own class, the same reasoning that already separated
`Activity` from `ViewModel` one lesson ago.

### SE Lens

**Isn't this premature abstraction — building a boundary for a future
need this project doesn't have yet?** This repository's own established
convention (`android-ui-foundations`' own "don't design for hypothetical
future requirements" principle) would normally caution against exactly
this. The real, deciding difference here: `Repository` isn't
speculative architecture for an imagined feature — it's the same,
already-proven real shape `android-persistence-lab` itself already used
successfully, for the identical reason (a real class standing between a
screen and real data access). This lesson isn't inventing a new
pattern on spec; it's carrying forward one already validated by that
series' own real, working use of it.

---

## Concept Unit: `ItemRepository` and `InventoryViewModel`

### The Problem

With the real reasoning settled, both real classes need building:
`ItemRepository`, wrapping `ItemDao`; `InventoryViewModel`, exposing
`ItemRepository`'s own data to `InventoryActivity`.

### Project Change

- **Reference Source:** No external framework signature — both are
  application classes this project authors.
- **Files affected:** New file `inventory/ItemRepository.java`; new file
  `inventory/InventoryViewModel.java`.
- **Change type:** Create two new files.
- **Dependencies:** `AppDatabase`, `ItemDao` (Lesson 04).

### The New Code

`ItemRepository.java`:

```java
package com.yourname.inventoryapp.inventory;

import android.content.Context;
import androidx.lifecycle.LiveData;
import com.yourname.inventoryapp.core.AppDatabase;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ItemRepository {
    private final ItemDao itemDao;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public ItemRepository(Context context) {
        this.itemDao = AppDatabase.getInstance(context).itemDao();
    }

    public LiveData<List<ItemEntity>> getAllItems() {
        return itemDao.getAllItems();
    }

    public void insert(ItemEntity item) {
        executor.execute(() -> itemDao.insert(item));
    }
}
```

`InventoryViewModel.java`:

```java
package com.yourname.inventoryapp.inventory;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;
import java.util.List;

public class InventoryViewModel extends ViewModel {
    private final ItemRepository repository;

    public InventoryViewModel(ItemRepository repository) {
        this.repository = repository;
    }

    public LiveData<List<ItemEntity>> getAllItems() {
        return repository.getAllItems();
    }

    public void addItem(String name, int quantity) {
        ItemEntity item = new ItemEntity();
        item.name = name;
        item.quantity = quantity;
        repository.insert(item);
    }
}
```

### Mechanical Walkthrough

- `private final ItemDao itemDao;` — `ItemRepository`'s own one, real
  collaborator; `private` (`android-ui-foundations` Lesson 13's own
  reasoning) — nothing outside this class ever needs to know a `Dao`
  is involved at all.
- `public ItemRepository(Context context)` — obtains the real, shared
  `AppDatabase` instance (Lesson 04's own singleton) and extracts its
  `Dao` once, at construction — a real, deliberate, provisional
  simplification: accepting a plain `Context` here, rather than the
  more careful `Context` handling this series' own Lesson 10 will teach
  properly, is honest, temporary scope, not an oversight.
- `private final ExecutorService executor = Executors.newSingleThreadExecutor();`
  — **first appearance.** A real, standard Java background-thread pool,
  sized to exactly one thread — real writes run here, off the main
  thread, the same real discipline Lesson 04 proved necessary, now
  owned entirely by `ItemRepository` instead of whatever code happens
  to call it.
- `getAllItems()` — a real, direct pass-through to `itemDao.getAllItems()`
  — `ItemRepository` adds no logic here yet, deliberately: today's real
  requirement is exactly what `Dao` already provides; the boundary
  exists for *future* logic (combining two sources, real caching) to
  have somewhere to go without changing `InventoryViewModel` at all.
- `insert(ItemEntity item)` — wraps `itemDao.insert(item)`, reappearing
  unchanged from Lesson 04, inside `executor.execute(...)` — **first
  appearance of `Repository`-owned threading specifically.** A caller
  (`InventoryViewModel`, next) never needs to know, or remember, that
  this specific operation requires a background thread;
  `ItemRepository` itself owns that real, correct discipline, once.
- `InventoryViewModel`'s own constructor — takes a real
  `ItemRepository`, not a `Context` or an `AppDatabase` directly; this
  `ViewModel` has no idea Room, or even a database at all, is involved
  underneath — exactly this lesson's own real point.
- `addItem(String name, int quantity)` — builds a real `ItemEntity` and
  hands it to the repository; `InventoryActivity`, next lesson, calls
  this method, never touching `ItemEntity` or `ItemRepository` directly
  itself.

### Run It Yourself

Genuinely Android-only behavior — no plain-JVM equivalent proves it.
Temporarily wire a real, minimal proof directly in
`InventoryActivity.onCreate`, ahead of next lesson's own full UI:

```java
InventoryViewModel viewModel = new InventoryViewModel(new ItemRepository(this));
viewModel.getAllItems().observe(this, items -> {
    android.util.Log.d("InventoryViewModel", "Item count: " + items.size());
});
viewModel.addItem("Bolts", 120);
```

Run it on a real device or emulator and watch Logcat, filtered on
`InventoryViewModel`. Two real, separate log lines are the expected,
predicted result, grounded directly in this lesson's own verified
`observe`/Room contracts, not yet confirmed by an actual run in this
environment:

```
D/InventoryViewModel: Item count: 0
D/InventoryViewModel: Item count: 1
```

The first line is predicted the moment `observe` registers (the table
starts empty on a fresh install); the second, automatically, once
`addItem` genuinely writes a new row through
`InventoryViewModel → ItemRepository → ItemDao → Room`, with no manual
reload anywhere in this exact call chain. Confirm both lines actually
appear, in this exact order, on your own device before trusting this
lesson's own claim that every layer is wired correctly end to end.

### CS Lens

`ItemRepository` owning its own `ExecutorService`, so every caller gets
correct background threading *for free*, is the same **encapsulation**
principle `android-ui-foundations` Lesson 13 already applied to a
single `private` field, now applied to an entire *behavior*: the
correct, safe way to call `insert` is the *only* way to call it — there
is no direct path to `itemDao.insert(...)` a careless caller could
reach for instead and get wrong.

### SE Lens

**Why does `InventoryViewModel`'s constructor take an already-built
`ItemRepository`, rather than building its own — `new
ItemRepository(context)` — the way `ItemRepository` itself builds its
own `AppDatabase` connection?** This is a deliberate, real preview of
Lesson 13's own subject (dependency injection): a class that receives
its own collaborators, rather than constructing them itself, is
genuinely easier to test in isolation — a real, working replacement
`ItemRepository` (holding fake, in-memory data, no real database
involved at all) can be handed to `InventoryViewModel` in a test with
zero changes to `InventoryViewModel` itself, exactly the real
capability Lesson 14's own testing work depends on.

---

## Connect the Pieces

One trace: `InventoryViewModel` knows only that it can ask a real
`ItemRepository` for `getAllItems()` or call `addItem(...)` — nothing
about `ItemDao`, `AppDatabase`, or even that Room is the real underlying
storage mechanism leaks into this `ViewModel` at all. `ItemRepository`
itself owns every real detail: which `Dao` to call, which thread a
write needs to run on, how to reach the one shared `AppDatabase`
instance. This is MVVM's own real architecture, now with all three
layers genuinely separated: `InventoryActivity` (View, next lesson)
will ask `InventoryViewModel` (ViewModel) for data; `InventoryViewModel`
asks `ItemRepository` (the real boundary to the Model); `ItemRepository`
alone knows Room exists underneath any of it.

## What Breaks Without This

This lesson's own real cost — not a runtime failure this lesson can
trigger directly, a structural one worth naming precisely: imagine a
second `ViewModel` this project adds later, also needing item data,
built *without* going through `ItemRepository` — calling
`AppDatabase.getInstance(context).itemDao()` directly instead, the
shortcut this lesson's own opening Concept Unit named. The moment
`ItemRepository` later gains real logic of its own (a real cache, a
combined network+database source), that second `ViewModel` silently
bypasses it entirely, reading stale or incomplete data the first
`ViewModel` correctly avoids — a real, structural inconsistency with no
compiler error anywhere to catch it, precisely because nothing enforces
routing through the one real boundary this lesson establishes.

## Exercises

1. Add a second method to `ItemRepository`, `getItemCount()`, returning
   `LiveData<Integer>` by wrapping a new `@Query("SELECT COUNT(*) FROM
   items") LiveData<Integer> getItemCount();` added to `ItemDao` —
   confirm `InventoryViewModel` can expose it with one line, with zero
   changes to `ItemDao` or `AppDatabase` beyond the new query itself.
2. Sketch, without necessarily building it, what a fake
   `ItemRepository` for testing might look like — a subclass or
   alternate implementation returning a fixed, in-memory
   `LiveData<List<ItemEntity>>` instead of a real database-backed one —
   confirming for yourself that `InventoryViewModel`'s own real code
   would need zero changes to accept it.
3. Explain, in your own words, why `insert`'s own `ExecutorService`
   lives inside `ItemRepository` specifically, rather than inside
   `InventoryViewModel` or `ItemDao` — tying your answer back to this
   lesson's own "correct discipline, owned once" reasoning.

## Definition of Done

- [ ] `ItemRepository` and `InventoryViewModel` both exist and compile.
- [ ] You can explain, precisely, what `InventoryViewModel` would need
      to know about Room if `ItemRepository` didn't exist, and why
      that's a real, structural cost.
- [ ] You can state one concrete, real future change `ItemRepository`
      could absorb without requiring any change to `InventoryViewModel`.
- [ ] Commit: `git commit -m "Add ItemRepository and InventoryViewModel,
      completing the real MVVM boundary"` — explaining the boundary
      being established, not just that two new files exist.

Next: `ViewBinding` — the real, current replacement for
`android-ui-foundations`' own manual `findViewById` calls, wiring
`InventoryActivity` to the `ViewModel` this lesson just built.
