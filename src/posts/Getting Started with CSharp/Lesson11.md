# Exception Handling: Dealing with Things That Go Wrong

Every program you write will eventually encounter something unexpected: a file that doesn't exist, a number entered where text was expected, a network connection that dropped, or a division by zero. In C#, these runtime failures are called **exceptions**. Without any handling, an exception immediately crashes your program with an error message. Exception handling gives you a way to catch those failures, respond to them gracefully, and keep your program running — or at least fail in a controlled, informative way.

## What Is an Exception?

Think of an exception as an emergency signal. When something goes wrong at runtime, C# creates an exception **object** — an instance of a class that describes what went wrong — and **throws** it. If nothing catches it, the program stops.

```csharp
// This will crash with: DivideByZeroException
int a = 10;
int b = 0;
int result = a / b;   // Exception thrown here
Console.WriteLine(result);  // This line never runs
```

The crash message you'd see is something like:
```
Unhandled exception: System.DivideByZeroException: Attempted to divide by zero.
```

C# is telling you: the type of exception is `DivideByZeroException`, and the reason is "Attempted to divide by zero." Every exception has a type (which tells you *what* went wrong) and a message (which tells you *why*).

## `try` and `catch`: The Basic Pattern

A `try` block says "attempt this code." A `catch` block says "if an exception occurs, run this instead":

```csharp
try
{
    // Code that might fail goes inside the try block
    Console.Write("Enter a number: ");
    string input = Console.ReadLine();

    // int.Parse will throw FormatException if input is not a valid number
    int number = int.Parse(input);

    Console.WriteLine($"You entered: {number}");
    Console.WriteLine($"Doubled: {number * 2}");
}
catch (FormatException ex)
{
    // This block runs ONLY if a FormatException was thrown
    // 'ex' is the exception object — it contains details about what went wrong
    Console.WriteLine("That wasn't a valid number.");
    Console.WriteLine($"Details: {ex.Message}");
}

// Program continues here whether or not an exception occurred
Console.WriteLine("Program still running.");
```

Walk through what happens:
- If the user types `"42"`: `int.Parse("42")` succeeds, no exception, `catch` block is skipped, output shows the number
- If the user types `"abc"`: `int.Parse("abc")` throws a `FormatException`, execution immediately jumps to the `catch` block, the doubled-number line never runs

The `ex` variable gives you access to the exception object. Its most useful property is `ex.Message` — a human-readable description of what went wrong.

## Catching Different Exception Types

You can have multiple `catch` blocks, each handling a different kind of exception. C# tries them in order and runs the first one that matches:

```csharp
static void ProcessInput(string input, string[] data)
{
    try
    {
        // Parse the input as an integer index
        int index = int.Parse(input);

        // Access the array at that index
        string item = data[index];

        Console.WriteLine($"Item at index {index}: {item}");
    }
    catch (FormatException)
    {
        // Thrown by int.Parse when the string isn't a number
        // Notice: no 'ex' variable needed if you don't use it
        Console.WriteLine("Error: Please enter a whole number.");
    }
    catch (IndexOutOfRangeException)
    {
        // Thrown when you access an array index that doesn't exist
        // e.g., data has 3 items but you asked for index 5
        Console.WriteLine($"Error: Index out of range. Array has {data.Length} items.");
    }
    catch (Exception ex)
    {
        // This catches ANY exception not caught above
        // 'Exception' is the base type of all exceptions
        // Useful as a safety net, but try to be specific when possible
        Console.WriteLine($"Unexpected error: {ex.Message}");
    }
}

string[] fruits = { "apple", "banana", "cherry" };

ProcessInput("1", fruits);    // Item at index 1: banana
ProcessInput("abc", fruits);  // Error: Please enter a whole number.
ProcessInput("99", fruits);   // Error: Index out of range. Array has 3 items.
```

**Order matters**: always put more specific exception types before less specific ones. If you put `catch (Exception)` first, it catches everything and the specific blocks below it are never reached.

## `finally`: Code That Always Runs

Sometimes you need to run cleanup code whether or not an exception occurred — for example, closing a file or releasing a network connection. The `finally` block runs in **all cases**: normal completion, exception caught, and even if an exception is not caught:

