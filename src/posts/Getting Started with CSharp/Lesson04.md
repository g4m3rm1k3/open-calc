# Control Flow: Making Decisions in Code

Every program has to make decisions. Should we show an error or continue? Which discount applies to this order? What should happen when the user presses a key? **Control flow** is how you express those decisions in code — which path to take, and under what conditions.

C#'s control flow statements started as near-copies of Java and C — `if`, `while`, `for`, `switch` with familiar syntax. But the language has evolved them significantly. C# 7 began adding **pattern matching** to `switch`. C# 8 introduced **switch expressions**. C# 9 added **relational patterns** and **logical patterns**. By C# 10 and 11, C#'s pattern matching system had become one of the most expressive in any mainstream language.

Understanding this evolution — from imperative branching to declarative pattern decomposition — is essential to reading modern C# code.

## The `if` Statement

The most fundamental decision: "do this *if* some condition is true":

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
```

Each condition is checked in order from top to bottom. The moment one is true, that block runs and the rest are skipped. Only the `else` block (if present) runs when none of the conditions were true.

**C# requires an actual boolean condition** — unlike C or JavaScript, a non-zero number doesn't count as true:

```csharp
int n = 5;
// if (n) { }   // Compile error in C# — unlike C/C++/JavaScript
if (n != 0) { Console.WriteLine("Non-zero"); }   // Correct
```

This is intentional. It catches a whole category of bugs where `if (x = 0)` (assignment) was meant to be `if (x == 0)` (comparison). C# won't let you accidentally assign inside an `if`.

**Guard clauses**: a common pattern for readable code is to handle the error cases early and return, rather than nesting deeply:

```csharp
// Hard to read — deeply nested
static string GetUserCity(User? user)
{
    if (user != null)
    {
        if (user.Address != null)
        {
            if (user.Address.City != null)
            {
                return user.Address.City;
            }
        }
    }
    return "Unknown";
}

// Guard clause pattern — same logic, much cleaner
static string GetUserCity(User? user)
{
    if (user is null)         return "Unknown";
    if (user.Address is null) return "Unknown";
    if (user.Address.City is null) return "Unknown";

    return user.Address.City;
}

// Even cleaner — null-conditional chain (covered in Lesson 02)
static string GetUserCity(User? user) => user?.Address?.City ?? "Unknown";
```

## The Ternary Operator: Inline if/else

When you want to choose between two values based on a condition, the ternary operator (`?:`) lets you do it in a single expression:

```csharp
int age = 20;

// Long form:
string label;
if (age >= 18)
    label = "adult";
else
    label = "minor";

// Ternary — exactly the same result, one line:
string label2 = age >= 18 ? "adult" : "minor";

Console.WriteLine(label2);   // adult
```

The structure is: `condition ? value_if_true : value_if_false`. Use it for simple choices. Avoid nesting ternaries — deeply nested ones become unreadable fast.

## `is` Expressions: Testing Type and Value Together

The `is` keyword lets you check if a value matches a type or pattern. It's much more powerful in C# than in most other languages:

```csharp
object obj = "Hello, C#!";

// Basic type check (like instanceof in Java)
if (obj is string)
    Console.WriteLine("It's a string");

// Pattern variable (C# 7+): check AND extract in one step
// If obj is a string, it's assigned to 'str' — no cast needed
if (obj is string str)
    Console.WriteLine($"String of length {str.Length}");

// Negation pattern (C# 9+)
if (obj is not int)
    Console.WriteLine("Not an integer");

// Combined conditions using 'and' / 'or' (C# 9+)
object value = 42;
if (value is int i and > 0 and < 100)
    Console.WriteLine($"{i} is a positive two-digit number or less");

if (value is 0 or > 100)
    Console.WriteLine("Zero or over 100");
```

The pattern variable — `obj is string str` — eliminates the old pattern of checking and then casting separately: `if (obj is string) { string str = (string)obj; ... }`. The check and the variable binding happen simultaneously, and the compiler knows `str` is non-null inside the `if`.

## The Classic `switch` Statement

`switch` tests a single value against multiple specific cases. It's cleaner than a long `else if` chain when testing the same variable many times:

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
        // Empty case fall-through IS allowed — both 6 and 7 hit "Weekend"
        Console.WriteLine("Weekend");
        break;
    default:
        Console.WriteLine("Weekday");
        break;
}
```

