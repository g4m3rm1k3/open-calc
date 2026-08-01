---
series: java-fundamentals
level: 12
title: Interfaces & Generics
lang: java
---

# Interfaces & Generics

Level 11's `abstract class` let subclasses share real, inherited code alongside a required contract. An **interface** is the other tool for defining a contract — a pure "must implement these methods" promise, with no shared implementation and no `extends`-style single-parent limit. This lesson also introduces **generics**: writing a class or method once, in a way that works correctly for any type, without duplicating code per type.

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

`interface Drawable { void draw(); }` — declares a method with no body at all; every method in an interface is implicitly `public abstract` unless marked `default`. Unlike `abstract class Employee` (Level 11), an interface can never hold instance fields or a constructor — it's a pure contract, nothing more.

`default String label() { return "Shape"; }` — a **default method**: unlike `draw()`, this one *does* have a body, so implementing classes get it for free and aren't required to override it. Introduced in Java 8, specifically so new methods could be added to an existing interface without breaking every class that already implemented it.

`class Circle implements Drawable, Resizable` — a class can implement *multiple* interfaces, comma-separated — a real, structural difference from `extends`, which only ever allows one direct parent class. The compiler checks that `Circle` provides a real implementation for every non-`default` method across both interfaces.

`static void render(Drawable d)` — accepts *any* object implementing `Drawable`, regardless of its real class. The same polymorphism Level 11 built for class hierarchies applies here too — `render` never needs to know it's actually holding a `Circle`.

**SE lens:** Choose `abstract class` when subclasses genuinely share concrete, reusable code (`printArea()` in Level 11). Choose `interface` when the goal is defining a *capability* that entirely unrelated classes — sharing no common parent, no common concrete code — can each implement in their own way. Java's own standard library leans on this constantly: `Comparable`, `Iterable`, and `Runnable` are all interfaces precisely because wildly different classes (a `String`, a custom `Employee`, a network connection) all need to be able to implement them without being forced into a shared, artificial parent class first.

## Writing a Generic Class

```java
class Box<T> {
    private T contents;

    void set(T value) { contents = value; }
    T get() { return contents; }
}

public class Main {
    public static void main(String[] args) {
        Box<String> stringBox = new Box<>();
        stringBox.set("hello");
        System.out.println(stringBox.get());

        Box<Integer> intBox = new Box<>();
        intBox.set(42);
        System.out.println(intBox.get());
    }
}
```

```text
hello
42
```

`class Box<T>` — `<T>` declares a **type parameter**: `Box` doesn't commit to any specific type for its contents; `T` is a placeholder, filled in by whoever actually uses `Box`. `private T contents;` — the field's real type is whatever `T` ends up being for a given `Box`.

`Box<String> stringBox = new Box<>();` — creates a `Box` where `T` is `String` for this specific instance; every `set`/`get` on `stringBox` is now type-checked against `String` specifically. `Box<Integer> intBox` — a completely separate instantiation, with `T` as `Integer` instead — the exact same `Box` class, reused for a genuinely different type, without writing `StringBox` and `IntBox` as two separate, duplicated classes.

`new Box<>()` — the empty `<>` is the **diamond operator**, already seen on `ArrayList<>` in the earlier Collections lessons: the compiler infers `T` from the variable's declared type (`Box<String>`) rather than repeating it.

## Writing a Generic Method

```java
public class Main {
    static <T> T firstElement(T[] arr) {
        return arr[0];
    }

    public static void main(String[] args) {
        Integer[] nums = {1, 2, 3};
        String[] words = {"a", "b", "c"};
        System.out.println(firstElement(nums));
        System.out.println(firstElement(words));
    }
}
```

```text
1
a
```

`static <T> T firstElement(T[] arr)` — the `<T>` right after `static` (before the return type) declares a type parameter scoped to this one method, not the whole class — a method can be generic even inside a completely ordinary, non-generic class. `T firstElement(T[] arr)` — the method takes an array of `T` and returns one `T`; the compiler figures out what `T` actually is separately for every call, based on the argument passed in.

`firstElement(nums)` — `T` is inferred as `Integer` here, since `nums` is `Integer[]`; `firstElement(words)` infers `T` as `String` instead, for that call only. One method definition, correctly type-checked for both calls, with no casting and no risk of accidentally returning the wrong type — the entire real value generics add over a version written to return a bare `Object`.

**CS lens:** Java generics are checked at compile time and then largely erased before the program actually runs — a process called **type erasure**: at runtime, a `Box<String>` and a `Box<Integer>` are genuinely the same class, `Box`, with the compiler having already inserted the necessary type checks and casts everywhere they were needed. This is a real, deliberate design tradeoff, different from C#'s generics (which stay fully present at runtime) — it's why, in Java specifically, you can't write `new T()` or check `if (obj instanceof T)` inside a generic class: by the time that code runs, the compiler's own record of exactly which type `T` was has already been erased.

## Challenge: payment_system

Define an interface `Payment` with a single method `void process(double amount)`. Write two classes that implement it:
- `CreditCard` with a `String cardNumber` field — `process` prints `"Charged $<amount> to card ending in <last4digits>"`
- `PayPal` with a `String email` field — `process` prints `"Sent $<amount> to <email> via PayPal"`

In `main`, create one of each and call `process(99.99)` on both.

```challenge java-program
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
assert output.includes('Charged $99.99')
assert output.includes('3456')
assert output.includes('Sent $99.99')
assert output.includes('user@example.com')
```
