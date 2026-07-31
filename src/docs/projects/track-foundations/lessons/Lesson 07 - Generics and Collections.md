# Lesson 07: Generics and Collections

**What you will build:** A disposable lab, same pattern as Lessons 01–06.
Today's case study: writing one class that works correctly with many
different types, still fully checked by the compiler — and the standard
library type built directly on top of that idea.

**What you need to know first:** Lesson 01's `class`, Lesson 06's
`interface`.

**Terms introduced in this lesson:**

- **Generics (type parameters)** — a type parameter that lets one
  implementation work correctly with many types while still being checked
  at compile time.
- **`List` / `ArrayList`** — an interface describing an ordered, resizable
  sequence of elements, with one concrete implementation backed by a real
  growable array.

---

## Concept Unit: Generics — One Implementation, Many Types

### The Problem

A container that holds exactly one `Dog` is easy to write — a field of
type `Dog`. A container that holds exactly one `Cat` needs the same code,
retyped, with `Dog` replaced by `Cat` everywhere. Writing that same
container once per type it might ever hold doesn't scale, and worse: a
`Box` written specifically for `Dog` gives up any way for the compiler
to catch a mistake if some other type is put in accidentally, unless it's
rewritten by hand for every type it needs to hold safely.

### Introduce the Concept in Isolation

```
mkdir lesson-07
cd lesson-07
```

Create `Main.java`:

```java
class Box<T> {
    private T contents;

    void put(T item) {
        contents = item;
    }

    T get() {
        return contents;
    }
}

public class Main {
    public static void main(String[] args) {
        Box<String> stringBox = new Box<String>();
        stringBox.put("Rex");
        System.out.println(stringBox.get());

        Box<Integer> intBox = new Box<Integer>();
        intBox.put(3);
        System.out.println(intBox.get());
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

The terminal prints:

```
Rex
3
```

`class Box<T> { ... }` is `generics` — **first appearance**: a type
parameter that lets one implementation work correctly with many types
while still being checked at compile time. `T` is a placeholder — a
**type parameter** — standing in for whatever real type is chosen when
`Box` is actually used. `Box<String>` and `Box<Integer>` are the *same*
class, `Box`, used with two different types substituted for `T`, with the
compiler checking each usage against its own chosen type.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class Box<T> { ... }` — **(a) first appearance.** `<T>` declares a
   type parameter named `T` (a conventional single-letter name for "the
   type this class works with," not a required one — any name would
   compile, but `T` is the near-universal convention).
2. `private T contents;` — a field declared with the type parameter
   itself as its type: whatever real type `T` becomes, `contents` holds
   exactly that type.
3. `void put(T item)` and `T get()` — a method taking `T` as a parameter,
   and a method returning `T`. Genuinely basic method syntax, reused from
   Lesson 02, sorted **(c)** — the new fact is only that `T` is used as an
   ordinary type here, exactly like `String` or `int` would be.
4. `Box<String> stringBox = new Box<String>();` — **(a) first appearance**
   of choosing a real type for `T`: everywhere `Box`'s own code says `T`,
   this specific `stringBox` behaves as though it said `String`. `put`
   only accepts a `String`; `get` returns a `String`.
5. `Box<Integer> intBox = new Box<Integer>();` — the same class, `Box`,
   used again with `Integer` (Java's object wrapper for `int`, needed here
   since a type parameter cannot be a primitive type directly) chosen for
   `T` instead. No new code was written for this — `Box`'s single
   declaration serves both cases.

### CS Lens

