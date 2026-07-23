# Lesson 11: Small Facts That Persist — SharedPreferences

**What you will build:** A real Settings screen with a single
"low-stock threshold" number, saved so it survives not just rotation
(Lesson 5 already handled that) but the app being fully closed and
reopened — and the inventory list visibly highlighting any item at or
below that threshold. The transferable problem: `onSaveInstanceState`
rescues state across a *configuration change*, but the object holding
it is still alive, in memory, the whole time. Fully closing an app —
swiping it away, force-stopping it, restarting the phone — destroys the
entire process, `Bundle` and all. Real persistence needs to live
somewhere that survives the process itself: this lesson's answer, for
small settings, is `SharedPreferences`; Lessons 12–13 give the
inventory data itself a stronger answer for the same underlying
problem.

**What you need to know first:** Lesson 5 (`onSaveInstanceState`, and
specifically why it doesn't fully solve this — the Problem below
depends on that distinction), Lesson 9 (`EditText`, validation), Lesson
6/7 (`InventoryAdapter`, `Item`).

---

## Concept Unit: Process Death Is Not Configuration Change

### The Problem

Lesson 5 proved rotation destroys and recreates an Activity, and that
`onSaveInstanceState` rescues a field across it. It's tempting to
assume that fix is general-purpose. It isn't. Prove the gap yourself
before building the real fix.

### Introduce the Concept in Isolation

No lab needed — this is best proven directly against the running app,
using tools you already have. Add a temporary field and log line to
`InventoryActivity`:

```java
private int lowStockThreshold = 5;
```

Add, anywhere in `onCreate`: `Log.d("Settings", "Threshold: " + lowStockThreshold);`.
Run the app, confirm Logcat shows `Threshold: 5`. Now, in the emulator,
open **Recent Apps** and swipe Pocket Inventory away entirely (not just
press Home) — this actually terminates the process, unlike backgrounding
it. Relaunch the app from the launcher icon and check Logcat again: it
still says `Threshold: 5`, which proves nothing yet, because `5` was
always the hardcoded default. The real test is this: temporarily change
the initializer to read from a variable you mutate at runtime — for
instance, add a second temporary line right after the field's
declaration-time value, inside `onCreate`: `lowStockThreshold = 99;`
then log it, confirm `99`, then repeat the swipe-away-and-relaunch. It
prints `5` again — the *original* field initializer — never `99`. A
brand-new process ran your class's field initializers from scratch;
whatever the old process held in memory, including anything
`onSaveInstanceState` would have rescued *within* that process's
lifetime, is simply gone once the process itself is gone.

Delete both temporary lines (the field and the `lowStockThreshold = 99;`
override) — this was only ever a demonstration of the gap, not part of
the real feature, which needs actual persistent storage.

### CS Lens

This is the general distinction between **volatile and non-volatile
state** — memory that exists only while a process runs, versus storage
that outlives the process entirely. Also recognized in: a server's
in-memory cache (gone on restart) versus its database (survives
restart), a video game's current run state versus its save file, and
RAM versus disk in any computer's storage hierarchy.

---

## Concept Unit: `SharedPreferences` — a Small, Durable Key-Value Store

### The Problem

You need somewhere for `lowStockThreshold` to actually live — outside
process memory, on the device's persistent storage, read on every app
launch and written whenever the user changes it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `SettingsActivity.java`, new file
  `activity_settings.xml`, `AndroidManifest.xml` (wizard-managed),
  `activity_inventory.xml`, `InventoryActivity.java`.
- **Change type:** Create, configure, add.
- **Dependencies:** none new — `SharedPreferences` is part of the
  Android framework already available.

### The New Code — the Settings Screen

Create `SettingsActivity` via the same wizard flow as every prior
Activity in this project (**reappearing**, Lesson 4/8/9). Replace
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

A new file, everything in it — `ConstraintLayout`, `TextView`,
`EditText` with `inputType="number"`, `Button`, `toBottomOf` chaining —
**reappearing** from Lesson 3, 5, and 9. The only new detail:
`android:layout_width="120dp"` on the `EditText` is a fixed width
rather than `0dp`'s stretch-to-fill from Lesson 9, appropriate for a
short numeric field that doesn't need the full screen width.

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

This is the whole new file — the `onCreate` override, `setContentView`,
`findViewById`, `setOnClickListener`, and the `try`/`catch` around
`Integer.parseInt` are all **reappearing**, from Lesson 2, 4, and 9's
validation pattern reused for a single field instead of three.

### Mechanical Walkthrough

