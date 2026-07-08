# Methods, Delegates, and Lambda Expressions

Methods are the basic unit of executable code in C#. But C# goes further than most languages: **functions are also values** — you can store them in variables, pass them to other methods, and return them. This is done through **delegates**, and the shorthand for creating them is the **lambda expression**.

This isn't just a syntactic nicety. Understanding how methods, delegates, and lambdas fit together unlocks the majority of modern C# — LINQ, event handling, async/await, dependency injection, and virtually every major framework API depend on this foundation. If you've written callbacks in JavaScript, functional interfaces in Java, or `std::function` in C++, you already understand the concept — C#'s implementation just has a few sharp edges worth knowing about.

## Declaring Methods

A method lives inside a class or struct. The basic anatomy: access modifier, return type, name, parameter list, body.

```csharp
class Calculator
{
    // Public instance method — called on an instance
    public int Add(int a, int b)
    {
        return a + b;
    }

    // Static method — no instance needed, called as Calculator.Square(5)
    public static int Square(int n) => n * n;   // Expression body — see next section

    // void: returns nothing (unlike C/C++, there's no meaningful "void*" in managed code)
    public void PrintResult(int result)
    {
        Console.WriteLine($"Result: {result}");
    }
}

var calc = new Calculator();
Console.WriteLine(calc.Add(3, 4));       // 7
Console.WriteLine(Calculator.Square(5)); // 25
calc.PrintResult(42);
```

`static` methods belong to the type itself, not to any instance. If a method doesn't read or write any instance state (`this`), marking it `static` is a good habit — it makes the intent explicit, prevents accidental state coupling, and is measurably faster in tight loops (no virtual dispatch overhead, better JIT inlining).

> **Senior angle:** In performance-critical code, `static` methods on non-sealed classes can still be devirtualized by the JIT when the call site is provably monomorphic. But marking a method `static` tells the JIT — and the human reader — definitively that there's no instance indirection.

## Expression-Bodied Members

The `=>` syntax lets you write single-expression methods without `return` or braces. It's purely cosmetic — the compiler produces identical IL:

```csharp
// These are identical at the IL level
public int Double(int n) { return n * 2; }
public int Double(int n) => n * 2;

// Works for properties, constructors, finalizers, indexers — almost anything
public string Name { get; set; }
public int NameLength => Name.Length;        // Computed property, evaluated every access

// Read-only property with a backing field (different from above — stored once)
private readonly int _cachedLength;
public int CachedLength => _cachedLength;
```

Expression bodies are idiomatic modern C#. You'll see them everywhere in library code. The one gotcha: a computed property (`=> expr`) re-evaluates the expression on every access. If the computation is expensive, use a backing field or `Lazy<T>`.

## Parameters: Value, `ref`, `out`, `in`, and `ref readonly`

By default, C# passes arguments **by value** — a copy is made. Changes inside the method don't affect the caller's variable. C# gives you explicit, opt-in control over this with keywords that must appear at both the call site and the declaration:

```csharp
// By value (default): caller's variable is unaffected
static void TryDouble(int n) { n *= 2; }

// ref: bi-directional reference — caller's variable IS modified
// Caller must initialize the variable before passing it
static void Double(ref int n) { n *= 2; }

// out: like ref, but the method guarantees to assign it
// Caller does NOT need to initialize — useful for Try-parse patterns
static bool TryParsePositive(string s, out int result)
{
    if (int.TryParse(s, out result) && result > 0) return true;
    result = 0;  // Must assign before returning
    return false;
}

// in: read-only reference — avoids copying large structs, method cannot modify value
// C# 7.2+. Semantically like 'const ref' in C++
static double Magnitude(in Vector3 v) => Math.Sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z);

// ref readonly (C# 12): return a reference to something without allowing modification
static ref readonly int PeekFirst(int[] arr) => ref arr[0];

int x = 10;
TryDouble(x);
Console.WriteLine(x);          // Still 10 — copy was modified

Double(ref x);
Console.WriteLine(x);          // 20 — real variable was modified

if (TryParsePositive("42", out int parsed))
    Console.WriteLine(parsed); // 42

// Inline out variable declaration (C# 7) — declare and use in one line
if (int.TryParse("99", out int n))
    Console.WriteLine(n);      // 99

// Discard out parameters you don't care about with _
if (int.TryParse("bad", out _))
    Console.WriteLine("Parsed"); // Won't print
```

