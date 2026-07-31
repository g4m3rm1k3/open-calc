# Lesson 26: `RecyclerView.Adapter` and `ViewHolder` — the Real Contract

**What you will build:** `InventoryAdapter`, the class that turns
Lesson 22's populated `ArrayList<InventoryItem>` into real rows a
`RecyclerView` can display — including a nested class, and the framework
contract both classes have to fulfill exactly. The transferable problem:
Lesson 06's Parent Contract Rule warned that extending a framework class
whose real shape you haven't seen leaves you reverse-engineering its
requirements from how a tutorial happens to use it. `RecyclerView.Adapter`
is exactly the case that rule exists for — this lesson shows its real,
declared shape before writing a single line that fills it in.

**What you need to know first:** Lesson 06 (`extends`, `@Override`),
Lesson 13 (bounded generic methods), Lesson 18 (why `RecyclerView` was
chosen), Lesson 22 (`InventoryItem`, the populated list this class
reads), Lesson 23 (abstract classes), Lesson 24 (bounded generic
classes), Lesson 25 (static nested classes).

**Terms introduced in this lesson:**
- **`LayoutInflater`** — the system service that turns a layout XML
  resource into real, live `View` objects at runtime, outside of
  `setContentView`'s own automatic use of it.

---

## Concept Unit: The Real Contract — `RecyclerView.Adapter` and `ViewHolder`

### The Problem

Before writing a class that `extends RecyclerView.Adapter`, the Parent
Contract Rule requires seeing exactly what that parent class actually
declares — not inferring it from how a tutorial happens to use it.

### The Parent Contract, Verified

`RecyclerView.Adapter`'s real declared shape (confirmed this session
against Android's official `androidx.recyclerview.widget.RecyclerView.Adapter`
and `RecyclerView.ViewHolder` reference documentation — this exact shape
has been stable and unchanged since `RecyclerView` was introduced):

```java
public abstract static class Adapter<VH extends RecyclerView.ViewHolder> {

    public abstract VH onCreateViewHolder(ViewGroup parent, int viewType);

    public abstract void onBindViewHolder(VH holder, int position);

    public abstract int getItemCount();
}
```

```java
public abstract static class ViewHolder {
    public final View itemView;

    public ViewHolder(View itemView) {
        this.itemView = itemView;
    }
}
```

Read this precisely, term by term, before writing anything that fills it
in:

- `abstract static class Adapter<VH extends RecyclerView.ViewHolder>` —
  this is a **bounded generic class**: Lesson 20's generic-class concept
  (the type parameter is part of the class declaration, same as
  `ArrayList<E>`) combined with Lesson 13's bounding concept (the type
  parameter is constrained — `VH` must always be some subtype of
  `RecyclerView.ViewHolder`, never an unrelated type). `abstract` means
  this class can never be instantiated directly — `new
  RecyclerView.Adapter<...>()` is not legal; only a subclass supplying
  real bodies for its abstract methods can be instantiated.
- Three `abstract` methods, no bodies at all — a subclass **must**
  supply real implementations for exactly these three, or the subclass
  itself remains abstract and still cannot be instantiated. This is the
  actual contract: whatever class you write, it owes the framework these
  three specific methods, with these exact signatures.
- `ViewHolder`'s own constructor requires exactly one argument, a real
  `View` — every `ViewHolder`, including any subclass you write, must
  hand a real `View` up to this constructor via `super(...)`, the same
  `super` mechanism from Lesson 06.
- `public final View itemView;` — a `public`, `final` (unreassignable
  after construction) field every `ViewHolder` carries: the actual row
  `View` this holder wraps. `final` here plays the same role Lesson 22's
  `InventoryItem` fields *didn't* have — a guarantee this specific
  reference can never be swapped for a different `View` after
  construction, only the *content* of that same view can change later.

### CS Lens

Both `onCreateViewHolder` and `onBindViewHolder` being declared
`abstract`, with the surrounding class defining *when* each is called
but not *what* they do, is the **Template Method pattern** again —
Lesson 06's concept, reappearing at a harder level: rather than one
overridden method (`onCreate`), here an entire class is built around
**three** methods a subclass must fill in, together, before the class
becomes usable at all.

---

## Concept Unit: `InventoryAdapter` — Filling in the Contract

### The Problem

