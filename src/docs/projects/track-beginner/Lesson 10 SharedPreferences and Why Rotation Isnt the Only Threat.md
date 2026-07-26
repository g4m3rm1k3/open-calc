# Lesson 10: `SharedPreferences` and Why Rotation Isn't the Only Threat

**What you will build:** A real Settings screen holding one number — a
low-stock warning threshold — that survives not just rotating the
screen (Lesson 5 already handled that) but fully closing the app and
reopening it. The inventory list itself starts highlighting any item at
or below that threshold in red. The transferable problem: every item
this project has ever added or removed has lived only in this
process's memory — close the app entirely (not just background it) and
all of it is gone, seed data and all, the instant the process itself
ends. `onSaveInstanceState` never protected against that; it was never
built to.

**What you need to know first:** Lesson 5 (`onSaveInstanceState`, and
specifically *why* it doesn't fully solve this lesson's problem —
rotation destroys and recreates an Activity, but the OS process itself
stays alive the whole time). Lesson 9 (`EditText`, the exact
`try`/`catch` validation pattern this lesson reuses for a single
field). Lesson 6e/7 (`InventoryAdapter`, `Item`).

**Terms introduced in this lesson:**
- **`getSharedPreferences(name, mode)`** — returns a `SharedPreferences`
  object backed by a named file the OS manages on internal storage.
- **`SharedPreferences`** — Android's small key-value persistent
  storage; read-only itself, writing requires a separate `Editor`.
- **`MODE_PRIVATE`** — means the preferences file is only readable by
  this app itself.
- **`SharedPreferences.getInt(key, default)`** — reads an `int` by key,
  falling back to the given default if the key was never written.
- **`String.valueOf(value)`** — converts a primitive value into its
  `String` representation.
- **`SharedPreferences.Editor`** — the object required to write changes
  to `SharedPreferences`, obtained via `.edit()`.
- **`Editor.putInt(key, value)`** — stages a value to be written; saves
  nothing until `.apply()` is called.
- **`Editor.apply()`** — commits every staged `put...` call to disk,
  asynchronously.
- **Promoting a local variable to a field** — moving a variable from a
  method-local scope to a class field so a different method can access
  the same value later.
- **`notifyDataSetChanged()`** — a `RecyclerView.Adapter` method
  telling the `RecyclerView` that every row's appearance might have
  changed, as opposed to one specific position.
- **`setTextColor(int color)`** — sets a `TextView`'s text color at
  runtime, e.g. via the predefined `Color.RED`/`Color.BLACK` constants.

---

## Concept Unit: Process Death Is Not Configuration Change

### The Problem

Lesson 5 proved rotation destroys and recreates `MainActivity`, and
that `onSaveInstanceState` rescues a field across it. It's tempting to
assume that fix is general-purpose — good for surviving *anything*.
Prove the gap yourself, directly against the running app, before
building the real fix.

### Introduce the Concept in Isolation

No throwaway lab needed — this is best proven directly against
`InventoryActivity`, using tools you already have. Add two temporary
lines inside `onCreate`, right after `setContentView`:

```java
int scratchValue = 5;
android.util.Log.d("Scratch", "scratchValue = " + scratchValue);
```

Run the app, confirm Logcat shows `scratchValue = 5`. Now, in the
emulator, open **Recent Apps** and swipe Pocket Inventory away entirely
— not just press Home, which only backgrounds it. This genuinely
terminates the OS process. Relaunch from the launcher icon and check
Logcat again: still `scratchValue = 5`, which proves nothing yet, since
`5` was always the hardcoded value. Now change the line to something
that only means something if it truly persisted:

```java
int scratchValue = 5;
scratchValue = scratchValue + 1;
android.util.Log.d("Scratch", "scratchValue = " + scratchValue);
```

Run it, confirm Logcat now shows `6`. Swipe the app away and relaunch
it again. It prints `6` again — not `7` — because `scratchValue = 5`
runs fresh, from source, every single time a brand-new `MainActivity`
object is constructed by a brand-new process. Nothing about the old
process's memory survived; there was no old process to survive in.

Delete both temporary lines — this was only ever a demonstration of the
gap, never part of the real feature.

### Mechanical Walkthrough

- `android.util.Log.d("Scratch", "scratchValue = " + scratchValue)` —
  **first appearance.** Writes one line to Logcat, the Android emulator
  and device's system-wide log stream — the `"Scratch"` argument is a
  *tag*, an arbitrary label used to filter Logcat down to just this
  app's own messages among everything else the OS is logging at the
  same time; the second argument is the actual message text.
