# Lesson 10: Loading Is the Other Half of Saving

*(`SELECT`, `SqliteDataReader`, and Mapping Rows to Objects)*

**User Story**
> As a user, I want all previously saved items loaded automatically.

**What you will build**
Lesson 9 ended honestly incomplete: items are really saved to
`pocketinventory.db`, but the on-screen list still starts empty every
time the app relaunches, because nothing has ever read those rows back
out. This lesson closes that gap — reopen the app, and every item you've
ever added is there, loaded from the real database, not from memory that
never survived the process ending. The transferable problem is naming
what "persistence" actually requires: a save path alone is only half a
feature. Nothing is really durable until there's a matching, equally
real load path — the same two-sided contract this project's own
`INSERT`/`SELECT` pair is about to make concrete.

**What you need to know first:** Lesson 9: `SqliteConnection`,
`SqliteCommand`, parameterized `INSERT`, and specifically the exact gap
this lesson closes — `EnsureDatabaseCreated()` runs on every launch, but
nothing populates `Items` from what's already saved. Lesson 7:
`ObservableCollection<InventoryItem>`, `Items.Add(...)`.

---

## Concept Unit: `SqliteDataReader` — Reading Rows Back, One at a Time

### The Problem

Lesson 9's `SqliteCommand` only ever ran `INSERT` and `CREATE TABLE` —
neither returns any data, which is exactly why both were run with
`.ExecuteNonQuery()`. Getting rows *back out* of a database needs a
different method entirely, and a different way of receiving the result:
not a single value, but a stream of rows to walk through one at a time.

### Introduce the Concept in Isolation

```bash
dotnet new console -o lab-reader
cd lab-reader
dotnet add package Microsoft.Data.Sqlite
```

Replace `Program.cs`:

```csharp
using Microsoft.Data.Sqlite;

using SqliteConnection connection = new SqliteConnection("Data Source=lab.db");
connection.Open();

using SqliteCommand createTable = connection.CreateCommand();
createTable.CommandText = "CREATE TABLE IF NOT EXISTS Fruits (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
createTable.ExecuteNonQuery();

using SqliteCommand insertFruit = connection.CreateCommand();
insertFruit.CommandText = "INSERT INTO Fruits (Name) VALUES ('Apple'), ('Pear'), ('Fig')";
insertFruit.ExecuteNonQuery();

using SqliteCommand selectFruits = connection.CreateCommand();
selectFruits.CommandText = "SELECT Id, Name FROM Fruits";

using SqliteDataReader reader = selectFruits.ExecuteReader();
while (reader.Read())
{
    int id = reader.GetInt32(0);
    string name = reader.GetString(1);
    Console.WriteLine($"Row {id}: {name}");
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Row 1: Apple
Row 2: Pear
Row 3: Fig
```

Run it a **second** time, without deleting `lab.db`: the `INSERT` adds
three *more* rows on top of the existing ones, and the output now shows
six rows, `Id` 1 through 6 — a real, visible reminder that nothing about
this lab guards against re-inserting the same data twice; Lesson 9's
project code never had this problem because it only ever inserted in
response to a real, one-time button click, not a script re-run.

*What this proves:* `.ExecuteReader()` — (first appearance) — runs a
query that returns rows, and hands back a `SqliteDataReader` rather than
a single value or nothing at all. `reader.Read()` — (first appearance)
— advances to the next available row and returns `true`, or `false` once
there are no more — this is the loop condition itself, and it must be
called *before* reading any column on the first row too; there is no
"current row" until the first `Read()` succeeds. `reader.GetInt32(0)` /
`reader.GetString(1)` — (first appearance) — read a specific column's
value from the *current* row, by zero-based position matching the
`SELECT` clause's own column order (`Id` first, so position `0`;
`Name` second, position `1`) — not by column name, and not automatically
type-converted: asking for `GetInt32` on a column that's actually text
would throw, which is why the method name itself commits to a type.

### Execution Trace

