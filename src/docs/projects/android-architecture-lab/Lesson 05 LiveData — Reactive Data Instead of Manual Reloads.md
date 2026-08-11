# Lesson 05: `LiveData` — Reactive Data Instead of Manual Reloads

**What you will build:** `ItemDao.getAllItemsOnce()`, renamed and
changed to return `LiveData<List<ItemEntity>>` instead of a plain
`List<ItemEntity>` — and a real observer, watching it, that updates
automatically the instant a new row is inserted, with no explicit
reload call anywhere. The transferable problem:
`android-persistence-lab` Lesson 04's own `getAllItems()` had to be
called again, by hand, after *every single* add, edit, or delete — a
real, easy-to-forget step that series' own Lesson 07 quietly repeated
via `notifyItemChanged` at the `RecyclerView` layer, never fixed at its
actual source.

**What you need to know first:** Lesson 04 (`ItemDao`,
`getAllItemsOnce`, the real main-thread danger). `android-hardware-lab`
Lesson 03 (listener/callback interfaces, the real
register-then-later-unregister discipline) — this lesson's own real
subject is precisely how much of that manual discipline `LiveData`
removes, so having felt it required by hand first matters directly
here.

**Terms introduced in this lesson:**
- **`LiveData<T>`** — a real, observable data holder: something can
  *observe* it and be notified automatically, every time its value
  changes, for as long as the observer is genuinely still alive to
  receive it.