- **Recent Apps → swipe away**, as opposed to pressing **Home** — the
  actual mechanism this unit hinges on. Home only moves an app's
  process to the background, where Android generally keeps it alive
  and ready to resume instantly; swiping it away in Recent Apps tells
  the OS to fully terminate that process. Relaunching afterward starts
  a genuinely new process from scratch, running every field
  initializer in `MainActivity`/`InventoryActivity` again from source
  — which is the entire reason `scratchValue = 5` reappears instead of
  the `6` a live process would still be holding.

### CS Lens

This is the general distinction between **volatile and non-volatile
state** — memory that exists only while a process runs, versus storage
that outlives the process entirely. Also recognized in: a server's
in-memory cache (gone on restart) versus its database (survives
restart), a video game's current run state versus its save file, and
RAM versus disk in any computer's storage hierarchy. This project's own
sibling WPF curriculum names the identical distinction, independently,
at the same point in its own sequence.

### SE Lens

**Why does this deserve its own concept unit instead of just trusting
"persistence" as one idea already covered by `onSaveInstanceState`?**
Because the two failures this project can suffer are genuinely
different in scope, and conflating them leads to a real, common bug:
code that only handles configuration change (a `Bundle`) silently does
nothing when the actual failure is process death. Naming them
separately — "does this survive rotation" versus "does this survive the
app being closed" — is what makes it possible to pick the *correct*
tool (a `Bundle` for one, real storage for the other) instead of
reaching for whichever one you happen to remember first.

---

## Concept Unit: `SharedPreferences` — a Small, Durable Key-Value Store

### The Problem

You need somewhere for a low-stock threshold to actually live — outside
process memory, on the device's persistent storage, read on every app
launch and written whenever the user changes it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `SettingsActivity.java`, new file
  `activity_settings.xml`, `AndroidManifest.xml` (wizard-managed),
  `activity_inventory.xml`.
- **Change type:** Create, configure, add.
- **Dependencies:** none new — `SharedPreferences` is already part of
  the Android framework.

### The New Code — the Settings Screen

Create `SettingsActivity` through the same wizard flow as every prior
Activity in this project (reappearing, not re-explained). Replace
`activity_settings.xml`:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:id="@+id/thresholdLabel"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="48dp"
        android:text="Low-stock warning threshold"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <EditText
        android:id="@+id/thresholdInput"
        android:layout_width="120dp"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:inputType="number"
        app:layout_constraintTop_toBottomOf="@id/thresholdLabel"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <Button
        android:id="@+id/saveSettingsButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="24dp"
        android:text="Save"
        app:layout_constraintTop_toBottomOf="@id/thresholdInput"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### The Updated Project

A new file, everything in it reappearing — `ConstraintLayout`,
`TextView`, `EditText` with `toBottomOf` chaining, `Button`. The one new
detail: `android:layout_width="120dp"` on the `EditText` is a *fixed*
width rather than `0dp`'s stretch-to-fill, appropriate here since a
short numeric field has no reason to stretch across the whole screen.

### The New Code — Reading and Writing the Preference

```java
package com.yourname.pocketinventory;

import androidx.appcompat.app.AppCompatActivity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;

public class SettingsActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE);
        EditText thresholdInput = findViewById(R.id.thresholdInput);
        Button saveSettingsButton = findViewById(R.id.saveSettingsButton);

        int currentThreshold = prefs.getInt("low_stock_threshold", 5);
        thresholdInput.setText(String.valueOf(currentThreshold));

        saveSettingsButton.setOnClickListener(v -> {
            String text = thresholdInput.getText().toString().trim();
            try {
                int threshold = Integer.parseInt(text);
                SharedPreferences.Editor editor = prefs.edit();
                editor.putInt("low_stock_threshold", threshold);
                editor.apply();
                finish();
            } catch (NumberFormatException e) {
                thresholdInput.setError("Enter a whole number");
            }
        });
    }
}
```

### The Updated Project

This is the whole new file — `onCreate`, `setContentView`,
`findViewById`, `setOnClickListener`, and the `try`/`catch` around
`Integer.parseInt` are all reappearing, the exact validation pattern
Lesson 9 proved, now guarding a single field instead of three.

### Mechanical Walkthrough

- `getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE)` —
  **first appearance.** Returns a `SharedPreferences` object backed by a
  small file the OS manages on the device's own internal storage, named
  by the first argument — an app can have several named preference
  files, though this project only ever needs one.
- `MODE_PRIVATE` — **first appearance.** Means this file is only
  readable by this app itself — the only mode generally recommended;
  other historical modes allowed cross-app sharing and are now
  deprecated for security reasons.
