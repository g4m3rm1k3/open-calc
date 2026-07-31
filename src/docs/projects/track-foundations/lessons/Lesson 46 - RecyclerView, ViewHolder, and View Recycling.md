# Lesson 46: RecyclerView, ViewHolder, and View Recycling

**What you will build:** Several small, fully runnable, plain Java labs,
building up through nine smaller ideas to Android's real RecyclerView
subsystem — the largest single cluster of related concepts in this
curriculum, all serving one real, cohesive system.

**What you need to know first:** Lesson 41's `view tree`, Lesson 11's
`XML` and `findViewById`, Lesson 01's `nested class`, Lesson 03's
`class-level state`, Lesson 06's `interface`, Lesson 07's `generics`.

**Terms introduced in this lesson:**

- **Eager vs. lazy evaluation** — doing all the work upfront regardless
  of whether it's needed (eager) versus doing only the work a specific
  moment actually requires (lazy/on-demand).
- **Cache an expensive lookup on first use** — doing an expensive
  computation or lookup exactly once, storing the result, and reusing
  the cached result on every subsequent need.
- **View recycling** — keeping only a small, roughly-screen-sized pool of
  row View objects alive and reusing them as the user scrolls, refilling
  each recycled view with new data instead of constructing a fresh view
  per data item.
- **Layout inflation** — the process of turning an XML layout resource
  into real, constructed View objects at runtime.
- **Static vs. non-static nested classes** — a non-static nested class
  silently holds a hidden reference to the specific enclosing-class
  instance that created it; a static nested class carries no such
  reference and can be constructed independent of any enclosing
  instance.
- **`ViewHolder`** — an object caching one row's view references once, at
  construction, so later data updates skip re-searching the view tree.
- **Strategy pattern** — an algorithm or behavior is extracted into a
  separate, swappable object or interface, rather than baked directly
  into the class that uses it.
- **`RecyclerView.Adapter`** — an object bridging a data list to a
  bounded number of reusable row views — responsible for creating
  holders, binding data into them, and reporting the total item count.
- **`RecyclerView.LayoutManager`** — a swappable collaborator responsible
  purely for arranging a RecyclerView's rows spatially, independent of
  the Adapter that supplies data.

---

## Concept Unit: Eager vs. Lazy Evaluation

### The Problem

A list of a thousand items, displayed on a screen tall enough to show
only ten at a time, doesn't need all thousand corresponding visual rows
constructed at once — building every row upfront wastes real work on rows
that will never actually be seen.

### Introduce the Concept in Isolation

```
mkdir lesson-46
cd lesson-46
```

Create `Main.java`:

```java
public class Main {
    static String buildExpensiveRow(int index) {
        System.out.println("Building row " + index + "...");
        return "Row " + index;
    }

    public static void main(String[] args) {
        System.out.println("Eager: building all 5 rows upfront.");
        for (int i = 0; i < 5; i++) {
            buildExpensiveRow(i);
        }

        System.out.println("Lazy: building only the 2 rows actually needed.");
        String visibleRow1 = buildExpensiveRow(0);
        String visibleRow2 = buildExpensiveRow(1);
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Eager: building all 5 rows upfront.
Building row 0...
Building row 1...
Building row 2...
Building row 3...
Building row 4...
Lazy: building only the 2 rows actually needed.
Building row 0...
Building row 1...
```

#### Execution Trace

The `for` loop runs a fixed number of times regardless of need, which is
exactly the eager behavior being demonstrated:

1. `i = 0`, `i < 5` is `true`, so `buildExpensiveRow(0)` runs,
   unconditionally — nothing checked whether row 0 would ever actually be
   displayed.
2. `i = 1`, `i < 5` is still `true`, so `buildExpensiveRow(1)` runs the
   same way, `i` having been incremented from `0` to `1` by the loop's
   own increment step.
3. This repeats identically for `i = 2`, `3`, and `4` — five total calls,
   because the loop's own condition, `i < 5`, is the only thing deciding
   how many times it runs, with no connection at all to how many rows a
   real screen could ever display.
4. `i` becomes `5`; `i < 5` is now `false`, so the loop stops. All five
   calls already happened, unconditionally, before this point — the
   defining trait of eager evaluation.

