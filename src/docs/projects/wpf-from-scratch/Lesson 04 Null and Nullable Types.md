# Lesson 04: Null and Nullable Types

**What you will build:** You will write isolated code snippets that handle missing data. This proves that you can safely represent the absence of a value, detect when a value is missing, and provide fallback values without crashing your application. This solves the fundamental problem of how to handle empty text fields, unselected list items, or missing configuration settings in software.

**What you need to know first:** Lesson 01, Lesson 02, Lesson 03.

**Terms introduced in this lesson:**
- **null** — a special value representing the intentional absence of any object reference. *Why it exists:* To distinguish between an object that exists but is empty (like a string with zero characters) and an object that does not exist at all.
- **Reference Type** — a type that stores a reference to its data, rather than the data itself. *Why it exists:* To allow multiple variables to point to the same large object in memory.
- **Value Type** — a type that holds its data directly. *Why it exists:* For fast, efficient storage of simple data like numbers.
- **Nullable Value Type** — a wrapper around a value type that allows it to represent `null`. *Why it exists:* Because plain value types cannot be null, but databases and user interfaces often need to represent a "missing" number.
- **Null-conditional Operator (`?.`)** — an operator that accesses a member only if the object is not null. *Why it exists:* To eliminate deeply nested null checks before accessing properties.
- **Null-coalescing Operator (`??`)** — an operator that returns the left-hand operand if it is not null, or the right-hand operand otherwise. *Why it exists:* To cleanly provide default or fallback values.

**Objects and methods used:**
- **Nullable<T> / HasValue**
  - *What it is:* A property that indicates whether a nullable value type currently holds a valid value.
  - *Implementation:* `public bool HasValue { get; }`
  - *Its use:* Checked before accessing `.Value` to avoid an exception.
- **Nullable<T> / Value**
  - *What it is:* A property that returns the underlying value of a nullable type.
  - *Implementation:* `public T Value { get; }`
  - *Its use:* Retrieves the actual data when `HasValue` is true.

---

## Concept Unit: null

### The Problem
When you declare a variable that holds an object (like text), it does not automatically hold valid data. Sometimes, data is simply missing. An empty piece of text is still text. You need a way to indicate that the variable points to absolutely nothing. If you attempt to manipulate a variable that points to nothing, the runtime will crash because there is no object to manipulate.

### The New Code
```csharp
string? missingText = null;
Console.WriteLine(missingText == null);

// The following line will cause a runtime crash if uncommented:
// int length = missingText.Length; 
```

### Mechanical Walkthrough
- `string?` — the `?` after `string` tells the compiler that this variable is explicitly allowed to hold nothing. Modern C# (.NET 8 with `<Nullable>enable</Nullable>`) enforces strict rules, warning you if you might assign `null` to a variable that shouldn't be null. The `?` declares intent.
- `missingText` — the name of the variable.
- `= null;` — assigns the explicit "nothing" value to the variable.
- `Console.WriteLine(missingText == null);` — evaluates the expression `missingText == null`, which is `true`, and prints it to the console.
- `missingText.Length` — attempts to read the `Length` property of the object that `missingText` points to. Because it points to `null`, there is no object, and the runtime will throw a `NullReferenceException`.

### CS Lens
The `null` reference is an invalid memory address. In hardware, accessing an unmapped or zero memory address causes a segmentation fault. High-level environments catch this and convert it into a structured exception. The concept is identical to a dead end sign on a road; the sign exists, but the road it points to does not.

### SE Lens
Allowing `null` everywhere causes unpredictable crashes (the "billion-dollar mistake"). C# requires you to opt-in to nullability using the `?` syntax. The alternative not chosen is the `Option` or `Maybe` pattern used in some functional languages, which forces you to explicitly unwrap values every time. C#'s approach costs the developer the burden of constantly checking for `null` before access, but provides maximum flexibility.

### Run It Yourself
Create a new console application:
1. Open a terminal.
2. Run `dotnet new console -n NullExamples`
3. Run `cd NullExamples`
4. Open `Program.cs` and replace its contents with the code above.
5. Run `dotnet run`. 
6. Observe the output: `True`.
7. Uncomment the `missingText.Length` line and run it again to observe the crash.

---

