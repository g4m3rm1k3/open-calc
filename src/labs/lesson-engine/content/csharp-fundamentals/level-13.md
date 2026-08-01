---
series: csharp-fundamentals
level: 13
title: Nullable Types
lang: csharp
---

# Nullable Types

Level 5 established that value types like `int` always hold a real value — never "nothing." That's usually correct, but sometimes "no value at all" is a genuinely real, valid state — an `Age` that was never entered, a `MiddleName` nobody has. C# provides `?` to let a value type hold `null` on purpose, plus two operators for working with the result safely.

## int? — A Nullable Value Type

```csharp
using System;

class Program
{
    static void Main()
    {
        int? age = null;
        Console.WriteLine(age.HasValue);

        age = 30;
        Console.WriteLine(age.HasValue);
        Console.WriteLine(age.Value);
    }
}
```

```text
False
True
30
```

`int? age = null;` — `int?` means "an `int`, or `null`." Plain `int` (Level 0) can never be `null` — this is real, new capability the `?` adds.

`age.HasValue` — `true` if `age` currently holds a real number, `false` if it's `null`.

`age.Value` — the actual number, only safe to read when `HasValue` is `true`.

## Reading .Value on null Throws

```csharp
using System;

class Program
{
    static void Main()
    {
        int? x = null;
        try
        {
            Console.WriteLine(x.Value);
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine("Caught: " + ex.GetType().Name);
        }
    }
}
```

```text
Caught: InvalidOperationException
```

`x.Value` when `x` is `null` — throws a real `InvalidOperationException` rather than returning some meaningless default number. `.Value` is only ever safe after checking `.HasValue` is `true` first — reading it unconditionally is a real, common bug.

## ?? — The Null-Coalescing Operator

```csharp
using System;

class Program
{
    static void Main()
    {
        int? age = null;
        Console.WriteLine(age ?? -1);

        age = 25;
        Console.WriteLine(age ?? -1);
    }
}
```

```text
-1
25
```

`age ?? -1` — reads as "`age`, or `-1` if `age` is `null`." A safe, one-line alternative to checking `.HasValue` and choosing a fallback by hand — never throws, regardless of whether `age` is `null`.

## ?. — The Null-Conditional Operator

```csharp
using System;

class Person
{
    public string Name;
}

class Program
{
    static void Main()
    {
        Person p = null;
        Console.WriteLine(p?.Name ?? "no person");

        p = new Person { Name = "Alice" };
        Console.WriteLine(p?.Name ?? "no person");
    }
}
```

```text
no person
Alice
```

`new Person { Name = "Alice" }` — an **object initializer**: creates a `Person` and sets `Name` in one expression, without writing a separate constructor for it.

`p?.Name` — reads as "`p`'s `Name`, or `null`, if `p` itself is `null`." Ordinary `p.Name` on a `null` reference would throw a `NullReferenceException` immediately; `?.` checks for `null` first and short-circuits to `null` instead of throwing, exactly the way `&&`'s short-circuiting (Level 1) skips its right-hand side.

`p?.Name ?? "no person"` — the two operators combined: "get `p`'s `Name` safely, or fall back to `\"no person\"` if either `p` itself, or `p`'s `Name`, turns out to be `null`."

## Nullable Arithmetic Propagates null

```csharp
using System;

class Program
{
    static void Main()
    {
        int? a = 5;
        int? b = null;
        int? sum = a + b;
        Console.WriteLine(sum.HasValue);

        int? c = 5;
        int? d = 10;
        int? sum2 = c + d;
        Console.WriteLine(sum2);
    }
}
```

```text
False
15
```

`a + b` where `b` is `null` — the result is `null` too, not an exception and not a wrong number. Any arithmetic involving a `null` nullable operand automatically produces `null` — C#'s way of saying "the answer is genuinely unknown, since one of the inputs was."

**SE lens:** Nullable value types exist specifically to distinguish "the value is genuinely zero" from "the value was never provided." An `int Age = 0` cannot tell those two states apart; `int? Age = null` can — a real, meaningful difference for anything backed by a database or a form a user might leave blank.

## Challenge: describe_score

Write a `static string DescribeScore(int? score)` method:
- If `score` is `null`, return `"Not attempted"`.
- If `score` is `50` or above, return `"Pass: " + score`.
- Otherwise, return `"Fail: " + score`.

```challenge
static string DescribeScore(int? score)
{
    // TODO
}
```

```test
assert DescribeScore(null) == "Not attempted"
assert DescribeScore(75) == "Pass: 75"
assert DescribeScore(50) == "Pass: 50"
assert DescribeScore(49) == "Fail: 49"
assert DescribeScore(0) == "Fail: 0"
```
