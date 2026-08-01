---
series: csharp-fundamentals
level: 15
title: Tuples & Deconstruction
lang: csharp
---

# Tuples & Deconstruction

A method returns exactly one value — every method in this course so far has. Sometimes a real result genuinely has more than one part: a minimum *and* a maximum, a name *and* an age. Writing a whole new `class` just to bundle two or three values together is often more ceremony than the problem needs. A **tuple** bundles several values into one, without declaring a class for it at all.

## Creating a Tuple

```csharp
using System;

class Program
{
    static void Main()
    {
        var person = ("Alice", 30);
        Console.WriteLine(person.Item1);
        Console.WriteLine(person.Item2);
    }
}
```

```text
Alice
30
```

`("Alice", 30)` — a tuple literal, bundling a `string` and an `int` into one value.
`var person = ...` — `person`'s real type is `(string, int)` — a tuple type, inferred by `var`.
`person.Item1` / `person.Item2` — the tuple's own default names for its elements, numbered from `1`.

## Named Tuple Elements

`Item1`/`Item2` work, but say nothing about what they actually mean. Naming the elements directly reads far better:

```csharp
using System;

class Program
{
    static void Main()
    {
        (string Name, int Age) person = ("Alice", 30);
        Console.WriteLine(person.Name);
        Console.WriteLine(person.Age);
    }
}
```

```text
Alice
30
```

`(string Name, int Age) person = ...` — the tuple's type now names each element: `Name` and `Age`, instead of `Item1`/`Item2`. `person.Name` reads directly, with no need to remember which position held which value.

## Returning a Tuple From a Method

```csharp
using System;

class Program
{
    static (int Min, int Max) FindMinMax(int[] nums)
    {
        int min = nums[0], max = nums[0];
        foreach (int n in nums)
        {
            if (n < min) min = n;
            if (n > max) max = n;
        }
        return (min, max);
    }

    static void Main()
    {
        var result = FindMinMax(new int[] { 5, 2, 8, 1, 9 });
        Console.WriteLine(result.Min);
        Console.WriteLine(result.Max);
    }
}
```

```text
1
9
```

`static (int Min, int Max) FindMinMax(int[] nums)` — the return type itself is a named tuple. `FindMinMax` genuinely has two real results, and the tuple return type says so directly, without a separate `MinMaxResult` class ever needing to exist.

`return (min, max);` — builds and returns the tuple in one line.

**SE lens:** A tuple is the right choice for a small, throwaway grouping of values used right where the method is called, and nowhere else. A real, named `class` (or the `Pair<T, U>` generic from two lessons ago) is still the better choice the moment the grouping has its own real behavior, gets passed around widely, or needs to mean something specific enough that `Item1`/`Item2` — or even `Min`/`Max` — would stop being self-explanatory.

## Deconstruction — Unpacking a Tuple Into Separate Variables

```csharp
using System;

class Program
{
    static void Main()
    {
        (string name, int age) = ("Bob", 25);
        Console.WriteLine(name);
        Console.WriteLine(age);
    }
}
```

```text
Bob
25
```

`(string name, int age) = ("Bob", 25);` — **deconstructs** the tuple directly into two independent variables, `name` and `age`, in one line — no `.Item1`/`.Item2` (or `.Name`/`.Age`) needed afterward; the values are already unpacked.

## Deconstructing Into Existing Variables

```csharp
using System;

class Program
{
    static (int, int) Swap(int a, int b)
    {
        return (b, a);
    }

    static void Main()
    {
        int x = 1, y = 2;
        (x, y) = Swap(x, y);

        Console.WriteLine(x);
        Console.WriteLine(y);
    }
}
```

```text
2
1
```

`(x, y) = Swap(x, y);` — deconstructs directly into `x` and `y`, which already exist — no `int` written before them this time, since they're being reassigned, not declared. `Swap` returns `(b, a)` — the two values in reversed order — so this single line swaps `x` and `y` without a manual temporary variable.

## Challenge: divmod

Write a `static (int Quotient, int Remainder) DivMod(int dividend, int divisor)` method that returns both the integer division result and the remainder, as a named tuple.

```challenge
static (int Quotient, int Remainder) DivMod(int dividend, int divisor)
{
    // TODO
}
```

```test
var r1 = DivMod(17, 5);
assert r1.Quotient == 3
assert r1.Remainder == 2
var r2 = DivMod(10, 2);
assert r2.Quotient == 5 && r2.Remainder == 0
var r3 = DivMod(7, 10);
assert r3.Quotient == 0 && r3.Remainder == 7
```
