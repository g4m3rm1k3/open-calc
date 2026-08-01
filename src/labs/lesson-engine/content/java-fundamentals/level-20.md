---
series: java-fundamentals
level: 20
title: Varargs, Overloading & Static Imports
lang: java
---

# Varargs, Overloading & Static Imports

`System.out.printf` (Level 0) has always accepted a variable number of trailing arguments without this course explaining how. This lesson covers **varargs** — methods that accept any number of arguments of one type — **method overloading**, and **static imports**, the mechanism behind Level 0's own unqualified `System.out.println` companion, a fully bare `sqrt(...)`.

## Varargs — Any Number of Arguments

```java
public class Main {
    static int sum(int... nums) {
        int total = 0;
        for (int n : nums) total += n;
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum());
        System.out.println(sum(5));
        System.out.println(sum(1, 2, 3));
        System.out.println(sum(1, 2, 3, 4, 5));
    }
}
```

```text
0
5
6
15
```

`int... nums` — the `...` marks `nums` as a **varargs** parameter: the caller can pass zero, one, or any number of `int` arguments, and Java collects them into a real `int[]` (`nums` behaves exactly like the arrays from Level 2 inside the method body — `nums.length`, `nums[0]`, the enhanced `for` loop all work identically).

`sum()` — zero arguments produce an empty array, `total` stays `0`. `sum(1, 2, 3, 4, 5)` — five arguments collected into a `5`-element array. A varargs parameter must be the *last* parameter in a method's signature — `int... nums` followed by anything else would be ambiguous about where the variable-length part ends.

## Method Overloading

```java
public class Main {
    static void print(int n) { System.out.println("int: " + n); }
    static void print(double d) { System.out.println("double: " + d); }
    static void print(String s) { System.out.println("String: " + s); }
    static void print(int a, int b) { System.out.println("two ints: " + a + ", " + b); }

    public static void main(String[] args) {
        print(5);
        print(5.0);
        print("hello");
        print(1, 2);
    }
}
```

```text
int: 5
double: 5.0
String: hello
two ints: 1, 2
```

Four separate methods, all named `print` — **overloading**: the same name, genuinely different parameter lists (different types, or a different count). The compiler picks which one to actually run based on the arguments at each call site — `print(5)` matches `print(int n)` specifically because `5` is an `int` literal, `print(5.0)` matches the `double` version because of the decimal point.

This is real, compile-time resolution, not a runtime decision — unlike Level 11's dynamic dispatch (which version of an *overridden* method runs, decided by the object's real type at runtime), overload resolution for `print(...)` is settled the moment the code compiles, based purely on the argument types visible at that call site.

**SE lens:** Overloading is the right tool when several operations are conceptually "the same action," just on different input shapes — `print` really does mean the same thing here regardless of what's being printed. It stops being the right tool the moment the different versions do genuinely unrelated things under a shared name — that's not overloading serving readability anymore, it's the same name hiding several different behaviors, which makes call sites harder to reason about, not easier.

## Static Imports

```java
import static java.lang.Math.*;

public class Main {
    public static void main(String[] args) {
        System.out.println(sqrt(16));
        System.out.println(max(3, 7));
        System.out.println(PI > 3);
    }
}
```

```text
4.0
7
true
```

`import static java.lang.Math.*;` — Level 0 always wrote `Math.sqrt(...)`, `Math.PI`, with the class name spelled out every time. A **static import** brings a class's own `static` members directly into scope, unqualified — `sqrt(16)` instead of `Math.sqrt(16)`, `PI` instead of `Math.PI`.

`import static java.lang.Math.*;` — the `*` imports every static member of `Math` at once; a more targeted `import static java.lang.Math.sqrt;` would bring in only `sqrt` by itself, leaving `PI` and `max` still requiring their `Math.` prefix.

**SE lens:** A regular `import` (Level 6) shortens a *class* name; a static import shortens a *member* name — a real, further step that trades explicitness for brevity. It reads best for a small set of extremely well-known utility methods used constantly in one file (`Math`'s own members are the textbook case) — used broadly across many different classes' static members in the same file, it starts to genuinely hurt readability: `max(3, 7)` alone gives no hint which class `max` actually came from, something `Math.max(3, 7)` never left in doubt.

## Challenge: sum

Write a `static int sum(int... nums)` method using varargs, and an *overload*, `static String sum(String a, String b)`, that concatenates two strings.

```challenge
static int sum(int... nums) {
    // TODO
}

static String sum(String a, String b) {
    // TODO
}
```

```test
assert sum() == 0
assert sum(5) == 5
assert sum(1, 2, 3) == 6
assert sum("a", "b").equals("ab")
```
