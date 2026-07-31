# Lesson 20: Arrays and the Generic `ArrayList`

**What you will build:** Nothing in the real project yet — two disposable
labs closing a gap Lesson 01 deliberately left open (`String[] args` was
flagged "ceremonial, for now") and introducing the collection type the
grid screen's data actually needs. The transferable problem: Java's plain
arrays are fixed in size the moment they're created — genuinely
unsuitable for a dataset a user adds to and deletes from at runtime — and
the standard library's answer to that isn't a special case, it's Java's
first **generic class** this series has met, as opposed to Lesson 12's
generic *method*.

**What you need to know first:** Lesson 12 (generic methods, bounded
type parameters), Lesson 18 (why this project's grid needs dynamic,
runtime-editable data), Lesson 19 (method overloading).

**Terms introduced in this lesson:**
- **Array** — a fixed-size, ordered, indexed collection of values, all of
  the same declared type, created with a size that cannot change
  afterward.
- **Index / `[]` access** — reading or writing one element of an array by
  its position, counting from zero.
- **Generic class** — a class whose declaration itself takes a type
  parameter, usable with different concrete types without rewriting the
  class, as opposed to Lesson 12's generic *method*, where only one
  method (not the whole class) was parameterized.
- **`List<E>` / `ArrayList<E>`** — a standard-library interface
  (`List`) and a concrete implementing class (`ArrayList`), both generic,
  representing a growable, ordered collection.

---

## Concept Unit: Arrays — Fixed-Size and Indexed

### The Problem

Lesson 01 used `String[] args` without explaining what an array actually
is, flagging it "ceremonial, for now." Before reaching for something more
flexible, the plain array deserves the real explanation it was owed.

### Introduce the Concept in Isolation

```java
public class ArrayDemo {
    public static void main(String[] args) {
        String[] fruits = new String[3];
        fruits[0] = "Apple";
        fruits[1] = "Banana";
        fruits[2] = "Cherry";

        System.out.println(fruits[1]);
        System.out.println(fruits.length);
    }
}
```

Compile and run:

```
javac ArrayDemo.java
java ArrayDemo
```

Real output:

```
Banana
3
```

`new String[3]` creates an array with room for exactly three `String`
values — a fixed size, decided at creation and never changeable
afterward. `fruits[0]`, `fruits[1]`, `fruits[2]` are **index** accesses —
`[]` after a variable name reads or writes one specific slot, counting
from zero, so `fruits[1]` is the *second* element, `"Banana"`.
`fruits.length` reads the array's fixed size directly — not a method
call (no parentheses), a genuine field every array carries.

Now prove the fixed-size claim directly:

```java
fruits[3] = "Date";
```

Added to the same file and re-run:

```
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3
```

There is no slot 3 in a 3-element array (valid indices are 0, 1, 2) —
and, more fundamentally, there is no way to add a fourth slot to this
array at all, ever, once created. This is the real limitation the next
unit exists to solve.

### Discard the Throwaway Example

Deleted now — the array concept carries forward, this exact demo code
does not.

### CS Lens

An array is the most basic possible **contiguous, indexed data
structure** — a fixed block of memory, one slot per element, accessed by
direct position. Virtually every other data structure in computer
science (lists, stacks, queues, hash tables) is either built directly on
top of an array or exists specifically to solve a limitation a plain
array has.

Also recognized in: every language's array or fixed-size buffer type,
raw memory buffers in systems programming, and pixel buffers in graphics
programming, where a fixed, contiguous, indexed block is exactly the
right structure for genuinely fixed-size data.

---

## Concept Unit: `ArrayList<E>` — a Generic Class, Not Just a Bigger Array

### The Problem

The grid screen's data is exactly the case a plain array handles badly:
rows get added and deleted while the app runs, and a plain array's size
can never change after creation. Java's standard library solves this with
`ArrayList` — and `ArrayList` is generic at the *class* level, meaning
the type parameter is part of the class declaration itself, unlike
Lesson 13's `findViewById`, where only one method carried a type
parameter while the surrounding `Activity` class was not itself generic.

### Introduce the Concept in Isolation

```java
import java.util.ArrayList;
import java.util.List;

public class ArrayListDemo {
    public static void main(String[] args) {
        List<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");

        System.out.println(fruits.get(1));
        System.out.println(fruits.size());

        fruits.add("Date");
        System.out.println(fruits.size());

        fruits.remove("Banana");
        System.out.println(fruits);
    }
}
```

Compile and run:

```
javac ArrayListDemo.java
java ArrayListDemo
```

Real output:

```
Banana
3
4
[Apple, Cherry, Date]
```

