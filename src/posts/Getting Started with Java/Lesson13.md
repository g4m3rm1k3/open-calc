# Generics: Type Safety at Scale

In 2004, Java 5 shipped with one of the most significant additions to the language since its release: **generics**. Before Java 5, Java's collections were completely untyped. `ArrayList` held `Object`, which meant you could add a `String` and an `Integer` to the same list and the compiler would accept it cheerfully. The bug would appear only at runtime, with a `ClassCastException`, when you tried to use the wrong type.

```java
// Pre-Java 5 — dangerous
ArrayList list = new ArrayList();
list.add("hello");
list.add(42);  // Compiler accepts this!
String s = (String) list.get(1);  // ClassCastException at runtime
```

Generics moved this error to compile time, where it belongs. They made Java's type system substantially more expressive and are the foundation of the entire Collections Framework, the Stream API, `Optional`, and most modern Java APIs.

## Generic Classes and Methods

```java
import java.util.Arrays;

public class Main {
    // Generic class: T is a type parameter, replaced at compile time
    static class Pair<A, B> {
        private final A first;
        private final B second;

        Pair(A first, B second) {
            this.first  = first;
            this.second = second;
        }

        public A first()  { return first; }
        public B second() { return second; }

        public <C, D> Pair<C, D> map(
            java.util.function.Function<A, C> f,
            java.util.function.Function<B, D> g
        ) {
            return new Pair<>(f.apply(first), g.apply(second));
        }

        @Override
        public String toString() {
            return "(" + first + ", " + second + ")";
        }
    }

    // Generic method: infers T from arguments
    static <T extends Comparable<T>> T maximum(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    // Generic method returning generic type
    static <T> java.util.List<T> repeat(T item, int times) {
        var list = new java.util.ArrayList<T>();
        for (int i = 0; i < times; i++) list.add(item);
        return list;
    }

    public static void main(String[] args) {
        var p1 = new Pair<>("Alice", 95);
        var p2 = new Pair<>(3.14, true);

        System.out.println(p1);  // (Alice, 95)
        System.out.println(p2);  // (3.14, true)

        // Type-safe access — no casting needed
        String name = p1.first();
        int score = p1.second();

        System.out.println(maximum(10, 20));          // 20 — T inferred as Integer
        System.out.println(maximum("apple", "banana")); // banana — T inferred as String

        System.out.println(repeat("hello", 3));       // [hello, hello, hello]
        System.out.println(repeat(0, 5));             // [0, 0, 0, 0, 0]
    }
}
```

The `<T extends Comparable<T>>` in `maximum` is a **bounded type parameter** — it constrains `T` to types that implement `Comparable<T>`. Without this bound, the compiler would reject `a.compareTo(b)` because it can't guarantee every type has that method.

## Wildcards: The Confusing Part

Wildcards (`?`) express relationships between parameterized types. The PECS mnemonic — **Producer Extends, Consumer Super** — tells you which to use:

```java
import java.util.*;

public class Main {
    // ? extends T — read-only ("Producer Extends")
    // Accepts List<Double>, List<Integer>, List<Number>, or any subtype list
    static double sumList(List<? extends Number> list) {
        double total = 0;
        for (Number n : list) total += n.doubleValue();
        return total;
    }

    // ? super T — write-only ("Consumer Super")
    // Accepts List<Integer>, List<Number>, List<Object>
    static void addIntegers(List<? super Integer> list, int count) {
        for (int i = 1; i <= count; i++) list.add(i);
    }

    public static void main(String[] args) {
        List<Integer>  ints    = Arrays.asList(1, 2, 3, 4, 5);
        List<Double>   doubles = Arrays.asList(1.5, 2.5, 3.5);
        List<Number>   numbers = Arrays.asList(1, 2.5, 3L);

        // sumList works with all three
        System.out.println("Sum ints:    " + sumList(ints));
        System.out.println("Sum doubles: " + sumList(doubles));
        System.out.println("Sum numbers: " + sumList(numbers));

        // addIntegers works with List<Integer> or List<Number>
        List<Number> target = new ArrayList<>();
        addIntegers(target, 5);
        System.out.println("Added: " + target);
    }
}
```

The intuition: `? extends T` means "this list contains items that are at least `T`s" — so you can read them as `T`s, but you can't add to the list (because you don't know the exact type). `? super T` means "this list can accept `T`s" — so you can add `T`s to it, but reading gives you `Object`.

## Type Erasure: Java's Generics at Runtime

