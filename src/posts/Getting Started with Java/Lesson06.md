# Methods: Abstraction, Overloading, and Recursion

In 1968, NATO sponsored a conference on what they called the "software crisis" — the growing realization that writing large programs was far harder than writing small ones, and that existing techniques didn't scale. The conference produced the term *software engineering* and identified **abstraction** as the core solution: the ability to hide complexity behind a named interface.

Methods (called functions in most other languages) are Java's primary abstraction tool. A method has a name, accepts inputs, and returns an output. The caller doesn't need to know *how* it works — only *what* it does. This separation of interface from implementation is what makes it possible to build programs of millions of lines, with hundreds of engineers, without everyone needing to understand everything.

## Anatomy of a Method

```java
public class Main {
    //  ↓ return type   ↓ name      ↓ parameter list
    static double circleArea(double radius) {
        final double PI = 3.141592653589793;
        return PI * radius * radius;  // ← return statement
    }

    static String classify(int score) {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "F";
    }

    // void: returns nothing
    static void printSeparator(int width) {
        for (int i = 0; i < width; i++) {
            System.out.print("-");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        System.out.printf("Area: %.4f%n", circleArea(5.0));
        System.out.println("Score 85 -> " + classify(85));
        printSeparator(30);
    }
}
```

Every method must declare its **return type**. If it doesn't return a value, the type is `void`. The `return` statement exits the method and optionally passes a value back to the caller. A method can have multiple `return` statements — execution ends at the first one reached.

## Parameters: Java is Pass-by-Value

Java is **always pass-by-value**. This is one of the most debated points in Java pedagogy, because it behaves differently for primitives and objects:

```java
public class Main {
    static void tryToDouble(int x) {
        x = x * 2;  // modifies local copy — no effect on caller
    }

    static void appendToArray(int[] arr) {
        arr[0] = 999;  // modifies the array's content — VISIBLE to caller
        arr = new int[]{1, 2, 3};  // reassigning arr — NOT visible to caller
    }

    static void appendToString(String s) {
        s = s + " World";  // Strings are immutable — new object, not visible to caller
    }

    public static void main(String[] args) {
        // Primitive: copy of value
        int n = 10;
        tryToDouble(n);
        System.out.println("n = " + n);  // Still 10

        // Array: copy of reference — the reference is copied, not the array
        int[] arr = {1, 2, 3};
        appendToArray(arr);
        System.out.println("arr[0] = " + arr[0]);  // 999 — mutation is visible
        System.out.println("arr.length = " + arr.length);  // 3 — reassignment invisible

        // String: immutable, effectively behaves like primitive
        String s = "Hello";
        appendToString(s);
        System.out.println("s = " + s);  // "Hello" — unchanged
    }
}
```

The mental model: Java passes a **copy of the reference**, not a copy of the object. The method gets its own reference variable pointing to the same heap object. Mutating the object through that reference is visible. Reassigning the reference variable itself is not.

## Method Overloading

Java allows multiple methods with the same name, as long as their parameter lists differ. The compiler picks the right one based on argument types at the call site:

```java
public class Main {
    static int    add(int a, int b)       { return a + b; }
    static double add(double a, double b) { return a + b; }
    static String add(String a, String b) { return a + b; }
    static int    add(int a, int b, int c){ return a + b + c; }

    // Overloading for convenience — default arguments
    static void log(String message)              { log(message, "INFO"); }
    static void log(String message, String level){ System.out.println("[" + level + "] " + message); }

    public static void main(String[] args) {
        System.out.println(add(1, 2));           // int version: 3
        System.out.println(add(1.5, 2.5));       // double version: 4.0
        System.out.println(add("Hello", " World")); // String version
        System.out.println(add(1, 2, 3));        // three-int version: 6

        log("Server started");            // uses default "INFO"
        log("Connection failed", "ERROR");
    }
}
```

