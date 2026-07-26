# Lesson 7: Data Deserves Its Own Type — Modeling an Item

**What you will build:** A real `Item` class (name, quantity, location)
replacing the bare `List<String>` used before, with the inventory
list now showing quantity and location alongside each name. The
transferable problem: as soon as one piece of data (an item's name)
needs *companions* (its quantity, where it's stored), the temptation is
to add a second list and a third, kept in sync by matching index. This
lesson is about why that temptation is a trap, and what a language's
class system is actually *for* — not "an OOP requirement," but a tool
for making an invalid state (a name with no matching quantity)
unrepresentable instead of just unlikely.

**What you need to know first:** Lesson 6 — specifically,
`InventoryAdapter` and `onBindViewHolder`'s dependency on
`List<String>`, which this lesson changes to `List<Item>`. Lesson 2a's
class/object/`new`/field/constructor syntax, reused here for two new,
unrelated classes. Lesson 2d's `private`. Lesson 6d's explicit casting.

**Terms introduced in this lesson:**
- **`List.remove(value)`** — removes the first element equal to the
  given value, shifting every later element one position earlier
  (contrast: `List.get(index)`, index-based lookup, already used).
- **Mutable field** — a (non-`final`) field allowed to be reassigned
  after construction (`quantity`, here — stock goes up and down).
- **Getter / accessor** — a public method whose only job is returning a
  private field's value.
- **Setter** — a public method whose only job is reassigning a private
  field's value.
- **`equals(Object other)`** — the method every class inherits from
  `Object`, overridden here to define what "equal" means for `Item`
  specifically.
- **`instanceof`** — a runtime check asking whether an object is
  actually an instance of a given type (or one of its subtypes).

---

## Concept Unit: Parallel Lists Fall Out of Sync

### The Problem

Extending the current approach the "obvious" way would mean adding
`List<String> quantities` and `List<String> locations` alongside
`itemNames`, all three kept aligned by shared index — position `2` in
every list describes the same item. Nothing in the type system enforces
that alignment. Before touching the real project, see the failure this
produces with the smallest possible example.

### Introduce the Concept in Isolation

Create a folder for this lesson's labs (plain folder, no `package`
line needed — same convention as every lab so far).
Inside it, create a file named exactly `ParallelListsDemo.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class ParallelListsDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        List<Integer> scores = new ArrayList<>();

        names.add("Alice");
        scores.add(90);
        names.add("Bob");
        scores.add(75);
        names.add("Carol");
        scores.add(88);

        // Alice dropped the class — remove her from the roster
        names.remove("Alice");
        // Bug: forgot to remove the matching score at index 0

        for (int i = 0; i < names.size(); i++) {
            System.out.println(names.get(i) + ": " + scores.get(i));
        }
    }
}
```

Compile and run it:

```
javac ParallelListsDemo.java
java ParallelListsDemo
```

Real output — verified this session:

```
Bob: 90
Carol: 75
```

#### Execution Trace

Two lists, one loop, shifted out of alignment the moment `names` lost
an element `scores` never did:

```
Iteration 1: i = 0 — names.get(0) now returns "Bob", because removing "Alice" shifted every later name one position earlier; scores.get(0) still returns 90, Alice's original score, since scores was never modified → prints "Bob: 90", pairing Bob with the wrong score.
Iteration 2: i = 1 — names.get(1) returns "Carol" for the same reason; scores.get(1) returns 75, which was Bob's original score, since scores still holds its original three values at their original indices → prints "Carol: 75", one misattribution further off than the previous line.
```

This proves the failure concretely: Bob is now shown with Alice's old
score, and Carol with Bob's — every entry after the removed one is
silently misattributed, with **no error, no warning, no crash**. The
two lists are individually completely valid `List` objects; nothing
about their types expresses that they're supposed to stay aligned.
`names.remove("Alice")` shrank `names` to two elements; `scores` still
has three, at its original indices — the loop only ever asks "what's
at position `i`," in each list independently, with no way to know the
two lists have quietly drifted apart.

### Discard the Throwaway Example

Delete `ParallelListsDemo.java` — it existed only to produce this bug
on purpose. The real project will never have parallel lists; instead,
it gets one list of one type, built next.

### Mechanical Walkthrough

- `List<String> names` / `List<Integer> scores` — **reappearing**
  (`List<T>`, `ArrayList`), two independent collections,
  the actual setup this whole bug depends on.
- `names.remove("Alice")` — **first appearance of `List.remove` by
  value** (as opposed to `List.get` by index, already used) — removes
  the first element equal to `"Alice"`, shifting every later element
  one position earlier. `scores` has no matching call, on purpose —
  this is the bug.
- `for (int i = 0; i < names.size(); i++)` — **reappearing** loop
  syntax (already-basic).
- `names.get(i) + ": " + scores.get(i)` — **reappearing** (`List.get`,
  string concatenation) — reads both lists at the *same* index `i`,
  which is exactly the assumption `names.remove(...)` just broke.

### CS Lens

This is a concrete case of **making illegal states representable** —
the type system (`List<String>` and `List<Integer>` as two independent
collections) permits a state (a name with no corresponding score, or
the wrong one) that is never actually valid in your program's logic.
Also recognized in: database tables lacking a foreign-key constraint
that *should* tie two rows together, two Git branches that must be
merged together manually versus a single source of truth, and any pair
of variables a comment says "keep these in sync" about instead of the
compiler enforcing it.

### SE Lens

**Why does this deserve a whole class, instead of just being more
careful with removal order — write `scores.remove(0)` right next to
`names.remove("Alice")` and move on?** "Be more careful" is not an
engineering control; it's a hope. It requires every single place in a
growing codebase that touches either list to remember the rule, every
time, forever — including code a teammate writes six months from now
without having read this exact comment. `ParallelListsDemo`'s bug is
one line away from never happening (a single forgotten
`scores.remove(...)`), which is exactly the problem: a fix that relies
on a human remembering a convention, with nothing checking it, fails
silently and rarely, which is the worst combination — rare enough to
pass testing, common enough to eventually hit production.

---

## Concept Unit: Encapsulation — One Object, Fields Bundled Together

### The Problem

The fix is to give one inventory entry a single Java object holding all
three of its fields together, so "remove an item" means removing one
object from one list — impossible to misalign, because there's nothing
left to misalign.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `app/src/main/java/.../Item.java`.
- **Change type:** Create.
- **Dependencies:** none new.

### The New Code

```java
package com.yourname.pocketinventory;

public class Item {
    private final String name;
    private int quantity;
    private final String location;

    public Item(String name, int quantity, String location) {
        this.name = name;
        this.quantity = quantity;
        this.location = location;
    }

    public String getName() {
        return name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getLocation() {
        return location;
    }
}
```

### The Updated Project

This is the whole new file — nothing larger to show it landing inside
yet.

### Introduce the Concept in Isolation

`Item.java` just used a shape worth seeing on its own, away from this
project's specific fields: some private data, reachable only through
methods this class itself chooses to expose. Create a folder for this
lab (same convention as always). Inside it, create a file named exactly
`Coupon.java` — a class that has nothing to do with Pocket Inventory,
deliberately, so the *pattern* is visible without this project's
details riding along:

```java
public class Coupon {
    private final String code;
    private int usesRemaining;

    public Coupon(String code, int usesRemaining) {
        this.code = code;
        this.usesRemaining = usesRemaining;
    }

    public String getCode() {
        return code;
    }

    public int getUsesRemaining() {
        return usesRemaining;
    }

    public void setUsesRemaining(int usesRemaining) {
        this.usesRemaining = usesRemaining;
    }
}
```

Create `CouponDemo.java` in the same folder:

```java
public class CouponDemo {
    public static void main(String[] args) {
        Coupon summer = new Coupon("SUMMER10", 3);
        System.out.println(summer.getCode() + ": " + summer.getUsesRemaining() + " uses left");

        summer.setUsesRemaining(summer.getUsesRemaining() - 1);
        System.out.println("After one redemption: " + summer.getUsesRemaining());

        // summer.code = "HACKED";  // would not compile: code is private, no setter
    }
}
```

Compile and run:

```
javac Coupon.java CouponDemo.java
java CouponDemo
```

Real output — verified this session:

```
SUMMER10: 3 uses left
After one redemption: 2
```

#### Execution Trace

`usesRemaining` is mutated state carried across these four lines, not a
single isolated call — worth walking through exactly, not just trusting
the two printed lines:

1. `Coupon summer = new Coupon("SUMMER10", 3);` — builds a real `Coupon`
   object; `usesRemaining` starts at `3`.
2. `System.out.println(summer.getCode() + ...)` — reads the object's
   *current* state and prints it: `SUMMER10: 3 uses left`.
3. `summer.setUsesRemaining(summer.getUsesRemaining() - 1);` — reads the
   current value (`3`), computes `3 - 1 = 2`, and writes `2` back into
   that *same* object's `usesRemaining` field.
4. `System.out.println("After one redemption: " + summer.getUsesRemaining());`
   — reads the field again. It's now `2`, proving step 3's mutation
   actually stuck: `After one redemption: 2`.

*What this proves:* `Coupon` is the exact same shape `Item.java` above
just used, with different field names — `code`, like `Item`'s `name`
and `location`, is `private final` with a getter and no setter, because
a coupon's code shouldn't change after it's created. `usesRemaining`,
like `Item`'s `quantity`, is `private` (not `final`) with both a getter
and a setter, because it's expected to change over the object's life.
The commented-out `summer.code = "HACKED"` line, if uncommented, would
fail to compile — `code` is private, and `CouponDemo` is a different
class, with no special access to it. This is the mechanism, seen away
from Pocket Inventory's specifics: `Item`'s fields are just as
unreachable from `InventoryActivity` as `Coupon`'s `code` is from
`CouponDemo`, for the identical reason.

### Discard the Throwaway Example

Delete `Coupon.java` and `CouponDemo.java` — `Item.java` above is the
real version of this same shape; nothing here is reused.

### Mechanical Walkthrough

- `private final String name;` / `private final String location;` —
  **reappearing** (`private final` field, same idea as
  `InventoryAdapter.itemNames`), applied here to two fields that should
  never change after construction — a name or storage location being
  edited in place isn't a real operation this app needs (renaming would
  instead mean replacing the whole `Item`, a later-lesson concern).
