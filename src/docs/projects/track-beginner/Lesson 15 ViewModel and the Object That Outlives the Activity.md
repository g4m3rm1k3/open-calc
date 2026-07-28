# Lesson 15: `ViewModel` — the Object That Outlives the Activity

**What you will build:** No new visible feature. This lesson fixes a
second invisible waste, related to but distinct from Lesson 14's: every
single rotation destroys the current `InventoryActivity` object and
builds a brand-new one (Lesson 5), and that brand-new object's
`onCreate` currently re-runs `loadItemsFromDatabase()` from scratch —
hitting the disk again for a list of items that has not changed at all
since the moment a fraction of a second earlier when the old object was
destroyed. The transferable problem: Lesson 5 already named the real
limit of `onSaveInstanceState` — small, transient values only, not a
whole growing list — and promised a real answer would come later. This
is that lesson: `ViewModel`, a real Android object whose entire purpose
is holding state that survives an Activity being torn down and rebuilt,
without a hand-written `Bundle` rescue for every single field.

**What you need to know first:** Lesson 5 (`onSaveInstanceState`,
rotation destroying and recreating the Activity object, and its own
closing line naming this exact size limit as the reason a later lesson
introduces `ViewModel`). Lesson 14 (`dbExecutor`, `runOnUiThread` — both
move into this lesson's new class). Lesson 12–13
(`DatabaseHelper`, `loadItemsFromDatabase`, `insert`, `delete` — the
real operations this lesson relocates, not rewrites).

**Terms introduced in this lesson:**
- **`ViewModel`** — an object designed to hold UI-related data that
  survives its owning Activity being destroyed and recreated for a
  configuration change, though not a full process death.
- **`ViewModelStore` / `ViewModelStoreOwner`** — `ViewModelStoreOwner`
  is an interface with exactly one method,
  `getViewModelStore()`; `AppCompatActivity` implements it. The
  `ViewModelStore` it returns is what the Android framework — not your
  code — retains across a configuration-change-triggered recreation.
- **`ViewModelProvider`** — the object you ask for a `ViewModel`
  instance through; it returns the *same* instance across a
  configuration change, and only actually builds a new one the first
  time, or after the owning Activity is genuinely, permanently gone.
- **`AndroidViewModel`** — a `ViewModel` subclass with access to the
  app's `Application` object, needed whenever a `ViewModel` must
  construct something (like `DatabaseHelper`) that requires a
  `Context`.
- **`Application`** — an Android `Context` that exists for the entire
  life of the app's process, as opposed to an `Activity`, whose
  `Context` is destroyed and rebuilt on every configuration change.
- **`onCleared()`** — a method called on a `ViewModel` when it is about
  to be destroyed for real — the owning Activity finishing permanently,
  or the process ending — never on a mere configuration change.
- **Configuration change vs. process death** — a configuration change
  (rotation, language, dark mode) destroys and rebuilds the Activity
  object but keeps its `ViewModelStore` intact; process death (the OS
  reclaiming memory, the user swiping the app away) destroys
  everything, `ViewModelStore` included.
- **Guard flag (`itemsLoaded`)** — a plain `boolean` field checked
  before doing real work, so an operation that has already run once
  becomes a safe no-op on every later call instead of repeating itself.

---

## Concept Unit: The Real Waste — Rotation Reloads Data It Already Had

### The Problem

Lesson 14 fixed *where* `loadItemsFromDatabase()` runs — a background
thread, not the main thread. It never questioned *how often* it runs.
Prove, concretely, that it currently runs far more often than the data
actually changes.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java` (temporary — added and
  removed within this unit).
- **Change type:** Add, then fully revert.

### The New Code

Temporarily add one line to the very top of `loadItemsFromDatabase()`:

```java
android.util.Log.d("ReloadWaste", "Querying the database for the full item list — again");
```

### Run It

Run the app, filter Logcat to the tag `ReloadWaste`, and confirm you
see this line exactly once, right at launch. Now rotate the emulator
(Ctrl+F11) **without changing anything about your data** — add
nothing, delete nothing. Watch Logcat: the line prints again,
immediately, a second time. Rotate twice more in a row: it prints a
third and fourth time. Four real disk reads for a list that has been
completely unchanged since the app was first opened, because Lesson
5's own rule still holds — rotation destroys the `InventoryActivity`
object and builds a brand-new one, and that brand-new object's
`onCreate` has no way of knowing the *previous* object already did this
exact work moments earlier.

### Discard the Throwaway Example

Delete this temporary log line. The rest of this lesson builds the
real fix: an object that survives the part of this that's actually
wasteful — the *data* — while still letting the Activity object itself
be destroyed and rebuilt exactly as it always has been.

### Mechanical Walkthrough

- `android.util.Log.d("ReloadWaste", "Querying the database for the full item list — again");`
  — reappearing (`Log.d`, Lesson 2c), placed at the very top of an
  already-existing method rather than new logic of its own — its only
  job here is making an already-happening event visible, not changing
  what the method does. The real content of this unit isn't the log
  line itself; it's the *frequency* the real Logcat output reveals once
  it's there: once at launch, then once more per rotation, for data
  that never changed.

### CS Lens

This is the same **eager, unconditionally-repeated work** idea from
Lesson 6a's `addView` loop — work performed again in full, every single
time, regardless of whether anything that would change the result has
actually happened since the last time it ran. Also recognized in: a web
page re-fetching data it already has on every re-render instead of
caching it, and a build tool recompiling every file from scratch
instead of only the ones that changed since the last build.

### SE Lens

**Why does this waste matter for a list this small, when each reload
only takes a few milliseconds today?** Because the *mechanism*, not the
current size, is what's actually wrong — this reload happens on every
single rotation, for the entire life of this app, and the table's size
is not fixed: Lesson 12–13 built real, permanent persistence
specifically so this list keeps growing for as long as someone uses
this app. A cost that is negligible at ten rows and merely
unnecessary at ten thousand is still the same design mistake at both
sizes; it just doesn't hurt yet at the smaller one.

---

## Concept Unit: `ViewModel` — an Object That Outlives the Activity That Requested It

### The Problem

Lesson 5 already named the shape of the real fix, without building it:
"`onSaveInstanceState` isn't a substitute for real persistence... that
size ceiling is the real reason a later lesson introduces `ViewModel`."
What, mechanically, makes a `ViewModel` different from a field sitting
directly on `InventoryActivity` — both are just objects in memory, so
why does one survive what the other doesn't?

### The Contract You're Extending

Before writing a subclass, look at what you would actually be
extending. `ViewModel` itself (from `androidx.lifecycle`,
`androidx.lifecycle:lifecycle-viewmodel`, verified against the real
library source):

```java
public abstract class ViewModel {
    protected void onCleared() {
    }
}
```

Two real facts this makes checkable instead of assumed: `ViewModel` is
`abstract` — but not because it has any unimplemented method forcing a
subclass to fill something in (there is only one method here, and it
already has a body, `{}`, an empty one). It is `abstract` purely to
stop anyone from writing `new ViewModel()` directly — the class only
makes sense as a base for a subclass holding *your* actual data,
never on its own. `onCleared()` is `protected`, has an empty default
body, and is *not* `abstract` — overriding it is optional, and this
lesson's third unit gives it a real, concrete job.

`ViewModel` alone has no way to build something needing a `Context` —
`DatabaseHelper` (Lesson 12) requires one. `AndroidViewModel`, a real
subclass one step further down, exists specifically for that:

```java
public class AndroidViewModel extends ViewModel {
    public AndroidViewModel(@NonNull Application application) {
        // stores application
    }

    public <T extends Application> T getApplication() {
        // returns the stored Application
    }
}
```

`Application` — **first appearance.** A `Context` (Lesson 4) that
represents the entire running app's process, not any one screen —
unlike an `Activity`'s own `Context`, which is destroyed and rebuilt on
every configuration change, the same `Application` object exists for
as long as the app's process itself does, which is exactly the
lifetime `AndroidViewModel` needs to safely hold onto and hand back
through `getApplication()`.

### Project Change

- **Reference Source:** No reference counterpart — `track/`'s own
  Lesson 15 introduces `ViewModel` together with `LiveData` and
  `Repository` as one combined architectural shift; this course
  introduces `ViewModel` on its own first, deferring `LiveData` to the
  next lesson, since this course's `ViewModel` needs proving on its own
  terms before adding a second new idea on top of it.
- **Files affected:** `app/build.gradle` (module-level, add a
  dependency), new file
  `app/src/main/java/.../InventoryViewModel.java` (temporary, minimal
  version for this unit only — the next unit replaces it with the real
  one).
- **Change type:** Configure, create.
- **Dependencies:** the AndroidX Lifecycle ViewModel library.

### Commands Needed

Open the module-level `app/build.gradle` and add one line inside the
existing `dependencies { ... }` block:

```gradle
implementation 'androidx.lifecycle:lifecycle-viewmodel:2.11.0'
```

Click **Sync Now**, the same step Lesson 6a's `RecyclerView` dependency
required.

### The New Code — Proving Survival, Before Building Anything Real

A minimal `InventoryViewModel`, holding nothing but a random id
generated once, is the fastest way to prove *when* a `ViewModel`
actually gets rebuilt and when it doesn't. Create
`InventoryViewModel.java`:

```java
package com.yourname.pocketinventory;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;

public class InventoryViewModel extends AndroidViewModel {
    private final String instanceId = "vm-" + System.currentTimeMillis();

    public InventoryViewModel(@NonNull Application application) {
        super(application);
        android.util.Log.d("ViewModelProof", "InventoryViewModel constructed: " + instanceId);
    }
}
```

Temporarily add this inside `InventoryActivity.onCreate`, right after
`setContentView`:

```java
InventoryViewModel viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);
```

(Needs `import androidx.lifecycle.ViewModelProvider;` at the top.)

### Run It Yourself

Run the app, filter Logcat to `ViewModelProof`. On first launch, you'll
see exactly one line: `InventoryViewModel constructed: vm-<some
number>`. This is the platform behavior this whole lesson exists to
prove — reproduce it yourself, on your own emulator, rather than taking
this prose's word for it:

- **Rotate the emulator several times in a row.** The constructor's
  log line does **not** print again — the exact same `instanceId` you
  saw on first launch is still the one `InventoryActivity` gets back
  every time, because `new ViewModelProvider(this).get(...)` found an
  existing `InventoryViewModel` already sitting in this Activity's
  `ViewModelStore` and handed back that same object instead of building
  a new one — even though `InventoryActivity` itself, per Lesson 5, was
  destroyed and rebuilt on every one of those same rotations.
- **Fully close the app** (swipe it away from the Recents/app-switcher
  screen, not just press Back) **and relaunch it.** The constructor's
  log line prints again, with a genuinely new `instanceId` this time —
  swiping away from Recents ends the app's entire process, taking its
  `ViewModelStore` with it, so the next launch has nothing old to find
  and builds a brand-new `InventoryViewModel` from scratch.

### Discard the Throwaway Example

Delete the temporary `viewModel` line from `onCreate` and the
`android.util.Log.d(...)` line inside `InventoryViewModel`'s
constructor — both were only ever here to prove survival concretely.
Keep the file `InventoryViewModel.java` itself; the next unit replaces
its body with the real fields and methods this project actually needs.

### Mechanical Walkthrough

- `public abstract class ViewModel` — reappearing (`abstract` on a
  class, Lesson 6b's `final` neighbor concept, not yet individually
  named until now): a class that cannot be instantiated directly with
  `new`, only extended.
- `public class AndroidViewModel extends ViewModel` — reappearing
  (`extends`, Lesson 2c), a concrete (non-`abstract`) subclass, since it
  adds a real constructor and a real usable method on top of
  `ViewModel`'s own near-empty shape.
- `public InventoryViewModel(@NonNull Application application) { super(application); ... }`
  — reappearing (`super(...)`, Lesson 2c's constructor-chaining
  cousin — here calling a parent *class's* constructor specifically,
  the exact shape Lesson 2c's `onCreate` already used for
  `super.onCreate(...)`, just on a constructor instead of a method).
- `new ViewModelProvider(this).get(InventoryViewModel.class)` — **first
  appearance.** `new ViewModelProvider(this)` builds a provider tied to
  *this* Activity's own `ViewModelStore` (`this` satisfies
  `ViewModelStoreOwner`, since `AppCompatActivity` implements it).
  `.get(InventoryViewModel.class)` asks that provider for an instance of
  exactly this class — the first time this is ever called for a given
  `ViewModelStore`, it constructs one (passing this Activity's own
  `Application` object into the constructor automatically, since
  `InventoryViewModel` is an `AndroidViewModel`); every later call
  against the *same* `ViewModelStore` — including the one made by the
  brand-new `InventoryActivity` object a rotation just built — returns
  the exact same object instead of building another.
- `InventoryViewModel.class` — reappearing (`.class` literal, Lesson
  4's `InventoryActivity.class`), here naming which `ViewModel`
  subclass to look up or build.

### CS Lens

A `ViewModelStore` retained independently of the object that requested
it is a form of **the Memento/Originator split** — the data that needs
to survive is deliberately kept in an object separate from the thing
whose lifecycle is short-lived and disposable, so destroying and
rebuilding the disposable part never touches the part meant to persist.
Also recognized in: a web server keeping session state in a separate
store (a database, a cache) instead of in the request-handling object
itself, which is thrown away after every single request completes, and
a video game's save-file object outliving any one level/scene object
that gets torn down and rebuilt between levels.

### SE Lens

**Why does `ViewModelStore` survive a configuration change specifically,
but not a full process death — why not just make it survive
everything, permanently, for the life of the device?** Because a
configuration change is Android *choosing* to destroy and rebuild an
Activity it otherwise has every intention of keeping around — the user
never left, never will actually see a gap, and the OS itself decided a
full rebuild was the correct response (Lesson 5's own SE Lens already
covered why: different resources may be needed for the new
configuration). Process death is different in kind, not just degree —
the app's entire process is gone, and nothing about "the user rotated
their phone" applies; keeping a `ViewModelStore` alive forever,
independent of the app's own process even existing, would mean holding
onto memory (and, in this project's case, an open `ExecutorService`)
for an app the user may never reopen. Surviving exactly configuration
changes, and no more, is the narrowest guarantee that still solves the
actual problem this lesson opened with.

---

## Concept Unit: Moving Real Data and the Executor Into `InventoryViewModel`

### The Problem

The previous unit proved the mechanism with a throwaway `instanceId`.
Now give `InventoryViewModel` the real job: holding the actual item
list and the actual database access this project depends on, so that
data — not just an empty proof-of-concept object — is what survives
rotation.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryViewModel.java` (replace contents
  entirely).
