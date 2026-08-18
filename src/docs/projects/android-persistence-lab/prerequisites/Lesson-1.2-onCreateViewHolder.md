# Lesson 1.2: `onCreateViewHolder` — Building a Row-Slot

## What you will build

Nothing new yet — this is a full, real read of the second small piece of
`InventoryAdapter`: the method that actually decides *when* a new
`InventoryViewHolder` (Lesson 1.1) gets built at all. The transferable
problem: something has to be the one place, in the whole file, where the
expensive work Lesson 1.1 proved is worth caching *actually happens* —
and that same something has to run rarely enough that the caching is
worth anything in the first place.

## What you need to know first

**Lesson 1.1: Why a ViewHolder Exists At All** — this lesson assumes
`InventoryViewHolder`'s constructor, its three `findViewById` calls, and
the Flyweight-pool reasoning behind them are already understood; that
class gets called here, not re-derived, though per this schema's
Repetition Rule it still gets its own full explanation below at the
point this lesson's own code uses it. **Lesson 0: The Java Ideas Python
Doesn't Force You to Learn** — comfort with class vs. object, `extends`,
`final` fields, generic type parameters (`<T>`), and the annotations
`@NonNull`/`@Override`.

## Terms used in this lesson

- **`View`** (reappearing, Lesson 1.1) — Android's base class for
  anything drawn on screen and interactive. It exists as the one common
  type every visual element shares, so code that positions, sizes, or
  passes around a not-yet-fully-known widget can be written once against
  `View` instead of once per concrete type — this is why the method below
  stores its freshly built row as a plain `View` before handing it to
  `InventoryViewHolder`.
- **`ViewGroup`** — a `View` that can itself contain other `View`s (a
  layout container — a row, a screen, a list). It exists because "a
  container of views" is itself something code needs to treat uniformly:
  sizing children, resolving their layout parameters, regardless of
  which specific layout (a `LinearLayout`, a `ConstraintLayout`) it
  actually is underneath. `RecyclerView` itself is a `ViewGroup`, which
  is exactly what the method below receives as its `parent` parameter.
- **`Context`** — an Android object representing "the environment this
  code is running in": access to resources, the current theme, the
  ability to start new UI. It exists because many Android APIs —
  inflating a layout is exactly one of them — need to know *which*
  running app/screen they're operating inside; a `Context` is the handle
  passed around for exactly that reason, and the method below has no
  `Context` of its own, so it borrows one from its `parent` parameter.
- **`@Override`** — an annotation telling the compiler "this method is
  meant to replace a method the parent class or interface already
  declared, using the exact same signature." It exists purely as a
  compiler-checked safety net: if the signature below it doesn't actually
  match anything the parent declares — a typo in the method name, a
  wrong parameter type — the compiler rejects the file outright, instead
  of silently compiling a brand-new, unrelated method that RecyclerView's
  own machinery will never actually call.
- **`@NonNull`** (reappearing, Lesson 1.1) — an annotation, not a runtime
  check by itself, asserting that a parameter, field, or return value is
  guaranteed to never be `null`. It exists so tooling (the compiler's own
  lint, or a static analyzer) can flag a caller passing `null` where this
  annotation promises it can't happen, as a build-time warning, instead
  of the mistake surfacing later as a runtime crash.