- `private int quantity;` — **first appearance of a mutable
  (non-`final`) field.** Deliberately different from the two above:
  quantity *does* need to change over the item's life (stock goes up
  and down), so it's left reassignable.
- `public Item(String name, int quantity, String location) { ... }` —
  reappearing (constructor), new detail worth a clause:
  three parameters this time, each assigned to its matching field via
  `this.` disambiguation.
- `public String getName()`, `public int getQuantity()`,
  `public String getLocation()` — **first appearance of the
  getter/accessor pattern**, as a group: a public method whose only job
  is returning a private field's value — the exact shape `Coupon.getCode()`
  and `Coupon.getUsesRemaining()` just proved in isolation. This is the
  actual mechanism of **encapsulation**: `name` and `location` are
  `private`, meaning code outside this class cannot read or
  write them directly — the only way in is through the methods this
  class chooses to expose.
- `public void setQuantity(int quantity)` — **first appearance of the
  setter pattern.** The deliberate asymmetry with the two getters-only
  fields is the point: this class's public surface *is* its rules —
  anyone holding an `Item` can change how much of it there is, but not
  rename it or relocate it, without that class needing to write a
  single `if` statement to enforce it. The type itself expresses the
  rule.

### CS Lens

Bundling related fields behind a controlled public interface is
**encapsulation**, one of the foundational ideas of object-oriented
design — the object's internal representation (three private fields)
is separated from what the outside world is allowed to do to it
(getters, one setter). Also recognized in: a class's private
implementation details versus its public API contract in any language,
a database view exposing only certain columns of an underlying table,
and network protocol layering (each layer exposes an interface without
revealing its internal implementation to the layer above).

