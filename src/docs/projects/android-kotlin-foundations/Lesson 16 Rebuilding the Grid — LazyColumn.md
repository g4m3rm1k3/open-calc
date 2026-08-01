# Lesson 16: Rebuilding the Grid — `LazyColumn` Instead of `RecyclerView`

**What you will build:** The real inventory screen — `InventoryActivity`
displaying `InventoryItem` rows (this series' own Lesson 10) via a
Compose `LazyColumn`, directly replacing the entire `RecyclerView`/
`Adapter`/`ViewHolder` contract Java's Lesson 18 and Lesson 26 built.
The transferable problem: Java's Lesson 26 called `RecyclerView.Adapter`
"the real contract" specifically because implementing it correctly
means fulfilling three separate required methods, each with a real,
non-obvious reason for existing — `onCreateViewHolder` (build a row
`View` only when one doesn't already exist to reuse), `onBindViewHolder`
(fill an existing or newly-built row with this position's data), and
`getItemCount` (how many rows exist). `LazyColumn` needs to solve the
identical problem — only build the rows currently visible, recycle the
rest — and this lesson proves it does, with a fraction of the code, by
naming exactly which of `LazyColumn`'s pieces stands in for which part
of that three-method contract.

**What you need to know first:** This series' Lesson 10
(`InventoryItem`, the `data class` this lesson displays), Lesson 14
(`@Composable`, `Column`), Lesson 15 (`remember`, `mutableStateOf`,
recomposition). Java's Lesson 18 (the `RecyclerView` choice and view
recycling as the object-pool pattern) and Lesson 26
(`RecyclerView.Adapter`'s real three-method contract — quoted directly
below, not re-derived).

**Terms introduced in this lesson:**
- **`LazyColumn`** — a Compose composable that lays out and composes
  only the items currently visible (plus a small buffer) in a vertically
  scrolling list, the direct Compose descendant of `RecyclerView`.
- **`items(list) { item -> ... }`** — the `LazyColumn` DSL function
  describing how to render one row, given one element of a list.
- **Content lambda** — a lambda parameter to a composable function that
  itself contains more composable calls, the mechanism `LazyColumn`,
  `Column`, and `Row` all use to accept their own children.

---

## Concept Unit: The Contract Being Replaced

### The Problem

Before writing anything new, state precisely what's being replaced.
Java's Lesson 26 quoted `RecyclerView.Adapter`'s real required shape:

```java
public abstract class Adapter<VH extends ViewHolder> {
    public abstract VH onCreateViewHolder(ViewGroup parent, int viewType);
    public abstract void onBindViewHolder(VH holder, int position);
    public abstract int getItemCount();
}
```

Three required methods, each solving a distinct part of the same
problem: `onCreateViewHolder` builds a new row `View` — but, per Java's
Lesson 26 own explanation, *only* when `RecyclerView` doesn't already
have a recycled one lying around to reuse, which is the entire
performance idea the class exists for. `onBindViewHolder` takes
whichever `ViewHolder` it's handed — freshly built or recycled — and
fills it with the data for one specific position. `getItemCount` tells
`RecyclerView` how many rows exist at all, so it knows how far
scrolling can go. Implementing all three, correctly, is a real,
non-trivial amount of code for what is conceptually a simple job:
"show one row per item in this list."

### CS Lens

Restating Java's Lesson 18 own CS Lens exactly, because it's the
concept `LazyColumn` still has to solve underneath its own simpler API:
view recycling is the **object pool pattern** — reusing a small, fixed
set of expensive-to-create objects rather than creating and destroying
one per data item.

---

## Concept Unit: `LazyColumn` — the Same Job, One Function

### The Problem

Does Compose's declarative model (Lesson 14) mean the recycling problem
simply disappears, or does `LazyColumn` still have to solve it —
just without exposing the solution as three methods you implement
yourself?

### Introduce the Concept in Isolation

```kotlin
@Composable
fun InventoryList(items: List<InventoryItem>) {
    LazyColumn {
        items(items) { item ->
            Row(modifier = Modifier.padding(16.dp)) {
                Text(text = item.name, modifier = Modifier.weight(1f))
                Text(text = item.quantity.toString())
            }
        }
    }
}
```

`LazyColumn { ... }` takes a **content lambda** — a lambda that isn't
executed like an ordinary callback returning one value, but instead
describes, imperatively-looking but declaratively-interpreted, what
content the `LazyColumn` should contain. Inside it, `items(items) { item
-> ... }` is a real function, provided by Compose specifically for this
scope, taking the actual `List<InventoryItem>` and a lambda describing
how to render *one* `item`. This single call replaces all three of
`Adapter`'s required methods at once: `getItemCount` is answered
implicitly by `items.size` (the list `items()` was given); `
onCreateViewHolder`/`onBindViewHolder`'s combined job — "produce the
right row content for this position, reusing underlying resources
efficiently when possible" — is handled by `LazyColumn`'s own internal
implementation, which only actually composes the row lambda for items
near the visible viewport, exactly the recycling behavior Java's Lesson
26 required real, explicit code to achieve.

`item.quantity.toString()` — reappearing, the exact `.toString()`
concept this series' own Lesson 08 already used converting an `Editable`
to a `String`, here converting an `Int` instead. `Modifier.weight(1f)`
is a new `Modifier` (Lesson 14's concept) used specifically inside a
`Row`: it tells that one child to expand and take up any leftover space
along the row's main axis, the Compose mechanism for "this column of
text should stretch to fill the row," a job Java's own tabular
`LinearLayoutManager` row layouts would have solved with
`android:layout_weight` on a plain `LinearLayout` child — the identical
underlying idea, expressed as a modifier instead of an XML attribute.

### Discard the Throwaway Example

`InventoryList` above is not throwaway in the usual sense — it becomes
the real project's composable in the next unit, essentially unchanged.

### CS Lens

`LazyColumn` solving the object-pool problem *underneath* a declarative
API, rather than exposing it as a contract you implement, is the same
distinction Lesson 14's own SE Lens already drew between Compose's and
`RecyclerView`'s approach to efficiency generally — here made concrete
on the exact three-method contract Java's Lesson 26 required.

### SE Lens

**Given `LazyColumn` does the identical underlying job in dramatically
less code, is there ever still a real reason to reach for
`RecyclerView.Adapter` directly in a Compose-based app?** Yes, though
rarely for a case shaped like this project's grid: `RecyclerView`
remains the right tool when a screen mixes Compose with substantial
existing View-based code that isn't being rewritten (this project's own
login screen, still View Binding-based, is exactly such a case, though
it has no scrollable list of its own), or when a specific, low-level
recycling behavior genuinely needs manual control `LazyColumn`'s API
doesn't expose. For a screen built in Compose from scratch, as this
grid now is, `LazyColumn` is the current, correct default — the same
category of judgment Java's Lesson 18 already modeled: name the real
alternative, name a real scenario where it would still be correct, and
choose deliberately rather than by default.

---

## Concept Unit: Wiring the Real Inventory Screen

### The Problem

`InventoryActivity` (this series' own Lesson 11) currently just calls
`setContentView(R.layout.activity_inventory)` against an empty XML
layout. It needs to host a real composable instead.

### Project Change

- **Reference Source:** No reference counterpart for `InventoryList`
  itself (an application composable); `ComponentActivity.setContent`,
  the real AndroidX entry point connecting an Activity to a Compose
  composition, is a standard, stable `androidx.activity.compose` API.
- **Files affected:** `InventoryActivity.kt`; `activity_inventory.xml`
  becomes unused (Compose screens don't use an XML layout resource at
  all) and can be deleted.
- **Change type:** Replace `onCreate`'s body.
- **Dependencies:** This series' own Lesson 10 `InventoryItem`/sample
  list, Lesson 14's Compose setup.

### The New Code

```kotlin
setContent {
    val items = remember {
        mutableStateListOf(
            InventoryItem("Bolts", 120),
            InventoryItem("Washers", 85),
            InventoryItem("Nuts", 200)
        )
    }
    InventoryList(items)
}
```

### The Updated Project

```kotlin
class InventoryActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {                                                    // ← new
            val items = remember {                                      // ← new
                mutableStateListOf(                                     // ← new
                    InventoryItem("Bolts", 120),                        // ← new
                    InventoryItem("Washers", 85),                       // ← new
                    InventoryItem("Nuts", 200)                          // ← new
                )                                                        // ← new
            }                                                            // ← new
            InventoryList(items)                                        // ← new
        }
    }
}

@Composable
fun InventoryList(items: List<InventoryItem>) {
    LazyColumn {
        items(items) { item ->
            Row(modifier = Modifier.padding(16.dp)) {
                Text(text = item.name, modifier = Modifier.weight(1f))
                Text(text = item.quantity.toString())
            }
        }
    }
}
```

### Mechanical Walkthrough

- `class InventoryActivity : ComponentActivity()` — **first appearance
  of `ComponentActivity` in this series.** `setContent { }`, used below,
  is declared on `ComponentActivity` specifically — a lighter-weight
  Activity base class than `AppCompatActivity` (this series' own Lesson
  05), sufficient for a screen built entirely in Compose with no
  AppCompat-specific View features needed. `MainActivity` keeps
  extending `AppCompatActivity`, unchanged — this project deliberately
  uses two different Activity base classes for its two different UI
  systems, side by side.
- `setContent { ... }` — **first appearance.** The real Compose entry
  point: it takes a composable content lambda and makes it — and
  everything it calls — the Activity's entire displayed UI, replacing
  `setContentView(R.layout...)`'s job for a Compose-based screen
  entirely. This is the one real, designated place a composable tree can
  begin, answering directly the question this series' own Lesson 14
  left open when its compiler error proved composables can't be called
  from just anywhere.
- `mutableStateListOf(...)` — **first appearance.** The list-specific
  counterpart to Lesson 15's `mutableStateOf`: a real, observable list —
  adding, removing, or replacing an element inside it (used directly,
  starting next lesson) triggers recomposition of anything reading it,
  the same observation mechanism Lesson 15 proved for a single value,
  extended to a whole collection.
- `remember { mutableStateListOf(...) } ` — reappearing, this series'
  own Lesson 15 concept: without `remember`, a fresh, re-initialized
  three-item list would be rebuilt on every recomposition, discarding
  any row this project adds or removes later.
- `InventoryList(items)` — an ordinary composable call (Lesson 14),
  now passed real, observable data instead of the throwaway argument
  this lesson's own isolated lab used.

### SE Lens

**Why does this project keep `MainActivity` on `AppCompatActivity` while
giving `InventoryActivity` the lighter `ComponentActivity`, rather than
standardizing on one base class for consistency?** `AppCompatActivity`
exists specifically to back-port and unify View-system features
(theming, the action bar, cross-version compatibility) that a
Compose-only screen simply doesn't use — `InventoryActivity` never calls
`setContentView(R.layout...)`, never touches a `Toolbar`, and has no
View-based widgets at all. Extending `AppCompatActivity` there anyway
would cost nothing functionally but would misstate, to a future reader,
that this screen has some reason to need View-system compatibility
machinery it genuinely doesn't. Choosing the narrower, honest base class
per screen is a small, real instance of minimizing what each class
claims to depend on — the same reasoning this series has applied to
fields, properties, and now base classes.

---

## Connect the Pieces

One trace: `InventoryActivity`'s `setContent { }` established the one
real entry point into a Compose composition (answering Lesson 14's own
open compiler-error question), inside which `remember {
mutableStateListOf(...) }` created real, observable inventory data
(Lesson 15's `remember`/`mutableStateOf` pairing, extended to a whole
list). `InventoryList(items)` composed that data into `LazyColumn`,
whose `items(items) { item -> ... }` call replaced every one of
`RecyclerView.Adapter`'s three required methods — `onCreateViewHolder`,
`onBindViewHolder`, `getItemCount` — with one function call, while
still solving the identical view-recycling problem Java's Lesson 18 and
26 required real, explicit code to handle.

## What Breaks Without This

Remove `remember { }` from around `mutableStateListOf(...)`, leaving
`val items = mutableStateListOf(...)` directly inside `setContent`, and
trigger a recomposition by rotating the device once the app is running.

Real result, when you do this yourself: the list resets to its original
three items — the identical failure this series' own Lesson 15 already
proved on a single counter value, now shown on a whole list, for
exactly the same reason: without `remember`, a brand-new
`mutableStateListOf(...)` call runs on every recomposition, discarding
whatever the previous one held. Restore `remember` before moving on.

## Exercises

1. Add a fourth `InventoryItem` directly inside the initial
   `mutableStateListOf(...)` call and confirm it appears as a fourth row
   with no other code changes — direct proof that `LazyColumn` genuinely
   renders however many items the list actually contains, the Compose
   equivalent of `getItemCount()` needing no separate implementation.
2. Temporarily change `LazyColumn` to a plain `Column` (still using the
   same `items(items) { ... }` call, which also works inside an ordinary
   `Column` on a small, fixed-size list) and explain, in your own words,
   why this would become a real performance problem on a list of
   several thousand rows, connecting your answer directly to Java's own
   Lesson 18 object-pool reasoning.
3. Add a `Text` header row above the `LazyColumn`'s `items(...)` call,
   directly inside `LazyColumn`'s own content lambda (Compose supports
   mixing a plain, always-composed `item { }` alongside `items(...)` in
   the same `LazyColumn` — look up its real signature and use it),
   confirming a `LazyColumn` isn't restricted to rendering only list
   items.

## Definition of Done

- [ ] `InventoryActivity` displays all three sample inventory rows via
      `LazyColumn`, verified on a running emulator or device.
- [ ] You can name which part of `RecyclerView.Adapter`'s three-method
      contract each part of `LazyColumn`'s API replaces.
- [ ] You can explain why `InventoryActivity` extends `ComponentActivity`
      while `MainActivity` still extends `AppCompatActivity`.
- [ ] You triggered the real "list resets on rotation" failure from a
      missing `remember`, and restored it.
- [ ] Commit: `git commit -m "Replace RecyclerView/Adapter with a
      LazyColumn-based inventory list"` — explaining what the three
      Adapter methods are being replaced by, not just that the screen
      now works.

Next: adding a row for real — and the Compose architecture question this
project hasn't had to ask yet: which composable actually owns the list,
and how does a child report a new item upward without owning the list
itself?
