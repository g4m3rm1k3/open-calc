# Lesson 8: Passing Data Between Screens — Intent Extras and Parcelable

**What you will build:** Tapping a row in the inventory list opens a
new `ItemDetailActivity` showing that specific item's full details.
The transferable problem: Lesson 4 taught `Intent` as a way to ask the
OS to start an Activity, but never handed that Activity any data — and
Lesson 6's `RecyclerView.Adapter` has no business calling `startActivity`
itself (it doesn't even have easy access to a `Context` meant for
navigation). Two separate problems, solved with two separate tools: a
callback interface to report *which* item was tapped, and a way to
actually carry an `Item` object across the OS-mediated `Intent`
boundary from Lesson 4.

**What you need to know first:** Lesson 4 (`Intent`, `startActivity`,
declaring a new Activity in the Manifest), Lesson 6 (`InventoryAdapter`,
`onBindViewHolder`, `ViewHolder`), Lesson 7 (`Item`, its fields and
`equals()`/`hashCode()`).

---

## Concept Unit: A Callback Interface — Reporting a Tap Without Owning Navigation

### The Problem

`InventoryAdapter` builds each row and knows, inside `onBindViewHolder`,
exactly which `Item` belongs to which row. But `InventoryAdapter` has
no reasonable way to call `startActivity` itself — it isn't an
Activity, doesn't hold an Activity's navigation context by design, and
Lesson 6 built it to know nothing about screens at all, only about
turning data into rows. Something needs to sit between "a row was
tapped" and "navigate to detail," without collapsing those two
responsibilities into one class.

### Introduce the Concept in Isolation

You've used `View.OnClickListener` since Lesson 4 — an interface
*Android* defined, that you implemented with a lambda. This unit is
about defining your **own** interface, the same shape, for your own
purpose. A tiny throwaway example, no Android involved:

```java
interface Greeter {
    void greet(String name);
}

public class InterfaceDemo {
    public static void main(String[] args) {
        Greeter formal = name -> System.out.println("Good day, " + name + ".");
        Greeter casual = name -> System.out.println("Hey " + name + "!");

        deliverGreeting(formal, "Dr. Alvarez");
        deliverGreeting(casual, "Sam");
    }

    static void deliverGreeting(Greeter g, String name) {
        g.greet(name);
    }
}
```

Compile and run it:

```
javac InterfaceDemo.java
java InterfaceDemo
```

Output:

```
Good day, Dr. Alvarez.
Hey Sam!
```

What this proves: `deliverGreeting` never knows or cares *how* a
greeting is worded — it only knows it can call `.greet(name)` on
whatever `Greeter` it's handed, and the *caller* decides the actual
behavior by supplying a different lambda each time. This is exactly the
shape `InventoryAdapter` needs: it will call one method
("a row was tapped, here's the `Item`") without knowing or caring what
happens next — `InventoryActivity` will decide that, by supplying the
implementation.

### Discard the Throwaway Example

Delete `InterfaceDemo.java` and the `Greeter` interface — the real
project defines its own interface, purpose-built for item taps, next.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryAdapter.java`.
- **Change type:** Add.
- **Location:** A new nested interface, a new constructor parameter, and
  a click listener registered inside `onCreateViewHolder`.

### The New Code

```java
interface OnItemClickListener {
    void onItemClick(Item item);
}
```

```java
private final OnItemClickListener listener;

InventoryAdapter(List<Item> items, OnItemClickListener listener) {
    this.items = items;
    this.listener = listener;
}
```

```java
itemView.setOnClickListener(v -> listener.onItemClick(items.get(holder.getAdapterPosition())));
```

### The Updated Project

```java
public class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {
    private final List<Item> items;
    private final OnItemClickListener listener;                                        // ← new

    interface OnItemClickListener {                                                    // ← new
        void onItemClick(Item item);                                                    // ← new
    }                                                                                    // ← new

