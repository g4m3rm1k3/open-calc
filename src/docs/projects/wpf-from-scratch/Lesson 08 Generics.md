# Lesson 08: Generics

**What you will build:** You will write console applications that store, retrieve, and process collections of data with strict type safety. These isolated programs prove that the compiler can enforce data types inside container objects at compile time, completely eliminating a category of runtime crashes. The transferable problem this solves is creating reusable data structures (like lists and dictionaries) that can hold any data type without sacrificing the compiler's ability to verify that the data being retrieved is exactly what you expect.

**What you need to know first:** Lesson 07: Classes and Objects.

**Terms introduced in this lesson:**
- **Generic type parameter** — A placeholder for a specific data type, usually written as `<T>`, defined when a class is written and replaced with a real type when the class is instantiated. *Why it exists:* To allow a single class definition to operate securely on many different types of data without duplicating code.
- **Type safety** — The extent to which a programming language discourages or prevents type errors, ensuring variables only hold data of their declared type. *Why it exists:* To catch data mismatches during compilation before the program ever runs.
- **Boxing and Unboxing** — The process of wrapping a value type (like `int`) inside an `object` reference type, and later extracting it. *Why it exists:* To allow value types to be treated as objects, though it incurs a performance cost and creates type ambiguity.

**Objects and methods used:**
- **System.Object**
  - *What it is:* The ultimate base class of all types in .NET. Every type implicitly derives from `object`.
  - *Implementation:* `public class Object`
  - *Its use:* Can hold any value, but strips away specific type identity in the process.
- **System.Collections.Generic.List<T> / Add**
  - *What it is:* A collection of objects of type `T` that can grow dynamically.
  - *Implementation:* `public void Add(T item)`
  - *Its use:* Appends an item of strictly type `T` to the end of the list.
- **System.Collections.Generic.Dictionary<TKey, TValue> / ContainsKey**
  - *What it is:* A collection of key/value pairs mapped for fast lookups.
  - *Implementation:* `public bool ContainsKey(TKey key)`
  - *Its use:* Checks if the exact `TKey` is present in the dictionary before attempting retrieval.

---

## Concept Unit: The Problem

### The Problem
When building a container class that needs to hold different kinds of data (sometimes an integer, sometimes a string), the naive approach is to use `object`. Because every type in C# is an `object`, a single container can hold anything. However, retrieving the data requires a "cast"—an explicit instruction telling the compiler what the data actually is. If you guess wrong at runtime, the program crashes with an `InvalidCastException`. The compiler cannot help you because `object` hides the true nature of the data.

### The New Code
```csharp
using System;

public class Box
{
    public object Value { get; set; }
}

Box numberBox = new Box();
numberBox.Value = 42;

// We know it's an int, so we cast it.
int retrievedNumber = (int)numberBox.Value;
Console.WriteLine(retrievedNumber);

Box stringBox = new Box();
stringBox.Value = "Hello";

// The compiler allows this, but the program crashes at runtime.
int mistake = (int)stringBox.Value; 
Console.WriteLine(mistake);
```

### Mechanical Walkthrough
- `public object Value { get; set; }`: Defines a property of type `object`. This accepts anything, because all C# types derive from `object`. Without this, the box could only hold one specifically hardcoded type.
- `numberBox.Value = 42;`: Assigns an integer to the `object` property. This "boxes" the integer.
- `(int)numberBox.Value;`: A cast. It reads the `object`, checks if it is actually an `int` in memory, and extracts it. Without the `(int)`, the compiler refuses to assign an `object` to an `int` variable because it cannot guarantee the data type.
- `int mistake = (int)stringBox.Value;`: Attempts to cast a `string` (which is what `stringBox.Value` holds) into an `int`. The compiler compiles this fine because it only sees an `object` being cast to an `int`. At runtime, the check fails and throws an exception.

### CS Lens
This is the concept of "dynamic typing vs. static typing" playing out locally. By using `object`, we surrender static type checking for flexibility. It mirrors a shipping container: the dock worker knows it's a container, but has no idea if it holds electronics or produce until they open the doors.

### SE Lens
The alternative not chosen is writing a specific class for every type: `IntBox`, `StringBox`, `ButtonBox`. The tradeoff here is code duplication versus runtime safety. The `object` approach saves code but costs reliability, requiring the developer to perfectly track what is inside every object variable in their head.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n ProblemBox`.
2. Navigate into the folder: `cd ProblemBox`.
3. Replace the contents of `Program.cs` with the code above.
4. Run `dotnet run`.
5. Observe the output: the number `42` prints, followed immediately by an `Unhandled exception. System.InvalidCastException: Unable to cast object of type 'System.String' to type 'System.Int32'.`

---

## Concept Unit: A Generic Class

### The Problem
We need the flexibility of the `object` box (writing the class only once) combined with the safety of a specific type (knowing exactly what is inside at compile time). We need a way to tell the class *what* it holds at the moment we create it, locking it into that single type.

### The New Code
```csharp
using System;

