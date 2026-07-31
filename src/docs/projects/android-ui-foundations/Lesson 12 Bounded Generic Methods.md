# Lesson 12: Bounded Generic Methods

**What you will build:** Nothing app-related yet — a disposable example
proving what a generic method is and how Java infers its type at each
call site, before meeting Android's real `findViewById` method, which has
exactly this shape. The transferable problem: a method that needs to
work correctly for many different types, while still giving back a
precisely-typed result with no manual casting, needs a real language
mechanism behind it — this isn't Android-specific, and understanding it
on something disposable first is what makes the real, unfamiliar
framework signature readable on first sight instead of something to
pattern-match.

**What you need to know first:** Lesson 02 (references), Lesson 03
(primitive vs. reference types, autoboxing).

**Terms introduced in this lesson:**
- **Generic method** — a method whose own signature carries a type
  parameter, decided fresh at each call site, independent of whether the
  class it belongs to is generic at all.
- **Type inference** — the compiler determining a generic method's actual
  type parameter from the arguments passed, without it being written out
  explicitly.

---

## Concept Unit: A Method That Works for Any Type, Correctly Typed Each Time

### The Problem

A method like "return whichever of these two values isn't missing"
is a genuinely useful, generic idea — it doesn't care whether it's
comparing two `String`s, two numbers, or two of any other type. Writing
a separate, nearly-identical method for every type that might ever be
used this way would be real, repetitive waste. Java has a way to write
this exactly once.

### Introduce the Concept in Isolation

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

Compile and run:

```
javac GenericMethodDemo.java
java GenericMethodDemo
```

Real output:

```
fallback
42
```

`static <T> T firstNonNull(T first, T second)` — the `<T>` immediately
after `static` (and before the return type) is what makes this a
**generic method**: `T` is a placeholder type, decided fresh at each
*call site*, not fixed once for the whole `Box` class (a generic
*class's* type parameter works differently — a later lesson covers that
distinction on its own). The first call,
`Box.firstNonNull(null, "fallback")`, has the compiler infer `T =
String`, because both arguments passed are `String`-compatible; the
return value is usable directly as a `String`, no cast written anywhere.
The second call, `Box.firstNonNull(42, 0)`, infers a completely
different `T = Integer` for that specific call — the exact same method,
reused, deciding its own type fresh each time it's invoked. This is
possible for `int` values at all only because of Lesson 03's autoboxing:
generics can only ever work with reference types, so the plain `int`
literals `42` and `0` are automatically boxed into `Integer` objects
before `firstNonNull` ever sees them, which is also why `count` above is
declared `Integer`, not `int`.

This output proves generic-method type inference is real and mechanical,
not something to take on faith: two calls to one method body, two
different inferred types, two different correctly-typed results with
zero casts.

### Discard the Throwaway Example

`Box` and `GenericMethodDemo` are deleted now — the mechanism they proved
carries forward; this exact code does not. The very next lesson meets
`findViewById`'s real signature, which adds exactly one more idea on top
of what was just proven: **bounding** the type parameter (`<T extends
View>` instead of plain `<T>`), restricting which types are even legal
to infer.

### CS Lens

A generic method is **parametric polymorphism** applied at the method
level rather than the whole-class level (the class-level version gets
its own lab once this project's data needs it) — one real implementation
working correctly, and safely, across many different types, with the
compiler checking correctness at every call site instead of the method
needing to be copy-pasted per type.

Also recognized in: Java's own standard library (`Collections.max(...)`,
generic across any comparable type), C++ templates, and C# generic
methods — the same underlying idea, different syntax, in every
statically-typed, object-oriented language mainstream enough to need it.

### SE Lens

**Why not just write this method to accept and return plain `Object`,
skipping generics entirely?** An `Object`-typed version would compile
and run, but every caller would need to manually cast the result back to
whatever real type they expected — `(String) Box.firstNonNull(...)` —
reintroducing exactly the risk Lesson 09 (once written) covers for
`findViewById` itself: a wrong cast compiles fine and only fails at
runtime. A generic method moves that same safety check to compile time,
for free, at the cost of the `<T>` syntax needing to be understood once.

---

## Connect the Pieces

One trace: `Box.firstNonNull(null, "fallback")` and
`Box.firstNonNull(42, 0)` called the exact same method body, with the
compiler inferring a different, correct type for `T` each time — `String`
for one call, `Integer` (via Lesson 03's autoboxing) for the other —
proving a generic method genuinely adapts to its caller rather than
being fixed to one type. `findViewById`, next, does exactly this, bounded
to only ever infer some kind of `View`.

## What Breaks Without This

Remove the `<T>` from `firstNonNull`'s declaration, changing it to a
plain `Object firstNonNull(Object first, Object second)`, and change the
call site back to `String name = Box.firstNonNull(null, "fallback");`
with no cast. Real error:

```
error: incompatible types: Object cannot be converted to String
```

This proves the earlier SE Lens concretely: without generics, the
compiler only ever knows the return type is the general `Object`, and
assigning it directly into a more specific `String` variable is rejected
until a manual cast is added back in.

## Exercises

1. Add a third call, `Boolean flag = Box.firstNonNull(null, true);`, and
   confirm the same method correctly infers `T = Boolean` for this call,
   with autoboxing converting the literal `true` the same way `42` was
   converted earlier.
2. Write a second generic method, `static <T> boolean bothNonNull(T
   first, T second)`, returning whether neither argument is `null`. Call
   it with two different types across two separate calls, confirming one
   method body serves both.

## Definition of Done

- [ ] You ran the lab and saw two different inferred types produced by
      one method body.
- [ ] You can explain what type inference means, in your own words.
- [ ] You triggered the real "incompatible types" error from the
      non-generic version, and can explain why it happened.
- [ ] Commit: not applicable — the example is a throwaway lab.

Next: `findViewById` — the same generic-method idea, bounded to only
ever produce some kind of `View`, on a real, unfamiliar Android class.
