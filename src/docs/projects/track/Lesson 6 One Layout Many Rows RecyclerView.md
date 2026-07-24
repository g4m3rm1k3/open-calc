# Lesson 6: One Layout, Many Rows — RecyclerView and the Adapter Pattern

**What you will build:** `InventoryActivity` finally shows something —
a scrolling list of inventory item names, hardcoded for now, rendered
through `RecyclerView`. The transferable problem: Android does let you
add views to a screen in a loop, and it will even work for a handful of
items — but it does not scale, and understanding *why* it doesn't is
what motivates the entire Adapter/ViewHolder design most Android UI
work is built on. This lesson is about learning to distrust "it works"
as the only bar for correct, and asking "what happens at 500 items?"
instead.

**What you need to know first:** Lesson 3 (XML layouts, `ConstraintLayout`),
Lesson 4 (`InventoryActivity` exists, currently near-empty), Lesson 5
(instance fields, lifecycle — not directly used here but assumed
solid).

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
again — `RecyclerView`, built next, is the real answer.

### CS Lens

This is the general problem of **eager evaluation versus lazy/on-demand
evaluation** — doing all the work upfront regardless of whether it's
needed, versus doing only the work a specific moment actually requires.
Also recognized in: a database returning every row of a table into
memory versus a paginated cursor, an eagerly-loaded ORM relationship
versus lazy-loading, and infinite/lazy sequences in functional
languages that only compute the next element when asked.

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
two files named `build.gradle`; the project-level one and the
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

Create `app/src/main/res/layout/list_item_inventory.xml`:

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
- (Lesson 3) — this instantiates the real `RecyclerView` class from the
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
definitions themselves (one `class`, many instances).

---

## Concept Unit: Nested Classes, and What `static` Actually Changes

### The Problem

The `ViewHolder` you're about to build lives *inside* `InventoryAdapter`
— a class defined inside another class. Java allows this, but a nested
class can be written two different ways with a real behavioral
difference between them, and the keyword that decides which one you get
is the same `static` keyword you'll also see used to mean something
else entirely on plain fields and methods elsewhere in this project.
Both uses are worth seeing together, once, rather than guessing at
`static`'s meaning fresh each time it reappears.

### Introduce the Concept in Isolation

First, nested classes — a regular one, and a `static` one, side by
side:

```java
class Outer {
    private int secret = 42;

    class Inner {
        void reveal() {
            System.out.println("Inner can see Outer's secret: " + secret);
        }
    }

    static class StaticNested {
        void reveal() {
            System.out.println("StaticNested has no access to any Outer instance's fields");
        }
    }
}

public class NestedDemo {
    public static void main(String[] args) {
        Outer outer = new Outer();

        Outer.Inner inner = outer.new Inner();
        inner.reveal();

        Outer.StaticNested nested = new Outer.StaticNested();
        nested.reveal();
    }
}
```

Compile and run this yourself:

```
javac NestedDemo.java
java NestedDemo
```

Real output — verified this session:

```text
Inner can see Outer's secret: 42
StaticNested has no access to any Outer instance's fields
```

Notice `outer.new Inner()` — genuinely unusual-looking syntax, and
worth seeing why it's required. Try creating an `Inner` the way you'd
expect, with no `Outer` instance involved:

```java
Outer.Inner inner = new Outer.Inner();
```

Real output — this fails to *compile*:

```text
error: an enclosing instance that contains Outer.Inner is required
        Outer.Inner inner = new Outer.Inner();
                            ^
```

What this proves: a non-static (`Inner`) nested class silently carries
a hidden reference to *the specific `Outer` instance that created it* —
that's how `reveal()` reaches `secret` with no parameter passed at all
— and the compiler refuses to create one without that instance existing
first. `StaticNested`, by contrast, carries no such hidden reference:
it can be created with a plain `new`, and it has no way to reach any
particular `Outer`'s fields at all, even if it wanted to.

Now the *other* meaning of `static` — on an ordinary field, not a nested
class:

```java
class Counter {
    static int totalCreated = 0;
    int id;

    Counter() {
        totalCreated++;
        id = totalCreated;
    }
}

public class StaticDemo {
    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = new Counter();
        Counter c = new Counter();

        System.out.println("a.id=" + a.id + ", b.id=" + b.id + ", c.id=" + c.id);
        System.out.println("Counter.totalCreated=" + Counter.totalCreated);
    }
}
```

Real output — verified this session:

```text
a.id=1, b.id=2, c.id=3
Counter.totalCreated=3
```

