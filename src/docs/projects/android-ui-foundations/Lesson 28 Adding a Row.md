# Lesson 28: Adding a Row

**What you will build:** A real, working "add item" entry point — a
small form for a name and quantity, feeding a new `InventoryItem` into
the same list the grid already displays, with the grid updating
visibly. The transferable problem: adding to the underlying
`ArrayList<InventoryItem>` (Lesson 22) is the easy half of this — the
`RecyclerView` has no way to know the list changed underneath it unless
explicitly told, which is a real, easy-to-forget step this lesson makes
concrete rather than assumed.

**What you need to know first:** Milestone 4 (Lessons 17–27) — the
complete, wired data grid.

**Terms introduced in this lesson:**
- **`AlertDialog` (recognition, real alternative)** — a small, modal
  overlay window Android provides for short, focused input or
  confirmation, without leaving the current screen.
- **`notifyItemInserted`** — the `RecyclerView.Adapter` method that tells
  a `RecyclerView` exactly which single position now holds new data, so
  it can update only what's actually changed.

---

## Concept Unit: Where Does "Add" Live? — Dialog vs. New Screen

### The Problem

Adding a row needs, at minimum, two typed values (a name, a quantity)
before a new `InventoryItem` can be constructed. That small form needs
somewhere to live.

### Option A — a Small Dialog Over the Current Screen

```java
private void showAddItemDialog() {
    LinearLayout dialogLayout = new LinearLayout(this);
    dialogLayout.setOrientation(LinearLayout.VERTICAL);
    dialogLayout.setPadding(48, 24, 48, 24);

    EditText nameInput = new EditText(this);
    nameInput.setHint("Item name");
    EditText quantityInput = new EditText(this);
    quantityInput.setHint("Quantity");
    quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);

    dialogLayout.addView(nameInput);
    dialogLayout.addView(quantityInput);

    new AlertDialog.Builder(this)
        .setTitle("Add Item")
        .setView(dialogLayout)
        .setPositiveButton("Add", (dialog, which) -> {
            String name = nameInput.getText().toString();
            int quantity = Integer.parseInt(quantityInput.getText().toString());
            addItem(name, quantity);
        })
        .setNegativeButton("Cancel", null)
        .show();
}
```

`AlertDialog` builds its widgets **in Java code**, not XML — a real,
notable contrast with every layout this series has built so far, where
XML was always inflated from a resource file. Building a small,
throwaway view hierarchy directly in code, entirely by hand, is a
genuine, valid alternative to XML for something this simple, though it
scales poorly past a handful of widgets.

### Option B — a Dedicated Second Screen

The same shape as Lesson 17's `InventoryActivity`, shown here as real,
working code even though this project builds Option A instead.
`activity_add_item.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

    <EditText
        android:id="@+id/newItemNameField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/item_name_hint" />

    <EditText
        android:id="@+id/newItemQuantityField"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="@string/item_quantity_hint"
        android:inputType="number" />

    <Button
        android:id="@+id/saveItemButton"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="@string/save_button_label" />

</LinearLayout>
```

`AddItemActivity.java`:

```java
package com.yourname.yourapp;

public class AddItemActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_item);

        EditText nameField = findViewById(R.id.newItemNameField);
        EditText quantityField = findViewById(R.id.newItemQuantityField);
        Button saveButton = findViewById(R.id.saveItemButton);

        saveButton.setOnClickListener((view) -> {
            String name = nameField.getText().toString();
            int quantity = Integer.parseInt(quantityField.getText().toString());

            Intent resultIntent = new Intent();
            resultIntent.putExtra("itemName", name);
            resultIntent.putExtra("itemQuantity", quantity);
            setResult(RESULT_OK, resultIntent);
            finish();
        });
    }
}
```

`Intent.putExtra(String, ...)` attaches a named piece of data to an
`Intent` — here used to carry the new item's values back to
`InventoryActivity` — and `setResult(RESULT_OK, resultIntent)` paired
with `finish()` is the real mechanism for "closing this screen and
handing data back to whichever screen started it," requiring the
calling screen to start this Activity via
`registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), ...)`
(the same registered-callback family this series actually builds for
real in the SMS permission milestone) rather than plain `startActivity`.
This full round trip — a second screen, a result contract, and reading
the returned data back on the grid screen — is real, correct, and
noticeably more code than Option A's single dialog for a two-field form.

