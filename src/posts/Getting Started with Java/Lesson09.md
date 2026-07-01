# Inheritance, Polymorphism, and the Power of `extends`

In 1967, Ole-Johan Dahl and Kristen Nygaard published Simula 67 — the language that introduced both classes and **inheritance**. Their insight: if you have a class `Vehicle`, a `Car` is a more specific kind of vehicle. It should inherit all of Vehicle's behavior and be allowed anywhere a Vehicle is expected. This relationship, formalized as the **Liskov Substitution Principle** in 1987, is the mathematical backbone of object-oriented polymorphism.

Java's inheritance system is deliberately simpler than C++'s. Java has **single inheritance** only — a class can extend exactly one other class. This was a conscious decision by Gosling to avoid the "diamond problem" that plagued C++ multiple inheritance. Instead, Java uses **interfaces** for the horizontal composition that C++ achieves through multiple inheritance.

## Extending a Class

```java
public class Main {
    // Base class
    static class Animal {
        protected String name;
        protected int age;

        Animal(String name, int age) {
            this.name = name;
            this.age  = age;
        }

        public void eat() {
            System.out.println(name + " is eating");
        }

        public String describe() {
            return String.format("%s, age %d", name, age);
        }

        @Override
        public String toString() {
            return getClass().getSimpleName() + "[" + describe() + "]";
        }
    }

    // Subclass: inherits ALL non-private members of Animal
    static class Dog extends Animal {
        private String breed;

        Dog(String name, int age, String breed) {
            super(name, age);  // Call parent constructor FIRST
            this.breed = breed;
        }

        public void bark() {
            System.out.println(name + " says: Woof!");
        }

        @Override
        public String describe() {
            return super.describe() + ", breed=" + breed;
        }
    }

    static class Cat extends Animal {
        private boolean indoor;

        Cat(String name, int age, boolean indoor) {
            super(name, age);
            this.indoor = indoor;
        }

        @Override
        public String describe() {
            return super.describe() + ", indoor=" + indoor;
        }
    }

    public static void main(String[] args) {
        var dog = new Dog("Rex", 3, "Labrador");
        var cat = new Cat("Whiskers", 5, true);

        dog.eat();   // Inherited from Animal
        dog.bark();  // Dog-specific

        cat.eat();   // Inherited from Animal

        System.out.println(dog);  // Dog[Rex, age 3, breed=Labrador]
        System.out.println(cat);  // Cat[Whiskers, age 5, indoor=true]
    }
}
```

`super(name, age)` calls the parent class constructor. Java requires this to be the first statement in the subclass constructor. If you don't write it, Java automatically inserts `super()` — a call to the parent's no-argument constructor. If the parent doesn't have one, you get a compile error.

## Polymorphism: One Interface, Many Implementations

The real power of inheritance is **polymorphism** — the ability to treat objects of different types uniformly through a common parent type:

```java
import java.util.ArrayList;

public class Main {
    abstract static class Shape {
        protected String color;

        Shape(String color) { this.color = color; }

        abstract double area();       // No implementation — subclasses MUST provide one
        abstract double perimeter();

        void printInfo() {
            System.out.printf("%s %s: area=%.2f, perimeter=%.2f%n",
                color, getClass().getSimpleName(), area(), perimeter());
        }
    }

    static class Circle extends Shape {
        private double radius;
        Circle(String color, double radius) { super(color); this.radius = radius; }

        @Override public double area()      { return Math.PI * radius * radius; }
        @Override public double perimeter() { return 2 * Math.PI * radius; }
    }

    static class Rectangle extends Shape {
        private double w, h;
        Rectangle(String color, double w, double h) { super(color); this.w=w; this.h=h; }

        @Override public double area()      { return w * h; }
        @Override public double perimeter() { return 2 * (w + h); }
    }

    static class Triangle extends Shape {
        private double a, b, c;
        Triangle(String color, double a, double b, double c) {
            super(color); this.a=a; this.b=b; this.c=c;
        }

        @Override public double perimeter() { return a + b + c; }
        @Override public double area() {
            double s = perimeter() / 2;
            return Math.sqrt(s * (s-a) * (s-b) * (s-c));  // Heron's formula
        }
    }

    public static void main(String[] args) {
        // A list of Shapes — could be any subclass
        var shapes = new ArrayList<Shape>();
        shapes.add(new Circle("red", 5));
        shapes.add(new Rectangle("blue", 4, 6));
        shapes.add(new Triangle("green", 3, 4, 5));
        shapes.add(new Circle("yellow", 2.5));

        // Same code works for all shapes — runtime dispatch
        for (Shape shape : shapes) {
            shape.printInfo();  // Calls the correct area() and perimeter() at runtime
        }

        // Total area of all shapes
        double totalArea = shapes.stream()
            .mapToDouble(Shape::area)
            .sum();
        System.out.printf("Total area: %.2f%n", totalArea);
    }
}
```

