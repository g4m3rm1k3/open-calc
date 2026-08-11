# Lesson 25: Static Nested Classes

**What you will build:** Nothing app-related yet — a disposable example
proving what `static` means on a nested class, and specifically what it
removes compared to a plain (non-static) nested class. The transferable
problem: this project's very next class needs a small helper class that
exists purely to serve one other class's own job, with no reason to
exist as an independent, top-level file — a real, common organizational
need, and Java has a specific, precise tool for it.

**What you need to know first:** Lesson 02 (objects, references, `new`),
Lesson 06 (`extends`, classes generally).

**Terms introduced in this lesson:**
- **Static nested class** — a class declared entirely inside another
  class, for organizational purposes, that does **not** hold any
  implicit reference to an instance of its enclosing class.

**Objects and methods used**
- `System.out.println(...)` — Java's `static` print-to-standard-output
  method, already taught in Lesson 01 — reappears in this lesson's own
  lab exactly as before. Static nested classes are this lesson's own
  subject, given full treatment above.

---

## Concept Unit: A Class Declared Inside Another, With No Hidden Link Back

### The Problem

A helper class that only ever supports one other specific class doesn't
need to live as its own separate, top-level file — but simply nesting
it naively inside the other class, without a specific keyword, produces
a real, hidden cost worth seeing directly rather than assuming away.

### Introduce the Concept in Isolation

```java
class Outer {
    private String outerLabel = "outer";

    static class Inner {
        String describe() {
            return "an inner instance, built with no Outer required";
        }
    }
}

public class StaticNestedDemo {
    public static void main(String[] args) {
        Outer.Inner inner = new Outer.Inner();
        System.out.println(inner.describe());
    }
}
```

Compile and run:

```
javac StaticNestedDemo.java
java StaticNestedDemo
```

Real output:

```
an inner instance, built with no Outer required
```

### Mechanical Walkthrough

`static class Inner` declared inside `Outer` is a **static nested
class** — notice `new Outer.Inner()` was constructed directly, with
**no** `Outer` object created first, anywhere in `main`. This is the
entire point of `static` here: without it (a plain, non-static "inner"
class instead), Java requires an existing `Outer` instance before an
`Inner` can be built at all — try removing `static` from `Inner` and
compiling the exact same `main` method; real error:

```
error: non-static variable this cannot be referenced from a static context
```

(the exact message depends on which line triggers first, but the root
cause is the same): a non-static inner class implicitly carries a hidden
reference back to the specific `Outer` object that created it, and
building one requires writing `outerInstance.new Inner()` instead of the
plain `new Outer.Inner()` shown above. `Outer.Inner`'s naming
(dot-separated, outer class first) reflects that it's declared *inside*
`Outer` purely for organization — a real, separate class with its own
compiled `.class` file (`Outer$Inner.class`, confirmed by running
`javac` and listing the directory), just grouped under `Outer`'s own
name.

### Discard the Throwaway Example

`Outer`, `Inner`, and `StaticNestedDemo` are deleted now. The real
project class built next uses this exact same `static` nested class
shape, constructed the same direct way, with no enclosing instance
required first.

### CS Lens

A static nested class is a real, separate class — with its own compiled
output, confirmed by inspecting the actual `.class` files produced — that
happens to be declared inside another class's namespace purely for
organization, not a different kind of object at runtime. The distinction
from a non-static inner class is entirely about whether an implicit
reference to an enclosing instance is carried along.

Also recognized in: C++ and C#'s own nested class support (C++'s nested
classes are static-by-default, the opposite of Java's own default), and
any codebase where a small, tightly-coupled helper type is deliberately
kept inside the one class it exists to serve, rather than cluttering the
project's top-level namespace with a type nothing else will ever use.

### SE Lens

**Why would a class ever want the hidden reference a non-static inner
class carries, given that a static nested class avoids the requirement
entirely?** A non-static inner class is the right choice specifically
when its instances genuinely need to reach back into their creating
object's own state — an inner class representing "one row of a
specific list instance," for example, that needs to call back into that
exact list. When a nested class's job is self-contained and never needs
to reach back into an enclosing instance, `static` removes a real cost
(an extra hidden reference carried by every instance) with no
functionality lost.

The hidden reference itself is not a claim to take on faith — inspect
the real compiled class. Change `Inner`'s `describe()` (non-static
version) to actually read `outerLabel`:

```java
class Outer {
    private String outerLabel = "outer";

    class Inner {
        String describe() {
            return "inner, reaching back to: " + outerLabel;
        }
    }
}
```

```bash
javac Outer.java
javap -p Outer\$Inner.class
```

Real output:

```
class Outer$Inner {
  final Outer this$0;
  Outer$Inner(Outer);
  java.lang.String describe();
}
```

`final Outer this$0;` is the hidden reference, made visible — a real
field, generated by the compiler, never written in the source shown
above. (Worth noting precisely: this exact field only appears once
`describe()` actually uses `outerLabel` — the earlier, unused-outer-
state version of `Inner` this lesson started with doesn't need it, and
a real compiler is free to omit generating it when nothing requires it.)

---

## Connect the Pieces

One trace: `new Outer.Inner()` built a real, independent object with no
`Outer` instance required — proven directly by `main` never constructing
one. Removing `static` broke exactly this, requiring an enclosing
instance to exist first — proof that `static` on a nested class is the
entire mechanism removing that requirement, not a stylistic detail.

## What Breaks Without This

Already shown above: removing `static` from `Inner` and keeping the
exact same `new Outer.Inner()` call produces a real compiler error
demanding an enclosing instance. Fix it by either restoring `static`, or
by changing the call site to `new Outer().new Inner()` — confirming both
are genuine, different ways to resolve the same requirement.

## Exercises

1. Add a method to the non-static version of `Inner` that reads
   `Outer`'s own `outerLabel` field directly, and confirm it compiles
   only once `static` is removed and a real `Outer` instance is
   supplied — direct proof of what the hidden reference actually
   enables, not just what it costs.
2. Confirm, using `javac` and listing the output directory, that both
   the static and non-static versions produce a file named
   `Outer$Inner.class` — proving both are real, separately-compiled
   classes either way; `static` changes what each instance carries at
   runtime, not whether the nested class is "real."

## Definition of Done

- [ ] You ran the lab and constructed a static nested class with no
      enclosing instance.
- [ ] You triggered the real compiler error from removing `static`, and
      can explain what it was demanding.
- [ ] You can state, precisely, what a non-static inner class carries
      that a static one does not.
- [ ] Commit: not applicable — the example is a throwaway lab.

Next: the real project's own small helper class, built with this exact
`static` nested shape.