`List<String>` and `ArrayList<String>` are both **generic types**: `List`
is an interface (Lesson 14's concept, reappearing — a contract with no
implementation) describing "an ordered collection," and `ArrayList` is
one concrete class implementing that interface, backed internally by a
real array it manages and resizes on your behalf. `<String>` is the type
argument, filling in the class's own generic parameter — this exact same
`ArrayList` class works identically for `ArrayList<Integer>`,
`ArrayList<Button>`, or any other type, with the compiler enforcing that
only `String`s ever go into this particular list. `new ArrayList<>()` —
the empty `<>` is a shorthand (called the "diamond operator") letting the
compiler infer the type argument from the variable's own declared type
(`List<String>`) instead of repeating it. `.add(...)` appends an element
and, unlike the array lab above, the list simply grows — no fixed size
was ever declared, and no exception occurred adding a fourth element.
`.get(1)` reads by index, the generic-method equivalent of the array
lab's `fruits[1]`. `.size()` is a method call (parentheses, unlike an
array's plain `.length` field) returning the current element count, which
changes as elements are added or removed. `.remove("Banana")` removes the
*first matching element by value*, not by index — a real distinction:
`List` declares a **second, overloaded** `.remove(int index)` too
(Lesson 19's concept, reappearing on a real standard-library class),
removing by position instead, and picking the wrong one for your intent
is a real, easy mistake.

### Discard the Throwaway Example

Deleted now — the concept carries forward, this exact demo code does
not.

### CS Lens

A generic class is **parametric polymorphism** — one single, real
implementation working correctly across many different types, with the
compiler enforcing type safety at every use site rather than the class
needing to be copy-pasted per type or resorting to unchecked casts.
`ArrayList` itself is a **dynamic array**: internally, it still uses a
plain fixed-size array exactly like the one in the lab above, but
transparently allocates a new, larger one and copies existing elements
over whenever it runs out of room — the resizing cost is real but hidden
from your code entirely.

Also recognized in: Java's own broader collections framework (`HashMap<K, V>`,
`HashSet<E>`, all generic the same way), C++'s templates and C#'s
generics (same core idea, different syntax), and any standard library
container type across virtually every modern language.

### SE Lens

**Why does Java provide both a generic *interface* (`List`) and a
concrete *implementing class* (`ArrayList`), rather than just one
concrete type?** Declaring the variable as `List<String>` rather than
`ArrayList<String>` (as the lab above deliberately did) means the actual
implementation can be swapped later — for a `LinkedList`, structurally
different internally and better suited to different usage patterns —
without touching any code that only ever calls `List`'s own methods
(`.add`, `.get`, `.size`). This is the same **dependency on an
abstraction, not a concrete implementation** principle Lesson 14's
interface discussion already introduced, applied here to a real,
standard-library type instead of a hand-written example.

---

## Connect the Pieces

One trace: the array lab proved a fixed-size, indexed structure that
cannot grow. The `ArrayList` lab proved a generic class — parameterized
at the class level, unlike Lesson 13's generic method — implementing
`List`, internally backed by exactly the kind of array just proven
limited, but transparently resized as elements are added. The grid
screen's data — rows a user adds and deletes at runtime — is precisely
the case that rules out a plain array and calls for this generic,
growable collection instead.

## What Breaks Without This

In the `ArrayListDemo` lab, call `fruits.remove(1)` instead of
`fruits.remove("Banana")` right after adding all four fruits (before any
removal), and print the list. Real output:

```
[Apple, Cherry, Date]
```

Notice this removes **by index** (position 1 — `"Banana"`, coincidentally
the same element the string-based `.remove("Banana")` call also
targeted) — confirm this by reversing the fruits' insertion order and
re-running: `fruits.remove(1)` now removes a *different* fruit than
`fruits.remove("Banana")` would, proving concretely that these are two
distinct, overloaded methods, not one method behaving two ways by
accident.

## Exercises

1. In the array lab, print `fruits.length` before assigning any values at
   all (right after `new String[3]`), and separately print `fruits[0]`
   at that same point. Confirm arrays start with every slot holding
   Java's default empty-reference value, `null` — a fixed number of
   slots exists immediately, even before anything is stored in them.
2. In the `ArrayList` lab, add a `.contains("Cherry")` call and print its
   result before and after a `.remove("Cherry")` call, confirming what it
   reports in each case.

## Definition of Done

- [ ] You ran both labs and saw the real `ArrayIndexOutOfBoundsException`
      from the fixed-size array.
- [ ] You can explain, precisely, what makes `ArrayList` a *generic
      class* as opposed to Lesson 13's generic *method*.
- [ ] You triggered the by-index-vs-by-value `.remove` distinction
      yourself and can state which overload you'd reach for in a real
      case.
- [ ] Commit: not applicable — both examples are throwaway labs.

Next: a small data class to represent one grid row, and the first real
use of `new` to build an object from it.
