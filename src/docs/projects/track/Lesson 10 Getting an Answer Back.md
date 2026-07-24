# Lesson 10: Getting an Answer Back — the Activity Result API

**What you will build:** The new item built in Lesson 9's form actually
appears in the inventory list the moment you save it. The transferable
problem: `startActivity` (Lesson 4) is a one-way message — "go do this"
— with no channel back. Lesson 9 ended with `AddItemActivity` calling
`finish()` and vanishing without a trace, because nothing was listening
for an answer. Getting a result back from a screen you navigated *to*,
into the screen you navigated *from*, needs its own mechanism, and
Android's modern answer to it — the Activity Result API — is a good
lens on a real API design decision: this isn't the first way Android
solved this problem, and knowing *why* it changed is as useful as
knowing how to use the current version.

**What you need to know first:** Lesson 4 (`Intent`, `startActivity`,
the Manifest), Lesson 6 (`InventoryAdapter`, `RecyclerView`), Lesson 8
(`Item` as `Parcelable`, passing it through `Intent` extras), Lesson 9
(`AddItemActivity`, `finish()`).

---

## Concept Unit: `setResult()` — an Activity Can Answer, Not Just Act

### The Problem

`AddItemActivity` already builds a valid `Item` before calling
`finish()`. It just throws that object away instead of handing it
anywhere. The first half of the fix belongs entirely to
`AddItemActivity`: package the built `Item` into an `Intent` and
declare, explicitly, "here's my answer" before closing.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `AddItemActivity.java`.
- **Change type:** Modify — replace the `Toast`/`finish()` tail of the
  Save click listener from Lesson 9.
- **Dependencies:** `Item` already being `Parcelable` (Lesson 8).

### The New Code

```java
Intent resultIntent = new Intent();
resultIntent.putExtra("EXTRA_NEW_ITEM", newItem);
setResult(RESULT_OK, resultIntent);
finish();
```

### The Updated Project

```java
saveButton.setOnClickListener(v -> {
    String name = nameInput.getText().toString().trim();
    String quantityText = quantityInput.getText().toString().trim();
    String location = locationInput.getText().toString().trim();

    if (name.isEmpty()) {
        nameInput.setError("Name is required");
        return;
    }

    int quantity;
    try {
        quantity = Integer.parseInt(quantityText);
    } catch (NumberFormatException e) {
        quantityInput.setError("Enter a whole number");
        return;
    }

    if (quantity < 0) {
        quantityInput.setError("Quantity cannot be negative");
        return;
    }

    if (location.isEmpty()) {
        locationInput.setError("Location is required");
        return;
    }

    Item newItem = new Item(name, quantity, location);
    Intent resultIntent = new Intent();                                  // ← new
    resultIntent.putExtra("EXTRA_NEW_ITEM", newItem);                    // ← new
    setResult(RESULT_OK, resultIntent);                                  // ← new
    finish();                                                            // ← changed (Toast removed)
});
```

Every validation check from Lesson 9 is unchanged — this unit only
replaces what happens *after* a valid `Item` is built: instead of a
`Toast` and a silent `finish()`, the new `Item` is now attached to a
purpose-built `Intent` and formally declared as this Activity's result
before closing.

### Mechanical Walkthrough
- `new Intent()` — **first appearance of this specific no-argument
  form.** Every prior `Intent` (Lesson 4, Lesson 8) was built with a
  target (`this, SomeActivity.class`) because it was *starting* a new
  Activity. This one has no target — it isn't going anywhere on its
  own; it's a pure data carrier that the OS will hand back to whoever
  is waiting, which is exactly what the next Concept Unit sets up.
- `resultIntent.putExtra("EXTRA_NEW_ITEM", newItem)` — reappearing
  (`putExtra` with a `Parcelable`, Lesson 8), same mechanism, new key.
- `setResult(RESULT_OK, resultIntent)` — **first appearance.**
  `RESULT_OK` is a constant (inherited from `Activity`, always
  available without an import) meaning "this operation completed
- successfully" — its counterpart, `RESULT_CANCELED`, is what an
  Activity finishing *without* calling `setResult` at all reports by
  default, which is exactly how the receiving side (next unit) will
  distinguish "user saved an item" from "user pressed Back out of the
  form empty-handed."
- `finish()` — reappearing, Lesson 9, unchanged in meaning — but now
  the *order* matters: `setResult` must be called before `finish()`,
  since the result is only meaningful if a result was actually set
  before the Activity finishes.

### CS Lens