- **`Observer<T>`** — a real, single-method functional interface
  (`android-ui-foundations` Lesson 14's own concept, reappearing) —
  the callback a `LiveData` calls with each new value.
- **`LifecycleOwner`** — a real interface every `AppCompatActivity`
  already implements, letting a `LiveData` know exactly how long an
  observer registered against it should actually stay registered.

**Objects and methods used:**

**`LiveData<T>.observe(LifecycleOwner, Observer<? super T>)`**
- *What it is:* the real method that registers a callback to run every
  time this `LiveData`'s own value changes.
- *Implementation:* `public void observe(@NonNull LifecycleOwner owner,
  @NonNull Observer<? super T> observer)`, real signature confirmed
  this session against Android's own reference documentation. Real,
  documented behavior: registers the observer "within the lifespan of
  the given owner" — Android itself "automatically removes" it "before
  [the] `LifecycleOwner` is destroyed" — and always delivers on the
  main thread.
- *Its use:* called once, inside `InventoryActivity.onCreate`, watching
  `ItemDao.getAllItems()`'s own live result.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`ItemDao` / Room's `@Query`**
  - *What they are:* the real DAO interface and the annotation
    generating its implementation.
  - *Implementation:* given full treatment in Lesson 04.
  - *Their use:* `getAllItemsOnce`'s own return type changes; nothing
    about the real SQL string or the `@Query` mechanism itself changes.

---

## Concept Unit: The Real Manual-Reload Problem, Reproduced

### The Problem

`android-persistence-lab`'s own `InventoryActivity` called
`repository.getAllItems()` exactly once, in `onCreate` — meaning any
change made *after* the screen first loads (an add, an edit) only ever
appeared because that series' own `RecyclerView.Adapter` was told,
separately and manually, exactly what changed (`notifyItemInserted`,
`notifyItemChanged`). Nothing kept the underlying `List` and the real
database automatically in sync — every single write required a human
to remember the matching manual UI update, by hand, every time.

### The Contrast, Named Directly

This is a real, structural gap, not a hypothetical one:
`android-persistence-lab` Lesson 10's own `LowStockNotifier` reads
`item.getQuantity()` from an *already in-memory* object, updated by
hand at the exact call site of the edit — a second real place that
same discipline had to be repeated correctly. Every new feature
touching `items` in that series inherited the same real obligation:
remember to keep the screen's own copy in sync, by hand, forever.

### Mechanical Walkthrough

- `repository.getAllItems()`, called once in `onCreate` — a real,
  one-time snapshot; the returned `List` object itself never changes
  again on its own.
- `items.add(...)` / `notifyItemInserted(...)` — `android-persistence-lab`
  Lesson 04's own manual pairing: the in-memory list and the visible
  grid are kept in sync only because this exact call site remembers to
  update both, by hand, every single time.
- `LowStockNotifier.checkAndNotify(context, item)` (that series' own
  Lesson 10) — reads `item.getQuantity()` directly off the same
  already-mutated, in-memory object `setQuantity` was just called on —
  correct, but only because that one call site was written carefully;
  nothing enforces it structurally.
- No line of code anywhere in that series' own `InventoryActivity` ever
  asks the database "has anything changed" — every real update this
  screen already displays exists purely because a human, at each
  individual call site, remembered to say so.

### SE Lens

**Is this really `android-persistence-lab`'s own mistake, or a genuine
limitation of `SQLiteDatabase`/`Cursor` itself?** The latter: nothing in
raw `SQLiteDatabase` offers any way to be *told* when a table changes —
a `Cursor` is a one-time snapshot of a query's result at the moment it
ran, never updated afterward. The manual-reload discipline that series
required wasn't a missed best practice; it was the honest, correct
response to a real tool with no built-in notification mechanism at all.
`LiveData`, paired with Room specifically, closes that exact gap.

---

## Concept Unit: `LiveData` — a Value That Notifies Its Own Observers

### The Problem

A real fix needs two things raw `Cursor` never had: a way to *hold* a
current value that can change over time, and a way for something else
to be *notified* automatically the moment it does.

### The Contract You're Observing (from `androidx.lifecycle.LiveData`, not your code)

`LiveData`'s real, relevant declared shape — confirmed this session
against Android's own reference documentation:

```java
public void observe(@NonNull LifecycleOwner owner, @NonNull Observer<? super T> observer);
```

Read this precisely: `owner` is what makes this **lifecycle-aware** —
not a detail, this method's own real point. `observer` is a real,
single-method functional interface — `void onChanged(T value)` — called
once immediately with whatever the current value already is (if one
exists), and again, automatically, every single time the value changes
afterward.

### Mechanical Walkthrough

- `LifecycleOwner owner` — real, documented behavior: `LiveData` itself
  tracks this owner's own real lifecycle state, and delivers updates
  *only* while it's genuinely active — an `Activity` currently stopped
  (backgrounded, not destroyed) receives no updates until it resumes,
  avoiding real, wasted work updating a screen nothing can currently
  see.
- The real, documented auto-removal — "before [the] `LifecycleOwner` is
  destroyed" — is this lesson's own direct payoff against
  `android-hardware-lab` Lesson 03's own manual discipline: that
  lesson's real `ClipboardManager` listener required an explicit,
  hand-written `removePrimaryClipChangedListener` call inside
  `onDestroy`, proven necessary with a real, reproduced leak. `observe`
  removes that exact obligation — not by making the underlying leak
  risk disappear by magic, but by handling the correct
  register/unregister pairing *for you*, automatically, tied to the
  same real lifecycle that lesson's own manual code had to track by
  hand.
- The events are delivered on the **main thread**, always — real,
  documented behavior — meaning code inside an `Observer`'s own
  `onChanged` can safely touch a `TextView` or a `RecyclerView`
  directly, with no `runOnUiThread` or background-thread bookkeeping
  needed, unlike this lesson's own Lesson 04 predecessor, which
  required deliberately keeping database work *off* the main thread by
  hand.

### CS Lens

`LiveData` is the **Observer pattern** by its formal name —
`android-hardware-lab` Lesson 03's own real subject, reappearing here
on a real, first-class Android Architecture Component instead of a
hand-built `Publisher` or a real `ClipboardManager` listener. The
underlying shape — a subject holding state, notifying registered
observers when it changes — is identical; what's different is that
`LiveData` additionally understands *when* an observer should stop
listening, automatically, using real lifecycle information a plain
callback interface has no access to at all.

### SE Lens

**Why does `LiveData` need to know about a `LifecycleOwner` at all — why
not just a plain `Observer`, the way `android-hardware-lab`'s own
`ClipboardManager` listener worked?** A plain listener, registered with
no lifecycle awareness, keeps running — and keeps being called — for as
long as *something* holds a reference to it, exactly the real leak risk
`android-hardware-lab` Lesson 03 demonstrated directly. `LiveData`'s own
real innovation is folding the correct lifecycle-tracking logic *into
the observing mechanism itself*, so every caller gets it correctly, by
construction, rather than needing to reimplement the same
register-then-remember-to-unregister discipline by hand, correctly,
every single time.

---

## Concept Unit: Making `ItemDao` Reactive

### The Problem

With `LiveData`'s real contract understood, `ItemDao.getAllItemsOnce()`
can become genuinely reactive — automatically re-running and
re-notifying, not just callable once.

### Project Change

- **Reference Source:** Room's own real, documented support for
  returning `LiveData` directly from a `@Query` method, confirmed this
  session: Room automatically runs the query on a background thread and
  delivers results via `LiveData`, requiring no manual threading at all.
- **Files affected:** `ItemDao.java`; `InventoryActivity.java`.
- **Change type:** Change one method's return type; add a real observer.
- **Dependencies:** None new.

### The New Code

`ItemDao.java`, the changed method:

```java
@Query("SELECT * FROM items ORDER BY name ASC")
LiveData<List<ItemEntity>> getAllItems();
```

`InventoryActivity.java`, inside `onCreate`:

```java
AppDatabase.getInstance(this).itemDao().getAllItems()
    .observe(this, items -> {
        // real, automatic update — runs once immediately, and again
        // every time the underlying table genuinely changes
    });
```

### Mechanical Walkthrough

- `LiveData<List<ItemEntity>> getAllItems();` — **first appearance of a
  reactive DAO method.** No method body — same real, `abstract`-style
  interface declaration as Lesson 04's own `getAllItemsOnce`; only the
  *return type* changed. Room's own generated implementation now
  additionally tracks `items`' real table for changes and automatically
  re-runs this exact query whenever a write — through *any* real DAO
  method touching `items`, not only this one — genuinely happens.
- `AppDatabase.getInstance(this).itemDao().getAllItems().observe(this, items -> {...})`
  — **first appearance of a real observer registration.** `this` (the
  first argument) is `InventoryActivity` itself, acting as the real
  `LifecycleOwner` this lesson's own Concept Unit already proved every
  `AppCompatActivity` genuinely is; `items -> {...}` is a lambda
  implementing `Observer`'s own single method
  (`android-ui-foundations` Lesson 14's own mechanism, reappearing).
  Called once immediately, with whatever `items` this table currently
  holds — including a genuinely empty list on a brand-new install, no
  special-casing required — and automatically again, every real time
  afterward the table's own contents change.
- No explicit `Executor`, no manual background thread anywhere in this
  code — Room's own real, documented `LiveData` support already runs
  the query safely off the main thread and delivers the result back on
  it, the exact real main-thread danger Lesson 04 had to guard against
  by hand for `getAllItemsOnce`.

### Run It Yourself

Genuinely Android-only behavior — no plain-JVM equivalent proves it.
With this lesson's own observer registered and the app running,
temporarily call `AppDatabase.getInstance(this).itemDao().insert(new
ItemEntity())` (any real values) from a background thread, a few
seconds after the screen opens — a temporary `Handler.postDelayed`, or
a button tap, either proves it. Real, observed result: the registered
`Observer`'s own lambda runs **again**, automatically, with the
complete, updated list — including the just-inserted row — with no
explicit reload call anywhere in this project's own code.

### CS Lens

Room automatically re-running a `LiveData`-backed query whenever any
write touches the same table is **invalidation tracking**: Room
maintains real, internal bookkeeping of which tables a given
`LiveData`-backed query actually reads from, and re-runs exactly the
queries that could genuinely be affected, whenever a real write to one
of those tables happens — through any DAO method, anywhere in the
project, not only the one that originally built the `LiveData`.

### SE Lens

**Does this mean `getAllItemsOnce()` — the plain, non-`LiveData`
version from Lesson 04 — is now obsolete, and should always be replaced
with a `LiveData`-returning version?** No — a real, one-shot check
(confirming a specific row exists before performing some other action,
say) still has real, legitimate uses for a plain, synchronous return
value, deliberately run off the main thread once and never again. This
lesson's own real point is narrower and more specific: *continuously
displayed* data — a grid the user is actively looking at, expecting it
to reflect reality — is exactly the case `LiveData` is built for, and a
one-shot method has no natural way to update a screen it was never
watching in the first place.

---

## Connect the Pieces

One trace: `ItemDao.getAllItems()` now returns `LiveData<List<ItemEntity>>`
instead of a plain, one-time list. `InventoryActivity` registers a real
observer against it, once, in `onCreate` — tied to its own real
`LifecycleOwner` identity, automatically cleaned up when the screen is
genuinely destroyed, the exact manual discipline
`android-hardware-lab` Lesson 03 required by hand, now handled
automatically. Any real write to `items` — through any DAO method,
anywhere — triggers Room's own real invalidation tracking, which
re-runs this exact query and delivers the updated list straight to the
registered observer, on the main thread, safely. The manual-reload
discipline `android-persistence-lab` needed everywhere `items` could
change is gone — not worked around, structurally eliminated.

## What Breaks Without This

Temporarily revert `getAllItems()` to Lesson 04's own
`getAllItemsOnce()` — a plain `List<ItemEntity>`, called once, in
`onCreate`, with no observer at all. Insert a new row the same way this
lesson's own "Run It Yourself" already did. Real, observed result: the
screen's own displayed list — whatever was captured at the one moment
`onCreate` ran — does not change at all, correctly reproducing
`android-persistence-lab`'s own real limitation this lesson exists to
fix. Restore the `LiveData`-returning version before moving on.

## Exercises

1. Register a *second*, independent observer against the same
   `getAllItems()` call, logging the list's own size via `Log.d`.
   Insert a row and confirm both observers fire, independently, with
   the identical updated data — direct proof `LiveData` supports more
   than one real observer at once, each notified separately.
2. Navigate away from `InventoryActivity` entirely (press back), then
   insert a row directly through a temporary debug call. Relaunch
   `InventoryActivity` and confirm the new row appears immediately,
   with no crash and no stale data — direct, observed proof of this
   lesson's own real "automatically removed before the `LifecycleOwner`
   is destroyed" behavior working correctly across a real destroy/
   recreate cycle.
3. Explain, in your own words, why `observe`'s callback is guaranteed
   to run on the main thread even though the underlying `SELECT`
   itself runs on a background thread — tying your answer back to this
   lesson's own quoted, real `observe` contract.

## Definition of Done

- [ ] `ItemDao.getAllItems()` returns `LiveData<List<ItemEntity>>`, and
      `InventoryActivity` observes it instead of calling a one-shot
      method.
- [ ] You inserted a row while the screen was open and watched it
      appear automatically, with no explicit reload call anywhere.
- [ ] You can explain, precisely, what real manual discipline
      `android-hardware-lab` Lesson 03 required that `LiveData`'s own
      `observe` method now handles automatically.
- [ ] You can state one real, legitimate case where a plain, one-shot
      DAO method (like Lesson 04's own `getAllItemsOnce`) is still the
      correct choice over a `LiveData`-returning one.
- [ ] Commit: `git commit -m "Make the item list reactive with LiveData,
      removing manual reload calls"` — explaining what became
      automatic, not just that a return type changed.

Next: `Repository` — the real, deliberate architectural boundary
between this `LiveData`-returning `Dao` and the `ViewModel` that will
actually expose it to the screen.