public class Box<T>
{
    public T Value { get; set; }
}

Box<int> numberBox = new Box<int>();
numberBox.Value = 42;
int retrievedNumber = numberBox.Value;
Console.WriteLine(retrievedNumber);

Box<string> stringBox = new Box<string>();
stringBox.Value = "Hello";
string retrievedString = stringBox.Value;
Console.WriteLine(retrievedString);

// stringBox.Value = 42; // This would cause a compiler error.
```

### Mechanical Walkthrough
- `class Box<T>`: The `<T>` declares a generic type parameter. `T` acts as a variable for a type, rather than a variable for data. Without it, the class cannot dynamically substitute data types.
- `public T Value { get; set; }`: Uses the type parameter `T` for the property type. When `T` becomes `int`, this becomes `public int Value`.
- `Box<int>`: Instantiates the generic class, providing `int` as the specific type argument. The compiler generates a specialized version of the class restricted to integers.
- `int retrievedNumber = numberBox.Value;`: Retrieves the value without a cast. The compiler knows `numberBox.Value` is an `int` because of the `<int>` declaration. Without generics, the cast `(int)` would be required.
- `stringBox.Value = "Hello";`: Proves the same `Box<T>` code can be reused safely for strings.

### CS Lens
This embodies parametric polymorphism. You define logic abstractly over parameters, and instantiate it with specific types later. It is like a customizable factory mold: you build the mold once, but you decide whether you pour plastic or metal into it at the moment of manufacturing.

### SE Lens
The alternative not chosen is using the earlier `object` casting method. The tradeoff here is slight initial syntax complexity (angle brackets) in exchange for absolute compiler safety. The compiler will now halt the build if you try to put an integer in a string box, entirely preventing the runtime crash from the previous unit.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n GenericBox`.
2. Navigate into the folder: `cd GenericBox`.
3. Replace the contents of `Program.cs` with the code above.
4. Run `dotnet run`.
5. Observe the output: `42` followed by `Hello`.

---

## Concept Unit: List<T>

### The Problem
Managing arrays of data manually is tedious. Arrays have a fixed size; if you need to add an item to a full array, you must create a new, larger array and copy everything over. You need a dynamically resizing array that is also type-safe.

### The New Code
```csharp
using System;
using System.Collections.Generic;

List<string> names = new List<string>();
names.Add("Alice");
names.Add("Bob");
names.Add("Charlie");

Console.WriteLine($"Total names: {names.Count}");
Console.WriteLine($"Contains Bob? {names.Contains("Bob")}");

string secondName = names[1];
Console.WriteLine($"Second name is: {secondName}");

foreach (string name in names)
{
    Console.WriteLine(name);
}
```

### Mechanical Walkthrough
- `using System.Collections.Generic;`: Imports the namespace where C# stores its generic collections. Without this, the compiler will not know what `List<T>` is.
- `List<string> names = new List<string>();`: Creates a new list restricted to `string` objects.
- `names.Add("Alice");`: Appends an item to the list, expanding its internal capacity automatically if necessary. Without it, the list remains empty.
- `names.Count`: A property returning the current number of elements in the list.
- `names.Contains("Bob")`: A method that scans the list and returns a `bool` if the exact value is found.
- `names[1]`: The indexer. It retrieves the item at zero-based index 1. Because the list is `List<string>`, this is guaranteed by the compiler to return a `string`.
- `foreach (string name in names)`: Iterates sequentially through the list. The loop variable `name` is strongly typed as `string`.

### CS Lens
A List is a dynamic array. Internally, it allocates a block of memory. When that block fills up, it allocates a new block twice the size, copies the elements, and discards the old block. This provides fast access by index while hiding the complexity of memory management.

### SE Lens
The alternative not chosen is managing raw arrays (`string[]`). The tradeoff is a slight overhead in memory allocation and performance during the internal copy operations, in exchange for immense developer convenience. Lists are the default sequence data structure in modern C#.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n ListDemo`.
2. Navigate into the folder: `cd ListDemo`.
3. Replace the contents of `Program.cs` with the code above.
4. Run `dotnet run`.
5. Observe the output:
   Total names: 3
   Contains Bob? True
   Second name is: Bob
   Alice
   Bob
   Charlie

---

## Concept Unit: Dictionary<TKey, TValue>