```
reader.Read() → true,  current row: Id=1, Name="Apple"
    GetInt32(0) → 1,  GetString(1) → "Apple"
    prints "Row 1: Apple"
reader.Read() → true,  current row: Id=2, Name="Pear"
    GetInt32(0) → 2,  GetString(1) → "Pear"
    prints "Row 2: Pear"
reader.Read() → true,  current row: Id=3, Name="Fig"
    GetInt32(0) → 3,  GetString(1) → "Fig"
    prints "Row 3: Fig"
reader.Read() → false, loop ends
```

### Discard the Throwaway Example

Delete the `lab-reader` folder, including `lab.db`. `SqliteDataReader`
itself is not discarded — it reads Pocket Inventory's real saved items
back for real, next.

### CS Lens

A `SqliteDataReader` is a real instance of the **iterator pattern** —
it exposes rows one at a time, on demand, rather than handing back every
row already loaded into memory at once. This is the identical
"don't eagerly materialize everything you don't need yet" idea this
project's own `List<T>` versus array tradeoff already touched in Lesson
6, now applied to database rows specifically: a table with a million
rows would still only ever hold one row's worth of data in memory at
any single moment while a `SqliteDataReader` walks it.

Also recognized in: Python's own generator functions and file
iteration (`for line in file:` never loads the whole file into memory
at once), Java's `Iterator` interface, and paginated REST API responses
fetched one page at a time rather than in one enormous response.

### SE Lens

Why does reading rows require this loop-based `Read()`/`Get...()` dance
instead of a single call that just hands back a ready-made `List<Fruit>`?
Because `Microsoft.Data.Sqlite` is a low-level ADO.NET library — it
has no idea what a "Fruit" even is, or what shape you want your data in;
it only knows how to hand back raw rows and raw column values, by
position, exactly as SQLite itself returns them. Building the *mapping*
from a raw row to a real, typed object is your project's own
responsibility — deliberately, per this project's raw-ADO.NET-before-any-
ORM approach — which is exactly the next unit's job.

---

## Concept Unit: Mapping a Row to an `InventoryItem`

### The Problem

The previous unit reads raw columns into raw local variables. Pocket
Inventory needs real `InventoryItem` objects, added to the real
`Items` collection, the moment the app starts — and, so far,
`InventoryItem` has never had anywhere to hold the database's own `Id`,
which the next several lessons (editing, deleting) will need to know
*which* row a given object actually corresponds to.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryItem.cs`; `InventoryPage.xaml.cs`.
- **Change type:** Add.
- **Location:** `InventoryItem`'s field list; `InventoryPage`'s
  constructor, after `EnsureDatabaseCreated()`.
- **Dependencies:** `SqliteDataReader`, previous unit; `EnsureDatabaseCreated`,
  Lesson 9.

### The New Code — Giving `InventoryItem` an `Id`

```csharp
public int Id { get; set; }
```

### The Updated Project

```csharp
namespace PocketInventory
{
    public class InventoryItem : INotifyPropertyChanged
    {
        public int Id { get; set; }                                        // ← new
        private string name = string.Empty;

        public string Name
        {
            get { return name; }
            set
            {
                name = value;
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Name)));
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
    }
}
```

`InventoryItem` gains a second property, deliberately a plain
auto-property rather than `Name`'s hand-written long form.

### Mechanical Walkthrough
- `public int Id { get; set; }` — reappearing (auto-property syntax,
  Lesson 6), new detail worth naming directly: unlike `Name`, `Id` never
  gets a hand-written `set` with a `PropertyChanged?.Invoke(...)` call.
- That's a deliberate, not lazy, choice — `Id` is set exactly once, when
  an item is loaded or first inserted, and is never bound to an editable
- `TextBox` the way `Name` is (Lesson 8's detail panel) — nothing in
  this project ever needs to *react* to `Id` changing, so the extra
  ceremony `Name` earned would be pure overhead here.

### The New Code — Loading Every Row on Startup

```csharp
private List<InventoryItem> LoadItemsFromDatabase()
{
    List<InventoryItem> loadedItems = new List<InventoryItem>();

    using SqliteConnection connection = new SqliteConnection(ConnectionString);
    connection.Open();
    using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "SELECT Id, Name FROM Items";

    using SqliteDataReader reader = command.ExecuteReader();
    while (reader.Read())
    {
        InventoryItem item = new InventoryItem
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1)
        };
        loadedItems.Add(item);
    }

    return loadedItems;
}
```

```csharp
public InventoryPage()
{
    InitializeComponent();
    DataContext = this;
    EnsureDatabaseCreated();

    foreach (InventoryItem item in LoadItemsFromDatabase())
    {
        Items.Add(item);
    }
}
```

### The Updated Project

```csharp
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Windows;
using System.Windows.Controls;

