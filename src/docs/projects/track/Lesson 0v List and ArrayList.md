# Lesson 0v: `List` / `ArrayList` — A Real, Load-Bearing Generic Type

**What you will build:** A disposable lab, using Java's real standard
library.

**What you need to know first:** Lesson 0u's generics, Lesson 0r's
program-to-an-interface.

**Terms introduced in this lesson:**

- **`List` / `ArrayList`** — an interface describing an ordered,
  resizable sequence of elements, with one concrete implementation
  backed by a real growable array.

---

## Concept Unit: `List` / `ArrayList` — A Real, Load-Bearing Generic Type

### The Problem

Lesson 0u's `Box<T>` holds exactly one item. Most real programs need
an ordered, resizable sequence of many items — a shopping list, a set
of rows to display, a queue of tasks — and writing that container by
hand, correctly (handling resizing as items are added, keeping order,
allowing lookups by position), is real, nontrivial work that shouldn't
need repeating in every program that needs a list of something.

### Introduce the Concept in Isolation

```
mkdir lesson-0v
cd lesson-0v
```

Create `Main.java`:

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

Compile and run it:

```
javac Main.java
java Main
```

The terminal prints:

```
Count: 3
First: Rex
```

`List<String>` and `ArrayList<String>` are `List` / `ArrayList` —
**first appearance**: an interface describing an ordered, resizable
sequence of elements (`List`), with one concrete implementation backed
by a real growable array (`ArrayList`). `List` is Lesson 0q's interface
concept, generic over the element type; `ArrayList` is a class that
`implements List`, doing the actual work of growing, storing, and
ordering the elements. The variable is declared as the *interface*
type, `List`, per Lesson 0r's "program to an interface" principle,
while the *object* actually built is the concrete `ArrayList`.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `import java.util.List;` and `import java.util.ArrayList;` — **(a)
   first appearance** of `import`: both `List` and `ArrayList` are
   part of Java's own standard library, not written by this program,
   and living in a package (`java.util`) that must be explicitly
   imported before its names can be used unqualified.
2. `List<String> names = new ArrayList<String>();` — `List<String>`,
   declared as the interface, generic over `String`. `new
   ArrayList<String>()` builds the actual, concrete growable-array
   implementation — the same interface/implementation split as
   Lesson 0q's `Flyer myBird = new Bird();`, now applied to a real
   standard-library type.
3. `names.add("Rex");` — **(a) first appearance** of `add`, a method
   declared by `List`'s contract: appends one element to the end,
   growing the underlying storage automatically if needed. Called
   three times, adding three elements in order.
4. `names.size()` — **(a) first appearance**: returns the current
   number of elements, `3` after three `add` calls.
5. `names.get(0)` — **(a) first appearance**: returns the element at a
   given position, counting from `0` — position `0` is the *first*
   element added, `"Rex"`, not a special or arbitrary one.

### CS Lens

`List<Item>` is a concrete, load-bearing example of generics and
programming-to-an-interface working together: the *interface* (`List`)
describes what any ordered sequence can do — `add`, `get`, `size`, and
more — generically, for any element type; the *implementation*
(`ArrayList`) is one specific, efficient way to actually store those
elements.

Also recognized in: `list` in Python (both the interface and the only
real implementation at once — no separate abstraction exists, a real
contrast with Java's split), `IList<T>` / `List<T>` in C# (an identical
interface/implementation split to Java's own).

### SE Lens

The alternative — writing a hand-rolled growable array class from
scratch in every program that needs one — was not chosen because
`ArrayList` already exists, already handles resizing correctly, and has
already been used and tested by millions of other programs. Programming
against `List` rather than `ArrayList` directly means a different
implementation could be substituted later with no change to any code
that only ever called `List`'s own methods.

---

## Connect the Pieces

Lesson 0u's `Box<T>` proved generics work for a hand-written class.
`List<String>`/`new ArrayList<String>()` is that exact same mechanism,
used for real: `List` is a generic interface, `ArrayList` is one
concrete implementation of it, and `add`/`get`/`size` are the
contract's own methods.

## What Breaks Without This

Try adding the wrong type to a generic list:

```java
List<String> names = new ArrayList<String>();
names.add(3);
```

Compile it yourself to see the real compiler error — `List<String>`
genuinely locked `add` to only accept `String` arguments, caught before
the program ever runs.

## Exercises

1. Add a `for` loop over `names` (`for (String name : names) { ... }`)
   and print each one — confirm it visits all three names in the order
   they were added.
2. Add a fourth name and confirm `size()` now returns `4`.
3. Try `names.add(3);` yourself, read the real compiler error, then
   remove the line.

## Definition of Done

- [ ] You ran the example and saw the real count and first-element
      output.
- [ ] You completed Exercise 3 and saw the real compiler error.
- [ ] You can state, without looking back at this lesson, the
      difference between `List` and `ArrayList`.
