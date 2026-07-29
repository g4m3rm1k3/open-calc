# Lesson 17: `Repository` — Separating *What* From *How*

**What you will build:** No new visible feature. `InventoryViewModel`
currently does two genuinely different jobs in one file: holding
`LiveData` the UI observes and surviving rotation (a real `ViewModel`
job), and knowing the exact `SELECT` string, column order, and
`ContentValues` keys `pocketinventory.db` actually needs (not a
`ViewModel` job at all — nothing about "surviving rotation" requires
knowing SQL). This lesson pulls the second job out into its own class,
`InventoryRepository`, so each class has exactly one reason to change.

**What you need to know first:** Lesson 15 (`InventoryViewModel`,
`AndroidViewModel`, `onCleared`). Lesson 16 (`LiveData`,
`MutableLiveData`). Lesson 12–14 (`DatabaseHelper`, `dbExecutor`, the
raw SQL this lesson relocates unchanged).

**Terms introduced in this lesson:**
- **Repository (pattern)** — a plain class whose only job is knowing
  *how* data is actually stored and retrieved, so everything else in an
  app can ask for data without knowing or caring whether it comes from
  SQLite, a network call, or anywhere else.
- **`Consumer<T>`** (`java.util.function.Consumer`) — a
  single-abstract-method interface, one method, `void accept(T value)`,
  built into the standard Java library — the same functional-interface
  shape as `Runnable` or `Observer<T>`, this time for "hand this value
  to something, once, later."
- **Single Responsibility Principle (reappearing, made concrete)** —
  Lesson 8 named this principle; this lesson is a direct, hands-on
  application of it: one class, one reason to change.
- **`shutdown()` (a plain method, not an override)** — a method
  `InventoryRepository` declares on its own, with nothing above it to
  override, so whoever owns an `InventoryRepository` knows to call it
  explicitly when that repository is no longer needed.

---

## Concept Unit: Two Jobs, One Class

### The Problem

Open `InventoryViewModel.java` as it stands after Lesson 16 and read it
straight through, asking one question of every method: *does this
method need to know anything about `SQLiteDatabase`, `Cursor`, or
`ContentValues` — or does it only need to know about `LiveData` and
whether this `ViewModel` has already loaded once?*

`getItems()`, `loadItemsIfNeeded()`'s own guard check, and `onCleared()`
belong to the second kind — pure "what does the UI, and this
`ViewModel`'s own lifetime, need" logic. `loadItemsFromDatabase()`,
`addItem`'s `ContentValues` construction, and `deleteItem`'s raw
`"id = ?"` clause belong to the first kind entirely — none of it has
anything to do with `LiveData`, rotation, or `onCleared`; all of it
would be identical if this project used a completely different storage
mechanism tomorrow. Nothing in the file today marks where one job ends
and the other begins — they are interleaved, method by method, in the
same class.

### Discard the Throwaway Example

There is no throwaway lab for this unit — the problem is a real
property of a real file already sitting in this project, better shown
by reading it than by building a fresh example to prove the same
point.

### Mechanical Walkthrough

No new code fence to enumerate here — this unit is a reading exercise
over `InventoryViewModel.java` exactly as Lesson 16 left it, not new
syntax. The walkthrough is the sorting itself: `getItems()`,
`loadItemsIfNeeded()`'s `if (itemsLoaded) return;` check, and
`onCleared()` belong to "what does the UI/this object's own lifetime
need"; `loadItemsFromDatabase()`, the `ContentValues` construction
inside `addItem`, and the `"id = ?"` clause inside `deleteItem` belong
to "how is this data actually stored" — the same method-by-method split
named in the Problem above, made explicit rather than left implicit.

### CS Lens

This is exactly the **Single Responsibility Principle** — Lesson 8
named it in passing; this unit is the first time this course has shown
a class with a genuine, concrete SRP violation rather than just
defining the term. Also recognized in: a class that both parses a file
format and renders it to a screen (two reasons to change: the format
changed, or the rendering changed), and any "manager" class whose name
already hints it does more than one thing.

### SE Lens

**Why does mixing these two jobs in one class actually cost anything,
given that the app still works correctly today?** Because "still works"
and "cheap to change" are different questions. If this project's
storage mechanism ever changed — a real, standard later step for a
growing Android app is adopting `Room` (a compile-time-checked
persistence library `track/`'s own Lesson 13 uses, that this course has
deliberately not adopted) — every line that would need to change is
currently scattered through the exact same file as `LiveData` posting
logic that has nothing to do with the change at all, making it harder
to be confident which lines are genuinely storage-related and which
aren't. Separating them costs one extra class and one extra layer of
method calls today, in exchange for a boundary that makes "what would
I need to touch if X changed" a much smaller, more answerable question
later.