**Important for programmers from C or Java**: C# does *not* allow implicit fall-through between non-empty cases. This is on purpose — fall-through is a notorious source of bugs in C and Java. If a `case` has code and doesn't end with `break`, `return`, or `throw`, the compiler rejects it. The only exception is empty cases (which stack up intentionally, like `case 6:` / `case 7:` above).

`switch` works on strings too, and the comparison is case-sensitive:

```csharp
string command = "help";
switch (command)
{
    case "help":
    case "?":
        Console.WriteLine("Showing help...");
        break;
    case "quit":
    case "exit":
        Console.WriteLine("Goodbye.");
        break;
    default:
        Console.WriteLine($"Unknown command: {command}");
        break;
}
```

## Switch Expressions (C# 8+): Concise and Value-Producing

The classic `switch` statement is verbose. C# 8 introduced **switch expressions** — a more concise form that produces a value directly:

```csharp
int day = 3;

// Switch expression — each arm is: pattern => result
// No 'break' needed, _ is the default case (like 'else')
string dayName = day switch
{
    1 => "Monday",
    2 => "Tuesday",
    3 => "Wednesday",
    4 => "Thursday",
    5 => "Friday",
    6 => "Saturday",
    7 => "Sunday",
    _ => "Invalid"
};

Console.WriteLine(dayName);   // Wednesday
```

The difference from the classic switch:
- The value being tested comes *before* the `switch` keyword: `day switch`
- Each arm is `pattern => result`, separated by commas
- No `break` needed — there's no fall-through possible
- The whole thing is an **expression** — it produces a value you can assign, return, or pass directly

