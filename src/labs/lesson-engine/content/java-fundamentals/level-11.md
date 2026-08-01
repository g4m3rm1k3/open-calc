---
series: java-fundamentals
level: 11
title: Inheritance & Polymorphism
lang: java
---

# Inheritance & Polymorphism

Level 10's `InsufficientFundsException extends Exception` already used `extends` without stopping to explain it. This lesson does: **inheritance** lets one class build directly on another's fields and methods, and **polymorphism** — literally "many forms" — lets code written against the general, parent type automatically run the right, specific version of a method for whatever actual object it's holding.

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

`class Dog extends Animal` — `Dog` inherits every field and method `Animal` has (`name`, `speak()`, `describe()`) automatically, without rewriting any of them. The relationship is "is-a": every `Dog` genuinely is an `Animal` — a `Dog` reference can be assigned anywhere an `Animal` is expected.

`super(name);` — calls `Animal`'s own constructor to initialize the inherited `name` field. Must be the very first statement in a subclass constructor — `Dog`'s constructor can't touch `this.breed` or anything else until `Animal`'s own setup has run.

`@Override` — an annotation telling the compiler "this method is meant to replace a method the parent class already defines." Its real value: misspelling the method name (`speek()` instead of `speak()`) with `@Override` present is a compile error instead of silently creating an unrelated new method that never actually overrides anything — a real, common bug the annotation exists specifically to catch.

`void describe()` is inherited by both `Dog` and `Cat`, unchanged. When `d.describe()` runs, it calls `speak()` — but which `speak()`? `Dog`'s own, not `Animal`'s, even though `describe()` itself is defined in `Animal` and has no idea `Dog` even exists. This is **dynamic dispatch**: Java looks at `d`'s actual, real object type at the moment the call happens, not the type of whatever variable is holding the reference.

**CS lens:** The JVM decides which `speak()` to call by looking up `d`'s real runtime type in a **virtual method table** — a per-class lookup structure built once when `Dog` is loaded, mapping each overridable method name to the correct implementation for that specific class. This lookup is O(1), not a linear search through the whole inheritance chain — the mechanism that makes polymorphism practical to use everywhere without a real performance cost. The same idea, by name or not, drives Python's method resolution order, C++'s vtables, and C#'s own `virtual`/`override` (if you've taken this course's C# curriculum) — one shared solution to "run the right version of this method for the real object," found independently in nearly every object-oriented language.

## Polymorphism Through a Collection

```java
import java.util.ArrayList;
import java.util.List;

class Animal {
    String name;
    Animal(String name) { this.name = name; }
    String speak() { return name + " makes a sound"; }
}

class Dog extends Animal {
    Dog(String name) { super(name); }
    @Override String speak() { return name + " barks"; }
}

class Cat extends Animal {
    Cat(String name) { super(name); }
    @Override String speak() { return name + " meows"; }
}

public class Main {
    public static void main(String[] args) {
        List<Animal> animals = new ArrayList<>();
        animals.add(new Dog("Rex"));
        animals.add(new Cat("Whiskers"));
        animals.add(new Animal("Generic"));

        for (Animal a : animals) {
            System.out.println(a.speak());
        }
    }
}
```

```text
Rex barks
Whiskers meows
Generic makes a sound
```

`List<Animal> animals` — a single list, declared to hold `Animal`s, but actually holding a `Dog`, a `Cat`, and a plain `Animal` all together — legal precisely because of the "is-a" relationship `extends` establishes. `for (Animal a : animals)` iterates using only the general `Animal` type, yet each call to `a.speak()` still runs the correct, specific override for whatever real object `a` happens to be that iteration — the entire practical point of polymorphism: code written once, against the general type, that automatically does the right thing for every subtype without an `if`/`else` chain checking what kind of `Animal` it's looking at.

## Abstract Classes

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

`abstract class Shape` — a class that can never be instantiated directly. `new Shape();` is a real, enforced compile error:

```text
Main.java:7: error: Shape is abstract; cannot be instantiated
        Shape s = new Shape();
                  ^
1 error
```

`abstract double area();` — no body at all, just a signature. Every concrete (non-abstract) subclass, like `Square`, is required to provide one — the compiler checks this the same way it checks a checked exception's `throws` clause (Level 10).

`printArea()` — a normal, complete method, callable directly, that calls the still-unimplemented `area()` polymorphically — by the time `printArea()` actually runs on a real `Square` object, `area()` resolves to `Square`'s own implementation, the same dynamic dispatch mechanism as `Dog.speak()` above.

**SE lens:** `abstract class` is the right tool specifically when subclasses share real, concrete code worth inheriting (`printArea()` here, usable by *any* future `Shape` subclass without rewriting it) alongside things each subclass must supply itself. When there's no shared concrete code to offer at all — just a pure contract every implementer defines independently — Level 12's `interface` is the better fit instead.

## Challenge: employee_pay

Write an `abstract class Employee` with a `String name` field, a constructor taking it, and an `abstract double pay()` method. Then write two subclasses:
- `SalariedEmployee` — takes `name` and `double annualSalary`; `pay()` returns `annualSalary / 12` (monthly pay)
- `HourlyEmployee` — takes `name`, `double hourlyRate`, and `double hoursWorked`; `pay()` returns `hourlyRate * hoursWorked`

```challenge
abstract class Employee {
    // TODO
}

class SalariedEmployee extends Employee {
    // TODO
}

class HourlyEmployee extends Employee {
    // TODO
}
```

```test
Employee e1 = new SalariedEmployee("Alice", 120000);
Employee e2 = new HourlyEmployee("Bob", 25.0, 160);
assert Math.abs(e1.pay() - 10000.0) < 0.01
assert Math.abs(e2.pay() - 4000.0) < 0.01
assert e1.name.equals("Alice")
assert e2.name.equals("Bob")
```