namespace PocketInventory
{
    public partial class InventoryPage : Page
    {
        private const string ConnectionString = "Data Source=pocketinventory.db";

        public ObservableCollection<InventoryItem> Items { get; } = new ObservableCollection<InventoryItem>();

        public InventoryPage()
        {
            InitializeComponent();
            DataContext = this;
            EnsureDatabaseCreated();

            foreach (InventoryItem item in LoadItemsFromDatabase())          // ← new
            {                                                                 // ← new
                Items.Add(item);                                              // ← new
            }                                                                 // ← new
        }

        private void EnsureDatabaseCreated()
        {
            using SqliteConnection connection = new SqliteConnection(ConnectionString);
            connection.Open();
            using SqliteCommand command = connection.CreateCommand();
            command.CommandText = "CREATE TABLE IF NOT EXISTS Items (Id INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT NOT NULL)";
            command.ExecuteNonQuery();
        }

        private List<InventoryItem> LoadItemsFromDatabase()                   // ← new
        {                                                                      // ← new
            List<InventoryItem> loadedItems = new List<InventoryItem>();       // ← new

            using SqliteConnection connection = new SqliteConnection(ConnectionString); // ← new
            connection.Open();                                                 // ← new
            using SqliteCommand command = connection.CreateCommand();          // ← new
            command.CommandText = "SELECT Id, Name FROM Items";                // ← new

            using SqliteDataReader reader = command.ExecuteReader();           // ← new
            while (reader.Read())                                             // ← new
            {                                                                  // ← new
                InventoryItem item = new InventoryItem                        // ← new
                {                                                              // ← new
                    Id = reader.GetInt32(0),                                  // ← new
                    Name = reader.GetString(1)                                // ← new
                };                                                            // ← new
                loadedItems.Add(item);                                        // ← new
            }                                                                  // ← new

            return loadedItems;                                              // ← new
        }                                                                      // ← new

