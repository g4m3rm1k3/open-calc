---
series: csharp-fundamentals
level: 25
title: Debugging & Professional Practices
lang: csharp
---

# Debugging & Professional Practices

Every lesson so far has taught a specific feature of the language. This last one teaches something different: what to actually do when code doesn't work, and how to write code a real team can trust — closing out this course by naming skills its own challenges have quietly required all along.

## Reading an Exception's Real Details

```csharp
using System;

class Program
{
    static int Divide(int a, int b)
    {
        return a / b;
    }

    static void Main()
    {
        try
        {
            Divide(10, 0);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Type: " + ex.GetType().Name);
            Console.WriteLine("Message: " + ex.Message);
            Console.WriteLine("Has a stack trace: " + (ex.StackTrace.Length > 0));
        }
    }
}
```

```text
Type: DivideByZeroException
Message: Attempted to divide by zero.
Has a stack trace: True
```

`ex.GetType().Name` — the exception's real, specific runtime type (Level 11's own `GetType()` idea) — `DivideByZeroException` here, not just "some error." `ex.Message` — a human-readable description of exactly what went wrong. `ex.StackTrace` — a string recording exactly which methods were being run, in order, at the moment the exception was thrown — in a real IDE (not this sandboxed runner), it prints as a readable, clickable list naming every method and line involved.

**SE lens:** The single most common debugging mistake is reading only the first line of an error and guessing. `ex.GetType().Name` names the exact category of failure; `ex.Message` usually says exactly what's wrong (which value, which operation); `ex.StackTrace` says exactly where. Reading all three, in that order, before changing a single line of code, resolves most real bugs faster than guessing ever does.

## A Bug, Found by Reading — Not Guessing

```csharp
using System;
using System.Collections.Generic;

class Program
{
    static double Average(List<int> numbers)
    {
        int total = 0;
        foreach (int n in numbers) total += n;
        return total / numbers.Count;
    }

    static void Main()
    {
        var scores = new List<int> { 1, 2, 4 };
        Console.WriteLine(Average(scores));
    }
}
```

```text
2
```

The real, correct average of `1, 2, 4` is `7 / 3 = 2.333...` — but this prints `2`. Reading the method instead of guessing: `total` is `int`, `numbers.Count` is `int`, and `int / int` in C# always performs **integer division**, truncating any remainder (Level 0's own arithmetic rules, resurfacing here as a genuine bug). `Average`'s own return type, `double`, never actually forced the *division itself* to happen as a `double` — only the already-truncated `int` result gets implicitly converted afterward.

The fix is one cast: `return (double)total / numbers.Count;` — converting `total` to `double` *before* the division runs, so the division itself is real, non-truncating floating-point division.

**CS lens:** This is a real, common category of bug: code that runs without throwing anything, produces a plausible-looking (not obviously wrong) number, and is wrong anyway. `Divide`'s `DivideByZeroException` above announces itself loudly; a silent truncation bug like this one doesn't — it only shows up when the *actual* expected value is known and checked against, which is exactly what a real test (Level 24) is for.

## Guard Clauses — Validating at the Boundary

```csharp
using System;

class BankAccount
{
    public decimal Balance { get; private set; }

    public BankAccount(decimal openingBalance)
    {
        if (openingBalance < 0)
            throw new ArgumentException("Opening balance cannot be negative");
        Balance = openingBalance;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Withdrawal amount must be positive");
        if (amount > Balance)
            throw new InvalidOperationException("Insufficient funds");
        Balance -= amount;
    }
}

class Program
{
    static void Main()
    {
        var account = new BankAccount(100);
        account.Withdraw(30);
        Console.WriteLine(account.Balance);

        try
        {
            account.Withdraw(-5);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine("Caught: " + ex.Message);
        }

        try
        {
            account.Withdraw(1000);
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine("Caught: " + ex.Message);
        }
    }
}
```

```text
70
Caught: Withdrawal amount must be positive
Caught: Insufficient funds
```

`if (amount <= 0) throw new ArgumentException(...)` — a **guard clause**: checked immediately, at the very top of the method, before any real work happens. `BankAccount` rejects bad input the instant it arrives, rather than letting `Balance` silently drift into an invalid state (negative, or larger than it should be) that would only surface as a confusing bug somewhere else, much later, far from its real cause.