### SE Lens

**Why not just make all three fields `public` and skip the getter/setter
ceremony entirely** — Java allows this, and for a true one-off script
it's tempting? The alternative — public fields — means *any* code
anywhere in the project can reach in and set `item.quantity = -50` or
reassign `item.name` after the fact, with nothing to stop it, because
there's no single chokepoint to add a rule later (e.g. "quantity can
never go negative"). Getters and setters cost you boilerplate now —
five extra methods for three fields — in exchange for a single place
to add validation later without touching every caller. This project
doesn't add that validation yet (Lesson 9 will, for user-entered
quantities); the point right now is that the *seam* exists to add it
into, which a public field would not provide.

---

## Concept Unit: `equals()` and `hashCode()` — What "Same" Means for Objects

### The Problem

`Item`, as just built, has no `equals()` or `hashCode()` override —
every class automatically inherits `Object`'s default versions the
moment it's declared, and you never wrote either one. That matters the
moment you need to ask "is this the same item the user tapped?" or,
later, store `Item`s in a collection that checks for duplicates.
`Object`'s inherited default compares by **reference identity** — "do
these two variables point at the exact same object in memory?" — never
by field values, which means two `Item`s built from identical name,
quantity, and location would compare as different, silently, with
nothing about their actual data considered at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Item.java`.
- **Change type:** Add.
- **Location:** Below the existing getters/setter.

### The New Code

```java
@Override
public boolean equals(Object other) {
    if (this == other) return true;
    if (!(other instanceof Item)) return false;
    Item that = (Item) other;
    return quantity == that.quantity
            && name.equals(that.name)
            && location.equals(that.location);
}

