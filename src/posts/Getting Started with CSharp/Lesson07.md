# Interfaces, Generics, and the Collections API

Two features define how most C# library code is structured: **interfaces** — contracts that types agree to implement — and **generics** — type-parameterized code that works across many types without sacrificing type safety. Combined, they're the backbone of the entire .NET Collections library and almost every framework you'll encounter.

## Interfaces

An interface is a contract: a named set of method and property signatures that any implementing type must provide. An interface has no implementation of its own (with one exception covered below) — it only says *what* must be there, not *how*:

```csharp
interface IShape
{
    double Area      { get; }
    double Perimeter { get; }
    string Describe();
}

class Circle : IShape
{
    public double Radius { get; }
    public Circle(double r) { Radius = r; }

    public double Area      => Math.PI * Radius * Radius;
    public double Perimeter => 2 * Math.PI * Radius;
    public string Describe() => $"Circle(r={Radius:F2}), area={Area:F2}";
}

class Square : IShape
{
    public double Side { get; }
    public Square(double s) { Side = s; }

    public double Area      => Side * Side;
    public double Perimeter => 4 * Side;
    public string Describe() => $"Square(s={Side}), area={Area:F2}";
}

// Write code against the interface — works for any implementing type
static void PrintShapeInfo(IShape shape)
{
    Console.WriteLine(shape.Describe());
    Console.WriteLine($"  Perimeter: {shape.Perimeter:F2}");
}

IShape[] shapes = { new Circle(5), new Square(4), new Circle(2) };
foreach (var shape in shapes)
    PrintShapeInfo(shape);
```

The key insight: `PrintShapeInfo` doesn't know or care whether it receives a `Circle`, `Square`, or anything else — it only cares that the thing implements `IShape`. This is **programming to an abstraction**.

## Implementing Multiple Interfaces

Unlike inheritance (one base class only), a class can implement any number of interfaces:

```csharp
interface IComparable<T>   // Already in .NET — shown here for clarity
{
    int CompareTo(T other);
}

interface IDescribable
{
    string Describe();
}

interface IPersistable
{
    string Serialize();
    static IPersistable Deserialize(string data) => throw new NotImplementedException();
}

class Product : IComparable<Product>, IDescribable, IPersistable
{
    public string Name  { get; init; }
    public decimal Price { get; init; }

    public Product(string name, decimal price) { Name = name; Price = price; }

    // IComparable<Product>
    public int CompareTo(Product? other)
    {
        if (other is null) return 1;
        return Price.CompareTo(other.Price);
    }

    // IDescribable
    public string Describe() => $"{Name} — ${Price:F2}";

    // IPersistable
    public string Serialize() => $"{Name}|{Price}";
}

var products = new[]
{
    new Product("Widget",  9.99m),
    new Product("Gadget",  24.99m),
    new Product("Doohickey", 4.49m),
};

Array.Sort(products);   // Works because Product implements IComparable<Product>
foreach (var p in products)
    Console.WriteLine(p.Describe());
// Doohickey — $4.49
// Widget — $9.99
// Gadget — $24.99
```

## Default Interface Methods (C# 8+)

Interfaces can provide a **default implementation** for a method. This lets you add new methods to an interface without breaking every existing implementor:

```csharp
interface ILogger
{
    void Log(string message);

    // Default implementation — implementors don't have to override this
    void LogError(string message) => Log($"[ERROR] {message}");
    void LogInfo(string message)  => Log($"[INFO] {message}");
}

class ConsoleLogger : ILogger
{
    public void Log(string message) => Console.WriteLine(message);
    // LogError and LogInfo come from the default implementation for free
}

ILogger logger = new ConsoleLogger();
logger.LogInfo("Server started");       // [INFO] Server started
logger.LogError("Connection refused");  // [ERROR] Connection refused
```

## Generics

Generics let you write a class, method, or interface that works with any type, specified at the call site. Without generics, you'd either write separate versions for each type (tedious, bug-prone) or use `object` and lose type safety:

