---
series: csharp-fundamentals
level: 5
title: Value Types vs Reference Types
lang: csharp
---

# Value Types vs Reference Types

Level 0 mentioned, in passing, that `int`/`double`/`bool`/`char` are **value types** and `string` is a **reference type** — stated, not proven. This lesson proves it directly, with real, contrasting behavior, because the difference determines what happens every single time a value is assigned, copied, or passed into a method for the rest of this course.

## Assigning a Value Type Copies It

```csharp
using System;

class Program
{
    static void Main()
    {
        int x = 5;
        int y = x;
        y = 10;

        Console.WriteLine(x);
        Console.WriteLine(y);
    }
}
```

```text
5
10
```

`int y = x;` — copies the value `5` into `y`. From this line on, `x` and `y` are two completely independent `int`s that just happen to currently hold the same number.
`y = 10;` — changes only `y`. `x` was never connected to `y` in any way beyond that one initial copy — proven directly: `x` still reads `5`.

Every type built into C# so far except `string` — `int`, `double`, `bool`, `char` — behaves exactly this way.

## A struct Is Also a Value Type

```csharp
using System;

struct Point
{
    public int X;
    public int Y;
}

class Program
{
    static void Main()
    {
        Point p1 = new Point();
        p1.X = 1;
        p1.Y = 2;

        Point p2 = p1;
        p2.X = 99;

        Console.WriteLine(p1.X);
        Console.WriteLine(p2.X);
    }
}
```

```text
1
99
```

`struct Point { ... }` — declared exactly like a `class` (Level 7 covers classes properly; a `struct` uses identical field syntax), but `struct` instead of `class` changes something fundamental: `Point` is a value type.

`Point p2 = p1;` — copies **every field** of `p1` into a brand-new, independent `Point`. `p2` is not "another name for the same `Point`" — it is a genuinely separate copy, down to each individual field.

`p2.X = 99;` — changes only `p2`'s copy. `p1.X` is completely unaffected, still `1` — the direct, structural reason a `struct` behaves like `int` and not like the reference types below.

## A class Is a Reference Type

```csharp
using System;

class Box
{
    public int Value;
}

class Program
{
    static void Main()
    {
        Box b1 = new Box();
        b1.Value = 1;

        Box b2 = b1;
        b2.Value = 99;

        Console.WriteLine(b1.Value);
        Console.WriteLine(b2.Value);
    }
}
```

```text
99
99
```

`Box b2 = b1;` — this time, `b2` does **not** get its own independent copy. It gets a copy of the **reference** — the "which object is this" address — pointing at the exact same `Box` object `b1` already points at. `b1` and `b2` are two different variable names for one single, shared object.

`b2.Value = 99;` — changes the one, shared `Box` object. Reading `b1.Value` afterward reads `99` too, because `b1` and `b2` were never two separate objects to begin with — proven directly: both lines print `99`.

**CS lens:** This is the exact same distinction Level 1b's `struct` lab would call **value semantics vs. reference semantics** — a value type's variable directly holds its data; a reference type's variable holds a pointer to data that lives somewhere else (the managed heap), and assignment only ever copies the pointer, never the data it points to.

## The Same Rule Applies to Method Parameters

```csharp
using System;

struct Point
{
    public int X;
    public int Y;
}

class Program
{
    static void ModifyStruct(Point p)
    {
        p.X = 999;
    }

    static void Main()
    {
        Point p1 = new Point();
        p1.X = 1;

        ModifyStruct(p1);
        Console.WriteLine(p1.X);
    }
}
```

```text
1
```

`ModifyStruct(p1)` — passes `p1` into the method. Because `Point` is a value type, `p` inside `ModifyStruct` is a completely independent copy of `p1` — the same copying behavior as a plain assignment. `p.X = 999;` changes only that local copy; `p1.X`, back in `Main`, is untouched.

```csharp
using System;

class Box
{
    public int Value;
}

class Program
{
    static void ModifyClass(Box b)
    {
        b.Value = 999;
    }

    static void Main()
    {
        Box b1 = new Box();
        b1.Value = 1;

        ModifyClass(b1);
        Console.WriteLine(b1.Value);
    }
}
```

```text
999
```

`ModifyClass(b1)` — passes `b1` into the method. Because `Box` is a reference type, `b` inside `ModifyClass` is a copy of the *reference*, still pointing at the exact same object `b1` points at. `b.Value = 999;` changes the one, shared object — `b1.Value`, back in `Main`, reads `999` too.

**SE lens:** This is a real, common source of confusion, worth stating precisely: C# always passes arguments *by value* — but for a reference type, the value being copied is the reference itself, not the object. This is different from languages with a real, separate "pass by reference" mechanism (C#'s own `ref` keyword is that separate mechanism, letting a method modify the caller's actual variable — out of scope here, but worth knowing the name exists).

## Where This Matters

`int`, `double`, `bool`, `char`, and any `struct` — copied on assignment and on every method call. `string`, arrays, and any `class` — a reference is copied; the underlying object is shared. Knowing which one a type is, without needing to test it, is exactly what distinguishes a *value type* from a *reference type* as vocabulary: every `struct` (including every built-in numeric type, which are all secretly structs under the hood) is a value type; every `class` is a reference type.

## Challenge: describe_type

Write a `static string DescribeType(string typeName)` method that returns `"copied on assignment"` when `typeName` is `"int"`, `"bool"`, `"double"`, or `"struct"` (value types), and `"shared by reference on assignment"` for any other `typeName` (a class or array — reference types).

```challenge
static string DescribeType(string typeName)
{
    // TODO
}
```

```test
assert DescribeType("int") == "copied on assignment"
assert DescribeType("bool") == "copied on assignment"
assert DescribeType("struct") == "copied on assignment"
assert DescribeType("class") == "shared by reference on assignment"
assert DescribeType("array") == "shared by reference on assignment"
```
