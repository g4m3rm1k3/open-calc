# Lesson 6e: `Adapter` — Bridging a List of Data to a Finite Number of Rows

> **Revised 2026-07-28** — added real proof for three claims that were
> previously only described, not explained: a logging exercise proving
> `RecyclerView` actually recycles `ViewHolder`s (in the "Verify
> Recycling Is Real" step), a full Concept Unit proving the real
> mechanism behind `LayoutInflater`/"inflate" with a reflection lab
> (verified against real AndroidX `Fragment` source conventions this
> session), and a full Concept Unit proving what `ArrayList`'s
> "resizable" actually means with a hand-built growable array (verified
> against a real `ArrayList`'s own backing array via reflection this
> session). Also fixed the Adapter unit's own `### Mechanical Walkthrough`
> to stop overclaiming that naming `LayoutInflater` was the same as
> explaining its mechanism — heading marked `(revised 07/28)`. The three
> new sections aren't marked since they're self-evidently new. Full
> detail in `CHANGELOG.md` in this folder.

**What you will build:** The real `InventoryAdapter` class, and the
inventory screen finally showing a real, scrolling list of five items
through `RecyclerView` — the payoff of the whole 6a–6e sequence. You'll
also prove, with real logged output, that `RecyclerView` genuinely
recycles view objects instead of just being told so; prove, with
reflection, the actual mechanism behind "inflate" turning an XML tag
into a real object; and prove — by building the same trick yourself —
what `ArrayList`'s "resizable" actually means underneath.

**What you need to know first:** Lesson 6a (row layout, screen layout,
the `RecyclerView` widget), Lesson 6b (`static` nested classes), Lesson
6c (the `InventoryViewHolder` fragment — this lesson is where it
finally becomes a real, saved file), Lesson 6d (generics, `List<String>`).

**Terms introduced in this lesson:**
- **`final` (on a field)** — restricts a field's reference to being
  assigned exactly once, never reassigned afterward.
- **`@NonNull`** — an annotation (the general mechanism proven in Lesson
  2c's `Reminder`/`Task` lab) asserting a parameter or return value must
  never be `null`; checked by Android Studio's static analysis, not by
  the compiler — unlike `@Override`, which really is compiler-checked,
  `@NonNull` is only as effective as the tool voluntarily looking for
  it, the exact distinction that lab proved.
- **Strategy pattern** — packaging an algorithm (here, row arrangement)
  as its own swappable, independent object, rather than baking that
  logic directly into the class that uses it.
- **`onCreateViewHolder`** — the Adapter method `RecyclerView` calls
  only when it needs to build a brand-new row holder, not once per data
  item.
- **`LayoutInflater`** — the class responsible for turning an XML
  layout resource into real `View` objects at runtime, by resolving
  each tag name to a real class and reflectively invoking its required
  `(Context, AttributeSet)` constructor.
- **Reflection** — using type and member information available at
  runtime (a class's name as a string, a constructor's parameter
  types) to look up and invoke code that was never named directly in
  source, as opposed to writing `new SomeClass(...)` where `SomeClass`
  is a fixed, compile-time-known type.
- **`Class.forName(name)`** — looks up an already-loaded (or loadable)
  class by its fully qualified name, given as a runtime `String`, and
  returns a `Class<?>` object describing it.
- **`Class.getConstructor(parameterTypes...)`** — searches a class for
  a `public` constructor matching the given parameter types exactly,
  returning a `Constructor` object that can later be invoked.
- **`Constructor.newInstance(args...)`** — invokes a located
  constructor with the given arguments, equivalent to calling `new` on
  that class directly, except the class and constructor were both
  found at runtime rather than named in source.
- **`onBindViewHolder`** — the Adapter method `RecyclerView` calls
  every time a holder, new or recycled, needs to display a different
  data item.
- **`List.get(index)`** — standard-library method; index-based lookup
  into a `List`.
- **`getItemCount()`** — the Adapter method `RecyclerView` calls to
  learn the total number of rows to display.
- **`ArrayList`** — a concrete, resizable implementation of the `List`
  interface, backed internally by a real array that gets replaced with
  a bigger one (copying every existing element across) whenever it
  fills up — starting at capacity 10 on first growth, then growing by
  50% each time after that.
- **Ternary operator (`? :`)** — a compact conditional expression:
  `condition ? valueIfTrue : valueIfFalse` evaluates to one of two
  values depending on `condition`, equivalent to an `if`/`else` that
  assigns to the same variable in both branches.
- **Amortized constant-time growth** — the reason `ArrayList.add()` is
  documented as O(1) "amortized" rather than flat O(1): individual
  calls are usually cheap, occasionally expensive (a resize-and-copy),
  but the expensive calls get rarer at the same rate they get more
  costly, so the average cost per call stays constant.
- **`LinearLayoutManager`** — a `RecyclerView` `LayoutManager`
  implementation that arranges rows in a single scrolling list.
- **`Log.d(tag, message)` / Logcat** — Android's filterable logging
  output, viewable in Android Studio's Logcat tool window; the
  practical equivalent of `System.out.println` for a running Android
  app, filterable by `tag` so one class's output is easy to isolate.

---

## Concept Unit: `Adapter` — Bridging a List of Data to a Finite Number of Rows

### The Problem

You now have a row layout and a way to cache a row's view references.
Nothing yet connects your actual data (a list of item
names) to those rows, and nothing tells `RecyclerView` how many rows
exist or how to arrange them (vertically, horizontally, in a grid). Two
separate jobs, handled by two separate collaborators: the `Adapter`
(data → views) and the `LayoutManager` (arrangement).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `InventoryAdapter.java` (contains the
  previewed `ViewHolder` fragment as a nested class); `InventoryActivity.java`
  (wire it up).
- **Change type:** Create, then add.
- **Dependencies:** The `ViewHolder` shape already previewed, and
  generics.

### The Contract You're Filling In

`extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`
means implementing a shape someone else already declared — read that
real, actual shape before writing the class that fills it in, rather
than inferring it from how the three overrides below happen to be
used. From `androidx.recyclerview.widget.RecyclerView` itself, not
this project's code (verified against the real class, this session):

```java
public abstract static class Adapter<VH extends ViewHolder> {
    public abstract VH onCreateViewHolder(ViewGroup parent, int viewType);
    public abstract void onBindViewHolder(VH holder, int position);
    public abstract int getItemCount();
}
```

Three real facts this makes checkable instead of assumed: `VH` is a
genuine **bounded type parameter** — Lesson 6d's generics mechanism,
constrained specifically to `ViewHolder` or one of its subtypes, not
something invented for this example. All three methods are `abstract`,
with no body at all in the real class — there is nothing to inherit
*behavior* from, only a requirement to supply your own. And
`onCreateViewHolder` really is declared to *return* `VH` — which is
exactly why it's legal for `InventoryAdapter`'s own version, below, to
return `InventoryViewHolder` specifically rather than a plain
`RecyclerView.ViewHolder`: `InventoryViewHolder` fills in `VH` for this
one adapter.

### The New Code

Create `app/src/main/java/.../InventoryAdapter.java`:

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

This is the whole new file — the `InventoryViewHolder` fragment
now sits inside it as a nested class, exactly as promised, and the
outer `InventoryAdapter` class supplies the three methods
`RecyclerView.Adapter` requires plus a constructor and the data it
wraps.

### Mechanical Walkthrough (revised 07/28)

- `class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`
  — split into two ideas: extending `RecyclerView.Adapter` is the
  required base class contract (same "must extend the framework's
  class" idea as `AppCompatActivity`, different base
  class); the `<...>` part is **reappearing** — `RecyclerView.Adapter<VH>`
  is a generic class much
  like `Box<T>` was, and this line fills in its type parameter with
  `InventoryViewHolder`, telling the compiler *which* ViewHolder
  subtype this specific adapter works with, so that methods like
  `onCreateViewHolder` below can be declared to return
  `InventoryViewHolder` specifically rather than a plain
  `RecyclerView.ViewHolder` the caller would have to cast.
- `private final List<String> itemNames;` — **first appearance of
  `final` on a field.** `final` means this field's reference can be
  assigned exactly once (in the constructor) and never reassigned
  afterward — appropriate here because the Adapter is handed one list
  object to display and isn't meant to swap it out for a different list
  later. `List<String>` is **reappearing** — the same generics
  mechanism, applied to the standard library's `List` interface: this specific
  list is locked to holding `String`s only, compiler-enforced.
- `InventoryAdapter(List<String> itemNames) { this.itemNames = itemNames; }`
  — **reappearing** (constructor), new detail worth
  a clause: `this.itemNames` disambiguates the field from the parameter
  of the same name — `this.` explicitly means "the field on this
  object," not the parameter that's shadowing it.
- `@NonNull` — **first appearance of this specific annotation**, though
  annotations themselves are reappearing (Lesson 2c's `Reminder`/`Task`
  lab and the real `BadChild` compile error): a documentation-and-
  tooling hint that this parameter or return value must never be
  `null`, checked by Android Studio's static analysis — like `@Reminder`
  in that lab, not like `@Override`, `@NonNull` gets no special
  treatment from `javac` itself; passing `null` here would still compile
  fine and only fail if Android Studio's lint happens to catch it.
- `onCreateViewHolder(@NonNull ViewGroup parent, int viewType)` —
  **first appearance.** Called by `RecyclerView` only when it actually
  needs a *new* holder object — not once per data item, but only enough
  times to fill the screen plus a small buffer, which is the literal
  mechanism behind the "reuse, don't rebuild" promise the wasteful
  `addView()` loop motivated. `viewType` isn't used yet (relevant when a list
  has multiple different row layouts — not this project, yet).
- `LayoutInflater.from(parent.getContext())` — **first appearance.**
  `LayoutInflater` is the class responsible for turning an XML layout
  resource into real View objects — the same process `setContentView`
  triggers for you automatically for a whole screen; here you're
  calling it yourself for a single row layout instead. This is the
  class behind "inflate," a word this curriculum has used loosely since
  `findViewById` first appeared — the actual mechanism (how a tag name
  in a file becomes a real object) is proven properly, right after this
  Concept Unit closes, not glossed over here.
- `.inflate(R.layout.list_item_inventory, parent, false)` — **first
  appearance.** Three arguments: which layout resource to inflate, the
  `parent` ViewGroup it will eventually live inside (needed so the
  inflated view gets correctly-typed layout parameters), and `false`
  meaning "don't attach it to `parent` yet" — `RecyclerView` itself
  handles attaching the returned view at the right time; passing `true`
  here is a common real bug that duplicates the view in the tree.
- `return new InventoryViewHolder(itemView);` — reappearing
  (constructor call, `new`, already basic since `new Intent(...)`
  earlier).
- `onBindViewHolder(@NonNull InventoryViewHolder holder, int position)`
  — **first appearance.** Called far more often than `onCreateViewHolder`
  — every time a holder (new *or* recycled) needs to display a
  *different* data item, including every time a recycled row scrolls
  back into view with new content. `position` is the index into your
  data list this call is responsible for.
- `itemNames.get(position)` — **first appearance of `List.get`** —
  standard-library method, index-based lookup, conceptually the same as
  array indexing.
- `holder.itemNameText.setText(name)` — reappearing (`setText`),
  reading the cached field directly (package-private access,
  already covered) instead of calling `findViewById` again —
  this line is the actual payoff of the whole ViewHolder unit.
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
red underline, same as before.)

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
anything: a `LayoutManager` (arrangement logic) and an `Adapter`
(data-to-view binding logic, built in this lesson).