    InventoryAdapter(List<Item> items, OnItemClickListener listener) {                  // ← changed
        this.items = items;
        this.listener = listener;                                                        // ← new
    }

    @NonNull
    @Override
    public InventoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_inventory, parent, false);
        InventoryViewHolder holder = new InventoryViewHolder(itemView);                  // ← changed
        itemView.setOnClickListener(v ->                                                 // ← new
                listener.onItemClick(items.get(holder.getAdapterPosition())));           // ← new
        return holder;                                                                   // ← changed
    }

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        Item item = items.get(position);
        holder.itemNameText.setText(item.getName());
        holder.itemDetailText.setText("Qty: " + item.getQuantity() + " — " + item.getLocation());
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        TextView itemNameText;
        TextView itemDetailText;

        InventoryViewHolder(View itemView) {
            super(itemView);
            itemNameText = itemView.findViewById(R.id.itemNameText);
            itemDetailText = itemView.findViewById(R.id.itemDetailText);
        }
    }
}
```

`InventoryAdapter` now reports taps outward through a listener it
doesn't implement itself, instead of reaching for `startActivity`
directly — exactly the separation the Problem section called for.

### Mechanical Walkthrough

- `interface OnItemClickListener { void onItemClick(Item item); }` —
  **first appearance of a user-defined interface**, same underlying
  idea as `Greeter` in the lab, now nested inside `InventoryAdapter`
  (a nested interface, same visibility-organizing idea as the nested
  `InventoryViewHolder` class from Lesson 6). One abstract method with
  no body — an interface declares *what* can be called, never *how*.
- `private final OnItemClickListener listener;` — reappearing
  (`private final` field, Lesson 6/7), new type.
- Constructor gaining a second parameter — reappearing (constructor
  pattern), same `this.` assignment idiom.
- `itemView.setOnClickListener(v -> ...)` — **reappearing concept**
  (Observer-pattern registration + lambda, Lesson 4), moved to a new
  location: **the whole row** (`itemView`, the ViewHolder's root view)
  rather than one button inside it — tapping anywhere on the row
  triggers this, not a specific child view.
- `holder.getAdapterPosition()` — **first appearance.** Returns this
  specific holder's *current* position in the list at the moment it's
  called — deliberately read at click-time inside the lambda, not
  captured from the `position` parameter of some other method, because
  a recycled holder's position can change as the list scrolls; asking
  fresh, at the moment of the actual tap, is what stays correct.
- `listener.onItemClick(items.get(...))` — reappearing (`List.get`,
  interface method call syntax is just a method call, already basic
  once the interface itself is understood).

### CS Lens

A single-abstract-method interface used this way is the **Strategy /
Observer pattern**, same family as `View.OnClickListener` itself and
`RecyclerView.Adapter`'s `LayoutManager` split from Lesson 6 — behavior
is supplied as a value (an object implementing one method) rather than
hardcoded. Also recognized in: comparator objects passed to a sort
function, dependency-injected strategy objects in general, and any
plugin architecture where the host calls a fixed interface and a
separately-compiled module supplies the behavior.

### SE Lens

**Why not just give `InventoryAdapter` a `Context` and let it call
`startActivity` itself**, which would technically work and save writing
an interface? The alternative — Adapter starts Activities directly —
violates the **Single Responsibility Principle**: `InventoryAdapter`'s
one job, as built in Lesson 6, is turning data into rows; adding
navigation logic on top means any future screen that wants to reuse
this same Adapter (a search-results screen, a "recently added" list)
is now stuck with whatever navigation behavior was hardcoded in, unable
to substitute its own without editing the Adapter's source. The
interface costs a small amount of ceremony now — an extra type, an
extra constructor parameter — for the ability to plug in different tap
behavior per screen later without touching this file again.

---

## Concept Unit: Passing Primitive Extras — the Straightforward (but Fragile) Way

### The Problem

`InventoryActivity` can now be notified *which* `Item` was tapped. The
next question: how does that `Item`'s data reach a brand-new
`ItemDetailActivity`, given that Lesson 4 already established you can't
just hand it a Java object reference the way you'd pass one method
argument to another — `Intent` is the only channel across that OS-
mediated boundary.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `ItemDetailActivity.java`, new file
  `activity_item_detail.xml`, `AndroidManifest.xml`, `InventoryActivity.java`.
- **Change type:** Create, configure, add.
- **Dependencies:** the `OnItemClickListener` from the previous unit.

### The New Code — the Detail Screen

Right-click the package → New → Activity → Empty Views Activity, name
it `ItemDetailActivity` (same wizard flow as `InventoryActivity` in
Lesson 4 — **reappearing**, not re-explained). Replace
`activity_item_detail.xml`'s contents:

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <TextView
        android:id="@+id/detailNameText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="24sp"
        android:layout_marginTop="32dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <TextView
        android:id="@+id/detailInfoText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="16sp"
        android:layout_marginTop="16dp"
        app:layout_constraintTop_toBottomOf="@id/detailNameText"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

Every tag and attribute here is **reappearing** from Lesson 3/5 — a
`ConstraintLayout` root, two `TextView`s stacked via `toBottomOf`,
already covered.

Now `ItemDetailActivity.java`:

```java
package com.yourname.pocketinventory;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.TextView;

