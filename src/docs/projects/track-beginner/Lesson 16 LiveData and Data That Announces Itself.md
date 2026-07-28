# Lesson 16: `LiveData` — Data That Announces Itself

**What you will build:** No new visible feature. Lesson 15 closed with
an honest admission: `loadItemsIfNeeded`'s `Runnable` callback runs on
whichever thread `dbExecutor` happens to run it on, and nothing stops
the caller from forgetting to hop back onto the main thread before
touching a view — the exact mistake Lesson 14 already crashed on once.
This lesson replaces that raw callback with `LiveData`, a real Android
tool whose entire job is guaranteeing an observer's callback lands on
the main thread, every time, regardless of which thread reported the
change — and, as a second, genuinely distinct benefit, only delivers
that callback while something is actually there to receive it.

**What you need to know first:** Lesson 15 (`InventoryViewModel`,
`loadItemsIfNeeded`'s `Runnable` callback and its own honestly-admitted
gap). Lesson 14 (`runOnUiThread`, `CalledFromWrongThreadException`).
Lesson 2c (`interface`, single-abstract-method shapes, the Observer
pattern proved by hand with `Doorbell`/`Chime`).

**Terms introduced in this lesson:**
- **`LiveData<T>`** — an abstract, observable holder of one value of
  type `T`; reading it is public, but writing it is not exposed on the
  base class itself.
- **`MutableLiveData<T>`** — a concrete `LiveData<T>` subclass that
  re-exposes `setValue`/`postValue` as `public`, so something can
  actually write to it.
- **`setValue(T)` vs. `postValue(T)`** — `setValue` must be called from
  the main thread and updates observers immediately; `postValue` may be
  called from any thread and schedules the update to happen on the main
  thread shortly after.
- **`Observer<T>`** — a single-abstract-method interface, one method,
  `onChanged(T value)`, the same functional-interface shape as
  `Runnable` or `View.OnClickListener`.
- **`LifecycleOwner`** — a single-method interface
  (`getLifecycle()`) that `AppCompatActivity` implements; `observe(...)`
  requires one so `LiveData` knows which component's lifecycle to pay
  attention to.
- **Active state (lifecycle-aware delivery)** — `LiveData` only calls
  an observer's `onChanged` while the associated `LifecycleOwner` is
  actually visible/interactive, not while it is stopped or already
  destroyed.
- **Version counter (internal dispatch mechanism)** — `LiveData`
  dispatches to observers on every `setValue`/`postValue` call by
  incrementing an internal counter, not by comparing the old and new
  values for equality — posting the same object reference again still
  notifies observers.

---

## Concept Unit: The Real Gap — Nothing Stops Forgetting `runOnUiThread`

### The Problem

