# Lesson 0x: `@Override` Compiler Checking — Turning a Typo Into an Error

**What you will build:** A disposable lab, building on the
`Animal`/`Dog` example.

**What you need to know first:** Lesson 0w's annotations, Lesson 0n's
dynamic dispatch.

**Terms introduced in this lesson:**

- **`@Override` compiler checking** — a specific, hardcoded compiler
  check triggered by the `@Override` annotation — verifying a method
  genuinely overrides something in its parent, turning a typo'd method
  name into a compile error instead of a silent, unrelated new method.

---

## Concept Unit: `@Override` Compiler Checking — Turning a Typo Into an Error

### The Problem

Earlier lessons used `@Override` above every overriding method, without
demonstrating the specific failure it exists to catch. That failure is
concrete and easy to actually hit: a method meant to override a
parent's method, but whose name is misspelled, compiles perfectly fine
on its own — Java has no way to know an unrelated new method wasn't
intended on purpose — and simply never gets called by anything,
silently.

### Introduce the Concept in Isolation

```
mkdir lesson-0x
cd lesson-0x
```

Create `Main.java`:

```java
class Animal {
    void makeSound() {
        System.out.println("Generic animal sound.");
    }
}

class Dog extends Animal {
    void makeSond() {
        System.out.println("Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal myAnimal = new Dog();
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
Generic animal sound.
```

`Dog`'s `makeSond()` — misspelled, missing the final `u` — was clearly
meant to override `Animal.makeSound()`, but doesn't, because Java
matches method names exactly. The program compiles without any error
at all: `makeSond()` is legal as a brand-new, unrelated method that
nothing ever calls, and `myAnimal.makeSound()` runs `Animal`'s
original, unreplaced version instead of `Dog`'s intended bark. This is
exactly the failure `override-checking` — **first appearance** —
exists to catch: a specific, hardcoded compiler check triggered by the
`@Override` annotation — verifying a method genuinely overrides
something in its parent, turning a typo'd method name into a compile
error instead of a silent, unrelated new method.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `void makeSond() { ... }` inside `Dog` — compiles as a perfectly
   ordinary, valid new method. Nothing about Java's own rules objects
   to a class having a method that happens to almost, but not quite,
   match a parent's method name.
2. `myAnimal.makeSound();` — calls `Animal`'s original method, via
   dynamic dispatch (Lesson 0n), because `Dog` never actually overrode
   it — `Dog`'s real, if misspelled, method is a completely different,
   unrelated one that this call never touches.

Now add `@Override` above the typo'd method and try to compile again:

```java
class Dog extends Animal {
    @Override
    void makeSond() {
        System.out.println("Woof!");
    }
}
```

```
javac Main.java
```

Trying to compile this now produces a real compiler error:

```
error: method does not override or implement a method from a supertype
```

`@Override` asserted a claim — "this method overrides something in the
parent" — that the compiler could now actually check, and found false:
no method named exactly `makeSond` exists in `Animal` to override. The
exact same typo that compiled silently a moment ago now fails loudly,
at compile time, before the program ever runs.

### CS Lens

`@Override` is one of the very few Java annotations the compiler
itself enforces, rather than merely tolerating as inert metadata some
other tool might read later. Most annotations (like Lesson 0w's own
`@Deprecated`) only ever produce warnings or are read by external
tools; `@Override` is hardcoded directly into the compiler's own
checking, turning a specific category of naming mistake into a hard
compile error.

Also recognized in: `override` as a required keyword in C# (not
optional metadata the way Java's `@Override` is — C#'s compiler
enforces this category of correctness by making the keyword mandatory
in the first place, so this exact failure mode can't occur there the
same way it can in Java without the optional annotation).

### SE Lens

The alternative — never using `@Override`, relying on careful reading
to catch a mismatched method name — was not chosen going forward
because this lesson's own example is exactly how this bug actually
hides: the program compiles, runs, and produces *some* output, just not
the output anyone intended, with nothing pointing at the actual
mistake. `@Override` costs one line per overriding method and converts
an entire category of silent, hard-to-notice bug into a compile-time
error with a message pointing at the exact problem.

---

## Connect the Pieces

Lesson 0w's `@Deprecated` demonstrated the general shape: an
annotation is metadata a tool reads. `@Override` is the same mechanism,
aimed at one specific, real bug: a method meant to override a parent's
but misspelled compiles silently as an unrelated dead method without
it, and fails loudly, at the exact point of the mistake, with it.

## What Breaks Without This

This lesson's own example already showed the concrete failure
directly: `makeSond()`, without `@Override`, compiles and runs,
silently producing "Generic animal sound." instead of "Woof!" — no
error, no warning, nothing pointing at the mistake at all. That silent
wrong behavior *is* the failure mode `@Override` exists to convert into
a loud, specific compile-time error.

## Exercises

1. Fix the typo (`makeSond` → `makeSound`) with `@Override` still
   present, and confirm the program now both compiles and correctly
   prints "Woof!"
2. Deliberately reintroduce the typo one more time, with `@Override`
   present, and read the exact compiler error yourself before fixing it
   again.
3. Explain, in your own words, why `@Deprecated` only ever produces a
   warning while `@Override` can produce a hard error.

## Definition of Done

- [ ] You ran the misspelled `makeSond()` example *without* `@Override`
      and saw it silently produce the wrong output.
- [ ] You added `@Override` to the same misspelled method and saw the
      real "does not override or implement" compiler error.
- [ ] You fixed the typo and confirmed the program then compiled and
      produced the correct output.