What this proves: `id` (no `static`) gets its own separate copy per
`Counter` instance — `1`, `2`, `3`, one each. `totalCreated` (`static`)
has exactly **one** copy, shared by every `Counter` that has ever been
created, which is why it correctly reads `3` after three constructions,
addressable through the class name (`Counter.totalCreated`) rather than
through any particular instance.

### Discard the Throwaway Example

Delete `Outer`, `Inner`, `StaticNested`, `NestedDemo`, `Counter`, and
`StaticDemo` — the real project's own static nested class,
`InventoryViewHolder`, is built next.

### CS Lens

Both uses of `static` are really the same underlying idea, applied in
two different positions: **"belongs to the type itself, not to any one
instance of it."** A `static` field is shared, one copy, across every
instance — not "this object's own copy" like `id` is. A `static` nested
class is not tied to any one *enclosing* instance — it doesn't get the
hidden reference a non-static nested class does. Neither reads or
depends on "which particular object are we inside of right now"; that's
the one idea underneath both.

### SE Lens

**Why would `InventoryViewHolder` want to give up the hidden reference
to its enclosing `Adapter` — isn't more access generally more useful?**
Not here: a `ViewHolder` only ever needs to know about the one row's
own views (cached in Lesson 5's field pattern), never about the
`Adapter` that built it. A non-static inner class would still compile
and work, but it would silently hold onto a reference to its specific
`Adapter` instance for the `ViewHolder`'s entire lifetime, for no actual
benefit — an unnecessary coupling, and, at real scale, an unnecessary
memory cost (as long as any single `ViewHolder` is kept alive, its
hidden enclosing reference keeps the whole `Adapter` alive too). `static`
here is a deliberate "this class genuinely doesn't need that," stated
directly rather than left as an accident of which syntax happened to be
used.

### Connection

`InventoryViewHolder`, next, is a `static` nested class for exactly this
reason — and later in this project, `static` reappears once more on a
field (`AppDatabase`'s single shared instance, Lesson 13) — the same
"shared, not per-instance" idea from `Counter.totalCreated` here, applied
to a real, larger design.

---

## Concept Unit: `ViewHolder` — One Object Per Visible Row, Not Per Data Item

### The Problem

`RecyclerView` will, at runtime, need to reach into a given row's views
(right now, just its one `TextView`) and set their content. The naive
approach would be calling `findViewById` fresh, every single time a row
needs to be updated — which happens continuously as the user scrolls.
`findViewById` walks the view tree to find a match; doing that
repeatedly for every scroll frame is wasted, repeated work — the same
"work you don't need to redo" theme as the first Concept Unit, just at
a smaller scale.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** None yet. This fragment is a preview to type and
  understand in isolation — **do not create `InventoryAdapter.java`
  yet.** A bare `static class` cannot legally be the only thing in a
  `.java` file: `static` on a class only means something for a class
  nested *inside* another one — this lesson's own Nested Classes unit,
  above — and there's no outer class here yet for it to nest inside.
  Saving this fragment alone would fail to compile. The next Concept
  Unit wraps it inside `InventoryAdapter` and gives you the complete,
  real, compilable file to actually create.
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
compilable file, in the next Concept Unit. Hold onto it; don't type it
into a new file by itself.

### Mechanical Walkthrough
- `static class InventoryViewHolder extends RecyclerView.ViewHolder` —
  the `static class` part is **reappearing**, from this lesson's own
- Nested Classes unit above — `InventoryViewHolder` gives up the hidden
  reference to its enclosing `Adapter` for exactly the reason that unit
  named: it only ever needs its own row's views, never the `Adapter`
  itself. `extends RecyclerView.ViewHolder` is the required base
  class — the library's own contract for what counts as a "holder of a
  row's views."
- `TextView itemNameText;` — **reappearing** (field declaration, from
  Lesson 5), new detail: package-private (no modifier) rather than
  `private`, a deliberate choice so the enclosing `Adapter` class (next
  unit) can read this field directly without a getter — reasonable for
  a small, tightly-coupled helper class like this one.
- `InventoryViewHolder(View itemView)` — **first appearance of a
  constructor** in this curriculum. A constructor is a special method,
  same name as the class, no return type, that runs exactly once when
  `new InventoryViewHolder(...)` is called, responsible for setting up
  the object before anyone else can use it.
- `super(itemView)` — **reappearing concept** (Lesson 2's parent-call
  pattern), now on a constructor instead of `onCreate`: `RecyclerView.ViewHolder`'s
  own constructor requires the row's root `View` and stores it
  internally (accessible later as `.itemView`).
- `itemView.findViewById(R.id.itemNameText)` — **reappearing**
  (`findViewById`, Lesson 4), new detail: called on `itemView` (the
- inflated `list_item_inventory.xml` root) rather than on an Activity —
  `findViewById` works the same way on any View, searching its own
  subtree, which here is a single `TextView`, not a whole screen.

### CS Lens

This is the **Flyweight-adjacent idea of caching expensive lookups on
first use** — do the costly work (finding child views) exactly once,
when a holder object is first constructed, then reuse the cached
reference every time that holder is recycled for new data. Also
recognized in: memoization of a pure function's result, compiled regex
objects cached instead of recompiled per match, and prepared SQL
statements reused across multiple queries instead of re-parsed each
time.

### SE Lens

**Why a whole extra class instead of just calling `findViewById` inside
whatever method updates a row?** The alternative is exactly what early
Android list code did (a pattern called `getView()` without ViewHolder,
common enough to have its own name in older tutorials), and it was a
well-documented performance problem: `findViewById` uses a tree walk,
and doing it on every scroll frame for every visible row created
measurable, visible jank on the phones of that era. The `ViewHolder`
class costs you one extra type to define and reason about, in exchange
for making "look up my views" a one-time cost per holder object rather
than a per-scroll-frame cost.

---

## Concept Unit: Generics — One Class, Many Types, Checked at Compile Time

### The Problem

The `Adapter` you're about to build needs to store a list of data (for
now, item names) and hand that same list to `RecyclerView`. A `List`
that could hold *anything* — any type, mixed together — sounds
flexible, but it pushes a real problem to the moment you actually read
an item back out: you'd have to guess, and cast, and hope you guessed
right.

### Introduce the Concept in Isolation

See the actual failure first, with a deliberately "flexible" box that
holds anything at all:

```java
class ObjectBox {
    private Object value;

    void set(Object value) {
        this.value = value;
    }

    Object get() {
        return value;
    }
}

public class GenericsDemoBad {
    public static void main(String[] args) {
        ObjectBox box = new ObjectBox();
        box.set("hello");

        Integer number = (Integer) box.get();
        System.out.println(number);
    }
}
```

Compile and run this yourself:

```
javac GenericsDemoBad.java
java GenericsDemoBad
```

Real output — this compiles fine, then crashes:

```text
Exception in thread "main" java.lang.ClassCastException: class java.lang.String cannot be cast to class java.lang.Integer (java.lang.String and java.lang.Integer are in module java.base of loader 'bootstrap')
	at GenericsDemoBad.main(GenericsDemoBad.java:18)
```

What this proves: `ObjectBox` compiled without complaint even though
`box` was set to a `String` and read back as an `Integer` — `Object`
can hold anything, so the compiler has no way to catch the mismatch.
The bug only surfaces at runtime, as a crash, and only because this
particular test happened to exercise the wrong combination.

Now the fix — the same class, made **generic**:

```java
class Box<T> {
    private T value;

    void set(T value) {
        this.value = value;
    }

    T get() {
        return value;
    }
}

public class GenericsDemoGood {
    public static void main(String[] args) {
        Box<String> box = new Box<>();
        box.set("hello");

        String value = box.get();
        System.out.println(value);
    }
}
```

Real output — verified this session:

```text
hello
```

Now prove the compiler actually catches the mismatch this time, rather
than crashing later:

```java
Box<String> box = new Box<>();
box.set(42);
```

Real output — this genuinely fails to *compile*:

```text
GenericsDemoReject.java:16: error: incompatible types: int cannot be converted to String
        box.set(42);
                ^
```

What this proves: `Box<T>` is one class definition that works
correctly for `Box<String>`, `Box<Integer>`, or any other type — `T` is
a placeholder, filled in with a real type wherever `Box` is actually
used — and the compiler enforces, for each specific instance, that only
the matching type ever goes in or comes out. The exact same class of
mistake `ObjectBox` let through silently, `Box<T>` rejects immediately,
at compile time, with a clear error pointing at the exact line.

### Discard the Throwaway Example

Delete `ObjectBox`, `Box`, and both demo classes — the real project
uses `List<String>`, part of the standard library, built on this exact
same mechanism.

### Mechanical Walkthrough
- `class Box<T>` — the `<T>` after the class name declares a **type
  parameter**: `T` is a stand-in name (by convention a single capital
- letter), filled in with a real, concrete type — `String`, `Integer`, anything — at the point `Box` is actually used.

- `Box<String> box = new Box<>();` — `<String>` on the left fills in
  what `T` means for *this specific* `box` variable; `<>` on the right
  (the **diamond operator**) means "infer the type from the left-hand
  side" rather than repeating `<String>` twice.
- `private T value;` / `void set(T value)` / `T get()` — every place
  `Box` mentions "the type it holds," it uses `T` instead of a fixed
  type — the compiler substitutes the real type in for every specific
  instance.

### CS Lens

This is **generic programming** — writing one class or method that
works correctly across many types, with the compiler checking each
specific use for you, rather than either duplicating the class per
type (`StringBox`, `IntegerBox`, ...) or using a common supertype like
`Object` and losing all compile-time checking. `List<String>` — which
the real `Adapter`, next, is built around — is the standard library's
own `Box`-like generic class, already written for you.

### Connection

`List<String>` in the `Adapter` you're about to build is exactly this
mechanism, already provided by the standard library — a real `List`
holding real `String`s, with the compiler rejecting any attempt to
insert or retrieve the wrong type, the same guarantee `Box<T>` just
demonstrated.

---

## Concept Unit: `Adapter` — Bridging a List of Data to a Finite Number of Rows

### The Problem

You now have a row layout and a way to cache a row's view references.
Nothing yet connects your actual data (a list of item names) to those
rows, and nothing tells `RecyclerView` how many rows exist or how to
arrange them (vertically, horizontally, in a grid). Two separate jobs,
handled by two separate collaborators: the `Adapter` (data → views) and
the `LayoutManager` (arrangement).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryAdapter.java` (complete the class
  around the `ViewHolder` from the previous unit); `InventoryActivity.java`
  (wire it up).
- **Change type:** Create, then add.
- **Dependencies:** the `ViewHolder` from the previous unit.

### The New Code

```java
package com.yourname.pocketinventory;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {
    private final List<String> itemNames;

    InventoryAdapter(List<String> itemNames) {
        this.itemNames = itemNames;
    }

    @NonNull
    @Override
    public InventoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_inventory, parent, false);
        return new InventoryViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        String name = itemNames.get(position);
        holder.itemNameText.setText(name);
    }

    @Override
    public int getItemCount() {
        return itemNames.size();
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        TextView itemNameText;

        InventoryViewHolder(View itemView) {
            super(itemView);
            itemNameText = itemView.findViewById(R.id.itemNameText);
        }
    }
}
```

### The Updated Project

This is the whole new file — the `InventoryViewHolder` from the
previous unit now sits inside it as a nested class, exactly as
promised, and the outer `InventoryAdapter` class supplies the three
methods `RecyclerView.Adapter` requires plus a constructor and the data
it wraps.

### Mechanical Walkthrough
- `class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`
- — split into two ideas: extending `RecyclerView.Adapter` is the
  required base class contract (same "must extend the framework's
  class" idea as `AppCompatActivity` in Lesson 2, different base
  class); the `<...>` part is **reappearing**, from this lesson's own
- Generics unit above — `RecyclerView.Adapter<VH>` is a generic class
  much like `Box<T>` was, and this line fills in its type parameter
  with `InventoryViewHolder`, telling the compiler *which* ViewHolder
  subtype this specific adapter works with, so that methods like
  `onCreateViewHolder` below can be declared to return
  `InventoryViewHolder` specifically rather than a plain
  `RecyclerView.ViewHolder` the caller would have to cast.
- `private final List<String> itemNames;` — **first appearance of
  `final` on a field.** `final` means this field's reference can be
  assigned exactly once (in the constructor) and never reassigned
  afterward — appropriate here because the Adapter is handed one list
  object to display and isn't meant to swap it out for a different list
  later. `List<String>` is **reappearing** (the Generics unit above),
  applied to the standard library's `List` interface: this specific
  list is locked to holding `String`s only, compiler-enforced.
- `InventoryAdapter(List<String> itemNames) { this.itemNames = itemNames; }`
  — **reappearing** (constructor, from the ViewHolder unit), new detail
  worth a clause: `this.itemNames` disambiguates the field from the
- parameter of the same name — `this.` explicitly means "the field on
  this object," not the parameter that's shadowing it.
- `@NonNull` — **first appearance.** An annotation (same category as
  `@Override` from Lesson 2, different purpose): a documentation-and-
  tooling hint that this parameter or return value must never be
  `null`, checked by Android Studio's static analysis, not by the
  compiler itself.
- `onCreateViewHolder(@NonNull ViewGroup parent, int viewType)` —
  **first appearance.** Called by `RecyclerView` only when it actually
  needs a *new* holder object — not once per data item, but only enough
  times to fill the screen plus a small buffer, which is the literal
  mechanism behind the "reuse, don't rebuild" promise from the first
  Concept Unit. `viewType` isn't used yet (relevant when a list has
  multiple different row layouts — not this project, yet).
- `LayoutInflater.from(parent.getContext())` — **first appearance.**
  `LayoutInflater` is the class responsible for turning an XML layout
- resource into real View objects — the same process `setContentView`
  triggers for you automatically for a whole screen; here you're
  calling it yourself for a single row layout instead.
- `.inflate(R.layout.list_item_inventory, parent, false)` — **first
  appearance.** Three arguments: which layout resource to inflate, the
  `parent` ViewGroup it will eventually live inside (needed so the
  inflated view gets correctly-typed layout parameters), and `false`
- meaning "don't attach it to `parent` yet" — `RecyclerView` itself
  handles attaching the returned view at the right time; passing `true`
  here is a common real bug that duplicates the view in the tree.
- `return new InventoryViewHolder(itemView);` — reappearing
  (constructor call, `new`, already basic since Lesson 4's `new Intent(...)`).
- `onBindViewHolder(@NonNull InventoryViewHolder holder, int position)`
- — **first appearance.** Called far more often than `onCreateViewHolder`
  — every time a holder (new *or* recycled) needs to display a
  *different* data item, including every time a recycled row scrolls
  back into view with new content. `position` is the index into your
  data list this call is responsible for.
- `itemNames.get(position)` — **first appearance of `List.get`** —
  standard-library method, index-based lookup, conceptually the same as
  array indexing.
- `holder.itemNameText.setText(name)` — reappearing (`setText`, Lesson 5),
  reading the cached field directly (package-private access, explained
- in the ViewHolder unit) instead of calling `findViewById` again — this
  line is the actual payoff of the whole ViewHolder unit.
- `getItemCount()` — **first appearance.** `RecyclerView` calls this to
  know how many total rows exist — it has no other way to know your
  data's size.
- `itemNames.size()` — reappearing pattern (already-basic method call),
  `List.size()`.

### Project Change — Wiring It to the Screen

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Add.
- **Location:** Inside `onCreate`, after `setContentView`.

### The New Code

```java
List<String> itemNames = new ArrayList<>();
itemNames.add("Hex Bolts, M6");
itemNames.add("Shop Rags");
itemNames.add("Cutting Oil");
itemNames.add("Digital Calipers");
itemNames.add("Safety Glasses");

RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
recyclerView.setLayoutManager(new LinearLayoutManager(this));
recyclerView.setAdapter(new InventoryAdapter(itemNames));
```

(Add the matching imports: `java.util.ArrayList`, `java.util.List`,
`androidx.recyclerview.widget.RecyclerView`,
`androidx.recyclerview.widget.LinearLayoutManager` — Alt+Enter on each
red underline, as in Lesson 4.)

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<String> itemNames = new ArrayList<>();               // ← new
        itemNames.add("Hex Bolts, M6");                            // ← new
        itemNames.add("Shop Rags");                                // ← new
        itemNames.add("Cutting Oil");                               // ← new
        itemNames.add("Digital Calipers");                          // ← new
        itemNames.add("Safety Glasses");                            // ← new

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView); // ← new
        recyclerView.setLayoutManager(new LinearLayoutManager(this));         // ← new
        recyclerView.setAdapter(new InventoryAdapter(itemNames));             // ← new
    }
}
```

`onCreate` now builds a small in-memory data set, then hands the
`RecyclerView` two collaborators it requires before it will render
anything: a `LayoutManager` (arrangement logic) and an `Adapter` (data-
to-view binding logic, built in this lesson).

### Mechanical Walkthrough
- `new ArrayList<>()` — **first appearance.** A concrete, resizable
- `List` implementation — the `<>` (diamond operator) means "infer the
  type parameter from the left-hand side" (`List<String>`), so you
  don't have to repeat `<String>` on both sides.
