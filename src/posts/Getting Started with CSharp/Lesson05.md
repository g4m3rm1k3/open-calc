# Methods, Delegates, and Lambda Expressions

Methods are the basic unit of executable code in C#. But C# goes further than most languages: functions are also **values** — you can store them in variables, pass them to other methods, and return them. This is done through **delegates**, and the shorthand for creating them is the **lambda expression**. Understanding how these three things fit together unlocks a large part of modern C# — LINQ, event handling, async programming, and most framework APIs all rely on this foundation.

## Declaring Methods

A method lives inside a class or struct. The syntax is: access modifier, return type, name, parameter list, body.

```csharp
class Calculator
{
    // Public instance method: callable on an instance of Calculator
    public int Add(int a, int b)
    {
        return a + b;
    }

    // Static method: no instance needed, called as Calculator.Square(5)
    public static int Square(int n) => n * n;   // Expression body — no braces needed for single expressions

    // Returns nothing
    public void PrintResult(int result)
    {
        Console.WriteLine($"Result: {result}");
    }
}

var calc = new Calculator();
Console.WriteLine(calc.Add(3, 4));      // 7
Console.WriteLine(Calculator.Square(5)); // 25
calc.PrintResult(42);
```

`static` methods belong to the type itself, not to any instance. If a method doesn't use any instance state (`this`), making it `static` is a good habit — it makes the intent explicit and is marginally more efficient.

## Expression-Bodied Members

The `=>` syntax (`=>` is pronounced "goes to") lets you write single-expression methods without `return` or braces. It's cosmetic — the compiler produces identical code:

```csharp
// These are identical
public int Double(int n) { return n * 2; }
public int Double(int n) => n * 2;

// Works for properties too
public string Name { get; set; }
public int NameLength => Name.Length;    // Computed property
```

## Parameters: Value vs `ref` vs `out` vs `in`

By default, C# passes arguments **by value** — a copy is made. Changes inside the method don't affect the caller's variable. C# gives you explicit control over this:

```csharp
// By value (default): caller's variable is unaffected
static void TryDouble(int n)
{
    n *= 2;
    Console.WriteLine($"Inside: {n}");
}

// ref: pass a reference to the caller's variable — must be assigned before calling
static void Double(ref int n)
{
    n *= 2;
}

// out: like ref but the method promises to assign it — caller doesn't need to initialize
static bool TryParse(string s, out int result)
{
    return int.TryParse(s, out result);
}

// in: read-only reference — avoids copying large structs, can't modify the value
static double Magnitude(in Vector3 v) => Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);

int x = 10;
TryDouble(x);
Console.WriteLine(x);          // Still 10 — copy was modified, not x

Double(ref x);
Console.WriteLine(x);          // 20 — the actual variable was modified

if (TryParse("42", out int parsed))
    Console.WriteLine(parsed); // 42
```

The `out` pattern — returning `bool` for success and delivering the result via `out` — appears throughout the .NET library. `int.TryParse`, `Dictionary.TryGetValue`, `int.TryParse` all follow this convention.

## Optional Parameters and Named Arguments

Parameters can have **default values**, making them optional at the call site. And any argument can be passed by name, in any order:

```csharp
static void CreateUser(string name, int age = 18, bool isAdmin = false, string role = "user")
{
    Console.WriteLine($"{name}, age {age}, admin={isAdmin}, role={role}");
}

CreateUser("Alice");                              // name=Alice, age=18, isAdmin=false, role=user
CreateUser("Bob", 25);                            // age overridden to 25
CreateUser("Carol", isAdmin: true);               // skip age, set isAdmin by name
CreateUser("Dave", role: "editor", age: 30);      // named args in any order
```

Named arguments are especially useful when calling methods with many boolean parameters where the meaning isn't obvious from position alone.

## Method Overloading

C# allows multiple methods with the same name as long as their **parameter signatures** differ. The compiler picks the right one at compile time:

```csharp
static void Log(string message) =>
    Console.WriteLine($"[string] {message}");

static void Log(int value) =>
    Console.WriteLine($"[int] {value}");

static void Log(string message, int level) =>
    Console.WriteLine($"[L{level}] {message}");

Log("hello");       // [string] hello
Log(42);            // [int] 42
Log("error", 2);    // [L2] error
```