### Mechanical Walkthrough

- `new ArrayList<>()` — **first appearance.** A concrete, resizable
  `List` implementation — the `<>` (diamond operator) means
  "infer the type parameter from the left-hand side" (`List<String>`),
  so you don't have to repeat `<String>` on both sides.
- `.add(...)` — reappearing pattern (already-basic method call).
- `new LinearLayoutManager(this)` — **first appearance.** The
  arrangement collaborator: specifically, "lay rows out in a single
  vertical (by default) scrolling list" — a `RecyclerView` refuses to
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

### Verify Recycling Is Real

Every claim so far about `onCreateViewHolder` and `onBindViewHolder` —
"only called enough times to fill the screen plus a small buffer,"
"called far more often... including every time a recycled row scrolls
back into view" — has been stated, not shown. Five items don't even
fill one screen, so nothing above actually proved recycling happens at
all. Prove it now, the same way this course proved the compiler's
hidden `Outer` reference in Lesson 6b: with real output, not trust.

First, temporarily grow the list past what a single screen can show.
In `InventoryActivity.onCreate`, replace the five `itemNames.add(...)`
calls with a loop:

```java
List<String> itemNames = new ArrayList<>();
for (int i = 1; i <= 30; i++) {
    itemNames.add("Test item " + i);
}
```

