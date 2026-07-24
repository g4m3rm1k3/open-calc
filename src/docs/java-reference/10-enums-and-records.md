# Enums and Records

`enum` for a fixed set of named constants, and `record` (Java 16+) for
a plain data-holder type without the equals/hashCode/toString
boilerplate. Every example on this page was compiled and run for real.

---

## Basic `enum`

```java
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}
```

```java
Day today = Day.WEDNESDAY;
today.ordinal();       // 2 — zero-based position in declaration order
Day.values();           // an array of every constant, in declaration order
```

Real output:

```text
WEDNESDAY
ordinal=2
all values: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
```

An `enum` is a real class under the hood — each constant (`MONDAY`,
`WEDNESDAY`, ...) is actually a singleton instance of the `Day` type,
not just an `int` given a name (unlike, say, C's enums) — this is why
`today.ordinal()` and `Day.values()` are real method calls, not magic
syntax.

---

## `switch` on an `enum`

```java
switch (today) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> System.out.println("Weekday");
    case SATURDAY, SUNDAY -> System.out.println("Weekend");
}
```

Real output: `Weekday`

Note the `case` labels use the bare constant name (`MONDAY`, not
`Day.MONDAY`) — the compiler already knows the type being switched on.

---

## `enum` with Fields and a Constructor

```java
enum Planet {
    MERCURY(3.3e23, 2.4e6),
    EARTH(5.9e24, 6.4e6);

    final double mass;
    final double radius;

    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    double surfaceGravity() {
        final double G = 6.67e-11;
        return G * mass / (radius * radius);
    }
}
```

```java
Planet.EARTH.surfaceGravity();
Planet.MERCURY.surfaceGravity();
```

Real output:

```text
Earth gravity=9.607666015625
Mercury gravity=3.8213541666666666
```

Each constant's parenthesized values (`MERCURY(3.3e23, 2.4e6)`) call
the enum's own constructor, exactly like a regular class constructor —
each constant genuinely carries its own field values, computed methods
work per-constant.

---

## `enum` with a Different Method Body Per Constant

```java
enum Operation {
    ADD {
        @Override
        int apply(int a, int b) { return a + b; }
    },
    MULTIPLY {
        @Override
        int apply(int a, int b) { return a * b; }
    };

    abstract int apply(int a, int b);
}
```

```java
Operation.ADD.apply(3, 4);       // 7
Operation.MULTIPLY.apply(3, 4);  // 12
```

Real output:

```text
ADD.apply(3,4)=7
MULTIPLY.apply(3,4)=12
```

An `abstract` method on the enum itself, given a real, different
implementation per constant — a real, if less commonly known, use of
polymorphism (see
[04-inheritance-and-polymorphism.md](04-inheritance-and-polymorphism.md))
directly on an enum's own constants, avoiding a big `switch` statement
elsewhere in the code every time this behavior is needed.

---

## `record` — A Plain Data Holder, No Boilerplate

```java
record Point(int x, int y) { }
```

That single line automatically generates: a constructor taking `x` and
`y`, `private final` fields for both, accessor methods `x()`/`y()`
(note: not `getX()`), and correct `equals()`, `hashCode()`, and
`toString()` — all the boilerplate [02-classes-and-objects.md](02-classes-and-objects.md)
covers writing by hand for a regular class.

```java
Point p1 = new Point(3, 4);
Point p2 = new Point(3, 4);

p1.equals(p2)   // true  — content compared, auto-generated correctly
p1 == p2         // false — still two separate objects
p1.x()           // 3
p1.toString()    // "Point[x=3, y=4]" — auto-generated, readable by default
```

Real output:

```text
Point[x=3, y=4]
p1.equals(p2)=true
p1==p2=false
p1.x()=3 p1.y()=4
```

Every field in a `record` is implicitly `final` — a `record`'s fields
can never be reassigned after construction, matching the design intent
of a plain **immutable value** rather than an object with changing
state over its lifetime.

### The Compact Constructor — Validating Without Boilerplate

```java
record Point(int x, int y) {
    Point {   // no parameter list repeated — a "compact" constructor
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Coordinates must be non-negative");
        }
    }

    double distanceFromOrigin() {
        return Math.sqrt(x * x + y * y);
    }
}
```

```java
new Point(-1, 5);
```

Real output:

```text
compact constructor rejected: Coordinates must be non-negative
```

The compact constructor (`Point { ... }`, no parameter list) runs
*before* the fields are actually assigned — validate or normalize the
incoming values here, and the normal field assignment still happens
automatically afterward, unless you throw first, as above. A `record`
can also have regular methods (`distanceFromOrigin()` here) exactly
like any other class.

**When to use a `record` vs. a regular class:** a `record` when the
type's whole job is holding a fixed set of values together (like this
project's `Position`, `LevelConfig`, or a DTO from a JSON API) — a
regular class when the type has real, changing internal state over its
lifetime (a `BankAccount`, a `Snake`'s growing body) that shouldn't be
freely swapped out for "a new one with different values," the way
`record`'s implicit immutability assumes.
