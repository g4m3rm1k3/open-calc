# Inheritance and Polymorphism

`extends`, `super`, overriding, abstract classes, `final`, and
polymorphism — treating different subclasses uniformly through their
shared parent type. Every example on this page was compiled and run for
real.

---

## `extends` and `super`

```java
abstract class Shape {
    String name;

    Shape(String name) {
        this.name = name;
    }

    abstract double area();

    void describe() {
        System.out.println(name + " has area " + area());
    }
}

class Circle extends Shape {
    double radius;

    Circle(double radius) {
        super("Circle");   // calls Shape's constructor
        this.radius = radius;
    }

    @Override
    double area() {
        return Math.PI * radius * radius;
    }
}
```

```java
Circle c = new Circle(2);
c.describe();
```

Real output:

```text
Circle has area 12.566370614359172
```

`extends` declares `Circle` as a subclass of `Shape`, inheriting its
fields and methods. `super("Circle")` calls the parent class's own
constructor — required as the *first* line of a subclass constructor
whenever the parent has no no-argument constructor of its own (as here,
since `Shape` only defines a one-argument constructor).

`super` also calls a parent's *method*, from inside an override, when
you want the original behavior *plus* something extra rather than
instead of it:

```java
class Square extends Shape {
    double side;

    Square(double side) {
        super("Square");
        this.side = side;
    }

    @Override
    double area() {
        return side * side;
    }

    @Override
    void describe() {
        System.out.print("[Square override] ");
        super.describe();   // still runs Shape's original describe() too
    }
}
```

Real output:

```text
[Square override] Square has area 16.0
```

---

## `abstract` Classes

`abstract double area();` has no body — it's a promise every concrete
(non-abstract) subclass must fulfill, checked by the compiler. An
abstract class can mix abstract methods (no shared implementation, like
`area()`) with regular ones (shared implementation, like `describe()`)
— this is the key difference from an interface (see
[05-interfaces-and-lambdas.md](05-interfaces-and-lambdas.md)), which
(before Java 8) couldn't provide any shared implementation at all.

An abstract class can never be instantiated directly:

```java
abstract class Shape2 {
    abstract double area();
}

Shape2 s = new Shape2();
```

Real output — fails to compile:

```text
error: Shape2 is abstract; cannot be instantiated
```

---

## `final` — Preventing Further Extension

```java
final class Triangle extends Shape {
    // ...
}
```

A `final` class cannot be subclassed at all:

```java
final class Triangle2 { }
class Pyramid extends Triangle2 { }
```

Real output — fails to compile:

```text
error: cannot inherit from final Triangle2
```

(`final` has two other, related meanings — on a variable, and on a
method — covered in
[09-static-final-and-nested-classes.md](09-static-final-and-nested-classes.md).)

---

## Polymorphism — One Type, Many Real Behaviors

```java
Shape[] shapes = { new Circle(1), new Square(2), new Triangle(3, 4) };
for (Shape shape : shapes) {
    shape.describe();
}
```

Real output:

```text
Circle has area 3.141592653589793
[Square override] Square has area 4.0
Triangle has area 6.0
```

This is the actual payoff of inheritance: `shapes` is declared as
`Shape[]`, but each `.describe()` call runs the *real*, specific
subclass's own version (`Square`'s override prints its extra prefix;
`Circle` and `Triangle` don't) — the calling code (the `for` loop) never
needs to know or check which concrete subclass it's actually holding. This
is called **dynamic dispatch** — the decision of which method body
actually runs is made at runtime, based on the object's real type, not
the variable's declared type.

Use `instanceof` (see
[02-classes-and-objects.md](02-classes-and-objects.md)) on the rare
occasion code genuinely needs to know a specific subclass, rather than
just treating everything as a `Shape`:

```java
if (shape instanceof Circle) {
    System.out.println(shape.name + " is specifically a Circle");
}
```

Real output: `Circle is specifically a Circle`

**Overriding vs. overloading, restated:** overriding (`@Override
double area()` here) is a *subclass replacing a parent's method* — same
name, same parameters, different behavior, resolved at runtime based on
the real object. Overloading (see
[02-classes-and-objects.md](02-classes-and-objects.md)) is *multiple
methods with the same name in the same class*, distinguished by
different parameter lists, resolved at compile time based on what
arguments you pass. They solve genuinely different problems despite the
similar names.