- **inflation / `LayoutInflater`** (reappearing, Lesson 1.1 — that lesson
  defined the word but never showed the code that performs it; this
  lesson's code is exactly that code) — the process of turning an XML
  layout file into real, live `View` objects in memory. It exists
  because a layout XML file is only a description sitting on disk —
  nothing can be shown or interacted with until something walks that
  description and constructs the real `TextView`, `Button`, and other
  objects it names.
- **the `R` class** (reappearing, Lesson 1.1) — a class Android's build
  tools *generate* automatically from your XML and resource files, giving
  every layout, ID, string, and drawable a real integer constant. Lesson
  1.1 only ever used its `R.id.*` variant (a specific child view's ID);
  this lesson is the first to use its `R.layout.*` variant instead — the
  same generated class, naming an entire layout file as a constant
  integer instead of one view inside it, for the identical reason: a
  compile-time-checked constant instead of a fragile, unchecked filename
  string.

## Objects and methods used

**`RecyclerView.Adapter<VH>.onCreateViewHolder(ViewGroup, int)`**
- *What it is:* an abstract method declared on `RecyclerView.Adapter`
  that every real subclass — `InventoryAdapter` included — is required to
  supply a real body for, per the same `extends`/`@Override` mechanism
  covered above. It is this lesson's own subject.
- *Implementation:* its real, generic-typed shape is
  `public abstract VH onCreateViewHolder(ViewGroup parent, int viewType)`,
  where `VH` is `RecyclerView.Adapter`'s own type parameter, filled in by
  `InventoryAdapter` as `InventoryViewHolder` specifically — which is why
  the concrete override below returns `InventoryViewHolder`, not some
  more general type. The `viewType` parameter exists for lists that mix
  more than one *kind* of row (a header row and a data row, say) — a
  value this method could branch on to build a different kind of holder
  per call. `InventoryAdapter`'s list has exactly one row shape, so this
  parameter is accepted, per the required signature, and simply unused.
- *Its use:* `InventoryAdapter` supplies the real body below — the one
  and only place in the whole file responsible for actually constructing
  a new `InventoryViewHolder`.

**`LayoutInflater`**
- *What it is:* a real Android class whose entire job is turning an XML
  layout resource into a real `View` tree — the actual class that
  performs the "inflation" defined above. This lesson calls two of its
  related members, so per this schema's rule for exactly that case, its
  real shape (only the members actually called) is shown below rather
  than described in prose alone.
- *Implementation:*
  ```java
  public abstract class LayoutInflater {
      public static LayoutInflater from(Context context) { /* ... */ }
      public View inflate(int resource, ViewGroup root, boolean attachToRoot) { /* ... */ }
  }
  ```
  `from(Context)` is a `static` factory method (Lesson 1.1's own
  definition of `static` applies unchanged: it belongs to the class
  itself, callable with no existing `LayoutInflater` in hand) that
  returns a real `LayoutInflater` instance already tied to the `Context`
  passed in. `inflate(int, ViewGroup, boolean)` is an ordinary instance
  method on that returned object: `resource` is the layout to build
  (an `R.layout.*` constant), `root` is the `ViewGroup` the result is
  *intended* to eventually live inside (used to correctly resolve that
  layout's own root-level width/height attributes even before it's
  actually attached to anything), and `attachToRoot` controls whether the
  newly built `View` is attached to `root` immediately or simply handed
  back, unattached, for the caller to place later.
- *Its use:* `onCreateViewHolder`, below, chains exactly these two real
  calls — `from(...)` to get an inflater bound to the right `Context`,
  then `.inflate(...)` on it — to turn `item_inventory.xml` into a real,
  inspectable row `View`.

**`View.getContext()`**
- *What it is:* an ordinary instance method, inherited by every `View`
  (and therefore by every `ViewGroup`, since `ViewGroup extends View`).
- *Implementation:* its real declared signature is
  `public final Context getContext()` — it simply returns the `Context`
  that `View` was already holding internally since the moment it was
  constructed.
- *Its use:* called on `parent` below, because `onCreateViewHolder` is
  never itself handed a `Context` directly — the `ViewGroup` parameter it
  *is* handed already has one, and asking for it is cheaper than
  requiring every caller to pass one along separately.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`RecyclerView.ViewHolder`** (reappearing, Lesson 1.1)
  - *What it is:* a plain wrapper class, not a `View` itself, whose
    entire purpose is holding a reference to one row's root `View` plus,
    by convention, references to that row's individual child views.
  - *Implementation:* its real constructor signature is
    `ViewHolder(@NonNull View itemView)`, storing the passed-in view into
    a `public final View itemView` field it exposes back out.
  - *Its use:* `InventoryViewHolder`, immediately below, `extends` it —
    the class this lesson's own method is responsible for constructing.
- **`InventoryViewHolder(View rowView)`** (reappearing, Lesson 1.1)
  - *What it is:* the real constructor Lesson 1.1 walked through in
    full — not this lesson's own subject, but called directly by it.
  - *Implementation:* takes one `View` parameter, calls
    `super(rowView)`, then runs three `findViewById` calls, caching
    `nameText`, `quantityText`, and `deleteButton` — the entire
    "expensive setup" Lesson 1.1's `Slot`/Flyweight proof modeled.
  - *Its use:* constructed once, below, from the freshly inflated
    `rowView` this lesson's own method builds.

---

## Concept Unit: `onCreateViewHolder` — Building a Row-Slot

### The Problem

Lesson 1.1 proved that paying `InventoryViewHolder`'s "expensive setup"
once per physical row-slot, rather than once per data item, is what
keeps a long list scrolling smoothly. That proof assumed something in
the file *decides when* a new slot actually gets built, and does so
rarely. Nothing shown so far is that something — `InventoryViewHolder`'s
own constructor only runs when *something else* calls `new
InventoryViewHolder(...)`, and until now, nothing has.

### Project Change

- **Reference Source:** No external reference file in this repo — this
  is your own Android Studio project's real `InventoryAdapter.java`,
  already built in `android-ui-foundations`. Shown in full below exactly
  as it already stands; nothing in this unit changes it.
- **Files affected:** `InventoryAdapter.java` (already exists).
- **Change type:** N/A — reading existing code.
- **Location:** the method `onCreateViewHolder`, a required override
  declared directly inside `InventoryAdapter`, alongside the
  `InventoryViewHolder` nested class Lesson 1.1 already covered.
- **Dependencies:** none new.

### The New Code

```java
@NonNull
@Override
public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
    View rowView = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_inventory, parent, false);
    return new InventoryViewHolder(rowView);
}
```

### The Updated Project

`InventoryAdapter.java`, as it stands at the end of this unit — the
constructor and field predate this whole lesson series (already built in
`android-ui-foundations`); the nested class is exactly Lesson 1.1's, shown
again here in full rather than elided; the method below is this unit's
own addition:

```java
class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {

    private final List<InventoryItem> items;

    InventoryAdapter(List<InventoryItem> items) {
        this.items = items;
    }

    @NonNull                                                              // ← new
    @Override                                                             // ← new
    public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType) { // ← new
        View rowView = LayoutInflater.from(parent.getContext())           // ← new
                .inflate(R.layout.item_inventory, parent, false);         // ← new
        return new InventoryViewHolder(rowView);                          // ← new
    }                                                                     // ← new

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        final Button deleteButton;
        final TextView nameText;
        final TextView quantityText;

        InventoryViewHolder(View rowView) {
            super(rowView);
            nameText = rowView.findViewById(R.id.itemNameText);
            quantityText = rowView.findViewById(R.id.itemQuantityText);
            deleteButton = rowView.findViewById(R.id.deleteButton);
        }
    }
}
```

`InventoryAdapter` as a whole now does two things instead of one: it can
still be handed a `List<InventoryItem>` at construction time (unchanged
from before), and it can now actually *build* a row-slot on request,
where previously nothing in the file could.

### Introduce the Concept in Isolation

The two-step shape above — a `static` factory call that hands back an
object already bound to an environment, followed by a separate instance
call on that object which builds a real thing from a plain description —
is provable in pure Java. `code/android-persistence-lab/LayoutInflationDemo.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class LayoutInflationDemo {

    static int inflateCallCount = 0;

    static class Environment {
        final String theme;
        Environment(String theme) { this.theme = theme; }
    }

    static class Widget {
        final String description;
        Widget(String description) {
            this.description = description;
        }
        @Override
        public String toString() {
            return "Widget[" + description + "]";
        }
    }

    static class Container {
        final List<Widget> children = new ArrayList<>();
        void attach(Widget widget) {
            children.add(widget);
        }
    }

    static class Inflater {
        final Environment environment;

        private Inflater(Environment environment) {
            this.environment = environment;
        }

        static Inflater from(Environment environment) {
            return new Inflater(environment);
        }

        Widget inflate(String description, Container intendedParent, boolean attachNow) {
            inflateCallCount++;
            System.out.println("[INFLATE] building \"" + description + "\" using theme \"" + environment.theme + "\" (call #" + inflateCallCount + ")");
            Widget built = new Widget(description);
            if (attachNow) {
                intendedParent.attach(built);
                System.out.println("          attached immediately to container");
            } else {
                System.out.println("          NOT attached yet -- caller will attach it later");
            }
            return built;
        }
    }

    public static void main(String[] args) {
        Environment darkTheme = new Environment("dark");
        Container screen = new Container();

        Widget first = Inflater.from(darkTheme).inflate("row-layout", screen, false);
        Widget second = Inflater.from(darkTheme).inflate("row-layout", screen, false);

        System.out.println();
        System.out.println("inflateCallCount        = " + inflateCallCount);
        System.out.println("screen.children.size()  = " + screen.children.size());
        System.out.println("first  = " + first);
        System.out.println("second = " + second);
    }
}
```

`Inflater.from(environment)` stands in for `LayoutInflater.from(context)`;
`.inflate(description, parent, attachNow)` stands in for
`.inflate(R.layout.item_inventory, parent, false)`. Real, actually-run
output, this session:

```
[INFLATE] building "row-layout" using theme "dark" (call #1)
          NOT attached yet -- caller will attach it later
[INFLATE] building "row-layout" using theme "dark" (call #2)
          NOT attached yet -- caller will attach it later

inflateCallCount        = 2
screen.children.size()  = 0
first  = Widget[row-layout]
second = Widget[row-layout]
```

Both calls pass `attachNow = false`, exactly matching the real code's own
third argument, `false`. The proof this run gives directly: even after
building two real `Widget` objects, `screen.children.size()` stays `0` —
the constructed objects are real and independently usable (`first` and
`second` both print correctly), but neither was ever added to `screen`.
This is called the **static factory method pattern**: a method that
builds and returns an instance without the caller ever writing `new`
directly against the class the caller actually wants — `Inflater`'s own
constructor is `private`, above, meaning `new Inflater(...)` is not even
legal outside the class itself; `from(...)` is the only door in.

### Discard the Throwaway Example

`LayoutInflationDemo.java` exists only to prove the factory-then-build
shape and the unattached-on-purpose claim, in isolation. It is not part
of the Android project and never will be — the real mechanism it proves
now carries forward into `onCreateViewHolder`, discussed in real Android
terms instead of `Inflater`/`Widget`.

### Mechanical Walkthrough

- `@NonNull` — an annotation (Terms, above), asserting this override
  never returns `null`; it exists because `RecyclerView`'s own internals
  would otherwise have to defensively null-check every adapter's return
  value on every call, which the annotation lets static analysis catch
  at build time instead, on a violating `return null;`, if one were ever
  written.
- `@Override` — an annotation (Terms, above); the compiler confirms this
  method's exact signature — name, parameter types, return type — really
  matches the abstract method `RecyclerView.Adapter<VH>` declared,
  catching a typo'd override as a build error instead of silently
  compiling an unrelated method `RecyclerView` would never call.
- `public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType)`
  — the method signature the parent class's abstract declaration demands
  (Objects and methods, above); `parent` arrives typed as `ViewGroup`
  (Terms, above) because at this point all that's known is that it's
  *some* container the new row is destined for, not which concrete
  layout type; `viewType` is accepted, per that same required signature,
  and never read inside this body, because `InventoryAdapter`'s list has
  only one row shape.
- `LayoutInflater.from(parent.getContext())` — a **static method call**
  on `LayoutInflater` (Objects and methods, above); `parent.getContext()`
  is a nested **instance method call** on `parent` (a real `ViewGroup`,
  which *is* a `View`) — `getContext()`'s real signature, `public final
  Context getContext()`, is what supplies the one argument `from`
  requires, since this method has no `Context` of its own to offer
  directly.
- `.inflate(R.layout.item_inventory, parent, false)` — an **instance
  method call** on the `LayoutInflater` object `from(...)` just returned;
  its three real arguments, in order (Objects and methods, above):
  `R.layout.item_inventory` (a `static final int` constant, the `R`
  class's `R.layout.*` variant, Terms above, naming which XML file to
  build), `parent` (a variable read — the same `ViewGroup` this method
  received, passed along so `inflate` can correctly resolve the new
  row's own root-level layout attributes even before it's attached to
  anything), and the `boolean` literal `false` — proven in isolation
  above to mean "build it, but do not attach it to `parent` yet,"
  because `RecyclerView` itself is responsible for attaching this row at
  the correct moment, and attaching it here, early, would fight with the
  recycling machinery Lesson 1.1 already established.
- `View rowView = ...` — a **variable declaration**, typed as the
  general `View` (Terms, above, reappearing): nothing at this point
  knows yet about `nameText`/`quantityText`/`deleteButton` — that only
  happens inside the constructor called next.
- `return new InventoryViewHolder(rowView);` — a **constructor call**
  (Objects and methods, above, reappearing from Lesson 1.1) — this is
  the exact moment `InventoryViewHolder`'s own three `findViewById` calls
  actually run: once, right here, for this specific new row-slot, never
  again for its entire remaining lifetime.

### CS Lens

The `LayoutInflater.from(context)` call is a real instance of the
**static factory method pattern**: a `static` method that builds and
hands back a real object, instead of the caller writing `new` against
the class directly. Also recognized in: Java's own `Integer.valueOf(int)`
(which may return a cached, shared instance rather than always building
a fresh one), most database-driver `DriverManager.getConnection(...)`
calls, and any library that hides its real constructor behind a `from`,
`of`, or `create` method to keep the option of returning something other
than a brand-new instance later, without breaking every caller.

### SE Lens

Why does `LayoutInflater` require going through `from(context)` instead
of exposing a plain public constructor? A constructor can only ever
build a brand-new object; a `static` factory method can choose to return
something else entirely — a cached instance, a subclass picked based on
the `Context` passed in — without any caller-visible change. The real
cost is one extra, slightly indirect step (`from(...)` before `.inflate(...)`,
rather than one plain `new LayoutInflater(...)`), paid on every call, in
exchange for Android's own internals being free to change what actually
comes back later without breaking any existing caller.

### Timing — When `onCreateViewHolder` Actually Runs

This is genuine `RecyclerView` framework behavior with no plain-JVM
equivalent to prove it against, so it's stated plainly as what it is,
with a real, concrete way to check it yourself, rather than a fenced
"output" this session didn't actually produce. Consider a screen showing
4 rows at once, backed by a dataset of 20 real items:

1. The screen first appears. `RecyclerView` has zero existing holders, so
   for each of the first 4 (plus a small buffer `RecyclerView` keeps
   ahead of the visible area) rows it needs, it calls
   `onCreateViewHolder` — building that many real `InventoryViewHolder`
   instances, each running its three `findViewById` calls exactly once.
2. The user scrolls down by one row. A 5th row's worth of content needs
   to appear, but the row that just scrolled *off* the top is now a free,
   already-built holder `RecyclerView` already owns — it reuses that
   existing holder instead of building a new one, so `onCreateViewHolder`
   does not run again; only `onBindViewHolder` (Lesson 1.3) runs, on the
   reused holder, to swap in the new row's data.
3. This repeats for every further scroll step, for as long as the number
   of concurrently visible-or-buffered rows never exceeds the small pool
   already built. `onCreateViewHolder` never runs again for the rest of
   this screen's lifetime — whether the dataset holds 20 items or
   20,000 — while `onBindViewHolder` keeps running, once per newly
   revealed row.

**To verify this yourself, concretely:** add a temporary
`Log.d("ADAPTER", "onCreateViewHolder called");` as the first line of the
real method, run the app on a device or emulator with a dataset larger
than one screenful, scroll the entire list from top to bottom, and count
the real Logcat lines — the count will match roughly how many rows fit
on screen at once (plus a small buffer), not how many items are in the
dataset. The official method reference, for the declared contract
itself, is `https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView.Adapter` —
worth reading directly rather than taking this lesson's paraphrase of it
on faith.

### Commands Needed

```bash
cd code/android-persistence-lab
javac LayoutInflationDemo.java
java LayoutInflationDemo
```

- `javac LayoutInflationDemo.java` — the standard Java compiler; produces
  `LayoutInflationDemo.class` (and one `.class` file per nested static
  class) in the same directory. Success is silent.
- `java LayoutInflationDemo` — the standard Java launcher; runs the named
  class's `public static void main(String[])`.

### Run It — Real Output

Already shown in full above, under "Introduce the Concept in Isolation"
— the actual, unedited output of the two commands just listed, run this
session.

### Connecting Sentence

`onCreateViewHolder` is the one place the "expensive setup" Lesson 1.1
proved is worth caching actually gets triggered — rarely, by design —
and the next unit, `onBindViewHolder`, is the far-more-frequent method
responsible for what happens to a row-slot every other time it's needed.

---

## Connect the Pieces

One trace, start to finish: `RecyclerView` decides it needs a row-slot it
doesn't already have and calls `onCreateViewHolder(parent, viewType)`.
`LayoutInflater.from(parent.getContext())` returns a real inflater bound
to the right environment; `.inflate(R.layout.item_inventory, parent,
false)` builds a real `View` tree from `item_inventory.xml`, deliberately
not yet attached to `parent`. `new InventoryViewHolder(rowView)` runs
Lesson 1.1's own constructor against that freshly built view, caching its
three child views once. The returned `InventoryViewHolder` is now part
of `RecyclerView`'s small, reusable pool — this exact method will not
run again for it, no matter how many different data items it goes on to
display.

## What Breaks Without This

There is no safe way to *remove* this method from a real project — it is
a required override; the class fails to compile without it. The
observable failure worth causing on purpose instead: in
`LayoutInflationDemo.java`, change the third argument of both `inflate`
calls from `false` to `true`, rerun it, and watch `screen.children.size()`
change from `0` to `2` — direct, real proof of what the real code's own
`false` argument is actually choosing not to do. Revert the change
afterward.

## Exercises

1. Run `LayoutInflationDemo.java` with the second `inflate` call's
   `attachNow` set to `true` and the first left `false`; predict
   `screen.children.size()` before running it, then confirm.
2. Using the timing trace above, write out — in your own words, no code —
   what you'd expect to happen to the call counts if the screen could fit
   10 rows instead of 4, with the same 20-item dataset.

## Definition of Done

- [ ] You ran `LayoutInflationDemo.java` yourself and can explain, from
      the real output, why `screen.children.size()` stayed `0` despite
      two real objects being built.
- [ ] You can name the two real `LayoutInflater` calls in
      `onCreateViewHolder`, in order, and what each one's real return
      value is used for.
- [ ] You can explain why `onCreateViewHolder` runs a small, fixed number
      of times regardless of dataset size, tying it to the timing trace
      above.
- [ ] `git commit` with a message explaining *why* you now understand
      this method — e.g. "Understand onCreateViewHolder: the one place
      inflation and ViewHolder construction actually happen, called only
      for row-slots RecyclerView doesn't already have," not "read
      onCreateViewHolder."

Next: Lesson 1.3 — `onBindViewHolder`, the far more frequent method, and
the click-listener position trap it has to guard against.