The `out` pattern — returning `bool` for success and delivering the result via `out` — is the standard .NET idiom for fallible parsing. You'll see it in `int.TryParse`, `Dictionary<K,V>.TryGetValue`, `Uri.TryCreate`, and hundreds of others. The inline declaration (`out int n`) and discard (`out _`) are C# 7 ergonomics that eliminate the old pattern of declaring a variable just to pass it as `out`.

> **Senior angle:** `in` parameters are a micro-optimization for large value types (`struct`s bigger than ~16 bytes). The CLR still copies small structs even with `in` due to CPU register conventions. Over-using `in` on small types like `int` or `Vector2` adds overhead (pointer indirection) without saving a copy. Profile before optimizing.

## Optional Parameters and Named Arguments

Parameters can have **default values**, making them optional at the call site. Any argument can also be passed by name, in any order:

```csharp
static void CreateUser(string name, int age = 18, bool isAdmin = false, string role = "user")
{
    Console.WriteLine($"{name}, age {age}, admin={isAdmin}, role={role}");
}

CreateUser("Alice");                              // age=18, isAdmin=false, role=user
CreateUser("Bob", 25);                            // age overridden
CreateUser("Carol", isAdmin: true);               // skip age, set isAdmin by name
CreateUser("Dave", role: "editor", age: 30);      // named args in any order
```

Default values must be **compile-time constants** — literal values, `const` fields, `default`, or `null`. You can't use a `new T()` or a method call as a default. This catches people who write `void Foo(List<int> items = new())` — that's a compile error.

Named arguments dramatically improve readability when a method takes multiple booleans or when the parameter order is non-obvious:

```csharp
// Which is clearer?
SendEmail("alice@example.com", true, false, true, 3);
SendEmail("alice@example.com", isHtml: true, trackOpens: false, sendNow: true, retryCount: 3);
```

## Method Overloading

C# allows multiple methods with the same name as long as their **parameter signatures** differ. The compiler selects the correct overload at compile time based on the argument types — this is called **overload resolution**:

```csharp
static void Log(string message) => Console.WriteLine($"[string] {message}");
static void Log(int value) => Console.WriteLine($"[int] {value}");
static void Log(string message, int level) => Console.WriteLine($"[L{level}] {message}");

Log("hello");       // [string] hello
Log(42);            // [int] 42
Log("error", 2);    // [L2] error
```

Return type alone **cannot** distinguish overloads — the compiler needs to know which to call before evaluating the return. Overloading is entirely a compile-time concept; at runtime, each overload is a separate method with a distinct mangled name.

> **Senior angle:** Overload resolution in C# has surprisingly complex rules involving implicit conversions, optional parameters, type inference, and extension methods. A notorious pitfall: adding a new overload to a public API can be a **breaking change** if it changes which overload callers resolve to, even if no existing call sites produce a compile error. This is why framework designers often prefer `params` or builder patterns over adding overloads to existing methods.

## Local Functions

You can define a function inside another function. It's only visible within its enclosing method and can access the enclosing method's local variables:

```csharp
static int Factorial(int n)
{
    if (n < 0) throw new ArgumentOutOfRangeException(nameof(n));
    return Compute(n);

    // Local function — only visible inside Factorial
    // Marked static to prevent accidental capture of outer scope variables
    static int Compute(int x) => x <= 1 ? 1 : x * Compute(x - 1);
}

Console.WriteLine(Factorial(6));   // 720
```

Mark a local function `static` to prevent it from accidentally capturing the outer method's variables — the compiler will give you an error if you try. Local functions are the right choice when a helper is only needed in one place, is recursive, or needs to close over local state but you don't want the overhead of a heap-allocated closure.