`setResult` before `finish` is a **return value passed through an
asynchronous boundary** — the conceptual equivalent of a function's
`return` statement, except the "caller" isn't waiting synchronously
line-by-line the way a normal method call would be; it registers a
callback (built next) and gets notified later, whenever this Activity
actually finishes. Also recognized in: a Promise/`Future`'s `resolve`
value in asynchronous JavaScript or Java, a background job posting its
result to a queue instead of returning it directly, and RPC responses
arriving on a separate channel from the request that triggered them.

---

## Concept Unit: `ActivityResultLauncher` — Registering to Receive an Answer

### The Problem

`InventoryActivity` currently calls plain `startActivity(...)` to open
`AddItemActivity` (Lesson 9), which fires and forgets — there is no
hook anywhere in that call for a later callback. Something has to
replace it with a mechanism that *does* keep a channel open for the
result `AddItemActivity` will eventually set.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Modify.
- **Location:** A new field declared at the class level, replacing the
  `addButton` click listener's body from Lesson 9.
- **Dependencies:** `androidx.activity:activity` — already transitively
  included by `AppCompatActivity`'s own dependencies; no new Gradle
  line needed, unlike Lesson 6's RecyclerView addition.

### The New Code

```java
private ActivityResultLauncher<Intent> addItemLauncher =
        registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
        Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
        // handled in the next Concept Unit
    }
});
```

### The Updated Project

This is a new field added at the top of `InventoryActivity`, alongside
where `tapCount` was declared in Lesson 5 — both are instance fields,
but this one holds a launcher object instead of a primitive:

```java
public class InventoryActivity extends AppCompatActivity {
    private ActivityResultLauncher<Intent> addItemLauncher =                          // ← new
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> { // ← new
        if (result.getResultCode() == RESULT_OK && result.getData() != null) {        // ← new
            Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");     // ← new
        }                                                                              // ← new
    });                                                                                // ← new

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // unchanged for now — this unit only adds the field;
        // wiring addButton to use it is the next unit
    }
}
```

### Mechanical Walkthrough
- `private ActivityResultLauncher<Intent> addItemLauncher` — **first
  appearance.** A field, same declaration shape as any other (Lesson 5),
  holding an object whose entire job is "launch something, and remember
- what to do when it finishes" — the generic `<Intent>` says this
  particular launcher expects to start something using an `Intent`, as
  opposed to other kinds of results (like requesting a permission,
  covered in a later lesson) the same API family also supports.
- `registerForActivityResult(...)` — **first appearance.** Must be
  called while the Activity is being constructed, before it reaches
- `onCreate` — this is *why* it's assigned directly at the field
  declaration rather than inside `onCreate` the way everything else in
  this project has been wired so far; the framework needs to register
  this callback very early in the Activity's setup to correctly restore
  it across configuration changes (Lesson 5's rotation problem, handled
  automatically here rather than needing your own `onSaveInstanceState`
  code).
- `new ActivityResultContracts.StartActivityForResult()` — **first
  appearance.** A **contract** — an object describing *what kind* of
  result-producing operation this is (here: "start an Activity and get
  back a result code plus an Intent," as opposed to other built-in
  contracts for permissions or picking a photo, which you'll meet in
  later lessons). You don't write your own logic here; you select the
  contract matching what you're doing.