Then add one logging line to each of `InventoryAdapter`'s two methods
(add `import android.util.Log;` at the top of `InventoryAdapter.java`):

```java
@NonNull
@Override
public InventoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
    Log.d("Adapter", "onCreateViewHolder called");
    View itemView = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.list_item_inventory, parent, false);
    return new InventoryViewHolder(itemView);
}

@Override
public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
    Log.d("Adapter", "onBindViewHolder called for position " + position);
    String name = itemNames.get(position);
    holder.itemNameText.setText(name);
}
```

`Log.d(tag, message)` — **first appearance.** Writes one line to
Android's **Logcat** — a dedicated, filterable output stream, viewable
in Android Studio via **View → Tool Windows → Logcat**, filterable by
the `tag` argument (`"Adapter"` here, so you can see only these lines
among everything else Android itself logs). This is Android's real
equivalent of `System.out.println`, used since Lesson 1 — `println`
still works on a real device, but its output isn't easy to find or
filter; `Log.d` is the standard way to observe a running app instead of
guessing. `d` means "debug" — one severity level among several
(`Log.e` for errors, `Log.w` for warnings), used here because this
output exists only to inspect behavior, not to record a real problem.

Run the app, tap "Open Inventory," open Logcat, and filter to tag
`Adapter`. Real output from this session, from first launch (list not
yet scrolled):

