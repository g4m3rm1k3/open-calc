# Operators and Expressions

Java's operators are almost identical to C's — Gosling borrowed the syntax wholesale to make the language familiar to C and C++ programmers. But familiarity masks some important differences in behavior. Integer division still truncates. Modulo still follows the sign of the dividend. But Java adds operator behavior that C++ doesn't have — like string concatenation with `+` — and lacks some that C++ has, like operator overloading for user-defined types.

Understanding operators means understanding not just the syntax but the edge cases that trip up even experienced programmers.

## Arithmetic Operators

```java
public class Main {
    public static void main(String[] args) {
        int a = 10, b = 3;

        System.out.println("a + b = " + (a + b));   // 13
        System.out.println("a - b = " + (a - b));   // 7
        System.out.println("a * b = " + (a * b));   // 30
        System.out.println("a / b = " + (a / b));   // 3 (truncation!)
        System.out.println("a % b = " + (a % b));   // 1

        // Integer overflow: Java does NOT throw an exception
        // It wraps silently (same as C++, but defined behavior in Java)
        int max = Integer.MAX_VALUE;
        System.out.println("MAX_VALUE + 1 = " + (max + 1));  // -2147483648 (wraps)

        // Use long for large values
        long bigProduct = (long)max * max;  // Cast first to avoid int overflow
        System.out.println("MAX^2 = " + bigProduct);
    }
}
```

A critical difference from C++: integer overflow in Java is **defined** behavior — it always wraps. In C++, signed integer overflow is undefined behavior. Java's specification is precise: `int` arithmetic is always 32-bit two's-complement with wrapping. This removes a class of C++ undefined behavior, at the cost of making silent overflow bugs equally silent.

## The `+` Operator and String Concatenation

Java overloads `+` for strings at the language level:

```java
public class Main {
    public static void main(String[] args) {
        // String + String
        String first = "Hello";
        String second = "World";
        System.out.println(first + ", " + second + "!");

        // String + anything = String
        int x = 42;
        System.out.println("x = " + x);   // "x = 42"

        // Evaluation order matters!
        System.out.println("Sum: " + 1 + 2);   // "Sum: 12" — NOT "Sum: 3"!
        System.out.println("Sum: " + (1 + 2)); // "Sum: 3" — parentheses force arithmetic first

        // Once a + chain hits a String, everything after is concatenation
        System.out.println(1 + 2 + " is three");   // "3 is three" — 1+2 first, then concat
        System.out.println("three is " + 1 + 2);   // "three is 12" — left to right
    }
}
```

The evaluation order trap is real. `"Sum: " + 1 + 2` evaluates left-to-right: `"Sum: " + 1` = `"Sum: 1"`, then `"Sum: 1" + 2` = `"Sum: 12"`. Always parenthesize arithmetic inside string concatenation.

Under the hood, Java compiles repeated `+` concatenation to `StringBuilder.append()` calls, so there's no string allocation per `+` for simple cases. But inside a loop, repeated `+` creates many temporary strings — use `StringBuilder` directly for performance.

## Relational and Equality Operators

```java
public class Main {
    public static void main(String[] args) {
        int a = 10, b = 20;

        System.out.println(a == b);  // false
        System.out.println(a != b);  // true
        System.out.println(a <  b);  // true
        System.out.println(a >  b);  // false
        System.out.println(a <= b);  // true
        System.out.println(a >= b);  // false

        // WARNING: == on objects compares references, not content
        String s1 = new String("hello");
        String s2 = new String("hello");
        System.out.println(s1 == s2);      // false — different objects
        System.out.println(s1.equals(s2)); // true  — same content

        // Integer autoboxing trap
        Integer x = 127;
        Integer y = 127;
        System.out.println(x == y);  // true — JVM caches Integer -128 to 127

        Integer p = 1000;
        Integer q = 1000;
        System.out.println(p == q);  // false — outside cache range, different objects!
        System.out.println(p.equals(q));  // true — always use equals for objects
    }
}
```

The Integer cache is a notorious gotcha. The JVM specification requires that `Integer` objects for values -128 through 127 be cached and reused, so `==` accidentally works for small values. For values outside this range, `==` compares references and fails. The rule: **never use `==` to compare objects**. Always `.equals()`.

## Logical Operators and Short-Circuit Evaluation

