# Lesson 23: Serialization and Parcelable

**What you will build:** The first unit is a small, fully runnable, plain
Java lab. The second reads Android's real `Parcelable` contract directly.

**What you need to know first:** Lesson 01's `object`, Lesson 02's
`constructor`, Lesson 19's `Intent`.

**Terms introduced in this lesson:**

- **Serialization** — converting an in-memory object into a linear
  sequence of bytes or characters that can cross a boundary the original
  object reference can't, plus the matching deserialization step to
  rebuild it on the other side.
- **`Parcelable`** — Android's own serialization interface for objects
  crossing an Intent/Bundle boundary, implemented by hand (a reading
  constructor, `writeToParcel`, `describeContents`, a `CREATOR` field)
  rather than via reflection, for performance.

---

## Concept Unit: Serialization

### The Problem

An object's reference (Lesson 17) only means something within the exact
same running process — it's a pointer into that process's own memory.
The moment an object needs to cross a genuine boundary — saved to a file,
sent over a network, handed to a completely separate process — a plain
reference is meaningless on the other side. Some way to turn the object's
actual data into a transportable form, and rebuild it from that form
later, is required.

### Introduce the Concept in Isolation

```
mkdir lesson-23
cd lesson-23
```

Create `Main.java`:

```java
class Point {
    int x;
    int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    String toTransportableText() {
        return x + "," + y;
    }

    static Point fromTransportableText(String text) {
        String[] parts = text.split(",");
        return new Point(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]));
    }
}

public class Main {
    public static void main(String[] args) {
        Point original = new Point(3, 7);
        String transportable = original.toTransportableText();

        System.out.println("Transportable form: " + transportable);

        Point rebuilt = Point.fromTransportableText(transportable);
        System.out.println("Rebuilt: (" + rebuilt.x + ", " + rebuilt.y + ")");
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
Transportable form: 3,7
Rebuilt: (3, 7)
```

#### Execution Trace

Two separate `Point` objects are built here — one directly, one as a
result of deserializing — and it matters which is which:

1. `new Point(3, 7)`, assigned to `original` — builds the first,
   genuinely real object with `x = 3`, `y = 7`.
2. `original.toTransportableText()` — reads `original`'s own fields and
   produces the plain string `"3,7"`. `original` itself is unchanged and
   still exists.
3. `Point.fromTransportableText("3,7")` — parses the string, then calls
   `new Point(3, 7)` a *second* time, internally, building a genuinely
   new, separate object — `rebuilt` is never `original`'s own reference;
   it's a distinct object that merely holds equal field values, the same
   identity-versus-equality distinction Lesson 18 already established.
4. Printing both confirms the round trip: `rebuilt.x`/`rebuilt.y` match
   `original`'s own values, despite `rebuilt` having been built from
   nothing but plain text, with no reference to `original` involved at
   all.

`toTransportableText()` and `fromTransportableText(...)` are
`serialization` — **first appearance**: converting an in-memory object
into a linear sequence of bytes or characters that can cross a boundary
the original object reference can't, plus the matching deserialization
step to rebuild it on the other side. `original` and `rebuilt` are two
genuinely separate `Point` objects — `rebuilt` was never handed
`original`'s own reference at all, only the text `"3,7"`, and correctly
reconstructed an equivalent object from it.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `String toTransportableText() { return x + "," + y; }` — **(a) first
   appearance** of the serializing direction: converts this specific
   object's field values into one plain `String`, using a simple,
   arbitrary format (comma-separated) this lesson invented for the
   purpose.
2. `static Point fromTransportableText(String text) { ... }` — **(a)
   first appearance** of the deserializing direction: parses that same
   plain text back into field values, and constructs a brand-new `Point`
   from them. `static` (Lesson 03) because this method doesn't operate on
   an existing `Point` — it produces one.
3. `text.split(",")` — **(a) first appearance**: splits a `String` into
   an array wherever the given character appears, here separating `"3"`
   from `"7"`.
4. `Integer.parseInt(parts[0])` — **(b) reappearing** from Lesson 09,
   converting each text piece back into a real `int`.

### CS Lens

Serialization is the general problem; this lesson's comma-separated text
is one deliberately simple *format* solving it. Real systems use more
robust formats (JSON, binary protocols) specifically because
comma-splitting breaks the moment a value itself contains a comma — a
real, genuine limitation this lesson's own toy format doesn't handle,
named here rather than hidden.

Also recognized in: JSON serialization (a later lesson's own subject,
solving the same problem with a more robust, general format), `pickle`
in Python, any database's own row-to-object mapping, network protocols
generally — every boundary a plain in-memory reference cannot cross needs
some serialization format to bridge it.

### SE Lens

The alternative — attempting to hand `original`'s own reference directly
across a process or file boundary — was not chosen because it's not
merely difficult, it's meaningless: a reference is a pointer into one
specific process's own memory, and has no valid interpretation in any
other process, or in a file, at all. Serialization is not an
optimization; it's the only way data can cross this kind of boundary.

---

## Concept Unit: `Parcelable` — Android's Own Serialization

### The Problem

An `Intent` (Lesson 19) can carry extra data via `putExtra`, but only for
a fixed set of simple types Android already understands directly (a
`String`, an `int`). A custom object — an `Item`, say, with several
fields — has no built-in way to cross that same `Intent` boundary; some
serialization mechanism, specific to Android's own performance needs, is
required.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
class Item implements Parcelable {
    String name;
    int quantity;

    Item(String name, int quantity) {
        this.name = name;
        this.quantity = quantity;
    }

