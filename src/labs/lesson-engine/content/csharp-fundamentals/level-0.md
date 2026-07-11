---
title: C# Level 0: Hello, Types, and Methods
series: csharp-fundamentals
level: 0
topic: csharp
lang: csharp
---

# C# Level 0: Hello, Types, and Methods

## A C# Program Lives in a Class

C# code is organized around classes and methods. `Main` is the method the runtime calls first.

**SE lens:** C# is designed for larger applications, so names, types, and structure matter from the first lesson.

```csharp
using System;

class Program
{
    static void Main()
    {
        int count = 3;
        Console.WriteLine($"Count: {count}");
    }
}
```

## Methods Package Behavior

A method gives a chunk of behavior a name. Debugging C# often means following calls from one method into the next.

```csharp
using System;

class Program
{
    static int Double(int value)
    {
        return value * 2;
    }

    static void Main()
    {
        Console.WriteLine(Double(21));
    }
}
```
