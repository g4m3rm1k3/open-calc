# Lesson 4d: Primitives vs. Reference Types

**What you will build:** A disposable lab.

**What you need to know first:** Lesson 4c's identity vs. equality.

**Terms introduced in this lesson:**

- **Primitives vs. reference types** — Java splits every type into
  primitives (raw values, copied by value, never `null`) and
  objects/reference types (copied by reference, can be `null`).

---

## Concept Unit: Primitives vs. Reference Types

### The Problem

Every field and variable seen so far — `Box`, `String`, and Lesson
0i's `int` fields — hasn't been shown to behave identically. Java
genuinely splits every type into two categories with real, different
behavior, and conflating them (assuming an `int` behaves like a `Box`
reference, or the reverse) leads to real, wrong predictions about a
program's behavior.

### Introduce the Concept in Isolation

```
mkdir lesson-4d
cd lesson-4d
```

Create `Main.java`:

```java
public class Main {
    public static void main(String[] args) {
        int firstNumber = 10;
        int secondNumber = firstNumber;
        secondNumber = 99;

        System.out.println("firstNumber: " + firstNumber);
        System.out.println("secondNumber: " + secondNumber);
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
firstNumber: 10
secondNumber: 99
```

Unlike Lesson 4a's `Box second = first;`, changing `secondNumber` left
`firstNumber` completely unaffected. This is `primitives vs. reference
types` — **first appearance**: Java splits every type into primitives
(raw values, copied by value, never `null`) and objects/reference
types (copied by reference, can be `null`). `int` is a primitive:
`secondNumber = firstNumber;` copied the actual number, `10`, into
`secondNumber` — two genuinely independent values, unlike `Box`, where
the same-looking assignment copied a shared reference instead.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `int firstNumber = 10;` — **(b) reappearing** primitive
   declaration, already used since Lesson 0i, now examined specifically
   for its copy behavior rather than taken for granted.
2. `int secondNumber = firstNumber;` — **(a) first appearance** of
   this exact contrast: visually identical in shape to Lesson 4a's
   `Box second = first;`, but copies the raw value `10` itself, not a
   reference to shared storage — there is no "shared `int`" the way
   there was a shared `Box` object.
3. `secondNumber = 99;` — changes only `secondNumber`'s own
   independent storage; `firstNumber` was never connected to it at
   all.

### CS Lens

This split is real and has genuine consequences beyond copy behavior:
a primitive can never be `null` (an `int` variable always holds some
actual number), where any reference-typed variable, including `Box`,
can hold `null` — a reference pointing at nothing. Generics (Lesson
0u) also only work with reference types — `List<int>` cannot exist in
Java at all; `List<Integer>` (the `int` wrapper class, a real
reference type) is the actual, required alternative.

Also recognized in: value types (`struct`) versus reference types
(`class`) in C#, an almost identical split to Java's own;
stack-allocated versus heap-allocated values in C++, a related but
more manually-controlled version of the same underlying idea. Python
has no such split at all — every value there, including small
integers, is genuinely an object, a real and consequential contrast
worth naming directly.

### SE Lens

The alternative — Java treating every value, including numbers, as a
reference type uniformly (as Python does) — was not chosen for Java's
own design; primitives exist specifically for performance: an `int`
stored directly, with no separate object allocation or reference
indirection, is faster to create and access than a reference-typed
number would be. The cost is exactly this lesson's own subject: two
genuinely different copy behaviors a programmer must keep straight,
rather than one uniform rule covering every type.

---

## Connect the Pieces

`int secondNumber = firstNumber;` looks identical in shape to Lesson
4a's `Box second = first;`, but behaves completely differently,
because primitives are copied by value while reference types are
copied by reference — the exact distinction that makes Lesson 4b's
aliasing possible for `Box` at all, and impossible for a plain `int`.

## What Breaks Without This

Try to compile `int x = null;`. See the real compiler error this
produces — proof a primitive genuinely cannot hold `null`, unlike any
reference-typed variable.

## Exercises

1. Change this lesson's own example to use `Integer` (the
   reference-type wrapper for `int`) instead of `int`, and predict,
   then confirm, whether `secondNumber = 99;` still leaves
   `firstNumber` unaffected.
2. Write a short program demonstrating that a primitive variable can
   never hold `null`, by trying to compile `int x = null;` and reading
   the real compiler error.
3. Explain, in your own words, why Java has primitives at all, rather
   than treating every value as an object uniformly.

## Definition of Done

- [ ] You ran the primitive-copy example and saw the real, independent
      output confirming `int` copies by value.
- [ ] You completed Exercise 2 and saw the real compiler error for
      assigning `null` to a primitive.
- [ ] You can state, without looking back at this lesson, why `int`
      variables never alias each other the way `Box` variables can.
