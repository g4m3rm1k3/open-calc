# Lesson 18: Choosing a Grid Layout

**What you will build:** Nothing added to the project yet — this lesson
is entirely a real, worked comparison of three genuinely different
Android tools for displaying a grid of data, ending in a deliberate
choice this project builds forward with. The transferable problem: "show
a list or grid of data" is one of the single most common UI needs any
app has, and Android's answer to it changed significantly over the
platform's history — meaning there are multiple real, still-valid tools,
not one obvious choice, and picking the right one is a real engineering
decision with real consequences at scale.

**What you need to know first:** Lesson 17 (a second, real screen to put
this grid inside).

**Terms introduced in this lesson:**
- **`GridLayout`** — a static XML `ViewGroup` arranging a fixed, known
  set of children into rows and columns, decided entirely at layout time.
- **`GridView` (recognition, real alternative)** — an older Android
  widget purpose-built for scrollable grids of dynamic data, now
  considered legacy.
- **`RecyclerView` (recognition, real alternative — the option this
  project builds)** — a modern, flexible scrollable-list/grid widget
  that delegates *how* items are arranged to a separate
  `LayoutManager` object, and *how* items are displayed to a separate
  `Adapter` object.
- **View recycling** — reusing a small, fixed number of already-created
  row views for a much larger scrollable dataset, instead of creating one
  view object per data item.

**Objects and methods used:** `GridLayout`, `GridView`, `RecyclerView`,
`ArrayAdapter<String>`, `LayoutManager` (`LinearLayoutManager`/
`GridLayoutManager`), `Adapter`, and `setAdapter(...)`/
`setLayoutManager(...)` are this lesson's own subject, given full
treatment above.

**`GridLayout`**
- *What it is:* a static XML `ViewGroup`.
- *Implementation:* arranges a fixed, known set of child views into
  declared rows and columns, decided entirely at layout time, with no
  concept of runtime data.
- *Its use:* Option A above — the right tool only when the exact set of
  items is fixed and known ahead of time.

**`GridView`**
- *What it is:* an older Android widget purpose-built for scrollable
  grids.
- *Implementation:* one XML element, backed by an `Adapter` object that
  supplies however many rows the underlying data actually has at
  runtime.
- *Its use:* Option B above — a real, working alternative, recognized
  here but not built by this project.

**`ArrayAdapter<String>`**
- *What it is:* a general-purpose `Adapter` implementation.
- *Implementation:* maps each element of an array or `List` to one row
  view, using a built-in row layout.
- *Its use:* Option B's own code, adapting `itemNames` into `GridView`'s
  rows.

**`RecyclerView`**
- *What it is:* a modern, flexible widget for scrollable lists and
  grids.
- *Implementation:* delegates arrangement to a `LayoutManager` and
  content to an `Adapter`, and recycles a small, fixed pool of row views
  instead of creating one per data item.
- *Its use:* Option C — the option this project builds forward with.

**`LayoutManager`**
- *What it is:* the object handed to a `RecyclerView` that decides
  *where* each item is positioned on screen.
- *Implementation:* a swappable strategy, independent of what each item
  displays.
- *Its use:* attached via `setLayoutManager(...)`, below.

**`LinearLayoutManager`**
- *What it is:* a real `LayoutManager` implementation.
- *Implementation:* arranges items in a single scrolling column, one
  record per row.
- *Its use:* the shape this project's tabular inventory data needs, and
  the one it builds forward with.

**`GridLayoutManager`**
- *What it is:* a real `LayoutManager` implementation.
- *Implementation:* arranges whole items into a tile/card grid, several
  complete items per row.
- *Its use:* the right fit for a photo gallery or icon launcher — not
  this project's data.

**`Adapter`**
- *What it is:* the object handed to a `GridView` or `RecyclerView` that
  decides *what* each item looks like and *how many* exist.
- *Implementation:* `RecyclerView.Adapter`'s own real, declared shape is
  given full treatment next lesson.
