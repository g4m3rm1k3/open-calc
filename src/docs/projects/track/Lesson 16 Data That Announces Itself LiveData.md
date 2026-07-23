# Lesson 16: Data That Announces Itself — LiveData and the Observer Pattern

**What you will build:** `InventoryActivity` stops manually calling
`notifyDataSetChanged()`/`notifyItemInserted()` after every load and
insert — the UI updates itself automatically whenever
`InventoryViewModel`'s data actually changes, through `LiveData`. The
transferable problem: Lesson 15 moved the data into a `ViewModel`, but
the Activity still has to remember to call the right notify method, on
the right thread, every single place data changes — miss one spot (a
future feature that updates an item, say) and the screen silently goes
stale. `LiveData` inverts that responsibility: the data itself
announces when it changes, and anything watching reacts automatically
— including handling the thread-crossing problem from Lesson 14
without you writing `runOnUiThread` by hand ever again.

**What you need to know first:** Lesson 8 (writing your own callback
interface — `LiveData` is a more capable, framework-provided version of
the same idea), Lesson 14 (why background threads can't touch views
directly), Lesson 15 (`InventoryViewModel`, `dbExecutor`, `loadItems`/
`addItem`).

---

## Concept Unit: Manual Notification Doesn't Scale

### The Problem

Every place `InventoryViewModel`'s data changes today, `InventoryActivity`
has to remember, separately, to call the matching Adapter method —
`loadItems`'s callback calls `notifyDataSetChanged()`; `addItem`'s
callback calls `notifyItemInserted(...)`. Two call sites, two different
methods, both hand-written, both easy to get wrong or simply forget the
next time a new way to change the data is added.

### Introduce the Concept in Isolation

The fix's underlying idea — a data holder that maintains its own list
of interested listeners and notifies all of them automatically on
change — is worth seeing built by hand once, small, before meeting
`LiveData`'s real, more capable version:

```java
import java.util.ArrayList;
import java.util.List;

class ObservableValue<T> {
    private T value;
    private final List<java.util.function.Consumer<T>> observers = new ArrayList<>();

    void observe(java.util.function.Consumer<T> observer) {
        observers.add(observer);
    }

    void setValue(T newValue) {
        value = newValue;
        for (java.util.function.Consumer<T> observer : observers) {
            observer.accept(newValue);
        }
    }
}

public class ObservableDemo {
    public static void main(String[] args) {
        ObservableValue<Integer> count = new ObservableValue<>();
        count.observe(v -> System.out.println("Listener A sees: " + v));
        count.observe(v -> System.out.println("Listener B sees: " + v));

        count.setValue(1);
        count.setValue(2);
    }
}
```

```
javac ObservableDemo.java
java ObservableDemo
```

Output:

```
Listener A sees: 1
Listener B sees: 1
Listener A sees: 2
Listener B sees: 2
```

This proves the mechanism: `setValue` is the **only** place that knows
about notification — the caller of `setValue` never has to know or
care how many observers exist, or call anything on them directly.
Every observer registered via `observe` automatically hears about every
future change, with zero coordination required from whoever triggers
the change.

### Discard the Throwaway Example

Delete `ObservableDemo.java` and `ObservableValue.java` — the real
project uses Android's own `LiveData`, a more capable version of
exactly this shape, built next.

### CS Lens

