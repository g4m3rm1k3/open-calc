# Lesson 0o: Runtime Type Narrowing — Going Back to the Specific Type

**What you will build:** A disposable lab, building on the
`Animal`/`Dog` example.

**What you need to know first:** Lesson 0n's dynamic dispatch.

**Terms introduced in this lesson:**

- **Runtime type narrowing (`instanceof`, casting)** — checking a
  variable's actual runtime type and then explicitly narrowing its
  declared type to a more specific one, verified rather than assumed.

---

## Concept Unit: Runtime Type Narrowing — Going Back to the Specific Type

### The Problem

Once an object is referred to through its parent type — `Animal
myAnimal = new Dog();` — only `Animal`'s declared methods can be called
through that variable, even though the real object is a `Dog` with
potentially more of its own methods. Sometimes code genuinely needs to
get back to the specific type — to call a `Dog`-only method, for
instance — and needs a safe, checked way to do it, since simply
*assuming* `myAnimal` is a `Dog` could be wrong.

### Introduce the Concept in Isolation

```
mkdir lesson-0o
cd lesson-0o
```

Create `Main.java`:

```java
class Animal {
    String name;
}

class Dog extends Animal {
    void fetch() {
        System.out.println(name + " fetches the ball!");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal myAnimal = new Dog();
        myAnimal.name = "Rex";

        if (myAnimal instanceof Dog) {
            Dog myDog = (Dog) myAnimal;
            myDog.fetch();
        }
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
Rex fetches the ball!
```

`myAnimal instanceof Dog` checks, at runtime, whether the real object
`myAnimal` refers to is actually a `Dog`. `(Dog) myAnimal` then
performs the cast: producing a new reference to the same object,
declared as `Dog`, through which `Dog`-only methods like `fetch()`
become callable. Together, this is `runtime type narrowing` — **first
appearance**: checking a variable's actual runtime type and then
explicitly narrowing its declared type to a more specific one, verified
rather than assumed.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `class Dog extends Animal { void fetch() { ... } }` — `Dog` now
   declares a method `Animal` does not have.
2. `myAnimal instanceof Dog` — **(a) first appearance** of
   `instanceof`: a check, evaluated at runtime, returning `true` if the
   object `myAnimal` actually refers to is a `Dog` (or any further
   subclass of `Dog`), and `false` otherwise — checked against the
   object's real type, never its variable's declared type.
3. `(Dog) myAnimal` — **(a) first appearance** of a **cast**: an
   explicit instruction telling the compiler "trust me, treat this
   `Animal` reference as a `Dog` reference from here on." Written
   inside the `instanceof` check specifically because an incorrect cast
   — narrowing to a type the object isn't actually an instance of —
   fails at runtime with a `ClassCastException`, not silently; checking
   first is what makes the cast safe.
4. `Dog myDog = (Dog) myAnimal;` — stores the newly-cast reference in a
   variable now declared as `Dog`, through which `fetch()` becomes
   callable.

### CS Lens

Runtime type narrowing is the explicit escape hatch a statically-typed
language needs to go from a general declared type back to a specific
one — the compiler alone, looking only at declared types, cannot know
that `myAnimal` really holds a `Dog`; only a runtime check can confirm
it. Python's dynamic typing never creates this exact problem in the
first place, since a Python variable never has a fixed declared type to
narrow away from.

Also recognized in: `isinstance()` in Python (checking, not narrowing,
since Python doesn't separately track declared types), `is`/`as` in C#
(a closer structural equivalent — `is` mirrors `instanceof`, `as`
performs a null-returning cast instead of throwing), any type-checked
language's "downcast" operation generally.

### SE Lens

The alternative — casting without checking first, `Dog myDog = (Dog)
myAnimal;` with no `instanceof` guard — was not chosen because an
incorrect cast throws a `ClassCastException` at runtime, crashing the
program at exactly that line if the object turns out not to actually be
a `Dog`. Checking with `instanceof` first trades a small amount of
extra code for a program that degrades safely (skipping the `if` block)
instead of crashing, when the assumption turns out to be wrong.

---

## Connect the Pieces

Lesson 0n showed dispatch always resolves to the real object's type,
even through a parent-typed variable. This lesson showed the reverse
direction: getting back to that real, specific type from a
parent-typed reference requires an explicit, checked `instanceof`-and-
cast — never assumed.

## What Breaks Without This

Try `(Dog) myAnimal` without an `instanceof` check first, on an
`Animal` that's actually some other subclass (not a `Dog`). Run it
yourself to see the real `ClassCastException` this produces at runtime
— proof an unchecked cast is not just risky in theory, it fails loudly
and immediately the moment the assumption is wrong.

## Exercises

1. Add a `Cat` class, also extending `Animal`, and try
   `(Dog) myAnimal` on an `Animal` actually holding a `Cat` — read the
   real `ClassCastException` this produces, then add the `instanceof`
   guard back.
2. Add a second `Dog`-only method, `void guard()`, and call it through
   the same `instanceof`-checked pattern.
3. Explain, in your own words, why `instanceof` must be checked at
   runtime rather than at compile time.

## Definition of Done

- [ ] You ran the example and saw `Rex fetches the ball!` printed.
- [ ] You completed Exercise 1 and saw the real `ClassCastException`.
- [ ] You can state, without looking back at this lesson, why an
      `instanceof` check should come before a downcast.