## Concept Unit: Nullable Value Types

### The Problem
Some data types hold their values directly. A whole number (`int`) always holds a number; it defaults to `0`. However, `0` is a valid number, not an indicator of missing data. If a user leaves an "Age" field blank on a form, recording it as `0` is factually incorrect. You need a way to store a number that can also be `null`.

### The New Code
```csharp
int plainNumber = 0;
// plainNumber = null; // This would cause a compile error

int? optionalAge = null;

if (optionalAge.HasValue)
{
    Console.WriteLine(optionalAge.Value);
}
else
{
    Console.WriteLine("Age is unknown.");
}

optionalAge = 25;
Console.WriteLine(optionalAge.Value);
```

### Mechanical Walkthrough
- `int plainNumber = 0;` — declares a standard value type. It cannot be `null`.
- `int? optionalAge = null;` — declares a nullable integer (`Nullable<int>`). The `?` makes it capable of storing either an integer or `null`.
- `if (optionalAge.HasValue)` — accesses the `HasValue` property. This is a boolean that returns `false` if the variable is `null`, and `true` if it holds a number.
- `Console.WriteLine(optionalAge.Value);` — accesses the `Value` property, which extracts the actual integer. Calling this when `HasValue` is false causes an exception.
- `optionalAge = 25;` — assigns a standard integer to the nullable variable. The compiler automatically wraps the integer.

### CS Lens
A nullable value type is a composite data structure. Under the hood, it is not a direct memory pointer. It is a structure containing two fields: a boolean indicating presence (`HasValue`), and the data field itself (`Value`). This is functionally equivalent to the payload structure in network packets, where a header flag dictates whether a specific payload segment contains data.

### SE Lens
The framework could have reserved a specific integer, like `-1` or `Int32.MinValue`, to represent "missing" data (often called a sentinel value). The tradeoff is that this consumes a valid data point. By using `Nullable<T>`, C# cleanly separates the concept of presence from the value itself, at the cost of slight memory overhead for the boolean flag.

### Run It Yourself
Paste the code into your `Program.cs`. Run `dotnet run`. The exact expected output is:
`Age is unknown.`
`25`

---

## Concept Unit: Null-conditional Operator (?.)

### The Problem
When dealing with objects that might be `null`, you must check if they are `null` before accessing their properties or methods. Doing this repeatedly creates deeply nested and verbose `if` statements. You need a concise way to say "get this property if the object exists; otherwise, return `null`."

### The New Code
```csharp
string? rawInput = null;

// The long way:
int? lengthTheLongWay = null;
if (rawInput != null)
{
    lengthTheLongWay = rawInput.Length;
}

// The short way:
int? lengthTheShortWay = rawInput?.Length;

Console.WriteLine(lengthTheLongWay == null);
Console.WriteLine(lengthTheShortWay == null);
```

### Mechanical Walkthrough
- `int? lengthTheLongWay = null;` — sets up a variable to hold the length, defaulting to `null`.
- `if (rawInput != null)` — the traditional null check to prevent a crash.
- `rawInput?.Length` — the null-conditional operator. It evaluates `rawInput`. If `rawInput` is `null`, the entire expression immediately evaluates to `null`. If `rawInput` is not `null`, it accesses `.Length`.
- `int? lengthTheShortWay` — the result of `?.` can be `null`, so the variable receiving the result must also be a nullable type (`int?` instead of `int`), even though `Length` is normally a plain `int`.
- `Console.WriteLine(...)` — prints `True` twice, proving both approaches yield the same `null` outcome.

### CS Lens
This is an example of short-circuit evaluation. The execution pipeline evaluates the left side. If the condition for failure (`null`) is met, the pipeline aborts the rest of the expression and returns early. This is identical to a firewall rule that drops a packet immediately upon detecting an invalid origin, without processing the packet's contents.

### SE Lens
The alternative is writing explicit `if` statements every time. Explicit checks make control flow obvious but bloat the codebase, hiding business logic behind boilerplate safety checks. The `?.` operator trades verbosity for brevity. The cost is that dense chains like `a?.b?.c?.d` can make it difficult to determine exactly which object in the chain was `null` during debugging.

### Run It Yourself
Paste the code into your `Program.cs`. Run `dotnet run`. The exact expected output is:
`True`
`True`

