# Lesson 14: Interfaces, Anonymous Classes, and Lambdas

**What you will build:** Nothing on screen yet — three disposable labs
that build up, piece by piece, to the exact mechanism Android uses for
every button click, text change, and touch event in the entire
framework. The transferable problem: Lesson 07 already proved Android
calls your code at moments of its own choosing (Inversion of Control).
That lesson's example — `onCreate` — is a method the framework calls
because you overrode it on a class the framework already controls
(`Activity`). A button click needs something more flexible: the
framework doesn't control your class, and you need to hand it a small,
specific piece of behavior — "run exactly this when tapped" — without
writing a whole new named class every single time. Java has three
progressively more convenient ways to do this, and understanding the
first fully is what makes the more convenient ones make sense instead of
looking like unexplained syntax.

**What you need to know first:** Lesson 06 (`extends`, overriding),
Lesson 13 (fields, `private`).

**Terms introduced in this lesson:**
- **Interface** — a type that declares method signatures with no
  bodies, describing *what* something can do without saying *how*; any
  class can declare it `implements` that interface by supplying real
  bodies for every method.
- **`implements`** — the keyword a class uses to declare it fulfills a
  specific interface's contract.
- **Anonymous class** — a class with no name, defined and instantiated
  in a single expression, used exactly once at the point it's written.
- **Lambda expression** — a further shorthand for implementing an
  interface that declares exactly one method, omitting the class
  declaration, the method name, and most of the ceremony an anonymous
  class still requires.
- **Functional interface** — an interface with exactly one abstract
  method, the specific kind of interface a lambda expression can
  implement.

---

## Concept Unit: Interfaces — a Contract With No Implementation

### The Problem

Lesson 06's inheritance let a subclass reuse and selectively replace a
parent class's real, working code. Sometimes what's needed is different:
a way to say "any class that promises to have a method with this exact
name and shape can be used here" — with no shared implementation at all,
just a shared shape. Java has a dedicated construct for exactly this: an
**interface**.

### Introduce the Concept in Isolation

```java
interface Greeter {
    String greet(String name);
}

class FormalGreeter implements Greeter {
    @Override
    public String greet(String name) {
        return "Good day, " + name + ".";
    }
}

class CasualGreeter implements Greeter {
    @Override
    public String greet(String name) {
        return "Hey " + name + "!";
    }
}

public class InterfaceDemo {
    public static void main(String[] args) {
        Greeter formal = new FormalGreeter();
        Greeter casual = new CasualGreeter();
        System.out.println(formal.greet("Alex"));
        System.out.println(casual.greet("Alex"));
    }
}
```

Compile and run:

```
javac InterfaceDemo.java
java InterfaceDemo
```

Real output:

```
Good day, Alex.
Hey Alex!
```

`Greeter` never says *how* a greeting is produced — only that anything
claiming to be a `Greeter` must supply a `greet(String)` method returning
a `String`. `FormalGreeter` and `CasualGreeter` share no code at all;
they only share the interface's shape, and both can be referred to
through a plain `Greeter`-typed variable, exactly the way Lesson 06's
`Animal`-typed variable could hold either an `Animal` or a `Dog`.

### The New Code — Adding a Third Implementation Inline

A third, one-off greeting style, needed exactly once, is a natural next
step:

```java
class ExcitedGreeter implements Greeter {
    @Override
    public String greet(String name) {
        return "AMAZING TO SEE YOU, " + name + "!!!";
    }
}
```

This works, but notice what it cost: an entire named class, in its own
declaration, for a greeting style this program only ever needs at one
single call site. The next unit removes exactly that ceremony.

### Discard the Throwaway Example

`Greeter`, `FormalGreeter`, `CasualGreeter`, `ExcitedGreeter`, and
`InterfaceDemo` are all deleted now — the concept survives, none of this
code enters the real project.

### CS Lens

An interface separating *what* from *how* is **abstraction** — one of
the foundational ideas of object-oriented design, alongside inheritance
and encapsulation (already met, Lessons 06 and 13 respectively).

Also recognized in: Java's own standard library (`Comparable`,
`Runnable`), C#'s `interface` keyword (same concept, same name), and any
plugin system where the host program defines a contract and lets
completely unrelated authors supply their own implementation of it.

### SE Lens

**Why not just use inheritance — a shared parent class — instead of an
interface, if the goal is "different classes, same method shape"?** The
alternative, a shared abstract parent class, would force
`FormalGreeter` and `CasualGreeter` into one specific inheritance
hierarchy, even though they share no actual code or state — only a
shape. An interface lets a class fulfill several unrelated contracts at
once (Java allows implementing multiple interfaces, unlike extending
multiple classes) and keeps the shared piece down to exactly what's
actually shared: the method signature, nothing else.

---

## Concept Unit: Anonymous Classes — Skipping the Name

### The Problem

`ExcitedGreeter` above is a real cost for a greeting style used exactly
once. Java lets you declare a class and create its one and only instance
in the same expression, with no name at all, right at the point it's
needed.

### Introduce the Concept in Isolation

```java
interface Greeter {
    String greet(String name);
}

public class AnonymousDemo {
    public static void main(String[] args) {
        Greeter excited = new Greeter() {
            @Override
            public String greet(String name) {
                return "AMAZING TO SEE YOU, " + name + "!!!";
            }
        };

        System.out.println(excited.greet("Alex"));
    }
}
```

Compile and run:

```
javac AnonymousDemo.java
java AnonymousDemo
```

Real output:

```
AMAZING TO SEE YOU, Alex!!!
```