The `shape.printInfo()` call in the loop doesn't know at compile time whether `shape` is a `Circle`, `Rectangle`, or `Triangle`. The JVM decides which `area()` to call at **runtime** based on the actual type of the object — this is **dynamic dispatch**, implemented via the virtual method table (vtable). Every Java method is effectively virtual by default (unlike C++, where you must explicitly declare `virtual`).

## Abstract Classes

An `abstract class` cannot be instantiated directly — it's a template for subclasses:

```java
public class Main {
    abstract static class Vehicle {
        protected String make;
        protected int year;

        Vehicle(String make, int year) {
            this.make = make;
            this.year = year;
        }

        // Concrete method — has an implementation, inherited by subclasses
        public int age() {
            return 2024 - year;
        }

        // Abstract method — subclasses MUST override
        public abstract String fuelType();
        public abstract int range();  // kilometers on full tank/charge

        @Override
        public String toString() {
            return String.format("%s %s (%s, range: %dkm, age: %d years)",
                year, make, fuelType(), range(), age());
        }
    }

    static class GasCar extends Vehicle {
        GasCar(String make, int year) { super(make, year); }
        @Override public String fuelType() { return "Gasoline"; }
        @Override public int range()       { return 600; }
    }

    static class ElectricCar extends Vehicle {
        ElectricCar(String make, int year) { super(make, year); }
        @Override public String fuelType() { return "Electric"; }
        @Override public int range()       { return 400; }
    }

    static class Hybrid extends Vehicle {
        Hybrid(String make, int year) { super(make, year); }
        @Override public String fuelType() { return "Hybrid"; }
        @Override public int range()       { return 900; }
    }

    public static void main(String[] args) {
        Vehicle[] fleet = {
            new GasCar("Toyota Camry", 2020),
            new ElectricCar("Tesla Model 3", 2022),
            new Hybrid("Toyota Prius", 2021)
        };

        for (Vehicle v : fleet) {
            System.out.println(v);
        }

        // Can't instantiate abstract class directly:
        // new Vehicle("X", 2020);  // Compile error
    }
}
```

## The `Object` Class: Java's Universal Base

Every Java class implicitly extends `Object`. This means every object — your custom classes, arrays, even wrapper types — inherits a small set of methods from `Object`:

- `toString()` — text representation (default: class name + hash)
- `equals(Object o)` — value equality (default: reference equality)
- `hashCode()` — hash code for collections (default: based on memory address)
- `getClass()` — returns the runtime type as a `Class` object

```java
public class Main {
    public static void main(String[] args) {
        Object obj = "Hello";

        // getClass() returns runtime type
        System.out.println(obj.getClass().getName());         // java.lang.String
        System.out.println(obj.getClass().getSimpleName());   // String

        // instanceof checks type hierarchy
        System.out.println(obj instanceof String);    // true
        System.out.println(obj instanceof Object);    // true (everything is an Object)
        System.out.println(obj instanceof Integer);   // false

        // All objects have toString()
        Object[] things = {42, "hello", 3.14, true, new int[]{1,2,3}};
        for (Object thing : things) {
            System.out.println(thing.getClass().getSimpleName() + ": " + thing);
        }
    }
}
```

## Method Hiding vs Overriding

`@Override` is a critical annotation. It tells the compiler "I intend to override a parent method." Without it, a typo in the method signature silently creates a *new* method instead of overriding:

```java
public class Main {
    static class Base {
        public void greet() { System.out.println("Hello from Base"); }
    }

    static class Child extends Base {
        @Override
        public void greet() { System.out.println("Hello from Child"); }
        // Without @Override, a typo like 'greet(int x)' would silently add a new method
    }

    public static void main(String[] args) {
        Base obj = new Child();  // Reference type is Base, actual type is Child
        obj.greet();  // Prints "Hello from Child" — runtime dispatch
    }
}
```

Always use `@Override` when you intend to override. It costs nothing and catches whole classes of bugs at compile time.