public class ItemDetailActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_item_detail);

        String name = getIntent().getStringExtra("EXTRA_NAME");
        int quantity = getIntent().getIntExtra("EXTRA_QUANTITY", 0);
        String location = getIntent().getStringExtra("EXTRA_LOCATION");

        TextView nameText = findViewById(R.id.detailNameText);
        TextView infoText = findViewById(R.id.detailInfoText);
        nameText.setText(name);
        infoText.setText("Quantity: " + quantity + "\nLocation: " + location);
    }
}
```

### The Updated Project

This is the whole new file — `extends AppCompatActivity`, the
`onCreate` override, `super.onCreate`, `setContentView` are all
**reappearing** from Lesson 2/4, unexplained again on purpose. The new
material is the three lines reading from `getIntent()`.

### Mechanical Walkthrough
- `getIntent()` — **first appearance.** Every Activity started via
  `startActivity(intent)` can retrieve that same `Intent` object back,
  inside itself, by calling this — the receiving side of the exact
  `Intent` your `MainActivity` builds and sends in Lesson 4.
- `.getStringExtra("EXTRA_NAME")` — **first appearance.** Reads a
- `String` value out of the `Intent`'s extras, by key — the receiving
  half of `putExtra`, built next on the sending side. Returns `null` if
  the key was never set — worth noting, though not yet guarded against
  here.
- `.getIntExtra("EXTRA_QUANTITY", 0)` — **first appearance**, same idea
- as `getStringExtra`, `int` version — requiring a default value
  (`0`) because a primitive `int` (unlike `String`, which can be
  `null`) cannot represent "absent" on its own.
- `nameText.setText(name)` / `infoText.setText(...)` — reappearing
- (`setText`, Lesson 5), `"\n"` — **first appearance** of an escape
  sequence for a newline character inside a string literal, forcing the
  quantity and location onto separate lines.

### Project Change — Declaring and Sending

- **Reference Source:** No reference counterpart.
- **Files affected:** `AndroidManifest.xml`, `InventoryActivity.java`.
- **Change type:** Configure (Manifest, likely already done by the
  wizard — verify it), add (Activity).

### The New Code

Confirm the Manifest has (the wizard should have added this
automatically, same as `InventoryActivity`'s entry in Lesson 4):

```xml
<activity android:name=".ItemDetailActivity" android:exported="false" />
```

In `InventoryActivity.java`, change the Adapter construction to supply
the listener, and build the `Intent`:

```java
recyclerView.setAdapter(new InventoryAdapter(items, item -> {
    Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
    intent.putExtra("EXTRA_NAME", item.getName());
    intent.putExtra("EXTRA_QUANTITY", item.getQuantity());
    intent.putExtra("EXTRA_LOCATION", item.getLocation());
    startActivity(intent);
}));
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<Item> items = new ArrayList<>();
        items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));
        items.add(new Item("Shop Rags", 12, "Shelf B"));
        items.add(new Item("Cutting Oil", 3, "Shelf B"));
        items.add(new Item("Digital Calipers", 2, "Toolbox 1"));
        items.add(new Item("Safety Glasses", 8, "Shelf A"));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(new InventoryAdapter(items, item -> {           // ← changed
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class); // ← new
            intent.putExtra("EXTRA_NAME", item.getName());                       // ← new
            intent.putExtra("EXTRA_QUANTITY", item.getQuantity());               // ← new
            intent.putExtra("EXTRA_LOCATION", item.getLocation());               // ← new
            startActivity(intent);                                              // ← new
        }));                                                                     // ← new
    }
}
```

`onCreate` now supplies a lambda implementing `OnItemClickListener` —
same "pass behavior as a value" shape from the first Concept Unit,
except this specific lambda's body is where the actual navigation logic
lives, exactly as the SE Lens above predicted: the Adapter stayed
generic, and this Activity owns the specifics.

### Mechanical Walkthrough
- `new InventoryAdapter(items, item -> { ... })` — reappearing
  (constructor call), new second argument: a lambda matching
- `OnItemClickListener`'s single method, `onItemClick(Item item)` — the
  parameter name `item` here is your choice, matching the interface's
  parameter *type*, not its parameter *name*.
- `new Intent(InventoryActivity.this, ItemDetailActivity.class)` —
  reappearing (`Intent` construction, Lesson 4), one new detail:
- `InventoryActivity.this` rather than a bare `this` — required because
  plain `this` inside this lambda would refer to the lambda's own
  context, which (unlike an anonymous inner class, which this
  curriculum hasn't used) a lambda doesn't have in the same way;
  qualifying which `this` is meant removes the ambiguity.
- `intent.putExtra("EXTRA_NAME", item.getName())` and its two siblings
- — **first appearance.** `putExtra` is overloaded (multiple versions
  of the same method name, differing by parameter type — already
  implicitly used any time you called `println` with different argument
- types) — one version accepts a `String` value, another an `int`,
  matched automatically based on what you pass. Each call attaches one
  key-value pair to the `Intent`'s extras bundle.
- `startActivity(intent)` — reappearing, from Lesson 4.

### Run It

Run the app, tap any row. `ItemDetailActivity` opens showing that
specific item's name, quantity, and location — not just "some item,"
the *actual* one tapped, carried across the Activity boundary through
three separate `putExtra`/`get*Extra` pairs.

### CS Lens

Keying values by string and reading them back by the same string is
**string-keyed dictionary passing** — the same idea as `Bundle` from
Lesson 5's `onSaveInstanceState`, in fact literally the same underlying
`Bundle` class (an `Intent`'s extras *are* a `Bundle`). Also recognized
in: HTTP query parameters (`?name=...&quantity=...`), environment
variables passed to a subprocess, and any config object read by string
keys instead of typed fields.

---

## Concept Unit: `Parcelable` — Packaging a Whole Object Into an Intent

### The Problem

Three fields, three matching `putExtra`/`get*Extra` pairs — already a
little repetitive, and worth noticing the same failure shape as Lesson
7's parallel-lists problem: if `Item` gains a fourth field (the
exercise in Lesson 7 suggested a `sku`), it is entirely possible to add
it to `Item.java` and forget to add the matching `putExtra`/`getStringExtra`
pair here — no compiler error, just a `null` or `0` silently showing up
in `ItemDetailActivity`. A better fix ties the packaging logic to the
`Item` class itself, so it can't drift out of sync the way loose,
hand-matched string keys can.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Item.java`, `InventoryActivity.java`,
  `ItemDetailActivity.java`.
