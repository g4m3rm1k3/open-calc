# Lesson 13: Exception Handling

**What this covers:** `try`/`catch`/`finally`, catching specific vs.
general failures, and `using` for real, guaranteed cleanup — what
happens, and what you do, when a real call into a host API fails.

**What you need first:** [Lesson 11](lesson-11-just-enough-csharp-syntax.md).

---

## The real, direct parallel to Python

```python
try:
    result = risky_call()
except ValueError as e:
    print(f"bad value: {e}")
finally:
    cleanup()
```

```csharp
try
{
    var result = RiskyCall();
}
catch (ArgumentException e)
{
    Console.WriteLine($"bad value: {e.Message}");
}
finally
{
    Cleanup();
}
```

Structurally identical to Python's own `try`/`except`/`finally` — real
`catch` instead of `except`, and a real, specific exception *type*
instead of a class name after `as`. `finally` means the real, same
thing it does in Python: this block real, always runs, whether the
`try` succeeded, failed, or even returned early.

## Real exception types, and catching the specific one

Every real exception in C# derives from `System.Exception`. A few
real, common ones you'll actually see:

```
NullReferenceException    -- you real, used something that was null
ArgumentException         -- a real argument was invalid
ArgumentNullException     -- a real, specific argument was null
InvalidOperationException -- the real object's current state doesn't allow this call
FileNotFoundException     -- a real file genuinely wasn't there
```

Catch the real, most specific type you can — it tells you, and anyone
real reading your code later, exactly what you're handling:

```csharp
try
{
    var part = project.FindPartByName(name);
}
catch (ArgumentNullException e)
{
    logger.LogWarning("Part name was null: {Message}", e.Message);
}
catch (InvalidOperationException e)
{
    logger.LogError(e, "Project was in an invalid state");
}
```

Multiple real `catch` blocks are checked top to bottom — put the real,
most specific exception type first; a real, more general one (plain
`Exception`) placed above a specific one would real, silently catch
everything and the specific block below it would never run.

## Don't catch `Exception` and go silent

```csharp
// Don't do this — a real, silent failure is worse than a loud one
try
{
    DoSomething();
}
catch (Exception)
{
}
```

This is the real, single worst pattern in exception handling: a real
failure happens, and genuinely nothing tells you. At minimum, log it
(Lesson 08) even in a real, broad catch-all:

```csharp
try
{
    DoSomething();
}
catch (Exception e)
{
    logger.LogError(e, "DoSomething failed");
}
```

## `using`: real, guaranteed cleanup without writing `finally`

```csharp
using (var stream = File.OpenRead("data.txt"))
{
    // real, automatic Dispose() call happens here, even if an exception is thrown
}
```

Some real .NET objects — file streams, and often real objects a host
API hands you (a real document, a real connection) — hold onto a real,
external resource and need real, explicit cleanup, via a method named
`Dispose()`. Wrapping one in a real `using` block guarantees
`Dispose()` runs the moment the block ends, exception or not — the
real, preferred alternative to writing your own `try`/`finally` by
hand for this exact, common case. If a real type your host API returns
implements `IDisposable`, wrap your use of it in `using`.

## A real call into a host API, handled properly

```csharp
try
{
    part.Cut(depth: 5.0);
    logger.LogInformation("Cut completed on {PartName}", part.Name);
}
catch (InvalidOperationException e)
{
    logger.LogError(e, "Cut failed on {PartName} — part may be in an invalid state", part.Name);
}
```

This is the real, whole shape you'll use constantly once you're
calling into a real, unfamiliar API: wrap the real call, catch the
real, specific failure mode the documentation warns you about, and log
it with enough real, structured detail (Lesson 08) to actually debug
it later.

## Definition of done

- [ ] You wrote a real `try`/`catch` that handles one, specific real
      exception type, not a bare `Exception`.
- [ ] You can explain, in your own words, why `finally` runs even when
      the `try` block returns or throws.
- [ ] You wrapped a real, disposable resource in a `using` block.
- [ ] You can state, in your own words, why silently catching and
      discarding `Exception` is a real, dangerous pattern.

## Next

[Lesson 14 — LINQ: Querying Collections the Real, Standard Way](lesson-14-linq-querying-collections.md)
covers the real, idiomatic way to filter, transform, and search the
`IList<T>`/`IEnumerable<T>` collections a real API keeps handing you.
