# Control Flow: Decisions and the Switch Expression

Every program beyond "Hello World" needs to make decisions. The CPU at the hardware level understands exactly one kind of decision: a conditional jump — "if this value is zero, go here; otherwise, continue." Everything you write in Java's `if`, `else`, and `switch` blocks compiles down to variations of this single primitive instruction. Understanding that underlying simplicity helps explain both the power and the performance characteristics of branching code.

Java's control flow borrowed heavily from C. But where C made everything optional (no mandatory braces, implicit fall-through), Java has evolved. Modern Java — particularly Java 14 and beyond — introduced the **switch expression**, a genuinely new construct that eliminates some of C's most notorious gotchas.

## The `if` Statement

```java
public class Main {
    public static void main(String[] args) {
        int temperature = 22;

        if (temperature > 30) {
            System.out.println("Hot");
        } else if (temperature > 20) {
            System.out.println("Comfortable");
        } else if (temperature > 10) {
            System.out.println("Cool");
        } else {
            System.out.println("Cold");
        }

        // Condition must be boolean — unlike C++, integers are NOT truthy
        int n = 5;
        // if (n) { ... }  // Compile error! int is not boolean
        if (n != 0) {
            System.out.println("n is non-zero");
        }
    }
}
```

One important difference from C++: Java's `if` condition **must be a `boolean`** expression. There is no truthiness for integers. `if (n)` is a compile error — you must write `if (n != 0)`. This eliminates the entire class of bugs where `if (x = 5)` accidentally assigns instead of comparing (in Java, `x = 5` is an `int`, not a `boolean`, so it won't compile in an `if` condition).

## Nested `if` and the Dangling Else

The classic dangling else problem exists in Java too:

```java
public class Main {
    public static void main(String[] args) {
        int x = 5;
        int limit = 10;

        // Without braces: ambiguous indentation
        if (x > 0)
            if (x > limit)
                System.out.println("Large");
        else
            System.out.println("Non-positive?");  // Actually belongs to inner if!

        // With braces: unambiguous
        if (x > 0) {
            if (x > limit) {
                System.out.println("Large");
            }
        } else {
            System.out.println("Non-positive");
        }

        // Google, Oracle, and Sun style guides: ALWAYS use braces
    }
}
```

Every major Java style guide — Google's, Oracle's, the classic Sun coding conventions — mandates braces on every `if` body, even single-statement ones. The historical reason: in 2014, Apple's goto fail vulnerability was caused by a missing brace in a C `if` statement. A line of code unintentionally fell outside the conditional, causing a critical SSL certificate check to always succeed.

## The Classic `switch` Statement

Java inherited C's `switch` with fall-through. The rules: `switch` works on `int`, `char`, `String` (since Java 7), and `enum`; each `case` falls through to the next unless `break` stops it:

```java
public class Main {
    public static void main(String[] args) {
        int day = 3;

        switch (day) {
            case 1:
                System.out.println("Monday");
                break;
            case 2:
                System.out.println("Tuesday");
                break;
            case 3:
                System.out.println("Wednesday");
                break;
            case 4:
            case 5:
                System.out.println("Thursday or Friday");  // fall-through intentional
                break;
            case 6:
            case 7:
                System.out.println("Weekend!");
                break;
            default:
                System.out.println("Invalid day");
        }

        // switch on String (Java 7+)
        String lang = "Java";
        switch (lang) {
            case "Java":
                System.out.println("Runs on JVM");
                break;
            case "Python":
                System.out.println("Interpreted");
                break;
            default:
                System.out.println("Unknown language");
        }
    }
}
```

## The Switch Expression: Java 14's Big Improvement

Java 14 made **switch expressions** a permanent feature. They solve fall-through (using `->` arrows instead of cases with breaks) and produce a value:

```java
public class Main {
    public static void main(String[] args) {
        // Switch expression with arrow labels — no fall-through, no break needed
        int day = 3;
        String dayName = switch (day) {
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            case 4 -> "Thursday";
            case 5 -> "Friday";
            case 6 -> "Saturday";
            case 7 -> "Sunday";
            default -> "Invalid";
        };
        System.out.println("Day: " + dayName);

        // Switch expression with blocks (when you need multiple statements)
        int score = 85;
        String grade = switch (score / 10) {
            case 10, 9 -> "A";
            case 8     -> "B";
            case 7     -> "C";
            case 6     -> "D";
            default    -> {
                System.out.println("Below passing threshold");
                yield "F";  // 'yield' returns a value from a block
            }
        };
        System.out.println("Grade: " + grade);

        // Exhaustiveness: with enums, compiler checks all cases are covered
        var season = Season.SUMMER;
        String desc = switch (season) {
            case SPRING -> "Flowers blooming";
            case SUMMER -> "Hot days";
            case AUTUMN -> "Leaves falling";
            case WINTER -> "Cold nights";
        };
        System.out.println(desc);
    }

    enum Season { SPRING, SUMMER, AUTUMN, WINTER }
}
```

The switch expression is one of the best quality-of-life improvements in recent Java. The `->` arrow syntax:
- Makes each case a separate, isolated expression — no fall-through
- Returns a value directly — no need to declare a variable outside the switch and assign inside
- Requires exhaustiveness when used with enums — the compiler verifies all cases are covered

## The Ternary Operator for Simple Conditions

For simple two-way decisions, the ternary operator is more concise than `if/else`:

```java
public class Main {
    public static void main(String[] args) {
        int n = 15;

        // if/else version
        String result;
        if (n % 2 == 0) {
            result = "even";
        } else {
            result = "odd";
        }

        // Ternary version — same semantics, one line
        String result2 = (n % 2 == 0) ? "even" : "odd";

        System.out.println(n + " is " + result2);

        // Chained ternary — readable with formatting
        int score = 77;
        String letter =
            score >= 90 ? "A" :
            score >= 80 ? "B" :
            score >= 70 ? "C" :
            score >= 60 ? "D" : "F";
        System.out.println("Letter grade: " + letter);

        // Ternary in println — common pattern
        System.out.println("abs(" + n + ") = " + (n >= 0 ? n : -n));
    }
}
```

## Pattern Matching with `instanceof` (Java 16+)

Java 16 introduced pattern matching for `instanceof`, eliminating a tedious pattern:

```java
public class Main {
    public static void main(String[] args) {
        Object obj = "Hello, Java!";

        // Old way — verbose
        if (obj instanceof String) {
            String s = (String) obj;  // explicit cast after instanceof check
            System.out.println("Old: " + s.toUpperCase());
        }

        // New way (Java 16+) — pattern variable declared inline
        if (obj instanceof String s) {
            System.out.println("New: " + s.toUpperCase());
        }

        // Pattern matching in a real scenario
        printDescription(42);
        printDescription("hello");
        printDescription(3.14);
        printDescription(true);
    }

    static void printDescription(Object obj) {
        if (obj instanceof Integer i) {
            System.out.println("Integer: " + i + ", squared = " + (i * i));
        } else if (obj instanceof String s) {
            System.out.println("String: \"" + s + "\", length = " + s.length());
        } else if (obj instanceof Double d) {
            System.out.println("Double: " + d + ", rounded = " + Math.round(d));
        } else {
            System.out.println("Other: " + obj);
        }
    }
}
```

Pattern matching is part of Java's ongoing modernization. Java 21's **sealed classes** and **pattern matching for switch** take this even further, enabling fully exhaustive deconstruction of algebraic data types — bringing Haskell and Scala-style programming into Java's mainstream.
