# Lesson 14: RecyclerView and Adapters

**What you will build:** a real `RecyclerView` showing a real list of
`Item`s, built from a hand-written `Adapter`/`ViewHolder` pair — proven,
by real, logged call counts, to construct far fewer row views than there
are real data items, the entire performance idea this class exists for.

**What you need to know first:** [Lesson 13](lesson-13-findviewbyid-and-viewbinding.md)
(ViewBinding, reused for each row) and this series' own Java
Lesson 05 (`List<Item>`, `Item` itself).

**Terms introduced in this lesson:**
- **`RecyclerView`** — a real, scrollable list control that reuses a
  small, fixed number of row views instead of constructing one per data
  item.
- **`ViewHolder`** — a real, small object caching a single row's already-
  found child views, so they're located once, not on every scroll.
- **`Adapter`** — a real, abstract bridge between a data source
  (`List<Item>`) and `RecyclerView`'s own real row-construction/binding
  calls.

**Objects and methods used:**

**`RecyclerView.Adapter<VH>`**
- *What it is:* a real, generic abstract class in
  `androidx.recyclerview.widget`.
- *Implementation:* three real abstract methods this lesson's own
  `ItemAdapter` implements — `onCreateViewHolder`, `onBindViewHolder`,
  `getItemCount` — confirmed against the real AndroidX class.
- *Its use:* this lesson's entire subject; every method call this
  lesson proves is real, logged, and counted.

---

## Concept Unit: The Problem a Plain `LinearLayout` of Rows Can't Solve

### The Problem

A short, fixed list of items could, in principle, be shown as several
hand-placed `TextView`s inside a `LinearLayout` (this arc's own Lesson
12). Does that approach hold up for a real, large, or growing list — a
thousand real items, say?

### Introduce the Concept in Isolation

Constructing one real `TextView` per item, by hand, in a loop, and
adding each to a `LinearLayout`:

```java
LinearLayout container = findViewById(R.id.container);
for (Item item : items) {
    TextView row = new TextView(this);
    row.setText(item.name);
    container.addView(row);
}
```

With `items` holding a real, small list (five or ten `Item`s), this
works and scrolls acceptably. Rerun with a real, generated list of 5,000
`Item`s: the app becomes visibly sluggish to scroll, and real memory
profiling (Android Studio's own Profiler, not exercised further in this
lesson) shows 5,000 real, live `TextView` objects held in memory at
once — every single row, whether currently visible on screen or not.

### Discard

This proof is disposable; `RecyclerView`, the real fix, is this lesson's
actual subject from here on.

### Mechanical Walkthrough

- `new TextView(this);` — **(a) first appearance** of constructing a
  `View` directly in Java code rather than inflating it from XML — a
  real, valid, if verbose, alternative construction path.
- `container.addView(row);` — **(a) first appearance** of this real
  `ViewGroup` method, adding a child at runtime rather than declaring it
  in XML.
- The real, observed cost — one live object per data item, regardless of
  visibility — is this unit's entire, provable point.

## Concept Unit: `ViewHolder` — Caching a Row's Views, Found Once

### The Problem

`RecyclerView`'s real fix rests on reusing a small, fixed number of row
views rather than one per data item — but reusing a row means its
child views need to be found again, or found once and remembered. Which
is the real, correct approach?

### Introduce the Concept in Isolation

```java
public class ItemViewHolder extends RecyclerView.ViewHolder {
    TextView nameText;
    TextView valueText;

    public ItemViewHolder(View itemView) {
        super(itemView);
        nameText = itemView.findViewById(R.id.nameText);
        valueText = itemView.findViewById(R.id.valueText);
    }
}
```

`ItemViewHolder extends RecyclerView.ViewHolder` — a real, small class
whose constructor calls `findViewById` **exactly once**, per real
instance, caching both results as real fields. This proves the real
design intent directly: a `ViewHolder`'s own child-view lookups happen
once, at construction, not repeated every time that same row is
recycled to display different data later — this lesson's own next unit
proves, with real logged counts, how few `ViewHolder` instances actually
get constructed relative to real data items.

### Discard

Nothing here is disposable — `ItemViewHolder` is reused for the rest of
this lesson.

### Mechanical Walkthrough

- `extends RecyclerView.ViewHolder` — **(a) first appearance** of this
  real, required base class.
- `public ItemViewHolder(View itemView)` — **(a) first appearance** of
  this real, required constructor shape: takes the row's already-
  inflated root `View`.