- `.add(...)` — reappearing pattern (already-basic method call).
- `new LinearLayoutManager(this)` — **first appearance.** The
  arrangement collaborator: specifically, "lay rows out in a single
- vertical (by default) scrolling list" — a `RecyclerView` refuses to
  display anything at all without one, since arrangement logic isn't
  built into `RecyclerView` itself, deliberately (grids, horizontal
  lists, and staggered lists are other `LayoutManager` implementations
  you could swap in later without touching the Adapter).
- `recyclerView.setAdapter(new InventoryAdapter(itemNames))` —
  reappearing pattern (constructor call) supplying this lesson's new
  class.

### Run It

Run the app, tap "Open Inventory." You should see five scrollable rows
with the item names, each rendered through `list_item_inventory.xml`,
each one's text set by `onBindViewHolder`, not hardcoded per row.

### CS Lens

`Adapter` + `LayoutManager` splitting "what data goes where" from "how
things are arranged spatially" is the **Strategy pattern** — the
arrangement algorithm is a swappable, independent object rather than
logic baked into `RecyclerView` itself. Also recognized in: a sorting
function accepting a comparator strategy, dependency-injected payment
processors behind one interface, and pluggable rendering backends in
graphics libraries.

### SE Lens

**Why does the framework demand three separate override methods
(`onCreateViewHolder`, `onBindViewHolder`, `getItemCount`) instead of
one method that just returns "the view for row N"?** The alternative —
one combined method — is closer to what the wasteful loop at the start
of this lesson did: construct-and-populate together, every time. Splitting
"construct a holder" from "populate a holder with data" is what makes
recycling possible at all: `RecyclerView` can call `onCreateViewHolder`
rarely (only enough for the visible window) and `onBindViewHolder`
constantly (cheap: just setting text on already-built views), instead
of paying full construction cost on every single row update. The cost
of this design is exactly what you just wrote: three methods and a
separate `ViewHolder` class instead of one — more ceremony for a small
list, real savings at scale, which is the entire justification the
first Concept Unit set up.