- `prefs.getInt("low_stock_threshold", 5)` — **first appearance.** Same
  shape as `Bundle.getInt` from `onSaveInstanceState`'s own work — a
  string key, plus a required default for the very first time the app
  ever runs, before this key has ever been written.
- `String.valueOf(currentThreshold)` — **first appearance.** Converts a
  primitive `int` into a `String` — the reverse direction of
  `Integer.parseInt`, needed here because `EditText.setText` expects a
  `CharSequence`/`String`, never a raw `int`.
- `prefs.edit()` — **first appearance.** `SharedPreferences` itself is
  read-only; writing requires a separate `Editor` object, a deliberate
  split explained in this unit's SE Lens.
- `editor.putInt("low_stock_threshold", threshold)` — **first
  appearance.** Stages a value to be written — critically, this call
  alone does not save anything yet.
- `editor.apply()` — **first appearance.** Commits every staged `put...`
  call to disk, asynchronously, in the background — this call returns
  immediately, without waiting for the write to actually finish.

### CS Lens

`SharedPreferences` is a small instance of **key-value persistent
storage** — the same fundamental shape as a `Map`, but backed by disk
instead of RAM, so its contents outlive the process that wrote them.
Also recognized in: browser `localStorage`, a `.env` or `.ini` config
file read at program startup, Redis used as a simple persistent cache,
and this project's own sibling WPF curriculum reaching for exactly this
same shape of solution — a small settings file — independently.

### SE Lens

**Why does writing require a separate `Editor` object instead of just
calling `prefs.putInt(...)` directly?** The alternative — mutate
`SharedPreferences` in place — would leave it unclear whether each
individual `put` call triggers its own disk write, or several. The
`Editor` makes batching explicit: stage as many `put...` calls as you
want, and exactly one `apply()` flushes all of them together as one
write. The cost is one extra object type to hold in mind for what's
conceptually a simple map update — a small, deliberate price for an API
that can't accidentally perform ten separate disk writes when you meant
one.

---

## Concept Unit: Reading the Preference Back Into the List

### The Problem

The threshold is now durably saved, but nothing on the inventory screen
reacts to it yet.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `activity_inventory.xml`, `InventoryActivity.java`,
  `InventoryAdapter.java`.
- **Change type:** Add, modify.
- **Dependencies:** `SettingsActivity`, built above.

### The New Code — a Settings Button

```xml
<Button
    android:id="@+id/settingsButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginTop="8dp"
    android:text="Settings" />
```

### The Updated Project

Added as a new child at the end of `activity_inventory.xml`'s existing
form `LinearLayout`, directly below `addItemButton`:

```xml
<LinearLayout
    android:id="@+id/addItemForm"
    android:orientation="vertical"
    android:layout_width="0dp"
    android:layout_height="wrap_content"
    android:padding="16dp"
    app:layout_constraintTop_toTopOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toEndOf="parent">

    <EditText
        android:id="@+id/nameInput"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Item name"
        android:inputType="text" />

    <EditText
        android:id="@+id/quantityInput"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:hint="Quantity"
        android:inputType="number" />

    <EditText
        android:id="@+id/locationInput"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:hint="Location"
        android:inputType="text" />

    <Button
        android:id="@+id/addItemButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Add Item" />

    <Button
        android:id="@+id/settingsButton"                                    <!-- ← new -->
        android:layout_width="match_parent"                                  <!-- ← new -->
        android:layout_height="wrap_content"                                 <!-- ← new -->
        android:layout_marginTop="8dp"                                       <!-- ← new -->
        android:text="Settings" />                                           <!-- ← new -->

</LinearLayout>
```

### Mechanical Walkthrough

- `<Button ... android:text="Settings" />` — reappearing, identical
  shape to every other button already in this form, simply stacked
  below it by the same vertical `LinearLayout` that already arranges
  the rest.

### The New Code — Wiring Navigation and the Highlight

```java
Button settingsButton = findViewById(R.id.settingsButton);
settingsButton.setOnClickListener(v ->
        startActivity(new Intent(InventoryActivity.this, SettingsActivity.class)));
```

```java
@Override
protected void onResume() {
    super.onResume();
    SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE);
    int threshold = prefs.getInt("low_stock_threshold", 5);
    adapter.setLowStockThreshold(threshold);
}
```

In `InventoryAdapter.java`:

```java
private int lowStockThreshold = 5;

void setLowStockThreshold(int threshold) {
    this.lowStockThreshold = threshold;
    notifyDataSetChanged();
}
```