```csharp
static void ReadFile(string path)
{
    // Declare outside try so it's accessible in finally
    System.IO.StreamReader? reader = null;

    try
    {
        Console.WriteLine($"Opening file: {path}");
        reader = new System.IO.StreamReader(path);

        string contents = reader.ReadToEnd();
        Console.WriteLine($"File contents ({contents.Length} chars):");
        Console.WriteLine(contents);
    }
    catch (System.IO.FileNotFoundException)
    {
        Console.WriteLine($"Error: File '{path}' does not exist.");
    }
    catch (System.IO.IOException ex)
    {
        Console.WriteLine($"Error reading file: {ex.Message}");
    }
    finally
    {
        // This ALWAYS runs — even if we return early, or an exception wasn't caught
        // Close the reader if it was successfully opened
        reader?.Close();
        Console.WriteLine("Cleanup done: reader closed.");
    }
}

ReadFile("notes.txt");   // Works if file exists; shows error if not
```

The `finally` block is your guarantee: no matter what path execution takes, this code runs. This prevents **resource leaks** — situations where files stay open or memory stays allocated because an exception skipped your cleanup code.

## The `using` Statement: Automatic Cleanup

Because "open a resource, use it, always close it" is so common, C# has a shortcut. Any type that implements `IDisposable` (a standard interface meaning "I have a cleanup method") can be used with `using`:

```csharp
// WITHOUT using — manual try/finally required
static void ManualCleanup(string path)
{
    System.IO.StreamReader? reader = null;
    try
    {
        reader = new System.IO.StreamReader(path);
        Console.WriteLine(reader.ReadToEnd());
    }
    finally
    {
        reader?.Dispose();   // Dispose() is the standard cleanup method
    }
}

// WITH using — identical behavior, half the code
// The 'using' block automatically calls Dispose() when it exits, no matter what
static void AutoCleanup(string path)
{
    using (var reader = new System.IO.StreamReader(path))
    {
        Console.WriteLine(reader.ReadToEnd());
    }
    // reader.Dispose() is called here automatically, even if an exception occurred
}

// Modern C# (C# 8+) declaration-style using — disposes at end of enclosing scope
static void ModernCleanup(string path)
{
    using var reader = new System.IO.StreamReader(path);
    Console.WriteLine(reader.ReadToEnd());
    // reader.Dispose() called when the method returns
}
```

Whenever you see a type that has `.Dispose()` or shows up in Visual Studio with a suggestion to wrap it in `using`, use the `using` statement. It's the idiomatic C# way to handle resources.

## `throw`: Signalling an Error Yourself

You're not limited to catching exceptions — you can also **throw** them yourself when your code detects an invalid situation:

```csharp
static double Divide(double numerator, double denominator)
{
    // Check for invalid input before doing the work
    if (denominator == 0)
    {
        // throw creates and raises an exception right here
        // Execution immediately leaves this method and goes to the nearest catch
        throw new ArgumentException("Denominator cannot be zero.", nameof(denominator));
    }

    return numerator / denominator;
}

static void SetAge(int age)
{
    if (age < 0)
        throw new ArgumentOutOfRangeException(nameof(age), "Age cannot be negative.");

    if (age > 150)
        throw new ArgumentOutOfRangeException(nameof(age), $"Age {age} is unrealistically large.");

    Console.WriteLine($"Age set to {age}");
}

static string GetUserName(string? name)
{
    // ArgumentNullException is the conventional choice when a required value is null
    if (name is null)
        throw new ArgumentNullException(nameof(name), "Name is required.");

    return name.Trim();
}

// Using these methods:
try
{
    Console.WriteLine(Divide(10, 2));    // 5
    SetAge(25);                          // Age set to 25
    SetAge(-5);                          // Throws! Caught below.
}
catch (ArgumentOutOfRangeException ex)
{
    Console.WriteLine($"Invalid argument: {ex.Message}");
}
```

The `nameof(denominator)` expression produces the string `"denominator"` — the name of the parameter. This is better than hardcoding `"denominator"` as a string because if you rename the parameter, `nameof` updates automatically and the compiler catches the change.

## Re-throwing Exceptions

Sometimes you catch an exception, do some partial handling (like logging), and then want to pass it on to the caller. Use `throw` without an argument to re-throw the **original** exception, preserving its full history:

```csharp
static void LoadConfiguration(string path)
{
    try
    {
        string json = System.IO.File.ReadAllText(path);
        Console.WriteLine($"Loaded config from {path}");
        // ... process json ...
    }
    catch (System.IO.FileNotFoundException ex)
    {
        // Log the error (or do partial handling)
        Console.WriteLine($"[LOG] Config file not found: {ex.Message}");

        // Re-throw — the caller will also get the exception
        // 'throw' alone preserves the original stack trace
        // 'throw ex' would reset the stack trace (don't do that)
        throw;
    }
}

try
{
    LoadConfiguration("config.json");
}
catch (System.IO.FileNotFoundException)
{
    Console.WriteLine("Startup failed: missing configuration file.");
    // In a real app you might exit, show an error dialog, etc.
}
```

## Creating Custom Exception Types

The built-in exception types cover most cases, but sometimes you want a type that clearly communicates a domain-specific problem. Create a class that inherits from `Exception`:

```csharp
// Custom exception for our banking domain
class InsufficientFundsException : Exception
{
    // Extra property specific to this exception
    public decimal AttemptedAmount { get; }
    public decimal AvailableBalance { get; }

    // Pass the message up to the base Exception class
    public InsufficientFundsException(decimal attempted, decimal available)
        : base($"Cannot withdraw {attempted:C}. Available balance: {available:C}")
    {
        AttemptedAmount  = attempted;
        AvailableBalance = available;
    }
}

class BankAccount
{
    private decimal _balance;

    public BankAccount(decimal initialBalance)
    {
        _balance = initialBalance;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Withdrawal amount must be positive.", nameof(amount));

        if (amount > _balance)
            throw new InsufficientFundsException(amount, _balance);

        _balance -= amount;
        Console.WriteLine($"Withdrew {amount:C}. New balance: {_balance:C}");
    }
}

var account = new BankAccount(100m);

try
{
    account.Withdraw(40m);    // Success
    account.Withdraw(90m);    // Fails — insufficient funds
}
catch (InsufficientFundsException ex)
{
    Console.WriteLine($"Transaction declined: {ex.Message}");
    Console.WriteLine($"You tried: {ex.AttemptedAmount:C}");
    Console.WriteLine($"You have: {ex.AvailableBalance:C}");
}
```

## Common Built-In Exception Types

You'll encounter these regularly:

| Exception Type | When it's thrown |
|---|---|
| `ArgumentNullException` | A required argument was `null` |
| `ArgumentOutOfRangeException` | An argument's value was outside an acceptable range |
| `ArgumentException` | An argument was invalid for some other reason |
| `InvalidOperationException` | You called a method at the wrong time (e.g., reading a closed file) |
| `FormatException` | A string couldn't be parsed (e.g., `int.Parse("abc")`) |
| `OverflowException` | An arithmetic result was too large for its type |
| `IndexOutOfRangeException` | An array index was negative or ≥ array length |
| `NullReferenceException` | You tried to use `null` as if it were an object |
| `DivideByZeroException` | Integer division by zero |
| `NotImplementedException` | A method intentionally has no implementation yet |
| `NotSupportedException` | An operation is not supported by this type |

## When to Catch and When Not To

A beginner's instinct is often to wrap everything in `try/catch`. Resist that. Here's a practical guide:

**Catch exceptions when** you can do something useful with them — show the user a friendly message, retry the operation, use a fallback value, or log and continue.

**Don't catch exceptions when** you have no useful response. Let them bubble up to a higher level that does know how to handle them. A function that reads a file shouldn't catch every possible error and swallow it silently — the caller needs to know something went wrong.

**Never do this**: catching an exception and doing nothing (called "swallowing" it) hides bugs and makes programs very hard to debug:

```csharp
// Bad — hides the error completely
try
{
    DoSomething();
}
catch (Exception)
{
    // Empty: the error happened, nobody knows, program continues in broken state
}

// Good — at minimum, log it
try
{
    DoSomething();
}
catch (Exception ex)
{
    Console.WriteLine($"[ERROR] {ex.Message}");
    // Decide: can we recover? If not, re-throw.
    throw;
}
```
