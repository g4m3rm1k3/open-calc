# Types, Variables, and the Cost of Safety

Every piece of data in a Java program has a **type**. This isn't incidental — it's foundational to Java's design. When Gosling chose to make Java statically typed (types declared at compile time, checked before the program runs), he was making a deliberate bet: catch errors early, at compile time, rather than at runtime when they become customer-facing bugs.

Python, JavaScript, and Ruby are dynamically typed — variables can hold any value at any time, and type errors surface only when the problematic line actually executes. Java's compiler rejects type errors before the program runs. You spend more time upfront satisfying the type checker; you spend less time debugging mysterious runtime failures.

## Primitive Types: Java's Eight Building Blocks

Java's type system divides into **primitives** (raw values, stored directly) and **reference types** (objects, stored as references on the heap). Primitives are the foundation:

| Type | Size | Range | Default |
|------|------|-------|---------|
| `byte` | 8 bits | -128 to 127 | 0 |
| `short` | 16 bits | -32,768 to 32,767 | 0 |
| `int` | 32 bits | -2,147,483,648 to 2,147,483,647 | 0 |
| `long` | 64 bits | ±9.2 × 10¹⁸ | 0L |
| `float` | 32 bits | ~7 significant digits | 0.0f |
| `double` | 64 bits | ~15 significant digits | 0.0 |
| `char` | 16 bits | Unicode 0 to 65,535 | '\u0000' |
| `boolean` | 1 bit (effectively) | `true` or `false` | false |

Unlike C++, Java's primitive sizes are **fixed and guaranteed by the specification**. An `int` is always 32 bits on every JVM on every platform. This is part of "Write Once, Run Anywhere" — no platform-dependent type sizes to worry about.

```java
public class Main {
    public static void main(String[] args) {
        // Integer types
        byte  b = 127;
        short s = 32767;
        int   i = 2147483647;
        long  l = 9223372036854775807L;  // L suffix required for long literals

        // Floating point
        float  f = 3.14f;     // f suffix required for float literals
        double d = 3.141592653589793;

        // Other primitives
        char    c    = 'A';
        boolean flag = true;

        System.out.println("int max: "    + i);
        System.out.println("long max: "   + l);
        System.out.println("double pi: "  + d);
        System.out.println("char: "       + c + " = " + (int)c);  // cast shows Unicode value
        System.out.println("boolean: "    + flag);
    }
}
```

## The Floating-Point Problem: Java Doesn't Escape It Either

Just like C++, Java uses IEEE 754 for floating-point. The fundamental limitation — that most decimal fractions can't be represented exactly in binary — applies equally:

```java
public class Main {
    public static void main(String[] args) {
        double a = 0.1;
        double b = 0.2;
        double c = a + b;

        System.out.println("0.1 + 0.2 = " + c);           // 0.30000000000000004
        System.out.println("Equal to 0.3? " + (c == 0.3)); // false

        // Correct comparison: use epsilon
        double epsilon = 1e-10;
        boolean almostEqual = Math.abs(c - 0.3) < epsilon;
        System.out.println("Approximately equal: " + almostEqual);  // true

        // For financial code: use BigDecimal, never double
        // (We'll cover BigDecimal in a later lesson)
    }
}
```

The rule for financial software: **never use `double` for money**. Java provides `java.math.BigDecimal` for exact decimal arithmetic — slower but correct.

## Variables: Declaration and Initialization

A variable in Java must be **declared** before it can be used. The declaration specifies the type:

```java
public class Main {
    public static void main(String[] args) {
        // Declaration and initialization in one line (most common)
        int age = 25;
        String name = "Alice";
        double salary = 75000.50;

        // Declaration first, initialization later
        int score;
        // System.out.println(score);  // Compile error! Variable might not be initialized
        score = 95;
        System.out.println(score);  // Now fine

        // Multiple declarations of the same type
        int x = 10, y = 20, z = 30;
        System.out.println(x + y + z);

        System.out.println(name + " is " + age + " years old");
    }
}
```

A key difference from C++: Java's compiler **guarantees** that a local variable is initialized before use. If you declare a variable and try to read it before assigning a value, the compiler refuses. This eliminates an entire class of C++ bugs where uninitialized variables contain whatever garbage happened to be on the stack.

## `var`: Local Type Inference (Java 10+)

Java 10 added `var` for local variables, letting the compiler infer the type from the initializer:

```java
public class Main {
    public static void main(String[] args) {
        var age = 25;              // inferred as int
        var name = "Alice";        // inferred as String
        var pi = 3.14159;          // inferred as double
        var items = new java.util.ArrayList<String>();  // inferred as ArrayList<String>

        // var CANNOT be used without an initializer
        // var x;  // Compile error

        System.out.println(age + " " + name + " " + pi);

        items.add("apple");
        items.add("banana");
        System.out.println(items);
    }
}
```

`var` doesn't make Java dynamic — the type is still fixed at compile time. It's purely cosmetic: you type less, the compiler figures out the type. It's most useful when the type is obvious from context or verbose (like `ArrayList<Map<String, List<Integer>>>`).

