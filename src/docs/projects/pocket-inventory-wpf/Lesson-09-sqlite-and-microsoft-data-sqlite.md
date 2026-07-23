# Lesson 9: What Survives When the Process Ends

*(SQLite and `Microsoft.Data.Sqlite`)*

**User Story**
> As a user, I don't want my inventory to disappear when I close the app.

**What you will build**
Every item this project has ever held has lived in exactly one place:
`InventoryPage.Items`, an `ObservableCollection<InventoryItem>` sitting in
this application's own process memory. Close the app, and that memory is
reclaimed by the operating system — completely, unconditionally, the
instant the process ends. This lesson gives every added item a second,
independent home: a real `.db` file on disk, written the moment "Add" is
clicked. The visible result this lesson delivers is deliberately partial,
and honestly so: add an item, close the app, reopen it — the item is
still gone from the *screen* (that's Lesson 10's job) — but it is sitting,
correctly, permanently, inside a real SQLite database file you can open
with an outside tool and inspect for yourself.

**What you need to know first**
Lesson 6: `InventoryItem`, `Name`, and `AddButton_Click` — this lesson
adds a second action to that same handler, without removing the first.
Lesson 0: the .NET SDK, and specifically how a project's dependencies
(NuGet packages, the .NET equivalent of a Python `pip install`) get
added — this lesson's first real one.

---

## Concept Unit: Process Memory Versus Persistent Storage

### The Problem

Nothing about this has been proven yet, only assumed. Confirm the exact
failure, concretely, before fixing it.

### The concept, precisely

When a program runs, the operating system allocates it a private region
of RAM (random-access memory) — every `class` instance `new`ed, every
`ObservableCollection<T>` this project has built, lives inside that
region. RAM is fast, but it is also **volatile**: it requires continuous
power to hold its contents, and the moment a process exits — normally, by
crashing, or the machine losing power — the operating system reclaims
that entire region, unconditionally, for the next program that needs it.
Nothing about `Items` surviving that reclamation was ever a real
possibility; this project simply hasn't run into it as a visible problem
until now, because every previous lesson's testing happened within a
single run.

A `.db` file on disk is fundamentally different: disk storage is
**non-volatile** — it holds its contents with no power required, and
survives the process, the application, and even a full system restart. A
file's existence has nothing to do with any particular running program;
it exists independently, on the file system, until something explicitly
deletes it.

### CS Lens

This is the general distinction between **volatile and non-volatile
storage**, one of the most fundamental facts in all of computing — every
layer of a real system (a CPU's registers, RAM, an SSD, a network-attached
backup) trades speed for durability in some proportion, and every
application has to decide, deliberately, which layer any given piece of
data actually needs. This project's own sibling Android curriculum names
the identical distinction independently, at the same point in its own
sequence, for the identical reason.

### SE Lens

Why not just design around this — save the entire `Items` collection to
disk automatically, silently, on every single change, so the distinction
never has to be dealt with explicitly? Because "silently on every change"
hides a real design decision that deserves to be visible: *which*
storage mechanism, *how* structured, and *when*, are all choices with
real consequences (a single giant file rewritten on every keystroke would
be needlessly slow; a real database, written to incrementally, is not).
This lesson makes that decision explicit and deliberate, rather than
automatic and invisible.

### Connection

The next unit installs the actual tool this project uses to bridge that
gap.

---

## Concept Unit: `Microsoft.Data.Sqlite` and `SqliteConnection`

### The Problem

C# has no built-in way to talk to a SQLite database — that capability
comes from a **NuGet package**, .NET's package manager (the direct
equivalent of Python's `pip`), which this project has never needed until
now.

### Commands needed

```bash
dotnet add package Microsoft.Data.Sqlite
```

`dotnet add package` — (first appearance) — downloads a named package
from NuGet (the .NET package registry, the direct equivalent of Python's
PyPI) and adds it as a dependency to the current project's `.csproj`
file. `Microsoft.Data.Sqlite` is the package name — Microsoft's own,
official library for talking to SQLite databases from .NET. Run this
inside the `PocketInventory` project folder; real, representative
success output:

```text
info : Adding PackageReference for package 'Microsoft.Data.Sqlite' into project '...\PocketInventory.csproj'.
info : Restoring packages for ...\PocketInventory.csproj...
info : Package 'Microsoft.Data.Sqlite' is compatible with all the specified frameworks in project.
info : PackageReference for package 'Microsoft.Data.Sqlite' version '8.0.x' added to file '...\PocketInventory.csproj'.
```

