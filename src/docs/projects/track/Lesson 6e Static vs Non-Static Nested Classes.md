# Lesson 6e: Static vs. Non-Static Nested Classes

**What you will build:** A small, fully runnable, plain Java lab,
disassembled with `javap` for real, verified proof.

**What you need to know first:** Lesson 0b's nested class, Lesson
0i's class-level state.

**Terms introduced in this lesson:**

- **Static vs. non-static nested classes** — a non-static nested class
  silently holds a hidden reference to the specific enclosing-class
  instance that created it; a static nested class carries no such
  reference and can be constructed independent of any enclosing
  instance.

---

## Concept Unit: Static vs. Non-Static Nested Classes

### The Problem

A `ViewHolder` (a later lesson's own subject) is conventionally
declared as a nested class (Lesson 0b) inside its Adapter — but
whether that nested class silently holds a hidden reference back to
its specific enclosing Adapter instance is a real, deliberate choice
with real consequences.

### Introduce the Concept in Isolation

```
mkdir lesson-6e
cd lesson-6e
```

Create `Main.java`:

```java
class Outer {
    int outerField = 42;

    class NonStaticInner {
        void show() {
            System.out.println("Can see outerField: " + outerField);
        }
    }

    static class StaticInner {
        void show() {
            System.out.println("Cannot see outerField directly.");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Outer outer = new Outer();

        Outer.NonStaticInner nonStatic = outer.new NonStaticInner();
        nonStatic.show();

        Outer.StaticInner staticInner = new Outer.StaticInner();
        staticInner.show();
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
Can see outerField: 42
Cannot see outerField directly.
```

`NonStaticInner` reads `outerField` directly, with no qualifier at
all; `StaticInner` cannot — it was never given a hidden connection to
any specific `Outer` instance. Prose alone isn't proof of a
compiler-synthesized field the source code never shows — disassembling
both compiled classes with `javap -p` makes the hidden difference
directly inspectable:

```
javap -p 'Outer$NonStaticInner.class'
```

```
class Outer$NonStaticInner {
  final Outer this$0;
  Outer$NonStaticInner(Outer);
  void show();
}
```

```
javap -p 'Outer$StaticInner.class'
```

```
class Outer$StaticInner {
  Outer$StaticInner();
  void show();
}
```

`Outer$NonStaticInner` really does carry a compiler-generated field,
`final Outer this$0;` — nowhere in the source code, and its
constructor genuinely takes an `Outer` argument, matching `outer.new
NonStaticInner()`'s required enclosing-instance syntax.
`Outer$StaticInner` has neither: no synthesized field at all, and a
plain, no-argument constructor. This is `static vs. non-static nested
classes` — **first appearance**: a non-static nested class silently
holds a hidden reference to the specific enclosing-class instance that
created it; a static nested class carries no such reference and can be
constructed independent of any enclosing instance.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `class NonStaticInner { ... }`, with no `static` — **(a) first
   appearance** of the default nested-class behavior: silently carries
   a hidden reference to the specific `Outer` instance that created it.
2. `outer.new NonStaticInner()` — **(a) first appearance** of this
   exact construction syntax, required specifically because a
   non-static nested class needs a real enclosing instance to attach
   its hidden reference to.
3. `static class StaticInner { ... }` — **(b) reappearing** `static`
   from Lesson 0i, here applied to a nested class rather than a field:
   no hidden reference to any `Outer` instance exists.
4. `new Outer.StaticInner()` — plain construction, no enclosing
   instance required at all.

### CS Lens

This distinction matters for memory and correctness both: a
non-static nested class implicitly keeps its enclosing instance alive
(it can never be garbage-collected while the nested instance still
exists), and can silently reach the enclosing instance's own fields —
sometimes exactly what's wanted, sometimes an unintended, hidden
coupling.

Also recognized in: closures in JavaScript and Python (which capture
their enclosing scope similarly, though through a different
mechanism), inner classes in other JVM languages generally.

### SE Lens

A `ViewHolder` (a later lesson's own subject) is deliberately declared
`static`, specifically to avoid an unwanted hidden reference back to
its own Adapter instance — a `ViewHolder` should only ever need the
specific row's own views, not a hidden, implicit connection to the
whole Adapter.

---

## Connect the Pieces

`NonStaticInner` and `StaticInner` look almost identical in source, but
disassembly proves a real, compiler-generated difference. The next
lesson (`ViewHolder`) shows exactly why this distinction is chosen
deliberately, not incidentally.

## What Breaks Without This

Assuming a non-static nested class carries no hidden cost — no
implicit reference, no implicit lifetime coupling to its enclosing
instance — is contradicted directly by the real `javap` disassembly
above: `this$0` is a real, compiler-synthesized field, not a
convenience with no consequence.

## Exercises

1. Compile and disassemble both classes yourself with `javap -p` and
   confirm you see the exact same real output shown above.
2. Add a second field to `Outer` and confirm `NonStaticInner` can read
   it too, with no additional syntax required.
3. Explain, in your own words, why `outer.new NonStaticInner()`
   requires a real `Outer` instance while `new Outer.StaticInner()`
   does not.

## Definition of Done

- [ ] You ran the example and saw the real output.
- [ ] You completed Exercise 1 and saw the real `javap` disassembly
      yourself.
- [ ] You can state, without looking back at this lesson, what
      `this$0` is and which kind of nested class carries it.
