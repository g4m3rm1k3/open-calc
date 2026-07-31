# Lesson 0f: Constructors — Setting Up an Object the Moment It's Built

**What you will build:** A standalone, throwaway lab, reusing the `Dog`
class.

**What you need to know first:** Lesson 0d's object creation, Lesson
0e's method.

**Terms introduced in this lesson:**

- **Constructor** — a special method that runs exactly once,
  automatically, during object creation, used to set up an object's
  initial state.

---

## Concept Unit: Constructors — Setting Up an Object the Moment It's Built

### The Problem

Building a `Dog` needs three separate lines to become useful: `new
Dog()`, then `myDog.name = "Rex";`, then `myDog.age = 3;`. Nothing
enforces that all three actually happen — a `Dog` built with `new Dog()`
and never given a `name` compiles and runs, silently holding `name` as
`null` (Java's "no object here" value for anything that isn't a
primitive), which crashes the moment code tries to use it. Setup needs
to be guaranteed to happen at the moment of creation, not left to
whichever code happens to run `new` and hope it remembers the
follow-up lines.

### Introduce the Concept in Isolation

```
mkdir lesson-0f
cd lesson-0f
```

Create `Main.java`:

```java
class Dog {
    String name;
    int age;

    Dog(String dogName, int dogAge) {
        name = dogName;
        age = dogAge;
    }

    void describe() {
        System.out.println(name + " is " + age + " years old.");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog("Rex", 3);
        myDog.describe();
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
```

`Dog(String dogName, int dogAge) { ... }` is a `constructor` — **first
appearance**: a special method that runs exactly once, automatically,
during object creation, used to set up an object's initial state. Three
things mark it as a constructor rather than an ordinary method: its
name is exactly the class's name (`Dog`, not `describe` or anything
else), it has no return type at all — not even `void` — and it's the
code that actually runs the moment `new Dog("Rex", 3)` executes, not
code that has to be called separately afterward.

### Discard the Throwaway Example

This constructor version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Dog(String dogName, int dogAge) { ... }` — **(a) first appearance.**
   Named exactly `Dog`, matching the class. No return type precedes the
   name — not `void Dog(...)`, just `Dog(...)` — which is precisely
   what marks it as a constructor rather than a method that happens to
   share the class's name.
2. `String dogName, int dogAge` — constructor parameters, genuinely
   basic parameter-list syntax already established from ordinary
   functions — the only new fact is that these particular parameter
   names (`dogName`, `dogAge`) were deliberately chosen to *not* match
   the field names (`name`, `age`), which a later lesson explains.
3. `name = dogName;` and `age = dogAge;` — assigns each field from the
   matching constructor parameter.
4. `new Dog("Rex", 3)` — **(b) reappearing** object creation from Lesson
   0d, now shown passing arguments: the values in the parentheses are
   handed directly to the constructor's parameters, `dogName` receiving
   `"Rex"` and `dogAge` receiving `3`, in that order.

### CS Lens

A constructor guarantees an **invariant**: some condition that's true
for every object of a class, enforced at the one point objects come
into existence. Here, the invariant is "every `Dog` has a `name` and
`age` set the moment it exists" — because the *only* way to get a `Dog`
at all is through `new Dog(name, age)`, and that path always runs the
assignments.

Also recognized in: `__init__` in Python, a constructor in C# or C++,
every framework's "initialization" hook, database schema `NOT NULL`
constraints — all different mechanisms enforcing the same idea: certain
setup must happen before something is usable, guaranteed structurally
rather than by convention.

### SE Lens

The alternative — building with bare `new Dog()` and setting fields
afterward, as earlier lessons did — was not chosen going forward
because nothing enforces the follow-up lines actually run; a `Dog` can
exist, fully uninitialized, for however long it takes some other code
to remember to set `name` and `age`, and any code that reads it in
between sees a broken object. A constructor closes that gap by making
initialization part of construction itself.

---

## Connect the Pieces

Lesson 0d's `new Dog()` built an object with no guaranteed setup. This
lesson closed that gap: `new Dog("Rex", 3)` now runs a constructor
automatically, guaranteeing `name` and `age` are set the moment the
object exists — there is no path to a `Dog` that skips it.

## What Breaks Without This

Build a `Dog` with `new Dog()` and never set `name`, then call
`describe()`. Compile and run it yourself — `name` prints as `null`
(Java's default for an unset field), a real, silent bug a constructor
prevents entirely by making setup mandatory.

## Exercises

1. Add a second field, `String breed`, a third constructor parameter for
   it, and confirm it's set correctly.
2. Try building a `Dog` with `new Dog();` (no arguments) against this
   exact class, and read the real compiler error — it names the exact
   requirement: this class only declares a two-parameter constructor.
3. Explain, in your own words, why a constructor's name must exactly
   match the class name.

## Definition of Done

- [ ] You ran the example and saw the real output.
- [ ] You completed Exercise 2 and saw the real compiler error for
      calling a constructor that doesn't exist.
- [ ] You can state, without looking back at this lesson, what
      distinguishes a constructor from an ordinary method.