- **Change type:** Modify.
- **Dependencies:** none new — `Parcelable` is part of the Android
  framework already available.

### The New Code — `Item` Describes How to Package Itself

```java
public class Item implements android.os.Parcelable {
    // ...existing fields, constructor, getters, setter, equals, hashCode unchanged...

    protected Item(android.os.Parcel in) {
        name = in.readString();
        quantity = in.readInt();
        location = in.readString();
    }

    @Override
    public void writeToParcel(android.os.Parcel dest, int flags) {
        dest.writeString(name);
        dest.writeInt(quantity);
        dest.writeString(location);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    public static final android.os.Parcelable.Creator<Item> CREATOR =
            new android.os.Parcelable.Creator<Item>() {
        @Override
        public Item createFromParcel(android.os.Parcel in) {
            return new Item(in);
        }

        @Override
        public Item[] newArray(int size) {
            return new Item[size];
        }
    };
}
```

### The Updated Project

```java
package com.yourname.pocketinventory;

public class Item implements android.os.Parcelable {                       // ← changed
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

    protected Item(android.os.Parcel in) {                                  // ← new
        name = in.readString();                                             // ← new
        quantity = in.readInt();                                            // ← new
        location = in.readString();                                        // ← new
    }                                                                        // ← new

    @Override                                                                // ← new
    public void writeToParcel(android.os.Parcel dest, int flags) {          // ← new
        dest.writeString(name);                                             // ← new
        dest.writeInt(quantity);                                            // ← new
        dest.writeString(location);                                        // ← new
    }                                                                        // ← new

    @Override                                                                // ← new
    public int describeContents() {                                         // ← new
        return 0;                                                            // ← new
    }                                                                        // ← new

    public static final android.os.Parcelable.Creator<Item> CREATOR =        // ← new
            new android.os.Parcelable.Creator<Item>() {                     // ← new
        @Override                                                            // ← new
        public Item createFromParcel(android.os.Parcel in) {                // ← new
            return new Item(in);                                            // ← new
        }                                                                    // ← new

        @Override                                                            // ← new
        public Item[] newArray(int size) {                                  // ← new
            return new Item[size];                                          // ← new
        }                                                                    // ← new
    };                                                                       // ← new
}
```

