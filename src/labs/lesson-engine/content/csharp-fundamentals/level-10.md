---
series: csharp-fundamentals
level: 10
title: Exceptions
lang: csharp
---

# Exceptions

Level 2 already caught a real `IndexOutOfRangeException` without ever explaining the mechanism behind it. This lesson names it directly: an **exception** is a real object, thrown when something goes wrong, that unwinds the normal flow of execution until something catches it — or the program crashes if nothing does.

## try / catch

```csharp
using System;

class Program
{
    static void Main()
    {
        try
        {
            int[] nums = { 1, 2, 3 };
            Console.WriteLine(nums[10]);
        }
        catch (IndexOutOfRangeException ex)
        {
            Console.WriteLine("Caught: " + ex.Message);
        }
        Console.WriteLine("Program continues");
    }
}
```

```text
Caught: Index was outside the bounds of the array.
Program continues
```

`try { ... }` — code that might throw an exception. The moment `nums[10]` fails, execution inside the `try` block stops immediately — the `Console.WriteLine` call never even starts running.

`catch (IndexOutOfRangeException ex) { ... }` — runs only if an exception of this exact type (or a type derived from it) was thrown inside the `try` block. `ex` is the real, actual exception object — `ex.Message` is a real, human-readable description of what went wrong, built into every exception.

`Console.WriteLine("Program continues");`, after the whole `try`/`catch` — runs normally. Catching an exception genuinely stops the crash; the program's flow resumes right after the `catch` block, not at the point that failed.

## finally — Always Runs

```csharp
using System;

class Program
{
    static void Main()
    {
        try
        {
            throw new InvalidOperationException("Something went wrong");
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine("Caught: " + ex.Message);
        }
        finally
        {
            Console.WriteLine("Finally always runs");
        }
    }
}
```

```text
Caught: Something went wrong
Finally always runs
```

`throw new InvalidOperationException("...")` — creates a real exception object and throws it immediately, on purpose — the same thing that happened silently inside the array's own indexing code in the previous example, now written out explicitly.

`finally { ... }` — runs after the `try`/`catch` is completely finished, whether an exception was thrown or not, whether it was caught or not. `finally` exists specifically for cleanup that absolutely must happen either way — closing a file, releasing a lock — regardless of whether the code above it succeeded.

## Throwing Your Own Exceptions

```csharp
using System;

class Program
{
    static int Divide(int a, int b)
    {
        if (b == 0) throw new DivideByZeroException("Cannot divide by zero");
        return a / b;
    }

    static void Main()
    {
        try
        {
            Console.WriteLine(Divide(10, 2));
            Console.WriteLine(Divide(10, 0));
        }
        catch (DivideByZeroException ex)
        {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}
```

```text
5
Error: Cannot divide by zero
```

`if (b == 0) throw new DivideByZeroException("...")` — a method can refuse to do its job and throw instead, the moment it detects bad input, rather than returning a meaningless or wrong value. `Divide(10, 0)` never reaches `return a / b;` at all — the `throw` line ends the method immediately, exactly the way `return` does, except by raising an error instead of producing a value.

`Divide(10, 2)` still prints `5` — the `throw` inside `Divide(10, 0)` on the *next* line doesn't retroactively affect the call that already succeeded.

## Custom Exception Types

```csharp
using System;

class NegativeAgeException : Exception
{
    public NegativeAgeException(string message) : base(message) { }
}

class Program
{
    static void SetAge(int age)
    {
        if (age < 0) throw new NegativeAgeException("Age cannot be negative: " + age);
        Console.WriteLine("Age set to " + age);
    }

    static void Main()
    {
        try
        {
            SetAge(25);
            SetAge(-5);
        }
        catch (NegativeAgeException ex)
        {
            Console.WriteLine("Caught custom exception: " + ex.Message);
        }
    }
}
```

```text
Age set to 25
Caught custom exception: Age cannot be negative: -5
```

`class NegativeAgeException : Exception` — a real, brand-new exception type, distinguishable from `IndexOutOfRangeException`, `DivideByZeroException`, or any other exception by its own type name — a `catch (NegativeAgeException ex)` will never accidentally catch an unrelated error.

`: base(message)` — forwards `message` to `Exception`'s own constructor, exactly the way this project's own `Account` constructor (Level 7) could forward values — so `ex.Message` still works normally on the custom type.

**SE lens:** A custom exception type exists to make a `catch` block precise. `catch (Exception ex)` would catch *any* problem at all — a real bug in unrelated code, a null reference, anything — and a caller reacting to `NegativeAgeException` specifically has no way to know its handler just silently swallowed something completely different. Naming the exact exception type, both when throwing and when catching, keeps error handling honest about exactly which failure it's actually prepared for.

## Challenge: safe_divide

Write a `static int SafeDivide(int a, int b)` method that returns `a / b`, but catches any `DivideByZeroException` internally and returns `0` instead of letting it propagate.

```challenge
static int SafeDivide(int a, int b)
{
    // TODO
}
```

```test
assert SafeDivide(10, 2) == 5
assert SafeDivide(9, 3) == 3
assert SafeDivide(10, 0) == 0
assert SafeDivide(0, 5) == 0
assert SafeDivide(-10, 2) == -5
```