Here's the honest truth about Java generics: **they don't exist at runtime**. The compiler uses them for type checking, then erases them. `List<String>` and `List<Integer>` are the same class at runtime: `List`.

```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String>  strings  = new ArrayList<>();
        List<Integer> integers = new ArrayList<>();

        // At runtime, both are just java.util.ArrayList
        System.out.println(strings.getClass() == integers.getClass());  // true!

        // This is why instanceof with generics is limited:
        List<String> list = new ArrayList<>();
        list.add("hello");
        System.out.println(list instanceof ArrayList);           // true (OK)
        // System.out.println(list instanceof ArrayList<String>);  // Compile error!

        // And why you can't create generic arrays:
        // T[] arr = new T[10];  // Compile error — T is erased to Object at runtime
    }
}
```

This is the fundamental difference from C++'s monomorphization: C++ generates separate compiled code for `vector<int>` and `vector<string>`. Java compiles one `ArrayList` class and uses casts (invisible to you, inserted by the compiler) everywhere. The result: Java generics have no runtime overhead but also no runtime type information, while C++ templates produce larger binaries but potentially faster code per specialization.

## Building a Generic Stack

A generic stack shows how to build type-safe data structures:

```java
import java.util.EmptyStackException;

public class Main {
    static class Stack<T> {
        private Object[] elements;
        private int size;

        @SuppressWarnings("unchecked")
        Stack(int capacity) {
            elements = new Object[capacity];  // Can't do new T[capacity] — erasure!
        }

        public void push(T item) {
            if (size == elements.length) throw new IllegalStateException("Stack full");
            elements[size++] = item;
        }

        @SuppressWarnings("unchecked")
        public T pop() {
            if (isEmpty()) throw new EmptyStackException();
            T item = (T) elements[--size];
            elements[size] = null;  // Prevent memory leak
            return item;
        }

        @SuppressWarnings("unchecked")
        public T peek() {
            if (isEmpty()) throw new EmptyStackException();
            return (T) elements[size - 1];
        }

        public boolean isEmpty() { return size == 0; }
        public int size()        { return size; }
    }

    public static void main(String[] args) {
        Stack<String> stringStack = new Stack<>(10);
        stringStack.push("first");
        stringStack.push("second");
        stringStack.push("third");

        System.out.println("Peek: " + stringStack.peek());
        while (!stringStack.isEmpty()) {
            System.out.println("Pop: " + stringStack.pop());
        }

        Stack<Integer> intStack = new Stack<>(5);
        for (int i = 1; i <= 5; i++) intStack.push(i * i);
        System.out.println("Int stack size: " + intStack.size());
    }
}
```

The `@SuppressWarnings("unchecked")` annotation is necessary because the cast `(T) elements[...]` can't be verified at runtime due to erasure. The compiler warns us; we suppress the warning knowing the cast is safe because we only put `T` objects into `elements`.

## Generics in the Stream API

The Stream API is entirely built on generics, and using it effectively means reading generic type signatures fluently:

```java
import java.util.*;
import java.util.stream.*;
import java.util.function.*;

public class Main {
    // Generic pipeline builder
    static <T, R> List<R> transform(List<T> input, Function<T, R> mapper) {
        return input.stream().map(mapper).collect(Collectors.toList());
    }

    static <T> List<T> filterAndSort(
        List<T> input,
        Predicate<T> filter,
        Comparator<T> comparator
    ) {
        return input.stream()
            .filter(filter)
            .sorted(comparator)
            .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "Diana", "Eve");

        // Transform: String → Integer
        List<Integer> lengths = transform(names, String::length);
        System.out.println("Lengths: " + lengths);

        // Filter and sort: names longer than 3 chars, alphabetically
        List<String> filtered = filterAndSort(
            names,
            s -> s.length() > 3,
            Comparator.naturalOrder()
        );
        System.out.println("Filtered & sorted: " + filtered);

        // Collectors.toMap — generic result type inferred
        Map<String, Integer> nameLengths = names.stream()
            .collect(Collectors.toMap(
                Function.identity(),  // key: the name itself
                String::length        // value: the length
            ));
        System.out.println("Name lengths: " + nameLengths);
    }
}
```

Generics are the mechanism that makes Java's type system powerful enough to express the Stream API, Collections Framework, and the functional programming patterns that define modern Java. They're also where Java's verbosity reaches its peak — deeply nested generic types like `Map<String, List<Map<Integer, Set<String>>>>` are a running joke. Modern Java's `var`, `record`, and inference have reduced this burden significantly, but understanding what those types mean remains essential for working with the framework.
