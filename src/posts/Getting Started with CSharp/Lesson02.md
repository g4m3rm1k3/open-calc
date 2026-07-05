# Variables and the Type System: Storing and Working with Data

## The Type System: Value Types, Reference Types, and Unified Hierarchy

C#'s type system is built on a single principle that distinguishes it from both Java and C++: **everything is an object**. An `int` in C# inherits from `System.Object`. You can call `.ToString()` on it. You can pass it to a method that accepts `object`. This is the **unified type system** — there is no primitive/object split like in Java.

How can an `int` be an object and still be stored efficiently on the stack? The answer is the **value type / reference type** distinction, combined with **boxing** — a mechanism that wraps value types in heap-allocated objects when needed. Understanding this distinction is fundamental to writing efficient C#.

Every program needs to store information while it runs — a user's name, a score, a price, a list of items. In C#, every piece of data has a **type** that tells the compiler what kind of data it is, how much memory to use, and what you're allowed to do with it. Understanding types is the foundation of everything else in C#.

## Variables: Named Storage Boxes

A **variable** is a named slot in memory that holds a value. You declare a variable by writing its type, then its name, then optionally giving it a starting value:

```csharp
// type  name  = value;
int    age    = 25;
string name   = "Alice";
double price  = 9.99;
bool   isOpen = true;
```

Once declared, you can read the variable's value or change it:

```csharp
int score = 0;
Console.WriteLine(score);  // 0

score = 10;                 // Change the value
Console.WriteLine(score);  // 10

score = score + 5;          // Read it, add 5, store the result
Console.WriteLine(score);  // 15
```

## The Built-In Types

C# comes with a set of **built-in types** for the most common kinds of data. Here are the ones you'll use every day:

### Whole numbers (integers)

```csharp
int count = 100;          // Whole numbers from about -2 billion to +2 billion
                          // This is by far the most common number type

long bigNumber = 10_000_000_000L;  // For very large whole numbers (L at the end marks it as long)
                                   // The underscores are just for readability — like commas in 10,000,000,000

byte smallByte = 255;    // Whole numbers from 0 to 255 — used for raw data like image pixels
```

### Decimal numbers (floating point)

```csharp
double height = 1.85;    // Numbers with a decimal point — the default for most maths
                         // Very fast, but has tiny rounding errors (0.1 + 0.2 is not exactly 0.3)

float rough = 3.14f;     // Like double but less precise — the 'f' at the end is required
                         // Less common in modern code

decimal price = 19.99m;  // For money and finances — the 'm' at the end is required
                         // Slower than double, but doesn't have rounding errors
                         // ALWAYS use decimal for money, never double
```

Why does money need a special type? Because `double` uses binary fractions internally, and some decimal values (like 0.1) can't be represented exactly in binary — just like 1/3 can't be written exactly as a decimal. This causes tiny errors that add up over financial calculations.

### Text

```csharp
string firstName = "John";    // Any sequence of characters (text)
                              // Written in double quotes

char initial = 'J';           // A single character — written in single quotes
                              // 'J' is char, "J" is string — they're different types
```

### True/False

```csharp
bool isLoggedIn = true;       // Only two possible values: true or false
bool hasPermission = false;

// Used in conditions — more on this in Lesson 04
if (isLoggedIn)
{
    Console.WriteLine("Welcome back!");
}
```

## `var`: Let the Compiler Figure Out the Type

Writing the type name every time can be verbose. C# lets you use `var` instead — the compiler looks at the value you're assigning and figures out the type automatically. The type is still fixed; you just don't have to type it:

```csharp
var name = "Alice";      // Compiler sees a string in quotes → type is string
var age = 30;            // Compiler sees a whole number → type is int
var price = 9.99;        // Compiler sees a decimal number → type is double
var isOpen = true;       // Compiler sees true/false → type is bool

// 'var' doesn't mean "anything goes" — the type is locked in at this point:
var count = 0;
// count = "hello";  // Compile error: count is an int, you can't put a string in it
```

Use `var` when the type is obvious from the right-hand side. Use the explicit type name when it makes the code clearer.

## String Operations: Working with Text