**SE lens:** Guard clauses belong at a **boundary** — a constructor, a `public` method another class or another team calls — not scattered through every private helper underneath. Once `BankAccount`'s own boundary has already confirmed `amount` is positive and affordable, the private arithmetic beneath it can simply trust that and stay simple; re-checking the same condition redundantly, deep inside code that already only runs after the guard has passed, adds no real safety, only clutter.

## XML Documentation Comments

```csharp
using System;

class MathHelper
{
    /// <summary>
    /// Returns the square of the given integer.
    /// </summary>
    /// <param name="n">The number to square.</param>
    /// <returns>n multiplied by itself.</returns>
    public static int Square(int n)
    {
        return n * n;
    }
}

class Program
{
    static void Main()
    {
        Console.WriteLine(MathHelper.Square(7));
    }
}
```

```text
49
```

`/// <summary>...</summary>` — a real, structured comment format (three slashes, not two) a real IDE reads and shows automatically the moment `MathHelper.Square` is typed anywhere else in a project, without needing to open `MathHelper` itself. `<param name="n">` and `<returns>` document each piece specifically enough that a caller never has to guess what a method needs or gives back.

**SE lens:** A comment restating *what* a line already obviously does (`// add one to x`) is worse than no comment — it can silently go stale the moment the code beneath it changes, while still looking authoritative. A real, useful comment (or, better, a real test, per Level 24) explains *why* — a non-obvious constraint, or a public contract like `Square`'s here — the kind of thing reading the code alone can't tell you.

## Challenge: library_system

Every earlier level's own challenge exercised one idea at a time. This closing challenge combines several real ones — inheritance-free custom exceptions (Level 10), classes with fields and methods (Level 7), collections and LINQ (Levels 16-17), and guard-clause-style validation, all in one small, real system.

Write a `Library` class with:
- A method `void AddBook(string title, string author)` that adds a new book (not checked out) to the library.
- A method `void CheckOut(string title)` that marks the book with that `title` as checked out. If no book with that title exists, throw a custom `BookNotFoundException` (define it as `class BookNotFoundException : Exception` with a constructor taking a `string message` and passing it to `: base(message)`, following Level 10's own pattern). If the book exists but is already checked out, throw `InvalidOperationException`.
- A method `void Return(string title)` that marks the book with that `title` as not checked out. Throws `BookNotFoundException` if no book with that title exists (returning a book that isn't checked out should simply succeed without error).
- A method `List<string> AvailableTitles()` that returns the titles of every book that is **not** currently checked out, using LINQ (`Where`/`Select`/`ToList`).

```challenge
class BookNotFoundException : Exception
{
    // TODO
}

class Book
{
    // TODO
}

class Library
{
    // TODO
}
```

```test
var library = new Library();
library.AddBook("Dune", "Frank Herbert");
library.AddBook("1984", "George Orwell");
library.AddBook("Foundation", "Isaac Asimov");

var available1 = library.AvailableTitles();
assert available1.Count == 3

library.CheckOut("1984");
var available2 = library.AvailableTitles();
assert available2.Count == 2 && !available2.Contains("1984")

bool threwAlreadyCheckedOut = false;
try
{
    library.CheckOut("1984");
}
catch (InvalidOperationException)
{
    threwAlreadyCheckedOut = true;
}
assert threwAlreadyCheckedOut == true

bool threwNotFound = false;
try
{
    library.CheckOut("Nonexistent Book");
}
catch (BookNotFoundException)
{
    threwNotFound = true;
}
assert threwNotFound == true

library.Return("1984");
var available3 = library.AvailableTitles();
assert available3.Count == 3 && available3.Contains("1984")
```

## Course Complete

Twenty-six levels, starting from `int x = 5;` and ending with a real, custom-exception-throwing, LINQ-querying system built from scratch — every one of them verified by real, live-run C# code, exactly like this final one. Every idea in between — value types, inheritance, generics, delegates, LINQ, async, testing — is a real, standard part of professional C#, not a simplified stand-in for it. The next real step is a real project: something with its own actual purpose, not a lesson's, applying everything here to a real, honest problem.
