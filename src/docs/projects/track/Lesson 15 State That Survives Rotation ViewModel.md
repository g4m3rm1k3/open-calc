# Lesson 15: State That Survives Rotation — ViewModel

**What you will build:** `InventoryActivity`'s item list and database
access move out of the Activity entirely, into a new `InventoryViewModel`
that survives rotation without re-querying the database every time. The
transferable problem: Lesson 5 solved rotation for one `int`
(`tapCount`) by hand, via `onSaveInstanceState`. That doesn't scale —
`items`, `adapter`, `itemDao`, and `dbExecutor` are all still plain
fields on `InventoryActivity`, meaning every rotation destroys and
rebuilds all of it, including a full, wasteful re-query of the
database, and creates a real risk of leaking a destroyed Activity if a
background task outlives it. `ViewModel` is Jetpack's purpose-built
answer: an object explicitly designed to outlive Activity recreation,
so your data survives configuration changes structurally, not through
a hand-written rescue per field.

**What you need to know first:** Lesson 5 (rotation destroys and
recreates Activities; `onSaveInstanceState`'s real limits), Lesson 13
(`itemDao`, `dbExecutor`, loading and inserting `Item`s), Lesson 14
(why background work must never hold a stale reference to a destroyed
Activity).

---

## Concept Unit: Rotation Still Re-Queries the Database, Every Time

### The Problem

Since Lesson 13, `InventoryActivity.onCreate` calls
`dbExecutor.execute(() -> { itemDao.getAll(); ... })` on every single
run — and `onCreate` runs again on every rotation (Lesson 5). Prove
this is happening more than you'd want.

### Introduce the Concept in Isolation

No throwaway lab needed — this is directly observable in the real
project with a tool already taught. Temporarily add one line at the top
of the `dbExecutor.execute` block that loads items in `onCreate`:

```java
android.util.Log.d("ViewModelDemo", "Querying database for items");
```

Run the app, then rotate the emulator three or four times in a row.
Logcat shows `"Querying database for items"` once per rotation — a
real disk-backed database query, rerun every single time, even though
the underlying data hasn't changed at all since the last query. Beyond
the wasted work, there's a subtler risk: if a rotation happens *while*
a `dbExecutor` task from the *old* Activity instance is still running,
that task's lambda still holds a reference to the old, now-destroyed
`InventoryActivity` (through its captured `items`/`adapter` fields) —
the garbage collector can't reclaim that destroyed Activity until the
background task finishes and releases it, a real, if narrow, memory
leak window.

Delete the temporary log line — the fix, not another log statement, is
what the rest of this lesson builds.

### CS Lens

Redoing identical work on every recreation instead of caching the
result across it is a missed opportunity for **memoization at the
lifecycle level** — the same "don't repeat expensive work you've
already done" idea as Lesson 6's ViewHolder caching `findViewById`
results, just scoped to an entire screen's data instead of one row's
view lookups.

---

## Concept Unit: `ViewModel` — an Object Scoped to Outlive the Activity

### Commands Needed

Open `app/build.gradle` and add, inside `dependencies { }`:

```gradle
implementation 'androidx.lifecycle:lifecycle-viewmodel:2.7.0'
```

Click **Sync Now**, same as every prior dependency addition.

### The Concept, Briefly

A `ViewModel` is a class the Jetpack framework manages specially: when
you ask for one through a `ViewModelProvider` (built in the next unit),
the framework checks whether an instance already exists for the
requesting screen and, if so, hands you back **that exact same object**
instead of constructing a new one — even after the Activity that
originally requested it has been destroyed and recreated by rotation.
The `ViewModel` instance itself is kept alive in a separate store the
framework manages, tied to the *logical* screen (surviving
configuration changes) rather than the *physical* Activity object
(destroyed and rebuilt on every rotation, per Lesson 5) — genuinely
new state-management shape, not just a renamed field.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file
  `app/src/main/java/.../InventoryViewModel.java`.
- **Change type:** Create.
- **Dependencies:** `Item`, `ItemDao`, `AppDatabase` (Lesson 13).

### The New Code

```java
package com.yourname.pocketinventory;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class InventoryViewModel extends AndroidViewModel {
    private final ItemDao itemDao;
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
    private final List<Item> items = new ArrayList<>();
    private boolean loaded = false;

    public InventoryViewModel(@NonNull Application application) {
        super(application);
        itemDao = AppDatabase.getInstance(application).itemDao();
    }

    List<Item> getItems() {
        return items;
    }

    boolean isLoaded() {
        return loaded;
    }
}
```

### The Updated Project

This is the whole new file — a brand-new class with nothing surrounding
it yet.

### Mechanical Walkthrough
- `extends AndroidViewModel` — **first appearance.** A specific
  `ViewModel` subclass that accepts an `Application` (rather than plain
- `ViewModel`, which accepts no context at all) — needed here because
  `AppDatabase.getInstance` requires a `Context`, and an `Application`
  context (Lesson 13's `getApplicationContext()`) is exactly the kind
  of long-lived context safe to hold in an object that deliberately
  outlives any single Activity — holding an *Activity* context here
  instead would recreate the same leak risk this whole lesson exists to
  remove.
- `private final ItemDao itemDao;`, `dbExecutor`, `items` — all
  reappearing (fields, Lesson 13), now living on the `ViewModel`
  instead of the Activity.
- `private boolean loaded = false;` — **first appearance of this
  specific flag.** Tracks whether `items` has already been populated
  from the database at least once — the actual mechanism, built out
  next unit, that prevents the wasteful repeat query proven in the
  first Concept Unit.
- `public InventoryViewModel(@NonNull Application application)` —
  **first appearance of this exact constructor shape**, required by
- `AndroidViewModel`'s contract — the framework calls this specific
  constructor when it needs to create a new instance (only once per
  logical screen, never again after rotation, which is the entire
  point).
- `super(application)` — reappearing (parent constructor call, Lesson
  2/6), required so `AndroidViewModel`'s own internals can later
  provide `getApplication()` if needed.
- `getItems()` / `isLoaded()` — reappearing (getter pattern, Lesson 7),
  package-private (no modifier) rather than `public`, the same
  tightly-coupled-helper reasoning as `InventoryViewHolder`'s fields in
- Lesson 6 — only `InventoryActivity`, in the same package, needs
  these.

### CS Lens

`ViewModel`'s framework-managed retention across Activity recreation is
a concrete instance of **separating an object's lifecycle from the
lifecycle of whatever currently references it** — the data outlives
any one particular "holder" of it. Also recognized in: a web
application's server-side session object outliving any single HTTP
request/response cycle, a database connection pool outliving individual
query requests, and reference-counted resources in general that persist
as long as *something* needs them, independent of which specific caller
currently holds a reference.

### SE Lens

**Why does `ViewModel` require going through a special framework-
managed retrieval instead of the Activity just constructing one
directly with `new InventoryViewModel(this)`?** Constructing it
directly would produce a brand-new object every single time
`onCreate` runs — exactly what happens today, and exactly the problem
this lesson exists to fix. The framework has to be the one holding the
real, retained instance, in a store tied to something that survives
configuration changes even though the Activity object itself doesn't —
which is precisely what the next Concept Unit's `ViewModelProvider`
does. The cost: a `ViewModel` cannot safely hold a reference to the
Activity or any View directly (they get destroyed and recreated
independently of it), which is why this class only ever touches data
(`items`, `itemDao`) and never touches `R.id.anything` or any UI object.

---

## Concept Unit: `ViewModelProvider` — Retrieving the Retained Instance

### The Problem

`InventoryViewModel` exists but nothing yet obtains one from
`InventoryActivity`, and nothing populates `items` from the database.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Modify — remove `items`, `itemDao`, `dbExecutor` as
  Activity fields; replace with a `ViewModel` reference.
- **Dependencies:** `InventoryViewModel`, built above.

### The New Code

```java
private InventoryViewModel viewModel;
```

```java
viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);

adapter = new InventoryAdapter(viewModel.getItems(), item -> {
    Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
    intent.putExtra("EXTRA_ITEM", item);
    startActivity(intent);
});
recyclerView.setAdapter(adapter);

if (!viewModel.isLoaded()) {
    viewModel.loadItems(() -> runOnUiThread(() -> adapter.notifyDataSetChanged()));
} else {
    adapter.notifyDataSetChanged();
}
```

And back in `InventoryViewModel.java`, the loading method this calls:

```java
void loadItems(Runnable onLoaded) {
    dbExecutor.execute(() -> {
        items.clear();
        items.addAll(itemDao.getAll());
        loaded = true;
        onLoaded.run();
    });
}
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    private InventoryViewModel viewModel;                                              // ← changed (was items/itemDao/dbExecutor fields)
    private InventoryAdapter adapter;

    private ActivityResultLauncher<Intent> addItemLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
            Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
            if (newItem != null) {
                viewModel.addItem(newItem, () -> runOnUiThread(() ->                     // ← changed
                        adapter.notifyItemInserted(viewModel.getItems().size() - 1)));    // ← changed
            }
        }
    });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);           // ← new

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(viewModel.getItems(), item -> {                   // ← changed
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        if (!viewModel.isLoaded()) {                                                     // ← new
            viewModel.loadItems(() -> runOnUiThread(() -> adapter.notifyDataSetChanged())); // ← new
        } else {                                                                          // ← new
            adapter.notifyDataSetChanged();                                              // ← new
        }                                                                                  // ← new

        Button settingsButton = findViewById(R.id.settingsButton);
        settingsButton.setOnClickListener(v ->
                startActivity(new Intent(InventoryActivity.this, SettingsActivity.class)));

        Button addButton = findViewById(R.id.addItemButton);
        addButton.setOnClickListener(v ->
                addItemLauncher.launch(new Intent(InventoryActivity.this, AddItemActivity.class)));
    }

    @Override
    protected void onResume() {
        super.onResume();
        SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE);
        int threshold = prefs.getInt("low_stock_threshold", 5);
        adapter.setLowStockThreshold(threshold);
    }
}
```

(`InventoryViewModel` also gains an `addItem` method, the same shape as
`loadItems`:)

```java
void addItem(Item item, Runnable onInserted) {
    dbExecutor.execute(() -> {
        long id = itemDao.insert(item);
        item.setId(id);
        items.add(item);
        onInserted.run();
    });
}
```

`onCreate` now creates or retrieves the *same* `InventoryViewModel`
across every recreation, builds the Adapter directly against
`viewModel.getItems()` (the exact same `List<Item>` object every time,
post-rotation included), and only actually re-queries the database the
very first time, guarded by `isLoaded()` — the direct fix for the
wasted query proven at the start of this lesson.

### Mechanical Walkthrough
- `new ViewModelProvider(this)` — **first appearance.** `this` here is
  the Activity, acting as the **ViewModelStoreOwner** — the framework
  uses it to find (or create, the first time) the retained store this
  screen's `ViewModel`s live in. Critically, this store is tied to the
  Activity's *logical* identity across recreation, not the specific
  destroyed-and-rebuilt object instance — the mechanism this whole
  lesson has been building toward.
- `.get(InventoryViewModel.class)` — **first appearance.** Asks for a
  `ViewModel` of this specific type: the *first* time this is called
  for a given screen, the framework constructs a new one (calling the
  constructor built in the previous unit); every subsequent call —
  including the one inside a freshly recreated `onCreate` after
  rotation — returns the exact same object, unconstructed again.
- `adapter = new InventoryAdapter(viewModel.getItems(), ...)` —
  reappearing (constructor call, Lesson 6), critical detail: the
  `List<Item>` handed to the Adapter is now **owned by the ViewModel**,
  not the Activity — after rotation, a brand-new Adapter is still built
  (Adapters aren't retained the way `ViewModel`s are, and don't need to
  be — they're cheap to recreate), but it's built pointing at the same,
  already-populated list.
- `viewModel.isLoaded()` — reappearing (getter, this lesson), the real
  payoff: `false` only on the very first `onCreate` for this screen's
  lifetime; `true` on every subsequent one, including every rotation.
- `viewModel.loadItems(() -> runOnUiThread(() -> adapter.notifyDataSetChanged()))`
- — reappearing pattern (`Runnable` callback, this lesson's first unit;
  `runOnUiThread`, Lesson 13/14), new shape: the `ViewModel`'s method
  itself takes a `Runnable` to run when loading finishes, rather than
- the Activity directly calling `dbExecutor`/`runOnUiThread` itself —
  this is what lets `dbExecutor` move entirely into the `ViewModel`,
  out of the Activity, matching the SE Lens's "ViewModel never touches
  UI directly" rule: the `ViewModel` runs the callback it was *given*,
  without knowing or caring that it happens to call `runOnUiThread`
  internally.
- `viewModel.addItem(newItem, () -> runOnUiThread(...))` — same shape,
  applied to insertion instead of loading.

### Run It

Run the app, add temporarily the same `Log.d` from the first Concept
Unit back inside `InventoryViewModel.loadItems`. Rotate the emulator
several times: the log line now prints **once**, on first launch only
— rotating no longer triggers a single additional database query,
proving the fix. Remove the temporary log line afterward (it's fine to
leave a permanent one if you find it useful, but it isn't required by
this project going forward).

### CS Lens

Retrieving the same cached object on every request instead of
reconstructing it, keyed by an owner that outlives the specific
requesting object, is the general shape of a **lifecycle-scoped cache**
— conceptually adjacent to `AppDatabase`'s own Singleton pattern
(Lesson 13), but scoped to "one logical screen" instead of "the whole
app," and managed entirely by the framework rather than a hand-written
`if (instance == null)` check.

### SE Lens

**Why didn't this lesson just keep using `onSaveInstanceState`
(Lesson 5) for the whole `items` list instead of introducing a new
framework class?** Lesson 5's own SE Lens already flagged the real
limit directly: `Bundle` is meant for small, transient state and can
throw `TransactionTooLargeException` for anything substantial — a
growing inventory list, potentially hundreds of `Item`s, is exactly the
kind of payload that limit exists to warn against. `ViewModel` sidesteps
the size question entirely because nothing is ever serialized into a
`Bundle` at all — the *same in-memory object* survives, full stop,
which is a fundamentally different mechanism from "save small data,
reconstruct on the other side" (Lesson 5's real, still-valid job for
things like `tapCount`, still true today) versus "keep the object
alive, actually don't destroy the data at all" (`ViewModel`'s job,
scoped specifically to configuration changes — a genuine process death,
covered honestly back in Lesson 11, still loses a `ViewModel` too;
only real persistence, Lesson 13's Room, survives that).

---

## Connect the Pieces

Full trace: `InventoryActivity.onCreate` asks its `ViewModelProvider`
for an `InventoryViewModel` → the very first time, the framework
constructs one, which immediately builds its own `ItemDao` from
`AppDatabase.getInstance` (Lesson 13's Singleton, reused) → `onCreate`
checks `isLoaded()`, finds `false`, and calls `loadItems`, which runs
`itemDao.getAll()` on the `ViewModel`'s own `dbExecutor` (Lesson 14's
pooled background thread) and flips `loaded` to `true` before invoking
the given callback, which posts back to the main thread via
`runOnUiThread` to refresh the Adapter → the user rotates the device →
the Activity object is destroyed and rebuilt (Lesson 5's mechanism,
still true) → `onCreate` runs again, asks the same
`ViewModelProvider(this).get(InventoryViewModel.class)` → the framework
hands back the **same** `InventoryViewModel` instance, `items` already
populated, `isLoaded()` now `true` → the database is never re-queried,
and the new Adapter is built pointing at data that was never actually
lost.

## What Breaks Without This

Temporarily change `new ViewModelProvider(this).get(InventoryViewModel.class)`
to `new InventoryViewModel(getApplication())` — constructing it
directly instead of going through the provider. Rotate the emulator a
few times with the `loadItems` log line restored: it prints on *every*
rotation again, proving direct construction defeats the entire
mechanism — a brand-new, never-loaded `InventoryViewModel` is built
every time, exactly like a plain field would be. Restore the
`ViewModelProvider` version afterward.

## Exercises

1. Add a `Log.d` inside `InventoryViewModel`'s constructor itself
   (`"InventoryViewModel constructed"`). Rotate several times and
   confirm it logs exactly once for the whole session, in contrast to
   `onCreate`'s own logging (add one there too, temporarily, to
   compare) which fires on every rotation — direct, side-by-side proof
   of which object survives and which doesn't.
2. `SettingsActivity` still reads/writes `SharedPreferences` directly,
   with no `ViewModel` of its own. Consider (in writing, not
   necessarily in code) whether it would benefit from one — is there
   any expensive, reloadable-on-rotation state there worth retaining,
   or is a single number cheap enough that Lesson 5/9's existing
   pattern is already the right amount of engineering for it? There's
   a real, defensible answer either way — the point is deciding
   deliberately rather than applying `ViewModel` everywhere reflexively.

## Definition of Done

- [ ] `InventoryViewModel` exists, holds `items`/`itemDao`/`dbExecutor`,
      and is retrieved through `ViewModelProvider` in `InventoryActivity`.
- [ ] You proved, with real Logcat output, that rotating no longer
      re-queries the database after the first load.
- [ ] You constructed the `ViewModel` directly (bypassing the provider)
      on purpose, saw the fix defeated, and restored the correct
      version.
- [ ] You can explain, in your own words, why a `ViewModel` must never
      hold a reference to an Activity or a View.
- [ ] Commit: message explaining why (e.g. "Move item list state and
      database access into an InventoryViewModel so rotation no longer
      re-queries the database or risks leaking a destroyed Activity").

Lesson 16 is next: `InventoryActivity` still has to manually call
`notifyDataSetChanged()` after every load and insert — `LiveData` and
the Observer pattern remove that manual wiring entirely, letting the UI
react automatically whenever the `ViewModel`'s data actually changes.