`string` is one of the most used types. Here are the operations you'll use constantly:

```csharp
string firstName = "Alice";
string lastName  = "Smith";

// Joining strings together
string fullName = firstName + " " + lastName;
Console.WriteLine(fullName);   // Alice Smith

// String interpolation — the modern, cleaner way
// Put a $ before the quote, then use {variableName} inside
string greeting = $"Hello, {firstName}! You are a {lastName}.";
Console.WriteLine(greeting);   // Hello, Alice! You are a Smith.

// You can do calculations inside the {}
int age = 25;
Console.WriteLine($"In 10 years you'll be {age + 10}.");   // In 10 years you'll be 35.

// Useful string properties and methods
string sentence = "  Hello, World!  ";

Console.WriteLine(sentence.Length);           // 17 — number of characters (including spaces)
Console.WriteLine(sentence.Trim());           // "Hello, World!" — removes spaces from both ends
Console.WriteLine(sentence.ToUpper());        // "  HELLO, WORLD!  "
Console.WriteLine(sentence.ToLower());        // "  hello, world!  "
Console.WriteLine(sentence.Contains("World")); // True
Console.WriteLine(sentence.Replace("World", "C#")); // "  Hello, C#!  "

// Checking if a string is empty
string empty = "";
Console.WriteLine(string.IsNullOrEmpty(empty));        // True
Console.WriteLine(string.IsNullOrWhiteSpace("   "));   // True (only spaces)
```

## Value Types vs Reference Types: A Critical Distinction

This is one of the most important concepts in C#. Types fall into two categories, and they behave very differently when you copy them.

### Value Types: You Get Your Own Copy

When you copy a **value type**, you get a completely independent copy. Changing one does not affect the other. Think of it like photocopying a document — each person has their own copy.

```csharp
int a = 10;
int b = a;   // b gets a copy of a's value

b = 20;      // Change b

Console.WriteLine($"a = {a}");   // a = 10 — a is unchanged
Console.WriteLine($"b = {b}");   // b = 20 — only b changed
```

All the built-in number types (`int`, `double`, `decimal`, etc.), `bool`, and `char` are value types.

### Reference Types: You Share the Same Object

When you copy a **reference type**, you copy the *address* of the object in memory — not the object itself. Both variables now point to the **same object**. Changing it through one variable affects what you see through the other. Think of it like giving two people directions to the same house — there's still only one house.

```csharp
// A class is a reference type (more on classes in Lesson 03)
// For now, just understand the copying behaviour

int[] numbers1 = { 1, 2, 3 };   // arrays are reference types
int[] numbers2 = numbers1;        // numbers2 points to the SAME array

numbers2[0] = 99;                 // Change through numbers2

Console.WriteLine(numbers1[0]);   // 99 — numbers1 sees the change too!
Console.WriteLine(numbers2[0]);   // 99
```

`string`, arrays, and any class you create are reference types. `string` is a special case — it behaves like a value type in practice because strings in C# are **immutable** (they can never be changed after creation). Any operation that "changes" a string actually creates a new one.

```csharp
string s1 = "hello";
string s2 = s1;       // s2 points to the same string object

s2 = s2.ToUpper();    // ToUpper() creates a BRAND NEW string — it doesn't modify the existing one

Console.WriteLine(s1);   // hello — unchanged
Console.WriteLine(s2);   // HELLO — s2 now points to the new string
```

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

## `null`: The Absence of a Value

For reference types, there's a special value called `null` that means "this variable isn't pointing to anything":

```csharp
string? name = null;   // The ? means this string is allowed to be null

Console.WriteLine(name);            // (prints nothing — null displayed as empty)
Console.WriteLine(name == null);    // True

// Trying to call a method on null crashes the program:
// Console.WriteLine(name.Length);  // Would crash: NullReferenceException

// Always check for null before using a nullable variable:
if (name != null)
{
    Console.WriteLine(name.Length);   // Safe — we checked first
}
```

The `?` after the type (`string?`) is called a **nullable annotation**. It's a promise to the compiler: "this variable might be null." Without the `?`, modern C# assumes the variable will never be null and warns you if you try to pass null to it.

