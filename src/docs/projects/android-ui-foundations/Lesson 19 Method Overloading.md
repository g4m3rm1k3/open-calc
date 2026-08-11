# Lesson 19: Method Overloading

**What you will build:** Nothing app-related yet — a disposable example
proving that Java allows more than one method with the same name on one
class, as long as their parameter lists genuinely differ, and how the
compiler decides which one actually runs at any given call site. The
transferable problem: the very next lesson's `ArrayList` has two
different methods both named `remove` — a real, common Java pattern this
series hasn't named yet, easy to confuse with Lesson 06's *overriding*
(same name, same signature, different class) despite sounding almost
identical.

**What you need to know first:** Lesson 06 (overriding — the concept
this lesson is deliberately contrasted against).

**Terms introduced in this lesson:**
- **Method overloading** — declaring more than one method with the same
  name on the same class, distinguished by having genuinely different
  parameter lists (different number, order, or types of parameters).
- **Overload resolution** — the compiler's process of deciding, at each
  individual call site, which overloaded method actually matches based
  on the arguments provided.

**Objects and methods used**
- `System.out.println(...)` — Java's `static` print-to-standard-output
  method, already taught in Lesson 01 — reappears in this lesson's own
  lab exactly as before. Method overloading is this lesson's own
  subject, given full treatment below.

---

## Concept Unit: Same Name, Different Parameters

### The Problem

Sometimes the most natural name for an operation stays the same even
though the *kind* of input it accepts genuinely differs — "print this"
makes sense whether the thing being printed is a number, a word, or
something else entirely. Requiring a distinct name for every variant
(`printNumber`, `printWord`, `printBoolean`, ...) would work, but Java
has a more direct way to let one name cover several related shapes.

### Introduce the Concept in Isolation

```java
class Greeter {
    String greet(String name) {
        return "Hello, " + name;
    }

    String greet(String name, int timesToRepeat) {
        return greet(name).repeat(timesToRepeat);
    }
}

public class OverloadDemo {
    public static void main(String[] args) {
        Greeter greeter = new Greeter();

        System.out.println(greeter.greet("Alex"));
        System.out.println(greeter.greet("Alex", 2));
    }
}
```

Compile and run:

```
javac OverloadDemo.java
java OverloadDemo
```

Real output:

```
Hello, Alex
Hello, AlexHello, Alex
```

### Mechanical Walkthrough

Both methods are named `greet` — this is legal, and is called **method
overloading**, because their **parameter lists** genuinely differ: one
takes a single `String`, the other takes a `String` and an `int`. At
each call site, the compiler performs **overload resolution**: it looks
at the number and types of arguments actually passed and picks the one
overload that matches. `greeter.greet("Alex")` — one argument — can only
match the first version; `greeter.greet("Alex", 2)` — two arguments —
can only match the second. This decision is made once, at compile time,
by matching argument shapes, not by anything resembling Lesson 06's
runtime dynamic dispatch.

### Discard the Throwaway Example

`Greeter` and `OverloadDemo` are deleted now. `List`'s real, standard-
library `remove` method, met properly in the very next lesson, has
exactly two overloads distinguished the same way — by parameter type,
not by anything happening at runtime.

### CS Lens

Method overloading is resolved entirely at **compile time**, based on
the static, declared types of the arguments at each call site — a
different mechanism from Lesson 06's overriding, which is resolved at
**runtime**, based on an object's real type. The two concepts sound
alike and are frequently confused by name alone; the actual test is:
does *which class the object really is* matter (overriding, Lesson 06),
or does *what arguments were passed at this call site* matter
(overloading, this lesson)?

Also recognized in: virtually every mainstream object-oriented and
statically-typed language's own overloading support (C++, C#), and
Java's own standard library making extremely heavy use of it —
`System.out.println` itself, used since Lesson 01, is actually a whole
family of overloaded methods (one for `String`, one for `int`, one for
`boolean`, ...) rather than one method that happens to accept anything.

### SE Lens

**Why does Java allow this instead of requiring a distinct name for
every variant, the way it requires a distinct name for every unrelated
method?** Overloading is appropriate specifically when the different
variants represent the *same conceptual operation*, applied to
different inputs — printing, greeting, removing something from a
collection. Forcing distinct names in these cases (`removeByIndex`,
`removeByValue`) would work but adds naming ceremony for something a
reader can already tell apart by looking at the arguments being passed.
Overloading becomes the wrong tool the moment two operations are
only *superficially* similar but conceptually different — that
case calls for genuinely distinct names instead, precisely so a reader
isn't misled into thinking they're the same operation.

---

## Connect the Pieces

One trace: `greeter.greet("Alex")` and `greeter.greet("Alex", 2)` called
two different method bodies sharing one name, chosen by the compiler
purely from each call site's argument shapes — one `String`, versus a
`String` and an `int`. `List`'s real `remove(int)` and `remove(Object)`,
next, are resolved by this exact same mechanism.

## What Breaks Without This

Add a third overload with the *same* parameter types as an existing one
but a different return type only — `int greet(String name) { return 0;
}` — alongside the existing `String greet(String name)`. Real error:

```
error: method greet(String) is already defined in class Greeter
```

This proves overload resolution depends entirely on the parameter list,
never the return type alone — two methods differing only in what they
return are not a legal overload, they're a duplicate declaration.

## Exercises

1. Add a third real overload, `String greet(String firstName, String
   lastName)`, and confirm it's selected correctly when called with two
   `String` arguments, distinct from the two-argument
   `String`/`int` version.
2. Call `greeter.greet(null, 2)` and confirm which overload the compiler
   selects — reasoning through why a `null` literal alone doesn't
   prevent the compiler from still correctly matching argument *count*
   and *position*, even though it says nothing about the object's real
   type at runtime.

## Definition of Done

- [ ] You ran the lab and saw two differently-shaped calls resolve to
      two different method bodies.
- [ ] You can state, precisely, the difference between overloading
      (this lesson) and overriding (Lesson 06) — resolved when, and
      based on what.
- [ ] You triggered the real "already defined" error from two methods
      differing only in return type.
- [ ] Commit: not applicable — the example is a throwaway lab.

Next: `Array` and the generic `ArrayList` — including a real, standard-
library method with exactly two overloads, resolved by this lesson's own
mechanism.