And inside `onBindViewHolder`, after setting the detail text:

```java
if (item.getQuantity() <= lowStockThreshold) {
    holder.itemDetailText.setTextColor(android.graphics.Color.RED);
} else {
    holder.itemDetailText.setTextColor(android.graphics.Color.BLACK);
}
```

### The Updated Project

`onResume` is a method, not a lambda — it needs to reach the same
`adapter` the click listeners inside `onCreate` already use, which
means `adapter` can no longer be a plain local variable scoped to
`onCreate` alone. It becomes a field:

```java
public class InventoryActivity extends AppCompatActivity {
    private InventoryAdapter adapter;                                                    // ← changed (was a local variable)

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<Item> items = new ArrayList<>();
        items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));
        items.add(new Item("Shop Rags", 12, "Shelf B"));
        items.add(new Item("Cutting Oil", 3, "Shelf B"));
        items.add(new Item("Digital Calipers", 2, "Toolbox 1"));
        items.add(new Item("Safety Glasses", 8, "Shelf A"));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(items, item -> {                                  // ← changed (was "final InventoryAdapter adapter =")
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

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

            adapter.addItem(new Item(name, quantity, location));
            nameInput.setText("");
            quantityInput.setText("");
            locationInput.setText("");
        });

        Button settingsButton = findViewById(R.id.settingsButton);                       // ← new
        settingsButton.setOnClickListener(v ->                                            // ← new
                startActivity(new Intent(InventoryActivity.this, SettingsActivity.class))); // ← new
    }

    @Override
    protected void onResume() {                                                           // ← new
        super.onResume();                                                                  // ← new
        SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE); // ← new
        int threshold = prefs.getInt("low_stock_threshold", 5);                            // ← new
        adapter.setLowStockThreshold(threshold);                                           // ← new
    }                                                                                       // ← new
}
```

`onCreate` now also wires the Settings button, using the identical
navigation pattern as every other button in this project. The new
`onResume` override reads the current threshold from disk and pushes
it into the adapter — placed in `onResume`, deliberately, not
`onCreate`, since `onCreate` only ever runs once per Activity instance,
while `onResume` runs every single time this screen becomes visible
again, including the moment control returns from `SettingsActivity`
after the threshold changes.

### Mechanical Walkthrough

- `private InventoryAdapter adapter;` as a field, `adapter = new InventoryAdapter(...)`
  inside `onCreate` — **first appearance of promoting a local variable
  to a field for this specific reason.** `onResume`, a separate method,
  needs to call `adapter.setLowStockThreshold(...)` — a local variable
  scoped to `onCreate` would already be gone by the time `onResume` runs;
  only a field survives across separate method calls on the same
  object.
