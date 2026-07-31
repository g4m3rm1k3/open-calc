# Lesson 06: Interfaces and Contracts

**What you will build:** A disposable lab, same pattern as Lessons 01–05.
Today's case study: describing what a type can do without saying how,
letting genuinely unrelated classes be treated the same way by any code
that only cares about that shared ability.

**What you need to know first:** Lesson 01's `class`, Lesson 02's
`method`.

**Terms introduced in this lesson:**

- **Interface (`interface`, `implements`)** — a declared set of method
  signatures with no implementation body — a promise about what a type
  can do, without saying how, that any class can commit to fulfilling.
- **Program to an interface, not an implementation** — code should depend
  on what something can do, never on how it does it or what concrete type
  it actually is.
- **Functional interface** — an interface with exactly one abstract
  method — the only kind of interface a lambda expression can target.
- **Lambda expression** — shorthand syntax for constructing an object
  that implements a single-method (functional) interface, without writing
  the class out by hand.

---

## Concept Unit: Interfaces — A Contract With No Implementation

### The Problem

Lesson 05's inheritance connects genuinely related types — a `Dog` really
is an `Animal`. But some abilities cut across types that share nothing
else at all: a `Bird` and an `Airplane` can both fly, yet an `Airplane`
is in no meaningful sense a kind of `Bird`, and forcing them to share a
parent class just to both have a `fly()` method would be a false, made-up
relationship. Some way is needed to say "this type can do X" without
claiming any deeper is-a relationship at all.

### Introduce the Concept in Isolation

```
mkdir lesson-06
cd lesson-06
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
appearance**: a declared set of method signatures with no implementation
body — a promise about what a type can do, without saying how, that any
class can commit to fulfilling. `Bird` and `Airplane` share no parent
class, no fields, no code at all — only the promise that each provides a
real `fly()` method, made via `implements Flyer`. `Flyer myBird = new
Bird();` shows this promise is usable as a type on its own: a variable can
be declared `Flyer`, holding any object that fulfills that promise.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface Flyer { void fly(); }` — **(a) first appearance.** `void
   fly();` has no body at all — just a signature ending in `;`, unlike
   every method seen so far. This is the contract: any class implementing
   `Flyer` must supply a real body for `fly()`.
2. `class Bird implements Flyer { ... }` — **(a) first appearance** of
   `implements`: declares that `Bird` commits to `Flyer`'s contract.
   Unlike `extends` (one parent only, per Lesson 05), a class can
   `implements` several interfaces at once — covered again below.
3. `public void fly() { ... }` inside `Bird` — supplies the real body
   `Flyer`'s contract requires. Must be `public`, matching or exceeding
   the interface's own implicit visibility — genuinely basic access-level
   syntax reused from Lesson 04, sorted **(c)**, except for this new fact,
   which is worth its own note rather than silent reuse.
4. `class Airplane implements Flyer { ... }` — a second, structurally
   unrelated class fulfilling the same contract independently.
5. `Flyer myBird = new Bird();` — **(a) first appearance** of this exact
   declaration shape: a variable declared as the *interface* type, not
   the concrete class. Legal because `Bird` fulfills `Flyer`'s contract,
   the same way Lesson 05's `Animal myAnimal = new Dog();` was legal
   because `Dog` extends `Animal`.
6. `myBird.fly();` and `myPlane.fly();` — each call runs that specific
   object's own implementation, the same dynamic-dispatch mechanism from
   Lesson 05, now working through an interface type instead of a parent
   class.

### CS Lens

An interface is a **contract**: it describes *what* a type can do, with
zero commitment to *how*. This is a different relationship than
inheritance's is-a: `Bird implements Flyer` says "a `Bird` can fly," not
"a `Bird` is a `Flyer`" in the deeper sense `Dog extends Animal` claimed.
Multiple, unrelated classes can fulfill the same contract, each in a
completely different way — exactly what let `Bird` and `Airplane` both be
usable as `Flyer` with no shared code at all.

Also recognized in: protocols in Python (a similar contract-only idea,
usually enforced by convention via `abc.ABC` rather than a dedicated
keyword), interfaces in C# (`IFlyer`, near-identical mechanism to Java's),
any plugin system where unrelated implementations all fulfill one shared
API.

### SE Lens

The alternative — giving `Bird` and `Airplane` a shared, artificial parent
class (`FlyingThing`) just so both could have a `fly()` method — was not
chosen because it invents a false is-a relationship neither class
actually has, and Java only allows a class to `extends` one parent at
all, which would block `Bird` from separately extending something it
genuinely is (`Animal`) if `FlyingThing` had already claimed that one
parent slot. An interface makes zero claim about deeper relatedness and
costs nothing in return — this is exactly why Java allows a class to
`implements` several interfaces but `extends` only one: many honest
"can-do" promises are compatible at once, but only one true "is-a"
relationship can exist.

---

## Concept Unit: Program to an Interface, Not an Implementation