### The Tradeoff

A dialog keeps the user's context — the grid stays visible underneath,
communicating "you're adding one more thing to what you're already
looking at" — and needs no second Activity, no Manifest entry, no
Intent. Its real cost is exactly what Option A's code shows: building
non-trivial UI in Java instead of XML is more verbose and harder to
visually preview than a layout file, and doesn't scale gracefully if the
form ever needs many fields, validation messages, or its own complex
layout. A dedicated screen scales better for a genuinely complex form and
lets that form be a normal XML layout — at the cost of a real navigation
round-trip (leave the grid, then return to it) for what's conceptually a
small, quick action.

**This project uses a dialog**, since the form genuinely is this small —
two fields — and keeping the grid visible underneath reinforces exactly
what's happening: one more row being added to what's already on screen.
If your own app's "add" form ever grows past a handful of fields, Option
B's dedicated-screen approach is the honestly better-scaling choice, and
nothing about the underlying `addItem`/`notifyItemInserted` mechanism
this lesson builds next would need to change.

### Project Change

- **Reference Source:** `AlertDialog.Builder`'s real, stable, longstanding
  API — `setTitle`, `setView`, `setPositiveButton`, `setNegativeButton`,
  each returning the same `Builder` for chaining, and `.show()` building
  and displaying the dialog, the same builder-then-`.show()` shape
  Lesson 16's `Toast` already used.
- **Files affected:** `InventoryActivity.java`;
  `app/src/main/res/layout/activity_inventory.xml` (one new button).
- **Change type:** Add a button to the layout; add methods to the
  Activity.
- **Dependencies:** None new.

### The New Code

In `activity_inventory.xml`, after the `RecyclerView`:

```xml
<Button
    android:id="@+id/addItemButton"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:text="@string/add_item_button_label" />
```

In `strings.xml`:

```xml
<string name="add_item_button_label">Add Item</string>
```

In `InventoryActivity.java`, two new methods plus wiring:

```java
private void addItem(String name, int quantity) {
    items.add(new InventoryItem(name, quantity));
    adapter.notifyItemInserted(items.size() - 1);
}
```

### The Updated Project

```java
package com.yourname.yourapp;

public class InventoryActivity extends AppCompatActivity {
    private List<InventoryItem> items;      // ← now a field, not a local variable
    private InventoryAdapter adapter;       // ← new field

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        items = new ArrayList<>();
        items.add(new InventoryItem("Bolts", 120));
        items.add(new InventoryItem("Washers", 85));
        items.add(new InventoryItem("Nuts", 200));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new InventoryAdapter(items);          // ← now stored in the field
        recyclerView.setAdapter(adapter);

        Button addItemButton = findViewById(R.id.addItemButton);  // ← new
        addItemButton.setOnClickListener((view) -> showAddItemDialog()); // ← new
    }

    private void showAddItemDialog() {
        LinearLayout dialogLayout = new LinearLayout(this);
        dialogLayout.setOrientation(LinearLayout.VERTICAL);
        dialogLayout.setPadding(48, 24, 48, 24);

        EditText nameInput = new EditText(this);
        nameInput.setHint("Item name");
        EditText quantityInput = new EditText(this);
        quantityInput.setHint("Quantity");
        quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);

        dialogLayout.addView(nameInput);
        dialogLayout.addView(quantityInput);

        new AlertDialog.Builder(this)
            .setTitle("Add Item")
            .setView(dialogLayout)
            .setPositiveButton("Add", (dialog, which) -> {
                String name = nameInput.getText().toString();
                int quantity = Integer.parseInt(quantityInput.getText().toString());
                addItem(name, quantity);
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    private void addItem(String name, int quantity) {
        items.add(new InventoryItem(name, quantity));
        adapter.notifyItemInserted(items.size() - 1);
    }
}
```

