# Classes and Objects

The core unit of organization in Java: fields, constructors, methods,
`this`, and the three methods almost every real class ends up
overriding (`toString`, `equals`, `hashCode`). Every example on this
page was compiled and run for real.

---

## A Basic Class

```java
class Point {
    int x;
    int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
```

`x` and `y` are **fields** (also called instance variables) — every
`Point` object gets its own separate copy. The `Point(int x, int y)`
method with no return type and the same name as the class is a
**constructor** — it runs exactly once, automatically, when `new
Point(3, 4)` is called, responsible for setting the object up before
anyone else can use it.

---

## `this`

```java
Point(int x, int y) {
    this.x = x;
    this.y = y;
}
```

`this.x` explicitly means "the field on this object" — necessary here
because the constructor's *parameter* is also named `x`, shadowing the
field of the same name. Without `this.`, `x = x` would just assign the
parameter to itself and leave the field untouched.

`this(...)` — calling one constructor from another, to avoid
duplicating setup logic:

```java
Point() {
    this(0, 0);   // delegates to the two-argument constructor above
}
```

Real output:

```text
Point(3, 4) Point(0, 0)
```

(`Point(0, 0)` only prints correctly because `toString()`, below, has
already been overridden — otherwise it would print something far less
readable.)

`this` also refers to the current object inside any instance method:

```java
void move(int dx, int dy) {
    this.x += dx;
    this.y += dy;
}
```

Output after `p2.move(1, 1)`: `Point(1, 1)`

---

## Methods and Overloading

```java
double distanceFromOrigin() {
    return Math.sqrt(x * x + y * y);
}
```

Output: `distance=5.0` (for a `Point(3, 4)` — a real 3-4-5 triangle).

**Method overloading** — the same method name, different parameter
lists, resolved by the compiler based on what arguments you pass:

```java
void describe() {
    System.out.println("no-arg describe");
}

void describe(String label) {
    System.out.println(label + " describe");
}
```

```java
p1.describe();               // "no-arg describe"
p1.describe("Custom label"); // "Custom label describe"
```

This is different from method **overriding** (a subclass replacing a
parent's method — see
[04-inheritance-and-polymorphism.md](04-inheritance-and-polymorphism.md)):
overloading is about multiple methods with the *same name in the same
class*, distinguished by parameters; overriding is about one subclass
method *replacing* a parent's method of the identical signature.

---

## `toString()` — Controlling How an Object Prints

By default, printing an object (`System.out.println(p1)`) shows
something unhelpful like `Point@1b6d3586` (the class name plus a raw
memory-derived hash). Override `toString()` to fix that:

```java
@Override
public String toString() {
    return "Point(" + x + ", " + y + ")";
}
```

Output: `direct print: Point(3, 4)`

Any time an object appears next to a `String` (via `+`) or is passed to
`println`, Java calls `.toString()` on it automatically.

---

## `equals()` and `hashCode()` — What "Same" Means

By default, `==` and the default `.equals()` both compare **identity**
(are these literally the same object in memory) — two separately
constructed `Point(3, 4)`s are considered different unless you say
otherwise:

```java
@Override
public boolean equals(Object other) {
    if (this == other) return true;
    if (!(other instanceof Point)) return false;
    Point p = (Point) other;
    return this.x == p.x && this.y == p.y;
}

@Override
public int hashCode() {
    return Objects.hash(x, y);
}
```

```java
Point p1 = new Point(3, 4);
Point p3 = new Point(3, 4);
p1 == p3          // false — different objects
p1.equals(p3)     // true  — same content, now that equals is overridden
```

Real output:

```text
p1==p3=false
p1.equals(p3)=true
p1.hashCode()==p3.hashCode()=true
```

**The contract you must not break: if two objects are `.equals()`,
they MUST have the same `.hashCode()`.** `Objects.hash(x, y)` (from
`java.util.Objects`) is the standard, easy way to build a correct
`hashCode()` from a field list — always include *exactly* the same
fields `equals()` compares, no more, no fewer. Hash-based collections
(`HashSet`, `HashMap`) silently misbehave — failing to find an entry
that's genuinely present — if this contract is violated, and the bug
won't show up as an error; it just quietly returns wrong answers.

Always override both together, never just one.

---

## `instanceof` and Casting

```java
Object obj = p1;
if (obj instanceof Point) {
    Point casted = (Point) obj;
    System.out.println("casted back: " + casted);
}
```

`instanceof` checks an object's actual runtime type; `(Point) obj` is
an explicit **cast**, telling the compiler "trust me, treat this
`Object` as a `Point`" — only safe after an `instanceof` check confirms
it really is one (an incorrect cast throws a real
`ClassCastException` at runtime — see
[08-exceptions.md](08-exceptions.md)).

Modern **pattern-matching `instanceof`** (Java 16+) combines the check
and the cast into one step:

```java
if (obj instanceof Point pointPattern) {
    System.out.println("pattern-matched instanceof: " + pointPattern);
}
```

`pointPattern` is only in scope, and only actually assigned, inside
the `if` block where the check succeeded — no separate cast line
needed.

Real output for both forms:

```text
casted back: Point(3, 4)
pattern-matched instanceof: Point(3, 4)
```
