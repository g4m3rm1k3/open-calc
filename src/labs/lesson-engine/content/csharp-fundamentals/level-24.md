---
series: csharp-fundamentals
level: 24
title: Unit Testing Basics
lang: csharp
---

# Unit Testing Basics

Every challenge in this entire course has been checked by a real `assert` — a line stating exactly what a correct answer looks like, run automatically, reporting pass or fail. That is, in miniature, exactly what a professional **unit test** does. This lesson names the pattern directly and builds a small, real test structure by hand — the same shape real frameworks like xUnit, NUnit, and MSTest use, dressed in their own attributes and syntax.

## Arrange, Act, Assert

```csharp
using System;

static class Assert
{
    static int passCount = 0;
    static int failCount = 0;

    public static void AreEqual(object expected, object actual, string testName)
    {
        if (Equals(expected, actual))
        {
            passCount++;
            Console.WriteLine("PASS: " + testName);
        }
        else
        {
            failCount++;
            Console.WriteLine("FAIL: " + testName + " (expected " + expected + ", got " + actual + ")");
        }
    }

    public static void Summary()
    {
        Console.WriteLine(passCount + " passed, " + failCount + " failed");
    }
}

class Calculator
{
    public static int Add(int a, int b) { return a + b; }
}

class Program
{
    static void Main()
    {
        Assert.AreEqual(5, Calculator.Add(2, 3), "Add positive numbers");
        Assert.AreEqual(0, Calculator.Add(-5, 5), "Add resulting in zero");
        Assert.AreEqual(-2, Calculator.Add(-1, -1), "Add negative numbers");
        Assert.Summary();
    }
}
```

```text
PASS: Add positive numbers
PASS: Add resulting in zero
PASS: Add negative numbers
3 passed, 0 failed
```

Every one of these three checks follows the same, standard three-part shape:
- **Arrange** — set up the inputs (`2, 3`, or `-5, 5`, or `-1, -1`).
- **Act** — call the real code being tested (`Calculator.Add(...)`).
- **Assert** — state what the correct result should be, and let a real comparison decide pass or fail, rather than eyeballing printed output.

`Assert.AreEqual(expected, actual, testName)` — a small, hand-built version of exactly what a real test framework's own `Assert.AreEqual` (or `Assert.Equal`, in xUnit specifically) does: compare two values, report which test this was, and keep a running tally.

**SE lens:** This is the exact same discipline the `` ```test `` fence under every challenge in this entire course already runs, automatically, every time — a real, professional test is nothing more than an assertion, given a name, run without a person needing to read the output and judge for themselves whether it looks right.

## A Test That Deliberately Fails

```csharp
using System;

static class Assert
{
    public static void AreEqual(object expected, object actual, string testName)
    {
        if (Equals(expected, actual))
        {
            Console.WriteLine("PASS: " + testName);
        }
        else
        {
            Console.WriteLine("FAIL: " + testName + " (expected " + expected + ", got " + actual + ")");
        }
    }
}

class Calculator
{
    public static int Add(int a, int b) { return a + a; }
}

class Program
{
    static void Main()
    {
        Assert.AreEqual(5, Calculator.Add(2, 3), "Add two different numbers");
    }
}
```

```text
FAIL: Add two different numbers (expected 5, got 4)
```

`Calculator.Add(int a, int b) { return a + a; }` — a real, deliberate bug: adding `a` to itself instead of adding `b`. `Calculator.Add(2, 3)` now returns `4` (`2 + 2`) instead of the real `5`.

`Assert.AreEqual` catches this immediately and precisely — not just "something is wrong," but exactly what was expected (`5`) versus what actually happened (`4`), the same real, structured failure message a genuine test framework produces, and the same shape this course's own challenges have shown after every deliberately-broken example.

## Testing That an Exception Is Thrown Correctly

```csharp
using System;

class Calculator
{
    public static int Divide(int a, int b)
    {
        if (b == 0) throw new DivideByZeroException();
        return a / b;
    }
}

class Program
{
    static void Main()
    {
        try
        {
            Calculator.Divide(10, 0);
            Console.WriteLine("FAIL: DivideByZero should have thrown");
        }
        catch (DivideByZeroException)
        {
            Console.WriteLine("PASS: DivideByZero throws correctly");
        }
    }
}
```

```text
PASS: DivideByZero throws correctly
```

Testing "this should fail" needs its own shape: call the code inside a `try`, and treat *reaching the line after the call* as the real failure — if `Divide(10, 0)` didn't actually throw, `Console.WriteLine("FAIL: ...")` would run. The `catch` block, by contrast, is where success is reported — the exception was correctly raised, exactly as the real contract promised.

**CS lens:** A genuine unit test suite runs every test in complete isolation from every other — one test's failure never stops the rest from running, exactly the way this course's own challenge tests report every single `assert` line's real result, not just the first failure. This is why `Assert.AreEqual` here logs and continues, rather than stopping the whole program the instant one comparison fails.

## What Makes a Good Test

A real, useful test — professional practice, not just a mechanical rule — covers: the ordinary case (`Add(2, 3)`), a boundary or zero case (`Add(-5, 5)` producing exactly `0`), and a case that should fail predictably (`Divide` by `0` throwing). A test suite that only ever checks the easy, obvious case gives real, false confidence — exactly the reasoning behind every "boundary or edge case" assertion this course's own challenges have required since Level 0's very first one.

## Challenge: test_is_positive

Write a `static bool IsPositive(int n)` method that returns whether `n` is strictly greater than `0`. Then write a `static void CheckEqual(object expected, object actual, string testName)` helper method (a bare static method, following this lesson's own `Assert.AreEqual` pattern, but without wrapping it in its own class this time) that prints `"PASS: " + testName` when `expected` and `actual` are equal, or `"FAIL: " + testName` otherwise. Finally, write a `static void RunTests()` method that calls `CheckEqual` against at least three real cases for `IsPositive`: a positive number, a negative number, and zero.

```challenge
static bool IsPositive(int n)
{
    // TODO
}

static void CheckEqual(object expected, object actual, string testName)
{
    // TODO
}

static void RunTests()
{
    // TODO
}
```

```test
RunTests();
assert IsPositive(5) == true
assert IsPositive(-3) == false
assert IsPositive(0) == false
assert IsPositive(1) == true
```