---

## Concept Unit: Building `InventoryRepository`

### The Problem

Give the storage-specific half of `InventoryViewModel` its own class,
with no dependency on `LiveData`, `ViewModel`, or anything
Android-lifecycle-related at all.

### Project Change

- **Reference Source:** No reference counterpart — `track/`'s own
  Lesson 17 wraps a `Room` DAO instead of raw `SQLiteDatabase` calls;
  this course's `InventoryRepository` wraps the exact raw SQL Lessons
  12–14 already built and verified, unchanged.
- **Files affected:** new file
  `app/src/main/java/.../InventoryRepository.java`.
- **Change type:** Create.
- **Dependencies:** `DatabaseHelper` (Lesson 12), `Item` (Lesson 7/13).

### The New Code

```java
package com.yourname.pocketinventory;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

public class InventoryRepository {
    private final DatabaseHelper dbHelper;
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();

    public InventoryRepository(Context context) {
        dbHelper = new DatabaseHelper(context);
    }

    public void loadItems(Consumer<List<Item>> onLoaded) {
        dbExecutor.execute(() -> {
            List<Item> loadedItems = new ArrayList<>();
            SQLiteDatabase db = dbHelper.getWritableDatabase();
            Cursor cursor = db.rawQuery("SELECT id, name, quantity, location FROM items", null);
            while (cursor.moveToNext()) {
                int id = cursor.getInt(0);
                String name = cursor.getString(1);
                int quantity = cursor.getInt(2);
                String location = cursor.getString(3);
                loadedItems.add(new Item(id, name, quantity, location));
            }
            cursor.close();
            onLoaded.accept(loadedItems);
        });
    }

    public void addItem(Item item) {
        dbExecutor.execute(() -> {
            ContentValues values = new ContentValues();
            values.put("name", item.getName());
            values.put("quantity", item.getQuantity());
            values.put("location", item.getLocation());
            dbHelper.getWritableDatabase().insert("items", null, values);
        });
    }

    public void deleteItem(Item item) {
        dbExecutor.execute(() ->
                dbHelper.getWritableDatabase().delete("items", "id = ?",
                        new String[]{String.valueOf(item.getId())}));
    }

    public void shutdown() {
        dbExecutor.shutdown();
    }
}
```

### The Updated Project

This is a brand-new file, nothing larger surrounding it — the whole
class is shown above.

### Mechanical Walkthrough

- `public InventoryRepository(Context context)` — reappearing
  (`Context` parameter, Lesson 4), taking the plainer `Context` type
  rather than the more specific `Application` `AndroidViewModel`
  required — `InventoryRepository` is not a `ViewModel` and has no
  requirement to only ever be constructed with an `Application`
  specifically; any `Context` (an `Activity`'s, an `Application`'s) that
  can build a `DatabaseHelper` is enough.
- `public void loadItems(Consumer<List<Item>> onLoaded)` — **first
  appearance of `Consumer<T>`.** A single-abstract-method interface from
  `java.util.function`, one method, `void accept(T value)` — the exact
  same functional-interface shape as `Runnable` (Lesson 14) or
  `Observer<T>` (Lesson 16), specifically built into the standard
  library for "hand this one value to something, once." `onLoaded`
  plays the same role Lesson 15's own `Runnable onLoaded` parameter
  did, just carrying the loaded list as data instead of carrying
  nothing.
- `onLoaded.accept(loadedItems);` — **first appearance.** Calls whatever
  was passed in, handing it `loadedItems` — this runs on `dbExecutor`'s
  background thread, exactly like Lesson 15's `onLoaded.run()` did; this
  class makes no promise about which thread calls it, the same honest
  limitation named there, now the caller's job to handle one layer up.
- `loadItemsFromDatabase()`'s entire body, `addItem`'s `ContentValues`
  construction, and `deleteItem`'s clause — all reappearing (Lessons
  12–14), unchanged in substance, only in which file they live in. Both
  methods' own `item` parameter is also reappearing (effectively final
  lambda capture, Lesson 9): each method's own `dbExecutor.execute(() -> ...)`
  lambda reads `item` without ever reassigning it, the same rule that
  let Lesson 14's insert/delete lambdas read `values`/`removedItem`.
