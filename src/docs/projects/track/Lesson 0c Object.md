# Lesson 0c: An Object Is the Real Thing Built From a Class

**What you will build:** A standalone, throwaway lab, reusing Lesson
0a's `Dog` class.

**What you need to know first:** Lesson 0a's `class`.

**Terms introduced in this lesson:**

- **Object (instance)** — a concrete, constructed value built from a
  class's blueprint, with its own independent copy of each field the
  class declares.

---

## Concept Unit: An Object Is the Real Thing Built From a Class

### The Problem

Lesson 0a's `class Dog { ... }` describes a shape — every dog will have
a `name`, an `age`, and a `bark()` behavior — but a class alone builds
nothing. Nothing named `Rex` exists yet from that declaration; it's a
description, the same way a blueprint for a house describes rooms and
walls without being a house anyone can stand inside. Something has to
name what the *real, built thing* actually is.

### Introduce the Concept in Isolation

```
mkdir lesson-0c
cd lesson-0c
```

Create `Main.java`:

```java
class Dog {
    String name;
    int age;

    void bark() {
        System.out.println(name + " says Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.name = "Rex";
        myDog.age = 3;
        myDog.bark();
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
Rex says Woof!
```

`new Dog()` (a full first-appearance treatment of exactly what this does
comes next lesson) produces a real, concrete value; `myDog` is what that
value is called once built. That value — the thing `myDog` refers to —
is an `object` — **first appearance**, also called an **instance** of
`Dog`. `Dog` is the blueprint; `myDog` is one real thing built from it,
with its own independent storage for `name` and `age`, separate from any
other `Dog` that might ever exist.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Dog myDog = new Dog();` — **(a) first appearance** of this exact
   relationship: `myDog` now refers to one real, constructed object —
   not the class itself, a specific built thing.
2. `myDog.name = "Rex";` and `myDog.age = 3;` — `.` (dot) reaches into
   the specific object `myDog` refers to and sets *that object's own*
   `name` and `age`. If a second `Dog` object existed, setting its
   `name` would not touch `myDog`'s — each object's fields are
   independent storage, not shared.
3. `myDog.bark();` — calls the `bark()` method *on* `myDog` specifically.
   Inside `bark()`, `name` refers to `myDog`'s own `name` field —
   `"Rex"` — which is why the output says `Rex says Woof!` and not some
   other name.

### CS Lens

An object is a value of a class's type, the same way `3` is a value of
type `int`. The difference is that a class's shape is chosen by the
programmer and can bundle multiple pieces of data (`name` and `age`
together) plus behavior (`bark()`) into one value, where an `int` only
ever holds one number.

Also recognized in: every real row built from a spreadsheet's column
schema, every real struct value in C, every real row in a database table
built from its schema, every object in Python or C#.

### SE Lens

The alternative — collapsing "the blueprint" and "the real thing" into
one concept, so declaring `Dog` and having a usable dog were the same
act — was not chosen because it would make it impossible to describe a
shape once and then build many independent copies of it: every `Dog`
would have to be its own separate declaration, with no shared behavior
or field layout to reuse, the same problem this curriculum would face if
every `int` needed its own from-scratch type definition instead of one
shared `int` type producing as many independent values as needed.

---

## Connect the Pieces

Lesson 0a's `class Dog { ... }` describes a shape once. This lesson named
the real, built thing — `myDog`, an object — with its own independent
`name` and `age` storage. The next lesson (Object Creation) names the
exact act, `new Dog()`, that produces one.

## What Breaks Without This

Declare `Dog myDog;` with no `new Dog()` anywhere, then try
`myDog.name = "Rex";`. Compile it yourself to see the real compiler
error — `myDog` was only ever declared as *able* to refer to a `Dog`; no
object was ever built for it to refer to.

## Exercises

1. Add a second object, `Dog secondDog = new Dog();`, give it a
   different `name`, and print both dogs' `bark()` output — confirm each
   prints its own name, not the other's.
2. Explain, in your own words, what `myDog` refers to before `new Dog()`
   ever runs.
3. Explain, in your own words, why `Dog` (the class) and `myDog` (the
   object) are not the same thing.

## Definition of Done

- [ ] You ran the example and saw `Rex says Woof!` printed.
- [ ] You completed Exercise 1 and can explain why the two dogs' fields
      never collide.
- [ ] You can state, without looking back at this lesson, the difference
      between a class and an object.