---

## Connect the Pieces

Full trace: `InventoryActivity.onCreate` builds a `List<String>` of
five names → hands it to a new `InventoryAdapter` → assigns a
`LinearLayoutManager` and that Adapter to the `RecyclerView` from
`activity_inventory.xml` → `RecyclerView` calls `getItemCount()`, gets
`5`, and calls `onCreateViewHolder` just enough times to fill the
screen (inflating `list_item_inventory.xml` each time, wrapping the
result in an `InventoryViewHolder` that caches its `TextView`) → for
each visible position, `onBindViewHolder` reads `itemNames.get(position)`
and writes it into the *already-found* `itemNameText` field — the
exact `findViewById`-per-scroll-frame cost the ViewHolder unit avoided.

## What Breaks Without This

In `InventoryAdapter`, temporarily make `getItemCount()` return `0`
instead of `itemNames.size()`. Run the app: the screen is blank, no
crash, no error — `RecyclerView` faithfully asked "how many rows?",
got `0`, and drew nothing, which is exactly why trusting `getItemCount()`
to be correct matters. Restore it afterward.

## Exercises

1. Change `list_item_inventory.xml`'s `TextView` to also show the
   row's numeric position (e.g. `"1. Hex Bolts, M6"`), using `position`
   inside `onBindViewHolder` — you'll need to build the string with
   `(position + 1) + ". " + name`.