With the real contract in hand, `InventoryAdapter` can now be written as
exactly what it needs to be: a class fulfilling all three abstract
methods above, parameterized with a `ViewHolder` subclass of its own.

### Project Change

- **Reference Source:** Quoted directly above — this unit fills in that
  exact contract.
- **Files affected:** New file
  `app/src/main/java/com/yourname/yourapp/InventoryAdapter.java`; new
  file `app/src/main/res/layout/item_inventory.xml` (one grid row's
  layout).
- **Change type:** Create two new files.
- **Dependencies:** `androidx.recyclerview:recyclerview` — check
  `app/build.gradle`'s `dependencies` block; most current Android
  Studio templates include it by default, but if
  `androidx.recyclerview.widget.RecyclerView` fails to resolve when
  typed, add `implementation("androidx.recyclerview:recyclerview:1.3.2")`
  to that block and re-sync Gradle (the **Sync Now** banner Android
  Studio shows after editing this file).

### The New Code

`item_inventory.xml` — one grid row, laid out **horizontally**, so its
two values sit in the same two columns the next lesson's static header
row above the grid also uses:

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="12dp">

    <TextView
        android:id="@+id/itemNameText"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:textSize="16sp" />

    <TextView
        android:id="@+id/itemQuantityText"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:textSize="16sp" />

