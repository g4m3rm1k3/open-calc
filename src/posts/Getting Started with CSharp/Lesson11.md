# Extension Methods and LINQ in Depth

In Lesson 04 you saw LINQ used to filter and transform collections. Here we'll go deeper: how LINQ is actually built (using **extension methods**), how to write your own extension methods, and the full set of LINQ operations that courses commonly test.

## Extension Methods: Adding Methods to Types You Don't Own

Normally, to add a method to a type, you edit that type's source code. But what if you want to add a method to `string`, or `int`, or a .NET collection type? You can't edit those — they're part of the .NET framework. Extension methods let you **add** methods to any type without touching its source code.

An extension method is a `static` method in a `static` class where the first parameter has the keyword `this` in front of it. That `this` tells C# "this method extends the type of this parameter":

```csharp
// A static class to hold extension methods
static class StringExtensions
{
    // 'this string s' means: this method extends the 'string' type
    // 's' will be the string instance the method is called on
    public static bool IsNullOrEmpty(this string? s)
    {
        return s == null || s.Length == 0;
    }

    // Multiple parameters: 'this' is always first, others are regular parameters
    public static string Repeat(this string s, int times)
    {
        // string.Concat joins an enumerable of strings
        return string.Concat(Enumerable.Repeat(s, times));
    }

    public static string TruncateAt(this string s, int maxLength)
    {
        if (s.Length <= maxLength) return s;
        return s[..maxLength] + "...";   // Range syntax: s[0..maxLength]
    }

    public static string ToTitleCase(this string s)
    {
        if (string.IsNullOrEmpty(s)) return s;

        // Split into words, capitalize first letter of each, rejoin
        return string.Join(" ",
            s.Split(' ')
             .Select(word => word.Length > 0
                 ? char.ToUpper(word[0]) + word[1..].ToLower()
                 : word));
    }
}

// Now you can call these as if they were built-in string methods:
string name = "hello world";

Console.WriteLine(name.IsNullOrEmpty());            // False
Console.WriteLine("ha".Repeat(3));                  // hahaha
Console.WriteLine("This is a very long sentence".TruncateAt(10));  // This is a...
Console.WriteLine("the quick brown fox".ToTitleCase());             // The Quick Brown Fox

// Works with null too
string? empty = null;
Console.WriteLine(empty.IsNullOrEmpty());           // True (no NullReferenceException!)
```

The key point: `name.TruncateAt(10)` looks exactly like a normal method call on `string`, but `string` itself has no `TruncateAt` method. The compiler translates it to `StringExtensions.TruncateAt(name, 10)`.

## How LINQ Uses Extension Methods

Every LINQ method (`Where`, `Select`, `OrderBy`, etc.) is an extension method on `IEnumerable<T>`. That's why they work on any collection — arrays, lists, sets, query results — anything that implements `IEnumerable<T>`.

```csharp
// This is roughly what the built-in Where extension method looks like internally:
static class EnumerableExtensions
{
    public static IEnumerable<T> Where<T>(this IEnumerable<T> source, Func<T, bool> predicate)
    {
        foreach (T item in source)
        {
            if (predicate(item))
                yield return item;   // Return matching items one at a time (lazily)
        }
    }
}

// When you write this:
var evens = numbers.Where(n => n % 2 == 0);

// The compiler sees:
var evens = EnumerableExtensions.Where(numbers, n => n % 2 == 0);
```

Understanding this demystifies LINQ entirely: every `.Where(...)`, `.Select(...)`, `.OrderBy(...)` is just a static method being called, passing your lambda as an argument.

## LINQ: Core Operations

Let's build up from what you know with a realistic dataset:

```csharp
record Student(string Name, int Age, string Major, double GPA);

var students = new List<Student>
{
    new("Alice",   22, "Computer Science", 3.8),
    new("Bob",     20, "Mathematics",      3.2),
    new("Carol",   23, "Computer Science", 3.9),
    new("Dave",    21, "Physics",          2.9),
    new("Eve",     22, "Mathematics",      3.6),
    new("Frank",   24, "Physics",          3.1),
    new("Grace",   20, "Computer Science", 3.7),
};
```

### `Where` — Filtering

`Where` keeps only elements that satisfy a condition (the predicate returns `true`):

