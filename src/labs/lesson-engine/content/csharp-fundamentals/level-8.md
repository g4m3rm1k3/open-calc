---
series: csharp-fundamentals
level: 8
title: Static Members, const & readonly
lang: csharp
---

# Static Members, const & readonly

`static void Main()` has been in every single example since Level 0, with `static` explained just enough to move on: "belongs to the class, not an instance." This lesson makes that precise, extends it to fields and other methods, and introduces two ways to make a value permanently unchangeable after it's set.

## static Fields Are Shared Across Every Instance

```csharp
using System;

class Counter
{
    public static int InstanceCount = 0;
    public int Id;

    public Counter()
    {
        InstanceCount++;
        Id = InstanceCount;
    }
}

class Program
{
    static void Main()
    {
        var c1 = new Counter();
        var c2 = new Counter();
        var c3 = new Counter();

        Console.WriteLine(c1.Id);
        Console.WriteLine(c2.Id);
        Console.WriteLine(c3.Id);
        Console.WriteLine(Counter.InstanceCount);
    }
}
```

```text
1
2
3
3
```

`public static int InstanceCount = 0;` — exactly **one** copy of `InstanceCount` exists, shared by every `Counter` object ever created — not one copy per instance, the way `Id` (an ordinary, non-`static` field) works.

`InstanceCount++;`, run inside the constructor — increments the one, shared value every time any `Counter` is built. `c1`, `c2`, `c3` are three separate objects, but all three constructor calls incremented the exact same `InstanceCount`.

`Counter.InstanceCount` — accessed through the **class name**, not through any one instance, because it doesn't belong to any single instance. Reading `c1.InstanceCount` would also work (C# permits it) but is misleading — it suggests `c1` has its own copy, which it does not.

**CS lens:** `static` fields live in one fixed location in memory for the entire lifetime of the program, allocated once when the class is first used — never per-object. This is the direct, mechanical reason `InstanceCount` genuinely is one shared counter and not three independent ones.

## static Methods

```csharp
using System;

class MathHelper
{
    public static int Square(int x)
    {
        return x * x;
    }
}

class Program
{
    static void Main()
    {
        Console.WriteLine(MathHelper.Square(5));
    }
}
```

```text
25
```

`public static int Square(int x)` — callable through the class name alone, `MathHelper.Square(5)`, with no `new MathHelper()` ever created. A `static` method has no access to any instance's fields, because it does not run "on" any particular instance — it only ever sees its own parameters and other `static` members.

**SE lens:** `Main` itself has been `static` since Level 0 for exactly this reason: the .NET runtime calls it before any object in your program exists yet — there is no instance for a non-`static` `Main` to run "on."

## const — A Compile-Time Constant

```csharp
using System;

class Config
{
    public const double Pi = 3.14159;
}

class Program
{
    static void Main()
    {
        Console.WriteLine(Config.Pi);
        double area = Config.Pi * 2 * 2;
        Console.WriteLine(area);
    }
}
```

```text
3.14159
12.56636
```

`public const double Pi = 3.14159;` — a value fixed at **compile time**. `const` is implicitly `static` — there is only ever one `Pi`, reached the same way as any other `static` member, through the class name.

A `const` must be assigned a literal value right where it's declared, and can never be reassigned anywhere, ever — not even inside a constructor.

## readonly — Fixed Once, at Construction Time

```csharp
using System;

class Account
{
    public readonly string AccountNumber;

    public Account(string number)
    {
        AccountNumber = number;
    }
}

class Program
{
    static void Main()
    {
        var a = new Account("ACC-001");
        Console.WriteLine(a.AccountNumber);
    }
}
```

```text
ACC-001
```

`public readonly string AccountNumber;` — unlike `const`, a `readonly` field is **not** shared — each `Account` object gets its own `AccountNumber`, set once, inside the constructor, and never changeable again after that.

**SE lens:** `const` and `readonly` solve related but different problems. `const Pi` is a value baked into the compiled program itself, identical for every single run — perfect for a true mathematical or configuration constant. `readonly AccountNumber` is set once *per object*, at the moment that specific object is constructed, from a value that isn't known until runtime (a different account number for every different `Account`) — `const` could never express this, since `const` requires the value to be known before the program even runs.

## Comparing the Three

A plain field (Level 7) can be read and written freely by any code with access to it, for the object's entire lifetime. A `readonly` field can be written only inside its own constructor, then never again. A `const` can never be written outside its own declaration, has exactly one shared value for the whole program, and that value must be knowable before the program ever runs.

## Challenge: format_currency

Write a `static string FormatCurrency(double amount)` method that formats a dollar amount using a `const` currency symbol. Declare `private const string Symbol = "$";` inside the class, and return `Symbol` followed by `amount` formatted to exactly 2 decimal places (`amount.ToString("F2")`).

```challenge
private const string Symbol = "$";

static string FormatCurrency(double amount)
{
    // TODO
}
```

```test
assert FormatCurrency(9.5) == "$9.50"
assert FormatCurrency(100) == "$100.00"
assert FormatCurrency(0) == "$0.00"
assert FormatCurrency(1234.5) == "$1234.50"
```