### The Problem

Code that receives a `Bird` specifically, and calls `.fly()` on it, only
ever works with actual `Bird` objects — passing an `Airplane` to the same
code would fail to compile, even though an `Airplane` can fly too. The
previous unit already built the tool to fix this (`Flyer` as a usable
type); this unit names the general principle for *deliberately* writing
code against that tool instead of against a specific class.

### Introduce the Concept in Isolation

This principle doesn't need new syntax to isolate — it's a design choice
about which type to write in a method signature, demonstrated directly:

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

Compile and run it. The terminal prints:

```
Clearing for takeoff...
The bird flaps its wings and flies.
Clearing for takeoff...
The airplane engines roar and it takes off.
```

`void launch(Flyer anything)` is written against the interface `Flyer`,
never against `Bird` or `Airplane` specifically. This is `program to an
interface, not an implementation` — **first appearance**: code should
depend on what something can do, never on how it does it or what
concrete type it actually is. `launch` works correctly for *any* current
or future class that implements `Flyer`, without ever being changed.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class Airport { void launch(Flyer anything) { ... } }` — **(a) first
   appearance** of an interface used as a parameter type: `launch` accepts
   anything fulfilling `Flyer`'s contract, not one specific class.
2. `anything.fly();` — calls the contract method through the parameter;
   dynamic dispatch (Lesson 05) runs whichever concrete class's real
   implementation the actual argument turns out to be.
3. `airport.launch(new Bird());` and `airport.launch(new Airplane());` —
   two calls passing genuinely different, unrelated types to the exact
   same method, both accepted, because both fulfill `Flyer`.

### CS Lens

This principle is what makes interfaces useful beyond just "a way to make
two classes share a method name" — it's specifically about *where code
depends*. Code written against `Flyer` has zero dependency on `Bird` or
`Airplane` existing at all; it would work identically against a
`Helicopter` class written a year later, never touched, never recompiled.

Also recognized in: dependency injection generally (accepting an
interface type so any real or fake implementation can be substituted),
duck typing in Python (a looser, unenforced version of the same idea —
"if it can `fly()`, it's flyable enough" without a formal interface),
any plugin architecture where the host code only ever depends on a shared
contract.

### SE Lens

The alternative — writing `launch(Bird bird)` and a separate,
near-duplicate `launch(Airplane plane)` for every concrete type that might
need to launch — was not chosen because it doesn't scale: every new
flying thing would require a brand-new overload of `launch`, hand-written,
even though the actual logic inside is identical. Programming to `Flyer`
means `launch` is written exactly once and never needs to change again,
no matter how many new classes implement `Flyer` in the future.

---

## Concept Unit: Functional Interfaces — Exactly One Method

### The Problem

Some interfaces, like `Flyer`, declare exactly one method. That specific
shape — one method, nothing else — turns out to be common enough, and
useful enough, that Java gives it a name and a shorthand syntax for
implementing it, covered in the next unit. Before that shorthand makes
sense, the shape itself needs naming.

### Introduce the Concept in Isolation

```java
interface Flyer {
    void fly();
}

class Bird implements Flyer {
    public void fly() {
        System.out.println("The bird flaps its wings and flies.");
    }
}

public class Main {
    public static void main(String[] args) {
        Flyer myBird = new Bird();
        myBird.fly();
    }
}
```

This is the same `Flyer` interface as the first unit — nothing new to
compile or run here. `Flyer` is a `functional interface` — **first
appearance**: an interface with exactly one abstract method — the only
kind of interface a lambda expression can target. `Flyer` qualifies
because it declares exactly one method, `fly()`, and nothing else.

### Discard the Throwaway Example

No new code was introduced in this unit — it names a shape already built,
in preparation for the next unit's shorthand syntax.

### Mechanical Walkthrough

No new syntax appears in this unit. `interface Flyer { void fly(); }` is
reused verbatim from the first unit — the only new fact is the name for
its specific shape, covered in the CS Lens.

### CS Lens

A functional interface's defining property — exactly one abstract method
— is what makes an object implementing it fully determined by *just that
one method's behavior*. There's no ambiguity about "which method" a
shorthand implementation would need to supply, because there's only ever
one. An interface with two methods (like a hypothetical `Flyer` that also
declared `land()`) would not qualify — an implementer would need to
supply two behaviors, and no single shorthand expression could represent
both at once.

Also recognized in: `Runnable`, `Comparator`, and `ActionListener` in
Java's own standard library — all long-established functional interfaces,
predating the shorthand the next unit introduces. `Callable` in Python's
sense (any object with one meaningfully callable behavior) is the loose
conceptual equivalent, without Java's formal one-method restriction.

### SE Lens

This concept itself carries no new design tradeoff beyond what interfaces
already established — its entire value is enabling the next unit's
shorthand, which does carry a real one.

---

## Concept Unit: Lambda Expressions — Shorthand for a Functional Interface

### The Problem

Writing a full class just to implement a one-method interface —
`class Bird implements Flyer { public void fly() { ... } }` — is a lot of
ceremony for something this small, especially when `Bird` as a distinct,
reusable type was never actually needed; only the *behavior* mattered.
Java has a shorter way to supply just that one method's behavior, with no
class declaration at all.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
interface Flyer {
    void fly();
}

public class Main {
    public static void main(String[] args) {
        Flyer myBird = () -> System.out.println("The bird flaps its wings and flies.");
        myBird.fly();
    }
}
```