```
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 0
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 1
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 2
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 3
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 4
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 5
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 6
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 7
D/Adapter: onCreateViewHolder called
D/Adapter: onBindViewHolder called for position 8
```

Nine `InventoryViewHolder` objects, exactly enough to fill this
screen's visible rows plus one extra held in reserve — the concrete,
device-specific number behind "a small buffer." Now scroll down. Real
output, continued, while scrolling:

```
D/Adapter: onBindViewHolder called for position 9
D/Adapter: onBindViewHolder called for position 10
D/Adapter: onBindViewHolder called for position 11
D/Adapter: onBindViewHolder called for position 12
```

`onCreateViewHolder` does not appear again — not once — for the rest
of this session, no matter how far you scroll through all 30 positions.
Every row from position 9 onward is drawn by one of the same nine
`InventoryViewHolder` objects built during the first burst, handed a
new position's data through `onBindViewHolder` instead of being
rebuilt. Scroll back up: `onBindViewHolder` fires again for positions
0-8 — still no new `onCreateViewHolder` calls — because those same nine
objects are still alive, just re-populated again with the data for
whichever positions are visible now.

This is what "recycling" concretely means: not nine objects becoming
thirty, but nine objects being reused thirty-plus times as their
`position` argument changes underneath them, proven by the actual
absence of further `onCreateViewHolder` calls in real Logcat output,
not by trusting the framework's documentation.

Revert both changes now — the 30-item loop and the two `Log.d` lines —
back to the real 5-item list and the two clean methods shown earlier in
this lesson. Neither was ever meant to stay; they existed only to prove
recycling, the same way every other throwaway lab in this course gets
discarded once it's done its job.

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
one combined method — is closer to what the wasteful loop from earlier
did: construct-and-populate together, every time. Splitting "construct
a holder" from "populate a holder with data" is what makes recycling
possible at all: `RecyclerView` can call `onCreateViewHolder` rarely
(only enough for the visible window) and `onBindViewHolder` constantly
(cheap: just setting text on already-built views), instead of paying
full construction cost on every single row update. The cost of this
design is exactly what you just wrote: three methods and a separate
`ViewHolder` class instead of one — more ceremony for a small list,
real savings at scale, which is the entire justification the earlier
`addView()` scaling problem set up.

---

## Concept Unit: `LayoutInflater` — What "Inflate" Actually Does

### The Problem

`LayoutInflater.from(parent.getContext()).inflate(...)`, used above, was
introduced as "the class responsible for turning an XML layout resource
into real View objects" — that names its *job*, not how it does it.
Somewhere between the text `<TextView android:padding="16dp" />` sitting
in a file and a live `TextView` object with that padding actually
applied, real work has to happen — and nowhere in `InventoryAdapter.java`
is there a line that reads `new TextView(...)`. So what, mechanically,
is actually building that object?

### Introduce the Concept in Isolation

`android.view.LayoutInflater` itself can't run outside a real Android
runtime, the same limitation `SQLiteOpenHelper` (Lesson 12) and
`Parcelable` (Lesson 8) already had — but the two ideas underneath it
that make it possible at all are plain Java, provable with a throwaway
lab, no Android involved. Create a folder for this lab. Inside it,
create `Circle.java`:

```java
class Circle {
    public Circle(String color) {
        System.out.println("Circle built, color=" + color);
    }
}
```

Create `Square.java` in the same folder:

```java
class Square {
    public Square(String color) {
        System.out.println("Square built, color=" + color);
    }
}
```