</LinearLayout>
```

`android:layout_width="0dp"` paired with `android:layout_weight="1"` on
both `TextView`s — **first appearance of `layout_weight`.** Inside a
`LinearLayout`, `layout_weight` distributes leftover space between
children proportionally: `0dp` as the base width means "start from
nothing," and two children each weighted `1` then split all *remaining*
horizontal space evenly between them — two equal-width columns,
regardless of the actual screen width. This is what keeps the name and
quantity columns aligned under the header row's own matching two-column
split, built next lesson.

`InventoryAdapter.java`:

```java
package com.yourname.yourapp;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {

    private final List<InventoryItem> items;

    InventoryAdapter(List<InventoryItem> items) {
        this.items = items;
    }

    @Override
    public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View rowView = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_inventory, parent, false);
        return new InventoryViewHolder(rowView);
    }

    @Override
    public void onBindViewHolder(InventoryViewHolder holder, int position) {
        InventoryItem item = items.get(position);
        holder.nameText.setText(item.getName());
        holder.quantityText.setText(String.valueOf(item.getQuantity()));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        final TextView nameText;
        final TextView quantityText;

        InventoryViewHolder(View rowView) {
            super(rowView);
            nameText = rowView.findViewById(R.id.itemNameText);
            quantityText = rowView.findViewById(R.id.itemQuantityText);
        }
    }
}
```

### The Updated Project

This is the entire new file — there's no prior version of
`InventoryAdapter` to show a delta against; the whole class is new. The
next lesson connects it to a real, visible `RecyclerView`.

### Mechanical Walkthrough

- `class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`
  — **first appearance of filling in a bounded generic class.**
  `RecyclerView.Adapter<...>`'s type parameter (`VH` in the contract
  above) is filled in here with `InventoryAdapter.InventoryViewHolder` —
  the nested class declared later in this same file, referenced by its
  full path since it's nested inside the class currently being declared.
- `private final List<InventoryItem> items;` and the constructor
  storing it — reappearing (Lesson 13's `private` fields, Lesson 20's
  generic `List`), now holding the real populated list from Lesson 22.
  `final` here (a field, not a local variable this time) means this
  specific reference can never be reassigned to point at a *different*
  list after construction — the adapter always reads from the one list
  it was built with. This is worth stating precisely, not just in
  passing: `this.items = items;` copies the **reference** handed to the
  constructor (Lesson 02's own concept) — it does not copy the list's
  contents into a new, second list. Whatever object actually calls `new
  InventoryAdapter(...)` and passes its own `items` list is, from this
  line on, **aliased** with this adapter: both point at the exact same
  list object. This is not a detail to gloss over — it's the entire
  reason a later change to that shared list (adding or removing a row,
  from wherever the list is being modified) is visible here too, with no
  further connection needed between the two.
- `@Override public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType)`
  — **first appearance of fulfilling an abstract method from the real
  contract above.** Called by `RecyclerView` itself (Inversion of
  Control, reappearing a fourth time — Lessons 07, 16, 17) only when it
  needs a *brand-new* row view it doesn't already have lying around to
  reuse — this is the exact moment Lesson 18's "view recycling" concept
  becomes concrete: this method does **not** run once per data item; it
  runs only often enough to fill the screen plus a small buffer, then
  stops, no matter how large `items` grows.
- `LayoutInflater.from(parent.getContext()).inflate(R.layout.item_inventory, parent, false)`
  — **first appearance.** `LayoutInflater` is the system service that
  performs the exact same XML-to-`View`-tree conversion
  `setContentView` performs automatically (Lesson 05) — needed explicitly
  here because this code is building one row's views manually, outside
  any `Activity`'s own automatic inflation. `.from(parent.getContext())`
  obtains the inflater instance tied to the correct `Context` (Lesson 16's
  concept, reappearing — here obtained from the parent `ViewGroup` rather
  than `this`, since `InventoryAdapter` isn't itself an `Activity` and has
  no `Context` of its own to offer). `.inflate(R.layout.item_inventory, parent, false)`
  takes the row layout resource, the parent it will eventually attach to,
  and `false` meaning "build the view but don't attach it to `parent`
  yet" — `RecyclerView` handles the actual attaching itself, after this
  method returns.
- `return new InventoryViewHolder(rowView);` — reappearing `new`
  (Lesson 22), constructing the nested `ViewHolder` subclass, covered
  next.
- `@Override public void onBindViewHolder(InventoryViewHolder holder, int position)`
  — **first appearance.** Called every time a specific row (identified by
  `position`, its index into `items`) needs to display *this particular*
  data — including repeatedly, on the exact same recycled `ViewHolder`
  object, as the user scrolls and different data items reuse it. `holder`
  is guaranteed, by the real contract's type bound, to be an
  `InventoryViewHolder` specifically — no cast needed, direct payoff of
  the bounded generic.
- `items.get(position)` — reappearing (Lesson 20's `List.get`), reading
  the specific `InventoryItem` this row currently represents.
- `holder.nameText.setText(item.getName())` — `setText` reappearing
  (`TextView`'s own method, first met conceptually via `android:text` in
  XML, Lesson 09 — this is its Java-code equivalent, setting the same
  underlying value from code instead of a layout attribute).
- `String.valueOf(item.getQuantity())` — **first appearance.**
  `item.getQuantity()` returns an `int` (a primitive number); `setText`
  requires a `CharSequence`/`String`; `String.valueOf(...)` is a static
  method (Lesson 01's concept, reappearing) converting any value,
  including a primitive `int`, into its `String` representation.
- `getItemCount()` returning `items.size()` — reappearing (Lesson 20),
  telling `RecyclerView` exactly how many rows exist in total — the
  number that determines when scrolling has reached the end.
- `static class InventoryViewHolder extends RecyclerView.ViewHolder` —
  **first appearance of a static nested class.** A class declared
  entirely inside another class (here, inside `InventoryAdapter`), purely
  for organization — `InventoryViewHolder` is conceptually part of
  `InventoryAdapter`'s own job and has no reason to exist as a
  freestanding top-level class elsewhere. `static` specifically means
  this nested class does **not** hold any implicit reference to a
  particular `InventoryAdapter` instance — it can be constructed with
  `new InventoryViewHolder(rowView)` alone, no enclosing `InventoryAdapter`
  object required to exist first. (A *non-static* nested — "inner" —
  class would implicitly carry a reference to one specific enclosing
  instance; not needed here, since `ViewHolder` never needs to reach back
  into its adapter.)
- `final TextView nameText; final TextView quantityText;` — reappearing
  fields, `final` here because each `ViewHolder`'s two text views are
  looked up exactly once, in the constructor, and never need to point at
  different `TextView` objects afterward — only their *displayed text*
  changes, repeatedly, via `onBindViewHolder`.
- `InventoryViewHolder(View rowView) { super(rowView); ... }` —
  reappearing constructor and `super` (Lessons 22 and 06 respectively):
  `super(rowView)` satisfies the real, verified contract above —
  `RecyclerView.ViewHolder`'s own constructor requires exactly one `View`
  argument — before this subclass's own two `findViewById` calls run.

### CS Lens

The `Adapter`/`ViewHolder` pair together is the **Adapter design
pattern** by name, not just by coincidence: it adapts one interface (a
plain `List<InventoryItem>`, with no idea any UI exists) to another
interface (`RecyclerView`'s own expectations for how to create and bind
rows), without either side needing to know about the other directly.
`ViewHolder` itself is a **cache**: `findViewById` (Lesson 13) runs
exactly once per `ViewHolder`, in its constructor, rather than once per
`onBindViewHolder` call — since `onBindViewHolder` may run many times on
the very same recycled holder as the user scrolls, caching the two
`TextView` references avoids repeating that lookup unnecessarily on every
single bind.

Also recognized in: the Adapter pattern generally, wherever one existing
interface needs to work with code expecting a different, incompatible
one (database driver adapters, third-party library wrappers); the
ViewHolder-as-cache idea specifically recurs in virtually every other
list/grid/table widget across other UI frameworks (a table view's cell
reuse in iOS, a virtualized list's row components in web frameworks like
React).

### SE Lens

**Why does the real contract split creating a `ViewHolder`
(`onCreateViewHolder`) from populating it with data
(`onBindViewHolder`), as two separate abstract methods, instead of one
combined method?** Splitting them is what makes view recycling
(Lesson 18) actually work: `onCreateViewHolder` — genuinely
expensive, since it inflates real XML into real `View` objects — runs
rarely, only when a new holder is truly needed; `onBindViewHolder` —
cheap, just setting text on already-existing views — runs constantly, on
already-built holders, as the user scrolls. Combining both into one
method would either force expensive inflation to happen far too often,
or force the method to contain its own internal "do I already have a
view, or do I need to build one?" branching logic that the framework
already handles correctly on your behalf by keeping the two concerns
separate.

---

## Connect the Pieces

One trace: `RecyclerView` (not built yet — next lesson) will call
`onCreateViewHolder` a handful of times, inflating `item_inventory.xml`
via `LayoutInflater` and wrapping each result in a real
`InventoryViewHolder`, whose constructor caches both `TextView`
references via `findViewById`. It will then call `onBindViewHolder`
repeatedly — once per visible row, and again every time a recycled
holder needs different data — reading from Lesson 22's populated
`ArrayList<InventoryItem>` by position and writing each item's name and
quantity onto the cached `TextView`s.

## What Breaks Without This

Remove the `@Override` from `getItemCount()` and change its return type
to `void` with no return statement, matching neither the real contract's
required `int getItemCount()` signature. Real error attempting to
compile:

```
error: InventoryAdapter is not abstract and does not override abstract method getItemCount() in Adapter
```

This is the real contract enforcing itself exactly as Lesson 06 first
proved for `@Override` in general: a subclass of an `abstract` class with
unfulfilled abstract methods cannot be instantiated at all — the
compiler catches this immediately, rather than the app crashing later at
the point something tries to use a half-finished adapter. Restore the
correct signature before moving on.

## Exercises

1. Add a temporary `Log.d` call inside `onCreateViewHolder`, and a
   different one inside `onBindViewHolder`, then (once the next lesson
   makes this visible and scrollable) compare how many times each
   actually logs while scrolling through a longer sample list — direct,
   observed proof of view recycling, not just the written claim.
2. Attempt to change `InventoryViewHolder`'s declaration to a plain
   (non-static) inner class by removing `static`, and try to construct
   one with `new InventoryViewHolder(rowView)` exactly as written above,
   from inside a `static` method context (`onCreateViewHolder` is an
   instance method, so this specific case still compiles — instead, try
   constructing an `InventoryViewHolder` from a true `static` method you
   add temporarily, and observe the real compiler error demanding an
   enclosing instance) — confirming concretely what `static` on a nested
   class actually changes.

## Definition of Done

- [ ] You can quote, from memory or by re-deriving it, all three of
      `RecyclerView.Adapter`'s abstract methods and their exact
      signatures.
- [ ] You can explain what `static` means on `InventoryViewHolder`
      specifically, and what would be different without it.
- [ ] You triggered the real "is not abstract and does not override"
      compiler error yourself, and restored the correct signature.
- [ ] You can explain, concretely, why `findViewById` runs inside
      `InventoryViewHolder`'s constructor rather than inside
      `onBindViewHolder`.
- [ ] Commit: `git commit -m "Add InventoryAdapter fulfilling the
      RecyclerView.Adapter contract"` — explaining the contract being
      fulfilled, not just the new file.

Next: connecting this adapter to a real, visible, scrollable
`RecyclerView` with a `GridLayoutManager` — the grid screen finally shows
real rows on screen.