- `getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE)` —
  **first appearance.** Returns a `SharedPreferences` object backed by
  a small file the OS manages on the device's internal storage, named
  by the first argument — an app can have multiple named preference
  files, though this project only needs one. `MODE_PRIVATE` — **first
  appearance** — means this file is only readable by your own app
  (the only mode generally recommended; other modes historically
  allowed cross-app sharing and are now deprecated for security
  reasons).
- `prefs.getInt("low_stock_threshold", 5)` — **first appearance.**
  Same shape as `Bundle.getInt` from Lesson 5's `onSaveInstanceState`
  work — a string key, a required default for when the key has never
  been set (true the very first time the app ever runs).
- `String.valueOf(currentThreshold)` — **first appearance.** Converts a
  primitive `int` into a `String` — the reverse direction of
  `Integer.parseInt`, needed here because `EditText.setText` expects a
  `CharSequence`/`String`, not an `int`.
- `prefs.edit()` — **first appearance.** `SharedPreferences` itself is
  read-only; writing requires a separate `Editor` object — a
  deliberate split, explained below in the SE Lens.
- `editor.putInt("low_stock_threshold", threshold)` — **first
  appearance.** Stages a value to be written — critically, **this call
  alone does not save anything yet**.
- `editor.apply()` — **first appearance.** Commits every staged
  `put...` call to disk, asynchronously, in the background — the call
  returns immediately without waiting for the write to finish.
- The `try`/`catch` around `Integer.parseInt(text)` — **reappearing**,
  the exact mechanism from Lesson 9, applied to a single field instead
  of three.

### CS Lens

`SharedPreferences` is a small instance of **key-value persistent
storage** — the same fundamental shape as a `Map`/`Dictionary`, but
backed by disk instead of RAM, so its contents outlive the process that
wrote them. Also recognized in: browser `localStorage`, a `.ini` or
`.env` config file read at program startup, Redis used as a simple
persistent cache, and Windows Registry key-value entries.

### SE Lens

**Why does writing require a separate `Editor` object instead of just
calling `prefs.putInt(...)` directly?** The alternative — mutate
`SharedPreferences` in place — would make it unclear whether each
individual `put` call triggers its own disk write or not; batching
several changes together (say, writing three settings from one screen)
would either mean three separate disk writes or an ambiguous API. The
`Editor` makes batching explicit: stage as many `put...` calls as you
want, and exactly one `apply()` (or `commit()`, its synchronous,
blocking twin — used when you specifically need to *know* the write
finished before continuing, at the cost of blocking the calling
thread — not used here, since Lesson 14 covers thread-blocking costs
properly) flushes them all together as one write operation. The cost is
one more object type to remember (`Editor`) for what's conceptually a
simple map update.

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

### The New Code — Navigating to Settings

Add a third button to `activity_inventory.xml`, alongside
`addItemButton` (both anchored to the bottom — this project will
consolidate these into a real toolbar in Lesson 21; for now, a second
button next to the first is the honest, simplest working version):

```xml
<Button
    android:id="@+id/settingsButton"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginBottom="16dp"
    android:text="Settings"
    app:layout_constraintBottom_toBottomOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toStartOf="@id/addItemButton" />
```

And change `addItemButton`'s horizontal constraints so the two sit
side by side instead of both centered on the full width:

```xml
app:layout_constraintStart_toEndOf="@id/settingsButton"
app:layout_constraintEnd_toEndOf="parent"
```

### The Updated Project

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/inventoryRecyclerView"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toTopOf="@id/addItemButton"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <Button
        android:id="@+id/settingsButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="16dp"
        android:text="Settings"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toStartOf="@id/addItemButton" />

    <Button
        android:id="@+id/addItemButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="16dp"
        android:text="+ Add Item"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toEndOf="@id/settingsButton"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

The bottom row now holds two buttons side by side —`settingsButton`'s
`End` anchored to `addItemButton`'s `Start`, and vice versa, each one's
opposite outer edge anchored to the parent, splitting the row into two
roughly equal halves through mutual constraint rather than a fixed
pixel split.

### Mechanical Walkthrough

