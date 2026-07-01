# Control Flow: Pattern Matching and the Modern Switch

C#'s control flow statements started as near-copies of Java and C — `if`, `while`, `for`, `switch` with familiar syntax. But the language has evolved them significantly. C# 7 began adding **pattern matching** to `switch`. C# 8 introduced **switch expressions**. C# 9 added **relational patterns** and **logical patterns**. By C# 10 and 11, C#'s pattern matching system had become one of the most expressive in any mainstream language.

Understanding this evolution — from imperative branching to declarative pattern decomposition — is essential to reading modern C# code.

## The `if` Statement

```csharp
int temperature = 22;

if (temperature > 30)
{
    Console.WriteLine("Hot");
}
else if (temperature > 20)
{
    Console.WriteLine("Comfortable");
}
else if (temperature > 10)
{
    Console.WriteLine("Cool");
}
else
{
    Console.WriteLine("Cold");
}

// C# requires boolean condition — no implicit truthiness
int n = 5;
// if (n) { }   // Compile error
if (n != 0) { Console.WriteLine("Non-zero"); }

// One-liner (braceless) — style guides disagree; braces are safer
if (n > 0) Console.WriteLine("Positive");

// Null-safe condition
string? s = null;
if (s is not null && s.Length > 0)
    Console.WriteLine("Non-empty");
```

## The Classic `switch`

C#'s classic `switch` has one important difference from Java: **fall-through is illegal** unless the case is empty. The compiler rejects a non-empty case that doesn't end with `break`, `return`, `throw`, or `goto case`:

```csharp
int day = 3;
switch (day)
{
    case 1:
        Console.WriteLine("Monday");
        break;
    case 2:
        Console.WriteLine("Tuesday");
        break;
    case 3:
        Console.WriteLine("Wednesday");
        break;
    case 6:
    case 7:
        Console.WriteLine("Weekend");  // Empty case fall-through: allowed
        break;
    default:
        Console.WriteLine("Weekday");
        break;
}

// switch on string
string lang = "csharp";
switch (lang)
{
    case "csharp":
    case "cs":
        Console.WriteLine("C# — .NET language");
        break;
    case "java":
        Console.WriteLine("Java — JVM language");
        break;
    default:
        Console.WriteLine("Unknown");
        break;
}
```

## Switch Expressions (C# 8+): Concise and Value-Producing

Switch expressions use `=>` arms, eliminate `break`, and produce a value:

```csharp
int day = 3;
string dayName = day switch
{
    1 => "Monday",
    2 => "Tuesday",
    3 => "Wednesday",
    4 => "Thursday",
    5 => "Friday",
    6 => "Saturday",
    7 => "Sunday",
    _ => "Invalid"   // _ is the discard pattern (default)
};
Console.WriteLine(dayName);

// Switch expression with computation
double score = 87.5;
string grade = score switch
{
    >= 90 => "A",    // Relational pattern (C# 9)
    >= 80 => "B",
    >= 70 => "C",
    >= 60 => "D",
    _      => "F"
};
Console.WriteLine($"Grade: {grade}");

// Inline in an expression
Console.WriteLine($"Day type: {day switch { 1 or 2 or 3 or 4 or 5 => "Weekday", _ => "Weekend" }}");
```

## Pattern Matching: The Heart of Modern C# Branching

Pattern matching lets you test both the type and the shape of a value simultaneously:

```csharp
object[] items = { 42, "hello", 3.14, true, null, new int[] { 1, 2, 3 } };

foreach (object item in items)
{
    string description = item switch
    {
        int i when i > 100   => $"Large integer: {i}",
        int i                => $"Integer: {i}",
        string s when s.Length > 3 => $"Long string: \"{s}\"",
        string s             => $"Short string: \"{s}\"",
        double d             => $"Double: {d:F2}",
        bool b               => $"Boolean: {b}",
        null                 => "Null value",
        int[] arr            => $"Array of {arr.Length} ints",
        _                    => $"Other: {item}"
    };
    Console.WriteLine(description);
}
```

## Property Patterns (C# 8+)

Property patterns let you match on the values of properties:

```csharp
record Point(double X, double Y);
record Circle(Point Center, double Radius);

static string ClassifyShape(object shape) => shape switch
{
    Circle { Radius: 0 }                          => "Degenerate circle (point)",
    Circle { Radius: var r } when r < 1           => $"Tiny circle, r={r:F2}",
    Circle { Center: { X: 0, Y: 0 }, Radius: var r } => $"Origin circle, r={r:F2}",
    Circle { Radius: var r }                      => $"Circle, r={r:F2}",
    Point { X: 0, Y: 0 }                         => "Origin point",
    Point { X: var x, Y: var y }                 => $"Point ({x}, {y})",
    _                                             => "Unknown shape"
};

Console.WriteLine(ClassifyShape(new Circle(new Point(0, 0), 5)));
Console.WriteLine(ClassifyShape(new Circle(new Point(3, 4), 0.5)));
Console.WriteLine(ClassifyShape(new Point(0, 0)));
Console.WriteLine(ClassifyShape(new Point(3, 4)));
```

## List Patterns (C# 11+)

C# 11 added list patterns — match on the structure of arrays and sequences:

```csharp
static string DescribeList(int[] data) => data switch
{
    []             => "Empty",
    [var single]   => $"Single: {single}",
    [var first, var last] => $"Two elements: {first} and {last}",
    [1, 2, ..]    => "Starts with 1, 2",
    [.., 99]      => "Ends with 99",
    [var head, .. var rest] => $"Head={head}, rest has {rest.Length} items"
};

Console.WriteLine(DescribeList(Array.Empty<int>()));
Console.WriteLine(DescribeList(new[] { 42 }));
Console.WriteLine(DescribeList(new[] { 1, 2, 3, 4 }));
Console.WriteLine(DescribeList(new[] { 5, 6, 7, 8, 99 }));
```

## The Ternary Operator and Null Coalescing

```csharp
int n = 15;
string parity = n % 2 == 0 ? "even" : "odd";
Console.WriteLine($"{n} is {parity}");

// Null coalescing: ?? and ??=
string? name = null;
string displayName = name ?? "Anonymous";
Console.WriteLine(displayName);

name ??= "Default";   // Assign only if null
Console.WriteLine(name);

// Null-conditional: ?. chains
string? text = null;
int? len = text?.Trim()?.Length;
Console.WriteLine(len ?? 0);   // 0 — no exception

// Chaining all three
string? input = null;
Console.WriteLine(input?.ToUpper() ?? "EMPTY");
```

## `is` Expressions and Type Testing

```csharp
object obj = "Hello, C#!";

// Classic instanceof equivalent
if (obj is string)
    Console.WriteLine("It's a string");

// Pattern variable (C# 7+)
if (obj is string str)
    Console.WriteLine($"String of length {str.Length}");

// Negation pattern (C# 9+)
if (obj is not int)
    Console.WriteLine("Not an integer");

// Combined patterns (C# 9+)
object value = 42;
if (value is int i and > 0 and < 100)
    Console.WriteLine($"{i} is a positive two-digit number");

// 'or' pattern
if (value is 0 or > 100)
    Console.WriteLine("Zero or over 100");
```

C#'s pattern matching has reached a sophistication level comparable to Haskell or Rust. The combination of `switch` expressions, property patterns, relational patterns, list patterns, and logical connectors (`and`, `or`, `not`) lets you express complex conditional logic as readable, exhaustive case analysis rather than tangled `if/else` chains. When combined with sealed class hierarchies (covered in the Inheritance lesson), the compiler can verify that your switch is exhaustive — every possible case handled.
