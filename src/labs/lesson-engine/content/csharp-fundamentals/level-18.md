---
series: csharp-fundamentals
level: 18
title: Extension Methods
lang: csharp
---

# Extension Methods

Every LINQ operator this course has used — `Where`, `Select`, `GroupBy` — is called with `collection.Where(...)` syntax, as though `List<T>` itself had a `Where` method built in. It doesn't. `Where` is defined completely separately, in `System.Linq`, and made callable on `List<T>` (and every other collection) through a real, learnable C# feature: **extension methods**, a way to add a method to a type without ever touching that type's own source code.

## Writing Your Own Extension Method

```csharp
using System;

static class IntExtensions
{
    public static bool IsEven(this int n)
    {
        return n % 2 == 0;
    }
}

class Program
{
    static void Main()
    {
        int x = 4;
        Console.WriteLine(x.IsEven());
        Console.WriteLine(5.IsEven());
    }
}
```

```text
True
False
```

`static class IntExtensions` — extension methods must live inside a `static` class.

`public static bool IsEven(this int n)` — an ordinary `static` method, except for one detail: `this` before the first parameter. That single keyword is what turns `IsEven` into an extension method *of* `int`, rather than just a regular method that happens to take an `int`.

`x.IsEven()` — called with ordinary dot syntax, exactly as if `int` itself had an `IsEven` method. `5.IsEven()` — works even directly on a literal, not just a variable.

**CS lens:** `x.IsEven()` doesn't actually change what `int` is — the compiler rewrites it, behind the scenes, into `IntExtensions.IsEven(x)`, an ordinary static method call. `int` itself is completely unmodified; the method call just *looks* like it belongs to `int`.

## Extension Methods Work on Any Type, Including Generics

```csharp
using System;
using System.Collections.Generic;

static class ListExtensions
{
    public static int SumOfSquares(this List<int> list)
    {
        int sum = 0;
        foreach (int n in list) sum += n * n;
        return sum;
    }
}

class Program
{
    static void Main()
    {
        var nums = new List<int> { 1, 2, 3 };
        Console.WriteLine(nums.SumOfSquares());
    }
}
```

```text
14
```

`this List<int> list` — extends `List<int>` specifically. `nums.SumOfSquares()` reads exactly like a method `List<int>` was always supposed to have — `1² + 2² + 3² = 1 + 4 + 9 = 14`.

This is the exact mechanism `Where`/`Select`/`GroupBy` (the previous two lessons) use — each is a real `static` method, defined in `System.Linq`, with a `this IEnumerable<T> source` first parameter, making every one of them callable on any `List<T>`, array, or other collection with ordinary dot syntax.

## A Real, Practical Extension Method

```csharp
using System;

static class StringExtensions
{
    public static bool IsPalindrome(this string s)
    {
        char[] chars = s.ToCharArray();
        Array.Reverse(chars);
        string reversed = new string(chars);
        return s == reversed;
    }
}

class Program
{
    static void Main()
    {
        Console.WriteLine("racecar".IsPalindrome());
        Console.WriteLine("hello".IsPalindrome());
    }
}
```

```text
True
False
```

`s.ToCharArray()` — converts the string into a real `char[]` (Level 2's own array type), since `Array.Reverse` (also Level 2) needs a mutable array to reverse in place — `string` itself is immutable (Level 4) and has no in-place reverse of its own.

`new string(chars)` — builds a brand-new `string` from the reversed character array.

`IsPalindrome`, called directly on a string literal — `"racecar".IsPalindrome()` — reads naturally, the same reason Level 6a of the WPF curriculum's own SE Lens gave for extension-method-shaped calls: the subject of the check sits right where a person would say it out loud, not buried inside a parameter list like `IsPalindrome("racecar")` would.

**SE lens:** Extension methods exist specifically for types you can't or shouldn't modify directly — `string`, `int`, `List<T>`, or any type from a library you don't own the source of. Adding a genuinely new method to your *own* class is simpler as an ordinary instance method; reach for an extension method when the type being extended is closed to you, or when the method is a general-purpose utility that doesn't belong to any one class's core responsibility.

## Challenge: word_count_extension

Write an extension method `static int WordCount(this string s)` that returns how many words `s` contains, splitting on spaces. Treat an empty string as `0` words.

```challenge
static class StringExtensions
{
    public static int WordCount(this string s)
    {
        // TODO
    }
}
```

```test
assert "hello world".WordCount() == 2
assert "the quick brown fox".WordCount() == 4
assert "single".WordCount() == 1
assert "".WordCount() == 0
```
