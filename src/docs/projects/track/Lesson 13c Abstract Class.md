# Lesson 13c: Abstract Class

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0a's `class`, Lesson 0q's
interface.

**Terms introduced in this lesson:**

- **Abstract class** — a class that can have real, implemented methods
  and fields while also declaring some methods with no body at all, left
  for a subclass to supply — a middle ground between a fully-implemented
  class and an interface's zero implementation.

---

## Concept Unit: Abstract Class

### The Problem

A database access class needs to hold real, hand-written logic (like a
singleton's own `getInstance` method) alongside methods it deliberately
leaves for something else to implement — neither a plain class (every
method must have a body) nor a plain interface (Lesson 0q — no fields, no
method bodies at all) expresses that specific mix by itself.

### Introduce the Concept in Isolation

```
mkdir lesson-13c
cd lesson-13c
```

Create `Main.java`:

```java
public class Main {
    abstract static class Shape {
        String label = "shape";

        abstract double area();

        String describe() {
            return label + " has area " + area();
        }
    }

    static class Square extends Shape {
        double side;
        Square(double side) { this.side = side; }

        @Override
        double area() {
            return side * side;
        }
    }

    public static void main(String[] args) {
        Shape shape = new Square(4);
        System.out.println(shape.describe());
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
shape has area 16.0
```

This is `abstract class` — **first appearance**: a class that can have
real, implemented methods and fields while also declaring some methods
with no body at all, left for a subclass to supply — a middle ground
between a fully-implemented class and an interface's zero implementation.
`Shape` holds a real field (`label`) and a real, fully-implemented method
(`describe()`), while `area()` has no body at all — left entirely for
`Square` to supply.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `abstract static class Shape { String label = "shape"; abstract
   double area(); String describe() { ... } }` — **(a) first
   appearance**: a real field, a fully-implemented method, and an
   unimplemented, abstract method, all in one class.
2. `class Square extends Shape { ... @Override double area() { return
   side * side; } }` — **(b) reappearing** inheritance from Lesson 0l,
   supplying the one method `Shape` itself left unimplemented.
3. `shape.describe()` — calls `Shape`'s own real, inherited method, which
   itself calls `area()` — resolved, at the moment it runs, to
   `Square`'s own implementation.

### CS Lens

An abstract class sits between a plain class (fully implemented, directly
instantiable) and an interface (no implementation, no fields at all) —
useful exactly when some behavior should be shared and fixed across every
subclass, while other behavior must be left for each subclass to supply
individually.

Also recognized in: abstract classes in virtually every mainstream
object-oriented language (C#, Python's `ABC`, Kotlin's `abstract`), any
design needing shared state plus a required, subclass-supplied
implementation.

### SE Lens

The alternative — a plain interface instead of an abstract class — was
not chosen for this group of lessons' upcoming database class because an
interface cannot hold real fields or a real, hand-written method body; a
real database access class needs exactly the mix an abstract class
provides: real, hand-written logic alongside a method something else
will supply an implementation for.

---

## Connect the Pieces

`Shape` demonstrates the exact mix — real fields, a real method, and one
left unimplemented — the next few lessons' own database class needs. The
next lesson shows a different, unrelated pattern for constructing complex
objects step by step.

## What Breaks Without This

Attempting `new Shape()` directly, without `Square`'s own subclass,
fails to compile — an abstract class with at least one unimplemented
method can never be instantiated on its own.

## Exercises

1. Add a second subclass, `Circle`, implementing `area()` for a circle of
   a given radius, and confirm `describe()` works correctly for it too.
2. Attempt `new Shape()` directly and read the real compiler error it
   produces.
3. Explain, in your own words, why `describe()` didn't need to be
   repeated in `Square`, while `area()` did.

## Definition of Done

- [ ] You ran the `Shape`/`Square` example and can explain why `Shape`
      cannot be instantiated directly.
- [ ] You completed Exercise 2 and read the real compiler error.
- [ ] You can state, without looking back at this lesson, what
      distinguishes an abstract class from both a plain class and an
      interface.
