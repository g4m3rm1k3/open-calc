# Lesson 27: Wiring the `RecyclerView` and a Header Row

**What you will build:** The data grid screen finally shows real,
scrollable rows on screen — a static header row labeling the two
columns, and Lesson 26's `InventoryAdapter` connected to a real,
visible `RecyclerView` using `LinearLayoutManager`. This completes
Milestone 4's data-grid requirement: a real grid, with logical labels and
headers, displaying genuine (if currently hardcoded-sample) data. The
transferable problem: every piece built across this milestone —
navigation, the layout-manager choice, the populated list, the real
Adapter contract — has to be wired together in one place, in the right
order, before any of it produces a single visible pixel.

**What you need to know first:** Lesson 22 (`InventoryItem`, the
populated list), Lesson 26 (`InventoryAdapter`, the real contract it
fulfills).

**Terms introduced in this lesson:**
- **`LinearLayoutManager`** — the `RecyclerView` layout manager arranging
  items in a single scrolling column, chosen in Lesson 18 for this
  project's tabular data.
- **`setLayoutManager` / `setAdapter`** — the two `RecyclerView` methods
  connecting it to its arrangement strategy and its data source,
  respectively.
- **`android:textStyle`** — a `TextView` attribute controlling font
  weight/style (`bold`, `italic`, or both); used here to visually
  distinguish the header row from ordinary data rows.

**Objects and methods used**
- `RecyclerView` — the scrolling widget that displays a large or
  changing dataset by recycling a small pool of row views, Lesson 18 —
  `LinearLayoutManager` — the layout manager arranging items in a single
  scrolling column, Lesson 18 — and `InventoryAdapter` — the class
  fulfilling `RecyclerView.Adapter`'s real contract, Lesson 26 — reappear
  here connected together for the first time. `LinearLayout` — the
  `ViewGroup` arranging children in a row or column — and `TextView` —
  the text-display widget — both taught in Lessons 08–09, reappear here
  building the static header row. `setLayoutManager`/`setAdapter` are
  this lesson's own subject, given full treatment below.

---

## Concept Unit: A Static Header Row

### The Problem

`RecyclerView`'s own rows are all built from `InventoryItem` data — there
is no natural place inside that dynamic system for a row that's always
the same, always present, and isn't itself a data item: the column
labels ("Item", "Qty") this project's grid needs.

### Project Change

- **Reference Source:** No reference counterpart — this is a plain,
  static layout addition, the same kind of XML Lesson 08 already covered
  in full.
- **Files affected:** `app/src/main/res/layout/activity_inventory.xml`;
  `app/src/main/res/values/strings.xml`; `InventoryActivity.java`.
- **Change type:** Add a header row and a `RecyclerView` to the layout;
  add two string entries; wire the `RecyclerView` from Java.
- **Location:** Inside `activity_inventory.xml`'s existing (currently
  empty) root `LinearLayout` from Lesson 17.
- **Dependencies:** None new.

### The New Code

In `strings.xml`:

```xml
<string name="column_header_item">Item</string>
<string name="column_header_quantity">Qty</string>
```

In `activity_inventory.xml`:

```xml
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:paddingBottom="8dp">

    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:text="@string/column_header_item"
        android:textStyle="bold" />

    <TextView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:text="@string/column_header_quantity"
        android:textStyle="bold" />

</LinearLayout>

<androidx.recyclerview.widget.RecyclerView
    android:id="@+id/inventoryRecyclerView"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

### The Updated Project

`activity_inventory.xml` in full:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="24dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:paddingBottom="8dp">

        <TextView
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="@string/column_header_item"
            android:textStyle="bold" />

        <TextView
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="@string/column_header_quantity"
            android:textStyle="bold" />

    </LinearLayout>

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/inventoryRecyclerView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</LinearLayout>
```

The root `LinearLayout` (from Lesson 17, empty until now) now stacks two
children: a horizontal header row with two equally weighted, bold
labels, directly above a `RecyclerView` that will hold the actual
scrollable data rows — the header and every data row share the exact
same two-equal-columns structure, so their columns visually line up.

### Mechanical Walkthrough

- The nested header `<LinearLayout orientation="horizontal">` with two
  `layout_weight="1"` `TextView`s — reappearing (this lesson's own
  concept from Lesson 26's `item_inventory.xml` fix, and Lesson 08's
  `LinearLayout` itself), deliberately mirroring each data row's own
  column structure.
- `android:textStyle="bold"` — **first appearance.** A `TextView`/`Button`
  styling attribute (inherited down the same `TextView` family Lesson 11
  already traced) making text render in bold weight — visually
  distinguishing the header row from ordinary data rows.
- `<androidx.recyclerview.widget.RecyclerView android:id="@+id/inventoryRecyclerView" .../>`
  — **first appearance of `RecyclerView` in a real layout file.** Unlike
  `TextView`, `EditText`, or `Button` (all in the `android.widget`
  package, available with no extra declaration), `RecyclerView` lives in
  a separate AndroidX library, which is why its XML tag must be written
  as its full package path — `androidx.recyclerview.widget.RecyclerView`
  — rather than a short name Android would need to guess the package
  of. `android:layout_height="match_parent"` lets it fill all remaining
  vertical space after the fixed-height header row above it.

