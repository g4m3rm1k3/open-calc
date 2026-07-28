# Lesson 8: Passing Data Between Screens — Intent Extras and Parcelable

> **Revised 2026-07-28** — added a new "Overloading" Concept Unit
> before the Intent-extras unit, proving method/constructor overload
> resolution with a real lab and a real compile error (verified this
> session), where it had previously only ever been named and described
> ("Java picks which one runs based on the arguments"), never proven —
> the same gap already fixed for Annotations (Lesson 2c), `LayoutInflater`
> and `ArrayList` (Lesson 6e). The existing `putExtra` and
> `Item(Parcel in)` walkthrough bullets now point back to this proof
> instead of re-describing it. Full detail in `CHANGELOG.md` in this
> folder.

**What you will build:** Tapping a row in the inventory list opens a
new `ItemDetailActivity` showing that specific item's full details.
The transferable problem: you already know `Intent` as a way to ask the
OS to start an Activity, but it never handed that Activity any data — and
`InventoryAdapter` has no business calling `startActivity` itself (it
doesn't even have easy access to a `Context` meant for navigation).
Two separate problems, solved with two separate tools: a callback
interface to report *which* item was tapped, and a way to actually
carry an `Item` object across that same OS-mediated `Intent` boundary.
Along the way, you'll also prove — with a real compile error — the
exact mechanism `println` has silently used since Lesson 1: how Java
picks which same-named method actually runs.

**What you need to know first:** Lesson 4 (`Intent`, `startActivity`,
declaring a new Activity in the Manifest, lambdas implementing
single-method interfaces, via `Doorbell`/`Chime` and `OnTapListener`).
Lessons 6c and 6e (`InventoryAdapter`, `onBindViewHolder`, `ViewHolder`). Lesson
7 (`Item`, its fields and `equals()`/`hashCode()`).

**Terms introduced in this lesson:**
- **`getAdapterPosition()`** — returns a `ViewHolder`'s current position
  in the list at the moment it's called, read fresh rather than cached.
- **`getIntent()`** — retrieves, inside a started Activity, the same
  `Intent` object that started it.
- **Intent extras** (`putExtra`, `getStringExtra`, `getIntExtra`) —
  key-value data attached to an `Intent`; written with `putExtra` on
  the sending side, read back with the matching `getXExtra` method on
  the receiving side.
- **Escape sequence** (e.g. `"\n"`) — a character sequence inside a
  string literal representing a character that can't be typed directly
  — here, a newline.
- **`implements`** — fulfills an interface's method contract, as
  opposed to `extends`, which inherits a base class's implementation.
- **Method overloading** — multiple methods sharing one name on the
  same class, distinguished only by their parameter types.
- **Overload resolution** — the compiler's own process of picking which
  overload a specific call actually means, decided once, at compile
  time, from the types written in the source — never by inspecting
  what a variable actually holds while the program runs.
- **Static dispatch vs. dynamic dispatch** — overload resolution is
  static dispatch (decided at compile time, from declared types);
  `Base`/`Child`'s overridden `setup()` (Lesson 2c) is dynamic dispatch
  (decided at runtime, from the object's real type) — two different
  mechanisms that can both make "the right code runs here" true.
- **Constructor overloading** — declaring more than one constructor for
  the same class; the exact same overload-resolution mechanism as any
  other method, applied to constructors.
- **Single Responsibility Principle** — a class should have one job;
  giving `InventoryAdapter` navigation logic on top of its actual job
  (turning data into rows) would make it harder to reuse for a
  different screen with different tap behavior.
- **Strategy / Observer pattern** — behavior supplied as a value (an
  object implementing one method) rather than hardcoded, so the caller
  can be handed different behavior without its own code changing.
- **Serialization / deserialization** — converting an in-memory object
  into a linear sequence of bytes that can cross a boundary a plain
  object reference can't (a process boundary, a network socket, a disk
  file), plus the matching step to rebuild the object on the other
  side.
- **`Serializable`** — Java's own built-in serialization interface;
  `Parcelable` gives up its zero-effort simplicity in exchange for
  faster, no-reflection performance.
- **`Parcelable`** — an Android framework interface for serializing an
  object's fields so it can cross the boundary between two Activities
  inside an `Intent`.
- **`Parcel`** — the framework's serialized-bytes container that
  actually crosses the `Intent` boundary.
- **`Parcel.readString()` / `readInt()` and `writeString()` /
  `writeInt()`** — read a value back out of a `Parcel`, or write one
  into it, in a fixed order that the read side and write side must
  agree on exactly.
- **`writeToParcel(Parcel dest, int flags)`** — the required
  `Parcelable` method; writes an object's own fields into a `Parcel`.
- **`describeContents()`** — a required `Parcelable` method; returns
  `0` unless the object holds a file descriptor.
- **`CREATOR`** — a required, exactly-named static field the Android
  framework looks for via reflection when reconstructing a `Parcelable`
  object.

---

## Concept Unit: A Callback Interface — Reporting a Tap Without Owning Navigation

### The Problem

`InventoryAdapter` builds each row and knows, inside `onBindViewHolder`,
exactly which `Item` belongs to which row. But `InventoryAdapter` has
no reasonable way to call `startActivity` itself — it isn't an
Activity, doesn't hold an Activity's navigation context by design, and
it was built to know nothing about screens at all, only about
turning data into rows. Something needs to sit between "a row was
tapped" and "navigate to detail," without collapsing those two
responsibilities into one class.

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
directly — exactly the separation the Problem section called for. This
won't compile yet on its own — `InventoryActivity`'s existing
`new InventoryAdapter(items)` call is now missing a required second
argument, fixed once this unit's isolated lab explains the shape and
the next Concept Unit supplies it for real.

### Introduce the Concept in Isolation

`OnItemClickListener` just used a shape you've seen a version of
before — `View.OnClickListener` is Android's own
single-method interface, implemented with a lambda. This unit defined
your **own** interface, same shape, for your own purpose. See that
shape in isolation, with no Android involved at all. Create a folder
for this lab (same convention as always — plain folder, no `package`
line). Inside it, create a file named exactly `Greeter.java`:

```java
interface Greeter {
    void greet(String name);
}
```

Create `InterfaceDemo.java` in the same folder:

```java
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
javac Greeter.java InterfaceDemo.java
java InterfaceDemo
```

Real output — verified this session:

```
Good day, Dr. Alvarez.
Hey Sam!
```

*What this proves:* `deliverGreeting` never knows or cares *how* a
greeting is worded — it only knows it can call `.greet(name)` on
whatever `Greeter` it's handed, and the *caller* decides the actual
behavior by supplying a different lambda each time. This is exactly the
shape `InventoryAdapter` just used above: it calls one method
("a row was tapped, here's the `Item`") without knowing or caring what
happens next — `InventoryActivity`, next, decides that, by supplying
the implementation, the same way `main` decided what `formal` and
`casual` each actually print.

### Discard the Throwaway Example

Delete `Greeter.java` and `InterfaceDemo.java` — `OnItemClickListener`,
built above, is the real version of this same shape; nothing here is
reused.

### Mechanical Walkthrough

- `interface OnItemClickListener { void onItemClick(Item item); }` —
  **first appearance of a user-defined interface**, same underlying
  idea as `Greeter` in the lab, now nested inside `InventoryAdapter`
  (a nested interface, same visibility-organizing idea as the nested
  `InventoryViewHolder` class). One abstract method with
  no body — an interface declares *what* can be called, never *how*.
- `private final OnItemClickListener listener;` — reappearing
  (`private final` field), new type.
- Constructor gaining a second parameter — reappearing (constructor
  pattern), same `this.` assignment idiom.
- `itemView.setOnClickListener(v -> ...)` — **reappearing concept**
  (Observer-pattern registration + lambda), moved to a new
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
`RecyclerView.Adapter`'s `LayoutManager` split — behavior
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
one job is turning data into rows; adding
navigation logic on top means any future screen that wants to reuse
this same Adapter (a search-results screen, a "recently added" list)
is now stuck with whatever navigation behavior was hardcoded in, unable
to substitute its own without editing the Adapter's source. The
interface costs a small amount of ceremony now — an extra type, an
extra constructor parameter — for the ability to plug in different tap
behavior per screen later without touching this file again.

---

## Concept Unit: Overloading — Same Method Name, Chosen at Compile Time

### The Problem

`System.out.println(...)` has been called in this project since
Lesson 1 — with a `String`, with numbers built from `+` concatenation,
with all sorts of different values — and it has always simply worked,
with no explanation of *how* Java knew what to do with each different
kind of value handed to the exact same method name. The next unit is
about to lean on that same unexplained behavior directly, through a
method called `putExtra`. Before trusting it further, prove what's
actually happening.

### Introduce the Concept in Isolation

Create a folder for this lab (same convention as every lab so far).
Inside it, create `Printer.java`:

```java
class Printer {
    void show(int value) {
        System.out.println("int version ran: " + value);
    }

    void show(String value) {
        System.out.println("String version ran: " + value);
    }

    void show(double value) {
        System.out.println("double version ran: " + value);
    }
}
```

Three methods, all named `show`, all on the same class — this compiles,
which already proves something: Java does not treat this as three
attempts to redefine the same method. Create `OverloadDemo.java`:

```java
public class OverloadDemo {
    public static void main(String[] args) {
        Printer printer = new Printer();
        printer.show(5);
        printer.show("hello");
        printer.show(5.0);
    }
}
```

Compile and run:

```
javac Printer.java OverloadDemo.java
java OverloadDemo
```

Real output, this session:

```
int version ran: 5
String version ran: hello
double version ran: 5.0
```

#### Execution Trace

1. `printer.show(5)` — `5` is an `int` literal. At the point this line
   is *compiled*, before the program ever runs, the compiler looks at
   `5`'s type and picks the one `show` overload whose parameter type
   matches — `show(int)` — and bakes that specific choice into the
   compiled code. This is why the output says "int version ran."
2. `printer.show("hello")` — `"hello"` is a `String` literal; the
   compiler picks `show(String)` for the same reason, at the same
   point, before the program runs.
3. `printer.show(5.0)` — `5.0` is a `double` literal; the compiler
   picks `show(double)`.

Nothing about this trace involves the program actually *running* yet —
every decision happened while `javac` was compiling `OverloadDemo.java`,
which is the entire point about to be proven directly.

### Discard This Version — Prove *When* the Choice Is Made

Delete neither file yet. In the same folder, create one more file,
`StaticTypeDemo.java`, that looks like it should obviously work:

```java
public class StaticTypeDemo {
    public static void main(String[] args) {
        Printer printer = new Printer();
        Object mystery = "hello";
        printer.show(mystery);
    }
}
```

`mystery` genuinely holds a `String` — `"hello"` — at the moment this
runs. Try to compile it:

```
javac Printer.java StaticTypeDemo.java
```

Real compiler output, this session — this genuinely fails to compile:

```
StaticTypeDemo.java:5: error: no suitable method found for show(Object)
        printer.show(mystery);
               ^
    method Printer.show(int) is not applicable
      (argument mismatch; Object cannot be converted to int)
    method Printer.show(String) is not applicable
      (argument mismatch; Object cannot be converted to String)
    method Printer.show(double) is not applicable
      (argument mismatch; Object cannot be converted to double)
1 error
```

This is the actual proof, not the execution trace alone: `mystery`
holds a real `String` at runtime — if overload resolution looked at
what's actually inside the variable when the program runs, `show(String)`
would be the obvious match, the same way it was one paragraph ago.
Instead, the compiler only ever looks at `mystery`'s **declared** type,
`Object` — and rejects the call, at compile time, because no `show`
overload accepts an `Object`, even though the value that variable
happens to hold right now would fit one perfectly. Overload resolution
is decided once, permanently, when the code is compiled, using only the
types visible in the source — never by inspecting what a variable
actually contains while the program runs.

### Discard the Throwaway Example

Delete `Printer.java`, `OverloadDemo.java`, and `StaticTypeDemo.java` —
none of it appears in the project again. The real project uses this
exact mechanism through `Intent.putExtra`, next, and later through
`Item`'s own second constructor.

### Mechanical Walkthrough

- `void show(int value)`, `void show(String value)`, `void show(double value)`
  — **first appearance of method overloading**: multiple methods
  sharing one name on the same class, distinguished only by their
  parameter types.
- The three calls in `OverloadDemo.main` — **first appearance** of
  overload resolution happening successfully, proven by the execution
  trace above to be a compile-time decision, not a runtime one.
- `printer.show(mystery)` failing to compile — **first appearance of a
  failed overload resolution**, and the actual proof of *when* the
  decision is made: rejected because of `mystery`'s declared type,
  `Object`, with the real value it holds at runtime never even
  consulted.

### CS Lens

**This is a hard concept — static dispatch versus dynamic dispatch —
and it is worth contrasting directly with something this course has
already proven, not just described in isolation.** Overload resolution
(this unit) is **static dispatch**: which method body runs is decided
once, at compile time, purely from the types written in the source.
`Base`/`Child`'s own `run()` calling `setup()` (Lesson 2c) is **dynamic
dispatch**: which override actually runs is decided at *runtime*, based
on the real object's actual type, which is exactly why `Child`'s
`setup()` ran even though `Base.run()`'s own source only ever mentions
`setup()` once, with no way to read from that source alone which
version would execute. Two genuinely different mechanisms, both
producing "the right code runs for this specific case" — one decided
by the compiler before the program exists as a running thing, the other
decided by the object itself, live, while the program runs. Also
recognized in: C++'s explicit split between function overloading
(compile-time) and `virtual` methods (runtime) — the same two
mechanisms, in a language that makes you opt into the second one by
name — and Python/JavaScript having no real overloading at all (a
later `def`/`function` with the same name simply replaces the earlier
one, since neither language chooses between candidates by parameter
type the way Java's compiler does here).

### SE Lens

**Why does Java offer overloading at all, instead of just requiring a
different method name for each parameter type** (`showInt`, `showString`,
`showDouble`)? Different names would work and would remove any need for
this unit's own proof — but it pushes a naming burden onto every
caller, who now has to remember which exact name matches which exact
type, for something that's conceptually one operation ("show this
value") repeated across a few different kinds of value. Overloading
costs the reader a small amount of "which version actually runs here"
uncertainty — exactly what this unit exists to remove — in exchange for
one name to remember and call correctly regardless of which type is on
hand, which is precisely why `System.out.println` itself has offered
this same shape since the very first line of Java this course ever ran.

---

## Concept Unit: Passing Primitive Extras — the Straightforward (but Fragile) Way

### The Problem

`InventoryActivity` can now be notified *which* `Item` was tapped. The
next question: how does that `Item`'s data reach a brand-new
`ItemDetailActivity`, given that you already know you can't
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
it `ItemDetailActivity` (same wizard flow as `InventoryActivity`
before — **reappearing**, not re-explained). Replace
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

Every tag and attribute here is **reappearing** — a
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
**reappearing**, unexplained again on purpose. The new
material is the three lines reading from `getIntent()`.

### Mechanical Walkthrough

- `getIntent()` — **first appearance.** Every Activity started via
  `startActivity(intent)` can retrieve that same `Intent` object back,
  inside itself, by calling this — the receiving side of the exact
  `Intent` your `MainActivity` already builds and sends.
- `.getStringExtra("EXTRA_NAME")` — **first appearance.** Reads a
  `String` value out of the `Intent`'s extras, by key — the receiving
  half of `putExtra`, built next on the sending side. Returns `null` if
  the key was never set — worth noting, though not yet guarded against
  here.
- `.getIntExtra("EXTRA_QUANTITY", 0)` — **first appearance**, same idea
  as `getStringExtra`, `int` version — requiring a default value
  (`0`) because a primitive `int` (unlike `String`, which can be
  `null`) cannot represent "absent" on its own.
- `nameText.setText(name)` / `infoText.setText(...)` — reappearing
  (`setText`), `"\n"` — **first appearance** of an escape
  sequence for a newline character inside a string literal, forcing the
  quantity and location onto separate lines.

### Project Change — Declaring and Sending

- **Reference Source:** No reference counterpart.
- **Files affected:** `AndroidManifest.xml`, `InventoryActivity.java`.
- **Change type:** Configure (Manifest, likely already done by the
  wizard — verify it), add (Activity).

### The New Code

Confirm the Manifest has (the wizard should have added this
automatically, same as `InventoryActivity`'s entry before):

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
  `OnItemClickListener`'s single method, `onItemClick(Item item)` — the
  parameter name `item` here is your choice, matching the interface's
  parameter *type*, not its parameter *name*.
- `new Intent(InventoryActivity.this, ItemDetailActivity.class)` —
  reappearing (`Intent` construction), one new detail:
  `InventoryActivity.this` rather than a bare `this` — required because
  plain `this` inside this lambda would refer to the lambda's own
  context, which (unlike an anonymous inner class, covered in this
  lesson's next unit) a lambda doesn't have in the same way;
  qualifying which `this` is meant removes the ambiguity.
- `intent.putExtra("EXTRA_NAME", item.getName())` and its two siblings
  — **first appearance of `putExtra` specifically**, though overloading
  itself is reappearing — proven directly, this lesson's own
  `Printer`/`OverloadDemo` lab: one version accepts a `String` value,
  another an `int`, chosen at compile time from each call's own
  argument types, the exact mechanism just proved, not merely asserted.
  Each call attaches one key-value pair to the `Intent`'s extras bundle.
- `startActivity(intent)` — reappearing.

### Run It

Run the app, tap any row. `ItemDetailActivity` opens showing that
specific item's name, quantity, and location — not just "some item,"
the *actual* one tapped, carried across the Activity boundary through
three separate `putExtra`/`get*Extra` pairs.

### CS Lens

Keying values by string and reading them back by the same string is
**string-keyed dictionary passing** — the same idea as `Bundle` from
`onSaveInstanceState` earlier, in fact literally the same underlying
`Bundle` class (an `Intent`'s extras *are* a `Bundle`). Also recognized
in: HTTP query parameters (`?name=...&quantity=...`), environment
variables passed to a subprocess, and any config object read by string
keys instead of typed fields.

### SE Lens

**This unit's own title calls this way "fragile," and the next unit
replaces it — so why build it at all, instead of jumping straight to
`Parcelable`?** Because the fragility only means something once you've
felt it. The next unit's entire motivating problem — add a fourth field
to `Item`, forget the matching fourth `putExtra`/`get*Extra` pair, get
a silent `null` with no compiler error — is invisible if you've never
written the three-pair version yourself and seen how easy that mismatch
is to introduce. Three key strings (`"EXTRA_NAME"`, `"EXTRA_QUANTITY"`,
`"EXTRA_LOCATION"`) typed correctly, twice each, six chances for a typo
that compiles fine and fails silently at runtime — that's the concrete
cost `Parcelable` is actually buying you out of, next, and it only
reads as a real improvement, not just more ceremony, once you've paid
that cost firsthand.

---

## Concept Unit: `Parcelable` — Packaging a Whole Object Into an Intent

### The Problem

Three fields, three matching `putExtra`/`get*Extra` pairs — already a
little repetitive, and worth noticing the same failure shape as the
parallel-lists problem from earlier: if `Item` gains a fourth field (an
earlier exercise suggested a `sku`), it is entirely possible to add
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

### The Contract You're Implementing

`implements android.os.Parcelable` means fitting `Item` into a shape
Android itself already declared — worth reading that real shape before
writing `Item`'s implementation of it, rather than inferring it from
the code below. From `android.os.Parcelable` itself, not this project's
code (verified against the real interface, this session):

```java
public interface Parcelable {
    int describeContents();
    void writeToParcel(Parcel dest, int flags);

    interface Creator<T> {
        T createFromParcel(Parcel source);
        T[] newArray(int size);
    }
}
```

Three real facts this makes checkable instead of assumed: `Parcelable`
itself only actually requires two methods — `describeContents()` and
`writeToParcel(...)` — matching exactly the two `@Override`s below,
nothing more. `Creator<T>` is a *separate*, nested interface, not a
class — which is why `Item`'s own `CREATOR` field below has to
construct an anonymous object implementing it, rather than calling
some inherited method. And note what's *not* in this interface at
all: nothing here requires a field named `CREATOR`, or a constructor
shaped like `Item(Parcel in)` — those two are a convention Android's
runtime looks for by exact name via reflection when reconstructing a
`Parcelable`, not something the `Parcelable` type itself enforces the
way `describeContents()`/`writeToParcel()` are enforced by the
compiler. Missing either of the compiler-checked methods is a compile
error; getting `CREATOR`'s name wrong is a silent runtime failure
instead — worth knowing which kind of mistake each one actually is.

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

*Note on verification:* every earlier Java example in this curriculum
was run through `javac`/`java` on a plain JDK, no Android involved.
This one can't be — `android.os.Parcel` only exists inside a real
Android runtime, not the plain JDK this curriculum's throwaway labs use.
This exact code shape is Android's own documented `Parcelable` pattern;
Android Studio's own build (running it on your emulator, in **Run It**
below) is this unit's real verification.

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

`Item` as a whole is now a normal data-holder (everything built earlier,
unchanged) **plus** a self-contained description of how to serialize
and rebuild itself — every field this class has, in one place, instead
of scattered across whichever Activity happens to be sending or
receiving it.

### Introduce the Concept in Isolation

`CREATOR` above was built from `new Parcelable.Creator<Item>() { ... }`
— genuinely strange-looking syntax the first time you see it: no class
name, just `new InterfaceName() { ... }` with a body right there. This
is an **anonymous class**, and it exists for a specific reason worth
proving directly: `Parcelable.Creator` requires *two* methods
(`createFromParcel`, `newArray`), and every lambda this curriculum has
used so far — the earlier `OnTapListener`, this lesson's own
`OnItemClickListener` — only ever worked because each of those
interfaces had exactly *one* abstract method. See what happens when
that's no longer true. Create a folder for this lab. Inside it, create
a file named exactly `Calculator.java`:

```java
interface Calculator {
    int combine(int a, int b);
    int identity();
}
```

Create `BadLambdaDemo.java` in the same folder — try the lambda shape
you already know:

```java
public class BadLambdaDemo {
    public static void main(String[] args) {
        Calculator adder = (a, b) -> a + b;
    }
}
```

```
javac Calculator.java BadLambdaDemo.java
```

Real compiler output — verified this session, this genuinely fails to
compile:

```
BadLambdaDemo.java:3: error: incompatible types: Calculator is not a functional interface
        Calculator adder = (a, b) -> a + b;
                           ^
    multiple non-overriding abstract methods found in interface Calculator
1 error
```

*What this proves:* the compiler's own error names the exact rule —
"not a functional interface" — a lambda can only stand in for an
interface with exactly one abstract method, because a lambda's body
*is* that one method's implementation and nothing else; with two
methods, the compiler has no way to know which one your lambda body is
supposed to be. `Calculator` genuinely needs both `combine` and
`identity` implemented, same shape `Parcelable.Creator` needs both
`createFromParcel` and `newArray`.

Delete `BadLambdaDemo.java` and, in the same folder, create
`AnonDemo.java` — the fix:

```java
public class AnonDemo {
    public static void main(String[] args) {
        Calculator adder = new Calculator() {
            @Override
            public int combine(int a, int b) {
                return a + b;
            }

            @Override
            public int identity() {
                return 0;
            }
        };

        System.out.println(adder.combine(3, 4));
        System.out.println(adder.identity());
    }
}
```

Compile and run:

```
javac Calculator.java AnonDemo.java
java AnonDemo
```

Real output — verified this session:

```
7
0
```

*What this proves:* `new Calculator() { ... }` builds a real object
that implements `Calculator`, both methods included, in one expression
— no separate named `.java` file (the `Chime`-style long way), and no
lambda (impossible here, just proven). This is exactly the
tool `CREATOR` above needed: `Parcelable.Creator<Item>` has two
required methods, so an anonymous class — not a lambda — is what
implements it inline.

### Discard the Throwaway Example

Delete `Calculator.java`, `BadLambdaDemo.java`, and `AnonDemo.java` —
`CREATOR`, built above, is the real version of this same shape; nothing
here is reused.

### Mechanical Walkthrough

- `implements android.os.Parcelable` — **first appearance of
  `implements`** (as opposed to `extends`, used for every base class so
  far). `implements` fulfills an interface contract rather than
  inheriting a base class's implementation — `Parcelable` is an
  interface (same category of thing as `OnItemClickListener`, earlier
  this lesson, just framework-defined), requiring specific methods this
  class must supply.
- `protected Item(android.os.Parcel in)` — **first appearance of
  constructor overloading specifically**, applying this lesson's own
  proven overload-resolution mechanism to constructors instead of
  ordinary methods: a *second* constructor, same class name, different
  parameter list (`Parcel` instead of the three original fields) —
  chosen at compile time from the arguments at each `new Item(...)`
  call site, the exact static-dispatch mechanism the
  `Printer`/`OverloadDemo` lab proved, not a new rule for constructors.
  `Parcel` is the framework's serialized-bytes container that actually
  crosses the Intent boundary.
- `in.readString()` / `in.readInt()` — **first appearance.** Reads
  values back out of the `Parcel`, in a fixed order.
- `writeToParcel(Parcel dest, int flags)` — **first appearance,** the
  required interface method: writes this object's fields into a
  `Parcel`, in a matching order to the read side.
- `dest.writeString(name)` / `dest.writeInt(quantity)` /
  `dest.writeString(location)` — **first appearance**, the write-side
  counterparts. **Order matters and must match the reading constructor
  exactly** — this is a real, sharp edge of `Parcelable`: nothing
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
  `Parcelable` from a `Parcel` — this is the one piece of the mechanism
  that isn't just "a method you override," which is worth flagging: the
  framework's contract here relies on a magic field name, not purely on
  the interface's declared methods.
- `new Parcelable.Creator<Item>() { ... }` — **reappearing**, from this
  unit's own `Calculator`/`AnonDemo` lab above — an anonymous class,
  needed here because `Creator` requires two methods, exactly like
  `Calculator` did.
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
  `getIntExtra` — internally, this is what triggers the framework to
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
the OS (the same mechanism, unchanged) → `ItemDetailActivity.onCreate`
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

1. Add the `sku` field from an earlier exercise (if you did it) to
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
- [ ] You ran the `Printer`/`OverloadDemo` lab and the `StaticTypeDemo`
      compile error yourself, and can explain, in your own words, why
      overload resolution uses a variable's declared type rather than
      what it actually holds at runtime.
- [ ] You ran the `InterfaceDemo` lab and can explain, in your own
      words, why `InventoryAdapter` needed a listener interface instead
      of calling `startActivity` itself.
- [ ] You ran the `Calculator` lab, saw the real "not a functional
      interface" compiler error, then saw the anonymous-class fix work.
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
