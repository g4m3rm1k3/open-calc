# Lesson 8c: `Parcelable` — Android's Own Serialization

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 8b's serialization, Lesson
8a's anonymous class, Lesson 4f's `Intent`.

**Terms introduced in this lesson:**

- **`Parcelable`** — Android's own serialization interface for objects
  crossing an Intent/Bundle boundary, implemented by hand (a reading
  constructor, `writeToParcel`, `describeContents`, a `CREATOR` field)
  rather than via reflection, for performance.

---

## Concept Unit: `Parcelable` — Android's Own Serialization

### The Problem

An `Intent` (Lesson 4f) can carry extra data via `putExtra`, but only
for a fixed set of simple types Android already understands directly
(a `String`, an `int`). A custom object — an `Item`, say, with several
fields — has no built-in way to cross that same `Intent` boundary;
some serialization mechanism, specific to Android's own performance
needs, is required.

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

This is `Parcelable` — **first appearance**: Android's own
serialization interface for objects crossing an Intent/Bundle
boundary, implemented by hand (a reading constructor,
`writeToParcel`, `describeContents`, a `CREATOR` field) rather than
via reflection, for performance. `writeToParcel` is the serializing
direction — Lesson 8b's own `toTransportableText()`, applied to
Android's real `Parcel` format instead of plain text. The `Item(Parcel
in)` constructor plus `CREATOR` together are the deserializing
direction — Lesson 8b's own `fromTransportableText(...)`, split here
into a constructor Android calls directly and a required factory
object, `CREATOR`, that tells Android how to invoke it.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `class Item implements Parcelable { ... }` — **(b) reappearing**
   interface implementation from Lesson 0q, this time fulfilling a
   real framework contract with several required methods rather than
   one.
2. `protected Item(Parcel in) { name = in.readString(); quantity =
   in.readInt(); }` — **(a) first appearance** of a **reading
   constructor**: builds a new `Item` by reading fields back out, in
   the exact same order they were written, from a `Parcel` — Android's
   own real transportable-data container.
3. `writeToParcel(Parcel dest, int flags)` — **(a) first appearance**:
   writes each field into the `Parcel`, in a fixed, deliberate order
   that the reading constructor must match exactly.
4. `describeContents()` — **(a) first appearance**: returns `0` for
   ordinary objects; a nonzero value exists only for a rare,
   special-case content type this lesson doesn't need.
5. `public static final Parcelable.Creator<Item> CREATOR = new
   Parcelable.Creator<Item>() { ... }` — **(b) reappearing** anonymous
   class from Lesson 8a, real and load-bearing here: implementing two
   methods Android itself calls — `createFromParcel`, invoking the
   reading constructor directly, and `newArray`, needed whenever
   Android must produce an array of `Item` objects. This exact field
   name, `CREATOR`, is required — Android looks it up by that literal
   name via reflection when reconstructing a `Parcelable` from a
   `Parcel`.

### CS Lens

`Parcelable` is Lesson 8b's own serialization idea, real and
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
performance-sensitive serialization system across other platforms
making the identical tradeoff.

### SE Lens

The alternative — implementing Java's own built-in `Serializable`
interface instead, requiring no hand-written methods at all — was not
chosen for objects crossing frequent Intent/Bundle boundaries because
`Serializable`'s automatic, reflection-based approach is measurably
slower; `Parcelable`'s hand-written methods cost real, repetitive
code (one method per field, essentially) in exchange for meaningfully
better performance on exactly the boundary this method exists to
cross.

---

## Connect the Pieces

Lesson 8b's `toTransportableText()`/`fromTransportableText(...)`
established serialization in miniature. `Parcelable`'s
`writeToParcel`/reading-constructor/`CREATOR` triple is that exact
same idea, real: Android's own required shape for crossing an Intent
boundary, hand-written specifically for performance, using Lesson
8a's own anonymous class for its required `CREATOR` field.

## What Breaks Without This

Passing an `Item` object directly through `putExtra`, without
implementing `Parcelable` at all, fails to compile — there is no
matching `putExtra` overload accepting a plain, non-serializable
object.

## Exercises

1. Add a third field, `String category`, to `Item`, updating both the
   writing and reading sides of `Parcelable` correctly.
2. Deliberately write `Item`'s fields to the `Parcel` in one order
   inside `writeToParcel`, but read them back in a different order
   inside the reading constructor, and explain, in your own words,
   what would go wrong.
3. Explain, in your own words, why `CREATOR` must be named exactly
   `CREATOR`, `public`, `static`, and `final` all at once.

## Definition of Done

- [ ] You read the real `Parcelable` example and can explain which
      part corresponds to `toTransportableText()`, and which
      corresponds to `fromTransportableText(...)`.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why
      `Parcelable` is implemented by hand instead of using Java's
      automatic `Serializable`.
