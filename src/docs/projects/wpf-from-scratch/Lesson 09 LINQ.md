# Lesson 09: LINQ

**What you will build:** A set of small console applications that query, filter, and transform collections of data without writing manual loops. This proves that you can manipulate collections declaratively. The problem this solves is the verbosity, error-proneness, and rigidity of writing manual `foreach` loops with temporary lists every time you need to filter or reshape data.

**What you need to know first:** Lesson 03: Variables and Types, Lesson 04: Methods, Lesson 06: Collections (Lists and Arrays), Lesson 08: Lambdas.

**Terms introduced in this lesson:**
- **Language Integrated Query (LINQ)** — a set of features and methods that extend C# collections to allow declarative querying and transformation. *Why it exists:* to provide a standardized, readable, and concise way to query data regardless of the underlying collection type.
- **Declarative programming** — writing code that describes *what* you want as an outcome, rather than *how* to achieve it step-by-step. *Why it exists:* to hide mechanical iteration details, reducing boilerplate and potential for off-by-one errors.
- **Materialization** — the act of forcing an abstract sequence query to execute immediately and store its results in a concrete collection, like a `List`. *Why it exists:* because LINQ queries are often deferred; materializing captures the data at a specific point in time.

**Objects and methods used:**
- **IEnumerable<T>**
  - *What it is:* An interface representing any sequence of data that can be iterated over (such as with a `foreach` loop).
  - *Implementation:* `public interface IEnumerable<out T> : IEnumerable`
  - *Its use:* The fundamental type that LINQ operates on and returns.
- **Enumerable.Where**
  - *What it is:* A method that filters a sequence based on a condition.
  - *Implementation:* `public static IEnumerable<TSource> Where<TSource>(this IEnumerable<TSource> source, Func<TSource, bool> predicate)`
  - *Its use:* Keeping only items that match a rule.
- **Enumerable.Select**
  - *What it is:* A method that transforms each element of a sequence into a new form.
  - *Implementation:* `public static IEnumerable<TResult> Select<TSource, TResult>(this IEnumerable<TSource> source, Func<TSource, TResult> selector)`
  - *Its use:* Extracting a property or creating a new object for every item in a collection.
- **Enumerable.OrderBy / OrderByDescending**
  - *What it is:* Methods that sort the elements of a sequence based on a key.
  - *Implementation:* `public static IOrderedEnumerable<TSource> OrderBy<TSource, TKey>(this IEnumerable<TSource> source, Func<TSource, TKey> keySelector)`
  - *Its use:* Sorting data.
- **Enumerable.FirstOrDefault**
  - *What it is:* A method that returns the first element of a sequence, or a default value if the sequence contains no elements.
  - *Implementation:* `public static TSource? FirstOrDefault<TSource>(this IEnumerable<TSource> source)`
  - *Its use:* Safely attempting to get a single item without risking an exception if the collection is empty.
- **Enumerable.ToList**
  - *What it is:* A method that creates a `List<T>` from an `IEnumerable<T>`.
  - *Implementation:* `public static List<TSource> ToList<TSource>(this IEnumerable<TSource> source)`
  - *Its use:* Materializing a LINQ query into a concrete list.

---

## Concept Unit: `IEnumerable<T>`

### The Problem
Arrays and Lists are different types. If you write a method that takes a `List<int>`, you cannot pass an `int[]` array to it. This forces you to write duplicate methods for different collection types, even if the logic inside simply iterates through the items one by one. You need a common way to refer to "any sequence of items".

### The New Code
```csharp
using System;
using System.Collections.Generic;

string[] arrayData = { "Apple", "Banana", "Cherry" };
List<string> listData = new List<string> { "Dog", "Elephant", "Fox" };

PrintSequence(arrayData);
PrintSequence(listData);

void PrintSequence(IEnumerable<string> items)
{
    foreach (string item in items)
    {
        Console.WriteLine(item);
    }
    Console.WriteLine("---");
}
```

### Mechanical Walkthrough
- `using System.Collections.Generic;`: Imports the namespace required for `List<T>` and `IEnumerable<T>`.
- `string[] arrayData = { ... };`: Creates a standard array of strings.
- `List<string> listData = new List<string> { ... };`: Creates a standard list of strings.
- `PrintSequence(arrayData);`: Passes the array to the method. Arrays implicitly support `IEnumerable<string>`.
- `PrintSequence(listData);`: Passes the list to the method. Lists implicitly support `IEnumerable<string>`.
- `void PrintSequence(IEnumerable<string> items)`: The method signature accepts an `IEnumerable<string>`. It does not know or care if the underlying object is an array or a list. It only knows that the object provides a sequence of strings.
- `foreach (string item in items)`: `IEnumerable<T>` is exactly the type required by the `foreach` statement. It guarantees that the collection can be walked through one by one.