Overloading is resolved by the compiler — it's purely a compile-time decision. Return type alone is not enough to distinguish overloads.

## Local Functions

You can define a function inside another function. It's only visible within its enclosing method and can access the enclosing method's local variables:

```csharp
static int Factorial(int n)
{
    if (n < 0) throw new ArgumentOutOfRangeException(nameof(n));

    return Compute(n);      // Call the local function

    // Local function — only exists inside Factorial
    static int Compute(int x) => x <= 1 ? 1 : x * Compute(x - 1);
}

Console.WriteLine(Factorial(6));   // 720
```

Making a local function `static` prevents it from accidentally capturing the outer method's variables (a common source of unintended closures). Use local functions when a helper is only needed in one place and you want to keep it close to where it's used.

## Delegates: Functions as Values

A **delegate** is a type that represents a method signature. Once you have a delegate type, you can store any method that matches that signature in a variable of that type and call it later:

```csharp
// Declare a delegate type: "a method taking two ints and returning an int"
delegate int MathOperation(int a, int b);

// Any method matching that signature can be assigned
static int Add(int a, int b) => a + b;
static int Multiply(int a, int b) => a * b;

MathOperation op = Add;
Console.WriteLine(op(3, 4));    // 7

op = Multiply;
Console.WriteLine(op(3, 4));    // 12

// Pass a delegate as an argument — the receiver doesn't care which method it is
static int ApplyTwice(MathOperation operation, int value)
{
    return operation(operation(value, value), value);
}

Console.WriteLine(ApplyTwice(Add, 3));       // Add(Add(3,3), 3) = 9
Console.WriteLine(ApplyTwice(Multiply, 3));  // Multiply(Multiply(3,3), 3) = 27
```

Delegates are reference types. The variable `op` holds a reference to a method, not the result of calling it. You call the method by invoking the delegate with `()`.

## `Func<T>` and `Action<T>`: Built-In Delegate Types

Writing custom delegate types every time is verbose. The .NET library provides two generic delegate types that cover almost every case:

- **`Action<T1, T2, ...>`** — a method that takes arguments and returns `void`
- **`Func<T1, T2, ..., TResult>`** — a method that takes arguments and returns `TResult`

```csharp
// Action: returns void
Action<string> print = Console.WriteLine;
print("Hello from Action");          // Hello from Action

Action<int, int> printSum = (a, b) => Console.WriteLine(a + b);
printSum(3, 4);                      // 7

// Func: last type parameter is the return type
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(10, 20));      // 30

Func<string, int> strLen = s => s.Length;
Console.WriteLine(strLen("hello"));  // 5

Func<int, bool> isEven = n => n % 2 == 0;
Console.WriteLine(isEven(4));        // True
Console.WriteLine(isEven(7));        // False

// Func with no input — just a return value (like a lazy getter)
Func<DateTime> now = () => DateTime.Now;
Console.WriteLine(now());
```

`Func` and `Action` are what LINQ uses internally. `Where` takes a `Func<T, bool>`, `Select` takes a `Func<T, TResult>`, and so on. You almost never need to declare your own delegate type.

## Lambda Expressions

A **lambda expression** is an inline anonymous function — shorthand for creating a delegate without naming a method separately:

```csharp
// Full lambda: (parameters) => { body }
Func<int, int, int> multiply = (a, b) => { return a * b; };

// Expression lambda (single expression, no braces, no return keyword)
Func<int, int, int> multiply2 = (a, b) => a * b;

// Single parameter: parentheses optional
Func<int, bool> isPositive = n => n > 0;

// No parameters
Action sayHello = () => Console.WriteLine("Hello!");
sayHello();

// Multi-line: use braces
Func<int, string> classify = n =>
{
    if (n < 0) return "negative";
    if (n == 0) return "zero";
    return "positive";
};

Console.WriteLine(classify(-5));    // negative
Console.WriteLine(classify(0));     // zero
Console.WriteLine(classify(7));     // positive
```

Lambdas are the primary way you pass behavior in modern C# — to LINQ, to Task-based APIs, to UI event handlers.

## Closures: Capturing Variables

A lambda can **capture** variables from the surrounding scope. The captured variable is shared — not copied — between the lambda and the outer code:

