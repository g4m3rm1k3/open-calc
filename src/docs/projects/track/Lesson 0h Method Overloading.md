# Lesson 0h: Method Overloading — Same Name, Different Parameters

**What you will build:** A standalone, throwaway lab, reusing the `Dog`
class.

**What you need to know first:** Lesson 0g's `this`.

**Terms introduced in this lesson:**

- **Method overloading** — several methods or constructors sharing one
  name, distinguished only by their parameter lists, with the compiler
  choosing which one runs based on what's actually passed at the call
  site.

---

## Concept Unit: Method Overloading — Same Name, Different Parameters

### The Problem

Sometimes a class genuinely needs to be constructed — or a method
genuinely needs to be called — a couple of different, equally valid
ways. A `Dog` might reasonably be built knowing its name and age both,
or built knowing only its name, with age assumed unknown for now. Java
has no optional or default parameters (unlike Python's `def
__init__(self, name, age=0):`), so a single constructor can't make
`age` optional on its own.

### Introduce the Concept in Isolation

```
mkdir lesson-0h
cd lesson-0h
```

Create `Main.java`:

```java
class Dog {
    String name;
    int age;

    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    Dog(String name) {
        this.name = name;
        this.age = 0;
    }

    void describe() {
        System.out.println(name + " is " + age + " years old.");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog rex = new Dog("Rex", 3);
        Dog stray = new Dog("Stray");

        rex.describe();
        stray.describe();
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
Stray is 0 years old.
```

#### Execution Trace

Two `new Dog(...)` calls, each choosing a different constructor — which
one is chosen isn't visible from the values alone, so it's traced
separately here:

1. `new Dog("Rex", 3)` — the compiler looks at this call site and sees
   two arguments, a `String` and an `int`. Only the two-parameter
   constructor `Dog(String name, int age)` matches that shape, so
   that's the one that runs. `rex` now refers to a `Dog` with
   `name = "Rex"`, `age = 3`.
2. `new Dog("Stray")` — one argument, a `String`. Only the
   one-parameter constructor `Dog(String name)` matches, so *that* one
   runs instead — nothing about this call could match the
   two-parameter version, since there's no second argument to give it.
   `stray` now refers to a `Dog` with `name = "Stray"`, `age = 0` (the
   explicit default set inside that constructor).
3. `rex.describe()` and `stray.describe()` each read their own object's
   fields, printing the two different results shown above — proof the
   two constructors really did build two independently-initialized
   objects, not the same one twice.

Two constructors, both named `Dog`, distinguished only by their
parameter lists — one takes `(String, int)`, the other takes only
`(String)`. This is `method overloading` — **first appearance**:
several methods or constructors sharing one name, distinguished only by
their parameter lists, with the compiler choosing which one runs based
on what's actually passed at the call site.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Dog(String name, int age) { ... }` — the same two-parameter
   constructor from Lesson 0g, **(b) reappearing**.
2. `Dog(String name) { ... }` — **(a) first appearance** of a second
   constructor with the same name, `Dog`, but a different parameter
   list. This is legal specifically because Java distinguishes methods
   and constructors by name *and* parameter list together, not by name
   alone.
3. `this.age = 0;` — inside the one-parameter constructor, `age` is set
   to a default value explicitly, since nothing was passed for it.
4. `new Dog("Rex", 3)` and `new Dog("Stray")` — two calls with different
   argument counts, each resolved by the compiler to a different one of
   the two constructors above — **(a) first appearance** as a named
   mechanism: Java inspects the number and types of arguments at each
   call site and picks the one declaration whose parameter list
   actually matches; if no declared version matches, or more than one
   could ambiguously match, compilation fails instead of guessing.

### CS Lens

Overload resolution is a compile-time decision — the compiler looks
only at each call site's argument list, matches it against every
declared version of the name, and picks one, before the program ever
runs. This is different from `this`'s resolution (settled at
construction/call time based on which real object is involved) —
overloading is settled purely from the *shapes* of the declarations and
call sites, with no object involved in the decision at all.

Also recognized in: overloaded operators in C++ (`+` meaning something
different for `int` vs. a custom `Vector` type), overloaded
constructors in C# (identical mechanism to Java's), function
overloading in many statically-typed languages generally.

### SE Lens

The alternative — one constructor with a `boolean` flag or a sentinel
value like `age = -1` meaning "unknown" — was not chosen because it
makes every call site harder to read (`new Dog("Stray", -1)` doesn't say
"unknown age" the way `new Dog("Stray")` does) and pushes a runtime
check ("is age actually -1?") into every method that uses `age`, rather
than letting the *type system* express "this Dog simply wasn't given an
age."

---

## Connect the Pieces

Lesson 0g's `this` disambiguated a field from a same-named parameter.
This lesson showed a class can have more than one constructor, as long
as their parameter lists differ — the compiler picks the right one by
matching each call site's own argument shape, the same way `this`
resolved a name collision by matching context, not guessing.

## What Breaks Without This

Try declaring two methods with the exact same name *and* the exact same
parameter list (e.g. two `void describe()` methods with identical
signatures) and read the real compiler error yourself. It will name the
actual rule overloading depends on: distinct parameter lists, not just
distinct bodies.

## Exercises

1. Add a third constructor to `Dog`, taking no parameters at all
   (`Dog()`), that sets `name` to `"Unnamed"` and `age` to `0`. Build a
   `Dog` with `new Dog()` and confirm `describe()` prints the defaults.
2. Add an overloaded `describe(String greeting)` method, printing the
   greeting before the usual line, alongside the existing no-argument
   `describe()`.
3. Explain, in your own words, why `new Dog("Rex", 3)` and
   `new Dog("Stray")` don't conflict, even though both call something
   named `Dog`.

## Definition of Done

- [ ] You ran the example and saw both real output lines.
- [ ] You completed Exercise 1 and can explain why `Dog()` is legal
      alongside the two other constructors.
- [ ] You can state, without looking back at this lesson, how the
      compiler decides which overloaded constructor or method to call.
