# Lesson 0e: Methods — Behavior Attached to a Class

**What you will build:** A standalone, throwaway lab, reusing the `Dog`
class.

**What you need to know first:** Lesson 0a's `class`, Lesson 0c's
`object`.

**Terms introduced in this lesson:**

- **Method** — a function attached to a class, callable on an object of
  that class.

---

## Concept Unit: Methods — Behavior Attached to a Class

### The Problem

A class that only ever holds data and never does anything with it is
rare in real programs — almost every class needs some behavior that
operates on its own fields. That behavior needs a home, the same way a
field needs a home: attached to the class, callable on a specific
object.

### Introduce the Concept in Isolation

```
mkdir lesson-0e
cd lesson-0e
```

Create `Main.java`:

```java
class Dog {
    String name;
    int age;

    void describe() {
        System.out.println(name + " is " + age + " years old.");
    }

    boolean isPuppy() {
        return age < 1;
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.name = "Rex";
        myDog.age = 3;

        myDog.describe();
        System.out.println("Puppy? " + myDog.isPuppy());
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
Rex is 3 years old.
Puppy? false
```

`void describe() { ... }` and `boolean isPuppy() { ... }` are both
`method`s — **first appearance**: a function attached to a class,
callable on an object of that class via `.` — `myDog.describe()`, not a
bare `describe()` with no object in front of it. Two things distinguish
a method from an ordinary function: it lives inside a class's braces,
and when called through an object (`myDog.describe()`), it can read
that specific object's own fields — `describe()` reads `myDog`'s `name`
and `age` with no extra plumbing, because the method already knows
which object it's running against.

`isPuppy()` additionally shows that a method can return a value —
`boolean` (true or false) here, contrasted with `describe()`'s `void`
(returns nothing). `age < 1` is a comparison expression, already
established syntax; `return` hands the comparison's result back to
whoever called `isPuppy()`.

### Discard the Throwaway Example

This `describe()`/`isPuppy()` pair is deleted now. It will not appear
again — its only job was to make "a method reads the object it's called
on" observable in the smallest possible program.

### Mechanical Walkthrough

1. `void describe() { ... }` — **(a) first appearance.** A method
   returning nothing (`void`), taking no parameters.
2. `name` and `age`, read inside `describe()` — **(b) reappearing**
   fields from Lesson 0a, now read from inside a method rather than set
   from outside it — the same fields, a new angle: a method
   automatically has access to the fields of whatever object it's
   called on.
3. `boolean isPuppy() { ... }` — a second method, this time returning a
   value. `boolean` is Java's true/false type — **(a) first appearance**.
4. `age < 1` — a comparison producing a `boolean` value. Genuinely basic,
   already-established syntax.
5. `return age < 1;` — **(a) first appearance** of `return` used to
   produce a value: hands the `boolean` result of the comparison back
   to the call site, ending the method immediately.
6. `myDog.describe();` and `myDog.isPuppy()` — calling both methods
   through `.`, reused from Lesson 0a's `myDog.bark()`.

### CS Lens

A method is the mechanism by which an object's **behavior** stays
bundled with its **data** — the core of what "object" means in
object-oriented programming, beyond just "a bundle of fields." Calling
`myDog.describe()` is fundamentally different from calling a free
function `describe(myDog)`: the method already knows which object it's
operating on before it starts, without that object being passed as an
explicit argument the way a plain function would need it.

Also recognized in: every method on every class in every
object-oriented language (Python, C#, JavaScript classes), every "member
function" in C++, every API you've ever called with a dot
(`"hello".length()`, `list.append(x)`) — the dot is always this same
idea: behavior attached to a specific value.

### SE Lens

The alternative — a free function `describeDog(Dog d)` taking the `Dog`
as an explicit argument — was not chosen because it separates behavior
from the data it operates on, which scales badly: every new free
function that needs a `Dog` has to repeat "takes a `Dog` as its first
argument" by convention, with nothing in the language enforcing that
convention or grouping those functions together. A method makes the
association structural instead of conventional.

---

## Connect the Pieces

Lesson 0c named the real thing a class builds — an object. This lesson
attached real behavior to that object: `myDog.describe()` reads
`myDog`'s own fields automatically, because it's called *on* that
specific object, not passed it as an argument.

## What Breaks Without This

Try calling `describe()` with no object in front of it at all — bare
`describe();` inside `main`. Compile it yourself to see the real
compiler error: `describe()` is not a free function, it only exists
attached to a `Dog`, reachable only via `someDog.describe()`.

## Exercises

1. Add a third method, `void haveBirthday()`, that increments `age` by
   one, and call it on `myDog`.
2. Add a second `Dog` object and confirm calling `.describe()` on each
   one prints that object's own data, not the other's.
3. Explain, in your own words, why `myDog.describe()` needs no
   parameter to know which dog's `name` and `age` to print.

## Definition of Done

- [ ] You ran the example and saw both lines of real output.
- [ ] You completed Exercise 1 and Exercise 2.
- [ ] You can state, without looking back at this lesson, what
      distinguishes a method from an ordinary function.