`Item` as a whole is now a normal data-holder (everything from Lesson
7, unchanged) **plus** a self-contained description of how to serialize
and rebuild itself — every field this class has, in one place, instead
of scattered across whichever Activity happens to be sending or
receiving it.

### Mechanical Walkthrough
- `implements android.os.Parcelable` — **first appearance of
  `implements`** (as opposed to `extends`, used for every base class so
  far). `implements` fulfills an interface contract rather than
- inheriting a base class's implementation — `Parcelable` is an
  interface (same category of thing as `OnItemClickListener`, earlier
  this lesson, just framework-defined), requiring specific methods this
  class must supply.
- `protected Item(android.os.Parcel in)` — **first appearance of
  constructor overloading**: a *second* constructor, same class name,
  different parameter list (`Parcel` instead of the three original
  fields) — Java picks which one runs based on the arguments supplied
  at the call site. `Parcel` is the framework's serialized-bytes
  container that actually crosses the Intent boundary.
- `in.readString()` / `in.readInt()` — **first appearance.** Reads
  values back out of the `Parcel`, in a fixed order.
- `writeToParcel(Parcel dest, int flags)` — **first appearance,** the
  required interface method: writes this object's fields into a
  `Parcel`, in a matching order to the read side.
- `dest.writeString(name)` / `dest.writeInt(quantity)` /
- `dest.writeString(location)` — **first appearance**, the write-side
  counterparts. **Order matters and must match the reading constructor
- exactly** — this is a real, sharp edge of `Parcelable`: nothing
  checks at compile time that read-order matches write-order; a
  mismatch (writing name, quantity, location but reading quantity,
  name, location) compiles fine and corrupts data silently at runtime.
- `describeContents()` — **first appearance**, required by the
  interface; `0` is the conventional return value unless the object
  holds a file descriptor (not applicable here).