**This is a hard concept — the Observer pattern — and it recurs
constantly:** a subject maintains a list of dependents and notifies
them all automatically on state change, decoupling "what changed" from
"who needs to know and what they do about it." Also recognized in:
every GUI event system already used in this project (`View.OnClickListener`
from Lesson 4, this project's own `OnItemClickListener` from Lesson 8),
spreadsheet cell recalculation (change one cell, every formula
referencing it updates), pub/sub messaging systems, and reactive
programming libraries (RxJava, reactive streams) in general.

---

## Concept Unit: `MutableLiveData` — an Observable, Lifecycle-Aware Container

### Commands Needed

Add to `app/build.gradle`'s `dependencies { }`:

```gradle
implementation 'androidx.lifecycle:lifecycle-livedata:2.7.0'
```

Sync, as always.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryViewModel.java`.
- **Change type:** Modify — replace the plain `List<Item> items` field
  with a `MutableLiveData`-wrapped one, and update `loadItems`/`addItem`
  to publish through it instead of mutating in place.
- **Dependencies:** none new beyond the Gradle line above.

### The New Code

```java
private final MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(new ArrayList<>());
private boolean loaded = false;

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
```

### The Updated Project

```java
public class InventoryViewModel extends AndroidViewModel {
    private final ItemDao itemDao;
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
    private final MutableLiveData<List<Item>> itemsLiveData =                       // ← changed (was plain List field)
            new MutableLiveData<>(new ArrayList<>());                                // ← changed
    private boolean loaded = false;

    public InventoryViewModel(@NonNull Application application) {
        super(application);
        itemDao = AppDatabase.getInstance(application).itemDao();
    }

    LiveData<List<Item>> getItems() {                                                // ← changed (was List<Item>)
        return itemsLiveData;                                                         // ← changed
    }

    boolean isLoaded() {
        return loaded;
    }

    void loadItems() {                                                                // ← changed signature (no Runnable param)
        if (loaded) return;                                                           // ← new
        dbExecutor.execute(() -> {
            List<Item> loadedItems = itemDao.getAll();                                // ← changed
            loaded = true;
            itemsLiveData.postValue(loadedItems);                                     // ← changed (was items.addAll + callback)
        });
    }

    void addItem(Item item) {                                                         // ← changed signature (no Runnable param)
        dbExecutor.execute(() -> {
            long id = itemDao.insert(item);
            item.setId(id);
            List<Item> current = new ArrayList<>(itemsLiveData.getValue());           // ← new
            current.add(item);                                                        // ← new
            itemsLiveData.postValue(current);                                         // ← changed (was items.add + callback)
        });
    }
}
```

`InventoryViewModel` no longer accepts or invokes any `Runnable`
callbacks at all — `loadItems` and `addItem` now purely update
`itemsLiveData`, and whatever is watching it (built next unit) reacts
on its own, with no coordination required from this class.

### Mechanical Walkthrough

- `MutableLiveData<List<Item>>` — **first appearance.** A generic
  container (same `<>` type-parameter idea as `List<Item>` itself,
  Lesson 7) holding exactly one current value, plus the observer list
  and notification logic the `ObservableValue` lab just built by hand
  — `LiveData` is the abstract, read-only-facing base type;
  `MutableLiveData` is the subtype that actually allows setting a new
  value, a deliberate split explained in this unit's SE Lens.
- `new MutableLiveData<>(new ArrayList<>())` — reappearing (`ArrayList`
  construction, Lesson 6), new detail: `MutableLiveData`'s constructor
  accepts an initial value, given here so `getValue()` never returns
  `null` before the first real load completes.
- `LiveData<List<Item>> getItems()` — **first appearance of exposing
  the base `LiveData` type from a method whose backing field is the
  more capable `MutableLiveData`.** This is a deliberate narrowing —
  explained fully in the SE Lens — giving outside callers (the
  Activity) read/observe access without write access.
- `itemsLiveData.postValue(loadedItems)` — **first appearance.**
  `postValue` is specifically safe to call from a **background
  thread** — internally, it schedules the actual value update and
  observer notification to happen on the main thread, automatically —
  this is the direct replacement for Lesson 13/15's manual
  `runOnUiThread(...)` wrapping: `LiveData` does that thread-hop for
  you, as part of what it fundamentally does.
- `itemsLiveData.getValue()` — **first appearance.** Reads the current
  value synchronously, from whatever thread calls it — safe here
  specifically because it's read from *inside* `dbExecutor`'s own
  background thread, not concurrently with a `postValue` call
  targeting the same object in a way that would race (LiveData handles
  this internally).
- `new ArrayList<>(itemsLiveData.getValue())` — reappearing
  (`ArrayList` constructor), new detail: this specific overload copies
  an existing collection's elements into a new list — necessary because
  `LiveData` observers compare the *reference* of the list you post, so
  mutating the same list object in place and re-posting it would not
  reliably trigger a new notification; a fresh list object each time is
  the safe, correct pattern.

### CS Lens

`setValue`/`postValue`'s dual entry points — one for the main thread,
one safe from any thread — is a small but real instance of a
**thread-safe publication mechanism**: a value that can be written from
one thread and safely observed from another, with the cross-thread
handoff handled internally rather than left to the caller (Lesson 14's
`runOnUiThread`, now automated).

### SE Lens

**Why does `LiveData` (read-only) and `MutableLiveData` (read/write)
exist as two separate types, when one type with fewer restrictions
would work just as well?** The alternative — a single mutable type
exposed everywhere — would let *any* code holding a reference to
`itemsLiveData`, including `InventoryActivity`, call `setValue`
directly and silently overwrite the `ViewModel`'s own data from
outside, defeating the entire point of centralizing data mutation
inside the `ViewModel` (a design principle you'll see named explicitly
as the Repository pattern in Lesson 17). Exposing only the narrower
`LiveData` type from `getItems()` — while the field itself stays the
more capable `MutableLiveData` internally — costs nothing at runtime
(it's the same object; only the *compile-time* reference type differs)
and buys a hard, compiler-enforced guarantee: nothing outside this
class can ever call `.setValue()` or `.postValue()` on it.

---

## Concept Unit: `observe()` — Reacting Automatically, Lifecycle-Aware

### The Problem

`InventoryActivity` still manually calls `notifyDataSetChanged()`/
`notifyItemInserted()` inside the callbacks it no longer even has —
those callbacks are gone now that `loadItems`/`addItem` take no
`Runnable`. The Activity needs to *observe* `itemsLiveData` instead.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`, `InventoryAdapter.java`.
- **Change type:** Modify.
- **Dependencies:** `InventoryViewModel`'s new `LiveData`-based API.

### The New Code — Adapter Gains a Way to Swap Its List

```java
private List<Item> items;

InventoryAdapter(List<Item> items, OnItemClickListener listener) {
    this.items = items;
    this.listener = listener;
}

void setItems(List<Item> newItems) {
    this.items = newItems;
    notifyDataSetChanged();
}
```

### The Updated Project

```java
public class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {
    private List<Item> items;                                                        // ← changed (was final)
    private int lowStockThreshold = 5;
    private final OnItemClickListener listener;

    interface OnItemClickListener {
        void onItemClick(Item item);
    }

    InventoryAdapter(List<Item> items, OnItemClickListener listener) {
        this.items = items;
        this.listener = listener;
    }

    void setItems(List<Item> newItems) {                                              // ← new
        this.items = newItems;                                                        // ← new
        notifyDataSetChanged();                                                       // ← new
    }                                                                                  // ← new

    void setLowStockThreshold(int threshold) {
        this.lowStockThreshold = threshold;
        notifyDataSetChanged();
    }

    // onCreateViewHolder, onBindViewHolder, getItemCount, InventoryViewHolder unchanged
}
```

`InventoryAdapter` can now have its entire backing list replaced after
construction, not just mutated in place — the `final` keyword from
Lesson 6/7 is deliberately dropped from this one field specifically
because `LiveData` posts a whole new `List<Item>` object on every
change, rather than the old code's in-place `items.add(...)` — a
direct consequence of the Concept Unit above's "fresh list object each
time" rule.

### The New Code — Observing in the Activity

```java
viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);

adapter = new InventoryAdapter(new ArrayList<>(), item -> {
    Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
    intent.putExtra("EXTRA_ITEM", item);
    startActivity(intent);
});
recyclerView.setAdapter(adapter);

viewModel.getItems().observe(this, updatedItems -> adapter.setItems(updatedItems));

viewModel.loadItems();
```

And the launcher callback simplifies:

```java
if (newItem != null) {
    viewModel.addItem(newItem);
}
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    private InventoryViewModel viewModel;
    private InventoryAdapter adapter;

    private ActivityResultLauncher<Intent> addItemLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
            Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
            if (newItem != null) {
                viewModel.addItem(newItem);                                            // ← changed (was a callback-taking call)
            }
        }
    });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(new ArrayList<>(), item -> {                    // ← changed (starts empty; observe fills it)
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        viewModel.getItems().observe(this, updatedItems -> adapter.setItems(updatedItems)); // ← new

        viewModel.loadItems();                                                          // ← changed (no callback argument)

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

`onCreate` now registers exactly one observer, once, and never again
manually calls a notify method anywhere in this class — every future
change to `itemsLiveData`, from `loadItems`, from `addItem`, or from
any method added later, reaches the Adapter automatically through this
single subscription.

### Mechanical Walkthrough

- `viewModel.getItems().observe(this, updatedItems -> adapter.setItems(updatedItems))`
  — **first appearance.** `.observe(...)` takes two arguments: a
  **LifecycleOwner** (`this` — `AppCompatActivity` implements this
  interface, meaning it can report its own lifecycle state — a detail
  not previously named but true since Lesson 2) and a callback
  (reappearing lambda syntax) invoked with the current value every time
  it changes, *and* once immediately with whatever the current value
  already is at the moment of subscribing.
- The `LifecycleOwner` argument is the actual "lifecycle-aware" half of
  this unit's title, worth its own clause: `LiveData` internally checks
  the Activity's current lifecycle state (Lesson 5's `onStart`/`onStop`)
  before delivering an update — if the Activity is currently stopped
  (backgrounded, not destroyed), `LiveData` holds the update rather
  than delivering it to a screen not currently visible, and delivers
  the latest value automatically once it resumes. It also
  automatically stops delivering updates entirely once the Activity is
  destroyed, removing an entire category of "callback fired after my
  screen was gone" bugs you'd otherwise have to guard against by hand.
- `viewModel.loadItems()` — reappearing (method call, Lesson 15), new
  detail: no `Runnable` argument anymore — this method now has nothing
  to report back to directly; it just updates `itemsLiveData`, and the
  observer registered above reacts on its own.
- `viewModel.addItem(newItem)` — same simplification.

### Run It

Run the app. The list still loads and updates exactly as before — add
an item, watch it appear — but trace through the code path that made
it happen: no `notifyItemInserted` call exists anywhere in
`InventoryActivity` anymore. Rotate the emulator while the app is
mid-load (harder to time precisely, but try rotating immediately after
launch) — because `loaded` (Lesson 15) still guards against a second
query, and the `observe` call re-subscribes to the same retained
`ViewModel`'s `itemsLiveData` on the new Activity instance, the
already-loaded data reappears immediately with no flicker or reload.

### CS Lens

Delivering only to lifecycle-active observers, and automatically
unsubscribing on destruction, is a refinement of the plain Observer
pattern from this lesson's first unit — the same core idea, made safe
against a specific, common real-world failure mode (a callback firing
into a UI object that's already gone). Also recognized in: reactive
frameworks' explicit subscription-disposal patterns (RxJava's
`Disposable`), JavaScript's `AbortController` for cancelling fetches
tied to a component's lifetime, and any event-listener API that
requires explicit cleanup to avoid a "zombie" listener outliving what
it was meant to update.

---

## Connect the Pieces

Full trace: `InventoryActivity.onCreate` subscribes once, via
`viewModel.getItems().observe(this, ...)`, then calls
`viewModel.loadItems()` → `loadItems` runs `itemDao.getAll()` on
`dbExecutor` (Lesson 14's pooled background thread) and calls
`itemsLiveData.postValue(loadedItems)` → `LiveData` internally hops
back to the main thread and, because the Activity is currently
`STARTED`/`RESUMED` (Lesson 5's lifecycle states), delivers the new
list straight to the registered lambda, which calls
`adapter.setItems(...)` → `RecyclerView` redraws. Adding an item
follows the identical path through `addItem`/`postValue` — the same
one observer, doing the same one thing, for every kind of data change
this `ViewModel` will ever produce, present or future, with zero
additional wiring required in the Activity.

## What Breaks Without This

Temporarily comment out the entire `viewModel.getItems().observe(...)`
line. Run the app: the list stays permanently empty, forever — `loadItems()`
still runs and still updates `itemsLiveData` correctly (confirm with a
`Log.d` inside the lambda you commented out, moved to right after
`postValue`, if you want to see it happening), but with nothing
observing it, `adapter.setItems(...)` is simply never called. No crash,
no error — a quiet, total UI staleness, a strong argument for why this
lesson's automatic-notification model still requires *one* correct
subscription to exist somewhere. Restore the `observe` line afterward.

## Exercises

1. Add a second, temporary observer in `onCreate`
   (`viewModel.getItems().observe(this, items -> Log.d("LiveData", "Size now: " + items.size()));`)
   and confirm both observers fire, independently, on every change —
   direct proof `LiveData` supports multiple simultaneous observers,
   the same "any number of listeners" property the `ObservableValue`
   lab demonstrated.
2. Read up on `LiveData.observeForever(...)` (don't use it in this
   project) and write, in your own words, why it exists and why this
   lesson deliberately used `observe(this, ...)` instead — think
   specifically about what `observeForever` gives up regarding the
   lifecycle-awareness this unit's Mechanical Walkthrough named.

## Definition of Done

- [ ] `InventoryViewModel` exposes `LiveData<List<Item>>`, not a plain
      `List<Item>`, and never invokes a `Runnable` callback anymore.
- [ ] `InventoryActivity` subscribes exactly once and never calls
      `notifyDataSetChanged()`/`notifyItemInserted()` directly itself.
- [ ] You commented out the `observe` call on purpose, saw the silent
      staleness, and restored it.
- [ ] You can explain, in your own words, what `postValue` does
      differently from `setValue`, and why `loadItems`/`addItem` need
      the background-safe version.
- [ ] Commit: message explaining why (e.g. "Replace manual Adapter
      notification with LiveData observation, so the UI reacts to data
      changes automatically instead of requiring a matching notify call
      at every mutation site").

Lesson 17 is next: `InventoryViewModel` currently talks to `ItemDao`
directly — the Repository pattern, and why even a `ViewModel` shouldn't
know it's specifically a Room database underneath.
