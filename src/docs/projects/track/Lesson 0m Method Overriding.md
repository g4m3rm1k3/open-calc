# Lesson 0m: Method Overriding — Replacing Inherited Behavior

**What you will build:** A disposable lab, building on Lesson 0l's
`Animal`/`Dog`.

**What you need to know first:** Lesson 0l's inheritance, Lesson 0a's
annotations reference (see Mechanical Walkthrough).

**Terms introduced in this lesson:**

- **Method overriding (`@Override`)** — a subclass supplying its own
  version of a method its parent already defines, replacing the
  parent's behavior for objects of the subclass's type.

---

## Concept Unit: Method Overriding — Replacing Inherited Behavior

### The Problem

`Animal.makeSound()`'s generic message is a poor fit for a real `Dog` —
dogs don't make "a generic animal sound," they bark. Inheritance alone
only reuses a parent's behavior unchanged; some way is needed for a
subclass to keep everything else it inherited while replacing just this
one method with its own version.

### Introduce the Concept in Isolation

```
mkdir lesson-0m
cd lesson-0m
```

Create `Main.java`:

```java
class Animal {
    String name;

    void makeSound() {
        System.out.println(name + " makes a generic animal sound.");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        System.out.println(name + " says Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.name = "Rex";
        myDog.makeSound();
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
Rex says Woof!
```

`Dog` now declares its own `makeSound()`, marked `@Override` — **first
appearance** of `method overriding`: a subclass supplying its own
version of a method its parent already defines, replacing the parent's
behavior for objects of the subclass's type. `myDog.makeSound()` now
runs `Dog`'s version, not `Animal`'s — the inherited method is
completely replaced for any `Dog`, while `name` is still inherited
unchanged.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `@Override` — **(a) first appearance** of this **annotation**:
   metadata, read by the compiler, that isn't executed as code itself
   but asserts a claim the compiler actually checks — that this method
   really does override a method the parent class declares. It exists
   as a safety net: misspelling the method name below (`makeSond`
   instead of `makeSound`) would, without `@Override`, silently compile
   as an unrelated new method nothing ever calls; with `@Override`
   present, that same typo becomes a compile error instead, because the
   compiler can confirm no such method exists in `Animal` to override.
2. `void makeSound() { ... }` inside `Dog` — same method name and
   signature as `Animal`'s version, **(a) first appearance** of the
   overriding shape itself: declaring a method identical in name and
   parameters to one the parent already has.
3. `myDog.makeSound();` — calls the method; which version runs is the
   subject of the next lesson specifically, since it isn't obvious just
   from this call site alone that it must be `Dog`'s version.

### CS Lens

Overriding is how a subclass **specializes** inherited behavior instead
of only ever reusing or fully replacing a parent wholesale. `Dog` keeps
every field and every other method `Animal` provides, and replaces
exactly one piece of behavior — the minimum possible change needed to
make `Dog` genuinely dog-like.

Also recognized in: overriding a base class method in Python (no `@`
marker required, since Python has no compiler to check it against),
C#'s `override` keyword (which, unlike Java's optional `@Override`, is
mandatory — a real, stricter contrast worth naming), any framework
callback a subclass customizes by overriding a method the framework's
own base class defines.

### SE Lens

The alternative — giving `Dog` a differently-named method,
`dogMakeSound()`, instead of overriding `makeSound()` — was not chosen
because it breaks the very thing inheritance was for: any code written
to call `.makeSound()` on an `Animal` would need to somehow know to
call `.dogMakeSound()` instead for a `Dog`, defeating the whole point of
treating `Dog` as a kind of `Animal`. Overriding keeps the method name
identical on purpose, so that calling code never needs to know or care
which specific subclass it's actually holding.

---

## Connect the Pieces

Lesson 0l's `Dog extends Animal` reused `Animal`'s behavior unchanged.
This lesson replaced one piece of it: `Dog`'s own `makeSound()`,
verified by `@Override`, runs instead of `Animal`'s generic version. The
next lesson (Dynamic Dispatch) shows this replacement holds even when
the calling code doesn't know it's holding a `Dog` at all.

## What Breaks Without This

Misspell the overriding method's name (`makeSond` instead of
`makeSound`), keeping `@Override` in place. Compile it yourself to see
the real compiler error — `@Override` catches the typo immediately,
since no such method exists in `Animal` to override.

## Exercises

1. Add a `Cat` class, also extending `Animal`, with its own overridden
   `makeSound()` that prints a meow.
2. Remove `@Override` (but keep the correct method name) and confirm the
   program still compiles and behaves identically — then intentionally
   misspell the method name with `@Override` removed, and notice the
   compiler does *not* catch it, silently creating an unrelated method.
3. Explain, in your own words, why `@Override` is described as a
   "safety net" rather than something strictly required for overriding
   to work.

## Definition of Done

- [ ] You ran the example and saw `Rex says Woof!` printed.
- [ ] You completed Exercise 2 and observed the difference `@Override`
      makes when a method name is misspelled.
- [ ] You can state, without looking back at this lesson, what
      `@Override` actually checks.
