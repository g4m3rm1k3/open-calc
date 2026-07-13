---
series: java-fundamentals
level: 0
title: Types, Variables & main()
lang: java
---

# Types, Variables & main()

Java is a statically-typed, compiled language that runs on the JVM (Java Virtual Machine). Every variable has a declared type; types are checked at compile time. Java code is compiled to bytecode (`.class` files) that the JVM executes — making Java programs portable across operating systems without recompilation.

## The Structure of a Java Program

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java");
    }
}
```

```text
Hello, Java
```

`public class Main` — all Java code must be inside a class. The filename must match the class name: `Main.java`.

`public static void main(String[] args)` — the entry point. The JVM looks for exactly this signature to start the program. `static` means it belongs to the class, not an instance. `String[] args` holds command-line arguments (unused here).

`System.out.println(...)` — prints to standard output followed by a newline. `System` is a class in `java.lang` (automatically imported). `out` is a static field of type `PrintStream`. `println` is a method on `out`.

**CS lens:** Java compiles to JVM bytecode, not native machine code. The JVM then JIT-compiles hot code paths to native instructions. This gives Java portability (run the same `.class` file on any OS with a JVM) at the cost of a startup overhead versus a natively-compiled language like C++.

## Fundamental Types

```java
public class Main {
    public static void main(String[] args) {
        int age = 28;
        double temperature = 36.6;
        boolean isActive = true;
        char grade = 'A';
        String name = "Alice";

        System.out.println(age);
        System.out.println(temperature);
        System.out.println(isActive);
        System.out.println(grade);
        System.out.println(name);
    }
}
```

```text
28
36.6
true
A
Alice
```

`int`, `double`, `boolean`, `char` — Java's **primitive types**. They store values directly (on the stack for local variables). Note: `boolean` prints as `true`/`false` (lowercase), unlike C#'s `True`/`False`.

`String` — a capital-S class, not a primitive. `String` is a reference type: the variable holds a reference to a `String` object on the heap.

`'A'` — a `char` literal (single quotes). `"Alice"` — a `String` literal (double quotes). Mixing them is a compile error.

## Variable Declarations and Operators

```java
public class Main {
    public static void main(String[] args) {
        int a = 17, b = 5;

        System.out.println(a + b);
        System.out.println(a - b);
        System.out.println(a * b);
        System.out.println(a / b);
        System.out.println(a % b);

        double x = 17.0, y = 5.0;
        System.out.println(x / y);
    }
}
```

```text
22
12
85
3
2
3.4
```

`a / b` — integer division when both operands are `int`. `17 / 5` → `3` (truncated).
`a % b` — modulo: `17 % 5` → `2`.
`x / y` — floating-point division when both operands are `double`. `17.0 / 5.0` → `3.4`.

## String Concatenation and Formatting

```java
public class Main {
    public static void main(String[] args) {
        String name = "Alice";
        int age = 30;

        System.out.println("Name: " + name + ", Age: " + age);
        System.out.printf("Name: %s, Age: %d%n", name, age);
        System.out.printf("Pi: %.2f%n", Math.PI);
    }
}
```

```text
Name: Alice, Age: 30
Name: Alice, Age: 30
Pi: 3.14
```

`"Name: " + name` — the `+` operator on strings concatenates. When one side is a `String`, the other is automatically converted with `.toString()`.

`System.out.printf(format, args...)` — C-style formatted output. `%s` = string, `%d` = integer, `%f` = float, `%n` = platform newline.

`Math.PI` — a `static final double` field in `java.lang.Math`. `Math` methods include `Math.abs()`, `Math.sqrt()`, `Math.pow()`, `Math.max()`, `Math.min()`.

## Writing Static Methods

```java
public class Main {
    static int square(int n) {
        return n * n;
    }

    static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(square(7));
        System.out.println(greet("Alice"));
        System.out.println(greet("Bob"));
    }
}
```

```text
49
Hello, Alice!
Hello, Bob!
```

`static int square(int n)` — a static method: belongs to the class, not an instance. `main` can call other `static` methods directly without creating an object.

Return type comes before the method name. `void` for no return value. `return` expression sends the value back.

## Challenge: bmi_calculator

Write a static method `static double bmi(double weightKg, double heightM)` that computes BMI as `weightKg / (heightM * heightM)`.

```challenge
static double bmi(double weightKg, double heightM) {
    // TODO
}
```

```test
assert Math.abs(bmi(70, 1.75) - 22.86) < 0.01
assert Math.abs(bmi(50, 1.60) - 19.53) < 0.01
assert Math.abs(bmi(100, 2.00) - 25.0) < 0.01
assert Math.abs(bmi(1, 1) - 1.0) < 0.01
```