- `onResume()` override — reappearing (the lifecycle method itself,
  Lesson 5's logging lab), now doing genuine work for the first time:
  the concrete payoff of having labbed the full lifecycle order back
  then — choosing `onResume` here isn't arbitrary, it's a direct
  application of "this runs every time the screen becomes visible
  again," which `onCreate` does not.
- `getSharedPreferences(...)`, `prefs.getInt(...)` — reappearing, from
  earlier this lesson, now read from the *reading* side
  (`InventoryActivity`) rather than the writing side
  (`SettingsActivity`) — same file, same key, two different Activities
  agreeing on both strings by convention, not by any compiler-checked
  contract. Worth flagging as a real, sharp edge: a typo in either key
  string would compile fine and silently read the default instead of
  erroring.
- `adapter.setLowStockThreshold(threshold)` — calls the new method,
  built next.
- `void setLowStockThreshold(int threshold) { this.lowStockThreshold = threshold; notifyDataSetChanged(); }`
  — **first appearance of `notifyDataSetChanged()`.** Unlike
  `notifyItemInserted`/`notifyItemRemoved`, which each name one specific
  row, this tells the `RecyclerView` "assume every row's appearance
  might now be different" — the correct, honest choice here, since
  changing the threshold can affect the highlight state of every
  visible row at once, not one specific position.
- `item.getQuantity() <= lowStockThreshold` — reappearing (`Item`
  getter; `<=` comparison, already basic).
- `holder.itemDetailText.setTextColor(android.graphics.Color.RED)` /
  `.setTextColor(android.graphics.Color.BLACK)` — **first appearance.**
  `Color.RED`/`Color.BLACK` are predefined integer color constants;
  `setTextColor` applies one to a `TextView`'s text directly from Java
  — the runtime counterpart to a color you could otherwise only set in
  XML.

### CS Lens

Refreshing derived state (`lowStockThreshold`, and therefore every
row's highlight) specifically in `onResume` rather than only once in
`onCreate` is an instance of the general **"read fresh state on every
becomes-active transition"** pattern — never trusting that data read
once at startup is still current. Also recognized in: a mobile app
re-checking auth-token validity every time it returns to the
foreground, a dashboard re-fetching data on tab focus rather than
trusting a stale initial load, and cache-invalidation-on-access
strategies generally.

### SE Lens

**Why compute the highlight inside `onBindViewHolder` on every bind,
rather than storing a `isLowStock` boolean directly on `Item` and
setting it once?** Because "low stock" isn't a fact about the item
itself — it's a fact about the *relationship* between the item's
quantity and a threshold that can change independently, at any time,
from a completely different screen. Storing a stale boolean on `Item`
would require finding and updating every existing `Item` object the
moment the threshold changes; recomputing it at bind time means the
adapter's own `notifyDataSetChanged()` call is the only thing that ever
needs to know the threshold changed at all.

### Run It

Run the app. Items at or below the default threshold of `5` ("Cutting
Oil," qty `3`; "Digital Calipers," qty `2`) show their detail line in
red. Tap Settings, change the threshold to `1`, save, and return to the
list — now neither item is red, since both quantities (`2` and `3`)
sit above `1`. Fully close the app (swipe away in Recent Apps) and
reopen it: the threshold is still `1`, not reset to `5` — the actual
proof this lesson set out to deliver, in direct contrast to this
lesson's own opening demonstration that a plain field resets every
time.

## Connect the Pieces

Full trace: the user taps Settings → `SettingsActivity` reads the
current threshold via `prefs.getInt(..., 5)` and pre-fills the field →
the user types a new value, taps Save → `Integer.parseInt` validates it
inside the same `try`/`catch` shape Lesson 9 proved → `editor.putInt(...)`
plus `.apply()` write it to the on-disk preferences file, durably,
outside process memory entirely → `finish()` returns to
`InventoryActivity` → `onResume` (not `onCreate` — the screen was never
destroyed, only covered, exactly the back-stack behavior Lesson 5
proved) fires automatically → reads the freshly-saved value back with
the same key string → `adapter.setLowStockThreshold(...)` stores it and
calls `notifyDataSetChanged()` → every visible row's `onBindViewHolder`
reruns, each one comparing its own `Item`'s quantity against the new
threshold to decide red or black — and none of it depends on the
process ever having stayed alive, which is exactly the property
`onSaveInstanceState` could never have provided.

## What Breaks Without This

In `SettingsActivity`, temporarily delete just the `editor.apply()`
line, leaving `editor.putInt(...)` orphaned with no matching commit.
Change the threshold, save, and confirm the list still updates
immediately — it will, since `InventoryActivity`'s `onResume` reads
straight after `SettingsActivity` finishes, and `putInt` staged the
value in memory even before any disk write happened. Now fully close
and reopen the app: the threshold has silently reverted to its old
value, because nothing ever actually persisted it to disk — a subtle
bug that looks completely correct in the very next moment and only
reveals itself after a real process restart, exactly why this lesson
insisted on testing with a full app swipe-away, not just navigating
back and forth. Restore `editor.apply()` afterward.

## Exercises

1. Deliberately use two different key strings for reading versus
   writing the threshold (e.g. write `"low_stock_threshold"` but read
   `"lowStockThreshold"`). Confirm this compiles fine and produces a
   silent, wrong default — the sharp edge flagged in this lesson's
   Mechanical Walkthrough. Fix it afterward.
2. Predict, then verify: does rotating the phone while sitting on
   `SettingsActivity`, *before* tapping Save, lose whatever you'd
   already typed into `thresholdInput`? Connect your answer to Lesson
   5's own lifecycle work, not this lesson's.

## Definition of Done

- [ ] You proved process death loses in-memory state using a real
      swipe-away test, not just reading about it.
- [ ] The Settings screen reads, validates, and durably saves a
      low-stock threshold.
- [ ] The inventory list highlights low-stock items in red, refreshed
      correctly via `onResume` after returning from Settings.
- [ ] You confirmed the threshold survives a full app close and
      reopen, not just backgrounding.
- [ ] You can explain, in your own words, why `adapter` had to become a
      field this lesson.
- [ ] Commit: message explaining why (e.g. "Persist a low-stock
      threshold via SharedPreferences and highlight low-stock rows,
      since onSaveInstanceState only survives configuration changes,
      not the process itself ending").

Lesson 11 is next: swiping a row away to delete it — and why removing
one element from the middle of a list means every element after it
silently shifts to a new position.
