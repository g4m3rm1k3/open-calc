---
series: csharp-fundamentals
level: 0
title: Types, Variables & Methods
lang: csharp
---

# Types, Variables & Methods

C# is a statically-typed, compiled language that runs on the .NET runtime. Every variable has a declared type, checked at compile time. C# is designed for building large applications — the type system, IDE tooling, and class structure work together to make big codebases manageable.

## Every C# Program Needs a Class

```csharp
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, C#");
    }
}
```

```text
Hello, C#
```

`using System;` — imports the `System` namespace, which contains `Console`. Without it, you would write `System.Console.WriteLine(...)`.

`class Program { }` — all C# code lives inside a class. `Program` is the conventional name for the entry-point class.

`static void Main()` — the method the .NET runtime calls to start the program. `static` means it belongs to the class, not an instance. `void` means it returns nothing.

`Console.WriteLine(...)` — prints a line to the console (equivalent to Python's `print()` or C++'s `cout`).

**CS lens:** C# compiles to CIL (Common Intermediate Language) bytecode, which the .NET Just-In-Time (JIT) compiler converts to native machine code at runtime. This is different from C++ (compiled directly to native code) and Python (interpreted). The JIT approach gives C# near-native performance while still being portable across operating systems.

## Fundamental Types

```csharp
using System;

class Program
{
    static void Main()
    {
        int age = 28;
        double temperature = 36.6;
        bool isActive = true;
        string name = "Alice";
        char grade = 'A';

        Console.WriteLine(age);
        Console.WriteLine(temperature);
        Console.WriteLine(isActive);
        Console.WriteLine(name);
        Console.WriteLine(grade);
    }
}
```

```text
28
36.6
True
Alice
A
```

`int` — 32-bit signed integer.
`double` — 64-bit floating-point.
`bool` — `true` or `false`. Prints as `True` or `False` (note the capital).
`string` — a sequence of characters. In C#, `string` is an alias for `System.String`, which is a full class.
`char` — a single Unicode character.

`string` is a reference type (lives on the heap), while `int`, `double`, `bool`, and `char` are value types (live on the stack). For now: value types copy on assignment; reference types share the underlying object.

## var — Type Inference

```csharp
using System;

class Program
{
    static void Main()
    {
        var count = 10;
        var message = "Hello";
        var price = 9.99;

        Console.WriteLine(count.GetType().Name);
        Console.WriteLine(message.GetType().Name);
        Console.WriteLine(price.GetType().Name);
    }
}
```

```text
Int32
String
Double
```

`var` lets the compiler infer the type from the initialiser. The type is still fixed at compile time — `count` is permanently an `Int32`. This is not dynamic typing; it is type inference. `var` is useful when the type is obvious from the right-hand side.

## Writing Methods

```csharp
using System;

class Program
{
    static int Add(int a, int b)
    {
        return a + b;
    }

    static string Greet(string name)
    {
        return $"Hello, {name}!";
    }

    static void Main()
    {
        Console.WriteLine(Add(3, 4));
        Console.WriteLine(Greet("Alice"));
        Console.WriteLine(Greet("Bob"));
    }
}
```

```text
7
Hello, Alice!
Hello, Bob!
```

`static int Add(int a, int b)` — a method that takes two `int` parameters and returns an `int`. In C#, the return type comes before the method name (like C++).

`$"Hello, {name}!"` — a **string interpolation** expression. The `$` prefix enables `{expression}` inside the string literal (similar to Python f-strings).

## Challenge: fahrenheit_to_celsius

Write a `static double FahrenheitToCelsius(double f)` method that converts Fahrenheit to Celsius using the formula `(f - 32) × 5 / 9`. Then write `Main` to print the result for 32°F, 212°F, and 98.6°F.

```challenge
using System;

class Program
{
    static double FahrenheitToCelsius(double f)
    {
        // TODO
    }

    static void Main()
    {
        Console.WriteLine(FahrenheitToCelsius(32));
        Console.WriteLine(FahrenheitToCelsius(212));
        Console.WriteLine(FahrenheitToCelsius(98.6));
    }
}
```

```test
// Expected output (approximate):
// 0
// 100
// 37
```