- The lambda `result -> { ... }` — reappearing (lambda syntax, Lesson
  4), new shape: this is the **callback**, run automatically whenever
  the launched Activity finishes, whether via `setResult`+`finish()`
  (Lesson 9's new code) or simply pressing Back with no result set.
- `result.getResultCode() == RESULT_OK` — **first appearance** of
  reading the code side of a result, reappearing constant `RESULT_OK`
  from the previous unit — this is the check that specifically
  distinguishes "user saved a real item" from "user backed out of the
  form."
- `result.getData()` — **first appearance.** Returns the `Intent` that
  `AddItemActivity` built with `setResult`, or `null` if none was ever
- set — checked explicitly here (`!= null`) before trying to read
  extras from it, since a `RESULT_CANCELED` finish typically has no
  data at all.
- `result.getData().getParcelableExtra("EXTRA_NEW_ITEM")` —
  reappearing (`getParcelableExtra`, Lesson 8), same mechanism, reading
  from the *result* Intent instead of the original launch Intent.

### CS Lens

This is a concrete instance of the **callback / continuation pattern**
— rather than the calling code blocking and waiting for a return value
(impossible here; the user might sit on the Add Item screen for
minutes), you register a function to be invoked later, whenever the
awaited event actually completes. Also recognized in: JavaScript
Promises' `.then()`, Java's own `CompletableFuture`, event-driven GUI
frameworks in general (a callback per event rather than sequential
blocking calls), and the exact `View.OnClickListener` shape from Lesson
4 — a callback registered ahead of time, invoked by someone else, later.

### SE Lens

**Why does this need a whole `registerForActivityResult` mechanism
instead of, say, `AddItemActivity` just calling a static method back on
`InventoryActivity` directly with the new `Item`?** A direct call would
require `AddItemActivity` to hold a compile-time reference to
`InventoryActivity` specifically — the exact tight coupling Lesson 4's
SE Lens already argued against for ordinary navigation, and it would be
worse here: it would make `AddItemActivity` un-reusable by any *other*
screen that might also want to launch it and receive a new `Item` back
(a "quick add" shortcut from a future notification, for instance).
Routing the result back through the OS, keyed to *this specific launch*
rather than to a hardcoded class, keeps `AddItemActivity` genuinely
reusable — the real cost is exactly the ceremony you just wrote: a
contract object, a callback, and a field that has to be declared before
`onCreate` runs, all for what conceptually is "give me back an answer."

**Why did this replace an older API** (`startActivityForResult`/
`onActivityResult`, which you may see in older tutorials or Stack
Overflow answers)? That older version used a single, ever-growing
`onActivityResult` method per Activity, dispatching on an integer
"request code" you had to invent and keep unique yourself — a real,
common source of bugs when two different features in the same Activity
accidentally picked the same request code. The current API replaces
that manual, error-prone dispatch with one launcher object and one
callback *per specific operation*, checked by the compiler for type
correctness (`ActivityResultLauncher<Intent>`) instead of relying on an
`if (requestCode == 42)` chain a developer had to get right by hand.

---

## Concept Unit: Launching Through the Result API and Updating the List

### The Problem

`addButton` still calls plain `startActivity(...)` from Lesson 9. And
the callback built in the previous unit reads `newItem` but does
nothing with it yet — the list itself needs to grow, and
`RecyclerView` needs to be told a row was added, not just have its
underlying `List` silently mutated.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Modify.
- **Dependencies:** the launcher field from the previous unit;
  `items` and `adapter`, both currently local variables inside
  `onCreate` (Lesson 6/7) that this change promotes to fields so the
  callback — which runs outside `onCreate`'s original call — can still
  reach them.

### The New Code

```java
private List<Item> items;
private InventoryAdapter adapter;
```

```java
adapter = new InventoryAdapter(items, item -> {
    Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
    intent.putExtra("EXTRA_ITEM", item);
    startActivity(intent);
});
recyclerView.setAdapter(adapter);

Button addButton = findViewById(R.id.addItemButton);
addButton.setOnClickListener(v ->
        addItemLauncher.launch(new Intent(InventoryActivity.this, AddItemActivity.class)));
```

And the launcher's callback body, completed:

```java
if (result.getResultCode() == RESULT_OK && result.getData() != null) {
    Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
    if (newItem != null) {
        items.add(newItem);
        adapter.notifyItemInserted(items.size() - 1);
    }
}
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    private List<Item> items;                                                          // ← changed (was local)
    private InventoryAdapter adapter;                                                   // ← changed (was local)

    private ActivityResultLauncher<Intent> addItemLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
            Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
            if (newItem != null) {                                                      // ← new
                items.add(newItem);                                                     // ← new
                adapter.notifyItemInserted(items.size() - 1);                           // ← new
            }                                                                            // ← new
        }
    });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        items = new ArrayList<>();                                                      // ← changed (field, not local)
        items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));
        items.add(new Item("Shop Rags", 12, "Shelf B"));
        items.add(new Item("Cutting Oil", 3, "Shelf B"));
        items.add(new Item("Digital Calipers", 2, "Toolbox 1"));
        items.add(new Item("Safety Glasses", 8, "Shelf A"));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(items, item -> {                                 // ← changed (field, not local)
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        Button addButton = findViewById(R.id.addItemButton);
        addButton.setOnClickListener(v ->                                               // ← changed
                addItemLauncher.launch(new Intent(InventoryActivity.this, AddItemActivity.class))); // ← changed
    }
}
```

`onCreate` still does everything it did in Lesson 9 to build and
display the initial list — the change is that `items` and `adapter` now
live long enough (as fields) for the launcher's callback, which fires
*after* `onCreate` has already returned, to reach back into them and
grow the list live.

### Mechanical Walkthrough
- `private List<Item> items;` / `private InventoryAdapter adapter;` —
  reappearing (field declarations), new detail: promoted from Lesson
  6/7's local variables specifically because the callback above needs
- to read and mutate them from outside `onCreate`'s scope — a local
  variable's lifetime ends when its method returns; a field's doesn't.
- `addItemLauncher.launch(new Intent(...))` — **first appearance of
  `.launch(...)`.** The Activity Result API's replacement for
- `startActivity` when you intend to receive a result — same `Intent`
  construction as always (Lesson 4/8/9), handed to the launcher instead
  of called directly, so the OS knows to route the eventual result back
  through this specific launcher's registered callback.
- `items.add(newItem)` — reappearing (`List.add`, Lesson 6), applied to
  the field version of the list.
- `adapter.notifyItemInserted(items.size() - 1)` — **first appearance.**
  Tells `RecyclerView` specifically *which* position gained a new row,
  so it can efficiently insert and animate just that one row. This is
  worth contrasting with a rougher alternative you have **not** used:
  `notifyDataSetChanged()`, which would work but tells `RecyclerView`
  "assume everything might have changed, redraw the whole list from
  scratch" — wasteful for a single insertion, and something a later
  lesson (`DiffUtil`) revisits properly for more complex changes than
  one row.

### Run It

Run the app, tap "+ Add Item," save a valid new item, and watch the
list screen: the new row appears immediately at the bottom, with a
built-in insertion animation from `notifyItemInserted`, no manual
screen refresh or Activity restart involved.

### CS Lens

Calling `notifyItemInserted` with the *specific* index that changed,
rather than re-rendering everything, is a small instance of **minimal-
diff / incremental update** — communicating precisely what changed
instead of forcing the observer to recompute everything from scratch.
Also recognized in: React/Vue's virtual DOM diffing (updating only
changed DOM nodes), database replication sending only changed rows
rather than re-transmitting a whole table, and Git itself storing
commits as deltas rather than full snapshots of every file.

