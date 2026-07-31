# Lesson 0n: Dynamic Dispatch — Which Version Actually Runs

**What you will build:** A disposable lab, building on Lesson 0m's
`Animal`/`Dog`.

**What you need to know first:** Lesson 0m's method overriding.

**Terms introduced in this lesson:**

- **Dynamic dispatch (polymorphism)** — a method call resolves to the
  actual runtime type of the object it's called on, regardless of the
  type the holding variable was declared as.

---

## Concept Unit: Dynamic Dispatch — Which Version Actually Runs

### The Problem

Lesson 0m called `makeSound()` through a variable declared as `Dog` —
unsurprising that `Dog`'s version ran. But the deeper, more useful
question is what happens when the *variable's declared type* is the
parent, `Animal`, while the *actual object* is still a `Dog`. Does
`Animal`'s generic version run, because that's the declared type — or
`Dog`'s overridden version, because that's what the object really is?

### Introduce the Concept in Isolation

```
mkdir lesson-0n
cd lesson-0n
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
        Animal myAnimal = new Dog();
        myAnimal.name = "Rex";
        myAnimal.makeSound();
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

`Animal myAnimal = new Dog();` declares `myAnimal` as type `Animal`,
but builds a real `Dog` — legal precisely because a `Dog` *is an*
`Animal`, per Lesson 0l's inheritance relationship. `myAnimal
.makeSound()` still runs `Dog`'s overridden version, not `Animal`'s
generic one, even though the *variable* is declared `Animal`. This is
`dynamic dispatch` — **first appearance** (also called
**polymorphism**): a method call resolves to the actual runtime type of
the object it's called on, regardless of the type the holding variable
was declared as.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Animal myAnimal = new Dog();` — **(a) first appearance** of this
   exact shape: a variable declared as the *parent* type, holding an
   object of the *child* type. Legal because of inheritance's is-a
   relationship.
2. `myAnimal.makeSound();` — **(a) first appearance** of dynamic
   dispatch in action: at this line, Java does not look at
   `myAnimal`'s *declared* type (`Animal`) to decide which
   `makeSound()` to run. It looks at the *actual* object `myAnimal`
   refers to — a real `Dog` — and runs that object's version, `Dog`'s
   overridden one.

#### Execution Trace

Which method body actually executes isn't visible from the source text
alone — a control-flow trace, not a changing-values one:

1. `new Dog()` allocates a real `Dog` object and runs its (inherited,
   unmodified) constructor. This object's *actual* type, permanently,
   is `Dog` — that fact travels with the object itself, not with
   whatever variable happens to be holding it at any given moment.
2. `Animal myAnimal = ...` stores a reference to that `Dog` object in a
   variable declared as `Animal`. The variable's declared type
   restricts *which methods can be called through it* (only `Animal`'s
   declared methods), but does not change what the object underneath
   actually is.
3. `myAnimal.makeSound()` is called. Java resolves this at runtime by
   checking the real object's actual type — `Dog` — and finds that
   `Dog` overrides `makeSound()`. That overridden version runs, printing
   "Rex says Woof!", not `Animal`'s generic message.

### CS Lens

Dynamic dispatch is what makes overriding actually useful in practice —
without it, a method call's behavior would depend on the variable's
*declared* type, and every piece of code would need to know the exact
real type of every object it touches to predict what runs. This is
**runtime polymorphism**: the same line of code, `myAnimal.makeSound()`,
produces different real behavior depending on what object is actually
behind `myAnimal` at the moment it runs.

Also recognized in: every framework that calls one method name on a
base type and gets each subclass's own behavior automatically (a UI
toolkit calling `draw()` on a list of different shape objects; Android
calling `onCreate()` on whatever specific `Activity` subclass the app
declares), virtual method dispatch in C++ (which, unlike Java, requires
the `virtual` keyword to opt in — Java dispatches dynamically by
default).

### SE Lens

The alternative — writing code that checks "is this actually a `Dog`? a
`Cat`?" before deciding what to do — was not chosen, and dynamic
dispatch is precisely what makes that unnecessary: calling code writes
`myAnimal.makeSound()` once, and every current and future subclass's
own override runs correctly with zero changes to that calling code.
This is the mechanism behind every framework callback in the rest of
this curriculum — a framework calls one method name on a general type,
and each subclass's own override supplies the actual behavior, with the
framework never needing to know which subclass it's holding.

---

## Connect the Pieces

Lesson 0m's `Dog` overrode `makeSound()`. This lesson proved that
override holds even when the calling code only knows about the parent
type, `Animal` — dispatch is resolved against the real object, never
the declared type. The next lesson (Runtime Type Narrowing) covers the
reverse case: getting back to `Dog`-only behavior from an
`Animal`-typed reference.

## What Breaks Without This

Remove `Dog`'s own `makeSound()` override entirely, keeping
`Animal myAnimal = new Dog();`. Run it yourself and see the real
output: `myAnimal.makeSound()` now prints `Animal`'s generic message,
since there is no override left for dynamic dispatch to find; this
contrast is the clearest proof that dispatch depends on what's actually
overridden, not on the variable's declared type alone.

## Exercises

1. Add a `Cat` class, also extending `Animal`, with its own overridden
   `makeSound()` that prints a meow. Build an `Animal myAnimal =
   new Cat();` and confirm dynamic dispatch calls `Cat`'s version.
2. Add a few separate variables holding a mix of `Dog` and `Cat`
   objects, all declared as `Animal`, and call `makeSound()` on each —
   confirm each one's *own* overridden version runs.
3. Explain, in your own words, why the same line,
   `myAnimal.makeSound();`, produces different output depending on
   which object `myAnimal` actually refers to.

## Definition of Done

- [ ] You ran the example and saw `Rex says Woof!` printed, even though
      `myAnimal` is declared `Animal`.
- [ ] You completed Exercise 2 and can explain, in your own words, why
      the loop's single `.makeSound()` call site produces different
      output per object without checking any type itself.
- [ ] You can state, without looking back at this lesson, the
      difference between method overriding and dynamic dispatch.
