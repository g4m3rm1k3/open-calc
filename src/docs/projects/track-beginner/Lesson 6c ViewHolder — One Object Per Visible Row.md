# Lesson 6c: `ViewHolder` — One Object Per Visible Row, Not Per Data Item

**What you will build:** A preview of the `InventoryViewHolder` code —
not saved as its own file yet, for a specific reason explained below.
The transferable problem: `RecyclerView` will, at runtime, need to
reach into a given row's views (right now, just its one `TextView`)
and set their content. The naive approach would be calling
`findViewById` fresh, every single time a row needs to be updated —
which happens continuously as the user scrolls. `findViewById` walks
the view tree to find a match; doing that repeatedly for every scroll
frame is wasted, repeated work — the same "work you don't need to
redo" theme as the earlier `addView()` loop, just at a smaller scale.

**What you need to know first:** Lesson 6a (the row layout,
`list_item_inventory.xml`, exists), Lesson 6b (`static` on a nested
class — this lesson uses that exact shape), Lesson 2a (fields,
constructors, `this`), Lesson 2c (`super(...)` calling a parent
constructor).

---

## Concept Unit: `ViewHolder` — One Object Per Visible Row, Not Per Data Item

### The Problem

`RecyclerView` will, at runtime, need to reach into a given row's views
(right now, just its one `TextView`) and set their content. The naive
approach would be calling `findViewById` fresh, every single time a row
needs to be updated — which happens continuously as the user scrolls.
`findViewById` walks the view tree to find a match; doing that
repeatedly for every scroll frame is wasted, repeated work — the same
"work you don't need to redo" theme as the `addView()` loop earlier,
just at a smaller scale.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None yet. This fragment is a preview to type and
  understand in isolation — **do not create `InventoryAdapter.java`
  yet.** A bare `static class` cannot legally be the only thing in a
  `.java` file: `static` on a class only means something for a class
  nested *inside* another one, and
  there's no outer class here yet for it to nest inside. Saving this
  fragment alone would fail to compile. Lesson 6e wraps it inside
  `InventoryAdapter` and gives you the complete, real, compilable file
  to actually create.
- **Change type:** Preview only — nothing saved to disk yet.

### The New Code

```java
static class InventoryViewHolder extends RecyclerView.ViewHolder {
    TextView itemNameText;

    InventoryViewHolder(View itemView) {
        super(itemView);
        itemNameText = itemView.findViewById(R.id.itemNameText);
    }
}
```

### The Updated Project

There is no real file to show this landing inside yet, on purpose —
this is exactly the code that becomes a nested class inside
`InventoryAdapter`, shown whole, as one complete and actually
compilable file, in Lesson 6e. Hold onto it; don't type it into a new
file by itself.

### Mechanical Walkthrough

- `static class InventoryViewHolder extends RecyclerView.ViewHolder` —
  the `static class` part is **reappearing** — `InventoryViewHolder`
  gives up the hidden reference to its enclosing `Adapter` for exactly
  the reason already covered: it only ever needs its own row's views,
  never the `Adapter` itself.
  `extends RecyclerView.ViewHolder` is the required base class — the
  library's own contract for what counts as a "holder of a row's
  views," same "must extend the framework's class" idea as
  `AppCompatActivity`, different base class.
- `TextView itemNameText;` — **reappearing** (field declaration), new
  detail: package-private (no modifier) rather than
  `private`, a deliberate choice so the enclosing `Adapter` class
  can read this field directly without a getter method —
  reasonable for a small, tightly-coupled helper class like this one.
- `InventoryViewHolder(View itemView)` — **reappearing** (a
  constructor), same shape: a method with no return type,
  matching the class's own name, that runs exactly once when
  `new InventoryViewHolder(...)` is called, setting up the object
  before anyone else can use it.
- `super(itemView)` — **reappearing concept** (the parent-call
  pattern), now on a constructor instead of `onCreate`:
  `RecyclerView.ViewHolder`'s own constructor requires the row's root
  `View` and stores it internally (accessible later as `.itemView`).
- `itemView.findViewById(R.id.itemNameText)` — **reappearing**
  (`findViewById`), new detail: called on `itemView` (the
  inflated `list_item_inventory.xml` root) rather than on an Activity —
  `findViewById` works the same way on any View, searching its own
  subtree, which here is a single `TextView`, not a whole screen.

### CS Lens

This is a **caching expensive lookups on first use** idea, closely
related to the Flyweight design pattern — do the costly work (finding
child views) exactly once, when a holder object is first constructed,
then reuse the cached reference every time that holder is recycled for
new data. Also recognized in: memoization of a pure function's result,
compiled regex objects cached instead of recompiled per match, and
prepared SQL statements reused across multiple queries instead of
re-parsed each time.

### SE Lens

**Why a whole extra class instead of just calling `findViewById` inside
whatever method updates a row?** The alternative is exactly what early
Android list code did (a pattern without a ViewHolder, common enough to
have its own name in older tutorials), and it was a well-documented
performance problem: `findViewById` uses a tree walk, and doing it on
every scroll frame for every visible row created measurable, visible
jank on the phones of that era. The `ViewHolder` class costs you one
extra type to define and reason about, in exchange for making "look up
my views" a one-time cost per holder object rather than a
per-scroll-frame cost.

---

## Connect the Pieces

`InventoryViewHolder` is the second of four pieces `RecyclerView` needs
before anything shows on screen: the row layout and screen layout
(6a), this holder class (6c) — still just a fragment, not yet a real
file — and two more concepts before it can be wrapped into a real,
compilable class: generics (6d), then the `Adapter` itself (6e), which
is where this exact code finally gets saved to disk.

## What Breaks Without This

There's nothing to run yet — this lesson file produced no saved code,
deliberately, per the Project Change note above. The "what breaks"
question is answered structurally instead: try, right now, to imagine
saving just this fragment as its own `InventoryViewHolder.java` file
and compiling it. It would fail — `static` on a top-level class (one
not nested inside another) is not legal Java at all; the compiler has
no "class this belongs to" for `static` to mean anything relative to.
Lesson 6e resolves this by giving it a real outer class to live inside.

## Exercises

1. Without running anything, write out — on paper or in a comment —
   what you predict happens if `itemNameText` were declared `private`
   instead of package-private, and `InventoryAdapter` later tried to
   read `holder.itemNameText` directly (the real `Adapter` does exactly
   this). Check your prediction against what you know about access
   modifiers.

## Definition of Done

- [ ] You can explain, in your own words, why `InventoryViewHolder`
      can't be saved as its own file yet.
- [ ] You can explain what problem caching `itemNameText` in the
      constructor solves, versus calling `findViewById` again every
      time a row updates.
- [ ] No git commit for this lesson — no file was created or modified.

Lesson 6d is next: generics — the mechanism behind `List<String>`,
needed before the real `Adapter` class (6e) can be written.