- *Its use:* paired with a `LayoutManager` inside `RecyclerView`, or
  used alone inside `GridView`.

**`setAdapter(...)` / `setLayoutManager(...)`**
- *What they are:* the methods wiring a widget to its data source and
  arrangement strategy.
- *Implementation:* `setAdapter` works on both `GridView` and
  `RecyclerView`; `setLayoutManager` only on `RecyclerView`.
- *Their use:* the actual calls connecting Option B/C's real widgets to
  the objects above.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`ViewGroup`**
  - *What it is:* the `View` subtype whose entire job is arranging its
    children.
  - *Implementation:* given full treatment in Lesson 08.
  - *Its use:* the shared ancestor of all three container options this
    lesson compares.

---

## Concept Unit: Three Real Tools for the Same Job

### The Problem

This screen needs to show rows of data — items with a
name and a quantity, for instance — in a grid, with the ability to add a
row and delete any individual row later. That combination — dynamic data,
scrollable, rows added and removed at runtime — is exactly the case
Android's own widget history has iterated on more than once.

### Option A — Static XML `GridLayout`

```xml
<GridLayout
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:columnCount="2">

    <TextView android:text="Item" android:layout_columnWeight="1" />
    <TextView android:text="Qty" android:layout_columnWeight="1" />

    <TextView android:text="Bolts" />
    <TextView android:text="120" />

    <TextView android:text="Washers" />
    <TextView android:text="85" />

</GridLayout>
```