Lesson 15's `loadItemsIfNeeded(Runnable onLoaded)` explicitly admitted
that `onLoaded` runs on `dbExecutor`'s background thread, and that the
caller — `InventoryActivity` — is the one responsible for wrapping its
own body in `runOnUiThread`. Nothing in the method's own signature or
behavior enforces that. Prove it, the same way Lesson 14 first proved
`CalledFromWrongThreadException` existed at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java` (temporary — reverted at
  the end of this unit).
- **Change type:** Modify, then fully revert.

### The New Code

Temporarily strip the `runOnUiThread` wrapper from `onCreate`'s call to
`loadItemsIfNeeded`, from Lesson 15:

```java
viewModel.loadItemsIfNeeded(() -> adapter.notifyDataSetChanged());
```

### Run It

Run the app. Read the real crash in Logcat: the exact same
`android.view.ViewRootImpl$CalledFromWrongThreadException` Lesson 14
already triggered once, for the exact same underlying reason —
`adapter.notifyDataSetChanged()` is running on `dbExecutor`'s
background thread again, because nothing about `loadItemsIfNeeded`'s
own type signature, `void loadItemsIfNeeded(Runnable onLoaded)`,
distinguishes "a `Runnable` safe to run on any thread" from "a
`Runnable` that specifically must run on the main thread." The compiler
accepted this code without complaint, exactly as it did the first time
this mistake happened.

### Discard the Throwaway Example

Restore the `runOnUiThread(...)`-wrapped version from Lesson 15. The
rest of this lesson replaces the whole callback shape, so this specific
mistake becomes structurally harder to make again, not just easier to
remember not to make.

### Mechanical Walkthrough

- `viewModel.loadItemsIfNeeded(() -> adapter.notifyDataSetChanged());`
  — reappearing (`loadItemsIfNeeded`, Lesson 15's own method), missing
  only the `runOnUiThread(...)` wrapper the permanent version already
  has — this line, on its own, is indistinguishable from correct code
  by reading it; nothing about its shape reveals which thread the
  lambda will actually run on.

### CS Lens

A callback whose required execution context (which thread, whether the
receiver still exists) is only documented in prose, never checked by
the compiler or the type system, is a **contract enforced by convention
only** — the same category of risk `@Override`'s absence created back
in Lesson 2c, just for threading instead of method overriding. Also
recognized in: any API whose documentation says "must be called on the
UI thread" with nothing in its signature actually requiring that, and
any callback-based API generally where "when" and "on what thread" are
promises stated only in a comment.

### SE Lens

**If the mistake is this easy to reproduce, why not just have
`loadItemsIfNeeded` wrap the callback in `runOnUiThread` itself, inside
`InventoryViewModel`?** Because `InventoryViewModel` has no reference
to any Activity to call `runOnUiThread` *on* — Lesson 15's own SE Lens
already explained why it should not gain one. The fix this lesson
reaches for instead doesn't patch this one call site; it replaces the
entire shape of "how a `ViewModel` announces a change" with something
whose main-thread guarantee is built into the tool itself, not
something every future call site has to individually remember.

---

## Concept Unit: `LiveData` and `Observer` — a Callback Guaranteed to Land on the Main Thread

### The Problem

What would a callback mechanism need to guarantee, structurally, so
that the previous unit's mistake becomes far harder to make by
accident?

### The Contract You're Using

`LiveData<T>` itself (from `androidx.lifecycle`, verified against the
real library source):

```java
public abstract class LiveData<T> {
    public T getValue() { /* ... */ }
    protected void setValue(T value) { /* ... */ }
    protected void postValue(T value) { /* ... */ }
    public void observe(LifecycleOwner owner, Observer<? super T> observer) { /* ... */ }
}
```

Worth reading precisely, not just glancing at: `getValue()` and
`observe(...)` are `public` — anything can *read* a `LiveData` or watch
it. `setValue(...)` and `postValue(...)` are `protected` — nothing
outside `LiveData` itself, or a subclass of it, can *write* to one.
`MutableLiveData<T>`, a real, separate subclass, exists specifically to
re-expose those two methods as `public`:

```java
public class MutableLiveData<T> extends LiveData<T> {
    public void setValue(T value) { super.setValue(value); }
    public void postValue(T value) { super.postValue(value); }
}
```

This is a deliberate split, not an accident of the class hierarchy: any
code holding a plain `LiveData<T>` reference — the type
`InventoryActivity` will actually be given, in the next unit — can
read the current value and observe changes, but has no way to write a
new one at all, even by mistake. Only code holding the narrower
`MutableLiveData<T>` reference — kept private inside
`InventoryViewModel`, next — can actually change it.

`Observer<T>` is a single-abstract-method interface, the same shape as
`Runnable` (Lesson 14) or `View.OnClickListener` (Lesson 4):

```java
public interface Observer<T> {
    void onChanged(T value);
}
```

`observe(LifecycleOwner owner, Observer<? super T> observer)` needs a
`LifecycleOwner` — another single-method interface,
`getLifecycle()`, that `AppCompatActivity` already implements, which is
why every call to `observe(...)` in this project passes `this`.

### Introduce the Concept in Isolation

Prove the actual thread-hop, for real, inside this project — `LiveData`
genuinely needs a `LifecycleOwner` to mean anything, so unlike
`Thread`/`Runnable` this cannot be isolated into a plain `javac` lab;
it is proven directly, temporarily, inside `InventoryActivity` instead.
Temporarily add this field to `InventoryActivity`:

```java
private final MutableLiveData<String> proofLiveData = new MutableLiveData<>();
```

(Needs `import androidx.lifecycle.MutableLiveData;` and
`import androidx.lifecycle.Observer;` at the top.)

Temporarily add this inside `onCreate`, anywhere after `setContentView`:

```java
proofLiveData.observe(this, new Observer<String>() {
    @Override
    public void onChanged(String value) {
        android.util.Log.d("LiveDataProof", "onChanged running on: "
                + Thread.currentThread().getName() + ", value=" + value);
    }
});

