# Lesson 8b: Serialization

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0c's `object`, Lesson 0f's
constructor.

**Terms introduced in this lesson:**

- **Serialization** — converting an in-memory object into a linear
  sequence of bytes or characters that can cross a boundary the
  original object reference can't, plus the matching deserialization
  step to rebuild it on the other side.

---

## Concept Unit: Serialization

### The Problem

An object's reference (Lesson 4a) only means something within the
exact same running process — it's a pointer into that process's own
memory. The moment an object needs to cross a genuine boundary — saved
to a file, sent over a network, handed to a completely separate
process — a plain reference is meaningless on the other side. Some way
to turn the object's actual data into a transportable form, and
rebuild it from that form later, is required.

### Introduce the Concept in Isolation

```
mkdir lesson-8b
cd lesson-8b
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
2. `original.toTransportableText()` — reads `original`'s own fields
   and produces the plain string `"3,7"`. `original` itself is
   unchanged and still exists.
3. `Point.fromTransportableText("3,7")` — parses the string, then
   calls `new Point(3, 7)` a *second* time, internally, building a
   genuinely new, separate object — `rebuilt` is never `original`'s
   own reference; it's a distinct object that merely holds equal field
   values, the same identity-versus-equality distinction Lesson 4c
   already established.
4. Printing both confirms the round trip: `rebuilt.x`/`rebuilt.y`
   match `original`'s own values, despite `rebuilt` having been built
   from nothing but plain text, with no reference to `original`
   involved at all.

`toTransportableText()` and `fromTransportableText(...)` are
`serialization` — **first appearance**: converting an in-memory
object into a linear sequence of bytes or characters that can cross a
boundary the original object reference can't, plus the matching
deserialization step to rebuild it on the other side. `original` and
`rebuilt` are two genuinely separate `Point` objects — `rebuilt` was
never handed `original`'s own reference at all, only the text `"3,7"`,
and correctly reconstructed an equivalent object from it.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `String toTransportableText() { return x + "," + y; }` — **(a)
   first appearance** of the serializing direction: converts this
   specific object's field values into one plain `String`, using a
   simple, arbitrary format (comma-separated) this lesson invented for
   the purpose.
2. `static Point fromTransportableText(String text) { ... }` — **(a)
   first appearance** of the deserializing direction: parses that same
   plain text back into field values, and constructs a brand-new
   `Point` from them. `static` (Lesson 0i) because this method doesn't
   operate on an existing `Point` — it produces one.
3. `text.split(",")` — **(a) first appearance**: splits a `String`
   into an array wherever the given character appears, here separating
   `"3"` from `"7"`.
4. `Integer.parseInt(parts[0])` — **(b) reappearing** from Lesson 0y,
   converting each text piece back into a real `int`.

### CS Lens

Serialization is the general problem; this lesson's comma-separated
text is one deliberately simple *format* solving it. Real systems use
more robust formats (JSON, binary protocols) specifically because
comma-splitting breaks the moment a value itself contains a comma — a
real, genuine limitation this lesson's own toy format doesn't handle,
named here rather than hidden.

Also recognized in: JSON serialization (a later lesson's own subject,
solving the same problem with a more robust, general format), `pickle`
in Python, any database's own row-to-object mapping, network
protocols generally — every boundary a plain in-memory reference
cannot cross needs some serialization format to bridge it.

### SE Lens

The alternative — attempting to hand `original`'s own reference
directly across a process or file boundary — was not chosen because
it's not merely difficult, it's meaningless: a reference is a pointer
into one specific process's own memory, and has no valid
interpretation in any other process, or in a file, at all.
Serialization is not an optimization; it's the only way data can
cross this kind of boundary.

---

## Connect the Pieces

`toTransportableText()`/`fromTransportableText(...)` established
serialization in miniature: convert an object to a transportable
form, then rebuild an equivalent object from that form on the other
side. The next lesson (`Parcelable`) shows Android's own real,
required version of exactly this idea.

## What Breaks Without This

Attempting to hand an object's own reference directly to a different
process or a saved file is meaningless — the pointer only has meaning
inside the exact process that created it.

## Exercises

1. Add a third field, `String label`, to `Point`, updating both the
   writing and reading sides correctly.
2. Try passing a value containing a comma through this lesson's own
   format, and explain, in your own words, what would go wrong.
3. Explain, in your own words, why `rebuilt` and `original` are
   genuinely separate objects, not aliases of each other.

## Definition of Done

- [ ] You ran the plain-text serialization example and saw the real
      round-trip output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why a plain
      object reference cannot cross a process or file boundary.