        private void AddButton_Click(object sender, RoutedEventArgs e)
        {
            InventoryItem newItem = new InventoryItem { Name = NameInput.Text };
            Items.Add(newItem);
            SaveItemToDatabase(newItem);
            NameInput.Text = "";
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

        private void ItemListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            DetailPanel.DataContext = ItemListBox.SelectedItem;
        }
    }
}
```

The constructor now does four things in a fixed, meaningful order:
build the window's data structures, set `DataContext`, guarantee the
table exists, and — only once all three of those are true — load every
saved row and add each one to `Items`, the exact same collection
`AddButton_Click` and the `{Binding Items}` from Lesson 7 already know
how to work with.

### Mechanical Walkthrough
- `private List<InventoryItem> LoadItemsFromDatabase()` — (first
  appearance of a method with a real, non-`void` return type doing
  meaningful work in this project) returns a plain `List<InventoryItem>`
- — not the `ObservableCollection` `Items` itself — because this method
  has no idea it's being called from a constructor building up the
  page's real collection; keeping it a plain `List<T>` return keeps this
  method reusable and testable independent of any specific UI collection
  it might eventually feed.
- `command.CommandText = "SELECT Id, Name FROM Items"` — (first
- appearance of `SELECT` in real project code) — reappearing SQL syntax
  from the lab, naming exactly the two columns needed, in the exact
- order `GetInt32(0)`/`GetString(1)` below assumes — if this list and
  that order ever disagree, the mismatch fails silently or throws,
  which is exactly why the next exercise deliberately breaks this on
  purpose.
- `new InventoryItem { Id = reader.GetInt32(0), Name = reader.GetString(1) }`
  — reappearing (object-initializer syntax, Lesson 6), reading two
  columns instead of one, mapping each directly onto the matching
  property.
- `foreach (InventoryItem item in LoadItemsFromDatabase()) { Items.Add(item); }`
- — reappearing (`foreach`, already-basic; `Items.Add`, Lesson 7) — the
  bridge between the plain `List<InventoryItem>` this method returns and
  the real, bound `ObservableCollection<InventoryItem>` the UI actually
  watches; each `Add` here fires `CollectionChanged` exactly like
  Lesson 7's manual button-driven adds do, which is why the `ListBox`
  correctly shows every loaded item with zero additional binding code.

### Commands Needed

```bash
dotnet run
```

### Run It

On your Windows machine: add two or three items, exactly as before.
Fully close the application (not just navigate away — actually quit
the process) and relaunch it. Real, visible result: every item you
added is back in the list, immediately, on startup — the User Story
this lesson opened with, now genuinely true, verified by actually
closing and reopening the app, not just reading the code.

### Connection

Items now round-trip correctly: add one, it's saved (Lesson 9) and
shown (Lesson 7); relaunch, and it's loaded back (this unit) and shown
again, through the exact same binding. One real gap remains, addressed
in the closing section below: items added *this session* never had
their real database `Id` captured at all — only items loaded from a
fresh restart have a correct one.

---

## Closing

### Connect the Pieces

One concrete trace, start to finish: `InventoryPage`'s constructor runs
`EnsureDatabaseCreated()` (Lesson 9), then immediately calls
`LoadItemsFromDatabase()` (this lesson), which opens its own
`SqliteConnection`, runs `SELECT Id, Name FROM Items`, and walks every
returned row with a `SqliteDataReader.Read()` loop (this lesson's first
unit), constructing one real `InventoryItem` per row — now carrying a
real `Id`, not just a `Name` — and returning them as a plain
`List<InventoryItem>`. The constructor then adds each one to the real,
bound `Items` collection, triggering the exact same `{Binding Items}`
(Lesson 7) the `ListBox` has used since it was built. Add a new item
this session, and it's both shown immediately (Lesson 7's binding) and
saved for the *next* session (Lesson 9's `INSERT`) — the full loop this
lesson's opening promised.

### What Breaks Without This

Temporarily swap the column order in the `SELECT` clause without
changing the reading code: `command.CommandText = "SELECT Name, Id FROM Items";`,
leaving `Id = reader.GetInt32(0)` and `Name = reader.GetString(1)`
untouched. Run the app with existing saved items. Real, representative
failure: a `SqliteException` — column at position `0` is now `Name`
(text), and `GetInt32(0)` demands an integer — the exact "position, not
name, and not automatically converted" warning from this lesson's first
unit, now a real, triggered crash instead of an abstract caution.
Restore the original column order and it loads correctly again.

### Exercises

- Add a `LoadedAt` field to the throwaway `lab-reader` project (a third
  column, `TEXT`, storing `DateTime.Now.ToString()` at insert time),
  read it back with `reader.GetString(2)`, and print it — direct
  practice reading a third column before this project's own schema ever
  needs one.
- In `pocketinventory.db` (open it with a SQLite browser tool, the same
  one from Lesson 9), manually run
  `INSERT INTO Items (Name) VALUES ('Manually Added');` directly against
  the database, completely outside this application. Relaunch Pocket
  Inventory and confirm that row loads correctly too — concrete proof
  `LoadItemsFromDatabase` genuinely reads whatever is really in the
  table, regardless of what process wrote it.
- Rewrite `LoadItemsFromDatabase` to add `ORDER BY Name` to the
  `SELECT` clause, rerun, and confirm the loaded list appears
  alphabetically — a small, real preview of Epic 8's `ORDER BY` lessons,
  using a tool you already have.

### Definition of Done

- [ ] `InventoryItem` has a real `Id` property, populated correctly on
      load.
- [ ] Closing and relaunching the app shows every previously added item,
      verified by actually quitting the process, not just navigating
      away.
- [ ] You ran the `lab-reader` example yourself and can explain what
      `Read()` returning `false` actually signals.
- [ ] You swapped the `SELECT` column order on purpose, saw the real
      `SqliteException`, and restored the correct order.
- [ ] Committed with a message stating why: for example,
      `git commit -m "Load every saved item back into Items on startup via SqliteDataReader, closing the round-trip Lesson 9's save-only path left open"`.