> **Senior angle:** A non-static local function that captures variables compiles to a private method plus a compiler-generated struct that holds the captured state. A `static` local function compiles to a simple private method — no allocation, no struct. For inner loops doing complex work, this distinction can matter.

## Delegates: Functions as Values

A **delegate** is a type-safe function pointer. It's a reference type that holds a reference to a method (or chain of methods), not the result of calling that method.

```csharp
// Declare a delegate type — "a method that takes two ints and returns an int"
delegate int MathOperation(int a, int b);

static int Add(int a, int b) => a + b;
static int Multiply(int a, int b) => a * b;

MathOperation op = Add;           // Assign a method group
Console.WriteLine(op(3, 4));      // 7

op = Multiply;
Console.WriteLine(op(3, 4));      // 12

// Pass behavior as data — the callee doesn't care which method it is
static int ApplyTwice(MathOperation operation, int value) =>
    operation(operation(value, value), value);

Console.WriteLine(ApplyTwice(Add, 3));       // Add(Add(3,3), 3) = 9
Console.WriteLine(ApplyTwice(Multiply, 3));  // Multiply(Multiply(3,3), 3) = 27
```

Delegates are reference types and are **immutable** — combining or removing handlers creates a new delegate object. The `+` and `-` operators on delegates create **multicast delegates** (an invocation list). Events are multicast delegates exposed through a controlled subscription interface.

> **Senior angle:** Delegates in .NET are actually instances of classes derived from `System.MulticastDelegate`. When you write `op(3, 4)`, the JIT compiles this to a direct call through the delegate's function pointer, which is extremely fast. The overhead vs a direct call is roughly one null check + one indirect call — negligible in almost all scenarios except the tightest inner loops.

## `Func<T>` and `Action<T>`: Built-In Delegate Types

Writing custom delegate types every time is verbose. .NET provides generic delegate types that cover virtually every case:

- **`Action<T1, T2, ...>`** — takes arguments, returns `void` (up to 16 type parameters)
- **`Func<T1, T2, ..., TResult>`** — takes arguments, returns `TResult` (last type parameter is always the return)

```csharp
// Action: returns void
Action<string> print = Console.WriteLine;
print("Hello from Action");       // Hello from Action

Action<int, int> printSum = (a, b) => Console.WriteLine(a + b);
printSum(3, 4);                   // 7

// Func: last type parameter is the return type
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(10, 20));   // 30

Func<string, int> strLen = s => s.Length;
Console.WriteLine(strLen("hello")); // 5

Func<int, bool> isEven = n => n % 2 == 0;
Console.WriteLine(isEven(4));     // True

// Func with no input — lazy evaluation, re-evaluated on each call
Func<DateTime> now = () => DateTime.Now;
Console.WriteLine(now());
```

`Func` and `Action` are what LINQ uses internally. `Where` takes `Func<T, bool>`, `Select` takes `Func<T, TResult>`, `OrderBy` takes `Func<T, TKey>`. You will rarely need to declare your own delegate type in modern C# — if `Func` or `Action` fits, use them.

> **Senior angle:** There's an important distinction between `Func<T>` and `Lazy<T>`. Both defer evaluation, but `Lazy<T>` caches the result after the first call (thread-safe by default) while `Func<T>` re-evaluates every time. Using `Func<T>` where you meant `Lazy<T>` is a common source of subtle bugs in factories and DI registrations.

## Lambda Expressions

A **lambda expression** is an inline anonymous function — shorthand for creating a delegate without naming a separate method:

```csharp
// Statement lambda: full body with braces and explicit return
Func<int, int, int> multiply = (a, b) => { return a * b; };

// Expression lambda: single expression, no braces, no return keyword
Func<int, int, int> multiply2 = (a, b) => a * b;

// Single parameter: parentheses optional
Func<int, bool> isPositive = n => n > 0;

// No parameters
Action sayHello = () => Console.WriteLine("Hello!");
sayHello();

// Multi-line statement lambda
Func<int, string> classify = n =>
{
    if (n < 0) return "negative";
    if (n == 0) return "zero";
    return "positive";
};

Console.WriteLine(classify(-5));  // negative
Console.WriteLine(classify(0));   // zero
Console.WriteLine(classify(7));   // positive
```