    protected Item(Parcel in) {
        name = in.readString();
        quantity = in.readInt();
    }

    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(name);
        dest.writeInt(quantity);
    }

    public int describeContents() {
        return 0;
    }

    public static final Parcelable.Creator<Item> CREATOR =
        new Parcelable.Creator<Item>() {
            public Item createFromParcel(Parcel in) {
                return new Item(in);
            }

            public Item[] newArray(int size) {
                return new Item[size];
            }
        };
}
```

This is `Parcelable` — **first appearance**: Android's own serialization
interface for objects crossing an Intent/Bundle boundary, implemented by
hand (a reading constructor, `writeToParcel`, `describeContents`, a
`CREATOR` field) rather than via reflection, for performance.
`writeToParcel` is the serializing direction — this lesson's own
`toTransportableText()`, applied to Android's real `Parcel` format
instead of plain text. The `Item(Parcel in)` constructor plus `CREATOR`
together are the deserializing direction — this lesson's own
`fromTransportableText(...)`, split here into a constructor Android calls
directly and a required factory object, `CREATOR`, that tells Android how
to invoke it.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `class Item implements Parcelable { ... }` — **(b) reappearing**
   interface implementation from Lesson 06, this time fulfilling a real
   framework contract with several required methods rather than one.
2. `protected Item(Parcel in) { name = in.readString(); quantity =
   in.readInt(); }` — **(a) first appearance** of a **reading
   constructor**: builds a new `Item` by reading fields back out, in the
   exact same order they were written, from a `Parcel` — Android's own
   real transportable-data container.
3. `writeToParcel(Parcel dest, int flags)` — **(a) first appearance**:
   writes each field into the `Parcel`, in a fixed, deliberate order that
   the reading constructor must match exactly.
4. `describeContents()` — **(a) first appearance**: returns `0` for
   ordinary objects; a nonzero value exists only for a rare, special-case
   content type this lesson doesn't need.
5. `public static final Parcelable.Creator<Item> CREATOR = new
   Parcelable.Creator<Item>() { ... }` — **(a) first appearance** of the
   required `CREATOR` field: an anonymous class (a later lesson's own
   full subject) implementing two methods Android itself calls —
   `createFromParcel`, invoking the reading constructor directly, and
   `newArray`, needed whenever Android must produce an array of `Item`
   objects. This exact field name, `CREATOR`, is required — Android looks
   it up by that literal name via reflection when reconstructing a
   `Parcelable` from a `Parcel`.

### CS Lens

`Parcelable` is this lesson's own serialization idea, real and
load-bearing: `writeToParcel` mirrors `toTransportableText()`; the
reading constructor plus `CREATOR` mirror `fromTransportableText(...)`.
The real difference is performance: `Parcelable` requires writing this
by hand, field by field, specifically to avoid the slower, automatic
reflection-based serialization Java's own built-in `Serializable`
interface would otherwise use — a real, deliberate tradeoff a later
lesson on reflection returns to directly.

Also recognized in: Protocol Buffers and other binary serialization
formats (also written or generated field-by-field for performance,
rather than relying on slower automatic reflection), any
performance-sensitive serialization system across other platforms making
the identical tradeoff.

### SE Lens

The alternative — implementing Java's own built-in `Serializable`
interface instead, requiring no hand-written methods at all — was not
chosen for objects crossing frequent Intent/Bundle boundaries because
`Serializable`'s automatic, reflection-based approach is measurably
slower; `Parcelable`'s hand-written methods cost real, repetitive code
(one method per field, essentially) in exchange for meaningfully better
performance on exactly the boundary this method exists to cross.

---

## Connect the Pieces

`toTransportableText()`/`fromTransportableText(...)` established
serialization in miniature: convert an object to a transportable form,
then rebuild an equivalent object from that form on the other side.
`Parcelable`'s `writeToParcel`/reading-constructor/`CREATOR` triple is
that exact same idea, real: Android's own required shape for crossing an
Intent boundary, hand-written specifically for performance rather than
relying on Java's slower, automatic `Serializable` alternative.

## What Breaks Without This

Passing an `Item` object directly through `putExtra`, without
implementing `Parcelable` at all, fails to compile — there is no
matching `putExtra` overload accepting a plain, non-serializable object.
Forcing it through `Serializable` instead (Java's own automatic
alternative) compiles, but every field must genuinely be serializable
itself, and the automatic, reflection-based process is measurably
slower than a hand-written `Parcelable` — the concrete, real-world reason
Android's own APIs and this curriculum both favor `Parcelable` for
frequently-passed objects.

## Exercises

1. Add a third field, `String category`, to both this lesson's plain
   `Point`-style serialization example and its `Item`/`Parcelable`
   example, updating both the writing and reading sides of each
   correctly.
2. Deliberately write `Item`'s fields to the `Parcel` in one order inside
   `writeToParcel`, but read them back in a different order inside the
   reading constructor, and explain, in your own words, what would go
   wrong (this doesn't need to be run against a real device to reason
   through correctly).
3. Explain, in your own words, why `CREATOR` must be named exactly
   `CREATOR`, `public`, `static`, and `final` all at once.

## Definition of Done

- [ ] You ran the plain-text serialization example and saw the real
      round-trip output.
- [ ] You completed Exercise 1 and correctly added a third field to both
      serialization examples.
- [ ] You can state, without looking back at this lesson, which part of
      `Parcelable`'s shape corresponds to `toTransportableText()`, and
      which corresponds to `fromTransportableText(...)`.
