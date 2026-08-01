---
series: java-fundamentals
level: 10
title: Exceptions
lang: java
---

# Exceptions

Level 2 already caught `ArrayIndexOutOfBoundsException` without fully explaining the mechanism. This lesson names it directly: Java's real way of signaling "something went wrong," letting code decide, explicitly, what to do about it — rather than the program simply crashing outright, or silently continuing with a nonsense value.

## try, catch, and finally

```java
public class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        } finally {
            System.out.println("Finally runs");
        }
    }
}
```

```text
Caught: / by zero
Finally runs
```

`10 / 0` — integer division by zero throws an `ArithmeticException` in Java (unlike floating-point division by zero, which produces `Infinity` instead of throwing — a real, easy-to-forget distinction).

`try { ... }` — wraps code that might throw. The instant `10 / 0` throws, the rest of the `try` block is skipped entirely — execution jumps straight to a matching `catch`.

`catch (ArithmeticException e) { ... }` — runs only if the thrown exception matches (or is a subtype of) `ArithmeticException`. `e` is the actual exception object; `e.getMessage()` returns its description (`"/ by zero"` here).

`finally { ... }` — runs *no matter what*: whether the `try` succeeded, an exception was caught, or even an exception was never caught at all and propagated further. `finally` exists for cleanup that absolutely must happen either way (closing a file, releasing a resource) — Level 21's own file-handling material relies on exactly this guarantee.

## Throwing an Exception on Purpose

```java
public class Main {
    static void checkAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative: " + age);
        }
    }

    public static void main(String[] args) {
        try {
            checkAge(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

```text
Caught: Age cannot be negative: -5
```

`throw new IllegalArgumentException("...")` — creates a new exception object and immediately raises it, stopping normal execution right there — the rest of `checkAge` never runs, and control jumps to the nearest matching `catch`, wherever it is (here, directly back in `main`).

`IllegalArgumentException` — one of several standard exception types in `java.lang`, chosen because it names exactly what went wrong: a caller passed an argument that isn't valid. Choosing a specific, well-named built-in exception type over a generic one gives every `catch` block downstream real information to act on.

## Checked Exceptions and Custom Exception Types

```java
class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

public class Main {
    static void withdraw(double balance, double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException("Cannot withdraw " + amount + " from balance " + balance);
        }
    }

    public static void main(String[] args) {
        try {
            withdraw(100.0, 500.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

```text
Caught: Cannot withdraw 500.0 from balance 100.0
```

`class InsufficientFundsException extends Exception` — a real, custom exception type (Level 11 covers `extends`/inheritance in full — the shape here is a preview). `super(message)` passes the message up to `Exception`'s own constructor, which is what makes `.getMessage()` return it later.

`throws InsufficientFundsException` on `withdraw`'s own signature — required here specifically because `InsufficientFundsException extends Exception` (not `RuntimeException`). This makes it a **checked exception**: the compiler forces every method that might let one escape to either `catch` it or declare it with `throws`, and forces every *caller* of `withdraw` to do the same — `withdraw(100.0, 500.0);` with no surrounding `try`/`catch` and no `throws` on `main` would be a compile error, not just a runtime risk.

## Unchecked Exceptions

```java
public class Main {
    public static void main(String[] args) {
        try {
            String s = null;
            System.out.println(s.length());
        } catch (NullPointerException e) {
            System.out.println("Caught NPE");
        }

        try {
            Object o = "hello";
            Integer i = (Integer) o;
        } catch (ClassCastException e) {
            System.out.println("Caught CCE");
        }
    }
}
```

```text
Caught NPE
Caught CCE
```

`s.length()` where `s` is `null` — throws `NullPointerException`: calling any method on a reference that points at nothing. `(Integer) o` where `o` actually holds a `String` — throws `ClassCastException`: an invalid cast between incompatible types, caught only at runtime, not by the compiler.

Neither of these needed a `throws` clause anywhere, and neither would have caused a compile error if left uncaught entirely — both are **unchecked exceptions**, extending `RuntimeException` rather than `Exception` directly. `ArithmeticException`, `ArrayIndexOutOfBoundsException` (Level 2), `IllegalArgumentException`, `NullPointerException`, and `ClassCastException` are all unchecked; `InsufficientFundsException` above, by choosing to `extend Exception` instead, opted into the stricter, checked behavior.

**SE lens:** The real design question when writing a custom exception is checked vs. unchecked — `extends Exception` vs. `extends RuntimeException`. Checked exceptions fit failures a *caller* can reasonably be expected to recover from and should be forced to think about (insufficient funds, a file that doesn't exist) — the compiler-enforced `throws` is a real, deliberate feature, not friction. Unchecked exceptions fit programming mistakes the caller shouldn't need to catch everywhere just in case (`NullPointerException`, `ArrayIndexOutOfBoundsException`) — forcing every method that could theoretically dereference `null` to declare it would make `throws` clauses balloon uselessly across an entire codebase, defeating the purpose. Java's own standard library makes exactly this split, and it's worth following rather than defaulting to one or the other out of habit.

## Challenge: safe_divide

Write a `static int safeDivide(int a, int b)` method that returns `a / b`, but catches `ArithmeticException` and returns `-1` instead of letting it propagate when `b` is `0`.

```challenge
static int safeDivide(int a, int b) {
    // TODO
}
```

```test
assert safeDivide(10, 2) == 5
assert safeDivide(10, 0) == -1
assert safeDivide(0, 5) == 0
assert safeDivide(-9, 3) == -3
```
