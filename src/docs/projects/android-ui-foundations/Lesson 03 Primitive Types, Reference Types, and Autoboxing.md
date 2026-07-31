# Lesson 03: Primitive Types, Reference Types, and Autoboxing

**What you will build:** Nothing app-related yet — two small, disposable
examples proving that Java has two fundamentally different families of
type, and a real look at the automatic conversion Java performs when
code needs to cross between them. The transferable problem: Lesson 02
proved that assigning one object variable to another copies a
*reference*, and two variables can end up aliased to one shared object.
`int`, `boolean`, and Java's other primitive types do not work this way
at all — and code in this series will soon need a primitive number to
behave like an object, which doesn't happen automatically without a real
mechanism behind it.

**What you need to know first:** Lesson 02 (objects, references,
aliasing).

**Terms introduced in this lesson:**
- **Primitive type** — one of Java's eight built-in value types (`int`,
  `long`, `double`, `float`, `boolean`, `char`, `byte`, `short`) that
  holds a raw value directly, never a reference.
- **Reference type** — any class type (`String`, `Lightbulb`, every class
  this project defines or uses), always accessed through a reference,
  per Lesson 02.
- **Wrapper class** — a reference-type class (`Integer`, `Double`,
  `Boolean`, ...) that holds one primitive value inside a real object, so
  it can be used anywhere a reference type is required.
- **Autoboxing / unboxing** — Java automatically converting a primitive
  value into its wrapper object (autoboxing) or back (unboxing) when the
  surrounding code requires it.

---

## Concept Unit: Primitives Copy Their Value, Not a Reference

### The Problem

Lesson 02 proved that copying an object variable copies a reference, and
mutating through one alias is visible through the other. Does the same
thing happen for a plain `int`?

### Introduce the Concept in Isolation

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

Compile and run:

```
javac PrimitiveCopyDemo.java
java PrimitiveCopyDemo
```

Real output:

```
original: 5
copy: 100
```

`int copy = original;` copied the actual value `5` directly into `copy`
— a completely independent number, not a reference to anything.
Changing `copy` afterward has no effect on `original` whatsoever. This
is the exact opposite of Lesson 02's `Lightbulb alias = original;`
result, and the reason is fundamental: `int`, along with `long`,
`double`, `float`, `boolean`, `char`, `byte`, and `short`, are
**primitive types** — Java's eight built-in types that hold a raw value
directly, with no object and no reference involved at all. There is no
`new` anywhere in this example, and there doesn't need to be — primitives
are never constructed as objects.

### Discard the Throwaway Example

`PrimitiveCopyDemo` is deleted now. The contrast it proved — primitives
copy independently, references alias — carries forward every time this
project mixes the two, starting with the next unit.

### CS Lens

Two genuinely different assignment behaviors — copy-the-value versus
copy-the-reference — coexisting in one language is **value semantics
versus reference semantics**, Lesson 02's own term, now proven from the
opposite side: Java is not a language where "everything is an object" (unlike
Python, where even integers are objects); it deliberately keeps a
separate, lighter-weight family of types specifically to avoid the
overhead of full object allocation for simple numbers and booleans used
constantly throughout a program.

---

## Concept Unit: Wrapper Classes and Autoboxing

### The Problem

Some Java code — including a generic method or class, which by its own
rules can only work with reference types, never raw primitives —
genuinely needs a primitive value to behave like an object. Java doesn't
leave this to be handled manually every time.

### Introduce the Concept in Isolation

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

Compile and run:

```
javac AutoboxDemo.java
java AutoboxDemo
```

Real output:

```
42
42
java.lang.Integer
```

`Integer boxed = 42;` looks like a plain number assignment, but `Integer`
is a real class — a **wrapper class** — and `42` (a plain `int`
literal) is automatically wrapped inside a real `Integer` object,
without writing `new Integer(42)` by hand. This automatic conversion is
called **autoboxing**. `boxed.getClass().getName()` — calling a real
method every object has, confirming at runtime what type it actually is —
proves `boxed` is a genuine `java.lang.Integer` object, not a disguised
`int`. The reverse direction, `int unboxed = boxed;`, is **unboxing**:
automatically extracting the raw `int` value back out of the wrapper
object. Both conversions happen silently, inserted by the compiler,
whenever code mixes a primitive and its corresponding wrapper type.

### Discard the Throwaway Example

`AutoboxDemo` is deleted now. Every primitive type has exactly one
matching wrapper class — `int`/`Integer`, `double`/`Double`,
`boolean`/`Boolean`, and so on — and this exact silent conversion is what
makes it possible to hand a plain `int` value to code that's declared to
only accept objects, which a later lesson's generic method actually
does.

### CS Lens

Autoboxing is the compiler inserting a real, if invisible, conversion —
this is a genuine case (per the standard this curriculum holds itself
to) where "the compiler does it automatically" is stated *and* backed by
verifiable proof: `boxed.getClass().getName()` above directly shows the
real object type produced, rather than asking you to trust the claim.

### SE Lens

**Why does Java keep primitives and their wrapper classes as two
separate things at all, instead of making everything an object like
Python does?** Every `Integer` object carries real memory overhead
beyond the four bytes an `int` itself needs — an object header, and a
place in memory separate from wherever it's referenced from — multiplied
across a program that might create millions of numbers (looping over a
large list, for instance) into a genuinely significant cost. Keeping
primitives lightweight and reference types fuller-featured is a real
tradeoff Java makes deliberately, and autoboxing exists specifically to
bridge the gap only when something genuinely requires an object,
without forcing every plain number in the language to pay that cost all
the time.

---

## Connect the Pieces

One trace: `int original = 5` held a raw value directly, and copying it
produced two fully independent numbers — the opposite of Lesson 02's
object aliasing. `Integer boxed = 42` showed the one case where a
primitive needs to cross into reference-type territory, and Java's
compiler inserts a real, verifiable conversion (autoboxing) to make that
crossing automatic rather than requiring `new Integer(42)` to be written
by hand every time.

## What Breaks Without This

Attempt `Integer maybeNull = null; int unboxed = maybeNull;` in a
scratch file and run it. Real result:

```
Exception in thread "main" java.lang.NullPointerException
```

Unboxing `null` has nothing to extract a primitive value from — there is
no `int` hiding inside "no object at all." This is worth seeing now, and
is picked up in full in the very next lesson, which covers `null` and
this exact exception properly.

## Exercises

1. Change `AutoboxDemo`'s `Integer boxed = 42;` to `Double boxed =
   42.5;` and confirm `boxed.getClass().getName()` now reports
   `java.lang.Double` — direct proof that each primitive type has its
   own distinct wrapper class, not one generic "boxed number" type.
2. Time permitting: research why `Integer a = 100; Integer b = 100;
   System.out.println(a == b);` prints `true`, while the same code with
   `200` instead of `100` prints `false`. This is a real, well-documented
   quirk of Java's `Integer` caching — not required for this project, but
   a genuine example of autoboxing having real, surprising edge cases
   worth knowing exist.

## Definition of Done

- [ ] You ran both labs and saw primitive copying and autoboxing behave
      as claimed, not just described.
- [ ] You can name Java's eight primitive types, or at least recall that
      a fixed, small set exists.
- [ ] You can explain what autoboxing is and why it exists, in your own
      words.
- [ ] You triggered the real `NullPointerException` from unboxing a
      `null` `Integer`.
- [ ] Commit: not applicable — both examples are throwaway labs.

Next: `null` itself — what it actually represents, and how to avoid the
exception you just triggered by accident.
