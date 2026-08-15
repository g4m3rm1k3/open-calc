# Lesson 26: Opening the Same `.db` From C#

**What you will build:** the identical, unmodified `pocket_hardware.db`
opened a fourth real way — from C#, a statically-typed, compiled
language, proving Lesson 25's own portability claim isn't limited to
two dynamically-typed languages that happen to look similar.

**What you need to know first:** [Lesson 25](lesson-25-opening-the-same-db-from-nodejs.md)
— the same real portability proof, now repeated once more, from a
genuinely different kind of language.

**Terms introduced in this lesson:** none new.

**Objects and methods used:**

**`Microsoft.Data.Sqlite.SqliteConnection`**
- *What it is:* a real, official Microsoft-maintained NuGet package
  providing .NET's own real SQLite driver (`dotnet add package
  Microsoft.Data.Sqlite`) — the same real package this series' own
  `pocket-inventory-wpf` sibling project uses for its own persistence.
- *Implementation:* `new SqliteConnection("Data Source=path")` — a real
  connection string naming the file; `.Open()` opens it, mirroring
  Python's `sqlite3.connect` (Lesson 17) and Node's `DatabaseSync`
  (Lesson 25) in a third real, distinct syntax.
- *Its use:* opening `pocket_hardware.db` from C#.

**`SqliteCommand`**
- *What it is:* a real object representing one SQL statement to run
  against an open connection.
- *Implementation:* `connection.CreateCommand()` returns one;
  `.CommandText` holds the real SQL string; `.Parameters.AddWithValue(name,
  value)` binds a real, named parameter — C#'s own real equivalent of
  Lesson 18's `?` placeholder, spelled `$name` here instead.
- *Its use:* running this lesson's own real, parameterized query.

**`SqliteDataReader`**
- *What it is:* a real, forward-only object for reading a query's
  result rows.
- *Implementation:* `command.ExecuteReader()` returns one;
  `.Read()` advances to the next real row, returning `false` once none
  remain; `.GetString(ordinal)`/`.GetDouble(ordinal)` read a specific
  column by its real, zero-based position.
- *Its use:* reading `parts`' own real rows into strongly-typed C#
  values.

---

## Concept Unit: The Same File, a Statically-Typed Client This Time

### The Problem

Python and Node.js are both dynamically typed — reading a `price`
column and getting back a real, correctly-typed number "just worked" in
both, with no explicit type declared anywhere in the reading code. Does
a statically-typed language, which has to declare a real, specific type
for every value it reads, still work correctly against the exact same
file?

### Introduce the Concept in Isolation

```csharp
using Microsoft.Data.Sqlite;

using var connection = new SqliteConnection("Data Source=pocket_hardware.db");
connection.Open();

using var command = connection.CreateCommand();
command.CommandText = "SELECT name, price FROM parts WHERE price > $threshold";
command.Parameters.AddWithValue("$threshold", 10);