Lambdas are the primary way you pass behavior in modern C# — to LINQ, to `Task`-based APIs, to UI event handlers. The compiler converts a lambda into either a delegate instance or, when used with `IQueryable<T>`, an **expression tree** (`Expression<Func<T>>`) — a data structure that represents the lambda's AST so that providers like Entity Framework can translate it to SQL.

> **Senior angle:** This `Func<T>` vs `Expression<Func<T>>` split is why a LINQ query against `IEnumerable<T>` runs in-process while the same query against `IQueryable<T>` (from EF or a LINQ provider) gets translated to a database query. Adding `AsEnumerable()` to an `IQueryable` forces the rest of the chain to run in-memory. Doing it too early pulls back too much data; doing it too late means your in-memory operations get compiled to expressions that the provider can't translate. This is one of the most common performance problems in EF-based applications.

## Closures: Capturing Variables

A lambda can **capture** variables from the surrounding scope. The captured variable is shared — not copied — between the lambda and the outer code. The lambda extends the lifetime of the variable beyond the scope in which it was declared:

```csharp
int counter = 0;
Action increment = () => counter++;   // Captures 'counter' by reference

increment();
increment();
increment();
Console.WriteLine(counter);   // 3 — real variable was modified

// Classic factory pattern: each call gets its own independent closure
static Action MakeCounter(string name)
{
    int count = 0;               // This variable lives on the heap once captured
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
counterB();  // B: 1  — counterB has its own 'count', independent of counterA
counterA();  // A: 3
```

When a lambda captures a local variable, the compiler promotes that variable from the stack to a **heap-allocated compiler-generated class** (a "display class"). This is what makes closures possible — and also why capturing in a hot loop can cause GC pressure.

**The loop capture gotcha** — one of the most famous C# pitfalls:

```csharp
var actions = new List<Action>();

// WRONG: all lambdas capture the same 'i' variable
for (int i = 0; i < 5; i++)
{
    actions.Add(() => Console.Write(i + " "));
}
actions.ForEach(a => a());   // Prints: 5 5 5 5 5 — all see i's final value

// CORRECT: capture a copy declared fresh each iteration
var actions2 = new List<Action>();
for (int i = 0; i < 5; i++)
{
    int copy = i;                              // New variable per iteration = new closure slot
    actions2.Add(() => Console.Write(copy + " "));
}
actions2.ForEach(a => a());  // Prints: 0 1 2 3 4
```

`foreach` in C# 5+ does **not** have this problem — the iteration variable is scoped per iteration. But `for` still does. This trips up experienced developers from other languages every time.

> **Senior angle:** The generated display class for a closure is a regular .NET reference type allocated on the heap. Each captured variable scope generates a separate class. Multiple lambdas in the same scope sharing the same captured variable share the same display class instance. Understanding this at the IL level helps when diagnosing GC pressure: if a long-lived lambda captures a large object, that object will not be collected as long as the delegate is alive.

## Putting It Together: Higher-Order Functions

A **higher-order function** takes or returns another function. This is the backbone of both LINQ and functional composition in C#:

```csharp
// Manual implementations of LINQ's core operators — for illustration
static IEnumerable<TResult> Map<T, TResult>(IEnumerable<T> source, Func<T, TResult> transform)
{
    foreach (var item in source)
        yield return transform(item);
}

static IEnumerable<T> Filter<T>(IEnumerable<T> source, Func<T, bool> predicate)
{
    foreach (var item in source)
        if (predicate(item))
            yield return item;
}

static TAccumulate Reduce<T, TAccumulate>(
    IEnumerable<T> source,
    TAccumulate seed,
    Func<TAccumulate, T, TAccumulate> accumulator)
{
    var result = seed;
    foreach (var item in source)
        result = accumulator(result, item);
    return result;
}

var numbers = new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

var evens       = Filter(numbers, n => n % 2 == 0);
var evenSquares = Map(evens, n => n * n);
var sum         = Reduce(evenSquares, 0, (acc, n) => acc + n);

Console.WriteLine(string.Join(", ", evenSquares));  // 4, 16, 36, 64, 100
Console.WriteLine($"Sum: {sum}");                   // 220

// LINQ is exactly this — more general, with deferred execution
var result = numbers
    .Where(n => n % 2 == 0)     // Filter
    .Select(n => n * n)          // Map
    .Aggregate(0, (acc, n) => acc + n);  // Reduce

Console.WriteLine($"LINQ sum: {result}");  // 220
```

`Map`/`Filter`/`Reduce` are `Select`/`Where`/`Aggregate`. LINQ just adds deferred (lazy) execution, composability across providers, and a much richer API surface.

## Method Groups

You don't always need a lambda — you can reference a named method directly as a delegate using a **method group**:

```csharp
var words = new[] { "banana", "apple", "cherry", "date" };

// Method group: the compiler infers the delegate type from context
Array.Sort(words, string.Compare);
Console.WriteLine(string.Join(", ", words));  // apple, banana, cherry, date

// Cleaner than a wrapping lambda
List<int> numbers = new() { 1, 2, 3 };
numbers.ForEach(Console.WriteLine);   // vs: numbers.ForEach(n => Console.WriteLine(n))
```

Method groups are cleaner than wrapping a method in a lambda that does nothing but call it. They also have a subtle performance advantage: since C# 11, method group conversions cache the delegate instance when the method is `static`, meaning you don't allocate a new delegate object on every call — which matters in hot paths.

> **Senior angle:** Prior to C# 11, every method group conversion created a new delegate object. In tight loops (e.g., `list.Sort(MyComparer)` called millions of times), this caused measurable GC pressure. The C# 11 caching optimization eliminates this for static methods. If you're targeting older runtimes, caching the delegate in a `static readonly` field achieves the same effect manually.

## `Predicate<T>` and `Comparison<T>`

Two specialized delegate types appear in the older parts of the BCL, predating `Func<T>`:

```csharp
// Predicate<T>: equivalent to Func<T, bool>
Predicate<string> isLong = s => s.Length > 5;

var words = new List<string> { "hi", "hello", "world", "C#", "programming" };
var longWords = words.FindAll(isLong);   // List<T>.FindAll takes Predicate<T>
Console.WriteLine(string.Join(", ", longWords));  // hello, world, programming

// Comparison<T>: equivalent to Func<T, T, int>
var scores = new List<int> { 42, 7, 99, 13, 55 };
scores.Sort((a, b) => b.CompareTo(a));   // Descending — lambda compatible with Comparison<T>
Console.WriteLine(string.Join(", ", scores));  // 99, 55, 42, 13, 7
```

These exist for historical reasons and remain in the BCL for compatibility. In new code, prefer `Func` and `Action`. The compiler freely converts between compatible delegate types when the signatures match.

---

## Key Takeaways

| Concept | What it is | When to use it |
|---|---|---|
| `static` method | No instance, no `this` | Utility / pure functions with no object state |
| `ref` parameter | Caller's variable is modified | Swap, in-place update |
| `out` parameter | Method must assign it | Try-parse pattern, multiple return values |
| `in` parameter | Read-only reference, avoids copy | Large structs in performance-critical code |
| Custom delegate | Named function signature type | Events, legacy APIs |
| `Func<T>` / `Action<T>` | Generic built-in delegate types | LINQ, callbacks, DI — almost everywhere |
| Lambda | Inline anonymous function | Passing behavior to LINQ, event handlers, APIs |
| Closure | Lambda capturing outer variables | Stateful callbacks, factories — watch for GC implications |
| Method group | Method name used as delegate | Cleaner alternative to wrapping lambda |
| Expression tree | `Expression<Func<T>>` | LINQ-to-SQL providers, reflection-style APIs |