2. Add a sixth item to the `itemNames` list in `InventoryActivity` and
   confirm it appears without touching `InventoryAdapter` at all —
   convince yourself the Adapter genuinely doesn't know or care how
   many items exist ahead of time, only what `getItemCount()` reports
   right now.

## Definition of Done

- [ ] You ran the wasteful `addView()` loop yourself, saw it work, and
      can explain in your own words why it doesn't scale.
- [ ] You ran the `Outer`/`Inner`/`StaticNested` and `Counter` labs and
      can explain, concretely, both what `static` changes on a nested
      class and what it changes on a field.
- [ ] The inventory screen shows a real scrolling list of five items
      through `RecyclerView`, not hardcoded views.
- [ ] You can name what `onCreateViewHolder` and `onBindViewHolder` are
      each individually responsible for, and why splitting them enables
      recycling.
- [ ] You broke `getItemCount()` on purpose, saw the blank result, and
      restored it.
- [ ] You ran the `ObjectBox`/`Box<T>` generics lab yourself — saw the
      `Object` version crash at runtime, then saw the generic version
      catch the exact same mistake at compile time instead.
- [ ] Commit: message explaining why (e.g. "Replace placeholder
      InventoryActivity with a real RecyclerView-backed item list,
      since a manual addView loop doesn't scale past a handful of
      items").

Lesson 7 is next: the item names are still just raw `String`s — giving
inventory items their own real type, and why a bag of parallel lists
(names, quantities, locations) would be worse.