using var reader = command.ExecuteReader();
while (reader.Read())
{
    Console.WriteLine($"{reader.GetString(0)}: ${reader.GetDouble(1)}");
}
```

```
$ dotnet run
Hammer: $12.99
Drill: $45
Level: $14.75
```

The identical real three rows, a third time — `reader.GetDouble(1)`
correctly reads `price` as a real, genuine C# `double`, and
`reader.GetString(0)` correctly reads `name` as a real `string`, both
without any explicit conversion code written by hand. C#'s own real
static type system required declaring *which* real type each column
would be read as (`GetString`, `GetDouble` — a real, specific method
per expected type, unlike Python's or Node's own dynamically-typed
`fetchall`/`.all()`) — and both were correct, proof Lesson 02's own
SQLite type-affinity rules produced real, genuinely typed values on
disk, not merely values that happened to look right when printed by a
dynamically-typed language.

### Discard

This real, small program is disposable proof of this lesson's own
single point; Arc 4's own backend stays in Python throughout this
series, exactly as Arc 5's own desktop shell does.

### Mechanical Walkthrough

- `using var connection = new SqliteConnection("Data Source=pocket_hardware.db");`
  — **(a) first appearance** of `SqliteConnection`, full treatment
  above; `using var` — a real C# language feature (automatic disposal
  at the end of the enclosing scope, this series' own first mention of
  it) — assumed familiar as ordinary C#/.NET resource management, not
  re-taught here.
- `connection.Open();` — **(a) first appearance**: unlike Python's
  `sqlite3.connect` (which opens immediately) and Node's `DatabaseSync`
  constructor (same), C#'s own `SqliteConnection` is constructed first,
  then explicitly `.Open()`ed as a real, separate step.
- `command.CommandText = "..."; command.Parameters.AddWithValue("$threshold", 10);`
  — **(a) first appearance** of `SqliteCommand`'s own real shape, full
  treatment above; `$threshold` as a real, *named* placeholder — **(b)
  hard concept reappearing** conceptually (Lesson 18's own
  parameterization principle), new only in its specific C#/`Microsoft.
  Data.Sqlite` spelling (a named `$param` rather than SQL's positional
  `?`).
- `reader.Read()` / `reader.GetString(0)` / `reader.GetDouble(1)` —
  **(a) first appearance**, full treatment above.

### CS Lens

C#'s own requirement to name a specific real type per column read
(`GetString`, `GetDouble`) versus Python's and Node's own dynamically-
typed access is a real, direct instance of **static vs. dynamic
typing**, applied at the exact same real boundary (reading a database
row) in three genuinely different languages — the identical real data,
three different real type-safety guarantees about accessing it.

### SE Lens

The real, practical value of this specific lesson within its own
series: this project's own [`pocket-inventory-wpf`](../pocket-inventory-wpf/)
sibling curriculum builds a real, complete WPF desktop app in C#, using
this exact same real `Microsoft.Data.Sqlite` package. Nothing about
this lesson's own real proof — the identical file, correctly read by a
third real language — is coincidental: it's the concrete, provable
reason a SQLite-backed project can have a Python backend (this series'
own Arc 4) and, separately, a genuinely different C# desktop
application, both operating on data that could be the same real file
format, without either one needing to know the other exists.

## Connect the pieces

Four real clients now, all proven against the identical, unmodified
`pocket_hardware.db`: the `sqlite3` CLI, Python, Node.js, and now C# —
two dynamically typed, one statically typed, all reading the exact same
real rows correctly, with zero conversion step anywhere in this
series so far.

## What breaks without this

Attempt to read `price` as a real C# `int` instead of the correct
`double`:

```csharp
Console.WriteLine(reader.GetInt32(1));
```

```
System.InvalidCastException: Specified cast is not valid.
```

A real, loud, immediate failure — proof C#'s own static type system
enforces a real, honest correspondence between the value SQLite
actually stored (Lesson 02's own real `REAL` affinity, a genuine
floating-point value) and the specific method used to read it back;
unlike Python's or Node's own dynamically-typed access, which would
have silently handed back whatever real type the value already was,
C# requires the calling code to name the *correct* one, or fail loudly
rather than silently truncate or misinterpret it.

## Exercises

1. Write a real, small C# program that inserts a new row into `parts`
   using a parameterized `INSERT`, then confirm it independently at the
   real `sqlite3` CLI.
2. Reproduce this lesson's own real `InvalidCastException` yourself,
   then fix it by reading `price` as a real `float` instead of `double`
   — research whether this succeeds or fails, and explain why in your
   own words, based on the real, actual precision SQLite's own `REAL`
   storage class uses internally.

## Definition of Done

- [ ] You read real `parts` rows from C# and confirmed they match every
      earlier lesson's own results exactly.
- [ ] You caused the real `InvalidCastException` from mismatching a
      column's real type and understood why it's a loud failure here,
      unlike in Python or Node.
- [ ] You completed both exercises.

## Next

[Lesson 27 — Opening the Same `.db` From a Browser](lesson-27-opening-the-same-db-from-a-browser.md)
proves the identical file works from a fourth real language,
JavaScript — but inside a browser, where one real, fundamental
difference from every client so far finally breaks this lesson's own
portability streak.