## `final`: Java's `const`

The `final` keyword marks a variable that can only be assigned once. After initialization, it's immutable:

```java
public class Main {
    // Constants: by convention, use UPPER_SNAKE_CASE
    static final double PI = 3.141592653589793;
    static final int MAX_SIZE = 1024;

    public static void main(String[] args) {
        final int x = 10;
        // x = 20;  // Compile error: cannot assign to final variable

        // final for a reference means the reference is fixed,
        // NOT that the object is immutable
        final var list = new java.util.ArrayList<String>();
        list.add("hello");   // Fine: modifying the object
        list.add("world");   // Fine
        // list = new java.util.ArrayList<>();  // Error: can't reassign reference

        System.out.println("PI = " + PI);
        System.out.println("List: " + list);

        // Effective radius calculation
        final double radius = 5.0;
        double area = PI * radius * radius;
        System.out.printf("Area: %.4f%n", area);
    }
}
```

## Primitive vs Reference: The Fundamental Split

This distinction is critical and trips up many beginners. **Primitives** store their value directly. **Reference types** (String, arrays, objects) store a reference — an address pointing to an object on the heap.

```java
public class Main {
    public static void main(String[] args) {
        // Primitives: stored by VALUE
        int a = 10;
        int b = a;   // b gets a COPY of 10
        b = 20;
        System.out.println("a = " + a);  // Still 10 — b's change didn't affect a
        System.out.println("b = " + b);  // 20

        // Strings: reference type, but with a twist
        String s1 = "hello";
        String s2 = "hello";
        String s3 = new String("hello");

        // == on references: compares the reference (address), not the content!
        System.out.println("s1 == s2: " + (s1 == s2));        // true (string pool)
        System.out.println("s1 == s3: " + (s1 == s3));        // false (new object)
        System.out.println("s1.equals(s3): " + s1.equals(s3)); // true (content)

        // ALWAYS use .equals() to compare strings, never ==
    }
}
```

The `==` vs `.equals()` distinction is one of Java's most notorious gotchas. `==` on reference types compares memory addresses. `.equals()` compares content. For strings, Java maintains a "string pool" — string literals with the same content may share the same object, making `==` seem to work. But `new String("hello")` always creates a new object. Always use `.equals()` for string comparison.

## Type Casting

Converting between types is common:

```java
public class Main {
    public static void main(String[] args) {
        // Widening conversion: automatic, safe
        int i = 42;
        long l = i;       // int fits in long — automatic
        double d = i;     // int fits in double — automatic

        System.out.println("int: " + i + ", long: " + l + ", double: " + d);

        // Narrowing conversion: explicit cast required — may lose data
        double pi = 3.14159;
        int truncated = (int) pi;  // Cast: truncates, doesn't round
        System.out.println("pi = " + pi + ", as int = " + truncated);

        // Integer division trap — same as C++
        int total = 7;
        int count = 2;
        double avg1 = total / count;          // 3.0 — integer division first!
        double avg2 = (double) total / count; // 3.5 — cast before division
        System.out.println("avg1 = " + avg1 + ", avg2 = " + avg2);

        // char and int interconvert easily
        char letter = 'A';
        int ascii = letter;     // 65
        char back = (char)(ascii + 1);  // 'B'
        System.out.println(letter + " = " + ascii + ", next = " + back);
    }
}
```

The integer division trap — `7 / 2 == 3` — bites Java programmers just as often as C++ programmers. The fix is identical: ensure at least one operand is a floating-point type before dividing.

## Wrapper Classes: Primitives as Objects

Every primitive type has a corresponding **wrapper class**: `Integer`, `Double`, `Boolean`, `Character`, etc. These are needed whenever an API requires an object (like collections — `List<int>` is illegal, but `List<Integer>` works):

```java
public class Main {
    public static void main(String[] args) {
        // Autoboxing: primitive → wrapper object (automatic)
        Integer boxed = 42;           // auto-boxes int to Integer
        int unboxed = boxed;          // auto-unboxes Integer to int

        // Useful methods on wrapper classes
        System.out.println("Max int: " + Integer.MAX_VALUE);
        System.out.println("Min int: " + Integer.MIN_VALUE);
        System.out.println("Parse: " + Integer.parseInt("123"));
        System.out.println("Binary: " + Integer.toBinaryString(255));
        System.out.println("Hex: " + Integer.toHexString(255));

        // Autoboxing can cause subtle bugs — null unboxing throws NullPointerException
        Integer maybeNull = null;
        try {
            int bad = maybeNull;  // NullPointerException!
        } catch (NullPointerException e) {
            System.out.println("Caught NullPointerException from unboxing null");
        }
    }
}
```

Autoboxing is convenient but has a performance cost — each `Integer` object is a heap allocation with a reference. In performance-critical code, prefer primitives. In most application code, the clarity of using `List<Integer>` outweighs the overhead.