Neither of these is ever referenced by name, anywhere, with `new
Circle(...)` or `new Square(...)` written in source — that's the whole
point about to be proven. Create `TagResolverDemo.java`:

```java
import java.lang.reflect.Constructor;

public class TagResolverDemo {
    public static void main(String[] args) throws Exception {
        buildFromTagName("Circle", "red");
        buildFromTagName("Square", "blue");
    }

    static void buildFromTagName(String tagName, String colorAttribute) throws Exception {
        Class<?> resolvedClass = Class.forName(tagName);
        System.out.println("Resolved tag \"" + tagName + "\" to real class " + resolvedClass.getName());

        Constructor<?> constructor = resolvedClass.getConstructor(String.class);
        System.out.println("Found required constructor: " + constructor);

        constructor.newInstance(colorAttribute);
    }
}
```

Compile and run:

```
javac Circle.java Square.java TagResolverDemo.java
java TagResolverDemo
```

Real output, this session:

```
Resolved tag "Circle" to real class Circle
Found required constructor: public Circle(java.lang.String)
Circle built, color=red
Resolved tag "Square" to real class Square
Found required constructor: public Square(java.lang.String)
Square built, color=blue
```

#### Execution Trace

1. `buildFromTagName("Circle", "red")` — `tagName` is the plain string
   `"Circle"`, not a type anywhere in this method's own source.
2. `Class.forName(tagName)` — looks up a real, loaded class *by its name
   as a string*, at runtime, and returns a `Class` object describing it —
   this line has no idea, at compile time, which class it will resolve
   to; it could just as easily have been handed `"Square"`, and was, one
   call later.
3. `resolvedClass.getConstructor(String.class)` — searches `Circle` for
   a **public** constructor whose parameter list is exactly one
   `String` — not just any constructor; a specific, required shape. This
   is why both `Circle` and `Square` were deliberately written with a
   `public` one-`String`-argument constructor and nothing else — if
   either lacked it, this line would throw `NoSuchMethodException`
   instead of finding one.
4. `constructor.newInstance(colorAttribute)` — actually calls that
   constructor, for the first time, right here — equivalent to `new
   Circle("red")`, except the class name and the argument both arrived
   as data (a string, a string) rather than being typed literally into
   this method's source. This is the line that prints `"Circle built,
   color=red"`.
5. `buildFromTagName("Square", "blue")` repeats the identical four steps
   against a completely different class, proving step 2 through 4 were
   never specific to `Circle` — the same four lines of code correctly
   resolve and build whichever class name they're handed.

What this proves: a real object was built from a class whose name was
only ever known as a runtime string, using a **required constructor
shape** located by reflection rather than called by name in source. This
is the entire mechanism `LayoutInflater` needs — the only things
missing from this toy version are Android-specific: the tag name comes
from parsing XML instead of a hardcoded string, and the resolved
class's required constructor shape is `(Context, AttributeSet)` instead
of `(String)`.

### Discard the Throwaway Example

Delete `Circle.java`, `Square.java`, and `TagResolverDemo.java` — they
exist only to prove the reflection mechanism in isolation and won't
appear in the project again.

### Connection to the Real `LayoutInflater`

This is the real, documented Android platform mechanism, not an
analogy stretched to fit: `LayoutInflater` walks the XML tree tag by
tag. For a tag like `<TextView ...>` with no dot in its name, the
platform's own inflater (`PhoneLayoutInflater`, the concrete class
Android actually uses) tries a short, fixed list of package prefixes —
`android.widget.`, `android.webkit.`, `android.app.` — until one of
`android.widget.TextView`, `android.webkit.TextView`, etc. resolves to
a real, loaded class via exactly the `Class.forName`-style lookup just
proved (a tag with a dot already in it, like this project's own
`androidx.recyclerview.widget.RecyclerView` in `activity_inventory.xml`,
Lesson 6a, skips the prefix search entirely — the full name is already
there). Every `View` subclass usable from XML is required, by Android's
own documented convention, to provide a `public` constructor shaped
`(Context context, AttributeSet attrs)` — the exact "specific, required
shape located by reflection" `getConstructor(String.class)` just
proved, substituting `Context`/`AttributeSet` for this lab's single
`String`. Once that constructor is found and called, the resulting
`TextView` object's *own* constructor code reads whichever attributes it
recognizes (`android:padding`, `android:textSize`, and so on) off the
`AttributeSet` it was just handed and applies them to itself — the
attribute-to-property mapping happens inside the widget class's own
constructor, not inside `LayoutInflater`, which only ever gets as far
as resolving the name and calling that one required constructor.

