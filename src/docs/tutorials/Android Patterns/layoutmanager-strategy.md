# Swappable Layout Algorithms: RecyclerView.LayoutManager

**What problem this solves.** The same collection of items might need
to be displayed in several genuinely interchangeable ways — a single
column, a grid, a horizontal strip — without rewriting the code that
manages the underlying data or handles scrolling and view recycling
itself. Hard-coding one specific layout algorithm directly into the
thing that manages the whole list would mean a completely separate
list-management implementation for every visual arrangement, duplicating
everything about data and recycling that has nothing to do with layout.
The abstract fix: pull the layout algorithm itself out into its own
separate, swappable object, so the surrounding system can work with any
of them interchangeably through one shared contract.

**Classic pattern family.** This is the Gang-of-Four **Strategy**
pattern directly: define a family of interchangeable algorithms, each
behind the same interface, so the algorithm in use can vary
independently of the code that relies on it.

**Where you'll meet it in Android.**
`androidx.recyclerview.widget.RecyclerView.LayoutManager` (the abstract
strategy contract) and its real subclasses `LinearLayoutManager` and
`GridLayoutManager`, plugged into a `RecyclerView` through
`setLayoutManager(LayoutManager)`.

**Terms used in this pattern.**

- **Abstract class as a contract** — a class that can't be
  instantiated directly, existing purely to declare what its
  subclasses must be able to do. It exists here so `RecyclerView` can be
  written entirely against the general contract, never against any one
  specific layout algorithm's real class.
- **Constructor overloading** — more than one constructor on the same
  class, distinguished by their different parameter lists
  (`LinearLayoutManager(Context)` versus `GridLayoutManager(Context,
  int)`). It exists so each concrete layout strategy can require
  exactly the configuration it actually needs — a grid needs a column
  count; a simple line doesn't — without forcing every strategy through
  one identical constructor shape.

**Objects and methods used.**

- **`RecyclerView.LayoutManager`**
  *What it is:* an abstract class defining the contract for positioning
  and scrolling a `RecyclerView`'s child views.
  *Implementation:* `public abstract static class LayoutManager`,
  declaring the methods `RecyclerView` itself calls to lay out and
  scroll its children.
  *Its use:* this is the strategy contract — `RecyclerView`'s own code
  is written entirely against this base type, never against any one
  concrete layout algorithm.
- **`LinearLayoutManager`**
  *What it is:* a concrete subclass of `LayoutManager`.
  *Implementation:* `public LinearLayoutManager(Context context)`;
  arranges items in a single scrollable line, vertical by default.
  *Its use:* one concrete strategy — the plain, single-column or
  single-row list layout.
- **`GridLayoutManager`**
  *What it is:* a concrete subclass of `LinearLayoutManager` (itself a
  `LayoutManager`).
  *Implementation:* `public GridLayoutManager(Context context, int
  spanCount)`; arranges items into a fixed number of columns
  (`spanCount`) per row.
  *Its use:* a second, entirely different concrete strategy, usable on
  the exact same data and the exact same adapter as the first.
- **`RecyclerView.setLayoutManager(LayoutManager)`**
  *What it is:* an instance method on `RecyclerView`.
  *Implementation:* `public void setLayoutManager(@Nullable
  LayoutManager layout)`.
  *Its use:* the single point where a concrete strategy is actually
  plugged in — swapping which one is active means changing only this
  one call.
- **`RecyclerView.setAdapter(Adapter)`**
  *What it is:* an instance method on `RecyclerView`.
  *Implementation:* `public void setAdapter(@Nullable Adapter adapter)`.
  *Its use:* shown here specifically to demonstrate that this call, and
  the adapter it configures, is completely untouched by which
  `LayoutManager` happens to be set — proof the two concerns really are
  independent, which is the entire point of this pattern.

---

## The Shape

Four participants:

- **`RecyclerView`** — the context that uses a strategy without ever
  knowing which concrete one is actually plugged in.
- **`RecyclerView.LayoutManager`** — the strategy contract itself.
- **`LinearLayoutManager` and `GridLayoutManager`** — two interchangeable
  concrete strategies implementing that same contract, differently.
- **The `Adapter`** (the data/recycling side, from a separate pattern) —
  entirely untouched by which strategy is active.

The relationship: `RecyclerView` holds its `LayoutManager` only through
the abstract base type — internally, whenever it needs to know where to
place a child or how to respond to a scroll gesture, it calls methods
on whatever concrete object was handed to it, with no conditional logic
anywhere asking "is this a grid or a line?" The adapter has no
connection to the layout manager at all; the identical `Adapter` object
works, unmodified, with either strategy — direct evidence the two
concerns really are independent of each other.