- `public void shutdown()` — **first appearance.** A plain method, not
  an override of anything — `InventoryRepository` is not a `ViewModel`
  and has no `onCleared()` of its own to override; whoever owns an
  `InventoryRepository` is responsible for calling `shutdown()` at the
  right moment, which the next unit wires up explicitly.

### CS Lens

`InventoryRepository` is the **Repository pattern** — a class whose
entire job is abstracting *where* and *how* data actually lives, so
everything above it can ask for data by *what* it is ("the current item
list") without needing to know *how* it's actually fetched. Also
recognized in: any data-access-layer class in a larger server
application, an ORM's own repository/DAO objects, and a caching layer
that sits between "what the app wants" and "where it actually comes
from" (memory, disk, network) transparently.

### SE Lens

**Why not just leave the raw SQL calls inside `InventoryViewModel`, since
this project only has one screen that needs this data anyway?** Because
the cost of *not* separating them is not about how many callers exist
today — it's about how confidently a future change can be made. A
`ViewModel` that also contains raw SQL means every change to either
job — a new `LiveData`-related requirement, or a storage-format change —
risks touching, or at least being reviewed alongside, code that has
nothing to do with it. `InventoryRepository` having genuinely zero
`import` referencing `LiveData`, `ViewModel`, or anything from
`androidx.lifecycle` at all is the concrete, checkable proof that this
separation is real, not just a comment claiming it exists.

---

## Concept Unit: Wiring `InventoryViewModel` to Use `InventoryRepository`

### The Problem

`InventoryRepository` now exists but nothing calls it yet.
`InventoryViewModel` still owns its own `DatabaseHelper` and
`dbExecutor` directly. Replace them.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryViewModel.java`.
- **Change type:** Replace two fields with one; refactor every method
  that previously touched `dbHelper`/`dbExecutor` directly.
- **Dependencies:** `InventoryRepository` (this lesson's previous unit).

### The New Code

Replace the `dbHelper`/`dbExecutor` fields:

```java
private final DatabaseHelper dbHelper;
private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
```

with one:

```java
private final InventoryRepository repository;
```

and its construction:

```java
repository = new InventoryRepository(application);
```

### The Updated Project

```java
public class InventoryViewModel extends AndroidViewModel {
    private final List<Item> items = new ArrayList<>();
    private final MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(items);
    private final InventoryRepository repository;                                     // ← changed (was DatabaseHelper + ExecutorService)
    private boolean itemsLoaded = false;

    public InventoryViewModel(@NonNull Application application) {
        super(application);
        repository = new InventoryRepository(application);                            // ← changed (was new DatabaseHelper(application))
    }

    public LiveData<List<Item>> getItems() {
        return itemsLiveData;
    }

    public void loadItemsIfNeeded() {
        if (itemsLoaded) {
            return;
        }
        itemsLoaded = true;
        repository.loadItems(loadedItems -> {                                         // ← changed (was dbExecutor.execute + loadItemsFromDatabase())
            items.addAll(loadedItems);
            itemsLiveData.postValue(items);
        });
    }

    public void addItem(Item item) {
        repository.addItem(item);                                                     // ← changed (was a direct ContentValues/insert block)
    }

    public void deleteItem(Item item) {
        repository.deleteItem(item);                                                  // ← changed (was a direct delete block)
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        repository.shutdown();                                                        // ← changed (was dbExecutor.shutdown())
    }
}
```

`loadItemsFromDatabase()` itself — the private method — no longer
exists on this class at all; its entire body now lives inside
`InventoryRepository.loadItems(...)`, unchanged.

### Mechanical Walkthrough

- `private final InventoryRepository repository;` — reappearing
  (field), replacing two fields with one — `InventoryViewModel` now
  holds exactly one thing that knows about storage, instead of two.
- `repository = new InventoryRepository(application);` — reappearing
  (constructor call), `application` satisfies `InventoryRepository`'s
  plain `Context` parameter the same way it satisfied
  `DatabaseHelper`'s before.
- `repository.loadItems(loadedItems -> { items.addAll(loadedItems); itemsLiveData.postValue(items); });`
  — reappearing concepts, recombined: the lambda here is exactly the
  `Consumer<List<Item>>` `InventoryRepository.loadItems` expects: its
  parameter, `loadedItems`, is the list `InventoryRepository` built
  internally and handed over; the body is pure `LiveData`/`ViewModel`
  logic (Lesson 16) with zero SQL anywhere in this file anymore.
- `repository.addItem(item)` / `repository.deleteItem(item)` —
  reappearing (delegation, same idea as `loadItems` above), each now a
  single line stating *what* should happen, with *how* it happens
  living entirely in `InventoryRepository`.
- `repository.shutdown();` inside `onCleared()` — reappearing
  (`onCleared`, Lesson 15), now delegating the actual executor shutdown
  to the object that owns the executor, rather than owning it directly.

### CS Lens

`InventoryViewModel` calling `repository.loadItems(...)` instead of
querying `SQLiteDatabase` directly is **dependency on an abstraction,
not a concrete detail** — `InventoryViewModel` now depends on
"something that can load items and hand them to a `Consumer`," not on
`SQLiteDatabase`, `Cursor`, or column indices specifically. Also
recognized in: any class that depends on an interface or a narrower
API surface instead of a concrete implementation's full detail, and the
general software design idea of programming against a stable contract
rather than a volatile implementation.

### SE Lens

**Now that `InventoryRepository` exists, why does `InventoryViewModel`
still own the `LiveData`/guard-flag logic itself, instead of moving
*that* into `InventoryRepository` too?** Because `LiveData` and the
"has this already loaded" guard are both genuinely about *this specific
screen's* relationship to the data — whether it has been fetched yet
for the UI currently showing it, and how to announce a change to
whatever is observing it. `InventoryRepository` deliberately knows
nothing about `LiveData`, guard flags, or being observed at all; it
only knows how to load, add, and delete rows. That is precisely what
makes it reusable if a second screen, later, also needed the same item
list: it would ask the *same* `InventoryRepository` for data, without
inheriting anything about this specific screen's own guard-flag or
`LiveData` bookkeeping, which belongs to `InventoryViewModel` alone.

---

## Connect the Pieces

Full trace: `InventoryViewModel`, before this lesson, held both
`LiveData`/rotation-survival logic *and* the raw SQL knowledge of
exactly how `pocketinventory.db`'s `items` table is shaped — one class,
two unrelated reasons to ever need changing. `InventoryRepository` now
holds every line that has anything to do with `SQLiteDatabase`,
`Cursor`, or `ContentValues`, reachable through three plain methods
(`loadItems`, `addItem`, `deleteItem`) that say *what* is wanted, never
*how* it happens. `InventoryViewModel` calls those three methods and
otherwise only ever touches `LiveData` and its own guard flag — reading
either class today tells you, immediately, which of the two jobs
you're looking at, which was exactly this lesson's opening problem.

## What Breaks Without This

This lesson's fix is architectural, not behavioral — the app's actual
running behavior (load, add, delete) is identical before and after.
Confirm that directly: run the app after this lesson's changes and
verify loading, adding, and deleting items still all work exactly as
they did at the end of Lesson 16, including surviving rotation
correctly. A refactor that changes visible behavior at all has failed,
regardless of how much cleaner the resulting code looks.

## Exercises

1. Search `InventoryViewModel.java` for the string `"SELECT"` and for
   `import android.database`. Confirm neither appears anywhere in the
   file anymore — concrete, checkable proof the separation from this
   lesson's first unit is real, not just claimed.
2. Add a `Log.d` call as the first line inside
   `InventoryRepository.loadItems`'s lambda, and a second one inside
   `InventoryViewModel.loadItemsIfNeeded`'s own lambda passed to it.
   Run the app and confirm, from the real Logcat order, that
   `InventoryRepository`'s line always prints before
   `InventoryViewModel`'s — proof of which object actually calls which.

## Definition of Done

- [ ] `InventoryRepository.java` exists and contains every line that
      touches `SQLiteDatabase`, `Cursor`, or `ContentValues` in this
      project.
- [ ] `InventoryViewModel.java` no longer imports anything from
      `android.database` and no longer has a `DatabaseHelper` or
      `ExecutorService` field of its own.
- [ ] The app's actual behavior (load, add, delete, survive rotation)
      is unchanged, confirmed by running it after this lesson exactly
      as you did at the end of Lesson 16.
- [ ] You can explain, in your own words, what `InventoryRepository`
      would need to know about if this project ever adopted `Room`
      instead of raw `SQLiteDatabase` — and confirm that
      `InventoryViewModel` would need to know nothing about that change
      at all.
- [ ] Commit: message explaining why (e.g. "Extract InventoryRepository
      from InventoryViewModel, so ViewModel-facing state and raw SQL
      storage knowledge are no longer mixed in one class").

Lesson 18 is next: `InventoryActivity` is still one large file doing
everything a single screen needs — `Fragment`, and breaking one screen
apart into independent, reusable pieces.
