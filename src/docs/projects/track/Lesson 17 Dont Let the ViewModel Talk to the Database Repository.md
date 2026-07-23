# Lesson 17: Don't Let the ViewModel Talk to the Database — the Repository Pattern

**What you will build:** A new `ItemRepository` class sits between
`InventoryViewModel` and `ItemDao`, taking over every piece of database
access and `LiveData` management `InventoryViewModel` currently owns —
the `ViewModel` shrinks to a thin pass-through. The transferable
problem: `InventoryViewModel` currently knows, directly, that its data
comes from Room specifically (`AppDatabase.getInstance(application).itemDao()`).
That's fine today, with one data source. It stops being fine the moment
this app needs a second one — Lesson 28 adds a remote server sync, and
without a seam between "what the UI needs" and "where data actually
comes from," that change would mean rewriting the `ViewModel` itself,
mixing UI-facing state management with data-source plumbing in the same
class.

**What you need to know first:** Lesson 13 (`ItemDao`, `AppDatabase`),
Lesson 15 (`AndroidViewModel`, why it can't hold a `Context` unsafely),
Lesson 16 (`MutableLiveData`, `postValue`, the executor-and-LiveData
pattern currently living in `InventoryViewModel`).

---

## Concept Unit: A ViewModel That Knows Too Much

### The Problem

Open `InventoryViewModel.java` as it stands after Lesson 16: it
constructs `ItemDao` directly from `AppDatabase`, owns its own
`dbExecutor`, and contains every line of logic for turning a database
read into a `LiveData` update. None of that is *wrong*, exactly — it
works, and it's honestly what most of this curriculum's earlier
lessons would have called "good enough for now." But trace what would
happen if Lesson 28's server sync needed to merge locally-saved items
with ones fetched over the network: that logic would have nowhere to
live except inside `InventoryViewModel` itself, growing a class whose
name and purpose (Lesson 15: "state that survives rotation, exposed to
the UI") never mentioned "also orchestrate multiple data sources."

### The Concept, in Prose

The **Repository pattern** names a specific, narrow job: one class,
responsible *only* for "get me the data, from wherever it actually
lives, and hand back a single, unified answer" — hiding the source
(one database, several databases, a network call, a cache, any
combination) behind one small, stable interface. A `ViewModel` talks
to a Repository; a Repository talks to a `Dao` (and, later, a network
client); a `Dao` talks to SQL. Each layer only knows about the layer
directly below it, never further down.

No isolated lab is needed here — this is a structural, whole-class
reorganization, not a new language construct; the "New Code" below
*is* the concept, applied directly.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file
  `app/src/main/java/.../ItemRepository.java`; `InventoryViewModel.java`
  (shrinks significantly).
- **Change type:** Create, then refactor.
- **Dependencies:** `ItemDao`, `AppDatabase` (Lesson 13).

### The New Code — the Repository

```java
package com.yourname.pocketinventory;

import android.app.Application;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ItemRepository {
    private final ItemDao itemDao;
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
    private final MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(new ArrayList<>());
    private boolean loaded = false;

    ItemRepository(Application application) {
        itemDao = AppDatabase.getInstance(application).itemDao();
    }

    LiveData<List<Item>> getItems() {
        return itemsLiveData;
    }

    void loadItems() {
        if (loaded) return;
        dbExecutor.execute(() -> {
            List<Item> loadedItems = itemDao.getAll();
            loaded = true;
            itemsLiveData.postValue(loadedItems);
        });
    }

    void addItem(Item item) {
        dbExecutor.execute(() -> {
            long id = itemDao.insert(item);
            item.setId(id);
            List<Item> current = new ArrayList<>(itemsLiveData.getValue());
            current.add(item);
            itemsLiveData.postValue(current);
        });
    }
}
```

### The Updated Project

This is a whole new file — nothing surrounding it yet. Read it against
`InventoryViewModel` as it existed at the end of Lesson 16: this class
is, field-for-field and method-for-method, an exact copy of the data-
access logic that used to live directly on the `ViewModel` — nothing
here is conceptually new syntax; every piece (`MutableLiveData`,
`dbExecutor.execute`, `postValue`, the `loaded` guard) is **reappearing**
from Lesson 13–16, relocated wholesale into its own class.

### Mechanical Walkthrough

- `class ItemRepository` — a plain class, not extending anything —
  **first appearance of this specific shape** in this project's
  architecture: unlike `AndroidViewModel` (Lesson 15) or `RecyclerView.Adapter`
  (Lesson 6), a Repository has no required Android base class or
  framework contract to fulfill — it's a design pattern (a convention
  this project is choosing to follow), not something the framework
  recognizes or specially manages the way it does `ViewModel`.
- `ItemRepository(Application application)` — reappearing (constructor,
  Lesson 6), same `Application` context reasoning as Lesson 15's
  `AndroidViewModel`: a Repository, like a `ViewModel`, should outlive
  any single Activity, so it must never hold an Activity-scoped context.
- Every other line — `itemDao`, `dbExecutor`, `itemsLiveData`, `loaded`,
  `getItems()`, `loadItems()`, `addItem()` — **reappearing**, verbatim,
  from Lesson 13–16's `InventoryViewModel`.

### The New Code — the ViewModel, Reduced

```java
public class InventoryViewModel extends AndroidViewModel {
    private final ItemRepository repository;

    public InventoryViewModel(@NonNull Application application) {
        super(application);
        repository = new ItemRepository(application);
    }

    LiveData<List<Item>> getItems() {
        return repository.getItems();
    }

    void loadItems() {
        repository.loadItems();
    }

    void addItem(Item item) {
        repository.addItem(item);
    }
}
```

### The Updated Project

```java
package com.yourname.pocketinventory;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import java.util.List;

public class InventoryViewModel extends AndroidViewModel {
    private final ItemRepository repository;                                        // ← changed (was ItemDao + dbExecutor + LiveData + loaded, all removed)

    public InventoryViewModel(@NonNull Application application) {
        super(application);
        repository = new ItemRepository(application);                                // ← changed
    }

    LiveData<List<Item>> getItems() {
        return repository.getItems();                                                // ← changed (was returning its own field)
    }

    void loadItems() {
        repository.loadItems();                                                      // ← changed (was its own dbExecutor logic)
    }

    void addItem(Item item) {
        repository.addItem(item);                                                    // ← changed
    }
}
```

`InventoryViewModel` no longer imports `ItemDao`, `ExecutorService`, or
`AppDatabase` at all — every method it exposes is now a single-line
delegation to `repository`, and the class as a whole has shrunk from
"owns and manages data access" to "provides UI-scoped access to data
someone else manages" — the actual, structural realization of the
Repository pattern's promise.

### Mechanical Walkthrough

- `private final ItemRepository repository;` — reappearing (field,
  constructor-assigned, `final`) new type, replacing four separate
  fields (`itemDao`, `dbExecutor`, `itemsLiveData`, `loaded`) with one.
- `repository = new ItemRepository(application);` — reappearing
  (constructor call).
- `getItems()`, `loadItems()`, `addItem(item)` — every method body is
  now exactly one line, calling the matching method on `repository` —
  worth naming plainly as **delegation**: this class does none of the
  real work itself anymore, only forwards the call to the object that
  does.

### Run It

Run the app exactly as before — nothing about its visible behavior
changes at all. This is deliberate and worth sitting with: a whole
architectural layer was inserted, and the app's *behavior* is
identical, because `InventoryActivity` never talked to `ItemDao` or
`AppDatabase` directly in the first place — only `InventoryViewModel`
did, and only `InventoryViewModel`'s *internals* changed.

### CS Lens

This is **layered architecture with a strict, one-directional
dependency rule**: Activity depends on ViewModel, ViewModel depends on
Repository, Repository depends on Dao — each layer only ever calls
downward, never sideways or back up, and no layer skips one to reach
directly into a lower one (the Activity, notably, still has never once
imported `ItemDao` or `AppDatabase` in this entire project). Also
recognized in: the OSI network stack (each layer only talks to the one
directly below it), a web app's controller → service → data-access
layering, and operating system driver stacks where a filesystem never
talks to raw disk sectors directly, only through a block-device layer.

### SE Lens

**Why introduce an entire extra class that, today, does nothing but
forward calls — isn't that pure ceremony for a feature that doesn't
exist yet (network sync isn't built until Lesson 28)?** This is a real,
fair tension, worth naming honestly rather than hand-waved: the
Repository pattern is a bet on a *specific*, foreseeable future need —
this project already knows, from its own roadmap, that a second data
source is coming. Introducing the seam now, while it costs nothing
functionally, means Lesson 28's actual feature work only touches
`ItemRepository`, never `InventoryViewModel` or `InventoryActivity` —
the same "add capability without modifying working, unrelated code"
idea the Open/Closed Principle names. The honest cost, paid today: one
extra file, one extra layer of indirection to mentally trace through
when reading how data flows — real, and only worth it because a
concrete second data source is already on this project's roadmap, not
because "you might need it someday" is reason enough on its own to add
a layer to every project reflexively.

---

## Connect the Pieces

Full trace, contrasted directly against Lesson 16's version: previously,
`InventoryActivity` called `viewModel.loadItems()`, and
`InventoryViewModel` itself ran the query and updated its own
`itemsLiveData`. Now, `InventoryActivity`'s call is unchanged —
`viewModel.loadItems()` — but that call immediately forwards to
`repository.loadItems()`, and every piece of real work (the
`dbExecutor` submission, `itemDao.getAll()`, the `loaded` guard, the
`postValue` call) happens inside `ItemRepository`, a class
`InventoryActivity` has never heard of and never will need to. The
observable behavior — the list loads, items get added, rotation
doesn't re-query — is identical to Lesson 16's; only *which class is
responsible for making it happen* changed.

## What Breaks Without This

There's no runtime failure to trigger here — this lesson is a pure
refactor with no new failure mode of its own. Instead, confirm the
separation is real: open `InventoryActivity.java` and search it for the
string `"ItemDao"` or `"AppDatabase"`. Neither should appear anywhere —
if either does, the Repository layer isn't actually doing its job of
hiding the data source, and the dependency rule from the CS Lens has
been silently violated somewhere.

## Exercises

1. Add a `deleteItem(Item item)` method to `ItemDao` (`@Delete`, Lesson
   13), then to `ItemRepository` (following `addItem`'s exact shape:
   submit to `dbExecutor`, mutate a copied list, `postValue` the
   result), then to `InventoryViewModel` (one-line delegation). Notice
   that three files changed, each by exactly the amount its layer
   requires — no more, no less.
2. Temporarily make `InventoryActivity` call
   `AppDatabase.getInstance(this).itemDao().getAll()` directly,
   bypassing both `InventoryViewModel` and `ItemRepository` entirely,
   just to see it compile (Java's `public`/package-private access rules
   don't actually forbid this, since everything's in the same package —
   the layering is a *convention* this project follows, not something
   the compiler enforces). Revert it, and consider for yourself: what
   would have to change about these classes' access modifiers to make
   the layering a compiler-enforced rule rather than a discipline you
   have to maintain by hand?

## Definition of Done

- [ ] `ItemRepository` exists and owns every piece of database access
      and `LiveData` state that used to live on `InventoryViewModel`.
- [ ] `InventoryViewModel` no longer imports `ItemDao` or `AppDatabase`
      anywhere.
- [ ] The app's visible behavior is unchanged from the end of Lesson
      16 — you confirmed this by actually running it, not just reading
      the diff.
- [ ] You can explain, in your own words, what specific future change
      (Lesson 28) this refactor is preparing for, and why doing it now
      costs less than doing it later.
- [ ] Commit: message explaining why (e.g. "Extract ItemRepository to
      own all database access, so InventoryViewModel depends on a
      stable data-access seam instead of Room specifically, ahead of
      Lesson 28's remote sync").

Lesson 18 is next: every screen in this project so far has been a
whole Activity — `Fragment`, and why a real app doesn't give every
single reusable piece of UI its own Activity and Manifest entry.