## Null Safety Shortcuts

Checking for null is so common that C# has shortcuts:

```csharp
string? city = null;

// ?? (null coalescing): "use this value, or if it's null, use the thing after ??"
string displayCity = city ?? "Unknown";
Console.WriteLine(displayCity);   // Unknown

city = "London";
displayCity = city ?? "Unknown";
Console.WriteLine(displayCity);   // London

// ?. (null conditional): "call this method, but if the object is null, just return null instead of crashing"
int? length = city?.Length;       // If city is null, length is null. If not, length = city.Length
Console.WriteLine(length);        // 6

city = null;
length = city?.Length;
Console.WriteLine(length);        // (empty — null)

// ??= (null coalescing assignment): "if the variable is null, set it to this value"
string? username = null;
username ??= "Guest";             // username is null, so it gets set to "Guest"
Console.WriteLine(username);      // Guest
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


## Type Conversions: Changing Between Types

Sometimes you need to convert a value from one type to another.

### Implicit conversion: safe, automatic

When converting to a bigger type (no data can be lost), C# does it automatically:

```csharp
int smallNumber = 100;
long bigNumber = smallNumber;   // int fits inside long — automatic, no data loss

float f = 3.14f;
double d = f;                   // float fits inside double — automatic
```

### Explicit conversion (casting): you take responsibility

When converting might lose data, you must explicitly say you know what you're doing by writing the target type in parentheses:

```csharp
double precise = 9.99;
int rounded = (int)precise;     // Cast: cuts off the decimal part (doesn't round)
Console.WriteLine(rounded);     // 9 — the .99 is lost

long big = 1_000_000_000_000L;
int small = (int)big;           // Dangerous! This number doesn't fit in an int
Console.WriteLine(small);       // Garbage number — data was lost
```

### Parsing: converting text to numbers

When a user types something, it arrives as a `string`. To use it as a number, you need to parse it:

```csharp
string input = "42";

// int.Parse: converts string to int — throws an exception if the string isn't a valid number
int number = int.Parse(input);
Console.WriteLine(number + 8);   // 50

// int.TryParse: safer — returns true/false instead of crashing
// 'out int result' is where the parsed number gets stored if successful
if (int.TryParse("abc", out int result))
{
    Console.WriteLine($"Parsed: {result}");
}
else
{
    Console.WriteLine("That wasn't a valid number.");   // This runs
}

// Converting to string: call .ToString() on anything
int score = 100;
string scoreText = score.ToString();
Console.WriteLine(scoreText + " points");   // 100 points

// Or just use string interpolation — it calls ToString() for you
Console.WriteLine($"{score} points");   // 100 points
```

## Constants: Values That Never Change

If a value should never change after you set it, declare it with `const`. This stops you or anyone else from accidentally changing it later, and makes the intent clear:

```csharp
const double Pi = 3.141592653589793;
const int MaxLoginAttempts = 3;
const string AppName = "My App";

// Pi = 3;   // Compile error: you cannot assign to a const

// Constants are great for things like:
const decimal TaxRate = 0.20m;    // 20% tax
const int DaysInWeek = 7;
```

## Putting It All Together: A Simple Example

```csharp
// A small program that calculates the cost of items in a basket

const decimal TaxRate = 0.20m;

string itemName  = "Wireless Headphones";
int    quantity  = 2;
decimal unitPrice = 49.99m;

decimal subtotal = quantity * unitPrice;
decimal tax      = subtotal * TaxRate;
decimal total    = subtotal + tax;

Console.WriteLine($"Item:     {itemName}");
Console.WriteLine($"Quantity: {quantity}");
Console.WriteLine($"Price:    {unitPrice:C}");     // :C formats as currency (e.g. £49.99)
Console.WriteLine($"Subtotal: {subtotal:C}");
Console.WriteLine($"Tax:      {tax:C}");
Console.WriteLine($"Total:    {total:C}");
```

The `{value:C}` format specifier inside string interpolation formats a number as a currency value with the appropriate symbol for your region. Format specifiers are a quick way to control how numbers and dates appear in output — you'll see them often.

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

