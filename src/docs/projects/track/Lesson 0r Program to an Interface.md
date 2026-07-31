# Lesson 0r: Program to an Interface, Not an Implementation

**What you will build:** A disposable lab, building on Lesson 0q's
`Flyer` example.

**What you need to know first:** Lesson 0q's interface.

**Terms introduced in this lesson:**

- **Program to an interface, not an implementation** — code should
  depend on what something can do, never on how it does it or what
  concrete type it actually is.

---

## Concept Unit: Program to an Interface, Not an Implementation

### The Problem

Code that receives a `Bird` specifically, and calls `.fly()` on it,
only ever works with actual `Bird` objects — passing an `Airplane` to
the same code would fail to compile, even though an `Airplane` can fly
too. Lesson 0q already built the tool to fix this (`Flyer` as a usable
type); this lesson names the general principle for *deliberately*
writing code against that tool instead of against a specific class.

### Introduce the Concept in Isolation

```
mkdir lesson-0r
cd lesson-0r
```

Create `Main.java`:

```java
interface Flyer {
    void fly();
}

class Bird implements Flyer {
    public void fly() {
        System.out.println("The bird flaps its wings and flies.");
    }
}

class Airplane implements Flyer {
    public void fly() {
        System.out.println("The airplane engines roar and it takes off.");
    }
}

class Airport {
    void launch(Flyer anything) {
        System.out.println("Clearing for takeoff...");
        anything.fly();
    }
}

public class Main {
    public static void main(String[] args) {
        Airport airport = new Airport();
        airport.launch(new Bird());
        airport.launch(new Airplane());
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
Clearing for takeoff...
The bird flaps its wings and flies.
Clearing for takeoff...
The airplane engines roar and it takes off.
```

`void launch(Flyer anything)` is written against the interface
`Flyer`, never against `Bird` or `Airplane` specifically. This is
`program to an interface, not an implementation` — **first
appearance**: code should depend on what something can do, never on
how it does it or what concrete type it actually is. `launch` works
correctly for *any* current or future class that implements `Flyer`,
without ever being changed.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `class Airport { void launch(Flyer anything) { ... } }` — **(a)
   first appearance** of an interface used as a parameter type:
   `launch` accepts anything fulfilling `Flyer`'s contract, not one
   specific class.
2. `anything.fly();` — calls the contract method through the
   parameter; dynamic dispatch runs whichever concrete class's real
   implementation the actual argument turns out to be.
3. `airport.launch(new Bird());` and `airport.launch(new Airplane());`
   — two calls passing genuinely different, unrelated types to the
   exact same method, both accepted, because both fulfill `Flyer`.

### CS Lens

This principle is what makes interfaces useful beyond just "a way to
make two classes share a method name" — it's specifically about *where
code depends*. Code written against `Flyer` has zero dependency on
`Bird` or `Airplane` existing at all; it would work identically against
a `Helicopter` class written a year later, never touched, never
recompiled.

Also recognized in: dependency injection generally (accepting an
interface type so any real or fake implementation can be substituted),
duck typing in Python (a looser, unenforced version of the same idea —
"if it can `fly()`, it's flyable enough" without a formal interface),
any plugin architecture where the host code only ever depends on a
shared contract.

### SE Lens

The alternative — writing `launch(Bird bird)` and a separate,
near-duplicate `launch(Airplane plane)` for every concrete type that
might need to launch — was not chosen because it doesn't scale: every
new flying thing would require a brand-new overload of `launch`,
hand-written, even though the actual logic inside is identical.
Programming to `Flyer` means `launch` is written exactly once and never
needs to change again, no matter how many new classes implement
`Flyer` in the future.

---

## Connect the Pieces

Lesson 0q's `Flyer` interface made "can fly" a usable type. This
lesson showed the design payoff: `Airport.launch(Flyer anything)`
depends only on that contract, never on `Bird` or `Airplane`
specifically — accepting any current or future class that fulfills it.

## What Breaks Without This

Write `launch(Bird bird)` instead of `launch(Flyer anything)`, then try
`airport.launch(new Airplane());`. Compile it yourself to see the real
compiler error — an `Airplane` is not a `Bird`, even though both can
fly, and the method's own signature now blocks a perfectly valid
argument.

## Exercises

1. Write `Airport.launch` a second way, passing it a lambda directly
   (a later lesson covers exactly what this syntax is) — confirm it
   still compiles against `Flyer` with no named class at all.
2. Add a `Helicopter` class implementing `Flyer`, written after
   `Airport` already exists, and confirm `launch` accepts it with zero
   changes to `Airport` itself.
3. Explain, in your own words, why `launch(Flyer anything)` never
   needs to change as new flying classes are added.

## Definition of Done

- [ ] You ran the example and saw all four real output lines.
- [ ] You completed Exercise 2 and confirmed `launch` needed no
      changes for a brand-new class.
- [ ] You can state, without looking back at this lesson, why
      `launch(Bird bird)` would be a worse design than
      `launch(Flyer anything)`.