Compile and run it. The terminal prints:

```
The bird flaps its wings and flies.
```

No `Bird` class exists anywhere in this program. `() ->
System.out.println(...)` is a `lambda expression` — **first appearance**:
shorthand syntax for constructing an object that implements a
single-method (functional) interface, without writing the class out by
hand. `myBird.fly()` still works exactly as before — the lambda supplies
`fly()`'s body directly, with Java inferring, from `Flyer myBird = ...`,
that this lambda must implement `Flyer` specifically.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `() -> System.out.println(...)` — **(a) first appearance.** `()` is
   the parameter list — empty here, matching `fly()`'s own empty
   parameter list exactly. `->` separates the parameters from the body.
   `System.out.println(...)` is the body: the single statement that runs
   when `fly()` is called on this object.
2. `Flyer myBird = ...` — the lambda has no declared type of its own; its
   type is inferred entirely from context — here, the variable's declared
   type, `Flyer`. This is only possible because `Flyer` is a functional
   interface with exactly one method: Java knows, unambiguously, that the
   lambda's body is meant to be that one method's implementation.

### CS Lens

A lambda expression is not a special kind of value floating free — it's
still, underneath, an object implementing an interface, exactly like the
`Bird` class was; it just skips writing the class declaration by hand.
This is why a lambda always has an implicit **target type** in Java —
some functional interface it's being matched against — unlike Python,
where a `lambda` expression produces an untyped, standalone function
value with no interface to target at all.

Also recognized in: arrow functions in JavaScript (visually similar
syntax, structurally different — no target-interface requirement,
matching Python's model more than Java's), lambdas in C# (which, like
Java's, target a delegate type — closer to Java's requirement than
Python's untyped model), closures generally in functional programming.

### SE Lens

The alternative — always writing a full named class, even for a
throwaway, single-use implementation — was not chosen for cases where the
behavior genuinely is the only thing that matters and a reusable,
named type was never needed. The cost of the shorthand: a lambda has no
name of its own to refer to elsewhere, and is best used exactly where it's
defined, once — for anything reused across multiple places, a real class
(or a named variable holding the lambda) reads more clearly than repeating
the same lambda expression.

---

## Connect the Pieces

`interface Flyer { void fly(); }` declares a contract with no
implementation. `Bird`/`Airplane implements Flyer` fulfills it two
completely unrelated ways. `Airport.launch(Flyer anything)` is written
against the contract itself, never against `Bird` or `Airplane`
specifically — programming to an interface. Because `Flyer` declares
exactly one method, it qualifies as a functional interface — which is
precisely what makes `() -> System.out.println(...)` a legal, complete
stand-in for a whole `Bird` class, inferred entirely from the fact that
it's being assigned to a `Flyer`-typed variable.

## What Breaks Without This

Try implementing `Flyer` with a class that's missing the required method:

```java
class BrokenBird implements Flyer {
}
```

This fails to compile with an error resembling:

```
error: BrokenBird is not abstract and does not override abstract method fly() in Flyer
class BrokenBird implements Flyer {
      ^
```

This is the contract being enforced, concretely: `implements Flyer` is a
promise, and the compiler refuses to accept a class that breaks it by
leaving `fly()` unimplemented. There is no way to `implements` an
interface partially and have it silently compile.

## Exercises

1. Add a second interface, `Swimmer`, with a `swim()` method, and a class
   `Duck` that `implements` both `Flyer` and `Swimmer` at once — proof a
   class can fulfill more than one contract simultaneously.
2. Write `Airport.launch` a second way, passing it a lambda directly
   (`airport.launch(() -> System.out.println("A drone lifts off."));`)
   with no named class at all, and confirm it works exactly like passing
   a `Bird` or `Airplane` object did.
3. Remove `fly()`'s implementation from one class (as in "What Breaks
   Without This"), read the real compiler error, then restore it.

## Definition of Done

- [ ] You ran every version of `Main.java` in this lesson and saw the
      real output for each.
- [ ] You deliberately left a method unimplemented on a class claiming to
      implement `Flyer`, saw the real compiler error, and fixed it.
- [ ] You completed Exercise 1 and can explain why a class can
      `implements` more than one interface but `extends` only one class.
- [ ] You can state, without looking back at this lesson, why `Flyer`
      qualifies as a functional interface and a hypothetical two-method
      interface would not.