```csharp
int counter = 0;
Action increment = () => counter++;   // lambda captures 'counter'

increment();
increment();
increment();
Console.WriteLine(counter);   // 3 — the lambda modifies the real variable

// Common pattern: factory that returns a counter function
static Action MakeCounter(string name)
{
    int count = 0;
    return () =>
    {
        count++;
        Console.WriteLine($"{name}: {count}");
    };
}

var counterA = MakeCounter("A");
var counterB = MakeCounter("B");

counterA();  // A: 1
counterA();  // A: 2
counterB();  // B: 1  — independent from A
counterA();  // A: 3
```

Each call to `MakeCounter` creates a new closure with its own `count` variable. The two counters don't share state. This is the fundamental mechanism behind many C# patterns.

**Capture gotcha with loops**: a classic mistake is capturing a loop variable:

```csharp
var actions = new List<Action>();
for (int i = 0; i < 5; i++)
{
    actions.Add(() => Console.Write(i + " "));  // WRONG: captures i, not its value
}
actions.ForEach(a => a());   // Prints: 5 5 5 5 5 — all see the final i

// Fix: capture a copy
var actions2 = new List<Action>();
for (int i = 0; i < 5; i++)
{
    int copy = i;                                    // New variable each iteration
    actions2.Add(() => Console.Write(copy + " "));
}
actions2.ForEach(a => a());  // Prints: 0 1 2 3 4
```

The `foreach` loop in modern C# (C# 5+) does not have this problem — each iteration gets its own loop variable.

## Putting It Together: Higher-Order Functions

A **higher-order function** is one that takes or returns another function. LINQ is built entirely on this idea, and you can write your own:

```csharp
// Takes a Func and applies it to each element
static IEnumerable<TResult> Map<T, TResult>(IEnumerable<T> source, Func<T, TResult> transform)
{
    foreach (var item in source)
        yield return transform(item);
}

// Takes a Func<bool> to decide which elements to keep
static IEnumerable<T> Filter<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    foreach (var item in source)
        if (predicate(item))
            yield return item;
}

var numbers = new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

var evens        = Filter(numbers, n => n % 2 == 0);
var evenSquares  = Map(evens, n => n * n);

Console.WriteLine(string.Join(", ", evenSquares));   // 4, 16, 36, 64, 100

// Compose transformations using LINQ (the real-world version of the above)
var result = numbers
    .Where(n => n % 2 == 0)
    .Select(n => n * n);

Console.WriteLine(string.Join(", ", result));        // 4, 16, 36, 64, 100
```

`Map` and `Filter` are exactly `Select` and `Where` — the LINQ versions are just more general and optimized.

## `Predicate<T>` and `Comparison<T>`

Two more specialized delegate types appear in the older parts of the BCL:

```csharp
// Predicate<T>: equivalent to Func<T, bool>
Predicate<string> isLong = s => s.Length > 5;

var words = new List<string> { "hi", "hello", "world", "C#", "programming" };
var longWords = words.FindAll(isLong);   // List<T>.FindAll takes Predicate<T>
Console.WriteLine(string.Join(", ", longWords));   // hello, world, programming

// Comparison<T>: equivalent to Func<T, T, int> — for custom sorting
var scores = new List<int> { 42, 7, 99, 13, 55 };
scores.Sort((a, b) => b.CompareTo(a));   // Descending sort
Console.WriteLine(string.Join(", ", scores));   // 99, 55, 42, 13, 7
```

These exist for historical reasons — they predate `Func<T>`. In modern code, prefer `Func` and `Action` for new APIs.

## Method Groups

You don't always need a lambda — you can use a **method group** (just the method name, without calling it) anywhere a delegate is expected:

```csharp
var words = new[] { "banana", "apple", "cherry", "date" };

// Method group — no lambda needed when the signature matches
Array.Sort(words, string.Compare);          // Uses string.Compare(x, y)
Console.WriteLine(string.Join(", ", words)); // apple, banana, cherry, date

// Same with Action/Func
List<int> numbers = new() { 1, 2, 3 };
numbers.ForEach(Console.WriteLine);         // Prints each number — no lambda needed
```

Method groups are cleaner than wrapping a method in a lambda that just calls it (`x => Console.WriteLine(x)` → just `Console.WriteLine`).
