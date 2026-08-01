---
series: csharp-fundamentals
level: 19
title: Pattern Matching & Object Initializers
lang: csharp
---

# Pattern Matching & Object Initializers

Level 13's `p?.Name` already asked "is `p` non-`null`?" in passing. This lesson names the broader idea directly — **pattern matching**, asking "is this value shaped a certain way, and if so, give me a variable holding it" — and a second, unrelated shorthand this lesson's own examples have quietly been using since Level 13: initializing several properties in one expression.

## The is Pattern — Testing and Extracting in One Step

```csharp
using System;

class Program
{
    static void Main()
    {
        object[] items = { 42, "hello", 3.14, true };

        foreach (object item in items)
        {
            if (item is int n)
            {
                Console.WriteLine("int: " + n);
            }
            else if (item is string s)
            {
                Console.WriteLine("string: " + s);
            }
            else if (item is double d)
            {
                Console.WriteLine("double: " + d);
            }
            else
            {
                Console.WriteLine("other: " + item);
            }
        }
    }
}
```

```text
int: 42
string: hello
double: 3.14
other: True
```

`item is int n` — asks two things at once: "is `item` really an `int`?", and if so, "give me that value, already correctly typed, as a new variable `n`." Before this pattern existed, the same check needed two separate steps — a cast, checked separately for failure. `is int n` does both in one expression, and `n` is only usable (and only exists) inside the branch where the check actually passed.

`object[] items = { 42, "hello", 3.14, true }` — every element is stored as `object`, C#'s most general type; `is` is what recovers each one's real, specific type at runtime.

## is With Class Hierarchies

```csharp
using System;

class Animal { public string Name; }
class Dog : Animal { public string Breed; }

class Program
{
    static void Describe(Animal a)
    {
        if (a is Dog dog)
        {
            Console.WriteLine(dog.Name + " is a " + dog.Breed);
        }
        else
        {
            Console.WriteLine(a.Name + " is an animal");
        }
    }

    static void Main()
    {
        Describe(new Dog { Name = "Rex", Breed = "Labrador" });
        Describe(new Animal { Name = "Generic" });
    }
}
```

```text
Rex is a Labrador
Generic is an animal
```

`a is Dog dog` — `a`'s declared type is `Animal` (Level 11's own inheritance), but `is Dog` checks its real, runtime type. When `a` really is a `Dog`, `dog` gives access to `Breed` — a member `Animal` itself doesn't have.

`new Dog { Name = "Rex", Breed = "Labrador" }` — an **object initializer**: sets two properties in one expression, right where the object is created, without a constructor accepting either of them.

## Object Initializers, Named Directly

```csharp
using System;

class Point
{
    public int X { get; set; }
    public int Y { get; set; }
}

class Program
{
    static void Main()
    {
        Point p = new Point { X = 3, Y = 4 };
        Console.WriteLine(p.X + ", " + p.Y);
    }
}
```

```text
3, 4
```

`new Point { X = 3, Y = 4 }` — equivalent to calling `new Point()` and then, immediately, `p.X = 3; p.Y = 4;` — except as one single expression. Works with any auto-property or plain field that has an accessible setter; `Point` here never wrote a constructor accepting `X`/`Y` at all.

**SE lens:** Object initializers are the right choice when a type has several independent, optional properties that don't need a specific constructor order enforced — forcing every caller through `new Point(3, 4)` means remembering which positional argument is which; `new Point { X = 3, Y = 4 }` states each one by name, at the call site, impossible to mix up.

## Collection Initializers

```csharp
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var list = new List<int> { 1, 2, 3 };
        var dict = new Dictionary<string, int> { { "a", 1 }, { "b", 2 } };

        Console.WriteLine(list.Count);
        Console.WriteLine(dict["a"] + dict["b"]);
    }
}
```

```text
3
3
```

`new List<int> { 1, 2, 3 }` — already familiar since Level 2's array initializers and the previous LINQ lessons — the same `{ }` syntax, now confirmed to work on `List<T>` too.
`new Dictionary<string, int> { { "a", 1 }, { "b", 2 } }` — each inner `{ key, value }` pair becomes one call to `Add`, run automatically as part of construction.

## Challenge: classify_value

Write a `static string ClassifyValue(object value)` method using `is` patterns:
- If `value` is an `int`, return `"int: " + value` where the number is `> 0`; return `"non-positive int: " + value` otherwise.
- If `value` is a `string`, return `"string of length " + length`.
- Otherwise, return `"unknown"`.

```challenge
static string ClassifyValue(object value)
{
    // TODO
}
```

```test
assert ClassifyValue(5) == "int: 5"
assert ClassifyValue(-3) == "non-positive int: -3"
assert ClassifyValue(0) == "non-positive int: 0"
assert ClassifyValue("hello") == "string of length 5"
assert ClassifyValue(3.14) == "unknown"
```
