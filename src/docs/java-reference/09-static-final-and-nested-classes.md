# `static`, `final`, and Nested Classes

Three related-but-distinct topics that Java newcomers usually meet
scattered and separately: what `static` actually means in different
positions, what `final` locks down, and the two different kinds of
class-inside-a-class. Every example on this page was compiled and run
for real.

---

## `static` — "Belongs to the Type, Not an Instance"

Every use of `static` is really the same underlying idea, applied in a
few different positions: **shared by the type itself, not tied to any
one particular object.**

### `static` methods

```java
class MathUtils {
    static int square(int x) {
        return x * x;
    }
}
```

```java
MathUtils.square(5)   // callable via the class name — no MathUtils object needed at all
```

Real output: `square(5)=25`

A `static` method can't use `this` and can't access instance (non-static)
fields — it has no particular object to work with, only whatever's
passed in as parameters.

### `static final` constants

```java
static final double PI_APPROX = 3.14159;
```

Real output: `PI_APPROX=3.14159`

`static` (one shared copy, not per-instance) plus `final` (never
reassigned after initialization, see below) together are Java's
idiomatic way to declare a true constant.

### `static` initializer blocks

```java
class Config {
    static String environment;

    static {
        System.out.println("static block running once, at class load time");
        environment = "production";
    }
}
```

Real output:

```text
static block running once, at class load time
environment=production
```

A `static { ... }` block runs exactly once, automatically, the first
time the class is actually loaded (roughly: the first time it's
referenced) — used for setup logic too involved for a single-line field
initializer.

### `static` fields — one copy, shared by every instance

```java
class Counter {
    static int totalCreated = 0;
    int id;

    Counter() {
        totalCreated++;
        id = totalCreated;
    }
}
```

```java
Counter a = new Counter();
Counter b = new Counter();
Counter c = new Counter();
```

Real output:

```text
a.id=1 b.id=2 c.id=3
Counter.totalCreated=3
```

`id` (no `static`) gets its own separate copy per instance — `1`, `2`,
`3`. `totalCreated` (`static`) has exactly **one** copy, shared by every
`Counter` ever created — which is why it correctly reads `3` after
three constructions.

---

## `final` — Three Related Meanings

**On a variable:** assign exactly once, never reassign.

```java
final int x = 5;
x = 10;
```

Real output — fails to compile:

```text
error: cannot assign a value to final variable x
```

**On a method:** cannot be overridden by any subclass.

```java
class Base {
    final void greet() {
        System.out.println("Base's greet, cannot be overridden");
    }
}

class Child extends Base {
    @Override
    void greet() { ... }
}
```

Real output — fails to compile:

```text
error: greet() in Child cannot override greet() in Base
  overridden method is final
```

**On a class:** cannot be subclassed at all — see
[04-inheritance-and-polymorphism.md](04-inheritance-and-polymorphism.md)
for the full example and error.

All three share the same underlying idea: **this cannot change/be
replaced after this point** — a variable's value, a method's behavior,
or a class's set of subtypes, respectively.

---

## Nested Classes: Inner vs. `static`

A class defined inside another class can be written two different
ways, with a real behavioral difference:

```java
class Outer {
    private int secret = 42;

    class Inner {
        void reveal() {
            System.out.println("Inner can see Outer's secret: " + secret);
        }
    }

    static class StaticNested {
        void reveal() {
            System.out.println("StaticNested has no access to any Outer instance's fields");
        }
    }
}
```

```java
Outer outer = new Outer();

Outer.Inner inner = outer.new Inner();
inner.reveal();

Outer.StaticNested nested = new Outer.StaticNested();
nested.reveal();
```

Real output:

```text
Inner can see Outer's secret: 42
StaticNested has no access to any Outer instance's fields
```

Notice `outer.new Inner()` — genuinely unusual syntax, and required: a
non-static (`Inner`) nested class silently carries a hidden reference
to *the specific `Outer` instance that created it* — that's how
`reveal()` reaches `secret` with no parameter passed at all. Try
skipping the outer instance:

```java
Outer.Inner inner = new Outer.Inner();
```

Real output — fails to compile:

```text
error: an enclosing instance that contains Outer.Inner is required
```

`StaticNested`, by contrast, carries no hidden reference at all — it
can be created with a plain `new`, and genuinely has no way to reach
any particular `Outer`'s fields, even if it wanted to.

**When to use which:** a `static` nested class when the nested class's
job has nothing to do with any specific enclosing instance (common in
real code — a `Builder` helper class, a `ViewHolder`-style row cache).
A non-static inner class only when it genuinely needs to reach back
into its specific enclosing instance's state.

---

## Anonymous and Local Classes

An **anonymous class** — a one-off implementation of an interface or
class, with no name, defined and instantiated in a single expression:

```java
interface Greeting {
    void greet(String name);
}

Greeting anon = new Greeting() {
    @Override
    public void greet(String name) {
        System.out.println("Anonymous class says hi to " + name);
    }
};
anon.greet("Sam");
```

Real output: `Anonymous class says hi to Sam`

This is exactly what a lambda expression (see
[05-interfaces-and-lambdas.md](05-interfaces-and-lambdas.md)) is
shorthand for, when the target is a functional interface (exactly one
abstract method) — `Greeting anon = name -> System.out.println(...)`
would do the same thing here, more concisely.

A **local class** — a full, named class defined *inside a method body*,
usable only within that method:

```java
void someMethod() {
    class LocalMultiplier {
        int factor;
        LocalMultiplier(int factor) { this.factor = factor; }
        int apply(int x) { return x * factor; }
    }
    LocalMultiplier triple = new LocalMultiplier(3);
    triple.apply(7);
}
```

Real output: `triple.apply(7)=21`

Rarely needed in practice (a private nested class, or a lambda, usually
serves the same purpose more simply) but valid, real Java syntax you
may still encounter reading other people's code.
