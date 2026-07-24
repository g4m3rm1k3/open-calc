# Interfaces, Lambdas, and Method References

`interface`, `implements`, default methods, functional interfaces,
lambda expressions, and method references — how Java passes *behavior*
around as a value. Every example on this page was compiled and run for
real.

---

## Basic Interfaces

```java
interface Payable {
    double amountDue();

    default String formattedAmountDue() {
        return "$" + amountDue();
    }
}

class Invoice implements Payable {
    double amount;

    Invoice(double amount) {
        this.amount = amount;
    }

    @Override
    public double amountDue() {
        return amount;
    }
}
```

```java
Invoice invoice = new Invoice(100);
invoice.formattedAmountDue();
```

Real output: `$100.0`

An interface declares *what* can be called — never *how* — every
non-`default` method has no body at all. `implements` is a class's
promise to provide a real implementation for each one; the compiler
enforces the promise. Unlike a class, a single class can `implements`
**multiple** interfaces (unlike `extends`, which only ever allows one
parent class):

```java
class Invoice implements Payable, Taxable { ... }
```

---

## `default` Methods

`formattedAmountDue()` above has a real body, even though it's declared
in an interface — a **default method** (added in Java 8) provides
shared implementation that any implementing class gets for free,
without being forced to write it itself, while `amountDue()` still has
no body and must still be implemented by every class.

```java
Payable p = invoice;   // treat the object as its interface type
p.formattedAmountDue();
```

Real output: `$100.0` — code written against `Payable` never needs to
know it's actually holding an `Invoice`.

---

## Functional Interfaces and Lambda Expressions

A **functional interface** is any interface with exactly one abstract
method (default methods don't count against this limit):

```java
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}
```

`@FunctionalInterface` is optional but valuable — it asks the compiler
to verify the interface genuinely has only one abstract method,
catching a mistake immediately:

```java
@FunctionalInterface
interface TwoMethods {
    int first();
    int second();
}
```

Real output — fails to compile:

```text
error: Unexpected @FunctionalInterface annotation
  TwoMethods is not a functional interface
    multiple non-overriding abstract methods found in interface TwoMethods
```

A **lambda expression** is shorthand syntax for supplying an instance
of a functional interface, without writing a full named class:

```java
Calculator add = (a, b) -> a + b;
Calculator multiply = (a, b) -> a * b;
```

```java
add.calculate(3, 4)       // 7
multiply.calculate(3, 4)  // 12
```

`(a, b)` are the lambda's parameters, matched positionally to
`calculate(int a, int b)`'s own parameters — no type annotations
needed, since Java infers them from the interface. `a + b` is the
expression the single method's body evaluates to.

---

## The Built-In Functional Interfaces

Rather than writing a new one-method interface every time, `java.util.function`
provides ready-made ones for the most common shapes:

```java
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Consumer;

Function<Integer, Integer> square = x -> x * x;
square.apply(5);          // 25

Predicate<Integer> isEven = x -> x % 2 == 0;
isEven.test(4);            // true
isEven.test(5);            // false

Consumer<String> printer = s -> System.out.println("Consumed: " + s);
printer.accept("hello");   // prints: Consumed: hello
```

Real output:

```text
square(5)=25
isEven(4)=true isEven(5)=false
Consumed: hello
```

`Function<T, R>` — takes a `T`, returns an `R`, called via `.apply(...)`.
`Predicate<T>` — takes a `T`, returns `boolean`, called via `.test(...)`
— the interface behind `Stream.filter(...)`, see
[07-collections-and-streams.md](07-collections-and-streams.md).
`Consumer<T>` — takes a `T`, returns nothing, called via `.accept(...)`
— the interface behind `list.forEach(...)`, below.

---

## Method References

When a lambda would do nothing but call one existing method, `::` lets
you refer to that method directly, without writing the wrapper lambda
yourself:

```java
List<String> names = Arrays.asList("charlie", "alice", "bob");
names.forEach(System.out::println);
```

Real output:

```text
charlie
alice
bob
```

`System.out::println` is exactly equivalent to `x -> System.out.println(x)`
— a reference to an existing method, used wherever a matching
functional interface (here, `Consumer<String>`) is expected.

```java
Function<String, Integer> length = String::length;
length.apply("hello");   // 5
```

`String::length` refers to the *instance* method `.length()`, called on
whatever argument is passed in — equivalent to `s -> s.length()`.
