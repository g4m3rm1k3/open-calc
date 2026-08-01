---
series: java-fundamentals
level: 14
title: Lambdas & Functional Interfaces
lang: java
---

# Lambdas & Functional Interfaces

Level 13's `.map(s -> s.toUpperCase())` and `.orElseThrow(() -> new RuntimeException(...))` both used a small, unnamed function inline, without stopping to explain the syntax. This lesson does: `->` is a **lambda expression**, and the reason a method like `.map(...)` can accept one at all is a specific kind of interface built to hold exactly one.

## Built-in Functional Interfaces

```java
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Consumer;
import java.util.function.Supplier;

public class Main {
    public static void main(String[] args) {
        Function<Integer, Integer> square = x -> x * x;
        Predicate<Integer> isEven = x -> x % 2 == 0;
        Consumer<String> printer = s -> System.out.println("Got: " + s);
        Supplier<String> greeting = () -> "Hello!";

        System.out.println(square.apply(5));
        System.out.println(isEven.test(4));
        printer.accept("test");
        System.out.println(greeting.get());
    }
}
```

```text
25
true
Got: test
Hello!
```

`Function<Integer, Integer> square = x -> x * x;` — `Function<T, R>` represents "a function taking a `T`, returning an `R`." `x -> x * x` is the **lambda expression**: `x` is the parameter (its type, `Integer`, is inferred from `Function<Integer, Integer>`'s own declaration, so it doesn't need to be written again), and `x * x` is the expression it evaluates to and returns. `square.apply(5)` — every `Function` is *called* through its own `.apply(...)` method.

`Predicate<Integer> isEven` — `Predicate<T>` is specifically "a function taking a `T`, returning `boolean`" — called through `.test(...)`. `Consumer<String> printer` — "takes a `T`, returns nothing" — called through `.accept(...)`. `Supplier<String> greeting` — "takes nothing, returns a `T`" — called through `.get()`, with an empty `()` parameter list on the lambda side too, since there's genuinely nothing to accept.

**CS lens:** Each of these — `Function`, `Predicate`, `Consumer`, `Supplier` — is a **functional interface**: an interface with exactly one abstract method (Level 12's `default` methods don't count toward that total). A lambda expression is really shorthand for "an anonymous object implementing that one method" — `x -> x * x` is a complete, real implementation of `Function`'s single abstract method, `apply`, with the interface name and method name both inferred from context rather than spelled out.

## Writing a Custom Functional Interface

```java
interface Operation {
    int apply(int a, int b);
}

public class Main {
    static int compute(int a, int b, Operation op) {
        return op.apply(a, b);
    }

    public static void main(String[] args) {
        Operation add = (a, b) -> a + b;
        Operation multiply = (a, b) -> a * b;
        System.out.println(compute(3, 4, add));
        System.out.println(compute(3, 4, multiply));
    }
}
```

```text
7
12
```

`interface Operation { int apply(int a, int b); }` — exactly one abstract method, so `Operation` qualifies as a functional interface too, even though it's a custom one, not from `java.util.function`. Nothing marks it specially as such — Java infers it purely from having one abstract method (an optional `@FunctionalInterface` annotation exists to make the compiler double-check this and error if it's ever accidentally violated, but it isn't required).

`Operation add = (a, b) -> a + b;` — the same lambda syntax as before, now with two parameters instead of one. `static int compute(int a, int b, Operation op)` — accepts *any* `Operation`, the same way Level 12's `render(Drawable d)` accepted any `Drawable`; `compute(3, 4, add)` and `compute(3, 4, multiply)` run the exact same `compute` code with genuinely different behavior swapped in through `op.apply(a, b)`.

## Method References

```java
import java.util.function.Function;

public class Main {
    static int square(int x) { return x * x; }

    public static void main(String[] args) {
        Function<Integer, Integer> f1 = x -> square(x);
        Function<Integer, Integer> f2 = Main::square;
        System.out.println(f1.apply(5));
        System.out.println(f2.apply(5));

        Function<String, Integer> len = String::length;
        System.out.println(len.apply("hello"));
    }
}
```

```text
25
25
5
```

`x -> square(x)` — a lambda that does nothing except immediately call an existing method with the same argument it received. `Main::square` — a **method reference**: exact same behavior, written as a direct pointer to `square` itself rather than wrapping it in a lambda that just forwards to it.

`String::length` — a method reference to an *instance* method, not a static one; `len.apply("hello")` calls `"hello".length()` — the `String` argument passed to `apply` becomes the object the referenced method is called *on*, not a separate argument alongside it.

**SE lens:** A method reference is strictly a readability choice over the equivalent lambda — `Main::square` and `x -> square(x)` compile to the same behavior. Prefer the method reference whenever a lambda's *entire body* is nothing but forwarding its arguments straight into one existing method, unchanged — it states "this just is that method" more directly than a lambda that technically says the same thing with extra syntax around it. The moment a lambda needs to do anything more — combine values, add a condition — the method reference shorthand no longer applies, and a real lambda body is the right and only choice.

## Challenge: apply_to_all

Write a `static List<Integer> applyToAll(List<Integer> list, Function<Integer, Integer> fn)` method that returns a new list with `fn` applied to every element of `list`, in order.

```challenge
static List<Integer> applyToAll(List<Integer> list, java.util.function.Function<Integer, Integer> fn) {
    // TODO
}
```

```test
assert applyToAll(Arrays.asList(1, 2, 3), x -> x * 2).equals(Arrays.asList(2, 4, 6))
assert applyToAll(Arrays.asList(1, 2, 3), x -> x * x).equals(Arrays.asList(1, 4, 9))
assert applyToAll(new ArrayList<Integer>(), x -> x + 1).equals(new ArrayList<Integer>())
assert applyToAll(Arrays.asList(5), x -> x - 1).equals(Arrays.asList(4))
```