- `app:layout_constraintEnd_toStartOf="@id/addItemButton"` and its
  mirror `app:layout_constraintStart_toEndOf="@id/settingsButton"` —
  **first appearance of this specific pairing**, though each individual
  constraint direction is reappearing (Lesson 5/9's sibling-anchoring):
  two views each constrained to the *other's* facing edge is what
  places them side by side without either needing a hardcoded width or
  position.

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

And inside `onBindViewHolder`, after setting the text:

```java
if (item.getQuantity() <= lowStockThreshold) {
    holder.itemDetailText.setTextColor(android.graphics.Color.RED);
} else {
    holder.itemDetailText.setTextColor(android.graphics.Color.BLACK);
}
```

### The Updated Project

`InventoryActivity` gains a real `onResume` override — the lifecycle
method labbed for logging back in Lesson 5, now doing genuine work for
the first time:

```java
public class InventoryActivity extends AppCompatActivity {
    private List<Item> items;
    private InventoryAdapter adapter;

    private ActivityResultLauncher<Intent> addItemLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
        if (result.getResultCode() == RESULT_OK && result.getData() != null) {
            Item newItem = result.getData().getParcelableExtra("EXTRA_NEW_ITEM");
            if (newItem != null) {
                items.add(newItem);
                adapter.notifyItemInserted(items.size() - 1);
            }
        }
    });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        items = new ArrayList<>();
        items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));
        items.add(new Item("Shop Rags", 12, "Shelf B"));
        items.add(new Item("Cutting Oil", 3, "Shelf B"));
        items.add(new Item("Digital Calipers", 2, "Toolbox 1"));
        items.add(new Item("Safety Glasses", 8, "Shelf A"));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(items, item -> {
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);

        Button settingsButton = findViewById(R.id.settingsButton);                       // ← new
        settingsButton.setOnClickListener(v ->                                            // ← new
                startActivity(new Intent(InventoryActivity.this, SettingsActivity.class))); // ← new

        Button addButton = findViewById(R.id.addItemButton);
        addButton.setOnClickListener(v ->
                addItemLauncher.launch(new Intent(InventoryActivity.this, AddItemActivity.class)));
    }

    @Override
    protected void onResume() {                                                          // ← new
        super.onResume();                                                                  // ← new
        SharedPreferences prefs = getSharedPreferences("pocket_inventory_prefs", MODE_PRIVATE); // ← new
        int threshold = prefs.getInt("low_stock_threshold", 5);                            // ← new
        adapter.setLowStockThreshold(threshold);                                           // ← new
    }                                                                                       // ← new
}
```

`onCreate` now also wires the Settings button, using the same
navigation pattern as every button before it. The new `onResume`
override reads the current threshold from disk and pushes it into the
Adapter — deliberately placed in `onResume`, not `onCreate`, since
`onCreate` only runs once per Activity instance (Lesson 5), while
`onResume` runs every time this screen becomes visible again, including
returning from `SettingsActivity` after changing the value.

### Mechanical Walkthrough

- `settingsButton.setOnClickListener(...)`, `startActivity(new Intent(...))`
  — reappearing, same pattern as `addButton`/`ItemDetailActivity`
  navigation.
- `onResume()` override — **reappearing** from Lesson 5's lifecycle
  logging lab, now doing real work for the first time: this is the
  concrete payoff of having labbed the full lifecycle order back then —
  choosing `onResume` here isn't arbitrary, it's a direct application
  of "this runs every time the screen becomes visible again," which
  `onCreate` does not.
- `getSharedPreferences(...)`, `prefs.getInt(...)` — reappearing, from
  earlier this lesson, now read from the *reading* side (`InventoryActivity`)
  rather than the writing side (`SettingsActivity`) — same file, same
  key, two different Activities agreeing on both strings by convention,
  not by any compiler-checked contract (worth flagging as a real, sharp
  edge — a typo in either key string would silently read the default
  instead of erroring).
- `adapter.setLowStockThreshold(threshold)` — calls the new method,
  built next.
- `private int lowStockThreshold = 5;` in `InventoryAdapter` —
  reappearing (field with initializer, Lesson 5).
- `void setLowStockThreshold(int threshold) { this.lowStockThreshold = threshold; notifyDataSetChanged(); }`
  — **first appearance of `notifyDataSetChanged()`** in the real
  project (mentioned but not used in Lesson 10). Unlike
  `notifyItemInserted`, which named one specific row, this tells
  `RecyclerView` "assume every row's appearance might now be different"
  — the correct, honest choice here, since changing the threshold can
  affect the highlight state of *every* visible row at once, not one
  specific position.
- `item.getQuantity() <= lowStockThreshold` — reappearing (`Item`
  getter, Lesson 7; `<=` comparison, already basic).
- `holder.itemDetailText.setTextColor(android.graphics.Color.RED)` /
  `.setTextColor(android.graphics.Color.BLACK)` — **first appearance.**
  `Color.RED`/`Color.BLACK` are predefined integer color constants;
  `setTextColor` applies one to a `TextView`'s text directly from Java,
  the runtime counterpart to a color you could otherwise only set in
  XML.

### Run It

Run the app. Items at or below the default threshold of 5 ("Cutting
Oil," qty 3; "Digital Calipers," qty 2) show their detail line in red.
Tap Settings, change the threshold to `1`, save, return to the list —
only "Digital Calipers" (qty 2 is still above 1) — wait, recompute:
with threshold 1, qty 2 and 3 are both above it, so neither is
red; confirm this matches what you see. Now fully close the app
(swipe away in Recent Apps) and reopen it: the threshold is still `1`,
not reset to `5` — the actual proof this lesson set out to deliver, in
contrast to the opening unit's demonstration that a plain field
resets every time.

### CS Lens

Refreshing derived state (`lowStockThreshold`, and therefore every
row's highlight) specifically in `onResume` rather than only once in
`onCreate` is an instance of the general **"read fresh state on every
becomes-active transition"** pattern — never trusting that data read
once at startup is still current. Also recognized in: a mobile app
re-checking auth token validity every time it returns to the
foreground, a dashboard re-fetching data on tab focus rather than
relying on a stale initial load, and cache-invalidation-on-access
strategies in general.

---

## Connect the Pieces

Full trace: the user taps Settings → `SettingsActivity` reads the
current threshold via `prefs.getInt(..., 5)` and pre-fills the field →
the user types a new value, taps Save → `Integer.parseInt` validates it
(Lesson 9's exact `try`/`catch` pattern) → `editor.putInt(...)` and
`.apply()` write it to the on-disk preferences file, durably, outside
process memory entirely → `finish()` returns to `InventoryActivity` →
`onResume` (not `onCreate` — the screen was never destroyed, only
covered, exactly Lesson 5's stack behavior) fires automatically →
reads the freshly-saved value back with the same key string →
`adapter.setLowStockThreshold(...)` stores it and calls
`notifyDataSetChanged()` → every visible row's `onBindViewHolder` reruns,
each one comparing its own `Item`'s quantity against the new threshold
to decide red or black — and none of it depends on the process ever
having stayed alive, which is the one property `onSaveInstanceState`
from Lesson 5 could never have provided.

## What Breaks Without This

In `SettingsActivity`, temporarily change `editor.apply()` to nothing
at all (delete the line, leaving `editor.putInt(...)` orphaned with no
matching commit). Change the threshold, save, confirm the list still
updates immediately (it will — `InventoryActivity`'s `onResume` reads
straight after `SettingsActivity` finishes, and `putInt` did stage the
value in memory even before any disk write). Now fully close and
reopen the app: the threshold has reverted to its old value, because
nothing ever actually persisted it to disk — a subtle bug that looks
correct in the very next moment and only reveals itself after a real
process restart, which is exactly why this lesson insisted on testing
with a full app swipe-away, not just navigating back and forth. Restore
`editor.apply()` afterward.

## Exercises

1. Add a second preference: a `boolean` "show location column"
   (`prefs.getBoolean`/`editor.putBoolean`), controlled by a `CheckBox`
   (a new widget — look up its `isChecked()` method and
   `setOnCheckedChangeListener`) on the Settings screen, and use it to
   conditionally hide `itemDetailText`'s location text
   (`view.setVisibility(View.GONE)` versus `View.VISIBLE`).
2. Deliberately use two different key strings for reading versus
   writing the threshold (e.g. write `"low_stock_threshold"` but read
   `"lowStockThreshold"`), confirming for yourself that this compiles
   fine and produces a silent, wrong default — the sharp edge flagged
   in the Mechanical Walkthrough. Fix it and consider, for yourself,
   why a shared `private static final String` constant for the key
   (defined once, referenced from both Activities) would remove this
   entire class of bug — a real improvement you're welcome to make
   permanent in your own project.

## Definition of Done

- [ ] You proved process death loses in-memory state that
      `onSaveInstanceState` cannot rescue, using a real swipe-away test,
      not just reading about it.
- [ ] The Settings screen reads, validates, and durably saves a
      low-stock threshold.
- [ ] The inventory list highlights low-stock items in red, refreshed
      correctly via `onResume` after returning from Settings.
- [ ] You confirmed the threshold survives a full app close and
      reopen, not just backgrounding.
- [ ] Commit: message explaining why (e.g. "Persist the low-stock
      threshold via SharedPreferences and highlight low-stock rows,
      since Lesson 5's onSaveInstanceState only survives configuration
      changes, not process death").

Lesson 12 is next: `SharedPreferences` is fine for one number, but the
inventory list itself — potentially hundreds of items, each with
several fields, needing search and filtering — needs a real relational
model. Raw SQLite, first, before Room hides most of it in Lesson 13.