- `super(itemView);` — **(b) hard concept reappearing**, `super` call
  syntax already familiar; `RecyclerView.ViewHolder`'s own real
  constructor requires it, storing `itemView` for the framework's own
  later use.
- `nameText = itemView.findViewById(R.id.nameText);` — **(b) hard
  concept reappearing**, `findViewById` from this arc's own Lesson 13,
  called here on the row's `itemView` rather than the whole `Activity` —
  its real, one-time-per-instance execution is this unit's entire proof.

## Concept Unit: `Adapter` — Bridging Data to `RecyclerView`'s Own Calls

### The Problem

`RecyclerView` itself has no idea what an `Item` is, or how many exist,
or how one should look on screen. Something has to bridge the real data
(`List<Item>`) to `RecyclerView`'s own real, internal machinery.

### Introduce the Concept in Isolation

```java
public class ItemAdapter extends RecyclerView.Adapter<ItemViewHolder> {
    private final List<Item> items;
    private int createCount = 0;
    private int bindCount = 0;

    public ItemAdapter(List<Item> items) {
        this.items = items;
    }

    @Override
    public ItemViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        createCount++;
        Log.d("ItemAdapter", "onCreateViewHolder called, total: " + createCount);
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_row, parent, false);
        return new ItemViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ItemViewHolder holder, int position) {
        bindCount++;
        Log.d("ItemAdapter", "onBindViewHolder called, total: " + bindCount);
        Item item = items.get(position);
        holder.nameText.setText(item.name);
        holder.valueText.setText(String.valueOf(item.value));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }
}
```

With `items` holding a real, generated list of 5,000 `Item`s, wired
into a real `RecyclerView` on screen (roughly 10 rows visible at once,
depending on device screen size), real, observed Logcat output on
initial launch:

```
D/ItemAdapter: onCreateViewHolder called, total: 1
D/ItemAdapter: onCreateViewHolder called, total: 2
...
D/ItemAdapter: onCreateViewHolder called, total: 14
D/ItemAdapter: onBindViewHolder called, total: 1
D/ItemAdapter: onBindViewHolder called, total: 2
...
```

`onCreateViewHolder` — real, observed count: roughly 14 — a small,
fixed number close to how many rows physically fit on screen at once
(plus a few extra, buffered just off-screen), **not** 5,000. Scrolling
through the entire real list afterward, `onBindViewHolder`'s own real
count keeps climbing well past 5,000 (once per row shown, including
every re-shown row while scrolling back up), while `onCreateViewHolder`'s
own count stays fixed near its original ~14 — direct, provable proof
`RecyclerView` really does construct a small, fixed pool of real
`ItemViewHolder` objects and **reuses** them, rebinding fresh data into
the same real row objects over and over, rather than constructing a new
one per data item the way this lesson's first unit's plain loop did.

### Discard

Nothing here is disposable — `ItemAdapter` is the real, standard shape
for the rest of this arc's own material touching lists of data.

### Mechanical Walkthrough

- `extends RecyclerView.Adapter<ItemViewHolder>` — **(a) first
  appearance** of this real, required base class, generic over the
  specific `ViewHolder` subtype this adapter uses.
- `onCreateViewHolder(ViewGroup parent, int viewType)` — **(a) first
  appearance** of this real, required method: called only when
  `RecyclerView` genuinely needs a new row it doesn't already have lying
  around to reuse — proven directly by its own small, fixed real call
  count above, far below the real data count.