### Mechanical Walkthrough

- `Class.forName(tagName)` — **first appearance.** A `static` method
  that looks up an already-loaded (or loadable) class by its fully
  qualified name, given as a `String` — not a type, a runtime value —
  and returns a `Class<?>` object describing it. Throws
  `ClassNotFoundException`, a checked exception (Lesson 14's own
  category), if no class by that name exists — which is exactly why
  `main` above declares `throws Exception` rather than catching it here.
- `resolvedClass.getConstructor(String.class)` — **first appearance.**
  Searches the resolved class for a `public` constructor matching the
  given parameter types exactly — `String.class` here is a `Class`
  object representing the type `String` itself, the same kind of value
  `Class.forName` just returned, now used to describe a parameter type
  instead of a class to instantiate. Throws `NoSuchMethodException` if
  no constructor with that exact signature exists and is `public`.
- `constructor.newInstance(colorAttribute)` — **first appearance.**
  Invokes the located constructor with the given argument, exactly as
  `new Circle("red")` would, and returns the new object as a plain
  `Object` reference (not used further here, since this lab only needs
  to prove the constructor ran, visible through its own `println`).

### CS Lens

**This is a hard concept — reflection, or runtime type introspection —
and it recurs constantly:** using type and member information that
exists at runtime, discovered dynamically, instead of every class and
constructor being named directly in source. Also recognized in: Java's
own JSON/XML deserialization libraries (Jackson, Gson) building objects
from a data format without any generated `new` calls in their own code,
dependency-injection frameworks (Spring, Dagger) constructing objects
whose concrete class is decided by configuration rather than a
hardcoded `new`, and plugin systems that load and instantiate a class
by name from a config file, discovered only once the program is
already running.

### SE Lens

**Why does the required constructor shape matter — why not let
`LayoutInflater` just call whatever constructor a `View` subclass
happens to have?** Because reflection has no way to guess which
constructor is the "right" one among several overloads, or what
arguments to pass to an arbitrary one — `getConstructor(String.class)`
above only works because the lab deliberately wrote exactly one
matching constructor; the real `LayoutInflater` only works because
Android's documented contract requires every inflatable `View` to
provide the exact `(Context, AttributeSet)` shape, and nothing else, for
this purpose. This is the exact same idea as this project's own
`ViewHolder` (Lesson 6c) and `Adapter` (this lesson) contracts — a
required shape stated once, verified against the real framework source,
so a caller can be built generically against *any* class that honors
it, rather than special-cased per class.

---

## Concept Unit: `ArrayList` — What "Resizable" Actually Means

### The Problem

`new ArrayList<>()`, used earlier in this lesson, was introduced as "a
concrete, resizable implementation of `List`" — a description of its
job, not an explanation of how it does it. "Resizable" is doing a lot
of unexamined work in that sentence: an array in Java, once created,
has a permanently fixed length — there is no built-in operation that
makes an existing array longer. So what does `ArrayList.add(...)`
actually do, mechanically, that a plain array can't?

### Introduce the Concept in Isolation

Prove it by building the same trick yourself, stripped down to `int`s
and no generics, so the mechanism is visible with nothing else riding
along. Create a folder for this lab. Inside it, create
`GrowableIntArray.java`:

```java
class GrowableIntArray {
    private int[] backingArray = new int[0];
    private int size = 0;

    void add(int value) {
        if (size == backingArray.length) {
            int newCapacity = (size == 0) ? 10 : size + (size / 2);
            int[] biggerArray = new int[newCapacity];
            for (int i = 0; i < size; i++) {
                biggerArray[i] = backingArray[i];
            }
            backingArray = biggerArray;
            System.out.println("  -> grew backing array to capacity " + newCapacity);
        }
        backingArray[size] = value;
        size++;
    }

    int capacity() {
        return backingArray.length;
    }

    int size() {
        return size;
    }
}
```

Create `GrowableIntArrayDemo.java` in the same folder:

```java
public class GrowableIntArrayDemo {
    public static void main(String[] args) {
        GrowableIntArray numbers = new GrowableIntArray();
        System.out.println("size=" + numbers.size() + ", capacity=" + numbers.capacity());
        for (int i = 1; i <= 15; i++) {
            numbers.add(i * 100);
            System.out.println("size=" + numbers.size() + ", capacity=" + numbers.capacity());
        }
    }
}
```