- **Change type:** Replace.
- **Dependencies:** `DatabaseHelper` (Lesson 12), `Item` (Lesson 7/13),
  `dbExecutor`'s pattern (Lesson 14).

### The New Code

```java
package com.yourname.pocketinventory;

import android.app.Application;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class InventoryViewModel extends AndroidViewModel {
    private final List<Item> items = new ArrayList<>();
    private final DatabaseHelper dbHelper;
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
    private boolean itemsLoaded = false;

    public InventoryViewModel(@NonNull Application application) {
        super(application);
        dbHelper = new DatabaseHelper(application);
    }

    public List<Item> getItems() {
        return items;
    }

    public void loadItemsIfNeeded(Runnable onLoaded) {
        if (itemsLoaded) {
            return;
        }
        itemsLoaded = true;
        dbExecutor.execute(() -> {
            List<Item> loadedItems = loadItemsFromDatabase();
            items.addAll(loadedItems);
            onLoaded.run();
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

    private List<Item> loadItemsFromDatabase() {
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
        return loadedItems;
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        dbExecutor.shutdown();
    }
}
```

### The Updated Project

This *is* the whole file, replacing the previous unit's throwaway
version entirely — there is no larger enclosing structure, since this
is the complete class.

### Mechanical Walkthrough

- `private final List<Item> items = new ArrayList<>();` — reappearing
  (field, `ArrayList`), now living on the `ViewModel` instead of
  directly on `InventoryActivity` — this is the actual data this
  lesson's opening waste demo showed being needlessly rebuilt every
  rotation; moving it here is what stops that.
