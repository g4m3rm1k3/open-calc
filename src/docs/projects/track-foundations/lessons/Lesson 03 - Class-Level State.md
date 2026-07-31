# Lesson 03: Class-Level State

**What you will build:** A disposable lab, same pattern as Lessons 01–02.
Today's case study: state that belongs to a class itself, not to any one
object built from it — and, as a direct payoff, finally explaining
`public static void main`, present unexplained on the first line of every
example so far.

**What you need to know first:** Lesson 01's `class` and `object` — the
difference between a blueprint and a specific thing built from it.

**Terms introduced in this lesson:**

- **Class-level state (`static`)** — a field or method that belongs to
  the class itself, existing exactly once and shared by every instance,
  rather than belonging to any one object.

---

## Concept Unit: State That Belongs to the Class, Not the Object

### The Problem

Every field seen so far — `name`, `age` — belongs to one specific `Dog`
object; each `Dog` gets its own independent copy. But some data doesn't
make sense per-object at all. How many `Dog` objects have been created
*in total*, across the whole program, isn't a property of any single dog
— it's a property of the `Dog` class itself, shared and updated no matter
which object triggers the change. A field on any one `Dog` object can't
represent that; it needs to live somewhere that isn't tied to any
particular instance.

### Introduce the Concept in Isolation

```
mkdir lesson-03
cd lesson-03
```

Create `Main.java`:

```java
class Dog {
    String name;
    static int totalDogsCreated = 0;

    Dog(String name) {
        this.name = name;
        totalDogsCreated = totalDogsCreated + 1;
    }
}

public class Main {
    public static void main(String[] args) {
        Dog first = new Dog("Rex");
        Dog second = new Dog("Fido");
        Dog third = new Dog("Buddy");

        System.out.println("Total dogs created: " + Dog.totalDogsCreated);
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
Total dogs created: 3
```

A field marked `static` — **first appearance** — is `class-level state`:
a field or method that belongs to the class itself, existing exactly once
and shared by every instance, rather than belonging to any one object.
Unlike `name`, which each `Dog` object holds its own separate copy of,
there is exactly one `totalDogsCreated` in the entire program, no matter
how many `Dog` objects exist — every constructor call increments the
*same* shared value.

#### Execution Trace

The shared field's value changes across three separate constructor calls:

1. Before any `Dog` is built: `totalDogsCreated` is `0`, its initial
   value, set once when the class itself is first used — not per object,
   because there is no object yet.
2. `new Dog("Rex")` runs the constructor: `totalDogsCreated =
   totalDogsCreated + 1;` reads the current shared value (`0`) and sets it
   to `1`.
3. `new Dog("Fido")` runs the same constructor again, against a
   *different* object — but `totalDogsCreated` is not reset or
   re-initialized for `second`, because it isn't `second`'s own field at
   all. It reads the current shared value, `1`, and sets it to `2`.
4. `new Dog("Buddy")` runs once more, reading the shared value `2` and
   setting it to `3`.
5. `Dog.totalDogsCreated` is read after all three objects exist, printing
   `3` — proof that all three constructor calls updated the *same* piece
   of storage, not three independent per-object copies.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `static int totalDogsCreated = 0;` — **(a) first appearance.** `static`
   marks this field as class-level: one copy total, not one per object.
   `= 0` initializes it immediately, before any `Dog` is ever built.
2. `totalDogsCreated = totalDogsCreated + 1;`, inside the constructor —
   reads and updates the single shared field. No `this.` qualifier is
   used here, and none is needed or even valid in the usual sense: a
   `static` field isn't reached through any particular object, so there's
   no per-object copy for `this` to distinguish it from.
3. `new Dog("Rex")`, `new Dog("Fido")`, `new Dog("Buddy")` — **(b)
   reappearing** `object creation` and single-parameter construction from
   Lesson 02, called three times. Each call runs the constructor, and each
   run increments the one shared `totalDogsCreated` — it does not reset or
   duplicate per object.
