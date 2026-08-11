# Concept: The ADO.NET Provider Pattern (`DbConnection`/`DbCommand`/`DbDataReader`)

**What you'll understand by the end:** why every .NET database library — SQLite, SQL Server, MySQL, PostgreSQL, and others — exposes the identical connection/command/reader shape, where that shape actually lives (a real set of shared base classes, not a coincidence of naming), and how writing code against that shared shape instead of one library's own concrete types is what lets the underlying database be swapped later with minimal change.

**Prerequisites:** familiarity with a garden-variety ADO.NET-style database library — opening a connection, creating a command, running a query and reading rows back — in any single provider (SQLite, SQL Server, or similar). This file assumes that vocabulary already makes sense and focuses on the shared shape underneath it.

## Setup

```
dotnet new console -o lab-adoprovider
cd lab-adoprovider
dotnet add package Microsoft.Data.Sqlite
```

Replace the generated `Program.cs`'s contents with the example below. `Microsoft.Data.Sqlite` is used here purely as one real, concrete provider to run against — nothing about this file's own point is SQLite-specific.

## The Problem

Application code that talks to a database usually ends up calling very specific, provider-branded types — `SqliteConnection`, `SqlConnection`, `MySqlConnection`, `NpgsqlConnection` — directly. That works, but it quietly welds the application's own data-access code to one specific database engine: every method signature, every field type, every `using` block names that one provider's own class by name. If the underlying database ever needs to change — SQLite for a small desktop tool outgrowing itself into a shared SQL Server instance, for instance — every one of those call sites has to be found and rewritten, even though the actual *logic* (open a connection, run a command, read some rows) never conceptually changed at all.

## The Isolated Example

```csharp
using System.Data.Common;
using Microsoft.Data.Sqlite;

// A function written entirely against the SHARED base types every
// ADO.NET provider implements -- never against SqliteConnection,
// SqliteCommand, or SqliteDataReader by name.
static void PrintFirstName(DbConnection connection, string sql)
{
    connection.Open();
    using DbCommand command = connection.CreateCommand();
    command.CommandText = sql;
    using DbDataReader reader = command.ExecuteReader();
    if (reader.Read())
    {
        Console.WriteLine($"  First row's Name: {reader.GetString(0)}");
    }
    connection.Close();
}

// Prove the inheritance chain directly, not just assert it.
Console.WriteLine("SqliteConnection's base type: " + typeof(SqliteConnection).BaseType);
Console.WriteLine("SqliteCommand's base type: " + typeof(SqliteCommand).BaseType);
Console.WriteLine("SqliteDataReader's base type: " + typeof(SqliteDataReader).BaseType);
Console.WriteLine("Is SqliteConnection really a DbConnection? " + typeof(DbConnection).IsAssignableFrom(typeof(SqliteConnection)));

// Build a real SQLite database, then hand it to the generic function
// above as nothing more specific than a plain DbConnection.
using (SqliteConnection setupConnection = new SqliteConnection("Data Source=lab.db"))
{
    setupConnection.Open();
    using SqliteCommand createTable = setupConnection.CreateCommand();
    createTable.CommandText = "CREATE TABLE IF NOT EXISTS Widgets (Name TEXT NOT NULL)";
    createTable.ExecuteNonQuery();
    using SqliteCommand insert = setupConnection.CreateCommand();
    insert.CommandText = "INSERT INTO Widgets (Name) VALUES ('Hex Bolt')";
    insert.ExecuteNonQuery();
}

Console.WriteLine();
Console.WriteLine("Calling PrintFirstName(DbConnection, string), passing a real SqliteConnection:");
DbConnection asBaseType = new SqliteConnection("Data Source=lab.db");
PrintFirstName(asBaseType, "SELECT Name FROM Widgets");
```

Run it:

```
dotnet run
```

**Real output:**

```
SqliteConnection's base type: System.Data.Common.DbConnection
SqliteCommand's base type: System.Data.Common.DbCommand
SqliteDataReader's base type: System.Data.Common.DbDataReader
Is SqliteConnection really a DbConnection? True

Calling PrintFirstName(DbConnection, string), passing a real SqliteConnection:
  First row's Name: Hex Bolt
```

**What this proves:** `SqliteConnection`, `SqliteCommand`, and `SqliteDataReader` are not independently-invented types that merely *resemble* a common shape by convention — `typeof(SqliteConnection).BaseType` genuinely reports `System.Data.Common.DbConnection`, a real class in the .NET Base Class Library, and `typeof(DbConnection).IsAssignableFrom(typeof(SqliteConnection))` confirms it directly. `PrintFirstName` is written entirely in terms of `DbConnection`/`DbCommand`/`DbDataReader` — it never names `Sqlite` anything — and it still runs correctly against a real `SqliteConnection`, because a `SqliteConnection` genuinely *is* a `DbConnection`, usable anywhere the base type is expected. Nothing about `PrintFirstName`'s own code would need to change to instead receive a `SqlConnection`, a `MySqlConnection`, or an `NpgsqlConnection` — every one of those is built the identical way, deriving from the identical base classes; only the single line constructing the concrete connection object would differ. (This file runs that proof against one real provider, SQLite, deliberately — actually installing and running against a live SQL Server, MySQL, or PostgreSQL instance is outside what a standalone, no-server-required lab can honestly demonstrate; the inheritance fact just proven is what makes the claim about the other providers true, not an unverified leap.)

