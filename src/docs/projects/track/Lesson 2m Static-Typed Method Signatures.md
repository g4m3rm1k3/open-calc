# Lesson 2m: Static-Typed Method Signatures

**What you will build:** A disposable lab.

**What you need to know first:** Lesson 0e's method.

**Terms introduced in this lesson:**

- **Static-typed method signatures** — a statically-typed language
  requires every parameter and return value to have a declared type,
  checked at compile time, including a way to declare "returns
  nothing."

---

## Concept Unit: Static-Typed Method Signatures

### The Problem

Every method written so far has had a declared return type and
declared parameter types — accepted so far without stopping to name why
that's required at all, or what "returns nothing" even means as a
declared type.

### Introduce the Concept in Isolation

```
mkdir lesson-2m
cd lesson-2m
```

Create `Main.java`:

```java
public class Main {
    static int add(int first, int second) {
        return first + second;
    }

    static void printSum(int first, int second) {
        System.out.println("Sum: " + add(first, second));
    }

    public static void main(String[] args) {
        printSum(3, 4);
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
Sum: 7
```

`static int add(int first, int second)` and `static void
printSum(int first, int second)` are `static-typed method signatures`
— **first appearance**: a statically-typed language requires every
parameter and return value to have a declared type, checked at compile
time, including a way to declare "returns nothing." `add` declares
`int` as its return type — the compiler checks, at every call site,
that its result is actually used as an `int`. `printSum` declares
`void` — Java's specific way of saying "this method produces no value
at all," itself a real, required part of the signature, not the
absence of one.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `static int add(int first, int second)` — **(a) first appearance**
   of this signature shape examined explicitly: return type (`int`),
   method name (`add`), parameter list with each parameter's own
   declared type (`int first`, `int second`).
2. `static void printSum(int first, int second)` — the same shape,
   with `void` in the return-type position specifically declaring "no
   value returned," rather than that position simply being left empty.
3. `add(first, second)` inside `printSum` — the compiler checks this
   call against `add`'s declared signature: two `int` arguments, an
   `int` result — a mismatch (passing a `String`, say) would fail to
   compile, never reaching runtime at all.

### CS Lens

A statically-typed signature is a real, checked contract: every caller
and the method itself agree, before the program ever runs, on exactly
what types cross the boundary in each direction. This is what makes
`onCreate(Bundle savedInstanceState)` (Lesson 2e) readable as more than
a memorized shape: `Bundle` is the declared parameter type, and the
absent explicit return type slot (filled by `void`) means "no value
comes back."

Also recognized in: type annotations in TypeScript (optional, unlike
Java's required signatures), C#'s identical required-signature model,
any statically-typed language generally. Python requires no declared
types at all — optional type hints exist, but nothing enforces them at
runtime, a real, consequential contrast worth naming.

### SE Lens

Requiring every signature to be fully typed, checked at compile time,
was Java's own deliberate design choice, catching an entire category of
"wrong type passed here" mistake before the program ever runs, at the
cost of writing every type out explicitly rather than leaving it
inferred or unchecked.

---

## Connect the Pieces

`static int add(int, int)` named the declared-type contract every
method signature in this course has already used — including Lesson
2e's own `onCreate(Bundle savedInstanceState)`, read but not yet fully
explained.

## What Breaks Without This

Try calling `add("three", "four")` (strings, not ints). Compile it
yourself to see the real compiler error — the mismatch is caught before
the program ever runs, never reaching a confusing runtime failure.

## Exercises

1. Add a third method, `static double divide(int first, int second)`,
   and call it from `main`.
2. Try `add("three", "four")` yourself, read the real compiler error,
   then remove the line.
3. Explain, in your own words, what `void` declares, as opposed to
   simply omitting a return type.

## Definition of Done

- [ ] You ran the example and saw the real output.
- [ ] You completed Exercise 2 and saw the real compiler error.
- [ ] You can state, without looking back at this lesson, what `void`
      as a return type actually declares.