- `public static final Parcelable.Creator<Item> CREATOR` — **first
  appearance.** A required, exactly-named (`CREATOR`, all-caps by
  convention, must be named exactly this) static field the Android
  framework specifically looks for by reflection when reconstructing a
- `Parcelable` from a `Parcel` — this is the one piece of the mechanism
  that isn't just "a method you override," which is worth flagging: the
  framework's contract here relies on a magic field name, not purely on
  the interface's declared methods.
- The anonymous `new Parcelable.Creator<Item>() { ... }` — **first
  appearance of an anonymous class**: creating an object that
  implements an interface (`Creator<Item>`) inline, without ever
  declaring a separate named class — appropriate here specifically
  because `Creator` requires *two* methods (`createFromParcel`,
  `newArray`), and a lambda (used everywhere else so far in this
  curriculum) only works for interfaces with exactly *one* abstract
  method, which `Creator` isn't.
- `createFromParcel(Parcel in)` — calls the `Item(Parcel in)`
  constructor built above — this is the actual reconstruction step.
- `newArray(int size)` — returns an appropriately-sized empty `Item[]`
  — required by the framework for batch operations (passing a list of
  Parcelables), not exercised directly by this project yet.

### The New Code — Sending and Receiving the Whole Object

In `InventoryActivity.java`, collapse the three `putExtra` calls to one:

```java
intent.putExtra("EXTRA_ITEM", item);
```

In `ItemDetailActivity.java`, replace the three `get*Extra` lines:

```java
Item item = getIntent().getParcelableExtra("EXTRA_ITEM");
```

### The Updated Project

`InventoryActivity`'s click-lambda body now reads:

```java
recyclerView.setAdapter(new InventoryAdapter(items, item -> {
    Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
    intent.putExtra("EXTRA_ITEM", item);                                    // ← changed (was 3 lines)
    startActivity(intent);
}));
```

`ItemDetailActivity.onCreate` now reads:

```java
public class ItemDetailActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_item_detail);

        Item item = getIntent().getParcelableExtra("EXTRA_ITEM");            // ← changed (was 3 lines)

        TextView nameText = findViewById(R.id.detailNameText);
        TextView infoText = findViewById(R.id.detailInfoText);
        nameText.setText(item.getName());                                    // ← changed
        infoText.setText("Quantity: " + item.getQuantity() + "\nLocation: " + item.getLocation()); // ← changed
    }
}
```

Both Activities now move one whole `Item` across the boundary — if a
future lesson adds a field to `Item`, the packaging code lives entirely
inside `Item.java`'s `writeToParcel`/constructor pair, not scattered
across every Activity that happens to send or receive one.

### Mechanical Walkthrough
- `intent.putExtra("EXTRA_ITEM", item)` — **reappearing** (`putExtra`,
  overloaded again, this time matching the `Parcelable` version since
  `Item` now implements that interface).
- `getIntent().getParcelableExtra("EXTRA_ITEM")` — **first
  appearance.** The `Parcelable`-typed counterpart to `getStringExtra`/
- `getIntExtra` — internally, this is what triggers the framework to
  call `CREATOR.createFromParcel(...)` behind the scenes.

### Run It

Run the app again, tap a row. Same visible result as before — this is
the point: the *user-facing behavior didn't change at all*, only the
internal mechanism did, from three loosely-matched key/value pairs to
one self-describing object.

### CS Lens

**This is a hard concept — serialization — and it recurs constantly:**
converting an in-memory object graph into a linear sequence of bytes
(or characters) that can cross a boundary the original object reference
can't (a process boundary, here; a network socket; a disk file), plus
the matching deserialization step to rebuild it on the other side. Also
recognized in: JSON/XML serialization of API request and response
bodies, Python's `pickle`, Java's own `Serializable` interface (an
older, reflection-based alternative to `Parcelable` that Android
specifically avoids for performance reasons), and database rows being
"serialized" into query results and "deserialized" into ORM objects.

### SE Lens

