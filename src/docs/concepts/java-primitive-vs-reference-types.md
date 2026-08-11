# Concept: Java Primitive vs. Reference Types

**What you'll understand by the end:** why assigning an `int` behaves
completely differently from assigning an object variable, and what
Java's two separate families of type actually are.

**Prerequisites:** `java-references-and-aliasing.md`.

## Setup

```
mkdir primdemo && cd primdemo
```
Plain `javac`/`java`, no dependencies.

## The Problem

Copying an object variable copies a reference — mutating through one
alias is visible through the other (`java-references-and-aliasing.md`).
Does the same thing happen for a plain `int`?

## The Isolated Example

```java
public class PrimitiveCopyDemo {
    public static void main(String[] args) {
        int original = 5;
        int copy = original;

        copy = 100;

        System.out.println("original: " + original);
        System.out.println("copy: " + copy);
    }
}
```

```
javac PrimitiveCopyDemo.java
java PrimitiveCopyDemo
```

**Real output:**
```
original: 5
copy: 100
```

**What this proves:** `int copy = original;` copied the actual value
`5` directly into `copy` — a completely independent number, not a
reference to anything. Changing `copy` afterward has no effect on
`original` whatsoever — the exact opposite of what aliasing two object
variables produces.

## Mechanical Walkthrough

- `int original = 5;` — a **primitive type** holding a raw value
  directly: no `new`, no object, no reference. `int`, along with
  `long`, `double`, `float`, `boolean`, `char`, `byte`, and `short`, are
  Java's eight built-in primitive types.
- `int copy = original;` — copies the raw value `5` out of `original`
  and into `copy`; after this line the two variables share nothing.
- `copy = 100;` — overwrites only `copy`'s own value; `original` cannot
  be affected, since there was never a reference connecting them.

## CS Lens

Two genuinely different assignment behaviors — copy-the-value versus
copy-the-reference — coexisting in one language is **value semantics
versus reference semantics**. Java is not a language where "everything
is an object" (unlike Python, where even integers are objects); it
deliberately keeps a separate, lighter-weight family of types
specifically to avoid full object-allocation overhead for simple
numbers and booleans used constantly throughout a program.

Also recognized in: C/C++'s stack-allocated value types vs. heap
pointers, C#'s `struct` vs. `class` distinction (the direct analog),
Python's deliberate choice to make *everything* an object instead
(no primitive/reference split at all).

## SE Lens

Why keep a separate family of primitive types at all, instead of making
every value a full reference-type object? A primitive's value-copy
semantics mean assigning or passing one is always just copying a few
raw bytes — no object allocation, no reference indirection, nothing for
later cleanup — a real, deliberate performance tradeoff for the values
a typical program creates and copies constantly. The cost: primitives
can't be used anywhere an API requires an object (a generic collection,
for instance) — the exact gap a wrapper class and autoboxing (a
separate, related concept) exist to bridge.

## Connection

Builds on `java-references-and-aliasing.md` by proving the opposite
case. The gap this creates — a primitive can't stand in for an object —
is what autoboxing exists to close.

## Try It Yourself

1. Change `int` to `boolean` (`boolean original = true; boolean copy =
   original; copy = false;`) and confirm the same independent-copy
   behavior holds for every primitive type, not just `int`.
2. Predict, then verify: does `double original = 5.5; double copy =
   original;` behave the same way? Confirm all eight primitive types
   share this exact copy behavior, with no exceptions.
