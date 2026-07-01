# The Type System: Value Types, Reference Types, and Unified Hierarchy

C#'s type system is built on a single principle that distinguishes it from both Java and C++: **everything is an object**. An `int` in C# inherits from `System.Object`. You can call `.ToString()` on it. You can pass it to a method that accepts `object`. This is the **unified type system** — there is no primitive/object split like in Java.

How can an `int` be an object and still be stored efficiently on the stack? The answer is the **value type / reference type** distinction, combined with **boxing** — a mechanism that wraps value types in heap-allocated objects when needed. Understanding this distinction is fundamental to writing efficient C#.

## Value Types: Stack-Allocated, Copy Semantics

**Value types** are stored directly where they're declared. Local variable → on the stack. Field in a class → inline in the object. When you assign a value type, you get an independent copy:

```csharp
// Built-in value types (aliases for System types)
bool   b = true;           // System.Boolean
byte   by = 255;           // System.Byte
short  s = 32767;          // System.Int16
int    i = 2147483647;     // System.Int32
long   l = 9223372036854775807L; // System.Int64
float  f = 3.14f;          // System.Single
double d = 3.141592653589793;    // System.Double
decimal m = 99.99m;        // System.Decimal — for money!
char   c = 'A';            // System.Char (UTF-16)

// Copy semantics
int a = 10;
int b2 = a;   // b2 is an independent copy
b2 = 20;
Console.WriteLine($"a={a}, b2={b2}");  // a=10, b2=20 — independent

// Struct: a custom value type
struct Point
{
    public double X;
    public double Y;

    public Point(double x, double y) { X = x; Y = y; }
    public double DistanceTo(Point other)
    {
        double dx = X - other.X, dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }
    public override string ToString() => $"({X}, {Y})";
}

var p1 = new Point(3, 4);
var p2 = p1;    // p2 is a copy
p2.X = 99;
Console.WriteLine($"p1={p1}, p2={p2}");  // p1=(3, 4), p2=(99, 4) — independent
```

`decimal` deserves special attention. Unlike `float` and `double` (which use binary floating-point, causing `0.1 + 0.2 != 0.3`), `decimal` uses **decimal floating-point** — 128-bit with base 10. It's exact for decimal fractions up to 28-29 significant digits. For money, always use `decimal`, never `double`.

## Reference Types: Heap-Allocated, Shared References

**Reference types** are stored on the heap. A variable holds a reference (a pointer, essentially) to the object. Assignment copies the reference, not the object — two variables can refer to the same object:

```csharp
// Class: reference type
class MutablePoint
{
    public double X { get; set; }
    public double Y { get; set; }
    public MutablePoint(double x, double y) { X = x; Y = y; }
    public override string ToString() => $"({X}, {Y})";
}

var r1 = new MutablePoint(3, 4);
var r2 = r1;     // r2 holds a copy of the REFERENCE — same object!
r2.X = 99;
Console.WriteLine($"r1={r1}, r2={r2}");  // r1=(99, 4), r2=(99, 4) — same object!

// null: the default for reference types
MutablePoint nullPoint = null;
// nullPoint.X;  // NullReferenceException!
```

## `var`: Type Inference

C# 3.0 introduced `var` — the compiler infers the type from the right-hand side. Unlike JavaScript's `var`, C# `var` is **statically typed** — the type is fixed at compile time:

```csharp
var name = "Alice";            // string
var age = 30;                  // int
var pi = 3.14159;              // double
var list = new List<string>(); // List<string>
var dict = new Dictionary<string, int>(); // Dictionary<string, int>

// var can't be used without an initializer
// var x;  // Compile error

// var is especially useful with complex types
var grouped = list
    .GroupBy(s => s.Length)
    .ToDictionary(g => g.Key, g => g.ToList());

Console.WriteLine($"name is {name.GetType().Name}");  // String
Console.WriteLine($"age is {age.GetType().Name}");    // Int32
```

## `const` and `readonly`

C# has two immutability modifiers with different semantics:

```csharp
class Config
{
    // const: compile-time constant — value embedded at every use site
    public const double Pi = 3.141592653589793;
    public const int MaxRetries = 3;

    // readonly: runtime constant — set once in constructor or initializer
    public readonly string ServerUrl;
    public readonly DateTime StartTime;

    public Config(string url)
    {
        ServerUrl = url;                // Can assign in constructor
        StartTime = DateTime.UtcNow;    // Runtime value — can't be const
    }
}

// For local variables: const works for compile-time values
const string Greeting = "Hello";
Console.WriteLine($"{Greeting}, Pi={Config.Pi}");

var cfg = new Config("https://api.example.com");
Console.WriteLine($"Server: {cfg.ServerUrl}");
Console.WriteLine($"Started: {cfg.StartTime}");
```

The distinction: `const` is baked in at compile time (faster, but changes require recompilation of all callers), `readonly` is evaluated at runtime (can hold values computed at startup).

## Nullable Types: Expressing Absence Safely

Every value type in C# is non-nullable by default — `int` can't hold null. Appending `?` makes it nullable:

```csharp
// Nullable value types
int  normal   = 42;
int? nullable = null;

Console.WriteLine(nullable.HasValue);         // false
Console.WriteLine(nullable.GetValueOrDefault()); // 0

nullable = 10;
Console.WriteLine(nullable.HasValue);         // true
Console.WriteLine(nullable.Value);            // 10

// Null coalescing: ?? returns right side if left is null
int result = nullable ?? -1;

// Null-conditional: ?. returns null instead of throwing
int? len = nullable?.ToString().Length;  // null if nullable is null
Console.WriteLine(len);

// Null coalescing assignment (C# 8+)
int? x = null;
x ??= 42;    // x = x ?? 42
Console.WriteLine(x);  // 42

// Practical: parse might fail
int? parsed = int.TryParse("123", out int value) ? value : null;
Console.WriteLine(parsed);  // 123
parsed = int.TryParse("abc", out value) ? value : null;
Console.WriteLine(parsed);  // (empty — null)
```

## Nullable Reference Types (C# 8+): The Billion-Dollar Fix

C# 8 added **nullable reference types** — an opt-in feature that makes the compiler track null safety for reference types too. With it enabled, `string` is non-nullable and `string?` is nullable:

```csharp
#nullable enable

string nonNull = "hello";    // Can't be null
string? maybeNull = null;    // Explicitly nullable

// Compiler warns about potential null dereferences
void Process(string? input)
{
    // Console.WriteLine(input.Length);  // Warning: 'input' may be null

    if (input != null)
    {
        Console.WriteLine(input.Length);  // OK — null checked
    }

    // Null-forgiving operator: tell compiler you know it's not null
    Console.WriteLine(input!.Length);  // Suppresses warning — use sparingly
}

// Null-conditional chain — safe traversal
string? city = null;
int? cityLength = city?.Trim().ToUpper().Length;  // null — no exception
```

This is C#'s answer to the billion-dollar mistake. Projects that enable nullable reference types and fix all warnings dramatically reduce `NullReferenceException` at runtime. It's opt-in for backward compatibility, but all new .NET library code ships with it enabled.

## Boxing and Unboxing: The Cost of Unification

The unified type system requires a mechanism to treat value types as objects. **Boxing** wraps a value type in a heap-allocated object. **Unboxing** extracts it back:

```csharp
int value = 42;
object boxed = value;       // Boxing: heap allocation, copy of value
int unboxed = (int)boxed;   // Unboxing: cast required

Console.WriteLine(boxed.GetType().Name);  // Int32 — it's still an int inside
Console.WriteLine(value == unboxed);      // true

// Boxing happens implicitly in some APIs — this is a performance concern
var list = new System.Collections.ArrayList();  // Non-generic: stores object
list.Add(1);   // Boxes every int!
list.Add(2);
list.Add(3);

// Use generic collections to avoid boxing:
var genericList = new List<int>();  // No boxing!
genericList.Add(1);
genericList.Add(2);
genericList.Add(3);

// String interpolation doesn't box (in modern .NET):
int n = 100;
Console.WriteLine($"Value: {n}");  // No boxing — StringBuilder handles it
```

Boxing is rarely something you think about in application code — the generic collections (`List<T>`, `Dictionary<K,V>`) avoid it entirely. It matters in performance-critical code: pre-.NET 6 LINQ over value types could box; modern .NET aggressively avoids it. The `Span<T>` and `Memory<T>` types introduced in .NET Core 2.1 provide zero-allocation slicing of arrays and buffers.
