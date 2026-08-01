# Lesson 0s: Functional Interfaces — Exactly One Method

**What you will build:** No new code — this lesson names a shape
already built, in preparation for the next lesson's shorthand syntax.

**What you need to know first:** Lesson 0q's interface.

**Terms introduced in this lesson:**

- **Functional interface** — an interface with exactly one abstract
  method — the only kind of interface a lambda expression can target.

---

## Concept Unit: Functional Interfaces — Exactly One Method

### The Problem

Some interfaces, like Lesson 0q's `Flyer`, declare exactly one method.
That specific shape — one method, nothing else — turns out to be
common enough, and useful enough, that Java gives it a name and a
shorthand syntax for implementing it, covered in the next lesson.
Before that shorthand makes sense, the shape itself needs naming.

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

This is the same `Flyer` interface as Lesson 0q — nothing new to
compile or run here. `Flyer` is a `functional interface` — **first
appearance**: an interface with exactly one abstract method — the only
kind of interface a lambda expression can target. `Flyer` qualifies
because it declares exactly one method, `fly()`, and nothing else.

### Discard the Throwaway Example

No new code was introduced in this unit — it names a shape already
built, in preparation for the next lesson's shorthand syntax.

### Mechanical Walkthrough

No new syntax appears in this unit. `interface Flyer { void fly(); }`
is reused verbatim from Lesson 0q — the only new fact is the name for
its specific shape, covered in the CS Lens.

### CS Lens

A functional interface's defining property — exactly one abstract
method — is what makes an object implementing it fully determined by
*just that one method's behavior*. There's no ambiguity about "which
method" a shorthand implementation would need to supply, because
there's only ever one. An interface with two methods (like a
hypothetical `Flyer` that also declared `land()`) would not qualify —
an implementer would need to supply two behaviors, and no single
shorthand expression could represent both at once.

Also recognized in: `Runnable`, `Comparator`, and `ActionListener` in
Java's own standard library — all long-established functional
interfaces, predating the shorthand the next lesson introduces.
`Callable` in Python's sense (any object with one meaningfully callable
behavior) is the loose conceptual equivalent, without Java's formal
one-method restriction.

### SE Lens

The alternative — requiring every functional interface to be explicitly
marked, by name, before a lambda could target it — was not chosen
because it would force interfaces written years before lambdas existed
(`Runnable`, `Comparator`) to be retrofitted with a marker just to
qualify. Defining "functional interface" structurally, purely by method
count, means any interface that happens to fit the shape automatically
qualifies, with nothing to add or change on the interface itself.

---

## Connect the Pieces

Lesson 0q's `Flyer` happens to declare exactly one method. This lesson
named that shape — a functional interface — as the specific
precondition the next lesson's lambda shorthand depends on.

## What Breaks Without This

Add a second method, `void land();`, to `Flyer`. It no longer qualifies
as a functional interface — read the real compiler error the next
lesson's own lambda shorthand would produce against this two-method
version, since a lambda can only ever supply one method's body.

## Exercises

1. Look at Java's own `Comparator<T>` interface (in its standard
   documentation) and confirm it declares exactly one abstract method,
   qualifying it as a functional interface.
2. Add a second method to `Flyer` and explain, in your own words, why
   it no longer qualifies.
3. Explain, in your own words, why "exactly one abstract method" is the
   precise requirement, rather than "few methods" more loosely.

## Definition of Done

- [ ] You can state, without looking back at this lesson, what makes an
      interface a functional interface.
- [ ] You completed Exercise 1 and confirmed a real standard-library
      example.
- [ ] You completed Exercise 2.