@Override
public int hashCode() {
    return java.util.Objects.hash(name, quantity, location);
}
```

### The Updated Project

```java
public class Item {
    private final String name;
    private int quantity;
    private final String location;

    public Item(String name, int quantity, String location) {
        this.name = name;
        this.quantity = quantity;
        this.location = location;
    }

    public String getName() {
        return name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getLocation() {
        return location;
    }

    @Override
    public boolean equals(Object other) {                              // ← new
        if (this == other) return true;                                 // ← new
        if (!(other instanceof Item)) return false;                     // ← new
        Item that = (Item) other;                                       // ← new
        return quantity == that.quantity                                // ← new
                && name.equals(that.name)                                // ← new
                && location.equals(that.location);                       // ← new
    }                                                                    // ← new

    @Override
    public int hashCode() {                                             // ← new
        return java.util.Objects.hash(name, quantity, location);        // ← new
    }                                                                    // ← new
}
```

`Item` as a whole now supports both identity (`==`, unchanged, still
reference-based) and **value equality** (`.equals()`, now field-based)
— two different, deliberately distinct questions you can ask about any
two `Item`s.

### Introduce the Concept in Isolation

See the exact fix `Item.java` just received, on a smaller, unrelated
class, so the mechanism is visible with only two fields instead of
three. Create a folder for this lab. Inside it, create
`CoordinateBad.java` — a class with no `equals()` override at all,
matching what `Item` looked like *before* this unit's change:

```java
public class CoordinateBad {
    private final int x;
    private final int y;

