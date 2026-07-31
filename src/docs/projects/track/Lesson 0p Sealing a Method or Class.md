# Lesson 0p: Sealing a Method or Class — Preventing Further Inheritance

**What you will build:** A disposable lab, building on the
`Animal`/`Dog` example.

**What you need to know first:** Lesson 0m's method overriding.

**Terms introduced in this lesson:**

- **Sealing a method or class (`final`)** — marking a method as
  un-overridable or a class as un-subclassable, a deliberate
  restriction on future inheritance.

---

## Concept Unit: Sealing a Method or Class — Preventing Further Inheritance

### The Problem

Inheritance and overriding are powerful specifically because a
subclass can replace almost anything a parent defines — but sometimes
that flexibility is exactly what shouldn't be allowed. A method whose
correctness depends on running exactly as written — a security check, a
core invariant — being silently overridable by some future subclass is
a real risk, not a hypothetical one. Java needs a way to say "this
method, or this entire class, cannot be extended or replaced, ever."

### Introduce the Concept in Isolation

```
mkdir lesson-0p
cd lesson-0p
```

Create `Main.java`:

```java
class Animal {
    final void breathe() {
        System.out.println("Breathing.");
    }
}

class Dog extends Animal {
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.breathe();
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
Breathing.
```

`final void breathe() { ... }` is `sealing a method` — **first
appearance**: marking a method as un-overridable, a deliberate
restriction on future inheritance. `Dog` inherits `breathe()` normally
— `final` does not block inheritance itself — but no subclass of
`Animal`, including `Dog`, is allowed to declare its own `breathe()`
that overrides this one; attempting it is a compile error, tried
directly in this lesson's exercises.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `final void breathe() { ... }` — **(a) first appearance** of
   `final` applied to a method: this exact method body is guaranteed to
   run for every `Animal` and every subclass of it, because no
   subclass is permitted to override it.
2. `class Dog extends Animal { }` — **(b) reappearing** inheritance,
   unaffected by `breathe()` being sealed; `Dog` still inherits and can
   still call `breathe()` normally, it just cannot *replace* it.
3. `myDog.breathe();` — calls the inherited, sealed method.

`final` can also mark an entire class, not just one method — `final
class Dog { }` would mean no class at all may `extend Dog`, sealing the
whole type against further inheritance rather than sealing one method
within it. Both uses share the same underlying idea: a deliberate,
compiler-enforced stop on future overriding or subclassing.

### CS Lens

Sealing trades away flexibility for a guarantee: once a method or class
is `final`, every caller can trust its exact behavior will never be
silently replaced by some future subclass they don't know about. This
is a different guarantee from `final` on a variable (which prevents
*reassignment* of a value) — sealing a method or class is about
preventing *behavior* from being replaced, a genuinely different
meaning carried by the same keyword.

Also recognized in: `sealed`/`sealed override` in C# (a separate
keyword from C#'s own value-immutability keywords, unlike Java's single
`final` covering both meanings), `final` classes throughout the Java
standard library (`String` itself is `final`, specifically so no code
anywhere can subclass it and change what a `String` fundamentally
guarantees).

### SE Lens

The alternative — leaving every method freely overridable, always —
was not chosen for methods whose correctness the rest of a class
depends on: an unsealed `breathe()` could be silently replaced by a
subclass with a version that breaks some invariant the rest of `Animal`
assumes still holds. Sealing costs real flexibility — a legitimate
future subclass that genuinely needed to customize `breathe()` now
cannot — which is exactly why it's a deliberate, occasional choice, not
a default: most methods are left unsealed, specifically because most
are actually meant to be customized by subclasses.

---

## Connect the Pieces

Every earlier lesson in this arc assumed overriding is always available
— sealing is the deliberate exception: a method or class can opt out of
that flexibility entirely, trading it for a guarantee the behavior can
never be silently replaced.

## What Breaks Without This

Try to override the sealed method:

```java
class Dog extends Animal {
    @Override
    void breathe() {
        System.out.println("Panting.");
    }
}
```

Compile it yourself to see the real compiler error, resembling:

```
error: breathe() in Dog cannot override breathe() in Animal
overridden method is final
```

`@Override` here is doing exactly the job it was introduced for:
without it, this mistake could still fail (Java checks `final`
regardless), but `@Override` makes the *intent* explicit, so the
resulting error is about `final` specifically, not a mysterious
"unrelated new method" situation.

## Exercises

1. Try overriding the sealed `breathe()` method yourself, read the real
   compiler error, then remove the attempted override.
2. Mark the entire `Dog` class `final` and confirm no further class can
   extend it (try writing a `Puppy extends Dog` class and read the
   real compiler error).
3. Explain, in your own words, why sealing a method is described as
   "trading flexibility for a guarantee."

## Definition of Done

- [ ] You ran the example and saw `Breathing.` printed.
- [ ] You deliberately tried overriding a sealed method, saw the real
      "overridden method is final" compiler error, and removed the
      attempt.
- [ ] You can state, without looking back at this lesson, the
      difference between `final` on a method and `final` on a class.
