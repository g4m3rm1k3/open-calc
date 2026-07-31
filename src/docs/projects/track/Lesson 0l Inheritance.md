# Lesson 0l: Inheritance — A Child Type Extends a Parent Type

**What you will build:** A disposable lab. This is the single most
load-bearing idea in this whole curriculum — nearly everything built
later depends on it.

**What you need to know first:** Lesson 0a's `class`, Lesson 0c's
`object`.

**Terms introduced in this lesson:**

- **Inheritance (`extends`)** — a child type that extends a parent type,
  receiving the parent's fields and methods and able to add or replace
  its own.

---

## Concept Unit: Inheritance — A Child Type Extends a Parent Type

### The Problem

A `Cat` and a `Dog` share real structure — both have a `name`, both can
`makeSound()` — but are also genuinely different: a `Dog` barks, a `Cat`
meows. Writing `Cat` and `Dog` as two completely separate classes forces
`name` to be declared and handled twice, identically, in both places,
with no language-level way to say "these are both, fundamentally,
animals." Every shared piece of structure duplicated across every
related class is exactly the kind of drift a class exists to avoid.

### Introduce the Concept in Isolation

```
mkdir lesson-0l
cd lesson-0l
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
Rex makes a generic animal sound.
```

`class Dog extends Animal { }` is `inheritance` — **first appearance**:
a child type that extends a parent type, receiving the parent's fields
and methods and able to add or replace its own. `Dog`'s own body is
empty — yet `myDog.name` and `myDog.makeSound()` both work, because
`Dog` automatically has everything `Animal` declares, without retyping
any of it.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `class Animal { ... }` — an ordinary class.
2. `class Dog extends Animal { }` — **(a) first appearance** of
   `extends`: declares `Dog` as a **subclass** (or **child class**) of
   `Animal`, the **superclass** (or **parent class**). `Dog`'s own body
   is empty on purpose, to prove inheritance alone accounts for
   everything that follows.
3. `Dog myDog = new Dog();` — **(b) reappearing** object creation, now
   building a `Dog` specifically, not an `Animal`.
4. `myDog.name = "Rex";` — reaches a field `Dog` never declared itself —
   `name` belongs to `Animal`, and `Dog` inherited it automatically by
   extending `Animal`.
5. `myDog.makeSound();` — calls a method `Dog` never declared either;
   `makeSound()` belongs to `Animal`, inherited the same way `name`
   was.

### CS Lens

Inheritance establishes an **is-a** relationship, checked by the
compiler: a `Dog` genuinely *is an* `Animal`, not merely similar to one
— anywhere an `Animal` is expected, a `Dog` can be used instead, because
it carries every field and method `Animal` guarantees, plus whatever it
adds of its own.

Also recognized in: class inheritance in Python, C#, and C++ (nearly
identical mechanism to Java's), a UI toolkit's `Button` extending a more
general `View` or `Widget` base class, a biological taxonomy (a `Dog`
is a `Mammal` is an `Animal`) — the same nested-generality shape
recurring.

### SE Lens

The alternative — writing `Cat` and `Dog` as fully separate classes,
each redeclaring `name` and a near-identical `makeSound()` — was not
chosen because shared structure duplicated across classes has to be
kept in sync by hand forever: adding a new shared field later means
editing every class that needs it, instead of editing the one shared
parent once. Inheritance's cost is real too — a subclass is now
permanently coupled to its parent's shape, and changing the parent can
ripple into every subclass — exactly why a later lesson (Sealing)
exists: to let a class deliberately opt out of being extended when that
coupling isn't wanted.

---

## Connect the Pieces

`Dog extends Animal` establishes that a `Dog` genuinely is an `Animal`
— it automatically has everything `Animal` declares, with nothing
retyped. The next lesson (Method Overriding) shows how `Dog` can
replace, not just reuse, one piece of that inherited behavior.

## What Breaks Without This

Remove `extends Animal` from `Dog`'s declaration, keeping
`myDog.name = "Rex";` in `main`. Compile it yourself to see the real
compiler error — without inheritance, `Dog` never declared a `name`
field of its own, and there's no `Animal` relationship to inherit one
from.

## Exercises

1. Add a `Cat` class, also extending `Animal`, with no body of its own
   — confirm it too inherits `name` and `makeSound()` unchanged.
2. Add a second field to `Animal`, `int age`, and confirm both `Dog` and
   `Cat` inherit it automatically with no changes to either subclass.
3. Explain, in your own words, why `Dog`'s empty body still makes
   `myDog.makeSound()` work.

## Definition of Done

- [ ] You ran the example and saw the real output.
- [ ] You completed Exercise 1 and Exercise 2.
- [ ] You can state, without looking back at this lesson, what
      `extends` guarantees a subclass automatically has.
