# Lesson 08: Logging the Professional Way

**What this covers:** `Microsoft.Extensions.Logging` — the real,
standard .NET logging library, from NuGet — log levels, structured
logging, and why a real, professional app doesn't use
`Console.WriteLine`.

**What you need first:** [Lesson 07](lesson-07-nuget-basics.md).

---

## Why not `Console.WriteLine`

It has no real levels (you can't turn off noisy, real debug output
without deleting the line), no real, structured data (just a flat
string), and nowhere else to go — a real add-in usually has no visible
console at all, so a real `Console.WriteLine` inside one often writes
to nothing anyone will ever see. `Microsoft.Extensions.Logging` solves
all three, real problems at once, and is the identical, real library
ASP.NET Core, and most other real, modern .NET code, already uses.

## Real log levels

From least to most severe:

```
Trace       -- extremely detailed, real, step-by-step noise
Debug       -- real, useful detail while developing
Information -- a real, normal, expected event happened
Warning     -- something real, unexpected, but not broken
Error       -- a real operation failed
Critical    -- the real app itself is in trouble
```

You configure a real, minimum level once — "show me `Information` and
above" — and every real `Trace`/`Debug` call in your code goes silent
without deleting a single line. This is the real, whole point:
the real logging calls stay in your code permanently; what actually
gets written is controlled separately.

## Getting a real `ILogger`

```csharp
using Microsoft.Extensions.Logging;

using ILoggerFactory factory = LoggerFactory.Create(builder =>
{
    builder.AddConsole();
    builder.SetMinimumLevel(LogLevel.Information);
});

ILogger logger = factory.CreateLogger("MyAddIn");
```

`LoggerFactory.Create` builds a real, configured factory — `AddConsole()`
is one real, built-in destination ("write to the console"); other real
destinations (a real file, a real Windows Event Log entry) plug into
the identical, real pattern. `CreateLogger("MyAddIn")` gets you the
real, actual object you call.

## Real, structured logging — not string interpolation

```csharp
logger.LogInformation("Part {PartName} cut at depth {Depth}", partName, depth);
```

Notice this is **not** `$"Part {partName} cut at depth {depth}"`. The
real `{PartName}` and `{Depth}` placeholders, and the real values, are
kept separate and passed through together — a real logging backend can
store `PartName` and `Depth` as real, individual, searchable fields,
not just baked into one flat string. This is the real, entire idea
behind "structured logging": the same real information a plain string
has, plus the ability to real, later query "show me every log where
`Depth` was over 5," which a plain, interpolated string could never
support.

## Real severity in practice

```csharp
logger.LogDebug("Checking part {PartName} for holes", part.Name);
logger.LogInformation("Cut operation completed on {PartName}", part.Name);
logger.LogWarning("Part {PartName} has no material assigned", part.Name);
logger.LogError(ex, "Failed to compute volume for {PartName}", part.Name);
```

The real `LogError` overload taking an `Exception` first (`ex`) is
worth calling out specifically: it captures the real, full stack trace
alongside your real message, instead of you manually stitching
`ex.ToString()` into a string yourself.

## Definition of done

- [ ] You added `Microsoft.Extensions.Logging` via NuGet (Lesson 07)
      and created a real, working `ILogger`.
- [ ] You can state, in your own words, what a real minimum log level
      controls.
- [ ] You wrote at least one real, structured log call using named
      placeholders, not string interpolation.
- [ ] You can explain why a real add-in shouldn't rely on
      `Console.WriteLine`.

## Next

[Lesson 09 — Configuration With `appsettings.json`](lesson-09-configuration-with-appsettings-json.md)
covers the real, standard way a professional .NET app reads settings
— including your real minimum log level — instead of hardcoding them.
