---
series: java-fundamentals
level: 19
title: Generics Deep Dive
lang: java
---

# Generics Deep Dive

Level 12's `Box<T>` let `T` be absolutely anything — `Box<String>`, `Box<Integer>`, even `Box<Object>`. That freedom has a real cost: inside `Box<T>` itself, nothing is known about `T` at all, not even whether two `T`s can be compared. This lesson adds **bounds** — real, compiler-checked constraints on what `T` is allowed to be — and **wildcards**, for accepting a range of related generic types at a method boundary.

## A Bounded Type Parameter

```java
public class Main {
    static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    public static void main(String[] args) {
        System.out.println(max(3, 7));
        System.out.println(max("apple", "banana"));
        System.out.println(max(2.5, 1.5));
    }
}
```

```text
7
banana
2.5
```

`<T extends Comparable<T>>` — restricts `T` to only types that implement `Comparable<T>` (Level 17's `Comparator.comparing` built an external comparison; `Comparable` is a type's own, built-in way of comparing itself to another instance). `Integer`, `String`, and `Double` all implement `Comparable<T>` against themselves in the standard library, which is exactly why `max(3, 7)`, `max("apple", "banana")`, and `max(2.5, 1.5)` all compile and work with the same one method.

`a.compareTo(b)` — only legal inside `max` *because* of the bound; without `extends Comparable<T>`, the compiler would have no way to know `T` has a `compareTo` method at all:

```text
Main.java:4: error: cannot find symbol
        return a.compareTo(b) >= 0 ? a : b;
                ^
  symbol:   method compareTo(T)
  location: variable a of type T
  where T is a type-variable:
    T extends Object declared in method <T>max(T,T)
```

That's the real compile error `<T> T max(T a, T b)` — no bound at all — produces the instant it tries to call `compareTo`. An unbounded `T` is only ever known to be some `Object`, and `Object` itself has no `compareTo` method.

## A Bounded Generic Class

```java
class NumberBox<T extends Number> {
    private T value;
    NumberBox(T value) { this.value = value; }
    double doubled() { return value.doubleValue() * 2; }
}

public class Main {
    public static void main(String[] args) {
        NumberBox<Integer> ib = new NumberBox<>(5);
        NumberBox<Double> db = new NumberBox<>(2.5);
        System.out.println(ib.doubled());
        System.out.println(db.doubled());
    }
}
```

```text
10.0
5.0
```

`class NumberBox<T extends Number>` — the bound applies at the class level this time: `NumberBox<String>` would be a compile error, since `String` doesn't extend `Number`. `value.doubleValue()` — `doubleValue()` is a real method every `Number` subclass (`Integer`, `Double`, and others) provides, reachable here for the same reason `compareTo` was reachable above: the bound is a real, compiler-enforced promise about what `T` can do.

## Wildcards — Accepting a Range of Generic Types

```java
import java.util.*;

public class Main {
    static double sumList(List<? extends Number> list) {
        double total = 0;
        for (Number n : list) total += n.doubleValue();
        return total;
    }

    public static void main(String[] args) {
        List<Integer> ints = Arrays.asList(1, 2, 3);
        List<Double> doubles = Arrays.asList(1.5, 2.5);
        System.out.println(sumList(ints));
        System.out.println(sumList(doubles));
    }
}
```

```text
6.0
4.0
```

`List<? extends Number>` — a **wildcard**: unlike `NumberBox<T extends Number>`'s `T`, which names a specific, fixed type for the lifetime of one `NumberBox`, `?` here means "a `List` of some specific type, whatever it turns out to be, as long as that type extends `Number`." `sumList` never needs to know or care whether it was actually handed a `List<Integer>` or a `List<Double>` — both are accepted by the exact same method, because `List<Integer>` is not itself a `List<Number>` (a real, deliberate restriction in Java's generics, protecting against inserting a `Double` into what's really an `Integer` list), but it *is* a `List<? extends Number>`.

**CS lens:** This is the real, practical reason wildcards exist at all: Java generics are **invariant** — `List<Integer>` and `List<Number>` are treated as two completely unrelated types, even though `Integer` itself is a `Number`. Without `? extends Number`, a method wanting to accept "any list of numbers, whatever specific number type" would need a separate overload for every single one. `? extends` opts into read-only flexibility across that hierarchy — `sumList` can read every element out as a `Number`, but (not shown here) could never safely add a new element to `list`, since the compiler genuinely doesn't know whether it's holding a `List<Integer>`, a `List<Double>`, or anything else that merely extends `Number`.

**SE lens:** Reach for a bound (`<T extends X>`) the moment a generic class or method needs to actually *call* a method belonging to `X` on its own type parameter — `compareTo`, `doubleValue`, anything beyond simply storing and returning the value the way Level 12's original `Box<T>` did. Reach for a wildcard (`? extends X`) specifically at a method *parameter* boundary, when the method only needs to read values of some unknown-but-bounded type, never insert new ones — exactly `sumList`'s situation here.

## Challenge: middle_value

Write a `static <T extends Comparable<T>> T middleValue(T a, T b, T c)` method that returns whichever of the three arguments is the middle value when sorted (neither the minimum nor the maximum). Assume all three are distinct.

```challenge
static <T extends Comparable<T>> T middleValue(T a, T b, T c) {
    // TODO
}
```

```test
assert middleValue(3, 7, 5) == 5
assert middleValue(10, 2, 6) == 6
assert middleValue("apple", "cherry", "banana").equals("banana")
assert middleValue(1, 2, 3) == 2
```