```csharp
// Non-generic — loses type information
class BoxObject
{
    public object Value { get; set; }
}

// Generic — type is known at compile time
class Box<T>
{
    public T Value { get; set; }

    public Box(T value) { Value = value; }

    public override string ToString() => $"Box<{typeof(T).Name}>({Value})";
}

var intBox    = new Box<int>(42);
var stringBox = new Box<string>("hello");

Console.WriteLine(intBox.Value + 8);       // 50 — no cast needed, it's already int
Console.WriteLine(stringBox.Value.Length); // 5  — it's already string
Console.WriteLine(intBox);                 // Box<Int32>(42)
```

`T` is a **type parameter** — a placeholder filled in at the call site. The compiler generates appropriate code for each `T` used.

## Generic Methods

Type parameters can also appear on individual methods:

```csharp
static class Utilities
{
    // Swap any two values
    static void Swap<T>(ref T a, ref T b)
    {
        T temp = a;
        a = b;
        b = temp;
    }

    // Return the larger of two comparables
    static T Max<T>(T a, T b) where T : IComparable<T>
        => a.CompareTo(b) >= 0 ? a : b;

    // Wrap any value in a list
    static List<T> SingletonList<T>(T value) => new() { value };
}

int x = 5, y = 10;
Utilities.Swap(ref x, ref y);
Console.WriteLine($"x={x}, y={y}");   // x=10, y=5

Console.WriteLine(Utilities.Max(3, 7));         // 7
Console.WriteLine(Utilities.Max("apple", "banana")); // banana (alphabetical)
```

The compiler can often **infer** the type parameter from the arguments, so you write `Utilities.Swap(ref x, ref y)` rather than `Utilities.Swap<int>(ref x, ref y)`.

## Generic Constraints

Constraints restrict what types can be used for `T`. This lets you call methods on `T` that the unconstrained `object` type doesn't have:

```csharp
// where T : IComparable<T>  — T must implement IComparable<T>
static T Min<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) <= 0 ? a : b;

// where T : class  — T must be a reference type
static T? FirstOrNull<T>(IEnumerable<T> source) where T : class
    => source.FirstOrDefault();

// where T : struct  — T must be a value type (can use T?)
static T? ParseOrNull<T>(string input) where T : struct, IParsable<T>
    => T.TryParse(input, null, out T value) ? value : null;

// where T : new()  — T must have a parameterless constructor
static T CreateDefault<T>() where T : new() => new T();

// Multiple constraints
static void RegisterItem<T>(T item)
    where T : class, IDescribable, new()
{
    Console.WriteLine(item.Describe());
}
```

| Constraint | Meaning |
|---|---|
| `where T : class` | T is a reference type |
| `where T : struct` | T is a value type |
| `where T : new()` | T has a parameterless constructor |
| `where T : SomeClass` | T inherits from SomeClass |
| `where T : ISomeInterface` | T implements ISomeInterface |
| `where T : IComparable<T>` | Common for sorting/comparing |

## The Collections API

The .NET Collections library is built on interfaces and generics. The central hierarchy:

```
IEnumerable<T>          — can be iterated with foreach
  └─ ICollection<T>     — count, add, remove, contains
       └─ IList<T>       — indexed access ([], IndexOf)
       └─ ISet<T>        — set operations (union, intersection)
  └─ IDictionary<K,V>   — key→value mapping
```

### `List<T>`

The workhorse: a resizable array. Use it when you need ordered, indexed access:

```csharp
var names = new List<string> { "Alice", "Bob", "Charlie" };

// Add / remove
names.Add("Dave");
names.Insert(1, "Aaron");              // Insert at index 1
names.Remove("Bob");                   // Remove first "Bob"
names.RemoveAt(0);                     // Remove by index

// Query
Console.WriteLine(names.Count);       // Number of elements
Console.WriteLine(names.Contains("Dave"));    // True
Console.WriteLine(names.IndexOf("Charlie"));  // Current index

// Sort and search
names.Sort();
int idx = names.BinarySearch("Charlie");
Console.WriteLine(idx >= 0 ? $"Found at {idx}" : "Not found");

// Convert and iterate
string[] arr = names.ToArray();
foreach (string name in names)
    Console.Write(name + " ");
Console.WriteLine();
```

### `Dictionary<TKey, TValue>`

Key-value storage with O(1) average-case lookup:

```csharp
var scores = new Dictionary<string, int>
{
    ["Alice"]   = 95,
    ["Bob"]     = 82,
    ["Charlie"] = 91,
};

// Add / update
scores["Dave"]  = 88;           // Add new key
scores["Alice"] = 97;           // Update existing

// Safe retrieval — avoid KeyNotFoundException
if (scores.TryGetValue("Eve", out int eveScore))
    Console.WriteLine($"Eve: {eveScore}");
else
    Console.WriteLine("Eve not found");

// Iterate
foreach (var (name, score) in scores.OrderByDescending(kv => kv.Value))
    Console.WriteLine($"  {name}: {score}");

// Keys and values as collections
Console.WriteLine(string.Join(", ", scores.Keys));
Console.WriteLine(scores.ContainsKey("Bob"));     // True
scores.Remove("Bob");
```

### `HashSet<T>`

A set of unique values. Insertion, removal, and membership testing are all O(1). No duplicates, no guaranteed order:

```csharp
var visited = new HashSet<string>();

string[] urls = { "a.com", "b.com", "a.com", "c.com", "b.com" };
foreach (var url in urls)
{
    if (visited.Add(url))   // Add returns false if already present
        Console.WriteLine($"First visit: {url}");
}
// First visit: a.com
// First visit: b.com
// First visit: c.com

// Set operations
var setA = new HashSet<int> { 1, 2, 3, 4, 5 };
var setB = new HashSet<int> { 3, 4, 5, 6, 7 };

var union     = new HashSet<int>(setA); union.UnionWith(setB);
var intersect = new HashSet<int>(setA); intersect.IntersectWith(setB);
var diff      = new HashSet<int>(setA); diff.ExceptWith(setB);

Console.WriteLine(string.Join(",", union));     // 1,2,3,4,5,6,7
Console.WriteLine(string.Join(",", intersect)); // 3,4,5
Console.WriteLine(string.Join(",", diff));      // 1,2
```

### `Queue<T>` and `Stack<T>`

FIFO and LIFO structures:

```csharp
// Queue: First In, First Out
var taskQueue = new Queue<string>();
taskQueue.Enqueue("Task A");
taskQueue.Enqueue("Task B");
taskQueue.Enqueue("Task C");

while (taskQueue.Count > 0)
{
    string task = taskQueue.Dequeue();   // Remove and return front
    Console.WriteLine($"Processing: {task}");
}
// Processing: Task A, then B, then C

// Stack: Last In, First Out
var history = new Stack<string>();
history.Push("page1");
history.Push("page2");
history.Push("page3");

Console.WriteLine(history.Peek());     // page3 — look without removing
Console.WriteLine(history.Pop());      // page3 — remove and return
Console.WriteLine(history.Count);      // 2
```

## Choosing the Right Collection

| Need | Type |
|---|---|
| Ordered list, indexed | `List<T>` |
| Key → value lookup | `Dictionary<TKey, TValue>` |
| Unique values, fast contains | `HashSet<T>` |
| FIFO processing queue | `Queue<T>` |
| LIFO (undo, call stack) | `Stack<T>` |
| Thread-safe queue | `ConcurrentQueue<T>` |
| Sorted by key | `SortedDictionary<K,V>` |
| Read-only after creation | `IReadOnlyList<T>`, `.AsReadOnly()` |

## `IEnumerable<T>` as a Universal Input Type

When writing methods that receive collections, prefer `IEnumerable<T>` as the parameter type. This accepts arrays, lists, sets, query results — anything iterable:

```csharp
// Accepts any sequence: array, List, HashSet, LINQ result...
static double Average(IEnumerable<double> values)
{
    double sum = 0;
    int count = 0;
    foreach (var v in values)
    {
        sum += v;
        count++;
    }
    return count > 0 ? sum / count : 0;
}

Console.WriteLine(Average(new[] { 1.0, 2.0, 3.0 }));           // Array
Console.WriteLine(Average(new List<double> { 10, 20, 30 }));    // List
Console.WriteLine(Average(Enumerable.Range(1, 10).Select(n => (double)n))); // LINQ
```

This is the **Liskov Substitution Principle** in practice: code that depends on `IEnumerable<T>` works with any concrete type that implements it, making it far more reusable.