    public CoordinateBad(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
```

Create `CoordinateBadDemo.java`:

```java
public class CoordinateBadDemo {
    public static void main(String[] args) {
        CoordinateBad a = new CoordinateBad(3, 4);
        CoordinateBad b = new CoordinateBad(3, 4);
        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}
```

Compile and run:

```
javac CoordinateBad.java CoordinateBadDemo.java
java CoordinateBadDemo
```

Real output — verified this session:

```
false
false
```

#### Execution Trace

Two constructions, same values, both checks say "different":

```
Iteration 1: new CoordinateBad(3, 4) runs the constructor, which sets a.x = 3 and a.y = 4 on a freshly allocated object.
Iteration 2: new CoordinateBad(3, 4) runs the constructor again with identical arguments, producing the same field values (b.x = 3, b.y = 4) — but since each new call allocates its own distinct object, a and b sit at two different memory locations even though every field matches, which is why the equality checks below both come back false.
```

`a == b` is `false` because `a` and `b` are two separate objects in
memory — expected, and unrelated to what either one contains. `a.equals(b)`
is *also* `false`, which is the surprising part: `Object`'s inherited
`.equals()` defaults to doing exactly the same reference check `==`
does, so it gives the identical answer even though every field matches.

Now delete `CoordinateBad.java` and `CoordinateBadDemo.java`, and, in
the same folder, create `Coordinate.java` — the fixed version, using
the exact pattern `Item.java` just added:

```java
public class Coordinate {
    private final int x;
    private final int y;

    public Coordinate(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof Coordinate)) return false;
        Coordinate that = (Coordinate) other;
        return x == that.x && y == that.y;
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(x, y);
    }
}
```

Create `CoordinateDemo.java`:

```java
public class CoordinateDemo {
    public static void main(String[] args) {
        Coordinate a = new Coordinate(3, 4);
        Coordinate b = new Coordinate(3, 4);
        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}
```

Compile and run:

```
javac Coordinate.java CoordinateDemo.java
java CoordinateDemo
```

Real output — verified this session:

```
false
true
```

*What this proves:* `a == b` is still `false` — identity never changes,
and shouldn't; `a` and `b` remain two separate objects. `a.equals(b)`
now reads `true` — the exact fix `Item.equals()` just gave `Item`,
proven here on a simpler, two-field class so the mechanism is visible
without `Item`'s extra field riding along. `Item` and `Coordinate` now
both support the same two, deliberately distinct questions: "are these
the same object?" (`==`, unchanged) and "do these hold the same data?"
(`.equals()`, now field-based).

### Discard the Throwaway Example

Delete `CoordinateBad.java`, `CoordinateBadDemo.java`, `Coordinate.java`,
and `CoordinateDemo.java` — nothing here is reused; `Item.java`'s own
`equals()`/`hashCode()`, built above, are the real versions.

### Mechanical Walkthrough

- `equals(Object other)` — **first appearance of overriding `Object`'s
  `equals`.** Parameter type is `Object`, not `Item` — this is a fixed
  part of the contract inherited from Java's root class; you can't
  narrow the parameter type here.
- `if (this == other) return true;` — **first appearance of this
  specific guard**, worth a clause: a cheap short-circuit — if it's
  literally the same object, skip the field comparisons entirely.
- `!(other instanceof Item)` — **first appearance of `instanceof`.** A
  runtime type check: "is `other` actually an `Item` (or a subclass)?"
  Necessary because `other`'s declared type is the generic `Object` —
  it could be a `String`, an `Integer`, anything — and comparing fields
  against something that isn't even an `Item` would be a compile error
  without first narrowing the type.
- `Item that = (Item) other;` — **reappearing** explicit cast — same
  mechanism as `(Integer) box.get()` earlier — `(Item)` tells the compiler "trust
  me, treat this `Object` reference as an `Item` from here on," safe
  here specifically because the `instanceof` check just above already
  confirmed it.
- `quantity == that.quantity` — **reappearing** (`==` on primitives,
  already-basic) — correct here specifically because `int` is a
  primitive, not an object, so `==` already means value comparison,
  unlike the `Item a == b` case above.
- `name.equals(that.name)` / `location.equals(that.location)` —
  **reappearing** (`.equals()` call syntax), applied to `String`, which
  — worth restating — already has its *own* correctly-implemented
  `equals()` overriding the same default `Object` behavior you just
  fixed on `Item`; that's why comparing two `String`s with `.equals()`
  has always given the sensible answer, even before this lesson
  explained why.
- `java.util.Objects.hash(name, quantity, location)` — **first
  appearance.** A standard-library helper that combines multiple
  values' individual hash codes into one — you're not expected to
  hand-write a hash-combining algorithm; this is the conventional way
  to implement `hashCode()` once you know which fields `equals()` uses.

### CS Lens

**This is a hard concept — object identity versus value equality —
and it recurs constantly:** the general question "are these two things
the same?" has two legitimately different answers depending on what
"same" means for your purpose. Also recognized in: Python's `is` versus
`==`, JavaScript's `===` on objects versus deep-equality library
functions, database rows compared by primary key (identity) versus by
full column contents (value), and version-control diffing (are two
files "the same" because they're byte-identical, or because a rename
detector says they represent "the same" logical file across a commit?).

### SE Lens

**Why does `hashCode()` have to be overridden too, instead of just
`equals()`?** Skipping it isn't a compile error — the code above would
still compile without `hashCode()` — but Java's contract requires that
two objects considered `.equals()` must also return the *same*
`hashCode()`. Hash-based collections (`HashSet`, `HashMap` — not used
yet in this project, but coming) rely on that contract to find objects
efficiently: they use `hashCode()` first to narrow down *where* an
object might be, then `equals()` to confirm. Break the contract (override
`equals()` alone) and such a collection can report `false` for
`set.contains(item)` even when an `.equals()`-equal item is genuinely
inside it — a bug that only surfaces once those collections enter the
project, which is precisely the kind of "correct today, silently broken
later" trap this lesson's opening parallel-lists bug was also an
example of.

---

## Concept Unit: Wiring `Item` Into the List You Already Built

### The Problem

`InventoryAdapter` and `InventoryActivity` still work in terms of
`List<String>`. Time to upgrade both to the real type.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `list_item_inventory.xml`, `InventoryAdapter.java`,
  `InventoryActivity.java`.
- **Change type:** Modify.
- **Dependencies:** `Item.java`, just built.

### The New Code — Row Layout Gains Two More Labels

Replace `list_item_inventory.xml`'s contents:

```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="vertical"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:padding="16dp">