`GridLayout` is a plain `ViewGroup` (Lesson 08's concept) that arranges
its children into the number of columns you declare
(`android:columnCount`), wrapping to a new row automatically. Every cell
you see above is a real, separate child element, written directly in
XML, by hand. There is no concept of "data" here at all — if the
inventory has 40 rows, the XML file needs 80 `TextView` elements (2 per
row), written or generated one at a time.

### Option B — `GridView`

```xml
<GridView
    android:id="@+id/inventoryGrid"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:numColumns="2" />
```

```java
ArrayAdapter<String> adapter = new ArrayAdapter<>(
    this, android.R.layout.simple_list_item_1, itemNames);
inventoryGrid.setAdapter(adapter);
```

`GridView` is a real, dynamic-data widget — one XML element, backed by an
`Adapter` object supplying however many rows the underlying data actually
has, at runtime. It was Android's original answer to "scrollable grid of
dynamic data," and still works today, but has been effectively
superseded: it has no equivalent to `RecyclerView`'s `ViewHolder` pattern
built in (covered in the next lesson), makes adding features like item
animations or varying row layouts considerably harder, and Android's own
current documentation recommends `RecyclerView` for new code.

### Option C — `RecyclerView`

```xml
<androidx.recyclerview.widget.RecyclerView
    android:id="@+id/inventoryGrid"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

```java
inventoryGrid.setLayoutManager(new LinearLayoutManager(this));
inventoryGrid.setAdapter(new InventoryAdapter(itemList));
```

`RecyclerView` looks similar to `GridView` at a glance — one XML element,
backed by dynamic data — but splits responsibilities `GridView` bundles
together into two separate, swappable objects: a `LayoutManager`
(deciding *where* each item goes) and an `Adapter` (deciding *what* each
item looks like and *how many* exist — covered fully in the next lesson).
Critically, `RecyclerView` builds in **view recycling**: scrolling
through a list of 500 items never creates 500 row objects — it creates
roughly as many as fit on screen at once, and reuses them as items scroll
out of view and new ones scroll in.

**A real fork inside this option, worth naming precisely:** `RecyclerView`
ships more than one `LayoutManager`, and they solve genuinely different
shapes of "grid," both real, working one-line swaps against the exact
same `RecyclerView` and `Adapter`:

```java
// The tile/card-grid shape — not this project's data shape
inventoryGrid.setLayoutManager(new GridLayoutManager(this, 2));
```

```java
// The tabular/spreadsheet shape — this project's actual data shape
inventoryGrid.setLayoutManager(new LinearLayoutManager(this));
```

`GridLayoutManager(this, 2)` arranges whole *items* into a
tile/card grid — several complete items side by side per row, two per
row here, each occupying one cell (the right fit for a photo gallery or
an app-icon launcher grid, where each item is one self-contained visual
unit — a single `InventoryItem`'s name and quantity would each end up in
their own separate cell, scattered apart, rather than staying together on
one row).
`LinearLayoutManager` arranges items as a single scrolling column, one
per row — and *within* each row, the row's own layout can freely arrange
multiple labeled values side by side (a name column next to a quantity
column), which is what a spreadsheet-style data grid — rows of records,
each with the same named fields — actually needs. Inventory or event
data (a name, a quantity, a date — one record per row, several
named fields per record) is this second shape, not the first: it needs
one row per data item with internal columns, not several whole items
tiled per row. Using `GridLayoutManager` here would scatter each
record's own fields across separate grid cells instead of keeping a
record's fields together on one row — the wrong tool for tabular data,
even though the word "grid" fits both cases informally.

### Mechanical Walkthrough

- `<GridLayout android:columnCount="2">` — a plain `ViewGroup`
  (Lesson 08) arranging a fixed number of already-written child
  elements into the declared column count, wrapping automatically —
  every cell is a real, separate XML element, with no concept of
  "data" driving how many exist.
- `<GridView ... />` + `inventoryGrid.setAdapter(adapter)` — one XML
  element, backed by an `Adapter` object supplying rows from real data
  at runtime — Android's original answer to dynamic, scrollable grids.
- `<androidx.recyclerview.widget.RecyclerView ... />` +
  `setLayoutManager(...)` + `setAdapter(...)` — the same one-element,
  data-backed shape as `GridView`, but split into two separate,
  swappable objects: a `LayoutManager` (where each item goes) and an
  `Adapter` (what each item looks like, and how many exist).
- `new GridLayoutManager(this, 2)` vs. `new LinearLayoutManager(this)`
  — two real, interchangeable `LayoutManager` implementations against
  the identical `RecyclerView`/`Adapter` pair — tile/card arrangement
  versus single-column tabular rows, a one-line swap between them.

### The Tradeoff

`GridLayout` costs nothing to understand — it's plain, static XML,
already fully covered by Lesson 08's `View`/`ViewGroup` concepts — but it
has no concept of "data" at all: adding a row means writing more XML,
which cannot happen based on something the user typed at runtime. It's
the right tool only when the exact set of items is fixed and known ahead
of time (a settings screen's fixed set of options, for instance), which
this project's data grid is explicitly not — the actual requirement
here is a user-editable dataset. `GridView` handles dynamic data
correctly, at the cost of being an older API without `RecyclerView`'s
recycling efficiency built as directly into its design, and without the
separate-`LayoutManager`/`Adapter` split that makes swapping arrangement
independent of data logic. `RecyclerView` handles the same dynamic data
correctly, more efficiently at scale, with a cleaner separation of
concerns — at the cost of more setup code and, as the next lesson covers,
a real, nontrivial Adapter/ViewHolder contract to learn.

**This project builds `RecyclerView` with a `LinearLayoutManager`,**
since the data is genuinely dynamic (rows are added and deleted by the
user) and shaped as tabular records (a name and a quantity per row), not
tiled cards — `RecyclerView` is both the current, recommended tool for
dynamic data generally and the one that best demonstrates real,
transferable Android architecture, and `LinearLayoutManager` is the
correct manager for this specific data shape, per the fork named just
above. If your own app's data really is a tile/card grid (a photo
gallery, an icon launcher), `GridLayoutManager` is the honestly correct
manager for that different shape, with the exact same `Adapter` concept
the next lesson builds. If your own app's data is truly fixed and
known ahead of time, `GridLayout`'s far simpler static approach is the
honestly correct tool for that different case, not this project's.

### CS Lens

View recycling — reusing a small, fixed pool of view objects for an
arbitrarily large scrollable dataset — is an instance of the **object
pool pattern**: instead of creating and destroying objects as they're
needed (expensive when it happens constantly, as it would scrolling
through hundreds of rows), a small, fixed set of reusable objects is
created once and repeatedly reassigned to new data as needed.

Also recognized in: database connection pools (reusing a fixed number of
open connections rather than opening a new one per request), thread
pools in concurrent programming, and video game engines reusing bullet
or particle objects instead of allocating a new one per frame.

### SE Lens

**Why does `RecyclerView` split "arrangement" and "content" into two
separate objects instead of one widget handling both, the way `GridView`
does?** Bundling both into one class, as `GridView` does, means changing
*how* items are arranged (grid vs. list vs. staggered grid) requires
touching the same code responsible for *what* each item displays — the
two concerns are coupled even though they're logically independent. This
is the same **separation of concerns** reasoning already met in Lesson
09 (text separated from layout), applied here to a harder case: swapping
`GridLayoutManager` for `LinearLayoutManager` changes a list into a grid
with the exact same `Adapter`, and unchanged data logic — genuinely not
possible with `GridView`'s more bundled design.

---

## Connect the Pieces

One trace, through the actual decision rather than through code (this
lesson changes no project files): the requirement is dynamic,
user-editable, tabular data. `GridLayout` is ruled out first — it has
no concept of data at all, only fixed, hand-written XML. Between the
two real dynamic-data options, `RecyclerView`'s split
`LayoutManager`/`Adapter` design and built-in view recycling are a
strict improvement over `GridView`'s more bundled, less efficient
design, at the cost of more setup. `LinearLayoutManager`, not
`GridLayoutManager`, is the correct choice within `RecyclerView`
specifically because the data is shaped as one-record-per-row with
several named fields, not self-contained tiles. Every later lesson
building this project's actual grid inherits this exact chain of
reasoning.

## What This Lesson Doesn't Build Yet

No code changes in this lesson — the next lesson introduces `ArrayList`
as the backing data structure this decision assumes exists, and the one
after that builds the real `Adapter`/`ViewHolder` classes `RecyclerView`
needs.

## What Breaks Without This

Not a runtime failure this lesson can trigger — no code changed — but a
real, concrete design failure worth naming precisely: building this
project's actual editable, tabular inventory data with static
`GridLayout` instead would mean every add or delete requires generating
and re-inflating XML at runtime, something `GridLayout` was never
designed to do; building it with `GridLayoutManager` instead of
`LinearLayoutManager` would scatter each record's own name and quantity
into separate, misaligned grid cells instead of keeping them together
on one row. Both are real, avoidable mistakes this unit's reasoning
exists to prevent before either is ever written.

## Exercises

1. Sketch (on paper, or in a scratch XML file, not the real project) what
   Option A's static `GridLayout` would need to look like for 10 rows
   instead of 2 — confirm for yourself concretely how the "no data
   concept" cost scales as the row count grows.
2. Find `RecyclerView`'s own real class declaration in Android's
   reference documentation (`androidx.recyclerview.widget.RecyclerView`)
   and identify which package it lives in versus `GridView`
   (`android.widget`) — confirming `RecyclerView` is a separate,
   add-on library (AndroidX), not a built-in platform class the way
   `GridView` is, which is why the next lesson needs a Gradle dependency
   check before writing any Adapter code.

## Definition of Done

- [ ] You can state, concretely, one real scenario where `GridLayout`
      would be the *better* choice than `RecyclerView`, and why this
      project isn't that scenario.
- [ ] You can name the two separate objects `RecyclerView` splits its
      responsibilities into, and what each one is responsible for.
- [ ] You can explain view recycling in your own words, and name at least
      one other real-world system that uses the same object-pool idea.
- [ ] Commit: not applicable — no project files changed in this lesson.

Next: `ArrayList`, the backing data structure every option above except
static `GridLayout` actually needs.
