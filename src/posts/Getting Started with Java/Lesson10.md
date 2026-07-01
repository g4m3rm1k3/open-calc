# Interfaces: Contracts, Lambdas, and Modern Java Design

When Gosling removed multiple inheritance from Java, he needed a replacement for one of its most legitimate use cases: a class that genuinely *is* multiple things. A `FlyingFish` is both a `Fish` and a `Flyer`. An `AudioVideoStream` is both an `AudioStream` and a `VideoStream`. Without multiple inheritance, how do you express this?

The answer was **interfaces** — pure behavioral contracts. An interface specifies *what* methods a type must have, without specifying *how* they're implemented. A class can implement any number of interfaces. This gives you the compositional flexibility of multiple inheritance without the naming conflicts and implementation ambiguity that made C++ multiple inheritance treacherous.

Java 8 significantly evolved interfaces by adding **default methods** (implementations directly in the interface) and making them the foundation of the **lambda** and **Stream** APIs. Java's functional programming story is built entirely on interfaces.

## Defining and Implementing Interfaces

```java
public class Main {
    // Interface: a contract — implementing classes MUST provide these methods
    interface Drawable {
        void draw();              // abstract by default
        String getColor();
    }

    interface Resizable {
        void resize(double factor);
        double getArea();
    }

    // A class can implement multiple interfaces
    static class Circle implements Drawable, Resizable {
        private String color;
        private double radius;

        Circle(String color, double radius) {
            this.color = color;
            this.radius = radius;
        }

        @Override public void draw() {
            System.out.printf("Drawing %s circle, radius=%.2f%n", color, radius);
        }
        @Override public String getColor() { return color; }

        @Override public void resize(double factor) { radius *= factor; }
        @Override public double getArea() { return Math.PI * radius * radius; }
    }

    public static void main(String[] args) {
        Circle c = new Circle("blue", 5.0);

        // Can be used as either interface type
        Drawable d = c;
        Resizable r = c;

        d.draw();
        System.out.printf("Area: %.2f%n", r.getArea());
        r.resize(2.0);
        d.draw();
        System.out.printf("New area: %.2f%n", r.getArea());
    }
}
```

## Default Methods: Evolution Without Breaking Change

Before Java 8, you couldn't add a new method to an interface without breaking every existing class that implemented it. **Default methods** solve this — they provide an implementation that classes can override, but don't have to:

```java
import java.util.List;
import java.util.ArrayList;

public class Main {
    interface Collection<T> {
        void add(T item);
        int size();
        boolean isEmpty();

        // Default method: implemented in the interface
        // Implementing classes inherit this without writing any code
        default void addAll(List<T> items) {
            for (T item : items) add(item);
        }

        default void printContents() {
            System.out.println("Collection with " + size() + " items");
        }
    }

    static class SimpleList<T> implements Collection<T> {
        private List<T> items = new ArrayList<>();

        @Override public void add(T item) { items.add(item); }
        @Override public int size()       { return items.size(); }
        @Override public boolean isEmpty(){ return items.isEmpty(); }

        // Inherits addAll and printContents from the interface!
    }

    public static void main(String[] args) {
        var list = new SimpleList<String>();
        list.add("Hello");
        list.addAll(List.of("World", "from", "Java"));  // From default method
        list.printContents();  // From default method
    }
}
```

Default methods are how Java 8 added `forEach`, `stream()`, and `sort()` to the existing `Collection` hierarchy without breaking the millions of existing classes implementing those interfaces.

## Functional Interfaces and Lambdas

A **functional interface** has exactly one abstract method. Java 8 made this concept first-class by allowing lambdas to be assigned to functional interface variables:

```java
import java.util.function.*;
import java.util.List;
import java.util.Arrays;

public class Main {
    // A custom functional interface
    @FunctionalInterface
    interface Transformer<T, R> {
        R transform(T input);
    }

    public static void main(String[] args) {
        // Lambda: (parameters) -> expression
        Transformer<String, Integer> length = s -> s.length();
        Transformer<Integer, Boolean> isEven = n -> n % 2 == 0;
        Transformer<Double, Double> square = x -> x * x;

        System.out.println(length.transform("Hello"));  // 5
        System.out.println(isEven.transform(4));         // true
        System.out.println(square.transform(3.0));       // 9.0

        // Java's built-in functional interfaces (java.util.function)
        Predicate<String> isLong = s -> s.length() > 5;
        Function<String, String> shout = s -> s.toUpperCase() + "!";
        Consumer<String> print = System.out::println;  // Method reference
        Supplier<String> greeting = () -> "Hello, World!";

        List<String> words = Arrays.asList("Java", "is", "powerful", "and", "versatile");

        words.stream()
            .filter(isLong)     // Keep words longer than 5 chars
            .map(shout)         // Uppercase with !
            .forEach(print);    // Print each

        print.accept(greeting.get());
    }
}
```