4. `Dog.totalDogsCreated` — **(a) first appearance** of this exact access
   shape: reached through the class name, `Dog`, not through any object
   variable like `first` or `second`. This is only possible, and only
   makes sense, because the field belongs to the class itself, not to any
   one `Dog`.

### CS Lens

This is the same distinction as a **class variable** versus an **instance
variable** in any object-oriented language: instance state is allocated
fresh per object, at construction; class-level (static) state is
allocated exactly once, when the class itself is first used, and outlives
and is shared across every object of that class.

Also recognized in: `@staticmethod`/class-body attributes in Python,
`static` fields in C# and C++ (identical mechanism to Java's), a
database table's own metadata (row count, schema version) as opposed to
any one row's data, a factory's running total as opposed to any one
product it produces.

### SE Lens

The alternative — giving every `Dog` object its own `totalDogsCreated`
field and trying to keep them all in sync — was not chosen because it's
not just harder, it's the wrong shape entirely: a per-object count field
would need every single constructor call to somehow reach into every
*other* existing `Dog` and update its copy too, which nothing in the
language provides a mechanism for and no reasonable design would attempt.
`static` state exists specifically for data whose natural scope is "the
whole class," not "each object" — using it is not a workaround, it's the
correct match between the data's real scope and the storage the language
offers for that scope.

---

## Connect the Pieces

`static int totalDogsCreated` and the three `new Dog(...)` calls trace one
continuous idea: a `static` field is allocated once, before any object
exists; every constructor call — regardless of which object it's
building — reads and writes that same single storage location; and
`Dog.totalDogsCreated`, accessed through the class name rather than
through any one `first`/`second`/`third` variable, reflects that there was
never a per-object copy to choose between in the first place.

This also finally explains something present, unexplained, since the very
first `Main.java` in Lesson 01: `public static void main(String[] args)`.
`static` here means exactly what it meant for `totalDogsCreated` — `main`
belongs to the `Main` class itself, not to any object of it. That's
precisely why it's always been possible to run `java Main` without ever
writing `new Main()` anywhere: a `static` method doesn't need an object to
be called on, the same way `Dog.totalDogsCreated` didn't need one to be
read.

## What Breaks Without This

Remove `static` from the field declaration, keeping everything else the
same:

```java
int totalDogsCreated = 0;
```

This fails to compile where `Dog.totalDogsCreated` is read in `main`, with
an error resembling:

```
error: non-static variable totalDogsCreated cannot be referenced from a static context
        System.out.println("Total dogs created: " + Dog.totalDogsCreated);
                                                         ^
```

Without `static`, `totalDogsCreated` becomes an ordinary instance field —
one copy per `Dog` object, exactly like `name`. There is no longer any
single, class-level `totalDogsCreated` for `Dog.totalDogsCreated` to refer
to; the compiler refuses to compile a reference to "the field," because
without an object in front of the dot, there's no specific copy to reach.
This is the concrete proof that `static` isn't a minor keyword — removing
it changes what kind of thing the field *is*, not just how it behaves.

## Exercises

1. Add a `static` method `static int getTotalDogsCreated()` that returns
   `totalDogsCreated`, and call it as `Dog.getTotalDogsCreated()` from
   `main` instead of accessing the field directly. Confirm it prints the
   same number.
2. Predict, before running it, what `first.totalDogsCreated` (accessed
   through an object variable instead of the class name) would print,
   then try it. Java allows this syntax even though the field is
   `static` — read the value it actually gives, and connect it back to
   this lesson's central claim about there being only one shared copy.
3. Remove `static` from the field (as in "What Breaks Without This"),
   read the real compiler error yourself, then restore `static` and
   confirm the program compiles and runs again.

## Definition of Done

- [ ] You ran the three-`Dog` example and saw `Total dogs created: 3`.
- [ ] You deliberately removed `static` from the field, saw the real
      "cannot be referenced from a static context" compiler error, and
      restored it.
- [ ] You completed Exercise 2 and can explain what `first.totalDogsCreated`
      actually printed, and why.
- [ ] You can explain, without looking back at this lesson, what `static`
      means in `public static void main`.