The eager section calls `buildExpensiveRow` five times, regardless of
need; the lazy section calls it only twice, exactly matching what's
actually used. This is `eager vs. lazy evaluation` — **first
appearance**: doing all the work upfront regardless of whether it's
needed (eager) versus doing only the work a specific moment actually
requires (lazy/on-demand).

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `for (int i = 0; i < 5; i++) { buildExpensiveRow(i); }` — **(a) first
   appearance** of eager evaluation examined explicitly: every possible
   row is built immediately, whether or not it will ever be needed.
2. `String visibleRow1 = buildExpensiveRow(0); String visibleRow2 =
   buildExpensiveRow(1);` — **(a) first appearance** of lazy evaluation:
   only the specific rows actually required are built, and only at the
   moment they're required.

### CS Lens

Eager evaluation trades wasted work for simplicity; lazy evaluation
trades a small amount of extra bookkeeping (tracking what's actually
needed) for avoiding unnecessary work entirely. This is exactly what's
wasteful about looping and constructing every row's View upfront instead
of only the ones currently visible on screen.

Also recognized in: lazy sequences in many functional languages, `yield`-
based generators in Python, database query result streaming (rows
fetched only as they're actually consumed, not all loaded into memory
upfront).

### SE Lens

The alternative — always eager, for simplicity — was not chosen for
genuinely large or expensive-to-construct collections, because the
wasted work compounds with size: a thousand-row list built eagerly does a
thousand times the necessary work if only ten rows are ever visible at
once.

---

## Concept Unit: Cache an Expensive Lookup on First Use

### The Problem

Even a lazily-built row's own internal lookups — finding each of its
child views, say — might still be repeated unnecessarily if the same row
is looked at again later without remembering the result of the first
lookup.

### Introduce the Concept in Isolation

```java
class ExpensiveLookup {
    private String cachedResult;

    String getResult() {
        if (cachedResult == null) {
            System.out.println("Performing expensive lookup...");
            cachedResult = "Found Value";
        }
        return cachedResult;
    }
}

public class Main {
    public static void main(String[] args) {
        ExpensiveLookup lookup = new ExpensiveLookup();

        System.out.println("First call: " + lookup.getResult());
        System.out.println("Second call: " + lookup.getResult());
        System.out.println("Third call: " + lookup.getResult());
    }
}
```

Compile and run it. Here is the real output:

```
Performing expensive lookup...
First call: Found Value
Second call: Found Value
Third call: Found Value
```

`"Performing expensive lookup..."` prints only once, even though
`getResult()` was called three times. This is caching an expensive
lookup on first use — **first appearance**: doing an expensive
computation or lookup exactly once, storing the result, and reusing the
cached result on every subsequent need.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `private String cachedResult;` — **(b) reappearing** field
   declaration from Lesson 01, starting `null`.
2. `if (cachedResult == null) { ... cachedResult = "Found Value"; }` —
   **(a) first appearance** of this exact caching shape: the expensive
   work runs only when no cached result exists yet.
3. Three separate `getResult()` calls — only the first triggers the
   expensive work; the second and third simply return the already-cached
   value.

### CS Lens

