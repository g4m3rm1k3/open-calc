# Lesson 0t: Lambda Expressions — Shorthand for a Functional Interface

**What you will build:** A disposable lab, building on Lesson 0q's
`Flyer` example.

**What you need to know first:** Lesson 0s's functional interface.

**Terms introduced in this lesson:**

- **Lambda expression** — shorthand syntax for constructing an object
  that implements a single-method (functional) interface, without
  writing the class out by hand.

---

## Concept Unit: Lambda Expressions — Shorthand for a Functional Interface

### The Problem

Writing a full class just to implement a one-method interface —
`class Bird implements Flyer { public void fly() { ... } }` — is a lot
of ceremony for something this small, especially when `Bird` as a
distinct, reusable type was never actually needed; only the *behavior*
mattered. Java has a shorter way to supply just that one method's
behavior, with no class declaration at all.

### Introduce the Concept in Isolation

```
mkdir lesson-0t
cd lesson-0t
```

Create `Main.java`:

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

Compile and run it:

```
javac Main.java
java Main
```

The terminal prints:

```
The bird flaps its wings and flies.
```

No `Bird` class exists anywhere in this program. `() ->
System.out.println(...)` is a `lambda expression` — **first
appearance**: shorthand syntax for constructing an object that
implements a single-method (functional) interface, without writing the
class out by hand. `myBird.fly()` still works exactly as before — the
lambda supplies `fly()`'s body directly, with Java inferring, from
`Flyer myBird = ...`, that this lambda must implement `Flyer`
specifically.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `() -> System.out.println(...)` — **(a) first appearance.** `()` is
   the parameter list — empty here, matching `fly()`'s own empty
   parameter list exactly. `->` separates the parameters from the
   body. `System.out.println(...)` is the body: the single statement
   that runs when `fly()` is called on this object.
2. `Flyer myBird = ...` — the lambda has no declared type of its own;
   its type is inferred entirely from context — here, the variable's
   declared type, `Flyer`. This is only possible because `Flyer` is a
   functional interface (Lesson 0s) with exactly one method: Java
   knows, unambiguously, that the lambda's body is meant to be that one
   method's implementation.

### CS Lens

A lambda expression is not a special kind of value floating free — it's
still, underneath, an object implementing an interface, exactly like a
hand-written `Bird` class would be; it just skips writing the class
declaration by hand. This is why a lambda always has an implicit
**target type** in Java — some functional interface it's being matched
against — unlike Python, where a `lambda` expression produces an
untyped, standalone function value with no interface to target at all.

Also recognized in: arrow functions in JavaScript (visually similar
syntax, structurally different — no target-interface requirement,
matching Python's model more than Java's), lambdas in C# (which, like
Java's, target a delegate type — closer to Java's requirement than
Python's untyped model), closures generally in functional programming.

### SE Lens

The alternative — always writing a full named class, even for a
throwaway, single-use implementation — was not chosen for cases where
the behavior genuinely is the only thing that matters and a reusable,
named type was never needed. The cost of the shorthand: a lambda has
no name of its own to refer to elsewhere, and is best used exactly
where it's defined, once — for anything reused across multiple places,
a real class (or a named variable holding the lambda) reads more
clearly than repeating the same lambda expression.

---

## Connect the Pieces

Lesson 0s named the precondition — exactly one abstract method — that
makes `Flyer` a functional interface. This lesson used that precondition
directly: `() -> System.out.println(...)` is a legal, complete stand-in
for a whole `Bird` class, inferred entirely from the fact that it's
being assigned to a `Flyer`-typed variable.

## What Breaks Without This

Try writing a lambda against an interface with two methods (Lesson
0s's hypothetical `Flyer` with both `fly()` and `land()`). Compile it
yourself to see the real compiler error — a lambda can only ever supply
one method's body, and Java has no way to know which of the two this
single expression is meant to implement.

## Exercises

1. Add a second lambda-backed `Flyer`, this time printing a different
   message, and confirm both work independently.
2. Pass a lambda directly as an argument to a method expecting a
   `Flyer` parameter (like Lesson 0r's `Airport.launch`), with no
   variable in between.
3. Explain, in your own words, why a lambda expression needs a
   functional interface as its target type, rather than working against
   any interface at all.

## Definition of Done

- [ ] You ran the example and saw the real output with no `Bird` class
      anywhere in the program.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a lambda
      is still "an object implementing an interface" underneath.