```
   RecyclerView --- owns a reference to (as LayoutManager) --- ?
                                                                 |
                                    could be either one:         |
                               LinearLayoutManager  <------------+
                               GridLayoutManager    <------------+

   RecyclerView --- owns a reference to (as Adapter) --- ContactAdapter
   (completely independent of which LayoutManager is active)
```

---

## Mechanical Walkthrough

```java
RecyclerView recyclerView = findViewById(R.id.contact_list);
recyclerView.setAdapter(new ContactAdapter(names));
recyclerView.setLayoutManager(new LinearLayoutManager(this));
```

Swapping only the last line, with everything above it unchanged:

```java
recyclerView.setLayoutManager(new GridLayoutManager(this, 2));
```

- **`RecyclerView recyclerView = findViewById(R.id.contact_list);`** —
  obtains the actual `RecyclerView` instance from the inflated layout;
  not itself part of the Strategy pattern's shape, shown only so the
  two configuration calls below have something to be called on.
- **`recyclerView.setAdapter(new ContactAdapter(names));`** — wires up
  the data/recycling side. This line is written once and never needs to
  change when the layout strategy below is swapped, which is the
  concrete proof that the two concerns are independent.
- **`recyclerView.setLayoutManager(new LinearLayoutManager(this));`** —
  constructs one concrete strategy (`this`, the surrounding `Activity`,
  supplies the `Context` it needs) and plugs it in through the one
  method every strategy shares.
- **`recyclerView.setLayoutManager(new GridLayoutManager(this, 2));`**
  — the entire visual arrangement changes from a single column to a
  two-column grid by changing only this one line; `2` here is the
  `spanCount` — the number of columns — a piece of configuration
  `LinearLayoutManager`'s own constructor has no equivalent parameter
  for, since a plain line has no notion of column count at all.

---

## Collaboration — how it actually runs

1. `setAdapter(...)` and `setLayoutManager(...)` are both called, in
   either order relative to each other — neither call depends on the
   other having already happened.
2. When `RecyclerView` needs to actually draw itself for the first
   time, it asks its currently-set `LayoutManager` — whichever concrete
   one that is — to compute where each visible child belongs.
   `RecyclerView`'s own code has no idea, and doesn't need to know,
   whether that's `LinearLayoutManager`'s single-column math or
   `GridLayoutManager`'s multi-column math.
3. As the user scrolls, `RecyclerView` again defers entirely to the
   `LayoutManager` to decide which new positions have become visible
   and need a view from the `Adapter`. This decision differs completely
   between a line and a grid, but `RecyclerView`'s own scrolling code
   doesn't change at all between them.
4. If the concrete `LayoutManager` is swapped later — a new one passed
   to `setLayoutManager` — `RecyclerView` simply starts asking the new
   object the same questions it was asking the old one. Nothing else
   about the `RecyclerView`, and nothing about the `Adapter`, needs to
   change.

---

## Why It's Shaped This Way

The design principle is letting an **algorithm vary independently of
the code that uses it**, so `RecyclerView`'s substantial, complex
machinery — recycling, scroll physics, item animations — is written
exactly once and reused unmodified across every possible visual
arrangement.

The alternative not chosen: a single class with an internal flag or
mode switch (`LINEAR` versus `GRID`) and `if`/`else` branches scattered
through its own layout logic. The real cost: every new layout
arrangement anyone ever wants — a staggered grid, a horizontal carousel
— would require editing that one shared class directly, risking every
existing arrangement each time, instead of writing one brand-new,
isolated `LayoutManager` subclass that can't affect any of the others.

The cost this pattern itself carries: an extra layer of abstraction and
an extra object to configure, even for the simplest possible list, and
understanding what actually happens during a layout pass means learning
the `LayoutManager` contract as its own separate thing from the
`Adapter` contract — two contracts instead of one.

---

## Recognizing It Elsewhere

Also recognized in: a sorting function accepting a comparator as an
argument; a game character's swappable movement strategy (walking,
flying, swimming) behind one shared interface; a payment system
accepting interchangeable payment-method strategies — card, wallet,
bank transfer — behind one "process payment" call; a navigation app's
interchangeable routing strategies (fastest, shortest, avoid highways).

---

## Where This Actually Breaks

The most common real mistake: calling `setAdapter(...)` and forgetting
`setLayoutManager(...)` entirely. Without a `LayoutManager`,
`RecyclerView` has no strategy at all for positioning children — it
simply shows nothing, with no crash and no error message pointing at
the missing call. This makes it a genuinely confusing first bug for
anyone new to `RecyclerView`: a fully correct `Adapter`, and a blank
screen.