- `private final DatabaseHelper dbHelper;` / `dbHelper = new DatabaseHelper(application);`
  — reappearing (Lesson 12's field and constructor call), with one
  necessary change: `application` (this `AndroidViewModel`'s own stored
  `Application`, satisfying `SQLiteOpenHelper`'s `Context` parameter)
  replaces the `this` an Activity itself used to pass — a `ViewModel`
  has no `Context` of its own to offer except the one `AndroidViewModel`
  specifically stores for it.
- `private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();`
  — reappearing (Lesson 14's own field), relocated here for exactly the
  same reason `items` was: this executor's whole purpose is running
  database work across this `ViewModel`'s entire lifetime, which is now
  longer than any single `InventoryActivity` object's own lifetime.
- `private boolean itemsLoaded = false;` — **first appearance of a
  guard flag.** A plain `boolean` field, checked before doing real
  work, specifically to make an operation safe to call more than once
  without repeating it — the actual fix for this lesson's opening
  demonstration: `onCreate` can call `loadItemsIfNeeded` on every single
  rotation, safely, because after the very first real call, every
  later one does nothing at all.
- `public void loadItemsIfNeeded(Runnable onLoaded)` — **first
  appearance of a guarded, callback-driven load.** `if (itemsLoaded) return;`
  is checked *before* touching the executor at all — the entire method
  exits immediately, doing zero work, on every call after the first.
  Only the very first call actually flips `itemsLoaded` to `true` and
  submits real work to `dbExecutor`. `onLoaded` is a `Runnable` (Lesson
  14) the caller supplies — this method has no idea what `onLoaded`
  will actually do, only that it should run once the load finishes;
  notice `onLoaded.run()` executes on `dbExecutor`'s own background
  thread, not the main thread — this method makes no promise about
  which thread calls `onLoaded`, which the next unit's caller has to
  handle correctly, exactly the way Lesson 14 handled it directly.
- `public void addItem(Item item)` / `public void deleteItem(Item item)`
  — reappearing (Lesson 14's `dbExecutor.execute(...)` pattern), now
  each taking the real `Item` involved as a parameter instead of reading
  loose local variables — a small but real improvement: these two
  methods have everything they need from their own parameter, with
  nothing implicit about which item or which values they act on.
- `@Override protected void onCleared() { super.onCleared(); dbExecutor.shutdown(); }`
  — **first appearance of an actual override of `onCleared()`.** This
  is where the Contract block's empty `{}` body actually gets replaced
  with real work: `onCleared()` runs when this `ViewModel` is being
  destroyed for good — not on a rotation, only when `InventoryActivity`
  finishes permanently or the process ends — which is exactly the
  moment it is finally safe, and necessary, to shut down `dbExecutor`
  so it does not keep running (and keep this object reachable,
  unable to be garbage-collected) after nothing will ever submit work
  to it again.

### CS Lens

`itemsLoaded` guarding `loadItemsIfNeeded` against repeat work is an
instance of **memoizing a side effect** — not caching a return value
(the classic memoization shape), but recording *that an action already
ran* so a second call is a safe no-op instead of redoing real work.
Also recognized in: a one-time app setup routine guarded by "has this
already run" flag stored in `SharedPreferences`, and a lazily-initialized
singleton that only ever constructs its one real instance the first
time it's asked for.

### SE Lens

**Why does `loadItemsIfNeeded` take a raw `Runnable` callback instead of
just updating `items` and trusting the Activity to notice on its own?**
Because `InventoryViewModel` has no reference to any `View`, any
`RecyclerView.Adapter`, or `InventoryActivity` itself at all — and it
should not gain one; a `ViewModel` that held a reference to the
specific Activity that first created it would keep that exact Activity
object alive across rotations it should have been free to discard,
the same living-reference leak risk Lesson 6b's SE Lens named for a
non-static inner class holding its enclosing instance. A plain
`Runnable` callback lets `InventoryViewModel` announce "the load
finished" without knowing or caring who's listening or what they'll do
about it. The real cost of this specific design, worth naming honestly
rather than glossing over: the caller must remember, every time, to
get back onto the main thread itself before touching any view —
nothing here enforces that, and forgetting it reproduces Lesson 14's
own `CalledFromWrongThreadException` exactly. The next lesson's
`LiveData` exists specifically to close that gap.

---

## Concept Unit: Wiring `InventoryActivity` to the ViewModel

### The Problem

`InventoryViewModel` now holds the real data and the real executor.
`InventoryActivity` still has its own `dbHelper`, `dbExecutor`, and
`items` fields left over from Lessons 12–14, completely disconnected
from the new class. Replace them.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Remove three fields, add one; refactor `onCreate`,
  the Add button's listener, and `onSwiped`.
- **Dependencies:** `InventoryViewModel` (this lesson's previous unit).

### The New Code — the Field

Replace all three of these fields:

```java
private DatabaseHelper dbHelper;
private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
```

(`items` was already a local variable inside `onCreate`, not a field,
since Lesson 7 — it is removed from there instead.)

with one:

```java
private InventoryViewModel viewModel;
```

### The New Code — `onCreate`

```java
viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);
```

```java
adapter = new InventoryAdapter(viewModel.getItems(), item -> {
    Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
    intent.putExtra("EXTRA_ITEM", item);
    startActivity(intent);
});
recyclerView.setAdapter(adapter);

viewModel.loadItemsIfNeeded(() ->
        runOnUiThread(() -> adapter.notifyDataSetChanged()));
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    private InventoryAdapter adapter;
    private InventoryViewModel viewModel;                                             // ← changed (was dbHelper + dbExecutor)

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);        // ← changed (was new DatabaseHelper(this))

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(viewModel.getItems(), item -> {                // ← changed (was local items)
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        viewModel.loadItemsIfNeeded(() ->                                              // ← changed (was a bare dbExecutor.execute block)
                runOnUiThread(() -> adapter.notifyDataSetChanged()));

        ItemTouchHelper itemTouchHelper = new ItemTouchHelper(new ItemTouchHelper.SimpleCallback(
                0, ItemTouchHelper.LEFT | ItemTouchHelper.RIGHT) {
            @Override
            public boolean onMove(@NonNull RecyclerView recyclerView,
                                   @NonNull RecyclerView.ViewHolder viewHolder,
                                   @NonNull RecyclerView.ViewHolder target) {
                return false;
            }

            @Override
            public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
                int position = viewHolder.getAdapterPosition();
                Item removedItem = adapter.getItemAt(position);
                adapter.removeItem(position);
                viewModel.deleteItem(removedItem);                                    // ← changed (was a direct dbExecutor.execute block)
            }
        });
        itemTouchHelper.attachToRecyclerView(recyclerView);

        EditText nameInput = findViewById(R.id.nameInput);
        EditText quantityInput = findViewById(R.id.quantityInput);
        EditText locationInput = findViewById(R.id.locationInput);
        Button addItemButton = findViewById(R.id.addItemButton);

        addItemButton.setOnClickListener(v -> {
            String name = nameInput.getText().toString().trim();
            String quantityText = quantityInput.getText().toString().trim();
            String location = locationInput.getText().toString().trim();

            if (name.isEmpty() || location.isEmpty()) {
                return;
            }

            int quantity;
            try {
                quantity = Integer.parseInt(quantityText);
            } catch (NumberFormatException e) {
                return;
            }

            Item newItem = new Item(name, quantity, location);                        // ← changed (was inline in adapter.addItem(...))
            adapter.addItem(newItem);
            viewModel.addItem(newItem);                                               // ← changed (was a direct ContentValues/insert block)

            nameInput.setText("");
            quantityInput.setText("");
            locationInput.setText("");
        });

        Button settingsButton = findViewById(R.id.settingsButton);
        settingsButton.setOnClickListener(v ->
                startActivity(new Intent(InventoryActivity.this, SettingsActivity.class)));
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

`InventoryActivity` no longer owns any database object or any executor
at all — both live on `viewModel` now, for as long as it survives.
`onCreate` still runs on every rotation, exactly as it always has, but
`viewModel.loadItemsIfNeeded(...)` now does real work only the very
first time it is ever called for a given `InventoryViewModel` instance.

### Mechanical Walkthrough

- `private InventoryViewModel viewModel;` — reappearing (field), the
  one field this Activity keeps in place of the three it used to own
  directly.
- `viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);`
  — reappearing (previous unit's own lab, now permanent) — on first
  launch this constructs a new `InventoryViewModel`; on every rotation
  after, it returns the exact same one, with `items` already however
  full it was a moment before the rotation.
- `adapter = new InventoryAdapter(viewModel.getItems(), ...)` —
  reappearing (`InventoryAdapter`'s constructor, Lesson 6e), now handed
  a `List<Item>` reference that outlives this specific `adapter` object
  — a fresh `adapter` is still built every single `onCreate` call (that
  part is cheap and does not need to survive), but the *list* it wraps
  is the same one, call after call, across every rotation.
- `viewModel.loadItemsIfNeeded(() -> runOnUiThread(() -> adapter.notifyDataSetChanged()))`
  — reappearing (`runOnUiThread`, Lesson 14), composed with the previous
  unit's new method: the lambda passed in is exactly the `Runnable`
  `loadItemsIfNeeded` expects, and its body is a second, nested lambda
  that hops onto the main thread specifically to call
  `notifyDataSetChanged()` — two lambdas because two separate jobs are
  happening: "what to do when loading finishes" (outer) and "how to
  safely touch a view from wherever that turned out to run" (inner).
- `viewModel.deleteItem(removedItem)` / `viewModel.addItem(newItem)` —
  reappearing (this lesson's own new `ViewModel` methods), replacing
  `InventoryActivity`'s own direct `dbExecutor.execute(...)` blocks from
  Lesson 14 — the Activity now states *what* it wants done and hands
  the real item involved to something else, never touching
  `dbHelper` or `dbExecutor` directly at all anymore.

### CS Lens

Moving `dbHelper`/`dbExecutor`/`items` off `InventoryActivity` and onto
`InventoryViewModel` is **separation of concerns** applied along a
lifetime boundary specifically, not just a topical one: `InventoryActivity`
now owns exactly the things that genuinely need rebuilding every
rotation (views, the adapter), and `InventoryViewModel` owns exactly the
things that do not (the data, the means of fetching and changing it).

### SE Lens

**Now that `InventoryViewModel` holds the real data, why does
`InventoryActivity` still rebuild a brand-new `adapter` on every single
rotation, instead of moving `adapter` into the `ViewModel` too, so
nothing has to be rebuilt at all?** Because `RecyclerView.Adapter`
(Lesson 6e) is built with a lambda capturing `InventoryActivity.this`
specifically — every row tap needs to call `startActivity`, a method
that only exists on an `Activity`, using an `Intent` that needs an
Activity `Context` to construct correctly. Holding that adapter — and
the Activity reference sealed inside its row-click lambda — inside a
`ViewModel` that is meant to outlive any one Activity instance would
keep the *old*, already-destroyed `InventoryActivity` object alive in
memory for as long as the `ViewModel` itself survives, the exact
enclosing-instance leak risk this lesson's second unit already named.
The right things move to the `ViewModel`: data, and the means of
changing it, neither of which has any reason to know an `Activity`
exists at all. The view-facing objects — `adapter`, the click lambda
that needs a live Activity — correctly stay behind, rebuilt each time,
cheaply, exactly as before.

---

## Connect the Pieces

Full trace: this lesson opened by proving, with a real log line, that
rotating the emulator re-ran a full database query for data that had
not changed — four times, for four rotations, with zero new data. A
`ViewModel`, retained by the framework's own `ViewModelStore` across
exactly a configuration change (proven with a random instance id that
survived rotation but not a full process kill), is where `items`,
`dbHelper`, and `dbExecutor` now live instead. `InventoryActivity`
still gets destroyed and rebuilt on every rotation exactly as it always
has since Lesson 5 — but now it asks `ViewModelProvider` for the same
`InventoryViewModel` every time, and `loadItemsIfNeeded`'s own guard
flag means the real database query — the exact one this lesson's
opening demo caught firing four times for nothing — now runs exactly
once per app session, no matter how many times the phone gets rotated
in between.

## What Breaks Without This

In `InventoryViewModel.loadItemsIfNeeded`, temporarily remove the
`if (itemsLoaded) return;` guard (leave `itemsLoaded = true;` in
place, or remove it too — either way the guard no longer prevents
anything). Rotate the emulator several times in a row and watch
Logcat, filtered to the query line still present in
`loadItemsFromDatabase` from this lesson's own opening unit if you
temporarily restore it, or simply watch the on-screen list very
briefly flicker on each rotation as it's cleared and rebuilt from
scratch — the exact waste this entire lesson exists to remove.
Restore the guard afterward.

## Exercises

1. Temporarily change `onCleared()` to print a `Log.d` line before
   calling `dbExecutor.shutdown()`. Rotate the emulator several times
   (confirm the line never prints), then press the system Back button
   until the app closes entirely (confirm the line prints exactly
   once). This is the concrete difference between a configuration
   change and the Activity — and its `ViewModel` — finishing for real.
2. Predict, then verify: if you swipe the app away from the
   Recents/app-switcher screen instead of pressing Back, does
   `onCleared()`'s log line print? Consider what you already know about
   process death versus a normal finish, and check your prediction.

## Definition of Done

- [ ] You watched `loadItemsFromDatabase()`'s query re-run on every
      rotation before this lesson's fix, and confirmed it does not
      anymore afterward.
- [ ] You proved `InventoryViewModel` survives rotation but not a full
      process kill, using the temporary `instanceId`/Log.d technique,
      on your own emulator.
- [ ] `InventoryActivity` no longer has a `DatabaseHelper` or
      `ExecutorService` field of its own — both live on `viewModel`.
- [ ] Adding and deleting items still works correctly, confirmed by
      fully closing and reopening the app afterward.
- [ ] Commit: message explaining why (e.g. "Move item data, database
      access, and the background executor into InventoryViewModel, so
      rotation stops re-querying data that hasn't changed").

Lesson 16 is next: `loadItemsIfNeeded`'s own `Runnable` callback still
requires the caller to remember to hop onto the main thread manually,
with nothing enforcing it — `LiveData`, and data that announces its own
changes to whoever is watching, on the correct thread, automatically.