Overloading is resolved entirely at compile time — the compiler embeds the call to the correct version based on the static types of the arguments. This differs from **overriding** (which we'll cover in the OOP lesson), where the resolution happens at runtime based on the actual object type.

## Varargs: Variable-Length Arguments

Java supports methods that accept any number of arguments of the same type:

```java
import java.util.Arrays;

public class Main {
    // Varargs: int... is treated as int[] inside the method
    static int sum(int... numbers) {
        int total = 0;
        for (int n : numbers) total += n;
        return total;
    }

    static String join(String separator, String... parts) {
        return String.join(separator, parts);
    }

    static void printAll(Object... items) {
        System.out.println(Arrays.toString(items));
    }

    public static void main(String[] args) {
        System.out.println(sum(1, 2, 3));           // 6
        System.out.println(sum(1, 2, 3, 4, 5));     // 15
        System.out.println(sum());                   // 0 — zero args is valid

        System.out.println(join(", ", "Alice", "Bob", "Charlie"));
        printAll(1, "hello", 3.14, true);
    }
}
```

Varargs (declared with `...`) must be the last parameter and there can only be one per method. Behind the scenes, the compiler wraps the arguments into an array — `sum(1, 2, 3)` is exactly equivalent to `sum(new int[]{1, 2, 3})`.

## Recursion and the Call Stack

A method can call itself. Recursion is mathematically elegant and matches many problem structures directly:

```java
public class Main {
    // Factorial: n! = n * (n-1)!
    static long factorial(int n) {
        if (n <= 1) return 1;      // base case
        return n * factorial(n - 1); // recursive case
    }

    // Binary search — recursion matches the problem structure perfectly
    static int binarySearch(int[] arr, int target, int low, int high) {
        if (low > high) return -1;  // Not found
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target)  return binarySearch(arr, target, mid + 1, high);
        return binarySearch(arr, target, low, mid - 1);
    }

    // Fibonacci — naive recursion is exponential time!
    static int fibSlow(int n) {
        if (n <= 1) return n;
        return fibSlow(n - 1) + fibSlow(n - 2);  // 2 recursive calls — doubles work each level
    }

    // Fibonacci with memoization — linear time
    static long[] memo = new long[100];
    static long fibFast(int n) {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        memo[n] = fibFast(n - 1) + fibFast(n - 2);
        return memo[n];
    }

    public static void main(String[] args) {
        for (int i = 0; i <= 12; i++) {
            System.out.println(i + "! = " + factorial(i));
        }

        int[] sorted = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
        System.out.println("Index of 11: " + binarySearch(sorted, 11, 0, sorted.length - 1));
        System.out.println("Index of 6:  " + binarySearch(sorted, 6, 0, sorted.length - 1));

        System.out.println("fib(40) fast: " + fibFast(40));
    }
}
```

Each recursive call creates a new **stack frame** — an allocation of memory on the call stack holding the local variables and return address. For `factorial(10)`, there are 10 stack frames alive simultaneously. For `fibonacci(50)` without memoization, there would be 2⁵⁰ frames — the stack would overflow almost instantly.

Java's default stack size is typically 512KB–1MB per thread. Deep recursion on large inputs causes `StackOverflowError`. For problems requiring deep recursion (tree traversals, graph algorithms), iterative solutions using an explicit stack (a `Deque`) are more robust.

## Static vs Instance Methods

All the methods above are `static` — they belong to the class, not to any object. Instance methods, on the other hand, operate on the state of a particular object and are covered in the OOP lesson. For now, the rule of thumb: `static` for utility methods and pure functions that don't depend on object state; instance methods for behavior that reads or modifies an object's fields.

```java
public class Main {
    // Pure utility — static makes sense, no object state needed
    static double degreesToRadians(double degrees) {
        return degrees * Math.PI / 180.0;
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.printf("90 degrees = %.4f radians%n", degreesToRadians(90));

        System.out.print("Primes up to 50: ");
        for (int i = 2; i <= 50; i++) {
            if (isPrime(i)) System.out.print(i + " ");
        }
        System.out.println();
    }
}
```