Compile and run:

```
javac GrowableIntArray.java GrowableIntArrayDemo.java
java GrowableIntArrayDemo
```

Real output, this session:

```
size=0, capacity=0
  -> grew backing array to capacity 10
size=1, capacity=10
size=2, capacity=10
size=3, capacity=10
size=4, capacity=10
size=5, capacity=10
size=6, capacity=10
size=7, capacity=10
size=8, capacity=10
size=9, capacity=10
size=10, capacity=10
  -> grew backing array to capacity 15
size=11, capacity=15
size=12, capacity=15
size=13, capacity=15
size=14, capacity=15
size=15, capacity=15
```

#### Execution Trace — Why Capacity Jumps When It Does

1. `new GrowableIntArray()` — `backingArray` starts as a real, valid,
   zero-length `int[]`, not `null`. `size` starts at `0`.
2. `numbers.add(100)` (`i = 1`) — `size == backingArray.length`
   (`0 == 0`) is true, so growth runs before anything is stored:
   `newCapacity` becomes `10` (the `size == 0` case), a brand-new
   `int[10]` is allocated, the (zero) old elements are copied over, and
   `backingArray` now points at this new array. Only now does
   `backingArray[0] = 100` run and `size` become `1` — this is why
   `capacity=10` already shows on the very first line printed.
3. `numbers.add(...)` for `i = 2` through `i = 10` — `size ==
   backingArray.length` is false every time (`size` is always less than
   `10`), so no growth happens; each call just writes into the existing
   array and increments `size`. This is why capacity holds steady at
   `10` for nine calls in a row.
4. `numbers.add(1100)` (`i = 11`) — `size == backingArray.length`
   (`10 == 10`) is true again: growth runs a second time.
   `newCapacity = size + (size / 2) = 10 + 5 = 15`, a new `int[15]` is
   allocated, all ten existing values are copied across (the real cost
   of this operation — every element, not just the new one), and *then*
   the eleventh value is written in. This is why capacity jumps straight
   from `10` to `15`, not `11`.

### Discard the Throwaway Example

Delete `GrowableIntArray.java` and `GrowableIntArrayDemo.java` — they
exist only to prove the mechanism by hand, and won't appear in the
project again.

### Connection to the Real `ArrayList`

