# Concept: Java Autoboxing and Unboxing

**What you'll understand by the end:** how a primitive value becomes a
real object when code requires one, verified directly rather than taken
on faith, and why this conversion exists at all.

**Prerequisites:** `java-primitive-vs-reference-types.md`.

## Setup

```
mkdir autoboxdemo && cd autoboxdemo
```
Plain `javac`/`java`, no dependencies.

## The Problem

Some code — including a generic method or class, which by its own rules
can only work with reference types, never raw primitives — genuinely
needs a primitive value to behave like an object. Nothing about a
primitive type makes this automatic on its own.

## The Isolated Example

```java
public class AutoboxDemo {
    public static void main(String[] args) {
        Integer boxed = 42;
        int unboxed = boxed;

        System.out.println(boxed);
        System.out.println(unboxed);
        System.out.println(boxed.getClass().getName());
    }
}
```

```
javac AutoboxDemo.java
java AutoboxDemo
```

**Real output:**
```
42
42
java.lang.Integer
```

**What this proves:** `Integer boxed = 42;` looks like a plain number
assignment, but `Integer` is a real class — a **wrapper class** — and
`42` is automatically wrapped inside a real `Integer` object, without
writing `new Integer(42)` by hand. `boxed.getClass().getName()` — a
real method every object has, confirming its actual runtime type —
proves `boxed` really is a `java.lang.Integer` object, not a disguised
`int`. This automatic conversion is **autoboxing**; the reverse,
`int unboxed = boxed;`, is **unboxing**.

## Mechanical Walkthrough

- `Integer boxed = 42;` — a **wrapper class**: `Integer` is a real
  reference type, not a primitive. The literal `42` (an `int`) is
  autoboxed into a real `Integer` object, and `boxed` holds a reference
  to it, exactly like any other object variable.
- `int unboxed = boxed;` — **unboxing**, the reverse conversion:
  extracts the raw `int` value back out of the `Integer` object.
- `boxed.getClass().getName()` — `getClass()` is a method every Java
  object has (inherited from `Object`), returning an object
  representing its actual runtime type; `.getName()` reads that type's
  fully-qualified name as a `String`. This is what turns "autoboxing
  produces a real object" from a claim into the verified
  `java.lang.Integer` in the real output above.

## CS Lens

Autoboxing is the compiler inserting a real, if invisible, conversion —
directly verifiable here (`getClass().getName()`) rather than a claim
taken on faith.

Also recognized in: Python's own implicit int/float promotion in mixed
arithmetic (a different conversion, same "compiler/interpreter quietly
bridges two representations" shape), and any language with a boxed
wrapper around a primitive-like value (JavaScript's `Number` object
wrapping a primitive `number`, though JS reaches for it far less often).

## SE Lens

Why keep primitives and their wrapper classes as two separate things at
all, instead of making everything an object? Every `Integer` object
carries real memory overhead beyond the four bytes an `int` itself
needs — an object header, and a separate place in memory — multiplied
across a program that creates millions of numbers into a genuinely
significant cost. Keeping primitives lightweight and reference types
fuller-featured is a deliberate tradeoff; autoboxing exists specifically
to bridge the gap only when something genuinely requires an object,
without forcing every plain number in the language to pay that cost all
the time.

## Connection

Builds directly on `java-primitive-vs-reference-types.md` — this is the
one place a primitive needs to cross into reference-type territory, and
the language inserts a real, verifiable conversion to make that
crossing automatic.

## Try It Yourself

1. Change `Integer boxed = 42;` to `Double boxed = 42.5;` and confirm
   `boxed.getClass().getName()` now reports `java.lang.Double` — each
   primitive type has its own distinct wrapper class, not one generic
   "boxed number" type.
2. Attempt `Integer maybeNull = null; int unboxed = maybeNull;` and run
   it. Real result: a `NullPointerException` — unboxing `null` has
   nothing to extract a primitive value from, since there is no `int`
   hiding inside "no object at all."
3. Research why `Integer a = 100; Integer b = 100;
   System.out.println(a == b);` prints `true`, while the same code with
   `200` instead of `100` prints `false` — a real, well-documented quirk
   of `Integer` caching, a genuine example of autoboxing having
   surprising edge cases.