The four core functional interfaces in `java.util.function`:
- `Predicate<T>` — takes a `T`, returns `boolean` (for filtering)
- `Function<T, R>` — takes a `T`, returns an `R` (for transforming)
- `Consumer<T>` — takes a `T`, returns nothing (for side effects)
- `Supplier<T>` — takes nothing, returns a `T` (for lazy creation)

## Method References: Lambdas Without the Boilerplate

When a lambda just calls an existing method, **method references** are more concise:

```java
import java.util.List;
import java.util.Arrays;
import java.util.function.*;

public class Main {
    static int doubleIt(int n) { return n * 2; }
    static boolean isPositive(int n) { return n > 0; }

    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(-3, -1, 0, 2, 4, 6, -2, 8);

        // Lambda style
        numbers.stream()
            .filter(n -> isPositive(n))
            .map(n -> doubleIt(n))
            .forEach(n -> System.out.print(n + " "));
        System.out.println();

        // Method reference style — same semantics, less noise
        numbers.stream()
            .filter(Main::isPositive)   // Static method reference
            .map(Main::doubleIt)
            .forEach(System.out::print);  // Instance method reference on PrintStream
        System.out.println();

        // Constructor reference
        Function<String, StringBuilder> makeSB = StringBuilder::new;
        var sb = makeSB.apply("Hello");
        System.out.println(sb.append(", World!"));
    }
}
```

## The Comparable and Comparator Interfaces

Two of Java's most practically important interfaces:

```java
import java.util.*;

public class Main {
    // Comparable: defines the natural ordering of a type
    static class Student implements Comparable<Student> {
        String name;
        double gpa;

        Student(String name, double gpa) { this.name = name; this.gpa = gpa; }

        @Override
        public int compareTo(Student other) {
            // Return negative if this < other, 0 if equal, positive if this > other
            return Double.compare(other.gpa, this.gpa);  // Descending by GPA
        }

        @Override
        public String toString() { return name + "(" + gpa + ")"; }
    }

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>(Arrays.asList(
            new Student("Alice", 3.9),
            new Student("Bob", 3.5),
            new Student("Charlie", 3.7),
            new Student("Diana", 3.9)
        ));

        // Natural ordering (uses compareTo)
        Collections.sort(students);
        System.out.println("By GPA desc: " + students);

        // Comparator: ad-hoc ordering without modifying the class
        students.sort(Comparator.comparing(s -> s.name));
        System.out.println("By name:     " + students);

        // Chained comparators
        students.sort(Comparator
            .comparingDouble((Student s) -> s.gpa).reversed()
            .thenComparing(s -> s.name));
        System.out.println("GPA desc, name asc: " + students);
    }
}
```

`Comparable` gives a type its default sort order. `Comparator` provides an external, pluggable ordering — useful when you need to sort the same type in different ways in different contexts.

## Sealed Interfaces (Java 17+): Closed Hierarchies

Java 17 introduced **sealed interfaces** — interfaces that restrict which classes can implement them:

```java
public class Main {
    // Only the listed classes can implement Shape
    sealed interface Shape permits Circle, Rectangle, Triangle {}

    record Circle(double radius) implements Shape {}
    record Rectangle(double width, double height) implements Shape {}
    record Triangle(double base, double height) implements Shape {}

    static double area(Shape s) {
        // Pattern matching switch — compiler verifies all cases are covered
        return switch (s) {
            case Circle c      -> Math.PI * c.radius() * c.radius();
            case Rectangle r   -> r.width() * r.height();
            case Triangle t    -> 0.5 * t.base() * t.height();
        };
        // No 'default' needed — the compiler knows Circle/Rectangle/Triangle are ALL possibilities
    }

    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(5),
            new Rectangle(4, 6),
            new Triangle(3, 8)
        };

        for (Shape s : shapes) {
            System.out.printf("%s -> area = %.2f%n", s, area(s));
        }
    }
}
```

Sealed interfaces bring **algebraic data types** to Java — the pattern common in Haskell, Rust, and Scala. Combined with pattern matching for switch and records, they enable a completely different style of Java programming: modeling domain data as closed hierarchies that the compiler can exhaustively check.

This is modern Java. The language that started as C++ with garbage collection has evolved into a system that blends object-oriented and functional programming in ways that are genuinely powerful and expressive.
