# Lesson 23: Abstract Classes

**What you will build:** Nothing app-related yet — a disposable example
proving what `abstract` actually means on a class, and how it differs
from both an ordinary class and Lesson 14's interface, before meeting a
real framework class declared this way. The transferable problem: this
series has already used the *behavior* `abstract` produces indirectly
(Lesson 06's `AppCompatActivity` has methods you're required to override)
without ever meeting the keyword itself or seeing precisely where it
sits between "ordinary class" and "interface."

**What you need to know first:** Lesson 06 (`extends`, overriding,
`super`), Lesson 14 (interfaces).

**Terms introduced in this lesson:**
- **Abstract class** — a class that can declare methods with no body at
  all (`abstract` methods), cannot be instantiated directly, and exists
  specifically to be subclassed by something that fills those methods in.

**Objects and methods used:** `abstract` classes are this lesson's own
subject, given full treatment above.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`System.out.println(...)`**
  - *What it is:* Java's `static` print-to-standard-output method.
  - *Implementation:* given full treatment in Lesson 01.
  - *Its use:* prints `square.describe()`'s result, combining a real
    method body with an abstract one this lesson's subject fills in.
- **`extends`**
  - *What it is:* a class inheriting another's fields and methods.
  - *Implementation:* given full treatment in Lesson 06.
  - *Its use:* `Square extends Shape`, the relationship an abstract
    class still requires even though some of its methods have no body.
- **`super`**
  - *What it is:* calling the parent's own version of an overridden
    method or constructor.
  - *Implementation:* given full treatment in Lesson 06.
  - *Its use:* `Square`'s constructor calls `super("Square")`, setting
    `Shape`'s own `label` field.
- **`@Override`**
  - *What it is:* the compiler-checked override annotation.
  - *Implementation:* given full treatment in Lesson 06.
  - *Its use:* marks `Square.area()` as fulfilling `Shape`'s abstract
    method, the requirement this lesson's own subject imposes.

---

## Concept Unit: Not Quite a Class, Not an Interface

### The Problem

An interface (Lesson 14) can declare method signatures with literally no
implementation at all, ever, and cannot hold constructors or per-object
field state. An ordinary class must supply a real body for every method
it declares. Some real designs need something in between: a class that
mixes real, working methods with some methods deliberately left
unfinished for a subclass to complete — while still keeping constructors
and fields, which an interface can never have.

### Introduce the Concept in Isolation

```java
abstract class Shape {
    private final String label;

    Shape(String label) {
        this.label = label;
    }

    abstract double area();

    String describe() {
        return label + " has area " + area();
    }
}

class Square extends Shape {
    private final double side;

    Square(double side) {
        super("Square");
        this.side = side;
    }

    @Override
    double area() {
        return side * side;
    }
}

public class AbstractDemo {
    public static void main(String[] args) {
        Square square = new Square(4);
        System.out.println(square.describe());
    }
}
```

Compile and run:

```
javac AbstractDemo.java
java AbstractDemo
```

Real output:

```
Square has area 16.0
```

### Mechanical Walkthrough

`abstract class Shape` mixes a real, fully-working method
(`describe()`, with a real body, inherited by `Square` completely
unchanged — the exact Template Method shape from Lesson 06) with an
`abstract` method (`area()`, no body at all — just a signature) that
only a subclass can complete. `Shape` also has a real constructor and a
real field (`label`), both of which an interface could never have —
proving `abstract class` is genuinely distinct from an interface, not
just a stricter version of one. Try, in a scratch copy, `new
Shape("test")` directly — real error:

```
error: Shape is abstract; cannot be instantiated
```

confirming the other half of the definition: an abstract class, even
with some of its methods fully implemented, can never be built directly —
only a concrete (non-abstract) subclass, with every abstract method
filled in, can ever be instantiated with `new`.

### Discard the Throwaway Example

`Shape`, `Square`, and `AbstractDemo` are deleted now. A real framework
class this project extends next is the same shape: a real abstract
class, mixing methods it can't implement (ones a subclass fills in) with
behavior it already handles completely on its own.

### CS Lens

An abstract class sits deliberately between an ordinary class (fully
implemented) and an interface (never implemented): it can carry real
state and real behavior while still declaring some methods a subclass is
*required* to complete before it can be instantiated at all — the same
Template Method idea from Lesson 06, now expressed as a rule the compiler
itself enforces (an unfilled abstract method makes the whole subclass
uninstantiable), not just a convention.

Also recognized in: C++ and C#'s own abstract class support (same
keyword-driven rule), and any framework base class that provides real
shared machinery (event dispatch, lifecycle management) alongside a
handful of "you fill this in" extension points.

### SE Lens

**Why would a framework author choose an abstract class over an
interface, given that both can declare methods a subclass must
implement?** An interface can never share real, working code between
implementers — every implementing class rewrites its own version of
anything an interface only declares. An abstract class lets a framework
author write shared, real behavior exactly once (like `Shape`'s
`describe()`) while still requiring subclasses to supply the specific
pieces only they can know (like `area()`), avoiding both "reimplement
everything" and "no way to share real code at all."

---

## Connect the Pieces

One trace: `Shape.describe()` ran a real, shared method body, unchanged,
on a `Square` object. `Shape.area()` had no body at all until `Square`
supplied one — and attempting to build a bare `Shape` directly was
rejected by the compiler, proving an abstract class's two defining rules
together: mix real and unfinished methods, but never instantiate
directly.

## What Breaks Without This

Already shown above: `new Shape("test")` produces a real, immediate
compiler error naming the class abstract. Add a second subclass,
`Circle`, that forgets to override `area()` at all, and attempt to
instantiate it directly — real error naming `Circle` itself as still
abstract, since an unfilled abstract method makes the *subclass*
uninstantiable too, not just the original parent.

## Exercises

1. Add a `Circle extends Shape` class, correctly overriding `area()`
   this time, and confirm `describe()` — never rewritten — correctly
   reports a different area for a different shape, reinforcing Lesson
   06's dynamic dispatch on top of this lesson's own concept.
2. Add a second abstract method to `Shape`, `abstract String
   shapeType();`, and confirm `Square` now fails to compile until it
   supplies both `area()` and `shapeType()` — proving a subclass owes
   *every* abstract method, not just one.

## Definition of Done

- [ ] You ran the lab and saw a class mixing real and unfinished methods
      work correctly through a subclass.
- [ ] You triggered the real "is abstract; cannot be instantiated" error
      yourself.
- [ ] You can state, precisely, one thing an abstract class can do that
      an interface cannot.
- [ ] Commit: not applicable — the example is a throwaway lab.

Next: the real framework class this project extends, declared exactly
this way — mixing real recycling machinery with methods only your own
subclass can fill in.
