---
series: csharp-fundamentals
level: 4
title: Strings Deep Dive
lang: csharp
---

# Strings Deep Dive

`string` has already appeared in every lesson so far — as a type, printed, interpolated, and compared. This lesson looks directly at what a `string` actually is: an object with real methods, a genuinely surprising rule about how it behaves when changed, and a purpose-built alternative for the one case where that rule becomes expensive.

## Common String Methods

```csharp
using System;

class Program
{
    static void Main()
    {
        string s = "Hello, World!";

        Console.WriteLine(s.Length);
        Console.WriteLine(s.ToUpper());
        Console.WriteLine(s.ToLower());
        Console.WriteLine(s.Substring(7));
        Console.WriteLine(s.Substring(7, 5));
        Console.WriteLine(s.Replace("World", "C#"));
        Console.WriteLine(s.Contains("World"));
        Console.WriteLine(s.IndexOf("World"));
    }
}
```

```text
13
HELLO, WORLD!
hello, world!
World!
World
Hello, C#!
True
7
```

`s.Length` — the character count (a property, no parentheses — same shape as `array.Length`).
`s.ToUpper()` / `s.ToLower()` — return a new string in the given case; `s` itself is never changed by calling either one.
`s.Substring(7)` — everything from index `7` to the end.
`s.Substring(7, 5)` — `5` characters starting at index `7`.
`s.Replace(old, new)` — returns a new string with every occurrence of `old` swapped for `new`.
`s.Contains(value)` — `true` if `value` appears anywhere inside `s`.
`s.IndexOf(value)` — the index of the first occurrence, or `-1` if `value` never appears.

## Strings Are Immutable

```csharp
using System;

class Program
{
    static void Main()
    {
        string a = "hello";
        string b = a;
        a += " world";

        Console.WriteLine(a);
        Console.WriteLine(b);
    }
}
```

```text
hello world
hello
```

`string b = a;` — `b` and `a` both reference the same underlying string object at this point.
`a += " world";` — this does **not** modify the string `a` was pointing at. It creates a brand-new string, `"hello world"`, and reassigns `a` to point at it. The original `"hello"` object is untouched — which is exactly why `b`, still pointing at that original object, still reads `"hello"`.

**CS lens:** Every `string` method that looks like it modifies a string — `ToUpper`, `Replace`, `Substring`, `+=` — actually allocates a brand-new string object and returns it. `string` in C# is **immutable**: once created, its contents can never change. `s.ToUpper();` on its own line, with the result never assigned to anything, is a real, silent bug — a genuinely new, upper-cased string was created and immediately discarded.

## StringBuilder — Efficient Repeated Concatenation

```csharp
using System;
using System.Text;

class Program
{
    static void Main()
    {
        var sb = new StringBuilder();
        for (int i = 0; i < 5; i++)
        {
            sb.Append(i);
            sb.Append(",");
        }
        Console.WriteLine(sb.ToString());
        Console.WriteLine(sb.Length);
    }
}
```

```text
0,1,2,3,4,
10
```

`new StringBuilder()` — a mutable buffer, specifically built to be changed repeatedly without allocating a new object every time.
`sb.Append(value)` — adds `value` onto the end, **in place** — no new object, unlike `string`'s own `+=`.
`sb.ToString()` — converts the accumulated contents into a real, final, immutable `string`, only once, at the point it's actually needed.

**SE lens:** Building a string inside a loop with plain `+=`, ten thousand times, allocates ten thousand separate throwaway string objects — one per iteration, each immediately discarded except the last. `StringBuilder` allocates a resizable internal buffer once (growing it only occasionally, not every append) and does all ten thousand appends into that same buffer — a real, measurable difference at any real loop size, which is exactly why `StringBuilder` exists as a separate type instead of C# just making `string` mutable.

## Splitting and Joining

```csharp
using System;

class Program
{
    static void Main()
    {
        string[] parts = "a,b,c,d".Split(',');
        Console.WriteLine(parts.Length);
        foreach (var p in parts) Console.Write(p + "-");
        Console.WriteLine();

        Console.WriteLine(string.Join("|", parts));
    }
}
```

```text
4
a-b-c-d-
a|b|c|d
```

`"a,b,c,d".Split(',')` — splits a string into an array of strings wherever the given character appears; the separator itself is discarded from the result.
`string.Join(separator, collection)` — the reverse operation: combines every element of an array (or any collection) into one string, with `separator` placed between each pair.

## Comparing Strings

```csharp
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("hello" == "hello");
        Console.WriteLine("Hello".Equals("hello", StringComparison.OrdinalIgnoreCase));
        Console.WriteLine(string.IsNullOrEmpty(""));
        Console.WriteLine(string.IsNullOrEmpty("x"));
        Console.WriteLine(string.IsNullOrWhiteSpace("   "));
    }
}
```

```text
True
True
True
False
True
```

`"hello" == "hello"` — unlike most reference types, `string`'s `==` compares **contents**, not identity — two separately-created strings with the same characters are `==`, even though `string` is a reference type (Level 5 covers what that means for other reference types, where `==` compares identity by default).

`.Equals(other, StringComparison.OrdinalIgnoreCase)` — an explicit, case-insensitive comparison. `"Hello"` and `"hello"` differ in case but are considered equal here.

`string.IsNullOrEmpty(s)` — `true` if `s` is `null` or `""`. A real, common check — reading `s.Length` on a `null` string would throw, so this check exists specifically to test both failure shapes in one call.
`string.IsNullOrWhiteSpace(s)` — the same check, extended to also treat a string made entirely of spaces/tabs as effectively empty.

## Challenge: reverse_words

Write a `static string ReverseWords(string sentence)` method that reverses the *order* of words in a sentence, without reversing the letters inside each word. Split on spaces, reverse the resulting array's order, and join back with spaces.

```challenge
static string ReverseWords(string sentence)
{
    // TODO
}
```

```test
assert ReverseWords("hello world") == "world hello"
assert ReverseWords("the quick brown fox") == "fox brown quick the"
assert ReverseWords("single") == "single"
assert ReverseWords("a b c") == "c b a"
```