Open `PocketInventory.csproj` and confirm a new line now exists, inside a
`<ItemGroup>`:

```xml
<PackageReference Include="Microsoft.Data.Sqlite" Version="8.0.x" />
```

This is the .NET equivalent of a line appearing in Python's
`requirements.txt` after a `pip install` — a permanent, version-pinned
record of exactly which external library this project depends on,
checked into source control so anyone else building this project gets
the identical version.

### Introduce the concept in isolation

```bash
dotnet new console -o lab-sqlite
cd lab-sqlite
dotnet add package Microsoft.Data.Sqlite
```

Replace `Program.cs`:

```csharp
using Microsoft.Data.Sqlite;

using SqliteConnection connection = new SqliteConnection("Data Source=lab.db");
connection.Open();
Console.WriteLine($"Connection state: {connection.State}");
```

Run it:

```bash
dotnet run
```

Real output:

```text
Connection state: Open
```

*What this proves:* `new SqliteConnection("Data Source=lab.db")` — (first
appearance) — creates a connection object targeting a file named `lab.db`
in the current folder; the string `"Data Source=lab.db"` — (first
appearance) — is a **connection string**, a small, semicolon-separated
configuration format nearly every database library uses to describe
where and how to connect (SQLite's is unusually simple — just a file
path — compared to a server-based database's connection string, which
would also need a host, port, and credentials). `.Open()` — (first
appearance) — actually establishes the connection; SQLite specifically
creates the file itself, empty, the first time you connect to a path that
doesn't exist yet — no separate "create the database" step required, a
real, SQLite-specific convenience most server-based databases don't
offer. `using SqliteConnection connection = ...` — (first appearance of
the `using` **statement**, distinct from the `using` **directive**
already used since Lesson 1's `using System;`) — guarantees `connection`
is properly closed and its resources released the moment it goes out of
scope, even if an error occurs in between — the same "resource lifetime
tied to a scope" idea, spelled differently in C# than in any tool you've
used from Python.

Confirm the file was really created:

```bash
ls lab.db
```

Real output — a real file now exists, zero bytes or a few, depending on
your SQLite version's exact empty-database format, on disk, independent
of whether `lab-sqlite`'s process is still running.

### Discard the throwaway example

Delete the `lab-sqlite` folder, including `lab.db`. `SqliteConnection`
and its connection-string pattern are not discarded — they connect the
real project to a real database next.

### CS Lens

A database connection is a real, held **resource** — analogous to an open
file handle or a network socket — that must be explicitly released, not
just left for the garbage collector to eventually notice. This is
precisely why `using` (the statement) exists: to guarantee that release
happens deterministically, at a known point, rather than "sometime,
eventually, whenever the runtime gets around to it," which is how
ordinary C# object memory is normally reclaimed.

### SE Lens

Why does `Microsoft.Data.Sqlite` require you to build and manage a raw
connection string, open it explicitly, and dispose of it explicitly,
instead of hiding all of that behind something friendlier? Because this
project's stated approach (see `CURRICULUM_NOTES.md`) is raw ADO.NET
before any ORM, deliberately: an ORM like Entity Framework would hide
every one of these steps behind method calls that look almost like
working with plain C# objects — genuinely convenient, and genuinely
hiding real mechanics (a real connection, opened and closed, against a
real file) worth understanding at least once before trusting a tool to
manage them invisibly.

### Connection

`InventoryPage` needs its own real connection to a real database file —
the next unit builds it, plus the table structure to actually store an
item in.

---

## Concept Unit: `CREATE TABLE` and `ExecuteNonQuery`

### The Problem

A SQLite database file, freshly created, is completely empty — it has no
concept of "inventory items" until this project explicitly describes
that structure to it, in SQL.

### Introduce the concept in isolation

Continuing inside a fresh throwaway project (recreate `lab-sqlite` if you
deleted it, or start a new one the same way):

```csharp
using Microsoft.Data.Sqlite;

using SqliteConnection connection = new SqliteConnection("Data Source=lab.db");
connection.Open();

using SqliteCommand createTable = connection.CreateCommand();
createTable.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
createTable.ExecuteNonQuery();

Console.WriteLine("Table created (or already existed).");
```

Run it:

```bash
dotnet run
```

Real output:

```text
Table created (or already existed).
```

Run it a **second** time, without deleting `lab.db` in between — the
identical output prints again, with no error.

*What this proves:* `connection.CreateCommand()` — (first appearance) —
produces a `SqliteCommand` tied to this specific open connection.
`.CommandText = "..."` — (first appearance) — is the actual SQL to run,
assigned as a plain string. `CREATE TABLE IF NOT EXISTS Items (...)` —
(first appearance of this specific SQL statement) — defines a table
named `Items`, only if one by that name doesn't already exist —
`IF NOT EXISTS` is exactly why running this program twice in a row
didn't error the second time: without it, the second run would fail,
because you cannot create a table that's already there. `Id INTEGER
PRIMARY KEY AUTOINCREMENT` — (first appearance) — a column named `Id`,
whole-number type, automatically assigned a unique, incrementing value
by SQLite itself on every new row — this project never has to invent
its own unique identifiers by hand. `Name TEXT NOT NULL` — (first
appearance) — a column named `Name`, text type, with a constraint —
`NOT NULL` — (first appearance) — that SQLite itself will enforce,
refusing any row that tries to leave it empty, a second, independent
layer of protection beneath whatever validation this project's own C#
code performs (Lesson 11 builds that C#-side validation properly; this
is the database's own, lower-level backstop). `.ExecuteNonQuery()` —
(first appearance) — actually runs the command; "NonQuery" specifically
means "this statement doesn't return rows" (contrast a `SELECT`, which
does — Lesson 10's subject).

### Discard the throwaway example

Delete the `lab-sqlite` folder again, including `lab.db`. The exact
`CREATE TABLE` statement above is not discarded — it becomes part of the
real project next, unchanged.

### CS Lens

A table's column definitions are a **schema** — a fixed, declared shape
every row must conform to, checked by the database itself, not just
trusted to whatever C# code happens to write. This is the identical
"static typing catches a category of error before it happens" idea from
Lesson 0, now enforced by the database rather than the compiler — even
code from a completely different program, written in a completely
different language, touching this same `.db` file, could never insert a
row missing a `Name`.

### SE Lens

Why put `CREATE TABLE IF NOT EXISTS` inside the *application's own*
startup code, rather than running it once, manually, and never again?
Because this project doesn't yet have a separate setup/installation step
— a real user's first launch needs the table to already exist by the
time they try to add their first item. Running an idempotent (safe to
repeat) `CREATE TABLE IF NOT EXISTS` on every launch means the database
is always correctly set up, with zero manual steps for whoever runs this
application next, at the cost of one harmless, wasted check every single
time the app starts.

### Connection

`InventoryPage` needs this exact table before it can save anything — the
final unit wires table creation and a real, working save into the actual
Add flow.

---

## Concept Unit: Parameterized `INSERT` and SQL Injection

### The Problem

Saving a real item means building an `INSERT` statement that includes
whatever the user actually typed into `NameInput`. Building that SQL by
directly gluing the user's text into a command string is a real,
serious, well-known security mistake — worth stopping and naming
precisely before writing a single line of the real feature.

### Introduce the concept in isolation

Continuing in a throwaway project, first see the actual attack, then the
fix. Add a second table and demonstrate the dangerous version:

```csharp
using SqliteCommand createTable = connection.CreateCommand();
createTable.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
createTable.ExecuteNonQuery();

string userTypedName = "Widget'); DROP TABLE Items; --";

using SqliteCommand dangerousInsert = connection.CreateCommand();
dangerousInsert.CommandText = $"INSERT INTO Items (Name) VALUES ('{userTypedName}')";
Console.WriteLine(dangerousInsert.CommandText);
dangerousInsert.ExecuteNonQuery();
```

Run it. Real output — the printed `CommandText`:

```text
INSERT INTO Items (Name) VALUES ('Widget'); DROP TABLE Items; --')
```

*What this proves, before you even run the rest:* string interpolation
(Lesson 1) glued the attacker-controlled text directly into the SQL
command, and that text contained a real, complete second statement —
`DROP TABLE Items` — plus `--`, SQL's own comment marker, silencing
whatever trailing text was left over. This is **SQL injection** — (first
appearance, full treatment) — a user-supplied input is interpreted as
*code* (a second SQL command) rather than *data* (a single text value)
purely because of how the command string was assembled. Running this
exact `dangerousInsert.ExecuteNonQuery()` really would drop the entire
`Items` table — a genuinely destructive, real attack, not a hypothetical
one, achievable by anyone who can type into a form field this careless.

Now the fix:

```csharp
using SqliteCommand safeInsert = connection.CreateCommand();
safeInsert.CommandText = "INSERT INTO Items (Name) VALUES (@name)";
safeInsert.Parameters.AddWithValue("@name", userTypedName);
safeInsert.ExecuteNonQuery();
Console.WriteLine("Inserted safely.");
```

Run it (against a fresh `lab.db`, since the previous block already
dropped the table — recreate it). Real output:

```text
Inserted safely.
```

*What this proves:* `@name` — (first appearance) — is a **parameter
placeholder**, not a spot for direct text substitution.
`.Parameters.AddWithValue("@name", userTypedName)` — (first appearance)
— tells the database driver, explicitly, "treat whatever is in
`userTypedName` as one single, literal text value for this placeholder —
never as SQL syntax, no matter what characters it contains." The exact
same malicious string from before, inserted this way, becomes a single
row whose `Name` is literally the entire attack string, quotes,
semicolons, and all — inert, harmless data, exactly the outcome a `Name`
column should produce for any input, however strange.

### Discard the throwaway example

Delete the `lab-sqlite` folder, including `lab.db`, for the final time.
Parameterized `INSERT` is not discarded — it's the only way this project
ever writes user-typed data into SQL, starting now.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryPage.xaml.cs`.
- **Change type:** Add.
- **Location:** `InventoryPage`'s constructor (table creation); a new
  method, called from `AddButton_Click`.
- **Dependencies:** `Microsoft.Data.Sqlite`, this lesson's second unit.

### The New Code

```csharp
private const string ConnectionString = "Data Source=pocketinventory.db";

public InventoryPage()
{
    InitializeComponent();
    DataContext = this;
    EnsureDatabaseCreated();
}

private void EnsureDatabaseCreated()
{
    using SqliteConnection connection = new SqliteConnection(ConnectionString);
    connection.Open();
    using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
    command.ExecuteNonQuery();
}

private void SaveItemToDatabase(InventoryItem item)
{
    using SqliteConnection connection = new SqliteConnection(ConnectionString);
    connection.Open();
    using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "INSERT INTO Items (Name) VALUES (@name)";
    command.Parameters.AddWithValue("@name", item.Name);
    command.ExecuteNonQuery();
}
```

### The Updated Project

```csharp
using Microsoft.Data.Sqlite;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page
    {
        private const string ConnectionString = "Data Source=pocketinventory.db";  // ← new

        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();

        public InventoryPage()
        {
            InitializeComponent();
            DataContext = this;
            EnsureDatabaseCreated();                                                // ← new
        }

        private void EnsureDatabaseCreated()                                        // ← new
        {                                                                            // ← new
            using SqliteConnection connection = new SqliteConnection(ConnectionString); // ← new
            connection.Open();                                                       // ← new
            using SqliteCommand command = connection.CreateCommand();                 // ← new
            command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)"; // ← new
            command.ExecuteNonQuery();                                                // ← new
        }                                                                             // ← new

        private void AddButton_Click(object sender, RoutedEventArgs e)
        {
            InventoryItem newItem = new InventoryItem { Name = NameInput.Text };
            Items.Add(newItem);
            SaveItemToDatabase(newItem);                                            // ← new
            NameInput.Text = "";
        }

        private void SaveItemToDatabase(InventoryItem item)                          // ← new
        {                                                                             // ← new
            using SqliteConnection connection = new SqliteConnection(ConnectionString); // ← new
            connection.Open();                                                        // ← new
            using SqliteCommand command = connection.CreateCommand();                  // ← new
            command.CommandText = "INSERT INTO Items (Name) VALUES (@name)";           // ← new
            command.Parameters.AddWithValue("@name", item.Name);                       // ← new
            command.ExecuteNonQuery();                                                 // ← new
        }                                                                              // ← new

        private void ItemListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            DetailPanel.DataContext = ItemListBox.SelectedItem;
        }
    }
}
```

`AddButton_Click` now does three things instead of two: build the item,
show it on screen (unchanged from Lesson 6/7), and — new — persist it to
the real database, every single time, immediately.

### Mechanical walkthrough

1. `private const string ConnectionString = "..."` — (first appearance
   of `const`) declares a value that is fixed permanently, at compile
   time — stronger than `readonly` (not introduced here) or a normal
   field: a `const` cannot be changed anywhere, ever, including inside
   this class's own constructor.
2. `EnsureDatabaseCreated()` — (hard concept reappearing, this lesson's
   third unit) called once, in the constructor, so the table exists
   before the very first Add attempt.
3. `SaveItemToDatabase(InventoryItem item)` — (hard concept reappearing,
   this lesson's fourth unit) the exact safe, parameterized pattern,
   applied to the real `Name` property instead of a throwaway variable.
4. `SaveItemToDatabase(newItem);` inside `AddButton_Click` — (first
   appearance of this specific call site) the one new line connecting
   this lesson's work to the existing flow — everything else in the
   method (Lesson 6/7's object construction, `Items.Add`, clearing
   `NameInput`) is untouched.

### Commands needed

```bash
dotnet run
```

### Run it

On your Windows machine: add two or three items, exactly as before —
nothing looks different on screen. Now fully close the application and
locate `pocketinventory.db` (it's created in the project's build output
folder — typically `bin/Debug/net9.0-windows/`). Open it with any SQLite
browser tool (search "DB Browser for SQLite," a free, standard tool for
exactly this) and confirm every item you added is really there, as real
rows in a real `Items` table — durable proof, independent of this
project's own code, that the data survived the process ending.

### Connection

The data is real and durable now. The screen, on the next launch, still
starts empty — `Items` is still a fresh, in-memory `ObservableCollection`
every time `InventoryPage`'s constructor runs. Lesson 10 closes that
exact gap.

---

## Closing

### Connect the pieces

One concrete trace: `InventoryPage`'s constructor calls
`EnsureDatabaseCreated()` (Concept Unit 3) once, guaranteeing the `Items`
table exists via an idempotent `CREATE TABLE IF NOT EXISTS`. Clicking Add
still builds an `InventoryItem` and adds it to the on-screen
`ObservableCollection`, exactly as Lesson 6/7 built — and now also calls
`SaveItemToDatabase` (Concept Unit 4), which opens a fresh
`SqliteConnection` (Concept Unit 2) and runs a parameterized `INSERT`,
never gluing `item.Name` directly into a SQL string, closing off the SQL
injection attack this lesson demonstrated concretely, with a real,
destructive payload, before showing the fix.

### What breaks without this

Temporarily change `SaveItemToDatabase`'s parameterized `INSERT` back to
direct string interpolation:
`command.CommandText = $"INSERT INTO Items (Name) VALUES ('{item.Name}')";`
(and delete the `.Parameters.AddWithValue` line). Run the app, and in the
Add form, type a name containing a single quote — `O'Brien's Tools`, for
instance — and click Add. Real, representative failure: the app throws a
`SqliteException` reporting a SQL syntax error, because the single quote
inside the typed name prematurely closed the SQL string literal, exactly
the same class of problem — untrusted text corrupting the structure of a
command — as this lesson's `DROP TABLE` demonstration, just surfacing
here as a crash on ordinary, honest input rather than a deliberate
attack. Restore the parameterized version and the same name saves
correctly, quote and all, treated purely as data. This is concrete proof
that parameterization isn't only a security fix — it's also the only
version of this code that's simply *correct* for realistic input.

### Exercises

- Open `pocketinventory.db` in a SQLite browser tool after adding several
  items, and manually run `SELECT * FROM Items;` inside the tool itself —
  confirm every row and its auto-incremented `Id` values.
- Temporarily remove `NOT NULL` from the `Name` column's definition (you
  will need to delete `pocketinventory.db` and let it regenerate, since
  `CREATE TABLE IF NOT EXISTS` will not alter an already-existing table's
  columns), then modify `AddButton_Click` to allow inserting with an
  empty `NameInput.Text`. Confirm SQLite accepts the blank row. Restore
  `NOT NULL` afterward and connect this to why Lesson 11's real,
  application-level validation still matters even with this database
  constraint in place — a database constraint and an application
  validation check aren't the same protection at the same layer.
- Delete `pocketinventory.db` entirely while the app is closed, then
  relaunch it — confirm `EnsureDatabaseCreated` correctly recreates it
  from nothing, with no error.

### Definition of done

- [ ] `Microsoft.Data.Sqlite` is a real dependency in
      `PocketInventory.csproj`.
- [ ] Adding an item writes a real row into `pocketinventory.db`,
      verified by opening the file in an external SQLite browser tool.
- [ ] You ran the real `DROP TABLE` SQL injection attack yourself, in the
      throwaway lab, and can explain in your own words why parameterized
      queries prevent it.
- [ ] You reproduced the single-quote crash from unparameterized input
      and restored the safe version.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Persist added items to a real SQLite database via parameterized INSERT, closing off SQL injection from the start"`.