Generics let a type parameter stand in for a real type, checked at
compile time rather than left to run and possibly fail. This is
fundamentally different from Java's collections before generics existed
(and from Python's containers today): a `Box` without generics would need
to hold `Object` (Java's universal base type) and require an explicit
cast every time something is taken back out, with no compile-time
guarantee the cast is even correct. `Box<T>` gives that guarantee for
free — `stringBox.get()` is already known, at compile time, to return a
`String`, no cast needed.

Also recognized in: generics in C# (`Box<T>`, essentially identical
mechanism to Java's), templates in C++ (a related but more powerful
mechanism, resolved at compile time via code generation per type rather
than Java's type-erasure approach), type hints on Python's `list[str]`
(documentation only, never enforced by the interpreter — a real,
consequential contrast worth naming).

### SE Lens

The alternative — writing `StringBox`, `IntBox`, `DogBox`, one hand-typed
class per type ever needed — was not chosen because it multiplies the
same logic across every type, and any bug fix or behavior change to `Box`
would need to be repeated identically in every copy. Generics let `Box`
be written exactly once, correct for every type that will ever be
substituted for `T`, present and future, with the compiler — not the
programmer remembering to update every copy — responsible for keeping
each usage type-safe.

---

## Concept Unit: `List` / `ArrayList` — A Real, Load-Bearing Generic Type

### The Problem

`Box<T>` holds exactly one item. Most real programs need an ordered,
resizable sequence of many items — a shopping list, a set of rows to
display, a queue of tasks — and writing that container by hand, correctly
(handling resizing as items are added, keeping order, allowing lookups by
position), is real, nontrivial work that shouldn't need repeating in
every program that needs a list of something.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<String>();
        names.add("Rex");
        names.add("Fido");
        names.add("Buddy");

        System.out.println("Count: " + names.size());
        System.out.println("First: " + names.get(0));
    }
}
```

Compile and run it. The terminal prints:

```
Count: 3
First: Rex
```

`List<String>` and `ArrayList<String>` are `List` / `ArrayList` — **first
appearance**: an interface describing an ordered, resizable sequence of
elements (`List`), with one concrete implementation backed by a real
growable array (`ArrayList`). `List` is Lesson 06's interface concept,
generic over the element type; `ArrayList` is a class that `implements
List`, doing the actual work of growing, storing, and ordering the
elements. The variable is declared as the *interface* type, `List`, per
Lesson 06's "program to an interface" principle, while the *object*
actually built is the concrete `ArrayList`.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `import java.util.List;` and `import java.util.ArrayList;` — **(a)
   first appearance** of `import`: both `List` and `ArrayList` are part of
   Java's own standard library, not written by this program, and living
   in a package (`java.util`) that must be explicitly imported before its
   names can be used unqualified. `java.util` is the standard library's
   own utility package — collections, dates, and other general-purpose
   tools live here, distinct from this program's own classes.
2. `List<String> names = new ArrayList<String>();` — `List<String>`,
   declared as the interface, generic over `String`, per this lesson's
   first unit. `new ArrayList<String>()` builds the actual, concrete
   growable-array implementation — the same interface/implementation
   split as Lesson 06's `Flyer myBird = new Bird();`, now applied to a
   real standard-library type.
3. `names.add("Rex");` — **(a) first appearance** of `add`, a method
   declared by `List`'s contract: appends one element to the end,
   growing the underlying storage automatically if needed. Called three
   times, adding three elements in order.
4. `names.size()` — **(a) first appearance**: returns the current number
   of elements, `3` after three `add` calls.
5. `names.get(0)` — **(a) first appearance**: returns the element at a
   given position, counting from `0` — position `0` is the *first*
   element added, `"Rex"`, not a special or arbitrary one.

### CS Lens

`List<Item>` is a concrete, load-bearing example of generics and
programming-to-an-interface working together: the *interface* (`List`)
describes what any ordered sequence can do — `add`, `get`, `size`, and
more — generically, for any element type; the *implementation*
(`ArrayList`) is one specific, efficient way to actually store those
elements. Code written against `List<String>` works identically whether
the real object is an `ArrayList` or any other class that implements
`List`, exactly as Lesson 06's `Airport.launch(Flyer anything)` worked for
any `Flyer`.

Also recognized in: `list` in Python (both the interface and the only
real implementation at once — no separate abstraction exists, a real
contrast with Java's split), `IList<T>` / `List<T>` in C# (an identical
interface/implementation split to Java's own).

### SE Lens

The alternative — writing a hand-rolled growable array class from scratch
in every program that needs one — was not chosen because `ArrayList`
already exists, already handles resizing correctly, and has already been
used and tested by millions of other programs. Programming against
`List` rather than `ArrayList` directly means a different implementation
(there are others in the standard library, with different performance
tradeoffs) could be substituted later with no change to any code that
only ever called `List`'s own methods — the same payoff Lesson 06's
`program-to-an-interface` principle already established, now paying off
against real, everyday code instead of a `Flyer` example.

---

## Connect the Pieces

`Box<T>` established that a type parameter lets one class work correctly
with many types, checked at compile time. `List<String>`/`new
ArrayList<String>()` is that exact same mechanism, used for real: `List`
is a generic interface (Lesson 06's contract, now parameterized over an
element type), `ArrayList` is one concrete implementation of it, and
`names.add(...)`/`names.get(...)`/`names.size()` are the contract's own
methods, working correctly and safely for `String` here, and for any
other type a different `List<T>` might be declared to hold.

## What Breaks Without This

Try adding the wrong type to a generic list:

```java
List<String> names = new ArrayList<String>();
names.add("Rex");
names.add(3);
```

This fails to compile with an error resembling:

```
error: no suitable method found for add(int)
        names.add(3);
             ^
```

`List<String>` genuinely locked `add` to only accept `String` arguments —
this is caught before the program ever runs, not discovered later when
something tries to treat `3` as text and fails unpredictably. This is the
concrete difference from Python's `list`, which accepts any type in any
position with no complaint at all — the mistake would only surface later,
at the point something actually tries to use the wrong-typed value.

## Exercises

1. Change `Box<T>` to `Box<Dog>` from Lesson 01/02's `Dog` class (or a
   fresh minimal one), confirming a user-defined class works as a type
   parameter exactly like `String` or `Integer` did.
2. Add a `for` loop over `names` (`for (String name : names) { ... }`)
   and print each one — confirm it visits all three names in the order
   they were added.
3. Try `names.add(3);` yourself, read the real compiler error, then
   remove the line.

## Definition of Done

- [ ] You ran the `Box<T>` example with two different types and saw both
      real outputs.
- [ ] You ran the `List<String>`/`ArrayList<String>` example and saw the
      real count and first-element output.
- [ ] You deliberately added a wrong-typed element to a `List<String>`,
      saw the real compiler error, and removed it.
- [ ] You can state, without looking back at this lesson, the difference
      between `List` and `ArrayList`.
