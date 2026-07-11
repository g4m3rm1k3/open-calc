---
series: csharp-fundamentals
level: 2
title: Interfaces & Generics
lang: csharp
---

# Interfaces & Generics

An interface in C# is a contract: a list of method and property signatures that a class promises to implement. Any class that implements an interface can be used wherever that interface type is expected — regardless of what other methods the class has. Generics let you write one class or method that works for any type, with type safety checked at compile time.

## Interfaces

```csharp
using System;

interface IShape
{
    double Area();
    double Perimeter();
    string Describe();
}

class Circle : IShape
{
    private double _radius;

    public Circle(double radius) { _radius = radius; }

    public double Area() => Math.PI * _radius * _radius;
    public double Perimeter() => 2 * Math.PI * _radius;
    public string Describe() => $"Circle with radius {_radius}";
}

class Rectangle : IShape
{
    private double _width, _height;

    public Rectangle(double width, double height)
    {
        _width = width;
        _height = height;
    }

    public double Area() => _width * _height;
    public double Perimeter() => 2 * (_width + _height);
    public string Describe() => $"Rectangle {_width}×{_height}";
}

class Program
{
    static void PrintShape(IShape shape)
    {
        Console.WriteLine(shape.Describe());
        Console.WriteLine($"  Area: {shape.Area():F2}");
        Console.WriteLine($"  Perimeter: {shape.Perimeter():F2}");
    }

    static void Main()
    {
        IShape circle = new Circle(5.0);
        IShape rect   = new Rectangle(4.0, 6.0);

        PrintShape(circle);
        PrintShape(rect);
    }
}
```

```text
Circle with radius 5
  Area: 78.54
  Perimeter: 31.42
Rectangle 4×6
  Area: 24.00
  Perimeter: 20.00
```

`interface IShape { ... }` — declares an interface. By convention, interface names start with `I`. All members are implicitly `public` and have no body.

`class Circle : IShape` — `Circle` implements the `IShape` interface. The compiler enforces that `Circle` provides all three methods. A class can implement multiple interfaces: `class Foo : IShape, IComparable<Foo>`.

`static void PrintShape(IShape shape)` — accepts any object that implements `IShape`. The specific type (`Circle`, `Rectangle`) does not matter at the call site.

`{shape.Area():F2}` — format specifier inside string interpolation. `:F2` means "fixed-point, 2 decimal places."

**CS lens:** This is **polymorphism** through interfaces — the same method call (`PrintShape`) behaves differently depending on the runtime type of the argument. The .NET runtime dispatches `shape.Area()` to the correct implementation by looking up the method in a virtual method table (v-table) at runtime. This is O(1) dispatch, not a search.

## Generics — One Definition for Any Type

```csharp
using System;

class Stack<T>
{
    private T[] _items;
    private int _count;

    public Stack(int capacity)
    {
        _items = new T[capacity];
        _count = 0;
    }

    public void Push(T item)
    {
        _items[_count++] = item;
    }

    public T Pop()
    {
        return _items[--_count];
    }

    public T Peek() => _items[_count - 1];
    public int Count => _count;
}

class Program
{
    static void Main()
    {
        var intStack = new Stack<int>(10);
        intStack.Push(1);
        intStack.Push(2);
        intStack.Push(3);
        Console.WriteLine(intStack.Pop());
        Console.WriteLine(intStack.Count);

        var strStack = new Stack<string>(10);
        strStack.Push("hello");
        strStack.Push("world");
        Console.WriteLine(strStack.Pop());
    }
}
```

```text
3
2
world
```

`class Stack<T>` — `T` is a **type parameter**. When you write `new Stack<int>(10)`, `T` becomes `int` everywhere in the class. When you write `new Stack<string>(10)`, `T` becomes `string`.

`T[] _items` — an array of type `T`. The .NET runtime creates a specialised version of the class for each concrete type — `Stack<int>` and `Stack<string>` are separate compiled types, each fully type-safe.

`new T[capacity]` — allocates a managed array of `capacity` elements of type `T`.

**SE lens:** Generics eliminate code duplication while maintaining type safety. Without generics, you would write `IntStack`, `StringStack`, etc. — or use `object` as the element type and lose all type checking. Generic collections from `System.Collections.Generic` (`List<T>`, `Dictionary<K,V>`, `Queue<T>`) use exactly this mechanism.

## Generic Methods

A method can be generic independently of its class:

```csharp
using System;

class Utility
{
    public static T Max<T>(T a, T b) where T : IComparable<T>
    {
        return a.CompareTo(b) >= 0 ? a : b;
    }
}

class Program
{
    static void Main()
    {
        Console.WriteLine(Utility.Max(3, 7));
        Console.WriteLine(Utility.Max("apple", "banana"));
        Console.WriteLine(Utility.Max(2.5, 1.8));
    }
}
```

```text
7
banana
2.5
```

`where T : IComparable<T>` — a **generic constraint**: `T` must implement `IComparable<T>`, which provides a `CompareTo` method. Without the constraint, the compiler does not know that `T` has `CompareTo`.

`a.CompareTo(b) >= 0` — returns `true` if `a >= b`.

## Challenge: generic_pair

Write a generic class `Pair<T, U>` that holds two values of possibly different types:
- Fields `First` and `Second` (auto-properties with private set)
- A constructor `Pair(T first, U second)`
- A method `string Describe()` that returns `"(first, second)"` using string interpolation

In `Main`, create a `Pair<string, int>` with `("Alice", 30)` and a `Pair<double, bool>` with `(3.14, true)`, and print the result of `Describe()` for each.

```challenge
using System;

class Pair<T, U>
{
    // TODO
}

class Program
{
    static void Main()
    {
        var p1 = new Pair<string, int>("Alice", 30);
        Console.WriteLine(p1.Describe());

        var p2 = new Pair<double, bool>(3.14, true);
        Console.WriteLine(p2.Describe());
    }
}
```

```test
// Expected output:
// (Alice, 30)
// (3.14, True)
```