```csharp
// Students with GPA above 3.5
var highAchievers = students.Where(s => s.GPA > 3.5);

foreach (var s in highAchievers)
    Console.WriteLine($"{s.Name}: {s.GPA}");
// Alice: 3.8
// Carol: 3.9
// Eve: 3.6
// Grace: 3.7

// Multiple conditions: use && and ||
var youngCS = students.Where(s => s.Major == "Computer Science" && s.Age <= 22);
```

### `Select` — Transforming

`Select` transforms each element into something else. The output collection has the same number of items as the input, but each item is transformed:

```csharp
// Get just the names
IEnumerable<string> names = students.Select(s => s.Name);
Console.WriteLine(string.Join(", ", names));
// Alice, Bob, Carol, Dave, Eve, Frank, Grace

// Create a new anonymous object with selected properties
var summary = students.Select(s => new
{
    s.Name,
    Grade = s.GPA >= 3.5 ? "A" : s.GPA >= 3.0 ? "B" : "C"
});

foreach (var item in summary)
    Console.WriteLine($"{item.Name}: {item.Grade}");
```

### `OrderBy` and `OrderByDescending` — Sorting

```csharp
// Sort by GPA, lowest first
var byGpa = students.OrderBy(s => s.GPA);

// Sort by GPA, highest first
var byGpaDesc = students.OrderByDescending(s => s.GPA);

// Sort by major, then by GPA within each major
var byMajorThenGpa = students
    .OrderBy(s => s.Major)
    .ThenByDescending(s => s.GPA);

foreach (var s in byMajorThenGpa)
    Console.WriteLine($"{s.Major,-20} {s.Name,-10} {s.GPA}");
```

### `GroupBy` — Grouping Elements

`GroupBy` splits a sequence into groups based on a key. Each group has a `Key` property and contains all the elements that share that key:

```csharp
// Group students by their major
var byMajor = students.GroupBy(s => s.Major);

foreach (var group in byMajor)
{
    // group.Key is the major name ("Computer Science", "Mathematics", etc.)
    Console.WriteLine($"\n{group.Key}:");

    // group itself is an IEnumerable<Student> — all students in this major
    foreach (var student in group)
        Console.WriteLine($"  {student.Name} ({student.GPA})");
}

// Calculate average GPA per major
var avgGpaByMajor = students
    .GroupBy(s => s.Major)
    .Select(group => new
    {
        Major = group.Key,
        AverageGPA = group.Average(s => s.GPA),
        Count = group.Count()
    })
    .OrderByDescending(m => m.AverageGPA);

foreach (var m in avgGpaByMajor)
    Console.WriteLine($"{m.Major}: avg GPA = {m.AverageGPA:F2} ({m.Count} students)");
```

### `SelectMany` — Flattening Nested Collections

`Select` produces one output per input. `SelectMany` is used when each input produces *multiple* outputs and you want them all flattened into one sequence:

```csharp
// Each student has a list of courses — we want all courses across all students
record StudentWithCourses(string Name, List<string> Courses);

var students2 = new List<StudentWithCourses>
{
    new("Alice", new() { "Algorithms", "Databases", "Networks" }),
    new("Bob",   new() { "Calculus", "Statistics" }),
    new("Carol", new() { "Algorithms", "Machine Learning", "Databases" }),
};

// Select would give: [["Algorithms","Databases","Networks"], ["Calculus","Statistics"], ...]
// SelectMany flattens it: ["Algorithms", "Databases", "Networks", "Calculus", ...]
IEnumerable<string> allCourses = students2.SelectMany(s => s.Courses);
Console.WriteLine(string.Join(", ", allCourses));

// Find unique courses (using Distinct to remove duplicates)
var uniqueCourses = students2
    .SelectMany(s => s.Courses)
    .Distinct()
    .OrderBy(c => c);

Console.WriteLine(string.Join(", ", uniqueCourses));
// Algorithms, Calculus, Databases, Machine Learning, Networks, Statistics
```

### Aggregation: `Count`, `Sum`, `Average`, `Min`, `Max`

These reduce a sequence to a single value:

```csharp
Console.WriteLine($"Total students: {students.Count()}");
Console.WriteLine($"CS students: {students.Count(s => s.Major == "Computer Science")}");
Console.WriteLine($"Average GPA: {students.Average(s => s.GPA):F2}");
Console.WriteLine($"Highest GPA: {students.Max(s => s.GPA)}");
Console.WriteLine($"Youngest: {students.Min(s => s.Age)}");
Console.WriteLine($"GPA sum: {students.Sum(s => s.GPA):F1}");
```

### `First`, `FirstOrDefault`, `Single`, `Any`, `All`

These are for finding specific elements or checking conditions:

```csharp
// First — returns the first matching element; throws if none found
Student first = students.First(s => s.GPA > 3.8);
Console.WriteLine(first.Name);   // Carol

// FirstOrDefault — returns null if none found (safe version)
Student? found = students.FirstOrDefault(s => s.Major == "Biology");
Console.WriteLine(found?.Name ?? "Not found");   // Not found

// Single — like First, but throws if MORE THAN ONE matches
// Use when you expect exactly one result (e.g., find by unique ID)
Student? alice = students.SingleOrDefault(s => s.Name == "Alice");

// Any — does ANY element match?
bool hasPhysicsStudents = students.Any(s => s.Major == "Physics");
Console.WriteLine(hasPhysicsStudents);   // True

bool hasDropouts = students.Any(s => s.GPA < 2.0);
Console.WriteLine(hasDropouts);   // False

// All — do ALL elements match?
bool allAdults = students.All(s => s.Age >= 18);
Console.WriteLine(allAdults);   // True

bool allHighGPA = students.All(s => s.GPA > 3.5);
Console.WriteLine(allHighGPA);  // False
```

### `Distinct`, `Take`, `Skip`

```csharp
var ages = students.Select(s => s.Age).Distinct().OrderBy(a => a);
Console.WriteLine(string.Join(", ", ages));   // 20, 21, 22, 23, 24

// Take the top 3 (by GPA)
var top3 = students.OrderByDescending(s => s.GPA).Take(3);

// Skip the first 2, take the next 3
var page2 = students.OrderBy(s => s.Name).Skip(2).Take(3);
// Useful for paging: Skip((pageNumber - 1) * pageSize).Take(pageSize)
```

## Chaining: Building a Pipeline

LINQ's real power is chaining operations. Each method receives the output of the previous one. Build complex queries as readable pipelines:

```csharp
// "Find the names of CS students aged 22 or younger,
//  sorted by GPA descending, showing top 3"
var result = students
    .Where(s => s.Major == "Computer Science")    // Filter by major
    .Where(s => s.Age <= 22)                       // And by age
    .OrderByDescending(s => s.GPA)                 // Sort by GPA, best first
    .Take(3)                                       // Only top 3
    .Select(s => $"{s.Name} ({s.GPA})");           // Format as string

foreach (string line in result)
    Console.WriteLine(line);
// Carol (3.9)
// Alice (3.8)
// Grace (3.7)
```

Read it top to bottom: start with all students, filter to CS, filter to age ≤ 22, sort, take top 3, format. Each step receives the output of the step above. This is more readable than equivalent loops because the **intent** of each step is clear from its name.

## `ToList()` and `ToArray()`: When to Materialize

LINQ queries are **lazy** — they don't run until you iterate them. Each time you iterate the query, it runs again from scratch. If you need to:
- Use the results more than once
- Know the count before iterating
- Avoid re-running an expensive query

...then call `.ToList()` or `.ToArray()` to execute the query immediately and store the results:

```csharp
var query = students.Where(s => s.GPA > 3.5);

// Without ToList: the Where runs once for each foreach
foreach (var s in query) Console.WriteLine(s.Name);   // Runs the filter
foreach (var s in query) Console.WriteLine(s.Age);    // Runs the filter AGAIN

// With ToList: filter runs once, results stored in memory
List<Student> results = students.Where(s => s.GPA > 3.5).ToList();

Console.WriteLine(results.Count);                      // Instant — list already computed
foreach (var s in results) Console.WriteLine(s.Name); // No re-evaluation
foreach (var s in results) Console.WriteLine(s.Age);  // No re-evaluation
```

As a rule: if you'll use the results once, keep it as `IEnumerable<T>` (lazy). If you'll use them multiple times or need `.Count`, call `.ToList()`.