Switch expressions with **relational patterns** (C# 9) let you match ranges:

```csharp
double score = 87.5;

string grade = score switch
{
    >= 90 => "A",   // >= 90 is a relational pattern
    >= 80 => "B",
    >= 70 => "C",
    >= 60 => "D",
    _     => "F"
};

Console.WriteLine($"Grade: {grade}");   // Grade: B
```

The compiler checks arms in order and picks the first that matches — so `>= 80` doesn't need to say `>= 80 and < 90`; it only runs if `>= 90` didn't match.

## Pattern Matching: The Heart of Modern C# Branching

Pattern matching lets you test both the **type** and the **shape** of a value in a single expression. It's one of C#'s most expressive features, added progressively since C# 7:

```csharp
object[] items = { 42, "hello", 3.14, true, null, new int[] { 1, 2, 3 } };

foreach (object item in items)
{
    // Each arm tests: is this the right type? Does it match the condition?
    // The matched value is also extracted into a local variable (i, s, d, etc.)
    string description = item switch
    {
        int i when i > 100         => $"Large integer: {i}",   // 'when' adds extra conditions
        int i                      => $"Integer: {i}",
        string s when s.Length > 3 => $"Long string: \"{s}\"",
        string s                   => $"Short string: \"{s}\"",
        double d                   => $"Double: {d:F2}",
        bool b                     => $"Boolean: {b}",
        null                       => "Null value",
        int[] arr                  => $"Array of {arr.Length} ints",
        _                          => $"Other: {item}"
    };

    Console.WriteLine(description);
}
```

`when` adds a **guard clause** to a pattern arm — "match this type AND only if this condition is also true." If the `when` condition is false, the arm is skipped and matching continues.

## Property Patterns (C# 8+): Matching on Object Shape

Property patterns let you match against the values of an object's properties — without extracting and testing them separately:

```csharp
record Point(double X, double Y);
record Circle(Point Center, double Radius);

static string ClassifyCircle(Circle c) => c switch
{
    // Match on a specific property value
    { Radius: 0 }                              => "Degenerate (a point)",

    // Match and extract a property into a variable
    { Radius: var r } when r < 1               => $"Tiny circle, r={r:F2}",

    // Match nested properties — Center.X and Center.Y
    { Center: { X: 0, Y: 0 }, Radius: var r } => $"Centred at origin, r={r:F2}",

    // Catch-all with extraction
    { Radius: var r }                          => $"Circle, r={r:F2}"
};

Console.WriteLine(ClassifyCircle(new Circle(new Point(0, 0), 5)));    // Centred at origin, r=5.00
Console.WriteLine(ClassifyCircle(new Circle(new Point(3, 4), 0)));    // Degenerate (a point)
Console.WriteLine(ClassifyCircle(new Circle(new Point(1, 2), 0.5)));  // Tiny circle, r=0.50
```

This pattern is especially powerful with **sealed class hierarchies** — when the compiler knows all possible subtypes, it can warn you if your switch doesn't cover every case (exhaustiveness checking).

## List Patterns (C# 11+): Matching on Sequence Structure

C# 11 added patterns for matching arrays and lists by their structure:

```csharp
static string DescribeList(int[] data) => data switch
{
    []                      => "Empty",
    [var only]              => $"One element: {only}",
    [var first, var second] => $"Exactly two: {first} and {second}",
    [1, 2, ..]              => "Starts with 1, 2",       // .. means "any remaining elements"
    [.., 99]                => "Ends with 99",
    [var head, .. var rest] => $"First={head}, {rest.Length} more elements"
};

Console.WriteLine(DescribeList(Array.Empty<int>()));      // Empty
Console.WriteLine(DescribeList(new[] { 42 }));             // One element: 42
Console.WriteLine(DescribeList(new[] { 1, 2, 3, 4 }));    // Starts with 1, 2
Console.WriteLine(DescribeList(new[] { 5, 6, 7, 99 }));   // Ends with 99
```

The `..` (slice pattern) matches any number of elements and optionally captures them — `.. var rest` captures the remaining elements as a new array.

## Logical Patterns: `and`, `or`, `not`

C# 9 introduced logical combinators for patterns. These work inside patterns, not just in conditions:

```csharp
// 'not' pattern — cleaner than != null
string? name = GetName();
if (name is not null)
    Console.WriteLine(name.ToUpper());

// 'and' — multiple conditions combined
static string Classify(int n) => n switch
{
    < 0           => "negative",
    0             => "zero",
    > 0 and < 10  => "single digit",
    > 0 and < 100 => "two digits",
    _             => "large"
};

// 'or' — match any of several values
static bool IsWeekend(DayOfWeek day) =>
    day is DayOfWeek.Saturday or DayOfWeek.Sunday;

Console.WriteLine(IsWeekend(DayOfWeek.Monday));    // False
Console.WriteLine(IsWeekend(DayOfWeek.Saturday));  // True
```

These logical patterns work inside any pattern context — `is`, `switch` arms, case guards — making complex conditions readable without nested `&&` chains.

## Exhaustiveness and the Compiler Safety Net

One significant advantage of switch expressions over `if/else` chains: the compiler can verify **exhaustiveness** — that every possible case is handled. If you remove the `_` default and don't cover all cases, you get a compile warning.

With sealed type hierarchies (where the compiler knows every possible subtype), this becomes compile-time verification that your logic is complete:

```csharp
// All possible shapes are sealed — compiler knows this is the complete list
abstract record Shape;
sealed record Circle(double Radius) : Shape;
sealed record Rectangle(double Width, double Height) : Shape;
sealed record Triangle(double Base, double Height) : Shape;

static double GetArea(Shape shape) => shape switch
{
    Circle c      => Math.PI * c.Radius * c.Radius,
    Rectangle r   => r.Width * r.Height,
    Triangle t    => 0.5 * t.Base * t.Height,
    // No _ needed — compiler knows these three cover all cases
    // If you add a new Shape subclass, this switch becomes a compile warning
};
```

This turns what is traditionally a runtime failure (forgetting to handle a new case) into a compile-time warning — one of the most practical benefits of C#'s pattern matching system.

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

## Choosing the Right Tool

| Situation | Best choice |
|---|---|
| Simple true/false condition | `if` / `else if` |
| Two-value inline choice | Ternary `? :` |
| Choosing from a known set of values | `switch` expression |
| Testing type and extracting value | `is` with pattern variable |
| Complex object structure matching | Property pattern in `switch` |
| Range/bounds checking | Relational patterns (`>= 80 => "B"`) |
| Sequence structure | List patterns (`[first, .. rest]`) |
