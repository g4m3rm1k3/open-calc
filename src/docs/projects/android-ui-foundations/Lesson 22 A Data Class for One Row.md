# Lesson 22: A Data Class for One Row

**What you will build:** `InventoryItem`, a small class representing one
row of grid data, and a populated `ArrayList<InventoryItem>` of sample
rows — the real data this milestone's grid will display. The
transferable problem: a grid row conceptually needs more than one piece
of data (a name and a quantity, at minimum) traveling together as a
single unit. Java gives you more than one real way to define such a
type, and the newest one is worth knowing even though this project uses
the older, more broadly compatible form.

**What you need to know first:** Lesson 02 (`new`, references),
Lesson 13 (fields, `private`), Lesson 19 (method overloading),
Lesson 20 (`ArrayList<E>`), Lesson 21 (package-private access).

**Terms introduced in this lesson:**
- **Constructor** — a special method, matching the class's own name,
  called by `new` to initialize a newly created object's fields.
- **Getter method** — a method whose only job is returning a field's
  current value, the controlled read-access `private` fields (Lesson 13)
  require.
- **`record` (recognition, real alternative)** — a newer, more compact
  Java syntax for exactly this "a few named fields traveling together"
  case, generating a constructor, getters, and more automatically.

**Objects and methods used**
- `System.out.println(...)` — Java's static print method, Lesson 01 —
  `private` — visible only inside the declaring class, Lesson 13 —
  `final` on a field — assignable once, never after, Lesson 13 — and
  `this` — the currently-running object, first met disambiguating a
  constructor parameter from a same-named field, Lesson 16 — all
  reappear here exactly as already taught. Constructors and getter
  methods are this lesson's own subject, given full treatment below.

---

## Concept Unit: A Class With No Behavior, Just Data

### The Problem

The grid needs to hold, per row, at least an item name and a quantity —
two related pieces of data that should travel together as one thing, not
as two separately tracked, easily-mismatched lists (a list of names and a
parallel list of quantities, where index 3 in one list has to correspond
to index 3 in the other, entirely by convention and easy to break).

### Introduce the Concept in Isolation

```java
class Point {
    private final int x;
    private final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    int getX() {
        return x;
    }

    int getY() {
        return y;
    }
}

public class ConstructorDemo {
    public static void main(String[] args) {
        Point origin = new Point(0, 0);
        Point corner = new Point(10, 20);

        System.out.println(origin.getX() + ", " + origin.getY());
        System.out.println(corner.getX() + ", " + corner.getY());
    }
}
```

Compile and run:

```
javac ConstructorDemo.java
java ConstructorDemo
```

Real output:

```
0, 0
10, 20
```

#### Execution Trace

1. `Point origin = new Point(0, 0);` — `new` allocates a real `Point`
   object and runs the constructor with `x = 0`, `y = 0`; `this.x = x`
   and `this.y = y` copy those parameters into `origin`'s own fields.
2. `Point corner = new Point(10, 20);` — a second, independent call to
   `new Point(...)`, allocating a *different* object with its own
   fields — `x = 10`, `y = 20` — because every `new` call, per Lesson
   02, allocates a fresh object regardless of what any earlier call did.
3. `origin.getX() + ", " + origin.getY()` — reads `origin`'s own fields
   (`0`, `0`), untouched by step 2's separate allocation.
4. `corner.getX() + ", " + corner.getY()` — reads `corner`'s own fields
   (`10`, `20`) — proof, not assertion, that the two objects hold
   genuinely independent state.

### Mechanical Walkthrough

`Point(int x, int y) { ... }` is a **constructor**: a method sharing the
class's exact name, with no return type at all (not even `void`),
called specifically by `new`. `new Point(0, 0)` allocates a brand-new
`Point` object in memory and runs this constructor on it, passing `0`
and `0` as `x` and `y`. Inside the constructor, `this.x = x;` — **first
appearance of `this` as a disambiguator** (Lesson 16 used `this` to refer
to the enclosing Activity; here it plays a related but distinct role):
the parameter `x` and the field `x` share the same name on purpose (a
common, deliberate style), and `this.x` specifically means "the field
belonging to *this* object," disambiguating it from the plain `x`, which
refers to the just-passed parameter. `origin` and `corner` are two
separate `Point` objects, each with its own independent copy of `x` and
`y` — creating `corner` didn't affect `origin` at all, direct proof that
each `new` call produces a genuinely distinct object. `getX()`/`getY()`
are **getter methods** — Lesson 13's `private` fields require exactly
this kind of controlled access method to be read from outside the class
at all.

### Discard the Throwaway Example

