# Lesson 6a: Looping and `addView()` Doesn't Scale

**What you will build:** `InventoryActivity` shows a scrolling list of
inventory item names for the first time — first the naive, wasteful
way (to see exactly what's wrong with it), then the setup pieces
`RecyclerView` needs before it can replace that approach. The
transferable problem: Android does let you add views to a screen in a
loop, and it will even work for a handful of items — but it does not
scale, and understanding *why* it doesn't is what motivates the entire
Adapter/ViewHolder design most Android UI work is built on, covered in
the rest of this lesson (6b–6e). This lesson is about learning to
distrust "it works" as the only bar for correct, and asking "what
happens at 500 items?" instead.

**What you need to know first:** Lesson 3 (XML layouts,
`ConstraintLayout`), Lesson 4 (`InventoryActivity` exists, currently
near-empty), Lesson 5 (instance fields, lifecycle — not directly used
here but assumed solid).

---

## Concept Unit: Looping and `addView()` Doesn't Scale

### The Problem

You have a list of inventory item names to show. The most direct
approach, given everything you know so far: loop over the list, create
a `TextView` per name in Java, and add each one to a container. Try it
and see what's actually wrong with it — the flaw isn't that it fails to
work.

### Introduce the Concept in Isolation

Temporarily add a container to `activity_inventory.xml` (you'll revert
this in a moment, so don't worry about it being tidy):

```xml
<LinearLayout
    android:id="@+id/scratchContainer"
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    app:layout_constraintTop_toTopOf="parent" />
```

`<LinearLayout>` is a simpler layout container than `ConstraintLayout`:
it just stacks its children one after another, either vertically or
horizontally (`android:orientation` picks which), with no
constraint-solving involved. Fine for a quick throwaway container like
this one; `RecyclerView` (the real answer, coming up) supplies its own,
smarter version of this idea.

And temporarily add this inside `InventoryActivity.onCreate`, after
`setContentView`:

```java
android.widget.LinearLayout container = findViewById(R.id.scratchContainer);
for (int i = 0; i < 5; i++) {
    android.widget.TextView row = new android.widget.TextView(this);
    row.setText("Item " + i);
    container.addView(row);
}
```

`new android.widget.TextView(this)` builds a View entirely in Java, no
XML at all. Every `TextView` you've made until now came from an XML
file being inflated; this constructs one directly, the same `new` +
constructor pattern from Lesson 2a, just on a framework class instead
of one you wrote. `container.addView(row)` adds `row` as a new child of
`container`, at runtime, after the screen has already been built — XML
describes the *initial* tree; `addView` mutates it afterward.

Five iterations, concrete values, not "it loops five times":

```
Iteration 1: i = 0, row = new TextView, row.text = "Item 0", container now has 1 child
Iteration 2: i = 1, row = new TextView, row.text = "Item 1", container now has 2 children
Iteration 3: i = 2, row = new TextView, row.text = "Item 2", container now has 3 children
Iteration 4: i = 3, row = new TextView, row.text = "Item 3", container now has 4 children
Iteration 5: i = 4, row = new TextView, row.text = "Item 4", container now has 5 children
```

Each iteration builds a genuinely new `TextView` object — five separate
objects exist in memory by the end, each with its own `text`, none of
them reused — which is the concrete detail the rest of this lesson's
argument depends on: at 500 iterations, this is 500 separate objects,
not one object updated 500 times.

Run it. You'll see five rows: "Item 0" through "Item 4," genuinely
working. Now, without changing the number `5`, reason about what this
loop does at `500`: it constructs 500 real `TextView` Java objects,
each one measured and laid out by the system, **all at once, whether or
not they're currently visible on screen** — a phone screen can show
maybe 10–15 rows at a time, meaning roughly 485 fully-built View
objects would exist purely to sit off-screen, consuming memory, for as
long as the screen is open. The loop *works*; it just does far more
work than the visible result requires, and that gap grows without
bound as the list grows.

### Discard the Throwaway Example

Delete the `scratchContainer` `LinearLayout` from `activity_inventory.xml`
and delete the loop from `onCreate`. Neither appears in the project
again — `RecyclerView`, built starting in the next lesson file (6b),
is the real answer.

### Mechanical Walkthrough

- `<LinearLayout ... android:orientation="vertical" .../>` — **first
  appearance.** A layout container that stacks its children one after
  another in a single direction, no constraint-solving involved —
  `android:layout_width`/`height` are reappearing (Lesson 3).
- `findViewById(R.id.scratchContainer)` — **reappearing** (Lesson 2c),
  same lookup-by-id pattern, now returning a `LinearLayout` instead of
  the `ConstraintLayout` root.
- `for (int i = 0; i < 5; i++)` — **reappearing** loop syntax
  (basic, already-established).
- `new android.widget.TextView(this)` — **first appearance of building
  a View entirely in Java**, no XML at all. Same `new` + constructor
  shape as any object (Lesson 2a), just on a framework class; `this`
  passed as the constructor argument is the `Context` every Android
  View needs to exist (Lesson 2c's `AppCompatActivity` itself is a
  valid `Context`).
- `row.setText("Item " + i)` — **reappearing** method call and string
  concatenation, now on a View built in Java instead of one inflated
  from XML.
- `container.addView(row)` — **first appearance.** Adds `row` as a new
  child of `container` at runtime, after the screen already exists —
  XML describes the *initial* tree (Lesson 3); `addView` mutates it
  afterward, the same way `Iteration N`'s trace above shows each call
  growing the tree by exactly one node.

### CS Lens

This is the general problem of **eager evaluation versus lazy/on-demand
evaluation** — doing all the work upfront regardless of whether it's
needed, versus doing only the work a specific moment actually requires.
Also recognized in: a database returning every row of a table into
memory versus a paginated cursor, an eagerly-loaded ORM relationship
versus lazy-loading, and infinite/lazy sequences in functional
languages that only compute the next element when asked.

### SE Lens

**The loop in this lab genuinely works — five rows appear, correctly
labeled. Why isn't "it works" the end of the engineering conversation?**
Because "works" was only ever measured at `5` items, and nothing about
correctness at `5` predicts behavior at `500` — the failure mode here
isn't a bug that throws an exception, it's a resource cost that scales
linearly with data size and never gets checked until a real user
scrolls through enough inventory to notice the lag (or the memory
pressure) firsthand. The engineering habit worth taking from this: for
any loop that builds objects proportional to a data set's size, ask
"what does this cost at 10x, 100x the size I'm testing with" before
calling it done — the constraint that actually matters (a phone screen
can only ever show ~10-15 rows at once, no matter how large the
underlying list grows) is exactly what `RecyclerView`, next, is built
around.

---

## Concept Unit: `RecyclerView` Needs a Row Layout and a Widget in the Screen

### The Problem

`RecyclerView` is the framework's fix for exactly the waste you just
saw: it keeps only a small number of row View objects alive — roughly
enough to fill the visible screen plus a couple extra — and *reuses*
them as the user scrolls, refilling each recycled view with new data
instead of constructing a fresh view per data item. Before any of that
logic, it needs two things you haven't built yet: a layout describing
what a *single row* looks like, and the `RecyclerView` widget itself
sitting in `activity_inventory.xml`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `app/build.gradle` (module-level, add a
  dependency), new file
  `app/src/main/res/layout/list_item_inventory.xml`, and
  `app/src/main/res/layout/activity_inventory.xml` (replace contents).
- **Change type:** Configure, create, replace.
- **Dependencies:** the AndroidX RecyclerView library.

### Commands Needed

Open `app/build.gradle` (the **module**-level one — Android Studio has
two files named `build.gradle`: the project-level one and the
module-level `app/build.gradle`; you want the one inside `app/`). Find
the `dependencies { ... }` block and add one line:

```gradle
implementation 'androidx.recyclerview:recyclerview:1.3.2'
```

Click **Sync Now** in the banner Android Studio shows after you save —
this downloads the library and makes its classes available to your
code. If Sync fails, double-check the line was added inside the
existing `dependencies { }` block, not outside it.

### The New Code — the Row Layout

Create a new file, `app/src/main/res/layout/list_item_inventory.xml`:

```xml
<TextView xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/itemNameText"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:padding="16dp"
    android:textSize="18sp" />
```

### The Updated Project

This is a brand-new file with nothing surrounding it — a single root
`TextView`, no parent layout needed here since `RecyclerView` itself
will supply the container behavior. Note it can have a root element
directly (unlike `activity_main.xml`'s `ConstraintLayout` root) because
this file's only job is describing one row's appearance, not a whole
screen's arrangement.

### Mechanical Walkthrough

- `<TextView xmlns:android="...">` as the **root element** — **first
  appearance of this shape**: previous layout files had a layout
  container (`ConstraintLayout`) as root with views nested inside; here
  the row *is* just one view, so it's both root and content. The
  `TextView` tag itself and `android:layout_width`/`height` are
  reappearing from Lesson 3.
- `android:padding="16dp"` — **first appearance.** Space added *inside*
  a view's own edges (as opposed to `layout_margin`, from Lesson 5,
  which adds space *outside* a view, between it and its neighbors).
- `android:textSize="18sp"` — reappearing, from Lesson 3.

### The New Code — the Screen Layout

Replace the entire contents of `activity_inventory.xml`:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/inventoryRecyclerView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### The Updated Project

This replaces the wizard-generated placeholder file wholesale — same
`ConstraintLayout` root pattern from Lesson 3, now containing exactly
one child, the `RecyclerView`, constrained to fill the entire screen on
all four edges.

### Mechanical Walkthrough

- `<androidx.recyclerview.widget.RecyclerView>` — **first appearance.**
  Same full-class-path tag pattern as `ConstraintLayout` itself
  (Lesson 3) — this instantiates the real `RecyclerView` class from the
  library you just added as a dependency, which is why Sync had to
  succeed first: without it, this tag would fail to resolve.
- The four `app:layout_constraint*_to*Of="parent"` lines — reappearing,
  from Lesson 3, filling the whole screen the same way the original
  placeholder `TextView` did.

### CS Lens

Separating "what one row looks like" (`list_item_inventory.xml`) from
"what the whole screen looks like" (`activity_inventory.xml`) is an
instance of **template/instance separation** — one small structural
description gets instantiated many times against different data, rather
than each occurrence being separately authored. Also recognized in: a
server-side HTML templating engine rendering one row template per
database record, a spreadsheet formula copied down a column, and class
definitions themselves (one `class`, many instances — Lesson 2a).

### SE Lens

**Why a separate row-layout XML file at all, instead of building each
row in Java, the way the wasteful loop in the previous unit already
did?** That loop's real flaw wasn't *where* the `TextView` got
described, it was building 500 of them unconditionally — `RecyclerView`
fixes that specific problem by reusing a small, fixed number of row
objects. But describing a row's appearance in XML rather than Java code
is a second, independent decision, with its own real payoff: a
designer-friendly, tooling-visible description (Android Studio can
render `list_item_inventory.xml` as a live preview, no app run needed)
that stays entirely separate from the logic that decides *what data*
fills each row. Building rows in Java, as the previous unit's loop did,
tangles "what a row looks like" together with "how many rows and what
order" in the same block of imperative code — fine for a five-line
throwaway, but exactly the kind of coupling that gets expensive to
untangle once a row's appearance needs to change independently of the
logic that populates it.

---

## Connect the Pieces

The row layout and the `RecyclerView` widget are both now in place, but
nothing connects them to real data yet — `RecyclerView` on its own
draws nothing at all. That connection needs two more Java concepts
first: what `static` really changes on a nested class (6b), and
generics (6d) — both used directly by the `ViewHolder` (6c) and
`Adapter` (6e) that actually make this screen show real rows.

## What Breaks Without This

Run the app right now, with the `RecyclerView` in place but nothing
wiring it up yet. The Inventory screen is simply blank — no crash, no
placeholder text, nothing. This is expected: a `RecyclerView` with no
`LayoutManager` and no `Adapter` assigned draws nothing at all, which
is exactly the gap the rest of this lesson closes.

## Exercises

1. Temporarily change `list_item_inventory.xml`'s `android:padding`
   from `16dp` to `0dp` and, once you have real rows on screen later in
   this lesson, compare how the list looks. Restore it to `16dp`
   afterward.

## Definition of Done

- [ ] You ran the wasteful `addView()` loop yourself, saw it work, and
      can explain in your own words why it doesn't scale.
- [ ] `list_item_inventory.xml` and the updated `activity_inventory.xml`
      both exist, and the Gradle sync for the RecyclerView dependency
      succeeded.
- [ ] Commit: message explaining why (e.g. "Add RecyclerView dependency
      and row/screen layouts for the inventory list, after proving a
      manual addView loop doesn't scale past a handful of items").

Lesson 6b is next: `static` on a nested class versus `static` on a
field — two different-looking uses of the same keyword, seen together
before `ViewHolder` needs the first one.
