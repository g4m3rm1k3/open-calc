---
series: java-fundamentals
level: 2
title: Inheritance & Interfaces
lang: java
---

# Inheritance & Interfaces

Inheritance lets a class extend another class, inheriting its fields and methods. An interface defines a contract — a set of methods a class promises to implement. Together they are the two core tools of object-oriented design in Java. Use inheritance to share concrete behaviour; use interfaces to define shared capability across unrelated classes.

## Inheritance with extends

```java
class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    String speak() {
        return name + " makes a sound";
    }

    void describe() {
        System.out.println(speak());
    }
}

class Dog extends Animal {
    String breed;

    Dog(String name, String breed) {
        super(name);
        this.breed = breed;
    }

    @Override
    String speak() {
        return name + " barks";
    }
}

class Cat extends Animal {
    Cat(String name) { super(name); }

    @Override
    String speak() { return name + " meows"; }
}

public class Main {
    public static void main(String[] args) {
        Animal a = new Animal("Generic");
        Dog d = new Dog("Rex", "Labrador");
        Cat c = new Cat("Whiskers");

        a.describe();
        d.describe();
        c.describe();
    }
}
```

```text
Generic makes a sound
Rex barks
Whiskers meows
```

`class Dog extends Animal` — `Dog` inherits all fields and methods of `Animal`. The relationship is "is-a": every `Dog` is an `Animal`.

`super(name)` — calls the parent class constructor. Must be the first statement in the subclass constructor.

`@Override` — an annotation that tells the compiler "this method is meant to override a parent method." If you misspell the method name, the compiler reports an error instead of silently creating a new method.

`void describe()` is inherited by `Dog` and `Cat`. When `d.describe()` calls `speak()`, Java dispatches to `Dog.speak()` at runtime — this is **dynamic dispatch** (also called virtual dispatch).

**CS lens:** When `d.describe()` calls `speak()`, the JVM does not call `Animal.speak()` even though `describe` is defined in `Animal`. It looks up the actual type of the object (`Dog`) and finds `Dog.speak()` in the virtual method table. This O(1) lookup is the mechanism behind polymorphism.

## Interfaces

```java
interface Drawable {
    void draw();
    default String label() { return "Shape"; }
}

interface Resizable {
    void resize(double factor);
}

class Circle implements Drawable, Resizable {
    private double radius;

    Circle(double radius) { this.radius = radius; }

    @Override
    public void draw() {
        System.out.println("Circle with radius " + radius);
    }

    @Override
    public void resize(double factor) {
        radius *= factor;
    }
}

public class Main {
    static void render(Drawable d) {
        System.out.print(d.label() + ": ");
        d.draw();
    }

    public static void main(String[] args) {
        Circle c = new Circle(5.0);
        render(c);
        c.resize(2.0);
        render(c);
    }
}
```

```text
Shape: Circle with radius 5.0
Shape: Circle with radius 10.0
```

`interface Drawable { void draw(); }` — an interface. Methods have no body (unless `default`). All methods are implicitly `public abstract`.

`default String label()` — a **default method**: provides a body so implementing classes don't have to override it. Introduced in Java 8.

`class Circle implements Drawable, Resizable` — a class can implement multiple interfaces (unlike `extends`, which is single-parent only). The compiler checks that all interface methods are implemented.

`static void render(Drawable d)` — accepts any object that implements `Drawable`. The specific type does not matter at the call site.

## Abstract Classes

An abstract class is between a regular class and an interface — it can have both concrete methods and abstract (unimplemented) ones:

```java
abstract class Shape {
    abstract double area();

    void printArea() {
        System.out.printf("Area: %.2f%n", area());
    }
}

class Square extends Shape {
    private double side;
    Square(double side) { this.side = side; }

    @Override
    double area() { return side * side; }
}

public class Main {
    public static void main(String[] args) {
        Shape s = new Square(4.0);
        s.printArea();
    }
}
```

```text
Area: 16.00
```

`abstract class Shape` — cannot be instantiated directly. `new Shape()` is a compile error.
`abstract double area()` — must be implemented by every concrete subclass.
`printArea()` — a concrete method that can call the abstract `area()` polymorphically.

**SE lens:** Choose abstract class when subclasses share concrete code. Choose interface when you want to define capability that any unrelated class can implement (e.g., `Comparable`, `Iterable`).

## Challenge: payment_system

Define an interface `Payment` with a single method `void process(double amount)`. Write two classes that implement it:
- `CreditCard` with a `String cardNumber` field — `process` prints `"Charged $<amount> to card ending in <last4digits>"`
- `PayPal` with a `String email` field — `process` prints `"Sent $<amount> to <email> via PayPal"`

In `main`, create one of each and call `process(99.99)` on both.

```challenge
interface Payment {
    // TODO
}

class CreditCard implements Payment {
    // TODO
}

class PayPal implements Payment {
    // TODO
}

public class Main {
    public static void main(String[] args) {
        Payment card = new CreditCard("1234567890123456");
        Payment paypal = new PayPal("user@example.com");
        card.process(99.99);
        paypal.process(99.99);
    }
}
```

```test
// Expected output:
// Charged $99.99 to card ending in 3456
// Sent $99.99 to user@example.com via PayPal
```