    <TextView
        android:id="@+id/itemNameText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="18sp" />

    <TextView
        android:id="@+id/itemDetailText"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:textSize="14sp" />

</LinearLayout>
```

### The Updated Project

Where the row's root used to be a single `TextView`, the root is
now a `LinearLayout` (reappearing — the same container from the throwaway
`addView` lab, now landing in the real project for real) stacking two
`TextView`s vertically — the item name at 18sp, and a second line at
14sp for quantity and location.

### Mechanical Walkthrough

- `<LinearLayout ... android:orientation="vertical">` — **reappearing**,
  now permanent: `orientation="vertical"` stacks children
  top-to-bottom, as opposed to `ConstraintLayout`'s relationship-based
  positioning — a simpler container appropriate when
  children just need to flow in one direction, not participate in
  complex constraint relationships.
- Two `TextView`s, `android:padding` on the parent instead of each
  child — all reappearing from earlier lessons.

### The New Code — Adapter Reads `Item` Fields

In `InventoryAdapter.java`, change the field type and `onBindViewHolder`:

```java
private final List<Item> items;

InventoryAdapter(List<Item> items) {
    this.items = items;
}
```

```java
@Override
public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
    Item item = items.get(position);
    holder.itemNameText.setText(item.getName());
    holder.itemDetailText.setText("Qty: " + item.getQuantity() + " — " + item.getLocation());
}
```

And in the `ViewHolder`, cache the second `TextView` too:

```java
static class InventoryViewHolder extends RecyclerView.ViewHolder {
    TextView itemNameText;
    TextView itemDetailText;

    InventoryViewHolder(View itemView) {
        super(itemView);
        itemNameText = itemView.findViewById(R.id.itemNameText);
        itemDetailText = itemView.findViewById(R.id.itemDetailText);
    }
}
```

### The Updated Project

```java
public class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {
    private final List<Item> items;                                     // ← changed from List<String>

    InventoryAdapter(List<Item> items) {                                  // ← changed
        this.items = items;                                               // ← changed
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
        Item item = items.get(position);                                                          // ← new
        holder.itemNameText.setText(item.getName());                                               // ← changed
        holder.itemDetailText.setText("Qty: " + item.getQuantity() + " — " + item.getLocation());  // ← new
    }

    @Override
    public int getItemCount() {
        return items.size();                                              // ← changed
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        TextView itemNameText;
        TextView itemDetailText;                                          // ← new

        InventoryViewHolder(View itemView) {
            super(itemView);
            itemNameText = itemView.findViewById(R.id.itemNameText);
            itemDetailText = itemView.findViewById(R.id.itemDetailText);  // ← new
        }
    }
}
```

`onBindViewHolder` now pulls a whole `Item` object per row instead of a
bare `String`, reading its three fields through the getters built
earlier this lesson — the exact encapsulated access path that unit
argued for, now actually exercised.

### Mechanical Walkthrough

- `Item item = items.get(position);` — reappearing (`List.get`),
  new element type.
- `item.getName()`, `item.getQuantity()`, `item.getLocation()` —
  reappearing (getter calls, defined earlier this lesson), first real
  use outside `Item.java` itself.
- String concatenation building
  `"Qty: " + item.getQuantity() + " — " + item.getLocation()` —
  reappearing (`+` string building, same as the tap counter earlier).

### The New Code — Activity Builds Real Items

In `InventoryActivity.java`, replace the `List<String>` block:

```java
List<Item> items = new ArrayList<>();
items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));
items.add(new Item("Shop Rags", 12, "Shelf B"));
items.add(new Item("Cutting Oil", 3, "Shelf B"));
items.add(new Item("Digital Calipers", 2, "Toolbox 1"));
items.add(new Item("Safety Glasses", 8, "Shelf A"));

RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
recyclerView.setLayoutManager(new LinearLayoutManager(this));
recyclerView.setAdapter(new InventoryAdapter(items));
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<Item> items = new ArrayList<>();                              // ← changed
        items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));                 // ← changed
        items.add(new Item("Shop Rags", 12, "Shelf B"));                    // ← changed
        items.add(new Item("Cutting Oil", 3, "Shelf B"));                   // ← changed
        items.add(new Item("Digital Calipers", 2, "Toolbox 1"));            // ← changed
        items.add(new Item("Safety Glasses", 8, "Shelf A"));                // ← changed

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(new InventoryAdapter(items));               // ← changed (List<Item> now)
    }
}
```

### Mechanical Walkthrough

- `new Item("Hex Bolts, M6", 240, "Bin 4")` and its four siblings —
  reappearing (constructor call), first real use of `Item`'s
  own constructor outside a throwaway lab.
- Everything else (`ArrayList`, `RecyclerView`, `LinearLayoutManager`,
  `setAdapter`) — reappearing, unchanged except the
  element type.

### SE Lens

**`onBindViewHolder` calls three separate getters and builds the
display string itself — why not add one method to `Item`, like
`getDisplayText()`, that returns `"Qty: 240 — Bin 4"` already
formatted, and call just that?** It would be less code right here. The
cost is what it does to `Item`'s job: `Item` is this project's data
model — it should describe *what an inventory item is*, not *how one
specific screen wants to show it*. Baking `"Qty: " + quantity + " — " + location`
into `Item` ties the model to one exact display format; the moment a
second screen wants to show items differently (a compact list with no
labels, a search-results screen showing only the name), either it's
stuck with `Item`'s one hardcoded string, or `Item` grows a second
formatting method, then a third. Leaving formatting in the Adapter —
the layer that actually owns "how a row looks" — keeps `Item` reusable
across every future screen that reads it, at the cost of the
formatting logic living one file away from the data it formats.

### Run It

Run the app. Each row now shows two lines: the item name, and
"Qty: N — Location" beneath it, sourced from real `Item` objects
instead of bare strings — the parallel-lists trap from this lesson's
opening never had a chance to exist, because there was only ever one
list.

---

## Connect the Pieces

Full trace: `InventoryActivity` builds five `Item` objects, each one
bundling a name, quantity, and location that can never drift apart from
each other, because they live inside one object rather than three
synchronized lists → `InventoryAdapter` (upgraded from before) holds
that `List<Item>` and, in `onBindViewHolder`, calls `item.getName()`,
`item.getQuantity()`, `item.getLocation()` — the public, encapsulated
surface `Item.java` deliberately exposes — to fill in the two-line row
layout, never once reaching into a private field directly.

## What Breaks Without This

In `Item.java`, temporarily delete the `equals()` override (leave
`hashCode()`). Add this scratch check somewhere reachable, like the top
of `InventoryActivity.onCreate` (remove it afterward):
`Log.d("Check", "" + new Item("x", 1, "y").equals(new Item("x", 1, "y")));`
— confirm it logs `false`, the default reference-identity behavior,
even though every field matches. Restore `equals()` afterward and
confirm the same line now logs `true`.

## Exercises

1. Add a fourth field to `Item`, `String sku`, with a getter but no
   setter (SKUs shouldn't change after creation). Update the
   constructor, all five `new Item(...)` calls in `InventoryActivity`,
   and `equals()`/`hashCode()` to include it. This is intentionally
   tedious — notice how many places one new field touches, which is a
   preview of why later lessons introduce tools that reduce this kind
   of manual repetition.
2. Write a throwaway `main()` method (anywhere temporary, discarded
   after) that builds two `Item`s with the same values, puts them both
   into a `java.util.HashSet<Item>`, and prints `set.size()`. Predict
   the result before running it — should adding a "duplicate" `Item`
   actually grow the set? Real output, verified this session, for the
   `Item` this lesson built: `1` — confirm your own run matches, and
   explain why in terms of this lesson's `equals()`/`hashCode()` work.

## Definition of Done

- [ ] `Item.java` exists with three fields, a constructor, appropriate
      getters/setter, and correct `equals()`/`hashCode()`.
- [ ] You ran the `ParallelListsDemo` lab yourself and saw the real
      misattribution bug.
- [ ] You ran the `Coupon` and `Coordinate` labs yourself and can
      explain how each relates back to `Item.java`.
- [ ] The inventory list on screen shows real quantity and location per
      row, sourced from `Item` objects.
- [ ] You can explain the difference between `==` and `.equals()` on
      objects, in your own words, using a concrete example.
- [ ] Commit: message explaining why (e.g. "Replace parallel-list-prone
      String items with a real Item type, encapsulating name/quantity/
      location and defining value equality").

Lesson 8 is next: tapping a row to see its full detail on a second
screen — passing an actual `Item` between Activities, and why that's
not as simple as passing a `String` was before.