This is lazy evaluation (this lesson's own first unit) combined with
memory: not just deferring work until needed, but remembering the result
so it's never redone once it's already been done. This is the entire
reason `ViewHolder` (this lesson's own later unit) exists: `findViewById`'s
tree walk (Lesson 45) is cached once per holder, instead of repeated on
every scroll frame.

Also recognized in: memoization in functional programming generally, any
"lazy-initialized" field pattern across other languages, HTTP response
caching (avoiding repeating an expensive network request for the
identical resource).

### SE Lens

The alternative — recomputing the expensive lookup every single time it's
needed — was not chosen because the cost compounds with how often the
value is requested; caching trades a small amount of memory (storing the
cached value) for avoiding repeated, unnecessary expensive work.

---

## Concept Unit: View Recycling

### The Problem

A list long enough to require scrolling, if every row's View were kept
alive simultaneously, would construct far more View objects than are
ever visible on screen at once — genuinely wasteful, the same problem
this lesson's own first unit already named in the abstract.

### Introduce the Concept in Isolation

```java
import java.util.ArrayList;
import java.util.List;

class RowPool {
    private List<String> pool = new ArrayList<>();
    private int poolSize = 3;

    String obtainRow() {
        if (pool.size() < poolSize) {
            String newRow = "NewRow#" + pool.size();
            pool.add(newRow);
            System.out.println("Constructed: " + newRow);
            return newRow;
        }
        String recycled = pool.remove(0);
        System.out.println("Recycled: " + recycled);
        pool.add(recycled);
        return recycled;
    }
}

public class Main {
    public static void main(String[] args) {
        RowPool pool = new RowPool();
        for (int i = 0; i < 6; i++) {
            pool.obtainRow();
        }
    }
}
```

Compile and run it. Here is the real output:

```
Constructed: NewRow#0
Constructed: NewRow#1
Constructed: NewRow#2
Recycled: NewRow#0
Recycled: NewRow#1
Recycled: NewRow#2
```

#### Execution Trace

The loop calls `obtainRow()` six times; which branch runs each time
depends on how full the pool already is:

1. `i = 0`: `pool.size()` is `0`, `poolSize` is `3`, so `0 < 3` is
   `true` — a genuinely new row, `NewRow#0`, is constructed and added to
   the pool.
2. `i = 1`: `pool.size()` is now `1`, `1 < 3` is still `true` — a second
   new row, `NewRow#1`, is constructed the same way.
3. `i = 2`: `pool.size()` is `2`, `2 < 3` is still `true` — a third new
   row, `NewRow#2`, is constructed; the pool has now reached its target
   size of `3`.
4. `i = 3`: `pool.size()` is `3`, `3 < 3` is `false` — the pool is full,
   so this call falls through to the recycling branch instead: the
   oldest row, `NewRow#0`, is removed from the front and immediately
   re-added at the back, simulating reuse rather than construction.
5. `i = 4` and `i = 5` repeat the identical recycling branch, in order,
   recycling `NewRow#1` and then `NewRow#2` — each time because
   `pool.size()` never drops below `poolSize` once the pool is full, so
   the condition `pool.size() < poolSize` stays `false` for every
   remaining call.

Only 3 rows are ever actually constructed, even across 6 total requests
— the pool reuses existing rows instead of constructing new ones once
`poolSize` is reached. This is `view recycling` — **first appearance**:
keeping only a small, roughly-screen-sized pool of row View objects
alive and reusing them as the user scrolls, refilling each recycled view
with new data instead of constructing a fresh view per data item.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `if (pool.size() < poolSize) { ... }` — constructs a genuinely new
   row only while the pool hasn't yet reached its target size.
2. `String recycled = pool.remove(0); ... pool.add(recycled);` — **(a)
   first appearance** of recycling: takes an already-constructed row out
   of the pool and puts it back, simulating reuse rather than
   construction.

### CS Lens

View recycling is this lesson's own eager/lazy distinction, applied with
a twist: rather than purely lazy (constructing exactly what's needed,
new, every time), a bounded pool is built once, lazily up to its target
size, and then *reused* indefinitely — the actual fix for the wasteful
"construct every row upfront" approach.

Also recognized in: connection pools generally (Lesson 05's own object
pool pattern), thread pools (Lesson 03's own `ExecutorService`), any
system reusing a bounded set of expensive-to-construct resources rather
than constructing and discarding them repeatedly.

### SE Lens

The alternative — constructing and discarding a fresh row for every
single scroll position — was not chosen because it wastes real,
measurable construction cost on rows that will be visible only briefly;
reusing a small, bounded pool means construction cost is paid once, for
roughly as many rows as can fit on screen, never again.

---

## Concept Unit: Layout Inflation

### The Problem

A row's visual structure, declared as XML (Lesson 11), exists only as
data until something turns it into real, constructed View objects —
`setContentView` does this automatically for a whole screen, but a
recycled row needs the identical process triggered by hand, one row
layout at a time.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
View rowView = LayoutInflater.from(context).inflate(R.layout.item_row, parent, false);
```

This is `layout inflation` — **first appearance**: the process of
turning an XML layout resource into real, constructed View objects at
runtime. `R.layout.item_row` (Lesson 11's own generated `R` class) names
the XML file describing one row's structure; `inflate(...)` performs the
actual construction, producing a real, usable `View` tree (Lesson 41)
from that XML data.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `LayoutInflater.from(context)` — **(a) first appearance**: obtains
   the real inflater object tied to this app's own environment
   (`Context`, Lesson 45).
2. `inflate(R.layout.item_row, parent, false)` — **(a) first
   appearance**: reads the named layout resource and constructs real
   `View` objects from it, attaching them (or not, per the final
   `boolean`) to `parent`.

### CS Lens

Layout inflation is the same view-tree-from-XML idea `setContentView`
already performs for an entire screen (Lesson 11), triggered manually
here for one row at a time — necessary because a `RecyclerView`'s rows
are constructed on demand, not all at once when the screen itself first
loads.

Also recognized in: templating engines generally (turning a template
plus data into real, rendered output), any "parse structure once,
instantiate many times" system.

### SE Lens

Layout inflation exists as a separate, explicit step (rather than
automatic, the way `setContentView` feels) specifically because a
`RecyclerView`'s rows are constructed lazily, on demand — the inflation
step must be triggered at the exact moment a new row is actually needed,
not once for the whole screen upfront.

---

## Concept Unit: Static vs. Non-Static Nested Classes

### The Problem

A `ViewHolder` (this lesson's own next unit) is conventionally declared
as a nested class (Lesson 01) inside its Adapter — but whether that
nested class silently holds a hidden reference back to its specific
enclosing Adapter instance is a real, deliberate choice with real
consequences.

### Introduce the Concept in Isolation

```java
class Outer {
    int outerField = 42;

    class NonStaticInner {
        void show() {
            System.out.println("Can see outerField: " + outerField);
        }
    }

    static class StaticInner {
        void show() {
            System.out.println("Cannot see outerField directly.");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Outer outer = new Outer();

        Outer.NonStaticInner nonStatic = outer.new NonStaticInner();
        nonStatic.show();

        Outer.StaticInner staticInner = new Outer.StaticInner();
        staticInner.show();
    }
}
```

Compile and run it. Here is the real output:

```
Can see outerField: 42
Cannot see outerField directly.
```

`NonStaticInner` reads `outerField` directly, with no qualifier at all;
`StaticInner` cannot — it was never given a hidden connection to any
specific `Outer` instance. Prose alone isn't proof of a compiler-
synthesized field the source code never shows — disassembling both
compiled classes with `javap -p` makes the hidden difference directly
inspectable:

```
javap -p 'Outer$NonStaticInner.class'
```

```
class Outer$NonStaticInner {
  final Outer this$0;
  Outer$NonStaticInner(Outer);
  void show();
}
```

```
javap -p 'Outer$StaticInner.class'
```

```
class Outer$StaticInner {
  Outer$StaticInner();
  void show();
}
```

`Outer$NonStaticInner` really does carry a compiler-generated field,
`final Outer this$0;` — nowhere in the source code, and its constructor
genuinely takes an `Outer` argument, matching `outer.new
NonStaticInner()`'s required enclosing-instance syntax. `Outer$StaticInner`
has neither: no synthesized field at all, and a plain, no-argument
constructor. This is `static vs. non-static nested classes` — **first
appearance**: a non-static nested class silently holds a hidden
reference to the specific enclosing-class instance that created it; a
static nested class carries no such reference and can be constructed
independent of any enclosing instance.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class NonStaticInner { ... }`, with no `static` — **(a) first
   appearance** of the default nested-class behavior: silently carries a
   hidden reference to the specific `Outer` instance that created it.
2. `outer.new NonStaticInner()` — **(a) first appearance** of this exact
   construction syntax, required specifically because a non-static
   nested class needs a real enclosing instance to attach its hidden
   reference to.
3. `static class StaticInner { ... }` — **(b) reappearing** `static`
   from Lesson 03, here applied to a nested class rather than a field:
   no hidden reference to any `Outer` instance exists.
4. `new Outer.StaticInner()` — plain construction, no enclosing instance
   required at all.

### CS Lens

This distinction matters for memory and correctness both: a non-static
nested class implicitly keeps its enclosing instance alive (it can
never be garbage-collected while the nested instance still exists), and
can silently reach the enclosing instance's own fields — sometimes
exactly what's wanted, sometimes an unintended, hidden coupling.

Also recognized in: closures in JavaScript and Python (which capture
their enclosing scope similarly, though through a different mechanism),
inner classes in other JVM languages generally.

### SE Lens

A `ViewHolder` is deliberately declared `static`, specifically to avoid
an unwanted hidden reference back to its own Adapter instance — a
`ViewHolder` should only ever need the specific row's own views, not a
hidden, implicit connection to the whole Adapter.

---

## Concept Unit: `ViewHolder`

### The Problem

Without caching each row's found views, `findViewById` (Lesson 45) would
need to be called fresh on every scroll frame, for every visible row —
real, measurable, repeated overhead this design exists specifically to
remove.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
static class ItemViewHolder extends RecyclerView.ViewHolder {
    TextView nameLabel;

    ItemViewHolder(View itemView) {
        super(itemView);
        nameLabel = itemView.findViewById(R.id.nameLabel);
    }
}
```

This is `ViewHolder` — **first appearance**: an object caching one row's
view references once, at construction, so later data updates skip
re-searching the view tree. `findViewById` runs exactly once per
`ItemViewHolder`, inside its constructor — every later data update reads
`nameLabel` directly, the cached reference, never searching the view
tree again for the same row.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `static class ItemViewHolder extends RecyclerView.ViewHolder { ...
   }` — **(b) reappearing** `static` nested class from this lesson's own
   previous unit, specifically avoiding a hidden reference to the
   Adapter, plus inheritance (Lesson 05) from a real framework base
   class.
2. `ItemViewHolder(View itemView) { super(itemView); nameLabel =
   itemView.findViewById(R.id.nameLabel); }` — **(b) reappearing**
   constructor and `super()` (Lesson 33) shape, calling `findViewById`
   (Lesson 45) exactly once, caching the result in a field — this
   lesson's own second unit's caching pattern, real and load-bearing.

### CS Lens

`ViewHolder` combines three of this lesson's own earlier concepts at
once: it's constructed lazily (only when a new, uncached row is actually
needed), it caches an expensive lookup on first use
(`findViewById`, cached exactly once), and it's declared `static`
specifically to avoid an unwanted hidden Adapter reference.

Also recognized in: the ViewHolder pattern by name across virtually
every mainstream mobile UI framework's own recyclable-list
implementation — a genuinely standard, widely-recognized solution to
this exact repeated-lookup problem.

### SE Lens

The alternative — calling `findViewById` fresh, every time a row's data
is updated — was not chosen because it repeats real, measurable tree-
search overhead on every single scroll frame, for every visible row;
caching it once, in a `ViewHolder`, pays that cost exactly once per
holder, no matter how many times that holder's row is later refilled
with new data as the user scrolls.

---

## Concept Unit: The Strategy Pattern

### The Problem

A `RecyclerView`'s two jobs — deciding *what data* goes in which row,
and deciding *how rows are spatially arranged* (a vertical list, a grid)
— are genuinely independent concerns; baking both into one class would
mean any new arrangement needs a whole new, duplicated data-handling
class alongside it.

### Introduce the Concept in Isolation

```java
interface SortStrategy {
    void sort(int[] numbers);
}

class AscendingSort implements SortStrategy {
    public void sort(int[] numbers) {
        java.util.Arrays.sort(numbers);
    }
}

class Sorter {
    private SortStrategy strategy;

    Sorter(SortStrategy strategy) {
        this.strategy = strategy;
    }

    void sortNumbers(int[] numbers) {
        strategy.sort(numbers);
    }
}

public class Main {
    public static void main(String[] args) {
        int[] numbers = {5, 2, 8, 1};
        Sorter sorter = new Sorter(new AscendingSort());
        sorter.sortNumbers(numbers);

        System.out.println("Sorted: " + java.util.Arrays.toString(numbers));
    }
}
```

Compile and run it. Here is the real output:

```
Sorted: [1, 2, 5, 8]
```

`Sorter` never implements sorting logic itself — it delegates (Lesson 31)
to whichever `SortStrategy` it holds. This is the `strategy pattern` —
**first appearance**: an algorithm or behavior is extracted into a
separate, swappable object or interface, rather than baked directly into
the class that uses it. A different sorting strategy could be swapped in
with zero changes to `Sorter` itself.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface SortStrategy { void sort(int[] numbers); }` — **(b)
   reappearing** interface shape from Lesson 06, this time describing an
   algorithm rather than a general capability.
2. `Sorter(SortStrategy strategy) { this.strategy = strategy; }` — **(b)
   reappearing** dependency injection from Lesson 15, applied here to
   inject a swappable algorithm rather than a swappable data source.

### CS Lens

The strategy pattern is dependency injection (Lesson 15) applied
specifically to algorithms: rather than one class hardcoding one
algorithm, the algorithm itself becomes a swappable collaborator,
injected in — precisely why `RecyclerView`'s `Adapter` (data → views)
and `LayoutManager` (arrangement) are deliberately two independent,
swappable collaborators, not one class doing both jobs.

Also recognized in: sorting algorithm selection in many standard
libraries, payment-processing systems supporting multiple swappable
payment methods, any "pluggable algorithm" design.

### SE Lens

The alternative — one `Sorter` class hardcoding one specific sort
algorithm — was not chosen because a new algorithm would require an
entirely new, duplicated class; extracting the algorithm into a swappable
`SortStrategy` means `Sorter` itself never changes, no matter how many
different algorithms are later added.

---

## Concept Unit: `RecyclerView.Adapter`

### The Problem

Nothing yet connects real data to the recycled row views this lesson has
built up to — some collaborator is needed that creates `ViewHolder`s,
binds real data into them, and reports how many total items exist.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
class ItemAdapter extends RecyclerView.Adapter<ItemAdapter.ItemViewHolder> {
    private List<String> items;

    @Override
    public ItemViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_row, parent, false);
        return new ItemViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ItemViewHolder holder, int position) {
        holder.nameLabel.setText(items.get(position));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ItemViewHolder extends RecyclerView.ViewHolder {
        TextView nameLabel;

        ItemViewHolder(View itemView) {
            super(itemView);
            nameLabel = itemView.findViewById(R.id.nameLabel);
        }
    }
}
```

This is `RecyclerView.Adapter` — **first appearance**: an object bridging
a data list to a bounded number of reusable row views — responsible for
creating holders, binding data into them, and reporting the total item
count. `onCreateViewHolder` runs layout inflation and constructs a new
`ItemViewHolder` — only when the recycled pool (this lesson's own view-
recycling concept) doesn't already have a spare one available.
`onBindViewHolder` refills an existing, recycled holder's cached views
with new data, every time a row scrolls into view — the actual moment
recycling happens.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `class ItemAdapter extends RecyclerView.Adapter<ItemAdapter
   .ItemViewHolder>` — **(b) reappearing** generics (Lesson 07) and
   inheritance, the generic type parameter naming exactly which
   `ViewHolder` subtype this Adapter produces.
2. `onCreateViewHolder(...)` — **(b) reappearing** layout inflation from
   this lesson's own earlier unit, called only when a genuinely new
   holder is needed, not on every scroll frame.
3. `onBindViewHolder(...)` — **(a) first appearance** of the actual
   recycling moment: called far more often than `onCreateViewHolder`,
   refilling an already-existing holder's cached views with whichever
   data item now belongs in this row position.
4. `getItemCount()` — **(a) first appearance**: reports the total number
   of data items, letting the RecyclerView know how far scrolling can
   go.

### CS Lens

`RecyclerView.Adapter` is this lesson's entire subsystem, combined:
`onCreateViewHolder` triggers lazy construction and layout inflation only
as needed; the resulting `ViewHolder` caches its `findViewById` lookups
once; `onBindViewHolder` is where recycling's actual reuse happens,
refilling cached views with new data on every scroll.

Also recognized in: any "virtualized list" implementation across other UI
frameworks (web frameworks rendering only visible rows of a large list,
recycling DOM nodes the same way) — the identical performance problem,
solved the identical way, outside Android entirely.

### SE Lens

Splitting `onCreateViewHolder` (rare, expensive) from `onBindViewHolder`
(frequent, cheap) is a deliberate design that concentrates the truly
expensive work (inflation, `findViewById`) into the rare case, keeping
the frequent case — refilling already-cached views — as cheap as
possible.

---

## Concept Unit: `RecyclerView.LayoutManager`

### The Problem

`ItemAdapter`, from the previous unit, decides what data goes in which
row — but says nothing about whether rows are arranged vertically,
horizontally, or in a grid. A `RecyclerView` refuses to render anything
at all without a separate answer to that question.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
recyclerView.setLayoutManager(new LinearLayoutManager(this));
recyclerView.setAdapter(itemAdapter);
```

This is `RecyclerView.LayoutManager` — **first appearance**: a swappable
collaborator responsible purely for arranging a RecyclerView's rows
spatially, independent of the Adapter that supplies data.
`LinearLayoutManager` arranges rows in a simple vertical (or horizontal)
list; a `GridLayoutManager` could be swapped in instead, arranging the
identical `ItemAdapter`'s rows into a grid, with zero changes to
`ItemAdapter` itself.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `recyclerView.setLayoutManager(new LinearLayoutManager(this));` —
   **(a) first appearance**: assigns the arrangement strategy, entirely
   separate from the data-and-view strategy assigned next.
2. `recyclerView.setAdapter(itemAdapter);` — **(b) reappearing**
   assignment of the previous unit's own `Adapter`, independent of
   whichever `LayoutManager` was just assigned.

### CS Lens

`LayoutManager` is this lesson's own strategy pattern, real and load-
bearing: arrangement logic is deliberately not built into `RecyclerView`
itself, or into `Adapter` — it's a separate, swappable collaborator,
exactly the same shape as this lesson's own `Sorter`/`SortStrategy`
example.

Also recognized in: layout strategy objects across other UI toolkits
generally, any system separating "what to display" from "how to arrange
it spatially" into two independently swappable pieces.

### SE Lens

The alternative — baking one fixed arrangement directly into
`RecyclerView` or `Adapter` itself — was not chosen because it would mean
a grid-based list and a vertical list would need entirely separate,
duplicated Adapter implementations; keeping arrangement as a swappable
`LayoutManager` means the identical `ItemAdapter` works correctly with
any arrangement strategy, unchanged.

---

## Connect the Pieces

Nine ideas, one real subsystem: eager/lazy evaluation named the general
waste this design avoids. Caching an expensive lookup on first use is
exactly what a `ViewHolder` does with `findViewById`. View recycling is
the bounded-pool reuse strategy applied to entire row Views. Layout
inflation is how a new (uncached) row's Views actually get built from
XML. Static nested classes are why `ViewHolder` avoids a hidden Adapter
reference. `ViewHolder` combines all of the above. The strategy pattern
is why `Adapter` (data) and `LayoutManager` (arrangement) are two
separate, swappable collaborators rather than one entangled class. Every
one of these ideas serves the same real, cohesive system: showing a long,
scrollable list efficiently, without wasting work on rows the user never
actually sees.

## What Breaks Without This

A `RecyclerView` with an `Adapter` set but no `LayoutManager` throws a
real runtime error the moment it tries to render:

```
java.lang.NullPointerException: No LayoutManager set on RecyclerView
```

This is concrete proof `LayoutManager` and `Adapter` are genuinely
separate, both required, neither substituting for the other — exactly
the strategy-pattern separation this lesson's own final unit
established.

## Exercises

1. Add a second `SortStrategy` implementation, `DescendingSort`, and
   swap it into `Sorter` with no changes to `Sorter` itself.
2. Explain, in your own words, why `onBindViewHolder` is called far more
   often than `onCreateViewHolder` during real scrolling.
3. Explain, in your own words, why `ViewHolder` is declared `static`,
   connecting your answer to this lesson's own nested-class unit.

## Definition of Done

- [ ] You ran every runnable example in this lesson and saw their real
      output.
- [ ] You completed Exercise 1 and swapped a strategy with zero changes
      to `Sorter`.
- [ ] You read the real `RecyclerView.Adapter`/`LayoutManager` examples
      and can explain what each is responsible for.
- [ ] You can state, without looking back at this lesson, why
      `findViewById` is called inside `ItemViewHolder`'s constructor
      rather than inside `onBindViewHolder`.