This is not an analogy — it's the same strategy `java.util.ArrayList`
itself actually uses, verified this session by reflecting into a real
`ArrayList<String>`'s private backing array (`elementData`) after each
`add()` call: capacity starts at `0`, jumps to `10` on the very first
add, holds at `10` through the tenth element, then jumps to `15` on the
eleventh — the identical `0 → 10 → 15` curve `GrowableIntArray` just
produced, because real `ArrayList` uses the exact same "default to 10
on first growth, then grow by 50%" rule (`oldCapacity + (oldCapacity >>
1)`, the same computation as `size + (size / 2)` above). The only real
differences: real `ArrayList` stores `Object` references instead of
raw `int`s (which is what makes it work for any type, including
`Item`), and it recomputes capacity through a private method you'd need
reflection to actually call directly — the growth *rule* itself is
identical to what you just built and ran.

### Mechanical Walkthrough

- `private int[] backingArray = new int[0];` — **first appearance of a
  field initialized to a zero-length array**, worth a clause: a
  zero-length array is a real, valid, non-`null` object in Java — it
  just has nothing in it yet, which is exactly the state "no elements
  added" should start from.
- `size == backingArray.length` — **first appearance of this specific
  check**, though `==` on `int`s and `.length` on arrays are both
  already-basic. This is the entire trigger for growth: "is the backing
  array already full."
- `int newCapacity = (size == 0) ? 10 : size + (size / 2);` — **first
  appearance of the ternary operator (`? :`)**, Java's compact
  conditional-expression shorthand for "if `size == 0`, this whole
  expression evaluates to `10`; otherwise, it evaluates to `size + (size
  / 2)`" — equivalent to an `if`/`else` that assigns to `newCapacity` in
  both branches, just written as one expression instead of four lines.
- `int[] biggerArray = new int[newCapacity];` — **reappearing** (`new`
  on an array type), new detail: this allocates a second, larger array
  that coexists with the old one in memory until the copy below
  finishes.
- `for (int i = 0; i < size; i++) { biggerArray[i] = backingArray[i]; }`
  — **reappearing** loop syntax, new significance: this is the actual
  cost of growth — every existing element gets individually copied into
  the new array, not just the incoming one. An `add()` call that
  triggers growth does `size` extra work on top of storing one value; a
  call that doesn't is one array write.
- `backingArray = biggerArray;` — **reappearing** (assignment), worth a
  clause: the old, smaller array is now unreferenced by this object at
  all — it becomes eligible for garbage collection, discussed properly
  in a later lesson.
- `backingArray[size] = value; size++;` — **reappearing** (array
  indexing, increment operator), the actual store — this line runs
  identically whether or not growth just happened above it.

### CS Lens

This is **amortized constant-time growth** — the specific reason
`ArrayList.add()` is documented as "amortized O(1)" rather than a flat
O(1) like a fixed-size array write. Most calls are cheap (one write);
occasionally a call is expensive (a full copy), but because each
resize roughly multiplies capacity rather than adding a fixed amount,
the expensive calls become rarer exactly as fast as they become more
expensive, and the *average* cost per call across many calls stays
constant. Also recognized in: a hash table's own resize-and-rehash
step, a text editor's undo buffer growing in chunks instead of one
keystroke at a time, and any system that trades occasional bursty cost
for a better average — a database's write-ahead log flushing in
batches, TCP's congestion window growth.

### SE Lens

**Why grow by 50% instead of, say, exactly 1 extra slot each time an
`add()` would otherwise fail?** Growing by exactly 1 sounds like it
wastes less memory, and for a `List` that never grows past a handful of
elements, it would. But it means *every single* `add()` past the
initial capacity triggers a full copy — the O(n) cost from the trace
above, paid on every call instead of occasionally. Multiplicative growth
(50%, or a real doubling in some other languages' equivalents) means
the number of resizes needed to reach `n` elements grows only
logarithmically with `n`, not linearly — the trade is a small amount of
unused, over-allocated capacity sitting in memory at any given moment,
in exchange for `add()` staying fast at any list size this project will
ever realistically reach. This is exactly why `Item` (Lesson 7) and
every list this course builds uses `ArrayList` rather than a plain
array: the resize cost is real, but it's handled once, correctly,
inside the standard library, instead of every caller needing to
reimplement `GrowableIntArray`'s trick by hand.

---

## Connect the Pieces

Full trace through the whole 6a–6e sequence: `InventoryActivity.onCreate`
builds a `List<String>` of five names → hands it to a new
`InventoryAdapter` → assigns a `LinearLayoutManager` and that Adapter to
the `RecyclerView` from `activity_inventory.xml` (6a) → `RecyclerView`
calls `getItemCount()`, gets `5`, and calls `onCreateViewHolder` just
enough times to fill the screen (inflating `list_item_inventory.xml`
each time, wrapping the result in an `InventoryViewHolder` — 6c's
fragment, finally saved for real — that caches its `TextView`) → for
each visible position, `onBindViewHolder` reads
`itemNames.get(position)` and writes it into the *already-found*
`itemNameText` field — the exact `findViewById`-per-scroll-frame cost
6c's ViewHolder unit avoided, using `static` from 6b and `List<String>`
from 6d to make it all type-safe.

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

- [ ] The inventory screen shows a real scrolling list of five items
      through `RecyclerView`, not hardcoded views.
- [ ] You ran the `GrowableIntArray` lab yourself, saw capacity jump
      `0 → 10 → 15` in real output, and can explain why it jumps at
      those exact points instead of growing by one each call.
- [ ] You ran the `TagResolverDemo` reflection lab yourself and can
      explain, in your own words, how a tag name in an XML file becomes
      a real object without a `new` call anywhere in `LayoutInflater`'s
      own source.
- [ ] You can name what `onCreateViewHolder` and `onBindViewHolder` are
      each individually responsible for, and why splitting them enables
      recycling.
- [ ] You ran the 30-item/`Log.d` recycling proof yourself, saw
      `onCreateViewHolder` stop appearing in real Logcat output while
      scrolling, and reverted both temporary changes afterward.
- [ ] You broke `getItemCount()` on purpose, saw the blank result, and
      restored it.
- [ ] Commit: message explaining why (e.g. "Replace placeholder
      InventoryActivity with a real RecyclerView-backed item list,
      since a manual addView loop doesn't scale past a handful of
      items").

This closes the Lesson 6 sequence (6a–6e). Lesson 7 is next: the item
names are still just raw `String`s — giving inventory items their own
real type, and why a bag of parallel lists (names, quantities,
locations) would be worse.