```java
public class Main {
    public static void main(String[] args) {
        boolean t = true, f = false;

        // Standard logical operators
        System.out.println(t && f);  // false (AND)
        System.out.println(t || f);  // true  (OR)
        System.out.println(!t);      // false (NOT)

        // Short-circuit: right side not evaluated if result already determined
        String s = null;
        // Safe: if s is null, s.isEmpty() is never called
        if (s != null && !s.isEmpty()) {
            System.out.println("Non-empty string");
        } else {
            System.out.println("Null or empty");
        }

        // Non-short-circuit operators (rare use — usually avoid these)
        // & and | always evaluate both sides
        int counter = 0;
        boolean result = (counter++ > 0) && (counter++ > 0);
        System.out.println("counter with &&: " + counter);  // 1 (second ++ skipped)

        counter = 0;
        result = (counter++ > 0) & (counter++ > 0);
        System.out.println("counter with &: " + counter);   // 2 (both sides evaluated)
    }
}
```

## Bitwise Operators

Java supports the same bitwise operators as C++, with one important addition for unsigned right shift:

```java
public class Main {
    public static void main(String[] args) {
        int a = 0b11001010;  // 202

        System.out.println("a         = " + Integer.toBinaryString(a));
        System.out.println("a & 0xF0  = " + Integer.toBinaryString(a & 0xF0));  // AND with mask
        System.out.println("a | 0x0F  = " + Integer.toBinaryString(a | 0x0F));  // OR
        System.out.println("a ^ 0xFF  = " + Integer.toBinaryString(a ^ 0xFF));  // XOR (flip all)
        System.out.println("~a        = " + Integer.toBinaryString(~a));         // NOT
        System.out.println("a << 2    = " + Integer.toBinaryString(a << 2));    // Left shift
        System.out.println("a >> 2    = " + Integer.toBinaryString(a >> 2));    // Signed right shift
        System.out.println("a >>> 2   = " + Integer.toBinaryString(a >>> 2));   // Unsigned right shift

        // Real use: packing flags into an int
        final int READ    = 1;
        final int WRITE   = 2;
        final int EXECUTE = 4;

        int perms = READ | WRITE;  // 3 (011)
        System.out.println("Can read: "    + ((perms & READ)    != 0));
        System.out.println("Can write: "   + ((perms & WRITE)   != 0));
        System.out.println("Can execute: " + ((perms & EXECUTE) != 0));
    }
}
```

Java's `>>>` is the **unsigned right shift** — it fills the leftmost bits with zeros regardless of the sign bit. `>>` is the signed right shift, which preserves the sign bit (filling with 0 for positive, 1 for negative). C++ has only arithmetic right shift (implementation-defined for negative values). Java's `>>>` is useful for bit manipulation code that works with 32-bit or 64-bit patterns regardless of sign.

## Increment, Compound Assignment, and the Ternary Operator

```java
public class Main {
    public static void main(String[] args) {
        // Pre and post increment
        int x = 5;
        System.out.println(x++);  // prints 5, then x becomes 6
        System.out.println(++x);  // x becomes 7, then prints 7
        System.out.println(x);    // 7

        // Compound assignment
        int n = 100;
        n += 50;   // 150
        n -= 30;   // 120
        n *= 2;    // 240
        n /= 4;    // 60
        n %= 7;    // 4
        System.out.println("n = " + n);

        // Ternary operator
        int score = 85;
        String grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "D";
        System.out.println("Grade: " + grade);

        // Useful in output
        int value = -5;
        System.out.println(value + " is " + (value >= 0 ? "non-negative" : "negative"));
    }
}
```

## Operator Precedence

Java's operator precedence follows the same rules as C. When in doubt, parenthesize:

```java
public class Main {
    public static void main(String[] args) {
        // Precedence surprises
        System.out.println(2 + 3 * 4);        // 14, not 20
        System.out.println(10 - 3 - 2);       // 5 (left-associative)
        System.out.println(true || false && false);  // true (&& binds tighter than ||)
        System.out.println((true || false) && false); // false (parentheses change it)

        // Classic mistake: missing parentheses in conditions
        int a = 5, b = 10, c = 3;
        boolean wrong   = a + b > c && b - a < c;  // might be confusing
        boolean clear   = ((a + b) > c) && ((b - a) < c);  // explicitly parenthesized
        System.out.println(wrong + " == " + clear);  // both true, but second is readable
    }
}
```

Good Java style: use parentheses whenever mixing arithmetic and logical operators, even when the precedence is technically correct. Code that a reader can verify at a glance is worth far more than code that saves three characters.
