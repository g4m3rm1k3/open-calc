# Lesson 2n: `super` — Parent Implementation Access

**What you will build:** A disposable lab.

**What you need to know first:** Lesson 0m's method overriding, Lesson
2e's `Activity`.

**Terms introduced in this lesson:**

- **Parent implementation access (`super`)** — inside a subclass, an
  explicit way to call its immediate parent's own version of a method
  or constructor, rather than only replacing it via overriding.

---

## Concept Unit: `super` — Parent Implementation Access

### The Problem

Lesson 0m's overriding *replaces* a parent's method entirely — but
Lesson 2e's real `Activity.onCreate` example already showed something
different: `super.onCreate(savedInstanceState);`, calling the parent's
own version *in addition to* the override's own new code, not instead
of it. That specific mechanism deserves its own, formal treatment.

### Introduce the Concept in Isolation

```
mkdir lesson-2n
cd lesson-2n
```

Create `Main.java`:

```java
class Animal {
    void makeSound() {
        System.out.println("Generic animal sound.");
    }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        super.makeSound();
        System.out.println("...and also a bark!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.makeSound();
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
Generic animal sound.
...and also a bark!
```

`super.makeSound();` is `parent implementation access` — **first
appearance**: inside a subclass, an explicit way to call its immediate
parent's own version of a method or constructor, rather than only
replacing it via overriding. `Dog.makeSound()` runs *both* `Animal`'s
original message and its own new one — `super` is what makes the
parent's version still run, deliberately, from inside the override
that replaces it.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `super.makeSound();` — **(a) first appearance.** Calls `Animal`'s
   own `makeSound()` directly, explicitly, from inside `Dog`'s
   overriding version — without `super`, `Dog`'s override would run
   *only* its own new code, exactly as Lesson 0m's own overriding
   example did.
2. `System.out.println("...and also a bark!");`, after the `super`
   call — `Dog`'s own additional behavior, running after the parent's.

### CS Lens

`super` is the explicit escape hatch that turns "replace" (plain
overriding, Lesson 0m) into "extend" (run the parent's version, then
add more) — this is precisely why every real Android lifecycle
override, like `onCreate` (Lesson 2e), calls `super.onCreate(...)`
first: the framework's own base implementation does real, required
setup work that the override is expected to preserve, not silently
discard.

Also recognized in: `super()`/`super.method()` in Python (identical
concept, different syntax), `base.Method()` in C#,
`ParentClass::method()` in C++ (qualified by the parent's actual name
rather than a keyword).

### SE Lens

The alternative — always fully replacing a parent's method via plain
overriding, never calling `super` — was not chosen for cases where the
parent's own behavior is genuinely still required; skipping
`super.onCreate(...)` in a real Activity, for instance, would skip real
framework setup work the rest of the Activity's lifecycle depends on
having already happened.

---

## Connect the Pieces

Lesson 2e's `super.onCreate(savedInstanceState);` was shown but not yet
explained. This lesson gave that exact mechanism its own, formal
treatment: `super` runs the parent's own version of an overridden
method, deliberately, from inside the override that replaces it.

## What Breaks Without This

Omitting `super.onCreate(savedInstanceState)` from a real Activity
override throws a real runtime error on Android, resembling:

```
android.util.SuperNotCalledException: Activity did not call through to super.onCreate()
```

This is concrete, framework-enforced proof that `super` isn't optional
ceremony in a real Activity override — the framework itself checks
that its own base implementation actually ran.

## Exercises

1. Move `super.makeSound();` to the *end* of `Dog.makeSound()` instead
   of the start, and confirm, by running it, that the two printed
   lines swap order.
2. Remove `super.makeSound();` entirely and confirm only `Dog`'s own
   message prints.
3. Read the real `SuperNotCalledException` message above and explain,
   in your own words, what it's telling a developer to fix.

## Definition of Done

- [ ] You ran the `super.makeSound()` example and saw both lines
      print, in order.
- [ ] You completed Exercise 1 and confirmed the order swap.
- [ ] You can state, without looking back at this lesson, the
      difference between overriding alone and overriding plus `super`.
