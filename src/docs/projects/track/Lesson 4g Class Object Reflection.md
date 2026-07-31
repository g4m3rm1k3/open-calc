# Lesson 4g: The `Class` Object

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0a's `class`, Lesson 4f's
`Intent`.

**Terms introduced in this lesson:**

- **`Class` object (reflection)** — a `Class` object is a language's
  built-in way to refer to a class itself as a value, not an instance of
  it.

---

## Concept Unit: The `Class` Object

### The Problem

Code sometimes needs to refer to *a class itself*, as a value, without
constructing any instance of it — Lesson 4f's own `new Intent(this,
SettingsActivity.class)` already did this, naming
`SettingsActivity.class` without ever writing `new SettingsActivity()`
anywhere in that line.

### Introduce the Concept in Isolation

```
mkdir lesson-4g
cd lesson-4g
```

Create `Main.java`:

```java
class Dog {
}

public class Main {
    public static void main(String[] args) {
        Class<Dog> dogClass = Dog.class;
        System.out.println("Class name: " + dogClass.getName());
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
Class name: Dog
```

`Dog.class` is a `Class` object — **first appearance**: a `Class`
object is a language's built-in way to refer to a class itself as a
value, not an instance of it. `dogClass` does not hold a `Dog` — no
`new Dog()` appears anywhere — it holds a real object representing the
`Dog` class itself, which can be inspected (`getName()`) or handed to
APIs that need to know *which class* is meant without needing an
actual instance of it.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Class<Dog> dogClass = Dog.class;` — **(a) first appearance.**
   `Dog.class` produces the one, real `Class` object representing
   `Dog` itself; `Class<Dog>` (Lesson 0u's generics, reused) is the
   declared type of a `Class` object specifically representing `Dog`.
2. `dogClass.getName()` — **(a) first appearance**: reads the class's
   own name back out as a `String`, proof `dogClass` genuinely holds
   real information about the class, not just a label.

### CS Lens

A `Class` object is the language's own **reflection** entry point — a
way for a running program to inspect or refer to its own types as
data, rather than only using them to declare variables or construct
instances. This is exactly what `new Intent(this,
SettingsActivity.class)` (Lesson 4f) relies on: naming *which* Activity
class to route to, as a value, with no instance of it constructed
anywhere in that line.

Also recognized in: `type()` in Python (a close equivalent — every
value already knows its own type, inspectable as a value), `typeof` in
C#, reflection APIs across virtually every mainstream managed language.

### SE Lens

The alternative — some other way to identify "which class" without a
real `Class` object, like passing a `String` class name — was not
chosen for `Intent`'s own routing because a `Class` object is checked
by the compiler (a typo'd class name would fail to compile, not fail
silently at runtime the way a mistyped `String` would).

---

## Connect the Pieces

`Dog.class` named the class itself as a value — exactly what
`SettingsActivity.class`, inside Lesson 4f's own `Intent` constructor,
already relied on. The next lesson (`Context`) names another value
that same constructor call already used, unexplained: `this`.

## What Breaks Without This

Try passing a class name as a plain `String` instead of a real `Class`
object to an API expecting one — a typo in that string is only
discovered at runtime, if ever, contrasted directly against
`Dog.class`, where a typo'd class name fails to compile at all.

## Exercises

1. Write a second `Class` object example using a class from an earlier
   lesson (`Dog` from Lesson 0a), and print its name.
2. Try `Dog.class.getSimpleName()` and compare its output to
   `getName()`.
3. Explain, in your own words, why `Dog.class` is checked by the
   compiler while a `String` class name would not be.

## Definition of Done

- [ ] You ran the `Class` object example and saw the real class name
      printed.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, what
      `Dog.class` actually holds.