### The Problem
Sometimes you need to look up data based on a specific label or identifier, not a numeric sequence index. If you only have a List, finding a specific record means looping through every item until you find a match, which is slow for large datasets. You need a fast, direct-mapping collection.

### The New Code
```csharp
using System;
using System.Collections.Generic;

Dictionary<string, int> wordCounts = new Dictionary<string, int>();

wordCounts.Add("apple", 5);
wordCounts.Add("banana", 2);
wordCounts.Add("cherry", 8);

if (wordCounts.ContainsKey("banana"))
{
    int count = wordCounts["banana"];
    Console.WriteLine($"Banana count: {count}");
}

foreach (KeyValuePair<string, int> kvp in wordCounts)
{
    Console.WriteLine($"Word: {kvp.Key}, Count: {kvp.Value}");
}
```

### Mechanical Walkthrough
- `Dictionary<string, int>`: Declares a dictionary requiring two type parameters. The first (`string`) is the Key, and the second (`int`) is the Value. Without both, the dictionary cannot structure its internal map.
- `wordCounts.Add("apple", 5);`: Inserts a key-value pair. The key must be unique. If you add "apple" again, the program will crash.
- `wordCounts.ContainsKey("banana")`: Checks if a key exists. Without checking, accessing a non-existent key via the indexer throws a `KeyNotFoundException`.
- `wordCounts["banana"]`: Uses the key inside the indexer brackets to retrieve the associated value (`2`).
- `KeyValuePair<string, int>`: The specific struct type that represents a single mapped entry when iterating over a dictionary.
- `kvp.Key` / `kvp.Value`: Properties that expose the distinct parts of the pair during iteration.

### CS Lens
This is a hash table. It takes the key, runs a mathematical hash function on it to generate an integer, and uses that integer to determine the exact memory location of the value. Real-world equivalent: a library indexing system where the book's ISBN mathematically points directly to the shelf location, eliminating the need to search the aisles.

### SE Lens
The alternative not chosen is a `List` of a custom class holding a word and a count, requiring a `foreach` loop to find a specific word. The tradeoff is memory overhead; a Dictionary requires extra memory for its internal hashing arrays to achieve its instant lookup speed.

### Run It Yourself
1. Open a terminal and run `dotnet new console -n DictionaryDemo`.
2. Navigate into the folder: `cd DictionaryDemo`.
3. Replace the contents of `Program.cs` with the code above.
4. Run `dotnet run`.
5. Observe the expected output.

---

## Connect the Pieces

Observe how the generic type parameters flow: 
When you define `Dictionary<string, int>`, the compiler replaces `TKey` with `string` and `TValue` with `int` throughout the definition. Thus, the `.Add(TKey key, TValue value)` method rigidly becomes `.Add(string key, int value)`. Finally, when the dictionary provides its enumerator for a `foreach` loop, it yields `KeyValuePair<TKey, TValue>`, which strictly manifests as `KeyValuePair<string, int>`. The type flows from the initial declaration down through every method and property of the instance.

## What Breaks Without This

If you ignore the compiler's generic rules, it will stop you immediately.

Modify the `List<T>` code to insert a wrong type:
```csharp
List<string> names = new List<string>();
names.Add(42);
```

**The compiler error:**
`CS1503: Argument 1: cannot convert from 'int' to 'string'`

Because you declared `List<string>`, the `Add` method is permanently locked to accept only strings. Restore the code by either changing the list type to `List<int>` (and fixing subsequent strings) or passing a string like `"42"` to `.Add()`.

## Exercises

1. **Multi-Type Box:** Create a `class TupleBox<T1, T2>` that holds two properties: `Item1` of type `T1` and `Item2` of type `T2`. Instantiate it in `Program.cs` with a `string` and a `bool`.
2. **List Filtering:** Create a `List<int>` with numbers 1 through 10. Write a `foreach` loop that checks if the number is even, and if so, `.Add()` it to a separate, second `List<int>` called `evenNumbers`. Print the contents of the second list.
3. **Dictionary Updating:** Create a `Dictionary<string, string>` mapping country names to capital cities. Add three entries. Then, write code that checks if a country exists; if it does, reassign its value using the indexer (e.g., `capitals["Country"] = "New City"`). Print the dictionary to verify the update.

## Definition of Done

- [ ] You have run the `object` Box code and witnessed the runtime crash.
- [ ] You have run the `<T>` Box code and seen the data successfully returned without a cast.
- [ ] You have built a `List<T>` and looped through it.
- [ ] You have built a `Dictionary<TKey, TValue>` and retrieved a value by its key.
- [ ] You can explain generics out loud, in your own words, to someone who hasn't read this lesson.