Two important, deliberate changes beyond the new methods: `items` and
the new `adapter` are now **fields**, not local variables confined to
`onCreate` — `addItem` (a different method) needs to reach both of them
directly, which only a field, not a local variable, allows (Lesson 13's
own reasoning for fields, now paying off concretely for the first time
since it was introduced).

### Mechanical Walkthrough

- `private List<InventoryItem> items;` promoted from a local variable to
  a field — reappearing (Lesson 13), now genuinely necessary rather than
  stylistic: `onCreate` builds it, `addItem` (called later, from a
  different method entirely) needs to read and modify the exact same
  list.
- `private InventoryAdapter adapter;` — a new field for the same reason:
  `addItem` needs to call a method *on* the adapter after modifying the
  list, so a reference to it must outlive `onCreate`.
- `new LinearLayout(this)`, `.setOrientation(...)`, `.setPadding(...)`,
  `new EditText(this)`, `.setHint(...)`, `dialogLayout.addView(...)` —
  **first appearance of building a `View` tree in Java instead of XML.**
  Every one of these classes and methods already has a direct XML
  equivalent this series has used since Lesson 08
  (`android:orientation`, `android:padding`, `android:hint`, and nesting
  child elements inside a parent tag) — this is the exact same tree
  structure, just built with method calls and constructor arguments
  instead of attributes and nesting, proving XML was never the *only*
  way views could be built, only the far more common and readable one
  for anything beyond a handful of widgets.
- `quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER)` — the Java-
  code equivalent of `android:inputType` (Lesson 10), here restricting
  input to digits only — a legitimate use of a numeric-only input
  restriction, unlike Lesson 10's password field, since a quantity
  genuinely is numeric-only.
- `new AlertDialog.Builder(this)` — **first appearance.** Constructs a
  configurable dialog builder; nothing shows on screen from this line
  alone.
- `.setTitle(...)`, `.setView(dialogLayout)`, `.setPositiveButton("Add", (dialog, which) -> {...})`,
  `.setNegativeButton("Cancel", null)` — each call configures the builder
  and returns the same builder object, letting these calls chain one
  after another (the same **method chaining** shape as
  `Toast.makeText(...).show()`, extended across several calls instead of
  one). `setPositiveButton`'s second argument is a lambda implementing a
  real Android interface (`DialogInterface.OnClickListener`) — the exact
  same interface/lambda mechanism from Lessons 14 and 16, reapplied to a
  dialog button instead of a screen's own `Button`. `setNegativeButton`'s
  second argument, plain `null`, means "dismiss the dialog and do
  nothing else" — a legitimate, common lambda replacement when no real
  action is needed beyond closing.
- `.show()` — reappearing (`Toast`, `RecyclerView`'s own display
  triggered indirectly by `setAdapter`), the same "configure, then
  trigger" shape.
- `Integer.parseInt(quantityInput.getText().toString())` — **first
  appearance.** `Integer` is the wrapper class corresponding to the
  primitive `int`; `.parseInt(String)` is a static method converting a
  string of digits into a real `int` — the reverse operation of
  Lesson 26's `String.valueOf(int)`. This call is a real, unguarded risk
  worth naming honestly: if the user types non-numeric text into the
  quantity field (bypassing the numeric keyboard by pasting, for
  instance), `parseInt` throws `NumberFormatException` — this project's
  UI-only scope doesn't add input validation here, but a real production
  app would need to catch and handle this before it crashes.
- `items.add(new InventoryItem(name, quantity))` — reappearing (Lessons
  14–15), the actual data change.
- `adapter.notifyItemInserted(items.size() - 1)` — **first appearance,
  and the actual point of this lesson.** `RecyclerView` has no way to
  observe `items.add(...)` happening — `List` is a plain data structure
  with no built-in notification mechanism (unlike, say, Lesson 16's
  `View`, which *does* have a listener mechanism built in). Every change
  to the underlying data must be paired with an explicit call telling
  the adapter what changed. `notifyItemInserted(position)` tells
  `RecyclerView` precisely: "exactly one new item now exists, at this
  specific position" — `items.size() - 1` is the new last valid index,
  since the item was just appended. `RecyclerView` responds by inserting
  and animating in exactly one new row, calling `onCreateViewHolder`/
  `onBindViewHolder` (Lesson 26) only for the position that actually
  changed, not re-binding every already-visible row unnecessarily.