### CS Lens
This is an abstraction over iteration. By depending on the interface (`IEnumerable<T>`) rather than the concrete implementation (`List` or array), the code is decoupled from the storage mechanism. Real-world equivalent: a conveyor belt. The person at the end processing items does not need to know how the items were put on the belt, only that they arrive one at a time.

### SE Lens
The principle is "Program to an interface, not an implementation." The alternative is writing overloaded methods: `PrintSequence(List<string> items)` and `PrintSequence(string[] items)`. This costs duplication and maintenance overhead. The tradeoff is that inside `PrintSequence`, you lose access to specific features of a List or Array, like checking `items.Count` or accessing an index `items[0]`, because `IEnumerable` does not guarantee random access or a known size.

### Run It Yourself
1. Create a new console project: `dotnet new console -n EnumerableDemo`.
2. Replace `Program.cs` with the code above.
3. Run `dotnet run`.
4. Observe the output:
Apple
Banana
Cherry
---
Dog
Elephant
Fox
---

---

## Concept Unit: `Where`

### The Problem
You have a collection of items and you want to extract only the items that meet a specific condition. Manually creating a new list, looping through the original, checking the condition with an `if` statement, and adding to the new list requires several lines of boilerplate code.

### The New Code
```csharp
using System;
using System.Collections.Generic;
using System.Linq;

List<int> numbers = new List<int> { 2, 8, 4, 10, 1, 7 };

IEnumerable<int> largeNumbersQuery = numbers.Where(n => n > 5);

List<int> largeNumbers = largeNumbersQuery.ToList();

Console.WriteLine("Original:");
foreach (int n in numbers) Console.Write(n + " ");
Console.WriteLine();

Console.WriteLine("Filtered:");
foreach (int n in largeNumbers) Console.Write(n + " ");
Console.WriteLine();
```

### Mechanical Walkthrough
- `using System.Linq;`: This namespace contains the extension methods for `IEnumerable<T>`, including `Where` and `ToList`. Without this, the compiler will not find these methods.
- `numbers.Where(...)`: Calls the `Where` method on the list. `Where` operates on `IEnumerable<T>`, which `List<T>` implements.
- `n => n > 5`: The lambda expression acting as the predicate. For each element, which is temporarily named `n`, it evaluates the expression `n > 5`. If it returns `true`, the element is included in the result sequence.
- `IEnumerable<int> largeNumbersQuery = ...`: `Where` does not return a `List<int>`. It returns an `IEnumerable<int>`. Furthermore, `Where` does not modify the original `numbers` list.
- `largeNumbersQuery.ToList()`: Materializes the sequence into a concrete `List<int>`. Because LINQ queries can be deferred, calling `ToList()` forces the iteration and condition checking to happen immediately, storing the final results in memory.
- `foreach`: The output proves that the original list remains intact, and the new list contains only `8`, `10`, and `7`.

### CS Lens
This is the `filter` operation found in functional programming. It maps exactly to the mathematical concept of set comprehension, defining a new set based on a condition applied to an existing set. Real-world equivalent: a coin sorter that lets small coins fall through but retains coins larger than a specific diameter.

### SE Lens
Declarative filtering. The alternative is a `foreach` loop with an `if` block and a temporary `List.Add()`. The LINQ approach communicates intent immediately. The cost is performance: LINQ creates small underlying objects (enumerators and delegates) which allocate memory, making it slightly slower and more memory-intensive than a raw `for` loop. For standard application code, this cost is negligible compared to the gain in readability.

### Run It Yourself
1. Create a new console project: `dotnet new console -n WhereDemo`.
2. Replace `Program.cs` with the code above.
3. Run `dotnet run`.
4. Observe the output:
Original:
2 8 4 10 1 7 
Filtered:
8 10 7 

---

## Concept Unit: `Select`

### The Problem
You have a collection of objects, and you need a collection containing just one property from each object, or you need to transform each element into a completely different type. Looping and manually adding transformed items to a new list is tedious.

### The New Code
```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class Person
{
    public required string Name { get; set; }
    public required int Age { get; set; }
}

List<Person> people = new List<Person>
{
    new Person { Name = "Alice", Age = 30 },
    new Person { Name = "Bob", Age = 25 },
    new Person { Name = "Charlie", Age = 35 }
};

IEnumerable<string> names = people.Select(p => p.Name.ToUpper());

foreach (string name in names)
{
    Console.WriteLine(name);
}
```