new Thread(() -> {
    android.util.Log.d("LiveDataProof", "postValue called from: "
            + Thread.currentThread().getName());
    proofLiveData.postValue("hello from a background thread");
}).start();
```

### Run It Yourself

Run the app, filter Logcat to `LiveDataProof`. Real, reader-run proof —
reproduce this yourself, on your own emulator:

```
LiveDataProof: postValue called from: Thread-2
LiveDataProof: onChanged running on: main, value=hello from a background thread
```

Two different thread names, for two different lines, proves the actual
claim: `postValue` was genuinely called from `Thread-2`, a real
background thread built with the raw `Thread` class from Lesson 14 —
and yet `onChanged`, which reads that exact value, reports running on
`main`. `LiveData` itself performed the hop back onto the main thread
between those two lines — nothing in this temporary code called
`runOnUiThread` anywhere.

### Discard the Throwaway Example

Delete `proofLiveData`, its `observe(...)` call, and the temporary
background `Thread` — none of this appears in the project again. The
next unit wires real `LiveData` into `InventoryViewModel` for the
project's actual data.

### Mechanical Walkthrough

- `MutableLiveData<String> proofLiveData = new MutableLiveData<>();` —
  **first appearance.** Builds an empty `LiveData` holder — no initial
  value here, unlike the real version the next unit builds.
- `proofLiveData.observe(this, new Observer<String>() { ... })` —
  **first appearance.** `this` is `InventoryActivity` itself, satisfying
  `LifecycleOwner`; the anonymous class (Lesson 2c's own `new
  OnTapListener() { ... }` shape) is a real, explicit implementation of
  `Observer<String>` — written the long way here on purpose, so its
  single method, `onChanged`, is fully visible rather than compressed
  into a lambda immediately.
- `proofLiveData.postValue("hello from a background thread")` —
  **first appearance.** Called from inside a raw `new Thread(...)`
  (Lesson 14), specifically *not* the main thread — proving
  `postValue`, unlike `setValue`, is the version safe to call from any
  thread at all.
- `Thread.currentThread().getName()` — reappearing (Lesson 14), the
  exact mechanism that makes the thread-hop provable rather than merely
  asserted.

### CS Lens

`LiveData`'s `observe`/`Observer` pair is the same **Observer pattern**
`Doorbell`/`Chime` (Lesson 2c) and `View.OnClickListener` (Lesson 4)
already proved, with one genuinely new property layered on: delivery is
**lifecycle-aware** — `LiveData` only calls `onChanged` while the
associated `LifecycleOwner` is actually active (roughly, between
`onStart` and `onStop`, Lesson 5's own vocabulary), and automatically
stops delivering to an observer whose Activity has been destroyed for
good, closing off an entire category of "callback fired after the
screen it was meant to update no longer exists" crashes that a raw
callback (Lesson 15's own `Runnable`) has no defense against at all.
Also recognized in: reactive-programming libraries generally
(RxJava's `Observable`, JavaScript's Promises/async-await in spirit,
though the mechanisms differ), and any publish/subscribe system that
tracks whether a subscriber is still genuinely listening before
delivering to it.

### SE Lens

**Why does `LiveData` split reading (`public`) from writing
(`protected`, only reachable through `MutableLiveData`) instead of just
making one class with both `public`?** Because the two roles have
different legitimate audiences: many things reasonably want to *read*
`InventoryViewModel`'s current item list and react to changes —
`InventoryActivity`, and potentially other screens later in this
project — but only `InventoryViewModel` itself should ever be allowed
to *write* a new value in. Exposing one `LiveData<T>` type for reading
and keeping the narrower `MutableLiveData<T>` private is the same
least-privilege idea Lesson 2d's four access levels already
established, applied here to "can observe" versus "can mutate" instead
of "same package" versus "subclass."

---

## Concept Unit: Replacing the Raw Callback With Real `LiveData`

### The Problem

Wire the proven mechanism into the actual project, replacing
`loadItemsIfNeeded`'s `Runnable onLoaded` parameter entirely.

### Project Change

- **Reference Source:** No reference counterpart — `track/`'s own
  Lesson 16 introduces `LiveData` already paired with `Room` and a
  `Repository`; this course wires it directly into the raw-SQLite
  `InventoryViewModel` Lesson 15 already built.
- **Files affected:** `app/build.gradle` (add a dependency),
  `InventoryViewModel.java`, `InventoryActivity.java`.
- **Change type:** Configure, then refactor.
- **Dependencies:** `InventoryViewModel` (Lesson 15).

### Commands Needed

Add one line inside `app/build.gradle`'s existing `dependencies { }`
block, alongside Lesson 15's own:

```gradle
implementation 'androidx.lifecycle:lifecycle-livedata:2.11.0'
```

Click **Sync Now**.

### The New Code — `InventoryViewModel`

Replace the plain `items` field and `loadItemsIfNeeded`'s signature:

```java
private final List<Item> items = new ArrayList<>();
private final MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(items);