Deleted now — the concept carries forward, this exact `Point` class does
not.

### CS Lens

A constructor guaranteeing every object starts in a valid, fully
initialized state is part of **encapsulation** (Lesson 13's concept,
reappearing): rather than creating a bare object and hoping calling code
remembers to set every field afterward, the constructor makes "provide an
`x` and a `y`" a requirement enforced by the compiler — there is no way
to call `new Point()` with no arguments once a constructor requiring
two `int`s is declared.

Also recognized in: every object-oriented language's constructor concept
(C++, C#, Python's `__init__`), and the general design principle that
an object should never exist in a legitimately invalid, half-initialized
state.

### SE Lens

Why require a constructor at all, instead of letting code construct a
bare `Point` and set `x`/`y` afterward through setter methods? A
required constructor makes "valid state" and "exists at all" the same
guaranteed moment — there is no window where a `Point` object exists
with an unset `x` or `y` that some other code could accidentally read
first. Combined with `final` fields (no setter possible at all after
construction), this specific class doesn't just default to being
initialized correctly — it's structurally incapable of ever being
anything else.

---

## Concept Unit: `record` — a Real, Newer Alternative

### The Problem

`Point` above required four separate pieces (two fields, a constructor,
two getters) to express one simple idea: "a pair of numbers traveling
together." Java 16 added dedicated, more compact syntax for exactly this
common case.

### The Alternative, Shown for Real

```java
record Point(int x, int y) {}
```

This single line generates, automatically: two `private final` fields
(`x` and `y`), a constructor taking both, and getter methods — though
generated getters are named `x()` and `y()` (matching the field names
directly, no `get` prefix), not `getX()`/`getY()`. It also automatically
generates a correct `equals()`, `hashCode()`, and `toString()` — three
methods this lesson's `Point` class didn't write at all, and would need
to, to compare two `Point`s for equality correctly or print one
usefully.

```java
Point origin = new Point(0, 0);
System.out.println(origin.x() + ", " + origin.y());
```

### The Tradeoff

A `record` is dramatically less to type and automatically correct on
several fronts (`equals`/`hashCode`/`toString`) the classic class version
above left unwritten and, if ever needed, easy to get subtly wrong by
hand. Its real costs: every field in a `record` is implicitly `final`
and the class is implicitly immutable — no field can ever be reassigned
after construction, which is exactly right for a value like a
coordinate pair but would be actively wrong for a class that needs to
change its own state after creation. It's also genuinely newer syntax:
using it requires a Java language level Android Studio's project
configuration must explicitly support, and older tutorials, Stack
Overflow answers, and existing codebases you'll read overwhelmingly still
use the classic constructor-plus-getters form this lesson taught first.

**This project uses the classic class form**, both because `InventoryItem`
below benefits from being genuinely mutable later (Milestone 5 edits a
row's quantity in place) and because the classic form is what the
overwhelming majority of real, existing Android code you'll encounter
outside this series actually uses. A `record` is the right, real choice
for a value that's fully known at creation and never changes afterward —
exactly this lesson's own `Point` example, if it were being written fresh
today.

### Project Change

- **Reference Source:** No reference counterpart — `InventoryItem` is an
  application-specific class you're authoring from scratch, not
  overriding or implementing a framework type.
- **Files affected:** New file
  `app/src/main/java/com/yourname/yourapp/InventoryItem.java`;
  `InventoryActivity.java` (populate a sample list).
- **Change type:** Create one new file; add code to an existing one.
- **Dependencies:** None new.

### The New Code

`InventoryItem.java`:

```java
package com.yourname.yourapp;

class InventoryItem {
    private String name;
    private int quantity;

    InventoryItem(String name, int quantity) {
        this.name = name;
        this.quantity = quantity;
    }

    String getName() {
        return name;
    }

    int getQuantity() {
        return quantity;
    }

    void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
```

In `InventoryActivity.java`, inside `onCreate`, after `setContentView`:

```java
List<InventoryItem> items = new ArrayList<>();
items.add(new InventoryItem("Bolts", 120));
items.add(new InventoryItem("Washers", 85));
items.add(new InventoryItem("Nuts", 200));
```

### The Updated Project

```java
package com.yourname.yourapp;

public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<InventoryItem> items = new ArrayList<>();  // ← new
        items.add(new InventoryItem("Bolts", 120));      // ← new
        items.add(new InventoryItem("Washers", 85));     // ← new
        items.add(new InventoryItem("Nuts", 200));        // ← new
    }
}
```

`InventoryActivity` now builds a real, populated list of three sample
rows every time it's created — not connected to anything visible on
screen yet; the next two lessons build the `Adapter` that actually
displays this list.

### Mechanical Walkthrough

- `class InventoryItem` — no `public` modifier: Lesson 21's
  package-private access, reappearing on a real project class. Since
  nothing outside this app's own package will ever need `InventoryItem`,
  package-private is the deliberately narrowest modifier that still
  works — reachable from anything else in `com.yourname.yourapp`,
  invisible outside it, exactly the boundary Lesson 21 proved with a
  real compiler error.
- `private String name; private int quantity;` — reappearing (Lesson 13's
  fields and `private`), silently reusable.
- `InventoryItem(String name, int quantity) { ... }` — reappearing
  (this lesson's own constructor concept, from the `Point` lab above),
  same `this.field = parameter` disambiguation pattern.
- `getName()`, `getQuantity()` — reappearing getter pattern.
- `void setQuantity(int quantity) { this.quantity = quantity; }` —
  **first appearance of a setter method.** The mirror image of a getter:
  a controlled *write* to a `private` field, needed here (unlike the
  immutable `Point` lab) because Milestone 5 changes a row's quantity
  after the row already exists — proof that `InventoryItem` was
  deliberately built mutable, unlike the `record` alternative shown
  above, which cannot support this method at all without extra
  workaround code.
- `new ArrayList<>()`, `.add(...)` — reappearing (Lesson 20), the same
  generic collection now holding a real application type instead of
  `String`.
- `new InventoryItem("Bolts", 120)` — reappearing `new`, now constructing
  a real project object rather than a `Point` or an `Animal`.

### SE Lens

**Why write a setter only for `quantity` and not for `name`?** This is a
deliberate, minimal-surface design decision, not an oversight: nothing in
this project's actual requirements ever needs to rename an existing row
after creation, only to adjust its quantity. Adding a `setName` "just in
case" would widen this class's mutable surface with no real requirement
driving it — the same **minimize the public surface** reasoning
Lesson 13's SE Lens already applied to fields, now applied to which
*methods* a class chooses to expose, not just which fields.

---

## Connect the Pieces

One trace: `InventoryItem`'s constructor (this lesson's own concept)
guarantees every row object is created with both a name and a starting
quantity — no half-built row can ever exist. `new InventoryItem("Bolts", 120)`
(reappearing `new`) builds three such objects, added into an
`ArrayList<InventoryItem>` (Lesson 20's generic collection, now holding a
real type instead of `String`). This populated list is the exact,
concrete data the next lesson's `RecyclerView.Adapter` will read from.

## What Breaks Without This

Remove the constructor from `InventoryItem` entirely, leaving only the
fields and methods, and try to compile
`new InventoryItem("Bolts", 120)`. Real error:

```
error: constructor InventoryItem in class InventoryItem cannot be applied to given types;
  required: no arguments
  found: String,int
```

This proves a real, easy-to-miss Java rule: a class with **no**
constructor written at all still compiles, because Java silently
supplies a default, no-argument constructor — but the moment any
constructor is written by hand, that automatic default disappears
entirely, and only the constructor(s) actually written remain callable.
Restore the two-argument constructor before moving on.

## Exercises

1. Rewrite `InventoryItem` as a `record` in a throwaway scratch file
   (never the real project), confirm it compiles and that
   `.x()`/`.y()`-style accessors work, then delete the scratch file —
   direct, hands-on confirmation of this lesson's tradeoff discussion,
   not just the written claim.
2. Add a fourth sample item with a negative quantity (e.g.,
   `new InventoryItem("Broken Widget", -5)`) and confirm the constructor
   accepts it without complaint — proving, concretely, that this
   constructor validates *nothing* about the values it's given beyond
   their types, a real, honest limitation worth knowing rather than
   assuming "the constructor probably checks that."

## Definition of Done

- [ ] You ran the `Point`/`ConstructorDemo` lab and can explain what
      `this.x = x;` disambiguates and why.
- [ ] You triggered the real "cannot be applied to given types" error
      from a removed constructor, and restored it.
- [ ] You can state one concrete reason this project chose a classic
      class over a `record` for `InventoryItem`.
- [ ] `InventoryActivity` now builds a real, populated
      `ArrayList<InventoryItem>` of three sample rows on every launch —
      not visible yet, confirmed only by a temporary `Log.d` if you
      want to check it.
- [ ] Commit: `git commit -m "Add InventoryItem and populate a sample
      list of rows"` — explaining the mutability decision, not just the
      new file.

Next: `RecyclerView.Adapter` and `ViewHolder` — the real framework
contract that turns this populated list into visible rows on screen.