### Mechanical Walkthrough
- `class Person`: Defines a simple data structure.
- `List<Person> people`: Creates a list of `Person` objects.
- `people.Select(...)`: Calls the `Select` method on the list.
- `p => p.Name.ToUpper()`: The transformation lambda. For each `Person` (named `p`), it accesses the `Name` property and calls `ToUpper()`. The lambda takes a `Person` as input and returns a `string` as output.
- `IEnumerable<string> names`: Because the lambda returns a `string`, `Select` produces an `IEnumerable<string>`. It takes a sequence of one type and yields a sequence of another type, one-to-one.
- `foreach`: Iterates the resulting string sequence directly. We did not call `ToList()`, so the `Select` logic actually executes one element at a time during this `foreach` loop.

### CS Lens
This is the `map` operation in functional programming. It projects every element of a domain into a codomain. Real-world equivalent: a currency exchange booth at an airport, where a sequence of travelers hand over Euros (input type) and receive Dollars (output type) in return, one-to-one.

### SE Lens
Data projection. The alternative is a manual loop pushing to a new list. `Select` reduces the surface area for bugs, specifically ensuring exactly one output per input. The cost is the same as `Where`: minor allocation overhead for the delegate and enumerator.

### Run It Yourself
1. Create a new console project: `dotnet new console -n SelectDemo`.
2. Replace `Program.cs` with the code above.
3. Run `dotnet run`.
4. Observe the output:
ALICE
BOB
CHARLIE

---

## Concept Unit: `OrderBy` and `OrderByDescending`

### The Problem
You need to sort a collection of complex objects. Calling a `.Sort()` method on a list modifies the original list in place, and requires the objects to know how to compare themselves, which often means implementing specialized interfaces. You want to sort based on a simple property without modifying the original collection.

### The New Code
```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class Employee
{
    public required string Department { get; set; }
    public required int Salary { get; set; }
    public required string Name { get; set; }
}

List<Employee> staff = new List<Employee>
{
    new Employee { Department = "Sales", Salary = 60000, Name = "Zara" },
    new Employee { Department = "IT", Salary = 80000, Name = "Xavier" },
    new Employee { Department = "Sales", Salary = 50000, Name = "Yvonne" }
};

var sortedStaff = staff
    .OrderBy(e => e.Department)
    .ThenByDescending(e => e.Salary)
    .ToList();

foreach (var e in sortedStaff)
{
    Console.WriteLine($"{e.Department} - {e.Name}: ${e.Salary}");
}
```

### Mechanical Walkthrough
- `staff.OrderBy(e => e.Department)`: Initiates a sort. The lambda `e => e.Department` specifies that the `Department` string is the primary key to sort by. Strings sort alphabetically. This returns an `IOrderedEnumerable<Employee>`.
- `.ThenByDescending(e => e.Salary)`: A secondary sort applied to items that have the exact same primary key (e.g., the two "Sales" employees). It sorts them by `Salary` in descending order (highest first).
- `.ToList()`: Materializes the final sorted sequence into a new list. The original `staff` list remains unsorted.
- `var sortedStaff`: The compiler infers the type `List<Employee>`.
- `foreach`: Prints the items to prove the sorting logic worked: IT comes before Sales, and within Sales, the $60000 salary comes before the $50000 salary.

### CS Lens
Sorting algorithms require a comparison function. `OrderBy` extracts a key from the object, and then uses the default comparison logic for that key's type. Real-world equivalent: sorting a physical stack of mail first by ZIP code (primary sort), and then within each ZIP code stack, sorting by street name alphabetically (secondary sort).

### SE Lens
Non-destructive sorting via method chaining. The alternative is implementing `IComparable` on the `Employee` class or passing a custom `IComparer` to `List.Sort()`, which modifies the list in memory. `OrderBy` provides ad-hoc sorting rules at the exact site where sorting is needed, keeping the domain class clean. The tradeoff is that LINQ sorting requires materializing all elements and allocating a temporary buffer internally to perform the sort, which is more memory-intensive than an in-place sort.

### Run It Yourself
1. Create a new console project: `dotnet new console -n OrderByDemo`.
2. Replace `Program.cs` with the code above.
3. Run `dotnet run`.
4. Observe the output:
IT - Xavier: $80000
Sales - Zara: $60000
Sales - Yvonne: $50000

---

## Concept Unit: `FirstOrDefault`

### The Problem
You need to find a specific item in a collection. You might filter with `Where`, but if you only expect one match, a `Where` query still returns a sequence. Extracting the first element from a sequence throws an exception if the sequence is empty, leading to crashes when data is legitimately missing.

### The New Code
```csharp
using System;
using System.Collections.Generic;
using System.Linq;

List<string> codes = new List<string> { "ALPHA", "BRAVO", "CHARLIE" };

string? match = codes.FirstOrDefault(c => c.StartsWith("Z"));

if (match == null)
{
    Console.WriteLine("No code starting with Z was found.");
}
else
{
    Console.WriteLine($"Found: {match}");
}

string firstMatch = codes.FirstOrDefault(c => c.StartsWith("B")) ?? "UNKNOWN";
Console.WriteLine($"Found: {firstMatch}");
```

