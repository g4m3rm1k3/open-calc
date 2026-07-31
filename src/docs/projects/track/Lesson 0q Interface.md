# Lesson 0q: Interfaces — A Contract With No Implementation

**What you will build:** A disposable lab. Today's case study:
describing what a type can do without saying how, letting genuinely
unrelated classes be treated the same way by any code that only cares
about that shared ability.

**What you need to know first:** Lesson 0a's `class`, Lesson 0e's
method.

**Terms introduced in this lesson:**

- **Interface (`interface`, `implements`)** — a declared set of method
  signatures with no implementation body — a promise about what a type
  can do, without saying how, that any class can commit to fulfilling.

---

## Concept Unit: Interfaces — A Contract With No Implementation

### The Problem

Lesson 0l's inheritance connects genuinely related types — a `Dog`
really is an `Animal`. But some abilities cut across types that share
nothing else at all: a `Bird` and an `Airplane` can both fly, yet an
`Airplane` is in no meaningful sense a kind of `Bird`, and forcing them
to share a parent class just to both have a `fly()` method would be a
false, made-up relationship. Some way is needed to say "this type can
do X" without claiming any deeper is-a relationship at all.

### Introduce the Concept in Isolation

```
mkdir lesson-0q
cd lesson-0q
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

public class Main {
    public static void main(String[] args) {
        Flyer myBird = new Bird();
        Flyer myPlane = new Airplane();

        myBird.fly();
        myPlane.fly();
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
The bird flaps its wings and flies.
The airplane engines roar and it takes off.
```

`interface Flyer { void fly(); }` declares an `interface` — **first
appearance**: a declared set of method signatures with no
implementation body — a promise about what a type can do, without
saying how, that any class can commit to fulfilling. `Bird` and
`Airplane` share no parent class, no fields, no code at all — only the
promise that each provides a real `fly()` method, made via `implements
Flyer`. `Flyer myBird = new Bird();` shows this promise is usable as a
type on its own: a variable can be declared `Flyer`, holding any object
that fulfills that promise.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `interface Flyer { void fly(); }` — **(a) first appearance.** `void
   fly();` has no body at all — just a signature ending in `;`, unlike
   every method seen so far. This is the contract: any class
   implementing `Flyer` must supply a real body for `fly()`.
2. `class Bird implements Flyer { ... }` — **(a) first appearance** of
   `implements`: declares that `Bird` commits to `Flyer`'s contract.
   Unlike `extends` (one parent only), a class can `implements` several
   interfaces at once.
3. `public void fly() { ... }` inside `Bird` — supplies the real body
   `Flyer`'s contract requires. Must be `public`, matching or exceeding
   the interface's own implicit visibility.
4. `class Airplane implements Flyer { ... }` — a second, structurally
   unrelated class fulfilling the same contract independently.
5. `Flyer myBird = new Bird();` — **(a) first appearance** of this
   exact declaration shape: a variable declared as the *interface*
   type, not the concrete class. Legal because `Bird` fulfills
   `Flyer`'s contract, the same way Lesson 0n's `Animal myAnimal = new
   Dog();` was legal because `Dog` extends `Animal`.
6. `myBird.fly();` and `myPlane.fly();` — each call runs that specific
   object's own implementation, the same dynamic-dispatch mechanism
   from Lesson 0n, now working through an interface type instead of a
   parent class.

### CS Lens

An interface is a **contract**: it describes *what* a type can do,
with zero commitment to *how*. This is a different relationship than
inheritance's is-a: `Bird implements Flyer` says "a `Bird` can fly,"
not "a `Bird` is a `Flyer`" in the deeper sense `Dog extends Animal`
claimed. Multiple, unrelated classes can fulfill the same contract, each
in a completely different way.

Also recognized in: protocols in Python (a similar contract-only idea,
usually enforced by convention via `abc.ABC` rather than a dedicated
keyword), interfaces in C# (`IFlyer`, near-identical mechanism to
Java's), any plugin system where unrelated implementations all fulfill
one shared API.

### SE Lens

The alternative — giving `Bird` and `Airplane` a shared, artificial
parent class (`FlyingThing`) just so both could have a `fly()` method —
was not chosen because it invents a false is-a relationship neither
class actually has, and Java only allows a class to `extends` one
parent at all, which would block `Bird` from separately extending
something it genuinely is (`Animal`) if `FlyingThing` had already
claimed that one parent slot. An interface makes zero claim about
deeper relatedness and costs nothing in return.

---

## Connect the Pieces

`interface Flyer` declares a contract with no implementation. `Bird`/
`Airplane implements Flyer` fulfills it two completely unrelated ways.
The next lesson (Program to an Interface) names the design principle
of writing code against that contract, rather than against a specific
class.

## What Breaks Without This

Try implementing `Flyer` with a class that's missing the required
method:

```java
class BrokenBird implements Flyer {
}
```

Compile it yourself to see the real compiler error, resembling:

```
error: BrokenBird is not abstract and does not override abstract method fly() in Flyer
```

There is no way to `implements` an interface partially and have it
silently compile.

## Exercises

1. Add a second interface, `Swimmer`, with a `swim()` method, and a
   class `Duck` that `implements` both `Flyer` and `Swimmer` at once —
   proof a class can fulfill more than one contract simultaneously.
2. Remove `fly()`'s implementation from one class (as in "What Breaks
   Without This"), read the real compiler error, then restore it.
3. Explain, in your own words, why `Bird implements Flyer` is a
   different relationship from `Dog extends Animal`.

## Definition of Done

- [ ] You ran the example and saw both real output lines.
- [ ] You completed Exercise 2 and saw the real compiler error for an
      incomplete implementation.
- [ ] You can state, without looking back at this lesson, why a class
      can `implements` more than one interface but `extends` only one
      class.