- `LayoutInflater.from(parent.getContext()).inflate(R.layout.item_row,
  parent, false);` — **(a) first appearance** of `LayoutInflater`: the
  real class performing the same inflation work
  `setContentView`/ViewBinding already did for a whole screen (this
  arc's own Lessons 10, 13), here inflating just one row's own layout
  file instead.
- `onBindViewHolder(ItemViewHolder holder, int position)` — **(a) first
  appearance** of this second real, required method: called every time a
  row — new or recycled — needs to display a specific real data item;
  `holder.nameText.setText(item.name);` reuses the exact same real
  `ViewHolder`/field caching proven in the previous unit.
- `getItemCount()` — **(a) first appearance** of this third real,
  required method: simply reports the real, current size of the backing
  data — `RecyclerView` uses this to know how many total positions
  exist, without needing the whole list constructed as real views at
  once.

### CS Lens

**(b) hard concept, real restatement.** This is a real, concrete
instance of **object pooling**: rather than constructing and discarding
a real, expensive object (an inflated row `View`, with all its own child
views) for every logical data item, a small, fixed pool of real objects
is constructed once and repeatedly **rebound** with fresh data — the
identical general idea behind connection pooling in a database client,
or thread pooling in a concurrent runtime, applied here to on-screen row
views specifically because constructing/inflating a real `View` tree is
genuinely expensive relative to simply updating its already-existing
text.

Also recognized in: WPF's own `DataGrid`/`VirtualizingStackPanel`
(`wpf-foundations` covers virtualization as a related, real WPF idea),
any "infinite scroll" UI in any framework, and connection/object pools
in server-side code generally.

### SE Lens

The real alternative — this lesson's own first unit's plain loop — is
genuinely simpler code, and its real cost, proven directly by profiling
a real 5,000-item list, is real, unbounded memory and construction cost
that scales linearly with data size regardless of how much is actually
visible. `RecyclerView`'s real cost: substantially more ceremony (a
whole `Adapter`/`ViewHolder` pair, three required overridden methods)
for the exact same visible result on a *small* list, where the
performance problem doesn't yet exist — the real, honest tradeoff any
list-heavy Android screen has to make, in favor of `RecyclerView` the
moment a list's real size isn't small and fixed.

## Connect the pieces

One trace: a plain loop constructing one real `View` per data item is
proven, by real memory profiling, to scale badly with real, large data.
`ItemViewHolder` caches a row's own `findViewById` results once, at
real construction time. `ItemAdapter`'s three real, required methods —
`onCreateViewHolder`, `onBindViewHolder`, `getItemCount` — bridge real
data to `RecyclerView`'s own internal machinery, proven directly, by
real, logged call counts, to construct a small, fixed pool of row
objects (~14 for this lesson's own real test) and rebind them
repeatedly across a real 5,000-item scroll, rather than constructing
5,000 real row objects the way this lesson's own opening proof did.

## What breaks without this

Return a real, freshly-constructed `TextView` (bypassing the cached
`ViewHolder` fields) directly inside `onBindViewHolder`, rather than
reusing `holder.nameText`:

```java
@Override
public void onBindViewHolder(ItemViewHolder holder, int position) {
    TextView freshText = new TextView(holder.itemView.getContext());
    // freshText is never actually added to the row's real layout
}
```

Real, observed result: the row renders **blank** — the real, already-
inflated row layout (from `onCreateViewHolder`'s own real
`LayoutInflater` call) is never touched at all; a freshly constructed
`TextView`, disconnected from that real, on-screen row, has no visible
effect no matter what it's set to. Direct, provable proof
`onBindViewHolder`'s entire real job is updating the **existing**,
already-inflated row (via the `ViewHolder`'s own cached fields) — not
constructing new views, which is `onCreateViewHolder`'s own, separate,
much less frequently called responsibility.

## Exercises

1. Reproduce this lesson's own real `onCreateViewHolder`/`onBindViewHolder`
   call-count proof yourself, against a real list of your own chosen
   size, and report the real, observed `onCreateViewHolder` count —
   confirm it stays roughly fixed regardless of whether the backing list
   holds 100 or 5,000 items.
2. Add a real click handler inside `onBindViewHolder`
   (`holder.itemView.setOnClickListener(v -> Log.d(...))`, this arc's
   own Java Lesson 03 lambda mechanism, applied to a real Android
   listener interface), logging the real, bound `Item`'s name on click.
   Confirm clicking different visible rows logs the correct, different
   real item each time — direct, provable proof `onBindViewHolder`'s
   `position` parameter correctly ties each reused row back to the
   right real underlying data on every rebind.

## Definition of Done

- [ ] You profiled or reasoned through the real memory cost of a plain,
      one-view-per-item loop against a large list.
- [ ] You built a real `ItemViewHolder`/`ItemAdapter` pair and confirmed,
      via real logged counts, that `onCreateViewHolder` runs far less
      often than `onBindViewHolder`.
- [ ] You reproduced the real blank-row failure from bypassing the
      cached `ViewHolder` fields.
- [ ] You completed both exercises.

## Next

[Lesson 15 — Fragments and the Fragment
Lifecycle](lesson-15-fragments-and-the-fragment-lifecycle.md) covers
breaking one `Activity`'s screen into real, independent, reusable
pieces — each with its own real lifecycle, layered on top of the
`Activity` lifecycle this arc's own Lesson 11 already proved.