---

## Concept Unit: Null-coalescing Operator (??)

### The Problem
When a value is `null`, you often want to provide a safe default value instead of propagating the `null` further into your application. Writing an `if/else` statement to assign defaults takes multiple lines and breaks the flow of assignments.

### The New Code
```csharp
string? primaryEmail = null;
string? secondaryEmail = null;
string defaultEmail = "admin@system.local";

string contactEmail = primaryEmail ?? secondaryEmail ?? defaultEmail;

Console.WriteLine(contactEmail);
```

### Mechanical Walkthrough
- `string? primaryEmail = null;` and `secondaryEmail = null;` — setup variables that lack data.
- `string defaultEmail = "admin@system.local";` — a guaranteed fallback value that is not nullable.
- `primaryEmail ?? secondaryEmail` — evaluates the left side. If `primaryEmail` is not null, it stops and returns it. Because it is `null`, it moves to the right side (`secondaryEmail`).
- `?? defaultEmail` — the chain continues. `secondaryEmail` is also `null`, so it evaluates and returns the final fallback, `defaultEmail`.
- `string contactEmail` — receives the final result. Because the chain ends with a non-nullable `string`, `contactEmail` is guaranteed to never be `null`, so it does not need a `?`.

### CS Lens
This is a priority resolution chain. It evaluates a sequence of options in order of precedence, taking the first valid configuration it encounters. This mirrors how DNS resolution works: the system checks the local cache first, then the host file, then the local network router, and finally the internet DNS servers, stopping at the first successful answer.

### SE Lens
The alternative is the conditional ternary operator (`a != null ? a : b`). While functional, it requires you to repeat the variable name. The `??` operator eliminates duplication and intent ambiguity. The tradeoff is that the logic flows sequentially left-to-right on a single line, making it hard to set breakpoints on intermediate evaluations if you need to debug why a specific fallback was triggered.

### Run It Yourself
Paste the code into your `Program.cs`. Run `dotnet run`. The exact expected output is:
`admin@system.local`

---

## Connect the Pieces

A single piece of optional configuration data moving through a system:

```csharp
string? userProvidedSetting = null; // 1. null declaration
string? settingFromDatabase = null; 

// 2. We use ?? to fallback from user -> database -> hardcoded default
string activeSetting = userProvidedSetting ?? settingFromDatabase ?? "DefaultMode";

// 3. activeSetting is guaranteed not null here, but if we had a nullable object:
string? configurationName = null;
int? configLength = configurationName?.Length; // 4. ?. safe access resulting in int?

// 5. Using int? and HasValue to check
if (!configLength.HasValue) 
{
    Console.WriteLine($"Configuration length missing. Using default setting: {activeSetting}");
}
```

## What Breaks Without This

If you fail to handle `null` properly, the application crashes instantly when it attempts to use the empty reference. 

Change your `Program.cs` to the following:
```csharp
string? missingText = null;
Console.WriteLine(missingText.Length);
```

Run `dotnet run`. You will see a runtime exception:
`Unhandled exception. System.NullReferenceException: Object reference not set to an instance of an object.`

This exception kills the process immediately. The program stops execution. 

To restore it, apply the null-conditional and null-coalescing operators to provide a default value of `0` when the text is missing:
```csharp
string? missingText = null;
Console.WriteLine(missingText?.Length ?? 0);
```

## Exercises

1. **Nullable Value Types:** Declare an `int?` variable representing a temperature sensor reading. Check if it `HasValue`. If it does, print the `.Value`. If it does not, assign it a new value of `72` and print that.
2. **Operator Chaining:** Create a class `User` with a `string? Nickname` property. Instantiate a `User` where `Nickname` is null. Use the `?.` and `??` operators on a single line to print the user's nickname length if it exists, or `0` if the user object or the nickname is null.

## Definition of Done
- [ ] You have compiled and run every code snippet.
- [ ] You understand that `null` indicates the absence of an object.
- [ ] You know the difference between an `int` and an `int?`.
- [ ] You can safely access properties of a nullable object using `?.`.
- [ ] You can provide fallback values using `??`.
- [ ] You can explain null and nullable types out loud, in your own words, to someone who hasn't read this lesson.
