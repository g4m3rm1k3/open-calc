---
series: java-fundamentals
level: 22
title: Unit Testing Basics
lang: java
---

# Unit Testing Basics

Every challenge in this entire course has been checked by a real `assert` — a line stating exactly what a correct answer looks like, run automatically, reporting pass or fail. That is, in miniature, exactly what a professional **unit test** does. This lesson names the pattern directly and builds a small, real test structure by hand — the same shape real frameworks like JUnit and TestNG use, dressed in their own annotations and assertion classes.

## Arrange, Act, Assert

```java
public class Main {
    static int passCount = 0;
    static int failCount = 0;

    static void checkEqual(Object expected, Object actual, String testName) {
        if (java.util.Objects.equals(expected, actual)) {
            passCount++;
            System.out.println("PASS: " + testName);
        } else {
            failCount++;
            System.out.println("FAIL: " + testName + " (expected " + expected + ", got " + actual + ")");
        }
    }

    static int add(int a, int b) { return a + b; }

    public static void main(String[] args) {
        checkEqual(5, add(2, 3), "add positive numbers");
        checkEqual(0, add(-5, 5), "add resulting in zero");
        checkEqual(-2, add(-1, -1), "add negative numbers");
        System.out.println(passCount + " passed, " + failCount + " failed");
    }
}
```

```text
PASS: add positive numbers
PASS: add resulting in zero
PASS: add negative numbers
3 passed, 0 failed
```

Every one of these three checks follows the same, standard three-part shape:
- **Arrange** — set up the inputs (`2, 3`, or `-5, 5`, or `-1, -1`).
- **Act** — call the real code being tested (`add(...)`).
- **Assert** — state what the correct result should be, and let a real comparison decide pass or fail, rather than eyeballing printed output.

`checkEqual(expected, actual, testName)` — a small, hand-built version of exactly what a real test framework's own `assertEquals` (JUnit's actual method name) does: compare two values, report which test this was, and keep a running tally.

`java.util.Objects.equals(expected, actual)` — Level 18 covered why `.equals()`, not `==`, is the correct comparison for object content; `Objects.equals` additionally handles the case where `expected` or `actual` might be `null` safely, without throwing.

**SE lens:** This is the exact same discipline the `` ```test `` fence under every challenge in this course already runs, automatically, every time — a real, professional test is nothing more than an assertion, given a name, run without a person needing to read the output and judge for themselves whether it looks right.

## A Test That Deliberately Fails

```java
public class Main {
    static void checkEqual(Object expected, Object actual, String testName) {
        if (java.util.Objects.equals(expected, actual)) {
            System.out.println("PASS: " + testName);
        } else {
            System.out.println("FAIL: " + testName + " (expected " + expected + ", got " + actual + ")");
        }
    }

    static int add(int a, int b) { return a + a; }

    public static void main(String[] args) {
        checkEqual(5, add(2, 3), "add two different numbers");
    }
}
```

```text
FAIL: add two different numbers (expected 5, got 4)
```

`static int add(int a, int b) { return a + a; }` — a real, deliberate bug: adding `a` to itself instead of adding `b`. `add(2, 3)` now returns `4` (`2 + 2`) instead of the real `5`.

`checkEqual` catches this immediately and precisely — not just "something is wrong," but exactly what was expected (`5`) versus what actually happened (`4`), the same real, structured failure message a genuine test framework produces, and the same shape this course's own challenges have shown after every deliberately-broken example.

## Testing That an Exception Is Thrown Correctly

```java
public class Main {
    static int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("divide by zero");
        return a / b;
    }

    public static void main(String[] args) {
        try {
            divide(10, 0);
            System.out.println("FAIL: should have thrown");
        } catch (ArithmeticException e) {
            System.out.println("PASS: divide by zero throws correctly");
        }
    }
}
```

```text
PASS: divide by zero throws correctly
```

Testing "this should fail" needs its own shape: call the code inside a `try`, and treat *reaching the line after the call* as the real failure — if `divide(10, 0)` didn't actually throw, `System.out.println("FAIL: ...")` would run. The `catch` block, by contrast, is where success is reported — the exception was correctly raised, exactly as the real contract promised.

**CS lens:** A genuine unit test suite runs every test in complete isolation from every other — one test's failure never stops the rest from running, exactly the way this course's own challenge tests report every single `assert` line's real result, not just the first failure. This is why `checkEqual` here logs and continues, rather than stopping the whole program the instant one comparison fails.

## What Makes a Good Test

A real, useful test — professional practice, not just a mechanical rule — covers: the ordinary case (`add(2, 3)`), a boundary or zero case (`add(-5, 5)` producing exactly `0`), and a case that should fail predictably (`divide` by `0` throwing). A test suite that only ever checks the easy, obvious case gives real, false confidence — exactly the reasoning behind every "boundary or edge case" assertion this course's own challenges have required since Level 1's very first one.

## Challenge: test_is_positive

Write a `static boolean isPositive(int n)` method that returns whether `n` is strictly greater than `0`. Then write a `static void checkEqual(Object expected, Object actual, String testName)` helper method (a bare static method, following this lesson's own pattern, not wrapped in its own class) that prints `"PASS: " + testName` when `expected` and `actual` are equal, or `"FAIL: " + testName` otherwise. Finally, write a `static void runTests()` method that calls `checkEqual` against at least three real cases for `isPositive`: a positive number, a negative number, and zero.

```challenge
static boolean isPositive(int n) {
    // TODO
}

static void checkEqual(Object expected, Object actual, String testName) {
    // TODO
}

static void runTests() {
    // TODO
}
```

```test
runTests();
assert isPositive(5) == true
assert isPositive(-3) == false
assert isPositive(0) == false
assert isPositive(1) == true
```