public LiveData<List<Item>> getItems() {
    return itemsLiveData;
}

public void loadItemsIfNeeded() {
    if (itemsLoaded) {
        return;
    }
    itemsLoaded = true;
    dbExecutor.execute(() -> {
        List<Item> loadedItems = loadItemsFromDatabase();
        items.addAll(loadedItems);
        itemsLiveData.postValue(items);
    });
}
```

### The Updated Project

```java
public class InventoryViewModel extends AndroidViewModel {
    private final List<Item> items = new ArrayList<>();
    private final MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(items);  // ← new
    private final DatabaseHelper dbHelper;
    private final ExecutorService dbExecutor = Executors.newSingleThreadExecutor();
    private boolean itemsLoaded = false;

    public InventoryViewModel(@NonNull Application application) {
        super(application);
        dbHelper = new DatabaseHelper(application);
    }

    public LiveData<List<Item>> getItems() {                                          // ← changed (was List<Item> getItems())
        return itemsLiveData;                                                          // ← changed (was `return items;`)
    }

    public void loadItemsIfNeeded() {                                                  // ← changed (no more Runnable parameter)
        if (itemsLoaded) {
            return;
        }
        itemsLoaded = true;
        dbExecutor.execute(() -> {
            List<Item> loadedItems = loadItemsFromDatabase();
            items.addAll(loadedItems);
            itemsLiveData.postValue(items);                                           // ← changed (was onLoaded.run())
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

### The New Code — `InventoryActivity`

```java
adapter = new InventoryAdapter(viewModel.getItems().getValue(), item -> {
    Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
    intent.putExtra("EXTRA_ITEM", item);
    startActivity(intent);
});
recyclerView.setAdapter(adapter);

viewModel.getItems().observe(this, itemList -> adapter.notifyDataSetChanged());

viewModel.loadItemsIfNeeded();
```

### The Updated Project

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_inventory);

    viewModel = new ViewModelProvider(this).get(InventoryViewModel.class);

    RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
    recyclerView.setLayoutManager(new LinearLayoutManager(this));
    adapter = new InventoryAdapter(viewModel.getItems().getValue(), item -> {          // ← changed (was viewModel.getItems() directly)
        Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
        intent.putExtra("EXTRA_ITEM", item);
        startActivity(intent);
    });
    recyclerView.setAdapter(adapter);

    viewModel.getItems().observe(this, itemList -> adapter.notifyDataSetChanged());   // ← new (replaces the runOnUiThread-wrapped callback)

    viewModel.loadItemsIfNeeded();                                                    // ← changed (no more Runnable argument)

    // ItemTouchHelper, EditText/addItemButton, settingsButton: all unchanged from Lesson 15
}
```

### Mechanical Walkthrough

- `MutableLiveData<List<Item>> itemsLiveData = new MutableLiveData<>(items);` —
  reappearing (`MutableLiveData`, this lesson's own lab), constructed
  with `items` as its initial value — the same list object, not a copy,
  meaning `itemsLiveData.getValue()` and `items` refer to the exact
  same `List<Item>` at this point.
- `public LiveData<List<Item>> getItems()` — reappearing, changed
  return type: `LiveData<List<Item>>`, the narrower, read-only type,
  not `MutableLiveData<List<Item>>` — `InventoryActivity` receives
  something it can read and observe but never write to directly,
  exactly the split this lesson's Contract block named.
- `itemsLiveData.postValue(items);` — reappearing (this lesson's lab),
  now inside the real `dbExecutor.execute(...)` block, called from the
  background thread — `postValue`, not `setValue`, is required here for
  exactly the reason the Contract block stated: this line does not run
  on the main thread.
- `viewModel.getItems().getValue()` — **first appearance in real
  project code.** Reads whatever value is currently stored — at this
  point in `onCreate`, still the initial, possibly-empty `items` list
  set in the constructor — used here only to hand `InventoryAdapter` a
  real `List<Item>` reference to wrap; this call does not observe
  anything or react to future changes on its own.
- `viewModel.getItems().observe(this, itemList -> adapter.notifyDataSetChanged())` —
  reappearing (`observe`, this lesson's lab), now with a lambda instead
  of a written-out anonymous class — legal for the same reason Lesson
  4's lambdas were: `Observer<T>` is a single-abstract-method interface.
  `itemList`, the lambda's own parameter, is never used inside the
  body — `adapter` already shares the exact same list reference `items`
  points to, so by the time `onChanged` runs, `adapter`'s own data is
  already current; all `notifyDataSetChanged()` does is tell
  `RecyclerView` to actually redraw using it.
- `viewModel.loadItemsIfNeeded();` — reappearing, now called with no
  argument at all — the entire `Runnable onLoaded` parameter this
  lesson opened by proving unsafe is gone from the method's own
  signature, not just handled more carefully at the call site.

### CS Lens

Posting the *same* `items` list reference back into `itemsLiveData`,
rather than building and posting a new list, relies on **dispatch by
version, not by value** — `LiveData` does not compare the old and new
value for equality before deciding whether to notify; it increments an
internal counter on every `setValue`/`postValue` call and always
notifies. This is worth naming precisely because it's easy to assume
otherwise: if `LiveData` skipped notifying "unchanged" values by
comparing objects, posting the same mutated-in-place list would
silently do nothing.

### SE Lens

**Why does `loadItemsIfNeeded` still mutate `items` directly and then
separately call `postValue(items)`, instead of building a brand-new
list and posting that instead?** Because `adapter` was handed the
*same* `items` reference back in `onCreate`, before any loading
happened — mutating that exact object in place means `adapter`'s own
data is already correct the instant `postValue` is called; a
freshly-built list would require also re-handing it to `adapter`
somehow, adding a step this design doesn't need. The one real risk this
shortcut accepts: any code that reads `items` directly, on any thread,
between the moment `items.addAll(loadedItems)` runs and the moment
`postValue` actually reaches the main thread, could observe a partially
inconsistent state — genuinely unlikely in this project today (nothing
else touches `items` directly), but a real formal library like `Room`
plus its own `LiveData` integration (a later lesson's `LiveData` may
revisit, if this course ever adopts it) avoids this exact shortcut by
always querying fresh, immutable lists instead of mutating one in
place.

---

## Connect the Pieces

Full trace: this lesson opened by reproducing the exact
`CalledFromWrongThreadException` Lesson 14 first found, this time
against Lesson 15's own callback, proving that callback's safety
depended entirely on the caller remembering something no code enforced.
`LiveData`'s split between a `public`, read-only `LiveData<T>` and a
private, write-capable `MutableLiveData<T>` closes that gap
structurally: `InventoryViewModel` posts a new value from whatever
thread `dbExecutor` happens to be running on, and `observe(this, ...)`
guarantees `InventoryActivity`'s own reaction runs on the main thread
regardless — proven directly, with two different thread names in real
Logcat output, not just asserted. `loadItemsIfNeeded` no longer takes
or needs a `Runnable` at all; the mechanism that replaced it makes the
mistake this lesson opened with structurally harder to make again.

## What Breaks Without This

Already demonstrated at the very start of this lesson: stripping
`runOnUiThread` from Lesson 15's raw callback reproduced a real
`CalledFromWrongThreadException`. No further break-it exercise is
needed — the fix this lesson builds is what makes that mistake harder
to make in the first place, not merely easier to spot afterward.

## Exercises

1. In the `proofLiveData` lab (before deleting it), change
   `postValue(...)` to `setValue(...)` while still calling it from
   inside the background `Thread`. Run it and read the real crash —
   `setValue` explicitly requires the main thread, unlike `postValue`,
   and Android enforces this the same way it enforces
   `CalledFromWrongThreadException` for views.
2. Add a second, independent `Observer` to `viewModel.getItems()`
   inside `onCreate` — a lambda that only logs `itemList.size()`.
   Confirm both observers' `onChanged` run every time the list updates,
   not just the one that calls `notifyDataSetChanged()` — proof that
   more than one part of an app can watch the same `LiveData`
   independently.

## Definition of Done

- [ ] You ran the `proofLiveData` lab and saw, in real Logcat output,
      `postValue` called from one thread and `onChanged` running on
      `main`.
- [ ] `loadItemsIfNeeded()` no longer takes a `Runnable` parameter, and
      `InventoryActivity` observes `viewModel.getItems()` instead of
      passing a callback in directly.
- [ ] The app still loads, adds, and deletes items correctly, confirmed
      by fully closing and reopening it afterward.
- [ ] You can explain, in your own words, why `getItems()` returns
      `LiveData<List<Item>>` rather than `MutableLiveData<List<Item>>`.
- [ ] Commit: message explaining why (e.g. "Replace loadItemsIfNeeded's
      raw Runnable callback with LiveData, after proving the callback
      version could crash with CalledFromWrongThreadException if the
      caller forgot to wrap it in runOnUiThread").

Lesson 17 is next: `InventoryViewModel` still constructs its own
`DatabaseHelper` and talks to `SQLiteDatabase` directly — `Repository`,
and why a `ViewModel` shouldn't be the thing that knows *how* data is
actually stored.