### Mechanical Walkthrough
- `codes.FirstOrDefault(...)`: Takes a predicate lambda, just like `Where`. It searches the list from the beginning.
- `c => c.StartsWith("Z")`: The condition. Because no string in the list starts with "Z", this returns false for every item.
- `string? match`: The return type is `string?` (nullable string). Because no item matched, `FirstOrDefault` returns the default value for reference types, which is `null`.
- `if (match == null)`: You must explicitly check for `null` before using the result to prevent a `NullReferenceException`.
- `codes.FirstOrDefault(c => c.StartsWith("B")) ?? "UNKNOWN"`: Finds "BRAVO". The null-coalescing operator `??` provides a fallback value if `FirstOrDefault` returns `null`. Since "BRAVO" was found, the fallback is ignored.

### CS Lens
This is an early-exit linear search. It iterates only until it finds the first element that satisfies the predicate, then stops. It does not evaluate the rest of the collection. Real-world equivalent: looking for your keys in a house. Once you find them in the kitchen, you stop searching the remaining rooms.

### SE Lens
Safe querying. The alternative is the `First()` method, which throws an `InvalidOperationException` if no elements match. You use `First()` when an item *must* exist and its absence indicates a critical system error. You use `FirstOrDefault()` when a missing item is an expected, handleable state. The cost of `FirstOrDefault` is that you take on the responsibility of checking for `null`.

### Run It Yourself
1. Create a new console project: `dotnet new console -n FirstOrDefaultDemo`.
2. Replace `Program.cs` with the code above.
3. Run `dotnet run`.
4. Observe the output:
No code starting with Z was found.
Found: BRAVO

---

## Connect the Pieces

A single sequence processing pipeline. Watch an array of raw strings flow through multiple LINQ operations to become a single string result.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

string[] rawData = { "   apple ", "BANANA", "  Cherry", "dog", "  " };

string? result = rawData
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .Select(s => s.Trim().ToLower())
    .Where(s => s.Length > 4)
    .OrderBy(s => s)
    .FirstOrDefault();

if (result != null)
{
    Console.WriteLine($"Result: {result}");
}
```

1. **`rawData`**: The source sequence of five strings, containing varied whitespace and casing.
2. **`Where(s => !string.IsNullOrWhiteSpace(s))`**: Filters out the last element, the empty string. Four elements continue down the pipeline.
3. **`Select(s => s.Trim().ToLower())`**: Transforms the remaining four elements: `"apple"`, `"banana"`, `"cherry"`, `"dog"`.
4. **`Where(s => s.Length > 4)`**: Filters out `"dog"`. Three elements continue: `"apple"`, `"banana"`, `"cherry"`.
5. **`OrderBy(s => s)`**: Sorts the three strings alphabetically. They happen to already be alphabetical.
6. **`FirstOrDefault()`**: Takes the first element, `"apple"`, and stops the query. Returns it as a string.

Because LINQ defers execution, this entire pipeline executes seamlessly when `FirstOrDefault` demands an item, pulling data through the operations only as needed until the first fully matching, sorted element is found.

## What Breaks Without This

Attempting to force an empty sequence to yield a value without safety checks.

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

List<int> numbers = new List<int> { 1, 2, 3 };

// This will crash. There is no number greater than 10.
int result = numbers.First(n => n > 10);
```

**The Error:**
`System.InvalidOperationException: Sequence contains no matching element`

**The Fix:**
Use `FirstOrDefault`, and handle the default case (which for an `int` is `0`).
```csharp
int result = numbers.FirstOrDefault(n => n > 10);
if (result == 0)
{
    Console.WriteLine("Not found.");
}
```

## Exercises
1. **The Projection:** Create a list of integers from 1 to 5. Use `Select` to create a new sequence where each integer is multiplied by 10. Print the sequence.
2. **The Double Filter:** Create a list of integers from 1 to 20. Chain two `Where` calls together: one that keeps only even numbers, and a second that keeps only numbers greater than 10. Print the result.
3. **The Null Fallback:** Create an empty list of strings (`new List<string>()`). Call `FirstOrDefault()` on it, and use the null-coalescing operator `??` to assign the string "EMPTY" to a variable if the result is null. Print the variable.

## Definition of Done
- [ ] You can declare an `IEnumerable<T>` variable and assign a List or Array to it.
- [ ] You can use `Where` with a lambda to filter a collection.
- [ ] You can use `Select` with a lambda to extract properties from a collection of objects.
- [ ] You can chain `OrderBy` and `ThenBy` to sort data.
- [ ] You can explain why `FirstOrDefault` is safer than `First` for queries that might yield no results.
- [ ] You can explain LINQ out loud, in your own words, to someone who hasn't read this lesson.