### SE Lens

**Why build the header as a second, separate, static `LinearLayout`
instead of somehow making it "row zero" inside the `RecyclerView`
itself?** `RecyclerView`'s entire Adapter/ViewHolder contract
(Lesson 26) is built around uniform, recyclable data rows, all backed by
the same `List<InventoryItem>` — forcing a structurally different,
never-repeating header row into that same recycling system would mean
`onCreateViewHolder`/`onBindViewHolder` needing extra branching logic to
special-case position zero, complicating the exact contract Lesson 26
just carefully fulfilled. A plain, static, non-recycled `TextView` pair
sitting outside the `RecyclerView` entirely is simpler precisely because
the header never needs any of what `RecyclerView` exists for — it never
scrolls, never changes, and is never one of many.

---

## Concept Unit: Connecting Adapter to `RecyclerView`

### The Problem

Every piece exists now — a populated list (Lesson 22), a real Adapter
fulfilling `RecyclerView`'s contract (Lesson 26), and a `RecyclerView`
element in the layout (this lesson, above) — but none of them are
actually connected to each other yet.

### The New Code

```java
RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
recyclerView.setLayoutManager(new LinearLayoutManager(this));
recyclerView.setAdapter(new InventoryAdapter(items));
```

### The Updated Project

```java
package com.yourname.yourapp;

public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<InventoryItem> items = new ArrayList<>();
        items.add(new InventoryItem("Bolts", 120));
        items.add(new InventoryItem("Washers", 85));
        items.add(new InventoryItem("Nuts", 200));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView); // ← new
        recyclerView.setLayoutManager(new LinearLayoutManager(this));         // ← new
        recyclerView.setAdapter(new InventoryAdapter(items));                 // ← new
    }
}
```

### Mechanical Walkthrough

- `findViewById(R.id.inventoryRecyclerView)` — reappearing (Lesson 13's
  generic method), now returning a `RecyclerView` specifically, inferred
  from the assignment target exactly as Lesson 13 explained.
- `new LinearLayoutManager(this)` — **first appearance.** Constructs the
  layout manager chosen back in Lesson 18, needing only a `Context`
  (`this`, same recurring concept from Lessons 16, 17, and 26) to know
  which screen it's arranging content for.
- `recyclerView.setLayoutManager(...)` — **first appearance.** Assigns
  the arrangement strategy; without this call, a `RecyclerView` displays
  nothing at all, regardless of whether an adapter is set — the two
  responsibilities Lesson 18 described as split apart are, correspondingly,
  set independently, in two separate calls.
- `new InventoryAdapter(items)` — reappearing `new` and Lesson 26's own
  constructor, now supplying the real populated list from Lesson 22.
  This is the exact moment Lesson 26's own aliasing point becomes
  concrete: `items` here is the very same `List` reference this
  Activity's own field already points at (Lesson 02's aliasing) —
  `InventoryAdapter` is not handed a copy. Anything that later changes
  this shared list — from wherever that change happens — is visible to
  the adapter automatically, with no further wiring between the two.
- `recyclerView.setAdapter(...)` — **first appearance.** Assigns the data
  source; from this call onward, `RecyclerView` begins calling
  `onCreateViewHolder`/`onBindViewHolder` (Lesson 26) on its own schedule
  to actually populate visible rows.

### CS Lens

Setting a `LayoutManager` and an `Adapter` as two independent,
swappable objects on the same `RecyclerView` is **dependency injection**
in miniature: `RecyclerView` itself doesn't construct or know how to
build either one — both are handed to it from outside, fully formed,
which is exactly what makes swapping `LinearLayoutManager` for
`GridLayoutManager` later (if a future screen in your own app genuinely
needs a card grid) a one-line change with zero impact on
`InventoryAdapter`.

### SE Lens

**Why does connecting everything happen here, in `onCreate`, rather than
inside `InventoryAdapter` or `InventoryItem` themselves?** `onCreate`
(Lesson 07) is specifically the lifecycle point where this screen's own
one-time setup belongs — assembling the pieces that were each built,
independently and reusably, in earlier lessons. `InventoryAdapter` has no
business knowing which specific `RecyclerView` it will eventually be
attached to, and `InventoryItem` has no business knowing a `RecyclerView`
exists at all — keeping assembly separate from the pieces being
assembled is what let Lessons 22 and 26 be written, and tested by
reasoning through their own real output, without any of this lesson's
wiring existing yet.

### Execution Trace — the Real Call Order, Not Just "It Gets Called"