### CS Lens

`notifyItemInserted` requiring an explicit call is the same core problem
Lesson 16's Observer pattern already solved for click events, seen from
the opposite side: here, `RecyclerView` is the **observer**, watching
for changes to data it doesn't own, and the data (a plain `List`) has no
way to **notify** it automatically — so the adapter itself takes on that
notifying responsibility manually, on your explicit instruction, rather
than the list doing it implicitly.

### SE Lens

**Why doesn't `RecyclerView.Adapter` just watch the list automatically,
instead of requiring an explicit `notifyItemInserted` call every time?**
A plain `List` is a general-purpose standard-library type with millions
of unrelated uses that have nothing to do with any UI at all — building
automatic change-notification into `List` itself would burden every use
of a list, everywhere in Java, with UI-observation machinery almost none
of those uses need. Requiring the call explicitly keeps `List` itself
completely general-purpose, at the real cost you're now responsible for:
forgetting to call `notifyItemInserted` (or its siblings,
`notifyItemRemoved` and `notifyDataSetChanged`) after modifying the
underlying data is a common, real Android bug — the data changes
correctly, the screen simply doesn't reflect it, with no error or crash
at all.

---

## Connect the Pieces

One trace: tapping "Add Item" builds and shows an `AlertDialog`
(constructed in Java, not XML) with two input fields. Tapping its "Add"
button reads both values, converts the quantity back to an `int` via
`Integer.parseInt`, and calls `addItem`, which appends a new
`InventoryItem` to the same `items` list `InventoryAdapter` already reads
from (Lesson 26), then explicitly tells that adapter exactly which new
position appeared — the one piece of manual bookkeeping a plain
`List`'s own design leaves to you.

## What Breaks Without This

Comment out only the `adapter.notifyItemInserted(...)` call inside
`addItem`, keeping `items.add(...)` in place, and add several items via
the dialog. Real result: the dialog closes normally each time, with no
error at all, but the grid's visible row count never changes — direct,
observed proof of this lesson's central claim: the underlying data
genuinely did change (confirm with a temporary `Log.d` printing
`items.size()`), while the screen simply never learned about it.
Restore the line before moving on.

## Exercises

1. Replace `notifyItemInserted(items.size() - 1)` with the blunter
   `notifyDataSetChanged()` (no position argument — tells `RecyclerView`
   "something, somewhere, changed; re-check everything") and confirm the
   grid still updates correctly. Then restore
   `notifyItemInserted`, and explain, having now tried both, the real
   cost `notifyDataSetChanged()` carries at scale that
   `notifyItemInserted` avoids (a hint: which method gets called for
   every currently visible row versus only the row that actually
   changed).
2. Type a non-numeric quantity into the dialog and confirm the app
   really does crash with `NumberFormatException`, exactly as this
   lesson's walkthrough predicted — direct proof of a real, currently
   unhandled input-validation gap, honestly left in scope for a later
   improvement rather than papered over.

## Definition of Done

- [ ] You can state, concretely, why this project chose a dialog over a
      second screen, and when the opposite choice would be right.
- [ ] You triggered the "data changed, screen didn't" bug yourself by
      removing `notifyItemInserted`, and restored it.
- [ ] You compared `notifyItemInserted` against `notifyDataSetChanged`
      directly and can state the real cost difference between them.
- [ ] You confirmed the real `NumberFormatException` crash from
      non-numeric input, and can state honestly that it's an unhandled
      gap, not a hidden feature.
- [ ] Tapping "Add Item," filling both fields, and tapping "Add" visibly
      inserts a new row into the grid.
- [ ] Commit: `git commit -m "Add an AlertDialog-based add-item flow;
      notify the adapter of the exact inserted position"` — explaining
      the dialog choice and the notify call, not just the new button.

Next: a delete button on every row — the last piece of the data-grid
requirement, and a real, harder use of the lambda/closure mechanism from
Lesson 14.