This is called an **anonymous class**: `new Greeter() { ... }` creates a
brand-new, unnamed class that implements `Greeter`, and instantiates its
one and only object, in a single expression. There is no
`ExcitedGreeter.java`-equivalent class declaration anywhere — the entire
class exists only inside this one variable's initializer.

### Discard the Throwaway Example

Deleted now — the concept carries forward, this exact code does not.

### CS Lens

An anonymous class is still, fundamentally, **abstraction through an
interface** — the same concept as the unit above — with the ceremony of
a separate named declaration removed for the specific case where an
implementation is only ever needed once, at one call site.

---

## Concept Unit: Lambda Expressions — Skipping the Rest of the Ceremony

### The Problem

`Greeter` has exactly one method. Writing `new Greeter() { @Override
public String greet(String name) { ... } }` still repeats information
Java can work out on its own: which method is being implemented (there's
only one possible choice), and its parameter and return types (already
declared on the interface itself). A **functional interface** —
one with exactly one abstract method, like `Greeter` — qualifies for an
even shorter form.

### Introduce the Concept in Isolation

```java
interface Greeter {
    String greet(String name);
}

public class LambdaDemo {
    public static void main(String[] args) {
        Greeter excited = (name) -> "AMAZING TO SEE YOU, " + name + "!!!";

        System.out.println(excited.greet("Alex"));
    }
}
```

Compile and run:

```
javac LambdaDemo.java
java LambdaDemo
```

Real output:

```
AMAZING TO SEE YOU, Alex!!!
```

Identical behavior to the anonymous-class version above, with the
interface name, the method name, `@Override`, and the parameter's type
all gone — `(name) -> ...` is a **lambda expression**: the part before
`->` is the parameter list (its type, `String`, is inferred from
`Greeter.greet`'s own declared signature — Java doesn't need it
restated), and the part after `->` is the expression the method returns.
This is exactly the same object-creation event as the anonymous class
above — a real object implementing `Greeter` still gets created — with
the syntax reduced to only the parts that actually differ between one
`Greeter` and another.

### Discard the Throwaway Example

Deleted now.

### CS Lens

A lambda expression is still the exact same interface-implementation
concept from the first unit in this lesson, at its most compact syntax —
not a different mechanism, a shorter spelling of the same one. This
progression — named class, anonymous class, lambda — is a single idea
told three times, each version removing ceremony the previous version
still carried, without changing what actually happens at runtime: an
object implementing `Greeter` gets created either way.

Also recognized in: JavaScript's arrow functions (`(name) => ...`,
nearly identical syntax, same "shorthand for a single function" idea),
Python's `lambda` keyword, and C#'s own lambda syntax — this shorthand
exists in some form in almost every modern language, because "pass a
small piece of behavior as a value" is common enough to deserve
dedicated, minimal syntax.

### SE Lens

**Why does Java offer three ways to do the same thing instead of just
one?** Each form trades verbosity for applicability. A named class is
required the moment an implementation needs to be reused in multiple
places or needs its own fields carrying state across calls. An anonymous
class is right for a one-off implementation that still might need a
local field or more than one method. A lambda is right — and only
right — for a one-off implementation of an interface with exactly one
method and no need for its own state beyond what it already captures
from its surroundings. Reaching for the shortest form when it doesn't fit
(an interface with two methods, for instance) isn't a style violation —
it's a compiler error, since a lambda has no way to say *which* of two
methods it's implementing.

---

## Connect the Pieces

One trace across all three units: `Greeter` declared a one-method
contract. `FormalGreeter`/`CasualGreeter` fulfilled it with full, named,
reusable classes. `ExcitedGreeter`'s anonymous-class replacement fulfilled
the identical contract with no name, for a one-off use. That same
one-off case, expressed as a lambda, fulfilled it again with no class
syntax at all. All four objects — `FormalGreeter`, `CasualGreeter`, the
anonymous class, and the lambda's underlying object — satisfy the exact
same `Greeter` interface and can be used anywhere a `Greeter` is
expected.

## What Breaks Without This

Try to write a lambda for an interface with two methods instead of one —
add a second method, `String farewell(String name);`, to a scratch copy
of `Greeter`, and attempt `Greeter g = (name) -> "hi " + name;` against
the two-method version. Real error:

```
error: incompatible types: Greeter is not a functional interface
  multiple non-overriding abstract methods found in interface Greeter
```

This proves *why* the term **functional interface** specifically requires
exactly one abstract method — a lambda has no syntax for naming which
method it implements, so more than one makes the shorthand genuinely
ambiguous, not just stylistically discouraged.

## Exercises

1. Add a fourth greeting style using a named class, a fifth using an
   anonymous class, and a sixth using a lambda, in the same scratch file.
   Confirm all six work identically through a single `Greeter`-typed
   variable, reinforcing that the three forms are one concept, not three.
2. Give the anonymous-class version of `ExcitedGreeter` a second method
   the interface doesn't declare (e.g., an extra helper method inside the
   anonymous class body). Confirm it compiles — an anonymous class isn't
   restricted to *only* the interface's methods, unlike a lambda, which
   can express nothing beyond the single required method.

## Definition of Done

- [ ] You ran all three labs (`InterfaceDemo`, `AnonymousDemo`,
      `LambdaDemo`) and saw matching real output from three different
      syntaxes implementing the same interface.
- [ ] You triggered the real "not a functional interface" error yourself
      with a two-method interface.
- [ ] You can explain, in your own words, when a named class is still
      the right choice over a lambda, even though a lambda is shorter.
- [ ] Commit: not applicable — every example in this lesson is a
      throwaway lab; no project files changed.

Next: applying this directly — `View.OnClickListener`, the real
interface Android uses for every clickable widget, wired to both login
buttons using a lambda.