---

## Connect the Pieces

Full trace: `InventoryActivity` taps "+ Add Item" → `addItemLauncher.launch(...)`
starts `AddItemActivity` (same `Intent`-based navigation from Lesson 4,
routed through the result API instead of plain `startActivity`) → the
user fills the form and taps Save → Lesson 9's validation gauntlet runs
unchanged → a valid `Item` is built → this lesson's new code packages
it into a result `Intent`, calls `setResult(RESULT_OK, ...)`, then
`finish()` → the OS pops `AddItemActivity` off the back stack (Lesson
5's mechanism) and, because it was launched via the result API,
delivers the result Intent to `addItemLauncher`'s registered callback →
the callback checks `RESULT_OK`, extracts the `Item` (Lesson 8's
`Parcelable` machinery, reused for the return trip), appends it to the
`items` field, and calls `notifyItemInserted` → `RecyclerView` inserts
and animates exactly one new row, without ever calling
`onCreate` again.

## What Breaks Without This

In `AddItemActivity`, temporarily comment out just the `setResult(RESULT_OK, resultIntent);`
line (leave `finish()`). Save a valid item and watch the list screen:
you return to it, but no new row appears — Logcat shows nothing wrong,
because nothing crashed; `result.getResultCode()` is simply
`RESULT_CANCELED` by default, so the callback's `if` check quietly does
nothing. Restore the line afterward.

## Exercises

1. Change `notifyItemInserted(items.size() - 1)` to
   `adapter.notifyDataSetChanged()` instead, and add three items in a
   row. Both work — but temporarily add a
   `Log.d("Adapter", "onBindViewHolder called for position " + position)`
   line inside `onBindViewHolder` and compare how many times it fires
   for a single addition under each approach. Restore
   `notifyItemInserted` afterward.
2. Modify the callback to also show a `Toast` confirming which item was
   added (`"Added " + newItem.getName()`) — the confirmation Lesson 9
   showed inside `AddItemActivity` itself, now more naturally placed on
   the screen actually showing the updated list.

## Definition of Done

- [ ] Saving a new item in `AddItemActivity` makes it appear in
      `InventoryActivity`'s list immediately, with no manual refresh.
- [ ] You can explain, in your own words, the difference between
      `RESULT_OK` and `RESULT_CANCELED` and when each occurs.
- [ ] You can explain why `items` and `adapter` had to become fields
      instead of staying local to `onCreate`.
- [ ] You commented out `setResult` on purpose, saw the silent no-op,
      and restored it.
- [ ] Commit: message explaining why (e.g. "Return the newly created
      Item from AddItemActivity via the Activity Result API and insert
      it into the live list, replacing the old fire-and-forget
      navigation").

Lesson 11 is next: the whole inventory still evaporates the instant the
app process dies — `SharedPreferences`, and giving small, simple
settings (not the inventory itself yet) a place to actually live
between launches.