## Mechanical Walkthrough

- `DbConnection`, `DbCommand`, `DbDataReader` — abstract base classes, declared once in `System.Data.Common` (a BCL namespace, not tied to any one database), each naming the operations every real provider must supply an implementation for: `DbConnection.Open()`/`.CreateCommand()`, `DbCommand.CommandText`/`.ExecuteReader()`/`.ExecuteNonQuery()`, `DbDataReader.Read()`/`.GetString(int)`/the rest of its typed column accessors.
- `SqliteConnection : DbConnection`, `SqliteCommand : DbCommand`, `SqliteDataReader : DbDataReader` — each provider-specific class is a real subclass, supplying the actual, concrete implementation (talking to a real SQLite file, in this case) behind those inherited members. `SqlConnection`, `MySqlConnection`, `NpgsqlConnection`, and their own `*Command`/`*DataReader` siblings each do the identical thing against a different real database engine.
- `static void PrintFirstName(DbConnection connection, string sql)` — a parameter typed as the *base* class, not any specific provider's subclass — this is the whole mechanism: any object whose real, runtime type derives from `DbConnection` can be passed in here, regardless of which provider actually created it.
- `connection.CreateCommand()` returning `DbCommand`, and `command.ExecuteReader()` returning `DbDataReader` — the base classes' own declared return types, not the caller's concrete provider type — which is *why* `command` and `reader` inside `PrintFirstName` never need to know or care that a `SqliteCommand`/`SqliteDataReader` is the real object underneath.
- `DbConnection asBaseType = new SqliteConnection(...)` — constructs a real, concrete `SqliteConnection`, but immediately stores it in a variable declared with the *base* type — legal because of the inheritance just proven, and exactly the shape real application code uses to depend on the shared contract instead of one provider's own class.

## CS Lens

This is the **Adapter**/shared-base-class shape of **polymorphism**: a family of genuinely different concrete implementations (one per real database engine) all honoring one common, inherited contract, so code written against the contract works unmodified against any of them. It's also a concrete instance of the **Dependency Inversion Principle** — application code depends on the abstraction (`DbConnection`/`DbCommand`/`DbDataReader`), not on any one concrete, low-level provider class — the same underlying idea as coding against an `interface` instead of a specific class, except here the shared contract is expressed as an abstract base class instead of an `interface`.

Also recognized in: JDBC's `Connection`/`Statement`/`ResultSet` interfaces in Java (the direct cross-language equivalent — every JDBC driver, for any database, implements those same three interfaces); Python's DB-API 2.0 (`PEP 249`), which standardizes `connect()`/`cursor()`/`execute()`/`fetchone()` across `sqlite3`, `psycopg2`, and other Python database libraries without a shared base *class* at all, purely by convention; any plugin architecture where a fixed "host" contract (a common set of methods a plugin must implement) lets genuinely different implementations be swapped behind it with no change to the code that calls them.

## SE Lens

Why does application code benefit from depending on `DbConnection` instead of directly on `SqliteConnection`, given that most real projects only ever use one database engine for their entire lifetime? Because "only ever use one" is a bet, not a guarantee — a small desktop tool's local SQLite file outgrowing itself into a shared, server-hosted database is a common, real trajectory, and the *cost* of preparing for that possibility is close to zero: writing a method's parameter as `DbConnection` instead of `SqliteConnection` costs nothing in the common case where the database never changes, and saves a genuinely large, error-prone, project-wide rewrite in the case where it does. The tradeoff isn't free in every direction, though: code written against the shared base types can only use members every provider actually supports — a provider-specific feature (a SQLite-only `PRAGMA`, a SQL-Server-only stored-procedure calling convention) isn't reachable through `DbCommand` alone, and reaching for it means either casting back down to the concrete provider type at that one call site, or accepting that the abstraction only covers the genuinely common ground between providers, not every one of their individual capabilities.

## Connection

This is the concrete mechanism underneath a data-access layer that claims to be "database-agnostic" — that claim is only actually true to the extent its own code depends on `DbConnection`/`DbCommand`/`DbDataReader` (or an even higher-level abstraction built on top of them, like an ORM) rather than one provider's concrete classes reaching into every corner of the codebase. An ORM (object-relational mapper) is typically built *on top of* exactly this shape — it still ultimately opens a `DbConnection` and runs commands through a `DbCommand` underneath its own, friendlier, object-based API.

## Try It Yourself

1. Write a second function, `int CountRows(DbConnection connection, string tableName)`, using only `DbConnection`/`DbCommand`/`DbDataReader` members, that returns how many rows a table has (`SELECT COUNT(*) FROM ...`). Confirm it works against the same `SqliteConnection` used above, passed in as `DbConnection`, with no cast anywhere in `CountRows`'s own body.
2. Change `PrintFirstName`'s parameter type from `DbConnection` back to the concrete `SqliteConnection`, and confirm it still compiles and runs identically — then explain, in your own words, exactly what real flexibility was lost by that change, even though nothing about this lab's own output changed at all.
3. Look up (via your installed SDK's own documentation, or IDE go-to-definition) one real member `DbCommand` declares that this file's own example never called — `Parameters`, `Transaction`, or `Prepare()` are good candidates — and state, in one sentence, why every real ADO.NET provider is required to support it too, simply by virtue of subclassing `DbCommand`.