**Why does Android define its own `Parcelable` instead of using plain
Java `Serializable`,** which requires zero extra code (just
`implements Serializable`, no methods to write)? `Serializable` uses
Java reflection to inspect and copy every field automatically at
runtime — convenient, but measurably slower, which matters because
`Parcelable` objects are used constantly for routine navigation, not
just occasional file saves. `Parcelable`'s tradeoff is the opposite of
`Serializable`'s: more code to write by hand (or, in real projects,
generate via an IDE plugin or annotation processor — not covered here,
since seeing the manual mechanism once is the point), in exchange for
explicit, fast, no-reflection read/write logic you fully control and
can reason about line by line, which is exactly what this unit walked
through.

---

## Connect the Pieces

Full trace: the user taps a row → `InventoryViewHolder`'s `itemView`
click listener (built in the first Concept Unit) calls
`getAdapterPosition()` to find the current `Item`, then calls
`listener.onItemClick(item)` → `InventoryActivity`'s lambda, registered
as that listener, builds an `Intent` targeting `ItemDetailActivity` and
calls `intent.putExtra("EXTRA_ITEM", item)`, which — because `Item`
implements `Parcelable` — triggers `writeToParcel` to serialize all
three fields into the `Intent`'s `Bundle` → `startActivity` hands it to
the OS (Lesson 4's mechanism, unchanged) → `ItemDetailActivity.onCreate`
calls `getIntent().getParcelableExtra("EXTRA_ITEM")`, which triggers
`CREATOR.createFromParcel` → the `Item(Parcel in)` constructor rebuilds
a new but field-identical `Item` object → its getters populate the
detail screen's two `TextView`s.

## What Breaks Without This

In `Item.java`'s `writeToParcel`, swap the order of the last two lines
— write `location` before `quantity` — but leave the `Item(Parcel in)`
reading constructor unchanged (still reading `quantity` before
`location`). Run the app and tap a row: the detail screen shows the
location's text where the quantity should be (visibly wrong, or a
crash if the types truly mismatch) — a real demonstration of the "order
must match, and nothing checks it for you" warning from the Mechanical
Walkthrough. Restore the correct order afterward.

## Exercises

1. Add the `sku` field from Lesson 7's exercise (if you did it) to
   `Item`'s `Parcelable` methods — one line each in the constructor and
   `writeToParcel` — and display it on the detail screen. Notice this
   is still three small edits, all inside `Item.java`, rather than
   hunting through every Activity that sends or receives one.
2. Temporarily change `ItemDetailActivity`'s `getParcelableExtra` call
   to look up a key that doesn't exist (`"WRONG_KEY"`). Run it and
   observe the crash (a `NullPointerException` when `.getName()` is
   called on the resulting `null`). This is the same class of bug the
   very first Concept Unit's naive `getStringExtra`/`getIntExtra`
   approach was quietly exposed to — confirm for yourself that
   `Parcelable` didn't eliminate typo-prone string keys entirely (there's
   still exactly one key now, `"EXTRA_ITEM"`, instead of three), just
   reduced how many places a mismatch could hide.

## Definition of Done

- [ ] Tapping any inventory row opens `ItemDetailActivity` showing that
      row's real name, quantity, and location.
- [ ] You ran the `InterfaceDemo` lab and can explain, in your own
      words, why `InventoryAdapter` needed a listener interface instead
      of calling `startActivity` itself.
- [ ] `Item` implements `Parcelable` correctly, and you can explain what
      `CREATOR` is for.
- [ ] You broke the `writeToParcel`/constructor field order on purpose,
      saw the real corrupted result, and restored it.
- [ ] Commit: message explaining why (e.g. "Add tap-to-detail
      navigation via a custom Adapter click listener, passing the
      tapped Item as a Parcelable instead of three loosely-matched
      Intent extras").

Lesson 9 is next: building an actual Add Item form — `EditText`,
Android's input-type system, and why you can't trust anything a user
typed until you've checked it.
