# Concept: Java Generic Methods

**What you'll understand by the end:** what a generic method actually is,
and how the compiler infers its type parameter fresh at each call site
with no manual casting.

**Prerequisites:** `java-references-and-aliasing.md`,
`java-autoboxing-and-unboxing.md` (a generic method can only work with
reference types, so a primitive argument gets autoboxed before the
method ever sees it).

## Setup

```
mkdir genericdemo && cd genericdemo
```
Plain `javac`/`java`, no dependencies.

## The Problem

A method like "return whichever of these two values isn't missing" is
useful regardless of whether it's comparing two `String`s, two numbers,
or two of any other type. Writing a separate, nearly-identical method
for every type that might ever need this would be real, repetitive
waste.

## The Isolated Example

```java
class Box {
    static <T> T firstNonNull(T first, T second) {
        return first != null ? first : second;
    }
}

public class GenericMethodDemo {
    public static void main(String[] args) {
        String name = Box.firstNonNull(null, "fallback");
        Integer count = Box.firstNonNull(42, 0);

        System.out.println(name);
        System.out.println(count);
    }
}
```

```
javac GenericMethodDemo.java
java GenericMethodDemo
```

**Real output:**
```
fallback
42
```

**What this proves:** two calls to one method body, two different
inferred types, two different correctly-typed results, zero casts.

## Mechanical Walkthrough

- `static <T> T firstNonNull(T first, T second)` — the `<T>`
  immediately after `static` (before the return type) is what makes
  this a **generic method**: `T` is a placeholder type decided fresh at
  each *call site*, not fixed once for the whole class the way a
  generic *class's* own type parameter works.
- `Box.firstNonNull(null, "fallback")` — the compiler infers `T =
  String`, since both arguments are `String`-compatible; the return
  value is usable directly as a `String`, no cast written anywhere.
- `Box.firstNonNull(42, 0)` — infers a completely different `T =
  Integer` for this specific call. This only works at all because of
  autoboxing: generics can only work with reference types, so the
  plain `int` literals are boxed into `Integer` objects before the
  method ever sees them.

## CS Lens

A generic method is **parametric polymorphism** applied at the method
level: one real implementation working correctly, and safely, across
many different types, with the compiler checking correctness at every
call site instead of the method body needing runtime type checks.

Also recognized in: C#'s generic methods (identical shape), C++
templates (a different mechanism — compile-time code generation per
type, rather than type erasure — reaching for a similar goal), and
TypeScript's generic functions.

## SE Lens

Why not just write the method to accept `Object` and cast at every call
site instead? An `Object`-typed method compiles but pushes the type
safety check to runtime — passing the wrong type crashes with a
`ClassCastException` far from the actual mistake, and every caller has
to remember to cast the result correctly. A generic method keeps that
check at compile time, at the call site itself, catching a type
mismatch before the program ever runs.

## Connection

Builds on `java-autoboxing-and-unboxing.md` for the primitive-argument
case. **Bounded** generic methods — restricting `T` to only types that
extend or implement something specific (`<T extends View>`) — are the
same mechanism with one added constraint, covered separately once a
real API (like Android's `findViewById`) needs it.

## Try It Yourself

1. Call `Box.firstNonNull("a", 42)` — mixing a `String` and an
   `Integer` argument — and read the real compiler error. Confirm both
   arguments to one call must infer to a single, compatible `T`.
2. Add a second generic method, `static <T> T lastNonNull(T first, T
   second)`, returning `second` if it's non-null, otherwise `first`.
   Confirm it infers types the same way with no changes to how it's
   called.