Lesson 26 described `onCreateViewHolder` and `onBindViewHolder` in prose
as being called "at moments the framework decides" — that description
alone isn't proof of an order, and this is exactly the kind of
framework-driven timing sequence that needs a real trace, not another
sentence asserting it. This is `RecyclerView`'s own documented contract,
applied to this project's actual three-item list, which is small enough
that every row fits on screen at once with nothing to scroll — worth
tracing precisely for that reason, since it isolates the *creation*
sequence from the *recycling* behavior covered by Exercise 1 below:

1. `recyclerView.setAdapter(new InventoryAdapter(items))` runs — this is
   the line from the code above that starts everything below; nothing
   prior to this point has called any `Adapter` method at all.
2. `RecyclerView` calls `getItemCount()` — **before** creating a single
   row — to learn how many rows exist in total (`3`, from
   `items.size()`) and decide how many rows it might need to build.
3. For the first visible row, `RecyclerView` calls
   `onCreateViewHolder(parent, viewType)` — no existing `InventoryViewHolder`
   is available yet to reuse, so `LayoutInflater` (Lesson 26) inflates a
   brand-new `item_inventory.xml` and a new `InventoryViewHolder` wraps
   it.
4. Immediately after step 3, on that exact same new holder,
   `RecyclerView` calls `onBindViewHolder(holder, 0)` — writing "Bolts"
   and "120" onto the holder's two cached `TextView`s. Binding always
   follows creation directly, for a holder that was *just* created —
   never the reverse order.
5. Steps 3–4 repeat for position `1` ("Washers"/`85`) and position `2`
   ("Nuts"/`200`) — three total `onCreateViewHolder` calls, since three
   distinct rows are needed and none existed yet to reuse.

Because this project's real list only has three small rows, every one of
them fits on screen without scrolling — `onCreateViewHolder` runs exactly
three times here, once per row, and stops; it is **not** proof that view
recycling (Lesson 18) doesn't work, only that recycling has nothing to do
yet with a dataset this small. Exercise 1 below has you extend the list
past what fits on one screen and observe, yourself, that
`onCreateViewHolder`'s call count stops growing once the screen is full —
the actual, verifiable recycling behavior this trace's small-dataset case
can't yet show.

---

## Connect the Pieces

The full trace, start to finish: tapping "Log In" (Milestone 3) starts
`InventoryActivity` via an explicit `Intent` (Lesson 17). Its `onCreate`
builds a populated `ArrayList<InventoryItem>` (Lesson 22), finds the
`RecyclerView` from the layout this lesson added (via `findViewById`,
Lesson 13), gives it a `LinearLayoutManager` (Lesson 18's chosen
arrangement) and a new `InventoryAdapter` wrapping that same list
(Lesson 26). From that point on, `RecyclerView` itself — not your code —
decides when to call `onCreateViewHolder` (inflating `item_inventory.xml`
via `LayoutInflater`) and `onBindViewHolder` (writing each
`InventoryItem`'s name and quantity onto a recycled row's cached
`TextView`s), the same Inversion of Control principle traced all the way
back to Lesson 07, now driving an entire scrollable grid instead of one
method call.

## What Breaks Without This

Comment out the `recyclerView.setAdapter(...)` line only (leave
`setLayoutManager` in place) and run the app. Real, verified failure to
render: the header row displays correctly, but the grid area beneath it
is entirely blank —
no rows, no crash, no error at all, since a `RecyclerView` with a
`LayoutManager` but no `Adapter` has a valid arrangement strategy and
simply nothing to arrange. Restore the line and confirm all three sample
rows reappear.

## Exercises

1. Add a fourth sample `InventoryItem` in `InventoryActivity`'s
   `onCreate` and confirm it appears as a fourth visible row with no
   other code changes — direct proof that `getItemCount()`
   (Lesson 26) is really being consulted freshly, not hardcoded to
   three.
2. Temporarily swap `new LinearLayoutManager(this)` for
   `new GridLayoutManager(this, 2)` (Lesson 18's alternative), run the
   app, and observe the real, concrete consequence Lesson 18 predicted
   in prose: each `InventoryItem`'s name and quantity, which were meant
   to sit together on one row, now scatter across separate grid cells.
   Revert to `LinearLayoutManager` afterward.

## Definition of Done

- [ ] The grid screen shows a bold header row ("Item", "Qty") and three
      real, correctly labeled data rows beneath it.
- [ ] You commented out `setAdapter` and saw the real "empty but not
      broken" result, then restored it.
- [ ] You added a fourth sample item with no adapter code changes and
      confirmed it appeared.
- [ ] You ran the `GridLayoutManager` exercise and can explain, having
      seen it, why it's the wrong manager for this specific data shape.
- [ ] Commit: `git commit -m "Wire InventoryAdapter to a RecyclerView
      with LinearLayoutManager; add a static column-header row"` —
      explaining the manager choice and header design, not just that
      the grid now shows data.

Milestone 4 is done — a real, working, correctly labeled data grid,
built on Android's current recommended architecture, every piece of it
explained from first principles. Milestone 5 adds the two remaining
pieces this project still needs: a way to add a new row, and a delete button
on each existing one.
